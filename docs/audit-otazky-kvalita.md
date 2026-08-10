# Audit kvality otázek — edukační charakter a vtipnost hlášek

> Provedeno 2026-08-09, 8 paralelních agentů, pokryto všech **1279 otázek / 49 zemí**
> v `data/questions/*.json`. Zadání: (a) mají otázky edukační/zvídavostní charakter,
> ne jen suchá fakta? (b) jsou hlášky u správných i špatných odpovědí vtipné?

---

## Nejdůležitější zjištění: `quip_wrong` je systémově nevtipné

Tohle není pár ojedinělých případů — je to vzorec, který se **shodně objevil ve všech 8
nezávislých reportech** napříč všemi 49 zeměmi. `quip_wrong` (hláška u špatné odpovědi) je
téměř vždy jen suchý přepis správné odpovědi + doplňkový fakt z `explanation`, bez ironie,
nadsázky nebo pointy — zatímco `quip_correct` (hláška u správné odpovědi) je u většiny zemí
skutečně vtipné a nese hák.

Příklad vzorce (Rusko, `ru-q-kreml`):
> `quip_wrong`: *„Je to opevněný komplex s pěti paláci a čtyřmi katedrálami — dnešní sídlo
> ruského prezidenta."* — nula humoru, jen fakt.

U Ruska je vzorec obzvlášť čitelný: prvních **10 otázek** v souboru (nejstarší, psané jako
první) mají `quip_wrong` vtipné — od 11. otázky dál (**103 z 113**) je už jen věcné shrnutí.
To naznačuje, že `quip_wrong` dostal důkladnou pozornost jen u prvního psaní, pak se u dalších
zemí/dávek otázek psal už jen mechanicky.

**Odhad rozsahu:** z 1279 otázek má vtipné `quip_wrong` zhruba **80–150** (6–12 %), zbytek
(cca 90 %+) je plochý. Je to zdaleka nejvýraznější a nejlacnější oprava k udělání — jedno
systémové pravidlo/průchod přepíše naráz drtivou většinu appky.

**Návrh opravy:** psát `quip_wrong` ve stejném rejstříku jako `quip_correct` (metafora,
ironie, nadsázka, kontrast) a **nikdy ho neodvozovat kopírováním `explanation`** — ideálně
mířit na to, proč byla špatná odpověď lákavá/pochopitelná, ne jen zopakovat tu správnou.

---

## Vážnější nález: hlášky, které vůbec nesouvisí s testovaným faktem

Tohle už není jen „nevtipné", ale věcně špatně napojené — hláška mluví o jiném faktu, než na
který se otázka ptá. Jde o skutečné bugy v datech, ne jen o styl:

| Otázka | Problém |
|---|---|
| `es-q-alhambra` | Otázka testuje význam jména „červená pevnost", `quip_correct` mluví o architektuře zvenku/uvnitř — nesouvisí |
| `es-q-picos` | Otázka testuje rok založení (nejstarší park Španělska), `quip_correct` mluví o poloze u moře |
| `ec-q-banana` | `quip_correct`: *„Kde banány, tam peníze. A kde peníze, tam fotbal."* — nelogický skok k fotbalu bez opory v faktu |
| `gr-q-velikonoce` | Otázka je o barvení vajec na červeno, `quip_correct` mluví o půlnočních svíčkách — jiný zvyk |
| `il-q-hebrejske-pismo` | Otázka o směru psaní, `quip_correct` mluví o chybějících samohláskách |
| `se-q-ombudsman` | `quip_correct` odbíhá k slovu „smörgåsbord" — nesouvisí s ombudsmanem |

**Návrh:** tohle opravit přednostně před stylistickým laděním `quip_wrong` — je to věcná chyba,
ne jen slabý vtip.

---

## Konkrétní datové chyby

- **`cl-q-dicoba`** — gramatická shoda rodu: *„Jedna hlasovací lístka..."* → má být *„Jeden
  hlasovací lístek..."*
- **`pe-q-kechua-slova`** — podezřelý tvar *„Inká"* (pravděpodobně překlep za „Inkové"/„Říše Inků")
- **`ec-q-montalvo`** — `quip_correct` cituje přímou řeč *„Moje pero ho zabilo," řekl Montalvo...*
  bez dokladu v `explanation`/zdroji; pokud je vymyšlená, neměla by být podaná jako doslovný citát

