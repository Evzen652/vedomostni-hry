// Mechanický audit kvality otázek a hlášek. Spouštět z kořene repa: node scripts/audit-questions.js
// Vypíše souhrn do konzole a uloží nálezy do data/audit.json, které čte admin.html (odznaky u otázek).
//
// POZOR: audit jen VYTIPUJE podezřelá místa heuristikou — nesoudí definitivně. Vtipnost a věkovou
// vhodnost pro pásmo 8–11 mechanicky spolehlivě neposoudíš; od toho je můj plošný průchod (data/judgment.json)
// a hlavně ruční revize v adminu. Kódy nálezů drž v synci s admin.html (mapa AUDIT_LABELS).
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = process.cwd();
const QDIR = path.join(ROOT, "data", "questions");
const CDIR = path.join(ROOT, "data", "cards");

// ---- textové helpery (čeština: NFD + odstranění diakritiky, ať shody nezávisí na háčcích) ----
const STOP = new Set(("a i o u v k s z na do od po za pro při že se si to ten ta ty tam kde kdo co jak "
  + "je jsou byl byla bylo být jako nebo ale ani až už jen jenž který která které jehož jejíž jež "
  + "svůj svá své jeho její jejich náš naše můj má mé už tak také však proto pak když aby než mezi "
  + "před nad pod bez okolo kolem podle vedle skrz o ve ze mi mě ho jí je jim nám vám jim").split(/\s+/));
const stripDia = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = s => stripDia(String(s || "").toLowerCase()).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const tokens = s => norm(s).split(" ").filter(w => w.length > 3 && !STOP.has(w));
const tokSet = s => new Set(tokens(s));
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
// hlášky můžou být string, nebo objekt {deti, dospeli, default} — vrať všechny varianty jako pole
function quipStrings(q, key) {
  const v = q[key];
  if (v == null) return [];
  if (typeof v === "string") return [v];
  if (typeof v === "object") return Object.values(v).filter(x => typeof x === "string");
  return [];
}

// ---- načtení dat ----
const qFiles = fs.existsSync(QDIR) ? fs.readdirSync(QDIR).filter(f => f.endsWith(".json")) : [];
const byId = {};                        // id -> [ {code, sev, msg} ]
const add = (id, code, sev, msg) => { (byId[id] = byId[id] || []).push({ code, sev, msg }); };
const codeCounts = {};
const bump = code => codeCounts[code] = (codeCounts[code] || 0) + 1;

let qTotal = 0;
const perCc = {};                       // cc -> [ {id, explTokens, difficulty} ] pro detekci duplicit

