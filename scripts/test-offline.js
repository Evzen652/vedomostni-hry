"use strict";
/**
 * Kontrola offline části hry (quiz.js × data/questions).
 *
 * Proč vznikl: `test:api` hlídá server, `validate` data a `sim-online` model ratingu —
 * ale samotná hra, 3 400 řádků quiz.js, neměla nic. Není náhoda, že všechna slepá místa
 * z průchodu appkou (2026-08-30) byla právě tady.
 *
 * Netestuje kopii logiky, ale SKUTEČNÝ zdroj: konstanty a čisté funkce se vytáhnou
 * z quiz.js a spustí ve `vm`. Celý soubor načíst nejde — sahá na DOM hned na 6. řádku.
 *
 * Každá kontrola odpovídá chybě, která se v projektu opravdu stala:
 *   - chybějící COUNTRY_LL   → glóbus mířil do Guinejského zálivu (2026-08-29)
 *   - sekce mimo SECTION_ORDER → 536 otázek nedosažitelných přes výběr tématu (2026-08-30)
 *   - fond menší než nabídka → hra by slíbila víc, než dá
 *
 * Spuštění:  npm run test:offline
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SRC = fs.readFileSync(path.join(process.cwd(), "quiz.js"), "utf8");

/** Vytáhne `const NAME = …;` ze zdroje a vyhodnotí. Pro jednořádkové i víceřádkové literály. */
function konstanta(jmeno) {
  // `\s*` je nutné: v quiz.js jsou deklarace zarovnané a mají různý počet mezer před "="
  const m = new RegExp("const\\s+" + jmeno + "\\s*=").exec(SRC);
  if (!m) throw new Error("v quiz.js chybí konstanta " + jmeno);
  const zac = m.index;
  // najdi konec deklarace: první ";" na úrovni 0 závorek
  let hloubka = 0, i = SRC.indexOf("=", zac) + 1, vRetezci = null;
  for (; i < SRC.length; i++) {
    const c = SRC[i];
    if (vRetezci) { if (c === "\\") i++; else if (c === vRetezci) vRetezci = null; continue; }
    if (c === '"' || c === "'" || c === "`") { vRetezci = c; continue; }
    if ("[{(".includes(c)) hloubka++;
    else if ("]})".includes(c)) hloubka--;
    else if (c === ";" && hloubka === 0) break;
  }
  const vyraz = SRC.slice(SRC.indexOf("=", zac) + 1, i);
  return vm.runInNewContext("(" + vyraz + ")");
}

/** Vytáhne čistou funkci (bez DOM) a vrátí ji volatelnou. */
function funkce(jmeno, zavislosti) {
  const zac = SRC.indexOf("function " + jmeno + "(");
  if (zac < 0) throw new Error("v quiz.js chybí funkce " + jmeno);
  let hloubka = 0, i = SRC.indexOf("{", zac), start = i;
  for (; i < SRC.length; i++) {
    if (SRC[i] === "{") hloubka++;
    else if (SRC[i] === "}") { hloubka--; if (!hloubka) break; }
  }
  const kod = SRC.slice(zac, i + 1);
  const ctx = Object.assign({}, zavislosti || {});
  vm.runInNewContext(kod + "; __f = " + jmeno + ";", ctx);
  return ctx.__f;
}

// ---- co se testuje --------------------------------------------------------------
let chyb = 0, ok = 0;
const kontrola = (podminka, popis, detail) => {
  if (podminka) { ok++; return; }
  chyb++;
  console.log("  CHYBA  " + popis + (detail ? "\n         " + detail : ""));
};
const sekce = t => console.log("\n" + t);