---

## Duplicity / obsahové překryvy uvnitř jedné země

Několik zemí má dvě různé otázky postavené na prakticky stejném faktu — plýtvání místem,
které by šlo využít na jiné téma:

- **Kanada (ca)** — trojnásobný překryv: `ca-q-bilingualismus`, `ca-q-anglictina-francouzstina`,
  `ca-q-place-bilingual` (všechny o dvojjazyčnosti); dále `ca-q-hokej`/`ca-q-sport-hokej`;
  `ca-q-yukon`/`ca-q-zlata-horeccka` (obě o zlaté horečce na Klondiku)
- **Švýcarsko (ch)** — `ch-q-rosti` / `ch-q-rostigraben` (stejný fakt, dvě sekce)
- **Pákistán (pk)** — `pk-q-truckoví-umelci` / `pk-q-truck-art`
- **Filipíny (ph)** — `ph-q-box` / `ph-q-pacquiao`
- **Egypt (eg)**, **Vietnam (vn)** — mírné tematické překryvy, menší závažnost

---

## Žebříček zemí podle kvality (odhad z reportů)

### Edukační charakter (a) — nejsilnější
Vietnam (~96–100 %), Slovensko (96 %), Nizozemsko (96 %), Itálie (96 %), Švýcarsko (93 %),
Bulharsko (89 %), Rakousko (89 %), Saúdská Arábie (93 %), Rusko (95 %), Maďarsko (93 %),
Indonésie (93 %)

### Edukační charakter (a) — nejslabší, stojí za přepracování
- **Gabon** — jen ~15/27 (56 %), nejslabší soubor celého auditu
- **Severní Korea** — ~18/27 (67 %), řada vágních otázek bez konkrétního faktu (`kp-q-fotbal`,
  `kp-q-rodina`, `kp-q-malba`)
- **Kanada** — ~36/49 (73 %), navíc duplicity výše
- **Indie** — ~19–20/27 (73 %)
- **Filipíny** — ~22/27 (81 %)
- **Pákistán** — ~18/27 (67 %)

### Vtipnost hlášek (b) — nejsilnější
Slovensko (93 %), Vietnam (~96 %), Jižní Korea (93 %), Rusko — `quip_correct` (~100 %,
`quip_wrong` viz výše), Švýcarsko, Bulharsko, Maďarsko, Indonésie (~93 %)

### Vtipnost hlášek (b) — nejslabší
- **Gabon** — jen ~5/27 (19 %), většina zní jako popisky z cestovního průvodce
- **Indie** — ~14–15/27 (55 %), nadužívá šablonu „X je jako Y" (`in-q-tiger`, `in-q-yoga`,
  `in-q-bollywood`, `in-q-hindi`...)
- **Pákistán** — ~13/27 (48 %), otřepaná klišé („cesta byla trnitá", „jako náboženství")
- **Filipíny** — ~44 %, podobná klišé metafora „X je jako Y"
- **Japonsko** — jen 5/9 (56 %)
- **Malajsie** — ~44 %

---

## Plné reporty po dávkách zemí

<details>
<summary><b>Dávka 1: Argentina, Rakousko, Austrálie, Bulharsko, Brazílie, Kanada, Švýcarsko</b></summary>

### Argentina (26 otázek)
**Verdikt:** (a) ~80 % v pořádku. (b) `quip_correct` vtipný u ~20/26, `quip_wrong` vtipný jen 6–8/26.

