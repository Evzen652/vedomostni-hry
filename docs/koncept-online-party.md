# Koncept: online párty hra (každý na svém zařízení)

> **Stav: návrh k prodiskutování.** Nic z toho zatím není implementované.
> Až se na variantě shodneme, zapíše se rozhodnutí do [CLAUDE.md](../CLAUDE.md) („Systémová rozhodnutí").

Cíl podle zadání: hrát párty hru tak, že **každý má svůj tablet/mobil**, a přidat možnost
**hrát s kýmkoli, koho nemusím znát** (model chess.com). Stávající párty hra na jednom
zařízení zůstává beze změny.

---

## 1. Nejdřív ta nepříjemná věc: tohle rozbíjí „offline-only"

V CLAUDE.md je od založení zapsáno: *„Appka je offline-only. Žádná runtime volání AI ani
externích API. Vše je součástí repa."*

Hra s cizími lidmi tohle **nutně** porušuje, a to hned dvakrát:

1. **Potřebuje server.** Někdo musí párovat hráče, držet stav místnosti a rozesílat otázky.
   Bez serveru se dva tablety v různých domácnostech nemají jak najít. Nejde to obejít —
   P2P (WebRTC) taky potřebuje signalizační server, jen menší.
2. **Appka musí být veřejně hostovaná.** Dnes běží z lokální složky. Aby si ji každý hráč
   načetl na svém tabletu, musí být na nějaké adrese (Cloudflare Pages / Netlify / GitHub Pages).

**Návrh formulace nového pravidla** (místo prostého zrušení):

> Appka je **offline-first**. Sólo, párty na jednom zařízení a Škola fungují i bez internetu.
> Online párty je jediná část, která internet vyžaduje, a je oddělená tak, aby její výpadek
> nikdy nerozbil zbytek hry.

Precedens už v repu je: `three.min.js` se tahá z CDN a když není, glóbus spadne na CSS fallback
([hra.html:21](../hra.html), `initGlobe3d`). Stejný princip použijeme i tady.

---

## 2. Dva vstupy do online hry

Obojí stojí na stejné infrastruktuře, liší se jen tím, jak se hráči najdou.

| | **Kód místnosti** | **Rychlá hra** |
|---|---|---|
| Pro koho | rodina, kamarádi, třída | kdokoli (chess.com model) |
| Jak | hostitel založí hru → 6znakový kód → ostatní ho zadají | hráč klikne „Hrát" a server ho spáruje |
| Znám protihráče | ano | ne |
| Kdy dává smysl | **hned** (stačí pár otázek) | až bude dost otázek (viz §11) |

Doporučuju je stavět v tomhle pořadí — kód místnosti splní „každý na svém tabletu" a je
mnohem jednodušší; matchmaking je pak už jen fronta navíc nad stejným enginem.

---

## 3. Herní model: všichni odpovídají naráz

Tohle je nejdůležitější rozhodnutí konceptu, protože se liší od dnešní párty hry.

**Dnes (jedno zařízení):** hráči se střídají, jeden odpovídá, ostatní koukají, pak je Steal.
Funguje to, protože všichni sedí u sebe a čekání je součást zábavy.

**Online to nefunguje.** S cizími lidmi je čekání, až někdo na druhém konci republiky doťuká
odpověď, mrtvý čas. Při 6 hráčích kouká 5 lidí do zdi.

**Návrh — model A „všichni naráz"** (jako Kahoot):

- Server pošle **stejnou otázku všem** současně, s pevným deadlinem (20–30 s).
- Každý odpovídá na svém zařízení, nevidí odpovědi ostatních.
- Po deadlinu (nebo když odpoví všichni) přijde **společné odhalení** — a to je ta zábavná chvíle:
  u každé dlaždice s odpovědí se ukážou avataři těch, kdo ji zvolili.
- Body = správnost **+ bonus za rychlost** (viz §4).

Proč je to lepší: nikdo nečeká, škáluje to na libovolný počet hráčů, odolné vůči odpojení
(kdo neodpoví, prostě propadne), a odhalení je společný „aha" moment.

**Co se tím ztrácí:** Steal a otáčení obrazovky k hráči. Obojí jsou funkce pro jedno zařízení
a online nedávají smysl. **Zůstávají v původní párty hře**, která se nemění.

<details>
<summary>Model B „štafeta" — zvážená, ale nedoporučená alternativa</summary>

Zachovat dnešní logiku na tahy: server řekne, kdo je na tahu, ostatní sledují živě a můžou
stealovat. Zachovalo by to identitu hry přesně, ale je to pomalé a s cizími lidmi frustrující.
Případně později jako volba v soukromé místnosti („klasická párty na více zařízení").
</details>

---

## 4. Skóre

Základ zůstává, jen se přidá rychlost:

```
base    = difficulty × 100                      (jako dnes)
rychlost= base × 0,5 × (zbývající čas / limit)  (0 až +50 %)
zisk    = base + rychlost                       (jen při správné odpovědi)
```

- **Série** (streak) funguje dál, per hráč.
- **Zlatá odpověď** (`golden_wrong`) zůstává — je to dobrá mechanika a online funguje stejně.
- **Odhadovací otázky** (`estimate`): skóre podle přesnosti jako dnes, rychlost jen jako
  rozřazovač při shodě. Fungují simultánně bez úprav.
- Špatná odpověď i nestihnutý čas = 0.

---

## 5. Průběh obrazovek

```
Výběr režimu  →  [Online párty]  →  Založit hru / Přidat se kódem / Rychlá hra
                                          ↓
                                    LOBBY  (kdo je připojený, hostitel volí téma a počet kol)
                                          ↓
                    ┌────────  KOLO 1..N  ────────┐
                    │  otázka + časomíra          │   ← existující rozložení karet
                    │  odpověď (čeká se na ostatní)│
                    │  odhalení + kdo co zvolil   │
                    │  průběžné pořadí            │
                    └─────────────────────────────┘
                                          ↓
                                    VÝSLEDKY  →  Odveta / Konec
```

**Co se dá převzít beze změny:** celé vykreslení otázky a odpovědi včetně nového dvousloupcového
layoutu s fotkou, hlášky, časomíra (`.qz-timerbar`), avataři hráčů (`.qz-face`, `.qz-pav`),
tabulka pořadí (`.qz-standings`). Vizuálně to bude vypadat jako zbytek hry.

**Co je nové:** lobby, čekací stav („odpovědělo 3/5"), pás avatarů u odhalení, obrazovka hledání
soupeřů.

---

## 6. Architektura

Server musí být **autoritativní** — on drží čas, on rozhoduje, kdo stihl odpovědět. Kdyby si
čas počítal každý klient sám, s cizími lidmi to okamžitě rozpadne (jiné hodiny, jiná latence,
snadná manipulace).

### Doporučení: Cloudflare Pages + Durable Objects

| Vrstva | Řešení |
|---|---|
| Statická appka | **Cloudflare Pages** (nasazení z gitu, zdarma) |
| Herní server | **Worker + Durable Object** — jeden objekt = jedna místnost |
| Spojení | **WebSocket** (obousměrné, nízká latence) |
| Fronta matchmakingu | jeden sdílený Durable Object |

Proč tohle: jedna platforma pro appku i server, Durable Object je přesně „jeden běžící objekt
s pamětí na místnost" — ideální pro herní stav a časovač. Žádné VPS, žádná údržba.
*(Podmínky free tieru Durable Objects si před rozhodnutím ověříme — historicky vyžadovaly
placený plán $5/měsíc.)*

### Alternativy

- **PartyKit** — postavené přesně na tomhle případu (běží na CF pod kapotou), nejrychlejší start,
  ale závislost na dalším nástroji.
- **Supabase Realtime** — nulový serverový kód (broadcast + presence), ale **není autoritativní**;
  hodí se na soukromé místnosti s kamarády, ne na hru s cizími.
- **Vlastní Node/WS server na VPS** — plná kontrola, ale je to železo, co musíš spravovat. Nedoporučuju.

### Protokol (náčrt)

```
klient → server:   join {roomCode|"quick", playerId, nick, color}
                   answer {questionId, choice, }
                   ready                          (chce další otázku)
server → klienti:  lobby {players[], settings}
                   question {roundNo, questionId, answerOrder[], deadlineTs}
                   waiting {answered: 3, total: 5}
                   reveal {correct, perPlayer[{id, choice, gained, total}], quip}
                   standings {players[] seřazení}
                   over {finalStandings[]}
```

Klíčové: server posílá **`answerOrder`**, aby měli všichni stejné pořadí A–D (dnes se míchá
lokálně v `shuffle`), a **`deadlineTs`** místo počtu sekund, aby si každý klient odečetl vlastní
latenci.

---

## 7. Identita hráče

Pro fázi 1 a 2 **žádné účty**:

- `playerId` = náhodné UUID v `localStorage` (drží se mezi hrami, umožní návrat po odpojení),
- **přezdívka** + barva avatara (obojí už v datovém modelu hráče je),
- žádný e‑mail, žádné heslo, žádné osobní údaje.

Účty (a s nimi trvalé ELO, historie, přátelé) mají smysl až ve fázi 3, a jsou to samy o sobě
velké téma (GDPR, souhlas rodičů u dětí). Do začátku bych se jim vyhnul.

---

## 8. Bezpečnost dětí — tohle beru vážně

Appka cílí i na děti (pásma 6–9 a 10–14 let). Ve chvíli, kdy pustíš k sobě cizí lidi, vzniká
odpovědnost, kterou dnešní hra nemá. Návrh:

- **Žádný volný chat.** Vůbec. Místo něj pár pevných reakcí („dobrá!", „těsně!") jako SVG ikonky
  — sedí to i k pravidlu „žádná emoji v UI".
- **Přezdívky generované appkou** ve veřejných hrách („Rychlý Rys", „Modrá Liška"). Vlastní
  přezdívka jen v soukromé místnosti, kde se hráči znají. Odpadá tím filtrování sprostých slov
  i sdílení jmen dětí s cizími.
- **Žádné profily** — po hře po sobě nezůstane nic, co by šlo prokliknout.
- Zvážit **oddělené fronty podle věkového pásma**, ať děti nehrají s dospělými.

Tohle je návrh, ne dogma — ale doporučuju s tím nešetřit, je to levné teď a drahé potom.

---

## 9. Podvádění

Buďme upřímní: otázky jsou v `data/questions/*.json`, tedy veřejně čitelné. Kdo otevře
vývojářské nástroje, uvidí správnou odpověď.

- **Soukromá místnost:** neřešíme. Kdo podvádí kamarádům, kazí si to sám.
- **Veřejná hra:** tady to vadí. Řešení — otázky pro veřejné hry **neposílat s appkou**, ale
  z Workeru, a to bez správné odpovědi (ta se dopošle až s odhalením). Stejný JSON, jen jiná
  cesta doručení. Přidat časový limit (rychlé odpovědi se v prohlížeči hledat nedají).
- Nikdy nedosáhneme 100 %. Za to, co je hra zač, to stačí.

---

## 10. Odolnost (odpojení, výpadky)

| Situace | Co se stane |
|---|---|
| Hráči spadne wifi | server ho označí jako offline, hra běží dál, jeho odpovědi propadají |
| Vrátí se do 60 s | připojí se stejným `playerId`, pokračuje s dosavadním skóre |
| Odpojí se hostitel | nic zvláštního — čas i stav drží server, ne jeho zařízení |
| Odpojí se všichni | místnost se po pár minutách sama zruší |
| Nikdo nestihne odpovědět | otázka se odhalí bez bodů a jede se dál |

---

## 11. Obsah je reálná brzda

V `data/questions/` je dnes **jediný soubor (`ru.json`) s 10 otázkami.**

- Na **soukromou místnost** to stačí na pár her s kamarády.
- Na **veřejný matchmaking to nestačí ani omylem** — každá hra by byla ta samá. Odhadem je
  potřeba **aspoň 150–200 otázek** napříč zeměmi, aby dvě hry po sobě nebyly stejné.

Proto v plánu níže stojí matchmaking až za obsahem. Je to spíš úkol na psaní otázek než na kód.

---

## 12. Dopad na stávající kód

**Co se nemění:** sólo, párty na jednom zařízení, Škola, celý výběr téma → země → sekce, karty,
glóbus, ukládání rozehraných her.

**Co přibude:**

| Místo | Změna |
|---|---|
| Výběr režimu | čtvrtá dlaždice **„Online párty"** (+ ilustrace `assets/mode-online.jpg`) |
| `S.mode` | nová hodnota `"online"` vedle `"solo"` / `"party"` |
| nový soubor `online.js` | veškerá síťová logika, **načítá se až při vstupu do online režimu** |
| `renderQuestion` | drobná odbočka: odpověď neposuzuje lokálně, ale pošle na server |
| odhalení | přibude pás „kdo co zvolil" |
| rotace + Steal | v online režimu vypnuté |

Zásadní architektonické pravidlo: **online kód je oddělený modul.** Když se nenačte (offline,
výpadek), hra se chová přesně jako dnes, jen bez čtvrté dlaždice.

---

## 13. Návrh fází

| Fáze | Co | Proč v tomhle pořadí |
|---|---|---|
| **1. Místnost na kód** | hostitel založí hru, ostatní zadají kód, hraje se simultánně na vlastních zařízeních | splní hlavní část zadání („každý svůj tablet"), zvládne to i dnešních 10 otázek |
| **2. Obsah** | rozšířit banku otázek na 150+ | bez toho nemá veřejná hra smysl |
| **3. Rychlá hra** | matchmaking s cizími, generované přezdívky, serverové doručování otázek | dorovná zbytek zadání (chess.com model) |
| **4. Volitelně** | žebříček / ELO, účty, historie, „klasická párty na více zařízení" (model B) | až když se ukáže, že se to hraje |

---

## 14. Co potřebuju od tebe rozhodnout

1. **Offline-only pravidlo** — souhlasíš s překlopením na „offline-first" podle §1?
2. **Herní model** — všichni naráz (model A), jak doporučuju? Nebo trváš na tazích jako dnes?
3. **Hosting** — jsi ochotný appku nasadit veřejně (Cloudflare Pages) a případně platit ~$5/měsíc
   za server? Bez toho jde udělat maximálně hra na společné wifi, a i to jen s kompromisy.
4. **Rozsah do začátku** — jdeme fází 1 (místnost na kód), nebo chceš rovnou cílit na veřejný
   matchmaking včetně psaní otázek?
5. **Přezdívky ve veřejných hrách** — generované appkou (můj návrh kvůli dětem), nebo vlastní?
