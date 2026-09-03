/* Záchytný bod pro celé API.
 *
 * Proč: v `functions/` nebylo nic, co by chytlo neošetřenou výjimku, takže každá
 * (chyba typu v D1, porušení UNIQUE, `undefined.foo`) minula `json()`/`fail()`
 * a klient dostal HTML chybovou stránku Cloudflare. `online.js` ale očekává JSON,
 * takže `r.json()` selhalo a hráči zůstala mrtvá obrazovka bez hlášky.
 *
 * Běžný případ, který to řeší: dvě souběžné registrace téže přezdívky. Kontrola
 * v register.js je oddělená od INSERTu, takže druhá spadne na UNIQUE(nick_lower)
 * — nově z toho bude JSON 500, ne rozbitá stránka.
 *
 * Podrobnost chyby se ven NEPOSÍLÁ (mohla by prozradit tvar dotazu nebo dat),
 * jen se zaloguje. Hráč dostane hlášku, ze které pozná, že chyba je na naší straně.
 */
export async function onRequest({ next, request }) {
  try {
    return await next();
  } catch (e) {
    console.log('[api] neošetřená výjimka na ' + new URL(request.url).pathname + ': ' + (e && e.stack || e));
    return new Response(JSON.stringify({ error: 'na naší straně se něco pokazilo, zkus to prosím znovu' }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}
