#!/usr/bin/env node
/**
 * seed-d1.js — vygeneruje data/d1-seed.sql ze všech data/questions/*.json.
 *
 * Otázky musí být v databázi, ne v klientském balíčku, aby server mohl servírovat
 * možnosti bez označení správné odpovědi (viz docs/online-rezim.md, Anti-cheat).
 *
 * Spuštění:  npm run db:seed        → vyrobí SQL
 *            npm run db:init        → schéma + seed do lokální D1
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'data', 'questions');
const OUT = path.join(__dirname, '..', 'data', 'd1-seed.sql');

const band = q => (q.kids === true ? 'deti' : (q.difficulty || 1) <= 2 ? 'starsi' : 'dospeli');
const sql = v => (v == null ? 'NULL' : "'" + String(v).replace(/'/g, "''") + "'");

const rows = [];
const seen = new Set();
let skipped = 0;

for (const file of fs.readdirSync(SRC).filter(f => f.endsWith('.json'))) {
  for (const q of JSON.parse(fs.readFileSync(path.join(SRC, file), 'utf8'))) {
    if (seen.has(q.id)) { skipped++; continue; }
    if (!Array.isArray(q.distractors) || q.distractors.length !== 3) { skipped++; continue; }
    seen.add(q.id);
    rows.push('(' + [
      sql(q.id), sql(q.cc), sql(q.country), sql(band(q)), sql(q.section),
      sql(q.question), sql(q.answer), sql(JSON.stringify(q.distractors)),
      sql(q.quip_correct), sql(q.quip_wrong), sql(q.explanation),
      sql(q.more_fact), sql(q.about),
    ].join(',') + ')');
  }
}

const COLS = '(id,cc,country,band,section,question,answer,distractors,quip_correct,quip_wrong,explanation,more_fact,about)';
// Dávka po 25: otázka i s hláškami a vysvětlením má ~1–2 kB, takže při 200 řádcích
// jeden příkaz přeteče limit D1 na délku SQL (SQLITE_TOOBIG).
const BATCH = 25;
const out = [];
for (let i = 0; i < rows.length; i += BATCH) {
  out.push('INSERT INTO questions ' + COLS + ' VALUES\n' + rows.slice(i, i + BATCH).join(',\n') + ';');
}

fs.writeFileSync(OUT, out.join('\n\n') + '\n', 'utf8');

const byBand = {};
rows.forEach((_, i) => {});
console.log('Zapsáno ' + rows.length + ' otázek do data/d1-seed.sql' +
  (skipped ? ' (přeskočeno ' + skipped + ')' : ''));
