"use strict";
// Vybrané a ověřené otázky z DeepSeek výstupu pro Německo.
// Zahozeno: factické chyby (Hašek/Nobel, Steffen/tyčkařka, Weber/Carmen, Bodamské jezero bez přítoku),
// duplikáty (Sophie Scholl, Einstein, preclík), trivial (Rýn v názvu), přebytek adult (50→12).
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "de.json");

const NEW_QUESTIONS = [
// DĚTI (4)
{
  "id": "de-k-berlin-medved",
  "cc": "de", "country": "Německo", "section": "Symboly",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaké zvíře je symbolem města Berlína a najdeš ho na mnoha tamních památkách?",
  "answer": "Medvěd",
  "distractors": ["Orel", "Lev", "Jelen"],
  "quip_correct": "Berlínský medvěd se v hlavním městě cítí jako doma — i když divoký tam žádný neleze.",
  "quip_wrong": "Tohle zvíře je sice impozantní, ale Berlínu vládne medvěd.",
  "explanation": "Medvěd se v berlínském znaku objevuje od 13. století. Proč zrovna medvěd? Pravděpodobně slovní hříčka se jménem zakladatele Albrechta Medvěda.",
  "about": "berlínském symbolu",
  "image_prompt": "A painterly watercolor illustration of a Berlin bear statue on a city street, vintage travel journal style"
},
{
  "id": "de-k-bratwurst-barva",
  "cc": "de", "country": "Německo", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jakou barvu má německá pečená klobása bratwurst, když je správně ugrilovaná?",
  "answer": "Zlatohnědou",
  "distractors": ["Červenou", "Zelenou", "Fialovou"],
  "quip_correct": "Zlatohnědá kůrčička — to je ten správný signál, že je čas zakousnout se!",
  "quip_wrong": "Fialová klobása by hodně překvapila i německého řezníka.",
  "explanation": "Bratwurst se griluje nebo smaží na tuku, dokud povrch nezíská typickou zlatohnědou barvu. Prodává se na trzích, stadionech i benzinkách — a všude chutná trochu jinak.",
  "about": "německém bratwurstu",
  "image_prompt": "A painterly watercolor illustration of golden-brown grilled bratwurst on a plate, vintage travel journal style"
},
{
  "id": "de-k-arkona",
  "cc": "de", "country": "Německo", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Na kterém německém ostrově v Baltském moři najdeš bílé křídové útesy a nejsevernější mys celého Německa?",
  "answer": "Rujána",
  "distractors": ["Sylt", "Usedom", "Fehmarn"],
  "quip_correct": "Správně! Bílé útesy Rujány jsou jako němečtí bratři těch anglických u Doveru.",
  "quip_wrong": "Sylt má taky pěkné pláže, ale křídové útesy hledej na Rujáně.",
  "explanation": "Křídové útesy na mysu Arkona na Rujáně jsou až 45 metrů vysoké a jsou pozůstatkem mořského dna starého přes 70 milionů let. Ostrov byl od roku 2011 spojen s pevninou mostem.",
  "about": "ostrově Rujána",
  "image_prompt": "A painterly watercolor illustration of white chalk cliffs at Cape Arkona on Rügen island, vintage travel journal style"
},
{
  "id": "de-k-branibor-barva",
  "cc": "de", "country": "Německo", "section": "Hlavní město",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jakou barvu má slavná Braniborská brána — symbol Berlína — když na ni svítí slunce?",
  "answer": "Světle béžovou až bílou",
  "distractors": ["Červenou", "Zlatou", "Černou"],
  "quip_correct": "Přesně! Světlý pískovec se ve slunci třpytí — brána vypadá jako z pohádky.",
  "quip_wrong": "Červená nebo zlatá by byla nápadná, ale brána je světlá — barva pískovce.",
  "explanation": "Braniborská brána je postavena z pískovce a má světlou béžovou barvu. Stojí od roku 1791 a za studené války oddělovala Východní a Západní Berlín.",
  "about": "Braniborské bráně",
  "image_prompt": "A painterly watercolor illustration of the Brandenburg Gate in Berlin in sunlight, vintage travel journal style"
},

// PUBERŤÁCI (5)
{
  "id": "de-t-rybarsky-pristav",
  "cc": "de", "country": "Německo", "section": "Místa",
  "difficulty": 1, "type": "choice",
  "question": "Ve kterém severoněmeckém městě najdeš největší přístav a slavnou rybí tržnici, která se koná každou neděli ráno?",
  "answer": "Hamburk",
  "distractors": ["Brémy", "Kiel", "Lübeck"],
  "quip_correct": "Hamburk je správně — rybí tržnice tam voní na kilometry daleko.",
  "quip_wrong": "Kiel má taky přístav, ale největší rybí tržnici najdeš v Hamburku.",
  "explanation": "Hamburský přístav je největší v Německu a druhý největší v Evropě. Rybí tržnice na Elbe funguje od roku 1703 — původně tam obchodníci prodávali úlovky dřív, než se otevřely kostely.",
  "about": "hamburském přístavu",
  "image_prompt": "A painterly watercolor illustration of Hamburg fish market and harbor at dawn, vintage travel journal style"
},
{
  "id": "de-t-schwarzwald",
  "cc": "de", "country": "Německo", "section": "Příroda",
  "difficulty": 1, "type": "choice",
  "question": "Který německý les dostal jméno podle barvy svých hustých tmavých smrkových porostů a je proslulý hodinami s kukačkou?",
  "answer": "Černý les",
  "distractors": ["Bavorský les", "Durynský les", "Harz"],
  "quip_correct": "Správně — hodiny s kukačkou a hustý les, to je Schwarzwald jak vyšitý.",
  "quip_wrong": "Bavorský les je taky tmavý, ale hodiny s kukačkou jsou specialita Schwarzwaldu.",
  "explanation": "Schwarzwald (Černý les) ve spolkové zemi Bádensko-Württembersko je největší pohoří Německa. Hodiny s kukačkou se tam vyrábějí od 18. století — dnes jsou to miliony kusů ročně.",
  "about": "Černém lese",
  "image_prompt": "A painterly watercolor illustration of dark dense Black Forest with a cuckoo clock on a tree, vintage travel journal style"
},
{
  "id": "de-t-lipsko-bitva",
  "cc": "de", "country": "Německo", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Které východoněmecké město je proslulé obrovským památníkem připomínajícím porážku Napoleona v roce 1813?",
  "answer": "Lipsko",
  "distractors": ["Drážďany", "Berlín", "Erfurt"],
  "quip_correct": "Lipsko si Napoleona dobře pamatuje — ale dnes tam místo bitev pořádají jazzový festival.",
  "quip_wrong": "Berlín má taky velký příběh s Napoleonem, ale ten památník stojí v Lipsku.",
  "explanation": "Bitva národů u Lipska v roce 1813 byla jednou z největších bitev v dějinách — účastnilo se jí přes půl milionu vojáků. Napoleonova porážka otevřela cestu k jeho abdikaci.",
  "about": "Lipsku",
  "image_prompt": "A painterly watercolor illustration of the Monument to the Battle of Nations in Leipzig, vintage travel journal style"
},
{
  "id": "de-t-bundesliga",
  "cc": "de", "country": "Německo", "section": "Sport",
  "difficulty": 1, "type": "choice",
  "question": "Jak se jmenuje nejvyšší německá fotbalová liga, kde hraje Bayern Mnichov a Borussia Dortmund?",
  "answer": "Bundesliga",
  "distractors": ["Serie A", "Premier League", "La Liga"],
  "quip_correct": "Bundesliga — Bayern tam sbírá trofeje jako houby po dešti.",
  "quip_wrong": "Serie A je italská, Premier League anglická — německá liga má jiné jméno.",
  "explanation": "Bundesliga byla founded v roce 1963 a průměrná návštěvnost přes 40 000 diváků na zápas z ní dělá nejnavštěvovanější ligu na světě — více než Premier League.",
  "about": "německé bundeslize",
  "image_prompt": "A painterly watercolor illustration of a packed German football stadium at night, vintage travel journal style"
},
{
  "id": "de-t-autoban",
  "cc": "de", "country": "Německo", "section": "Symboly",
  "difficulty": 2, "type": "choice",
  "question": "Čím jsou proslulé německé dálnice, co jinde v Evropě nenajdeš?",
  "answer": "Na části z nich není žádné omezení rychlosti",
  "distractors": ["Jsou zcela zdarma pro všechna vozidla", "Mají výhradně solární osvětlení", "Jsou stavěny bez asfaltového povrchu"],
  "quip_correct": "Přesně — na části dálnic tam skutečně není cedule s číslem a Němci to berou vážně.",
  "quip_wrong": "Zdarma jsou jen pro osobní auta — kamiony platí. Bez omezení rychlosti, to je to pravé.",
  "explanation": "Přibližně třetina německých dálnic nemá pevné omezení rychlosti — platí tam doporučená rychlost 130 km/h. Debata o celoplošném limitu se vede v Německu už desítky let bez výsledku.",
  "about": "německých dálnicích",
  "image_prompt": "A painterly watercolor illustration of an empty German autobahn stretching to the horizon, vintage travel journal style"
},

// DOSPĚLÍ (12)
{
  "id": "de-a-reinheitsgebot",
  "cc": "de", "country": "Německo", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Německá pivní vyhláška z roku 1516 je považována za nejstarší dochovaný potravinový zákon na světě. Co nařizovala?",
  "answer": "Pivo smí obsahovat jen vodu, ječmen a chmel — nic jiného",
  "distractors": ["Pivo musí být uvařeno výhradně mnichy v klášterech", "Každý sud musí být označen jménem sládka a rokem výroby", "Pivo se smí prodávat jen v létě, aby nezamrzlo ve sklepích"],
  "quip_correct": "Přesně — tři ingredience, žádné triky. Bavorský zákon o čistotě piva platil přes 400 let.",
  "quip_wrong": "Mniši pivo vařili, ale zákon byl světský — a ingredience předepsal, ne výrobce.",
  "explanation": "Reinheitsgebot vydal bavorský vévoda Vilém IV. v roce 1516. Kvasnice se do zákonem povoleného seznamu dostaly až o tři staletí později, když vědci zjistili, že vůbec existují.",
  "about": "Reinheitsgebotu",
  "image_prompt": "A painterly watercolor illustration of beer ingredients — hops, barley and water — with an old parchment, vintage travel journal style"
},
{
  "id": "de-a-wartburg",
  "cc": "de", "country": "Německo", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Martin Luther strávil rok v úkrytu na hradě Wartburg. Co tam stihl udělat, co ovlivnilo celý německý jazyk?",
  "answer": "Přeložil Nový zákon do němčiny — a položil základ jednotné spisovné němčiny",
  "distractors": ["Napsal 95 tezí, které přibil na kostelní dveře", "Sestavil první německý pravopisný slovník", "Zkomponoval chorál Ein feste Burg jako hymnu reformace"],
  "quip_correct": "Přesně — za rok v úkrytu vytvořil text, který Němci čtou dodnes.",
  "quip_wrong": "95 tezí přibil v Wittenbergu ještě před Wartburgem — na hradě dělal překladatelskou práci.",
  "explanation": "Lutherův překlad Nového zákona z roku 1522 sjednotil desítky německých dialektů do jednoho psaného jazyka. Göthe, Schiller a celá německá literatura stojí na tomto základu.",
  "about": "Lutherově překladu Bible",
  "image_prompt": "A painterly watercolor illustration of Martin Luther translating the Bible in Wartburg castle study, vintage travel journal style"
},
{
  "id": "de-a-grimm-dospeli",
  "cc": "de", "country": "Německo", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Bratři Grimmové sbírali pohádky jako vědci, ne jako autoři pro děti. Pro koho bylo původně jejich první vydání určeno?",
  "answer": "Pro dospělé čtenáře a vědce — pohádky byly brány jako historický doklad lidové kultury",
  "distractors": ["Pro děti šlechtických rodin jako mravní čtení před spaním", "Pro vojáky jako zábavné čtení na taženích", "Pro církev jako zásobník křesťanských alegorií"],
  "quip_correct": "Přesně — první vydání bylo vědecké dílo. Krvavé detaily zmírnili až v pozdějších vydáních pro děti.",
  "quip_wrong": "Mravní četbu pro šlechtické děti dělali jiní — Grimmové sbírali folklor jako vědci.",
  "explanation": "První vydání Dětských a domácích pohádek z roku 1812 obsahovalo explicitní násilí a sexualitu, která by dnes neprošla v dětské sekci knihkupectví. Teprve ve druhém vydání (1819) příběhy upravili.",
  "about": "pohádkách bratří Grimmů",
  "image_prompt": "A painterly watercolor illustration of an open old scholarly book with fairy tale scenes, vintage travel journal style"
},
{
  "id": "de-a-currywurst",
  "cc": "de", "country": "Německo", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Currywurst — klobása s kečupem a kari — je berlínská ikona. Co je překvapivé na jejím původu?",
  "answer": "Vynalezla ji roku 1949 žena v Berlíně z ingrediencí získaných od britských vojáků",
  "distractors": ["Recept přivezli dělníci z Hamburku a přizpůsobili ho berlínskému vkusu", "Vznikla jako levná náhrada za nedostupné hovězí v poválečném zásobování", "Vynalezl ji tureckýimmigrantský kuchař v 70. letech"],
  "quip_correct": "Přesně — Herta Heuwer smíchala kečup s kari práškem a Berlín byl navždy jiný.",
  "quip_wrong": "Hamburk má taky currywurst, ale recept vznikl v Berlíně — a u zrodu byla žena.",
  "explanation": "Herta Heuwer si nechala recept na omáčku patentovat v roce 1959. Dnes se v Německu sní přes 800 milionů porcí currywurstu ročně a v Berlíně má vlastní muzeum.",
  "about": "currywurstu",
  "image_prompt": "A painterly watercolor illustration of Currywurst with curry powder and ketchup on paper plate, vintage travel journal style"
},
{
  "id": "de-a-fuggerove",
  "cc": "de", "country": "Německo", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Bankéřská rodina Fuggerů z Augsburgu financovala císaře i papeže. Co překvapivého po sobě zanechali, co funguje dodnes?",
  "answer": "Nejstarší sociální sídliště na světě — Fuggerei v Augsburgu, kde se bydlí za symbolické nájemné",
  "distractors": ["Síť nemocnic po celé střední Evropě, dnes přeměněná na hotely", "Největší středověkou knihovnu, která přežila všechny války", "Systém obchodních cest, ze kterého vzešla dnešní německá dálniční síť"],
  "quip_correct": "Přesně — Fuggerei stojí od roku 1521 a nájemné je dodnes symbolické: méně než euro ročně.",
  "quip_wrong": "Nemocnice ani knihovny — Fuggerové postavili bytový komplex pro chudé, který přežil 500 let.",
  "explanation": "Jakob Fugger 'Bohatý' dal v roce 1521 postavit 67 domů pro chudé augsburské rodiny. Podmínky dodnes: catholická víra, bezúhonnost a tři denní modlitby za rodinu Fuggerů. Nájemné: 88 centů ročně.",
  "about": "Fuggerech",
  "image_prompt": "A painterly watercolor illustration of the Fuggerei social housing in Augsburg with old cobblestone streets, vintage travel journal style"
},
{
  "id": "de-a-bismarck",
  "cc": "de", "country": "Německo", "section": "Lidé",
  "difficulty": 3, "type": "choice",
  "question": "Otto von Bismarck byl konzervativní aristokrat, přesto zavedl něco, co šokovalo celou Evropu. Co to bylo?",
  "answer": "První moderní sociální pojistný systém — zdravotní, úrazové a důchodové pojištění jako první na světě",
  "distractors": ["Zrušení šlechtických privilegií a zavedení rovnosti před zákonem", "Povinnou školní docházku pro všechny děti bez ohledu na původ", "Osmihodinovou pracovní dobu — 40 let před ostatními zeměmi"],
  "quip_correct": "Přesně — Bismarck pojistil dělníky ne z lásky k nim, ale aby nepodporovali socialisty.",
  "quip_wrong": "Rovnost před zákonem a školní docházka přišly jindy — Bismarck vynalezl pojistný systém.",
  "explanation": "Bismarck zavedl v 80. letech 19. století zdravotní (1883), úrazové (1884) a důchodové (1889) pojištění. Byl to politický tah: pokud stát zajistí dělníky, nebudou potřebovat revoluce.",
  "about": "Ottu von Bismarckovi",
  "image_prompt": "A painterly watercolor illustration of Otto von Bismarck in chancellor uniform, vintage travel journal style"
},
{
  "id": "de-a-bauhaus",
  "cc": "de", "country": "Německo", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Škola Bauhaus ovlivnila celý světový design. Co je překvapivé na jejím osudu v Německu?",
  "answer": "Nacisté ji zavřeli jako 'degenerated art' — a její učitelé pak rozšířili myšlenky po celém světě z exilu",
  "distractors": ["Studenti ji sami zavřeli jako protest proti komercionalizaci designu", "Sloučila se s akademií výtvarných umění a přestala existovat jako samostatná škola", "Přestěhovala se do USA po pozvání Roosevelta jako součást New Dealu"],
  "quip_correct": "Přesně — Bauhaus nacisté zlikvidovali, ale tím ho vlastně rozšířili do světa.",
  "quip_wrong": "Studenti neprotestovali — o zavření školy rozhodli nacisté v roce 1933.",
  "explanation": "Bauhaus fungoval ve Výmaru, Desavě a Berlíně v letech 1919–1933. Po uzavření emigrovali Mies van der Rohe, Gropius a další do USA, kde ovlivnili celou modernistickou architekturu.",
  "about": "Bauhausu",
  "image_prompt": "A painterly watercolor illustration of Bauhaus Dessau building with geometric shapes and flat roof, vintage travel journal style"
},
{
  "id": "de-a-stollen",
  "cc": "de", "country": "Německo", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Drážďanský Stollen je chráněný vánoční dort s tvarem zavinutého dítěte. Proč smí nést to jméno jen vybraní pekaři?",
  "answer": "Pouze členové drážďanského pekařského cechu smějí péct Stollen s chráněným označením a pečetí",
  "distractors": ["Recept je tajný a předává se ústně jen v rodině zakladatele", "Označení chrání EU, protože mouka musí pocházet z konkrétního saského mlýna", "Jméno vlastní bavorská vláda a pronajímá ho drážďanským pekařům"],
  "quip_correct": "Přesně — bez pečeti je to jen ovocný dort, ne Dresdner Stollen.",
  "quip_wrong": "Tajný rodinný recept by byl romantičtější, ale realita je prozaičtější: cechovní ochrana.",
  "explanation": "Drážďanský Stollen se peče od 15. století a má vlastní slavnost — Stollenfest — kde se krájí obří Stollen vážící přes 4 tuny. Každý kus musí mít zlatou pečeť cechu.",
  "about": "drážďanském Stollenu",
  "image_prompt": "A painterly watercolor illustration of Dresden Stollen with powdered sugar and golden seal, vintage travel journal style"
},
{
  "id": "de-a-spreewald",
  "cc": "de", "country": "Německo", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Kraj Spreewald nedaleko Berlína je protkán stovkami kanálů. Co nečekaného tam má chráněné označení původu EU?",
  "answer": "Nakládané okurky — Spreewälder Gurken smějí nést to jméno jen z tohoto kraje",
  "distractors": ["Rašelina ze spreewaldských močálů používaná v lázních", "Dřevěné pramice ručně tesané místními řemeslníky", "Med ze spreewaldských luk s unikátní lužickosrbskou odrůdou včel"],
  "quip_correct": "Přesně — lužické okurky mají EU ochranku. Pádlo v ruce, okurka v druhé.",
  "quip_wrong": "Med a pramice jsou taky zajímavé, ale EU ochranné označení mají místní okurky.",
  "explanation": "Spreewaldský okurek se pěstuje v tomto kraji od 17. století, kdy tam lužickosrbští sedláci zavedli pěstování na podmáčených polích. Dnes se tam ročně vypěstuje přes 50 000 tun okurek.",
  "about": "Spreewaldu",
  "image_prompt": "A painterly watercolor illustration of Spreewald canals with rowboats and cucumber fields, vintage travel journal style"
},
{
  "id": "de-a-kolsch",
  "cc": "de", "country": "Německo", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Kolínské pivo Kölsch má neobvyklou ochranu — co z ní plyne?",
  "answer": "Kölsch smí nést to jméno jen pokud se vaří v okruhu 50 km od Kolína nad Rýnem",
  "distractors": ["Kölsch smí vařit jen pivovary starší 100 let s nepřerušenou tradicí", "Musí se podávat výhradně v malých válcových sklenicích zvaných Stange — jinak je porušen zákon", "Recept je chráněn jako německé národní dědictví a nesmí se exportovat"],
  "quip_correct": "Přesně — geografická ochrana jako u šampaňského. Kolíňáci ji brání s fanatismem.",
  "quip_wrong": "Stange je tradice, nikoli zákon — ale geografická ochrana je skutečná a vymahatelná.",
  "explanation": "Kölsch Convention z roku 1985 podepsalo 24 pivovarů a stanovila přísná pravidla. Výsledek: světlé, jemně nakyslé pivo podávané v úzkých sklenicích 0,2 l — Kolíňané ho dopijí dřív, než vychladne.",
  "about": "pivu Kölsch",
  "image_prompt": "A painterly watercolor illustration of Kölsch beer in small cylindrical glass with Cologne Cathedral behind, vintage travel journal style"
},
{
  "id": "de-a-letecky-most",
  "cc": "de", "country": "Německo", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Berlínský letecký most v letech 1948–49 zásoboval Západní Berlín obklíčený Sověty. Co bylo na logistice překvapivé?",
  "answer": "Letadla přistávala každé tři minuty nepřetržitě — v jednu chvíli to byl nejrušnější vzdušný koridor na světě",
  "distractors": ["Zásoby se spouštěly na padácích, protože letiště byl příliš malé na přistání", "Letadla létala jen v noci, přes den byl koridor uzavřen kvůli sovětským stíhačkám", "Zásobování organizoval soukromý podnik bez účasti armády"],
  "quip_correct": "Přesně — každé tři minuty nové letadlo, 15 měsíců bez přestávky. Logistický zázrak.",
  "quip_wrong": "Padáky ne — přistávalo se skutečně na letišti Tempelhof, a to bez přestávky.",
  "explanation": "Za 15 měsíců přistálo v Berlíně přes 270 000 letů s 2,3 miliony tun nákladu. Piloti vozili uhlí, jídlo i bonbóny pro berlínské děti — odtud přezdívka 'Raisenbomber' (rozinkový bombardér).",
  "about": "Berlínském leteckém mostu",
  "image_prompt": "A painterly watercolor illustration of Berlin airlift cargo planes above Tempelhof airport, vintage travel journal style"
},
{
  "id": "de-a-bach-lipsko",
  "cc": "de", "country": "Německo", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Johann Sebastian Bach strávil posledních 27 let života v Lipsku jako kantor. Co je na tom překvapivé?",
  "answer": "Lipsko ho přijalo jako třetí volbu — oba preferovaní kandidáti odmítli místo jako nedůstojné",
  "distractors": ["Bach se do Lipska přestěhoval dobrovolně a odmítl nabídku od pruského dvora", "Lipské radnice si ho pozvaly speciálně pro stavbu nového varhanního nástroje", "Bach v Lipsku trpěl cenzurou a většinu děl napsal v tajnosti"],
  "quip_correct": "Přesně — radnice ho přijala jako kompromis a dnes má Lipsko Bachovo muzeum.",
  "quip_wrong": "Dobrovolně ano, ale předtím odmítli Telemann a Graupner — Bach byl záložní plán.",
  "explanation": "Lipské radnice hledaly kantora pro kostel sv. Tomáše. Telemann odmítl, Graupner nemohl odejít od svého zaměstnavatele — a Bach přijal místo, které ostatní nepovažovali za dost prestižní. Výsledkem bylo přes 1 100 skladeb.",
  "about": "Bachově Lipsku",
  "image_prompt": "A painterly watercolor illustration of St Thomas Church Leipzig with choir and organ, vintage travel journal style"
}
];

const existing = JSON.parse(fs.readFileSync(FILE, "utf8"));
const existingIds = new Set(existing.map(q => q.id));

const toAdd = NEW_QUESTIONS.filter(q => {
  if (existingIds.has(q.id)) { console.warn("  ! Přeskočeno (duplikát):", q.id); return false; }
  return true;
});

fs.writeFileSync(FILE, JSON.stringify([...existing, ...toAdd], null, 1));
console.log(`Hotovo: přidáno ${toAdd.length}, přeskočeno ${NEW_QUESTIONS.length - toAdd.length}. Celkem: ${existing.length + toAdd.length}`);
