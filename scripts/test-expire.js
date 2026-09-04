// Ověřuje úklid nedohraných her (`expireStaleGames` v functions/_lib/settle.js).
//
// PROČ to existuje: `rematch.js` zapíše soupeře do odvety BEZ jeho vědomí a nijak mu to
// neoznámí. Do 2026-09-04 se dala tímhle způsobem vyrábět hodnocená výhra na počkání —
// stačilo odehrát svou půlku, počkat 48 h a expirace dopsala soupeři `finished_at` se
// skóre 0, takže Glicko zapsalo výhru za partii, o které ten druhý nikdy nevěděl.
//
// Pravidlo, které se tu hlídá: hráč, který neodpověděl ANI JEDNOU, se nevyrovnává —
// hra se jen zavře. Kdo odešel po pár otázkách, ten hrál a prohraje podle skóre; to je
// vědomé rozhodnutí (nezavádět kontumaci) a musí platit dál.
//
// Testuje se s falešným env.DB, žádná síť ani D1 — stejný princip jako test-ghost.js.

let chyb = 0, ok = 0;
const kontrola = (podm, popis) => { if (podm) { ok++; } else { chyb++; console.log("  CHYBA: " + popis); } };

/**
 * Falešná D1 nad jednou hrou.
 * `hraci`: [{ user_id, finished_at, odpovedi, score }]
 * Zaznamenává, jestli padlo `UPDATE game_players SET finished_at` (tedy vyrovnání)
 * a jestli se hra zavřela.
 */
function mockEnv(hra, hraci) {
  const log = { dopsalFinished: false, zavrel: false, settleVolan: false };
  const stav = { hraci: hraci.map(h => ({ ...h })) };

  function stmt(sql) {
    return {
      _sql: sql, _args: [],
      bind(...a) { this._args = a; return this; },
      async first() {
        if (/FROM games WHERE id/.test(this._sql)) {
          // settleIfDone si hru načítá znovu; po zavření už musí vidět 'done'
          return { ...hra, status: log.zavrel ? "done" : hra.status };
        }
        return null;
      },
      async all() {
        if (/FROM games WHERE status = 'open'/.test(this._sql)) return { results: [{ id: hra.id }] };
        // dotaz na hráče s počtem odpovědí (nová kontrola v expireStaleGames)
        if (/FROM game_players gp WHERE gp\.game_id/.test(this._sql)) {
          return { results: stav.hraci.map(h => ({
            user_id: h.user_id, finished_at: h.finished_at, odpovedi: h.odpovedi })) };
        }
        // settleIfDone: SELECT * FROM game_players
        if (/FROM game_players WHERE game_id/.test(this._sql)) {
          return { results: stav.hraci.map(h => ({
            user_id: h.user_id, finished_at: h.finished_at, score: h.score, slot: h.slot })) };
        }
        return { results: [] };
      },
      async run() {
        if (/UPDATE game_players SET finished_at/.test(this._sql)) {
          log.dopsalFinished = true;
          stav.hraci.forEach(h => { if (!h.finished_at) h.finished_at = Date.now(); });
        }
        if (/UPDATE games SET status = 'done'/.test(this._sql)) {
          log.zavrel = true;
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 1 } };
      },
    };
  }
  const DB = { prepare: sql => stmt(sql), async batch(s) { for (const x of s) await x.run(); } };
  return { env: { DB }, log };
}

(async () => {
  const { expireStaleGames } = await import("../functions/_lib/settle.js");
  const stara = Date.now() - 72 * 60 * 60 * 1000;   // 72 h zpět = dávno po expiraci

  console.log("\nExpirace: kdo nezačal, ten se nevyrovnává");

  // 1) ODVETA, kterou soupeř nikdy neotevřel. Útočník odehrál celou, soupeř 0 odpovědí.
  {
    const hra = { id: "g-odveta", mode: "odkaz", band: "dospeli", status: "open",
      created_at: stara, rated: 1, question_ids: JSON.stringify(["q1"]), orders: JSON.stringify([[0,1,2,3]]) };
    const { env, log } = mockEnv(hra, [
      { user_id: "utocnik", slot: 0, finished_at: stara, odpovedi: 10, score: 900 },
      { user_id: "obet",    slot: 1, finished_at: null,  odpovedi: 0,  score: 0 },
    ]);
    await expireStaleGames(env);
    kontrola(!log.dopsalFinished,
      "hráči, který neodpověděl ani jednou, se dopsalo finished_at (vyrábí se hodnocená výhra)");
    kontrola(log.zavrel, "hra se nezavřela, zůstala by viset v open");
  }

  // 2) OBA HRÁLI, jeden odešel v půlce. Tady se vyrovnat MÁ — jinak by šlo uniknout
  //    prohře prostým zavřením prohlížeče (to je ten důvod, proč expirace vznikla).
  {
    const hra = { id: "g-utek", mode: "odkaz", band: "dospeli", status: "open",
      created_at: stara, rated: 1, question_ids: JSON.stringify(["q1"]), orders: JSON.stringify([[0,1,2,3]]) };
    const { env, log } = mockEnv(hra, [
      { user_id: "poctivy", slot: 0, finished_at: stara, odpovedi: 10, score: 900 },
      { user_id: "utekl",   slot: 1, finished_at: null,  odpovedi: 3,  score: 200 },
    ]);
    await expireStaleGames(env);
    kontrola(log.dopsalFinished,
      "hráč, který odehrál část a odešel, se nevyrovnal — únik před prohrou zavřením prohlížeče");
  }

  // 3) Souboj na odkaz, ke kterému nikdo nepřišel (jediný hráč, 0 odpovědí u druhého
  //    neexistuje). Musí se zavřít, ne viset.
  {
    const hra = { id: "g-samotar", mode: "odkaz", band: "dospeli", status: "open",
      created_at: stara, rated: 1, question_ids: JSON.stringify(["q1"]), orders: JSON.stringify([[0,1,2,3]]) };
    const { env, log } = mockEnv(hra, [
      { user_id: "zakladatel", slot: 0, finished_at: stara, odpovedi: 10, score: 900 },
    ]);
    await expireStaleGames(env);
    kontrola(log.zavrel, "osamocená hra na odkaz se nezavřela");
  }

  console.log(chyb ? "\nNEPROŠLO: " + chyb + " chyb, " + ok + " v pořádku"
                   : "\nVŠE V POŘÁDKU: " + ok + " kontrol");
  process.exit(chyb ? 1 : 0);
})();
