import { BANDS, TIME_CONTROLS, shuffledOrder, json, fail, newId } from '../_lib/game.js';
import { currentUser } from '../_lib/auth.js';
import { pickQuestions, markSeen } from '../_lib/pool.js';

const STALE_MS = 2 * 60 * 1000;      // opuštěné položky ve frontě
const BOT_AFTER_MS = 15 * 1000;      // po 15 s nabídneme bota, ať nikdo nekouká do prázdna

/** Okno pro párování se rozšiřuje s čekáním: začíná na ±100 a roste o 100 za sekundu. */
const window = waitedMs => 100 + Math.floor(waitedMs / 1000) * 100;

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
  const tc = TIME_CONTROLS[tcName];
  if (!tc) return fail('neznámá časová kontrola: ' + tcName);
  if (!BANDS.includes(band)) return fail('neznámé pásmo');

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

  if (row.game_id) {
    await env.DB.prepare('DELETE FROM queue WHERE user_id = ?').bind(me.id).run();
    const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(row.game_id).first();
    const opp = await env.DB.prepare(
      `SELECT u.nick, u.avatar FROM game_players gp JOIN users u ON u.id = gp.user_id
        WHERE gp.game_id = ? AND gp.user_id != ?`).bind(row.game_id, me.id).first();
    return json({ matched: true, game_id: row.game_id, opponent: opp,
                  total: game ? JSON.parse(game.question_ids).length : null,
                  limit_s: game ? game.limit_s : null });
  }

  const waited = Date.now() - row.joined_at;
  return json({ matched: false, waiting: true, waited_ms: waited,
                offer_bot: waited >= BOT_AFTER_MS });
}

export async function onRequestDelete({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);
  await env.DB.prepare('DELETE FROM queue WHERE user_id = ? AND game_id IS NULL')
    .bind(me.id).run();
  return json({ left: true });
}
