/* Vědomostní hra — samostatná appka (hra.html).
   Nesahá na glóbus/mapy; sdílí s ním jen data přes localStorage (progres → rozsvícení zemí).
   Čte data/questions/ru.json, data/cards/ru.json, data/fondy.json. */
(function(){
  const root = document.getElementById("quiz-root");
  const body = document.getElementById("qz-body");
  const closeBtn = document.getElementById("qz-close");
  const hostBubble = document.getElementById("qz-host-bubble");
  const hostAv = document.getElementById("qz-host-av");
  let FLAG = "🇷🇺", COUNTRY = "Rusko";   // aktuálně vybraná země (mění se výběrem)
  // landing.html byl dřív úvodní rozcestník — teď je hra.html sama domovská stránka,
  // takže „Domů" (× i tlačítka po skončení hry) vede zpět na výběr režimu v ní samé,
  // ne na jinou stránku. landing.html zůstává v repu nesmazaný, jen bez odkazu na něj.

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
  // Hvězda u skóre je MALOVANÁ (assets/ico-star.png), ne SVG — appka je celá malovaná
  // a plochý vektor mezi tím působil jako cizí těleso. Stejný vzor jako ico-resume.png.
  // Zdroj je 96 px na zobrazovaných ~17, takže i na retině je z čeho brát.
  // Vyrobeno v Gemini (prompt v data/ui-irony-prompts.json), bílé pozadí odstraněno
  // ZÁPLAVOU OD OKRAJŮ, ne prahem na bílou — ta by udělala díry ve světlých místech
  // uvnitř hvězdy. Předchozí SVG mělo navíc rozbitou cestu (9 bodů místo 10, jeden bod
  // mimo viewBox), takže mu chyběl levý dolní hrot; historie viz CLAUDE.md 2026-09-03.
  const ICO_STAR  = `<img src="assets/ico-star.png" alt="" ${_sw}>`;
  // hvězdička pro obtížnost — o něco „malovanější" než ICO_STAR (kulatější hroty, lesklý fasetový highlight)
  const ICO_STAR_DIFF = `<svg ${_sw} viewBox="0 0 24 24"><path fill="#e6b84f" stroke="#a8752a" stroke-width="1.2" stroke-linejoin="round" d="M12 2.4l2.9 5.9 6.5.9-4.7 4.6 1.1 6.6L12 17.3l-5.8 3.1 1.1-6.6-4.7-4.6 6.5-.9z"/><path fill="#fdf0c8" opacity=".6" d="M12 4.6l1.5 3-1.5 1.9-1.5-1.9z"/></svg>`;
  const DIFF_LABEL = { 1:"Lehká", 2:"Střední", 3:"Těžká" };   // obtížnost otázky (q.difficulty 1–3), slovně vedle hvězdiček
  const ICO_CLOCK = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" fill="#fdf7ea" stroke="#e2725b" stroke-width="2"/><path d="M12 9v4l3 2" stroke="#e2725b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 3h6" stroke="#e2725b" stroke-width="2" stroke-linecap="round"/></svg>`;
  const ICO_BOLT  = `<svg ${_sw} viewBox="0 0 24 24"><path fill="#8a6fae" d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>`;
  const ICO_SND   = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#3d3229"/><path d="M16 9c1.6 1.5 1.6 4.5 0 6M18.7 6.5c3 3 3 8 0 11" stroke="#3d3229" stroke-width="2" stroke-linecap="round"/></svg>`;
  const ICO_SNDX  = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#3d3229"/><path d="M17 10l5 4M22 10l-5 4" stroke="#3d3229" stroke-width="2" stroke-linecap="round"/></svg>`;
  const ICO_SPARK = `<svg ${_sw} viewBox="0 0 24 24"><path fill="#d9a441" d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>`;
  const ICO_TROPHY= `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M7 4h10v4a5 5 0 01-10 0V4z" fill="#d9a441" stroke="#b98b3e" stroke-width="1.4"/><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3" stroke="#b98b3e" stroke-width="1.5"/><path d="M12 13v3M9.5 20h5M10.5 20l.4-4h2.2l.4 4" stroke="#b98b3e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ICO_LINK  = `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M9 15l6-6M8 12l-2 2a3.5 3.5 0 005 5l2-2M16 12l2-2a3.5 3.5 0 00-5-5l-2 2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const _MEDALCOL = ["#d9a441","#b9b3a6","#c08457"];
  function medalSvg(i){ const c=_MEDALCOL[i]; if(!c) return (i+1)+"."; return `<svg ${_sw} viewBox="0 0 24 24" fill="none"><path d="M8 3l3 6M16 3l-3 6" stroke="#e2725b" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15" r="6.2" fill="${c}" stroke="#00000022" stroke-width="1"/><circle cx="12" cy="15" r="3" fill="#ffffff40"/></svg>`; }
  function handArrowSvg(flip){ return `<svg style="width:1.5em;height:.95em;vertical-align:-.15em;display:inline-block${flip?";transform:scaleX(-1)":""}" viewBox="0 0 40 24" fill="none"><path d="M2.5 13c9-3.4 21-2.6 29-2" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M23.5 4.5c3.5 2.4 6.7 4.4 10 6.4-3.4 2.2-7 4-10.8 6.4" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  function checkSvg(){ return `<svg viewBox="0 0 40 32" fill="none"><path d="M4 17c3 3.5 6 7.5 9.5 9.5C19.5 20 25 13.5 35 5" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  // Prázdné cc (Celý svět / víc zemí, kdy selectCountries nastaví cc=null) vrací prázdno,
  // ne <img src="assets/country-null.jpg"> — to dělalo zbytečné 404 na školní i párty
  // obrazovce. Guard je tady, ať se nemusí hlídat na sedmi volajících místech. Escape cc
  // je jen pojistka: dnes je to vždy dvoupísmenný kód z řízené sady.
  function flagStamp(cc, cls){ if(!cc) return ""; return `<img class="${cls||"qz-stamp"}" src="assets/country-${esc(cc)}.jpg" alt="" onerror="this.style.display='none'">`; }

  let data = null, csVoice = null;
  // Odkaz „zdroj" je schválně vypnutý všude (karta s odpovědí i překryv „Víc o tom").
  // Data zůstávají (`source_url` u otázek i karet), stačí přepnout na true.
  const SHOW_SOURCE_LINK = false;
  const COLORS = ["#e2725b","#2a7f7f","#d9a441","#8a6fae","#7ba05b","#4e9e6f"];
  const SIDES = [{k:"dole",deg:0},{k:"nahoře",deg:180},{k:"vlevo",deg:90},{k:"vpravo",deg:270}];
  const S = { mode:"solo", order:[], idx:0, band:"dospeli", bandTouched:false, answered:false,
              players:[], turn:0, round:1, totalRounds:5, qServed:0,
              voice:false, steal:false, rotate:"auto", manualRot:null,
              school:false, timer:0, saveId:null,
              qLimit:null, qLimitTouched:false, schoolLevel:3 };

  const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const pick = a => Array.isArray(a) ? a[Math.floor(Math.random()*a.length)] : a;
  function resolveQuip(quip, band){ if(quip==null) return null; if(typeof quip==="string") return quip; return quip[band] ?? quip.default ?? Object.values(quip)[0]; }
  function say(t){ hostBubble.textContent = t||""; hostBubble.style.display = t ? "" : "none"; }

  // aktivní hráč / pásmo (v sólu jediný „hráč")
  function cur(){ return S.players[S.turn] || {name:"Ty", band:S.band, color:COLORS[0], score:0, side:"dole"}; }
  function bandOf(){ return S.mode==="party" ? cur().band : S.band; }
  function qCurrent(){ return S.mode==="party" ? S.order[S.qServed % S.order.length] : S.order[S.idx]; }

  // ---- zapamatovaná jména hráčů (jen párty — sólo/škola mají pevné jméno) ----
  const NAMES_KEY = "hricka_quiz_names";
  const NAMES_MAX = 12;
  function loadRecentNames(){ try { return JSON.parse(localStorage.getItem(NAMES_KEY)||"[]"); } catch(e){ return []; } }
  function rememberNames(names){
    try {
      const prev = loadRecentNames();
      const merged = [...names, ...prev].filter(n=>n && n.trim());
      // odstraň duplicity bez ohledu na velikost písmen, ponech první (nejnovější) výskyt
      const seen = new Set(), out = [];
      for (const n of merged) { const k=n.trim().toLowerCase(); if(!seen.has(k)){ seen.add(k); out.push(n.trim()); } }
      localStorage.setItem(NAMES_KEY, JSON.stringify(out.slice(0, NAMES_MAX)));
    } catch(e){}
  }

  // Všech 49 zemí z Globusu — appka je nabízí i bez otázek (prázdný fond, zobrazí se
  // jako "0 otázek" u sekcí), obsah se doplňuje postupně zemi po zemi.
  const COUNTRY_BY_CC = { ar:"Argentina", at:"Rakousko", au:"Austrálie", be:"Belgie", bg:"Bulharsko", br:"Brazílie", ca:"Kanada", ch:"Švýcarsko", cl:"Chile", cn:"Čína", cz:"Česko", de:"Německo", dk:"Dánsko", ec:"Ekvádor", eg:"Egypt", es:"Španělsko", fi:"Finsko", fj:"Fidži", fr:"Francie", ga:"Gabon", gb:"Spojené království", gr:"Řecko", hu:"Maďarsko", id:"Indonésie", ie:"Irsko", il:"Izrael", in:"Indie", it:"Itálie", jp:"Japonsko", ke:"Keňa", kp:"Severní Korea", kr:"Jižní Korea", mn:"Mongolsko", mx:"Mexiko", my:"Malajsie", nl:"Nizozemsko", no:"Norsko", nz:"Nový Zéland", pe:"Peru", ph:"Filipíny", pk:"Pákistán", pl:"Polsko", pt:"Portugalsko", ro:"Rumunsko", ru:"Rusko", sa:"Saúdská Arábie", se:"Švédsko", sk:"Slovensko", th:"Thajsko", tr:"Turecko", tw:"Tchaj-wan", ua:"Ukrajina", us:"USA", vn:"Vietnam", za:"Jihoafrická republika" };
  const COUNTRY_FLAG  = { ar:"🇦🇷", at:"🇦🇹", au:"🇦🇺", be:"🇧🇪", bg:"🇧🇬", br:"🇧🇷", ca:"🇨🇦", ch:"🇨🇭", cl:"🇨🇱", cn:"🇨🇳", cz:"🇨🇿", de:"🇩🇪", dk:"🇩🇰", ec:"🇪🇨", eg:"🇪🇬", es:"🇪🇸", fi:"🇫🇮", fj:"🇫🇯", fr:"🇫🇷", ga:"🇬🇦", gb:"🇬🇧", gr:"🇬🇷", hu:"🇭🇺", id:"🇮🇩", ie:"🇮🇪", il:"🇮🇱", in:"🇮🇳", it:"🇮🇹", jp:"🇯🇵", ke:"🇰🇪", kp:"🇰🇵", kr:"🇰🇷", mn:"🇲🇳", mx:"🇲🇽", my:"🇲🇾", nl:"🇳🇱", no:"🇳🇴", nz:"🇳🇿", pe:"🇵🇪", ph:"🇵🇭", pk:"🇵🇰", pl:"🇵🇱", pt:"🇵🇹", ro:"🇷🇴", ru:"🇷🇺", sa:"🇸🇦", se:"🇸🇪", sk:"🇸🇰", th:"🇹🇭", tr:"🇹🇷", tw:"🇹🇼", ua:"🇺🇦", us:"🇺🇸", vn:"🇻🇳", za:"🇿🇦" };
  const COUNTRY_CONT  = { ar:"samerica", at:"europe", au:"oceania", be:"europe", bg:"europe", br:"samerica", ca:"namerica", ch:"europe", cl:"samerica", cn:"asia", cz:"europe", de:"europe", dk:"europe", ec:"samerica", eg:"africa", es:"europe", fi:"europe", fj:"oceania", fr:"europe", ga:"africa", gb:"europe", gr:"europe", hu:"europe", id:"asia", ie:"europe", il:"asia", in:"asia", it:"europe", jp:"asia", ke:"africa", kp:"asia", kr:"asia", mn:"asia", mx:"namerica", my:"asia", nl:"europe", no:"europe", nz:"oceania", pe:"samerica", ph:"asia", pk:"asia", pl:"europe", pt:"europe", ro:"europe", ru:"asia", sa:"asia", se:"europe", sk:"europe", th:"asia", tr:"asia", tw:"asia", ua:"europe", us:"namerica", vn:"asia", za:"africa" };   // kontinent země
  // kontinenty jako u glóbu (i ty bez otázek — zobrazí se jako „Brzy")
  const CONTINENTS = [
    { id:"europe",     name:"Evropa",          emoji:"🏰" },
    { id:"asia",       name:"Asie",            emoji:"🐫" },
    { id:"africa",     name:"Afrika",          emoji:"🦁" },
    { id:"namerica",   name:"Severní Amerika", emoji:"🗽" },
    { id:"samerica",   name:"Jižní Amerika",   emoji:"🌴" },
    { id:"oceania",    name:"Austrálie",       emoji:"🐨" },
    { id:"antarctica", name:"Antarktida",      emoji:"🐧" },
  ];
  // sekce („specifikace") — pořadí a ikony jako u karet na glóbu
  // TENHLE SEZNAM MUSÍ POKRÝT VŠECHNY HODNOTY q.section v datech. Co v něm chybí,
  // výběr témat nenabídne a je to dosažitelné jen přes „Vybrat vše" — přesně tak
  // 2026-08-30 vyšlo najevo, že 536 otázek (každá sedmá) nešlo potkat vůbec.
  // Hlídá to `npm run test:offline`.
  // „Symboly" a „Zajímavosti" tu byly od 2026-08-30 do 2026-09-01; pak se rozpustily
  // zpátky mezi zbylých devět (scripts/merge-sections.js), protože to byly nejmenší
  // sekce fondu a „Zajímavosti" byla přiznaně sběrná škatulka.
  const SECTION_ORDER = ["Místa","Příroda","Lidé","Kultura & tradice","Umění","Sport","Jazyk & slova","Jídlo","Historie"];
  const SECTION_EMOJI = { "Místa":"📍","Příroda":"🌿","Lidé":"👥","Kultura & tradice":"🎭","Umění":"🎨","Sport":"🏆","Jazyk & slova":"🔤","Jídlo":"🍽️","Historie":"🏛️" };
  // slugy pro ilustrace (assets/section-{slug}.jpg) — obrázek nahradí emoji, jakmile existuje
  const SECTION_SLUG = { "Místa":"mista","Příroda":"priroda","Lidé":"lide","Kultura & tradice":"kultura","Umění":"umeni","Sport":"sport","Jazyk & slova":"jazyk","Jídlo":"jidlo","Historie":"historie" };
  // zobrazovaný název dlaždice/drobečku — jen kosmetika. Klíč "Místa" zůstává beze změny,
  // protože je to zároveň hodnota q.section u 1279 otázek napříč všemi zeměmi; přejmenovat
  // by se smělo jen tohle popisné jméno, ne samotný klíč, jinak dlaždice ztratí napojení na data.
  const SECTION_LABEL = { "Místa":"Co je kde" };
  // Jména pásem pro člověka. Dlaždice v renderStart je mají zapsaná zvlášť (jsou tam
  // i s popiskem a ilustrací), tohle je pro místa, kde se pásmo jen zmiňuje v textu.
  const BAND_NAMES = { deti:"děti", starsi:"puberťáci", dospeli:"dospělí" };

  // ---- autosave / rozehrané výpravy / wake lock / časomíra (Život u stolu) ----
  const SAVES_KEY = "hricka_quiz_saves";
  let wakeLock = null, timerHandle = null;
  function loadSaves(){ try { return JSON.parse(localStorage.getItem(SAVES_KEY)||"{}"); } catch(e){ return {}; } }
  // Dohrané hry maže clearSave(), opuštěné by se ale hromadily donekonečna (úvodní obrazovka
  // jich stejně ukazuje jen pár) — proto se při každém zápisu nechá jen SAVES_MAX nejnovějších.
  const SAVES_MAX = 10;
  function writeSaves(o){
    try {
      const stare = Object.keys(o).sort((a,b)=>(o[b].ts||0)-(o[a].ts||0)).slice(SAVES_MAX);
      for(const id of stare) delete o[id];
      localStorage.setItem(SAVES_KEY, JSON.stringify(o));
    } catch(e){}
  }
  function serializeState(){
    // `ccs` je seznam VŠECH vybraných zemí; `cc` je jen ta jediná, když je jediná.
    // Do 2026-09-01 se ukládalo pouze `cc` s fallbackem "ru" — jenže selectCountries()
    // nastavuje cc=null pokaždé, když je zemí víc, takže každá hra přes „Celý svět"
    // nebo „Všechny země" se uložila jako RUSKÁ. Při obnovení se fond postavil jen
    // z Ruska, žádné z uložených id se nenašlo (jsou prefixovaná zemí) a hra spadla
    // na `shuffle(data.questions)` — z desetiotázkové výpravy byla 154otázková ruská.
    return { mode:S.mode, school:!!S.school, band:S.band,
      cc:(S.sel&&S.sel.cc)||null, ccs:(S.sel&&S.sel.ccs)||null, section:(S.sel&&S.sel.section)||null,
      qLimit:S.qLimit, schoolLevel:S.schoolLevel,
      orderIds:S.order.map(q=>q.id), idx:S.idx, qServed:S.qServed,
      turn:S.turn, round:S.round, totalRounds:S.totalRounds, voice:S.voice, steal:S.steal, rotate:S.rotate, timer:S.timer||0,
      players:S.players.map(p=>({ name:p.name, band:p.band, color:p.color, side:p.side, score:p.score })) };
  }
  function autosave(){
    if(!S.saveId) return;
    const saves=loadSaves(), st=serializeState();
    // `meta` je zobrazovací projekce pro seznam rozehraných her — `state` má všechno,
    // ale sahat při vykreslování seznamu do celého stavu by znamenalo tahat i pole otázek.
    // `band` a `ccs` přibyly 2026-09-02 kvůli řádku „téma · pásmo · čas"; starší uložené
    // hry je v meta nemají, proto si je saveInfo() umí dobrat ze `state` (viz tam).
    saves[S.saveId] = { ts:Date.now(), meta:{ mode:st.mode, school:st.school, band:st.band, level:st.schoolLevel, cc:st.cc, ccs:st.ccs,
      section:st.section, players:st.players.map(p=>({name:p.name,color:p.color,band:p.band})),
      round:st.round, totalRounds:st.totalRounds, idx:st.idx, served:st.qServed, count:st.orderIds.length }, state:st };
    writeSaves(saves);
  }
  function clearSave(){ if(S.saveId){ const s=loadSaves(); delete s[S.saveId]; writeSaves(s); } S.saveId=null; }
  function newSave(){ S.saveId = "g"+Date.now()+"_"+Math.floor(Math.random()*1e4); }

  // Relativní čas je u rozehrané hry čitelnější než datum — u hry z dnešního odpoledne
  // nikoho nezajímá, kolikátého bylo. Nad týden se přepne na datum, protože „před 23 dny"
  // si už nikdo nepřevede. Skloňování jde přes plur() stejně jako jinde v appce.
  function relCas(ts){
    if(!ts) return "";
    const min = Math.floor((Date.now() - ts) / 60000);
    if(min < 1) return "právě teď";
    if(min < 60) return "před " + min + " " + plur(min, "minutou", "minutami", "minutami");
    const h = Math.floor(min / 60);
    if(h < 24) return "před " + h + " " + plur(h, "hodinou", "hodinami", "hodinami");
    const dny = Math.floor(h / 24);
    if(dny === 1) return "včera";
    if(dny < 7) return "před " + dny + " dny";
    return new Date(ts).toLocaleDateString("cs-CZ");
  }
  // Popisky úrovní školního režimu. Slovo je schválně TOTOŽNÉ s tlačítky v renderSchoolStart
  // („★ Lehká" / „★★ Střední" / „★★★ Vše") — učitel má v seznamu najít přesně to, co klikl.
  const SCHOOL_LEVELS = { 1:"★ Lehká", 2:"★★ Střední", 3:"★★★ Vše" };
  // Výčet do věty: „děti a dospělí", ne „děti, dospělí". Poslední spojka je „a".
  function vyctem(pole){
    if(pole.length < 2) return pole[0] || "";
    return pole.slice(0, -1).join(", ") + " a " + pole[pole.length - 1];
  }
  // ŽÁDNÝ TEXT V APPCE NEZAČÍNÁ MALÝM PÍSMENEM (pravidlo z 2026-09-01, znovu vymáháno
  // 2026-09-02). Platí i pro hodnotu za dvojtečkou — „Úroveň obtížnosti: děti" je taky
  // začátek textu, ne pokračování věty. Konstanty jako BAND_NAMES se ale kvůli tomu
  // NEPŘEPISUJÍ: uvnitř věty (partyOpakovaniNote: „Pásmo „děti" má…") tam malé patří.
  // Velké písmeno se proto nasazuje až při zobrazení, tady.
  function velke(t){ t = String(t || ""); return t ? t[0].toLocaleUpperCase("cs") + t.slice(1) : t; }
  // Popisky jedné položky v seznamu rozehraných her. Čte se primárně `meta`, ale `band`,
  // `ccs`, `level` a pásma hráčů tam přibyly až 2026-09-02 — u starších uložených her se
  // doberou ze `state`, jinak by měly řádek ochuzený, dokud by je hráč znovu neuložil.
  function saveInfo(rec){
    const m = rec.meta || {}, st = rec.state || {};
    const band = m.band || st.band || null;
    const ccs  = m.ccs  || st.ccs  || null;
    const cc   = m.cc   || st.cc   || null;
    const party = m.mode === "party";
    // Kde se hraje: jedna země má jméno i vlajku, víc zemí jen počet. Razítko se u víc
    // zemí sestavit NEDÁ — `assets/country-at,cz.jpg` je přesně ta chyba, co se
    // 2026-09-01 opravovala na obrazovce výběru témat.
    let kde, obr;
    if(cc){ kde = COUNTRY_BY_CC[cc] || cc; obr = "assets/country-" + cc + ".jpg"; }
    else if(ccs && ccs.length > 1){ kde = ccs.length + " " + plur(ccs.length, "země", "země", "zemí"); obr = "assets/cont-world.jpg"; }
    else { kde = "Celý svět"; obr = "assets/cont-world.jpg"; }
    // Řádek „Úroveň obtížnosti" se u KAŽDÉHO REŽIMU bere odjinud, protože každý se řídí
    // něčím jiným: párty má pásmo u každého hráče zvlášť (S.band je jen sólová volba,
    // jedno jméno by lhalo), a škola pásmo nepoužívá vůbec — filtruje podle `schoolLevel`
    // (startSchool), takže by tam zděděná hodnota z posledního sóla přímo lhala.
    // Rozhoduje PŘÍTOMNOST PÁSMA, ne počet hráčů: starší uložené párty mají v `meta.players`
    // jen jméno a barvu (`band` tam přibyl 2026-09-02), takže test na délku by je propustil
    // a párty z té doby by hlásila „různá podle hráče", i když se pásma dají zjistit ze `state`.
    const hraciMeta = m.players || [], hraciSt = st.players || [];
    const hraci = (hraciMeta.some(p => p.band) || !hraciSt.length) ? hraciMeta : hraciSt;
    // Seřazeno podle VĚKU (pořadí klíčů v BAND_NAMES), ne podle pořadí u stolu — jinak
    // by tentýž stůl vypsal pásma pokaždé jinak podle toho, kdo se zapsal první.
    const poradi = Object.keys(BAND_NAMES);
    const klic = b => (poradi.indexOf(b) < 0 ? poradi.length : poradi.indexOf(b));
    const pasma = [...new Set(hraci.map(p => p.band).filter(Boolean))]
      .sort((a, b) => klic(a) - klic(b)).map(b => BAND_NAMES[b] || b);
    const uroven = m.level || st.schoolLevel || 3;
    const rezim = party ? ("Párty (" + hraci.length + " " + plur(hraci.length, "hráč", "hráči", "hráčů") + ")")
                        : (m.school ? "Škola" : "Sólo");
    return {
      obr, party,
      // Hodnoty jdou přes velke(): za dvojtečkou začíná text, ne pokračuje věta.
      // „Co jsi hrál" musí odpovědět celou větou: v jakém režimu, kde a na jaké téma.
      coHral: velke([rezim, kde, sectionLabel(m.section, "Všechna témata")].join(" · ")),
      uroven: velke(party    ? (vyctem(pasma) || "různá podle hráče")
                  : m.school ? (SCHOOL_LEVELS[uroven] || SCHOOL_LEVELS[3])
                  : ((band && (BAND_NAMES[band] || band)) || "neuvedena")),
      postup: party ? ("Kolo " + (m.round || 1) + "/" + (m.totalRounds || 5))
                    : ("Otázka " + ((m.idx || 0) + 1) + "/" + (m.count || 0)),
      kdy: velke(relCas(rec.ts) || "neznámo kdy"),
    };
  }
  async function resumeSave(id){
    const rec=loadSaves()[id]; if(!rec || !data) return;
    showHomeBtn(true);   // odsud vede „Domů" zpátky na výběr režimu, takže dává smysl
    const st=rec.state;
    // Starší uložené hry `ccs` nemají — u nich se bere `cc` a fallback zůstává "ru"
    // jako dřív, ať se aspoň otevřou. Nové hry `ccs` mají vždycky.
    const ccs = (st.ccs && st.ccs.length) ? st.ccs : [st.cc || "ru"];
    // selectCountries() umí obě větve (jedna země × víc zemí) včetně názvu, vlajky
    // a sloučení karet — ruční kopie té logiky sem byla přesně to, co se rozešlo.
    await selectCountries(ccs);
    S.sel.cont = S.sel.cc ? (COUNTRY_CONT[S.sel.cc] || "asia") : null;
    S.sel.section = st.section || null;
    applyPool();
    S.mode=st.mode; S.school=!!st.school; S.band=st.band||"dospeli";
    S.qLimit=st.qLimit||null; S.schoolLevel=st.schoolLevel||3;
    S.order=(st.orderIds||[]).map(qid=>data.questions.find(q=>q.id===qid)).filter(Boolean);
    if(!S.order.length) S.order=shuffle(data.questions);
    // Index MUSÍ do nové délky. Když z dat zmizí id (přejmenování, přeřazení sekcí),
    // filter(Boolean) pole zkrátí — a nezaříznutý S.idx pak v sólu ukáže na undefined
    // a renderQuestion() spadne na prázdnou obrazovku bez cesty ven. (2026-09-01)
    S.idx=Math.min(st.idx||0, Math.max(0, S.order.length-1));
    S.qServed=st.qServed||0; S.turn=st.turn||0; S.round=st.round||1; S.totalRounds=st.totalRounds||5;
    // hlas i steal jsou dočasně schované z UI (viz renderSetup) — starší uložená hra s
    // voice:true/steal:true by jinak dál mluvila / nabízela krádež bodů, aniž by šel přepínač vypnout
    S.voice=false; S.steal=false; S.rotate=st.rotate||"auto"; S.timer=st.timer||0; S.manualRot=null;
    S.players=(st.players||[]).map(p=>({...p})); if(!S.players.length) S.players=[{name:"Ty",band:S.band,color:COLORS[0],score:0,side:"dole"}];
    S.saveId=id;
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
    const quipText=pick((data.fondy&&data.fondy.timeout)||["Čas vypršel!"]);
    say(quipText); if(S.voice) speakTTS("Čas vypršel! "+quipText);
    revealPic();
    const box=body.querySelector("#qz-box");
    // Stejně jako answer(): možnosti zůstanou, jen se zvýrazní správná (čas vypršel, nikdo
    // nic nevybral). Dřív se čtyři odpovědi nahradily kompaktním boxem.
    const correctIdx = (S.answers||[]).indexOf(q.answer);
    box.querySelectorAll(".qz-a").forEach(btn => {
      const i = +btn.dataset.i; btn.disabled = true;
      if(i===correctIdx) btn.classList.add("ok");
    });
    const allowSteal = S.mode==="party" && S.steal && S.players.length>1;
    box.insertAdjacentHTML("beforeend", `
      <div class="qz-quipbox"><div class="qz-hl">čas</div><div class="qz-ht">„${esc(quipText)}"</div></div>
      ${allowSteal ? stealHtml(q, "__timeout__") : frowHtml(q)}`);
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
  // Malovaná akvarelová mapa světa, equirektangulární 1456×728 (od 2026-09-01; předtím
  // 1024×512 — ta je v gitu, zálohu do assets/ schválně nedávám, celá složka se kopíruje
  // do nasazení). Zálohu původního fotografického blue-marble drží assets/earth-bluemarble.jpg.
  // GEOGRAFIE MUSÍ SEDĚT, není to dekorace: `spinGlobeTo()` natáčí kouli na souřadnice
  // a značka `.qz-beacon` sedí napevno uprostřed rámu, takže posunutá pevnina = ukázaná
  // špatná země. Nová textura byla proti staré ověřena blokovou korelací masek souše
  // (medián odchylky 1,5° délky a 1° šířky, tj. ~4 px na glóbu při značce široké 13 px).
  const EARTH_TEX = "assets/earth.jpg";
  // CSS animace řeší @media (prefers-reduced-motion), rotace glóbu je ale v JS — vypnout ji musíme tady
  const REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COUNTRY_LL = { ar:[-54.44,-25.7], at:[16.31,48.18], au:[134,-25], be:[4.47,50.85], bg:[23.32,42.7], br:[-60,-3], ca:[-79.07,43.08], ch:[7.45,46.95], cl:[-68.5,-24], cn:[103,35], cz:[14.4,50.09], de:[10.75,47.56], dk:[10,56], ec:[-90.97,-0.95], eg:[31.2,30], es:[2.17,41.4], fi:[26,64], fj:[178.4,-18.1], fr:[2.12,48.8], ga:[9.6,-2.2], gb:[-1.83,51.18], gr:[23.73,37.97], hu:[19.04,47.5], id:[110.2,-7.61], ie:[-8,53.3], il:[35.23,31.78], in:[79,21], it:[12.32,45.44], jp:[139.7,35.7], ke:[36.8,-1.3], kp:[128.08,41.99], kr:[126.98,37.58], mn:[106.92,47.92], mx:[-99.1,19.4], my:[101.71,3.16], nl:[4.9,52.37], no:[9.5,61], nz:[174.8,-41.3], pe:[-72.54,-13.16], ph:[121.14,16.93], pk:[74.32,31.59], pl:[19.94,50.06], pt:[-8,39.5], ro:[26.1,44.43], ru:[100,62], sa:[37.95,26.79], se:[18.3,57.64], sk:[17.1,48.14], th:[100.49,13.74], tr:[28.98,41.01], tw:[121.56,25.03], ua:[30.51,50.45], us:[-98.5,39.8], vn:[107.18,20.91], za:[24.7,-28.5] };   // přibližný střed země pro natočení
  let g3 = null;
  function initGlobe3d(){
    if(g3 || typeof THREE === "undefined") return;
    try {
      const cv=document.createElement("canvas"); cv.width=cv.height=460; cv.style.width="100%"; cv.style.height="100%"; cv.style.display="block";
      const renderer=new THREE.WebGLRenderer({ canvas:cv, antialias:true, alpha:true });
      renderer.setPixelRatio(1); renderer.setSize(460,460,false);   // přepočítá resizeGlobe() při vložení
      if(THREE.sRGBEncoding!==undefined) renderer.outputEncoding=THREE.sRGBEncoding;
      const scene=new THREE.Scene();
      // POZOR, tohle je jedna ze DVOU nezávislých pák a pletou se:
      //   - vzdálenost kamery = KOLIK SVĚTA je v rámu (2.3 ≈ ±31° oblouku),
      //   - velikost medailonu v quiz.css = jak velké je to všechno na obrazovce.
      // Zemi zvětšíš obojím, ale „glóbus je moc přiblížený" řeší jen tahle. Hodnota je
      // vyladěná mezi dvěma stížnostmi: na 2.25 byla země moc malá, na 1.95 byl záběr moc těsný —
      // vyřešeno tak, že záběr zůstal široký a zvětšil se místo toho medailon.
      const camera=new THREE.PerspectiveCamera(40, 1, 0.1, 100); camera.position.set(0,0,2.15);
      // malovaná textura → matně a rovnoměrně nasvícené (žádný lesk ani ostrý den/noc terminátor),
      // ať glóbus vypadá jako namalovaný papírový míč, ne naleštěná planeta
      scene.add(new THREE.AmbientLight(0xffffff,0.7));
      const key=new THREE.DirectionalLight(0xffffff,0.0); key.position.set(-1,0.5,1.1); camera.add(key); scene.add(camera);
      const tex=new THREE.TextureLoader().load(EARTH_TEX); if(THREE.sRGBEncoding!==undefined) tex.encoding=THREE.sRGBEncoding;
      // Anizotropní filtrování: u koule je textura na okrajích viděná hodně šikmo a bez
      // tohohle se tam slévá do kaše. Karta hodnotu stejně ořízne na to, co umí.
      try { tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); } catch(e){ /* starší three */ }
      const earth=new THREE.Mesh(new THREE.SphereGeometry(1,48,32), new THREE.MeshPhongMaterial({ map:tex, shininess:0 }));
      scene.add(earth);
      g3={ renderer, scene, camera, earth, canvas:cv, targetY:0, curY:0, targetX:0, curX:0, auto:false };
      (function loop(){ requestAnimationFrame(loop); if(!g3) return;
        if(REDUCED_MOTION){ g3.curY=g3.targetY; g3.curX=g3.targetX; }   // bez rotace, rovnou na místo
        else if(g3.auto) g3.curY += 0.0015;                  // klidová rotace (~70 s/otáčka)
        else g3.curY += (g3.targetY-g3.curY)*0.08;           // natočení na zemi otázky
        if(!REDUCED_MOTION) g3.curX += (g3.targetX-g3.curX)*0.08;
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
    g3.targetX=ll[1]*Math.PI/180;                        // plný náklon podle šířky, ať míří přesně na zemi
  }
  // Kreslicí plocha musí mít tolik pixelů, kolik jich displej skutečně zobrazí. Do
  // 2026-09-01 tu bylo natvrdo 460×460 s `setPixelRatio(1)`, takže na hustém displeji
  // (nebo při přiblížení prohlížeče, které v Chrome zvedá `devicePixelRatio`) prohlížeč
  // canvas nafukoval a glóbus byl měkký, aniž by za to mohla textura.
  //
  // POZOR NA PAST, na kterou jsem naletěl: první verze počítala jen `css × dpr`, což
  // při dpr 1 vyšlo 290 px — tedy MÍŇ než dosavadních 460. Naměřeno a vráceno. Těch
  // 460 nebylo omylem: canvas se kreslil ve větším rozlišení, než se zobrazoval, takže
  // se okraj koule a hrany pevnin převzorkovaly. Násobek 1,6 to zachovává a na hustém
  // displeji navíc přidá. Podlaha 460 zajistí, že to nikdy nespadne pod původní stav.
  // Strop 1024 px je z výkonu, ne z textury: v medailonu je vidět ~103° délky, což je
  // při textuře 1456 px na 360° zhruba 416 texturových pixelů — nad 1024 už se jen
  // zvětšuje. Textura 1456×728 není mocnina dvojky; ověřeno, že prohlížeč umí WebGL2,
  // kde to nevadí (ve WebGL1 by three vypnulo mipmapy a vynutilo clamp).
  function resizeGlobe(){
    if(!g3 || !g3.canvas) return;
    const host=g3.canvas.parentElement; if(!host) return;
    const css=host.clientWidth || 290;
    const px=Math.min(Math.max(Math.round(css * (window.devicePixelRatio||1) * 1.6), 460), 1024);
    if(px<=0 || g3.px===px) return;
    g3.px=px; g3.renderer.setSize(px, px, false);
  }
  window.addEventListener("resize", resizeGlobe);
  function mountGlobeMedal(cc){
    const medal=document.getElementById("qz-medal"); if(!medal) return;
    initGlobe3d();
    if(g3 && g3.canvas){ medal.innerHTML=""; medal.appendChild(g3.canvas); resizeGlobe(); spinGlobeTo(cc); }
    else { medal.innerHTML='<div class="land a"></div><div class="land b"></div>'; }   // fallback (Three.js chybí)
  }
  // úvodní obrazovka: velký glóbus v klidové rotaci za kartami režimů
  function mountGlobeBg(){
    const bg=document.getElementById("qz-globebg"); if(!bg) return;
    initGlobe3d();
    // Glóbus je sdílený singleton, takže se musí zhasnout zvýraznění z poslední otázky —
    // na rozcestníku nemá svítit žádná země.
    if(g3 && g3.canvas){ bg.innerHTML=""; bg.appendChild(g3.canvas); resizeGlobe(); g3.auto=true; g3.targetX=0.32; }
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

  // Odkazy zvenčí (?duel=… pozvánka na souboj, ?obnova=… reset PINu z e-mailu) míří na
  // tuhle stránku. Kdo po nich přijde, musí skončit rovnou tam, kam mířil — ne na
  // rozcestníku, kde by o výzvě ani o obnově nevěděl.
  function open(){ ensureData().then(()=>{
    document.body.style.overflow="hidden"; root.classList.remove("qz-hidden");
    const _p = new URLSearchParams(location.search);
    if((_p.get("duel") || _p.get("obnova")) && window.ZKOnline){
      showHomeBtn(true); window.ZKOnline.open(renderModePick); return;
    }
    renderModePick();
  }); }
  // ZKOnline.stopAll() je tu nutnost, ne úklid navíc: online režim si drží vlastní časovač
  // otázky a dotazování na soupeře. Bez tohohle volání běžely dál nad odpojeným DOMem a po
  // vypršení limitu odeslaly odpověď a překreslily rozcestník, který hráč mezitím otevřel.
  // `qz-school` se MUSI sundat i tady. Pridava ji startSchool() a odebiraji jen
  // startGame()/startParty()/resumeSave() — po sekvenci skola -> "x" -> Svetova liga
  // tedy zustavala na shellu a online otazka se kreslila v promitacim pismu, protoze
  // online recykluje presne ty tridy, ktere .qz-school zvetsuje (.qz-q, .qz-a, .qz-meta,
  // .qz-picframe). Offline se to neprojevilo, protoze solo i party ji pri startu sundaji.
  function close(){ stopTTS(); clearTimer(); releaseWake(); if(window.ZKOnline && window.ZKOnline.stopAll) window.ZKOnline.stopAll();
    document.getElementById("qz-shell").classList.remove("qz-school");
    renderModePick(); }

  // Odpovídání z klávesnice: 1–4 nebo A–D, Enter/mezera posune dál. Bez toho šlo hrát
  // jen myší nebo protabováním čtyř tlačítek u každé otázky. Ve školním režimu, kde se
  // hra promítá a ovládá se od katedry, je to rozdíl mezi použitelným a nepoužitelným.
  document.addEventListener("keydown", e => {
    if(e.ctrlKey || e.altKey || e.metaKey) return;
    const cil = e.target;
    if(cil && (cil.tagName === "INPUT" || cil.tagName === "TEXTAREA" || cil.tagName === "SELECT" || cil.isContentEditable)) return;
    const box = body.querySelector("#qz-box"); if(!box) return;

    if(e.key === "Enter" || e.key === " "){
      // dál se posouvá jen tehdy, když už je odpovězeno — jinak by mezera omylem přeskočila otázku
      const dal = body.querySelector("#qz-next");
      if(dal && S.answered){ e.preventDefault(); dal.click(); }
      return;
    }
    let i = -1;
    if(/^[1-4]$/.test(e.key)) i = +e.key - 1;
    else { const p = "abcd".indexOf(e.key.toLowerCase()); if(p >= 0) i = p; }
    if(i < 0) return;
    const btn = box.querySelectorAll(".qz-a")[i];
    if(btn && !btn.disabled){ e.preventDefault(); btn.click(); }
  });
  // „×" je Domů a vrací na výběr režimu — na něm samotném by tedy jen překreslil tutéž obrazovku.
  // Ven z appky vést nemůže: landing.html je zrušená a hra.html je sama domovská stránka
  // (viz komentář na začátku souboru a CLAUDE.md 2026-08-13). Proto se právě tam schovává.
  // Kdyby appka někdy rozcestník zase dostala, stačí tohle volání zrušit.
  function showHomeBtn(on){ if(closeBtn) closeBtn.style.display = on ? "" : "none"; }

  // ---- výběr režimu ----
  function renderModePick(){
    say("Vítejte, cestovatelé! Jak si dnes zahrajeme?");
    showHomeBtn(false);
    document.getElementById("qz-shell").style.transform="";
    // Bez stropu: writeSaves() drží nejvýš SAVES_MAX her a pop-up má vlastní scroll,
    // takže seznam ukáže všechny. Dřív jich brala jen první čtyři — zbylých šest se
    // sice ukládalo, ale hráč se k nim nedostal a vypadalo to, že se hra ztratila.
    const saves=loadSaves(); const ids=Object.keys(saves).sort((a,b)=>saves[b].ts-saves[a].ts);
    const hasSaves = ids.length > 0;
    // Každý řádek má vlastní popisek s dvojtečkou. Úsporná verze („Česko · Sólo" nad
    // „Všechna témata · děti · včera") vypadala líp, ale u deseti podobných her z ní
    // nešlo poznat, co která je — a co znamená který údaj, se dalo jen hádat.
    const resumeItems = ids.map(id=>{ const s=saveInfo(saves[id]);
        const radek = (popis, hodnota) => `<span class="qz-resume-row"><i>${popis}:</i> ${esc(hodnota)}</span>`;
        // Avatary dávají smysl jen u párty. V sólu je hráč vždycky jeden („Ty"), takže
        // by to bylo pořád stejné kolečko s „T" u každé položky.
        const faces = s.party ? `<span class="qz-resume-faces">${(saves[id].meta.players||[]).map(p=>
            `<span class="qz-face" style="background:${p.color}">${esc((p.name||"?")[0])}</span>`).join("")}</span>` : "";
        return `<div class="qz-resume-item" role="button" tabindex="0" aria-label="Pokračovat ve hře: ${esc(s.coHral)}" data-resume="${id}">
          <img class="qz-resume-img" src="${s.obr}" alt="" onerror="this.style.visibility='hidden'">
          <span class="qz-resume-text">
            ${radek("Co jsi hrál", s.coHral)}
            ${radek("Úroveň obtížnosti", s.uroven)}
            ${radek("Kdy", s.kdy)}
          </span>
          ${faces}
          <span class="qz-resume-prog">${esc(s.postup)}</span>
          <button class="qz-resume-del" data-del="${id}" title="Smazat hru">✕</button></div>`; }).join("");
    // Rozehrané hry se neukazují přímo — jen tlačítko, které otevře pop-up (modal) se seznamem.
    const resumeBtn = hasSaves ? `<button class="qz-resume-open" id="qz-resume-open"><img class="qz-ico-resume" src="assets/ico-resume.png" alt=""> Rozehrané hry</button>` : "";
    const resumeModal = hasSaves ? `<div class="qz-modal" id="qz-resume-modal" hidden>
      <div class="qz-modal-backdrop" data-close="1"></div>
      <div class="qz-modal-panel" role="dialog" aria-modal="true" aria-label="Rozehrané hry">
        <div class="qz-modal-head"><span><img class="qz-ico-resume" src="assets/ico-resume.png" alt=""> Rozehrané hry</span><button class="qz-modal-close" data-close="1" title="zavřít">✕</button></div>
        <div class="qz-modal-body">${resumeItems}</div>
      </div></div>` : "";
    body.innerHTML = `<div class="qz-screen qz-modepick">
      <!-- Glóbus je SOUROZENEC NADPISU uvnitř .qz-titlewrap, ne volně v obrazovce.
           Volně musel mít posun vázaný na výšku obsahu, a ta se mezi desktopem
           a telefonem liší dvojnásobně (dlaždice 2x2 vs. pod sebou), takže se glóbus
           na mobilu sesunul za první kartu. Uvnitř obalu se centruje na nadpis sám
           a žádné číslo se ladit nemusí. POZOR: tenhle komentář je uvnitř template
           literalu, takže v něm NESMÍ být zpětné apostrofy — ukončily by řetězec. -->
      <div class="qz-titlewrap">
        <div class="qz-globebg" id="qz-globebg"></div>
        <h2>Zeměkvíz</h2>
      </div>
      <div class="qz-modes">
        <!-- Pořadí: Online první, Škola poslední (2026-08-31). Online je jediný režim,
             kde na hráče někdo čeká, takže patří dopředu; škola je nejužší případ užití.
             Bot se v popisku NEZMIŇUJE — je to náhradní řešení pro prázdnou frontu,
             ne důvod, proč sem jít. -->
        ${window.ZKOnline ? `<button class="qz-mode" id="qz-mode-online"><div class="ic"><img class="ic-img" src="assets/mode-online.jpg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${ICO_SOLO}</span></div><div class="t">Světová liga</div><div class="d">Rychlé souboje o rating. Zatím hlavně z Česka.</div></button>` : ""}
        <button class="qz-mode" id="qz-mode-solo"><div class="ic"><img class="ic-img" src="assets/mode-solo.jpg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${ICO_SOLO}</span></div><div class="t">Sólo jízda</div><div class="d">Nikdo nezmerčí, kde máš slabá místa...</div></button>
        <button class="qz-mode" id="qz-mode-party"><div class="ic"><img class="ic-img" src="assets/mode-party.jpg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${ICO_PARTY}</span></div><div class="t">Párty souboj</div><div class="d">Pro 2 až 6 hráčů. Vyhrává ten chytrej.</div></button>
        <button class="qz-mode" id="qz-mode-school"><div class="ic"><img class="ic-img" src="assets/mode-school.jpg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${ICO_SCHOOL}</span></div><div class="t">Škola hrou</div><div class="d">Třída hádá. Aspoň jeden musí něco vědět...</div></button>
      </div>
      ${resumeBtn}${resumeModal}
    </div>`;
    body.querySelector("#qz-mode-solo").addEventListener("click", () => beginPick("solo"));
    body.querySelector("#qz-mode-party").addEventListener("click", () => beginPick("party"));
    body.querySelector("#qz-mode-school").addEventListener("click", () => beginPick("school"));
    // Online si přebírá #qz-body sám a vrátí ho zpátky přes callback (viz online.js).
    const onlineBtn = body.querySelector("#qz-mode-online");
    if(onlineBtn) onlineBtn.addEventListener("click", () => { showHomeBtn(true); window.ZKOnline.open(renderModePick); });
    const openBtn = body.querySelector("#qz-resume-open");
    const modal = body.querySelector("#qz-resume-modal");
    if(openBtn && modal){
      openBtn.addEventListener("click", () => { modal.hidden = false; });
      modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", () => { modal.hidden = true; }));
    }
    body.querySelectorAll(".qz-resume-item").forEach(it => {
      it.addEventListener("click", e => {
        if(e.target.closest(".qz-resume-del")) return;
        resumeSave(it.dataset.resume);
      });
      // Klávesnice: Enter/mezera pokračuje ve hře. Položka je <div> (nese vnořený křížek,
      // takže nejde <button>), proto role="button" + tabindex + tenhle handler.
      it.addEventListener("keydown", e => {
        if((e.key === "Enter" || e.key === " ") && !e.target.closest(".qz-resume-del")){
          e.preventDefault();
          resumeSave(it.dataset.resume);
        }
      });
    });
    body.querySelectorAll(".qz-resume-del").forEach(d => d.addEventListener("click", e => {
      e.stopPropagation();
      const s=loadSaves(); delete s[d.dataset.del]; writeSaves(s);
      const row=d.closest(".qz-resume-item"); if(row) row.remove();
      // poslední smazána → zavřít pop-up a schovat tlačítko (žádné rozehrané hry nezbyly)
      if(modal && !modal.querySelector(".qz-resume-item")){ modal.hidden = true; if(openBtn) openBtn.remove(); }
    }));
    mountGlobeBg();
  }

  // ---- výběr tématu: kontinent → země → sekce (jako u glóbu) ----
  function plur(n, one, few, many){ n=Math.abs(n); if(n===1) return one; if(n>=2&&n<=4) return few; return many; }
  function pointsLabel(n){ return `Získáváš ${n} ${plur(n,"bod","body","bodů")}`; }
  // pásmový fond otázek (kids -> q.kids, puberťáci -> !kids && difficulty<=2, dospělí -> !kids)
  // POZOR: `data.questions` je fond UŽ ZÚŽENÝ výběrem země a tématu (applyPool), ne celý
  // repertoár. Do 2026-09-04 měla každá větev `if(f.length) pool=f`, tedy tichý fallback
  // na nefiltrovaný fond, když v tom výběru pásmo nemělo ani jednu otázku. To není vzácný
  // případ: 203 z 495 kombinací země × sekce nemá jedinou dětskou otázku, takže dítě, které
  // si vybralo třeba Rakousko → Sport, dostalo otázky psané pro dospělé — přesně to, co se
  // opravovalo 2026-08-24, jen jinými dveřmi. Fond teď říká PRAVDU (klidně prázdno)
  // a volající to musí ošetřit; hráči se to řekne na startovní obrazovce.
  function bandPool(band){
    let pool = data.questions;
    if(band==="deti"){ pool = pool.filter(q=>q.kids); }
    else if(band==="starsi"){ pool = pool.filter(q=>!q.kids && (q.difficulty||1)<=2); }
    // Dospělí dřív brali „vše" — to dávalo smysl, dokud byly dětské otázky pilotní dávka
    // o dvanácti kusech. Po dorovnání dětské kategorie jich je 837 z 2806, takže by dospělému
    // vycházela skoro každá třetí otázka psaná pro osmileté. Catch-all větev (ne `band==="dospeli"`)
    // schválně: i při neznámé hodnotě pásma je správnější dětské otázky vynechat než přidat.
    else { pool = pool.filter(q=>!q.kids); }
    return pool;
  }
  // Body za správnou odpověď. V párty hraje každý ve svém pásmu (viz buildPartyOrder), takže
  // absolutní obtížnost otázek není mezi hráči srovnatelná — dětská otázka má vždy difficulty 1
  // a dospělácká 3, takže by dítě mělo strop 100 bodů proti 300 u dospělého a nemohlo by vyhrát.
  // Proto má v párty každá správná odpověď stejnou cenu a soutěží se v počtu trefených otázek;
  // odstupňování obtížnosti zůstává sólu a škole, kde se hraje z jednoho fondu a nikdo se neporovnává.
  const PARTY_POINTS = 100;
  function qPoints(q){ return S.mode==="party" ? PARTY_POINTS : (q.difficulty||1)*100; }
  // Hvězdičky měří obtížnost uvnitř obecného fondu psaného pro dospělé. Na dětské otázky ta škála
  // neplatí — všech 837 jich má difficulty 1, takže hvězdička u nich byla vždycky jedna a stejná:
  // nenesla žádnou informaci a přitom budila dojem známky na společné škále („★ lehká" u otázky,
  // která není lehká otázka pro dospělé, ale otázka z jiného fondu). Proto štítek místo hvězdiček.
  function diffHtml(q){
    if(q.kids) return `<span class="qz-diff qz-diff-kids" title="Otázka z dětského fondu"><i>Pro děti</i></span>`;
    const d = q.difficulty||1, lbl = DIFF_LABEL[d]||"Těžká";
    return `<span class="qz-diff" title="Obtížnost: ${lbl}">${ICO_STAR_DIFF.repeat(d)}<i>${lbl}</i></span>`;
  }
  // nabídka „kolik otázek" — pevné kotvy 10/15/20, jen pokud se do fondu vejdou;
  // je-li fond menší než nejmenší kotva, nabídne se aspoň celý fond
  // Párty: každý hráč dostane `totalRounds` otázek ze SVÉHO pásma (buildPartyOrder drží
  // frontu na pásmo). Když je fond pásma menší než počet kol, fronta se domíchá znovu
  // a otázky se hráči zopakují. Sólo tenhle problém nemá — qLimitOptions nabídne jen počty,
  // které se do fondu vejdou. Párty má kola pevná (3/5/8), takže se to musí aspoň přiznat.
  // Pásma hráčů u stolu, která v tomhle výběru nemají ANI JEDNU otázku. Dřív to
  // `bandPool` zamaskoval fondem jiného pásma; bez toho by fronta obsahovala undefined
  // a hra by spadla na první otázce, tak se start rovnou zablokuje.
  function prazdnaPasmaParty(){
    return [...new Set(S.players.map(p => p.band || "dospeli"))].filter(b => !bandPool(b).length);
  }
  function partyPrazdnoNote(){
    const p = prazdnaPasmaParty();
    if(!p.length) return "";
    const jmena = p.map(b => `„${esc(BAND_NAMES[b]||b)}"`).join(" a ");
    return `<div class="qz-setnote">Pro ${p.length===1?"pásmo":"pásma"} ${jmena} tu u téhle volby ` +
           `${p.length===1?"není":"nejsou"} žádné otázky. Přidej téma nebo zemi, nebo hráči přepni pásmo.</div>`;
  }
  // Vybraná země a téma nemusí mít v hráčově pásmu ani jednu otázku (203 z 495 kombinací
  // nemá dětskou). Dřív to appka schovala tím, že podstrčila fond jiného pásma; teď to
  // řekne a nabídne cestu ven — start je do té doby zablokovaný (viz bandPool).
  function prazdnoNote(total){
    if(total || !S.bandTouched) return "";
    return `<p class="qz-setnote">Pro pásmo „${esc(BAND_NAMES[S.band]||S.band)}" tu nemáme ani jednu otázku. ` +
           `Zkus jiné pásmo, přidej téma nebo zemi — drobečky nahoře tě vezmou zpátky.</p>`;
  }
  function partyOpakovaniNote(){
    if(!data || !data.questions) return "";
    const pasma = [...new Set(S.players.map(p => p.band || "dospeli"))];
    const tesna = pasma.map(b => ({ b, n: bandPool(b).length })).filter(x => x.n < S.totalRounds);
    if(!tesna.length) return "";
    const t = tesna.sort((a,b)=>a.n-b.n)[0];
    return `<div class="qz-setnote">Pásmo „${esc(BAND_NAMES[t.b]||t.b)}" má u téhle volby jen ${t.n} ${plur(t.n,"otázku","otázky","otázek")} — ` +
           `v ${S.totalRounds} kolech se některé zopakují. Kratší hra nebo víc zemí to spraví.</div>`;
  }
  function qLimitOptions(total){
    const opts = [10,15,20].filter(n => n <= total).map(n => ({label:n+" otázek", n}));
    if(!opts.length) opts.push({label:total+" "+plur(total,"otázka","otázky","otázek"), n: total});
    return opts;
  }
  const MODE_LABEL = { solo:"Sólo", party:"Párty", school:"Škola" };
  function beginPick(mode){ S.pickMode=mode; S.sel={}; showHomeBtn(true); renderContinentPick(); }
  // `section` má tři podoby: null nebo „__all__" (vše), pole vybraných, nebo jeden název.
  // `vse` je popisek pro první případ — drobečková lišta chce úsporné „Vše", seznam
  // rozehraných her potřebuje větu, ze které je poznat, že jde o téma.
  function sectionLabel(s, vse){
    if(!s || s==="__all__") return vse || "Vše";
    if(Array.isArray(s)) return s.length===1 ? (SECTION_LABEL[s[0]]||s[0]) : s.length+" "+plur(s.length,"téma","témata","témat");
    return SECTION_LABEL[s]||s;
  }
  function selSectionLabel(){ return sectionLabel(S.sel&&S.sel.section); }
  function contsLabel(){
    const contsArr = (S.sel && S.sel.conts) || [];
    const contNames = contsArr.map(id => { const c = CONTINENTS.find(x=>x.id===id); return c ? c.name : id; });
    return contsArr.length === 1 ? contNames[0] : contsArr.length + " " + plur(contsArr.length, "kontinent", "kontinenty", "kontinentů");
  }
  function pickHeadHtml(steps){
    const modeTag = MODE_LABEL[S.pickMode] ? `<span class="qz-mode-tag">${MODE_LABEL[S.pickMode]}</span>` : "";
    const crumbs = steps.map((s,i) => s.fn
      ? `<button type="button" class="qz-crumb" data-ci="${i}">${esc(s.label)}</button>`
      : `<b>${esc(s.label)}</b>`
    ).join(' <span class="qz-crumb-sep">›</span> ');
    return `<div class="qz-pickhead"><button class="qz-back" id="qz-back">${handArrowSvg(true)} Zpět</button>
      ${modeTag}
      <div class="qz-crumbs" id="qz-crumbs">${crumbs}</div></div>`;
  }
  function bindPickHead(steps){
    document.querySelectorAll("#qz-crumbs [data-ci]").forEach(btn => {
      const s = steps[+btn.dataset.ci];
      if(s && s.fn) btn.addEventListener("click", s.fn);
    });
    positionPickHead();
  }
  // Host (avatar+bublina) je ukotvený k celé šířce shellu (position:absolute), zatímco
  // obsah obrazovky žije ve vystředěném sloupci #qz-body — na širokém plátně (nad 980px)
  // se tak jejich levé okraje rozjedou. Lišta „zpět / TAG / drobečky" je proto taky
  // ukotvená k shellu (viz CSS) a sem se jí podle SKUTEČNÉHO rozměru bubliny (mění se
  // text od textu) dopočítá left/top, aby seděla přesně pod ní, ne pod avatarem.
  function positionPickHead(){
    const head = document.querySelector(".qz-pickhead");
    const bubble = document.getElementById("qz-host-bubble");
    const hostEl = document.getElementById("qz-host");
    const shellEl = document.getElementById("qz-shell");
    if(!head || !bubble || !hostEl || !shellEl) return;
    // pod 768px se bublina schovává (viz CSS) a má nulový rozměr — pak se ukotví
    // pod celého hostitele (avatar), ne pod bublinu, která tam fakticky není
    const bubbleVisible = getComputedStyle(bubble).display !== "none";
    const ref = bubbleVisible ? bubble.getBoundingClientRect() : hostEl.getBoundingClientRect();
    const shellRect = shellEl.getBoundingClientRect();
    head.style.left = Math.round(ref.left - shellRect.left) + "px";
    head.style.top = Math.round(ref.bottom - shellRect.top + 24) + "px";
  }
  window.addEventListener("resize", positionPickHead);
  function tileHtml(o){ // {ic,img,t,sub,soon,attr,selectable,sel}
    const soon = o.soon ? " soon" : "";
    const sel = o.sel ? " sel" : "";
    const icInner = o.img
      ? `<img class="ic-img" src="${o.img}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="ic-fb" style="display:none">${o.ic}</span>`
      : o.ic;
    const check = o.selectable ? `<span class="qz-tile-check">${checkSvg()}</span>` : "";
    return `<button class="qz-tile${soon}${sel}" ${o.attr||""} ${o.soon?"disabled":""}>
      ${o.soon?`<span class="qz-tbadge">Brzy</span>`:""}
      <span class="qz-tile-ic">${icInner}${check}</span>
      <span class="qz-tile-t">${esc(o.t)}</span>
      ${o.sub?`<span class="qz-tile-sub">${esc(o.sub)}</span>`:""}</button>`;
  }

  function renderContinentPick(){
    say("Kam se vydáme? Vyber kontinent.");
    document.getElementById("qz-shell").style.transform="";
    const availConts = CONTINENTS.filter(c => contHasQuestions(c.id));
    const tiles = CONTINENTS.map(c => {
      const has = contHasQuestions(c.id);
      const n = countriesInCont(c.id).filter(cc=>qsForCc(cc).length>0).length;
      return tileHtml({ ic:c.emoji, img:`assets/cont-${c.id}.jpg`, t:c.name, sub: has ? (n+" "+plur(n,"země","země","zemí")) : "Připravujeme",
        soon:!has, selectable:true, attr:`data-cont="${c.id}"` });
    }).join("");
    const worldN = availConts.reduce((sum,c)=> sum + countriesInCont(c.id).filter(cc=>qsForCc(cc).length>0).length, 0);
    const worldTile = tileHtml({ ic:"🌍", img:"assets/cont-world.jpg", t:"Celý svět", selectable:true,
      sub: worldN+" "+plur(worldN,"země","země","zemí"), attr:`data-cont="__all__"` });
    const steps = [{label:"Kontinent"}];
    body.innerHTML = `<div class="qz-screen qz-pick">
      ${pickHeadHtml(steps)}
      <h2>Vyber kontinent</h2>
      <div class="qz-tiles">${worldTile}${tiles}</div>
      <div class="qz-sec-confirm"><button class="qz-btn-start" id="qz-cont-start" disabled>Pokračuj ${handArrowSvg(false)}</button></div>
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", renderModePick);
    bindPickHead(steps);
    const selected = new Set();
    const startBtn = body.querySelector("#qz-cont-start");
    const goNext = () => {
      if(!selected.size) return;
      const conts = selected.has("__all__") ? availConts.map(c=>c.id) : [...selected];
      renderCountryPick(conts);
    };
    body.querySelectorAll(".qz-tile[data-cont]:not(.soon)").forEach(b => {
      b.addEventListener("click", () => {
        const cont = b.dataset.cont;
        if(cont === "__all__"){
          if(selected.has("__all__")){ selected.clear(); b.classList.remove("sel"); startBtn.disabled = true; return; }
          // "Celý svět" nejde kombinovat s ničím jiným — klik je kompletní rozhodnutí,
          // takže rovnou pokračuje dál, bez čekání na tlačítko Pokračuj
          selected.clear(); body.querySelectorAll(".qz-tile.sel").forEach(t=>t.classList.remove("sel")); selected.add("__all__"); b.classList.add("sel");
          goNext();
          return;
        } else {
          if(selected.has("__all__")){ selected.delete("__all__"); body.querySelector(".qz-tile[data-cont='__all__']")?.classList.remove("sel"); }
          if(selected.has(cont)){ selected.delete(cont); b.classList.remove("sel"); }
          else { selected.add(cont); b.classList.add("sel"); }
        }
        startBtn.disabled = selected.size === 0;
      });
    });
    startBtn.addEventListener("click", goNext);
  }

  function renderCountryPick(conts){
    const contsArr = Array.isArray(conts) ? conts : [conts];
    S.sel = S.sel || {}; S.sel.conts = contsArr;
    const contLabel = contsLabel();
    say("A do které země?");
    document.getElementById("qz-shell").style.transform="";
    const ccList = contsArr.flatMap(cont => countriesInCont(cont));
    const hasSome = ccList.some(cc => qsForCc(cc).length > 0);
    const ccWithQ = ccList.filter(cc => qsForCc(cc).length > 0);
    const allTotal = ccWithQ.reduce((sum,cc) => sum + qsForCc(cc).length, 0);
    const allCcTile = hasSomeTile => hasSomeTile ? tileHtml({ ic:"🌍", img:"assets/country-all.jpg", t:"Všechny země", selectable:true,
      sub: allTotal+" "+plur(allTotal,"otázka","otázky","otázek"), attr:`data-cc="__all__"` }) : "";
    const tiles = ccList.length ? ccList.map(cc => {
      const n = qsForCc(cc).length;
      return tileHtml({ ic:COUNTRY_FLAG[cc]||"🏳️", img:`assets/country-${cc}.jpg`, t:COUNTRY_BY_CC[cc]||cc,
        sub: n ? (n+" "+plur(n,"otázka","otázky","otázek")) : "Brzy otázky",
        soon:!n, selectable:true, attr:`data-cc="${cc}"` });
    }).join("") : `<div class="qz-pick-empty">Tady zatím žádné země nejsou — brzy.</div>`;
    const steps = [{label:contLabel, fn:renderContinentPick}, {label:"Země"}];
    body.innerHTML = `<div class="qz-screen qz-pick">
      ${pickHeadHtml(steps)}
      <h2>${esc(contLabel)} | Vyber země</h2>
      <!-- qz-tiles-cc: jediná mřížka v appce, která má desítky dlaždic (56 zemí).
           Na širokém monitoru se kvůli tomu rozšiřuje víc než ostatní obrazovky. -->
      <div class="qz-tiles qz-tiles-cc">${allCcTile(hasSome)}${tiles}</div>
      ${hasSome ? `<div class="qz-sec-confirm"><button class="qz-btn-start" id="qz-cc-start" disabled>Pokračuj ${handArrowSvg(false)}</button></div>` : ""}
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", renderContinentPick);
    bindPickHead(steps);
    const selected = new Set();
    const startBtn = body.querySelector("#qz-cc-start");
    const goNext = async () => {
      if(!selected.size) return;
      const ccs = selected.has("__all__") ? ccWithQ : [...selected];
      await selectCountries(ccs);
      renderSectionPick();
    };
    body.querySelectorAll(".qz-tile[data-cc]:not(.soon)").forEach(b => {
      b.addEventListener("click", () => {
        const cc = b.dataset.cc;
        if(cc === "__all__"){
          if(selected.has("__all__")){ selected.clear(); b.classList.remove("sel"); if(startBtn) startBtn.disabled = true; return; }
          // "Všechny země" nejde kombinovat s ničím jiným — klik je kompletní rozhodnutí,
          // takže rovnou pokračuje dál, bez čekání na tlačítko Pokračuj
          selected.clear(); body.querySelectorAll(".qz-tile.sel").forEach(t=>t.classList.remove("sel")); selected.add("__all__"); b.classList.add("sel");
          goNext();
          return;
        } else {
          if(selected.has("__all__")){ selected.delete("__all__"); body.querySelector(".qz-tile[data-cc='__all__']")?.classList.remove("sel"); }
          if(selected.has(cc)){ selected.delete(cc); b.classList.remove("sel"); }
          else { selected.add(cc); b.classList.add("sel"); }
        }
        if(startBtn) startBtn.disabled = selected.size === 0;
      });
    });
    if(startBtn) startBtn.addEventListener("click", goNext);
  }

  function renderSectionPick(){
    const cc = S.sel.ccs || S.sel.cc;
    say(`${COUNTRY} — na co máš dnes chuť?`);
    document.getElementById("qz-shell").style.transform="";
    const all = qsForCc(cc);
    const bySec = {}; for(const q of all){ const s=q.section||"—"; (bySec[s]=bySec[s]||[]).push(q); }
    const secTiles = SECTION_ORDER.map(s => {
      const n = (bySec[s]||[]).length;
      return tileHtml({ ic:SECTION_EMOJI[s]||"•", img:`assets/section-${SECTION_SLUG[s]||"x"}.jpg`, t:SECTION_LABEL[s]||s,
        sub: n ? (n+" "+plur(n,"otázka","otázky","otázek")) : "—",
        soon:!n, selectable:true, attr:`data-sec="${esc(s)}"` });
    }).join("");
    const allTile = tileHtml({ ic:"🎲", img:"assets/section-vse.jpg", t:"Vybrat vše", selectable:true,
      sub: all.length+" "+plur(all.length,"otázka","otázky","otázek"), attr:`data-sec="__all__"` });
    const backToCountry = () => renderCountryPick(S.sel.conts || [S.sel.cont]);
    const steps = [{label:contsLabel(), fn:renderContinentPick}, {label:COUNTRY, fn:backToCountry}, {label:"Téma"}];
    body.innerHTML = `<div class="qz-screen qz-pick">
      ${pickHeadHtml(steps)}
      <h2>${(S.sel&&S.sel.cc) ? flagStamp(S.sel.cc)+" " : ""}${esc(COUNTRY)} | Vyber témata</h2>
      <div class="qz-tiles qz-tiles-sec">${allTile}${secTiles}</div>
      <div class="qz-sec-confirm"><button class="qz-btn-start" id="qz-sec-start" disabled>Hrát ${handArrowSvg(false)}</button></div>
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", backToCountry);
    bindPickHead(steps);
    const selected = new Set();
    const startBtn = body.querySelector("#qz-sec-start");
    function syncStart(){
      startBtn.disabled = selected.size === 0;
    }
    const goNext = () => {
      if(!selected.size) return;
      S.sel.section = selected.has("__all__") ? "__all__" : [...selected];
      applyPool(); afterPick();
    };
    body.querySelectorAll(".qz-tile[data-sec]:not(.soon)").forEach(b => {
      b.addEventListener("click", () => {
        const sec = b.dataset.sec;
        if(sec === "__all__"){
          if(selected.has("__all__")){ selected.clear(); b.classList.remove("sel"); syncStart(); return; }
          // "Vybrat vše" nejde kombinovat s ničím jiným — klik je kompletní rozhodnutí,
          // takže rovnou pokračuje dál, bez čekání na tlačítko Hrát
          selected.clear(); body.querySelectorAll(".qz-tile.sel").forEach(t=>t.classList.remove("sel")); selected.add("__all__"); b.classList.add("sel");
          goNext();
          return;
        } else {
          if(selected.has("__all__")){ selected.delete("__all__"); body.querySelector(".qz-tile[data-sec='__all__']")?.classList.remove("sel"); }
          if(selected.has(sec)){ selected.delete(sec); b.classList.remove("sel"); }
          else { selected.add(sec); b.classList.add("sel"); }
        }
        syncStart();
      });
    });
    startBtn.addEventListener("click", goNext);
  }
  function afterPick(){
    S.bandTouched = false;   // nová volba tématu -> karty nemají ukazovat starou volbu jako už vybranou
    S.qLimitTouched = false; // nový fond otázek -> „kolik otázek" se přepočítá podle nové velikosti
    if(S.pickMode==="party") renderSetup();
    else if(S.pickMode==="school") renderSchoolStart();
    else renderStart();
  }

  // ---- škola / projektor ----
  function renderSchoolStart(){
    say("Vyber úroveň a promítni to třídě.");
    document.getElementById("qz-shell").style.transform="";
    const _cLabel2=esc(COUNTRY);
    const backToCountry2 = () => renderCountryPick(S.sel.conts || [S.sel.cont]);
    const steps = [{label:contsLabel(), fn:renderContinentPick}, {label:_cLabel2, fn:backToCountry2}, {label:selSectionLabel(), fn:renderSectionPick}];
    const lvlPool = data.questions.filter(q => (q.difficulty||1) <= S.schoolLevel);
    const total = lvlPool.length ? lvlPool.length : data.questions.length;
    const qOpts = qLimitOptions(total);
    if(!S.qLimitTouched || !qOpts.some(o=>o.n===S.qLimit)) S.qLimit = qOpts[qOpts.length-1].n;
    body.innerHTML = `<div class="qz-screen qz-start">
      ${pickHeadHtml(steps)}
      <h2>Škola / projektor — ${flagStamp(S.sel&&S.sel.cc)} ${COUNTRY}</h2>
      <p>Velké otázky na plátno, celá třída hádá naráz — trocha vědění, hromada smíchu. Zvol obtížnost:</p>
      <div class="qz-bands">
        <button class="qz-chip${S.schoolLevel===1?" on":""}" data-lvl="1">★ Lehká</button>
        <button class="qz-chip${S.schoolLevel===2?" on":""}" data-lvl="2">★★ Střední</button>
        <button class="qz-chip${S.schoolLevel===3?" on":""}" data-lvl="3">★★★ Vše</button>
      </div>
      <div style="width:min(100%,460px);margin-top:18px">
        <div class="qz-fieldlabel">Kolik otázek?</div>
        <div class="qz-bands">
          ${qOpts.map(o=>`<button class="qz-chip${S.qLimit===o.n?" on":""}" data-qlimit="${o.n}">${esc(o.label)}</button>`).join("")}
        </div>
      </div>
      <button class="qz-go" id="qz-school-go" style="margin-top:20px">Promítnout ${handArrowSvg(false)}</button>
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", renderSectionPick);
    bindPickHead(steps);
    body.querySelectorAll("[data-lvl]").forEach(b => b.addEventListener("click", () => { S.schoolLevel=+b.dataset.lvl; S.qLimitTouched=false; renderSchoolStart(); }));
    body.querySelectorAll("[data-qlimit]").forEach(b => b.addEventListener("click", () => { S.qLimit=+b.dataset.qlimit; S.qLimitTouched=true; renderSchoolStart(); }));
    body.querySelector("#qz-school-go").addEventListener("click", () => startSchool(S.schoolLevel));
  }
  function startSchool(level){
    S.mode="solo"; S.school=true;
    S.timer=0;   // viz startGame — časomíra z párty se sem nesmí přenést
    S.schoolLevel=level;   // ať „Hrát znovu" po škole spustí zase školu, ne sólo
    S.players=[{ name:"Třída", band:"deti", color:COLORS[1], score:0, side:"dole" }];
    S.turn=0;
    const filtered = data.questions.filter(q => (q.difficulty||1) <= level);
    const pool = filtered.length ? filtered : data.questions;
    const limit = Math.min(S.qLimit || pool.length, pool.length);
    S.order = shuffle(pool).slice(0, limit);
    S.idx=0; newSave();
    const shell=document.getElementById("qz-shell"); shell.classList.add("qz-school"); shell.style.transform="";
    renderQuestion();
  }
  if(closeBtn) closeBtn.addEventListener("click", close);

  function renderStart(){
    say("Řekni mi, kdo dnes cestuje — a hned vyrážíme.");
    const _cLabel=esc(COUNTRY);
    const backToCountry3 = () => renderCountryPick(S.sel.conts || [S.sel.cont]);
    const steps = [{label:contsLabel(), fn:renderContinentPick}, {label:_cLabel, fn:backToCountry3}, {label:selSectionLabel(), fn:renderSectionPick}];
    const total = bandPool(S.band).length;
    const qOpts = qLimitOptions(total);
    if(!S.qLimitTouched || !qOpts.some(o=>o.n===S.qLimit)) S.qLimit = qOpts[qOpts.length-1].n;
    body.innerHTML = `<div class="qz-screen qz-start">
      ${pickHeadHtml(steps)}
      <!-- Zemi i téma říkají drobečky o řádek výš, takže je nadpis neopakuje — dřív tu stálo
           „{země} | Sólo výprava", kde nová byla jen ta jedna informace o sólu. „Sólo jízda"
           navíc sedí s názvem dlaždice režimu (dřív „Sólo výprava", tedy dvě jména pro totéž).
           Pointu si schválně nechává až shrnutí dole — dva vtipy nad sebou se shodí.
           Razítko jen u jedné vybrané země: u „všech zemí" je S.sel.cc null (viz selectCountries),
           takže flagStamp skládal country-null.jpg a tahal zbytečné 404. -->
      <h2>${(S.sel&&S.sel.cc) ? flagStamp(S.sel.cc)+" " : ""}Oukej, vypravíme se na sólo jízdu. Jen ty a mapa.</h2>
      <div style="width:min(100%,460px)">
        <div class="qz-fieldlabel">Kdo dnes hraje?</div>
        <div class="qz-tiles" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:100%">
          ${tileHtml({ic:"🧒", img:"assets/band-deti.jpg", t:"Děti", selectable:true, sel:S.bandTouched && S.band==="deti", attr:`data-band="deti"`})}
          ${tileHtml({ic:"🧑‍🎓", img:"assets/band-starsi.jpg", t:"Puberťáci", selectable:true, sel:S.bandTouched && S.band==="starsi", attr:`data-band="starsi"`})}
          ${tileHtml({ic:"🧑", img:"assets/band-dospeli.jpg", t:"Dospělí", selectable:true, sel:S.bandTouched && S.band==="dospeli", attr:`data-band="dospeli"`})}
        </div>
      </div>
      <div style="width:min(100%,460px);margin-top:18px">
        <div class="qz-fieldlabel">Na kolik otázek si troufáš?</div>
        <!-- Stejně jako u dlaždic pásma (S.bandTouched): S.qLimit má skrytou výchozí hodnotu
             (poslední/největší kotva), takže dokud hráč nesáhne na chip, nemá svítit jako vybraný. -->
        <div class="qz-bands" id="qz-qlimits">
          ${qOpts.map(o=>`<button class="qz-chip${(S.qLimitTouched && S.qLimit===o.n)?" on":""}" data-qlimit="${o.n}">${esc(o.label)}</button>`).join("")}
        </div>
      </div>
      <!-- Shrnutí obou voleb, ne nadpis: proto stojí až pod nimi a naskočí, teprve když hráč
           vybral pásmo i počet. Dřív viselo nad dlaždicemi a hlásilo počet i velikost fondu
           dřív, než si hráč cokoli zvolil — fond navíc podle skryté výchozí hodnoty S.band. -->
      ${prazdnoNote(total)}
      ${(S.bandTouched && S.qLimitTouched && total) ? `<p class="qz-start-sum">Losujeme ${S.qLimit} ${plur(S.qLimit,"otázku","otázky","otázek")} z ${total}. Po nich budeš buď chytřejší, nebo aspoň skromnější.</p>` : ""}
      <!-- Dokud hráč nesáhne na pásmo/počet, drží S.band a S.qLimit skryté výchozí hodnoty
           ("dospeli", poslední kotva) — bez disabled by klik rovnou na start tiše rozjel hru
           s výchozí volbou, aniž by hráč cokoli vybral. -->
      <button class="qz-go" id="qz-start-go" style="margin-top:20px"${(S.bandTouched && S.qLimitTouched && total)?"":" disabled"}>Jdeme na to ${handArrowSvg(false)}</button>
    </div>`;
    body.querySelector("#qz-back").addEventListener("click", renderSectionPick);
    bindPickHead(steps);
    // Klik na pásmo/počet dřív volal renderStart(), tedy body.innerHTML = … — tím se zahodily
    // a znovu vytvořily i <img> dlaždic, takže obrázky pásem viditelně problikly (dev server je
    // navíc posílá s `no-store`, takže se pokaždé stahovaly znovu, ~186 kB na klik). Nic z toho
    // se přitom nemění, takže se překresluje jen to, co na volbě opravdu závisí.
    function refreshStart(){
      const total = bandPool(S.band).length;
      const qOpts = qLimitOptions(total);
      if(!S.qLimitTouched || !qOpts.some(o=>o.n===S.qLimit)) S.qLimit = qOpts[qOpts.length-1].n;
      // dlaždice pásem — fajfku řídí CSS přes .sel, takže stačí přepnout třídu
      body.querySelectorAll(".qz-tile[data-band]").forEach(t =>
        t.classList.toggle("sel", S.bandTouched && t.dataset.band===S.band));
      // nabídka počtů se přestaví jen když se opravdu změnila, jinak se jen přehodí zvýraznění
      const wrap = body.querySelector("#qz-qlimits");
      const nows = [...wrap.querySelectorAll("[data-qlimit]")].map(b=>+b.dataset.qlimit);
      if(nows.length!==qOpts.length || nows.some((n,i)=>n!==qOpts[i].n)){
        wrap.innerHTML = qOpts.map(o=>`<button class="qz-chip${(S.qLimitTouched && S.qLimit===o.n)?" on":""}" data-qlimit="${o.n}">${esc(o.label)}</button>`).join("");
        bindQLimits();
      } else {
        wrap.querySelectorAll("[data-qlimit]").forEach(b => b.classList.toggle("on", S.qLimitTouched && +b.dataset.qlimit===S.qLimit));
      }
      // shrnutí voleb
      const go = body.querySelector("#qz-start-go");
      let sum = body.querySelector(".qz-start-sum");
      if(S.bandTouched && S.qLimitTouched && total){
        if(!sum){ sum=document.createElement("p"); sum.className="qz-start-sum"; go.parentNode.insertBefore(sum, go); }
        sum.textContent = `Losujeme ${S.qLimit} ${plur(S.qLimit,"otázku","otázky","otázek")} z ${total}. Po nich budeš buď chytřejší, nebo aspoň skromnější.`;
      } else if(sum){ sum.remove(); }
      // Prázdný fond pásma — hláška musí naskakovat i tady, ne jen při prvním vykreslení:
      // pásmo se přepíná právě přes refreshStart(), takže jinak by se ukázala jen náhodou.
      let prazd = body.querySelector(".qz-setnote");
      if(!total && S.bandTouched){
        if(!prazd){ prazd=document.createElement("p"); prazd.className="qz-setnote"; go.parentNode.insertBefore(prazd, go); }
        prazd.textContent = `Pro pásmo „${BAND_NAMES[S.band]||S.band}" tu nemáme ani jednu otázku. ` +
                            `Zkus jiné pásmo, přidej téma nebo zemi — drobečky nahoře tě vezmou zpátky.`;
      } else if(prazd){ prazd.remove(); }
      go.disabled = !(S.bandTouched && S.qLimitTouched && total);
    }
    function bindQLimits(){
      body.querySelectorAll("[data-qlimit]").forEach(b => b.addEventListener("click", () => {
        S.qLimit=+b.dataset.qlimit; S.qLimitTouched=true; refreshStart();
      }));
    }
    body.querySelectorAll(".qz-tile[data-band]").forEach(ch => ch.addEventListener("click", () => {
      S.band=ch.dataset.band; S.bandTouched=true;
      // Volba počtu se zahazuje jen tehdy, když se do fondu nového pásma nevejde. Dřív ji přepnutí
      // pásma rušilo vždycky, což bylo neškodné, dokud se podle S.qLimitTouched nic nezobrazovalo —
      // teď by to hráči po každé změně pásma schovalo shrnutí, které si už jednou vyklikal.
      if(!qLimitOptions(bandPool(S.band).length).some(o=>o.n===S.qLimit)) S.qLimitTouched=false;
      refreshStart();
    }));
    bindQLimits();
    body.querySelector("#qz-start-go").addEventListener("click", startGame);
  }

  function startGame(){
    S.mode="solo";
    // Časomíru nabízí JEN párty setup, ale S.timer je globální stav — bez tohohle
    // resetu si hráč odnesl „svižný · 15 s" z párty do sóla i do školy a neměl ho
    // kde vypnout, protože ani jedna z těch obrazovek přepínač nemá. Ve škole navíc
    // timeoutReveal() po patnácti vteřinách sám odhalil odpověď třídě. (2026-09-01)
    S.timer=0;
    S.players=[{ name:"Ty", band:S.band, color:COLORS[0], score:0, side:"dole" }];
    S.turn=0;
    // tři pásma: „děti" jen vlastní fond (q.kids), „puberťáci" lehčí obecné trivia (difficulty ≤2), „dospělí" celé obecné trivia — všechna bez dětských otázek
    const pool = bandPool(S.band);
    // Pojistka: tlačítko je při prázdném fondu disabled, ale sem se dá dojít i klávesnicí
    // nebo obnovou stavu. Prázdný fond by znamenal hru bez jediné otázky.
    if(!pool.length) return renderStart();
    const limit = Math.min(S.qLimit || pool.length, pool.length);
    S.order=shuffle(pool).slice(0, limit); S.idx=0; S.school=false; newSave();
    const shg=document.getElementById("qz-shell"); shg.classList.remove("qz-school"); shg.style.transform="";
    renderQuestion();
  }

  // ---- setup párty ----
  function ensureSetup(){
    if(S.players.length>=2) return;
    S.players = [
      { name:"", band:"deti",    color:COLORS[0], side:"dole",   score:0 },
      { name:"", band:"dospeli", color:COLORS[1], side:"nahoře", score:0 }
    ];
  }
  function renderSetup(){
    ensureSetup();
    say("Sesbírej posádku — jména a věkové pásmo.");
    document.getElementById("qz-shell").style.transform="";
    const recentNames = loadRecentNames();
    const prow = (p,i) => `<div class="qz-prow" data-i="${i}">
      <span class="qz-pav" style="background:${p.color}">${esc((p.name||"?")[0])}</span>
      <input class="qz-pname-in" aria-label="Jméno hráče ${i+1}" placeholder="Jméno hráče ${i+1}" value="${esc(p.name)}" data-f="name" list="qz-names-list" autocomplete="off">
      <span class="qz-bandtoggle">
        <button class="qz-bandbtn deti${p.band==="deti"?" on":""}" data-band="deti">Děti</button>
        <button class="qz-bandbtn starsi${p.band==="starsi"?" on":""}" data-band="starsi">Puberťák</button>
        <button class="qz-bandbtn dospeli${p.band==="dospeli"?" on":""}" data-band="dospeli">Dospělí</button>
      </span>
      ${S.players.length>2?`<button class="qz-prem" data-rem="${i}" title="odebrat">✕</button>`:""}
    </div>`;
    const _cLabel3=esc(COUNTRY);
    const backToCountry4 = () => renderCountryPick(S.sel.conts || [S.sel.cont]);
    const steps = [{label:contsLabel(), fn:renderContinentPick}, {label:_cLabel3, fn:backToCountry4}, {label:selSectionLabel(), fn:renderSectionPick}];
    body.innerHTML = `<div class="qz-screen qz-setup">
      ${pickHeadHtml(steps)}
      <h2>${ICO_SPARK} Nová výprava — ${flagStamp(S.sel&&S.sel.cc)} ${COUNTRY}</h2>
      <div class="qz-setcard">
        <h3><span class="n">1</span>Kdo hraje? <span style="font-size:11px;color:var(--muted);font-weight:400">Podle věku přitvrdíme, nebo přimhouříme oko</span></h3>
        <div id="qz-players">${S.players.map(prow).join("")}</div>
        <datalist id="qz-names-list">${recentNames.map(n=>`<option value="${esc(n)}">`).join("")}</datalist>
        ${S.players.length<6?`<button class="qz-addp" id="qz-addp">+ Přidat hráče</button>`:""}
      </div>
      <div class="qz-setrow">
        <div class="qz-setcard">
          <h3><span class="n">2</span>Délka</h3>
          <div class="qz-bands">
            ${[["Rychlá",3],["Klasik",5],["Maraton",8]].map(([l,r])=>`<button class="qz-chip${S.totalRounds===r?" on":""}" data-rounds="${r}">${l} · ${r} kol</button>`).join("")}
          </div>
          ${partyPrazdnoNote()}${partyOpakovaniNote()}
        </div>
        <div class="qz-setcard">
          <h3><span class="n">3</span>Nastavení</h3>
          <!-- Hlasová část appky (TTS) je dočasně schovaná z UI — vrátíme se k ní později.
               Přepínač i tlačítko reproduktoru (viz topHtml) jsou pryč, ale speakTTS/speakCurrent
               a S.voice zůstávají funkční pod kapotou; S.voice teď jen nikdy nejde nastavit na
               true, takže se nikdy nezavolají (viz i tvrdý reset v resumeSave). -->
          <!-- Steal (sebrání otázky) je dočasně schovaný z UI stejně jako hlas výš — přepínač je
               pryč, ale stealHtml/wireSteal/finishSteal zůstávají funkční pod kapotou. allowSteal
               na obou místech (answer, timeoutReveal) čte S.steal, a to už nejde v UI nastavit na
               true, takže se ty větve nikdy nespustí (viz i tvrdý reset v resumeSave). -->
          <div class="qz-opt" role="switch" tabindex="0" aria-checked="${S.rotate==="auto"}" data-opt="rotate"><span class="qz-sw${S.rotate==="auto"?" on":""}"></span> Otáčet obrazovku k hráči</div>
          <div class="qz-fieldlabel" style="margin-top:12px">Časový limit na odpověď</div>
          <div class="qz-bands" style="margin-top:4px">
            <button class="qz-chip${S.timer===0?" on":""}" data-timer="0">Vyp</button>
            <button class="qz-chip${S.timer===30?" on":""}" data-timer="30">Mírný · 30 s</button>
            <button class="qz-chip${S.timer===15?" on":""}" data-timer="15">Svižný · 15 s</button>
          </div>
        </div>
      </div>
      <div class="qz-setnote">Fond: ${data.questions.length} otázek · ${flagStamp(S.sel&&S.sel.cc)} ${esc(COUNTRY)}${(S.sel&&S.sel.section&&S.sel.section!=="__all__")?" · "+esc(S.sel.section):""} · ${S.players.length} ${plur(S.players.length,"hráč","hráči","hráčů")}</div>
      <button class="qz-go" id="qz-setup-go" style="align-self:center">Jdeme na to ${handArrowSvg(false)}</button>
    </div>`;
    // wiring
    body.querySelector("#qz-back").addEventListener("click", renderSectionPick);
    bindPickHead(steps);
    body.querySelectorAll(".qz-prow").forEach(row => {
      const i = +row.dataset.i;
      row.querySelector('[data-f="name"]').addEventListener("input", e => { S.players[i].name=e.target.value; row.querySelector(".qz-pav").textContent=(e.target.value||"?")[0]; e.target.classList.remove("err"); });
      row.querySelectorAll(".qz-bandbtn").forEach(b => b.addEventListener("click", () => { S.players[i].band=b.dataset.band; renderSetup(); }));
      const rem=row.querySelector(".qz-prem"); if(rem) rem.addEventListener("click", () => { S.players.splice(+rem.dataset.rem,1); renderSetup(); });
    });
    const add=body.querySelector("#qz-addp"); if(add) add.addEventListener("click", () => { const i=S.players.length; S.players.push({ name:"", band:"dospeli", color:COLORS[i%COLORS.length], side:SIDES[i%SIDES.length].k, score:0 }); renderSetup(); });
    body.querySelectorAll("[data-rounds]").forEach(b => b.addEventListener("click", () => { S.totalRounds=+b.dataset.rounds; renderSetup(); }));
    body.querySelectorAll("[data-timer]").forEach(b => b.addEventListener("click", () => { S.timer=+b.dataset.timer; renderSetup(); }));
    body.querySelectorAll(".qz-opt").forEach(o => {
      const prepni = () => {
      const k=o.dataset.opt;
      if(k==="voice") S.voice=!S.voice;
      else if(k==="rotate") S.rotate = S.rotate==="auto" ? "button" : "auto";
      else if(k==="steal") S.steal=!S.steal;
      renderSetup();
      };
      o.addEventListener("click", prepni);
      // Klávesnice na přepínači: Enter/mezera přepne (role="switch").
      o.addEventListener("keydown", e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); prepni(); } });
    });
    body.querySelector("#qz-setup-go").addEventListener("click", () => {
      const named = S.players.filter(p=>(p.name||"").trim());
      if(named.length<2){
        say("Potřebuju aspoň dvě jména, ať vím, koho vítat.");
        let first=null;
        body.querySelectorAll(".qz-prow").forEach(row => {
          const inp=row.querySelector('[data-f="name"]');
          if(!inp.value.trim()){ inp.classList.add("err"); if(!first) first=inp; }
        });
        if(first){ first.scrollIntoView({block:"center", behavior:REDUCED_MOTION?"auto":"smooth"}); first.focus(); }
        return;
      }
      S.players = named.map((p,i)=>({ ...p, name:p.name.trim(), color:COLORS[i%COLORS.length], score:0 }));
      rememberNames(S.players.map(p=>p.name));
      startParty();
    });
  }

  // Předskládá pořadí otázek tak, že na pozici i stojí otázka z pásma hráče, který na ní bude
  // na tahu. Dřív se párty losovala z jednoho společného balíku celého fondu, takže dítě u stolu
  // dostávalo ~41 % otázek pro dospělé, na které nemohlo odpovědět.
  // Proč předskládat a nefiltrovat až při podání: qCurrent() i ukládání rozehrané hry (orderIds
  // + qServed) pak zůstávají beze změny. Délka je násobek počtu hráčů — díky tomu zarovnání
  // pásem přežije i přetečení přes `% S.order.length` v qCurrent().
  function buildPartyOrder(){
    const P = S.players.length;
    const need = Math.max(1, S.totalRounds) * P;
    const queues = {};   // pásmo -> { pool: zamíchaný fond, i: kolik z něj už padlo }
    const out = [];
    for(let i=0; i<need; i++){
      const band = S.players[i % P].band || "dospeli";
      let qu = queues[band];
      // došel fond pásma (málo otázek, hodně kol) -> zamíchat znovu a jet od začátku
      if(!qu || qu.i >= qu.pool.length) qu = queues[band] = { pool: shuffle(bandPool(band)), i:0 };
      out.push(qu.pool[qu.i++]);
    }
    return out;
  }
  function startParty(){
    // Pojistka proti frontě plné `undefined` — viz prazdnaPasmaParty(). Sem se dá dojít
    // i z „Hrát znovu" na výsledkové obrazovce, kde žádná kontrola není.
    if(prazdnaPasmaParty().length) return renderSetup();
    S.mode="party"; S.order=buildPartyOrder(); S.qServed=0; S.turn=0; S.round=1; S.manualRot=null; S.school=false; newSave();
    document.getElementById("qz-shell").classList.remove("qz-school");
    S.players.forEach(p=>{ p.score=0; });
    applyRotation();
    renderQuestion();
  }

  function picframeHtml(q){
    const country = esc(q.country||COUNTRY), section = esc(q.section||"");
    return `<div class="qz-picframe" id="qz-pic">
      <img class="qz-picbg" id="qz-pic-bg" src="img/${esc(q.id)}.jpg" alt="" aria-hidden="true">
      <img class="qz-pic" id="qz-pic-img" src="img/${esc(q.id)}.jpg" alt="">
      <div class="qz-pic-fallback" id="qz-pic-fb">${flagStamp(q.cc,"qz-flagbig")}<span class="qz-pic-fb-text"><span class="country">${country}</span><span class="sec">${section}</span></span></div>
      <div class="qz-globewrap"><span class="qz-globe-stage"><span class="qz-medal" id="qz-medal"></span><span class="qz-beacon"></span></span><span class="qz-globecap">${country}</span></div>
    </div>`;
  }
  // Okno z quiz.js ven. Online režim si otázku kreslí vlastní funkcí
  // (`nextQuestion()` v online.js) a do téhle closure nevidí, takže mu rám s glóbem
  // i ilustrací chyběl úplně — a mřížka `.qz-play` mu přitom sloupec rezervovala.
  // Vystavují se SCHVÁLNĚ jen čtyři funkce kolem `.qz-picframe`, ne vnitřek hry:
  // stav (`S`, `data`) zůstává zavřený, jinak by se online mohl začít vázat na offline.
  // Obě části sdílí `#qz-body`, takže `body.querySelector` uvnitř funguje i odsud.
  window.ZKPicframe = {
    html: q => picframeHtml(q),        // řetězec do innerHTML
    wire: () => wirePic(),             // navěsí onload/onerror u ilustrace
    globe: cc => mountGlobeMedal(cc),  // připne sdílený 3D glóbus a natočí na zemi
    reveal: () => revealPic(),         // po odpovědi odhalí ilustraci
  };

  // Druhé okno, SCHVÁLNĚ oddělené od ZKPicframe — se rámem u otázky nemá nic společného
  // a schovat štítek pod jméno „Picframe" by příští session mátlo. Důvod, proč vůbec
  // je: `diffHtml` potřebuje `ICO_STAR_DIFF` (SVG hvězdy) a `DIFF_LABEL`, takže kopie
  // v online.js by znamenala třetí opis SVG v repu — a ten se dřív nebo později rozejde.
  // Online bere `{difficulty, kids}` ze serveru, offline z JSONu; tvar je stejný.
  window.ZKDiff = { html: q => diffHtml(q) };

  // odhalení fotky u odpovědi — fotka je odměna, ať ji není nutné hledat scrollem
  function revealPic(){
    const pic=body.querySelector("#qz-pic"); if(!pic) return;
    pic.classList.add("revealed");
    setTimeout(()=>pic.scrollIntoView({ behavior:"smooth", block:"nearest" }), 480);
  }
  function wirePic(){
    const img=body.querySelector("#qz-pic-img"), fb=body.querySelector("#qz-pic-fb"), pic=body.querySelector("#qz-pic");
    if(!img) return;
    // Rozmazaný podklad je jen kopie téhož souboru — musí mizet a naskakovat s obrázkem,
    // jinak by u chybějící ilustrace zůstal pod razítkem země šedý čtverec s ikonou.
    const bg=body.querySelector("#qz-pic-bg");
    const show=()=>{ img.style.display="block"; if(bg) bg.style.display="block"; fb.style.display="none"; pic.classList.remove("qz-pic-broken"); };
    const showFallback=()=>{ img.style.display="none"; if(bg) bg.style.display="none"; fb.style.display="flex"; pic.classList.add("qz-pic-broken"); };
    showFallback();
    img.onload=show;
    img.onerror=showFallback;
    if(img.complete && img.naturalWidth>0) show();
  }

  // obsah bodového praporku v sólu — sdíleno mezi prvním vykreslením (topHtml) a
  // dopočtem po odpovědi (answer), aby se čísla v obou nikdy nerozjela
  function scorePillHtml(){ return `${ICO_STAR} <b>${cur().score}</b>`; }
  function topHtml(n, total){
    if(S.mode==="party"){
      const pills=S.players.map((p,i)=>`<button class="qz-pl${i===S.turn?" active":""}" data-turn="${i}">
        <span class="qz-pav" style="background:${p.color}">${esc((p.name||"?")[0])}</span>
        <span class="qz-plmeta"><span class="qz-plname">${esc(p.name)}</span>${i===S.turn?'<span class="qz-plturn">Na tahu</span>':""}</span>
        <span class="qz-plscore" data-score="${i}">${p.score}</span></button>`).join("");
      return `<div class="qz-scoreboard">${pills}</div>
        <div class="qz-subtop"><span class="qz-progress">Kolo ${S.round}/${S.totalRounds} · otázka ${n}</span></div>`;
    }
    return `<div class="qz-top">
      <span class="qz-progress">Otázka ${n}/${total}</span>
      <span style="margin-left:auto;display:flex;gap:8px;align-items:center">
        ${S.school?"":`<span class="qz-scorepill" id="qz-scorepill">${scorePillHtml()}</span>`}
      </span></div>`;
  }
  function wireTop(q){
    const mb=body.querySelector("#qz-mute");
    if(mb) mb.addEventListener("click", () => {
      S.voice=!S.voice;
      mb.innerHTML=S.voice?ICO_SND:ICO_SNDX;
      mb.setAttribute("aria-label", S.voice?"Vypnout hlas":"Zapnout hlas");
      mb.setAttribute("aria-pressed", String(S.voice));
      if(!S.voice) stopTTS(); else speakCurrent(q);
    });
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
    const answers = shuffle([q.answer, ...(q.distractors||[])]);
    // Zamíchané pořadí si držíme, aby `answer()`/`timeoutReveal()` uměly zvýraznit správnou
    // a vybranou možnost PŘÍMO v seznamu (jako online), místo aby čtyři odpovědi nahradily
    // kompaktním boxem — hráč jinak dvě nevybrané možnosti po odpovědi vůbec neuvidí.
    S.answers = answers;
    const ansHtml = `<div class="qz-ans${answers.length<=2?" two":""}">${answers.map((a,i)=>`<button class="qz-a" data-i="${i}">${esc(a)}<small>${"ABCD"[i]||""}</small></button>`).join("")}</div>`;
    body.innerHTML = `<div class="qz-screen qz-play">
      ${topHtml(n,total)}
      <div class="qz-box" id="qz-box">
        <div class="qz-timerbar" id="qz-timerbar" style="display:none"><div></div></div>
        <div class="qz-meta">${esc(q.country||COUNTRY)} · ${esc(q.section||"")} · ${diffHtml(q)}${S.mode==="party"?` · <b style="color:${cur().color}">${esc(cur().name)}</b> na tahu`:""}</div>
        <div class="qz-q">${esc(q.question)}</div>
        ${ansHtml}
      </div>
      ${picframeHtml(q)}
    </div>`;
    wirePic(); wireTop(q); mountGlobeMedal(q.cc);
    body.querySelectorAll("#qz-box .qz-a").forEach(btn => btn.addEventListener("click", () => answer(q, answers[+btn.dataset.i])));
    // Fokus na první odpověď. Obrazovka se překresluje přes innerHTML, takže bez tohohle
    // spadne fokus na začátek stránky a kdo hraje klávesnicí, protabovává se u KAŽDÉ otázky
    // znovu odshora. Bije to nejvíc ve školním režimu.
    const prvni = body.querySelector("#qz-box .qz-a");
    if(prvni && !S.school) prvni.focus({ preventScroll:true });
    speakCurrent(q);
    requestWake(); autosave(); startTimer(q);
  }

  // Bublina hostitele po odpovědi. Do 2026-09-01 to byly TŘI pevné věty, takže „Tentokrát
  // vedle." četl hráč u každé chybné odpovědi znovu a znovu. Fondy jsou v data/fondy.json
  // (verdict_correct / verdict_wrong / verdict_gold); zůstávají KRÁTKÉ schválně — vtip nese
  // hláška v kartě (quip_correct/quip_wrong) a dva vtipy nad sebou se navzájem shodí.
  // Pevné věty tu zůstávají jako záloha: `loadData` při chybějícím fondy.json vrací {}.
  const VERDIKT_ZALOHA = { correct: "Správně!", wrong: "Tentokrát vedle.", gold: "Zlatá odpověď!" };
  function verdikt(druh){
    const fond = data && data.fondy && data.fondy["verdict_" + druh];
    return (Array.isArray(fond) && fond.length) ? pick(fond) : VERDIKT_ZALOHA[druh];
  }

  // popisek tlačítka „Více o…" — 6. pád je v datech (pole `about`), česky se odvodit nedá
  function moreLabel(q){ return q.about ? `Více o ${q.about}` : "Více o tom"; }
  // „Konec" jen na SKUTEČNĚ poslední otázce. V párty se postup neřídí S.idx (ten se
  // po sólu neresetuje a nese cizí hodnotu), ale počtem odehraných otázek qServed
  // proti totalRounds×hráči — jinak párty ukazovala „Konec" pod každou odpovědí.
  // POZOR: tenhle komentář MUSÍ zůstat MIMO template literal níž — uvnitř backticků se
  // `//` nebere jako komentář a vykreslí se hráči do patičky karty (stalo se, commit 0195a4a).
  function frowHtml(q){
    return `<div class="qz-frow">
      <div class="qz-expl">${esc(q.explanation||"")} ${(SHOW_SOURCE_LINK && q.source_url)?`<a href="${esc(q.source_url)}" target="_blank" rel="noopener">${ICO_LINK} zdroj</a>`:""}</div>
      <div class="qz-fbtns">
        ${(q.source_card||q.more_fact)?`<button class="qz-more" id="qz-more">${esc(moreLabel(q))} <span class="qz-more-ico">💡</span></button>`:""}
        <button class="qz-next" id="qz-next">${(S.mode==="party" ? S.qServed+1<S.totalRounds*S.players.length : S.idx+1<S.order.length)?"Další otázka":"Konec"} ${handArrowSvg(false)}</button>
      </div>
    </div>`;
  }
  function wireFrow(q){
    body.querySelector("#qz-next").addEventListener("click", next);
    const m=body.querySelector("#qz-more"); if(m) m.addEventListener("click", () => openMore(q));
  }

  function updateScorePill(i){ const el=body.querySelector(`.qz-plscore[data-score="${i}"]`); if(el) el.textContent=S.players[i].score; }

  function answer(q, choice){
    if(S.answered) return; S.answered=true; clearTimer();
    const b=bandOf(), base=qPoints(q), P=cur();
    const correct = String(choice)===String(q.answer);
    let gained=0, gold=false, quipText;
    if(correct){ gained=base; quipText=resolveQuip(q.quip_correct,b); }
    else if(q.golden_wrong!=null && String(choice)===String(q.golden_wrong)){ gold=true; gained=Math.round(base/2); quipText=q.golden_quip; }
    else { const dq=q.distractor_quips&&q.distractor_quips[choice]; quipText = dq?resolveQuip(dq,b):resolveQuip(q.quip_wrong,b); }
    P.score+=gained; updateScorePill(S.turn);
    // párty má vlastní praporek na hráče (updateScorePill výš); sólo/škola má jeden sdílený
    // v topHtml — ten se jinak přepisoval jen při vykreslení další otázky, takže nové body
    // byly vidět až po kliku na „Další otázka", ne hned po odpovědi
    const pill=body.querySelector("#qz-scorepill"); if(pill) pill.innerHTML=scorePillHtml();
    // bublina hostitele = krátký verdikt; vtipná hláška žije v panelu HLÁŠKA (ať se netočí dvakrát)
    say(verdikt(gold ? "gold" : correct ? "correct" : "wrong")); if(S.voice) speakTTS(quipText);
    revealPic();
    if(gold){ const gf=document.createElement("div"); gf.className="qz-goldflash"; document.getElementById("qz-shell").appendChild(gf); setTimeout(()=>gf.remove(),950); }
    const box=body.querySelector("#qz-box");
    // Zvýrazni odpovědi PŘÍMO v seznamu (jako online): správná zeleně, tvůj špatný tip
    // červeně, ostatní zůstanou vidět. Dřív se čtyři možnosti nahradily kompaktním boxem
    // „Správná / Tvoje", takže dvě nevybrané mizely a hráč neviděl všechny možnosti.
    const correctIdx = (S.answers||[]).indexOf(q.answer);
    const pickIdx = (S.answers||[]).indexOf(choice);
    box.querySelectorAll(".qz-a").forEach(btn => {
      const i = +btn.dataset.i; btn.disabled = true;
      if(i===correctIdx) btn.classList.add("ok");
      else if(i===pickIdx) btn.classList.add("bad");
    });
    const allowSteal = S.mode==="party" && S.steal && !correct && !gold && S.players.length>1;
    box.insertAdjacentHTML("beforeend", `
      <div class="qz-quipbox">
        <div class="qz-ht">„${esc(quipText||"")}"</div>
        ${(gold||gained)?`<div class="qz-hl points">${gold?`${ICO_STAR} zlatá odpověď${gained?` · ${pointsLabel(gained)}`:""}`:pointsLabel(gained)}</div>`:""}
      </div>
      ${allowSteal ? stealHtml(q, choice) : frowHtml(q)}`);
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
      const correct=String(btn.childNodes[0].textContent)===String(q.answer), g=qPoints(q);
      if(correct){ S.players[si].score+=g; updateScorePill(si); say(stealer.name+" to sebral! +"+g); if(S.voice) speakTTS(stealer.name+" sebral body!"); }
      else { say(stealer.name+" taky mimo."); if(S.voice) speakTTS(stealer.name+" taky mimo."); }
      finishSteal(q);
    }));
    box.querySelector("#qz-steal-skip").addEventListener("click", () => { say(stealer.name+" to nechává být."); finishSteal(q); });
  }
  function finishSteal(q){ const st=body.querySelector("#qz-steal"); if(st){ const tmp=document.createElement("div"); tmp.innerHTML=frowHtml(q); st.replaceWith(tmp.firstElementChild); } wireFrow(q); }

  // „Více o…" se zobrazuje jen u otázek napojených na kartu z Glóbu (q.source_card) —
  // bez karty appka neměla nic k zobrazení (žádná fotka, žádný text navíc), tlačítko
  // proto vůbec nerenderuje frowHtml(). Karty samy jsou bez fotek — jen fakt + hláska.
  // Otázka bez karty z Glóbu (přes polovina fondu — viz CLAUDE.md) dostává náhradní kartu
  // poskládanou přímo z otázky: q.more_fact je nový fakt, ne parafráze explanation/hlášek,
  // stejný standard jako u karet z Glóbu. Nadpis = odpověď, žádná fotka (appka ji na tuhle
  // otázku nemá — .qz-cardbody bez img funguje i bez ní, viz cardOverlay).
  function openMore(q){
    if(q.source_card) openCard(q.source_card);
    else if(q.more_fact) cardOverlay({ headline:q.answer, fact:q.more_fact });
  }
  // Karta má vždycky základní fakt + dvě hlubší úrovně (cestovatel, kartograf) — ty appka
  // dřív vůbec nečetla. Otázka svoje "explanation" často odvozuje právě ze základního faktu
  // karty, takže "Více o..." by ho jen zopakovalo. Nejhlubší dostupná úroveň je typicky úplně
  // jiný úhel pohledu (ne přeformulovaná stejná věta), takže se s vysvětlením prakticky nekryje.
  function openCard(id){
    const c=data.cardsById[id]; if(!c) return;
    const deep = c.levels && (c.levels.kartograf || c.levels.cestovatel);
    const shown = deep ? { ...c, headline:deep.headline||c.headline, fact:deep.fact, voice:deep.voice } : c;
    cardOverlay(shown);
  }
  function cardOverlay(c){
    const ov=document.createElement("div"); ov.className="qz-cardov";
    ov.innerHTML = `<div class="qz-cardbox">
      <div class="qz-cardbody">
        <h3>${esc(c.headline||c.country||"")}</h3>
        ${c.fact?`<p>${esc(c.fact)} ${(SHOW_SOURCE_LINK && c.source_url)?`<a href="${esc(c.source_url)}" target="_blank" rel="noopener" style="color:var(--teal);font-weight:600;text-decoration:none">${ICO_LINK} zdroj</a>`:""}</p>`:""}
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
      <span class="qz-standscore">${ICO_STAR} <b>${p.score}</b></span></div>`).join("");
    body.innerHTML=`<div class="qz-screen qz-end">
      <h2>${ICO_TROPHY} ${esc(winner.name)} vítězí!</h2>
      <div class="qz-hlaska" style="max-width:520px"><div class="qz-hl">vyhlášení</div><div class="qz-ht">„${esc(vic)}"</div></div>
      <div class="qz-standings">${rows}</div>
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
      <div class="qz-endscore">${S.school?"Třída získala":"Získal(a) jsi"} ${ICO_STAR} <b>${score}</b></div>
      <p style="color:var(--muted)">Z ${S.order.length} otázek · Teoretické maximum ${max} bodů</p>
      <div class="qz-endrow">
        <button class="qz-go" id="qz-again">Hrát znovu ${handArrowSvg(false)}</button>
        <button class="qz-chip" id="qz-home">Domů ${handArrowSvg(false)}</button>
      </div>
    </div>`;
    // endGame() je společný pro sólo i školu, takže „Hrát znovu" musí vědět, odkud
    // se sem přišlo. Do 2026-09-01 volalo vždycky startGame(), což ze školní hry
    // udělalo sólo pro dospělé: zahodila se úroveň, „Třída" se přejmenovala na „Ty"
    // a zmizela třída qz-school, takže se uprostřed promítání zmenšil text.
    body.querySelector("#qz-again").addEventListener("click", function () {
      if (S.school) startSchool(S.schoolLevel); else startGame();
    });
    body.querySelector("#qz-home").addEventListener("click", close);
  }

  open();   // samostatná stránka — spustí se rovnou
})();
