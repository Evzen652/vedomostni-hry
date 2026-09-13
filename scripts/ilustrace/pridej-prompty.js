// Doplní `irony_prompt` otázkám, které ho ještě nemají. Vstup: {id: "scéna…"}.
// Existující zadání NEPŘEPÍŠE (celá dávka se zastaví a nezapíše se NIC — když to nahlásí,
// vyhoď z vstupního souboru ta id a spusť znovu). Formát (1 mezera + CRLF) se ověřuje
// round-tripem před zápisem, stejně jako v aplikuj.js.
//   node scripts/ilustrace/pridej-prompty.js xx-prompty.json
const fs = require("fs");
const path = require("path");
const KOREN = path.join(path.resolve(__dirname, "..", ".."), "data", "questions");
const vstupSoubor = process.argv[2];
if (!vstupSoubor) throw new Error("chybí soubor se zadáními");
const vstup = JSON.parse(fs.readFileSync(vstupSoubor, "utf8"));

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
for (const [id, t] of Object.entries(vstup)) {
  const hit = podleId.get(id);
  if (!hit) chyby.push("neznámé id " + id);
  else if (hit.q.irony_prompt) chyby.push(id + ": zadání už existuje, nepřepisuji");
  else if (typeof t !== "string" || t.trim().length < 80) chyby.push(id + ": zadání chybí nebo je moc krátké");
}
if (chyby.length) { console.log("NIC NEZAPSÁNO:"); chyby.forEach(c => console.log("  " + c)); process.exit(1); }
for (const [id, t] of Object.entries(vstup)) { const { q, s } = podleId.get(id); q.irony_prompt = t.trim(); s.zmena++; }
let n = 0;
for (const s of Object.values(soubory)) if (s.zmena) { fs.writeFileSync(s.p, s.ser(s.arr), "utf8"); n += s.zmena; }
console.log("doplněno " + n + " zadání");
