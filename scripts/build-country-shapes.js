"use strict";
/**
 * Vyrobí data/country-shapes.json — obrysy zemí pro zvýraznění na 3D glóbu.
 *
 * Jednorázový nástroj: výsledek se COMMITNE do repa a appka ho čte lokálně.
 * Stahovat hranice za běhu by porušilo konvenci soběstačnosti (CLAUDE.md) — stejně
 * jako je lokálně bundlovaná assets/earth.jpg.
 *
 * Spuštění:  node scripts/build-country-shapes.js
 *
 * Proč Natural Earth 110m: nejhrubší varianta úplně stačí. Česko je na glóbu ~16 px
 * široké, takže 35 bodů obrysu je násobně víc, než se dá zobrazit — jemnější 50m/10m
 * by soubor jen nafoukly.
 *
 * PAST: klíčovat se MUSÍ přes ISO_A2_EH, ne ISO_A2. To má u Francie, Norska a Tchaj-wanu
 * hodnotu "-99" (Natural Earth tím řeší sporné suverenity), takže by tyhle tři země
 * z výstupu tiše vypadly.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const ZDROJ = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const CIL = path.join(process.cwd(), "data", "country-shapes.json");

// Musí odpovídat COUNTRY_LL / COUNTRY_BY_CC v quiz.js. Když tam přibude země, přidej ji sem
// a skript spusť znovu — jinak se na glóbu prostě nezvýrazní (appka to nerozbije, viz fallback).
const ZEME = ("ar at au be bg br ca ch cl cn cz de dk ec eg es fi fj fr ga gb gr hu id ie il in it " +
  "jp ke kp kr mn mx my nl no nz pe ph pk pl pt ro ru sa se sk th tr tw ua us vn za").split(" ");

// 2 desetinná místa = ~1,1 km na rovníku. Při 16 px na zemi je to hluboko pod pixelem,
// ale ušetří to zhruba polovinu velikosti souboru oproti plné přesnosti.
const MISTA = 2;

function stahni(url) {
  return new Promise((splň, zamítni) => {
    https.get(url, res => {
      if (res.statusCode !== 200) { zamítni(new Error("HTTP " + res.statusCode + " od " + url)); return; }
      let d = "";
      res.setEncoding("utf8");
      res.on("data", c => { d += c; });
      res.on("end", () => splň(d));
    }).on("error", zamítni);
  });
}

function zaokrouhli(souřadnice) {
  // rekurzivně přes libovolnou hloubku zanoření (Polygon vs MultiPolygon)
  return Array.isArray(souřadnice[0])
    ? souřadnice.map(zaokrouhli)
    : [+souřadnice[0].toFixed(MISTA), +souřadnice[1].toFixed(MISTA)];
}

(async function main() {
  console.log("stahuji Natural Earth 110m…");
  const gj = JSON.parse(await stahni(ZDROJ));

  const podleKódu = {};
  for (const f of gj.features) {
    const p = f.properties;
    const kód = (p.ISO_A2_EH || p.ISO_A2 || "").toLowerCase();
    if (kód && kód !== "-99") podleKódu[kód] = f;
  }

  const out = {};
  let prstenců = 0, bodů = 0;
  const chybí = [];
  for (const cc of ZEME) {
    const f = podleKódu[cc];
    if (!f) { chybí.push(cc); continue; }
    // MultiPolygon se zploští na prostý seznam prstenců. Díry (např. Lesotho uvnitř
    // Jihoafrické republiky) se tím neztratí — kreslí se přes fill("evenodd").
    const polygony = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    const prstence = [];
    for (const polygon of polygony) for (const prstenec of polygon) {
      prstence.push(zaokrouhli(prstenec));
      prstenců++; bodů += prstenec.length;
    }
    out[cc] = prstence;
  }

  if (chybí.length) console.warn("  ! nenalezeno v Natural Earth: " + chybí.join(", "));

  fs.mkdirSync(path.dirname(CIL), { recursive: true });
  fs.writeFileSync(CIL, JSON.stringify(out), "utf8");
  const kB = (fs.statSync(CIL).size / 1024).toFixed(0);
  console.log(`data/country-shapes.json hotov: ${Object.keys(out).length} zemí, ${prstenců} prstenců, ${bodů} bodů, ${kB} kB`);
})().catch(e => { console.error("SELHALO: " + e.message); process.exit(1); });
