"use strict";
/**
 * Která otázka smí do hry. JEDINÉ místo, kde to pravidlo žije — sdílí ho index počtů,
 * build pro web i synchronizace databáze, ať se nikdy nerozejdou.
 *
 * Otázka BEZ ILUSTRACE se nehraje nikde (rozhodl hráč 2026-10-13: „tyhle otázky jsem
 * nechtěl zařadit… až budou mít ilustraci“). Appka je celá malovaná a otázka bez obrázku
 * padá na razítko země. Pravidlo je po otázkách, ne po kampani: jakmile `img/{id}.jpg`
 * vznikne, otázka se po `npm run build-index` sama zařadí.
 */
const fs = require("fs");
const path = require("path");

const KOREN = path.resolve(__dirname, "..");

function maIlustraci(q) {
  return !!q && typeof q.id === "string" && fs.existsSync(path.join(KOREN, "img", q.id + ".jpg"));
}

/** Smí do OFFLINE hry (a tedy do veřejných dat): ne serverová a s ilustrací. */
function hratelnaOffline(q) {
  return q.online_only !== true && maIlustraci(q);
}

module.exports = { maIlustraci, hratelnaOffline };
