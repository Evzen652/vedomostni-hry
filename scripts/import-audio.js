#!/usr/bin/env node
// Rozbali ZIP s audio hláškami do audio/ a spáruje je podle id (otázky i karty).
// Pouziti: node scripts/import-audio.js <archiv.zip>
// Chybějící audio = appka spadne zpět na TTS (Web Speech API).
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const Q_DIR = path.join(ROOT, "data", "questions");
const CARDS_DIR = path.join(ROOT, "data", "cards");
const AUDIO_DIR = path.join(ROOT, "audio");
const AUDIO_EXTS = new Set([".mp3", ".ogg", ".wav", ".m4a", ".aac"]);

function extractZip(zipAbs, destAbs) {
  fs.mkdirSync(destAbs, { recursive: true });
  const psCmd = `Expand-Archive -LiteralPath '${zipAbs.replace(/'/g, "''")}' -DestinationPath '${destAbs.replace(/'/g, "''")}' -Force`;
  const res = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", psCmd], { encoding: "utf8" });
  if (res.status !== 0) { console.error("Rozbalení ZIPu selhalo:"); console.error(res.stderr || res.stdout); process.exit(1); }
}

function idsFromDir(dir) {
  const ids = new Set();
  if (!fs.existsSync(dir)) return ids;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const list = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      if (Array.isArray(list)) for (const it of list) if (it && it.id) ids.add(it.id);
    } catch (e) { /* přeskoč */ }
  }
  return ids;
}

function main() {
  const zipPath = process.argv[2];
  if (!zipPath) { console.error("Použití: node scripts/import-audio.js <archiv.zip>"); process.exit(1); }
  const zipAbs = path.resolve(zipPath);
  if (!fs.existsSync(zipAbs)) { console.error(`Soubor nenalezen: ${zipAbs}`); process.exit(1); }

  extractZip(zipAbs, AUDIO_DIR);

  const audioIds = new Map();
  for (const file of fs.readdirSync(AUDIO_DIR)) {
    const ext = path.extname(file).toLowerCase();
    if (!AUDIO_EXTS.has(ext)) continue;
    audioIds.set(path.basename(file, path.extname(file)), file);
  }

  const contentIds = new Set([...idsFromDir(Q_DIR), ...idsFromDir(CARDS_DIR)]);
  const matched = [...audioIds.keys()].filter(id => contentIds.has(id));
  const orphaned = [...audioIds.keys()].filter(id => !contentIds.has(id));

  console.log(`Rozbaleno do: ${AUDIO_DIR}`);
  console.log("");
  console.log(`Spárováno (${matched.length}):`);
  matched.forEach(id => console.log(`  ✓ ${id} (${audioIds.get(id)})`));
  console.log("");
  console.log(`Osiřelé audio (${orphaned.length}) — bez odpovídající otázky/karty:`);
  orphaned.forEach(id => console.log(`  ? ${audioIds.get(id)}`));
  console.log("");
  console.log(`Souhrn: ${matched.length} spárováno, ${orphaned.length} osiřelých. (Chybějící audio → fallback na TTS.)`);
}

main();
