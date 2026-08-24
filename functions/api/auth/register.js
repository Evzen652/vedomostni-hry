import { json, fail, newId, BANDS } from '../../_lib/game.js';
import { hashPin, signToken, sessionSecret, generateNick, validateNick, validatePin, friendCode } from '../../_lib/auth.js';

/**
 * POST /api/auth/register  { band, pin, nick? }
 *
 * Bez e-mailu. Dětské pásmo přezdívku nezadává — generuje se, aby do ní nešlo
 * schovat vzkaz a odpadla moderace (docs/online-rezim.md, sekce 5).
 */
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const band = body.band;
  if (!BANDS.includes(band)) return fail('neznámé pásmo');

  const pinCheck = validatePin(body.pin);
  if (pinCheck.error) return fail(pinCheck.error);

  let nick;
  if (band === 'deti') {
    nick = generateNick();
    for (let i = 0; i < 8; i++) {
      const clash = await env.DB.prepare('SELECT 1 FROM users WHERE nick_lower = ?')
        .bind(nick.toLowerCase()).first();
      if (!clash) break;
      nick = generateNick();
    }
  } else {
    const check = validateNick(body.nick);
    if (check.error) return fail(check.error);
    nick = check.nick;
    const clash = await env.DB.prepare('SELECT 1 FROM users WHERE nick_lower = ?')
      .bind(nick.toLowerCase()).first();
    if (clash) return fail('tuhle přezdívku už někdo má', 409);
  }

  const id = 'u' + newId().slice(1);
  const pin_hash = await hashPin(pinCheck.pin);
  const avatar = String(body.avatar || '1');

  const code = friendCode();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO users (id, nick, nick_lower, avatar, pin_hash, band, created_at, friend_code)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, nick, nick.toLowerCase(), avatar, pin_hash, band, Date.now(), code),
    env.DB.prepare('INSERT INTO ratings (user_id, band) VALUES (?, ?)').bind(id, band),
  ]);

  const token = await signToken(id, sessionSecret(env));
  return json({ id, nick, avatar, band, token, friend_code: code }, 201);
}
