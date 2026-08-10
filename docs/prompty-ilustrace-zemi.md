# Prompty pro ironické ilustrace zemí

Zásobník promptů pro dlaždice `assets/country-{cc}.jpg`. Generuje se ručně v **Gemini**
(1024×1024 PNG), stáhne do `D:\weigle\stažené soubory` a převede skriptem:

```powershell
powershell -File scripts/crop-gemini-frame.ps1 -In "D:\weigle\stažené soubory\Gemini_....png" -Out assets/country-fr.jpg
```

Postup, styl a pasti generování viz sekce **Ilustrace** v [CLAUDE.md](../CLAUDE.md).

---

## Recept — jak prompt stavět

1. **Jedna ikonická dominanta** země (nezaměnitelná stavba/symbol) — dá obrázku střed.
2. **Hlavní vtip sedí PŘÍMO na té dominantě** — čitelný i ve zmenšené dlaždici.
3. **Max. 3 vedlejší gagy**, výslovně „smaller and subordinate" — nesmí konkurovat hrdinovi.
4. **Jedna scéna, jedna perspektiva** — „one single continuous scene with one clear focal point".

**Kontrolní otázka před generováním:** *Kdo v té scéně dělá něco absurdního, aniž by mu to
přišlo divné?* Když odpověď není, vtip tam není — je to jen ilustrovaný fakt. Tak vypadl první
pokus o Bulharsko (tuny růží → jedna kapka oleje): scéna měla poměr, ne pointu. Ve všech
funkčních promptech níž je někdo, komu je situace úplně samozřejmá — sochy si připíjejí,
panda blokuje zeď, dělníci hrají tavli místo opravy, Švédi si obří masové koule nevšímají.

## Šablona

První a třetí odstavec jsou u všech zemí prakticky stejné, mění se jen prostřední:

> A vintage travel-journal illustration of **{Country}**, painted in delicate watercolor with fine ink
> line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the
> entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge,
> no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all
> the way to the edges of the image.
>
> One single continuous scene with one clear focal point, gently satirical, played for a warm knowing
> smile: **{dominanta + hlavní vtip}**. Smaller and subordinate: **{max 3 gagy}**. **{pozadí}**.
>
> Muted natural palette — **{4–6 barev scény}**, cream paper showing through. Warm, affectionate irony,
> not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn
> storybook feel. Square 1:1 composition.

Pozn.: `no numbers` se do zákazu doplnilo až po prvních zemích — modely jinak vpisují na cedule
a ciferníky nesmyslné číslice.

---

# Hotové (vygenerované a nasazené)

Česko, Německo a USA vznikly dřív; prompt k nim se nezachoval kromě Česka, které slouží jako
referenční vzor stylu.

## Česko — sochy na Karlově mostě si připíjejí

```text
A vintage travel-journal illustration of Czechia, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: the Charles Bridge in Prague stretches across the Vltava toward the viewer, its gothic bridge tower rising at the end, and along both stone balustrades the row of blackened baroque saint statues has quietly set aside their crosses and staffs — every single statue is instead raising a foaming beer stein, mid-toast, all leaning slightly toward each other as if clinking glasses above the heads of the passers-by. Smaller and subordinate on and below the bridge: a mushroom picker in a knitted cap crossing with a wicker basket overflowing with mushrooms; a handyman on a ladder repairing a lamppost with an improvised tangle of wire and tape; and on the river below, a man asleep in a deckchair on a tiny wooden boat, a beer resting on his belly. Prague Castle with its gothic cathedral sits on the hill in the hazy background, red-tiled roofs of the old town below it.

Muted natural palette — warm terracotta roofs, weathered green-black bronze, cream stone, dusty blue river, amber beer, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Francie — Eiffelovka v baretu

```text
A vintage travel-journal illustration of France, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: the Eiffel Tower rises in the middle of the scene wearing an enormous soft wool beret tilted rakishly over its top platform, a long striped scarf wound around its upper level and trailing in the breeze, the whole tower leaning very slightly back on its four legs, as relaxed as a café regular who has all afternoon. Smaller and subordinate around its feet: a waiter in a long white apron gliding between pavement tables with a tray held impossibly high on his fingertips; a small dog sitting upright on its own bistro chair with a bowl set on the table in front of it while its owner reads a folded newspaper; and a baker wobbling past on a bicycle with an armful of long baguettes, one of them tucked under his chin. Haussmann rooftops with rows of chimney pots and a hazy line of plane trees fill the background.

