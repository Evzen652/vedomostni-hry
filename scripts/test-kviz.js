// Test API živého kvízu (2026-11-05) proti běžícímu `npm run dev` na portu 8788.
// Kvíz si zakládá přes /api/kviz/dev se zkráceným tempem (sekundy místo minut),
// takže celý večer proběhne za ~40 s. Hlídá hlavně:
//   - otázka ani odpověď nejde ven před časem, odpověď po uzávěrce neprojde,
//   - odpověď neříká, jestli byla správná (to až odhalení pro všechny),
//   - pořadí se vydá jen v přestávce a po konci, ne během kola,
//   - body odpovídají měření času od OTEVŘENÍ otázky.
const fs = require('fs');
const path = require('path');
const B = process.env.KVIZ_API || 'http://localhost:8788/api';

async function api(p, opts = {}, token) {
  const h = { 'content-type': 'application/json' };
  if (token) h.authorization = 'Bearer ' + token;
  const r = await fetch(B + p, { method: opts.method || 'GET', headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined });
  let b = null; try { b = await r.json(); } catch (e) {}
  return { s: r.status, b };
}
let chyb = 0, ok = 0;
const kontrola = (c, m) => { if (c) { ok++; console.log('  OK    ' + m); } else { chyb++; console.log('  CHYBA ' + m); } };
const spi = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));

// Správnou odpověď test zná z dat (v kvízu ji server neposílá, tady ji potřebujeme,
// abychom věděli, že tip 'A' je správný a tip 'B' ne).
const odpovedi = {};
for (const f of fs.readdirSync(path.join(__dirname, '..', 'data', 'questions'))) {
  for (const q of JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'questions', f), 'utf8'))) odpovedi[q.id] = q.answer;
}

async function hrac(jmeno) {
  const nick = jmeno + Math.floor(Math.random() * 1e6);
  const r = await api('/auth/register', { method: 'POST', body: { nick, pin: '4821', band: 'dospeli', age13: true } });
  return { nick, T: r.b.token };
}

