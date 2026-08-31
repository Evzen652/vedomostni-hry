"use strict";
/**
 * Dávkové generování ironických ilustrací přes Gemini Batch API — poloviční cena
 * (~$0,034/obrázek místo ~$0,068), výsledky do 24 hodin.
 *
 * Běh je asynchronní, takže je skript rozdělený na tři kroky a stav si drží
 * v `.batch-irony.json` (gitignorovaný) — jde tedy odeslat dnes a vyzvednout zítra,
 * klidně z jiné session.
 *
 *   node scripts/batch-irony-images.js submit --cc cz    # sestaví a odešle dávku
 *   node scripts/batch-irony-images.js status            # kde to je
 *   node scripts/batch-irony-images.js fetch             # stáhne a uloží obrázky
 *
 * Referenční obrázek se nahraje JEDNOU přes Files API a v každém řádku je jen odkaz
 * (`file_data`). Kdyby se posílal jako base64, měl by JSONL pro 900 otázek ~83 MB
 * místo ~1 MB. Ověřeno, že se na nahraný soubor takhle odkázat jde.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const BASE = "https://generativelanguage.googleapis.com";
const MODEL = "gemini-2.5-flash-image";
const REFERENCE = "assets/country-ch.jpg";
const STAV = ".batch-irony.json";
const OUT_DIR = "img";
const SIRKA = 1200, KVALITA = 84;

// Stejný stylový recept jako u synchronního generátoru — držet je v souladu.
const STYL = "painterly textured watercolour and gouache illustration, aged vintage travel journal, " +
  "muted desaturated ochre cream and soft teal palette, weathered paper texture, warm affectionate irony, " +
  "one single continuous scene with one clear focal point, no text, no words, no letters, no signage, no border";

function klic() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const m = fs.readFileSync(".dev.vars", "utf8").match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  } catch (e) { /* nemusí existovat */ }
  console.error("Chybí GEMINI_API_KEY (prostředí nebo .dev.vars).");
  process.exit(1);
}
const K = klic();
const hlavicky = extra => Object.assign({ "x-goog-api-key": K }, extra || {});

// API vrací BATCH_STATE_*, dokumentace mluví o JOB_STATE_* — přijímáme obojí. Bez toho
// by `fetch` dávku nikdy nepovažoval za hotovou a tiše nic nestáhl.
const hotova = s => /(?:BATCH|JOB)_STATE_SUCCEEDED/.test(String(s || ""));

const nactiStav = () => { try { return JSON.parse(fs.readFileSync(STAV, "utf8")); } catch (e) { return {}; } };
const ulozStav = s => fs.writeFileSync(STAV, JSON.stringify(s, null, 2), "utf8");

/** Nahraje soubor přes resumable upload a vrátí { name, uri }. */
async function nahraj(bytes, mime, jmeno) {
  const start = await fetch(BASE + "/upload/v1beta/files", {
    method: "POST",
    headers: hlavicky({
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(bytes.length),
      "X-Goog-Upload-Header-Content-Type": mime,
      "content-type": "application/json",
    }),
    body: JSON.stringify({ file: { display_name: jmeno } }),
  });
  if (!start.ok) throw new Error("upload start " + start.status + ": " + (await start.text()).slice(0, 200));
  const url = start.headers.get("x-goog-upload-url");
  if (!url) throw new Error("server nevrátil upload URL");
  const put = await fetch(url, {
    method: "POST",
    headers: { "Content-Length": String(bytes.length), "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize" },
    body: bytes,
  });
  if (!put.ok) throw new Error("upload " + put.status + ": " + (await put.text()).slice(0, 200));
  const j = await put.json();
  return j.file || j;
}

function otazkyKeZpracovani(cc) {
  const dir = path.join("data", "questions");
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    if (cc && f !== cc + ".json") continue;
    for (const q of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) {
      if (!q.irony_prompt) continue;
      if (fs.existsSync(path.join(OUT_DIR, q.id + ".jpg"))) continue;
      out.push(q);
    }
  }
  return out;
}

