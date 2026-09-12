# Předávací protokol

Pro novou session na jiném počítači. Sepsáno **7. září 2026**, po dlouhé session,
která končila u úprav skóre v hrací obrazovce.

Tenhle soubor je **protokol**: co převzít, co ověřit, co je zakázané a co dělat
v jakém pořadí. Popisný stav projektu je v [pokracovani.md](pokracovani.md),
konvence a všechna rozhodnutí v [CLAUDE.md](../CLAUDE.md).

---

## 0. Čím začít novou session

Zkopíruj do prvního vzkazu:

> Pokračuju v projektu Zeměkvíz na druhém počítači. Přečti si
> `docs/predavaci-protokol.md`, proveď převzetí podle bodu 2 a řekni mi,
> jestli stav sedí. Pracuje se na větvi `claude/pokracujeme-e79708`.

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
```

**2) Lokální databáze:** `npm run db:init` → v `questions` má být **3 742** otázek
a **18** botů. Migrace se lokálně nepouštějí, `schema.sql` je má v sobě.

**3) Server:** `npm run dev` → `http://localhost:8788/hra` se vykreslí do vteřiny
a v síti se stáhnou **dva** soubory z `data/` (`fondy.json`, `questions-index.json`),
dohromady ~4,6 kB. Když se stahuje 56 souborů a 4,7 MB, běží starý kód.

**4) Testy bez serveru:**

| Příkaz | Očekávaný výsledek |
|---|---|
| `npm run validate` | `CHYBY: žádné` (upozornění o chybějících fotkách jsou v pořádku) |
| `npm run test:offline` | 842 kontrol |
| `npm run test:pool` | 8 kontrol |
| `npm run test:auth` | 12 kontrol |
| `npm run test:ghost` | 67 kontrol |
| `npm run test:expire` | 8 kontrol |

**5) Testy proti serveru** (server musí běžet):
`$env:API_BASE="http://127.0.0.1:8788"; npm run test:api` → **167** kontrol.
Jedna kontrola („usazený hráč silou bota pohnul") je **nedeterministická**; když spadne
jednou z několika běhů, není to regrese.

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
Německo a Rakousko dokončeny (12. 9., 130/130). Další v pořadí je Itálie (81) — zadání
zatím nenapsaná. Celý postup, nástroje na kontrolu a pasti jsou v
[predani-ilustrace.md](predani-ilustrace.md). Bez ilustrace je 2 268 otázek z 3 742.

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
