// Audit obsahu a konzistence (2026-09-10) — doplněk k validate / audit / lint-facts.
// `npm run audit:konzistence`. Nic nemění, jen čte a hlásí; plný výpis do
// data/audit-konzistence.json (do dist/ nejde).
//
// Hlídá věci, které ostatní nástroje nepokrývají. Každá kontrola odpovídá nálezu,
// který se v projektu opravdu našel, a u každé je napsané, co je na ní ŠUM:
//
//  - skoro_duplicita / stejna_odpoved_spolecne_pasmo — tentýž fakt dvakrát v jednom fondu.
//    Hlásí se jen dvojice, které se můžou potkat (dětský fond je oddělený, starsi ⊂ dospeli).
//    Stejná odpověď u RŮZNÝCH faktů (Sedm pádů × sedm medailí) je v pořádku.
//  - prozrazuje_jinou — odpověď jedné otázky stojí doslova v zadání jiné (případ Jirásek,
//    2026-08-30). Názvy vlastní země se vynechávají (v belgickém fondu je Belgie všude).
//    Spoiler to je, jen když se ta druhá otázka ptá právě na to; posoudit se to dá čtením.
//  - odpoved_v_zadani — odpověď doslova v zadání. Otázky typu „A, nebo B?" se vynechávají.
//  - rod_k_hraci — minulý čas s rodem k hráči („Trefil jsi", „sis spletl"); appka pohlaví
//    nezná (pravidlo 2026-09-02). Obrat „byl(a)" se bere jako neutrální.
//  - odpoved_vycniva_delkou — správná odpověď je dvakrát delší než nejdelší distraktor,
//    takže se dá tipnout bez znalosti.
//  - male_* — text začíná malým písmenem. Možnosti odpovědí se kreslí tak, jak jsou
//    v datech, takže se to týká i jich (opraveno 2026-09-10).
//  - chybi_diakritika — JEN slova, která diakritiku vyžadují (past zaplacená třikrát:
//    seznam s „hora", „voda" hlásil samé plané poplachy).
//
// PAST: `\b` a `\w` jsou v JS jen ASCII, takže u češtiny se hranice slova hlídá přes
// `\p{L}` s příznakem `u`. Bez toho by „věděl" nesedělo na hranici za „ě".
const fs = require("fs");
const path = require("path");
process.chdir(path.join(__dirname, ".."));
const OUT = "data/audit-konzistence.json";

