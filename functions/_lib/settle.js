import { glicko2 } from './glicko.js';
import { tournamentStatus } from './tournament.js';

/** Po jaké době se nedohraná hra uzavře sama. */
const EXPIRE_MS = 48 * 60 * 60 * 1000;
/** Kolik her uklidit najednou — ať jeden požadavek nezaplatí za celou historii. */
const EXPIRE_BATCH = 20;

/**
 * Uklidí hry, které nikdo nedohrál.
 *
 * Proč to musí být takhle: `settleIfDone` čeká, až mají VŠICHNI `finished_at`. Kdo
 * prohrával a zavřel prohlížeč, nechal hru v `open` NAVŽDY — soupeř nedostal výsledek,
 * nemohl dát odvetu (`rematch.js` chce `status='done'`) a rating se nikdy nezapsal.
 * Byl to zároveň nejlevnější způsob, jak si nikdy nepokazit rating.
 *
 * Cron tu nepomůže: Pages Functions `[triggers]` neumí (chtělo by to samostatný
 * Worker navíc, viz rozhodnutí 2026-08-24 o dotazování místo WebSocketu). Úklid se
 * proto veze na běžném provozu — volá se odtamtud, kam hráč stejně chodí.
 *
 * Nedohraným hráčům se dopíše `finished_at` a hra se vyrovná normálně, tedy podle
 * bodů. Kdo odešel po třetí otázce, má jich míň a prohraje — ale je to důsledek
 * skóre, ne trestu za odchod. Kontumaci schválně NEZAVÁDÍM: je to herní rozhodnutí,
 * ne oprava chyby, a u appky pro děti by trestala i spadlé připojení.
 */
export async function expireStaleGames(env) {
  const hranice = Date.now() - EXPIRE_MS;
  const stare = (await env.DB.prepare(
    `SELECT id FROM games WHERE status = 'open' AND created_at < ? LIMIT ?`)
    .bind(hranice, EXPIRE_BATCH).all()).results;
  if (!stare.length) return 0;

  const ted = Date.now();
  for (const { id } of stare) {
    await env.DB.prepare(
      `UPDATE game_players SET finished_at = ? WHERE game_id = ? AND finished_at IS NULL`)
      .bind(ted, id).run();
    const vysledek = await settleIfDone(env, id);
    // `null` znamená, že hra nemá dost hráčů (založený odkaz, ke kterému nikdo nepřišel).
    // Vyrovnávat není co, ale viset už taky nemá — zavřeme ji natvrdo.
    if (!vysledek) {
      await env.DB.prepare("UPDATE games SET status = 'done' WHERE id = ? AND status = 'open'")
        .bind(id).run();
    }
  }
  return stare.length;
}

/**
 * Uzavře hru, jakmile dohráli všichni účastníci, a promítne výsledek do ratingu.
 *
 * Body rozhodnou vítěze, do ratingu ale jde jen výhra / remíza / prohra — stejně
 * jako v šachách (docs/online-rezim.md, sekce 2).
 *
 * Hry proti botům jsou nehodnocené, jinak by šel rating farmit na slabých botech.
 * Místo toho se z výsledku kalibruje síla bota (sekce 8: uzavřený žebříček nemá
 * absolutní kotvu, takže bot se musí přizpůsobovat fondu, ne naopak).
 */
export async function settleIfDone(env, gameId) {
  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(gameId).first();
  if (!game || game.status === 'done') return null;

  const players = (await env.DB
    .prepare('SELECT * FROM game_players WHERE game_id = ? ORDER BY slot').bind(gameId).all()).results;

  // Sólo hra končí sama; souboj až když dohráli oba.
  const expect = game.mode === 'solo' || game.mode === 'daily' ? 1 : 2;
  if (players.length < expect || players.some(p => !p.finished_at)) return null;

  // Přepnutí na 'done' je ZÁROVEŇ zámek. Kontrola na řádku 15 je jen levná zkratka —
  // mezi ní a tímhle UPDATE se vejde druhý souběžný vstup (poslední odpověď hráče
  // × settleIfDone z /bot), a bez `AND status = 'open'` by prošly oba: dvojí zápis
  // do Glicka (games+1, wins+1 dvakrát) a dvojí připsání turnajových bodů.
  // `meta.changes === 0` znamená, že hru uzavřel někdo jiný a my nemáme co dělat.
  const zamek = await env.DB
    .prepare("UPDATE games SET status = 'done' WHERE id = ? AND status = 'open'")
    .bind(gameId).run();
  if (!zamek.meta.changes) return null;

  if (players.length !== 2) return { status: 'done' };

  const [a, b] = players;
  const sA = a.score > b.score ? 1 : a.score < b.score ? 0 : 0.5;

  const users = await env.DB
    .prepare('SELECT id, is_bot FROM users WHERE id IN (?, ?)').bind(a.user_id, b.user_id).all();
  const isBot = Object.fromEntries(users.results.map(u => [u.id, !!u.is_bot]));
  const botInvolved = isBot[a.user_id] || isBot[b.user_id];

  if (game.tournament_id) await creditTournament(env, game.tournament_id, a, b, isBot);

  if (!game.rated || botInvolved) {
    if (botInvolved) await calibrateBot(env, game.band, a, b, sA, isBot);
    return { status: 'done', rated: false };
  }

  const ra = await ratingRow(env, a.user_id, game.band);
  const rb = await ratingRow(env, b.user_id, game.band);

  const na = glicko2(ra, [{ rating: rb.rating, rd: rb.rd, s: sA }]);
  const nb = glicko2(rb, [{ rating: ra.rating, rd: ra.rd, s: 1 - sA }]);

  await env.DB.batch([
    writeRating(env, a.user_id, game.band, na, sA),
    writeRating(env, b.user_id, game.band, nb, 1 - sA),
  ]);

  return {
    status: 'done', rated: true,
    ratings: {
      [a.user_id]: { before: Math.round(ra.rating), after: Math.round(na.rating) },
      [b.user_id]: { before: Math.round(rb.rating), after: Math.round(nb.rating) },
    },
  };
}

