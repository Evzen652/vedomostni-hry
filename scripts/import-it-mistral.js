"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(process.cwd(), "data", "questions", "it.json");

const NEW_QUESTIONS = [
// DĚTI (4 — pizza-tvar duplikát, vespa-barva misleading)
{
  "id": "it-k-gelato-barva",
  "cc": "it", "country": "Itálie", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Jakou barvu má pistáciové gelato?",
  "answer": "Zelenou",
  "distractors": ["Růžovou", "Hnědou", "Bílou"],
  "quip_correct": "Zelené jako listy pistácií — a chutná přesně tak dobře, jak vypadá.",
  "quip_wrong": "Růžové gelato je jahoda nebo malina — pistácie barví jinak.",
  "explanation": "Pistácie dávají gelatu typickou zelenou barvu i oříškovou chuť. Nejlepší pistáciové gelato pochází ze Sicílie, kde se pěstují pistácie z Brontë u Etny.",
  "about": "italském gelatu",
  "image_prompt": "A painterly watercolor illustration of a green pistachio gelato in a cone, vintage travel journal style"
},
{
  "id": "it-k-tiramisu-vrstva",
  "cc": "it", "country": "Itálie", "section": "Jídlo",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Co tvoří vrstvy v italském dezertu tiramisu?",
  "answer": "Piškoty",
  "distractors": ["Ovoce", "Čokoláda", "Ořechy"],
  "quip_correct": "Piškoty namočené v kávě — to je základ tiramisu!",
  "quip_wrong": "Čokoláda tiramisu jen posype navrch — ale vrstvy dělají piškoty.",
  "explanation": "Tiramisu se skládá z vrstev piškotů namočených v kávě a krému z mascarpone. Název znamená italsky 'potáhni mě nahoru' — prý proto, že dezert dodává energii.",
  "about": "tiramisu",
  "image_prompt": "A painterly watercolor illustration of a slice of tiramisu on a plate with cocoa dusting, vintage travel journal style"
},
{
  "id": "it-k-mandolina-nastroj",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Který malý italský hudební nástroj se drnká prsty nebo trsátkem a má hruškovitý tvar?",
  "answer": "Mandolína",
  "distractors": ["Kytara", "Housle", "Balalajka"],
  "quip_correct": "Mandolína zní jako italský přístav za letního večera.",
  "quip_wrong": "Kytara je příbuzná, ale mandolína je menší a má jiný tvar těla.",
  "explanation": "Mandolína se hojně používá v neapolské hudbě. Má osm strun ve čtyřech párech, které se ladí jako housle. Proslavila ji i filmová hudba, třeba v Godfather.",
  "about": "mandolíně",
  "image_prompt": "A painterly watercolor illustration of a mandolin on a wooden table, vintage travel journal style"
},
{
  "id": "it-k-koloseum-zvire",
  "cc": "it", "country": "Itálie", "section": "Místa",
  "difficulty": 1, "kids": true, "type": "choice",
  "question": "Které divoké zvíře bojovalo v aréně římského Kolosea?",
  "answer": "Lev",
  "distractors": ["Slon", "Žirafa", "Tučňák"],
  "quip_correct": "Lev byl králem arény — a publikum to zbožňovalo.",
  "quip_wrong": "Sloni v Koloseu taky byli, ale lvi byli nejslavnější hvězdou aréna.",
  "explanation": "V Koloseu se konaly venationes — zápasy gladiátorů s divokými zvířaty. Přiváželi tam lvy z Afriky, tygry z Asie i medvědy. Odhaduje se, že za staletí provozu tam zahynulo přes milion zvířat.",
  "about": "římském Koloseu",
  "image_prompt": "A painterly watercolor illustration of the Roman Colosseum with an arena scene, vintage travel journal style"
},

// PUBERŤÁCI (5 — it-t-italske-mesto-kanaly zamítnuto)
{
  "id": "it-t-florencie-kupole",
  "cc": "it", "country": "Itálie", "section": "Místa",
  "difficulty": 2, "type": "choice",
  "question": "Jak se jmenuje slavný florentský dóm s obrovskou cihlovou kupolí, která stojí v centru města bez vnější podpěry?",
  "answer": "Katedrála Santa Maria del Fiore",
  "distractors": ["Bazilika sv. Petra", "Katedrála v Miláně", "Bazilika sv. Marka"],
  "quip_correct": "Správně — kupole Brunelleschiho stojí bez podpěry od roku 1436 a architekti stále řeší, jak to udělal.",
  "quip_wrong": "Bazilika sv. Petra je ve Vatikánu, Marek v Benátkách — ta florentská kupole je jinde.",
  "explanation": "Filippo Brunelleschi navrhl kupoli bez lešení ani vnějších opěráků — způsobem, který tehdy nikdo neznal. Tajemství své techniky si vzal do hrobu.",
  "about": "Florentském dómu",
  "image_prompt": "A painterly watercolor illustration of Florence Cathedral dome against blue sky, vintage travel journal style"
},
{
  "id": "it-t-gorgonzola",
  "cc": "it", "country": "Itálie", "section": "Jídlo",
  "difficulty": 1, "type": "choice",
  "question": "Který italský sýr je charakteristický modrými žilkami plísně?",
  "answer": "Gorgonzola",
  "distractors": ["Parmigiano", "Mozzarella", "Pecorino"],
  "quip_correct": "Gorgonzola — modré žilky, silná vůně, nezaměnitelná chuť.",
  "quip_wrong": "Parmigiano je král strouhaných sýrů, ale modré žilky najdeš u jiného.",
  "explanation": "Gorgonzola pochází z Lombardie a Piemontu a je jedním z nejstarších italských sýrů — doklady o výrobě sahají do 10. století. Modré pruhy jsou forma plísně Penicillium glaucum.",
  "about": "sýru Gorgonzola",
  "image_prompt": "A painterly watercolor illustration of a wedge of Gorgonzola cheese with blue veins, vintage travel journal style"
},
{
  "id": "it-t-garda",
  "cc": "it", "country": "Itálie", "section": "Příroda",
  "difficulty": 2, "type": "choice",
  "question": "Které jezero je největší v Itálii?",
  "answer": "Lago di Garda",
  "distractors": ["Lago Maggiore", "Lago di Como", "Lago d'Iseo"],
  "quip_correct": "Lago di Garda — přes 300 km², středomořské klima a citroníky na březích.",
  "quip_wrong": "Lago di Como je slavnější díky filmům a celebrita, ale větší je Garda.",
  "explanation": "Lago di Garda leží na hranici Lombardie, Benátska a Tridentska. Na jeho jihozápadním břehu roste olivy a citrusy — tak mírné je tamní klima. Celý obvod jezera měří přes 150 km.",
  "about": "jezeře Lago di Garda",
  "image_prompt": "A painterly watercolor illustration of Lake Garda with mountains and olive trees, vintage travel journal style"
},
{
  "id": "it-t-fellini",
  "cc": "it", "country": "Itálie", "section": "Lidé",
  "difficulty": 2, "type": "choice",
  "question": "Který italský režisér natočil film La Dolce Vita a proslavil výraz 'paparazzi'?",
  "answer": "Federico Fellini",
  "distractors": ["Roberto Benigni", "Sergio Leone", "Luchino Visconti"],
  "quip_correct": "Fellini — vynalezl slovo paparazzi a zachytil sladký život Říma jako nikdo jiný.",
  "quip_wrong": "Sergio Leone dělal westerny ve španělské poušti, ne sladký život v Římě.",
  "explanation": "La Dolce Vita z roku 1960 přinesla do jazyka slovo 'paparazzi' — Fellini pojmenoval postavu fotografa Paparazzo. Dnes se slovo používá celosvětově.",
  "about": "Federicu Fellinim",
  "image_prompt": "A painterly watercolor illustration of a vintage Italian film set with director's chair, vintage travel journal style"
},
{
  "id": "it-t-lamborghini",
  "cc": "it", "country": "Itálie", "section": "Symboly",
  "difficulty": 1, "type": "choice",
  "question": "Proč má italská automobilka Lamborghini v logu býka?",
  "answer": "Zakladatel Ferruccio Lamborghini se narodil ve znamení býka — Taurus",
  "distractors": ["Lamborghini původně vyrábělo zemědělské traktory tažené býky", "Býk symbolizuje sílu motoru — každé auto bylo testováno závodem s býkem", "Logo vyhrál soutěž a navrhl ho místní malíř z Boloni"],
  "quip_correct": "Přesně — horoskop rozhodl o logu sportovního auta za miliony.",
  "quip_wrong": "Traktory Lamborghini skutečně vyráběl, ale logo s býkem má jiný důvod.",
  "explanation": "Ferruccio Lamborghini (1916–1993) se narodil 28. dubna — tedy ve znamení Býka (Taurus). Proto je na logu rozzuřený býk. Traktory Lamborghini, které vyráběl dřív, mají dodnes vlastní divizi.",
  "about": "automobilce Lamborghini",
  "image_prompt": "A painterly watercolor illustration of a Lamborghini car with bull logo detail, vintage travel journal style"
},

// DOSPĚLÍ (5 — 7 zamítnuto jako triviální nebo factual error)
{
  "id": "it-a-espresso-vstoje",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Jak se v Itálii tradičně pije espresso — a proč to tak je?",
  "answer": "Vstoje u baru — sedět se platí příplatek a Italové to považují za zdržování",
  "distractors": ["Vždy s mlékem, protože černá káva je pokládána za nevychovanost", "V malých hrnkových konvičkách s přidaným cukrem, ne v šálcích", "Výhradně ráno — odpolední espresso Italové nepijí"],
  "quip_correct": "Přesně — espresso se v Itálii vyřídí za dvě minuty vstoje. Sednout = zaplatit víc.",
  "quip_wrong": "Mléko do espressa? To je cappuccino — a to se po desáté hodině nepije, to taky ví každý Ital.",
  "explanation": "V italských barech platí duální tarif: caffe al banco (u pultu) je výrazně levnější než caffe al tavolo (u stolu). Systém existuje od 20. let jako daňová regulace.",
  "about": "italské kávové kultuře",
  "image_prompt": "A painterly watercolor illustration of a cup of espresso on a marble bar counter, vintage travel journal style"
},
{
  "id": "it-a-tarantella",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Proč se tradičnímu jižněitalskému tanci tarantella říká právě tak — a co to původně bylo?",
  "answer": "Podle legendy léčil kousnutí tarantule — nemocný tančil, dokud jed nevypotil",
  "distractors": ["Tanec vymyslel kněz Taranto jako rituál pro dožínkové slavnosti", "Název pochází z města Taranto, kde se poprvé tančil na námořnické oslavě", "Tarantella je zkomolené arabské slovo pro ohnivý tanec přinesený do Sicílie"],
  "quip_correct": "Přesně — lék tancem. Ve středověku dávalo smysl, že pavoučí jed vyléčí výpotkem.",
  "quip_wrong": "Město Taranto s tancem jistě souvisí, ale legenda o tarantuli je ta zajímavější část příběhu.",
  "explanation": "Tarantismus byl středověký fenomén v jižní Itálii — lidé kousnutí pavoukem upadali do hysterických záchvatů, které léčili extází z tance. Moderní vědci se přou, zda to byl skutečný jed nebo masová hysterie.",
  "about": "tanci tarantella",
  "image_prompt": "A painterly watercolor illustration of people dancing the tarantella in a southern Italian village, vintage travel journal style"
},
{
  "id": "it-a-farfalle",
  "cc": "it", "country": "Itálie", "section": "Jídlo",
  "difficulty": 3, "type": "choice",
  "question": "Těstoviny farfalle mají tvar mašle. Co jejich název doslova znamená — a proč právě to?",
  "answer": "Motýl — tvar mašle připomíná složená křídla",
  "distractors": ["Luček — protože se stahují uprostřed jako luk na šíp", "Vrabec — pekaři je prý tvarovali rychle jako vrabčí poskočení", "Pták — pro inspiraci přírodou v renesanční kuchyni"],
  "quip_correct": "Motýl na talíři — a omáčka se hezky schová v záhybech křídel.",
  "quip_wrong": "Luk ani vrabec — farfalle jsou motýli, i když záhyb v pase připomíná mašli.",
  "explanation": "Farfalle pocházejí z oblasti Emilia-Romagna a Lombardie. Tvar není jen estetický — záhyby zadržují omáčku lépe než rovné těstoviny. V dialektu se jim říká také strichetti nebo gasse.",
  "about": "těstovinách farfalle",
  "image_prompt": "A painterly watercolor illustration of farfalle pasta scattered on a wooden surface, vintage travel journal style"
},
{
  "id": "it-a-collodi-pinokio",
  "cc": "it", "country": "Itálie", "section": "Kultura",
  "difficulty": 3, "type": "choice",
  "question": "Carlo Collodi napsal Pinochia — ale co na původním příběhu bylo zcela jinak než v Disneyho verzi?",
  "answer": "V originále Pinokio cvrčka zabije a nakonec zůstane dřevěnou loutkou bez odměny",
  "distractors": ["Pinokio byl v originále dívka, pohlaví změnil Collodi až v druhém vydání", "Původní příběh se odehrával v Americe — Itálie jako kulisa přibyla až v překladu", "Kolibřík, ne Cvrček byl původní Pinokiovo svědomí — to Disney přejmenoval"],
  "quip_correct": "Přesně — Collodi původně napsal morality tale bez happy endu. Cvrček umřel v první kapitole.",
  "quip_wrong": "Pohlaví ani zeměpis Collodi neměnil — ale konec byl původně mnohem drsnější.",
  "explanation": "Collodi vydával příběh v novinách od roku 1881 a v původním konci Pinokio skončil oběšen. Čtenáři ho donutili pokračovat — pak přišla modrá víla a happier ending. Knižní verze z roku 1883 je kompromis.",
  "about": "Pinociovi",
  "image_prompt": "A painterly watercolor illustration of Pinocchio as a wooden puppet on strings, vintage travel journal style"
},
{
  "id": "it-a-pompeje-odlitky",
  "cc": "it", "country": "Itálie", "section": "Historie",
  "difficulty": 3, "type": "choice",
  "question": "Jak vznikly slavné odlitky těl v Pompejích — a co na nich překvapilo vědce?",
  "answer": "Vědci plnili sádrový odlitek do dutin v popelu — a tělům jsou vidět i výrazy obličeje v okamžiku smrti",
  "distractors": ["Těla byla zakonzervovaná žárem a přirozeně mumifikovaná podobně jako v Egyptě", "Domy je uzavřely před popelem — těla pak jen zkameněla za staletí pod tlakem", "Sopka je pokryla vrstvou lávou a těla se zachovala pod pevnou krustou"],
  "quip_correct": "Přesně — sádrový odlitek do prázdného prostoru zachoval i grimasy. Věda ze smutku.",
  "quip_wrong": "Mumifikace ani láva — sopka pohřbila město popelem a plyny, ne lávou.",
  "explanation": "Giuseppe Fiorelli přišel na metodu sádrových odlitků v roce 1863. V dutinách, kde se rozložila organická hmota, zůstal přesný negativ těl. Odlitky jsou tak detailní, že vidíme záhyby oblečení i výrazy tváří.",
  "about": "Pompejích",
  "image_prompt": "A painterly watercolor illustration of Pompeii ruins with Vesuvius in the background at sunset, vintage travel journal style"
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
