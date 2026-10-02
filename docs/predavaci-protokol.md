# Předávací protokol

Pro novou session (i na jiném počítači). Sepsáno **7. září 2026**, **naposledy aktualizováno
2. 10. 2026** — hlavní blok „Předání na druhý počítač“ je hned pod prvním vzkazem v bodě 0.
Starší session z 26.–28. 9. mimo jiné:
- **zrušila přátele s kódem a nahradila je výzvami podle přezdívky** (vlastní tabulka
  `challenges`, hra vzniká až přijetím; lobby nově ukazuje příchozí výzvy a hry na tahu),
- **předělala odvetu proti člověku na výzvu** a odmítá vzájemnou výzvu,
- **přidala rozbor po hře** (karty s ilustrací a štítky) do online i do sóla, školy a párty,
- **založila serverový fond: 220 otázek `online_only`** (4 na zemi, pásmo dospělí), všechny
  s ilustrací prošlou kontrolou očima, a zavřela dvě díry, kudy šlo odpověď zjistit předem
  (id otázky a přednačtená ilustrace).

Fond je teď **6 212 otázek: 5 992 veřejných + 220 serverových.** Z toho **2 200 nových
(kampaň 30. 9.–1. 10.: 40 na každou z 55 zemí) je BEZ ilustrace a NENASAZENÝCH.**
(Do 29. 9. bylo 4 012 otázek, všechny s malovanou ilustrací.)

Tenhle soubor je **protokol**: co převzít, co ověřit, co je zakázané a co dělat
v jakém pořadí. Konvence a všechna rozhodnutí (včetně podrobností k 26. 9.) jsou
v [CLAUDE.md](../CLAUDE.md). [pokracovani.md](pokracovani.md) je jen historický snímek ze 7. 9.

---

## 0. Čím začít novou session

Zkopíruj do prvního vzkazu:

> Pokračuju v projektu Cestokvíz. Přečti si `docs/predavaci-protokol.md`, proveď převzetí
> podle bodu 2 a řekni mi, jestli stav sedí. Pracuje se na větvi `claude/pokracujeme-e79708`.

**Pozor na worktree:** nová session často startuje v čerstvém worktree na jiné, starší větvi.
Nejdřív `git fetch` a posunout se na `origin/claude/pokracujeme-e79708` (fast-forward),
teprve pak cokoli ověřovat.

### ⇢ PŘEDÁNÍ NA DRUHÝ POČÍTAČ — stav k 2. 10. 2026 (čti TOHLE jako první)

**Jednou větou:** kampaň „40 otázek na každou zemi“ je hotová a pushnutá (55 zemí, fond 4 012 →
**6 212**), ale **nic z ní není nasazené a žádná z 2 200 nových otázek nemá ilustraci.** Kód
aplikace se v kampani nezměnil (jen generovaný `functions/_lib/konflikty.js`), takže nasazení
je čistě obsahové. `master` (= produkce, `3028f62`, nasazení `90bbd12c`) je o dvacet a víc commitů za touhle větví;
ty commity jsou jen data, dokumentace a nástroje. **3. 10. se `master` sloučil do této větve**
(merge `dd015e9`), takže i nasazení odsud už používá doménu `cestokviz.cz`.

**1. Převzetí na novém počítači**

```bash
git clone https://github.com/Evzen652/vedomostni-hry.git && cd vedomostni-hry   # nebo jen `git fetch`
git checkout claude/pokracujeme-e79708 && git pull
npm install
```

**2. Lokální tajemství — NEJSOU v gitu, musí se založit ručně**
- Zkopíruj `.dev.vars.example` na `.dev.vars` (řádek `ALLOW_DEV_SECRET=1` je nutný, jinak lokální
  server odmítne podepisovat tokeny a registrace padá na 500).
- **`GEMINI_API_KEY=`** doplň vlastním klíčem z ai.studio (formát `AQ.…`). Nikdy ho necommituj.
  Na prvním počítači řádek v `.dev.vars` byl, ale **neověřeno, že klíč platí a má kredit** —
  první neúspěšný požadavek to ukáže (429 = bez kreditu).
- `.batch-irony.json` (stav dávky ilustrací) je taky jen na jednom stroji a nejde do gitu. **Dávku
  odeslanou na jednom počítači nevyzvedneš na druhém**, dokud ten soubor nezkopíruješ.

**3. Ověř, že stav sedí (očekávaná čísla)**

```bash
npm run validate                      # CHYBY: žádné; „serverový fond: 220 z 6212“
npm run test:offline                  # VŠE V POŘÁDKU: 917 kontrol
node scripts/obsah/test-prijmi.js     # VŠE OK: 8 z 8
node scripts/obsah/dokonci.js         # exit 0; build-index nic nezmění (git status zůstane čistý)
```

Lokální API testy (`npm run db:init`, `npm run dev`, `npm run test:api`) naposledy prošly 184
kontrol; tuhle kampaň se nespouštěly, protože se nezměnil žádný kód ani schéma. Pokud je chceš
pustit, **dev server při tom nesmí běžet souběžně s `npm run build`** (past z 2026-09-25).

**4. Fronta práce — v tomto pořadí**

> **ROZHODNUTÍ HRÁČE 2. 10.: nové otázky se NENASAZUJÍ, dokud nemají ilustrace.** Body D níže
> (nasazení otázek) je proto ODLOŽENO do dokončení bodů B a C. Web a Google Play pokračují bez
> nových otázek — viz bod F. Pozor, past: build kopíruje celé `data/questions`, takže jakékoli
> nasazení z této větve by nové otázky vyneslo (podrobně v bodě F).

**A. Prompty k ilustracím — HOTOVO 2. 10.** `npm run lint-irony`: 0 chyb. Všech 86 nových promptů
s varováním je projito očima ([lint-irony-nove-prompty.txt](lint-irony-nove-prompty.txt)). Opraveno: 3×
dominanta, `ph-k-fialova-hlizka` (kreslil zmrzlinu místo hlízy ube — ilustrace má kreslit ODPOVĚĎ)
a `pe-d-koren-z-nejvyssich-vysek` (dvojznačný tvar kořene). Zbylých 84 varování „jídlo bez zjevného
tvaru“ je jen mezera ve slovníku lintu (nezná bowl/glass/jar/pot/pie…); první věta je u všech
konkrétní, takže jsou zkontrolovaná a **nepřecházej je znovu**.

**B. Ilustrace — všech 2 200 nových otázek je bez `img/<id>.jpg`.** `irony_prompt` mají napsané
a v kampani opravené (26 promptů s rizikovým slovem, viz zápis 2026-10-01).
- **Náklad:** dávkou ~$0,034 za obrázek, tedy **~$75** za všechno. **Rozpočet potvrď s hráčem,
  nespouštěj to sám.**
