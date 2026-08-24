#!/usr/bin/env node
/**
 * test-api.js — kouřový test online API proti běžícímu `npm run dev`.
 *
 * Ověřuje vlastnosti, na kterých stojí návrh (docs/online-rezim.md):
 *   - správná odpověď NIKDY není v payloadu otázky,
 *   - vyhodnocuje server, ne klient,
 *   - na zodpovězenou otázku nejde odpovědět podruhé (jinak: tipni, přečti, oprav),
 *   - rychlejší správná odpověď dá víc bodů,
 *   - po dohrání se objeví rozbor.
 *
 * Spuštění:  npm run dev          (v jednom terminálu)
 *            npm run test:api     (ve druhém)
 */
const BASE = process.env.API_BASE || 'http://127.0.0.1:8788';

let pass = 0, fail = 0;
const ok = (cond, label, detail) => {
  if (cond) { pass++; console.log('  OK   ' + label); }
  else { fail++; console.log('  CHYBA ' + label + (detail ? '\n        ' + detail : '')); }
};

const api = async (path, opts) => {
  const r = await fetch(BASE + path, opts);
  let body = null;
  try { body = await r.json(); } catch (e) { /* prázdné */ }
  return { status: r.status, body };
};
const post = (path, data) => api(path, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(data ?? {}),
});

(async () => {
  console.log('Test online API na ' + BASE + '\n');

  // --- založení hry ---
  console.log('Založení hry');
  const created = await post('/api/game', { band: 'dospeli', time_control: 'blesk' });
  ok(created.status === 200, 'hra se založí', JSON.stringify(created.body));
  const game = created.body;
  ok(game.total === 10, 'blesk má 10 otázek, dostal ' + game.total);
  ok(game.limit_s === 10, 'limit 10 s, dostal ' + game.limit_s);

  const bad = await post('/api/game', { band: 'neexistuje' });
  ok(bad.status === 400, 'neznámé pásmo se odmítne, dostal ' + bad.status);

  // --- otázka neprozradí odpověď ---
  console.log('\nServírování otázky');
  const q0 = await api('/api/game/' + game.id + '/q/0');
  ok(q0.status === 200, 'otázka se vrátí');
  const keys = Object.keys(q0.body).join(',');
  ok(!('answer' in q0.body), 'payload NEobsahuje pole answer (klíče: ' + keys + ')');
  ok(!('correct_index' in q0.body), 'payload NEobsahuje index správné odpovědi');
  ok(Array.isArray(q0.body.options) && q0.body.options.length === 4, 'čtyři možnosti');

  const oob = await api('/api/game/' + game.id + '/q/99');
  ok(oob.status === 404, 'otázka mimo rozsah je 404, dostal ' + oob.status);
  const ghost = await api('/api/game/neexistuje/q/0');
  ok(ghost.status === 404, 'neexistující hra je 404, dostal ' + ghost.status);

  // --- vyhodnocení na serveru ---
  console.log('\nVyhodnocení odpovědi');
  const a0 = await post('/api/game/' + game.id + '/answer', { n: 0, pick: 0, ms: 3000 });
  ok(a0.status === 200, 'odpověď se přijme');
  ok(typeof a0.body.correct === 'boolean', 'server vrátí, jestli to bylo správně');
  ok(Number.isInteger(a0.body.correct_index), 'až TEĎ se dozvím správný index');
  ok(a0.body.explanation != null, 'vysvětlení přijde až s vyhodnocením');

  const again = await post('/api/game/' + game.id + '/answer', { n: 0, pick: 1, ms: 500 });
  ok(again.status === 409, 'druhý pokus na stejnou otázku se odmítne, dostal ' + again.status);

  // --- rychlost se promítne do bodů ---
  console.log('\nBodování');
  let fastPts = null, slowPts = null;
  for (let n = 1; n < game.total && (fastPts === null || slowPts === null); n++) {
    const q = await api('/api/game/' + game.id + '/q/' + n);
    // zkusíme všechny možnosti bychom nemohli — místo toho tipneme a využijeme jen správné
    const ms = n % 2 === 0 ? 9500 : 500;
    const r = await post('/api/game/' + game.id + '/answer', { n, pick: 0, ms });
    if (r.body.correct) { if (ms === 500) fastPts = r.body.points; else slowPts = r.body.points; }
  }
  if (fastPts !== null && slowPts !== null) {
    ok(fastPts > slowPts, 'rychlá správná (' + fastPts + ' b) > pomalá správná (' + slowPts + ' b)');
  } else {
    console.log('  (přeskočeno: náhodné tipy nedaly dvojici rychlá+pomalá správná odpověď)');
  }

  // --- dohrání a rozbor ---
  // Rozehranost se musí testovat na ČERSTVÉ hře: smyčka výše mohla stihnout
  // zodpovědět všechny otázky té původní, a pak by rozbor legitimně existoval.
  console.log('\nRozbor po dohrání');
  const fresh = (await post('/api/game', { band: 'starsi' })).body;
  await post('/api/game/' + fresh.id + '/answer', { n: 0, pick: 0, ms: 2000 });
  const mid = await api('/api/game/' + fresh.id);
  ok(mid.body.done === false, 'rozehraná hra není označená jako dohraná');
  ok(mid.body.review === undefined, 'rozbor se nezobrazí, dokud hra běží');

  for (let n = 0; n < game.total; n++) {
    await post('/api/game/' + game.id + '/answer', { n, pick: 0, ms: 2000 });
  }
  const done = await api('/api/game/' + game.id);
  ok(done.body.done === true, 'hra je označená jako dohraná');
  ok(Array.isArray(done.body.review) && done.body.review.length === game.total,
     'rozbor má ' + game.total + ' položek');
  ok(done.body.review.every(r => Number.isInteger(r.correct_index)),
     'rozbor ukazuje správné odpovědi');
  ok(done.body.score === done.body.review.reduce((a, r) => a + r.points, 0),
     'celkové skóre sedí se součtem bodů');

  console.log('\n' + (fail ? 'NEPROŠLO: ' + fail + ' chyb, ' + pass + ' v pořádku'
                           : 'VŠE V POŘÁDKU: ' + pass + ' kontrol'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('\nTest spadl:', e.message); process.exit(1); });
