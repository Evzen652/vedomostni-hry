const fs = require('fs');

const verdicts = [
  ["at-k-vlajka-povest", "at", "presunout", "Pověst stojí na krví nasáklém plášti z bitvy - násilí je tu jádrem faktu, ne letmá zmínka."],
  ["be-k-atomium", "be", "ponechat", "Obří viditelná stavba ve tvaru zvětšeného atomu - konkrétní vizuální fakt, auditor byl zbytečně přísný."],
  ["bg-k-lion-coat-of-arms", "bg", "ponechat", "Zvíře na státním znaku je konkrétní vizuální fakt, ne abstrakce."],
  ["ca-k-potaplice-jednodolarova-mince", "ca", "ponechat", "Pták na minci je přesně ten typ konkrétního vizuálního faktu, který dětem sedí."],
  ["ca-k-karibu-mince-quarter", "ca", "ponechat", "Zvíře na minci - konkrétní a vizuální, stejný vzor jako u loonie."],
  ["ca-k-remembrance-day", "ca", "ponechat", "Otázka je o červeném květu (vlčí mák), smrt vojáků je jen letmý kontext zvyku, ne téma samo."],
  ["cl-k-condor", "cl", "ponechat", "Pták na státním znaku vedle huemula - konkrétní vizuální fakt."],
  ["cl-k-hrozny", "cl", "ponechat", "Jde o konkrétní ovoce (hrozny) jako vývozní artikl, srovnatelné s běžnými otázkami o jídle."],
  ["cz-k-pivni-lazne", "cz", "presunout", "Koupel v pivu má alkohol přímo jako téma, ne jako letmou zmínku."],
  ["cz-k-kutna-hora-kostnice", "cz", "ponechat", "Kostnice jako turistická zajímavost je výslovně povolený příklad, ne nevhodné téma."],
  ["cz-k-olomouc-sloup-trojice", "cz", "ponechat", "Fyzická stavba na náměstí, kterou dítě vidí a umí popsat - není to abstrakce."],
  ["cz-k-buk-lesni", "cz", "ponechat", "Určení stromu podle vzhledu kůry a listů je klasická konkrétní dětská otázka."],
  ["cz-k-vodnik-poklad", "cz", "ponechat", "Vodník je výslovně uvedený příklad běžné české dětské pohádkové postavy."],
  ["cz-k-plzensky-prazdroj", "cz", "presunout", "Vynález piva je přímo o alkoholu jako tématu, ne letmá zmínka v jiném kontextu."],
  ["cz-k-utopenci-hospoda", "cz", "ponechat", "Jde o konkrétní jídlo (naložené párky), hospoda je jen místo podávání, ne alkohol jako téma."],
  ["cz-k-hymna-puvod-hra", "cz", "ponechat", "Konkrétní příběh (slepý houslista ve hře) o vzniku hymny, srovnatelné s ostatními pověstmi."],
  ["cz-k-klenoty-katedrala", "cz", "ponechat", "Konkrétní místo (katedrála, sedm zámků) - vizuální a snadno představitelné."],
  ["cz-k-svatovaclavska-koruna", "cz", "ponechat", "Koruna je konkrétní vizuální předmět s jasně pojmenovaným jménem."],
  ["cz-k-prezidentska-standarta", "cz", "ponechat", "Vlajka vlající nad Hradem je konkrétní vizuální fakt, děti ji můžou vidět na fotce."],
  ["cz-k-standarta-heslo", "cz", "presunout", "Text hesla na standartě je abstraktní politicko-textový fakt bez vizuální opory."],
  ["cz-k-maly-znak-jeden-lev", "cz", "ponechat", "Počítání lvů na znaku je konkrétní vizuální úkol, ne abstrakce."],
  ["cz-k-loutkarstvi-unesco", "cz", "prepsat", "Loutky samy jsou skvěle vizuální dětské téma, ale otázka na důvod zápisu UNESCO je zbytečně institucionální - přeformulovat na konkrétnější fakt o loutkách."],
  ["cz-k-dolar-tolar-jachymov", "cz", "presunout", "Etymologie slova dolar přes tolar je čistě abstraktní jazykově-historická spojnice bez vizuální opory."],
  ["cz-k-konopiste-zbrane", "cz", "ponechat", "Sbírka loveckých trofejí a zbraní na zámku je konkrétní a vizuální (muzejní charakter), ne oslava násilí."],
  ["cz-k-vysehrad-slavin", "cz", "ponechat", "Hrobka slavných Čechů je srovnatelná s kostnicí - historické místo, ne téma smrti jako takové."],
  ["cz-k-vanocni-trhy", "cz", "prepsat", "Vánoční trhy jsou skvělé dětské téma, ale odpověď cílí na svařák/punč (alkohol) - přepsat na nealkoholickou variantu nebo jiné občerstvení."],
  ["cz-k-paleni-jidase", "cz", "ponechat", "Pálení slaměné figuríny je běžný český lidový zvyk srovnatelný s pálením čarodějnic, ne oslava násilí."],
  ["cz-k-zatecky-chmel", "cz", "ponechat", "Jde primárně o určení rostliny (chmel), pivo je jen kontext, ne téma samo."],
  ["cz-k-narodni-divadlo-narod-sobe", "cz", "ponechat", "Zlatý nápis nad jevištěm je konkrétní vizuální detail budovy."],
  ["cz-k-palindrom-oko", "cz", "ponechat", "Slovní hříčka na konkrétním příkladu slova - hravé a přístupné, ne abstraktní pojem."],
  ["cz-k-vokativ-oslovovani", "cz", "ponechat", "Pátý pád se v Česku učí už na prvním stupni ZŠ přesně v tomto věku, jde o školní učivo, ne abstrakci navíc."],
  ["cz-k-hist-sazava-prokop", "cz", "ponechat", "Pověst o čertovi v postroji je klasická konkrétní dětská pověst, žádné abstraktní pojmy."],
  ["cz-k-hist-bivoj-kanec", "cz", "ponechat", "Silácký hrdinský kousek s kancem na ramenou - konkrétní a akční pověst, ne abstrakce ani násilí."],
  ["cz-k-hist-sarka-divci-valka", "cz", "ponechat", "Klasická pověst ze Starých pověstí českých, kterou se čeští školáci běžně učí - patří do jejich světa."],
  ["cz-k-hist-jan-nepomucky-hvezdy", "cz", "ponechat", "Otázka cílí na vizuální detail sochy (hvězdy kolem hlavy), ne na okolnosti smrti."],
  ["cz-k-hist-bohemia-bojove", "cz", "presunout", "Odvození jména Bohemia od keltského kmene je čistě abstraktní etymologicko-historický fakt."],
  ["cz-k-hist-jan-lucembursky-kresak", "cz", "ponechat", "Otázka cílí na vynalézavé řešení slepého krále, ne na popis násilí nebo smrti."],
  ["cz-k-hist-karel-vinice", "cz", "ponechat", "Jde o pěstování révy (zemědělství/historie), ne o pití vína - alkohol tu není tématem."],
  ["cz-k-hist-chodove-psi-trubky", "cz", "ponechat", "Psi a trubky jsou konkrétní a vizuální pomůcky, žádná abstrakce."],
  ["cz-k-hist-kazi-lecitelka", "cz", "ponechat", "Léčení bylinkami je konkrétní dovednost pohádkové postavy, srovnatelné s ostatními pověstmi."],
  ["cz-k-moravska-orlice", "cz", "ponechat", "Kostkovaná orlice na znaku je konkrétní vizuální heraldický detail."],
  ["cz-k-vlajka-po-rozdeleni", "cz", "ponechat", "Otázka o vlajce po rozdělení Československa je běžná občanská znalost, kterou české děti mají na dosah."],
  ["cz-k-standarta-auto", "cz", "ponechat", "Standarta na autě je konkrétní vizuální detail, stejný vzor jako standarta na Hradě."],
  ["ec-k-quitohistorie", "ec", "presunout", "Fakt o zápisu na seznam UNESCO jako jeden z prvních na světě je institucionální žebříčkový fakt bez vizuální opory."],
  ["ec-k-vlajka", "ec", "prepsat", "Vlajka samotná je vizuální téma, ale otázka na symboliku barvy (co znamená) je abstraktnější než přímé 'co je vyobrazeno' - přeformulovat na přímé rozpoznání barvy/motivu."],
  ["eg-k-hora-sinaj", "eg", "ponechat", "Jde o konkrétní skutečnou horu spojenou se známým příběhem (Mojžíš), který děti znají i z filmů a knih."],
  ["eg-k-vlajka-zlaty-orel", "eg", "ponechat", "Pták na vlajce je konkrétní vizuální fakt."],
  ["ga-k-vlajka", "ga", "ponechat", "Tři barvy na vlajce jsou přímý a konkrétní vizuální fakt."],
  ["gr-k-zeus", "gr", "ponechat", "Zeus má jméno i jasný obraz (král bohů na Olympu s bleskem) - řecká mytologie je navíc mezi dětmi oblíbené téma."],
  ["id-k-garuda", "id", "ponechat", "Garuda má jméno i konkrétní vizuální podobu (zlatý okřídlený pták), stejný vzor jako jiné bájné znakové postavy."],
  ["ie-k-cuchulainn", "ie", "ponechat", "Konkrétní hrdinský pověstný příběh (chlapec přemůže psa) - vizuální a akční, ne abstrakce."],
  ["il-k-jeruzalem", "il", "presunout", "Otázka na význam pro tři náboženství najednou je abstraktní nábožensko-politický koncept bez jednoznačné vizuální odpovědi."],
  ["in-k-vlajka", "in", "ponechat", "Kolo uprostřed vlajky je konkrétní vizuální detail."],
  ["in-k-cervena-pevnost", "in", "presunout", "Jde o politický obřad (projev premiéra, oslava nezávislosti) - abstraktní civilní/politický koncept."],
  ["kp-k-borovice", "kp", "ponechat", "Strom jako symbol - konkrétní rostlina, kterou lze vizuálně popsat."],
  ["kp-k-kaesong", "kp", "presunout", "Historie bývalého hlavního města dynastie a pohraniční politika je abstraktní historicko-geopolitický fakt."],
  ["kp-k-narodni-kvetina", "kp", "ponechat", "Národní květina je konkrétní a vizuální rostlina."],
  ["mn-k-tsam", "mn", "ponechat", "Tanec v maskách je silně vizuální a konkrétní téma (masky, kostýmy), srovnatelné s karnevalem."],
  ["mx-k-stribro", "mx", "ponechat", "Stříbro jako konkrétní surovina a vývozní artikl - srovnatelné s otázkami o jídle nebo materiálech."],
  ["mx-k-mexico-vyska", "mx", "ponechat", "Vaření vajec je konkrétní a dětem blízká situace, i když vysvětlení je fyzikální - podobné jiným 'proč to tak je' faktům."],
  ["mx-k-jazyky-domorode", "mx", "presunout", "Právní status jazyků podle zákona je čistě abstraktní právně-politický koncept."],
  ["nz-k-maui", "nz", "ponechat", "Pověst o rybě, ze které vznikl ostrov, je konkrétní a vizuální, stejný vzor jako jiné národní pověsti."],
  ["nz-k-novy-den", "nz", "presunout", "Vysvětlení stojí na abstraktním konceptu datové hranice, ne na viditelném přírodním jevu."],
  ["ph-k-vlajka", "ph", "ponechat", "Slunce uprostřed trojúhelníku je konkrétní vizuální detail vlajky."],
  ["pk-k-vlajka", "pk", "ponechat", "Měsíc a hvězda na vlajce jsou konkrétní vizuální symboly."],
  ["pk-k-nanga-parbat", "pk", "presunout", "Přezdívka hory je založená na počtu zemřelých horolezců - smrt je tu jádrem faktu, ne letmá zmínka."],
  ["pl-k-orel", "pl", "ponechat", "Zvíře na státním znaku je konkrétní vizuální fakt."],
  ["pl-k-syrenka", "pl", "ponechat", "Bájná bytost s mečem a štítem na znaku je konkrétní a vizuální, má jméno i jasnou podobu."],
  ["pl-k-hymna-mazurek-dabrowskiego", "pl", "ponechat", "Jméno hymny je konkrétní fakt srovnatelný s otázkou o české hymně."],
  ["pt-k-portugalstina-brazilie", "pt", "ponechat", "Otázka na zemi s víc mluvčími je běžný a srozumitelný typ zeměpisné otázky."],
  ["ru-k-russkij-most-vladivostok", "ru", "ponechat", "Most je konkrétní viditelná stavba, otázka je o rekordu délky, ne o abstraktním pojmu."],
  ["sa-k-vlajka", "sa", "ponechat", "Barva vlajky je maximálně konkrétní a přímá vizuální otázka."],
  ["sa-k-kadidlo", "sa", "ponechat", "Kadidlo je konkrétní vonná surovina, srovnatelné s jinými otázkami o surovinách a obchodu."],
  ["se-k-systembolaget", "se", "presunout", "Nákup vína a piva je alkohol přímo jako téma a zároveň abstraktní koncept státního obchodního monopolu."],
  ["se-k-nobelovy-ceny", "se", "ponechat", "Ceny pro vědce a spisovatele jsou vysvětlené jednoduše a srozumitelně, srovnatelné s jinou obecně známou institucí jako Olympiáda."],
  ["vn-k-hoan-kiem", "vn", "ponechat", "Pověst o meči a zlaté želvě je konkrétní a vizuální, stejný vzor jako jiné národní pověsti."],
  ["za-k-tri-mesta", "za", "presunout", "Rozdělení sídel vlády, parlamentu a soudu mezi tři města je abstraktní politicko-administrativní koncept."]
];

const out = verdicts.map(([id, cc, verdikt, poznamka]) => ({id, cc, verdikt, poznamka}));

const outPath = 'C:/Users/Evzen/AppData/Local/Temp/claude/C--Users-Evzen-Desktop-kviz/517137fa-a7b9-4a4b-bd5b-96fc3fb60dc7/scratchpad/sporne-verdikt.json';
fs.writeFileSync(outPath, JSON.stringify(out, null, 1), 'utf8');

// sanity checks
const auditPath = 'C:/Users/Evzen/AppData/Local/Temp/claude/C--Users-Evzen-Desktop-kviz/517137fa-a7b9-4a4b-bd5b-96fc3fb60dc7/scratchpad/audit-deti-sporne.json';
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const auditIds = new Set(audit.map(a => a.id));
const outIds = new Set(out.map(o => o.id));
console.log('audit count:', audit.length, 'out count:', out.length);
const missing = [...auditIds].filter(id => !outIds.has(id));
const extra = [...outIds].filter(id => !auditIds.has(id));
console.log('missing from output:', missing);
console.log('extra in output not in audit:', extra);

const counts = {};
for (const o of out) counts[o.verdikt] = (counts[o.verdikt]||0)+1;
console.log('counts:', counts);