const COUNTRY_BY_CC = konstanta("COUNTRY_BY_CC");
const COUNTRY_FLAG = konstanta("COUNTRY_FLAG");
const COUNTRY_CONT = konstanta("COUNTRY_CONT");
const COUNTRY_LL = konstanta("COUNTRY_LL");
const CONTINENTS = konstanta("CONTINENTS");
const SECTION_ORDER = konstanta("SECTION_ORDER");
const SECTION_EMOJI = konstanta("SECTION_EMOJI");
const SECTION_SLUG = konstanta("SECTION_SLUG");
const plur = (n, a, b, c) => (n === 1 ? a : (n >= 2 && n <= 4 ? b : c));
const qLimitOptions = funkce("qLimitOptions", { plur });

const dir = path.join(process.cwd(), "data", "questions");
const otazky = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  for (const q of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) otazky.push(q);
}
// stejná pravidla jako bandPool() v quiz.js
const fond = (cc, band) => otazky.filter(q => q.cc === cc &&
  (band === "deti" ? q.kids : band === "starsi" ? (!q.kids && (q.difficulty || 1) <= 2) : !q.kids));

sekce("Země: čtyři mapy musí sedět na sebe");
const ccs = Object.keys(COUNTRY_BY_CC);
for (const cc of ccs) {
  // Bez souřadnic se glóbus natočí na fallback [0,20] — tedy do Guinejského zálivu.
  // Přesně tahle chyba postihla 6 zemí přidaných 2026-08-15.
  kontrola(COUNTRY_LL[cc], "země " + cc + " nemá souřadnice v COUNTRY_LL (glóbus by mířil mimo)");
  kontrola(COUNTRY_FLAG[cc], "země " + cc + " nemá vlajkové emoji");
  kontrola(COUNTRY_CONT[cc], "země " + cc + " nemá kontinent");
  kontrola(!COUNTRY_CONT[cc] || CONTINENTS.some(k => k.id === COUNTRY_CONT[cc]),
    "země " + cc + " míří na neznámý kontinent " + COUNTRY_CONT[cc]);
}
for (const cc of Object.keys(COUNTRY_LL))
  kontrola(COUNTRY_BY_CC[cc], "COUNTRY_LL má navíc zemi " + cc + ", kterou appka nezná");

sekce("Sekce: co je v datech, musí jít vybrat");
const vDatech = [...new Set(otazky.map(q => q.section).filter(Boolean))];
for (const s of vDatech)
  kontrola(SECTION_ORDER.includes(s),
    "sekce „" + s + "\" je v datech, ale výběr témat ji nenabízí",
    otazky.filter(q => q.section === s).length + " otázek by šlo potkat jen přes „Vybrat vše\"");
for (const s of SECTION_ORDER) {
  kontrola(SECTION_EMOJI[s], "sekce „" + s + "\" nemá emoji (dlaždice by byla prázdná)");
  kontrola(SECTION_SLUG[s], "sekce „" + s + "\" nemá slug pro ilustraci");
}

sekce("Fond: hra nesmí slíbit víc, než dá");
for (const cc of ccs) {
  for (const band of ["deti", "starsi", "dospeli"]) {
    const n = fond(cc, band).length;
    if (!n) continue;   // prázdné pásmo řeší jiná kontrola níž
    const max = Math.max(...qLimitOptions(n).map(o => o.n));
    kontrola(max <= n, "u " + cc + "/" + band + " nabídne appka " + max + " otázek, ale fond má jen " + n);
  }
}

sekce("Dostupnost: každá nabízená země musí mít co hrát");
const prazdne = [];
for (const cc of ccs) {
  const celkem = otazky.filter(q => q.cc === cc).length;
  kontrola(celkem > 0, "země " + cc + " (" + COUNTRY_BY_CC[cc] + ") je v nabídce, ale nemá žádnou otázku");
  for (const band of ["deti", "starsi", "dospeli"])
    if (celkem && !fond(cc, band).length) prazdne.push(cc + "/" + band);
}
// Prázdné pásmo není chyba (bandPool spadne na celý fond), ale je to dluh v obsahu.
if (prazdne.length) console.log("  pozn.  " + prazdne.length + " kombinací země/pásmo je bez otázek: " + prazdne.slice(0, 8).join(", ") + (prazdne.length > 8 ? " …" : ""));

