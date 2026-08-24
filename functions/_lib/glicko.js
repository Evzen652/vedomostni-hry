/**
 * Glicko-2 (docs/online-rezim.md, sekce 3). Stejná implementace jako v
 * scripts/sim-online.js, kde je ověřená: po 20 hrách chyba ±58 b, po 40 ±44 b,
 * korelace s pravou silou 0,990.
 *
 * Rating je zvlášť za pásmo, ne za časovou kontrolu.
 */
const SCALE = 173.7178;
const TAU = 0.5;

const g = p => 1 / Math.sqrt(1 + 3 * p * p / (Math.PI * Math.PI));
const E = (mu, muj, phij) => 1 / (1 + Math.exp(-g(phij) * (mu - muj)));

/**
 * @param player  {rating, rd, sigma}
 * @param results [{rating, rd, s}]  s = 1 výhra / 0.5 remíza / 0 prohra
 */
export function glicko2(player, results) {
  const mu = (player.rating - 1500) / SCALE;
  const phi = player.rd / SCALE;

  if (!results.length) {
    // Neodehráno: jistota klesá, rating zůstává.
    const phiStar = Math.sqrt(phi * phi + player.sigma * player.sigma);
    return { rating: player.rating, rd: Math.min(350, SCALE * phiStar), sigma: player.sigma };
  }

  let vInv = 0, dSum = 0;
  for (const o of results) {
    const muj = (o.rating - 1500) / SCALE, phij = o.rd / SCALE;
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
  else { let k = 1; while (f(a - k * TAU) < 0 && k < 100) k++; B = a - k * TAU; }

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

  return {
    rating: SCALE * muNew + 1500,
    rd: Math.min(350, SCALE * phiNew),
    sigma: sigmaNew,
  };
}
