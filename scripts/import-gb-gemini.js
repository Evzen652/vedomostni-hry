"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "gb.json");

// Zahozeno (1):
// gb-a-anglictina-maso — duplikát gb-q-etymologie (pig/pork příklad identický)

const NEW_QUESTIONS = [
// DĚTI (8)
{
  "id": "gb-k-jednorozec",
  "cc": "gb", "country": "Velká Británie", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaké pohádkové zvíře s jedním rohem na čele je oficiálním národním symbolem Skotska?",
  "answer": "Jednorožec",
  "distractors": ["Drak", "Létající kůň", "Fénix"],
  "quip_correct": "Kdo jiný by měl reprezentovat zemi plnou mlhy a tajemství než bájný tvor!",
  "quip_wrong": "Tohle zvíře sice potkáš jen v pohádkách, ale na skotském erbu stojí už od středověku.",
  "explanation": "Skotové si jednorožce zvolili pro jeho nespoutanost a sílu — věřili, že ho nikdo nedokáže přemoci. Na skotském královském erbu ho drží na řetězu, aby nenapadl lva anglického.",
  "about": "skotském národním symbolu jednorožci",
  "image_prompt": "A majestic mythical unicorn standing proud in front of misty Scottish mountains, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-k-schranka",
  "cc": "gb", "country": "Velká Británie", "section": "Místa",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jakou ikonickou barvu mají tradiční britské poštovní schránky a staré telefonní budky?",
  "answer": "Červenou",
  "distractors": ["Modrou", "Žlutou", "Zelenou"],
  "quip_correct": "Nepřehlédnutelná záře, kterou nepřehlédneš ani v té nejhustší londýnské mlze!",
  "quip_wrong": "V šedivém britském počasí bys jinou barvu v ulicích jen těžko hledal.",
  "explanation": "Původně byly schránky zelené, ale lidé do nich v noci naráželi. Přetřeli je na červenou — a zároveň vznikla jedna z nejznámějších vizuálních identit Británie.",
  "about": "červených britských poštovních schránkách",
  "image_prompt": "A classic bright red British post box standing on a rainy London sidewalk, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-k-kilt",
  "cc": "gb", "country": "Velká Británie", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se říká tradiční kostkované sukni, kterou ve Skotsku při slavnostech nosí i muži a chlapci?",
  "answer": "Kilt",
  "distractors": ["Tóga", "Kimono", "Pončo"],
  "quip_correct": "Vítr pod ním sice fouká, ale skotští dudáci v kiltu vypadají neuvěřitelně elegantně!",
  "quip_wrong": "Říct Skotovi, že má na sobě obyčejnou sukni, by tě mohlo stát přátelství.",
  "explanation": "Každý skotský rod neboli klan má na kiltu svůj vlastní vzor a kombinaci barev zvanou tartan. Vzorů je přes 7000 a každý klan si svůj chrání jako rodinný erb.",
  "about": "skotském tradičním kiltu",
  "image_prompt": "A Scottish bagpiper wearing a traditional tartan kilt performing at a highland festival, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-k-caj-mleko",
  "cc": "gb", "country": "Velká Británie", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Co si Britové velmi často přilévají do horkého černého čaje, čímž nápoj zjemní a obarví do světle hněda?",
  "answer": "Mléko",
  "distractors": ["Pomerančový džus", "Rozpuštěnou čokoládu", "Jablečný ocet"],
  "quip_correct": "Na pátou hodinu je konvice připravená a bílá kapka nesmí chybět!",
  "quip_wrong": "Ostatní přísady by z lahodného životabudiče udělaly spíše chemický experiment.",
  "explanation": "Tradice přilévání mléka vznikla proto, že studené mléko ochladilo čaj a zabránilo prasknutí jemných porcelánových šálků. Dnes Britové vypijí přes 100 milionů šálků čaje denně.",
  "about": "britském zvyku pití čaje s mlékem",
  "image_prompt": "A steaming cup of English tea with a splash of milk being poured in, cozy afternoon setting, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-k-straz-cepice",
  "cc": "gb", "country": "Velká Británie", "section": "Lidé",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Co mají na hlavě královští strážci u paláce v Londýně, co vypadá jako obří černá chlupatá čepice?",
  "answer": "Čepici z medvědí kůže",
  "distractors": ["Ovčí vlnu", "Ptačí peří", "Černou slámu"],
  "quip_correct": "Tato pokrývka hlavy měří přes 40 centimetrů a strážci v ní vypadají o dost vyšší!",
  "quip_wrong": "S ptačím peřím na hlavě by se před královským palácem hlídka držela jen těžko.",
  "explanation": "Vysoké čepice z medvědí kožešiny měly v minulosti opticky zvětšit vojáky a nahnat strach nepřátelům na bitevním poli. Dnes jsou součástí ceremoniálního oblečení a váží přes 700 gramů.",
  "about": "čepicích britské královské stráže",
  "image_prompt": "A British Royal Guard standing at attention in red uniform and tall black bearskin hat outside Buckingham Palace, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-k-excalibur",
  "cc": "gb", "country": "Velká Británie", "section": "Historie",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaký slavný kouzelný meč vytáhl podle staré britské legendy mladý král Artuš z pevného kamene?",
  "answer": "Excalibur",
  "distractors": ["Durandal", "Dyrnwyn", "Hrunting"],
  "quip_correct": "Jeden pořádný záběr a z obyčejného chlapce byl nejobávanější král celého ostrova!",
  "quip_wrong": "S jiným jménem by tenhle kouzelný meč v britských pověstech takové štěstí neudělal.",
  "explanation": "Podle legendy mohl meč z kamene vytáhnout pouze ten, kdo se měl stát spravedlivým vládcem celé Británie. Příběhy o králi Artušovi se převypráví od 12. století dodnes.",
  "about": "legendárním meči Excalibur",
  "image_prompt": "A glowing magical sword stuck in an ancient stone in an enchanted British forest, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-k-mind-the-gap",
  "cc": "gb", "country": "Velká Británie", "section": "Jazyk",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaké krátké varování v angličtině slyšíš z reproduktorů v londýnském metru, aby sis dal pozor na mezeru mezi vlakem a nástupištěm?",
  "answer": "Mind the gap",
  "distractors": ["Watch out kids", "Keep on running", "Step with care"],
  "quip_correct": "Tři jednoduchá slovíčka, která zachránila tisíce zakopnutých cestujících!",
  "quip_wrong": "Kdyby na tebe z hlásiče křičeli 'Keep on running', v metru by vznikl pěkný zmatek.",
  "explanation": "Tato slavná hláška se v londýnském metru nepřetržitě ozývá od roku 1969. Londýňané ji tak milují, že se prodává na tričkách, hrncích a v každém suvenýrovém obchodě.",
  "about": "hlášce Mind the gap v londýnském metru",
  "image_prompt": "A yellow caution line on a London Underground platform with Mind the Gap warning, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-k-curling",
  "cc": "gb", "country": "Velká Británie", "section": "Sport",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Při kterém tradičním skotském zimním sportu se po ledě kloužou těžké kameny a hráči před nimi zametají košťaty?",
  "answer": "Curling",
  "distractors": ["Bobování", "Krasobruslení", "Lední hokej"],
  "quip_correct": "Konečně sport, kde se zametání podlahy považuje za špičkový atletický výkon!",
  "quip_wrong": "Hokejky a puk nechej v šatně, tady se hraje s žulou a pořádným koštětem.",
  "explanation": "Curling vznikl ve Skotsku v 16. století. Těžké leštěné kameny se vyrábějí ze speciální žuly, která se těží výhradně na malém skotském ostrově Ailsa Craig.",
  "about": "skotském zimním sportu curlingu",
  "image_prompt": "A granite curling stone sliding on smooth ice with players sweeping in front, painterly watercolor gouache illustration, vintage travel journal style"
},

// PUBERŤÁCI (8)
{
  "id": "gb-t-dover-utesy",
  "cc": "gb", "country": "Velká Británie", "section": "Příroda",
  "difficulty": 1, "type": "choice",
  "question": "Bílé útesy u Doveru svítí do dálky. Z jaké horniny, vzniklé z mikroskopických mořských schránek, jsou složeny?",
  "answer": "Z křídy",
  "distractors": ["Z mramoru", "Z žuly", "Z pískovce"],
  "quip_correct": "Obří přírodní tabule přímo u moře – jen škoda, že na ni nejde psát školní křídou!",
  "quip_wrong": "Mramor je moc drahý a žula zase šedá. Tuhle zářivou bělobou má na svědomí měkčí materiál.",
  "explanation": "Útesy podléhají neustálé erozi — mořské vlny z nich každý rok odrolí přibližně 1–3 centimetry. Přesto jsou stále viditelné z francouzského pobřeží pouhých 34 km vzdáleného.",
  "about": "bílých křídových útesech u Doveru",
  "image_prompt": "Dramatic white chalk cliffs of Dover rising above the blue-green sea on a sunny day, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-t-big-ben-zvon",
  "cc": "gb", "country": "Velká Británie", "section": "Místa",
  "difficulty": 2, "type": "choice",
  "question": "Kde ve skutečnosti najdeš název 'Big Ben', pokud navštívíš Westminsterský palác v Londýně?",
  "answer": "Je to jméno hlavního zvonu uvnitř věže",
  "distractors": ["Je to oficiální název celé hodinové věže", "Nalepil se na ciferník obřích hodin", "Označuje se tak zasedací sál parlamentu"],
  "quip_correct": "Všichni fotí věž, ale Ben je ve skutečnosti třináctitunový tlouštík schovaný uvnitř!",
  "quip_wrong": "Věž se doopravdy jmenuje Elizabeth Tower. Big Ben je jen hlasitý obyvatel jejího vrcholu.",
  "explanation": "Zvon byl pojmenován pravděpodobně po Siru Benjaminu Hallovi, korpulentním stavebním komisaři, který na instalaci dohlížel v roce 1859. Váží přes 13 tun.",
  "about": "londýnském zvonu Big Ben",
  "image_prompt": "The Elizabeth Tower of Westminster Palace at dusk with Big Ben clock face illuminated, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-t-sherlock-adresa",
  "cc": "gb", "country": "Velká Británie", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Na londýnské adrese 221B Baker Street dnes najdeš muzeum Sherlocka Holmese. Co tam bylo v době, kdy Conan Doyle psal knihy?",
  "answer": "Tato adresa vůbec neexistovala",
  "distractors": ["Skutečný byt autora Arthura Conana Doyla", "Policejní stanice Scotland Yardu", "Pekařství pana Bakera"],
  "quip_correct": "Spisovatel si číslo vymyslel, aby neobtěžoval reálné obyvatele ulice — pošta mu tam ale chodí dodnes!",
  "quip_wrong": "Kdybys v roce 1890 hledal toto číslo domu, skončil bys někde v polovině ulice na prázdném místě.",
  "explanation": "Až při pozdějším prodloužení ulice číslo 221 skutečně vzniklo. Banka, která tam pak sídlila, musela najmout sekretářku jen na vyřizování dopisů adresovaných Holmesovi.",
  "about": "adrese Sherlocka Holmese 221B Baker Street",
  "image_prompt": "A Victorian street scene with a door numbered 221B on Baker Street under gaslit lamp, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-t-sandwich-puvod",
  "cc": "gb", "country": "Velká Británie", "section": "Jídlo",
  "difficulty": 1, "type": "choice",
  "question": "Proč si hrabě ze Sandwich nechal v 18. století dát maso mezi dva plátky chleba — čímž (podle legendy) vznikl sendvič?",
  "answer": "Aby si neušpinil prsty při hraní karet",
  "distractors": ["Aby ušetřil za drahé stolní nádobí", "Aby mu jídlo nevychladlo během lovu", "Aby skryl spálenou kůrku pečeně"],
  "quip_correct": "Vášnivý karbaník nechtěl umastit karty, tak stvořil nejslavnější svačinu světa!",
  "quip_wrong": "Lov ani šetření příbory v tom nebyly. Důvodem byla čistě karbanická lenost přerušit hru.",
  "explanation": "John Montagu, 4. hrabě ze Sandwich, dokázal u karbaního stolu prohrát celé jmění, ale dal světu celosvětově oblíbený pokrm. Dnes ho jeho jménem pojmenovávají lidé ve sto zemích.",
  "about": "původu sendviče",
  "image_prompt": "An 18th-century English aristocrat playing cards at a candlelit table while holding a meat sandwich, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-t-banksy-sablony",
  "cc": "gb", "country": "Velká Británie", "section": "Lidé",
  "difficulty": 1, "type": "choice",
  "question": "Britský pouliční umělec Banksy používá při tvorbě šablony, díky nimž dílo vznikne za pár sekund. Proč potřebuje být tak rychlý?",
  "answer": "Aby ho při nelegálním spreji nechytila policie",
  "distractors": ["Protože barva ve vlhkém vzduchu neschne", "Jelikož neumí malovat od ruky", "Aby mu šablony neukradli rivalové"],
  "quip_correct": "Nastříkat spray přes šablonu trvá pár sekund – přesně akorát, než dorazí policejní hlídka!",
  "quip_wrong": "O nešikovnost ani počasí nejde. Banksy tvoří v noci a na cizí zdi, kde záleží na každé vteřině.",
  "explanation": "Identita Banksyho zůstává dodnes neznámá, přestože jeho díla mají hodnotu milionů liber. Londýn jeho graffiti občas přetírá, občas chrání plotem jako turistickou atrakci.",
  "about": "pouličním umělci Banksym",
  "image_prompt": "A shadowed graffiti artist spray painting a stencil on a brick wall at night in Bristol, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-t-pozar-londyna",
  "cc": "gb", "country": "Velká Británie", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Velký požár Londýna roku 1666 zničil drtivou většinu města. Jaký nečekaný zdravotní přínos přinesl?",
  "answer": "Zastavil šíření dýmějového moru",
  "distractors": ["Vyhubil všechny jedovaté hady ve městě", "Zničil veškeré zkažené zásoby potravin", "Sterilizoval pitnou vodu v řece Temži"],
  "quip_correct": "Plamenná pohroma spálila dřevěné domy, ale s nimi i miliony nakažených krys a blech!",
  "quip_wrong": "Hady ani zásoby ohňostroj neřešil. Zabil však přenašeče moru, kteří předtím kosili tisíce lidí.",
  "explanation": "Rok před požárem zabila morová epidemie v Londýně přes 100 000 lidí. Požár město desinfikoval a mor se již nevrátil. Ze 13 000 shořelých domů však museli lidé odejít bez náhrady.",
  "about": "velkém požáru Londýna",
  "image_prompt": "Historical scene of London burning in 1666 with silhouettes of wooden buildings against bright orange fire and the Thames river, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-t-waleska-vesnice",
  "cc": "gb", "country": "Velká Británie", "section": "Jazyk",
  "difficulty": 2, "type": "choice",
  "question": "Waleská vesnice Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch má 58 písmen. Jak tento rekordní název vznikl?",
  "answer": "Byl vymyšlen uměle v 19. století jako reklamní trik",
  "distractors": ["Vznikl spojením pěti sousedních obcí do jedné", "Je to podrobný popis polohy středověkého hradu", "Jde o starý trest udělený vesnici anglickým králem"],
  "quip_correct": "V 19. století místní švec vymyslel 58-písmenný název, aby na nádraží zastavovalo více turistů!",
  "quip_wrong": "Žádná sloučení ani tresty. Šlo o čistý a velmi úspěšný marketingový tah místního podnikatele.",
  "explanation": "Název v překladu znamená: 'Kostel svaté Marie v rolině bílého lískového oříšku blízko prudkého víru a kostela svatého Tysilia u červené jeskyně.' Název funguje — nádraží je turistická zastávka.",
  "about": "nejdelším waleském názvu vesnice",
  "image_prompt": "An extremely long railway station name sign in a green Welsh landscape, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-t-wimbledon-jahody",
  "cc": "gb", "country": "Velká Británie", "section": "Sport",
  "difficulty": 1, "type": "choice",
  "question": "Jaké tradiční ovoce se smetanou se každoročně konzumuje v desetitunách v hledišti Wimbledonu?",
  "answer": "Jahody",
  "distractors": ["Maliny", "Borůvky", "Broskve"],
  "quip_correct": "Bílé oblečení na kurtu a červené jahody v hledišti – neodmyslitelná tenisová klasika!",
  "quip_wrong": "Ostatní lesní plody mají smůlu. Ve Wimbledonu vládne sladké červené srdcovité ovoce.",
  "explanation": "Během dvou týdnů turnaje diváci sní přes 140 000 porcí jahod nasbíraných tentýž den ráno. Tradice sahá až do 19. století a je součástí wimbledonského zážitku stejně jako tráva na kurtu.",
  "about": "wimbledonské tradici jahod se smetanou",
  "image_prompt": "A bowl of fresh red strawberries with cream at a sunny Wimbledon tennis venue, painterly watercolor gouache illustration, vintage travel journal style"
},

// DOSPĚLÍ (7)
{
  "id": "gb-a-kralovske-labute",
  "cc": "gb", "country": "Velká Británie", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Všechny neoznačené labutě na otevřených vodách v Anglii právně patří panovníkovi. Proč toto středověké pravidlo vzniklo?",
  "answer": "Labutě byly považovány za luxusní jídlo vyhrazené šlechtě",
  "distractors": ["Chránilo je to před vyhynutím způsobeným lovci", "Královská koruna vyžadovala výhradně jejich pírka", "Byly cvičeny k doručování tajné diplomatické pošty"],
  "quip_correct": "Dnes jsou chráněnými miláčky veřejnosti, ale dříve končily pečené na panovnickém stole!",
  "quip_wrong": "Ekologické cítění ani poštovní služby ve středověku nehledej. Šlo výhradně o žaludky šlechty.",
  "explanation": "Dodnes se na Temži každoročně koná tradiční sčítání labutí zvané Swan Upping, kde zástupci koruny a dvou historických cechů kontrolují a značkují mláďata. Rituál trvá pět dní.",
  "about": "královském vlastnictví britských labutí",
  "image_prompt": "A regal mute swan swimming on the Thames with Windsor Castle in background, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-a-city-of-london",
  "cc": "gb", "country": "Velká Británie", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Když britský panovník vstupuje do historické čtvrti City of London, musí u bran dodržet starý rituál. Jaký?",
  "answer": "Symbolicky požádat lorda starostu City o povolení vstoupit",
  "distractors": ["Zaplatit symbolickou stříbrnou minci jako mýtné", "Sesednout z kočáru a projít hranici pěšky", "Předložit zvláštní průkaz vydaný radnicí City"],
  "quip_correct": "Královna či král vládne celé zemi, ale v téhle jediné čtvrti musí zaklepat a poprosit!",
  "quip_wrong": "Žádné mince ani průkazy. Jde o diplomatické gesto ukazující starobylou nezávislost londýnských obchodníků.",
  "explanation": "Lord starosta pak panovníkovi nabídne Perlový meč na znamení věrnosti. City of London má vlastní policii, vlastní vládu a svá pravidla — je to stát ve státě s historií sahající k normanské invazi.",
  "about": "zvláštním statusu čtvrti City of London",
  "image_prompt": "The Lord Mayor of London in ceremonial robes offering a Pearl Sword at Temple Bar gate to the monarch, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-a-postovni-znamka",
  "cc": "gb", "country": "Velká Británie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Velká Británie je jedinou zemí na světě, jejíž poštovní známky nemusí mít vytištěný název státu. Proč má tuto výjimku?",
  "answer": "Protože vydala úplně první poštovní známku na světě",
  "distractors": ["Vyjednala si to při zakládání Světové poštovní unie", "Panovník zakázal tisk názvu země na lepicí papír", "Je to trest za odmítnutí mezinárodních poštovních smluv"],
  "quip_correct": "Když v roce 1840 vymyslíte poštovní známku, nemusíte na ni psát název své země!",
  "quip_wrong": "O zákazy ani smlouvy nešlo. Důvodem je prvenství, které Británii už nikdo nevysvlékne.",
  "explanation": "Slavná první známka Penny Black z roku 1840 nesla jen profil královny Viktorie, což Britům jako označení zůstalo dodnes. Stejné pravidlo stále platí — na britských známkách je jen portrét panovníka.",
  "about": "britských poštovních známkách bez názvu země",
  "image_prompt": "A classic Penny Black postage stamp from 1840 featuring profile of Queen Victoria, detailed painterly watercolor illustration, vintage journal style"
},
{
  "id": "gb-a-tikka-masala",
  "cc": "gb", "country": "Velká Británie", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Chicken Tikka Masala je považována za jedno z britských národních jídel. V čem spočívá paradox jeho vzniku?",
  "answer": "Vznikla ve Skotsku přidáním rajčatové polévky k indickému receptu",
  "distractors": ["Vymyslela ho královská rodina během pobytu v Indii", "Původně šlo o francouzský recept upravený na britských lodích", "Byl to nouzový pokrm britských vojáků v koloniích"],
  "quip_correct": "Zákazník chtěl omáčku na suché maso, kuchař v Glasgow zaimprovizoval konzervou Campbell's — a vznikl světový hit!",
  "quip_wrong": "Žádné indické paláce ani koloniální zákopy. Tento globální hit se zrodil v běžné restauraci ve skotském Glasgow.",
  "explanation": "Britský ministr zahraničí Robin Cook prohlásil v roce 2001 Chicken Tikka Masalu za symbol moderní Británie — ukázku toho, jak země přijímá a přetváří zahraniční vlivy. V Británii je dnes více indických restaurací než ve většině indických měst.",
  "about": "původu pokrmu Chicken Tikka Masala",
  "image_prompt": "A steaming bowl of Chicken Tikka Masala with naan bread in a Glasgow curry house, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-a-kralovsky-prukaz",
  "cc": "gb", "country": "Velká Británie", "section": "Lidé",
  "difficulty": 3, "type": "choice",
  "question": "Britský panovník může jako jediný legálně řídit auto bez řidičského průkazu. Proč?",
  "answer": "Veškeré doklady se vydávají jeho vlastním jménem — bylo by nesmyslné, aby si průkaz udělil sám sobě",
  "distractors": ["Předpokládá se, že panovník automaticky ovládá vše", "Ústava zakazuje panovníkovi skládat jakékoli zkoušky", "Má k dispozici šoféra garantovaného ústavou"],
  "quip_correct": "Byl by nesmysl, aby král udělil řidičské oprávnění sám sobě a pak si ho sám kontroloval!",
  "quip_wrong": "Není to o šoférech ani ústavě. Jde o právní logiku — panovník je zdrojem veškeré státní autority.",
  "explanation": "Ze stejného důvodu panovník nevlastní ani britský cestovní pas — pasy se vydávají 've jménu Jeho/Jejího Veličenstva'. Královská auta navíc nemusejí mít poznávací značky.",
  "about": "královských právních výsadách",
  "image_prompt": "A royal British car driving through the English countryside without a license plate, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-a-valka-scilly",
  "cc": "gb", "country": "Velká Británie", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Mír mezi Nizozemskem a britskými ostrovy Scilly byl podepsán v roce 1986 po 335 letech trvající 'válce'. V čem byl tento konflikt unikátní?",
  "answer": "Za celých 335 let nepadl ani jediný výstřel",
  "distractors": ["Boje probíhaly výhradně v lodních šachových turnajích", "Strany bojovaly pouze zabavováním rybářských sítí", "Válku vedla výhradně tajná diplomatická korespondence"],
  "quip_correct": "Nejdelší a zároveň nejmírumilovnější konflikt v dějinách — všichni na něj prostě zapomněli!",
  "quip_wrong": "Šachy ani rybáři v tom nebyli. Holandsko vyhlásilo válku v roce 1651 — a pak na ni obě strany zapomněly na tři staletí.",
  "explanation": "Když historik Roy Duncan v roce 1985 zkontroloval archivy, zjistil, že mír nebyl nikdy podepsán. Pozval holandského velvyslance na čaj na Scilly a formálně válku ukončili. Ostrované si pak ze srandy stěžovali, že přišli o bezpečnostní záruky.",
  "about": "335leté válce mezi Británií a Nizozemskem",
  "image_prompt": "Peaceful sunny view of the Isles of Scilly with colorful boats in harbour and a tiny peace treaty document, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "gb-a-syrove-kouleni",
  "cc": "gb", "country": "Velká Británie", "section": "Sport",
  "difficulty": 3, "type": "choice",
  "question": "Na kopci Cooper's Hill v Gloucestershiru se každoročně koná závod, kde se lidé vrhají ze strmého svahu. Co vyhraje ten nejrychlejší?",
  "answer": "Bochník sýra Double Gloucester",
  "distractors": ["Zlatou medaili ve tvaru krávy", "Sud místního tmavého piva", "Právo pojmenovat příštího vítěze"],
  "quip_correct": "Riskuješ zlomenou ruku a vyvrtnutý kotník, aby sis domů odnesl čtyřkilový koláč sýra!",
  "quip_wrong": "Medaile ani pivo za tenhle bláznivý kotrmelcový maraton nedostaneš — hlavní cenou je poctivá mléčná pochoutka.",
  "explanation": "Koulející se sýr dosahuje na strmém svahu rychlosti až 110 km/h, takže ho závodníci prakticky nemohou chytit během běhu. Závod se koná od středověku a každý rok si několik účastníků zlomí nohu nebo kotník.",
  "about": "tradičním závodě v koulení sýra v Gloucestershiru",
  "image_prompt": "People tumbling down a steep English hillside chasing a rolling wheel of cheese at Cooper's Hill, painterly watercolor gouache illustration, vintage travel journal style"
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
