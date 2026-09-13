# Předání: ilustrace k otázkám

Sepsáno **12. září 2026** (aktualizováno **13. 9. odpoledne**, po dokončení Irska
a odeslání Izraele). Doplňuje [predavaci-protokol.md](predavaci-protokol.md); poučení
a rozhodnutí jsou v [CLAUDE.md](../CLAUDE.md) pod datem **2026-09-11** (formát, Rusko),
**2026-09-12** (Kanada, Německo+Rakousko, Itálie, Británie, Maďarsko, Švédsko, Francie,
Slovensko, Nizozemsko) a **2026-09-13** (Švýcarsko, Řecko, Bulharsko, Španělsko,
Ukrajina, Rumunsko, Thajsko, Turecko, Irsko).

---

## 1. Stav k 13. 9. 2026 (odpoledne)

| Položka | Hodnota |
|---|---|
| Otázek celkem | 3 742 |
| Bez ilustrace | **1 328** |
| Hotovo dnes v noci/dopoledne | Slovensko 66/66, Nizozemsko 63/63, Švýcarsko 62/62, Řecko 53/53, Bulharsko 52/52, Španělsko 62/62, Ukrajina 47/47, Rumunsko 46/46, Thajsko 45/45, Turecko 43/43, **Irsko 42/42** |
| **ROZDĚLANO — VYŽADUJE OKAMŽITOU AKCI** | **Izrael 42 zadání ODESLANÝCH, obrázky ZATÍM NESTAŽENÉ ani nezkontrolované** — viz bod 2 níž |
| Další v pořadí (po Izraeli) | **Jižní Korea 42 a Malajsie 42 — zadání UŽ NAPSANÁ a po lintu, stačí `submit --cc kr` / `--cc my`**; pak Pákistán 42, Portugalsko 42, Saúdská Arábie 42… |
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

## 2. PRVNÍ KROK PŘÍŠTÍ SESSION: stáhnout a zkontrolovat Izrael

Dávka pro Izrael (42 otázek, `batches/hg2ti8y35tpmi79z9ov62cyrqeydf80y49f8`) byla odeslána
na konci téhle session a NEBYLA stažená ani zkontrolovaná. Udělej jako první věc:

```bash
node scripts/batch-irony-images.js status   # pockej na BATCH_STATE_SUCCEEDED
node scripts/batch-irony-images.js fetch    # ulozi do img/{id}.jpg

NASTROJE="C:/Users/Evzen/AppData/Local/Temp/claude/C--Users-Evzen-Desktop-kviz/nastroje-ilustrace"
node "$NASTROJE/archy.js" il     # prehledove archy 3x3
node "$NASTROJE/rohy.js" il      # arch dolnich rohu (podpisy)
```

Pak projdi archy (Read tool), najdi vadné, přesuň je do `nastroje-ilustrace/vadne-zaloha-il/`,
pošli přes `submit --only id1,id2,...`, zkontroluj znovu, zapiš do CLAUDE.md
(vzor: zápisy o Irsku a Turecku výš), `validate` + `test:offline`, commit, push.

**Po Izraeli jsou na řadě JIŽNÍ KOREA (42) a MALAJSIE (42) — zadání jsou UŽ NAPSANÁ
a prošla lintem**, takže stačí `submit --cc kr` a `submit --cc my`. Nepiš je znovu.

**Nejrizikovější izraelské otázky, projdi je nejpřísněji:**
- `il-q-hebrejske-pismo` (píše se zprava doleva) — kniha se otevírá z pravé strany
  a VŠECHNY stránky jsou prázdné. Jakýkoli znak = vada.
- `il-k-hebrejstina-ozivena` (oživení jazyka) — ceremoniální pohár na kuchyňském stole,
  žádná písmena.
- `il-q-eliezer-ben-jehuda` — barevné stuhy zvuku odcházející oknem, žádná písmena.
- `il-q-svitky-od-mrtveho-more` — **svitky musí zůstat SVINUTÉ v džbánech**; rozvinutý
  svitek je zaručený text (poučení z rumunské cyrilice a irského Book of Kells).
- `il-q-vznik-statu-izrael` — řečník je vidět ZEZADU a drží listy prázdnou stranou k nám.
- `il-k-vlajka` — barvy a rozvržení vypsané explicitně (bílé pole, dva modré vodorovné
  pruhy, uprostřed modrá šesticípá hvězda ze dvou trojúhelníků); otázka je přímo o tom.
- `il-q-maccabi-tel-aviv` — šest trofejí „on a plain round base with no plaque or
  marking of any kind" (past z Řecka a Ukrajiny).
