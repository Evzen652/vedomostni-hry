/* Zeměkvíz — online režim (docs/online-rezim.md).
 *
 * Samostatný modul: přebírá #qz-body a vrací ho zpátky přes onExit. Do quiz.js
 * kvůli tomu sahá jen jedna dlaždice na výběru režimu. Vzhled se nedělá znovu —
 * recykluje se stejné CSS jako offline část (.qz-screen, .qz-box, .qz-ans…),
 * aby online nepůsobil jako přilepený cizí kus.
 *
 * Offline část appky tenhle soubor nepotřebuje; když server neběží, online se
 * jen nedá otevřít a zbytek hry funguje dál.
 */
window.ZKOnline = (function () {
  "use strict";

  var API = "/api";
  var TOKEN_KEY = "zk_online_token";
  var body, exitCb;
  var S = {};
  var timer = null, poll = null;

  // Obrázek na kartě přihlášení i obnovy PINu. Nahrazuje dřívější `landing-hero.jpg`
  // (dědictví po landing.html, v původním „hezkém" stylu appky, ne v ironickém).
  // Vygenerováno ručně v Gemini appce (ne přes gen-irony-images.js) a ořezáno
  // přes scripts/crop-gemini-frame.ps1 na čtvercovou dlaždici 512×512 — 2026-08-31.
  var AUTH_HERO = "assets/auth-hero.jpg";

  // ---------------------------------------------------------------- pomocníci
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Malovaná ručně kreslená šipka — JEDINÁ šipka v celé appce (2026-09-03). Appka je
  // celá malovaná, takže plochý typografický glyf „→"/„←" v ní působí jako cizí těleso
  // (stejný důvod, proč skóre přešlo z SVG hvězdy na malovanou ico-star.png). Kopie
  // `handArrowSvg` z quiz.js — offline i online část kreslí TOTOŽNOU šipku; když se
  // doodle změní, uprav OBĚ. `flip` otočí doleva (pro „Zpět"). Výstup je bajtově shodný.
  function handArrowSvg(flip) {
    var f = flip ? ";transform:scaleX(-1)" : "";
    return '<svg style="width:1.5em;height:.95em;vertical-align:-.15em;display:inline-block' + f + '" viewBox="0 0 40 24" fill="none">' +
      '<path d="M2.5 13c9-3.4 21-2.6 29-2" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M23.5 4.5c3.5 2.4 6.7 4.4 10 6.4-3.4 2.2-7 4-10.8 6.4" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  // Skóre hry se všude ukazuje s malovanou hvězdou (assets/ico-star.png), stejně jako sólo
  // (`scorePillHtml`/`ICO_STAR` v quiz.js) — dřív měl online „N b" a sólo „★ N", což hráč
  // vytkl jako nejednotné (2026-09-03). Rating (číslo bez „b") hvězdu nedostává, není to skóre.
  var ICO_STAR = '<img src="assets/ico-star.png" alt="" style="width:1em;height:1em;vertical-align:-0.14em;flex:none;display:inline-block">';
  function starScore(n) { return ICO_STAR + " <b>" + n + "</b>"; }

  // Ghost soupeř se hráči ukazuje pod LIDSKÝM jménem, ne pod přezdívkou bota („Chytrá
  // sova (ligový)" = jasný NPC signál). Účet bota se NEPŘEJMENOVÁVÁ (nick_lower je UNIQUE,
  // baking jmen do účtů by je zabral reálným hráčům) — jméno je jen ZOBRAZENÍ, odvozené
  // z id hry: stabilní v rámci jedné hry (stejné na všech místech i při dotazování),
  // ale různé hru od hry. Server pořád posílá is_bot (rozbor/žebříček to potřebují),
  // jen ho tady nekreslíme. Mechanika (kdo to doopravdy je) se nemění — viz CLAUDE.md.
  var LIDSKA_JMENA = [
    "Honza", "Terka", "Pepa", "Klára", "Vojta", "Zuzka", "Adam", "Bára", "Matěj", "Eliška",
    "Tomáš", "Verča", "Ondra", "Nikol", "Filip", "Denisa", "Kuba", "Anička", "Lukáš", "Míša",
    "Petr", "Katka", "David", "Lucka", "Standa", "Péťa", "Radek", "Simča", "Marek", "Terezka",
    "Vašek", "Janča", "Ríša", "Domča", "Klárka", "Honzík",
  ];
  function souperJmeno(rawNick, isBot, klic) {
    if (!isBot) return rawNick;
    var h = 0, s = String(klic || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return LIDSKA_JMENA[h % LIDSKA_JMENA.length];
  }
  function say(t) {
    var el = document.getElementById("qz-host-bubble");
    if (el) { el.textContent = t || ""; el.style.display = t ? "" : "none"; }
  }
  var token = {
    get: function () { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } },
    // `zk_seen` přežije i odhlášení: rozlišuje „na tomhle zařízení už někdo hrál"
    // od „úplně nový hráč". Podle toho se volí výchozí obrazovka (přihlášení vs. registrace).
    set: function (t) { try { localStorage.setItem(TOKEN_KEY, t); localStorage.setItem("zk_seen", "1"); } catch (e) {} },
    clear: function () { try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} },
  };
  function znamyHrac() { try { return localStorage.getItem("zk_seen") === "1"; } catch (e) { return false; } }

  /* 5. pád přezdívky pro oslovení („Kuba" → „Kubo").
   *
   * CLAUDE.md má tvrdou lekci, že český pád se v kódu odvodit nedá — proto je 6. pád
   * u otázek uložený v datech (pole `about`). Tady to uložit nejde: přezdívku si píše
   * hráč sám. Řešení je proto ÚMYSLNĚ NEÚPLNÉ: použijí se jen pravidla, která v češtině
   * prakticky nemají výjimku, a **u všeho ostatního se jméno z pozdravu VYNECHÁ**.
   * „Ahoj!" je lepší než „Ahoj Petre" (správně je Petře) — chyba ve jméně je vidět,
   * chybějící jméno ne.
   *
   * Schválně NEOŠETŘENÉ (padají na pozdrav bez jména): -r (Petr → Petře, ale Viktor →
   * Viktore) a -el (Pavel → Pavle, ale Daniel → Danieli) — obojí má dvě různá pravidla
   * podle toho, co je před koncovkou, a splést se dá u velmi běžných jmen.
   * Vynechává se taky všechno, co není jedno slovo z písmen — generované dětské
   * přezdívky („Veselý krtek 20") ani „xXx_Alex" se skloňovat nemají.
   */
  function vokativ(nick) {
    var n = String(nick == null ? "" : nick).trim();
    if (!/^[A-Za-zÁ-Žá-ž]{2,20}$/.test(n)) return null;      // ne jedno slovo z písmen
    var m = n.toLowerCase();
    if (/[aá]$/.test(m)) return n.slice(0, -1) + "o";         // Kuba→Kubo, Eva→Evo, Péťa→Péťo
    if (/ek$/.test(m)) return n.slice(0, -2) + "ku";          // Marek→Marku, Radek→Radku
    if (/[ščžjřťďň]$/.test(m)) return n + "i";                // Tomáš→Tomáši, Ondřej→Ondřeji
    if (/(ch|[kgh])$/.test(m)) return n + "u";                // Vojtěch→Vojtěchu, Dominik→Dominiku
    if (/[oeiuyáéíóúý]$/.test(m)) return n;                   // Ivo, Marie, Jiří — beze změny
    if (/el$/.test(m) || /r$/.test(m)) return null;           // dvojznačné, radši nic
    if (/[dtnmvzsbpfl]$/.test(m)) return n + "e";             // Jan→Jane, Martin→Martine, Adam→Adame
    return null;
  }
  /* Pozdrav: se jménem, když ho umíme oslovit, jinak bez něj. */
  function pozdrav(nick, zbytek) {
    var v = vokativ(nick);
    return v ? "Ahoj " + esc(v) + ", " + zbytek : "Ahoj, " + zbytek;
  }

  /* Uvítání v lobby. Dřív tu byl jen proužek „Kuba · PUBERŤÁCI · Rating 1500 · Zatím
   * nezahráno" — z toho hráč nepoznal, co pásmo znamená, proti komu bude hrát ani co
   * je rating. Tón se drží pásma stejně jako hlášky u otázek (CLAUDE.md 2026-08-15):
   * děti nadšeně a bez sarkasmu, puberťáci s popichováním, dospělí se sarkasmem.
   *
   * POZOR: v textech NESMÍ být minulý čas s rodem („zapsal ses", „věděl jsi") — appka
   * pohlaví hráče nezná. Stejné pravidlo jako u `_verdikt` v fondy.json.
   */
  var LOBBY_TEXTY = {
    deti: {
      uvod: "jsme rádi, že jsi tady!",
      pasmo: "Tvoje pásmo je <b>Děti</b> — otázky jsou psané přímo pro tebe, žádné nudné letopočty.",
      souperi: "Hraješ proti jiným dětem — dospělí mají svoji ligu, takže tady nikdo nemá náskok dvacet let.",
      rating0: "Rating je tvoje číslo šikovnosti. Každý začíná na <b>1500</b> a s každou výhrou povyroste. Dokud nezahraješ, zůstane na startu.",
      ratingN: "Rating je tvoje číslo šikovnosti. Čím víc vyhraješ, tím výš poletí.",
    },
    starsi: {
      uvod: "dobře, že jsi tady.",
      pasmo: "Tvoje pásmo je <b>Puberťáci</b> — otázky, co se dají pochytit ve škole nebo na internetu, ne v encyklopedii.",
      souperi: "Nastupuješ proti ostatním puberťákům. Dospělí hrají zvlášť, takže na ně tady nenarazíš.",
      rating0: "Rating je číslo, které říká, jak ti to jde. Všichni začínají na <b>1500</b> — dokud neodehraješ pár her, neříká o tobě nic.",
      ratingN: "Rating je číslo, které říká, jak ti to jde. Roste s výhrami, klesá s prohrami.",
    },
    dospeli: {
      uvod: "vítej v aréně vědomostí. Držíme palce.",
      pasmo: "Tvoje pásmo je <b>Dospělí</b> — otázky bez zjednodušování. Spousta z nich vypadá jako samozřejmost, dokud na ně nedojde.",
      souperi: "Hraješ proti dospělým. Děti mají vlastní ligu, takže není na koho svádět prohru.",
      rating0: "Rating je číslo, které měří, jak ti to jde. Startuje se na <b>1500</b> a teprve pár odehraných her z toho udělá skutečné číslo.",
      ratingN: "Rating je číslo, které měří, jak ti to jde. Roste s výhrami, klesá s prohrami.",
    },
  };

  function req(path, opts) {
    opts = opts || {};
    var headers = {};
    if (opts.body !== undefined) headers["content-type"] = "application/json";
    var t = token.get();
    if (t) headers.authorization = "Bearer " + t;
    return fetch(API + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (b) {
        return { status: r.status, body: b };
      });
    }).catch(function () {
      // Text čte HRÁČ, ne vývojář — dřív tu stálo „Běží `npm run dev`?“.
      return { status: 0, body: { error: "Nemám spojení. Zkontroluj připojení k internetu a zkus to znovu." } };
    });
  }

  function stopAll() {
    if (timer) { clearInterval(timer); timer = null; }
    if (poll) { clearInterval(poll); poll = null; }
  }

  // Obnoví S.me z /me a teprve při úspěchu spustí pokračování. Do 2026-09-03 pět míst
  // dělalo `S.me = m.body` bez kontroly stavu — při 5xx nebo výpadku je body null, S.me
  // se přepsalo na null a renderLobby() spadl na S.me.ratings: mrtvá obrazovka bez hlášky.
  // Když nemáme použitelný profil, jde se na přihlášení; jinak zůstane ten dosavadní.
  function refreshMe(pokracuj) {
    return req("/me").then(function (m) {
      if (m.status === 200 && m.body) { S.me = m.body; return pokracuj(); }
      if (m.status === 401) token.clear();
      if (!S.me || !S.me.band) return renderAuth();
      return renderLobby((m.body && m.body.error) || "Profil se nepodařilo obnovit, zkus to prosím znovu.");
    });
  }

  function errBox(msg) {
    return msg ? '<div class="qz-setnote" style="color:var(--bad,#cf5f4e)">' + esc(msg) + "</div>" : "";
  }

  // Vlastní kopie — plur() v quiz.js žije uvnitř tamní closure a ven nevede.
  function plur(n, one, few, many) {
    n = Math.abs(n);
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return few;
    return many;
  }

  function backBar(label, onBack) {
    setTimeout(function () {
      var b = body.querySelector("#zk-back");
      if (b) b.addEventListener("click", onBack);
    }, 0);
    return '<button class="qz-back" id="zk-back">' + handArrowSvg(true) + " " + esc(label) + "</button>";
  }

  // ---------------------------------------------------------------- vstup
  // Pozvánka na souboj žije v URL (?duel=…) až do chvíle, kdy se hráč připojí —
  // joinFromLink ji pak z adresy smaže. Nepřihlášený tedy projde přihlášením
  // a teprve potom se propadne do souboje, místo aby skončil v lobby.
  function pendingDuel() {
    return new URLSearchParams(location.search).get("duel");
  }

  function open(onExit) {
    body = document.getElementById("qz-body");
    exitCb = onExit;
    stopAll();
    var obnova = pendingReset();
    if (obnova) return renderResetPin(obnova);
    if (!token.get()) return renderAuth();
    return req("/me").then(function (r) {
      if (r.status !== 200) { token.clear(); return renderAuth(); }
      S.me = r.body;
      var duel = pendingDuel();
      if (duel) return joinFromLink(duel);
      renderLobby();
    });
  }

  function leave() {
    stopAll();
    if (exitCb) exitCb();
  }

  // ---------------------------------------------------------------- přihlášení
  // `stav` = { band, nick } vyplněné před chybou. Obrazovka se překresluje celá,
  // takže bez tohohle by hráč po překlepu v PINu psal přezdívku a klikal dlaždici
  // znovu. PIN se schválně nevrací — heslo se po chybě vždycky maže.
  function renderAuth(mode, msg, stav) {
    // Novému hráči se ukáže rovnou ZALOŽENÍ hráče, ne přihlášení. Dřív tu bylo natvrdo
    // "login", takže první, co člověk bez účtu uviděl, byl formulář „přezdívka + PIN"
    // pro vracející se, a registrace byla jen tichý odkaz v patičce.
    mode = mode || (znamyHrac() ? "login" : "register");
    stav = stav || {};
    stopAll();
    var vyzva = !!pendingDuel();
    say(vyzva
      ? "Někdo tě vyzval na souboj. Přihlas se a jdeme na to."
      : mode === "register"
        ? "Založ si profil — stačí přezdívka a PIN, ať se ti počítá rating."
        : "Online hraní chce jméno. Stačí přezdívka a PIN.");
    var isReg = mode === "register";
    var podtitul = vyzva
      ? "Někdo tě vyzval na souboj — přihlas se a jde se hrát."
      : isReg
        ? "Stačí přezdívka a PIN. E-mail je nepovinný — je jen pro případ, že PIN zapomeneš."
        : "Vítej zpátky. Zadej přezdívku a PIN.";
    var PASMA = [
      { id: "deti", t: "Děti", fb: "🧒" },
      { id: "starsi", t: "Puberťáci", fb: "🧑‍🎓" },
      { id: "dospeli", t: "Dospělí", fb: "🧑" },
    ];

    // Jedna karta: obrázek → nadpis → pole → jediná barevná akce → tiché odkazy.
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap zk-auth">' +
      backBar("Zpět", leave) +
      '<div class="zk-authcard">' +
      // Dva sloupce, ale jen přes CSS: v HTML jde pořadí za sebou přesně jako dřív,
      // takže na mobilu vypadá obrazovka stejně a od 900 px se obrázek s nadpisem
      // odsune vlevo a formulář vedle něj. Bez tohohle byla registrace na širokém
      // monitoru úzký proužek uprostřed — .zk-wrap má strop 640 px.
      '<div class="zk-authgrid">' +
      '<div class="zk-authside">' +
        '<img class="zk-authhero" src="' + AUTH_HERO + '" alt="" data-fb="hide">' +
        '<div class="zk-authtag">Světová liga</div>' +
        "<h2>" + (isReg ? "Nový profil" : "Přihlášení") + "</h2>" +
        '<div class="zk-sub">' + esc(podtitul) + "</div>" +
      "</div>" +
      '<div class="zk-authmain">' +
        (msg ? '<div class="zk-autherr">' + errBox(msg) + "</div>" : "") +
        '<div class="zk-form">' +
          (isReg
            ? '<div class="zk-field">' +
                '<div class="qz-fieldlabel">Kdo bude hrát?</div>' +
                '<div class="zk-bandpick" id="zk-bands" role="group" aria-label="Věkové pásmo">' +
                  PASMA.map(function (b) {
                    return '<button type="button" class="zk-bandtile" data-band="' + b.id + '" aria-pressed="false">' +
                      '<img src="assets/band-' + b.id + '.jpg" alt="" data-fb="' + b.fb + '">' +
                      '<span class="t">' + b.t + "</span></button>";
                  }).join("") +
                "</div>" +
                '<div class="qz-setnote zk-nicknote" id="zk-nicknote" style="display:none">' +
                  "Dětem přezdívku vymyslíme, ať do ní nejde schovat vzkaz.</div>" +
              "</div>"
            : "") +
          '<div class="zk-field" id="zk-nickwrap">' +
            '<label class="qz-fieldlabel" for="zk-nick">Přezdívka</label>' +
            '<input class="qz-pname-in" id="zk-nick" maxlength="20" autocomplete="username" placeholder="Jak ti mají říkat" value="' +
              esc(stav.nick || "") + '">' +
          "</div>" +
          '<div class="zk-field">' +
            '<div class="zk-labelrow">' +
              '<label class="qz-fieldlabel" for="zk-pin">PIN (4 až 8 číslic)</label>' +
              // Zapomenutý PIN patří k poli s PINem, ne mezi hlavní akce dole.
              (isReg ? "" : '<button type="button" class="zk-linkbtn zk-forgot" id="zk-forgot">Zapomněl jsem PIN</button>') +
            "</div>" +
            '<input class="qz-pname-in" id="zk-pin" type="password" inputmode="numeric" maxlength="8" autocomplete="' +
              (isReg ? "new-password" : "current-password") + '" placeholder="••••">' +
          "</div>" +
          // E-mail je pořád NEPOVINNÝ a slouží jedinému účelu: obnově zapomenutého PINu
          // (rozhodnutí 2026-08-25). Nově se ale nabízí rovnou při zakládání, ne až
          // v Účtu — kdo ho vyplní až po tom, co PIN zapomněl, má smůlu. Pole je pod PINem,
          // logicky navazuje na "kdyby ti PIN vypadl z hlavy" (2026-08-31).
          (isReg
            ? '<div class="zk-field">' +
                '<label class="qz-fieldlabel" for="zk-email">E-mail <span class="zk-opt">nepovinný</span></label>' +
                '<input class="qz-pname-in" id="zk-email" type="email" maxlength="254" autocomplete="email" placeholder="Kdyby ti PIN vypadl z hlavy" value="' +
                  esc(stav.email || "") + '">' +
                '<div class="qz-setnote zk-mailnote" id="zk-mailnote">' +
                  "Jediné, k čemu ho použijeme, je obnova zapomenutého PINu. Můžeš ho nechat prázdný " +
                  "a doplnit později v Profilu.</div>" +
              "</div>"
            : "") +
          '<button class="qz-go" id="zk-go"' + (isReg ? " disabled" : "") + ">" +
            (isReg ? "Založit profil" : "Přihlásit se") + " " + handArrowSvg(false) + "</button>" +
        "</div>" +
        // Appka hráče OSLOVUJE, neodbavuje ho. Původní „Už tu hráče máš?" znělo
        // jako formulář na úřadě; tohle je otázka, kterou by položil člověk.
        '<div class="zk-authfoot">' +
          (isReg ? "Už se známe? " : "Ještě se neznáme? ") +
          '<button type="button" class="zk-linkbtn" id="zk-switch">' +
            (isReg ? "Přihlas se" : "Založ si profil") + "</button>" +
        "</div>" +
      "</div>" +   // .zk-authmain
      "</div>" +   // .zk-authgrid
      "</div></div>";

    // Chybějící obrázek nesmí nechat v kartě díru ani rozbitou ikonu.
    body.querySelectorAll(".zk-authcard img[data-fb]").forEach(function (im) {
      im.addEventListener("error", function () {
        if (im.dataset.fb === "hide") { im.style.display = "none"; return; }
        var s = document.createElement("span");
        s.className = "zk-fb";
        s.textContent = im.dataset.fb;
        if (im.parentNode) im.parentNode.replaceChild(s, im);
      });
    });

    // Pásmo se schválně NEPŘEDVYBÍRÁ: určuje fond otázek i žebříček natrvalo,
    // takže tichá výchozí hodnota by dítě zapsala mezi dospělé. Do té doby je
    // primární tlačítko disabled — stejný vzor jako S.bandTouched v sólo hře.
    var band = isReg ? null : "dospeli";
    var predvolba = isReg ? stav.band : null;
    var goBtn = body.querySelector("#zk-go");
    var bandsEl = body.querySelector("#zk-bands");
    if (bandsEl) {
      bandsEl.querySelectorAll(".zk-bandtile").forEach(function (c) {
        c.addEventListener("click", function () {
          bandsEl.querySelectorAll(".zk-bandtile").forEach(function (x) {
            x.classList.remove("on");
            x.setAttribute("aria-pressed", "false");
          });
          c.classList.add("on");
          c.setAttribute("aria-pressed", "true");
          band = c.dataset.band;
          goBtn.disabled = false;
          var wrap = body.querySelector("#zk-nickwrap");
          var note = body.querySelector("#zk-nicknote");
          wrap.style.display = band === "deti" ? "none" : "";
          note.style.display = band === "deti" ? "" : "none";
          // U dětského pásma je to adresa rodiče — dítě e-mail obvykle nemá a odkaz
          // na obnovu PINu má stejně přijít někomu dospělému. Sloupec `users.email`
          // proto schválně NEMÁ UNIQUE: rodič smí mít tutéž adresu u víc dětí.
          var mail = body.querySelector("#zk-email");
          var mnote = body.querySelector("#zk-mailnote");
          if (mail && mnote) {
            var deti = band === "deti";
            mail.placeholder = deti ? "E-mail rodiče" : "Kdyby ti PIN vypadl z hlavy";
            mnote.textContent = deti
              ? "Sem patří adresa rodiče. Použijeme ji jen na obnovu zapomenutého PINu a klidně ji nech prázdnou."
              : "Jediné, k čemu ho použijeme, je obnova zapomenutého PINu. Můžeš ho nechat prázdný a doplnit později v Profilu.";
          }
        });
      });
      if (predvolba) {
        var zvolena = bandsEl.querySelector('.zk-bandtile[data-band="' + predvolba + '"]');
        if (zvolena) zvolena.click();
      }
    }
    var zapomnel = body.querySelector("#zk-forgot");
    if (zapomnel) zapomnel.addEventListener("click", function () { renderForgot(); });
    body.querySelector("#zk-switch").addEventListener("click", function () {
      renderAuth(isReg ? "login" : "register");
    });
    // Enter ve formuláři odesílá — jinak by hráč musel po PINu ještě trefit tlačítko.
    body.querySelectorAll(".zk-authcard .qz-pname-in").forEach(function (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !goBtn.disabled) goBtn.click();
      });
    });
    // Po chybě kurzor rovnou do PINu (ten se maže), jinak fokus jen na velkém
    // displeji — na mobilu by hned po otevření vyskočila klávesnice přes půl obrazovky.
    if (msg) {
      body.querySelector("#zk-pin").focus();
    } else if (!isReg && window.matchMedia && window.matchMedia("(min-width: 900px)").matches) {
      body.querySelector("#zk-nick").focus();
    }
    goBtn.addEventListener("click", function () {
      var nick = band === "deti" ? "" : ((body.querySelector("#zk-nick") || {}).value || "");
      var pin = body.querySelector("#zk-pin").value || "";
      var path = isReg ? "/auth/register" : "/auth/login";
      var mailEl = body.querySelector("#zk-email");
      var email = mailEl ? mailEl.value.trim() : "";
      var payload = isReg ? { band: band, pin: pin, nick: nick } : { nick: nick, pin: pin };
      // Prázdný e-mail se neposílá vůbec, ať ho server nemusí odlišovat od vyplněného.
      if (isReg && email) payload.email = email;
      req(path, { method: "POST", body: payload }).then(function (r) {
        if (r.status !== 200 && r.status !== 201) {
          // Po chybě se vrací i vyplněný e-mail — jinak by ho hráč po překlepu v PINu psal znovu.
          return renderAuth(mode, (r.body && r.body.error) || "Nepovedlo se.", { band: band, nick: nick, email: email });
        }
        token.set(r.body.token);
        S.me = r.body;
        if (isReg && band === "deti") {
          say("Tvoje jméno je " + r.body.nick + ". Zapamatuj si ho, budeš se jím přihlašovat.");
        }
        refreshMe(function () {
          var duel = pendingDuel();
          if (duel) return joinFromLink(duel);
          renderLobby();
        });
      });
    });
  }

  // ---------------------------------------------------------------- účet
  // E-mail je NEPOVINNÝ a slouží jedinému účelu: obnově zapomenutého PINu.
  // Bez něj se PIN obnovit nedá — proto to obrazovka říká rovnou, ne až bude pozdě.
  //
  // Vzhled se sem SCHVÁLNĚ nekopíruje z přihlašovací karty. Auth karta je vstupní
  // bod s jednou úlohou a jedinou barevnou akcí; účet je nastavení uvnitř lobby
  // a má dvě nezávislé věci (e-mail / odhlášení), které se nesmí slít dohromady.
  // Sdílené zůstává všechno ostatní: papír, rámečky, velikost polí, chybová lišta.
  //
  // Volá se i přímo z dlaždice v lobby (`on("zk-account", renderAccount)`), takže
  // prvním argumentem bývá MouseEvent — odtud ty kontroly na `typeof === "string"`.
  function renderAccount(msg, hotovo) {
    stopAll();
    var m = S.me || {};
    var maDeti = m.band === "deti";
    var PASMA_T = { deti: "Děti", starsi: "Puberťáci", dospeli: "Dospělí" };
    var PASMA = [
      { id: "deti", t: "Děti", fb: "🧒" },
      { id: "starsi", t: "Puberťáci", fb: "🧑‍🎓" },
      { id: "dospeli", t: "Dospělí", fb: "🧑" },
    ];
    say(m.email
      ? "E-mail máš uložený. Když zapomeneš PIN, pošleme na něj odkaz."
      : "E-mail je nepovinný. Bez něj ale zapomenutý PIN nikdo neobnoví.");
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap zk-acc">' +
      backBar("Zpět", renderLobby) +
      "<h2>Profil</h2>" +
      // Kdo je přihlášený, se hráč nikde jinde v nastavení nedozví — a odhlašovací
      // tlačítko dole má smysl až ve chvíli, kdy je vidět, koho vlastně odhlašuje.
      '<div class="zk-idrow">' +
        '<span class="zk-idnick">' + esc(m.nick || "") + "</span>" +
        (PASMA_T[m.band] ? '<span class="zk-idband">' + PASMA_T[m.band] + "</span>" : "") +
      "</div>" +
      (typeof msg === "string" && msg ? '<div class="zk-autherr">' + errBox(msg) + "</div>" : "") +
      (typeof hotovo === "string" && hotovo ? '<div class="zk-okbox">' + esc(hotovo) + "</div>" : "") +

      '<div class="zk-sect">' +
        '<h3>E-mail pro obnovu PINu' +
          (maDeti ? '<span class="zk-h3note">vyplní rodič</span>' : "") + "</h3>" +
        '<div class="zk-sectnote">Nepovinný a k ničemu jinému ho nepoužijeme. Kdybys zapomněl PIN, ' +
          "přijde na něj odkaz na nastavení nového. Bez e-mailu se profil obnovit nedá.</div>" +
        (m.email
          ? '<div class="zk-status on"><span class="zk-statusico">✓</span><div>' +
              "<b>" + esc(m.email) + "</b>" +
              '<span class="d">Sem dorazí odkaz, když si na PIN nevzpomeneš.</span></div></div>'
          : '<div class="zk-status off"><span class="zk-statusico">!</span><div>' +
              "<b>Zatím žádný</b>" +
              '<span class="d">Zapomenutý PIN by nešlo obnovit — profil i s ratingem by byl pryč.</span></div></div>') +
        '<div class="zk-form">' +
          '<div class="zk-field">' +
            '<label class="qz-fieldlabel" for="zk-email">' + (m.email ? "Nová adresa" : "E-mailová adresa") + "</label>" +
            '<input class="qz-pname-in" id="zk-email" type="email" maxlength="254" autocomplete="email" placeholder="Např. adresa@priklad.cz">' +
          "</div>" +
          '<div class="zk-field">' +
            '<label class="qz-fieldlabel" for="zk-epin">Potvrď svým PINem</label>' +
            '<input class="qz-pname-in" id="zk-epin" type="password" inputmode="numeric" maxlength="8" autocomplete="current-password" placeholder="••••">' +
            '<div class="qz-setnote">Ptáme se na PIN i u přihlášeného hráče — jinak by stačilo ' +
              "odemčené zařízení a profil se dá převést na cizí adresu.</div>" +
          "</div>" +
          '<button class="qz-go" id="zk-esave">' + (m.email ? "Změnit e-mail" : "Uložit e-mail") + " " + handArrowSvg(false) + "</button>" +
        "</div>" +
        // Mazání je tichý odkaz, ne druhé tlačítko: dřív mělo stejnou šířku i váhu
        // jako uložení, takže obě akce vypadaly jako rovnocenná nabídka.
        (m.email ? '<button type="button" class="zk-dangerlink" id="zk-edel">Smazat e-mail z profilu</button>' : "") +
      "</div>" +

      // Pásmo šlo do 2026-08-31 zvolit jen při registraci a pak už nikdy změnit —
      // kdo se seknul, musel založit nový účet. Není to tvrzení o věku (ověřit ho
      // nejde), ale volba fondu otázek, takže není důvod ho zamykat napořád.
      '<div class="zk-sect">' +
        "<h3>Pásmo — jaké otázky chceš dostávat</h3>" +
        '<div class="zk-sectnote">Dětské pásmo má vlastní fond otázek psaných pro děti; ' +
          "ostatní dvě losují z obecného fondu, puberťáci z jeho lehčí části. " +
          "Hraješ vždycky jen proti lidem ze stejného pásma.</div>" +
        '<div class="zk-bandpick" id="zk-accbands" role="group" aria-label="Věkové pásmo">' +
          PASMA.map(function (b) {
            var on = b.id === m.band;
            return '<button type="button" class="zk-bandtile' + (on ? " on" : "") +
              '" data-band="' + b.id + '" aria-pressed="' + (on ? "true" : "false") + '">' +
              '<img src="assets/band-' + b.id + '.jpg" alt="" data-fb="' + b.fb + '">' +
              '<span class="t">' + b.t + "</span></button>";
          }).join("") +
        "</div>" +
        '<div class="qz-setnote" id="zk-bandnote">Každé pásmo má vlastní rating — ten ' +
          "současný se nikam neztratí, ale v novém začínáš od začátku.</div>" +
        '<button class="qz-go" id="zk-bandsave" disabled>Změnit pásmo ' + handArrowSvg(false) + '</button>' +
      "</div>" +

      '<div class="zk-sect">' +
        "<h3>Přihlášení</h3>" +
        '<div class="zk-sectnote">Odhlášením se odpojíš jen z tohohle zařízení. Profil, rating i ' +
          "historie zůstávají — vrátíš se přezdívkou a PINem.</div>" +
        '<button type="button" class="qz-back" id="zk-logout">Odhlásit — přepnout na jiný profil</button>' +
      "</div></div>";

    function ulozit(metoda) {
      var pin = body.querySelector("#zk-epin").value || "";
      var telo = metoda === "DELETE" ? { pin: pin }
                                     : { email: body.querySelector("#zk-email").value || "", pin: pin };
      req("/auth/email", { method: metoda, body: telo }).then(function (r) {
        if (r.status !== 200) return renderAccount((r.body && r.body.error) || "Nepovedlo se.");
        refreshMe(function () {
          // Bez potvrzení se po překreslení nezmění nic než maskovaná adresa v šedém
          // řádku — hráč pak neví, jestli uložení prošlo, nebo se nic nestalo.
          renderAccount("", metoda === "DELETE"
            ? "E-mail smazaný. Zapomenutý PIN teď obnovit nejde."
            : "Hotovo, e-mail uložený.");
        });
      });
    }
    body.querySelector("#zk-esave").addEventListener("click", function () { ulozit("PUT"); });
    var del = body.querySelector("#zk-edel");
    if (del) del.addEventListener("click", function () { ulozit("DELETE"); });
    body.querySelector("#zk-logout").addEventListener("click", function () {
      token.clear(); S = {}; renderAuth();
    });

    // Změna pásma. Tlačítko je disabled, dokud hráč neklikne na JINÉ pásmo, než
    // ve kterém je — jinak by šlo „uložit" stav, který už platí, a hráč by čekal,
    // že se něco stalo.
    var accBands = body.querySelector("#zk-accbands");
    var bandSave = body.querySelector("#zk-bandsave");
    var bandNote = body.querySelector("#zk-bandnote");
    var novePasmo = m.band;
    accBands.querySelectorAll(".zk-bandtile").forEach(function (c) {
      c.addEventListener("click", function () {
        accBands.querySelectorAll(".zk-bandtile").forEach(function (x) {
          x.classList.remove("on");
          x.setAttribute("aria-pressed", "false");
        });
        c.classList.add("on");
        c.setAttribute("aria-pressed", "true");
        novePasmo = c.dataset.band;
        bandSave.disabled = novePasmo === m.band;
        // Přechod do dětského pásma přezdívku přepíše — to se musí říct PŘEDEM,
        // ne až se stane. Dětský prostor je schválně bez volného textu.
        bandNote.textContent = novePasmo === "deti" && m.band !== "deti"
          ? "V dětském pásmu přezdívky vymýšlíme my, ať do nich nejde schovat vzkaz — "
            + "tvoje současná se tím přepíše. Rating má každé pásmo vlastní, ten "
            + "současný se nikam neztratí."
          : "Každé pásmo má vlastní rating — ten současný se nikam neztratí, ale "
            + "v novém začínáš od začátku.";
      });
    });
    bandSave.addEventListener("click", function () {
      bandSave.disabled = true;
      req("/auth/band", { method: "PUT", body: { band: novePasmo } }).then(function (r) {
        if (r.status !== 200) return renderAccount((r.body && r.body.error) || "Nepovedlo se.");
        refreshMe(function () {
          renderAccount("", "Pásmo změněno na „" + (PASMA_T[novePasmo] || novePasmo) + "“."
            + (r.body && r.body.nick !== m.nick ? " Nová přezdívka: " + r.body.nick + "." : ""));
        });
      });
    });

    // Enter kdekoli ve dvojici polí odesílá — jinak by hráč po PINu musel trefit tlačítko.
    body.querySelectorAll(".zk-sect .qz-pname-in").forEach(function (inp) {
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") ulozit("PUT"); });
    });
  }

  // ---------------------------------------------------------------- zapomenutý PIN
  // Plnohodnotný krok přihlašovacího toku (kliká se sem přímo z přihlašovací karty),
  // takže tatáž karta. Hero fotku ale NEMÁ: hráč ji viděl před vteřinou na obrazovce,
  // ze které přišel, a druhá kopie by jen odsunula jediné pole pod okraj displeje.
  // Kontext tu nese štítek + nadpis, ne obrázek.
  function renderForgot(msg, hotovo) {
    stopAll();
    say(hotovo
      ? "Mrkni do pošty. Odkaz platí půl hodiny."
      : "Odkaz na obnovu pošleme na e-mail, který máš u profilu.");
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap zk-auth">' +
      backBar("Zpět", function () { renderAuth("login"); }) +
      '<div class="zk-authcard zk-nohero">' +
        '<div class="zk-authtag">Obnova PINu</div>' +
        "<h2>Zapomenutý PIN</h2>" +
        '<div class="zk-sub">' +
          (hotovo
            ? "Dál to pokračuje v e-mailu."
            : "Napiš přezdívku. Na e-mail u profilu pošleme odkaz, kterým si nastavíš nový PIN.") +
        "</div>" +
        (typeof msg === "string" && msg ? '<div class="zk-autherr">' + errBox(msg) + "</div>" : "") +
        (hotovo
          // Po odeslání formulář mizí: opakované klikání na „Poslat odkaz" nic
          // nepřidá (server má na účet limit 3 odkazy za hodinu) a jen by mátlo.
          ? '<div class="zk-donebox"><span class="zk-doneico">✓</span>' +
              '<div class="zk-donetext">' + esc(hotovo) + "</div></div>" +
            '<button class="qz-go" id="zk-fback">Zpět na přihlášení ' + handArrowSvg(false) + '</button>' +
            '<div class="zk-authnote">Odkaz platí půl hodiny od odeslání.</div>' +
            '<div class="zk-authfoot">Spletl ses ve jméně? ' +
              '<button type="button" class="zk-linkbtn" id="zk-fagain">Zkusit jinou přezdívku</button></div>'
          : '<div class="zk-form">' +
              '<div class="zk-field">' +
                '<label class="qz-fieldlabel" for="zk-fnick">Přezdívka</label>' +
                '<input class="qz-pname-in" id="zk-fnick" maxlength="20" autocomplete="username" placeholder="Jak ti říkáme">' +
              "</div>" +
              '<button class="qz-go" id="zk-fgo">Poslat odkaz ' + handArrowSvg(false) + '</button>' +
            "</div>" +
            '<div class="zk-authfoot">Profil bez e-mailu obnovit nejde. ' +
              '<button type="button" class="zk-linkbtn" id="zk-fnew">Založ si nový profil</button></div>') +
      "</div></div>";

    function odeslat() {
      var nick = body.querySelector("#zk-fnick").value || "";
      req("/auth/reset", { method: "POST", body: { nick: nick } }).then(function (r) {
        if (r.status !== 200) return renderForgot((r.body && r.body.error) || "Nepovedlo se.");
        renderForgot("", (r.body && r.body.zprava) || "Pokud profil e-mail má, odkaz je na cestě.");
      });
    }
    var go = body.querySelector("#zk-fgo");
    if (go) {
      go.addEventListener("click", odeslat);
      body.querySelector("#zk-fnick").addEventListener("keydown", function (e) {
        if (e.key === "Enter") odeslat();
      });
    }
    var znovu = body.querySelector("#zk-fagain");
    if (znovu) znovu.addEventListener("click", function () { renderForgot(); });
    var novy = body.querySelector("#zk-fnew");
    if (novy) novy.addEventListener("click", function () { renderAuth("register"); });
    var zpet = body.querySelector("#zk-fback");
    if (zpet) zpet.addEventListener("click", function () { renderAuth("login"); });
  }

  // ---------------------------------------------------------------- nový PIN z odkazu
  // Odkaz z e-mailu míří na /?obnova=TOKEN. Stejně jako u pozvánky na souboj se
  // parametr po použití z adresy maže, ať se obrazovka nevrací při dalším otevření.
  function pendingReset() {
    return new URLSearchParams(location.search).get("obnova");
  }

  // Jediná obrazovka appky, na kterou se dá přijít zvenčí a bez kontextu — hráč sem
  // spadne rovnou z odkazu v e-mailu, často na cizím zařízení a klidně za týden.
  // Proto jako jediná z obnovovacího toku DRŽÍ hero fotku i celou hlavičku karty:
  // musí sama o sobě říct, kam přišel a co se po něm chce, ne jen ukázat pole.
  function renderResetPin(tok, msg) {
    stopAll();
    say("Nastav si nový PIN. Starý už platit nebude.");
    function zahodOdkaz() { history.replaceState(null, "", location.pathname); }
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap zk-auth">' +
      backBar("Zpět", function () { zahodOdkaz(); renderAuth("login"); }) +
      '<div class="zk-authcard">' +
        '<img class="zk-authhero" src="' + AUTH_HERO + '" alt="" data-fb="hide">' +
        '<div class="zk-authtag">Obnova PINu</div>' +
        "<h2>Nový PIN</h2>" +
        '<div class="zk-sub">Přišel jsi z odkazu v e-mailu. Zvol si nový PIN — starý přestane ' +
          "platit a rovnou tě přihlásíme.</div>" +
        (typeof msg === "string" && msg ? '<div class="zk-autherr">' + errBox(msg) + "</div>" : "") +
        '<div class="zk-form">' +
          '<div class="zk-field">' +
            '<label class="qz-fieldlabel" for="zk-npin">Nový PIN (4 až 8 číslic)</label>' +
            '<input class="qz-pname-in" id="zk-npin" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password" placeholder="••••">' +
          "</div>" +
          '<button class="qz-go" id="zk-ngo">Nastavit a přihlásit ' + handArrowSvg(false) + '</button>' +
        "</div>" +
        // Odkaz je jednorázový a půl hodiny platný, takže „vypršel" je běžný konec,
        // ne výjimka — cesta k novému musí být rovnou tady, ne až v chybové hlášce.
        '<div class="zk-authfoot">Odkaz už nefunguje? ' +
          '<button type="button" class="zk-linkbtn" id="zk-nagain">Nech si poslat nový</button></div>' +
      "</div></div>";

    body.querySelectorAll(".zk-authcard img[data-fb]").forEach(function (im) {
      im.addEventListener("error", function () { im.style.display = "none"; });
    });

    var znovu = body.querySelector("#zk-nagain");
    if (znovu) znovu.addEventListener("click", function () { zahodOdkaz(); renderForgot(); });

    var pinIn = body.querySelector("#zk-npin");
    var goBtn = body.querySelector("#zk-ngo");
    pinIn.addEventListener("keydown", function (e) { if (e.key === "Enter") goBtn.click(); });
    goBtn.addEventListener("click", function () {
      var pin = pinIn.value || "";
      req("/auth/reset/confirm", { method: "POST", body: { token: tok, pin: pin } }).then(function (r) {
        if (r.status !== 200) return renderResetPin(tok, (r.body && r.body.error) || "Nepovedlo se.");
        zahodOdkaz();
        token.set(r.body.token);
        refreshMe(renderLobby);
      });
    });
  }

  // ---------------------------------------------------------------- rozcestník
  // Ikony utilit. Vlastní kopie schválně: ICO_* v quiz.js jsou uzavřené v tamní closure
  // a online.js na ně nedosáhne. Držet je drobné a jednobarevné — utility se NEMAJÍ
  // tvářit jako herní režimy, od toho jsou nahoře malované dlaždice.
  var ICO_BOARD = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 20V11M12 20V5M19 20v-6" stroke="#2a7f7f" stroke-width="2.4" stroke-linecap="round"/></svg>';
  var ICO_FRIENDS = '<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="#2a7f7f" stroke-width="2"/><path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" stroke="#2a7f7f" stroke-width="2" stroke-linecap="round"/><path d="M16 6.2a3.2 3.2 0 010 6M17.5 14.6c2.1.5 3.5 2.1 3.5 4.4" stroke="#2a7f7f" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICO_ACCOUNT = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#2a7f7f" stroke-width="2"/><path d="M5 19.5c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5" stroke="#2a7f7f" stroke-width="2" stroke-linecap="round"/></svg>';

  // Datum pro razítko „denní pětku už mám za sebou". Server je zdrojem pravdy (vrací
  // `already_played`), tohle je jen nápověda do dlaždice, aby se hráč nemusel proklikat.
  function dnesniDatum() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function dailyHotovo() { try { return localStorage.getItem("zk_daily_done") === dnesniDatum(); } catch (e) { return false; } }
  function oznacDailyHotovo() { try { localStorage.setItem("zk_daily_done", dnesniDatum()); } catch (e) {} }

  // `msg` je chybová hláška, ale renderLobby se na šesti místech předává rovnou jako
  // klikací handler (`backBar("Zpět", renderLobby)`), takže dostane MouseEvent — a ten
  // by se přes esc() vykreslil jako červené „[object MouseEvent]". Ostatní obrazovky
  // (renderAccount, renderTournaments, renderFriends) ten guard mají; tady chyběl.
  function renderLobby(msg) {
    if (typeof msg !== "string") msg = "";
    stopAll();
    var r = (S.me.ratings || []).filter(function (x) { return x.band === S.me.band; })[0];
    var v = vokativ(S.me.nick);
    say(v ? "Vítej zpátky, " + v + "." : "Vítej zpátky!");
    var hotovo = dailyHotovo();
    var t = LOBBY_TEXTY[S.me.band] || LOBBY_TEXTY.dospeli;
    // Rating dává smysl teprve ve chvíli, kdy je z čeho ho počítat — do té doby se
    // vysvětluje, co to vlastně je, místo aby se ukázalo holé číslo bez kontextu.
    var ratingText = !r ? ""
      : r.games ? t.ratingN + " Po " + r.games + " " + plur(r.games, "hře", "hrách", "hrách") +
                  " máš <b>" + r.rating + "</b>."
                : t.rating0;

    body.innerHTML =
      '<div class="qz-screen qz-modepick zk-wrap zk-lobby">' +
      backBar("Zpět do hry", leave) +
      "<h2>Světová liga</h2>" +
      errBox(msg) +
      // Uvítání místo dřívějšího proužku „Kuba · PUBERŤÁCI · Rating 1500 · Zatím
      // nezahráno" — ten byl sice úsporný, ale hráč z něj nepoznal, co která věc znamená.
      '<div class="zk-welcome">' +
        '<p class="zk-wel-hi">' + pozdrav(S.me.nick, t.uvod) + "</p>" +
        '<p class="zk-wel-l">' + t.pasmo + "</p>" +
        '<p class="zk-wel-l">' + t.souperi + "</p>" +
        (ratingText ? '<p class="zk-wel-l">' + ratingText + "</p>" : "") +
      "</div>" +
      // JEDNA hlavní akce — hráč přišel hrát, ne spravovat účet.
      // Popisek říká MECHANIKU, ne slib (sousední dlaždice taky: „Pět otázek, jeden
      // pokus"). Čísla musí sedět s TIME_CONTROLS.blesk ve functions/_lib/game.js —
      // startQueue níž posílá time_control "blesk" (10 otázek, 10 s na každou).
      '<button class="zk-hero" id="zk-live">' +
        dlazdiceObr("zk-live", "🎯") +
        '<span class="zk-herotext"><span class="t">Hrát teď</span>' +
        // Nezlomitelná mezera před „každou": na telefonu se popisek láme na dva řádky
        // a bez ní zůstane na druhém osamocené slovo. Takhle vyjde „…deset vteřin" /
        // „na každou." Na desktopu je to jeden řádek, takže tam nemění nic.
        '<span class="d">Deset otázek, deset vteřin na&nbsp;každou.</span></span>' +
        '<span class="zk-heroarrow">' + handArrowSvg(false) + '</span>' +
      "</button>" +
      // další způsoby hry
      '<div class="zk-plays">' +
        hraciDlazdice("zk-daily", "Denní pětka", hotovo ? "Dnes hotovo ✓" : "Pět otázek, jeden pokus", "🗓") +
        hraciDlazdice("zk-link", "Souboj na odkaz", "Pošli odkaz kamarádovi", "✉") +
        hraciDlazdice("zk-tourney", "Turnaj", "Co nejvíc kol za daný čas", "🏆") +
      "</div>" +
      // utility — jen ikona a slovo, žádné popisky
      '<div class="zk-utils">' +
        utilTlacitko("zk-board", "Žebříček", ICO_BOARD) +
        utilTlacitko("zk-friends", "Přátelé", ICO_FRIENDS) +
        utilTlacitko("zk-account", "Profil", ICO_ACCOUNT) +
      "</div></div>";

    on("zk-live", startQueue);
    on("zk-link", createLink);
    on("zk-daily", startDaily);
    on("zk-tourney", renderTournaments);
    on("zk-board", renderBoard);
    on("zk-friends", renderFriends);
    on("zk-account", renderAccount);
  }

  // Obrázek dlaždice s emoji fallbackem — stejný vzor jako offline rozcestník v quiz.js,
  // takže chybějící ilustrace appku nerozbije, jen spadne na emoji.
  function dlazdiceObr(name, emoji) {
    return '<span class="zk-ic"><img src="assets/' + name + '.jpg" alt="" ' +
           "onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex'\">" +
           '<span class="zk-ic-fb" style="display:none">' + emoji + "</span></span>";
  }
  function hraciDlazdice(id, t, d, emoji) {
    return '<button class="zk-play" id="' + id + '">' + dlazdiceObr(id, emoji) +
           '<span class="t">' + esc(t) + '</span><span class="d">' + esc(d) + "</span></button>";
  }
  function utilTlacitko(id, t, ico) {
    return '<button class="zk-util" id="' + id + '">' + ico + "<span>" + esc(t) + "</span></button>";
  }
  function on(id, fn) {
    var el = body.querySelector("#" + id);
    if (el) el.addEventListener("click", fn);
  }

  // ---------------------------------------------------------------- fronta
  function startQueue() {
    stopAll();
    say("Hledám soupeře…");
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap">' +
      backBar("Zrušit hledání", function () {
        // stopAll() PRVNÍ, ještě před DELETE — jinak dotazování na /match tiká dál a jeho
        // odpověď může dorazit dřív než DELETE a vtáhnout hráče do hodnocené hry, kterou
        // právě zrušil (okno stovek ms z dvousekundového cyklu).
        stopAll();
        req("/match", { method: "DELETE" }).then(function (r) {
          // Souběh: zrušil jsem hledání v tutéž chvíli, kdy mě někdo spároval. Server to
          // pozná a vrátí matched — jdeme do té hry, ne do lobby, jinak by visela do
          // expirace a připsala se jako prohra za partii, kterou jsem nikdy neviděl.
          if (r.body && r.body.matched) return beginGame(r.body.game_id, "duel", r.body.opponent);
          renderLobby();
        });
      }) +
      "<h2>Hledám soupeře</h2>" +
      '<div class="qz-setcard" style="text-align:center">' +
        '<div class="zk-radar"><span></span><span></span><span></span></div>' +
        '<div class="qz-q" id="zk-qstat">Hledám soupeře…</div>' +
        '<div class="qz-setnote">Páruje se uvnitř tvého pásma.</div>' +
        // Tlačítko pro netrpělivé: přeskočí těch pár vteřin hledání a nastoupí hned.
        '<button class="qz-back" id="zk-bot" style="width:100%;justify-content:center;margin-top:.7rem">Nechce se ti čekat? Hrát hned ' + handArrowSvg(false) + '</button>' +
      "</div></div>";

    var stat = body.querySelector("#zk-qstat");
    var botBtn = body.querySelector("#zk-bot");

    // Řídká základna: dva lidé se ve stejném okně skoro nepotkají, takže po pár vteřinách
    // hledání nastoupí soupeř AUTOMATICKY — hráč nečeká na nikoho. Reálný člověk se stihne
    // spárovat dřív (větev matched), tuhle chvíli hlásí server přes offer_bot. `vzato`
    // hlídá, ať se souboj založí právě jednou (poll i klik nesmí střelit dvakrát).
    var vzato = false;
    function vezmiSoupere() {
      if (vzato) return;
      vzato = true;
      stopAll();
      stat.textContent = "Soupeř nalezen!";
      req("/match", { method: "DELETE" }).then(createLink.bind(null, true));
    }
    botBtn.addEventListener("click", vezmiSoupere);

    req("/match", { method: "POST", body: { time_control: "blesk" } }).then(function (r) {
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "Nepovedlo se.");
      if (r.body.matched) return beginGame(r.body.game_id, "duel", r.body.opponent);
      var waited = 0;
      poll = setInterval(function () {
        waited += 2;
        req("/match").then(function (p) {
          if (!p.body) return;
          if (p.body.matched) { stopAll(); return beginGame(p.body.game_id, "duel", p.body.opponent); }
          if (p.body.offer_bot) return vezmiSoupere();
          stat.textContent = "Hledám soupeře… " + waited + " s";
        });
      }, 2000);
    });
  }

  // ---------------------------------------------------------------- souboj na odkaz
  // `proKoho` je jen jméno do textu (výzva z Přátel) — API přímé vyzvání neumí,
  // odkaz je pořád stejný, jen se hráči řekne, komu ho má poslat.
  function createLink(withBot, proKoho) {
    stopAll();
    req("/game", { method: "POST", body: { mode: "odkaz", time_control: "blesk" } }).then(function (r) {
      if (r.status !== 201) return renderLobby((r.body && r.body.error) || "Nepovedlo se.");
      var id = r.body.id;
      if (withBot === true) {
        return req("/game/" + id + "/bot", { method: "POST" }).then(function (b) {
          var jmeno = souperJmeno((b.body && b.body.bot && b.body.bot.nick) || "", true, id);
          say("Nastoupil " + jmeno + ".");
          beginGame(id, "odkaz", { nick: jmeno });
        });
      }
      var url = location.origin + location.pathname + "?duel=" + id;
      say(proKoho ? "Pošli odkaz hráči " + proKoho + " a hraj." : "Pošli odkaz a hraj. Soupeř dostane stejné otázky.");
      // Pořadí akcí je schválně obrácené proti původnímu stavu: hrát se dá HNED,
      // čekání na kamaráda není podmínka. Kopírování odkazu je tichá vedlejší akce.
      body.innerHTML =
        '<div class="qz-screen qz-setup zk-wrap">' +
        backBar("Zpět", renderLobby) +
        "<h2>Souboj na odkaz</h2>" +
        '<div class="qz-setcard zk-form">' +
          '<button class="qz-go" id="zk-play">Zahrát si svoji půlku ' + handArrowSvg(false) + '</button>' +
          '<div class="qz-setnote" style="margin:.7rem 0 .2rem">' +
            (proKoho ? "Odkaz pošli hráči <b>" + esc(proKoho) + "</b>. " : "") +
            "Soupeř dostane stejné otázky ve stejném pořadí. Jeho výsledek uvidíš, až dohrajete oba.</div>" +
          '<label class="qz-fieldlabel" for="zk-url">Odkaz pro soupeře</label>' +
          '<input class="qz-pname-in" id="zk-url" readonly value="' + esc(url) + '">' +
          '<button class="qz-back" id="zk-copy" style="margin:.6rem 0 0">Zkopírovat odkaz</button>' +
        "</div></div>";
      body.querySelector("#zk-copy").addEventListener("click", function () {
        var inp = body.querySelector("#zk-url");
        inp.select();
        try { navigator.clipboard.writeText(url); } catch (e) { try { document.execCommand("copy"); } catch (e2) {} }
        this.textContent = "Zkopírováno";
      });
      body.querySelector("#zk-play").addEventListener("click", function () {
        beginGame(id, "odkaz", null);
      });
    });
  }

  function joinFromLink(id) {
    stopAll();
    req("/game/" + id + "/join", { method: "POST" }).then(function (r) {
      history.replaceState(null, "", location.pathname);
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "K souboji se nejde připojit.");
      say("Jsi v souboji. Stejné otázky jako soupeř.");
      beginGame(id, "odkaz", null);
    });
  }

  // ---------------------------------------------------------------- denní pětka
  function startDaily() {
    stopAll();
    req("/daily").then(function (r) {
      if (r.status !== 200 && r.status !== 201) {
        return renderLobby((r.body && r.body.error) || "Nepovedlo se.");
      }
      if (r.body.already_played) {
        oznacDailyHotovo();          // ať to dlaždice v lobby ukáže rovnou, bez prokliku
        say("Dnešní pětku už máš za sebou.");
        return showResult(r.body.game_id, "daily");
      }
      say("Pět otázek, pro všechny dnes stejných. Jeden pokus.");
      beginGame(r.body.game_id, "daily", null);
    });
  }

  // ---------------------------------------------------------------- hra
  function beginGame(id, mode, opponent, tournamentId) {
    stopAll();
    S.game = { id: id, mode: mode, n: 0, opponent: opponent, score: 0, tournamentId: tournamentId || null };
    req("/game/" + id).then(function (r) {
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "Hra se nenačetla.");
      S.game.total = r.body.total;
      S.game.n = r.body.me.answered;
      S.game.score = r.body.me.score;
      if (r.body.me.done) return showResult(id, mode, tournamentId);
      nextQuestion();
    });
  }

  /* Rám s glóbem a ilustrací u otázky (2026-09-03). Online si otázku kresli sám, takže
   * mu tenhle rám do teď chyběl — hráč u zeměpisné otázky neviděl, kde ta země je.
   * Kreslí ho quiz.js přes `window.ZKPicframe`; když modul chybí (samostatně nasazený
   * online, jiný pořádek skriptů), vrátí se prázdný řetězec a mřížka `.qz-play` dá kartě
   * obě sloupce — přesně jako dřív. Proto to nikde nekontroluje `if` navíc.
   *
   * `cc` posílá server od téhož data; u starší rozehrané hry chybět může, takže se
   * dobere z prefixu `id` (`se-k-…`). Bez něj by glóbus mířil na fallback [0,20],
   * tedy do Guinejského zálivu — přesně chyba, co se řešila 2026-08-29. */
  function picframe(q) {
    if (!window.ZKPicframe) return "";
    return window.ZKPicframe.html({
      id: q.id, cc: q.cc || String(q.id || "").split("-")[0],
      country: q.country, section: q.section,
    });
  }
  function zapojPicframe(q) {
    if (!window.ZKPicframe) return;
    window.ZKPicframe.wire();
    window.ZKPicframe.globe(q.cc || String(q.id || "").split("-")[0]);
  }

  /* Hlášky pro vypršení času.
   *
   * Server u neodpovězené otázky posílá `quip_wrong`, jenže ta je podle standardu
   * (2026-08-15) psaná jako reakce na KONKRÉTNÍ špatný tip — u kondora tedy „Mimo
   * tentokrát…", ačkoli hráč nic nevybral. Takový text mluví o něčem, co se nestalo.
   * Offline hra tohle řeší odjakživa vlastním fondem, online ho jen nikdy nepoužil.
   *
   * Fond se NEKOPÍRUJE do kódu — bere se z `data/fondy.json`, tedy z téhož souboru,
   * ze kterého ho čte quiz.js (`timeoutReveal`). Dvě kopie hlášek by se rozešly.
   * Načítá se jednou a dopředu (při otázce), aby vykreslení odpovědi nečekalo na síť;
   * dokud nedoběhne nebo když selže, platí `TIMEOUT_ZALOHA`. */
  var timeoutQuips = null;
  var TIMEOUT_ZALOHA = "Čas vypršel — tahle otázka ti ujela.";
  function nactiTimeoutQuips() {
    if (timeoutQuips) return;
    fetch("data/fondy.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (f) { timeoutQuips = (f && f.timeout) || []; })
      .catch(function () { timeoutQuips = []; });
  }
  function timeoutQuip() {
    var f = timeoutQuips || [];
    return f.length ? f[Math.floor(Math.random() * f.length)] : TIMEOUT_ZALOHA;
  }

  function nextQuestion() {
    stopAll();
    nactiTimeoutQuips();
    var g = S.game;
    if (g.n >= g.total) return showResult(g.id, g.mode, g.tournamentId);

    req("/game/" + g.id + "/q/" + g.n).then(function (r) {
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "Otázka se nenačetla.");
      var q = r.body;
      say("Tak schválně…");
      body.innerHTML =
        '<div class="qz-screen qz-play">' +
        '<div class="qz-top"><span class="qz-progress">Otázka ' + (q.n + 1) + "/" + q.total + "</span>" +
          '<span class="qz-scorepill" id="zk-score">' + starScore(g.score) + "</span>" +
          '<span class="qz-meta zk-oppbar" id="zk-opp"></span></div>' +
        '<div class="qz-box" id="qz-box">' +
          '<div class="qz-timerbar" id="zk-timer"><div style="width:100%"></div></div>' +
          // Štítek obtížnosti kreslí quiz.js (`window.ZKDiff`) — SVG hvězd se nekopíruje.
          // Když modul chybí, řádek prostě zůstane bez štítku, stejně jako do teď.
          '<div class="qz-meta">' + esc(q.country) + " · " + esc(q.section) +
            (window.ZKDiff ? " · " + window.ZKDiff.html(q) : "") + "</div>" +
          '<div class="qz-q">' + esc(q.question) + "</div>" +
          '<div class="qz-ans">' + q.options.map(function (o, i) {
            return '<button class="qz-a" data-i="' + i + '">' + esc(o) +
                   "<small>" + "ABCD"[i] + "</small></button>";
          }).join("") + "</div>" +
        "</div>" + picframe(q) + "</div>";
      zapojPicframe(q);

      var started = Date.now();
      var bar = body.querySelector("#zk-timer").firstElementChild;
      var limitMs = q.limit_s * 1000;
      timer = setInterval(function () {
        var left = limitMs - (Date.now() - started);
        bar.style.width = Math.max(0, (left / limitMs) * 100) + "%";
        if (left <= 0) { clearInterval(timer); timer = null; submit(q, -1, limitMs); }
      }, 100);

      body.querySelectorAll("#qz-box .qz-a").forEach(function (btn) {
        btn.addEventListener("click", function () {
          submit(q, +btn.dataset.i, Date.now() - started);
        });
      });

      if (g.mode === "duel" || g.mode === "turnaj") watchOpponent();
    });
  }

  /** Průběh soupeře během živého duelu — obdoba šachových hodin. */
  function watchOpponent() {
    var el = body.querySelector("#zk-opp");
    if (!el) return;
    poll = setInterval(function () {
      req("/game/" + S.game.id + "/live").then(function (r) {
        // Odpojený element znamená, že hráč z obrazovky odešel — dotazování se musí ZASTAVIT,
        // ne jen přeskočit zápis. Dřív tu byl holý `return`, takže interval běžel donekonečna.
        if (!el.isConnected) { if (poll) { clearInterval(poll); poll = null; } return; }
        var o = r.body && r.body.opponent;
        if (!o) return;
        el.innerHTML = esc(souperJmeno(o.nick, o.is_bot, S.game.id)) + ": " + o.answered + "/" + S.game.total +
                       (o.score != null ? " · " + starScore(o.score) : "");
      });
    }, 2000);
  }

  // Odeslání odpovědi je nejdražší request celé hry: když selže, hráč přijde o rozehranou
  // partii. Proto se výpadek sítě (status 0) jednou zopakuje — teprve pak to vzdáme.
  // Chybové odpovědi serveru (4xx/5xx) se neopakují, ty by dopadly stejně.
  function odesliOdpoved(path, opts, pokus) {
    return req(path, opts).then(function (r) {
      if (r.status !== 0 || (pokus || 0) >= 1) return r;
      return new Promise(function (s) { setTimeout(s, 700); })
        .then(function () { return odesliOdpoved(path, opts, (pokus || 0) + 1); });
    });
  }

  function submit(q, pick, ms) {
    if (timer) { clearInterval(timer); timer = null; }
    body.querySelectorAll("#qz-box .qz-a").forEach(function (b) { b.disabled = true; });

    odesliOdpoved("/game/" + S.game.id + "/answer", {
      method: "POST", body: { n: q.n, pick: pick, ms: Math.round(ms) },
    }).then(function (r) {
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "Odpověď neprošla.");
      var a = r.body;
      S.game.score = a.score;
      S.game.n = a.answered;

      // Guard MUSÍ být před say()/reveal()/vykreslením — hráč mohl mezitím odejít
      // (křížek, zpět) a odpověď dorazila až potom. Dřív byl až za say(), takže na
      // rozcestníku problesklo „Správně!" v bublině hostitele. Stav (skóre) se ale
      // zapsat MÁ i tak, proto je guard až za jeho aktualizací.
      var box = body.querySelector("#qz-box");
      if (!box) return;

      // `locked` + štítek místo kolečka A–D: totéž, co dělá offline `answer()`. Bez toho
      // zůstane odznak tealovým kolečkem a zelený/červený text v něm má kontrast 1,45:1,
      // takže správnost nese fakticky jen barva rámečku (viz .qz-a.locked v quiz.css).
      var btns = body.querySelectorAll("#qz-box .qz-a");
      btns.forEach(function (b, i) {
        b.classList.add("locked");
        var s = b.querySelector("small");
        if (i === a.correct_index) { b.classList.add("ok"); if (s) s.textContent = "Správně"; }
        else if (i === pick) { b.classList.add("bad"); if (s) s.textContent = "Tvůj tip"; }
        else if (s) s.remove();
      });
      say(a.correct ? "Správně!" : pick === -1 ? "Čas vypršel." : "Tentokrát vedle.");
      // Ilustrace je odměna za odpověď, ne nápověda — do téhle chvíle je v rámu glóbus.
      if (window.ZKPicframe) window.ZKPicframe.reveal();
      var pill = body.querySelector("#zk-score");
      if (pill) pill.innerHTML = starScore(a.score);

      var more = a.more_fact
        ? '<button class="qz-more" id="zk-more">Více o ' + esc(a.about || "tom") +
          ' <span class="qz-more-ico">💡</span></button>'
        : "";
      // Ilustrace se do karty UŽ NEVKLÁDÁ. Bývala tu proto, že online neměl rám s glóbem
      // a jinde by se obrázek neobjevil — od 2026-09-03 rám má (viz picframe() výš), takže
      // by se ilustrace kreslila dvakrát vedle sebe. Odhaluje ji `ZKPicframe.reveal()`
      // o kus níž, pořád až po odpovědi: obrázek často odpověď prozradí (kapr ve vaně
      // napoví, kam se dává kapr).
      // Při vypršení času nesmí jít do karty `quip_wrong` — ta reaguje na tip, který
      // hráč neudělal (viz nactiTimeoutQuips výš).
      var hlaska = pick === -1 ? timeoutQuip() : (a.quip || "");
      box.insertAdjacentHTML("beforeend",
        '<div class="qz-quipbox"><div class="qz-hlaska">' + esc(hlaska) + "</div></div>" +
        '<div class="qz-frow"><div class="qz-expl">' + esc(a.explanation || "") + "</div>" +
        '<div class="qz-fbtns">' + more +
        '<button class="qz-next" id="zk-next">' +
          (a.done ? "Výsledek" : "Další otázka") + " " + handArrowSvg(false) + "</button></div></div>");

      body.querySelector("#zk-next").addEventListener("click", function () {
        if (a.done) showResult(S.game.id, S.game.mode, S.game.tournamentId);
        else nextQuestion();
      });
      var m = body.querySelector("#zk-more");
      if (m) m.addEventListener("click", function () { showMore(a); });
    });
  }

  /** Náhradní karta „Více o…" — bez fotky, postavená z more_fact (CLAUDE.md 2026-07-31). */
  function showMore(a) {
    var ov = document.createElement("div");
    ov.className = "qz-cardov";
    ov.innerHTML =
      '<div class="qz-cardbox"><div class="qz-cardbody">' +
      "<h3>" + esc(a.correct_answer || a.about || "Více") + "</h3>" +
      "<p>" + esc(a.more_fact) + "</p>" +
      '<button class="qz-go" data-close="1">Zpět ke hře</button>' +
      "</div></div>";
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.dataset.close) ov.remove();
    });
    document.getElementById("qz-shell").appendChild(ov);
  }

  // ---------------------------------------------------------------- výsledek
  function showResult(id, mode, tournamentId) {
    stopAll();
    req("/game/" + id).then(function (r) {
      if (r.status !== 200) return renderLobby("Výsledek se nenačetl.");
      var g = r.body;
      if (mode === "daily") oznacDailyHotovo();   // razítko pro dlaždici v lobby
      var waiting = g.waiting_for_opponent ||
        (g.players.length > 1 && !g.players.every(function (p) { return p.done; }));

      var head;
      if (g.result === "vyhra") { head = "Vyhrál jsi!"; }
      else if (g.result === "prohra") { head = "Tentokrát soupeř."; }
      else if (g.result === "remiza") { head = "Remíza."; }
      else if (waiting) { head = "Máš odehráno. Čeká se na soupeře."; }
      else { head = "Dohráno."; }
      say(head);

      var rows = g.players.map(function (p) {
        return '<div class="qz-standrow"><span class="qz-standname">' +
          // Klíč jména je `id` z parametru, NE S.game.id: sem se dá dojít i cestou, která
          // beginGame() nikdy nevolala (denní pětka už odehraná → startDaily jde rovnou
          // na showResult), a tam je S.game undefined → výjimka a mrtvé tlačítko.
          esc(souperJmeno(p.nick, p.is_bot, id)) + "</span>" +
          '<span class="qz-standscore">' + (p.score == null ? "—" : starScore(p.score)) + "</span></div>";
      }).join("");

      var review = (g.review || []).map(function (it) {
        var mine = it.pick === it.correct_index;
        return '<div class="qz-standrow" style="align-items:flex-start;gap:.6rem">' +
          '<span style="min-width:1.6em;font-weight:700;color:' + (mine ? "var(--ok,#4e9e6f)" : "var(--bad,#cf5f4e)") + '">' +
          (mine ? "✓" : "✕") + "</span>" +
          "<span><b>" + esc(it.question) + "</b><br>" +
          "Správně: " + esc(it.options[it.correct_index]) +
          (it.pick >= 0 && !mine ? " · tvůj tip: " + esc(it.options[it.pick]) : "") +
          (it.pick === -1 ? " · nestihl jsi odpovědět" : "") +
          (it.opponent ? " · soupeř: " + (it.opponent.correct ? "trefil" : "minul") : "") +
          '<br><span class="qz-expl">' + esc(it.explanation || "") + "</span></span></div>";
      }).join("");

      var isTurnaj = mode === "turnaj" && tournamentId;
      var note = isTurnaj ? "Turnajové kolo — body se přičetly do žebříčku turnaje."
        : !g.rated ? "Nehodnocená hra."
        : waiting ? "Hodnocená hra — rating se přepočítá, až dohrajete oba."
        : "Hodnocená hra — rating se přepočítal.";
      // Pořadí obrácené: v turnaji jde o to odehrát co nejvíc kol, takže „Další kolo" je
      // hlavní akce a odchod do přehledu ta tichá. Dřív to bylo naopak — pokračovat
      // ve hře vypadalo slabší než z turnaje odejít.
      var buttons = isTurnaj
        ? '<button class="qz-more" id="zk-tback">Zpět do turnaje</button>' +
          '<button class="qz-next" id="zk-tnext">Další kolo ' + handArrowSvg(false) + '</button>'
        : (g.status === "done" && g.players.length > 1
            ? '<button class="qz-more" id="zk-rematch">Odveta</button>' : "") +
          '<button class="qz-next" id="zk-lobby">Zpět do online ' + handArrowSvg(false) + '</button>';

      body.innerHTML =
        '<div class="qz-screen qz-end zk-wrap">' +
        "<h2>" + esc(head) + "</h2>" +
        '<div class="qz-endscore">' + starScore(g.me.score) + "</div>" +
        '<div class="zk-rowlist">' + rows + "</div>" +
        '<div class="qz-setnote">' + note + "</div>" +
        (review ? '<h3 style="margin-top:1.2rem">Rozbor</h3><div class="zk-rowlist">' + review + "</div>" : "") +
        '<div class="qz-fbtns" style="margin-top:1.2rem">' + buttons + "</div></div>";

      on("zk-lobby", function () {
        refreshMe(renderLobby);
      });
      on("zk-rematch", function () {
        req("/game/" + id + "/rematch", { method: "POST" }).then(function (rr) {
          if (rr.status !== 201) return renderLobby((rr.body && rr.body.error) || "Odveta nešla založit.");
          beginGame(rr.body.id, "odkaz", null);
        });
      });
      on("zk-tnext", function () { tournamentPlay(tournamentId); });
      on("zk-tback", function () { renderTournament(tournamentId); });
    });
  }

  // ---------------------------------------------------------------- turnaj (aréna)
  function statusLabel(t) {
    if (t.status === "planovany") return "Začíná brzy";
    if (t.status === "bezi") return "Běží";
    return "Skončil";
  }
  var TC_LABEL = { blesk: "Blesk", klasika: "Klasika" };

  // Zbývající čas turnaje. Nad hodinu stačí minuty, pod hodinu se počítají vteřiny —
  // v poslední minutě je rozdíl mezi „1 min" a „12 s" pro hráče zásadní.
  function zbyvaText(endsAt) {
    var s = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
    if (s >= 3600) return Math.floor(s / 3600) + " h " + Math.floor((s % 3600) / 60) + " min";
    if (s >= 60) return Math.floor(s / 60) + " min " + (s % 60) + " s";
    return s + " s";
  }

  function renderTournaments(msg) {
    stopAll();
    say("Turnaj: kdo za daný čas nasbírá nejvíc bodů z jednotlivých kol.");
    req("/tournament?band=" + S.me.band).then(function (r) {
      // Výpadek (status 0/5xx) se dřív tvářil jako „žádný turnaj neběží". msg feeduje errBox níž.
      if (r.status !== 200) msg = (r.body && r.body.error) || "Turnaje se nepodařilo načíst, zkus to prosím znovu.";
      var list = (r.body && r.body.tournaments) || [];
      body.innerHTML =
        '<div class="qz-screen qz-setup zk-wrap">' +
        backBar("Zpět", renderLobby) +
        "<h2>Turnaje</h2>" +
        errBox(typeof msg === "string" ? msg : "") +
        // Běžící turnaje jsou NAHOŘE, zakládání pod nimi: přidat se k rozjetému turnaji
        // je běžnější než zakládat vlastní. Dřív byl formulář první věc na obrazovce.
        (list.length
          ? '<div class="zk-rowlist">' + list.map(function (t) {
              return '<button type="button" class="qz-standrow zk-trow" data-id="' + t.id + '">' +
                '<span class="qz-standname">' + esc(t.name) + " · " + (TC_LABEL[t.time_control] || t.time_control) + "</span>" +
                '<span class="qz-standscore">' + statusLabel(t) + "</span></button>";
            }).join("") + "</div>"
          : '<div class="qz-setnote">Zatím tu žádný turnaj neběží — založ první a hraj rovnou, ' +
            "soupeř nastoupí hned.</div>") +
        '<div class="qz-setcard zk-form" style="margin-top:.8rem">' +
          '<div class="qz-fieldlabel">Založit nový</div>' +
          // Popisky u obou polí — dřív to byly dva holé selecty a nedalo se poznat, co je co.
          '<label class="qz-fieldlabel" for="zk-tc" style="font-weight:600">Tempo</label>' +
          '<select class="qz-pname-in" id="zk-tc">' +
            '<option value="blesk">Blesk (10 otázek, 10 s)</option>' +
            '<option value="klasika">Klasika (15 otázek, 20 s)</option>' +
          "</select>" +
          '<label class="qz-fieldlabel" for="zk-dur" style="font-weight:600">Jak dlouho potrvá</label>' +
          '<select class="qz-pname-in" id="zk-dur">' +
            '<option value="15">15 minut</option>' +
            '<option value="30">30 minut</option>' +
            '<option value="60">60 minut</option>' +
          "</select>" +
          '<button class="qz-go" id="zk-tcreate">Založit turnaj ' + handArrowSvg(false) + '</button>' +
          '<div class="qz-setnote">Turnaj začne hned. Kola jsou nehodnocená — body se sčítají ' +
          "jen uvnitř turnaje.</div>" +
        "</div>" +
        "</div>";

      body.querySelector("#zk-tcreate").addEventListener("click", function () {
        var tc = body.querySelector("#zk-tc").value;
        var dur = parseInt(body.querySelector("#zk-dur").value, 10);
        req("/tournament", { method: "POST", body: { time_control: tc, duration_min: dur } }).then(function (rr) {
          if (rr.status !== 201) return renderTournaments((rr.body && rr.body.error) || "Nepovedlo se.");
          renderTournament(rr.body.id);
        });
      });
      body.querySelectorAll(".zk-trow").forEach(function (b) {
        b.addEventListener("click", function () { renderTournament(b.dataset.id); });
      });
    });
  }

  function renderTournament(id, msg) {
    stopAll();
    req("/tournament/" + id).then(function (r) {
      if (r.status !== 200) return renderTournaments((r.body && r.body.error) || "Turnaj se nenačetl.");
      var t = r.body;
      say(t.status === "bezi" ? "Turnaj běží — hraj kola, dokud to jde."
        : t.status === "planovany" ? "Turnaj ještě nezačal."
        : "Turnaj skončil.");

      var rows = (t.standings || []).map(function (p) {
        return '<div class="qz-standrow' + (p.rank === 1 ? " win" : "") + '"><span class="qz-rank">' + p.rank + ".</span>" +
          '<span class="qz-standname">' + esc(p.nick) + "</span>" +
          '<span class="qz-standscore">' + starScore(p.score) + " · " + p.games_played + " " +
            plur(p.games_played, "kolo", "kola", "kol") + "</span></div>";
      }).join("");

      var action = "";
      if (t.status === "bezi" && !t.joined) action = '<button class="qz-go" id="zk-tjoin">Připojit se ' + handArrowSvg(false) + '</button>';
      else if (t.status === "bezi" && t.joined) action = '<button class="qz-go" id="zk-tplay">Hrát další kolo ' + handArrowSvg(false) + '</button>';
      else if (t.status === "planovany" && !t.joined) action = '<button class="qz-go" id="zk-tjoin">Připojit se předem ' + handArrowSvg(false) + '</button>';
      else if (t.status === "planovany" && t.joined) action = '<div class="qz-setnote">Jsi přihlášený, čekej na start.</div>';
      // Skončený turnaj měl nulovou akci — jen tabulku a slepý konec.
      else action = '<button class="qz-go" id="zk-tnew">Založit nový turnaj ' + handArrowSvg(false) + '</button>';

      body.innerHTML =
        '<div class="qz-screen qz-end zk-wrap">' +
        backBar("Zpět na turnaje", renderTournaments) +
        "<h2>" + esc(t.name) + "</h2>" +
        errBox(typeof msg === "string" ? msg : "") +
        '<div class="qz-meta" style="text-align:center;margin-bottom:.6rem">' +
          esc(TC_LABEL[t.time_control] || t.time_control) + " · " + statusLabel(t) +
          // Odpočet do konce. `ends_at` API vracelo odjakživa, klient ho jen nepoužíval,
          // takže hráč netušil, kolik času mu na další kola zbývá.
          (t.status === "bezi" ? ' · zbývá <b id="zk-tleft">' + zbyvaText(t.ends_at) + "</b>" : "") +
        "</div>" +
        (action ? '<div class="qz-setcard" style="text-align:center;margin-bottom:1rem">' + action + "</div>" : "") +
        (rows ? '<div class="zk-rowlist">' + rows + "</div>"
              : '<div class="qz-setnote">Ještě nikdo neodehrál kolo.</div>') +
        "</div>";

      on("zk-tjoin", function () {
        req("/tournament/" + id + "/join", { method: "POST" }).then(function (rr) {
          renderTournament(id, rr.status === 200 ? "" : (rr.body && rr.body.error) || "Nepovedlo se.");
        });
      });
      on("zk-tplay", function () { tournamentPlay(id); });
      on("zk-tnew", renderTournaments);

      // Odpočet tiká po vteřině; `timer` je slot, který stopAll() uklidí při odchodu.
      if (t.status === "bezi") {
        timer = setInterval(function () {
          var el = body.querySelector("#zk-tleft");
          if (!el) { clearInterval(timer); timer = null; return; }
          if (t.ends_at - Date.now() <= 0) { clearInterval(timer); timer = null; return renderTournament(id); }
          el.textContent = zbyvaText(t.ends_at);
        }, 1000);
      }
    });
  }

  function tournamentPlay(id) {
    stopAll();
    say("Hledám soupeře na další kolo…");
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap">' +
      backBar("Zpět do turnaje", function () { renderTournament(id); }) +
      "<h2>Další kolo</h2>" +
      '<div class="qz-setcard" style="text-align:center">' +
        '<div class="zk-radar"><span></span><span></span><span></span></div>' +
        '<div class="qz-q" id="zk-qstat">Hledám soupeře…</div>' +
        // Tlačítko pro netrpělivé: přeskočí hledání a nastoupí na kolo hned.
        '<button class="qz-back" id="zk-tbot" style="width:100%;justify-content:center;margin-top:.7rem">Nechce se ti čekat? Hrát hned ' + handArrowSvg(false) + '</button>' +
      "</div></div>";

    var stat = body.querySelector("#zk-qstat");
    var vzato = false;
    function vezmiSoupere() {
      if (vzato) return;
      vzato = true;
      stopAll();
      stat.textContent = "Soupeř nalezen!";
      req("/tournament/" + id + "/bot", { method: "POST" }).then(function (b) {
        if (b.status !== 200) return renderTournament(id, (b.body && b.body.error) || "Nepovedlo se.");
        beginGame(b.body.game_id, "turnaj",
          { nick: souperJmeno((b.body.bot && b.body.bot.nick) || "", true, b.body.game_id) }, id);
      });
    }
    body.querySelector("#zk-tbot").addEventListener("click", vezmiSoupere);

    req("/tournament/" + id + "/play", { method: "POST" }).then(function (r) {
      if (r.status !== 200) return renderTournament(id, (r.body && r.body.error) || "Nepovedlo se.");
      if (r.body.matched) return beginGame(r.body.game_id, "turnaj", r.body.opponent, id);
      var waited = 0;
      poll = setInterval(function () {
        waited += 2;
        req("/tournament/" + id + "/play").then(function (p) {
          if (!p.body) return;
          if (p.body.matched) { stopAll(); return beginGame(p.body.game_id, "turnaj", p.body.opponent, id); }
          if (p.body.offer_bot) return vezmiSoupere();
          stat.textContent = "Hledám soupeře… " + waited + " s";
        });
      }, 2000);
    });
  }

  // ---------------------------------------------------------------- žebříček
  function renderBoard() {
    stopAll();
    say("Kdo je na tom nejlíp.");
    req("/leaderboard?band=" + S.me.band).then(function (r) {
      // Výpadek (status 0/5xx) nemá body.closed ani rows — ukáže se chyba, ne prázdný žebříček.
      if (r.status !== 200) {
        body.innerHTML =
          '<div class="qz-screen qz-end zk-wrap">' +
          backBar("Zpět", renderLobby) +
          "<h2>Žebříček</h2>" +
          errBox((r.body && r.body.error) || "Žebříček se nepodařilo načíst, zkus to prosím znovu.") +
          "</div>";
        return;
      }
      var rows = (r.body && r.body.rows) || [];
      // Dětské pásmo veřejný žebříček nemá (viz functions/api/leaderboard.js).
      // Prázdný seznam by vypadal jako porucha, tak se řekne rovnou proč — a hráč
      // dostane místo slepé uličky odkaz na to, co mu zůstává.
      if (r.body && r.body.closed) {
        body.innerHTML =
          '<div class="qz-screen qz-end zk-wrap">' +
          backBar("Zpět", renderLobby) +
          "<h2>Žebříček</h2>" +
          '<div class="qz-setnote">V dětském pásmu žebříček nevedeme. Kdo si vybere ' +
            "dětské otázky, nikdo neověřuje, takže by pořadí stejně nic neříkalo. " +
            "Hraj turnaje nebo souboje s kamarády — tam jde o hru, ne o tabulku.</div>" +
          '<button class="qz-go" id="zk-toturn">Turnaje ' + handArrowSvg(false) + '</button>' +
          "</div>";
        body.querySelector("#zk-toturn").addEventListener("click", renderTournaments);
        return;
      }
      body.innerHTML =
        '<div class="qz-screen qz-end zk-wrap">' +
        backBar("Zpět", renderLobby) +
        "<h2>Žebříček</h2>" +
        // Vlastní řádek se zvýrazní — bez toho se hráč v žebříčku nenajde a seznam
        // mu neříká vůbec nic o něm samotném.
        (rows.length
          ? '<div class="zk-rowlist">' + rows.map(function (x) {
              var ja = x.nick === S.me.nick;
              return '<div class="qz-standrow' + (ja ? " zk-me" : "") + '"><span class="qz-rank">' + x.rank + ".</span>" +
                '<span class="qz-standname">' + esc(x.nick) + (ja ? " <b>· to jsi ty</b>" : "") + "</span>" +
                '<span class="qz-standscore">' + x.rating + "</span></div>";
            }).join("") + "</div>" +
            (rows.some(function (x) { return x.nick === S.me.nick; }) ? "" :
              '<div class="qz-setnote">Ty tu ještě nejsi — do žebříčku se počítá od páté ' +
              "hodnocené hry, dokud je rating nejistý.</div>")
          : '<div class="qz-setnote">Zatím tu nikdo není. Do žebříčku se počítá od páté hodnocené hry, ' +
            "dokud je rating nejistý, na přední příčky nepatří.</div>") +
        "</div>";
    });
  }

  // ---------------------------------------------------------------- přátelé
  function renderFriends(msg) {
    stopAll();
    say("Přátelé se přidávají na kód — nedají se vyhledat podle přezdívky.");
    req("/friends").then(function (r) {
      // Výpadek se dřív tvářil jako prázdný seznam přátel. msg feeduje errBox níž.
      if (r.status !== 200) msg = (r.body && r.body.error) || "Přátele se nepodařilo načíst, zkus to prosím znovu.";
      var d = r.body || {};
      body.innerHTML =
        '<div class="qz-screen qz-setup zk-wrap">' +
        backBar("Zpět", renderLobby) +
        "<h2>Přátelé</h2>" +
        errBox(typeof msg === "string" ? msg : "") +
        '<div class="qz-setcard zk-form">' +
          '<div class="qz-fieldlabel">Tvůj kód — dej ho tomu, s kým chceš hrát</div>' +
          '<div class="zk-code">' + esc(d.my_code || "—") + "</div>" +
          '<div class="qz-fieldlabel" style="margin-top:1rem">Přidat podle kódu</div>' +
          '<input class="qz-pname-in" id="zk-code" maxlength="6" autocomplete="off" placeholder="ABC123">' +
          '<button class="qz-go" id="zk-addf">Přidat ' + handArrowSvg(false) + '</button>' +
        "</div>" +
        // U každého přítele je akce. Bez ní byl seznam slepá ulička: přátele šlo přidat,
        // ale nedalo se s nimi nic dělat — jen se koukat na přezdívky.
        ((d.friends || []).length
          ? '<div class="zk-rowlist">' + d.friends.map(function (f) {
              return '<div class="qz-standrow"><span class="qz-standname">' + esc(f.nick) + "</span>" +
                '<button class="zk-challenge" data-nick="' + esc(f.nick) + '">Vyzvat ' + handArrowSvg(false) + '</button>' +
                // Odebrat musí jít. Přidání je oboustranné a bez souhlasu druhé strany,
                // takže bez tohohle zůstal kdokoli v seznamu napořád. (2026-09-01)
                '<button class="zk-unfriend" data-id="' + esc(f.id) + '" data-nick="' + esc(f.nick) +
                  '" title="Odebrat z přátel" aria-label="Odebrat ' + esc(f.nick) + ' z přátel">✕</button></div>';
            }).join("") + "</div>"
          : '<div class="qz-setnote">Zatím nikdo. Dej svůj kód kamarádovi — nebo si rovnou ' +
            "založ souboj na odkaz a pošli mu ho.</div>") +
        "</div>";

      body.querySelector("#zk-addf").addEventListener("click", function () {
        var code = body.querySelector("#zk-code").value || "";
        req("/friends", { method: "POST", body: { code: code } }).then(function (rr) {
          renderFriends(rr.status === 201 ? "" : (rr.body && rr.body.error) || "Nepovedlo se.");
        });
      });
      // Výzva recykluje souboj na odkaz — API na přímé vyzvání nemá endpoint, takže
      // se založí hra s odkazem a hráči se rovnou ukáže, co má kamarádovi poslat.
      body.querySelectorAll(".zk-challenge").forEach(function (b) {
        b.addEventListener("click", function () { createLink(false, b.getAttribute("data-nick")); });
      });
      // Ptáme se schválně: odebrání je tiché a nevratné (zpátky jen přes kód).
      body.querySelectorAll(".zk-unfriend").forEach(function (b) {
        b.addEventListener("click", function () {
          var nick = b.getAttribute("data-nick");
          if (!confirm("Odebrat " + nick + " z přátel?\n\nZmizí i tobě z jeho seznamu. Zpátky jen přes kód.")) return;
          req("/friends", { method: "DELETE", body: { id: b.getAttribute("data-id") } })
            .then(function (rr) {
              renderFriends(rr.status === 200 ? "" : (rr.body && rr.body.error) || "Nepovedlo se.");
            });
        });
      });
    });
  }

  // stopAll ven, aby ho mohlo zavolat „×" v quiz.js — jinak online časovače přežijí
  // odchod z rozehrané hry a přepíšou obrazovku, na kterou hráč mezitím odešel.
  return { open: open, stopAll: stopAll };
})();
