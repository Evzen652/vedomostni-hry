"use strict";
/**
 * merge-sections.js — rozpustí sekce „Symboly" a „Zajímavosti" do zbylých devíti.
 *
 * Proč: obě vznikly 2026-08-30 při sjednocování sekcí, ale byly to nejmenší sekce
 * fondu (104 a 90 otázek) a „Zajímavosti" byla přiznaně sběrná škatulka. Rozhodnutí
 * 2026-09-01: devět témat stačí, dlaždice mají být plné.
 *
 * Mapa je RUČNÍ, otázka po otázce. Klíčovými slovy to nejde: „Jaké zvíře je na
 * státním znaku Polska?" je heraldika (Kultura & tradice), kdežto „Jaký pták je
 * národním ptákem Indie?" je příroda — obě mají v textu zvíře i slovo národní.
 *
 * Skript SPADNE, když v datech najde otázku z rušené sekce, kterou mapa nezná.
 * To je schválně: nezmapovaná otázka by zůstala v sekci, kterou už výběr témat
 * nenabízí, a stala by se nedosažitelnou (přesně chyba, kterou řešil 2026-08-30).
 *
 * Spuštění:  node scripts/merge-sections.js [--dry]
 */
const fs = require("fs");
const path = require("path");

const RUSENE = new Set(["Symboly", "Zajímavosti"]);