for (const f of qFiles) {
  let list;
  try { list = JSON.parse(fs.readFileSync(path.join(QDIR, f), "utf8")); }
  catch (e) { continue; }
  if (!Array.isArray(list)) continue;
  for (const q of list) {
    if (!q || !q.id) continue;
    qTotal++;
    const id = q.id;
    const ans = String(q.answer || "");
    const expl = String(q.explanation || "");
    const qtext = String(q.question || "");
    const qwAll = quipStrings(q, "quip_wrong");
    const qcAll = quipStrings(q, "quip_correct");
    const nAns = norm(ans);
    const ansTok = tokSet(ans), explTok = tokSet(expl), topicTok = tokSet(qtext + " " + ans);

    // C1: quip_wrong jen přepisuje odpověď (doslovně, nebo vysoký překryv) — bez vtipu
    for (const qw of qwAll) {
      const nqw = norm(qw);
      if (nAns.length > 8 && nqw.includes(nAns)) { add(id, "quip_wrong_opakuje", "flag", `quip_wrong doslovně obsahuje odpověď „${ans}“ — chybí nadhled`); bump("quip_wrong_opakuje"); break; }
      if (jaccard(tokSet(qw), ansTok) > 0.6) { add(id, "quip_wrong_opakuje", "warn", "quip_wrong se obsahem skoro kryje s odpovědí — nejspíš bez vtipu"); bump("quip_wrong_opakuje"); break; }
    }

    // C2: quip_correct parafrázuje explanation (hráč čte totéž dvakrát)
    for (const qc of qcAll) {
      // práh nízký schválně: jaccard na ohýbané češtině parafrázi podceňuje, tohle jsou jen kandidáti k ruční kontrole
      if (jaccard(tokSet(qc), explTok) > 0.25) { add(id, "quip_paraf_expl", "warn", "quip_correct se slovně kryje s vysvětlením — možná parafráze (každá vrstva má nést jinou informaci)"); bump("quip_paraf_expl"); break; }
    }

    // C3: berlička „X je jako Y" / „jako by"
    for (const qq of [...qwAll, ...qcAll]) {
      if (/\bje jako\b|\bjako by\b/.test(norm(qq))) { add(id, "sablona_jako", "warn", "hláška používá šablonu „je jako / jako by“ (appka ji nadužívá)"); bump("sablona_jako"); break; }
    }

    // C4 (slabý signál): quip_wrong se možná netýká testovaného faktu
    for (const qw of qwAll) {
      // Porovnávají se KMENY (prvních 5 znaků), ne celé tvary. Čeština slova ohýbá, takže
      // hláška „…hledej v Kierkegaardovi“ nesdílela s odpovědí „Kierkegaard“ ani jeden token
      // a kontrola ji označila za mimo téma. Na vzorku byly takhle planě nahlášené všechny
      // prověřené případy — přesná shoda tvarů je na češtinu prostě nepoužitelná.
      const kmen = x => x.length > 5 ? x.slice(0, 5) : x;
      const topicKmen = new Set([...topicTok].map(kmen));
      const t = tokSet(qw);
      if (t.size >= 4) { let ov = 0; for (const x of t) if (topicKmen.has(kmen(x))) ov++; if (ov === 0) { add(id, "hlaska_mimo", "warn", "quip_wrong nesdílí žádné klíčové slovo s otázkou/odpovědí — možná mluví o něčem jiném"); bump("hlaska_mimo"); break; } }
    }

    // C6: červené vlajky pro DĚTSKÝ fond (8–11).
    // Klíč je `q.kids`, NE `difficulty === 1`. Původně to na difficulty viselo, jenže:
    //   (a) pásmo „6–9" bylo zrušeno 2026-08-14 a nahrazeno pásmem „děti" 8–11,
    //   (b) `difficulty` od té doby NEZNAMENÁ věk — je to hvězdičkové hodnocení uvnitř
    //       obecného fondu psaného pro dospělé; věk hlídá výhradně `q.kids`.
    // Na difficulty tedy kontrola hlásila ~950 nálezů o pásmu, které neexistuje (letopočet
    // v lehké otázce pro dospělé je zcela v pořádku), a zároveň skutečný dětský fond MINULA.
    if (q.kids) {
      // Letopočet se hlídá jen v ODPOVĚDI. Ročník v zadání je totiž pouhá kulisa
      // („v roce 1998 v Naganu… jak se tomu přezdívá?“) a dítě ho znát nemusí; červená
      // vlajka je až případ, kdy je letopočet tím, co se po dítěti chce. Kontrola na celý
      // text hlásila 9 nálezů a všech 9 byly plané poplachy — včetně „Taipei 101“
      // a „přes 350 schodů“, které se chytly jako letopočet.
      if (/\b(1\d{3}|20\d{2})\b/.test(ans) || /\bstolet/.test(norm(ans))) { add(id, "kids_letopocet", "warn", "letopočet nebo století jako ODPOVĚĎ — pro 8–11 náročné"); bump("kids_letopocet"); }
      const longW = (qtext + " " + ans).split(/\s+/).find(w => stripDia(w).replace(/[^A-Za-z]/g, "").length > 13);
      if (longW) { add(id, "kids_dlouhe_slovo", "warn", `dlouhé/odborné slovo „${longW}“ — pro 8–11 náročné`); bump("kids_dlouhe_slovo"); }
      // SLABÝ SIGNÁL, ber s rezervou: sekce není totéž co abstraktnost. Na vzorku byly nálezy
      // jako Horymír se Šemíkem nebo didgeridoo — pro dítě naopak velmi konkrétní a obrazné.
      if (q.section === "Historie" || q.section === "Umění") { add(id, "kids_abstraktni", "warn", `abstraktní téma (${q.section}) v dětském fondu`); bump("kids_abstraktni"); }
      // Práh 150 znaků, ne 90: devadesátka byla nastavená pro zrušené pásmo 6–9 a v dnešním
      // dětském fondu (8–11) sedí přesně na MEDIÁNU (91 znaků), takže označovala půlku fondu.
      // 150 je zhruba 90. percentil — tedy skutečné odlehlé případy (8 % fondu).
      // SLABÝ SIGNÁL: u dětských otázek bývá délka navíc KULISA, která pomáhá („gaučo tráví dny
      // v sedle na pláni zvané pampa. Co si přehazuje přes ramena?“) — zkrácení by ubralo oporu.
      if (qtext.length > 150) { add(id, "kids_dlouha_otazka", "warn", `dlouhá otázka (${qtext.length} znaků) pro 8–11`); bump("kids_dlouha_otazka"); }
      // Číslice kdekoli v odpovědi je k ničemu — chytala „Vokativ (5. pád)“ i „Ponte 25 de Abril“.
      // Jde o to, jestli je odpovědí ČÍSELNÝ ODHAD, ne jestli se v názvu vyskytuje číslo.
      const cisloOdpoved = /^[\s\d.,]+$/.test(ans.trim()) || /^\s*\d/.test(ans.trim())
        || /\b\d+\s*(kg|km|cm|mm|m|l|let|roků|metrů|kilometrů|stupňů|procent|%)\b/i.test(ans)
        || /\b(milion|miliard|tis[ií]c|stovek|des[ií]tek)/i.test(ans);
      if (cisloOdpoved) { add(id, "kids_cislo", "warn", "číselný odhad jako odpověď — pro 8–11 náročné"); bump("kids_cislo"); }
    }

    (perCc[q.cc] = perCc[q.cc] || []).push({ id, explTok });
  }
}

// C5: duplicitní fakt v rámci jedné země (porovnání explanation po dvojicích)
for (const cc of Object.keys(perCc)) {
  const arr = perCc[cc];
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    if (jaccard(arr[i].explTok, arr[j].explTok) > 0.4) {
      add(arr[i].id, "duplicita", "warn", `možný duplicitní fakt s otázkou ${arr[j].id}`);
      add(arr[j].id, "duplicita", "warn", `možný duplicitní fakt s otázkou ${arr[i].id}`);
      bump("duplicita");
    }
  }
}

// ---- výstup ----
const flagged = Object.keys(byId).length;
const out = { generated: new Date().toISOString(), qTotal, flagged, codeCounts, byId };
fs.writeFileSync(path.join(ROOT, "data", "audit.json"), JSON.stringify(out, null, 1));

console.log(`Audit hotov: ${qTotal} otázek, ${flagged} s aspoň jedním nálezem.\n`);
const order = Object.entries(codeCounts).sort((a, b) => b[1] - a[1]);
if (order.length) { console.log("Nálezy podle typu:"); for (const [c, n] of order) console.log(`  ${String(n).padStart(4)} × ${c}`); }
else console.log("Žádné nálezy.");
console.log("\nDetail uložen do data/audit.json (čte ho admin.html).");
