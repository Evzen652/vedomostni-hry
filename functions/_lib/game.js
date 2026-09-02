/**
 * Sdílená herní logika API. Podtržítko ve složce = Pages Functions ji nesměruje.
 * Model odpovídá docs/online-rezim.md, sekce 2 a 8 (ověřeno scripts/sim-online.js).
 */

export const BANDS = ['deti', 'starsi', 'dospeli'];
export const TIME_CONTROLS = {
  blesk:   { count: 10, limit_s: 10 },
  klasika: { count: 15, limit_s: 20 },
};

export const BASE_POINTS = 100;
export const BONUS_MAX = 100;

/** Body za odpověď: 100 za správnou + rychlostní bonus podle zbývajícího času. */
export function score(correct, ms, limitS) {
  if (!correct) return 0;
  const limitMs = limitS * 1000;
  if (ms >= limitMs) return 0;
  return BASE_POINTS + Math.round(BONUS_MAX * (limitMs - ms) / limitMs);
}

/** Pořadí zdrojů pro jednu otázku: 0 = správná odpověď, 1..3 = distractors[0..2]. */
export function shuffledOrder() {
  const a = [0, 1, 2, 3];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Poskládá zobrazené možnosti podle uloženého pořadí. */
export function optionsFor(question, order) {
  const d = JSON.parse(question.distractors);
  return order.map(src => (src === 0 ? question.answer : d[src - 1]));
}

/** Index správné možnosti v zobrazeném pořadí. */
export const correctIndex = order => order.indexOf(0);

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const fail = (msg, status = 400) => json({ error: msg }, status);

export function newId() {
  return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Klouzavé okno pro rate limit (2026-09-02). Na rozdíl od `friends.js`, kde se
 * počítají jen NEÚSPĚŠNÉ pokusy (kdo kód dostal, nikdy nenarazí), se tady počítá
 * KAŽDÉ volání — u registrace/založení hry je totiž pokus sám o sobě to, co
 * omezujeme, ne hádání něčeho cizího.
 *
 * `ziskej`/`uloz` jsou callbacky, protože per-uživatele (UPDATE existujícího
 * řádku v `users`) a per-IP (UPSERT do `reg_attempts`, řádek nemusí existovat)
 * potřebují jiné SQL — tahle funkce zná jen počítání, ne úložiště.
 *
 * Vrací `true` = pod limitem (a počítadlo se ZAPSALO navýšené). `false` = nad
 * limitem — nezapisuje se nic, ať počítadlo neroste do nekonečna při opakovaném
 * ťukání po zamčení (chování stejné jako klouzavé okno ve `friends.js`).
 */
export async function checkRateLimit(ziskej, uloz, max, windowMs) {
  const now = Date.now();
  const stav = await ziskej();
  const vOkne = now - (stav?.tries_at || 0) < windowMs;
  const pokusu = vOkne ? (stav?.tries || 0) : 0;
  if (pokusu >= max) return false;
  await uloz(pokusu + 1, vOkne ? (stav?.tries_at || now) : now);
  return true;
}
