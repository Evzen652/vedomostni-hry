"use strict";
// Vybrané a opravené otázky z Gemini výstupu pro Maďarsko.
// Spusť: node scripts/import-hu-gemini.js
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "hu.json");

const NEW_QUESTIONS = [

// ── DĚTI (10) ──────────────────────────────────────────────────────────────
{
  "id": "hu-k-cervena-paprika-su",
  "cc": "hu", "country": "Maďarsko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Když se v Maďarsku suší červená paprika, jak ji nejčastěji vidíme na venkově?",
  "answer": "Zavěšená v dlouhých šňůrách na fasádách domů",
  "distractors": ["Uložená v mrazáku", "Máčená na dně jezera", "Zakopaná hluboko v zemi"],
  "quip_correct": "Přesně! Červené věnce paprik zdobí maďarské domky jako živoucí dekorace.",
  "quip_wrong": "Kdepak — paprika se suší na slunci a větru, ne v chladu nebo vodě.",
  "explanation": "Před domy na jihu Maďarska visí na podzim dlouhé šňůry sušící se papriky. Právě sušením vzniká sladká i pálivá mletá paprika, základ maďarské kuchyně.",
  "about": "maďarské paprice"
},
{
  "id": "hu-k-balaton-leto",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Co lidé v létě nejraději dělají na jezeře Balaton?",
  "answer": "Plavou a jezdí na šlapadlech",
  "distractors": ["Bruslí na zamrzlé hladině", "Lyžují na vlnách", "Staví sněhuláky na břehu"],
  "quip_correct": "Výborně! Balaton je v létě jedno velké koupaliště — voda je mělká a příjemně teplá.",
  "quip_wrong": "V létě u Balatonu sníh ani led hledej marně — ale šlapadel a nafukovacích kol je dost.",
  "explanation": "Balaton je největší jezero ve střední Evropě. Jeho jižní břeh je velmi mělký a oblíbený u rodin s dětmi — voda tam sahá do pasu ještě daleko od břehu.",
  "about": "Balatonu"
},
{
  "id": "hu-k-madarska-vlajka",
  "cc": "hu", "country": "Maďarsko", "section": "Symboly",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaké tři barvy má maďarská vlajka, vodorovně seřazené v pruzích?",
  "answer": "Červená, bílá a zelená",
  "distractors": ["Modrá, bílá a červená", "Černá, žlutá a červená", "Modrá, žlutá a zelená"],
  "quip_correct": "Přesně! Červená nahoře, bílá uprostřed, zelená dole — tyhle pruhy poznáš hned.",
  "quip_wrong": "Tohle jsou barvy jiné vlajky — Maďarsko má červenou, bílou a zelenou.",
  "explanation": "Červená symbolizuje sílu, bílá věrnost a zelená naději. Vlajka vypadá podobně jako italská — ale tam jsou barvy v jiném pořadí a svislé.",
  "about": "maďarské vlajce"
},
{
  "id": "hu-k-kral-stefan",
  "cc": "hu", "country": "Maďarsko", "section": "Historie",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se jmenoval první křesťanský král, který sjednotil Maďarsko a je jeho patronem?",
  "answer": "Svatý Štěpán",
  "distractors": ["Král Matyáš", "Král Béla", "Král Ondřej"],
  "quip_correct": "Správně! Podle něj se jmenuje i slavná koruna a celý státní svátek 20. srpna.",
  "quip_wrong": "Ne — Matyáš a Béla byli slavní králové, ale jako první křesťanský panovník vládl svatý Štěpán.",
  "explanation": "Svatý Štěpán sjednotil maďarské kmeny a přijal křesťanství kolem roku 1000. Dodnes je největší národní hrdina — jeho svátek 20. srpna je největším maďarským státním svátkem.",
  "about": "svatém Štěpánovi"
},
{
  "id": "hu-k-puli-pes",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se jmenuje maďarský ovčácký pes s hustou provazcovitou srstí, který vypadá jako živý mop?",
  "answer": "Puli",
  "distractors": ["Čivava", "Jezevčík", "Dalmatin"],
  "quip_correct": "Přesně! Puli vypadá jako černý mop na podlahu, ale pánem stáda je naprosto autoritativním.",
  "quip_wrong": "Čivava ani jezevčík na pastvinách stádo neuhlídají — Puli to zvládne i v bouři.",
  "explanation": "Puli je tradiční maďarský pastevecký pes s typickými šňůrami srsti, které ho chrání před chladem i kousnutím vlků. Na maďarské pustě hlídá stáda ovcí po staletí.",
  "about": "maďarském psovi puli"
},
{
  "id": "hu-k-budin-hrad",
  "cc": "hu", "country": "Maďarsko", "section": "Hlavní město",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se jmenuje velký hradní komplex tyčící se na kopci nad Dunajem v Budapešti?",
  "answer": "Budínský hrad",
  "distractors": ["Karlštejn", "Hluboká", "Spišský hrad"],
  "quip_correct": "Správně! Kdysi v něm sídlili uherští králové, dnes tam jsou muzea a galerie.",
  "quip_wrong": "Karlštejn je v Čechách a Spišský v Slovensku — ten velký hrad nad Dunajem je Budínský.",
  "explanation": "Budínský hrad byl centrem uherského království po staletí. Výhled z jeho teras na Dunaj a Pešť je jeden z nejhezčích v celé Evropě.",
  "about": "Budínském hradě"
},
{
  "id": "hu-k-csikos-kone",
  "cc": "hu", "country": "Maďarsko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se jmenují tradiční maďarští jezdci na koních, kteří v pruhovaných kalhotách předvádějí kousky na pustě?",
  "answer": "Čikošové",
  "distractors": ["Gauči", "Kovbojové", "Kozáci"],
  "quip_correct": "Přesně! Čikoš stojí ve cvalu na dvou koních najednou — a přitom vypadá úplně klidně.",
  "quip_wrong": "Gauči jsou z Argentiny a kovbojové z Ameriky — ti maďarští jezdci na pustě jsou čikošové.",
  "explanation": "Čikošové jsou tradiční maďarští pastevci koní na Hortobágyské pustě. Jsou proslulí tím, že umí řídit celý svazek koní najednou a stát ve cvalu — což se učí od dětství.",
  "about": "čikošech"
},
{
  "id": "hu-k-marcipan-szentendre",
  "cc": "hu", "country": "Maďarsko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "V malebném městečku Szentendre nedaleko Budapešti najdete muzeum plné čeho sladkého?",
  "answer": "Marcipánu",
  "distractors": ["Čokoládových vajíček", "Žvýkaček", "Perníků"],
  "quip_correct": "Správně! Celé sochy a modely budov jsou tam vyrobeny z marcipánu — a smí se ochutnat.",
  "quip_wrong": "Kdepak — tohle muzeum je celé o marcipánu, sladké mandlové hmotě.",
  "explanation": "Marcipánové muzeum v Szentendre láká návštěvníky na sochy, modely a figurky z mandlové hmoty. Největší exponáty jsou přes metr velké a trvalo je vyrobit týdny.",
  "about": "Szentendre"
},
{
  "id": "hu-k-lazne-termalni",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Proč je voda v maďarských lázních teplá i v zimě, bez ohřívání kotlem?",
  "answer": "Vyvěrá přirozeně teplá z hloubky země",
  "distractors": ["Ohřívají ji solární panely na střeše", "Přitéká teplá z pouště", "Každý den ji přihřívají kotlem"],
  "quip_correct": "Přesně! Maďarsko leží na horké zóně — země si bazén ohřeje sama.",
  "quip_wrong": "Žádný kotel ani solární panel — voda přichází přírodně teplá přímo z podzemí.",
  "explanation": "Pod Maďarskem leží obrovské zásoby termální vody, které se přirozeně ohřívají zemským teplem. Proto má Budapešť více lázní než jakékoli jiné hlavní město Evropy.",
  "about": "maďarských lázních"
},
{
  "id": "hu-k-candak-balaton",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaká ryba je považována za krále Balatonu a servíruje se v restauracích po celém jeho pobřeží?",
  "answer": "Candát",
  "distractors": ["Žralok", "Losos", "Jeseter"],
  "quip_correct": "Správně! Balatonský candát je lahůdka — rybáři ho loví a restaurace ho podávají po staletí.",
  "quip_wrong": "Žralok ani losos v Balatonu rozhodně neplave — candát tam vládne a víc než zaslouženě.",
  "explanation": "Candát je dravá sladkovodní ryba s bílým masem a téměř bez kostí. Na Balatonu se loví tradičně a místní restaurace ho připravují na desítky způsobů.",
  "about": "rybách v Balatonu"
},

// ── PUBERŤÁCI (13) ─────────────────────────────────────────────────────────
{
  "id": "hu-t-matra-turistika",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 1, "type": "choice",
  "question": "Pohoří Mátra v severním Maďarsku je nejvyšší v zemi. Čím je charakteristické?",
  "answer": "Zalesněné pahorky sopečného původu s nejvyšším bodem Kékes",
  "distractors": [
    "Věčně zasněžené ledovcové štíty s alpskými chatami",
    "Písečné pouštní duny bez vegetace",
    "Průmyslová oblast s uhelnými doly"
  ],
  "quip_correct": "Přesně! Mírné bukové svahy a staré sopečné kopce — ideální na výlety bez horolezcké výbavy.",
  "quip_wrong": "Ledovce ani poušť v Maďarsku nehledej — Mátra jsou zalesněné sopečné pahorky.",
  "explanation": "Pohoří Mátra tvoří část Severomaďarského středohoří a vzniklo starou vulkanickou činností. Nejvyšší bod Kékes měří 1 014 m — na maďarské poměry slušná výška.",
  "about": "pohoří Mátra"
},
{
  "id": "hu-t-pecs-zsolnay",
  "cc": "hu", "country": "Maďarsko", "section": "Kultura",
  "difficulty": 1, "type": "choice",
  "question": "Město Pécs na jihozápadě Maďarska proslavila rodina Zsolnayů. Čím?",
  "answer": "Výrobou umělecké keramiky a secesních glazovaných obkladů",
  "distractors": [
    "Vynálezem parního stroje pro dunajskou plavbu",
    "Těžbou černého uhlí pro celé Rakousko-Uhersko",
    "Šlechtěním nových druhů vína v podzemních sklepích"
  ],
  "quip_correct": "Výborně! Jejich keramika zdobí střechy a fasády budov po celé střední Evropě — i v Praze.",
  "quip_wrong": "Parní stroje ani uhlí — Zsolnayové dělali krásné věci z hlíny.",
  "explanation": "Zsolnayho porcelánka v Pécsi vznikla v roce 1853 a proslavila se unikátní glazurou pyrogranit. Jejich dlaždice zdobí třeba střechu kostela Matyáše v Budapešti.",
  "about": "Pécsi a rodině Zsolnayů"
},
{
  "id": "hu-t-eger-bikaver",
  "cc": "hu", "country": "Maďarsko", "section": "Jídlo",
  "difficulty": 2, "type": "choice",
  "question": "Jak vznikl podle legendy název červeného vína Egri Bikavér — Býčí krev z Egeru?",
  "answer": "Obránci hradu pili červené víno, a Turci si mysleli, že pijí krev a mají nadlidskou sílu",
  "distractors": [
    "Vinaři do vína přidávali skutečnou krev obětních býků",
    "Víno kvasilo v kůžích divokých stepních býků",
    "Pojmenování vymyslel marketér v 19. století pro export"
  ],
  "quip_correct": "Přesně! Mírné vypití červeného vína proměnilo hrstku obránců v nadlidské stroje — aspoň podle legendy.",
  "quip_wrong": "Skutečná krev do vína nepatří a koža býků taky ne — legenda mluví o strachu tureckých vojáků.",
  "explanation": "Bitva u Egeru v roce 1552 je v maďarských dějinách legendární: malá posádka pod vedením Istvána Dobóa ubránila hrad proti obrovské osmanské přesile. Víno Egri Bikavér je dodnes jedním z nejznámějších maďarských vín.",
  "about": "Egri Bikavér"
},
{
  "id": "hu-t-szentendre-umeni",
  "cc": "hu", "country": "Maďarsko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Čím je známé městečko Szentendre na sever od Budapešti?",
  "answer": "Malebné město umělců s úzkými uličkami a balkánskou atmosférou",
  "distractors": [
    "Centrum těžkého strojírenství a hutnictví",
    "Moderní čtvrť s mrakodrapy a mezinárodním letištěm",
    "Průmyslová zóna chemických továren"
  ],
  "quip_correct": "Správně! Dlážděné uličky, galerie a vůně z kaváren — Szentendre působí jako Maďarsko z pohlednice.",
  "quip_wrong": "Průmysl a mrakodrapy tam nehledej — Szentendre je útočiště malířů a turistů.",
  "explanation": "Szentendre si zachovalo balkánský ráz díky srbským uprchlíkům, kteří se tu usadili po ústupu Turků v 18. století. Dnes tam žijí desítky umělců a stojí tam přes dvacet galerií.",
  "about": "Szentendre"
},
{
  "id": "hu-t-miskolc-tapolca",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 2, "type": "choice",
  "question": "Miskolc-Tapolca nabízí zcela unikátní lázeňský zážitek. Jaký?",
  "answer": "Koupání v termální vodě uvnitř přírodních jeskynních chodeb",
  "distractors": [
    "Plavání v kráterovém jezeře vyhaslé sopky",
    "Relaxace v korunách stromů v přísně chráněném pralese",
    "Koupele ve slané vodě na dně starého uhelného dolu"
  ],
  "quip_correct": "Výborně! Plavaní skrze ozářené jeskynní chodby s teplou vodou je zážitek, na který se nezapomíná.",
  "quip_wrong": "Žádná sopka ani důl — lázně využívají skutečné krasové jeskyně s přírodní termální vodou.",
  "explanation": "Jeskynní lázně v Miskolc-Tapolci jsou jediné svého druhu v Evropě. Termální voda ohřívaná zemským teplem proudí přírodními vápencovými chodbami, kde se hosté mohou volně pohybovat.",
  "about": "Miskolc-Tapolca"
},
{
  "id": "hu-t-tihany-poloostrov",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 1, "type": "choice",
  "question": "Který poloostrov vybíhá do jezera Balaton a je proslulý levandulovými poli a starým benediktinským opatstvím?",
  "answer": "Tihany",
  "distractors": ["Siófok", "Keszthely", "Badacsony"],
  "quip_correct": "Správně! Z kopců Tihany je nejhezčí výhled na celý Balaton — a v červenci tam voní levandule na kilometry.",
  "quip_wrong": "Siófok a Keszthely jsou přímořská letoviska — poloostrov s opatstvím je Tihany.",
  "explanation": "Tihany je chráněná přírodní oblast s unikátními gejzírovými kópami (pozůstatky po starých gejzírech). Benediktinské opatství tam stojí od roku 1055 a je to jedna z nejstarších staveb v Maďarsku.",
  "about": "poloostrovu Tihany"
},
{
  "id": "hu-t-szeged-divadlo",
  "cc": "hu", "country": "Maďarsko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Čím je proslulé Dómové náměstí v Szegedu krom impozantní cihlové katedrály?",
  "answer": "Každoléto se tam konají slavné divadelní hry pod širým nebem",
  "distractors": [
    "Každou zimu se tam staví největší ledové bludiště v Evropě",
    "Funguje tam trvalý trh s exotickým kořením z Afriky",
    "Slouží jako přistávací plocha pro horkovzdušné balóny"
  ],
  "quip_correct": "Přesně! Szegedské divadelní hry na Dómovém náměstí mají obrovskou tradici — jako Verona, jen s paprikovou atmosférou.",
  "quip_wrong": "Ledové bludiště ani trh s kořením — náměstí žije divadlem pod hvězdami.",
  "explanation": "Dómové náměstí je jedno z největších uzavřených náměstí v Evropě. Letní divadelní festival tam pořádají od 30. let 20. století a sedí tam přes šest tisíc diváků.",
  "about": "Szegedu"
},
{
  "id": "hu-t-heviz-lekniny",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 2, "type": "choice",
  "question": "Jaká nezvyklá rostlina kvetoucí růžově pokrývá hladinu termálního jezera Hévíz?",
  "answer": "Indický leknín — jinak roste jen v tropech",
  "distractors": [
    "Obří amazónský leknín viktorie královská",
    "Žlutý leknín jako v českých rybnících",
    "Papyrový rákos přivezený z Egypta"
  ],
  "quip_correct": "Přesně! Teplá voda umožňuje tropickým leknínovím prosperovat v srdci Evropy.",
  "quip_wrong": "Amazónská viktorie ani papyrus — v Hévízu kvetou indické lekníny díky celoroční teplé vodě.",
  "explanation": "Indické lekníny byly do jezera úspěšně vysazeny koncem 19. století. Jezero Hévíz je s plochou 4,4 hektaru největší přírodní termální jezerou v Evropě a druhou největší na světě.",
  "about": "Hévízu"
},
{
  "id": "hu-t-egri-var",
  "cc": "hu", "country": "Maďarsko", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Egerský hrad je v maďarských dějinách symbolem čeho?",
  "answer": "Hrdinného odporu malé posádky proti obrovské turecké přesile v roce 1552",
  "distractors": [
    "Místa, kde byla podepsána první maďarská ústava",
    "Tajného úkrytu královského pokladu před tatarskými nájezdy",
    "Nejdůležitější pevnosti chránící Vídeň od jihu"
  ],
  "quip_correct": "Přesně! Pár stovek obránců ubránilo hrad proti mnohatisícové osmanské armádě. Poprvé v té válce.",
  "quip_wrong": "Ústava ani poklad — Eger proslavila bitva, ne diplomaté.",
  "explanation": "Obrana Egeru v roce 1552 inspirovala Gézu Gárdonyiho k napsání slavného románu Egerské hvězdy. Kapitan Dobó se stal národním hrdinou, protože dokázal, že Turky lze porazit.",
  "about": "Egerskému hradu"
},
{
  "id": "hu-t-busojaras-legenda",
  "cc": "hu", "country": "Maďarsko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Tradice karnevalu Busójárás v Moháči je spojena s jakou legendou?",
  "answer": "Místní v děsivých maskách prý vystrašili osmanská vojska, která utekla",
  "distractors": [
    "Převlečení za vlky zachránili vesnici před krutou zimní bouří",
    "Zastrašili hejna dravých ptáků ničících úrodu",
    "Vyhnali loupeživé bandy schované v hlubokých lesích"
  ],
  "quip_correct": "Přesně! Dřevěné masky a rituální hluk měly děsit celé armády — a prý to fungovalo.",
  "quip_wrong": "Ptáci ani vlci — legenda říká, že masky vyhnaly Turky.",
  "explanation": "Busójárás je karneval konaný každoročně na konci února, symbolizující konec zimy a vyhnání zlých sil. UNESCO ho zapsalo na seznam světového nehmotného dědictví v roce 2009.",
  "about": "Busójárás"
},
{
  "id": "hu-t-danube-kanyar",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 1, "type": "choice",
  "question": "Dunajské ohbí — Dunakanyar — je oblíbená turistická oblast severně od Budapešti. Čím je výjimečná?",
  "answer": "Dunaj tam dělá dramatický obrat a říční krajinu lemují hrady a historická městečka",
  "distractors": [
    "Řeka tam vtéká do obrovského umělého jezera",
    "Dunaj se tam rozděluje na sto ramen jako v deltě",
    "V místě ohbí stojí největší přehradní hráz v zemi"
  ],
  "quip_correct": "Přesně! Visegrád, Esztergom, Szentendre — jeden hrad nebo klášter za druhým s výhledem na řeku.",
  "quip_wrong": "Žádná delta ani přehrada — Dunajské ohbí je krajina hradů a meandrů.",
  "explanation": "V místě Dunakanyar se Dunaj otáčí o 90 stupňů a teče na jih. Oblast je historicky strategicky důležitá — proto tam stojí tolik hradů a královských sídel.",
  "about": "Dunakanyar"
},
{
  "id": "hu-t-parlament-budapesti",
  "cc": "hu", "country": "Maďarsko", "section": "Hlavní město",
  "difficulty": 1, "type": "choice",
  "question": "Proč je budapešťský parlament na břehu Dunaje tak symetrický — levá polovina vypadá úplně stejně jako pravá?",
  "answer": "Byl postaven, když Uhry tvořily dvě formálně rovnocenné části monarchie — obě sněmovny měly stejně velké zázemí",
  "distractors": [
    "Architekt omylem navrhl budovu zrcadlově, ale stavět se začalo a nešlo to zastavit",
    "Symetrie přinášela v tehdejší víře štěstí a ochranu před povodněmi",
    "Levá polovina sloužila letní sezoně, pravá zimní"
  ],
  "quip_correct": "Přesně! Horní sněmovna vlevo, dolní vpravo — každá v zrcadlové kopii. Politická spravedlnost v kameni.",
  "quip_wrong": "Architektonická náhoda ani pověra — symetrie měla politický smysl.",
  "explanation": "Maďarský parlament byl dokončen v roce 1902 a je třetím největším parlamentním budovám na světě. Symetrie odráží dualismus Rakouska-Uherska — dvě sněmovny se zrcadlově rovnocenným zázemím.",
  "about": "budapešťském parlamentu"
},
{
  "id": "hu-t-badacsony-vino",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 2, "type": "choice",
  "question": "Čím je zvláštní krajina na severním břehu Balatonu u Badacsony?",
  "answer": "Stolové hory sopečného původu — vyhaslé sopky s vinicemi na čedičových svazích",
  "distractors": [
    "Ledovcové fjordy zaříznuté do vápencových masivů",
    "Rozlehlé písečné duny bez vegetace",
    "Mangrovové lesy ponořené do mělké vody"
  ],
  "quip_correct": "Výborně! Staré sopky zanechaly na severu Balatonu bizarní kamenné kopce — a na nich teď roste výborné víno.",
  "quip_wrong": "Fjordy ani duny — Badacsony jsou sopečné stolové hory s vinicemi.",
  "explanation": "Badacsony a okolní kopce jsou zbytky vyhaslých sopek. Čedičové svahy akumulují teplo a víno z těchto poloh (zejména odrůda Szürkebarát) patří k nejlepším maďarským bílým vínům.",
  "about": "Badacsony"
},

// ── DOSPĚLÍ (12) ───────────────────────────────────────────────────────────
{
  "id": "hu-a-albert-szentgyorgyi",
  "cc": "hu", "country": "Maďarsko", "section": "Lidé",
  "difficulty": 3, "type": "choice",
  "question": "Za co dostal maďarský vědec Albert Szent-Györgyi Nobelovu cenu, a co ho k objevu přivedlo?",
  "answer": "Izoloval vitamin C z maďarské papriky — a přišel na to, že paprika ho má víc než pomeranč",
  "distractors": [
    "Vynalezl syntetický inzulín pro léčbu cukrovky",
    "Objasnil strukturu DNA a mechanismus dědičnosti",
    "Jako první transplantoval funkční srdce na zvířecím modelu"
  ],
  "quip_correct": "Výborně! Paprika se tak stala národní superpotravinou s vědeckým posvěcením.",
  "quip_wrong": "DNA ani transplantace — za vitamin C v paprice.",
  "explanation": "Szent-Györgyi pracoval na Szegedské univerzitě a zjistil, že paprika obsahuje enormní množství kyseliny askorbové — mnohonásobně víc než citrusy. Nobelovu cenu dostal v roce 1937.",
  "about": "Albertu Szent-Györgyimu"
},
{
  "id": "hu-a-gellert-jeskynni-kaple",
  "cc": "hu", "country": "Maďarsko", "section": "Hlavní město",
  "difficulty": 3, "type": "choice",
  "question": "Co se nachází uvnitř skalního vrchu Gellérthegy přímo naproti hotelu Gellért?",
  "answer": "Jeskynní kaple vytesaná v živé skále, dodnes sloužící řádu pavlánů",
  "distractors": [
    "Tajný velitelský bunker studené války pro vládní špičky",
    "Rozsáhlé vinné sklepy s archivními ročníky tokajského vína",
    "Pohřebiště středověkých uherských králů"
  ],
  "quip_correct": "Přesně! Kostel uvnitř kopce — komunisté ho na čtyřicet let zazdili, pavláni ho po revoluci znovu otevřeli.",
  "quip_wrong": "Žádný bunker ani sklepy — v té skále je kaple.",
  "explanation": "Jeskynní kostel (Sziklatemplom) inspirovala lurdská grotta ve Francii. V komunistickém Maďarsku byl vchod zabetonován a mniši uvězněni. Po roce 1989 byl kostel obnoven a je opět přístupný.",
  "about": "Gellértově vrchu"
},
{
  "id": "hu-a-tokaj-botrytis",
  "cc": "hu", "country": "Maďarsko", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Co způsobuje, že se tokajské hrozny pro aszú smršťují do sladkých bobulí místo toho, aby shnily?",
  "answer": "Ušlechtilá plíseň Botrytis cinerea, která vodu odpařuje a cukr soustřeďuje",
  "distractors": [
    "Hrozny se záměrně zmrazují přímo na keři jako u ledového vína",
    "Speciální sušicí komory s proudícím teplým vzduchem z Balkánu",
    "Pomalé solení hroznů ve větraných sklepích po sklizni"
  ],
  "quip_correct": "Přesně! Plíseň, která jinde ničí úrodu, v Tokaji dělá zázrak — díky místnímu mikroklimatu u soutoku řek.",
  "quip_wrong": "Mráz ani sušárny — tokajský zázrak obstarává plíseň, která správně napadne správný hrozen.",
  "explanation": "Botrytis cinerea se v tokajské oblasti šíří v ranních mlhách ze soutoku Tisy a Bodrogu. V ostatních vinohradnických oblastech je postrachem pěstitelů — v Tokaji je základem nejslavnějšího sladkého vína světa.",
  "about": "tokajském víně"
},
{
  "id": "hu-a-sopron-fidelitas",
  "cc": "hu", "country": "Maďarsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Proč se Sopron nazývá Civitas Fidelissima — Nejvárnější město?",
  "answer": "V referendu 1921 se většina obyvatel rozhodla zůstat v Maďarsku místo připojení k Rakousku",
  "distractors": [
    "Jako jediné město nekapitulovalo před osmanskou armádou ani po třech obléháních",
    "Všichni obyvatelé odmítli přijmout komunistický režim a emigrovat za hranice",
    "Město věrně zásobovalo Budapešť jídlem i během nejhorší vojenské blokády"
  ],
  "quip_correct": "Přesně! Němečtí obyvatelé Sopronu hlasovali pro Maďarsko — a město zůstalo maďarské dodnes.",
  "quip_wrong": "Osmané ani komunisté — věrnost Sopronu se prokázala v referendu.",
  "explanation": "Po první světové válce připadl Sopron s okolím ke kandidátskému území Rakouska. Referendum v prosinci 1921 ale rozhodlo poměrem 65 : 35 pro Maďarsko. Byl to jediný případ, kdy hlasování změnilo výsledky trianonské mírové smlouvy.",
  "about": "Sopronu"
},
{
  "id": "hu-a-heviz-termodynamika",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Proč má jezero Hévíz stálou teplotu vody kolem 30–38 °C i v mrznoucí zimě?",
  "answer": "Voda přitéká z hlubokého krasového systému s přirozeným geotermálním ohřevem",
  "distractors": [
    "Jezero je uměle přitápěno odpadním teplem z nedaleké elektrárny",
    "Pod dnem probíhá aktivní vulkanická činnost",
    "Hloubka sahá do zemského pláště, odkud sálá primární teplo"
  ],
  "quip_correct": "Výborně! Prameny jsou tak vydatné, že se celá masa vody v jezeře vymění přibližně každé tři dny.",
  "quip_wrong": "Žádná elektrárna ani zemský plášť — za teplotou je kras a geotermika.",
  "explanation": "Hévíz je s plochou 4,4 ha největší přírodní termální jezero v Evropě. Voda vyvěrá ze 38 metrů hluboké průrvy v dně jezera a má teplotu 25–38 °C podle roční doby.",
  "about": "termálním jezeru Hévíz"
},
{
  "id": "hu-a-debrecin-kolegium",
  "cc": "hu", "country": "Maďarsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Reformované kolegium v Debrecínu hraje klíčovou roli v maďarských dějinách. Proč?",
  "answer": "Po staletí bylo jedinou institucí, kde se maďarsky psalo a vyučovalo — udrželo jazyk naživu",
  "distractors": [
    "Bylo první vojenskou akademií monarchie pro výcvik generálů",
    "Sloužilo jako hlavní sídlo královské mincovny a bankovnictví",
    "Centrum pro překlad antických děl do maďarštiny — jako kláštery v Irsku"
  ],
  "quip_correct": "Přesně! Zatímco úředním jazykem monarchie byla latina a potom němčina, kolegium tisklo a učilo maďarsky.",
  "quip_wrong": "Vojsko ani mincovna — kolegium udržovalo maďarský jazyk, když ho nikdo jiný nepěstoval.",
  "explanation": "Debrecínské kolegium funguje od roku 1538. V jeho knihovně je přes 650 000 svazků. Kossuth, Ady, Jókai — řada klíčových maďarských osobností tam studovala.",
  "about": "Debrecínském kolegiu"
},
{
  "id": "hu-a-margit-hid",
  "cc": "hu", "country": "Maďarsko", "section": "Hlavní město",
  "difficulty": 3, "type": "choice",
  "question": "Markétin most v Budapešti má nezvyklý tvar. V čem spočívá jeho zvláštnost?",
  "answer": "Uprostřed se lomí pod tupým úhlem — kvůli odbočce na Markétino ostrov",
  "distractors": [
    "Má tvar písmene S pro překonání prudkého ohybu řeky",
    "Je postaven šikmo přes Dunaj jako jediný v celém městě",
    "Tvoří polokruh kvůli ostrůvku uprostřed toku"
  ],
  "quip_correct": "Výborně! Zohnutí mostu uprostřed proudu je jedno z nejoriginálnějších inženýrských řešení v Budapešti.",
  "quip_wrong": "Ani S ani polokruh — most se zalomí jen jednou, tam kde z něj odbočuje rameno na ostrov.",
  "explanation": "Markétin most byl postaven v roce 1876. Odbočka na Markétino ostrov způsobuje, že most mění směr přesně uprostřed Dunaje — pohled shora připomíná boomerang.",
  "about": "Markétině mostu"
},
{
  "id": "hu-a-hortobagy-kilenclyuku",
  "cc": "hu", "country": "Maďarsko", "section": "Zeměpis",
  "difficulty": 3, "type": "choice",
  "question": "Jakým jménem se pyšní nejdelší historický silniční most v Maďarsku na Hortobágyské pustě a co o něm prozrazuje jeho jméno?",
  "answer": "Devítiobloukový most — název říká přesně, kolik oblouků přemosťuje řeku Hortobágy",
  "distractors": [
    "Dlouhý most — postaven jako nejdelší v tehdejší říši",
    "Pastýřský most — protože byl určen výhradně pro přehnání dobytka",
    "Říční most — pro rozlišení od mostů přes příkopy hradů"
  ],
  "quip_correct": "Přesně! Na ploché pustě bez vrcholů a výškových dominant je most s devíti oblouky dominantou na kilometry daleko.",
  "quip_wrong": "Délka ani dobytek v názvu nejsou — most se jmenuje podle počtu svých oblouků.",
  "explanation": "Kilenclyukú híd (Devítiobloukový most) byl postaven v první polovině 19. století. Národní park Hortobágy, kde stojí, je největší stepní národní park v Evropě a je na seznamu UNESCO.",
  "about": "Devítiobloukovém mostu"
},
{
  "id": "hu-a-pecs-mecset",
  "cc": "hu", "country": "Maďarsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Na hlavním náměstí v Pécsi stojí budova s kupolí, která vypadá jako mešita — ale slouží jako kostel. Co to prozrazuje o historii města?",
  "answer": "Jde o původní osmanskou mešitu z 16. století — po vyhnání Turků ji křesťané přestavěli na kostel",
  "distractors": [
    "Je to replika turecké stavby postavená v 19. stol. jako připomínka turistům",
    "Křižáci ji postavili v islámském stylu jako diplomatické gesto k muslimům",
    "Mešitový tvar si zvolil místní architekt, protože se mu líbil"
  ],
  "quip_correct": "Přesně! Minaret byl zbourán, kříž přibyel na kupoli — a mešita se stala kostelem. Pécs je živá palimpsestová vrstva dějin.",
  "quip_wrong": "Žádná replika ani diplomatické gesto — je to autentická osmanská stavba.",
  "explanation": "Pécs byl pod osmanskou nadvládou 143 let (1543–1686). Mešita pachy Kasima je největší zachovanou osmanskou stavbou v Maďarsku a připomíná, že střední Evropa byl po staletí kontaktní zóna civilizací.",
  "about": "Pécsi"
},
{
  "id": "hu-a-tokaj-soutok",
  "cc": "hu", "country": "Maďarsko", "section": "Zeměpis",
  "difficulty": 3, "type": "choice",
  "question": "U soutoku jakých dvou řek leží Tokaj — a proč je právě tato poloha klíčová pro kvalitu tamního vína?",
  "answer": "Soutok Tisy a Bodrogu — ranní mlhy z obou řek šíří plíseň botrytis, která dělá z hroznů aszú",
  "distractors": [
    "Soutok Dunaje a Tisy — proud studené a teplé vody vytváří ideální mikroklima",
    "Soutok Bodrogu a Hernaду — říční vlhkost chrání révu před jarními mrazy",
    "Tokaj leží na soutoku tří řek bez konkrétního vlivu na víno"
  ],
  "quip_correct": "Přesně! Řeky přinášejí mlhu, mlha přináší plíseň, plíseň přináší zázrak v láhvi.",
  "quip_wrong": "Tisza a Bodrog — ne Dunaj a ne tři řeky najednou.",
  "explanation": "Tokajská vinohradnická oblast je na seznamu UNESCO. Mikroklima u soutoku Tisy a Bodrogu je jedinečné na celém světě — přesně ta kombinace vlhkosti, tepla a mlh, která botrytis potřebuje.",
  "about": "Tokaji"
},
{
  "id": "hu-a-budapest-szabadsag-hid",
  "cc": "hu", "country": "Maďarsko", "section": "Hlavní město",
  "difficulty": 3, "type": "choice",
  "question": "Most svobody v Budapešti zaujme jasně zelenou barvou. Co skrývá jeho méně viditelná história?",
  "answer": "Byl otevřen samotným císařem Františkem Josefem I. při miléniových oslavách — císař zatloukl zlatý nýt",
  "distractors": [
    "Byl tajně postaven za dvě noci jako strategická vojenská přemostění",
    "Vznikl jako sbírka od budapešťských občanů, každý příspěvek byl zaznamenán",
    "Byl prvním mostem postaveným bez lešení — zavěšenou montáží odspodu"
  ],
  "quip_correct": "Přesně! Zlatý nýt, císař v rukavičkách — ten okamžik byl tak slavnostní, že most dostal jméno na oplátku.",
  "quip_wrong": "Žádná noční akce ani sbírka — most dostal císařskou premiéru.",
  "explanation": "Most svobody (Szabadság híd) byl otevřen v roce 1896 a původně se jmenoval po Františku Josefovi. Zlatý nýt, který císař symbolicky zatloukl, je tam prý dodnes. Po druhé světové válce most přejmenovali.",
  "about": "Mostu svobody"
},
{
  "id": "hu-a-balaton-vulkany",
  "cc": "hu", "country": "Maďarsko", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Jak vznikl severní břeh Balatonu s jeho zvláštnímí stolnatými kopci — a co to znamenalo pro místní vinaře?",
  "answer": "Jsou to zbytky vyhaslých sopek — čedičové svahy akumulují teplo a dávají vínům minerální charakter",
  "distractors": [
    "Jsou to haldy odpadu z říční těžby — časem je pokryla vegetace",
    "Vznik je ledovcový — morény zformovaly kopce, které pak vinaři osídlili",
    "Jde o uměle navezené terasy z dob římského opevnění podél jezera"
  ],
  "quip_correct": "Přesně! Sopky dávno vyhasly, ale vinaři z jejich svahů těží dodnes.",
  "quip_wrong": "Žádné morény ani haldy — za kopci jsou staré sopky.",
  "explanation": "Sopečná aktivita na severu Balatonu skončila před miliony let, ale čedičové horniny zůstaly. Badacsony, Gulács, Csobánc — každý kopec je zbytek sopky a každý nese vinice s odrůdami jako Szürkebarát nebo Olaszrizling.",
  "about": "sopečných kopcích u Balatonu"
}
];

// Načíst existující soubor
const existing = JSON.parse(fs.readFileSync(FILE, "utf8"));
const existingIds = new Set(existing.map(q => q.id));

// Přidat jen otázky s unikátním ID
const toAdd = NEW_QUESTIONS.filter(q => {
  if (existingIds.has(q.id)) {
    console.warn(`  ! Přeskočeno (ID existuje): ${q.id}`);
    return false;
  }
  return true;
});

const merged = [...existing, ...toAdd];
fs.writeFileSync(FILE, JSON.stringify(merged, null, 1));
console.log(`Hotovo: přidáno ${toAdd.length} otázek (přeskočeno ${NEW_QUESTIONS.length - toAdd.length}). Celkem: ${merged.length} otázek.`);
