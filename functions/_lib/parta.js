/**
 * Turnaj pro partu (2026-10-05). Zakladatel pozve kamarády odkazem, všichni hrají
 * STEJNOU sadu otázek online, každý kdy chce v okně `starts_at` – `ends_at`,
 * a na konci se porovná pořadí. Přání hráče: „parta lidí si udělá svůj turnaj… nebudou
 * hrát u jednoho tabletu, ale online. Ani nemusejí být přihlášení."
 *
 * Proč ne rozšíření arény (`tournaments`): aréna páruje hráče proti sobě po kolech,
 * což u party, která nehraje současně, nefunguje — nebylo by se s kým spárovat.
 * Tady je to vzor DENNÍ PĚTKY: jedna pevná sada, každý hráč vlastní hra s její kopií.
 *
 * Pozvaný bez profilu je HOST (`users.is_guest`) — viz migrations/2026-10-05-parta.sql
 * a `currentUser()` v auth.js, který ho bez `{ host: true }` nikam nepustí.
 */
import { shuffledOrder } from './game.js';
import { bezKonfliktu, REZERVA } from './pool.js';

export const PARTA_POCET = 10;          // otázek v turnaji
export const PARTA_LIMIT_S = 20;        // vteřin na otázku — parta si může dovolit klidnější tempo
export const PARTA_MAX_HRACU = 50;
export const PARTA_MIN_DELKA_MS = 10 * 60 * 1000;
export const PARTA_MAX_DELKA_MS = 14 * 24 * 60 * 60 * 1000;
export const PARTA_MAX_ODLOZENI_MS = 30 * 24 * 60 * 60 * 1000;
/** Kolik dní po konci se turnaj i s hosty smaže. Zásady (soukromi.html) to slibují. */
export const PARTA_UKLID_MS = 30 * 24 * 60 * 60 * 1000;
/** Kolik turnajů smí jeden profil založit za hodinu. */
export const PARTA_MAX_ZALOZENI = 10;
/** Kolik hostů smí vzniknout z jedné IP za hodinu (okno je REG_WINDOW_MS). */
export const PARTA_MAX_HOSTU = 30;

/** Stav se POČÍTÁ z času, nikde se neukládá — stejně jako u arény. */
export function partaStav(p, now = Date.now()) {
  if (now < p.starts_at) return 'planovany';
  if (now < p.ends_at) return 'bezi';
  return 'hotovo';
}

/**
 * Id je ZÁROVEŇ pozvánka: kdo ho zná, smí se přidat. Proto náhodné z kryptografického
 * zdroje, ne `newId()` (ten je z větší části čas a jen ~31 bitů náhody).
 * 12 znaků z 32 = 60 bitů. Bez písmen, která se pletou (0/o, 1/l/i).
 */
const ABECEDA = 'abcdefghjkmnpqrstuvwxyz23456789';
export function partaId() {
  const b = crypto.getRandomValues(new Uint8Array(12));
  let s = '';
  for (const x of b) s += ABECEDA[x % ABECEDA.length];
  return 'p' + s;
}

/** Jméno hráče v turnaji (host si ho píše sám). Stejná znaková sada jako přezdívky. */
export function validatePartaName(name) {
  const n = String(name || '').trim().replace(/\s+/g, ' ');
  if (n.length < 2) return { error: 'jméno musí mít aspoň 2 znaky' };
  if (n.length > 20) return { error: 'jméno smí mít nejvýš 20 znaků' };
  if (!/^[\p{L}\p{N} _-]+$/u.test(n)) return { error: 'jméno smí mít jen písmena, číslice, mezeru, _ a -' };
  return { name: n };
}

/** Pevná sada otázek pro celý turnaj — s rezervou kvůli otázkám, které si prozrazují odpověď. */
export async function vyberOtazky(env, band) {
  const kandidati = (await env.DB
    .prepare('SELECT id FROM questions WHERE band = ? ORDER BY RANDOM() LIMIT ?')
    .bind(band, PARTA_POCET + REZERVA).all()).results.map(r => r.id);
  const ids = bezKonfliktu(kandidati, PARTA_POCET);
  if (ids.length < PARTA_POCET) return null;
  return { ids, orders: ids.map(() => shuffledOrder()) };
}

/**
 * Smaže turnaje skončené před víc než PARTA_UKLID_MS — i s jejich hrami a hosty.
 * Veze se na `expireStaleGames` (/api/me), cron Pages Functions neumí.
 * Dávka je malá, ať jeden požadavek nezaplatí za celou historii.
 */
export async function uklidPart(env) {
  const stare = (await env.DB.prepare('SELECT id FROM parties WHERE ends_at < ? LIMIT 5')
    .bind(Date.now() - PARTA_UKLID_MS).all()).results;
  for (const { id } of stare) {
    const hoste = (await env.DB.prepare(
      `SELECT pp.user_id FROM party_players pp JOIN users u ON u.id = pp.user_id
        WHERE pp.party_id = ? AND u.is_guest = 1`).bind(id).all()).results.map(r => r.user_id);
    const hryVTurnaji = '(SELECT id FROM games WHERE party_id = ?)';
    const prikazy = [
      env.DB.prepare(`DELETE FROM game_answers WHERE game_id IN ${hryVTurnaji}`).bind(id),
      env.DB.prepare(`DELETE FROM q_served WHERE game_id IN ${hryVTurnaji}`).bind(id),
      env.DB.prepare(`DELETE FROM game_players WHERE game_id IN ${hryVTurnaji}`).bind(id),
      env.DB.prepare('DELETE FROM games WHERE party_id = ?').bind(id),
      env.DB.prepare('DELETE FROM party_players WHERE party_id = ?').bind(id),
      env.DB.prepare('DELETE FROM parties WHERE id = ?').bind(id),
    ];
    for (const uid of hoste) {
      prikazy.push(env.DB.prepare('DELETE FROM seen_questions WHERE user_id = ?').bind(uid));
      prikazy.push(env.DB.prepare('DELETE FROM users WHERE id = ? AND is_guest = 1').bind(uid));
    }
    await env.DB.batch(prikazy);
  }
  return stare.length;
}
