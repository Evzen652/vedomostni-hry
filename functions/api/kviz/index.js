import { json } from '../../_lib/game.js';
import { currentUser } from '../../_lib/auth.js';
import { zajistiDalsi, aktualni, kvizZRadku, verejny, poradi, TERMINY } from '../../_lib/kviz.js';

/**
 * GET /api/kviz — co se hraje: běžící nebo nejbližší kvíz, minulý večer s vítězem
 * a pravidelné termíny. Přihlášení je nepovinné (úvodní strana se ukazuje i bez profilu).
 *
 * `server_now` je tu kvůli hodinám: klient si z něj spočítá posun svých hodin a celý
 * večer pak řídí podle serverového času (kviz.js → casy()).
 */
export async function onRequestGet({ request, env }) {
  const now = Date.now();
  await zajistiDalsi(env, now);
  const me = await currentUser(request, env);
  const k = await aktualni(env, now);

  let kviz = null;
  if (k) {
    const pocet = (await env.DB.prepare('SELECT COUNT(*) AS n FROM kviz_hraci WHERE kviz_id = ?').bind(k.id).first()).n;
    const ja = me ? await env.DB.prepare('SELECT 1 FROM kviz_hraci WHERE kviz_id = ? AND user_id = ?')
      .bind(k.id, me.id).first() : null;
    kviz = { ...verejny(k), pocet_hracu: pocet, prihlasen: !!ja };
  }

  let predchozi = null;
  const p = kvizZRadku(await env.DB.prepare(
    'SELECT * FROM kvizy WHERE konec_at <= ? ORDER BY starts_at DESC LIMIT 1').bind(now).first());
  if (p) {
    const po = await poradi(env, p.id, me && me.id);
    if (po.pocet) predchozi = { id: p.id, starts_at: p.starts_at, pocet: po.pocet, vitez: po.top[0] || null, ja: po.ja };
  }

  return json({ server_now: now, ja: me ? me.nick : null, kviz, predchozi, terminy: TERMINY });
}