Muted natural palette — pale limestone cream, warm grey zinc rooftops, dusty rose awnings, soft olive-green trees, dark wrought iron, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Velká Británie — Big Ben s konvicí a nekonečná fronta

```text
A vintage travel-journal illustration of the United Kingdom, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: the great gothic clock tower of Big Ben rises beside the Houses of Parliament, but instead of its spire the top is crowned by an enormous gently steaming china teapot, tipped forward as if about to pour, and the clock hands have stopped precisely at teatime. Smaller and subordinate below: an impossibly long and perfectly orderly queue of people under black umbrellas, curling around the base of the tower and away around the corner, everyone patiently and equally spaced; a motionless guardsman in a tall bearskin hat standing in the drizzle, water running off his nose while he refuses to blink; and a red double-decker bus stopped patiently in the road to let one single pigeon walk across. Wet cobbles reflecting a grey sky, the river and a stone bridge hazy in the background.

Muted natural palette — wet slate grey, honey-coloured stone, deep umbrella black, muted brick-red bus, pale cream sky, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Japonsko — automaty na vrcholu Fudži

```text
A vintage travel-journal illustration of Japan, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: snow-capped Mount Fuji rises in the centre of the scene, and on its very summit, where the crater should be, stands a neat glowing row of tall vending machines, with a small orderly queue of hikers waiting their turn, their backpacks lined up in a tidy row beside them and one hiker holding a hot can in both hands. Smaller and subordinate below: a bullet train streaking along the foot of the mountain while a station master on the platform stares at his pocket watch in horror at being three seconds late; a salaryman in a dark suit fast asleep bolt upright on a bench, briefcase still on his knees; and a cat sitting under a wooden torii gate with one paw raised in greeting like a lucky-cat figurine. Cherry blossom trees and low tiled roofs fill the hazy foreground.

Muted natural palette — snow white and pale blue-grey mountain, dusty pink blossom, soft teal train, weathered cedar brown, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Maďarsko — šachy v lázních, dokud jeden hráč nezkamení

```text
A vintage travel-journal illustration of Hungary, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: the grand ochre neo-baroque facade of the Széchenyi thermal baths curves around a steaming outdoor pool, and in the water two elderly men in swimming caps face each other over a floating chessboard — they have been deliberating this one move for so long that the player on the left has quietly turned into a weathered stone statue, moss on his shoulders, hand still hovering over a piece, while his opponent waits with infinite patience, chin on fist, entirely unbothered. Smaller and subordinate: a bather reading a newspaper propped on the pool edge, submerged to the neck, steam curling around him; strings of dried red paprika hanging from a balcony above the colonnade; and a violinist in a full dark suit playing seriously while standing waist-deep in the water. The domes and spires of Budapest and a bridge over the Danube sit hazy in the background.

Muted natural palette — pale ochre and mustard plaster, steamy green-blue water, verdigris copper domes, warm paprika red, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Thajsko — opice si vybírá výkupné

```text
A vintage travel-journal illustration of Thailand, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: on the ornate tiered roof and stone balustrade of a golden temple sits a troop of macaques who have plainly taken the place over — the largest of them lounges on the balustrade wearing a pair of stolen sunglasses and cradling a stolen phone, entirely at ease, while below him a small delegation of tourists holds up three different bananas as ransom and the monkey inspects the offering with the slow disdain of a customs officer choosing which bribe is acceptable. Smaller and subordinate: two younger macaques on the roof ridge fighting over a straw hat and tearing it in half; a tuk-tuk driver dozing in his vehicle at the gate, feet up, thoroughly used to all of this; and a street vendor guarding her fruit cart with a broom held like a spear, the only person present with a working strategy. Palms, gilded spires and warm haze fill the background. The monkeys sit only on rooftops, walls and railings, never on any religious statue.

Muted natural palette — gilded ochre gold, deep teak brown, dusty jade green, terracotta roof tiles, warm haze, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

---

# Připravené (zatím nevygenerované)

## Nizozemsko — mlýn jako stojan na kola

