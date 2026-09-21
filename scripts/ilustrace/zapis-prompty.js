// Zapíše zadání obrázků (irony_prompt) z mapy { id: zadání } do data/questions/{cc}.json.
// Drží formát souboru (odsazení 1 mezerou + CRLF) — když round-trip nesedí, nezapíše nic.
//   node scripts/ilustrace/zapis-prompty.js ph cesta/k/ph-prompty.json
// Vypíše, kolik zapsal, a které otázky té země zadání pořád nemají (ty s hotovým
// obrázkem ho mít nemusí — submit je stejně přeskočí).
const fs = require("fs");
const path = require("path");
const KOREN = path.resolve(__dirname, "..", "..");
const [cc, zdroj] = process.argv.slice(2);
if (!cc || !zdroj) throw new Error("node zapis-prompty.js <cc> <prompty.json>");
const soubor = path.join(KOREN, "data", "questions", cc + ".json");
const puvodni = fs.readFileSync(soubor, "utf8");
const qs = JSON.parse(puvodni);
const konecRadku = puvodni.endsWith("\r\n") ? "\r\n" : "";
const zapis = () => JSON.stringify(qs, null, 1).replace(/\n/g, "\r\n") + konecRadku;
if (zapis() !== puvodni) { console.error("Round-trip nesedí, nezapisuji."); process.exit(1); }
const prompty = JSON.parse(fs.readFileSync(zdroj, "utf8"));
let n = 0;
for (const [id, p] of Object.entries(prompty)) {
  const q = qs.find(x => x.id === id);
  if (!q) { console.error("chybí otázka " + id); process.exit(1); }
  q.irony_prompt = p; n++;
}
const bez = qs.filter(q => !q.irony_prompt).map(q => q.id);
fs.writeFileSync(soubor, zapis(), "utf8");
console.log("zapsáno " + n + ", bez zadání: " + (bez.length ? bez.join(", ") : "žádná"));
