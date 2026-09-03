// Ověřuje „ghost" soupeře: botPlay má přehrávat SKUTEČNÉ lidské odpovědi z banky
// replay_answers (jejich trefu i čas), a jen když otázka v bance chybí, spadnout na
// pravděpodobnostní model. Testuje se s falešným env.DB (žádná síť, žádná D1) —
// stejný princip jako test-offline: testuje se skutečný zdroj, ne kopie.
//
// Ověřeno mutací: kdyby botPlay banku ignoroval a losoval z modelu, seedovaná otázka
// „vždy správně/vždy špatně" by u dost opakování občas vyšla jinak — test to chytí.

let chyb = 0, ok = 0;
const kontrola = (podm, popis) => { if (podm) { ok++; } else { chyb++; console.log("  CHYBA: " + popis); } };

// Falešná D1: rozliší dotaz na `questions` a `replay_answers`, zbytek pohltí.
// `batch` zachytí vložené řádky game_answers, ať jde ověřit, co bot „odpověděl".
function mockEnv(questionRatings, bank) {
  const inserted = [];
  function stmt() {
    return {
      _sql: "", _args: [],
      bind(...a) { this._args = a; return this; },
      async all() {
        if (this._sql.includes("FROM questions")) {
          return { results: Object.entries(questionRatings).map(([id, rating]) => ({ id, rating })) };
        }
        if (this._sql.includes("FROM replay_answers")) {
          const rows = [];
          for (const [qid, arr] of Object.entries(bank)) {
            for (const s of arr) rows.push({ question_id: qid, correct: s.correct, ms: s.ms });
          }
          return { results: rows };
        }
        return { results: [] };
      },
      async run() { return {}; },
    };
  }
  const DB = {
    prepare(sql) { const s = stmt(); s._sql = sql; return s; },
    async batch(stmts) { for (const s of stmts) inserted.push({ sql: s._sql, args: s._args }); },
  };
  return { env: { DB }, inserted };
}

// Řádky game_answers z batch: (game_id, user_id, q_index, pick, ms, correct, points)
const answersFrom = inserted => inserted
  .filter(x => x.sql.includes("INSERT INTO game_answers"))
  .map(x => ({ q_index: x.args[2], pick: x.args[3], ms: x.args[4], correct: x.args[5], points: x.args[6] }))
  .sort((p, r) => p.q_index - r.q_index);

(async () => {
  const { botPlay } = await import("../functions/_lib/bot.js");
  const { correctIndex } = await import("../functions/_lib/game.js");

  const orders = [[0, 1, 2, 3], [2, 0, 3, 1]];   // dvě otázky, různé zamíchání
  const game = {
    id: "g1", band: "dospeli", limit_s: 10,
    question_ids: JSON.stringify(["q1", "q2"]),
    orders: JSON.stringify(orders),
  };

  // 1) NAPLNĚNÁ banka: q1 vždy správně a rychle, q2 vždy špatně. Bot to MUSÍ přehrát.
  //    Opakuju vícekrát — kdyby botPlay banku ignoroval a losoval, občas by to selhalo.
  let q1vzdyOk = true, q2vzdySpatne = true, casySedi = true;
  for (let i = 0; i < 40; i++) {
    const { env, inserted } = mockEnv({ q1: 1500, q2: 1500 },
      { q1: [{ correct: 1, ms: 1200 }], q2: [{ correct: 0, ms: 3400 }] });
    await botPlay(env, game, "bot1", 1500);
    const ans = answersFrom(inserted);
    const a1 = ans.find(a => a.q_index === 0), a2 = ans.find(a => a.q_index === 1);
    if (!(a1.correct === 1 && a1.pick === correctIndex(orders[0]))) q1vzdyOk = false;
    if (!(a2.correct === 0 && a2.pick !== correctIndex(orders[1]))) q2vzdySpatne = false;
    if (!(a1.ms === 1200 && a2.ms === 3400)) casySedi = false;
  }
  kontrola(q1vzdyOk, "seedovaná otázka vždy-správně nevyšla vždy správně (banka se nepřehrává)");
  kontrola(q2vzdySpatne, "seedovaná otázka vždy-špatně nevyšla vždy špatně (banka se nepřehrává)");
  kontrola(casySedi, "přehraný čas (ms) neodpovídá bance");

  // 2) VÍC vzorků: bot losuje mezi reálnými lidskými odpověďmi, ne mimo ně.
  const videnoCorrect = new Set();
  for (let i = 0; i < 60; i++) {
    const { env, inserted } = mockEnv({ q1: 1500 },
      { q1: [{ correct: 1, ms: 900 }, { correct: 0, ms: 2500 }] });
    const g = { ...game, question_ids: JSON.stringify(["q1"]), orders: JSON.stringify([orders[0]]) };
    await botPlay(env, g, "bot1", 1500);
    const a = answersFrom(inserted)[0];
    videnoCorrect.add(a.correct);
    kontrola(a.ms === 900 || a.ms === 2500, "ms mimo seedované vzorky (bot si vymýšlí)");
  }
  kontrola(videnoCorrect.has(1) && videnoCorrect.has(0), "bot se drží jen jednoho vzorku (nelosuje z banky)");

  // 3) PRÁZDNÁ banka: fallback na model — nesmí spadnout a musí vyrobit platné odpovědi.
  {
    const { env, inserted } = mockEnv({ q1: 1500, q2: 1500 }, {});
    const total = await botPlay(env, game, "bot1", 1500);
    const ans = answersFrom(inserted);
    kontrola(ans.length === 2, "bez banky bot nevyrobil odpověď na každou otázku");
    kontrola(ans.every(a => a.pick >= -1 && a.pick <= 3), "bez banky bot vyrobil neplatný pick");
    kontrola(Number.isFinite(total), "bez banky bot nevrátil skóre");
  }

  console.log("\n" + (chyb ? "NEPROŠLO: " + chyb + " chyb, " + ok + " v pořádku"
                            : "VŠE V POŘÁDKU: " + ok + " kontrol"));
  process.exit(chyb ? 1 : 0);
})();
