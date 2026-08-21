const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "..", "data", "questions");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort();
const rows = [];
let totKids = 0, totStarsi = 0, totDospeli = 0;
for (const f of files) {
  const qs = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const kids = qs.filter(q => q.kids === true).length;
  const starsi = qs.filter(q => q.kids !== true && (q.difficulty || 1) <= 2).length;
  const dospeli = qs.filter(q => q.kids !== true && (q.difficulty || 1) >= 3).length;
  rows.push({ f: f.replace(".json", ""), total: qs.length, kids, starsi, dospeli });
  totKids += kids; totStarsi += starsi; totDospeli += dospeli;
}
rows.sort((a, b) => b.total - a.total);
for (const r of rows) console.log(`${r.f.padEnd(4)} total=${r.total} kids=${r.kids} starsi=${r.starsi} dospeli=${r.dospeli}`);
console.log(`\nCELKEM kids=${totKids} starsi=${totStarsi} dospeli=${totDospeli} vse=${totKids+totStarsi+totDospeli}`);

// vyvazene davky (podle poctu otazek: starsi+dospeli vahaji vic nez kids, protoze potrebuji fullrewrite quip_correct)
const NBATCH = 12;
const batches = Array.from({ length: NBATCH }, () => ({ files: [], w: 0 }));
const weighted = rows.map(r => ({ f: r.f, w: r.kids * 1 + r.starsi * 2 + r.dospeli * 2 }));
weighted.sort((a, b) => b.w - a.w);
for (const r of weighted) {
  batches.sort((a, b) => a.w - b.w);
  batches[0].files.push(r.f);
  batches[0].w += r.w;
}
console.log("\n--- DAVKY ---");
batches.forEach((b, i) => console.log(`davka ${i+1}: w=${b.w} files=${b.files.join(",")}`));
