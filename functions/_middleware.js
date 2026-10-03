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
/* PŘESMĚROVÁNÍ STARÉ ADRESY (2026-10-03, rozhodl hráč). Appka běží na cestokviz.cz;
 * zemekviz.pages.dev se trvale přesměruje, aby lidé nehráli na dvou adresách — přihlášení
 * (token v localStorage) je vázané na adresu, takže by ho měli rozdělené.
 *
 * - Jen PŘESNÁ shoda hostitele: náhledové adresy nasazení (xxxx.zemekviz.pages.dev) zůstávají
 *   funkční, ověřuje se na nich nasazení.
 * - GET/HEAD 301, ostatní 308 — 301 by z POST udělal GET a API by dostalo prázdný požadavek.
 * - /sw.js se NEPŘESMĚROVÁVÁ: prohlížeč neumí aktualizovat service worker přes přesměrování,
 *   takže by na staré adrese navždy zůstal starý worker s cache. Místo toho dostane
 *   ÚKLIDOVÝ worker, který smaže cache, odregistruje se a otevřené karty znovu načte —
 *   tím se dostanou na přesměrování.
 */
const STARA_ADRESA = 'zemekviz.pages.dev';
const NOVA_ADRESA = 'https://cestokviz.cz';
const UKLIDOVY_SW = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url);
})()));`;

function presmerovani(request) {
  const url = new URL(request.url);
  if (url.hostname !== STARA_ADRESA) return null;
  if (url.pathname === '/sw.js') {
    return new Response(UKLIDOVY_SW, {
      headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-cache' },
    });
  }
  const status = request.method === 'GET' || request.method === 'HEAD' ? 301 : 308;
  return Response.redirect(NOVA_ADRESA + url.pathname + url.search, status);
}

export async function onRequest({ next, request }) {
  const jinam = presmerovani(request);
  if (jinam) return jinam;
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
