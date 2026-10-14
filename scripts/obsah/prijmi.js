"use strict";
/**
 * Přejímka dávky otázek od agentů: zkontroluje, co přišlo, a teprve pak to pustí do fondu.
 *
 * Proč: `npm run validate` běží až NAD fondem, takže by špatnou dávku odhalil, když už je
 * v datech. Tady se chyby chytají dřív, po zemích; soubor se do `data/questions/` nezapíše
 * vůbec, dokud nemá nula chyb.
 *
 *   node scripts/obsah/prijmi.js                  — jen zkontroluje a vypíše
 *   node scripts/obsah/prijmi.js --zapis          — zapíše čisté země do data/questions/<cc>.json
 *   node scripts/obsah/prijmi.js --zapis --jen=pl,ua   — jen vyjmenované země (ostatní ještě běží)
 *   node scripts/obsah/prijmi.js --vse            — vypíše VŠECHNA varování (jinak prvních 6 na zemi)
 *
 * Pracovní složka `.obsah/` je gitignorovaná: `nove/` (dodávky agentů), `hotovo/` (už zapsané),
 * `kontext/` (výpisy existujících otázek). Viz README.md vedle tohoto souboru.
 */
const fs = require("fs");
const path = require("path");

const KOREN = path.resolve(__dirname, "..", "..");
const PRACE = path.join(KOREN, ".obsah");
const NOVE = path.join(PRACE, "nove");
const HOTOVO = path.join(PRACE, "hotovo");
const QDIR = path.join(KOREN, "data", "questions");
const POCET = 40;                                  // přesně tolik otázek na dodávku

const argv = process.argv.slice(2);
const zapis = argv.includes("--zapis");
const vse = argv.includes("--vse");
const jenArg = argv.find(a => a.startsWith("--jen="));
const JEN = jenArg ? new Set(jenArg.slice(6).split(",")) : null;

const SEKCE = ["Místa", "Příroda", "Lidé", "Kultura & tradice", "Umění", "Sport",
               "Jazyk & slova", "Jídlo", "Historie"];
const POVINNA = ["id", "cc", "country", "section", "difficulty", "type", "question",
                 "answer", "distractors", "quip_correct", "quip_wrong", "explanation",
                 "about", "more_fact", "irony_prompt"];

// Konec českého slova: JS \b zná jen ASCII, takže za slovem musí být lookahead.
const NEPISMENO = "(?![a-zá-žA-ZÁ-Ž])";
// 2. osoba minulého času (rod) — appka nezná pohlaví hráče.
const ROD = /\S*l[aoiy]?\s+(jsi|ses|sis)\b/i;
// Stažený tvar „uhodls", „věděls" — nese osobu i rod v jednom slově.
const SLOVESA = ["uhodl", "věděl", "trefil", "poznal", "zvládl", "dal", "měl", "byl",
                 "tipl", "myslel", "zkusil", "netrefil", "spletl", "prospal", "zapomněl"];
const STAZENY = new RegExp("\\b(" + SLOVESA.join("|") + ")s" + NEPISMENO, "i");
// „Tys to věděl!" — stažené „ty jsi" + opotřebovaný opener (62 % dětských hlášek, zápis 2026-09-02).
// Ani ROD, ani STAZENY ho nechytí (chybí sloveso v minulém čase se „-s"), a tak proklouzl až do auditu.
const TYS = new RegExp("(?<![a-zá-žA-ZÁ-Ž])tys" + NEPISMENO, "i");
const velkePismeno = s => !/^[a-záčďéěíňóřšťúůýž]/.test(String(s || "").trim());

// Slova, která si v ilustraci vyžádají nápis — I V ZÁPORU („no banners" je past, viz CLAUDE.md).
// Dřív tu byla výjimka „je-li v promptu blank/bare, zápor je v pořádku" a ta pustila
// plaque/banner/signs/written/scoreboard v záporu přesně tak, jak to projekt už dvakrát zaplatil.
// „board" záměrně není: prkénko a šachovnice jsou neškodné.
const RIZIKO = /\b(sign|signpost|label|text|letter|lettering|word|written|writing|banner|newspaper|scoreboard|plaque|menu|inscription|caption)(s|es|ing|ed)?\b/gi;
// „dominating" ztrácí koncové „e" (dominate → dominating); „the scene" je stejně platný konec.
const DOMINANTA = /fill(s|ing)? the (frame|scene)|domina(tes?|ting) the (frame|scene)|centre of the frame|center of the frame/i;

