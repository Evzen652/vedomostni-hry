import { json, fail, newId } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { partaStav } from '../../../_lib/parta.js';

/**
 * POST /api/parta/:id/play — vrátí (a poprvé založí) hráčovu hru v turnaji.
 *
 * Každý hráč má JEDNU hru s kopií pevné sady (vzor denní pětky), takže druhý pokus
 * neexistuje. Hra vzniká až tady, ne při přidání: kdo se přidá a nikdy nezačne,
 * nenechá po sobě otevřenou hru.
 *
 * Souběh (dvojklik, dvě záložky): o tom, čí hra platí, rozhoduje
 * `UPDATE … WHERE game_id IS NULL` — kdo ho vyhraje, ten hru založí; ostatní dostanou tu jeho.
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env, { host: true });
  if (!me) return fail('nepřihlášen', 401);

  const p = await env.DB.prepare('SELECT * FROM parties WHERE id = ?').bind(params.id).first();
  if (!p) return fail('turnaj nenalezen', 404);
  const clen = await env.DB.prepare('SELECT game_id FROM party_players WHERE party_id = ? AND user_id = ?')
    .bind(p.id, me.id).first();
  if (!clen) return fail('v tomhle turnaji nejsi', 403);
  if (clen.game_id) return json({ game_id: clen.game_id });

  const stav = partaStav(p);
  if (stav === 'planovany') return fail('turnaj ještě nezačal', 409);
  if (stav === 'hotovo') return fail('turnaj už skončil', 410);

  const gid = newId();
  const zamek = await env.DB.prepare(
    'UPDATE party_players SET game_id = ? WHERE party_id = ? AND user_id = ? AND game_id IS NULL')
    .bind(gid, p.id, me.id).run();
  if (!zamek.meta.changes) {
    const r = await env.DB.prepare('SELECT game_id FROM party_players WHERE party_id = ? AND user_id = ?')
      .bind(p.id, me.id).first();
    return json({ game_id: r.game_id });
  }

  await env.DB.batch([
    env.DB.prepare(`INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at, party_id)
                    VALUES (?, 'parta', ?, ?, ?, ?, ?, ?)`)
      .bind(gid, p.band, p.limit_s, p.question_ids, p.orders, Date.now(), p.id),
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 0)').bind(gid, me.id),
  ]);
  return json({ game_id: gid }, 201);
}
