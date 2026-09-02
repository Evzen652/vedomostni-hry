import { json, fail, newId, BANDS, checkRateLimit } from '../../_lib/game.js';
import { hashPin, signToken, sessionSecret, generateNick, validateNick, validatePin, friendCode, validateEmail } from '../../_lib/auth.js';

// Klouzavé okno na REGISTRACI, klíčované IP (2026-09-02) — v okamžiku volání ještě
// neexistuje účet, na který by šlo pověsit sloupec jako u friend_tries/game_tries.
// 8 za hodinu je nad tím, co reálně udělá rodina zakládající účty víc dětem
// (typicky 2–4), ale zastaví skriptované sybil farmění ratingu i denního žebříčku
// o dva řády. `ALLOW_DEV_SECRET` (stejná proměnná jako u sessionSecret() níž) limit
// v lokálním vývoji vypíná — `test:api` samo zakládá přes 20 účtů v jednom běhu.
const MAX_REG = 8;
const WINDOW_MS = 60 * 60 * 1000;

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
  if (!env.ALLOW_DEV_SECRET) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const pod = await checkRateLimit(
      () => env.DB.prepare('SELECT tries, tries_at FROM reg_attempts WHERE ip = ?').bind(ip).first(),
      (tries, at) => env.DB.prepare(
        `INSERT INTO reg_attempts (ip, tries, tries_at) VALUES (?, ?, ?)
         ON CONFLICT(ip) DO UPDATE SET tries = excluded.tries, tries_at = excluded.tries_at`)
        .bind(ip, tries, at).run(),
      MAX_REG, WINDOW_MS);
    if (!pod) return fail('příliš mnoho nových účtů z tohohle připojení, zkus to za hodinu', 429);
  }

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
