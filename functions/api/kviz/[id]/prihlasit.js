import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { kvizZRadku } from '../../../_lib/kviz.js';

/**
 * POST /api/kviz/:id/prihlasit  { zdroj? }
 *
 * Přihlásí hráče do večera. Jde to i během kvízu (kdo přijde pozdě, naskočí do běžící
 * otázky a zmeškané má za nulu), ne po konci. Druhé přihlášení nic nemění.
 * `zdroj` je štítek z odkazu (`?zdroj=fb-streda`), podle kterého se vyhodnocuje reklama.
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);
  let body = {};
  try { body = await request.json(); } catch (e) { /* tělo je nepovinné */ }

  const k = kvizZRadku(await env.DB.prepare('SELECT * FROM kvizy WHERE id = ?').bind(params.id).first());
  if (!k) return fail('kvíz nenalezen', 404);
  const now = Date.now();
  if (now >= k.konec_at) return fail('kvíz už skončil', 410);

  const zdroj = String(body.zdroj || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40) || null;
  await env.DB.prepare(
    `INSERT OR IGNORE INTO kviz_hraci (kviz_id, user_id, zdroj, prihlasen_at) VALUES (?, ?, ?, ?)`)
    .bind(k.id, me.id, zdroj, now).run();
  const pocet = (await env.DB.prepare('SELECT COUNT(*) AS n FROM kviz_hraci WHERE kviz_id = ?').bind(k.id).first()).n;
  return json({ prihlasen: true, pocet_hracu: pocet });
}