async function submit(cc) {
  const stav = nactiStav();
  if (stav.batch && !stav.hotovo) {
    console.error("Už běží dávka " + stav.batch + ". Nejdřív `status`, případně smaž " + STAV + ".");
    process.exit(1);
  }
  const fronta = otazkyKeZpracovani(cc);
  if (!fronta.length) { console.log("Nic k odeslání — všechny otázky s promptem už obrázek mají."); return; }

  console.log("odesílám " + fronta.length + " otázek (odhad ~$" + (fronta.length * 0.034).toFixed(0) + ")");

  const ref = await nahraj(fs.readFileSync(REFERENCE), "image/jpeg", "styl-reference");
  console.log("reference nahrána: " + ref.name);

  const radky = fronta.map(q => JSON.stringify({
    key: q.id,
    request: {
      contents: [{ parts: [
        { text: "Use the attached reference image ONLY as a style guide for medium, palette and " +
                "brushwork — but draw a completely different scene, described below. " +
                "Do not copy its subject, composition or content.\n\nSCENE: " + q.irony_prompt + "\n\nSTYLE: " + STYL },
        { file_data: { mime_type: "image/jpeg", file_uri: ref.uri } },
      ] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
    },
  })).join("\n") + "\n";

  const jsonl = await nahraj(Buffer.from(radky, "utf8"), "application/jsonl", "irony-batch");
  console.log("JSONL nahrán: " + jsonl.name + " (" + (radky.length / 1024 / 1024).toFixed(2) + " MB)");

  const r = await fetch(BASE + "/v1beta/models/" + MODEL + ":batchGenerateContent", {
    method: "POST",
    headers: hlavicky({ "content-type": "application/json" }),
    body: JSON.stringify({ batch: { display_name: "irony-" + (cc || "vse"), input_config: { file_name: jsonl.name } } }),
  });
  if (!r.ok) { console.error("založení dávky selhalo " + r.status + ": " + (await r.text()).slice(0, 400)); process.exit(1); }
  const j = await r.json();
  ulozStav({ batch: j.name, pocet: fronta.length, cc: cc || null, odeslano: new Date().toISOString() });
  console.log("\ndávka založena: " + j.name);
  console.log("stav zjistíš:  node scripts/batch-irony-images.js status");
}

async function status() {
  const s = nactiStav();
  if (!s.batch) { console.log("Žádná dávka neběží."); return; }
  const r = await fetch(BASE + "/v1beta/" + s.batch, { headers: hlavicky() });
  if (!r.ok) { console.error("dotaz selhal " + r.status + ": " + (await r.text()).slice(0, 300)); process.exit(1); }
  const j = await r.json();
  const m = j.metadata || j;
  console.log("dávka:  " + s.batch);
  console.log("stav:   " + (m.state || "?"));
  console.log("otázek: " + s.pocet + "   odesláno: " + s.odeslano);
  if (hotova(m.state)) console.log("\nHotovo — stáhni:  node scripts/batch-irony-images.js fetch");
  return j;
}

async function fetchVysledky() {
  const s = nactiStav();
  if (!s.batch) { console.log("Žádná dávka neběží."); return; }
  const r = await fetch(BASE + "/v1beta/" + s.batch, { headers: hlavicky() });
  const j = await r.json();
  const m = j.metadata || j;
  if (!hotova(m.state)) { console.log("Dávka není hotová (stav " + m.state + ")."); return; }

  const soubor = (m.output || {}).responses_file || (m.outputConfig || {}).responses_file || (j.response || {}).responsesFile;
  if (!soubor) { console.error("Nenašel jsem výstupní soubor. Celá odpověď:\n" + JSON.stringify(j).slice(0, 600)); process.exit(1); }

  const d = await fetch(BASE + "/download/v1beta/" + soubor + ":download?alt=media", { headers: hlavicky() });
  if (!d.ok) { console.error("stažení selhalo " + d.status); process.exit(1); }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  let ok = 0, chyb = 0;

  async function zpracujRadek(radek) {
    if (!radek.trim()) return;
    let o; try { o = JSON.parse(radek); } catch (e) { chyb++; return; }
    const id = o.key;
    const part = (o.response?.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data || p.inline_data?.data);
    if (!id || !part) { chyb++; if (chyb <= 3) console.log("  bez obrázku: " + (id || "?")); return; }
    const png = Buffer.from((part.inlineData || part.inline_data).data, "base64");
    await sharp(png).resize(SIRKA).jpeg({ quality: KVALITA }).toFile(path.join(OUT_DIR, id + ".jpg"));
    ok++;
    if (ok % 50 === 0) console.log("  … " + ok + " uloženo");
  }

  // Zpracovává se PO ŘÁDCÍCH z proudu, ne přes response.text(). Výsledek dávky o 901
  // obrázcích má kolem 2,7 GB (base64 PNG na řádek) a Node neumí vyrobit řetězec delší
  // než ~512 MB — `text()` na tom spadne na "Cannot create a string longer than…".
  // Vedlejší přínos: obrázky se ukládají průběžně, takže pád nezahodí celé stažení.
  const dekoder = new TextDecoder("utf8");
  let zbytek = "";
  for await (const kus of d.body) {
    zbytek += dekoder.decode(kus, { stream: true });
    let nl;
    while ((nl = zbytek.indexOf("\n")) >= 0) {
      const radek = zbytek.slice(0, nl);
      zbytek = zbytek.slice(nl + 1);
      await zpracujRadek(radek);
    }
  }
  await zpracujRadek(zbytek);

  console.log("uloženo " + ok + " obrázků, " + chyb + " bez výsledku");
  ulozStav(Object.assign(s, { hotovo: true, ulozeno: ok }));
}

const prikaz = process.argv[2];
const ccArg = process.argv.includes("--cc") ? process.argv[process.argv.indexOf("--cc") + 1] : null;
const akce = { submit: () => submit(ccArg), status, fetch: fetchVysledky }[prikaz];
if (!akce) { console.error("Použití: submit --cc cz | status | fetch"); process.exit(1); }
akce().catch(e => { console.error("CHYBA: " + e.message); process.exit(1); });
