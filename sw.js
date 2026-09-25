"use strict";
/* Service worker Cestokvízu.
 *
 * PROČ VŮBEC: appka se roky popisovala jako „offline-first", ale v prohlížeči offline
 * NIKDY nefungovala — service worker ani manifest neexistovaly (CLAUDE.md 2026-08-28).
 * „Offline" tu odjakživa znamenalo *soběstačná* (žádná runtime volání cizích API), ne
 * *bez připojení*. Tohle je první verze, která to slovo naplňuje doopravdy, a zároveň
 * podmínka pro zabalení do Google Play.
 *
 * ZÁSADA, KTERÁ TU VÁŽÍ NEJVÍC: špatně napsaný service worker umí appku zamrazit na
 * staré verzi a hráč se z toho sám nedostane — smazat cache přes nastavení prohlížeče
 * nikoho nenapadne. Proto je tu všechno postavené tak, aby se to samo spravilo:
 *
 *   - Skořápka (HTML, JS, CSS, malé JSONy) jede „stale-while-revalidate": ze cache se
 *     podá okamžitě STARÁ verze a na pozadí se stáhne nová. Po nasazení tedy hráč jednou
 *     uvidí starý kód a při dalším otevření už nový, BEZ nutnosti cokoli povyšovat ručně.
 *     To je ta pojistka proti zamrznutí.
 *   - Obrázky a data otázek jedou „cache-first" — jsou velké a mění se zřídka, takže
 *     stahovat je znovu při každém zobrazení by na mobilních datech bylo drahé.
 *     ⚠ PLATÍ SE ZA TO TÍMHLE: když se přegeneruje ILUSTRACE (a to se u tohohle projektu
 *     děje po dávkách), hráč s naplněnou cache uvidí starou, dokud se nezvýší `VERZE`.
 *     Při nasazení dávky obrázků se tedy MUSÍ zvednout `VERZE` níž.
 *   - `/api/` se necachuje VŮBEC. Online hra na něm stojí a odpovědi jsou vázané na
 *     přihlášeného hráče — cache by tu mohla podat cizí data nebo rozbitou partii.
 *
 * `skipWaiting()` se SCHVÁLNĚ nevolá: nová verze se ujme až po zavření všech karet.
 * Vyměnit skripty pod rozehranou hrou je horší než chvíli běžet na staré verzi.
 */

// Zvedni při nasazení, které mění skořápku nebo obrázky. Staré cache se pak samy smažou.
const VERZE = "v1";

const C_SKORAPKA = "cestokviz-skorapka-" + VERZE;
const C_TRVALE = "cestokviz-trvale-" + VERZE;
const C_OBRAZKY = "cestokviz-obrazky-" + VERZE;
const NASE_CACHE = [C_SKORAPKA, C_TRVALE, C_OBRAZKY];

// Strop pro ilustrace k otázkám. Fond má přes 3 700 obrázků po ~220 kB, tedy skoro
// 800 MB — uložit všechno nejde. 300 kusů je ~66 MB, což pokryje stovky odehraných
// otázek a na telefonu to není nezdvořilé.
const STROP_OBRAZKU = 300;

// Soubory, bez kterých se appka nerozběhne. Ověřeno, že všechny existují; kdyby se
// seznam rozešel s realitou, `npm run validate` to nahlásí jako chybu.
const SKORAPKA = [
  "/hra",
  "/quiz.css",
  "/quiz.js",
  "/online.js",
  "/manifest.json",
  "/assets/three.min.js",
  "/assets/fonts/nunito-latin.woff2",
  "/assets/fonts/nunito-latin-ext.woff2",
  "/assets/logo.jpg",
  "/assets/earth.jpg",
  "/assets/icon-192.png",
  "/data/fondy.json",
  "/data/questions-index.json",
  "/data/konflikty.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(C_SKORAPKA);
    // Záměrně po jednom, ne `addAll`: ten při JEDINÉM nedostupném souboru odmítne celou
    // instalaci a appka zůstane bez service workeru úplně. Radši neúplná cache než žádná.
    await Promise.all(SKORAPKA.map(u =>
      cache.add(new Request(u, { cache: "reload" })).catch(err =>
        console.warn("[sw] nepodařilo se předcachovat " + u, err))));
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const jmeno of await caches.keys()) {
      if (jmeno.startsWith("cestokviz-") && !NASE_CACHE.includes(jmeno)) await caches.delete(jmeno);
    }
    // Převezme i karty, které se načetly ještě bez service workeru — jinak by první
    // návštěva po instalaci zůstala neobsloužená a offline by fungovalo až napodruhé.
    await self.clients.claim();
  })());
});

// Uloží jen to, co je k uložení bezpečné. `type === "basic"` vyřadí odpovědi z cizích
// zdrojů a neprůhledné odpovědi, u kterých se ani nepozná, jestli vyšly.
function ulozitelna(odpoved) {
  return odpoved && odpoved.ok && odpoved.type === "basic";
}

async function omezPocet(cache, strop) {
  const klice = await cache.keys();
  if (klice.length <= strop) return;
  // Cache API vrací klíče v pořadí vložení, takže mazání od začátku je FIFO. Pravé LRU
  // by chtělo vlastní evidenci přístupů; u ilustrací to nestojí za tu složitost.
  for (const k of klice.slice(0, klice.length - strop)) await cache.delete(k);
}

async function cacheFirst(req, jmenoCache, strop) {
  const cache = await caches.open(jmenoCache);
  const z = await cache.match(req);
  if (z) return z;
  const odpoved = await fetch(req);
  if (ulozitelna(odpoved)) {
    await cache.put(req, odpoved.clone());
    if (strop) await omezPocet(cache, strop);
  }
  return odpoved;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(C_SKORAPKA);
  const z = await cache.match(req);
  const ze_site = fetch(req).then(odpoved => {
    if (ulozitelna(odpoved)) cache.put(req, odpoved.clone());
    return odpoved;
  }).catch(() => null);
  // Když je něco v cache, podá se hned a síť dojede na pozadí. Bez cache se čeká na síť.
  return z || (await ze_site) || new Response("", { status: 504, statusText: "offline" });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Online hra: nikdy necachovat. Odpovědi jsou vázané na přihlášeného hráče a na stav
  // konkrétní partie — podat je ze cache by znamenalo cizí data nebo rozbitou hru.
  if (url.pathname.startsWith("/api/")) return;

  // Přechod na stránku. Nejdřív síť (ať se po nasazení chytne nová verze), a když není
  // připojení, podá se uložená skořápka — jinak by hráč offline viděl chybovou stránku
  // prohlížeče místo hry.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const odpoved = await fetch(req);
        if (ulozitelna(odpoved)) (await caches.open(C_SKORAPKA)).put(req, odpoved.clone());
        return odpoved;
      } catch (_) {
        const cache = await caches.open(C_SKORAPKA);
        return (await cache.match(req)) || (await cache.match("/hra")) ||
          new Response("Offline a hra není uložená.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith("/img/")) {
    e.respondWith(cacheFirst(req, C_OBRAZKY, STROP_OBRAZKU));
    return;
  }

  if (url.pathname.startsWith("/assets/") ||
      url.pathname.startsWith("/data/questions/") ||
      url.pathname.startsWith("/data/cards/")) {
    e.respondWith(cacheFirst(req, C_TRVALE));
    return;
  }

  e.respondWith(staleWhileRevalidate(req));
});
