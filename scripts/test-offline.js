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
// Online klient se sem přidal 2026-09-02 kvůli vokativ(). `sim-online` testuje model
// ratingu a `test:api` server — samotný online.js do té doby nekontroloval nikdo.
const SRC_ONLINE = fs.readFileSync(path.join(process.cwd(), "online.js"), "utf8");

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
function funkce(jmeno, zavislosti, zdroj) {
  const src = zdroj || SRC;
  const zac = src.indexOf("function " + jmeno + "(");
  if (zac < 0) throw new Error("ve zdroji chybí funkce " + jmeno);
  let hloubka = 0, i = src.indexOf("{", zac);
  for (; i < src.length; i++) {
    if (src[i] === "{") hloubka++;
    else if (src[i] === "}") { hloubka--; if (!hloubka) break; }
  }
  const kod = src.slice(zac, i + 1);
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

// ---- popisky rozehraných her ----------------------------------------------------
// saveInfo() skládá řádek v seznamu rozehraných her. Testuje se proto, že sahá na tři
// věci, které se v projektu už jednou rozešly:
//   - `cc` je u víc zemí null a `ccs` je POLE — sestavit z něj cestu k obrázku dá
//     `assets/country-at,cz.jpg` (přesně ta chyba z 2026-09-01 na výběru témat)
//   - `section` má tři podoby (null / "__all__" / pole), takže se nesmí vypsat rovnou
//   - `band`/`level` přibyly do `meta` až 2026-09-02 — starší uložené hry je mají jen
//     ve `state` a musí se dobrat odtamtud
sekce("Rozehrané hry: popisek nesmí lhát ani prozradit „__all__\"");
const SECTION_LABEL = konstanta("SECTION_LABEL");
const BAND_NAMES = konstanta("BAND_NAMES");
const SCHOOL_LEVELS = konstanta("SCHOOL_LEVELS");
const sectionLabel = funkce("sectionLabel", { SECTION_LABEL, plur });
const vyctem = funkce("vyctem", {});
const velke = funkce("velke", { String });
const saveInfo = funkce("saveInfo", { COUNTRY_BY_CC, BAND_NAMES, SCHOOL_LEVELS, sectionLabel, vyctem, velke, plur, relCas: () => "včera" });

// Pravidlo z 2026-09-01, znovu vymáhané 2026-09-02: ŽÁDNÝ TEXT V APPCE NEZAČÍNÁ MALÝM
// PÍSMENEM — a hodnota za dvojtečkou („Úroveň obtížnosti: děti") je taky začátek textu.
// Konstanty jako BAND_NAMES zůstávají malé, protože uvnitř věty se hodí; velké písmeno
// nasazuje až velke() při zobrazení. Tahle kontrola hlídá, že se to nevytratí.
kontrola(velke("děti") === "Děti", "velke() nezvětšuje první písmeno");
kontrola(velke("") === "" && velke(null) === "", "velke() spadne na prázdné hodnotě");
kontrola(velke("★★ Střední") === "★★ Střední", "velke() poškodilo text začínající hvězdičkou");

const info = (meta, state) => saveInfo({ ts: 1, meta, state: state || {} });

const jednaZeme = info({ mode: "solo", band: "dospeli", cc: "cz", ccs: ["cz"], section: "Historie",
                         players: [{ band: "dospeli" }], idx: 3, count: 10 });
kontrola(jednaZeme.coHral === "Sólo · Česko · Historie", "sólo „Co jsi hrál\" je '" + jednaZeme.coHral + "'");
kontrola(jednaZeme.obr === "assets/country-cz.jpg", "špatná cesta k obrázku: " + jednaZeme.obr);
kontrola(jednaZeme.uroven === "Dospělí", "pásmo se nepřeložilo, je tam " + jednaZeme.uroven);
kontrola(jednaZeme.postup === "Otázka 4/10", "sólo postup je " + jednaZeme.postup + ", má být Otázka 4/10");
kontrola(jednaZeme.kdy === "Včera", "čas se nedostal do popisku, je tam '" + jednaZeme.kdy + "'");

const vicZemi = info({ mode: "solo", band: "deti", cc: null, ccs: ["at", "cz", "sk"], section: "__all__",
                       players: [{ band: "deti" }], idx: 0, count: 10 });
kontrola(!vicZemi.obr.includes(","), "u víc zemí se sestavila cesta s čárkou: " + vicZemi.obr);
kontrola(/3 země/.test(vicZemi.coHral), "víc zemí se nepopsalo počtem, je tam " + vicZemi.coHral);
kontrola(!/__all__/.test(vicZemi.coHral), "„__all__\" prosáklo do popisku: " + vicZemi.coHral);

const poleTemat = info({ mode: "solo", band: "deti", cc: "cz", section: ["Sport", "Jídlo", "Umění", "Historie", "Lidé"],
                         players: [{ band: "deti" }], idx: 0, count: 10 });
kontrola(/5 témat$/.test(poleTemat.coHral), "pole témat se nespočítalo/neskloňovalo, je tam " + poleTemat.coHral);

// Párty: pásmo má každý hráč své, jedno jméno by lhalo — vypíšou se všechna, co u stolu jsou.
// Hráči jsou schválně v rozhozeném pořadí a jedno pásmo je dvakrát: výstup musí být
// odshora podle VĚKU a bez opakování, ne v pořadí, v jakém se lidi zapsali ke stolu.
const party = info({ mode: "party", band: "dospeli", cc: "cz", section: null,
                     players: [{ band: "dospeli" }, { band: "deti" }, { band: "starsi" }, { band: "deti" }],
                     round: 2, totalRounds: 8 });
kontrola(/4 hráči/.test(party.coHral), "párty neukazuje počet hráčů, je tam " + party.coHral);
kontrola(party.uroven === "Děti, puberťáci a dospělí",
  "párty pásma nejsou odshora podle věku nebo se opakují, je tam '" + party.uroven + "'");
kontrola(party.postup === "Kolo 2/8", "párty postup je " + party.postup + ", má být Kolo 2/8");

// Škola pásmo nepoužívá vůbec (startSchool filtruje podle schoolLevel), takže zděděná
// hodnota ze sóla by tam přímo lhala. Popisek musí sedět s tlačítky v renderSchoolStart.
const skola = info({ mode: "solo", school: true, band: "dospeli", level: 2, cc: "jp", section: "Příroda",
                     players: [{ band: "deti" }], idx: 0, count: 20 });
kontrola(/^Škola · /.test(skola.coHral), "škola se hlásí jako " + skola.coHral);
kontrola(skola.uroven === "★★ Střední", "škola neukazuje svou úroveň, je tam '" + skola.uroven + "'");
kontrola(!Object.values(BAND_NAMES).includes(skola.uroven), "škola ukazuje pásmo, které vůbec nepoužívá (filtruje podle schoolLevel)");

// Starší uložená hra: meta bez band/ccs/level a bez pásem u hráčů — všechno jen ve state.
const stare = info({ mode: "solo", cc: "pt", section: "Historie", players: [{ name: "Ty" }], idx: 0, count: 15 },
                   { band: "starsi", ccs: ["pt"], schoolLevel: 1, players: [{ band: "starsi" }] });
kontrola(stare.uroven === "Puberťáci", "starší uložená hra ztratila pásmo (fallback na state nefunguje), je tam '" + stare.uroven + "'");

// Starší PÁRTY: `meta.players` existují a mají správný počet, ale `band` u nich chybí
// (přibyl 2026-09-02). Fallback se proto nesmí ptát na počet hráčů, ale na to, jestli
// pásmo vůbec nesou — jinak tahle hra hlásí „různá podle hráče" zbytečně.
const starePárty = info({ mode: "party", cc: "cz", section: null, round: 1, totalRounds: 5,
                          players: [{ name: "Eva", color: "#e2725b" }, { name: "Jan", color: "#2a7f7f" }] },
                        { players: [{ band: "deti" }, { band: "dospeli" }] });
kontrola(starePárty.uroven === "Děti a dospělí",
  "starší párty ztratila pásma hráčů (fallback se ptá na počet místo na pásmo), je tam '" + starePárty.uroven + "'");
kontrola(/2 hráči/.test(starePárty.coHral), "starší párty ztratila počet hráčů, je tam " + starePárty.coHral);

// ---- oslovení v online lobby ----------------------------------------------------
// vokativ() je ÚMYSLNĚ NEÚPLNÝ: skloňuje jen tam, kde české pravidlo nemá výjimku,
// a jinak vrátí null, aby se jméno z pozdravu vynechalo. Tenhle test tu je hlavně
// proto, aby to někdo „nevylepšil" na obecné pravidlo — z „Petr" by pak vzniklo
// „Petre" (správně je Petře) a z generované dětské přezdívky úplný nesmysl.
sekce("Online: oslovení skloňuj jen tam, kde to má jistotu");
const vokativ = funkce("vokativ", { String, RegExp }, SRC_ONLINE);

const SPRAVNE = { "Kuba": "Kubo", "Eva": "Evo", "Honza": "Honzo", "Tereza": "Terezo",
  "Marek": "Marku", "Radek": "Radku", "Tomáš": "Tomáši", "Ondřej": "Ondřeji",
  "Dominik": "Dominiku", "Vojtěch": "Vojtěchu", "Jan": "Jane", "Martin": "Martine",
  "Adam": "Adame", "Michal": "Michale", "Ivo": "Ivo", "Marie": "Marie", "Jiří": "Jiří" };
for (const [jm, ocek] of Object.entries(SPRAVNE))
  kontrola(vokativ(jm) === ocek, "vokativ(\"" + jm + "\") dal \"" + vokativ(jm) + "\", má být \"" + ocek + "\"");

// Tyhle MUSÍ vrátit null. Kdyby se někdy doplnily, ať to je vědomé rozhodnutí
// s ověřením, ne vedlejší efekt zobecnění nějakého jiného pravidla.
const NESMI = {
  "Petr": "-r má dvě pravidla (Petr→Petře, ale Viktor→Viktore)",
  "Pavel": "-el má dvě pravidla (Pavel→Pavle, ale Daniel→Danieli)",
  "Karel": "-el, viz Pavel",
  "Daniel": "-el, viz Pavel",
  "Veselý krtek 20": "generovaná dětská přezdívka, není to jméno",
  "xXx_Alex": "přezdívka s podtržítkem, ne jméno",
  "A": "jedno písmeno",
  "": "prázdná přezdívka",
};
for (const [jm, proc] of Object.entries(NESMI))
  kontrola(vokativ(jm) === null, "vokativ(\"" + jm + "\") vrátil \"" + vokativ(jm) + "\" místo null — " + proc);
kontrola(vokativ(null) === null && vokativ(undefined) === null, "vokativ() spadne na chybějící přezdívce");

// Uvítací texty lobby. Appka NEZNÁ POHLAVÍ hráče, takže v nich nesmí být minulý čas
// s rodem („zapsal ses", „věděl jsi") — stejné pravidlo jako u `_verdikt` v fondy.json.
// A protože se texty vybírají podle pásma, musí je mít všechna tři kompletní; chybějící
// klíč by se projevil až „undefined" na obrazovce přihlášeného hráče.
const LOBBY_TEXTY = (() => {
  const m = /var\s+LOBBY_TEXTY\s*=/.exec(SRC_ONLINE);
  if (!m) throw new Error("v online.js chybí LOBBY_TEXTY");
  let hloubka = 0, i = SRC_ONLINE.indexOf("{", m.index), zac = i;
  for (; i < SRC_ONLINE.length; i++) {
    if (SRC_ONLINE[i] === "{") hloubka++;
    else if (SRC_ONLINE[i] === "}") { hloubka--; if (!hloubka) break; }
  }
  return vm.runInNewContext("(" + SRC_ONLINE.slice(zac, i + 1) + ")");
})();
const KLICE = ["uvod", "pasmo", "souperi", "rating0", "ratingN"];
for (const band of ["deti", "starsi", "dospeli"]) {
  const t = LOBBY_TEXTY[band];
  kontrola(t, "LOBBY_TEXTY nemá pásmo " + band + " — hráči by se ukázalo undefined");
  for (const k of KLICE) kontrola(t && t[k], "LOBBY_TEXTY." + band + " nemá „" + k + "\"");
  for (const k of KLICE) {
    const v = (t && t[k]) || "";
    // 2. osoba minulého času: sloveso na -l/-la + „jsi"/„ses"/„sis"
    const rod = v.match(/\S*l[aoiy]?\s+(jsi|ses|sis)\b/i);
    kontrola(!rod, "LOBBY_TEXTY." + band + "." + k + " má minulý čas s rodem: „" + (rod && rod[0]) + "\"",
      "appka nezná pohlaví hráče — přeformuluj do přítomného času");
    kontrola(!/^[a-záčďéěíňóřšťúůýž]/.test(v.replace(/^<[^>]+>/, "")) || k === "uvod",
      "LOBBY_TEXTY." + band + "." + k + " začíná malým písmenem: „" + v.slice(0, 40) + "\"");
    // Bot se v uvítání NESLIBUJE. Je to náhradní řešení pro prázdnou frontu, ne důvod,
    // proč sem jít — kdo si přečte „když nikdo není online, nastoupí bot", tomu se
    // hrát nechce. Nabízí se až v čekárně, kde už hráč čeká a je to služba, ne slib
    // (viz `zk-bot` v startQueue). Stejné rozhodnutí jako u dlaždice Online 2026-08-31.
    kontrola(!/\bbot|\brobot/i.test(v),
      "LOBBY_TEXTY." + band + "." + k + " slibuje bota: „" + v.slice(0, 60) + "\"",
      "bota nabízej až v čekárně, ne v uvítání");
  }
}
// Totéž pro dlaždici „Hrát teď" — je to první věc, kterou hráč po přihlášení vidí.
const heroPopis = (/<span class="d">([^<]*)<\/span><\/span>/.exec(SRC_ONLINE) || [])[1] || "";
kontrola(heroPopis && !/\bbot/i.test(heroPopis),
  "dlaždice Hrát teď slibuje bota: „" + heroPopis + "\"");

console.log("\n" + (chyb ? "NEPROŠLO: " + chyb + " chyb, " + ok + " v pořádku"
                         : "VŠE V POŘÁDKU: " + ok + " kontrol"));
process.exit(chyb ? 1 : 0);
