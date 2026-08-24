import { optionsFor, correctIndex, json, fail } from '../../../_lib/game.js';

/**
 * GET /api/game/:id — stav hry a rozbor.
 *
 * Dokud hra běží, vrací jen skóre a postup. Teprve po zodpovězení všech otázek
 * přidá rozbor se správnými odpověďmi — obdoba analýzy partie na chess.com.
 */
export async function onRequestGet({ params, env }) {
  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);

  const ids = JSON.parse(game.question_ids);
  const orders = JSON.parse(game.orders);

  const answered = await env.DB
    .prepare('SELECT * FROM game_answers WHERE game_id = ? ORDER BY q_index')
    .bind(params.id).all();
  const rows = answered.results;

  const score = rows.reduce((a, r) => a + r.points, 0);
  const hits = rows.reduce((a, r) => a + r.correct, 0);
  const done = rows.length === ids.length;

  const base = {
    id: game.id, band: game.band, total: ids.length,
    answered: rows.length, score, correct: hits, done,
  };
  if (!done) return json(base);

  const byIndex = new Map(rows.map(r => [r.q_index, r]));
  const qs = await env.DB
    .prepare(`SELECT * FROM questions WHERE id IN (${ids.map(() => '?').join(',')})`)
    .bind(...ids).all();
  const byId = new Map(qs.results.map(q => [q.id, q]));

  base.review = ids.map((qid, n) => {
    const q = byId.get(qid), r = byIndex.get(n), opts = optionsFor(q, orders[n]);
    return {
      n, question: q.question, options: opts,
      correct_index: correctIndex(orders[n]),
      pick: r.pick, correct: !!r.correct, points: r.points,
      explanation: q.explanation, more_fact: q.more_fact, about: q.about,
    };
  });
  return json(base);
}
