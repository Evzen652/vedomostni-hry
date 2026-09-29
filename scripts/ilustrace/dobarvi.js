"use strict";
/**
 * Dobarví malovanou ilustraci: zvýší sytost TAM, KDE UŽ BARVA JE, a nechá na pokoji
 * papír. Bez toho zežloutne podklad a z ilustrace je fotka přes sepiový filtr.
 *
 * Váha je vzdálenost pixelu od barvy papíru, která se NAVZORKUJE Z ROHŮ obrázku —
 * každá ilustrace má trochu jiný odstín papíru, takže pevná hodnota by u některé
 * dobarvila i podklad. (CLAUDE.md 2026-09-15)
 *
 * ZDROJ SE BERE Z GITU, ne z disku. Dobarvit už dobarvený JPEG je nevratná ztráta
 * a v projektu se to málem stalo — takhle to nejde ani omylem, ať se skript pustí
 * kolikrát chce. Soubor musí být v HEAD; necommitnutý nový obrázek skript odmítne.
 *
 * Síla: 0,4 hráči nestačila, dlaždice témat i auth-hero jedou na 0,7,
 * dlaždice kontinentů na ~0,55.
 *
 *   node scripts/ilustrace/dobarvi.js zk-live,zk-daily 0.7
 *   node scripts/ilustrace/dobarvi.js zk-live 0.7 --nahled   (jen do .ilustrace/, nepřepíše)
 */
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const sharp = require("sharp");

const KOREN = path.resolve(__dirname, "..", "..");
const NAHLEDY = path.join(KOREN, ".ilustrace", "dobarveni");

const args = process.argv.slice(2);
const jmena = (args[0] || "").split(",").map(s => s.trim()).filter(Boolean);
const sila = Number(args[1] || 0.7);
const jenNahled = args.includes("--nahled");

if (!jmena.length || !Number.isFinite(sila)) {
  console.error("použití: node scripts/ilustrace/dobarvi.js jmeno1,jmeno2 [síla] [--nahled]");
  process.exit(1);
}

/** Originál z gitu — pojistka proti druhému dobarvení téhož souboru. */
function zGitu(rel) {
  try {
    return execFileSync("git", ["show", "HEAD:" + rel.replace(/\\/g, "/")],
      { cwd: KOREN, maxBuffer: 64 * 1024 * 1024 });
  } catch {
    throw new Error("soubor není v HEAD (necommitnutý?): " + rel);
  }
}

/** Barva papíru = průměr čtyř rohů. Rohy jsou u téhle sady vždy podklad. */
function papirZRohu(data, w, h, kanalu, okno = 24) {
  let r = 0, g = 0, b = 0, n = 0;
  const rohy = [[0, 0], [w - okno, 0], [0, h - okno], [w - okno, h - okno]];
  for (const [x0, y0] of rohy) {
    for (let y = y0; y < y0 + okno; y++) {
      for (let x = x0; x < x0 + okno; x++) {
        const i = (y * w + x) * kanalu;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      }
    }
  }
  return [r / n, g / n, b / n];
}

(async () => {
  if (jenNahled) fs.mkdirSync(NAHLEDY, { recursive: true });

  for (const jmeno of jmena) {
    const rel = path.join("assets", jmeno + ".jpg");
    const vstup = zGitu(rel);

    const obr = sharp(vstup);
    const meta = await obr.metadata();
    const { data, info } = await obr.raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = info;

    const papir = papirZRohu(data, w, h, ch);
    // Práh vzdálenosti, za kterým je pixel "plně barevný". 60 je změřené na téhle
    // sadě: pod ním leží papírové skvrny a stíny, nad ním kresba.
    const PRAH = 60;

    let dotcenych = 0;
    for (let i = 0; i < data.length; i += ch) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const d = Math.hypot(r - papir[0], g - papir[1], b - papir[2]);
      const vaha = Math.min(1, d / PRAH);
      if (vaha <= 0.02) continue;
      dotcenych++;

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const k = 1 + sila * vaha;
      data[i]     = Math.max(0, Math.min(255, Math.round(luma + (r - luma) * k)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(luma + (g - luma) * k)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(luma + (b - luma) * k)));
    }

    const cil = jenNahled
      ? path.join(NAHLEDY, jmeno + ".jpg")
      : path.join(KOREN, rel);
    await sharp(data, { raw: { width: w, height: h, channels: ch } })
      .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
      .toFile(cil);

    const pct = Math.round(100 * dotcenych / (w * h));
    console.log(`${jmeno}: ${w}×${meta.height}, papír ${papir.map(Math.round).join(",")}, ` +
                `síla ${sila}, dotčeno ${pct} % plochy → ${path.relative(KOREN, cil)}`);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
