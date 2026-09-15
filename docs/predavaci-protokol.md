# Předávací protokol

Pro novou session (i na jiném počítači). Sepsáno **7. září 2026**, **naposledy aktualizováno
15. 9. 2026 v noci** po session s úpravami UI (ilustrace výsledků, dobarvení dlaždic, remíza
a nepovinná jména v párty, stažené tvary v kontrole rodu).

Tenhle soubor je **protokol**: co převzít, co ověřit, co je zakázané a co dělat
v jakém pořadí. Popisný stav projektu je v [pokracovani.md](pokracovani.md),
konvence a všechna rozhodnutí v [CLAUDE.md](../CLAUDE.md).

---

## 0. Čím začít novou session

Zkopíruj do prvního vzkazu:

> Pokračuju v projektu Zeměkvíz. Přečti si `docs/predavaci-protokol.md`, proveď převzetí
> podle bodu 2 a řekni mi, jestli stav sedí. Pracuje se na větvi `claude/pokracujeme-e79708`.

**Pozor na worktree:** nová session často startuje v čerstvém worktree na jiné, starší větvi
(14. 9. to byl `cb04b3d`, 12 commitů pozadu). Nejdřív `git fetch` a posunout se na
`origin/claude/pokracujeme-e79708` (fast-forward), teprve pak cokoli ověřovat.

### ⚠ Blokuje ilustrace k otázkám: VYČERPANÝ KREDIT GEMINI

Generování spadne na `429 prepayment credits are depleted`. **Hráč musí dobít kredit na
`ai.studio/projects`** a vložit `GEMINI_API_KEY` do `.dev.vars` (na tomhle počítači klíč
není nikde). Zadání pro **4 země (168 otázek) jsou hotová a olintovaná**, plus pět
malajsijských oprav. Podrobnosti v bodu 2 [predani-ilustrace.md](predani-ilustrace.md).

Ilustrace do UI (dlaždice, výsledkové obrazovky) jdou i bez klíče: hráč je vygeneruje
v chatu Gemini a uloží do `D:\weigle\plocha\Kvíz_ILUSTRACE`, session je jen zmenší
a napojí (postup viz CLAUDE.md, zápis 2026-09-15).

**Všechno je commitnuté a pushnuté** — stačí `git pull`.

---

## 1. Předmět předání

| Položka | Hodnota |
|---|---|
| Repo | `github.com/Evzen652/vedomostni-hry` |
| Pracovní větev | `claude/pokracujeme-e79708` — poslední commit viz `git log` |
| `master` | `cb04b3d` (11. 9.) — **pracovní větev je o 14+ commitů napřed** |
| Produkce | `zemekviz.pages.dev`, nasazená z **`cb04b3d`** (ověřeno 15. 9. přes `wrangler pages deployment list`) |
| Účtů v produkci | **1 živý hráč + 18 botů** — **nic se nesmí mazat** |

**Co je na větvi a NENÍ na produkci** (od `cb04b3d`):
- 11 hlášek bez staženého minulého času („Uhodls" → „Trefa"), kontrola `stazeny` v auditu,
- 29 otázek `country` „Česká republika" → „Česko",
- stabilní `test:api` (turnajové kolo proti botovi odpovídá správně),
- výběr kontinentu: dlaždice Česko druhá, nadpis „Kam se vydáme?",
- dobarvené dlaždice (Evropa nová z Gemini, Celý svět, Asie, Česko, 4 režimy),
- ilustrace na výsledku sóla/školy (`end-solo.jpg`) a vyhlášení párty (`end-party.jpg`),
- párty: remíza při shodném skóre (fond `tie` ve `fondy.json`), typografické uvozovky,
  nepovinná jména („Hráč N"),
- nástroje na kontrolu ilustrací v `scripts/ilustrace/` a dokončené země z 12.–13. 9.

**Při nasazení tohohle stavu je nutný `npm run db:sync -- --remote`** — hlášky i `country`
čte online hra z D1. Pořadí a pasti v [nasazeni.md](nasazeni.md). Sloučení do `master`
a nasazení jsou rozhodnutí hráče.

Skutečný stav vždy ověř přes `git log` a
`CLOUDFLARE_ACCOUNT_ID=3005fa92056c05be6e87ea85a5df5ab9 npx wrangler pages deployment list --project-name zemekviz`,
ne podle téhle tabulky.

---

## 2. Převzetí — proveď a ohlas výsledek

Šest kroků. U každého je uvedeno, co má vyjít; když vyjde něco jiného, **nepokračuj
a řekni to**, protože se liší prostředí, ne kód.

```bash
git fetch && git checkout claude/pokracujeme-e79708   # ve worktree: git merge --ff-only origin/claude/pokracujeme-e79708
npm install
```

**1) `.dev.vars`** — negituje se, v novém worktree i na novém počítači chybí. Vytvoř v kořeni:

