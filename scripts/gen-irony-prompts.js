"use strict";
/**
 * Napíše ironické scény (pole `irony_prompt`) k otázkám, které ho ještě nemají.
 *
 * Proč zvlášť od generátoru obrázků: prompt stojí zlomek ceny obrázku, ale rozhoduje
 * o tom, jestli obrázek za ~$0,034 bude k něčemu. Mezi tímhle krokem a generováním
 * MUSÍ proběhnout `npm run lint-irony` — chytá čtyři zdokumentované pasti dřív,
 * než se z promptů stanou peníze.
 *
 * Klíč: prostředí, nebo řádek `GEMINI_API_KEY=…` v gitignorovaném `.dev.vars`.
 *
 * Spuštění:
 *   node scripts/gen-irony-prompts.js --cc cz            # jen Česko
 *   node scripts/gen-irony-prompts.js --cc cz --limit 60 # jen prvních 60
 *   node scripts/gen-irony-prompts.js --force            # přepsat i existující
 *
 * V datech je schválně jen SCÉNA. Styl, zákaz textu a referenční obrázek přidává až
 * gen-irony-images.js, aby šel rukopis doladit na jednom místě pro celý fond.
 */
const fs = require("fs");
const path = require("path");

// gemini-2.5-pro už API novým uživatelům nedává (404 s odkazem na nástupce), ověřeno 2026-08-30.
const MODEL = "gemini-3.1-pro-preview";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const DAVKA = 12;          // otázek na jeden požadavek — víc už model odbývá poslední kusy
const PAUZA_MS = 1200;     // mezi požadavky, ať nenarazíme na limit
const LOG = "irony-prompts.log";   // průběh po dávkách; console.log je do souboru bufferovaný

// Celý recept z CLAUDE.md. Pasti jsou popsané i s tím, PROČ vznikly — model podle nich
// pak sám volí náhradní řešení místo aby zákaz obcházel doslovně.
const INSTRUKCE = `Jsi ilustrátor pro českou vědomostní hru. Ke každé otázce napiš JEDNU scénu
pro obrázkový model, anglicky, 2–4 věty.

ZÁVAZNÁ STAVBA SCÉNY:
1. Jedna dominanta, u které VÝSLOVNĚ napiš, že vyplňuje rám ("fills the frame" /
   "fills the centre of the frame"). Bez toho model udělá koláž vinětek bez středu.
2. Hlavní vtip sedí PŘÍMO na té dominantě a je čitelný i ve zmenšenině.
3. Nejvýš tři vedlejší gagy, uvozené doslova "Smaller and subordinate:".
4. Scéna ILUSTRUJE ODPOVĚĎ, ne jen téma otázky. Kdo obrázek uvidí, má z něj odpověď poznat.
5. Tón: vlídná ironie, ne cynismus.

ČTYŘI PASTI, KTERÉ MUSÍŠ OBEJÍT:
- ŽÁDNÝ TEXT. Nikdy nežádej napsané slovo, písmeno, nápis, ceduli ani knihu s textem —
  stylový recept text zakazuje a model vyrobí nesmyslnou čmáranici. U otázek o jazyce,
  pravopisu nebo písmu postav vtip na GESTU (grimasa při vyslovování, úklon, nedorozumění)
  nebo na PŘEDMĚTU (vyřezané háčky jako fyzické objekty). Když je prázdný papír součástí
  vtipu, napiš výslovně "completely blank".
- JÍDLO POPIŠ TVAREM, ne názvem: "two flat round discs joined by caramel", ne "alfajor".
  Bez tvaru vyšel kornout hranolek jako zmrzlina.
- ŽÁDNÁ KONKRÉTNÍ REÁLNÁ OSOBA. Model odmítne. Použij anonymní siluetu nebo obecnou postavu.
- VLAJKA NEMÁ OBLIČEJ. Výraz na vlajce model ignoruje; funguje fyzické gesto (svěšená,
  hrdě vztyčená, použitá jako plášť).

NEPIŠ nic o stylu, barvách, akvarelu ani poměru stran — to se přidává jinde.

Vrať POUZE JSON objekt {"id": "scéna", …} pro všechny zadané otázky, nic víc.`;

