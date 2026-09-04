// Ověří, že v GHOST hře (mode "odkaz" — cesta „Hrát teď") vidím po své odpovědi,
// jak si soupeř vedl na téže otázce. Právě tahle cesta se při prvním pokusu minula,
// protože souboj byl podmíněný jen mode duel/turnaj.
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

  console.log('\nGhost („Hrát teď"): souboj se musí ukázat i v režimu odkaz\n');
  const A = (await api('/api/auth/register', { method: 'POST',
    body: { band: 'dospeli', nick: 'Ghost_' + uniq(), pin: '1234' } })).body;

  // Přesně to, co dělá klient po offer_bot: založ hru na odkaz a nasaď bota.
  const g = await api('/api/game', { method: 'POST', token: A.token,
    body: { mode: 'odkaz', time_control: 'blesk' } });
  const gid = g.body.id;
  ok(!!gid, 'hra na odkaz vznikla');
  const bot = await api(`/api/game/${gid}/bot`, { method: 'POST', token: A.token });
  ok(bot.status === 200, 'ghost soupeř nastoupil', JSON.stringify(bot.body).slice(0, 80));

  const pred = await api(`/api/game/${gid}/live`, { token: A.token });
  ok(!!pred.body.opponent, 'soupeř je v /live vidět');
  ok((pred.body.opponent.answers || []).length === 0,
     'před mou odpovědí jeho výsledky nevidím');
  ok(pred.body.opponent.score == null,
     'a celkové skóre soupeře se u odkazu neposílá (byla by to meta)',
     JSON.stringify(pred.body.opponent.score));

  await api(`/api/game/${gid}/q/0`, { token: A.token });
  await api(`/api/game/${gid}/answer`, { method: 'POST', token: A.token, body: { n: 0, pick: 0, ms: 2000 } });

  const po = await api(`/api/game/${gid}/live`, { token: A.token });
  const ans = po.body.opponent.answers || [];
  ok(ans.length === 1 && ans[0].n === 0,
     'po mé odpovědi vidím, jak ghost dopadl na téže otázce', JSON.stringify(ans));
  ok(typeof ans[0]?.correct === 'boolean' && typeof ans[0]?.ms === 'number',
     'a nese trefu i čas', JSON.stringify(ans[0]));

  console.log(chyb ? '\nNEPROŠLO: ' + chyb + ' chyb' : '\nVŠE V POŘÁDKU');
  process.exit(chyb ? 1 : 0);
})();