Problematické: `ar-q-ba` (otřepané „Paříž Jižní Ameriky"), `ar-q-revolucion` (holé datum),
`ar-q-fangio` (klišé „jeden z největších v historii" — opakuje se i u `br-q-pele`),
`ar-q-atletika` (generická „bohatá olympijská tradice"), `ar-q-pampas`, `ar-q-parana`,
`ar-q-guarani` (všechny `quip_wrong` bez nadsázky).

### Rakousko (27 otázek)
**Verdikt:** (a) ~89 %. (b) `quip_correct` často vtipný, `quip_wrong` vtipný jen 8–10/27.

Problematické: `at-q-grossglockner` (holé číslo výšky), `at-q-mozart` (všeobecně známý fakt
bez překvapení), `at-q-ctyriskok`, `at-q-opernball` (oba `quip_wrong` jen kopie `explanation`).

### Austrálie (9 otázek)
**Verdikt:** (a) 7/9. (b) `quip_correct` dobrý, `quip_wrong` nejslabší článek.

Problematické: `au-q-prvni-flotila` (nízký „aha" efekt), `au-q-vegemite`, `au-q-slang`
(oba `quip_wrong` bez vtipu).

### Bulharsko (27 otázek)
**Verdikt:** (a) ~89 %, nejsilnější ze sedmi v této dávce. (b) `quip_wrong` vtipný jen 7–9/27.

Problematické: `bg-q-cerne-more` (i `quip_correct` působí vynuceně), `bg-q-banica`, `bg-q-etnika`.

### Brazílie (27 otázek)
**Verdikt:** (a) ~85 %. (b) `quip_wrong` vtipný jen 7–9/27.

Problematické: `br-q-pele` (klišé „jeden z největších v historii"), `br-q-oscar`, `br-q-carioca`.

### Kanada (49 otázek) — nejslabší v této dávce
**Verdikt:** (a) ~73 %, nejnižší v této dávce + duplicity (viz sekce výše). (b) `quip_wrong`
vtipné pod 15 %.

Problematické: `ca-q-rybari` (téměř tautologie — „Atlantik má jiné ryby než Pacifik"),
`ca-q-hudba`, `ca-q-tanec`, `ca-q-literatura` (generické výčty), `ca-q-atletika-outdoor`,
`ca-q-immigration` (banální odpovědi „odevšad"), `ca-q-lyzovani`, `ca-q-baseball`.

### Švýcarsko (27 otázek)
**Verdikt:** (a) ~93 %, nejsilnější v dávce. (b) `quip_wrong` vtipný jen 8–10/27.

Problematické: duplicita `ch-q-rosti`/`ch-q-rostigraben` (viz výše), `ch-q-federer`
(celosvětově známý fakt), `ch-q-mario-botta`, `ch-q-ctyri-jazyky`.

</details>

<details>
<summary><b>Dávka 2: Chile, Čína, Česko, Německo, Ekvádor, Egypt, Španělsko</b></summary>

Systémová poznámka: `quip_wrong` u všech 161 otázek této dávky jen doslovně opakuje
`explanation`, bez vtipu — necitováno otázku po otázce.

### Chile (26 otázek)
**Verdikt:** (a) ~23/26. (b) `quip_correct` nejlepší z dávky (~24/26).

Problematické: `cl-q-dicoba` (gramatická chyba rodu, viz výše), `cl-q-cueca` (plochá fráze),
`cl-q-neruda` (zajímavost schovaná jen v quipu, ne v `explanation`), `cl-q-futbal`.

### Čína (11 otázek) — nejslabší v dávce
**Verdikt:** (a) ~7/11, nejvíc „učebnicových" faktů bez háku ze všech zemí v dávce.
(b) vtipné jen 6–7/11.

Problematické: `cn-q-konfucius`, `cn-q-kaligrafie`, `cn-q-cinska-zed`, `cn-q-znaky`.

### Česko (26 otázek)
**Verdikt:** (a) ~24/26, výborné háky (Sněžka, husitské pojmenování, Čapkův robot).
(b) ~23/26.

Problematické: `cz-q-zatopek` (quip jen opakuje otázku), `cz-q-vanocni-kapr`, `cz-q-masaryk`.

### Německo (29 otázek)
**Verdikt:** (a) ~25/29. (b) ~26/29.

Problematické: `de-q-vestfalsky-mir`, `de-q-bauhaus` (očekávaný fakt), `de-q-schumacher`.

### Ekvádor (29 otázek)
**Verdikt:** (a) ~26/29, unikátní háky (Yasuní, Lonesome George). (b) ~26/29.

Problematické: `ec-q-banana` (nelogický skok k fotbalu, viz výše), `ec-q-cuy`,
`ec-q-cloudforest` (vágní quip), `ec-q-montalvo` (možný fabrikovaný citát, viz výše).

### Egypt (11 otázek)
**Verdikt:** (a) ~9/11. (b) ~9/11.

Problematické: `eg-q-salah` (generická sportovní fráze), mírný překryv `eg-q-rosetta`/`eg-q-hieroglyfy`.

### Španělsko (29 otázek) — nejsilnější v dávce
**Verdikt:** (a) ~27/29 (Sagrada Família, Altamira, Guernica). (b) ~26/29.

Problematické: `es-q-alhambra`, `es-q-picos` (nesouvisející quip, viz výše), `es-q-en-s-tildou`
(samozřejmý fakt).

</details>

<details>
<summary><b>Dávka 3: Fidži, Francie, Gabon, Spojené království, Řecko, Maďarsko, Indonésie</b></summary>

### Fidži (9 otázek)
**Verdikt:** (a) ~7/9. (b) jen ~4/9 vtipných.

Problematické: `fj-q-nezavislost` (holý koloniální fakt), `fj-q-indofidzijci`, `fj-q-ostrovy`,
`fj-q-jazyky`.

### Francie (27 otázek)
**Verdikt:** (a) ~25/27. (b) ~22–23/27.

Problematické: `fr-q-mont-blanc` (zajímavost jen v quipu, ne v `explanation`), překryv
`fr-q-14-juillet`/`fr-q-bastila`, `fr-q-ms1998`.

### Gabon (27 otázek) — nejslabší soubor celého auditu
**Verdikt:** (a) jen ~15/27 (56 %). (b) jen ~5/27 (19 %) — většina quipů zní jako popisky
z cestovního průvodce nebo jídelního lístku.

Problematické (a): `ga-q-francouzstina`, `ga-q-nezavislost`, `ga-q-fotbal`, `ga-q-rezbarstvi`,
`ga-q-maniok`, `ga-q-prales`, `ga-q-aubameyang`, `ga-q-fang-jazyk`, `ga-q-lope`, `ga-q-gorily`.
Problematické (b): `ga-q-libreville`, `ga-q-gorily`, `ga-q-prales`, `ga-q-schweitzer`,
`ga-q-poulet-nyembwe`, `ga-q-poisson-braise`, `ga-q-rezbarstvi`, `ga-q-vesnice`,
`ga-q-fang-masky`, `ga-q-tradicni-zapas`.

### Spojené království (27 otázek)
**Verdikt:** (a) ~20/27. (b) ~20/27.

Problematické: `gb-q-premier` (vágní, skoro tautologická — nejslabší v souboru),
`gb-q-shakespeare`, `gb-q-newton`, `gb-q-beatles` (biografická trivia bez detailu),
`gb-q-changingsteguard`, `gb-q-cockney`, `gb-q-scones`.

### Řecko (27 otázek)
**Verdikt:** (a) ~23/27. (b) ~24/27, jeden z nejlepších v humoru (akropolis, meteora,
santorini).

Problematické: `gr-q-velikonoce` (nesouvisející quip, viz výše), `gr-q-akropolis`, `gr-q-olymp`.

### Maďarsko (27 otázek) — nejsilnější v dávce
**Verdikt:** (a) ~25/27. (b) ~25/27 (debrecin, rubik, betyar, paprika).

Problematické: `hu-q-kalocsa`, `hu-q-liszt` (zajímavost jen v quipu), `hu-q-hosszu`.

### Indonésie (27 otázek) — nejsilnější v dávce
**Verdikt:** (a) ~25/27. (b) ~25/27 (nyepi, baduy, habibie, toraja-pohreb).

Problematické: `id-q-wayang-kulit`, `id-q-batik` (standardní popisné otázky, ne vyloženě špatné).

</details>

<details>
<summary><b>Dávka 4: Izrael, Indie, Itálie, Japonsko, Keňa, Severní Korea, Jižní Korea</b></summary>

### Izrael (27 otázek)
**Verdikt:** (a) 26/27 (96 %). (b) `quip_correct` ~25/27.

Problematické: `il-q-falafel` (banální bez háku), `il-q-hebrejske-pismo` (nesouvisející quip,
viz výše).

### Indie (27 otázek) — nejslabší v humoru z dávky
**Verdikt:** (a) ~19–20/27 (73 %). (b) jen ~14–15/27 (55 %) — nadužívá šablonu „X je jako Y".

Problematické (a): `in-q-agra-fort`, `in-q-ganges`, `in-q-hindi` (holá fakta bez háku).
Problematické (b) — klišé „X je jako Y": `in-q-tiger`, `in-q-yoga`, `in-q-bollywood`,
`in-q-hindi`, `in-q-anglictina`, `in-q-gandhi`, `in-q-ashoka`, `in-q-nehru`, `in-q-republika`
(poslední je skoro tautologie).

### Itálie (27 otázek) — nejsilnější v dávce
**Verdikt:** (a) 26/27 (96 %). (b) ~25/27 (93 %) — nejkvalitnější posuzovaný soubor.

Drobné: `it-q-gardske-jezero`.

### Japonsko (9 otázek)
**Verdikt:** (a) 9/9. (b) jen 5/9 (56 %).

Problematické: `jp-q-fudzi`, `jp-q-ainu`, `jp-q-meidzi`, `jp-q-origami` (popisné, ne vtipné —
srovnej s dobrým `jp-q-sushi`).

### Keňa (9 otázek)
**Verdikt:** (a) 9/9. (b) ~6/9.

Problematické: `ke-q-rift-valley` — **věcně matoucí metafora** (kyslíková maska evokuje
přísun kyslíku, ale ve vysoké nadmořské výšce je ho naopak míň — metafora míří proti smyslu
faktu), `ke-q-svahilstina`, `ke-q-ugali`.

### Severní Korea (27 otázek) — nejslabší v dávce
**Verdikt:** (a) ~18/27 (67 %) — řada vágních otázek bez konkrétního faktu. (b) ~19/27 (70 %).

Problematické (a): `kp-q-fotbal` (nejslabší otázka vzorku — bezobsažné tvrzení platné
o fotbalu kdekoli na světě), `kp-q-rodina`, `kp-q-malba`, `kp-q-mozaiky`, `kp-q-taekwondo`,
`kp-q-hanbok`, `kp-q-kimchi-kultura`, `kp-q-chuseok`, `kp-q-pozdravy`.
Problematické (b): `kp-q-tangun`, `kp-q-pozdravy`, `kp-q-dmz` (novinářské klišé), `kp-q-taekwondo`.
Pozitivní výjimky: `kp-q-hangul`, `kp-q-naengmyeon`.

### Jižní Korea (27 otázek)
**Verdikt:** (a) ~25/27 (93 %). (b) ~25/27 (93 %) — spolu s Itálií nejkvalitnější.

Drobné: `kr-q-kim-yuna` (kostrbatá metafora), `kr-q-seoraksan`.

</details>

<details>
<summary><b>Dávka 5: Mongolsko, Mexiko, Malajsie, Nizozemsko, Nový Zéland, Peru, Filipíny</b></summary>

Systémová poznámka: `quip_wrong` u všech 153 otázek jen zopakuje odpověď bez vtipu.

### Mongolsko (27 otázek)
**Verdikt:** (a) ~89 % (24/27). (b) `quip_correct` ~55 %.

Problematické: `mn-q-step`, `mn-q-naadam-kultura`, `mn-q-malba`, `mn-q-kostym`, `mn-q-buuz`
(sentimentální klišé typu „jako polibek od babičky"), `mn-q-rise` (patos místo vtipu).

### Mexiko (9 otázek)
**Verdikt:** (a) 9/9. (b) ~4/9 vtipných, spíš esejistický tón.

Problematické: `mx-q-tenochtitlan` (mini přednáška), `mx-q-frida` (promarněný tragikomický
potenciál faktu).

### Malajsie (27 otázek)
**Verdikt:** (a) ~93 %. (b) jen ~44 % vtipných.

Problematické: `my-q-lee-chong-wei` (promarněný silný fakt — 3× stříbro, nikdy zlato),
`my-q-badminton-my`, `my-q-nicol-david`, `my-q-salam`.

### Nizozemsko (27 otázek) — nejsilnější v dávce (a)
**Verdikt:** (a) ~96 % (Rembrandtův bankrot, van Gogh prodal jediný obraz). (b) ~52 %.

Problematické: `nl-q-kinderdijk`, `nl-q-totalni-fotbal`, `nl-q-market-garden`.

### Nový Zéland (9 otázek)
**Verdikt:** (a) 9/9. (b) jen ~44 %.

Problematické: `nz-q-all-blacks`, `nz-q-te-reo`, `nz-q-ta-moko`, `nz-q-maorove` (všechny
`quip_correct` jen parafrázují odpověď).

### Peru (27 otázek)
**Verdikt:** (a) ~89 %. (b) ~44 %, spíš „dramatické zkratky" než vtip.

Problematické: `pe-q-semana`, `pe-q-mario`, `pe-q-kechua-slova` (podezřelý tvar „Inká",
viz výše), `pe-q-paleta`.

### Filipíny (27 otázek) — nejslabší v dávce
**Verdikt:** (a) ~81 %, nejvíc triviálních otázek v dávce (5/27). (b) ~44 %, nadužívá
klišé „X je jako Y".

Problematické (a): `ph-q-moderni` (vágní, sedí na umělce jakékoli země), `ph-q-fiesta`,
`ph-q-basketbal`, `ph-q-volejbal`, duplicita `ph-q-box`/`ph-q-pacquiao`.
Problematické (b): `ph-q-rizal`, `ph-q-pacquiao`, `ph-q-rodina`, `ph-q-prejata`,
`ph-q-anglictina`, `ph-q-lechon`, `ph-q-nezavislost` (promarněná ironie — USA uznaly
nezávislost Filipín právě 4. července, symbolická shoda s americkým Dnem nezávislosti,
kterou otázka vůbec nevyužívá).

</details>

<details>
<summary><b>Dávka 6: Pákistán, Polsko, Rumunsko, Saúdská Arábie, Švédsko, Slovensko, Thajsko</b></summary>

### Pákistán (27 otázek) — nejslabší v dávce
**Verdikt:** (a) ~67 % (18/27). (b) nejslabší ze všech 49 zemí v celém auditu — jen ~48 %
(13/27), většina jsou poetické/sentimentální fráze, ne vtip.

Problematické: `pk-q-lahore-fort`, `pk-q-karakoram` (generické básnické klišé),
`pk-q-jinnah`, `pk-q-sufi`, `pk-q-textil` (recyklované klišé „stopa"), `pk-q-biryani`,
`pk-q-kriket` („víc než sport, to je svátek" — otřepaná šablona), `pk-q-hokej` („jako
náboženství"), `pk-q-vznik` („cesta byla trnitá"), duplicita `pk-q-truckoví-umelci`/
`pk-q-truck-art`.

### Polsko (27 otázek) — nejsilnější v dávce spolu se Slovenskem
**Verdikt:** (a) ~89 % (24/27). (b) ~85 % (23/27) — Chopinovo srdce, „szukać" falešný přítel,
brouk ze Szczebrzeszyna.

Drobné: `pl-q-gorale`, `pl-q-oscypek`.

### Rumunsko (27 otázek)
**Verdikt:** (a) ~85 %. (b) ~81 % (Brâncuși, Säpânța veselý hřbitov).

Problematické: `ro-q-coanda` (technický/suchý), `ro-q-enescu` (předvídatelná odpověď),
`ro-q-slovanske-slova` (suchá statistika).

### Saúdská Arábie (27 otázek)
**Verdikt:** (a) ~93 % (madžlis, Ibn Saúd). (b) ~89 %.

Drobné: `sa-q-datle`, `sa-q-velbloudi-dostihy`.

### Švédsko (27 otázek)
**Verdikt:** (a) ~81 %. (b) ~78 % (Nobel/dynamit, Zlatan).

Problematické: `se-q-laponia` (generický kontrast nesouvisející se Sámy), `se-q-polarni-zare`
(encyklopedicky všeobecně známé), `se-q-ombudsman` (nesouvisející quip, viz výše),
`se-q-neutralita` (slogan místo vtipu).

### Slovensko (27 otázek) — nejsilnější soubor z celého auditu
**Verdikt:** (a) 96 % (26/27). (b) 93 % (25/27) — Štefánik „LinkedIn životopis", Sagan
„krejčí musel mít stálou zakázku", halušky.

Jediné drobné: `sk-q-cestina` (pro Čecha samozřejmost).

### Thajsko (27 otázek)
**Verdikt:** (a) ~85 %. (b) ~81 % (Jim Thompson, jméno Bangkoku, pad thai).

Problematické: `th-q-doi-inthanon`, `th-q-rama-ix`, `th-q-ajutthaja` (generický typ otázky).

</details>

<details>
<summary><b>Dávka 7: Turecko, Tchaj-wan, Ukrajina, USA, Vietnam, JAR</b></summary>

### Turecko (27 otázek)
**Verdikt:** (a) ~93 % (25/27). (b) `quip_correct` ~90 %.

Problematické: `tr-q-kebab` (moc obecné), `tr-q-basketbal-2010` (jen shrnutí bez háku).

### Tchaj-wan (27 otázek) — nejslabší v dávce
**Verdikt:** (a) ~81 % (22/27). (b) i `quip_correct` slabší než v ostatních zemích dávky.

Problematické (a): `tw-q-tai-tzu-ying` (vágní fráze bez čísla), `tw-q-baseball` (holá
trivialita), `tw-q-stolni-tenis`, `tw-q-nocni-trhy`, `tw-q-cajova-kultura`.
Problematické (b): `tw-q-baseball`, `tw-q-stolni-tenis`, `tw-q-jusan`, `tw-q-cyklistika-huandao`
(popisné, „cestovní bulletin" tón).

### Ukrajina (27 otázek) — nejsilnější v dávce
**Verdikt:** (a) 26/27 — nejsilnější co do „aha" faktů v dávce (Koroljov, Malevič, boršč na
UNESCO seznamu ohroženého dědictví). (b) jeden z nejlepších v celém auditu.

Drobné: `ua-q-karpaty` (zajímavost jen v quipu, ne v `explanation`), `ua-q-cernozem`.

### USA (9 otázek)
**Verdikt:** (a) 8/9. (b) nejkonzistentněji vtipný ze všech 49 zemí (Rushmore citát,
„elevator vs. lift").

Problematické: `us-q-nba` (samozřejmost bez překvapení).

### Vietnam (27 otázek) — jeden z nejsilnějších v celém auditu
**Verdikt:** (a) 26–27/27. (b) nejlepší `quip_correct` z celého auditu (ironické kontrasty).

Drobná poznámka: mírný tematický překryv `vn-q-da-cau`/`vn-q-cau-may`.

### JAR (9 otázek)
**Verdikt:** (a) 9/9 (Ndebele malby, Mandela v dresu Springboks). (b) `quip_correct` silný,
`quip_wrong` opět jen flat.

</details>

<details>
<summary><b>Dávka 8: Rusko (samostatně, 113 otázek)</b></summary>

**Verdikt:** (a) 95 % (107–108/113). (b) `quip_correct` vtipné téměř u všech 113 otázek —
appka tu funguje skvěle. Ale `quip_wrong` je vtipné jen u prvních **10** otázek souboru
(`ru-q-hlavni-mesto` až `ru-q-bajkal-hloubka`) — u zbylých **103 (91 %)** je čistě věcné.

Kompletní seznam id s plochým `quip_wrong`, podle sekce:
- **Místa:** `ru-q-kreml`, `ru-q-sachalin`, `ru-q-ural`, `ru-q-rozloha`, `ru-q-sochi`,
  `ru-q-kazan`, `ru-q-vladivostok`, `ru-q-murmansk`, `ru-q-norilsk`, `ru-q-volha-matuska`,
  `ru-q-novosibirsk`
- **Příroda:** `ru-q-ojmjakon`, `ru-q-tajga`, `ru-q-tygr`, `ru-q-permafrost`, `ru-q-gejzir`,
  `ru-q-tundra`, `ru-q-ladoga`, `ru-q-elbrus-evropa`, `ru-q-jenisej`, `ru-q-medved`,
  `ru-q-cernozem`
- **Jídlo:** `ru-q-borsc`, `ru-q-kaviar`, `ru-q-olivier`, `ru-q-vodka`, `ru-q-samovar`,
  `ru-q-pirozky`, `ru-q-maslenice`, `ru-q-kvas`, `ru-q-cerny-chleba`, `ru-q-sci`, `ru-q-pernik`
- **Historie:** `ru-q-gagarin`, `ru-q-revoluce-1917`, `ru-q-ivan-hrozny`, `ru-q-rurik`,
  `ru-q-mongol`, `ru-q-sssr`, `ru-q-perestrojka`, `ru-q-napoleon`, `ru-q-romanovci`,
  `ru-q-leningrad`, `ru-q-petrohrad`
- **Lidé:** `ru-q-kozaci`, `ru-q-dacha`, `ru-q-pravoslavi`, `ru-q-jakuti`, `ru-q-starovery`,
  `ru-q-urbanizace`, `ru-q-narody`, `ru-q-nenci`, `ru-q-kalmykia`, `ru-q-hustota`,
  `ru-q-porodnost`
- **Kultura & tradice:** `ru-q-matrjoska`, `ru-q-usanka`, `ru-q-ded-moroz`, `ru-q-balalajka`,
  `ru-q-baba-jaga`, `ru-q-bana`, `ru-q-chochloma`, `ru-q-gzhel`, `ru-q-palech`,
  `ru-q-bogatyr`, `ru-q-kupala`, `ru-q-chleb-sul`
- **Umění:** `ru-q-vasil-blazeny`, `ru-q-louskacek`, `ru-q-faberge`, `ru-q-bolsoj`,
  `ru-q-dostojevskij`, `ru-q-rublev`, `ru-q-labuti-jezero`, `ru-q-kandinskij`, `ru-q-repin`,
  `ru-q-cechov`, `ru-q-rachmaninov`, `ru-q-ikony`
- **Sport:** `ru-q-sachy`, `ru-q-hokej`, `ru-q-karelin`, `ru-q-krasobrusleni`, `ru-q-sambo`,
  `ru-q-soci2014`, `ru-q-bandy`, `ru-q-gymnastika`, `ru-q-moskva1980`, `ru-q-fotbal`,
  `ru-q-tenis`, `ru-q-bezky`
- **Jazyk & slova:** `ru-q-azbuka`, `ru-q-patronymikum`, `ru-q-mamut`, `ru-q-pady`,
  `ru-q-ty-vy`, `ru-q-car`, `ru-q-rozsah`, `ru-q-pismena`, `ru-q-zdrobneliny`,
  `ru-q-vid-slovesa`, `ru-q-sponove-sloveso`, `ru-q-slovosled`

Slabý edukační obsah (a): `ru-q-hlavni-mesto` (holé hlavní město bez háku), `ru-q-borsc`
(bez historky), `ru-q-pravoslavi` (nejplošší otázka souboru — bez čísla/zvratu),
`ru-q-samovar`. Hraniční: `ru-q-balalajka`, `ru-q-urbanizace`.

Vedlejší postřeh: `distractor_quips`/`golden_wrong`/`golden_quip` (volitelná pole) se
využívají jen u 2 otázek ze 113 — mechanismus evidentně funguje dobře, ale je masivně
nevyužitý.

</details>

---

## Doporučené pořadí oprav

1. **`quip_wrong` napříč appkou** — nejvyšší páka, jedno systémové pravidlo opraví ~90 %
   z 1279 otázek najednou.
2. **6 nesouvisejících hlášek** (es-q-alhambra, es-q-picos, ec-q-banana, gr-q-velikonoce,
   il-q-hebrejske-pismo, se-q-ombudsman) — věcné bugy, ne jen styl.
3. **3 konkrétní datové chyby** (cl-q-dicoba gramatika, pe-q-kechua-slova překlep,
   ec-q-montalvo možný fabrikovaný citát).
4. **Duplicity** — sloučit nebo nahradit (Kanada 3×, Švýcarsko, Pákistán, Filipíny).
5. **Nejslabší země** — Gabon, Severní Korea, Pákistán, Indie, Filipíny, Kanada, Tchaj-wan,
   Čína, Japonsko, Malajsie, Nový Zéland, Mexiko, Peru, Mongolsko — buď přepsat slabé otázky/
   hlášky, nebo je nahradit úplně.
