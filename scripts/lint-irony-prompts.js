"use strict";
/**
 * Kontrola ironických promptů (pole `irony_prompt`) DŘÍV, než se z nich stanou obrázky.
 *
 * Proč to existuje: obrázek stojí ~$0,034, prompt ~$0,003. Vadný prompt tedy zahodí
 * desetinásobek toho, co stál — a pasti z CLAUDE.md jsou SYSTEMATICKÉ, ne náhodné
 * (v dávce pro Česko postihly celou kategorii jazykových otázek, ~6 z 54). Levný
 * deterministický průchod je proto nejlepší investice v celém řetězci.
 *
 * Spuštění:
 *   node scripts/lint-irony-prompts.js                 # zkontroluje data/questions/*.json
 *   node scripts/lint-irony-prompts.js soubor.json     # zkontroluje { id: "prompt", ... }
 */
const fs = require("fs");
const path = require("path");

// --- Past 1: prompt, který si řekne o písmena, dostane ČMÁRANICI. -----------------
// Stylový recept zakazuje text, takže model nedokáže sladit „napiš slovo" se zákazem
// a vyrobí nesmyslná obrácená písmena. Ověřeno na dávce Česka (~6 z 54 otázek).
const TEXT_PASTI = /\b(text|texts|word|words|letter|letters|letterform|writing|written|write|inscription|inscribed|caption|label|labell?ed|signage|slogan|title|headline|alphabet|spelling|spelled|handwriting|calligraphy)\b/i;
// „blank / empty / no writing" je naopak žádoucí — vtip o textu bez textu.
const TEXT_VYJIMKA = /\b(blank|empty|wordless|no writing|nothing on it|entirely blank|completely blank)\b/i;

// --- Past 2: u jídla popsat TVAR, ne jen název. ------------------------------------
// „cone overflowing with crispy fries" dalo dvakrát ZMRZLINU. Pomohl až popis tvaru.
// Seznam se rozšířil poté, co kontrola nahlásila 25 nálezů a VŠECHNY byly plané:
// prompty tvar popisovaly, jen slovy, která tu chyběla („slice of bread", „thick paste",
// „shreds of cabbage", „square block of cheese", „cone-shaped flower"). Obecné „shaped like"
// je tu schválně — je to nejsilnější signál, že tvar někdo popsal.
// „square", „sheet" a „strip" tu NEJSOU: chytaly se na kulisách („a sunny square“,
// „a sheet of paper“) a kontrola pak propustila i prompt úplně bez tvaru jídla.
// Nádoby na PITÍ (glass/mug/bottle/…) se počítají taky: u tekutiny nese tvar sklenice.
// Obecné servírovací nádobí (plate, bowl, dish) tu schválně NENÍ — to zmiňuje skoro
// každý prompt o jídle a kontrola by přestala mít smysl.
const TVAR = /\b(round|circular|flat|disc|discs|sphere|spheres|spherical|oval|cylinder|cylindrical|stick|sticks|rectangular|layered|layers|cluster|clusters|kidney-shaped|ball|balls|slab|wedge|ring|rings|strand|strands|cube|cubes|husk|husks|crescent|braided|folded|stacked|slice|slices|shred|shreds|shredded|block|lump|lumps|paste|dumpling|dumplings|cone-shaped|shaped like|coil|coiled|stringy|batter|loaf|mound|grated|cross-section|triangular|knot|knots|patty|roll|rolled|pellet|granule|granules|stew|foam)\b/i;

// --- Past 3: Gemini odmítá kreslit reálné veřejné osoby. --------------------------
// Řešení je opsat na obecnou postavu — prompt tedy nesmí chtít podobu konkrétního člověka.
// Holé „celebrity" tu bylo a chytalo nevinné „treating him like a celebrity" — což je
// popis DAVU, ne požadavek na podobu konkrétního člověka. Zbylé vzory míří na skutečné riziko.
const OSOBA = /\b(portrait of|likeness of|photorealistic face of|lookalike)\b/i;

// --- Past 4: chybí dominanta. -----------------------------------------------------
// Bez jednoho velkého hrdiny udělá model koláž vinětek, kde vtip ve zmenšené dlaždici zanikne.
// „the entire frame" / „the whole frame" musí projít taky — jinak to hlásí plané poplachy
// na promptech, které dominantu pojmenovávají úplně jasně.
const DOMINANTA = /\b(fill(s|ing)? the (entire |whole )?((centre|center) of the )?frame|(centre|center)[- ]frame|(centre|center) of the frame|dominat(e|es|ing) the frame|foreground)\b/i;

