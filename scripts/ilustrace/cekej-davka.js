// Čeká, až doběhne dávka Gemini: jednou za minutu zavolá `batch-irony-images.js status`
// a skončí, jakmile je hotovo (nebo po 90 minutách). Pouští se na pozadí, ať se nemusí
// stav zjišťovat ručně — malé dávky občas trvají i 30+ minut.
//   node scripts/ilustrace/cekej-davka.js
const { execFileSync } = require("child_process");
const path = require("path");
const KOREN = path.resolve(__dirname, "..", "..");
const KONEC = Date.now() + 90 * 60 * 1000;
const HOTOVO = /Hotovo|SUCCEEDED|FAILED|CANCELLED|EXPIRED/;
function stav() {
  try {
    return execFileSync(process.execPath, [path.join(KOREN, "scripts", "batch-irony-images.js"), "status"],
      { cwd: KOREN, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { return String(e.stdout || "") + String(e.stderr || ""); }
}
(function kolo() {
  const out = stav();
  if (HOTOVO.test(out)) { console.log(out.trim()); return; }
  if (Date.now() > KONEC) { console.log("Timeout po 90 minutách\n" + out.trim()); return; }
  setTimeout(kolo, 60 * 1000);
})();
