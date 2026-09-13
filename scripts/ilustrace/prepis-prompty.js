// Přepíše EXISTUJÍCÍ `irony_prompt` (vstup {id: "nová scéna"}) — na opravu vadného zadání.
// Starý text se bere z dat a předává aplikuj.js jako pojistka `stare`, takže přepis sedí
// jen na současný stav souboru.
//   node scripts/ilustrace/prepis-prompty.js xx-fix.json
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const KOREN = path.join(path.resolve(__dirname, "..", ".."), "data", "questions");
const vstupSoubor = process.argv[2];
if (!vstupSoubor) throw new Error("chybí soubor s opravami");
const vstup = JSON.parse(fs.readFileSync(vstupSoubor, "utf8"));
const podleId = {};
for (const f of fs.readdirSync(KOREN).filter(f => f.endsWith(".json")))
  for (const q of JSON.parse(fs.readFileSync(path.join(KOREN, f), "utf8"))) podleId[q.id] = q;
const edits = Object.entries(vstup).map(([id, t]) => {
  const q = podleId[id];
  if (!q || !q.irony_prompt) throw new Error(id + ": otázka nebo její zadání neexistuje");
  return { id, cesta: "irony_prompt", stare: q.irony_prompt, nove: t.trim() };
});
const tmp = path.join(path.dirname(path.resolve(vstupSoubor)), "edits-tmp.json");
fs.writeFileSync(tmp, JSON.stringify(edits, null, 1));
const r = spawnSync(process.execPath, [path.join(__dirname, "aplikuj.js"), tmp], { encoding: "utf8" });
process.stdout.write(r.stdout + r.stderr);
process.exit(r.status);
