# CLAUDE.md — standard projektu (čti na začátku každé session)

> **Tento soubor Claude Code načítá automaticky při startu KAŽDÉ session.**
> Ber ho jako **zdroj pravdy** pro konvence a systémová rozhodnutí tohoto projektu.
>
> **Meta-pravidlo:** Kdykoli padne **velké rozhodnutí platné pro celý systém**
> (workflow, styl, architektura, formát dat, nástroje…), MUSÍŠ ho zaznamenat níže
> do **„Systémová rozhodnutí (log)"** — stručně, s datem a důvodem. Jinak se znalost ztratí
> a příští session to bude luštit znovu. Zapisuj hned, jak rozhodnutí padne.

Vědomostní kvíz (zeměpis). Statická webová hra, běží **offline**.
Struktura viz [README.md](README.md).

---

## Systémová rozhodnutí (log)

Nejnovější nahoře. Formát: **datum — název** + jednou větou co a proč.

- **2026-07-23 — Ilustrace přes pollinations.ai, bez `model` parametru.**
  Malované ilustrace (dlaždice, loga, ikony) se generují přes pollinations.ai a bakají do `assets/`.
  Postup a časté pasti viz sekce **Ilustrace** níže. Důvod: appka běží offline, žádná runtime AI.
- **2026-07-23 — Výběrové dlaždice = ilustrace, ne emoji.**
  Kontinenty/země/sekce v kvízu zobrazují ilustraci ve stylu rozcestníku; emoji je jen fallback.
- **(konvence od založení) — Appka je offline-only.**
  Žádná runtime volání AI ani externích API. Vše (obrázky, data) je součástí repa.
- **(konvence od založení) — Karty jsou read-only kopie z Glóbu.**
  `data/cards/{cc}.json` je kopie z projektu Glóbus (repo `Hricka`); kanonická verze žije tam,
  sem se kopíruje ručně. Kvíz karty jen čte.

---

## Ilustrace (dlaždice, loga, ikony) — JAK SE TVOŘÍ

Všechny malované ilustrace v `assets/` se generují jednorázově přes **pollinations.ai**
a ukládají do `assets/` jako `.jpg`. Žádný API klíč, žádné přihlášení, žádné runtime volání.

### Nejdůležitější pravidlo (jinak se to znovu luští)
- URL **NESMÍ obsahovat `model=...`**. Parametr `model=sana` (starý default) dnes vrací
  **pevný placeholder** (pořád stejná „elfka") a prompt ignoruje. `model=flux/turbo` prompt taky ignoruje.
  **Bez parametru `model`** se prompt ctí a vyjde tlumený „cestovní deník" styl, který sedí k appce.
- Recept URL: `https://image.pollinations.ai/prompt/{urlencoded_prompt}?width=512&height=512&nologo=true&seed=N`
- `seed` zamyká výsledek (stejný seed = stejný obrázek → dá se opakovat/porovnávat varianty).

### Styl (paleta „cestovního deníku" celé appky)
Za motiv se připojuje styl-suffix:
```
, painterly textured watercolor gouache illustration, aged vintage travel journal,
muted desaturated ochre cream and soft teal palette, weathered plaster texture background,
warm cozy, single centered subject, minimal simple, no text, no words, no letters, no border
```
Zásady: **jeden jednoduchý vycentrovaný motiv** (ne přeplácaná scéna), tlumené/vybledlé barvy,
`no text, no words, no letters` (modely rády vpisují nesmyslná písmena), krémovo-petrolejová paleta.
Původní recept každé staré ilustrace je zapsaný v jejím **EXIF** (pole `prompt`) — dá se přečíst a použít jako vzor.

### Generátor
[scripts/gen-illustrations.ps1](scripts/gen-illustrations.ps1) — mapa `soubor → {motiv, seed}` pro dlaždice
kontinentů/zemí/sekcí. Spuštění:
```powershell
powershell -File scripts/gen-illustrations.ps1                       # jen chybějící
powershell -File scripts/gen-illustrations.ps1 -Only cont-asia -Force # přegenerovat jednu (uprav seed v souboru)
powershell -File scripts/gen-illustrations.ps1 -Force                 # přegenerovat vše
```
Po vygenerování obrázek **vždy zkontroluj** (Read tool ho zobrazí); když nesedí, změň `seed` a přegeneruj.

### Napojení v kódu
Dlaždice ([quiz.js](quiz.js), fce `tileHtml`) načítají `assets/{cont|country|section}-*.jpg`
s **emoji fallbackem** (`onerror`). Chybějící obrázek tedy hru nerozbije — spadne zpět na emoji.
Názvy: kontinenty `cont-{id}.jpg`, země `country-{cc}.jpg`, sekce `section-{slug}.jpg`
(slugy v `SECTION_SLUG`), „Vše" = `section-vse.jpg`.

### Pozn.
Fotky ke kartám v `img/` (Polsko/Slovensko) vznikly jinak — přes **Gemini**, pak ořez bílých okrajů
a import přes [scripts/import-images.js](scripts/import-images.js).
