"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "se.json");

// Zahozeno (1):
// se-t-midnight-sun — duplikát tématu se-q-bile-noci (stejný jev, jiný úhel, ale zbytečné)

const NEW_QUESTIONS = [
// DĚTI (8)
{
  "id": "se-k-dalahast",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Dalský koník je malá dřevěná hračka — nejznámější symbol Švédska. Jakou má barvu?",
  "answer": "Červenou s bílými a žlutými vzory",
  "distractors": ["Modrou s hvězdami", "Zelenou s květinami", "Přírodní dřevo bez barvy"],
  "quip_correct": "Červený dalský koník: Švédsko v kostce — jednoduchý, veselý a na každém suvenýrovém stánku.",
  "quip_wrong": "Dalský koník bez červené by byl jako Švédsko bez sněhu.",
  "explanation": "Dalský koník se vyrábí v kraji Dalarna už přes 300 let — původně si je řezbáři dělávali ze zbytků dřeva v zimě jako hračky pro děti. Dnes je jich ročně vyrobeno přes 250 000.",
  "about": "dalském koníku jako švédském symbolu",
  "image_prompt": "A painterly watercolor illustration of a traditional red Dala horse wooden figurine with white and yellow painted folk patterns on a wooden table, vintage travel journal style"
},
{
  "id": "se-k-aurora",
  "cc": "se", "country": "Švédsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Na severu Švédska se v zimě po tmavé obloze pohybují barevné světelné závoje. Co to je?",
  "answer": "Polární záře — světla způsobená slunečním větrem",
  "distractors": ["Ohňostroj z blízkého města", "Světla z letadel nad Arktidou", "Odraz měsíce ve sněhu"],
  "quip_correct": "Polární záře: Švédsko má vlastní světelnou show — a vstupné je zdarma.",
  "quip_wrong": "Ohňostroj v mínus dvaceti? Odpal by byl problém.",
  "explanation": "Polární záře vzniká, když nabité částice ze slunce narazí do zemské atmosféry. Ve Švédsku ji nejlépe vidíte v oblasti Lappland kolem Abiska nebo Kiruny — tamní observatoř Aurora Sky Station ji monitoruje každou jasnou noc.",
  "about": "polární záři ve švédské Lapponii",
  "image_prompt": "A painterly watercolor illustration of green and purple northern lights dancing over a snowy Swedish forest with a frozen lake reflecting the colors, vintage travel journal style"
},
{
  "id": "se-k-krabba",
  "cc": "se", "country": "Švédsko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Švédové každý srpen pořádají velké venkovní párty, kde jedí jedno konkrétní mořské zvíře a zpívají u toho písničky. Co jedí?",
  "answer": "Raky — vařené s koprem a solí",
  "distractors": ["Sledě nakládané v octě", "Velryby na roštu", "Mořské hvězdice v omáčce"],
  "quip_correct": "Švédský rak-párty: papírové bryndáčky, kamarlenguova čepice a spousta kopru. Léto v kostce.",
  "quip_wrong": "Velryba by ten stůl nezvládla. Správně jsou to raky — malí, červení, a Švédové je zbožňují.",
  "explanation": "Kräftskiva, neboli račí párty, je tradice sahající do 16. století. Původně byl lov raků povolen jen šlechtě — když byl zrušen zákaz pro běžné lidi, vznikla lidová slavnost. Raky se jí se speciálními papírovými bryndáčky s rakovým vzorem.",
  "about": "švédské tradici kräftskiva — račí párty",
  "image_prompt": "A painterly watercolor illustration of a Swedish crayfish party outdoors with red crayfish on a table, paper lanterns, dill decorations, vintage travel journal style"
},
{
  "id": "se-k-renar",
  "cc": "se", "country": "Švédsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Na severu Švédska žijí ve volné přírodě a putují ve velkých stádech. Kdo se o ně stará a pase je?",
  "answer": "Sámové — původní obyvatelé severu Švédska",
  "distractors": ["Farmáři z jihu Švédska", "Turisté, kteří přijíždějí v zimě", "Vojáci chránící hranice s Norskem"],
  "quip_correct": "Sámové a sobi — partnerství starší než Švédsko samo. A fungovalo dřív než GPS.",
  "quip_wrong": "Turisté by soby naháněli jinými způsoby. Správně jsou to Sámové — původní pastevci severu.",
  "explanation": "Sámové jsou původní lid žijící v Laponsku napříč Švédskem, Norskem, Finskem a Ruskem. Chov sobů je pro ně tradiční způsob obživy — ve Švédsku mají zákonem chráněné právo na pastviny a migrační trasy pro svá stáda.",
  "about": "sámském lidu a chovu sobů ve Švédsku",
  "image_prompt": "A painterly watercolor illustration of a Sami herder in traditional colorful clothing guiding a reindeer herd across a snowy Nordic landscape, vintage travel journal style"
},
{
  "id": "se-k-systembolaget",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Ve Švédsku si nemůžeš koupit víno ani pivo v supermarketu jako v Česku. Kde ho musíš koupit?",
  "answer": "V jednom ze státních obchodů, které mají monopol na prodej alkoholu",
  "distractors": ["Na čerpacích stanicích se speciálním povolením", "Jen v restauracích — domů se alkohol nesmí nosit", "V lékárnách, protože alkohol se bere jako lék"],
  "quip_correct": "Státní monopol na alkohol: Švédsko řeší kocovinu na vládní úrovni.",
  "quip_wrong": "Čerpací stanice s vínem by byla švédská noční mora. Správně jsou to státní obchody Systembolaget.",
  "explanation": "Systembolaget existuje od roku 1955. Obchody jsou zavřené v neděli a mají omezené hodiny — paradoxně nabízejí jeden z nejlepších výběrů vín v celé Evropě, protože nakupují centrálně ve velkém.",
  "about": "švédském státním monopolu na alkohol Systembolaget",
  "image_prompt": "A painterly watercolor illustration of a clean minimalist Swedish Systembolaget state liquor store interior with neat wine bottle displays, vintage travel journal style"
},
{
  "id": "se-k-allemansr",
  "cc": "se", "country": "Švédsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Ve Švédsku smíš stanovat, chodit a sbírat borůvky skoro kdekoliv v přírodě — i na cizím pozemku. Jak se toto právo jmenuje?",
  "answer": "Allemansrätten — právo každého člověka",
  "distractors": ["Friluftslag — zákon o volném čase", "Naturrätt — přírodní zákon", "Skogsfrid — les je svobodný"],
  "quip_correct": "Allemansrätten: ve Švédsku je příroda pro všechny. Žádné cedulky 'Soukromý pozemek — vstup zakázán'.",
  "quip_wrong": "Hezký název, ale není to ten pravý. Správně je allemansrätten — a platí doopravdy.",
  "explanation": "Allemansrätten je zakotveno v ústavě. Jediné podmínky: nesmíš tábořit přímo u domu vlastníka, nesmíš ničit přírodu a nesmíš sbírat chráněné rostliny. Švédové toto právo považují za součást národní identity.",
  "about": "švédském právu allemansrätten",
  "image_prompt": "A painterly watercolor illustration of a family camping freely in a Swedish birch forest next to a calm lake, picking blueberries, with a small red tent, vintage travel journal style"
},
{
  "id": "se-k-nobelovy-ceny",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Každý rok ve Stockholmu rozdávají velké ceny vědcům a spisovatelům z celého světa. Jak se tyto ceny jmenují?",
  "answer": "Nobelovy ceny — pojmenované po Alfredu Nobelovi",
  "distractors": ["Vikingské ceny za moudrost", "Stockholmské medaile za vědu", "Švédské koruny za vynálezy"],
  "quip_correct": "Nobelova cena: vynálezce dynamitu odkázal svůj majetek na ocenění těch, kteří svět zachraňují. Ironie nezapomenutelná.",
  "quip_wrong": "Vikingové ceny za moudrost bohužel nedělali.",
  "explanation": "Alfred Nobel vynalezl dynamit a zbohatl na výrobě výbušnin. Když si přečetl vlastní nekrolog (noviny ho omylem prohlásily za mrtvého), byl zdrcen titulem 'obchodník se smrtí'. Proto odkázal svůj majetek na ceny za fyziku, chemii, medicínu, literaturu a mír.",
  "about": "Nobelových cenách a jejich udílení ve Stockholmu",
  "image_prompt": "A painterly watercolor illustration of the grand Stockholm Concert Hall with golden Nobel Prize medals and a formal ceremony with elegant decorations, vintage travel journal style"
},
{
  "id": "se-k-vasaloppet",
  "cc": "se", "country": "Švédsko", "section": "Sport",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Vasaloppet je největší lyžařský závod na světě — každý rok ho absolvují tisíce lidí. Co je na trase zvláštní?",
  "answer": "Je dlouhá 90 kilometrů — účastníci jedou celý den",
  "distractors": ["Závodí se v noci pod reflektory", "Trasa vede přes zamrzlé jezero do Norska", "Závodníci musí nést batoh s potravinami"],
  "quip_correct": "90 kilometrů na lyžích. Vasaloppet je místo, kde si Švédové ověřují, že jsou opravdu Švédové.",
  "quip_wrong": "Noční závod by byl hezký, ale Švédové preferují mráz ve dne. Správně je 90 kilometrů.",
  "explanation": "Vasaloppet se koná od roku 1922 a je inspirován útěkem krále Gustava Vasy z roku 1521, kdy na lyžích prchal před Dány. Závodu se účastní až 15 000 závodníků ročně — od olympijských šampionů po turisty, kteří to dokončí za 12 hodin.",
  "about": "lyžařském závodě Vasaloppet",
  "image_prompt": "A painterly watercolor illustration of thousands of cross-country skiers racing through a snowy Swedish forest landscape in Dalarna, vintage travel journal style"
},

// PUBERŤÁCI (7)
{
  "id": "se-t-lagom",
  "cc": "se", "country": "Švédsko", "section": "Jazyk",
  "difficulty": 1, "type": "choice",
  "question": "Švédské slovo 'lagom' se nedá přeložit do jednoho slova v jiných jazycích. Co znamená?",
  "answer": "Tak akorát — ani moc, ani málo, přesně správné množství",
  "distractors": ["Pohoda — stav klidu a spokojenosti", "Férově — každý dostane stejný díl", "Skromně — nevystupovat nad ostatní"],
  "quip_correct": "Lagom: Švédsko v jednom slově. Žádné excesy, žádná bída — jen přesně dost.",
  "quip_wrong": "Pohoda je dánská hygge, to je jiný příběh. Lagom je švédský — a znamená tak akorát.",
  "explanation": "Jedna etymologická teorie říká, že lagom pochází z výrazu 'laget om' — kolem skupiny — tedy množství piva, které se přesně rozdělilo, když putovala číše do kola. Dnes lagom popisuje celou švédskou filozofii: nevynikat, nepřehánět, nepodlézat.",
  "about": "švédském konceptu lagom",
  "image_prompt": "A painterly watercolor illustration of a perfectly set Swedish dining table with modest portions and contented people sharing a meal in a cozy wooden house, vintage travel journal style"
},
{
  "id": "se-t-zlaty-vek-pop",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Švédsko je třetím největším exportérem populární hudby na světě — za USA a UK. Jak to, že tak malá země produkuje tolik hitů?",
  "answer": "Díky státem dotovaným hudebním školám — každé dítě má přístup k nástrojům a výuce",
  "distractors": ["Švédové mají geneticky lepší hudební sluch podle vědeckých studií", "Přísné autorské zákony donutily producenty investovat do domácích umělců", "Velké americké firmy přesunuly do Švédska studia kvůli nižším daním"],
  "quip_correct": "Státem placené kytary jako exportní artikl. Švédsko pochopilo, co jiní teprve zkouší.",
  "quip_wrong": "Genetický sluch by byl praktický, ale neprokázaný. Klíč je jinde — v bezplatných hudebních školách.",
  "explanation": "Švédský systém kommunal musikskola (obecní hudební škola) funguje od 50. let — každé dítě může za symbolický poplatek nebo zdarma studovat nástroj. Max Martin, producent hitů Britney Spears, Taylor Swift nebo The Weeknd, prošel přesně tímto systémem.",
  "about": "švédském hudebním vzdělávání a exportu populární hudby",
  "image_prompt": "A painterly watercolor illustration of Swedish children learning guitar and piano in a bright municipal music school classroom, vintage travel journal style"
},
{
  "id": "se-t-stokholmsky-syndrom",
  "cc": "se", "country": "Švédsko", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Stockholmský syndrom — kdy si oběti vytvářejí pouto s únosci — dostal název po skutečné události. Co se stalo ve Stockholmu?",
  "answer": "Přepadení banky v roce 1973, při němž rukojmí začali chránit lupiče před policií",
  "distractors": ["Teroristický útok v metru, kde cestující hájili útočníka", "Únos lodi, při kterém se posádka přidala na stranu pirátů", "Politický proces, kde svědci začali hájit obviněného diktátora"],
  "quip_correct": "Stockholm 1973: rukojmí chránili lupiče. Psychologové dostali nový termín, banka dostala díru ve zdi.",
  "quip_wrong": "Metro bylo v pořádku. Správně to bylo přepadení banky — a rukojmí se do lupiče zamilovali.",
  "explanation": "Jan-Erik Olsson přepadl Kreditbanken a šest dní držel čtyři rukojmí. Po propuštění svědčili v jeho prospěch a jedna z žen se s ním zasnoubila. Psychiatr Nils Bejerot termín 'stockholmský syndrom' razil — ale Olsson sám ho dodnes považuje za nesmysl.",
  "about": "stockholmském syndromu a jeho historickém původu",
  "image_prompt": "A painterly watercolor illustration of a 1970s Stockholm street scene with a bank facade and police vehicles in the background, vintage travel journal style"
},
{
  "id": "se-t-pippi",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 1, "type": "choice",
  "question": "Pipi Dlouhá punčocha od Astrid Lindgrenové je jednou z nejpřekládanějších knih světa. Co bylo na Pipi v době vydání skandální?",
  "answer": "Žila sama bez dospělých, ignorovala pravidla a dospělé opravovala — záměrný vzdor autoritám",
  "distractors": ["Kniha byla zakázána kvůli kouzlům podobně jako Harry Potter", "Pipi mluvila sprostě — vydavatel musel text upravit pro každou zemi", "Příběh byl zakázán v SSSR jako příliš individualistická propaganda"],
  "quip_correct": "Pipi: silnější než policajt, bohatší než král, bez rodičů a bez pravidel. Děti ji zbožňovaly. Dospělí se třásli.",
  "quip_wrong": "Harry Potter přišel o půl století později. Pipi šokovala jinak — tím, že nepotřebovala dospělé.",
  "explanation": "Astrid Lindgrenová Pipi napsala v roce 1945. Vydavatelé ji nejdřív odmítli jako příliš anarchistickou. Pipi je nejsilnější dívka na světě, žije sama s koněm a opicí a nechodí do školy — přesný opak toho, co tehdejší společnost od dívek čekala.",
  "about": "Pipi Dlouhé punčoše a Astrid Lindgrenové",
  "image_prompt": "A painterly watercolor illustration of Pippi Longstocking with wild red pigtails lifting a horse outside her Villa Villekulla cottage in a sunny Swedish countryside, vintage travel journal style"
},
{
  "id": "se-t-sportstuga",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 1, "type": "choice",
  "question": "Většina Švédů má nebo využívá chatu v přírodě — říkají jí stuga. Co tam Švédové nejčastěji dělají?",
  "answer": "Tráví tam čas v přírodě — plavání, houbaření, klid bez internetu",
  "distractors": ["Pronajímají ji turistům jako airbnb", "Vaří tam jen tradiční recepty ze starých knih", "Sledují tam švédské filmy na projekci pod širým nebem"],
  "quip_correct": "Stuga: švédský způsob, jak uniknout ze Stockholmu přímo do klidu. Wifi volitelná — příroda povinná.",
  "quip_wrong": "Airbnb chalupa je byznys, ne švédský způsob života. Stuga je o úplném vypnutí v přírodě.",
  "explanation": "Ve Švédsku je přibližně 600 000 rekreačních chatek — na zemi s 10 miliony obyvatel. Friluftsliv (volný život venku) je silně zakořeněná hodnota: průzkumy ukazují, že průměrný Švéd tráví v přírodě přes 200 dní ročně.",
  "about": "švédské chatové kultuře a stuze",
  "image_prompt": "A painterly watercolor illustration of a classic red Swedish summer cottage by a calm lake surrounded by birch trees, with a small dock and rowboat, vintage travel journal style"
},
{
  "id": "se-t-volvo-bezpecnost",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Volvo vynalezlo bezpečnostní pás a v roce 1959 ho dalo světu jako volný patent. Proč ho neprodalo za peníze?",
  "answer": "Firma se rozhodla, že lidské životy jsou důležitější než zisk — bezpečnostní pás musí mít každý",
  "distractors": ["Patent byl příliš složitý na ochranu, tak ho raději zveřejnili", "Švédský zákon tehdy zakazoval firmám patentovat bezpečnostní vybavení", "Prodali ho americké vládě za symbolickou cenu jedné koruny"],
  "quip_correct": "Volvo vzdalo patent na bezpečnostní pás. Od té doby zachránil přes milion životů. Špatný byznys, skvělé rozhodnutí.",
  "quip_wrong": "Patent byl jasný a prodejný. Volvo se prostě rozhodlo jinak — životy nad ziskem.",
  "explanation": "Inženýr Nils Bohlin vynalezl tříbodový bezpečnostní pás v roce 1959. Volvo odhadovalo, že otevřený patent zachrání více životů než monopol. Americká Traffic Safety Administration odhaduje, že bezpečnostní pásy zachránily od té doby přes 3,5 milionu životů.",
  "about": "Volvově daru bezpečnostního pásu světu",
  "image_prompt": "A painterly watercolor illustration of a 1959 Volvo car interior showing the three-point seatbelt with a Swedish factory workshop in the background, vintage travel journal style"
},
{
  "id": "se-t-kallsvimning",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Zimní koupání v ledové vodě je ve Švédsku rozšířená tradice. Po čem si Švédové typicky skočí do ledové vody?",
  "answer": "Po sauně — střídání horka a mrazu je považováno za zdravotní rituál",
  "distractors": ["Po silvestrovské půlnoci jako novoroční rituál", "Po pohřbu jako symbol přechodu", "Po sportovním tréninku místo sprchy"],
  "quip_correct": "Sauna, ledová voda, sauna — švédský wellness cyklus, který by psychicky zdatného člověka přesvědčil o čemkoliv.",
  "quip_wrong": "Silvestr je oblíbený, ale ledová voda má svůj vlastní kontext. Správně je to po sauně.",
  "explanation": "Sauna je ve Švédsku běžná součást domácností, bytových domů i kancelářských budov. Tradice kallsvimning (zimního plavání) se v posledních letech rychle šíří — pravidelně ho praktikuje přes 200 000 Švédů. Lékaři potvrzují pozitivní efekt na krevní oběh a imunitu.",
  "about": "švédské tradici zimního koupání a sauny",
  "image_prompt": "A painterly watercolor illustration of a Swedish sauna by a frozen lake with people jumping through an ice hole into dark water in winter, vintage travel journal style"
},

// DOSPĚLÍ (8)
{
  "id": "se-a-chudina-emigranti",
  "cc": "se", "country": "Švédsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Dnešní bohaté Švédsko mělo ještě před 150 lety zcela jinou pověst. Co platilo o Švédsku v 19. století?",
  "answer": "Bylo jednou z nejchudších zemí Evropy — přes milion Švédů emigrovalo do USA z hladu a beznaděje",
  "distractors": ["Bylo ekonomickou velmocí díky těžbě stříbra a exportu dřeva", "Bylo závislé na půjčkách od Dánska a Pruska jako chronický dlužník", "Bojovalo s chronickými epidemiemi cholery, které vylidnily venkov"],
  "quip_correct": "Chudá, hladová, emigrující — to bylo Švédsko před IKEA, Volvem a sociálním státem.",
  "quip_wrong": "Stříbrné doly by to vyřešily, ale Švédsko mělo jiné bohatství — a zatím ho neumělo použít.",
  "explanation": "Mezi lety 1850 a 1930 emigrovalo do USA přes 1,3 milionu Švédů — z populace tehdy čítající 3–5 milionů. Nejčastěji mířili do Minnesoty a Illinois. Transformaci umožnila industrializace, ale klíčový byl kompromis z roku 1938 — dohoda Saltsjöbaden mezi odbory a zaměstnavateli.",
  "about": "švédské emigraci a cestě z chudoby k blahobytu",
  "image_prompt": "A painterly watercolor illustration of 19th century Swedish emigrants boarding a steamship at Gothenburg harbor with humble belongings, vintage travel journal style"
},
{
  "id": "se-a-sterilizace",
  "cc": "se", "country": "Švédsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Švédsko je vzorem sociálního státu a lidských práv. Přesto provádělo jeden z největších eugenických programů v demokratickém světě. Kdy skončil?",
  "answer": "V roce 1975 — nucené sterilizace probíhaly 40 let a postihly přes 63 000 lidí, převážně žen",
  "distractors": ["V roce 1945 — program skončil s koncem druhé světové války", "V roce 1960 — po mezinárodní kritice ze strany OSN", "V roce 1990 — program trval až do pádu komunismu ve východní Evropě"],
  "quip_correct": "Vzorná demokracie, vzorný sociální stát — a 63 000 nucených sterilizací. Švédsko se s tím vyrovnávalo desítky let.",
  "quip_wrong": "1945 je příliš přímočarý konec — Švédsko bylo demokratická země a program nekončil s Hitlerem, ale trval dál.",
  "explanation": "Švédský eugenický zákon z roku 1935 umožňoval nucené sterilizace 'nepřizpůsobivých' — chudých, mentálně nemocných, Romů, svobodných matek. Oběti dostaly odškodnění až v roce 1999 po sérii novinářských investigací.",
  "about": "švédském eugenickém programu a nucených sterilizacích",
  "image_prompt": "A painterly watercolor illustration of a somber Swedish government archive building in the 1950s with official documents and a grey winter sky, vintage travel journal style"
},
{
  "id": "se-a-palme",
  "cc": "se", "country": "Švédsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Vražda premiéra Olofa Palmeho v roce 1986 otřásla Švédskem i proto, jak k ní došlo. Co bylo na okolnostech neuvěřitelné?",
  "answer": "Šel pěšky domů z kina bez ochranky — sám, s manželkou, přes noční Stockholm",
  "distractors": ["Byl zastřelen při televizním přenosu živě před kamerami", "Vražda se stala v parlamentu během zasedání vlády", "Byl zabit na státní návštěvě Norska, nikoli ve Švédsku"],
  "quip_correct": "Švédský premiér šel domů z kina pěšky bez ochranky. To byl konec švédské nevinnosti.",
  "quip_wrong": "Živý přenos by byl jiný druh tragédie. Palme byl zastřelen prostě na ulici — bez ochrany, bez alarmu.",
  "explanation": "Olof Palme byl znám tím, že odmítal osobní ochranu — považoval ji za symbol elitářství. Vrah nikdy nebyl s jistotou identifikován, přestože případ byl uzavřen v roce 2020 označením pravděpodobného pachatele (bez soudu — zemřel dříve).",
  "about": "vraždě premiéra Olofa Palmeho",
  "image_prompt": "A painterly watercolor illustration of a quiet Stockholm street at night near Sveavägen with a memorial of flowers and candles, vintage travel journal style"
},
{
  "id": "se-a-alkohol-paradox",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Švédsko má přísný státní monopol na alkohol — a zároveň jeden z nejvyšších výskytů pijáctví v Evropě. Co tento paradox vysvětluje?",
  "answer": "Restriktivní normy vytlačily pití do soukromí a víkendů — vzorec 'nepít celý týden, opít se v pátek'",
  "distractors": ["Systembolaget prodává jen kvalitní alkohol — a kvalitní alkohol se pije více", "Švédové pijí tajně doma vyrobené pálenky, které statistiky nepostihují", "Skandinávské geny způsobují nižší toleranci na alkohol"],
  "quip_correct": "Státní monopol vyřešil problém opilosti tak, že ho přesunul na pátek večer.",
  "quip_wrong": "Domácí pálenka je lákavá teorie, ale skutečný mechanismus je sociologičtější — týdenní abstinence a víkendová exploze.",
  "explanation": "Sociologové tento vzorec nazývají 'binge drinking culture' — na rozdíl od středomořského modelu denní konzumace malého množství s jídlem. Restriktivní přístup paradoxně posílil sváteční charakter pití. Finsko a Norsko mají podobný problém.",
  "about": "švédském paradoxu alkoholové politiky",
  "image_prompt": "A painterly watercolor illustration of a minimalist Swedish Systembolaget store exterior on a quiet Friday afternoon with people queuing, vintage travel journal style"
},
{
  "id": "se-a-jante",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Jantelagen — zákon Jante — popisuje skandinávský tlak na průměrnost. Odkud pochází?",
  "answer": "Z románu dánsko-norského autora Aksela Sandemoseho z roku 1933 — ale Švédové ho přijali jako popis vlastní kultury",
  "distractors": ["Je to starý vikingský zákoník upravující chování ve vesnici", "Pochází ze švédského školského systému 19. století, který trestal chvástavé žáky", "Vymysleli ho švédští sociologové 70. let jako kritiku rovnostářské politiky"],
  "quip_correct": "Dán popsal Norsko, Švédové to přečetli a řekli: to jsme my. Jantelagen: literární fikce jako národní zrcadlo.",
  "quip_wrong": "Vikingové měli jiné starosti než chvástavé sousedy. Jantelagen je mladší a literárnějšího původu.",
  "explanation": "Sandemoseho román 'Uprchlík překračuje svůj osud' obsahuje deset pravidel Jante — všechna začínají 'Nesmíš si myslet, že jsi...' (lepší, chytřejší, důležitější než ostatní). Dnes se lagom a jantelagen používají jako dvojice: jeden pozitivní, druhý negativní pohled na tutéž vlastnost.",
  "about": "jantelagen — skandinávském zákonu průměrnosti",
  "image_prompt": "A painterly watercolor illustration of a quiet small Swedish town with identical houses, neighbors glancing sideways at each other over white fences, vintage travel journal style"
},
{
  "id": "se-a-ikea-efekt",
  "cc": "se", "country": "Švédsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "IKEA katalog byl druhá nejrozšířenější tiskovina po Bibli. Ale IKEA skrývá ještě překvapivější rekord. Jaký?",
  "answer": "IKEA vlastní přes 200 000 hektarů lesa — je jedním z největších soukromých vlastníků lesů na světě",
  "distractors": ["IKEA prodá více nábytku v Číně než ve Švédsku a celé Evropě dohromady", "IKEA restaurace jsou největší restaurační řetězec v Evropě počtem návštěvníků", "IKEA zaměstnává více lidí než švédská armáda, policie a zdravotnictví dohromady"],
  "quip_correct": "IKEA: nábytkářská firma, která vlastní lesy jako malý stát. Suroviny si hlídá od kořene.",
  "quip_wrong": "Čínská čísla jsou velká, ale les je překvapivější — IKEA je jeden z největších soukromých vlastníků lesů světa.",
  "explanation": "IKEA ovládá přes svou mateřskou nadaci lesy v Rumunsku, Pobaltí, USA a dalších zemích — celkem přes 200 000 ha, přibližně rozloha Lucemburska. IKEA zároveň investuje masivně do obnovitelné energie — vlastní větrné farmy a solární elektrárny.",
  "about": "IKEA a jejím vlastnictví lesů",
  "image_prompt": "A painterly watercolor illustration of a vast managed Swedish pine forest with subtle IKEA blue and yellow color hints in the sky, vintage travel journal style"
},
{
  "id": "se-a-zeme-prava",
  "cc": "se", "country": "Švédsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Švédsko bylo první zemí na světě, která zavedla jeden konkrétní zákon na ochranu práv — ještě před Francií, USA i Británií. O čem zákon byl?",
  "answer": "O svobodě tisku — zákon z roku 1766 zaručoval svobodu slova a zrušil cenzuru",
  "distractors": ["O zrušení nevolnictví — Švédsko jako první osvobodilo poddané v 18. století", "O volební reformě — jako první dalo právo volit všem mužům bez majetkového cenzu", "O právu na vzdělání — povinná školní docházka pro všechny děti, dívky i chlapce"],
  "quip_correct": "Svoboda tisku 1766: Švédsko nechalo novináře psát. Ostatní státy potřebovaly ještě sto let.",
  "quip_wrong": "Nevolnictví bylo důležité, ale Švédsko vedlo v jiné oblasti — svoboda tisku 1766.",
  "explanation": "Švédský zákon o svobodě tisku (Tryckfrihetsförordningen) z roku 1766 byl první svého druhu na světě. Zavedl nejen svobodu tisku, ale i právo na přístup k vládním dokumentům — princip, který dnes funguje jako zákon o svobodném přístupu k informacím.",
  "about": "švédském zákoně o svobodě tisku z roku 1766",
  "image_prompt": "A painterly watercolor illustration of an 18th century Swedish printing press in operation with a printer and typeset pages, vintage travel journal style"
},
{
  "id": "se-a-goteborska-pozar",
  "cc": "se", "country": "Švédsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Největší mírová katastrofa v moderní historii Švédska byl požár diskotéky v Göteborgu v roce 1998. Co bylo na tragédii zvlášť znepokojivé pro švédskou společnost?",
  "answer": "Oběti byly téměř výhradně mladí imigranti — a záchranáři přijeli pozdě, protože klub nebyl v systémech označen jako rizikový",
  "distractors": ["Ukázalo se, že evakuační plány v celém Göteborgu nebyly nikdy testovány", "Majitel klubu byl poslanec parlamentu, což způsobilo pád vlády", "Polovina obětí zahynula při tramvajové havárii na cestě na místo nehody"],
  "quip_correct": "63 mrtvých, téměř samí imigranti, pozdní záchranáři — Göteborg 1998 donutil Švédsko podívat se do zrcadla.",
  "quip_wrong": "Evakuace je důležitá, ale klíčová rána byla jinde — sociální a záchranářské selhání v kombinaci.",
  "explanation": "Požár v diskoklubu Backaplan 29. října 1998 zabil 63 mladých lidí, převážně dětí imigrantů z Blízkého východu. Tragédie spustila debatu o integraci, rasové segregaci ve švédských předměstích a rovném přístupu záchranných složek.",
  "about": "požáru diskotéky v Göteborgu roku 1998",
  "image_prompt": "A painterly watercolor illustration of a somber candlelight vigil in a Gothenburg street with flowers and photos as a memorial, muted winter tones, vintage travel journal style"
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
