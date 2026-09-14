# Předávací protokol

Pro novou session na jiném počítači. Sepsáno **7. září 2026**, po dlouhé session,
která končila u úprav skóre v hrací obrazovce. **Aktualizováno 13. 9. 2026 odpoledne**
při předávce po dvou dnech práce na ilustracích.

Tenhle soubor je **protokol**: co převzít, co ověřit, co je zakázané a co dělat
v jakém pořadí. Popisný stav projektu je v [pokracovani.md](pokracovani.md),
konvence a všechna rozhodnutí v [CLAUDE.md](../CLAUDE.md).

---

## 0. Čím začít novou session

Zkopíruj do prvního vzkazu:

> Pokračuju v projektu Zeměkvíz na druhém počítači. Přečti si
> `docs/predavaci-protokol.md`, proveď převzetí podle bodu 2 a řekni mi,
> jestli stav sedí. Pracuje se na větvi `claude/pokracujeme-e79708`.

### ⚠ Jediná věc, která teď blokuje práci: VYČERPANÝ KREDIT GEMINI

Generování ilustrací spadne na `429 prepayment credits are depleted`. **Hráč musí dobít
kredit na `ai.studio/projects`** — jinak se nedá vygenerovat ani jeden obrázek. Zadání
pro **4 země (168 otázek) jsou hotová, olintovaná a čekají jen na `submit`**, plus pět
malajsijských oprav. Podrobnosti v bodu 2 [predani-ilustrace.md](predani-ilustrace.md).

**Všechno ostatní je commitnuté a pushnuté** — na druhém počítači stačí `git pull`.

---

## 1. Předmět předání

| Položka | Hodnota |
|---|---|
| Repo | `github.com/Evzen652/vedomostni-hry` |
| Pracovní větev | `claude/pokracujeme-e79708` |
| Poslední commit | viz `git log` — tabulka se schválně neváže na konkrétní commit, stárla s každým |
| `master` | `65b35db` (10. 9.) — **napřed před produkcí**: obsahuje právní stránky, které se zatím nesmí nasadit |
| Produkce | `zemekviz.pages.dev`, nasazená **10. 9. 2026** z `03d314f` (zkratka na Česko, návod pod nadpisy) |
| Účtů v produkci | **1 živý hráč + 18 botů** (dřív se to psalo jako „19 účtů") — **nic se nesmí mazat** |

**Nasazeno 8. 9. 2026:** hodnocené hry z fronty, rychlý start, dělení fondu na veřejný
a serverový, bezpečnostní opravy (název turnaje, avatar, `token_epoch`, Three.js v repu, HSTS),
mazání profilu, hlášky u zablokovaných tlačítek, přetáčení skóre. Produkce i `master` tedy
**odpovídají větvi**; migrace doběhly po `2026-09-07-smazani-uctu` včetně (podrobnosti v CLAUDE.md
pod 2026-09-08).

**Stav 10. 9. 2026:** produkce běží z `03d314f`. `master` je napřed o právní stránky a změnu
na 13+ — ty se NESMÍ nasadit, dokud nebude doména (kontakt `ahoj@zemekviz.cz` zatím nepřijímá
poštu). Pracovní větev je napřed i před masterem. Skutečný stav vždy ověř přes `git log`
a `npx wrangler pages deployment list --project-name zemekviz`, ne podle téhle tabulky.

---

## 2. Převzetí — proveď a ohlas výsledek

Šest kroků. U každého je uvedeno, co má vyjít; když vyjde něco jiného, **nepokračuj
a řekni to**, protože se liší prostředí, ne kód.

```bash
git fetch && git checkout claude/pokracujeme-e79708
git log --oneline -1        # → docs: predavka pro pokracovani na jinem pocitaci
npm install
```

**1) `.dev.vars`** — negituje se, na novém počítači chybí. Vytvoř v kořeni:

```
ALLOW_DEV_SECRET=1
SESSION_SECRET=lokalni-test-tajemstvi-nepouzivat-v-produkci
GEMINI_API_KEY=<klíč z ai.studio, celý řádek>
```

**`GEMINI_API_KEY` je nutný pro generování ilustrací** — bez něj `batch-irony-images.js`
neudělá nic. Klíč má hráč na `ai.studio/projects`; **nový formát nezačíná „AIza"**,
skripty berou celý řádek. Do gitu se nikdy nesmí dostat (soubor je gitignorovaný
a v historii klíč nikdy nebyl).

