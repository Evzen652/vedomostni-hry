import { correctIndex, score } from './game.js';

/**
 * Bot (docs/online-rezim.md, sekce 2 a 8).
 *
 * Narozdíl od šachového enginu nepotřebuje žádnou AI: stačí pravděpodobnost správné
 * odpovědi z rozdílu ratingů a rozdělení reakčního času. Model je ověřený simulací
 * (scripts/sim-online.js): bot proti stejně silnému hráči vyhrává 49,6–50,3 %.
 */

const CAP = 0.95;   // ani nejsilnější bot není neomylný

const normal = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export const pCorrect = (strength, qRating) =>
  Math.min(CAP, 1 / (1 + Math.pow(10, (qRating - strength) / 400)));

/** Čas odpovědi v ms. Medián roste s tím, jak je otázka nad botem. */
export function answerMs(strength, qRating, limitS) {
  const frac = 0.20 + 0.55 / (1 + Math.exp(-(qRating - strength) / 200));
  const ms = limitS * 1000 * frac * Math.exp(normal() * 0.30);
  return Math.max(500, Math.round(ms));
}

/** Bot odehraje celou hru najednou. */
export async function botPlay(env, game, botUserId, strength) {
  const ids = JSON.parse(game.question_ids);
  const orders = JSON.parse(game.orders);

  const qs = (await env.DB
    .prepare(`SELECT id, rating FROM questions WHERE id IN (${ids.map(() => '?').join(',')})`)
    .bind(...ids).all()).results;
  const rating = new Map(qs.map(q => [q.id, q.rating]));

  // Ghost: kde to jde, přehraj SKUTEČNOU lidskou odpověď na tutéž otázku (její trefu
  // i čas) místo pravděpodobnostního modelu — lidské načasování a chyby se nedají
  // prokouknout jako skript. Vzorky se losují z banky replay_answers v daném pásmu;
  // chybí-li otázka v bance (cold start), spadne se na model bota níž — otázku po
  // otázce. Jeden dotaz na celou hru, seskupení a los pak v JS.
  const bank = new Map();   // question_id -> [{correct, ms}, …]
  const bankRows = (await env.DB.prepare(
    `SELECT question_id, correct, ms FROM replay_answers
      WHERE band = ? AND question_id IN (${ids.map(() => '?').join(',')})`)
    .bind(game.band, ...ids).all()).results;
  for (const r of bankRows) {
    if (!bank.has(r.question_id)) bank.set(r.question_id, []);
    bank.get(r.question_id).push(r);
  }

  const stmts = [];
  let total = 0;
  for (let n = 0; n < ids.length; n++) {
    const qr = rating.get(ids[n]) ?? 1500;
    const samples = bank.get(ids[n]);
    let hit, ms;
    if (samples && samples.length) {
      const s = samples[Math.floor(Math.random() * samples.length)];   // reálná lidská odpověď
      hit = !!s.correct; ms = s.ms;
    } else {
      hit = Math.random() < pCorrect(strength, qr);                     // fallback: model bota
      ms = answerMs(strength, qr, game.limit_s);
    }
    const timedOut = ms >= game.limit_s * 1000;
    const correct = hit && !timedOut;
    const ci = correctIndex(orders[n]);
    // Když netrefí, vybere některou ze zbylých možností — ať rozbor dává smysl.
    const wrong = [0, 1, 2, 3].filter(i => i !== ci);
    const pick = timedOut ? -1 : correct ? ci : wrong[Math.floor(Math.random() * wrong.length)];
    const points = score(correct, ms, game.limit_s);
    total += points;
    stmts.push(env.DB.prepare(
      `INSERT INTO game_answers (game_id, user_id, q_index, pick, ms, correct, points)
       VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(game.id, botUserId, n, pick, ms, correct ? 1 : 0, points));
  }

  stmts.push(env.DB.prepare(
    `UPDATE game_players SET score = ?, answered = ?, finished_at = ?
      WHERE game_id = ? AND user_id = ?`)
    .bind(total, ids.length, Date.now(), game.id, botUserId));

  await env.DB.batch(stmts);
  return total;
}

/** Vybere bota nejblíž zadanému ratingu v daném pásmu. */
export async function pickBot(env, band, targetRating) {
  return env.DB.prepare(
    `SELECT b.user_id, b.strength, u.nick FROM bots b JOIN users u ON u.id = b.user_id
      WHERE u.band = ? ORDER BY ABS(b.strength - ?) LIMIT 1`)
    .bind(band, targetRating).first();
}
