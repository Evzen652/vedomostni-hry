"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "cz.json");

// Zahozeno (3):
// cz-k-becherovka   — alkohol pro 8leté; vedle pivních lázní (kids) jsou dvě alkohol. témata v jednom pásmu
// cz-k-jezirko-cerny — třetí šumavská otázka (cz-q-sumava + cz-k-sumava již existují)
// cz-a-skola-hrou-komensky-paradox — druhá otázka o Komenském (cz-q-komensky existuje)

const NEW_QUESTIONS = [
// DĚTI (6)
{
  "id": "cz-k-medved",
  "cc": "cz", "country": "Česká republika", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "V českých pohádkách je medvěd oblíbená postava. Ale žijí medvědi i ve skutečné české přírodě?",
  "answer": "Jen vzácně — občas přijdou ze Slovenska, ale v Česku trvale nežijí",
  "distractors": ["Ano, v každém větším lese jich žijí stovky", "Ne, v Česku nikdy nežili — jen v pohádkách", "Ano, ale jen v zoo — v přírodě jsou zakázaní"],
  "quip_correct": "Medvěd v Česku: vzácný host ze Slovenska. V pohádkách ho máme každý den, v lese skoro nikdy.",
  "quip_wrong": "Stovky medvědů v každém lese by vyřešily turistiku, ale bohužel ne.",
  "explanation": "Poslední stálá populace medvědů v Česku vyhynula v 19. století. Dnes se občas zatoulají jedinci z karpatské populace přes slovenské hranice — taková návštěva vždy vzbudí mediální zájem.",
  "about": "medvědech v české přírodě",
  "image_prompt": "A painterly watercolor illustration of a brown bear wandering through a misty Bohemian forest with tall spruce trees, vintage travel journal style"
},
{
  "id": "cz-k-chalupa",
  "cc": "cz", "country": "Česká republika", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Spousta českých rodin má vlastní chalupu nebo chatu na venkově. Co tam typicky dělají o víkendu?",
  "answer": "Odpočívají v přírodě — zahradničí, opékají špekáčky, chodí na houby",
  "distractors": ["Pracují na polích jako farmáři", "Pořádají velké hlučné diskotéky", "Studují a připravují se na školu"],
  "quip_correct": "Chalupa: české národní útočiště. Špekáček na ohni, houby v košíku, žádný šéf — dokonalý víkend.",
  "quip_wrong": "Diskotéka na chalupě? Soused by se zbláznil. Správně: příroda, oheň, houby.",
  "explanation": "Chalupářství se rozvinulo v době komunismu — protože cestování do zahraničí bylo omezené, Češi investovali do vlastního zázemí na venkově. Dnes má vlastní chalupu nebo chatu přibližně každá čtvrtá česká domácnost — jeden z nejvyšších poměrů v Evropě.",
  "about": "české chalupářské kultuře",
  "image_prompt": "A painterly watercolor illustration of a cozy Czech countryside cottage with a garden, campfire with sausages on sticks, and a forest in the background, vintage travel journal style"
},
{
  "id": "cz-k-krtek",
  "cc": "cz", "country": "Česká republika", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Krteček je slavná česká kreslená postavička, kterou znají děti po celém světě. Jak vypadá?",
  "answer": "Je to malý černý krtek s bílým bříškem a velkým nosem",
  "distractors": ["Je to velký hnědý medvěd s červenou čepicí", "Je to malá zelená žabka s brýlemi", "Je to bílý zajíček s modrýma ušima"],
  "quip_correct": "Malý, černý, bez jediného slova — a slavný po celém světě. Krteček dokázal to, co mnoho jiných ne.",
  "quip_wrong": "Medvěd s čepicí je jiný příběh. Správně: malý černý krtek s bílým bříškem.",
  "explanation": "Krtečka nakreslil Zdeněk Miler v roce 1956 — původně pro výukový animovaný film o zpracování lnu. Krteček záměrně nemluví, aby byl srozumitelný dětem po celém světě bez překladu. Jeho příběhy se přeložily do více než 80 zemí.",
  "about": "Krtečkovi a jeho tvůrci Zdeňku Milerovi",
  "image_prompt": "A painterly watercolor illustration of a small cheerful cartoon mole with white belly digging in a colorful Czech meadow with flowers and a blue sky, vintage travel journal style"
},
{
  "id": "cz-k-olomoucky-tvaruzek",
  "cc": "cz", "country": "Česká republika", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Olomoucký tvarůžek je slavný moravský sýr. Proč ho ne každý snese v místnosti?",
  "answer": "Velmi silně zapáchá — je to jeden z nejzápachovějších sýrů na světě",
  "distractors": ["Je tak ostrý, že pálí jazyk jako chilli", "Je tak tvrdý, že se musí krájet pilou", "Je tak lepkavý, že se přilepí ke všemu"],
  "quip_correct": "Olomoucký tvarůžek: sýr, který oznámí svůj příchod dřív, než ho vidíš. Milovníci přísahají, že je to pochoutka.",
  "quip_wrong": "Pilou na sýr — to by bylo originální. Správně: tvarůžek je legendárně zapáchající.",
  "explanation": "Olomoucké tvarůžky se vyrábějí od 15. století a patří mezi nejstarší chráněná česká označení původu v EU. Jejich charakteristický zápach pochází z bakterie Brevibacterium linens, stejné jako u Limburger nebo Munster sýrů. Přezdívá se jim také 'tvargle'.",
  "about": "olomouckém tvarůžku a jeho nezaměnitelném zápachu",
  "image_prompt": "A painterly watercolor illustration of small round golden Olomouc cheese rounds on a wooden board with dark bread and Czech beer in a traditional Moravian tavern, vintage travel journal style"
},
{
  "id": "cz-k-orloj",
  "cc": "cz", "country": "Česká republika", "section": "Místa",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Pražský orloj na Staroměstském náměstí jsou slavné hodiny. Co se stane každou celou hodinu?",
  "answer": "Otočí se okénka a vyjede průvod dvanácti apoštolů",
  "distractors": ["Ozve se hlasitý výstřel z děla", "Z hodin vyletí živí holubi", "Hodiny zahrají českou hymnu"],
  "quip_correct": "Dvanáct apoštolů každou hodinu — Prahu to baví od roku 1410. Turisté to točí na video, apoštolé se neúnavně točí dál.",
  "quip_wrong": "Dělo by bylo výrazné, ale apoštolé jsou tišší a starší. Správně: průvod dvanácti apoštolů.",
  "explanation": "Pražský orloj byl poprvé zmíněn v roce 1410 a patří k nejstarším dosud funkčním astronomickým hodinám na světě. Ukazuje nejen čas, ale i polohu Slunce a Měsíce a fáze Měsíce. Figurky apoštolů byly přidány v 15. a 16. století.",
  "about": "pražském orloji a průvodu apoštolů",
  "image_prompt": "A painterly watercolor illustration of the Prague Astronomical Clock on Old Town Square with its colorful astronomical dials and the apostle figures visible in the windows, vintage travel journal style"
},
{
  "id": "cz-k-pivni-lazne",
  "cc": "cz", "country": "Česká republika", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "V Česku existují lázně, kde se místo vody koupete v pivu. Co to má dělat s vaší kůží?",
  "answer": "Kůže se prý vyhlazuje díky kvasinkám a chmelům v pivu",
  "distractors": ["Kůže zhnědne jako opálená na slunci", "Člověk po koupeli voní jako pivnice celý den", "Koupel změní barvu vlasů na zlatou"],
  "quip_correct": "Pivní koupel: Česko spojilo relaxaci s národním nápojem. Chmel pro tělo, pivo vedle vany pro žízeň.",
  "quip_wrong": "Zlaté vlasy by byl vedlejší efekt hodný patentu. Správně: kvasnice a chmel prý vyhlazují kůži.",
  "explanation": "Pivní lázně existují v Česku od 90. let a jsou populárním turistickým zážitkem zejména v Chodové Plané a Praze. Vědecké důkazy jsou omezené, zábava zaručená.",
  "about": "českých pivních lázních",
  "image_prompt": "A painterly watercolor illustration of a wooden bathtub filled with dark beer foam in a cozy Czech spa with hops and barley decorations on the walls, vintage travel journal style"
},

// PUBERŤÁCI (8)
{
  "id": "cz-t-pivni-stat",
  "cc": "cz", "country": "Česká republika", "section": "Jídlo",
  "difficulty": 1, "kids": false, "type": "choice",
  "question": "Češi drží světový rekord ve spotřebě piva na osobu. Jak si stojí ve srovnání s dalšími pivními národy — Němci, Iry, Belgičany?",
  "answer": "Vedou daleko před všemi — přes 130 litrů na hlavu ročně, Němci jsou druzí se znatelným odstupem",
  "distractors": ["Zhruba stejně jako Němci — obě země jsou na špici těsně vedle sebe", "Méně než Irové — ti vedou díky pub kultuře", "Méně než Belgičané — ti mají nejvíc druhů piva na světě"],
  "quip_correct": "Přes 130 litrů na hlavu — a to počítají i kojence a abstinenty. Češi prostě vedou.",
  "quip_wrong": "Němci jsou blízko, ale ne dost blízko. Češi drží zlatou medaili v pivu konzistentně přes 30 let.",
  "explanation": "Česká republika vede světový žebříček spotřeby piva na osobu nepřetržitě od 90. let. Přitom Česko nevyrábí zdaleka největší celkové množství — to dominují USA, Čína a Brazílie. Jde čistě o spotřebu na hlavu.",
  "about": "české spotřebě piva a světovém rekordu",
  "image_prompt": "A painterly watercolor illustration of a traditional Czech pub interior with rows of frothy beer mugs on a long wooden table and locals in animated conversation, vintage travel journal style"
},
{
  "id": "cz-t-franz-kafka",
  "cc": "cz", "country": "Česká republika", "section": "Kultura",
  "difficulty": 2, "kids": false, "type": "choice",
  "question": "Franz Kafka psal v němčině, byl Žid, celý život žil v Praze a na smrtelné posteli žádal, aby byly jeho rukopisy spáleny. Co se místo toho stalo?",
  "answer": "Jeho přítel Max Brod rukopisy zachránil a vydal — navzdory Kafkově přání",
  "distractors": ["Rukopisy skutečně shořely, ale dřív je Kafka opsál do deníku", "Rodina rukopisy schovala a vydala je až po druhé světové válce", "Kafka si to rozmyslel a rukopisy vydal sám krátce před smrtí"],
  "quip_correct": "Kafka chtěl spálit vše. Brod odmítl. Světová literatura má Broda za co poděkovat — i když Kafka by nesouhlasil.",
  "quip_wrong": "Kafka byl v tom důsledný — ale Brod byl důslednější v opaku. Rukopisy zachránil proti přání autora.",
  "explanation": "Max Brod po Kafkově smrti v roce 1924 vydal Proces, Zámek i Ameriku — romány, které Kafka nikdy nedokončil. Spor o Kafkovu pozůstalost pokračoval i po Brodově smrti: jeho archiv skončil po letech soudních sporů v Tel Avivu.",
  "about": "Franzi Kafkovi a jeho zachráněných rukopisech",
  "image_prompt": "A painterly watercolor illustration of a Prague Jewish Quarter alley at dusk with a writer's desk visible through a lit window, manuscripts piled high, vintage travel journal style"
},
{
  "id": "cz-t-cesky-raj",
  "cc": "cz", "country": "Česká republika", "section": "Příroda",
  "difficulty": 1, "kids": false, "type": "choice",
  "question": "Český ráj je chráněná krajinná oblast plná pískovcových věží. Proč má tak zvláštní název — ráj?",
  "answer": "Název vymysleli turisté v 19. století — krajina jim připadala tak krásná, že ji přirovnali k ráji",
  "distractors": ["Název pochází z latinského slova pro pískovce — 'paradisus saxorum'", "Pojmenoval ho Karel IV. po svém oblíbeném místě pro lov", "Vznikl z místního dialektu — 'raj' znamenalo v prastarém jazyce 'kopec'"],
  "quip_correct": "Turisté v 19. století viděli skalní věže a řekli: ráj. Marketing před Instagramem existoval.",
  "quip_wrong": "Karel IV. byl zaneprázdněný jinde. Správně: název dali oblasti romantičtí turisté 19. století.",
  "explanation": "Název Český ráj pochází z konce 19. století, kdy oblast začali navštěvovat první organizovaní turisté z Prahy. Dnes je Český ráj prvním geoparkem v Česku uznaným UNESCO.",
  "about": "Českém ráji a původu jeho názvu",
  "image_prompt": "A painterly watercolor illustration of dramatic sandstone rock towers rising from a green forest in Český ráj with a ruined castle on the horizon, vintage travel journal style"
},
{
  "id": "cz-t-sparta-slavia",
  "cc": "cz", "country": "Česká republika", "section": "Sport",
  "difficulty": 1, "kids": false, "type": "choice",
  "question": "Sparta Praha a Slavia Praha jsou největší rivaly v českém fotbalu. Co je zajímavé na jejich původu z konce 19. století?",
  "answer": "Oba kluby vznikly v Praze v rozmezí dvou let — a od začátku si konkurovaly jako studentský vs. dělnický klub",
  "distractors": ["Oba vznikly jako jeden klub a rozdělily se po hádce o barvy dresů", "Sparta vznikla v Brně a přestěhovala se do Prahy až po první světové válce", "Slavia původně hrála ragby, fotbal přijala až po fúzi s jiným klubem"],
  "quip_correct": "Praha, konec 19. století, dva kluby, jedna řeka, věčná rivalita. A pořád to platí.",
  "quip_wrong": "Hádka o barvy dresů by byla epická, ale nepravdivá. Správně: od začátku dvě odlišné identity.",
  "explanation": "Slavia Praha vznikla v roce 1892, Sparta Praha v roce 1893. Slavia bývala spojována s intelektuální a studentskou vrstvou, Sparta s dělnickým prostředím. Derby mezi nimi se přezdívá 'S–S derby' a patří k nejsledovanějším sportovním událostem v zemi.",
  "about": "pražském fotbalovém derby Sparta vs. Slavia",
  "image_prompt": "A painterly watercolor illustration of two contrasting football jerseys — red-white Slavia and red Sparta — hanging side by side on a Prague bridge railing, vintage travel journal style"
},
{
  "id": "cz-t-lidice",
  "cc": "cz", "country": "Česká republika", "section": "Historie",
  "difficulty": 2, "kids": false, "type": "choice",
  "question": "Obec Lidice byla v roce 1942 nacisty srovnána se zemí jako odveta za atentát na Heydricha. Co se stalo s názvem Lidice ve světě po válce?",
  "answer": "Desítky měst po celém světě přijaly název Lidice nebo ho připojily ke svému — jako gesto solidarity",
  "distractors": ["Název byl mezinárodně zakázán, aby se nezneužíval pro politické účely", "OSN prohlásilo Lidice za mezinárodní symbol, ale žádné město název nepřijalo", "Pouze jedno město v Mexiku přijalo název — jinak se solidarita omezila na sbírky"],
  "quip_correct": "Nacisté chtěli Lidice vymazat z mapy. Místo toho je mapa zaplavila — v USA, Mexiku, Brazílii i jinde.",
  "quip_wrong": "Zákaz názvu by byl pravý opak toho, co se stalo. Svět reagoval opačně — přijal ho za svůj.",
  "explanation": "Po vyhlazení Lidic v červnu 1942 se rozšířila celosvětová kampaň solidarity 'Lidice shall live'. Název přijalo například San Jerónimo Aculco v Mexiku, několik měst v USA i Brazil v Illinois. Dnes jsou Lidice mezinárodním symbolem nacistické zvůle.",
  "about": "Lidicích a jejich světovém ohlasu po nacistickém vyhlazení",
  "image_prompt": "A painterly watercolor illustration of the Lidice memorial rose garden and museum with the reconstructed village outline visible in the landscape, vintage travel journal style"
},
{
  "id": "cz-t-skoda-auto",
  "cc": "cz", "country": "Česká republika", "section": "Kultura",
  "difficulty": 2, "kids": false, "type": "choice",
  "question": "Škoda Auto je nejstarší stále fungující automobilka v Evropě. Kde ale Škoda vznikla a co původně vyráběla?",
  "answer": "V Mladé Boleslavi v roce 1895 — nejdřív jako výrobna jízdních kol",
  "distractors": ["V Plzni jako součást Škodových závodů na výrobu zbraní", "Ve Vídni jako dílna pro habsburský dvůr vyrábějící kočáry", "V Praze jako servisní stanice pro francouzské automobily Peugeot"],
  "quip_correct": "Kola, pak auta — Škoda v Mladé Boleslavi jela odjakživa. Jen se přidaly motory.",
  "quip_wrong": "Vídeň a habsburský dvůr by byl elegantní původ, ale nepravdivý. Správně: jízdní kola, Mladá Boleslav.",
  "explanation": "Václav Laurin a Václav Klement začali v roce 1895 vyrábět jízdní kola pod značkou Slavia. V roce 1905 přijel první automobil. Název Škoda pochází z převzetí firmy průmyslníkem Emiliem Škodou z Plzně v roce 1925. Dnes je součástí skupiny Volkswagen.",
  "about": "historii automobilky Škoda a jejích počátcích",
  "image_prompt": "A painterly watercolor illustration of a late 19th century bicycle workshop in Mladá Boleslav with wooden frames, tools hanging on walls, and early prototype vehicles, vintage travel journal style"
},
{
  "id": "cz-t-cesky-jazyk-obtiznost",
  "cc": "cz", "country": "Česká republika", "section": "Jazyk",
  "difficulty": 2, "kids": false, "type": "choice",
  "question": "Čeština je pro cizince notoricky obtížná. Která vlastnost češtiny mate nejvíc anglicky mluvící studenty?",
  "answer": "Sedm pádů — stejné slovo mění koncovku podle toho, jakou roli ve větě plní",
  "distractors": ["Háčky a čárky nad písmeny, které zcela mění výslovnost", "Délka slov — česká slova jsou v průměru dvakrát delší než anglická", "Neexistence slova 'ano' — Češi říkají 'jo' nebo 'no', což Angličané čtou jako 'ne'"],
  "quip_correct": "Sedm pádů: češtině nestačí, kdo jsi — chce vědět, co děláš, komu to děláš a čím to děláš.",
  "quip_wrong": "Háčky jsou frustrující, ale pády vás česky teprve opravdu překvapí.",
  "explanation": "Angličtina má jen dva zbytky pádového systému (I vs. me, he vs. him). Čeština má sedm pádů a každé podstatné jméno, přídavné jméno i zájmeno se skloňuje zvlášť — navíc s různými vzory. Americký lingvistický institut řadí češtinu mezi čtyři nejtěžší jazyky pro anglické mluvčí.",
  "about": "obtížnosti českého jazyka pro cizince",
  "image_prompt": "A painterly watercolor illustration of a blackboard covered in Czech declension tables with a confused foreign student looking at it, Prague rooftops visible through the classroom window, vintage travel journal style"
},
{
  "id": "cz-t-semtex",
  "cc": "cz", "country": "Česká republika", "section": "Historie",
  "difficulty": 2, "kids": false, "type": "choice",
  "question": "Semtex je výbušnina vyvinutá v Česku, dnes používaná armádami i teroristy po celém světě. Jak dostala své jméno?",
  "answer": "Podle obce Semtín u Pardubic, kde se vyráběla",
  "distractors": ["Podle chemika Semtala, který ji vynalezl v 50. letech", "Zkratka z 'Sérum Explosif Tchécoslovaque'", "Pojmenovala ji britská armáda po prvním testu v Semtu v Afghánistánu"],
  "quip_correct": "Semtín u Pardubic: tichá obec, světoznámé jméno. Místní to zpočátku nevěděli — výroba byla tajná.",
  "quip_wrong": "Chemik Semtal je vymyšlená postava. Správně: název pochází z obce Semtín u Pardubic.",
  "explanation": "Semtex byl vyvinut v 60. letech v závodě Explosia v Semtíně. Původně se vyvážel jako civilní trhavina — mimo jiné do Libye, kde skončil v rukou teroristů. Použit byl při bombovém útoku na let Pan Am 103 nad Lockerbie v roce 1988. Po roce 1989 Česko zpřísnilo export.",
  "about": "výbušnině Semtex a jejím původu v Pardubicích",
  "image_prompt": "A painterly watercolor illustration of an industrial Czech town with chemical factory chimneys reflected in a river, grey postwar architecture, vintage travel journal style"
},

// DOSPĚLÍ (7)
{
  "id": "cz-a-heydrich-sepse",
  "cc": "cz", "country": "Česká republika", "section": "Historie",
  "difficulty": 3, "kids": false, "type": "choice",
  "question": "Atentát na Reinharda Heydricha v roce 1942 provedli parašutisté s pistolemi a granátem. Granát explodoval těsně vedle auta — ale Heydrich zemřel o týden později. Co ho skutečně zabilo?",
  "answer": "Sepse — střepiny granátu vnesly do rány žíně z čalounění auta plné bakterií",
  "distractors": ["Střela z pistole, která pronikla do plic a způsobila vnitřní krvácení", "Přímý zásah granátem, který poškodil páteř a způsobil ochrnutí", "Chirurgická chyba při operaci v pražské nemocnici"],
  "quip_correct": "Nejmocnějšího muže Třetí říše po Hitlerovi nezabila kulka — zabily ho mikroby z koňské žíně.",
  "quip_wrong": "Kulky ho zasáhly, ale nezabily. Správná odpověď je paradoxní: infekce z čalounění auta.",
  "explanation": "Jozef Gabčík a Jan Kubiš zaútočili 27. května 1942. Heydrich zemřel 4. června na septikémii způsobenou bakteriemi ze střepinami vnesených zbytků čalounění — za války bylo čalounění plněno koňskými žíněmi, ideálním médiem pro bakterie. Moderní antibiotika by ho s největší pravděpodobností zachránila.",
  "about": "atentátu na Heydricha a příčině jeho smrti",
  "image_prompt": "A painterly watercolor illustration of a 1942 Prague street corner near Holešovice with a tram curve, cobblestones, and dramatic wartime atmosphere, vintage travel journal style"
},
{
  "id": "cz-a-komunismus-kostely",
  "cc": "cz", "country": "Česká republika", "section": "Historie",
  "difficulty": 3, "kids": false, "type": "choice",
  "question": "Česko je nejateističtější zemí EU — přes 60 % obyvatel se nehlásí k žádné víře. Komunismus to ale nezpůsobil. Co za to může?",
  "answer": "Sekularizace začala pod Josefem II. v 18. století — komunismus jen zdědil tradici, která tu byla 200 let před ním",
  "distractors": ["Reformace a husitství v 15. století způsobily, že Čechy nikdy nedůvěřovaly Římu", "Osvícenství dorazilo do Čech dříve než kamkoliv jinam v Evropě díky obchodním cestám", "Josefínský patent z roku 1781 přikázal rušit kláštery a výuka náboženství byla od té doby zakázána"],
  "quip_correct": "Komunismus přišel, podíval se na české ateisty a řekl: tady máme to hotové. Práci mu usnadnil Josef II.",
  "quip_wrong": "Husitství je bližší, ale sekularizace jako státní projekt — to byl Josef II. a jeho reformy 18. století.",
  "explanation": "Josef II. zrušil přes 700 klášterů, zavedl náboženskou toleranci a omezil vliv církve na vzdělání. Čechy navíc prošly nucenou rekatolizací po Bílé hoře (1620), která zanechala hlubokou nedůvěru k institucionální církvi. Výsledkem byl postupný odklon, který komunismus pouze prohloubil.",
  "about": "českém ateismu a jeho historických kořenech",
  "image_prompt": "A painterly watercolor illustration of a Baroque Czech church with its doors closed and cobwebbed, with a modern secular city life bustling indifferently around it, vintage travel journal style"
},
{
  "id": "cz-a-benes-dekrety-nemci",
  "cc": "cz", "country": "Česká republika", "section": "Historie",
  "difficulty": 3, "kids": false, "type": "choice",
  "question": "Po druhé světové válce bylo z Československa vyhnáno přes 2,5 milionu Němců. Co je méně známé: jak se k tomu postavili samotní Češi v té době?",
  "answer": "Naprostá většina Čechů odsun schválila — včetně demokratické opozice a exilové vlády, ne jen komunisté",
  "distractors": ["Čechům byl odsun vnucen Spojeneckými mocnostmi proti vůli většiny obyvatel", "Společnost byla rozdělená — zhruba polovina Čechů odsun odmítala jako nehumánní", "Odsun provedli výhradně komunisté — demokraté se od něj distancovali a odmítli ho schválit"],
  "quip_correct": "Odsun nebyl komunistický projekt — byl to národní konsenzus. A to komplikuje příběh.",
  "quip_wrong": "Spojenci ho rozhodně neplánovali sami. Beneš odsun aktivně prosazoval ještě z londýnského exilu.",
  "explanation": "Prezident Beneš prosazoval odsun sudetských Němců už od roku 1943 v Londýně. Postupimská konference 1945 ho mezinárodně schválila. Tragické jsou zejména 'divoké odsunové' fáze v létě 1945, kdy docházelo k násilí bez jakéhokoli právního rámce. Toto tabu se v české historiografii prolomilo až v 90. letech.",
  "about": "odsunu sudetských Němců a jeho dobovém přijetí v Česku",
  "image_prompt": "A painterly watercolor illustration of a grey 1945 Central European train station with long queues of displaced people carrying bundles, documentary watercolor style, vintage travel journal style"
},
{
  "id": "cz-a-vaclav-havel-absurdita",
  "cc": "cz", "country": "Česká republika", "section": "Lidé",
  "difficulty": 3, "kids": false, "type": "choice",
  "question": "Václav Havel byl dramatik píšící o absurditě systému — a pak se sám stal prezidentem. Co bylo na jeho prezidentství paradoxní?",
  "answer": "Musel řídit stát, jehož fungování celý život ironizoval — a přiznal, že moc ho postupně deformovala i jeho samého",
  "distractors": ["Jako prezident nemohl psát divadelní hry — ústava mu zakazovala literární činnost", "Odmítl přijmout hradní uniformu a chodil na státní akce v džínách, což vedlo k diplomatickým krizím", "Prohlásil, že ho prezidentství zklamalo, a dvakrát podal demisi, která mu nebyla přijata"],
  "quip_correct": "Dramatik absurdity se stal prezidentem. Pak napsal, že moc ho mění — přesně jako v jeho hrách.",
  "quip_wrong": "Džíny na Hradě jsou legenda, ale paradox je hlubší. Havel psal o deformující síle moci — a pak ji zažil na vlastní kůži.",
  "explanation": "Havel v eseji 'Dálkový výslech' (1986) varoval před korupční silou moci. Po roce 1989 postupně přiznal, že i on podlehl logice instituce — například při sporech o mečiarovské Slovensko nebo v otázce bombardování Jugoslávie 1999. Literárními vědci je toto vnímáno jako živý paradox jeho díla.",
  "about": "Václavu Havlovi a paradoxu jeho prezidentství",
  "image_prompt": "A painterly watercolor illustration of Prague Castle at dusk with a silhouette of a thoughtful figure at a writing desk in a lit window, vintage travel journal style"
},
{
  "id": "cz-a-trabant-ekologie",
  "cc": "cz", "country": "Česká republika", "section": "Historie",
  "difficulty": 3, "kids": false, "type": "choice",
  "question": "Sametová revoluce v listopadu 1989 přinesla svobodu — ale také ekologický problém, který byl do té doby tajný. Co odhalily první svobodné průzkumy?",
  "answer": "Severní Čechy patřily k nejznečištěnějším místům na Zemi — komunismus ničil životní prostředí daleko hůř než kapitalismus",
  "distractors": ["Jaderná elektrárna Dukovany tajně vypouštěla radioaktivní vodu do Jihlavy 20 let", "Armádní chemické sklady kontaminovaly podzemní vodu pod třetinou území Čech", "Praha měla nejhorší kvalitu ovzduší v Evropě — horší než Londýn v době průmyslové revoluce"],
  "quip_correct": "Komunismus hlásal péči o přírodu. Severní Čechy po něm vypadaly jako měsíc — ale bez romantiky.",
  "quip_wrong": "Dukovany je citlivé téma, ale největší odhalení bylo vizuálnější — devastace krajiny severních Čech.",
  "explanation": "Ústecký a Liberecký kraj se po roce 1989 ukázaly jako ekologická katastrofa — kyselé deště z uhelných elektráren zničily lesy v Krušných horách natolik, že krajina připomínala měsíční povrch. Škody se odstraňují dodnes; celkové náklady na ekologické čistky se odhadují na stovky miliard korun.",
  "about": "ekologické devastaci severních Čech po komunismu",
  "image_prompt": "A painterly watercolor illustration of the devastated Ore Mountains landscape with skeletal dead trees, smokestacks in the distance, and acid rain clouds, contrasted with a tiny green seedling in the foreground, vintage travel journal style"
},
{
  "id": "cz-a-jan-palach",
  "cc": "cz", "country": "Česká republika", "section": "Historie",
  "difficulty": 3, "kids": false, "type": "choice",
  "question": "Jan Palach se upálil v lednu 1969 na protest proti sovětské okupaci. Co bylo méně známé: jak bezprostředně reagovala česká veřejnost?",
  "answer": "Stovky tisíc lidí se zúčastnily pohřbu — ale politicky se nic nezměnilo; normalizace pokračovala",
  "distractors": ["Palachův čin spustil vlnu stávek, která přinutila komunisty zahájit jednání se Sověty", "Veřejnost reagovala s nechápavým odstupem — média byla cenzurovaná a zpráva se šířila pomalu", "Komunistická strana okamžitě odsoudila Palacha jako agenta CIA a zatkla jeho rodinu"],
  "quip_correct": "Stovky tisíc lidí u rakve. A pak — normalizace dál. Palach obětoval vše; systém to vstřebal.",
  "quip_wrong": "Stávky by Sověty nezastavily, a nestaly se. Pohřeb byl masový, politický efekt minimální.",
  "explanation": "Palachův pohřeb 25. ledna 1969 byl jednou z největších veřejných manifestací v dějinách Československa. V roce 1974 byl Palachův hrob zrušen, ostatky přemístěny, aby se nestal místem pietních aktů. Vráceny byly až v roce 1990.",
  "about": "Janu Palachovi a okamžité reakci české společnosti",
  "image_prompt": "A painterly watercolor illustration of Wenceslas Square in a grey January 1969 with a massive silent crowd in winter coats stretching into the distance, vintage travel journal style"
},
{
  "id": "cz-a-sametova-rozvod",
  "cc": "cz", "country": "Česká republika", "section": "Historie",
  "difficulty": 3, "kids": false, "type": "choice",
  "question": "Rozdělení Československa v roce 1993 se říká 'sametový rozvod'. Co je méně známý fakt o tom, kdo ho vlastně chtěl?",
  "answer": "Průzkumy ukazovaly, že majorita Čechů i Slováků rozvod nechtěla — rozhodli ho politici, ne občané",
  "distractors": ["Rozdělení vyžadoval Evropský parlament jako podmínku přijetí do EU", "Slovenská strana rozdělení iniciovala a česká ho přijala jako nevyhnutelné", "Referendum se konalo — a 58 % Slováků pro rozdělení hlasovalo"],
  "quip_correct": "Sametový rozvod bez referenda: Češi a Slováci se rozvedli, aniž by byli řádně dotázáni. Klaus a Mečiar to zařídili za ně.",
  "quip_wrong": "Referendum se nekonalo — a to je právě ten paradox. Politici rozhodli za lid, který to většinově nechtěl.",
  "explanation": "Průzkumy z roku 1992 ukazovaly, že většina obyvatel obou zemí preferovala zachování společného státu. Klaus a Mečiar se dohodli na rozdělení bez přímé konzultace s voliči. Dodnes je to předmětem historické debaty: byl to výsledek demokratického procesu, nebo politické svévole?",
  "about": "sametovém rozvodu Československa a roli občanů",
  "image_prompt": "A painterly watercolor illustration of a symbolic border post between Czech and Slovak republics in winter 1993 with two sets of people on each side waving goodbye sadly, vintage travel journal style"
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
