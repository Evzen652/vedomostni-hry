# Předání: ilustrace k otázkám

Sepsáno **12. září 2026** (aktualizováno **13. 9. odpoledne**, po Malajsii, kde došel
kredit Gemini API). Doplňuje [predavaci-protokol.md](predavaci-protokol.md); poučení
a rozhodnutí jsou v [CLAUDE.md](../CLAUDE.md) pod datem **2026-09-11** (formát, Rusko),
**2026-09-12** (Kanada, Německo+Rakousko, Itálie, Británie, Maďarsko, Švédsko, Francie,
Slovensko, Nizozemsko) a **2026-09-13** (Švýcarsko, Řecko, Bulharsko, Španělsko,
Ukrajina, Rumunsko, Thajsko, Turecko, Irsko, Izrael, Jižní Korea, Malajsie).

---

## 1. Stav k 13. 9. 2026 (odpoledne)

| Položka | Hodnota |
|---|---|
| Otázek celkem | 3 742 |
| Bez ilustrace | **1 207** |
| Hotovo dnes v noci/dopoledne | Slovensko 66/66, Nizozemsko 63/63, Švýcarsko 62/62, Řecko 53/53, Bulharsko 52/52, Španělsko 62/62, Ukrajina 47/47, Rumunsko 46/46, Thajsko 45/45, Turecko 43/43, Irsko 42/42, Izrael 42/42, Jižní Korea 42/42, **Malajsie 37/42** |
| **ZASTAVENO — DOŠEL KREDIT GEMINI** | **Pět malajsijských obrázků čeká na přegenerování**, zadání jsou opravená a po lintu — viz bod 2 níž |
| Další v pořadí (po Malajsii) | **Pákistán 42, Portugalsko 42, Saúdská Arábie 42 a Dánsko 42 — zadání UŽ NAPSANÁ a po lintu**; pak Indonésie 41, Norsko 41, Filipíny 41… |
| Formát | 16:9, **1344×768**, JPG q84, ~222 kB/kus |
| Cena | ~$0,034 za obrázek v dávce |

**Kredit Gemini API se v noci na chvíli vyčerpal** (429 „prepayment credits are depleted"
při odesílání dávky pro Slovensko) — hráč dobil na `ai.studio/projects` a dávka pak prošla
normálně. Kdyby se to stalo znovu, řešení je stejné (dobití, appka/skript s tím nic neudělá).

**Dávky o jediném/pár obrázcích někdy trvají 30+ minut** (viděno u `bg-q-shopska` i
`es-a-vinice`) — mnohem déle než velké dávky. Batch API negarantuje čas dokončení,
řešením je jen počkat.

**Technika ze Španělska: když 3–4 přeposlání stejného zadání pořád vrací podpis,
je RYCHLEJŠÍ A LEVNĚJŠÍ obrázek OŘÍZNOUT než platit za další generování** — funguje
spolehlivě, pokud je podpis blízko okraje. Postup: `sharp extract` horních ~85 %
plochy (zachovej poměr stran, u 1344×768 např. left:100, top:0, width:1143, height:653),
pak `.resize(1344, 768)`.

**Ukrajina jako jediná země NEMĚLA ANI JEDEN náhodný podpis** — u Rumunska se jeden
zase objevil, a to na NEČEKANÉM MÍSTĚ (radlice buldozeru, ne roh).

---

## 2. PRVNÍ KROK PŘÍŠTÍ SESSION: dobít kredit a dogenerovat pět obrázků Malajsie