- **Velikost:** ~220 kB na obrázek → **+~490 MB**. `img/` má dnes 4 039 souborů a 844 MB, po
  doplnění ~1,3 GB. GitHub doporučuje repo pod 1 GB; limit Pages je 20 000 souborů (6 200 je v
  pořádku). Kdyby velikost začala vadit, cesta ven je Cloudflare R2 (zápis 2026-08-28).
- **Postup:** nejdřív zkušební dávka JEDNÉ země, očima zkontrolovat, teprve pak zbytek.
  ```bash
  node scripts/batch-irony-images.js submit --cc <cc>   # pak `status`, po doběhnutí `fetch` (do 24 h)
  ```
- **Kontrola očima je povinná** (archy 3×3 `scripts/ilustrace/archy.js`, arch rohů `rohy.js`,
  zvětšený výřez `vyrez.js`). Historická míra vad je ~10 %; opravy přes `submit --only id,id`
  (starý obrázek nejdřív přesunout stranou, jinak ho `submit` přeskočí). Pasti (podpis v rohu,
  text na dresech, vlajky, jídlo bez tvaru, reálné osoby) jsou v CLAUDE.md, sekce „Ilustrace“
  a zápisy 2026-09-12 až 09-25.

**C. Po obrázcích zvýšit `VERZE` v `sw.js`** (obrázky jsou cache-first, hráč s naplněnou cache
by jinak viděl staré), commit a push.

**D. Nasazení nových otázek — ODLOŽENO do ilustrací (rozhodnutí 2. 10.)**, až budou hotové, přesně podle [nasazeni.md](nasazeni.md): migrace žádné (schéma beze změny), pak
`db:sync --check --remote` → `db:sync` → `wrangler d1 execute zemekviz --remote
--file=data/d1-sync.sql` → posunout `master` (`git push origin HEAD:master`, ve worktree ne
`git fetch . …`) → `npm run deploy` (`--branch master` už je ve skriptu). **Stav produkce zapsat
PŘED i PO** (naposledy 1 lidský hráč, 18 botů, 1 hra, 19 ratingů) a ověřit, že **serverových
otázek je pořád 220**. Ověřuj OBSAH na ostré adrese, ne stavový kód (SPA fallback vrací 200
na cokoli). **`npm run db:init:remote` se nikdy nespouští.**

**E. Vlastní doména `cestokviz.cz` — HOTOVO 3. 10.** (připojena, `WEB` přepnuto, nasazeno; podrobnosti
v bodě F1–F2). Zbývá nepovinné `www` a DNSSEC.

**F. Web a Google Play BEZ nových otázek** (běží souběžně s B, nezávisle na ilustracích)
- **Větev:** práce se dělá na větvi založené na `master` (např. `claude/web-play`), ne na této.
  Nasazuje se z ní — build vezme to, co je v checkoutu, takže nové otázky se na web nedostanou.
  Obsahovou větev `claude/pokracujeme-e79708` spojit a nasadit až s obrázky (konflikty čekej
  jen v dokumentaci, kód se nepřekrývá).
- **F1. Doména — HOTOVO 3. 10.** V Cloudflare (Workers & Pages → `zemekviz` → Custom domains)
  přidána `cestokviz.cz`: stav **Active**, **SSL enabled**, záznam `CNAME @ → zemekviz.pages.dev`
  vytvořil dashboard sám. **Zbývá `www.cestokviz.cz`** (nepovinné, `www` dnes neexistuje:
  `Non-existent domain`) — stejný postup: Set up a custom domain → `www.cestokviz.cz` → Continue
  → Activate domain. Pošta (MX na Thinline) je nedotčená. **Past v menu:** nové menu dashboardu
  nemá samostatné „Workers & Pages“, je pod **Compute**; přímý odkaz je
  `https://dash.cloudflare.com/3005fa92056c05be6e87ea85a5df5ab9/pages/view/zemekviz`.
  **Past při ověřování:** tenhle počítač si krátce pamatoval „doména neexistuje“ a `curl` vracel 000,
  i když `nslookup … 8.8.8.8` už adresy dával; ověřuj přímo a pak počkej.
- **F2. `WEB` přepnuto a nasazeno — HOTOVO 3. 10.** `scripts/build-public.js` → `https://cestokviz.cz`,
  commit `3028f62` na `master`, `npm run deploy` → **nasazení `90bbd12c`**. Ověřeno na obou adresách
  (`cestokviz.cz` i `zemekviz.pages.dev`): `og:url`/`og:image`/`canonical` míří na `cestokviz.cz`,
  žádný nedosazený `{{WEB}}`, `manifest.json` je skutečný manifest, `/api/leaderboard` 401, součet
  v indexu 3 792 (nové otázky venku nejsou). **Předchozí nasazení pro návrat: `d1ad786b` (`5c28dea`).**
  `zemekviz.pages.dev` dál funguje a servíruje totéž. **Zbývá zapnout DNSSEC** v Cloudflare
  (DNS → Settings → DNSSEC → Enable; DS záznam se pak musí vložit u registrátora — viz zápis 30. 9.).
- **F3. Google Play (TWA):** podklady k vydání (texty listingu, grafika 1024×500, snímky
  obrazovky, ikona 512 už je) se dají připravit hned; zbytek čeká na doménu: účet Play Console
  (poplatek, ověření identity — hráč), balíček přes PWABuilder, `/.well-known/assetlinks.json`
  s otiskem klíče **app signing** (ne upload klíče; musí se dostat do `build-public.js`, jinak se
  na web nenasadí), interní testování, vydání. Ilustrace se do balíčku nevejdou, obal je
  bere z webu — nová verze obrázků se tedy do appky v Play dostane nasazením webu.
- Právní stránky a zásady jsou nasazené; kontakt `ahoj@cestokviz.cz` je třeba ověřit, že
  skutečně přijímá poštu (Google Play chce kontaktní e-mail vývojáře).

**5. Tvrdá pravidla, která tuhle kampaň stála nejvíc**
- **`online_only: true` u otázek s `-s-` v id je PŮVODNÍ serverový fond (4 na zemi, 220
  celkem), ne chyba.** Nesahej na něj bez porovnání se stavem před zásahem.
- **Rizikové slovo v `irony_prompt` je past i v záporu** (`banner`, `plaque`, `sign`, `written`,
  `writing`, `scoreboard`…). Plochu popiš kladně („smooth and completely bare“).
