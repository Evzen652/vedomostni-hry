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

---

## Systémová rozhodnutí (log)

Nejnovější nahoře. Formát: **datum — název** + jednou větou co a proč.

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
  pokryla desítky zemí a proklikávání po jedné přestalo dávat smysl. **Zjištěný vedlejší bug (zatím neopravený):**
  obdobná dlaždice „Vše" u výběru témat (`renderSectionPick`, proměnná `allTile`) se v kódu spočítá, ale nikdy
  se nevloží do `body.innerHTML`, takže na obrazovce chybí a event listener na `data-sec="__all__"` je mrtvý kód.
  Oprava: vložit `${allTile}` do `<div class="qz-tiles qz-tiles-sec">${secTiles}${allTile}</div>`, analogicky
  k funkčnímu vzoru v `renderContinentPick`. Vyvedeno jako samostatný spawn_task (nespuštěný ke dni zápisu).
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
- **(konvence od založení) — Appka je offline-only.**
  Žádná runtime volání AI ani externích API. Vše (obrázky, data) je součástí repa.
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