**2) Lokální databáze:** `npm run db:init` → v `questions` má být **3 742** otázek
a **18** botů. Migrace se lokálně nepouštějí, `schema.sql` je má v sobě.

**3) Server:** `npm run dev` → `http://localhost:8788/hra` se vykreslí do vteřiny
a v síti se stáhnou **dva** soubory z `data/` (`fondy.json`, `questions-index.json`),
dohromady ~4,6 kB. Když se stahuje 56 souborů a 4,7 MB, běží starý kód.

**4) Testy bez serveru:**

| Příkaz | Očekávaný výsledek |
|---|---|
| `npm run validate` | `CHYBY: žádné` (upozornění o chybějících fotkách jsou v pořádku) |
| `npm run test:offline` | 853 kontrol |
| `npm run test:pool` | **13** kontrol (tabulka tu do 13. 9. chybně uváděla 8) |
| `npm run test:auth` | 12 kontrol |
| `npm run test:ghost` | 67 kontrol |
| `npm run test:expire` | 8 kontrol |
| `npm run lint-irony` | **0 chyb**, ~76 varování (varování jsou prověřený šum) |

**4b) Nástroje na ilustrace** (od 13. 9. v repu, viz `scripts/ilustrace/`):
`node scripts/ilustrace/archy.js kr 1` musí vyrobit arch do `.ilustrace/archy/`.
Když spadne na chybějícím `sharp`, chybí `npm install`.

