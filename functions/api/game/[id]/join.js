import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { markSeen } from '../../../_lib/pool.js';

/**
 * POST /api/game/:id/join — přijmi souboj na odkaz.
 *
 * Dostaneš úplně stejné otázky ve stejném pořadí jako zakladatel. Jeho výsledek
 * neuvidíš, dokud sám nedohraješ (jinak by stačilo počkat a vědět, na čem záleží).
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);
  if (game.mode !== 'odkaz') return fail('k téhle hře se nedá připojit');

  const players = await env.DB
    .prepare('SELECT user_id, slot FROM game_players WHERE game_id = ?').bind(params.id).all();

  if (players.results.some(p => p.user_id === me.id)) {
    return json({ id: game.id, already: true, total: JSON.parse(game.question_ids).length,
                  limit_s: game.limit_s, band: game.band });
  }
  // Skončená hra (dohraná nebo vyrovnaná expirací po 48 h) už nového hráče nepřijme.
  // Do 2026-09-26 šlo do expirované hry na odkaz vstoupit a odehrát ji — jenže vyrovnání
  // už proběhlo, takže hráč hrál naprázdno a rating ani výsledek se nikdy nezapsal.
  // Hráč, který ve hře už je, projde výš (`already`) a výsledek si zobrazí.
  if (game.status !== 'open') return fail('tenhle souboj už skončil', 410);
  if (players.results.length >= 2) return fail('souboj už má oba hráče', 409);
  if (me.band !== game.band) {
    return fail('tenhle souboj je pro pásmo ' + game.band + ', ty hraješ ' + me.band, 409);
  }

  const ids = JSON.parse(game.question_ids);
  // Kontrola počtu výš je jen zdvořilá hláška — skutečný zámek je UNIQUE index
  // (game_id, slot). Mezi SELECT a INSERT se vejde druhý požadavek (přeposlaný odkaz
  // otevřou dva lidé naráz, nebo join potká /bot) a bez indexu se vložili oba.
  try {
    await env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 1)')
      .bind(params.id, me.id).run();
  } catch (e) {
    return fail('souboj už má oba hráče', 409);
  }
  await markSeen(env, me.id, ids);

  return json({ id: game.id, band: game.band, total: ids.length, limit_s: game.limit_s });
}
