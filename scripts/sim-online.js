#!/usr/bin/env node
/**
 * sim-online.js — ověření herního modelu navrženého v docs/online-rezim.md.
 *
 * Neověřuje data ani appku. Simuluje online zápasy a odpovídá na tři otázky,
 * které se špatně odhadují od stolu a draho zjišťují až po nasazení:
 *
 *   1. Pozná zápas o 10 otázkách silnějšího hráče? (rozlišovací schopnost)
 *   2. Zkonverguje Glicko-2 k pravé síle, a jak rychle?
 *   3. Je bot věrohodný soupeř — vyhrává proti stejně silnému hráči ~50 %?
 *
 * Spuštění:  npm run sim-online
 */

// ---------------------------------------------------------------- RNG (seedovaný, aby šly výsledky opakovat)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry32(20260824);
const normal = () => {
  let u = 0, v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// ---------------------------------------------------------------- Herní model
const CAP = 0.95;               // ani nejsilnější hráč není neomylný
const BONUS_MAX = 100;          // rychlostní bonus dle návrhu
const BASE = 100;               // body za správnou odpověď

/** Pravděpodobnost správné odpovědi — Elo očekávání hráče R proti otázce Rq. */
function pCorrect(R, Rq) {
  return Math.min(CAP, 1 / (1 + Math.pow(10, (Rq - R) / 400)));
}

/** Čas odpovědi v sekundách. Medián roste s tím, jak je otázka nad hráčem. */
function answerTime(R, Rq, limit) {
  const d = Rq - R;
  const frac = 0.20 + 0.55 / (1 + Math.exp(-d / 200));
  const t = limit * frac * Math.exp(normal() * 0.30);
  return Math.max(0.5, t);
}

/** Odehraje jednomu hráči jednu otázku → body. */
function playQuestion(R, Rq, limit, speedBonus) {
  const correct = rnd() < pCorrect(R, Rq);
  if (!correct) return 0;
  const t = answerTime(R, Rq, limit);
  if (t >= limit) return 0;                       // vypršelo = jako špatně
  if (!speedBonus) return BASE;
  return BASE + Math.round(BONUS_MAX * (limit - t) / limit);
}

/** Zápas dvou hráčů na stejných otázkách. → 1 / 0.5 / 0 pro hráče A. */
function playMatch(Ra, Rb, questionRatings, limit, speedBonus) {
  let a = 0, b = 0;
  for (const Rq of questionRatings) {
    a += playQuestion(Ra, Rq, limit, speedBonus);
    b += playQuestion(Rb, Rq, limit, speedBonus);
  }
  return a > b ? 1 : a < b ? 0 : 0.5;
}

/** Vylosuje otázky. spread=0 → všechny stejně těžké (dnešní realita dat). */
function drawQuestions(n, center, spread) {
  return Array.from({ length: n }, () => center + (spread ? normal() * spread : 0));
}

// ---------------------------------------------------------------- Glicko-2
const SCALE = 173.7178, TAU = 0.5;

function glicko2(player, results) {
  const mu = (player.r - 1500) / SCALE;
  const phi = player.rd / SCALE;
  const g = p => 1 / Math.sqrt(1 + 3 * p * p / (Math.PI * Math.PI));
  const E = (m, mj, pj) => 1 / (1 + Math.exp(-g(pj) * (m - mj)));

  if (!results.length) {                          // neodehráno → roste nejistota
    const phiStar = Math.sqrt(phi * phi + player.sigma * player.sigma);
    return { r: player.r, rd: Math.min(350, SCALE * phiStar), sigma: player.sigma };
  }

  let vInv = 0, dSum = 0;
  for (const o of results) {
    const muj = (o.r - 1500) / SCALE, phij = o.rd / SCALE;
    const gj = g(phij), Ej = E(mu, muj, phij);
    vInv += gj * gj * Ej * (1 - Ej);
    dSum += gj * (o.s - Ej);
  }
  const v = 1 / vInv;
  const delta = v * dSum;

  const a = Math.log(player.sigma * player.sigma);
  const f = x => {
    const ex = Math.exp(x);
    return (ex * (delta * delta - phi * phi - v - ex)) /
           (2 * Math.pow(phi * phi + v + ex, 2)) - (x - a) / (TAU * TAU);
  };
  let A = a, B;
  if (delta * delta > phi * phi + v) B = Math.log(delta * delta - phi * phi - v);
  else { let k = 1; while (f(a - k * TAU) < 0) k++; B = a - k * TAU; }
  let fA = f(A), fB = f(B), guard = 0;
  while (Math.abs(B - A) > 1e-6 && guard++ < 200) {
    const C = A + (A - B) * fA / (fB - fA), fC = f(C);
    if (fC * fB <= 0) { A = B; fA = fB; } else { fA = fA / 2; }
    B = C; fB = fC;
  }
  const sigmaNew = Math.exp(A / 2);
  const phiStar = Math.sqrt(phi * phi + sigmaNew * sigmaNew);
  const phiNew = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const muNew = mu + phiNew * phiNew * dSum;
  return { r: SCALE * muNew + 1500, rd: SCALE * phiNew, sigma: sigmaNew };
}

// ---------------------------------------------------------------- 1. Rozlišovací schopnost
function discrimination() {
  console.log('\n=== 1. Pozná zápas silnějšího hráče? ===');
  console.log('   Podíl výher silnějšího z 20 000 zápasů (remíza = 0,5).\n');

  const N = 20000, gaps = [0, 50, 100, 200, 400];
  const variants = [
    { name: 'Blesk 10 ot., ploché obtížnosti',   n: 10, limit: 10, spread: 0,   bonus: true },
    { name: 'Blesk 10 ot., rozptyl obtížnosti',  n: 10, limit: 10, spread: 250, bonus: true },
    { name: 'Klasika 15 ot., rozptyl',           n: 15, limit: 20, spread: 250, bonus: true },
    { name: 'Klasika 15 ot., BEZ rychlobonusu',  n: 15, limit: 20, spread: 250, bonus: false },
  ];

  const head = 'varianta'.padEnd(34) + gaps.map(g => ('+' + g).padStart(8)).join('');
  console.log(head);
  console.log('-'.repeat(head.length));

  const out = {};
  for (const v of variants) {
    const row = [];
    for (const gap of gaps) {
      rnd = mulberry32(1000 + gap);
      let s = 0;
      for (let i = 0; i < N; i++) {
        s += playMatch(1500 + gap, 1500, drawQuestions(v.n, 1500, v.spread), v.limit, v.bonus);
      }
      row.push(s / N);
    }
    out[v.name] = row;
    console.log(v.name.padEnd(34) + row.map(x => (x * 100).toFixed(1).padStart(7) + '%').join(''));
  }
  return out;
}

// ---------------------------------------------------------------- 2. Konvergence ratingu
function convergence() {
  console.log('\n=== 2. Zkonverguje rating k pravé síle? ===');
  console.log('   200 hráčů, pravá síla ~N(1500, 300), párování podle aktuálního ratingu.\n');

  rnd = mulberry32(77);
  const players = Array.from({ length: 200 }, () => ({
    truth: 1500 + normal() * 300, r: 1200, rd: 350, sigma: 0.06,
  }));

  const checkpoints = [5, 10, 20, 40, 80];
  console.log('  her/hráč    hrubá chyba    posun fondu    chyba po odečtení    korelace');
  console.log('  ' + '-'.repeat(72));

  let played = 0;
  for (const target of checkpoints) {
    while (played < target) {
      const sorted = [...players].sort((a, b) => a.r - b.r);
      const pending = new Map(players.map(p => [p, []]));
      for (let i = 0; i + 1 < sorted.length; i += 2) {
        const [A, B] = [sorted[i], sorted[i + 1]];
        const qs = drawQuestions(10, 1500, 250);
        const sA = playMatch(A.truth, B.truth, qs, 10, true);
        pending.get(A).push({ r: B.r, rd: B.rd, s: sA });
        pending.get(B).push({ r: A.r, rd: A.rd, s: 1 - sA });
      }
      for (const p of players) Object.assign(p, glicko2(p, pending.get(p)));
      played++;
    }
    const err = players.reduce((a, p) => a + Math.abs(p.r - p.truth), 0) / players.length;
    const mr = players.reduce((a, p) => a + p.r, 0) / players.length;
    const mt = players.reduce((a, p) => a + p.truth, 0) / players.length;
    // Uzavřený fond nemá vnější kotvu: rating umí zachytit jen POMĚR sil, ne absolutní
    // úroveň. Hrubá chyba proto obsahuje posun celého fondu — zajímavá je až chyba po
    // jeho odečtení, ta říká, jak přesně systém řadí hráče mezi sebou.
    const shift = mr - mt;
    const centered = players.reduce((a, p) => a + Math.abs((p.r - mr) - (p.truth - mt)), 0) / players.length;
    let cov = 0, vr = 0, vt = 0;
    for (const p of players) {
      cov += (p.r - mr) * (p.truth - mt); vr += (p.r - mr) ** 2; vt += (p.truth - mt) ** 2;
    }
    const corr = cov / Math.sqrt(vr * vt);
    console.log('  ' + String(played).padStart(6) + '  ' +
      (err.toFixed(0) + ' b').padStart(13) + '  ' +
      (shift.toFixed(0) + ' b').padStart(13) + '  ' +
      (centered.toFixed(0) + ' b').padStart(19) + '  ' +
      corr.toFixed(3).padStart(10));
  }
}

// ---------------------------------------------------------------- 3. Bot jako soupeř
function botCredibility() {
  console.log('\n=== 3. Je bot věrohodný soupeř? ===');
  console.log('   Bot i hráč mají stejný rating. Ideál = 50 % výher, zápas ať nepůsobí strojově.\n');

  const N = 20000;
  console.log('  rating úrovně     výher bota     prům. bodů bota     prům. bodů hráče');
  console.log('  ' + '-'.repeat(68));

  for (const R of [1100, 1300, 1500, 1700, 1900]) {
    rnd = mulberry32(R);
    let w = 0, bp = 0, hp = 0;
    for (let i = 0; i < N; i++) {
      const qs = drawQuestions(10, 1500, 250);
      let b = 0, h = 0;
      for (const Rq of qs) {
        b += playQuestion(R, Rq, 10, true);
        h += playQuestion(R, Rq, 10, true);
      }
      bp += b; hp += h;
      w += b > h ? 1 : b < h ? 0 : 0.5;
    }
    console.log('  ' + String(R).padStart(9) + '       ' +
      ((w / N * 100).toFixed(1) + '%').padStart(10) + '        ' +
      (bp / N).toFixed(0).padStart(12) + '        ' + (hp / N).toFixed(0).padStart(14));
  }
}

// ---------------------------------------------------------------- běh
console.log('Simulace online modelu — docs/online-rezim.md');
const disc = discrimination();
convergence();
botCredibility();

console.log('\n=== Závěr ===');
const flat10 = disc['Blesk 10 ot., ploché obtížnosti'];
const spread10 = disc['Blesk 10 ot., rozptyl obtížnosti'];
const noBonus = disc['Klasika 15 ot., BEZ rychlobonusu'];
const bonus15 = disc['Klasika 15 ot., rozptyl'];
console.log('  Ploché vs. rozptýlené obtížnosti při +200: ' +
  (flat10[3] * 100).toFixed(1) + '% vs ' + (spread10[3] * 100).toFixed(1) + '%');
console.log('  Rychlobonus zapnutý vs. vypnutý při +200:  ' +
  (bonus15[3] * 100).toFixed(1) + '% vs ' + (noBonus[3] * 100).toFixed(1) + '%');
console.log('  Vyrovnaný zápas (+0) musí vyjít na 50 %:   ' +
  (spread10[0] * 100).toFixed(1) + '%\n');
