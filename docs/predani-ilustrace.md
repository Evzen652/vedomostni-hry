# Předání: ilustrace k otázkám

Sepsáno **12. září 2026**, když se zastavilo uprostřed Německa a Rakouska.
Doplňuje [predavaci-protokol.md](predavaci-protokol.md); poučení a rozhodnutí jsou
v [CLAUDE.md](../CLAUDE.md) pod datem **2026-09-11** (formát, Rusko) a **2026-09-12** (Kanada).

---

## 1. Stav k 12. 9. 2026

| Položka | Hodnota |
|---|---|
| Otázek celkem | 3 742 |
| Bez ilustrace | **2 398** (53 zemí) |
| Hotovo naposledy | Rusko 132/132 (11. 9.), Kanada 74/74 (12. 9., commit `a15cbc5`) |
| Rozdělané | **Německo 66 + Rakousko 64 zadání zapsaných, obrázky NEVYGENEROVANÉ** |
| Formát | 16:9, **1344×768**, JPG q84, ~222 kB/kus |
| Cena | ~$0,034 za obrázek v dávce, tedy ~$4,4 za Německo + Rakousko |

**Necommitnuto:** `data/questions/de.json` a `data/questions/at.json` (130 nových
`irony_prompt`). Prošly `lint-irony` (0 chyb), `validate` 0 chyb, `test:offline` 853.
Obrázky k nim ještě nevznikly, takže se jimi nic nerozbije — jen se zatím nevyužívají.

---

## 2. Jak se v tom pokračuje (přesné pořadí)

```bash
node scripts/batch-irony-images.js submit --cc de      # nebo --only id,id
node scripts/batch-irony-images.js status              # BATCH_STATE_* ; dávka trvá 2-10 min
node scripts/batch-irony-images.js fetch               # uloží do img/{id}.jpg
```

1. **Zadání se píšou v session**, ne skriptem — za text se neplatí a kvalita je lepší.
   Recept: jedna dominanta „fills the frame“ s vtipem na ní, pak `Smaller and subordinate:`
   nejvýš tři gagy, a na konci řádek `MOOD:`.
2. **`npm run lint-irony` musí projít na 0 chyb, než se cokoli odešle.** Kontrola stojí nic,
   obrázek podle vadného zadání deset­inásobek ceny zadání.
3. `submit` **přeskočí otázku, která už `img/{id}.jpg` má** — před přegenerováním starý
   obrázek přesuň stranou (`--force` dávkový skript nemá).
4. Po `fetch` **projít očima úplně všechno**, viz bod 3.

**Nástroje na kontrolu leží mimo repo i mimo scratchpad session:**
`C:/Users/Evzen/AppData/Local/Temp/claude/C--Users-Evzen-Desktop-kviz/nastroje-ilustrace/`

| Skript | K čemu |
|---|---|
| `archy.js de` nebo `archy.js id1,id2` | přehledové archy 3×3 (náhled 600 px + pořadí a id) |
| `rohy.js de` | arch dolních rohů všech obrázků — tam se objevují podpisy |
| `vyrez.js` | dvojnásobný výřez pochybného místa (seznam se upraví v hlavičce skriptu) |
| `pridej-prompty.js soubor.json` | doplní `irony_prompt` tam, kde chybí (vstup `{id: scéna}`) |
| `prepis-prompty.js soubor.json` | přepíše existující zadání (kontroluje původní text) |
| `aplikuj.js` | obecný zapisovač s round-tripem (1 mezera + CRLF) |

Zálohy vadných verzí kanadských obrázků jsou tamtéž v `img-zaloha-ca/`.

---

## 3. Kontrola očima — tři kroky, žádný nevynechávej

1. **Archy 3×3** — sedí scéna na ODPOVĚĎ, není tam nápis, je počet věcí správně.
2. **Arch dolních rohů** — vymyšlené podpisy a razítka jsou skoro vždycky v rohu
   a v celkovém náhledu se přehlédnou.
3. **Výřez 2× u každého podezřelého místa.** Dvakrát to zachránilo dobrý obrázek
   (protéza Terryho Foxe, kečupové brambůrky) a jednou odhalilo písmeno tam, kde
   náhled ukazoval tři tečky (bublina u krávy).

Vadné se posílají znovu přes `submit --only`. **Ořez použij jen na podpis těsně u kraje**
(horních 728 řádků, střed šířky 1274, zpět na 1344×768) — značka 50 px nad hranou se tím
neodstraní.

---

## 4. Co se opakovaně kazí (a co s tím)

- **Text si vždycky vyžádá PŘEDMĚT, který bez popisku nedává smysl** — cedule, dres,
  bublina, výloha, bankovka, kniha, mapa. Do zadání se nesmí dostat jako věc; buď se
  vynechá, nebo se popíše jako holá plocha („plain and unmarked“).
- **Slova „written“ a „letter“ nepatří do zadání ani v záporu** — `lint-irony` je hlásí
  jako chybu právem, model zákaz čte jako pozvánku.
- **Vymyšlený podpis malíře** je náhodná vada i přes zákaz v `STYL`; stačí poslat totéž
  zadání znovu.
- **Když model třikrát vrátí tutéž nechtěnou věc, přestaň ji zakazovat a přestav scénu**
  tak, aby pro ni nebylo místo (Gagarinův skafandr, torontská tramvaj otočená zádí).
- **Počet, na kterém stojí fakt, piš výslovně** („exactly three …“), jinak model počítá po svém.

---

## 5. Co dělat dál

1. **Odeslat Německo a Rakousko** — zadání jsou napsaná a zkontrolovaná, chybí jen dávka.
2. Pak podle velikosti fondu: Itálie 81, Británie 74, Maďarsko 74, Švédsko 67,
   Francie 65, Slovensko 64, Nizozemsko 63, Švýcarsko 62, Španělsko 62, Řecko 53…
3. Po každé zemi: zápis do CLAUDE.md, `validate`, `test:offline`, commit na pracovní větev.

**Nezapomeň:** obrázky jsou v repu (dnes 184 MB + 17 MB Kanada), takže při nasazení
přibývají i do `dist/`. Limit Cloudflare Pages je 20 000 souborů, dnes jich je ~1 470.
