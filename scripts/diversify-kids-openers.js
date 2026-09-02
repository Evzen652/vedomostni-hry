"use strict";
/**
 * Rozbíjí opakující se úvod "Tys to věděl!" / "Jé, tys to věděl!" v quip_correct
 * u dětských otázek (2026-09-02) — hráč hlásil, že hláška po správné odpovědi
 * zní pořád stejně. Ověřeno: 617 z 990 dětských otázek (62 %) mělo tenhle
 * doslovný opener, ostatní pásma nic podobného nemají (nejčastější opener tam
 * sedí na 4–5 % otázek).
 *
 * Mění se JEN úvodní fráze — zbytek věty (ten konkrétní vtipný fakt) zůstává
 * beze změny. Rotace je DETERMINISTICKÁ (index % počet variant), ne náhodná,
 * ať je běh opakovatelný a rozdělení rovnoměrné.
 *
 * Spuštění: node scripts/diversify-kids-openers.js
 */
const fs = require("fs");
const path = require("path");

// Původní dvě fráze zůstávají v rotaci (jen přestávají být jediné), + 6 nových.
// Tón podle standardu 2026-08-15: nadšené, ne sarkastické, bez rodu v minulém čase.
const VARIANTY = [
  "Tys to věděl!",
  "Jé, tys to věděl!",
  "Bod pro tebe!",
  "Trefa do černého!",
  "Bystrá hlava!",
  "Paráda, sedí to!",
  "To bylo hned vidět!",
  "Hop, a je to!",
];

const PREFIXY = ["Jé, tys to věděl!", "Tys to věděl!"]; // delší napřed, ať se nezasekne na kratší shodě

const dir = path.join(__dirname, "..", "data", "questions");
let i = 0, celkem = 0;

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".json")) continue;
  const fp = path.join(dir, file);
  const raw = fs.readFileSync(fp);
  const qs = JSON.parse(raw.toString("utf8"));
  let changed = 0;
  for (const q of qs) {
    if (!q.kids || !q.quip_correct) continue;
    const prefix = PREFIXY.find(p => q.quip_correct.startsWith(p));
    if (!prefix) continue;
    const zbytek = q.quip_correct.slice(prefix.length);
    q.quip_correct = VARIANTY[i % VARIANTY.length] + zbytek;
    i++; changed++;
  }
  if (changed > 0) {
    const out = Buffer.from(JSON.stringify(qs, null, 1).replace(/\n/g, "\r\n"), "utf8");
    fs.writeFileSync(fp, out);
    console.log(file, "zmeneno:", changed);
    celkem += changed;
  }
}
console.log("\ncelkem prepsano:", celkem);
