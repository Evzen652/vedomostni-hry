# CLAUDE.md — standard projektu (čti na začátku každé session)

> **Tento soubor Claude Code načítá automaticky při startu KAŽDÉ session.**
> Ber ho jako **zdroj pravdy** pro konvence a systémová rozhodnutí tohoto projektu.
>
> **Meta-pravidlo:** Kdykoli padne **velké rozhodnutí platné pro celý systém**
> (workflow, styl, architektura, formát dat, nástroje…), MUSÍŠ ho zaznamenat níže
> do **„Systémová rozhodnutí (log)"** — stručně, s datem a důvodem. Jinak se znalost ztratí
> a příští session to bude luštit znovu. Zapisuj hned, jak rozhodnutí padne.

Vědomostní kvíz (zeměpis). Statická webová hra, běží **offline**.
Struktura viz [README.md](README.md).

**Komunikace s uživatelem: vždy česky.** Bez ohledu na to, v jakém jazyce je psaný kód,
komentáře nebo tenhle soubor — odpovědi uživateli (chat, shrnutí, hlášky) jsou vždy v češtině.

---

## Systémová rozhodnutí (log)

Nejnovější nahoře. Formát: **datum — název** + jednou větou co a proč.

- **2026-08-31 — Dluh „Více o…" má připravenou linku (gen → lint), prahy jsou ZMĚŘENÉ na existujícím fondu.**
  Poslední otevřený nález z průchodu appkou, který je opravou obsahu, ne kódu: **1 525 otázek
  z 3 702 (41 %) nemá ani `source_card`, ani `more_fact`**, takže se u nich tlačítko „Více o…"
  vůbec nevykreslí. To je dnes správné chování (karta by neměla co ukázat) — chybí obsah.
  - **[scripts/gen-more-facts.js](scripts/gen-more-facts.js) (`npm run gen-facts`)** dopisuje
    `more_fact` po deseti. **Modelu se posílá i `explanation` a obě hlášky** — právě proto,
    aby se s nimi fakt nepotkal; standard z 2026-08-10 říká, že každá vrstva nese něco jiného,
    a nejčastější způsob, jak to pokazit, není napsat nesmysl, ale napsat potřetí totéž.
    Model smí vrátit prázdný řetězec, když o tématu nic dalšího neví — vymýšlet si je horší
    než chybějící tlačítko.
  - **[scripts/lint-more-facts.js](scripts/lint-more-facts.js) (`npm run lint-facts`) má prahy
    spočítané z 907 už napsaných faktů, ne odhadnuté:** překryv kmenů s ostatními vrstvami má
    medián 20 %, 99. percentil 55 % → práh je 55 % a označí 7 otázek z 857. Délka: medián
    124 znaků, nejdelší 239 → instrukce pro model říká 110–240, ne původních 150–300.
    **Tohle je přímá lekce z auditu**, kde prahy nastavené od oka (dětská otázka nad 90 znaků)
    trefily medián fondu a vypadaly jako 950 nálezů, ačkoli neměřily nic.
  - **Překryv se počítá jen u faktů s aspoň 8 vlastními kmeny.** Krátkému faktu podíl skáče —
    `cz-t-lide-heyrovsky-polarograf` má 80 % a je v pořádku, jsou to tři slova z osmi.
  - **Kontrola je ověřená MUTACÍ.** Do dat jsem dočasně vnesl doslovnou parafrázi `explanation`
    (chycena, překryv 100 %), useknutý konec (chycen) a uvozovací vatu — **a ta neprošla.**
    Příčina je ta stará past: **`\w` a `\b` jsou v JS jen ASCII**, takže `zajímav\w*\s+je`
    nechytí „Zajímavé je" (`\w*` se zastaví před „é"). Opraveno na `\S*`; ověřeno na pěti
    variantách vaty i na tom, že dobrý fakt dál prochází. Bez mutace by kontrola tiše
    nekontrolovala třetinu toho, co slibuje — přesně jako `lint-irony` u „hranolek bez tvaru".
  - **Zatím NESPUŠTĚNO: kredit Gemini je vyčerpaný** (429 hned na prvním požadavku, ověřeno
    zkušebním během na 10 otázkách — linka doběhne až k API a spadne čistě). Ze stejného důvodu
    čekají i poslední 4 české obrázky a dvě dlaždice sekcí (`section-symboly`,
    `section-zajimavosti`), takže ty dvě dlaždice zatím padají na emoji.

