"use strict";
/**
 * Vygeneruje ironické ilustrace k otázkám z pole `irony_prompt` přes Gemini API.
 *
 * Klíč se bere z prostředí, nebo z `.dev.vars` (řádek `GEMINI_API_KEY=…`). Ten soubor
 * je v .gitignore, takže se klíč nedostane do repa.
 *
 * Spuštění:
 *   node scripts/gen-irony-images.js --limit 30
 *
 * POZN. k síti: starší zápis v CLAUDE.md tvrdil, že tenhle endpoint je ze session
 * Claude Code blokovaný (403 od proxy). Ověřeno 2026-08-30, že to už NEPLATÍ —
 * endpoint odpovídá normálně, takže generovat může i asistent, když má klíč.
 *
 * Přepínače:
 *   --limit N     kolik obrázků nejvýš (default 10; pilot = 30)
 *   --only id,id  jen konkrétní otázky
 *   --force       přegenerovat i tam, kde cílový obrázek už je
 *   --ui          místo otázek vezme dlaždice online rozcestníku
 *                 (data/ui-irony-prompts.json → assets/{id}.jpg, čtverec 512 px)
 *
 * Recept je z CLAUDE.md a všechny tři jeho části jsou NUTNÉ:
 *   1. Gemini API napřímo (klíč v hlavičce x-goog-api-key, responseModalities: ["IMAGE"]).
 *   2. REFERENČNÍ OBRÁZEK přiložený jako druhá `part` — tohle je ten rozdíl. Popsat styl
 *      slovy drží rukopis mnohem hůř; s referencí je sada konzistentní napoprvé.
 *   3. Explicitní zákaz textu — model jinak vpisuje nesmyslná obrácená písmena.
 *
 * Co NEfunguje (ověřeno, neopakovat): pollinations.ai vtip z promptu prostě vynechá,
 * potvrzeno na třech různých modelech.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const MODEL = "gemini-2.5-flash-image";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const REFERENCE = "assets/country-ch.jpg";   // vzor rukopisu, ne obsahu
const OUT_DIR = "img";
const SIRKA = 1200, KVALITA = 84;            // ~176 kB/kus, změřeno na skutečné dávce

// Styl se drží TADY, ne v datech — ať jde doladit na jednom místě pro celý fond.
const STYL = "painterly textured watercolour and gouache illustration, aged vintage travel journal, " +
  "muted desaturated ochre cream and soft teal palette, weathered paper texture, warm affectionate irony, " +
  "one single continuous scene with one clear focal point, no text, no words, no letters, no signage, no border";

function args() {
  const a = process.argv.slice(2), o = { limit: 10, only: null, force: false, ui: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--limit") o.limit = parseInt(a[++i], 10);
    else if (a[i] === "--only") o.only = a[++i].split(",").map(s => s.trim());
    else if (a[i] === "--force") o.force = true;
    else if (a[i] === "--ui") o.ui = true;
  }
  return o;
}

// Dlaždice online rozcestníku (data/ui-irony-prompts.json) — jiný tvar i cíl než otázky:
// čtverec 512 px do assets/, ne 16:9 do img/. Zobrazují se 56–72 px (hero 72, ostatní 56),
// takže se do nich vejde jeden objekt a jeden vtip; vedlejší gagy se v té velikosti ztratí.
function dlazdice() {
  const p = path.join(process.cwd(), "data", "ui-irony-prompts.json");
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  return Object.entries(j).filter(([k]) => !k.startsWith("_"))
    .map(([id, irony_prompt]) => ({ id, irony_prompt }));
}

function otazky() {
  const dir = path.join(process.cwd(), "data", "questions"), out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    for (const q of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
      if (q.irony_prompt) out.push(q);
  }
  return out;
}

async function jedenObrazek(prompt, refB64, pomer, klic) {
  const telo = {
    contents: [{
      parts: [
        // Pořadí je schválně: nejdřív role reference, pak scéna, pak styl.
        { text: "Use the attached reference image ONLY as a style guide for medium, palette and " +
                "brushwork — but draw a completely different scene, described below. " +
                "Do not copy its subject, composition or content.\n\nSCENE: " + prompt + "\n\nSTYLE: " + STYL },
        { inlineData: { mimeType: "image/jpeg", data: refB64 } },
      ],
    }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: pomer || "16:9" } },
  };
  const r = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": klic },
    body: JSON.stringify(telo),
  });
  if (!r.ok) {
    const t = await r.text();
    // 429 hned u prvního requestu = nezapnutý billing, ne vyčerpaná kvóta. Předplatné
    // Gemini Advanced v aplikaci s kvótou API nesouvisí.
    throw new Error(`HTTP ${r.status}: ${t.slice(0, 300)}`);
  }
  const j = await r.json();
  const part = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
  if (!part) throw new Error("odpověď neobsahuje obrázek: " + JSON.stringify(j).slice(0, 300));
  return Buffer.from(part.inlineData.data, "base64");
}

// Klíč: nejdřív prostředí, pak .dev.vars. Ten soubor už projekt používá pro lokální
// tajemství (ALLOW_DEV_SECRET) a JE v .gitignore, takže se klíč nedostane do repa.
// Bez toho by se musel exportovat v každém novém terminálu znovu.
function apiKlic() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const m = fs.readFileSync(path.join(process.cwd(), ".dev.vars"), "utf8")
      .match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  } catch (e) { /* soubor nemusí existovat */ }
  return null;
}

(async function main() {
  const KLIC = apiKlic();
  if (!KLIC) {
    console.error("Chybí GEMINI_API_KEY.\n" +
      "Buď v prostředí, nebo řádkem v .dev.vars (je gitignorovaný):\n" +
      '  GEMINI_API_KEY=sem-vloz-klic');
    process.exit(1);
  }
  if (!fs.existsSync(REFERENCE)) { console.error("Chybí referenční obrázek " + REFERENCE); process.exit(1); }
  const refB64 = fs.readFileSync(REFERENCE).toString("base64");

  const o = args();
  const outDir = o.ui ? "assets" : OUT_DIR;
  const pomer  = o.ui ? "1:1" : "16:9";
  const sirka  = o.ui ? 512 : SIRKA;
  fs.mkdirSync(outDir, { recursive: true });
  let fronta = o.ui ? dlazdice() : otazky();
  if (o.only) fronta = fronta.filter(q => o.only.includes(q.id));
  if (!o.force) fronta = fronta.filter(q => !fs.existsSync(path.join(outDir, q.id + ".jpg")));
  fronta = fronta.slice(0, o.limit);

  console.log(`ke generování: ${fronta.length} (model ${MODEL})`);
  let ok = 0, chyb = 0;
  for (let i = 0; i < fronta.length; i++) {
    const q = fronta[i];
    const cil = path.join(outDir, q.id + ".jpg");
    process.stdout.write(`[${i + 1}/${fronta.length}] ${q.id} … `);
    try {
      const png = await jedenObrazek(q.irony_prompt, refB64, pomer, KLIC);
      // Gemini vrací PNG ~2,3 MB — převod na JPG je povinný krok, ne volitelný.
      await sharp(png).resize(sirka, o.ui ? sirka : null).jpeg({ quality: KVALITA }).toFile(cil);
      const kB = (fs.statSync(cil).size / 1024).toFixed(0);
      console.log(`hotovo (${kB} kB)`); ok++;
    } catch (e) {
      console.log("SELHALO: " + e.message); chyb++;
    }
  }
  console.log(`\nhotovo: ${ok} obrázků, ${chyb} chyb`);
})();