const Q = [];
for (const f of fs.readdirSync("data/questions").filter(f => f.endsWith(".json"))) {
  for (const q of JSON.parse(fs.readFileSync(path.join("data/questions", f), "utf8"))) Q.push(q);
}
const SRC = fs.readFileSync("quiz.js", "utf8");
const cb = /const\s+COUNTRY_BY_CC\s*=\s*(\{[\s\S]*?\});/.exec(SRC);
const ZEME = new Set(Object.values(cb ? eval("(" + cb[1] + ")") : {}).map(s => s.toLowerCase()));
const so = /const\s+SECTION_ORDER\s*=\s*(\[[^\]]*\])/.exec(SRC);
const SECTION_ORDER = so ? JSON.parse(so[1].replace(/'/g, '"')) : [];

const fond = q => (q.kids ? "deti" : "obecny");
const pasma = q => q.kids ? ["deti"] : ((q.difficulty || 1) <= 2 ? ["starsi", "dospeli"] : ["dospeli"]);
const norm = s => String(s || "").toLowerCase().normalize("NFC").replace(/[„“”"'.,!?:;()–—-]/g, " ").replace(/\s+/g, " ").trim();
const listy = (v, bezPoznamek) => v == null ? [] : typeof v === "string" ? [v]
  : Array.isArray(v) ? v.flatMap(x => listy(x, bezPoznamek))
  : typeof v === "object" ? Object.entries(v).filter(([k]) => !(bezPoznamek && k.startsWith("_"))).flatMap(([, x]) => listy(x, bezPoznamek)) : [];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const celeSlovo = s => new RegExp("(?<!\\p{L})" + esc(s) + "(?!\\p{L})", "iu");
const malym = s => /^[a-záčďéěíňóřšťúůýž]/.test(String(s).trim());
const osoba = /(?<!\p{L})(jsi|sis|ses|tys)(?!\p{L})/iu;
const minuly = /(?<!\p{L})(věděl|nevěděl|trefil|netrefil|uhodl|neuhodl|tipnul|tipl|vsadil|zvolil|vybral|odpověděl|zapomněl|spletl|poznal|nepoznal|zkusil|hádal|zaváhal|četl|slyšel|viděl|sáhl|šel|dal|měl|byl)(?!\p{L})/iu;
const vety = s => String(s).split(/(?<=[.!?])\s+/);
const rodovy = v => osoba.test(v) && minuly.test(v) && !v.includes("(a)");

const N = {};
const add = (k, x) => (N[k] = N[k] || []).push(x);

// Povinná pole
for (const q of Q) {
  for (const k of ["question", "answer", "explanation", "about", "section"]) if (!String(q[k] || "").trim()) add("chybi_" + k, q.id);
  if (!Array.isArray(q.distractors) || q.distractors.length !== 3) add("distraktory_ne_3", q.id);
  if (!listy(q.quip_correct).length) add("chybi_quip_correct", q.id);
  if (!listy(q.quip_wrong).length) add("chybi_quip_wrong", q.id);
  if (!SECTION_ORDER.includes(q.section)) add("sekce_mimo_nabidku", q.id + ": " + q.section);
}

// Možnosti
for (const q of Q) {
  const a = norm(q.answer), d = (q.distractors || []).map(norm);
  if (d.includes(a)) add("odpoved_je_i_distraktor", q.id + ": " + q.answer);
  if (new Set(d).size !== d.length) add("duplicitni_distraktory", q.id);
  const al = String(q.answer || "").length, dl = (q.distractors || []).map(x => String(x).length);
  if (al > 25 && dl.length && al > 2 * Math.max(...dl)) add("odpoved_vycniva_delkou", q.id + ": " + al + " vs nejdelší distraktor " + Math.max(...dl));
  for (const s of [q.answer, ...(q.distractors || [])]) if (s != null && malym(s)) add("male_moznost", q.id + ": " + s);
}

// Odpověď v zadání. Vynechávají se otázky, jejichž zadání jmenuje i některý distraktor —
// to jsou volby „A, nebo B?", kde jsou možnosti v zadání schválně. POZOR: vynechávat podle
// slova „nebo" NESTAČÍ a je to past — „s tvarohem, mákem nebo povidly" je výčet, ne volba,
// a takový filtr schoval skutečnou nápovědu u moravských koláčků (ověřeno 2026-09-10).
for (const q of Q) {
  const a = String(q.answer || "").trim(), z = q.question || "";
  if (a.length < 5 || /^\d/.test(a) || !celeSlovo(a).test(z)) continue;
  if ((q.distractors || []).some(d => String(d).trim().length >= 3 && celeSlovo(String(d).trim()).test(z))) continue;
  add("odpoved_v_zadani", q.id + ": „" + a + "“");
}

// Duplicity a vzájemné prozrazení ve stejném fondu a zemi
const skup = {};
for (const q of Q) (skup[q.cc + "|" + fond(q)] = skup[q.cc + "|" + fond(q)] || []).push(q);
const tok = s => new Set(norm(s).split(" ").filter(w => w.length > 3).map(w => w.slice(0, 5)));
const jac = (A, B) => { let i = 0; for (const x of A) if (B.has(x)) i++; return i / ((A.size + B.size - i) || 1); };
for (const g of Object.values(skup)) {
  for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
    const x = g[i], y = g[j];
    if (norm(x.answer) !== norm(y.answer)) continue;
    if (!pasma(x).some(p => pasma(y).includes(p))) continue;
    add("stejna_odpoved_spolecne_pasmo", x.id + " ~ " + y.id);
    const s = jac(tok(x.question), tok(y.question));
    if (s >= 0.35) add("skoro_duplicita", x.id + " ~ " + y.id + " (" + s.toFixed(2) + ", „" + x.answer + "“)");
  }
  for (const x of g) {
    const a = String(x.answer || "").trim();
    if (a.length < 6 || /^[\d\s.,]+$/.test(a) || ZEME.has(a.toLowerCase())) continue;
    const re = celeSlovo(a);
    for (const y of g) if (y !== x && pasma(x).some(p => pasma(y).includes(p)) && re.test(y.question || ""))
      add("prozrazuje_jinou", y.id + " obsahuje odpověď „" + a + "“ z " + x.id);
  }
}

// Texty: malé písmeno, rod k hráči, typografie, diakritika
const bez = /(?<!\p{L})(neni|jeste|protoze|clovek|cesky|ceska|ceske|hlavni|mesto|reka|zeme|muze|rika|ktery|ktera|ktere|nejvetsi|nejvyssi|stoleti|zname|slavny)(?!\p{L})/iu;
for (const q of Q) {
  for (const k of ["question", "explanation", "more_fact"]) if (q[k] && malym(q[k])) add("male_" + k, q.id);
  const hlasky = [...listy(q.quip_correct), ...listy(q.quip_wrong)];
  for (const s of hlasky) if (malym(s)) add("male_hlaska", q.id + ": " + s.slice(0, 45));
  for (const s of [...hlasky, q.explanation || "", q.more_fact || ""]) for (const v of vety(s)) if (rodovy(v)) add("rod_k_hraci", q.id + ": " + v.slice(0, 80));
  for (const s of listy(q.quip_correct)) if (/(?<!\p{L})tys to věděl/iu.test(s)) add("tys_to_vedel", q.id);
  const t = [q.question, q.explanation, q.more_fact, ...hlasky].filter(Boolean).map(String);
  if (t.some(x => /"[^"]{2,}"/.test(x))) add("rovne_uvozovky", q.id);
  if (t.some(x => /\.\.\./.test(x))) add("tri_tecky_misto_vypustky", q.id);
  if (t.some(x => / {2,}/.test(x) || x !== x.trim())) add("mezery", q.id);
  for (const x of [...t, q.answer, ...(q.distractors || [])].filter(Boolean)) { const m = String(x).match(bez); if (m) add("chybi_diakritika", q.id + ": „" + m[0] + "“"); }
}

// Pokrytí a podlaha fondu (min. 10 otázek na zemi a pásmo)
const stat = {};
for (const q of Q) {
  const s = stat[fond(q)] = stat[fond(q)] || { otazek: 0, obrazek: 0, irony_prompt: 0, vice_o: 0 };
  s.otazek++;
  if (fs.existsSync("img/" + q.id + ".jpg")) s.obrazek++;
  if (q.irony_prompt) s.irony_prompt++;
  if (q.more_fact || q.source_card) s.vice_o++;
}
const pocet = {};
for (const q of Q) for (const p of pasma(q)) pocet[q.cc + "|" + p] = (pocet[q.cc + "|" + p] || 0) + 1;
for (const cc of new Set(Q.map(q => q.cc))) for (const p of ["deti", "starsi", "dospeli"])
  if ((pocet[cc + "|" + p] || 0) < 10) add("pod_podlahou_10", cc + "/" + p + ": " + (pocet[cc + "|" + p] || 0));

// UI texty: fondy.json (bez poznámek v klíčích začínajících „_") a řetězce v quiz.js/online.js
const fondy = JSON.parse(fs.readFileSync("data/fondy.json", "utf8"));
for (const s of listy(fondy, true)) {
  if (malym(s)) add("fondy_male_pismeno", s.slice(0, 60));
  for (const v of vety(s)) if (rodovy(v)) add("fondy_rod_k_hraci", v.slice(0, 80));
}
for (const f of ["quiz.js", "online.js"]) {
  const kod = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");
  for (const r of kod.match(/(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g) || []) for (const v of vety(r)) if (rodovy(v)) add("ui_rod_k_hraci", f + ": " + v.slice(0, 80));
}

fs.writeFileSync(OUT, JSON.stringify({ datum: new Date().toISOString().slice(0, 10), stat, nalezy: N }, null, 1), "utf8");
console.log("Otázek: " + Q.length + " | " + Object.entries(stat).map(([k, s]) =>
  k + ": " + s.otazek + " (obrázek " + s.obrazek + ", Více o… " + s.vice_o + ", irony_prompt " + s.irony_prompt + ")").join(" | "));
const poradi = Object.keys(N).sort((a, b) => N[b].length - N[a].length);
for (const k of poradi) { console.log("\n" + k + ": " + N[k].length); for (const x of N[k].slice(0, 5)) console.log("   · " + x); }
if (!poradi.length) console.log("\nŽádné nálezy.");
console.log("\nplný výpis: " + OUT);
