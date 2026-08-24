import { optionsFor, json, fail } from '../../../../_lib/game.js';

/**
 * GET /api/game/:id/q/:n — n-tá otázka.
 *
 * KLÍČOVÉ: odpověď se v payloadu neobjeví. Vrací se jen zamíchané možnosti bez
 * označení, která je správná; vyhodnocuje se na serveru. Bez toho by stačilo
 * otevřít devtools a hra by nebyla hra (docs/online-rezim.md, Anti-cheat).
 */
export async function onRequestGet({ params, env }) {
  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);

  const ids = JSON.parse(game.question_ids);
  const orders = JSON.parse(game.orders);
  const n = Number(params.n);
  if (!Number.isInteger(n) || n < 0 || n >= ids.length) return fail('otázka mimo rozsah', 404);

  const q = await env.DB
    .prepare('SELECT id, question, answer, distractors, country, section FROM questions WHERE id = ?')
    .bind(ids[n]).first();
  if (!q) return fail('otázka nenalezena', 404);

  return json({
    n,
    total: ids.length,
    limit_s: game.limit_s,
    country: q.country,
    section: q.section,
    question: q.question,
    options: optionsFor(q, orders[n]),
  });
}
