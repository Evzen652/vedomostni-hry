import { BANDS, TIME_CONTROLS, TC_NAMES, json, fail, newId, limitUctu } from '../../_lib/game.js';
import { currentUser } from '../../_lib/auth.js';
import { MIN_DURATION_MIN, MAX_DURATION_MIN, MAX_START_DELAY_MIN, tournamentStatus, tournamentEndsAt }
  from '../../_lib/tournament.js';

const DEFAULT_NAME = { blesk: 'Bleskový turnaj', klasika: 'Klasický turnaj' };

// Klouzavé okno na ZALOŽENÍ turnaje, per uživatel (2026-09-02) — turnaj je vzácnější
// akce než hra (většina hráčů se jen přidává), 5 za hodinu je proto přísnější
// než u her a pořád nad tím, co udělá reálný zakladatel.
const MAX_TOURNEYS = 5;
const WINDOW_MS = 60 * 60 * 1000;

/**
 * GET /api/tournament?band= — turnaje pásma, co ještě neskončily dávno.
 *
 * Skončené turnaje zůstávají vidět ještě hodinu, ať je po konci vidět
 * konečné pořadí, ne aby zmizely hned se startovní hodinou dalšího kola.
 */
export async function onRequestGet({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  // Pásmo se bere VÝHRADNĚ z účtu, stejně jako v daily/index.js a game/index.js
  // (narovnalo se to tam 2026-08-31, na turnaje se zapomnělo). Přes `?band=` šlo
  // vypsat běžící DĚTSKÉ turnaje a přes detail pak přezdívky a skóre jejich účastníků.
  const band = me.band;
  if (!BANDS.includes(band)) return fail('neznámé pásmo');

  const rows = (await env.DB.prepare(
    `SELECT * FROM tournaments WHERE band = ? AND starts_at + duration_min * 60000 > ?
      ORDER BY starts_at ASC LIMIT 20`)
    .bind(band, Date.now() - 3600000).all()).results;

  return json({
    band,
    tournaments: rows.map(t => ({
      id: t.id, name: t.name, band: t.band, time_control: t.time_control,
      starts_at: t.starts_at, ends_at: tournamentEndsAt(t), status: tournamentStatus(t),
    })),
  });
}

/**
 * POST /api/tournament { time_control?, duration_min?, starts_in_min?, name? }
 *
 * Zakladatel se rovnou stává prvním účastníkem — jinak by musel hned potom
 * volat join zvlášť pro turnaj, který sám právě založil.
 */
export async function onRequestPost({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const pod = await limitUctu(env, me.id, 'tourney_tries', MAX_TOURNEYS, WINDOW_MS);
  if (!pod) return fail('příliš mnoho založených turnajů, zkus to za chvíli', 429);

  let body = {};
  try { body = await request.json(); } catch (e) { /* výchozí */ }

  const tcName = body.time_control || 'blesk';
  if (!TC_NAMES.includes(tcName)) return fail('neznámá časová kontrola: ' + tcName);

  const duration = Number.isInteger(body.duration_min) ? body.duration_min : 15;
  if (duration < MIN_DURATION_MIN || duration > MAX_DURATION_MIN) {
    return fail('délka turnaje musí být ' + MIN_DURATION_MIN + '–' + MAX_DURATION_MIN + ' minut');
  }
  const delay = Number.isInteger(body.starts_in_min) ? body.starts_in_min : 0;
  if (delay < 0 || delay > MAX_START_DELAY_MIN) return fail('neplatný začátek');

  const name = String(body.name || '').trim().slice(0, 40) || DEFAULT_NAME[tcName];
  const id = newId();
  const now = Date.now();
  const startsAt = now + delay * 60000;

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO tournaments (id, band, time_control, name, starts_at, duration_min, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, me.band, tcName, name, startsAt, duration, me.id, now),
    env.DB.prepare(
      'INSERT INTO tournament_players (tournament_id, user_id, joined_at) VALUES (?, ?, ?)')
      .bind(id, me.id, now),
  ]);

  const t = { starts_at: startsAt, duration_min: duration };
  return json({
    id, name, band: me.band, time_control: tcName,
    starts_at: startsAt, ends_at: tournamentEndsAt(t), status: tournamentStatus(t),
  }, 201);
}