function args() {
  const a = process.argv.slice(2), o = { cc: null, limit: Infinity, force: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--cc") o.cc = a[++i];
    else if (a[i] === "--limit") o.limit = parseInt(a[++i], 10);
    else if (a[i] === "--force") o.force = true;
  }
  return o;
}

function apiKlic() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const m = fs.readFileSync(path.join(process.cwd(), ".dev.vars"), "utf8")
      .match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  } catch (e) { /* nemusí existovat */ }
  return null;
}

async function zeptejSe(davka, klic) {
  const seznam = davka.map(q => ({
    id: q.id, country: q.country, section: q.section, forChildren: !!q.kids,
    question: q.question, answer: q.answer,
  }));
  const r = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": klic },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: INSTRUKCE }] },
      contents: [{ parts: [{ text: JSON.stringify(seznam, null, 1) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 1 },
    }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 250)}`);
  const j = await r.json();
  const txt = (j.candidates?.[0]?.content?.parts || []).map(p => p.text).join("");
  if (!txt) throw new Error("prázdná odpověď: " + JSON.stringify(j).slice(0, 250));
  return naObjekt(JSON.parse(txt));
}

/**
 * Model vrací tvar, jaký se mu zrovna hodí — jednou plochý objekt {id: scéna},
 * podruhé pole [{id, scene}], někdy zabalené do {results: […]}. Není to náhoda jednoho
 * běhu: první ostrý běh přišel takhle o stovky promptů, protože parser uměl jen ten
 * plochý objekt a všechno ostatní tiše přečetl jako nulu nálezů.
 * Proto se výstup normalizuje, ne aby se na jeden tvar spoléhalo.
 */
function naObjekt(v) {
  if (!v || typeof v !== "object") return {};
  if (Array.isArray(v)) {
    const out = {};
    for (const p of v) {
      if (!p || typeof p !== "object") continue;
      const id = p.id || p.key || p.question_id;
      const scena = p.scene || p.prompt || p.irony_prompt || p.text || p.description;
      if (typeof id === "string" && typeof scena === "string") out[id] = scena;
    }
    return out;
  }
  // zabalené do jediného klíče ({results: […]}, {prompts: {…}})
  const klice = Object.keys(v);
  if (klice.length === 1 && v[klice[0]] && typeof v[klice[0]] === "object") return naObjekt(v[klice[0]]);
  // plochý objekt {id: scéna} — nebo {id: {scene: …}}
  const out = {};
  for (const [k, hodnota] of Object.entries(v)) {
    if (typeof hodnota === "string") out[k] = hodnota;
    else if (hodnota && typeof hodnota === "object") {
      const s = hodnota.scene || hodnota.prompt || hodnota.text || hodnota.description;
      if (typeof s === "string") out[k] = s;
    }
  }
  return out;
}

(async function main() {
  const klic = apiKlic();
  if (!klic) { console.error("Chybí GEMINI_API_KEY (prostředí nebo .dev.vars)."); process.exit(1); }
  const o = args();

  const dir = path.join(process.cwd(), "data", "questions");
  const soubory = fs.readdirSync(dir).filter(f => f.endsWith(".json") && (!o.cc || f === o.cc + ".json"));
  if (!soubory.length) { console.error("Žádný soubor otázek neodpovídá --cc " + o.cc); process.exit(1); }

  // Sesbírej, co prompt potřebuje: bez obrázku a (pokud není --force) bez promptu.
  const fronta = [];
  const podleSouboru = {};
  for (const f of soubory) {
    const arr = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    podleSouboru[f] = arr;
    for (const q of arr) {
      if (fs.existsSync(path.join("img", q.id + ".jpg"))) continue;
      if (q.irony_prompt && !o.force) continue;
      q._soubor = f;               // ať víme, který soubor po zápisu uložit
      fronta.push(q);
    }
  }
  const prace = fronta.slice(0, o.limit);
  console.log(`k napsání: ${prace.length} promptů (model ${MODEL}, po ${DAVKA})`);
  if (!prace.length) return;

  // Zápis: formát souborů je odsazení 1 mezerou + CRLF. Jiné nastavení přeformátuje
  // celý soubor a z diffu o 30 řádcích udělá diff o 36 tisících.
  // `_soubor` je jen pracovní značka na otázce — bez tohohle filtru by se zapsala do dat.
  const bezPracovnich = (k, v) => (k.startsWith("_") ? undefined : v);
  const uloz = () => {
    for (const f of soubory) {
      if (!podleSouboru[f]._zmena) continue;
      fs.writeFileSync(path.join(dir, f),
        JSON.stringify(podleSouboru[f], bezPracovnich, 1).replace(/\n/g, "\r\n"), "utf8");
      podleSouboru[f]._zmena = false;
    }
  };

  let zapsano = 0, chyb = 0;
  for (let i = 0; i < prace.length; i += DAVKA) {
    const davka = prace.slice(i, i + DAVKA);
    process.stdout.write(`[${i + 1}–${Math.min(i + DAVKA, prace.length)}/${prace.length}] … `);
    // Opakování je NUTNOST, ne pojistka. První běh přišel o 600 promptů z 889, protože
    // model byl chvíli přetížený a vracel buď 503, nebo prázdné odpovědi. Obojí je
    // přechodné — po pauze projde tatáž dávka na 12/12. Bez opakování se ta okna
    // projeví jako tiché díry ve fondu.
    let n = 0, potiz = "";
    for (const cekej of [0, 3000, 10000, 25000]) {
      if (cekej) await new Promise(s => setTimeout(s, cekej));
      try {
        const odp = await zeptejSe(davka, klic);
        n = 0;
        for (const q of davka) {
          const v = odp[q.id];
          if (typeof v === "string" && v.trim()) { q.irony_prompt = v.trim(); n++; podleSouboru[q._soubor]._zmena = true; }
        }
        if (n === davka.length) { potiz = ""; break; }
        potiz = "jen " + n + "/" + davka.length;
      } catch (e) {
        potiz = e.message.slice(0, 60);
      }
    }
    zapsano += n;
    chyb += davka.length - n;
    const radek = `[${i + 1}–${Math.min(i + DAVKA, prace.length)}/${prace.length}] ${n}/${davka.length}` +
      (potiz ? "  (" + potiz + ")" : "");
    console.log(n + "/" + davka.length + (potiz ? "  (" + potiz + ")" : ""));
    // Do souboru se píše NAVÍC a hned. `console.log` je při přesměrování do souboru
    // blokově bufferovaný, takže u půlhodinového běhu není půl hodiny vidět vůbec nic
    // a nejde poznat, jestli skript pracuje, nebo se zasekl na opakování.
    try { fs.appendFileSync(LOG, radek + "\n", "utf8"); } catch (e) { /* log není kritický */ }
    // Zapisuje se PO KAŽDÉ DÁVCE, ne až na konci. U ~75 dávek by jediný pád na poslední
    // znamenal, že se zahodí celá půlhodina práce; takhle se ztratí nejvýš jedna dávka
    // a opakované spuštění naváže tam, kde se přestalo (bez promptu = ve frontě).
    uloz();
    if (i + DAVKA < prace.length) await new Promise(s => setTimeout(s, PAUZA_MS));
  }
  console.log(`\nzapsáno ${zapsano} promptů, ${chyb} se nepovedlo`);
  console.log("DALŠÍ KROK je povinný:  npm run lint-irony");
})();
