import { json, fail, REG_BANDS } from '../../_lib/game.js';
import { currentUser } from '../../_lib/auth.js';

/**
 * PUT /api/auth/band  { band }
 *
 * Pásmo šlo do 2026-08-31 zvolit jen při registraci a pak už nikdy změnit — kdo se
 * seknul, musel založit nový účet a přijít o rating i historii. Přitom `band` není
 * tvrzení o věku (ověřit ho stejně nejde a nikdy nešlo), ale volba FONDU OTÁZEK:
 * `deti` je fond psaný pro děti, `starsi`/`dospeli` obecný fond. Když jde pásmo
 * změnit, odpadá i motivace lhát hned při registraci.
 *
 * PIN se schválně NEŽÁDÁ, na rozdíl od změny e-mailu. Tam jde o převzetí účtu na
 * cizí adresu; tady se nedá získat nic, co ten, kdo už drží odemčené zařízení
 * s platným tokenem, nemá.
 *
 * Rating se NEPŘENÁŠÍ a je to správně: `ratings` má PRIMARY KEY (user_id, band),
 * protože pásma losují z různých fondů a čísla napříč nimi nejsou porovnatelná
 * (schema.sql). V novém pásmu se tedy začíná od 1500 a při návratu zpátky se najde
 * to původní.
 *
 * Do dětského pásma se od 2026-09-10 přejít NEDÁ — Světová liga je od 13 let a dětské
 * pásmo zůstává jen obtížností offline hry (`REG_BANDS` v game.js). Starší dětský
 * účet, pokud nějaký existuje, z něj odejít smí; generované přezdívky, které se při
 * přechodu dovnitř dělaly, tím odpadly.
 */
export async function onRequestPut({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nejsi přihlášený', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const band = body.band;
  // Rovnost napřed: starší dětský účet, který si „uloží“ vlastní pásmo, nemá dostat
  // chybu, jen odpověď, že se nic nezměnilo.
  if (band === me.band) return json({ band, nick: me.nick, changed: false });
  if (band === 'deti') return fail('do dětského pásma se přejít nedá — Světová liga je od 13 let');
  if (!REG_BANDS.includes(band)) return fail('neznámé pásmo');

  const nick = me.nick;

  await env.DB.batch([
    env.DB.prepare('UPDATE users SET band = ?, nick = ?, nick_lower = ? WHERE id = ?')
      .bind(band, nick, nick.toLowerCase(), me.id),
    // Řádek ratingu pro nové pásmo musí existovat hned. Jinak by ho založil až
    // settle.js po první dohrané hře a do té doby by účet neměl v novém pásmu čím
    // se párovat (match.js si rating pro frontu čte z tohohle řádku).
    env.DB.prepare('INSERT OR IGNORE INTO ratings (user_id, band) VALUES (?, ?)')
      .bind(me.id, band),
    // Čekání ve frontě patří ke starému pásmu. Kdyby tam řádek zůstal, spároval by
    // se hráč po změně ještě jednou v pásmu, které už nemá.
    env.DB.prepare('DELETE FROM queue WHERE user_id = ? AND game_id IS NULL').bind(me.id),
  ]);

  return json({ band, nick, changed: true });
}
