import { BANDS, TIME_CONTROLS, shuffledOrder, json, fail, newId } from '../../_lib/game.js';

/** POST /api/game — založí hru. Vrátí jen id a rozsah, žádné otázky. */
export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch (e) { /* prázdné tělo = výchozí */ }

  const band = body.band || 'dospeli';
  const tcName = body.time_control || 'blesk';
  const tc = TIME_CONTROLS[tcName];

  if (!BANDS.includes(band)) return fail('neznámé pásmo: ' + band);
  if (!tc) return fail('neznámá časová kontrola: ' + tcName);

  const picked = await env.DB
    .prepare('SELECT id FROM questions WHERE band = ? ORDER BY RANDOM() LIMIT ?')
    .bind(band, tc.count)
    .all();

  const ids = picked.results.map(r => r.id);
  if (ids.length < tc.count) return fail('v pásmu ' + band + ' není dost otázek', 503);

  const orders = ids.map(() => shuffledOrder());
  const id = newId();

  await env.DB
    .prepare(`INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, body.mode || 'solo', band, tc.limit_s,
          JSON.stringify(ids), JSON.stringify(orders), Date.now())
    .run();

  return json({ id, band, time_control: tcName, total: ids.length, limit_s: tc.limit_s });
}
