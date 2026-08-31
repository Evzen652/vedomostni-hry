// Sloučí dílčí výstupy úsudkového průchodu (data/_jpart/part-*.json) do data/judgment.json,
// který čte admin.html (fialové odznaky). Spouštět z kořene repa: node scripts/merge-judgment.js
// Každý dílčí soubor má tvar {"findings":[{"id","code","msg"}]}. Kódy drž v synci s admin.html a workflow promptem.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = process.cwd();
const PDIR = path.join(ROOT, "data", "_jpart");
const CODES = new Set(["neni_vtipne", "vrstvy_stejne", "hlaska_mimo", "odpoved_sporna", "distraktor_snadny", "tezke_6_9", "nevhodne_6_9"]);

const byId = {}, codeCounts = {};
let parts = 0, bad = 0, findings = 0;

for (const f of (fs.existsSync(PDIR) ? fs.readdirSync(PDIR).filter(x => x.endsWith(".json")) : [])) {
  let obj;
  try { obj = JSON.parse(fs.readFileSync(path.join(PDIR, f), "utf8")); }
  catch (e) { console.warn(`  ! ${f}: nevalidní JSON — přeskočeno (${e.message})`); bad++; continue; }
  parts++;
  for (const fd of (obj.findings || [])) {
    if (!fd || !fd.id || !fd.code) continue;
    if (!CODES.has(fd.code)) { console.warn(`  ! neznámý kód „${fd.code}“ u ${fd.id} — ponechávám`); }
    (byId[fd.id] = byId[fd.id] || []).push({ code: fd.code, sev: "judge", msg: String(fd.msg || "") });
    codeCounts[fd.code] = (codeCounts[fd.code] || 0) + 1;
    findings++;
  }
}

const out = { generated: new Date().toISOString(), source: "judgment", flagged: Object.keys(byId).length, findings, codeCounts, byId };
fs.writeFileSync(path.join(ROOT, "data", "judgment.json"), JSON.stringify(out, null, 1));

console.log(`Sloučeno ${parts} dílčích souborů${bad ? ` (${bad} vadných)` : ""}: ${findings} nálezů u ${out.flagged} otázek.\n`);
const order = Object.entries(codeCounts).sort((a, b) => b[1] - a[1]);
for (const [c, n] of order) console.log(`  ${String(n).padStart(4)} × ${c}`);
console.log("\nUloženo do data/judgment.json (čte ho admin.html). Složku data/_jpart můžeš po kontrole smazat.");
