import { optionsFor, json, fail } from '../../../../_lib/game.js';
import { currentUser } from '../../../../_lib/auth.js';
import { markSeen } from '../../../../_lib/pool.js';

/**
 * GET /api/game/:id/q/:n — n-tá otázka.
 *
 * KLÍČOVÉ: správná odpověď se v payloadu neobjeví. Vrací se jen zamíchané možnosti
 * bez označení, která je správná; vyhodnocuje se na serveru. Bez toho by stačilo
 * otevřít devtools a hra by nebyla hra (docs/online-rezim.md, Anti-cheat).
 */
export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const game = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(params.id).first();
  if (!game) return fail('hra nenalezena', 404);

  const player = await env.DB
    .prepare('SELECT 1 FROM game_players WHERE game_id = ? AND user_id = ?')
    .bind(params.id, me.id).first();
  if (!player) return fail('v téhle hře nehraješ', 403);

  const ids = JSON.parse(game.question_ids);
  const orders = JSON.parse(game.orders);
  const n = Number(params.n);
  if (!Number.isInteger(n) || n < 0 || n >= ids.length) return fail('otázka mimo rozsah', 404);

  const q = await env.DB
    .prepare('SELECT id, cc, question, answer, distractors, country, section, band, difficulty FROM questions WHERE id = ?')
    .bind(ids[n]).first();
  if (!q) return fail('otázka nenalezena', 404);

  // Otázka se počítá za viděnou TEĎ, když si ji hráč vyžádal — ne dopředu při
  // založení hry. Odveta to dřív dělala za soupeře, který ji nikdy neuviděl, a šlo
  // mu tím vyprázdnit fond (viz rematch.js). `INSERT OR IGNORE`, takže opakované
  // načtení téže otázky nic nestojí.
  await markSeen(env, me.id, [q.id]);

  // Od téhle chvíle běží stopky — a běží na SERVERU, ne v prohlížeči. `INSERT OR
  // IGNORE` je tu zásadní: druhé načtení téže otázky čas NEPŘEPÍŠE, takže nejde
  // stopky resetovat opakovaným dotazem těsně před odesláním odpovědi.
  // Vedlejší efekt, který se hodí: kdo si stáhne všech deset otázek naráz, spustí
  // si tím deset stopek zároveň — než dojde na poslední, limit dávno vypršel.
  await env.DB.prepare(
    'INSERT OR IGNORE INTO q_served (game_id, user_id, q_index, served_at) VALUES (?, ?, ?, ?)')
    .bind(params.id, me.id, n, Date.now()).run();

  return json({
    n,
    total: ids.length,
    limit_s: game.limit_s,
    // ID potřebuje klient jen na cestu k ilustraci (img/{id}.jpg). Náskok to
    // nikomu nedává: v payloadu je stejně celý text otázky, takže dohledat ji
    // ve veřejném data/questions/*.json šlo i bez ID. Tohle riziko je vědomě
    // tolerované (docs/online-rezim.md, Anti-cheat) — na rozdíl od odpovědi,
    // která tu být nesmí za žádnou cenu.
    id: q.id,
    // `cc` je tu kvůli glóbu a vlajce v rámu u otázky (2026-09-03). Odvodit se dá
    // i z prefixu `id`, ale to je nepsaná dohoda o tvaru id — radši výslovně.
    // Nic to neprozrazuje: jméno země je v payloadu hned na dalším řádku.
    cc: q.cc,
    country: q.country,
    section: q.section,
    // Štítek obtížnosti u otázky (★–★★★, u dětského fondu „Pro děti"). Offline ho kreslí
    // odjakživa z JSONu; online ho neměl z čeho vzít, protože `difficulty` se do D1
    // do 2026-09-04 vůbec neukládalo. `kids` je odvozené, ne uložené — je to band='deti'.
    // Obtížnost nic neprozrazuje: je to hodnocení otázky, ne nápověda ke správné možnosti.
    difficulty: q.difficulty || 1,
    kids: q.band === 'deti',
    question: q.question,
    options: optionsFor(q, orders[n]),
  });
}
