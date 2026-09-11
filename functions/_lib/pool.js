/**
 * Výběr otázek pro hru (docs/online-rezim.md, sekce 4).
 *
 * V sólu stačí preferovat neviděné. V duelu je to tvrdší: pokud jeden hráč otázku
 * už viděl a druhý ne, zápas není fér. Pořadí zdrojů je proto:
 *
 *   1. neviděné ANI JEDNÍM   — férové i čerstvé, ideál
 *   2. viděné OBĚMA          — férové, jen ne čerstvé (výhodu mají oba stejně)
 *   3. viděné právě jedním   — nefér, proto se doplňuje SYMETRICKY: stejný počet
 *                              otázek zvýhodňujících prvního i druhého
 */

import { KONFLIKTY } from './konflikty.js';

const rows = r => (r && r.results ? r.results.map(x => x.id) : []);
const marks = a => a.map(() => '?').join(',');

/**
 * Omezení na část fondu. `server` = otázky, které se nekopírují na web (jejich správná
 * odpověď nikde venku není), `verejne` = zbytek, se kterým hraje i offline appka.
 * Prefix mezerou, ať se dá vlepit doprostřed WHERE.
 */
const cast = (rezim, sloupec) => rezim === 'server' ? ` AND ${sloupec}online_only = 1`
                               : rezim === 'verejne' ? ` AND ${sloupec}online_only = 0` : '';

/** Neviděné nikým ze seznamu. */
async function unseenByAll(env, band, userIds, n, rezim) {
  if (!userIds.length) {
    return rows(await env.DB
      .prepare(`SELECT id FROM questions WHERE band = ?${cast(rezim, '')} ORDER BY RANDOM() LIMIT ?`)
      .bind(band, n).all());
  }
  return rows(await env.DB.prepare(
    `SELECT id FROM questions
      WHERE band = ?${cast(rezim, '')}
        AND id NOT IN (SELECT question_id FROM seen_questions WHERE user_id IN (${marks(userIds)}))
      ORDER BY RANDOM() LIMIT ?`).bind(band, ...userIds, n).all());
}

/** Viděné každým ze seznamu (tj. průnik viděných). */
async function seenByAll(env, band, userIds, n, exclude, rezim) {
  const ex = exclude.length ? ` AND q.id NOT IN (${marks(exclude)})` : '';
  return rows(await env.DB.prepare(
    `SELECT q.id FROM questions q
       JOIN seen_questions s ON s.question_id = q.id
      WHERE q.band = ?${cast(rezim, 'q.')} AND s.user_id IN (${marks(userIds)})${ex}
      GROUP BY q.id HAVING COUNT(DISTINCT s.user_id) = ?
      ORDER BY RANDOM() LIMIT ?`)
    .bind(band, ...userIds, ...exclude, userIds.length, n).all());
}

/** Viděné právě tímhle hráčem a nikým dalším ze seznamu. */
async function seenOnlyBy(env, band, userId, others, n, exclude, rezim) {
  const ex = exclude.length ? ` AND q.id NOT IN (${marks(exclude)})` : '';
  const notOthers = others.length
    ? ` AND q.id NOT IN (SELECT question_id FROM seen_questions WHERE user_id IN (${marks(others)}))`
    : '';
  return rows(await env.DB.prepare(
    `SELECT q.id FROM questions q
       JOIN seen_questions s ON s.question_id = q.id
      WHERE q.band = ?${cast(rezim, 'q.')} AND s.user_id = ?${notOthers}${ex}
      ORDER BY RANDOM() LIMIT ?`)
    .bind(band, userId, ...others, ...exclude, n).all());
}

/**
 * Vrátí n ID otázek pásma pro dané hráče (0 = anonym, 1 = sólo, 2 = duel).
 *
 * SERVEROVÉ OTÁZKY MAJÍ PŘEDNOST (2026-09-06). Fond je společný pro offline i online
 * hru, takže správné odpovědi musí být v prohlížeči — a tím pádem si je kdokoli mohl
 * dohledat i pro HODNOCENOU online partii. Otázky s `online_only = 1` se do veřejných
 * dat nekopírují (build-public.js), takže tuhle díru nemají. Dokud jich nebude dost,
 * dobírá se z veřejných: prázdná online hra by byla horší než hra, kterou jde podvádět.
 * Kolik fondu je serverového, hlásí `npm run validate`.
 */
