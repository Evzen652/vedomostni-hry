# Google Play — podklady k vydání (Cestokvíz)

Koncept z 2. 10. 2026. Texty a odpovědi vycházejí z toho, co appka **opravdu dělá** (zásady
ochrany údajů na `/soukromi`, `docs/online-rezim.md`). Co je potřeba ověřit nebo rozhodnout,
je označené **⚠**. Pořadí vydání a technický postup jsou v `docs/predavaci-protokol.md`, bod F.

> **Větev  vznikla ze  (4 012 otázek) schválně:** nové otázky z kampaně 30. 9.–1. 10.
> leží na větvi  a **nesmí se dostat do nasazení z téhle větve**, dokud nemají
> obrázky (rozhodnutí hráče 2. 10.;  kopíruje celé ). Plán a past jsou
> v , bod F, na obsahové větvi. **Před každým nasazením z téhle větve ověř,
> že  má součet 4 012.**
>
> **Pozor, platí do dokončení ilustrací:** v listingu neslibuj počet otázek vyšší než ten, který
> je nasazený (k 2. 10. **4 012**). Nové otázky se nenasazují, dokud nemají obrázky.

## 0. Dvě věci, které je třeba vědět DŘÍV, než se založí účet

**⚠ 1. Cílová skupina a pravidla pro děti.** Zásady a podmínky říkají „profil je od 13 let“, ale
appka má dětské pásmo (8–11) a malované ilustrace, které na děti působí. Pokud v Play Console
uvedeš v cílové skupině i věk pod 13, nebo bude Google appku považovat za zaměřenou na děti,
vztahují se na ni **pravidla pro rodiny** (přísnější: bez účtů bez rodiče, omezené SDK, speciální
schválení). Doporučení: **cílová skupina 13+ (13–15, 16–17, 18+)**, v listingu nepsat „pro děti“,
dětské pásmo popsat jako „obtížnost“. Je to rozhodnutí hráče — a obtížně se mění zpětně.

**⚠ 2. Pravidla pro nové osobní vývojářské účty.** Podle posledních pravidel, která jsem znal,
musí nový *osobní* účet před vydáním udělat **uzavřené testování s minimálně 12 testery po
dobu 14 dní v kuse**. Organizační účet (potřebuje D-U-N-S) tohle nemá. **Ověř aktuální znění
v Play Console**, mění se. Pokud to platí, je to nejdelší položka celého vydání a testery je
potřeba sehnat dopředu.

## 1. Údaje pro Play Console

| Položka | Návrh |
|---|---|
| Název (max 30 znaků) | **Cestokvíz: zeměpisný kvíz** (25) |
| Balíček (nejde změnit) | **⚠** `cz.cestokviz.app` — navrhuji; po vydání se nedá přejmenovat |
| Kategorie | Hry → Vzdělávací *(nebo Trivia — Hry → Vědomostní)*; **⚠** zvolit podle toho, jak to chceš prezentovat |
| Kontaktní e-mail | `ahoj@cestokviz.cz` — **⚠ ověřit, že schránka skutečně přijímá poštu** |
| Web | `https://cestokviz.cz` (až bude připojená) |
| Zásady ochrany údajů | `https://cestokviz.cz/soukromi` (už nasazené, bez přihlášení) |
| Smazání účtu | `https://cestokviz.cz/smazani-uctu` (už nasazené, bez přihlášení) + smazání přímo v appce |
| Reklamy | **Ne** (appka reklamu nemá) |
| Nákupy v appce | **Ne** (zatím; monetizace není rozhodnuta) |
| Jazyk | Čeština (výchozí) |

## 2. Texty listingu (čeština)

**Krátký popis (max 80 znaků):**
> Zeměpisný kvíz s humorem. Hraj sólo, s partou u stolu i online proti světu.

*(76 znaků)*

**Úplný popis (max 4 000 znaků):**

> Cestokvíz je zeměpisný kvíz, který bere zemi světa vážně, ale sebe ne. Čtyři odpovědi, jedna
> správná a k ní vtip, vysvětlení a ilustrace, která ti odpověď nadlouho vryje do hlavy.
>
> **Vyber si, jak chceš hrát**
> • **Sólo jízda** — vyber kontinent, zemi a téma a zahraj si sám. Skoro tisíc otázek o Česku
>   a desítky o každé další zemi.
> • **Párty souboj** — víc hráčů u jedné obrazovky. Každý hraje ve své obtížnosti, body jsou
>   pro všechny stejné, takže může vyhrát i ten nejmladší.
> • **Škola hrou** — režim pro učitele a promítání ve třídě, bez účtů a bez přihlášení.
> • **Světová online liga** — souboje o rating proti dalším hráčům, žebříčky, turnaje a výzvy
>   podle přezdívky. Utkej se s celým světem. Nebo aspoň s Pepou z Kolína.
>
> **Co v tom najdeš**
> • Otázky z devíti oblastí: místa, příroda, lidé, kultura a tradice, umění, sport, jazyk,
>   jídlo a historie.
> • U každé odpovědi vysvětlení a „více o…“, které opravdu něco řekne.
> • Ilustrace ve stylu cestovního deníku ke každé otázce.
> • Tři úrovně obtížnosti, ať si zahraje celá rodina.
> • Sólo, párty i škola fungují i bez připojení — hraj kdekoli, i ve vlaku.
>
> **Tvoje údaje jsou tvoje**
> Sólo, párty i škola o tobě nic nikam neposílají. Profil potřebuješ jen pro online ligu a stačí
> přezdívka a PIN. Bez reklam, bez sledování. Profil smažeš přímo v appce.

