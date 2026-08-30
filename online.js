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

  // ---------------------------------------------------------------- pomocníci
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
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
    return '<button class="qz-back" id="zk-back">← ' + esc(label) + "</button>";
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
        ? "Založ si hráče — stačí přezdívka a PIN, ať se ti počítá rating."
        : "Online hraní chce jméno. Stačí přezdívka a PIN.");
    var isReg = mode === "register";
    var podtitul = vyzva
      ? "Někdo tě vyzval na souboj — přihlas se a jde se hrát."
      : isReg
        ? "Stačí přezdívka a PIN. E-mail můžeš doplnit až potom v Účtu."
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
        '<img class="zk-authhero" src="assets/landing-hero.jpg" alt="" data-fb="hide">' +
        '<div class="zk-authtag">Online</div>' +
        "<h2>" + (isReg ? "Nový hráč" : "Přihlášení") + "</h2>" +
        '<div class="zk-sub">' + esc(podtitul) + "</div>" +
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
            '<div class="qz-fieldlabel">Přezdívka</div>' +
            '<input class="qz-pname-in" id="zk-nick" maxlength="20" autocomplete="username" placeholder="jak ti mají říkat" value="' +
              esc(stav.nick || "") + '">' +
          "</div>" +
          '<div class="zk-field">' +
            '<div class="zk-labelrow">' +
              '<div class="qz-fieldlabel">PIN (4 až 8 číslic)</div>' +
              // Zapomenutý PIN patří k poli s PINem, ne mezi hlavní akce dole.
              (isReg ? "" : '<button type="button" class="zk-linkbtn zk-forgot" id="zk-forgot">Zapomněl jsem PIN</button>') +
            "</div>" +
            '<input class="qz-pname-in" id="zk-pin" type="password" inputmode="numeric" maxlength="8" autocomplete="' +
              (isReg ? "new-password" : "current-password") + '" placeholder="••••">' +
          "</div>" +
          '<button class="qz-go" id="zk-go"' + (isReg ? " disabled" : "") + ">" +
            (isReg ? "Založit hráče" : "Přihlásit se") + " →</button>" +
        "</div>" +
        '<div class="zk-authfoot">' +
          (isReg ? "Už tu hráče máš? " : "Ještě tu hráče nemáš? ") +
          '<button type="button" class="zk-linkbtn" id="zk-switch">' +
            (isReg ? "Přihlas se" : "Založ si ho") + "</button>" +
        "</div>" +
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
      var payload = isReg ? { band: band, pin: pin, nick: nick } : { nick: nick, pin: pin };
      req(path, { method: "POST", body: payload }).then(function (r) {
        if (r.status !== 200 && r.status !== 201) {
          return renderAuth(mode, (r.body && r.body.error) || "Nepovedlo se.", { band: band, nick: nick });
        }
        token.set(r.body.token);
        S.me = r.body;
        if (isReg && band === "deti") {
          say("Tvoje jméno je " + r.body.nick + ". Zapamatuj si ho, budeš se jím přihlašovat.");
        }
        req("/me").then(function (m) {
          S.me = m.body;
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
    say(m.email
      ? "E-mail máš uložený. Když zapomeneš PIN, pošleme na něj odkaz."
      : "E-mail je nepovinný. Bez něj ale zapomenutý PIN nikdo neobnoví.");
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap zk-acc">' +
      backBar("Zpět", renderLobby) +
      "<h2>Účet</h2>" +
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
          "přijde na něj odkaz na nastavení nového. Bez e-mailu se účet obnovit nedá.</div>" +
        (m.email
          ? '<div class="zk-status on"><span class="zk-statusico">✓</span><div>' +
              "<b>" + esc(m.email) + "</b>" +
              '<span class="d">Sem dorazí odkaz, když si na PIN nevzpomeneš.</span></div></div>'
          : '<div class="zk-status off"><span class="zk-statusico">!</span><div>' +
              "<b>Zatím žádný</b>" +
              '<span class="d">Zapomenutý PIN by nešlo obnovit — účet i s ratingem by byl pryč.</span></div></div>') +
        '<div class="zk-form">' +
          '<div class="zk-field">' +
            '<div class="qz-fieldlabel">' + (m.email ? "Nová adresa" : "E-mailová adresa") + "</div>" +
            '<input class="qz-pname-in" id="zk-email" type="email" maxlength="254" autocomplete="email" placeholder="adresa@priklad.cz">' +
          "</div>" +
          '<div class="zk-field">' +
            '<div class="qz-fieldlabel">Potvrď svým PINem</div>' +
            '<input class="qz-pname-in" id="zk-epin" type="password" inputmode="numeric" maxlength="8" autocomplete="current-password" placeholder="••••">' +
            '<div class="qz-setnote">Ptáme se na PIN i u přihlášeného hráče — jinak by stačilo ' +
              "odemčené zařízení a účet se dá převést na cizí adresu.</div>" +
          "</div>" +
          '<button class="qz-go" id="zk-esave">' + (m.email ? "Změnit e-mail" : "Uložit e-mail") + " →</button>" +
        "</div>" +
        // Mazání je tichý odkaz, ne druhé tlačítko: dřív mělo stejnou šířku i váhu
        // jako uložení, takže obě akce vypadaly jako rovnocenná nabídka.
        (m.email ? '<button type="button" class="zk-dangerlink" id="zk-edel">Smazat e-mail z účtu</button>' : "") +
      "</div>" +

      '<div class="zk-sect">' +
        "<h3>Přihlášení</h3>" +
        '<div class="zk-sectnote">Odhlášením se odpojíš jen z tohohle zařízení. Účet, rating i ' +
          "historie zůstávají — vrátíš se přezdívkou a PINem.</div>" +
        '<button type="button" class="qz-back" id="zk-logout">Odhlásit — přepnout na jiného hráče</button>' +
      "</div></div>";

    function ulozit(metoda) {
      var pin = body.querySelector("#zk-epin").value || "";
      var telo = metoda === "DELETE" ? { pin: pin }
                                     : { email: body.querySelector("#zk-email").value || "", pin: pin };
      req("/auth/email", { method: metoda, body: telo }).then(function (r) {
        if (r.status !== 200) return renderAccount((r.body && r.body.error) || "Nepovedlo se.");
        req("/me").then(function (mm) {
          S.me = mm.body;
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
      : "Odkaz na obnovu pošleme na e-mail, který máš u účtu.");
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap zk-auth">' +
      backBar("Zpět", function () { renderAuth("login"); }) +
      '<div class="zk-authcard zk-nohero">' +
        '<div class="zk-authtag">Obnova PINu</div>' +
        "<h2>Zapomenutý PIN</h2>" +
        '<div class="zk-sub">' +
          (hotovo
            ? "Dál to pokračuje v e-mailu."
            : "Napiš přezdívku. Na e-mail u účtu pošleme odkaz, kterým si nastavíš nový PIN.") +
        "</div>" +
        (typeof msg === "string" && msg ? '<div class="zk-autherr">' + errBox(msg) + "</div>" : "") +
        (hotovo
          // Po odeslání formulář mizí: opakované klikání na „Poslat odkaz" nic
          // nepřidá (server má na účet limit 3 odkazy za hodinu) a jen by mátlo.
          ? '<div class="zk-donebox"><span class="zk-doneico">✓</span>' +
              '<div class="zk-donetext">' + esc(hotovo) + "</div></div>" +
            '<button class="qz-go" id="zk-fback">Zpět na přihlášení →</button>' +
            '<div class="zk-authnote">Odkaz platí půl hodiny od odeslání.</div>' +
            '<div class="zk-authfoot">Spletl ses ve jméně? ' +
              '<button type="button" class="zk-linkbtn" id="zk-fagain">Zkusit jinou přezdívku</button></div>'
          : '<div class="zk-form">' +
              '<div class="zk-field">' +
                '<div class="qz-fieldlabel">Přezdívka</div>' +
                '<input class="qz-pname-in" id="zk-fnick" maxlength="20" autocomplete="username" placeholder="jak ti říkáme">' +
              "</div>" +
              '<button class="qz-go" id="zk-fgo">Poslat odkaz →</button>' +
            "</div>" +
            '<div class="zk-authfoot">Účet bez e-mailu obnovit nejde. ' +
              '<button type="button" class="zk-linkbtn" id="zk-fnew">Založ si nového hráče</button></div>') +
      "</div></div>";

    function odeslat() {
      var nick = body.querySelector("#zk-fnick").value || "";
      req("/auth/reset", { method: "POST", body: { nick: nick } }).then(function (r) {
        if (r.status !== 200) return renderForgot((r.body && r.body.error) || "Nepovedlo se.");
        renderForgot("", (r.body && r.body.zprava) || "Pokud účet e-mail má, odkaz je na cestě.");
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
        '<img class="zk-authhero" src="assets/landing-hero.jpg" alt="" data-fb="hide">' +
        '<div class="zk-authtag">Obnova PINu</div>' +
        "<h2>Nový PIN</h2>" +
        '<div class="zk-sub">Přišel jsi z odkazu v e-mailu. Zvol si nový PIN — starý přestane ' +
          "platit a rovnou tě přihlásíme.</div>" +
        (typeof msg === "string" && msg ? '<div class="zk-autherr">' + errBox(msg) + "</div>" : "") +
        '<div class="zk-form">' +
          '<div class="zk-field">' +
            '<div class="qz-fieldlabel">Nový PIN (4 až 8 číslic)</div>' +
            '<input class="qz-pname-in" id="zk-npin" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password" placeholder="••••">' +
          "</div>" +
          '<button class="qz-go" id="zk-ngo">Nastavit a přihlásit →</button>' +
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
        req("/me").then(function (m) { S.me = m.body; renderLobby(); });
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

  function renderLobby(msg) {
    stopAll();
    var r = (S.me.ratings || []).filter(function (x) { return x.band === S.me.band; })[0];
    say("Vítej zpátky, " + S.me.nick + ".");
    var pasmo = { deti: "Děti", starsi: "Puberťáci", dospeli: "Dospělí" }[S.me.band];
    var hotovo = dailyHotovo();

    body.innerHTML =
      '<div class="qz-screen qz-modepick zk-wrap zk-lobby">' +
      backBar("Zpět do hry", leave) +
      "<h2>Online</h2>" +
      errBox(msg) +
      // kdo jsem — jeden tichý proužek, ne dlaždice
      '<div class="zk-idbar"><b>' + esc(S.me.nick) + "</b>" +
        '<span class="zk-idband">' + esc(pasmo) + "</span>" +
        (r ? '<span class="zk-idrating">rating <b>' + r.rating + "</b> · " +
             (r.games ? r.games + " " + plur(r.games, "hra", "hry", "her") : "zatím nezahráno") + "</span>" : "") +
      "</div>" +
      // JEDNA hlavní akce — hráč přišel hrát, ne spravovat účet
      '<button class="zk-hero" id="zk-live">' +
        dlazdiceObr("zk-live", "🎯") +
        '<span class="zk-herotext"><span class="t">Hrát teď</span>' +
        '<span class="d">Najdeme ti soupeře. Nikdo poblíž? Nastoupí bot.</span></span>' +
        '<span class="zk-heroarrow">→</span>' +
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
        utilTlacitko("zk-account", "Účet", ICO_ACCOUNT) +
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
        req("/match", { method: "DELETE" }).then(function () { renderLobby(); });
      }) +
      "<h2>Hledám soupeře</h2>" +
      '<div class="qz-setcard" style="text-align:center">' +
        '<div class="zk-radar"><span></span><span></span><span></span></div>' +
        '<div class="qz-q" id="zk-qstat">Stavím se do fronty…</div>' +
        '<div class="qz-setnote">Páruje se uvnitř tvého pásma. Čím déle čekáš, tím širší okno.</div>' +
        // Bot je k dispozici HNED, jen tiše. Dřív byl schovaný do 15. vteřiny, takže
        // hráč patnáct vteřin koukal na statický text a nevěděl, že má volbu.
        '<button class="qz-back" id="zk-bot" style="width:100%;justify-content:center;margin-top:.7rem">Nechce se ti čekat? Vezmi bota →</button>' +
      "</div></div>";

    var stat = body.querySelector("#zk-qstat");
    var botBtn = body.querySelector("#zk-bot");
    botBtn.addEventListener("click", function () {
      stopAll();
      req("/match", { method: "DELETE" }).then(createLink.bind(null, true));
    });

    req("/match", { method: "POST", body: { time_control: "blesk" } }).then(function (r) {
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "Nepovedlo se.");
      if (r.body.matched) return beginGame(r.body.game_id, "duel", r.body.opponent);
      var waited = 0;
      poll = setInterval(function () {
        waited += 2;
        req("/match").then(function (p) {
          if (!p.body) return;
          if (p.body.matched) { stopAll(); return beginGame(p.body.game_id, "duel", p.body.opponent); }
          stat.textContent = "Čekám… " + waited + " s";
          // Po 15 s server usoudí, že nikdo nepřijde — bot se z tiché volby stane hlavní akcí.
          if (p.body.offer_bot && !botBtn.classList.contains("qz-go")) {
            botBtn.className = "qz-go"; botBtn.style.marginTop = ".7rem";
            botBtn.textContent = "Nikdo se nenašel. Zahrát si proti botovi →";
          }
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
          say(b.body && b.body.bot ? "Nastoupil " + b.body.bot.nick + "." : "Bot nastoupil.");
          beginGame(id, "odkaz", b.body && b.body.bot ? { nick: b.body.bot.nick } : null);
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
          '<button class="qz-go" id="zk-play">Zahrát si svoji půlku →</button>' +
          '<div class="qz-setnote" style="margin:.7rem 0 .2rem">' +
            (proKoho ? "Odkaz pošli hráči <b>" + esc(proKoho) + "</b>. " : "") +
            "Soupeř dostane stejné otázky ve stejném pořadí. Jeho výsledek uvidíš, až dohrajete oba.</div>" +
          '<div class="qz-fieldlabel">Odkaz pro soupeře</div>' +
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

  function nextQuestion() {
    stopAll();
    var g = S.game;
    if (g.n >= g.total) return showResult(g.id, g.mode, g.tournamentId);

    req("/game/" + g.id + "/q/" + g.n).then(function (r) {
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "Otázka se nenačetla.");
      var q = r.body;
      say("Tak schválně…");
      body.innerHTML =
        '<div class="qz-screen qz-play">' +
        '<div class="qz-top"><span class="qz-progress">Otázka ' + (q.n + 1) + "/" + q.total + "</span>" +
          '<span class="qz-scorepill" id="zk-score">' + g.score + " b</span>" +
          '<span class="qz-meta zk-oppbar" id="zk-opp"></span></div>' +
        '<div class="qz-box" id="qz-box">' +
          '<div class="qz-timerbar" id="zk-timer"><div style="width:100%"></div></div>' +
          '<div class="qz-meta">' + esc(q.country) + " · " + esc(q.section) + "</div>" +
          '<div class="qz-q">' + esc(q.question) + "</div>" +
          '<div class="qz-ans">' + q.options.map(function (o, i) {
            return '<button class="qz-a" data-i="' + i + '">' + esc(o) +
                   "<small>" + "ABCD"[i] + "</small></button>";
          }).join("") + "</div>" +
        "</div></div>";

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
        el.innerHTML = esc(o.nick) + ": " + o.answered + "/" + S.game.total +
                       (o.score != null ? " · " + o.score + " b" : "");
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

      var btns = body.querySelectorAll("#qz-box .qz-a");
      btns.forEach(function (b, i) {
        if (i === a.correct_index) b.classList.add("ok");
        else if (i === pick) b.classList.add("bad");
      });
      say(a.correct ? "Správně!" : pick === -1 ? "Čas vypršel." : "Tentokrát vedle.");
      var pill = body.querySelector("#zk-score");
      if (pill) pill.textContent = a.score + " b";

      var box = body.querySelector("#qz-box");
      // Hráč mezitím z obrazovky odešel (křížek, zpět) a odpověď dorazila až potom —
      // není kam kreslit. Bez téhle pojistky to padalo na `insertAdjacentHTML` nad null.
      if (!box) return;
      var more = a.more_fact
        ? '<button class="qz-more" id="zk-more">Více o ' + esc(a.about || "tom") +
          ' <span class="qz-more-ico">💡</span></button>'
        : "";
      // Ilustrace se odhaluje AŽ TEĎ, ne u otázky — obrázek často odpověď prozradí
      // (kapr ve vaně napoví, kam se dává kapr). Stejné pravidlo jako v sólu,
      // jen tu není glóbus, který by mezitím rám vyplnil, takže se rám do té doby
      // vůbec nevykreslí. Když fotka neexistuje, `onerror` celý rám odstraní —
      // prázdné místo by vypadalo jako chyba.
      var pic = q.id
        ? '<div class="zk-picframe" id="zk-pic"><img src="img/' + esc(q.id) + '.jpg" alt=""></div>'
        : "";
      box.insertAdjacentHTML("beforeend",
        pic +
        '<div class="qz-quipbox"><div class="qz-hlaska">' + esc(a.quip || "") + "</div></div>" +
        '<div class="qz-frow"><div class="qz-expl">' + esc(a.explanation || "") + "</div>" +
        '<div class="qz-fbtns">' + more +
        '<button class="qz-next" id="zk-next">' +
          (a.done ? "Výsledek" : "Další otázka") + " →</button></div></div>");

      var picEl = body.querySelector("#zk-pic");
      if (picEl) {
        var im = picEl.firstElementChild;
        im.addEventListener("error", function () { picEl.remove(); });
        im.addEventListener("load", function () { picEl.classList.add("on"); });
        if (im.complete && im.naturalWidth > 0) picEl.classList.add("on");
        else if (im.complete) picEl.remove();
      }

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
        return '<div class="qz-standrow"><span class="qz-standname">' + esc(p.nick) +
          (p.is_bot ? " (bot)" : "") + "</span>" +
          '<span class="qz-standscore">' + (p.score == null ? "—" : p.score + " b") + "</span></div>";
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
          '<button class="qz-next" id="zk-tnext">Další kolo →</button>'
        : (g.status === "done" && g.players.length > 1
            ? '<button class="qz-more" id="zk-rematch">Odveta</button>' : "") +
          '<button class="qz-next" id="zk-lobby">Zpět do online →</button>';

      body.innerHTML =
        '<div class="qz-screen qz-end zk-wrap">' +
        "<h2>" + esc(head) + "</h2>" +
        '<div class="qz-endscore">' + g.me.score + " bodů</div>" +
        '<div class="zk-rowlist">' + rows + "</div>" +
        '<div class="qz-setnote">' + note + "</div>" +
        (review ? '<h3 style="margin-top:1.2rem">Rozbor</h3><div class="zk-rowlist">' + review + "</div>" : "") +
        '<div class="qz-fbtns" style="margin-top:1.2rem">' + buttons + "</div></div>";

      on("zk-lobby", function () {
        req("/me").then(function (m) { S.me = m.body; renderLobby(); });
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
    if (t.status === "planovany") return "začíná brzy";
    if (t.status === "bezi") return "běží";
    return "skončil";
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
          : '<div class="qz-setnote">Zatím tu žádný turnaj neběží — založ první a hraj třeba ' +
            "proti botovi, než se někdo přidá.</div>") +
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
          '<button class="qz-go" id="zk-tcreate">Založit turnaj →</button>' +
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
          '<span class="qz-standscore">' + p.score + " b · " + p.games_played + " " +
            plur(p.games_played, "kolo", "kola", "kol") + "</span></div>";
      }).join("");

      var action = "";
      if (t.status === "bezi" && !t.joined) action = '<button class="qz-go" id="zk-tjoin">Připojit se →</button>';
      else if (t.status === "bezi" && t.joined) action = '<button class="qz-go" id="zk-tplay">Hrát další kolo →</button>';
      else if (t.status === "planovany" && !t.joined) action = '<button class="qz-go" id="zk-tjoin">Připojit se předem →</button>';
      else if (t.status === "planovany" && t.joined) action = '<div class="qz-setnote">Jsi přihlášený, čekej na start.</div>';
      // Skončený turnaj měl nulovou akci — jen tabulku a slepý konec.
      else action = '<button class="qz-go" id="zk-tnew">Založit nový turnaj →</button>';

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
        // Stejně jako u duelu: bot je volba od začátku, ne odměna za čekání.
        '<button class="qz-back" id="zk-tbot" style="width:100%;justify-content:center;margin-top:.7rem">Nechce se ti čekat? Vezmi bota →</button>' +
      "</div></div>";

    var stat = body.querySelector("#zk-qstat");
    var botBtn = body.querySelector("#zk-tbot");
    botBtn.addEventListener("click", function () {
      stopAll();
      req("/tournament/" + id + "/bot", { method: "POST" }).then(function (b) {
        if (b.status !== 200) return renderTournament(id, (b.body && b.body.error) || "Nepovedlo se.");
        beginGame(b.body.game_id, "turnaj", b.body.bot ? { nick: b.body.bot.nick } : null, id);
      });
    });

    req("/tournament/" + id + "/play", { method: "POST" }).then(function (r) {
      if (r.status !== 200) return renderTournament(id, (r.body && r.body.error) || "Nepovedlo se.");
      if (r.body.matched) return beginGame(r.body.game_id, "turnaj", r.body.opponent, id);
      var waited = 0;
      poll = setInterval(function () {
        waited += 2;
        req("/tournament/" + id + "/play").then(function (p) {
          if (!p.body) return;
          if (p.body.matched) { stopAll(); return beginGame(p.body.game_id, "turnaj", p.body.opponent, id); }
          stat.textContent = "Čekám… " + waited + " s";
          if (p.body.offer_bot && !botBtn.classList.contains("qz-go")) {
            botBtn.className = "qz-go"; botBtn.style.marginTop = ".7rem";
            botBtn.textContent = "Nikdo se nenašel. Zahrát proti botovi →";
          }
        });
      }, 2000);
    });
  }

  // ---------------------------------------------------------------- žebříček
  function renderBoard() {
    stopAll();
    say("Kdo je na tom nejlíp.");
    req("/leaderboard?band=" + S.me.band).then(function (r) {
      var rows = (r.body && r.body.rows) || [];
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
          '<button class="qz-go" id="zk-addf">Přidat →</button>' +
        "</div>" +
        // U každého přítele je akce. Bez ní byl seznam slepá ulička: přátele šlo přidat,
        // ale nedalo se s nimi nic dělat — jen se koukat na přezdívky.
        ((d.friends || []).length
          ? '<div class="zk-rowlist">' + d.friends.map(function (f) {
              return '<div class="qz-standrow"><span class="qz-standname">' + esc(f.nick) + "</span>" +
                '<button class="zk-challenge" data-nick="' + esc(f.nick) + '">Vyzvat →</button></div>';
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
    });
  }

  // stopAll ven, aby ho mohlo zavolat „×" v quiz.js — jinak online časovače přežijí
  // odchod z rozehrané hry a přepíšou obrazovku, na kterou hráč mezitím odešel.
  return { open: open, stopAll: stopAll };
})();
