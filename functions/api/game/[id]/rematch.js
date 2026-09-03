import { TIME_CONTROLS, shuffledOrder, json, fail, newId, limitUctu } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { pickQuestions, markSeen } from '../../../_lib/pool.js';
import { botPlay } from '../../../_lib/bot.js';

/**
 * POST /api/game/:id/rematch — odveta se stejným soupeřem a nastavením.
 *
 * Tady jsou oba hráči známí předem, takže se otázky losují z pravého průniku
 * neviděných obou — na rozdíl od prvního souboje na odkaz, kde soupeře ještě neznáme.
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  // Zakládání hry má limit na VŠECH čtyřech cestách, ne jen v api/game/index.js.
  // Do 2026-09-03 ho měla jen ta jedna, takže se dal obejít turnajovým botem: každé
  // volání založilo hru, dva hráče, deset odpovědí a deset viděných otázek, a to bez
  // jediné odpovědi hráče. Konstanty schválně tady, ne sdílené — každá cesta smí mít
  // vlastní strop, kdyby se ukázalo, že jeden nesedí na všechny.
  const MAX_HER = 30, OKNO_MS = 60 * 60 * 1000;
  if (!(await limitUctu(env, me.id, 'game_tries', MAX_HER, OKNO_MS)))
    return fail('příliš mnoho založených her, zkus to za chvíli', 429);

  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);
  if (game.status !== 'done') return fail('odveta až po dohrání', 409);

  const players = (await env.DB.prepare(
    `SELECT gp.user_id, u.is_bot FROM game_players gp JOIN users u ON u.id = gp.user_id
      WHERE gp.game_id = ?`).bind(params.id).all()).results;

  if (!players.some(p => p.user_id === me.id)) return fail('v téhle hře jsi nehrál', 403);
  const other = players.find(p => p.user_id !== me.id);
  if (!other) return fail('sólo hra nemá odvetu');

  const tcName = Object.keys(TIME_CONTROLS)
    .find(k => TIME_CONTROLS[k].count === JSON.parse(game.question_ids).length) || 'blesk';
  const tc = TIME_CONTROLS[tcName];

  const ids = await pickQuestions(env, game.band, tc.count, [me.id, other.user_id]);
  if (ids.length < tc.count) return fail('došly otázky, které jste ještě neviděli', 503);

  const id = newId();
  const rated = !other.is_bot ? 1 : 0;

  await env.DB.batch([
    env.DB.prepare(`INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at, rated)
                    VALUES (?, 'odkaz', ?, ?, ?, ?, ?, ?)`)
      .bind(id, game.band, tc.limit_s, JSON.stringify(ids),
            JSON.stringify(ids.map(() => shuffledOrder())), Date.now(), rated),
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 0)')
      .bind(id, me.id),
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 1)')
      .bind(id, other.user_id),
  ]);
  // Soupeři se otázky NEODEPISUJÍ tady. Do 2026-09-01 se mu volalo markSeen rovnou
  // při založení odvety — tedy dřív, než ji vůbec uviděl, a bez jakéhokoli limitu
  // na počet odvet. Kdo si se mnou jednou zahrál, mohl mi ve smyčce vyprázdnit celý
  // fond, dokud mi každá další hra nespadla na „došly otázky, které jste neviděli".
  // Otázka se soupeři započítá, až si ji doopravdy vyžádá (q/[n].js).
  await markSeen(env, me.id, ids);

  // Bot musí odehrát rovnou, jinak by odveta zůstala viset a čekala na soupeře,
  // který se sám nikdy neozve.
  let botScore = null;
  if (other.is_bot) {
    const bot = await env.DB.prepare('SELECT strength FROM bots WHERE user_id = ?')
      .bind(other.user_id).first();
    const fresh = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(id).first();
    botScore = await botPlay(env, fresh, other.user_id, bot ? bot.strength : 1500);
  }

  return json({ id, band: game.band, total: ids.length, limit_s: tc.limit_s,
                rated: !!rated, bot_score: botScore }, 201);
}