```
ALLOW_DEV_SECRET=1
SESSION_SECRET=lokalni-test-tajemstvi-nepouzivat-v-produkci
GEMINI_API_KEY=<klíč z ai.studio, celý řádek>
```

**`GEMINI_API_KEY` je nutný jen pro generování ilustrací k otázkám** — bez něj
`batch-irony-images.js` neudělá nic. Klíč má hráč na `ai.studio/projects`; **nový formát
nezačíná „AIza"**, skripty berou celý řádek. Do gitu se nikdy nesmí dostat.

**2) Lokální databáze:** `npm run db:init` → v `questions` má být **3 742** otázek
a **18** botů. Migrace se lokálně nepouštějí, `schema.sql` je má v sobě.

**3) Server:** `npm run dev` (port 8788), nebo ve worktree konfigurace `kviz-online-worktree`
z `.claude/launch.json` (port **8790**, servíruje ze živých souborů worktree) →
`/hra` se vykreslí do vteřiny a v síti se stáhnou **dva** soubory z `data/`
(`fondy.json`, `questions-index.json`). Když se stahuje 56 souborů a 4,7 MB, běží starý kód.

**4) Testy bez serveru:**

| Příkaz | Očekávaný výsledek |
|---|---|
| `npm run validate` | `CHYBY: žádné` (upozornění o chybějících fotkách jsou v pořádku) |
| `npm run test:offline` | **874** kontrol (od 15. 9., přibyl fond `tie`, tlačítko „Otoč obrazovku", délky párty 5/8/12, registrace bez volby pásma a obnova PINu po chybném přihlášení) |
| `npm run test:pool` | 13 kontrol |
| `npm run test:auth` | 12 kontrol |
| `npm run test:ghost` | 67 kontrol |
| `npm run test:expire` | 8 kontrol |
| `npm run lint-irony` | **0 chyb**, ~76 varování (varování jsou prověřený šum) |
| `npm run audit:konzistence` | jen kategorie `prozrazuje_jinou` a `stejna_odpoved_spolecne_pasmo` (výstup JSON pak `git restore`) |

**4b) Nástroje na ilustrace** (`scripts/ilustrace/`):
`node scripts/ilustrace/archy.js kr 1` musí vyrobit arch do `.ilustrace/archy/`.
Když spadne na chybějícím `sharp`, chybí `npm install`.

