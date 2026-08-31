"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "nl.json");

// Zahozeno (1):
// nl-k-voda-hraz — answer "hráze" je obecné české slovo, nic Dutch-specific ani WOW

const NEW_QUESTIONS = [
// DĚTI (7)
{
  "id": "nl-k-drevaky-topoly",
  "cc": "nl", "country": "Nizozemsko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Tradiční nizozemské dřeváky klompen se dodnes vyrábějí z jednoho kusu dřeva. Ze dřeva jakého stromu se nejčastěji dlabou, aby byly lehké a nepromokavé?",
  "answer": "Topol",
  "distractors": ["Smrk", "Dub", "Bříza"],
  "quip_correct": "Tvoje nohy by v nich byly v úplném suchu — a přitom stojíš na jediném kusu dřeva!",
  "quip_wrong": "Smrk by sice krásně voněl, ale za chvíli by ti v něm teklo do bot.",
  "explanation": "Topolové dřevo je měkké, lehké na dlabání a po uschnutí skvěle izoluje od mokrého jílu na polích. Zruční řemeslníci vydlabou jeden klompen za 15 minut, průmyslové stroje za 5 sekund.",
  "about": "tradičních nizozemských dřevákách klompen",
  "image_prompt": "A pair of brightly painted traditional Dutch wooden shoes (klompen) sitting in a green grass field, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-k-slanecek-cibule",
  "cc": "nl", "country": "Nizozemsko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Nizozemci milují syrovou rybu zvanou maatjes haring. S čím se tradičně posype, než ji chytneš za ocas a celou spustíš do pusy?",
  "answer": "S jemně nakrájenou cibulí",
  "distractors": ["Se šlehačkou", "S jahodovým džemem", "S mletou skořicí"],
  "quip_correct": "A teď rychle bonbón, ať nevyděsíš kamarády svým dechem!",
  "quip_wrong": "Ryba se šlehačkou zní jako recept na pořádné bolení bříška.",
  "explanation": "Slanečci se loví na začátku léta, kdy jsou nejtučnější, a na pouličních stáncích se prodávají rovnou s nakrájenou cibulí a kyselou okurkou. Tradice sahá do 15. století.",
  "about": "nizozemské sledě s cibulí",
  "image_prompt": "A traditional Dutch herring seller holding a raw herring by the tail with diced white onions, street market stall, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-k-oranzova-mrkev",
  "cc": "nl", "country": "Nizozemsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Dříve bývaly mrkve fialové, žluté nebo bílé. Nizozemští pěstitelé v 17. století vyšlechtili mrkev v barvě svého královského rodu. Jaká barva mrkve díky nim vládne světu?",
  "answer": "Oranžová",
  "distractors": ["Modrá", "Zelená", "Růžová"],
  "quip_correct": "Král má radost a králíci taky — a celý svět dnes jí oranžovou mrkev!",
  "quip_wrong": "Představ si zelenou mrkev — vypadala by jako divná okurka a nikdo by ji nekoupil.",
  "explanation": "V 17. století nizozemští zemědělci vyšlechtili sladší oranžovou mrkev na počest Viléma Oranžského a tato barva se rozšířila po celém světě. Dřívější barevné odrůdy dnes přežívají jen u specializovaných pěstitelů.",
  "about": "původu oranžové mrkve",
  "image_prompt": "A bunch of bright orange carrots with green tops held by a Dutch farmer in a field, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-k-hagelslag-posypka",
  "cc": "nl", "country": "Nizozemsko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Děti v Nizozemsku běžně snídají chleba s máslem bohatě posypaný něčím, co u nás dáváme jen na dorty. Čím?",
  "answer": "Čokoládovým posypem",
  "distractors": ["Barevnými třpytkami", "Lékořicovým práškem", "Kandovaným cukrem"],
  "quip_correct": "Snídaně šampiónů! Ale zubní kartáček si raději připrav do pohotovosti.",
  "quip_wrong": "Třpytky jsou sice hezké v penále, ale v bříšku by ti moc nechutnaly.",
  "explanation": "Tato čokoládová posypka na chléb se jmenuje hagelslag, což v překladu znamená 'krupobití'. Nizozemci jí ročně sní miliony kilogramů a existuje ve verzích tmavé, mléčné i bílé čokolády.",
  "about": "nizozemské čokoládové posypce hagelslag",
  "image_prompt": "A slice of white bread with butter generously covered in dark chocolate sprinkles (hagelslag) on a plate, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-k-kravske-skvrny",
  "cc": "nl", "country": "Nizozemsko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Nizozemské krávy plemene Fríský skot zná z obrázků úplně každý. Jaký vzor mají na své srsti?",
  "answer": "Černobílé skvrny",
  "distractors": ["Červeno-žluté pruhy", "Modré puntíky", "Zlaté hvězdičky"],
  "quip_correct": "Búčková klasika! Tyhle krávy dávají spoustu mléka pro slavné sýry.",
  "quip_wrong": "Krávy s modrými puntíky by vypadaly jako pohádka, ale příroda vsadila na jednoduchý černobílý.",
  "explanation": "Fríský skot pochází ze severu Nizozemska a je to nejrozšířenější plemeno krav na světě. Jedna kráva dá ročně přes 9000 litrů mléka — výrazně více než jiná plemena.",
  "about": "fríském skotu z Nizozemska",
  "image_prompt": "A friendly black-and-white Holstein-Friesian cow standing in a lush green Dutch meadow with a windmill in background, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-k-vetrny-mlyn-lopatky",
  "cc": "nl", "country": "Nizozemsko", "section": "Místa",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Tradiční nizozemské větrné mlýny mají obří dřevěná ramena. Čím je mlynáři potahují, aby při slabším větru chytila více vzduchu?",
  "answer": "Látkovými plachtami",
  "distractors": ["Plastovými fóliemi", "Papírovými novinami", "Kovovými plechy"],
  "quip_correct": "Vítr napnul plachty a mlýn zase mele — jako plachetnice na souši!",
  "quip_wrong": "Papírové noviny by první deštík proměnil v mokrou kaši.",
  "explanation": "Mlynáři rozvinou plachty na lopatky podobně jako u plachetnice. Podle síly větru plachty přidávají nebo ubírají. Větrné mlýny původně čerpaly vodu z polderů a mlely obilí.",
  "about": "nizozemských větrných mlýnech",
  "image_prompt": "A classic wooden Dutch windmill with canvas sails stretched over its blades next to a calm canal, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-k-drop-lekorice",
  "cc": "nl", "country": "Nizozemsko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Nizozemské děti milují černé bonbóny zvané 'drop' — mají zvláštní sladko-slanou chuť. Z čeho se vyrábějí?",
  "answer": "Z lékořice",
  "distractors": ["Z borůvek", "Ze špenátu", "Z černé kukuřice"],
  "quip_correct": "Tuhle černou dobrotu buď bezmezně miluješ, nebo z ní kroutíš pusu!",
  "quip_wrong": "Borůvky jsou sladké a modré, ale tyto černé chytlavé bonbónky se dělají z kořene lékořice.",
  "explanation": "Nizozemci sní nejvíce lékořice na světě — každý obyvatel průměrně přes 2 kilogramy ročně. Drop existuje ve verzích sladkých, slaných i extra slaných (zout drop), přičemž právě slanou variantu ostatní Evropané zpravidla nenávidí.",
  "about": "nizozemských lékořicových bonbónech drop",
  "image_prompt": "Various shapes of glossy black Dutch liquorice candies (drop) spilled from a paper bag onto a wooden table, painterly watercolor gouache illustration, vintage travel journal style"
},

// PUBERŤÁCI (8)
{
  "id": "nl-t-oranzova-fotbal",
  "cc": "nl", "country": "Nizozemsko", "section": "Sport",
  "difficulty": 1, "type": "choice",
  "question": "Nizozemská vlajka má pruhy červené, bílé a modré. Když ale nastoupí národní fotbalový tým, všichni fanoušci nosí barvu, která na vlajce vůbec není. Která to je a proč?",
  "answer": "Oranžová — na počest královské dynastie Oranje-Nassau",
  "distractors": ["Zelená — barva tulipánových polí", "Fialová — barva hyacintu, národního květu", "Žlutá — barva sýra Gouda"],
  "quip_correct": "Oranje je zkrátka stav mysli — vlajka říká červená, srdce říká oranžová!",
  "quip_wrong": "S fialovou by na stadionu spíše splynuli s večerní oblohou, než aby nahnali soupeři strach.",
  "explanation": "Barva odkazuje na Viléma I. Oranžského, vůdce nizozemského povstání proti španělské nadvládě. Původně byl oranžový i horní pruh vlajky, ale červená byla na moři lépe vidět, tak ho přebarvili.",
  "about": "oranžové barvě v nizozemském sportu a kultuře",
  "image_prompt": "A crowd of football fans dressed in bright orange shirts cheering and waving orange flags in a stadium, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-t-carodejnice-spalovani",
  "cc": "nl", "country": "Nizozemsko", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "V 16.–17. století probíhaly v Evropě hony na čarodějnice. Ve městě Oudewater stála slavná váha. Pokud na ní obviněná osoba vážila 'dostatečně', co se stalo?",
  "answer": "Byla osvobozena — byla příliš těžká na to, aby létala na koštěti",
  "distractors": ["Byla prohlášena za trolla a vyhoštěna", "Musela zaplatit pokutu podle své hmotnosti", "Byla odsouzena, protože těžká váha znamenala spolek s ďáblem"],
  "quip_correct": "Fyzika zachraňovala životy — těžké koště prostě nevznese!",
  "quip_wrong": "Právě naopak! Ďábel prý dával čarodějnicím schopnost být lehké jako pírko.",
  "explanation": "Město Oudewater dostalo od císaře privilegium vydávat certifikáty o poctivé váze. Jelikož nikdo nikdy nevážil nula kilogramů, všichni odsud odešli s certifikátem neviny. Díky tomu bylo Oudewater paradoxně jedním z nejbezpečnějších měst pro obviněné.",
  "about": "historické váze na čarodějnice v Oudewateru",
  "image_prompt": "An old medieval wooden scale inside a brick building in Oudewater Netherlands, atmospheric lighting, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-t-delfska-keramika",
  "cc": "nl", "country": "Nizozemsko", "section": "Kultura",
  "difficulty": 1, "type": "choice",
  "question": "Slavná delfská keramika (Delfts blauw) vznikla jako pokus napodobit drahý asijský porcelán. Jakou barevnou kombinací je typická?",
  "answer": "Modrý malovaný vzor na bílém podkladu",
  "distractors": ["Zlatý vzor na černém podkladu", "Červený vzor na zeleném podkladu", "Hnědý vzor na žlutém podkladu"],
  "quip_correct": "Modrá a bílá — kombinace, ze které holandské babičky šílí nadšením už čtyři staletí.",
  "quip_wrong": "Zlato a čerň by z ní udělaly spíše vybavení pro egyptského faraona než pro nizozemský měšťanský dům.",
  "explanation": "Nizozemští hrnčíři neměli k dispozici pravý porcelánový jíl, a tak používali obyčejnou hlínu s bílou cínovou polevou a čínské motivy překreslovali kobaltovou modří. Dnes je delfská keramika jedním z nejexportovanějších suvenýrů Nizozemska.",
  "about": "delfské modro-bílé keramice",
  "image_prompt": "A beautiful traditional Dutch Delftware ceramic vase with blue painted windmill and tulip patterns on white glaze, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-t-hague-vlada",
  "cc": "nl", "country": "Nizozemsko", "section": "Místa",
  "difficulty": 1, "type": "choice",
  "question": "Hlavním městem Nizozemska je ústavně Amsterodam. Kde ale sídlí vláda, parlament i samotný král?",
  "answer": "V Hagu (Den Haag)",
  "distractors": ["V Utrechtu", "V Rotterdamu", "V Eindhovenu"],
  "quip_correct": "Amsterodam má párty a turisty, Haag má kravaty a paragrafy.",
  "quip_wrong": "Rotterdam sice staví mrakodrapy, ale politici raději úřadují v historickém Hagu.",
  "explanation": "Tato dělená role funguje od roku 1815. Amsterodam je formálním hlavním městem jako symbol národní identity, zatímco Haag je centrem politické moci a mezinárodního práva — sídlí tu i Mezinárodní soudní dvůr.",
  "about": "postavení města Haag v Nizozemsku",
  "image_prompt": "The Binnenhof palace complex in The Hague reflecting in the Hofvijver pond under dramatic afternoon sky, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-t-bitva-na-lede",
  "cc": "nl", "country": "Nizozemsko", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "V roce 1795 došlo u nizozemského ostrova Texel k jedné z nejbizarnějších bitev vojenské historie. Jak francouzské jezdectvo zajalo nizozemskou námořní flotilu?",
  "answer": "Kavalérie přijela k zamrzlým lodím po ledu",
  "distractors": ["Vypustili z moře vodu pomocí stavidla", "Využili obří horkovzdušné balóny", "Převlékli se za rybáře a lodě odkoupili"],
  "quip_correct": "Když zamrzne moře, i koně si mohou hrát na válečné námořnictvo!",
  "quip_wrong": "Horkovzdušné balóny znějí sice akčně, ale zimní mráz vymyslel ještě divočejší scénář.",
  "explanation": "Byla extrémně tuhá zima a nizozemské lodě uvízly v zamrzlém moři u Texelu. Francouzští husaři si obalili kopyta koní látkou, aby neuklouzli, přijeli v noci k lodím a obklíčili je. Námořníci se ráno probudili obklíčeni jezdci.",
  "about": "zajetí nizozemské flotily francouzskou kavalérií u Texelu",
  "image_prompt": "French cavalry on horses riding across a frozen sea surface towards wooden warships trapped in ice at night, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-t-nizozemsky-jazyk-pribuznost",
  "cc": "nl", "country": "Nizozemsko", "section": "Jazyk",
  "difficulty": 1, "type": "choice",
  "question": "Nizozemština je germánský jazyk. Která dvojice jazyků leží lingvisticky 'okolo ní', takže nizozemština tvoří most mezi nimi?",
  "answer": "Angličtina a němčina",
  "distractors": ["Španělština a italština", "Švédština a finština", "Polština a ruština"],
  "quip_correct": "Vezmi němčinu, uber gramatiku, přidej anglický styl a trochu chrapotu — a máš nizozemštinu!",
  "quip_wrong": "Románské jazyky jako španělština znějí melodicky, ale nizozemština má severoevropský charakter.",
  "explanation": "S němčinou sdílí nizozemština velkou část slovní zásoby, se starou angličtinou zase gramatickou strukturu. Právě proto umějí Anglosasové a Němci nizozemštinu číst a přibližně rozumět jí bez studia.",
  "about": "příbuznosti nizozemštiny s angličtinou a němčinou",
  "image_prompt": "An artistic map showing language connections between English, Dutch, and German on aged parchment, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-t-rotterdam-architektura",
  "cc": "nl", "country": "Nizozemsko", "section": "Místa",
  "difficulty": 2, "type": "choice",
  "question": "Zatímco většina nizozemských měst sází na historické domky u kanálů, Rotterdam je plný moderní architektury a mrakodrapů. Co bylo hlavní příčinou?",
  "answer": "Centrum města bylo za druhé světové války téměř zničeno bombardováním",
  "distractors": ["Staré domy zničila epidemie dřevokazného hmyzu", "Obyvatelé se rozhodli zbourat minulost v hlasování", "Město smetla obrovská povodeň v roce 1953"],
  "quip_correct": "Z tragédie vyrostla architektura budoucnosti — žluté krychlové domy jsou toho důkazem.",
  "quip_wrong": "Žádný hmyz takovou spoušť nedokáže. Centrum zničil německý nálet v květnu 1940.",
  "explanation": "Po zničení historického centra se radnice rozhodla nestavět repliky starých domů, ale vytvořit moderní metropoli. Dnes je Rotterdam domovem nejodvážnější architektury v Nizozemsku i v Evropě.",
  "about": "moderní architektuře Rotterdamu",
  "image_prompt": "The iconic yellow Cubic Houses (Kubuswoningen) in Rotterdam under a bright blue sky with modern skyscrapers behind, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-t-polder-vyznam",
  "cc": "nl", "country": "Nizozemsko", "section": "Příroda",
  "difficulty": 1, "type": "choice",
  "question": "Říká se: 'Bůh stvořil svět, ale Nizozemci stvořili Nizozemsko.' Jak se nazývá území vytěžené a vysušené z mořského nebo jezerního dna?",
  "answer": "Polder",
  "distractors": ["Fjord", "Atol", "Laguna"],
  "quip_correct": "Vysušit, postavit dům, zasadit mrkev. Poldery jsou pravý nizozemský zázrak!",
  "quip_wrong": "Fjord je úzký mořský záliv v Norsku — polder je půda, kterou z moře vyrvali lidé vlastníma rukama.",
  "explanation": "Polder je obhnán hrází a voda z něj musí být neustále odčerpávána — dříve větrnými mlýny, dnes elektrickými čerpadly. Bez čerpadel by se polder zalil vodou za 72 hodin.",
  "about": "nizozemských polderech",
  "image_prompt": "Aerial view of flat green Dutch polder farmland divided by straight drainage canals and dikes, painterly watercolor gouache illustration, vintage travel journal style"
},

// DOSPĚLÍ (8)
{
  "id": "nl-a-kralik-australie",
  "cc": "nl", "country": "Nizozemsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Nizozemský mořeplavec Willem de Vlamingh prozkoumal v roce 1696 západní Austrálii a pojmenoval ostrov Rottnest ('Krysí hnízdo'). Co byly ve skutečnosti ty 'obří krysy', které tam viděl?",
  "answer": "Malí vačnatci quokka",
  "distractors": ["Obří mořští korýši", "Divoká australská prasata", "Tučňáci brýloví"],
  "quip_correct": "Místo odporných hlodavců objevil nejusměvavější zvířátka na světě — quokky!",
  "quip_wrong": "Prasata to nebyla — ti malí vačnatci spíš připomínali přerostlé, ale velmi roztomilé hlodavce.",
  "explanation": "De Vlamingh si spletl malé usměvavé vačnatce quokka s krysami. Název Rottnest (v nizozemštině 'Rattennest' = Krysí hnízdo) ostrovu zůstal dodnes. Quokky jsou dnes chráněným symbolem ostrova a turisté je milují.",
  "about": "příběhu pojmenování ostrova Rottnest",
  "image_prompt": "A cute Quokka animal on Rottnest Island looking into the camera with a cheerful expression, sunny Australian beach background, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-a-smrt-spojenci-zaplavy",
  "cc": "nl", "country": "Nizozemsko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Za nacistické okupace Němci záměrně zaplavili části Nizozemska mořskou vodou. Proč byla slaná voda pro zemi horší katastrofou než samotná povodeň?",
  "answer": "Sůl zničila úrodnost půdy na několik let — z polí nešlo nic pěstovat",
  "distractors": ["Voda přilákala miliony jedovatých medúz", "Slaná voda rozleptala veškeré dřevěné konstrukce kanálů", "Mořská sůl ucpala všechny zásobárny pitné vody"],
  "quip_correct": "Voda odteče, ale sůl v zemi zůstane a spálí všechno živé.",
  "quip_wrong": "Medúzy byly ten nejmenší problém. Skutečným tichým zabijákem byla obyčejná mořská sůl.",
  "explanation": "Zatímco sladká voda polderům neublíží, slaná voda zničí půdní strukturu a usmrtí plodiny. Trvalo roky po válce, než se podařilo sůl z půdy důkladně vyplavit. Některé oblasti nebyly zemědělsky využitelné až do padesátých let.",
  "about": "zaplavení polderů slanou vodou za druhé světové války",
  "image_prompt": "A flooded flat Dutch farmland landscape under grey wartime sky with salt-crusted soil patches visible, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-a-velvyslanectvi-kanada",
  "cc": "nl", "country": "Nizozemsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Během druhé světové války porodila nizozemská princezna Juliana dceru Margriet v Ottawě. Co udělala kanadská vláda s porodním sálem, aby se dítě narodilo výhradně jako Nizozemka?",
  "answer": "Dočasně prohlásila porodní sál za extrateritoriální — území mimo kanadskou jurisdikci",
  "distractors": ["Darovala celou nemocnici nizozemskému království", "Navezla do pokoje tunu nizozemské hlíny", "Převzala porodní sál pod přímou správu OSN"],
  "quip_correct": "Diplomatické kouzlo! Jedna místnost na pár dní nepatřila vůbec nikomu — jen Nizozemsku.",
  "quip_wrong": "Hlína na podlaze by byla sice vlastenecká, ale hygienici v nemocnici by z toho radost neměli.",
  "explanation": "Pokud by se princezna narodila na kanadské půdě, získala by automaticky kanadské občanství (jus soli) a ztratila nárok na trůn. Každý rok Kanada posílá do Nizozemska 20 000 tulipánů jako poděkování za pomoc za války.",
  "about": "narození princezny Margriet v Kanadě",
  "image_prompt": "A hospital room door in 1940s Ottawa with a diplomatic sign and Dutch royal flowers, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-a-pohrebni-kolo",
  "cc": "nl", "country": "Nizozemsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Nizozemci milují kola natolik, že je používají i pro jednu velmi specifickou životní situaci. Co je to uitvaartfiets?",
  "answer": "Pohřební nákladní kolo vezoucí rakev na hřbitov",
  "distractors": ["Obří tandem pro dvacet smutečních hostů", "Speciální výletní kolo se světelnými girlandami", "Závodní kolo se želvím tempem pro pohřební průvody"],
  "quip_correct": "Na kole do práce, na kole do školy — a nakonec na kole i na věčnost!",
  "quip_wrong": "Obří tandem zní jako zábavný teambuilding, ale pohřební obřad vyžaduje trochu více důstojnosti.",
  "explanation": "Uitvaartfiets je speciálně upravené nákladní kolo nebo tažený přívěs, na kterém se rakev veze na hřbitov rychlostí chůze za doprovodu příbuzných. Je to ekologické a pro Nizozemce — zemi kol — velmi osobní rozloučení.",
  "about": "nizozemském pohřebním kole uitvaartfiets",
  "image_prompt": "A dignified black cargo bicycle carrying a wooden casket along a quiet tree-lined Dutch path, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-a-spalene-tulipany-hlad",
  "cc": "nl", "country": "Nizozemsko", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Během kruté 'Hladové zimy' (Hongerwinter 1944–45) zachraňovaly lidi před smrtí hladem cibulky národního symbolu. Jak se upravovaly k jídlu?",
  "answer": "Vařily se a mlely na náhražkovou mouku nebo kaši",
  "distractors": ["Kvasily se na šumivé tulipánové víno", "Sušily se a kouřily jako dýmkový tabák", "Smažily se v oleji na křupavé lupínky"],
  "quip_correct": "Tulipány zachraňovaly životy, i když chutaly hořce a suše.",
  "quip_wrong": "Výroba šumivého vína byla to poslední, na co by hladovějící lidé měli pomyšlení.",
  "explanation": "Tulipánové cibulky obsahují hodně škrobu. Lékaři vydali návody, jak z nich odstranit hořké části, načež se mlely na provizorní chléb a polévky. Za Hongerwinter zemřelo hladem přes 20 000 Nizozemců, přestože zbývající část Evropy byla již osvobozena.",
  "about": "konzumaci tulipánových cibulek za hladomoru 1944–1945",
  "image_prompt": "A rough clay bowl of tulip bulb soup with a wooden spoon on a bare wartime table, dramatic dark lighting, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-a-ostrov-flevoland",
  "cc": "nl", "country": "Nizozemsko", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Provincie Flevoland vznikla kompletním vysušením mořského zálivu Zuiderzee ve 20. století. Jaký geografický unikát tím lidé nechtěně vytvořili?",
  "answer": "Největší umělý ostrov na světě vzniklý odvodněním",
  "distractors": ["Nejhlubší sladkovodní jezero v Evropě", "Jediné místo v EU bez přirozené spodní vody", "První území pod mořem obydlené permanentně"],
  "quip_correct": "Když vybagruješ dost mořského dna, vytvoříš ostrov veliký jako kraj!",
  "quip_wrong": "Nejhlubší jezero je Bajkal v Rusku — Flevoland je přesný opak: území, kde jezero bylo, a teď není.",
  "explanation": "Flevopolder o rozloze přes 970 km² je obklopen kanály a jezery — tedy ostrov zcela vytvořený lidskými rukami. První obyvatelé se přistěhovali v 60. letech 20. století na půdu, která ještě v roce 1940 ležela pod mořem.",
  "about": "umělém ostrově Flevoland",
  "image_prompt": "Aerial view of the Flevoland polder province surrounded by blue waters and straight canals, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-a-amsterodam-kuly",
  "cc": "nl", "country": "Nizozemsko", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Historické domy v Amsterodamu se často naklánějí dopředu nebo do stran. Není to estetický záměr. Co způsobuje pohyb stavení?",
  "answer": "Dřevěné kůly v bahnitém podloží časem hnijí — dům se pak nakloní",
  "distractors": ["Lehká zemětřesení z těžby zemního plynu", "Silné západní vichřice z Severního moře", "Hmotnost masivních zvedacích háků na střechách"],
  "quip_correct": "Město doslova stojí na tisících smrkových kůlů zatlučených do bláta pod hladinou vody!",
  "quip_wrong": "Větry sice ohýbají stromy, ale s tunovými cihlovými domy by jen tak nepohnuly.",
  "explanation": "Každý amsterodamský dům stojí na stovkách až tisících dřevěných kůlů. Dokud jsou pod vodou, nehnijí. Ale jakmile hladina podzemní vody klesne, dřevo se dostane na vzduch a začne se rozkládat. Palác Dam stojí na 13 659 kůlech.",
  "about": "základech amsterodamských domů na dřevěných kůlech",
  "image_prompt": "Narrow historic canal houses in Amsterdam leaning slightly at different angles, reflected in canal water, painterly watercolor gouache illustration, vintage travel journal style"
},
{
  "id": "nl-a-pivo-heineken-lahve",
  "cc": "nl", "country": "Nizozemsko", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "V roce 1960 navrhl Alfred Heineken speciální hranatou pivní láhev nazvanou WOBO. K čemu měla po vypití piva sloužit?",
  "answer": "Jako stavební cihla pro chudinské domy v rozvojových zemích",
  "distractors": ["Jako plovák do záchranných vest", "Jako hudební nástroj pro pouliční muzikanty", "Jako chladicí prvek do domácích ledniček"],
  "quip_correct": "Vypij pivo, postav dům! Recyklace s třicetiletým předstihem.",
  "quip_wrong": "Muzikanti na láhve pískají rádi, ale Heineken chtěl vyřešit globální nedostatek levného bydlení.",
  "explanation": "Heineken viděl na Karibských ostrovech spoustu odpadků a nedostatek stavebních materiálů. Vytvořil hranaté láhve, které do sebe zapadaly jako Lego. Projekt nakonec zkrachoval, protože dodavatelé nechtěli plnit nestandardní tvar.",
  "about": "pivní cihlě WOBO od Heinekenu",
  "image_prompt": "Green rectangular glass Heineken WOBO bottles stacked together like bricks in a wall, painterly watercolor gouache illustration, vintage travel journal style"
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
