"use strict";
/**
 * Sjednotí názvy sekcí v data/questions/*.json.
 *
 * Proč: dlaždice témat se staví z pevného seznamu SECTION_ORDER v quiz.js. V datech
 * ale postupně vzniklo 29 různých názvů sekcí — často dvě jména pro totéž („Kultura"
 * vs. „Kultura & tradice", „Jazyk" vs. „Jazyk & slova"). Otázky v neuvedených sekcích
 * byly přes výběr tématu NEDOSAŽITELNÉ; šlo je potkat jen přes „Vybrat vše".
 * Změřeno před opravou: 536 otázek z 3 702, tedy každá sedmá.
 *
 * Spuštění:  node scripts/normalize-sections.js [--dry]
 *
 * Sloučení jsou vedená obsahem, ne pohodlím: „Hlavní město" je typ místa, „Zvířata"
 * jsou příroda, „Svátky" jsou tradice. Co se nedalo poctivě zařadit (politika, doprava,
 * věda, ekonomika, hry, život), padá do „Zajímavosti" — a ta se stává plnohodnotnou
 * sekcí s vlastní dlaždicí, stejně jako „Symboly".
 */
const fs = require("fs");
const path = require("path");

const MAPA = {
  // dvě jména pro tutéž sekci
  "Kultura": "Kultura & tradice",
  "Svátky": "Kultura & tradice",
  "Svátky a tradice": "Kultura & tradice",
  "Jazyk": "Jazyk & slova",
  // místa a jejich podmnožiny
  "Města": "Místa",
  "Města a památky": "Místa",
  "Hlavní město": "Místa",
  "Památky": "Místa",
  "Zeměpis": "Místa",
  "Geografie": "Místa",
  // příroda
  "Zvířata": "Příroda",
  "Příroda a zvířata": "Příroda",
  // zbytek, který nemá vlastní domov
  "Politika": "Zajímavosti",
  "Ekonomika": "Zajímavosti",
  "Věda": "Zajímavosti",
  "Doprava": "Zajímavosti",
  "Život": "Zajímavosti",
  "Hry": "Zajímavosti",
};

// Sekce, které po sloučení musí umět nabídnout quiz.js (SECTION_ORDER).
const CILOVE = ["Místa", "Příroda", "Lidé", "Kultura & tradice", "Umění", "Sport",
  "Jazyk & slova", "Jídlo", "Historie", "Symboly", "Zajímavosti"];

const dry = process.argv.includes("--dry");
const dir = path.join(process.cwd(), "data", "questions");
let zmen = 0, souboru = 0;
const preduPo = {};

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  const p = path.join(dir, f);
  const arr = JSON.parse(fs.readFileSync(p, "utf8"));
  let zmena = false;
  for (const q of arr) {
    const nova = MAPA[q.section];
    if (!nova) continue;
    preduPo[q.section + " → " + nova] = (preduPo[q.section + " → " + nova] || 0) + 1;
    q.section = nova; zmen++; zmena = true;
  }
  // formát souborů: odsazení 1 mezerou + CRLF (jinak se přeformátuje celý soubor)
  if (zmena && !dry) { fs.writeFileSync(p, JSON.stringify(arr, null, 1).replace(/\n/g, "\r\n"), "utf8"); souboru++; }
}

for (const [k, v] of Object.entries(preduPo).sort((a, b) => b[1] - a[1])) console.log("  " + String(v).padStart(4) + "  " + k);
console.log((dry ? "\n[nasucho] " : "\n") + "přeřazeno " + zmen + " otázek" + (dry ? "" : " v " + souboru + " souborech"));

// kontrola: zbyla ještě nějaká sekce mimo cílový seznam?
const zbyle = {};
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  for (const q of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    if (!CILOVE.includes(q.section)) zbyle[q.section] = (zbyle[q.section] || 0) + 1;
}
const n = Object.values(zbyle).reduce((a, b) => a + b, 0);
console.log(n ? "POZOR, mimo nabízené sekce zůstává " + n + " otázek: " + JSON.stringify(zbyle)
              : "všechny otázky teď spadají do nabízených sekcí");
