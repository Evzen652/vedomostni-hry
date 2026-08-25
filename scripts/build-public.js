"use strict";
/**
 * Sestaví dist/ — jen to, co má být veřejné.
 *
 * Proč to existuje: Cloudflare Pages nahraje CELÝ výstupní adresář a `.assetsignore`
 * ignoruje (ověřeno 2026-08-25 — CLAUDE.md, schema.sql i 2,8MB data/d1-seed.sql
 * skončily veřejně na webu). Jediná spolehlivá cesta je nedat je do výstupu vůbec.
 *
 * Pozor: functions/ sem NEPATŘÍ. Pages je bere z kořene projektu zvlášť.
 */
const fs = require("fs");
const path = require("path");

const KOREN = process.cwd();
const OUT = path.join(KOREN, "dist");

// Co jde ven. Cokoli tu není, se na web nedostane.
const SOUBORY = ["hra.html", "landing.html", "quiz.js", "quiz.css", "online.js"];
const SLOZKY = ["assets", "img", "data/questions", "data/cards"];
const JEDNOTLIVE = ["data/fondy.json"];

function kopiruj(zdroj, cil) {
  fs.mkdirSync(path.dirname(cil), { recursive: true });
  fs.copyFileSync(zdroj, cil);
}

function kopirujStrom(rel) {
  const zdroj = path.join(KOREN, rel);
  if (!fs.existsSync(zdroj)) { console.warn("  ! chybí, přeskakuji: " + rel); return 0; }
  let n = 0;
  for (const polozka of fs.readdirSync(zdroj, { withFileTypes: true })) {
    const dilRel = path.join(rel, polozka.name);
    if (polozka.isDirectory()) { n += kopirujStrom(dilRel); }
    else { kopiruj(path.join(KOREN, dilRel), path.join(OUT, dilRel)); n++; }
  }
  return n;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let celkem = 0;
for (const f of [...SOUBORY, ...JEDNOTLIVE]) {
  const zdroj = path.join(KOREN, f);
  if (!fs.existsSync(zdroj)) { console.warn("  ! chybí, přeskakuji: " + f); continue; }
  kopiruj(zdroj, path.join(OUT, f)); celkem++;
}
for (const s of SLOZKY) celkem += kopirujStrom(s);

// Kořen webu musí appku podat taky — kdo napíše holou doménu, nesmí dostat 404.
// hra.html je podle CLAUDE.md domovská stránka, tak z ní uděláme i index.html.
fs.copyFileSync(path.join(KOREN, "hra.html"), path.join(OUT, "index.html"));
celkem++;

console.log("dist/ hotov: " + celkem + " souborů");
