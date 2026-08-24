import { optionsFor, correctIndex, json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';

/**
 * GET /api/game/:id — stav hry a rozbor.
 *
 * Soupeřovy odpovědi se ukážou, teprve když dohráli oba. Kdyby se ukazovaly dřív,
 * stačilo by u souboje na odkaz počkat a hrát s informací navíc.
 */
export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);

  const players = (await env.DB.prepare(
    `SELECT gp.*, u.nick, u.avatar, u.is_bot FROM game_players gp
       JOIN users u ON u.id = gp.user_id
      WHERE gp.game_id = ? ORDER BY gp.slot`).bind(params.id).all()).results;

  const mine = players.find(p => p.user_id === me.id);
  if (!mine) return fail('v téhle hře nehraješ', 403);

  const ids = JSON.parse(game.question_ids);
  const orders = JSON.parse(game.orders);
  const expect = game.mode === 'solo' || game.mode === 'daily' ? 1 : 2;
  const allDone = players.length >= expect && players.every(p => p.finished_at);

  const out = {
    id: game.id, mode: game.mode, band: game.band, total: ids.length,
    rated: !!game.rated, status: game.status,
    waiting_for_opponent: game.mode === 'odkaz' && players.length < 2,
    me: { score: mine.score, answered: mine.answered, done: !!mine.finished_at },
    players: players.map(p => ({
      nick: p.nick, avatar: p.avatar, is_bot: !!p.is_bot, slot: p.slot,
      // Skóre soupeře až po dohrání obou.
      score: allDone || p.user_id === me.id ? p.score : null,
      answered: p.answered, done: !!p.finished_at,
    })),
  };

  if (!mine.finished_at) return json(out);

  // Rozbor vlastní hry vidím hned, jak dohraju.
  const rows = (await env.DB.prepare(
    'SELECT * FROM game_answers WHERE game_id = ? ORDER BY user_id, q_index')
    .bind(params.id).all()).results;
  const byUser = {};
  for (const r of rows) (byUser[r.user_id] ||= {})[r.q_index] = r;

  const qs = (await env.DB
    .prepare(`SELECT * FROM questions WHERE id IN (${ids.map(() => '?').join(',')})`)
    .bind(...ids).all()).results;
  const byId = new Map(qs.map(q => [q.id, q]));

  const opponent = players.find(p => p.user_id !== me.id);
  out.review = ids.map((qid, n) => {
    const q = byId.get(qid), r = byUser[me.id]?.[n];
    const item = {
      n, question: q.question, options: optionsFor(q, orders[n]),
      correct_index: correctIndex(orders[n]),
      pick: r ? r.pick : null, correct: r ? !!r.correct : false, points: r ? r.points : 0,
      explanation: q.explanation, more_fact: q.more_fact, about: q.about,
    };
    if (allDone && opponent) {
      const o = byUser[opponent.user_id]?.[n];
      item.opponent = o ? { pick: o.pick, correct: !!o.correct, points: o.points } : null;
    }
    return item;
  });

  if (allDone && opponent) {
    out.result = mine.score > opponent.score ? 'vyhra'
               : mine.score < opponent.score ? 'prohra' : 'remiza';
  }
  return json(out);
}
