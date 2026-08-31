"use strict";
/**
 * Kontrola pole `more_fact` — textu na kartě „Více o…".
 *
 * Standard z 2026-08-10: každá vrstva otázky nese něco JINÉHO. `explanation` fakt navíc,
 * hláška reakci, `more_fact` ještě jiný fakt. Nejčastější způsob, jak to pokazit, není
 * napsat nesmysl, ale napsat potřetí totéž — a to je vidět až při porovnání vrstev,
 * ne při čtení samotného faktu.
 *
 * PRAHY JSOU ZMĚŘENÉ, NE ODHADNUTÉ. Kalibrováno na 907 už napsaných faktech:
 *   překryv kmenů s ostatními vrstvami — medián 20 %, 90. percentil 36 %, 99. percentil 55 %
 *   délka — medián 124 znaků, nejdelší 239
 * Práh 55 % tedy označí necelé 1 % existujícího fondu, ne jeho polovinu. Tuhle lekci
 * platil audit: kontroly nastavené od oka („dětská otázka nad 90 znaků") označily
 * medián fondu a vypadaly jako 950 nálezů, ačkoli neměřily nic.
 *
 * Druhá lekce, taky zaplacená: krátký fakt má málo kmenů, takže mu podíl skáče.
 * `cz-t-lide-heyrovsky-polarograf` má překryv 80 % a je přitom v pořádku — jsou to tři
 * slova z osmi. Proto se překryv počítá jen u faktů s aspoň 8 vlastními kmeny.
 *
 * Nic z toho není tvrdá chyba — všechno jsou UPOZORNĚNÍ k přečtení. Skript proto
 * nekončí nenulovým kódem; má říct, co si přečíst, ne zastavit pipeline.
 *
 *   npm run lint-facts
 *   node scripts/lint-more-facts.js --cc ca
 */
const fs = require("fs");
const path = require("path");

const PREKRYV = 0.55;     // 99. percentil existujícího fondu
const MIN_KMENU = 8;      // pod tím je podíl nespolehlivý (viz komentář výše)
const MIN_ZNAKU = 60;
const MAX_ZNAKU = 300;

// Uvozovací vata: fakt má začít věcí, ne obřadem. Fráze schválně kotvené na začátek.
// POZOR na `\w` a `\b`: v JS jsou to jen ASCII, takže `zajímav\w*` NEPOKRYJE „zajímavé"
// — `\w*` se zastaví před „é" a celý vzor selže. Stejná past už projekt jednou stála
// falešný výsledek u kontroly diakritiky (2026-08-24). Proto všude `\S*`, ne `\w*`.
const VATA = [
  /^zajímav\S*\s+je/i, /^je\s+zajímav\S*/i, /^věděl\S*\s+jste/i, /^kromě\s+toho/i,
  /^mimochodem/i, /^stojí\s+za\s+zmínku/i, /^za\s+zmínku\s+stojí/i, /^navíc\s+/i,
  /^nutno\s+dodat/i, /^pro\s+zajímavost/i,
];

const cc = process.argv.includes("--cc") ? process.argv[process.argv.indexOf("--cc") + 1] : null;

/** Kmeny slov: bez diakritiky, jen slova od 5 znaků, zkrácená na 5. Čeština slova ohýbá,
 *  takže porovnávat přesné tvary nemá smysl — „Kierkegaard" a „Kierkegaardovi" by nesdílely nic. */
function kmeny(t) {
  return new Set(String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/).filter(w => w.length >= 5).map(w => w.slice(0, 5)));
}

const hlaskaText = h => (typeof h === "string" ? h : Object.values(h || {}).filter(v => typeof v === "string").join(" "));

const dir = path.join(process.cwd(), "data", "questions");
const nalezy = [];
let sFaktem = 0, bezHloubky = 0, celkem = 0;

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  if (cc && f !== cc + ".json") continue;
  for (const q of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) {
    celkem++;
    if (!q.more_fact) { if (!q.source_card) bezHloubky++; continue; }
    sFaktem++;
    const t = String(q.more_fact).trim();
    const pridej = (kod, popis) => nalezy.push({ kod, id: q.id, popis, t });

    if (t.length < MIN_ZNAKU) pridej("kratky", "jen " + t.length + " znaků — vyzní jako titulek");
    if (t.length > MAX_ZNAKU) pridej("dlouhy", t.length + " znaků — na kartu se nevejde");
    for (const v of VATA) if (v.test(t)) { pridej("vata", "začíná uvozovací frází"); break; }
    if (/[a-z]/.test(t) && !/[áčďéěíňóřšťúůýž]/i.test(t)) pridej("bez_diakritiky", "žádná diakritika v celém textu");
    if (!/[.!?]$/.test(t)) pridej("bez_tecky", "nekončí větnou tečkou");

    const a = kmeny(t);
    if (a.size >= MIN_KMENU) {
      const b = kmeny([q.question, q.answer, q.explanation,
        hlaskaText(q.quip_correct), hlaskaText(q.quip_wrong)].join(" "));
      let spolecnych = 0;
      for (const k of a) if (b.has(k)) spolecnych++;
      const p = spolecnych / a.size;
      if (p > PREKRYV) pridej("opakuje", "překryv " + Math.round(p * 100) + " % s ostatními vrstvami otázky");
    }
  }
}

const podleKodu = {};
for (const n of nalezy) (podleKodu[n.kod] = podleKodu[n.kod] || []).push(n);

console.log("otázek: " + celkem + "   s `more_fact`: " + sFaktem +
  "   bez hloubky (ani karta, ani fakt): " + bezHloubky);

if (!nalezy.length) { console.log("\nŽádné upozornění."); process.exit(0); }

const POPIS = {
  opakuje: "Fakt opakuje to, co hráč právě četl. Přepsat na JINÝ fakt, ne na jinou formulaci téhož.",
  kratky: "Příliš krátké — karta má být odměna za zvědavost.",
  dlouhy: "Příliš dlouhé na kartu.",
  vata: "Uvozovací fráze na začátku. Rovnou k věci.",
  bez_diakritiky: "Nejspíš text psaný bez háčků a čárek.",
  bez_tecky: "Chybí koncová interpunkce (často useknutý text).",
};

for (const [kod, list] of Object.entries(podleKodu).sort((a, b) => b[1].length - a[1].length)) {
  console.log("\n" + kod + "  (" + list.length + ")  " + (POPIS[kod] || ""));
  for (const n of list.slice(0, 6)) console.log("  " + n.id + " — " + n.popis + "\n    " + n.t.slice(0, 150));
  if (list.length > 6) console.log("  … a dalších " + (list.length - 6));
}

console.log("\nCelkem " + nalezy.length + " upozornění u " + new Set(nalezy.map(n => n.id)).size + " otázek.");
console.log("Jsou to upozornění, ne chyby — přečíst a posoudit, ne opravovat podle počtu.");
