"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "sk.json");

// Zahozeno (1):
// sk-k-oravsky-hrad — faktická chyba: Murnauův Nosferatu (1922) se natáčel v Německu
// (Wismar, Lübeck), ani Herzogův remake (1979) na Oravě nebyl; turistický mýtus

const NEW_QUESTIONS = [
// DĚTI (7)
{
  "id": "sk-k-kamzik",
  "cc": "sk", "country": "Slovensko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Které hbité zvířátko s malými růžky skáče po strmých skalách ve Vysokých Tatrách jako horský akrobat?",
  "answer": "Kamzík",
  "distractors": ["Klokan", "Srnec", "Svišť"],
  "quip_correct": "Trefa! Na skále udrží rovnováhu lépe než ty na koloběžce.",
  "quip_wrong": "Klokan na Tatry nemá správné zimní oblečení.",
  "explanation": "Kamzíci mají na kopytech měkký polštářek a tvrdý okraj, takže se přisají ke skále jako přísavka.",
  "about": "kamzíkovi tatranském",
  "image_prompt": "A cute chamois standing proudly on a rocky mountain peak in High Tatras, clear blue sky, painterly watercolor style"
},
{
  "id": "sk-k-vlkolinec",
  "cc": "sk", "country": "Slovensko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Ve slovenské vesničce Vlkolínec vypadají chaloupky jako z pohádky. Čím jsou natřené jejich dřevěné stěny, že hrají všemi barvami?",
  "answer": "Barevnou vápennou barvou",
  "distractors": ["Ovocným džemem", "Plastelínou", "Rozpuštěnými bonbóny"],
  "quip_correct": "Přesně tak, září růžově, modře i žlutě!",
  "quip_wrong": "Džemem ne — to by všechny chaloupky snědli lesní medvědi.",
  "explanation": "Vápno chránilo dřevo před škůdci a vesničané do něj přidávali přírodní barviva, aby měly chalupy veselé barvy. Vlkolínec je zapsán na seznam UNESCO.",
  "about": "vesnici Vlkolínec a jejích barevných chaloupkách",
  "image_prompt": "Traditional colorful wooden houses in Vlkolínec village, bright pastel colors, green hills background, painterly watercolor style"
},
{
  "id": "sk-k-ciernohronska-zeleznica",
  "cc": "sk", "country": "Slovensko", "section": "Zajímavosti",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "V obci Čierny Balog mají unikátní fotbalové hřiště. Co neobvyklého projíždí přímo kolem hřiště během zápasu?",
  "answer": "Parní vlak na úzkokolejce",
  "distractors": ["Stádo krav", "Závodní formule", "Parník po řece"],
  "quip_correct": "Ano, když mašinka zapíská, roztleská celý stadion!",
  "quip_wrong": "Formule by na trávníku dostala smyk na rohovém kopu.",
  "explanation": "Koleje Čiernohronské železnice tam ležely dříve, než se postavilo hřiště — fotbalisté se domluvili a trať prostě zachovali. Úzkokolejka vozila dřevo z hor od roku 1908.",
  "about": "Čiernohronské železnici a fotbalovém hřišti",
  "image_prompt": "A vintage steam train passing alongside a green football pitch during a match, spectators watching, sunny day, painterly watercolor style"
},
{
  "id": "sk-k-parenica",
  "cc": "sk", "country": "Slovensko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Tradiční slovenský sýr parenica má velmi zvláštní tvar. Jak vypadá, když ho rozbalíš?",
  "answer": "Jako zamotaná stuha nebo šnek",
  "distractors": ["Jako děravá koule", "Jako velká kostka", "Jako špičatá pyramida"],
  "quip_correct": "Dá se rozmotávat jako chutná sýrová tkanička!",
  "quip_wrong": "Pyramidu z parenice nepostavíš — okamžitě by se rozmotala.",
  "explanation": "Sýr se nejprve paří v horké vodě, vytáhne do dlouhého pásu a pak svine do dvou spojených válečků. Pochází z oblasti Kysuce a Oravy.",
  "about": "tradičním sýru parenica",
  "image_prompt": "Traditional Slovak parenica cheese, wound ribbon-like roll on a wooden plate, painterly watercolor style"
},
{
  "id": "sk-k-ochtsinska-jaskyna",
  "cc": "sk", "country": "Slovensko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "V Ochtinské jeskyni nerostou klasické krápníky, ale na stěnách najdeš něco úplně jiného. Co připomínají tamní bílé ozdoby?",
  "answer": "Kamenné květy a hvězdičky",
  "distractors": ["Upečené trdelníky", "Skleněné kuličky", "Zlaté dukáty"],
  "quip_correct": "Nádhera, vypadá to tam jako v podzemní zahrádce ze sněhu!",
  "quip_wrong": "Trdelníkům v jeskyni chybí vanilka i pec.",
  "explanation": "Minerál aragonit vytváří trsy tenkých jehliček, které rostou do všech stran bez ohledu na gravitaci. Ochtinská aragonitová jaskyňa je unikátní i v celosvětovém měřítku — patří k UNESCO.",
  "about": "Ochtinské aragonitové jeskyni",
  "image_prompt": "Close-up of white aragonite mineral formations resembling delicate flowers on cave wall, painterly watercolor style"
},
{
  "id": "sk-k-cuvac",
  "cc": "sk", "country": "Slovensko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Slovenský čuvač je velký pes, který hlídá ovce. Proč má od přírody úplně bílou srst?",
  "answer": "Aby ho bača v noci nespletl s vlkem",
  "distractors": ["Aby nebylo vidět, když se polije mlékem", "Aby se mohl schovat ve sněhu před medvědem", "Aby na sluníčku nenachytal bronz"],
  "quip_correct": "Bílá srst zachránila psa před nočním omylem bači.",
  "quip_wrong": "Před medvědem se tenhle odvážný hlídač rozhodně neskrývá.",
  "explanation": "Čuvač dokáže sám ubránit stádo ovcí před vlky. Název pochází ze slova čúvať — poslouchat a bdít. Je to starobylé slovenské plemeno, uznané celosvětově.",
  "about": "psím plemeni slovenský čuvač",
  "image_prompt": "Large fluffy white Slovenský čuvač dog standing proudly next to sheep on a green mountain meadow, painterly watercolor style"
},
{
  "id": "sk-k-opal",
  "cc": "sk", "country": "Slovensko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Ve východním Slovensku se odpradávna těžil vzácný drahokam opál. Jakou kouzelnou vlastnost tento kámen má?",
  "answer": "Hraje všemi barvami duhy",
  "distractors": ["Ve tmě svítí jako žárovka", "Sám od sebe hřeje v dlani", "Zvoní jako cinkající zvonek"],
  "quip_correct": "Na světle mění barvy od červené po modrou. Miniaturní duhová show.",
  "quip_wrong": "Žárovku z něj neuděláš, ale na prstenu svítí krásně i bez baterky.",
  "explanation": "Slovenský opál z dolů u Dubníka byl tak slavný, že největší kus zvaný Harlekýn zdobil i korunovační klenoty francouzských císařů. Ložiska opálů jsou v Slovenském rudohoří.",
  "about": "slovenském drahém opálu",
  "image_prompt": "A glittering polished Slovak opal gemstone showing vibrant rainbow colors against dark stone, painterly watercolor style"
},

// PUBERŤÁCI (8)
{
  "id": "sk-t-stred-evropy",
  "cc": "sk", "country": "Slovensko", "section": "Geografie",
  "difficulty": 1, "type": "choice",
  "question": "Pár kilometrů od Kremnice stojí kostel sv. Jana Křtitele v obci Krahule. Co se nachází přímo u jeho zdi?",
  "answer": "Pamětní kámen označující geografický střed Evropy",
  "distractors": ["Nejhlubší propast na kontinentu", "Nejvyšší bod Středoevropské nížiny", "Místo, kde se stýkají tři časová pásma"],
  "quip_correct": "I když si tenhle titul nárokuje více míst, tady stojí skutečný pamětní kámen.",
  "quip_wrong": "Časová pásma se uprostřed Slovenska nescházejí — to by bylo pro turisty zmatené.",
  "explanation": "Měření středu Evropy závisí na tom, zda započítáš ostrovy jako Island či Špicberky. Slovenský výpočet z 19. století označil Krahule u Kremnice.",
  "about": "geografickém středu Evropy u Kremnických Baní",
  "image_prompt": "A memorial stone marking the geographical center of Europe next to an old stone church in Krahule, Slovakia, painterly watercolor style"
},
{
  "id": "sk-t-kremnica-mincovna",
  "cc": "sk", "country": "Slovensko", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Kremnická mincovna drží světový unikát, kterým se nemůže pochlubit téměř žádný jiný podnik na světě. O jaký unikát jde?",
  "answer": "Razí mince bez přerušení od středověku — od roku 1328",
  "distractors": ["Vyrazila první plastové peníze", "Všechny mince razí výhradně ze dřeva", "Peníze se tam razí v podzemním jezeře"],
  "quip_correct": "Od středověkých zlaťáků přes koruny až po dnešní eura ražba nikdy nepřestala.",
  "quip_wrong": "Plastová eura by si v obchodě asi nikdo nevzal.",
  "explanation": "Mincovna funguje nepřetržitě od roku 1328, což z ní dělá jeden z nejstarších stále fungujících podniků na celé planetě — přes 700 let bez přestávky.",
  "about": "Kremnické mincovně a její nepřerušené tradici",
  "image_prompt": "Historic Kremnica mint building, gold coins being minted, elegant detail shot, painterly watercolor style"
},
{
  "id": "sk-t-tajchy",
  "cc": "sk", "country": "Slovensko", "section": "Geografie",
  "difficulty": 2, "type": "choice",
  "question": "Okolí Banské Štiavnice je protkáno desítkami umělých nádrží zvaných tajchy. K čemu původně tyto vodní nádrže sloužily?",
  "answer": "Poháněly čerpadla v hlubokých důlních šachtách",
  "distractors": ["Chovaly se v nich cizokrajné ryby pro krále", "Sloužily jako obranný vodní příkop proti nájezdníkům", "Zásobovaly vodou parní lokomotivy"],
  "quip_correct": "Bez nich by spodní voda zatopila bohaté stříbrné a zlaté doly.",
  "quip_wrong": "Ryby si v nich plavou i dnes, ale král je jako akvárium nepotřeboval.",
  "explanation": "Geniální systém kanálů a nádrží zachytával dešťovou vodu a zachránil štiavnické banictví před zatopením. Banská Štiavnica a tajchy jsou zapsány na seznam UNESCO.",
  "about": "štiavnických tajchách a těžbě stříbra",
  "image_prompt": "Serene artificial lake Tajch near Banská Štiavnica surrounded by green hills and forests, painterly watercolor style"
},
{
  "id": "sk-t-cicmany",
  "cc": "sk", "country": "Slovensko", "section": "Kultura",
  "difficulty": 1, "type": "choice",
  "question": "Rázovitá obec Čičmany je proslulá po celém světě svými roubenkami s bílými vzory. Jaký nečekaný módní trend tyto domy inspirovaly?",
  "answer": "Vzory na oblečení slovenského olympijského týmu",
  "distractors": ["Vzory pro moderní tenisky Nike", "Maskovací vzory vojenských uniform", "Svatební šaty britské královny"],
  "quip_correct": "Bílé geometrické vzory zdobily oblečení slovenských sportovců na olympiádách.",
  "quip_wrong": "Vojáci by v bílém geometrickém vzoru na tmavém dřevě svítili na kilometry daleko.",
  "explanation": "Původně bílé vápenné ozdoby chránily dřevo před vlhkostí a sluncem, časem se z nich staly ikonické ornamenty — a slovenský design je dnes přenáší na oblečení, keramiku i výrobky.",
  "about": "ornamentální výzdobě v Čičmanech",
  "image_prompt": "Black wooden log cabin with distinctive white painted geometric patterns in Čičmany, painterly watercolor style"
},
{
  "id": "sk-t-levoca-oltar",
  "cc": "sk", "country": "Slovensko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "V bazilice sv. Jakuba v Levoči stojí nejvyšší dřevěný gotický oltář na světě. Kdo je autorem tohoto díla z lipového dřeva?",
  "answer": "Mistr Pavol z Levoče",
  "distractors": ["Kryštof Dientzenhofer", "Matyáš Rejsek", "Petr Parléř"],
  "quip_correct": "Řezbář, který vytvořil lipový oltář vysoký přes 18 metrů — bez jediného kovového hřebíku.",
  "quip_wrong": "Parléř stavěl Svatovítskou katedrálu v Praze, v Levoči dláto do ruky nevzal.",
  "explanation": "Oltář byl vyřezán z lipového dřeva a jeho dokončení trvalo přibližně deset let (kolem roku 1517). Levoča je součástí UNESCO jako část Spišského hradu a okolí.",
  "about": "oltáři Mistra Pavla v Levoči",
  "image_prompt": "Magnificent tall wooden Gothic altar inside St. James Church in Levoča, warm light, intricate carving, painterly watercolor style"
},
{
  "id": "sk-t-modra-majolika",
  "cc": "sk", "country": "Slovensko", "section": "Kultura",
  "difficulty": 1, "type": "choice",
  "question": "Městečko Modra pod Malými Karpaty je slavné svou tradiční keramikou — majolikou. Jaká barevná kombinace je pro ni nejtypičtější?",
  "answer": "Modrá a žlutá",
  "distractors": ["Černá a stříbrná", "Růžová a fialová", "Zelená a šedá"],
  "quip_correct": "Název města Modra napoví, která barva na nádobí dominuje.",
  "quip_wrong": "Černo-stříbrná keramika by na venkovském stole působila trochu jako z hororu.",
  "explanation": "Keramické řemeslo do oblasti přinesli habáni v 16. století — náboženská komunita, která do Uher přinesla vyspělé řemeslné techniky. Modranská majolika je zapsána na seznam nehmotného dědictví.",
  "about": "modranské majolice a hrnčířství",
  "image_prompt": "Traditional Modra majolica pottery, white ceramic jug with blue and yellow floral ornaments, painterly watercolor style"
},
{
  "id": "sk-t-herlansky-gejzir",
  "cc": "sk", "country": "Slovensko", "section": "Příroda",
  "difficulty": 2, "type": "choice",
  "question": "Herľanský gejzír nedaleko Košic je v rámci evropského kontinentu naprostým unikátem. Čím se liší od slavných gejzírů na Islandu?",
  "answer": "Chrlí studenou vodu — je poháněn oxidem uhličitým, ne teplem",
  "distractors": ["Chrlí horké bahno místo vody", "Stříká pouze v noci za úplňku", "Vychází z něj pouze hustý fialový dým"],
  "quip_correct": "Studená voda vystřelí do výšky 20 metrů. Žádné teplo, jen tlak CO₂.",
  "quip_wrong": "Fialový dým ne, i když podívaná je při výstřiku pořádná.",
  "explanation": "Gejzír byl navrtán v 19. století při hledání minerálních pramenů pro lázně. Erupce se opakují periodicky díky hromadění oxidu uhličitého v podzemí.",
  "about": "Herľanském studeném gejzíru",
  "image_prompt": "Herľany cold water geyser shooting water high into the air in a park setting, painterly watercolor style"
},
{
  "id": "sk-t-komarno-pevnost",
  "cc": "sk", "country": "Slovensko", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Komárno na soutoku Váhu a Dunaje postavilo obrovskou pevnost proti osmanským nájezdům. Čím byla výjimečná?",
  "answer": "Nikdy nebyla dobyta — ani Turky, ani Prusy",
  "distractors": ["Nejdelším dřevěným mostem v Evropě", "Prvním podzemním tunelem pod Dunajem", "Létající obranou vzducholodí"],
  "quip_correct": "Pevnost tak mohutná, že její latinský nápis říká: Ani lstí, ani silou.",
  "quip_wrong": "Vzducholodě v 16. století nad Dunajem opravdu nepatrolovaly.",
  "explanation": "Pevnostní systém v Komárně byl jedním z největších v Habsburské říši — kapacita pro desítky tisíc vojáků a systém bastionů, který Osmané i přes obléhání nikdy nepronikli.",
  "about": "protiturecké pevnosti v Komárně",
  "image_prompt": "Massive bastions and stone walls of the historic fortress in Komárno at the confluence of rivers, painterly watercolor style"
},

// DOSPĚLÍ (8)
{
  "id": "sk-a-valka-usa",
  "cc": "sk", "country": "Slovensko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "V prosinci 1941 vyhlásila První slovenská republika válku dvěma světovým mocnostem. Proč bylo toto vyhlášení zvlášť absurdní?",
  "answer": "V USA žily stovky tisíc slovenských emigrantů — republika jim naráz přidělila status nepřátelských cizinců",
  "distractors": ["Slovensko nemělo armádu ani jeden válečný loď", "Obě mocnosti ani nevěděly, že jim byla válka vyhlášena", "Vyhlášení bylo omylem — schválili ho místo daňové reformy"],
  "quip_correct": "Premier Tuka vyhlásil válku USA bez vědomí sněmu. V Pittsburghu to vzali jako osobní urážku.",
  "quip_wrong": "Armáda tu byla — problém byl jiný: v Chicagu a Clevelandu bydlelo přes 300 000 Slováků.",
  "explanation": "Vojtech Tuka vyhlásil válku USA a Velké Británii bez vědomí parlamentu i prezidenta Tisa, čímž postavil slovenskou diasporu v Americe do pozice občanů nepřátelského státu. Pittsburgh podepsal v roce 1918 Pittsburghskou dohodu, která zaručovala Slovensku autonomii v ČSR — a o 23 let později byl jeho národ formálně ve válce s ním.",
  "about": "vyhlášení války USA a Velké Británii Slovenskem v roce 1941",
  "image_prompt": "Vintage 1940s newspaper headline reporting Slovakia's declaration of war on USA, historical tone, painterly watercolor style"
},
{
  "id": "sk-a-cachticka-pani",
  "cc": "sk", "country": "Slovensko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Alžběta Báthoryová je v Guinnessově knize jako nejplodnější vražedkyně historie. Jaký právní paradox se však váže k celému případu?",
  "answer": "Nikdy neproběhl řádný soud — byla bez rozsudku zazděna na Čachtickém hradě",
  "distractors": ["Oběti byly po letech nalezeny živé v Polsku", "Sama se udala a vše sepsala do deníku", "Soud ji osvobodil pro nedostatek důkazů"],
  "quip_correct": "Přes 650 obětí v Guinnessově knize — a ani jeden rozsudek. Právo tehdy pracovalo jinak.",
  "quip_wrong": "Sama se neudala; v 17. století navíc linka 158 ještě nefungovala.",
  "explanation": "Palatin Juraj Thurzo potřeboval zabavit obrovské majetky Báthoryové a vyhnout se splácení královských dluhů vůči její rodině. Svědectví byla získána mučením služebnictva. Báthoryová zemřela roku 1614 ve vězení na hradě Čachtice bez toho, aby stanula před soudem.",
  "about": "případu Alžběty Báthoryové a absenci řádného soudu",
  "image_prompt": "Dark stone corridors of Čachtice Castle, dramatic shadows, historical mystery atmosphere, painterly watercolor style"
},
{
  "id": "sk-a-most-snp",
  "cc": "sk", "country": "Slovensko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Bratislavský Most SNP s restaurací UFO je architektonickým symbolem města. Jakou historickou cenu zaplatilo město za jeho výstavbu v 60. letech?",
  "answer": "Byla zbořena historická čtvrť Podhradí a neologická synagoga",
  "distractors": ["Bankrotovalo celé hlavní město na deset let", "Byl zasypán starý přístav a loděnice na Dunaji", "Bylo přemístěno celé jedno předměstí i s hřbitovem"],
  "quip_correct": "Modernismus přinesl most — a vzal kus historického srdce Bratislavy.",
  "quip_wrong": "Přístav přežil; co nezažilo, byla historická zástavba pod hradem.",
  "explanation": "Demolice Podhradí zničila přes dvě třetiny historického Starého Města pod hradem — včetně neologické synagogy a hustě obydlené uličky. Čtyřproudá magistrála dnes kříží místo, kde stávala stovky let stará zástavba.",
  "about": "kontroverzní výstavbě Mostu SNP v Bratislavě",
  "image_prompt": "Modernist UFO bridge in Bratislava with castle silhouette at dusk, contrast old and new, painterly watercolor style"
},
{
  "id": "sk-a-strbske-pleso",
  "cc": "sk", "country": "Slovensko", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Štrbské pleso je dnes přísně chráněnou přírodní památkou. Jaký komerční provoz se na tomto ledovcovém jezeře provozoval koncem 19. století?",
  "answer": "Těžilo se z něj přírodní letní led a vozil se do restaurací a pekáren ve Vídni a Pešti",
  "distractors": ["Chovaly se v něm ryby pro habsburský dvůr", "Pořádaly se na něm dostihy dostavníků po ledu", "Sázely se v něm tropické vodní rostliny pro botanické zahrady"],
  "quip_correct": "Tatranský led jako exportní artikl pro vídeňské kavárny. Pak přišla lednička.",
  "quip_wrong": "Dostihy na zamrzlém jezeře v 1300 metrech nadmořské výšky — sportovně odvážný nápad, historicky nedoložený.",
  "explanation": "Těžba ledu byla tak intenzivní, že se hoteliéři obávali snížení hladiny plesa. Přesto zisk z prodeje ledu platil provoz prvních tatranských hotelů. S příchodem umělého chlazení na počátku 20. století byznys zanikl.",
  "about": "těžbě ledu ze Štrbského plesa v 19. století",
  "image_prompt": "Historical style illustration of workers harvesting ice blocks from frozen Štrbské Pleso lake in Tatras, vintage watercolor style"
},
{
  "id": "sk-a-piestany-bahno",
  "cc": "sk", "country": "Slovensko", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Slavné lázně Piešťany léčí pohybový aparát sirným bahnem. Jak byl léčivý účinek tohoto bahna původně objeven?",
  "answer": "Pozorováním kulhavých koní panství, kteří se po koupeli v bahnisku u Váhu přestali lamat",
  "distractors": ["Hledáním zakopaného pokladu zemského hraběte", "Náhodným pádem opilého místního faráře", "Požárem, který zapálil bažinu a odhalil horký pramen"],
  "quip_correct": "Co začalo u unavených tažných koní z panských majetků, dnes stojí tisíce eur za týden.",
  "quip_wrong": "Farář se močálu vyhýbal obloukem, ale koně věděli lépe než doktoři, co je dobré na klouby.",
  "explanation": "Hrabě Erdődy si všiml, že koně po práci v teplém bahnu u řeky Váh přestávají kulhat, a dal u teplých pramenů postavit první prkenné lázně. Symbolem Piešťan se stal muž rozbíjející berle — barlaník — dnes nejpopulárnější slovenská turistická socha.",
  "about": "odkrytí léčivého bahna v Piešťanech",
  "image_prompt": "Bronze statue of a crutch breaker in Piešťany spa, elegant colonnade background, painterly watercolor style"
},
{
  "id": "sk-a-slemence",
  "cc": "sk", "country": "Slovensko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Vesnice Slemence zažila po druhé světové válce geopolitickou absurditu. Co se stalo s touto malou obcí v roce 1946?",
  "answer": "Nová hranice SSSR a ČSR ji rozřízla napůl uprostřed ulice — příbuzní z vedlejších domů se ocitli v různých státech",
  "distractors": ["Celá vesnice byla přemístěna o 50 km dál na území Maďarska", "Byla vydražena v kartách mezi Stalinem a Benešem", "Obyvatelé museli platit zvláštní daň za přecházení vlastní ulice"],
  "quip_correct": "Příbuzní si desítky let nemohli podat ruku a mávali na sebe přes dráty.",
  "quip_wrong": "V kartách se nehrálo; soudruzi jednoduše položili pravítko na mapu a dům od domu postavili plot.",
  "explanation": "Vznikly tak dvě obce — Velké Slemence na Slovensku a Malé Slemence na Ukrajině (tehdy sovětské). Hraniční přechod byl otevřen až v roce 2005. Rodiny rozdělené přes ulici se nesměly navštěvovat přes padesát let.",
  "about": "rozdělení obce Slemence sovětsko-československou hranicí",
  "image_prompt": "A wooden border gate and fence dividing a quiet village street in Slemence, emotional historic mood, painterly watercolor style"
},
{
  "id": "sk-a-gabcikovo",
  "cc": "sk", "country": "Slovensko", "section": "Geografie",
  "difficulty": 3, "type": "choice",
  "question": "Spor o Vodní dílo Gabčíkovo vyvrcholil u soudu v Haagu. Jaký technický manévr provedlo Slovensko, když Maďarsko jednostranně odstoupilo od společné smlouvy?",
  "answer": "Přesměrovalo Dunaj výhradně na vlastní území — tzv. Varianta C",
  "distractors": ["Přehradilo řeku betonovou zdí a vodu odčerpávalo do Rakouska", "Zasypalo koryto Dunaje štěrkem z Tater a vybudovalo nové koryto v lese", "Požádalo NATO o vojenskou ochranu hraniční řeky"],
  "quip_correct": "Varianta C: mezinárodní řeka, jednostranně odklonená. Haag pak strávil roky rozplétáním toho, co šlo zvládnout dohodou.",
  "quip_wrong": "Odčerpávat Dunaj do Rakouska by byl hezký dárek, ale Rakušané o potopu neprosili.",
  "explanation": "Slovensko v roce 1992 přehradilo Dunaj u Čunova a přesměrovalo 80 % průtoku do přívodního kanálu na vlastní straně. Mezinárodní soudní dvůr v Haagu v roce 1997 rozhodl, že obě strany porušily smlouvu. Spor o důsledky nebyl dodnes zcela uzavřen.",
  "about": "přehrazení Dunaje a mezinárodním sporu o Gabčíkovo",
  "image_prompt": "Massive dam structure of Gabčíkovo hydro power plant on the Danube river, aerial angle, painterly watercolor style"
},
{
  "id": "sk-a-bratislavske-metro",
  "cc": "sk", "country": "Slovensko", "section": "Zajímavosti",
  "difficulty": 3, "type": "choice",
  "question": "V 80. letech se v Bratislavě začal budovat velkolepý projekt podzemního metra. Co po něm zůstalo?",
  "answer": "Prázdné zatopené betonové tunely pod sídlištěm Petržalka — bez kolejí, bez vlaků",
  "distractors": ["Postavili stanice, ale zapomněli nakoupit vlakové soupravy", "Metro jezdilo jen 100 metrů tam a zpět pro stranické funkcionáře", "Tunely přebudovali na podzemní vinný sklep"],
  "quip_correct": "Milionová investice, betonové tubusy a žádné vlaky. Komunistická infrastruktura v kostce.",
  "quip_wrong": "Sklep z toho bohužel nebyl — zůstala jen betonová torza plná dešťové vody.",
  "explanation": "Stavba byla po roce 1989 zastavena kvůli nedostatku financí a změně politické priority. Nedokončené tunely a betonové výkopy v Petržalce jsou dnes cílem urban explorerů a terčem debat o tom, co s nimi dál.",
  "about": "nedokončeném projektu bratislavského metra",
  "image_prompt": "Abandoned overgrown concrete metro tunnel entrance in Petržalka, Bratislava, urban exploration aesthetic, painterly watercolor style"
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