- **Fakta, která agent hlásí jako „z paměti neověřená“, se ověřují vždy** — dvě skutečné chyby
  kampaně se našly právě tak.
- Zbytek tvrdých pravidel je v sekci „3. Tvrdá pravidla“ níže a v CLAUDE.md.

**6. Další dávka otázek** (kdyby bylo potřeba dopsat další země nebo další dávku): nástroje a
celý postup jsou v [`scripts/obsah/README.md`](../scripts/obsah/README.md).

**7. Co čeká na rozhodnutí hráče:** rozpočet na ilustrace (bod B), přidání domény v dashboardu
(bod E) a produktové body z revize 29. 9. (sdílení výsledku s obrázkem hráč 29. 9. zamítl;
monetizace a růst počtu hráčů zůstávají otevřené — viz sekce „4. Fronta práce“ a „5. Rozhodnutí, která čekají na hráče“ níže).

### Stav k 29. 9. (historie — nasazení, které proběhlo; pro souvislosti)

**Všechno je commitnuté a pushnuté** — stačí `git pull`. Dev server na konci session
neběží; to je normální stav mezi sezeními.

**NASAZENO 29. 9. na `eb38f15`** (předtím `0dfa574` ze 16. 9., tedy 76 commitů najednou).
Postup podle [nasazeni.md](nasazeni.md) proběhl celý: migrace výzev, `db:sync --remote`,
`npm run deploy`. **Momentálně na produkci nic nečeká.**
- **Stav produkce se zapsal PŘED i PO zásahu a sedí:** 1 živý hráč, 18 botů, 1 hra,
  19 ratingů — beze změny. Otázek 3 742 → **4 012** (z toho 220 serverových), žádná otázka
  nepřišla o svůj `rating`. Migrace výzev vynulovala jediný `friend_code`, který v produkci
  byl, a `DELETE FROM friends` nesmazal nic (tabulka byla prázdná).
- **Ověřeno na ostré adrese, ne podle výstupu deploye:** `quiz.js` i `online.js` jsou
  bajtově shodné s repem, `/api/challenge` vrací **401 místo „no such table“** (tedy migrace
  platí), `/api/leaderboard` bez přihlášení 401, `sw.js` i manifest 200, `CLAUDE.md` vrací
  totéž co vymyšlená cesta (není venku). Rozcestník, registrace i sólo hra odehrány
  v prohlížeči, konzole čistá.
- **Neověřeno v produkci:** registrace a online duel. Založený účet by po sobě nechal
  náhrobek „Smazaný hráč“, takže to kryje jen lokální `test:api` (184 kontrol).
- **Past, na kterou se doplatilo:** `git fetch . HEAD:master` **selže ve worktree**, protože
  `master` je checkoutnutý v hlavním repu („refusing to fetch into branch“). Postup z CLAUDE.md
  2026-09-11 tedy odtud nefunguje; cesta je `git push origin HEAD:master` (odmítne cokoli
  jiného než fast-forward) a pak v hlavním repu `git -C <repo> merge --ff-only origin/master`.

**Co se na 26. 9. neověřovalo proti zdrojům:** fakta v serverových otázkách prošla ručně,
ne rešerší. **Dvě místa, která si agenti sami označili, jsou ověřená 29. 9.:**
- **Gabon 1958 — platí.** V říjnu 1958, těsně po referendu o Francouzsko-africkém
  společenství, poslala M'baova vláda přes Louise Sanmarca do Paříže žádost o status
  francouzského departementu; Paříž ji odmítla. (Wikipedie datuje do listopadu 1959
  M'baovo VEŘEJNÉ prohlášení, které Foccart označil za nemyslitelné — není to spor,
  jsou to dvě události.) Výsadkáři ve vysvětlení sedí: 18.–19. 2. 1964, z Dakaru a Brazzaville.
- **Vietnamský „Tisíciletý strom“ — BYL ŠPATNĚ, opraveno.** `more_fact` u
  `vn-s-nejstarsi-narodni-park` tvrdil, že strom „roste“ a že „jeho kmen by objalo jen
  několik lidí“. Strom **uschl** (Dân trí, 2023: zhruba pět let předtím, stářím) a k obejmutí
  kmene je potřeba **kolem dvaceti lidí** (průměr ~5 m). Otázka sama je správná — Cúc Phương
  je nejstarší národní park, vyhlášený 1962. Ověřena i otázka o pepři: Vietnam drží ~45 %
  světového vývozu. **Při nasazení to chce `db:sync --remote`**, text otázky je v D1.

**Zastarávající formulace, NEOPRAVENO** (na rozhodnutí hráče): `more_fact` u gabonské otázky
říká „francouzská armáda má v Libreville vojenský tábor dodnes“. Formálně platí, ale Camp de
Gaulle je od léta 2024 společně řízené výcvikové středisko a francouzských vojáků tam od
července 2025 zůstalo kolem stovky (2023: 380). Věta zní silněji než skutečnost.

**Poučení k postupu:** fakta v serverových otázkách nikdo proti zdrojům neprojel celá —
ověřovala se jen ta dvě označená, a JEDNO z nich bylo špatně. U dalších dávek se vyplatí
rešerše aspoň u tvrzení s letopočtem, rozměrem nebo přítomným časem („dodnes“, „roste“),
protože přesně ta stárnou nebo se nafukují.

### ROZDĚLANÉ 30. 9.: +40 otázek na každou zemi (2 200 celkem)

Zadal hráč v noci 30. 9. s tím, že se má pracovat autonomně. **Fond 4 012 → cíl 6 212.**
Dává to smysl hlavně proto, že **41 z 55 zemí má dnes pod 60 otázek** — u nich se fond
prakticky zdvojnásobí a přestanou být přívěsky Česka (viz revize 29. 9.).

**Rozhodnutí, která padla bez hráče** (spal):
- **rozložení pásem 13 / 13 / 14** (děti / puberťáci / dospělí) na zemi — vyrovnává
  dnešní nepoměr a zvedá podlahu 12 otázek na zemi × pásmo, která se opakovaně propadá,
- **jen veřejné otázky**, žádné `online_only` — serverový fond má vlastní pravidla,
- **`irony_prompt` se píše rovnou**, i když ilustrace zatím generovat nejde.

**Postup:** jeden agent = jedna země, po vlnách (limit 20 souběžných). Každý dostane
**kompletní výpis existujících otázek své země** (`scratchpad/kontext/<cc>.txt`), jinak
duplikuje — past zaplacená v srpnu, kdy při 450 otázkách vzniklo 19 kolizí.