**5) Testy proti serveru** (server musí běžet):
`$env:API_BASE="http://127.0.0.1:8788"; npm run test:api` → **167** kontrol.
Jedna kontrola („usazený hráč silou bota pohnul") je **nedeterministická**; když spadne
jednou z několika běhů, není to regrese. Druhá taková („body z kola proti botovi se
přičetly") padala v ~6 % běhů, protože testovací hráč tipoval vždy A — od 14. 9. v tom
kole odpovídá správně (`playAll(…, true)`), takže už padat nemá.

**6) Ruční zkouška v prohlížeči:** Sólo jízda → Evropa → Česko → Vybrat vše → Dospělí →
10 otázek → odpověz. Musí platit všechno z tohohle seznamu:
- na výběru zemí je nad zablokovaným tlačítkem věta „Klepni na zemi…",
- po odpovědi je vysvětlení a obě tlačítka **pod ilustrací**, ne v kartě,
- kolem ilustrace nejsou rozmazané pruhy (rám ji obepne),
- pod obrázkem svítí `+100 bodů` **bez hvězdy**,
- praporek vpravo nahoře se přetočí na nové skóre (v běžném okně, ne v nástroji).

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
   musí PROCHÁZET, než se mutuje. V téhle session „prošlo" pět mutací nepovšimnutě
   a pokaždé to odhalilo slepý test, ne bezpečný kód.
5. **Velká rozhodnutí se zapisují do CLAUDE.md hned**, jinak se příští session luští
   znovu (a v tomhle projektu se to už několikrát stalo).
6. **Paleta, rozměry a vzhled jsou území hráče.** Plošné změny (kontrast, dotykové
   cíle) se nabízejí, ne provádějí potichu.

---

## 4. Fronta práce

**0. Ilustrace k otázkám — průběžná práce**
12.–13. 9. dokončeny Německo+Rakousko, Itálie, Británie, Maďarsko, Švédsko, Francie,
Slovensko, Nizozemsko, Švýcarsko, Řecko, Bulharsko, Španělsko, Ukrajina, Rumunsko,
Thajsko, Turecko, Irsko, Izrael, Jižní Korea (všechny 100 % s vyřešenými defekty)
a Malajsie 37/42. **DOŠEL KREDIT GEMINI API — pět malajsijských obrázků čeká na
přegenerování; hráč musí dobít kredit na `ai.studio/projects`, pak stačí jeden
`submit --only`**, viz bod 2 v [predani-ilustrace.md](predani-ilustrace.md).
Zadání pro **Pákistán (42), Portugalsko (42), Saúdskou Arábii (42) a Dánsko (42) jsou
hotová a po lintu**, stačí je odeslat. Bez ilustrace je 1 207 otázek z 3 742.

**Přesné pořadí po dobití kreditu** (nic z toho nevyžaduje psát nová zadání):

```bash
node scripts/batch-irony-images.js submit --only my-t-vlajka,my-q-malacky-sultanat,my-q-nicol-david,my-q-batik-my,my-k-petronas-most
# az dobehne a je zkontrolovano:
node scripts/batch-irony-images.js submit --cc pk     # pak pt, sa, dk
```

Po každé zemi: `archy.js` + `rohy.js` → kontrola očima → opravy přes `--only` →
zápis do CLAUDE.md → `validate` + `test:offline` → commit + push.
**Skript sleduje jen JEDNU dávku najednou**, takže se země nedají posílat paralelně.

**Nástroje na kontrolu jsou od 13. 9. v repu** (`scripts/ilustrace/`), takže na novém
počítači fungují po `git pull` a `npm install`. Dřív ležely ve scratchpadu session.

Pořadí je závazné — každý krok otevírá další. Plán celý viz artefakt
„Zeměkvíz do obchodů" (odkaz má hráč v chatu).

**A. Dopsat serverové otázky** (zbytek kroku 2)
Otázka s `"online_only": true` se nekopíruje na web a online hra ji losuje přednostně.
Dnes je jich nula, takže online pořád losuje z otázek, jejichž odpovědi jsou veřejně
ke stažení. `npm run validate` to hlásí. Je to obsahová práce; mechanismus je hotový
a otestovaný (`npm run test:pool`).

**B. Právní vrstva** (krok 3, blokér obou obchodů)
Podmínky, zásady zpracování údajů, veřejná stránka pro žádost o smazání účtu (v appce
už mazání je), souhlasy pro EU a iOS.
**Rozhodnuto 2026-09-10: appka je 13+, dětské pásmo zůstává jen jako obtížnost.**
Stránky jsou napsané (`podminky.html`, `soukromi.html`, `smazani-uctu.html`), ale
**nenasazené**, protože kontakt `ahoj@zemekviz.cz` a doručovatel e-mailů čekají na doménu.
Registrace je od 2026-09-10 jen 13+ s potvrzením a IP adresy z limitu registrací se mažou,
takže zbytek stránek už pravdu říká. Podrobně CLAUDE.md pod 2026-09-10.

**C. Instalovatelná appka** (krok 4, blokér obchodů)
Manifest, service worker, ikony. Dnes appka nemá ani jedno, takže fakticky není appka,
ale stránka — a Apple pouhý obal webu odmítá.

**D. Obaly, platby, provoz** (kroky 5–7)
Pozor: 184 MB ilustrací se do mobilního balíčku nevejde, obal je musí brát z webu.

**Otevřené drobnosti** (nízká priorita, všechny ověřené): odveta vloží soupeře bez jeho
vědomí; odchod z čekárny křížkem nechá hráče ve frontě; `join.js` nekontroluje
`game.status`; `applyRotation()` není na `resize`; kontrast drobných textů a dotykové
cíle pod 44 px.

---

## 5. Rozhodnutí, která čekají na hráče

1. ~~**Dětské pásmo** — účty, nebo jen obtížnost?~~ **Rozhodnuto 2026-09-10: 13+, dětské pásmo jen obtížnost.**
2. **Reklama** ano/ne ve verzi zdarma. Doporučení: appka zdarma s omezeným online
   provozem + jednorázové odemčení, které vypne i reklamu; vedle toho školní licence.
3. **Další jazyky** — dnes je česky natvrdo všechno včetně otázek. Když se s tím počítá,
   je mnohem levnější připravit strukturu teď.
4. **Sloučit větev do `master`** (fast-forward) a **nasadit na produkci**.

---

## 6. Kde co hledat

| Chci vědět | Soubor |
|---|---|
| Konvence a všechna rozhodnutí | `CLAUDE.md` (čte se automaticky na startu) |
| Stav rozdělané práce, rozběhnutí | `docs/pokracovani.md` |
| Jak nasadit na produkci | `docs/nasazeni.md` |
| Jak funguje online režim | `docs/online-rezim.md` |
| Otevřené nálezy z auditů | `AUDIT_REPORT.md` + zápisy v CLAUDE.md |
| Jak se dělají ilustrace a kde se skončilo | `docs/predani-ilustrace.md` |
