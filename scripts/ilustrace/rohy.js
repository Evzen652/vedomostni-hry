// Arch dolních rohů (tam Gemini nechává podpisy): u každého obrázku levý a pravý dolní roh vedle sebe.
//   node scripts/ilustrace/rohy.js ca   |   node scripts/ilustrace/rohy.js id1,id2
// POZOR: podpis NEMUSÍ ležet v rohu (radlice buldozeru, vepsaný do trávy, uvnitř scény) —
// tenhle arch takové případy MINE. Podezřelá místa z přehledového archu projdi vyrez.js.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const KOREN = path.resolve(__dirname, "..", "..");
const OUT = path.join(KOREN, ".ilustrace", "archy");
const arg = process.argv[2];
if (!arg) throw new Error("zadej zemi (ca), nebo seznam id oddělených čárkou");
const vybrane = arg.includes(",") ? arg.split(",").map(s => s.trim()) : null;
const cc = vybrane ? "vyber" : arg;
const zeme = vybrane ? [...new Set(vybrane.map(id => id.split("-")[0]))] : [arg];
const Q = zeme.flatMap(z => JSON.parse(fs.readFileSync(path.join(KOREN, "data/questions", z + ".json"), "utf8")))
  .filter(q => (!vybrane || vybrane.includes(q.id)) && q.irony_prompt && fs.existsSync(path.join(KOREN, "img", q.id + ".jpg")));
const RW = 300, RH = 170, POPIS = 24, SL = 3, NA_ARCH = 24;
const CW = RW * 2 + 6, CH = RH + POPIS;
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  for (let a = 0; a * NA_ARCH < Q.length; a++) {
    const kus = Q.slice(a * NA_ARCH, (a + 1) * NA_ARCH);
    const vrstvy = [];
    for (let i = 0; i < kus.length; i++) {
      const x = (i % SL) * (CW + 10), y = Math.floor(i / SL) * CH;
      const f = path.join(KOREN, "img", kus[i].id + ".jpg");
      const m = await sharp(f).metadata();
      const levy = await sharp(f).extract({ left: 0, top: m.height - RH, width: RW, height: RH }).toBuffer();
      const pravy = await sharp(f).extract({ left: m.width - RW, top: m.height - RH, width: RW, height: RH }).toBuffer();
      const cislo = a * NA_ARCH + i;
      const svg = Buffer.from(`<svg width="${CW}" height="${POPIS}"><rect width="100%" height="100%" fill="#222"/><text x="6" y="17" font-family="Arial" font-size="15" fill="#fff">${cislo} · ${esc(kus[i].id)}</text></svg>`);
      vrstvy.push({ input: svg, left: x, top: y }, { input: levy, left: x, top: y + POPIS }, { input: pravy, left: x + RW + 6, top: y + POPIS });
    }
    const radku = Math.ceil(kus.length / SL);
    const soubor = path.join(OUT, `${cc}-rohy-${String(a).padStart(2, "0")}.jpg`);
    await sharp({ create: { width: SL * (CW + 10), height: radku * CH, channels: 3, background: "#ffffff" } })
      .composite(vrstvy).jpeg({ quality: 80 }).toFile(soubor);
    console.log(soubor + "  (" + kus.length + " obrázků)");
  }
})();
