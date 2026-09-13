// Přehledové archy pro kontrolu ilustrací očima: mřížka 3×3 náhledů s pořadím a id.
//   node scripts/ilustrace/archy.js ru        — všechny obrázky země, které mají irony_prompt
//   node scripts/ilustrace/archy.js id1,id2   — jen vybrané otázky (po přegenerování)
//   node scripts/ilustrace/archy.js cz 1      — jen první arch
// Archy jdou do .ilustrace/archy/{cc}-NN.jpg (gitignorováno). Obrázků se to nedotýká.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const KOREN = path.resolve(__dirname, "..", "..");
const OUT = path.join(KOREN, ".ilustrace", "archy");
const arg = process.argv[2];
if (!arg) throw new Error("zadej zemi (ru), nebo seznam id oddělených čárkou");
const vybrane = arg.includes(",") ? arg.split(",").map(s => s.trim()) : null;
const cc = vybrane ? "vyber" : arg;
const zeme = vybrane ? [...new Set(vybrane.map(id => id.split("-")[0]))] : [arg];
const Q = zeme.flatMap(z => JSON.parse(fs.readFileSync(path.join(KOREN, "data/questions", z + ".json"), "utf8")))
  .filter(q => (!vybrane || vybrane.includes(q.id)) && q.irony_prompt && fs.existsSync(path.join(KOREN, "img", q.id + ".jpg")));
const W = 600, H = 343, POPIS = 28, SL = 3, RD = 3, NA_ARCH = SL * RD;
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const maxArchu = process.argv[3] ? parseInt(process.argv[3], 10) : Infinity;
  for (let a = 0; a * NA_ARCH < Q.length && a < maxArchu; a++) {
    const kus = Q.slice(a * NA_ARCH, (a + 1) * NA_ARCH);
    const vrstvy = [];
    for (let i = 0; i < kus.length; i++) {
      const x = (i % SL) * W, y = Math.floor(i / SL) * (H + POPIS);
      const nahled = await sharp(path.join(KOREN, "img", kus[i].id + ".jpg")).resize(W, H, { fit: "contain", background: "#ffffff" }).toBuffer();
      const cislo = a * NA_ARCH + i;
      const svg = Buffer.from(`<svg width="${W}" height="${POPIS}"><rect width="100%" height="100%" fill="#222"/><text x="8" y="20" font-family="Arial" font-size="17" fill="#fff">${cislo} · ${esc(kus[i].id)}</text></svg>`);
      vrstvy.push({ input: svg, left: x, top: y }, { input: nahled, left: x, top: y + POPIS });
    }
    const soubor = path.join(OUT, `${cc}-${String(a).padStart(2, "0")}.jpg`);
    await sharp({ create: { width: W * SL, height: (H + POPIS) * RD, channels: 3, background: "#ffffff" } })
      .composite(vrstvy).jpeg({ quality: 82 }).toFile(soubor);
    console.log(soubor + "  (" + kus.length + " obrázků)");
  }
})();
