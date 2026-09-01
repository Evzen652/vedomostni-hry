import { BANDS, json, fail } from '../_lib/game.js';
import { currentUser } from '../_lib/auth.js';

/**
 * GET /api/leaderboard?band=dospeli[&daily=1]
 *
 * Bez parametru daily vrací žebříček ratingu pásma. Do žebříčku se počítají jen
 * hráči s aspoň pěti hodnocenými hrami a usazeným RD — dokud je rating nejistý,
 * nepatří na přední příčky (docs/online-rezim.md, sekce 3).
 */
export async function onRequestGet({ request, env }) {
  // Žebříček byl do 2026-09-01 JEDINÝ endpoint mimo /auth/* bez přihlášení. U pásem
  // `starsi`/`dospeli` by to samo o sobě neškodilo, ale ve spojení s dírou níž to
  // znamenalo, že přezdívky a skóre DĚTÍ šly stáhnout úplně bez účtu. Přihlášení
  // nic nestojí: klient sem chodí jen z lobby, kam se bez tokenu nedostane.
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const url = new URL(request.url);
  const band = url.searchParams.get('band') || 'dospeli';
  if (!BANDS.includes(band)) return fail('neznámé pásmo');

  // Dětské pásmo veřejný žebříček NEMÁ — a kontrola musí být PŘED větví `daily`.
  // Do 2026-09-01 stála až za ní, takže `?daily=1&band=deti` ochranu prostě obešel
  // a vydal přezdívku, skóre i přesný čas dohrání, tedy denní rytmus konkrétního
  // dítěte. Rozhodnutí z 2026-08-31 tuhle druhou cestu přehlédlo, protože v komentáři
  // dokonce stálo „dětem zůstává denní pětka" — zůstává, ale bez veřejného pořadí.
  //
  // Pásmo je nutně jen čestné prohlášení (ověřit věk nejde), takže na předních
  // příčkách může sedět kdokoli; u dětí to nestojí za vystavování jmen.
  if (band === 'deti') {
    return json({ kind: url.searchParams.get('daily') ? 'daily' : 'rating', band, closed: true, rows: [] });
  }

  if (url.searchParams.get('daily')) {
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const rows = (await env.DB.prepare(
      `SELECT u.nick, u.avatar, gp.score, gp.finished_at
         FROM games g JOIN game_players gp ON gp.game_id = g.id
         JOIN users u ON u.id = gp.user_id
        WHERE g.mode = 'daily' AND g.daily_date = ? AND g.band = ? AND gp.finished_at IS NOT NULL
        ORDER BY gp.score DESC, gp.finished_at ASC LIMIT 50`).bind(date, band).all()).results;
    return json({ kind: 'daily', date, band, rows });
  }

  const rows = (await env.DB.prepare(
    `SELECT u.nick, u.avatar, u.is_bot, r.rating, r.rd, r.games, r.wins, r.draws, r.losses
       FROM ratings r JOIN users u ON u.id = r.user_id
      WHERE r.band = ? AND r.games >= 5 AND r.rd < 150 AND u.is_bot = 0
      ORDER BY r.rating DESC LIMIT 50`).bind(band).all()).results;

  return json({
    kind: 'rating', band,
    rows: rows.map((r, i) => ({
      rank: i + 1, nick: r.nick, avatar: r.avatar,
      rating: Math.round(r.rating), games: r.games,
      wins: r.wins, draws: r.draws, losses: r.losses,
    })),
  });
}
