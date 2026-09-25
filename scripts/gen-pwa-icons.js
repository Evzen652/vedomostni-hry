"use strict";
/**
 * Vyrobí ikony pro PWA (a tím i pro appku v obchodě) z `assets/logo.jpg`.
 *
 *   node scripts/gen-pwa-icons.js
 *
 * Proč skript a ne jednorázový ruční ořez: až se logo změní — a u appky, která míří
 * do obchodu, se změní — musí jít ikony přegenerovat jedním příkazem. Ruční ořez
 * v editoru se po půl roce nedohledá; stejný důvod, proč se do repa stěhovaly nástroje
 * na kontrolu ilustrací (CLAUDE.md 2026-09-13).
 *
 * VZNIKNE:
 *   assets/icon-192.png           běžná ikona (menší rozměr, odkazuje na ni manifest)
 *   assets/icon-512.png           totéž velké; z tohohle se bere i ikona v obchodě
 *   assets/icon-maskable-512.png  ikona pro masku Androidu
 *
 * PROČ ZVLÁŠŤ „MASKABLE": Android ikonu OŘÍZNE do vlastního tvaru a na každém telefonu
 * do jiného (kruh, čtverec se zaoblením, kapka). Bezpečná zóna je kruh o průměru 80 %
 * obrázku — co je mimo, může zmizet. Ve verzi maskable proto logo sedí zmenšené
 * uprostřed na plné ploše papíru, takže maska ukousne jen okraj podkladu, ne postavičku.
 * Bez téhle verze by Android uřízl hrdinovi ruce i nohy.
 */
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const KOREN = path.resolve(__dirname, "..");
const LOGO = path.join(KOREN, "assets", "logo.jpg");
const OUT = path.join(KOREN, "assets");

// Podíl plochy, který smí zabrat logo v maskable verzi. 0,78 je pod hranicí bezpečné
// zóny (0,8) s rezervou na zaokrouhlení.
const MASKABLE_POMER = 0.78;

async function main() {
  if (!fs.existsSync(LOGO)) { console.error("Chybí " + LOGO); process.exit(1); }

  // Barva podkladu se VZORKUJE Z LOGA, nepíše se natvrdo. Papír v appce má přechody
  // a pevné „#f7efe0" by kolem zmenšeného loga udělalo viditelný rámeček.
  const rohy = await sharp(LOGO).resize(3, 3, { fit: "fill" }).removeAlpha().raw().toBuffer();
  const podklad = { r: rohy[0], g: rohy[1], b: rohy[2] };
  console.log("Podklad vzorkovaný z loga: rgb(" + podklad.r + "," + podklad.g + "," + podklad.b + ")");

  for (const px of [192, 512]) {
    await sharp(LOGO).resize(px, px, { fit: "cover" }).png({ compressionLevel: 9 })
      .toFile(path.join(OUT, "icon-" + px + ".png"));
    console.log("  icon-" + px + ".png");
  }

  const px = 512;
  const vnitrni = Math.round(px * MASKABLE_POMER);
  const odsazeni = Math.round((px - vnitrni) / 2);
  const logoMale = await sharp(LOGO).resize(vnitrni, vnitrni, { fit: "cover" }).toBuffer();
  await sharp({ create: { width: px, height: px, channels: 3, background: podklad } })
    .composite([{ input: logoMale, top: odsazeni, left: odsazeni }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "icon-maskable-512.png"));
  console.log("  icon-maskable-512.png (logo na " + Math.round(MASKABLE_POMER * 100) + " % plochy)");
}

main().catch(e => { console.error(e); process.exit(1); });
