# Obsahový dluh — audit obsahu a konzistence 2026-09-10

Co audit našel a co zbývá opravit ručně. **Mechanické vady jsou opravené** (velká písmena
u možností, uvozovky, výpustky, texty v appce — viz CLAUDE.md pod 2026-09-10); tady je jen
práce, která potřebuje úsudek. Seznamy jde kdykoli vygenerovat znovu:
`npm run audit:konzistence` → `data/audit-konzistence.json`.

---

## 1. Duplicity — tentýž fakt dvakrát v jednom fondu (9 dvojic)

Hráč může dostat obě otázky v jedné hře. U každé dvojice jednu nechat a druhou **přepsat
na jiný fakt — nemazat**: na id vedou odkazy z produkční databáze (`seen_questions`,
`games.question_ids`), viz CLAUDE.md 2026-08-31.

| Fond | Dvojice |
|---|---|
| obecný | `cz-t-navratilova-wimbledon` / `cz-t-navratilova-wimbledon-2` |
| obecný | `cz-t-lide-nemcova-babicka` / `cz-q-nemcova-babicka` |
| obecný | `cz-t-lide-foglar-rychle-sipy` / `cz-q-foglar-rychle-sipy` |
| obecný | `cz-q-smetana-ma-vlast-hluchota` / `cz-q-smetana-hluchota-ma-vlast` |
| obecný | `cz-q-hasek-dominator-prezdivka` / `cz-q-hasek-dominator` |
| obecný | `cz-q-capek-slovo-robot` / `cz-q-slovo-robot` |
| dětský | `cz-k-spejbl-a-hurvinek` / `cz-k-spejbl-hurvinek` |
| dětský | `cz-k-kraslice` / `cz-k-kraslice-velikonocni-vejce` |
| dětský | `cz-k-ctyrlistek` / `cz-k-ctyrlistek-komiks` |

Stejná odpověď u **různých** faktů je v pořádku a neopravuje se: sedm pádů × sedm medailí
Čáslavské, lev na znaku × lev na mincích, Finsko u Santy × u Angry Birds, červené autobusy
× červené schránky.

## 2. Otázky, které si prozrazují odpověď (případ Jirásek)

Vzorec: otázka „Jak se jmenuje X?" a vedle ní otázky „Čím je X výjimečný?", které X
jmenují přímo v zadání. Kdo dostane obě, má první zadarmo. **Oprava: přeformulovat tu
otázku „Jak se jmenuje X?"** tak, aby se ptala na něco, co ostatní zadání neříkají —
ostatní otázky se X vyhnout nemůžou.

Nejsilnější případy (ručně posouzené):

