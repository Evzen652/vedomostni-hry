"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "es.json");

const NEW_QUESTIONS = [
// DĚTI (3 — es-k-paella a es-k-byk duplikát ID v DB; es-k-plaz zamítnuto jako generické)
{
  "id": "es-k-vejir",
  "cc": "es", "country": "Španělsko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaký skládací doplněk si španělské ženy mávají u tváře, aby se ochladily — a mají jím i tajný jazyk?",
  "answer": "Vějíř",
  "distractors": ["Deštník", "Kabelku", "Sluneční brýle"],
  "quip_correct": "Vějíř — a každý pohyb znamenal něco jiného. Zavřený prudce = jdi pryč.",
  "quip_wrong": "S deštníkem by to v horkém španělském sále vypadalo hodně komicky.",
  "explanation": "Na španělských dvorech 17. a 18. století existovala celá tajná abeceda vějíře. Jak ho držíš, jak ho otvíráš, kde ho přikládáš — každý pohyb měl přesný sociální význam, který okolí četlo jako telegram.",
  "about": "španělske kulture",
  "image_prompt": "A painterly watercolor illustration of a traditional spanish hand fan with floral patterns, vintage travel journal style"
},
{
  "id": "es-k-kastanety",
  "cc": "es", "country": "Španělsko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se jmenuje malý dřevěný nástroj, který si tanečníci flamenka cvakají mezi prsty v dlaních?",
  "answer": "Kastaněty",
  "distractors": ["Bubínky", "Píšťalka", "Rolničky"],
  "quip_correct": "Kastaněty — a správně cvakat obě najednou trvá učit se měsíce.",
  "quip_wrong": "Bubínek by se ti do dlaně rozhodně nevešel.",
  "explanation": "Pravé kastaněty se vyrábějí z tvrdého dřeva (kastanového nebo eben) a každý pár ladí na jinou tóninu. Levá kastaneta hraje hlubší tón, pravá vyšší — společně tvoří rytmický protiklad.",
  "about": "španelske hudbe",
  "image_prompt": "A painterly watercolor illustration of a pair of wooden castanets, vintage travel journal style"
},
{
  "id": "es-k-pomeranc",
  "cc": "es", "country": "Španělsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Ve španělské Seville rostou v ulicích pomerančovníky. Proč si ale lidé z nich nesmí brát ovoce?",
  "answer": "Jsou jedlé, ale tak hořké, že je nikdo nechce — používají se na marmeládu",
  "distractors": ["Jsou jedovaté a způsobily by nemoc", "Patří králi a sbírat je je zakázáno zákonem", "Jsou umělé z plastu jako dekorace"],
  "quip_correct": "Přesně — krásně oranžové a absolutně nepoživatelné syrové. Sevilla prodává z nich marmeládu do Anglie.",
  "quip_wrong": "Jedovaté ne — ale kdo by kousl do hořkého pomeranče, hned pochopi, proč tam zůstávají viset.",
  "explanation": "Sevillské pomeranče (Citrus aurantium) jsou hořké odrůdy určené k vaření. Město každoročně sklidí tisíce tun a prodá je britským výrobcům marmelády — paradoxně nejslavnější je anglická Seville Orange Marmalade.",
  "about": "sevillskych pomerancich",
  "image_prompt": "A painterly watercolor illustration of an orange tree on a sunny Seville street, vintage travel journal style"
},

// PUBERŤÁCI (6 — všechny kvalitní; opraveny ID s diakritikou a slabý quip)
{
  "id": "es-t-siesta",
  "cc": "es", "country": "Španělsko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Proč si Španělé tradičně berou siestu zrovna uprostřed dne?",
  "answer": "Je to únik před největším poledním žárem",
  "distractors": ["Aby stihli dvě večeře", "Zakotvili to ve středověkých zákonech", "Aby ušetřili za elektřinu v klimatizaci"],
  "quip_correct": "V tom horku je nejlepším nápadem prostě vypnout. Produktivita počká.",
  "quip_wrong": "Zákon na spánek by byl krásná představa, ale siesta vznikla čistě z pragmatismu — v 40 stupních nikdo nevydrží pracovat.",
  "explanation": "Siesta původně umožňovala zemědělcům přečkat nejteplejší část dne. Pracovní den pak pokračoval pozdě odpoledne a večer — odtud pozdní večeře, pozdní restaurace, pozdní vše.",
  "about": "spanelske kulture",
  "image_prompt": "A painterly watercolor illustration of a quiet sun-drenched Spanish plaza at midday, vintage travel journal style"
},
{
  "id": "es-t-gaudi",
  "cc": "es", "country": "Španělsko", "section": "Místa",
  "difficulty": 2, "type": "choice",
  "question": "Čím je architektura Antoniho Gaudího tak rozpoznatelná, že ho žádný jiný architekt nezní napodobit?",
  "answer": "Nepoužívá rovné čáry — vše je inspirováno přírodními tvary",
  "distractors": ["Staví výhradně z bílého mramoru", "Budovy jsou bez oken, jen se světlíky ve střeše", "Používal výhradně recyklované materiály"],
  "quip_correct": "Gaudí věřil, že rovná čára je výmysl člověka, křivka patří Bohu — a jemu.",
  "quip_wrong": "Bílý mramor? Gaudí miloval mozaiku z barevných střepů. Rovných povrchů se bál jako čert kříže.",
  "explanation": "Gaudí studoval přírodu jako stavební příručku — stonky, kosti, mušle, pavoučí sítě. Oblouk, který vidíš v jeho stavbách, kopíruje matematicky ideální rozložení tlaku — žádné vnější podpěry nepotřebuje.",
  "about": "Gaudiho architekture",
  "image_prompt": "A painterly watercolor illustration of a whimsical Gaudi building with organic wavy shapes, vintage travel journal style"
},
{
  "id": "es-t-vecere",
  "cc": "es", "country": "Španělsko", "section": "Kultura",
  "difficulty": 1, "type": "choice",
  "question": "Kdy Španělé obvykle jedí hlavní večeři?",
  "answer": "Až pozdě večer, často po deváté hodině",
  "distractors": ["Hned po škole kolem třetí", "V šest hodin jako v Británii", "Těsně po západu slunce"],
  "quip_correct": "Španělská noc začíná ve chvíli, kdy jinde lidé míří do postele.",
  "quip_wrong": "V šest? Většina španělských restaurací teprve otevírá kuchyni.",
  "explanation": "Pozdní večeře vychází z celodenního rytmu: siesta posune odpolední práci, ta posune večeři, večeře posune noc. Průměrný Španěl chodí spát hodinu a půl po půlnoci — a vstává pozdějc než zbytek Evropy.",
  "about": "spanelske kulture stolování",
  "image_prompt": "A painterly watercolor illustration of a lively restaurant terrace at night in Spain, vintage travel journal style"
},
{
  "id": "es-t-jazyky",
  "cc": "es", "country": "Španělsko", "section": "Lidé",
  "difficulty": 2, "type": "choice",
  "question": "Proč je Španělsko jazykově pestřejší, než by se mohlo na první pohled zdát?",
  "answer": "Existují čtyři jazyky s oficiálním statusem v příslušných regionech",
  "distractors": ["Každý ostrov má vlastní úplně jiný jazyk", "Španělština má tolik dialektů, že se navzájem nerozumí", "Lidé v pohraničí záměrně mluví pozpátku"],
  "quip_correct": "Španělsko je kulturní mozaika — katalánština, baskičtina a galicijština mají vlastní ústavu i školy.",
  "quip_wrong": "Dialekty by stačily na zmatek, ale Španělsko šlo dál a dalo třem jazykům vlastní zákonný status.",
  "explanation": "Vedle kastilštiny (španělštiny) mají vlastní oficialní statuts katalánština (Katalánsko, Baleáry), baskičtina (Baskicko) a galicijština (Galicie). V praxi to znamená bilingvní cedule, výuku ve školách i parlamentní projevy.",
  "about": "spanelskych jazycich",
  "image_prompt": "A painterly watercolor illustration of a signpost with multiple language directions in Spain, vintage travel journal style"
},
{
  "id": "es-t-tapas",
  "cc": "es", "country": "Španělsko", "section": "Jídlo",
  "difficulty": 1, "type": "choice",
  "question": "Proč se v španělských barech malé porce jídla ke sdílení u pití jmenují tapas?",
  "answer": "Tapa znamená poklička — původně chléb nebo šunka přikrývající sklenku vína",
  "distractors": ["Pojmenoval je král, jehož oblíbené jídlo se připravovalo v tapetách", "Slovo pochází z arabštiny a znamená ochutnávat", "Je to zkratka pro španělský výraz malé porce"],
  "quip_correct": "Přikrýt víno kouskem šunky, aby do něj nespadla moucha — a tím náhodou vznikla celá kultura.",
  "quip_wrong": "Arabský původ by byl elegantní teorie, ale doklady ukazují jinam — rovnou na bar a sklenku.",
  "explanation": "Původně se jednalo o praktické řešení: chlebová poklička zabraňovala hmyzu padnout do vína. Hospodský pak přidal šunku nebo sýr, zákazníci si zvykli a z praktického víčka se stal rituál.",
  "about": "tapas",
  "image_prompt": "A painterly watercolor illustration of various tapas dishes on a wooden bar counter, vintage travel journal style"
},
{
  "id": "es-t-zemepis",
  "cc": "es", "country": "Španělsko", "section": "Příroda",
  "difficulty": 2, "type": "choice",
  "question": "Jak vypadá španělské vnitrozemí, pokud bys čekal samé zelené louky?",
  "answer": "Je to suchá a hornatá náhorní plošina — Meseta",
  "distractors": ["Jedna velká nekonečná džungle", "Rovná louka bez jediného kopce", "Hustá síť řek a bažin"],
  "quip_correct": "Zklamání pro milovníky bažin, radost pro ty, co mají rádi dramatické výhledy a suché víno.",
  "quip_wrong": "Džungli ve Španělsku najdeš leda tak v botanické zahradě v Madridu.",
  "explanation": "Meseta Central pokrývá přes 40 % rozlohy Španělska ve výšce 600–800 m n.m. Léto je rozpálené, zima krutá, srážek málo. Cervantes tu nechával bloudit Dona Quijota — krajina mu sedela.",
  "about": "spanelske krajine",
  "image_prompt": "A painterly watercolor illustration of the dry, rolling interior plateau of Spain with windmills, vintage travel journal style"
},

// DOSPĚLÍ (10 — es-a-kral zamítnuto; es-a-olivovy duplikát tématu es-q-olivovy-olej)
{
  "id": "es-a-hmyz",
  "cc": "es", "country": "Španělsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Které nenápadné zvířátko přivezené z Mexika vydělalo Španělsku po dvě století víc než zlato?",
  "answer": "Košenila — červený hmyz z kaktusu, ze kterého se dělalo karmínové barvivo",
  "distractors": ["Kokosový brouk, jehož tuk byl lékem na mor", "Hedvábný červ, který přežíval i v evropském klimatu", "Zlatý páv — exotické zvíře prodávané európskim dvorům"],
  "quip_correct": "Brouk za víc než zlato — Španělsko drželo monopol na nejžádanější červenou barvu Evropy celé dvě stě let.",
  "quip_wrong": "Hedvábí si Španělé raději kupovali od Číny. Tohle barvivo bylo krvavější a cennější.",
  "explanation": "Košenila (Dactylopius coccus) žije na kaktusech nopál. Drcená samičky dávají zářivě karmínový pigment — kardinálové, králové, červené uniformy, umělecká plátna. Španělsko chránilo tajemství výroby jako státní tajemství až do 18. století.",
  "about": "spanelske kolonialni historii",
  "image_prompt": "A painterly watercolor illustration of cochineal insects on a cactus with red dye, vintage travel journal style"
},
{
  "id": "es-a-katedrala",
  "cc": "es", "country": "Španělsko", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Proč trvá stavba barcelonské Sagrada Família přes 140 let — a přesto neexistuje žádný státní dluh za ni?",
  "answer": "Je financována výhradně ze vstupného a soukromých darů — bez jediného eura ze státního rozpočtu",
  "distractors": ["Stavba padla vinou bankrotu třikrát, každý restart musel začít znovu od základů", "Španělský zákon zakazuje dokončit katedrálu bez souhlasu papeže", "Gaudí schválně navrhl stavbu tak, aby trvala 300 let — aby generace měly co dělat"],
  "quip_correct": "Žádné dotace, jen vstupenky — a přesto je to nejnavštěvovanější památka Španělska.",
  "quip_wrong": "Papežský souhlas? Benedikt XVI. ji posvětil v 2010 — souhlas tedy přišel, ale zaplatil za ni každý turista zvlášť.",
  "explanation": "Sagrada Família je soukromý projekt financovaný od roku 1882 výhradně z darů věřících a od 90. let ze vstupného. Paradoxně to umožnilo průběžně zapracovávat nejnovější technologie — Gaudího tužkové výpočty nahradily počítačové modely.",
  "about": "Sagrada Familia",
  "image_prompt": "A painterly watercolor illustration of the Sagrada Familia cathedral under construction, vintage travel journal style"
},
{
  "id": "es-a-korida",
  "cc": "es", "country": "Španělsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Proč toreador mává červenou látkou, když býci jsou na červenou barvoslepí?",
  "answer": "Červená maskuje krev — dráždí ho pohyb látky, ne barva",
  "distractors": ["Červená způsobuje býkovi horečku a dezorientaci", "Je to tradice z doby, kdy se bojovalo s plachtami z lodí", "Toreador ji nese jako symbol krve Krista — je to náboženský rituál"],
  "quip_correct": "Přesně — býk reaguje na pohyb. Červená je pro diváky, ne pro zvíře.",
  "quip_wrong": "Alergie na červenou? Býk by musel mít velmi specifický genetický problém — a veterináři by to dávno zjistili.",
  "explanation": "Skot je dichromat — rozlišuje modrou a žlutou, ale červenou a zelenou vidí jako odstíny šedé. Červená muleta maskuje krev a poskvrny, aby publikum nebylo šokováno. Býka provokuje výhradně rychlý pohyb látky.",
  "about": "koride",
  "image_prompt": "A painterly watercolor illustration of a red matador's cape swirling in the wind, vintage travel journal style"
},
{
  "id": "es-a-cizinci",
  "cc": "es", "country": "Španělsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Proč Španělsko není ve stejném časovém pásmu jako Británie a Portugalsko, přestože geograficky patří mezi ně?",
  "answer": "Franco v roce 1940 posunul čas, aby byl synchronní s Hitlerovým Německem",
  "distractors": ["Španělé hlasovali v referendu za letní čas natrvalo", "Námořní smlouva z 18. století určila španělský čas podle Barcelony", "Vatikán trval na tom, aby Španělsko sdílelo čas s Itálií"],
  "quip_correct": "Politické rozhodnutí z roku 1940 platí dodnes — Španělsko žije o hodinu napřed, než kde geograficky patří.",
  "quip_wrong": "Turisté by si na čas zvykli — ale tady jde o hlubší historickou jizvu, která ovlivňuje španělský biorytmus dodnes.",
  "explanation": "Tento posun způsobuje, že slunce ve Španělsku vychází a zapadá hodinu 'pozdě' oproti geografické poloze. Odborníci tvrdí, že chronická spánková deprivace Španělů (průměrně o 53 minut méně spánku než zbytek EU) má původ právě tady.",
  "about": "spanelske historii",
  "image_prompt": "A painterly watercolor illustration of a clock and a Spanish landscape at sunset, vintage travel journal style"
},
{
  "id": "es-a-voda",
  "cc": "es", "country": "Španělsko", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Proč se v poušti Tabernas na jihu Španělska v 60. letech usadil Hollywood?",
  "answer": "Je to jediná pravá poušť v Evropě — krajina je k nerozeznání od amerického Divokého západu",
  "distractors": ["Španělská vláda financovala filmy výměnou za turistickou reklamu", "Tabernas mělo levné dělníky schopné postavit filmová kulisy za týden", "Americké studio tam otevřelo první pobočku mimo USA"],
  "quip_correct": "Tabernas: kde Clint Eastwood tančil v prachu, aniž by letěl do Arizony.",
  "quip_wrong": "Levné kulisy možná taky — ale hlavní důvod byl geografický. Krajina prostě vypadá přesně jako Nové Mexiko.",
  "explanation": "Tabernas v provincii Almería je polárním opakem zelené Evropy — sucho, skály, sprašové cesty. Sergio Leone tu natočil trilogii o dolarech s Eastwoodem. Filmová městečka Mini-Hollywood a Fort Bravo dnes fungují jako turistické atrakce.",
  "about": "spanelske pousti",
  "image_prompt": "A painterly watercolor illustration of a western desert landscape in Tabernas with red cliffs, vintage travel journal style"
},
{
  "id": "es-a-most",
  "cc": "es", "country": "Španělsko", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Co skrývá pilíř mostu Puente Nuevo v Rondě, který překlenuje stometrovou propast?",
  "answer": "Věznici — a za občanské války odtud prý shazovali vězně do rokle",
  "distractors": ["Tajnou kapli, kde se skrývali muslimové po reconquistě", "Vodní nádrž zásobující celé město", "Zlatý trezor rodiny, která most zaplatila"],
  "quip_correct": "Most jako věznice s výhledem do propasti. Architektura strachu v doslovném slova smyslu.",
  "quip_wrong": "Tajná kaple by byla romantičtější — ale skutečnost je temnější a dobře zdokumentovaná.",
  "explanation": "Puente Nuevo byl dokončen roku 1793. Místnost v pilíři sloužila nejprve jako skladiště, pak jako věznice. Za španělské občanské války (1936–39) byly na obou stranách záznamy o vězních shazovaných do rokle — motiv, který Hemingway použil v románu Komu zvoní hrana.",
  "about": "Ronde",
  "image_prompt": "A painterly watercolor illustration of the Puente Nuevo bridge spanning a deep gorge in Ronda, vintage travel journal style"
},
{
  "id": "es-a-knihovna",
  "cc": "es", "country": "Španělsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Proč Cervantes napsal Dona Quijota — a v čem ho generace čtenářů pochopily přesně obráceně?",
  "answer": "Napsal ho jako satiru na rytířské romány, ale čtenáři ho brali vážně jako hrdinský příběh",
  "distractors": ["Psal o své vlastní zkušenosti vězně a bojovníka — Quijote je autobiografický", "Chtěl španělskému dvoru ukázat, jak vypadá šílenství — jako psychologická studie", "Napsal ho v dluzích za dva týdny jako komerční projekt — kvalita ho překvapila"],
  "quip_correct": "Cervantes napsal největší španělský vtip na rytíře — a šest set let ho obdivujeme jako hrdinský epos.",
  "quip_wrong": "Hemingway byl milovník Španělska, ale větrné mlýny nechal raději na pokoji.",
  "explanation": "Cervantes psal Quijota jako parodii na populární rytířské romány, které považoval za hloupé a škodlivé. Paradoxně vytvořil tak přesvědčivého blázna, že ho každá epocha četla jako symbol toho, co zrovna potřebovala — svobody, snu, odporu.",
  "about": "Cervantesovi",
  "image_prompt": "A painterly watercolor illustration of Don Quixote on a horse charging at windmills, vintage travel journal style"
},
{
  "id": "es-a-jazyk",
  "cc": "es", "country": "Španělsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Proč je baskičtina záhadou pro každého evropského lingvistu?",
  "answer": "Nepatří do indoevropské jazykové rodiny — její původ je dosud neznámý",
  "distractors": ["Je to nejstarší forma latiny, která přežila izolací v horách", "Vytvořila ji středověká církev jako tajný jazyk kleru", "Je to směs arabštiny a keltštiny z doby přechodů národů"],
  "quip_correct": "Baskičtina tu čekala dávno před Indoevropany — a dočkala se. Oni přišli, ona zůstala.",
  "quip_wrong": "Nejstarší latina? Latina je indoevropský jazyk a baskičtina s ní nemá nic společného — ani kořen, ani sloveso.",
  "explanation": "Euskara (baskičtina) je jazykový izolát — nepříbuzná žádnému jinému známému jazyku na světě. Lingvisté předpokládají, že je pozůstatkem předindoevropského osídlení Evropy. Mluví jí asi 700 000 lidí v severním Španělsku a jihozápadní Francii.",
  "about": "baskictine",
  "image_prompt": "A painterly watercolor illustration of Basque countryside with traditional farmhouses, vintage travel journal style"
},
{
  "id": "es-a-hory",
  "cc": "es", "country": "Španělsko", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Jaký geografický paradox nabízí Sierra Nevada na jihu Španělska?",
  "answer": "Lyžování ve sněhu s přímým výhledem na africké pobřeží za jasného dne",
  "distractors": ["V létě tu padá sníh, protože vrcholy jsou v jiné klimatické zóně než údolí", "Je to jediný horský hřeben v Evropě, který roste geologicky rychleji než eroze ho odbrušuje", "Nachází se pod hladinou moře, ale výška pohoří je optický klam"],
  "quip_correct": "Sierra Nevada: lyže dopoledne, Středozemní moře odpoledne — a na obzoru Afrika.",
  "quip_wrong": "Pod hladinou moře by sis musel vzít potápěčský výstroj místo lyží.",
  "explanation": "Nejvyšší bod Sierra Nevady (Mulhacén, 3 479 m) leží méně než 50 km od pobřeží a za dobrých podmínek je odtud vidět na marocké pobřeží. Lyžařská střediska fungují od prosince do dubna, pláže u Granady jsou dostupné za hodinu jízdy.",
  "about": "Sierře Nevadě",
  "image_prompt": "A painterly watercolor illustration of snow-capped Sierra Nevada mountains with a distant sea view, vintage travel journal style"
},
{
  "id": "es-a-vinice",
  "cc": "es", "country": "Španělsko", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Proč vypadají vinice na Lanzarote jako měsíční krajina a jak to pomáhá réve přežít?",
  "answer": "Réva roste v jamkách pokrytých sopečným popelem, který zadržuje noční rosu místo deště",
  "distractors": ["Pěstuje se ve vzduchu na drátěných konstrukcích, aby větry z Atlantiku ochlazovaly hrozny", "Réva roste v mořském písku naplaveném na ostrov, který filtruje sůl", "Jamky jsou rituální ochrana z dob, kdy farmáři věřili, že sopka révu prokletkla"],
  "quip_correct": "Sopečný popel jako náhrada za déšť — a víno z toho je minerální a nezaměnitelné.",
  "quip_wrong": "Rituální ochrana by byla romantičtější — ale popel funguje jako přírodní houba na vlhkost, a to stačí.",
  "explanation": "Lanzarote dostane ročně jen 140 mm srážek — méně než Sahara. Volcánická vrstva lapilli (drobného sopečného kamene) absorbuje noční vlhkost a uvolňuje ji přes den ke kořenům. Každá réva roste v ručně vybudované jamce chráněné půlkruhovým kamenným plůtkem proti větru.",
  "about": "spanelskem vinarstvi",
  "image_prompt": "A painterly watercolor illustration of volcanic vineyards in Lanzarote with black lava fields, vintage travel journal style"
}
];

const existing = JSON.parse(fs.readFileSync(FILE, "utf8"));
const existingIds = new Set(existing.map(q => q.id));

const toAdd = NEW_QUESTIONS.filter(q => {
  if (existingIds.has(q.id)) { console.warn("  ! Přeskočeno (duplikát ID):", q.id); return false; }
  return true;
});

fs.writeFileSync(FILE, JSON.stringify([...existing, ...toAdd], null, 1));
console.log(`Hotovo: přidáno ${toAdd.length}, přeskočeno ${NEW_QUESTIONS.length - toAdd.length}. Celkem: ${existing.length + toAdd.length}`);
