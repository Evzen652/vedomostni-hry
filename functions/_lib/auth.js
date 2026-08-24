/**
 * Účty bez e-mailu: přezdívka + PIN (docs/online-rezim.md, sekce 5).
 *
 * Poznámka k síle PINu: čtyřmístný PIN je z podstaty slabý a žádné hashování to
 * nespraví. Skutečná ochrana je v tom, že za účtem není nic cenného — žádný e-mail,
 * platba ani osobní údaj — a že se přihlašování omezuje počtem pokusů.
 * Free plán Workers má strop na CPU, takže počet iterací PBKDF2 je kompromis:
 * dost na to, aby databáze nebyla čitelná jako plaintext, ne tolik, aby request spadl.
 */

const ITER = 15000;
const enc = new TextEncoder();

const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function hashPin(pin, saltB64) {
  const salt = saltB64 ? unb64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, key, 256);
  return b64(salt) + ':' + b64(bits);
}

export async function verifyPin(pin, stored) {
  const [saltB64] = String(stored).split(':');
  if (!saltB64) return false;
  const again = await hashPin(pin, saltB64);
  // porovnání v konstantním čase
  if (again.length !== stored.length) return false;
  let diff = 0;
  for (let i = 0; i < again.length; i++) diff |= again.charCodeAt(i) ^ stored.charCodeAt(i);
  return diff === 0;
}

// ---------------------------------------------------------------- session token
// Bezstavový podepsaný token: uid.expiry.hmac — nepotřebuje tabulku relací.

const secretKey = async secret =>
  crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' },
                          false, ['sign', 'verify']);

const urlB64 = s => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unUrlB64 = s => s.replace(/-/g, '+').replace(/_/g, '/');

export async function signToken(userId, secret, days = 90) {
  const exp = Date.now() + days * 86400000;
  const payload = userId + '.' + exp;
  const mac = await crypto.subtle.sign('HMAC', await secretKey(secret), enc.encode(payload));
  return payload + '.' + urlB64(b64(mac));
}

export async function verifyToken(token, secret) {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i < 0) return null;
  const payload = token.slice(0, i);
  const mac = token.slice(i + 1);
  const ok = await crypto.subtle.verify('HMAC', await secretKey(secret),
                                        unb64(unUrlB64(mac)), enc.encode(payload));
  if (!ok) return null;
  const dot = payload.lastIndexOf('.');
  const uid = payload.slice(0, dot);
  const exp = Number(payload.slice(dot + 1));
  if (!uid || !Number.isFinite(exp) || exp < Date.now()) return null;
  return uid;
}

/** Vytáhne přihlášeného hráče z hlavičky Authorization nebo cookie. */
export async function currentUser(request, env) {
  const auth = request.headers.get('authorization') || '';
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    const cookie = request.headers.get('cookie') || '';
    const m = cookie.match(/(?:^|;\s*)zk_session=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
  }
  const uid = await verifyToken(token, sessionSecret(env));
  if (!uid) return null;
  return env.DB.prepare('SELECT id, nick, avatar, band, is_bot FROM users WHERE id = ?')
    .bind(uid).first();
}

export function sessionSecret(env) {
  // V produkci se nastaví přes `wrangler secret put SESSION_SECRET`.
  // Lokálně stačí vývojová konstanta — tokeny mimo tenhle stroj stejně nikam nejdou.
  return env.SESSION_SECRET || 'dev-only-nepouzivat-v-produkci';
}

// ---------------------------------------------------------------- přezdívky
const ADJ = ['Rychlý', 'Statečný', 'Chytrý', 'Veselý', 'Tichý', 'Zvědavý', 'Bystrý',
             'Odvážný', 'Šikovný', 'Mrštný', 'Pozorný', 'Neúnavný'];
const ADJ_F = ['Rychlá', 'Statečná', 'Chytrá', 'Veselá', 'Tichá', 'Zvědavá', 'Bystrá',
               'Odvážná', 'Šikovná', 'Mrštná', 'Pozorná', 'Neúnavná'];
const ANIMAL_M = ['rys', 'sokol', 'jelen', 'bobr', 'ježek', 'čáp', 'los', 'vlk', 'krtek'];
const ANIMAL_F = ['veverka', 'liška', 'vydra', 'sova', 'srna', 'kuna', 'lasička'];

/** Generovaná přezdívka pro dětské pásmo — nula moderace, nula skrytých vzkazů. */
export function generateNick() {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const female = Math.random() < 0.5;
  const adj = female ? pick(ADJ_F) : pick(ADJ);
  const animal = female ? pick(ANIMAL_F) : pick(ANIMAL_M);
  return adj + ' ' + animal + ' ' + (10 + Math.floor(Math.random() * 90));
}

/** Přezdívka pro starší pásma: povolí jen neškodné znaky. */
export function validateNick(nick) {
  const n = String(nick || '').trim().replace(/\s+/g, ' ');
  if (n.length < 3) return { error: 'přezdívka musí mít aspoň 3 znaky' };
  if (n.length > 20) return { error: 'přezdívka smí mít nejvýš 20 znaků' };
  if (!/^[\p{L}\p{N} _-]+$/u.test(n)) return { error: 'přezdívka smí mít jen písmena, číslice, mezeru, _ a -' };
  return { nick: n };
}

/**
 * Kód pro přidání do přátel. Bez znaků, které se pletou při diktování
 * (0/O, 1/I/l), protože se předává mimo appku — nahlas nebo na papírku.
 */
export function friendCode() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const buf = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(buf, b => abc[b % abc.length]).join('');
}

export function validatePin(pin) {
  const p = String(pin || '');
  if (!/^\d{4,8}$/.test(p)) return { error: 'PIN musí být 4 až 8 číslic' };
  return { pin: p };
}
