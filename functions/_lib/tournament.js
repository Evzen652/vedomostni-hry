/**
 * Turnaj (aréna) — docs/online-rezim.md, sekce 9.
 *
 * Stav se nikde neukládá, počítá se z časů: turnaj běží tak dlouho, jak sám
 * řekl při založení. Bez toho by potřeboval naplánovanou úlohu, co ho přepíná
 * ze scheduled na running na done — a to je přesně ta předčasná práce, které
 * se návrh vyhýbá, dokud tu není dost hráčů, aby se turnaj vůbec naplnil.
 */

export const MIN_DURATION_MIN = 5;
export const MAX_DURATION_MIN = 180;
export const MAX_START_DELAY_MIN = 24 * 60;

export const tournamentEndsAt = t => t.starts_at + t.duration_min * 60000;

export function tournamentStatus(t, now = Date.now()) {
  if (now < t.starts_at) return 'planovany';
  if (now < tournamentEndsAt(t)) return 'bezi';
  return 'hotovo';
}