- **Zátopek** — `cz-t-emil-zatopek-bezec` („přezdívaný lokomotiva") prozrazuje přezdívku,
  na kterou se ptá `cz-t-lide-zatopek-bezec`, a Emila Zátopka jmenuje v zadání dalších
  sedm otázek.
- **Seifert** — `cz-q-seifert-nobelova-cena`, `cz-q-seifert-nobelova-cena-starsi`
  a `cz-q-seifert-nobel-literatura` si navzájem prozrazují jméno i obor.
- **Heyrovský** — `cz-t-lide-heyrovsky-polarograf` a `cz-q-heyrovsky-polarografie` říkají
  v zadání „za chemii", na což se ptá `cz-q-heyrovsky-nobelova-cena`.
- **Karel IV.** — `cz-q-karlova-univerzita-zalozeni` a `cz-q-karel-iv-nove-mesto` říkají
  „Karel IV. založil univerzitu roku 1348", na což se ptá `cz-t-karlova-univerzita-nejstarsi`.
- **Hašek** — `cz-t-lide-hasek-branbar` („přezdívalo Dominátor") prozrazuje obě otázky na přezdívku.
- **Mikuláš** — `cz-q-mikulasska-trojice` („Mikuláš, anděl a čert") prozrazuje `cz-q-mikulasska-nadilka`.
- **Houfnice** — `cz-q-houfnice-howitzer` („howitzer (houfnice)") prozrazuje `cz-q-houfnice-a-howitzer`.
- **Kafka** — `cz-t-franz-kafka` („psal v němčině") prozrazuje `cz-t-lide-kafka-spisovatel`.
- Stejný vzorec dál: Ledecká, Čáslavská, Jágr, Kvitová, Macocha, Pravčická brána,
  Adršpach, Krteček, Sedmikrásky, Slovanská epopej, Karel Zeman; mimo Česko Bajkal,
  Elbrus, Ladoga, Libreville, Ulánbátar, Bukurešť, Nordkapp, Parthenón, Tour de France,
  Braniborská brána.

Audit hlásí 118 kandidátů (`prozrazuje_jinou`); zhruba polovina je planá — město zmíněné
v jiné otázce jen jako místo děje.

**Příbuzný vzorec: „Ve které zemi…?" uvnitř fondu té země** — `cn-t-nudle` („V Číně"),
`it-k-nutella-puvod` („V Itálii"), `fi-k-santa`, `fi-k-angry-birds`, `gb-k-fotbal-vznik`,
`hu-a-houdini`. V hře o té zemi je odpověď zřejmá vždycky, bez ohledu na ostatní otázky.

## 3. Odpověď přímo v zadání (4)

- `cz-k-moravske-kolacky` — ptá se na „malé kulaté koláčky…", odpověď „Koláčky".
- `cz-k-ch-jedno-pismeno` — zadání říká, že „CH je jedno písmeno", odpověď „Jedno".
- `no-k-nisse-rysova-kase` — ptá se na „sladkou rýžovou kaši", odpověď „Rýžovou kaši".
- `cz-k-hus-hacek-carka` — „vypadá jako drobný háček", odpověď „Háček". U dětské otázky
  to může být záměrná nápověda — posoudit.

## 4. Minulý čas s rodem k hráči (422 hlášek)

„Trefil jsi", „sis spletl", „jsi měl v kapse"… Appka pohlaví hráče nezná (pravidlo
2026-09-02). **171 z nich je dětský opener „Tys to věděl!" / „Jé, tys to věděl!"** — zápis
o rotaci openerů z téhož dne ho ponechal, ačkoli sám pravidlo o rodu cituje.

Oprava vyžaduje přepis věty, ne náhradu slova: „Trefil jsi to" → „Trefa", „sis spletl
s…" → „plete se s…". Vhodné dávkově přes skript s kontrolou `npm run audit:konzistence`
(kategorie `rod_k_hraci` musí klesnout k nule).

## 5. Správná odpověď vyčnívá délkou (205 otázek, 51 dětských)

Správná odpověď je víc než dvakrát delší než nejdelší distraktor, takže se dá tipnout bez
znalosti — třeba „Požadovaly informace o svých zmizelých dětech (desaparecidos)" proti
„Za snížení daní". **Oprava: prodloužit distraktory** na podobnou délku a konkrétnost,
ne zkracovat správnou odpověď.

## 6. Pokrytí

| | Obecný fond | Dětský fond |
|---|---|---|
| Otázek | 2 752 | 990 |
| S ilustrací | 867 (32 %) | 274 (28 %) |
| S „Více o…" | 1 927 (70 %) | 290 (29 %) |
| S `irony_prompt` | 678 | 253 |

Dětský fond má „Více o…" jen u necelé třetiny otázek — tlačítko se u zbytku nevykreslí.
Zhruba 240 dětských otázek nemá ani `image_prompt` (hlásí `npm run validate`).

---

## Šum — ověřeno, nehonit

- `prozrazuje_jinou`, kde je odpověď město zmíněné v jiné otázce jen jako místo děje.
- Kategorie `npm run audit`: `hlaska_mimo`, `sablona_jako`, `quip_wrong_opakuje`,
  `kids_dlouha_otazka`, `kids_abstraktni` — rozebráno v CLAUDE.md pod 2026-08-30.
- Distraktor typu „Nikdy" nebo „K ničemu takovému nedošlo" mezi čísly je záměr, ne chyba.
- Sken velkých písmen v prohlížeči hlásí i text za inline prvkem („…na **1500** a teprve
  pár…") — je to pokračování věty, ne porušení pravidla.
