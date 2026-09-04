// Ověří, že /live posílá soupeřovy odpovědi AŽ po mé odpovědi (anti-cheat hranice)
// a že po dohrání otázky vidím, jak si soupeř vedl.
const BASE = process.env.API_BASE || 'http://127.0.0.1:8790';
const uniq = () => Math.random().toString(36).slice(2, 8);

async function api(path, { method = 'GET', token, body } = {}) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let b = null; try { b = await r.json(); } catch {}
  return { status: r.status, body: b };
}

(async () => {
  let chyb = 0;
  const ok = (p, popis, extra) => { if (p) console.log('  OK    ' + popis);
    else { chyb++; console.log('  CHYBA ' + popis + (extra ? ' — ' + extra : '')); } };

  const A = (await api('/api/auth/register', { method: 'POST',
    body: { band: 'dospeli', nick: 'DuelA_' + uniq(), pin: '1234' } })).body;
  const B = (await api('/api/auth/register', { method: 'POST',
    body: { band: 'dospeli', nick: 'DuelB_' + uniq(), pin: '1234' } })).body;

  await api('/api/match', { method: 'POST', token: A.token, body: { time_control: 'blesk' } });
  const par = await api('/api/match', { method: 'POST', token: B.token, body: { time_control: 'blesk' } });
  const gid = par.body.game_id;
  console.log('\nDuel: soupeřovy odpovědi se smí ukázat až po mé\n');
  ok(!!gid, 'hra vznikla');

  // B odpoví na otázku 0, A ještě ne
  await api(`/api/game/${gid}/q/0`, { token: B.token });
  await api(`/api/game/${gid}/answer`, { method: 'POST', token: B.token, body: { n: 0, pick: 0, ms: 1500 } });

  // Pozor: tuhle kontrolu drží i pouhé `mine.answered > 0`, takže SAMA O SOBĚ neověřuje
  // hranici `q_index < mine.answered`. Tu hlídá až poslední kontrola dole — ověřeno
  // mutací (hranice nahrazena konstantou 999: tahle prošla, ta poslední spadla).
  const predMou = await api(`/api/game/${gid}/live`, { token: A.token });
  ok((predMou.body.opponent.answers || []).length === 0,
     'dokud jsem neodpověděl, soupeřovy odpovědi NEVIDÍM',
     JSON.stringify(predMou.body.opponent.answers));

  // teď odpoví A
  await api(`/api/game/${gid}/q/0`, { token: A.token });
  await api(`/api/game/${gid}/answer`, { method: 'POST', token: A.token, body: { n: 0, pick: 1, ms: 3000 } });

  const poMe = await api(`/api/game/${gid}/live`, { token: A.token });
  const ans = poMe.body.opponent.answers || [];
  ok(ans.length === 1 && ans[0].n === 0, 'po mé odpovědi vidím soupeřův výsledek na téže otázce',
     JSON.stringify(ans));
  ok(typeof ans[0]?.correct === 'boolean' && typeof ans[0]?.ms === 'number',
     'a nese trefu i čas (pro porovnání, kdo byl rychlejší)', JSON.stringify(ans[0]));

  // otázka 1: B na ni odpoví, A ne — nesmí ji vidět
  await api(`/api/game/${gid}/q/1`, { token: B.token });
  await api(`/api/game/${gid}/answer`, { method: 'POST', token: B.token, body: { n: 1, pick: 0, ms: 1000 } });
  const dalsi = await api(`/api/game/${gid}/live`, { token: A.token });
  const ans2 = dalsi.body.opponent.answers || [];
  ok(ans2.every(x => x.n < 1), 'otázku, kterou ještě nemám za sebou, soupeřovu odpověď nevidím',
     JSON.stringify(ans2));

  console.log(chyb ? '\nNEPROŠLO: ' + chyb + ' chyb' : '\nVŠE V POŘÁDKU');
  process.exit(chyb ? 1 : 0);
})();
