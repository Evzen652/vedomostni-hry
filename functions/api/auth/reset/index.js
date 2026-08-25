import { json, fail } from '../../../_lib/game.js';
import { newResetToken } from '../../../_lib/auth.js';
import { sendPinReset } from '../../../_lib/mail.js';

const PLATNOST_MS = 30 * 60 * 1000;   // odkaz platí půl hodiny
const LIMIT_ZA_HODINU = 3;            // ať se z toho nedá udělat nástroj na otravování

/**
 * POST /api/auth/reset  { nick }
 *
 * Pošle odkaz na obnovu PINu, pokud má účet vyplněný e-mail.
 *
 * Odpověď je ZÁMĚRNĚ vždy stejná — i pro neexistující účet i pro účet bez e-mailu.
 * Jinak by šlo přes tenhle endpoint zjišťovat, které přezdívky existují a kdo má
 * e-mail. Hráč bez e-mailu se to dozví z textu odpovědi, ne z rozdílu chování.
 */
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const nick = String(body.nick || '').trim();
  if (!nick) return fail('chybí přezdívka');

  const odpoved = json({
    ok: true,
    zprava: 'Pokud účet existuje a má u sebe e-mail, odkaz je na cestě. ' +
            'Nedorazil-li nic, účet e-mail nemá a PIN obnovit nejde.',
  });

  const user = await env.DB.prepare(
    'SELECT id, nick, email, is_bot FROM users WHERE nick_lower = ?')
    .bind(nick.toLowerCase()).first();
  if (!user || user.is_bot || !user.email) return odpoved;

  const pred_hodinou = Date.now() - 3600000;
  const { pocet } = await env.DB.prepare(
    'SELECT COUNT(*) AS pocet FROM pin_resets WHERE user_id = ? AND created_at > ?')
    .bind(user.id, pred_hodinou).first();
  if (pocet >= LIMIT_ZA_HODINU) return odpoved;

  const { token, hash } = await newResetToken();
  await env.DB.prepare(
    'INSERT INTO pin_resets (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(hash, user.id, Date.now() + PLATNOST_MS, Date.now()).run();

  const url = new URL(request.url);
  await sendPinReset(env, {
    email: user.email,
    nick: user.nick,
    // Schválně /hra, ne /: kořen podává appku jen v nasazení (dist/index.html),
    // kdežto lokální `wrangler pages dev` servíruje kořen repa, kde index.html není.
    resetUrl: url.origin + '/hra?obnova=' + token,
  });

  return odpoved;
}
