import { json, fail, BANDS } from '../../_lib/game.js';
import { currentUser, generateNick } from '../../_lib/auth.js';

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
 * Přechod DO dětského pásma vygeneruje přezdívku znovu. Dětský prostor je schválně
 * bez volného textu (register.js, docs/online-rezim.md sekce 5) — bez tohohle kroku
 * by stačilo přijít s libovolnou přezdívkou z jiného pásma a ta ochrana by nebyla
 * k ničemu. Opačným směrem se generovaná přezdívka nechává: je neškodná.
 */
export async function onRequestPut({ request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nejsi přihlášený', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const band = body.band;
  if (!BANDS.includes(band)) return fail('neznámé pásmo');
  if (band === me.band) return json({ band, nick: me.nick, changed: false });

  let nick = me.nick;
  if (band === 'deti') {
    nick = generateNick();
    for (let i = 0; i < 8; i++) {
      const clash = await env.DB.prepare('SELECT 1 FROM users WHERE nick_lower = ? AND id != ?')
        .bind(nick.toLowerCase(), me.id).first();
      if (!clash) break;
      nick = generateNick();
    }
  }

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