**⚠ „Tři úrovně obtížnosti, ať si zahraje celá rodina“** — pozor na tuhle větu vzhledem k bodu
0.1 (cílová skupina). Dá se nahradit „Tři úrovně obtížnosti“ bez slova rodina.

**⚠ Počty otázek** v textu sedí k nasazeným 4 012 (Česko 964, ostatní země 40–143). Jakmile se
nasadí nové otázky, text aktualizovat.

**⚠ Ilustrace jsou generované AI (Gemini), nejsou malované ručně** — v listingu proto nepiš „ručně
malované“. Google má pravidla o obsahu vytvořeném umělou inteligencí; u předem vygenerovaných
obrázků v appce nejde o „generativní funkci“, ale **při vyplňování formuláře o obsahu appky na tuhle
otázku odpověz pravdivě** a zvaž v popisu větu typu „ilustrace vznikly s pomocí AI“.

## 3. Formulář „Zabezpečení údajů“ (Data safety)

Odpovědi vycházejí ze zásad ochrany údajů. **⚠ Zkontroluj každou před odesláním** — formulář je
právně závazný a Google ho porovnává s chováním appky.

| Otázka | Odpověď | Poznámka |
|---|---|---|
| Sbírá nebo sdílí appka údaje? | **Ano, sbírá** | jen v online lize; bez profilu nic |
| Sdílí se údaje s třetími stranami? | **Ne** | Cloudflare a Resend jsou zpracovatelé, ne sdílení; nic se neprodává ani nepředává kvůli reklamě |
| Jsou údaje šifrované při přenosu? | **Ano** | HTTPS |
| Může uživatel požádat o smazání? | **Ano** | v appce i na `/smazani-uctu` |
| **Osobní údaje: jméno / přezdívka, ID uživatele** | Sbírá se, povinné pro online ligu, **nesdílí se**; účel: funkce appky, správa účtu | přezdívku vidí ostatní hráči v soubojích a žebříčku |
| **Osobní údaje: e-mail** | Sbírá se, **nepovinné**; účel: správa účtu (obnova PINu) | |
| **Aktivita v appce: historie her, odpovědi** | Sbírá se; účel: funkce appky (rating, žebříček) | |
| Poloha, kontakty, fotky, zvuk, soubory, kalendář, zdraví, finance | **Ne** | |
| Identifikátory zařízení, reklamní ID | **Ne** | |
| **⚠ IP adresa** | zásady říkají: ukládá se hodinu jen kvůli limitu zakládání profilů, bez vazby na profil | **rozhodnout, jestli ji deklarovat.** Doporučení: deklarovat opatrně (údaj se ukládá, byť krátce) |

## 4. Hodnocení obsahu (IARC dotazník)

Kvíz, žádné násilí ani sex ani hazard. K odpovědi na „uživatelé se mohou potkávat“: **ano, v omezené
míře** — přezdívka je viditelná ostatním a lze poslat výzvu, ale **není chat ani žádný jiný volný
text**. Historické otázky (války, diktatury) jsou psané věcně a bez zobrazení násilí.

## 5. Grafika a snímky (co je potřeba, co už je)

| Podklad | Rozměr | Stav |
|---|---|---|
| Ikona | 512×512 | **hotovo** (`assets/icon-512.png`) |
| Maskable ikona | 512×512 | **hotovo** (`assets/icon-maskable-512.png`) |
| Titulní grafika (feature graphic) | 1024×500 | chybí — **vzhled je území hráče**, navrhnu varianty ze stávajících ilustrací |
| Snímky telefonu | min. 2, doporučeno 4–8, 16:9 nebo 9:16 | chybí — pořídit z běžící appky (rozcestník, otázka s glóbem, odhalená odpověď s ilustrací, online lobby) |
| Snímky tabletu 7″ / 10″ | doporučeno | chybí |

## 6. Postup po přidání domény (stručně)

1. Doména připojená k Pages, `WEB` přepnuto, nasazeno, DNSSEC zapnut (bod F1–F2 protokolu).
2. Účet Play Console (poplatek, ověření identity), vytvořit appku s balíčkem z bodu 1.
3. Balíček přes **PWABuilder** z `https://cestokviz.cz` (stáhne se `manifest.json`).
   Doporučeno: nechat Play spravovat podpis (**app signing**).
4. Z Play Console vzít **otisk SHA-256 klíče app signing** a vložit do
   `/.well-known/assetlinks.json` (musí se přidat do `scripts/build-public.js`, jinak se na web
   nenasadí; `_headers` musí pro tu cestu vracet `Content-Type: application/json`).
   **Bez shody otisku appka v Play zobrazí lištu prohlížeče místo celé obrazovky.**
5. Uzavřené/interní testování, pak vydání. Ověřit, že offline hra funguje v nainstalovaném balíčku
   (service worker) a že odkaz na smazání profilu otevře stránku bez přihlášení.
