import { json, fail, newId, limitUctu, VYZVA_PLATI_MS } from '../../_lib/game.js';
import { currentUser } from '../../_lib/auth.js';

/**
 * Výzvy podle přezdívky (2026-09-26) — náhrada za přátele s kódem.
 *
 *   GET  /api/challenge           — příchozí a odchozí výzvy + poslední soupeři
 *   POST /api/challenge { nick }  — vyzvi hráče
 *
 * PROČ TO NAHRADILO PŘÁTELE: přidat přítele nedávalo nic navíc. Jediné tlačítko u něj
 * („Vyzvat") založilo souboj na odkaz a odkaz se stejně musel poslat ručně — tedy
 * přesně totéž, co umí dlaždice „Souboj na odkaz" bez jakéhokoli přítele. Kód místo
 * přezdívky vznikl jako ochrana dětí před vyhledáním cizím člověkem, jenže děti od
 * 2026-09-10 profil nemají (appka je 13+), takže ten důvod odpadl.
 *
 * VÝZVA NENÍ HRA. Hra vzniká teprve přijetím (challenge/[id]/accept.js). Kdyby výzva
 * byla řádkem v `games`, po 48 h by ji `expireStaleGames` vyrovnal a vyzvanému by
 * naskočila hodnocená prohra za partii, kterou nikdy neviděl — přesně otevřený nález
 * z auditu u odvety. Vlastní tabulka tuhle třídu chyby vylučuje konstrukcí.
 */

// Prošlá výzva se MUSÍ mazat, ne jen filtrovat: tabulka má UNIQUE(from_user, to_user),
// takže by jinak blokovala novou výzvu téže dvojici. Lhůta je v _lib/game.js.
// Kolik výzev za hodinu. Přezdívka je veřejná (žebříček), takže cíl najde každý —
// bez stropu by šlo kohokoli zasypat.
const MAX_VYZEV = 20;
const OKNO_MS = 60 * 60 * 1000;

async function uklidProsle(env) {
  await env.DB.prepare('DELETE FROM challenges WHERE created_at < ?')
    .bind(Date.now() - VYZVA_PLATI_MS).run();
}

export async function onRequestGet({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);
  await uklidProsle(env);

  const prichozi = (await env.DB.prepare(
    `SELECT c.id, c.created_at, u.nick
       FROM challenges c JOIN users u ON u.id = c.from_user
      WHERE c.to_user = ? ORDER BY c.created_at DESC`).bind(me.id).all()).results;

  const odchozi = (await env.DB.prepare(
    `SELECT c.id, c.created_at, u.nick
       FROM challenges c JOIN users u ON u.id = c.to_user
      WHERE c.from_user = ? ORDER BY c.created_at DESC`).bind(me.id).all()).results;

  // Poslední soupeři z odehraných her. BOTI JSOU VYŘAZENÍ ZÁMĚRNĚ: náhradní soupeř se
  // v UI kreslí lidským jménem (souperJmeno v online.js), ale účet je bot, a ten výzvu
  // nikdy nepřijme. Kdyby tu byl, hráč by vyzval „Marka" a čekal by navždy.
  // Smazané profily taky pryč — jsou z nich náhrobky „Smazaný hráč", ne lidé.
  const nedavni = (await env.DB.prepare(
    `SELECT u.nick, MAX(g.created_at) AS naposled
       FROM game_players ja
       JOIN game_players druhy ON druhy.game_id = ja.game_id AND druhy.user_id != ja.user_id
       JOIN users u ON u.id = druhy.user_id
       JOIN games g ON g.id = ja.game_id
      WHERE ja.user_id = ? AND u.is_bot = 0 AND u.deleted_at = 0
      GROUP BY u.id ORDER BY naposled DESC LIMIT 8`).bind(me.id).all()).results;

  // Hry na odkaz, ve kterých hráči ještě zbývá jeho půlka. Bez tohohle se vyzyvatel
  // o PŘIJATÉ výzvě nikdy nedozvěděl — lobby do 2026-09-26 neukazovalo hry čekající na
  // hráče vůbec, takže svou půlku neodehrál. Týkalo se to i obyčejného souboje na odkaz.
  // `souper_bot` jde s sebou, aby klient bota zamaskoval lidským jménem (souperJmeno)
  // stejně jako všude jinde — syrová přezdívka bota by ho prozradila.
  const naTahu = (await env.DB.prepare(
    `SELECT g.id, ja.answered, json_array_length(g.question_ids) AS total,
            u.nick AS souper, u.is_bot AS souper_bot
       FROM game_players ja
       JOIN games g ON g.id = ja.game_id
       JOIN game_players druhy ON druhy.game_id = g.id AND druhy.user_id != ja.user_id
       JOIN users u ON u.id = druhy.user_id
      WHERE ja.user_id = ? AND g.status = 'open' AND g.mode = 'odkaz'
        AND ja.answered < json_array_length(g.question_ids)
      ORDER BY g.created_at DESC LIMIT 10`).bind(me.id).all()).results;

  return json({ prichozi, odchozi, nedavni, na_tahu: naTahu });
}

export async function onRequestPost({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const nick = String(body.nick || '').trim();
  if (!nick) return fail('napiš přezdívku hráče');

  if (!(await limitUctu(env, me.id, 'challenge_tries', MAX_VYZEV, OKNO_MS)))
    return fail('moc výzev za sebou, zkus to za hodinu', 429);

  const cil = await env.DB
    .prepare('SELECT id, nick, is_bot, deleted_at FROM users WHERE nick_lower = ?')
    .bind(nick.toLowerCase()).first();

  // Bot i smazaný profil vrací TOTÉŽ co neexistující hráč. Jinak by šlo zkoušením
  // přezdívek zjistit, které účty jsou boti — a tím prozradit, že „živý" soupeř
  // v rychlé hře bývá náhradník.
  if (!cil || cil.is_bot || cil.deleted_at) return fail('takového hráče nenacházíme', 404);
  if (cil.id === me.id) return fail('sám sebe vyzvat nejde');

  await uklidProsle(env);
  try {
    await env.DB.prepare(
      'INSERT INTO challenges (id, from_user, to_user, band, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(newId(), me.id, cil.id, me.band, Date.now()).run();
  } catch (e) {
    // UNIQUE(from_user, to_user) — tahle dvojice už čekající výzvu má.
    return fail('tohohle hráče už vyzvaného máš, počkej na odpověď', 409);
  }

  return json({ vyzvan: cil.nick }, 201);
}