// Podlaha fondu. Párty nabízí nejvýš 8 kol, takže pod osmi otázkami se hráči začnou
// otázky opakovat (buildPartyOrder fond domíchá znovu) a v sólu je hra kratší, než by
// měla být. Dorovnáno 2026-08-31 na minimum 10 — tenhle výpis hlídá, ať to zase nespadne.
// Schválně jen POZNÁMKA, ne chyba: nová země se rozepisuje postupně a padající test
// by nutil buď dopsat 10 otázek naráz, nebo zemi z nabídky dočasně vyhodit.
const PARTY_MAX_KOL = 8;
const tenke = [];
for (const cc of ccs) {
  if (!otazky.some(q => q.cc === cc)) continue;
  for (const band of ["deti", "starsi", "dospeli"]) {
    const n = fond(cc, band).length;
    if (n && n < PARTY_MAX_KOL) tenke.push(cc + "/" + band + " (" + n + ")");
  }
}
console.log(tenke.length
  ? "  pozn.  " + tenke.length + " kombinací pod " + PARTY_MAX_KOL + " otázkami — v párty se budou opakovat: " + tenke.join(", ")
  : "  pozn.  podlaha drží: každá kombinace země/pásmo má aspoň " + PARTY_MAX_KOL + " otázek");

sekce("Ilustrace dlaždic: chybějící obrázek spadne na emoji, ale ať o něm víme");
const chybiObr = [];
for (const cc of ccs) if (!fs.existsSync(path.join("assets", "country-" + cc + ".jpg"))) chybiObr.push("country-" + cc);
for (const k of CONTINENTS) if (!fs.existsSync(path.join("assets", "cont-" + k.id + ".jpg"))) chybiObr.push("cont-" + k.id);
for (const s of SECTION_ORDER) if (!fs.existsSync(path.join("assets", "section-" + SECTION_SLUG[s] + ".jpg"))) chybiObr.push("section-" + SECTION_SLUG[s]);
if (chybiObr.length) console.log("  pozn.  " + chybiObr.length + " dlaždic bez ilustrace (emoji fallback): " + chybiObr.join(", "));

// ---- párty: pořadí otázek a bodování -------------------------------------------
// Tohle je nejkřehčí kus offline logiky a zároveň ten, kde se už jednou stala tichá chyba:
// do 2026-08-24 se v párty losovalo z jednoho společného balíku, takže dítě u stolu
// dostávalo ~41 % otázek psaných pro dospělé. Nikde to nespadlo — jen to bylo špatně.
sekce("Párty: každý hráč hraje ve svém pásmu a za stejné body");

const shuffle = konstanta("shuffle");
const PARTY_POINTS = konstanta("PARTY_POINTS");
const S = { players: [], totalRounds: 5, mode: "party" };
const dataObj = { questions: otazky };
const bandPool = funkce("bandPool", { data: dataObj });
// `data` sem patří, i když ho dnešní buildPartyOrder nepoužívá: přesně tímhle balíkem
// se před 2026-08-24 losovalo pro všechny hráče najednou. Bez něj v kontextu by se návrat
// k té chybě projevil jako ReferenceError, tedy pádem testu z nesouvisejícího důvodu —
// a nikdo by z hlášky nepoznal, že jde o dítě dostávající otázky pro dospělé.
const buildPartyOrder = funkce("buildPartyOrder", { S, shuffle, bandPool, Math, data: dataObj });
const qPoints = funkce("qPoints", { S, PARTY_POINTS });

// Předpis pásma musí odpovídat bandPool() — kdyby se rozešly, test by kontroloval sám sebe.
const patriDo = (q, band) => band === "deti" ? !!q.kids
  : band === "starsi" ? (!q.kids && (q.difficulty || 1) <= 2)
  : !q.kids;

