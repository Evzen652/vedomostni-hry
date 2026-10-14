"use strict";
/**
 * Mutační test přejímky (scripts/obsah/prijmi.js): vloží do reálné dodávky záměrné chyby
 * a ověří, že je přejímka chytí. Nová kontrola se ověřuje mutací, ne tím, že svítí zeleně.
 * Základ = posledních 40 italských otázek ve fondu (= dávka z kampaně 2026); nic se do fondu
 * nezapisuje, `.obsah/nove/it.json` se po testu smaže.
 *
 *   node scripts/obsah/test-prijmi.js
 */
const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");
const KOREN = path.resolve(__dirname, "..", "..");
const NOVE = KOREN + "/.obsah/nove";
fs.mkdirSync(NOVE, { recursive: true });

const zaklad = JSON.parse(fs.readFileSync(KOREN + "/data/questions/it.json", "utf8")).slice(-40);
// ID uz jsou ve fondu - prejmenovat, ať test meri jen to, co ma
const vyrob = fn => {
  const qs = JSON.parse(JSON.stringify(zaklad)).map(q => ({ ...q, id: q.id + "-zkouska" }));
  fn(qs);
  fs.writeFileSync(NOVE + "/it.json", JSON.stringify(qs, null, 1), "utf8");
  return spawnSync("node scripts/obsah/prijmi.js --vse", { cwd: KOREN, shell: true, encoding: "utf8" }).stdout;
};
const ma = (v, re) => re.test(v);
const vysl = [];
const t = (nazev, ok) => { vysl.push([nazev, ok]); console.log((ok ? "OK    " : "SELHALO ") + nazev); };

// 0) cista dodavka: zadne chyby
let v = vyrob(() => {});
t("cista dodavka nema chyby", !ma(v, /CHYBY/));

// 1) online_only na nove otazce
v = vyrob(qs => { qs[0].online_only = true; });
t("online_only na nove otazce -> CHYBA", ma(v, /online_only/) && ma(v, /CHYBY/));

// 2) riziko v zaporu: 'no plaques' i kdyz je v promptu 'completely bare' (puvodni vyjimka by to pustila)
v = vyrob(qs => { qs[1].irony_prompt = qs[1].irony_prompt.replace(/MOOD:/, "Its surface is completely bare with no plaques. MOOD:"); });
t("'no plaques' + 'completely bare' -> varovani (puvodni vyjimka by pustila)", ma(v, /plaque/i));

// 3) scoreboard
v = vyrob(qs => { qs[2].irony_prompt = qs[2].irony_prompt.replace(/MOOD:/, "A scoreboard glows far behind. MOOD:"); });
t("scoreboard -> varovani", ma(v, /scoreboard/i));

// 4) neskodne 'texture' ani 'cutting board' varovani nevyrobi
v = vyrob(qs => { qs[3].irony_prompt = qs[3].irony_prompt.replace(/MOOD:/, "A wooden cutting board with rough stone texture. MOOD:"); });
t("'texture' a 'cutting board' bez varovani", !ma(v, /(texture|board)\b.*vyžádá|nápis \((texture|board)/i));

// 5) chybejici otazka (39)
v = vyrob(qs => { qs.pop(); });
t("39 otazek -> CHYBA 'rozepsana'", ma(v, /rozepsaná/));

// 6) minuly cas s rodem
v = vyrob(qs => { qs[4].quip_correct = "Tys to věděl, bravo."; });
t("'Tys to věděl' -> chyba rodu/stazeneho tvaru", ma(v, /CHYBY/));

// 7) odpoved v zadani
v = vyrob(qs => { qs[5].question = "Znáš odpověď " + qs[5].answer + " předem? " + qs[5].question; });
t("odpoved v zadani -> CHYBA", ma(v, /odpověď je přímo v zadání/));

// uklid
fs.unlinkSync(NOVE + "/it.json");
const selhalo = vysl.filter(x => !x[1]);
console.log("\n" + (selhalo.length ? "SELHALO " + selhalo.length + " z " + vysl.length : "VSE OK: " + vysl.length + " z " + vysl.length));
process.exit(selhalo.length ? 1 : 0);
