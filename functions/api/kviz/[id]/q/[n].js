import { optionsFor, json, fail } from '../../../../_lib/game.js';
import { currentUser } from '../../../../_lib/auth.js';
import { kvizZRadku, casy } from '../../../../_lib/kviz.js';

/**
 * GET /api/kviz/:id/q/:n — n-tá otázka večera, nejdřív v čase jejího otevření.
 *
 * Správná odpověď v payloadu NENÍ (stejně jako u online hry). Stopky neběží od
 * vyžádání, ale od OTEVŘENÍ otázky pro všechny — kdo přijde pozdě, má méně času,
 * a opakované načtení nic nezmění.
 */
export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);
  const k = kvizZRadku(await env.DB.prepare('SELECT * FROM kvizy WHERE id = ?').bind(params.id).first());
  if (!k) return fail('kvíz nenalezen', 404);
  const n = Number(params.n);
  if (!Number.isInteger(n) || n < 0 || n >= k.question_ids.length) return fail('otázka mimo rozsah', 404);

  const hrac = await env.DB.prepare('SELECT 1 FROM kviz_hraci WHERE kviz_id = ? AND user_id = ?').bind(k.id, me.id).first();
  if (!hrac) return fail('do kvízu nejsi přihlášený', 403);

  const c = casy(k, n);
  const now = Date.now();
  if (now < c.otevreno) return json({ error: 'otázka ještě není otevřená', za_ms: c.otevreno - now, server_now: now }, 425);

  const q = await env.DB.prepare(
    'SELECT id, cc, question, answer, distractors, country, section, band, difficulty FROM questions WHERE id = ?')
    .bind(k.question_ids[n]).first();
  if (!q) return fail('otázka nenalezena', 404);

  const moje = await env.DB.prepare(
    'SELECT pick FROM kviz_odpovedi WHERE kviz_id = ? AND user_id = ? AND q_index = ?').bind(k.id, me.id, n).first();

  return json({
    n, total: k.question_ids.length, kolo: Math.floor(n / k.na_kolo) + 1, v_kole: (n % k.na_kolo) + 1,
    limit_s: k.limit_s, ...c, server_now: now,
    id: q.id, cc: q.cc, country: q.country, section: q.section,
    difficulty: q.difficulty || 1, kids: q.band === 'deti',
    question: q.question, options: optionsFor(q, k.orders[n]),
    // Po obnovení stránky se má zobrazit, že už odpověděl (a co tipnul).
    muj_tip: moje ? moje.pick : null,
  });
}