const MIN_ZNAKU = 120, MAX_ZNAKU = 700;

function zkontroluj(id, prompt, sekce) {
  const chyby = [], varovani = [];
  if (typeof prompt !== "string" || !prompt.trim()) { chyby.push("prázdný prompt"); return { chyby, varovani }; }

  const m = prompt.match(TEXT_PASTI);
  if (m && !TEXT_VYJIMKA.test(prompt)) chyby.push(`říká si o text („${m[0]}") → model vyrobí čmáranici`);

  if (OSOBA.test(prompt)) chyby.push("chce podobu konkrétní osoby → Gemini odmítne, opiš na obecnou postavu");

  // Tvar se hledá jen v PRVNÍ VĚTĚ, kde podle receptu stojí dominanta. Hledání v celém
  // promptu bylo k ničemu: „cone overflowing with crispy fries" prošlo jen proto, že se
  // ve vedlejším gagu vyskytl „folded newspaper". Kontrola má hlídat tvar JÍDLA, ne kulis.
  // VAROVÁNÍ, ne chyba — a je to vědomé rozhodnutí, ne úlitba. Seznam slov umí spolehlivě
  // najít, že si prompt ŘEKL o text (past 1); neumí ale poznat, že popis tvaru CHYBÍ.
  // Ověřeno třemi koly ladění: pokaždé se objevila další legitimní slova („meat cylinders",
  // „dough pillows", „potato pancake", „bone-in ham", „pot shaped like a plum") a po jejich
  // doplnění zase propadl i prompt úplně bez tvaru, protože se slovo chytlo na kulise.
  // Zůstává jako vodítko k ruční kontrole — pilot ukázal, že generované prompty tvar
  // popisují spolehlivě (8 z 8 jídel vyšlo správně).
  const prvniVeta = String(prompt).split(/(?<=[.!?])\s/)[0];
  if (/jídlo/i.test(sekce || "") && !TVAR.test(prvniVeta))
    varovani.push("jídlo bez zjevného popisu TVARU — projdi očima, jestli je z první věty poznat, co to je");

  if (!DOMINANTA.test(prompt)) varovani.push("nepojmenovaná dominanta → hrozí koláž vinětek bez středu");

  if (prompt.length < MIN_ZNAKU) varovani.push(`krátké (${prompt.length} znaků) — chybí nejspíš vedlejší gagy`);
  if (prompt.length > MAX_ZNAKU) varovani.push(`dlouhé (${prompt.length} znaků) — model začne vypouštět`);

  return { chyby, varovani };
}

// ---- načtení vstupu --------------------------------------------------------------
const arg = process.argv[2];
let polozky = [];   // {id, prompt, sekce}
if (arg) {
  const j = JSON.parse(fs.readFileSync(arg, "utf8"));
  const sekce = {};
  const dir = path.join(process.cwd(), "data", "questions");
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".json")) for (const q of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) sekce[q.id] = q.section;
  }
  // klíče začínající `_` jsou poznámky v souboru, ne prompty
  polozky = Object.entries(j).filter(([id]) => !id.startsWith("_"))
    .map(([id, prompt]) => ({ id, prompt, sekce: sekce[id] }));
} else {
  const dir = path.join(process.cwd(), "data", "questions");
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    for (const q of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
      if (q.irony_prompt) polozky.push({ id: q.id, prompt: q.irony_prompt, sekce: q.section });
  }
}

let chybnych = 0, varovanych = 0;
for (const p of polozky) {
  const { chyby, varovani } = zkontroluj(p.id, p.prompt, p.sekce);
  if (chyby.length) { chybnych++; console.log(`CHYBA  ${p.id} [${p.sekce || "?"}]`); for (const c of chyby) console.log("        - " + c); }
  else if (varovani.length) { varovanych++; console.log(`varuji ${p.id} [${p.sekce || "?"}]`); for (const v of varovani) console.log("        - " + v); }
}
console.log(`\nzkontrolováno ${polozky.length}: ${chybnych} chyb, ${varovanych} varování, ${polozky.length - chybnych - varovanych} v pořádku`);
process.exit(chybnych ? 1 : 0);
