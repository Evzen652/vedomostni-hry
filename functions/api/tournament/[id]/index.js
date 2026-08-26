import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { tournamentStatus, tournamentEndsAt } from '../../../_lib/tournament.js';

/** GET /api/tournament/:id — detail, stav a průběžné pořadí. */
export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const t = await env.DB.prepare('SELECT * FROM tournaments WHERE id = ?').bind(params.id).first();
  if (!t) return fail('turnaj nenalezen', 404);

  const standings = (await env.DB.prepare(
    `SELECT tp.user_id, tp.score, tp.games_played, u.nick, u.avatar
       FROM tournament_players tp JOIN users u ON u.id = tp.user_id
      WHERE tp.tournament_id = ?
      ORDER BY tp.score DESC, tp.games_played ASC LIMIT 100`)
    .bind(params.id).all()).results;

  const mine = standings.find(p => p.user_id === me.id);

  return json({
    id: t.id, name: t.name, band: t.band, time_control: t.time_control,
    starts_at: t.starts_at, ends_at: tournamentEndsAt(t), status: tournamentStatus(t),
    joined: !!mine,
    me: mine ? { score: mine.score, games_played: mine.games_played } : null,
    standings: standings.map((p, i) => ({
      rank: i + 1, nick: p.nick, avatar: p.avatar, score: p.score, games_played: p.games_played,
    })),
  });
}
