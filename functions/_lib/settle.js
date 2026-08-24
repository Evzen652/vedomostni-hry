import { glicko2 } from './glicko.js';

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

  await env.DB.prepare("UPDATE games SET status = 'done' WHERE id = ?").bind(gameId).run();
  if (players.length !== 2) return { status: 'done' };

  const [a, b] = players;
  const sA = a.score > b.score ? 1 : a.score < b.score ? 0 : 0.5;

  const users = await env.DB
    .prepare('SELECT id, is_bot FROM users WHERE id IN (?, ?)').bind(a.user_id, b.user_id).all();
  const isBot = Object.fromEntries(users.results.map(u => [u.id, !!u.is_bot]));
  const botInvolved = isBot[a.user_id] || isBot[b.user_id];

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
  if (hr.rd > 150) return;                        // hráč sám ještě není zkalibrovaný

  const sBot = botPlayer === a ? sA : 1 - sA;
  const expected = 1 / (1 + Math.pow(10, (hr.rating - bot.strength) / 400));
  const next = bot.strength + 12 * (sBot - expected);   // pomalý posun, ať to neskáče

  await env.DB.prepare('UPDATE bots SET strength = ? WHERE user_id = ?')
    .bind(Math.max(600, Math.min(2400, next)), botPlayer.user_id).run();
}