**Práce se zastavila na tom, že došel kredit Gemini API** (429 "prepayment credits are
depleted") uprostřed opravné dávky pro Malajsii. Stalo se to už jednou v noci na 13. 9.
u Slovenska a řešení je stejné: **hráč dobije kredit na `ai.studio/projects`** a dávka
pak projde normálně. Skript ani appka s tím nic neudělají.

Po dobití spusť jako první věc:

```bash
node scripts/batch-irony-images.js submit --only my-t-vlajka,my-q-malacky-sultanat,my-q-nicol-david,my-q-batik-my,my-k-petronas-most
node scripts/batch-irony-images.js status
node scripts/batch-irony-images.js fetch
```

**Opravená zadání jsou už v datech a prošla lintem**, nic se nepřepisuje. Vadné verze
ležely ve scratchpadu (na jiném počítači nebudou, nevadí). **V `img/` těch pět obrázků
schválně NENÍ** —
kdyby tam byly, `submit` by je přeskočil.

Co se u každého opravovalo, ať víš, na co se dívat:
- `my-t-vlajka` — vyšla úplně špatná vlajka (krémovo-tyrkysová, pět pruhů). Nová verze
  má vypsané "fourteen alternating red and white horizontal stripes with a dark blue
  rectangle in its upper corner carrying a yellow crescent moon and a yellow star with
  fourteen points". **Zkontroluj počet pruhů i půlměsíc s hvězdou.**
- `my-q-malacky-sultanat` — na pytlích bylo čitelné "SPICES"; slovo "spices" ze zadání
  zmizelo, nově "bulging plain unmarked sacks and rolled bales".
- `my-q-nicol-david`, `my-q-batik-my`, `my-k-petronas-most` — náhodné podpisy,
  zadání beze změny. **Zkontroluj rohy.**

**Pak pokračuj Pákistánem, Portugalskem, Saúdskou Arábií a Dánskem — všechny čtyři mají
zadání UŽ NAPSANÁ a po lintu** (`submit --cc pk`, `--cc pt`, `--cc sa`, `--cc dk`).
Nepiš je znovu.

**Nejrizikovější otázky v těch třech připravených sadách:**
- Pákistán: `pk-q-kaligrafie` (islámská kaligrafie — scéna je schválně jen geometrické
  a květinové kachle, žádný znak), `pk-q-pismo` (zprava doleva — kniha otevřená z pravé
  strany, všechny stránky prázdné), `pk-q-truck-art` a `pk-k-malovane-nakladaky`
  (náklaďáky v realitě nesou verše — "only pictures and patterns and nothing else"),
  `pk-k-sialkot-mice` (míče "in plain black and white with no marking of any kind").
- Portugalsko: `pt-t-cabo-roca` (sloup s nápisem v realitě — v zadání "its face
  completely blank"), `pt-t-pessoa` (heteronymy — několik verzí téhož muže u stolu,
  žádná stránka), `pt-t-vinho-porto` ("plain unlabelled dark bottles"), `pt-t-mourinho`
  ("plain unmarked microphones", pozadí "completely blank"), `pt-t-benfica-porto`
  (tři šály bez znaků).
- Saúdská Arábie: `sa-k-vlajka` — **POZOR, vědomé zjednodušení**: skutečná vlajka nese
  arabský nápis šahády, ale text je v projektu zakázaný, takže zadání popisuje jen
  zelené pole s bílým mečem. Otázka se ptá na BARVU, takže odpověď to neporušuje.
  Dál `sa-q-nabatejske-pismo` (dva kamenné bloky, ostrý a ohlazený, žádný znak),
  `sa-q-nabatska-poezie` ("not a single page or pen anywhere"), `sa-q-dakar`
  a `sa-q-al-nassr` (bodywork a dres bez značek).
- Dánsko: `dk-t-bluetooth` — **logo Bluetooth je runová ligatura, tedy PÍSMENA**; zadání
  je proto staví na vikingském králi s jedním modrým zubem a dvou bzučících přístrojích,
  žádná runa. `dk-a-carlsberg` (vynález stupnice pH) — místo stupnice s čísly je to
  barevný žebřík zkumavek od červené po modrou. `dk-a-kierkegaard` (pseudonymy) — několik
  verzí téhož muže vedle sebe, žádná stránka. `dk-a-karen-blixen` (mužský pseudonym) —
  mužský klobouk na stole, žádný text. `dk-t-dannebrog` má barvy i posunutý kříž vypsané
  doslova. `dk-a-egtved` (mumie z doby bronzové) — v rakvi je JEN oděv a bronzový disk,
  žádná postava.
- **Past zaplacená u Dánska: `lint-irony` bere „writing desk" jako chybu**, protože slovo
  `writing` je na seznamu. Psací stůl popisuj jako `desk` nebo `lamplit desk`.

**Past ze Švédska/Švýcarska/Řecka/Ukrajiny/Rumunska/Turecka/Irska/Izraele/Malajsie:**
slovo, které POJMENOVÁVÁ, co věc JE nebo K ČEMU SLOUŽÍ, se propíše jako čitelný text.
**Platí to i pro VEDLEJŠÍ gag** — turecké "ferry queue" postavilo budovu s nápisem
a malajsijské "sacks of spices" vyrobilo na pytlích "SPICES". **A i pro popis ÚČELU
bez jména věci** (izraelské "showing where sea level would be").

**Past z Německa, Bulharska a Malajsie: obecný popis vlajky vyrobí špatnou vlajku.**
Když se otázka ptá přímo na vlajku, vypiš barvy, počet i rozvržení doslova.

**Past z Irska: řádek MOOD nese asociace stejně silně jako popis scény** (`lucky`
u trojlístku vyrobilo čtyřlístek, dvakrát po sobě).

**CO SPOLEHLIVĚ FUNGUJE (Thajsko, Jižní Korea, Malajsie — 10 otázek o písmu bez jediné
vady): scéně se předem NEDÁ plocha, na kterou by se dal napsat znak.**

**Past, kterou hlídej po KAŽDÉ opravě: jedna oprava umí vyrobit nový náhodný podpis.**

**A podpis NEMUSÍ ležet v rohu** — u Rumunska seděl na radlici buldozeru, u Thajska
a Irska vepsaný do hlíny/trávy, u Turecka dvakrát uvnitř scény.

---

## 3. Jak se v tom pokračuje (přesné pořadí)

```bash
node scripts/batch-irony-images.js submit --cc XX      # nebo --only id,id
node scripts/batch-irony-images.js status              # BATCH_STATE_* ; dávka trvá 2-10 min
node scripts/batch-irony-images.js fetch               # uloží do img/{id}.jpg
```

1. **Zadání se píšou v session**, ne skriptem — za text se neplatí a kvalita je lepší.
   Recept: jedna dominanta „fills the frame“ s vtipem na ní, pak `Smaller and subordinate:`
   nejvýš tři gagy, a na konci řádek `MOOD:`.
2. **`npm run lint-irony` musí projít na 0 chyb, než se cokoli odešle.** Kontrola stojí nic,
   obrázek podle vadného zadání desetinásobek ceny zadání.
3. `submit` **přeskočí otázku, která už `img/{id}.jpg` má** — před přegenerováním starý
   obrázek přesuň stranou (`--force` dávkový skript nemá).
4. Skript **sleduje jen JEDNU dávku najednou** (`.batch-irony.json`) — než pošleš další
   zemi, musíš předchozí `fetch`nout (nebo `rm .batch-irony.json`, pokud už je fetchnutá).
5. Po `fetch` **projít očima úplně všechno**, viz bod 4 níž.

**Nástroje na kontrolu jsou od 13. 9. V REPU, ve `scripts/ilustrace/`.** Do té doby ležely
ve scratchpadu session, což byla past: **při přechodu na jiný počítač by se ztratily.**
Cesty si dopočítají samy z umístění skriptu, takže fungují na jakémkoli stroji.

| Příkaz | K čemu |
|---|---|
| `node scripts/ilustrace/archy.js XX [max]` | přehledové archy 3×3 (náhled 600 px + pořadí a id); `XX` je země, nebo seznam id přes čárku |
| `node scripts/ilustrace/rohy.js XX` | arch dolních rohů všech obrázků — tam bývají podpisy |
| `node scripts/ilustrace/vyrez.js id L T Š V [zoom]` | zvětšený výřez podezřelého místa, souřadnice v PROCENTECH, zvětšení výchozí 5× |
| `node scripts/ilustrace/pridej-prompty.js soubor.json` | doplní `irony_prompt` tam, kde chybí (vstup `{id: scéna}`) |
| `node scripts/ilustrace/prepis-prompty.js soubor.json` | přepíše EXISTUJÍCÍ zadání (kontroluje původní text) |
| `node scripts/ilustrace/aplikuj.js upravy.json` | obecný zapisovač s round-tripem (1 mezera + CRLF) |

Archy a výřezy jdou do **`.ilustrace/`** v kořeni repa, což je **gitignorované** — je to
pracovní materiál ke kontrole očima, ne obsah appky.

**`pridej-prompty.js` při kolizi NEZAPÍŠE NIC** a vypíše, která id už zadání mají.
Tehdy ta id ze vstupního JSONu vyhoď a spusť znovu; stalo se to u Malajsie i Saúdské Arábie.

**Zálohy vadných verzí ležely ve scratchpadu a při přechodu na jiný počítač se ztratí** —
nevadí, jsou to vadné obrázky a `img/` je nemá, takže `submit --only` je vygeneruje znovu.

---

## 4. Kontrola očima — tři kroky, žádný nevynechávej

1. **Archy 3×3** — sedí scéna na ODPOVĚĎ, není tam nápis, je počet věcí správně.
2. **Arch dolních rohů** — vymyšlené podpisy a razítka jsou skoro vždycky v rohu
   a v celkovém náhledu se přehlédnou.
3. **Výřez 2× u každého podezřelého místa.** Dvakrát to zachránilo dobrý obrázek
   (protéza Terryho Foxe, kečupové brambůrky) a jednou odhalilo písmeno tam, kde
   náhled ukazoval tři tečky (bublina u krávy). Zvětšuj bottom-left i bottom-right roh
   zvlášť (sharp `extract` + `resize` 3–4×) — na 600px archu splyne podpis s texturou.

Vadné se posílají znovu přes `submit --only`. **Ořez použij jen na podpis těsně u kraje**
(horních 728 řádků, střed šířky 1274, zpět na 1344×768) — značka 50 px nad hranou se tím
neodstraní.

---

## 5. Co se opakovaně kazí (a co s tím)

- **Text si vždycky vyžádá PŘEDMĚT, který bez popisku nedává smysl** — cedule, dres,
  bublina, výloha, bankovka, kniha, mapa. Do zadání se nesmí dostat jako věc; buď se
  vynechá, nebo se popíše jako holá plocha („plain and unmarked“).
- **KONKRÉTNÍ SLOVO pojmenovávající instituci si samo řekne o vývěsku** (Švédsko: „bank“,
  „state liquor store“, „hotel“ vyrobily čitelné nápisy i přes obecný zákaz textu ve stylu) —
  slovo z promptu úplně odstranit, nahradit neutrálním popisem.
- **Slova „written“ a „letter“ nepatří do zadání ani v záporu** — `lint-irony` je hlásí
  jako chybu právem, model zákaz čte jako pozvánku.
- **Vymyšlený podpis malíře** je náhodná vada i přes zákaz v `STYL`; stačí poslat totéž
  zadání znovu — týká se to i zemí, kde defektní podíl byl jinak nízký (Maďarsko, Francie).
- **Když model třikrát vrátí tutéž nechtěnou věc, přestaň ji zakazovat a přestav scénu**
  tak, aby pro ni nebylo místo (Gagarinův skafandr, torontská tramvaj otočená zádí,
  Giro d'Italia — tiskařský stroj nahrazen horou mincí).
- **Počet, na kterém stojí fakt, piš výslovně** („exactly three …“), jinak model počítá po svém.
- **Notové osnovy, matematické rovnice a technické náčrtky NEJSOU zakázaný text** — lint
  na ně správně nereaguje (potvrzeno u Švédska, Maďarska).
- **Lint na „nepojmenovanou dominantu“ chce DOSLOVNOU frázi** („fills the frame“,
  „dominates the frame“, „centre-frame“) — jasný jeden hrdina ve scéně nestačí, kontrola
  je jinak slepá. Psát ji do první věty u KAŽDÉHO zadání (Nizozemsko: 60 z 63 to nejdřív
  nemělo a lint to správně odchytil).
- **Konkrétní slovo ABSTRAKTNÍHO pojmu si taky řekne o popisek, ne jen slovo instituce.**
  „a banner of independence“ (Nizozemsko) dostalo čitelné „INDEPENDENCE“ — stejný
  mechanismus jako „bank“/„hotel“ u Švédska, jen u pojmu, ne u budovy.
- **„Dollop“ (chomáč) bílé omáčky se modelu čte jako točená zmrzlina, ne jako majonéza
  nebo šlehačka.** Popsat TVAR přesně: „a thick smear… drooping down… in flat opaque
  ribbons“, ne „dollop“ — jinak obrázek popírá vlastní odpověď.
- **Konkrétní typ podniku (kavárna, bar, obchod) si domyslí nástěnnou tabuli s textem,
  i když ji zadání vůbec nezmiňuje.** Pomůže explicitní zápor v zadání interiéru
  („no menu board or price list anywhere in sight“).
- **Past nejde vyřešit jen „left blank“ vedle slova — u Švýcarska to čtyřikrát
  neuspělo.** Rozdíl je v tom, CO to slovo dělá: když popisuje TVAR/BARVU (blank
  banner, plain coin), `left blank` funguje. Když pojmenovává ÚČEL nebo TYP věci
  (espresso bar, export permit, quartz watch, franc coin), model napíše ten
  účel/typ na věc i přes `left blank` vedle. Řešení: to slovo z popisu úplně
  odstranit, ne jen doplnit zápor.
- **I NEPŘÍMÉ pojmenování stavu vyvolá popisek, ne jen přímé jméno předmětu.**
  Řecko: „needle pinned into an extreme zone“ vyrobilo čitelné „EXTREME ZONE“ na
  ciferníku, ačkoli šlo jen o popis POLOHY ručičky, ne o pojmenování přístroje.
  Pomohlo až úplně obecné „face completely blank and unmarked except for plain
  evenly spaced tick lines“.
- **Fakt PŘÍMO o písmenu/abecedě se musí ilustrovat BEZ zobrazení konkrétních
  písmen.** „Vowel-shaped sound bubbles“ (Řecko, otázka o abecedě) vyrobilo čitelná
  A/E/I/O/U. Funguje „abstract sound-wave ribbons“ — fakt jde ukázat i opisem.
- **Obecný popis vlajky („blue and white flag“) nestačí, když je otázka přímo o TÉ
  vlajce** — Řecko dostalo modrý čtverec s bílým křížem místo pruhované vlajky.
  Popsat barevné SCHÉMA výslovně, stejně jako u Německa/Rakouska 2026-09-12.
- **Jedna oprava umí vyrobit DVA po sobě jdoucí náhodné podpisy u téhož obrázku**
  (řecká Akropolis: 3 pokusy — druhý opravil text, ale přidal podpis). Po každé
  opravě kontroluj znovu archy i rohy, i když řešila jen jednu konkrétní vadu.
- **Podpis NEMUSÍ ležet v rohu** (Rumunsko, `ro-a-palac-demolice`): rukopisná klikyháka
  seděla na radlici buldozeru uprostřed dolní třetiny, takže arch rohů ji neukázal.
  Velká hladká plocha stroje nebo vozidla je druhé oblíbené místo — projdi ji výřezem.
- **Vada může být VKUSOVÁ a žádná kontrola ji nechytí** (Rumunsko, `ro-q-revoluce`):
  „toppled bronze statue lies broken on a city square" vyšlo jako realistické lidské
  tělo na dlažbě, u otázky o revoluci zakončené popravou. `not graphic` v zadání to
  nezachránilo. **U citlivého tématu scéna nesmí obsahovat ležící lidskou figuru vůbec** —
  pomohl prázdný podstavec se dvěma ulomenými botami, který je navíc vtipnější.
- **„Stopy nástrojů" (tool marks) si model vyplní libovolným geometrickým znakem**
  — u `ro-a-rosia-montana` vyšla značka připomínající hákový kříž. Popisovat TVAR
  („even parallel chisel grooves"), ne „značky".
- **Akt psaní ve scéně přinese text vždycky, ať se formuluje jakkoli** (Bulharsko,
  Ukrajina, Rumunsko — třikrát „ornate script too stylized to read"). Jediné, co
  spolehlivě funguje, je psaní ze scény ODSTRANIT: u rumunské cyrilice ruce ZAVÍRAJÍ
  starý svazek a sahají po novém, oba zavřené, žádná stránka není vidět.

---

## 6. Co dělat dál

1. **Dobít kredit a dogenerovat pět malajsijských obrázků** (bod 2 výš) — priorita číslo jedna.
2. **Odeslat Pákistán (42), Portugalsko (42), Saúdskou Arábii (42) a Dánsko (42) — zadání
   jsou hotová a po lintu**, pak pokračovat pořadím: Indonésie 41, Norsko 41, Filipíny 41…
3. Po každé zemi: zápis do CLAUDE.md (nejnovější nahoře, hned po intro řádku), `validate`,
   `test:offline`, commit + push na `claude/pokracujeme-e79708`.

**Nezapomeň:** obrázky jsou v repu (odhad dnes ~250 MB jen z tohohle sezení navíc),
takže při nasazení přibývají i do `dist/`. Limit Cloudflare Pages je 20 000 souborů,
dnes jich je odhadem ~1 900.