```text
A vintage travel-journal illustration of the Netherlands, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: a great wooden windmill stands beside a canal, but its four sails have been completely taken over as a bicycle rack — dozens of black bicycles hang locked and stacked along every sail, wheels interlocking, so the mill is jammed solid and cannot turn at all, while the miller stands at its foot with folded arms, resigned, holding one more bicycle he has nowhere to put. Smaller and subordinate around it: a row of tall narrow canal houses leaning drunkenly against each other for support, their gables at different angles; a cyclist pedalling past carrying two children, a crate of tulips and a dog on one single bicycle while calmly eating a sandwich, no hands on the handlebars; and a flat barge drifting down the canal with one placid cow standing on it, chewing and staring at the viewer. Flat green polder fields and a huge low sky fill the background.

Muted natural palette — brick red and dark green shutters, grey-green canal water, cream plaster, weathered timber, pale grey sky, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Řecko — lešení starší než oprava

```text
A vintage travel-journal illustration of Greece, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: the marble temple of the Parthenon stands on its rock wrapped in restoration scaffolding — but the scaffolding has itself stood there so long that it has gone rusty, sprouted weeds and grown its own patina, becoming part of the monument; halfway up it two workmen sit in the shade playing backgammon on an upturned crate, their tools untouched and furred with dust beside them, one of them stirring an iced coffee. Smaller and subordinate: several cats sprawled proprietorially across fallen column drums, occupying the ruins with far more confidence than the tourists; a sunburnt visitor in an enormous straw hat wrestling with a map in the blinding heat; and a single crane standing motionless over the temple, plainly out of service, with a bird nesting in its arm. Olive trees, dry rock and a hazy blue sea horizon fill the background.

Muted natural palette — bleached white marble, dusty ochre stone, faded rust-orange scaffolding, olive green, dusty Aegean blue haze, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Švédsko — švédský stůl jako celodenní túra

Finální varianta. Zavržené pokusy: chalupa z plochého balení (IKEA jen v náznaku), panáček
z montážního návodu v životní velikosti, obří masová koule (statická i valící se) — všechny
měly vtip, ale míň čitelný ve zmenšení.

```text
A vintage travel-journal illustration of Sweden, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: an impossibly long buffet table covered in a white cloth runs from the very front of the picture straight back into the distance, leaving a falu-red timber cottage, crossing a little wooden bridge, skirting the lake and finally vanishing over the horizon between the pines, loaded end to end with dishes of herring, potatoes, crispbread and meatballs. The guests are treating it as a hiking route rather than a meal: they walk its length with rucksacks, trekking poles and a folded map, one of them resting on a dining chair as if at a viewpoint, another far away on the skyline raising his plate in triumph like a summiteer who has finally reached the meatballs — and every single plate in the picture holds nothing but three small pieces of herring and one boiled potato. Smaller and subordinate: an elk standing at the table grazing calmly from a salad bowl while nobody reacts at all; a waiter cycling along the length of the table with a tray balanced on one hand; and a small dog trotting underneath the tablecloth, its shape bulging along the whole line.

Muted natural palette — falu red timber, chalky white linen, dusty pine green, cool grey-blue lake, pale birch, soft ochre crispbread, cream paper showing through. Strong one-point perspective down the length of the table to give the scene its focal line. Warm, affectionate irony, not cynical. Nobody finds any of this strange — that is the joke. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Bulharsko — jogurt a dlouhověkost

Druhá varianta (kývání hlavou naopak, ano = ne) měla lepší vtip, ale stojí a padá s tím, jestli
model zvládne naznačit pohyb hlavy; proto je jako hlavní vedená tahle.

```text
A vintage travel-journal illustration of Bulgaria, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: on a long wooden bench outside a whitewashed stone-and-timber mountain house, under a heavy vine, sits a row of implausibly ancient men in flat caps — white-bearded, weathered, at least a century each — all eating yoghurt from clay pots with wooden spoons in complete silence, while a clay churn the size of a barrel stands at the end of the bench being refilled. The one doing the serving, carrying the tray up and down the row and being ordered about by the others, is himself an old man of ninety with a white moustache, plainly treated as the boy of the family. Smaller and subordinate: a great-great-grandchild asleep in the lap of the oldest man, who has not stopped eating; a goat standing on the low stone wall with its head in a spare yoghurt pot; and a woman hanging bunches of red peppers to dry along the porch rail, paying none of them any attention. Terraced fields, haystacks and hazy blue mountains fill the background.

Muted natural palette — whitewashed lime plaster, dark weathered timber, cream yoghurt white, dusty paprika red, olive and sage green, hazy blue mountains, cream paper showing through. Warm, affectionate irony, not cynical. The joke is that the ninety-year-old is the youngster running errands. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Rumunsko — upír jako přepracovaný maskot