// id → nová sekce
const MAPA = {
  // ---- Symboly: vlajky, znaky, hymny, standarty, měna → Kultura & tradice ----
  "ar-k-vlajka": "Kultura & tradice",
  "at-k-vlajka": "Kultura & tradice",
  "bg-k-vlajka": "Kultura & tradice",
  "bg-k-lion-coat-of-arms": "Kultura & tradice",
  "br-k-vlajka": "Kultura & tradice",
  "ca-k-vlajka": "Kultura & tradice",
  "cl-k-vlajka": "Kultura & tradice",
  "cn-k-drak": "Kultura & tradice",
  "cz-k-lev": "Kultura & tradice",
  "cz-k-flag-triangle": "Kultura & tradice",
  "cz-k-vlajka-pocet-barev": "Kultura & tradice",
  "cz-k-vlajka-poradi-pruhu": "Kultura & tradice",
  "cz-k-znak-lev-korunka": "Kultura & tradice",
  "cz-k-znak-cervene-pole": "Kultura & tradice",
  "cz-k-hymna-nazev": "Kultura & tradice",
  "cz-k-mena-koruna": "Kultura & tradice",
  "cz-k-prezidentska-standarta": "Kultura & tradice",
  "cz-t-standarta-heslo": "Kultura & tradice",
  "cz-k-maly-znak-jeden-lev": "Kultura & tradice",
  "cz-k-jezisek": "Kultura & tradice",
  "cz-k-mince-lev": "Kultura & tradice",
  "cz-k-klin-smer": "Kultura & tradice",
  "cz-k-moravska-orlice": "Kultura & tradice",
  "cz-k-lev-jazyk-drapy": "Kultura & tradice",
  "cz-k-lev-postoj": "Kultura & tradice",
  "cz-k-standarta-auto": "Kultura & tradice",
  "cz-k-znak-pas": "Kultura & tradice",
  "cz-k-vlajka-proc-klin-polsko": "Kultura & tradice",
  "cz-k-hymna-jedna-sloka": "Kultura & tradice",
  "cz-k-hymna-ticha": "Kultura & tradice",
  "cz-k-znak-policie": "Kultura & tradice",
  "cz-k-vlajka-barvy-slovane": "Kultura & tradice",
  "de-k-orel": "Kultura & tradice",
  "de-k-flag-colors": "Kultura & tradice",
  "ec-k-vlajka": "Kultura & tradice",
  "eg-k-vlajka-zlaty-orel": "Kultura & tradice",
  "es-k-byk": "Kultura & tradice",
  "es-k-flag-colors": "Kultura & tradice",
  "fr-k-vlajka-barvy": "Kultura & tradice",
  "fr-k-kohout": "Kultura & tradice",
  "ga-k-vlajka": "Kultura & tradice",
  "gb-k-velsska-vlajka-drak": "Kultura & tradice",
  "gr-k-vlajka": "Kultura & tradice",
  "gr-k-mati-blue-eye-charm": "Kultura & tradice",
  "hu-k-madarska-vlajka": "Kultura & tradice",
  "ch-k-vlajka": "Kultura & tradice",
  "id-k-garuda": "Kultura & tradice",
  "il-k-vlajka": "Kultura & tradice",
  "in-k-vlajka": "Kultura & tradice",
  "it-t-lamborghini": "Kultura & tradice",
  "it-k-vlajka": "Kultura & tradice",
  "mn-k-vlajka": "Kultura & tradice",
  "mx-k-vlajka-orel": "Kultura & tradice",
  "mx-k-sombrero": "Kultura & tradice",
  "my-t-vlajka": "Kultura & tradice",
  "no-k-vlajka": "Kultura & tradice",
  "pe-k-vlajka": "Kultura & tradice",
  "ph-k-vlajka": "Kultura & tradice",
  "pk-k-vlajka": "Kultura & tradice",
  "pl-k-orel": "Kultura & tradice",
  "pl-k-vlajka": "Kultura & tradice",
  "pl-k-hymna-mazurek-dabrowskiego": "Kultura & tradice",
  "pt-k-galo-barcelos": "Kultura & tradice",
  "ru-k-medved-symbol": "Kultura & tradice",
  "sa-k-vlajka": "Kultura & tradice",
  "se-k-vlajka": "Kultura & tradice",
  "sk-k-erb": "Kultura & tradice",
  "th-k-vlajka": "Kultura & tradice",
  "tr-k-vlajka": "Kultura & tradice",
  "ua-k-vlajka": "Kultura & tradice",
  "ua-t-tryzub-znak": "Kultura & tradice",
  "us-k-vlajka-hvezdy": "Kultura & tradice",
  "us-t-dolar-symboly": "Kultura & tradice",
  "vn-k-vlajka": "Kultura & tradice",
  "za-k-vlajka": "Kultura & tradice",
  "za-k-duhovy-narod": "Kultura & tradice",

  // ---- Symboly: národní rostliny a zvířata jako živí tvorové → Příroda ----
  "ar-t-ceibo-narodni-kvetina": "Příroda",
  "cl-t-flor-copihue": "Příroda",
  "cz-k-lipa-narodni-strom": "Příroda",
  "cz-k-lipa-list-tvar": "Příroda",
  "in-k-pavlin": "Příroda",
  "kp-k-narodni-kvetina": "Příroda",
  "kr-t-mugunghwa": "Příroda",
  "nz-k-kapradina": "Příroda",
  "ph-k-sampaguita": "Příroda",
  "th-t-narodni-kvetina": "Příroda",

  // ---- Symboly: vázané na konkrétní místo → Místa ----
  "cz-k-klenoty-katedrala": "Místa",
  "de-k-berlin-medved": "Místa",
  "de-t-autoban": "Místa",
  "eg-k-sfinga": "Místa",
  "gb-k-autobus": "Místa",
  "it-k-tvar": "Místa",
  "us-k-socha-svobody": "Místa",

  // ---- Symboly: původ v čase → Historie ----
  "at-t-vlajka-povest": "Historie",
  "cz-k-svatovaclavska-koruna": "Historie",
  "cz-k-vlajka-po-rozdeleni": "Historie",
  "fr-t-fleur-de-lis": "Historie",
  "ch-k-cervenokrizkovy-znak": "Historie",

  // ---- Symboly: ostatní ----
  "cz-k-hymna-puvod-hra": "Umění",
  "es-k-spanish-guitar": "Umění",
  "cz-t-hymna-skladatel": "Lidé",
  "cz-t-hymna-autor-textu": "Lidé",
  "it-t-pismo": "Jazyk & slova",
  "cz-k-vlajka-sport": "Sport",

  // ---- Zajímavosti: doprava, stavby, geografie → Místa ----
  "be-t-mala-zeme": "Místa",
  "ca-t-capilano-most": "Místa",
  "ca-t-confederation-bridge": "Místa",
  "ca-t-vlak-the-canadian": "Místa",
  "ca-t-rocky-mountaineer": "Místa",
  "ca-t-toronto-pearson": "Místa",
  "ca-t-ambassador-bridge": "Místa",
  "ca-k-toronto-tramvaje": "Místa",
  "cn-k-vysokorychlostni-vlak": "Místa",
  "de-a-deutsche-bahn": "Místa",
  "dk-t-maersk": "Místa",
  "dk-t-cyklostezky": "Místa",
  "fi-a-aland": "Místa",
  "fj-t-datumova-hranice": "Místa",
  "fj-a-turismus-hdp": "Místa",
  "fj-k-datova-hranice": "Místa",
  "fr-a-casova-pasma": "Místa",
  "jp-k-shinkansen": "Místa",
  "jp-t-mrakodrapy-zemetreseni": "Místa",
  "no-a-antarktida": "Místa",
  "ru-k-transsib-delka": "Místa",
  "ru-k-russkij-most-vladivostok": "Místa",
  "se-k-icehotel": "Místa",
  "sk-k-ciernohronska-zeleznica": "Místa",
  "sk-a-bratislavske-metro": "Místa",
  "us-t-silicon-valley": "Místa",
  "us-a-wall-street": "Místa",

  // ---- Zajímavosti: události, politika, hospodářství, původ firem → Historie ----
  "be-a-nato": "Historie",
  "cn-k-papir": "Historie",
  "cn-a-velky-firewall": "Historie",
  "cn-t-hongkong": "Historie",
  "cn-a-reforma-otevirani": "Historie",
  "cn-a-hedvabna-stezka-nova": "Historie",
  "cn-a-vesmirny-program": "Historie",
  "eg-k-kocky": "Historie",
  "eg-a-alexandrijsky-majak": "Historie",
  "eg-a-revoluce-2011": "Historie",
  "fi-a-branna-povinnost": "Historie",
  "fj-a-ustava": "Historie",
  "fj-a-rada-nacelniku": "Historie",
  "jp-a-dluh": "Historie",
  "jp-a-ustava-clanek9": "Historie",
  "jp-a-mira-odsouzeni": "Historie",
  "jp-a-nintendo-karty": "Historie",
  "ke-a-devoluce": "Historie",
  "mx-a-narkokartely": "Historie",
  "no-a-ustava-17-kvetna": "Historie",
  "pt-a-eu-vstup": "Historie",
  "sk-a-automobilova-velmoc": "Historie",
  "us-t-levis-jeans": "Historie",
  "us-a-area51": "Historie",
  "us-k-nasa": "Historie",
  "us-a-bill-of-rights": "Historie",
  "za-k-diamanty": "Historie",
  "za-a-load-shedding": "Historie",
  "za-a-ustava-lgbt": "Historie",
  "za-a-manzelstvi": "Historie",

  // ---- Zajímavosti: jak se žije, zvyky, peníze v ruce → Kultura & tradice ----
  "au-k-bankovky": "Kultura & tradice",
  "cn-k-hedvabi": "Kultura & tradice",
  "cn-k-mahjong": "Kultura & tradice",
  "fi-k-angry-birds": "Kultura & tradice",
  "fi-a-supercell": "Kultura & tradice",
  "fj-t-mena": "Kultura & tradice",
  "ie-k-euro": "Kultura & tradice",
  "jp-t-prodejni-automaty": "Kultura & tradice",
  "jp-k-karaoke": "Kultura & tradice",
  "jp-t-kapslovy-hotel": "Kultura & tradice",
  "jp-a-oshiya": "Kultura & tradice",
  "ke-k-matatu": "Kultura & tradice",
  "ke-t-mpesa": "Kultura & tradice",
  "kr-k-ondol-podlaha": "Kultura & tradice",
  "no-a-elektromobily": "Kultura & tradice",
  "th-k-songkran-voda": "Kultura & tradice",

  // ---- Zajímavosti: zvířata, rostliny, krajina, klima → Příroda ----
  "au-a-ropucha-obrovska": "Příroda",
  "dk-k-svine": "Příroda",
  "eg-k-bavlna": "Příroda",
  "fj-a-klima": "Příroda",
  "ga-k-narodni-parky": "Příroda",
  "ke-a-safari-ekonomika": "Příroda",
  "sa-k-rub-al-chali": "Příroda",

  // ---- Zajímavosti: jídlo a pití → Jídlo ----
  "ca-k-milk-bags": "Jídlo",
  "fj-t-lahvova-voda": "Jídlo",
  "ke-t-caj-vyvoz": "Jídlo",
  "nz-a-fonterra": "Jídlo",
  "vn-k-kava-vyvoz": "Jídlo",

  // ---- Zajímavosti: sport a hry venku → Sport ----
  "ca-k-backyard-rink": "Sport",
  "ca-k-tobogganing": "Sport",
  "pk-k-sialkot-mice": "Sport",

  // ---- Zajímavosti: konkrétní člověk → Lidé ----
  "be-a-baudouin": "Lidé",
  "dk-t-bluetooth": "Lidé",
};

