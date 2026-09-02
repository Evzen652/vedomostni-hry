import { BANDS, TIME_CONTROLS, shuffledOrder, json, fail, newId, checkRateLimit } from '../../_lib/game.js';
import { currentUser } from '../../_lib/auth.js';
import { pickQuestions, markSeen } from '../../_lib/pool.js';

// Klouzavé okno na ZALOŽENÍ hry, per uživatel (2026-09-02) — bez limitu šlo skriptem
// zaplavit tabulku `games` donekonečna. 30 za hodinu je nad tím, co udělá reálná hra
// (jeden souboj trvá pár minut) — `test:api` má nejnáročnější scénář 14 her z jednoho
// účtu v kalibračních smyčkách, tohle mu zůstává hodně nad hlavou.
const MAX_GAMES = 30;
const WINDOW_MS = 60 * 60 * 1000;

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

  const pod = await checkRateLimit(
    () => env.DB.prepare('SELECT game_tries AS tries, game_tries_at AS tries_at FROM users WHERE id = ?').bind(me.id).first(),
    (tries, at) => env.DB.prepare('UPDATE users SET game_tries = ?, game_tries_at = ? WHERE id = ?').bind(tries, at, me.id).run(),
    MAX_GAMES, WINDOW_MS);
  if (!pod) return fail('příliš mnoho založených her, zkus to za chvíli', 429);

  let body = {};
  try { body = await request.json(); } catch (e) { /* prázdné tělo = výchozí */ }

  const mode = body.mode || 'solo';
  if (!['solo', 'odkaz'].includes(mode)) return fail('neznámý režim: ' + mode);

  // Pásmo se bere VÝHRADNĚ z účtu. Do 2026-08-31 tu bylo `body.band || me.band`
  // a kontrolovalo se jen členství v BANDS, ne shoda s hráčem — dospělý účet si tak
  // ručně sestaveným požadavkem mohl založit HODNOCENÝ souboj na odkaz (`rated=1`,
  // níž) v dětském pásmu. Dítě se k němu smělo připojit, protože join.js porovnává
  // jen s `game.band`, a `ratingRow()` v _lib/settle.js si řádek pro libovolné pásmo
  // prostě založí — dospělý se tím dostal do dětského žebříčku. Z aplikace to nešlo
  // (online.js `band` neposílá), ale díra to byla.
  const band = me.band;
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
