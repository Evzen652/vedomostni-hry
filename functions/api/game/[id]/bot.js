import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { pickBot, botPlay } from '../../../_lib/bot.js';
import { markSeen } from '../../../_lib/pool.js';
import { settleIfDone } from '../../../_lib/settle.js';

/**
 * POST /api/game/:id/bot — pusť do svého souboje bota.
 *
 * Tohle je pojistka proti prázdné herně: dokud není koho párovat, soupeře dodá
 * bot odpovídající tvému ratingu. Hra je nehodnocená (docs/online-rezim.md, sekce 2).
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);
  if (game.mode !== 'odkaz') return fail('do téhle hry se bot pustit nedá');

  const players = (await env.DB
    .prepare('SELECT user_id FROM game_players WHERE game_id = ?').bind(params.id).all()).results;
  if (!players.some(p => p.user_id === me.id)) return fail('v téhle hře nehraješ', 403);
  if (players.length >= 2) return fail('souboj už má oba hráče', 409);

  const mine = await env.DB.prepare('SELECT rating FROM ratings WHERE user_id = ? AND band = ?')
    .bind(me.id, game.band).first();
  const bot = await pickBot(env, game.band, mine ? mine.rating : 1500);
  if (!bot) return fail('pro pásmo ' + game.band + ' není žádný bot', 503);

  // Zámek je UNIQUE index (game_id, slot) — kontrola počtu výš má mezi sebou a tímhle
  // zápisem mezeru, kterou trefí /bot současně s /join (nebo dva klikové /bot).
  try {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 1)')
        .bind(params.id, bot.user_id),
      // Bot hraje nehodnoceně, ať nejde farmit rating na slabých botech.
      env.DB.prepare('UPDATE games SET rated = 0 WHERE id = ?').bind(params.id),
    ]);
  } catch (e) {
    return fail('souboj už má oba hráče', 409);
  }
  await markSeen(env, bot.user_id, JSON.parse(game.question_ids));

  const score = await botPlay(env, game, bot.user_id, bot.strength);
  await settleIfDone(env, params.id);

  return json({ bot: { nick: bot.nick, strength: Math.round(bot.strength) }, bot_score: score });
}