```text
A vintage travel-journal illustration of Romania, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: a steep gothic castle with pointed turrets clings to a rock above a misty Carpathian forest, and at its gate a tall pale count in a black cloak with a high collar is working as a photo mascot — visibly exhausted, bags under his eyes, baring his fangs on cue for the hundredth selfie of the day while a queue of cheerful tourists waits its turn, one child pulling at his cloak. Above him, along the castle eaves, a whole row of bats hangs upside down watching the scene with mild professional disapproval. Smaller and subordinate: a brown bear sitting patiently on the hairpin bend of the mountain road below, accepting a biscuit from a car window with the calm of an official collecting a toll; a souvenir stall of plastic fangs and painted wooden trinkets doing brisk business at the gate; and a shepherd on the far slope with an enormous flock and two huge dogs, entirely uninterested in any of it. Layered misty pine ridges fill the background.

Muted natural palette — slate grey castle stone, dark pine green, dusty red roof tiles, faded black cloak, ochre mist, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Ukrajina — jeden kotel boršče, deset správných receptů

```text
A vintage travel-journal illustration of Ukraine, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: in the middle of a village square, beneath a church crowned with golden onion domes, a cauldron of deep crimson borscht the size of a bathtub steams over an open fire — and around it stands a tight ring of grandmothers in embroidered blouses and headscarves, each armed with her own wooden spoon, all talking at once and all plainly convinced that only her recipe is the correct one; one of them is leaning in from behind to add a secret handful of something while the others argue, and a dollop of sour cream is being defended by another with her whole body. Smaller and subordinate: a whole field of sunflowers along the fence that have all turned away from the sun to face the cauldron instead; a cat on the woodpile licking sour cream off its whiskers with an expression of total innocence; and a small boy quietly stealing a piece of bread from the table while every adult is busy disagreeing. Whitewashed cottages with thatched roofs and wheat fields fill the background.

Muted natural palette — golden ochre domes, soft sunflower yellow, deep beetroot crimson, whitewashed walls, dusty wheat, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Turecko — kočky jako majitelé Istanbulu

```text
A vintage travel-journal illustration of Turkey, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: the great domes and slender minarets of an Istanbul skyline rise above the rooftops, and every single ledge, cornice, dome and balcony is occupied by a sprawling, entirely relaxed cat — one enormous ginger cat lies stretched out belly-up on the very summit of the main dome like a landlord surveying property, while the seagulls circle at a respectful distance, plainly not permitted to land. Smaller and subordinate: down in the courtyard a carpet seller has unrolled his finest rug across the whole width of the lane to show a customer, and both men now stand helplessly over the cat asleep in the exact centre of it, neither daring to move her; a tea waiter picking his way up a stairway with a swaying tray of thirty tulip glasses, one cat riding on the tray as a passenger; and a fisherman on the waterfront below sharing his catch with three more cats sitting in a neat expectant row. The Bosphorus, ferries and a hazy far shore fill the background.

Muted natural palette — warm terracotta and lead-grey domes, faded turquoise tilework, dusty rose and madder carpet reds, amber tea, hazy blue water, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Indie — dokonalá symetrie a jedna a tatáž fotka

```text
A vintage travel-journal illustration of India, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: the white marble dome and four minarets of the Taj Mahal stand in perfect mirror symmetry beyond their long reflecting pool — and lined up along that pool, in a row stretching right across the picture, stands a crowd of visitors all doing exactly the same thing at exactly the same moment: every single one of them pinching the distant dome between finger and thumb for a photograph, arms outstretched in identical pose, like a synchronised ritual nobody has ever questioned. One flustered latecomer in the middle cannot find a free spot and is being politely elbowed along the row. Smaller and subordinate: a cow lying serenely across the entrance road outside the gate while cycle rickshaws, a scooter carrying four people and a bus with luggage roped to its roof all thread patiently around her without a single complaint; a chai seller working the queue with a tray of tiny clay cups; and a troop of monkeys on the garden wall watching the pinching ritual with visible bafflement. Hazy warm dust, formal gardens and cypress trees fill the background.

Muted natural palette — bleached white marble, dusty ochre stone, marigold orange, faded turquoise, warm dust haze, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Mongolsko — orel obsadil satelit