**Přejímka `scratchpad/prijmi.js`** kontroluje dávku PŘED zápisem do fondu, protože
`npm run validate` běží až nad fondem, tedy když je chyba uvnitř. Hlídá povinná pole,
sekce ze seznamu, ASCII id, kolize id proti celému fondu, odpověď v zadání, malé písmeno,
minulý čas s rodem včetně staženého tvaru („uhodls“), délku `more_fact` a to, jestli si
`irony_prompt` neříká o text. Zapisuje jen země úplně bez chyb, ve formátu 1 mezera + CRLF.

**⚠ BLOKÉR ILUSTRACÍ: `GEMINI_API_KEY` není v `.dev.vars` ani v prostředí.** Bez něj
nejde vygenerovat nic, ani po dobití kreditu. Zadání k obrázkům se píšou rovnou, takže
po doplnění klíče stačí spustit dávku po zemích. **2 200 ilustrací vyjde v batchi zhruba
na 75 USD** a kontrola očima je práce na dny, ne na jednu noc — negenerovat naslepo.

**Dvě pasti přejímky, obě zaplacené hned v první vlně:**
- **Agenti si práci dělí do pracovních souborů** (`part-a.json`, `_p1.json`) a nechávají
  je ležet vedle hotové dodávky. Přejímka je četla jako finální a hlásila desítky
  falešných chyb („cc je br, čekám part1“). Bere proto **jen soubory pojmenované
  kódem země**; zadání agentům nově říká, ať části na konci slučí a smažou.
- **Zapsaná dodávka se MUSÍ odsunout do `hotovo/`.** Agent ohlásí dokončení až poté,
  co soubor zapsal, takže notifikace dorazí i pro zemi, kterou přejímka mezitím
  zpracovala — a další běh s `--zapis` by ji přidal do fondu PODRUHÉ. Poznalo by se to
  až na validaci, s dvojnásobkem otázek uvnitř. Ověřeno, že k tomu u prvních tří zemí
  nedošlo (počet otázek = počet unikátních id).

**PŘERUŠENO 30. 9. ve 2:30 — LIMIT RELACE, ne chyba.** Patnáct agentů spadlo naráz na
`rate_limit 429` („session limit, resets 4:20am“). **Hotovo je 5 zemí z 55:** Austrálie,
Čína, JAR, Brazílie a Egypt, tedy **+200 otázek** (fond 4 012 → **4 172**). Všechno je
commitnuté a pushnuté; ztratila se jen rozdělaná práce agentů, kteří nestihli zapsat.

- **Egypt dorazil doslova na hraně** — soubor byl na disku dřív, než agent spadl, takže
  přejímka ho normálně zpracovala. **Proto se dodávky ukládají po zemích, ne najednou.**
- **Zbývá 50 zemí.** Seznam v `scratchpad/kontext/_prehled.json` (stav PŘED dávkou);
  hotové poznáš tak, že `data/questions/<cc>.json` má o 40 otázek víc.
- **Postup pro pokračování je beze změny:** agent dostane jen krátký odkaz na
  `scratchpad/ZADANI.md` + svůj kontextový soubor a cestu výstupu. Zadání drží všechna
  pravidla i pasti, takže se do promptu nic opisovat nemusí.
- **Limit relace je tvrdý strop tempa.** Pět zemí = zhruba 15 agentů × ~330 tisíc tokenů.
  Další vlny je proto lepší pouštět po menších dávkách (5–8 zemí), ne po patnácti —
  spadne-li vlna, přijde se o míň rozdělané práce.

**PŘERUŠENO 30. 9. podruhé, opět LIMIT RELACE.** Druhá a třetí vlna doběhly celé
(12 zemí, +480 otázek), čtvrtá vlna (Finsko, Irsko, Peru, Filipíny, Portugalsko,
Vietnam) spadla na `rate_limit 429` ještě PŘED zápisem — ve scratchpadu `nove/`
po ní nezůstalo nic, takže se nemá co zachraňovat, jen zopakovat.

- **Hotovo je 18 zemí z 55:** Austrálie, Brazílie, Čína, Egypt, JAR (první vlna),
  Indie, Japonsko, Keňa, Mexiko, Nový Zéland, USA (druhá vlna), Belgie, Chile,
  Dánsko, Ekvádor, Fidži, Mongolsko, Tchaj-wan (třetí vlna).
  Fond **3 792 → 4 732** (+940 otázek), vše commitnuté a pushnuté.
- **Zbývá 37 zemí.** Seznam v `scratchpad/kontext/_prehled.json`, aktuální stav
  podle počtu otázek v `data/questions/<cc>.json` (hotová země má 80+ — 40 starých
  + 40 nových, u zemí s bohatším fondem víc).
- **Postup je beze změny, jen vlny po šesti agentech, ne po patnácti** (poučení
  z prvního přerušení 30. 9. v 2:30 platí i podruhé).
- **Dva drobné nástroje se osvědčily a zůstávají v `prijmi.js`:**
  `--jen cc,cc` pro cílený zápis jen vyjmenovaných zemí (když ostatní ještě běží),
  a tvrdá kontrola přesně 40 otázek na dodávku (scratchpad je sdílený s agenty,
  takže přejímka může soubor potkat rozepsaný).

**HOTOVO 30. 9. odpoledne: 30 ZEMÍ Z 55, cíl dávky dosažen.** Fond 3 792 → **5 212**
otázek (+1 420), serverový fond beze změny na **220** (4 na zemi × 55 zemí). Vše
commitnuté a pushnuté na `claude/pokracujeme-e79708` až po `8863d7b`.

- **Hotové země:** Austrálie, Brazílie, Čína, Egypt, JAR (vlna 1) · Indie, Japonsko,
  Keňa, Mexiko, Nový Zéland, USA (vlna 2) · Belgie, Chile, Dánsko, Ekvádor, Fidži,
  Mongolsko, Tchaj-wan (vlna 3) · Finsko, Filipíny, Irsko, Portugalsko (vlna 4) ·
  Gabon, Indonésie, Izrael, Jižní Korea, Norsko, Peru, Severní Korea, Vietnam (vlna 5).
- **Zbývá 25 zemí** (dopočet: 55 − 30 = 25, seznam pod 80 otázek v souboru má jen 21 —
  4 mají fond bohatší než 80 už z dřívějška a nejsou hotové; ověř přes
  `scratchpad/kontext/_prehled.json`, ne jen podle počtu): Pákistán, Malajsie, Turecko,
  Saúdská Arábie, Rumunsko, Thajsko, Polsko, Ukrajina, Argentina, Bulharsko, Řecko,
  Švýcarsko, Nizozemsko, Francie, Slovensko, Rakousko, Španělsko, Švédsko, Německo,
  Maďarsko, Spojené království + 4 další ze seznamu.
