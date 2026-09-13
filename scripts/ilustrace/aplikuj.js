// Zapíše dávku úprav do data/questions/*.json. Vstup: JSON pole {id, cesta, stare, nove}.
// `cesta` je tečková cesta v otázce (quip_wrong.dospeli, quip_correct, distractors…).
// Každá úprava MUSÍ sedět na současný text (stare), jinak se nezapíše nic z celé dávky.
// Formát souboru (1 mezera + CRLF) se ověřuje round-tripem PŘED zápisem.
//   node scripts/ilustrace/aplikuj.js upravy.json
const fs = require("fs");
const path = require("path");
const KOREN = path.join(path.resolve(__dirname, "..", ".."), "data", "questions");
const vstup = process.argv[2];
if (!vstup) throw new Error("chybí soubor s úpravami");
const edits = JSON.parse(fs.readFileSync(vstup, "utf8"));

const soubory = {};
for (const f of fs.readdirSync(KOREN).filter(f => f.endsWith(".json"))) {
  const p = path.join(KOREN, f), raw = fs.readFileSync(p, "utf8");
  const ser = a => JSON.stringify(a, null, 1).split("\n").join("\r\n") + (raw.endsWith("\r\n") ? "\r\n" : "");
  const arr = JSON.parse(raw);
  if (ser(arr) !== raw) throw new Error("round-trip nesedí u " + f + " — nesahám");
  soubory[f] = { p, arr, ser, zmena: 0 };
}
const podleId = new Map();
for (const s of Object.values(soubory)) for (const q of s.arr) podleId.set(q.id, { q, s });

const chyby = [];
const plan = [];
for (const e of edits) {
  const hit = podleId.get(e.id);
  if (!hit) { chyby.push("neznámé id " + e.id); continue; }
  const seg = e.cesta.split(".");
  let rodic = hit.q;
  for (const k of seg.slice(0, -1)) rodic = rodic == null ? undefined : rodic[/^\d+$/.test(k) ? +k : k];
  const klic = seg[seg.length - 1];
  const kk = /^\d+$/.test(klic) ? +klic : klic;
  if (rodic == null || !(kk in Object(rodic))) { chyby.push(e.id + " " + e.cesta + ": cesta neexistuje"); continue; }
  if (JSON.stringify(rodic[kk]) !== JSON.stringify(e.stare)) { chyby.push(e.id + " " + e.cesta + ": původní text nesedí"); continue; }
  if (typeof e.nove !== typeof e.stare || (Array.isArray(e.stare) && e.nove.length !== e.stare.length)) { chyby.push(e.id + " " + e.cesta + ": jiný tvar hodnoty"); continue; }
  plan.push(() => { rodic[kk] = e.nove; hit.s.zmena++; });
}
if (chyby.length) { console.log("NIC NEZAPSÁNO, chyby:"); chyby.forEach(c => console.log("  " + c)); process.exit(1); }
plan.forEach(f => f());
let n = 0;
for (const s of Object.values(soubory)) if (s.zmena) { fs.writeFileSync(s.p, s.ser(s.arr), "utf8"); n += s.zmena; }
console.log("zapsáno " + n + " úprav v " + Object.values(soubory).filter(s => s.zmena).length + " souborech");
