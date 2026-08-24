import { BANDS, TIME_CONTROLS, shuffledOrder, json, fail, newId } from '../../_lib/game.js';
import { currentUser } from '../../_lib/auth.js';
import { pickQuestions, markSeen } from '../../_lib/pool.js';

/**
 * POST /api/game  { mode?, band?, time_control? }
 *   mode: solo  — hraješ sám
 *         odkaz — souboj na odkaz, čeká na druhého hráče (viz join)
 *
 * Otázky se fixují při založení, protože zakladatel může hrát dřív, než soupeř
 * odkaz vůbec otevře. Pravý průnik neviděných obou hráčů jde udělat až u živého
 * duelu, kde jsou při párování známí oba (docs/online-rezim.md, sekce 4).
 */
export async function onRequestPost({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body = {};
  try { body = await request.json(); } catch (e) { /* prázdné tělo = výchozí */ }

  const mode = body.mode || 'solo';
  if (!['solo', 'odkaz'].includes(mode)) return fail('neznámý režim: ' + mode);

  const band = body.band || me.band;
  if (!BANDS.includes(band)) return fail('neznámé pásmo: ' + band);

  const tcName = body.time_control || 'blesk';
  const tc = TIME_CONTROLS[tcName];
  if (!tc) return fail('neznámá časová kontrola: ' + tcName);

  const ids = await pickQuestions(env, band, tc.count, [me.id]);
  if (ids.length < tc.count) return fail('v pásmu ' + band + ' není dost otázek', 503);

  const id = newId();
  const orders = ids.map(() => shuffledOrder());

  await env.DB.batch([
    env.DB.prepare(`INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at, rated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, mode, band, tc.limit_s, JSON.stringify(ids), JSON.stringify(orders),
            Date.now(), mode === 'odkaz' ? 1 : 0),
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 0)')
      .bind(id, me.id),
  ]);
  await markSeen(env, me.id, ids);

  return json({
    id, mode, band, time_control: tcName, total: ids.length, limit_s: tc.limit_s,
    rated: mode === 'odkaz',
  }, 201);
}
