// Zvětšený výřez pochybného místa. „Písmena“ bývají knoflíky a naopak — z náhledu 600 px
// se to nepozná ani nahoru, ani dolů. Souřadnice jsou v PROCENTECH obrázku.
//   node scripts/ilustrace/vyrez.js cz-q-neco 30 70 25 20        (levý, horní, šířka, výška)
//   node scripts/ilustrace/vyrez.js cz-q-neco 30 70 25 20 8      (+ zvětšení, výchozí 5×)
// Výsledek jde do .ilustrace/vyrezy/{id}.jpg (gitignorováno).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const KOREN = path.resolve(__dirname, "..", "..");
const OUT = path.join(KOREN, ".ilustrace", "vyrezy");
const [id, l, t, w, h, z] = process.argv.slice(2);
if (!id || w === undefined) throw new Error("node vyrez.js <id> <levý%> <horní%> <šířka%> <výška%> [zvětšení]");
const zoom = z ? parseFloat(z) : 5;
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const f = path.join(KOREN, "img", id + ".jpg");
  const m = await sharp(f).metadata();
  const box = {
    left: Math.round(m.width * parseFloat(l) / 100), top: Math.round(m.height * parseFloat(t) / 100),
    width: Math.round(m.width * parseFloat(w) / 100), height: Math.round(m.height * parseFloat(h) / 100),
  };
  const cil = path.join(OUT, `${id}-${l}_${t}_${w}_${h}.jpg`);
  await sharp(f).extract(box).resize(Math.round(box.width * zoom), Math.round(box.height * zoom))
    .jpeg({ quality: 90 }).toFile(cil);
  console.log(cil);
})();
