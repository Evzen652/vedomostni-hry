# Online režim — návrh architektury

> Stav: **nasazeno na https://zemekviz.pages.dev** (2026-08-25) — Cloudflare Pages + D1,
> region EEUR. Nasazeno kvůli testování na mobilu, ne kvůli spuštění mezi lidi.
> **Adresa je veřejná: kdo ji dostane, může hrát.**
> Kroky 1–8 postavené včetně frontendu ([online.js](../online.js), dlaždice Online
> v `hra.html`), otestované — `npm run test:api`, 85 kontrol, plus ruční průchod
> celého režimu. Krok 9 (turnaje) záměrně vynechaný.
> Nasazuje se `npm run deploy`; pasti kolem toho viz [CLAUDE.md](../CLAUDE.md), 2026-08-25.

Cílem je online hraní ve stylu chess.com: účty, párování soupeřů, rating, žebříčky,
turnaje. Tenhle dokument popisuje **cílový stav** a **pořadí stavby**, kterým se k němu
dojde, aby byla appka hratelná v každém mezikroku.

---

## 1. Hranice: co se mění a co ne

**Offline režimy zůstávají nedotčené.** Sólo jízda, párty souboj na jednom zařízení
a škola hrou fungují dál bez připojení. Online je **nová větev**, ne přepis stávající hry.
V menu přibude čtvrtá dlaždice, která bez připojení hlásí, že potřebuje internet.

**Tím ale padá konvence „appka je offline-only"** zapsaná v CLAUDE.md od založení projektu.
Nově platí: *offline-first* — všechno, co šlo offline, jde offline dál; online je nadstavba.

**~~Appka dnes nikde neběží.~~** *(Neplatí od 2026-08-25 — běží na Cloudflare Pages,
viz hlavička.)* Hosting znamenal vyřešit ~32 MB statiky: 7,4 MB data + 19 MB img + 6 MB assets.

---

## 2. Herní režimy online

### Živý duel (jádro, obdoba Live Chess)
Dva hráči hrají **stejné otázky ve stejném pořadí a se stejným pořadím odpovědí**,
současně, každý na svém zařízení. Vidí soupeřův postup (kolikátou otázku má, kolik bodů) —
to je obdoba šachových hodin: napětí bez toho, aby jeden čekal na druhého.

Časové kontroly:

| Název | Otázek | Čas na otázku |
|---|---|---|
| **Blesk** | 10 | 10 s |
| **Klasika** | 15 | 20 s |

**Bodování:** správná odpověď 100 bodů + rychlostní bonus až 100 bodů lineárně podle
zbývajícího času (`round(100 × zbývá/limit)`). Špatná nebo vypršelá 0. Vyhrává víc bodů,
shoda = remíza. Rychlostní bonus dělá remízy vzácné a drží napětí do poslední otázky.

**Do ratingu jde jen výhra / remíza / prohra**, ne body — stejně jako v šachách. Body
rozhodují zápas, rating počítá výsledky.

### Souboj na odkaz (obdoba Daily / korespondenčních šachů)
Odehraješ svých N otázek kdykoli, soupeř svých N kdykoli do 24 hodin, pak se výsledky
porovnají otázku po otázce. Slouží dvěma věcem:

1. Hraní s kamarádem, který zrovna není online.
2. **Záchranná síť pro prázdný lobby** — když párování nikoho nenajde, nabídne se async výzva.

### Denní pětka (obdoba Puzzle of the Day)
5 otázek, pro všechny na světě **stejných**, jeden pokus denně, žebříček dne.
Nejlevnější retenční funkce v celém návrhu a jako jediná nepotřebuje soupeře.

### Vlastní hra (obdoba variant)
Výběr zemí, témat a pásma, pozvánka konkrétnímu kamarádovi na kód. **Bez ratingu** —
při volitelném fondu nejsou výsledky porovnatelné.

### Hry proti botům
Bot má vlastní rating a jméno. Pro každou otázku se odvodí:

- `p(správně)` z **rozdílu jeho ratingu a ratingu otázky** (Elo očekávání, strop ~0,95 —
  ani nejsilnější bot není neomylný),
- **čas odpovědi** z lognormálního rozdělení, jehož střed klesá s ratingem.

Bot tedy nepotřebuje žádnou AI ani runtime volání — je to statistický model o pár řádcích.
**Hry proti botům jsou nehodnocené** (jinak by šel rating farmit na slabých botech), ale
počítají se do statistik a do evidence viděných otázek.