export async function pickQuestions(env, band, n, userIds = []) {
  const vybrane = [], odlozene = [];
  await vyber(env, band, n, userIds, 'server', vybrane, odlozene);
  // Dvě části fondu jsou disjunktní (online_only 0 × 1), takže se nemůžou překrýt
  // a druhý průchod nepotřebuje vylučovat, co vybral první.
  if (vybrane.length < n) await vyber(env, band, n, userIds, 'verejne', vybrane, odlozene);
  doplnOdlozene(vybrane, n, odlozene);
  return vybrane.slice(0, n);
}

/**
 * Kolik otázek se z databáze bere NAVÍC. Z kandidátů se vyřadí ty, které si s už
 * vybranými prozrazují odpověď (mapa z scripts/build-konflikty.js), a rezerva zajistí,
 * že hra kvůli tomu nezkrátí. Konfliktních dvojic je ve fondu ~500 na 3 742 otázek
 * a nejvíc jich má jedna otázka 22, takže osm náhradníků na hru stačí s velkou rezervou.
 */
export const REZERVA = 8;

const konflikt = (a, b) => (KONFLIKTY[a] || []).includes(b);   // mapa je souměrná

/**
 * Přidá do `vybrane` kandidáty, kteří nic z už vybraného neprozrazují (ani naopak), nejvýš
 * do n. Odmítnuté odloží: kdyby fond nestačil, doberou se na konci — radši otázka
 * s nápovědou než kratší hra.
 */
function prijmi(vybrane, kandidati, n, odlozene) {
  for (const id of kandidati) {
    if (vybrane.length >= n) break;
    if (vybrane.includes(id)) continue;
    if (vybrane.some(v => konflikt(v, id))) { odlozene.push(id); continue; }
    vybrane.push(id);
  }
}
function doplnOdlozene(vybrane, n, odlozene) {
  for (const id of odlozene) {
    if (vybrane.length >= n) break;
    if (!vybrane.includes(id)) vybrane.push(id);
  }
}

/** n otázek z kandidátů tak, aby si navzájem neprozrazovaly odpověď (denní pětka). */
export function bezKonfliktu(kandidati, n) {
  const vybrane = [], odlozene = [];
  prijmi(vybrane, kandidati, n, odlozene);
  doplnOdlozene(vybrane, n, odlozene);
  return vybrane;
}

/** Původní algoritmus (neviděné → viděné oběma → symetricky viděné jedním), nad jednou částí fondu. */
async function vyber(env, band, n, userIds, rezim, vybrane, odlozene) {
  const kolik = () => n - vybrane.length + REZERVA;
  prijmi(vybrane, await unseenByAll(env, band, userIds, kolik(), rezim), n, odlozene);
  if (vybrane.length >= n || userIds.length === 0) return;

  // 2) viděné všemi — výhoda je rozdělená rovnoměrně, takže fér
  prijmi(vybrane, await seenByAll(env, band, userIds, kolik(), vybrane, rezim), n, odlozene);

  // 3) viděné právě jedním — jen symetricky, po stejném počtu za každého hráče.
  //    Odmítnuté se tu NEODKLÁDAJÍ: dobrat je na konci by tu symetrii rozbilo.
  if (vybrane.length < n && userIds.length > 1) {
    const per = Math.floor((n - vybrane.length) / userIds.length);
    if (per > 0) {
      const zaHrace = [];
      for (const uid of userIds) {
        const others = userIds.filter(x => x !== uid);
        const kandidati = await seenOnlyBy(env, band, uid, others, per + REZERVA, vybrane, rezim);
        const moje = [];
        for (const id of kandidati) {
          if (moje.length >= per) break;
          const uz = [...vybrane, ...zaHrace.flat(), ...moje];
          if (!uz.includes(id) && !uz.some(v => konflikt(v, id))) moje.push(id);
        }
        zaHrace.push(moje);
      }
      // Kdyby konflikty jednomu hráči ubraly, zkrátí se to všem — jinak by nebyl fér.
      const m = Math.min(...zaHrace.map(a => a.length));
      zaHrace.forEach(a => vybrane.push(...a.slice(0, m)));
    }
  }
}

/** Zapíše, že hráč otázky viděl. Anonymní hra se neeviduje. */
export async function markSeen(env, userId, questionIds) {
  if (!userId || !questionIds.length) return;
  const now = Date.now();
  await env.DB.batch(questionIds.map(qid =>
    env.DB.prepare('INSERT OR IGNORE INTO seen_questions (user_id, question_id, seen_at) VALUES (?, ?, ?)')
      .bind(userId, qid, now)));
}
