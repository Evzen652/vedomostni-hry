# Předávací protokol

Pro novou session (i na jiném počítači). Sepsáno **7. září 2026**, **naposledy aktualizováno
25. 9. 2026** po session, která opravila drobný bug (bublina hostitele v párty), odhalila
a uzavřela DRUHÝ ilustrační dluh (202 otázek mělo starou fotorealistickou ilustraci místo
malované), opravila zbytečné 404 pro 6 zemí bez karet a podruhé dorovnala podlahu fondu
na 12 otázek/pásmo (Maraton má od 15. 9. 12 kol) — 50 nových otázek napříč 25 zeměmi.
Fond je teď **3 792 otázek, všechny s malovanou ilustrací, 0 chybí.**

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

### Ilustrace k otázkám: HOTOVO NADRUHÉ. 3 792/3 792, 0 chybí, VŠECHNY malované.

24. 9. appka dosáhla „3742/3742 má obrázek" — jenže 25. 9. hráč ukázal screenshotem, že
jedna otázka má pořád STAROU FOTOREALISTICKOU ilustraci, ne malovanou. Ukázalo se, že
**202 otázek** (import z Hricka — Kanada 69, Česko 55, KLDR 23, Rusko 22, Polsko 15, zbytek
roztroušeně) mělo `img/{id}.jpg` existující, ale bez `irony_prompt` — appka roky počítala
„má soubor" za „hotovo", což byla mezera v kontrole, ne v obsahu. Přepsáno (6 paralelních
agentů napsalo prompty, jedna velká dávka), zkontrolováno (21 vad z 202, opraveno), a hned
za tím se dorovnala **podruhé i podlaha fondu** (12 otázek/pásmo kvůli Maratonu — 50 nových
otázek, 25 zemí, 2 vady z 50). **Postup a všechny objevené pasti jsou v CLAUDE.md
2026-09-25** (dvě dlouhé položky nahoře logu) — nové vzorce: špatné pohlaví reálné osoby,
římské číslice místo arabských, halucinovaný švýcarský kříž na dresu/v davu (potvrzeno
už 3×), slovo „taxi"/„sign" v zadání vyrobí čitelný nápis i přes výslovný zákaz.

**Žádná další práce na ilustracích ani na podlaze fondu není naplánovaná.** Kdyby přibyla
nová země/otázka, postup psaní zadání je v [predani-ilustrace.md](predani-ilustrace.md)
bodu 5, nástroje v `scripts/ilustrace/`. **Past, na kterou appka narazila opakovaně:**
`npm run build-index` (přepočet `data/questions-index.json` a `data/konflikty.json`)
**nesmí běžet souběžně ve víc agentech/procesech** — přepisují stejný soubor; spouštět
centrálně jednou po dokončení všech paralelních zápisů.

**Tahle session navíc opravila dva drobné nálezy** (obojí hotové, commitnuté a pushnuté):
- **Bublina hostitele v párty se dotýkala praporků hráčů** (0 px mezera) — mobilní oprava
  z 24. 9. zvedla padding jen u `.qz-top` (sólo), ne u `.qz-scoreboard` (párty verze téže
  věci). Viz CLAUDE.md 2026-09-24 (druhý zápis od vrchu).
- **6 zemí bez `data/cards/{cc}.json`** (Belgie, Dánsko, Finsko, Irsko, Norsko, Portugalsko)
  appka zbytečně stahovala při každém výběru víc zemí → 404 v konzoli. `quiz.js` má nový
  `BEZ_KARET` seznam, `validate` hlídá, ať se nerozejde s realitou na disku.

**Produkce je pořád na `0dfa574` (16. 9.).** Od té doby přibylo na větvi jen obsahové
a UI: ilustrace (KOMPLETNÍ FOND, teď i stylově sjednocený), `irony_prompt` v datech,
50 nových otázek, bublina hostitele (2×), vlajka na glóbu, `BEZ_KARET`, dokumentace
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

**2) Lokální databáze:** `npm run db:init` → v `questions` má být **3 792** otázek
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

**0. Ilustrace k otázkám — HOTOVO NADRUHÉ (3 792/3 792, 0 chybí, VŠECHNY malované). Bod
odstraněn z fronty.** 25. 9. dořešen druhý ilustrační dluh (202 otázek se starou fotkou
místo malované ilustrace) i druhé dorovnání podlahy fondu (+50 otázek). Kdyby v budoucnu
přibyla nová otázka nebo země, postup je popsaný v [predani-ilustrace.md](predani-ilustrace.md)
a nástroje v `scripts/ilustrace/`.

**Past, na kterou appka narazila opakovaně: commit po opravě zadání musí sáhnout i po
`data/questions/xx.json`, ne jen po `img/`** — víckrát se stalo, že oprava `irony_prompt`
zůstala jen na disku a commitly se jen nové obrázky. Než commitovat, zkontrolovat `git status`.

**0a. Podlaha fondu (12 otázek/zemi × pásmo) — HOTOVO NADRUHÉ.** Zadal hráč 15. 9., poprvé
dorovnáno týž den, ale appka mezitím dál rostla o nové otázky a podlaha se propadla znovu —
25. 9. znovu **29 kombinací pod 12, chybělo přesně 50**, dorovnáno stejným postupem
(paralelní agenti, `about` + `more_fact` + `irony_prompt` u každé nové otázky). Kdyby se
podlaha propadla potřetí (přibude-li dost nových otázek bez rovnoměrného rozložení mezi
pásma), postup je zdokumentovaný v CLAUDE.md 2026-09-25 a 2026-08-31.

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
