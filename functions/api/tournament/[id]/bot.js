import { TIME_CONTROLS, shuffledOrder, json, fail, newId, limitUctu } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { pickBot, botPlay } from '../../../_lib/bot.js';
import { pickQuestions, markSeen } from '../../../_lib/pool.js';
import { settleIfDone } from '../../../_lib/settle.js';
import { tournamentStatus } from '../../../_lib/tournament.js';

/**
 * POST /api/tournament/:id/bot — rovnou odehraj kolo turnaje proti botovi.
 *
 * Na rozdíl od souboje na odkaz tu není žádná rozehraná hra, do které se bot
 * „pouští" — celé kolo se založí a bot ho odehraje najednou, ať hráč nemusí
 * čekat na nikoho (docs/online-rezim.md, sekce 2).
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

  const t = await env.DB.prepare('SELECT * FROM tournaments WHERE id = ?').bind(params.id).first();
  if (!t) return fail('turnaj nenalezen', 404);
  if (tournamentStatus(t) !== 'bezi') return fail('turnaj zrovna neběží', 409);

  const joined = await env.DB.prepare(
    'SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?')
    .bind(params.id, me.id).first();
  if (!joined) return fail('nejdřív se do turnaje přidej', 403);

  await env.DB.prepare('DELETE FROM tournament_queue WHERE tournament_id = ? AND user_id = ?')
    .bind(params.id, me.id).run();

  const mine = await env.DB.prepare('SELECT rating FROM ratings WHERE user_id = ? AND band = ?')
    .bind(me.id, t.band).first();
  const bot = await pickBot(env, t.band, mine ? mine.rating : 1500);
  if (!bot) return fail('pro pásmo ' + t.band + ' není žádný bot', 503);

  // Pojistka pro turnaje uložené dřív, než se validace opravila (viz TC_NAMES v _lib/game.js).
  const tc = TIME_CONTROLS[t.time_control];
  if (!tc) return fail('turnaj má poškozenou časovou kontrolu', 409);
  const ids = await pickQuestions(env, t.band, tc.count, [me.id]);
  if (ids.length < tc.count) return fail('v pásmu ' + t.band + ' není dost otázek', 503);

  const gameId = newId();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at, rated, tournament_id)
       VALUES (?, 'turnaj', ?, ?, ?, ?, ?, 0, ?)`)
      .bind(gameId, t.band, tc.limit_s, JSON.stringify(ids),
            JSON.stringify(ids.map(() => shuffledOrder())), Date.now(), params.id),
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 0)')
      .bind(gameId, me.id),
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 1)')
      .bind(gameId, bot.user_id),
  ]);
  await markSeen(env, me.id, ids);

  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(gameId).first();
  const botScore = await botPlay(env, game, bot.user_id, bot.strength);
  await settleIfDone(env, gameId);   // no-op, dokud hráč sám nedohraje — stejný vzor jako /api/game/:id/bot

  return json({ game_id: gameId, total: ids.length, limit_s: tc.limit_s,
                bot: { nick: bot.nick, strength: Math.round(bot.strength) }, bot_score: botScore });
}
