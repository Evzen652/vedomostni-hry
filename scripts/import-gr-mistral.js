"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "gr.json");

const NEW_QUESTIONS = [
// DĚTI (5)
{
  "id": "gr-k-olivy",
  "cc": "gr", "country": "Řecko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaké stromy pokrývají velkou část řecké krajiny a dávají Řecku jeho nejslavnější pochutinu?",
  "answer": "Olivovníky",
  "distractors": ["Dubové stromy", "Borovice", "Javorové stromy"],
  "quip_correct": "Zlaté olivy — a nejenom proto, že z nich teče zlato do lahví!",
  "quip_wrong": "To by byla v Řecku pořádná revoluce, kdyby tam rostly duby místo oliv.",
  "explanation": "Řecko má přes 120 milionů olivovníků, z nichž mnoho je stovky let starých. Některé stromy na Krétě jsou staré přes 2000 let a stále plodí.",
  "about": "řeckých olivovnících",
  "image_prompt": "Traditional Greek olive grove with old twisted olive trees under bright sun, painterly watercolor style"
},
{
  "id": "gr-k-more",
  "cc": "gr", "country": "Řecko", "section": "Místa",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jakou barvu mají domy na slavných řeckých ostrovech jako Santorini nebo Mykonos?",
  "answer": "Bílou",
  "distractors": ["Červenou", "Modrou", "Zelenou"],
  "quip_correct": "Bílé jako sníh — a to i přesto, že v Řecku skoro nesněží!",
  "quip_wrong": "Modré domy? To by vypadalo, jako by celý ostrov plaval po moři.",
  "explanation": "Bílá omítka odrážívá sluneční světlo a udržuje v interiéru nižší teplotu. Tradice bílení domů pochází z dob osmanské nadvlády — Řekové ji přijali jako praktické řešení středomořského horka.",
  "about": "řeckých ostrovních vesnicích",
  "image_prompt": "Whitewashed Greek houses with blue shutters on a sunny Cycladic island, painterly watercolor style"
},
{
  "id": "gr-k-jidlo-sladke",
  "cc": "gr", "country": "Řecko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaký sladký dezert se v Řecku jí z tenkého lístkového těsta zalévaného medem?",
  "answer": "Baklava",
  "distractors": ["Tiramisu", "Palačinka", "Marmeládový koláč"],
  "quip_correct": "Baklava — tak sladká, že by i bohové na Olympu slintali!",
  "quip_wrong": "Tiramisu? To je italské, jako bys chtěl v Řecku objednat pizzu.",
  "explanation": "Baklava je vrstvený dezert z lístkového těsta, mletých ořechů a medu. V Řecku ji přinesli Osmané a Řekové ji dokonale přijali za vlastní — dnes je to jeden z nejoblíbenějších místních dezertů.",
  "about": "řecké baklavě",
  "image_prompt": "Greek baklava with layers of phyllo, nuts, and honey syrup on a decorated plate, painterly watercolor style"
},
{
  "id": "gr-k-narodni-tanec",
  "cc": "gr", "country": "Řecko", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se jmenuje slavný řecký tanec, při kterém se tančí v kruhu a drží za ramena?",
  "answer": "Sirtaki",
  "distractors": ["Flamenco", "Polka", "Valčík"],
  "quip_correct": "Sirtaki — a najednou je z vás celá vesnice v pohybu!",
  "quip_wrong": "Flamenco? To by Řekové tančili spíš s kastaněty a rozčileně.",
  "explanation": "Sirtaki proslavil film Řek Zorba (1964), kde ho tančil Anthony Quinn. Hudba pochází od řeckého skladatele Mikise Theodorakise. Dnes ho celý svět zná jako symbol Řecka.",
  "about": "řeckém tanci sirtaki",
  "image_prompt": "Group of people dancing Sirtaki in a circle at a Greek festival by the sea, painterly watercolor style"
},
{
  "id": "gr-k-ostrov-barva",
  "cc": "gr", "country": "Řecko", "section": "Příroda",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Pláže na ostrově Santorini jsou zvláštní — jakou mají barvu?",
  "answer": "Černou",
  "distractors": ["Bílou", "Zlatou", "Růžovou"],
  "quip_correct": "Černé pláže — jako by si moře obulo černý oblek na slavnostní příležitost.",
  "quip_wrong": "Bílé pláže? To by vypadalo, jako by někdo rozlil mléko po celém ostrově.",
  "explanation": "Pláže na Santorini jsou černé nebo tmavě šedé díky sopečnému původu ostrova. Písek tvoří ztuhlá a rozpadlá láva. Santorini vzniklo z obří sopečné erupce před 3600 lety.",
  "about": "santorinských plážích",
  "image_prompt": "Black sand beach of Santorini with turquoise water and dramatic white cliffs above, painterly watercolor style"
},
{
  "id": "gr-k-ryba",
  "cc": "gr", "country": "Řecko", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaká malá ryba se v Řecku nejčastěji griluje celá a podává s citronem a olivovým olejem?",
  "answer": "Sardinka",
  "distractors": ["Losos", "Kapr", "Pstruh"],
  "quip_correct": "Sardinky — malé, ale o to chutnější, když jsou čerstvé z Egejského moře!",
  "quip_wrong": "Losos? V Řecku by ho museli dovézt z Norska. Místní rybaři tahají sardinky.",
  "explanation": "Řecko obklopuje more ze tří stran a rybaření je součástí kultury po tisíce let. Sardinky se grilují na dřevěném uhlí a jsou jedním z nejlevnějších a nejčastějších jídel v tavernách.",
  "about": "řeckých sardinkách",
  "image_prompt": "Grilled sardines on a rustic plate with lemon wedges and olive oil at a Greek taverna, painterly watercolor style"
},

// PUBERŤÁCI (1)
{
  "id": "gr-t-tanec-hudba",
  "cc": "gr", "country": "Řecko", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Jaký strunný nástroj s dlouhým krkem je nezbytnou součástí řecké lidové hudby v tavernách?",
  "answer": "Bouzouki",
  "distractors": ["Housle", "Kytara", "Mandolína"],
  "quip_correct": "Bouzouki — a najednou zní celá taverna jako jeden velký svátek!",
  "quip_wrong": "Housle? To by byla spíš řecká opera, ne večer u vína v taverně u moře.",
  "explanation": "Bouzouki je příbuzné s tureckou sazem a do Řecka se rozšířilo ve 20. letech 20. století s uprchlíky z Malé Asie. Je základem hudebního stylu rebetiko — řeckého blues.",
  "about": "řeckém bouzouki",
  "image_prompt": "Traditional Greek bouzouki instrument with long neck resting against a taverna wall, painterly watercolor style"
},

// DOSPĚLÍ (3)
{
  "id": "gr-a-parthenon-vybuch",
  "cc": "gr", "country": "Řecko", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Parthenón přežil staletí takřka neporušen. Co ho v 17. století téměř zničilo?",
  "answer": "Výbuch střelného prachu — Osmané ho tam skladovali",
  "distractors": ["Zemětřesení", "Záměrné zbourání Benátčany", "Požár způsobený bleskem"],
  "quip_correct": "Parthenón přežil Peršany, Makedonce i Římany — a pak ho zničil sklad střeliva. Ironie dějin.",
  "quip_wrong": "Zemětřesení by byla aspoň přírodní katastrofa. Tohle byl sklad, do kterého trefil benátský granát.",
  "explanation": "V roce 1687 benátský generál Morosini ostřeloval Atény. Střela trefila Parthenón, kde Osmané skladovali střelný prach. Výbuch vyhodil střed chrámu do vzduchu a zničil více než 2000 let starou stavbu víc než cokoliv předtím.",
  "about": "zničení Parthenónu",
  "image_prompt": "The Parthenon on the Acropolis at dramatic dusk light showing its ruined state, painterly watercolor style"
},
{
  "id": "gr-a-fasolada",
  "cc": "gr", "country": "Řecko", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Řecko je kolébkou gastronomie. Které jídlo je paradoxně považováno za národní pokrm — přestože ho starověcí Řekové jedli jako nejchudší stravu?",
  "answer": "Fasolada — hustá fazolová polévka",
  "distractors": ["Moussaka", "Souvlaki", "Taramasalata"],
  "quip_correct": "Z chudinského hrnce na národní poklad. Fasolada vyhřívala lidi ve staré Hellase i dnes.",
  "quip_wrong": "Moussaka bylo vždy jídlo pro slavnostní příležitosti — a pro turisty s fotoaparátem.",
  "explanation": "Fasolada z bílých fazolí, zeleniny a olivového oleje živila chudé vrstvy po tisíce let. Dnes je považována za národní jídlo Řecka. Paradoxně ji světová kuchařská scéna objevila teprve nedávno jako vzor středomořské diety.",
  "about": "řecké fasoladě",
  "image_prompt": "Traditional Greek fasolada white bean soup in a clay bowl with crusty bread and olive oil, painterly watercolor style"
},
{
  "id": "gr-a-vino-more",
  "cc": "gr", "country": "Řecko", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Na Santorini roste réva způsobem, jaký neexistuje nikde jinde na světě. V čem spočívá?",
  "answer": "Vinná réva se plete do košů na zemi — chrání se tak před větrem a suchem v sopečném písku",
  "distractors": ["Roste ve svislých trubicích zavlaženého skleníku", "Pěstuje se výhradně pod vodou v mělkých zálivech", "Réva visí ze stropů jeskyní, kde je stabilní teplota"],
  "quip_correct": "Réva na Santorini neroste — plazí se a schovává. A víno z ní je světová třída.",
  "quip_wrong": "Pod vodou? To by bylo víno se solí. Skutečný trik je košatka v sopečném písku bez závlahy.",
  "explanation": "Santorinský způsob pěstování révy zvané 'kouloura' (košatka) je UNESCO dědictví. Réva se neopírá o kůly, ale stáčí se do nízkého kruhu, který drží hrozny nad sopečnou půdou. Díky mlze z moře nepotřebuje zavlažování — a vinaři ji pěstují bez změn přes 3500 let.",
  "about": "santorinském vínu a réví",
  "image_prompt": "Unique basket-trained vines in volcanic black soil on Santorini with the caldera in background, painterly watercolor style"
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