```text
A vintage travel-journal illustration of Mongolia, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: a single round white felt ger stands alone in an immense empty steppe under a vast sky, with a small solar panel and a satellite dish set up beside its painted wooden door — and perched squarely on the satellite dish, wings half spread, sits an enormous golden eagle who has decided this is now his rock and will not be moved; in front of him the eagle hunter, in a heavy fur-trimmed coat and fur hat, stands with his hat in his hands, negotiating with the bird with elaborate courtesy, while the rest of the family waits in the doorway to find out whether the wrestling match will be watchable tonight. Smaller and subordinate: a horse tied up beside a battered motorcycle, the two of them regarding each other with mutual suspicion; a herd of yaks drifting past in the middle distance, unhurried; and a small child on horseback riding effortlessly with no saddle, holding a bowl of tea without spilling it. Endless sun-bleached grassland and low blue hills fill the background.

Muted natural palette — sun-bleached pale grass, felt white ger, weathered orange painted door, dusty blue sky, chestnut horses, cream paper showing through. Warm, affectionate irony, not cynical. The joke is a man politely bargaining with a bird. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Vietnam — babička převádí turistu přes řeku skútrů

```text
A vintage travel-journal illustration of Vietnam, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: a narrow old-quarter street is filled bank to bank with an unbroken river of scooters flowing in every direction at once, and stranded on the kerb stands a wide-eyed tourist frozen with terror, unable to cross — while a tiny elderly woman in a conical straw hat has taken him firmly by the wrist and is walking straight out into the traffic at an unhurried pace without once looking up, the entire torrent of scooters parting smoothly around the pair of them as if she had planned it. Smaller and subordinate: one scooter carrying an impossible load of a wire cage of ducks, a stack of trays of eggs and a small potted tree, the rider steering with one hand; a family of five riding on a single scooter, the smallest child asleep; and a man sitting on a low plastic stool at the very edge of the road eating a bowl of pho in perfect calm, inches from the wheels. Faded ochre colonial shophouses, tangled overhead cables and hanging plants fill the background.

Muted natural palette — faded ochre colonial plaster, weathered teal shutters, dusty jade green, straw-hat cream, warm street dust, cream paper showing through. Warm, affectionate irony, not cynical. The old woman is the only person in the picture who is not worried. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Jižní Korea — kurýr s jídlem na vrcholu hory

```text
A vintage travel-journal illustration of South Korea, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: on a granite mountain summit with a small tiled wooden pavilion, high above a hazy skyline of distant tower blocks, a food delivery rider in a helmet has just arrived on foot up the last rocks, insulated box on his back, and is handing over boxes of fried chicken to a group of hikers — hikers who are equipped for a polar expedition, every one of them in matching brand-new high-end technical jackets, gaiters and twin trekking poles, for a walk of two hours. Nobody finds either of these things remarkable. Smaller and subordinate: one hiker filming himself with a phone on a selfie stick and a ring light balanced on a rock; an older couple who have unpacked a full picnic with side dishes in a dozen little metal containers spread across the pavilion floor; and a stray cat sitting at the summit expectantly, clearly the regular beneficiary of all of this. Pine-covered granite ridges and a haze of city towers fill the background.

Muted natural palette — pale granite grey, dusty pine green, weathered timber red-brown, muted technical-jacket blues, hazy city ochre, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Severní Korea — dopravní policistka řídí prázdnou křižovatku

```text
A vintage travel-journal illustration of North Korea, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: an immense eight-lane boulevard lined with identical pastel concrete apartment blocks runs away toward a distant pyramid-shaped tower still wrapped in construction scaffolding — and the boulevard is completely, spotlessly empty. At the centre of the crossroads a traffic officer in a crisp uniform and white gloves is directing this nothing with magnificent precision, mid-pivot, baton extended, waving through an intersection where the only vehicle is one small car so far away it is barely a dot. Smaller and subordinate: a group of pedestrians crossing in a perfectly straight line, evenly spaced, all in step; two women sweeping an already immaculate pavement with straw brooms; and a lone crane on the unfinished tower that has visibly not moved in years, a bird nesting in its arm. Wide pale sky, distant grey hills and rows of identical windows fill the background.

Muted natural palette — pale concrete grey, faded mint and rose pastel facades, dusty asphalt, muted uniform blue, cold cream sky, cream paper showing through. Warm, affectionate irony, not cynical — the comedy is the emptiness and the seriousness with which it is managed. No flags, no emblems, no portraits, no statues of people, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Indonésie — fronta na jediné fotogenické místo

