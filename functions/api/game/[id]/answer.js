import { correctIndex, score, json, fail } from '../../../_lib/game.js';

/**
 * POST /api/game/:id/answer   { n, pick, ms }
 *
 * Vyhodnocuje výhradně server. Odpověď na už zodpovězenou otázku se odmítne —
 * jinak by šlo tipnout, přečíst si správnou možnost z odpovědi a zkusit to znovu.
 */
export async function onRequestPost({ params, request, env }) {
  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const { n, pick, ms } = body;
  if (!Number.isInteger(n) || !Number.isInteger(pick) || !Number.isInteger(ms)) {
    return fail('n, pick a ms musí být celá čísla');
  }

  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);

  const ids = JSON.parse(game.question_ids);
  const orders = JSON.parse(game.orders);
  if (n < 0 || n >= ids.length) return fail('otázka mimo rozsah', 404);
  if (pick < -1 || pick > 3) return fail('neplatný tip');

  const already = await env.DB
    .prepare('SELECT 1 FROM game_answers WHERE game_id = ? AND q_index = ?')
    .bind(params.id, n).first();
  if (already) return fail('na tuhle otázku už bylo odpovězeno', 409);

  const q = await env.DB
    .prepare('SELECT * FROM questions WHERE id = ?').bind(ids[n]).first();
  if (!q) return fail('otázka nenalezena', 404);

  const ci = correctIndex(orders[n]);
  const correct = pick === ci;
  const points = score(correct, ms, game.limit_s);

  await env.DB.batch([
    env.DB.prepare(`INSERT INTO game_answers (game_id, q_index, pick, ms, correct, points)
                    VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(params.id, n, pick, ms, correct ? 1 : 0, points),
    // statistika pro budoucí rating otázky (viz docs/online-rezim.md, sekce 3)
    env.DB.prepare('UPDATE questions SET served = served + 1, hit = hit + ? WHERE id = ?')
      .bind(correct ? 1 : 0, q.id),
  ]);

  return json({
    correct,
    correct_index: ci,
    points,
    quip: correct ? q.quip_correct : q.quip_wrong,
    explanation: q.explanation,
    more_fact: q.more_fact,
    about: q.about,
  });
}
