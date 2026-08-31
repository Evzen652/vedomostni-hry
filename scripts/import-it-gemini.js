"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "it.json");

const NEW_QUESTIONS = [
// DĚTI (5) — zahozeno 13: duplikáty, triviálně generické (vlak, more, ryba, meloun...)
{
  "id": "it-k-tvar",
  "cc": "it", "country": "Itálie", "section": "Symboly",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Když se podíváš na mapu, Itálie vypadá jako kus oblečení, do kterého se obouváme. Co to je?",
  "answer": "Holínka",
  "distractors": ["Rukavice", "Čepice", "Pásek"],
  "quip_correct": "Trefa — Itálie má opravdu styl i na mapě!",
  "quip_wrong": "Rukavici nebo čepici by sis do moře neobuval.",
  "explanation": "Apeninský poloostrov vybíhá hluboko do Středozemního moře a tvar 'boty' vidí jasně každý, kdo se podívá na mapu Evropy.",
  "about": "italské geografii",
  "image_prompt": "A painterly watercolor illustration of Italy map shaped like a leather boot, vintage travel journal style"
},
{
  "id": "it-k-vlajka",
  "cc": "it", "country": "Itálie", "section": "Symboly",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Italská vlajka má tři svislé pruhy. Jaké mají barvy?",
  "answer": "Zelená, bílá, červená",
  "distractors": ["Modrá, bílá, červená", "Žlutá, zelená, modrá", "Černá, červená, zlatá"],
  "quip_correct": "Správně — stejné barvy jako pizza Margherita: bazalka, mozzarella, rajče.",
  "quip_wrong": "Modré proužky jsou Francie nebo Francie. Italská trojice je jiná.",
  "explanation": "Zelená barva symbolizuje naději, bílá víru a červená oběti italského národa. Trochu náhoda: pizza Margherita vznikla v roce 1889 právě ve barvách vlajky.",
  "about": "italské vlajce",
  "image_prompt": "A painterly watercolor illustration of the Italian tricolor flag waving, vintage travel journal style"
},
{
  "id": "it-k-zmrzlina-vanocni",
  "cc": "it", "country": "Itálie", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se jmenuje sladký nadýchaný koláč ve tvaru kupole, který Italové pečou o Vánocích?",
  "answer": "Panettone",
  "distractors": ["Lívanec", "Preclík", "Bábovka"],
  "quip_correct": "Ano — a správný panettone musí kynout celý den, jinak to je jen houska.",
  "quip_wrong": "Preclík je slaný a lívanec plochý — vánoční italská kupole má jiné jméno.",
  "explanation": "Panettone pochází z Milána a peče se do vysoké kulaté formy. Plní se kandovaným ovocem a rozinkami. Dnes je k dostání po celém světě, ale Italové tvrdí, že originál je jen milánský.",
  "about": "italských Vánocích",
  "image_prompt": "A painterly watercolor illustration of a festive panettone cake dusted with powdered sugar, vintage travel journal style"
},
{
  "id": "it-k-maso",
  "cc": "it", "country": "Itálie", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se v italštině říká masovým kuličkám, které se podávají k těstovinám nebo v omáčce?",
  "answer": "Polpette",
  "distractors": ["Nuggety", "Řízky", "Párky"],
  "quip_correct": "Polpette — malé, kulaté a plné bylin. Italské kuličky jsou vždy lepší než ty naše.",
  "quip_wrong": "Nugget je americký, řízek vídeňský — italské kuličky mají vlastní jméno.",
  "explanation": "Polpette se dusí v rajčatové omáčce s česnekem a bylinkami. V Itálii se spíš jedí jako hlavní chod, ne k těstovinám — to je americká hollywoodská tradice.",
  "about": "italské kuchyni",
  "image_prompt": "A painterly watercolor illustration of savory meatballs in tomato sauce, vintage travel journal style"
},
{
  "id": "it-k-strom",
  "cc": "it", "country": "Itálie", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Který štíhlý tmavě zelený strom stojí podél cest v Toskánsku a vypadá jako zelená svíčka?",
  "answer": "Cypřiš",
  "distractors": ["Smrk", "Bříza", "Palma"],
  "quip_correct": "Přesně — bez cypřišů by toskánská krajina vypadala jako úplně jiná krajina.",
  "quip_wrong": "Smrk roste v horách, bříza u rybníků — toskánské aleje mají jinou hvězdu.",
  "explanation": "Cypřiše (Cupressus sempervirens) jsou symbolem středomořské krajiny. V Itálii se sázejí podél cest a k hřbitovům — jejich úzký tvar nezabíral příliš místa a rostly rychle.",
  "about": "toskánské krajině",
  "image_prompt": "A painterly watercolor illustration of tall cypress trees lining a dirt road in Tuscany, vintage travel journal style"
},

// PUBERŤÁCI (5) — zahozeno 7: Alpy/pasta/fotbal triviální, tanec/syr duplikát, republika slabá, vulkán duplikát
{
  "id": "it-t-opera",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Který žánr hudebního divadla, kde se téměř vše zpívá, má historické kořeny v Itálii přelomu 16. a 17. století?",
  "answer": "Opera",
  "distractors": ["Muzikál", "Jazz", "Opereta"],
  "quip_correct": "Bravo — opera se v Itálii zrodila a Itálie ji dodnes považuje za svůj národní vynález.",
  "quip_wrong": "Muzikál přišel z Ameriky v 19. století — opera je starší a vzletnější.",
  "explanation": "První opery vznikly ve Florencii v kroužku Camerata fiorentina, který chtěl oživit starověké řecké drama. Jak to Řekové zpívali, nikdo nevěděl, tak to vymysleli znovu — a tím náhodou stvořili nový žánr.",
  "about": "italské opeře",
  "image_prompt": "A painterly watercolor illustration of an ornate opera house stage interior with curtain, vintage travel journal style"
},
{
  "id": "it-t-rim",
  "cc": "it", "country": "Itálie", "section": "Místa",
  "difficulty": 2, "type": "choice",
  "question": "Jak se přezdívá italskému hlavnímu městu, které fungovalo jako centrum impéria víc než tisíc let?",
  "answer": "Věčné město",
  "distractors": ["Město světla", "Město mostů", "Město větrů"],
  "quip_correct": "Věčné město — a fakt, že tu stojí stejné budovy jako za císařů, tomu přezdívce dává smysl.",
  "quip_wrong": "Město světla je Paříž — Řím svítí jinak, spíš odrazem minulosti.",
  "explanation": "Přezdívka Caput Mundi (hlava světa) a Città Eterna (věčné město) odráží věčnost Říma jako centra nejmocnější antické říše. Paradoxně, čím více se Řím bourá, tím víc se zjišťuje, co pod ním ještě leží.",
  "about": "Římě",
  "image_prompt": "A painterly watercolor illustration of Rome cityscape at sunset with ancient ruins, vintage travel journal style"
},
{
  "id": "it-t-katedrala",
  "cc": "it", "country": "Itálie", "section": "Místa",
  "difficulty": 2, "type": "choice",
  "question": "Ve kterém italském městě stojí obrovský gotický dóm z bílého mramoru s věžičkami a sochami na každém místě?",
  "answer": "Milán",
  "distractors": ["Palermo", "Bologna", "Verona"],
  "quip_correct": "Milánský Duomo — stavba trvala 600 let a má přes 3400 soch na fasádě.",
  "quip_wrong": "Bologna má portiky, Verona Romea a Julii — milánský mramor stojí jinde.",
  "explanation": "Milánský dóm je třetí největší kostel na světě a jeho výstavba začala roku 1386. Na střeše je vyhlídkový ochoz s výhledem na Alpy — a v jasný den i na Mont Blanc.",
  "about": "milánské architektuře",
  "image_prompt": "A painterly watercolor illustration of the white marble Milan Cathedral with gothic spires, vintage travel journal style"
},
{
  "id": "it-t-moce",
  "cc": "it", "country": "Itálie", "section": "Příroda",
  "difficulty": 2, "type": "choice",
  "question": "Které moře odděluje Itálii od Balkánského poloostrova a leží na východní straně italské boty?",
  "answer": "Jaderské moře",
  "distractors": ["Severní moře", "Baltské moře", "Černé moře"],
  "quip_correct": "Jaderské — relativně mělké, teplé a oblíbené u italských i chorvatských pláží.",
  "quip_wrong": "Severní moře obklopuje Británii, Baltské Skandinávii — italská bota nohama tam nesahá.",
  "explanation": "Jaderské moře je poměrně mělké (průměrná hloubka 173 m) a kvůli uzavřené poloze je citlivé na znečištění. Benátky na jeho severním konci se topí nejen metaforicky.",
  "about": "italském pobřeží",
  "image_prompt": "A painterly watercolor illustration of calm blue Adriatic waves on a sunny beach, vintage travel journal style"
},
{
  "id": "it-t-pismo",
  "cc": "it", "country": "Itálie", "section": "Symboly",
  "difficulty": 2, "type": "choice",
  "question": "Jaké písmo, které dnes používá většina světa, se šířilo spolu s expanzí starověkého Říma?",
  "answer": "Latinka",
  "distractors": ["Cyrilice", "Azbuka", "Hlaholice"],
  "quip_correct": "Latinka — a píšeš jí právě teď, aniž bys myslel na Římany.",
  "quip_wrong": "Cyrilice pochází z řecké abecedy a rozšířilo ji pravoslavné křesťanství — latinku stvořili v jiném hlavním městě impéria.",
  "explanation": "Latinská abeceda se rozšířila s římskou říší po celé Evropě. Dnes ji nebo z ní odvozené varianty používá přes 70 % světové populace při psaní.",
  "about": "latinském písmu",
  "image_prompt": "A painterly watercolor illustration of ancient Roman stone inscriptions carved in a wall, vintage travel journal style"
},

// DOSPĚLÍ (10) — zahozen 14: triviální (vatican, florencie, olivový olej, móda...), duplikáty, fatal error (Avignon)
{
  "id": "it-a-kava",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Italové cappuccino pijí výhradně v určitou část dne. Kdy — a proč?",
  "answer": "Jen dopoledne — mléčný nápoj se po jídle považuje za těžký pro trávení",
  "distractors": ["Výhradně po obědě — cappuccino je trávicí nápoj, ne snídaňový", "Jen večer — dopoledne Italové pijí espresso, odpoledne americano", "Kdykoli, ale pouze v baru — cappuccino doma se v Itálii nepovažuje za cappuccino"],
  "quip_correct": "Přesně — espresso po obědě ano, cappuccino ne. Kdo objedná mléčnou kávu po jídle, prozradí turista.",
  "quip_wrong": "Zkus si cappuccino po večeři objednat a pozoruj číšníkův výraz.",
  "explanation": "Italská kávová etiketa má svá pravidla: cappuccino (a další mléčné nápoje) se pijí ráno, protože mléko se po jídle považuje za 'těžké na žaludek'. Po obědě a večeři se pije jen espresso nebo ristretto.",
  "about": "italské kávové kultuře",
  "image_prompt": "A painterly watercolor illustration of a creamy cappuccino cup on a marble bar counter, vintage travel journal style"
},
{
  "id": "it-a-pesto",
  "cc": "it", "country": "Itálie", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Z kterého italského regionu pochází omáčka Pesto alla Genovese — a co ji odlišuje od 'běžného' pesta?",
  "answer": "Z Ligurie — klíčem je bazalka z kopců nad Janovem, která má jemnější chuť než jinde pěstovaná",
  "distractors": ["Z Toskánska — pesto vymysleli ve Florencii a Liguria si jen přisvojila název", "Ze Sicílie — původní recept měl paradajky a mandle, bazalka přišla později", "Z Piemontu — přidávají do něj vlašské ořechy místo piniových, proto chutná jinak"],
  "quip_correct": "Přesně — pravé pesto alla genovese má DOP certifikát. Toskánská bazalka se za záměnu v Janově urazí.",
  "quip_wrong": "Sicílie je citróny a caponata — pesto odtamtud nepochází, i když Sicilané mají vlastní červenou variantu.",
  "explanation": "Basilico genovese (ligurská bazalka) má menší a jemnější listy s nižším obsahem mentolu než jiné odrůdy. Pravé pesto DOP obsahuje ještě parmigiano, pecorino, piniové oříšky, česnek a olivový olej — a mele se v mramorovém hmoždíři, ne mixérem.",
  "about": "omáčce pesto",
  "image_prompt": "A painterly watercolor illustration of a mortar and pestle with basil and pine nuts, vintage travel journal style"
},
{
  "id": "it-a-cizinci",
  "cc": "it", "country": "Itálie", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Který národ v Itálii před Římany ovlivnil jejich architekturu, náboženství i umění — a přesto zůstal záhadou, protože jejich jazyk se nepodařilo rozluštit?",
  "answer": "Etruskové",
  "distractors": ["Keltové", "Gótové", "Féničané"],
  "quip_correct": "Etruskové — civilizace, která Římanům ukázala, jak stavět oblouky a uctívat bohy, a pak zmizela do mlhy dějin.",
  "quip_wrong": "Keltové na severu, Féničané na moři — ale v Toskánsku před Římem vládli jiní a jejich písmo dodnes vzdoruje překladačům.",
  "explanation": "Etruský jazyk je izolovaný — nepříbuzný žádnému jinému evropskému jazyku. Přestože máme stovky etruských nápisů, jejich jazyk byl rozluštěn jen částečně. Etruská kultura přežila v Římě jako architektura, symboly moci (fasces, tóga) a způsob věštění.",
  "about": "etruské kultuře",
  "image_prompt": "A painterly watercolor illustration of an ancient Etruscan terracotta sarcophagus with reclining figures, vintage travel journal style"
},
{
  "id": "it-a-zivot",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Jak se italsky říká filozofii 'sladkého nicnedělání' — vědomému vychutnávání klidu a přítomného okamžiku?",
  "answer": "Il dolce far niente",
  "distractors": ["La vita bella", "Amore puro", "Tempo lento"],
  "quip_correct": "Il dolce far niente — nic nedělat, a přitom to dělat s maximálním nasazením.",
  "quip_wrong": "La vita bella je sice hezký film, ale filozofii nicnedělání popisuje jiný výraz.",
  "explanation": "Fráze il dolce far niente (doslova 'sladké nicnedělání') je zakotvena v italské kultuře jako protipól k produktivitě. Je součástí rytmu deníku: práce, espresso, passeggiata, oběd, polední ticho. Nejde o lenost, ale o vědomé zastavení.",
  "about": "italském životním stylu",
  "image_prompt": "A painterly watercolor illustration of an empty cafe chair on a sunny Italian piazza, vintage travel journal style"
},
{
  "id": "it-a-svatky",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Jak se nazývá tradiční italská večerní procházka centrem města — spíš společenská událost než sport?",
  "answer": "Passeggiata",
  "distractors": ["Siesta", "Sagra", "Serenada"],
  "quip_correct": "Passeggiata — procházení bez cíle, ale s velmi vysokou mírou viditelnosti. Každý vidí každého.",
  "quip_wrong": "Siesta je španělská odpolední dřímota — Italové si v tu dobu spíš jdou ukázat.",
  "explanation": "Passeggiata se koná typicky podvečer, zvláště v neděli. Lidé se obléknou, projdou hlavním náměstím a corso, potkají sousedy, zkritizují oblečení a vrátí se domů. V malých jižních městech tento rituál přežil dodnes.",
  "about": "italském společenském životě",
  "image_prompt": "A painterly watercolor illustration of people strolling through a town plaza at dusk in Italy, vintage travel journal style"
},
{
  "id": "it-a-kostel",
  "cc": "it", "country": "Itálie", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Proč v mnoha italských městech stojí zvonice (campanile) jako samostatná věž, oddělená od hlavního kostela?",
  "answer": "Campanile je architektonicky i liturgicky samostatný prvek — zvony svolávaly lidi i bez otevřeného kostela",
  "distractors": ["Církev zakázala zvony v hlavní budově, protože vibrace ničily malby uvnitř", "Oddělená věž sloužila jako strážná hlídka — z výšky kněží sledovali okolí", "Tradice přišla z Byzance, kde zvonice a chrám byly vždy dva různé objekty"],
  "quip_correct": "Přesně — campanile svolávalo, oznamovalo a varovalo i tehdy, kdy byl kostel zavřený. Věž mluví sama za sebe.",
  "quip_wrong": "Vibrace jsou skutečný problém (šikmá věž v Pise to ví), ale hlavní důvod oddělení je jiný.",
  "explanation": "Italská tradice samostatných zvonicí sahá do raného středověku. Campanile plnilo více funkcí: svolávalo k modlitbě, oznamovalo čas, varovalo před nebezpečím. Nejslavnější je šikmá věž v Pise — campanile tamního dómu.",
  "about": "italské architektuře",
  "image_prompt": "A painterly watercolor illustration of a tall campanile bell tower standing beside a medieval church, vintage travel journal style"
},
{
  "id": "it-a-pohyb",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Jak se nazývá specifický systém italských rukových gest — a kolik jich má přibližně ustálený význam?",
  "answer": "Gesticolazione — odborníci popsali přes 250 gest s přesným významem",
  "distractors": ["Mimica — každé italské gesto je individuální a nelze ho standardizovat", "Parlare con le mani — asi 20 základních gest, zbytek je improvizace", "Gestualità — systém vznikl ve 20. století, dříve Italové negestikulovali víc než jiné národy"],
  "quip_correct": "Gesticolazione — jazz rukou, ale se slovníkem. Italové bez gest nemluví, jen vydávají zvuky.",
  "quip_wrong": "Pantomima záměrně nepoužívá slova — u Italů je to naopak: gesta slova jen zesilují a zpřesňují.",
  "explanation": "Italská gesta mají konkrétní, sdílené významy — napínání bříška ukazováčku pod okem znamená 'dávej pozor', sevřená ruka před obličejem znamená 'co chceš?'. Výzkum z roku 2007 popsal 250 standardizovaných gest s pevným významem.",
  "about": "italské komunikaci",
  "image_prompt": "A painterly watercolor illustration of expressive Italian hands gesturing in conversation, vintage travel journal style"
},
{
  "id": "it-a-reka",
  "cc": "it", "country": "Itálie", "section": "Příroda",
  "difficulty": 3, "type": "choice",
  "question": "Jak se jmenuje nejdelší italská řeka — a proč je pro Itálii hospodářsky důležitější než Tiber protékající Římem?",
  "answer": "Pád — teče přes Pádskou nížinu, která je nejvýnosnější zemědělskou oblastí Itálie",
  "distractors": ["Tiber — kratší sice, ale zásobuje více než 4 miliony obyvatel Říma a okolí", "Arno — protéká Florencií a zásobuje průmyslová centra středu Itálie", "Adige — nejrychlejší tok, využívaný k výrobě elektřiny v alpských vodních elektrárnách"],
  "quip_correct": "Pád — 682 km přes nejbohatší zemědělskou oblast Evropy. Bez něj by Itálie neměla prosciutto ani parmigiano.",
  "quip_wrong": "Tiber proslavil Řím, Arno Florencii — ale délkou ani hospodářský dopadem ani jeden na severoitalský veletok nedosáhne.",
  "explanation": "Řeka Pád (Po) je se 682 km nejdelší italskou řekou. Pádská nížina zásobuje vodou největší zemědělskou oblast Itálie a část průmyslového severu. Paradox: Pád je zároveň nejznečištěnější italskou řekou.",
  "about": "italské hydrografii",
  "image_prompt": "A painterly watercolor illustration of a wide river flowing through green farmland in northern Italy, vintage travel journal style"
},
{
  "id": "it-a-umelecke-hnutí",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Proč mělo baroko v 17. století své hlavní centrum právě v Itálii — konkrétně v Římě?",
  "answer": "Katolická církev financovala velkolepé stavby a umění, aby ohromila věřící a odrážela protestantismus",
  "distractors": ["Italští vládci soutěžili s francouzským dvorem, proto zadávali stále větší a dražší stavby", "Baroko vzniklo jako reakce na renesanční střídmost — umělci se vzepřeli pravidlům a vymysleli nový styl", "Řím měl nejlepší mramor a největší dílny — baroko bylo prostě levnější než jinde"],
  "quip_correct": "Baroko — drama, mramor, zlato a věřící s rozhlízenými krky. Vatikán to schválil a zaplatil.",
  "quip_wrong": "Gotika patří středověku, impresionismus 19. století — dramatické zlacené 17. století má jiný název.",
  "explanation": "Baroko vzniklo v Římě jako součást protireformace. Jezuité a papežové zadávali velkolepé chrámy, fresky a sochy, aby dokázali sílu katolické církve a přilákali zpět věřící. Berniniho andělé na mostě sv. Anděla nebo strop Gesù jsou typickými příklady.",
  "about": "baroku v Itálii",
  "image_prompt": "A painterly watercolor illustration of a baroque church interior with dramatic light and gilded ceiling, vintage travel journal style"
},
{
  "id": "it-a-univerzita",
  "cc": "it", "country": "Itálie", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Ve kterém italském městě funguje od roku 1088 nejstarší nepřetržitě činná univerzita na světě?",
  "answer": "Bologna",
  "distractors": ["Padova", "Pisa", "Salerno"],
  "quip_correct": "Bologna 1088 — o 10 let dříve než Oxford. Diplom z ní je skutečně starší než angličtina jako jazyk.",
  "quip_wrong": "Padova je stará a slavná, ale začala fungovat až roku 1222 — o více než století pozdějí.",
  "explanation": "Universita di Bologna vznikla roku 1088 jako studium práva. Dnes má přes 80 000 studentů. Její latinský motto 'Alma mater studiorum' (živící matka studií) se stalo obecným označením pro університetu v mnoha jazycích.",
  "about": "Boloni",
  "image_prompt": "A painterly watercolor illustration of historic arched university porticos in Bologna, vintage travel journal style"
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
