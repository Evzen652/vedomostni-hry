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
// `_headers` MUSÍ být v kořeni nasazené složky, jinak si ho Pages nevšimnou a appka
// zůstane bez CSP — pravidla v něm se nikde jinde neuplatní. (2026-09-01)
const SOUBORY = ["hra.html", "landing.html", "quiz.js", "quiz.css", "online.js", "_headers"];
const SLOZKY = ["assets", "img", "data/questions", "data/cards"];
const JEDNOTLIVE = ["data/fondy.json", "data/questions-index.json"];

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

// SERVEROVÉ OTÁZKY SE NA WEB NEDOSTANOU (2026-09-06). Fond je společný pro offline
// i online hru, takže správné odpovědi musely být v prohlížeči — a tím pádem si je
// kdokoli mohl dohledat i pro HODNOCENOU online partii. Otázky s `online_only: true`
// se proto z veřejných dat vyhazují tady, na jednom místě, až při sestavení výstupu:
// v repu i v databázi zůstávají, jen ven nejdou.
//
// Index počtů se musí přepočítat ZE ZBYLÝCH otázek, jinak by dlaždice offline hry
// slibovaly víc, než kolik jich appka doopravdy má.
let vyhozeno = 0;
const indexDist = {};
const QDIR = path.join(OUT, "data", "questions");
if (fs.existsSync(QDIR)) {
  for (const f of fs.readdirSync(QDIR).filter(f => f.endsWith(".json"))) {
    const cesta = path.join(QDIR, f);
    const qs = JSON.parse(fs.readFileSync(cesta, "utf8"));
    const verejne = qs.filter(q => q.online_only !== true);
    vyhozeno += qs.length - verejne.length;
    indexDist[f.replace(/\.json$/, "")] = verejne.length;
    // Formát fondu je 1 mezera + CRLF (CLAUDE.md) — dist není místo, kde to měnit.
    fs.writeFileSync(cesta, JSON.stringify(verejne, null, 1).replace(/\n/g, "\r\n"), "utf8");
  }
  fs.writeFileSync(path.join(OUT, "data", "questions-index.json"),
    JSON.stringify(indexDist, null, 2) + "\n", "utf8");
}

// Kořen webu musí appku podat taky — kdo napíše holou doménu, nesmí dostat 404.
// hra.html je podle CLAUDE.md domovská stránka, tak z ní uděláme i index.html.
fs.copyFileSync(path.join(KOREN, "hra.html"), path.join(OUT, "index.html"));
celkem++;

console.log("dist/ hotov: " + celkem + " souborů" +
  (vyhozeno ? " (serverových otázek vynecháno: " + vyhozeno + ")" : ""));
