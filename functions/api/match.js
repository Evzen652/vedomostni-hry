import { BANDS, TIME_CONTROLS, TC_NAMES, shuffledOrder, json, fail, newId, limitUctu } from '../_lib/game.js';
import { currentUser } from '../_lib/auth.js';
import { pickQuestions, markSeen } from '../_lib/pool.js';

const STALE_MS = 2 * 60 * 1000;      // opuštěné položky ve frontě
// Stejné okno i strop jako u ostatních cest zakládajících hru (game/index.js) — je to
// táž věc, jen jinými dveřmi, takže sdílí i počítadlo `game_tries`.
const MAX_GAMES = 30;
const WINDOW_MS = 60 * 60 * 1000;
// Po 4 s klient nasadí soupeře AUTOMATICKY (offer_bot). Řídká základna (~19 účtů) znamená,
// že dva lidé se ve stejném okně skoro nepotkají, takže dlouhé čekání je jen divadlo —
// reálný člověk se stihne spárovat v těch pár vteřinách (matched má přednost). Kdyby
// základna narostla, tady se okno prodlouží. (2026-09-04)
const BOT_AFTER_MS = 4 * 1000;

/** Okno pro párování se rozšiřuje s čekáním: začíná na ±100 a roste o 100 za sekundu. */
const window = waitedMs => 100 + Math.floor(waitedMs / 1000) * 100;

/**
 * Hráč má ve frontě řádek s přiřazenou hrou (game_id) — spárovalo se, ale GET to ještě
 * nestihl přečíst. Smaž řádek a vrať tu hru ve stejném tvaru, jaký vrací GET při match.
 * Bez tohohle šlo o hru přijít: DELETE hlásil `left:true`, i když se nic nesmazalo,
 * a POST („Hrát teď" znovu) přepsal game_id na NULL — spárovaná hra pak visela do
 * expirace a připsala se jako prohra za partii, kterou hráč nikdy neviděl.
 */
async function matchedResponse(env, meId, gameId) {
  // Hru načti DŘÍV, než smažeš řádek fronty. Ten, kdo páruje, si soupeře zamkne
  // (`UPDATE queue SET game_id`) o kus dřív, než hru založí — mezi tím je okno, ve
  // kterém `game_id` už svítí, ale `games` řádek ještě není. Kdyby se fronta smazala
  // teď, čekající hráč by dostal `matched` na neexistující hru, spadl na 404 do lobby
  // a hra by mu po 48 h naskočila jako HODNOCENÁ PROHRA za partii, kterou nikdy neviděl.
  // Necháme ho tedy ve frontě a řekneme „ještě čekej" — pollne za 2 s znovu.
  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(gameId).first();
  if (!game) return json({ matched: false, waiting: true });

  await env.DB.prepare('DELETE FROM queue WHERE user_id = ?').bind(meId).run();
  const opp = await env.DB.prepare(
    `SELECT u.nick, u.avatar FROM game_players gp JOIN users u ON u.id = gp.user_id
      WHERE gp.game_id = ? AND gp.user_id != ?`).bind(gameId, meId).first();
  return json({ matched: true, game_id: gameId, opponent: opp,
                total: JSON.parse(game.question_ids).length,
                limit_s: game.limit_s });
}

/**
 * POST /api/match  { time_control? }  — postav se do fronty na živý duel.
 * GET  /api/match                     — dotaz, jestli už je soupeř.
 * DELETE /api/match                   — odejdi z fronty.
 *
 * Tady na rozdíl od souboje na odkaz známe při párování OBA hráče, takže otázky
 * jdou losovat z pravého průniku neviděných (docs/online-rezim.md, sekce 4).
 */
