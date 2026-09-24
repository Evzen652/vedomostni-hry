# Předávací protokol

Pro novou session (i na jiném počítači). Sepsáno **7. září 2026**, **naposledy aktualizováno
24. 9. 2026** po session, která dokončila skoro celý ilustrační dluh appky (Severní Korea,
Egypt, Čína, Japonsko, Polsko) a přidala dvě UI vylepšení k otázce (bublina hostitele,
vlajka na glóbu).

Tenhle soubor je **protokol**: co převzít, co ověřit, co je zakázané a co dělat
v jakém pořadí. Popisný stav projektu je v [pokracovani.md](pokracovani.md),
konvence a všechna rozhodnutí v [CLAUDE.md](../CLAUDE.md).

---

## 0. Čím začít novou session

Zkopíruj do prvního vzkazu:

> Pokračuju v projektu Zeměkvíz. Přečti si `docs/predavaci-protokol.md`, proveď převzetí
> podle bodu 2 a řekni mi, jestli stav sedí. Pracuje se na větvi `claude/pokracujeme-e79708`.

**Pozor na worktree:** nová session často startuje v čerstvém worktree na jiné, starší větvi.
Nejdřív `git fetch` a posunout se na `origin/claude/pokracujeme-e79708` (fast-forward),
teprve pak cokoli ověřovat.

### Ilustrace k otázkám: ZBÝVÁ JEN 7 OTÁZEK (všechny české), zadání hotová, čekají na kredit

24. 9. dokončeny Severní Korea, Egypt, Čína, Japonsko a Polsko (všechny 100 %) — z **3 742**
otázek fondu zbývá bez ilustrace **jen 7**, všechny z Česka: `cz-q-macocha-pojmenovani`,
`cz-q-hasek-dominator-prezdivka`, `cz-q-nejdelsi-ceske-slovo`, `cz-q-vestonicka-venuse-dospeli`,
`cz-t-navratilova-wimbledon-2`, `cz-k-ctyrlistek-komiks`, `cz-k-zdrobneliny-naklonnost`.

**Všech 7 už má napsané `irony_prompt`, `npm run lint-irony` na nich hlásí 0 chyb** — žádné
psaní zadání není potřeba, jen odeslat dávku. **Kredit Gemini API je ale ZASE vyčerpaný**
(402 „prepayment credits are depleted", ověřeno 24. 9. při pokusu o tuhle poslední dávku) —
**hráč musí dobít na `ai.studio/projects`**. Klíč `GEMINI_API_KEY` je v `.dev.vars` (negituje
se, na jiném počítači/worktree chybí a musí se vložit znovu).

**Jakmile je dobito, tohle je úplně poslední krok celého ilustračního dluhu appky:**
```bash
node scripts/batch-irony-images.js submit --only cz-q-macocha-pojmenovani,cz-q-hasek-dominator-prezdivka,cz-q-nejdelsi-ceske-slovo,cz-q-vestonicka-venuse-dospeli,cz-t-navratilova-wimbledon-2,cz-k-ctyrlistek-komiks,cz-k-zdrobneliny-naklonnost
```
Pak jako u každé jiné země: počkat na dávku (`node scripts/ilustrace/cekej-davka.js` na
pozadí), `fetch`, zkontrolovat archy/rohy/výřezy očima, případné vady opravit přes
`--only`, zapsat do CLAUDE.md, `validate` + `test:offline`, commit + push. **Postup krok za
krokem je v [predani-ilustrace.md](predani-ilustrace.md)**, pravidla psaní zadání pro
DALŠÍ novou zemi (pokud by nějaká přibyla) v jeho bodu 5. Všechny pomocné skripty jsou
v `scripts/ilustrace/`.

**Tahle session navíc přidala dvě UI vylepšení k otázce** (obojí hotové, commitnuté a
pushnuté, viz CLAUDE.md 2026-09-24 pro detaily):
- **Bublina hostitele (`say()`) je větší, hravější a na mobilu se už neschovává** — dřív
  mizela pod `display:none`, což mazalo i verdikty a hlášky během hry, ne jen uvítání.
- **Glóbus u otázky má místo holé tečky vlajku dané země**, která přeletí přes glóbus
  zleva doprava a s malým dopadem (rázová vlna + trknutí glóbu) přistane přesně na místě.

**Produkce je pořád na `0dfa574` (16. 9.).** Od té doby přibylo na větvi jen obsahové
a UI: ilustrace, `irony_prompt` v datech, bublina hostitele, vlajka na glóbu, dokumentace
a skripty — **žádná migrace databáze**. Nasazení je rozhodnutí hráče; kdyby padlo, stačí
`db:sync` + `npm run deploy` podle nasazeni.md (kód i obsah se změnily, takže obojí).

Ilustrace do UI (dlaždice, výsledkové obrazovky) jdou i bez klíče: hráč je vygeneruje
v chatu Gemini a uloží do `D:\weigle\plocha\Kvíz_ILUSTRACE`, session je jen zmenší
a napojí (postup viz CLAUDE.md, zápis 2026-09-15).

**Všechno je commitnuté a pushnuté** — stačí `git pull`. **Dev server na konci session
NEBĚŽÍ** (je potřeba ho po převzetí spustit znovu, viz bod 2/3 níž) — to je normální stav
mezi sezeními, ne chyba.

---

## 1. Předmět předání

| Položka | Hodnota |
|---|---|
| Repo | `github.com/Evzen652/vedomostni-hry` |
| Pracovní větev | `claude/pokracujeme-e79708` — poslední commit viz `git log` |
| `master` | `0dfa574` (16. 9.) — srovnaný s pracovní větví k nasazení; další commity už jsou jen na větvi |
| Produkce | `zemekviz.pages.dev`, nasazená z **`0dfa574`** 16. 9. (včetně `db:sync --remote`, viz CLAUDE.md) |
| Účtů v produkci | **1 živý hráč + 18 botů** — **nic se nesmí mazat** |

**Co je na větvi a NENÍ na produkci:** zjistíš `git log --oneline 0dfa574..HEAD`.
Když mezi tím přibyly změny textů otázek, je při nasazení nutný `db:sync` (online hra
čte otázky z D1). Pořadí a pasti v [nasazeni.md](nasazeni.md). Sloučení do `master`
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

**0. Ilustrace k otázkám — SKORO HOTOVO, zbývá 7 otázek**
24. 9. dokončeny Severní Korea, Egypt, Čína, Japonsko, Polsko (100 %). Bez ilustrace zbývá
**jen 7 otázek, všechny české**, se zadáním už napsaným a zlintovaným — viz bod 0 výš pro
přesný seznam id a příkaz k odeslání. **Jediná překážka je vyčerpaný kredit Gemini.**

Po dobití kreditu a odeslání téhle poslední dávky: `archy.js` + `rohy.js` → kontrola
očima → opravy přes `--only` → zápis do CLAUDE.md → `validate` + `test:offline` →
commit + push. **Tím je ilustrační dluh appky kompletně u konce (3 742/3 742).**
**Skript sleduje jen JEDNU dávku najednou**, takže se země nedají posílat paralelně.

**Past, na kterou appka narazila opakovaně: commit po opravě zadání musí sáhnout i po
`data/questions/xx.json`, ne jen po `img/`** — víckrát se stalo, že oprava `irony_prompt`
zůstala jen na disku a commitly se jen nové obrázky. Než commitovat, zkontrolovat `git status`.

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
