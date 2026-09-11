# Kde jsme skončili a co dělat dál

Předávka pro pokračování na jiném počítači. Psáno 7. září 2026 na konci dlouhé
session; zachycuje stav, rozhodnutí, která padla, a to, co je připravené k práci.

**Nejdřív si přečti [CLAUDE.md](../CLAUDE.md)** — je to zdroj pravdy o konvencích
a všech systémových rozhodnutích. Tenhle soubor je jen rozcestník k tomu, co je
rozdělané teď.

---

## 1. Kde to leží

| Co | Kde |
|---|---|
| Větev s prací | **`claude/pokracujeme-e79708`** (na GitHubu) |
| Poslední commit větve | „Zisk bodu bez hvezdy; pocitadlo zustava jen v praporku" |
| `master` | obsahuje jen část práce (viz níž) |
| Plán vydání s nálezy | artefakt **Zeměkvíz do obchodů** (odkaz má hráč v chatu) |
| Postup nasazení | [docs/nasazeni.md](nasazeni.md) |

**`master` je pozadu za větví.** Do masteru se slily jen věci z první poloviny
session (ilustrace, kompozice pravého sloupce, odlehčené tlačítko). Všechno ostatní —
hodnocené hry z fronty, rychlý start, serverový fond, bezpečnostní opravy, mazání
profilu, hlášky u zablokovaných tlačítek, počítadlo skóre — **žije jen na větvi**.
Sloučení je fast-forward, ale je to rozhodnutí hráče, ne automatika.

---

## 2. Rozběhnutí na novém počítači

```bash
npm install
```

### a) `.dev.vars` — bez něj padá registrace na 500

Soubor se **negituje** (je v `.gitignore`), takže na novém počítači chybí. Vytvoř
ho v kořeni repa:

```
ALLOW_DEV_SECRET=1
SESSION_SECRET=lokalni-test-tajemstvi-nepouzivat-v-produkci
```

`ALLOW_DEV_SECRET` zároveň vypíná limit registrací, takže projdou testy, které
zakládají desítky účtů z jedné IP. **V produkci tahle proměnná nesmí být nikdy.**

### b) Lokální databáze

```bash
npm run db:init
```

Je to **destruktivní** (spouští `DROP TABLE` ze `schema.sql`), ale lokální databáze
je jen testovací, takže je to správná cesta k čistému startu. `schema.sql` už obsahuje
i dnešní sloupce, takže po `db:init` **není potřeba pouštět žádnou migraci**.

Migrace v `migrations/` jsou jen pro **produkci**, kde se nesmí mazat (viz bod 5).

### c) Server

```bash
npm run dev            # wrangler pages dev . → http://localhost:8788/hra
```

Obsluhuje statiku i `/api/*` proti lokální D1, takže funguje i Světová liga.

### d) Testy

```bash
npm run validate       # data + index otázek
npm run test:offline   # 842 kontrol, offline část
npm run test:pool      # 8, dělení fondu (falešná DB)
npm run test:auth      # 12, token a epocha (falešná DB)
npm run test:ghost     # 67, ghost soupeř (falešná DB)
API_BASE=http://127.0.0.1:8788 npm run test:api   # 163, potřebuje běžící server
```

Ve Windows PowerShellu se proměnná předává `$env:API_BASE="http://127.0.0.1:8788"`.

