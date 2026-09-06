// Ověřuje dělení fondu na VEŘEJNÝ a SERVEROVÝ (`online_only`).
//
// Proč to existuje: fond je společný pro offline i online hru, takže správné odpovědi
// musí být v prohlížeči — a tím pádem si je kdokoli mohl dohledat i pro HODNOCENOU
// online partii. Otázky s `online_only: true` se do veřejných dat nekopírují
// (build-public.js), takže tuhle díru nemají a `pickQuestions` je musí PREFEROVAT.
// Zároveň se z nich nesmí stát tvrdá podmínka: dokud jich není dost, online hra
// dobírá z veřejných, protože prázdná hra je horší než hra, kterou jde podvádět.
//
// Testuje se s falešným env.DB (žádná síť, žádná D1) — stejný princip jako test-ghost.

let chyb = 0, ok = 0;
const kontrola = (podm, popis) => { if (podm) { ok++; } else { chyb++; console.log("  CHYBA: " + popis); } };

/**
 * Falešná D1 nad seznamem otázek. Rozumí jen tomu, co pool.js opravdu skládá:
 * `band = ?`, volitelné `online_only = 0/1` a LIMIT. Vidí i to, na co se ptal.
 */
function mockEnv(otazky) {
  const dotazy = [];
  const DB = {
    prepare(sql) {
      return {
        _sql: sql, _args: [],
        bind(...a) { this._args = a; return this; },
        async all() {
          dotazy.push(this._sql.replace(/\s+/g, " ").trim());
          if (!this._sql.includes("FROM questions")) return { results: [] };
          const band = this._args[0];
          const limit = this._args[this._args.length - 1];
          let vyber = otazky.filter(q => q.band === band);
          if (this._sql.includes("online_only = 1")) vyber = vyber.filter(q => q.online_only === 1);
          if (this._sql.includes("online_only = 0")) vyber = vyber.filter(q => q.online_only === 0);
          // seen_questions je v mocku prázdné, takže „neviděné nikým" = všechno
          return { results: vyber.slice(0, limit).map(q => ({ id: q.id })) };
        },
        async run() { return { meta: { changes: 1 } }; },
      };
    },
    async batch() { return []; },
  };
  return { env: { DB }, dotazy };
}

const q = (id, online_only) => ({ id, band: "dospeli", online_only });

(async () => {
  const { pickQuestions } = await import("../functions/_lib/pool.js");

  // 1) Dost serverových otázek → hra je celá z nich a veřejných se nedotkne.
  {
    const otazky = [...Array(10)].map((_, i) => q("s" + i, 1))
      .concat([...Array(10)].map((_, i) => q("v" + i, 0)));
    const { env, dotazy } = mockEnv(otazky);
    const ids = await pickQuestions(env, "dospeli", 5, []);
    kontrola(ids.length === 5, "vybralo se 5 otázek, ne " + ids.length);
    kontrola(ids.every(id => id.startsWith("s")),
      "při dostatku serverových otázek se sáhlo i po veřejných: " + ids.join(","));
    kontrola(dotazy.some(d => d.includes("online_only = 1")),
      "pool.js se vůbec nezeptal na serverové otázky");
  }

  // 2) Serverových je málo → doplní se veřejnými, ale serverové mají PŘEDNOST.
  {
    const otazky = [q("s0", 1), q("s1", 1)]
      .concat([...Array(10)].map((_, i) => q("v" + i, 0)));
    const { env } = mockEnv(otazky);
    const ids = await pickQuestions(env, "dospeli", 5, []);
    kontrola(ids.length === 5, "doplnění na 5 otázek nevyšlo, je jich " + ids.length);
    kontrola(ids.slice(0, 2).every(id => id.startsWith("s")),
      "serverové otázky nešly první: " + ids.join(","));
    kontrola(ids.filter(id => id.startsWith("v")).length === 3,
      "z veřejných se mělo dobrat přesně 3, dobralo se " + ids.filter(id => id.startsWith("v")).length);
  }

  // 3) Prázdný serverový fond (dnešní stav) → hra se MUSÍ odehrát z veřejných.
  //    Kdyby tu byla tvrdá podmínka, online režim by se dnes vůbec nespustil.
  {
    const otazky = [...Array(10)].map((_, i) => q("v" + i, 0));
    const { env } = mockEnv(otazky);
    const ids = await pickQuestions(env, "dospeli", 5, []);
    kontrola(ids.length === 5, "s prázdným serverovým fondem hra nevznikla (" + ids.length + " otázek)");
  }

  // 4) Obě části fondu jsou disjunktní, takže se ID nesmí zopakovat.
  {
    const otazky = [q("s0", 1), q("s1", 1), q("v0", 0), q("v1", 0), q("v2", 0)];
    const { env } = mockEnv(otazky);
    const ids = await pickQuestions(env, "dospeli", 4, []);
    kontrola(new Set(ids).size === ids.length, "otázka se ve hře objevila dvakrát: " + ids.join(","));
  }

  console.log("\n" + (chyb ? "NEPROŠLO: " + chyb + " chyb, " + ok + " v pořádku"
                            : "VŠE V POŘÁDKU: " + ok + " kontrol"));
  process.exit(chyb ? 1 : 0);
})();
