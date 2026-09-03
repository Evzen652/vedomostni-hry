/**
 * Sdílená herní logika API. Podtržítko ve složce = Pages Functions ji nesměruje.
 * Model odpovídá docs/online-rezim.md, sekce 2 a 8 (ověřeno scripts/sim-online.js).
 */

export const BANDS = ['deti', 'starsi', 'dospeli'];
// Validuje se PROTI TOMUHLE SEZNAMU, ne indexaci objektu. `TIME_CONTROLS["constructor"]`
// vrací funkci z prototypu, takže kontrola `if (!tc)` takové jméno pustí dál — a u turnaje
// se hodnota dokonce ULOŽÍ do databáze, čímž vznikne položka, která každému, kdo do ní
// vstoupí, vrací chybu. Stejný vzor jako `BANDS.includes(band)` o pár řádků níž.
export const TC_NAMES = ["blesk", "klasika"];
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
 * Klouzavé okno pro rate limit — ATOMICKY, jedním příkazem.
 *
 * Do 2026-09-03 to byla dvojice `SELECT` → rozhodnutí → `UPDATE` bez transakce.
 * Dvě stě souběžných požadavků tedy přečetlo stejnou hodnotu a všech dvě stě prošlo:
 * limit se choval jako „N DÁVEK za hodinu, každá libovolně velká". Tehdejší ověření
 * (unit test s falešným úložištěm + živé volání) to minulo, protože obojí bylo
 * sekvenční — souběh se přes lokální wrangler vynutit nedá, viz CLAUDE.md 2026-09-01.
 *
 * Teď o všem rozhoduje `WHERE` uvnitř jediného příkazu a odpověď se čte z
 * `meta.changes`: 0 = nad limitem (nezapsalo se nic), 1 = pod limitem (a počítadlo
 * je už navýšené). Stejný vzor, jakým se 2026-09-01 zamykalo `settle.js`.
 *
 * Počítá se KAŽDÉ volání. `friends.js` má vlastní pořadí, protože tam se počítají
 * jen NEÚSPĚŠNÉ pokusy — kdo kód opravdu dostal, na limit nikdy nenarazí.
 */

/** Povolené sloupce, ať se do SQL nikdy nedostane cizí jméno. */
const LIMIT_SLOUPCE = ['game_tries', 'tourney_tries', 'friend_tries'];

/** Limit vázaný na účet. Vrací true, když se akce vejde. */
export async function limitUctu(env, userId, sloupec, max, windowMs) {
  if (!LIMIT_SLOUPCE.includes(sloupec)) throw new Error('neznámý sloupec limitu: ' + sloupec);
  const at = sloupec + '_at';
  const now = Date.now();
  const r = await env.DB.prepare(
    `UPDATE users
        SET ${sloupec} = CASE WHEN ? - ${at} < ? THEN ${sloupec} + 1 ELSE 1 END,
            ${at}      = CASE WHEN ? - ${at} < ? THEN ${at} ELSE ? END
      WHERE id = ?
        AND (? - ${at} >= ? OR ${sloupec} < ?)`)
    .bind(now, windowMs, now, windowMs, now, userId, now, windowMs, max).run();
  return (r.meta && r.meta.changes) > 0;
}

/** Limit vázaný na IP (registrace — účet v tu chvíli ještě neexistuje). */
export async function limitIp(env, ip, max, windowMs) {
  const now = Date.now();
  const r = await env.DB.prepare(
    `INSERT INTO reg_attempts (ip, tries, tries_at) VALUES (?, 1, ?)
     ON CONFLICT(ip) DO UPDATE
        SET tries    = CASE WHEN ? - tries_at < ? THEN tries + 1 ELSE 1 END,
            tries_at = CASE WHEN ? - tries_at < ? THEN tries_at ELSE ? END
      WHERE ? - reg_attempts.tries_at >= ? OR reg_attempts.tries < ?`)
    .bind(ip, now, now, windowMs, now, windowMs, now, now, windowMs, max).run();
  return (r.meta && r.meta.changes) > 0;
}
