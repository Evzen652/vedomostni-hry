#!/usr/bin/env node
/**
 * test-api.js — kouřový test online API proti běžícímu `npm run dev`.
 *
 * Ověřuje vlastnosti, na kterých stojí návrh (docs/online-rezim.md):
 *   - správná odpověď NIKDY není v payloadu otázky,
 *   - vyhodnocuje server, ne klient,
 *   - na zodpovězenou otázku nejde odpovědět podruhé,
 *   - dětské pásmo dostane generovanou přezdívku (žádná moderace),
 *   - v souboji dostanou oba stejné otázky a soupeřovo skóre je skryté do konce,
 *   - hodnocený souboj hne ratingem, hra proti botovi ne.
 *
 * Spuštění:  npm run dev          (v jednom terminálu)
 *            npm run test:api     (ve druhém)
 */
const BASE = process.env.API_BASE || 'http://127.0.0.1:8788';

let pass = 0, fail = 0;
const ok = (cond, label, detail) => {
  if (cond) { pass++; console.log('  OK    ' + label); }
  else { fail++; console.log('  CHYBA ' + label + (detail ? '\n        ' + detail : '')); }
};
const section = t => console.log('\n' + t);

const api = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = 'Bearer ' + token;
  const r = await fetch(BASE + path, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
  });
  let out = null;
  try { out = await r.json(); } catch (e) { /* prázdné */ }
  return { status: r.status, body: out };
};

const uniq = () => Math.random().toString(36).slice(2, 8);

/** Odehraje hru do konce; vrací součet bodů. */
async function playAll(token, gameId, total, ms = 2000) {
  let last = null;
  for (let n = 0; n < total; n++) {
    const q = await api(`/api/game/${gameId}/q/${n}`, { token });
    if (q.status !== 200) throw new Error('otázka ' + n + ' selhala: ' + JSON.stringify(q.body));
    last = await api(`/api/game/${gameId}/answer`, { method: 'POST', token, body: { n, pick: 0, ms } });
  }
  return last.body;
}

