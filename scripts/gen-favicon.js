// Favikona: favicon.ico (16, 32, 48 px) z jednoduché předlohy SVG níž.
// Spuštění: node scripts/gen-favicon.js
//
// HISTORIE (2026-10-03): stránka do té doby favikonu neměla vůbec (/favicon.ico vracel SPA
// fallback). První verze byla výřez hlavy žárovky z loga — hráč: „moc složitá a není vidět“.
// Akvarel má v 16 px příliš detailů a na pruhu záložek splyne. Ze čtyř plochých variant
// (C, glóbus, špendlík, glóbus se špendlíkem) hráč vybral C: nejlíp vidět na světlém
// i tmavém pruhu. Glóbus vypadá v 16 px jako výchozí ikona „web“ prohlížeče.
//
// Barvy jsou z palety appky (quiz.css: --teal, --coral, --paper2). Plochý tvar je tu
// výjimka z „appka je celá malovaná“ — ve 16 px malba nevynikne.
// ICO obsahuje PNG obrázky (umí to každý dnešní prohlížeč), skládá se ručně — sharp ICO neumí.
const fs = require("fs"), path = require("path");
const sharp = require("sharp");
const KOREN = path.resolve(__dirname, "..");
const VELIKOSTI = [16, 32, 48];
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256">
  <rect width="64" height="64" rx="14" fill="#2a7f7f"/>
  <path d="M44 20 A17 17 0 1 0 44 44" fill="none" stroke="#fffaf0" stroke-width="9" stroke-linecap="round"/>
  <circle cx="47" cy="32" r="5" fill="#e2725b"/>
</svg>`;

(async () => {
  const zaklad = await sharp(Buffer.from(SVG)).png().toBuffer();
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
