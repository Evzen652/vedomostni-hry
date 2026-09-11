# Obsahový dluh — audit obsahu a konzistence 2026-09-10

Co audit našel a co zbývá opravit ručně. **Mechanické vady jsou opravené** (velká písmena
u možností, uvozovky, výpustky, texty v appce — viz CLAUDE.md pod 2026-09-10); tady je jen
práce, která potřebuje úsudek. Seznamy jde kdykoli vygenerovat znovu:
`npm run audit:konzistence` → `data/audit-konzistence.json`.

---

## 1. Duplicity — HOTOVO 2026-09-10

Z každé dvojice zůstala jedna otázka a druhá dostala jiný fakt o tomtéž tématu. Id se
neměnila (vedou na ně odkazy z produkční D1). Osm přepsaných otázek přišlo o obrázek, který
ukazoval starou odpověď; nové `irony_prompt` jsou připravené a prošly `lint-irony`.

| Zůstala | Přepsaná → nový fakt |
|---|---|
| `cz-t-navratilova-wimbledon` | `cz-t-navratilova-wimbledon-2` → 49 let při posledním grandslamu (US Open 2006) |
| `cz-q-nemcova-babicka` | `cz-t-lide-nemcova-babicka` → na které bankovce je Němcová |
| `cz-q-foglar-rychle-sipy` | `cz-t-lide-foglar-rychle-sipy` → skautská přezdívka Jestřáb |
| `cz-q-smetana-hluchota-ma-vlast` | `cz-q-smetana-ma-vlast-hluchota` → rodiště Litomyšl |
| `cz-q-hasek-dominator` | `cz-q-hasek-dominator-prezdivka` → dvě Hartovy trofeje (1997, 1998) |
| `cz-q-slovo-robot` | `cz-q-capek-slovo-robot` → román Válka s mloky |
| `cz-k-spejbl-a-hurvinek` | `cz-k-spejbl-hurvinek` → pejsek Žeryk (obrázek zůstal, pejsek na něm je) |
| `cz-k-kraslice` | `cz-k-kraslice-velikonocni-vejce` → velikonoční beránek |
| `cz-k-ctyrlistek` | `cz-k-ctyrlistek-komiks` → městečko Třeskoprsky |

Cestou opravena faktická chyba v `cz-k-ctyrlistek`: hrdinové jsou kocour, pes, **prasátko**
a králík, ne „myšák“. Obrázek té otázky myš ukazuje — prompt je opravený, obrázek čeká na
přegenerování.

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
- **Hašek** — `cz-t-lide-hasek-branbar` („přezdívalo Dominátor") prozrazuje zbylou otázku na přezdívku (`cz-q-hasek-dominator`).
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

## 3. Odpověď přímo v zadání — HOTOVO 2026-09-10

Přepsané jen zadání, odpověď i obrázek zůstaly: `cz-k-moravske-kolacky`, `cz-k-ch-jedno-pismeno`,
`no-k-nisse-rysova-kase` (místo „Perníčku“ mezi kašemi je „Krupicová kaše“, jinak by vypadl
z řady) a `cz-k-hus-hacek-carka` (opraven i minulý čas s rodem v obou hláškách).

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
| S ilustrací | 861 (31 %) | 272 (27 %) |
| S „Více o…“ | 1 927 (70 %) | 290 (29 %) |
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
