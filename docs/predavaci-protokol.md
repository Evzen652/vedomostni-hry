# Předávací protokol

Pro novou session (i na jiném počítači). Sepsáno **7. září 2026**, **naposledy aktualizováno
29. 9. 2026** po session z 26.–28. 9., která:
- **zrušila přátele s kódem a nahradila je výzvami podle přezdívky** (vlastní tabulka
  `challenges`, hra vzniká až přijetím; lobby nově ukazuje příchozí výzvy a hry na tahu),
- **předělala odvetu proti člověku na výzvu** a odmítá vzájemnou výzvu,
- **přidala rozbor po hře** (karty s ilustrací a štítky) do online i do sóla, školy a párty,
- **založila serverový fond: 220 otázek `online_only`** (4 na zemi, pásmo dospělí), všechny
  s ilustrací prošlou kontrolou očima, a zavřela dvě díry, kudy šlo odpověď zjistit předem
  (id otázky a přednačtená ilustrace).

Fond je teď **4 012 otázek: 3 792 veřejných + 220 serverových, všechny s malovanou ilustrací.**

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

### Stav k 29. 9.

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
- **ČEKÁ SE:** DS záznam (keytag 41880, alg 13) je pořád v zóně `.cz`. Registr CZ.NIC už
  keyset nemá — ověřeno přes RDAP — takže je to jen publikace. **Český hosting varuje,
  že deaktivace může trvat až několik dní.**
- **ZBÝVÁ, v tomhle pořadí:**
  1. počkat, až DS zmizí: `Resolve-DnsName cestokviz.cz -Type DS -Server a.ns.nic.cz`
     (musí se ptát PŘÍMO autoritativního serveru, resolver odpovídá z cache),
  2. v `muj.cesky-hosting.cz` → doména → DNS změnit **NSSET** na `keaton.ns.cloudflare.com`
     a `melinda.ns.cloudflare.com`,
  3. po aktivaci zóny přidat v dashboardu Pages (projekt `zemekviz`) custom domain
     `cestokviz.cz` i `www.cestokviz.cz` — **wrangler to neumí**, `pages domain` neexistuje,
  4. přepnout konstantu `WEB` v `scripts/build-public.js` a nasadit,
  5. ověřit: appka na nové adrese, platný certifikát, náhled pro sdílení na nové doméně
     a **že MX pořád míří na Thinline** (pošta),
  6. zapnout DNSSEC znovu, už v Cloudflare.

**⚠ Nikdy nepřepínat nameservery, dokud je DS v zóně** — doména i pošta by se staly
nedostupnými pro validující resolvery.

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