export async function onRequestPost({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body = {};
  try { body = await request.json(); } catch (e) { /* výchozí */ }

  const band = me.band;
  const tcName = body.time_control || 'blesk';
  if (!TC_NAMES.includes(tcName)) return fail('neznámá časová kontrola: ' + tcName);
  const tc = TIME_CONTROLS[tcName];
  if (!BANDS.includes(band)) return fail('neznámé pásmo');

  // Souběh: mezitím, co jsem klikl „Hrát teď" znovu, mě někdo spároval. Nepřepisuj to
  // na NULL (níž v upsertu) — vrať tu hru, ať se o ni hráč nepřipraví.
  const spárován = await env.DB.prepare('SELECT game_id FROM queue WHERE user_id = ?')
    .bind(me.id).first();
  if (spárován && spárován.game_id) return matchedResponse(env, me.id, spárován.game_id);

  await env.DB.prepare('DELETE FROM queue WHERE joined_at < ? AND game_id IS NULL')
    .bind(Date.now() - STALE_MS).run();

  const mine = await env.DB.prepare('SELECT rating FROM ratings WHERE user_id = ? AND band = ?')
    .bind(me.id, band).first();
  const myRating = mine ? mine.rating : 1500;

  // Nejbližší čekající v ratingu, jehož okno už mě pokrývá.
  const candidates = (await env.DB.prepare(
    `SELECT * FROM queue
      WHERE band = ? AND time_control = ? AND game_id IS NULL AND user_id != ?
      ORDER BY ABS(rating - ?) LIMIT 5`)
    .bind(band, tcName, me.id, myRating).all()).results;

  const now = Date.now();
  for (const c of candidates) {
    const reach = Math.max(window(now - c.joined_at), 100);
    if (Math.abs(c.rating - myRating) > reach) continue;

    // Soupeře si musím „zamknout" — jinak by ho mohl současně chytit někdo další.
    const gameId = newId();
    const claim = await env.DB.prepare(
      'UPDATE queue SET game_id = ? WHERE user_id = ? AND game_id IS NULL')
      .bind(gameId, c.user_id).run();
    if (!claim.meta.changes) continue;         // někdo byl rychlejší, zkus dalšího

    // Limit na ZALOŽENÍ hry. Párování bylo pátá cesta, která vyrábí `games`, a jako
    // jediná ho neměla — dvěma účty ve smyčce (A se zařadí, B ho spáruje) šlo vyrobit
    // neomezeně her, hráčů a řádků `seen_questions`. Táž díra, jaká se 2026-09-03
    // zavírala u turnajového bota.
    // Počítá se AŽ TADY, ne na začátku handleru: samotné zařazení do fronty žádnou hru
    // nezaloží, takže opakované „hledám → ruším → hledám" nesmí ukusovat z limitu.
    // Když limit nepustí, claim se musí vrátit, jinak soupeř uvízne ve frontě s hrou,
    // která nevznikne.
    const pod = await limitUctu(env, me.id, 'game_tries', MAX_GAMES, WINDOW_MS);
    if (!pod) {
      await env.DB.prepare('UPDATE queue SET game_id = NULL WHERE user_id = ?').bind(c.user_id).run();
      return fail('příliš mnoho založených her, zkus to za chvíli', 429);
    }

    const ids = await pickQuestions(env, band, tc.count, [me.id, c.user_id]);
    if (ids.length < tc.count) {
      await env.DB.prepare('UPDATE queue SET game_id = NULL WHERE user_id = ?').bind(c.user_id).run();
      return fail('v pásmu ' + band + ' není dost otázek', 503);
    }

    await env.DB.batch([
      env.DB.prepare(`INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at, rated)
                      VALUES (?, 'duel', ?, ?, ?, ?, ?, 1)`)
        .bind(gameId, band, tc.limit_s, JSON.stringify(ids),
              JSON.stringify(ids.map(() => shuffledOrder())), Date.now()),
      env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 0)')
        .bind(gameId, c.user_id),
      env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 1)')
        .bind(gameId, me.id),
      env.DB.prepare('DELETE FROM queue WHERE user_id = ?').bind(me.id),
    ]);
    await markSeen(env, me.id, ids);
    await markSeen(env, c.user_id, ids);

    const opp = await env.DB.prepare('SELECT nick, avatar FROM users WHERE id = ?')
      .bind(c.user_id).first();
    return json({ matched: true, game_id: gameId, total: ids.length, limit_s: tc.limit_s,
                  opponent: opp });
  }

  await env.DB.prepare(
    `INSERT INTO queue (user_id, band, time_control, rating, joined_at, game_id)
     VALUES (?, ?, ?, ?, ?, NULL)
     ON CONFLICT(user_id) DO UPDATE SET band = excluded.band,
       time_control = excluded.time_control, rating = excluded.rating,
       joined_at = excluded.joined_at, game_id = NULL`)
    .bind(me.id, band, tcName, myRating, now).run();

  return json({ matched: false, waiting: true, bot_after_ms: BOT_AFTER_MS });
}

export async function onRequestGet({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const row = await env.DB.prepare('SELECT * FROM queue WHERE user_id = ?').bind(me.id).first();
  if (!row) return json({ matched: false, waiting: false });

  if (row.game_id) return matchedResponse(env, me.id, row.game_id);

  const waited = Date.now() - row.joined_at;
  return json({ matched: false, waiting: true, waited_ms: waited,
                offer_bot: waited >= BOT_AFTER_MS });
}

export async function onRequestDelete({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const del = await env.DB.prepare('DELETE FROM queue WHERE user_id = ? AND game_id IS NULL')
    .bind(me.id).run();
  if (del.meta.changes) return json({ left: true });

  // Nic se nesmazalo. Buď jsem ve frontě vůbec nebyl (v pořádku), nebo mě mezitím někdo
  // spároval a řádek nese game_id. Dřív se v obou případech vracelo `left:true`, takže
  // hráč ve druhém případě odešel do lobby a o hru přišel. Rozliš to.
  const row = await env.DB.prepare('SELECT game_id FROM queue WHERE user_id = ?')
    .bind(me.id).first();
  if (row && row.game_id) return matchedResponse(env, me.id, row.game_id);
  return json({ left: true });
}
