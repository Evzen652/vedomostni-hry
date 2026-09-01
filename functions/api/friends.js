import { json, fail } from '../_lib/game.js';
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

  const now = Date.now();

  // Klouzavé okno, ne zámek. Zámek jako u loginu (login.js) se při zamčení resetuje
  // na nulu, takže útočníka nezpomalí víc než prvních deset minut; tady se počítadlo
  // drží celou hodinu. Deset pokusů za hodinu je pro překlep víc než dost a brute
  // force tím padá o čtyři řády.
  const stav = await env.DB.prepare('SELECT friend_tries, friend_tries_at FROM users WHERE id = ?')
    .bind(me.id).first();
  const okno = now - (stav?.friend_tries_at || 0) < WINDOW_MS;
  const pokusu = okno ? (stav?.friend_tries || 0) : 0;
  if (pokusu >= MAX_TRIES) {
    return fail('moc pokusů za sebou, zkus to za hodinu', 429);
  }

  const other = await env.DB
    .prepare('SELECT id, nick, avatar, band, is_bot FROM users WHERE friend_code = ?')
    .bind(code).first();

  // Počítá se JEN neúspěch — kdo kód opravdu dostal, na limit nikdy nenarazí.
  // Vlastní kód se nepočítá taky: je to překlep, ne hádání.
  if (!other || other.is_bot) {
    await env.DB.prepare('UPDATE users SET friend_tries = ?, friend_tries_at = ? WHERE id = ?')
      .bind(pokusu + 1, okno ? (stav?.friend_tries_at || now) : now, me.id).run();
    return fail('takový kód nikomu nepatří', 404);
  }
  if (other.id === me.id) return fail('to je tvůj vlastní kód');

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
