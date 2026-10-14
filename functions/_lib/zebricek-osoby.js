// FIKTIVNÍ HRÁČI V ŽEBŘÍČKU (2026-10-14, přání hráče: „dej tam aspoň 30 fiktivních osob,
// ať to nepůsobí prázdně"). Prázdný žebříček odrazuje: vypadá to, že appku nikdo nehraje.
//
// Nejsou to účty — žijí jen tady a do odpovědi se přimíchají ke skutečným hráčům podle
// ratingu. V databázi nic není, takže zrušit je = smazat tenhle soubor a jeden řádek
// v leaderboard.js. Skutečný hráč se mezi ně zařadí podle svého ratingu (nový hráč
// začíná na 1500, tedy zhruba uprostřed).
//
// Aby žebříček nestál, rating se den ode dne mírně hýbe a přibývají hry — ale
// DETERMINISTICKY podle data, takže dva hráči ve stejný den vidí totéž.
const OSOBY = [
  ['GlobeTrotter', 1884, 212], ['Mapová Myš', 1851, 167], ['Fidži Fanda', 1822, 143],
  ['Pepa z Kolína', 1798, 301], ['Bajkalská Ryba', 1776, 118], ['Severka', 1754, 96],
  ['Kapitán Kompas', 1731, 154], ['Toulavá Bota', 1712, 88], ['Zuzka Zeměpisná', 1694, 131],
  ['Pražský Holub', 1671, 77], ['Horolezec Honza', 1653, 109], ['Lucka z Lucemburska', 1632, 64],
  ['Sombrero', 1618, 92], ['Tundra', 1601, 58], ['Ruda z Rudné', 1587, 140],
  ['Kiwi', 1569, 47], ['Rovník', 1552, 73], ['Bludný Holanďan', 1538, 66],
  ['Kufr na cestách', 1521, 39], ['Babička z Brna', 1507, 120], ['Kokosový Ořech', 1489, 44],
  ['Vítr z Patagonie', 1472, 51], ['Zelený Čaj', 1455, 33], ['Sopka', 1437, 29],
  ['Lama z Peru', 1418, 61], ['Pouštní Liška', 1396, 35], ['Batoh', 1374, 27],
  ['Ztracený Turista', 1349, 82], ['Polární Medvěd', 1321, 24], ['Dobrodruh na gauči', 1288, 57],
];

const START = Date.UTC(2026, 9, 14);

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function fiktivniHraci(now = Date.now()) {
  const den = Math.max(0, Math.floor((now - START) / 86400000));
  return OSOBY.map(([nick, rating, games]) => {
    const h = hash(nick + ':' + den);
    const posun = (h % 41) - 20;                       // ±20 bodů den ode dne
    const pribylo = den * (1 + (hash(nick) % 3));       // 1–3 hry denně
    return { nick, avatar: null, rating: rating + posun, games: games + pribylo };
  });
}
