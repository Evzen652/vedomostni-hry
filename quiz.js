/* Vědomostní hra — samostatná appka (hra.html).
   Nesahá na glóbus/mapy; sdílí s ním jen data přes localStorage (progres → rozsvícení zemí).
   Čte data/questions/ru.json, data/cards/ru.json, data/fondy.json. */
(function(){
  const root = document.getElementById("quiz-root");
  const body = document.getElementById("qz-body");
  const closeBtn = document.getElementById("qz-close");
  const hostBubble = document.getElementById("qz-host-bubble");
  const hostAv = document.getElementById("qz-host-av");
  const HOST_NAME = "Průvodce";   // konfigurovatelné jméno hostitele
  let FLAG = "🇷🇺", COUNTRY = "Rusko";   // aktuálně vybraná země (mění se výběrem)
  const GLOBE_URL = "landing.html";   // úvodní stránka hry (hra je zcela oddělená od glóbu)

  // ilustrace režimů (malovaný styl, sladěné s paletou appky)
  const ICO_SOLO = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
    <circle cx="32" cy="32" r="27" fill="#fdf7ea" stroke="#d9a441" stroke-width="4"/>
    <circle cx="32" cy="32" r="20" stroke="#e7d4ab" stroke-width="1.5"/>
    <path d="M32 12 L37 32 L27 32 Z" fill="#e2725b"/>
    <path d="M32 52 L37 32 L27 32 Z" fill="#2a7f7f"/>
    <circle cx="32" cy="32" r="3.4" fill="#fffaf0" stroke="#d9a441" stroke-width="1.5"/>
    <circle cx="32" cy="9" r="2" fill="#e2725b"/></svg>`;
  const ICO_PARTY = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="11" width="5" height="5" rx="1.4" fill="#7ba05b" transform="rotate(18 11.5 13.5)"/>
    <circle cx="53" cy="13" r="2.4" fill="#8a6fae"/>
    <rect x="50" y="44" width="4.6" height="4.6" rx="1.3" fill="#d9a441" transform="rotate(-15 52 46)"/>
    <circle cx="19" cy="27" r="7.5" fill="#2a7f7f"/>
    <path d="M7 51 C7 40 15 37 19 37 C23 37 31 40 31 51 Z" fill="#2a7f7f"/>
    <circle cx="45" cy="27" r="7.5" fill="#d9a441"/>
    <path d="M33 51 C33 40 41 37 45 37 C49 37 57 40 57 51 Z" fill="#d9a441"/>
    <circle cx="32" cy="29" r="9.5" fill="#e2725b"/>
    <path d="M16 54 C16 41 24 38 32 38 C40 38 48 41 48 54 Z" fill="#e2725b"/>
    <circle cx="28.5" cy="28" r="1.6" fill="#fffaf0"/><circle cx="35.5" cy="28" r="1.6" fill="#fffaf0"/>
    <path d="M28 33 Q32 36 36 33" stroke="#fffaf0" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>`;
  const ICO_SCHOOL = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <line x1="17" y1="45" x2="12" y2="57" stroke="#b98b3e" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="47" y1="45" x2="52" y2="57" stroke="#b98b3e" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="9" y="11" width="46" height="35" rx="3.5" fill="#2f6d5f" stroke="#d9a441" stroke-width="3"/>
    <circle cx="27" cy="28" r="9" fill="none" stroke="#fdf7ea" stroke-width="1.7"/>
    <path d="M18 28 H36" stroke="#fdf7ea" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M27 19 C21 23 21 33 27 37 C33 33 33 23 27 19 Z" fill="none" stroke="#fdf7ea" stroke-width="1.3"/>
    <line x1="39" y1="39" x2="49" y2="21" stroke="#efe1c3" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="8" y="45" width="48" height="3.4" rx="1.7" fill="#d9a441"/></svg>`;

  // --- malé ikonky HUD (jednotné s paletou; velikost 1em, inline; žádné emoji) ---
  const _sw = 'style="width:1em;height:1em;vertical-align:-0.14em;flex:none;display:inline-block"';
  const ICO_STAR  = `<svg ${_sw} viewBox="0 0 24 24"><path fill="#d9a441" stroke="#b98b3e" stroke-width="1" stroke-linejoin="round" d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 22l-5.3 2.8 1.1-5.9L3.5 15l5.9-.8z"/></svg>`;
  const ICO_CLOCK = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" fill="#fdf7ea" stroke="#e2725b" stroke-width="2"/><path d="M12 9v4l3 2" stroke="#e2725b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 3h6" stroke="#e2725b" stroke-width="2" stroke-linecap="round"/></svg>`;
  const ICO_BOLT  = `<svg ${_sw} viewBox="0 0 24 24"><path fill="#8a6fae" d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>`;
  const ICO_SND   = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#3d3229"/><path d="M16 9c1.6 1.5 1.6 4.5 0 6M18.7 6.5c3 3 3 8 0 11" stroke="#3d3229" stroke-width="2" stroke-linecap="round"/></svg>`;
  const ICO_SNDX  = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#3d3229"/><path d="M17 10l5 4M22 10l-5 4" stroke="#3d3229" stroke-width="2" stroke-linecap="round"/></svg>`;
  const ICO_GLOBE = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#2a7f7f"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="#fdf7ea" stroke-width="1.3"/></svg>`;
  const ICO_SPARK = `<svg ${_sw} viewBox="0 0 24 24"><path fill="#d9a441" d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>`;
  const ICO_TROPHY= `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M7 4h10v4a5 5 0 01-10 0V4z" fill="#d9a441" stroke="#b98b3e" stroke-width="1.4"/><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3" stroke="#b98b3e" stroke-width="1.5"/><path d="M12 13v3M9.5 20h5M10.5 20l.4-4h2.2l.4 4" stroke="#b98b3e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICO_BRUSH = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M14 4l6 6-8 8-4 1 1-4z" fill="#e2725b" stroke="#b1543f" stroke-width="1.2" stroke-linejoin="round"/><path d="M4 20c2-4 5-4 6-3s1 4-3 6c-2 .6-3-1-3-3z" fill="#d9a441" stroke="#b98b3e" stroke-width="1.2"/></svg>`;
  const ICO_FOLDER= `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M3 6h6l2 2h10v11H3z" fill="#d9a441" stroke="#b98b3e" stroke-width="1.4" stroke-linejoin="round"/><path d="M3 10h18" stroke="#b98b3e" stroke-width="1.2"/></svg>`;
  const ICO_LINK  = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M9 15l6-6M8 12l-2 2a3.5 3.5 0 005 5l2-2M16 12l2-2a3.5 3.5 0 00-5-5l-2 2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICO_BOOK  = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M4 5c3-1.2 6-1.2 8 0v15c-2-1.2-5-1.2-8 0zM20 5c-3-1.2-6-1.2-8 0v15c2-1.2 5-1.2 8 0z" fill="#fdf7ea" stroke="#2a7f7f" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const _MEDALCOL = ["#d9a441","#b9b3a6","#c08457"];
  function medalSvg(i){ const c=_MEDALCOL[i]; if(!c) return (i+1)+"."; return `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M8 3l3 6M16 3l-3 6" stroke="#e2725b" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15" r="6.2" fill="${c}" stroke="#00000022" stroke-width="1"/><circle cx="12" cy="15" r="3" fill="#ffffff40"/></svg>`; }
  function arrowSvg(deg){ return `<svg style="width:1em;height:1em;vertical-align:-0.14em;display:inline-block;transform:rotate(${deg}deg)" viewBox="0 0 24 24" fill="none"><path d="M12 5v13M6 12l6 6 6-6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  function handArrowSvg(flip){ return `<svg style="width:1.5em;height:.95em;vertical-align:-.15em;display:inline-block${flip?";transform:scaleX(-1)":""}" viewBox="0 0 40 24" fill="none"><path d="M2.5 13c9-3.4 21-2.6 29-2" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M23.5 4.5c3.5 2.4 6.7 4.4 10 6.4-3.4 2.2-7 4-10.8 6.4" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  function checkSvg(){ return `<svg viewBox="0 0 40 32" fill="none"><path d="M4 17c3 3.5 6 7.5 9.5 9.5C19.5 20 25 13.5 35 5" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  function flagStamp(cc, cls){ return `<img class="${cls||"qz-stamp"}" src="assets/country-${cc}.jpg" alt="" onerror="this.style.display='none'">`; }

  let data = null, csVoice = null;
  const COLORS = ["#e2725b","#2a7f7f","#d9a441","#8a6fae","#7ba05b","#4e9e6f"];
  const SIDES = [{k:"dole",deg:0},{k:"nahoře",deg:180},{k:"vlevo",deg:90},{k:"vpravo",deg:270}];
  const S = { mode:"solo", order:[], idx:0, band:"dospeli", kidsMax:2, answered:false,
              players:[], turn:0, round:1, totalRounds:5, qServed:0,
              voice:false, steal:false, rotate:"auto", manualRot:null,
              school:false, timer:0, saveId:null };

  const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const fmt = n => (typeof n==="number" ? n.toLocaleString("cs") : n);
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const pick = a => Array.isArray(a) ? a[Math.floor(Math.random()*a.length)] : a;
  function resolveQuip(quip, band){ if(quip==null) return null; if(typeof quip==="string") return quip; return quip[band] ?? quip.default ?? Object.values(quip)[0]; }
  function say(t){ hostBubble.textContent = t||""; hostBubble.style.display = t ? "" : "none"; }

  // aktivní hráč / pásmo (v sólu jediný „hráč")
  function cur(){ return S.players[S.turn] || {name:"Ty", band:S.band, color:COLORS[0], score:0, streak:0, side:"dole"}; }
  function bandOf(){ return S.mode==="party" ? cur().band : S.band; }
  function qCurrent(){ return S.mode==="party" ? S.order[S.qServed % S.order.length] : S.order[S.idx]; }
  function ageBand(age){ const a=parseInt(age,10); return (!isNaN(a) && a<15) ? "deti" : "dospeli"; }

  // ---- progres / mastery (sdílený s glóbem přes localStorage) ----
  const PROGRESS_KEY = "hricka_progress";
  const MASTERY_THRESHOLD = 5;
  const COUNTRY_BY_CC = { ru:"Rusko", pl:"Polsko", sk:"Slovensko" };
  const COUNTRY_FLAG  = { ru:"🇷🇺", pl:"🇵🇱", sk:"🇸🇰" };
  const COUNTRY_CONT  = { ru:"asia", pl:"europe", sk:"europe" };   // kontinent země
  // kontinenty jako u glóbu (i ty bez otázek — zobrazí se jako „Brzy")
  const CONTINENTS = [
    { id:"europe",     name:"Evropa",          emoji:"🏰" },
    { id:"asia",       name:"Asie",            emoji:"🐫" },
    { id:"africa",     name:"Afrika",          emoji:"🦁" },
    { id:"namerica",   name:"Severní Amerika", emoji:"🗽" },
    { id:"samerica",   name:"Jižní Amerika",   emoji:"🌴" },
    { id:"oceania",    name:"Oceánie",         emoji:"🐨" },
    { id:"antarctica", name:"Antarktida",      emoji:"🐧" },
  ];
  // sekce („specifikace") — pořadí a ikony jako u karet na glóbu
  const SECTION_ORDER = ["Místa","Příroda","Lidé","Kultura & tradice","Umění","Sport","Jazyk & slova","Jídlo","Historie"];
  const SECTION_EMOJI = { "Místa":"📍","Příroda":"🌿","Lidé":"👥","Kultura & tradice":"🎭","Umění":"🎨","Sport":"🏆","Jazyk & slova":"🔤","Jídlo":"🍽️","Historie":"🏛️" };
  // slugy pro ilustrace (assets/section-{slug}.jpg) — obrázek nahradí emoji, jakmile existuje
  const SECTION_SLUG = { "Místa":"mista","Příroda":"priroda","Lidé":"lide","Kultura & tradice":"kultura","Umění":"umeni","Sport":"sport","Jazyk & slova":"jazyk","Jídlo":"jidlo","Historie":"historie" };
  let sessionMastered = [];
  function loadProg(){ try { const p=JSON.parse(localStorage.getItem(PROGRESS_KEY)||"{}"); return { correct:p.correct||{}, mastered:p.mastered||{} }; } catch(e){ return { correct:{}, mastered:{} }; } }
  function saveProg(p){ try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch(e){} }
  function recordCorrect(cc){
    if(!cc) return false;
    const p=loadProg(); p.correct[cc]=(p.correct[cc]||0)+1;
    let newly=false;
    if(!p.mastered[cc] && p.correct[cc]>=MASTERY_THRESHOLD){ p.mastered[cc]=true; newly=true; if(sessionMastered.indexOf(cc)<0) sessionMastered.push(cc); }
    saveProg(p);
    if(newly && window.HrickaGlobe){ try { window.HrickaGlobe.refresh(); } catch(e){} }
    return newly;
  }

  // ---- autosave / rozehrané výpravy / wake lock / časomíra (Život u stolu) ----
  const SAVES_KEY = "hricka_quiz_saves";
  let wakeLock = null, timerHandle = null;
  function loadSaves(){ try { return JSON.parse(localStorage.getItem(SAVES_KEY)||"{}"); } catch(e){ return {}; } }
  function writeSaves(o){ try { localStorage.setItem(SAVES_KEY, JSON.stringify(o)); } catch(e){} }
  function serializeState(){
    return { mode:S.mode, school:!!S.school, band:S.band, cc:(S.sel&&S.sel.cc)||"ru", section:(S.sel&&S.sel.section)||null,
      orderIds:S.order.map(q=>q.id), idx:S.idx, qServed:S.qServed,
      turn:S.turn, round:S.round, totalRounds:S.totalRounds, voice:S.voice, steal:S.steal, rotate:S.rotate, timer:S.timer||0,
      players:S.players.map(p=>({ name:p.name, band:p.band, color:p.color, side:p.side, score:p.score, streak:p.streak, age:p.age })),
      sessionMastered:sessionMastered.slice() };
  }
  function autosave(){
    if(!S.saveId) return;
    const saves=loadSaves(), st=serializeState();
    saves[S.saveId] = { ts:Date.now(), meta:{ mode:st.mode, school:st.school, cc:st.cc, section:st.section, players:st.players.map(p=>({name:p.name,color:p.color})),
      round:st.round, totalRounds:st.totalRounds, idx:st.idx, served:st.qServed, count:st.orderIds.length }, state:st };
    writeSaves(saves);
  }
  function clearSave(){ if(S.saveId){ const s=loadSaves(); delete s[S.saveId]; writeSaves(s); } S.saveId=null; }
  function newSave(){ S.saveId = "g"+Date.now()+"_"+Math.floor(Math.random()*1e4); }
  async function resumeSave(id){
    const rec=loadSaves()[id]; if(!rec || !data) return;
    const st=rec.state;
    const cc=st.cc||"ru";
    S.sel={ cc, cont:COUNTRY_CONT[cc]||"asia", section:st.section||null };
    COUNTRY=COUNTRY_BY_CC[cc]||cc.toUpperCase(); FLAG=COUNTRY_FLAG[cc]||"🏳️";
    await loadCardsFor(cc); applyPool();
    S.mode=st.mode; S.school=!!st.school; S.band=st.band||"dospeli";
    S.order=(st.orderIds||[]).map(qid=>data.questions.find(q=>q.id===qid)).filter(Boolean);
    if(!S.order.length) S.order=shuffle(data.questions);
    S.idx=st.idx||0; S.qServed=st.qServed||0; S.turn=st.turn||0; S.round=st.round||1; S.totalRounds=st.totalRounds||5;
    S.voice=!!st.voice; S.steal=!!st.steal; S.rotate=st.rotate||"auto"; S.timer=st.timer||0; S.manualRot=null;
    S.players=(st.players||[]).map(p=>({...p})); if(!S.players.length) S.players=[{name:"Ty",band:S.band,color:COLORS[0],score:0,streak:0,side:"dole"}];
    sessionMastered=(st.sessionMastered||[]).slice(); S.saveId=id;
    const shell=document.getElementById("qz-shell"); shell.classList.toggle("qz-school", S.school); shell.style.transform="";
    requestWake(); if(S.mode==="party") applyRotation();
    renderQuestion();
  }
  // Screen Wake Lock — ať tablet neusíná uprostřed otázky
  async function requestWake(){ try { if("wakeLock" in navigator && !wakeLock){ wakeLock=await navigator.wakeLock.request("screen"); if(wakeLock && wakeLock.addEventListener) wakeLock.addEventListener("release", ()=>{ wakeLock=null; }); } } catch(e){} }
  function releaseWake(){ try { if(wakeLock){ wakeLock.release(); wakeLock=null; } } catch(e){} }
  document.addEventListener("visibilitychange", () => { if(document.visibilityState==="visible" && !root.classList.contains("qz-hidden")) requestWake(); });
  // časomíra (volitelná)
  function clearTimer(){ if(timerHandle){ clearInterval(timerHandle); timerHandle=null; } const bar=document.getElementById("qz-timerbar"); if(bar) bar.style.display="none"; }
  function startTimer(q){
    clearTimer();
    if(!S.timer) return;
    const bar=document.getElementById("qz-timerbar"); if(!bar) return;
    const fill=bar.firstElementChild; bar.style.display="block"; fill.style.width="100%";
    const total=S.timer*1000, t0=Date.now();
    timerHandle=setInterval(()=>{
      const left=Math.max(0, total-(Date.now()-t0));
      fill.style.width=(left/total*100)+"%";
      if(left<=0){ clearTimer(); if(!S.answered) timeoutReveal(q); }
    }, 100);
  }
  function timeoutReveal(q){
    if(S.answered) return; S.answered=true;
    cur().streak=0;
    const quipText=pick((data.fondy&&data.fondy.timeout)||["Čas vypršel!"]);
    say(quipText); if(S.voice) speakTTS("Čas vypršel! "+quipText);
    const pic=body.querySelector("#qz-pic"); if(pic) pic.classList.add("small");
    const correctLabel = q.type==="estimate" ? (fmt(q.numeric_answer)+" "+esc(q.unit||"")) : esc(q.answer);
    const box=body.querySelector("#qz-box");
    const allowSteal = S.mode==="party" && S.steal && q.type!=="estimate" && S.players.length>1;
    box.innerHTML = `
      <div class="qz-ans two"><div class="qz-a ok locked">${correctLabel}<small>SPRÁVNĚ</small></div>
      <div class="qz-a bad locked">${ICO_CLOCK}<small>ČAS VYPRŠEL</small></div></div>
      <div class="qz-hlaska"><div class="qz-hl">čas</div><div class="qz-ht">„${esc(quipText)}"</div></div>
      ${allowSteal ? stealHtml(q, "__timeout__") : frowHtml(q)}`;
    if(allowSteal) wireSteal(q, "__timeout__"); else wireFrow(q);
    autosave();
  }

  // ---- hlas (Web Speech API) ----
  function initVoices(){
    if(!("speechSynthesis" in window)) return;
    const p = () => { const vs = speechSynthesis.getVoices();
      csVoice = vs.find(v=>/^cs/i.test(v.lang)) || vs.find(v=>/czech|česk|cesk/i.test(v.name)) || null; };
    p(); speechSynthesis.onvoiceschanged = p;
  }
  function speakTTS(t){ if(!S.voice || !t || !("speechSynthesis" in window)) return;
    try { speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(String(t)); u.lang="cs-CZ"; if(csVoice) u.voice=csVoice; u.rate=1; speechSynthesis.speak(u); } catch(e){} }
  function stopTTS(){ try { if("speechSynthesis" in window) speechSynthesis.cancel(); } catch(e){} }
  function speakCurrent(q){ if(!S.voice) return; const parts=[]; if(S.mode==="party") parts.push(cur().name+" je na tahu.");
    parts.push(q.question); const qq=resolveQuip(q.quip_question, bandOf()); if(qq) parts.push(qq); speakTTS(parts.join(" ")); }

  // ---- otáčení obrazovky k hráči (kulatý stůl) ----
  function sideDeg(side){ const s=SIDES.find(x=>x.k===side); return s?s.deg:0; }
  function applyRotation(){
    const shell=document.getElementById("qz-shell");
    if(S.mode!=="party"){ shell.style.transform=""; return; }
    let deg = (S.manualRot!=null) ? S.manualRot : (S.rotate==="auto" ? sideDeg(cur().side) : 0);
    const rot=(deg%180)!==0, vw=window.innerWidth, vh=window.innerHeight;
    const w=shell.offsetWidth||960, h=shell.offsetHeight||600;
    let scale = rot ? Math.min(vw/h, vh/w, 1) : Math.min(vw/w, vh/h, 1);
    scale = Math.max(scale, 0.4);
    shell.style.transformOrigin="center center";
    shell.style.transform = `rotate(${deg}deg) scale(${scale.toFixed(3)})`;
  }

  // ---- reálný 3D glóbus v medailonku (natáčí se na zemi otázky) ----
  const EARTH_TEX = "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg";
  const COUNTRY_LL = { ru:[100,62], pl:[19.3,52], sk:[19.5,48.7] };   // přibližný střed země pro natočení
  let g3 = null;
  function initGlobe3d(){
    if(g3 || typeof THREE === "undefined") return;
    try {
      const cv=document.createElement("canvas"); cv.width=cv.height=460; cv.style.width="100%"; cv.style.height="100%"; cv.style.display="block";
      const renderer=new THREE.WebGLRenderer({ canvas:cv, antialias:true, alpha:true });
      renderer.setPixelRatio(1); renderer.setSize(460,460,false);
      if(THREE.sRGBEncoding!==undefined) renderer.outputEncoding=THREE.sRGBEncoding;
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(40, 1, 0.1, 100); camera.position.set(0,0,2.9);
      scene.add(new THREE.AmbientLight(0xffffff,0.55));
      const key=new THREE.DirectionalLight(0xffffff,0.9); key.position.set(-1,0.5,1.1); camera.add(key); scene.add(camera);
      const tex=new THREE.TextureLoader().load(EARTH_TEX); if(THREE.sRGBEncoding!==undefined) tex.encoding=THREE.sRGBEncoding;
      const earth=new THREE.Mesh(new THREE.SphereGeometry(1,48,32), new THREE.MeshPhongMaterial({ map:tex, shininess:5 }));
      scene.add(earth);
      g3={ renderer, scene, camera, earth, canvas:cv, targetY:0, curY:0, targetX:0, curX:0, auto:false };
      (function loop(){ requestAnimationFrame(loop); if(!g3) return;
        if(g3.auto) g3.curY += 0.0015;                       // klidová rotace (~70 s/otáčka)
        else g3.curY += (g3.targetY-g3.curY)*0.08;           // natočení na zemi otázky
        g3.curX += (g3.targetX-g3.curX)*0.08;
        g3.earth.rotation.y=g3.curY; g3.earth.rotation.x=g3.curX;
        if(!g3.canvas.isConnected) return;                   // nerenderuj, když glóbus není vidět (výkon)
        g3.renderer.render(g3.scene,g3.camera);
      })();
    } catch(e){ g3=null; }
  }
  function spinGlobeTo(cc){
    if(!g3) return;
    g3.auto=false;
    const ll = COUNTRY_LL[cc] || [0,20];
    let ty = -(ll[0]*Math.PI/180) - Math.PI/2;          // délku natoč k pozorovateli
    while(ty-g3.curY >  Math.PI) ty -= 2*Math.PI;        // nejkratší cesta
    while(ty-g3.curY < -Math.PI) ty += 2*Math.PI;
    g3.targetY=ty;
    g3.targetX=(ll[1]*Math.PI/180)*0.55;                 // mírný náklon podle šířky
  }
  function mountGlobeMedal(cc){
    const medal=document.getElementById("qz-medal"); if(!medal) return;
    initGlobe3d();
    if(g3 && g3.canvas){ medal.innerHTML=""; medal.appendChild(g3.canvas); spinGlobeTo(cc); }
    else { medal.innerHTML='<div class="land a"></div><div class="land b"></div>'; }   // fallback (Three.js chybí)
  }
  // úvodní obrazovka: velký glóbus v klidové rotaci za kartami režimů
  function mountGlobeBg(){
    const bg=document.getElementById("qz-globebg"); if(!bg) return;
    initGlobe3d();
    if(g3 && g3.canvas){ bg.innerHTML=""; bg.appendChild(g3.canvas); g3.auto=true; g3.targetX=0.32; }
  }

  async function ensureData(){
    if(data) return;
    const ccs = Object.keys(COUNTRY_BY_CC);
    const [fondy, ...qsets] = await Promise.all([
      fetch("data/fondy.json").then(r=>r.ok?r.json():{}).catch(()=>({})),
      ...ccs.map(cc => fetch(`data/questions/${cc}.json`).then(r=>r.ok?r.json():[]).catch(()=>[]))
    ]);
    const qByCc = {}; ccs.forEach((cc,i)=> qByCc[cc] = qsets[i]||[]);
    // data.questions = aktuálně vybraný fond; cardsById = karty vybrané země
    data = { qByCc, cardsByCc:{}, cardsById:{}, questions:[], fondy };
    initVoices();
    // hostitel: logo
    const im = new Image(); im.onload = () => { hostAv.innerHTML=""; const el=document.createElement("img"); el.src="assets/logo.jpg"; hostAv.appendChild(el); }; im.src="assets/logo.jpg";
  }
  // načte karty země (pro „Víc o tom") do cache a nastaví je jako aktivní
  async function loadCardsFor(cc){
    if(!data.cardsByCc[cc]){
      const cards = await fetch(`data/cards/${cc}.json`).then(r=>r.ok?r.json():[]).catch(()=>[]);
      const byId={}; for(const c of cards) byId[c.id]=c; data.cardsByCc[cc]=byId;
    }
    data.cardsById = data.cardsByCc[cc];
  }
  // dostupnost otázek
  function qsForCc(cc){
    if(!data.qByCc) return [];
    if(Array.isArray(cc)) return cc.flatMap(c => data.qByCc[c] || []);
    return data.qByCc[cc] || [];
  }
  function countriesInCont(cont){ return Object.keys(COUNTRY_BY_CC).filter(cc => COUNTRY_CONT[cc]===cont); }
  function contHasQuestions(cont){ return countriesInCont(cont).some(cc => qsForCc(cc).length>0); }
  // nastaví vybrané země + načte karty; pool otázek pak dořeší applyPool()
  async function selectCountries(ccs){
    S.sel = S.sel || {}; S.sel.ccs = ccs; S.sel.cc = ccs.length === 1 ? ccs[0] : null;
    if(ccs.length === 1){
      const cc = ccs[0]; COUNTRY = COUNTRY_BY_CC[cc] || cc.toUpperCase(); FLAG = COUNTRY_FLAG[cc] || "🏳️";
      await loadCardsFor(cc);
    } else {
      COUNTRY = ccs.length + " " + plur(ccs.length, "země", "země", "zemí"); FLAG = "";
      await Promise.all(ccs.map(cc => loadCardsFor(cc)));
      data.cardsById = Object.assign({}, ...ccs.map(cc => data.cardsByCc[cc] || {}));
    }
  }
  async function selectCountry(cc){ await selectCountries([cc]); }
  // sestaví fond otázek podle vybrané země a sekce (null/„__all__" = vše)
  function applyPool(){
    const cc = S.sel && (S.sel.ccs || S.sel.cc);
    const all = qsForCc(cc);
    const sec = S.sel && S.sel.section;
    let pool;
    if (!sec || sec === "__all__") { pool = all; }
    else if (Array.isArray(sec)) { pool = all.filter(q => sec.includes(q.section||"")); }
    else { pool = all.filter(q => (q.section||"") === sec); }
    data.questions = pool.length ? pool : all;
  }

  function open(){ ensureData().then(()=>{ document.body.style.overflow="hidden"; root.classList.remove("qz-hidden"); renderModePick(); }); }
  function close(){ stopTTS(); clearTimer(); releaseWake(); location.href = GLOBE_URL; }

  // ---- výběr režimu ----
  function renderModePick(){
    say("Vítejte, cestovatelé! Kam to dnes bude?");
    document.getElementById("qz-shell").style.transform="";
    const saves=loadSaves(); const ids=Object.keys(saves).sort((a,b)=>saves[b].ts-saves[a].ts).slice(0,4);
    const resumeHtml = ids.length ? `<div class="qz-resume">
      <div class="qz-resume-h">${ICO_FOLDER} Rozehrané výpravy</div>
      ${ids.map(id=>{ const m=saves[id].meta;
        const where = m.mode==="party" ? ("kolo "+m.round+"/"+m.totalRounds) : ("otázka "+((m.idx||0)+1)+"/"+m.count);
        return `<div class="qz-resume-item" data-resume="${id}">
          <span class="qz-resume-faces">${(m.players||[]).map(p=>`<span class="qz-face" style="background:${p.color}">${esc((p.name||"?")[0])}</span>`).join("")}</span>
          <span class="qz-resume-meta">${m.cc?flagStamp(m.cc):""} ${m.mode==="party"?"Párty":(m.school?"Škola":"Sólo")} · ${where}</span>
          <button class="qz-resume-del" data-del="${id}" title="smazat">✕</button></div>`; }).join("")}
    </div>` : "";
    body.innerHTML = `<div class="qz-screen qz-modepick">
      <div class="qz-globebg" id="qz-globebg"></div>
      <h2>Zeměpis</h2>
      <div class="qz-modes">
        <button class="qz-mode" id="qz-mode-solo"><div class="ic"><img class="ic-img" src="assets/mode-solo.jpg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${ICO_SOLO}</span></div><div class="t">Sólo</div><div class="d">Nikdo nezmerčí, co nevíš. Ty to ale brzo zjistíš...</div></button>
        <button class="qz-mode" id="qz-mode-party"><div class="ic"><img class="ic-img" src="assets/mode-party.jpg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${ICO_PARTY}</span></div><div class="t">Párty hra</div><div class="d">2 až 6 hráčů. Jeden bude tvrdit, že věděl.</div></button>
        <button class="qz-mode" id="qz-mode-school"><div class="ic"><img class="ic-img" src="assets/mode-school.jpg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${ICO_SCHOOL}</span></div><div class="t">Škola</div><div class="d">Třída hádá. Aspoň někdo musí něco vědět...</div></button>
      </div>
      ${resumeHtml}
    </div>`;
    body.querySelector("#qz-mode-solo").addEventListener("click", () => beginPick("solo"));
    body.querySelector("#qz-mode-party").addEventListener("click", () => beginPick("party"));
    body.querySelector("#qz-mode-school").addEventListener("click", () => beginPick("school"));
    body.querySelectorAll(".qz-resume-item").forEach(it => it.addEventListener("click", e => {
      if(e.target.closest(".qz-resume-del")) return;
      resumeSave(it.dataset.resume);
    }));
    body.querySelectorAll(".qz-resume-del").forEach(d => d.addEventListener("click", e => {
      e.stopPropagation(); const s=loadSaves(); delete s[d.dataset.del]; writeSaves(s); renderModePick();
    }));
    mountGlobeBg();
  }

  // ---- výběr tématu: kontinent → země → sekce (jako u glóbu) ----
  function plur(n, one, few, many){ n=Math.abs(n); if(n===1) return one; if(n>=2&&n<=4) return few; return many; }
  const MODE_LABEL = { solo:"Sólo", party:"Párty", school:"Škola" };
  function beginPick(mode){ S.pickMode=mode; S.sel={}; renderContinentPick(); }
  function selSectionLabel(){ const s=S.sel&&S.sel.section; if(!s||s==="__all__") return "Vše"; if(Array.isArray(s)) return s.length===1?s[0]:s.length+" témata"; return s; }
  function contsLabel(){
    const contsArr = (S.sel && S.sel.conts) || [];
    const contNames = contsArr.map(id => { const c = CONTINENTS.find(x=>x.id===id); return c ? c.name : id; });
    return contsArr.length === 1 ? contNames[0] : contsArr.length + " " + plur(contsArr.length, "kontinent", "kontinenty", "kontinentů");
  }
  function pickHeadHtml(crumbs){
    return `<div class="qz-pickhead"><button class="qz-back" id="qz-back">${handArrowSvg(true)} zpět</button>
      <div class="qz-crumbs">${crumbs}</div></div>`;
  }
  function tileHtml(o){ // {ic,img,t,sub,soon,attr,selectable}
    const soon = o.soon ? " soon" : "";
    const icInner = o.img
      ? `<img class="ic-img" src="${o.img}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${o.ic}</span>`
      : o.ic;
    const check = o.selectable ? `<span class="qz-tile-check">${checkSvg()}</span>` : "";
    return `<button class="qz-tile${soon}" ${o.attr||""} ${o.soon?"disabled":""}>
      ${o.soon?`<span class="qz-tbadge">Brzy</span>`:""}
      <span class="qz-tile-ic">${icInner}${check}</span>
      <span class="qz-tile-t">${esc(o.t)}</span>
      ${o.sub?`<span class="qz-tile-sub">${esc(o.sub)}</span>`:""}</button>`;
  }

  function renderContinentPick(){
    say("Kam se vydáme? Vyber kontinent.");
    document.getElementById("qz-shell").style.transform="";
    const tiles = CONTINENTS.map(c => {
      const has = contHasQuestions(c.id);
      const n = countriesInCont(c.id).filter(cc=>qsForCc(cc).length>0).length;
      return tileHtml({ ic:c.emoji, img:`assets/cont-${c.id}.jpg`, t:c.name, sub: has ? (n+" "+plur(n,"země","země","zemí")) : "připravujeme",
        soon:!has, selectable:true, attr:`data-cont="${c.id}"` });
    }).join("");
    body.innerHTML = `<div class="qz-screen qz-pick">
      ${pickHeadHtml(`${MODE_LABEL[S.pickMode]||""} › <b>Kontinent</b>`)}
      <h2>Vyber kontinent</h2>
      <div class="qz-tiles">${tiles}</div>
      <div class="qz-sec-confirm"><button class="qz-btn-start" id="qz-cont-start" disabled>Pokračuj ${handArrowSvg(false)}</button></div>
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", renderModePick);
    const selected = new Set();
    const startBtn = body.querySelector("#qz-cont-start");
    body.querySelectorAll(".qz-tile[data-cont]:not(.soon)").forEach(b => {
      b.addEventListener("click", () => {
        const cont = b.dataset.cont;
        if(selected.has(cont)){ selected.delete(cont); b.classList.remove("sel"); }
        else { selected.add(cont); b.classList.add("sel"); }
        startBtn.disabled = selected.size === 0;
      });
    });
    startBtn.addEventListener("click", () => { if(selected.size) renderCountryPick([...selected]); });
  }

  function renderCountryPick(conts){
    const contsArr = Array.isArray(conts) ? conts : [conts];
    S.sel = S.sel || {}; S.sel.conts = contsArr;
    const contLabel = contsLabel();
    say("A do které země?");
    document.getElementById("qz-shell").style.transform="";
    const ccList = contsArr.flatMap(cont => countriesInCont(cont));
    const hasSome = ccList.some(cc => qsForCc(cc).length > 0);
    const tiles = ccList.length ? ccList.map(cc => {
      const n = qsForCc(cc).length;
      return tileHtml({ ic:COUNTRY_FLAG[cc]||"🏳️", img:`assets/country-${cc}.jpg`, t:COUNTRY_BY_CC[cc]||cc,
        sub: n ? (n+" "+plur(n,"otázka","otázky","otázek")) : "brzy otázky",
        soon:!n, selectable:true, attr:`data-cc="${cc}"` });
    }).join("") : `<div class="qz-pick-empty">Tady zatím žádné země nejsou — brzy.</div>`;
    body.innerHTML = `<div class="qz-screen qz-pick">
      ${pickHeadHtml(`${MODE_LABEL[S.pickMode]||""} › ${esc(contLabel)} › <b>Země</b>`)}
      <h2>${esc(contLabel)} — vyber zemi</h2>
      <div class="qz-tiles">${tiles}</div>
      ${hasSome ? `<div class="qz-sec-confirm"><button class="qz-btn-start" id="qz-cc-start" disabled>Pokračuj ${handArrowSvg(false)}</button></div>` : ""}
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", renderContinentPick);
    const selected = new Set();
    const startBtn = body.querySelector("#qz-cc-start");
    body.querySelectorAll(".qz-tile[data-cc]:not(.soon)").forEach(b => {
      b.addEventListener("click", () => {
        const cc = b.dataset.cc;
        if(selected.has(cc)){ selected.delete(cc); b.classList.remove("sel"); }
        else { selected.add(cc); b.classList.add("sel"); }
        if(startBtn) startBtn.disabled = selected.size === 0;
      });
    });
    if(startBtn) startBtn.addEventListener("click", async () => {
      if(!selected.size) return;
      await selectCountries([...selected]);
      renderSectionPick();
    });
  }

  function renderSectionPick(){
    const cc = S.sel.ccs || S.sel.cc;
    say(`${COUNTRY} — a na co se zaměříme?`);
    document.getElementById("qz-shell").style.transform="";
    const all = qsForCc(cc);
    const bySec = {}; for(const q of all){ const s=q.section||"—"; (bySec[s]=bySec[s]||[]).push(q); }
    const secTiles = SECTION_ORDER.map(s => {
      const n = (bySec[s]||[]).length;
      return tileHtml({ ic:SECTION_EMOJI[s]||"•", img:`assets/section-${SECTION_SLUG[s]||"x"}.jpg`, t:s,
        sub: n ? (n+" "+plur(n,"otázka","otázky","otázek")) : "—",
        soon:!n, selectable:true, attr:`data-sec="${esc(s)}"` });
    }).join("");
    const allTile = tileHtml({ ic:"🎲", img:"assets/section-vse.jpg", t:"Vše", selectable:true,
      sub: all.length+" "+plur(all.length,"otázka","otázky","otázek"), attr:`data-sec="__all__"` });
    body.innerHTML = `<div class="qz-screen qz-pick">
      ${pickHeadHtml(`${MODE_LABEL[S.pickMode]||""} › ${esc(contsLabel())} › ${esc(COUNTRY)} › <b>Téma</b>`)}
      <h2>${flagStamp(cc)} ${esc(COUNTRY)} — vyber téma</h2>
      <div class="qz-tiles qz-tiles-sec">${secTiles}</div>
      <div class="qz-sec-confirm"><button class="qz-btn-start" id="qz-sec-start" disabled>Hrát ${handArrowSvg(false)}</button></div>
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", () => renderCountryPick(S.sel.conts || [S.sel.cont]));
    const selected = new Set();
    const startBtn = body.querySelector("#qz-sec-start");
    function syncStart(){
      startBtn.disabled = selected.size === 0;
    }
    body.querySelectorAll(".qz-tile[data-sec]:not(.soon)").forEach(b => {
      b.addEventListener("click", () => {
        const sec = b.dataset.sec;
        if(sec === "__all__"){
          if(selected.has("__all__")){ selected.clear(); b.classList.remove("sel"); }
          else { selected.clear(); body.querySelectorAll(".qz-tile.sel").forEach(t=>t.classList.remove("sel")); selected.add("__all__"); b.classList.add("sel"); }
        } else {
          if(selected.has("__all__")){ selected.delete("__all__"); body.querySelector(".qz-tile[data-sec='__all__']")?.classList.remove("sel"); }
          if(selected.has(sec)){ selected.delete(sec); b.classList.remove("sel"); }
          else { selected.add(sec); b.classList.add("sel"); }
        }
        syncStart();
      });
    });
    startBtn.addEventListener("click", () => {
      if(!selected.size) return;
      S.sel.section = selected.has("__all__") ? "__all__" : [...selected];
      applyPool(); afterPick();
    });
  }
  function afterPick(){
    if(S.pickMode==="party") renderSetup();
    else if(S.pickMode==="school") renderSchoolStart();
    else renderStart();
  }

  // ---- škola / projektor ----
  function renderSchoolStart(){
    say("Vyber úroveň a promítni to třídě.");
    document.getElementById("qz-shell").style.transform="";
    const _cLabel2=esc(COUNTRY);
    body.innerHTML = `<div class="qz-screen qz-start">
      ${pickHeadHtml(`${MODE_LABEL[S.pickMode]||""} › ${esc(contsLabel())} › ${_cLabel2} › <b>${esc(selSectionLabel())}</b>`)}
      <h2>Škola / projektor — ${flagStamp(S.sel&&S.sel.cc)} ${COUNTRY}</h2>
      <p>Velké otázky na plátno, celá třída hádá naráz — trocha vědění, hromada smíchu. Zvol obtížnost:</p>
      <div class="qz-bands">
        <button class="qz-chip" data-lvl="1">★ Lehká</button>
        <button class="qz-chip" data-lvl="2">★★ Střední</button>
        <button class="qz-chip on" data-lvl="3">★★★ Vše</button>
      </div>
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", renderSectionPick);
    body.querySelectorAll("[data-lvl]").forEach(b => b.addEventListener("click", () => startSchool(+b.dataset.lvl)));
  }
  function startSchool(level){
    S.mode="solo"; S.school=true;
    S.players=[{ name:"Třída", band:"deti", color:COLORS[1], score:0, streak:0, side:"dole" }];
    S.turn=0;
    const filtered = data.questions.filter(q => (q.difficulty||1) <= level);
    S.order = shuffle(filtered.length ? filtered : data.questions);
    S.idx=0; sessionMastered=[]; newSave();
    const shell=document.getElementById("qz-shell"); shell.classList.add("qz-school"); shell.style.transform="";
    renderQuestion();
  }
  if(closeBtn) closeBtn.addEventListener("click", close);

  function renderStart(){
    say("Řekni mi, kdo dnes cestuje — a hned vyrážíme.");
    const _cLabel=esc(COUNTRY);
    body.innerHTML = `<div class="qz-screen qz-start">
      ${pickHeadHtml(`${MODE_LABEL[S.pickMode]||""} › ${esc(contsLabel())} › ${_cLabel} › <b>${esc(selSectionLabel())}</b>`)}
      <h2>${flagStamp(S.sel&&S.sel.cc)} ${COUNTRY} — sólo výprava</h2>
      <p>${data.questions.length} ${plur(data.questions.length,"otázka","otázky","otázek")}. U některých je schovaná „zlatá" špatná odpověď — netrefíš se přesně, ale za chytrý odhad získáš aspoň polovinu bodů.</p>
      <div style="width:min(100%,270px)">
        <div style="font-size:12px;color:var(--muted);margin-bottom:6px">Kdo dnes cestuje?</div>
        <div class="qz-bands">
          <button class="qz-chip${S.band==="deti"?" on":""}" data-band="deti">Děti</button>
          <button class="qz-chip${S.band==="dospeli"?" on":""}" data-band="dospeli">Dospělí</button>
        </div>
        ${S.band==="deti"?`<div style="font-size:12px;color:var(--muted);margin:8px 0 6px">Věk:</div>
        <div class="qz-bands">
          <button class="qz-chip${S.kidsMax===1?" on":""}" data-kmax="1">6–9 let</button>
          <button class="qz-chip${S.kidsMax>=2?" on":""}" data-kmax="2">10–14 let</button>
        </div>`:""}
      </div>
      <button class="qz-go" id="qz-start-go">Jdeme na to ${handArrowSvg(false)}</button>
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", renderSectionPick);
    body.querySelectorAll(".qz-chip[data-band]").forEach(ch => ch.addEventListener("click", () => { S.band=ch.dataset.band; renderStart(); }));
    body.querySelectorAll(".qz-chip[data-kmax]").forEach(ch => ch.addEventListener("click", () => { S.kidsMax=+ch.dataset.kmax; renderStart(); }));
    body.querySelector("#qz-start-go").addEventListener("click", startGame);
  }

  function startGame(){
    S.mode="solo";
    S.players=[{ name:"Ty", band:S.band, color:COLORS[0], score:0, streak:0, side:"dole" }];
    S.turn=0;
    let pool = data.questions;
    if(S.band==="deti"){ const f=pool.filter(q=>(q.difficulty||1)<=S.kidsMax); if(f.length) pool=f; }
    S.order=shuffle(pool); S.idx=0; sessionMastered=[]; S.school=false; newSave();
    const shg=document.getElementById("qz-shell"); shg.classList.remove("qz-school"); shg.style.transform="";
    renderQuestion();
  }

  // ---- setup párty ----
  function ensureSetup(){
    if(S.players.length>=2) return;
    S.players = [
      { name:"", age:"9",  band:"deti",    color:COLORS[0], side:"dole",   score:0, streak:0 },
      { name:"", age:"40", band:"dospeli", color:COLORS[1], side:"nahoře", score:0, streak:0 }
    ];
  }
  function renderSetup(){
    ensureSetup();
    say("Sesbírej posádku — jména, věk, kde kdo sedí.");
    document.getElementById("qz-shell").style.transform="";
    const prow = (p,i) => `<div class="qz-prow" data-i="${i}">
      <span class="qz-pav" style="background:${p.color}">${esc((p.name||"?")[0])}</span>
      <input class="qz-pname-in" placeholder="jméno hráče ${i+1}" value="${esc(p.name)}" data-f="name">
      <input class="qz-page-in" type="number" placeholder="věk" value="${esc(p.age||"")}" data-f="age">
      <span class="qz-bandtag ${p.band}">${p.band==="deti"?"děti":"dospělí"}</span>
      <span class="qz-sides">${SIDES.map(s=>`<button class="qz-side${p.side===s.k?" on":""}" data-side="${s.k}" title="${s.k}">${arrowSvg(s.deg)}</button>`).join("")}</span>
      ${S.players.length>2?`<button class="qz-prem" data-rem="${i}" title="odebrat">✕</button>`:""}
    </div>`;
    const _cLabel3=esc(COUNTRY);
    body.innerHTML = `<div class="qz-screen qz-setup">
      ${pickHeadHtml(`${MODE_LABEL[S.pickMode]||""} › ${esc(contsLabel())} › ${_cLabel3} › <b>${esc(selSectionLabel())}</b>`)}
      <h2>${ICO_SPARK} Nová výprava — ${flagStamp(S.sel&&S.sel.cc)} ${COUNTRY}</h2>
      <div class="qz-setcard">
        <h3><span class="n">1</span>Kdo hraje? <span style="font-size:11px;color:var(--muted);font-weight:400">věk určí pásmo i hlášky</span></h3>
        <div id="qz-players">${S.players.map(prow).join("")}</div>
        ${S.players.length<6?`<button class="qz-addp" id="qz-addp">+ přidat hráče</button>`:""}
      </div>
      <div class="qz-setrow">
        <div class="qz-setcard">
          <h3><span class="n">2</span>Délka</h3>
          <div class="qz-bands">
            ${[["Rychlá",3],["Klasik",5],["Maraton",8]].map(([l,r])=>`<button class="qz-chip${S.totalRounds===r?" on":""}" data-rounds="${r}">${l} · ${r} kol</button>`).join("")}
          </div>
        </div>
        <div class="qz-setcard">
          <h3><span class="n">3</span>Nastavení</h3>
          <div class="qz-opt" data-opt="voice"><span class="qz-sw${S.voice?" on":""}"></span> Hlas — tablet čte nahlas</div>
          <div class="qz-opt" data-opt="rotate"><span class="qz-sw${S.rotate==="auto"?" on":""}"></span> Otáčet obrazovku k hráči</div>
          <div class="qz-opt" data-opt="steal"><span class="qz-sw${S.steal?" on":""}"></span> Steal (sebrání otázky)</div>
          <div style="margin-top:8px;font-size:12px;color:var(--muted)">Časový limit na odpověď</div>
          <div class="qz-bands" style="margin-top:4px">
            <button class="qz-chip${S.timer===0?" on":""}" data-timer="0">vyp</button>
            <button class="qz-chip${S.timer===30?" on":""}" data-timer="30">mírný · 30 s</button>
            <button class="qz-chip${S.timer===15?" on":""}" data-timer="15">svižný · 15 s</button>
          </div>
        </div>
      </div>
      <div class="qz-setnote">Fond: ${data.questions.length} otázek · ${flagStamp(S.sel&&S.sel.cc)} ${esc(COUNTRY)}${(S.sel&&S.sel.section&&S.sel.section!=="__all__")?" · "+esc(S.sel.section):""} · hráči ${S.players.length}</div>
      <button class="qz-go" id="qz-setup-go" style="align-self:center">Jdeme na to ${handArrowSvg(false)}</button>
    </div>`;
    // wiring
    body.querySelector("#qz-back").addEventListener("click", renderSectionPick);
    body.querySelectorAll(".qz-prow").forEach(row => {
      const i = +row.dataset.i;
      row.querySelector('[data-f="name"]').addEventListener("input", e => { S.players[i].name=e.target.value; row.querySelector(".qz-pav").textContent=(e.target.value||"?")[0]; });
      row.querySelector('[data-f="age"]').addEventListener("input", e => { S.players[i].age=e.target.value; S.players[i].band=ageBand(e.target.value); const tag=row.querySelector(".qz-bandtag"); tag.className="qz-bandtag "+S.players[i].band; tag.textContent=S.players[i].band==="deti"?"děti":"dospělí"; });
      row.querySelectorAll(".qz-side").forEach(b => b.addEventListener("click", () => { S.players[i].side=b.dataset.side; renderSetup(); }));
      const rem=row.querySelector(".qz-prem"); if(rem) rem.addEventListener("click", () => { S.players.splice(+rem.dataset.rem,1); renderSetup(); });
    });
    const add=body.querySelector("#qz-addp"); if(add) add.addEventListener("click", () => { const i=S.players.length; S.players.push({ name:"", age:"", band:"dospeli", color:COLORS[i%COLORS.length], side:SIDES[i%SIDES.length].k, score:0, streak:0 }); renderSetup(); });
    body.querySelectorAll("[data-rounds]").forEach(b => b.addEventListener("click", () => { S.totalRounds=+b.dataset.rounds; renderSetup(); }));
    body.querySelectorAll("[data-timer]").forEach(b => b.addEventListener("click", () => { S.timer=+b.dataset.timer; renderSetup(); }));
    body.querySelectorAll(".qz-opt").forEach(o => o.addEventListener("click", () => {
      const k=o.dataset.opt;
      if(k==="voice") S.voice=!S.voice;
      else if(k==="rotate") S.rotate = S.rotate==="auto" ? "button" : "auto";
      else if(k==="steal") S.steal=!S.steal;
      renderSetup();
    }));
    body.querySelector("#qz-setup-go").addEventListener("click", () => {
      const named = S.players.filter(p=>(p.name||"").trim());
      if(named.length<2){ say("Potřebuju aspoň dvě jména, ať vím, koho vítat."); return; }
      S.players = named.map((p,i)=>({ ...p, name:p.name.trim(), color:COLORS[i%COLORS.length], score:0, streak:0 }));
      startParty();
    });
  }

  function startParty(){
    S.mode="party"; S.order=shuffle(data.questions); S.qServed=0; S.turn=0; S.round=1; S.manualRot=null; sessionMastered=[]; S.school=false; newSave();
    document.getElementById("qz-shell").classList.remove("qz-school");
    S.players.forEach(p=>{ p.score=0; p.streak=0; });
    applyRotation();
    renderQuestion();
  }

  function picframeHtml(q){
    return `<div class="qz-picframe" id="qz-pic">
      <img class="qz-pic" id="qz-pic-img" src="img/${esc(q.id)}.jpg" alt="">
      <div class="qz-pic-fallback" id="qz-pic-fb"><span class="flag">${flagStamp(q.cc,"qz-flagbig")}</span><span class="sec">${esc(q.section||COUNTRY)}</span></div>
      <div class="qz-pictag">${ICO_BRUSH} obrázek k otázce · ${esc(q.country||COUNTRY)}</div>
    </div>
    <div class="qz-medal" id="qz-medal"></div>
    <div class="qz-medalcap">glóbus → ${esc(q.country||COUNTRY)}</div>`;
  }
  function wirePic(){
    const img=body.querySelector("#qz-pic-img"), fb=body.querySelector("#qz-pic-fb");
    if(!img) return;
    const show=()=>{ img.style.display="block"; fb.style.display="none"; };
    img.style.display="none"; fb.style.display="flex";
    img.onload=show;
    if(img.complete && img.naturalWidth>0) show();
  }

  function topHtml(n, total){
    if(S.mode==="party"){
      const pills=S.players.map((p,i)=>`<button class="qz-pl${i===S.turn?" active":""}" data-turn="${i}">
        <span class="qz-pav" style="background:${p.color}">${esc((p.name||"?")[0])}</span>
        <span class="qz-plmeta"><span class="qz-plname">${esc(p.name)}</span>${i===S.turn?'<span class="qz-plturn">na tahu</span>':""}</span>
        <span class="qz-plscore" data-score="${i}">${p.score}</span></button>`).join("");
      return `<div class="qz-scoreboard">${pills}</div>
        <div class="qz-subtop"><span class="qz-progress">kolo ${S.round}/${S.totalRounds} · otázka ${n}</span><button class="qz-mute" id="qz-mute">${S.voice?ICO_SND:ICO_SNDX}</button></div>`;
    }
    return `<div class="qz-top">
      <span class="qz-progress">otázka ${n}/${total}</span>
      <span style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <button class="qz-mute" id="qz-mute">${S.voice?ICO_SND:ICO_SNDX}</button>
        ${S.school?"":`<span class="qz-scorepill">${ICO_STAR} <b>${cur().score}</b>${cur().streak>1?`<span class="qz-streak">série ${cur().streak}×</span>`:""}</span>`}
      </span></div>`;
  }
  function wireTop(q){
    const mb=body.querySelector("#qz-mute");
    if(mb) mb.addEventListener("click", () => { S.voice=!S.voice; mb.innerHTML=S.voice?ICO_SND:ICO_SNDX; if(!S.voice) stopTTS(); else speakCurrent(q); });
    body.querySelectorAll(".qz-pl[data-turn]").forEach(b => b.addEventListener("click", () => {
      if(S.mode!=="party") return; S.manualRot=sideDeg(S.players[+b.dataset.turn].side); applyRotation();
    }));
  }

  function renderQuestion(){
    S.answered=false;
    const q=qCurrent(), b=bandOf();
    const total = S.mode==="party" ? S.totalRounds*S.players.length : S.order.length;
    const n = S.mode==="party" ? (S.qServed+1) : (S.idx+1);
    say(q.quip_question ? "„"+resolveQuip(q.quip_question,b)+"“" : "Tak schválně…");
    let ansHtml, answers=null;
    if(q.type==="estimate"){
      ansHtml = `<div class="qz-est"><input id="qz-est-input" type="number" inputmode="numeric" placeholder="tvůj tip"><span class="unit">${esc(q.unit||"")}</span><button id="qz-est-go">Tipnout</button></div>`;
    } else {
      answers = shuffle([q.answer, ...(q.distractors||[])]);
      ansHtml = `<div class="qz-ans${answers.length<=2?" two":""}">${answers.map((a,i)=>`<button class="qz-a" data-i="${i}">${esc(a)}<small>${"ABCD"[i]||""}</small></button>`).join("")}</div>`;
    }
    body.innerHTML = `<div class="qz-screen qz-play">
      ${topHtml(n,total)}
      ${picframeHtml(q)}
      <div class="qz-box" id="qz-box">
        <div class="qz-timerbar" id="qz-timerbar" style="display:none"><div></div></div>
        <div class="qz-meta">${flagStamp(q.cc)} ${esc(COUNTRY)} · ${esc(q.section||"")} · <span class="qz-diff">${"★".repeat(q.difficulty||1)}</span>${S.mode==="party"?` · <b style="color:${cur().color}">${esc(cur().name)}</b> na tahu`:""}</div>
        <div class="qz-q">${esc(q.question)}</div>
        ${q.quip_question?`<div class="qz-quip">„${esc(resolveQuip(q.quip_question,b))}"</div>`:""}
        ${ansHtml}
      </div>
    </div>`;
    wirePic(); wireTop(q); mountGlobeMedal(q.cc);
    if(q.type==="estimate"){
      const inp=body.querySelector("#qz-est-input");
      const go=()=>submitEstimate(q, parseFloat(inp.value));
      body.querySelector("#qz-est-go").addEventListener("click", go);
      inp.addEventListener("keydown", e=>{ if(e.key==="Enter") go(); });
      setTimeout(()=>inp.focus(), 50);
    } else {
      body.querySelectorAll("#qz-box .qz-a").forEach(btn => btn.addEventListener("click", () => answer(q, answers[+btn.dataset.i])));
    }
    speakCurrent(q);
    requestWake(); autosave(); startTimer(q);
  }

  function frowHtml(q){
    return `<div class="qz-frow">
      <div class="qz-expl">${esc(q.explanation||"")} ${q.source_url?`<a href="${esc(q.source_url)}" target="_blank" rel="noopener">${ICO_LINK} zdroj</a>`:""}</div>
      <div style="display:flex;gap:8px;align-items:center">
        ${(q.source_card && data.cardsById[q.source_card])?`<button class="qz-more" id="qz-more">${ICO_BOOK} Víc o tom</button>`:""}
        <button class="qz-next" id="qz-next">${S.idx+1<S.order.length?"Další otázka":"Konec"} ${handArrowSvg(false)}</button>
      </div>
    </div>`;
  }
  function wireFrow(q){
    body.querySelector("#qz-next").addEventListener("click", next);
    const m=body.querySelector("#qz-more"); if(m) m.addEventListener("click", () => openCard(q.source_card));
  }

  function updateScorePill(i){ const el=body.querySelector(`.qz-plscore[data-score="${i}"]`); if(el) el.textContent=S.players[i].score; }

  function answer(q, choice){
    if(S.answered) return; S.answered=true; clearTimer();
    const b=bandOf(), base=(q.difficulty||1)*100, P=cur();
    const correct = String(choice)===String(q.answer);
    let gained=0, gold=false, quipText;
    if(correct){ P.streak++; gained=base + (P.streak>1?(P.streak-1)*25:0); quipText=resolveQuip(q.quip_correct,b); }
    else if(q.golden_wrong!=null && String(choice)===String(q.golden_wrong)){ gold=true; gained=Math.round(base/2); P.streak=0; quipText=q.golden_quip; }
    else { P.streak=0; const dq=q.distractor_quips&&q.distractor_quips[choice]; quipText = dq?resolveQuip(dq,b):resolveQuip(q.quip_wrong,b); }
    P.score+=gained; updateScorePill(S.turn);
    const masteredNow = correct ? recordCorrect(q.cc) : false;
    say(quipText||""); if(S.voice) speakTTS(quipText);
    if(masteredNow && S.voice) speakTTS((COUNTRY_BY_CC[q.cc]||"Země")+" je zvládnutá! Rozsvítila se na glóbu.");
    const pic=body.querySelector("#qz-pic"); if(pic) pic.classList.add("small");
    if(gold){ const gf=document.createElement("div"); gf.className="qz-goldflash"; document.getElementById("qz-shell").appendChild(gf); setTimeout(()=>gf.remove(),950); }
    const box=body.querySelector("#qz-box");
    const allowSteal = S.mode==="party" && S.steal && !correct && !gold && q.type!=="estimate" && S.players.length>1;
    box.innerHTML = `
      <div class="qz-ans two">
        <div class="qz-a ok locked">${esc(q.answer)}<small>SPRÁVNĚ</small></div>
        ${correct?"":`<div class="qz-a bad locked">${esc(choice)}<small>${S.mode==="party"?esc(P.name):"TVŮJ TIP"}</small></div>`}
      </div>
      <div class="qz-hlaska${gold?" gold":""}">
        <div class="qz-hl">${gold?ICO_STAR+" zlatá odpověď":"hláška"}${gained?` · +${gained}`:""}</div>
        <div class="qz-ht">„${esc(quipText||"")}"</div>
      </div>
      ${masteredNow?`<div class="qz-masternote">${ICO_GLOBE} <b>${esc(COUNTRY_BY_CC[q.cc]||q.country||"Země")}</b> zvládnuto — rozsvítilo se na glóbu! ${ICO_SPARK}</div>`:""}
      ${allowSteal ? stealHtml(q, choice) : frowHtml(q)}`;
    if(allowSteal) wireSteal(q, choice); else wireFrow(q);
  }

  function stealHtml(q, wrongChoice){
    const stealer=S.players[(S.turn+1)%S.players.length];
    const remaining=shuffle([q.answer, ...(q.distractors||[])].filter(a=>String(a)!==String(wrongChoice)));
    return `<div class="qz-steal" id="qz-steal">
      <div class="qz-hl" style="color:#8a6fae">${ICO_BOLT} Steal — ${esc(stealer.name)} může sebrat body</div>
      <div class="qz-ans">${remaining.map((a,i)=>`<button class="qz-a" data-si="${i}">${esc(a)}</button>`).join("")}</div>
      <button class="qz-chip" id="qz-steal-skip">Přeskočit</button>
    </div>`;
  }
  function wireSteal(q, wrongChoice){
    const stealer=S.players[(S.turn+1)%S.players.length], si=(S.turn+1)%S.players.length;
    const box=body.querySelector("#qz-box");
    if(S.voice) speakTTS(stealer.name+", chceš to sebrat?");
    box.querySelectorAll("#qz-steal .qz-a").forEach(btn => btn.addEventListener("click", () => {
      const correct=String(btn.childNodes[0].textContent)===String(q.answer), g=(q.difficulty||1)*100;
      if(correct){ S.players[si].score+=g; updateScorePill(si); recordCorrect(q.cc); say(stealer.name+" to sebral! +"+g); if(S.voice) speakTTS(stealer.name+" sebral body!"); }
      else { say(stealer.name+" taky mimo."); if(S.voice) speakTTS(stealer.name+" taky mimo."); }
      finishSteal(q);
    }));
    box.querySelector("#qz-steal-skip").addEventListener("click", () => { say(stealer.name+" to nechává být."); finishSteal(q); });
  }
  function finishSteal(q){ const st=body.querySelector("#qz-steal"); if(st){ const tmp=document.createElement("div"); tmp.innerHTML=frowHtml(q); st.replaceWith(tmp.firstElementChild); } wireFrow(q); }

  function submitEstimate(q, val){
    if(S.answered || isNaN(val)) return; S.answered=true; clearTimer();
    const b=bandOf(), P=cur(), ans=q.numeric_answer, base=(q.difficulty||1)*100;
    const rel=Math.abs(val-ans)/Math.max(1,Math.abs(ans));
    let gained=0, close=false;
    if(rel<=0.15){ gained=base; close=true; P.streak++; }
    else if(rel<=0.4){ gained=Math.round(base/2); close=true; P.streak=0; }
    else { P.streak=0; }
    P.score+=gained; updateScorePill(S.turn);
    const masteredNow = close ? recordCorrect(q.cc) : false;
    const quipText=resolveQuip(close?q.quip_correct:q.quip_wrong, b)||"";
    say(quipText); if(S.voice) speakTTS(quipText);
    if(masteredNow && S.voice) speakTTS((COUNTRY_BY_CC[q.cc]||"Země")+" je zvládnutá! Rozsvítila se na glóbu.");
    const pic=body.querySelector("#qz-pic"); if(pic) pic.classList.add("small");
    const box=body.querySelector("#qz-box");
    box.innerHTML = `
      <div class="qz-estline"><span>Tip${S.mode==="party"?" ("+esc(P.name)+")":""}: <b>${fmt(val)} ${esc(q.unit||"")}</b></span><span>Správně: <b>${fmt(ans)} ${esc(q.unit||"")}</b></span></div>
      <div class="qz-hlaska"><div class="qz-hl">hláška${gained?` · +${gained}`:""}</div><div class="qz-ht">„${esc(quipText)}"</div></div>
      ${masteredNow?`<div class="qz-masternote">${ICO_GLOBE} <b>${esc(COUNTRY_BY_CC[q.cc]||q.country||"Země")}</b> zvládnuto — rozsvítilo se na glóbu! ${ICO_SPARK}</div>`:""}
      ${frowHtml(q)}`;
    wireFrow(q);
  }

  function openCard(id){
    const c=data.cardsById[id]; if(!c) return;
    const ov=document.createElement("div"); ov.className="qz-cardov";
    const hasImg = c.visual_type!=="typographic";
    ov.innerHTML = `<div class="qz-cardbox">
      ${hasImg?`<img class="qz-cardimg" src="img/${esc(c.id)}.jpg" alt="" onerror="this.style.display='none'">`:""}
      <div class="qz-cardbody">
        <h3>${esc(c.headline||c.country||"")}</h3>
        <p>${esc(c.fact||"")} ${c.source_url?`<a href="${esc(c.source_url)}" target="_blank" rel="noopener" style="color:var(--teal);font-weight:600;text-decoration:none">${ICO_LINK} zdroj</a>`:""}</p>
        ${c.voice?`<p class="qz-cardvoice">${esc(c.voice)}</p>`:""}
        <button class="qz-cardclose">Zpět ke hře</button>
      </div>
    </div>`;
    document.getElementById("qz-shell").appendChild(ov);
    say("Odkud otázka vzešla — mrkni na to.");
    ov.addEventListener("click", e=>{ if(e.target===ov) ov.remove(); });
    ov.querySelector(".qz-cardclose").addEventListener("click", ()=>ov.remove());
  }

  function next(){
    if(S.mode==="solo"){ if(S.idx+1<S.order.length){ S.idx++; renderQuestion(); } else endGame(); return; }
    // párty: další hráč, po celém kole ++kolo
    S.qServed++; S.turn++;
    if(S.turn>=S.players.length){ S.turn=0; S.round++; }
    if(S.round>S.totalRounds){ endCeremony(); return; }
    S.manualRot=null; applyRotation();
    renderQuestion();
  }

  function endCeremony(){
    stopTTS(); clearTimer(); clearSave(); releaseWake();
    document.getElementById("qz-shell").style.transform="";
    const sorted=[...S.players].sort((a,b)=>b.score-a.score);
    const winner=sorted[0];
    const vic = (data.fondy && data.fondy.victory) ? pick(resolveQuip(data.fondy.victory, winner.band)) : "Máme vítěze!";
    say(vic); if(S.voice) speakTTS(winner.name+" vyhrává! "+vic);
    const rows=sorted.map((p,i)=>`<div class="qz-standrow${i===0?" win":""}">
      <span class="qz-rank">${medalSvg(i)}</span>
      <span class="qz-pav" style="background:${p.color}">${esc((p.name||"?")[0])}</span>
      <span class="qz-standname">${esc(p.name)}</span>
      <span class="qz-standscore">${p.score}</span></div>`).join("");
    body.innerHTML=`<div class="qz-screen qz-end">
      <h2>${ICO_TROPHY} ${esc(winner.name)} vítězí!</h2>
      <div class="qz-hlaska" style="max-width:520px"><div class="qz-hl">vyhlášení</div><div class="qz-ht">„${esc(vic)}"</div></div>
      <div class="qz-standings">${rows}</div>
      ${sessionMastered.length?`<div class="qz-masternote">${ICO_GLOBE} Rozsvítili jste na glóbu: <b>${sessionMastered.map(cc=>esc(COUNTRY_BY_CC[cc]||cc)).join(", ")}</b> ${ICO_SPARK}</div>`:""}
      <div class="qz-endrow"><button class="qz-go" id="qz-again">Odveta ${handArrowSvg(false)}</button><button class="qz-chip" id="qz-home">Domů ${handArrowSvg(false)}</button></div>
    </div>`;
    body.querySelector("#qz-again").addEventListener("click", startParty);
    body.querySelector("#qz-home").addEventListener("click", close);
  }

  function endGame(){
    stopTTS(); clearTimer(); clearSave(); releaseWake();
    const max=S.order.reduce((s,q)=>s+(q.difficulty||1)*100,0);
    const score=cur().score;
    const vic = data.fondy && data.fondy.victory ? pick(resolveQuip(data.fondy.victory, S.band)) : "Dohráno!";
    say(vic); if(S.voice) speakTTS(vic);
    body.innerHTML = `<div class="qz-screen qz-end">
      <h2>Výprava dokončena!</h2>
      <div class="qz-endscore">${score}</div>
      <p style="color:var(--muted)">z ${S.order.length} otázek · teoretické maximum ${max} bodů</p>
      ${sessionMastered.length?`<div class="qz-masternote">${ICO_GLOBE} Rozsvítili jste na glóbu: <b>${sessionMastered.map(cc=>esc(COUNTRY_BY_CC[cc]||cc)).join(", ")}</b> ${ICO_SPARK}</div>`:""}
      <div class="qz-endrow">
        <button class="qz-go" id="qz-again">Hrát znovu ${handArrowSvg(false)}</button>
        <button class="qz-chip" id="qz-home">Domů ${handArrowSvg(false)}</button>
      </div>
    </div>`;
    body.querySelector("#qz-again").addEventListener("click", startGame);
    body.querySelector("#qz-home").addEventListener("click", close);
  }

  open();   // samostatná stránka — spustí se rovnou
})();