**Rating bota se ale musí průběžně přepočítávat z jeho skutečných výsledků** proti hráčům se
známým ratingem — ne nastavit natvrdo. Důvod je v sekci „Ověření modelu“: uzavřený žebříček
nemá absolutní kotvu, takže „bot za 1500“ nastavený od stolu nemusí odpovídat „hráči za 1500“.
Bot se tedy kalibruje na fond, ne fond na bota.

---

## 3. Věková pásma a rating

Pásma (děti / pubertáci / dospělí) losují z **různých fondů otázek**, takže výsledky napříč
pásmy nejsou porovnatelné. Proto:

- **Samostatný rating a žebříček pro každé pásmo** — obdoba toho, jak má chess.com zvlášť
  bullet, blitz a rapid.
- **Párování jen uvnitř pásma.**
- **Rating se ale nedělí podle časové kontroly.** Blesk i Klasika sdílejí jeden rating pásma.
  Chess.com dělí podle času proto, že rychlost je tam samostatná dovednost; tady je znalost
  stejná a dělení by jen roztříštilo hráčskou základnu na šestinky.

**Systém:** Glicko-2 (lépe než ELO snáší nepravidelné hraní). **Start 1500** s vysokou odchylkou
(1500 je konvence Glicka; jiná startovní hodnota jen posune celou stupnici). **Sezóny po měsíci**
s měkkým resetem ke středu, aby noví hráči měli šanci na přední příčky.

**Otázky mají taky svůj rating**, počítaný z toho, jak často ji hráči skutečně trefí — obdoba
puzzle ratingu na Lichess. Pole `difficulty` k tomu použít nejde: uvnitř pásma nese **nulovou
informaci** (100 % dětských otázek má `difficulty 1`, 100 % dospěláckých `difficulty 3`), takže
je to fakticky štítek pásma, ne míra obtížnosti. Než se nasbírají statistiky, nasadí se rating
otázky na střed pásma.

**Hodnocené jsou jen** živý duel a souboj na odkaz na **pevném nastavení** (celý svět,
všechna témata). Vlastní výběr zemí/témat a hry proti botům hodnocené nejsou.

---

## 4. Férovost: evidence viděných otázek

Fond je konečné palivo. Dospělácké pásmo má dnes 1442 otázek = 144 her po deseti bez
jediného opakování, ale při náhodném losování narazí aktivní hráč na opakování po ~30 hrách.

Proto se u každého hráče eviduje **množina viděných otázek** a losování preferuje neviděné.

**Ve dvojici to má tvrdší důsledek:** pokud jeden hráč otázku už viděl a druhý ne, zápas je
nefér. Losuje se tedy z **průniku otázek, které neviděl ani jeden**. Když průnik nestačí,
doplní se **symetricky** — stejný počet otázek, které viděl jen A, a které viděl jen B.

Praktický dopad: **výroba obsahu se stává průběžnou povinností**, ne jednorázovou akcí.

---

## 5. Bezpečí dětí

- **Žádný chat nikde v appce.** Jen emoji reakce z pevné sady. Vyhýbá se to celé agendě
  moderace, která by tenhle projekt utopila.
- **Dětské pásmo dostává generované přezdívky** ze slovníku (`Rychlý rys`, `Statečná veverka`).
  Nula moderace přezdívek, nula prostoru pro vzkazy schované ve jméně.
- **Žádné žádosti o přátelství od cizích v dětském pásmu** — přátelé jen na kód, což vyžaduje
  kontakt mimo appku.
- **Registrace bez e-mailu**: přezdívka + avatar + PIN. Sbíráme minimum osobních údajů.
- **E-mail jen nepovinně, až po registraci** (doplněno 2026-08-25). Slouží výhradně k obnově
  zapomenutého PINu — bez něj účet obnovit nejde a hráč o něj při zapomenutí přijde.
  Registraci nezdržuje a nevyžaduje se; u dětského pásma ho má vyplnit rodič. Sloupec je
  bez `UNIQUE`, aby rodič mohl mít stejnou adresu u víc dětí. Podrobnosti a pasti viz
  [CLAUDE.md](../CLAUDE.md), zápis z 2026-08-25.

---

## 6. Anti-cheat

**Rozhodnutá úroveň: volná.** Online je pro zábavu, rating není posvátný. Datová pipeline
se kvůli tomu nebude dělit na veřejný a serverový fond.

Co se přesto dělá, protože je to skoro zdarma:

- **Server nikdy neposílá správnou odpověď před odesláním tipu.** Otázka jde ven se čtyřmi
  možnostmi bez označení, které je správně; vyhodnocuje se na serveru. Bez toho by stačilo
  otevřít devtools a hra by nebyla hra.