- **2026-08-30 — Prompty se píšou SKRIPTEM přes Gemini, ne ručně. Pilot schválen, jede se Česko.**
  Hráč pilot 30 obrázků schválil („všechny jsou ok") a zadal soustředit se na české otázky.
  Česko má **901 otázek bez obrázku** (z 964), takže ruční psaní promptů odpadá.
  - **Nový [scripts/gen-irony-prompts.js](scripts/gen-irony-prompts.js)** (`--cc cz`) posílá otázky
    po **12** a vrací `{id: scéna}`. Celý recept z CLAUDE.md je v systémové instrukci, včetně
    toho, PROČ každá past vznikla — model pak sám volí náhradní řešení místo doslovného obcházení.
  - **Past: `gemini-2.5-pro` API novým uživatelům nedává** — 404 s odkazem na nástupce.
    Použit `gemini-3.1-pro-preview`. (Obrázkový `gemini-2.5-flash-image` funguje dál.)
  - **`responseMimeType: "application/json"`** je důvod, proč se výstup nemusí parsovat
    heuristikou — model vrátí rovnou objekt.
  - **Pořadí je závazné: prompty → `npm run lint-irony` → teprve obrázky.** Kontrola stojí nic
    a chytá čtyři pasti dřív, než se z promptů stanou peníze. Na první dávce 12/12 bez nálezu.
  - **Kvalita ověřena na vzorku:** Pražské jaro = pás tanku drtící jarní květy a v pozadí další
    čtyři (pět armád Varšavské smlouvy, bez jediného písmene); Jan Hus = sedlák přivazující
    hroty k cepu. Scéna tedy ilustruje ODPOVĚĎ, ne jen téma.
  - **Zápis drží formát** (odsazení 1 mezerou + CRLF), takže diff je jen přidané řádky.
    Kontrolováno: mimo `irony_prompt` se v souboru nezměnilo nic než čárky za předchozím klíčem.

- **2026-08-30 — Offline část má konečně TEST. A dávka 901 českých ilustrací je stažená.**
  Dokončení nálezu 08 z průchodu appkou: `test:api` hlídal server, `validate` data, `sim-online`
  model ratingu — samotná hra 3 400 řádků neměla nic. Není náhoda, že všechna slepá místa
  z auditu byla právě v ní.
  - **[scripts/test-offline.js](scripts/test-offline.js) (`npm run test:offline`) netestuje kopii
    logiky, ale SKUTEČNÝ zdroj.** Celý `quiz.js` načíst nejde (sahá na DOM na 6. řádku), takže
    se konstanty a čisté funkce vytáhnou ze souboru a spustí ve `vm`. Kontrol je 528.
  - **Každá kontrola odpovídá chybě, která se v projektu opravdu stala** — ne vymyšlenému riziku:
    chybějící `COUNTRY_LL` (glóbus mířil do Guinejského zálivu, 2026-08-29), sekce mimo
    `SECTION_ORDER` (536 nedosažitelných otázek), nabídka větší než fond.
  - **Test je ověřený MUTACÍ, ne jen tím, že svítí zeleně.** Do `quiz.js` jsem dočasně vnesl
    všechny tři zmíněné chyby a ověřil, že je test chytí; pak soubor obnovil. Bez tohohle kroku
    by šlo napsat test, který nekontroluje nic — přesně to se dnes stalo u kontroly promptů,
    kde „hranolky bez tvaru" prošly kvůli slovu ve vedlejším gagu.
  - **Past: konstanty v `quiz.js` jsou zarovnané různým počtem mezer** (`const COUNTRY_FLAG  =`),
    takže hledání přes `indexOf("const X =")` je selže. Nutný regulární výraz s `\s*`.
  **Dávka obrázků:**
  - **897 z 901 uloženo, 4 neprošly** (bezpečnostní filtr: dítě nad propastí, popis těla
    u Věstonické venuše). Oba rizikové prompty přeformulovány, projdou při dalším běhu.
    Česko má teď obrázek u **960 z 964 otázek**; `img/` má 1 168 souborů / 184 MB.
  - **Past: výsledek dávky nejde načíst přes `response.text()`.** Pro 901 obrázků má JSONL
    kolem 2,7 GB a Node neumí řetězec delší než ~512 MB — spadne na „Cannot create a string
    longer than 0x1fffffe8". Nutné číst PO ŘÁDCÍCH z proudu; vedlejší přínos je, že se obrázky
    ukládají průběžně a pád nezahodí celé stažení.
  - **Past: API vrací `BATCH_STATE_*`, dokumentace mluví o `JOB_STATE_*`.** Skript psaný podle
    dokumentace by dávku nikdy nepovažoval za hotovou a tiše nestáhl nic.
  - **Kredity došly** hned po dávce, takže dvě nové dlaždice sekcí (`section-symboly`,
    `section-zajimavosti`) zatím padají na emoji. Prompty jsou napsané a zkontrolované.

- **2026-08-30 — Sekce sjednoceny: 536 otázek bylo přes výběr tématu NEDOSAŽITELNÝCH. Plus ovládání klávesnicí.**
  Průchod appkou v roli tvůrce. Nejzávažnější nález se netýkal pádu kódu, ale toho, co appka
  hráči nabídne.
  - **Dlaždice témat se stavěly z pevného `SECTION_ORDER` o devíti položkách, ale v datech bylo
    29 různých názvů sekcí.** Kdo si vybral konkrétní téma, 536 otázek (každou sedmou) nikdy
    neuviděl — šly potkat jen přes „Vybrat vše". Část byla čistá nekonzistence dat: „Kultura"
    vs. „Kultura & tradice", „Jazyk" vs. „Jazyk & slova", „Města"/„Hlavní město"/„Památky"
    vedle „Místa".
  - **Řešeno dvěma kroky:** [scripts/normalize-sections.js](scripts/normalize-sections.js)
    sjednotil 387 otázek podle OBSAHU (hlavní město je typ místa, zvířata jsou příroda, svátky
    jsou tradice; politika/doprava/věda/ekonomika padly do „Zajímavostí"), a do `SECTION_ORDER`
    přibyly **„Symboly" a „Zajímavosti"** jako plnohodnotné sekce. Po opravě je nedosažitelných
    otázek **0 z 3 702**, ověřeno v prohlížeči.
  - **Párty přiznává opakování.** Kola jsou pevné volby 3/5/8 bez ohledu na fond a `buildPartyOrder`
    po vyčerpání pásma domíchá znovu — při 8 kolech a malajsijském dětském fondu o 4 otázkách
    tedy každá padne dvakrát. Nová hláška v nastavení to řekne dopředu; volbu neubírá.
  - **Ovládání klávesnicí (1–4, A–D, Enter) a fokus po překreslení.** Obrazovka se překresluje
    přes `innerHTML`, takže fokus padal na začátek stránky a klávesnicí se hráč u KAŽDÉ otázky
    protaboval znovu. Fokus se teď vrací na první odpověď — **kromě školního režimu**, kde se
    promítá a rámeček fokusu by rušil. Enter posouvá jen po odpovědi, aby mezera omylem
    nepřeskočila otázku.
  **Dva nálezy byly moje chyba — ať je příště nikdo neopravuje znovu:**
  - **Sólo režim NIKDY neslíbil víc, než dal.** Tvrdil jsem opak. `qLimitOptions` nabízí jen
    počty, které se do fondu vejdou (fond 3 → jediná volba „3 otázky"); ověřeno na Symbolech
    pro Česko, hra hlásí „otázka 1/3".
  - **Odečítač obrazovky výsledek ohlašuje odjakživa.** Grepoval jsem `aria-live` jen v `quiz.js`,
    jenže atribut je v `hra.html` — bublina hostitele má `role="status" aria-live="polite"`
    a `answer()` do ní píše „Správně!" / „Tentokrát vedle.".
  **Poučení:** obě chyby vznikly tím, že jsem věřil grepu v jednom souboru místo toho, abych
  si chování ověřil. U appky rozdělené mezi HTML a JS to nestačí.
  **Otevřené (není to oprava kódu, ale práce):** nevyvážený fond (Česko 964, medián zbytku 38),
  41 % otázek bez `more_fact` i `source_card` (tlačítko „Více o…" se u nich nevykreslí — což je
  rozumné, ale rozporuje to zápis z 2026-07-31), a **žádný automatický test offline části**.

- **2026-08-30 — Pilot ilustrací ODEHRÁN: 5 dlaždic + 30 obrázků k otázkám, 0 chyb. Recept z CLAUDE.md drží.**
  Vygenerováno přímo z asistentovy session (viz oprava o síti níž). Výsledek: **35/35 obrázků,
  žádné selhání**, a hlavně — **všechny tři zdokumentované pasti byly obejity**:
  - **Text/čmáranice u jazykových otázek.** Vtip postavený na GESTU nebo abstraktním předmětu
    funguje: sazeč s hromadou vyřezaných háčků (ne písmen), grimasa při vyslovování „ř",
    tři úklony různé hloubky u japonského keigo. Nikde v celé sadě ani jedno písmeno.
  - **Jídlo bez popisu tvaru.** Alfajor popsaný jako „dva ploché kruhové disky spojené
    karamelem" vyšel správně, ne jako zmrzlina. Totéž fazolová polévka a masové koule.
  - **Reálná osoba.** Evita jako anonymní silueta na balkoně — Gemini neodmítlo.
  - **Prázdný svitek u „vyjmenovaných slov" vyšel opravdu prázdný**, protože si to prompt
    výslovně řekl (`completely blank`). Zákaz textu ve stylu a požadavek na text ve scéně
    se tím nepraly.
  **Čísla pro rozhodnutí o zbytku fondu:** průměr **139 kB/obrázek** (ne 176 kB, jak odhadoval
  zápis z 2026-08-28). Zbývá **3 458 otázek** → odhadem **0,46 GB** a **~$118 v batchi**
  (~$235 bez něj). `img/` má po pilotu 271 souborů / 36,8 MB.
  - **Dlaždice online rozcestníku** (`assets/mode-online.jpg`, `zk-live`, `zk-daily`, `zk-link`,
    `zk-tourney`) jsou hotové a v appce se načítají; emoji fallback už nikde nenaskakuje.
    Čtvercový režim generátoru: `node scripts/gen-irony-images.js --ui`.
  - **Klíč** se bere z prostředí nebo z gitignorovaného `.dev.vars` (řádek `GEMINI_API_KEY=…`).

- **2026-08-30 — Online část přestavěna: hierarchie místo sedmi stejných dlaždic + 5 opravených bugů.**
  Hráč hlásil, že online část „není domyšlená" a chce ji intuitivní, hravou a jednoduchou.
  Průchod kódem (`online.js`, 16 obrazovek) potvrdil, že to nebyl jen dojem.
  - **Proč lobby vypadalo jako sloupec obřích rámečků: chyběly 4 pixely.** Element má zároveň
    `.qz-modepick` (padding 24 px) i `.zk-wrap` (max-width 640, border-box), takže obsah měl
    **592 px**, ale dvě dlaždice `.qz-mode` potřebují `290+16+290 = 596`. Každá se proto zalomila
    na vlastní řádek. **Byla to nehoda, ne návrh** — offline rozcestník `.zk-wrap` nemá, a proto
    tam mřížka drží. Lobby má teď **vlastní mřížku `.zk-lobby`**, ne `.qz-modes`.
  - **Tři úrovně místo sedmi rovnocenných dlaždic:** jedna velká akce (Hrát teď), pod ní tři
    způsoby hry (Denní pětka, Souboj na odkaz, Turnaj) a tichý proužek utilit (Žebříček, Přátelé,
    Účet). **Utility mají SVG ikony, ne malované ilustrace** — schválně, aby nesoupeřily s hraním.
    Dřív měl „Účet" stejnou váhu jako „Hrát teď" a žádná dlaždice neměla obrázek, ačkoli obrazovka
    o krok dřív ukazuje čtyři malované karty.
  - **Nový hráč vidí registraci, ne přihlášení.** `renderAuth` měl natvrdo `mode="login"`, takže
    prvním, co člověk bez účtu uviděl, byl formulář pro vracející se, a založení hráče byl tichý
    odkaz v patičce. Rozlišuje to nový klíč `zk_seen` v localStorage (přežije odhlášení).
    **Hostující režim ZAMÍTNUT:** online část stojí na identitě (rating, žebříček, odveta, přátelé),
    takže by host narazil na zeď hned po první hře; účet je navíc schválně minimální (přezdívka
    + PIN, viz zápis 2026-08-25). Překážkou nebyl účet, ale to, že jsme ukazovali špatný formulář.
  - **Konec slepých uliček:** u přítele je tlačítko „Vyzvat" (recykluje souboj na odkaz — API
    přímé vyzvání nemá), v žebříčku se zvýrazní vlastní řádek, a u souboje na odkaz je „Zahrát si
    svoji půlku" povýšeno na hlavní akci — čekání na kamaráda není podmínka.
  - **Čekárna: bot je volba od začátku**, jen tiše; po 15 s (`match.js`) se povýší na hlavní akci.
    Dřív byl `display:none` a hráč patnáct vteřin koukal na statický text. Přibyly tepající tečky.

  **Pět opravených bugů (všechny šlo vidět, ne teoretických):**
  1. **„×" nezastavovalo online časovače.** `close()` v quiz.js nevolalo `stopAll()`, takže po
     odchodu z rozehrané hry běžel časovač i dotazování dál nad odpojeným DOMem a po vypršení
     limitu **přepsaly rozcestník**, který hráč mezitím otevřel. `stopAll` je proto nově
     exportované z `ZKOnline`.
  2. **Odpověď dorazivší po odchodu padala** na `insertAdjacentHTML` nad `null`. Stejná třída
     chyby jako 1 — asynchronní práce přežije obrazovku, na kterou měla kreslit.
  3. **`watchOpponent` interval nikdy nerušil** — při odpojeném elementu jen `return`.
  4. **Hráč viděl vývojářskou hlášku o spuštění dev serveru** při výpadku sítě.
  5. **Jediný neúspěšný request uprostřed hry vyhodil hráče do lobby** a partie byla pryč.
     Odeslání odpovědi se teď při výpadku sítě jednou zopakuje (chyby serveru se neopakují).
  - Drobnost: u `#zk-opp` byl **dvakrát atribut `class`**, takže `.zk-oppbar` se nikdy neuplatnil.
  **Druhá vlna (turnaje a prázdné stavy):**
  - **Ve výsledku turnajového kola je „Další kolo" HLAVNÍ akce**, ne „Zpět do turnaje".
    Bylo to obráceně, takže pokračovat ve hře vypadalo slabší než z turnaje odejít — přesně
    naopak, než o čem aréna je.
  - **Běžící turnaje jsou v seznamu nahoře, zakládání pod nimi.** Přidat se k rozjetému
    turnaji je běžnější než zakládat vlastní; dřív byl formulář první věc na obrazovce.
  - **Oba selecty při zakládání dostaly popisky** („Tempo", „Jak dlouho potrvá"). Byly to
    dva holé `<select>` a nedalo se poznat, co je co.
  - **Odpočet do konce turnaje.** `ends_at` API vracelo odjakživa, klient ho jen nepoužíval,
    takže hráč netušil, kolik času mu na další kola zbývá. Tiká po vteřině v slotu `timer`,
    který `stopAll()` uklidí; v poslední minutě přepne na vteřiny.
  - **Skončený turnaj měl nulovou akci** — jen tabulku a slepý konec. Nabídne založení nového.

  - **Ověřeno:** `npm run test:api` drží 104/104 a celý průchod odehrán v prohlížeči — registrace,
    lobby, čekárna, bot, hra, výzva přítele, žebříček. Scénář z bugů 1 a 2 (odpovědět a hned
    zavřít křížkem) reprodukován: konzole čistá, rozcestník zůstal stát.

- **2026-08-30 — Doladěny hlášky, které opakovaly vysvětlení (28 kusů). Zbytek auditu je prokazatelně šum.**
  Pokračování předchozího zápisu. Ze všech kategorií auditu měla skutečný signál jediná:
  **`quip_paraf_expl`** — hláška po správné odpovědi nesla tytéž fakty jako `explanation`, takže
  hráč četl totéž dvakrát (u Grossglockneru dokonce i s ledovcem Pasterze, u Reinheitsgebotu
  se surovinami i letopočtem). Porušuje to standard z 2026-08-10: **`explanation` nese FAKT navíc,
  hláška nese REAKCI.** Všech 28 přepsáno tak, aby hláška přidala úhel pohledu, ne další údaj.
  Kategorie je teď na nule.
  - **Při přepisu si dávej pozor na `sablona_jako`** — dvě z mých nových hlášek použily „jako by"
    a počet stoupl ze 74 na 76. Přeformulováno zpátky.
  - **Cestou nalezen a opraven překlep v datech:** „**catholická** víra" u `de-a-fuggerove`.
  **Ostatní kategorie jsou prověřený šum — nehoň je znovu:**
  - **`hlaska_mimo` (476)** měří lexikální překryv hlášky s otázkou, jenže **dobrá hláška se slovům
    z otázky schválně vyhýbá** — kontrola tedy měří fakticky opak toho, co chceme. Dva vzorky po
    pěti kusech, ani jeden skutečný nález.
  - **`sablona_jako` (74)** chytá slovo „jako", ale nalezená přirovnání vtip nesou, nenahrazují
    („jako by ho někdo polil jahodovým sirupem“). Standard míří na berličku, ne na přirovnání.
  - **`quip_wrong_opakuje` (138)** — vzorek ukázal hlášky, které správně reagují na konkrétní
    špatnou odpověď a pointu mají.
  - **`kids_dlouha_otazka` (78)** — u dětí bývá délka navíc KULISA, která pomáhá („gaučo tráví dny
    v sedle na pláni zvané pampa. Co si přehazuje přes ramena?“); zkrácení by ubralo oporu.
  - **`kids_abstraktni` (63)** předpokládá, že sekce Historie/Umění = abstraktní. Na vzorku to byli
    Horymír se Šemíkem a didgeridoo — pro dítě naopak velmi konkrétní. U obou je to teď poznamenané
    přímo ve skriptu.
  **Stav po dnešku: `validate` 0 chyb, `audit` 813 nálezů (samý šum), `lint-irony` 30/30,
  `test:api` 104/104, `sim-online` sedí se zdokumentovanými hodnotami.**

- **2026-08-30 — Migrace turnajů je od teď SPUSTITELNÝ soubor, ne popis v dokumentaci.**
  `npm run test:api` padal na „turnaj se založí a rovnou běží" s chybou **`no such table:
  tournaments`**. Příčina nebyla v kódu: lokální D1 byla naplněná před 2026-08-26, kdy turnaje
  přibyly, takže jí chyběly všechny tři tabulky i sloupec `games.tournament_id`.
  - **Neřešeno destruktivním `npm run db:init`**, i když je jen lokální — místo toho vznikla
    přírůstková migrace [migrations/2026-08-26-turnaje.sql](migrations/2026-08-26-turnaje.sql),
    která nic nemaže. Doteď byl tenhle postup popsaný jen slovy v zápisu z 2026-08-26; teď je
    spustitelný a **je to přesně ten soubor, který potřebuje i produkce** (`--remote`).
  - **Pořadí nasazení zůstává: nejdřív migrace, pak `npm run deploy`.** Nový kód je se starým
    schématem zpětně kompatibilní, ale `/api/tournament/*` by bez migrace vracely tuhle chybu.
  - Po migraci **`npm run test:api` → 104 kontrol, vše OK** (souhlasí se zápisem z 2026-08-26)
    a `npm run sim-online` dává hodnoty shodné se zdokumentovanými (93,1 % vs. 90,0 % při +200).
  - **Past do budoucna:** lokální databáze se sama nemigruje. Když test padne na „no such table",
    není to nutně chyba kódu — nejdřív porovnej `sqlite_master` se `schema.sql`.

- **2026-08-30 — Audit otázek měřil zrušené pásmo; opraven. Z 1 822 nálezů zbylo 839 a jedna skutečná vada.**
  Spuštěn `npm run validate` (0 chyb, upozornění jsou jen chybějící fotky) a `npm run audit`.
  Audit hlásil 1 822 otázek s nálezem — po prověření se ukázalo, že **většina byla vada testu,
  ne dat**. Opraveny tři věci v [scripts/audit-questions.js](scripts/audit-questions.js):
  1. **Kontroly `d1_*` visely na `difficulty === 1` a mluvily o pásmu „6–9".** To pásmo bylo
     zrušeno 2026-08-14 a `difficulty` od té doby NEZNAMENÁ věk — dětský fond určuje `q.kids`.
     Kontrola tedy hlásila ~950 nálezů o pásmu, které neexistuje (letopočet v lehké otázce pro
     dospělé je v pořádku), a **skutečný dětský fond přitom míjela**. Překlíčováno na `q.kids`,
     kódy přejmenovány na `kids_*`.
  2. **`kids_letopocet` a `kids_cislo` měřily špatnou věc — po opravě mají obě 0 nálezů.**
     Letopočet se hlídá jen v ODPOVĚDI, ne v celém textu: rok v zadání je kulisa („v roce 1998
     v Naganu… jak se tomu přezdívá?“) a dítě ho znát nemusí. Na celý text se chytaly i „Taipei
     101“ a „přes 350 schodů“. U čísel nestačí číslice kdekoli v odpovědi — chytala „Vokativ
     (5. pád)“ a „Ponte 25 de Abril“; jde o to, jestli je odpovědí číselný ODHAD.
     **Všech 11 původních nálezů byly plané poplachy, ověřeno jeden po druhém.**
  3. **Práh délky dětské otázky 90 → 150 znaků.** Devadesátka byla pro pásmo 6–9 a v dnešním
     fondu 8–11 sedí přesně na MEDIÁNU (91 znaků), takže označovala 51 % fondu. 150 je zhruba
     90. percentil, tedy 78 skutečně odlehlých otázek.
  4. **`hlaska_mimo` porovnává KMENY (5 znaků), ne přesné tvary** — 1 056 → 476. Čeština slova
     ohýbá, takže hláška „hledej v Kierkegaardovi“ nesdílela s odpovědí „Kierkegaard“ ani jeden
     token. **Zbylých 476 je ale pořád převážně šum a dál se to ladit nemá:** kontrola měří
     lexikální překryv, jenže dobrá hláška se slovům z otázky schválně vyhýbá — měří tedy
     fakticky opak toho, co chceme. Na vzorcích (2× 5–6 kusů) nebyl ani jeden skutečný nález.
  **Jediná skutečná vada v datech: `cz-q-jirasek-stare-povesti-ceske` a `cz-t-jirasek-stare-povesti-ceske`
  si navzájem prozrazovaly odpověď.** Obě jsou `!kids`, takže padají do fondu starších i dospělých
  (`starsi` je podmnožina `dospeli`). První měla v zadání „kniha **Aloise Jiráska**“, což je odpověď
  druhé; druhá měla v zadání „o **praotci Čechovi, kněžně Libuši**“, což je odpověď první. Prozrazovaly
  to i hlášky `quip_wrong` a obě měly navíc skoro totožné `explanation` i `more_fact`. Opraveno obojí.
  - **Poučení pro příští audity:** `duplicita` napříč pásmy je v pořádku (dětský fond je oddělený,
    hráč obě verze nikdy neuvidí) — hlídat je potřeba shodu **uvnitř jednoho fondu**, a hlavně
    případ, kdy si dvě otázky navzájem prozrazují odpověď. To dnešní kontrola duplicit neumí;
    našla ten pár jen náhodou přes podobnost vysvětlení.

- **2026-08-30 — Ironické prompty k obrázkům: nové pole `irony_prompt`, pilot 30 kusů, povinná kontrola před generováním.**
  Rozjeta výroba ilustrací pro 3 488 otázek bez obrázku (z 3 702). Klíčové rozhodnutí je
  **pořadí**: nejdřív pilot 30 obrázků, teprve pak dávka na zbytek. Důvod je změřený, ne opatrnický —
  všechny dnešní pasti v tomhle souboru se našly na jediné dávce 54 obrázků pro Česko a byly
  **systematické, ne náhodné** (postihly celou kategorii jazykových otázek). Pilot za ~$1 tedy
  chrání $121 dávku před tím, aby v ní bylo několik set vadných kusů podle jednoho vzoru.
  - **Pilotní sada je schválně PŘETÍŽENÁ rizikovými kategoriemi**, ne náhodná: 10× jazyk
    (past se čmáranicí místo písmen), 8× jídlo (past s tvarem), 4× vlajky a symboly, zbytek spread.
    Náhodný vzorek by tyhle kategorie skoro minul a pilot by nic nedokázal.
  - **Nové pole `irony_prompt` — `image_prompt` se NEPŘEPISUJE.** To staré je psané pro
    fotorealistický snímek (má ho 3 284 otázek) a na ironickou ilustraci se použít nedá, ale
    přepsat ho by byla nevratná ztráta.
  - **Stylový recept nežije v datech, ale v [scripts/gen-irony-images.js](scripts/gen-irony-images.js).**
    V `irony_prompt` je jen SCÉNA; styl, zákaz textu a referenční obrázek přidává skript. Jde to
    tak doladit na jednom místě pro celý fond, místo přepisování tisíců řetězců.
  - **[scripts/lint-irony-prompts.js](scripts/lint-irony-prompts.js) (`npm run lint-irony`) je povinný
    krok, ne ozdoba.** Prompt stojí ~$0,003, obrázek podle něj ~$0,034 — vadný prompt tedy zahodí
    desetinásobek toho, co stál. Kontroluje čtyři zdokumentované pasti: prompt si říká o text
    (`word`/`letter`/`label`… — s výjimkou `blank`/`empty`, což je naopak žádoucí), jídlo bez popisu
    TVARU, podoba konkrétní reálné osoby, a chybějící dominanta.
    **Pozor na falešné poplachy u dominanty:** kontrola hledá fráze typu „fills the frame"; při
    prvním běhu nahlásila 16 z 30, z toho 8 byla jen mezera v regulárním výrazu (`filling`, `fill`,
    `centre-frame`). Vždy ověřit obsah, ne jen počet — stejná lekce jako u kontroly diakritiky.
  - **Prompty pro pilot psal Claude přímo v session, ne přes API.** Na 30 kusů je to rychlejší
    a zadarmo. API a Batch režim mají smysl až na zbylých ~3 460, kde by to v chatu nešlo;
    tam vychází Opus 5 na ~$10, Sonnet 5 na ~$4, Haiku 4.5 na ~$2. **Doporučeno Opus 5** —
    rozdíl je proti $121 za obrázky nula a je to úloha, kde se kvalita modelu pozná (naráz se musí
    udržet vtip i šest zákazů).
  - **Past: `JSON.stringify(arr,null,2)` přeformátuje celé soubory otázek.** Zápis 30 polí udělal
    diff o 36 816 řádcích, protože `data/questions/*.json` má **odsazení 1 mezerou a konce řádků
    CRLF**. Správně je `JSON.stringify(arr,null,1).replace(/\n/g,"\r\n")` — ověřeno round-tripem,
    že je to bajt po bajtu shodné s originálem. Po opravě má diff 60 řádků.

- **2026-08-30 — Zemi na glóbu ukazuje POUZE bodová značka. Zvýrazňování tvaru země bylo postaveno a ZAMÍTNUTO.**
  Hráč nahlásil, že u otázky nepozná, kterou zemi glóbus ukazuje. Následovalo dlouhé kolo pokusů,
  na jehož konci se vrátil původní stav: **na glóbu je jen tečka (`.qz-beacon`) a pod ním holý
  název země**. Zápis tu zůstává proto, aby to příští session nezkoušela znovu — a hlavně kvůli
  změřeným číslům, ze kterých plyne, proč je to slepá ulička.

  **Tvrdá čísla (změřeno, ne odhad):**
  - `.qz-medal` je 225 CSS px, při DPR 1,5 tedy **337 skutečných pixelů**; po zvětšení stropu 290 px.
  - Při zoomu `2.25` pokrývá rám ±31° oblouku, takže **Česko je na glóbu široké ~16–20 px**.
  - `.qz-beacon` má **13 px + 2px prstenec**, tedy zhruba tolik, co celé Česko. Značka tu zemi
    fakticky zakrývá — ale **žádná úprava dvacetipixelového tvaru nemůže být nápadná**, takže to
    není chyba značky, ale důsledek měřítka.
  - `assets/earth.jpg` je **1024×512 a nemá hranice států**. Přiblížení proto nepomůže dvakrát:
    při zoomu `1.55` se přes 337 px roztahovalo 68 texturových pixelů (5× zvětšení, rozmazané)
    a zároveň zmizí okolní pobřeží, podle kterých se poloha jedině dá určit.

  **Co všechno se postavilo a proč to spadlo** (pořadí, v jakém to hráč odmítal):
  1. **Plná korálová výplň s ostrým obrysem 3 px** — „hrana je příliš ostrá"; vektorová čára
     vypadá na akvarelové malbě jako nalepená samolepka.
  2. **Korálová šrafura** — „ta červená tam moc nesedí"; korál je na okrové souši cizí těleso.
  3. **Výplň obrysu ironickou vlajkou `assets/country-{cc}.jpg`** — ve tvaru státu se z ilustrace
     stane nečitelná šmouha a přebije malbu.
  4. **Jemná šrafura v barvě popisku (#4a6b64)** — „to není skoro vidět"; je to fakticky barva
     inkoustových pobřeží mapy, takže s nimi splyne. (Šrafura pokrývala jen ~7 % plochy země.)
  5. **Cihlová šrafura + „reflektor"** (ztlumit celý glóbus a kolem země ztlumení vymaskovat)
     **+ silueta země u popisku** — technicky to fungovalo a bylo to konečně vidět, ale hráč
     to celé zamítl ve prospěch jednoduchosti.

  **Poučení, kdyby to někdo chtěl otevřít znovu:**
  - Zvětšit zemi jde **dvěma nezávislými pákami** a pletou se: **vzdálenost kamery** (kolik světa
    je v rámu) a **velikost medailonu** v `quiz.css` (jak velké je to na obrazovce). „Je to moc
    daleko" řeší obojí, ale „glóbus je moc přiblížený" jen ta první. **Na rozmazání ale doléhají
    stejně**, protože jde o poměr „pixely obrazovky ku pixelům textury" — zvětšení medailonu není zadarmo.
  - **ZAMÍTNUTO: ukládat `earth.jpg` ve 2048×1024.** Lanczos upscale žádnou kresbu nedoplní,
    srovnání dvou náhledů ve skutečném měřítku vyšlo k nerozeznání. Jediná skutečná cesta
    k ostřejší malbě je **přemalovat texturu ve vyšším rozlišení** (Gemini, recept níž).
  - Zoom zůstal na `2.15` a medailon na `290 px` — obojí se cestou vyladilo a hráči to vyhovovalo,
    tak se to nevracelo na původní `2.55` / `220 px`.

  **Co po tom zbylo v repu** (nepoužívané, ale funkční — nemazat bez rozmyslu):
  - [scripts/build-country-shapes.js](scripts/build-country-shapes.js) + `data/country-shapes.json`
    (79 kB): obrysy 55 zemí z **Natural Earth 110m**. **Do `dist/` se už nekopírují** (vyřazeno
    z `JEDNOTLIVE` v [scripts/build-public.js](scripts/build-public.js)).
  - **Past pro případné oživení: klíčovat se MUSÍ přes `ISO_A2_EH`, ne `ISO_A2`.** Ten má
    u **Francie, Norska a Tchaj-wanu** hodnotu `-99` (sporné suverenity), takže by tyhle tři země
    tiše vypadly. Ověřeno taky, že **žádná z 55 zemí nepřekračuje 180. poledník** (Rusko i Fidži
    mají části jako samostatné prstence) a že díry uvnitř zemí (Lesotho v Jihoafrické republice)
    přicházejí jako další prstenec, takže se kreslí přes `fill("evenodd")`.
  - **Ověřeno, že equirektangulární konvence sedí:** obrysy vykreslené vzorcem
    `x=(lon+180)/360·W`, `y=(90−lat)/180·H` padly na malbu `earth.jpg` přesně (Itálie na botu,
    Čukotka přetekla na levý okraj). Kdyby to někdo stavěl znovu, tenhle přepočet je správný.
  - **Zápis z 2026-08-15, že 6 novějších zemí nemá vlajku, je zastaralý** — ověřeno, že
    `assets/country-{cc}.jpg` existuje pro **všech 55 zemí**.

- **2026-08-29 — Oprava: 3D glóbus u otázky mířil úplně mimo zemi (chyba v náklonu podle šířky).**
  Hráč nahlásil, že glóbus u otázky neukazuje správnou zemi. Příčina: `spinGlobeTo()` v
  [quiz.js](quiz.js) natáčel glóbus kolem svislé osy na správnou délku, ale náklon podle
  zeměpisné šířky byl schválně tlumený na 55 % (`* 0.55`, komentář „mírný náklon") —
  zatímco červená značka „tady jsi" (`.qz-beacon`) sedí napevno uprostřed rámu a čeká
  přesný střed glóbu. U rovníkových zemí to nevadilo, ale třeba u Česka (50° s. š.) se
  glóbus natočil jen o ~27,5° místo 50°, takže značka ukazovala na Středomoří/severní
  Afriku misto na Česko — chyba rostla se zeměpisnou šířkou, takže postihla hlavně Evropu.
  **Textura `assets/earth.jpg` sama o sobě je v pořádku** (ověřeno mřížkou souřadnic
  napozicovanou přes obrázek — Praha, Londýn, New York, Rio, Sydney i Tokio padly přesně
  na svá místa), takže se nepřegenerovávala. Oprava: `targetX = ll[1]*Math.PI/180` bez
  tlumení — ověřeno numerickou simulací rotace (Rx∘Ry na testovací vrcholy), že po opravě
  přesně libovolná zadaná zeměpisná šířka/délka skončí v bodě (0,0,1), tedy přesně
  naproti kameře, kde beacon je.
  **Druhá, nezávislá příčina stejného hlášení:** tabulka `COUNTRY_LL` v [quiz.js](quiz.js)
  neměla souřadnice pro 6 zemí přidaných později (`be`, `dk`, `fi`, `ie`, `no`, `pt` — viz
  zápis 2026-08-15 o jejich přidání do appky) — u nich `spinGlobeTo()` padal na fallback
  `[0,20]` (Guinejský záliv u pobřeží Ghany), takže glóbus mířil do Afriky u JAKÉKOLI otázky
  z těchhle šesti zemí, bez ohledu na výše popsanou opravu náklonu. Doplněny přibližné středy.
  **Poučení pro příště:** kdykoli přibude země do `COUNTRY_BY_CC`/`COUNTRY_FLAG`/`COUNTRY_CONT`,
  patří rovnou vedle ní i řádek v `COUNTRY_LL` — jinak glóbus mlčky ukáže špatně a chyba se
  odhalí, až se na tu zemi náhodou dostane otázka.
- **2026-08-28 — Ironické ilustrace se generují přes Gemini API S REFERENČNÍM OBRÁZKEM; pollinations na ně nestačí.**
  Hledala se cesta, jak hromadně doplnit hero fotky k otázkám (**3 568 z 3 702 otázek je nemá**).
  Ověřeno na dávce 10 + 5 zkušebních obrázků. Funguje kombinace tří věcí, každá je nutná:
  1. **Gemini API napřímo** (`generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
     klíč v hlavičce `x-goog-api-key`, `responseModalities: ["IMAGE"]`, `imageConfig.aspectRatio: "16:9"`;
     obrázek se vrací base64 v `candidates[0].content.parts[].inlineData.data`).
  2. **Referenční obrázek přiložený v requestu** jako druhá `part` (`inlineData`, base64) —
     použit `assets/country-ch.jpg`, k tomu textový prefix „use the attached reference ONLY as a
     style guide … but draw a completely different scene". **Tohle je ten rozdíl.** Popsat styl
     slovy (jak to dělá pollinations recept) drží rukopis mnohem hůř; s referencí je sada
     konzistentní napoprvé a bez dolaďování seedů.
  3. **Explicitní vyloučení špatné asociace** u předmětů, které model táhne jinam.
  **Co NEfunguje (ověřeno, neopakovat):** pollinations vygeneruje hezkou scénu, ale **vtip
  z promptu prostě vynechá** — potvrzeno na TŘECH různých modelech (výchozí Flux, `nanobanana`,
  `gpt-image-2`), takže to není volba modelu, ale strop téhle cesty. Navíc `nanobanana` přes
  pollinations vracel vytrvale 500 (sdílená kapacita Vertex AI, zdokumentovaná chyba u nich).
  - **Past: „cone … overflowing with crispy fries" dá ZMRZLINU**, ne hranolky — stalo se dvakrát,
    napříč dvěma modely. Pomohl až popis tvaru + negace: „long thin rectangular sticks (not ice
    cream, not swirled)". Obecně: u jídla popsat TVAR, ne jen název.
  - **Past: prompt, který si řekne o písmena, dostane ČMÁRANICI.** Stylový recept zakazuje
    text (`no text, no words, no letters`), takže když si vtip vyžádá napsané slovo (kartička
    s souhláskami, kniha gramatiky, slovo se sedmi koncovkami), model to nedokáže sladit
    a vyrobí nesmyslná obrácená písmena, navíc vypadající anglicky — v české appce to ruší.
    Ověřeno na dávce Česka: postihlo to jazykové otázky (`cz-q-strc-prst-skrz-krk`,
    `cz-t-cesky-jazyk-obtiznost` a spol.), ~6 z 54. **Řešení: u jazykových otázek stavět vtip
    na GESTU nebo předmětu, ne na napsaném slově** — uzel na jazyku funguje, kartička s textem ne.
  - **Past: vlajka nemá obličej.** „French flag with a pouting expression" model ignoroval;
    funguje až fyzické gesto — jedna vlajka hrdě vztyčená, druhá svěšená.
  - **Past: zdarma tarif Gemini API na obrázkový model nepustí ani první request** (429 hned,
    ne až po vyčerpání). Chce to zapnutý billing na Google Cloud projektu, ke kterému klíč patří.
    **Pozor, to není totéž co předplatné Gemini Advanced v appce `gemini.google.com`** — to je
    spotřebitelská věc a na kvótu API nemá vliv.
  - **Generování musí spustit uživatel u sebe** (PowerShell). Cloudová session Claude Code má
    síťovou politiku, která `image.pollinations.ai`, `generativelanguage.googleapis.com`
    i `ai.google.dev` blokuje (403 od proxy) — ověřeno, neobcházet, nezkoušet znovu.
    > **Opraveno 2026-08-30:** tvrzení o blokaci `generativelanguage.googleapis.com` už
    > NEPLATÍ. Ověřeno přímým requestem na ten samý endpoint, který skript používá —
    > vrátil **400** (neplatný klíč), tedy server odpovídá a síť projde. Generovat tak může
    > i asistent, pokud má klíč; ten se bere z prostředí nebo z gitignorovaného `.dev.vars`.
  - **Past: skript pro uživatele psát bez zpětných apostrofů** (pokračování řádku), bez
    `"$id.$ext"` uvnitř řetězce a bez zpětného lomítka těsně před uvozovkou — při ručním
    kopírování do Poznámkového bloku se to poškodí a PowerShell spadne na chybu syntaxe.
    Název souboru volit krátký a bez pomlček, ty se při psaní do terminálu překlepnou.
  - **Ověřeno na 25 obrázcích (5 + 20): recept funguje a vtip je čitelný i v náhledu.**
    Rozlišení **1344×768 nativně** — nad cílem projektu (~1200 px) i nad tím, co potřebuje
    retina (600–1250 px), takže o rozlišení se u téhle cesty není třeba starat. Gemini vrací
    **PNG** (~2,3 MB/kus), takže převod na JPG je povinný krok, ne volitelný.
  - **ROZHODNUTO: dělá se CELÝ fond, kvalita se neškrtá. Appka smí vyžadovat připojení i v sólu.**
    Výslovné rozhodnutí uživatele („musí to být precizní, když už to děláme"). Padá tím poslední
    zbytek konvence *offline-only* — appka smí být online ve všech režimech, nejen v tom online.
    Velikost: 3 702 ilustrací = **~635 MB** (změřeno na skutečné dávce: JPG 1200 px q84 vychází
    **~176 kB na obrázek**; appka má dnes celkem ~35 MB, takže to bude ~18× víc).
    **Ověřeno, že to Cloudflare Pages unese:**
    - limit free plánu je **20 000 souborů**, `dist/` by mělo ~**3 900** (dnes 357 + 3 702 obrázků
      místo 161) — velká rezerva, a placený plán zvedá strop na 100 000;
    - limit **25 MiB na soubor**, my máme 176 kB;
    - **žádný dokumentovaný strop na celkovou velikost nasazení** neexistuje (ověřeno v oficiální
      dokumentaci i na fóru; tvrzení „100 MB na projekt", které koluje po přeprodejských webech,
      není ničím podložené).
    > **Pozor, dřívější verze tohohle zápisu tvrdila, že to blokuje offline-first — to bylo
    > nepřesné.** Appka **nikdy neměla service worker ani manifest** (ověřeno), takže v prohlížeči
    > offline nefungovala nikdy; konvence „offline-only" od založení znamenala *soběstačnost*
    > (žádná runtime volání AI a externích API, vše v repu), ne běh bez internetu. Obrázky v repu
    > tuhle konvenci naopak splňují. Skutečné omezení je velikost repa a nasazení, ne offline běh.
    - **Co z toho ale zbývá jako reálná nevýhoda:** 635 MB binárek v gitu. GitHub to unese
      (doporučený strop je ~1 GB), ale klonování se zpomalí a každá přegenerovaná verze obrázku
      v historii zůstane navždy. Kdyby to jednou vadilo, cesta ven je **Cloudflare R2** (free
      tarif 10 GB) — obrázky mimo repo, appka na ně odkazuje URL. Zatím se to nedělá, protože
      by to znamenalo druhou nasazovanou věc a nepotřebnou složitost.
    - **WebP** by fond srazil na ~350 MB při stejné kvalitě (u kreslených ilustrací s plochými
      barvami bývá o 30–50 % menší). Nezavádí se hned, ale je to nejlevnější páka, kdyby bylo
      potřeba ubrat.
  - **Hromadná výroba pojede přes BATCH režim (−50 %), protože na ni nespěcháme.** Batch sleva
    platí i na obrázkové modely; výsledky chodí asynchronně (do 24 h). Pro zbylých **3 563**
    otázek: normálně ~$0,068/obrázek = **~$242**, batch ~$0,034/obrázek = **~$121** (úspora
    ~2 800 Kč). **Nejdřív ale ověřit na 5–10 obrázcích, že v batchi jde přiložit referenční
    obrázek** — to je ta věc, která drží styl, a batch má jiný tvar požadavku.
    **Ověřeno 2026-08-28** (dokumentace přes GitHub cookbook, `ai.google.dev` je z téhle session
    blokovaný stejně jako pollinations): multimodální vstup (text + obrázek) v batchi jde,
    request má stejný tvar jako synchronní volání. Dokumentace výslovně zmiňuje kompatibilní
    výjimku — „media gen modely (Imagen, Lyria, Veo) s Batch API nefungují, ale **Nano Banana**
    pro dávkové obrázky jde použít" — a `gemini-2.5-flash-image` je přesně Nano Banana.
    **Jediná změna oproti synchronnímu skriptu:** referenci nahrát JEDNOU přes Files API
    a v každém z ~3 500 requestů se na ni jen odkázat (`file_uri`), ne posílat base64
    (~92 kB) v každém řádku znovu — to by dávkový JSONL soubor zbytečně nafouklo.
    Zbývá taky napsat ironické prompty pro ostatní otázky — pole `image_prompt` v datech
    je psané pro fotorealistický snímek, ne pro ironickou ilustraci, takže se použít nedá.

- **2026-08-26 — Turnaje (krok 9) postavené, ale NENASAZENÉ; produkční D1 potřebuje ruční migraci, ne `schema.sql`.**
  Na výslovné přání (navzdory vlastnímu dřívějšímu „záměrně nepostaveno") implementován
  model aréna-turnaje. Přehled a proč viz [docs/online-rezim.md](docs/online-rezim.md),
  sekce 9, bod 9. Stručně: `tournaments` + `tournament_players` + `tournament_queue`
  (nová, oddělená od `queue` živého duelu) + `games.tournament_id`. Stav turnaje se
  POČÍTÁ z `starts_at`/`duration_min` (`_lib/tournament.js`), nikde neukládá. Kola jsou
  obyčejné hry (`mode='turnaj'`), nehodnocené v Glicku, body se sčítají do
  `tournament_players` (`settle.js` → `creditTournament`). API: `functions/api/tournament/`
  (index = list+create, `[id]/index` = detail+žebříček, `join`, `play` = párování uvnitř
  turnaje POST+GET poll, `bot` = okamžité kolo proti botovi). Frontend recykluje duelové
  obrazovky v [online.js](../online.js) (`beginGame`/`watchOpponent`/`showResult`) přes
  `mode==='turnaj'`, plus nové `renderTournaments`/`renderTournament`/`tournamentPlay`.
  Otestováno lokálně: `npm run test:api` → **104 kontrol, vše OK** (bylo 86).
  **NENASAZENO na `zemekviz.pages.dev` a záměrně:**
  1. **Produkční D1 nejde naplnit přes `npm run db:init:remote`** — ten spouští `schema.sql`,
     který začíná `DROP TABLE`. Na produkci s reálnými (byť zatím nulovými) daty by to
     smazalo účty/rating/otázky. Nasazení téhle funkce vyžaduje RUČNÍ migraci:
     `wrangler d1 execute zemekviz --remote --command "ALTER TABLE games ADD COLUMN tournament_id TEXT"`
     + tři `CREATE TABLE` (tournaments/tournament_players/tournament_queue, definice viz
     [schema.sql](../schema.sql)) — bez `DROP`, jen přírůstek.
  2. **`npm run deploy` (frontend + Functions) nasadit lze samostatně** — nový kód je
     zpětně kompatibilní se starým schématem, jen endpointy `/api/tournament/*` by bez
     migrace vracely chybu „no such table". Pořadí tedy: nejdřív migrace, pak deploy,
     nebo obojí najednou, nikdy deploy sám bez migrace.
  3. Lokálně `npm run db:init` (destruktivní, jen lokální `.wrangler/`) tohle nerozlišuje —
     `schema.sql` už novou verzi má, takže lokální reset rovnou vytvoří všechno správně.

- **2026-08-25 — E-mail je NEPOVINNÝ a slouží jedinému účelu: obnově zapomenutého PINu.**
  Účty stály na přezdívce + PINu bez jakékoli obnovy — kdo PIN zapomněl, přišel o účet
  i s ratingem a historií. To je u účtu, který má vydržet roky, vada, ne minimalismus.
  **Registrace se ale nemění**: pořád chce jen přezdívku a PIN, e-mail se doplňuje až
  potom v „Účet". Vzor je převzatý z dětských platforem (Roblox, Scratch), které z téhož
  důvodu e-mail nevyžadují, ale nabízejí.
  1. **Sloupec `users.email` je schválně BEZ `UNIQUE`** — rodič musí smět mít stejnou
     adresu u víc dětí. U dětského pásma to obrazovka rovnou označuje jako pole pro rodiče.
  2. **Změna i smazání e-mailu chtějí PIN**, i když je hráč přihlášený. Bez toho by stačilo
     zmocnit se odemčeného zařízení, navěsit si vlastní adresu a účet převzít.
  3. **Odpověď na žádost o obnovu je vždy stejná** — pro existující účet, neexistující účet
     i účet bez e-mailu. Jinak by endpoint sloužil ke zjišťování, které přezdívky existují.
     Hlídá to test; kdyby někdo chtěl odpověď „zpřesnit", rozbije tím tuhle vlastnost.
  4. **Token se ukládá jen jako otisk (SHA-256), je jednorázový a platí 30 minut.** Změna
     PINu zneplatní i všechny ostatní nevyužité odkazy téhož účtu.
  5. **Odkaz míří na `/hra?obnova=…`, ne na `/`.** Kořen podává appku jen v nasazení
     (`dist/index.html`); lokální `wrangler pages dev` servíruje kořen repa, kde
     `index.html` není, takže odkaz na `/` by lokálně otevřel prázdnou stránku.
  6. **NEDORUČUJE SE.** [functions/_lib/mail.js](functions/_lib/mail.js) odkaz zatím jen
     zaloguje. Poskytovatelé pustí poštu na cizí adresy až po ověření odesílající domény
     (SPF/DKIM) a projekt žádnou doménu nemá. **Až bude:** `wrangler pages secret put
     RESEND_API_KEY` + proměnná `MAIL_FROM`, kód se přepne sám podle přítomnosti klíče.
     Do té doby je celý tok hotový a otestovaný, jen poslední článek chybí.

- **2026-08-25 — Online režim NASAZEN: https://zemekviz.pages.dev (Cloudflare Pages + D1, region EEUR).**
  Nasazeno kvůli testování na mobilu, ne kvůli spuštění mezi lidi — doména se zatím neřeší,
  `*.pages.dev` stačí. **Adresa je veřejná: kdo ji dostane, může hrát.** Produkční databáze
  po ověření vyčištěna na 0 hráčů / 3 706 otázek / 18 botů.
  1. **Statika se NESMÍ nasazovat z kořene repa.** Původní `pages_build_output_dir = "."`
     nahrálo na web i `CLAUDE.md`, `schema.sql`, `package.json` a 2,8MB `data/d1-seed.sql`.
     **`.assetsignore` Pages IGNORUJE** (je to funkce Workers Assets — ověřeno, vyjmenované
     soubory zůstaly veřejně dostupné). Jediná spolehlivá cesta je nedat je do výstupu vůbec:
     `npm run build` (= [scripts/build-public.js](scripts/build-public.js)) sestaví `dist/`
     jen z toho, co má být venku, a `npm run deploy` nasazuje odtud. **Nová veřejná složka
     nebo soubor musí přibýt do seznamu v tom skriptu**, jinak se na web nedostane.
     `functions/` tam nepatří — Pages je bere z kořene projektu zvlášť.
  2. **Past: `.pages.dev` cachuje i soubory, které už nasazení nemá.** Po opravě výstupu
     vracely staré URL pořád 200; s cache-busterem (`?cb=…`) a na adrese konkrétního
     nasazení už 404. Při ověřování nasazení proto vždy obejít cache, jinak testuješ minulost.
  3. **Past: změna `database_id` ve `wrangler.toml` resetuje LOKÁLNÍ databázi.** Wrangler si
     lokální D1 klíčuje podle id, takže po doplnění skutečného id ukazoval vývoj na prázdnou
     databázi a testy padaly na „no such table: users". Řeší `npm run db:init`.
  4. **`SESSION_SECRET` teď chybí nahlas, ne potichu.** `sessionSecret()` dřív při chybějícím
     tajemství tiše spadl na konstantu `'dev-only-nepouzivat-v-produkci'`, která je veřejně
     na GitHubu — nasazení bez nastaveného tajemství by mělo podpisový klíč veřejně a kdokoli
     by si podepsal token na cizí účet. Nově se bez tajemství odmítne podepsat cokoli.
     **Lokální vývoj proto potřebuje `.dev.vars` s `ALLOW_DEV_SECRET=1`** (negituje se, vzor
     je ve verzovaném `.dev.vars.example`) — bez něj padá registrace na 500.
  5. **`npm run db:init:remote` je destruktivní.** Spouští `schema.sql`, který začíná
     `DROP TABLE` — na běžící produkci by smazal účty, ratingy i rozehrané hry. Jen pro
     první naplnění.

- **2026-08-25 — Pozvánka na souboj musí přistát v souboji, ne na rozcestníku.**
  Ruční test online režimu odhalil, že `?duel=…` fungoval jen náhodou: parametr četl až
  `ZKOnline.open()` ([online.js](online.js)), které volá **jen klik na dlaždici Online**
  ([quiz.js](quiz.js)). Kdo přišel po odkazu od kamaráda, přistál na výběru režimů bez jediné
  zmínky o výzvě a musel uhodnout, že má kliknout na Online. Druhá půlka téže chyby: i po
  přihlášení šel kód rovnou `renderLobby()` a parametr zahodil. Opraveno na třech místech —
  `open()` v quiz.js kontroluje `?duel=` už při načtení stránky, `renderAuth()` nepřihlášenému
  řekne „Někdo tě vyzval na souboj", a po úspěšném přihlášení se propadne do souboje.
  `joinFromLink()` parametr z adresy maže (`history.replaceState`), takže druhý vstup do
  Online už normálně ukáže lobby — na to při případných úpravách pozor, jinak by se hráč
  zacyklil v pořád stejném souboji.
  - **Past: `plur()` v [quiz.js](quiz.js) je uvnitř tamní closure a `online.js` na něj nedosáhne.**
    Lobby proto psalo „(1 HER)"; online.js má teď vlastní kopii se stejným pravidlem. Kdyby
    přibyl třetí soubor, je čas helper vytáhnout ven, ne kopírovat potřetí.
  - **Ověřeno, že žebříček není rozbitý, jen prázdný:** vyžaduje 5+ her **a RD < 150**, ale po
    10 hrách proti stejně nejistým soupeřům je RD ~200. Simulace nad `functions/_lib/glicko.js`:
    proti usazenému soupeři (RD 100) práh padne kolem 6. hry, proti úplně novým kolem 12.
    Prázdný stav to hráči vysvětluje, takže se nemění — jen ať to příště nikdo nehoní jako bug.
  - **Zbývá:** `assets/mode-online.jpg` neexistuje, dlaždice Online jako jediná ze čtyř padá na
    emoji fallback (a dělá 404 v konzoli). Postup výroby viz sekce „Ilustrace" níž.

- **2026-08-24 — Appka přestává být offline-only: schválen online režim ve stylu chess.com.**
  Plný návrh (režimy, rating, boti, API, datový model, pořadí stavby) žije v
  [docs/online-rezim.md](docs/online-rezim.md) — tenhle zápis drží jen rozhodnutí a jejich důvody.
  **Stav: schválený záměr, nezačato. Hosting nerozhodnut.**
  1. **Offline-only → offline-first.** Sólo, párty a škola musí fungovat bez připojení dál;
     online je oddělená čtvrtá větev, ne přepis. Původní konvence „od založení" je proto
     zúžená, ne zrušená (poznámka doplněna přímo k ní dole).
  2. **Zvolen plný rozsah najednou** (účty, párování, rating, žebříčky, turnaje), ne postupné
     ověřování menším krokem. Jediné vážné riziko téhle volby je **prázdný lobby** —
     matchmaking bez hráčské základny nemá koho párovat. Zabudované řešení: v pořadí stavby
     jsou **souboj na odkaz** a **boti** schválně PŘED živým duelem. Bot na kvíz je narozdíl
     od šachového enginu triviální — `p(správně)` z ratingu a obtížnosti + lognormální reakční
     čas, žádná AI, žádné runtime volání (drží to bod 1 pro offline část).
  3. **Rating zvlášť za věkové pásmo, ale NE za časovou kontrolu.** Pásma losují z různých
     fondů, takže výsledky napříč nimi nejsou porovnatelné (odtud tři žebříčky). Blesk vs.
     Klasika ale sdílí jeden rating: chess.com dělí podle času proto, že rychlost je tam
     samostatná dovednost, tady je znalost stejná a dělení by roztříštilo základnu na šestinky.
  4. **Anti-cheat volný, ale odpověď se nikdy neposílá dopředu.** Datová pipeline se NEBUDE
     dělit na veřejný a serverový fond (to bylo vědomě zamítnuto). Server ale musí servírovat
     otázku bez označení správné možnosti a vyhodnocovat sám — jinak stačí devtools a hra
     přestane být hra. Tolerované riziko: kdo si předem stáhne veřejný `data/questions/*.json`,
     má náskok.
  5. **Žádný chat nikde + generované přezdívky pro dětské pásmo.** Emoji reakce z pevné sady
     stačí a shodí to ze stolu celou agendu moderace, která by hobby projekt utopila.
  6. **Model ověřen simulací, ne odhadem — a simulace ho na dvou místech opravila.**
     `scripts/sim-online.js` (`npm run sim-online`, 20 000 zápasů na variantu, seedovaný RNG).
     Potvrdilo se: zápas o 10 otázkách rozlišuje dobře (+200 → 93 % výher silnějšího, vyrovnaný
     49,4 %), rating konverguje (po 20 hrách ±58 b, po 40 ±44 b, korelace 0,99), bot proti stejně
     silnému hráči vyhrává 49,6–50,3 %. Dvě věci se ale ukázaly jinak, než jsem je napsal:
     - **`difficulty` nejde použít jako obtížnost otázky** — uvnitř pásma má nulový rozptyl
       (100 % dětských má 1, 100 % dospěláckých 3), je to fakticky štítek pásma. Bot model se
       o ni původně opíral; nově se opírá o **vlastní rating otázky** počítaný z úspěšnosti
       hráčů (obdoba puzzle ratingu na Lichess). Pro žebříček to naopak **nevadí**: ploché
       obtížnosti rozlišují dokonce o něco líp (93,1 % vs. 90,0 %), protože otázka výrazně nad
       i pod úrovní obou hráčů nenese informaci.
     - **Uzavřený žebříček nemá absolutní kotvu.** Hrubá chyba ratingu zůstala zaseknutá na
       315 b i po 80 hrách — je to ale celé posun fondu, ne nepřesnost. Párování to nevadí,
       ale rozbíjí to bota s natvrdo nastaveným ratingem, takže **rating bota se přepočítává
       z jeho skutečných výsledků**. Startovní rating zároveň narovnán z 1200 na 1500 (konvence
       Glicka; jiná hodnota jen posune stupnici).
  7. **Platforma: Cloudflare Pages + Functions + D1** (rozhodnuto 2026-08-24, limity free plánu
     ověřené v dokumentaci, ne odhadem). Druhý v pořadí byl Supabase — má lepší Realtime
     i prohlížeč dat, ale znamená dvě služby a CORS, lokální vývoj chce Docker a jeho
     přihlašování stojí na e-mailu, který návrh schválně nechce. Pauzování free projektu po
     týdnu nečinnosti se dá obejít cronem, takže samo o sobě důvod nebylo. **Rozhodlo, že
     `wrangler pages dev` běží kompletně lokálně bez účtu, bez Dockeru a bez internetu** —
     vývoj i testy jdou od první minuty a doména není potřeba (Pages dá zdarma `*.pages.dev`).
     Přechod zpět je levný: kontrakt je platformově neutrální, logika v `functions/_lib/game.js`
     čistý JS, schéma skoro standardní SQL, Cloudflare-specifický jen tenký routing.
     - **Otázky se seedují do D1, nebundlují do klienta.** Jinak nejde servírovat možnosti bez
       označení správné odpovědi. `npm run db:init` naplní 3 706 otázek; **dávka INSERTu musí
       zůstat malá (25 řádků)** — při 200 řádcích jeden příkaz přeteče limit D1 na délku SQL
       (`SQLITE_TOOBIG`), protože otázka s hláškami a vysvětlením má 1–2 kB.
     - **Odpověď na už zodpovězenou otázku se odmítá (409).** Bez toho by šlo tipnout, přečíst
       si z odpovědi správný index a zkusit to znovu.
     - `npm run test:api` hlídá právě tyhle vlastnosti (22 kontrol) — hlavně to, že payload
       otázky neobsahuje `answer` ani index správné možnosti.
  8. **Postaveno autonomně: kroky 1–8, krok 9 záměrně ne.** `npm run test:api` = 85 kontrol.
     Frontend dostavěn později ([online.js](online.js)); **režim je hratelný, ale nenasazený**
     — `wrangler.toml` má pořád `database_id = "placeholder-nahrad-po-vytvoreni"`, takže běží
     jen lokálně. Detaily v [docs/online-rezim.md](docs/online-rezim.md), tady jen odchylky od návrhu:
     - **Živý duel běží na dotazování po ~2 s, ne na WebSocketu.** Pages Functions neumí
       definovat Durable Objects ve vlastním kódu (chtěl by to samostatný Worker navíc)
       a u otázky s limitem 10–20 s je dvousekundové zpoždění k nerozeznání. ~50 dotazů
       na hru = ~1 000 her denně ve free limitu. `functions/api/game/[id]/live.js` je
       jediné místo, které by se měnilo, kdyby to přestalo stačit.
     - **Turnaje (krok 9) nepostaveny schválně** — turnaj pro nula hráčů je přesně ta
       předčasná práce, před kterou plán varuje.
     - **Průběžné skóre soupeře jen u živého duelu.** U souboje na odkaz soupeř většinou
       už dohrál, takže by to prozradilo přesnou metu, na kterou stačí dojet.
     - **Pravý průnik neviděných jde jen u živého duelu a odvety**, kde jsou při párování
       známí oba hráči. U souboje na odkaz se otázky fixují při založení, kdy soupeře
       ještě neznáme — losuje se tedy z neviděných zakladatelem.
     - **Past: `schema.sql` má na začátku seznam `DROP TABLE`, který musí zůstat úplný.**
       Přidal jsem `queue` a `friends`, zapomněl je do seznamu doplnit a skript spadl
       v půlce na „table already exists" — databáze pak zůstala rozestavěná, část tabulek
       stará a část nová, což se projevilo až chybou „no column named friend_code".
     - **Past: `.gitignore` neumí komentář za vzorem.** `.wrangler/ # popis` tiše
       neignoruje nic; komentář musí být na vlastním řádku. Ověřit `git check-ignore -v`.
  9. **Fond otázek je konečné palivo a online to zostřuje.** Dospělácké pásmo má 1442 otázek,
     tj. 144 her po deseti bez opakování, reálně ale hráč narazí na opakování po ~30 hrách.
     Navíc musí být zápas férový, takže se losuje z **průniku otázek, které neviděl ani jeden**
     z dvojice (při nedostatku se doplní symetricky). Výroba obsahu se tím stává průběžnou
     povinností, ne jednorázovou akcí.

- **2026-08-24 — Druhé kolo: dalších +450 otázek pro Česko (150/pásmo), stejná struktura jako první kolo.**
  Na žádost „přidej dalších 450 otázek pro Česko ve stejné struktuře" zopakován postup z předchozího
  zápisu (30 agentů, 10 sekcí × 3 pásma) nad už rozšířeným fondem. `data/questions/cz.json`
  **518 → 968 otázek** (děti 170→320, starší 170→320, dospělí 178→328, přesně +150/+150/+150 po
  dořešení kolizí). Kontextové soubory pro agenty (`cz-existing-r2-*.txt`) tentokrát musely obsahovat
  všech 518 už existujících otázek (ne jen původních 68), jinak by nová dávka duplikovala i obsah
  z prvního kola. **Ověřeno:** `npm run validate` → 0 chyb; kontrola diakritiky (rovnou s opraveným
  regexem z minula) → 0 skutečných chyb, 29 nahlášených výskytů, všechny ověřené ručně jako false
  positive stejného typu jako v prvním kole.
  1. **S větším fondem roste i šance na kolizi ID mezi paralelními agenty** — 13 kolizí na 450 nových
     otázek (proti 19 v prvním kole na stejný počet), i když agenti dostali k dispozici o řád větší
     kontext existujících faktů. Rozbor: 12 z 13 bylo kolizí NAPŘÍČ pásmy (často testujících téměř
     identický fakt jinak formulovaný, např. „Praděd je nejvyšší hora Moravy" v starší i dospělí) →
     přejmenováno (zachovány obě), protože `bandPool` drží pásma oddělená a hráč v jednom pásmu tu
     druhou verzi nikdy neuvidí. Jen 1 byla skutečná duplicita VE STEJNÉM pásmu (zvonkohra pražské
     Loreta, 2× v dětském pásmu, jeden v sekci Místa, druhý v Umění) → smazána jedna instance,
     doplněna 1 náhradní dětská otázka (muchomůrka červená) na přesný cíl 150/pásmo.
  2. **I s opraveným diakritickým regexem (z minulého zápisu) zůstávají false positivy** — tentokrát
     29 namísto 261, protože seznam „podezřelých" slov už neobsahuje slova, co diakritiku nepotřebují
     (jak/kdyby/opravdu/naopak). Zbylé false positivy jsou pořád ten samý mechanismus (ASCII `\b`
     uvnitř `nezůstal/nezískal/nezávislost/nezúčastnila`, `dějiny/jinak`, `muzeích/muzeí`) — u
     kontroly na diakritiku u budoucích dávek počítat s tím, že i „opravený" regex bude hlásit desítky
     false positivů, a vždy ověřit obsah ručně, ne jen počet.
- **2026-08-24 — +450 nových otázek pro Česko (150/pásmo); nové pole `more_fact` je od teď povinné pro veškerý nový obsah.**
  Na žádost „alespoň 450 nových otázek, 150 na každou věkovou kategorii, musí u nich být i více o xy"
  vygenerováno přes 30 paralelních agentů (10 sekcí × 3 pásma: Místa, Příroda, Kultura, Jídlo, Sport,
  Lidé, Umění, Jazyk, Historie do 1918/1918–dnes, u dětí navíc Symboly místo druhé historie) —
  `data/questions/cz.json` **68 → 518 otázek** (děti 20→170, starší 20→170, dospělí 28→178, tj.
  přesně +150/+150/+150 po dořešení duplicit, viz níž). Každá nová otázka nese **`more_fact`**
  (nový fakt, ne parafráze `explanation` ani hlášek) a **žádnou** `source_card` — `source_card` je
  vyhrazené pole jen pro obsah reálně importovaný z Hricky/Glóbu; nový AI-psaný obsah musí mít vždy
  `more_fact`, aby tlačítko „Více o…" mělo z čeho postavit náhradní kartu (`openMore()` fallback,
  viz zápis 2026-07-31 níže). **Ověřeno:** `npm run validate` → 0 chyb; ruční kontrola diakritiky
  (viz past níže) → 0 skutečných chyb.
  1. **Tvrdý limit 20 souběžných subagentů v tomhle prostředí.** Dispatch 4. vlny nad už běžících 20
     agentů selže rovnou hláškou „Concurrent subagent limit reached… Do not retry" — u 5 z 10 volání
     v jedné dávce. Řešení: počkat, až se uvolní sloty (dojedou dřívější agenti), pak dodispatchovat
     jen těch 5 nezdařených. Neopakovat okamžitě, nejde o transientní chybu.
  2. **Agent umí nahlásit hotovo, než soubor skutečně existuje na disku.** Jeden z 30 agentů poslal
     věrohodné shrnutí „hotovo" dřív, než `Write` doběhl — `Test-Path` bezprostředně po notifikaci
     ukázal, že soubor chybí. Dodispatchován záložní agent s explicitním „ověř Read před nahlášením
     hotovo"; originál pak sám poslal DRUHOU, mnohem delší notifikaci a soubor už existoval — nešlo
     o selhání, jen o předčasné hlášení. **Pravidlo:** u kritických dávkových výstupů vždy ověřit
     zápis na disk přímo (`Test-Path`/`Read`), nespoléhat na text notifikace samotné.
  3. **Kolize ID mezi pásmy = přejmenovat (zachovat obě), kolize v RÁMCI stejného pásma = smazat jednu.**
     Merge narazil na 18 kolizí ID + 1 proti existujícímu obsahu. Ruční kontrola obsahu (ne jen ID)
     ukázala: 14 kolizí bylo jen shoda slugu mezi RŮZNÝMI pásmy testující JINÝ fakt o stejném místě/
     tématu (běžný a přijatelný vzor v appce — `bandPool` drží pásma oddělená) → přejmenováno příponou
     (např. `-dospeli`); 5 bylo skutečně stejný fakt ve stejném pásmu → smazána jedna instance. Po
     smazání chybělo 450→445, doplněno 5 ručně psaných otázek (3 děti, 2 dospělí) na přesný cíl.
  4. **Past: kontrolní regex na chybějící diakritiku dává masivní falešné poplachy dvěma různými
     způsoby** — (a) seznam „podezřelých" slov omylem obsahoval slova, která v češtině **žádnou
     diakritiku nemají ani mít nemají** (`jak`, `kdyby`, `opravdu`, `naopak`) — u 450 delších otázek
     s běžnou češtinou to samo vygenerovalo drtivou většinu z 261 nahlášených výskytů; (b) i po
     opravě seznamu zůstalo 14 zásahů, všechny false positive z jiného důvodu: **JS `\b` bere jako
     hranici slova jen ASCII znaky**, takže uvnitř správně napsaných slov s diakritikou (`nezávislost`,
     `muzeích`, `dějiny`, `přejímalo`) vznikne „hranice" hned za/před háčkovaným písmenem a regex
     chytí ASCII podřetězec uvnitř (`nez`, `muze`, `jiny`, `malo`) jako by šlo o samostatné okleštěné
     slovo. **Skutečný výsledek: 0 chyb diakritiky.** Příště: kontrolní seznam omezit jen na slova,
     co diakritiku opravdu vyžadují, a match ověřit ručně na kontext, ne věřit součtu.

- **2026-08-24 — Pásma narovnána: dospělí bez dětských otázek, v párty hraje každý ve svém fondu za rovné body, dětské otázky mají místo hvězdičky štítek.**
  Balík oprav, které všechny plynou z jedné příčiny: **hvězdičková škála platí jen pro obecný fond
  psaný pro dospělé, ne pro dětský** — a appka to na několika místech míchala dohromady. Aktuální
  velikosti fondů: **děti 837 / puberťáci 827 / dospělí 1969** (celkem 2806). Ověřená fakta, ze
  kterých to vychází: `difficulty` nikdy nepřekročí 3 a **všech 837 dětských otázek má
  `difficulty: 1`**.
  1. **`bandPool("dospeli")` už nevrací „vše", ale `!q.kids`** (1969 místo 2806). „Dospělí = vše"
     dávalo smysl, dokud byly dětské otázky pilotní dávka o dvanácti kusech; po dorovnání dětské
     kategorie jich je 837 z 2806, takže dospělému vycházela skoro **každá třetí otázka psaná pro
     osmileté**. Větev je záměrně catch-all (ne `band==="dospeli"`) — i při neznámé hodnotě pásma je
     správnější dětské otázky vynechat než přidat.
  2. **Párty: `buildPartyOrder()` předskládá otázky podle pásma hráče na tahu.** Dřív se losovalo
     z jednoho společného balíku (`shuffle(data.questions)`) a pásmo ovlivňovalo jen tón hlášky,
     takže dítě u stolu dostávalo ~41 % otázek pro dospělé. Předskládá se schválně (místo filtrování
     až při podání), aby `qCurrent()` i ukládání rozehrané hry (`orderIds` + `qServed`) zůstaly beze
     změny; **délka pole musí zůstat násobkem počtu hráčů**, jinak zarovnání pásem nepřežije
     přetečení přes `% S.order.length`.
  3. **V párty má správná odpověď pevných 100 bodů** (`qPoints()`), bonus za sérii zůstává; v sólu
     a škole se dál boduje `difficulty × 100`. Bez tohohle by bod 2 byl **horší než původní stav**:
     dětské otázky mají všechny `difficulty 1` a dospělácké 3, takže dítě by mělo strop 100 bodů
     proti 300 u dospělého a nemohlo by vyhrát nikdy. Ověřeno: stůl dítě + dospělý, oba všechno
     správně → 375:375 (se starým bodováním by to bylo 875:375).
  4. **`diffHtml()` u otázek s `kids:true` vykreslí štítek „pro děti" místo hvězdiček.** Hvězdička
     u nich byla vždycky jedna a stejná — nenesla žádnou informaci a přitom budila dojem známky na
     společné škále („★ lehká" u otázky, která není lehká otázka pro dospělé, ale otázka z jiného
     fondu). V párty navíc rovnou vysvětlí, proč je otázka jednodušší.
  5. **Tlačítko „Jdeme na to" v sólu je `disabled`, dokud hráč nevybere pásmo.** `S.band` má skrytou
     výchozí hodnotu `"dospeli"`, ale dlaždice se kvůli `S.bandTouched` tváří jako nevybrané — klik
     rovnou na start tedy tiše rozjel hru za dospělé. Stejný vzor už appka měla u výběru kontinentu
     a zemí. K tomu `.qz-go:disabled` v [quiz.css](quiz.css), jinak zablokované tlačítko vypadá aktivně.
  6. **Popisek fondu říká „Losujeme {N} otázek z {fond}"** místo holého „2806 otázek", což znělo,
     jako by hráč měl odehrát všechny. Číslo navíc bralo `data.questions.length`, takže se neměnilo
     podle pásma — u dětí hlásilo 2806 místo 837. Teď bere `bandPool()`.
  7. **Z dlaždic pásem zmizel věk** („Děti (8–11)" → „Děti"), protože třetí dlaždice ho nikdy neměla
     a párty režim popisky bez věku používá odjakživa. Rozpětí zůstávají zapsaná tady jako
     specifikace, pro koho se otázky píšou.

  **Co se tím NEvyřešilo:** pásmo „puberťáci" je pořád definované výhradně obtížností
  (`!q.kids && difficulty ≤ 2`), takže hvězdičky u něj dál fungují jako věková brána — vědomá
  zkratka, ne čistý model. Kdyby to někdy vadilo, čistá cesta je zavést explicitní `q.level`
  (`deti`/`starsi`/`dospeli`); převod z dnešních dat je **čistě mechanický, bez přehodnocování
  obsahu**, protože ta tři pásma jsou dnes přesný rozklad fondu bez překryvů.
- **2026-08-15 — +214 nových otázek (hlavně Evropa) + 6 nových zemí bez vlajky zatím.**
  Na žádost „vytvoř 200 nových otázek zejména z Evropy, nešetři ironií" vygenerováno přes
  Workflow (12 sekvenčních skupin párů zemí, kvůli limitům) 214 otázek — 1790 → 2004 celkem.
  Rozpočet cílil hlavně na nejslabší fondy (BG/PL/RO/UA/GR po 10, dřív jen 31 otázek/zemi) a na
  **6 zbrusu nových zemí**: Portugalsko (`pt`), Belgie (`be`), Dánsko (`dk`), Norsko (`no`),
  Finsko (`fi`), Irsko (`ie`) — přidány do `COUNTRY_BY_CC`/`COUNTRY_FLAG`/`COUNTRY_CONT` v
  [quiz.js](quiz.js), ale **zatím BEZ vlajkové ilustrace** (`assets/country-{cc}.jpg` chybí →
  emoji fallback). Appka to zvládá gracefully i bez `data/questions/{cc}.json` (loader:
  `r.ok?r.json():[]`), takže přidat zemi do appky a dodat jí obsah/vlajku můžou být dva oddělené
  kroky. Ironie záměrně ostřejší než dřívější standard (explicitní požadavek), ale ne urážlivá
  vůči národům. **Past:** jedna skupina (SE+SK) spadla na přechodnou chybu API uprostřed běhu;
  resume workflow (`resumeFromRunId`) doběhl zbytek a dedup logika v apply kroku správně
  přeskočila 138 už jednou zapsaných otázek z prvního (částečně úspěšného) běhu — ověřeno na
  0 duplicitních ID přes celou databázi. Vlajky pro nové země zatím k dodělání (postup viz
  sekce „Ilustrace" níže).
- **2026-08-15 — Reklasifikace 741 otázek z „puberťáci" do „dospělí"; klíč je VĚK, ne obtížnost.**
  Audit ukázal, že `difficulty` a věková vhodnost jsou dvě různé věci — spousta otázek s
  `difficulty ≤ 2` (lingvistika, ekonomické paradoxy, obscurní historické detaily malých zemí)
  vyžaduje dospělý rozhled, i když nejsou „těžké" v akademickém smyslu. Nový klíč: **teenager
  (12–16) zná/tuší jen to, co se učí ve škole nebo vstřebá z běžného života** (slavné osobnosti,
  sport, populární kultura, základní zeměpis a historie) — ne etymologie, jazykové rodiny,
  detailní politická/ekonomická historie, věda nad středoškolskou úroveň. Provedeno ve dvou
  průchodech agentem (druhý s referenčním bodem „průměrný 14letý ZŠ", ne gymnaziální premiant) —
  první konzervativní průchod (+78) byl málo přísný, druhý (+663) sedí. Výsledek: děti 280 /
  teenageři 552 / dospělí 958 (dřív teen 1293 / dospělí 217). Reklasifikace mění jen `difficulty`,
  obsah otázek se nemění.
- **2026-08-15 — Hlášky `quip_correct` a `quip_wrong` přepsány u všech 1790 otázek, tón podle věku.**
  Audit odhalil, že 1430/1790 (80 %) `quip_correct` začínalo doslova „Přesně!" — nulová variace.
  Nový standard, aplikovaný přes Workflow (paralelní/sekvenční agenti po zemích, kvůli limitům
  nakonec sekvenčně po 2–3 zemích): **děti** = opener „Tys to věděl!" + mírná ironie, nikdy
  sarkasmus; **teenageři** = cool, podpichující, žádné „Přesně!" („Překvapuješ. Čajkovskij by
  kýval."); **dospělí** = sarkasmus a absurdní kontrast („Dvě tisíciletí přežil každou armádu.
  Pak ho zničil sklad střeliva."). `quip_wrong` navíc musí reagovat na KONKRÉTNÍ špatnou odpověď
  (mrknout po zbylých distraktorech), nikdy jen „Správně je X" — to řeší `explanation`. **Past:**
  po prvním přepisu (quip_correct) mělo 147 otázek poškozenou českou diakritiku — agent psal bez
  háčků/čárek u části výstupu; nutný druhý opravný průchod. U quip_wrong se to podruhé nestalo
  (stejný prompt-pattern, ale bez problému) — nejspíš náhoda dávkování, ne systémová příčina;
  při dalším hromadném přepisu vždy zkontrolovat regexem na běžná bezháčková slova.
  Skript pro budoucí podobné operace: `scripts/apply-quip-wrong.js`.
- **2026-08-15 — Nové ilustrace `assets/band-starsi.jpg` a `assets/band-dospeli.jpg`; princip pro budoucí produkci.**
  Doplněny chybějící obrázky věkových dlaždic (teenager se zkříženýma rukama a sluchátky,
  tealové pozadí; dva nadšení přeexponovaní turisté s kloboukem/dalekohledem/mapou, okrové
  pozadí — barvy pozadí záměrně odlišné od modré u dětí). Postup: Gemini vygeneruje čtvercový
  portrét (vyšlo 1024×1024) → PowerShell/System.Drawing zmenší na 512×512 JPG q88 → přímo do
  `assets/`. **Poznatky z testování hromadné produkce (2 ilustrace v 1 obrázku, pro budoucí
  fotky k otázkám):** Gemini v chatu ignoruje přesná čísla pixelů, ale poměr stran („each panel
  exactly 1:1" nebo „4:5") respektuje spolehlivě. Grid se dvěma ilustracemi vedle sebe ale vždy
  vyjde jen ~1300–1500 px na šířku celkem bez ohledu na prompt — po rozříznutí ~650–730 px na
  panel, což NESTAČÍ pro hero obrázek otázky na retina displejích (potřeba 600–1250 px podle
  hustoty displeje), i když na malé výběrové dlaždice (92–132 px display) to má obrovskou
  rezervu. **Pro finální produkci hero fotek k otázkám proto generovat JEDNOTLIVĚ, ne v gridu.**
  Gemini navíc odmítá kreslit reálné veřejné osoby (např. Peter Sagan) — opsat na obecnou
  postavu; a scény s cedulemi/transparenty do obrázku votiskne text i přes zákaz v promptu —
  vyhýbat se motivům, které si o text říkají. Zvažováno placené Google AI Studio/Vertex API
  (Imagen 3) pro spolehlivou kontrolu rozlišení a automatizaci hromadné produkce — odloženo,
  princip zatím jen odsouhlasen.
- **2026-08-14 — Zpět na TŘI pásma: „děti" (8–11, vlastní fond), „puberťáci" (12–16), „dospělí" (vše).**
  Částečně otáčí předchozí rozhodnutí ze stejného dne (dvě pásma) — ukázalo se, že sloučení „děti"
  a `difficulty ≤ 2` bylo špatně: i ta „lehčí" trivia (Wiener Schnitzel, rok rozpadu SSSR, Mozart)
  jsou psaná pro dospělé, jen jednodušší. Klíčový nápad: **`difficulty` už neznamená věk** — je to jen
  hvězdičkové hodnocení uvnitř obecného fondu. Věk teď hlídá nové pole `q.kids` (`true` u otázek
  napsaných přímo pro 8–11 — konkrétní, obrazová fakta, žádné letopočty/procenta/politika). Filtr
  v `startGame`: **„děti" = jen `q.kids`** (zatím 12 otázek, 4 země — pilotní dávka, k rozšíření),
  **„puberťáci" = `!q.kids && difficulty ≤ 2`** (1190, beze změny obsahu — starý fond se vlastně skoro
  přesně trefuje do 12–16), **„dospělí" = vše** (1291). Past, na kterou jsem dřív doplatil: filtr
  puberťáků musí vylučovat `q.kids` výslovně — nové otázky mají taky `difficulty:1`, takže by se bez
  téhle podmínky duplicitně objevily i v puberťáckém fondu (ověřeno: 1202 místo 1190, dokud jsem to
  neopravil). UI: `renderStart` má 3 dlaždice (`assets/band-starsi.jpg` zatím neexistuje → emoji
  fallback), párty `.qz-bandbtn` má 3. `admin.html` dostal filtr „Fond: jen 8–11 / bez kids" a otázky
  s `kids:true` mají v seznamu zelený štítek „děti 8–11" místo štítku obtížnosti.
  > **Opraveno 2026-08-24 — tenhle zápis je na třech místech nepravdivý, čti ho s tímhle vědomím:**
  > (1) **„dospělí = vše" už neplatí** — dospělí dostávají `!q.kids`, viz zápis z 2026-08-24 nahoře.
  > (2) **Čísla jsou dávno zastaralá** (12 dětských / 1190 puberťáckých / 1291 celkem); dnes je to
  > 837 / 827 / 1969 z 2806. (3) **`admin.html` neexistuje a nikdy v repu nebyl** — ověřeno přes
  > `git log --all -- admin.html` (žádný commit) i `git ls-files`. Popsaný filtr a zelený štítek
  > v seznamu tedy nikdy nevznikly; štítek „pro děti" má od 2026-08-24 až hrací obrazovka v `quiz.js`.
- **2026-08-14 — Pásmo „6–9 let" zrušeno; appka má jen pásma „děti" a „dospělí".** *(nahrazeno výše)*
  Věkové dlaždice 6–9 / 10–14 (`data-kmax`, `S.kidsMax`) jsou pryč z `renderStart` i ze stavu.
  Důvod: audit odhalil, že „difficulty 1" nikdy nebyl obsah psaný pro šestileté — jsou to všeobecné
  znalosti s letopočty, procenty, válkami a abstraktními pojmy (viz „V kterém roce se rozpadl SSSR?"),
  takže hra pro 6–9 fakticky nebyla. Nové mapování v `startGame`: **„děti" = difficulty ≤ 2** (dřív to
  bylo pásmo 10–14), **„dospělí" = vše** (jen ti navíc dostávají 89 otázek difficulty 3). Párty hra už
  odjakživa měla jen děti/dospělí (jen tón hlášek), tak se neměnila. Assety `assets/age-6-9.jpg` a
  `age-10-14.jpg` jsou teď osiřelé (nikde se nenačítají) — ke smazání, až se to bude uklízet.
- **2026-08-14 — Admin nástroj + audit kvality otázek (dev-only, offline).**
  `admin.html` = samostatný revizní prohlížeč (ne pro hráče): všech 1279 otázek s filtry
  (obtížnost/země/sekce/audit/text/stav), u každé odpovědi + správná + vysvětlení + „Více o…", plus
  třístavové **označování** (k opravě / OK / neřešeno) s poznámkou; localStorage `kviz_admin_marks`,
  export „k opravě" do JSON, který dostanu a podle něj přeformuluju otázky. Odznaky u otázek jdou ze
  dvou zdrojů: **mechanický audit** (`scripts/audit-questions.js` → `data/audit.json`, `npm run audit`;
  žluté/červené — hláška přepisuje odpověď, mimo téma, červené vlajky pro nejmenší…) a **můj plošný
  úsudkový průchod** (Workflow → dílčí soubory `data/_jpart/part-*.json` → `scripts/merge-judgment.js`
  → `data/judgment.json`; fialové — nevtipné hlášky, opakující se vrstvy, sporné odpovědi…). Jaccard na
  ohýbané češtině je slabý detektor parafráze/duplicit — proto ty kontroly hlásí málo; skutečná kvalita
  se pozná až úsudkovým průchodem a ruční revizí.
- **2026-08-13 — Kompletní sada ironických vlajek (49/49 zemí) + `split-flag-grid.ps1` rozšířen na 1–4 kódy.**
  Všech 49 zemí z `COUNTRY_BY_CC` má teď vlastní ironickou vlajku v `assets/country-{cc}.jpg`.
  Skript zvládá kromě mřížky 2×2 (4 kódy) i **1 kód** (jeden samostatný obrázek — `-Codes "sa"`) a
  **2 nebo 3 vedle sebe** (`-Exact`, pás Nx1) pro kontinenty s méně zeměmi. Pozor na past s 1 kódem:
  pipeline s jediným výsledkem se v PowerShellu „rozbalí" na holý řetězec a `$cc4[0]` by pak indexoval
  ZNAKY řetězce (`"all"[0]` = `'a'`), ne prvky pole — řeší `@(...)` kolem celé pipeline při stavbě `$cc4`.
  Když Gemini nechá kolem panelů krémový okraj (běžné), použij `-Fill` (vycentrovaný čtverec) nebo
  `-Inset` (ořízne N px ze všech stran) — `-Exact` bez ničeho počítej jen s opravdu full-bleed mřížkou.
- **2026-08-13 — „Více o…" karta je BEZ fotky; tlačítko se zobrazuje jen u otázek s `source_card`.**
  `cardOverlay()` už nevykresluje `<img>` (smazané i CSS `.qz-cardimg`) — hráč viděl krátké „poskočení"
  velikosti karty, protože fotka měla vlastní výšku 170px a u chybějící fotky (většina otázek nemá
  `img/{id}.jpg`) padala na `onerror` a box se zmenšil. `frowHtml()` teď tlačítko vůbec nevykreslí,
  když otázka nemá `source_card` (~9 z 1279) — bez fotky by ta karta neměla vůbec nic k zobrazení
  (dřív fungovala jako "pohlednice" jen s fotkou, bez textu, aby se nekryla s `explanation`).
- **2026-08-13 — Dlaždice „vše" (Celý svět / Všechny země / Vybrat vše) jsou exkluzivní a klik rovnou pokračuje dál.**
  Na rozdíl od ostatních dlaždic (multi-select, čeká na tlačítko Pokračuj/Hrát) tahle jde vždy sama —
  nejde ji kombinovat s ničím jiným, takže klik je kompletní rozhodnutí a netřeba čekat na potvrzení.
  Platí pro `renderContinentPick`, `renderCountryPick` i `renderSectionPick` (sdílí stejný `goNext()` vzor).
- **2026-08-13 — `hra.html` je domovská stránka appky; `landing.html` jen přesměruje pryč.**
  `landing.html` zůstává v repu (pro pozdější použití), ale hned na začátku `<head>` má
  `location.replace("hra.html")` — i tlačítko „zpět" v prohlížeči jde po historii okna, ne po odkazech
  appky, takže bez přesměrování šlo na starou stránku dojít i po smazání všech in-app odkazů na ni.
  `location.replace` (ne `.href`) záměrně nepřidává novou položku do historie.
- **2026-08-12 — Dlaždice zemí = ironická VLAJKA, ne ilustrace země; ilustrace zemí se přesouvají k otázkám.**
  `assets/country-{cc}.jpg` (dlaždice výběru země + malé razítko `flagStamp()` u nadpisů) teď nese
  vtipně upravenou **vlajku** — Itálie caprese trikolóra, Švýcarsko kříž z bílé čokolády, Česko pěna
  valící se z modrého klínu, Německo currywurst atd. Důvod: razítko u nadpisu má říkat „která země",
  a to vlajka zvládne na první pohled líp než malovaná scéna; ironické scény zemí (Karlův most, Pisa…)
  se tím uvolnily pro velké obrázky u otázek, kde je na ně místo.
  **Postup:** Gemini vygeneruje **mřížku 2×2 se čtyřmi vlajkami**, ta se rozřeže
  [scripts/split-flag-grid.ps1](scripts/split-flag-grid.ps1). Mřížka **musí být full-bleed** — v promptu
  vynutit „each flag fills its quarter entirely, no gaps, no margin, no borders between panels" a
  **„every gag stays inside the flag's rectangle"** (jinak čáp nebo vodováha přečuhuje ven a nejde
  to čistě rozříznout). Pak stačí `-Exact` = řez přesně na čtvrtiny. Když Gemini přesto nechá kolem
  vlajek papír, je tu záložní režim bez `-Exact` (najde vlajku projekčním profilem a vyřízne kolem
  jejího středu) — je ale vratký a stálo to spoustu kol dolaďování, proto **preferuj full-bleed prompt**.
  Pozn.: `-Codes` bere **jeden řetězec oddělený čárkou** (`"it,ch,es,at"`), protože `powershell -File`
  nepředá pole spolehlivě.
- **2026-08-12 — Dlaždice kontinentů = ironická scéna s JEDNÍM velkým hrdinou; generují se po dvou v pásu 2:1.**
  `assets/cont-{id}.jpg` má stejný recept jako ironické ilustrace zemí (dominanta → vtip na ní →
  max 3 podřízené gagy): Afrika = lev v brýlích, Austrálie = klokan se surfem a koalou v kapse,
  Severní Amerika = obří kelímek, Asie = slon jako přetížená dodávka, Celý svět = glóbus zalepený
  nálepkami. **Ověřená past:** první Asie byla hustý dav lidí, kde vtip (kráva ležící na přechodu)
  ve zmenšené dlaždici zanikl — v promptu proto explicitně žádat „ONE single dominant subject, drawn
  LARGE and close to the viewer… everything else small, faint and subordinate", jinak model udělá
  přeplácanou scénu bez středu. Dva čtverce vedle sebe se vygenerují jako **jeden pás 2:1** a rozříznou
  `split-flag-grid.ps1 -Codes "asia,world" -Exact -Prefix "cont-"`. Když Gemini nechá kolem panelů
  krémový okraj (dělá to často), použij `-Fill 0.93` = z každého panelu vyřízne vycentrovaný čtverec,
  takže scéna vyplní dlaždici a je konzistentní se zbytkem sady.
- **2026-08-12 — 3D glóbus má malovanou akvarelovou texturu a plochý nasvícení.**
  `assets/earth.jpg` už není blue-marble fotomapa, ale akvarelová mapa světa (Gemini dostal původní
  texturu jako přílohu a jen ji **přemaloval** — geografie tím zůstala přesná, což je nutné, protože
  `spinGlobeTo()` natáčí glóbus na souřadnice země a značka „tady jsi" by jinak ukazovala mimo).
  Textura musí zůstat **equirektangulární 2:1** a **vyplňovat celý rám** (levý a pravý okraj = šev
  v Pacifiku; krémový okraj by udělal světlý pruh přes celý glóbus). V [quiz.js](quiz.js) je k tomu
  `shininess: 0`, ambient 0.7 a směrové světlo 0.0 — žádný lesk ani terminátor den/noc, aby glóbus
  vypadal jako namalovaný papírový míč. Původní fotomapa je zazálohovaná jako `assets/earth-bluemarble.jpg`.
- **2026-08-12 — ZAVRŽENO: malovaný „skin" celého UI z Gemini assetů (papírové pozadí + `border-image` rámečky).**
  Zkusilo se nechat Gemini namalovat UI kusy (pozadí, tlačítka, rámečky karet) a naroubovat je do CSS
  přes `border-image`. Výsledek nestál za to a vrátil se zpět; appka drží původní CSS vzhled.
  Předtím padl i pokus nechat Gemini navrhnout celou obrazovku jako mockup — ten jen opatrně obkreslil
  referenci (přidal papír a rožky), protože **Gemini je dobrý na ilustrace a textury, ne na návrh UI**.
  Nevyrobené assety zůstaly ležet v `assets/ui/` a `assets/paper-bg.jpg` **necommitnuté**; než to zkusíš
  znovu, věz, že tudy cesta nevedla.
- **2026-08-10 — Standard kvality pro `explanation` / `quip_correct` / `quip_wrong`: každá vrstva musí nést jinou informaci, ne opakovat tu samou.**
  Audit všech 1279 otázek ([docs/audit-otazky-kvalita.md](docs/audit-otazky-kvalita.md)) odhalil dva
  provázané problémy: (1) `quip_wrong` je u ~90 % otázek jen suchý přepis odpovědi bez vtipu, ačkoli
  `quip_wrong` mívá naopak nadhled; (2) i tam, kde `quip_correct` vtipné je, často jen jinak napsaně
  opakuje `explanation` — hráč tak čte tu samou myšlenku dvakrát nebo třikrát (odpověď → hláška →
  vysvětlení) místo aby každá vrstva přidala něco nového. Konkrétní příklad z hraní: otázka o italských
  hudebních termínech měla `explanation` = „termíny pocházejí z italštiny, protože skladatelé renesance
  a baroka byli Italové" a `quip_correct` = „orchestr v Japonsku se řídí stejnou italštinou" — jen
  rozvinutí téhož faktu, žádná nová informace ani opravdový vtip.
  **Pravidlo pro KAŽDOU novou i upravovanou otázku:**
  1. `quip_wrong` musí mít nadsázku/ironii/pointu — nikdy jen „Je to X — [fakt navíc]".
  2. `quip_correct`, `quip_wrong` i `explanation` se nesmí navzájem parafrázovat. `explanation` nese
     **fakt navíc**, který není v otázce ani v hlášce; hláška nese **reakci/vtip**, ne další fakt.
  3. Vyhýbat se šabloně „X je jako Y" jako berličce za vtip (appka ji už teď nadužívá).
  4. Hláška se musí vztahovat ke skutečně testovanému faktu otázky, ne k obecnému tématu země
     (audit našel 6 hlášek, co mluvily o něčem jiném, než na co se otázka ptala).
  5. Před uložením zkontrolovat, že appka nemá u stejné země jinou otázku na stejný fakt (audit
     našel duplicity, nejvíc u Kanady — 3× stejný fakt o dvojjazyčnosti).
- **2026-08-09 — Dlaždice „Celý svět" na výběru kontinentu (první dlaždice), vybere rovnou všechny země.**
  `renderContinentPick` v [quiz.js](quiz.js) má novou dlaždici, chová se exkluzivně stejně jako vzor „Vše"
  u výběru témat: klik na ni zruší výběr jednotlivých kontinentů a naopak. Po „Pokračuj" jde rovnou na
  výběr ze všech ~49 zemí najednou, bez nutnosti proklikat kontinenty jeden po druhém — nutné, jakmile appka
  pokryla desítky zemí a proklikávání po jedné přestalo dávat smysl. **Vedlejší bug opraven 2026-08-13
  (commit `0fa9438`):** obdobná dlaždice „Vše" u výběru témat (`renderSectionPick`, proměnná `allTile`)
  se dřív v kódu spočítala, ale nikdy nevložila do `body.innerHTML` — teď je vložená (`${allTile}${secTiles}`)
  a klik na ni funguje stejně exkluzivně jako u kontinentů.
- **2026-08-09 — Dopsány otázky pro všech 49 zemí z Hricka; zbývá doplnit fotky u drtivé většiny otázek.**
  `data/questions/{cc}.json` teď pokrývá každou zemi z `Hricka/data/cards/` (typicky 27 otázek na zemi,
  Rusko 113, hrstka starších zemí jen 9) — celkem 1279 otázek, `npm run validate` hlásí 0 chyb. **Hlavní
  zbývající úkol:** naprostá většina otázek nemá vlastní hero fotku `img/{otázka.id}.jpg` (jen `image_prompt`
  jako zadání pro budoucí generování) — appka bez ní spadne na fallback s razítkem země (`.qz-pic-broken`).
  Skript [scripts/copy-question-photos.js](scripts/copy-question-photos.js) zatím doplnil 132 fotek jen pro
  6 zemí (ca, es, kp, pl, ru, sk), kde Hricka měla u `source_card` reálnou fotku ke zkopírování; pro zbytek
  zemí je potřeba fotky buď nechat vygenerovat (jinak než postup pro dlaždice v sekci Ilustrace níže — ten je
  pro malované ilustrace, ne fotorealistické karty), nebo je dohledat/importovat odjinud.
- **2026-08-01 — U hráčů v párty hře se pásmo (děti/dospělí) volí přímo, věk se nezadává.**
  Číselný vstup věku (`.qz-page-in`, funkce `ageBand()`) je pryč — appka věk stejně nikde
  nepoužívala k ničemu jinému než k odvození binárního pásma pro tón hlášek (`quip_wrong.deti`
  vs. `.dospeli`), takže to bylo zbytečné klikání navíc, hlavně pro dospělé. Nahradily to dvě
  přepínací dlaždice `.qz-bandbtn` (děti/dospělí) v řádku hráče — stejný vzor, jaký má odjakživa
  sólo hra (`renderStart`, `.qz-chip[data-band]`). Nikdy věk nevracej, jen sjednoť s tímhle vzorem.
  Řádek hráče dřív nesl i výběr strany stolu (šipky pro natočení obrazovky) — ten byl odstraněný
  úplně (nešlo pochopit, co dělá, bez najetí myší); natočení k hráči teď funguje jen z výchozího
  střídavého přiřazení stran (`SIDES[i%SIDES.length]`) a z ručního poklepu na avatara za hry.

- **2026-07-31 — Jediný typ otázky je `"choice"` (výběr ze 4); `"estimate"` (číselný odhad) je zrušený.**
  Odhadovací UI (`.qz-est`, vstupní pole, `submitEstimate()`) je z appky pryč — nikdy do appky nepatřilo
  z rozhodnutí, ne z lenosti, takže ho nevracej. Poslední otázka, co ho používala (`ru-q-bajkal-hloubka`),
  je teď `choice` se 3 číselnými distraktory. `scripts/validate-data.js` typ `"choice"` vynucuje.
- **2026-07-31 — Tlačítko „Více o…" musí být u KAŽDÉ odpovědi, s tématem v 6. pádu.**
  Popisek se skládá z pole **`about`** u otázky (6. pád, např. `"Bajkalu"`, `"časových pásmech Ruska"`) —
  česky se pád odvodit nedá (`Volha → o Volze`, `Elbrus → o Elbrusu`), proto je v datech, ne v kódu.
  **Každá nová otázka musí `about` mít**; bez něj naskočí neurčité „Více o tom".
  Tlačítko se zobrazuje vždy, i když otázka nemá `source_card` — pak se karta složí z otázky samotné
  (`openMore()`: fotka `img/{id}.jpg` + odpověď jako nadpis, **bez textu**). Nikdy ho neschovávej podle
  dostupnosti karty. **Nikdy do téhle náhradní karty nedávej `q.explanation`** — to vysvětlení je vidět
  hned pod odpovědí (`.qz-expl`), takže by se jen zdvojilo; karty z Glóbu naproti tomu nesou vlastní
  `fact`, jiný text než `explanation`, a ten se zobrazit má.
  Obě tlačítka v patičce (`.qz-fbtns`) jsou stejně široká — proto má i `.qz-next` průhledný rámeček
  1,5 px a obě mají `min-width: 0`, jinak by se lišila o šířku rámečku a delšího textu.
  > **Opraveno 2026-08-31 — věta „tlačítko se zobrazuje vždy, nikdy ho neschovávej" už NEPLATÍ
  > a nevracej ji.** Tehdejší náhradní karta byla fotka + odpověď bez textu, takže u otázky bez
  > fotky (tenkrát skoro všechny) otevřela **prázdný rámeček**. Od 2026-08-13 karta fotku nemá
  > vůbec a od zavedení `more_fact` (2026-08-24) se tlačítko vykreslí tehdy, když je z čeho kartu
  > postavit: `q.source_card || q.more_fact` ([quiz.js](quiz.js), `frowHtml`). **41 % otázek nemá
  > ani jedno, takže u nich tlačítko chybí — to je dnes správně, ne chyba.** Otevřený dluh není
  > v kódu, ale v obsahu: dopsat těm otázkám `more_fact`. Zbytek zápisu (pole `about`, zákaz
  > `explanation` v náhradní kartě, stejná šířka tlačítek) platí beze změny.
- **2026-07-31 — Hrací obrazovka je od 900 px dvousloupcová: text vlevo, okno (glóbus → fotka) vpravo.**
  Každá otázka má mít vlastní fotku `img/{id}.jpg` (16:9, fotorealistická, ~1200 px na šířku, JPG q84;
  zadání je v poli `image_prompt` u otázky). Fotky **nejsou ve vysokém rozlišení**, proto dostávají jen
  ~polovinu šířky — na celou šířku byly měkké. Rám `.qz-picframe` drží `aspect-ratio: 16/9` (= poměr fotek),
  takže se nic neořezává; `object-position: 50% 38%` je jen pojistka pro fotku, co 16:9 není.
  Rám je **jedno okno**: u otázky v něm žije glóbus (fotka schovaná — spoiler), u odpovědi se fotka
  odhalí (`.revealed`), dojede zblízka a glóbus se vyfadeuje — layout se přitom ani nehne.
  **Fotka nemá žádný popisek** — zemi a téma říká řádek `.qz-meta` nad otázkou, takže cokoli
  v rohu snímku je jen duplicita (dřív se tam překrývaly „obrázek k otázce · Rusko" a rohový
  glóbus se stejným textem; pak i štítek `.qz-piccap`, taky odstraněn). Nedávej to tam znovu.
  V užším sloupci jsou odpovědi 2×2 a `<small>` v dlaždici je u odpovědi štítek nad textem
  („SPRÁVNĚ", „TVŮJ TIP") — do kolečka pro písmeno A–D se celé slovo nevejde.
  Pod 900 px se vše vrací do jednoho sloupce (fotka pod textem).
  Dokud otázka fotku nemá, naskočí fallback s razítkem země (`.qz-pic-broken`).
- **2026-07-27 — Textura 3D glóbu je bundlovaná lokálně (`assets/earth.jpg`), ne z CDN.**
  Konstanta `EARTH_TEX` v [quiz.js](quiz.js) míří na `assets/earth.jpg` (blue-marble z three-globe,
  zmenšeno na 1024×512, ~88 kB). Důvod: appka je offline-only, glóbus je u otázky velký „hrdina" —
  s CDN texturou by offline zůstal prázdný. **Nevracej CDN URL.** Přegenerování: stáhni originál
  (`cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg`) a zmenši (System.Drawing).
- **2026-07-23 — Žádná emoji v UI hry; místo nich vlastní SVG ikony + razítka.**
  Emoji v HUDu/obrazovkách jsou nahrazena malými SVG ikonami v paletě (konstanty `ICO_*` v [quiz.js](quiz.js)).
  Vlajky zemí = malé „razítko" z ilustrace země (`flagStamp()`, obrázek `assets/country-{cc}.jpg`) —
  vlajková emoji se na Windows zobrazovala jako „RU". Výběrové dlaždice = velké ilustrace (viz níže).
  **Záměrně ponecháno:** hvězdičky obtížnosti `★` (hodnocení, ne emoji) a typografické ovládací
  glyfy `×` / `✕` / `→` / `←`. Nová ikona → přidej `ICO_*` konstantu, ne emoji.
- **2026-07-23 — Ilustrace přes pollinations.ai, bez `model` parametru.**
  Malované ilustrace (dlaždice, loga, ikony) se generují přes pollinations.ai a bakají do `assets/`.
  Postup a časté pasti viz sekce **Ilustrace** níže. Důvod: appka běží offline, žádná runtime AI.
- **2026-07-23 — Výběrové dlaždice = ilustrace, ne emoji.**
  Kontinenty/země/sekce v kvízu zobrazují ilustraci ve stylu rozcestníku; emoji je jen fallback.
- **(konvence od založení) — Appka je soběstačná: žádná runtime volání AI ani externích API.**
  Vše (obrázky, data) je součástí repa. **Tohle je jádro konvence a platí beze změny.**
  > **Historie a upřesnění, ať se to nepřečte špatně:** konvence se roky psala jako
  > „appka je offline-only", což svádělo k dojmu, že běží bez internetu. **Nikdy neběžela** —
  > appka nemá service worker ani manifest (ověřeno 2026-08-28), takže v prohlížeči vždycky
  > potřebovala server. „Offline" tu odjakživa znamenalo *soběstačná*, ne *bez připojení*.
  > **Zúženo 2026-08-24:** přibyl online režim, který připojení vyžaduje otevřeně.
  > **Doplněno 2026-08-28:** appka smí vyžadovat připojení i v sólu — padlo kvůli ilustracím
  > k otázkám, kde se nechtěla škrtat kvalita (viz zápis nahoře). Soběstačnost tím netrpí:
  > obrázky pořád leží v repu, jen se stahují z nasazení místo z disku.
- **(konvence od založení) — Karty jsou read-only kopie z Glóbu.**
  `data/cards/{cc}.json` je kopie z projektu Glóbus (repo `Hricka`); kanonická verze žije tam,
  sem se kopíruje ručně. Kvíz karty jen čte.

---

## Ilustrace (dlaždice, loga, ikony) — JAK SE TVOŘÍ

Všechny malované ilustrace v `assets/` se generují jednorázově přes **pollinations.ai**
a ukládají do `assets/` jako `.jpg`. Žádný API klíč, žádné přihlášení, žádné runtime volání.

### Nejdůležitější pravidlo (jinak se to znovu luští)
- URL **NESMÍ obsahovat `model=...`**. Parametr `model=sana` (starý default) dnes vrací
  **pevný placeholder** (pořád stejná „elfka") a prompt ignoruje. `model=flux/turbo` prompt taky ignoruje.
  **Bez parametru `model`** se prompt ctí a vyjde tlumený „cestovní deník" styl, který sedí k appce.
- Recept URL: `https://image.pollinations.ai/prompt/{urlencoded_prompt}?width=512&height=512&nologo=true&seed=N`
- `seed` zamyká výsledek (stejný seed = stejný obrázek → dá se opakovat/porovnávat varianty).

### Styl (paleta „cestovního deníku" celé appky)
Za motiv se připojuje styl-suffix:
```
, painterly textured watercolor gouache illustration, aged vintage travel journal,
muted desaturated ochre cream and soft teal palette, weathered plaster texture background,
warm cozy, single centered subject, minimal simple, no text, no words, no letters, no border
```
Zásady: **jeden jednoduchý vycentrovaný motiv** (ne přeplácaná scéna), tlumené/vybledlé barvy,
`no text, no words, no letters` (modely rády vpisují nesmyslná písmena), krémovo-petrolejová paleta.
Původní recept každé staré ilustrace je zapsaný v jejím **EXIF** (pole `prompt`) — dá se přečíst a použít jako vzor.

### Generátor
[scripts/gen-illustrations.ps1](scripts/gen-illustrations.ps1) — mapa `soubor → {motiv, seed}` pro dlaždice
kontinentů/zemí/sekcí. Spuštění:
```powershell
powershell -File scripts/gen-illustrations.ps1                       # jen chybějící
powershell -File scripts/gen-illustrations.ps1 -Only cont-asia -Force # přegenerovat jednu (uprav seed v souboru)
powershell -File scripts/gen-illustrations.ps1 -Force                 # přegenerovat vše
```
Po vygenerování obrázek **vždy zkontroluj** (Read tool ho zobrazí); když nesedí, změň `seed` a přegeneruj.

### Hledání seedu, který drží styl (ověřeno 2026-08-09)
Styl **není dán jen promptem** — pipeline je plně deterministická (stejný prompt+seed = bajt po bajtu
stejný obrázek, ověřeno na `cont-europe` seed 6), takže vzhled určuje **dvojice (motiv, seed)**.
Většina seedů vrátí malbu s bílým lemem/vinětou; správný „cestovní deník" je **full-bleed** —
zvětralý papír vyplňuje celý čtverec bez okrajů.
- **Nefunguje:** `image=<url>` (reference na hotovou ilustraci) — jediný dostupný model je `sana`
  (`https://image.pollinations.ai/models` vrací `["sana"]`) a parametr `image` ignoruje; výsledek
  je identický jako bez něj. Img2img/style-transfer tedy není k dispozici.
- **Nefunguje:** dopisovat do motivu stylové pokyny („flat storybook", „full bleed, no white margin“) —
  perou se se styl-suffixem a výsledek je horší. Motiv nechej krátký a generický
  („a single X…“), styl řeší výhradně suffix.
- **Funguje:** projet víc seedů a vybrat podle **statistiky okrajů** — vzorkuj vnější rámeček pixelů
  a spočítej průměrný jas a rozptyl. Referenční ilustrace: jas ~180–205, rozptyl ~16–36
  (`country-pl` 182/34, `country-sk` 180/36, `cont-europe` 193/21). Kandidát s jasem >210 má bílý lem,
  s rozptylem <15 hladkou vinětu — oba zahoď. Ušetří to prohlížení každé varianty zvlášť.
- Pozor na motiv: slovo **„palace" dává interiéry**, konkrétní pojmenovaná památka („st stephens cathedral“)
  svádí model k fotorealistické scéně s perspektivou. Držet se vzoru ostatních dlaždic: `castle`, `temple`,
  `tree` apod.

### Dorovnání stylu po generování — [scripts/age-illustration.ps1](scripts/age-illustration.ps1)
**Pollinations dnes maluje jinak než v době vzniku původní sady** (`cont-*`, `country-pl`, `country-sk`):
nové kresby jsou čistší a airbrushové, chybí jim zvětralý papír a tlumená paleta. Ověřeno tak, že
i **přesný prompt `cont-europe` s jinými seedy** (11, 14, 21) vyšel v novém stylu — kdyby šlo jen o seed,
rukopis by držel a měnila by se pouze kompozice. Staré obrázky se reprodukují bajt po bajtu jen proto,
že identická žádost vrátí identický (nacachovaný) výsledek. **Původní rukopis už z téhle služby nevytáhneš.**

Řešení: novou ilustraci po vygenerování „zestárnout" podle referenční dlaždice —
skript přenese barevnou statistiku (průměr + rozptyl po kanálech), podklad (skvrny, vinětaci)
a zrno papíru. Referenci nejdřív rozmaže, takže z ní neprosvítají tvary budov.
```powershell
powershell -File scripts/gen-illustrations.ps1 -Only country-at -Force   # 1) vygeneruj
powershell -File scripts/age-illustration.ps1 -In assets/country-at.jpg  # 2) dorovnej styl
```
Parametry: `-Ref` (výchozí `assets/country-pl.jpg`), `-Texture` (síla podkladu, 0.45),
`-Grain` (síla zrna, 0.60), `-GrainClip` (strop zrna, 8.0 — **vyšší hodnota = z reference prosvítají
cizí tvary**, protože zrno pak nese i hrany budov). Kontrola: celkový jas má vyjít ~160–166
jako u `country-pl` (166) a `country-sk` (160).

**Past PowerShellu, na kterou skript doplatil:** proměnná pro načtené kanály se **nesmí** jmenovat `$ref` —
koliduje s parametrem `[string]$Ref` a PowerShell pole tiše zkonvertuje na řetězec (pak se indexuje
po znacích, ne po pixelech, a výsledkem je jednolitá barevná plocha). Stejně tak `@(pole, pole)`
pole rozbalí a `return $pole` je rozbalí při návratu — plnit po indexech a vracet `,$pole`.

### Ilustrace z Gemini (dnes preferovaná cesta)
Dorovnání stylu skriptem výše se k původní sadě blíží, ale rukopis úplně netrefí. **Lepší výsledek
dává vygenerovat ilustraci v Gemini** a jen ji doformátovat — tak vzniklo `country-ch.jpg` (Švýcarsko).
Uživatel obrázek vygeneruje a stáhne (`D:\weigle\stažené soubory\Gemini_Generated_Image_*.png`,
typicky 1024×1024 PNG); převod na formát dlaždic:
```powershell
# 1024x1024 PNG -> 512x512 JPG q88 do assets/country-{cc}.jpg  (System.Drawing, HighQualityBicubic)
```
Pozn.: uživatelské složky jsou přesměrované na disk **D:** (`D:\weigle\stažené soubory`, `D:\weigle\plocha`),
`$env:USERPROFILE\Downloads` neexistuje — cesty se dají zjistit z
`HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders`.

**Gemini i přes zákaz v promptu často přidá tenký lem/rámeček kolem scény** — řeší
[scripts/crop-gemini-frame.ps1](scripts/crop-gemini-frame.ps1) (rovnou volitelně místo ručního System.Drawing
kroku výše):
```powershell
powershell -File scripts/crop-gemini-frame.ps1 -In "D:\weigle\stažené soubory\Gemini_....png" -Out assets/country-cz.jpg
```
Ořezává **rovnoměrně** o pevné procento (`-Margin`, default 3 %) ze všech čtyř stran — ne hledáním
„nejtmavší linky" u kraje. To se totiž vyzkoušelo první a selhalo na Praze: nejtmavší řádek v horním
pásu obrázku byla silueta hradu na kopci, ne skutečný rámeček, takže se uřízla i katedrála. Rovnoměrný
ořez je hloupější, ale spolehlivý. Když lem po 3 % pořád zbývá, zvyš `-Margin` (např. 0.05) a spusť znovu.

### Recept na ironickou ilustraci země (ověřeno na USA, Německu, Česku)
Zadání znělo „vtipný až ironický" obrázek. **Osvědčená struktura promptu — dodržet všechny čtyři body:**

1. **Jedna ikonická dominanta** země (nezaměnitelná stavba/symbol) — dá obrázku střed a rozpoznatelnost.
2. **Hlavní vtip sedí PŘÍMO na té dominantě** — je čitelný na první pohled i ve zmenšené dlaždici.
   USA: socha Svobody drží místo pochodně kelímek s brčkem. Německo: kvadriga na Braniborské bráně
   zastavila v poklusu a čeká na červeného panáčka. Česko: barokní sochy na Karlově mostě odložily
   kříže a všechny si připíjejí půllitry.
3. **Max. 3 vedlejší gagy**, výslovně označené jako „smaller and subordinate" — dokreslí atmosféru,
   ale nesmí konkurovat hrdinovi.
4. **Jedna scéna, jedna perspektiva** — v promptu napsat „one single continuous scene with one clear
   focal point", plus stylový odstavec o papíru (viz výše) a `Warm, affectionate irony, not cynical.`

**Proč to takhle:** první pokus o Německo měl šest rovnocenných gagů (chodec, popelnice, korbel,
posuvné měřítko, hodinky, židle) bez hlavního motivu — model z toho udělal koláž oddělených vinětek,
kde nic nevyniklo. Přidání věty „jedna scéna, ne vinětky" to slepilo dohromady, ale skutečná příčina
byla jinde: **chyběl střed**. Jakmile dominanta dostala vtip na sebe a zbytek se explicitně podřídil,
vyšlo to napoprvé. Nikdy tedy nedávej víc rovnocenných vtipů vedle sebe.

### Napojení v kódu
Dlaždice ([quiz.js](quiz.js), fce `tileHtml`) načítají `assets/{cont|country|section}-*.jpg`
s **emoji fallbackem** (`onerror`). Chybějící obrázek tedy hru nerozbije — spadne zpět na emoji.
Názvy: kontinenty `cont-{id}.jpg`, země `country-{cc}.jpg`, sekce `section-{slug}.jpg`
(slugy v `SECTION_SLUG`), „Vše" = `section-vse.jpg`.

### Pozn.
Fotky ke kartám v `img/` (Polsko/Slovensko) vznikly jinak — přes **Gemini**, pak ořez bílých okrajů
a import přes [scripts/import-images.js](scripts/import-images.js).
