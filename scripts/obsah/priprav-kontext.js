"use strict";
/**
 * Připraví pro každou zemi kontextový soubor `.obsah/kontext/<cc>.txt`: co už ve fondu je,
 * ať agent neduplikuje. Duplicity jsou u tohohle úkolu hlavní riziko (v srpnu 2026 jich
 * při 450 otázkách vzniklo 19).
 *
 * Otázky serverového fondu (`online_only`) jsou ve výpisu označené — agenti je mají
 * VYNECHAT jako téma, ale nesmí na ně sahat ani kopírovat jejich příznak. Bez označení si
 * agenti příznak opakovaně pletli s „vzorem, který se má napodobit".
 *
 *   node scripts/obsah/priprav-kontext.js
 */
const fs = require("fs");
const path = require("path");

const KOREN = path.resolve(__dirname, "..", "..");
const QDIR = path.join(KOREN, "data", "questions");
const OUT = path.join(KOREN, ".obsah", "kontext");
fs.mkdirSync(OUT, { recursive: true });

const pasmo = q => q.kids ? "děti" : (q.difficulty <= 2 ? "puberťáci" : "dospělí");
const prehled = [];

for (const f of fs.readdirSync(QDIR).filter(f => f.endsWith(".json"))) {
  const cc = f.replace(/\.json$/, "");
  const qs = JSON.parse(fs.readFileSync(path.join(QDIR, f), "utf8"));
  const zeme = qs[0] ? qs[0].country : cc;

  const pocty = { "děti": 0, "puberťáci": 0, "dospělí": 0 };
  const radky = qs.map(q => {
    pocty[pasmo(q)]++;
    const znacka = q.online_only ? " [SERVEROVÝ FOND — nesahat, nekopírovat příznak]" : "";
    return `${q.id} [${pasmo(q)}/${q.section}]${znacka} ${q.question} → ${q.answer}`;
  });

  const sekce = {};
  for (const q of qs) sekce[q.section] = (sekce[q.section] || 0) + 1;

  fs.writeFileSync(path.join(OUT, cc + ".txt"),
    `ZEMĚ: ${zeme} (kód ${cc})\n` +
    `UŽ EXISTUJE ${qs.length} otázek — děti ${pocty["děti"]}, puberťáci ${pocty["puberťáci"]}, dospělí ${pocty["dospělí"]}\n` +
    `Sekce: ${Object.entries(sekce).map(([s, n]) => s + " " + n).join(", ")}\n\n` +
    `ŽÁDNÁ NOVÁ OTÁZKA NESMÍ TESTOVAT TÝŽ FAKT JAKO KTERÁKOLI Z NICH:\n` +
    radky.join("\n") + "\n", "utf8");

  prehled.push({ cc, zeme, ma: qs.length, ...pocty });
}

prehled.sort((a, b) => a.ma - b.ma);
fs.writeFileSync(path.join(OUT, "_prehled.json"), JSON.stringify(prehled, null, 2), "utf8");
console.log(`kontext pro ${prehled.length} zemí → ${OUT}`);
console.log("nejchudší:", prehled.slice(0, 5).map(p => p.cc + ":" + p.ma).join(", "));
console.log("nejbohatší:", prehled.slice(-3).map(p => p.cc + ":" + p.ma).join(", "));
