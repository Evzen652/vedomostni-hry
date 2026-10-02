# Psaní nových otázek po dávkách (nástroje kampaně)

Nástroje, kterými se 30. 9.–1. 10. 2026 napsalo **40 nových otázek na každou z 55 zemí**
(+2 200, fond 4 012 → 6 212). Dřív ležely ve scratchpadu mimo repo; od 2. 10. jsou tady,
aby přežily přesun na jiný počítač.

Pracovní složka **`.obsah/`** je gitignorovaná a vznikne při prvním spuštění:

| Složka | Co v ní je |
|---|---|
| `.obsah/kontext/<cc>.txt` | výpis VŠECH existujících otázek země (agent z něj bere, co už NEpsát) |
| `.obsah/nove/<cc>.json` | dodávky agentů (přejímka čte jen soubory pojmenované kódem země) |
| `.obsah/hotovo/<cc>.json` | už zapsané dodávky (přejímka je tam odsune, ať se nezapíšou podruhé) |

## Postup jedné vlny (5–8 zemí najednou)

```bash
node scripts/obsah/priprav-kontext.js     # 1× na začátku a po každé vlně (fond se mění)
```

1. **Agent na zemi.** Dej mu krátký prompt: odkaz na `scripts/obsah/ZADANI.md`, jeho
   `.obsah/kontext/<cc>.txt` a cestu výstupu `.obsah/nove/<cc>.json`. Vše ostatní je v zadání.
   **Vlny po 5–8 agentech, ne po patnácti** — při pádu na limitu relace se přijde o míň práce.
2. **Přejímka** — kontroluje a nic nezapisuje:
   ```bash
   node scripts/obsah/prijmi.js            # --vse = všechna varování
   ```
   Chyby blokují zápis. **Varování čti všechna, ne jen chyby** — většina skutečných nálezů
   kampaně (rizikové slovo v promptu, odpověď delší než distraktory) byla jen ve varováních.
3. **Zápis** (jen čisté země, ostatní nech doběhnout):
   ```bash
   node scripts/obsah/prijmi.js --zapis --jen=pl,ua
   ```
4. **Dokončení** — `build-index` je povinný (index počtů + mapa konfliktů), pak validace a testy:
   ```bash
   node scripts/obsah/dokonci.js
   ```
   Hlídá i to, že **serverových otázek je pořád 220** (viz pasti níže).
5. **Ověř nálezy auditu** (`npm run audit:konzistence`): dvojice, které si prozrazují
   odpověď, musí být v `data/konflikty.json`. Pak commit a push.

## Pasti zaplacené kampaní — ať se nehonily znovu

1. **`online_only: true` u otázek s `-s-` v id je PŮVODNÍ serverový fond (4 na zemi, 220 celkem),
   ne bug agentů.** Vypadá to jako podezřelý vzorec; není. Omylem se mu jednou odebral příznak
   (28 otázek) a musel se vracet podle `git show <commit před dávkou>:data/questions/<cc>.json`.
   Před zásahem do `online_only` vždy porovnat s tím, co bylo PŘED dávkou. `dokonci.js` to hlídá.
2. **Agent s 40 otázkami naráz umí spadnout na limitu délky odpovědi** (64 000 tokenů).
   Řešení je v zadání: psát po 10 a zapisovat přírůstkově, odpovídat krátce.
3. **Výpadek sítě (`ENOTFOUND`) shodí VŠECHNY běžící agenty naráz** a nic po nich nezůstane.
   Není to chyba práce: ověř `curl`, `.obsah/nove/` je prázdná → spusť znovu.
4. **Přejímka může potkat soubor rozepsaný**, scratchpad je s agenty sdílený. Proto tvrdá
   kontrola přesně 40 otázek a `--jen=` pro cílený zápis. Agent navíc občas dopíše soubor
   i potom, co byl odsunut do `hotovo/` — pozdní verzi porovnej, nepřepisuj naslepo.
5. **Fakta „z paměti neověřeno" z hlášení agenta ověřuj VŽDY.** Našly se tak dvě skutečné
   chyby (PewDiePie přišel o první místo 2019 kvůli T-Series, ne 2024 kvůli MrBeastovi;
   žralok obrovský × velrybí jsou dva druhy).
6. **Riziková slova v `irony_prompt` i v záporu.** Dřívější výjimka „je-li tam `blank`/`bare`,
   zápor je v pořádku" pustila `plaque`, `banner`, `signs`, `written`, `scoreboard` — a to je
   zdokumentovaná past. Přejímka ji nyní nemá; 26 promptů se muselo opravit dodatečně.
7. **Planý poplach `audit:konzistence`: „chybí diakritika — hlavni"** je správný 6. pád od
   „hlaveň" („v hlavni"). A „id obsahuje slovo z odpovědi" je u VEŘEJNÝCH otázek šum
   (platí jen pro `online_only`, proto ho přejímka nehlásí).
8. **Neověřuj regulární výrazy jen dojmem.** Dvě slepé kontroly (průběhový tvar
   „filling/dominating the frame"; „texture" ⊃ „text") se našly až mutací. Nová kontrola
   se ověřuje mutací: vlož do dávky záměrnou chybu a ověř, že ji přejímka chytí.

## Co tahle dávka NEdělá

- **Neilustruje.** Nové otázky mají `irony_prompt`, ale ne obrázek. Generuje se zvlášť
  (`scripts/batch-irony-images.js`, kontrola očima přes `scripts/ilustrace/*`); pořadí je
  vždy **prompty → `npm run lint-irony` → teprve obrázky**.
- **Nenasazuje.** Nasazení je postup z `docs/nasazeni.md` (migrace → obsah → kód).
