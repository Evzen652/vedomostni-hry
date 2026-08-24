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
