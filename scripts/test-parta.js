// Test API turnaje pro partu (2026-10-05) proti běžícímu `npm run dev` na portu 8788.
// Hlídá hlavně to, že HOST (hráč bez profilu) se nedostane nikam mimo svůj turnaj.
const B = 'http://localhost:8788/api';
async function api(path, opts = {}, token) {
  const h = { 'content-type': 'application/json' };
  if (token) h.authorization = 'Bearer ' + token;
  const r = await fetch(B + path, { method: opts.method || 'GET', headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined });
  let b = null; try { b = await r.json(); } catch (e) {}
  return { s: r.status, b };
}
const ok = (c, m) => { console.log((c ? 'OK   ' : 'CHYBA') + ' ' + m); if (!c) process.exitCode = 1; };
(async () => {
  const nick = 'Zakl' + Math.floor(Math.random() * 1e6);
  const reg = await api('/auth/register', { method: 'POST', body: { nick, pin: '4821', band: 'dospeli', age13: true } });
  const T = reg.b.token;
  const now = Date.now();
  const c = await api('/parta', { method: 'POST', body: { name: 'Pátek u Nováků', ends_at: now + 3600e3 } }, T);
  ok(c.s === 201 && /^p[a-z0-9]{12}$/.test(c.b.id), 'založení ' + c.s + ' ' + JSON.stringify(c.b));
  const id = c.b.id;
  const anon = await api('/parta/' + id);
  ok(anon.s === 200 && anon.b.players.length === 1 && anon.b.owner === nick && anon.b.me === null, 'detail bez přihlášení');
  const bez13 = await api('/parta/' + id + '/join', { method: 'POST', body: { name: 'Jana' } });
  ok(bez13.s === 400, 'host bez 13+ odmítnut');
  const j = await api('/parta/' + id + '/join', { method: 'POST', body: { name: 'Jana', age13: true } });
  ok(j.s === 201 && j.b.token, 'host Jana se přidal');
  const G = j.b.token;
  const dup = await api('/parta/' + id + '/join', { method: 'POST', body: { name: 'jana', age13: true } });
  ok(dup.s === 409, 'stejné jméno podruhé odmítnuto');
  ok((await api('/me', {}, G)).s === 401, 'host nesmí na /me');
  ok((await api('/match', { method: 'POST', body: {} }, G)).s === 401, 'host nesmí do fronty');
  ok((await api('/parta', { method: 'POST', body: { ends_at: now + 3600e3 } }, G)).s === 401, 'host nesmí zakládat');
  ok((await api('/auth/login', { method: 'POST', body: { nick: 'Jana', pin: '0000' } })).s === 401, 'host se nepřihlásí');
  const pl = await api('/parta/' + id + '/play', { method: 'POST' }, G);
  ok(pl.s === 201 && pl.b.game_id, 'host založí hru');
  const pl2 = await api('/parta/' + id + '/play', { method: 'POST' }, G);
  ok(pl2.s === 200 && pl2.b.game_id === pl.b.game_id, 'druhé play vrátí tutéž hru');
  const gid = pl.b.game_id;
  const pz = await api('/parta/' + id + '/play', { method: 'POST' }, T);
  for (let n = 0; n < 10; n++) {
    const q = await api('/game/' + gid + '/q/' + n, {}, G);
    if (q.s !== 200) { ok(false, 'otázka ' + n + ' ' + q.s); break; }
    await api('/game/' + gid + '/answer', { method: 'POST', body: { n, pick: 0 } }, G);
  }
  const g = await api('/game/' + gid, {}, G);
  ok(g.s === 200 && g.b.me.done && g.b.status === 'done', 'hostova hra dohraná a uzavřená');
  const d = await api('/parta/' + id, {}, G);
  ok(d.b.me && d.b.me.done && d.b.players[0].name === 'Jana' && d.b.players[0].score != null, 'pořadí: Jana dohraná nahoře');
  ok(d.b.players.find(p => p.name === nick).playing && d.b.players.find(p => p.name === nick).score === null, 'zakladatel rozehraný bez skóre');
  const zpozdeny = await api('/parta', { method: 'POST', body: { starts_at: now + 7200e3, ends_at: now + 9000e3 } }, T);
  const j2 = await api('/parta/' + zpozdeny.b.id + '/join', { method: 'POST', body: { name: 'Petr', age13: true } });
  ok((await api('/parta/' + zpozdeny.b.id + '/play', { method: 'POST' }, j2.b.token)).s === 409, 'před začátkem se hrát nedá');
  ok((await api('/parta', { method: 'POST', body: { ends_at: now + 60e3 } }, T)).s === 400, 'příliš krátký turnaj odmítnut');
  ok((await api('/parta/pneexistuje1234')).s === 404, 'neexistující turnaj 404');
})();
