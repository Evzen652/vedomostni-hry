// Favikona: favicon.ico (16, 32, 48 px) z assets/icon-512.png.
// Spuštění: node scripts/gen-favicon.js   (po změně loga)
//
// PROČ (2026-10-03): stránka neměla <link rel="icon"> a /favicon.ico vracel SPA fallback
// (HTML s kódem 200), takže záložka v prohlížeči neměla ikonu vůbec.
// Z ikony se VYŘEZÁVÁ hlava žárovky: celá ikona má kolem postavičky hodně papíru
// a v 16 px z ní zbyla nečitelná skvrna. Výřez vybraný okem ze tří variant.
// ICO obsahuje PNG obrázky (umí to každý dnešní prohlížeč), skládá se ručně — sharp ICO neumí.
const fs = require("fs"), path = require("path");
const sharp = require("sharp");
const KOREN = path.resolve(__dirname, "..");
const VYREZ = { left: 115, top: 15, width: 290, height: 290 };
const VELIKOSTI = [16, 32, 48];

(async () => {
  const zaklad = await sharp(fs.readFileSync(path.join(KOREN, "assets", "icon-512.png"))).extract(VYREZ).toBuffer();
  const pngs = [];
  for (const s of VELIKOSTI) pngs.push(await sharp(zaklad).resize(s, s).png({ compressionLevel: 9 }).toBuffer());
  const hlava = Buffer.alloc(6 + 16 * pngs.length);
  hlava.writeUInt16LE(0, 0); hlava.writeUInt16LE(1, 2); hlava.writeUInt16LE(pngs.length, 4);
  let posun = hlava.length;
  pngs.forEach((png, i) => {
    const o = 6 + 16 * i, s = VELIKOSTI[i];
    hlava.writeUInt8(s, o); hlava.writeUInt8(s, o + 1); hlava.writeUInt8(0, o + 2); hlava.writeUInt8(0, o + 3);
    hlava.writeUInt16LE(1, o + 4); hlava.writeUInt16LE(32, o + 6);
    hlava.writeUInt32LE(png.length, o + 8); hlava.writeUInt32LE(posun, o + 12);
    posun += png.length;
  });
  fs.writeFileSync(path.join(KOREN, "favicon.ico"), Buffer.concat([hlava, ...pngs]));
  console.log("favicon.ico: " + VELIKOSTI.join(", ") + " px, " + posun + " B");
})().catch(e => { console.error(e); process.exit(1); });
