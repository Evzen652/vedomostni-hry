# Online režim — návrh architektury

> Stav: **schválený záměr, nezačato**. Rozhodnuto 2026-08-24.
> Hosting zatím **nerozhodnut** (viz „Otevřené otázky" na konci).

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

**Appka dnes nikde neběží.** Není žádná deploy konfigurace, žádné CI. Online tedy znamená
i poprvé vyřešit hosting (~32 MB statiky: 7,4 MB data + 19 MB img + 6 MB assets).

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

- `p(správně)` z jeho ratingu a obtížnosti otázky (logistická funkce, strop ~0,95 —
  ani nejsilnější bot není neomylný),
- **čas odpovědi** z lognormálního rozdělení, jehož střed klesá s ratingem.

Bot tedy nepotřebuje žádnou AI ani runtime volání — je to statistický model o pár řádcích.
**Hry proti botům jsou nehodnocené** (jinak by šel rating farmit na slabých botech), ale
počítají se do statistik a do evidence viděných otázek.

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

**Systém:** Glicko-2 (lépe než ELO snáší nepravidelné hraní). Start 1200 s vysokou odchylkou,
prvních ~10 her rychle kalibruje. **Sezóny po měsíci** s měkkým resetem ke středu, aby noví
hráči měli šanci na přední příčky.

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
| `POST /api/auth` | registrace / přihlášení (přezdívka + PIN) |
| `GET /api/me` | profil, ratingy za pásma, historie |
| `POST /api/game` | založí hru (režim, pásmo, časovka) → `id` |
| `GET /api/game/:id/q/:n` | n-tá otázka **bez správné odpovědi** |
| `POST /api/game/:id/answer` | tip + čas → vyhodnocení |
| `GET /api/game/:id` | výsledek a rozbor |
| `GET /api/daily` | denní pětka |
| `GET /api/leaderboard?band=` | žebříček pásma |

### WebSocket (živý duel)

`queue` → `matched` → `question` → `answer` → `opponent-progress` → `result`

Když `queue` do ~15 s nenajde soupeře, server nabídne **bota** odpovídajícího ratingu nebo
**async výzvu**. Hráč nikdy nekouká na prázdný lobby.

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

## 8. Pořadí stavby

Cíl je celek, ale postavit se musí v pořadí. Tohle drží appku hratelnou v každém kroku:

1. **Hosting + statika na internetu + kostra API + účty.** Bez tohohle nejde nic dalšího.
2. **Herní motor na serveru** — založení hry, servírování otázek bez odpovědi, vyhodnocení,
   evidence viděných otázek, rozbor.
3. **Souboj na odkaz.** První hratelný online režim; otestuje celý motor bez WebSocketů.
4. **Boti.** Aby bylo s kým hrát od prvního dne, ještě než existuje hráčská základna.
5. **Živý duel** — WebSocket, lobby, párování, sledování soupeře.
6. **Rating, žebříčky, sezóny.**
7. **Denní pětka.**
8. **Přátelé, výzvy, odvety.**
9. **Turnaje / arena.**

Kroky 3 a 4 jsou schválně **před** živým duelem: jsou to přesně ty dvě věci, které zajistí,
že první hráči nepřijdou do prázdné herny.

---

## 9. Otevřené otázky

- **Hosting.** Zvažované varianty:
  - *Cloudflare Pages + Workers* — statika i backend na jedné platformě zdarma, žádný server
    k údržbě, Durable Objects sedí na živé duely (jedna hra = jeden objekt).
  - *GitHub Pages + Supabase* — hotové přihlašování, ale dvě služby místo jedné.
  - *Vlastní VPS* — plná kontrola, ale běh, certifikáty a zálohy na tobě.
- **Doména a název** online instance.
- **Maraton** jako třetí časová kontrola (25 otázek × 15 s)?
- **Odkud brát otázky pro denní pětku** — všechna pásma zvlášť, nebo jedna společná sada
  z pubertáckého fondu?
