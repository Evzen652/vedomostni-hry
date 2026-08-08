// Copy hero photos from Hricka's card images to kviz's per-question photos,
// matched via each question's source_card. Only copies the base image
// (no -2/-3 depth variants) to img/{question.id}.jpg.
const fs = require('fs');
const path = require('path');

const KVIZ = __dirname + '/..';
const HRICKA_IMG = 'C:/Users/Evzen/Desktop/Hricka/img';
const QUESTIONS_DIR = path.join(KVIZ, 'data/questions');
const OUT_DIR = path.join(KVIZ, 'img');

const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json'));
let copied = 0, skippedExists = 0, skippedNoSource = 0, skippedNoImage = 0;
const copiedList = [];

for (const file of files) {
  const cc = file.replace('.json', '');
  const questions = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, file), 'utf8'));
  for (const q of questions) {
    const destPath = path.join(OUT_DIR, `${q.id}.jpg`);
    if (fs.existsSync(destPath)) { skippedExists++; continue; }
    if (!q.source_card) { skippedNoSource++; continue; }
    const srcPath = path.join(HRICKA_IMG, `${q.source_card}.jpg`);
    if (!fs.existsSync(srcPath)) { skippedNoImage++; continue; }
    fs.copyFileSync(srcPath, destPath);
    copied++;
    copiedList.push(`${cc}: ${q.id}.jpg <- ${q.source_card}.jpg`);
  }
}

console.log(`Zkopírováno: ${copied}`);
console.log(`Přeskočeno (už existuje): ${skippedExists}`);
console.log(`Přeskočeno (bez source_card): ${skippedNoSource}`);
console.log(`Přeskočeno (Hricka fotku nemá): ${skippedNoImage}`);
console.log('---');
console.log(copiedList.join('\n'));
