# Předání: ilustrace k otázkám

Sepsáno **12. září 2026** (aktualizováno **22. 9.** po Finsku, Gabonu, Peru, USA,
Austrálii a částečně Brazílii). Doplňuje [predavaci-protokol.md](predavaci-protokol.md);
poučení a rozhodnutí jsou v [CLAUDE.md](../CLAUDE.md) pod datem **2026-09-11** (formát,
Rusko), **2026-09-12** (Kanada, Německo+Rakousko, Itálie, Británie, Maďarsko, Švédsko,
Francie, Slovensko, Nizozemsko), **2026-09-13** (Švýcarsko, Řecko, Bulharsko, Španělsko,
Ukrajina, Rumunsko, Thajsko, Turecko, Irsko, Izrael, Jižní Korea), **2026-09-21**
(Malajsie, Pákistán, Portugalsko, Saúdská Arábie, Dánsko, Indonésie, Norsko, Filipíny,
Argentina, Belgie) a **2026-09-22** (Finsko, Gabon, Peru, USA, Austrálie, Brazílie 33/38).

---

## 0. NA DRUHÉM POČÍTAČI — nejdřív tohle

1. **Stáhnout větev a přepnout se na ni:**
   ```bash
   git fetch origin
   git checkout claude/pokracujeme-e79708
   git pull
   npm install
   ```
   Poslední commit ilustrací je Brazílie (částečná); `git log --oneline -3` musí ukázat
   commit „Brazilie: 33/38 ilustraci, kredit Gemini API dosel…“. **Pracovní strom má být
   čistý** — žádná dávka neběží a `.batch-irony.json` ukazuje na dokončenou dávku.
2. **Vložit klíč Gemini do `.dev.vars`** (gitignorovaný, na druhý stroj NEPŘEJDE). Vzor je
   v `.dev.vars.example`; řádek `GEMINI_API_KEY=AQ.…`. **DOJDE KREDIT — nutné dobít na
   `ai.studio/projects` PŘED pokračováním**, jinak `submit` skončí hned chybou 402
   „prepayment credits are depleted“.
3. **Ověřit, že všechno sedí** (čísla k porovnání):
   ```bash
   npm run validate
   npm run test:offline
   npm run lint-irony
   ```
   `validate` 0 chyb, `test:offline` 874 kontrol, `lint-irony` 0 chyb. Bez ilustrace **561**.
4. **Dokončit Brazílii** — 5 obrázků čeká na dobití kreditu:
   ```bash
   node scripts/batch-irony-images.js submit --only br-q-candomble,br-k-vlajka,br-q-otroctvi,br-q-senna,br-k-iguazu-falls
   ```
   Zadání jsou už opravená a v datech (commitnuto), tohle jen znovu odešle.
5. **Pak pokračovat Chile** (zadání hotová, zlintovaná, commitnutá — jen čekají na `submit --cc cl`),
   pak Ekvádor, Fidži, Indie, Keňa (stejný stav — zadání hotová, čekají na obrázky).
   Teprve po nich psát zadání pro další novou zemi.

---

## 1. Stav k 22. 9. 2026

| Položka | Hodnota |
|---|---|
| Otázek celkem | 3 742 |
| Bez ilustrace | **561** |
| Hotovo 22. 9. | Finsko 42/42, Gabon 41/41, Peru 40/40, USA 40/40, Austrálie 38/38, Brazílie 33/38 (5 čeká na kredit) |
| **Zadání HOTOVÁ, čekají na obrázky** | Chile 40, Ekvádor 40, Fidži 39, Indie 39, Keňa 39 — `lint-irony` 0 chyb, commitnuto, stačí `submit --cc xx` |
| Klíč Gemini | **DOŠEL KREDIT** — nutné dobít na `ai.studio/projects`, jinak `submit` vrátí 402 hned. |
| Formát | 16:9, **1344×768**, JPG q84, ~222 kB/kus |
| Cena | ~$0,034 za obrázek v dávce |

**Kredit Gemini API se už dvakrát vyčerpal** (429 „prepayment credits are depleted“) —
řešení je vždycky dobití na `ai.studio/projects`, skript ani appka s tím nic neudělají.

**Dávky o jediném/pár obrázcích někdy trvají 30+ minut** — Batch API negarantuje čas.
Na čekání slouží `node scripts/ilustrace/cekej-davka.js` (volá `status` jednou za minutu
a skončí, jakmile je hotovo), puštěný na pozadí.

