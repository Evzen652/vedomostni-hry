# Audit projektu Zeměkvíz — 2026-09-03

## Rozsah a metoda

Prošel jsem celý repozitář: `functions/` (32 souborů), `quiz.js` (~3 500 řádků),
`online.js` (~1 400), `quiz.css` (~1 100), `scripts/` (52), data, migrace, build
a nasazení, plus živou produkci.

**Nic jsem nezměnil.** Ani jeden soubor appky, ani databáze, ani nasazení. Zadání
říkalo opravovat autonomně, ale poslední pokyn („nedělej nic, co by mohlo ovlivnit
chod a logiku aplikace, když tak napiš jen návrh") je novější a konkrétnější, takže
platí on. Jediný nový soubor je tenhle report — do `dist/` se nekopíruje
(`build-public.js` bere jen vyjmenované soubory), takže se na web nedostane.

**Standard ověřování.** Projekt má v CLAUDE.md tvrdé pravidlo, že auditní agenti
hlásí i teoretická rizika, která neplatí. Použil jsem tři paralelní agenty na
šířku, ale **každý nález uvedený níž jako potvrzený jsem si sám dohledal v kódu.**
Co jsem neověřil, je označené. Co je jen teoretické, je označené taky.

**Tři nálezy jsou vada mojí vlastní práce z posledních dvou dnů.** Jsou označené
🔴 a mrzí mě to; patří na začátek, ne na konec.

---

## STAV OPRAV (aktualizováno 2026-09-03)

Audit vznikl jako čtení; pak jsem na pokyn opravil bezpečné věci ve třech vlnách.
**Vše níže je nasazené na produkci a otestované.**

**HOTOVO — dávka 1 (layout a moje chyby):** přetečení výběru pásma i témat
(nedosažitelné volby), `user-scalable=no`, `qz-school` do online, `cc` do SELECTu, CI.

**HOTOVO — dávka 2 (bezpečnost):** atomické rate limity (`limitUctu`/`limitIp`),
limit na všech čtyřech cestách zakládajících hru, `TC_NAMES` proti prototypové díře,
zámek přihlašování se prodlužuje místo nulování, pásmo turnajů z účtu, `_middleware.js`.

**HOTOVO — dávka 3 (klient, přístupnost, dokumentace, úklid):**
párty tlačítko „Konec"/„Další otázka", `flagStamp(null)` guard, `refreshMe` (5 míst),
síťová chyba místo prázdna na 3 obrazovkách, pořadí guardu v `submit()`, závod při
rušení hledání; kontrast `--muted` na AA, 8 `<label for>`, aria-label u párty jména,
klávesová dostupnost přepínače a položky rozehrané hry; README, `sharp` do devDeps,
oprava tvrzení o `admin.html`; smazán prokazatelně mrtvý kód (3 JS + 12 CSS pravidel).

**HOTOVO — dávka 4 (další bezpečné serverové body):** turnajové body se připisují jen
dokud turnaj běží; `DELETE`/`POST /api/match` už neztratí spárovanou hru (helper
`matchedResponse` + reakce klienta); denní pětka má deterministické id + `INSERT OR
IGNORE`, takže souběh nezaloží dvě hry (ověřeno živě).

**HOTOVO — obnova PINu (rychlá půlka):** produkce už neloguje převzímací odkaz s e-mailem
a uživateli říká pravdu („obnova e-mailem zatím není v provozu"). Token se bez pošty
vůbec negeneruje. **Plná půlka (skutečné doručování) pořád ČEKÁ na doménu** — viz níž.

**ZBÝVÁ — vyžaduje TVOJE rozhodnutí (viz Fáze 5 níž):**
1. **Obnova PINu — doručování** — kód je hotový a bezpečný, ale poslat mail jde až
   s vlastní doménou (SPF/DKIM) a `RESEND_API_KEY`. Do té doby obnova e-mailem neběží.
2. **Veřejné odpovědi** — architektonické rozhodnutí (rozdělit fond, nebo odlehčit žebříčky).
3. **Odveta a expirace** — mění zapsané pravidlo „bez kontumace".

**ZBÝVÁ — bezpečné, ale zatím neuděláno (nižší priorita):**
- `GET /api/game/:id` spadne na 500 u zmizelé otázky — `_middleware.js` to teď zabalí do JSON, ale hezčí by byl guard v handleru.
- Modal „Rozehrané hry" nemá past na fokus; aria-pressed u výběrových dlaždic.
- Úklid 18 importních skriptů a 27 osiřelých obrázků.

---

## Souhrn nejzávažnějších nálezů

| # | Nález | Závažnost | Stav |
|---|---|---|---|
| 1 | **Výběr pásma na telefonu přeteče a „Dospělí" nejde vybrat** | vysoká | změřeno + screenshot |
| 2 | **Výběr témat na tabletu ořízne dvě z deseti témat** | vysoká | změřeno + screenshot |
| 3 | Obnova PINu v produkci nefunguje a odkaz i s e-mailem padá do logů | vysoká | ověřeno na produkci |
| 4 | 🔴 Rate limit pokrývá 1 ze 4 cest, které zakládají hru | vysoká | ověřeno |
| 5 | 🔴 `checkRateLimit` není atomický — souběh limit obejde | vysoká | ověřeno v kódu |
| 6 | Odveta bez limitu umí vyrábět hodnocené výhry a srážet cizí rating | vysoká | řetězec ověřen v kódu |
| 7 | Správné odpovědi jsou veřejně na webu | vysoká | ověřeno stažením |
| 8 | Zakázané přiblížení stránky (`user-scalable=no`) | střední | ověřeno |
| 9 | Validace `time_control` prochází přes prototyp → trvale rozbitý turnaj | střední | ověřeno spuštěním |
| 10 | Zámek přihlašování se při zamčení nuluje | střední | ověřeno |
| 11 | Dětské turnaje jsou čitelné z cizího pásma | střední | ověřeno |
| 12 | Třída `qz-school` přetéká do online režimu | střední | ověřeno |
| 13 | Tlumený text nesplňuje kontrast AA (4,15:1 místo 4,5:1) | střední | spočítáno |
| 14 | Formulářová pole nemají `<label>` (v celé appce jich je 0) | střední | ověřeno |
| 15 | 🔴 `cc` se posílá klientovi, ale není v `SELECT`u | nízká | ověřeno |

---

## Fáze 1 — architektura a závislosti

**Co je v pořádku a stojí za zmínku:** nula běhových závislostí, jediná vývojová
(`wrangler`), `npm audit` bez nálezu. Migrace se neliší od `schema.sql` a **produkční
schéma sedí na 100 %** (17 tabulek, ověřeno dotazem). Integrita dat je bez chyby:
0 duplicitních id, 0 případů správné odpovědi mezi distraktory, 0 prázdných polí,
všech 3 742 otázek má pole `about`.

### 1.1 `sharp` je nedeklarovaná závislost
`scripts/gen-irony-images.js` a `scripts/batch-irony-images.js` ho vyžadují, ale
v `package.json` není. Funguje jen proto, že ho tahá **miniflare** jako tranzitivní
závislost wrangleru. Jakmile wrangler miniflare povýší a ta sharp přestane
potřebovat, generování obrázků spadne na nesrozumitelné `MODULE_NOT_FOUND`.
**Návrh:** přidat `sharp` do `devDependencies`.

### 1.2 Žádné CI
Existuje sedm kontrolních skriptů (`validate`, `audit`, `test:offline`, `test:api`,
`lint-irony`, `lint-facts`, `sim-online`), ale pouštějí se ručně. Dnes jsem si sám
rozbil `quiz.js` zpětným apostrofem v komentáři uvnitř template literalu a appka
přestala jít vykreslit — `node --check` to odhalí za setinu sekundy.
**Návrh:** GitHub Action na push: `node --check` na `quiz.js`/`online.js`,
pak `validate` + `test:offline`. Obojí běží bez sítě a bez databáze.

### 1.3 README je zastaralý natolik, že podle něj appka nefunguje
Říká „spusť `npx http-server -p 8777`". Statický server neobsluhuje `/api/*`, takže
**celý online režim je mrtvý** — Světová liga, denní pětka, turnaje, přátelé,
žebříček. Nezmiňuje `online.js`, `functions/`, D1, `npm run dev`, `npm run deploy`
ani testy. U ilustrací posílá na pollinations.ai, kterou projekt opustil (CLAUDE.md
2026-08-28: vtip z promptu vynechává).

### 1.4 CLAUDE.md tvrdí nepravdu o `admin.html`
Zápis z 2026-08-24 říká: „`admin.html` neexistuje a nikdy v repu nebyl — ověřeno
přes `git log --all`". Soubor je **verzovaný**, má 333 řádků a přibyl v commitu
`b6e4bb9`. `scripts/audit-questions.js` na něj odkazuje.

### 1.5 Zbytky v repu
- **18 jednorázových importních skriptů** (`import-cz-gemini.js`, `import-at-claude.js`
  a spol.), dohromady **5 102 řádků**, které už doběhly. `package.json` odkazuje jen
  na `import-questions.js`, `import-images.js`, `import-audio.js` — na tyhle ne.
- `scripts/_tmp-scope.js` (29 řádků) — pracovní skript se jménem, které samo přiznává,
  že tam nemá být.
- **27 osiřelých obrázků** v `img/` (0,5 MB), které se nasazují, ale žádná otázka je
  nemá. `validate` je hlásí.

---

## Fáze 2 — logika a tok

### 🔴 2.1 Rate limit pokrývá jednu ze čtyř cest (vysoká)
Limit `game_tries`, který jsem přidal 2026-09-02, je **jen v `functions/api/game/index.js`**.
Hru ale zakládají další tři endpointy, všechny bez limitu:

| soubor | `checkRateLimit` |
|---|---|
| `functions/api/game/index.js` | ano |
| `functions/api/game/[id]/rematch.js` | **ne** |
| `functions/api/tournament/[id]/bot.js` | **ne** |
| `functions/api/tournament/[id]/play.js` | **ne** |

Nejlevnější zneužití je turnajový bot: založím turnaj (5/hod stačí) a pak ve smyčce
volám `POST /api/tournament/{id}/bot`. Každé volání založí řádek v `games`, dva
v `game_players`, **deset v `game_answers`** (bot odehraje kolo hned) a deset
v `seen_questions` — a nemusím odpovědět na jedinou otázku. To je přesně scénář,
kvůli kterému limit vznikl.

**Návrh:** vytáhnout `zkusZalozitHru(env, me)` a volat ji ze všech čtyř míst.

### 🔴 2.2 `checkRateLimit` není atomický (vysoká)
`functions/_lib/game.js` — funkce dělá `SELECT` → rozhodnutí → `UPDATE` bez
transakce a bez podmínky v `WHERE`:

```js
const stav = await ziskej();
const pokusu = vOkne ? (stav?.tries || 0) : 0;
if (pokusu >= max) return false;
await uloz(pokusu + 1, …);
```

Dvě stě souběžných požadavků přečte stejnou hodnotu a všech dvě stě projde. Limit
se tím mění z „N pokusů za hodinu" na „N **dávek** za hodinu, každá libovolně velká".
Týká se registrace, her, turnajů i hádání friend_code (`friends.js` má tentýž vzor
ručně).

**Poctivá výhrada:** ověřil jsem **tvar kódu**, ne exploit. CLAUDE.md sám
(2026-09-01) dokládá, že souběh se přes lokální wrangler vynutit nedá, protože se
požadavky serializují. Na skutečném edge Cloudflare je to jinak, ale nedokázal jsem
to. Zápis z 2026-09-02 tvrdí „ověřeno trojím způsobem" — všechny tři způsoby byly
sekvenční, takže tuhle třídu chyby minuly.

**Návrh:** jeden atomický `UPDATE … WHERE (okno vypršelo OR tries < max)` a rozhodovat
podle `meta.changes`. Stejný vzor, jaký projekt použil u `settle.js` 2026-09-01.

### 2.3 Odveta umí vyrobit hodnocené výhry a srazit cizí rating (vysoká)
`functions/api/game/[id]/rematch.js` zakládá hru s `rated = 1` a **rovnou do ní vloží
oba hráče** (slot 0 i slot 1), bez limitu a bez souhlasu soupeře. Stačí jedna
dohraná hra proti hráči B kdykoli v minulosti; pak ve smyčce volám rematch, každou
hru si sám odehraju a B se nikdy nepřipojí. Po 48 hodinách `expireStaleGames`
dopíše `finished_at` a hra se vyrovná „podle bodů" — moje skóre proti nule — takže
se zapíše **hodnocená výhra mně a prohra jemu**.

Rozhodnutí „žádná kontumace" (2026-09-01) bylo správné pro hráče, který začal hrát
a odešel. Tady ale soupeř hru nikdy neviděl.

**Návrh:** hru, kde jeden hráč nevyžádal ani jednu otázku (prázdné `q_served`), při
expiraci **zrušit, ne vyrovnat**. Plus limit na odvety a nejvýš jedna neuzavřená
odveta na dvojici.

### 2.4 Obnova PINu je v produkci mrtvá a přitom prosakuje (vysoká)
Ověřeno na produkci: `wrangler pages secret list` vrací **jediné tajemství —
`SESSION_SECRET`**. Chybí `RESEND_API_KEY` i `MAIL_FROM`. `functions/_lib/mail.js`
proto jde do větve, která e-mail neodešle a místo toho zaloguje:

```js
console.log('[mail] NEODESLÁNO … Odkaz pro ' + email + ': ' + resetUrl);
```

Dvojí dopad:
1. **Funkční:** kdo zapomene PIN, o účet přijde — přesně to, čemu měla funkce
   zabránit (rozhodnutí 2026-08-25). Uživateli se přitom zobrazí, že odkaz odešel.
2. **Bezpečnostní:** do logů nasazení se zapisuje plnohodnotný převzímací odkaz
   spárovaný s e-mailovou adresou. Kdo má přístup k logům, má přístup k účtům.

**Návrh:** buď doplnit poštu, nebo do té doby logovat jen otisk tokenu a uživateli
říct pravdu („obnova e-mailem zatím není v provozu").

### 2.5 Správné odpovědi jsou veřejně na webu (vysoká, známé)
Ověřeno stažením z produkce: `https://zemekviz.pages.dev/data/questions/cz.json`
vrací **964 otázek i s polem `answer`**, 1,7 MB, bez přihlášení. CLAUDE.md to vede
jako otevřený bod; tady je to poprvé doložené na ostré adrese.

Server sám odpovědi nevydává správně (ověřeno: `q/[n].js` posílá jen zamíchané
možnosti, `answer` ani `correct_index` v payloadu nejsou) — jenže offline hra
potřebuje tentýž fond veřejně. Dokud to platí, je jakýkoli žebříček ozdoba.

### 2.6 Validace `time_control` prochází přes prototyp (střední)
Ověřeno spuštěním:

```
TIME_CONTROLS["constructor"] → PRAVDIVE (function) → kontrola !tc PROJDE
```

Kontrola `const tc = TIME_CONTROLS[tcName]; if (!tc) return fail(...)` tedy pustí
`"constructor"`, `"__proto__"`, `"toString"`. Pak se čte `tc.count` (`undefined`),
což jde do `LIMIT ?` a D1 skončí chybou.

Horší je turnajová varianta: `POST /api/tournament {"time_control":"constructor"}`
validaci projde a hodnota se **uloží do `tournaments.time_control`**. Turnaj se
zobrazí všem v pásmu a každému, kdo do něj vstoupí, vrací chybu. Jedním požadavkem
vznikne trvale rozbitá položka v seznamu.

**Návrh:** `BANDS.includes(band)` je v projektu už použitý správný vzor — udělat
totéž: `const TC_NAMES = Object.keys(TIME_CONTROLS)` a `TC_NAMES.includes(tcName)`.

### 2.7 Zámek přihlašování se při zamčení nuluje (střední)
`functions/api/auth/login.js` — při dosažení limitu se zapisuje `login_fails = 0`:

```js
.bind(lock ? 0 : fails, lock, user.id)
```

Po vypršení desetiminutového zámku má útočník znovu plných 8 pokusů. Trvalá
propustnost ~48 pokusů za hodinu donekonečna, bez zpomalování. Komentář ve
`friends.js` i v `schema.sql` tuhle slabinu **výslovně popisuje** jako důvod, proč
se tam zvolilo klouzavé okno — v `login.js` opravená nikdy nebyla.

### 2.8 Dětské turnaje jsou čitelné z cizího pásma (střední)
`functions/api/tournament/index.js` bere pásmo z **URL parametru**:

```js
const band = new URL(request.url).searchParams.get('band') || me.band;
```

Pro srovnání, `daily/index.js` i `game/index.js` mají `const band = me.band` —
narovnalo se to vědomě 2026-08-31. Turnaje zůstaly. Detail turnaje
(`tournament/[id]/index.js`) pásmo nekontroluje vůbec a vrací přezdívky, skóre
i aktivitu všech účastníků.

**Zmírnění:** dětské přezdívky jsou generované, takže totožnost neprozrazují —
proto střední, ne vysoká. Obchází to ale rozhodnutí, kvůli kterému se zavíral
dětský žebříček.

### 2.9 Třída `qz-school` přetéká do online režimu (střední)
Ověřeno: `.qz-school` se přidává v `startSchool()`, ale odebírá jen ve `startGame()`,
`startParty()` a `resumeSave()`. **`close()` ani `renderModePick()` ji neodeberou.**

CSS `.qz-school` upravuje `.qz-q`, `.qz-a`, `.qz-meta`, `.qz-picframe` — což jsou
přesně třídy, které online režim recykluje. Po sekvenci *škola → „×" → Světová liga*
se tedy online otázka vykreslí v promítacím písmu (otázka až 40 px). Offline se to
neprojeví, protože sólo i párty třídu při startu sundají.

### 2.10 Další ověřené klientské nálezy (nízká–střední)
- **`req("/me")` bez kontroly stavu** na pěti místech v `online.js`. Při 5xx je
  `body` `null`, `S.me = null` a `renderLobby()` spadne na `S.me.ratings`. Hráč
  zůstane na mrtvé obrazovce bez hlášky.
- **`flagStamp(S.sel && S.sel.cc)` bez ochrany na `null`** na třech místech
  (školní start, párty setup 2×). Oprava z 2026-09-01 je minula → 404 na
  `assets/country-null.jpg` při volbě „Celý svět". Vizuálně neškodné (`onerror`).
- **Párty: tlačítko pod odpovědí lže.** `S.idx+1 < S.order.length` rozhoduje
  o popisku „Další otázka" / „Konec", jenže v párty se `S.idx` nepoužívá (postup
  drží `S.qServed`) a `startParty()` ho na rozdíl od `startGame()` **neresetuje**.
  Po dohraném sólu tak párty ukazuje „Konec" pod každou odpovědí od první otázky.
- **Zrušení hledání soupeře má závod.** `stopAll()` se volá až po návratu `DELETE`,
  takže dotazování mezitím může hráče vtáhnout do hodnocené hry, kterou zrušil.
- **Síťová chyba vypadá jako prázdno** u turnajů, žebříčku a přátel — všechny tři
  čtou `(r.body && r.body.X) || []` bez kontroly stavu, takže výpadek se hráči
  ukáže jako „Zatím tu nikdo není".
- **`answer()` neukládá.** Body se zapíšou až při vykreslení další otázky, takže
  zavření appky po odpovědi je ztratí. `timeoutReveal()` přitom `autosave()` volá.

### 🔴 2.11 `cc` se posílá, ale není v `SELECT`u (nízká)
Dnes jsem do `functions/api/game/[id]/q/[n].js` přidal `cc: q.cc` s komentářem, že se
posílá výslovně, aby se klient nemusel spoléhat na tvar id. `SELECT` na řádku 30 ale
`cc` nevybírá, takže `q.cc` je `undefined` a klíč z JSON vypadne. Glóbus v online
funguje **jen díky fallbacku** `String(q.id).split("-")[0]`, který jsem označil za
pojistku pro staré hry. Komentář a kód si odporují.

**Návrh:** doplnit `cc` do `SELECT`u. Jedno slovo.

---

## Fáze 3 — kvalita kódu

### 3.1 Duplicita mezi `quiz.js` a `online.js`
Nejzávažnější je, že **kopie nejsou totožné**:

| logika | poznámka |
|---|---|
| `esc()` | `online.js` escapuje i apostrof, `quiz.js` **ne** |
| mapa pásmo → popisek | **čtyři kopie** (`BAND_NAMES`, `PASMA` 2×, `PASMA_T`) |
| `say()`, `plur()` | funkčně shodné |
| karta „Více o…" | shodná až na třídu zavíracího tlačítka |
| odpočet v timerbaru | shodný vzor |

Ověřeno, že v `quiz.js` dnes **není žádný atribut uzavřený apostrofy**, takže
chybějící escapování apostrofu je zatím neškodné. Je to ale tichá mina.

**Návrh:** malý sdílený `zk-util.js` načtený před oběma, nebo aspoň sjednotit `esc`.

### 3.2 Mrtvý kód
Ověřeno grepem napříč projektem: `HOST_NAME`, `ICO_FOLDER`, `selectCountry()`,
proměnná `FLAG` (jen se do ní zapisuje), blok `#qz-mute` ve `wireTop` i s `ICO_SND`/
`ICO_SNDX`, CSS `.qz-mute`, `.qz-a.dim`, `.zk-rev`, `.zk-ok`, `.zk-bad`.
`test-offline.js` žádnou z nich netahá, takže smazání testy nerozbije.

*Nepočítám sem* `stealHtml`/`finishSteal`, TTS vrstvu a větve pod `SHOW_SOURCE_LINK` —
CLAUDE.md je popisuje jako dočasně schované, ne jako zapomenuté.

### 3.3 Chybí `functions/_middleware.js`
V celém `functions/` není žádný záchytný bod. Každá neošetřená výjimka (chyba typu
v D1, porušení `UNIQUE`, `undefined.foo`) mine `json()`/`fail()` a klient dostane
**HTML chybovou stránku Cloudflare**, na které `r.json()` v `online.js` selže.
Běžný případ: dvě souběžné registrace téže přezdívky — kontrola je oddělená od
`INSERT`u, takže místo hezkého 409 přijde neošetřený pád.

**Návrh:** `_middleware.js` s `try { return await next() } catch { return fail(…, 500) }`.
Jedno místo, které zaručí, že API vrací JSON vždycky.

---

## Fáze 4 — vzhled a přístupnost

### 4.1 Barevné tokeny pokrývají jen menšinu
`#quiz-root` definuje 10 proměnných (`--paper`, `--ink`, `--teal`…), ale v `quiz.css`
je **193 zapsaných hex barev**. Čtyři nejčastější tvoří 99 výskytů a mají jasnou
sémantickou roli:

| barva | výskytů | k čemu se používá |
|---|---|---|
| `#fffdf6` | 31× | `color` (16×), `border` (10×) — světlý papír |
| `#e3d5b8` | 30× | `box-shadow` (24×) — stín pod kartami |
| `#dccdb0` | 25× | `border` (24×) — obrys karet |
| `#d8c9ad` | 13× | `outline` (5×), `border` (4×) |

**Návrh:** doplnit `--shadow`, `--line`, `--line-strong`, `--paper-hi`. Čtyři
proměnné pokryjí polovinu všech hardcoded výskytů a hlavně zajistí, že se stín
a obrys změní na jednom místě.

Kromě toho: **`--paper` je fakticky mrtvý token** — definovaný jednou, použitý
jednou, zatímco tatáž bílá je natvrdo na sedmi místech jako `#fff`/`#ffffff`.
A identický gradient `#ffffff → #fdf6e8` je zduplikovaný na dvou místech včetně
osmiřádkového komentáře nad ním.

### 4.2 Obsah se ořízne a nedá se k němu dostat (vysoká)

Obojí jsem změřil v prohlížeči a mám screenshot. Zhoršuje to, že `.qz-shell` má
`overflow: clip`, takže přetečení **nejde odscrollovat** — je prostě pryč.

**a) Výběr pásma v sólu přeteče na každém telefonu.** Při 375 px:
`scrollWidth 430 / clientWidth 375` → **55 px uříznuto**. Mřížka je `126px 126px 126px`,
protože `quiz.js` má inline `grid-template-columns:repeat(3,1fr)` a obrázek dlaždice
má pevných 92 px, který se v žádném breakpointu nepřepisuje. Na screenshotu je
dlaždice **„Dospělí" rozseknutá v půlce** — nápis nečitelný, pravá půlka neklikatelná.

Proč to bolí: „Jdeme na to" je `disabled`, dokud se pásmo nevybere, takže je to
přímo na cestě do hry. A „dospělí" je zároveň výchozí hodnota `S.band`.

**b) Výběr témat ořízne dvě z deseti témat na tabletu.** Při 700 px:
`scrollWidth 796 / clientWidth 700` → **96 px uříznuto**. Mřížka je
`142px ×5` = 796 px v kontejneru širokém 700. Pravidlo `@media (min-width:640px)`
nasadí pět sloupců, ale `.qz-tiles-sec .ic-img` má pevných 112 px, takže se stopa
pod 142 px nesmrskne (`1fr` = `minmax(auto,1fr)` a `auto` u obrázku s pevnou šířkou
je jeho šířka). Postihuje pásmo **640–817 px**, tedy tablety na výšku.

**Návrh pro obojí:** `minmax(0, 1fr)` u sloupců a `max-width: 100%; height: auto`
u obrázků dlaždic. Online část to už řeší správně — `.zk-bandpick` sráží obrázek
na 48 px pod 480 px.

### 4.3 Přístupnost

**Co drží:** `:focus-visible` s korálovým obrysem, blok `prefers-reduced-motion`,
`role="status" aria-live="polite"` na bublině hostitele, fokus na první odpověď po
překreslení (mimo školu), `aria-pressed`/`role="group"` v online části. `<img>` bez
`alt` je v `quiz.js` jediný, v `online.js` žádný.

**Co ne:**

- **Zakázané přiblížení.** `hra.html` má `maximum-scale=1.0, user-scalable=no`.
  Porušuje WCAG 1.4.4 a je to zároveň jediná úniková cesta z obou přetečení výš.
  Odstranit — `width=device-width, initial-scale=1` stačí.
- **Nula `<label>` v celé appce.** Popisky existují jako `<div class="qz-fieldlabel">`,
  takže s polem nejsou svázané; `input#zk-pin` nemá ani `aria-label`. Odečítač
  u PINu neohlásí prakticky nic. Změna `<div>` → `<label for>` je bezbolestná,
  protože CSS pravidlo visí na třídě.
- **Kontrast tlumeného textu nesplňuje AA.** `--muted #8a7a66` na papíru dává
  **4,15:1** (na `--paper2` 3,99:1) proti požadovaným 4,5:1 — a nese `.qz-expl`,
  `.qz-tile-sub`, `.qz-setnote`, `.qz-meta`, `.qz-crumbs`, tedy 11,5–13px text,
  kde výjimka pro velké písmo neplatí. Ztmavení na ~`#7a6a56` to spraví a odstín
  se prakticky nezmění.
  Horší jsou drobné štítky: bílá na okrové (`.qz-tbadge` 9 px) **2,21:1**,
  „SPRÁVNĚ"/„TVŮJ TIP" (`.qz-a small` 10 px) **2,96 / 3,43:1**.
- **Dvě akce jdou jen myší.** Přepínač „Otáčet obrazovku k hráči" a položka
  rozehrané hry jsou `<div>` s click handlerem, bez `tabindex` i role. U položky
  rozehrané hry na to ukazuje i CSS (`font-family: inherit`), což je reset, který
  dává smysl jen u `<button>` — nejspíš to `<button>` kdysi bylo.
- **Stav výběru je jen vizuální.** Dlaždice a chipy v offline části nesou stav
  třídami `.sel`/`.on` bez `aria-pressed`. Online část to má správně, takže jde
  o nekonzistenci uvnitř jedné appky.
- **Pop-up „Rozehrané hry" není modální.** `role="dialog" aria-modal="true"` je
  nastavené, ale fokus se dovnitř nepřesouvá, není past na fokus, `Escape`
  nezavírá a fokus se po zavření nevrací.

### 4.4 Mrtvá CSS pravidla
Ověřeno proti všem `class=`, `className` i `classList.*` napříč `quiz.js`,
`online.js`, `hra.html`, `admin.html`, `landing.html`, včetně skládaných tříd:
`.qz-quip` (a `.qz-school .qz-quip`), `.qz-ans.one`, `.qz-a.dim`, `.qz-hlaska.gold`,
`.zk-rev`, `.zk-ok`, `.zk-bad`. Ta poslední skupina leží čtyři řádky pod komentářem,
který popisuje mazání `.zk-picframe` — úklid se tam zastavil dřív, než měl.

Opačným směrem: `qz-pic-broken` se nasazuje z JS, ale pravidlo k ní neexistuje,
ačkoli CLAUDE.md ji popisuje jako stylovaný fallback.

A redundance: `.qz-a.ok` a `.qz-a.bad` jsou definované dvakrát (řádky 204/206
a znovu 872/873) — bez efektu, ale je to druhé místo, které se musí měnit.

---

## Fáze 5 — co doporučuju, seřazené

### Vyžaduje tvoje rozhodnutí (nejdřív)
1. **Obnova PINu** — buď zprovoznit poštu, nebo přestat logovat odkaz a přiznat
   uživateli, že obnova není v provozu. Dnes platí to nejhorší z obou.
2. **Veřejné odpovědi** — buď přiznat, že žebříčky jsou ozdoba a odlehčit je, nebo
   rozdělit fond na offline a serverový. Je to architektonické rozhodnutí, ne oprava.
3. **Odveta a expirace** — souhlasíš s tím, aby se hra, kterou soupeř nikdy neotevřel,
   při expiraci rušila místo vyrovnávání? Mění to zdokumentované pravidlo „bez kontumace".

### Opravil bych jako první — vidí to každý hráč
4. **Přetečení výběru pásma a témat** (4.2). `minmax(0,1fr)` + `max-width:100%`
   u obrázků dlaždic. Dvě volby na hlavní cestě do hry jsou dnes nedosažitelné.
5. **Odstranit `user-scalable=no`** z `hra.html`. Jeden atribut, a je to zároveň
   pojistka pro bod 4.

### Bezpečné opravy, které bych udělal hned (kdybych směl)
6. `cc` do `SELECT`u — jedno slovo, moje dnešní chyba.
7. `TC_NAMES.includes(tcName)` místo `TIME_CONTROLS[tcName]` na pěti místech.
8. `login.js` — nenulovat počítadlo při zamčení.
9. `qz-school` odebrat v `close()`.
10. Pásmo turnajů z účtu, ne z URL.
11. `flagStamp` → `if (!cc) return ""`, ať se to nemusí hlídat na sedmi místech.
12. Sdílet limit zakládání her přes všechny čtyři endpointy.
13. `_middleware.js` se záchytným `try/catch`.
14. `sharp` do `devDependencies`; CI na `node --check` + `validate` + `test:offline`.
15. `<div class="qz-fieldlabel">` → `<label for>` (CSS visí na třídě, takže beze změny vzhledu).
16. Ztmavit `--muted` na ~`#7a6a56` (kontrast 4,15 → nad 4,5:1, odstín se prakticky nezmění).

### Úklid, kdykoli
17. Smazat 18 doběhlých importních skriptů (5 102 řádků) a `_tmp-scope.js`.
18. Smazat mrtvý kód ze 3.2, mrtvá CSS pravidla ze 4.4 a 27 osiřelých obrázků.
19. Přepsat README (spuštění přes `npm run dev`, ne http-server).
20. Opravit tvrzení o `admin.html` v CLAUDE.md.
21. Zavést barevné tokeny ze 4.1 a rozhodnout rozdíl mezi `#dccdb0` a `#d8c9ad` —
    dnes se používají zaměnitelně a z kódu se nedá poznat proč.

---

## Co jsem prověřoval a je to v pořádku

Aby se to nekontrolovalo znovu:

- **Payload otázky neobsahuje odpověď** — `q/[n].js` posílá jen zamíchané možnosti.
- **Souběhy opravené 2026-09-01** platí: `answer.js` inkrementuje relativně,
  `settle.js` má `WHERE status = 'open'` s kontrolou `meta.changes`, `idx_gp_slot`
  existuje.
- **Čas se měří na serveru**, `ms` z těla se ignoruje, `q_served` je `INSERT OR IGNORE`.
- **Vlastnictví záznamů** se ověřuje na všech endpointech nad `/game/:id`
  i `/tournament/:id/*`. Mimo `/auth/*` není žádný endpoint bez `currentUser()`.
- **Obnova PINu** má jednotnou odpověď, otisk tokenu, jednorázovost i zneplatnění
  ostatních odkazů — vadné je jen doručení (2.4).
- **`avatar` bez validace není XSS** — ověřeno, že ho `online.js` nikde nevykresluje,
  přestože ho vrací osm endpointů. Je to mina, ne díra.
- **`JSON.parse` bez `try/catch`** nikde není; časovače se v `quiz.js` i `online.js`
  uklízejí (jediná mezera je závod v 2.10).
- **Integrita dat** je čistá (viz fáze 1) a migrace nemají drift proti `schema.sql`.
- **`2026-08-30-sekce.sql`** se korektně varuje hned prvním řádkem („NESPOUŠTĚT").

---

## Poznámka k prostředí — přečti si to

**`npm run test:api` teď padá a je to moje vina, ne chyba kódu.** Dnes jsem
restartoval dev server přes `preview_start`, což ho spustilo **z worktree**
(`.claude/worktrees/…`), ne z hlavního checkoutu. Worktree má vlastní prázdnou
lokální D1, takže se nezaloží hra a test spadne na `null`.

Nesahal jsem na to, protože jsi zakázal zasahovat do chodu. Spraví to zastavení
serveru a spuštění z hlavního checkoutu:

```bash
npm run dev
```

Ostatní kontroly na tom nezávisí a prošly: `validate` 0 chyb, `test:offline`
679 kontrol, `lint-irony` 0 chyb / 25 varování.