- **Krátký časovač** (10–20 s) prakticky vylučuje pohodlné googlení.
- **Tichý příznak** u nemožně rychlých správných odpovědí napříč mnoha hrami.

**Vědomě tolerované riziko:** kdo si předem stáhne veřejný `data/questions/*.json`, má náskok.
Pokud by to jednou vadilo, řešením je serverový fond otázek, které nejsou ve statickém balíčku.

---

## 7. Architektura

Hosting zatím není rozhodnutý, proto je návrh **postavený na rozhraní**, ne na platformě —
kterákoli ze zvažovaných variant tohle rozhraní umí naplnit.

### REST

| Endpoint | K čemu |
|---|---|
| `POST /api/auth/register` | registrace (přezdívka + PIN, bez e-mailu) |
| `POST /api/auth/login` | přihlášení |
| `PUT/DELETE /api/auth/email` | nepovinný e-mail pro obnovu PINu (chce PIN) |
| `POST /api/auth/reset` | požádá o odkaz na obnovu PINu |
| `POST /api/auth/reset/confirm` | nastaví nový PIN podle tokenu z odkazu |
| `GET /api/me` | profil, ratingy za pásma, historie |
| `POST /api/game` | založí hru — `solo` nebo `odkaz` |
| `GET /api/game/:id/q/:n` | n-tá otázka **bez správné odpovědi** |
| `POST /api/game/:id/answer` | tip + čas → vyhodnocení |
| `GET /api/game/:id` | stav a po dohrání rozbor |
| `POST /api/game/:id/join` | přijmi souboj na odkaz |
| `POST /api/game/:id/bot` | pusť do souboje bota |
| `GET /api/game/:id/live` | průběh soupeře (dotaz po ~2 s) |
| `POST /api/game/:id/rematch` | odveta se stejným soupeřem |
| `POST/GET/DELETE /api/match` | fronta na živý duel |
| `GET /api/daily` | denní pětka |
| `GET /api/leaderboard?band=` | žebříček pásma, s `&daily=1` žebříček dne |
| `GET/POST /api/friends` | přátelé podle kódu |

### Živý duel: dotazování, ne WebSocket

Původní návrh počítal s WebSocketem přes Durable Objects. **Postaveno je místo toho
dotazování po ~2 s** (`GET /api/game/:id/live`), a to záměrně:

- Pages Functions neumí definovat Durable Objects ve vlastním kódu — chtěl by to
  samostatný Worker navíc, tedy druhou nasazovanou věc.
- U otázky s limitem 10–20 s je dvousekundové zpoždění od WebSocketu k nerozeznání.
  Hráč potřebuje vidět „soupeř je na čtvrté otázce", ne milisekundovou přesnost.
- Vyjde to na ~50 dotazů na hru, tedy ~1 000 her denně ve free limitu.

Kdyby to jednou přestalo stačit, Durable Objects zůstávají cestou nahoru — `live.js`
je jediné místo, které by se měnilo.

Fronta (`/api/match`) páruje uvnitř pásma a časové kontroly, okno ratingu se rozšiřuje
o 100 bodů za každou sekundu čekání. Po 15 s vrátí `offer_bot`, takže hráč nikdy nekouká
na prázdný lobby.

### Datový model

```
users            id, nick, avatar, pin_hash, band_default, created_at
ratings          user_id, band, rating, rd, sigma
games            id, mode, band, time_control, question_ids[], answer_orders[], status
game_players     game_id, user_id | bot_id, score, answers[], finished_at
seen_questions   user_id, question_id, seen_at
daily            date, question_ids[]
```

Klíčové: **hra je pevný seznam ID otázek včetně pořadí odpovědí**, zafixovaný při založení.
Bez toho nejde udělat férové porovnání ani rozbor „ty jsi klikl B, on A".

### Rozbor po hře
Obdoba analýzy partie na chess.com. Projde otázku po otázce, ukáže obě odpovědi, správnou,
`explanation` a tlačítko „Více o…" nad `more_fact`. **Tuhle vrstvu už máme hotovou v datech** —
stačí ji vykreslit.

---

## 8. Ověření modelu

Herní model výše **není odhad od stolu** — je prohnaný simulací
[`scripts/sim-online.js`](../scripts/sim-online.js) (`npm run sim-online`, seedovaný RNG,
20 000 zápasů na variantu). Co z ní vyšlo:

### Zápas o deseti otázkách rozlišuje dost dobře
Podíl výher silnějšího hráče podle rozdílu síly:

