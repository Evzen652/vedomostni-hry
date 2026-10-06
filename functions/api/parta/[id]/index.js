import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';
import { partaStav, PARTA_POCET } from '../../../_lib/parta.js';

/**
 * GET /api/parta/:id — přehled turnaje a pořadí.
 *
 * Funguje i BEZ přihlášení: na tuhle obrazovku přichází pozvaný z odkazu a musí vidět,
 * kam jde, dřív než napíše jméno. Ven jde jen to, co vidí každý účastník — jména a body.
 * Body se ukazují jen u dohraných; rozehraná hra by prozradila průběžný stav.
 */
export async function onRequestGet({ params, request, env }) {
  const me = await currentUser(request, env, { host: true });
  const p = await env.DB.prepare('SELECT * FROM parties WHERE id = ?').bind(params.id).first();
  if (!p) return fail('turnaj nenalezen', 404);

  const rows = (await env.DB.prepare(
    `SELECT pp.user_id, pp.name, pp.game_id, pp.joined_at,
            gp.score, gp.answered, gp.finished_at
       FROM party_players pp
       LEFT JOIN game_players gp ON gp.game_id = pp.game_id AND gp.user_id = pp.user_id
      WHERE pp.party_id = ?`).bind(params.id).all()).results;

  // Dohraní podle bodů (při shodě kdo dřív), pak rozehraní, pak ti, kdo ještě nezačali.
  const skupina = r => (r.finished_at ? 0 : r.game_id ? 1 : 2);
  rows.sort((a, b) => skupina(a) - skupina(b)
    || (b.score || 0) - (a.score || 0)
    || (a.finished_at || a.joined_at) - (b.finished_at || b.joined_at));

  const moje = me ? rows.find(r => r.user_id === me.id) : null;
  const zakladatel = rows.find(r => r.user_id === p.owner_id);

  return json({
    id: p.id, name: p.name, total: PARTA_POCET, limit_s: p.limit_s,
    starts_at: p.starts_at, ends_at: p.ends_at, now: Date.now(),
    status: partaStav(p),
    owner: zakladatel ? zakladatel.name : null,
    is_owner: !!(me && me.id === p.owner_id),
    players: rows.map(r => ({
      name: r.name,
      done: !!r.finished_at,
      playing: !!r.game_id && !r.finished_at,
      score: r.finished_at ? r.score : null,
      me: !!(me && r.user_id === me.id),
    })),
    me: moje ? { name: moje.name, game_id: moje.game_id, done: !!moje.finished_at }
             : null,
    // Přihlášený hráč s profilem se přidá rovnou pod přezdívkou, host si jméno píše.
    account: me && !me.is_guest ? { nick: me.nick } : null,
  });
}
