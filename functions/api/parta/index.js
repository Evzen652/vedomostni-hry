import { json, fail, limitUctu } from '../../_lib/game.js';
import { currentUser, validateTournamentName } from '../../_lib/auth.js';
import {
  partaId, vyberOtazky, PARTA_LIMIT_S, PARTA_MIN_DELKA_MS, PARTA_MAX_DELKA_MS,
  PARTA_MAX_ODLOZENI_MS, PARTA_MAX_ZALOZENI,
} from '../../_lib/parta.js';

/**
 * POST /api/parta  { name?, starts_at?, ends_at }
 *
 * Založí turnaj pro partu. Zakládat smí jen hráč s profilem (host ne — `currentUser`
 * bez `{ host: true }`). Zakladatel se rovnou zapíše jako první hráč pod přezdívkou.
 * Časy jsou v milisekundách; chybějící nebo prošlý začátek znamená „hned".
 */
export async function onRequestPost({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  let name = 'Turnaj ' + me.nick;
  if (body.name != null && String(body.name).trim() !== '') {
    const c = validateTournamentName(body.name);
    if (c.error) return fail(c.error);
    name = c.name;
  }

  const now = Date.now();
  let starts = Number(body.starts_at);
  if (!Number.isFinite(starts) || starts < now) starts = now;
  if (starts > now + PARTA_MAX_ODLOZENI_MS) return fail('začátek může být nejvýš za 30 dní');
  const ends = Number(body.ends_at);
  if (!Number.isFinite(ends)) return fail('chybí konec turnaje');
  if (ends - starts < PARTA_MIN_DELKA_MS) return fail('turnaj musí trvat aspoň 10 minut');
  if (ends - starts > PARTA_MAX_DELKA_MS) return fail('turnaj může trvat nejvýš 14 dní');

  if (!(await limitUctu(env, me.id, 'party_tries', PARTA_MAX_ZALOZENI, 60 * 60 * 1000))) {
    return fail('turnajů je za poslední hodinu dost, zkus to později', 429);
  }

  const sada = await vyberOtazky(env, me.band);
  if (!sada) return fail('pro tvoje pásmo není dost otázek', 503);

  const id = partaId();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO parties (id, name, owner_id, band, limit_s, question_ids, orders,
                                         starts_at, ends_at, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, name, me.id, me.band, PARTA_LIMIT_S, JSON.stringify(sada.ids),
            JSON.stringify(sada.orders), starts, ends, now),
    env.DB.prepare(`INSERT INTO party_players (party_id, user_id, name, name_lower, joined_at)
                    VALUES (?, ?, ?, ?, ?)`)
      .bind(id, me.id, me.nick, me.nick.toLowerCase(), now),
  ]);

  return json({ id, name, starts_at: starts, ends_at: ends }, 201);
}