- **DVĚ TVRDÉ PASTI ZAPLACENÉ TÉHLE DÁVKOU, ať se nehoní znovu:**
  1. **Agent, co píše 40 otázek najednou, umí spadnout na limitu délky odpovědi**
     (64000 tokenů) — stalo se to Peru a Vietnamu i Indonésii. Řešení: zadat mu
     výslovně „piš po skupinách po 10 a zapisuj přírůstkově (Write, pak Edit/append),
     ne jeden obrovský finální výstup“ a „odpověz mi krátce, bez vypsaných promptů“.
     Po druhém běhu s touhle instrukcí to prošlo vždycky.
  2. **„-s-“ otázky s `online_only: true` v kontextovém souboru země NEJSOU nový bug
     agentů — je to PŮVODNÍ serverový fond z 26. 9.**, který si agenti správně
     nevšímali (nezopakovali). Vypadá to jako podezřelý vzorec (přesně 4 na každou
     zemi, div dělaný sedmi agenty najednou), ale je to tak schválně. **Nesahej na
     `online_only` u „-s-“ otázek, dokud neověříš proti stavu PŘED kampaní**
     (`git show 94e1301:data/questions/<cc>.json`) — jinak vyrobíš přesně tu chybu,
     kterou jsem si sám udělal a musel vzápětí opravovat (28 otázek, 7 zemí).
- **`prijmi.js` má dvě opravené slepé kontroly** (dominanta chytala jen „fills the
  frame“, ne průběhový tvar „filling“ ani „in the centre of the frame“; riziko textu
  chytalo „texture“ jako „text“) a dvě nové pojistky: tvrdá kontrola přesně 40 otázek
  na dodávku (scratchpad je sdílený s agenty, dodávka může být zastižena rozepsaná)
  a přepínač `--jen cc,cc` pro cílený zápis.
- **Postup pro pokračování beze změny:** agent dostane odkaz na `scratchpad/ZADANI.md`
  + svůj `kontext/<cc>.txt` + cestu výstupu, vlny po 6 zemích. Po každé vlně: `prijmi.js`
  (ruční kontrola varování, ne jen chyb — několik skutečných nálezů bylo jen ve
  varováních), `dokonci.ps1`, ověřit `serverovych` v `stav fondu` zůstává 220, commit, push.

**KAMPAŇ DOKONČENA 1. 10.: 55 ZEMÍ Z 55, +2 200 OTÁZEK (40 na zemi).** Fond 4 012 →
**6 212** (veřejných 5 992, serverových **220** beze změny). Commitnuto a pushnuto na
`claude/pokracujeme-e79708` až po `9680c63`. Předchozí tři zápisy o přerušeních výš jsou
jen historie — stav je tenhle.

- **CO ZBÝVÁ (a čeká na hráče, nic z toho nebylo spuštěno):**
  1. **Ilustrace: všech 2 200 nových otázek je bez obrázku** (`img/<id>.jpg` chybí),
     `irony_prompt` mají všechny napsané a prošly kontrolou. Generuje se
     `node scripts/batch-irony-images.js submit --cc <cc>` (dávka ~50 % ceny, řádově desítky
     dolarů za celek); `.dev.vars` teď řádek `GEMINI_API_KEY` obsahuje, ale **neověřeno, že
     klíč platí a má kredit**. Po vygenerování projít obrázky očima (postup a pasti výš
     v `CLAUDE.md`, nástroje v `scripts/ilustrace/`). Odhad míry vad ~10 %.
  2. **Nasazení:** `db:sync --remote` (otázky jsou v D1), pak `npm run deploy`; migrace
     žádné. Pořadí a pasti v `docs/nasazeni.md`. Po syncu ověřit `--check --remote`
     a že serverových je stále 220.
  3. **Zvednout `VERZE` v `sw.js`**, až přibudou obrázky (cache-first u obrázků).
  4. **PŘED generováním obrázků projít prompty, které `npm run lint-irony` hlásí** — u nových
     otázek je to **86 promptů** (85× „jídlo bez zjevného popisu TVARU“, 3× „nepojmenovaná
     dominanta“), seznam je v `docs/lint-irony-nove-prompty.txt`. 0 chyb. Jídlo bez tvaru je
     zdokumentovaná past (omáčka → zmrzlina), proto se tvar píše do PRVNÍ věty promptu.
  5. **Rizikové slovo v promptu se opravovalo i po commitu vln.** `prijmi.js` měl výjimku „je-li
     v promptu `blank`/`bare`/`unmarked`, zápor je v pořádku“, která pustila `plaque`, `banner`,
     `signs`, `written`, `writing`, `scoreboard`, `signpost` v záporu — přesně tu zdokumentovanou
     past. Dodatečně opraveno **26 promptů** (slovo pryč, plocha popsaná kladně), skenem
     nad všemi 2 200 novými. Zbývají jen neškodná „board“ (prkénko, šachovnice) a záměrné
     písmeno „I“ u `tr-k-dve-i-abeceda`. **Kdyby se přejímka použila znovu, výjimku zrušit.**
- **POUČENÍ Z TÉHLE KAMPANĚ, AŤ SE NEHONÍ ZNOVU:**
  1. **Agent píšící 40 otázek naráz umí spadnout na limitu délky odpovědi** (64 000
     tokenů). Pomohlo zadat „po skupinách po 10, přírůstkově, odpověz krátce“.
  2. **Výpadek sítě (`ENOTFOUND`) shodí VŠECHNY běžící agenty naráz** a nic po nich
     nezůstane. Není to chyba práce; ověřit síť (`curl`), `nove/` prázdná → spustit znovu.
  3. **„-s-“ otázky s `online_only: true` jsou PŮVODNÍ serverový fond** (4 na zemi),
     ne bug agentů. Omylem se jim `online_only` sebral a musel se vracet (git show 94e1301).
  4. **Agent nahlásí i fakta „z paměti neověřeno“ — to je nejcennější část jeho hlášení.**
     Ověřit je vždycky. Našly se tak dvě skutečné chyby: Švédsko tvrdilo, že PewDiePie
     přišel o první místo až 2024 kvůli MrBeastovi (T-Series ho předběhl už 2019), a
     Saúdská Arábie slučovala žraloka obrovského a velrybího jako synonyma (stejná záměna
     jako u filipínského `ph-k-zralok`).
  5. **Kontrola varování, ne jen chyb.** Většina skutečných nálezů (scoreboard, banner,
     „labels“ v záporu, odpověď delší než distraktory) byla jen ve varováních `prijmi.js`.
     Varování „id obsahuje slovo z odpovědi“ je u VEŘEJNÝCH otázek šum.
  6. **Kontrola „odpověď v zadání“ chytá i věci, co nejsou chyba:** „v hlavni“ je správný
     6. pád od „hlaveň“, ne chybějící diakritika.
