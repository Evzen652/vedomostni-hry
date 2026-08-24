import { json, fail } from '../_lib/game.js';
import { currentUser } from '../_lib/auth.js';

/**
 * GET  /api/friends            — seznam přátel
 * POST /api/friends  { code }  — přidej podle kódu
 *
 * Přátelství jde navázat JEN přes kód, ne vyhledáním přezdívky. Kód se předává
 * mimo appku, takže cizí člověk nemůže oslovit dítě jen proto, že ho zahlédl
 * v žebříčku (docs/online-rezim.md, sekce 5).
 */
export async function onRequestGet({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const rows = (await env.DB.prepare(
    `SELECT u.id, u.nick, u.avatar, u.band, f.created_at
       FROM friends f JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = ? ORDER BY u.nick`).bind(me.id).all()).results;

  const mine = await env.DB.prepare('SELECT friend_code FROM users WHERE id = ?')
    .bind(me.id).first();

  return json({ my_code: mine?.friend_code || null, friends: rows });
}

export async function onRequestPost({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const code = String(body.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) return fail('kód má šest znaků');

  const other = await env.DB
    .prepare('SELECT id, nick, avatar, band, is_bot FROM users WHERE friend_code = ?')
    .bind(code).first();
  if (!other || other.is_bot) return fail('takový kód nikomu nepatří', 404);
  if (other.id === me.id) return fail('to je tvůj vlastní kód');

  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)')
      .bind(me.id, other.id, now),
    env.DB.prepare('INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)')
      .bind(other.id, me.id, now),
  ]);

  return json({ added: { id: other.id, nick: other.nick, avatar: other.avatar, band: other.band } }, 201);
}
