# Zadání: 40 nových otázek pro jednu zemi (Cestokvíz)

Píšeš obsah do české vědomostní hry o zemích světa. Tón appky je hravý až sebeironický,
ne encyklopedický.

> Tohle zadání se dává agentům při psaní další dávky otázek. Postup, příkazy a poučení
> z kampaně z 30. 9.–1. 10. 2026 (55 zemí × 40 otázek) jsou v [README.md](README.md).
> Cesty níže jsou relativní ke KOŘENI REPA.

## Než začneš

1. Přečti si `CLAUDE.md` v kořeni repa — hlavně standard kvality otázek (zápis **2026-08-10**)
   a tón hlášek podle pásma (**2026-08-15**).
2. Přečti si svůj kontextový soubor `.obsah/kontext/<cc>.txt` — je v něm výpis **všech**
   otázek, které už o té zemi ve fondu jsou. **Žádná tvoje otázka nesmí testovat týž fakt.**
3. Vzor správného tvaru: otázka `jp-t-judo-jemna-cesta` v `data/questions/jp.json`.

**Řádky označené `[SERVEROVÝ FOND — nesahat, nekopírovat příznak]` jsou PŮVODNÍ serverový
fond (`online_only`).** Jejich fakta nezopakuj, ale **nesahej na ně a nikdy nepřidávej
`online_only` ani `-s-` do id svých nových otázek.** Píšeš jen svých 40 nových. Příznak
`online_only` na novou otázku je CHYBA, přejímka ji odmítne.

## Kolik a jakých

**40 otázek**, rozložení pásem:

| Pásmo | Počet | Pole | Pro koho |
|---|---|---|---|
| Děti | **13** | `"kids": true`, `"difficulty": 1` | 8–11 let: konkrétní, obrazová fakta. **Žádné letopočty v odpovědi, žádná procenta, žádná politika, žádný číselný odhad jako odpověď.** |
| Puberťáci | **13** | `"difficulty": 1` nebo `2` | Co zná průměrný čtrnáctiletý ze školy a běžného života: slavné osobnosti, sport, populární kultura, základní zeměpis a dějiny. |
| Dospělí | **14** | `"difficulty": 3` | Vyžaduje dospělý rozhled. |

Pole `kids` uváděj **jen** u dětských otázek. U ostatních ho vynech.

Rozlož otázky zhruba rovnoměrně mezi sekce. `section` musí být **přesně** jedna z:
`Místa`, `Příroda`, `Lidé`, `Kultura & tradice`, `Umění`, `Sport`, `Jazyk & slova`, `Jídlo`, `Historie`

## Tvar

```json
{
 "id": "<cc>-<pismeno>-<slug>",
 "cc": "<cc>",
 "country": "<český název země>",
 "section": "Sport",
 "difficulty": 2,
 "type": "choice",
 "question": "…?",
 "answer": "…",
 "distractors": ["…", "…", "…"],
 "quip_correct": "…",
 "quip_wrong": "…",
 "explanation": "…",
 "about": "…",
 "more_fact": "…",
 "irony_prompt": "…"
}
```

## Tvrdá pravidla

Každé z nich stálo projekt škodu, proto jsou tvrdá.

1. **Tři vrstvy textu se nesmí navzájem parafrázovat.** `explanation` nese **fakt navíc**,
   který v otázce není. `quip_correct` nese **reakci a vtip**, ne další fakt.
   `quip_wrong` musí reagovat na **konkrétní špatnou odpověď** a mít pointu —
   nikdy jen „Správně je X".
2. **Žádný minulý čas s rodem.** Ne „věděl jsi", „trefil ses", „uhodls". Appka nezná
   pohlaví hráče. Piš přítomným časem. Opotřebovaný opener „Tys to věděl!" nepoužívej.
3. **Všechno začíná velkým písmenem** — otázka, odpověď, každý distraktor, obě hlášky,
   vysvětlení i `more_fact`.
4. **`about` je 6. pád** pro větu „Více o…": `"judu"`, `"Velké čínské zdi"`, `"pandě velké"`.
   Česky se pád odvodit nedá, proto je v datech.
5. **`more_fact` je nový fakt**, ne parafráze vysvětlení. **110–240 znaků.**
   Žádná uvozovací vata („Zajímavé je, že…", „Kromě toho…").
