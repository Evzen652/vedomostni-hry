import { json, fail, limitUctu } from '../_lib/game.js';
import { currentUser } from '../_lib/auth.js';

/**
 * GET    /api/friends            — seznam přátel
 * POST   /api/friends  { code }  — přidej podle kódu
 * DELETE /api/friends  { id }    — odeber (oba směry)
 *
 * Přátelství jde navázat JEN přes kód, ne vyhledáním přezdívky. Kód se předává
 * mimo appku, takže cizí člověk nemůže oslovit dítě jen proto, že ho zahlédl
 * v žebříčku (docs/online-rezim.md, sekce 5).
 *
 * Dvě věci, které tu do 2026-09-01 chyběly, a obě podrývaly právě tuhle ochranu:
 *   1. Hádání kódu nemělo ŽÁDNÝ limit. Prostor 31^6 chrání konkrétní účet, ne
 *      populaci — útočníkovi stačí jakékoli dítě, takže očekávaný počet pokusů je
 *      31^6 / počet účtů. Nově klouzavé okno MAX_TRIES za HODINU (viz níž).
 *   2. Přítele NEŠLO ODEBRAT. Přidání je přitom oboustranné a bez souhlasu druhé
 *      strany, takže kdo se jednou dostal do seznamu, zůstal tam napořád.
 */
const MAX_TRIES = 10;
const WINDOW_MS = 60 * 60 * 1000;
export async function onRequestGet({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const rows = (await env.DB.prepare(
    `SELECT u.id, u.nick, u.avatar, u.band, f.created_at
       FROM friends f JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = ? ORDER BY u.nick`).bind(me.id).all()).results;

  const mine = await env.DB.prepare('SELECT friend_code FROM users WHERE id = ?')
    .bind(me.id).first();

  return json({ my_code: mine?.friend_code || null, friends: rows });
}

export async function onRequestPost({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const code = String(body.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) return fail('kód má šest znaků');

  const now = Date.now();   // čas vzniku přátelství (zapisuje se níž)

  // Klouzavé okno, ne zámek — a od 2026-09-03 ATOMICKY (viz limitUctu v _lib/game.js).
  // Dřív se čtení a zápis počítadla dělaly zvlášť, takže souběžné požadavky přečetly
  // stejnou hodnotu a limit obešly. Deset pokusů za hodinu je pro překlep víc než dost
  // a brute force tím padá o čtyři řády.
  //
  // POŘADÍ JE DŮLEŽITÉ A NEPŘEHAZUJ HO: počítadlo se navýší JEŠTĚ PŘED vyhledáním kódu,
  // takže zámek platí i pro správný kód. Kdo si deseti tipy zamkne hodinu a v jedenáctém
  // se konečně trefí, ho použít nemůže — což je u ochrany dětí to podstatné. (Zkusil
  // jsem 2026-09-03 vyhledávat první a počítat až neúspěch; test „ani platný kód po
  // limitu neprojde" to okamžitě odhalil.)
  //
  // Aby přitom pořád platilo „kdo kód dostal, na limit nikdy nenarazí", se pokus při
  // ÚSPĚCHU zase odečte. Refund je jen na úspěšné cestě, tedy vzácný.
  if (!(await limitUctu(env, me.id, 'friend_tries', MAX_TRIES, WINDOW_MS)))
    return fail('moc pokusů za sebou, zkus to za hodinu', 429);

  const other = await env.DB
    .prepare('SELECT id, nick, avatar, band, is_bot FROM users WHERE friend_code = ?')
    .bind(code).first();

  if (!other || other.is_bot) return fail('takový kód nikomu nepatří', 404);

  // Vlastní kód je překlep, ne hádání — proto se taky vrací.
  const vratPokus = () => env.DB
    .prepare('UPDATE users SET friend_tries = friend_tries - 1 WHERE id = ? AND friend_tries > 0')
    .bind(me.id).run();

  if (other.id === me.id) { await vratPokus(); return fail('to je tvůj vlastní kód'); }
  await vratPokus();

  await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)')
      .bind(me.id, other.id, now),
    env.DB.prepare('INSERT OR IGNORE INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)')
      .bind(other.id, me.id, now),
  ]);

  return json({ added: { id: other.id, nick: other.nick, avatar: other.avatar, band: other.band } }, 201);
}

/**
 * DELETE /api/friends  { id }
 *
 * Maže OBA směry. Přidání je oboustranné a bez souhlasu druhé strany, takže
 * jednostranné odebrání by nechalo útočníka v seznamu oběti — a ta by o tom
 * ani nevěděla. Kdo chce zpátky, musí si znovu říct o kód.
 *
 * Odpověď je stejná i pro cizí/neexistující id: nemá smysl přes tenhle endpoint
 * prozrazovat, kdo s kým kamarádí.
 */
export async function onRequestDelete({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const id = String(body.id || '').trim();
  if (!id) return fail('chybí id přítele');

  await env.DB.batch([
    env.DB.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?').bind(me.id, id),
    env.DB.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?').bind(id, me.id),
  ]);

  return json({ removed: id });
}
