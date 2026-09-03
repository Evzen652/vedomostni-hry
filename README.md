# Zeměkvíz

Vědomostní kvíz (zeměpis). Samostatný projekt, oddělený od aplikace **Glóbus** (repo `Hricka`).

Čtyři režimy:
- **Sólo jízda**, **Párty souboj**, **Škola hrou** — hrají se z fondu otázek v prohlížeči.
- **Světová liga** (online) — proti živým soupeřům, s ratingem, žebříčky a turnaji.
  Běží na Cloudflare Pages Functions + D1.

> Kanonický zdroj konvencí a rozhodnutí projektu je [CLAUDE.md](CLAUDE.md). Tenhle
> soubor je jen rozcestník; když se něco rozchází, platí CLAUDE.md.

## Spuštění

```bash
npm install          # jednou; jediná závislost je wrangler
npm run dev          # wrangler pages dev . → http://localhost:8788/hra
```

`npm run dev` obsluhuje statické soubory **i** `/api/*` (Functions) proti **lokální**
D1, takže funguje i online režim. Lokální databázi naplní `npm run db:init`
(pozor: je destruktivní, spouští `DROP TABLE` ze `schema.sql` — jen pro první naplnění).

Samotnou offline hru lze servírovat i libovolným statickým serverem, ale `/api/*`
tam neexistuje, takže online režim je mrtvý — pro vývoj používej `npm run dev`.

## Struktura

- `hra.html`, `quiz.js`, `quiz.css` — offline hra; `hra.html` je domovská stránka.
- `online.js` — online režim (Světová liga). Přebírá `#qz-body` a vrací ho zpět.
- `functions/` — Cloudflare Pages Functions (API). `_lib/` sdílená logika,
  `_middleware.js` záchytný bod pro chyby, `api/` jednotlivé endpointy.
- `schema.sql` — schéma D1. `migrations/` přírůstkové migrace (bez `DROP`).
- `data/questions/{cc}.json` — otázky po zemích.
- `data/fondy.json` — hlášky a texty hry.
- `data/cards/{cc}.json` — **kopie** kartové databáze z Glóbu (kvíz je jen čte).
- `img/` — ilustrace k otázkám. `assets/` — dlaždice, vlajky, ikony, fonty, textura glóbu.
- `scripts/` — kontroly, generátory a jednorázové importy (viz níže).

## Nasazení

```bash
npm run build        # sestaví dist/ jen z toho, co má být veřejné (build-public.js)
npm run deploy       # build + wrangler pages deploy dist --project-name zemekviz
```

**Nasazuje se výhradně z `dist/`**, ne z kořene — jinak by se na web dostaly i
`CLAUDE.md`, `schema.sql` a další. Produkční větev projektu je `master`, takže
pro produkci: `wrangler pages deploy dist --project-name zemekviz --branch master`.
Obsah otázek se do běžící D1 dostává přírůstkově přes `npm run db:sync` (bez mazání).

## Kontroly

Spouští se ručně (`node --check` + `validate` + `test:offline` jede i v CI):

| příkaz | co kontroluje |
|---|---|
| `npm run validate` | integrita `data/questions` (0 chyb = OK) |
| `npm run test:offline` | konstanty a čisté funkce z `quiz.js`/`online.js` |
| `npm run test:api` | API proti běžícímu `npm run dev` a lokální D1 |
| `npm run audit` | kvalita otázek (vrací upozornění, ne chyby) |
| `npm run lint-irony` | prompty k ilustracím |
| `npm run lint-facts` | pole „Více o…" |
| `npm run sim-online` | model ratingu (Glicko) |

## Ilustrace

Jak se tvoří malované ilustrace (Gemini, styl, časté pasti) je popsané v [CLAUDE.md](CLAUDE.md),
sekce „Ilustrace". Generátor: `npm run gen-irony`.
