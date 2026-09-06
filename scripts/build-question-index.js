"use strict";
/**
 * Postaví data/questions-index.json — počet otázek na zemi.
 *
 * Proč to existuje: appka do 2026-09-06 stahovala při STARTU celý fond, tedy
 * 56 souborů a 4,72 MB, a do té doby ukazovala bílou stránku (naměřeno 2 923 ms
 * na localhostu, kde není žádná síť; na mobilních datech řádově víc). Přitom
 * jediné, co z těch dat potřebuje výběrová obrazovka, jsou POČTY — samotné otázky
 * až ve chvíli, kdy je vybraná země.
 *
 * Index je proto generovaný a VERZOVANÝ (appka ho musí najít i v lokálním vývoji,
 * kde se servíruje kořen repa, ne dist/). Že nezastaral, hlídá `npm run validate`.
 *
 * Spuštění:  npm run build-index
 */
const fs = require("fs");
const path = require("path");

const KOREN = process.cwd();
const DIR = path.join(KOREN, "data", "questions");
const CIL = path.join(KOREN, "data", "questions-index.json");

function spocitej() {
  const index = {};
  for (const f of fs.readdirSync(DIR).filter(f => f.endsWith(".json")).sort()) {
    const cc = f.replace(/\.json$/, "");
    const qs = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    index[cc] = Array.isArray(qs) ? qs.length : 0;
  }
  return index;
}

/** Sdílené s validate-data.js, ať kontrola i generování počítají stejně. */
module.exports = { spocitej, CIL };

if (require.main === module) {
  const index = spocitej();
  // Odsazení 2 mezerami a LF: tenhle soubor je generovaný, není to fond otázek
  // (tam je 1 mezera a CRLF, viz CLAUDE.md — nepleť si to).
  fs.writeFileSync(CIL, JSON.stringify(index, null, 2) + "\n", "utf8");
  const celkem = Object.values(index).reduce((a, b) => a + b, 0);
  console.log("Index hotov: " + Object.keys(index).length + " zemí, " + celkem + " otázek → data/questions-index.json");
}
