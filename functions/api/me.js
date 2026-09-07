import { json, fail } from '../_lib/game.js';
import { currentUser, verifyPin, hashPin } from '../_lib/auth.js';
import { expireStaleGames } from '../_lib/settle.js';

/** GET /api/me — profil, ratingy za pásma, posledních 20 her. */
export async function onRequestGet({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  // Úklid nedohraných her se veze tady, protože Pages Functions neumí cron a tenhle
  // endpoint klient volá při každém vstupu do lobby. Bez toho by hra, kterou soupeř
  // opustil, visela v `open` navždy — a rovnou pod tím se vypisuje historie, kde by
  // ji hráč viděl jako věčně nedohranou.
  await expireStaleGames(env);

  const ratings = await env.DB
    .prepare('SELECT band, rating, rd, games, wins, draws, losses FROM ratings WHERE user_id = ?')
    .bind(me.id).all();

  const history = await env.DB.prepare(
    `SELECT g.id, g.mode, g.band, g.status, g.created_at, gp.score, gp.answered
       FROM game_players gp JOIN games g ON g.id = gp.game_id
      WHERE gp.user_id = ? ORDER BY g.created_at DESC LIMIT 20`).bind(me.id).all();

  const seen = await env.DB
    .prepare('SELECT COUNT(*) n FROM seen_questions WHERE user_id = ?').bind(me.id).first();

  return json({
    id: me.id, nick: me.nick, avatar: me.avatar, band: me.band,
    email: maskEmail(me.email),
    ratings: ratings.results.map(r => ({ ...r, rating: Math.round(r.rating) })),
    seen_questions: seen.n,
    history: history.results,
  });
}

/**
 * DELETE /api/me  { pin } — smazání profilu.
 *
 * ODEHRANÉ HRY ZŮSTÁVAJÍ, jen se odpojí od identity (rozhodnutí hráče 2026-09-07).
 * Smazat řádek z `users` nejde: `game_players` na něj odkazuje, takže by se tím
 * cizím hráčům rozpadla jejich vlastní historie a turnajové výsledky. Účet se proto
 * přepíše na náhrobek — zůstane z něj anonymní záznam, ze kterého se nedá zjistit,
 * kdo to byl.
 *
 * Co odchází s ním: e-mail, kód pro přátele, samotná přátelství, fronta, odkazy na
 * obnovu PINu, přehled viděných otázek a RATING (aby účet zmizel i ze žebříčků).
 * Co zůstává: hry, jejich skóre a turnajová umístění — pod jménem „Smazaný hráč".
 *
 * PIN se vyžaduje, i když je hráč přihlášený — stejně jako u změny e-mailu. Bez toho
 * by stačilo zmocnit se odemčeného zařízení a smazat cizí profil.
 */
export async function onRequestDelete({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body = {};
  try { body = await request.json(); } catch (e) { /* PIN zkontrolujeme níž */ }

  const ucet = await env.DB.prepare('SELECT pin_hash FROM users WHERE id = ?').bind(me.id).first();
  if (!ucet || !(await verifyPin(String(body.pin || ''), ucet.pin_hash))) {
    return fail('PIN nesedí', 401);
  }

  const ted = Date.now();
  // POZOR: UNIQUE je i na `nick`, nejen na `nick_lower`. Náhrobek proto NEMŮŽE mít
  // u všech stejné jméno — druhý hráč, který by profil smazal, by dostal 500.
  // (Naletěl jsem na to při testu: první smazání prošlo, druhé spadlo.)
  // Přívěsek je NÁHODNÝ, ne odvozený z id — jinak by z něj šlo účet zpětně poznat.
  // Nový PIN je taky náhodný, takže se na účet nedá přihlásit; `token_epoch` navíc
  // okamžitě ruší všechna vydaná přihlášení.
  const nahodne = n => [...crypto.getRandomValues(new Uint8Array(n))]
    .map(b => b.toString(36).padStart(2, '0')).join('');
  const nahodnyPin = nahodne(16);
  const znacka = nahodne(2).slice(0, 4);

  const vysledky = await env.DB.batch([
    env.DB.prepare(
      `UPDATE users SET nick = ?, nick_lower = ?, email = NULL,
              friend_code = NULL, avatar = '1', pin_hash = ?, deleted_at = ?,
              token_epoch = token_epoch + 1, login_fails = 0, locked_until = 0
        WHERE id = ?`)
      .bind('Smazaný hráč ' + znacka, 'deleted:' + me.id, await hashPin(nahodnyPin), ted, me.id),
    env.DB.prepare('DELETE FROM ratings WHERE user_id = ?').bind(me.id),
    env.DB.prepare('DELETE FROM friends WHERE user_id = ? OR friend_id = ?').bind(me.id, me.id),
    env.DB.prepare('DELETE FROM queue WHERE user_id = ?').bind(me.id),
    env.DB.prepare('DELETE FROM pin_resets WHERE user_id = ?').bind(me.id),
    env.DB.prepare('DELETE FROM seen_questions WHERE user_id = ?').bind(me.id),
  ]);

  // Co se doopravdy smazalo, se vrací SCHVÁLNĚ. Není to ozdoba: bez toho se ta část
  // mazání nedá otestovat zvenčí — kontrola „zmizel ze žebříčku" totiž projde i tehdy,
  // když se rating vůbec nesmaže (do žebříčku se počítá až od páté hodnocené hry, takže
  // čerstvý účet v něm není tak jako tak). Ověřeno mutací: vypnutí mazání ratingů
  // testem propadlo, dokud se nekontrolovalo tohle číslo.
  const zmen = i => (vysledky[i] && vysledky[i].meta && vysledky[i].meta.changes) || 0;
  return json({
    smazano: true,
    odstraneno: {
      ratingy: zmen(1), pratele: zmen(2), fronta: zmen(3),
      obnovy: zmen(4), videne_otazky: zmen(5),
    },
  });
}

/** ev***@gmail.com — hráči stačí poznat, kterou adresu tam má, ne ji celou číst. */
function maskEmail(email) {
  if (!email) return null;
  const [jmeno, domena] = String(email).split('@');
  const viditelne = jmeno.slice(0, 2);
  return viditelne + '*'.repeat(Math.max(1, jmeno.length - 2)) + '@' + domena;
}
