import { json, fail } from '../../_lib/game.js';
import { verifyPin, signToken, sessionSecret } from '../../_lib/auth.js';

const MAX_FAILS = 8;
const LOCK_MS = 10 * 60 * 1000;

/** POST /api/auth/login  { nick, pin } */
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const nick = String(body.nick || '').trim();
  const pin = String(body.pin || '');
  if (!nick || !pin) return fail('chybí přezdívka nebo PIN');

  const user = await env.DB.prepare('SELECT * FROM users WHERE nick_lower = ?')
    .bind(nick.toLowerCase()).first();

  // Stejná odpověď pro neexistující účet i špatný PIN, ať se nedá zjišťovat,
  // které přezdívky existují.
  if (!user || user.is_bot) return fail('přezdívka nebo PIN nesedí', 401);

  if (user.locked_until > Date.now()) {
    const min = Math.ceil((user.locked_until - Date.now()) / 60000);
    return fail('příliš mnoho pokusů, zkus to za ' + min + ' min', 429);
  }

  if (!(await verifyPin(pin, user.pin_hash))) {
    const fails = user.login_fails + 1;
    const lock = fails >= MAX_FAILS ? Date.now() + LOCK_MS : 0;
    await env.DB.prepare('UPDATE users SET login_fails = ?, locked_until = ? WHERE id = ?')
      .bind(lock ? 0 : fails, lock, user.id).run();
    return fail('přezdívka nebo PIN nesedí', 401);
  }

  if (user.login_fails) {
    await env.DB.prepare('UPDATE users SET login_fails = 0 WHERE id = ?').bind(user.id).run();
  }

  const token = await signToken(user.id, sessionSecret(env));
  return json({ id: user.id, nick: user.nick, avatar: user.avatar, band: user.band, token });
}
