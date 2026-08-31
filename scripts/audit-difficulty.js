"use strict";
// Audit obtížnosti pro pásma teen (difficulty≤2, !kids) a adult (difficulty 3).
// Hledá otázky, které jsou pro dané pásmo nevhodně těžké.
// Spusť: node scripts/audit-difficulty.js
const fs = require("fs"), path = require("path");
const DIR = path.join(process.cwd(), "data", "questions");

const NUM_ANS   = /^\d[\d\s.,]+$|^\d+\s*(m|km|kg|let|%|mil|miliard|tisíc|metrů|procent|hodin|roku|cm|mm)/i;
const NUM_Q     = /\bkolik\b|\bv kolika\b|\bkterého roku\b|\bve kterém roce\b|\bkdy\b.*\d|\bjaká výška\b|\bjaká délka\b|\bjaká vzdálenost\b/i;
const YEAR_ANS  = /^\d{3,4}\s*(př\.|n\.|let|–|-|\s|$)/;
const SPEC_NUM  = /\b\d{2,}\b/; // 2+ ciferné číslo v odpovědi

const results = { teen: { total:0, number:0, year:0, samples:[] }, adult: { total:0, number:0, year:0, samples:[] } };

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith(".json"))) {
  const qs = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  for (const q of qs) {
    if (q.kids) continue;
    const d = q.difficulty || 1;
    const band = d <= 2 ? "teen" : "adult";
    const r = results[band];
    r.total++;

    const isNumAns   = NUM_ANS.test(q.answer) || SPEC_NUM.test(q.answer);
    const isYearAns  = YEAR_ANS.test(q.answer);
    const isNumQ     = NUM_Q.test(q.question);
    const flag = (isNumQ || isNumAns || isYearAns);

    if (isNumAns || isYearAns) r.number++;
    if (isYearAns) r.year++;

    if (flag && r.samples.length < 8) {
      r.samples.push({
        cc: q.cc, section: q.section, diff: d,
        q: q.question.slice(0,80),
        a: q.answer.slice(0,60),
        flag: isYearAns ? "rok" : isNumAns ? "číslo" : "kolik-otázka"
      });
    }
  }
}

for (const [band, r] of Object.entries(results)) {
  const pct = (r.number / r.total * 100).toFixed(1);
  console.log(`\n=== ${band.toUpperCase()} (${r.total} otázek) ===`);
  console.log(`  Otázky se specifickým číslem/rokem v odpovědi: ${r.number} (${pct} %)`);
  console.log(`    z toho letopočty: ${r.year}`);
  console.log(`  → Zbývá "ok" kandidátů: ${r.total - r.number} (${(100 - parseFloat(pct)).toFixed(1)} %)`);
  console.log(`\n  Ukázky problematických:`);
  for (const s of r.samples) {
    console.log(`  [${s.cc}/${s.section}/d${s.diff}] ${s.flag.toUpperCase()}`);
    console.log(`    Q: ${s.q}`);
    console.log(`    A: ${s.a}`);
  }
}

console.log("\n\nShrnutí po zemích — teen otázky se číslem:");
const byCC = {};
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith(".json"))) {
  const qs = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  for (const q of qs) {
    if (q.kids || (q.difficulty||1) > 2) continue;
    const isNum = NUM_ANS.test(q.answer) || SPEC_NUM.test(q.answer) || YEAR_ANS.test(q.answer);
    if (!byCC[q.cc]) byCC[q.cc] = { total:0, num:0 };
    byCC[q.cc].total++;
    if (isNum) byCC[q.cc].num++;
  }
}
const rows = Object.entries(byCC).map(([cc,v]) => ({cc, ...v, pct: Math.round(v.num/v.total*100)}))
  .sort((a,b) => b.pct - a.pct);
for (const r of rows.slice(0,15)) {
  const bar = "█".repeat(Math.round(r.pct/5));
  console.log(`  ${r.cc.padEnd(4)} ${String(r.num).padStart(3)}/${r.total.toString().padStart(4)} (${String(r.pct).padStart(3)}%) ${bar}`);
}
