import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { tournamentStatus } from '../../../_lib/tournament.js';

/** POST /api/tournament/:id/join — přidej se do turnaje svého pásma. */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const t = await env.DB.prepare('SELECT * FROM tournaments WHERE id = ?').bind(params.id).first();
  if (!t) return fail('turnaj nenalezen', 404);
  if (me.band !== t.band) return fail('tenhle turnaj je pro pásmo ' + t.band + ', ty hraješ ' + me.band, 409);
  if (tournamentStatus(t) === 'hotovo') return fail('turnaj už skončil', 409);

  await env.DB.prepare(
    'INSERT OR IGNORE INTO tournament_players (tournament_id, user_id, joined_at) VALUES (?, ?, ?)')
    .bind(params.id, me.id, Date.now()).run();

  return json({ joined: true });
}
