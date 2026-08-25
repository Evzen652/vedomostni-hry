import { json, fail } from '../../../_lib/game.js';
import { hashPin, validatePin, sha256hex, signToken, sessionSecret } from '../../../_lib/auth.js';

/**
 * POST /api/auth/reset/confirm  { token, pin }
 *
 * Nastaví nový PIN a rovnou přihlásí — kdo prokázal přístup k e-mailu, nemá důvod
 * hned nato psát čerstvě vymyšlený PIN znovu.
 *
 * Token je jednorázový: označí se za použitý ve stejném kroku, kterým se mění PIN.
 */
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const token = String(body.token || '');
  if (!token) return fail('chybí token');

  const v = validatePin(body.pin);
  if (v.error) return fail(v.error);

  const zaznam = await env.DB.prepare(
    'SELECT token_hash, user_id, expires_at, used_at FROM pin_resets WHERE token_hash = ?')
    .bind(await sha256hex(token)).first();

  // Stejná hláška pro neplatný, vypršelý i použitý odkaz — víc hráči neřekne
  // a útočníkovi to nedá vodítko, jestli token existoval.
  if (!zaznam || zaznam.used_at || zaznam.expires_at < Date.now()) {
    return fail('odkaz je neplatný nebo už vypršel, požádej o nový', 400);
  }

  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pin_hash = ?, login_fails = 0, locked_until = 0 WHERE id = ?')
      .bind(await hashPin(v.pin), zaznam.user_id),
    env.DB.prepare('UPDATE pin_resets SET used_at = ? WHERE token_hash = ?')
      .bind(Date.now(), zaznam.token_hash),
    // Ostatní nevyužité odkazy téhož účtu padají taky — po změně PINu nemají co platit.
    env.DB.prepare('UPDATE pin_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL')
      .bind(Date.now(), zaznam.user_id),
  ]);

  const user = await env.DB.prepare(
    'SELECT id, nick, avatar, band FROM users WHERE id = ?').bind(zaznam.user_id).first();

  return json({
    id: user.id, nick: user.nick, avatar: user.avatar, band: user.band,
    token: await signToken(user.id, sessionSecret(env)),
  });
}
