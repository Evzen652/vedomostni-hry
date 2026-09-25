import { TIME_CONTROLS, shuffledOrder, json, fail, newId, limitUctu } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { pickQuestions, markSeen } from '../../../_lib/pool.js';

/**
 * POST /api/challenge/:id/accept — přijmi výzvu. TEPRVE TADY VZNIKÁ HRA.
 *
 * Tohle je jediné místo, kde z výzvy vzniká hra, a obě strany k ní daly souhlas:
 * jeden vyzval, druhý přijal. Proto je hra hodnocená — stejně jako souboj na odkaz
 * a odveta mezi lidmi. Rozdíl proti odvetě (otevřený nález z auditu) je v tom, že
 * tam se soupeř do hry vkládá BEZ jeho vědomí; tady až poté, co sám klikl.
 */
export async function onRequestPost({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  // Zakládání hry má limit na VŠECH cestách, které hru zakládají (CLAUDE.md 2026-09-03:
  // do té doby ho měla jen jedna, a turnajový bot ho obcházel). Tohle je další taková cesta.
  const MAX_HER = 30, OKNO_MS = 60 * 60 * 1000;
  if (!(await limitUctu(env, me.id, 'game_tries', MAX_HER, OKNO_MS)))
    return fail('příliš mnoho založených her, zkus to za chvíli', 429);

  const vyzva = await env.DB.prepare('SELECT * FROM challenges WHERE id = ?')
    .bind(params.id).first();
  // Přijmout smí jen vyzvaný. Kdo o výzvě nemá vědět, dostane totéž co u neexistující.
  if (!vyzva || vyzva.to_user !== me.id) return fail('výzva nenalezena', 404);

  // DELETE JAKO ZÁMEK. Dvojklik na „Přijmout" (nebo retry po výpadku sítě) by bez tohohle
  // založil DVĚ hry. Kdo výzvu smaže, ten ji přijal — druhý požadavek už nic nesmaže
  // a skončí. Stejný vzor jako UPDATE-zámek v settle.js. Souběh se přes lokální wrangler
  // otestovat nedá (požadavky se serializují, CLAUDE.md 2026-09-01), takže záruku dává
  // tvar zápisu, ne test.
  const zamek = await env.DB.prepare('DELETE FROM challenges WHERE id = ? AND to_user = ?')
    .bind(vyzva.id, me.id).run();
  if (!(zamek.meta && zamek.meta.changes)) return fail('výzva už byla vyřízená', 409);

  const vyzyvatel = await env.DB.prepare('SELECT id, deleted_at FROM users WHERE id = ?')
    .bind(vyzva.from_user).first();
  // Vyzyvatel mezitím mohl profil smazat — s náhrobkem se hrát nedá.
  if (!vyzyvatel || vyzyvatel.deleted_at) return fail('hráč, který tě vyzval, už svůj profil nemá', 410);

  const tc = TIME_CONTROLS.blesk;
  const ids = await pickQuestions(env, vyzva.band, tc.count, [vyzva.from_user, me.id]);
  if (ids.length < tc.count) {
    // Zámek výzvu smazal dřív, než se ukázalo, že na hru nejsou otázky. Vrátit ji, jinak
    // by výzva tiše zmizela a vyzyvatel by se nikdy nedozvěděl, proč. Stává se to jen
    // dvojici, která spolu odehrála skoro celý fond, tedy vzácně.
    await env.DB.prepare(
      'INSERT OR IGNORE INTO challenges (id, from_user, to_user, band, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(vyzva.id, vyzva.from_user, vyzva.to_user, vyzva.band, vyzva.created_at).run();
    return fail('došly otázky, které jste ještě ani jeden neviděli', 503);
  }

  const id = newId();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO games (id, mode, band, limit_s, question_ids, orders, created_at, rated)
                    VALUES (?, 'odkaz', ?, ?, ?, ?, ?, 1)`)
      .bind(id, vyzva.band, tc.limit_s, JSON.stringify(ids),
            JSON.stringify(ids.map(() => shuffledOrder())), Date.now()),
    // Vyzyvatel je slot 0, přijímající slot 1 — stejné pořadí jako u odvety.
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 0)')
      .bind(id, vyzva.from_user),
    env.DB.prepare('INSERT INTO game_players (game_id, user_id, slot) VALUES (?, ?, 1)')
      .bind(id, me.id),
  ]);

  // Odepisuje se jen tomu, kdo si hru právě otevírá. Vyzyvateli se otázka započítá,
  // až si ji sám vyžádá (q/[n].js) — stejná pojistka jako u odvety od 2026-09-01.
  await markSeen(env, me.id, ids);

  return json({ game_id: id }, 201);
}
