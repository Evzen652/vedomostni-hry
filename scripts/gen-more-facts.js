"use strict";
/**
 * Dopisuje pole `more_fact` otázkám, které nemají ani `source_card`, ani `more_fact` —
 * tedy těm, u kterých se v appce vůbec nevykreslí tlačítko „Více o…".
 *
 * Proč to vzniklo: průchod appkou 2026-08-30 ukázal, že takových otázek je 1 525 z 3 702
 * (41 %). Není to chyba kódu — `frowHtml` tlačítko schválně skryje, když by karta neměla
 * co ukázat (dřív otevírala prázdný rámeček). Je to dluh v OBSAHU.
 *
 * Nejtěžší na tomhle úkolu není fakt najít, ale nezopakovat ho. Standard z 2026-08-10:
 * každá vrstva nese něco jiného — `explanation` fakt navíc, hláška reakci, `more_fact`
 * ještě jiný fakt. Model proto dostává i explanation a obě hlášky s tím, že se s nimi
 * NESMÍ potkat; `npm run lint-facts` to po něm změří.
 *
 * Klíč: prostředí, nebo řádek `GEMINI_API_KEY=…` v gitignorovaném `.dev.vars`.
 *
 * Pořadí je stejné jako u ironických promptů:  gen → lint → teprve nasazení.
 *
 *   node scripts/gen-more-facts.js --cc ca            # jen Kanada (nejvíc dlužná země)
 *   node scripts/gen-more-facts.js --limit 60         # opatrný první běh
 *   node scripts/gen-more-facts.js                    # celý dluh
 *   node scripts/gen-more-facts.js --force --cc ca    # přepsat i existující
 */
const fs = require("fs");
const path = require("path");

// gemini-2.5-pro už API novým uživatelům nedává (404 s odkazem na nástupce), ověřeno 2026-08-30.
const MODEL = "gemini-3.1-pro-preview";
const URL = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";
const DAVKA = 10;          // fakt je delší než ironická scéna, takže menší dávka než tam
const PAUZA_MS = 1200;
const LOG = "more-facts.log";

const INSTRUKCE = `Píšeš obsah pro českou vědomostní hru o zeměpisu. Ke každé otázce napiš
JEDEN další zajímavý fakt do pole "more_fact". Píšeš ČESKY, spisovně, s diakritikou.

CO TO JE: text na kartě, kterou si hráč otevře tlačítkem „Více o…" POTÉ, co už viděl
odpověď i vysvětlení. Je to odměna za zvědavost, ne opakování lekce.

ZÁVAZNÁ PRAVIDLA:
1. Fakt musí být NOVÝ. Nesmí zopakovat ani parafrázovat nic z otázky, odpovědi,
   vysvětlení ani z obou hlášek — ty dostáváš právě proto, aby ses jim vyhnul.
   Když vysvětlení mluví o výšce hory, napiš o něčem jiném než o výšce.
2. Drž se TÉMATU odpovědi, ne obecně země. U otázky na Bajkal piš o Bajkalu,
   ne o Rusku.
3. Délka 1–3 věty, 110–240 znaků (změřeno na 907 už napsaných faktů: medián 124,
   nejdelší 239). Kratší vyzní jako titulek, delší se na kartu nevejde.
4. Konkrétnost před obecností: číslo, jméno, příhoda, srovnání s něčím známým.
   „Je to velké jezero" je špatně, „vejde se do něj všechna voda Velkých jezer" dobře.
5. Bez uvozovací vaty — nezačínej „Zajímavostí je, že…", „Věděli jste, že…",
   „Kromě toho…". Rovnou k věci.
6. U otázek označených forChildren:true piš pro osmileté: konkrétní, obrazné,
   žádná procenta, letopočty ani politika. Jinak běžný dospělý tón.
7. Žádný vtip navíc — na humor je v appce hláška. Tohle je fakt.
8. Piš jen to, čím si jsi jistý. Když o tématu nic dalšího spolehlivě nevíš,
   vrať u toho id prázdný řetězec "" a nic si nevymýšlej.

Vrať POUZE JSON objekt {"id": "fakt", …} pro všechna zadaná id, nic víc.`;

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

/** Hláška může být řetězec, nebo objekt {deti, dospeli} — model potřebuje obojí jako text. */
function hlaskaText(h) {
  if (!h) return "";
  if (typeof h === "string") return h;
  return Object.values(h).filter(v => typeof v === "string").join(" ");
}

/**
 * Model vrací tvar, jaký se mu zrovna hodí — plochý objekt, pole, nebo obojí zabalené.
 * Stejná normalizace jako v gen-irony-prompts.js; tam absence tohohle kroku stála
 * 600 promptů z 889, protože parser uměl jen jeden tvar a zbytek tiše přečetl jako nulu.
 */
function naObjekt(v) {
  if (!v || typeof v !== "object") return {};
  if (Array.isArray(v)) {
    const out = {};
    for (const p of v) {
      if (!p || typeof p !== "object") continue;
      const id = p.id || p.key || p.question_id;
      const f = p.more_fact || p.fact || p.text;
      if (typeof id === "string" && typeof f === "string") out[id] = f;
    }
    return out;
  }
  const klice = Object.keys(v);
  if (klice.length === 1 && v[klice[0]] && typeof v[klice[0]] === "object") return naObjekt(v[klice[0]]);
  const out = {};
  for (const [k, hodnota] of Object.entries(v)) {
    if (typeof hodnota === "string") out[k] = hodnota;
    else if (hodnota && typeof hodnota === "object") {
      const f = hodnota.more_fact || hodnota.fact || hodnota.text;
      if (typeof f === "string") out[k] = f;
    }
  }
  return out;
}

