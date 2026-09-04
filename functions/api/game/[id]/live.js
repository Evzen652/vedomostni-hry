import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';

/**
 * GET /api/game/:id/live — lehký dotaz na průběh soupeře během živého duelu.
 *
 * Vrací jen postup a skóre, nic z obsahu otázek. Volá se každé ~2 s, proto je
 * odpověď co nejmenší. Obdoba šachových hodin: vidíš, jak si soupeř vede,
 * ale ne co odpovídá.
 */
export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const game = await env.DB.prepare('SELECT mode FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);

  const players = (await env.DB.prepare(
    `SELECT gp.user_id, gp.score, gp.answered, gp.finished_at, u.nick, u.is_bot
       FROM game_players gp JOIN users u ON u.id = gp.user_id
      WHERE gp.game_id = ? ORDER BY gp.slot`).bind(params.id).all()).results;

  const mine = players.find(p => p.user_id === me.id);
  if (!mine) return fail('v téhle hře nehraješ', 403);

  const opponent = players.find(p => p.user_id !== me.id);
  const allDone = players.length >= 2 && players.every(p => p.finished_at);

  // Jak si soupeř vedl na otázkách, které už mám ZA SEBOU. Bez toho je duel jen dvě
  // čísla v rohu — hráč nepozná, jestli soupeře na téhle otázce dostal, nebo naopak.
  //
  // Hranice `q_index < mine.answered` je to, co drží anti-cheat: dokud na otázku
  // neodpovím, nevím o soupeřově tipu nic. Jakmile odpovím, správnou odpověď už mi
  // vrátil /answer, takže „soupeř ji trefil" mi nedává žádnou výhodu — jen napětí.
  let opponentAnswers = [];
  if (opponent && mine.answered > 0) {
    opponentAnswers = (await env.DB.prepare(
      `SELECT q_index, correct, ms FROM game_answers
        WHERE game_id = ? AND user_id = ? AND q_index < ?
        ORDER BY q_index`).bind(params.id, opponent.user_id, mine.answered).all()).results
      .map(r => ({ n: r.q_index, correct: !!r.correct, ms: r.ms }));
  }

  return json({
    me: { score: mine.score, answered: mine.answered, done: !!mine.finished_at },
    opponent: opponent ? {
      nick: opponent.nick, is_bot: !!opponent.is_bot,
      answered: opponent.answered, done: !!opponent.finished_at,
      answers: opponentAnswers,
      // Průběžné skóre jen u živého duelu, kde hrajete současně — tam z něj nejde
      // vytěžit výhoda, jen napětí. U souboje na odkaz soupeř většinou už dohrál,
      // takže by to prozradilo přesnou metu, na kterou stačí dojet.
      score: game.mode === 'duel' || allDone ? opponent.score : null,
    } : null,
    both_done: allDone,
  });
}
