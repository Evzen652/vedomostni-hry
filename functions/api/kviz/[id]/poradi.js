import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { kvizZRadku, poradi, hotovaKola, casy } from '../../../_lib/kviz.js';

/**
 * GET /api/kviz/:id/poradi — top 10 a moje místo. Jen v PŘESTÁVCE po kole a po konci
 * večera: skóre během kola by s každou odpovědí prozrazovalo, kdo trefil otázku,
 * jejíž odpověď se ještě neodhalila.
 */
export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env);
  const k = kvizZRadku(await env.DB.prepare('SELECT * FROM kvizy WHERE id = ?').bind(params.id).first());
  if (!k) return fail('kvíz nenalezen', 404);
  const now = Date.now();
  const kol = hotovaKola(k, now);
  if (!kol) return fail('pořadí bude po prvním kole', 425);
  // Další kolo už běží → zavřeno, dokud neskončí.
  if (kol < k.kol && now >= casy(k, kol * k.na_kolo).otevreno) return fail('pořadí bude po tomhle kole', 425);
  const po = await poradi(env, k.id, me && me.id);
  return json({ ...po, po_kole: kol, konec: now >= k.konec_at, server_now: now });
}
