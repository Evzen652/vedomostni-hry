# Předání: ilustrace k otázkám

Sepsáno **12. září 2026** (aktualizováno **13. 9. v noci**, po dokončení Řecka
a odeslání Bulharska). Doplňuje [predavaci-protokol.md](predavaci-protokol.md); poučení
a rozhodnutí jsou v [CLAUDE.md](../CLAUDE.md) pod datem **2026-09-11** (formát, Rusko),
**2026-09-12** (Kanada, Německo+Rakousko, Itálie, Británie, Maďarsko, Švédsko, Francie,
Slovensko, Nizozemsko) a **2026-09-13** (Švýcarsko, Řecko).

---

## 1. Stav k 13. 9. 2026 (noc)

| Položka | Hodnota |
|---|---|
| Otázek celkem | 3 742 |
| Bez ilustrace | **1 665** |
| Hotovo dnes v noci | Slovensko 66/66, Nizozemsko 63/63, Švýcarsko 62/62, **Řecko 53/53** |
| **ROZDĚLANO — VYŽADUJE OKAMŽITOU AKCI** | **Bulharsko 52 zadání odesláno (`submit --cc bg`), obrázky ZATÍM NESTAŽENÉ ani nezkontrolované** — viz bod 2 níž |
| Zadání připravená, ale zatím NEODESLANÁ | **Španělsko (62)** — `lint-irony` 0 chyb, čeká na `submit --cc es` |
| Další v pořadí (po Bulharsku a Španělsku) | podle `docs/pokracovani.md` / velikosti zbylých fondů (Ukrajina 47, Rumunsko 46, Thajsko 45, Turecko 43…) |
| Formát | 16:9, **1344×768**, JPG q84, ~222 kB/kus |
| Cena | ~$0,034 za obrázek v dávce |

**Kredit Gemini API se v noci na chvíli vyčerpal** (429 „prepayment credits are depleted"
při odesílání dávky pro Slovensko) — hráč dobil na `ai.studio/projects` a dávka pak prošla
normálně. Kdyby se to stalo znovu, řešení je stejné (dobití, appka/skript s tím nic neudělá).

---

## 2. PRVNÍ KROK PŘÍŠTÍ SESSION: stáhnout a zkontrolovat Bulharsko, pak odeslat Španělsko

Dávka pro Bulharsko (52 otázek, `batches/3epvztef1fsxe0gfmz1lnircw8y75ecrydpi`) byla
odeslána na konci téhle session a NEBYLA stažená ani zkontrolovaná. Udělej jako první věc:

```bash
node scripts/batch-irony-images.js status   # počkej na BATCH_STATE_SUCCEEDED
node scripts/batch-irony-images.js fetch    # uloží do img/{id}.jpg

NASTROJE="C:/Users/Evzen/AppData/Local/Temp/claude/C--Users-Evzen-Desktop-kviz/nastroje-ilustrace"
node "$NASTROJE/archy.js" bg     # přehledové archy 3×3
node "$NASTROJE/rohy.js" bg      # arch dolních rohů (podpisy)
```

Pak projdi archy (Read tool), najdi vadné, přesuň je do `nastroje-ilustrace/vadne-zaloha-bg/`,
pošli přes `submit --cc bg --only id1,id2,...`, zkontroluj znovu, zapiš do CLAUDE.md
(vzor: zápisy o Řecku a Švýcarsku výš), `validate` + `test:offline`, commit, push.

**Teprve PAK odešli Španělsko** (`submit --cc es`, zadání jsou už v `data/questions/es.json`,
`lint-irony` 0 chyb) — stejným postupem kontroly.

**Citlivá témata v Bulharsku psaná neutrálně/nezobrazivě:** osmanská nadvláda 482 let,
rusko-turecká válka, revolucionář Vasil Levski (anti-osmanský odboj), medvědi tančící na
řetězu (vyřešeno pozitivně — přesun do sanktuáře). **Cyrilice** (otázka o vzniku písma)
je psaná bez konkrétních písmen („elegant flowing script too ornate to read") — stejné
řešení jako u řecké abecedy, kde PŘÍMÝ popis písmen (A, E, I, O, U) selhal.

**Past, na kterou dej pozor i tady — potvrzeno třikrát za noc (Švýcarsko, Řecko):**
slovo, které POJMENOVÁVÁ, co věc JE, K ČEMU SLOUŽÍ nebo V JAKÉM JE STAVU (ne jen jak
vypadá), se propíše jako čitelný text i s `left blank` vedle sebe. U Řecka to bylo
„passport" na krytu (dvakrát) a „extreme zone" jako POPIS polohy ručičky — funguje
i nepřímé pojmenování stavu, ne jen přímé jméno předmětu. Řešení je vždycky stejné:
to slovo/frázi z popisu úplně odstranit.

**Nová past ke sledování: JEDNA oprava dokáže vyrobit NOVÝ náhodný podpis, a to
i DVAKRÁT po sobě u stejného obrázku** (řecká Akropolis potřebovala tři pokusy — druhý
pokus opravil text, ale přidal podpis; teprve třetí byl čistý). Po každé opravě
ZNOVU zkontroluj archy i rohy, i když opravovala jen jednu konkrétní vadu.

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
`se`, `fr`, `sk`, `nl`, `ch` a `gr`; `ca` má starší `img-zaloha-ca/`).

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

---

## 6. Co dělat dál

1. **Stáhnout a zkontrolovat Bulharsko** (bod 2 výš) — priorita číslo jedna.
2. **Odeslat Španělsko** (zadání hotová, jen počkat, až se uvolní sledování dávky).
3. Pokračovat dál podle `docs/pokracovani.md` / velikosti zbylých fondů — po Španělsku
   je na řadě Ukrajina (47), Rumunsko (46), Thajsko (45), Turecko (43)…
4. Po každé zemi: zápis do CLAUDE.md (nejnovější nahoře, hned po intro řádku), `validate`,
   `test:offline`, commit + push na `claude/pokracujeme-e79708`.

**Nezapomeň:** obrázky jsou v repu (odhad dnes ~250 MB jen z tohohle sezení navíc),
takže při nasazení přibývají i do `dist/`. Limit Cloudflare Pages je 20 000 souborů,
dnes jich je odhadem ~1 900.
