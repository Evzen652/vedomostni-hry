// Překryje obdélník (logo, podpis uprostřed scény) kouskem TÉHOŽ obrázku posunutým
// svisle o posunY, se změkčenými okraji. Funguje tam, kde nad/pod vadou je stejná textura
// (voda, svislé pruhy dresu). Záplata musí vadu přesahovat, jinak zůstanou konečky.
//   node scripts/ilustrace/zaplata.js img/x.jpg img/x.jpg 600 400 120 90 -150
// Souřadnice v pixelech obrázku: x y šířka výška posunY.
const fs = require("fs");
const sharp = require("sharp");
sharp.cache(false);
const [vstup, vystup, x, y, w, h, dy] = process.argv.slice(2);
if (dy === undefined) throw new Error("node zaplata.js <vstup> <výstup> x y w h posunY");
const [X, Y, W, H, DY] = [x, y, w, h, dy].map(n => parseInt(n, 10));
(async () => {
  const buf = fs.readFileSync(vstup);
  const kus = await sharp(buf).extract({ left: X, top: Y + DY, width: W, height: H }).png().toBuffer();
  const maska = Buffer.from(
    `<svg width="${W}" height="${H}"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%">` +
    `<stop offset="70%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#g)"/></svg>`);
  const kusMask = await sharp(kus).joinChannel(await sharp(maska).greyscale().png().toBuffer()).png().toBuffer();
  const out = await sharp(buf).composite([{ input: kusMask, left: X, top: Y }]).jpeg({ quality: 84 }).toBuffer();
  fs.writeFileSync(vystup, out);
  console.log("hotovo");
})();
