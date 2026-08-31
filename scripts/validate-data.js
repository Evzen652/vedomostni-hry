// Validátor dat a assetů kvízu. Spouštět z kořene repa: node <cesta>/validate.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = process.cwd();
const P = (...a) => path.join(ROOT, ...a);
const problems = [], warns = [];
const bad = m => problems.push(m);
const warn = m => warns.push(m);
const exists = p => fs.existsSync(P(p));

// ---- otázky ----
const QDIR = P("data", "questions");
const qFiles = fs.existsSync(QDIR) ? fs.readdirSync(QDIR).filter(f => f.endsWith(".json")) : [];
const seenIds = new Set();
let qCount = 0;
const REQ = ["id", "cc", "country", "section", "difficulty", "type", "question", "explanation"];

for (const f of qFiles) {
  let list;
  try { list = JSON.parse(fs.readFileSync(path.join(QDIR, f), "utf8")); }
  catch (e) { bad(`${f}: nevalidní JSON — ${e.message}`); continue; }
  if (!Array.isArray(list)) { bad(`${f}: kořen není pole`); continue; }
  list.forEach((q, i) => {
    qCount++;
    const where = `${f}[${i}] ${q.id || "(bez id)"}`;
    for (const k of REQ) if (q[k] === undefined || q[k] === "") bad(`${where}: chybí pole "${k}"`);
    if (q.id) { if (seenIds.has(q.id)) bad(`${where}: duplicitní id`); seenIds.add(q.id); }
    // Id není jen klíč — je z něj i název souboru `img/{id}.jpg` a kus URL. Pět otázek
    // mělo v id diakritiku (`de-k-preclík`, `pe-q-fútbol`…), protože slug vznikl z české
    // věty bez odstranění háčků. Lokálně se to načte, ale na hostingu jde o zbytečné
    // riziko kolem kódování názvů souborů — a všech ostatních 3 737 id je ASCII.
    if (q.id && !/^[a-z0-9-]+$/.test(q.id))
      bad(`${where}: id smí obsahovat jen malá písmena bez diakritiky, číslice a pomlčky`);
    if (!q.about) bad(`${where}: chybí "about" (6. pád pro tlačítko „Více o…") — viz CLAUDE.md`);
    if (q.difficulty != null && ![1, 2, 3].includes(q.difficulty)) bad(`${where}: difficulty=${q.difficulty}, čekáno 1–3`);

    // jediný podporovaný typ je "choice" (výběr ze 4) — appka žádný jiný nenabízí
    if (q.type !== "choice") bad(`${where}: type "${q.type}", čekáno "choice"`);
    if (!q.answer) bad(`${where}: chybí "answer"`);
    if (!Array.isArray(q.distractors) || q.distractors.length < 1) bad(`${where}: chybí distraktory`);
    else {
      const all = [q.answer, ...q.distractors].map(String);
      if (new Set(all).size !== all.length) bad(`${where}: odpověď se opakuje mezi distraktory`);
      if (q.distractors.length !== 3) warn(`${where}: ${q.distractors.length} distraktory (jinde 3 → mřížka A–D)`);
    }
    if (q.golden_wrong != null) {
      if (!(q.distractors || []).map(String).includes(String(q.golden_wrong)))
        bad(`${where}: golden_wrong "${q.golden_wrong}" není mezi distraktory → nedá se zvolit`);
      if (!q.golden_quip) bad(`${where}: golden_wrong bez golden_quip`);
    }
    for (const k of Object.keys(q.distractor_quips || {}))
      if (!(q.distractors || []).map(String).includes(String(k)))
        bad(`${where}: distractor_quips má klíč "${k}", který mezi distraktory není`);

    if (!q.quip_correct) warn(`${where}: chybí quip_correct`);
    if (!q.quip_wrong) warn(`${where}: chybí quip_wrong`);
    if (!exists(path.join("img", q.id + ".jpg"))) warn(`${where}: chybí fotka img/${q.id}.jpg`);
    if (!q.image_prompt) warn(`${where}: chybí image_prompt (zadání pro fotku)`);
  });
}

// ---- karty ----
const CDIR = P("data", "cards");
const cardIds = new Set();
for (const f of (fs.existsSync(CDIR) ? fs.readdirSync(CDIR).filter(x => x.endsWith(".json")) : [])) {
  let list;
  try { list = JSON.parse(fs.readFileSync(path.join(CDIR, f), "utf8")); }
  catch (e) { bad(`cards/${f}: nevalidní JSON — ${e.message}`); continue; }
  for (const c of list) if (c && c.id) cardIds.add(c.id);
}
// source_card musí existovat
for (const f of qFiles) {
  const list = JSON.parse(fs.readFileSync(path.join(QDIR, f), "utf8"));
  for (const q of list)
    if (q.source_card && !cardIds.has(q.source_card))
      bad(`${f} ${q.id}: source_card "${q.source_card}" v data/cards neexistuje`);
}

// ---- assety, na které se odkazuje kód ----
const js = fs.readFileSync(P("quiz.js"), "utf8");
const conts = [...js.matchAll(/\{\s*id:"([a-z]+)"\s*,\s*name:"/g)].map(m => m[1]);
const ccs = [...(js.match(/const COUNTRY_BY_CC\s*=\s*\{[^}]*\}/s) || [""])[0].matchAll(/(\w+)\s*:/g)].map(m => m[1]);
const slugs = [...(js.match(/const SECTION_SLUG\s*=\s*\{[^}]*\}/s) || [""])[0].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)].map(m => m[2]);

const assetChecks = [
  ...conts.map(id => [`assets/cont-${id}.jpg`, "dlaždice kontinentu"]),
  ...ccs.map(cc => [`assets/country-${cc}.jpg`, "dlaždice/razítko země"]),
  ...slugs.map(s => [`assets/section-${s}.jpg`, "dlaždice sekce"]),
  ["assets/section-vse.jpg", "dlaždice Vše"],
  ["assets/mode-solo.jpg", "režim sólo"], ["assets/mode-party.jpg", "režim párty"],
  ["assets/mode-school.jpg", "režim škola"],
  ["assets/logo.jpg", "logo hostitele"], ["assets/earth.jpg", "textura glóbu"],
];
for (const [p, popis] of assetChecks) if (!exists(p)) warn(`chybí asset ${p} (${popis}) — naskočí emoji fallback`);

// osiřelé obrázky v img/
const imgs = fs.existsSync(P("img")) ? fs.readdirSync(P("img")).filter(f => f.endsWith(".jpg")) : [];
const known = new Set([...seenIds, ...cardIds]);
for (const f of imgs) if (!known.has(path.basename(f, ".jpg"))) warn(`osiřelý obrázek img/${f} (žádná otázka ani karta)`);

// ---- výstup ----
console.log(`Zkontrolováno: ${qCount} otázek v ${qFiles.length} souboru/ech, ${cardIds.size} karet, ${imgs.length} obrázků.\n`);
if (problems.length) { console.log(`CHYBY (${problems.length}):`); problems.forEach(p => console.log("  ✗ " + p)); }
else console.log("CHYBY: žádné");
console.log("");
if (warns.length) { console.log(`UPOZORNĚNÍ (${warns.length}):`); warns.forEach(w => console.log("  · " + w)); }
else console.log("UPOZORNĚNÍ: žádná");
process.exit(problems.length ? 1 : 0);
