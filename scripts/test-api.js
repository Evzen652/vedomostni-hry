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

  const ratingBefore = (await api('/api/me', { token: A.token }))
    .body.ratings.find(r => r.band === 'dospeli').rating;
  await playAll(B.token, duel.body.id, duel.body.total, 4000);

  const after = await api(`/api/game/${duel.body.id}`, { token: A.token });
  ok(after.body.players.every(p => p.score !== null), 'po dohrání obou se skóre odkryje');
  ok(['vyhra', 'prohra', 'remiza'].includes(after.body.result),
     'souboj má výsledek: ' + after.body.result);
  ok(after.body.review?.[0]?.opponent !== undefined, 'rozbor ukazuje i soupeřův tip');

  const ratingAfter = (await api('/api/me', { token: A.token }))
    .body.ratings.find(r => r.band === 'dospeli').rating;
  ok(ratingAfter !== ratingBefore,
     'hodnocený souboj hnul ratingem (' + ratingBefore + ' → ' + ratingAfter + ')');

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

  const dBoard = await api('/api/leaderboard?band=dospeli&daily=1');
  ok(dBoard.body.rows?.length >= 1, 'žebříček dne má aspoň jeden zápis');

  // ------------------------------------------------------------ žebříček
  section('Žebříček');
  const board = await api('/api/leaderboard?band=dospeli');
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
  let strengthBefore = null, botNick = null, strengthAfter = null;
  for (let i = 0; i < 3; i++) {
    const g = await api('/api/game', {
      method: 'POST', token: E1.token, body: { mode: 'odkaz', time_control: 'blesk' } });
    const b = await api(`/api/game/${g.body.id}/bot`, { method: 'POST', token: E1.token });
    if (strengthBefore === null) { strengthBefore = b.body.bot.strength; botNick = b.body.bot.nick; }
    strengthAfter = b.body.bot.strength;
    await playAll(E1.token, g.body.id, g.body.total, 1000);
  }
  const finalBot = await api('/api/game', {
    method: 'POST', token: E1.token, body: { mode: 'odkaz', time_control: 'blesk' } });
  const fb = await api(`/api/game/${finalBot.body.id}/bot`, { method: 'POST', token: E1.token });
  ok(fb.body.bot.nick === botNick, 'pořád stejný bot: ' + botNick);
  ok(fb.body.bot.strength !== strengthBefore,
     'usazený hráč silou bota pohnul (' + strengthBefore + ' → ' + fb.body.bot.strength + ')');

  console.log('\n' + (fail ? 'NEPROŠLO: ' + fail + ' chyb, ' + pass + ' v pořádku'
                           : 'VŠE V POŘÁDKU: ' + pass + ' kontrol'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('\nTest spadl:', e.stack); process.exit(1); });