**Známá nestabilita:** jedna kontrola v `test:api` („usazený hráč silou bota pohnul")
je nedeterministická — závisí na losu otázek. Když spadne jednou z několika běhů,
není to regrese; při druhém běhu projde.

---

## 3. Co je hotové (a co z toho plyne)

Podrobnosti jsou v CLAUDE.md pod daty 2026-09-06 a 2026-09-07. Stručně:

- **Hlavní režim konečně hodnotí.** „Hrát teď" zakládalo hru typu `odkaz` s botem, což
  je nehodnocené — rating tedy nikdy nikomu nehnul a žebříček zůstával prázdný. Nově
  `PUT /api/match` zakládá rovnou hodnocený duel proti ghostovi.
- **Start stahuje 4,6 kB místo 4,72 MB.** Otázky se dotahují až pro vybranou zemi.
- **Fond se dělí na veřejný a serverový** (`online_only`). Mechanismus hotový,
  **obsah zatím žádný** — viz „co dělat dál".
- **Bezpečnost:** název turnaje a avatar se validují, přihlášení jde zneplatnit
  (`token_epoch`), Three.js je v repu a appka nesahá na cizí server, přibyly HSTS
  a Permissions-Policy.
- **Mazání profilu.** Hry zůstávají, jen se odpojí od identity (rozhodl hráč).
- **UI:** vysvětlení a tlačítka pod ilustrací, zablokovaná tlačítka říkají, co jim
  chybí, skóre se v praporku přetáčí.

---

## 4. Co dělat dál

Plán má osm kroků (artefakt „Zeměkvíz do obchodů"). **Kroky 0–2 jsou hotové
až na obsah.** Pořadí dál:

### Krok 2 zbytek — napsat serverové otázky
Mechanismus je hotový: otázka s `"online_only": true` se nekopíruje na web a online
hra ji losuje přednostně. Dnes je jich **nula**, takže online pořád losuje z veřejných
otázek, jejichž odpovědi si jde dohledat. `npm run validate` to hlásí jako upozornění.
Je to obsahová práce, ne kód.

### Krok 3 — právní vrstva (BLOKÉR obchodů)
- Podmínky užití a zásady zpracování údajů (appka sbírá přezdívku, e-mail, historii).
- **Veřejná stránka pro žádost o smazání účtu** — Google ji vyžaduje i mimo appku;
  v appce už mazání je.
- Souhlas s měřením a reklamou (EU + iOS).
- **ROZHODNUTÍ, KTERÉ CHYBÍ:** dětské pásmo zůstane jako plnohodnotné účty, nebo se
  z něj stane jen obtížnost pro rodinné hraní (appka 13+)? Mění to rozsah celého kroku.

### Krok 4 — web jako produkt (BLOKÉR obchodů)
Manifest, service worker, ikony → appka jde nainstalovat a snese výpadek sítě. Dnes
nemá ani jedno, takže to fakticky není appka, ale stránka.

### Kroky 5–7
Obaly pro obchody (pozor: 184 MB ilustrací se do balíčku nevejde, obal je musí brát
z webu), platby a provoz. Detaily v artefaktu.

### Otevřené drobnosti z auditů
- Odveta vloží soupeře bez jeho vědomí (hodnocenou prohru z toho ale vyrobit nejde —
  ověřeno).
- Odchod z čekárny křížkem nechá hráče ve frontě.
- `join.js` nekontroluje `game.status`.
- `applyRotation()` není navěšená na `resize`.
- Kontrast drobných textů pod 4,5:1 a dotykové cíle pod 44 px (plošná změna palety,
  patří hráči k rozhodnutí).

---

## 5. Produkce — co ji čeká

**Nasazeno naposledy 2026-09-03**, takže produkce nemá nic z toho, co vzniklo potom.
Postup je v [docs/nasazeni.md](nasazeni.md), pořadí je závazné: migrace → obsah → kód.

Migrace, které na produkci ještě NEBĚŽELY (spouštět po jedné, jsou přírůstkové):

```
migrations/2026-09-04-difficulty.sql          (pokud neproběhla už dřív)
migrations/2026-09-06-online-only.sql
migrations/2026-09-06-token-epoch.sql
migrations/2026-09-07-smazani-uctu.sql
```

Bez nich nový kód spadne na „no such column". **Nikdy nepouštěj `db:init:remote`** —
smazal by účty, rating i historii.

---

## 6. Pasti, na které se v téhle session doplatilo

Stojí za přečtení, protože se všechny opakují:

- **Windows PowerShell čte `.ps1` jako ANSI.** Skript s diakritikou bez BOM spadne
  na parse error; pomocné skripty psát bez diakritiky nebo s BOM.
- **`$ErrorActionPreference = "Stop"` + `npm ... 2>&1`** shodí běh na prvním varování
  npm. Exit kód číst z `$LASTEXITCODE`, ne z textu výstupu.
- **České `„…"` uvnitř JS řetězce v uvozovkách ho ukončí** (ASCII `"`). V template
  literalech to nevadí; v `online.js` a testech ano. Chytí to `node --check`, ale
  hláška ukazuje jinam.
- **Mutační skript běžící na pozadí přepíše úpravu, kterou uděláš mezitím** — vrací
  soubor ze snímku pořízeného na začátku. Když běží, na dotčené soubory nesahat.
- **`requestAnimationFrame` v neviditelné kartě neběží.** Animace tedy nesmí být
  jediné, co zapíše hodnotu; a přepsání `document.visibilityState` to neobejde.
- **Mutace ověřuj až po tom, co základ PROCHÁZÍ**, a vzor hledej přesně — několik
  mutací v téhle session „prošlo" jen proto, že se nenašel vzor nebo byl test slepý.