(async () => {
  console.log('Test online API na ' + BASE);

  // ------------------------------------------------------------ účty
  section('Účty');
  const nickA = 'Tester_' + uniq();
  const reg = await api('/api/auth/register', {
    method: 'POST', body: { band: 'dospeli', nick: nickA, pin: '1234' },
  });
  ok(reg.status === 201, 'registrace projde', JSON.stringify(reg.body));
  const A = reg.body;
  ok(!!A.token, 'vrátí se přihlašovací token');

  const dup = await api('/api/auth/register', {
    method: 'POST', body: { band: 'dospeli', nick: nickA, pin: '9999' },
  });
  ok(dup.status === 409, 'stejná přezdívka podruhé neprojde, dostal ' + dup.status);

  const shortPin = await api('/api/auth/register', {
    method: 'POST', body: { band: 'dospeli', nick: 'X_' + uniq(), pin: '12' },
  });
  ok(shortPin.status === 400, 'krátký PIN se odmítne, dostal ' + shortPin.status);

  const kid = await api('/api/auth/register', { method: 'POST', body: { band: 'deti', pin: '4321' } });
  ok(kid.status === 201, 'dětská registrace projde bez zadané přezdívky');
  ok(/\s/.test(kid.body.nick || ''), 'dítě dostalo generovanou přezdívku: ' + kid.body.nick);

  const badLogin = await api('/api/auth/login', { method: 'POST', body: { nick: nickA, pin: '0000' } });
  ok(badLogin.status === 401, 'špatný PIN neprojde, dostal ' + badLogin.status);
  const goodLogin = await api('/api/auth/login', { method: 'POST', body: { nick: nickA, pin: '1234' } });
  ok(goodLogin.status === 200, 'správný PIN projde');

  const noAuth = await api('/api/me');
  ok(noAuth.status === 401, 'bez tokenu je /api/me 401, dostal ' + noAuth.status);
  const me = await api('/api/me', { token: A.token });
  ok(me.status === 200 && me.body.nick === nickA, 'profil vrátí správnou přezdívku');

  // ------------------------------------------------------------ sólo hra
  section('Sólo hra');
  const solo = await api('/api/game', { method: 'POST', token: A.token, body: { time_control: 'blesk' } });
  ok(solo.status === 201, 'hra se založí', JSON.stringify(solo.body));
  ok(solo.body.total === 10, 'blesk má 10 otázek, dostal ' + solo.body.total);

  const q0 = await api(`/api/game/${solo.body.id}/q/0`, { token: A.token });
  const keys = Object.keys(q0.body).join(',');
  ok(!('answer' in q0.body), 'payload NEobsahuje answer (klíče: ' + keys + ')');
  ok(!('correct_index' in q0.body), 'payload NEobsahuje index správné odpovědi');
  ok(q0.body.options && q0.body.options.length === 4, 'čtyři možnosti');

  const stranger = await api(`/api/game/${solo.body.id}/q/0`, { token: kid.body.token });
  ok(stranger.status === 403, 'cizí hráč se do hry nepodívá, dostal ' + stranger.status);

  const a0 = await api(`/api/game/${solo.body.id}/answer`, {
    method: 'POST', token: A.token, body: { n: 0, pick: 0, ms: 3000 } });
  ok(a0.status === 200 && typeof a0.body.correct === 'boolean', 'server vyhodnotí odpověď');
  ok(Number.isInteger(a0.body.correct_index), 'index správné odpovědi přijde až teď');

  const twice = await api(`/api/game/${solo.body.id}/answer`, {
    method: 'POST', token: A.token, body: { n: 0, pick: 1, ms: 500 } });
  ok(twice.status === 409, 'druhý pokus na tutéž otázku se odmítne, dostal ' + twice.status);

  const mid = await api(`/api/game/${solo.body.id}`, { token: A.token });
  ok(mid.body.review === undefined, 'rozbor se za běhu neukazuje');

  for (let n = 1; n < solo.body.total; n++) {
    await api(`/api/game/${solo.body.id}/answer`, {
      method: 'POST', token: A.token, body: { n, pick: 0, ms: 2000 } });
  }
  const done = await api(`/api/game/${solo.body.id}`, { token: A.token });
  ok(done.body.me.done === true, 'hra je dohraná');
  ok(done.body.review?.length === 10, 'rozbor má 10 položek');
  ok(done.body.status === 'done', 'hra je uzavřená');

  const seenAfter = (await api('/api/me', { token: A.token })).body.seen_questions;
  ok(seenAfter >= 10, 'viděné otázky se evidují (' + seenAfter + ')');

  // POZOR NA OČEKÁVÁNÍ: tohle NENÍ test ztraceného zápisu. Zkoušel jsem ho tak napsat
  // (dvě odpovědi přes Promise.all) a ověřoval mutací — po vrácení původního
  // `answered = <přečtená hodnota> + 1` test třikrát po sobě PROŠEL. Závod se přes
  // HTTP proti lokálnímu wrangleru vynutit nedá, requesty se fakticky serializují.
  // Nechávám ho jako kouřovou zkoušku toho, že dohrání uzavře hru a čítač sedí —
  // to je invariant, který se dá porušit i jinak (readback, finished_at).
  //
  // Skutečnou záruku dává tvar zápisu, ne tenhle test: `answered = answered + 1` je
  // relativní, takže se dvě souběžné odpovědi nemůžou přepsat. Do 2026-09-01 se
  // zapisovala absolutní hodnota přečtená o pár řádků výš, čítač zůstal pozadu,
  // `finished_at` se nenastavilo a hra visela v 'open' navždy.
  const soub = await api('/api/game', {
    method: 'POST', token: A.token, body: { time_control: 'blesk' } });
  await Promise.all([
    api(`/api/game/${soub.body.id}/answer`, { method: 'POST', token: A.token, body: { n: 0, pick: 0, ms: 1000 } }),
    api(`/api/game/${soub.body.id}/answer`, { method: 'POST', token: A.token, body: { n: 1, pick: 0, ms: 1000 } }),
  ]);
  for (let n = 2; n < soub.body.total; n++) {
    await api(`/api/game/${soub.body.id}/answer`, { method: 'POST', token: A.token, body: { n, pick: 0, ms: 1000 } });
  }
  const poSoubehu = await api(`/api/game/${soub.body.id}`, { token: A.token });
  ok(poSoubehu.body.me.answered === soub.body.total,
     'čítač odpovědí sedí po dohrání (' + poSoubehu.body.me.answered + '/' + soub.body.total + ')');
  ok(poSoubehu.body.status === 'done', 'a hra se uzavře, ne aby visela v open');

  // ------------------------------------------------------------ souboj na odkaz
  section('Souboj na odkaz');
  const nickB = 'Souper_' + uniq();
  const B = (await api('/api/auth/register', {
    method: 'POST', body: { band: 'dospeli', nick: nickB, pin: '5678' } })).body;

  const duel = await api('/api/game', {
    method: 'POST', token: A.token, body: { mode: 'odkaz', time_control: 'blesk' } });
  ok(duel.status === 201 && duel.body.rated === true, 'souboj na odkaz je hodnocený');

  const selfJoin = await api(`/api/game/${duel.body.id}/join`, { method: 'POST', token: A.token });
  ok(selfJoin.body?.already === true, 'zakladatel se nepřipojuje podruhé');

  const join = await api(`/api/game/${duel.body.id}/join`, { method: 'POST', token: B.token });
  ok(join.status === 200, 'soupeř se připojí', JSON.stringify(join.body));

  const kidJoin = await api(`/api/game/${duel.body.id}/join`, { method: 'POST', token: kid.body.token });
  ok(kidJoin.status === 409, 'hráč z jiného pásma se nepřipojí, dostal ' + kidJoin.status);

  // Třetí hráč do souboje pro dva. Ověřuje APLIKAČNÍ kontrolu v join.js — ta tam byla
  // odjakživa. UNIQUE index (game_id, slot) přidaný 2026-09-01 tenhle test NEPROVĚŘÍ:
  // zkoušel jsem ho mutací (DROP INDEX) a test dál procházel, protože v sekvenčním
  // volání zabere kontrola počtu dřív. Index chrání jen souběh, který se přes HTTP
  // vynutit nedá — je to obrana do hloubky, ne něco, co by tenhle test měřil.
  const treti = (await api('/api/auth/register', { method: 'POST',
    body: { nick: 'Treti_' + uniq(), pin: '1234', band: 'dospeli' } })).body;
  const tretiJoin = await api(`/api/game/${duel.body.id}/join`, { method: 'POST', token: treti.token });
  ok(tretiJoin.status === 409, 'třetí hráč se do souboje nedostane, dostal ' + tretiJoin.status);

  // oba dostanou stejné otázky
  const qa = await api(`/api/game/${duel.body.id}/q/0`, { token: A.token });
  const qb = await api(`/api/game/${duel.body.id}/q/0`, { token: B.token });
  ok(qa.body.question === qb.body.question, 'oba hráči dostali stejnou otázku');
  ok(JSON.stringify(qa.body.options) === JSON.stringify(qb.body.options),
     'i ve stejném pořadí odpovědí');

  await playAll(A.token, duel.body.id, duel.body.total, 1500);
  const halfway = await api(`/api/game/${duel.body.id}`, { token: A.token });
  const opp = halfway.body.players.find(p => p.nick === nickB);
  ok(opp && opp.score === null, 'soupeřovo skóre je skryté, dokud nedohraje');

  const predHrou = (await api('/api/me', { token: A.token }))
    .body.ratings.find(r => r.band === 'dospeli');
  const ratingBefore = predHrou.rating, rdBefore = predHrou.rd;
  await playAll(B.token, duel.body.id, duel.body.total, 4000);

  const after = await api(`/api/game/${duel.body.id}`, { token: A.token });
  ok(after.body.players.every(p => p.score !== null), 'po dohrání obou se skóre odkryje');
  ok(['vyhra', 'prohra', 'remiza'].includes(after.body.result),
     'souboj má výsledek: ' + after.body.result);
  ok(after.body.review?.[0]?.opponent !== undefined, 'rozbor ukazuje i soupeřův tip');

  const poHre = (await api('/api/me', { token: A.token }))
    .body.ratings.find(r => r.band === 'dospeli');
  // Oba hráči tipují vždy první možnost, takže občas oba trefí nulu a je remíza.
  // Remíza mezi stejně silnými hráči rating NEHÝBE — je to správné chování Glicka,
  // ne chyba. Dřív to test tvrdil natvrdo a padal zhruba na (3/4)^10 = 5,6 % běhů.
  // Co platí vždy: hodnocená hra zmenší nejistotu (RD).
  ok(poHre.rd < rdBefore,
     'hodnocená hra zmenšila nejistotu ratingu (rd ' + rdBefore + ' → ' + poHre.rd + ')');
  ok(after.body.result === 'remiza' || poHre.rating !== ratingBefore,
     after.body.result === 'remiza'
       ? 'remíza mezi vyrovnanými hráči rating nehnula, správně'
       : 'hodnocený souboj hnul ratingem (' + ratingBefore + ' → ' + poHre.rating + ')');

  // ------------------------------------------------------------ bot
  section('Bot');
  const vsBot = await api('/api/game', {
    method: 'POST', token: A.token, body: { mode: 'odkaz', time_control: 'blesk' } });
  const botRes = await api(`/api/game/${vsBot.body.id}/bot`, { method: 'POST', token: A.token });
  ok(botRes.status === 200, 'bot se pustí do hry', JSON.stringify(botRes.body));
  ok(botRes.body.bot?.nick, 'bot má jméno: ' + botRes.body.bot?.nick);
  ok(typeof botRes.body.bot_score === 'number', 'bot odehrál a má skóre ' + botRes.body.bot_score);

  const ratingPreBot = (await api('/api/me', { token: A.token }))
    .body.ratings.find(r => r.band === 'dospeli').rating;
  await playAll(A.token, vsBot.body.id, vsBot.body.total, 2500);
  const botGame = await api(`/api/game/${vsBot.body.id}`, { token: A.token });
  ok(botGame.body.rated === false, 'hra proti botovi je nehodnocená');
  ok(botGame.body.players.some(p => p.is_bot), 'rozbor ví, že soupeř byl bot');
  const ratingPostBot = (await api('/api/me', { token: A.token }))
    .body.ratings.find(r => r.band === 'dospeli').rating;
  ok(ratingPreBot === ratingPostBot, 'rating se proti botovi nehnul (nejde farmit)');

  // ------------------------------------------------------------ denní pětka
  section('Denní pětka');
  const d1 = await api('/api/daily', { token: A.token });
  ok(d1.status === 201 || d1.status === 200, 'denní pětka se vydá');
  ok(d1.body.total === 5, 'má pět otázek, dostal ' + d1.body.total);

  const d2 = await api('/api/daily', { token: B.token });
  const qA = await api(`/api/game/${d1.body.game_id}/q/0`, { token: A.token });
  const qB = await api(`/api/game/${d2.body.game_id}/q/0`, { token: B.token });
  ok(qA.body.question === qB.body.question, 'oba hráči mají tutéž denní otázku');

  await playAll(A.token, d1.body.game_id, 5, 3000);
  const dAgain = await api('/api/daily', { token: A.token });
  ok(dAgain.body.already_played === true, 'druhý pokus o denní pětku se nenabídne');
  ok(dAgain.body.game_id === d1.body.game_id, 'vrací se tatáž hra, ne nová');

  const dBoard = await api('/api/leaderboard?band=dospeli&daily=1', { token: A.token });
  ok(dBoard.body.rows?.length >= 1, 'žebříček dne má aspoň jeden zápis');

  // ------------------------------------------------------------ žebříček
  section('Žebříček');
  // Žebříček byl do 2026-09-01 jediný endpoint mimo /auth/* bez přihlášení.
  const bezTokenu = await api('/api/leaderboard?band=dospeli');
  ok(bezTokenu.status === 401, 'žebříček bez přihlášení neprojde, dostal ' + bezTokenu.status);

  const board = await api('/api/leaderboard?band=dospeli', { token: A.token });
  ok(board.status === 200 && board.body.kind === 'rating', 'žebříček ratingu se vrátí');
  ok(Array.isArray(board.body.rows), 'obsahuje seznam');
  ok(board.body.rows.every(r => !r.is_bot), 'boti v žebříčku nejsou');

  // ------------------------------------------------------------ živý duel
  section('Živý duel a párování');
  const C = (await api('/api/auth/register', {
    method: 'POST', body: { band: 'dospeli', nick: 'Zivy_' + uniq(), pin: '1111' } })).body;
  const D = (await api('/api/auth/register', {
    method: 'POST', body: { band: 'dospeli', nick: 'Zivy_' + uniq(), pin: '2222' } })).body;

  const q1 = await api('/api/match', { method: 'POST', token: C.token, body: { time_control: 'blesk' } });
  ok(q1.body.matched === false && q1.body.waiting === true, 'první hráč čeká ve frontě');

  const q2 = await api('/api/match', { method: 'POST', token: D.token, body: { time_control: 'blesk' } });
  ok(q2.body.matched === true, 'druhý hráč se spáruje', JSON.stringify(q2.body));
  ok(!!q2.body.game_id, 'párování vrátí hru');
  ok(!!q2.body.opponent?.nick, 'a jméno soupeře: ' + q2.body.opponent?.nick);

  const poll = await api('/api/match', { token: C.token });
  ok(poll.body.matched === true && poll.body.game_id === q2.body.game_id,
     'čekající hráč se o spárování dozví při dotazu');

  const liveMid = await api(`/api/game/${q2.body.game_id}/live`, { token: C.token });
  ok(liveMid.status === 200, 'průběžný stav se vrátí');
  ok(liveMid.body.opponent?.score === 0, 'u živého duelu je soupeřovo skóre vidět průběžně');

  await playAll(C.token, q2.body.game_id, q2.body.total, 1200);
  await playAll(D.token, q2.body.game_id, q2.body.total, 5000);
  const liveEnd = await api(`/api/game/${q2.body.game_id}/live`, { token: C.token });
  ok(liveEnd.body.both_done === true, 'po dohrání obou je duel uzavřený');

  const cRating = (await api('/api/me', { token: C.token }))
    .body.ratings.find(r => r.band === 'dospeli');
  ok(cRating.games === 1, 'živý duel se započítal do ratingu (' + cRating.rating + ')');

  const left = await api('/api/match', { method: 'DELETE', token: C.token });
  ok(left.body.left === true, 'z fronty se dá odejít');

  // ------------------------------------------------------------ přátelé a odveta
  section('Přátelé a odveta');
  const mineFriends = await api('/api/friends', { token: A.token });
  ok(/^[A-Z0-9]{6}$/.test(mineFriends.body.my_code || ''),
     'mám kód pro přidání do přátel: ' + mineFriends.body.my_code);

  const bCode = (await api('/api/friends', { token: B.token })).body.my_code;
  const addF = await api('/api/friends', { method: 'POST', token: A.token, body: { code: bCode } });
  ok(addF.status === 201, 'přítel se přidá podle kódu');

  const listA = await api('/api/friends', { token: A.token });
  ok(listA.body.friends.some(f => f.nick === nickB), 'je v mém seznamu');
  const listB = await api('/api/friends', { token: B.token });
  ok(listB.body.friends.some(f => f.nick === nickA), 'a přátelství je oboustranné');

  const selfAdd = await api('/api/friends', {
    method: 'POST', token: A.token, body: { code: mineFriends.body.my_code } });
  ok(selfAdd.status === 400, 'vlastní kód neprojde, dostal ' + selfAdd.status);
  const badCode = await api('/api/friends', { method: 'POST', token: A.token, body: { code: 'ZZZZZZ' } });
  ok(badCode.status === 404, 'neexistující kód je 404, dostal ' + badCode.status);

  // Kód je JEDINÁ ochrana dětí před oslovením cizím člověkem, ale prostor 31^6
  // chrání konkrétní účet, ne populaci — útočníkovi stačí jakékoli dítě. Limit se
  // proto počítá jen z NEÚSPĚŠNÝCH pokusů; kdo kód opravdu dostal, na něj nenarazí.
  const hadac = (await api('/api/auth/register', { method: 'POST',
    body: { nick: 'Hadac_' + uniq(), pin: '1234', band: 'dospeli' } })).body;
  let posledni = null;
  for (let i = 0; i < 12; i++) {
    posledni = await api('/api/friends', { method: 'POST', token: hadac.token,
      body: { code: 'QQQQQ' + String(i % 10) } });
  }
  ok(posledni.status === 429, 'hádání kódu se po deseti pokusech zastaví, dostal ' + posledni.status);
  // Platný kód po vyčerpání limitu taky neprojde — jinak by limit nechránil nic.
  const poLimitu = await api('/api/friends', { method: 'POST', token: hadac.token, body: { code: bCode } });
  ok(poLimitu.status === 429, 'ani platný kód po limitu neprojde, dostal ' + poLimitu.status);

  // Odebrat přítele muselo jít: přidání je oboustranné a bez souhlasu druhé strany,
  // takže bez DELETE zůstal kdokoli v seznamu napořád.
  const bId = listA.body.friends.find(f => f.nick === nickB).id;
  const odebr = await api('/api/friends', { method: 'DELETE', token: A.token, body: { id: bId } });
  ok(odebr.status === 200, 'přítel se odebere, dostal ' + odebr.status);
  ok(!(await api('/api/friends', { token: A.token })).body.friends.some(f => f.nick === nickB),
     'a v mém seznamu už není');
  ok(!(await api('/api/friends', { token: B.token })).body.friends.some(f => f.nick === nickA),
     'zmizelo i v seznamu druhé strany');

  // Odveta NESMÍ soupeři odepsat otázky, které nikdy neuvidí. Do 2026-09-01 mu
  // markSeen běžel rovnou při založení a bez limitu na počet odvet, takže mu šlo
  // ve smyčce vyprázdnit fond, dokud mu každá další hra nespadla na 503.
  const seenPredOdvetou = (await api('/api/me', { token: B.token })).body.seen_questions;
  const zkusebniOdveta = await api(`/api/game/${duel.body.id}/rematch`, { method: 'POST', token: A.token });
  ok(zkusebniOdveta.status === 201, 'odveta se založí (kontrola markSeen)');
  const seenPoOdvete = (await api('/api/me', { token: B.token })).body.seen_questions;
  ok(seenPoOdvete === seenPredOdvetou,
     'soupeři odveta neubrala otázky z fondu (' + seenPredOdvetou + ' → ' + seenPoOdvete + ')');
  // Až když si otázku vyžádá, počítá se mu za viděnou.
  await api(`/api/game/${zkusebniOdveta.body.id}/q/0`, { token: B.token });
  ok((await api('/api/me', { token: B.token })).body.seen_questions === seenPredOdvetou + 1,
     'ale po vyžádání otázky ano');

  const rematch = await api(`/api/game/${duel.body.id}/rematch`, { method: 'POST', token: A.token });
  ok(rematch.status === 201, 'odveta se založí', JSON.stringify(rematch.body));
  const rq = await api(`/api/game/${rematch.body.id}/q/0`, { token: B.token });
  ok(rq.status === 200, 'soupeř je v odvetě rovnou, nemusí se připojovat');

  const botRematch = await api(`/api/game/${vsBot.body.id}/rematch`, { method: 'POST', token: A.token });
  ok(botRematch.status === 201 && typeof botRematch.body.bot_score === 'number',
     'odveta proti botovi se rovnou odehraje (bot dal ' + botRematch.body.bot_score + ')');
  ok(botRematch.body.rated === false, 'odveta proti botovi zůstává nehodnocená');

  // ------------------------------------------------------------ kalibrace bota
  // Bot se kalibruje, teprve když je soupeř sám usazený (RD < 150), což nastane
  // až po ~8 hodnocených hrách. Kratší test by tuhle větev vůbec nespustil.
  section('Kalibrace bota na fond');
  const E1 = (await api('/api/auth/register', {
    method: 'POST', body: { band: 'starsi', nick: 'Kal_' + uniq(), pin: '3333' } })).body;
  const E2 = (await api('/api/auth/register', {
    method: 'POST', body: { band: 'starsi', nick: 'Kal_' + uniq(), pin: '4444' } })).body;

  for (let i = 0; i < 10; i++) {
    const g = await api('/api/game', {
      method: 'POST', token: E1.token, body: { mode: 'odkaz', time_control: 'blesk' } });
    await api(`/api/game/${g.body.id}/join`, { method: 'POST', token: E2.token });
    await playAll(E1.token, g.body.id, g.body.total, 1000 + i * 300);
    await playAll(E2.token, g.body.id, g.body.total, 4000);
  }
  const settled = (await api('/api/me', { token: E1.token }))
    .body.ratings.find(r => r.band === 'starsi');
  ok(settled.games === 10, 'odehráno 10 hodnocených her');

  const rd = (await api('/api/me', { token: E1.token }))
    .body.ratings.find(r => r.band === 'starsi').rd;
  ok(rd < 350, 'RD se usadilo pod startovní hodnotu (rd=' + Math.round(rd) + ')');

  // Nový hráč bota nepohne vůbec — jeho vlastní rating je zatím jen dohad.
  const rookie = (await api('/api/auth/register', {
    method: 'POST', body: { band: 'starsi', nick: 'Novy_' + uniq(), pin: '5555' } })).body;
  const rg = await api('/api/game', {
    method: 'POST', token: rookie.token, body: { mode: 'odkaz', time_control: 'blesk' } });
  const rBot = await api(`/api/game/${rg.body.id}/bot`, { method: 'POST', token: rookie.token });
  const rBefore = rBot.body.bot.strength;
  await playAll(rookie.token, rg.body.id, rg.body.total, 1000);
  const rg2 = await api('/api/game', {
    method: 'POST', token: rookie.token, body: { mode: 'odkaz', time_control: 'blesk' } });
  const rBot2 = await api(`/api/game/${rg2.body.id}/bot`, { method: 'POST', token: rookie.token });
  ok(rBot2.body.bot.strength === rBefore,
     'úplně nový hráč silou bota nehne (' + rBefore + ')');

  // Usazený hráč ano.
  //
  // Síla se sleduje PODLE KONKRÉTNÍHO BOTA, ne podle toho, koho zrovna vrátí párování.
  // Původní verze si zapamatovala prvního bota a na konci trvala na tom, že přijde
  // zase on — jenže bot se vybírá podle ratingu hráče a ten se během těch her hýbe,
  // takže výběr občas přeskočil na souseda a test spadl, i když kalibrace fungovala.
  // Nedeterminismus jde až k losu otázek: `playAll` odpovídá vždy A, takže skóre
  // (a tím rating) závisí na tom, kde v zamíchaném pořadí správná odpověď leží.
  const sily = {};   // přezdívka bota → { prvni, posledni, her }
  for (let i = 0; i < 4; i++) {
    const g = await api('/api/game', {
      method: 'POST', token: E1.token, body: { mode: 'odkaz', time_control: 'blesk' } });
    const b = await api(`/api/game/${g.body.id}/bot`, { method: 'POST', token: E1.token });
    const nick = b.body.bot.nick, s = b.body.bot.strength;
    if (!sily[nick]) sily[nick] = { prvni: s, posledni: s, her: 0 };
    sily[nick].posledni = s;
    sily[nick].her++;
    await playAll(E1.token, g.body.id, g.body.total, 1000);
  }
  // Bota, proti kterému se hrálo víckrát, jsme viděli před kalibrací i po ní.
  const opakovany = Object.entries(sily).find(([, v]) => v.her >= 2);
  ok(!!opakovany, 'aspoň jeden bot nastoupil opakovaně (' + Object.keys(sily).join(', ') + ')');
  if (opakovany) {
    const [nick, v] = opakovany;
    ok(v.posledni !== v.prvni,
       'usazený hráč silou bota pohnul: ' + nick + ' (' + v.prvni + ' → ' + v.posledni + ')');
  }

  // ---------------------------------------------------------------- turnaj (aréna)
  section('Turnaj (aréna)');
  const F = (await api('/api/auth/register', {
    method: 'POST', body: { band: 'dospeli', nick: 'TurF_' + uniq(), pin: '1234' } })).body;
  const G = (await api('/api/auth/register', {
    method: 'POST', body: { band: 'dospeli', nick: 'TurG_' + uniq(), pin: '5678' } })).body;
  const kidT = (await api('/api/auth/register', { method: 'POST', body: { band: 'deti', pin: '4321' } })).body;

  const badDur = await api('/api/tournament', {
    method: 'POST', token: F.token, body: { time_control: 'blesk', duration_min: 999 } });
  ok(badDur.status === 400, 'moc dlouhý turnaj se odmítne, dostal ' + badDur.status);

  const badTc = await api('/api/tournament', {
    method: 'POST', token: F.token, body: { time_control: 'maraton' } });
  ok(badTc.status === 400, 'neznámá časová kontrola se odmítne, dostal ' + badTc.status);

  const tour = await api('/api/tournament', {
    method: 'POST', token: F.token, body: { time_control: 'blesk', duration_min: 15 } });
  ok(tour.status === 201 && tour.body.status === 'bezi', 'turnaj se založí a rovnou běží');

  const detail0 = await api(`/api/tournament/${tour.body.id}`, { token: F.token });
  ok(detail0.body.joined === true, 'zakladatel je rovnou účastníkem');
  ok(detail0.body.standings.length === 1, 'v žebříčku je zatím jen zakladatel');

  const list = await api('/api/tournament?band=dospeli', { token: F.token });
  ok(list.body.tournaments.some(t => t.id === tour.body.id), 'turnaj je vidět v seznamu pásma');

  const wrongBand = await api(`/api/tournament/${tour.body.id}/join`, { method: 'POST', token: kidT.token });
  ok(wrongBand.status === 409, 'jiné pásmo se do turnaje nepřidá, dostal ' + wrongBand.status);

  const joinG = await api(`/api/tournament/${tour.body.id}/join`, { method: 'POST', token: G.token });
  ok(joinG.status === 200, 'druhý hráč se přidá');

  const future = await api('/api/tournament', {
    method: 'POST', token: F.token, body: { time_control: 'blesk', starts_in_min: 30 } });
  ok(future.body.status === 'planovany', 'turnaj se startem v budoucnu je zatím jen naplánovaný');
  const tooEarly = await api(`/api/tournament/${future.body.id}/play`, { method: 'POST', token: F.token });
  ok(tooEarly.status === 409, 'kolo před startem se nezahraje, dostal ' + tooEarly.status);

  // bot kolo — okamžitě odehrané, nehodnocené, ale počítá se do žebříčku turnaje
  const tbot = await api(`/api/tournament/${tour.body.id}/bot`, { method: 'POST', token: F.token });
  ok(tbot.status === 200 && typeof tbot.body.bot_score === 'number',
     'kolo proti botovi se rovnou odehraje (bot dal ' + tbot.body.bot_score + ')');
  await playAll(F.token, tbot.body.game_id, tbot.body.total, 2000);

  const afterBot = await api(`/api/tournament/${tour.body.id}`, { token: F.token });
  ok(afterBot.body.me.games_played === 1 && afterBot.body.me.score > 0,
     'body z kola proti botovi se přičetly do žebříčku turnaje (' + afterBot.body.me.score + ')');

  const fRatingAfterBot = (await api('/api/me', { token: F.token }))
    .body.ratings.find(r => r.band === 'dospeli');
  ok(!fRatingAfterBot || fRatingAfterBot.games === 0,
     'kolo turnaje proti botovi nehne Glicko ratingem');

  // živé párování uvnitř turnaje — první čeká, druhý ho spáruje
  const waitF = await api(`/api/tournament/${tour.body.id}/play`, { method: 'POST', token: F.token });
  ok(waitF.body.matched === false && waitF.body.waiting === true, 'první hráč čeká na kolo turnaje');

  const matchG = await api(`/api/tournament/${tour.body.id}/play`, { method: 'POST', token: G.token });
  ok(matchG.body.matched === true, 'druhý hráč se spáruje na kolo turnaje', JSON.stringify(matchG.body));

  const pollF = await api(`/api/tournament/${tour.body.id}/play`, { token: F.token });
  ok(pollF.body.matched === true && pollF.body.game_id === matchG.body.game_id,
     'čekající hráč se o spárování na kolo dozví při dotazu');

  await playAll(F.token, matchG.body.game_id, matchG.body.total, 1500);
  await playAll(G.token, matchG.body.game_id, matchG.body.total, 4000);

  const finalStand = await api(`/api/tournament/${tour.body.id}`, { token: F.token });
  const fRow = finalStand.body.standings.find(s => s.nick === F.nick);
  ok(fRow && fRow.games_played === 2, 'druhé kolo se přičetlo k prvnímu, ne přepsalo (' + fRow?.games_played + ')');
  ok(finalStand.body.standings[0].score >= finalStand.body.standings[1].score,
     'žebříček turnaje je seřazený podle bodů sestupně');

  // ---------------------------------------------------------------- e-mail a obnova PINu
  section('Nepovinný e-mail a obnova PINu');

  const M = (await api('/api/auth/register', { method: 'POST',
    body: { nick: 'Mail_' + uniq(), pin: '1234', band: 'dospeli' } })).body;

  const me0 = await api('/api/me', { token: M.token });
  ok(me0.body.email === null, 'nový účet e-mail nemá');

  // E-mail jde od 2026-08-31 zadat rovnou při registraci. Zůstává NEPOVINNÝ, takže
  // se hlídají obě strany: že vyplněný projde a uloží se, i že bez něj účet vznikne.
  const RegMail = await api('/api/auth/register', { method: 'POST',
    body: { nick: 'RegMail_' + uniq(), pin: '1234', band: 'dospeli', email: '  Rodic@Example.COM ' } });
  ok(RegMail.status === 201, 'registrace s e-mailem projde, dostal ' + RegMail.status);
  const meReg = await api('/api/me', { token: RegMail.body.token });
  ok(meReg.body.email === 'ro***@example.com',
     'e-mail z registrace se uloží zbavený mezer a malými písmeny: ' + meReg.body.email);

  const RegSpatny = await api('/api/auth/register', { method: 'POST',
    body: { nick: 'RegBad_' + uniq(), pin: '1234', band: 'dospeli', email: 'tohle-neni-mail' } });
  ok(RegSpatny.status === 400, 'nesmyslný e-mail registraci odmítne, dostal ' + RegSpatny.status);

  // Prázdný řetězec musí projít stejně jako chybějící klíč — formulář ho tak posílá,
  // když hráč pole nechá být, a odmítnutí by z nepovinného pole udělalo povinné.
  const RegPrazdny = await api('/api/auth/register', { method: 'POST',
    body: { nick: 'RegEmpty_' + uniq(), pin: '1234', band: 'dospeli', email: '' } });
  ok(RegPrazdny.status === 201, 'prázdný e-mail registraci nezablokuje, dostal ' + RegPrazdny.status);
  ok((await api('/api/me', { token: RegPrazdny.body.token })).body.email === null,
     'účet založený s prázdným e-mailem ho v /me nemá');

  const spatnyPin = await api('/api/auth/email', { method: 'PUT', token: M.token,
    body: { email: 'rodic@example.com', pin: '0000' } });
  ok(spatnyPin.status === 401, 'e-mail nejde nastavit bez správného PINu, dostal ' + spatnyPin.status);

  const nesmysl = await api('/api/auth/email', { method: 'PUT', token: M.token,
    body: { email: 'tohle-neni-email', pin: '1234' } });
  ok(nesmysl.status === 400, 'neplatný e-mail se odmítne, dostal ' + nesmysl.status);

  const nastav = await api('/api/auth/email', { method: 'PUT', token: M.token,
    body: { email: '  Rodic@Example.COM ', pin: '1234' } });
  ok(nastav.status === 200 && nastav.body.email === 'rodic@example.com',
     'e-mail se uloží zbavený mezer a malými písmeny');

  const me1 = await api('/api/me', { token: M.token });
  ok(me1.body.email === 'ro***@example.com', 'e-mail se vrací maskovaný: ' + me1.body.email);

  const zadostA = await api('/api/auth/reset', { method: 'POST', body: { nick: M.nick } });
  const zadostB = await api('/api/auth/reset', { method: 'POST', body: { nick: 'NeexistujeXyz' } });
  ok(zadostA.status === 200 && zadostB.status === 200 &&
     JSON.stringify(zadostA.body) === JSON.stringify(zadostB.body),
     'obnova neprozradí, jestli účet existuje');

  ok(!JSON.stringify(zadostA.body).includes('obnova='),
     'odpověď neobsahuje resetovací odkaz — ten jde jen mailem');

  const spatnyToken = await api('/api/auth/reset/confirm', { method: 'POST',
    body: { token: 'vymysleny-token', pin: '5555' } });
  ok(spatnyToken.status === 400, 'vymyšlený token neprojde, dostal ' + spatnyToken.status);

  const poDele = await api('/api/auth/email', { method: 'DELETE', token: M.token,
    body: { pin: '1234' } });
  ok(poDele.status === 200 && poDele.body.email === null, 'e-mail jde smazat');

  const me2 = await api('/api/me', { token: M.token });
  ok(me2.body.email === null, 'po smazání /me hlásí, že e-mail není');

  // ---------------------------------------------------------------- pásmo
  section('Pásmo je vlastnost účtu, ne požadavku');

  const P = (await api('/api/auth/register', { method: 'POST',
    body: { nick: 'Band_' + uniq(), pin: '1234', band: 'dospeli' } })).body;

  // Do 2026-08-31 se pásmo bralo jako `body.band || me.band` a kontrolovalo se jen
  // členství v BANDS. Dospělý účet si tak mohl založit HODNOCENÝ souboj na odkaz
  // v dětském pásmu, dítě se k němu smělo připojit (join.js porovnává jen s
  // game.band) a settle.js dospělého zapsal do dětského ratingu.
  const podvrh = await api('/api/game', { method: 'POST', token: P.token,
    body: { mode: 'odkaz', time_control: 'blesk', band: 'deti' } });
  ok(podvrh.status === 201 && podvrh.body.band === 'dospeli',
     'pásmo z těla požadavku se ignoruje, hra je v pásmu účtu: ' + podvrh.body.band);

  // Totéž u denní pětky, kde se pásmo bralo z ?band= — nehodnocená je, ale zapisovala
  // se do denního žebříčku cizího pásma.
  const dailyCizi = await api('/api/daily?band=deti', { token: P.token });
  ok(dailyCizi.body.band === 'dospeli',
     'denní pětka ignoruje ?band= a dá pásmo účtu: ' + dailyCizi.body.band);

  // Dětské pásmo veřejný žebříček nemá: pásmo je nutně jen čestné prohlášení,
  // takže by na předních příčkách mohl sedět kdokoli.
  const zebDeti = await api('/api/leaderboard?band=deti', { token: P.token });
  ok(zebDeti.status === 200 && zebDeti.body.closed === true && zebDeti.body.rows.length === 0,
     'dětský žebříček je uzavřený');
  // A hlavně i DENNÍ. Do 2026-09-01 se větev `daily` vyhodnotila DŘÍV než tahle
  // kontrola, takže `?daily=1&band=deti` vydal přezdívku, skóre i přesný čas
  // dohrání — tedy denní rytmus konkrétního dítěte, a to bez jakéhokoli tokenu.
  const zebDetiDenni = await api('/api/leaderboard?band=deti&daily=1', { token: P.token });
  ok(zebDetiDenni.status === 200 && zebDetiDenni.body.closed === true
     && zebDetiDenni.body.rows.length === 0,
     'dětský DENNÍ žebříček je uzavřený taky');
  const zebDosp = await api('/api/leaderboard?band=dospeli', { token: P.token });
  ok(zebDosp.status === 200 && !zebDosp.body.closed,
     'žebříček ostatních pásem se vrací dál');

  const zmenaSpatna = await api('/api/auth/band', { method: 'PUT', token: P.token,
    body: { band: 'nesmysl' } });
  ok(zmenaSpatna.status === 400, 'neznámé pásmo se odmítne, dostal ' + zmenaSpatna.status);

  const stejne = await api('/api/auth/band', { method: 'PUT', token: P.token,
    body: { band: 'dospeli' } });
  ok(stejne.status === 200 && stejne.body.changed === false,
     'změna na totéž pásmo nic nemění');

  // Přechod DO dětského pásma musí přezdívku vygenerovat znovu — jinak by stačilo
  // přijít s libovolným textem z jiného pásma a ochrana dětského prostoru (žádný
  // volný text, žádná moderace) by nebyla k ničemu.
  const nickPred = P.nick;
  const doDeti = await api('/api/auth/band', { method: 'PUT', token: P.token,
    body: { band: 'deti' } });
  ok(doDeti.status === 200 && doDeti.body.band === 'deti' && doDeti.body.changed === true,
     'pásmo jde po registraci změnit');
  ok(doDeti.body.nick !== nickPred,
     'přechod do dětského pásma přezdívku přepíše: ' + doDeti.body.nick);
  ok((await api('/api/me', { token: P.token })).body.band === 'deti',
     '/me hlásí nové pásmo');

  // Fond otázek se musí přepnout s ním, jinak by změna byla jen kosmetická.
  const poZmene = await api('/api/game', { method: 'POST', token: P.token,
    body: { mode: 'solo', time_control: 'blesk' } });
  ok(poZmene.status === 201 && poZmene.body.band === 'deti',
     'nová hra se losuje z nového pásma');

  console.log('\n' + (fail ? 'NEPROŠLO: ' + fail + ' chyb, ' + pass + ' v pořádku'
                           : 'VŠE V POŘÁDKU: ' + pass + ' kontrol'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('\nTest spadl:', e.stack); process.exit(1); });