| Rozdíl | +0 | +50 | +100 | +200 | +400 |
|---|---|---|---|---|---|
| Blesk, 10 otázek | 49,4 % | 65,5 % | 78,0 % | **93,1 %** | 99,6 % |
| Klasika, 15 otázek | 49,6 % | 65,6 % | 78,5 % | **93,8 %** | 99,7 % |

Vyrovnaný zápas vychází na 49,4 % (má 50 %) — model je zdravý. Obava, že deset otázek bude
příliš náhodných, se **nepotvrdila**; Blesk je plnohodnotná hodnocená disciplína.

### Chybějící rozptyl obtížnosti nevadí
Ploché obtížnosti rozlišují dokonce **o něco lépe** než rozptýlené (93,1 % vs. 90,0 % při +200).
Dává to smysl: otázka výrazně nad i pod úrovní obou hráčů nenese žádnou informaci — buď ji
trefí oba, nebo ani jeden. To, že `difficulty` uvnitř pásma nic neříká, tedy **není problém pro
žebříček**; vlastní rating otázek má cenu kvůli výběru a botům, ne kvůli rozlišování hráčů.

### Rychlostní bonus měří znalost, ne reflexy
Se zapnutým bonusem 93,8 %, bez něj 90,2 % při +200. Bonus rozlišovací schopnost **zvyšuje**,
takže neodvádí hru od znalostí ke klikání.

### Rating konverguje rychle
| Her na hráče | 5 | 10 | 20 | 40 | 80 |
|---|---|---|---|---|---|
| Chyba proti pravé síle | 128 b | 85 b | 58 b | 44 b | **37 b** |
| Korelace | 0,840 | 0,931 | 0,969 | 0,983 | **0,990** |

Po dvaceti hrách je rating použitelný, po čtyřiceti přesný.

### Bot je věrohodný soupeř
Bot proti stejně silnému hráči vyhrává 49,6–50,3 % napříč úrovněmi 1100 až 1900. Model
(Elo očekávání + lognormální reakční čas) funguje přesně tak, jak měl.

### Nález, který změnil návrh: žebříček nemá absolutní kotvu
Hrubá chyba ratingu zůstávala zaseknutá na 315 bodech i po osmdesáti hrách — ukázalo se, že
je to **celé posun celého fondu**, ne nepřesnost. Uzavřený žebříček umí zachytit jen **poměr**
sil, absolutní úroveň je věc konvence.

Pro rating hráčů to nevadí (párování potřebuje pořadí, ne absolutní čísla). **Rozbíjí to ale
bota s natvrdo nastaveným ratingem** — pokud fond plave, „bot za 1500“ neodpovídá „hráči za
1500“ a bude systematicky moc lehký nebo moc těžký. Proto se rating bota přepočítává z jeho
skutečných výsledků, viz sekce 2.

## 9. Pořadí stavby

Cíl je celek, ale postavit se musí v pořadí. Tohle drží appku hratelnou v každém kroku:

1. ✅ **Hosting + kostra API + účty.** Platforma vybraná, API běží lokálně, účty bez e-mailu.
2. ✅ **Herní motor na serveru** — založení hry, otázky bez odpovědi, vyhodnocení,
   evidence viděných otázek, rozbor.
3. ✅ **Souboj na odkaz.** První hratelný online režim.
4. ✅ **Boti.** Aby bylo s kým hrát od prvního dne.
5. ✅ **Živý duel** — fronta, párování, sledování soupeře (dotazováním, ne WebSocketem).
6. ✅ **Rating a žebříčky.** Glicko-2 zvlášť za pásmo. *Sezóny zatím nejsou.*
7. ✅ **Denní pětka.**
8. ✅ **Přátelé (podle kódu) a odvety.** *Výzvy konkrétnímu příteli zatím nejsou.*
9. ✅ **Turnaje / aréna.** Postaveno 2026-08-26, na výslovné přání navzdory bodu níž
   (turnaj pro nula hráčů je do budoucna zbytečná práce, ale rozhodnuto stavět rovnou).
   Model: časové okno (`starts_at` + `duration_min`), stav (`planovany`/`bezi`/`hotovo`)
   se POČÍTÁ z časů, nic ho nepřepíná — bez toho by turnaj potřeboval naplánovanou úlohu.
   Uvnitř okna si účastníci opakovaně žádají o další kolo (`POST /api/tournament/:id/play`),
   spárují se s kýmkoli čekajícím ve stejném turnaji (FIFO — rating netřeba řešit, všichni
   sdílí pásmo i časovou kontrolu z definice turnaje), nebo si po pár sekundách vyžádají
   bota (`POST /api/tournament/:id/bot`, celé kolo odehraje najednou, ne jako dosazení
   bota do rozehrané hry). Kola jsou obyčejné hry (`games.mode='turnaj'`), NEHODNOCENÉ
   v Glicku — místo toho se body z každého kola sčítají do `tournament_players` a řadí
   žebříček turnaje. Párování běží na samostatné `tournament_queue`, ne na sdílené
   `queue` živého duelu — ta je klíčovaná jen podle `user_id`, takže by hráč nemohl čekat
   na ranked duel a kolo turnaje zároveň. Frontend recykluje obrazovky duelu
   (`beginGame`/`watchOpponent`/`showResult`) s větví pro `mode==='turnaj'`, ne nové UI.
   Otestováno `npm run test:api` (+18 kontrol).

