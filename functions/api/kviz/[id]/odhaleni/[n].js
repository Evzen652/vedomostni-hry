import { correctIndex, json, fail } from '../../../../_lib/game.js';
import { currentUser } from '../../../../_lib/auth.js';
import { kvizZRadku, casy } from '../../../../_lib/kviz.js';

/**
 * GET /api/kviz/:id/odhaleni/:n — správná odpověď n-té otázky, nejdřív po uzávěrce
 * (i s tolerancí na síť). Všem stejně, s krátkou statistikou „odpovědělo / trefilo".
 * Přihlášení je nepovinné; přihlášený dostane i svůj tip a body.
 */
export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env);
  const k = kvizZRadku(await env.DB.prepare('SELECT * FROM kvizy WHERE id = ?').bind(params.id).first());
  if (!k) return fail('kvíz nenalezen', 404);
  const n = Number(params.n);
  if (!Number.isInteger(n) || n < 0 || n >= k.question_ids.length) return fail('otázka mimo rozsah', 404);

  const c = casy(k, n);
  const now = Date.now();
  if (now < c.odhaleni_od) {
    return json({ error: 'odpověď se ještě neodhalila', za_ms: c.odhaleni_od - now, server_now: now }, 425);
  }

  const q = await env.DB.prepare(
    'SELECT answer, quip_correct, quip_wrong, explanation, more_fact, about FROM questions WHERE id = ?')
    .bind(k.question_ids[n]).first();
  if (!q) return fail('otázka nenalezena', 404);

  const st = await env.DB.prepare(
    `SELECT COUNT(*) AS odpovedelo, COALESCE(SUM(correct), 0) AS trefilo
       FROM kviz_odpovedi WHERE kviz_id = ? AND q_index = ?`).bind(k.id, n).first();
  const hracu = (await env.DB.prepare('SELECT COUNT(*) AS n FROM kviz_hraci WHERE kviz_id = ?')
    .bind(k.id).first()).n;

  let ja = null;
  if (me) {
    const h = await env.DB.prepare('SELECT score FROM kviz_hraci WHERE kviz_id = ? AND user_id = ?')
      .bind(k.id, me.id).first();
    if (h) {
      const o = await env.DB.prepare(
        'SELECT pick, correct, points, ms FROM kviz_odpovedi WHERE kviz_id = ? AND user_id = ? AND q_index = ?')
        .bind(k.id, me.id, n).first();
      ja = { pick: o ? o.pick : null, correct: !!(o && o.correct), points: o ? o.points : 0,
             ms: o ? o.ms : null, score: h.score };
    }
  }

  return json({
    n, correct_index: correctIndex(k.orders[n]), correct_answer: q.answer,
    quip_correct: q.quip_correct, quip_wrong: q.quip_wrong,
    explanation: q.explanation, more_fact: q.more_fact, about: q.about,
    odpovedelo: st.odpovedelo, trefilo: st.trefilo, hracu, ja, server_now: now,
  });
}
