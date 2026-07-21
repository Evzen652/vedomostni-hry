#!/usr/bin/env node
// Import davky kvizovych otazek do data/questions/{cc}.json (rostouci databaze,
// dedupe/replace podle id). Pouziti: node scripts/import-questions.js <soubor.json>
//
// Pravdivostni brzda (guard) se tyka JEN faktu, ne hlasek:
//  - question, source_url povinne
//  - type "choice": answer + aspon 3 distractory; golden_wrong (pokud je) musi byt distraktor
//  - type "estimate": numeric_answer (cislo) + unit
// Hlasky (quip_*) se NEOVERUJI.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const Q_DIR = path.join(ROOT, "data", "questions");

function validateQuestion(q) {
  const e = [];
  if (!q.question || !String(q.question).trim())     e.push("chybí otázka");
  if (!q.source_url || !String(q.source_url).trim()) e.push("chybí zdroj faktu");
  if (q.type === "estimate") {
    if (typeof q.numeric_answer !== "number")        e.push("estimate potřebuje numeric_answer (číslo)");
    if (!q.unit || !String(q.unit).trim())           e.push("estimate potřebuje unit");
  } else {
    // choice (vychozi)
    if (!q.answer || !String(q.answer).trim())       e.push("chybí odpověď");
    if ((q.distractors?.length ?? 0) < 3)            e.push("choice potřebuje 3 distraktory");
    if (q.golden_wrong != null && !(q.distractors || []).map(String).includes(String(q.golden_wrong)))
      e.push("golden_wrong musí být jeden z distraktorů");
  }
  return { ok: e.length === 0, chyby: e };
}

function ccOf(q) {
  if (q.cc && /^[a-z]{2}$/i.test(q.cc)) return String(q.cc).toLowerCase();
  const m = /^([a-z]{2})-/i.exec(String(q.id || ""));
  return m ? m[1].toLowerCase() : null;
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) { console.error("Použití: node scripts/import-questions.js <soubor.json>"); process.exit(1); }
  const abs = path.resolve(inputPath);
  if (!fs.existsSync(abs)) { console.error(`Soubor nenalezen: ${abs}`); process.exit(1); }

  let batch;
  try { batch = JSON.parse(fs.readFileSync(abs, "utf8")); }
  catch (e) { console.error(`Neplatný JSON v ${abs}: ${e.message}`); process.exit(1); }
  if (!Array.isArray(batch)) { console.error("Vstupní JSON musí být pole otázek."); process.exit(1); }

  fs.mkdirSync(Q_DIR, { recursive: true });

  const byCc = {};
  let skipped = 0;
  for (const q of batch) {
    const cc = ccOf(q);
    if (!cc) { console.log(`  PŘESKOČENO (bez cc/id): ${q.id || "?"}`); skipped++; continue; }
    const v = validateQuestion(q);
    if (!v.ok) { console.log(`  PŘESKOČENO ${q.id}: ${v.chyby.join(", ")}`); skipped++; continue; }
    // stárnutí pravdy — jen upozorneni, neblokuje
    if (/\bobyvatel|prezident|cena|nyní|současn/i.test(q.question || "") && !/\b(19|20)\d{2}\b/.test((q.question || "") + (q.explanation || "")))
      console.log(`  ⚠  ${q.id}: proměnlivý údaj bez ukotvení rokem (zvaž „k roku …")`);
    (byCc[cc] = byCc[cc] || []).push(q);
  }

  let added = 0, replaced = 0;
  for (const cc of Object.keys(byCc)) {
    const file = path.join(Q_DIR, `${cc}.json`);
    let existing = [];
    if (fs.existsSync(file)) {
      try { existing = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { existing = []; }
      if (!Array.isArray(existing)) existing = [];
    }
    const byId = new Map(existing.map(q => [q.id, q]));
    for (const q of byCc[cc]) {
      if (byId.has(q.id)) { console.log(`  NAHRAZENO ${q.id} (${cc}.json)`); replaced++; }
      else { console.log(`  PŘIDÁNO   ${q.id} (${cc}.json)`); added++; }
      byId.set(q.id, q);
    }
    fs.writeFileSync(file, JSON.stringify([...byId.values()], null, 2) + "\n", "utf8");
  }

  console.log("");
  console.log(`Hotovo: ${added} přidáno, ${replaced} nahrazeno, ${skipped} přeskočeno`);
}

main();
