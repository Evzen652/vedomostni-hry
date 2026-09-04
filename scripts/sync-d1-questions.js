#!/usr/bin/env node
/**
 * sync-d1-questions.js — vygeneruje data/d1-sync.sql, který doplní a aktualizuje otázky
 * v UŽ NAPLNĚNÉ databázi. Nic nemaže.
 *
 * Proč to muselo vzniknout: `seed-d1.js` skládá obyčejné `INSERT`, takže projde jedině
 * na prázdné tabulce — a jediná cesta, jak ho použít, je `db:init`, který začíná
 * `DROP TABLE`. Na produkci s reálnými účty, ratingem a rozehranými hrami to znamenalo,
 * že **každá nová otázka by stála smazání hráčů**. Sync je tedy to, co u obsahu chybělo:
 * bezpečná cesta z dat do běžící databáze.
 *
 * Používá `ON CONFLICT(id) DO UPDATE`, takže:
 *   - nová otázka se vloží,
 *   - změněný text (hláška, vysvětlení, more_fact) se přepíše,
 *   - `rating` otázky ZŮSTANE, protože se dopočítává z odehraných her a data ho neznají.
 *
 * Otázky, které z dat zmizely, se schválně NEMAŽOU: odkazují se na ně odehrané hry
 * a smazání by rozbilo historii.
 *
 * ALE VĚDĚT O NICH SE MUSÍ, a je to víc než pořádkumilovnost. Přejmenování id (2026-08-31,
 * pět id s diakritikou) vyrobilo v databázi DVOJICI: staré i nové id téže otázky, takže
 * by ji online losovalo dvakrát a hráč by ji v jedné partii dostal dvakrát za sebou.
 * Proto `--check` porovná id v databázi s daty a přebytky vypíše i s hotovým `DELETE`.
 *
 * POŘADÍ U PŘEJMENOVÁNÍ: id přejmenuj nejdřív v databázi, teprve pak sesynchronizuj data.
 *   wrangler d1 execute zemekviz --local --command "UPDATE questions SET id='nove' WHERE id='stare'"
 * Když to uděláš obráceně, sync nové id VLOŽÍ a staré zůstane — a `UPDATE` už neprojde,
 * protože nové id v tabulce mezitím je. Jediná cesta zpátky je pak `DELETE` starého řádku,
 * jenže na něj můžou odkazovat `seen_questions` a `games.question_ids`. Přesně to se stalo
 * 2026-08-31: lokálně na těch pět id ukazovaly dva záznamy o zobrazení a jedna hra.
 *
 * Spuštění:
 *   npm run db:sync                                        # vyrobí SQL
 *   wrangler d1 execute zemekviz --local  --file=data/d1-sync.sql
 *   wrangler d1 execute zemekviz --remote --file=data/d1-sync.sql     # produkce
 *   npm run db:sync -- --check           # co je v LOKÁLNÍ databázi navíc proti datům
 *   npm run db:sync -- --check --remote  # totéž proti produkci
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SRC = path.join(__dirname, "..", "data", "questions");
const OUT = path.join(__dirname, "..", "data", "d1-sync.sql");

// stejný předpis pásma jako v seed-d1.js — kdyby se rozešly, online by servírovalo jinak než hra
const band = q => (q.kids === true ? "deti" : (q.difficulty || 1) <= 2 ? "starsi" : "dospeli");
const sql = v => (v == null ? "NULL" : "'" + String(v).replace(/'/g, "''") + "'");

// `difficulty` se sem doplnilo 2026-09-04 (migrace 2026-09-04-difficulty.sql). Do té doby
// se ze zdrojových dat jen odvodil `band` a hodnota se zahodila, takže online hra neměla
// z čeho vykreslit štítek ★–★★★, který offline část kreslí odjakživa.
// `kids` se NEUKLÁDÁ schválně — je to totéž co band='deti' (viz `band()` výš).
const SLOUPCE = ["id", "cc", "country", "band", "section", "question", "answer", "distractors",
  "quip_correct", "quip_wrong", "explanation", "more_fact", "about", "difficulty"];

const rows = [];
const videna = new Set();
let preskoceno = 0;

for (const file of fs.readdirSync(SRC).filter(f => f.endsWith(".json"))) {
  for (const q of JSON.parse(fs.readFileSync(path.join(SRC, file), "utf8"))) {
    if (videna.has(q.id)) { preskoceno++; continue; }
    if (!Array.isArray(q.distractors) || q.distractors.length !== 3) { preskoceno++; continue; }
    videna.add(q.id);
    rows.push("(" + [
      sql(q.id), sql(q.cc), sql(q.country), sql(band(q)), sql(q.section),
      sql(q.question), sql(q.answer), sql(JSON.stringify(q.distractors)),
      sql(q.quip_correct), sql(q.quip_wrong), sql(q.explanation),
      sql(q.more_fact), sql(q.about), Number(q.difficulty) || 1,
    ].join(",") + ")");
  }
}

// `rating` v seznamu schválně NENÍ: patří databázi, ne datům (počítá se z úspěšnosti hráčů).
const UPDATE = SLOUPCE.filter(c => c !== "id").map(c => c + "=excluded." + c).join(", ");

// Dávka po 25: otázka i s hláškami a vysvětlením má ~1–2 kB, takže při 200 řádcích
// jeden příkaz přeteče limit D1 na délku SQL (SQLITE_TOOBIG). Ověřeno u seedu.
const BATCH = 25;
const out = ["-- Generováno scripts/sync-d1-questions.js — přírůstkově, bez DROP a bez DELETE."];
for (let i = 0; i < rows.length; i += BATCH) {
  out.push("INSERT INTO questions (" + SLOUPCE.join(",") + ") VALUES\n" +
    rows.slice(i, i + BATCH).join(",\n") +
    "\nON CONFLICT(id) DO UPDATE SET " + UPDATE + ";");
}

// ---- --check: co má databáze navíc proti datům ---------------------------------
if (process.argv.includes("--check")) {
  const kde = process.argv.includes("--remote") ? "--remote" : "--local";
  console.log("porovnávám " + kde.replace("--", "") + " databázi s daty (" + videna.size + " otázek)…");
  let odpoved;
  try {
    // Spouští se přes shell schválně: na Windows je `npx` dávkový soubor, který novější
    // Node bez shellu odmítne spustit (ENOENT na `npx`, EINVAL na `npx.cmd`). Příkaz je
    // pevný řetězec bez čehokoli zvenčí, takže tu není co podstrčit.
    odpoved = execSync('npx wrangler d1 execute zemekviz ' + kde +
      ' --command "SELECT id FROM questions" --json',
      { encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "ignore"] });
  } catch (e) {
    console.error("dotaz do D1 selhal: " + String(e.message).slice(0, 200));
    process.exit(1);
  }
  const vDb = [...odpoved.matchAll(/"id":\s*"([^"]+)"/g)].map(m => m[1]);
  const navic = vDb.filter(id => !videna.has(id));
  console.log("v databázi " + vDb.length + ", v datech " + videna.size + ", navíc " + navic.length);
  if (navic.length) {
    for (const id of navic) console.log("  " + id);
    // Pozor: čistý SQL guard tu nejde napsat. `games.question_ids` je JSON pole, takže
    // se na ně nedá udělat JOIN — na odkaz z odehrané hry se prostě musí kouknout ručně.
    console.log("\nNež je smažeš, ověř, že na ně nic neodkazuje:");
    const seznam = navic.map(sql).join(",");
    console.log("  SELECT COUNT(*) FROM seen_questions WHERE question_id IN (" + seznam + ");");
    console.log("  SELECT id FROM games WHERE " + navic.map(id => "question_ids LIKE '%" +
      String(id).replace(/'/g, "''") + "%'").join(" OR ") + ";");
    console.log("  -- teprve pak:");
    console.log("  DELETE FROM questions WHERE id IN (" + seznam + ");");
  }
  process.exit(0);
}

fs.writeFileSync(OUT, out.join("\n\n") + "\n", "utf8");
console.log("zapsáno " + rows.length + " otázek do " + path.relative(process.cwd(), OUT) +
  " (" + out.length + " příkazů" + (preskoceno ? ", přeskočeno " + preskoceno : "") + ")");
console.log("\nlokálně:  npx wrangler d1 execute zemekviz --local  --file=data/d1-sync.sql");
console.log("produkce: npx wrangler d1 execute zemekviz --remote --file=data/d1-sync.sql");
console.log("kontrola: npm run db:sync -- --check");