**5) Testy proti serveru** (server musí běžet):
`API_BASE="http://127.0.0.1:8788" npm run test:api` (ve worktree port 8790) → **167** kontrol.
Jedna kontrola („usazený hráč silou bota pohnul") je **nedeterministická**; když spadne
jednou z několika běhů, není to regrese. Druhá taková („body z kola proti botovi se
přičetly") padala v ~6 % běhů, protože testovací hráč tipoval vždy A — od 14. 9. v tom
kole odpovídá správně (`playAll(…, true)`), takže už padat nemá.

**6) Ruční zkouška v prohlížeči:** Sólo jízda → Česko (druhá dlaždice) → Vybrat vše →
Dospělí → 10 otázek → odpověz. Musí platit:
- výběr kontinentu má nadpis „Kam se vydáme?" a pořadí Celý svět, Česko, Evropa…,
- po odpovědi je vysvětlení a obě tlačítka **pod ilustrací**, ne v kartě,
- kolem ilustrace nejsou rozmazané pruhy (rám ji obepne),
- pod obrázkem svítí zisk bodů **bez hvězdy**,
- na konci je nad „Výprava dokončena!" ilustrace batůžkáře.

**Past při kontrole textu:** v malém písmu screenshotu vypadá „é" jako „ě" (14. 9. tak
vznikl planý nález „Chodové Planě"). Text ověřuj z DOM nebo z dat, ne okem.

---

## 3. Tvrdá pravidla

Tohle nejsou doporučení. Každé z nich stálo v tomhle projektu škodu:

1. **`npm run db:init:remote` se nikdy nespouští.** Začíná `DROP TABLE` a v produkci
   jsou reálné účty, rating i rozehrané hry.
2. **Na produkci se nasazuje jen postupem z [nasazeni.md](nasazeni.md)** — pořadí
   migrace → obsah → kód, a `deploy` musí mít `--branch master`, jinak nasadí náhled
   a ostrá adresa dál servíruje starý kód.
3. **`git checkout -- soubor` na necommitnuté změny ne.** Na mutační testy se dělá
   kopie stranou; a když běží mutační skript, na dotčené soubory se mezitím nesahá
   (přepíše je ze snímku).
4. **Nová kontrola v testech se ověřuje MUTACÍ**, ne tím, že svítí zeleně — a základ
   musí PROCHÁZET, než se mutuje.
5. **Velká rozhodnutí se zapisují do CLAUDE.md hned**, jinak se příští session luští znovu.
6. **Paleta, rozměry a vzhled jsou území hráče.** Plošné změny (kontrast, dotykové
   cíle) se nabízejí, ne provádějí potichu.
7. **Skripty s regulárními výrazy a víc řádky se píšou nástrojem Write do scratchpadu**,
   ne jako `node -e` v Bashi ani heredocem — escapování je rozbije (znovu zaplaceno 15. 9.).

---

## 4. Fronta práce

**0. Ilustrace k otázkám — průběžná práce**
12.–13. 9. dokončeny Německo+Rakousko, Itálie, Británie, Maďarsko, Švédsko, Francie,
Slovensko, Nizozemsko, Švýcarsko, Řecko, Bulharsko, Španělsko, Ukrajina, Rumunsko,
Thajsko, Turecko, Irsko, Izrael, Jižní Korea (všechny 100 %) a Malajsie 37/42.
**DOŠEL KREDIT GEMINI API** — pět malajsijských obrázků čeká na přegenerování.
Zadání pro **Pákistán (42), Portugalsko (42), Saúdskou Arábii (42) a Dánsko (42) jsou
hotová a po lintu**. Bez ilustrace je 1 207 otázek z 3 742.

**Přesné pořadí po dobití kreditu** (nic z toho nevyžaduje psát nová zadání):

```bash
node scripts/batch-irony-images.js submit --only my-t-vlajka,my-q-malacky-sultanat,my-q-nicol-david,my-q-batik-my,my-k-petronas-most
# az dobehne a je zkontrolovano:
node scripts/batch-irony-images.js submit --cc pk     # pak pt, sa, dk
```

Po každé zemi: `archy.js` + `rohy.js` → kontrola očima → opravy přes `--only` →
zápis do CLAUDE.md → `validate` + `test:offline` → commit + push.
**Skript sleduje jen JEDNU dávku najednou**, takže se země nedají posílat paralelně.

**0a. ⚠ DODĚLAT: každá země musí mít v každém pásmu aspoň 12 otázek** (zadal hráč 15. 9.)
Párty má od 15. 9. Maraton = **12 kol**, ale podlaha fondu je jen 10. Hráč u jedné země
pak dostane tutéž otázku dvakrát (appka to přizná hláškou, ale je to dluh, ne řešení).
Stav 15. 9.: **29 kombinací země × pásmo pod 12, chybí 50 otázek** — skoro vše dětské
pásmo (po 1–2 otázkách u 26 zemí), u puberťáků Brazílie, Japonsko, Thajsko a Tchaj-wan.
Seznam vypisuje `npm run validate` (upozornění „pod 12 otázek"). Psát ručně v session
jako 31. 8. (každá s `about` a `more_fact`), pak `build-index`, `build-konflikty`
(přes `npm run build-index`), `validate`, `test:offline`, a při nasazení `db:sync --remote`.
**Hotovo je to, až validate žádné upozornění „pod 12" nehlásí.**

**0b. UI drobnosti, které se nabízejí** (nic z toho není rozbité):
- Dlaždice kontinentů Severní Amerika, Jižní Amerika, Austrálie a Afrika se nedobarvovaly —
  sloužily jako barevný vzor při dobarvování ostatních. Kdyby se sjednocovalo dál, lokální skript na dobarvení (sytost
  jen u barevných míst, síla 0,25–1,0) je popsaný v CLAUDE.md pod 2026-09-15.
- Výsledková obrazovka sóla píše „Získal(a) jsi" — tvar „(a)" projde kontrolou rodu,
  ale čte se toporně. Kandidát na přepis bez rodu.

Pořadí dalších kroků je závazné — každý otevírá další. Plán celý viz artefakt
„Zeměkvíz do obchodů" (odkaz má hráč v chatu).

**A. Dopsat serverové otázky** (zbytek kroku 2)
Otázka s `"online_only": true` se nekopíruje na web a online hra ji losuje přednostně.
Dnes je jich nula. `npm run validate` to hlásí. Mechanismus je hotový (`npm run test:pool`).

**B. Právní vrstva** (krok 3, blokér obou obchodů)
Stránky jsou napsané a **od 11. 9. nasazené vědomě** (viz CLAUDE.md), kontakt
`ahoj@zemekviz.cz` ale pořád poštu nepřijímá — čeká na doménu.

**C. Instalovatelná appka** (krok 4, blokér obchodů)
Manifest, service worker, ikony. Dnes appka nemá ani jedno.

**D. Obaly, platby, provoz** (kroky 5–7)
Pozor: 184 MB ilustrací se do mobilního balíčku nevejde, obal je musí brát z webu.

**Otevřené drobnosti** (nízká priorita, všechny ověřené): odveta vloží soupeře bez jeho
vědomí; odchod z čekárny křížkem nechá hráče ve frontě; `join.js` nekontroluje
`game.status`; kontrast drobných textů a dotykové
cíle pod 44 px.

---

## 5. Rozhodnutí, která čekají na hráče

1. ~~**Dětské pásmo** — účty, nebo jen obtížnost?~~ **Rozhodnuto 2026-09-10: 13+, dětské pásmo jen obtížnost.**
2. **Reklama** ano/ne ve verzi zdarma. Doporučení: appka zdarma s omezeným online
   provozem + jednorázové odemčení, které vypne i reklamu; vedle toho školní licence.
3. **Další jazyky** — dnes je česky natvrdo všechno včetně otázek.
4. **Sloučit větev do `master`** (fast-forward) a **nasadit na produkci** — včetně
   `db:sync --remote` (viz bod 1).

---

## 6. Kde co hledat

| Chci vědět | Soubor |
|---|---|
| Konvence a všechna rozhodnutí | `CLAUDE.md` (čte se automaticky na startu) |
| Stav rozdělané práce, rozběhnutí | `docs/pokracovani.md` |
| Jak nasadit na produkci | `docs/nasazeni.md` |
| Jak funguje online režim | `docs/online-rezim.md` |
| Otevřené nálezy z auditů | `AUDIT_REPORT.md` + zápisy v CLAUDE.md |
| Obsahový dluh (duplicity, prozrazování) | `docs/obsahovy-dluh.md` |
| Jak se dělají ilustrace a kde se skončilo | `docs/predani-ilustrace.md` |
| Zdrojové Gemini obrázky pro UI | `D:\weigle\plocha\Kvíz_ILUSTRACE` (mimo repo) |