```text
A vintage travel-journal illustration of Indonesia, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: emerald rice terraces step down a valley below a hazy volcano, and at the lip of the highest terrace hangs a single rope swing over the drop — with an enormous orderly queue of visitors snaking back along the ridge waiting their turn at it, each holding a bundle of flowing fabric to be arranged mid-swing, while the one currently on the swing is being photographed by three friends crouched in the mud at different angles. Below them, entirely unbothered, an elderly farmer in a conical hat walks his water buffalo along the terrace edge through the queue, doing the actual work the terraces are for. Smaller and subordinate: a split stone temple gateway at the top of the path with small woven palm-leaf offerings laid at its base, one of which a dog is sniffing hopefully; a scooter parked at the trailhead loaded with a stack of surfboards taller than itself; and a line of ducks filing through the flooded paddy in perfect formation, the only other queue in the picture. Layered green terraces and a smoking volcano fill the background.

Muted natural palette — deep paddy green, wet clay ochre, dark volcanic grey, faded saffron and white cloth, warm haze, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Malajsie — durian vynášen jako výbušnina

```text
A vintage travel-journal illustration of Malaysia, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: in front of a grand hotel entrance, beneath the twin silver towers and their sky bridge rising into the haze behind, a uniformed doorman in white gloves is carrying a single spiky durian out to the street at arm's length with a pair of long tongs, holding it as carefully as an unexploded bomb, cheeks puffed, head turned away — while a semicircle of bystanders backs away holding their noses and a small dog flees the scene entirely. In the middle of them all sits one contented old man on a plastic stool, eating a second durian with his fingers in complete bliss, eyes closed, oblivious to the evacuation happening around him. Smaller and subordinate: a fruit seller at the kerb calmly splitting more of them open with a cleaver, supply unaffected by demand; a row of cats watching from a wall with expressions of deep suspicion; and a hawker stall with steaming pots doing brisk business regardless. Tropical palms, tangled cables and glass towers in warm haze fill the background.

Muted natural palette — spiky khaki-green durian, creamy custard yellow, warm terracotta pavement, hazy silver-grey towers, dusty jungle green, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Filipíny — jeepney s karaoke na střeše

```text
A vintage travel-journal illustration of the Philippines, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: a long chrome-covered jeepney, painted all over with swirls and hung with mirrors and dangling ornaments, has stopped in a village street — a full karaoke set is strapped to its roof with rope, wired to a car battery, and the driver is leaning out of his window singing a ballad into a microphone with his eyes closed and his whole heart, while the passengers packed shoulder to shoulder inside sing the harmonies and one man on the roof holds the speaker steady. Everybody is completely serious about the performance; nobody is going anywhere. Smaller and subordinate: a passenger holding a fighting cock on his lap, the bird looking deeply unimpressed; a tiny tarsier clinging to a branch overhanging the road with its enormous eyes screwed shut against the volume, tiny hands over its ears; and a woman calmly selling grilled skewers from a cart alongside the stopped vehicle, having correctly predicted this would take a while. A perfect cone volcano, coconut palms and tin roofs fill the background.

Muted natural palette — polished chrome silver, faded carnival reds and blues, dusty road ochre, tropical green, warm haze, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Tchaj-wan — startovní rošt skútrů

```text
A vintage travel-journal illustration of Taiwan, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: at a wide city crossroads beneath a tapering tiered skyscraper that rises like a stack of boxes into the mist, two hundred scooters are massed at the stop line in a dense, perfectly disciplined grid — riders in pastel rain ponchos and helmets crouched forward over their handlebars like a Grand Prix starting grid, front wheels exactly level, everyone leaning into the launch, waiting for the light with total competitive seriousness. One rider in the front row is calmly sipping a bubble tea clipped to the handlebars, straw in mouth, entirely relaxed while everyone around him coils to sprint. Smaller and subordinate: a night-market stall of stinking tofu on the corner, its vendor fanning the steam directly at a tourist who is backing away with watering eyes; a small dog riding in the front basket of one scooter wearing its own tiny poncho; and an old woman crossing the road at her own pace, in front of the entire grid, which does not dare move. Misty green mountains behind the city fill the background.

Muted natural palette — pale misty grey-green towers, pastel poncho pinks and mints, wet asphalt, warm street ochre, dusty jade mountains, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Izrael — plavčík, kterému se nikdo nemůže utopit

