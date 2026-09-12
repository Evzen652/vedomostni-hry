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

**ŽÁDNÝ TEXT V APPCE NEZAČÍNÁ MALÝM PÍSMENEM. Platí to VŠUDE, bez výjimky.**
Nadpisy, tlačítka, placeholdery, štítky, prázdné stavy, chybové hlášky, popisky dlaždic
— a **taky každá HODNOTA za dvojtečkou** („Úroveň obtížnosti: **D**ěti", „Kdy: **P**řed
22 hodinami"). Hodnota za dvojtečkou je začátek textu, ne pokračování věty; přesně na tom
jsem 2026-09-02 pohořel, ačkoli pravidlo platí od 2026-09-01.
- **Konstanty se kvůli tomu NEPŘEPISUJÍ na velké.** `BAND_NAMES` a spol. jsou malé
  schválně, protože uvnitř věty se tak hodí („Pásmo „děti" má jen 4 otázky…"). Velké
  písmeno nasazuje až **zobrazení** — v `quiz.js` je na to `velke()`.
- **Grep na tohle nestačí** a je to zaplacená zkušenost (2026-09-01): mine texty skládané
  za běhu i ty uprostřed řádku za oddělovačem. Kontroluje se **skenem textových uzlů
  v prohlížeči** přes všechny obrazovky (`TreeWalker` nad `#qz-body`, hledá `/^[a-záč…]/`).
- Jediná výjimka je e-mailový placeholder „Např. adresa@priklad.cz" — sama adresa velkým
  začínat nemůže, aniž by vypadala jako chyba, proto je před ní „Např.".

**ŠIPKY V UI JSOU VÝHRADNĚ MALOVANÉ (`handArrowSvg`). Nikdy plochý glyf „→"/„←".**
Appka je celá malovaná, takže plochý typografický glyf v ní působí jako cizí těleso —
stejný důvod, proč skóre přešlo z SVG hvězdy na malovanou `ico-star.png`. Opakovaná
výtka hráče (2026-09-03: *„všude měla být tahle"*, s obrázkem malované šipky).
- **`handArrowSvg(flip)` je ta jediná šipka.** Je v `quiz.js` i (kopie) v `online.js`;
  `flip` ji otočí doleva pro „Zpět". Offline část ji používá odjakživa; online část
  na to doplatila — kreslila plochý `→` na 20+ tlačítkách i na dlaždici „Hrát teď".
- **Hlídá to `test:offline`** (po odstranění komentářů nesmí v `quiz.js` ani `online.js`
  zůstat jediný glyf `←`/`→` — každý v kódu/řetězci je UI šipka). Ověřeno mutací.
- Na `.textContent` SVG nejde — takové tlačítko musí použít `.innerHTML` (text je statický,
  bez vstupu hráče, takže to je bezpečné).

**VZDUŠNOST: mezery musí dělat SKUPINY, ne jen odsazovat. A všechno nemusí být v rámečku.**
Opakovaná výtka hráče (2026-09-03: *„to, co děláš pořád je, že všechno lepíš strašně na
sebe… nemá to žádnou vzdušnost a odlehčenost"*). Je to má výchozí chyba, ne jednorázová —
při psaní nového CSS s tím počítej.
- **Jedna hodnota `gap` na celý sloupec je ta chyba.** Když má stejnou mezeru nadpis
  s odstavcem jako dvě sousední dlaždice, oko nepozná, co k čemu patří, a obrazovka
  splyne v jeden hustý blok. Odstupňuj to: **uvnitř skupiny míň, mezi skupinami víc.**
  Ověřený rytmus lobby (`.zk-lobby`): nadpis → text **55**, text → hlavní akce **34**,
  hlavní akce → dlaždice hraní **18**, hraní → utility **30**. Základ je 18 px a hranice
  vrstev si přidávají vlastní `margin`.
- **Próza NEPATŘÍ do rámečku.** Uvítání v lobby mělo podklad i obrys a soupeřilo s kartami
  pod sebou — čtyři rámečky nad sebou. Po sundání boxu se plocha otevřela a hlavní akce
  zůstala jediná silná věc. Rámeček si zaslouží to, na co se klikne, ne to, co se čte.
- **Text potřebuje víc než `line-height: 1.4`.** U delších odstavců **1.6** a mezi
  odstavci aspoň 9 px, jinak to je zeď.
- **Měř, nehádej.** Rozdíl mezi „prkenné" a „vzdušné" jsou desítky pixelů, které se okem
  na screenshotu neodhadnou. `getBoundingClientRect()` na sousední bloky dá čísla, ze
  kterých je hierarchie vidět rovnou (a odhalí, že 24 vs 18 px žádnou skupinu netvoří).

---

## ⇢ ZAČNI TADY, KDYŽ POKRAČUJEŠ PO PŘESTÁVCE

1. **[docs/predavaci-protokol.md](docs/predavaci-protokol.md)** — co převzít, co ověřit
   (s očekávanými čísly, ať se pozná rozdíl mezi „jiné prostředí" a „regrese"), tvrdá
   pravidla a fronta práce. **Proveď převzetí podle bodu 2, než začneš cokoli měnit.**
2. **[docs/pokracovani.md](docs/pokracovani.md)** — popisný stav: co je hotové, jak
   appku rozběhnout načisto (`.dev.vars` se negituje!) a které migrace čekají na produkci.
3. **[docs/obsahovy-dluh.md](docs/obsahovy-dluh.md)** — co našel audit obsahu 2026-09-10 a čeká
   na ruční opravu (duplicity, prozrazené odpovědi, rod v hláškách, dlouhé odpovědi).

Práce žije na větvi **`claude/pokracujeme-e79708`**. `master` se posouvá těsně před nasazením
(viz [docs/nasazeni.md](docs/nasazeni.md)), takže bývá napřed i pozadu — sloučení i nasazení
jsou rozhodnutí hráče. **Po nasazení se hned vrať na pracovní větev**, jinak commity padají na master.

---

## Systémová rozhodnutí (log)

Nejnovější nahoře. Formát: **datum — název** + jednou větou co a proč.

- **2026-09-12 — Slovensko: 66/66 ilustrací. 10 vad z 66 (15 %) — nejvyšší podíl ze všech zemí dosud, ale osm z deseti byly podpisy (náhodná vada), jen dvě byly textové.**
  Dokončeno na začátku session: obrázky byly z minulé session vygenerované, ale NEPROŠLY
  kontrolou očima (viz `docs/predani-ilustrace.md`). Kontrola udělala rozdíl — postup stejný
  jako u předchozích zemí: archy 3×3, arch dolních rohů, zvětšené výřezy podezřelých míst.
  - **Dvě textové vady, obě ze stejné příčiny jako u Švédska: KONKRÉTNÍ SLOVO v zadání
    popisuje předmět, který nápis v realitě nese.** `sk-q-sagan` mělo „three identical
    rainbow jerseys hanging proudly behind him like trophies" → model dokreslil na dresy
    čitelné „IUL/UCL" a barevnou nášivku; `sk-a-valka-usa` mělo „a large plain world map"
    → model přidal nesmyslná písmena nad Afriku, i když slovo „plain" tam bylo. Obecné
    přídavné jméno u mapy nestačilo — pomohlo až explicitní „no place names, no labels
    and no writing of any kind anywhere on it" a u dresů „completely blank and unmarked
    with no crest, no patch, no lettering of any kind". Oboje opraveno jedním přeposláním.
  - **Osm podpisů, a to je nejvíc, kolik jich kdy padlo v jedné dávce.** `sk-t-tajchy`,
    `sk-k-morena-spring`, `sk-q-fujara`, `sk-q-demanovska-jaskyna`, `sk-q-velka-morava`,
    `sk-q-snp`, `sk-k-ciernohronska-zeleznica`, `sk-t-modra-majolika` — všechny náhodné,
    scéna za ně nemohla. **`sk-k-ciernohronska-zeleznica` potřebovalo TŘI pokusy**: druhé
    přegenerování zbavilo obrázek prvního podpisu, ale vyrobilo nový, jinde ve scéně (tráva
    u fotbalistů místo rohu u lokomotivy) — potvrzuje to poučení z Německa, že zákaz podpisu
    v receptu riziko jen omezuje, nikdy nevynuluje.
  - **Sporné nálezy, ponechané:** drobné škrábance na dřevěném trámu u `sk-q-stur` (rukopis
    mnichů — nečitelné čmáranice, stejný typ jako u italského zápisníku), suk ve dřevě
    u `sk-q-stur` (druhá kontrola), lišejník na kamenném sloupu u `sk-t-stred-evropy`
    a fasáda domu u `sk-t-kosice-cathedral` — při 10× zvětšení se rozpadla na šum, ne na
    čitelná písmena, takže se ponechala beze změny.
  - **Fond 3 742 otázek: bez ilustrace zbývá 1 843.** `validate` 0 chyb, `test:offline` 853.

- **2026-09-12 — Zadání pro Nizozemsko (63) napsána, zkontrolována a odeslána; obrázky zatím negenerované.**
  Psáno Sonnetem 5 přímo v session (bez API), stejně jako u předchozích zemí. Tři reálné
  historické osoby v zadáních (Rembrandt, Van Gogh, Vermeer) i dvě citlivá témata druhé
  světové války (Anne Franková, Hladová zima) záměrně vynechávají portrét/tvář a stavějí
  scénu na symbolu — prázdný stojan na obraz, pootevřená knihovna se schodištěm, talíř
  s kaší — stejný princip jako Evita v Argentině.
  - **Past objevená při lintu: 60 z 63 zadání chybělo klíčové slovní spojení „fills the
    frame"/„dominates the frame".** Kontrola `DOMINANTA` v `lint-irony-prompts.js` na něj
    váže celé varování „nepojmenovaná dominanta" — psal jsem scény s jasným jedním hrdinou,
    ale bez doslovné fráze z receptu. Po doplnění do všech 60 zadání varování zmizelo.
    **Poučení: samotný popis jednoho jasného hrdiny nestačí, recept vyžaduje SLOVO, které
    si lint umí ohlídat** — jinak je kontrola slepá vůči scénám, které jsou kompozičně
    v pořádku, ale nepojmenované.
  - **Šest jídel dostalo varování na chybějící tvar** (gouda, slaneček ×2, tulipánová kaše,
    hranolky, poffertjes) — dopsán tvar přesným slovem ze seznamu (`round`, `shaped like`,
    `paste`, `cone-shaped`, `stick-shaped`). Po opravě `lint-irony` 0 vlastních varování.
  - **Odesláno `submit --cc nl`** (~$2), stav se zjišťuje přes `batch-irony-images.js status`.

- **2026-09-12 — Francie: 66/66 ilustrací. 4 vady z 65 generování (6 %), všechny podpisy — žádná textová vada, přestože zadání obsahuje dvě rizikové scény (tiskárna/noviny, kino).**
  Zadání psaná v předchozím sezení, teď jen odeslána a zkontrolována — stejný postup jako
  u ostatních zemí. Jedna otázka (`fr-t-tour`) měla obrázek už dřív, takže dávka poslala 65.
  - **4 podpisy, všechny náhodné, všechny spravilo přeposlání stejného zadání:**
    `fr-a-sireny` (holubi na střeše), `fr-t-lumiere` (kino s parním vlakem), `fr-t-sacre-coeur-
    montmartre` (malíři na schodech) a `fr-k-crepes-bretan` (utěrka s třásněmi u sporáku).
    Žádná scéna se nemusela přestavovat.
  - **Past nenastala tam, kde se čekala.** `fr-t-lumiere` (kino, promítací plátno) a
    `fr-q-versailles`/`fr-q-carcassonne` (cedule, plakáty) jsou přesně ten typ scény, který
    u jiných zemí vyráběl text — tady prošly čistě. Potvrzuje to, že past je pravděpodobnostní,
    ne jistá: i rizikový motiv projde bez vady, jen s nižší pravděpodobností.
  - **Fond 3 742 otázek: bez ilustrace zbývá 1 907.** `validate` 0 chyb, `test:offline` 853.

- **2026-09-12 — Švédsko: 67/67 ilustrací. 5 vad ze 67 (7,5 %) — tři textové, dva podpisy; obě textové vady vznikly ze SLOVA v zadání, ne ze scény samotné.**
  Dokončeno samostatně. Postup stejný jako u předchozích zemí: `lint-irony` 0 chyb, dávka, kontrola
  přes archy 3×3, arch dolních rohů, zvětšené výřezy podezřelých míst.
  - **Tři textové vady měly společnou příčinu: KONKRÉTNÍ SLOVO v zadání si řeklo o vývěsku,
    i když zbytek věty popisoval scénu jako prázdnou.** `se-t-stokholmsky-syndrom` mělo
    „bank's brick facade" → model dokreslil ceduli „BANK"; `se-a-alkohol-paradox` mělo
    „state liquor store" → cedule „STATE LIQUOR STORE"; `se-k-icehotel` mělo „glowing hotel"
    → nápis „HOTEL" vyrytý do ledu. **Zákaz textu na tom nic nezměnil — model kreslí to, co
    ten typ budovy v realitě MÁ, bez ohledu na obecné „no text" ve stylu.** Oprava ve všech
    třech: slovo, které pojmenovává objekt nesoucí popisek (banka, obchod, hotel), z promptu
    ÚPLNĚ ODSTRANIT a nahradit neutrálním popisem („plain brick building with a completely
    blank facade", „plain shuttered storefront with a completely blank sign board",
    „fortress-like structure" místo „hotel"). Stejný princip jako Kanadin autobus/tramvaj —
    tady ale poprvé u BUDOVY, ne u dopravního prostředku.
  - **Podpisy (2): `se-k-aurora` a `se-a-goteborska-pozar`, oba náhodné, oba spravilo
    přeposlání stejného zadání.** Žádná scéna se nemusela přestavovat.
  - **`se-q-abba` (drobné čmáranice na deskách) posouzeno jako abstraktní kresba desky,
    ne text — stejný typ nálezu jako notové osnovy a rovnice u jiných zemí.**
  - **Fond 3 742 otázek: bez ilustrace zbývá 1 972.** `validate` 0 chyb, `test:offline` 853.

- **2026-09-12 — Maďarsko: 74/74 ilustrací. Nejnižší podíl vad ze všech pěti zemí zpracovaných tuhle session — jen 3 z 74 (4 %), a všechny tři byly podpisy, žádná textová.**
  Dokončeno samostatně. Zadání pro Francii (66) napsána a zkontrolována souběžně s čekáním
  na dávku, obrázky zatím negenerované.
  - **Podpisy: Aggtelek (jeskyně), marcipánové muzeum, Hortobágyský most.** Všechny tři
    opraveny jedním přegenerováním stejného zadání — žádné z nich nepotřebovalo přepis
    scény. U mostu zůstala po opravě drobná abstraktní kresba (kolo/kompas bez písmen)
    v rohu — posouzeno jako neškodná dekorace, ne podpis, ponecháno.
  - **Rovnice na tabuli u „Marťanů" (čtyři maďarští vědci) jsou v pořádku** — matematický
    zápis s proměnnými (x, a, b) se nepočítá jako zakázaný text, stejně jako notové osnovy
    u Švédska nebo Adiny náčrty u Británie. Lint na to správně nereaguje.
  - **Fond 3 742 otázek: bez ilustrace zbývá 1 973** (bylo 2 113). `validate` 0 chyb,
    `test:offline` 853.

- **2026-09-12 — Británie: 75/75 ilustrací. 7 vad ze 74 (9,5 %) — čtyři textové, tři podpisy; poštovní schránka potřebovala TŘI pokusy, protože reálná britská schránka nese vývěsku i vyražený nápis, a model si je domýšlí i přes zákaz.**
  Dokončeno samostatně, zadání připravena souběžně s čekáním na předchozí dávky.
  - **Textové vady (4): u tří stačilo popsat předmět jako prázdný, u jedné to chtělo tři kola.**
    Sherlockova adresa měla na zdi čitelnou ceduli „FANS' NEW ADDITION" (mapa na zdi si o
    popisek řekla, i když zadání mluvilo jen o „starých mapách"); Tikka Masala měla na plechovce
    rajčatové polévky vymyšlenou značku a nápis; Turingovy popsané listy měly čitelné šifrové
    znaky (i když jde o kód, ne slova, lint i oko to hodnotí stejně — **libovolný text, i „in-universe"
    kód, je vada**). Všechny tři opraveny jedním popisem navíc („zcela prázdný", „bez popisku").
    **Poštovní schránka je jiný případ:** frázi „entirely plain and unmarked" model ignoroval a
    přidal vývěsku se svozovými časy (reálné schránky ji mají). Až explicitní „absolutely nothing
    pinned, printed or fixed to it anywhere" pomohlo — obecné přídavné jméno nestačí, když
    skutečný předmět tu součást prostě MÁ; musí se řct, že konkrétní věc (vývěska) chybí.
  - **Podpisy (3): dva náhodné (poslány znovu se stejným zadáním), jeden false positive.**
    Sherlockova adresa má čísla „221B" na dveřích — to je v pořádku a žádoucí, číslice nejsou
    v zákazu, jen písmena. Drobné svislé čárky v trávě u Hadriánova valu vypadaly na první pohled
    jako podpis, po zvětšení šlo o obyčejnou texturu trávy (stejný typ nálezu jako u vlajky Švédska).
  - **Fond 3 742 otázek: bez ilustrace zbývá 2 113** (bylo 2 187). `validate` 0 chyb,
    `test:offline` 853. Zadání pro Maďarsko (74) a Švédsko (67) napsána a zkontrolována
    souběžně, obrázky zatím negenerované.

- **2026-09-12 — Itálie: 81/81 ilustrací. Jeden obrázek (Giro d'Italia) potřeboval PĚT pokusů — past nebyla v zadání, ale v samotném NÁPADU (tiskařský stroj/noviny si o text řekne pořád dokola, ať se scéna upravuje jakkoli).**
  Práce pokračovala samostatně (bez uživatele) po předchozím zápisu — psaní zadání, `lint-irony`, dávka, kontrola, opravy. Zadání psal Sonnet 5, hráč u toho zvažoval, jestli je pro psaní zadání potřeba Opus — rozhodnuto zůstat na Sonnetu, kvalita byla dostatečná.
  - **6 vad z 81 (7,4 %) v první dávce:** dvě otázky si vynutily čitelný text i přes formulaci „illegible squiggles“ (Leonardova poznámka, noviny u Gira), jedna měla falešnou smlouvu s rukopisem (Lateránská smlouva), tři měly vymyšlený podpis (sjednocení Itálie, Jaderské moře, trulli). Opraveno stejným postupem jako u Německa — **text: přestavět scénu tak, aby předmět nemohl nést popisek** (zrcadlové technické náčrtky místo poznámkového sešitu, prázdný pergamen jen s pečetěmi místo psané smlouvy); **podpis: poslat totéž zadání znovu.**
  - **Giro d'Italia je učebnicový případ „po druhém nálezu se scéna PŘESTAVUJE, ne dolaďuje“ — tady to platilo doslova PĚTKRÁT:**
    1. Novinový svitek → cyklisté prorážejí díru v titulní straně: **čitelný odstavec textu** na stránce.
    2. Tiskařský lis (bez novin, jen stroj): **vymyšlená výrobní cedulka** na rámu stroje.
    3. Tiskařský lis + explicitní „no plaques or markings of any kind": **vyražené nesmyslné slovo** na dřevěném trámu — model si cedulku domyslel přesto.
    4. Stejné zadání znovu (náhodná vada, ne systém): **nový vymyšlený podpis** v rohu.
    5. **Teprve úplná výměna dominanty vyřešila problém**: hora zlatých mincí místo tiskařského stroje — cyklisté šplhají po svahu k novinářské čepici na vrcholu. Bez stroje a bez novin nebylo pro text kam se schovat. **Vedlejší detail „loose newspaper pages“ v prvním pokusu s mincemi ale PADL NA STEJNOU past** (stránky s viditelným sloupcovým rozvržením a rámečky na fotky — i bez čitelných písmen to oko čte jako „noviny s textem“), takže musel zmizet i ten. **Poučení nad rámec „tiskařský stroj/noviny si vždycky řekne o text": i VEDLEJŠÍ REKVIZITA se stejným tématem nese stejné riziko, ne jen dominanta.**
  - **Fond 3 742 otázek: bez ilustrace zbývá 2 187** (bylo 2 268). `validate` 0 chyb, `test:offline` 853.
  - Zadání pro Británii (74) a Maďarsko (74) napsána a zkontrolována (`lint-irony` 0 chyb) souběžně s čekáním na dávky — obrázky zatím nevygenerované.

- **2026-09-12 — Německo a Rakousko: 130/130 ilustrací. Zadání psaná v předchozím sezení, teď jen odesláno a zkontrolováno — 5 vad z 130 (3,8 %), jedna faktická (špatné vlajky), ne jen kosmetická.**
  Dokončení rozdělané práce z `docs/predani-ilustrace.md`. Postup stejný jako u Ruska/Kanady:
  `lint-irony` 0 chyb, `submit --only <130 id>` (dávka ~4 min), 130/130 uloženo, kontrola přes
  archy 3×3, arch dolních rohů, zvětšené výřezy podezřelých míst. Cena ~$4,4.
  - **Nový typ vady, který dosavadní seznam nekryl: obrázek popřel vlastní odpověď.**
    `de-q-zugspitze` (vrchol leží na hranici s Rakouskem) dostal švýcarskou a švédskou vlajku
    místo německé a rakouské — zadání říkalo jen „two small flags", model si domaloval, co ho
    napadlo. **Obecné „dvě vlajky" nestačí, když je otázka přímo o tom, KTERÉ dvě** — muselo se
    napsat barevné schéma obou vlajek výslovně (černo-červeno-zlatá / červeno-bílo-červená).
    Po opravě zadání čisté napoprvé.
  - **Podpis se objevil TŘIKRÁT ve 130 kusech, pokaždé jinde a jednou i PO přegenerování stejného
    zadání** (`de-t-schwarzwald` dostal při prvním přegenerování nový podpis „Bongiem" místo
    původního renderovacího artefaktu — vyžádalo si to ještě třetí pokus). Potvrzuje to zápis
    u Kanady: zákaz v receptu podpis omezuje, ne ruší.
  - **Jeden nález byl čistý renderovací artefakt** (`de-t-schwarzwald`, první verze) — bílý
    obdélník vyplavaný uprostřed oblohy, nesouvisí s textem ani podpisem. Přegenerování stejného
    zadání ho odstranilo (a nahradilo dočasně podpisem, viz výš).
  - **Falešný poplach:** drobné škrábance ve stylu dřevoryt/vousky u několika obrázků
    (`at-k-ticha-noc-oberndorf`, tráva u `at-k-vlajka`) vypadaly na první pohled jako písmena —
    po zvětšení šlo o obyčejnou texturu (paprsky světla, trsy trávy). Zvětšený výřez je tu
    jediný spolehlivý rozhodčí, přehledový arch 600 px na to nestačí.
  - **Fond 3 742 otázek: bez ilustrace zbývá 2 268** (bylo 2 398). Německo a Rakousko mají
    obrázek u všech svých otázek (`validate` 0 chyb, `test:offline` 853).

- **2026-09-12 — Kanada: 74/74 ilustrací. Sedm vad z 81 generování, a všechny čtyři textové si vyžádala SCÉNA, ne slabý zákaz.**
  Druhá velká dávka po Rusku, stejný postup: zadání psaná v session (za ně se neplatí), `lint-irony`,
  `submit --cc ca`, dávka ~9 minut, 74/74 uloženo, kontrola očima přes archy 3×3, arch dolních rohů
  a zvětšené výřezy deseti podezřelých míst. Cena celkem ~$2,75 (74 + 6 + 1 generování).
  - **Vadných 6 z 74 (8 %), tedy stejný podíl jako u Ruska**, ale jiné složení: čtyřikrát nápis,
    dvakrát podpis. Zákaz podpisu v receptu (od Ruska) tedy zabírá, ale ne stoprocentně.
  - **Text vždycky nesl PŘEDMĚT, který se bez popisku nekreslí:** cedule nad obchody v podzemním
    městě, cíl na čele tramvaje, bublina u krávy („N!“) a písmeno na kšiltovce sojky. Pomohlo až
    scénu přestavět tak, aby pro popisek nebylo místo — holé stěny nad výlohami, sojka bez čepice,
    kráva bez bubliny. **Obecně: co v reálu nese nápis (cedule, dres, bublina, výloha), se do zadání
    nesmí dostat jako věc, jen jako prázdná plocha — nebo se musí vynechat.**
  - **Tramvaj to vrátila i podruhé**, jen o kus výš (střešní cedule místo čela). Platí tedy pravidlo
    z Ruska i tady: po druhém stejném nálezu se scéna otáčí, ne doplňuje zákaz — nově je tramvaj
    vidět **zezadu**, kde cedule není. Napotřetí čistá.
  - **PAST V KONTROLE, a hlásí ji právem: `lint-irony` bere slova „written“ a „letter“ jako chybu
    i v ZÁPORU** („nothing written anywhere“, „no letter on it“). Není to planý poplach — model čte
    zákaz jako pozvánku a přesně tyhle dvě formulace vyrobily nápis. Správně je popsat plochu
    kladně: „smooth unmarked paintwork“, „every surface is plain and unmarked“.
  - **Podpis a razítko jsou náhodná vada, zadání za ně nemůže** (Capilano, bowling) — stačí poslat
    totéž zadání znovu. **Ořez by tu nepomohl:** obě značky ležely ~50 px nad spodní hranou, kdežto
    ořez ubírá 40 řádků; hodí se jen na podpis těsně u kraje.
  - **Výřez dvakrát zachránil obrázek, který v náhledu vypadal vadně:** Terry Fox protézu opravdu má
    (v archu splývá se stínem) a kečupové brambůrky jsou plátky, ne zmrzlina. Naopak bublina u krávy
    vypadala jako tři tečky a nese písmeno. **Z náhledu 600 px se to nepozná ani nahoru, ani dolů.**
  - **Sporné, ponecháno:** `ca-k-imax-kino` má u chlapce dva drobné znaky velké ~20 px (na papíře
    mimo scénu), nečitelné a ve zobrazované velikosti ~6 px. Přegenerovat kvůli tomu celý obrázek
    se nevyplatí; kdyby vadily, jde to kdykoli přes `--only`.

- **2026-09-11 — Ilustrace k otázkám jsou ZPĚT NA 16:9, šířka 1344 px (nativní výstup modelu). Čtverec z 2026-09-01 padá.**
  > **Doplněno týž den: šířka 1000 (níž) NEPROŠLA na iPadu na výšku.** Změřeno v okně 820×1180:
  > stránka je tam jednosloupcová a obrázek se kreslí na **770×440 bodů**, retina (iPady mají
  > vždy 2×) tedy chce ~1540 px. Tisícovka pokryje 65 %, staré 1200 px 78 %, nativních 1344 px
  > z modelu 87 % — víc model v 16:9 nedá. Naležato má iPad rozvržení notebooku (~405 bodů) a
  > stačí cokoli. **Ukládá se tedy bez zmenšování, 1344×768**; cena generování je stejná, platí se
  > jen místem — naměřeno 206–255 kB, průměr **222 kB** na kus (tisícovka měla 127), takže
  > zbylých ~2 600 ilustrací zabere ~580 MB. Úplně ostré by to na tabletu na výšku bylo jen se
  > stropem šířky obrázku ~670 bodů v pásmu 768–899 px — to je změna vzhledu, NEPROVEDENO.
  > Pět zkušebních obrázků (sedm generování — Němcová a Foglar šli dvakrát) přegenerováno
  > v 1344 (dávka ~5 min), všech pět čistých. Podezřelá „písmena“ na Čapkově rukávu byly při
  > zvětšení knoflíky — **pochybné místo zvětšit výřezem, ne odhadovat z celého obrázku**.
  Čtverec se volil kvůli prázdnu kolem obrázku, dokud rám lícoval s textovou kartou. Od 2026-09-06
  se rám po odpovědi smrskne PŘESNĚ na obrázek (`.qz-pic` v toku), takže pruhy zmizely při
  jakémkoli poměru — hráč to ukázal screenshotem. Čtverec by teď jen prodloužil pravý sloupec
  o ~170 px a „Další otázka“ by spadla pod spodní okraj notebooku. 16:9 navíc sedí na mobilní
  rám i na 1 133 hotových obrázků.
  - **Dávkový skript byl celou dobu na 16:9** (proto je české dávka široká), přepnutý byl jen
    okamžitý generátor. Teď jsou oba srovnané: `gen-irony-images.js` bere 16:9 (dlaždice `--ui`
    zůstávají čtverec), `batch-irony-images.js` má šířku 1000 místo 1200 a přepínač `--only id,id`
    pro zkušební vzorek. **Šířka 1000:** rám se kreslí na ~405 CSS px, retina chce ~810, a oproti
    1200 to ušetří zhruba třetinu místa v repu. Cena generování na šířce nezávisí.
  - **ZAMÍTNUTO: dvě ilustrace na jednom obrázku** (napůl levnější). Panel by měl ~770–860 px,
    na telefonu s DPR 3 je potřeba ~1030; stejný závěr jako 2026-08-15. K tomu řez mezi panely,
    prosakování scén a filtr, který shodí obě naráz. Úspora by byla ~1 000 Kč za celý fond.
  - **Klíče Gemini byly smazané a hráč vytvořil nový** do `.dev.vars` (gitignorovaný, v historii
    gitu klíč nikdy nebyl). Nový formát klíče nezačíná „AIza“ — skripty berou celý řádek.
  - **Zkušební dávka 5 obrázků (`submit --only`) prošla celou linkou:** dávka hotová za ~4 minuty,
    5/5 uloženo, 1000×571 px, průměr **127 kB** (dosud 165) — zbytek fondu tedy ~330 MB, ne 430.
    Tři obrázky čisté hned, dva měly TEXT:
    - **Bankovka (Němcová) si o písmena řekne sama, i když zadání chce „jen ornamenty“** — model
      dokreslil pseudonápisy („DENENA“, „CONINADT“). Nepomůže zákaz, pomůže **jiná scéna bez
      potištěné plochy**: nově dáma vystupující z prázdného portrétového rámu s košíkem hladkých
      papírků. Platí obecně: bankovky, mince, knihy, cedule, mapy s popisky do scény nepatří.
    - **Vymyšlený podpis v rohu (Foglar) je náhodná vada**, zadání za ni nemůže — stačí přegenerovat
      stejné zadání. Ořez by rozbil 16:9.
    - Po opravě oba čisté. Varování `lint-irony` „dlouhé (723 znaků)“ tu nevadilo.
  - **Obrázky se musí projít očima všechny** — písmena v obraze automaticky spolehlivě nepoznáš.
    U velké dávky přes přehledové archy po desítkách, vadné znovu přes `--only`.
  - **Pozor: `submit` otázku s existujícím `img/{id}.jpg` přeskočí** — před přegenerováním starý
    obrázek přesunout stranou (ne `--force`, ten dávkový skript nemá).
  - **Rusko, první velká dávka: 132 zadání psaných v session (za zadání se neplatí), dávka ~9 min,
    132/132 uloženo, průměr 231 kB, celkem 29,8 MB.** Kontrola očima vyřadila **10 ze 132 (~8 %)**:
    - **6× vymyšlený podpis malíře v dolním rohu — nejčastější vada vůbec.** Recept (`STYL` v obou
      generátorech) má nově „no artist signature, no monogram, no scribbled name in any corner“.
    - **2× pseudonápisy, které si vyžádala scéna, ne zákaz:** fronta úředníků nesoucích trofeje
      „rok po roce“ dostala do rukou cedulky s vymyšlenými letopočty (**časový průběh nekreslit
      přes popisky**) a stará továrna cedule nad dveřmi a skříňku s čísly.
    - **1× americká vlajka na skafandru sovětského kosmonauta** — model si „vintage spacesuit“
      spojuje s NASA. U skafandrů psát výslovně, jaký odznak má, a že vlajky nemá.
    - **1× dva andělé místo tří u ikony Trojice** — obrázek tak popíral odpověď. Počet, na kterém
      stojí fakt, psát výslovně („exactly three … one on the left, one in the middle…“).
    - Všech 10 posláno znovu přes `--only`; původní verze leží v zálohách ve scratchpadu.
      **Druhé kolo: 8 z 10 čistých hned.** Zákaz podpisu v receptu pomohl, ale ne stoprocentně —
      chrám Vasila Blaženého měl podpis znovu, a Gagarin dostal vedle rudé hvězdy zase nášivku
      s pruhovanou vlajkou (obecné „no flag patches“ nestačí; teprve „jediná ozdoba celého
      skafandru je rudá hvězda, zbytek hladká oranžová látka“). **Ani to nestačilo:** třetí pokus
      měl hvězdu na hrudi a americkou vlajku na RUKÁVU. Model má kosmonauta ve skafandru pevně
      spojeného s NASA — **zákaz nepomůže, pomůže skafandr vůbec neukázat** (loď s okénkem,
      z něj jen obličej v helmě a rukavice). Obecně: když model třikrát vrátí tutéž nechtěnou
      věc, přestaň ji zakazovat a přestav scénu tak, aby pro ni nebylo místo. Čtvrtý pokus
      (stříbrná kulatá loď, v okénku jen obličej a mávající rukavice) vyšel čistý napoprvé.
    - **Výsledek Ruska: 132/132 ilustrací, všechny prošly kontrolou očima.** Stálo to ~4,50 USD
      (132 + 10 + 1 + 1 generování).
    - **Podpis u kraje se dá ODŘÍZNOUT, ne zakrýt.** Záplata z papíru vedle byla dvakrát vidět
      jako světlý obdélník, protože podpis ležel na okraji stínu dlažby a záplata ho přetnula.
      Spolehlivé je vzít horních 728 řádků, oříznout stejně z obou stran (poměr 1344:768 = 7:4,
      ne přesně 16:9) a zvětšit zpět na 1344×768 — zvětšení 5,5 % není vidět a přijde se jen
      o pruh prázdné dlažby. Hodí se jen tehdy, když u kraje nestojí nic podstatného; jinak
      znovu vygenerovat.
  - **Jak se kontroluje, aby to bylo rychlé a nic neuteklo** (skripty ve scratchpadu, postup platí):
    1. **archy 3×3** (náhled 600 px + pořadí a id) — obsah, vtip, zjevné nápisy;
    2. **arch dolních rohů** všech obrázků vedle sebe — podpisy jsou vždycky v rohu a v celkovém
       náhledu se snadno přehlédnou;
    3. **výřez pochybného místa ve dvojnásobku** — „písmena“ bývají i knoflíky nebo reliéf (Čapek,
       Bolšoj), a naopak nášivka, která v náhledu vypadá jako proužek, je vlajka.

- **2026-09-11 — Obsahový dluh, body 4 a 5: žádná hláška už nemá minulý čas s rodem (419 → 0) a žádná správná odpověď nevyčnívá délkou (205 → 0).**
  - **Rod:** 166 dětských úvodů „Tys to věděl!“ / „Jé, tys to věděl!“ vyměněno střídavě za „Jupí, správně!“
    a „A je to tam!“ (zbytek věty beze změny); 253 dalších hlášek přepsáno ručně („sis spletl s…“ →
    „plete se s…“, „než sis tipnul“ → „než napovídá tvůj tip“, „Tenhle jsi měl v kapse“ → „Tahle byla
    v kapse“). **Oba úvody vypadly i z rotace v `scripts/diversify-kids-openers.js`** — jinak by je
    další běh vrátil. Zapisovač odmítal nové znění, které by samo neslo rod nebo začínalo malým písmenem.
  - **Délka:** 205 otázkám (615 distraktorů) prodlouženy distraktory na podobnou délku a konkrétnost —
    správná odpověď se nezkracovala. Zapisovač odmítal dávku, kde by odpověď pořád vyčnívala podle
    stejného kritéria jako audit, a hlídal i shodu s odpovědí, duplicitu a velké písmeno.
  - **Cestou dvě faktické chyby v datech:** `ph-k-zralok` měl v odpovědi, vysvětlení, `about`
    i `image_prompt` „žralok obrovský“, ačkoli butanding z Donsolu je **žralok velrybí** (hláška
    „největší ryba světa“ to celou dobu říkala správně) — opraveno ve všech čtyřech polích. A u
    `gb-q-lochness` byl distraktor „Nikdy nezamrzá ani v zimě“ **pravdivý**, takže otázka měla dvě
    správné odpovědi — nahrazen.
  - **Distraktor nesmí být pravda ani „skoro pravda“.** U prodlužování se to hlídat musí ručně:
    Belfastský mír nechán s rokem 1922 (Velkopáteční dohoda se jmenuje i Belfastská), u Kodeše
    vypadlo „první hráč z komunistického bloku“ (nešlo ověřit, že to neplatí), u Tchaj-wanu
    japonština (starší generace jí opravdu mluví).
  - **Nalezeno, NEOPRAVENO — k ověření:** `cz-k-vecernicek-hvezdicka` tvrdí, že pohádku uvádí
    „kreslená hvězdička“; znělku Večerníčku přitom uvádí kreslený chlapec v papírové čepici.
    A `pk-q-truckovi-umelci` je otázka o Malále Júsufzai — obsah sedí, jen id je zavádějící.
  - **Ověřeno:** audit konzistence `rod_k_hraci` 0, `odpoved_vycniva_delkou` 0 a ostatní kontroly
    možností a typografie 0; `validate` 0 chyb, `lint-facts` 9 (beze změny), `test:offline` 853,
    mapa konfliktů přestavěná (503 dvojic). **Při nasazení nutný `db:sync --remote`.**

- **2026-09-11 — NASAZENO: 13+, právní stránky, opravy obsahu a výběr bez konfliktů. Kontakt `ahoj@zemekviz.cz` zatím poštu nepřijímá — nasazeno VĚDOMĚ.**
  Produkce běžela na `03d314f` (8. 9.), teď na `cb04b3d`. **Zákaz „právní stránky NENASAZOVAT,
  dokud nebude doména" (zápis 2026-09-10) zrušil hráč** — dostal na výběr i nasazení bez nich
  a zvolil všechno. Dluh zůstává: dokud doména a schránka nejsou, žádosti o výmaz na uvedenou
  adresu nedojdou. **Doména + pošta (Resend) je proto teď nejnaléhavější věc mimo kód.**
  - **Migrace žádné** (od `03d314f` se `migrations/` ani `schema.sql` nezměnily). `db:sync --check`
    0 přebytků, pak sync 150 příkazů. **Stav před i po stejný:** 1 člověk, 18 botů, 1 hra,
    19 ratingů, 3 742 otázek.
  - **Pojistka „žádný DROP/DELETE v d1-sync.sql" zastavila běh na planém poplachu** — komentář
    v hlavičce („bez DROP a bez DELETE") a nizozemská lékořice *drop* v textu otázky. Kontrola
    patří na PŘÍKAZY (řádek začínající `DROP`/`DELETE`), ne na slovo kdekoli v souboru.
  - **`master` posunut bez přepnutí větve:** `git fetch . <vetev>:master` + `git push origin master`.
    Odmítne cokoli jiného než fast-forward a nenechá tě stát na masteru — past z 2026-09-10 tím odpadá.
  - **Ověřeno na ostré adrese:** `quiz.js` i `online.js` bajtově shodné s repem, `/podminky`,
    `/soukromi`, `/smazani-uctu` jsou skutečné stránky (`.html` Pages přesměruje na adresu bez
    přípony, takže `curl` bez `-L` vrací prázdné tělo — to není chyba), `data/konflikty.json`
    venku, `/api/leaderboard` bez přihlášení 401, `CLAUDE.md` jen SPA fallback, start stahuje dva
    datové soubory, konzole čistá. **Neověřeno: registrace a duel v produkci** — založený účet
    by po sobě nechal náhrobek; lokálně to kryje `test:api` (167).

- **2026-09-11 — Otázky, které si navzájem prozrazují odpověď, se nedostanou do jedné hry. Oprava je ve VÝBĚRU, ne v textech.**
  Obsahový dluh, bod 2 (případ Jirásek): „Který panovník založil roku 1348 univerzitu?" a vedle
  ní zadání „…kterou Karel IV. založil roku 1348". Přepsat ~70 otázek by stálo obrázky a nové
  otázky by za měsíc vyrobily nové kolize; výběr pokryje i obsah, který teprve vznikne.
  - **Mapa je GENEROVANÁ a zapisuje se dvakrát:** `data/konflikty.json` pro offline hru (bez
    serverových otázek) a `functions/_lib/konflikty.js` pro online. Staví ji
    `scripts/build-konflikty.js`, spouští **`npm run build-index`** (ten staví i index počtů),
    zastaralou hlásí `validate` jako CHYBU — takže po úpravě textu otázky je nutné ji obnovit.
  - **Pravidlo: odpověď X celým slovem v zadání Y, NEBO ve vysvětlení a hláškách Y.** Ty hráč čte
    hned po odpovědi, takže prozrazují stejně (klokan ve vysvětlení u quokky). Jen zadání dávalo
    219 dvojic, i s texty po odpovědi **503 dvojic u 621 otázek**. `more_fact` se nepočítá (jen na
    klik). Vynechané: odpověď pod 6 znaků (jako místo děje stojí všude), čísla, názvy zemí.
    Ručně (`RUCNI`) jen dvojice s jiným tvarem slova — Kafka: „Německy" × „psal v němčině".
  - **Planý konflikt nevadí a hra se NIKDY nezkrátí:** když fond jinak nestačí, odložená otázka
    se dobere. Radši nápověda než kratší hra — stejný princip jako u serverového fondu.
  - **Offline:** sólo i škola losují přes `bezKonfliktu()`. `buildPartyOrder` hlídá mapu napříč
    pásmy (u stolu je jedna obrazovka, otázku souseda čtou všichni) a **cestou přestal pouštět
    tutéž otázku dvakrát** — „starsi" je podmnožina „dospeli", takže dvě fronty ji tahaly obě;
    naslepo se to v testu stalo v 293 losech z 300. Mapa se stahuje s první zemí
    (`ensureQuestionsFor`), **ne při startu** — rychlý start dál stojí na dvou souborech.
  - **Online:** `pickQuestions` bere z D1 o `REZERVA = 8` kandidátů víc a konfliktní přeskočí.
    Ve fázi „viděné právě jedním" se odmítnuté NEDOBÍRAJÍ a všem hráčům se bere stejný počet —
    jinak by padla symetrie, na které ta fáze stojí. Denní pětka jde přes `bezKonfliktu()`.
  - **Mapa pro server je JS modul, ne import JSON.** `test:pool` načítá `pool.js` v Node, kde
    by import JSON chtěl `with { type: "json" }`, a jak s tím naloží bundler Pages Functions,
    se lokálně spolehlivě neověří. Generovaný `export const` funguje všude stejně.
  - **Guláš:** `cz-k-hovezi-gulas` měl v zadání „…českého hovězího guláše?" a odpověď „Hovězí".
    Audit (`odpoved_v_zadani`) ho nechytil, protože hledá celé slovo a tady jde o jiný tvar.
  - **Ověřeno mutací (13×, všechny chyceny):** mapa ignorovaná v sólu/škole, v párty i na
    serveru, chybějící dobrání offline i online, startGame/startSchool naslepo, párty s dvojí
    otázkou, mapa se nestahuje / nenasazuje, denní pětka naslepo, zastaralá klientská
    i serverová mapa. `test:offline` **853**, `test:pool` **13**, `validate` 0 chyb.
  - **Při nasazení:** kód s mapou jde běžným `npm run deploy`; kvůli guláši je nutný `db:sync --remote`.
  - **Zbývá, a výběrem to nejde:** „Ve které zemi…?" uvnitř fondu té země (`cn-t-nudle` — „V Číně").

- **2026-09-10 — Obsahový dluh, body 1 a 3: 9 duplicit přepsaných na nové fakty, 4 nápovědy vytažené ze zadání. Nic se nemazalo.**
  Z každé dvojice zůstala jedna otázka a druhá dostala jiný fakt o tomtéž tématu — **id beze změny**,
  protože na ně vedou odkazy z produkční D1 (`seen_questions`, `games.question_ids`). Přehled, co
  se čím nahradilo, je v `docs/obsahovy-dluh.md`.
  - **Nový fakt se musel vybírat tak, aby ho neprozradila sestra-otázka** — jinak by oprava vyrobila
    přesně tu vadu, kterou řeší. Tři kandidáti tím spadli: „Čí portrét je na pětistovce?“ (Boženu
    Němcovou jmenuje zadání druhé otázky — proto „na které bankovce“), Pražské jaro začínající Mou
    vlastí (Má vlast stojí v zadání sestry o Smetanově hluchotě) a Haškovy nájezdy v Naganu (tu
    otázku fond už má, `cz-q-hasek-nagano-rozstrel-kanada`). **Před psaním nového faktu projít fond.**
  - **8 přepsaným otázkám zmizel obrázek** — ilustroval starou odpověď (devět pohárů, brankář-gladiátor…),
    a to je horší než žádný. Nové `irony_prompt` jsou napsané a prošly `lint-irony`. Výjimka: Hurvínkův
    pejsek Žeryk si obrázek nechal, protože pejsek na něm je.
  - **Nápovědy:** změnilo se jen zadání, odpověď i obrázek zůstaly. U nisse přitom „Perníček“ mezi
    kašemi nahradila „Krupicová kaše“ — bez „rýžové“ v zadání by jinak jako jediný vypadl z řady.
  - **Faktická chyba v otázce, která zůstala:** `cz-k-ctyrlistek` popisoval hrdiny jako „kocour, pes,
    myšák a králík“. Bobík je prasátko — Myšpulín jen zní jako myš a je to kocour. Obrázek té otázky
    myš ukazuje; opravený prompt čeká na přegenerování.
  - **`lint-facts` chytil dvě nová „Více o…“:** uvozovací frázi „Kromě toho…“ u Haška a fakt
    o Navrátilové, který sdílel 64 % kmenů se zadáním (zase grandslamy a čtyřhra). Druhý byl
    schovaný pod „… a dalších 2“ — lint vypisuje nejvýš šest nálezů na kategorii. **Celý výpis
    se dá dostat kopií skriptu bez limitu ve scratchpadu, repo se tím nemění.**
  - **PAST NÁSTROJE: dlouhý příkaz s několika heredocy Bash nezparsuje** („unexpected EOF while
    looking for matching“) — nespustí se nic, ani první krok. Stalo se dvakrát. Delší skripty
    psát nástrojem Write do scratchpadu a Bashem je jen spouštět.
  - **Ověřeno:** audit konzistence `skoro_duplicita` 0, `odpoved_v_zadani` 0, u upravených otázek
    žádný nález; `validate` 0 chyb, `lint-facts` 9 (beze změny), `lint-irony` 0 chyb, `test:offline` 842.
    **Při nasazení nutný `db:sync --remote`** — texty otázek jsou v D1.

- **2026-09-10 — Audit obsahu a konzistence: mechanické vady opravené, obsahová práce sepsaná v `docs/obsahovy-dluh.md`. Nový nástroj `npm run audit:konzistence`.**
  Na přání hráče před psaním serverových otázek. Stávající nástroje beze změny v povaze:
  `validate` 0 chyb, `audit` 837 (bylo 813 — přírůstek je ze 40 otázek z 31. 8. a kategorie
  jsou prověřený šum), `lint-facts` 9, `lint-irony` 0 chyb, databáze = data.
  - **`scripts/audit-konzistence.js` hlídá, co ostatní nástroje ne:** duplicity a vzájemné
    prozrazování ve stejném fondu, odpověď v zadání, odpověď vyčnívající délkou, malé písmeno
    na začátku (i u možností), minulý čas s rodem v hláškách i v UI, typografii a diakritiku.
    U každé kontroly je v hlavičce napsané, co je na ní šum.
  - **Opraveno v datech:** 96 možností odpovědí ve 24 otázkách začínalo malým písmenem
    (skoro celá Austrálie) — kreslí se tak, jak jsou v datech, takže to porušovalo pravidlo
    nahoře; 16× rovné uvozovky → „“, 7× tři tečky → výpustka. Zápis ověřený round-tripem
    (1 mezera + CRLF), diff 119/119 řádků, `validate` 0 chyb. **Při nasazení to chce
    `db:sync --remote`** — online si možnosti bere z D1, ne z JSONu.
  - **Nekonzistence, kterou jsem ten den způsobil sám:** lobby dospělých pořád říkalo „Děti
    mají vlastní ligu", ačkoli změna na 13+ ji zrušila → „Puberťáci hrají zvlášť". Cestou
    i „Spletl ses ve jméně?" (minulý čas s rodem) → „Překlep v přezdívce?".
  - **Obsahový dluh, který se bez hráče nedělá** (podrobně v `docs/obsahovy-dluh.md`):
    9 dvojic duplicit ve stejném fondu, vzájemné prozrazování (Zátopek, Seifert, Heyrovský,
    Karel IV. a vzorec „Jak se jmenuje X?" vedle otázek, které X jmenují), 4 odpovědi přímo
    v zadání, **422 hlášek s minulým časem v rodu** (171× „Tys to věděl!" — rozporuje pravidlo
    z 2026-09-02, které zápis o rotaci openerů sám cituje) a 205 otázek, kde správná odpověď
    vyčnívá délkou. **Duplicity se nemažou, přepisují** — na id vedou odkazy z produkční D1.
  - **PAST, KTEROU JSEM SI POSTAVIL VE FILTRU ŠUMU:** otázky „A, nebo B?" jsem nejdřív
    vynechával podle slova „nebo" — a schoval tím skutečnou nápovědu u moravských koláčků
    („s tvarohem, mákem nebo povidly" je výčet, ne volba). Správně: vynechat jen tehdy, když
    zadání jmenuje i některý distraktor. **Filtr šumu je taky kontrola a může být slepý.**
  - **Ověřeno, že nástroj měří:** tytéž kontroly před opravou našly 96 / 16 / 6 nálezů, po ní
    nulu. Průchod obrazovek v prohlížeči (offline i online) bez jediného malého písmena
    na začátku — jediný nález byl planý (text za tučným číslem, pokračování věty).
  - **Dokumentace srovnaná:** protokol měl produkci z 8. 9., „master srovnaný s větví"
    a testy 817 / 4 / 163; tabulka se už neváže na konkrétní commit, protože stárla s každým.

- **2026-09-10 — Světová liga je od 13 let a IP adresy z limitu registrací se mažou. Z právních stránek zbývá nepravdivý už jen kontakt.**
  Body 1 a 2 z předchozího zápisu. Hráč rozhodl „13+, dětské pásmo jen jako obtížnost“.
  - **`REG_BANDS` (Puberťáci, Dospělí) stojí VEDLE `BANDS`, ne místo něj.** `BANDS` dál používá
    offline hra, denní pětka, žebříček i zakládání her — ty si pásmo berou z účtu, takže případný
    starší dětský účet musí fungovat dál. Omezuje se jen VSTUP do pásma: registrace i změna
    pásma dětské pásmo odmítnou s vysvětlením. V produkci dětský účet žádný není (ověřeno
    čtením produkční databáze), takže se nic nemigrovalo.
  - **Registrace chce `age13: true` a musí to být boolean.** Zaškrtávátko „Je mi aspoň 13 let
    a souhlasím s podmínkami použití.“ nahradilo pasivní větu pod formulářem — hráč souhlas
    vyjadřuje, ne jen čte patičku. Server kontroluje přesnou shodu s true, ne pravdivost:
    řetězec „ano“ by jinak prošel, a přesně ten by poslal špatně napsaný klient.
  - **S dětským pásmem odešly generované přezdívky a „e-mail rodiče“.** Ochrany dětského pásma
    na serveru (zavřený žebříček, název turnaje se nebere) v kódu ZŮSTÁVAJÍ pro případné starší
    účty, ale **přes API je otestovat nejde** — dětský profil založit ani do pásma přejít nejde.
    Kontrola názvu turnaje proto z `test:api` zmizela, s komentářem proč.
  - **IP adresy se mažou na dvou místech:** `limitIp` při každé registraci smaže VŠECHNY prošlé
    řádky (ne jen svůj — registrace je vzácná) a `expireStaleGames`, kterou volá `/api/me`
    při vstupu do lobby. **Tam musí úklid stát PŘED časným návratem „žádné staré hry“** —
    ten nastává skoro pokaždé, takže za ním by se úklid nespustil; mutace to potvrdila. Hodina
    je jediná konstanta `REG_WINDOW_MS`, na kterou se odvolávají i zásady, a hranice `<=`
    sedí přesně na podmínku, podle které okno limitu končí.
  - **Zásady teď říkají „maže se automaticky s provozem hry“**, ne holé „po hodině“: Pages
    Functions cron neumí, úklid jede s provozem. V praxi `/api/me` volá každý hráč.
  - **Cestou dvě starší porušení pravidel na obrazovkách, které se měnily:** hlášky serveru se
    v appce kreslily malým písmenem (server je píše malým, skládají se i do vět) — velké
    písmeno teď nasazuje `errBox` při zobrazení; a v profilu stálo „Kdybys zapomněl PIN“
    (minulý čas s rodem) — teď „Kdyby ti PIN vypadl z hlavy“.
  - **Test API rozbil sám sebe, ne server:** dvě kontroly („cizí hráč se do hry nepodívá“,
    „hráč z jiného pásma se nepřipojí“) braly jako cizího hráče dětský účet. Ten se po změně
    nezaložil, neměl token, a kontroly dostaly 401 místo očekávaného odmítnutí. Cizí hráč je
    teď z toho pásma, které hráč A nemá. **Poučení: když změna zakáže vytvořit nějaký účet,
    projdi, kde ho testy používají jako pomocníka — ne jen kontroly, které ho testují přímo.**
  - **Testy:** `test:api` **167** (bylo 163), `test:expire` **8** (bylo 4), `test:offline` 842.
    Pomocná `api()` v testu doplní `age13` sama, ALE jen když ho volající neuvedl — odmítnutí
    se testuje přes `age13: undefined` (klíč existuje, JSON ho zahodí) a `age13: false`.
  - **Ověřeno mutací: 8 z 8 chyceno, obnova bajtově shodná a server zpět na původním kódu.**
    U serverových mutací skript čekal, až dev server zmutovaný kód načte (sonda na změněné
    chování), jinak by testoval starou verzi a „chycení“ by byla náhoda.
  - **Ověřeno v prohlížeči:** registrace nabízí jen dvě pásma, tlačítko čeká na pásmo i
    zaškrtnutí a registrace doběhne do lobby; profil nabízí jen dvě pásma; chybová hláška
    začíná velkým písmenem.
  - **Zbývá bod 3:** kontakt `ahoj@zemekviz.cz` a doručovatel Resend potřebují doménu. Do té
    doby právní stránky NENASAZOVAT.

- **2026-09-10 — Právní stránky napsané: podmínky, ochrana údajů, smazání profilu. NENASAZENO — tři věci v nich zatím nejsou pravda.**
  Krok B z předávacího protokolu (blokér obou obchodů). Hráč rozhodl dvě věci, na kterých stál rozsah:
  - **Appka je 13+, dětské pásmo zůstává jen jako obtížnost.** Dítě hraje sólo, párty i školu bez
    profilu (a v nich se o něm nic neukládá mimo zařízení), online s rodičem na jeho profilu.
    Plnohodnotné dětské účty by znamenaly ověřitelný souhlas rodiče (GDPR čl. 8) a dětský režim
    v obou obchodech — řádově víc papírování než celý zbytek kroku.
  - **Kontakt je adresa na budoucí doméně, `ahoj@zemekviz.cz`** — ne osobní e-mail ani jméno.
    Je ZÁSTUPNÁ: dokud doména není, poštu nepřijímá, a ze zákona na ni chodí žádosti o výmaz.
  - **Tři statické stránky BEZ JS** (`podminky.html`, `soukromi.html`, `smazani-uctu.html` + `pravni.css`).
    Musí jít otevřít z obchodu i z vyhledávače bez spuštění hry — Google Play výslovně chce odkaz
    na smazání účtu dostupný bez přihlášení. Proto nesdílí `quiz.css`; paleta je kopie tokenů,
    takže **změna palety v quiz.css se musí zopakovat i v pravni.css**. Stránky jsou v `SOUBORY`
    v `build-public.js` — bez toho by se na web nedostaly (past z 2026-08-25).
  - **Odkazy v appce na třech místech:** pod registrací („Založením profilu souhlasíš s podmínkami
    použití.“ a odkazy do nové karty, ať hráč nepřijde o rozepsaný formulář), v profilu hned pod
    „Smazat profil natrvalo“ a v patičce rozcestníku — i offline hra ukládá do prohlížeče hry a jména.
  - **Každé tvrzení v zásadách je ověřené proti kódu, ne proti paměti.** Inventura našla dvě věci,
    které jsem nečekal: prohlížeč drží **pět klíčů, ne dva** (`zk_online_token`, `zk_seen`,
    `zk_daily_done`, `hricka_quiz_saves`, `hricka_quiz_names` — literální grep minul ty, jejichž
    název je v konstantě), a **IP adresy z limitu registrací (`reg_attempts`) se nemažou vůbec** —
    v celém kódu na tu tabulku nevede jediný `DELETE`.
  - **PROČ NENASAZENO: stránky tvrdí tři věci, které appka zatím nedělá.**
    1. „Profil je od 13 let“ — registrace přitom pořád nabízí pásmo Děti a na věk se neptá.
    2. „IP adresu po hodině mažeme“ — nemaže se nikdy, viz výš.
    3. Kontakt `ahoj@zemekviz.cz` a doručovatel Resend — doména ani pošta zatím nejsou.
    **Nasadit je dřív, než se to srovná, znamená zveřejnit dokument, který lže.** Body 1 a 2 jsou
    kód, bod 3 potřebuje doménu. Provozovatel je zatím obecně „provozovatel hry Zeměkvíz“ — pro
    placenou verzi nebo obchody bude potřeba jméno či IČO.
    > **Doplněno 2026-09-10: body 1 a 2 jsou vyřešené** (registrace jen 13+ s potvrzením, IP
    > adresy se mažou) — viz zápis výš. Nepravdivý zůstává jen kontakt a doručovatel e-mailů.
  - **Odkaz uprostřed věty nesmí začínat malým písmenem.** Sken velkých písmen čte textové uzly,
    takže `v <a>zásadách…</a>` hlásí jako chybu; odkazy proto nesou název stránky („Ochrana údajů“).
    **Výjimkou je e-mailová adresa** — velkým začínat nemůže, stejně jako placeholder u registrace.
  - **Cestou opraven starší štítek „nepovinný“ u e-mailu na „Nepovinný“.** `.zk-opt` má
    `text-transform: none`, takže se opravdu kreslil malým — porušení pravidla nahoře, ne planý poplach.
  - **`test:offline` 842 kontrol (+19):** každá stránka existuje, je v `SOUBORY` (i s uvozovkami,
    takže prefix `podminky.html.bak` neprojde), má styl, v navigaci označuje sama sebe a nemá plochou
    šipku; appka na ně odkazuje ze všech tří míst. **Ověřeno mutací: 7 ze 7 chyceno, obnova bajtově
    shodná**, plus opačná kontrola — šipka jen v HTML komentáři projít MUSÍ, jinak nefunguje
    odstraňování komentářů.
  - **PAST, KTERÁ STÁLA DVA POKUSY: heredoc v nástroji Bash tu požírá ZDVOJENÁ zpětná lomítka.**
    Regulární výrazy v testu přišly o všechna lomítka (z třídy bílých znaků zbylo holé písmeno s)
    a test nešel ani zparsovat. Jednoduché lomítko před n přežije, zdvojené ne — proto to u
    dřívějších skriptů nebylo vidět. **Kód s regulárními výrazy psát nástrojem Write, ne heredocem.**
    Táž vrstva shodila i jeden heredoc s HTML („unexpected EOF“) a soubor tehdy vůbec nevznikl.
  - **`dist/` má 1 399 souborů** (4 nové). Výpis `wrangler pages deploy` ukáže o jeden míň:
    `_headers` nahrává zvlášť a do počtu ho nezahrnuje.

- **2026-09-08 — Ve výběru kontinentu je zkratka na Česko; Antarktida vypadla. A pevná okna v testech jsou past.**
  Přání hráče. Česko má **964 otázek z 3 742**, tedy zdaleka největší fond a nejčastější volbu —
  a vedlo k němu proklikání přes Evropu a mřížku 23 zemí. Nová dlaždice jde rovnou na výběr témat.
  - **Antarktida byla dlaždice, která nikdy nemohla nic nabídnout.** V `COUNTRY_CONT` na ni
    neukazuje jediná země, takže se odjakživa kreslila jako zašedlé „Připravujeme". Vypadla ze
    seznamu `CONTINENTS` a mřížka zůstala plná (8 dlaždic, 4×2). `assets/cont-antarctica.jpg`
    tím osiřel — nemazán, kdyby se někdy hrálo o polárních stanicích.
  - **Dlaždice NENÍ kontinent, a proto má `data-jump`, ne `data-cont`.** Mezi kontinenty by ji
    vzala logika vícenásobného výběru, kam nepatří: klik na Česko je hotové rozhodnutí, stejně
    jako u „Celý svět", takže se nečeká na Pokračuj.
  - **`S.sel.conts` se při skoku musí naplnit (`["europe"]`), i když hráč Evropu nikdy neviděl.**
    `renderSectionPick` z něj staví drobečky přes `contsLabel()` a hlavně `backToCountry` —
    bez toho by Zpět ani drobeček neměly kam vést. Ověřeno: Zpět z témat vede na evropské země.
  - **Návod patří POD nadpis, ne nad tlačítko — na všech třech výběrových obrazovkách.**
    Hráč to nahlásil nejdřív u kontinentů, pak u zemí; sjednoceno rovnou i u témat, aby
    obrazovky nebyly rozházené. Je to `<p class="qz-pickhint">` hned za `<h2>`, **natrvalo
    vykreslený**: kdyby mizel po výběru jako dřív, uskočila by při prvním kliknutí celá
    mřížka dlaždic o dva řádky nahoru. Tím taky zmizel důvod, proč tlačítko stálo mimo
    střed — hláška vedle něj byla druhá položka ve flex řádku `.qz-sec-confirm`.
    **`hintAkce()` zůstává jen sólo startu**, kde tlačítko čeká na dvě různé volby
    (pásmo a počet), takže se text mění podle toho, co ještě chybí; pevný podtitulek
    by musel být napsaný pro oba stavy najednou.
  - **U prázdného kontinentu se podtitulek nevykreslí** (`hasSome`), jinak by radil klepnout
    na zemi, která tam žádná není.
  - **Hláška u zablokovaného tlačítka přeformulována**, protože „Vyber aspoň jeden kontinent —
    nebo rovnou Celý svět" na obrazovce, kde je i země, přestala platit.
  - **Test spadl a NEBYLA to regrese: `test:offline` měl okno pevných 3 000 znaků od začátku
    funkce.** Zkratka volání `hintAkce` odsunula za tu hranici, takže test hlásil ztrátu hlášky,
    která tam celou dobu byla. **Falešný poplach z pevného okna vypadá úplně stejně jako skutečná
    vada** — proto se okno počítá z těla funkce: konec je další deklarace funkce se stejným nebo
    menším odsazením. **Na odsazení tu záleží:** `refreshStart` je vnořená v `renderStart`,
    takže hledat jen deklarace nejvyšší úrovně by jí dalo okno až do konce souboru a test by
    prošel díky cizímu volání `hintAkce` v jiné funkci.
  - **Dlaždice Česko potřebuje VLASTNÍ ilustraci, ne vlajku** (`assets/jump-cz.jpg`, prompt
    `jump-cz` v `data/ui-irony-prompts.json`). Sousedi na té obrazovce jsou malované scény
    s jedním hrdinou, takže plocha vlajky mezi nimi vyčnívá. **A past, na kterou jsem doplatil
    hned prvním pokusem: náladu je nutné napsat NAHLAS.** Scéna „vodník v dešti, s důstojným
    výrazem“ byla technicky přesně podle receptu — jeden hrdina, vtip na něm, tři podřízené gagy —
    a vyšel z ní zamračený zelený stařec v šedi. Déšť srazí paletu a „dignified“ model přeloží
    jako mrzutost. Prompt proto nově končí řádkem MOOD (veselé, slunečné, vtipné) a hrdina je
    veselý na první pohled. **Motiv nakonec zvolil hráč a je to sebeironie, ne zvíře:**
    kulaťoučký voják v těsné uniformě zvedá půllitr s blaženým úsměvem někoho, kdo si nikdy
    s ničím nedělal starost — „my jsme Švejci, pivaři“. **Hrdinou je ale ČLOVĚK, ne ten půllitr:**
    velká nádoba jako dominanta by na téže obrazovce soupeřila s obřím kelímkem Severní Ameriky.
    **Vygenerováno a nasazeno** jako `assets/jump-cz.jpg`. Gemini podle očekávání přidalo
    papírový rámeček (známá past) — ořez `sharp`em na čtverec 900 px z 1024 s posunem
    (left 80, top 70), pak zmenšení na 512×512 q88 jako ostatní dlaždice. Posun není
    kosmetika: rovnoměrný ořez nechal třetinu plochy prázdnou oblohou a hrdina byl proti
    sousedním dlaždicím malý.
  - **Slepá kontrola potřetí, a zase ji odhalila až mutace.** Nový test měl ověřit, že
    dlaždice Česko odkazuje na existující obrázek. Hledal ale první `img:"assets/…"` v celé
    funkci — a to je dlaždice „Celý svět“ (`cont-world.jpg`), takže procházel i s úplně
    rozbitým Českem. **Kotvit se musí na to, co se měří** (`const czTile`), ne na první
    podobný tvar v okolí. Po opravě chytá překlep v názvu i návrat k vlajce, každý vlastní
    hláškou. Testů 823.
  - **Ověřeno mutací všech čtyř obrazovek** (ne jen té změněné): po odstranění všech volání
    `hintAkce` z těla funkce test pokaždé spadne a pojmenuje správnou obrazovku. Základ 817 kontrol.

- **2026-09-08 — Větev sloučena do `master` a NASAZENA; produkci chyběly tři migrace a hodnoty obtížnosti.**
  Hráč nahlásil, že úpravy kolem ilustrace na `zemekviz.pages.dev` nejsou vidět. Nebyla to chyba
  kódu ani nasazení: **produkce běžela na masteru z 3. 9. (`86d362b`)**, zatímco všech 12 commitů
  od té doby leželo jen na větvi `claude/pokracujeme-e79708` — tedy i přesun zisku bodů pod
  ilustraci, dělení fondu, rychlý start a bezpečnostní opravy. Nasazeno postupem z
  [docs/nasazeni.md](docs/nasazeni.md), pořadí migrace → obsah → kód.
  - **Produkce měla migrace jen do `2026-09-04-difficulty` včetně.** Doběhly tři chybějící:
    `2026-09-06-online-only`, `2026-09-06-token-epoch`, `2026-09-07-smazani-uctu`. Zjištěno
    porovnáním `pragma_table_info` proti `migrations/`, ne odhadem podle data nasazení —
    a vyplatilo se to, protože `difficulty` už tam podle data být nemělo, a bylo.
  - **`db:sync --remote` dopsal obtížnost, kterou sloupec do teď neměl:** po migraci 09-04 měly
    všechny otázky default 1, teď má 2 095 z 3 742 hodnotu vyšší. `--check` hlásil 0 přebytků,
    `rating` otázek zůstal nedotčený (0 řádků mimo 1500 — v produkci je zatím jediná odehraná hra).
  - **Zapsat si stav PŘED zásahem se vyplatilo:** 1 živý účet, 18 botů, 1 hra, 19 ratingů — a po
    všech třech migracích i po syncu tatáž čísla. Bez toho je „nic se neztratilo" jen dojem.
  - **Oprava údaje z předávacího protokolu: „19 živých účtů" jsou 19 řádků v `users`, z toho
    18 botů.** Skutečný lidský účet je v produkci jeden jediný. Na opatrnosti se tím nic nemění,
    ale je rozdíl mezi hracím provozem a prázdnou databází s bot fondem.
  - **Ověřeno na ostré adrese, ne jen podle výstupu deploye:** `quiz.js` z produkce je bajtově
    shodný s repem, při načtení `/hra` jdou z `data/` dva soubory (rychlý start drží),
    `/api/leaderboard` bez přihlášení vrací 401, `CLAUDE.md` vrací SPA fallback (není v `dist/`),
    konzole čistá a odehraná otázka ukazuje `+300 bodů` bez hvězdy pod ilustrací.
  - **NEOVĚŘENO: online přihlášení a duel.** Šlo by to jen založením účtu v produkci, a ten by
    po sobě i po smazání nechal náhrobek „Smazaný hráč" (mazání profilu účty schválně neodstraňuje).
    Lokálně to pokrývá `test:api` (163 kontrol), včetně `token_epoch`.

- **2026-09-07 — Zablokovaná hlavní akce už říká, na co se čeká. A zisk bodů je konečně vidět.**
  Hráč nahlásil: *„proč nefunguje tlačítko Pokračuj?"* Ono fungovalo — bylo `disabled`,
  dokud nevybral zemi, a **appka to nikde neřekla**. Naměřeno `cursor: not-allowed`
  a ztlumení na 38 %, jenže ztlumené korálové tlačítko na krémovém papíře pořád vypadá
  jako tlačítko: klikneš, nic se nestane, nikde není proč.
  - **Netýkalo se to jedné obrazovky, ale VŠECH ČTYŘ** (kontinent, země, téma, sólo
    start). Sdílená `hintAkce(btn, text)` vypíše nad tlačítko větu, co appce chybí,
    a po výběru ji zase odstraní; má `aria-live`, jinak by odečítač o důvodu neřekl nic.
  - **Sám jsem do toho spadl týž den při průchodu appkou** — klikl jsem „Jdeme na to",
    nic se nestalo, a odepsal jsem to jako vlastní nepozornost místo jako vadu. Když se
    o zablokované tlačítko potkne i ten, kdo appku právě programuje, je to vada UI.
  - **Sólo start volá `refreshStart()` hned po vykreslení.** Do té doby se stav
    aktualizoval až po prvním kliknutí, takže hlášku „vyber, kdo hraje" viděl jen ten,
    kdo už něco klikl — tedy nikdy ten, kdo neví kam.
  - **Zisk bodů byl řádek o 12,5 px v barvě štítků** a mezi obrázkem a vysvětlením
    zanikal (výtka hráče: *„text získáváš 100 bodů je málo výrazné"*). Nově je z toho
    **malovaná hvězda + velké číslo** (27 px, ochrová) — tatáž `ico-star.png` jako
    v bodovém praporku, ať se to čte jako totéž skóre. **Plus je nutné, ne ozdobné:**
    samotné „100 bodů" se dá číst jako celkové skóre, a u první otázky je to dokonce
    totéž číslo, co svítí v praporku. Rámeček to nedostalo schválně — v pravém sloupci
    už je ohraničený obrázek a dvě tlačítka.
  - **PAST: velikost ikony nejde přebít z CSS.** `ICO_*` mají inline `style="width:1em"`
    a inline styl vyhraje nad pravidlem v souboru — hvězda se proto zvětšuje `font-size`
    celého řádku, ne pravidlem na `img`.
  - **PAST, KTEROU JSEM SI VYROBIL SÁM: mutační skript běžící na pozadí PŘEPSAL úpravu,
    kterou jsem mezitím udělal.** Skript si na začátku udělá kopii souboru a na konci ji
    vrátí — takže všechno, co do toho souboru přibude během běhu, tiše zmizí. Projevilo
    se to tak, že appka servírovala starý text, ačkoli v editoru byl nový.
    **Když běží mutace, na dotčené soubory se nesahá** (a když se musí, skript se nechá
    doběhnout a úprava zopakuje).
  - **Nová kontrola v `test:offline` hlídá, že všechny čtyři obrazovky hlášku
    nastavují — a v komentáři přiznává, co NECHYTÍ:** obrazovky volají `hintAkce`
    dvakrát (při vykreslení a po kliknutí) a zmizení jednoho z těch volání test
    propustí. Ověřeno mutací; je to hlídka proti ztrátě vazby, ne důkaz.
  - **SKÓRE SE PŘETÁČÍ, NE PŘEPISUJE** (druhé přání hráče: *„šlo by to udělat jako
    počítadlo, že se číslice točí?"*). `animujCislo` dopočítá praporek ze starého skóre
    na nové a zisk od nuly; obojí doběhne zároveň, takže je vidět, že spolu souvisí.
    Sdílí to i online část přes nové okno `ZKAnim` — kopie funkce v `online.js` by se
    dřív nebo později rozešla, což je přesně to, co se dnes dvakrát opravovalo.
  - **PODSTATNÝ NÁLEZ, na který jsem přišel jen díky tomu, že rAF v testovacím panelu
    neběží: ANIMACE NESMÍ BÝT JEDINÉ, CO ČÍSLO ZAPÍŠE.** V praporku zůstal STARÝ počet
    bodů (0), zatímco vedle svítil zisk (+300) — `requestAnimationFrame` se v odložené
    kartě nezavolá ani jednou. Řeší to `setTimeout(dokonci, ms + 250)`: časovač na pozadí
    běží, takže cíl dosedne vždycky. **Napřed jsem přitom udělal opak** — mutační test
    ukázal, že tehdejší „pojistný" zápis nikdy nic nezměnil (kubický náběh dosedne na cíl
    už o snímek dřív), tak jsem ho jako mrtvý kód smazal. Byl mrtvý ve správně běžící
    animaci, ne v té, která se vůbec nespustí. **Pojistka patří ven z rAF, ne dovnitř.**
  - **Past při ověřování: přepsat `document.visibilityState` na „visible" nestačí.**
    Prohlížeč rAF v neviditelné kartě throttluje bez ohledu na tu vlastnost, takže se
    tím jen obejde vlastní guard a animace stejně neběží — akorát se tím vyrobí přesně
    ta situace, na kterou se pak přišlo. Skutečné chování animace se v bezhlavém panelu
    ověřit nedá; testuje se jednotkově s falešným rAF (`rafBezi: false`).

- **2026-09-07 — Profil jde smazat. HRY ZŮSTÁVAJÍ, jen se odpojí od identity — a účet se proto NEMAŽE z tabulky, ale přepíše na náhrobek.**
  Poslední blokér obou obchodů (a povinnost v EU): appka uměla účet založit, ale ne zrušit.
  **Rozhodl hráč:** odehrané hry zůstanou, jen se od účtu odpojí.
  - **Smazat řádek z `users` NEJDE** a je dobře, že se to nezkoušelo: `game_players` na
    něj odkazuje, takže by se tím rozpadla historie CIZÍM hráčům a turnajová umístění.
    Účet se místo toho přepíše na náhrobek — jméno „Smazaný hráč", `nick_lower` na
    technický klíč, e-mail a kód pro přátele na NULL, náhodný PIN, `deleted_at` a
    `token_epoch + 1` (což okamžitě ruší všechna přihlášení, viz zápis o epoše níž).
    Mažou se `ratings` (jinak by účet zůstal v žebříčku), `friends`, `queue`,
    `pin_resets` a `seen_questions`.
  - **PAST, kterou odhalil až DRUHÝ pokus: `users.nick` má UNIQUE, nejen `nick_lower`.**
    První smazání prošlo, druhé spadlo na 500 — náhrobek nemůže mít u všech stejné
    jméno. Přívěsek je proto **náhodný, ne odvozený z id**: z „Smazaný hráč 4m6n" se
    nedá zpětně poznat, čí účet to byl. **Kdybych to otestoval jen jednou, jde to do
    produkce rozbité** a narazil by na to druhý člověk, který by profil smazal.
  - **Ověřeno na skutečné dvojici hráčů:** po smazání má soupeř svou hru dál v historii,
    se skóre 594:594, jen jméno je „Smazaný hráč 4m6n". Rating soupeře beze změny.
  - PIN se vyžaduje i u přihlášeného (stejně jako u změny e-mailu) a v UI je nad tím
    ještě potvrzení — PIN chrání před cizím u odemčeného zařízení, potvrzení před
    vlastním překliknutím. Text v Profilu **říká rovnou, že hry zůstanou**; tiché
    „účet je pryč" by lhalo.
  - `test:api` **162** (bylo 152), ověřeno mutací včetně toho druhého smazání.
  - **PAST V ONLINE.JS: uvnitř řetězce v uvozovkách nesmí být české `„…"`** — ASCII
    uvozovka řetězec ukončí. `node --check` to chytí, ale ukáže na jiné místo, než kde
    je vina. Správně je typografická `“` (v template literalech v quiz.js to nevadí).

- **2026-09-06 — REVIZE TECHNICKÁ, LOGISTICKÁ, BEZPEČNOSTNÍ. Tři nálezy, které by se v provozu projevily až pozdě: volné textové pole u turnaje, neodvolatelné přihlášení a nasazování do NÁHLEDU místo produkce.**
  - **NÁZEV TURNAJE BYL VOLNÉ TEXTOVÉ POLE, KTERÉ VIDÍ CIZÍ LIDÉ.** Neověřoval se nijak
    (jen `trim().slice(0,40)`) — ověřeno, že prošlo `<img src=x onerror=alert(1)> vzkaz`.
    XSS z toho nebylo (obě místa v `online.js` escapují), ale **escapování dělá neškodný
    TEXT, ne neškodný KANÁL**: dětské přezdívky se generují právě proto, aby se do nich
    nedal schovat vzkaz, a název turnaje tu ochranu obcházel jinými dveřmi. Nově stejná
    znaková sada jako u přezdívek a **v dětském pásmu se název nebere vůbec**.
  - **Avatar se ukládal, jak přišel** — ověřeno 10 000 znaků. Klient ho neposílá vůbec,
    takže omezení na číslo nic neubírá.
  - **PŘIHLÁŠENÍ NEŠLO ZNEPLATNIT.** Token je bezstavový a platí 90 dní, takže ho
    nespravila ani změna PINu: kdo někomu půjčil odemčený telefon, neměl jak ho vypnout.
    Nově má účet čítač `token_epoch`, který se propisuje do tokenu (`uid.exp.epoch.mac`);
    obnova PINu ho zvýší a všechna starší zařízení vypadnou.
    - **Starý tvar `uid.exp.mac` se bere jako epocha 0**, což je i výchozí hodnota
      sloupce — migrace tedy nikoho neodhlásí. **A login MUSÍ podepisovat aktuální
      epochu účtu**, jinak by se po obnově PINu nešlo přihlásit vůbec (účet by měl 1,
      čerstvý token 0). To je ta past, na kterou se u tohohle vzoru padá.
  - **`npm run deploy` postrádal `--branch master`**, takže nasazoval NÁHLED a ostrá
    adresa dál servírovala starý kód. Je to přesně ta past, před kterou CLAUDE.md sám
    varuje od 2026-09-03 — jen zůstala v nasazovacím skriptu. Nově je tam, a před
    nasazením se automaticky pouští `predeploy` (validace dat + offline + fond + token).
  - **Three.js je v repu, CSP je čistě `self`.** Byla to jediná externí věc, kterou appka
    za běhu načítala. Stažený soubor má **týž otisk, jaký byl v `integrity`**, takže je
    bajtově shodný s tím, co appka brala z CDN. `.gitattributes` ho drží bez převodu
    konců řádků, jinak by ho git na Windows přepsal a otisk by přestal sedět.
    Ověřeno v prohlížeči: **nula zdrojů mimo doménu**. Doplněny HSTS a Permissions-Policy.
  - **Naměřená technická čísla pro rozhodování o obchodech:** `dist` má **199 MB
    v 1394 souborech**, z toho 184 MB ilustrace (průměr 161 kB). Pro Pages je to
    v pohodě (limit 20 000 souborů, 25 MiB/soubor), ale **do obalu pro obchody se to
    zabalit nedá** — obal je bude muset brát z webu. Minimální prohlížeč vychází na
    **Chrome 105 / Safari 15.4** kvůli `:has()` a `mask-composite`; obojí má v kódu
    záchranu, takže starší prohlížeč appku nerozbije, jen zhorší.
  - **Co je v pořádku a nemusí se to řešit:** PIN je PBKDF2-SHA256 se solí a porovnáním
    v konstantním čase (15 000 iterací je vědomý kompromis kvůli stropu CPU u Workers),
    zámek přihlašování eskaluje a nepustí ani správný PIN, SQL jde výhradně přes vazby
    (tři interpolace v kódu jsou generátory otazníků, ne vstup), souběžná registrace
    téže přezdívky vrací 409, nečitelné tělo 400, `npm audit` čistý, žádná runtime
    závislost, časovače se ruší a posluchače na `document`/`window` se věší jednou.
  - **Nový `docs/nasazeni.md`** — runbook: pořadí migrace → obsah → kód, past se špatným
    účtem (7403/7404), SPA fallback vracející 200 na cokoli (kontroluj OBSAH, ne kód),
    tajemství, rollback a Time Travel u D1.
  - **Testy:** `test:api` **152**, `test:offline` **805**, nový **`test:auth`** (12 kontrol).
    Vše ověřeno mutací. **Past při psaní testu:** české uvozovky `„…"` uvnitř JS řetězce
    ho ukončí — `node --check` to chytí, ale hláška ukazuje na jiné místo, než kde je vina.
  - **ZŮSTÁVÁ OTEVŘENÉ:** účet pořád **nejde smazat** (blokér pro oba obchody a povinnost
    v EU) — je to krok 3 a potřebuje rozhodnutí, co se stane s odehranými hrami
    (smazat × anonymizovat); appka pořád **není instalovatelná** (krok 4).

- **2026-09-06 — PŘÍPRAVA NA VYDÁNÍ (kroky 1 a 2 z plánu). Největší nález: HLAVNÍ REŽIM „Hrát teď" NEHODNOTIL, takže rating ani žebříček nikdy nikomu nefungovaly.**
  Zadání znělo připravit appku pro Google Play, App Store a desktopový web, a to tak,
  aby vydělávala. Cílovka **nejsou jen děti, hrají to hlavně dospělí** (hráč to upřesnil) —
  tím padá většina omezení kolem reklamy v dětských appkách. Plán je v artefaktu
  „Zeměkvíz do obchodů"; tady je, co se z něj UDĚLALO.
  - **NÁLEZ, KTERÝ JE ZÁSADNÍ PRO CELÝ PRODUKT: „Hrát teď" bylo celé mimo rating.**
    Když se do 4 s nenašel živý soupeř, klient **opustil frontu, založil si hru typu
    `odkaz` a pustil do ní bota** — a `/game/:id/bot` hru odznačí jako nehodnocenou.
    Při dnešní základně se člověk skoro nikdy nenajde, takže **veškerý** provoz hlavního
    režimu byl nehodnocený: naměřeno po celé odehrané partii **rating 1500, RD 350,
    0 her**, žebříček (5 her a RD < 150) trvale prázdný — a dlaždice přitom slibuje
    „Rychlé souboje o rating". V historii se navíc hlavní režim tvářil jako „odkaz".
    - **Byla to SLEPÁ SMYČKA:** `calibrateBot` váží posun důvěrou v hráčův rating
      (RD 350 → nula), takže dokud hráči nehráli hodnoceně, **nekalibrovali se ani boti**.
      Ani jedna půlka toho stroje se nikdy nerozjela.
    - **ROZHODNUTÍ: hra Z FRONTY je hodnocená i proti ghostovi** (nový `PUT /api/match`
      zakládá rovnou `duel` s `rated = 1`, `settle.js` ji hodnotí proti kalibrované síle
      bota s RD 120). **Není to změkčení anti-farming pravidla** z `/game/:id/bot`: tam
      si soupeře vybíráš (nahrazuješ kamaráda, co nedorazil), tady sis vybral jen to,
      že chceš hrát. Soupeř se losuje podle tvého ratingu, jeho síla se kalibruje
      z reálných výsledků a ghost přehrává skutečné lidské odpovědi. Bot v souboji na
      odkaz i turnajová kola zůstávají nehodnocené.
  - **START: 4,72 MB → 4,6 kB.** Appka stahovala při startu celý fond (56 souborů)
    a do té doby byla bílá stránka — **2 923 ms na localhostu, kde není žádná síť**.
    Nově se stahuje `data/questions-index.json` (666 B) s počty na zemi a otázky se
    dotahují až při výběru země (`ensureQuestionsFor` v `selectCountries`, tedy před
    `applyPool`). Index je **generovaný a verzovaný** (`npm run build-index`), protože
    ho appka musí najít i v lokálním vývoji; že nezastaral, hlídá `validate` jako CHYBU.
    Záchranná síť: bez indexu se stáhne všechno jako dřív — radši pomalý start než
    mrtvá appka.
  - **FOND SE DĚLÍ NA VEŘEJNÝ A SERVEROVÝ (`online_only`).** Správné odpovědi musí být
    v prohlížeči kvůli offline hře, takže si je kdokoli mohl dohledat i pro hodnocenou
    online partii. Otázka s tímhle příznakem zůstává v repu i v databázi, ale
    **`build-public.js` ji z `dist/data` vyhodí**, do indexu se nepočítá a `pickQuestions`
    ji **preferuje**; zbytek dobírá z veřejných, protože prázdná online hra by byla horší
    než hra, kterou jde podvádět. Migrace `2026-09-06-online-only.sql`.
    **Obsah zatím žádný — je to mechanismus, ne hotový fond**, a `validate` to hlásí.
  - **Detail turnaje nehlídal pásmo.** Výpis ho hlídá od 2026-09-03, detail se zapomněl,
    takže si dospělý účet přečetl **dětský turnaj i s přezdívkami a skóre**. Reprodukováno
    živě. Vrací 404, ne 403 — cizí pásmo se nemá dozvědět ani to, že turnaj existuje.
  - **Výpis turnajů bral 20 NEJSTARŠÍCH**, takže při víc než dvaceti se čerstvě založený
    turnaj do seznamu nevešel a zakladatel ho nenašel. Nově nejnovější první. Odhalilo se
    to tím, že v testovací databázi se turnaje nahromadily (29 běžících) — **testovací
    „smetí" tu posloužilo jako simulace budoucího provozu**.
  - **DVĚ POLOŽKY Z OTEVŘENÉHO SEZNAMU NEPLATÍ, ověřeno:** poškozený token vrací **401**
    (ne 500 — nejspíš zásluha `_middleware.js`), a **odveta hodnocenou prohru nevyrobí** —
    zkusil jsem přesně ten scénář (zakladatel odehraje, soupeř o hře neví, posun o 3 dny,
    expirace) a rating soupeře se nehnul, protože `expireStaleGames` nehodnotí hru, kterou
    hráč nezačal. Odveta pořád vkládá soupeře bez jeho vědomí, ale škoda z toho není.
  - **CO ZŮSTÁVÁ JAKO BLOKÉR PRO OBCHODY** (neopraveno, je to krok 3 a 4):
    **účet nejde smazat** (mezi 24 endpointy taková cesta není, a Apple i Google to
    vyžadují u každé appky, která zakládá účty) a **appka není instalovatelná** —
    chybí manifest i service worker, takže offline nefunguje a Apple by ji jako pouhý
    obal webu odmítl.
  - **Testy:** `test:api` **148** (bylo 140), `test:offline` **800**, nový **`test:pool`**
    (8 kontrol, falešné `env.DB`, v CI). Všechny nové kontroly **ověřeny mutací** —
    včetně toho, že serverová otázka neunikne do `dist` a že se nepočítá do indexu.
  - **PAST PŘI MUTAČNÍM TESTOVÁNÍ NA WINDOWS, dvakrát za sezení:** PowerShell čte `.ps1`
    jako ANSI, takže **skript s diakritikou bez BOM spadne na parse error**; a
    `$ErrorActionPreference = "Stop"` + `npm ... 2>&1` shodí běh na prvním varování npm,
    protože 5.1 dělá z nativního stderr chybu. Skripty na mutace psát **bez diakritiky**
    (nebo s BOM) a exit kód číst z `$LASTEXITCODE`, ne z textu výstupu.

- **2026-09-06 — HOTOVO: vysvětlení a tlačítka jsou POD ILUSTRACÍ. Prázdno kolem obrázku 206 → 3 px na stranu. Rozhodla DVĚ věci: jeden obal místo dvou řádků mřížky, a obrázek POSTAVENÝ DO TOKU.**
  Dotažení předchozího zápisu (ten zůstává níž, protože jeho tři slepé uličky platí dál).
  Karta drží otázku, odpovědi a hlášku; **zisk bodů, vysvětlení a obě tlačítka se po
  odpovědi stěhují pod obrázek** (`presunPodObrazek` v [quiz.js](quiz.js), volaná
  z `answer()`, `timeoutReveal()` i `finishSteal()`). Karta tím zkrátí a rám, který ji
  lícuje, se stáhne s ní.
  - **1. Rám a blok pod ním jsou v JEDNOM OBALU `.qz-picwrap`**, mřížka zůstala
    dvousloupcová `"top top" "box pic"` beze změny. Obal lícuje s kartou
    (`align-self: stretch`), rám si uvnitř bere zbytek výšky (`flex: 1; min-height: 0`).
    Před odpovědí je blok prázdný, takže **rám = karta na pixel a glóbus zůstává velký**
    (naměřeno na osmi otázkách za sebou: 527/527, 503/503, 454/454…, glóbus 250–290 px).
  - **2. Po odpovědi se rám smrskne PŘESNĚ NA OBRÁZEK**, protože `.qz-pic` přejde do TOKU
    (`position: relative`) místo absolutního centrování. **Ne přes `aspect-ratio`** — ten
    by platil jen pro dnešní fond 16:9 a u čtvercových ilustrací (generátor je dělá od
    2026-09-01) by pruhy jen otočil o 90°. Takhle si rám vezme výšku toho, co v něm
    doopravdy je, ať je poměr jakýkoli. Komentář u `.qz-pic` varuje před obrázkem v toku
    (vnesl by přirozenou výšku 686 px) — to platí pro NEODHALENÝ rám tažený kartou; tady
    je šířka omezená na 412 px, takže se výška dopočte na 235 a nic se nenafoukne.
  - **3. Blok pod obrázkem je flex sloupec s `flex: 1`**, aby `.qz-frow { flex: 1 }` +
    `.qz-fbtns { margin-top: auto }` fungovaly stejně jako dřív uvnitř karty: vysvětlení
    hned pod obrázkem, **akce u spodní hrany — a ta lícuje s dolní hranou karty** (dolní
    hrany naměřeny shodně na všech vzorcích). Bez toho tlačítko viselo v půlce sloupce.
  - **PAST, na kterou jsem naletěl: `.qz-extra:empty { display: none }` má STEJNOU
    specificitu jako desktopové `.qz-picwrap > .qz-extra { display: flex }`**, takže ho
    pozdější pravidlo přebilo — prázdný blok si vzal `flex: 1` a rám se s ním o sloupec
    podělil (rám 225 px proti kartě 454, glóbus srazený z 290 na **149**). Vypadalo to
    jako chyba mřížky, přitom to byla kaskáda. Řeší `.qz-picwrap > .qz-extra:empty`.
  - **Mobil: obal se rozpouští `display: contents`** a řadí se `order` 1–4 (top, rám,
    karta, blok). Bez toho by „Další otázka" skončila hned pod obrázkem, tedy NAD
    odpověďmi. Pozor: `display: contents` mění rozvržení, ne strom — selektory se proto
    musely přepsat z `.qz-play > …` na potomkové.
  - **Online se nezměnil ani o pixel** — kreslí si otázku vlastní funkcí a obal nemá,
    takže mu dál platí pravidlo pro PŘÍMÉHO potomka. Ověřeno tak, že jsem rám v DOMu
    vyndal z obalu: `grid-area: pic`, `align-self: stretch`, výška = karta, jako dřív.
  - **Naměřeno** (1400 px, osm otázek): prázdno kolem obrázku **3 px** na stranu (bylo
    206 u nejhoršího případu), obrázek si drží plnou velikost 406×232, dolní hrany karty
    a pravého sloupce shodné. Ověřeno i na 375 / 768 / 899 / 900 / 1920 px, u otázky bez
    ilustrace (rám spadne na 116px pruh s vlajkou), po vypršení času a v párty.
  - **DRUHÉ KOLO TÝŽ DEN — kompozice pravého sloupce.** Hráč: *„ty dvě tlačítka můžou být
    klidně nad sebou… aby tato obrazovka dávala nějakou souměrnost."* Dvě změny, obě
    měřené:
    1. **Blok se drží OBRÁZKU, ne spodní hrany karty.** První verze ho roztahovala na
       zbytek sloupce (`flex: 1`) a akce lepila dolů — dolní hrany sice lícovaly, ale mezi
       vysvětlením a tlačítky zela **naměřená díra 214 px** a dvojice tlačítek se četla
       jako něco, co s textem nad ní nesouvisí. **Blízkost vyhrála nad zarovnanou spodní
       hranou:** obrázek, vysvětlení a akce jsou jedna věc (výsledek odpovědi). Prázdno
       pod nimi je vzduch, ne díra — nic se v něm nekreslí.
    2. **Tlačítka pod sebou, každé přes celou šířku sloupce.** Vedle sebe měla v 405px
       sloupci jen 199 px, takže se dlouhý popisek („Více o králi Janu Lucemburském")
       lámal na tři řádky a natáhl OBĚ na 75 px. Pod sebou drží pravý sloupec jednu
       svislou linku: obrázek, text, tlačítko, tlačítko — všechno 405 px.
    - **`min-height: 52px` + `line-height: 1.25` na obou tlačítkách**, jinak je jednořádkové
      38 px a dvouřádkové 56 a pod sebou je ten rozdíl vidět jako nedodělek (vedle sebe ho
      zakrývalo `align-items: stretch`). Nově 52/53. **Platí i na mobilu** (bylo 44 vs 62)
      a shodou okolností tím padá jeden bod z otevřeného seznamu dotykových cílů pod 44 px.
    - **TŘETÍ KOLO — MEZERY. Hráč: „tlačítka v pravé části příliš blízko u sebe. radil ses
      s designerem?" Neradil (dělal jsem to sám), tak jsem se zeptal dvou nezávislých.**
      Rytmus je nově **22 / 8 / 16 / 28** (obrázek → body → vysvětlení → „Více o…" →
      „Další otázka"), na mobilu o stupeň sražený **18 / 6 / 14 / 24**.
      - **Chyba nebyla velikost mezery, ale to, KDE vedla hranice skupiny.** Bylo 20 nad
        dvojicí a 10 uvnitř ní, tedy přesně obráceně: „Více o…" patří k vysvětlení téhle
        otázky, „Další otázka" je odchod ze scény. Hranice musí vést MEZI tlačítky.
      - **Číslo 28 je spočítané, ne odhad:** mezera pod ~25 % výšky prvku slepí dva bloky
        v jeden. Při tlačítku 52 px bylo 10 px **0,19×** a oko to četlo jako segmentovaný
        přepínač. Na oddělení je potřeba aspoň 0,5×. **Nediferencovaný přírůstek 10 → 14
        je past** — jen povolí, skupinu nevytvoří.
      - **8 px u zisku bodů je schválně nejtěsnější místo na obrazovce:** „Získáváš 100
        bodů" je nadpis výsledku a vysvětlení jeho tělo; při 12 px z nich byly dvě
        nesouvisející věty.
      - **PAST V KASKÁDĚ, na kterou jsem naletěl podruhé za den:** odsazení uvnitř bloku
        musí dělat výhradně `gap`, protože vlastní marginy dětí se k němu PŘIČÍTAJÍ.
        `.qz-play .qz-expl { margin-top: 6px }` stojí v souboru později a má stejnou
        specificitu jako reset, takže z 8px mezery udělalo 14 (a na mobilu 6 + 10 = 16).
        Řeší to reset o třech třídách.
      - **Designeři se rozešli v jedné věci a rozhodovalo se podle měření:** druhý chtěl
        mezi tlačítky jen 12 px a místo toho blok tlačítek ukotvit ke dnu karty
        (`margin-top: auto` se stropem 64 px). To je ale ta samá cesta, ze které vzešla
        naměřená **díra 214 px**, jen zastropovaná — a mezera by se navíc měnila otázku
        od otázky. Zvolen stabilní rytmus, který vypadá stejně u každé otázky.
      - **NEDĚLAT:** oddělovací linku mezi tlačítka (vektorová čára v malované appce je
        cizí těleso — stejný důvod jako plochá šipka), obal/podklad kolem pravého sloupce
        (čtyři rámečky nad sebou a próza v boxu), nafukovat tlačítka na 64–80 px, ani
        zaplňovat prázdno pod sloupcem dekorací. Prázdný papír je tu legitimní materiál.
      - **ČTVRTÉ KOLO — sekundární tlačítko odlehčeno** (hráč: „zkus to odlehčené
        tlačítko"). Ubírá se VÁHA, ne barva: rámeček 1 px místo 1,5, písmo 600 místo 700,
        rádius o 2 px menší, jemný podklad `rgba(47,125,120,.07)` a na desktopu výška
        **44 px místo 52**. Plocha zůstane, obrys zeslábne — „Další otázka" je plná,
        „Více o…" jen naznačená. Na mobilu zůstává 52 px (44 je dotykové minimum).
        - **Scoped na `.qz-picwrap > .qz-extra .qz-more`**, protože třídu `.qz-more`
          používá i online část („Zpět do turnaje", „Odveta"), kde to jsou samostatná
          tlačítka, ne druhé housle.
        - **Past se specificitou potřetí za den:** `… .qz-fbtns > button { min-height: 52px }`
          má díky elementu `button` specificitu 0,3,1 a přebilo by `… .qz-more` (0,3,0),
          takže 44 px se neprojevilo. Nutné `button.qz-more`.
        - **ZMĚŘENÝ DLUH: kontrast textu na tom tlačítku je 4,05–4,33 : 1**, WCAG chce
          u písma pod 18 px 4,5. Podklad z toho ubral ~0,15 — před ním to bylo 4,20–4,48,
          tedy taky pod hranicí. Spraví to ztmavení textu na `#27736f` (4,77–5,10) nebo
          rovnou na `#1f5f5c`, který v paletě už je (6,31–6,74). **Neprovedeno schválně:**
          paleta je hráčovo území (stejný důvod jako u devíti míst v seznamu níž).
      - **NABÍDNUTO A ZATÍM NEPROVEDENO:** vytáhnout kurzívní hlášku z karty ven pod ni,
        čímž by vznikla symetrie typu „vlevo objekt + volný text, vpravo objekt + volný
        text" a karta by se zkrátila o 60–110 px.
    - **Vysvětlení 12,5 → 13,5 px a řádkování 1,55.** V kartě bylo v rámečku mezi sousedy,
      teď stojí samo na papíře vedle silného obrázku a plného tlačítka — drobné šedé písmo
      by v té pozici zmizelo. Rytmus mezer je odstupňovaný podle pravidla o VZDUŠNOSTI:
      obrázek → text 14, uvnitř bloku 12, text → akce 20, mezi tlačítky 10.
  - **`test:offline` má 799 kontrol** (bylo 792) a všech šest nových je **ověřeno mutací**.
    Dvě mutace nejdřív PROŠLY, protože kontrola hledala podřetězec: `qz-picwrapX` prošlo
    přes `/qz-picwrap/` a `.qz-hl.pointsX` přes `/\.qz-hl\.points/`. **U kontroly názvu
    třídy nebo selektoru patří do vzoru i uvozovky** — jinak testuješ prefix, ne jméno.

- **2026-09-06 — ZADÁNÍ A TŘI SLEPÉ ULIČKY k tomu, co je o zápis výš hotové. Platí dál: takhle se to dělat NEMÁ.**
  Hráčův návrh, jak dostat pryč prázdno kolem ilustrace, aniž by se ořezávalo nebo
  zužovala karta: **zisk bodů, vysvětlení a obě tlačítka přesunout z karty pod obrázek.**
  Karta tím zkrátí, rám (který ji lícuje) s ní — a prázdno zmizí samo.
  - **ZADÁNÍ, které musí platit současně** (každý bod je věta, kterou hráč skutečně řekl):
    1. **Oba obdélníky stejně vysoké.** „Ty obdélníky měly zůstat stejně vysoké."
    2. **Karta si drží šířku.** „Nechtěl jsem zmenšit ten box" (zúžení 514 → 412 zamítnuto).
    3. **Glóbus před odpovědí zůstává velký.** „Proč jsi zmenšil i ten globus??? To jsem
       nechtěl." — poměr 16:9 se tedy smí týkat JEN odhaleného rámu.
    4. **Nic se neořezává.** Ani v CSS, ani ořezem souborů.
  - **OVĚŘENO, ŽE TO FUNGUJE** (prototyp i implementace): desktop ✓, mobil ✓, prázdno
    kolem obrázku **206 → 28 px**, obrázek si drží plnou velikost 412×235.
    Na mobilu MUSÍ blok dostat `order: 4`, jinak „Další otázka" skončí nad odpověďmi —
    ověřeno, že bez toho se hráč proklikne dál dřív, než uvidí výsledek.
  - **CO JE HOTOVÉ V KÓDU** (vráceno `git checkout`, ale postup platí): prázdný
    `<div class="qz-extra" id="qz-extra">` v `renderQuestion` uvnitř `.qz-play`, funkce
    `presunPodObrazek(box)` volaná z `answer()` i `timeoutReveal()` (přesune
    `.qz-frow` a `.qz-hl.points`), CSS `grid-area: extra` + `order: 4` na mobilu.
    **Steal se nepřesouvá** — je to akce pro dalšího hráče u stolu, patří k odpovědím.
  - **TŘI SLEPÉ ULIČKY. Problém je vždycky VÝŠKA RÁMU PŘED ODPOVĚDÍ**, protože karta se
    v mřížce `"top top" "box pic" "box extra"` táhne přes dva spodní řádky, a řádek
    s rámem tedy nemá co by ho roztáhlo:
    1. **`aspect-ratio: 16/9` na oba stavy** → rám 418×238 i s glóbem. Zmenší glóbus
       z 256 na 56 px. Porušuje bod 3 zadání.
    2. **`min-height: 100%` na neodhalený rám** → nefunguje, procenta se počítají z výšky
       rodiče, která je `auto`. Rám 418×**80**, glóbus 56.
    3. **`grid-template-rows: auto 1fr auto`** → řádek s rámem dostane zbytek výšky
       `.qz-play` (ta má `flex: 1`), takže rám **přeroste kartu** — naměřeno 765 vs 691.
  - **DIAGNÓZA PRO PŘÍŠTĚ: rám a text pod ním chtějí být v JEDNOM OBALU, ne ve dvou
    řádcích mřížky.** Mřížka ať zůstane dvousloupcová `"top top" "box pic"` (beze změny)
    a do pravé buňky přijde obal `<div>` s rámem a extra blokem pod sebou. Tím rám dál
    lícuje s kartou přes obal a nic se nesráží. Pozor: obal rozbije selektory
    `.qz-play > .qz-picframe` (jsou na přímého potomka) a mobilní `order` — obojí se
    musí přepsat na nový obal. V rychlém prototypu přes DOM to takhle fungovalo.
  - **Proč se to tehdy nedodělalo:** tři nepovedené pokusy za sebou v jedné dlouhé session.
    **Diagnóza se druhý den potvrdila a je postavená** — viz zápis o kus výš; tenhle bod
    zůstává kvůli těm třem uličkám a kvůli zadání, které dál platí.

- **2026-09-05 — VYZKOUŠENO A ZAMÍTNUTO (potřetí): sahat na rám ilustrace kvůli prázdnu kolem ní. Čeká se na ČTVERCOVÉ obrázky, ne na CSS.**
  Hráč hlásil, že ilustrace u otázky je „zbytečně oříznutá". Měřením se ukázalo, že
  oříznutá NENÍ — jen zabírá **35 % rámu**: obrázek 412×235 v rámu 418×648, tedy dva
  rozmazané pruhy po 206 px. Rám je vysoký proto, že lícuje s kartou (`align-self:
  stretch`), a karta u dlouhé otázky se čtyřmi odpověďmi pod sebou vyroste na 648 px.
  - **Klíčové číslo, ze kterého plyne všechno ostatní: obrázek je limitovaný ŠÍŘKOU
    rámu, ne jeho výškou.** Ilustrace 16:9 v rámu širokém 412 px může být vysoká
    nejvýš 235. Zvětšovat rám na výšku tedy nepomůže, jen přibude prázdna.
  - **Zkusil jsem dvě cesty a hráč obě zamítl:**
    1. **Strop výšky rámu** (320 px, pak 250 px). Prázdno kleslo z 206 na 10 px, ale
       rám se přestal rovnat kartě — *„ty obdélníky měly zůstat stejně vysoké"*.
    2. **Poměr sloupců 5:4 → 4:5** (rám širší než karta). Obrázek by byl o 56 % větší
       (514×294 místo 412×235), jenže se to platí šířkou karty: 514 → 412 px, kde se
       otázka i tlačítko „Více o…" lámou na příliš mnoho řádků — *„nechtěl jsem zmenšit
       ten box"*. Pro pořádek naměřeno i 3:4 (obrázek 160k px), tam je karta 397.
  - **ROZHODNUTÍ: nechat to být a počkat na obsah.** Generátor dělá od 2026-09-01
    čtvercové ilustrace (1:1); ty budou v témže rámu vysoké **412 px místo 235**, tedy
    o 75 % víc, a to bez jediného oříznutého pixelu. Cesta je tedy přegenerovat fond
    (`node scripts/gen-irony-images.js --force`), ne dolaďovat CSS.
  - **Ořez po stranách (`cover`) byl nabídnut a odmítnut** — u 340 px výšky by se
    skrylo 30 % šířky, u 450 px skoro polovina. U scén, kde se něco děje po stranách,
    by to ubralo pointu.
  - **PAST PŘI MĚŘENÍ, kvůli které jsem nejdřív hlásil neexistující ořez:** panel
    prohlížeče byl skrytý (`document.visibilityState === "hidden"`), takže se animace
    odhalení nespustila a obrázek držel počáteční `scale(1.07)` z `@keyframes qz-picin`
    — `getBoundingClientRect` pak vrátil 440 px v rámu 418 a vypadalo to na ořez.
    **Skutečný stav se změří až po `img.getAnimations().forEach(a => a.finish())`.**
    Je to tatáž třída pasti jako zapsané „rAF neběží, když je panel skrytý" (2026-09-03).

- **2026-09-04 — Průřezový audit: fond raději PRÁZDNÝ než cizí, a dvě „připravené, ale nezapojené" věci v CSS.**
  Čtyři paralelní audity (server, online klient, offline klient, CSS/přístupnost).
  Nálezy jsem ověřoval sám — agenti hlásí i věci, které neplatí, a jeden dopad nadsadil
  o tři řády (viz „ghost v blesku" mezi otevřenými).
  - **`bandPool()` tiše podstrčil cizí fond a byl to nejzávažnější nález.** Každá větev
    měla `if(f.length) pool=f`. `data.questions` je přitom fond UŽ ZÚŽENÝ výběrem země
    a tématu, takže „pásmo tu nemá nic" je běžný stav: **203 z 495 kombinací země × sekce
    nemá jedinou dětskou otázku.** Dítě, které si vybralo Rakousko → Sport, tedy dostalo
    otázky psané pro dospělé a poznalo to leda podle hvězdiček — přesně to, co se
    opravovalo 2026-08-24, jen jinými dveřmi. **Fond teď říká pravdu (klidně prázdno)**
    a hráči se to řekne: start je zablokovaný a obrazovka vysvětlí proč
    (`prazdnoNote` v sólu, `partyPrazdnoNote` u stolu) + pojistky ve `startGame`/`startParty`.
  - **Dvě věci byly v CSS připravené, ale nikdo je nezapojil.** `.qz-a.locked` má
    hotový vzhled odpovězené dlaždice včetně komentáře, proč vznikl — jenže tu třídu
    **nikdo nenastavoval**, takže odznak zůstal tealovým kolečkem s písmenem a zelený
    text v něm měl kontrast **1,45:1**. Správnost fakticky nesla jen barva rámečku.
    Poučení: **existující CSS pravidlo není důkaz, že se používá** — grep na název třídy
    v JS je otázka na dvě vteřiny.
  - **`repeat(4, 1fr)` u odpovědí = táž past jako u dlaždic 2026-09-03**, jen na hlavní
    obrazovce a tři měsíce nepovšimnutá. `1fr` je `minmax(auto,1fr)`, `auto` u dlouhého
    slova je jeho šířka, `.qz-shell` má `overflow: clip` → text zmizí a nedá se
    doscrollovat. Změřeno na 320 px: 8 px za okrajem, u nejdelšího slova ve fondu 167 px;
    **559 z 3742 otázek** má v možnosti slovo ≥ 13 znaků. Nutné je `minmax(0,1fr)`
    **i** `overflow-wrap: anywhere` — jedno bez druhého nestačí.
  - **Karta „Více o…" visí v `#qz-shell` jako SOUROZENEC `#qz-body`**, takže ji překreslení
    otázky neodstraní. Enter pod otevřenou kartou proto posunul hru a karta zůstala viset
    nad novou otázkou (v párty se navíc posunul tah). Nově ji Enter/mezera/Escape zavře
    a hrou nehne. **Escape neuměl do té doby nikdo.**
  - **Server:** `matchedResponse` mazal řádek fronty dřív, než ověřil, že hra existuje —
    kdo pollnul v okně mezi zamčením soupeře a `INSERT INTO games`, dostal `matched` na
    neexistující hru, spadl na 404 a po 48 h mu naskočila **hodnocená prohra za partii,
    kterou nikdy neviděl**. `match.js` byl navíc pátá cesta zakládající hru a jediná bez
    rate limitu (počítá se až při skutečném založení, ne při zařazení do fronty).
  - **`schema.sql` neměl `q_served` a `replay_answers` v seznamu `DROP TABLE`** — přesně
    past, před kterou varuje komentář o tři řádky výš (`db:init` spadne v půlce).
    Hlídá to nově `test:offline`.
  - **`fondy.json` → `victory` nemělo pásmo `starsi`.** `resolveQuip` spadne přes
    `?? Object.values(quip)[0]` na první klíč, tedy na DĚTSKÉ hlášky — puberťák po každé
    výhře dostával „Zeměkoule se dnes točí jen pro tebe!". Test teď hlídá všechna tři
    pásma u každého fondu členěného po pásmech.
  - **PAST, na kterou jsem naletěl DVAKRÁT za jedno sezení: grep na zakázaný vzor chytá
    vlastní komentáře.** Kontrola „není v migraci `DROP`?" vyhlásila poplach na větě
    „žádný DROP ani DELETE", a kontrola nasazeného `bandPool` na komentáři, který ten
    starý stav popisuje. **Před hledáním zakázaného vzoru odstraň komentáře.**
  - **PAST, která mě stála práci: `git checkout -- soubor` na necommitnuté opravy.**
    Chtěl jsem vrátit mutaci a smazal jsem tím celou dávku úprav v `quiz.js`. Na mutační
    testy patří kopie souboru stranou, ne git.
  - **Testy:** `test:offline` **792** (bylo 693), `test:api` 138, `test:ghost` 67.
    Nové kontroly ověřeny mutací.
  - **CO ZŮSTÁVÁ OTEVŘENÉ** (ověřeno, že platí, ale neopraveno):
    - **Odveta umí vyrábět hodnocené výhry** — `rematch.js` vloží soupeře bez jeho vědomí
      a po 48 h se hra vyrovná. Nese to CLAUDE.md jako otevřené od 2026-09-03.
    - **Odchod z čekárny křížkem nechá hráče ve frontě** (`DELETE /match` posílá jen
      tlačítko „Zrušit hledání"), takže může být spárován do hry, o které neví.
    - **Hra proti botovi se založí i když server bota odmítl** (503/409 se nekontroluje).
    - **`join.js` nekontroluje `game.status`** — do expirované hry na odkaz jde vstoupit,
      odehrát ji a nedostat žádný rating.
    - **`GET /api/tournament/:id` nemá kontrolu pásma** (listing ji od 2026-09-03 má).
    - **Poškozený token vrací 500 místo 401**, takže si ho klient nesmaže a API zůstane
      zablokované; `auth.js` volá `atob` bez `try`.
    - **Ghost přehrává odpovědi napříč časovými kontrolami** — `replay_answers` neukládá
      `limit_s`, takže odpověď z dvacetivteřinové hry se v blesku počítá jako vypršení.
      **Agent to označil za „systematické", ale změřeno je to 2 z 3212 vzorků (0,06 %)**
      — dnes zanedbatelné, s růstem podílu denní pětky ale poroste.
    - **Appka stáhne při startu 4,71 MB otázek a do té doby je bílá stránka** (žádný
      spinner), i když hráč míří jen do Světové ligy.
    - **Kontrast malých textů pod 4,5:1** — naměřeno u devíti míst (`.qz-tbadge` 2,21:1,
      `.zk-statusico` 2,06:1, placeholder 2,30:1, `.qz-plturn` 2,97:1, `.qz-hl` 3,62:1,
      `.zk-dangerlink` 3,74:1, `.qz-globecap` 4,11:1; bílá na korálu 3,04:1 projde jen
      u 19px `.qz-go`, ne u `.qz-btn-start`). **Neopraveno schválně:** je to plošný zásah
      do palety a vzhled je hráčovo území, ne moje. `--muted` je naopak v pořádku (5,02:1),
      starší poznámka o 4,15:1 už neplatí.
    - **Dotykové cíle pod 44 px** — `.qz-bandbtn` 40×25, `.qz-resume-del` 24×24 (9×),
      `.qz-crumb` výška 18, `.qz-close` 34×34. Herní `.qz-a` je v pořádku (64/52 px).
      Taky plošná změna rozměrů, tedy k rozhodnutí, ne k tichému provedení.
    - **Dlaždice pásem nejsou na desktopu čtvercové** — `.qz-tiles:not(.qz-tiles-sec) .ic-img`
      (specificita 0,3,0) přebíjí `aspect-ratio: 1/1` (0,2,0); na 1400 px naměřeno 115×134.
    - **`applyRotation()` není navěšená na `resize`/`orientationchange`** — otočení tabletu
      uprostřed párty nechá starý `scale` a obsah může zůstat useknutý do další otázky.
      `resizeGlobe` i `positionPickHead` na `resize` navěšené jsou, takže je to opomenutí.
    - ~~Párty jméno bez `maxlength`, „✕ odebrat" mimo obrazovku, karta „Více o…" mimo
      obraz, pop-up bez fokusu a Escapu, online hláška se zlatým rámečkem, online bez
      fokusu na první odpověď~~ — **VYŘEŠENO 2026-09-04** (tentýž den, druhá dávka):
      `min-width: 0` + `overflow-wrap` u `.qz-plmeta` a `.qz-standname`, `maxlength=20`,
      `.qz-cardov` na `position: fixed` (v párty se díky `transform` na shellu dál otáčí
      se hrou), fokus a Escape v pop-upu, `.qz-ht` místo `.qz-hlaska` v online.

- **2026-09-03 — „Ghost" soupeř: online hra přehrává SKUTEČNÉ lidské odpovědi z banky místo syntetického bota. MECHANIKA hotová a nasazená; PREZENTACE (jméno, přiznání bota) je vědomý další krok.**
  Řídká základna (~19 účtů) znamená, že dva lidé se ve stejném ~15s okně živého duelu
  prakticky nepotkají — „Hledám soupeře" skoro vždycky skončí botem a to čekání je
  divadlo. Řešení podle toho, jak to dělají casual hry: **soupeř přehraje reálnou lidskou
  odpověď na tutéž otázku** (její trefu i čas), takže má lidské načasování a chyby a nedá
  se prokouknout jako skript. Reálný člověk vs. člověk pak žije přes odkaz a turnaje.
  - **Nová tabulka `replay_answers`** (migrace [2026-09-03-replay-answers.sql](migrations/2026-09-03-replay-answers.sql),
    přírůstková) = banka lidských odpovědí po otázkách: `question_id`, `band`, `correct`,
    `ms`. **Anonymní schválně** — bez user_id a bez přezdívky. Nese jen chování, ne
    identitu: kvůli soukromí a aby to nebyla impersonace konkrétního účtu.
  - **Plní se v `settleIfDone`** ([functions/_lib/settle.js](functions/_lib/settle.js), `bankHumanAnswers`)
    z odpovědí LIDSKÝCH hráčů (daily/duel/odkaz — offline sólo server nevidí, to nevadí).
    Boti i ghost jsou vyfiltrovaní přes `is_bot` (píšou pod účet bota), takže **banka
    nesbírá sama sebe — žádná zpětná smyčka.** Best-effort a AŽ ZA zámkem `status='done'`,
    takže běží právě jednou a případný pád nerozbije vyrovnání hry.
  - **Zabudováno do `botPlay`** ([functions/_lib/bot.js](functions/_lib/bot.js)), ne jako
    nová funkce: tři volání (`/game/:id/bot`, `/tournament/:id/bot`, `rematch`) se tím
    stala ghost-schopná **beze změny**. Pro každou otázku losuje vzorek z banky (dané
    pásmo); **chybí-li otázka v bance (cold start), spadne na pravděpodobnostní model
    bota** — otázku po otázce. `question_id` (ne `q_index`, ten je pozice v konkrétní hře).
  - **Rating zůstává poctivý:** ghost hraje pod účtem bota, takže se kalibruje týmž
    strojem (`calibrateBot`) — síla bota časem konverguje k tomu, jak reálně z banky hraje.
    Self-correcting, žádný fake člověk v žebříčku.
  - **PREZENTACE — POSTAVENO 2026-09-04 (hráč schválil).** Mechanika je neviditelná; tohle
    ji zviditelnilo, aby soupeř působil jako člověk:
    - **Lidské jméno místo přezdívky bota.** `souperJmeno(nick, isBot, klic)` v online.js:
    účet bota se NEPŘEJMENOVÁVÁ (`nick_lower` je UNIQUE — baking jmen do účtů by je zabral
    reálným hráčům a byla by to jen zásoba 6), jméno je jen ZOBRAZENÍ ze zásoby 36, odvozené
    z **id hry**: stabilní v rámci hry (na všech místech i při dotazování), různé hru od hry.
    Aplikuje se u živého proužku soupeře, ve výsledcích a v hlášce „Nastoupil …". **Server
    dál posílá `is_bot`** (rozbor/žebříček ho potřebují, `test:api` na něj spoléhá) — jen se
    nekreslí. Štítek „(bot)" i slovo „bot" z UI pryč.
    - **Zrušené fingované čekání.** `BOT_AFTER_MS` 15→**4 s** (a turnaj 8→4 s); klient na
    `offer_bot` nasadí soupeře **AUTOMATICKY** (`vezmiSoupere`, guard `vzato` proti dvojímu
    založení), místo aby čekal na klik. Reálný člověk se stihne spárovat v těch pár vteřinách
    (`matched` má přednost). Tlačítko „Vezmi bota" → „Hrát hned" (přeskočí i ty 4 s).
    - **Dlaždice přeznačena:** „Proti živým soupeřům. Zatím převážně z Česka." → **„Rychlé
    souboje o rating. Zatím hlavně z Česka."** (drží českou sebeironii, neslibuje real-time
    živého člověka). Uvítací texty lobby („Hraješ proti dospělým…") zůstávají — popisují
    věkovou ligu, ne živost, a ghost přehrává reálné lidi daného pásma, takže platí.
    - **Ověřeno v prohlížeči end-to-end:** „Hrát teď" naskočí rovnou do hry (žádné čekání),
    výsledek ukázal soupeře **„Marek ★ 795"** — lidské jméno, žádné „(bot)". `souperJmeno`
    ověřeno i jednotkově (36 jmen, stabilní na hru, jen na bota). `test:api` 138 beze změny.
  - **Testy:** [scripts/test-ghost.js](scripts/test-ghost.js) (`npm run test:ghost`, v CI)
    ověřuje přes FALEŠNÉ `env.DB` (žádná síť/D1), že se banka přehrává a při prázdné
    spadne na model — **ověřeno mutací** (vypnutí banky → test spadne). Plnění banky
    ověřeno ŽIVĚ: dohraná daily přidala přesně 5 řádků. `test:api` 138 beze změny
    (prázdná banka = původní chování bota).
  - **Past: `wrangler d1 execute --local --file migrace.sql` shodila zámek běžícího dev
    serveru** (exit 255, tabulka nevznikla), zatímco jednotlivé `--command` prošly. Když
    migrace přes `--file` lokálně tiše selže, pusť příkazy po jednom, nebo dev server na
    chvíli zastav.

- **2026-09-03 — Online část kreslila plochou šipku „→"; sjednoceno na malovanou `handArrowSvg`. Pravidlo jsem NEMĚL zapsané, proto se vracelo.**
  Hráč ukázal tlačítko „Pokračuj" s malovanou šipkou a řekl *„všude měla být tahle"*.
  Offline část (`quiz.js`) používá ručně kreslenou `handArrowSvg()` odjakživa, ale **celý
  `online.js` kreslil plochý typografický glyf `→`** na 20+ tlačítkách, v `backBar` (`←`)
  i na dlaždici „Hrát teď" (`zk-heroarrow`). Je to stejný princip jako u hvězdy skóre
  (2026-09-03: plochý vektor v malované appce = cizí těleso → malovaná `ico-star.png`).
  - **Příčina, proč „zase": pravidlo nikde nebylo.** Prošel jsem CLAUDE.md, paměť
    i `git log --grep=šipk` / `-S zk-heroarrow` — ani zmínka. Naopak jediný záznam
    (2026-07-23) šipky jako „typografické ovládací glyfy" výslovně POVOLOVAL. Řídil jsem
    se špatným záznamem. **Nově je pravidlo mezi konvencemi nahoře, ne jen tady v logu.**
  - **`handArrowSvg` je v `online.js` KOPIE** (soubor je samostatný IIFE, na funkci
    z `quiz.js` nedosáhne — stejně jako `esc`/`plur`). Napsaná konkatenací místo template
    literalu, ať sedí do stylu `online.js`; výstup je bajtově shodný s quiz.js. Komentář
    u obou říká „změníš-li doodle, uprav OBĚ".
  - **Dvě tlačítka nastavovaná přes `.textContent` (nabídka bota v čekárně) přepnuta na
    `.innerHTML`** — do textContent SVG nejde. Text je statický, bez vstupu hráče.
  - **`.zk-heroarrow` CSS se neměnilo** — má `font-size:22px; color:var(--teal)`, SVG bere
    velikost v `em` a `currentColor`, takže sedne barvou i velikostí bez zásahu. Na
    korálovém `.qz-go` je šipka bílá ze stejného důvodu (`currentColor`).
  - **Regresní pojistka v `test:offline` (683 kontrol, +4):** po odstranění komentářů nesmí
    v `quiz.js` ani `online.js` zůstat jediný glyf `←`/`→`. Ověřeno mutací (vložení plochého
    `→` do tlačítka → chyceno; čistá appka 0).
  - **Ověřeno v prohlížeči** na třech kontextech: dlaždice „Hrát teď", „Zpět do hry" (levá,
    flipnutá) i korálové „Uložit e-mail" / „Změnit pásmo" (bílá šipka). Nasazeno na produkci.

- **2026-09-03 — Druhá dávka z auditu: rate limity jsou ATOMICKÉ a platí na všech čtyřech cestách. Plus zámek PINu, whitelist a záchytný bod API.**
  Pokračování předchozího zápisu; otevřené body dál v `AUDIT_REPORT.md`.
  - **`checkRateLimit` nahrazen `limitUctu` / `limitIp`** — jedním atomickým příkazem
    místo dvojice `SELECT` → `UPDATE`. Stará verze pustila souběžné požadavky všechny
    najednou, protože přečetly stejnou hodnotu: limit fakticky znamenal „N DÁVEK za
    hodinu, každá libovolně velká". O všem teď rozhoduje `WHERE` uvnitř příkazu
    a odpověď se čte z `meta.changes` — stejný vzor jako zámek v `settle.js`.
    **Poučení: mé tehdejší „ověřeno trojím způsobem" bylo třikrát SEKVENČNÍ**, takže
    tuhle třídu chyby minulo. Souběh se přes lokální wrangler vynutit nedá.
  - **Limit zakládání hry platí na VŠECH čtyřech cestách**, ne jen v `api/game/index.js`.
    Nejlevnější obchvat byl turnajový bot: každé volání založilo hru, dva hráče, deset
    odpovědí a deset viděných otázek, a to bez jediné odpovědi hráče.
  - **U friend_code se počítadlo navyšuje PŘED vyhledáním kódu — NEPŘEHAZUJ TO.**
    Zkusil jsem vyhledávat první a počítat až neúspěch (vypadá to čistěji, protože
    „počítají se jen neúspěchy"), jenže tím zámek přestal platit pro správný kód: kdo
    si deseti tipy zamkne hodinu a v jedenáctém se trefí, mohl by ho použít. U ochrany
    dětí je to zrovna to podstatné. **Odhalil to existující test** „ani platný kód po
    limitu neprojde". Aby přitom dál platilo „kdo kód dostal, na limit nenarazí",
    se pokus při ÚSPĚCHU zase odečte.
  - **Past při té úpravě:** smazal jsem s blokem limitu i `const now`, kterou používá
    zápis přátelství o dvacet řádků níž — projevilo se to jako 500 na úspěšné cestě.
    Test to chytil okamžitě; grep na osiřelé proměnné po smazání bloku se vyplatí.
  - **`TC_NAMES` místo indexace `TIME_CONTROLS[x]`.** `TIME_CONTROLS["constructor"]`
    vrací funkci z prototypu, takže kontrola `if (!tc)` takové jméno pustila — a u turnaje
    se dokonce ULOŽILA do databáze, čímž vznikla položka, která každému, kdo do ní vstoupí,
    vrací chybu. Do `bot.js` a `play.js` přidána i pojistka pro už uložené rozbité turnaje.
  - **Zámek přihlašování se při zamčení už nenuluje** a s každým dalším neúspěchem se
    prodlužuje (10, 20, 30 … minut). Dřív se zapisovalo `login_fails = 0`, takže po
    vypršení zámku měl útočník znovu plných osm pokusů — trvale ~48 za hodinu donekonečna.
    Úspěšné přihlášení počítadlo pořád nuluje, takže poctivého hráče eskalace nepotká.
  - **Pásmo turnajů se bere z účtu, ne z `?band=`.** Přes parametr šlo vypsat běžící
    DĚTSKÉ turnaje a přes detail pak přezdívky a skóre jejich účastníků. Stejná třída
    díry, jakou se u denní pětky a her zavírala 2026-08-31 — na turnaje se zapomnělo.
  - **Nový `functions/_middleware.js`.** Neošetřená výjimka dřív minula `json()`/`fail()`
    a klient dostal HTML stránku Cloudflare, na které `r.json()` selhalo. Podrobnost
    chyby se ven neposílá, jen loguje.
  - **Ověřeno:** `test:api` 138, `test:offline` 679, `validate` 0 chyb.
    **Pozor na známou nestabilitu:** kontrola „usazený hráč silou bota pohnul" je
    nedeterministická (rating bota závisí na losu otázek, viz zápis 2026-09-01) —
    spadla jednou ze tří běhů, pak dvakrát po sobě prošla. Není to regrese.

- **2026-09-03 — Audit našel DVĚ VOLBY, na které se nedalo kliknout. Obojí byla stará vada, obojí měřitelná.**
  Průřezový audit (server, klient, CSS a přístupnost) — celý zápis je v `AUDIT_REPORT.md`.
  Nejzávažnější nález nebyl bezpečnostní, ale úplně obyčejný: **dvě volby na hlavní
  cestě do hry byly fyzicky nedosažitelné.**
  - **Výběr pásma přetékal na KAŽDÉM telefonu.** Při 375 px `scrollWidth 430` proti
    `clientWidth 375` — dlaždice „Dospělí" byla rozseknutá v půlce a na její pravou
    půlku nešlo kliknout. A protože `.qz-shell` má `overflow: clip`, nedalo se k ní
    ani doscrollovat. „Jdeme na to" je přitom `disabled`, dokud pásmo nevybereš.
  - **Výběr témat ořezával DVĚ Z DESETI témat na tabletu** (640–817 px). Při 700 px
    mřížka `142px ×5` = 796 px v kontejneru širokém 700.
  - **Společná příčina: `1fr` je `minmax(auto, 1fr)`, a `auto` u obrázku s pevnou
    šířkou je ta šířka.** Stopa se proto nesmrskla a mřížka rostla přes kontejner.
    Řešení je `minmax(0, 1fr)` u sloupců **a zároveň** `max-width: 100%; height: auto;
    aspect-ratio: 1/1` u obrázku — jedno bez druhého nestačí. Online část to měla
    správně už dřív (`.zk-bandpick` sráží obrázek pod 480 px).
  - **Ověřeno měřením na 320 / 375 / 640 / 700 / 1400 px: přetečení 0 px všude.**
    Screenshotem doloženo, že „Dospělí" i „Historie" jsou celé v obraze.
  - **Zrušeno `user-scalable=no`** v `hra.html`. Porušovalo WCAG 1.4.4 a bylo to
    zároveň jediná úniková cesta z obou přetečení, dokud existovala.
  - **`qz-school` se nově sundává i v `close()`.** Přidává ji `startSchool()`, ale
    odebíraly jen `startGame`/`startParty`/`resumeSave` — po sekvenci škola → „×" →
    Světová liga tedy zůstávala na shellu a online otázka se kreslila v promítacím
    písmu, protože online recykluje přesně ty třídy, které `.qz-school` zvětšuje.
  - **`cc` doplněno do `SELECT`u** v `q/[n].js` — přidal jsem 2026-09-03 do odpovědi
    `cc: q.cc` s komentářem, že se posílá výslovně, ale do dotazu jsem sloupec nedal.
    Glóbus v online tedy fungoval jen díky fallbacku z prefixu id, který jsem označil
    za pojistku pro staré hry. **Kód a komentář si odporovaly.**
  - **Nově je CI** (`.github/workflows/kontroly.yml`): `node --check` na oba klientské
    skripty, `validate`, `test:offline`. Schválně jen to, co nepotřebuje síť ani
    databázi. Důvod je konkrétní: téhož dne jsem si `quiz.js` rozbil zpětným apostrofem
    v komentáři uvnitř template literalu a appka se přestala vykreslovat úplně.
  - **CO ZŮSTÁVÁ OTEVŘENÉ, viz `AUDIT_REPORT.md`:** obnova PINu je v produkci mrtvá
    a přitom loguje odkaz i s e-mailem; rate limit pokrývá jednu ze čtyř cest
    zakládajících hru a `checkRateLimit` není atomický (obojí moje práce z 2026-09-02);
    odveta umí vyrobit hodnocené výhry; `TIME_CONTROLS[x]` prochází přes prototyp;
    zámek přihlašování se při zamčení nuluje; kontrast `--muted` je 4,15:1 místo 4,5:1.

- **2026-09-03 — Glóbus na rozcestníku je za NADPISEM, ne za dlaždicemi. Dvě předchozí verze spadly na magickém čísle.**
  Hráč se ptal, „kdo změnil posunutí glóbu dolů za dlaždice" — odpověď byla, že nikdo
  (je tam beze změny od 2026-07-21), ale výsledný dojem mu vadil a chtěl ho výš.
  - **Posunout nestačilo, muselo se i zmenšit.** Nad dlaždicemi je jen ~195 px místa,
    zatímco glóbus měl 500 px. Nově **360 px** (`min(360px, 70vw)`).
  - **DVĚ ŠPATNÉ CESTY, ať je nikdo nezkouší znovu:**
    1. **`top: -40px`** (kotva k hornímu okraji obrazovky) — rozešlo se na okně vysokém
       1250 px: obsah se centruje svisle a klesl doprostřed, glóbus zůstal nahoře
       a nadpis skončil až na jeho spodní hraně.
    2. **`translateY(-317px)`** od středu obsahu — přežilo změny výšky okna, ale spadlo
       na TELEFONU: tam jsou dlaždice pod sebou, obsah je dvakrát vyšší a pevný posun
       nestačil, takže glóbus skončil za první kartou.
    Obojí byla **magická čísla vázaná na výšku obsahu**, která se mezi rozvrženími mění.
  - **Co funguje: glóbus je SOUROZENEC NADPISU uvnitř `.qz-titlewrap`** (drobná změna
    HTML v `renderModePick`). Centruje se na nadpis, takže drží při jakékoli výšce okna.
  - **TŘETÍ past, čistě CSS: `inset: 0; margin: auto` NECENTRUJE prvek, který je VĚTŠÍ
    než jeho rodič.** Obal má šířku nadpisu (~194 px), glóbus měl 360 — vodorovně se
    `margin: auto` vzdalo a zarovnalo ho doleva, ZATÍMCO SVISLE vycentrovalo. Vypadalo
    to jako záhadný posun v jedné ose. Správně je `left/top: 50%` + `translate(-50%, …)`,
    které na poměru velikostí nezávisí.
  - **ČTVRTÁ past: `#qz-shell` má skryté přetečení**, takže glóbus vyčnívající nad horní
    okraj se ořezával (o 39 px na okně vysokém 900). Nahoře je jen 44 px odsazení, kdežto
    glóbus sahá 150 px nad střed nadpisu, a zvětšit odsazení nejde — na 700 px se obsah
    sotva vejde. Vyřešeno posunem na `translate(-50%, -35%)` (tedy o kousek níž než
    přesný střed) a zmenšením na 300 px. Posun je v procentech VLASTNÍ velikosti glóbu,
    takže přežije i jeho případnou změnu.
  - **Ověřeno na pěti velikostech** (375×812, 1280×700, 1280×1250, 1920×900, 1920×1080):
    posun středu proti nadpisu **0 px** a ořez shora **0 px** všude. Důkaz, že se glóbus
    váže na nadpis a ne na okno, je v tom, že překryv s dlaždicemi vyjde na desktopu
    shodně bez ohledu na výšku okna — to se u obou zamítnutých verzí lišilo.
  - **PAST, na kterou jsem naletěl cestou: HTML komentář uvnitř template literalu nesmí
    obsahovat ZPĚTNÉ APOSTROFY.** Napsal jsem do něj `` `.qz-titlewrap` `` a tím řetězec
    ukončil — appka se přestala vykreslovat úplně a v konzoli bylo jen záhadné
    „titlewrap is not defined". `node --check quiz.js` to odhalí okamžitě.

- **2026-09-03 — NASAZENO NA PRODUKCI. Tři pasti, z toho dvě nové, a jedna z nich by mě málem donutila hlásit neexistující únik.**
  Nasazeno všechno z 2026-09-02 a 09-03. **Produkce má 19 SKUTEČNÝCH ÚČTŮ** (zápis
  z 2026-09-01 mluví o nule — od té doby se lidé zaregistrovali), takže destruktivní
  postupy byly úplně mimo hru a všechno se dělalo přírůstkově.
  - **Pořadí: migrace → obsah → deploy.** `migrations/2026-09-02-rate-limits.sql`
    (4× ALTER + 1× CREATE, ověřeno grepem, že tam není `DROP`/`DELETE`), pak
    `db:sync` (150 INSERTů s `ON CONFLICT DO UPDATE`), pak `pages deploy`.
    Po každém kroku ověřeno, že **19 účtů a 19 ratingů zůstalo netknutých**.
    Obsah byl skutečně zastaralý: dětské otázky měly starý opener u **617 otázek**,
    po syncu 155 — přesně jako v repu.
  - **PAST 1 (známá, ale s jiným číslem): wrangler sáhl po CIZÍM ÚČTU.**
    `npx wrangler whoami` hlásilo správný účet `3005fa92…`, ale požadavek šel na
    `88fa409d…` a spadl na **7403** („account is not valid or is not authorized"),
    ne na 7404, které má zapsané `wrangler.toml`. Řeší to dokumentovaná proměnná:
    `CLOUDFLARE_ACCOUNT_ID=3005fa92056c05be6e87ea85a5df5ab9` **před každým**
    `wrangler d1 execute --remote`. **Samotné `whoami` tedy NESTAČÍ jako ověření.**
  - **PAST 2 (nová): `wrangler pages deploy` bez `--branch` nasadí NÁHLED, ne produkci.**
    První nasazení skončilo na `claude-lobby-rozehrane-hry.zemekviz.pages.dev` a ostrá
    adresa `zemekviz.pages.dev` starý kód **nadále servírovala** — ověřeno grepem na
    „Světová liga": náhled 1×, produkce 0×. Produkční větev projektu je **`master`**
    (`wrangler pages deployment list` ji ukáže ve sloupci Environment). Nasazuj tedy
    `npx wrangler pages deploy dist --project-name zemekviz --branch master`
    a **předtím posuň `master`**, ať produkce neběží na kódu, který v master větvi není;
    tady to byl čistý fast-forward (ověřeno `git merge-base --is-ancestor`).
  - **PAST 3 (nová, a nejzrádnější): kontrola úniku souborů podle HTTP kódu NEFUNGUJE.**
    `CLAUDE.md`, `schema.sql`, `wrangler.toml` i `d1-seed.sql` vracely na produkci **200**
    a vypadalo to na sedminásobný únik. Ve skutečnosti je to **SPA fallback** — každá
    neznámá cesta vrátí `index.html` s kódem 200, což potvrdila vymyšlená
    `/tohle-neexistuje`, která vrátila totéž. **Kontroluj OBSAH odpovědi, ne status.**
    (Skutečná pojistka je stejně jinde: `dist/` ty soubory vůbec neobsahuje, což se
    ověřuje lokálně po `npm run build`.)
  - Ověřeno na ostré adrese s obejitím cache: `Světová liga`, `ZKPicframe`, `ico-star`,
    „vítej v aréně vědomostí" i „Co jsi hrál" jsou venku, `assets/ico-star.png` vrací 200,
    `/api/leaderboard` bez přihlášení 401, konzole čistá.

- **2026-09-03 — Online otázky mají konečně glóbus a ilustraci. A hvězdička u skóre byla rozbitá geometrie, ne špatný vkus.**
  Hráčova otázka: *„proč u online otázek není globus?"* Odpověď: **online si otázku kreslí
  vlastní funkcí.** `nextQuestion()` v [online.js](online.js) recykluje jen CSS třídy
  `.qz-play`/`.qz-box` a nikdy nevolala `picframeHtml()`, takže rám neexistoval vůbec.
  Není to rozhodnutí, je to díra z doby, kdy online vznikal — 2026-09-01 jsem opravil jen
  její důsledek (mřížka rezervovala prázdný sloupec), ne příčinu.
  - **`window.ZKPicframe` je JEDINÉ okno z quiz.js ven** (`html`/`wire`/`globe`/`reveal`).
    Schválně jen čtyři funkce kolem `.qz-picframe` — stav (`S`, `data`) zůstává zavřený,
    jinak by se online začal vázat na offline. Funguje to proto, že **obě části sdílí
    `#qz-body`**, takže `body.querySelector()` uvnitř quiz.js trefí i online obrazovku.
    Když modul chybí, `picframe()` vrátí prázdný řetězec a mřížka dá kartě obě sloupce —
    přesně jako dřív, takže online.js nepotřebuje žádné `if` navíc.
  - **Server nově posílá `cc`** ([q/[n].js](functions/api/game/[id]/q/[n].js)). Dalo by se
    odvodit z prefixu `id`, ale to je nepsaná dohoda o tvaru id; klient si ji drží jen
    jako fallback pro hry rozehrané před touhle změnou. Nic to neprozrazuje — jméno země
    je v payloadu vedle.
  - **Vlastní ilustrace uvnitř karty (`.zk-picframe`) SMAZÁNA** i s CSS. Existovala právě
    proto, že online neměl rám; s ním by se obrázek kreslil dvakrát vedle sebe. Její
    komentář ten důvod sám popisoval („jen tu není glóbus, který by rám vyplnil").
  - **PAST, KTERÁ MĚ STÁLA NEJVÍC ČASU: `requestAnimationFrame` NEBĚŽÍ, když je panel
    prohlížeče skrytý.** Glóbus proto v testech „nikdy nedotočil na zemi" — po devíti
    sekundách ukazoval Karibik místo Maďarska a vypadalo to na skutečnou chybu. Ve
    skutečnosti se posunul jen tehdy, když screenshot vynutil překreslení. Doloženo tím,
    že smyčka `rAF` se v konzoli nedokončila a nástroj sám ohlásil „the Browser pane is
    currently hidden". **Než začneš ladit animaci nebo CSS přechod přes headless panel,
    ověř, že rAF vůbec běží** — jinak laboruješ s artefaktem.
  - **Druhá slepá ulička: otisk WebGL canvasu přes `drawImage` vrací PRÁZDNO.** Bez
    `preserveDrawingBuffer` je buffer po vykreslení zahozený, takže moje „měření, jestli
    se glóbus hýbe" vracelo samé nuly a tvářilo se jako „glóbus stojí". Na WebGL použij
    screenshot (ten kompozici zachytí), ne čtení pixelů z canvasu.
  - **Hvězdička u skóre (`ICO_STAR`) měla ROZBITOU cestu.** Devět bodů místo deseti,
    nestřídající se poloměry a jeden bod na `y = 24,8`, tedy **mimo `viewBox`** — ořízl se
    a hvězdě chyběl levý dolní hrot; v 16 px to byla placatá skvrna. Nejdřív opraveno
    **spočítanou** cestou (10 bodů po 36°, poloměry 9,4 a 4,35 od středu 12; 12,6),
    nakonec ale **nahrazeno malovanou `assets/ico-star.png`** — appka je celá malovaná
    a plochý vektor v ní působil jako cizí těleso; `ico-resume.png` byl precedens.
    Porovnáno vedle sebe ve **skutečných 17 px** i ve čtyřnásobku: v odznaku jsou obě
    čitelné, ve zvětšení maluje jasně vyhrává. `ICO_STAR_DIFF` u obtížnosti se neměnila,
    ta je v pořádku (ověřeno vykreslením, ne parserem — viz níž).
  - **Bílé pozadí z Gemini se odstraňuje ZÁPLAVOU OD OKRAJŮ, ne prahem na bílou.**
    Práh by udělal díry ve světlých místech uvnitř hvězdy. Prompt je uložený
    v `data/ui-irony-prompts.json` pod `ico-star` (jako jediný má i pokyn k pozadí,
    protože ikona potřebuje průhlednost, ne papír).
  - **Past: cesty SVG nejde parsovat naivně.** Můj rozklad `d` atributu hlásil u obou
    hvězd nesmyslné počty bodů, protože neuměl zkrácený zápis (`l2.9 5.9 6.5.9` jsou
    DVA příkazy, ne jeden se čtyřmi čísly) — u `ICO_STAR_DIFF` mě to málem svedlo
    „opravovat" ikonu, která byla celou dobu správně. **Vykresli a podívej se**, nebo
    použij `getBBox()`/`getTotalLength()` v prohlížeči.
  - Ověřeno: `test:offline` 679, `test:api` 138.

- **2026-09-03 — Režim „Online" se jmenuje „Světová liga". Vtip je v tom, že je česká.**
  Hráčova věta: *„název online je hrozná nuda."* Měl pravdu a bylo to horší, než se zdálo:
  ostatní režimy se jmenují **Sólo jízda / Párty souboj / Škola hrou**, takže „Online"
  byla jediná technická nálepka mezi hravými jmény.
  - **Vtip zadal hráč sám:** *„je to české, tak nějak vtipně říct, že je to česká, čili
    světová liga."* Klasická česká sebeironie — malá domácí věc, co si hrdě říká světová.
    Nese ho popisek dlaždice: **„Proti živým soupeřům. Zatím převážně z Česka."** Bez něj
    by „Světová liga" byla jen nabubřelá, s ním je to pointa.
  - **Nahrazuje „Rating nelže."** O ratingu se hráč dozví hned v uvítání lobby (viz zápis
    z 2026-09-02), takže ho popisek na rozcestníku už nemusí nést podruhé.
  - Přejmenováno na **třech** místech: dlaždice rozcestníku ([quiz.js](quiz.js)), nadpis
    lobby a štítek na přihlašovací obrazovce (`zk-authtag`, [online.js](online.js)).
    Interní názvy (`ZKOnline`, id `qz-mode-online`, `assets/mode-online.jpg`) zůstávají —
    je to jméno v UI, ne přejmenování modulu.
  - **Ověřeno v prohlížeči, že ilustrace dlaždic nezmizely** — screenshot hned po reloadu
    je ukázal prázdné a vypadalo to jako regrese, ale `img.complete && naturalWidth > 0`
    hlásilo načteno u všech čtyř a v síti byly samé 200. **Screenshot umí zachytit stav
    před dokreslením obrázků; než z něj usoudíš na chybu, ověř si to v DOM.**

- **2026-09-03 — Online lobby a výsledky schovávaly „Zpět" pod hostitelovu hlavu. Stará vada, kterou už appka jinde vyřešila.**
  Na telefonu se tlačítko „Zpět do hry" překrývalo s avatarem hostitele o **40×18 px**.
  `.qz-host` je absolutně ukotvená k shellu a **sahá do 62 px**, jenže lobby dědí
  `padding-top: 44px` z `.qz-modepick` a výsledkové obrazovky **46 px** z `.qz-end`.
  - **Řešení už v repu bylo, jen se nepoužilo všude:** `.zk-auth` má od 2026-08-25
    `padding-top: 76px` s komentářem, který přesně tuhle kolizi popisuje, a `.zk-acc`
    taky. Zapomnělo se na lobby a na výsledky. Nastaveno na stejných 76 px.
  - **Scoped SCHVÁLNĚ na `.zk-lobby` a `.qz-end.zk-wrap:has(> .qz-back)`, ne obecně na
    `.zk-wrap:has(> .qz-back)`.** Obecný selektor má vyšší specificitu než `.qz-setup`
    a srazil by mu 112 px na 76 u obrazovek, kterých se problém netýká; `.qz-pick`
    dokonce potřebuje 124 px kvůli liště `.qz-pickhead`.
  - **`:has()` u výsledků je nutné** — jedna ze čtyř výsledkových obrazovek „Zpět" nemá
    (sólo výsledek má akce dole), takže by se odsazovala zbytečně.
  - **Ověřeno měřením průniku obdélníků na VŠECH online obrazovkách** (lobby, žebříček,
    přátelé, profil, turnaje, souboj na odkaz), ne jen na té nahlášené: překryv nikde.
  - **Past při ověřování:** žebříček hlásil „Zpět" na 311 px, což vypadalo, že tam
    tlačítko nahoře není a odsazení je zbytečné. Ve skutečnosti je to první prvek —
    `.qz-end` má `justify-content: center`, takže při krátkém obsahu obsah plave
    uprostřed. Změřeno v půlce načítání by to svádělo ke špatnému závěru; ověřuj
    `firstElementChild`, ne polohu.

- **2026-09-03 — Dlaždice „Hrát teď" je glóbus s boxerskou rukavicí. Čtyři pokusy, a poučení je v tom, PROČ ty tři předchozí spadly.**
  Náhrada za robota (viz zápis o botovi níž). Hráč zamítl tři návrhy po sobě a každý
  z jiného důvodu — všechny tři důvody stojí za zapamatování, protože recept v sekci
  „Ilustrace" je popisuje jen obecně.
  1. **Zvonek „fills the entire frame in close-up" → useknutá kopule, béžová elipsa bez
     identity.** Ta formulace funguje u karet, láhve a poháru, protože mají výrazný obrys
     i po oříznutí. **U nízkého širokého předmětu ne** — po přiblížení z něj zbyde tvar,
     který nejde poznat. Do promptu pak musí přijít výslovný zákaz oříznutí, protože
     „velký a dominantní" a „celý vidět" se perou a model si vybere to první.
  2. **Dva zvonce sražené k sobě → chumel.** „Dva kusy něčeho" je vzor, který projekt
     zamítl už 2026-08-31 (dva pokoje, dvě polokoule). Doufal jsem, že sražené do jednoho
     tvaru projdou; neprošly. **Nezkoušej to potřetí.**
  3. **Čertík v krabičce s rukavicí → technicky dobrý, ale „je to nuda, neevokuje to online
     ani zeměpis".** Tohle je ten nejdůležitější bod: obrázek byl čistý, vtipný a čitelný,
     a stejně k ničemu, protože **mohl být na jakékoli appce**. Dlaždice musí říct, čí
     appka to je. Jakmile se stejný gag posadil na GLÓBUS, bylo hotovo.
  - **Co zabralo:** glóbus na stojánku, z Pacifiku vyletuje na pružině boxerská rukavice.
    Zeměpis je vidět hned (glóbus), soupeř taky (rukavice), „teď hned" nese pružina.
  - **Prompt musí být KRÁTKÝ.** Sousední dlaždice, které vyšly napoprvé, mají ~40 slov;
    moje zamítnuté měly 80+. Čím víc pokynů, tím víc si jich model přebere po svém —
    dvě z těch tří selhání byla u nejdelších promptů.
  - **Ověřeno ve SKUTEČNÉ velikosti, ne v plné.** Dlaždice se kreslí na 56–72 px
    (komentář u `dlazdice()` v gen-irony-images.js). Nový kus vyrenderován na 72 px vedle
    tří sousedů — glóbus se pozná okamžitě. Tenhle test v projektu už dvakrát shodil
    návrh, co ve velkém vypadal dobře.
  - **Ořez: obsah musí vyplnit ~85 % rámu jako sousedi.** Gemini vrátilo glóbus na 63 %
    (kolem spousta papíru). Změřeno detektorem kresby (teal `b > r` nebo tmavé pixely —
    NE podle jasu, papír má vlastní skvrny a lhalo by to, stejná past jako u masky souše
    u textury glóbu 2026-09-01) a oříznuto na střed obsahu. `crop-gemini-frame.ps1`
    se nehodil, ten ořezává rovnoměrně od kraje a obsah tu nebyl uprostřed.
  - **Past cestou: `data/ui-irony-prompts.json` má odsazení 2 MEZERAMI, ne 1.** Pravidlo
    o jedné mezeře platí pro `data/questions/*.json`, ne tady. Zápis přes
    `JSON.stringify(j,null,1)` přeformátoval celý soubor (7 řádků diffu místo 1); vráceno
    na `,2`. Obsah se neztratil (parse/stringify klíče zachová), ale diff to zbytečně
    rozmázlo. **Před zápisem do cizího JSONu si ověř jeho skutečný formát**, nespoléhej
    na to, co platí jinde v repu.
  - **Známá vada, kterou vědomě NEŘEŠÍM: glóbus má na sobě drobné popisky zemí**
    („Canada", „Japan", „Australia", pár zkomolených), ačkoli styl text zakazuje. Ve
    zobrazované velikosti 56–72 px nejsou vidět vůbec, takže přegenerovat kvůli tomu
    další dávku by byla ztráta času i kreditu.

- **2026-09-02 — Online lobby má uvítání místo proužku „Kuba · PUBERŤÁCI · Rating 1500 · Zatím nezahráno". A bot se v něm NESLIBUJE.**
  Hráčova věta: *„Rating 1500 · Zatím nezahráno… z toho uživatel nic nechápe."* Proužek
  byl úsporný, ale nikde neříkal, co pásmo znamená, proti komu se hraje ani co je rating.
  Nově čtyři věty: pozdrav jménem, co je tvoje pásmo, proti komu nastupuješ, co je rating.
  Tón se drží pásma stejně jako hlášky u otázek (standard 2026-08-15).
  - **BOT SE V UVÍTÁNÍ ANI NA DLAŽDICI „Hrát teď" NEZMIŇUJE.** Napsal jsem tam nejdřív
    „když nikdo není online, nastoupí bot" a hráč to zamítl: *„to se pak nebude chtít
    nikomu hrát."* Je to **totéž rozhodnutí jako 2026-08-31** u dlaždice Online („bot je
    náhradní řešení pro prázdnou frontu, ne důvod, proč sem jít") — jen se tehdy uplatnilo
    na rozcestníku a lobby zůstalo. Při té příležitosti smazáno i z popisku „Hrát teď",
    kde to bylo od začátku.
    **Kde bot naopak ZŮSTÁVÁ, a je to správně:** v čekárně (`zk-bot`, po 15 s se povýší
    na hlavní akci) a ve výsledku u jména soupeře. Tam už hráč čeká nebo dohrál — je to
    služba a poctivé přiznání, ne lákadlo. Hlídá to `test:offline`.
    **Ilustrace `assets/zk-live.jpg` byla taky robot** (obrázek sliboval to, co text už ne)
    — přemalována na **glóbus s boxerskou rukavicí vyletující z Pacifiku**. Viz zápis níž.
  - **Oslovení v 5. pádu (`vokativ()`) je ÚMYSLNĚ NEÚPLNÉ.** CLAUDE.md má tvrdou lekci,
    že český pád se v kódu odvodit nedá — proto je 6. pád u otázek v datech (`about`).
    Přezdívku ale uložit nejde, píše si ji hráč. Řešení: použijí se jen pravidla bez
    výjimek (-a→-o, -ek→-ku, měkké souhlásky→-i, -k/-g/-h/-ch→-u, samohláska beze změny,
    ostatní souhlásky→-e) a **u všeho ostatního se jméno z pozdravu VYNECHÁ** („Ahoj!").
    **Schválně neošetřené: -r a -el** — obojí má dvě různá pravidla podle toho, co je
    před koncovkou (Petr→Petře, ale Viktor→Viktore; Pavel→Pavle, ale Daniel→Danieli),
    a splést se dá u velmi běžných jmen. Vynechává se i všechno, co není jedno slovo
    z písmen, ať se generovaná dětská přezdívka („Veselý krtek 20") neskloňuje.
    **Chyba ve jméně je vidět, chybějící jméno ne** — proto je fallback tichý.
  - **`test:offline` nově čte i `online.js`** (do teď ho nekontroloval nikdo — `sim-online`
    testuje model ratingu a `test:api` server). **679 kontrol** (bylo 568 před dneškem).
    Ověřeno mutací: zobecnění -r na „Petre", zobecnění -el, skloňování víceslovných
    přezdívek, špatná koncovka u měkkých souhlásek, vrácení bota do uvítání i na dlaždici,
    minulý čas s rodem, malé písmeno na začátku.
    **Poučení z průběhu: `Petr` je chráněný DVAKRÁT** (výslovný guard na -r + to, že „r"
    není v seznamu koncových souhlásek), takže mutace jedné pojistky projde nepovšimnuta.
    Mutace musí sundat obě, jinak se testuje vlastní redundance, ne kontrola.
    **A druhé poučení: kontrolní soubor sám měl syntaktickou chybu** (uvozovka uvnitř
    řetězce), takže padal pořád a první běh mutací hlásil samé „chyceno" falešně.
    **Před mutacemi vždy ověř, že základ PROCHÁZÍ.**
  - **V textech NESMÍ být minulý čas s rodem** („zapsal ses", „věděl jsi") — appka pohlaví
    hráče nezná. Stejné pravidlo jako u `_verdikt` v `fondy.json`; nově ho hlídá test.

- **2026-09-02 — Rozehrané hry: tři POPSANÉ řádky („Co jsi hrál: …"), ne úsporné zkratky. Deset her vypadalo jako desetkrát totéž.**
  Hráč nahlásil, že v seznamu „nevidí datum, témata, obtížnost" a že to graficky není ono.
  Měl pravdu a příčina byla jedna: položka byla **jeden řádek** (`avatary · vlajka · režim
  · postup`), do kterého se nic dalšího nevešlo. Deset uložených her tak vypadalo stejně
  a lišilo se jen zlomkem „8/10".
  - **NEJDŘÍV JSEM TO UDĚLAL ÚSPORNĚ A BYLO TO MÁLO.** První verze měla tučný titulek
    „Česko · Sólo" a pod ním šedou řádku „Všechna témata · dospělí · před 20 minutami".
    Vypadalo to líp, ale hráč to vrátil s tím, že to musí být **naprosto srozumitelné** —
    a měl pravdu: co znamená který údaj, se dalo jen hádat. Teď má **každý řádek popisek
    s dvojtečkou**: `Co jsi hrál:` / `Úroveň obtížnosti:` / `Kdy:`. **Nevracej to na
    zkratky** — čitelnost tu vyhrála nad úsporností vědomě.
  - **Data k tomu z velké části UŽ BYLA uložená, jen se nezobrazovala** — `ts` se ukládá
    odjakživa (řadí se podle něj seznam) a `section` taky. Doplnit se musely jen `band`,
    `level` (`schoolLevel`) a `band` u hráčů do `meta`; všechno ve `state` bylo. `meta` je
    zobrazovací projekce, aby se při kreslení seznamu netahalo celé pole otázek.
  - **„Úroveň obtížnosti" se u KAŽDÉHO REŽIMU bere odjinud, a je to nutné, ne kosmetika:**
    sólo → pásmo; **párty → pásma VŠECH hráčů** („děti, puberťáci a dospělí"), protože
    `S.band` je jen sólová volba a jedno jméno by lhalo; **škola → ★–★★★**, protože škola
    pásmo nepoužívá vůbec (`startSchool` filtruje podle `schoolLevel`), takže zděděná
    hodnota z posledního sóla by tam přímo lhala. Slovo u školy je schválně TOTOŽNÉ
    s tlačítky v `renderSchoolStart` — učitel má najít přesně to, co klikl.
  - **Pásma v párty se řadí podle VĚKU, ne podle pořadí u stolu** — jinak by tentýž stůl
    vypsal pásma pokaždé jinak podle toho, kdo se zapsal první.
  - **Relativní čas místo data** (`relCas`): u hry z dnešního odpoledne nikoho nezajímá,
    kolikátého bylo. Nad týden se přepne na datum, protože „před 23 dny" si nikdo nepřevede.
  - **`selSectionLabel()` rozdělena na `sectionLabel(s, vse)` + tenký obal**, protože
    `section` má **tři podoby** (`null`/`"__all__"`, pole, jeden název) a naivní výpis by
    hráči ukázal doslova „__all__". Cestou opraveno skloňování: „5 témata" → „5 témat".
  - **Seznam už neřeže na první čtyři.** `writeSaves()` drží 10 her a pop-up má vlastní
    scroll, takže šest z nich se ukládalo, ale hráč se k nim nedostal a vypadalo to, že
    se hra ztratila.
  - **Řádky se ZALAMUJÍ, neořezávají** — u popsaného údaje je useknutý konec horší než
    o řádek vyšší karta („Úroveň obtížnosti: pu…" nikomu nepomůže). Na telefonu je položka
    pod 520 px **mřížka**, kde odznak s postupem sleze pod text a obrázek drží přes oba
    řádky se `align-items: start` (vycentrovaný by u pěti řádků plaval bez vztahu k textu).
    Naměřeno na 375 px: 0 ořezaných řádků, karta 122 px (před sevřením ~250).
  - **Hodnoty za dvojtečkou začínají VELKÝM písmenem** („Úroveň obtížnosti: Děti", ne
    „…: děti"). Napsal jsem to nejdřív malými a hráč to vrátil — je to porušení pravidla,
    které v projektu platí od 2026-09-01, jen jeho zápis nemyslel na případ „popisek:
    hodnota". Pravidlo je proto **nově nahoře mezi konvencemi**, ne jen v datovaném logu.
    Řeší to `velke()` při zobrazení; `BAND_NAMES` zůstává malé, protože uvnitř věty se
    tak hodí. Ověřeno skenem textových uzlů v prohlížeči přes rozcestník, výběr kontinentu,
    zemí i témat: **0 textů začínajících malým písmenem**.
  - **Ověřeno MUTACÍ, ne tím, že svítí zeleně** (`test:offline` **589** kontrol, bylo 568).
    Deset mutací, všechny odhaleny — a **jedna z nich našla skutečnou chybu v mém kódu**:
    fallback hráčů se ptal na POČET (`m.players.length`) místo na to, jestli nesou pásmo,
    takže párty uložená před touhle změnou (kde `meta.players` mají jméno a barvu, ale ne
    `band`) by hlásila „různá podle hráče", i když se pásma dají zjistit ze `state`.
    Ostatní mutace: sestavení cesty z pole (`assets/country-at,cz,sk.jpg` — **přesně ta
    chyba, co se 2026-09-01 opravovala na výběru témat**), vypsání `__all__`, jedno pásmo
    místo všech, neseřazená pásma, opakující se pásma, pásmo místo školní úrovně, chybějící
    fallback `band`, neskloňovaná témata, výčet bez spojky „a". Po mutacích `diff` proti
    záloze čistý a `quiz.js` má dál CRLF.

- **2026-09-02 — Rate limit na registraci, zakládání her a turnajů (poslední tři body z auditu 2026-09-01 bez limitu).**
  Registrace, hry a turnaje neměly žádné omezení počtu volání — šlo skriptem navyrábět
  libovolný počet účtů (sybil farming ratingu i denního žebříčku) nebo zaplavit tabulky
  `games`/`tournaments`.
  - **Registrace: klíčováno IP, ne účtem** — v okamžiku volání účet ještě neexistuje,
    takže na něj nejde pověsit sloupec jako u `friend_tries`. Nová tabulka `reg_attempts`
    (migrace [2026-09-02-rate-limits.sql](migrations/2026-09-02-rate-limits.sql)).
    **8 za hodinu** — nad tím, co reálně udělá rodina zakládající účty víc dětem
    (typicky 2–4), ale sybil farmění zpomalí o dva řády.
  - **Hry a turnaje: klíčováno účtem**, stejný vzor jako `friend_tries` z 2026-09-01
    (nové sloupce `game_tries`/`tourney_tries` + `_at`). **30 her / 5 turnajů za hodinu**
    — `test:api` má nejnáročnější scénář 14 her z jednoho účtu v kalibrační smyčce,
    tohle mu zůstává hodně nad hlavou; turnaj je vzácnější akce, proto přísnější strop.
  - **Sdílená logika v `checkRateLimit()`** ([functions/_lib/game.js](functions/_lib/game.js))
    — na rozdíl od `friends.js`, kde se počítají jen NEÚSPĚŠNÉ pokusy (kdo kód dostal,
    nikdy nenarazí), se tady počítá KAŽDÉ volání, protože pokus sám o sobě je to, co
    se omezuje. Bere callbacky na čtení/zápis, ne přímo SQL, protože per-účet (UPDATE
    existujícího řádku) a per-IP (UPSERT, řádek nemusí existovat) potřebují jiné dotazy.
  - **`ALLOW_DEV_SECRET` (stejná proměnná jako u `sessionSecret()`) vypíná limit
    registrace v lokálním vývoji** — `test:api` samo zakládá přes 20 účtů v jednom
    běhu ze stejné IP, což by o produkčním stropu 8/hod nešlo spustit. Produkce tuhle
    proměnnou nikdy nemá nastavenou, takže limit tam platí bez výjimky. Hry a turnaje
    bypass NEPOTŘEBUJÍ — jsou klíčované účtem a `test:api` nikdy nepřekročí 14/účet.
  - **Ověřeno TROJÍM způsobem, ne jen tím, že svítí zeleně:**
    1. Čistý unit test `checkRateLimit()` s falešným úložištěm — 8 povoleno, 4 zamítnuto,
       počítadlo po zamítnutí neroste, po vypršení okna se obnoví. Mutací (`>` místo `>=`)
       ověřeno, že by špatná hranice prošla nepovšimnuta (pustila by 9 misto 8).
    2. Živě proti skutečné D1: turnaj limit 5 živě otestován beze změny kódu (5 projde,
       6.+ dostane 429). Hry a registrace ověřeny DOČASNÝM snížením stropu (3 místo
       30/8) a živým voláním — po ověření vráceno na produkční hodnoty, `diff` proti
       verzi před mutací čistý.
    3. `test:api` 138 kontrol po celé úpravě beze změny (dev-bypass funguje).
  - **Past cestou:** `sed -i` na Windows/Git Bash převedlo CRLF na LF u jednoho ze
    tří upravovaných souborů (`register.js`) — soubory `functions/**/*.js` v tomhle
    repu CRLF mají (na rozdíl od `data/questions/*.json`, kde je to vynucené schválně,
    zde je to jen dědictví editoru). Opraveno zpátky, `diff` teď čistý bajt po bajtu.

- **2026-09-02 — Dětská hláška „Tys to věděl!" se opakovala u 62 % otázek; rozbito na 8 rotujících variant.**
  Hráč si všiml, že hláška po správné odpovědi v dětském pásmu zní pořád stejně, a zeptal
  se „jak často?". Změřeno přesně: **494 z 990** dětských otázek (50 %) mělo `quip_correct`
  začínající doslova „Tys to věděl!", plus dalších **123** (12 %) variantou „Jé, tys to
  věděl!" — dohromady **617/990 = 62,3 %**. Pro srovnání nejčastější opener u puberťáků
  i dospělých sedí na 4–5 % (`Bod pro tebe,…`), takže je to specifické jen pro dětské pásmo.
  - **Příčina je zdokumentované rozhodnutí, ne bug:** zápis z 2026-08-15 zavedl pro dětské
    hlášky pevnou šablonu „opener „Tys to věděl!" + mírná ironie" — na rozdíl od ostatních
    pásem, kde se hlášky psaly volně. Rozhodnutí samo bylo v pořádku (řešilo tehdejší
    „Přesně!" u 80 % otázek), jen nikdy nedostalo víc než jeden opener.
  - **[scripts/diversify-kids-openers.js](scripts/diversify-kids-openers.js)** (nový,
    spustitelný znovu) nahrazuje jen úvodní frázi — zbytek věty (konkrétní vtipný fakt)
    zůstává beze změny. Rotace je **deterministická** (`index % 8`, ne náhoda), ať je běh
    opakovatelný. Sada 8 variant drží obě původní fráze (frekvence se sníží, nemizí úplně)
    + 6 nových stejného tónu: „Bod pro tebe!", „Trefa do černého!", „Bystrá hlava!",
    „Paráda, sedí to!", „To bylo hned vidět!", „Hop, a je to!" — nadšené, ne sarkastické,
    bez rodu v minulém čase (stejné pravidlo jako u `_verdikt` v `fondy.json`).
  - **Výsledek: 617 → 78+77 = 155/990 (15,7 %)**, obě frekvence teď ~7,8 % každá — blíž
    zdravému základu (4–5 %) než dřív, ale schválně ne níž, protože „Tys to věděl!" je
    fráze, kterou appka nechce úplně ztratit, jen aby nedominovala.
  - **Zápis do JSON drží formát 1 mezera + CRLF** (`JSON.stringify(qs,null,1).replace(/\n/g,"\r\n")`),
    ověřeno round-tripem na netknutém souboru, že je bajt po bajtu shodné s originálem.
  - Ověřeno v prohlížeči na deseti odpovězených otázkách za sebou (`fetch` dotáhl správnou
    odpověď z dat, aby šlo klikat schválně správně): žádná hláška se neopakovala víc než
    dvakrát. `test:api` 138, `test:offline` 568, `lint-facts` 9 upozornění (beze změny),
    `validate` 0 chyb.

- **2026-09-01 — Poměr sloupců na desktopu 3:2 → 5:4 (karta užší a vyšší, rám širší).**
  Přání „zvýšit na výšku, snížit na délku" u první (textové) karty. Řešeno jen posunem
  poměru mřížky — protože rám drží `align-self: stretch` (viz zápis o líčování výš),
  zúžení karty ji automaticky prodlouží (víc zalomených řádků) a rám vyroste s ní, aniž
  by bylo nutné sahat na cokoli jiného.
  - Naměřeno na sedmi otázkách za sebou (1920 px): karta 556 → **514 px**, rám 376 →
    **418 px**, výšky se dál drží shodné páry (311/311, 294/294, 349/349…).
  - Ověřeno na dolní hranici pásma (900 px), kde je karta nejužší — text i odpovědi
    zůstávají čitelné, žádné nepříjemné zalomení na dvě slova na řádek.
  - `test:offline` 568 kontrol beze změny.

- **2026-09-01 — Online souboj od 900 px plýtval třetinou šířky — nemá ilustraci a mřížka pro ni pořád rezervovala sloupec.**
  Objeveno na žádost „zkontroluj to i online obrazovky". `online.js` si otázku kreslí
  **vlastní** funkcí (`nextQuestion()`, ne `renderQuestion()` z `quiz.js`) a jen recykluje
  CSS třídy `.qz-play`/`.qz-box` — nikdy nevolá `picframeHtml()`, takže `.qz-picframe`
  v online souboji neexistuje vůbec. Dvousloupcová mřížka z `.qz-play` (od 2026-07-31)
  ale pravý sloupec (2fr, pro rám) rezervuje bez ohledu na to, jestli tam něco je —
  na 1024 px tak karta měla jen 556 px a skoro 300 px vedle zůstávalo prázdných.
  **Stará vada, ne dnešní regrese** — mřížka existuje přes měsíc, jen jsem na ni narazil
  až při dnešním systematickém průchodu šířek.
  - **Oprava jedním pravidlem, bez zásahu do `online.js`:** `.qz-play:not(:has(.qz-picframe))
    > .qz-box { grid-column: 1 / -1 }`. Když karta nemá souseda s ilustrací, dostane obě
    sloupce mřížky. `:has()` je stejný vzorec jako jinde v souboru (`#qz-body:has(.qz-play)`
    dřív) — v nepodporujícím prohlížeči se jen neuplatní, nic se nerozbije.
  - Ověřeno na 1024 px: karta 556→**944 px** (neodhalený i odhalený stav), offline sólo
    hra (rám existuje) beze změny — 556/376, lícuje jako předtím. `test:offline` 568.

- **2026-09-01 — Telefon: obrázek nahoře, tlačítka „Více o…"/"Další otázka" pod sebe.
  Cestou i objevena a opravená mezera 768–899 px, kde appka měla pruh horší než tablet.**
  Hráč požádal o dvě věci na mobilu: obrázek (nebo glóbus) nahoře nad kartou, a stažení
  dvou tlačítek v patičce z vedle sebe pod sebe.
  - **Pořadí se řeší `order` na flex položkách, ne přehozením HTML.** Desktop řadí podle
    `grid-area` (jméno oblasti, ne pořadí v DOM), takže přehození pořadí v šabloně by
    desktop nezajímalo, ale bylo by to riziko bez důvodu — zdroj pravdy zůstává jeden.
    `.qz-play` na mobilu (`max-width:767px`) dostal `display:flex; flex-direction:column`
    + `order: 1/2/3` na `.qz-top`/`.qz-picframe`/`.qz-box`. Ověřeno v obou stavech
    (otázka s glóbem i odhalená fotka) — obrázek je nahoře v obou, žádný jump mezi nimi.
  - **Tlačítka: `.qz-fbtns { flex-direction: column }` + `.qz-fbtns > button { flex: 0 1
    auto; width: 100% }`.** Základní pravidlo dává tlačítkům `flex: 1 1 0` (stejná ŠÍŘKA
    vedle sebe); ve sloupci by to dalo stejnou VÝŠKU, ne to, co chceme — proto se to musí
    přebít, ne jen otočit `flex-direction`.
  - **VEDLEJŠÍ NÁLEZ cestou: `.qz-picframe` na mobilu měla pevnou výšku (210/190 px),
    která byla vyladěná jen pro ÚZKÝ telefon (~375 px).** Appka ale „mobil" počítá až
    do 767 px (phablety, telefon naležato) — tam rám rostl do šířky, ale výška zůstala
    stejná. Naměřeno při 700 px: rám 668×196, fotka uvnitř 332×190 → **pruh 168 px na
    stranu**, horší než na tabletu těsně nad touhle hranicí (viz zápis níž). Nahrazeno
    poměrem `aspect-ratio: 16/9` (dnešní fond je 100% na šířku) — stejná hodnota pro
    otázku i odpověď, takže rám navíc mezi stavy neposkočí. Na úzkém telefonu (375 px)
    je výsledek prakticky identický s předchozím (193 px místo 190) — nic se nezhoršilo.
  - Ověřeno na 375 a 768 px (druhá beze změny, patří jinému pravidlu) a na 1400 px
    (desktop beze změny — vedle sebe, tlačítka vedle sebe). `test:offline` 568 kontrol.

- **2026-09-01 — Mezera 768–899 px (tablet na výšku) měla pruh HORŠÍ než mobil i desktop — stará od založení appky, ne z dneška.**
  Objeveno na žádost „zkontroluj to i na mobilu a tabletu". Appka má dva ladicí body:
  `max-width:767px` (telefon) a `min-width:900px` (desktop, dvousloupcové). Pásmo mezi
  nimi — typicky tablet na výšku — spadalo na ZÁKLADNÍ pravidlo `.qz-picframe`
  (`height:320px` / `revealed: clamp(200px, 26vh, 280px)`), které počítá výšku z výšky
  OKNA, ne ze šířky karty. Karta v tomhle pásmu je přitom široká (700–870 px, jeden
  sloupec jako mobil), takže vznikl rám široký a nízký s obrovským bočním pruhem.
  Naměřeno na 768 px: rám 736×272, fotka uvnitř 466×266 → **pruh 135 px na stranu**,
  přes třetinu rámu — horší, než co se dnes opravovalo jinde.
  - **Řešení kopíruje poznatek ze zamítnutého stacked pokusu níž:** v jednosloupcovém
    rozložení (tohle pásmo jím je, stejně jako mobil) rám nemusí s ničím lícovat, takže
    může mít prostě poměr skutečné fotky. `aspect-ratio: 16/9`, scoped na
    `(min-width:768px) and (max-width:899px)`. Po opravě 768 px → rám 736×417, fotka
    718×411 — pruh **9 px** na stranu.
  - **Proč TADY neplatí důvod, kterým hráč zamítl stejný nápad na desktopu** („zbytečně
    velké"): tablety na výšku mají typicky ~1024 px výšky okna, takže rám 400–500 px
    vysoký nenutí ke scrollování tak jako na nízkém okně notebooku (1400×800), kde padl
    zamítavý verdikt. Ověřeno na krajích pásma (768 a 899 px) i na obou sousedních
    hranicích (767 px zůstává mobilní pravidlo, 900 px přebírá desktopový grid) —
    žádný skok, žádná regrese.
  - `test:offline` 568 kontrol beze změny.

- **2026-09-01 — VYZKOUŠENO A ZAMÍTNUTO: karta a rám POD SEBOU místo vedle sebe.**
  Nápad zněl dobře: když rám nemusí lícovat s ničím po straně, může mít prostě poměr
  skutečné fotky (16:9) a pruh zmizí úplně — beze zbytku, ne jen zmenšený. Vizuálně to
  fungovalo přesně takhle (rám 950×537, fotka 929×531 — pruh prakticky nulový).
  **Hráč to i tak zamítl: „to je zbytečně velké. nepůsobí to dobře."** Rám na celou
  šířku sloupce (~950 px) dělal z appky výrazně vyšší stránku — na notebooku s výškou
  okna ~800 px se karta s fotkou pod ní přestaly vejít na jeden pohled a bylo nutné
  scrollovat, což předtím (vedle sebe) nebyl problém.
  - **Druhý důvod, proč to nebyl jasný kompromis ani po vizuální stránce:** appka dnes
    (2026-09-01) **negenerovala žádnou skutečnou čtvercovou ilustraci k otázce** — jen
    se přepnul generátor v kódu (`gen-irony-images.js`, `1:1`), dávka se nikdy nespustila.
    Test na simulovaném čtverci (ořez existující fotky) ukázal, že by čtvercové obrázky
    dostaly stejně velký pruh, jen PO STRANÁCH (~210 px na stranu) — takže i kdyby
    hráč velikost přijal, řešení by za pár týdnů, jak poroste čtvercový fond, přestalo
    fungovat pro rostoucí část otázek.
  - **NEZKOUŠEJ TO ZNOVU jen kvůli pruhům** — důvod zamítnutí byl vizuální dojem
    (`velikost`), ne technický. Vrátit se k tomu má smysl jen jako SAMOSTATNÉ rozhodnutí
    o layoutu (např. při redesignu), ne jako vedlejší efekt honby za pruhy.
  - Vráceno beze zbytku na stav z předchozího zápisu (karta vedle rámu, `align-self: stretch`,
    žádný pevný poměr). `git diff` proti commitu `182eeed` po vrácení prázdný.

- **2026-09-01 — Pruh kolem starých 16:9 fotek zmenšen sevřením TEXTOVÉ KARTY, ne honěním rámu.**
  Hráč se ptal na pruhy u fotky (viz zápis „Rám se tahne podle karty" výš) — rám je od
  dnešního odpoledne `align-self: stretch`, takže se drží výšky karty, a čím vyšší karta,
  tím širší rozmazaný pruh kolem malé fotky. Nabídl jsem tři varianty (rám podle fotky /
  strop výšky rámu / počkat na čtvercový fond) — hráč místo toho navrhl jinou osu: **zmenšit
  kartu**. Je to chytřejší řešení, protože se rám drží karty automaticky — zmenšit kartu
  zmenší rám se sebou, aniž by se muselo cokoli dolaďovat na rámu samotném.
  - **Ověřeno na PŘESNÉ otázce z hráčova screenshotu** (`cz-k-punkevni-jeskyne`, špatná
    odpověď „Koněpruské jeskyně"): karta **494 → 319 px**, pruh kolem 227px vysoké fotky
    **133 → 46 px na stranu** (z 54 % rámu na 29 %). Napříč 10 dalšími otázkami medián
    klesl z dřívějších ~330–374 px na **~280 px**.
  - **Kam se ušetřilo:** `.qz-box` gap 12→8 px, `.qz-result .half` padding 12→8 px,
    `.qz-quipbox`/`.qz-expl` margin-top 10→6 px, `.qz-frow` gap 12→8 px, tlačítka
    (`.qz-more`/`.qz-next`) padding 11→8 px, hláška `.qz-ht` line-height 1.45→1.32.
    Všechno jsou to **prázdné mezery**, ne text ani font — obsah (hláška, vysvětlení,
    odpovědi) se nekrátil ani nezmenšil čitelnost.
  - **STROP TÉHLE CESTY: hláška a vysvětlení jsou JÁDRO appky** (roky práce na jejich
    kvalitě, viz standard z 2026-08-10 a přepisy 2026-08-15/08-30) a zkracovat JE by
    appku ochudilo o to, proč appka vlastně je vtipná. Sevření dokázalo ubrat prázdné
    místo kolem obsahu, ne obsah samotný — proto je zisk citelný (35 % na outlieru), ale
    ne dost na to, aby pruh zmizel úplně. Zbytek je pořád na dřívějších třech variantách,
    kdyby hráč chtěl jít dál.
  - **Scoped jen do `@media (min-width:900px)`** (blok `.qz-play`) — mobil má vlastní
    pevnou výšku rámu (210px) a s pruhem tenhle problém nemá, takže se nezměnil vůbec.
    Ověřeno na 375 px beze změny.
  - **Vedlejší úklid:** smazán zastaralý komentář u `.qz-picframe`, který ještě popisoval
    zrušený přístup s pevným poměrem 4:3 (nahrazený `align-self: stretch` od dřívějšího
    commitu dnes) — dvě protichůdná vysvětlení nad sebou by matla, ne pomáhala.
  - `test:offline` 568 kontrol beze změny.

- **2026-09-01 — Výběr 2+ konkrétních zemí (ne „Vše") tahal zbytečné 404 na `country-at,cz.jpg`.**
  Pokračování regresního testování. Objevilo se při ověřování dřívější opravy obnovy hry
  (2026-08-31, `ccs`/`selectCountries`) — obnovil jsem sólo hru uloženou přes dvě konkrétní
  země a v síti přistál request na `assets/country-at,cz.jpg`. `flagStamp()` skládá
  `assets/country-${cc}.jpg`; `renderSectionPick()` (obrazovka „Vyber témata") jí ale
  posílala `cc = S.sel.ccs || S.sel.cc`, což je u 2+ vybraných zemí **pole**, ne řetězec —
  šablonový literál ho vezme přes `.toString()`, tedy `"at,cz"`.
  - **Stejná třída chyby, jako appka už jednou řešila** (komentář o kousek níž v kódu):
    u „všech zemí" je `S.sel.cc` `null` a `flagStamp(null)` tahalo `country-null.jpg`.
    Ta oprava se ale netýkala případu konkrétního vícenásobného výběru — pole `S.sel.ccs`
    tenkrát ještě neexistovalo (přibylo až s opravou obnovy her 2026-08-31).
  - **Neprojevovalo se to viditelně** — `flagStamp()` má `onerror` schovávající obrázek,
    takže žádné rozbité UI, jen zbytečný request a záznam v konzoli. Přesně proto to
    validate/audit/test:offline nechytily; odhalilo to až sledování síťových požadavků
    při ručním průchodu.
  - **Oprava kopíruje existující vzor** (`(S.sel&&S.sel.cc) ? flagStamp(S.sel.cc)+" " : ""`,
    použitý už u sólo úvodní obrazovky) — razítko se ukáže jen u JEDNÉ vybrané země,
    jinak nic. Nadpis u dvou zemí teď zní „2 země | Vyber témata" bez ikony, stejně jako
    „Celý svět" dřív ukazoval bez ikony u „Vše".
  - Ověřeno: reprodukce (výběr Rakousko + Česko → 404 v síti) → oprava → stejný postup
    bez jediného requestu na `country-*,*.jpg`. `test:offline` 568 kontrol beze změny.

- **2026-09-01 — Regresní průchod: `.qz-setup` mělo špatné pořadí CSS pravidel, drobečková lišta přesahovala do nadpisu „Nová výprava".**
  Zadání znělo „proveď testy" (`test:api` 138, `test:offline` 568, `validate`, `audit`,
  `lint-irony`, `lint-facts`, `sim-online` — všechno bez regrese) + ruční průchod obrazovkami
  napříč šířkami. Ten odhalil jednu skutečnou vadu, starou přes měsíc, ne z dnešních úprav.
  - **Příčina: dvě pravidla `.qz-setup` v opačném pořadí, než mají.** `.qz-pick, .qz-start`
    mají vzor „nejdřív zkratka `padding: 70px…`, pak SAMOSTATNÉ `padding-top: 124px`
    PŘEBIJÍCÍ tu zkratku" — to je schválně, protože `.qz-pickhead` je `position: absolute`
    a potřebuje mít nahoře rezervované místo. `.qz-setup` mělo pořadí obrácené: zkratka
    `padding: 58px…` byla AŽ ZA `padding-top: 112px`, takže tu 112 přebila zpátky na 58.
    Lišta (`Zpět · PÁRTY · Evropa › Česko › Vše`) tak končila na 112 px a nadpis začínal
    na 78 px — **34 px překryvu**, viditelné na obrazovce „Nová výprava" v párty i sólo
    režimu, na všech šířkách (ověřeno 375, 768; na desktopu stejně, jen s jinou lištou).
    Nebyla to náhoda dneška — `git log -L` ukázal poslední dotčení řádku k 2026-07-31.
  - **Oprava: `.qz-setup` nově NEPOUŽÍVÁ zkratku `padding`, jen `padding-left/right/bottom`.**
    Bez zkratky nemá co přebít `padding-top` z dřívějšího pravidla, takže na pořadí souborů
    už nezáleží. Bezpečnější než přehazovat pořadí (to by za rok zase někdo omylem prohodil).
  - **Vedlejší nález: komentář u `.zk-auth` (přihlašovací obrazovka, sdílí třídu `.qz-setup`)
    popisoval neplatnou příčinu** („qz-setup dává 58 px") — `.zk-auth` má vlastní explicitní
    `padding-top: 76px`, který kaskáda nemění bez ohledu na základ, takže se touhle opravou
    chová beze změny. Přepsáno, ať příští session neluští odkaz na hodnotu, co už neplatí.
  - Ověřeno v prohlížeči na 375 a 768 px: párty i sólo „Nová výprava" bez překryvu,
    přihlašovací obrazovka online režimu beze změny. `test:offline` 568 kontrol po opravě.

- **2026-09-01 — Průřezový audit (4 oblasti). Opraveny první čtyři nálezy; zbytek je sepsaný níž a NENÍ hotový.**
  Čtyři paralelní audity (bezpečnost serveru, XSS/klient, offline logika, online férovost).
  Nálezy jsem ověřoval sám v kódu — auditní agenti hlásí i teoretická rizika, která neplatí.
  **Opraveno teď** (vše ověřeno MUTACÍ, `test:api` 126 kontrol místo 119):
  - **Dětský DENNÍ žebříček šel stáhnout BEZ PŘIHLÁŠENÍ.** `leaderboard.js` byl jediný
    endpoint mimo `/auth/*` bez `currentUser()`, a větev `daily` se vyhodnocovala **dřív**
    než ochrana dětského pásma. `?daily=1&band=deti` tedy vydal přezdívku, skóre a přesný
    čas dohrání — denní rytmus konkrétního dítěte. Rozhodnutí z 2026-08-31 tuhle druhou
    cestu přehlédlo; v jeho vlastním komentáři dokonce stálo „dětem zůstává denní pětka".
    **Poučení: když se něco zavírá, hledej VŠECHNY větve, které to vracejí** — tady stačilo,
    že `daily` měla vlastní `return` nad kontrolou. Klient `?daily=1` nikdy nevolal, takže
    to byla čistě nepoužívaná plocha, která jen vydávala data.
  - **Přítele nešlo odebrat.** `friends.js` měl jen GET a POST. Přidání je přitom oboustranné
    a bez souhlasu druhé strany, takže kdo se jednou dostal do seznamu, zůstal tam napořád —
    a to u appky, kde je friend_code podle vlastní dokumentace *jediná* ochrana dětí před
    oslovením cizím člověkem. Nově `DELETE` (maže oba směry) + tlačítko v UI s potvrzením.
  - **Hádání friend_code nemělo žádný limit.** Prostor 31⁶ chrání konkrétní účet, ne populaci:
    útočník nehledá konkrétní dítě, stačí mu **jakékoli**, takže očekávaný počet pokusů je
    31⁶/N. Nově klouzavé okno 10 neúspěchů za hodinu (`users.friend_tries*`, migrace
    [2026-09-01-friend-limit.sql](migrations/2026-09-01-friend-limit.sql)). **Schválně NE zámek
    jako u loginu** — ten se v `login.js` při zamčení resetuje na nulu, takže útočníka
    nezpomalí víc než prvních deset minut.
  - **Časomíra z párty prosakovala do sóla a do školy.** `S.timer` je globální stav, ale
    nabízí ho jen párty setup; `startGame`/`startSchool` ho neresetovaly. Kdo si zahrál párty
    se „svižný · 15 s", hrál pak pod limitem i v sólu a ve škole — a **neměl ho kde vypnout**,
    protože ani jedna obrazovka přepínač nemá. Ve škole navíc `timeoutReveal()` po 15 s sám
    odhalil odpověď promítané třídě.
  - **Rozehraná hra přes víc zemí se obnovila jako RUSKÁ.** `serializeState()` ukládalo
    `cc:(S.sel&&S.sel.cc)||"ru"`, jenže `selectCountries()` nastavuje `cc=null` pokaždé, když
    je zemí víc, a `ccs` se neukládalo vůbec. Fond se tedy postavil jen z Ruska, žádné z
    uložených id se nenašlo (jsou prefixovaná zemí) a hra spadla na `shuffle(data.questions)`
    — z desetiotázkové výpravy „Celý svět" byla 154otázková ruská. **Týkalo se to každé hry
    přes „Celý svět" nebo „Všechny země".** Nově se ukládá `ccs` a obnova volá `selectCountries()`
    místo ruční kopie té logiky; `S.idx` se navíc zařízne do nové délky, jinak po zmizení id
    ukáže na `undefined` a obrazovka spadne bez cesty ven.

- **2026-09-01 — Souběhy v online hře opraveny. A POUČENÍ: tyhle opravy se přes HTTP otestovat NEDAJÍ.**
  Tři místa, kde chyběl zámek. Všechna poškozovala skutečné hráče, ne hypotetické
  podvodníky — proto měla přednost před anti-cheatem.
  - **`answered` se zapisovalo absolutní hodnotou** přečtenou o pár řádků výš
    ([answer.js](functions/api/game/[id]/answer.js)). Dvě souběžné odpovědi (dvojklik,
    retry po výpadku sítě, dvě zařízení) spočítaly totéž číslo, čítač zůstal pozadu,
    `finished_at` se nenastavilo a **hra visela v `open` navždy** — `settleIfDone` se
    nespustil a soupeř nikdy nedostal výsledek. Nově `answered = answered + 1`
    (relativně), skóre i počet se čtou zpětně a `finished_at` se nastavuje zvlášť
    s `WHERE finished_at IS NULL`, ať je zápis idempotentní.
  - **`settleIfDone` neměl atomické přepnutí** ([settle.js](functions/_lib/settle.js)).
    Kontrola `status === 'done'` a `UPDATE ... SET status='done'` byly dva kroky, takže
    dva souběžné vstupy (poslední odpověď × `settleIfDone` z `/bot`) prošly oba → dvojí
    zápis do Glicka a dvojí připsání turnajových bodů. Nově `WHERE id = ? AND status =
    'open'` + kontrola `meta.changes`; UPDATE je zároveň zámek.
  - **`game_players` neměl unikátnost na slot.** PK je `(game_id, user_id)`, takže
    `SELECT počet → INSERT slot 1` v `join.js`/`bot.js` měl mezeru: dva lidé
    s přeposlaným odkazem se vložili oba jako slot 1 a `settle.js` pak hru na
    `players.length !== 2` tiše uzavřel BEZ ratingu. Nově `UNIQUE INDEX (game_id, slot)`
    (migrace [2026-09-01-slot-unique.sql](migrations/2026-09-01-slot-unique.sql)),
    handlery chytají výjimku a vrací 409.
  - **POUČENÍ, ať to nikdo nezkouší znovu: ani jednu z těchhle tří oprav nejde ověřit
    testem přes HTTP.** Napsal jsem test se dvěma odpověďmi přes `Promise.all` a ověřil
    ho mutací — po vrácení původního absolutního zápisu **třikrát po sobě PROŠEL**.
    Totéž u indexu: po `DROP INDEX` test dál procházel, protože v sekvenčním volání
    zabere dřív aplikační kontrola počtu hráčů. Requesty se proti lokálnímu wrangleru
    fakticky serializují a závod se vynutit nedá. **Testy proto v souboru zůstávají
    s poznámkou, co doopravdy měří** (kouřová zkouška invariantu, ne důkaz zámku) —
    jinak by příští session věřila, že souběh je pokrytý. Záruku dává tvar zápisu
    a databázový index, ne zelený test.

- **2026-09-01 — Expirace her, odveta neubírá otázky, a appka má konečně `_headers` s CSP.**
  Doběhnutí bodů 2–4 z auditu.
  - **Nedohraná hra se po 48 h uzavře sama** (`expireStaleGames` v [settle.js](functions/_lib/settle.js)).
    Kdo prohrával a zavřel prohlížeč, nechal hru v `open` NAVŽDY: soupeř nedostal
    výsledek, nemohl dát odvetu (`rematch.js` chce `status='done'`) a rating se nezapsal.
    **Cron tu nepomůže — Pages Functions `[triggers]` neumí**, takže se úklid veze na
    `/api/me`, kam klient chodí při každém vstupu do lobby. Dávka je omezená na 20 her
    za volání, ať jeden požadavek nezaplatí za celou historii; ověřeno na 200 hrách
    posunutých o tři dny zpět — 200 → 180 → … → 0.
    **Kontumace se ZÁMĚRNĚ nezavádí**: nedohraným se dopíše `finished_at` a hra se
    vyrovná normálně podle bodů. Kdo odešel po třetí otázce, prohraje kvůli skóre, ne
    kvůli trestu. Trestat odchod je herní rozhodnutí, ne oprava chyby, a u appky pro
    děti by to postihlo i spadlé připojení.
  - **Odveta přestala soupeři ubírat otázky.** `rematch.js` mu volal `markSeen` rovnou
    při založení — tedy dřív, než odvetu uviděl, a bez limitu na počet odvet. Šlo mu
    tak ve smyčce vyprázdnit fond, dokud mu každá další hra nespadla na 503. Nově se
    otázka započítá, až si ji hráč vyžádá ([q/[n].js](functions/api/game/[id]/q/[n].js));
    `markSeen` je `INSERT OR IGNORE`, takže opakované načtení nic nestojí.
    **Tohle mutací ověřit šlo** (na rozdíl od souběhů): po vrácení `markSeen` soupeři
    test spadl s „15 → 25".
  - **[_headers](_headers) s CSP, `X-Frame-Options: DENY`, `nosniff` a `Referrer-Policy`.**
    Appka překresluje přes `innerHTML` na desítkách míst a neměla žádnou druhou obrannou
    linii. **`_headers` MUSÍ být v kořeni NASAZENÉ složky**, takže ho `build-public.js`
    kopíruje do `dist/` — jinak se neuplatní vůbec. `'unsafe-inline'` u skriptů zatím
    zůstává (hra má inline `onerror` fallbacky na emoji), ale `connect-src 'self'`
    zastaví odeslání ukradeného tokenu jinam.
  - **Three.js z CDN má `integrity`.** Otisk je **spočítaný ze staženého souboru**
    (`sha384-WgG62q…`, three.js r137, MIT), ne opsaný odjinud. Když se hash nesejde,
    prohlížeč skript neprovede a glóbus se nevykreslí — `quiz.js` s tím počítá
    (`typeof THREE === "undefined"`), takže hra běží dál. **Pořád to odporuje konvenci
    „vše je součástí repa"** (kvůli ní se 2026-07-27 stahovala do `assets/` i textura
    glóbu); stažení knihovny do repa by závislost odstranilo úplně, zatím je aspoň
    ověřená. Ověřeno v prohlížeči: `THREE.REVISION === "137"`, žádné porušení CSP.

- **2026-09-01 — Textura glóbu je nově 1456×728. Na druhý pokus, a POSTUP OVĚŘENÍ JE TU DŮLEŽITĚJŠÍ NEŽ VÝSLEDEK.**
  Hráč texturu vygeneroval v Gemini podle promptu. **První pokus vypadal krásně a byl
  nepoužitelný** — a poznat to šlo jedině měřením, ne okem.
  - **Selhání č. 1: model svět PŘEKRESLIL ve vlastním měřítku, ne přemaloval na místě.**
    Naměřeno korelací masek souše proti staré (ověřené) textuře: pokrýval **299° délky
    a 161° šířky** místo 360/180. Afinní korekce (měřítko + posun) to nespravila —
    Evropa a Afrika po ní seděly, ale Austrálie zůstala mimo, takže zkreslení není
    rovnoměrné. Podezřelá byla formulace „at the highest resolution you can produce",
    která model svede ke kompozici odznova.
  - **Co zabralo ve druhém promptu:** výslovný zákaz „do not re-compose, re-frame, zoom,
    crop, re-center or rescale" + **kotevní body v procentech**, které si model může sám
    zkontrolovat (rovník na 50 % výšky, Dakar na 45,1 % šířky, Sydney na 92,0 % / 68,8 %,
    Antarktida jako pás dotýkající se spodní hrany po celé šířce…). Druhý pokus vyšel.
  - **JAK SE TO OVĚŘUJE — použij totéž, až se textura bude měnit znovu:**
    1. Položit na obrázek **skutečné obrysy zemí** z `data/country-shapes.json`
       (Natural Earth 110m) přes `x=(lon+180)/360·W`, `y=(90−lat)/180·H`. Na správné
       textuře obrysy padnou na malované pobřeží; na špatné jsou viditelně vedle.
       *(Právě proto ten soubor nemazat, i když ho appka nepoužívá.)*
    2. **Bloková korelace masek souše** proti staré textuře — dá číslo, ne dojem.
       Výsledek: medián odchylky **1,5° délky a 1° šířky**, tj. ~4 px na glóbu, kde
       má značka 13 px a Česko ~14 px. Obě textury proti témuž etalonu vyšly shodně
       (6,9 vs 7,1 — absolutní číslo je zkreslené tím, že etalon má jen 55 zemí, ale
       rozdíl mezi nimi je nula).
    3. **Maska souše se NESMÍ dělat podle jasu.** První verze brala „teplý odstín
       a jas < 235", jenže nová mapa má Saharu skoro bílou, takže půlka Afriky vypadla
       a měření lhalo. Správně je „ne-oceán" (`r > b`), což bere souš i led.
  - **Zisk: 1024 → 1456 px na 360°, tedy 2,84 → 4,04 pixelu na stupeň (+42 %).** Soubor
    113 → 212 kB. Poměr srovnán na přesně 2:1 (Gemini vrátilo 1456×720).
  - **Textura není mocnina dvojky a je to v pořádku** — ověřeno, že prohlížeč dává WebGL2,
    kde NPOT nevadí. Ve WebGL1 by three vypnulo mipmapy a vynutilo clamp.
  - **Zálohu staré textury do `assets/` NEDÁVEJ** — celá složka se kopíruje do nasazení,
    takže by se zbytečně nahrávala na web. Git ji drží stejně dobře.

- **2026-09-01 — Glóbus: kreslicí plocha se přizpůsobí displeji, ale STROP BYLA TEXTURA (1024×512).**
  Hráč hlásil, že glóbus je v malém rozlišení. Má pravdu a hlavní příčinu **nejde spravit
  kódem** — je potřeba přemalovat texturu.
  - **Kolik detailu textura vůbec má:** 1024 px na 360° = **2,84 pixelu na stupeň**.
    Evropa je široká ~35°, takže má v textuře **~100 pixelů** — a v medailonu se zobrazuje
    na ~110 CSS px. Je to tedy zhruba 1:1: obraz není roztažený, prostě **není co roztáhnout**.
    Jediná cesta k ostřejšímu glóbu je textura 2048×1024 (5,7 px/°, Evropa 200 px).
    **Upscale hotového JPEGu je k ničemu** (zamítnuto už 2026-08-30) — musí se přemalovat,
    tj. Gemini s dnešní texturou v příloze, aby zůstala geografie: `spinGlobeTo()` natáčí
    kouli na souřadnice a značka sedí napevno uprostřed rámu, takže posunutá pevnina =
    špatně ukázaná země. Podmínky: equirektangulární 2:1, full-bleed, šev v Pacifiku.
  - **Opraveno zadarmo, ale je to jen okrajové:** canvas měl natvrdo 460×460 se
    `setPixelRatio(1)`, takže na hustém displeji nebo při přiblížení prohlížeče (Chrome
    tím zvedá `devicePixelRatio`) plochu nafukoval prohlížeč. Nově `resizeGlobe()` počítá
    `css × dpr × 1,6` s podlahou 460 a stropem 1024. Přibylo anizotropní filtrování
    (maximum je 16), které pomáhá na okraji koule, kde je textura viděná šikmo.
  - **PAST, na kterou jsem naletěl a odhalilo ji až měření: `css × dpr` je MÁLO.** První
    verze počítala jen tohle a při dpr 1 vyšla 290 px — tedy **míň než dosavadních 460**,
    takže by ostrost zhoršila. Těch 460 nebylo omylem: canvas se kreslil ve větším
    rozlišení, než se zobrazoval, takže se okraje převzorkovaly. Odtud násobek 1,6
    a podlaha. Naměřeno po opravě: medailon 460 (beze změny při dpr 1), glóbus na
    rozcestníku **800** místo 460.

- **2026-09-01 — Pruh kolem ilustrace nese ROZMAZANÁ KOPIE téhož obrázku; oba obdélníky jsou stejně vysoké.**
  Dokončení předchozího bodu. Hráč hlásil, že „jemný pruh" u obrázku je pořád vidět a že
  levý obdélník je větší než pravý — chtěl to souměrné. Obojí opraveno, ale ani jedna cesta
  nevedla tam, kam se nabízela.
  - **Pruh NEJDE vyplnit pevnou barvou a je to změřené, ne odhad.** Nasamploval jsem rohy
    dvanácti namátkových ilustrací: většina má krém kolem `rgb(223,203,170)`, jenže
    `cz-a-trabant-ekologie` má `rgb(69,95,89)` a `cz-k-kromeriz-kvetna-zahrada`
    `rgb(146,142,107)` — scény, které jdou do krajů, nemají s papírem společného nic.
    Krémová pasparta by u nich byla vidět **víc** než dnešní pruh. Nově pruh nese
    **`.qz-picbg`, rozmazaná kopie téhož souboru** (blur 24 px, `inset: -8%` kvůli lemu
    z průhlednosti za hranou). Navazuje vždycky, u 16:9 i u budoucích 4:5.
    `.qz-picbg` **musí mizet a naskakovat s obrázkem** (`wirePic` v [quiz.js](quiz.js)),
    jinak by u chybějící ilustrace zůstal pod razítkem země barevný čtverec.
  - **RÁM NEMÁ PEVNÝ POMĚR. Táhne ho řádek mřížky, a proto oba obdélníky LÍCUJÍ VŽDYCKY.**
    Za jediný den se tu vystřídalo **pět pevných poměrů** (4:5 → 1:1 → 16:9 → 4:3 → 5:4)
    a každý skončil stejně: rám a karta se o pár desítek pixelů míjely. **Nemůže to vyjít
    a nezkoušej to znovu** — karta měří podle počtu řádků otázky jednou 381 px a jindy
    510, takže žádné jedno číslo nesedí na všechny otázky. Řešení je `align-self: stretch`
    místo `start`: rám si výšku bere z řádku, tedy z karty. Naměřeno na šesti otázkách
    v obou stavech: **horní i dolní hrana obou obdélníků sedí na pixel, pokaždé.**
  - **Podmínka, bez které to spadne: rám nesmí mít obsah V TOKU.** `.qz-pic` je proto
    `position: absolute; inset: 0; margin: auto`. Obrázek v toku by do řádku vnesl svou
    přirozenou výšku (686 px) a nafoukl ho — ověřeno, dělo se to.
  - **Pravidlo z 2026-07-31 tím NENÍ porušené.** Říká, že se nesmí hnout snímek. Rám sice
    mění výšku mezi otázkou a odpovědí, jenže u otázky v něm žije glóbus a snímek se
    objeví teprve po odpovědi — takže není co poskočit.
  - **Karta se ZMENŠILA** (výslovné přání „klidně udělej ten první obdélník menší"):
    odpovědi 64 → 52 px, mezera 20 → 12 px, vnitřní okraj karty 18 → 14 px.
    Blok platí až od 900 px, takže mobil se nemění; 52 px je nad 44px minimem pro dotyk.
  - **ŠEV ZMĚKČEN maskou; a `object-fit: contain` kvůli tomu muselo pryč.** Pruh barvou
    seděl, ale hrana mezi ostrým obrázkem a rozmazaným podkladem byla vidět jako linka.
    Maska na `.qz-pic` ale s `object-fit` NEFUNGUJE: element má pořád velikost celého
    rámu a obrázek je jen vykreslený dovnitř, takže by změkčovala okraje prázdna. Obrázek
    je proto absolutně pozicovaný s `max-width/max-height: 100%`, čímž se element
    velikostí kryje s obrázkem a maska (10 px) sedí na jeho hraně.
  - **GENERÁTOR JE NOVĚ ČTVERCOVÝ (1:1) a mění se s rámem — dnes už potřetí.** Za jediný
    den šel 16:9 → 4:5 → 5:4 → 1:1, pokaždé proto, že se pohnul rám, a dvakrát jsem na
    to zapomněl. **Když se hýbe s rámem, MUSÍ se hýbat i generátor**, jinak budou mít
    budoucí obrázky pruhy jen otočené o 90°. Čtverec je změřený, ne odhadnutý: rám je
    široký 376 px a ve stavu, kdy je obrázek vidět (po odpovědi), měl na šesti otázkách
    312–374 px, medián ~360. Ve stejném rámu vychází pruh u 1:1 na **8 px**, u 5:4 na
    42 px a u 16:9 na 84 px. Šířka souboru zůstává 1000 px → 1000×1000.
  - **Přemalovat okraje starých obrázků skriptem NEMÁ SMYSL — a je to spočítané.** Lokální
    dopočet (zrcadlení, roztažení kraje, rozmazání) nevymyslí obsah; dá přesně to, co dnes
    dělá `.qz-picbg`, jen natvrdo v souboru a nevratně. Generativní domalování přes Gemini
    stojí **stejně jako přegenerování celého obrázku** (~$0,034/kus v batchi), takže za
    1 091 starých 16:9 kusů je to ~$37 tak či tak — a přegenerování dá pořádnou kompozici
    ve čtverci, ne dolepené okraje. Až bude kredit: `node scripts/gen-irony-images.js --force`.
  - **AŽ BUDE VĚTŠINA FONDU ČTVERCOVÁ, uprav MOBILNÍ rám.** Ten je dnes 343×196 (široký),
    takže dnešním 16:9 sedí přesně, ale čtverec v něm bude 196×196 s pruhy 73 px po
    stranách. Desktopový rám se měnit nemusí — ten se řídí kartou, ne poměrem.
  - **ROZŠIŘOVÁNÍ HRACÍ PLOCHY ZAMÍTNUTO A VRÁCENO ZPĚT — nezkoušej to znovu.** Během
    dne tu bylo postupně 1460 px a pak 1200 px (práh nejdřív 1300, pak 1150). Hráč to
    ukončil jednou větou: *„rozhodnutí dát to na celou šířku obrazovky nebyl dobrý
    nápad"*. Důvod není jen vkus: při 1200 má rám 464 px a při 1460 skoro 570, jenže
    ilustrace jsou široké 1000 px (nové) a 1200 px (staré) — na retině (DPR 2 chce
    dvojnásobek) se tedy roztahovaly nad svoje rozlišení. A protože rám musí mít
    partnera stejné výšky, tlačilo to zvětšovat i textovou kartu. **Hrací obrazovka
    zůstává v 980 px**, kde má otázka ~65 znaků na řádek. Výběrové obrazovky
    (`.qz-pick`) se rozšiřují dál a to je v pořádku — tam jde o počet dlaždic na řádek,
    ne o čtení textu ani o rozlišení jedné ilustrace.
  - **Čísla platná po návratu na 980 px:** sloupce 556 / 376, rám 5:4 = 302 px, obrázek
    16:9 v něm 370×212 (celý, nic se neořezává). Karta u odpovědi 302–374 px, tedy
    v nejlepším případě přesně tolik co rám. Rovnost sloupců je tu volnější než při
    1200 px — to je cena za užší plochu a hráč ji zvolil vědomě.
  - Ověřeno v prohlížeči na 375, 768, 1100 a 1920 px; `test:offline` 568 kontrol.

- **2026-09-01 — Ilustrace u otázky se už NEOŘEZÁVÁ; generátor jede na výšku (4:5).**
  > **Rám už není 1:1 ani 16:9, ale `5 / 4`** — viz zápis nad tímhle. Zbytek platí.
  Hráč se zeptal, jestli je obrázek celý. Nebyl: rám u odpovědi je 4:5 (na výšku,
  přání 2026-08-14), ilustrace se generovaly 16:9 (na šířku) a `object-fit: cover`
  z nich **ukrajoval 54 % ŠÍŘKY** — u hasičského bálu zůstala mimo záběr celá třetí
  postava. Byl to důsledek dvou rozhodnutí, která se nikdy nepotkala; ani jedno
  samo o sobě špatné nebylo.
  - **`object-fit: contain` místo `cover`** — nic se neořízne nikdy, prázdný pruh nese
    pozadí rámu a čte se jako pasparta.
  - **Generátor nově `4:5`** ([gen-irony-images.js](scripts/gen-irony-images.js)).
    **Šířka zároveň 1200 → 1000**, protože 1200×1500 má 2,2× víc pixelů než dosavadní
    1200×686: přes zbývajících 2 601 obrázků by to bylo skoro **+1 GB v repu** (dnes
    má `img/` 184 MB). 1000×1250 vychází na ~265 kB a na retinu pořád stačí.
  - **Rám na desktopu 4:5 → 1:1 a `align-self: start`.** Bez `align-self` řádek mřížky
    rám ROZTÁHNE na výšku textové karty a `aspect-ratio` se neuplatní — naměřeno
    371×442 místo 371×371. Rovnost sloupců už není potřeba, akce v kartě drží u spodní
    hrany sama. Ověřeno, že rám má **stejnou výšku před i po odpovědi**, takže layout
    mezi otázkou a odpovědí neposkočí (to je pravidlo z 2026-07-31).
  - **1:1 je KOMPROMIS MEZI DVĚMA GENERACEMI, ne cílový stav.** Hotovo je teprve 30 %
    fondu (1 141 z 3 742), takže rám musí slušet starým 16:9 i novým 4:5. Při šířce
    ~371 px: staré → pruh 79 px nahoře a dole, nové → pruh 37 px po stranách.
  - **AŽ BUDE VĚTŠINA FONDU 4:5, uprav OBA rámy** — desktopový v `@media (min-width:900px)`
    zpátky na `4 / 5`, a hlavně **mobilní**: ten je dnes široký (343×196), takže současné
    16:9 vyplní přesně, ale obrázek na výšku by v něm byl malý (240×300 s pruhy 51 px).
    Dnes ho měnit nemá smysl — pro dnešní fond je optimální.

- **2026-09-01 — ČAS ODPOVĚDI SE MĚŘÍ NA SERVERU. Největší nález auditu je zavřený.**
  Do teď se `ms` bralo doslova z těla požadavku a server neměl s čím ho porovnat —
  nikde si nepamatoval, kdy otázku vydal. `ms: 0` proto vždycky dalo 200 bodů
  (maximum) a limit 10 s žil **výhradně v prohlížeči**. Rating, denní žebříček
  i turnajové pořadí šly nastavit curlem.
  - **Nová tabulka `q_served`** drží čas vydání každé otázky (migrace
    [2026-09-01-cas-na-serveru.sql](migrations/2026-09-01-cas-na-serveru.sql)).
    `answer.js` počítá `ms = Date.now() − served_at` a **`ms` z těla ignoruje**
    (zůstává přijímané kvůli starším klientům).
  - **`INSERT OR IGNORE` je tu zásadní, ne kosmetika:** druhé načtení téže otázky čas
    NEPŘEPÍŠE. Bez toho by stačilo požádat o otázku znovu těsně před odesláním
    odpovědi a stopky se resetovaly.
  - **Předstažení otázek se tím obrátilo proti útočníkovi.** `q/[n].js` pořadí pořád
    nehlídá, ale kdo si stáhne všech deset otázek naráz, spustí si tím deset stopek
    zároveň — než dojde na poslední, limit dávno vypršel a dostane nulu.
  - **Odpověď na nevyžádanou otázku se odmítá (409).** Na co ses nepodíval, na to
    nemůžeš odpovědět; zavírá to i cestu „přeskoč načtení a hádej u všech naráz".
  - **Boti se nemění:** `botPlay` skládá řádky do `game_answers` napřímo, bez endpointu,
    takže `q_served` nepotřebuje.
  - **Latence jde k tíži hráče, a je to v pořádku:** měřený úsek zahrnuje jednu cestu
    tam a zpět. Při limitu 10 s a lineárním bonusu stojí stovka milisekund jeden bod
    ze sta — pod rozlišovací schopností hráče.
  - **Ověřeno MUTACÍ:** po návratu ke klientskému `ms` spadly dva testy — `ms: 0` dalo
    přesně 200 bodů a odpověď 10 s po limitu 195 místo nuly.
  - **Test odpovídá SCHVÁLNĚ SPRÁVNĚ**, jinak by nula bodů mohla znamenat prostě
    špatný tip. Správný index bere `test-api.js` z `data/questions/*.json` — a to, že
    to jde, je samo o sobě ten druhý nález (viz níž).

- **2026-09-01 — OTEVŘENÉ nálezy z auditu. Nic z toho není opravené, čti před další prací na online.**
  > **AKTUALIZACE 2026-09-02: tenhle seznam je z velké části VYŘEŠENÝ, jen o tom
  > dřív nebyl zápis přímo tady.** Kdo čte tenhle bod, ať jde rovnou na novější
  > zápisy — je jich šest, každý s vlastním datem a odkazem na commit/soubor.
  - ~~Časová složka online hry neexistuje na serveru~~ — **VYŘEŠENO 2026-09-01**, viz zápis výš.
  - ~~**Souběhy** (`answer.js` absolutní zápis, `settle.js` bez atomického zámku,
    `join.js`/`bot.js` bez unikátnosti slotu)~~ — **VYŘEŠENO 2026-09-01**, „Souběhy
    v online hře opraveny".
  - ~~**Žádná expirace her**~~ — **VYŘEŠENO 2026-09-01**, „Expirace her, odveta
    neubírá otázky…" (`expireStaleGames`, veze se na `/api/me`).
  - ~~**Odveta poškozuje soupeře**~~ — **VYŘEŠENO 2026-09-01**, tentýž zápis
    (`markSeen` se volá až při vyžádání otázky, ne při založení odvety).
  - ~~**Three.js bez `integrity`**~~ — **VYŘEŠENO 2026-09-01**, tentýž zápis.
  - ~~**Žádný `_headers`**~~ — **VYŘEŠENO 2026-09-01**, tentýž zápis.
  - ~~**Bez limitu: registrace, zakládání her a turnajů**~~ — **VYŘEŠENO 2026-09-02**,
    „Rate limit na registraci, zakládání her a turnajů".
  - **Stále otevřené:**
    - **Správné odpovědi jsou veřejně na webu** (`dist/data/questions/*.json`), protože
      je potřebuje offline hra. Není to chyba v kódu, ale **střet dvou režimů nad jedním
      fondem**. Dokud platí, je jakýkoli žebříček spíš ozdoba než měření. Buď to přiznat
      a žebříčky odlehčit, nebo fond rozdělit na offline a serverový.
    - **Odkaz na obnovu PINu se loguje v čistém textu** (`mail.js`) — v logu je
      plnohodnotný převzímací klíč spárovaný s e-mailem.
    - **Drobnosti:** `esc()` v `quiz.js` neescapuje apostrof (v `online.js` ano),
      `flagStamp()` neescapuje `cc`, `avatar` se ukládá bez jakékoli validace, token
      platí 90 dní a nejde odvolat ani změnou PINu, `denní pětka` jde odehrát 3× denně
      přepnutím pásma.

- **2026-09-01 — Produkce nasazena a srovnaná s repem; `account_id` patří do `wrangler.toml`.**
  Produkční D1 byla od 2026-08-25 pozadu o všechno — sjednocení sekcí, 40 nových otázek,
  přejmenovaná id, turnajové tabulky. Protože v ní byl **jediný testovací účet a nula
  odehraných her** (ověřeno dotazem PŘED mazáním), zvolena čistá cesta: `schema.sql` +
  `d1-seed.sql` znovu, ne přírůstková migrace. Odpadly tím obě známé pasti — pořadí
  migrace turnajů i přejmenování pěti id, které při špatném pořadí vyrábí duplicitní otázky.
  - **Stav produkce: 3 742 otázek, 9 sekcí, 18 botů, 0 účtů, 0 her.** Nasazeno 1 390 souborů.
  - **Past, která stála nejvíc času: `database_id` platí jen pro JEDEN účet.** Web běžel,
    ale `wrangler d1 execute --remote` hlásil `database could not be found [code: 7404]`.
    Vypadá to na smazanou databázi; ve skutečnosti byl terminál přihlášený pod jiným
    e-mailem (`eweigl@email.cz`) než ten, pod kterým projekt vznikl (`evzen.weigl@gmail.com`).
    **Přepnutí účtu v prohlížeči na terminál nedosáhne** — ten má vlastní OAuth token.
    A i po přelogování si wrangler bral naposledy použitý účet, takže chyba trvala.
    Proto je v [wrangler.toml](wrangler.toml) nově `account_id`; ověřeno, že bez proměnné
    prostředí projde. Kdyby se to opakovalo: `npx wrangler whoami` ukáže e-mail i účet.
  - **Ověřeno na ostré adrese, ne jen tím, že „deploy proběhl":** obejita cache
    (`?cb=…`, `no-store`), zkontrolován rozcestník i `closed: true` u dětského žebříčku
    a **odehrána otázka proti ostrému API** — payload neobsahoval `answer` ani
    `correct_index` a vyhodnotil ji server. Ověřovací účet pak smazán i s navázanými řádky.
  - **[migrations/2026-08-30-sekce.sql](migrations/2026-08-30-sekce.sql) je PŘEKONANÁ a nesmí
    se spustit** — mapuje do „Zajímavostí", které od 2026-09-01 nejsou, takže by vyrobila
    nedosažitelné otázky. Sekce se dnes do běžící databáze dostávají přes `npm run db:sync`.

- **2026-09-01 — Sekce „Symboly" a „Zajímavosti" zrušeny; 194 otázek rozpuštěno mezi zbylých devět.**
  Byly to nejmenší sekce fondu (104 a 90) a „Zajímavosti" byla přiznaně sběrná škatulka.
  Výběr témat je nově 5+5 a **všechny dlaždice mají ilustraci** — tyhle dvě jako jediné
  padaly na emoji, protože se jim obrázky nikdy nevygenerovaly.
  - **Rozřazeno ručně, otázka po otázce** ([scripts/merge-sections.js](scripts/merge-sections.js)).
    Klíčovými slovy to nejde: „Jaké zvíře je na státním znaku Polska?" je heraldika
    (Kultura & tradice), kdežto „Jaký pták je národním ptákem Indie?" je příroda — obě mají
    v textu zvíře i slovo „národní".
  - **Skript SPADNE, když by nějakou otázku vynechal.** Není to opatrnost pro opatrnost:
    otázka v sekci, kterou `SECTION_ORDER` nenabízí, je dosažitelná jen přes „Vybrat vše"
    — přesně tak se 2026-08-30 ztratilo 536 otázek. Vazba `SECTION_ORDER` na data je nově
    i v komentáři u té konstanty.
  - Rozpad: Kultura & tradice 92, Historie 35, Místa 34, Příroda 17, Jídlo 5, Lidé 4,
    Sport 4, Umění 2, Jazyk & slova 1. Výsledek 545 / 536 / 512 / 510 / 437 / 342 / 300 /
    298 / 262, celkem 3 742.

- **2026-09-01 — CELÝ ZÁPIS NÍŽE JE ZRUŠENÝ. Žádná obrazovka se na širokém monitoru nerozšiřuje.**
  Vzniklo to na přání „chtěl bych takto na šířku vše" a **týž hráč to týž den zrušil** —
  nejdřív u hry („rozhodnutí dát to na celou šířku obrazovky nebyl dobrý nápad"), pak
  i u výběrových obrazovek. Vše drží ve sloupci **980 px**, jak to bylo předtím.
  Prázdné pruhy po stranách jsou menší zlo než obrazovka roztažená přes monitor.
  **Nezkoušej to potřetí.** Původní zápis zůstává jen kvůli tomu, co se cestou zjistilo:
  - ~~**výběr zemí** (56 dlaždic): až 7 sloupců, tam chceme co nejvíc;~~ **zrušeno**
  - ~~**kontinenty (8) a témata (10)**: stejný počet sloupců, jen větší dlaždice — 7+1 nebo
    6+2 vypadá jako chyba sazby, ne jako nabídka;~~ **zrušeno**
  - ~~**hra: strop 1460 px**~~ — **zrušeno**, viz podrobný zápis nahoře (rám 464–570 px
    roztahoval ilustrace široké 1000–1200 px nad jejich rozlišení).
  - **formuláře, výsledky a online se nerozšiřují vůbec** — to platilo tehdy i teď.
  - **Past, která PLATÍ DÁL, kdyby to někdo otevíral znovu: `.qz-tiles:not(.qz-tiles-sec)`
    má strop 940 px a STEJNOU specificitu jako `.qz-tiles-cc`**, takže se přebije jen
    dvojicí tříd `.qz-tiles.qz-tiles-cc`. Samotné rozšíření `#qz-body` tedy nestačí.
    Třída `qz-tiles-cc` v [quiz.js](quiz.js) zůstává, i když k ní dnes není pravidlo.

- **2026-09-01 — Slovník sjednocen na „profil" a všechny texty začínají velkým písmenem.**
  Patička registrace zněla jako formulář na úřadě („Už tu hráče máš?"); nově „Už se známe?
  / Ještě se neznáme?". S tím se zakládá **profil**, ne hráč — včetně obrazovky, která se
  dřív jmenovala „Účet". Slovo „hráč" zůstává tam, kde znamená člověka („Pošli odkaz hráči X").
  - **Dvě hlášky posílá server**, takže se měnily i tam: zpráva po žádosti o obnovu PINu
    ([reset/index.js](functions/api/auth/reset/index.js)) a tělo e-mailu ([mail.js](functions/_lib/mail.js)).
    Bez nich by hráč viděl „profil" v appce a „účet" v mailu.
  - **Velká písmena se nehledala grepem, ale skenem v prohlížeči** přes všechny obrazovky
    (rozcestník, výběry, celá hra včetně odpovědi a výsledků, online auth, lobby, profil,
    žebříček, přátelé, turnaje, denní pětka). Grep by minul texty složené za běhu i ty
    uprostřed řádku za oddělovačem — takhle se našlo mnohem víc než ten jeden placeholder,
    kvůli kterému to začalo: „zpět", „vyber země", „děti/puberťák/dospělí", „vyp/mírný/svižný",
    „připravujeme", „na tahu", „běží/skončil", „otázka 1/10", „rating 1500", „lehká/střední/těžká".
  - **Placeholder e-mailu je „Např. adresa@priklad.cz"** — samotná adresa velkým písmenem
    začínat nemůže, aniž by vypadala jako chyba.

- **2026-09-01 — `pages_build_output_dir` bylo pořád `"."` — tikající past, ne aktivní únik.**
  Oprava z 2026-08-25 řešila jen to, že `npm run deploy` předává `dist` výslovně; hodnota
  v konfiguraci zůstala na `"."` a komentář nad ní tvrdil, že statika se servíruje z kořene.
  **Kdyby se u projektu zapnulo sestavení z GitHubu, Cloudflare by si vzal ji a repo by bylo
  venku** (CLAUDE.md, schema.sql, package.json, 2,8MB d1-seed.sql).
  - Nově je v konfiguraci `dist` a **`npm run dev` si kořen předává sám** (`wrangler pages dev .`).
    Bez toho druhého by lokální vývoj servíroval postavené `dist/` a změny v `quiz.js` by se
    neprojevily, dokud někdo nespustí build. Ověřeno: dev běží ze živých souborů, API odpovídá,
    `npm run build` dá 1 390 souborů a žádný soukromý soubor v `dist/` není.

- **2026-09-01 — `test:api` měl nedeterministickou kontrolu bota.**
  Test si zapamatoval prvního bota a na konci trval na tom, že přijde zase on — jenže bot se
  vybírá podle ratingu hráče a ten se během těch her hýbe, takže výběr občas přeskočil na
  souseda a test spadl, i když kalibrace fungovala správně. **Nedeterminismus jde až k losu
  otázek:** `playAll` odpovídá vždy A, takže skóre (a tím rating) závisí na tom, kde
  v zamíchaném pořadí správná odpověď leží. Kalibrace navíc boty postupně rozjíždí, takže se
  to s počtem spuštění zhoršuje — v lokální D1 měli místo seedovaných 1700 a 1900 už 1738
  a 1946. Nově se síla sleduje **podle konkrétního bota** (klíč je přezdívka) a porovnává se
  první a poslední hodnota téhož bota. Ověřeno třikrát po sobě.

- **2026-08-31 — Rozcestník: mřížka 2×2, Online první a Škola poslední, bot z popisku pryč.**
  Čtyři režimy se ve flexu (`.qz-modes`) lámaly na 3 + 1, takže online vypadal jako přílepek
  přilepený zespoda, ne jako rovnocenný režim. Nově je to natvrdo dvousloupcová mřížka; na
  displeji pod 560 px jeden sloupec, protože 2 × 220 + 16 mezera = 456 px se na telefon nevejde.
  - **Online je první, škola poslední.** Online je jediný režim, kde na hráče někdo čeká; škola
    je nejužší případ užití. Pořadí je v [quiz.js](quiz.js), mřížka v [quiz.css](quiz.css).
  - **„Nebo proti botovi" z popisku pryč.** Bot je náhradní řešení pro prázdnou frontu, ne důvod,
    proč do online jít — a slibovat ho na rozcestníku znamená prodávat režim tím nejslabším,
    co umí. Nově „Proti živým soupeřům. Rating nelže."
  - **Nová `assets/mode-online.jpg`.** Původní ironická holubice se sluchátky byla portrét zvířete
    v detailu, kdežto zbylé tři dlaždice jsou scény s lidmi v prostředí — vypadala jako z jiné
    sady, protože z jiné sady byla (vznikla pro online lobby, ne pro rozcestník). Vygenerováno
    ručně v Gemini, ořezáno `crop-gemini-frame.ps1 -Margin 0.05`. Scéna je zapsaná i do
    `data/ui-irony-prompts.json`, jinak by ji `gen-irony-images.js --ui --force` přepsal zpátky
    na holubici. **Cestou vzniklo poučení o čitelnosti dlaždic ve 100 px — viz sekce Ilustrace.**

- **2026-08-31 — Pásmo je volba FONDU OTÁZEK, ne tvrzení o věku. Zalepené dvě díry, pásmo jde nově změnit, dětský žebříček zrušen.**
  Hráč se ptal, jak online pozná, že hraje dítě, a jestli může dospělý hrát proti dítěti.
  **Ověřeno v kódu, že v běžné hře nemůže** — fronta páruje `WHERE band = ?` a pásmo se bere
  z účtu, ne z požadavku ([match.js](functions/api/match.js)); stejně je hlídaný odkaz, turnaj,
  otázky, boti i rating (`ratings` má `PRIMARY KEY (user_id, band)`). Skutečný problém je jinde:
  **pásmo nikdo neověřuje a ověřit nejde**, takže je to fakticky volba obtížnosti.
  - **ZAMÍTNUTO: sloučit vše do jedné úrovně.** Padl návrh zrušit pásma a losovat ze společného
    fondu. Neřeší to ale nic z toho, proč vzniklo — **víc lidí u jednoho monitoru si pomáhá
    stejně dobře v jednom fondu jako ve třech** — a stálo by to hodně: fondy jsou v D1 oddělené
    (**děti 990, puberťáci 1310, dospělí 1442**, dohromady 3 742), takže by dítě dostávalo
    **74 % otázek psaných pro dospělé**. Tím by padla i práce z téhož dne, kdy se dorovnávala
    podlaha na 10 dětských otázek v každé zemi.
  - **Obojí (lhaní o pásmu i parta u monitoru) řeší rating sám.** Glicko nepotřebuje vědět, PROČ
    je někdo dobrý — vyhraje pár her, rating vyletí a matchmaking ho spáruje se stejně silnými.
    Zbývá jen prvních pár her, než se rating usadí; to je cena každé hry bez ověřování identity
    a projekt má volný anti-cheat vědomě (zápis 2026-08-24).
  - **Díra 1: `body.band` u zakládání hry.** [game/index.js](functions/api/game/index.js) bralo
    `body.band || me.band` a kontrolovalo jen členství v `BANDS`, ne shodu s hráčem. Souboj na
    odkaz je přitom **hodnocený** (`rated=1`) a `ratingRow()` v [settle.js](functions/_lib/settle.js)
    si řádek pro libovolné pásmo prostě založí — dospělý účet se tak ručně sestaveným požadavkem
    dostal do **dětského žebříčku** a dítě proti němu směl `join.js` pustit. Z appky to nešlo
    (`online.js` `band` neposílá), ale díra to byla. Nově se pásmo bere výhradně z účtu.
  - **Díra 2: `?band=` u denní pětky.** Totéž v [daily/index.js](functions/api/daily/index.js) —
    nehodnocená je, ale zapisovala se do denního žebříčku cizího pásma.
  - **Pásmo jde nově změnit** ([auth/band.js](functions/api/auth/band.js), `PUT /api/auth/band`).
    Do teď šlo zvolit jen při registraci, takže kdo se seknul, musel založit nový účet a přijít
    o rating i historii. **Rating se nepřenáší a je to správně** — pásma losují z různých fondů,
    čísla napříč nimi nejsou porovnatelná; v novém se začíná od 1500 a při návratu se najde to
    původní. **PIN se schválně nežádá** (na rozdíl od změny e-mailu): tady se nedá získat nic,
    co ten, kdo drží odemčené zařízení, už nemá.
  - **Past, na kterou by se snadno zapomnělo: přechod DO dětského pásma musí přezdívku
    vygenerovat znovu.** Dětský prostor je schválně bez volného textu (`register.js`) — bez
    tohohle kroku by stačilo přijít s libovolnou přezdívkou z jiného pásma a ta ochrana by
    nebyla k ničemu. Opačným směrem se generovaná přezdívka nechává, je neškodná.
  - **Dětský žebříček ratingu zrušen** ([leaderboard.js](functions/api/leaderboard.js) vrací
    `closed: true`). Je to jediné pásmo, kde na pořadí nezáleží tak, aby za to stálo vystavovat
    tu nejistotu. Dětem zůstávají turnaje, přátelé, odkaz i denní pětka a obrazovka jim to řekne
    místo prázdného seznamu. **Denní žebříček se tím NEZAVŘEL** — je jednodenní a dětské
    přezdívky jsou generované, takže neprozrazují nic; kdyby to vadilo, je to stejný jeden řádek.
  - **`test:api` má 119 kontrol (bylo 109) a nových 10 je ověřeno MUTACÍ**, ne tím, že svítí
    zeleně: po dočasném vrácení všech tří chyb spadly právě tři testy, každý ten svůj.
  - **Past zaplacená cestou: `Set-Content -Encoding utf8` ve Windows PowerShellu píše BOM**,
    takže `test-api.js` přestal jít spustit (`SyntaxError` hned na prvním řádku). Na hromadnou
    úpravu souboru patří `[System.IO.File]::WriteAllText` s `UTF8Encoding($false)`.

- **2026-08-31 — Registrace: dva sloupce na desktopu a e-mail se nabízí HNED, ne až v Účtu.**
  Hráč nahlásil, že obrazovka vypadá „jen pro velikost mobilu". Měl pravdu a příčina byla
  konkrétní: `.zk-wrap` má strop **640 px**, což je správně pro lobby s dlaždicemi, ale
  registrace pak byla na širokém monitoru úzký proužek uprostřed.
  - **Řešeno výhradně CSS.** V HTML jdou prvky za sebou stejně jako dřív (obrázek → nadpis →
    formulář), přibyly jen dva obaly. Od **900 px** — táž hranice, na které se překlápí hrací
    obrazovka — se karta rozloží na obrázek s nadpisem vlevo a formulář vpravo.
    **Na mobilu se nezměnilo nic**, ověřeno na 375 px: jeden sloupec, nic nepřetéká.
  - **Pole formuláře nejsou přes celý sloupec** (`max-width: 420px`). Roztažený PIN přes
    půl monitoru se čte hůř a vypadá jako chyba, ne jako design.
  - **E-mail v registraci ZMĚKČUJE rozhodnutí z 2026-08-25**, které říkalo „registrace se
    nemění, e-mail se doplňuje až potom v Účtu". Zůstává **nepovinný** a slouží pořád jedinému
    účelu — obnově zapomenutého PINu. Důvod změny: kdo si ho doplní až potom, to typicky
    neudělá, a při zapomenutém PINu přijde o účet i s ratingem a historií. Nabídnout ho ve
    chvíli, kdy hráč PIN vymýšlí, je jediný okamžik, kdy to dává smysl.
  - **U dětského pásma se popisek i placeholder přepnou na „e-mail rodiče".** Dítě e-mail
    obvykle nemá a odkaz na obnovu má stejně dojít dospělému. Proto taky `users.email`
    schválně **nemá `UNIQUE`** — rodič musí smět mít tutéž adresu u víc dětí.
  - **Prázdný e-mail musí projít stejně jako chybějící klíč.** Formulář prázdné pole neposílá
    vůbec, ale kdyby ho někdo poslal jako `""`, odmítnutí by z nepovinného pole udělalo
    povinné. Hlídají to tři nové kontroly v `test:api` (**109 místo 104**).
  - **`landing-hero.jpg` je dědictví po `landing.html` a je v původním „hezkém" stylu**, ne
    v ironickém, kterým appka jinak mluví — a na desktopu ho je teď vidět mnohem víc.
    Náhrada má napsaný prompt `auth-hero` v `data/ui-irony-prompts.json` (podání ruky přes
    rovník glóbu) a **cesta k obrázku je v `online.js` jediná konstanta `AUTH_HERO`**, takže
    po vygenerování je to změna na jednom řádku. Nevygenerováno: kredit Gemini je vyčerpaný.

- **2026-08-31 — Obsah jde konečně do běžící databáze BEZ jejího smazání (`npm run db:sync`).**
  Zjištěno cestou: `seed-d1.js` skládá obyčejné `INSERT`, takže projde jedině na prázdné
  tabulce — a jediná cesta, jak ho použít, byl `db:init`, který začíná `DROP TABLE`.
  **Každá nová otázka by tedy na produkci stála smazání účtů, ratingu i rozehraných her.**
  Nikdo si toho nevšiml, protože se dosud nasazovalo jen do prázdné databáze.
  - **[scripts/sync-d1-questions.js](scripts/sync-d1-questions.js) vyrábí `data/d1-sync.sql`
    s `ON CONFLICT(id) DO UPDATE`** — nová otázka se vloží, změněný text se přepíše,
    a **`rating` otázky zůstane**, protože ten patří databázi (počítá se z úspěšnosti hráčů),
    ne datům. Bez DROP, bez DELETE. Ověřeno na lokální D1: 3 702 → 3 742 otázek, přitom
    **207 účtů a 407 her beze změny** a žádný rating nepřepsaný.
  - **`npm run db:sync -- --check`** porovná id v databázi s daty a vypíše, co je navíc.
    Není to úklid pro úklid: po přejmenování pěti id jich v databázi zůstalo pět starých
    vedle pěti nových, takže by **online tutéž otázku losovalo dvakrát**.
  - **Poučení o pořadí, zaplacené hned:** id se musí přejmenovat **nejdřív v databázi**
    (`UPDATE questions SET id=…`) a teprve pak sesynchronizovat data. Obráceně sync nové id
    vloží, staré zůstane, `UPDATE` už neprojde kvůli primárnímu klíči — a zpátky vede jen
    `DELETE`, jenže na starý řádek můžou odkazovat `seen_questions` a `games.question_ids`.
    Lokálně na těch pět ukazovaly dva záznamy o zobrazení a jedna hra.
  - **Guard v SQL napsat nejde** a skript to netvrdí: `games.question_ids` je JSON pole,
    takže na něj `JOIN` neudělám. `--check` proto vypíše dotazy k ručnímu ověření, ne
    „bezpečný" `DELETE`, který by bezpečný nebyl.
  - **Produkční D1 je pozadu** (naplněná 2026-08-25, tedy před sjednocením sekcí i před
    dnešními 40 otázkami). Pořadí při nasazení: `migrations/2026-08-30-sekce.sql`,
    pak `db:sync --remote`, pak `npm run deploy`.

- **2026-08-31 — Id otázky musí být ASCII; pět jich mělo diakritiku, protože slug vznikl z české věty.**
  `id` není jen klíč — je z něj i **název souboru `img/{id}.jpg`** a kus URL. Pět otázek mělo
  v id háčky a čárky (`de-k-preclík`, `pe-q-fútbol`, `it-a-umelecke-hnutí`…), zbylých 3 737 ne.
  - **Nebylo to rozbité a netvrdil jsem, že je.** Ověřeno v prohlížeči: `img/cz-k-stavěni-majky.jpg`
    se načetl v plné velikosti stejně jako ASCII kontrola. Šlo o zbytečné riziko kolem kódování
    názvů souborů na hostingu, kde se to bez nasazení ověřit nedá — proto úklid, ne oprava.
  - Přejmenováno v `data/questions` (5 řádků, nic jiného se nezměnilo) a `git mv` u jediného
    obrázku, který existoval. `data/d1-seed.sql` a `dist/` se generují, takže se srovnají samy;
    v `docs/audit-otazky-kvalita.md` staré jméno zůstává, je to historický záznam.
  - **`validate` má nově tvrdou kontrolu `^[a-z0-9-]+$` a je ověřená mutací** — po vrácení
    diakritiky do jednoho id ji nahlásí jmenovitě.

- **2026-08-31 — Podlaha fondu dorovnána: žádná kombinace země × pásmo nemá pod 10 otázek (+40 ručně psaných).**
  Z nálezu o nevyváženém fondu byla tahle část ta, která hráče opravdu bolela: **17 zemí mělo
  4–9 dětských otázek**, takže dítě dostalo v sólu hru o čtyřech otázkách (Malajsie) a v párty
  se mu při osmi kolech každá otázka zopakovala dvakrát. Po dorovnání je **minimum 10** a fond
  má 990 dětských otázek z 3 742.
  - **Po dětech jsem zkontroloval i zbylá dvě pásma a našel poslední díru:** Japonsko mělo
    u puberťáků 7 otázek (`!kids && difficulty ≤ 2`), takže tam platilo totéž. Dopsány 3.
    **Teď je minimum všech tří pásem 10, tedy nad osmi koly párty — opakování kvůli velikosti
    fondu tím mizí úplně.** Hláška `partyOpakovaniNote` ale dál smysl má: hráč si může zúžit
    výběr na jednu zemi a jednu sekci, kde je otázek pár.
  - **Nezvyšovat `starsi` přeřazením obtížnosti.** Nabízí se to (stačilo by pár japonských
    otázek zlevnit z 3 na 2), ale `difficulty` u dospěláckého fondu znamená věkovou vhodnost —
    2026-08-15 se kvůli tomu přeřazovalo 741 otázek opačným směrem. Přepsat je zpátky by tu
    práci tiše zrušilo.
  - **Psáno ručně v session, ne přes API** — na 37 kusů je to rychlejší a hlavně to nečeká na
    kredit. Generátor by se vyplatil až u řádově většího objemu.
  - **Každá nová otázka má `more_fact`**, takže u nich rovnou funguje i „Více o…". Ověřeno
    `lint-facts`: počet upozornění zůstal na 9, tedy ani jeden ze 37 nových faktů neopakuje
    to, co hráč právě četl.
  - **Rozpětí zůstává nevyvážené a je to v pořádku** (Česko 964, medián zbytku 42). Cílem nebylo
    srovnat fondy, ale zvednout podlahu tam, kde byla hra kvůli velikosti fondu degradovaná.
  - **Past, na kterou tenhle projekt platí potřetí: kontrolní seznam slov „bez diakritiky" musí
    obsahovat jen slova, která diakritiku VYŽADUJÍ.** Můj první seznam měl `hora`, `voda`,
    `rychle` — ta se píšou bez háčků správně, takže kontrola nahlásila 13 zásahů a všechny byly
    plané. Po opravě seznamu 0 nálezů.
  - **Ověřeno v prohlížeči, ne jen testem:** Malajsie/děti nabídne „10 otázek" (dřív 4), hra
    hlásí „otázka 1/10", nová otázka se vykreslí se štítkem „pro děti" a karta „Více o…" se
    otevře s faktem.

- **2026-08-31 — `test:offline` pokrývá i párty logiku (574 kontrol); mutace odhalila, že první verze nejdůležitější chybu NECHYTALA.**
  Test do teď kontroloval jen konstanty a nabídku otázek — párty pořadí a bodování, tedy
  nejkřehčí kus offline logiky, nekontroloval nic. Nově se ověřuje, že fronta má přesně
  `kola × hráči` položek (na násobku stojí zarovnání pásem přes `% S.order.length`), že
  **každá otázka padne hráči z JEHO pásma**, že malý fond frontu domíchá místo zkrácení,
  a že v párty má odpověď stejnou cenu pro všechna pásma.
  - **Mutací ověřeny tři historické chyby a jedna z nich prošla.** Návrat k losování
    z jednoho společného balíku (stav před 2026-08-24, kdy dítě dostávalo ~41 % otázek
    pro dospělé) test „chytil" jen tak, že spadl na `ReferenceError` — `data` nebylo
    v kontextu vytažené funkce. To není detekce, to je náhoda odstínění: hláška by
    o skutečné vadě neřekla nic. Po doplnění `data` do kontextu se chyba hlásí správně
    jako „otázky mimo pásmo hráče na tahu".
  - **Poučení obecně:** když se čistá funkce vytahuje do `vm`, musí mít v kontextu i to,
    co dnes nepoužívá, ale co by použila ta chyba, kterou hlídáme. Jinak test měří,
    jestli kód spadne, ne jestli je správně.

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
  > 837 / 827 / 1969 z 2806. (3) **OPRAVA 2026-09-03: `admin.html` V REPU JE** (verzovaný, 333 řádků,
  > přibyl commitem `b6e4bb9`, odkazuje na něj `scripts/audit-questions.js`). Předchozí verze téhle
  > poznámky tvrdila opak — mýlila se, nejspíš kvůli grepu ve špatné chvíli. Popsaný filtr a zelený
  > štítek v `admin.html` tedy existují; štítek „pro děti" v HRACÍ obrazovce má `quiz.js` od 2026-08-24.
  > `admin.html` se NENASAZUJE (není v `build-public.js`), je to jen vývojářský revizní nástroj.
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
  Nevyrobené assety zůstaly ležet v `assets/ui/` a `assets/paper-bg.jpg`; než to zkusíš
  znovu, věz, že tudy cesta nevedla.
  > **Doplněno 2026-08-31:** ty assety už **commitnuté jsou** (hráč přecházel na jiný počítač
  > a chtěl mít u sebe všechno). Nic se tím nemění na tom, že se **nepoužívají** — v žádném
  > CSS ani HTML na ně nevede odkaz a `build-public.js` je do `dist/` nekopíruje. Leží v repu
  > jako materiál k zavrženému pokusu, ne jako součást appky.
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

### Dlaždice se kreslí na 96–132 px. Rozdělená kompozice tam nefunguje. (2026-08-31)
Zaplaceno třemi pokusy o novou dlaždici `mode-online.jpg`. Obě zamítnuté varianty byly samy
o sobě v pořádku a v plné velikosti hezké — v dlaždici ale nečitelné, protože **rozdělovaly
pozornost mezi dvě stejně důležitá místa**:
- **dva pokoje vedle sebe** (hráč u nás × soupeř na druhé straně světa, den vs. noc) — dva středy,
  ve zmenšenině šmouha;
- **glóbus s hráčem nahoře a druhým vzhůru nohama pod ním** — hráč to shrnul „z toho bolí hlava";
  převrácená půlka nutí mozek obrázek luštit, což je u dlaždice, na kterou se kouká půl vteřiny,
  ta nejhorší možná vlastnost.

**Pravidlo:** dlaždice musí jít popsat jednou větou, která má JEDEN podmět („člověk u stolu
a kolem něj parta lidí"). Bod 4 receptu výš („one single continuous scene with one clear focal
point") to říká taky, ale nestačí ho napsat do promptu — musí platit i o nápadu samotném.
Symetrie (dva pokoje, dva póly, dvě půlky) tenhle test neprojde nikdy, ať je prompt jakkoli
poctivý. Před generováním se zeptej: **co z toho zbude ve 100 px?**

**Nálada patří do promptu stejně výslovně jako kompozice.** Verze se dvěma pokoji vyšla
melancholicky — dva shrbení lidé ve studeném modrém světle — protože prompt říkal „hunched",
„deep night", „ve dvě ráno v pyžamu". Model náladu bere doslova. Když má být dlaždice veselá,
musí tam stát `cheerful and playful`, teplé světlo v celé scéně a velká gesta; a i poražený
se musí smát, jinak appka vypadá, že se v ní prohrává smutně.

### Napojení v kódu
Dlaždice ([quiz.js](quiz.js), fce `tileHtml`) načítají `assets/{cont|country|section}-*.jpg`
s **emoji fallbackem** (`onerror`). Chybějící obrázek tedy hru nerozbije — spadne zpět na emoji.
Názvy: kontinenty `cont-{id}.jpg`, země `country-{cc}.jpg`, sekce `section-{slug}.jpg`
(slugy v `SECTION_SLUG`), „Vše" = `section-vse.jpg`.

### Pozn.
Fotky ke kartám v `img/` (Polsko/Slovensko) vznikly jinak — přes **Gemini**, pak ořez bílých okrajů
a import přes [scripts/import-images.js](scripts/import-images.js).
