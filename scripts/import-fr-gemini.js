"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "fr.json");

const NEW_QUESTIONS = [
// DĚTI (4 nové — fr-k-eiffelovka a fr-k-louvre jsou duplikáty, vynechány)
{
  "id": "fr-k-bageta",
  "cc": "fr", "country": "Francie", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jak se jmenuje dlouhé, tenké bílé pečivo s křupavou kůrkou, které francouzští pekaři pečou každý den?",
  "answer": "Bageta",
  "distractors": ["Loupák", "Kaiserka", "Toastový chléb"],
  "quip_correct": "Výborně, křuplo to až sem!",
  "quip_wrong": "Z tohohle bys pořádnou svačinu nepostavil.",
  "explanation": "Bageta má chráněný statut — v pravé francouzské bagetě smí být jen mouka, voda, sůl a kvasnice. Díky svému tvaru se peče rychle a na francouzských stolech nikdy dlouho nevydrží.",
  "about": "francouzské bagetě",
  "image_prompt": "A painterly watercolor illustration of French baguette in a basket, vintage travel journal style"
},
{
  "id": "fr-k-beret",
  "cc": "fr", "country": "Francie", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jaký typ kulaté ploché čepice bez kšiltu nosí tradiční francouzští malíři a mimeři?",
  "answer": "Baret",
  "distractors": ["Kšiltovka", "Cylindr", "Kamerunka"],
  "quip_correct": "Sedne ti jako ulitý, umělectvo se nezapře!",
  "quip_wrong": "V kšiltovce bys na malování spíš narazil do plátna.",
  "explanation": "Baret byl původně praktický kus oděvu pro pastevce z Pyrenejí. Do světa ho roznesli baskičtí námořníci a umělci pařížské bohémy.",
  "about": "francouzském baretu",
  "image_prompt": "A painterly watercolor illustration of a classic French beret, vintage travel journal style"
},
{
  "id": "fr-k-kohout",
  "cc": "fr", "country": "Francie", "section": "Symboly",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Které opeřené zvíře s červeným hřebínkem slouží jako oblíbený národní symbol Francie?",
  "answer": "Galský kohout",
  "distractors": ["Orel bělohlavý", "Lev", "Medvěd"],
  "quip_correct": "Kokrháš radostí správně!",
  "quip_wrong": "Tenhle symbol Francii ráno neprobudí ani s kávou.",
  "explanation": "Spojení vzniklo latinskou slovní hříčkou — slovo gallus znamenalo zároveň kohouta i obyvatele Galie. Kohout tak doslova vyjadřuje hrdost starých Galů.",
  "about": "galském kohoutu",
  "image_prompt": "A painterly watercolor illustration of a proud Gallic rooster, vintage travel journal style"
},
{
  "id": "fr-k-syr",
  "cc": "fr", "country": "Francie", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Francie je na celém světě proslulá výrobou jaké slané mléčné pochoutky, která někdy schválně dost výrazně voní?",
  "answer": "Sýr",
  "distractors": ["Jogurt", "Máslo", "Pudink"],
  "quip_correct": "Cítím tu vůni až sem — správná odpověď!",
  "quip_wrong": "Z tohohle by ti mlsný kocour utekl ještě dřív než bys otevřel lednici.",
  "explanation": "Ve Francii existuje přes 1 000 druhů sýrů — generál de Gaulle se prý ptal, jak lze řídit zemi, která jich má víc než 246.",
  "about": "francouzských sýrech",
  "image_prompt": "A painterly watercolor illustration of various French cheeses on a wooden board, vintage travel journal style"
},

// PUBERŤÁCI (5 — fr-t-croissant zamítnuto; kids:false odstraněno)
{
  "id": "fr-t-tour",
  "cc": "fr", "country": "Francie", "section": "Sport",
  "difficulty": 1, "type": "choice",
  "question": "Jak se jmenuje nejslavnější cyklistický závod světa, jehož účastníci jezdí v červencovém žáru napříč Francií a bojují o žlutý trikot?",
  "answer": "Tour de France",
  "distractors": ["Giro d'Italia", "Vuelta a España", "Paris-Roubaix"],
  "quip_correct": "Šlápnul jsi do pedálů se správnou odpovědí!",
  "quip_wrong": "Tady bys ztratil dech už v první hoře.",
  "explanation": "Žlutý dres vítěze odkazuje na žlutý papír, na kterém vycházel pořádající deník L'Auto. Závod se jede od roku 1903 a dnes ho sledují stamiliony diváků.",
  "about": "Tour de France",
  "image_prompt": "A painterly watercolor illustration of cyclists racing through French countryside, vintage travel journal style"
},
{
  "id": "fr-t-champagne",
  "cc": "fr", "country": "Francie", "section": "Jídlo",
  "difficulty": 2, "type": "choice",
  "question": "Který francouzský region proslavil celosvětově šumivé víno, jež se podle něj také jmenuje?",
  "answer": "Champagne",
  "distractors": ["Bordeaux", "Burgundsko", "Alsasko"],
  "quip_correct": "Bublinky radosti stoupají vzhůru!",
  "quip_wrong": "Tady bys šumivé víno hledal v sudu s octem.",
  "explanation": "Pravé šampaňské smí pocházet výhradně z křídové oblasti na severovýchodě Francie. Vinný sklep tam sahá desítky metrů hluboko do křídy — ideální teplota pro druhé kvašení v lahvi.",
  "about": "regionu Champagne",
  "image_prompt": "A painterly watercolor illustration of vineyards in Champagne region with chalky hills, vintage travel journal style"
},
{
  "id": "fr-t-marseillaise",
  "cc": "fr", "country": "Francie", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Jak se jmenuje státní hymna Francie, pojmenovaná podle pochodu dobrovolníků přicházejících do Paříže?",
  "answer": "Marseillaise",
  "distractors": ["La Vie en Rose", "Internacionála", "Bolero"],
  "quip_correct": "Notuješ naprosto přesně — celý národ zpívá s tebou!",
  "quip_wrong": "La Vie en Rose je kabaretní hit Édith Piaf — trochu jiný žánr než válečný pochod.",
  "explanation": "Píseň složil vojenský inženýr Rouget de Lisle v roce 1792 během jediné noci. Do Paříže ji přinesli dobrovolníci z Marseille, odtud název — ačkoli vznikla v Štrasburku.",
  "about": "francouzské hymně",
  "image_prompt": "A painterly watercolor illustration of a tricolor French flag waving, vintage travel journal style"
},
{
  "id": "fr-t-louvre-kral",
  "cc": "fr", "country": "Francie", "section": "Historie",
  "difficulty": 2, "type": "choice",
  "question": "Než se pařížský Louvre stal nejslavnějším muzeem světa, sloužil primárně jako co?",
  "answer": "Královský palác",
  "distractors": ["Vojenská kasárna", "Obilné silo", "Vězení"],
  "quip_correct": "Královská trefa — muzeum má skvělé základy!",
  "quip_wrong": "Obilné silo pro Monu Lisu by byl teda originální archivační systém.",
  "explanation": "Panovníci z Louvru vládli po staletí, než se dvůr přestěhoval do Versailles. Sbírky do Louvru přesunula teprve Francouzská revoluce v roce 1793.",
  "about": "historii Louvru",
  "image_prompt": "A painterly watercolor illustration of historic royal palace facade with courtyard, vintage travel journal style"
},
{
  "id": "fr-t-parfemy",
  "cc": "fr", "country": "Francie", "section": "Kultura",
  "difficulty": 2, "type": "choice",
  "question": "Které francouzské město je považováno za historickou světovou metropoli parfémů a vonných esencí?",
  "answer": "Grasse",
  "distractors": ["Nice", "Lyon", "Marseille"],
  "quip_correct": "Voní to tu správností!",
  "quip_wrong": "V Marseille voní spíš moře a mýdlo — parfémy se vyrábějí jinde.",
  "explanation": "Grasse na Azurovém pobřeží má ideální klima pro pěstování jasmínu, růže a levandule. Všechny velké pařížské módní domy odtud tradičně odebírají vonné esence.",
  "about": "městě Grasse",
  "image_prompt": "A painterly watercolor illustration of blooming flower fields near Grasse, vintage travel journal style"
},

// DOSPĚLÍ (10 — fr-a-vyrobce-francie a fr-a-pout-camino zamítnuty)
{
  "id": "fr-a-louvre-mona",
  "cc": "fr", "country": "Francie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Jak se Mona Lisa dostala z Itálie do Francie, kde dnes visí v Louvru?",
  "answer": "Přivezl ji Leonardo da Vinci sám — jako svůj osobní majetek",
  "distractors": ["Francouzský král ji ukradl při italském tažení", "Napoleon ji zabavil jako válečnou kořist", "Italský umělec ji daroval francouzskému dvoru jako diplomatický dar"],
  "quip_correct": "Správně — největší obraz dějin si autor prostě vzal s sebou na cestu.",
  "quip_wrong": "Napoleon ji sice v Louvru měl ve svém ložnici, ale do Francie se dostala jinak.",
  "explanation": "Leonardo strávil poslední roky života ve Francii jako host krále Františka I. a s sebou přivezl i Monu Lisu. Po jeho smrti obraz odkoupila francouzská koruna.",
  "about": "Mona Lise",
  "image_prompt": "A painterly watercolor illustration of Leonardo da Vinci painting in a French chateau, vintage travel journal style"
},
{
  "id": "fr-a-lurdy",
  "cc": "fr", "country": "Francie", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Jak se jmenuje slavné francouzské poutní místo v Pyrenejích, kam každoročně míří miliony věřících za údajnými zázračnými uzdraveními?",
  "answer": "Lurdy",
  "distractors": ["Chartres", "Avignon", "Reims"],
  "quip_correct": "Zázrak logiky — správná odpověď!",
  "quip_wrong": "Chartres a Reims jsou slavné katedrály, ale poutníci za zázraky míří do Pyrenejí.",
  "explanation": "Lurdy vzkvétají od roku 1858, kdy se tam mladé dívce Bernadette Soubirousové zjevila Panna Maria. Jsou druhým nejnavštěvovanějším poutním místem světa hned po Vatikánu.",
  "about": "Lurdách",
  "image_prompt": "A painterly watercolor illustration of sanctuary in Lourdes with mountain backdrop, vintage travel journal style"
},
{
  "id": "fr-a-metro-gumy",
  "cc": "fr", "country": "Francie", "section": "Hlavní město",
  "difficulty": 3, "type": "choice",
  "question": "Čím je technicky unikátní část linek pařížského metra ve srovnání s většinou ostatních světových podzemních drah?",
  "answer": "Vagóny jezdí na gumových pneumatikách místo ocelových kol",
  "distractors": ["Vlaky pohání stlačený vzduch bez elektřiny", "Tratě jsou zavěšené na stropě tunelů", "Vagóny jsou taženy ocelovými lany jako lanovka"],
  "quip_correct": "Výborně — guma v tunelu tiše, rychle, přesně.",
  "quip_wrong": "Stlačený vzduch pohání leda tak pneumatiku na kole — ne metro.",
  "explanation": "Systém gumových kol zavedla Paříž v 50. letech 20. století pro tišší jízdu a rychlejší rozjezd. Kopírovaly ho Montreal, Mexico City i Santiago de Chile.",
  "about": "pařížském metru",
  "image_prompt": "A painterly watercolor illustration of a Paris metro art nouveau station entrance, vintage travel journal style"
},
{
  "id": "fr-a-eiffel-byt",
  "cc": "fr", "country": "Francie", "section": "Místa",
  "difficulty": 3, "type": "choice",
  "question": "Co se nacházelo v úplném vrcholu Eiffelovy věže hned po dokončení stavby a sloužilo výhradně jejímu staviteli?",
  "answer": "Soukromý byt Gustava Eiffela se salónem a laboratoří",
  "distractors": ["Meteorologická stanice pro francouzskou armádu", "Tajný trezor pro národní zlato", "Restaurace pro nejbohatší návštěvníky"],
  "quip_correct": "Bydlet s výhledem na celou Paříž — to se opravdu vyplatí!",
  "quip_wrong": "Trezor ve věži by byl sice originální, ale zloděje by to spíš přilákalo.",
  "explanation": "Gustave Eiffel v bytu hostil slavné osobnosti včetně Thomase Edisona. Pařížané původně o byt nestáli — věž považovali za ošklivou a chtěli ji po výstavě strhnout.",
  "about": "vrcholu Eiffelovy věže",
  "image_prompt": "A painterly watercolor illustration of a cozy Victorian apartment interior at great height, vintage travel journal style"
},
{
  "id": "fr-a-bistro",
  "cc": "fr", "country": "Francie", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Jaká populární (i když lingvisty zpochybňovaná) etymologie se váže k původu slova 'bistro' pro malou útulnou restauraci?",
  "answer": "Pochází z ruského 'bystro' — takhle prý křičeli ruští vojáci v Paříži roku 1815",
  "distractors": ["Vzniklo ze jména prvního hostinského v předrevoluční Paříži", "Je to zkratka pro 'víno, sýr a toast' v pařížském argotu", "Označovalo sklep na sudy, kde se nalévalo přímo z hlavně"],
  "quip_correct": "Rychlá a správná — přesně jak ruský voják chtěl obsloužit!",
  "quip_wrong": "Zkratka pro víno a sýr by byla hezká, ale francouzská lingvistika tak pohodlná není.",
  "explanation": "Ruské jednotky po Napoleonově pádu Paříž skutečně obsadily. Zda od nich pochází slovo 'bistro', etymologové dodnes vedou spory — první písemný doklad je až z roku 1884.",
  "about": "původu slova bistro",
  "image_prompt": "A painterly watercolor illustration of a cozy Parisian bistro terrace with wicker chairs, vintage travel journal style"
},
{
  "id": "fr-a-sireny",
  "cc": "fr", "country": "Francie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Kdy se ve Francii povinně rozeznívají varovné sirény civilní obrany na celém území státu?",
  "answer": "Každou první středu v měsíci v poledne — jako pravidelná zkouška",
  "distractors": ["Každé pondělí ráno před zahájením burzy v Paříži", "Na výročí dobytí Bastily o půlnoci", "Při každém vyhlášení stávky dopravních pracovníků"],
  "quip_correct": "Hlídáš čas lépe než francouzský rozhlas!",
  "quip_wrong": "Burzovní sirény jsou trochu jiný žánr než civilní obrana.",
  "explanation": "Pravidelná zkouška siren probíhá ve Francii od dob studené války a udržuje připravenost systému. Trvá tři minuty a Francouzi ji považují za součást každodenního rytmu.",
  "about": "francouzských sirénách",
  "image_prompt": "A painterly watercolor illustration of city rooftops with an old civil defense siren tower, vintage travel journal style"
},
{
  "id": "fr-a-louis-xiv",
  "cc": "fr", "country": "Francie", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Co symbolizoval titul 'Král Slunce', který si nechal udělit francouzský panovník Ludvík XIV.?",
  "answer": "Své postavení středu státu — všichni ostatní se točili kolem něj jako planety kolem slunce",
  "distractors": ["Skutečnost, že v jeho říši nikdy nezapadalo slunce díky koloniím", "Odkaz na keltský kult boha slunce uctívaný v Gálii", "Fakt, že se narodil o letním slunovratu"],
  "quip_correct": "Zářez jako od krále — slunce svítí na správnou odpověď!",
  "quip_wrong": "Kolonie, kde nezapadá slunce, mělo tehdy Španělsko — Ludvík tu myšlenku aplikoval jinak.",
  "explanation": "Ludvík XIV. vládl 72 let — nejdéle ze všech evropských panovníků v historii. Versailles postavil jako chrám absolutní moci, kde šlechta obíhala krále doslova jako planety hvězdu.",
  "about": "Ludvíkovi XIV.",
  "image_prompt": "A painterly watercolor illustration of Louis XIV in royal regalia with sun motifs, vintage travel journal style"
},
{
  "id": "fr-a-champagne-korek",
  "cc": "fr", "country": "Francie", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Proč má korek od pravého šampaňského po vytažení z lahve tvar houby, i když do hrdla vchází jako válec?",
  "answer": "Stlačením do hrdla se trvale zdeformuje — část uvnitř zůstane úzká, část venku se rozevře",
  "distractors": ["Vyrábí se speciálně vyřezáváním do tvaru houby", "Tvar usnadňuje vytažení prsty bez korkováku", "Jde o ochranu před vnikáním vzduchu shora"],
  "quip_correct": "Skvělá dedukce — tlak dělá divy i s korkem!",
  "quip_wrong": "Vyřezávat každý korek do tvaru houby ručně by bylo trochu časově náročné.",
  "explanation": "Část korku stlačená v hrdle pod tlakem oxidu uhličitého zůstane úzká, zatímco část nad drátěným košíčkem se rozevře do šířky. Čím déle víno leží, tím výraznější je deformace.",
  "about": "šampaňském korku",
  "image_prompt": "A painterly watercolor illustration of a mushroom-shaped champagne cork with wire cage, vintage travel journal style"
},
{
  "id": "fr-a-bastila",
  "cc": "fr", "country": "Francie", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Když revolucionáři v roce 1789 dobyli obávanou pařížskou pevnost Bastilu, kolik politických vězňů v ní skutečně osvobodili?",
  "answer": "Pouze sedm — a žádný z nich nebyl politický vězeň",
  "distractors": ["Přesně pět set odsouzených bez soudu", "Téměř dva tisíce vězňů z celé Francie", "Ani jednoho — věznice byla úplně prázdná"],
  "quip_correct": "Statistikou tě nikdo neoklame — sedm a konec!",
  "quip_wrong": "Pět set vězňů by byl krásný revoluční příběh, ale čísla jsou neúprosná.",
  "explanation": "Bastila byla v roce 1789 téměř prázdná — uvnitř seděli čtyři padělatelé, dva blázni a jeden šlechtic zavřený na přání vlastní rodiny. Její symbolický význam byl ale obrovský.",
  "about": "dobytí Bastily",
  "image_prompt": "A painterly watercolor illustration of the Bastille fortress in stormy revolutionary Paris, vintage travel journal style"
},
{
  "id": "fr-a-cizinecka-legie",
  "cc": "fr", "country": "Francie", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Jaké historické pravidlo platilo pro muže vstupující do Francouzské cizinecké legie, které ji odlišovalo od ostatních armád?",
  "answer": "Mohli vstoupit pod falešnou totožností — armáda jim poskytla novou identitu",
  "distractors": ["Museli plynně mluvit francouzsky ještě před nástupem", "Byli výhradně bývalí důstojníci z jiných armád", "Nesměli mít žádnou kriminální minulost"],
  "quip_correct": "Tohle tajemství jsi odhalil jako starý legionář!",
  "quip_wrong": "Jazyková bariéra by legraci přidala — ale Legie fungovala přesně obráceně.",
  "explanation": "Tradice 'anonymat' umožnila lidem s pohnutou minulostí začít nový život pod jiným jménem. Legie vznikla v roce 1831 a dodnes v ní slouží vojáci z celého světa.",
  "about": "Cizinecké legii",
  "image_prompt": "A painterly watercolor illustration of a Foreign Legion soldier in white kepi hat in desert, vintage travel journal style"
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
