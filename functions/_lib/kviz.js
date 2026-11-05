/**
 * ŽIVÝ KVÍZ (2026-11-05) — „hospodský kvíz" ve dvou pevných termínech týdně.
 * Rozhodnutí a jejich důvody: CLAUDE.md, zápis 2026-11-05.
 *
 * KVÍZ ŘÍDÍ HODINY, NE DOTAZOVÁNÍ. Celý průběh večera je čistá funkce `starts_at`
 * a čtyř délek uložených u kvízu (`casy()`), takže klient nepotřebuje se serveru
 * neustále ptát, co se děje — spočítá si to sám a server se ptá jen ve chvíli, kdy
 * něco potřebuje (otázku, odhalení, pořadí). Vychází to ~125 požadavků na hráče
 * za večer. Dotazování po 2 s, jako má živý duel, by sto hráčů za jediný večer
 * přetáhlo přes denní limit 100 000 požadavků bezplatného Cloudflare.
 *
 * Kvíz se ZAKLÁDÁ SÁM: `zajistiDalsi()` při prvním dotazu na /api/kviz vytvoří
 * nejbližší termín z `TERMINY`, i s výběrem 40 otázek. Id je odvozené z data
 * (`k202611081900`), takže dva souběžné požadavky nezaloží dva kvízy — vyhraje
 * `INSERT OR IGNORE` a otázky si zapíše jen ten, kdo kvíz opravdu založil.
 */
import { shuffledOrder } from './game.js';
import { bezKonfliktu, REZERVA } from './pool.js';

/** Pravidelné termíny v pražském čase. `den`: 0 = neděle … 6 = sobota. */
export const TERMINY = [
  { den: 0, hod: 19, min: 0 },   // neděle 19:00
  { den: 3, hod: 20, min: 0 },   // středa 20:00 — „pro dobrou věc" (sbírka se zadává u kvízu)
];
/** Výchozí tempo večera (odsouhlaseno 2026-11-05: ~45 min). */
export const VYCHOZI = { kol: 4, na_kolo: 10, limit_s: 30, odhaleni_s: 12, prestavka_s: 240 };
/** Kolik po uzávěrce se ještě přijme odpověď (síť). Odhalení se vydá až po ní. */
export const TOLERANCE_MS = 1500;
/** Kolik hráčů ukázat v průběžném pořadí. */
export const TOP = 10;

const ZONA = 'Europe/Prague';
const DNY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Formátovač se staví JEDNOU. Konstrukce Intl.DateTimeFormat s časovou zónou je drahá
// (načítá data ICU) a dalsiTermin() ho volá ~20× na požadavek — první verze tak
// trávila na GET /api/kviz stovky ms CPU, což by v produkci narazilo na limit Workers.
let formatovac = null;
/** Pražský kalendářní den a čas pro daný okamžik. */
export function prahaCasti(ms) {
  if (!formatovac) formatovac = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
  });
  const p = {};
  for (const x of formatovac.formatToParts(new Date(ms))) p[x.type] = x.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute, den: DNY[p.weekday] };
}

/**
 * Pražský místní čas → UTC milisekundy. Odchylka se zjistí z Intl a ověří se ještě
 * jednou na výsledku, ať sedí i v týdnu přechodu na letní/zimní čas.
 */
export function prahaNaUtc(y, m, d, h, min) {
  const odhad = Date.UTC(y, m - 1, d, h, min);
  const posun = t => { const c = prahaCasti(t); return Date.UTC(c.y, c.m - 1, c.d, c.h, c.min) - t; };
  let t = odhad - posun(odhad);
  t = odhad - posun(t);
  return t;
}

/** Délka celého večera v ms. */
export function delka(k) {
  const naOtazku = (k.limit_s + k.odhaleni_s) * 1000;
  return k.kol * k.na_kolo * naOtazku + (k.kol - 1) * k.prestavka_s * 1000;
}

