import { json, fail, newId, REG_BANDS, REG_WINDOW_MS, limitIp } from '../../_lib/game.js';
import { hashPin, signToken, sessionSecret, validateNick, validatePin, friendCode, validateEmail, validateAvatar } from '../../_lib/auth.js';

// Klouzavé okno na REGISTRACI, klíčované IP (2026-09-02) — v okamžiku volání ještě
// neexistuje účet, na který by šlo pověsit sloupec jako u friend_tries/game_tries.
// 8 za hodinu je nad tím, co reálně udělá rodina zakládající účty víc dětem
// (typicky 2–4), ale zastaví skriptované sybil farmění ratingu i denního žebříčku
// o dva řády. `ALLOW_DEV_SECRET` (stejná proměnná jako u sessionSecret() níž) limit
// v lokálním vývoji vypíná — `test:api` samo zakládá přes 20 účtů v jednom běhu.
const MAX_REG = 8;

/**
 * POST /api/auth/register  { band, pin, nick, age13, email? }
 *
 * Profil je od 13 let (rozhodnutí hráče 2026-09-10). `age13: true` je potvrzení
 * z registrace („Je mi aspoň 13 let a souhlasím s podmínkami použití.“) — věk ověřit
 * nejde, ale bez výslovného potvrzení se profil nezaloží ani voláním API mimo appku.
 * Dětské pásmo proto registrace nenabízí vůbec (`REG_BANDS`), a s ním odpadly
 * i generované přezdívky, které se pro něj dělaly.
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
    const pod = await limitIp(env, ip, MAX_REG, REG_WINDOW_MS);
    if (!pod) return fail('příliš mnoho nových účtů z tohohle připojení, zkus to za hodinu', 429);
  }

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const band = body.band;
  if (band === 'deti') return fail('profil jde založit od 13 let — dětské pásmo je v sólu, párty a škole bez profilu');
  if (!REG_BANDS.includes(band)) return fail('neznámé pásmo');
  if (body.age13 !== true) return fail('potvrď, že ti je aspoň 13 let a souhlasíš s podmínkami použití');

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

  const check = validateNick(body.nick);
  if (check.error) return fail(check.error);
  const nick = check.nick;
  const clash = await env.DB.prepare('SELECT 1 FROM users WHERE nick_lower = ?')
    .bind(nick.toLowerCase()).first();
  if (clash) return fail('tuhle přezdívku už někdo má', 409);

  const id = 'u' + newId().slice(1);
  const pin_hash = await hashPin(pinCheck.pin);
  const avatar = validateAvatar(body.avatar);

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
