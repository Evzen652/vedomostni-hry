import { json, fail, newId, limitIp, REG_WINDOW_MS } from '../../../_lib/game.js';
import { currentUser, hashPin, signToken, sessionSecret } from '../../../_lib/auth.js';
import { partaStav, validatePartaName, PARTA_MAX_HRACU, PARTA_MAX_HOSTU } from '../../../_lib/parta.js';

/**
 * POST /api/parta/:id/join  { name?, age13? }
 *
 * Hráč s profilem se přidá pod svou přezdívkou a nic dalšího neposílá.
 * Kdo profil nemá, napíše jméno a potvrdí 13+ — vznikne HOST: řádek v `users`
 * s `is_guest = 1`, technickou přezdívkou `host:…` a náhodným PINem, takže se na něj
 * nedá přihlásit ani ho najít. Vrátí se mu token, který platí jen pro turnaj pro partu
 * (`currentUser` bez `{ host: true }` ho jinde odmítne).
 */
export async function onRequestPost({ params, request, env }) {
  const p = await env.DB.prepare('SELECT * FROM parties WHERE id = ?').bind(params.id).first();
  if (!p) return fail('turnaj nenalezen', 404);
  if (partaStav(p) === 'hotovo') return fail('turnaj už skončil', 410);

  let body;
  try { body = await request.json(); } catch (e) { body = {}; }

  const me = await currentUser(request, env, { host: true });
  if (me) {
    const uz = await env.DB.prepare('SELECT name FROM party_players WHERE party_id = ? AND user_id = ?')
      .bind(p.id, me.id).first();
    if (uz) return json({ name: uz.name });
  }

  const { pocet } = await env.DB.prepare('SELECT COUNT(*) AS pocet FROM party_players WHERE party_id = ?')
    .bind(p.id).first();
  if (pocet >= PARTA_MAX_HRACU) return fail('turnaj je plný', 409);

  const now = Date.now();
  // Hráč s profilem: přezdívka je jméno. (Host z JINÉHO turnaje se tu bere jako nový host.)
  if (me && !me.is_guest) {
    try {
      await env.DB.prepare(`INSERT INTO party_players (party_id, user_id, name, name_lower, joined_at)
                            VALUES (?, ?, ?, ?, ?)`)
        .bind(p.id, me.id, me.nick, me.nick.toLowerCase(), now).run();
    } catch (e) {
      return fail('tohle jméno už v turnaji někdo má', 409);
    }
    return json({ name: me.nick }, 201);
  }

  if (body.age13 !== true) return fail('potvrď, že ti je aspoň 13 let a souhlasíš s podmínkami použití');
  const c = validatePartaName(body.name);
  if (c.error) return fail(c.error);
  const name = c.name;
  const clash = await env.DB.prepare('SELECT 1 FROM party_players WHERE party_id = ? AND name_lower = ?')
    .bind(p.id, name.toLowerCase()).first();
  if (clash) return fail('tohle jméno už v turnaji někdo má', 409);

  // Limit na hosty z jedné IP. Klíč má předponu, ať se nesčítá s registracemi.
  if (!env.ALLOW_DEV_SECRET) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!(await limitIp(env, 'parta:' + ip, PARTA_MAX_HOSTU, REG_WINDOW_MS))) {
      return fail('z tohohle připojení se přidalo moc hráčů, zkus to za hodinu', 429);
    }
  }

  const id = 'u' + newId().slice(1);
  const nahodnyPin = String(crypto.getRandomValues(new Uint32Array(1))[0]).padStart(8, '0').slice(0, 8);
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO users (id, nick, nick_lower, pin_hash, band, created_at, is_guest)
                      VALUES (?, ?, ?, ?, ?, ?, 1)`)
        .bind(id, 'host:' + id, 'host:' + id, await hashPin(nahodnyPin), p.band, now),
      env.DB.prepare(`INSERT INTO party_players (party_id, user_id, name, name_lower, joined_at)
                      VALUES (?, ?, ?, ?, ?)`)
        .bind(p.id, id, name, name.toLowerCase(), now),
    ]);
  } catch (e) {
    // Souběh se stejným jménem — UNIQUE (party_id, name_lower). Batch je transakce,
    // takže hostovský účet nevznikl.
    return fail('tohle jméno už v turnaji někdo má', 409);
  }

  // Token platí do konce turnaje + rezerva na prohlížení výsledků (úklid je po 30 dnech).
  const dni = Math.max(1, Math.ceil((p.ends_at - now) / 86400000) + 30);
  const token = await signToken(id, sessionSecret(env), dni);
  return json({ name, token }, 201);
}
