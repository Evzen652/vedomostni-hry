// Odřízne spodní pruh (typicky s podpisem) a vrátí obrázek na původní rozměr 1344×768.
// Vezme horních N řádků, ořízne stejně z obou stran (poměr zůstane 7:4) a zvětší zpět.
// Hodí se jen tehdy, když u spodního kraje nestojí nic podstatného; jinak přegenerovat.
//   node scripts/ilustrace/orez.js be-a-nato 700
// Přepisuje img/{id}.jpg na místě.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const KOREN = path.resolve(__dirname, "..", "..");
const [id, vyskaArg] = process.argv.slice(2);
if (!id || !vyskaArg) throw new Error("node orez.js <id> <výška výřezu v px>");
const soubor = path.join(KOREN, "img", id + ".jpg");
// sharp(soubor) drží soubor otevřený a zápis na stejné místo pak spadne na „UNKNOWN: open“
sharp.cache(false);
(async () => {
  const vstup = fs.readFileSync(soubor);
  const meta = await sharp(vstup).metadata();
  const h = parseInt(vyskaArg, 10);
  const w = Math.round(h * meta.width / meta.height);
  const left = Math.round((meta.width - w) / 2);
  const buf = await sharp(vstup).extract({ left, top: 0, width: w, height: h })
    .resize(meta.width, meta.height).jpeg({ quality: 84 }).toBuffer();
  fs.writeFileSync(soubor, buf);
  console.log(id + ": " + meta.width + "x" + meta.height + " <- výřez " + w + "x" + h + " od " + left);
})();