if (!fs.existsSync(NOVE)) {
  console.log("Složka .obsah/nove zatím neexistuje — agenti ještě nedoručili (viz scripts/obsah/README.md).");
  process.exit(0);
}

// všechna existující id ve fondu — kvůli kolizím napříč zeměmi
const uzJe = new Map();
for (const f of fs.readdirSync(QDIR).filter(f => f.endsWith(".json"))) {
  for (const q of JSON.parse(fs.readFileSync(path.join(QDIR, f), "utf8"))) uzJe.set(q.id, f);
}

// Bereme JEN soubory pojmenované kódem země; agenti si práci často dělí do pracovních částí
// (`part1.json`, `_p1.json`) a ty nejsou hotová dodávka.
const ZEME = new Set(fs.readdirSync(QDIR).filter(f => f.endsWith(".json")).map(f => f.replace(/\.json$/, "")));
const soubory = fs.readdirSync(NOVE).filter(f => f.endsWith(".json")).sort();
const rozpracovane = soubory.filter(f => !ZEME.has(f.replace(/\.json$/, "")));
if (rozpracovane.length) console.log("(přeskakuji rozpracované části: " + rozpracovane.join(", ") + ")\n");

const souhrn = [];
for (const f of soubory.filter(f => ZEME.has(f.replace(/\.json$/, "")))) {
  const cc = f.replace(/\.json$/, "");
  const chyby = [], varovani = [];
  let qs;
  try { qs = JSON.parse(fs.readFileSync(path.join(NOVE, f), "utf8")); }
  catch (e) { souhrn.push({ cc, pocet: 0, chyby: ["nejde načíst JSON: " + e.message], varovani: [] }); continue; }
  if (!Array.isArray(qs)) { souhrn.push({ cc, pocet: 0, chyby: ["kořen není pole"], varovani: [] }); continue; }

  // Scratchpad je sdílený s agenty, takže přejímka může soubor potkat rozepsaný.
  if (qs.length !== POCET) chyby.push(`dodávka má ${qs.length} otázek, čekám ${POCET} (rozepsaná?)`);

  const pasma = { deti: 0, starsi: 0, dospeli: 0 };
  const idVDavce = new Set();
  const odpovedi = new Set();

  for (const q of qs) {
    const kde = q.id || "(bez id)";
    for (const p of POVINNA) if (q[p] === undefined || q[p] === "") chyby.push(`${kde}: chybí ${p}`);
    if (q.type !== "choice") chyby.push(`${kde}: type není "choice"`);
    if (q.cc !== cc) chyby.push(`${kde}: cc je "${q.cc}", čekám "${cc}"`);
    if (!SEKCE.includes(q.section)) chyby.push(`${kde}: neznámá sekce "${q.section}"`);
    if (!/^[a-z0-9-]+$/.test(q.id || "")) chyby.push(`${kde}: id není ASCII slug`);
    if (uzJe.has(q.id)) chyby.push(`${kde}: id už je ve fondu (${uzJe.get(q.id)})`);
    if (idVDavce.has(q.id)) chyby.push(`${kde}: id se v dávce opakuje`);
    idVDavce.add(q.id);
    // Agenti kopírovali z kontextu příznak serverového fondu — nová otázka ho NESMÍ mít.
    if (q.online_only) chyby.push(`${kde}: online_only — to je jen PŮVODNÍ serverový fond, nová otázka ho mít nesmí`);

    if (!Array.isArray(q.distractors) || q.distractors.length !== 3)
      chyby.push(`${kde}: distractors není pole tří možností`);
    else if (q.distractors.some(d => d === q.answer)) chyby.push(`${kde}: distraktor je shodný s odpovědí`);

    const texty = { question: q.question, answer: q.answer, quip_correct: q.quip_correct,
                    quip_wrong: q.quip_wrong, explanation: q.explanation, more_fact: q.more_fact };
    for (const [pole, v] of Object.entries(texty)) {
      if (!velkePismeno(v)) chyby.push(`${kde}: ${pole} začíná malým písmenem`);
      if (ROD.test(v || "")) chyby.push(`${kde}: ${pole} má minulý čas s rodem`);
      if (STAZENY.test(v || "")) chyby.push(`${kde}: ${pole} má stažený tvar s rodem`);
      if (TYS.test(v || "")) chyby.push(`${kde}: ${pole} obsahuje „tys" (stažené „ty jsi", opotřebovaný opener)`);
    }
    for (const d of q.distractors || []) if (!velkePismeno(d)) chyby.push(`${kde}: distraktor začíná malým písmenem`);

    // odpověď nesmí být v zadání
    const odp = String(q.answer || "").toLowerCase();
    if (odp.length > 5 && String(q.question || "").toLowerCase().includes(odp))
      chyby.push(`${kde}: odpověď je přímo v zadání`);

    // odpověď vyčnívající délkou = nápověda zdarma
    const dl = (q.distractors || []).map(d => String(d).length);
    if (dl.length && String(q.answer || "").length > Math.max(...dl) * 2)
      varovani.push(`${kde}: odpověď je výrazně delší než distraktory`);

    const mf = String(q.more_fact || "");
    if (mf && (mf.length < 110 || mf.length > 240))
      varovani.push(`${kde}: more_fact má ${mf.length} znaků (chce 110–240)`);
    if (/^(zajímav|kromě toho|navíc stojí|je zajímavé)/i.test(mf))
      varovani.push(`${kde}: more_fact začíná uvozovací vatou`);

    // irony_prompt: dominanta, mood, žádné slovo, které si vyžádá nápis
    const ip = q.irony_prompt || "";
    if (!DOMINANTA.test(ip)) varovani.push(`${kde}: irony_prompt nemá pojmenovanou dominantu`);
    if (!/MOOD:/.test(ip)) varovani.push(`${kde}: irony_prompt nemá řádek MOOD`);
    const riziko = ip.match(RIZIKO);
    if (riziko) varovani.push(`${kde}: irony_prompt má slovo, které si vyžádá nápis (${[...new Set(riziko.map(s => s.toLowerCase()))].join(", ")}) — i v záporu`);

    if (odpovedi.has(odp)) varovani.push(`${kde}: stejná odpověď jako jiná otázka v dávce`);
    odpovedi.add(odp);

    if (q.kids === true) pasma.deti++;
    else if (q.difficulty <= 2) pasma.starsi++;
    else pasma.dospeli++;
  }

  souhrn.push({ cc, pocet: qs.length, pasma, chyby, varovani, qs });
}

