/**
 * Odesílání pošty. Jediné, k čemu appka poštu potřebuje, je obnova zapomenutého PINu.
 *
 * STAV: nedoručuje se. Poskytovatelé (Resend, Postmark…) pustí poštu na cizí adresy
 * až po ověření odesílající domény přes SPF/DKIM, a projekt zatím žádnou doménu nemá
 * (běží na *.pages.dev). Do té doby se odkaz jen zaloguje — reset jde tedy dokončit
 * ručně z logů, ale hráči nedorazí nic.
 *
 * AŽ BUDE DOMÉNA: nastav tajemství RESEND_API_KEY a proměnnou MAIL_FROM
 * (`wrangler pages secret put RESEND_API_KEY`), zbytek už je hotový — funkce se
 * přepne sama, protože se řídí přítomností klíče.
 */
export async function sendPinReset(env, { email, nick, resetUrl }) {
  const predmet = 'Obnova PINu — Zeměkvíz';
  const text =
    'Ahoj ' + nick + ',\n\n' +
    'někdo (snad ty) požádal o obnovu PINu k profilu ' + nick + ' v Zeměkvízu.\n' +
    'Nový PIN si nastavíš tady:\n\n' + resetUrl + '\n\n' +
    'Odkaz platí 30 minut a dá se použít jen jednou.\n' +
    'Pokud jsi o obnovu nežádal, nic nedělej — PIN zůstane starý.\n';

  if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
    // Bez domény nemá smysl volat poskytovatele. Do 2026-09-03 se sem logoval PLNÝ
    // převzímací odkaz i s e-mailem — kdo měl přístup k logům nasazení, měl přístup
    // k účtům. Teď se neloguje ani odkaz, ani adresa; jen fakt, že pošta chybí.
    // (Tahle větev je navíc od téhož data skoro nedosažitelná: reset/index.js token
    // vůbec negeneruje, když pošta není nastavená.)
    console.log('[mail] NEODESLÁNO — pošta není nastavená (chybí RESEND_API_KEY/MAIL_FROM).');
    return { odeslano: false, duvod: 'neni-nastavena-posta' };
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.MAIL_FROM, to: email, subject: predmet, text: text }),
  });

  if (!r.ok) {
    console.log('[mail] poskytovatel odmítl: ' + r.status + ' ' + (await r.text()).slice(0, 300));
    return { odeslano: false, duvod: 'poskytovatel-odmitl' };
  }
  return { odeslano: true };
}