/**
 * Body z kola turnaje jdou do žebříčku turnaje, i když kolo samo je nehodnocené
 * v Glicku. Bot žádný řádek v `tournament_players` nemá — počítají se jen lidé.
 */
async function creditTournament(env, tournamentId, a, b, isBot) {
  const humans = [a, b].filter(p => !isBot[p.user_id]);
  if (!humans.length) return;

  // Body se připisují jen dokud turnaj BĚŽÍ. Bez toho šlo minutu před koncem přes
  // /tournament/{id}/bot založit dvacet kol, počkat, až turnaj skončí a tabulka se
  // všem uzavře, a pak je v klidu hodinu po konci dohrát — konečné pořadí se změnilo
  // po tom, co ho všichni viděli jako konečné. Kolo dohrané po buzeru prostě nepočítá.
  const t = await env.DB.prepare('SELECT starts_at, duration_min FROM tournaments WHERE id = ?')
    .bind(tournamentId).first();
  if (!t || tournamentStatus(t) === 'hotovo') return;

  await env.DB.batch(humans.map(p =>
    env.DB.prepare(
      `UPDATE tournament_players SET score = score + ?, games_played = games_played + 1
        WHERE tournament_id = ? AND user_id = ?`)
      .bind(p.score, tournamentId, p.user_id)));
}

async function ratingRow(env, userId, band) {
  const r = await env.DB.prepare('SELECT * FROM ratings WHERE user_id = ? AND band = ?')
    .bind(userId, band).first();
  if (r) return r;
  await env.DB.prepare('INSERT INTO ratings (user_id, band) VALUES (?, ?)').bind(userId, band).run();
  return { user_id: userId, band, rating: 1500, rd: 350, sigma: 0.06, games: 0 };
}

function writeRating(env, userId, band, next, s) {
  return env.DB.prepare(
    `UPDATE ratings SET rating = ?, rd = ?, sigma = ?, games = games + 1,
            wins = wins + ?, draws = draws + ?, losses = losses + ?
      WHERE user_id = ? AND band = ?`)
    .bind(next.rating, next.rd, next.sigma,
          s === 1 ? 1 : 0, s === 0.5 ? 1 : 0, s === 0 ? 1 : 0, userId, band);
}

/**
 * Bot se kalibruje na fond, ne fond na bota. Když bot proti známě ratovanému
 * hráči vyhrává víc, než odpovídá jeho deklarované síle, síla se posune nahoru.
 */
async function calibrateBot(env, band, a, b, sA, isBot) {
  const botPlayer = isBot[a.user_id] ? a : b;
  const human = isBot[a.user_id] ? b : a;
  if (isBot[human.user_id]) return;               // bot proti botovi nic neříká

  const bot = await env.DB.prepare('SELECT * FROM bots WHERE user_id = ?')
    .bind(botPlayer.user_id).first();
  if (!bot) return;

  const hr = await ratingRow(env, human.user_id, band);

  // Váha podle toho, jak jistý je hráčův vlastní rating: úplně nový hráč (RD 350)
  // botem nehne vůbec, usazený (RD ~80) plnou silou.
  //
  // Původně tu byla tvrdá hranice `rd > 150 → nekalibrovat`. Test ukázal, že na ni
  // dva hráči, kteří hrají jen spolu, nedosáhnou ani po deseti hrách (skončili na 185) —
  // ani jeden totiž není jistým referenčním bodem pro toho druhého. Boti by se tedy
  // nekalibrovali právě na startu, kdy je to nejpotřebnější a všichni jsou noví.
  const confidence = Math.max(0, Math.min(1, (350 - hr.rd) / (350 - 80)));
  if (confidence <= 0) return;

  const sBot = botPlayer === a ? sA : 1 - sA;
  const expected = 1 / (1 + Math.pow(10, (hr.rating - bot.strength) / 400));
  const next = bot.strength + 12 * confidence * (sBot - expected);   // pomalý posun, ať to neskáče

  await env.DB.prepare('UPDATE bots SET strength = ? WHERE user_id = ?')
    .bind(Math.max(600, Math.min(2400, next)), botPlayer.user_id).run();
}