Kroky 3 a 4 byly schválně **před** živým duelem: jsou to přesně ty dvě věci, které zajistí,
že první hráči nepřijdou do prázdné herny.

### Co ještě chybí, než to půjde pustit mezi lidi

- ✅ ~~**Frontend.**~~ Postaven ([online.js](../online.js)), dlaždice Online v `hra.html`.
  Ověřeno ručním průchodem 2026-08-25: registrace, párování, boti, souboj na odkaz,
  denní pětka, přátelé, rating.
- ✅ ~~**Nasazení.**~~ Hotovo 2026-08-25 — Pages projekt `zemekviz`, D1 v regionu EEUR,
  `SESSION_SECRET` nastavený, produkční databáze naplněná (3 706 otázek, 18 botů).
  Nasazuje se `npm run deploy` (sestaví `dist/` a nahraje ho).
- ⬜ **Výzva konkrétnímu příteli.** `friends.js` umí jen přidat a vypsat; vyzvat kamaráda
  jde zatím pouze přeposláním odkazu na souboj.
- ⬜ **Sezóny** (měsíční reset ratingu).
- ⬜ **Úklid fronty** — zatím se opuštěné položky mažou až při dalším párování; při provozu
  by to chtělo naplánovanou úlohu (Cron Trigger).
- ⬜ **`assets/mode-online.jpg`** — dlaždice Online jako jediná ze čtyř nemá ilustraci
  a padá na emoji fallback.

Sezóny, výzvy a úklid fronty mají smysl řešit až podle toho, jestli tam někdo přijde —
stejná logika, kvůli které jsou odložené turnaje.

---

## 10. Platforma: Cloudflare Pages + Functions + D1

**Rozhodnuto 2026-08-24.** Ověřené limity free plánu (odkazy níže): Workers 100 000 requestů/den,
D1 5 GB a 100 000 zápisů/den, Durable Objects v SQLite variantě ve free plánu včetně úložiště,
Pages zdarma s auto-deployem z GitHubu. Na plánovaný provoz to stačí s velkou rezervou.

Proč ne **Supabase**, který byl druhý v pořadí: Realtime a prohlížeč dat má lepší a u kroku 5
by ušetřil práci — ale znamená dvě služby a CORS, lokální vývoj chce Docker, a jeho vestavěné
přihlašování stojí na e-mailu, který tenhle návrh schválně nechce (přezdívka + PIN kvůli dětem).
Pauzování free projektu po týdnu nečinnosti je řešitelné cronem, takže to samo o sobě důvod
nebylo. **Rozhodl praktický detail:** `wrangler pages dev` běží kompletně lokálně bez účtu,
bez Dockeru a bez internetu, takže se dá vyvíjet a testovat od první minuty. Doména není
potřeba ani při nasazení — Pages dá zdarma `*.pages.dev`.

Přechod zpět na Supabase zůstává levný: API kontrakt je platformově neutrální, herní logika
v `functions/_lib/game.js` je čistý JS a schéma je skoro standardní SQL. Cloudflare-specifický
je jen tenký routing.

### Jak to spustit lokálně

```
npm install          # jednorázově, stáhne wrangler
npm run db:init      # schéma + naplnění 3 706 otázek do lokální D1
npm run dev          # http://127.0.0.1:8788
npm run test:api     # kouřový test API (ve druhém terminálu)
```

Lokální databáze žije v `.wrangler/` a je mimo verzování, stejně jako generovaný
`data/d1-seed.sql`. Nasazení na Cloudflare vyžaduje účet a `database_id` ve `wrangler.toml` —
do té doby funguje všechno lokálně.

---

## 11. Otevřené otázky

- **Maraton** jako třetí časová kontrola (25 otázek × 15 s)?
- **Odkud brát otázky pro denní pětku** — všechna pásma zvlášť, nebo jedna společná sada
  z pubertáckého fondu?