**Skript drží JEN JEDNU dávku naráz** (`.batch-irony.json`), takže země jdou postupně:
`submit` → počkat → `fetch` → kontrola → opravná dávka → commit → další země.

---

## 2. PRVNÍ KROK PŘÍŠTÍ SESSION: napsat zadání pro Finsko (a další)

Čtyři připravené sady (Pákistán, Portugalsko, Saúdská Arábie, Dánsko) jsou vyčerpané.
Další země nemají `irony_prompt`, takže se nejdřív píšou zadání (v session, zadarmo),
pak `npm run lint-irony` (0 chyb), a teprve pak `submit --cc id`.

**Na co si při psaní zadání dát pozor — nové z 21. 9.:**
- **Vlajka: jmenuj ODSTÍN, který sedí do palety, a řekni, že má být vidět** („deep brick red
  … the red clearly reading as red“). Samotné „red and white“ tlumená paleta přebije
  (malajsijská vlajka vyšla dvakrát krémově-tyrkysová).
- **Sportovní dres si řekne o logo výrobce** (Nike, Puma) i přes „no marking of any kind“.
  Dres ukazovat co nejméně; když už, hlídat logo stejně jako podpis.
- **Zadní část vozidla = SPZ.** Náklaďák ukazovat z boku.
- **Slovo o účelu nebo typu věci se propíše jako nápis:** „new funding“ → „NEW FUNDS“,
  „contract“ → „CONTRACT“, „past its stop“ → „STOP“. Budík/měřidlo radši vůbec.
- **Obchodní ulice = cedule s pseudopísmem.** Scénu stavět u holých zdí.
- **Slova „stall/shop/stand“ ani ve VEDLEJŠÍM gagu** (Norsko: stánek i výloha dostaly ceduli).
- **Metafora o kódu/písmu se propíše stejně jako nápis** (Argentina: pečivo „like a secret
  code“ dostalo škrábance jako písmo). Popisuj tvar, ne význam.
- **Když záleží, KDO ve scéně je, řekni to** (Filipíny: „family group“ vyšla jako evropská
  rodina). Etnicitu a místní prostředí psát výslovně.
- **Sportovní dav si domyslí vlajky, klidně cizí** (Belgie: švédské u cyklistiky). Když nemají
  být, „with no flags anywhere“.
- **„football“ = ragbyový míč**; psát „round black-and-white patched soccer football“.
- **„seen from behind“ model ignoruje**, když je to až ve vedlejší větě — dát na začátek
  a doplnit „only the back of his head and shoulders visible“ (Argentina, Maradona).
- **Chráněné komiksové postavy (Tintin, Šmoulové, Lucky Luke) se nekreslí** — scéna nese jen
  jejich svět (prázdná políčka, houbová vesnička, kovboj a jeho stín). Vyšlo napoprvé.
- **Abstraktní vtip chce JEDNU velkou pózu**, ne detail na tácu (Argentina, lunfardo:
  obrácené hrnky se ztratily, číšník vzhůru nohama zabral).


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
| `node scripts/ilustrace/zapis-prompty.js XX soubor.json` | **hlavní zapisovač zadání pro celou zemi**: zapíše i přepíše `irony_prompt` z mapy `{id: scéna}` a vypíše, co v zemi zadání ještě nemá |
| `node scripts/ilustrace/cekej-davka.js` | čeká na dokončení dávky (status 1× za minutu, max 90 min) — pouštět na pozadí |
| `node scripts/ilustrace/orez.js id 700` | odřízne spodní pruh s podpisem (horních N řádků, vycentrovaně) a vrátí 1344×768; přepisuje `img/{id}.jpg` |
| `node scripts/ilustrace/zaplata.js vstup výstup x y š v posunY` | překryje logo/podpis kouskem téhož obrázku posunutým svisle, se změkčeným okrajem |

Archy a výřezy jdou do **`.ilustrace/`** v kořeni repa, což je **gitignorované** — je to
pracovní materiál ke kontrole očima, ne obsah appky.

**`pridej-prompty.js` při kolizi NEZAPÍŠE NIC** a vypíše, která id už zadání mají.
Tehdy ta id ze vstupního JSONu vyhoď a spusť znovu; stalo se to u Malajsie i Saúdské Arábie.