- **Nástroje kampaně jsou od 2. 10. V REPU: `scripts/obsah/`** (`ZADANI.md`, `prijmi.js`,
  `priprav-kontext.js`, `dokonci.js`, `test-prijmi.js`, `README.md`); pracovní složka
  `.obsah/` je gitignorovaná. Přejímka má navíc opravené slepé kontroly (rizikové slovo i v
  záporu, „tys“, příznak `online_only` na nové otázce) — **postup a pasti viz
  `scripts/obsah/README.md`**.

**Stav a co dělat dál:** hotové země poznáš podle počtu v `data/questions/<cc>.json`
proti `scratchpad/kontext/_prehled.json` (ten drží stav PŘED dávkou). Co se nestihlo,
dopíše se stejným postupem; prompt pro agenta je v historii session z 30. 9.

### ROZDĚLANÉ 30. 9.: přechod na doménu cestokviz.cz

**Appka pořád běží na `zemekviz.pages.dev`.** Doména `cestokviz.cz` je koupená u Thinline
(registrátor REG-THINLINE, zapsaná 25. 9. 2026) a přechází na Cloudflare DNS. Stav:

- **HOTOVO:** zóna `cestokviz.cz` přidaná do Cloudflare (Free), sken našel 2 A, 2 AAAA a
  **2 MX**; čtyři parkovací záznamy na `91.239.200.85` smazané, **oba MX ponechané jako
  DNS only** (`mx1d10.thinline.cz` prio 10, `mx1b20.thinline.cz` prio 20).
- **HOTOVO:** v administraci Thinline spuštěná deaktivace DNSSEC.
- **HOTOVO 30. 9. v 02:04:** DNSSEC dokončil deaktivaci (DS zmizel ze zóny `.cz`, ověřeno
  na dvou autoritativních serverech) a **delegace se překlopila na Cloudflare**.
  `keaton.ns.cloudflare.com` + `melinda.ns.cloudflare.com` vrací 8.8.8.8 i 1.1.1.1.
  **Pošta přechod přežila:** MX dál `mx1d10.thinline.cz` (10) a `mx1b20.thinline.cz` (20).
  Nový NSSET v registru je `CH-251976-20260930010035`.
  - **Varování Českého hostingu („změnu NS provést až 24 h po zahájení deaktivace“) bylo
    v tu chvíli plané** — jejich administrace se řídí zahájením procesu, ne jeho koncem.
    Rozhodující je DS záznam v zóně `.cz`, a ten byl pryč PŘED změnou NSSETu.
- **ZBÝVÁ — a první krok musí udělat hráč:**
  1. **Pages → projekt `zemekviz` → Custom domains → Set up a custom domain**, přidat
     `cestokviz.cz` a `www.cestokviz.cz`. **Přes wrangler to nejde** (`pages domain`
     neexistuje) a **ani přes API**: OAuth token wrangleru má scope jen na Pages,
     dotaz na zóny vrací 403. Je to pár kliknutí v dashboardu.
  2. přepnout konstantu `WEB` v `scripts/build-public.js` na `https://cestokviz.cz`
     a nasadit (`npm run deploy`),
  3. ověřit: appka na nové adrese, platný certifikát, náhled pro sdílení ukazuje na
     novou doménu a **MX pořád míří na Thinline**,
  4. zapnout DNSSEC znovu, už v Cloudflare (jedno tlačítko, DS se do registru nahlásí sám).

  **Do doby, než proběhne krok 1, se konstanta `WEB` NEPŘEPÍNÁ** — `og:image` by ukazoval
  na adresu, která ještě nic neservíruje, a odkaz by ztratil náhled.

**⚠ Pravidlo, které platí i do budoucna:** nikdy nepřepínat nameservery, dokud je DS
záznam v zóně — doména i pošta by se staly nedostupnými pro validující resolvery.

**Otevřené:** jestli u Thinline existuje schránka `ahoj@cestokviz.cz`. Je uvedená
v právních stránkách jako kontakt pro žádosti o výmaz, takže bez ní ten slib neplatí.
**Nezodpovězená otázka na hráče:** mají příchozí výzvy v lobby (`#zk-social`) stát nad
hrami, kde je hráč na tahu, nebo pod nimi? Dnes jsou výzvy první.

Ilustrace do UI (dlaždice, výsledkové obrazovky) jdou i bez klíče: hráč je vygeneruje
v chatu Gemini a uloží do `D:\weigle\plocha\Kvíz_ILUSTRACE`, session je jen zmenší
a napojí (postup viz CLAUDE.md, zápis 2026-09-15). Ilustrace k otázkám jdou přes
`scripts/batch-irony-images.js` a nástroje v `scripts/ilustrace/` (postup
v [predani-ilustrace.md](predani-ilustrace.md), pasti v CLAUDE.md).

**Pasti, na které se v poslední session doplatilo** (podrobně v CLAUDE.md 2026-09-26):
- `quiz.js` má **CRLF** — mutační skript musí mutovat LF kopii a zapisovat zpět s CRLF,
  jinak se kotvy s `\n` tiše neaplikují. Mutace, která se neaplikovala, nic nedokazuje.
- Mutační skript soudí podle **návratového kódu**, ne podle textu výstupu.
- `wrangler d1 execute --local` se při běžícím dev serveru **tiše zasekne** — server zastavit.
- `/api/me` vrací historii jen do 20 her; testy počítají hry **přibylé**, ne délku seznamu.
- JS `\b` zná jen ASCII; konec českého slova hlídá lookahead na česká písmena.
- `batch-irony-images.js submit --only` přeskočí otázku s existujícím `img/{id}.jpg` —
  vadný obrázek nejdřív přesunout stranou. Čekání na dávku: `node scripts/ilustrace/cekej-davka.js`
  jako jediný příkaz na pozadí (bez `&`).

---

## 1. Předmět předání

| Položka | Hodnota |
|---|---|
| Repo | `github.com/Evzen652/vedomostni-hry` |
| Pracovní větev | `claude/pokracujeme-e79708` — poslední commit viz `git log` |
| `master` | `eb38f15` (29. 9.) — srovnaný s pracovní větví |
| Produkce | `zemekviz.pages.dev`, nasazená z **`eb38f15`** 29. 9. (včetně migrace výzev a `db:sync --remote`) |
| Účtů v produkci | **1 živý hráč + 18 botů** — **nic se nesmí mazat** |

