import { correctIndex, score, json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { settleIfDone } from '../../../_lib/settle.js';

/**
 * POST /api/game/:id/answer   { n, pick, ms }
 *
 * Vyhodnocuje výhradně server. Odpověď na už zodpovězenou otázku se odmítne —
 * jinak by šlo tipnout, přečíst si správnou možnost z odpovědi a zkusit to znovu.
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  // `ms` z těla se od 2026-09-01 IGNORUJE. Zůstává jen kvůli starším klientům, kteří
  // ho posílají — čas se měří na serveru mezi vydáním otázky a touhle odpovědí.
  const { n, pick } = body;
  if (!Number.isInteger(n) || !Number.isInteger(pick)) {
    return fail('n a pick musí být celá čísla');
  }

  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);

  const player = await env.DB
    .prepare('SELECT * FROM game_players WHERE game_id = ? AND user_id = ?')
    .bind(params.id, me.id).first();
  if (!player) return fail('v téhle hře nehraješ', 403);
  if (player.finished_at) return fail('tuhle hru už jsi dohrál', 409);

  const ids = JSON.parse(game.question_ids);
  const orders = JSON.parse(game.orders);
  if (n < 0 || n >= ids.length) return fail('otázka mimo rozsah', 404);
  if (pick < -1 || pick > 3) return fail('neplatný tip');

  const already = await env.DB
    .prepare('SELECT 1 FROM game_answers WHERE game_id = ? AND user_id = ? AND q_index = ?')
    .bind(params.id, me.id, n).first();
  if (already) return fail('na tuhle otázku už bylo odpovězeno', 409);

  const q = await env.DB.prepare('SELECT * FROM questions WHERE id = ?').bind(ids[n]).first();
  if (!q) return fail('otázka nenalezena', 404);

  // ČAS SE MĚŘÍ NA SERVERU. Do 2026-09-01 se bral `ms` z těla požadavku a server
  // neměl s čím ho porovnat — nikde si nepamatoval, kdy otázku vydal. `ms: 0` proto
  // dalo vždycky maximum a limit žil jen v prohlížeči.
  //
  // Odpověď na nevydanou otázku se odmítá: na co ses nepodíval, na to nemůžeš
  // odpovědět. Zavírá to i cestu „přeskoč načtení a hádej rovnou u všech otázek".
  const vydano = await env.DB
    .prepare('SELECT served_at FROM q_served WHERE game_id = ? AND user_id = ? AND q_index = ?')
    .bind(params.id, me.id, n).first();
  if (!vydano) return fail('tuhle otázku sis nevyžádal', 409);

  // Rozdíl je celý na serverových hodinách, takže se nemá o co rozejít. Zahrnuje
  // i jednu cestu tam a zpět po síti — u limitu 10 s a lineárního bonusu stojí
  // stovka milisekund jeden bod ze sta, což je pod rozlišovací schopností hráče.
  const ms = Math.max(0, Date.now() - vydano.served_at);

  const ci = correctIndex(orders[n]);
  const correct = pick === ci;
  const points = score(correct, ms, game.limit_s);

  // `answered` se zvyšuje RELATIVNĚ, ne zápisem přečtené hodnoty. Do 2026-09-01 tu
  // stálo `answered = player.answered + 1`, kde `player` se načetl o pár řádků výš —
  // klasický ztracený zápis: dvě souběžné odpovědi na různé otázky (dvojklik, retry
  // po výpadku sítě, dvě zařízení) obě spočítaly totéž číslo a čítač zůstal pozadu.
  // `answered === ids.length` pak nikdy nenastalo, `finished_at` zůstalo NULL a hra
  // visela v 'open' NAVŽDY — settleIfDone se nespustil a soupeř nedostal výsledek.
  // Zneužitelné i schválně: takhle si šlo rozbít vlastní prohranou partii.
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO game_answers (game_id, user_id, q_index, pick, ms, correct, points)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(params.id, me.id, n, pick, ms, correct ? 1 : 0, points),
    env.DB.prepare(`UPDATE game_players SET score = score + ?, answered = answered + 1
                     WHERE game_id = ? AND user_id = ?`)
      .bind(points, params.id, me.id),
    // statistika pro rating otázky (docs/online-rezim.md, sekce 3)
    env.DB.prepare('UPDATE questions SET served = served + 1, hit = hit + ? WHERE id = ?')
      .bind(correct ? 1 : 0, q.id),
  ]);

  // Skóre i počet se čtou ZPĚTNĚ, ať odpověď klientovi odpovídá skutečnosti i při
  // souběhu. Duplicitní odpověď je vyloučená PK (game_id, user_id, q_index), takže
  // je tenhle počet autoritativní.
  const po = await env.DB
    .prepare('SELECT score, answered FROM game_players WHERE game_id = ? AND user_id = ?')
    .bind(params.id, me.id).first();
  const answered = po.answered;
  const done = answered >= ids.length;

  if (done) {
    // `finished_at IS NULL` drží zápis idempotentní — čas dohrání se nesmí posunout,
    // když sem doběhnou dvě poslední odpovědi současně.
    await env.DB.prepare(`UPDATE game_players SET finished_at = ?
                           WHERE game_id = ? AND user_id = ? AND finished_at IS NULL`)
      .bind(Date.now(), params.id, me.id).run();
    await settleIfDone(env, params.id);
  }

  return json({
    correct,
    correct_index: ci,
    // Text správné odpovědi jde ven až TEĎ, po odeslání tipu — karta „Více o…"
    // ho potřebuje jako nadpis (CLAUDE.md 2026-07-31).
    correct_answer: q.answer,
    points,
    score: po.score,
    answered,
    done,
    quip: correct ? q.quip_correct : q.quip_wrong,
    explanation: q.explanation,
    more_fact: q.more_fact,
    about: q.about,
  });
}
