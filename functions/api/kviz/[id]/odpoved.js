import { correctIndex, score, json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { kvizZRadku, casy, TOLERANCE_MS } from '../../../_lib/kviz.js';

/**
 * POST /api/kviz/:id/odpoved  { n, pick }
 *
 * Čas se měří na serveru od OTEVŘENÍ otázky (casy().otevreno), ne od jejího vyžádání.
 * Odpověď NEŘÍKÁ, jestli byla správná — to se dozví všichni naráz při odhalení.
 * Jinak by si to hráč, který odpověděl, mohl hned poslat ostatním.
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);
  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }
  const { n, pick } = body;
  if (!Number.isInteger(n) || !Number.isInteger(pick) || pick < 0 || pick > 3) {
    return fail('n a pick musí být celá čísla, pick 0 až 3');
  }

  const k = kvizZRadku(await env.DB.prepare('SELECT * FROM kvizy WHERE id = ?').bind(params.id).first());
  if (!k) return fail('kvíz nenalezen', 404);
  if (n < 0 || n >= k.question_ids.length) return fail('otázka mimo rozsah', 404);
  const hrac = await env.DB.prepare('SELECT 1 FROM kviz_hraci WHERE kviz_id = ? AND user_id = ?')
    .bind(k.id, me.id).first();
  if (!hrac) return fail('do kvízu nejsi přihlášený', 403);

  const c = casy(k, n);
  const now = Date.now();
  if (now < c.otevreno) return fail('otázka ještě není otevřená', 425);
  if (now > c.uzaverka + TOLERANCE_MS) return fail('čas na odpověď vypršel', 410);

  const ms = Math.max(0, now - c.otevreno);
  const correct = pick === correctIndex(k.orders[n]);
  const points = score(correct, ms, k.limit_s);

  // PK (kviz_id, user_id, q_index) drží jednu odpověď i při dvojkliku a opakování po výpadku.
  const zapis = await env.DB.prepare(
    `INSERT OR IGNORE INTO kviz_odpovedi (kviz_id, user_id, q_index, pick, ms, correct, points)
     VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(k.id, me.id, n, pick, ms, correct ? 1 : 0, points).run();
  if (!zapis.meta.changes) return fail('na tuhle otázku už bylo odpovězeno', 409);

  await env.DB.batch([
    env.DB.prepare('UPDATE kviz_hraci SET score = score + ?, spravne = spravne + ? WHERE kviz_id = ? AND user_id = ?')
      .bind(points, correct ? 1 : 0, k.id, me.id),
    env.DB.prepare('UPDATE questions SET served = served + 1, hit = hit + ? WHERE id = ?')
      .bind(correct ? 1 : 0, k.question_ids[n]),
  ]);
  return json({ prijato: true, ms });
}