/** Časy n-té otázky (0 … kol*na_kolo-1). */
export function casy(k, n) {
  const naOtazku = (k.limit_s + k.odhaleni_s) * 1000;
  const kolo = Math.floor(n / k.na_kolo), i = n % k.na_kolo;
  const otevreno = k.starts_at + kolo * (k.na_kolo * naOtazku + k.prestavka_s * 1000) + i * naOtazku;
  const uzaverka = otevreno + k.limit_s * 1000;
  return { otevreno, uzaverka, odhaleni_od: uzaverka + TOLERANCE_MS, odhaleni_do: uzaverka + k.odhaleni_s * 1000 };
}

/** Kolik kol je k danému okamžiku celých za námi (odhalená poslední otázka kola). */
export function hotovaKola(k, now) {
  let n = 0;
  for (let kolo = 0; kolo < k.kol; kolo++) {
    const posledni = casy(k, (kolo + 1) * k.na_kolo - 1);
    if (now >= posledni.odhaleni_od) n = kolo + 1;
  }
  return n;
}

/** Nejbližší pravidelný termín, který ještě neskončil. */
export function dalsiTermin(now, d = delka(VYCHOZI)) {
  let nej = null;
  for (let posun = 0; posun <= 8; posun++) {
    const c = prahaCasti(now + posun * 86400000);
    for (const t of TERMINY) {
      if (t.den !== c.den) continue;
      const start = prahaNaUtc(c.y, c.m, c.d, t.hod, t.min);
      if (start + d <= now) continue;
      if (!nej || start < nej.start) nej = { start, c, t };
    }
  }
  return nej;
}

const dva = x => String(x).padStart(2, '0');
export const idTerminu = (c, t) => `k${c.y}${dva(c.m)}${dva(c.d)}${dva(t.hod)}${dva(t.min)}`;

/** Řádek z DB → objekt s čísly (D1 vrací INTEGER jako number, ale pro jistotu). */
export function kvizZRadku(r) {
  if (!r) return null;
  return {
    id: r.id, starts_at: +r.starts_at, konec_at: +r.konec_at,
    kol: +r.kol, na_kolo: +r.na_kolo, limit_s: +r.limit_s, odhaleni_s: +r.odhaleni_s,
    prestavka_s: +r.prestavka_s, question_ids: JSON.parse(r.question_ids),
    orders: JSON.parse(r.orders), charita: r.charita ? JSON.parse(r.charita) : null,
  };
}

/**
 * 40 otázek na večer. Bere se jen z otázek, které v žádném kvízu ještě nepadly
 * (`kviz_pouzite`) — po večeru se mají uvolnit do archivu, takže se nesmí vrátit.
 * V D1 jsou jen otázky s ilustrací (`sync-d1-questions.js` → `hratelne.js`).
 *
 * Večer jde OD LEHČÍHO K TĚŽŠÍMU: kandidáti se seřadí podle pásma a hvězdiček,
 * rozdělí na kola a teprve uvnitř kola se zamíchají. Hospodský kvíz se tak rozjede
 * na otázkách, na které zná odpověď většina stolu.
 */
export async function vyberOtazky(env, pocet) {
  const kandidati = (await env.DB.prepare(
    `SELECT id, band, difficulty FROM questions
      WHERE id NOT IN (SELECT question_id FROM kviz_pouzite)
      ORDER BY RANDOM() LIMIT ?`).bind(pocet + 4 * REZERVA).all()).results;
  const ids = bezKonfliktu(kandidati.map(r => r.id), pocet);
  if (ids.length < pocet) return null;
  const vaha = { deti: 0, starsi: 3, dospeli: 6 };
  const podleId = Object.fromEntries(kandidati.map(r => [r.id, (vaha[r.band] ?? 6) + (+r.difficulty || 1)]));
  return ids.sort((a, b) => podleId[a] - podleId[b]);
}

