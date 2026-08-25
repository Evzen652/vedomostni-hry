import { json, fail } from '../_lib/game.js';
import { currentUser } from '../_lib/auth.js';

/** GET /api/me — profil, ratingy za pásma, posledních 20 her. */
export async function onRequestGet({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const ratings = await env.DB
    .prepare('SELECT band, rating, rd, games, wins, draws, losses FROM ratings WHERE user_id = ?')
    .bind(me.id).all();

  const history = await env.DB.prepare(
    `SELECT g.id, g.mode, g.band, g.status, g.created_at, gp.score, gp.answered
       FROM game_players gp JOIN games g ON g.id = gp.game_id
      WHERE gp.user_id = ? ORDER BY g.created_at DESC LIMIT 20`).bind(me.id).all();

  const seen = await env.DB
    .prepare('SELECT COUNT(*) n FROM seen_questions WHERE user_id = ?').bind(me.id).first();

  return json({
    id: me.id, nick: me.nick, avatar: me.avatar, band: me.band,
    email: maskEmail(me.email),
    ratings: ratings.results.map(r => ({ ...r, rating: Math.round(r.rating) })),
    seen_questions: seen.n,
    history: history.results,
  });
}

/** ev***@gmail.com — hráči stačí poznat, kterou adresu tam má, ne ji celou číst. */
function maskEmail(email) {
  if (!email) return null;
  const [jmeno, domena] = String(email).split('@');
  const viditelne = jmeno.slice(0, 2);
  return viditelne + '*'.repeat(Math.max(1, jmeno.length - 2)) + '@' + domena;
}
