// Náhledy dlaždic: assets/{rodina}-*.jpg (512×512) → assets/male/{totéž} (320×320).
// Spuštění: npm run nahledy   (po každé změně nebo přidání ilustrace dlaždice)
//
// PROČ (2026-10-03): dlaždice se kreslí na 92–160 CSS px, ale soubory mají 512 px.
// Výběr zemí tak stahoval 56 vlajek = 3,5 MB a hráč to hlásil jako „hodně dlouho se to
// načítá". 320 px je 2× nejčastější velikost dlaždice (128–160 px), tedy ostré na retině.
//
// ORIGINÁLY SE NEMĚNÍ a zůstávají zdrojem pravdy (dobarvi.js, split-flag-grid.ps1 i další
// práce s ilustracemi míří na ně). Náhled nese v EXIF otisk originálu (`zdroj-sha1:…`)
// a `npm run validate` hlásí CHYBU, když otisk nesedí — přegenerovaný originál se
// zastaralým náhledem by se jinak na webu vůbec neprojevil.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const sharp = require("sharp");
sharp.cache(false);
const KOREN = path.resolve(__dirname, "..");
const SRC = path.join(KOREN, "assets"), OUT = path.join(SRC, "male");
const RODINY = /^(country|cont|section|mode|band|jump)-[a-z0-9-]+\.jpg$/;
const STRANA = 320;
const otisk = buf => "zdroj-sha1:" + crypto.createHash("sha1").update(buf).digest("hex");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let nove = 0, beze = 0, pred = 0, po = 0;
  const zdroje = fs.readdirSync(SRC).filter(f => RODINY.test(f)).sort();
  for (const f of zdroje) {
    const buf = fs.readFileSync(path.join(SRC, f));   // buffer, ne cesta: sharp drží soubor otevřený
    const o = otisk(buf), cil = path.join(OUT, f);
    pred += buf.length;
    if (fs.existsSync(cil) && fs.readFileSync(cil).includes(o)) { beze++; po += fs.statSync(cil).size; continue; }
    const out = await sharp(buf).resize(STRANA, STRANA, { fit: "cover" })
      .jpeg({ quality: 82, mozjpeg: true })
      .withExif({ IFD0: { ImageDescription: o } })
      .toBuffer();
    fs.writeFileSync(cil, out);
    nove++; po += out.length;
  }
  // Náhled bez originálu = osiřelý soubor, který se zbytečně nasazuje.
  const sirotci = fs.readdirSync(OUT).filter(f => f.endsWith(".jpg") && !zdroje.includes(f));
  for (const f of sirotci) fs.unlinkSync(path.join(OUT, f));
  console.log(`náhledy: ${nove} nových/obnovených, ${beze} beze změny, ${sirotci.length} osiřelých smazáno`);
  console.log(`velikost: ${Math.round(pred / 1024)} kB → ${Math.round(po / 1024)} kB (${zdroje.length} souborů)`);
})().catch(e => { console.error(e); process.exit(1); });
