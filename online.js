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
    set: function (t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} },
    clear: function () { try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} },
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
      return { status: 0, body: { error: "Server neodpovídá. Běží `npm run dev`?" } };
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
  function renderAuth(mode, msg) {
    mode = mode || "login";
    stopAll();
    say(pendingDuel()
      ? "Někdo tě vyzval na souboj. Přihlas se a jdeme na to — stačí přezdívka a PIN."
      : "Online hraní chce jméno. Stačí přezdívka a PIN, e-mail je nepovinný.");
    var isReg = mode === "register";
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap">' +
      backBar("Zpět", leave) +
      "<h2>" + (isReg ? "Nový hráč" : "Přihlášení") + "</h2>" +
      errBox(msg) +
      '<div class="qz-setcard zk-form">' +
        (isReg
          ? '<div class="qz-fieldlabel">Kdo bude hrát?</div>' +
            '<div class="qz-bands" id="zk-bands">' +
              ['deti', 'starsi', 'dospeli'].map(function (b, i) {
                return '<button class="qz-chip' + (i === 2 ? " on" : "") + '" data-band="' + b + '">' +
                  { deti: "Děti", starsi: "Pubertáci", dospeli: "Dospělí" }[b] + "</button>";
              }).join("") +
            "</div>" +
            '<div class="qz-setnote" id="zk-nicknote">Dětem přezdívku vymyslíme, ať do ní nejde schovat vzkaz.</div>'
          : "") +
        '<div id="zk-nickwrap"' + (isReg ? ' style="display:none"' : "") + '>' +
          '<div class="qz-fieldlabel">Přezdívka</div>' +
          '<input class="qz-pname-in" id="zk-nick" maxlength="20" autocomplete="off" placeholder="jak ti mají říkat">' +
        "</div>" +
        '<div class="qz-fieldlabel">PIN (4 až 8 číslic)</div>' +
        '<input class="qz-pname-in" id="zk-pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="••••">' +
        '<button class="qz-go" id="zk-go">' + (isReg ? "Založit hráče" : "Přihlásit se") + " →</button>" +
        '<button class="qz-back" id="zk-switch" style="margin-top:.8rem">' +
          (isReg ? "Už mě máte — přihlásit" : "Nemám hráče — založit") + "</button>" +
        (isReg ? "" : '<button class="qz-back" id="zk-forgot" style="margin-top:.5rem">Zapomněl jsem PIN</button>') +
      "</div></div>";

    var band = "dospeli";
    var bandsEl = body.querySelector("#zk-bands");
    if (bandsEl) {
      bandsEl.querySelectorAll(".qz-chip").forEach(function (c) {
        c.addEventListener("click", function () {
          bandsEl.querySelectorAll(".qz-chip").forEach(function (x) { x.classList.remove("on"); });
          c.classList.add("on");
          band = c.dataset.band;
          var wrap = body.querySelector("#zk-nickwrap");
          var note = body.querySelector("#zk-nicknote");
          wrap.style.display = band === "deti" ? "none" : "";
          note.style.display = band === "deti" ? "" : "none";
        });
      });
    }
    var zapomnel = body.querySelector("#zk-forgot");
    if (zapomnel) zapomnel.addEventListener("click", function () { renderForgot(); });
    body.querySelector("#zk-switch").addEventListener("click", function () {
      renderAuth(isReg ? "login" : "register");
    });
    body.querySelector("#zk-go").addEventListener("click", function () {
      var nick = (body.querySelector("#zk-nick") || {}).value || "";
      var pin = body.querySelector("#zk-pin").value || "";
      var path = isReg ? "/auth/register" : "/auth/login";
      var payload = isReg ? { band: band, pin: pin, nick: nick } : { nick: nick, pin: pin };
      req(path, { method: "POST", body: payload }).then(function (r) {
        if (r.status !== 200 && r.status !== 201) {
          return renderAuth(mode, (r.body && r.body.error) || "Nepovedlo se.");
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
  function renderAccount(msg) {
    stopAll();
    say("E-mail je nepovinný. Bez něj ale zapomenutý PIN nikdo neobnoví.");
    var m = S.me || {};
    var maDeti = m.band === "deti";
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap">' +
      backBar("Zpět", renderLobby) +
      "<h2>Účet</h2>" +
      errBox(typeof msg === "string" ? msg : "") +
      '<div class="qz-setcard zk-form">' +
        '<div class="qz-fieldlabel">E-mail pro obnovu PINu' + (maDeti ? " (vyplní rodič)" : "") + "</div>" +
        (m.email
          ? '<div class="zk-code">' + esc(m.email) + "</div>"
          : '<div class="qz-setnote">Zatím žádný — PIN by se nedal obnovit.</div>') +
        '<input class="qz-pname-in" id="zk-email" type="email" maxlength="254" autocomplete="email" placeholder="' +
          (m.email ? "nová adresa" : "adresa@priklad.cz") + '">' +
        '<div class="qz-fieldlabel" style="margin-top:.6rem">Potvrď svým PINem</div>' +
        '<input class="qz-pname-in" id="zk-epin" type="password" inputmode="numeric" maxlength="8" autocomplete="current-password" placeholder="••••">' +
        '<button class="qz-go" id="zk-esave">' + (m.email ? "Změnit e-mail" : "Uložit e-mail") + " →</button>" +
        (m.email ? '<button class="qz-back" id="zk-edel" style="margin-top:.8rem">Smazat e-mail</button>' : "") +
      "</div>" +
      '<div class="qz-setcard zk-form" style="margin-top:1rem">' +
        '<button class="qz-back" id="zk-logout">Odhlásit — přepnout na jiného hráče</button>' +
      "</div></div>";

    function ulozit(metoda) {
      var pin = body.querySelector("#zk-epin").value || "";
      var telo = metoda === "DELETE" ? { pin: pin }
                                     : { email: body.querySelector("#zk-email").value || "", pin: pin };
      req("/auth/email", { method: metoda, body: telo }).then(function (r) {
        if (r.status !== 200) return renderAccount((r.body && r.body.error) || "Nepovedlo se.");
        req("/me").then(function (mm) { S.me = mm.body; renderAccount(""); });
      });
    }
    body.querySelector("#zk-esave").addEventListener("click", function () { ulozit("PUT"); });
    var del = body.querySelector("#zk-edel");
    if (del) del.addEventListener("click", function () { ulozit("DELETE"); });
    body.querySelector("#zk-logout").addEventListener("click", function () {
      token.clear(); S = {}; renderAuth();
    });
  }

  // ---------------------------------------------------------------- zapomenutý PIN
  function renderForgot(msg, hotovo) {
    stopAll();
    say("Odkaz na obnovu pošleme na e-mail, který máš u účtu.");
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap">' +
      backBar("Zpět", function () { renderAuth("login"); }) +
      "<h2>Zapomenutý PIN</h2>" +
      errBox(typeof msg === "string" ? msg : "") +
      (hotovo
        ? '<div class="qz-setcard zk-form"><div class="qz-setnote">' + esc(hotovo) + "</div></div>"
        : '<div class="qz-setcard zk-form">' +
            '<div class="qz-fieldlabel">Přezdívka</div>' +
            '<input class="qz-pname-in" id="zk-fnick" maxlength="20" autocomplete="username" placeholder="jak ti říkáme">' +
            '<button class="qz-go" id="zk-fgo">Poslat odkaz →</button>' +
            '<div class="qz-setnote" style="margin-top:.8rem">Bez e-mailu u účtu obnova nejde — pak zbývá založit nového hráče.</div>' +
          "</div>") +
      "</div>";
    var go = body.querySelector("#zk-fgo");
    if (go) go.addEventListener("click", function () {
      var nick = body.querySelector("#zk-fnick").value || "";
      req("/auth/reset", { method: "POST", body: { nick: nick } }).then(function (r) {
        if (r.status !== 200) return renderForgot((r.body && r.body.error) || "Nepovedlo se.");
        renderForgot("", (r.body && r.body.zprava) || "Pokud účet e-mail má, odkaz je na cestě.");
      });
    });
  }

  // ---------------------------------------------------------------- nový PIN z odkazu
  // Odkaz z e-mailu míří na /?obnova=TOKEN. Stejně jako u pozvánky na souboj se
  // parametr po použití z adresy maže, ať se obrazovka nevrací při dalším otevření.
  function pendingReset() {
    return new URLSearchParams(location.search).get("obnova");
  }

  function renderResetPin(tok, msg) {
    stopAll();
    say("Nastav si nový PIN. Starý už platit nebude.");
    body.innerHTML =
      '<div class="qz-screen qz-setup zk-wrap">' +
      backBar("Zpět", function () {
        history.replaceState(null, "", location.pathname); renderAuth("login");
      }) +
      "<h2>Nový PIN</h2>" +
      errBox(typeof msg === "string" ? msg : "") +
      '<div class="qz-setcard zk-form">' +
        '<div class="qz-fieldlabel">Nový PIN (4 až 8 číslic)</div>' +
        '<input class="qz-pname-in" id="zk-npin" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password" placeholder="••••">' +
        '<button class="qz-go" id="zk-ngo">Nastavit a přihlásit →</button>' +
      "</div></div>";

    body.querySelector("#zk-ngo").addEventListener("click", function () {
      var pin = body.querySelector("#zk-npin").value || "";
      req("/auth/reset/confirm", { method: "POST", body: { token: tok, pin: pin } }).then(function (r) {
        if (r.status !== 200) return renderResetPin(tok, (r.body && r.body.error) || "Nepovedlo se.");
        history.replaceState(null, "", location.pathname);
        token.set(r.body.token);
        req("/me").then(function (m) { S.me = m.body; renderLobby(); });
      });
    });
  }

  // ---------------------------------------------------------------- rozcestník
  function renderLobby(msg) {
    stopAll();
    var r = (S.me.ratings || []).filter(function (x) { return x.band === S.me.band; })[0];
    say("Vítej zpátky, " + S.me.nick + ".");
    body.innerHTML =
      '<div class="qz-screen qz-modepick zk-wrap">' +
      backBar("Zpět do hry", leave) +
      "<h2>Online</h2>" +
      errBox(msg) +
      '<div class="qz-meta" style="text-align:center;margin-bottom:1rem">' +
        esc(S.me.nick) + " · " + { deti: "Děti", starsi: "Pubertáci", dospeli: "Dospělí" }[S.me.band] +
        (r ? " · rating <b>" + r.rating + "</b>" + (r.games ? " (" + r.games + " " + plur(r.games, "hra", "hry", "her") + ")" : " (zatím nezahráno)") : "") +
      "</div>" +
      '<div class="qz-modes">' +
        tile("zk-live", "Hrát teď", "Najdeme ti soupeře. Nikdo? Nastoupí bot.") +
        tile("zk-link", "Souboj na odkaz", "Pošli odkaz kamarádovi, hrajte kdy chcete.") +
        tile("zk-daily", "Denní pětka", "Pět otázek, pro všechny stejných. Jeden pokus.") +
      "</div>" +
      '<div class="qz-modes" style="margin-top:1rem">' +
        tile("zk-board", "Žebříček", "Kdo je na tom nejlíp.") +
        tile("zk-friends", "Přátelé", "Přidávají se na kód.") +
        tile("zk-account", "Účet", "E-mail pro obnovu PINu, odhlášení.") +
      "</div></div>";

    on("zk-live", startQueue);
    on("zk-link", createLink);
    on("zk-daily", startDaily);
    on("zk-board", renderBoard);
    on("zk-friends", renderFriends);
    on("zk-account", renderAccount);
  }

  function tile(id, t, d) {
    return '<button class="qz-mode" id="' + id + '"><div class="t">' + esc(t) +
           '</div><div class="d">' + esc(d) + "</div></button>";
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
        '<div class="qz-q" id="zk-qstat">Stavím se do fronty…</div>' +
        '<div class="qz-setnote">Páruje se uvnitř tvého pásma. Čím déle čekáš, tím širší okno.</div>' +
        '<button class="qz-go" id="zk-bot" style="display:none">Zahrát si proti botovi →</button>' +
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
          if (p.body.offer_bot) botBtn.style.display = "";
        });
      }, 2000);
    });
  }

  // ---------------------------------------------------------------- souboj na odkaz
  function createLink(withBot) {
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
      say("Pošli odkaz a hraj. Soupeř dostane stejné otázky.");
      body.innerHTML =
        '<div class="qz-screen qz-setup zk-wrap">' +
        backBar("Zpět", renderLobby) +
        "<h2>Souboj na odkaz</h2>" +
        '<div class="qz-setcard zk-form">' +
          '<div class="qz-fieldlabel">Odkaz pro soupeře</div>' +
          '<input class="qz-pname-in" id="zk-url" readonly value="' + esc(url) + '">' +
          '<button class="qz-back" id="zk-copy" style="margin:.6rem 0">Zkopírovat odkaz</button>' +
          '<div class="qz-setnote">Soupeř dostane stejné otázky ve stejném pořadí. Jeho výsledek uvidíš, až dohrajete oba.</div>' +
          '<button class="qz-go" id="zk-play">Zahrát si svoji půlku →</button>' +
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
        say("Dnešní pětku už máš za sebou.");
        return showResult(r.body.game_id, "daily");
      }
      say("Pět otázek, pro všechny dnes stejných. Jeden pokus.");
      beginGame(r.body.game_id, "daily", null);
    });
  }

  // ---------------------------------------------------------------- hra
  function beginGame(id, mode, opponent) {
    stopAll();
    S.game = { id: id, mode: mode, n: 0, opponent: opponent, score: 0 };
    req("/game/" + id).then(function (r) {
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "Hra se nenačetla.");
      S.game.total = r.body.total;
      S.game.n = r.body.me.answered;
      S.game.score = r.body.me.score;
      if (r.body.me.done) return showResult(id, mode);
      nextQuestion();
    });
  }

  function nextQuestion() {
    stopAll();
    var g = S.game;
    if (g.n >= g.total) return showResult(g.id, g.mode);

    req("/game/" + g.id + "/q/" + g.n).then(function (r) {
      if (r.status !== 200) return renderLobby((r.body && r.body.error) || "Otázka se nenačetla.");
      var q = r.body;
      say("Tak schválně…");
      body.innerHTML =
        '<div class="qz-screen qz-play">' +
        '<div class="qz-top"><span class="qz-progress">Otázka ' + (q.n + 1) + "/" + q.total + "</span>" +
          '<span class="qz-scorepill" id="zk-score">' + g.score + " b</span>" +
          '<span class="qz-meta" id="zk-opp" class="zk-oppbar"></span></div>' +
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

      if (g.mode === "duel") watchOpponent();
    });
  }

  /** Průběh soupeře během živého duelu — obdoba šachových hodin. */
  function watchOpponent() {
    var el = body.querySelector("#zk-opp");
    if (!el) return;
    poll = setInterval(function () {
      req("/game/" + S.game.id + "/live").then(function (r) {
        var o = r.body && r.body.opponent;
        if (!o || !el.isConnected) return;
        el.innerHTML = esc(o.nick) + ": " + o.answered + "/" + S.game.total +
                       (o.score != null ? " · " + o.score + " b" : "");
      });
    }, 2000);
  }

  function submit(q, pick, ms) {
    if (timer) { clearInterval(timer); timer = null; }
    body.querySelectorAll("#qz-box .qz-a").forEach(function (b) { b.disabled = true; });

    req("/game/" + S.game.id + "/answer", {
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
      var more = a.more_fact
        ? '<button class="qz-more" id="zk-more">Více o ' + esc(a.about || "tom") +
          ' <span class="qz-more-ico">💡</span></button>'
        : "";
      box.insertAdjacentHTML("beforeend",
        '<div class="qz-quipbox"><div class="qz-hlaska">' + esc(a.quip || "") + "</div></div>" +
        '<div class="qz-frow"><div class="qz-expl">' + esc(a.explanation || "") + "</div>" +
        '<div class="qz-fbtns">' + more +
        '<button class="qz-next" id="zk-next">' +
          (a.done ? "Výsledek" : "Další otázka") + " →</button></div></div>");

      body.querySelector("#zk-next").addEventListener("click", function () {
        if (a.done) showResult(S.game.id, S.game.mode);
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
  function showResult(id, mode) {
    stopAll();
    req("/game/" + id).then(function (r) {
      if (r.status !== 200) return renderLobby("Výsledek se nenačetl.");
      var g = r.body;
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

      body.innerHTML =
        '<div class="qz-screen qz-end zk-wrap">' +
        "<h2>" + esc(head) + "</h2>" +
        '<div class="qz-endscore">' + g.me.score + " bodů</div>" +
        '<div class="zk-rowlist">' + rows + "</div>" +
        '<div class="qz-setnote">' + (!g.rated ? 'Nehodnocená hra.'
          : waiting ? 'Hodnocená hra — rating se přepočítá, až dohrajete oba.'
          : 'Hodnocená hra — rating se přepočítal.') + '</div>' +
        (review ? '<h3 style="margin-top:1.2rem">Rozbor</h3><div class="zk-rowlist">' + review + "</div>" : "") +
        '<div class="qz-fbtns" style="margin-top:1.2rem">' +
          (g.status === "done" && g.players.length > 1
            ? '<button class="qz-more" id="zk-rematch">Odveta</button>' : "") +
          '<button class="qz-next" id="zk-lobby">Zpět do online →</button>' +
        "</div></div>";

      on("zk-lobby", function () {
        req("/me").then(function (m) { S.me = m.body; renderLobby(); });
      });
      on("zk-rematch", function () {
        req("/game/" + id + "/rematch", { method: "POST" }).then(function (rr) {
          if (rr.status !== 201) return renderLobby((rr.body && rr.body.error) || "Odveta nešla založit.");
          beginGame(rr.body.id, "odkaz", null);
        });
      });
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
        (rows.length
          ? '<div class="zk-rowlist">' + rows.map(function (x) {
              return '<div class="qz-standrow"><span class="qz-rank">' + x.rank + ".</span>" +
                '<span class="qz-standname">' + esc(x.nick) + "</span>" +
                '<span class="qz-standscore">' + x.rating + "</span></div>";
            }).join("") + "</div>"
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
        ((d.friends || []).length
          ? '<div class="zk-rowlist">' + d.friends.map(function (f) {
              return '<div class="qz-standrow"><span class="qz-standname">' + esc(f.nick) + "</span></div>";
            }).join("") + "</div>"
          : '<div class="qz-setnote">Zatím nikdo.</div>') +
        "</div>";

      body.querySelector("#zk-addf").addEventListener("click", function () {
        var code = body.querySelector("#zk-code").value || "";
        req("/friends", { method: "POST", body: { code: code } }).then(function (rr) {
          renderFriends(rr.status === 201 ? "" : (rr.body && rr.body.error) || "Nepovedlo se.");
        });
      });
    });
  }

  return { open: open };
})();