**Co je na větvi a NENÍ na produkci:** zjistíš `git log --oneline origin/master..HEAD`
(po nasazení 29. 9. je to prázdné).
Když mezi tím přibyly změny textů otázek, je při nasazení nutný `db:sync` (online hra
čte otázky z D1). Pořadí a pasti v [nasazeni.md](nasazeni.md). Sloučení do `master`
a nasazení jsou rozhodnutí hráče.

Skutečný stav vždy ověř přes `git log` a
`CLOUDFLARE_ACCOUNT_ID=3005fa92056c05be6e87ea85a5df5ab9 npx wrangler pages deployment list --project-name zemekviz`,
ne podle téhle tabulky.

---

## 2. Převzetí — proveď a ohlas výsledek

Šest kroků. U každého je uvedeno, co má vyjít; když vyjde něco jiného, **nepokračuj
a řekni to**, protože se liší prostředí, ne kód.

```bash
git fetch && git checkout claude/pokracujeme-e79708   # ve worktree: git merge --ff-only origin/claude/pokracujeme-e79708
npm install
```

**1) `.dev.vars`** — negituje se, v novém worktree i na novém počítači chybí. Vytvoř v kořeni:

```
ALLOW_DEV_SECRET=1
SESSION_SECRET=lokalni-test-tajemstvi-nepouzivat-v-produkci
GEMINI_API_KEY=<klíč z ai.studio, celý řádek>
```

**`GEMINI_API_KEY` je nutný jen pro generování ilustrací k otázkám** — bez něj
`batch-irony-images.js` neudělá nic. Klíč má hráč na `ai.studio/projects`; **nový formát
nezačíná „AIza"**, skripty berou celý řádek. Do gitu se nikdy nesmí dostat.

**2) Lokální databáze:** `npm run db:init` → v `questions` má být **4 012** otázek
(3 792 veřejných + 220 serverových, z toho `band = 'dospeli'` u serverových)
a **18** botů. Migrace se lokálně nepouštějí, `schema.sql` je má v sobě.

**3) Server:** `npm run dev` (port 8788), nebo ve worktree konfigurace `kviz-online-worktree`
z `.claude/launch.json` (port **8790**, servíruje ze živých souborů worktree) →
`/hra` se vykreslí do vteřiny a v síti se stáhnou **dva** soubory z `data/`
(`fondy.json`, `questions-index.json`). Když se stahuje 56 souborů a 4,7 MB, běží starý kód.

**4) Testy bez serveru:**

| Příkaz | Očekávaný výsledek |
|---|---|
| `npm run validate` | `CHYBY: žádné`, na konci „serverový fond: 220 z 4012 otázek“ (upozornění o chybějícím `image_prompt` jsou v pořádku — to je staré pole pro fotky) |
| `npm run test:offline` | **910** kontrol (26. 9. přibyly výzvy, rozbor ve všech režimech, odveta jako výzva, odložená ilustrace online a obecná pojistka proti minulému času s rodem) |
| `npm run test:pool` | 13 kontrol |
| `npm run test:auth` | 12 kontrol |
| `npm run test:ghost` | 67 kontrol |
| `npm run test:expire` | 8 kontrol |
| `npm run lint-irony` | **0 chyb**, ~76 varování (varování jsou prověřený šum) |
| `npm run audit:konzistence` | jen kategorie `prozrazuje_jinou` a `stejna_odpoved_spolecne_pasmo` (výstup JSON pak `git restore`) |

**4b) Nástroje na ilustrace** (`scripts/ilustrace/`):
`node scripts/ilustrace/archy.js kr 1` musí vyrobit arch do `.ilustrace/archy/`.
Když spadne na chybějícím `sharp`, chybí `npm install`.