- `il-q-hummus` — stará kuchařka ve scéně je ZAVŘENÁ a jen s páskovou záložkou.
- `il-k-klima` — ve scéně je „one road sign post standing completely blank"; kdyby na
  něm cokoli bylo, je to vada.
- `il-k-koralovy-utes` — potápěčova tabulka je „completely blank".
- **Citlivá témata:** všechny izraelské otázky jsou kulturní, přírodní nebo vědecké;
  žádné politické ani konfliktní. `il-q-korejska-valka-jizni`-typ scéna je jen u
  `il-q-masada` (Herodův palác, NE obléhání) — zkontroluj, že tam nejsou postavy ani násilí.

**Past ze Švédska/Švýcarska/Řecka/Ukrajiny/Rumunska/Turecka/Irska, platí furt:** slovo,
které POJMENOVÁVÁ, co věc JE nebo K ČEMU SLOUŽÍ, se propíše jako čitelný text i s
`left blank` vedle sebe. **Platí to i pro VEDLEJŠÍ gag, ne jen pro dominantu** (turecké
„ferry queue" postavilo do pozadí budovu s nápisem).

**NOVÁ PAST Z IRSKA, nejdražší toho dne: řádek MOOD nese asociace stejně silně jako
popis scény.** `MOOD: fresh, lucky` u trojlístku vyrobilo ČTYŘLÍSTEK, tedy obrázek
popírající vlastní odpověď — a to DVAKRÁT po sobě, protože první oprava měnila jen
popis dominanty a slovo „lucky" v MOOD nechala. **Když je fakt o POČTU nebo tvaru,
projdi celé zadání včetně MOOD a vyhoď každé slovo, které nese jinou asociaci.**

**Past z Rumunska, lint ji nechytí: vada může být VKUSOVÁ.** U citlivého tématu nestačí
napsat `not graphic` — scéna nesmí obsahovat prvek, který se dá číst jako tělo nebo násilí.

**Past, kterou hlídej po KAŽDÉ opravě: jedna oprava umí vyrobit nový náhodný podpis**,
i opakovaně u téhož obrázku — u Irska se to stalo hned u DVOU oprav najednou, takže
bylo nutné třetí kolo. Po každé opravě ZNOVU zkontroluj archy i rohy.

**A podpis NEMUSÍ ležet v rohu.** U Rumunska seděl na radlici buldozeru, u Thajska
a Irska byl vepsaný přímo do hlíny/trávy a u Turecka dvakrát uvnitř scény — arch dolních
rohů takové případy MINE. Velkou hladkou plochu (stroj, skálu, zem) projdi výřezem.

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

**Nástroje na kontrolu leží mimo repo i mimo scratchpad session:**
`C:/Users/Evzen/AppData/Local/Temp/claude/C--Users-Evzen-Desktop-kviz/nastroje-ilustrace/`

| Skript | K čemu |
|---|---|
| `archy.js XX` nebo `archy.js id1,id2` | přehledové archy 3×3 (náhled 600 px + pořadí a id) |
| `rohy.js XX` | arch dolních rohů všech obrázků — tam se objevují podpisy |
| `vyrez.js` | dvojnásobný výřez pochybného místa (seznam se upraví v hlavičce skriptu) |
| `pridej-prompty.js soubor.json` | doplní `irony_prompt` tam, kde chybí (vstup `{id: scéna}`) |
| `prepis-prompty.js soubor.json` | přepíše existující zadání (kontroluje původní text) |
| `aplikuj.js` | obecný zapisovač s round-tripem (1 mezera + CRLF) |

Zálohy vadných verzí leží v `nastroje-ilustrace/vadne-zaloha-{cc}/` (dnes existují pro
`se`, `fr`, `sk`, `nl`, `ch`, `gr`, `bg`, `es`, `ua`, `ro`, `th`, `tr` a `ie`; `ca` má starší `img-zaloha-ca/`).

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

1. **Stáhnout a zkontrolovat Izrael** (bod 2 výš) — priorita číslo jedna.
2. **Odeslat Jižní Koreu (42) a Malajsii (42) — zadání jsou hotová a po lintu**, pak
   pokračovat pořadím: Pákistán 42, Portugalsko 42, Saúdská Arábie 42…
3. Po každé zemi: zápis do CLAUDE.md (nejnovější nahoře, hned po intro řádku), `validate`,
   `test:offline`, commit + push na `claude/pokracujeme-e79708`.

**Nezapomeň:** obrázky jsou v repu (odhad dnes ~250 MB jen z tohohle sezení navíc),
takže při nasazení přibývají i do `dist/`. Limit Cloudflare Pages je 20 000 souborů,
dnes jich je odhadem ~1 900.