**Zálohy vadných verzí ležely ve scratchpadu a při přechodu na jiný počítač se ztratí** —
nevadí, jsou to vadné obrázky a `img/` je nemá, takže `submit --only` je vygeneruje znovu.
Vadný obrázek před přeposláním přesuň kamkoli mimo `img/` (jinak ho `submit` přeskočí).

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
- **OTEVŘENÁ kniha si o text řekne vždycky, i s formulací „ink merges into one pattern"**
  (Peru, `pe-q-mariategui`) — stránky dostaly čitelný text. Řešení stejné jako u Rumunska:
  DVĚ ZAVŘENÉ knihy, vtip (marxismus + andská tradice) nese rostlina rostoucí mezi hřbety.
- **Uvozovky s frází „as if to say '…'" vyrobí SKUTEČNOU bublinu s tím slovem**, i když
  zadání o textu vůbec nemluví (Peru, `pe-q-aymara`: „as if to say 'I heard this'"
  vyrobilo bublinu se slovem „Noding"). Past není jen v zakázaných slovech — je i
  v uvozených frázích, které naznačují řeč. Gesto popsat čistě fyzicky, bez citace.
- **DIVADELNÍ MARKÝZA (marquee) si o písmena řekne i přes explicitní „no readable
  lettering at all"** (USA, `us-k-broadway`) — negace nepomohla. Slovo „marquee" z promptu
  úplně pryč, nahrazeno „theatre canopy" se žárovkami a `front panels left completely
  blank and plain` — funguje, protože canopy nenese očekávání nápisu tak silně jako slovo
  marquee (divadelní plakátovací tabule).
- **Model dopíše SKUTEČNÝ text reálné věci i bez vyžádání, jen podle vlastní znalosti**
  (Brazílie, `br-k-vlajka`: motto „ORDEM E PROGRESSO" na vlajce, ačkoli o něm prompt
  nic neříkal — a navíc přeloženo/přehozené na „PROGGRESO"). Když má vlajka/předmět
  v realitě nápis, MUSÍ se výslovně zakázat i bez zmínky v pozitivním popisu:
  „the circle otherwise completely plain with no ribbon or banner crossing it anywhere".
- **I symbol (ne slovo) se počítá jako text** — Brazílie, `br-q-candomble` vyrobilo
  vedle svíčky doslova „®" (kolečko s R). `lint-irony` na tohle nemá vzor, protože to
  není písmeno ani slovo z jeho seznamu — kontroluj i symboly jako ©/®/™ ručně při
  prohlídce, ne jen spoléhej na lint.
- **NOVINY na stole si o text řeknou vždycky** (Vietnam, `vn-k-kava`) — stejná past jako
  italské Giro d'Italia, jen v jiné zemi. Noviny z vedlejšího gagu úplně pryč, nahrazeno
  rohoží z ratanu.

---

## 6. Co dělat dál

1. **Dobít kredit Gemini**, pak dokončit Brazílii (5 obrázků, viz bod 0.4).
2. **Odeslat obrázky pro zemi, co už má hotová zadání**: Chile → Ekvádor → Fidži →
   Indie → Keňa (`submit --cc xx`, žádné psaní zadání není potřeba).
3. **Teprve pak psát zadání pro další novou zemi** — v session, podle poučení v bodu 2/5.
   Zadání se píšou do JSON mapy `{id: scéna}` (do scratchpadu) a do dat je zapíše
   `node scripts/ilustrace/zapis-prompty.js xx mapa.json`.
4. `npm run lint-irony` (0 chyb) → `submit --cc xx` → archy + rohy + zvětšené výřezy
   podezřelých míst → opravy → **commit VŽDY i `data/questions/*.json`, ne jen `img/`**
   (past z 22. 9.: tři opravy zadání se zapomněly commitnout, protože commit sahal
   jen po `img/`).
5. Po každé zemi: zápis do CLAUDE.md (nejnovější nahoře, hned po intro řádku), `validate`,
   `test:offline`, commit + push na `claude/pokracujeme-e79708`.

**PAST 22. 9., ať se neopakuje: `git commit` po opravě zadání musí sáhnout i po
`data/questions/xx.json`, ne jen po `img/`.** Třikrát se stalo, že se commitly jen nové
obrázky a opravený `irony_prompt` zůstal jen na disku — `git status` by to ukázal
(soubor „modified", ne staged), kdyby se zkontroloval před commitem.

**Nezapomeň:** obrázky jsou v repu, takže při nasazení přibývají i do `dist/`.
Limit Cloudflare Pages je 20 000 souborů.