**5) Testy proti serveru** (server musí běžet):
`API_BASE="http://127.0.0.1:8788" npm run test:api` (ve worktree port 8790) → **184** kontrol.
Jedna kontrola („usazený hráč silou bota pohnul") je **nedeterministická**; když spadne
jednou z několika běhů, není to regrese. Druhá taková („body z kola proti botovi se
přičetly") padala v ~6 % běhů, protože testovací hráč tipoval vždy A — od 14. 9. v tom
kole odpovídá správně (`playAll(…, true)`), takže už padat nemá.

**6) Ruční zkouška v prohlížeči:** Sólo jízda → Česko (druhá dlaždice) → Vybrat vše →
Dospělí → 10 otázek → odpověz. Musí platit:
- výběr kontinentu má nadpis „Kam se vydáme?" a pořadí Celý svět, Česko, Evropa…,
- po odpovědi je vysvětlení a obě tlačítka **pod ilustrací**, ne v kartě,
- kolem ilustrace nejsou rozmazané pruhy (rám ji obepne),
- pod obrázkem svítí zisk bodů **bez hvězdy**,
- na konci je nad „Výprava dokončena!" ilustrace batůžkáře.

**Past při kontrole textu:** v malém písmu screenshotu vypadá „é" jako „ě" (14. 9. tak
vznikl planý nález „Chodové Planě"). Text ověřuj z DOM nebo z dat, ne okem.

---

## 3. Tvrdá pravidla

Tohle nejsou doporučení. Každé z nich stálo v tomhle projektu škodu:

1. **`npm run db:init:remote` se nikdy nespouští.** Začíná `DROP TABLE` a v produkci
   jsou reálné účty, rating i rozehrané hry.
2. **Na produkci se nasazuje jen postupem z [nasazeni.md](nasazeni.md)** — pořadí
   migrace → obsah → kód, a `deploy` musí mít `--branch master`, jinak nasadí náhled
   a ostrá adresa dál servíruje starý kód.
3. **`git checkout -- soubor` na necommitnuté změny ne.** Na mutační testy se dělá
   kopie stranou; a když běží mutační skript, na dotčené soubory se mezitím nesahá
   (přepíše je ze snímku).
4. **Nová kontrola v testech se ověřuje MUTACÍ**, ne tím, že svítí zeleně — a základ
   musí PROCHÁZET, než se mutuje.
5. **Velká rozhodnutí se zapisují do CLAUDE.md hned**, jinak se příští session luští znovu.
6. **Paleta, rozměry a vzhled jsou území hráče.** Plošné změny (kontrast, dotykové
   cíle) se nabízejí, ne provádějí potichu.
7. **Skripty s regulárními výrazy a víc řádky se píšou nástrojem Write do scratchpadu**,
   ne jako `node -e` v Bashi ani heredocem — escapování je rozbije (znovu zaplaceno 15. 9.).

---

## 4. Fronta práce

**0. Ilustrace k otázkám — HOTOVO NADRUHÉ (3 792/3 792, 0 chybí, VŠECHNY malované). Bod
odstraněn z fronty.** 25. 9. dořešen druhý ilustrační dluh (202 otázek se starou fotkou
místo malované ilustrace) i druhé dorovnání podlahy fondu (+50 otázek). Kdyby v budoucnu
přibyla nová otázka nebo země, postup je popsaný v [predani-ilustrace.md](predani-ilustrace.md)
a nástroje v `scripts/ilustrace/`.

**Past, na kterou appka narazila opakovaně: commit po opravě zadání musí sáhnout i po
`data/questions/xx.json`, ne jen po `img/`** — víckrát se stalo, že oprava `irony_prompt`
zůstala jen na disku a commitly se jen nové obrázky. Než commitovat, zkontrolovat `git status`.

**0a. Podlaha fondu (12 otázek/zemi × pásmo) — HOTOVO NADRUHÉ.** Zadal hráč 15. 9., poprvé
dorovnáno týž den, ale appka mezitím dál rostla o nové otázky a podlaha se propadla znovu —
25. 9. znovu **29 kombinací pod 12, chybělo přesně 50**, dorovnáno stejným postupem
(paralelní agenti, `about` + `more_fact` + `irony_prompt` u každé nové otázky). Kdyby se
podlaha propadla potřetí (přibude-li dost nových otázek bez rovnoměrného rozložení mezi
pásma), postup je zdokumentovaný v CLAUDE.md 2026-09-25 a 2026-08-31.

**0b. UI drobnosti, které se nabízejí** (nic z toho není rozbité):
- Dlaždice kontinentů Severní Amerika, Jižní Amerika, Austrálie a Afrika se nedobarvovaly —
  sloužily jako barevný vzor při dobarvování ostatních. Kdyby se sjednocovalo dál, lokální skript na dobarvení (sytost
  jen u barevných míst, síla 0,25–1,0) je popsaný v CLAUDE.md pod 2026-09-15.
- ~~„Získal(a) jsi" na výsledku sóla~~ — **hotovo 26. 9.** („Celkem máš").

Pořadí dalších kroků je závazné — každý otevírá další. Plán celý viz artefakt
„Zeměkvíz do obchodů" (odkaz má hráč v chatu).

**A. Serverové otázky** — **ZALOŽENO 26. 9.: 220 otázek** (4 na zemi, pásmo dospělí), všechny
s ilustrací po kontrole očima (22 vad z 220 opraveno). Na produkci se dostanou až `db:sync --remote`.
Otázka s `"online_only": true` se nekopíruje na web a online hra ji losuje přednostně.
Jedna hra = 10 otázek, takže fond vystačí zhruba na 20 her na hráče, než se začne dobírat
z veřejných. **Další dávky jsou průběžná práce** — zadání pro agenty (povinná pole,
pravidla, pasti) je popsané v CLAUDE.md 2026-09-26; id nesmí obsahovat slovo z odpovědi
(hlídá `validate`).

**B. Právní vrstva** (krok 3)
Stránky jsou napsané a **od 11. 9. nasazené vědomě** (viz CLAUDE.md), kontakt
`ahoj@cestokviz.cz` ale pořád poštu nepřijímá — čeká na koupi domény.
**POZOR, dřívější verze tohohle bodu tvrdila, že je to blokér obchodů — není.**
Google Play chce veřejnou adresu se zásadami (stačí `…pages.dev/soukromi`) a kontaktní
e-mail vývojáře, kterým může být jakákoli schránka. Doménu potřebuje až **odesílání**
pošty: Resend pustí odesílání po ověření vlastní domény, takže dokud není, appka sice
e-mail sbírá a slibuje odkaz na obnovu PINu, ale `mail.js` ho jen zaloguje. **Ten
nepravdivý slib je skutečný dluh** — buď doménu koupit, nebo appce zakázat slibovat.

**C. Instalovatelná appka** — **HOTOVO 25. 9.** (manifest, service worker, ikony; appka
poprvé funguje offline, viz CLAUDE.md).

**D. Obaly, platby, provoz** (kroky 5–7)
Google Play jako první, přes TWA. Postup je rozepsaný v chatu z 25.–26. 9. a čeká na hráče:
1) nasměrovat `cestokviz.cz` na Cloudflare Pages (zachovat MX záznamy pošty),
2) sestavit balíček (PWABuilder), 3) nahrát do Play Console, 4) `/.well-known/assetlinks.json`
s otiskem klíče **app signing** (ne upload klíče), 5) test a vydání.
Pozor: ilustrace se do mobilního balíčku nevejdou, obal je musí brát z webu.

**Otevřené drobnosti:** kontrast drobných textů a dotykové cíle pod 44 px (plošná změna
palety, patří hráči k rozhodnutí). Ostatní z auditu jsou pryč: odveta je výzva, `join.js`
kontroluje stav hry (26. 9.) a odchod z čekárny křížkem opouští frontu (`opustFrontu`, 4. 9.).

---

## 5. Rozhodnutí, která čekají na hráče

1. ~~**Dětské pásmo** — účty, nebo jen obtížnost?~~ **Rozhodnuto 2026-09-10: 13+, dětské pásmo jen obtížnost.**
2. **Reklama** ano/ne ve verzi zdarma. Doporučení: appka zdarma s omezeným online
   provozem + jednorázové odemčení, které vypne i reklamu; vedle toho školní licence.
3. **Další jazyky** — dnes je česky natvrdo všechno včetně otázek.
4. **Sloučit větev do `master`** (fast-forward) a **nasadit na produkci** — včetně
   `db:sync --remote` (viz bod 1).

---

## 6. Kde co hledat

| Chci vědět | Soubor |
|---|---|
| Konvence a všechna rozhodnutí | `CLAUDE.md` (čte se automaticky na startu) |
| Stav rozdělané práce, rozběhnutí | `docs/pokracovani.md` |
| Jak nasadit na produkci | `docs/nasazeni.md` |
| Jak funguje online režim | `docs/online-rezim.md` |
| Otevřené nálezy z auditů | `AUDIT_REPORT.md` + zápisy v CLAUDE.md |
| Obsahový dluh (duplicity, prozrazování) | `docs/obsahovy-dluh.md` |
| Jak se dělají ilustrace a kde se skončilo | `docs/predani-ilustrace.md` |
| Zdrojové Gemini obrázky pro UI | `D:\weigle\plocha\Kvíz_ILUSTRACE` (mimo repo) |
