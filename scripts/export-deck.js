#!/usr/bin/env node
// Vygeneruje tiskové HTML s kartami pro daný region/zemi.
// Líc = otázka + quip_question + 4 možnosti; rub = správná odpověď + hláška + vysvětlení + QR.
// Pouziti: node scripts/export-deck.js <cc> [--url https://tvuj-web/hricka.html]
// Výstup: export/deck-<cc>.html → otevři v prohlížeči a "Tisk → Uložit jako PDF".
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const Q_DIR = path.join(ROOT, "data", "questions");
const OUT_DIR = path.join(ROOT, "export");

const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function resolveQuip(q) { if (q == null) return ""; if (typeof q === "string") return q; return q.dospeli ?? q.default ?? Object.values(q)[0] ?? ""; }

function main() {
  const args = process.argv.slice(2);
  const cc = (args.find(a => !a.startsWith("--")) || "").toLowerCase();
  const urlIdx = args.indexOf("--url");
  const APP_URL = urlIdx >= 0 ? args[urlIdx + 1] : "https://TVUJ-WEB/hricka.html";
  if (!cc) { console.error("Použití: node scripts/export-deck.js <cc> [--url https://tvuj-web/hricka.html]"); process.exit(1); }

  const file = path.join(Q_DIR, `${cc}.json`);
  if (!fs.existsSync(file)) { console.error(`Nenalezeno: ${file}`); process.exit(1); }
  let all;
  try { all = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error("Neplatný JSON: " + e.message); process.exit(1); }

  // do fyzického balíčku jdou jen výběrové otázky (4 možnosti); estimate přeskočíme
  const qs = all.filter(q => (q.type || "choice") === "choice" && q.answer && (q.distractors || []).length >= 3);
  const skipped = all.length - qs.length;
  if (!qs.length) { console.error("Žádné výběrové otázky k tisku."); process.exit(1); }
  const region = qs[0].country || cc.toUpperCase();

  // front + back karta
  const front = (q, i) => {
    const opts = shuffleStable([q.answer, ...q.distractors], q.id);
    return `<div class="card front">
      <div class="ch"><span class="reg">${esc(region)}</span><span class="num">#${i + 1}</span></div>
      <div class="q">${esc(q.question)}</div>
      ${q.quip_question ? `<div class="qq">„${esc(resolveQuip(q.quip_question))}"</div>` : ""}
      <div class="opts">${opts.map((o, k) => `<div class="opt"><b>${"ABCD"[k]}</b> ${esc(o)}</div>`).join("")}</div>
    </div>`;
  };
  const back = (q, i) => `<div class="card back">
    <div class="ch"><span class="reg">${esc(region)}</span><span class="num">#${i + 1}</span></div>
    <div class="ans">✓ ${esc(q.answer)}</div>
    <div class="bq">„${esc(resolveQuip(q.quip_correct))}"</div>
    <div class="expl">${esc(q.explanation || "")}</div>
    <div class="qrrow"><div class="qr" data-url="${esc(APP_URL)}#country=${esc(cc)}"></div><div class="qrcap">${esc(region)} v appce</div></div>
  </div>`;

  // stránky: nejdřív všechny líce, pak všechny ruby (sloupce zrcadlené kvůli oboustrannému tisku)
  const PER_PAGE = 9;      // 3×3 karet 63×88 mm na A4
  const pages = [];
  for (let p = 0; p < qs.length; p += PER_PAGE) {
    const slice = qs.slice(p, p + PER_PAGE);
    pages.push(`<div class="page">${slice.map((q, k) => front(q, p + k)).join("")}</div>`);
    // ruby: v rámci každé trojice sloupce obrátíme (překlopení po delší straně)
    const rows = [];
    for (let r = 0; r < slice.length; r += 3) rows.push(slice.slice(r, r + 3).reverse());
    const mirrored = rows.flat();
    const startIdx = slice.map((_, k) => p + k);
    const mirroredIdx = [];
    for (let r = 0; r < startIdx.length; r += 3) mirroredIdx.push(...startIdx.slice(r, r + 3).reverse());
    pages.push(`<div class="page">${mirrored.map((q, k) => back(q, mirroredIdx[k])).join("")}</div>`);
  }

  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<title>Balíček karet — ${esc(region)}</title>
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script>
<style>
  @font-face{ font-family:'Nunito'; font-style:normal; font-weight:200 1000; font-display:swap;
    src:url('../assets/fonts/nunito-latin-ext.woff2') format('woff2');
    unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
  @font-face{ font-family:'Nunito'; font-style:normal; font-weight:200 1000; font-display:swap;
    src:url('../assets/fonts/nunito-latin.woff2') format('woff2');
    unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
  @page { size: A4; margin: 8mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Nunito', sans-serif; color: #2a2018; margin: 0; }
  .note { padding: 10px 14px; font-family: 'Nunito', sans-serif; font-size: 12px; color: #555; background: #fbf3df; }
  .page { display: grid; grid-template-columns: repeat(3, 63mm); grid-auto-rows: 88mm; gap: 0; page-break-after: always; }
  .card { width: 63mm; height: 88mm; border: 1px dashed #bbb; padding: 5mm; overflow: hidden; display: flex; flex-direction: column; }
  .ch { display: flex; justify-content: space-between; font-family: 'Nunito', sans-serif; font-size: 8pt; color: #a08a5e; text-transform: uppercase; letter-spacing: .06em; }
  .q { font-size: 12pt; font-weight: 700; line-height: 1.25; margin: 3mm 0 2mm; }
  .qq { font-size: 9pt; font-style: italic; color: #7a6a52; margin-bottom: 2mm; }
  .opts { margin-top: auto; display: flex; flex-direction: column; gap: 1.4mm; }
  .opt { font-size: 10pt; border: 1px solid #ddd; border-radius: 2mm; padding: 1.4mm 2mm; }
  .opt b { color: #c0622f; }
  .back { background: #fdfaf2; }
  .ans { font-size: 13pt; font-weight: 700; color: #2a7f4f; margin: 3mm 0 2mm; }
  .bq { font-size: 10pt; font-style: italic; color: #6b5a3e; margin-bottom: 2mm; }
  .expl { font-size: 8.5pt; color: #555; line-height: 1.3; }
  .qrrow { margin-top: auto; display: flex; align-items: center; gap: 2mm; }
  .qr { width: 18mm; height: 18mm; }
  .qr img, .qr canvas, .qr table { width: 18mm !important; height: 18mm !important; }
  .qrcap { font-family: 'Nunito', sans-serif; font-size: 7.5pt; color: #999; }
  @media print { .note { display: none; } .card { border-color: #ddd; } }
</style></head><body>
<div class="note">Balíček „${esc(region)}" · ${qs.length} karet${skipped ? ` (přeskočeno ${skipped} odhadovacích)` : ""}.
  Tiskni <b>oboustranně, překlopení po delší straně, měřítko 100 %</b>, pak ořízni podle přerušovaných čar. QR míří na: ${esc(APP_URL)}#country=${esc(cc)}</div>
${pages.join("\n")}
<script>
  (function(){
    document.querySelectorAll(".qr").forEach(function(el){
      var url = el.getAttribute("data-url");
      try {
        var qr = qrcode(0, "M"); qr.addData(url); qr.make();
        el.innerHTML = qr.createImgTag(4, 0);
      } catch(e){ el.innerHTML = '<div style="font-size:6pt;word-break:break-all;color:#999">'+url+'</div>'; }
    });
  })();
</script>
</body></html>`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `deck-${cc}.html`);
  fs.writeFileSync(out, html, "utf8");
  console.log(`Vygenerováno: ${out}`);
  console.log(`Karet: ${qs.length}${skipped ? `, přeskočeno odhadovacích: ${skipped}` : ""}`);
  console.log(`Otevři v prohlížeči a dej Tisk → Uložit jako PDF. QR → ${APP_URL}#country=${cc}`);
}

// deterministické zamíchání pole podle klíče (ať líc karty má stabilní pořadí možností)
function shuffleStable(arr, key) {
  const a = arr.slice();
  let h = 0; for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

main();