(async () => {
  console.log('\nŽivý kvíz');
  const [A, Bh, C] = [await hrac('KvA'), await hrac('KvB'), await hrac('KvC')];
  const tempo = { za_s: 3, kol: 2, na_kolo: 3, limit_s: 4, odhaleni_s: 3, prestavka_s: 4 };
  const z = await api('/kviz/dev', { method: 'POST', body: tempo });
  kontrola(z.s === 201 && z.b.id, 'zkušební kvíz založen ' + z.s);
  const id = z.b.id;

  const g = await api('/kviz', {}, A.T);
  kontrola(g.s === 200 && g.b.kviz && g.b.kviz.id === id, 'GET /kviz vrací nejbližší (zkušební) kvíz');
  kontrola(g.b.kviz && g.b.kviz.prihlasen === false && typeof g.b.server_now === 'number', 'nepřihlášený, se serverovým časem');
  kontrola(!JSON.stringify(g.b).includes('question_ids'), 'GET /kviz neprozrazuje otázky');
  const anon = await api('/kviz');
  kontrola(anon.s === 200 && anon.b.ja === null, 'GET /kviz jde i bez přihlášení');

  kontrola((await api('/kviz/' + id + '/prihlasit', { method: 'POST' })).s === 401, 'přihlásit do kvízu chce profil');
  const p = await api('/kviz/' + id + '/prihlasit', { method: 'POST', body: { zdroj: 'FB-Streda!!' } }, A.T);
  kontrola(p.s === 200 && p.b.pocet_hracu === 1, 'A přihlášen');
  await api('/kviz/' + id + '/prihlasit', { method: 'POST' }, Bh.T);
  const p2 = await api('/kviz/' + id + '/prihlasit', { method: 'POST' }, A.T);
  kontrola(p2.s === 200 && p2.b.pocet_hracu === 2, 'druhé přihlášení nic nezdvojí');

  const pred = await api('/kviz/' + id + '/q/0', {}, A.T);
  kontrola(pred.s === 425 && pred.b.za_ms > 0, 'otázka před začátkem → 425');
  kontrola((await api('/kviz/' + id + '/q/0', {}, C.T)).s === 403, 'nepřihlášený hráč otázku nedostane');
  kontrola((await api('/kviz/' + id + '/poradi', {}, A.T)).s === 425, 'pořadí před prvním kolem zavřené');

  const start = z.b.starts_at;
  const naOt = (tempo.limit_s + tempo.odhaleni_s) * 1000;
  const otevreno = n => start + Math.floor(n / tempo.na_kolo) * (tempo.na_kolo * naOt + tempo.prestavka_s * 1000) + (n % tempo.na_kolo) * naOt;
  const celkem = tempo.kol * tempo.na_kolo;
  let ocekA = 0;

  for (let n = 0; n < celkem; n++) {
    await spi(otevreno(n) - Date.now() + 150);
    const q = await api('/kviz/' + id + '/q/' + n, {}, A.T);
    if (q.s !== 200) { kontrola(false, 'otázka ' + n + ' ' + q.s + ' ' + JSON.stringify(q.b)); break; }
    if (n === 0) {
      kontrola(!('answer' in q.b) && !('correct_index' in q.b), 'otázka neobsahuje správnou odpověď');
      kontrola(q.b.kolo === 1 && q.b.v_kole === 1 && q.b.total === celkem, 'otázka nese kolo a pořadí');
      kontrola((await api('/kviz/' + id + '/odhaleni/0', {}, A.T)).s === 425, 'odhalení před uzávěrkou → 425');
    }
    const spravny = q.b.options.indexOf(odpovedi[q.b.id]);
    const spatny = (spravny + 1) % 4;
    const a = await api('/kviz/' + id + '/odpoved', { method: 'POST', body: { n, pick: spravny } }, A.T);
    if (n === 0) {
      kontrola(a.s === 200 && a.b.prijato && !('correct' in a.b) && !('points' in a.b), 'odpověď přijata, správnost neprozrazena');
      kontrola((await api('/kviz/' + id + '/odpoved', { method: 'POST', body: { n, pick: spatny } }, A.T)).s === 409, 'druhá odpověď → 409');
    }
    const ms = a.b.ms;
    ocekA += 100 + Math.round(100 * (tempo.limit_s * 1000 - ms) / (tempo.limit_s * 1000));
    if (n !== 1) await api('/kviz/' + id + '/odpoved', { method: 'POST', body: { n, pick: spatny } }, Bh.T);

    if (n === 1) {
      // B na otázku 1 neodpoví včas — po uzávěrce + toleranci musí dostat 410.
      await spi(otevreno(n) + tempo.limit_s * 1000 + 1700 - Date.now());
      kontrola((await api('/kviz/' + id + '/odpoved', { method: 'POST', body: { n, pick: spatny } }, Bh.T)).s === 410, 'odpověď po uzávěrce → 410');
    }
    await spi(otevreno(n) + tempo.limit_s * 1000 + 1600 - Date.now());
    const o = await api('/kviz/' + id + '/odhaleni/' + n, {}, A.T);
    if (n === 0) {
      kontrola(o.s === 200 && o.b.correct_index === spravny && o.b.correct_answer === odpovedi[q.b.id], 'odhalení: správná odpověď sedí');
      kontrola(o.b.ja && o.b.ja.correct && o.b.ja.points > 100 && o.b.odpovedelo === 2 && o.b.trefilo === 1, 'odhalení: můj výsledek a statistika');
    }
    if (n === tempo.na_kolo) {
      // druhé kolo už běží → pořadí zavřené
      kontrola((await api('/kviz/' + id + '/poradi', {}, A.T)).s === 425, 'pořadí během kola zavřené');
    }
    if (n === tempo.na_kolo - 1) {
      await spi(otevreno(n) + naOt + 300 - Date.now());
      const po = await api('/kviz/' + id + '/poradi', {}, Bh.T);
      kontrola(po.s === 200 && po.b.po_kole === 1 && po.b.top[0].nick === A.nick && po.b.ja && po.b.ja.misto === 2, 'přestávka: pořadí po 1. kole, B na 2. místě');
    }
  }

  await spi(start + tempo.kol * tempo.na_kolo * naOt + (tempo.kol - 1) * tempo.prestavka_s * 1000 + 300 - Date.now());
  const konec = await api('/kviz/' + id + '/poradi', {}, A.T);
  kontrola(konec.s === 200 && konec.b.konec && konec.b.pocet === 2, 'po konci: pořadí dostupné');
  kontrola(konec.b.ja && konec.b.ja.misto === 1 && konec.b.ja.score === ocekA && konec.b.ja.spravne === celkem,
    'A vyhrál, body sedí na měření od otevření (' + (konec.b.ja && konec.b.ja.score) + ' = ' + ocekA + ')');
  kontrola(konec.b.top[1] && konec.b.top[1].score === 0, 'B má nulu');
  kontrola((await api('/kviz/' + id + '/prihlasit', { method: 'POST' }, C.T)).s === 410, 'po konci se přihlásit nedá');
  const g2 = await api('/kviz', {}, A.T);
  kontrola(g2.b.predchozi && g2.b.predchozi.vitez && g2.b.predchozi.vitez.nick === A.nick, 'GET /kviz hlásí vítěze minulého kvízu');
  kontrola(g2.b.kviz && g2.b.kviz.id !== id && /^k\d{12}$/.test(g2.b.kviz.id), 'další pravidelný termín se založil sám (' + (g2.b.kviz && g2.b.kviz.id) + ')');

  console.log(chyb ? '\nNĚCO NEPROŠLO: ' + chyb + ' z ' + (ok + chyb) : '\nVŠE V POŘÁDKU: ' + ok + ' kontrol');
  if (chyb) process.exitCode = 1;
})().catch(e => { console.error('Test spadl:', e); process.exitCode = 1; });
