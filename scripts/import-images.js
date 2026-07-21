#!/usr/bin/env node
// Rozbali ZIP s obrazky (z Gemini) do img/ a sparuje je s kartami podle id.
// Pouziti: node scripts/import-images.js <archiv.zip>
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CARDS_DIR = path.join(ROOT, "data", "cards");
const Q_DIR = path.join(ROOT, "data", "questions");
const IMG_DIR = path.join(ROOT, "img");
const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function extractZip(zipAbs, destAbs) {
  fs.mkdirSync(destAbs, { recursive: true });
  // Bez npm zavislosti: rozbalit pres PowerShellovo Expand-Archive (Windows).
  const psCmd = `Expand-Archive -LiteralPath '${zipAbs.replace(/'/g, "''")}' -DestinationPath '${destAbs.replace(/'/g, "''")}' -Force`;
  const res = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", psCmd], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error("Rozbalení ZIPu selhalo:");
    console.error(res.stderr || res.stdout);
    process.exit(1);
  }
}

function allCardIds() {
  // id z karet (data/cards) i otázek (data/questions) — obojí má obrázek img/{id}.jpg
  const ids = new Set();
  for (const dir of [CARDS_DIR, Q_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      try {
        const list = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
        if (Array.isArray(list)) for (const c of list) if (c && c.id) ids.add(c.id);
      } catch (e) { /* přeskoč nečitelný soubor */ }
    }
  }
  return ids;
}

function main() {
  const zipPath = process.argv[2];
  if (!zipPath) {
    console.error("Použití: node scripts/import-images.js <archiv.zip>");
    process.exit(1);
  }
  const zipAbs = path.resolve(zipPath);
  if (!fs.existsSync(zipAbs)) {
    console.error(`Soubor nenalezen: ${zipAbs}`);
    process.exit(1);
  }

  extractZip(zipAbs, IMG_DIR);

  const imgIds = new Map();   // id -> název souboru
  for (const file of fs.readdirSync(IMG_DIR)) {
    const ext = path.extname(file).toLowerCase();
    if (!IMG_EXTS.has(ext)) continue;
    const id = path.basename(file, path.extname(file));
    imgIds.set(id, file);
  }

  const cardIds = allCardIds();

  const matched = [...imgIds.keys()].filter(id => cardIds.has(id));
  const missing = [...cardIds].filter(id => !imgIds.has(id));
  const orphaned = [...imgIds.keys()].filter(id => !cardIds.has(id));

  console.log(`Rozbaleno do: ${IMG_DIR}`);
  console.log("");
  console.log(`Spárováno (${matched.length}):`);
  matched.forEach(id => console.log(`  ✓ ${id} (${imgIds.get(id)})`));
  console.log("");
  console.log(`Chybí obrázek (${missing.length}):`);
  missing.forEach(id => console.log(`  ✗ ${id}`));
  console.log("");
  console.log(`Osiřelé obrázky (${orphaned.length}) — bez odpovídající karty:`);
  orphaned.forEach(id => console.log(`  ? ${imgIds.get(id)}`));
  console.log("");
  console.log(`Souhrn: ${matched.length} spárováno, ${missing.length} chybí, ${orphaned.length} osiřelých.`);
}

main();
