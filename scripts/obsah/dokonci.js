"use strict";
/**
 * Dokončovací krok po zápisu nové dávky otázek do fondu.
 *
 * `build-index` NENÍ volitelný: staví index počtů (rychlý start appky) a mapu otázek, které
 * si navzájem prozrazují odpověď. Bez něj hlásí `validate` zastaralou mapu jako CHYBU a nové
 * otázky by mohly padnout do jedné hry s tou, kterou prozrazují.
 *
 *   node scripts/obsah/dokonci.js
 *
 * Nakonec hlídá, že serverových otázek je pořád tolik, kolik jich bylo před kampaní (220).
 * Počet se mění JEN záměrně (nový serverový fond); neočekávaná změna je skoro jistě
 * omyl s příznakem `online_only` — viz zápis 2026-10-01 v CLAUDE.md.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const KOREN = path.resolve(__dirname, "..", "..");
const OCEKAVANYCH_SERVEROVYCH = 220;

function npm(skript) {
  const r = spawnSync("npm run " + skript, { cwd: KOREN, shell: true, encoding: "utf8" });
  return (r.stdout || "") + (r.stderr || "");
}
const radky = t => t.split(/\r?\n/);

console.log("=== build-index (index počtů + mapa konfliktů) ===");
console.log(radky(npm("build-index")).filter(l => /^(Index|Konflikty)/.test(l)).join("\n"));

console.log("\n=== validate ===");
const v = radky(npm("validate")).filter(l => /CHYB|serverový fond|pod 12/.test(l));
console.log(v.slice(0, 8).join("\n") || "(bez výstupu — zkontroluj `npm run validate` ručně)");

console.log("\n=== test:offline ===");
console.log(radky(npm("test:offline")).filter(Boolean).slice(-1)[0]);

console.log("\n=== audit konzistence (počty kategorií) ===");
const a = radky(npm("audit:konzistence")).filter(l => /^[a-z_]+: \d+/.test(l)).slice(0, 14);
console.log(a.join("\n"));
// audit přepisuje data/audit-konzistence.json; do repa se nevrací
spawnSync("git restore data/audit-konzistence.json", { cwd: KOREN, shell: true });

console.log("\n=== stav fondu ===");
const QDIR = path.join(KOREN, "data", "questions");
let celkem = 0, server = 0;
for (const f of fs.readdirSync(QDIR).filter(f => f.endsWith(".json"))) {
  const qs = JSON.parse(fs.readFileSync(path.join(QDIR, f), "utf8"));
  celkem += qs.length;
  server += qs.filter(q => q.online_only).length;
}
console.log(`otázek celkem: ${celkem} (z toho serverových ${server})`);
if (server !== OCEKAVANYCH_SERVEROVYCH) {
  console.log(`\n!!! SERVEROVÝCH JE ${server}, ČEKÁNO ${OCEKAVANYCH_SERVEROVYCH}. Skoro jistě omyl s online_only — ` +
    `porovnej s \`git show <commit před dávkou>:data/questions/<cc>.json\`, než cokoli commitneš.`);
  process.exitCode = 1;
}