6. **`id` jen malá ASCII písmena, číslice a pomlčky** — žádná diakritika.
7. **Odpověď nesmí vyčnívat délkou.** Distraktory piš podobně dlouhé a stejně konkrétní —
   jinak je správná odpověď poznat na první pohled. **Dorovnávej distraktory, odpověď
   nezkracuj.** Nedávej do odpovědi zbytečnou závorku s cizím názvem („Lovaň (Leuven)"),
   pokud český název stačí.
8. **Distraktor nesmí být pravdivý.** Ověř u každého, že opravdu neplatí.
9. **Odpověď nesmí být v zadání** (ani celou větou, ani u otázek „A, nebo B?") a nesmí ji
   prozradit jiná otázka, kterou píšeš ani ta, která už ve fondu je.
10. **Tón podle pásma:** děti = nadšené, mírná ironie, nikdy sarkasmus. Puberťáci = cool,
    podpichující. Dospělí = sarkasmus a absurdní kontrast.
11. **Citlivá témata** (války, diktatury, katastrofy, kolonialismus) piš věcně a neutrálně.
    Ilustrace k nim řeš symbolicky — nikdy nezobrazuj násilí ani lidské utrpení, a **citlivé
    téma nikdy ne jako vtip ani vedlejší rekvizita**.
12. **Faktům, kterými si nejsi jistý, se vyhni, nebo je zformuluj opatrně („prý",
    „podle legendy", „jeden z").** V odpovědi na konci vyjmenuj, které fakty píšeš
    z paměti a neověřené — je to nejcennější část tvého hlášení, ověřuje se podle ní.
    Dvě skutečné chyby kampaně (PewDiePie × T-Series 2019, žralok obrovský × velrybí) se
    našly přesně takhle. Nepiš tvrzení s přesným číslem, které neumíš ověřit.

## `irony_prompt` — zadání pro malovanou ilustraci

Anglicky, jedna scéna. Tenhle recept projekt vyladil na tisícovkách obrázků:

- **Jedna dominanta**, výslovně `fills the frame` nebo `dominates the frame`.
- **Vtip sedí přímo na té dominantě** a ilustruje **odpověď**, ne jen téma. Čtyři
  rovnocenná zvířata/motivy splynou v siluetu bez středu — jeden hrdina, zbytek podřízený.
- **Nejvýš tři vedlejší gagy**, uvozené `Smaller and subordinate:`.
- Poslední řádek je `MOOD: <dvě až tři nálady>`. **Nálada nese asociace stejně silně jako
  popis scény** — piš do ní nálady, ne pojmy („lucky" u trojlístku vyrobilo čtyřlístek).

**Past, která projekt stála stovky obrázků: model vepíše text všude, kde mu dáš plochu.**

- **Slova, která si vyžádají nápis, nepiš NIKDE — ani ve vedlejším gagu, ani v záporu:**
  `sign`, `signpost`, `label`, `text`, `letter`, `word`, `written`, `writing`, `banner`,
  `newspaper`, `scoreboard`, `plaque`, `menu`, `inscription`, `caption`. „No banners",
  „no plaques", „nothing written" je past — slovo vyvolá to, co zakazuje. Přejímka je hlásí.
  **Plochu popiš KLADNĚ:** `smooth and completely bare`, `its surface plain`.
- Co v realitě nápis **nese** (dres, plechovka, vývěska, kufr, trofej, mince, láhev), popiš
  výslovně jako holé. Dres si řekne i o logo výrobce a odznak — nejspolehlivější je scéna
  bez dresu, nebo dres jedné barvy bez popisu vzoru.
- **Nepojmenovávej ani účel předmětu** („a marker post showing where sea level would be"
  vyrobilo čitelné „sea level"). Popiš tvar, ne funkci. Slovo pojmenovávající typ podniku
  (banka, hotel, obchod, stánek, kavárna, taxi) si vyrobí vývěsku — vynech.
- **Měřidlo, ciferník, displej, tabule a scoreboard si vyrobí nápis vždy** — do scény nedávej.
- **Akt psaní, kaligrafie a popsaná plocha přinesou text vždycky**, ať se formuluje jakkoli
  („illegible squiggles", „too ornate to read" nefunguje). U otázek o písmu postav vtip na
  gestu, tvaru nebo předmětu (klíč do zámku, zavřená kniha s holými deskami, svinutý svitek).
- **U jídla popiš TVAR v první větě**, ne jen název: `long thin sticks`, `two flat round
  discs joined by caramel`. Jinak z „cone of fries" vyjde zmrzlina. `lint-irony` to hlídá.
- **Reálné žijící osoby nekresli** — nahraď je anonymní siluetou, rukama nebo symbolem.
  Chráněné postavy (komiksy, animák) také.
- Ptá-li se otázka na **vlajku nebo počet**, vypiš barvy, pořadí a počet doslova
  (`exactly three … one on the left, one in the middle…`). Obecné „a national flag"
  vyrobí vlajku úplně jiné země. Sportovní dav si sám vyžádá cizí vlaječky — piš
  `with no flags anywhere`.
- Etnicitu postav uveď, **záleží-li na tom, kdo ve scéně je** („Filipino family with warm
  brown skin and black hair") — jinak model doplní evropský typ.

## Výstup

Piš **po skupinách po 10 otázkách a zapisuj je do souboru přírůstkově** (Write na začátku,
pak Edit/append) — jeden obrovský výstup naráz opakovaně spadl na limitu délky odpovědi.

Zapiš **pole 40 objektů** jako čistý JSON (nic jiného v souboru, žádné ```json ohraničení) do
`.obsah/nove/<cc>.json`. **Pracovní části po sobě smaž** — přejímka čte jen soubor
pojmenovaný kódem země.

Pak si soubor **přečti zpátky** a ověř, že je to platný JSON se čtyřiceti otázkami.
Neohlašuj hotovo dřív, než soubor na disku skutečně existuje.

V odpovědi napiš **krátce (pár vět, bez vypsaných promptů)**: počet otázek, rozložení pásem,
na co sis dal pozor a **které fakty píšeš z paměti neověřené**.
