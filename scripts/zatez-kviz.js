// Zátěžová simulace živého kvízu (2026-11-05): N hráčů naráz proti běžícímu serveru.
//   node scripts/zatez-kviz.js [hracu=150] [kol=1] [na_kolo=5]
// Každý virtuální hráč dělá totéž, co klient: v čase otevření stáhne otázku (všichni
// ve stejné vteřině — to je ten „nápor"), po náhodné prodlevě odpoví, po uzávěrce si
// stáhne odhalení, v přestávce pořadí. Měří chyby a dobu odezvy.
// POZOR: lokální wrangler není produkce (jiný stroj, D1 je tu SQLite na disku).
// Výsledek říká, jestli logika drží pod souběhem a kolik požadavků večer stojí,
// ne kolik přesně unese Cloudflare.
const B = process.env.KVIZ_API || 'http://localhost:8788/api';
const N = +(process.argv[2] || 150), KOL = +(process.argv[3] || 1), NA_KOLO = +(process.argv[4] || 5);

const doby = [], chyby = {};
let pozadavku = 0;
// LOKÁLNÍ WRANGLER NA WINDOWS PADÁ při ~60–100 souběžných spojeních — i na starých
// endpointech (ověřeno 2026-11-05: GET /api/leaderboard ×100 shodí celý dev server).
// Je to limit miniflare, ne kódu, proto simulace drží nejvýš SOUBEZNE spojení naráz.
// Doba odezvy tu tedy zahrnuje i čekání ve frontě simulátoru.
const SOUBEZNE = +(process.env.SOUBEZNE || 25);
let bezi = 0; const fronta = [];
const slot = () => bezi < SOUBEZNE ? (bezi++, Promise.resolve()) : new Promise(r => fronta.push(r));
const uvolni = () => { const d = fronta.shift(); if (d) d(); else bezi--; };
async function api(p, opts = {}, token) {
  const h = { 'content-type': 'application/json' };
  if (token) h.authorization = 'Bearer ' + token;
  const t0 = Date.now();
  pozadavku++;
  await slot();
  try {
    const r = await fetch(B + p, { method: opts.method || 'GET', headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined });
    let b = null; try { b = await r.json(); } catch (e) {}
    doby.push(Date.now() - t0);
    if (r.status >= 400) {
      const klic = r.status + ' ' + p.replace(/kdev\w+/, ':id').replace(/\/\d+$/, '/:n');
      chyby[klic] = (chyby[klic] || 0) + 1;
    }
    return { s: r.status, b };
  } catch (e) { chyby['síť ' + e.message] = (chyby['síť ' + e.message] || 0) + 1; return { s: 0, b: null }; }
  finally { uvolni(); }
}
const spi = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))] || 0; };

(async () => {
  console.log(`Zátěž: ${N} hráčů, ${KOL}×${NA_KOLO} otázek`);
  const hraci = [];
  for (let i = 0; i < N; i += 10) {
    const davka = await Promise.all(Array.from({ length: Math.min(10, N - i) }, async (_, j) => {
      const r = await api('/auth/register', { method: 'POST', body: { nick: 'Zt' + Date.now().toString(36) + (i + j), pin: '4821', band: 'dospeli', age13: true } });
      return r.b && r.b.token;
    }));
    hraci.push(...davka.filter(Boolean));
  }
  console.log('registrováno', hraci.length);
  const tempo = { za_s: 8, kol: KOL, na_kolo: NA_KOLO, limit_s: 10, odhaleni_s: 4, prestavka_s: 5 };
  const z = await api('/kviz/dev', { method: 'POST', body: tempo });
  const id = z.b.id, start = z.b.starts_at;
  await Promise.all(hraci.map(T => api('/kviz/' + id + '/prihlasit', { method: 'POST' }, T)));
  pozadavku = 0; doby.length = 0; for (const k in chyby) delete chyby[k];

  const naOt = (tempo.limit_s + tempo.odhaleni_s) * 1000;
  const otevreno = n => start + Math.floor(n / NA_KOLO) * (NA_KOLO * naOt + tempo.prestavka_s * 1000) + (n % NA_KOLO) * naOt;
  const celkem = KOL * NA_KOLO;
  const t0 = Date.now();
  await Promise.all(hraci.map(async T => {
    for (let n = 0; n < celkem; n++) {
      await spi(otevreno(n) - Date.now());
      const q = await api('/kviz/' + id + '/q/' + n, {}, T);
      if (q.s !== 200) continue;
      await spi(1000 + Math.random() * 7000);
      await api('/kviz/' + id + '/odpoved', { method: 'POST', body: { n, pick: Math.floor(Math.random() * 4) } }, T);
      await spi(otevreno(n) + tempo.limit_s * 1000 + 1600 + Math.random() * 500 - Date.now());
      await api('/kviz/' + id + '/odhaleni/' + n, {}, T);
      if ((n + 1) % NA_KOLO === 0) { await spi(400); await api('/kviz/' + id + '/poradi', {}, T); }
    }
  }));
  const s = (Date.now() - t0) / 1000;
  console.log(`požadavků: ${pozadavku} (${(pozadavku / hraci.length).toFixed(1)} na hráče, ${(pozadavku / hraci.length / celkem * 40).toFixed(0)} na hráče přepočteno na 40 otázek)`);
  console.log(`doba odezvy ms: medián ${pct(doby, .5)}, 95 % ${pct(doby, .95)}, max ${Math.max(...doby)} — za ${s.toFixed(0)} s`);
  console.log('chyby:', Object.keys(chyby).length ? chyby : 'žádné');
  const po = await api('/kviz/' + id + '/poradi', {}, hraci[0]);
  console.log('v pořadí hráčů:', po.b && po.b.pocet);
  if (Object.keys(chyby).length) process.exitCode = 1;
})();