function zamichej(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Založí kvíz s daným id, začátkem a tempem. Vrací true, když ho založil TENHLE volající. */
export async function zalozKviz(env, id, starts_at, tempo, charita = null) {
  const k = { ...VYCHOZI, ...tempo, starts_at };
  const pocet = k.kol * k.na_kolo;
  const serazene = await vyberOtazky(env, pocet);
  if (!serazene) return false;
  const ids = [];
  for (let kolo = 0; kolo < k.kol; kolo++) ids.push(...zamichej(serazene.slice(kolo * k.na_kolo, (kolo + 1) * k.na_kolo)));
  const now = Date.now();
  const r = await env.DB.prepare(
    `INSERT OR IGNORE INTO kvizy (id, starts_at, konec_at, kol, na_kolo, limit_s, odhaleni_s, prestavka_s,
                                  question_ids, orders, charita, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, starts_at, starts_at + delka(k), k.kol, k.na_kolo, k.limit_s, k.odhaleni_s, k.prestavka_s,
          JSON.stringify(ids), JSON.stringify(ids.map(() => shuffledOrder())),
          charita ? JSON.stringify(charita) : null, now).run();
  if (!r.meta.changes) return false;
  await env.DB.batch(ids.map(q => env.DB.prepare(
    'INSERT OR IGNORE INTO kviz_pouzite (question_id, kviz_id, pouzito_at) VALUES (?, ?, ?)').bind(q, id, now)));
  return true;
}

/** Postará se, aby nejbližší pravidelný termín existoval. */
export async function zajistiDalsi(env, now = Date.now()) {
  const t = dalsiTermin(now);
  if (!t) return;
  const id = idTerminu(t.c, t.t);
  const je = await env.DB.prepare('SELECT 1 FROM kvizy WHERE id = ?').bind(id).first();
  if (!je) await zalozKviz(env, id, t.start, {});
}

/** Kvíz, který právě běží, jinak nejbližší budoucí. */
export async function aktualni(env, now = Date.now()) {
  return kvizZRadku(await env.DB.prepare(
    'SELECT * FROM kvizy WHERE konec_at > ? ORDER BY starts_at LIMIT 1').bind(now).first());
}

/** Pořadí: top N + pozice hráče. Shodné skóre = stejné místo. */
export async function poradi(env, kvizId, meId) {
  // Jedním dotazem: RANK() dá stejné místo stejnému skóre, COUNT(*) OVER () počet hráčů.
  // Hráč se přidá k top N výběrem `user_id = ?`, ať se jeho místo nemusí dopočítávat zvlášť.
  const radky = (await env.DB.prepare(
    `SELECT * FROM (
       SELECT h.user_id, u.nick, h.score, h.spravne,
              RANK() OVER (ORDER BY h.score DESC) AS misto,
              ROW_NUMBER() OVER (ORDER BY h.score DESC, h.spravne DESC, h.prihlasen_at) AS poradi,
              COUNT(*) OVER () AS pocet
         FROM kviz_hraci h JOIN users u ON u.id = h.user_id
        WHERE h.kviz_id = ?)
      WHERE poradi <= ? OR user_id = ? ORDER BY poradi`)
    .bind(kvizId, TOP, meId || '').all()).results;
  const pocet = radky.length ? radky[0].pocet : 0;
  const top = radky.filter(r => r.poradi <= TOP).map(r => ({
    misto: r.misto, nick: r.nick, score: r.score, spravne: r.spravne, ja: r.user_id === meId,
  }));
  const m = meId ? radky.find(r => r.user_id === meId) : null;
  const ja = m ? { misto: m.misto, score: m.score, spravne: m.spravne } : null;
  return { pocet, top, ja };
}

/** Veřejný popis kvízu pro klienta (bez otázek). */
export function verejny(k) {
  return {
    id: k.id, starts_at: k.starts_at, konec_at: k.konec_at, kol: k.kol, na_kolo: k.na_kolo,
    limit_s: k.limit_s, odhaleni_s: k.odhaleni_s, prestavka_s: k.prestavka_s,
    pocet_otazek: k.question_ids.length, charita: k.charita,
  };
}