kontrola(bandPool("deti").every(q => q.kids), "bandPool(deti) pouští otázky, které nejsou dětské");
kontrola(bandPool("dospeli").every(q => !q.kids), "bandPool(dospeli) pouští dětské otázky");
kontrola(bandPool("starsi").every(q => !q.kids && (q.difficulty || 1) <= 2), "bandPool(starsi) pouští otázky mimo pásmo");
// „starší" je podmnožina „dospělých" — pár otázek proto smí padnout do obou fondů, ale
// dětský fond musí zůstat oddělený, jinak by hráč viděl tutéž otázku ve dvou pásmech.
const idDeti = new Set(bandPool("deti").map(q => q.id));
kontrola(!bandPool("dospeli").some(q => idDeti.has(q.id)), "dětský a dospělácký fond se překrývají");

for (const sestava of [["deti", "dospeli"], ["deti", "starsi", "dospeli"], ["dospeli"], ["deti", "deti", "dospeli", "starsi"]]) {
  for (const kol of [3, 5, 8]) {
    S.players = sestava.map(b => ({ band: b }));
    S.totalRounds = kol;
    const poradi = buildPartyOrder();
    const P = sestava.length;
    // Zarovnání pásem stojí a padá s tím, že délka je násobek počtu hráčů: `qCurrent()`
    // přetéká přes `% S.order.length`, takže při jiné délce by se hráčům pásma prohodila.
    kontrola(poradi.length === kol * P,
      "párty " + P + " hráčů × " + kol + " kol: pořadí má " + poradi.length + " otázek, ne " + kol * P);
    kontrola(poradi.every(Boolean), "párty " + P + "×" + kol + ": v pořadí je prázdné místo");
    const spatne = poradi.filter((q, i) => q && !patriDo(q, sestava[i % P]));
    kontrola(!spatne.length, "párty " + P + "×" + kol + ": " + spatne.length + " otázek mimo pásmo hráče na tahu",
      spatne[0] ? "např. " + spatne[0].id + " u hráče v pásmu " + sestava[poradi.indexOf(spatne[0]) % P] : "");
  }
}

// Malý fond: appka na opakování upozorní (partyOpakovaniNote), ale nesmí kvůli němu
// vrátit kratší frontu ani díru — fond se domíchá znovu.
const maly = { questions: otazky.filter(q => q.kids).slice(0, 4).concat(otazky.filter(q => !q.kids).slice(0, 40)) };
const bandPoolMaly = funkce("bandPool", { data: maly });
const buildMaly = funkce("buildPartyOrder", { S, shuffle, bandPool: bandPoolMaly, Math });
S.players = [{ band: "deti" }, { band: "dospeli" }];
S.totalRounds = 8;
const maleP = buildMaly();
kontrola(maleP.length === 16, "malý fond: fronta má " + maleP.length + " otázek místo 16");
kontrola(maleP.every(Boolean), "malý fond: fronta má prázdné místo (domíchání selhalo)");
kontrola(maleP.filter((_, i) => i % 2 === 0).every(q => q.kids), "malý fond: dítě dostalo otázku mimo své pásmo");

// Body: v párty musí být správná odpověď stejně drahá pro všechna pásma. Kdyby se bodovalo
// obtížností, dětská otázka (vždy difficulty 1) by dala 100 a dospělácká 300 — dítě by
// nemohlo vyhrát ani se stoprocentní úspěšností.
S.mode = "party";
const vzorky = ["deti", "starsi", "dospeli"].map(b => bandPool(b)[0]).filter(Boolean);
kontrola(new Set(vzorky.map(qPoints)).size === 1, "v párty nemají všechna pásma stejnou cenu odpovědi");
S.mode = "solo";
kontrola(qPoints({ difficulty: 3 }) === 300 && qPoints({ difficulty: 1 }) === 100,
  "v sólu se přestalo bodovat podle obtížnosti");
kontrola(qPoints({}) === 100, "otázka bez difficulty nedává 100 bodů (chybí fallback)");

console.log("\n" + (chyb ? "NEPROŠLO: " + chyb + " chyb, " + ok + " v pořádku"
                         : "VŠE V POŘÁDKU: " + ok + " kontrol"));
process.exit(chyb ? 1 : 0);
