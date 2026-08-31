"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "at.json");

// Zahozeno (4):
//  at-k-rizek       — duplikát at-q-schnitzel (stejný fakt: telecí maso)
//  at-k-lipican     — duplikát ID at-k-lipican v DB
//  at-k-strudl      — duplikát tématu at-k-apfelstrudel
//  at-a-schnitzel-vepro — duplikát tématu at-q-schnitzel

const NEW_QUESTIONS = [
// DĚTI (3)
{
  "id": "at-k-mozartkugel",
  "cc": "at", "country": "Rakousko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "V Salcburku prodávají bonbony zvané Mozartkugel — kuličky zabalené ve zlatém papíru. Co je uvnitř?",
  "answer": "Marcipán a nugát v čokoládě",
  "distractors": ["Jahodový džem a smetana", "Karamel a oříšky v cukru", "Meruňková marmeláda v cukrové polevě"],
  "quip_correct": "Marcipán, nugát, čokoláda — trochu jako Mozart: vrstvy nad vrstvami.",
  "quip_wrong": "Jahodový džem by Mozart asi nesponzoroval. Správně je marcipán s nugátem v čokoládě.",
  "explanation": "Originální Mozartkugel vynalezl cukrář Paul Fürst v Salcburku v roce 1890. Jeho recept se dodnes dědí v rodině a tyto bonbony se stále vyrábí ručně — proto jsou výrazně dražší než průmyslové kopie.",
  "about": "salcburských bonbonech Mozartkugel",
  "image_prompt": "A painterly watercolor illustration of gold-wrapped Mozart chocolate balls in a decorative box with a Salzburg skyline, vintage travel journal style"
},
{
  "id": "at-k-alpy",
  "cc": "at", "country": "Rakousko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Velká část Rakouska jsou Alpy. Co tam lidé v zimě nejraději dělají?",
  "answer": "Lyžují na zasněžených svazích",
  "distractors": ["Plavou v horských jezerech", "Sbírají tropické ovoce", "Surfují na řekách"],
  "quip_correct": "Přesně! Rakouské Alpy jsou v zimě jedno velké sjezdovkové dobrodružství.",
  "quip_wrong": "V alpském sněhu plavání ani tropické ovoce moc nehledej.",
  "explanation": "Rakousko patří mezi pět největších lyžařských destinací světa. Stát má přes 400 lyžařských středisek a některé sjezdovky jsou otevřené i v létě díky ledovcům.",
  "about": "lyžování v rakouských Alpách",
  "image_prompt": "A painterly watercolor illustration of colorful ski slopes in the Austrian Alps with wooden chalets and pine trees dusted with snow, vintage travel journal style"
},
{
  "id": "at-k-dunaj",
  "cc": "at", "country": "Rakousko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Přes Vídeň teče velká řeka zvaná Dunaj. Jakou má ve skutečnosti barvu?",
  "answer": "Zelenkavě šedou, ne modrou",
  "distractors": ["Průzračně čirou jako sklo", "Sytě modrou jako obloha", "Žlutou od písku"],
  "quip_correct": "Přesně! Dunaj je proslulý 'Modrým Dunajem' ze slavné písničky, ale ve skutečnosti je šedozelený.",
  "quip_wrong": "To by Johann Strauss musel přepsat svůj valčík. Dunaj je ve skutečnosti šedozelený, ne modrý!",
  "explanation": "Johann Strauss napsal valčík 'Na krásném modrém Dunaji' v roce 1866 — název byl poetický, ne vědecký. Řeka nese sedimenty z Alp, které jí dávají charakteristickou šedozelenou barvu.",
  "about": "řece Dunaj ve Vídni",
  "image_prompt": "A painterly watercolor illustration of the Danube River flowing through Vienna with green-grey water and autumn light, vintage travel journal style"
},

// PUBERŤÁCI (6)
{
  "id": "at-t-mozart",
  "cc": "at", "country": "Rakousko", "section": "Lidé",
  "difficulty": 1, "type": "choice",
  "question": "Wolfgang Amadeus Mozart byl od čtyř let génius, hrál před císaři. Co bylo paradoxní na jeho dospělém životě?",
  "answer": "Byl stále bez peněz, přestože byl slavný",
  "distractors": ["Žil v přepychovém paláci jako dvorní skladatel", "Odmítal všechny zakázky a komponoval jen pro sebe", "Přestěhoval se do Londýna a Vídni se vyhýbal"],
  "quip_correct": "Sláva a zlaté záchodky jsou dvě různé věci. Mozart to věděl dobře.",
  "quip_wrong": "Přepychový palác? Mozart ho znal jen jako host. Geniálně skládal, ale peníze mu mezi prsty protékaly.",
  "explanation": "Mozart zemřel v 35 letech zadlužený a byl pohřben do společného hrobu pro chudé. Přitom byl za svého života velmi slavný a vystupoval před panovníky celé Evropy — jeho problémem bylo utrácení stejně rychlé jako vydělávání.",
  "about": "Mozartově životě",
  "image_prompt": "A painterly watercolor illustration of young Mozart at a harpsichord in a candlelit baroque salon in Salzburg, vintage travel journal style"
},
{
  "id": "at-t-kafehausy",
  "cc": "at", "country": "Rakousko", "section": "Kultura",
  "difficulty": 1, "type": "choice",
  "question": "Vídeňské kavárny jsou na seznamu UNESCO. Co je na nich zvláštního oproti běžné kavárně?",
  "answer": "Hosté mohou sedět celé hodiny u jedné kávy bez tlaku číšníka",
  "distractors": ["Podávají výhradně tureckou kávu bez cukru", "Jsou otevřené jen ráno, odpoledne se zavírají", "Vstup je zdarma, platí se jen za jídlo"],
  "quip_correct": "Vídeňská kavárna je veřejný obývák — přineseš si noviny, sníš dort, a nikdo tě nevyhazuje.",
  "quip_wrong": "Zdarma vstup by byl hezký nápad, ale vídeňská kavárna funguje jinak — nikam vás nežene, ale účet přijde.",
  "explanation": "Vídeňská kavárenská kultura je od roku 2011 na seznamu UNESCO. Kavárny historicky sloužily jako místo setkávání umělců, filozofů a politiků — Freud, Klimt i Lenin tu trávili hodiny nad šálkem melange.",
  "about": "vídeňské kavárenské kultuře",
  "image_prompt": "A painterly watercolor illustration of an elegant Viennese coffeehouse interior with marble tables, bentwood chairs, newspapers on wooden holders, vintage travel journal style"
},
{
  "id": "at-t-habsburkove",
  "cc": "at", "country": "Rakousko", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Habsburkové rozšiřovali říši hlavně sňatky, ne válkami. Jaké bylo jejich proslulé motto?",
  "answer": "Bella gerant alii, tu felix Austria nube — Války ať vedou jiní, ty šťastné Rakousko se žeň",
  "distractors": ["Per aspera ad astra — Přes překážky ke hvězdám", "Divide et impera — Rozděl a panuj", "Dum spiro spero — Dokud dýchám, doufám"],
  "quip_correct": "Habsburkové pochopili, že svatební smlouva je levnější než armáda.",
  "quip_wrong": "Divide et impera je Caesarovo heslo. Habsburkové preferovali ložnici před bojištěm.",
  "explanation": "Habsburská strategie dynastických sňatků skutečně fungovala: bez větší války získali Španělsko, Burgundsko a části Itálie. Ironií je, že tato politika nakonec vedla k příbuzenské degeneraci — Habsburská čelist a různé genetické problémy jsou jejím výsledkem.",
  "about": "habsburské dynastické politice",
  "image_prompt": "A painterly watercolor illustration of a Habsburg royal wedding ceremony in a grand Vienna cathedral with baroque decorations, vintage travel journal style"
},
{
  "id": "at-t-arnold",
  "cc": "at", "country": "Rakousko", "section": "Lidé",
  "difficulty": 1, "type": "choice",
  "question": "Arnold Schwarzenegger je nejslavnější žijící Rakušan. Čím je doma v Rakousku aktivní, co krajané oceňují?",
  "answer": "Aktivně podporuje ochranu životního prostředí a financuje projekty v rodném Štýrsku",
  "distractors": ["Postavil v Grazu muzeum Terminátora jako turistickou atrakci", "Zakázal ve svém rodném městě prodej jeho filmů jako gesto skromnosti", "Vrátil se do Rakouska a kandidoval na prezidenta"],
  "quip_correct": "Bodybuilding, Hollywood, politika a ekologie — Arnie pořád přidává kapitoly.",
  "quip_wrong": "Muzeum Terminátora by bylo za hranou ironie. Schwarzenegger doma investuje do solárních projektů, ne do filmových rekvizit.",
  "explanation": "Schwarzenegger se narodil ve Štýrském Talu u Grazu. Po kariéře guvernéra Kalifornie se aktivně věnuje klimatické osvětě — provozuje výzkumné centrum čistých technologií a financuje solární projekty ve svém rodném regionu.",
  "about": "Arnoldu Schwarzeneggerovi a jeho vztahu k Rakousku",
  "image_prompt": "A painterly watercolor illustration of green rolling hills of Styria Austria with a traditional farmhouse and solar panels, vintage travel journal style"
},
{
  "id": "at-t-silvestr",
  "cc": "at", "country": "Rakousko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Vídeň vysílá každý Nový rok přenos, který sledují miliony po celém světě. Co je jeho hlavní hvězdou?",
  "answer": "Novoroční koncert Vídeňských filharmoniků",
  "distractors": ["Ohňostroj nad Stephansdómem trvající hodinu", "Průvod v historických kostýmech přes celé centrum", "Přímý přenos z císařského plesu ve Schönbrunnu"],
  "quip_correct": "Valčíky, Strauss a fraky — tradice, která nezestárla od roku 1939.",
  "quip_wrong": "Ohňostroj sice je, ale Vídeň slaví Nový rok hlavně hudbou, ne pyrotechnikou.",
  "explanation": "Novoroční koncert Vídeňských filharmoniků se vysílá do více než 90 zemí světa a sleduje ho přes 50 milionů diváků. Dirigent se každý rok mění a pozvání je považováno za jeden z nejvyšších hudebních vrcholů kariéry.",
  "about": "vídeňském Novoročním koncertu",
  "image_prompt": "A painterly watercolor illustration of the golden Musikverein concert hall in Vienna filled with flowers and an orchestra performing, vintage travel journal style"
},
{
  "id": "at-t-rakousko-neutralita",
  "cc": "at", "country": "Rakousko", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Po druhé světové válce bylo Rakousko jako Německo rozdělené mezi čtyři mocnosti. Proč se sjednotilo mnohem dříve?",
  "answer": "Slíbilo věčnou neutralitu a odmítnutí členství v jakémkoli vojenském paktu",
  "distractors": ["Zaplatilo válečné reparace daleko rychleji než Německo", "Mělo menší území, takže dohoda byla jednodušší", "Sovětský svaz si Rakousko nevšímal, protože bylo příliš chudé"],
  "quip_correct": "Neutralita jako vstupenka ke svobodě — Rakušané podepsali a spojenci odešli.",
  "quip_wrong": "Sověti si Rakouska všímali velmi pečlivě. Klíčem byl slib věčné neutrality, bez kterého by neodešli.",
  "explanation": "Státní smlouva z roku 1955 ukončila spojeneckou okupaci výměnou za ústavní neutralitu. Tato neutralita trvá dodnes — Rakousko není členem NATO, přestože je členem EU. Vídeň se proto stala oblíbeným místem pro mezinárodní diplomatická jednání.",
  "about": "rakouské neutralitě po druhé světové válce",
  "image_prompt": "A painterly watercolor illustration of the Vienna Belvedere Palace where the Austrian State Treaty was signed in 1955, with Austrian flags flying, vintage travel journal style"
},

// DOSPĚLÍ (11)
{
  "id": "at-a-freud",
  "cc": "at", "country": "Rakousko", "section": "Lidé",
  "difficulty": 3, "type": "choice",
  "question": "Sigmund Freud uprchl z Vídně v roce 1938 do Londýna. Co bylo paradoxní na jeho situaci při odjezdu?",
  "answer": "Gestapo ho propustilo, protože byl světově slavný — útěk mu zaplatila princezna Marie Bonaparte",
  "distractors": ["Odmítl emigrovat, dokud nezískal povolení pro celou svoji knihovnu", "Odjel jako poslední ze své rodiny, protože nevěřil, že je v ohrožení", "Byl propuštěn výměnou za to, že veřejně poděkoval nacistickému režimu"],
  "quip_correct": "Světová sláva jako záchranná vesta — Freud by to jistě analyzoval jako ironii podvědomí dějin.",
  "quip_wrong": "Freudův příběh je složitější. Zachránila ho kombinace mezinárodní slávy a peněz od princezny — ne knihovna.",
  "explanation": "Marie Bonaparte, francouzská princezna a Freudova žákyně, zaplatila výkupné za jeho propuštění. Freudovy čtyři sestry, které zůstaly, zahynuly v koncentračních táborech. Freud zemřel v Londýně v roce 1939 — požádal lékaře o smrtelnou dávku morfia, protože trpěl rakovinou čelisti.",
  "about": "Sigmundu Freudovi a jeho útěku z Vídně",
  "image_prompt": "A painterly watercolor illustration of Freud's study in Vienna with his famous couch, antiquities collection, and writing desk in warm lamplight, vintage travel journal style"
},
{
  "id": "at-a-ledovec-otzi",
  "cc": "at", "country": "Rakousko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Ötzi, ledovcová mumie nalezená roku 1991 na rakousko-italské hranici, odhalila šokující detail. Co zjistili vědci?",
  "answer": "Byl zavražděn — šíp v zádech mu proťal tepnu; nejde o nehodu ani oběť počasí",
  "distractors": ["Zemřel vyčerpáním při přechodu hor v zimní bouři", "Zahynul při pádu do ledové trhliny, kde zamrzl", "Byl rituálně obětován — na těle jsou stopy ceremonií"],
  "quip_correct": "Nejstarší nevyřešená vražda v Evropě — a Ötzi ještě nestačil vypovídat.",
  "quip_wrong": "Ötziho smrt nebyla tak klidná. Rentgen odhalil šíp a přetnutou tepnu — byl sestřelen zezadu.",
  "explanation": "Analýza ukázala, že Ötzi jedl krátce před smrtí — pak ho někdo sestřelil šípem zezadu. Vědci navíc zjistili, že měl arteriosklerózu, nesnášenlivost laktózy a byl pravděpodobně plešatý. Jeho DNA stále žije v přibližně 19 současných lidech v Alpách.",
  "about": "Ötziho — ledovcové mumii z Alp",
  "image_prompt": "A painterly watercolor illustration of the alpine glacier landscape near the Ötztal valley with dramatic mountain peaks and ice, vintage travel journal style"
},
{
  "id": "at-a-red-bull",
  "cc": "at", "country": "Rakousko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Red Bull vznikl jako rakouská firma — ale kde Dietrich Mateschitz recept objevil?",
  "answer": "V Thajsku — zkopíroval energetický nápoj Krating Daeng populární mezi dělníky",
  "distractors": ["Ve Spojených státech — kde viděl, jak armáda podává vojákům kofeinové pilulky", "V Japonsku — ochutnal nápoj ze žeňšene prodávaný v automatech", "V Německu — kde farmaceutická firma testovala energetické drinky pro sportovce"],
  "quip_correct": "Thajský dělnický nápoj, evropský marketing, světová dominance. To je podnikání.",
  "quip_wrong": "Mateschitz cestoval jiným směrem. Krating Daeng z Bangkoku byl jeho inspirace — a pak přidal bublinky.",
  "explanation": "Mateschitz byl v roce 1982 v Bangkoku, kde narazil na Krating Daeng (Červený buvol). Dohodl se s thajským výrobcem Chaleo Yoovidhyou na partnerství — každý vlastnil 49 %, zbývající 2 % dostaly jejich děti. Red Bull dnes prodá přes 12 miliard plechovek ročně.",
  "about": "vzniku značky Red Bull",
  "image_prompt": "A painterly watercolor illustration of a Bangkok street market stall in the 1980s with Thai energy drinks, vintage travel journal style"
},
{
  "id": "at-a-habsburska-cast",
  "cc": "at", "country": "Rakousko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Habsburkové jsou pohřbíváni způsobem unikátním v Evropě — tělo je rozděleno na tři části a pohřbeno na třech různých místech. Proč?",
  "answer": "Každá část symbolizuje jiný aspekt vladaře: srdce, vnitřnosti a tělo šly do různých kostelů jako projev zbožnosti",
  "distractors": ["Bylo to bezpečnostní opatření proti znesvěcení hrobu nepřáteli", "Každá část šla do jiné země, nad níž Habsburkové vládli", "Byl to trest pro vladaře, kteří nedodrželi dynastické sliby"],
  "quip_correct": "Tři pohřby za jeden život — Habsburkové dělali vše ve velkém, i smrt.",
  "quip_wrong": "Důvod byl zbožný, ne taktický. Srdce, útroby a tělo jako tři roviny existence — každá do jiného kostela.",
  "explanation": "Habsburské srdce je uloženo v Augustiniánském kostele (54 stříbrných uren), vnitřnosti v Katedrále sv. Štěpána, těla v Kapuzínské kryptě — vše ve Vídni. Tato praxe skončila s Karlem I. v roce 1922. Poslední pohřbení v Kapuzínské kryptě bylo v roce 2011 — Otto von Habsburg.",
  "about": "habsburském pohřebním rituálu",
  "image_prompt": "A painterly watercolor illustration of the Imperial Crypt beneath the Kapuzinerkirche in Vienna with ornate metal sarcophagi in candlelight, vintage travel journal style"
},
{
  "id": "at-a-klimt",
  "cc": "at", "country": "Rakousko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Klimtův obraz Portrét Adele Bloch-Bauerové byl roku 2006 navrácen potomkům. Čím byl tento případ průlomový?",
  "answer": "Byl to první úspěšný případ, kdy soukromá osoba soudně získala zpět obraz ukradený nacisty od státu — a to od Rakouska",
  "distractors": ["Šlo o nejdražší obraz kdy vydražený na světě v okamžiku prodeje", "Byl to první případ, kdy se Klimtův obraz vrátil do Vídně po desetiletích", "Případ donutil Rakousko uznat svoji roli jako spolupachatele nacismu"],
  "quip_correct": "Maria Altmann vs. Rakouská republika — David porazil Goliáše s pomocí amerického Nejvyššího soudu.",
  "quip_wrong": "Průlom byl jinde. Altmannová dokázala, že stát může být přinucen vydat ukradené umění i po 60 letech.",
  "explanation": "Maria Altmannová, neteř Adele Bloch-Bauerové, bojovala sedm let. Případ skončil u amerického Nejvyššího soudu. Obraz pak koupil Ronald Lauder za 135 milionů dolarů pro newyorskou galerii Neue Galerie. Případ inspiroval film 'Žena ve zlatém' (2015) s Helen Mirren.",
  "about": "Klimtově obraze a jeho navrácení",
  "image_prompt": "A painterly watercolor illustration of a golden art nouveau portrait in a gallery with dramatic lighting echoing Klimt's gold leaf patterns, vintage travel journal style"
},
{
  "id": "at-a-kafemlyn",
  "cc": "at", "country": "Rakousko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Vídeň se stala jedním z prvních měst Evropy, kde se pila káva. Jak se k ní dostala — a je to spojeno s válkou?",
  "answer": "Po porážce osmanského obléhání roku 1683 Vídeňané objevili pytle kávy zanechané prchající tureckou armádou",
  "distractors": ["Benátští obchodníci otevřeli ve Vídni první kavárnu jako diplomatický dar císaři", "Vídeňský lékař přivezl kávu z Konstantinopole jako lék na únavu dvorních hudebníků", "Osmané vědomě nechali kávu jako diplomatický dárek po mírových jednáních"],
  "quip_correct": "Turci prchali a zapomněli kufry. Vídeň jim to nikdy nevrátila — ani pytle, ani recept.",
  "quip_wrong": "Nebyl to dar, byla to válečná kořist. Osmanská armáda utekla a zanechala za sebou zásoby.",
  "explanation": "Georg Franz Kolschitzky, zvěd, který pomohl při obléhání, dostal jako odměnu pytle s kávou. Otevřel jednu z prvních vídeňských kaváren a prý jako první přidal med a mléko — základ vídeňské tradice melange.",
  "about": "historii kávy ve Vídni",
  "image_prompt": "A painterly watercolor illustration of a 17th century Viennese street scene with the first coffeehouse opening after the Ottoman siege, with coffee sacks and curious citizens, vintage travel journal style"
},
{
  "id": "at-a-zillertal",
  "cc": "at", "country": "Rakousko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Dirndl a lederhosen jsou považovány za tradiční alpský oděv. Co je na jejich historii překvapivé?",
  "answer": "Jejich popularita jako 'tradiční kroj' je výmysl 19. století — městská móda, ne vesnická tradice",
  "distractors": ["Byly původně pracovním oděvem horníků, ne rolníků ani pastýřů", "Dirndl vznikl ve Francii a do Alp se dostal přes obchodní cesty", "Lederhosen jsou švýcarský vynález, který Rakušané přejali"],
  "quip_correct": "Tradice stará 150 let vydávaná za tisíciletou — to Rakušané umí stejně dobře jako štrúdl.",
  "quip_wrong": "Horníci možná, ale skutečná příčina je jiná. Romantismus 19. století vynalezl alpskou tradici pro potřeby turismu z Vídně.",
  "explanation": "Zájem o alpský kroj vznikl v době romantismu, kdy měšťané z Vídně jezdili do Alp na prázdniny a toužili po 'autentickém' vesnickém životě. Módní návrháři oděv stylizovali a prodávali zpět jako tradiční. Historik Eric Hobsbawm tento fenomén nazval 'invented tradition' (vynalezená tradice).",
  "about": "historii dirndlu a lederhosen",
  "image_prompt": "A painterly watercolor illustration of a 19th century Viennese illustration showing idealized alpine peasants in dirndl and lederhosen, vintage travel journal style"
},
{
  "id": "at-a-anschluss",
  "cc": "at", "country": "Rakousko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Po druhé světové válce se Rakousko desetiletí prezentovalo jako 'Hitlerova první oběť'. Kdy toto sebepojetí začalo výrazně revidovat?",
  "answer": "Až v 80. letech, kvůli aféře Kurta Waldheima, jehož nacistická minulost se stala mezinárodní kauzou",
  "distractors": ["V 60. letech, kdy soudní procesy s válečnými zločinci přinesly první veřejné přiznání viny", "Až po roce 1989, kdy sjednocení Německa Rakušany donutilo čelit vlastní historii", "V 70. letech díky tlaku Státu Izrael po odhalení skrývajících se válečných zločinců"],
  "quip_correct": "Waldheimova aféra ukázala, že kolektivní amnézie má expiraci — a mezinárodní tlak ji zkrátil.",
  "quip_wrong": "Zlom přišel jinak a jindy. Waldheimova aféra v roce 1986 otřásla mýtem o Rakousku jako pouhé oběti.",
  "explanation": "Kurt Waldheim byl generální tajemník OSN a kandidát na prezidenta. V roce 1986 vyšlo najevo, že sloužil v jednotkách zodpovědných za deportace. Přesto byl zvolen — ale ocitl se na mezinárodním bojkotovém seznamu. Tato krize spustila v Rakousku první skutečnou veřejnou debatu o vlastní roli ve válce.",
  "about": "rakouském vyrovnání s nacistickou minulostí",
  "image_prompt": "A painterly watercolor illustration of the Austrian Parliament building in Vienna with a reflective mood, vintage travel journal style"
},
{
  "id": "at-a-opera-kriz",
  "cc": "at", "country": "Rakousko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Vídeňská státní opera patří k nejprestižnějším na světě. Jak ji přijalo publikum po otevření v roce 1869?",
  "answer": "Kritici ji nazvali 'potopená bedna' — budova se jevila příliš nízká; architekt se oběsil, druhý zemřel na infarkt",
  "distractors": ["Premiérová opera se nezdařila — hlavní pěvkyně onemocněla a představení bylo vypískanou katastrofou", "Císař Franz Josef na slavnostním otevření prohlásil, že budova se mu nelíbí — a tím spustil odsouzení", "Kritici odmítali moderní styl budovy jako příliš francouzský a málo vídeňský"],
  "quip_correct": "Vídeňská kritika jako zbraň hromadného ničení — dva architekti to neustáli.",
  "quip_wrong": "Šlo o tragičtější příběh. Budova vypadala zasutá — a slova doslova zabíjela.",
  "explanation": "Budova se jevila příliš nízká, protože mezitím byl snížen terén Ringstrasse. Architekt Eduard van der Nüll se oběsil krátce po kritice; jeho kolega Sicardsburg zemřel na infarkt dva měsíce nato. František Josef pak začal diplomaticky říkat jen 'bylo to velmi zajímavé'.",
  "about": "historii Vídeňské státní opery",
  "image_prompt": "A painterly watercolor illustration of the Vienna State Opera house on the Ringstrasse at dusk with warm lamplight and elegant visitors, vintage travel journal style"
},
{
  "id": "at-a-salzburg-festival",
  "cc": "at", "country": "Rakousko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Salcburský festival patří k nejprestižnějším na světě. Jaká je méně známá ironie jeho zakladatele Huga von Hofmannsthala?",
  "answer": "Zemřel dva dny po sebevraždě svého syna a festival v plném rozkvětu nikdy nezažil",
  "distractors": ["Festival zamýšlel jako dočasnou poválečnou akci — nevěřil, že přežije pět ročníků", "Hofmannsthal festival navrhl jako odpověď Wagnerovu Bayreuthu — ale Wagner ho inspiroval osobně", "Byl Žid a po nástupu nacistů byl jeho podíl na festivalu záměrně vymazán z historie"],
  "quip_correct": "Zakladatel festivalu slavnosti neodolal — dějiny ho přepsaly bez jeho vědomí.",
  "quip_wrong": "Hofmannsthalův příběh je bolestnější. Zemřel v roce 1929 — festival slavil triumfy bez něj.",
  "explanation": "Hugo von Hofmannsthal zemřel v roce 1929 — dva dny po sebevraždě syna Franze. Festival, který spoluzaložil roku 1920 s Maxem Reinhardtem a Richardem Straussem, se stal světovou institucí až po jeho smrti. Turistické brožury jeho osobní tragédii neuvádějí.",
  "about": "Hugovi von Hofmannsthalovi a Salcburském festivalu",
  "image_prompt": "A painterly watercolor illustration of the Felsenreitschule open-air stage in Salzburg carved into rock with baroque arches and evening performance lighting, vintage travel journal style"
},
{
  "id": "at-a-schoenbrunn-zoo",
  "cc": "at", "country": "Rakousko", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Vídeňská zoo ve Schönbrunnu je nejstarší nepřetržitě fungující zoo na světě. Proč původně nevznikla pro veřejnost?",
  "answer": "Byla císařskou soukromou menažerií — veřejnosti ji zpřístupnili poté, co ji stát musel zachránit před bankrotem",
  "distractors": ["Vznikla jako vědecké pracoviště pro výzkum exotických zvířat, otevření veřejnosti byl vedlejší efekt", "Prvních sto let sloužila jako vojenská základna, kde cvičili slony pro přepravu zásob", "Byla uzavřenou zahradou pro děti habsburských arcivévodů jako výchovná pomůcka"],
  "quip_correct": "Z císařské soukromé radosti na veřejnou atrakci — bankovní účet rozhodl o historii.",
  "quip_wrong": "Vědecké pracoviště zní noblesně, ale důvod otevření byl prozaičtější: přišli o peníze.",
  "explanation": "Zoo ve Schönbrunnu vznikla v roce 1752 jako soukromá menažerie Františka I. Veřejnosti byla otevřena roku 1779. Dnes je jednou z mála zoo na světě, kde se pravidelně daří chovat velké pandy — díky dlouhodobé dohodě s Čínou.",
  "about": "historii zoo ve Schönbrunnu",
  "image_prompt": "A painterly watercolor illustration of the historic baroque Tiergarten Schönbrunn with its octagonal pavilion and exotic animals in 18th century Vienna, vintage travel journal style"
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