async function zeptejSe(davka, klic) {
  const seznam = davka.map(q => ({
    id: q.id, country: q.country, section: q.section, forChildren: !!q.kids,
    question: q.question, answer: q.answer, about: q.about,
    // tohle všechno se NESMÍ zopakovat — proto to model dostává
    explanation: q.explanation || "",
    quip_correct: hlaskaText(q.quip_correct),
    quip_wrong: hlaskaText(q.quip_wrong),
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
  if (!r.ok) throw new Error("HTTP " + r.status + ": " + (await r.text()).slice(0, 250));
  const j = await r.json();
  const txt = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [])
    .map(p => p.text).join("");
  if (!txt) throw new Error("prázdná odpověď: " + JSON.stringify(j).slice(0, 250));
  return naObjekt(JSON.parse(txt));
}

(async function main() {
  const klic = apiKlic();
  if (!klic) { console.error("Chybí GEMINI_API_KEY (prostředí nebo .dev.vars)."); process.exit(1); }
  const o = args();

  const dir = path.join(process.cwd(), "data", "questions");
  const soubory = fs.readdirSync(dir).filter(f => f.endsWith(".json") && (!o.cc || f === o.cc + ".json"));
  if (!soubory.length) { console.error("Žádný soubor otázek neodpovídá --cc " + o.cc); process.exit(1); }

  const fronta = [], podleSouboru = {};
  for (const f of soubory) {
    const arr = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    podleSouboru[f] = arr;
    for (const q of arr) {
      // Otázka s kartou z Glóbu tlačítko má a karta nese vlastní `fact` — tam není co dopisovat.
      if (q.source_card && !o.force) continue;
      if (q.more_fact && !o.force) continue;
      q._soubor = f;
      fronta.push(q);
    }
  }
  const prace = fronta.slice(0, o.limit);
  console.log("k dopsání: " + prace.length + " faktů (model " + MODEL + ", po " + DAVKA + ")");
  if (!prace.length) return;

  // Formát souborů je odsazení 1 mezerou + CRLF; jiné nastavení přeformátuje celý soubor.
  // `_soubor` je pracovní značka na otázce — bez filtru by se zapsala do dat.
  const bezPracovnich = (k, v) => (k.startsWith("_") ? undefined : v);
  const uloz = () => {
    for (const f of soubory) {
      if (!podleSouboru[f]._zmena) continue;
      fs.writeFileSync(path.join(dir, f),
        JSON.stringify(podleSouboru[f], bezPracovnich, 1).replace(/\n/g, "\r\n"), "utf8");
      podleSouboru[f]._zmena = false;
    }
  };

  fs.writeFileSync(LOG, "# " + new Date().toISOString() + "  " + prace.length + " faktů\n", "utf8");
  let zapsano = 0, chyb = 0, prazdnychCelkem = 0;

  for (let i = 0; i < prace.length; i += DAVKA) {
    const davka = prace.slice(i, i + DAVKA);
    const znacka = "[" + (i + 1) + "–" + Math.min(i + DAVKA, prace.length) + "/" + prace.length + "]";
    process.stdout.write(znacka + " … ");

    // Opakování je nutnost, ne pojistka: model bývá chvílemi přetížený (503 nebo prázdná
    // odpověď) a po pauze projde tatáž dávka celá. Bez toho vzniknou tiché díry ve fondu.
    let n = 0, prazdnych = 0, potiz = "";
    for (const cekej of [0, 3000, 10000, 25000]) {
      if (cekej) await new Promise(s => setTimeout(s, cekej));
      try {
        const odp = await zeptejSe(davka, klic);
        n = 0; prazdnych = 0;
        for (const q of davka) {
          const v = odp[q.id];
          if (typeof v !== "string") continue;
          n++;
          if (!v.trim()) { prazdnych++; continue; }   // model přiznal, že nic neví — bereme
          q.more_fact = v.trim();
          podleSouboru[q._soubor]._zmena = true;
        }
        if (n === davka.length) { potiz = ""; break; }
        potiz = "jen " + n + "/" + davka.length;
      } catch (e) {
        potiz = e.message.slice(0, 60);
      }
    }
    zapsano += n - prazdnych;
    prazdnychCelkem += prazdnych;
    chyb += davka.length - n;
    uloz();   // po každé dávce, ať pád nezahodí celý běh
    console.log(potiz ? "chyba" : "ok");
    fs.appendFileSync(LOG, znacka + " " + n + "/" + davka.length +
      (prazdnych ? "  (" + prazdnych + "× model nic neví)" : "") +
      (potiz ? "  (" + potiz + ")" : "") + "\n", "utf8");
    if (i + DAVKA < prace.length) await new Promise(s => setTimeout(s, PAUZA_MS));
  }

  uloz();
  console.log("\nzapsáno " + zapsano + " faktů, " + prazdnychCelkem + "× model nic nevěděl, " +
    chyb + " se nepovedlo. Průběh v " + LOG + ".");
  console.log("Další krok je POVINNÝ:  npm run lint-facts");
})();