```text
A vintage travel-journal illustration of Israel, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: the flat mineral-blue water of the Dead Sea stretches out below bare ochre desert cliffs, and bobbing on its surface, half out of the water like corks, float a dozen entirely relaxed bathers — one reading an open newspaper, another doing a crossword, a third asleep — none of them able to sink even if they tried. On his tall white chair above them sits the lifeguard, the most redundant man in the region, slumped with his chin on his fist in an agony of boredom, whistle unused around his neck, watching people who are physically incapable of needing him. Smaller and subordinate: one determined swimmer attempting a proper front crawl and going absolutely nowhere, legs popping back up behind him; two men playing backgammon on a small board balanced on a float between them, taking it extremely seriously; and a fully mud-covered woman standing on the salt-crusted shore reading a paperback, caked grey from head to foot, unhurried. Salt crystal formations, ochre cliffs and a hazy far shore fill the background.

Muted natural palette — pale mineral turquoise, chalky salt white, ochre and rose desert rock, sun-bleached timber, dusty grey mud, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Pákistán — kriket má přednost před kamionem

```text
A vintage travel-journal illustration of Pakistan, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: on a narrow mountain road cut into the flank of an immense snow-capped Karakoram wall, a magnificently decorated truck stands halted — every panel painted with flowers, birds and swirling patterns, hung with chains and little jingling pendants, its wooden crown towering with cargo far above the cab. It has been stopped by a street cricket match: the children have set their wicket in the middle of the road and are refusing to move until the over is finished, the batsman taking his stance directly in front of the radiator grille. The driver, entirely unbothered, has got out with a cloth and is polishing his truck's ornaments while he waits, watching the game with professional interest and calling advice. Smaller and subordinate: a queue of one jeep and one loaded donkey cart waiting patiently behind, the donkey asleep; a goat that has climbed onto the truck's cargo and is surveying the valley; and a roadside seller with a pyramid of mangoes and a kettle, doing excellent business off the delay. Vast snow peaks and a river gorge fill the background.

Muted natural palette — faded enamel greens, blues and rose on the truck, dusty ochre road, cold blue-white snow peaks, sun-bleached rock, mango yellow, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

## Saúdská Arábie — soutěž krásy velbloudů

```text
A vintage travel-journal illustration of Saudi Arabia, painted in delicate watercolor with fine ink line work on aged cream paper with brown stains and foxing spots. The aged paper texture fills the entire image and continues past all four edges, cropped by the frame — full bleed, so no paper edge, no torn edge, no white margin and no drawn frame line are visible anywhere. The scene itself runs all the way to the edges of the image.

One single continuous scene with one clear focal point, gently satirical, played for a warm knowing smile: on a carpet laid out over the desert sand in front of a black goat-hair tent, a single camel stands in a magnificent pose — chin lifted, lips pouting, one foot forward, holding the position like a fashion model — while a panel of three judges in flowing white robes examines it with total gravity, one crouching to inspect its knees, one peering at its lips through a magnifying glass, and one making notes on a clipboard with the frown of a man weighing an important decision. Smaller and subordinate: the camel's owner buffing its flank with a cloth and combing the hump into shape moments before judging; a rival camel in the background chewing the ceremonial ribbon it was supposed to be awarded; and, in the shade of the tent, a servant pouring cardamom coffee into a tiny cup for a guest who is holding out a hand in protest, having already drunk five. Rolling dunes, a few date palms and a hazy line of distant glass towers fill the background.

Muted natural palette — warm sand ochre, black goat-hair tent, faded crimson and indigo carpet, chalk-white robes, dusty gold haze, cream paper showing through. Warm, affectionate irony, not cynical. No flags, no readable text, no words, no letters, no numbers, no signage. Hand-drawn storybook feel. Square 1:1 composition.
```

---

## Zbývá vymyslet

Bez promptu jsou zatím: Argentina, Austrálie, Brazílie, Egypt, Ekvádor, Fidži, Gabon, Chile,
Kanada, Keňa, Mexiko, Nový Zéland, Peru, Jihoafrická republika. K tomu tři země, které mají
starou dlaždici z pollinations ve slabší kvalitě a stálo by za to je přegenerovat ironicky:
**Polsko, Slovensko, Rusko**; a čtyři z Gemini, které jsou hezké, ale bez vtipu:
**Rakousko, Švýcarsko, Španělsko, Itálie**.