let cistych = 0, celkem = 0;
for (const s of souhrn) {
  const stav = s.chyby.length ? "CHYBY " + s.chyby.length : "ok";
  const p = s.pasma ? ` [${s.pasma.deti}/${s.pasma.starsi}/${s.pasma.dospeli}]` : "";
  console.log(`${s.cc}: ${s.pocet} otázek${p} — ${stav}${s.varovani.length ? ", varování " + s.varovani.length : ""}`);
  for (const c of s.chyby.slice(0, 8)) console.log("    ✗ " + c);
  if (s.chyby.length > 8) console.log(`    … a dalších ${s.chyby.length - 8}`);
  const kolik = vse ? s.varovani.length : 6;
  for (const v of s.varovani.slice(0, kolik)) console.log("    · " + v);
  if (s.varovani.length > kolik) console.log(`    … a dalších ${s.varovani.length - kolik} varování (spusť s --vse)`);

  if (!s.chyby.length && s.qs && (!JEN || JEN.has(s.cc))) {
    cistych++; celkem += s.pocet;
    if (zapis) {
      const cil = path.join(QDIR, s.cc + ".json");
      const stavFondu = JSON.parse(fs.readFileSync(cil, "utf8"));
      const spojene = stavFondu.concat(s.qs);
      // Formát fondu je 1 mezera + CRLF (CLAUDE.md) — jinak se přeformátuje celý soubor.
      fs.writeFileSync(cil, JSON.stringify(spojene, null, 1).replace(/\n/g, "\r\n"), "utf8");
      // Dodávka se odsune do hotovo/, ať ji další běh s --zapis nepřidá do fondu podruhé.
      fs.mkdirSync(HOTOVO, { recursive: true });
      fs.renameSync(path.join(NOVE, s.cc + ".json"), path.join(HOTOVO, s.cc + ".json"));
      console.log(`    → zapsáno, ${s.cc}.json má teď ${spojene.length} otázek (dodávka odsunuta do hotovo/)`);
    }
  }
}
console.log(`\n${cistych} z ${souhrn.length} zemí bez chyb, ${celkem} otázek${zapis ? " ZAPSÁNO" : " připraveno (spusť s --zapis)"}`);
