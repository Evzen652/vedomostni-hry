import { TIME_CONTROLS, shuffledOrder, json, fail, newId } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { pickQuestions, markSeen } from '../../../_lib/pool.js';
import { tournamentStatus } from '../../../_lib/tournament.js';

const STALE_MS = 2 * 60 * 1000;
const BOT_AFTER_MS = 8 * 1000;   // kratší než u ranked duelu (sekce 5. návrhu): tady jde o tempo, ne o vyladěné párování

/**
 * POST /api/tournament/:id/play — nové kolo uvnitř turnaje.
 * GET  /api/tournament/:id/play — dotaz, jestli už je soupeř.
 *
 * Zjednodušené párování oproti /api/match: kdo čeká první, hraje první. Rating
 * není potřeba zohledňovat — turnaj je jedno pásmo a jedna časová kontrola,
 * takže všichni čekající jsou navzájem rovnocenní soupeři.
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const t = await env.DB.prepare('SELECT * FROM tournaments WHERE id = ?').bind(params.id).first();
  if (!t) return fail('turnaj nenalezen', 404);
  if (tournamentStatus(t) !== 'bezi') return fail('turnaj zrovna neběží', 409);

  const joined = await env.DB.prepare(
    'SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?')
    .bind(params.id, me.id).first();
  if (!joined) return fail('nejdřív se do turnaje přidej', 403);

  await env.DB.prepare('DELETE FROM tournament_queue WHERE joined_at < ? AND game_id IS NULL')
    .bind(Date.now() - STALE_MS).run();

  const tc = TIME_CONTROLS[t.time_control];
  const candidates = (await env.DB.prepare(
    `SELECT user_id FROM tournament_queue
      WHERE tournament_id = ? AND game_id IS NULL AND user_id != ?
      ORDER BY joined_at ASC LIMIT 5`).bind(params.id, me.id).all()).results;

  for (const c of candidates) {
    const gameId = newId();
    // Soupeře si musím „zamknout" — stejný vzor jako /api/match.
    const claim = await env.DB.prepare(
      'UPDATE tournament_queue SET game_id = ? WHERE tournament_id = ? AND user_id = ? AND game_id IS NULL')
      .bind(gameId, params.id, c.user_id).run();
    if (!claim.meta.changes) continue;

    const ids = await pickQuestions(env, t.band, tc.count, [me.id, c.user_id]);
    if (ids.length < tc.count) {
      await env.DB.prepare(
        'UPDATE tournament_queue SET game_id = NULL WHERE tournament_id = ? AND user_id = ?')
        .bind(params.id, c.user_id).run();
      return fail('v pásmu ' + t.band + ' není dost otázek', 503);
    }

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at, rated, tournament_id)
         VALUES (?, 'turnaj', ?, ?, ?, ?, ?, 0, ?)`)
        .bind(gameId, t.band, tc.limit_s, JSON.stringify(ids),
              JSON.stringify(ids.map(() => shuffledOrder())), Date.now(), params.id),
      env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 0)')
        .bind(gameId, c.user_id),
      env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 1)')
        .bind(gameId, me.id),
      env.DB.prepare('DELETE FROM tournament_queue WHERE tournament_id = ? AND user_id = ?')
        .bind(params.id, me.id),
    ]);
    await markSeen(env, me.id, ids);
    await markSeen(env, c.user_id, ids);

    const opp = await env.DB.prepare('SELECT nick, avatar FROM users WHERE id = ?')
      .bind(c.user_id).first();
    return json({ matched: true, game_id: gameId, total: ids.length, limit_s: tc.limit_s, opponent: opp });
  }

  await env.DB.prepare(
    `INSERT INTO tournament_queue (tournament_id, user_id, joined_at, game_id) VALUES (?, ?, ?, NULL)
     ON CONFLICT(tournament_id, user_id) DO UPDATE SET joined_at = excluded.joined_at, game_id = NULL`)
    .bind(params.id, me.id, Date.now()).run();

  return json({ matched: false, waiting: true, bot_after_ms: BOT_AFTER_MS });
}

export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const row = await env.DB.prepare(
    'SELECT * FROM tournament_queue WHERE tournament_id = ? AND user_id = ?')
    .bind(params.id, me.id).first();
  if (!row) return json({ matched: false, waiting: false });

  if (row.game_id) {
    await env.DB.prepare('DELETE FROM tournament_queue WHERE tournament_id = ? AND user_id = ?')
      .bind(params.id, me.id).run();
    const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(row.game_id).first();
    const opp = await env.DB.prepare(
      `SELECT u.nick, u.avatar FROM game_players gp JOIN users u ON u.id = gp.user_id
        WHERE gp.game_id = ? AND gp.user_id != ?`).bind(row.game_id, me.id).first();
    return json({ matched: true, game_id: row.game_id, opponent: opp,
                  total: game ? JSON.parse(game.question_ids).length : null,
                  limit_s: game ? game.limit_s : null });
  }

  const waited = Date.now() - row.joined_at;
  return json({ matched: false, waiting: true, waited_ms: waited, offer_bot: waited >= BOT_AFTER_MS });
}
