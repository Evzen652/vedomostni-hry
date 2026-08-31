import { BANDS, shuffledOrder, json, fail, newId } from '../../_lib/game.js';
import { currentUser } from '../../_lib/auth.js';
import { markSeen } from '../../_lib/pool.js';

const DAILY_COUNT = 5;
const DAILY_LIMIT_S = 20;

const today = () => new Date().toISOString().slice(0, 10);

/**
 * GET /api/daily — dnešní pětka pro tvoje pásmo.
 *
 * Pro všechny v pásmu stejná, jeden pokus denně. Sada se založí při prvním
 * požadavku toho dne a od té chvíle je pevná — proto se tady NEuplatňuje evidence
 * viděných otázek, jinak by každý dostal jinou pětku a žebříček dne by nedával smysl.
 */
export async function onRequestGet({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  // Pásmo se bere z účtu, ne z URL. Do 2026-08-31 tu bylo `?band=` s fallbackem na
  // účet, takže šlo odehrát cizí pětku a zapsat se do denního žebříčku cizího pásma.
  const band = me.band;
  if (!BANDS.includes(band)) return fail('neznámé pásmo');

  const date = today();
  const set = await ensureDaily(env, date, band);
  if (!set) return fail('pro pásmo ' + band + ' není dost otázek', 503);

  const existing = await env.DB.prepare(
    `SELECT g.id, g.status, gp.score, gp.answered, gp.finished_at
       FROM games g JOIN game_players gp ON gp.game_id = g.id
      WHERE g.mode = 'daily' AND g.daily_date = ? AND g.band = ? AND gp.user_id = ?`)
    .bind(date, band, me.id).first();

  if (existing) {
    return json({
      date, band, total: DAILY_COUNT, limit_s: DAILY_LIMIT_S,
      game_id: existing.id, already_played: !!existing.finished_at,
      score: existing.score, answered: existing.answered,
    });
  }

  const ids = JSON.parse(set.question_ids);
  const id = newId();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at, daily_date)
                    VALUES (?, 'daily', ?, ?, ?, ?, ?, ?)`)
      .bind(id, band, DAILY_LIMIT_S, set.question_ids, set.orders, Date.now(), date),
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 0)')
      .bind(id, me.id),
  ]);
  await markSeen(env, me.id, ids);

  return json({
    date, band, total: DAILY_COUNT, limit_s: DAILY_LIMIT_S,
    game_id: id, already_played: false, score: 0, answered: 0,
  }, 201);
}

/** Založí dnešní sadu, pokud ještě není. Souběh řeší INSERT OR IGNORE. */
async function ensureDaily(env, date, band) {
  const have = await env.DB.prepare('SELECT * FROM daily WHERE date = ? AND band = ?')
    .bind(date, band).first();
  if (have) return have;

  const picked = (await env.DB
    .prepare('SELECT id FROM questions WHERE band = ? ORDER BY RANDOM() LIMIT ?')
    .bind(band, DAILY_COUNT).all()).results.map(r => r.id);
  if (picked.length < DAILY_COUNT) return null;

  await env.DB.prepare(
    'INSERT OR IGNORE INTO daily (date, band, question_ids, orders) VALUES (?, ?, ?, ?)')
    .bind(date, band, JSON.stringify(picked),
          JSON.stringify(picked.map(() => shuffledOrder()))).run();

  return env.DB.prepare('SELECT * FROM daily WHERE date = ? AND band = ?').bind(date, band).first();
}