const dry = process.argv.includes("--dry");
const dir = path.join(process.cwd(), "data", "questions");

let zmeneno = 0, nezname = [], nepouzite = new Set(Object.keys(MAPA));
const rozpis = {};

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  const p = path.join(dir, f);
  const arr = JSON.parse(fs.readFileSync(p, "utf8"));
  let dotceno = false;

  for (const q of arr) {
    if (!RUSENE.has(q.section)) continue;
    const nova = MAPA[q.id];
    if (!nova) { nezname.push(q.id + "  (" + q.section + ")  " + q.question); continue; }
    nepouzite.delete(q.id);
    q.section = nova;
    rozpis[nova] = (rozpis[nova] || 0) + 1;
    zmeneno++; dotceno = true;
  }

  // Formát souborů: odsazení 1 mezerou + CRLF. Bez tohohle by se přeformátoval
  // celý soubor a z diffu o pár řádcích by byly desetitisíce (past z 2026-08-30).
  if (dotceno && !dry) {
    fs.writeFileSync(p, JSON.stringify(arr, null, 1).replace(/\n/g, "\r\n"), "utf8");
  }
}

if (nezname.length) {
  console.error("CHYBA: " + nezname.length + " otázek z rušených sekcí není v mapě.");
  console.error("Zůstaly by v sekci, kterou výběr témat nenabízí, tedy NEDOSAŽITELNÉ:\n");
  for (const n of nezname) console.error("  " + n);
  process.exit(1);
}

console.log((dry ? "[zkušebně] " : "") + "přeřazeno " + zmeneno + " otázek\n");
for (const [s, n] of Object.entries(rozpis).sort((a, b) => b[1] - a[1])) {
  console.log("  " + String(n).padStart(3) + "  → " + s);
}
if (nepouzite.size) {
  console.log("\nPozn.: " + nepouzite.size + " id z mapy se v datech nenašlo:");
  for (const id of nepouzite) console.log("  " + id);
}
