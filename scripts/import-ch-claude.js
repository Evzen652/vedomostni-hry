"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "ch.json");
const NEW_QUESTIONS = [
  {
    "id": "ch-k-cokolada",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Jídlo",
    "difficulty": 1,
    "kids": true,
    "type": "choice",
    "question": "Švýcarská čokoláda je slavná po celém světě. Co ji dělá jinak krémovou než čokoláda z jiných zemí?",
    "answer": "Přidává se do ní hodně sušeného mléka — Švýcarsko je plné krav a mléka mají dost",
    "distractors": [
      "Přidává se do ní alpský sníh, který ji ochlazuje při výrobě",
      "Míchá se déle než jiná čokoláda — celý týden bez přestávky",
      "Vyrábí se z tmavých alpských bobů kakaa, které rostou jen ve Švýcarsku"
    ],
    "quip_correct": "Švýcarské krávy, švýcarské mléko, švýcarská čokoláda — logický řetěz, který chutná výborně.",
    "quip_wrong": "Alpský sníh by byl romantický přídavek, ale pravda je přízemní: hodně mléka od hodně krav.",
    "explanation": "Klíčový vynález byl tzv. mléčná čokoláda — v roce 1875 ji vyvinul Daniel Peter ve spolupráci s Henri Nestlém, který mu dodal kondenzované mléko. Do té doby se čokoláda jedla hořká nebo pila jako nápoj. Švýcarsko tímto vynálezem v podstatě definovalo moderní čokoládu.",
    "about": "švýcarské mléčné čokoládě a jejím vzniku",
    "image_prompt": "A painterly watercolor illustration of a Swiss chocolate shop with rows of milk chocolate bars and pralines, a happy cow visible through the window in an alpine meadow, vintage travel journal style"
  },
  {
    "id": "ch-k-nuz",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Kultura",
    "difficulty": 1,
    "kids": true,
    "type": "choice",
    "question": "Švýcarský armádní nůž je červený a plný věcí. Co všechno se z něj dá vyklopit kromě nože?",
    "answer": "Pilník, nůžky, šroubovák, otvírák na konzervy a další nástroje — záleží na modelu",
    "distractors": [
      "Malá pistole a kompas pro přežití v horách",
      "Miniaturní vařič na čaj a skládací miska",
      "Svítilna, zrcátko a zápalky v nepromokavém pouzdře"
    ],
    "quip_correct": "Švýcarský nůž: jedno červené pouzdro, tucet problémů vyřešených. Jediné co v něm chybí je odvaha ho celý složit zpátky.",
    "quip_wrong": "Miniaturní vařič by byl sen, ale realita je skromnější — i když pořád impresivní. Správně: pilník, nůžky, šroubovák a spol.",
    "explanation": "Originální švýcarský armádní nůž vyrobila firma Victorinox v roce 1891 jako zakázku pro švýcarskou armádu. Název 'Swiss Army Knife' pochází od amerických vojáků po druhé světové válce, kteří ho nedokázali vyslovit německy. Dnes existuje přes 100 modelů s různými kombinacemi nástrojů.",
    "about": "švýcarském armádním noži a jeho historii",
    "image_prompt": "A painterly watercolor illustration of a classic red Swiss Army Knife with multiple tools unfolded displayed on a wooden mountain hut table, vintage travel journal style"
  },
  {
    "id": "ch-k-medved-bern",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Místa",
    "difficulty": 1,
    "kids": true,
    "type": "choice",
    "question": "Bern, hlavní město Švýcarska, má ve znaku medvěda. Co s tím mají společného živí medvědi přímo ve městě?",
    "answer": "Uprostřed města je medvědí park, kde skuteční medvědi žijí u řeky",
    "distractors": [
      "Každý rok přivezou medvěda z Alp na slavnost a pak ho pustí zpět",
      "V Bernu žijí jen vycpaní medvědi v muzeu — živí jsou jen ve znaku",
      "Medvědi se chovají v podzemí pod radnicí jako strážci pokladu"
    ],
    "quip_correct": "Bern má medvěda v erbu a medvědy u řeky. Jedno město, dvě úrovně medvědí vážnosti.",
    "quip_wrong": "Medvědi pod radnicí by byli záviděníhodní strážci. Správně: žijí v parku přímo u řeky Aare.",
    "explanation": "Medvědí příkop (Bärengraben) existuje v Bernu od roku 1513 — dnes je modernizován na prostorný park u řeky Aare. Název města Bern pravděpodobně pochází ze starého slova pro medvěda. Medvědi v parku jsou skuteční, přístupní veřejnosti zdarma a jsou jakýmsi živým symbolem města.",
    "about": "medvědím parku v Bernu a jeho historii",
    "image_prompt": "A painterly watercolor illustration of brown bears playing by a river in Bern's bear park with the medieval city towers visible on the cliff above, vintage travel journal style"
  },
  {
    "id": "ch-k-vlak-hora",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Místa",
    "difficulty": 1,
    "kids": true,
    "type": "choice",
    "question": "Do vrcholu hory Jungfrau ve Švýcarsku jede vlak přímo uvnitř hory. Jak se tam lidé dostanou na vrchol?",
    "answer": "Jedou tunelem vyhloubeným v hoře — vlak zastaví na stanici vysoko v horách",
    "distractors": [
      "Letí vrtulníkem, protože cesta po zemi je příliš nebezpečná",
      "Táhnou je koně zapřažení do speciálního saní",
      "Šplhají po visutém laně jako na obří houpačce"
    ],
    "quip_correct": "Vlak v hoře na výšku skoro 3 500 metrů. Švýcaři nevyjíždějí na výlety — oni k nim budují infrastrukturu.",
    "quip_wrong": "Koně v tunelu by ocenili kariérní upgrade, ale správně je vlak — a tunel je přes sto let starý.",
    "explanation": "Jungfraubahn je ozubnicová železnice vedoucí tunelem uvnitř Eigeru a Möncku k stanici Jungfraujoch ve výšce 3 454 m n.m. — nejvýše položené vlakové nádraží v Evropě. Tunel byl ražen v letech 1896–1912 a stavba trvala 16 let. Na vrcholu je observatoř a poštovní úřad.",
    "about": "vlakové trase na Jungfraujoch ve švýcarských Alpách",
    "image_prompt": "A painterly watercolor illustration of a yellow cogwheel train emerging from a mountain tunnel into brilliant snowy alpine scenery at Jungfraujoch station, vintage travel journal style"
  },
  {
    "id": "ch-k-rosti",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Jídlo",
    "difficulty": 1,
    "kids": true,
    "type": "choice",
    "question": "Rösti je tradiční švýcarské jídlo z brambor. Jak vypadá a jak chutná?",
    "answer": "Je to placka z nastrouhaných brambor opečená dohněda — křupavá zvenku, měkká uvnitř",
    "distractors": [
      "Je to bramborová polévka s alpskými bylinkami podávaná v chlebové misce",
      "Je to bramborový knedlík plněný sýrem, vařený ve vroucí vodě",
      "Je to bramborový salát s majonézou a nakládanými okurkami"
    ],
    "quip_correct": "Rösti: brambory, pánev, máslo a trpělivost. Jednoduché jako Alpy — a stejně impozantní.",
    "quip_wrong": "Knedlík s sýrem by byl švýcarsko-český hybrid. Správně: placka, opečená dohněda, křupavá.",
    "explanation": "Rösti pochází z kantonu Bern, kde ho farmáři jedli tradičně k snídani. Dnes je rozšířený po celém Švýcarsku a slouží jako příloha nebo samostatné jídlo. Tzv. 'Röstigraben' — imaginární hranice mezi německy a francouzsky mluvícím Švýcarskem — nese název právě podle tohoto pokrmu.",
    "about": "rösti jako tradičním švýcarském bramborovém pokrmu",
    "image_prompt": "A painterly watercolor illustration of a golden crispy rösti potato cake in a cast iron pan with herbs and butter in a cozy Swiss farmhouse kitchen, vintage travel journal style"
  },
  {
    "id": "ch-k-cervenokrizkovy-znak",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Symboly",
    "difficulty": 1,
    "kids": true,
    "type": "choice",
    "question": "Červený kříž je symbol záchranářů po celém světě. Proč má ale zrovna červený kříž na bílém pozadí?",
    "answer": "Je to švýcarská vlajka naruby — Švýcarsko má bílý kříž na červeném, takže kříž dostal opačné barvy jako pocta Švýcarsku",
    "distractors": [
      "Červená barva symbolizuje krev a bílá čistotu — vymysleli to lékaři bez vztahu k Švýcarsku",
      "Červený kříž vybral papeže jako symbol křesťanské pomoci raněným",
      "Barvy vybral náhodně Henri Dunant z barev, které měl po ruce"
    ],
    "quip_correct": "Švýcarská vlajka pozpátku — elegantnější pocta, než pojmenování organizace 'Nadace Dunant'.",
    "quip_wrong": "Papežský výběr by byl dramatičtější, ale správně je to přesný zrcadlový obraz švýcarské vlajky.",
    "explanation": "Henri Dunant, zakladatel Červeného kříže, byl Švýcar z Ženevy. Když v roce 1863 zakládal organizaci, navrhl znak jako obrácené barvy švýcarské vlajky — jako hold své domovině. V islámských zemích se používá Červený půlměsíc, v Izraeli Červená hvězda Davidova.",
    "about": "symbolu Červeného kříže a jeho vztahu ke švýcarské vlajce",
    "image_prompt": "A painterly watercolor illustration showing a Swiss flag and a Red Cross flag side by side on wooden poles against an alpine backdrop, demonstrating the inverted color scheme, vintage travel journal style"
  },
  {
    "id": "ch-k-aare",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Příroda",
    "difficulty": 1,
    "kids": true,
    "type": "choice",
    "question": "Řeka Aare protéká Bernem a je tak čistá, že v ní Berňané v létě plavou přímo ve městě. Jakou má barvu?",
    "answer": "Tyrkysově modrozelenou — barvu dává jí jemný ledovcový prach ze hor",
    "distractors": [
      "Tmavě hnědou od rašeliny z alpských mokřadů",
      "Průzračně čirou jako sklenka vody",
      "Šedou od bahna z horských potoků"
    ],
    "quip_correct": "Tyrkysová řeka v centru města, ke koupání vítaná. Bern má to, o čem jiná hlavní města sní.",
    "quip_wrong": "Průzračná by byla fajn, ale méně dramatická. Správně: tyrkysová díky ledovcovému prachu z Alp.",
    "explanation": "Tyrkysová barva Aare pochází z tzv. glaciálního mléka — jemně mletého minerálního prachu, který ledovce brousí z hornin a který odnášejí řeky. Berňané plavání v Aare berou velmi vážně — v létě se tam koupe i spolkový prezident a řeka má vlastní aplikaci s teplotou vody.",
    "about": "řece Aare a koupání v Bernu",
    "image_prompt": "A painterly watercolor illustration of people swimming in the turquoise Aare river flowing through the medieval city of Bern on a sunny summer day, vintage travel journal style"
  },
  {
    "id": "ch-k-syr",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Jídlo",
    "difficulty": 1,
    "kids": true,
    "type": "choice",
    "question": "Ementál je slavný švýcarský sýr s velkými dírami. Proč má vlastně ty díry?",
    "answer": "Vznikají při zrání — bakterie v sýru vydávají oxid uhličitý, který tvoří bublinky a pak díry",
    "distractors": [
      "Díry vrtají výrobci ručně, aby sýr lépe zrál a dýchal",
      "Vznikají, protože se sýr vyrábí kolem kulatých forem, které se pak vyndají",
      "Jsou záměrně menší než v jiných sýrech — velké díry jsou vadou výrobku"
    ],
    "quip_correct": "Bakterie jako sochaři: díry v ementálu jsou vedlejší produkt jejich práce. Nejchutnější vedlejší produkt Švýcarska.",
    "quip_wrong": "Ruční vrtání děr by bylo zdlouhavé a nerentabilní. Správně: bakterie, oxid uhličitý, přirozené bublinky.",
    "explanation": "Díry v ementálu tvoří bakterie Propionibacterium freudenreichii, které při fermentaci produkují oxid uhličitý. Výzkum z roku 2015 zjistil, že velikost děr se v posledních desetiletích zmenšila — protože moderní hygiena v mlékárnách omezila přítomnost malých sláměných úlomků, které byly zárodkem velkých bublin.",
    "about": "ementálském sýru a vzniku jeho děr",
    "image_prompt": "A painterly watercolor illustration of a large wheel of Emmental cheese cut open showing its characteristic holes, on a wooden board in a Swiss dairy with alpine meadows visible outside, vintage travel journal style"
  },
  {
    "id": "ch-t-neutralita-zbrane",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Historie",
    "difficulty": 2,
    "kids": false,
    "type": "choice",
    "question": "Švýcarsko je notoricky neutrální — ale přitom patří k největším vývozcům zbraní na světě přepočteno na obyvatele. Jak to Švýcarsko obhajuje?",
    "answer": "Vývozy podléhají schvalování a zbraně prý míří jen do demokratických zemí — ale výjimky se dělají i pro autoritářské režimy",
    "distractors": [
      "Švýcarsko tvrdí, že zbraně jsou určeny výhradně pro sebeobranu — co s nimi kupující udělá, není švýcarský problém",
      "Neutralita se podle švýcarského výkladu vztahuje jen na politiku, ne na obchod",
      "Výroba probíhá ve Švýcarsku, ale firmy jsou formálně zahraniční — Švýcarsko tedy technicky nic nevyváží"
    ],
    "quip_correct": "Neutrální Švýcarsko s puškařskou tradicí: mír kážeme, zbraně vyrábíme. Obchodní model s dlouhou historií.",
    "quip_wrong": "Formální zahraniční firmy by byl úhybný manévr hodný daňového ráje — ale zbraňový průmysl funguje jinak. Správně: schvalování s výjimkami.",
    "explanation": "Švýcarský zbrojní průmysl (firmy jako Rheinmetall Air Defence, RUAG) je legální a regulovaný. Kontroverze propukají opakovaně — například při vývozu munice do Saúdské Arábie během jemenské války. Švýcarský zákon zakazuje vývoz do zemí v aktivním konfliktu, ale definice 'konfliktu' bývá předmětem politických sporů.",
    "about": "švýcarském zbrojním průmyslu a paradoxu neutrality",
    "image_prompt": "A painterly watercolor illustration of a Swiss precision engineering factory interior with gun components on a workbench, through the window a peaceful alpine lake, vintage travel journal style"
  },
  {
    "id": "ch-t-davos",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Kultura",
    "difficulty": 1,
    "kids": false,
    "type": "choice",
    "question": "Davos je malé horské město, které každý rok na pár dní ovládne světová ekonomika. Co se tam koná?",
    "answer": "Světové ekonomické fórum — setkání nejbohatších lidí a politiků světa v luxusním lyžařském středisku",
    "distractors": [
      "Závody Formule 1 na sněhu — speciální zimní verze závodního okruhu",
      "Výroční summit NATO pro jednání o mezinárodní bezpečnosti",
      "Mezinárodní hodinářský veletrh — Švýcarsko tam prezentuje nejdražší hodinky světa"
    ],
    "quip_correct": "Davos: milionáři diskutují o světové chudobě v pěticestném horském letovisku. Ironie jako service included.",
    "quip_wrong": "Formule 1 na sněhu by byla podívaná, ale Davos nabízí jiný druh závodění. Správně: ekonomické fórum světových lídrů.",
    "explanation": "Světové ekonomické fórum (WEF) se koná v Davosu každý leden od roku 1971. Účastní se ho přes 3 000 pozvaných hostů — šéfů firem, ministrů, vědců. Kritici ho označují za 'olympiádu elit', příznivci za platformu pro řešení globálních problémů. Bezpečnostní opatření během konání jsou srovnatelná s návštěvou prezidenta USA.",
    "about": "Světovém ekonomickém fóru v Davosu",
    "image_prompt": "A painterly watercolor illustration of the alpine town of Davos in winter with luxury hotels, helicopters overhead, and suited figures walking between conference buildings in snow, vintage travel journal style"
  },
  {
    "id": "ch-t-banky-tajemstvi",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Kultura",
    "difficulty": 2,
    "kids": false,
    "type": "choice",
    "question": "Švýcarské bankovní tajemství bylo po desetiletí synonymem pro diskrétnost. Co ho nakonec v 21. století zlomilo?",
    "answer": "Tlak USA — americká vláda pohrozila švýcarským bankám odříznutím od dolarového systému, pokud neposkytnou data o amerických klientech",
    "distractors": [
      "Skandál s nacistickým zlatem v 90. letech donutil Švýcarsko otevřít archivy i bankovní záznamy",
      "EU zavedla sankce za daňové úniky a Švýcarsko muselo přistoupit na výměnu informací",
      "Průnik hackerů do UBS v roce 2007 odhalil tisíce klientů a zhroutil důvěru v systém"
    ],
    "quip_correct": "Bankovní tajemství přežilo dvě světové války, nacisty i komunisty. Americký dolar ho zlomil za pár let.",
    "quip_wrong": "Nacistické zlato bylo skandál, ale bankovní tajemství vydrželo. Zlomil ho až dolarový bič z Washingtonu.",
    "explanation": "V roce 2009 UBS pod hrozbou amerických sankcí vydala data o 4 500 amerických klientech. Program FATCA (2010) pak fakticky přinutil švýcarské banky automaticky sdílet data s USA. Od roku 2017 Švýcarsko přistoupilo na mezinárodní automatickou výměnu informací (AEI) s desítkami zemí — konec éry absolutního bankovního tajemství.",
    "about": "pádu švýcarského bankovního tajemství",
    "image_prompt": "A painterly watercolor illustration of a grand Swiss bank facade in Zurich with heavy bronze doors slightly ajar, a small US flag reflected in the polished marble floor, vintage travel journal style"
  },
  {
    "id": "ch-t-minarety",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Kultura",
    "difficulty": 2,
    "kids": false,
    "type": "choice",
    "question": "Švýcarsko je vzorem liberální demokracie a přímé demokracie. Přesto v roce 2009 referendem zakázalo stavbu jedné konkrétní věci. Co to bylo?",
    "answer": "Minarety — věže mešit, ze kterých muezín volá k modlitbě",
    "distractors": [
      "Mešity jako takové — stavba nových islámských modliteben v obytných čtvrtích",
      "Burky a nikáby — zakrytí obličeje na veřejných místech",
      "Modlitební výzvy z reproduktorů — hlukové znečištění v okolí mešit"
    ],
    "quip_correct": "Přímá demokracie rozhodla: minarety ne. Což ukázalo, že přímá demokracie umí dát menšinám i po nose.",
    "quip_wrong": "Mešity jako takové zakázány nebyly — zákaz byl cílený na věže. Detail s velkým dopadem.",
    "explanation": "Iniciativu za zákaz minaretů podpořilo 57,5 % hlasujících. V době hlasování stály ve Švýcarsku čtyři minarety — zákaz nezrušil stávající, jen zakázal stavět nové. Rozsudek Evropského soudu pro lidská práva v roce 2021 shledal zákaz slučitelným s Úmluvou o ochraně lidských práv — rozhodnutí, které samo o sobě vyvolalo velkou debatu.",
    "about": "švýcarském referendu o zákazu minaretů",
    "image_prompt": "A painterly watercolor illustration of a Swiss alpine village skyline with church steeples and a silhouette of a minaret tower visible among traditional rooftops, vintage travel journal style"
  },
  {
    "id": "ch-t-hodinky",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Kultura",
    "difficulty": 1,
    "kids": false,
    "type": "choice",
    "question": "Švýcarské hodinky jsou symbolem přesnosti a luxusu. Jak se ale hodinářství dostalo do chudých alpských vesnic v 17. a 18. století?",
    "answer": "Farmáři nemohli v zimě pracovat na polích, tak začali vyrábět hodinky doma jako vedlejší příjem",
    "distractors": [
      "Kalvínistická církev v Ženevě zakázala šperky, takže zlatníci přešli na hodinky",
      "Habsburkové přivezli hodinářské mistry z Vídně jako strategickou investici",
      "Švýcarsko importovalo hodinářskou tradici z Francie po hugenotském pronásledování"
    ],
    "quip_correct": "Alpská zima jako kolébka luxusu: farmáři bez práce, dlouhé večery, malé součástky. Skvělý recept.",
    "quip_wrong": "Hugenoti přišli do Ženevy, ale hodinářství v horách vzniklo jinak — z nudy a ze sněhu.",
    "explanation": "Obojí je pravda: hugenoti přinesli hodinářství do Ženevy po roce 1685, ale venkovské hodinářství v Jura Mountains vzniklo nezávisle jako domácká výroba v zimních měsících. Kantony Neuchâtel a Jura se staly centrem výroby. Výraz 'Swiss Made' je dnes legálně definován: nejméně 60 % výrobních nákladů musí vzniknout ve Švýcarsku.",
    "about": "historii švýcarského hodinářství a jeho venkovských kořenech",
    "image_prompt": "A painterly watercolor illustration of a 18th century Swiss farmhouse interior in winter with a family assembling tiny watch components by candlelight while snow falls outside, vintage travel journal style"
  },
  {
    "id": "ch-t-schokoladentaler",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Kultura",
    "difficulty": 1,
    "kids": false,
    "type": "choice",
    "question": "Švýcarská měna se jmenuje frank a Švýcarsko není v EU. Proč ale Švýcaři v eurozóně přesto skoro všude platit eurem mohou?",
    "answer": "Obchody a turistická místa euro dobrovolně přijímají — frank je silnější, takže kurz je výhodný pro obchodníky",
    "distractors": [
      "Švýcarsko má s EU tajnou smlouvu o měnové unii, která není veřejně komunikována",
      "Švýcarský frank je technicky navázán na euro pevným kurzem, takže jsou prakticky zaměnitelné",
      "Obchody musí euro přijímat ze zákona — na hranicích s EU je to povinné"
    ],
    "quip_correct": "Švýcarsko není v EU, ale euro bere. Obchodní pragmatismus nad národní hrdostí — a frank je stejně silnější.",
    "quip_wrong": "Tajná měnová smlouva by byla přesně to, co Švýcarsko miluje: diskrétní a výhodná. Ale neexistuje.",
    "explanation": "Švýcarský frank je jednou z nejsilnějších světových měn a považuje se za bezpečný přístav v dobách krize. V roce 2015 švýcarská centrální banka nečekaně zrušila pevný kurz 1,20 CHF/EUR — frank okamžitě posílil o 30 % a způsobil chaos na devizových trzích světa.",
    "about": "švýcarském franku a jeho vztahu k euru",
    "image_prompt": "A painterly watercolor illustration of a Swiss market stall with prices shown in both Swiss francs and euros, with the Matterhorn visible in the background, vintage travel journal style"
  },
  {
    "id": "ch-t-bund",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Historie",
    "difficulty": 2,
    "kids": false,
    "type": "choice",
    "question": "Švýcarsko nemá prezidenta v pravém slova smyslu — vládne mu sedmičlenná vláda, kde se předsednictví střídá každý rok. Proč takový systém vznikl?",
    "answer": "Aby žádný kanton ani jazyková skupina nedominovala — systém byl navržen jako záměrná rovnováha moci",
    "distractors": [
      "Prezidentský systém byl zakázán smlouvou po Napoleonových válkách, kdy Švýcarsko bylo pod francouzskou nadvládou",
      "Švýcaři odmítli prezidenta v referendu třikrát — preferují kolektivní vedení jako tradici od Středověku",
      "Sedm členů odpovídá sedmi původním kantonům, které Konfederaci založily"
    ],
    "quip_correct": "Sedm šéfů, žádný prezident, rotující předsednictví — Švýcarsko vládne samo sobě jako dobře seřízené hodinky.",
    "quip_wrong": "Sedm původních kantonů by byl elegantní původ, ale kantonů při vzniku nebylo sedm. Správně: záměrná rovnováha.",
    "explanation": "Federální rada (Bundesrat) existuje od roku 1848. Jejích sedm členů se volí parlamentem a zastupují různé strany, regiony i jazykové komunity. Předsednictví rotuje ročně podle abecedy nebo dohody. Zahraniční média někdy neví, jak reportovat o 'prezidentovi', protože funkce je ceremoniální a každý rok jiná.",
    "about": "švýcarském kolegialním vládním systému Federální rady",
    "image_prompt": "A painterly watercolor illustration of the Swiss Federal Palace in Bern with seven equal seats arranged around a circular table in a grand chamber, vintage travel journal style"
  },
  {
    "id": "ch-t-einstein",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Lidé",
    "difficulty": 2,
    "kids": false,
    "type": "choice",
    "question": "Albert Einstein formuloval teorii relativity v Bernu. Pracoval tehdy jako vědec na univerzitě, nebo dělal něco jiného?",
    "answer": "Pracoval jako úředník na patentovém úřadě — teorii vymyslel ve volném čase",
    "distractors": [
      "Byl profesorem fyziky na Bernské univerzitě a relativitu přednášel studentům",
      "Pracoval jako hodináře učeň — a přesnost hodinových mechanismů ho inspirovala k myšlence času",
      "Byl gymnazijní učitel matematiky, kterého fyzika zajímala jen jako koníček"
    ],
    "quip_correct": "Patentový úředník přepisuje fyziku ve volném čase. Einstein: důkaz, že správné zaměstnání není podmínkou správného nápadu.",
    "quip_wrong": "Hodinářský učeň by byl poetičtější, ale nepravdivý. Správně: patentový úředník, volný čas, teorie relativity.",
    "explanation": "Einstein pracoval na bernském patentovém úřadě v letech 1902–1909. V roce 1905 — svém 'zázračném roce' — publikoval čtyři revoluční vědecké práce, včetně speciální teorie relativity a vysvětlení fotoelektrického jevu (za který dostal Nobelovu cenu). Byt, kde žil, je dnes muzeem.",
    "about": "Albertu Einsteinovi a jeho létech v Bernu",
    "image_prompt": "A painterly watercolor illustration of a modest early 20th century office with a young Einstein at a patent desk surrounded by technical drawings, with equations sketched on a notepad beside him, vintage travel journal style"
  },
  {
    "id": "ch-a-zeny-1971",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Historie",
    "difficulty": 3,
    "kids": false,
    "type": "choice",
    "question": "Švýcarsko je vzorem přímé demokracie — ale ženy dostaly právo volit teprve v roce 1971. Jak to bylo možné?",
    "answer": "O volebním právu rozhodovali hlasováním pouze muži — a ti ho ženám čtyřikrát zamítli, než v páté referendu řekli ano",
    "distractors": [
      "Švýcarská ústava výslovně zakazovala ženské hlasování až do ústavní reformy 1971",
      "Církevní zákony kantonů bránily ženám účastnit se politiky — sekularizace přišla až v 70. letech",
      "Ženy samy hlasování odmítaly v průzkumech jako nepotřebné — petice za volební právo sbírala jen málo podpisů"
    ],
    "quip_correct": "Muži hlasovali o volebním právu žen — a čtyřikrát hlasovali ne. Přímá demokracie jako zrcadlo většiny.",
    "quip_wrong": "Ústavní zákaz by byl přímočarý problém s přímočarým řešením. Skutečnost je absurdnější: muži prostě hlasovali ne.",
    "explanation": "Švýcarsko zavedlo přímou demokracii pro muže v roce 1848. Referenda o volebním právu žen proběhla v letech 1959, 1971 — teprve to druhé prošlo. Kanton Appenzell Innerrhoden odmítal ženám právo hlasovat na kantonální úrovni až do roku 1990, kdy mu to přikázal Federální soud. Ironií je, že Švýcarsko bylo první zemí, která měla ženu jako hlavu státu (1999 — Bundesrätin Ruth Dreifuss).",
    "about": "švýcarském volebním právu žen a jeho pozdním zavedení",
    "image_prompt": "A painterly watercolor illustration of Swiss women marching through a Bern street in the 1960s with banners demanding voting rights, Federal Palace visible in the background, vintage travel journal style"
  },
  {
    "id": "ch-a-onu-clen",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Historie",
    "difficulty": 3,
    "kids": false,
    "type": "choice",
    "question": "Ženeva je sídlem desítek mezinárodních organizací včetně OSN a WHO. Jak dlouho bylo samotné Švýcarsko členem OSN?",
    "answer": "Vstoupilo teprve v roce 2002 — 57 let po vzniku OSN, přestože její evropské sídlo bylo v Ženevě",
    "distractors": [
      "Bylo zakládajícím členem OSN v roce 1945 — jako neutrální hostitelská země dostalo speciální status",
      "Vstoupilo v roce 1963 po Kubánské raketové krizi, kdy se ukázalo, že neutralita nestačí",
      "Nikdy nevstoupilo — Švýcarsko je dodnes pouze pozorovatelem OSN, ne plným členem"
    ],
    "quip_correct": "OSN sídlí v Ženevě od roku 1945. Švýcarsko vstoupilo v roce 2002. Hostitel přišel na party o 57 let později než hosté.",
    "quip_wrong": "Zakládající člen s neutrálním statusem by byl švýcarský sen — ale Švýcarsko členství vědomě odmítalo. Vstoupilo až v 2002.",
    "explanation": "Vstup do OSN byl podřízen referendu — v roce 1986 Švýcaři členství odmítli (75 % proti). Teprve v roce 2002 druhé referendum schválilo vstup (54 % pro). Klíčový argument pro byl, že OSN má doložku umožňující neutrálním zemím nestrannost — Švýcarsko ji mohlo mít i jako člen.",
    "about": "švýcarském členství v OSN a paradoxu ženevského sídla",
    "image_prompt": "A painterly watercolor illustration of the Palais des Nations in Geneva with UN flags flying and a small Swiss flag being raised among them for the first time in 2002, vintage travel journal style"
  },
  {
    "id": "ch-a-eugenics",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Historie",
    "difficulty": 3,
    "kids": false,
    "type": "choice",
    "question": "Švýcarsko je zemí humanitárního práva a Červeného kříže. Přesto provádělo desetiletí program nucené sterilizace. Kdy skončil?",
    "answer": "Formálně v roce 1985 — a týkal se zejména žen z chudých poměrů, mentálně nemocných a Jenischů (kočovného etnika)",
    "distractors": [
      "Skončil v roce 1945 spolu s pádem nacismu, pod jehož vlivem byl zaveden",
      "Skončil v roce 1960 po mezinárodní kritice OSN a tlaku švýcarských lékařů",
      "Nebyl nikdy formálně ukončen zákonem — jen se přestal používat po protestech v 70. letech"
    ],
    "quip_correct": "Červený kříž v Ženevě, nucené sterilizace ve venkovských kantonech — Švýcarsko umělo oboje najednou.",
    "quip_wrong": "Rok 1945 by byl logický, ale Švýcarsko nebylo pod nacistickým vlivem — a program pokračoval dál. Správně: 1985.",
    "explanation": "Program eugeniky byl ve Švýcarsku legální od 20. let 20. století. Zvláště postiženi byli Jenischové — švýcarské kočovné etnikum — jejichž děti byly systematicky odebírány rodinám a dávány do ústavů v rámci projektu 'Kinder der Landstrasse' (1926–1973). Švýcarsko se formálně omluvilo v roce 1998 a oběti dostaly odškodnění.",
    "about": "švýcarském eugenickém programu a nucených sterilizacích",
    "image_prompt": "A painterly watercolor illustration of a somber 1950s Swiss institutional building with small windows, a humanitarian Red Cross visible on a distant building through foggy Alps, vintage travel journal style"
  },
  {
    "id": "ch-a-bunker-narod",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Kultura",
    "difficulty": 3,
    "kids": false,
    "type": "choice",
    "question": "Švýcarsko má dostatek míst v protiatomových krytech pro 114 % obyvatel — víc krytů než lidí. Co tento systém odhaluje o švýcarské neutralitě?",
    "answer": "Neutralita nikdy neznamenala bezbrannost — Švýcarsko budovalo masivní vojenskou infrastrukturu po celou studenou válku",
    "distractors": [
      "Kryty jsou pozůstatek ze druhé světové války a nikdy nebyly odstraněny, protože by to bylo příliš drahé",
      "Švýcarsko je povinno je udržovat podle smlouvy s NATO jako kompenzaci za svoji neutralitu",
      "Kryty byly postaveny soukromými firmami jako komerční investice do horské turistiky"
    ],
    "quip_correct": "Neutrální Švýcarsko: v krytu pro každého občana i pro turistu navíc. Mír jako business plán s pojistkou.",
    "quip_wrong": "Zbytky z války by nesplňovaly dnešní kapacitu pro 114 %. Šlo o aktivní budování — zákon to vyžadoval.",
    "explanation": "Zákon z roku 1963 ukládá každé obci mít dostatek krytů pro všechny obyvatele. Stavba krytů byla povinná i pro soukromé domy. Alpské pevnosti (Reduit) schovávaly armádu, munici i celé továrny uvnitř hor. Kryty mají zásoby jídla a vody na týdny, filtraci vzduchu, a pravidelně se testují. Systém byl zrušen jako povinný teprve v roce 2012.",
    "about": "švýcarské síti protiatomových krytů a vojenské infrastruktuře",
    "image_prompt": "A painterly watercolor illustration of a hidden Swiss mountain fortress entrance disguised as a barn door, with Alpine scenery above and a cross-section hint of tunnels beneath, vintage travel journal style"
  },
  {
    "id": "ch-a-papezska-garda",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Historie",
    "difficulty": 3,
    "kids": false,
    "type": "choice",
    "question": "Papežskou gardu ve Vatikánu tvoří výhradně Švýcaři. Proč právě Švýcaři — a jak tato tradice vznikla?",
    "answer": "Ve středověku byli švýcarští žoldnéři nejobávanější pěchotou Evropy — pronajímali se všem, kdo zaplatil, a Papežové za ně platili nejlépe",
    "distractors": [
      "Švýcarsko je neutrální, takže švýcarský voják nemá politické loajality — perfektní pro nestrannou ochranu",
      "Tradice vznikla z diplomatické smlouvy z roku 1521 jako kompenzace za náboženské útočiště pro švýcarské protestanty",
      "Jan Pavel II. je zavedl v 80. letech jako symbol evropské jednoty po vzoru napoleonské gardy"
    ],
    "quip_correct": "Švýcaři: neutrální v politice, vynikající v boji. Papeži platili nejlépe, tak guarda je švýcarská dodnes.",
    "quip_wrong": "Neutralita by byla poetické vysvětlení — ale žoldnéřský trh 15. století byl prozaičtější. Zaplatil ten, kdo nejvíc.",
    "explanation": "Švýcarské kantony ve středověku exportovaly žoldnéře jako hlavní exportní artikl — bylo to doslova národní hospodářství. Papežská garda vznikla v roce 1506 a přežila dodnes jako ceremoniální jednotka. Švýcarský stát mezitím žoldnéřskou službu zakázal (1874) — výjimku tvoří právě Vatikán. Nové gardisty musí přijmout sám papež.",
    "about": "švýcarské papežské gardě a žoldnéřské historii Švýcarska",
    "image_prompt": "A painterly watercolor illustration of Swiss Guards in their colorful Renaissance uniforms with halberds standing at the Vatican gate, St. Peter's dome visible behind them, vintage travel journal style"
  },
  {
    "id": "ch-a-cokolada-objev",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Jídlo",
    "difficulty": 3,
    "kids": false,
    "type": "choice",
    "question": "Švýcarská mléčná čokoláda dobyla svět. Ale kakao ve Švýcarsku neroste — kde Švýcarsko bralo surovinu, a co to znamenalo historicky?",
    "answer": "Z kolonií — přes obchodní sítě Belgie, Británie a Francie, které exploatovaly plantáže v Africe a Americe",
    "distractors": [
      "Kakao dováželo přímo z Mexika díky přímé obchodní smlouvě ze 17. století",
      "Pěstovalo ho v sklenících v kantonu Ticino — italské klima to umožňovalo",
      "Nakupovalo ho od Španělska, které ho monopolně kontrolovalo přes jihoamerické kolonie"
    ],
    "quip_correct": "Švýcarská čokoláda, africké kakao, koloniální plantáže. Neutrální Švýcarsko profitovalo z kolonialismu bez vlastních kolonií.",
    "quip_wrong": "Španělský monopol byl zlomen v 17. století. Švýcarsko se zásobovalo přes koloniální sítě jiných zemí — nepřímo, ale efektivně.",
    "explanation": "Švýcarsko nikdy nemělo kolonie, ale svůj čokoládový průmysl budovalo na kakau z Pobřeží slonoviny, Ghany a Brazílie — tedy z oblastí ovládaných jinými koloniálními mocnostmi, kde se pracovalo podmínkami blízkými otroctví. Dnes švýcarský čokoládový průmysl čelí tlaku za 'fair trade' certifikaci a transparentnost dodavatelských řetězců.",
    "about": "koloniálních zdrojích švýcarského čokoládového průmyslu",
    "image_prompt": "A painterly watercolor illustration of a split scene: a Swiss chocolate factory with happy workers on one side, and a colonial cacao plantation in West Africa on the other, connected by a shipping route on an old map, vintage travel journal style"
  },
  {
    "id": "ch-a-referendum-paradox",
    "cc": "ch",
    "country": "Švýcarsko",
    "section": "Kultura",
    "difficulty": 3,
    "kids": false,
    "type": "choice",
    "question": "Švýcarsko pořádá nejvíce referend na světě — hlasuje se o všem. Jaký nechtěný paradox tento systém přináší?",
    "answer": "Bohatší a vzdělanější vrstvy se referend účastní výrazně více — přímá demokracie fakticky nadreprezentuje většinovou a starší populaci",
    "distractors": [
      "Referenda jsou tak častá, že se občané unaví a účast klesá pod 20 % — výsledky tak určuje malá menšina",
      "Výsledky referend jsou závazné, ale parlament je může ignorovat — systém je tedy jen poradní, ne skutečně přímý",
      "Menšiny mají právo veta na každé referendum — takže každý zákon může zablokovat i 1 % obyvatel"
    ],
    "quip_correct": "Přímá demokracie pro všechny — ale ne všichni chodí. Bohatší, starší, vzdělanější: jejich hlas váží víc v praxi než v teorii.",
    "quip_wrong": "20% účast by byla švýcarská krize. Účast bývá 40–60 % — ale rozložení hlasujících je klíčový problém.",
    "explanation": "Výzkumy švýcarských politologů ukazují, že v průměrném referendu hlasuje o 20 procentních bodů více vysokoškolsky vzdělaných než těch se základním vzděláním. V kantonech s elektronickým hlasováním se účast zvýšila, ale socioekonomická nerovnost přetrvává. To je jeden z hlavních argumentů kritiků přímé demokracie jako systému.",
    "about": "paradoxech švýcarské přímé demokracie a nerovné účasti",
    "image_prompt": "A painterly watercolor illustration of a Swiss voting station with a ballot box, some urns full and some nearly empty, people of different ages and dress entering, vintage travel journal style"
  }
];

const existing = JSON.parse(fs.readFileSync(FILE, "utf8"));
const existingIds = new Set(existing.map(q => q.id));
const toAdd = NEW_QUESTIONS.filter(q => {
  if (existingIds.has(q.id)) { console.warn("  ! Přeskočeno (duplikát ID):", q.id); return false; }
  return true;
});
fs.writeFileSync(FILE, JSON.stringify([...existing, ...toAdd], null, 1));
const k = toAdd.filter(q => q.kids).length;
const t = toAdd.filter(q => !q.kids && q.difficulty <= 2).length;
const a = toAdd.filter(q => !q.kids && q.difficulty >= 3).length;
console.log(`Hotovo: přidáno ${toAdd.length} otázek (děti:${k}, puberťáci:${t}, dospělí:${a}). Celkem: ${existing.length + toAdd.length}`);
