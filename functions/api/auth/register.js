import { json, fail, newId, BANDS } from '../../_lib/game.js';
import { hashPin, signToken, sessionSecret, generateNick, validateNick, validatePin, friendCode, validateEmail } from '../../_lib/auth.js';

/**
 * POST /api/auth/register  { band, pin, nick?, email? }
 *
 * Dětské pásmo přezdívku nezadává — generuje se, aby do ní nešlo schovat vzkaz
 * a odpadla moderace (docs/online-rezim.md, sekce 5).
 *
 * E-mail je NEPOVINNÝ a slouží jedinému účelu: obnově zapomenutého PINu
 * (rozhodnutí 2026-08-25). Do registrace se přidal 2026-08-31 — doplňovat ho až
 * v Účtu znamená, že kdo PIN zapomene dřív, přijde o účet i s ratingem a historií.
 * Když chybí, účet vznikne bez něj a nic se nehlásí; když je vyplněný a nesmyslný,
 * registrace se odmítne, ať se překlep nezjistí až ve chvíli, kdy je pozdě.
 */
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const band = body.band;
  if (!BANDS.includes(band)) return fail('neznámé pásmo');

  const pinCheck = validatePin(body.pin);
  if (pinCheck.error) return fail(pinCheck.error);

  // Prázdný e-mail znamená, že ho hráč nechtěl — to je v pořádku a mlčí se o tom.
  // Vyplněný musí dávat smysl, jinak by se překlep projevil až při obnově PINu.
  let email = null;
  if (body.email != null && String(body.email).trim() !== '') {
    const e = validateEmail(body.email);
    if (e.error) return fail(e.error);
    email = e.email;
  }

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
    // `users.email` je schválně bez UNIQUE (viz schema.sql): rodič musí smět mít
    // stejnou adresu u víc dětí.
    env.DB.prepare(`INSERT INTO users (id, nick, nick_lower, avatar, pin_hash, band, created_at, friend_code, email)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, nick, nick.toLowerCase(), avatar, pin_hash, band, Date.now(), code, email),
    env.DB.prepare('INSERT INTO ratings (user_id, band) VALUES (?, ?)').bind(id, band),
  ]);

  const token = await signToken(id, sessionSecret(env));
  return json({ id, nick, avatar, band, token, friend_code: code }, 201);
}
