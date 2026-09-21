# Předání: ilustrace k otázkám

Sepsáno **12. září 2026** (aktualizováno **21. 9.**, po Malajsii, Pákistánu, Portugalsku,
Saúdské Arábii a Dánsku). Doplňuje [predavaci-protokol.md](predavaci-protokol.md); poučení
a rozhodnutí jsou v [CLAUDE.md](../CLAUDE.md) pod datem **2026-09-11** (formát, Rusko),
**2026-09-12** (Kanada, Německo+Rakousko, Itálie, Británie, Maďarsko, Švédsko, Francie,
Slovensko, Nizozemsko), **2026-09-13** (Švýcarsko, Řecko, Bulharsko, Španělsko,
Ukrajina, Rumunsko, Thajsko, Turecko, Irsko, Izrael, Jižní Korea) a **2026-09-21**
(Malajsie, Pákistán, Portugalsko, Saúdská Arábie, Dánsko).

---

## 1. Stav k 21. 9. 2026

| Položka | Hodnota |
|---|---|
| Otázek celkem | 3 742 |
| Bez ilustrace | **832** |
| Hotovo 21. 9. | Malajsie 42/42, Pákistán 42/42, Portugalsko 42/42, Saúdská Arábie 44/44, Dánsko 42/42, Indonésie 41/41, Norsko 42/42, Filipíny 42/42, Argentina 48/48, Belgie 42/42 |
| Klíč Gemini | **nový formát `AQ.…`**, v `.dev.vars` tohohle worktree (negituje se). Na jiném počítači ho tam musí hráč vložit znovu. |
| Další v pořadí | Finsko 40, Gabon 40, Peru 40, USA 40, Vietnam 40… — **zadání (`irony_prompt`) zatím NENAPSANÁ** |
| Formát | 16:9, **1344×768**, JPG q84, ~222 kB/kus |
| Cena | ~$0,034 za obrázek v dávce |

**Kredit Gemini API se už dvakrát vyčerpal** (429 „prepayment credits are depleted“) —
řešení je vždycky dobití na `ai.studio/projects`, skript ani appka s tím nic neudělají.

**Dávky o jediném/pár obrázcích někdy trvají 30+ minut** — Batch API negarantuje čas.
Na čekání slouží smyčka volající `status` jednou za minutu, puštěná na pozadí.

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

1. **Napsat zadání pro další zemi** (Finsko 40, pak další) — v session, podle poučení
   v bodu 2; zápis do dat malým skriptem s round-trip kontrolou formátu.
2. `npm run lint-irony` (0 chyb) → `submit --cc xx` → archy + rohy → opravy → commit.
3. Po každé zemi: zápis do CLAUDE.md (nejnovější nahoře, hned po intro řádku), `validate`,
   `test:offline`, commit + push na `claude/pokracujeme-e79708`.

**Nezapomeň:** obrázky jsou v repu (odhad dnes ~250 MB jen z tohohle sezení navíc),
takže při nasazení přibývají i do `dist/`. Limit Cloudflare Pages je 20 000 souborů,
dnes jich je odhadem ~1 900.
