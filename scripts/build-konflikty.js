"use strict";
/**
 * Postaví mapu dvojic otázek, které si navzájem PROZRAZUJÍ ODPOVĚĎ, a zapíše ji dvakrát:
 *   data/konflikty.json         — pro offline hru (bez serverových otázek, ty web nemá)
 *   functions/_lib/konflikty.js — pro online výběr (pool.js, denní pětka)
 *
 * Proč to existuje (2026-09-11): otázka „Kdo založil univerzitu roku 1348?" a vedle ní
 * „Jaké prvenství drží univerzita, kterou Karel IV. založil roku 1348?" — kdo dostane
 * obě, má první zadarmo. Takových dvojic je ve fondu přes pět set a přepsat je všechny
 * by stálo desítky obrázků i nové kolize u budoucího obsahu. Oprava je proto ve VÝBĚRU:
 * obě otázky se do jedné hry nedostanou, dokud fond nabízí něco jiného.
 *
 * Pravidlo: správná odpověď otázky X stojí celým slovem v zadání otázky Y, nebo v textu,
 * který hráč u Y čte hned po odpovědi (vysvětlení a hlášky). `more_fact` se nepočítá —
 * ukáže se jen tomu, kdo si klikne na „Více o…". Porovnává se jen uvnitř jedné země:
 * odpovědi jsou skoro vždy místní jména a hra přes víc zemí je potkává zřídka.
 *
 * Co se nepočítá a proč:
 *   - odpověď kratší než 6 znaků („Praha", „Šest") — jako místo děje stojí v cizích
 *     textech pořád, a mapa by pak zakazovala skoro všechno se vším;
 *   - čistě číselná odpověď („1348") — letopočet v zadání je kulisa, ne nápověda;
 *   - název země — v belgickém fondu je Belgie v každé druhé větě.
 * Planý konflikt nevadí: stojí jen trochu pestrosti výběru, hru nezkrátí (dobírá se).
 *
 * Mapa je GENEROVANÁ a verzovaná. Že nezastarala, hlídá `npm run validate`; obnoví se
 * `npm run build-index` (ten staví i index počtů).
 */
const fs = require("fs");
const path = require("path");

const KOREN = process.cwd();
const DIR = path.join(KOREN, "data", "questions");
const CIL_KLIENT = path.join(KOREN, "data", "konflikty.json");
const CIL_SERVER = path.join(KOREN, "functions", "_lib", "konflikty.js");

/**
 * Dvojice, které pravidlo nechytí, protože se liší TVAR slova. Každá musí mít důvod.
 */
const RUCNI = [
  // „Německy" × „psal v němčině" / „V němčině". Druhé dvě otázky se navíc ptají na totéž.
  ["cz-q-kafka-promena-praha", "cz-t-franz-kafka"],
  ["cz-q-kafka-promena-praha", "cz-t-lide-kafka-spisovatel"],
];

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// `\b` je v JS jen ASCII — u češtiny by hranice padla za „ě". Proto `\p{L}` s příznakem `u`.
const celeSlovo = s => new RegExp("(?<!\\p{L})" + esc(s) + "(?!\\p{L})", "iu");
const listy = v => v == null ? [] : typeof v === "string" ? [v]
  : Array.isArray(v) ? v.flatMap(listy) : typeof v === "object" ? Object.values(v).flatMap(listy) : [];
const textyY = q => [q.question, q.explanation, ...listy(q.quip_correct), ...listy(q.quip_wrong)]
  .filter(Boolean).join("\n");

function nactiFond() {
  const Q = [];
  for (const f of fs.readdirSync(DIR).filter(f => f.endsWith(".json")).sort()) {
    const qs = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    if (Array.isArray(qs)) Q.push(...qs);
  }
  return Q;
}

/** Vrátí { server, klient, dvojic } — obě mapy souměrné, klíče i hodnoty seřazené. */
function spocitej() {
  const Q = nactiFond();
  const podleId = new Map(Q.map(q => [q.id, q]));
  const ZEME = new Set(Q.map(q => String(q.country || "").toLowerCase()).filter(Boolean));
  const dvojice = new Set();
  const pridej = (a, b) => { if (a !== b) dvojice.add(a < b ? a + " " + b : b + " " + a); };

  const skup = {};
  for (const q of Q) (skup[q.cc] = skup[q.cc] || []).push(q);
  for (const g of Object.values(skup)) {
    const texty = g.map(textyY);
    for (const x of g) {
      const a = String(x.answer || "").trim();
      if (a.length < 6 || /^[\d\s.,]+$/.test(a) || ZEME.has(a.toLowerCase())) continue;
      const re = celeSlovo(a);
      g.forEach((y, i) => { if (y !== x && re.test(texty[i])) pridej(x.id, y.id); });
    }
  }
  for (const [a, b] of RUCNI) {
    if (!podleId.has(a) || !podleId.has(b)) throw new Error("ruční dvojice odkazuje na neexistující otázku: " + a + " × " + b);
    pridej(a, b);
  }

  const mapa = verejne => {
    const m = {};
    for (const k of dvojice) {
      const [a, b] = k.split(" ");
      if (verejne && (podleId.get(a).online_only === true || podleId.get(b).online_only === true)) continue;
      (m[a] = m[a] || []).push(b);
      (m[b] = m[b] || []).push(a);
    }
    const out = {};
    for (const id of Object.keys(m).sort()) out[id] = m[id].sort();
    return out;
  };
  return { server: mapa(false), klient: mapa(true), dvojic: dvojice.size };
}

// Jeden klíč na řádek, ať je diff po úpravě otázky čitelný.
const radky = m => "{\n" + Object.entries(m).map(([k, v]) => "  " + JSON.stringify(k) + ": " + JSON.stringify(v)).join(",\n") + "\n}";
const textKlient = m => radky(m) + "\n";
const textServer = m =>
  "// GENEROVÁNO scripts/build-konflikty.js — needitovat ručně, obnoví se `npm run build-index`.\n" +
  "// Dvojice otázek, které si prozrazují odpověď; pool.js je nedá do jedné hry.\n" +
  "export const KONFLIKTY = " + radky(m) + ";\n";

/** Sdílené s validate-data.js, ať kontrola i generování počítají stejně. */
module.exports = { spocitej, textKlient, textServer, CIL_KLIENT, CIL_SERVER };

if (require.main === module) {
  const { server, klient, dvojic } = spocitej();
  fs.writeFileSync(CIL_KLIENT, textKlient(klient), "utf8");
  fs.writeFileSync(CIL_SERVER, textServer(server), "utf8");
  console.log("Konflikty hotové: " + dvojic + " dvojic, " + Object.keys(server).length +
    " otázek → data/konflikty.json + functions/_lib/konflikty.js");
}
