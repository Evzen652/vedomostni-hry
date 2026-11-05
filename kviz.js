/* Cestokvíz — ŽIVÝ KVÍZ (2026-11-05). „Hospodský kvíz" ve dvou pevných termínech týdně.
 * Rozhodnutí a jejich důvody: CLAUDE.md, zápis 2026-11-05. Server: functions/_lib/kviz.js.
 *
 * Samostatný modul jako online.js: přebírá #qz-body. Když je AKTIVNI, quiz.js místo
 * rozcestníku otevře tenhle kvíz a ostatní režimy jsou schované (kód zůstává funkční).
 *
 * PRŮBĚH ŘÍDÍ HODINY. Celý večer je čistá funkce `starts_at` a čtyř délek (`casy()`
 * je kopie serverové funkce), takže klient se serveru neptá, co se děje — spočítá si
 * to sám podle serverového času (`posun`) a ptá se jen ve chvíli, kdy něco potřebuje.
 * Kdo zavře a znovu otevře stránku, naskočí přesně tam, kde večer právě je.
 */
window.ZKKviz = (function () {
  "use strict";

  // PŘEPÍNAČ REŽIMU. true = appka je živý kvíz (rozcestník, sólo, párty, škola i online
  // liga se schovají). false = původní Cestokvíz. Čte ho i build (build-public.js):
  // při true se na web NENAHRÁVÁ data/questions, takže odpovědi nejsou veřejně.
  var AKTIVNI = true;

  var API = "/api";
  var TOKEN_KEY = "zk_online_token";
  var body = null;
  var posun = 0;            // serverový čas − můj čas
  var K = null;             // aktuální kvíz
  var data = null;          // poslední odpověď GET /kviz
  var casovace = [];
  var stav = {};            // co je právě na obrazovce (faze, n)

  // ------------------------------------------------------------------ pomocníci
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function velke(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
  // Malovaná šipka — kopie handArrowSvg z quiz.js (CLAUDE.md: plochý glyf šipky v UI nikdy).
  function handArrowSvg(flip) {
    var f = flip ? ";transform:scaleX(-1)" : "";
    return '<svg style="width:1.5em;height:.95em;vertical-align:-.15em;display:inline-block' + f + '" viewBox="0 0 40 24" fill="none">' +
      '<path d="M2.5 13c9-3.4 21-2.6 29-2" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M23.5 4.5c3.5 2.4 6.7 4.4 10 6.4-3.4 2.2-7 4-10.8 6.4" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var ICO_STAR = '<img src="assets/ico-star.png" alt="" style="width:1em;height:1em;vertical-align:-0.14em;flex:none;display:inline-block">';
  function say(t) {
    var el = document.getElementById("qz-host-bubble");
    if (el) { el.textContent = t || ""; el.style.display = t ? "" : "none"; }
  }
  function plur(n, a, b, c) { return n === 1 ? a : (n >= 2 && n <= 4 ? b : c); }
  function ted() { return Date.now() + posun; }
  function token() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }

  function req(path, opts) {
    opts = opts || {};
    var h = { "content-type": "application/json" };
    var t = token();
    if (t) h.authorization = "Bearer " + t;
    return fetch(API + path, { method: opts.method || "GET", headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) {
        return r.json().catch(function () { return null; }).then(function (b) {
          if (b && typeof b.server_now === "number") posun = b.server_now - Date.now();
          return { status: r.status, body: b };
        });
      }, function () { return { status: 0, body: null }; });
  }

  function zastav() { casovace.forEach(function (t) { clearTimeout(t); clearInterval(t); }); casovace = []; }
  function za(ms, fn) { casovace.push(setTimeout(fn, Math.max(0, ms))); }
  function kazdych(ms, fn) { casovace.push(setInterval(fn, ms)); }
  function pripojeno(el) { return el && el.isConnected; }

  // Zdroj registrace z odkazu (`?zdroj=fb-streda`) — vyhodnocení reklamy bez pixelu.
  function zdroj() {
    try {
      var z = new URLSearchParams(location.search).get("zdroj");
      if (z) sessionStorage.setItem("ck_zdroj", z);
      return sessionStorage.getItem("ck_zdroj") || null;
    } catch (e) { return null; }
  }

  // ------------------------------------------------------------------ čas a datum
  // KOPIE serverové casy() (functions/_lib/kviz.js). Změníš-li jednu, změň obě.
  var TOLERANCE_MS = 1500;
  function casy(k, n) {
    var naOtazku = (k.limit_s + k.odhaleni_s) * 1000;
    var kolo = Math.floor(n / k.na_kolo), i = n % k.na_kolo;
    var otevreno = k.starts_at + kolo * (k.na_kolo * naOtazku + k.prestavka_s * 1000) + i * naOtazku;
    var uzaverka = otevreno + k.limit_s * 1000;
    return { otevreno: otevreno, uzaverka: uzaverka, odhaleni_od: uzaverka + TOLERANCE_MS, odhaleni_do: uzaverka + k.odhaleni_s * 1000 };
  }
  var fmtDen = new Intl.DateTimeFormat("cs-CZ", { timeZone: "Europe/Prague", weekday: "long", day: "numeric", month: "long" });
  var fmtCas = new Intl.DateTimeFormat("cs-CZ", { timeZone: "Europe/Prague", hour: "numeric", minute: "2-digit" });
  function kdy(ms) { return velke(fmtDen.format(new Date(ms))) + " v " + fmtCas.format(new Date(ms)); }
  var DNY = ["neděli", "pondělí", "úterý", "středu", "čtvrtek", "pátek", "sobotu"];
  function terminyText(t) {
    return (t || []).map(function (x) { return DNY[x.den] + " v " + x.hod + ":" + String(x.min || 0).padStart(2, "0"); })
      .join(" a ");
  }
  function odpocetText(ms) {
    if (ms <= 0) return "Začínáme";
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    if (d >= 1) return "Za " + d + " " + plur(d, "den", "dny", "dní") + (h ? " a " + h + " " + plur(h, "hodinu", "hodiny", "hodin") : "");
    if (h >= 1) return "Za " + h + " " + plur(h, "hodinu", "hodiny", "hodin") + (m ? " a " + m + " " + plur(m, "minutu", "minuty", "minut") : "");
    var sek = s % 60;
    return "Za " + m + ":" + String(sek).padStart(2, "0");
  }
  function hodiny(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  // ------------------------------------------------------------------ vstup
  function open() {
    body = document.getElementById("qz-body");
    zastav();
    zdroj();
    hlidejNavrat();
    nacti();
  }

  /* Návrat do záložky. Prohlížeč ve skryté záložce (zhasnutý telefon, jiná aplikace)
   * časovače brzdí, v Chrome po pěti minutách až na jeden za minutu — ověřeno při
   * zkoušce, kdy odhalení doběhlo o desítky vteřin později. Po návratu se proto večer
   * znovu dopočítá z času, takže hráč skočí rovnou tam, kde kvíz právě je. */
  var skryto = 0, hlida = false;
  function hlidejNavrat() {
    if (hlida) return;
    hlida = true;
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") { skryto = Date.now(); return; }
      if (!skryto || Date.now() - skryto < 2000) return;
      skryto = 0;
      if (!body || !body.isConnected || !body.querySelector(".kz-domu, .kz-wrap, .kz-play")) return;
      if (K && K.prihlasen && ted() >= K.starts_at - 15 * 60 * 1000) rozcestnik(); else nacti();
    });
  }

  function nacti() {
    zastav();
    req("/kviz").then(function (r) {
      if (r.status !== 200) return chyba("Kvíz se nenačetl. Zkontroluj připojení a zkus to znovu.");
      data = r.body;
      K = data.kviz;
      rozcestnik();
    });
  }

  // Kam teď: podle času a toho, jestli je hráč v kvízu.
  function rozcestnik() {
    zastav();
    if (!K) return domu();
    var t = ted();
    if (K.prihlasen && t >= K.starts_at) return hraj();
    if (K.prihlasen && t >= K.starts_at - 15 * 60 * 1000) return cekarna();
    domu();
  }

  function chyba(text) {
    zastav();
    say("Ajaj.");
    body.innerHTML = '<div class="qz-screen qz-end kz-wrap"><h2>Něco se pokazilo</h2><p class="kz-tichy">' + esc(text) + "</p>" +
      '<button class="qz-go" id="kz-znovu">Zkusit znovu</button></div>';
    body.querySelector("#kz-znovu").addEventListener("click", nacti);
  }

  // ------------------------------------------------------------------ úvodní strana
  function domu() {
    say("Vítejte u Cestokvízu! Pravidelný kvíz, pevný čas, jeden vítěz.");
    var k = K;
    var fakta = k ? '<ul class="kz-fakta">' +
      "<li><b>" + k.kol + " " + plur(k.kol, "kolo", "kola", "kol") + "</b> po " + k.na_kolo + " otázkách</li>" +
      "<li><b>" + k.limit_s + " vteřin</b> na otázku</li>" +
      "<li>Asi <b>" + Math.round((k.konec_at - k.starts_at) / 60000 / 5) * 5 + " minut</b></li></ul>" : "";
    var bezi = k && ted() >= k.starts_at;
    var predchozi = data && data.predchozi && data.predchozi.vitez
      ? '<p class="kz-minule">Vítěz minulého kvízu: <b>' + esc(data.predchozi.vitez.nick) + "</b> (" +
        data.predchozi.vitez.score + " " + plur(data.predchozi.vitez.score, "bod", "body", "bodů") + "). Hráčů celkem: " +
        data.predchozi.pocet + "." +
        (data.predchozi.ja ? " Tvoje místo: <b>" + data.predchozi.ja.misto + ".</b>" : "") + "</p>"
      : "";
    body.innerHTML =
      '<div class="qz-screen qz-modepick kz-domu">' +
      '<div class="qz-titlewrap"><div class="qz-globebg" id="qz-globebg"></div><h2>Cestokvíz</h2></div>' +
      '<p class="qz-modesub">Živý kvíz o zemích světa. Každou ' + esc(terminyText(data && data.terminy)) +
      ". Odpovídá se na čas a na konci vyhlásíme vítěze.</p>" +
      (k ? '<section class="kz-karta">' +
        '<p class="kz-stitek">' + (bezi ? "Právě běží" : "Příští kvíz") + "</p>" +
        '<p class="kz-datum">' + esc(kdy(k.starts_at)) + "</p>" +
        '<p class="kz-odpocet" id="kz-odpocet">' + esc(odpocetText(k.starts_at - ted())) + "</p>" +
        fakta +
        '<p class="kz-pocet" id="kz-pocet">' + pocetText(k.pocet_hracu) + "</p>" +
        '<div class="kz-prihlaska" id="kz-prihlaska"></div>' +
        "</section>" + charitaHtml(k) : '<section class="kz-karta"><p class="kz-datum">Příští kvíz se připravuje</p></section>') +
      predchozi +
      '<div class="qz-legalfoot"><a href="podminky">Podmínky použití</a> · <a href="soukromi">Ochrana údajů</a> · <a href="smazani-uctu">Smazání profilu</a></div>' +
      "</div>";
    if (window.ZKGlobe) window.ZKGlobe.bg();
    if (!k) return;
    var el = body.querySelector("#kz-odpocet");
    kazdych(1000, function () {
      if (!pripojeno(el)) return;
      el.textContent = odpocetText(k.starts_at - ted());
      if (k.prihlasen && ted() >= k.starts_at - 15 * 60 * 1000) rozcestnik();
    });
    prihlaska(body.querySelector("#kz-prihlaska"));
  }

  function pocetText(n) {
    if (!n) return "Zatím se nikdo nepřihlásil. Buď první.";
    return "Přihlášen" + plur(n, "", "i", "o") + " " + n + " " + plur(n, "hráč", "hráči", "hráčů") + ".";
  }

  function charitaHtml(k) {
    var c = k && k.charita;
    if (!c || !c.nazev) return "";
    return '<section class="kz-charita"><p class="kz-stitek">Hrajeme pro dobrou věc</p>' +
      "<h3>" + esc(c.nazev) + "</h3>" + (c.text ? "<p>" + esc(c.text) + "</p>" : "") +
      (c.url ? '<a class="kz-charitalink" href="' + esc(c.url) + '" target="_blank" rel="noopener">Podpořit sbírku</a>' : "") +
      '<p class="kz-tichy">Příspěvek je dobrovolný a na kvíz nemá žádný vliv.</p></section>';
  }

  /* Přihláška do kvízu PŘÍMO NA ÚVODNÍ STRANĚ (vzor profilVeVyzve v quiz.js):
   * přihlášený vidí jedno tlačítko, ostatní přezdívku + PIN + 13+. Nová přezdívka založí
   * profil, známá přihlásí (ZKOnline.zalozNeboPrihlas). */
  function prihlaska(el) {
    var k = K;
    if (!el || !k) return;
    if (k.prihlasen) {
      el.innerHTML = '<p class="kz-ok">Máš místo v kvízu' + (data.ja ? " jako <b>" + esc(data.ja) + "</b>" : "") + ".</p>" +
        '<div class="kz-akce"><button class="qz-more" id="kz-kalendar">Přidat do kalendáře</button>' +
        (ted() >= k.starts_at - 15 * 60 * 1000 ? '<button class="qz-go" id="kz-cekarna">Do čekárny ' + handArrowSvg(false) + "</button>" : "") +
        "</div>";
      el.querySelector("#kz-kalendar").addEventListener("click", kalendar);
      var c = el.querySelector("#kz-cekarna");
      if (c) c.addEventListener("click", rozcestnik);
      return;
    }
    if (data.ja) {
      el.innerHTML = '<p class="kz-tichy">Pod přezdívkou <b>' + esc(data.ja) + "</b></p>" +
        '<button class="qz-go" id="kz-prihlasit">Chci hrát ' + handArrowSvg(false) + "</button>" +
        '<p class="qz-vyzvachyba" role="alert"></p>';
      el.querySelector("#kz-prihlasit").addEventListener("click", function () { zapis(el); });
      return;
    }
    el.innerHTML =
      '<p class="kz-tichy">Stačí přezdívka a PIN. Nová přezdívka založí profil, známá tě přihlásí.</p>' +
      '<div class="qz-vyzvapole">' +
        '<input class="qz-pname-in" id="kz-nick" maxlength="20" autocomplete="username" aria-label="Přezdívka" placeholder="Přezdívka">' +
        '<input class="qz-pname-in" id="kz-pin" type="password" inputmode="numeric" maxlength="8" autocomplete="current-password" aria-label="PIN" placeholder="PIN (4 až 8 číslic)">' +
      "</div>" +
      '<label class="qz-vyzvasouhlas"><input type="checkbox" id="kz-13"> Je mi aspoň 13 let a souhlasím s <a href="/podminky" target="_blank" rel="noopener">Podmínkami použití</a>.</label>' +
      '<button class="qz-go" id="kz-prihlasit" disabled>Chci hrát ' + handArrowSvg(false) + "</button>" +
      '<p class="qz-vyzvachyba" role="alert"></p>';
    var btn = el.querySelector("#kz-prihlasit");
    var hlidej = function () {
      btn.disabled = !(el.querySelector("#kz-nick").value.trim() &&
        /^[0-9]{4,8}$/.test(el.querySelector("#kz-pin").value.trim()) && el.querySelector("#kz-13").checked);
    };
    el.querySelectorAll("input").forEach(function (i) { i.addEventListener("input", hlidej); i.addEventListener("change", hlidej); });
    btn.addEventListener("click", function () {
      var O = window.ZKOnline;
      if (!O || !O.zalozNeboPrihlas) return;
      btn.disabled = true;
      var chybaEl = el.querySelector(".qz-vyzvachyba"); chybaEl.textContent = "";
      O.zalozNeboPrihlas(el.querySelector("#kz-nick").value.trim(), el.querySelector("#kz-pin").value.trim()).then(function (r) {
        if (!pripojeno(el)) return;
        if (r.error) { chybaEl.textContent = velke(r.error); btn.disabled = false; return; }
        data.ja = r.nick;
        zapis(el);
      });
    });
  }

  function zapis(el) {
    var btn = el.querySelector("#kz-prihlasit");
    if (btn) btn.disabled = true;
    req("/kviz/" + K.id + "/prihlasit", { method: "POST", body: { zdroj: zdroj() } }).then(function (r) {
      if (!pripojeno(el)) return;
      if (r.status !== 200) {
        var ch = el.querySelector(".qz-vyzvachyba");
        if (ch) ch.textContent = velke((r.body && r.body.error) || "Přihlášení do kvízu se nepovedlo.");
        if (btn) btn.disabled = false;
        return;
      }
      K.prihlasen = true;
      K.pocet_hracu = r.body.pocet_hracu;
      var p = body.querySelector("#kz-pocet");
      if (p) p.textContent = pocetText(K.pocet_hracu);
      say("Máš místo! Připomínku si dej do kalendáře, ať na kvíz nezapomeneš.");
      if (ted() >= K.starts_at - 15 * 60 * 1000) return rozcestnik();
      prihlaska(el);
    });
  }

  // Připomínka bez serveru a bez pošty: soubor .ics, který otevře kalendář v telefonu.
  function kalendar() {
    var k = K;
    var utc = function (ms) { return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
    var url = location.origin + "/";
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cestokviz//CS", "BEGIN:VEVENT",
      "UID:" + k.id + "@cestokviz.cz", "DTSTAMP:" + utc(Date.now()),
      "DTSTART:" + utc(k.starts_at), "DTEND:" + utc(k.konec_at),
      "SUMMARY:Cestokvíz", "DESCRIPTION:Živý kvíz o zemích světa. Hraje se na " + url,
      "URL:" + url,
      "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Cestokvíz za 15 minut", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "cestokviz.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  // ------------------------------------------------------------------ čekárna
  function cekarna() {
    zastav();
    say("Než začneme: na otázku máš " + K.limit_s + " vteřin. Body jsou za správnost i za rychlost.");
    body.innerHTML =
      '<div class="qz-screen qz-end kz-wrap kz-cekarna">' +
      '<p class="kz-stitek">Za chvíli začínáme</p>' +
      '<p class="kz-velkycas" id="kz-cas">' + hodiny(K.starts_at - ted()) + "</p>" +
      '<p class="kz-pocet" id="kz-pocet">' + pocetText(K.pocet_hracu) + "</p>" +
      '<ul class="kz-fakta"><li><b>' + K.kol + " " + plur(K.kol, "kolo", "kola", "kol") + "</b> po " + K.na_kolo + " otázkách</li>" +
        "<li>Po každém kole přestávka s průběžným pořadím</li>" +
        "<li>Kdo se připojí pozdě, naskočí do běžící otázky</li></ul>" +
      charitaHtml(K) + "</div>";
    var el = body.querySelector("#kz-cas");
    kazdych(250, function () {
      if (!pripojeno(el)) return;
      var zbyva = K.starts_at - ted();
      el.textContent = hodiny(zbyva);
      if (zbyva <= 0) hraj();
    });
    // Počet čekajících se obnovuje jednou za 20 s: je to nejlevnější „je tu živo".
    kazdych(20000, function () {
      req("/kviz").then(function (r) {
        var p = body.querySelector("#kz-pocet");
        if (r.status === 200 && r.body.kviz && pripojeno(p)) p.textContent = pocetText(r.body.kviz.pocet_hracu);
      });
    });
  }

  // ------------------------------------------------------------------ hra
  // Fáze se počítá z času. Každá obrazovka si naplánuje další krok na konec své fáze.
  function hraj() {
    zastav();
    var t = ted(), celkem = K.pocet_otazek;
    for (var n = 0; n < celkem; n++) {
      var c = casy(K, n);
      if (t < c.otevreno) {
        if (n > 0 && n % K.na_kolo === 0) return prestavka(n / K.na_kolo, c.otevreno);
        return cekarna();
      }
      if (t < c.odhaleni_do) return otazka(n);
    }
    konec();
  }

  function otazka(n) {
    zastav();
    stav = { n: n, tip: null };
    var c = casy(K, n);
    // Rozptyl 0–600 ms: všichni hráči by jinak sáhli na server ve stejné milisekundě.
    // Čas se měří od otevření otázky, takže to stojí nejvýš ~2 body ze 100 bonusových.
    var rozptyl = ted() < c.uzaverka ? Math.random() * 600 : 0;
    za(rozptyl, function () { stahniOtazku(n, c); });
  }

  function stahniOtazku(n, c) {
    req("/kviz/" + K.id + "/q/" + n).then(function (r) {
      if (stav.n !== n) return;
      if (r.status === 425) return za((r.body && r.body.za_ms) || 500, function () { stahniOtazku(n, c); });
      if (r.status === 403) { K.prihlasen = false; return domu(); }
      if (r.status !== 200) return za(1500, function () { if (stav.n === n) stahniOtazku(n, c); });
      kresliOtazku(r.body, c);
    });
  }

  function picframe(q) {
    if (!window.ZKPicframe) return "";
    return window.ZKPicframe.html({ id: q.id, cc: q.cc, country: q.country, section: q.section }, true);
  }

  function kresliOtazku(q, c) {
    stav.q = q;
    say(q.v_kole === 1 ? q.kolo + ". kolo začíná. Hodně štěstí!" : "Tak schválně…");
    body.innerHTML =
      '<div class="qz-screen qz-play kz-play">' +
      '<div class="qz-top"><span class="qz-progress">' + q.kolo + ". kolo · otázka " + q.v_kole + "/" + K.na_kolo + "</span>" +
        '<span class="qz-scorepill" id="kz-score">' + ICO_STAR + " <b>" + (stav.score || 0) + "</b></span></div>" +
      '<div class="qz-box" id="qz-box">' +
        '<div class="qz-timerbar" id="kz-timer"><div style="width:100%"></div></div>' +
        '<div class="qz-meta">' + esc(q.country) + " · " + esc(q.section) + (window.ZKDiff ? " · " + window.ZKDiff.html(q) : "") + "</div>" +
        '<div class="qz-q">' + esc(q.question) + "</div>" +
        '<div class="qz-ans">' + q.options.map(function (o, i) {
          return '<button class="qz-a" data-i="' + i + '">' + esc(o) + "<small>" + "ABCD"[i] + "</small></button>";
        }).join("") + "</div>" +
        '<p class="kz-stav" id="kz-stav" aria-live="polite"></p>' +
      "</div>" + picframe(q) + "</div>";
    if (window.ZKPicframe) { window.ZKPicframe.wire(); window.ZKPicframe.globe(q.cc); }

    var bar = body.querySelector("#kz-timer").firstElementChild;
    var limit = K.limit_s * 1000;
    kazdych(100, function () {
      var zbyva = c.uzaverka - ted();
      bar.style.width = Math.max(0, Math.min(100, zbyva / limit * 100)) + "%";
      if (zbyva <= 0) zamkni(true);
    });
    body.querySelectorAll("#qz-box .qz-a").forEach(function (b) {
      b.addEventListener("click", function () { odpovez(q.n, +b.dataset.i); });
    });
    if (q.muj_tip != null) { stav.tip = q.muj_tip; zamkni(false); }
    else if (ted() >= c.uzaverka) zamkni(true);
    else {
      var prvni = body.querySelector("#qz-box .qz-a");
      if (prvni) prvni.focus({ preventScroll: true });
    }
    za(c.odhaleni_od - ted(), function () { odhal(q.n); });
  }

  function zamkni(casVyprsel) {
    var btns = body.querySelectorAll("#qz-box .qz-a");
    btns.forEach(function (b, i) {
      b.disabled = true;
      if (i === stav.tip) { b.classList.add("kz-tip"); var s = b.querySelector("small"); if (s) s.textContent = "Tvůj tip"; }
    });
    var st = body.querySelector("#kz-stav");
    if (st) st.textContent = stav.tip != null ? "Tip je odeslaný. Správnou odpověď uvidí všichni naráz." :
      (casVyprsel ? "Čas vypršel." : "");
  }

  function odpovez(n, pick) {
    if (stav.tip != null || stav.n !== n) return;
    stav.tip = pick;
    zamkni(false);
    say("Tip odeslán. Teď se čeká na ostatní…");
    var posli = function (pokus) {
      req("/kviz/" + K.id + "/odpoved", { method: "POST", body: { n: n, pick: pick } }).then(function (r) {
        if (r.status === 0 && pokus < 2) return za(600, function () { posli(pokus + 1); });
        if (r.status === 200 || r.status === 409) return;
        var st = body.querySelector("#kz-stav");
        if (st && stav.n === n) st.textContent = r.status === 410 ? "Tip dorazil pozdě, tahle otázka se nepočítá." : "Tip se nepodařilo odeslat.";
      });
    };
    posli(0);
  }

  function odhal(n) {
    req("/kviz/" + K.id + "/odhaleni/" + n).then(function (r) {
      if (stav.n !== n) return;
      if (r.status === 425) return za((r.body && r.body.za_ms) || 400, function () { odhal(n); });
      if (r.status !== 200) return za(1000, function () { if (stav.n === n) odhal(n); });
      kresliOdhaleni(r.body);
    });
  }

  function kresliOdhaleni(a) {
    var box = body.querySelector("#qz-box");
    if (!box) return;
    zastav();
    var ja = a.ja || {};
    var trefa = ja.correct;
    var btns = box.querySelectorAll(".qz-a");
    btns.forEach(function (b, i) {
      b.disabled = true;
      b.classList.add("locked");
      var s = b.querySelector("small");
      if (i === a.correct_index) { b.classList.add("ok"); if (s) s.textContent = "Správně"; }
      else if (i === ja.pick) { b.classList.add("bad"); if (s) s.textContent = "Tvůj tip"; }
      else if (s) s.remove();
    });
    var st = box.querySelector("#kz-stav"); if (st) st.remove();
    var bar = box.querySelector("#kz-timer"); if (bar) bar.remove();
    say(trefa ? "Správně!" : ja.pick == null ? "Tahle ti utekla." : "Tentokrát vedle.");
    if (window.ZKPicframe) window.ZKPicframe.reveal();
    var stary = stav.score || 0;
    stav.score = ja.score || 0;
    var pill = body.querySelector("#kz-score b");
    if (pill && window.ZKAnim) window.ZKAnim.cislo(pill, stary, stav.score); else if (pill) pill.textContent = stav.score;

    var hlaska = trefa ? a.quip_correct : ja.pick == null ? "" : a.quip_wrong;
    var podil = a.odpovedelo ? "Správně " + a.trefilo + " z " + a.odpovedelo + " " + plur(a.odpovedelo, "hráče", "hráčů", "hráčů") + "." : "";
    var c = casy(K, a.n);
    var posledniVKole = (a.n + 1) % K.na_kolo === 0;
    var dalsi = a.n + 1 >= K.pocet_otazek ? "Vyhlášení" : posledniVKole ? "Přestávka" : "Další otázka";
    box.insertAdjacentHTML("beforeend",
      '<div class="qz-hl points kz-body">' + (trefa ? "+" + ja.points + " " + plur(ja.points, "bod", "body", "bodů") : "Bez bodů") + "</div>" +
      (hlaska ? '<div class="qz-quipbox"><div class="qz-ht">„' + esc(hlaska) + "“</div></div>" : "") +
      '<div class="qz-frow"><div class="qz-expl">' + esc(a.explanation || "") +
        (podil ? '<span class="kz-podil">' + podil + "</span>" : "") + "</div>" +
      '<div class="qz-fbtns">' +
        (a.more_fact ? '<button class="qz-more" id="kz-more">Více o ' + esc(a.about || "tom") + "</button>" : "") +
        '<p class="kz-dalsi" id="kz-dalsi">' + dalsi + " za " + Math.max(0, Math.ceil((c.odhaleni_do - ted()) / 1000)) + " s</p>" +
      "</div></div>");
    if (window.ZKPicframe && window.ZKPicframe.podObrazek) window.ZKPicframe.podObrazek(box);
    var m = body.querySelector("#kz-more");
    if (m) m.addEventListener("click", function () { vice(a); });
    var d = body.querySelector("#kz-dalsi");
    kazdych(250, function () {
      if (pripojeno(d)) d.textContent = dalsi + " za " + Math.max(0, Math.ceil((c.odhaleni_do - ted()) / 1000)) + " s";
    });
    za(c.odhaleni_do - ted(), function () {
      var karta = document.querySelector(".qz-cardov"); if (karta) karta.remove();
      hraj();
    });
  }

  function vice(a) {
    var ov = document.createElement("div");
    ov.className = "qz-cardov";
    ov.innerHTML = '<div class="qz-cardbox"><div class="qz-cardbody"><h3>' + esc(a.correct_answer || "Více") + "</h3>" +
      "<p>" + esc(a.more_fact) + "</p>" + '<button class="qz-go" data-close="1">Zpět</button></div></div>';
    ov.addEventListener("click", function (e) { if (e.target === ov || e.target.dataset.close) ov.remove(); });
    document.getElementById("qz-shell").appendChild(ov);
  }

  // ------------------------------------------------------------------ pořadí
  function tabulka(po) {
    var radky = (po.top || []).map(function (r) {
      return '<div class="qz-standrow' + (r.misto === 1 ? " win" : "") + (r.ja ? " zk-me" : "") + '">' +
        '<span class="qz-rank">' + r.misto + ".</span>" +
        '<span class="qz-standname">' + esc(r.nick) + "</span>" +
        '<span class="qz-standscore">' + ICO_STAR + " " + r.score + "</span></div>";
    }).join("");
    var mimo = po.ja && !(po.top || []).some(function (r) { return r.ja; })
      ? '<div class="qz-standrow zk-me"><span class="qz-rank">' + po.ja.misto + '.</span><span class="qz-standname">Ty</span>' +
        '<span class="qz-standscore">' + ICO_STAR + " " + po.ja.score + "</span></div>" : "";
    return '<div class="qz-standings">' + radky + mimo + "</div>";
  }

  function prestavka(kolo, dalsiOd) {
    zastav();
    stav = { faze: "prestavka", score: stav.score };
    say("Přestávka! Protáhni se, za chvíli jedeme dál.");
    body.innerHTML =
      '<div class="qz-screen qz-end kz-wrap">' +
      '<p class="kz-stitek">Po ' + kolo + ". kole</p><h2>Průběžné pořadí</h2>" +
      '<div id="kz-poradi"><p class="kz-tichy">Načítám pořadí…</p></div>' +
      '<p class="kz-odpocet">' + (kolo + 1) + '. kolo začne za <span id="kz-cas">' + hodiny(dalsiOd - ted()) + "</span></p>" +
      charitaHtml(K) + "</div>";
    var el = body.querySelector("#kz-cas");
    kazdych(250, function () {
      if (!pripojeno(el)) return;
      var z = dalsiOd - ted();
      el.textContent = hodiny(z);
      if (z <= 0) hraj();
    });
    req("/kviz/" + K.id + "/poradi").then(function (r) {
      var box = body.querySelector("#kz-poradi");
      if (!pripojeno(box)) return;
      if (r.status !== 200) { box.innerHTML = '<p class="kz-tichy">Pořadí se teď nenačetlo.</p>'; return; }
      if (r.body.ja) stav.score = r.body.ja.score;
      box.innerHTML = tabulka(r.body) +
        (r.body.ja ? '<p class="kz-tichy">Jsi na <b>' + r.body.ja.misto + ". místě</b> z " + r.body.pocet + ".</p>" : "");
    });
  }

  function konec() {
    zastav();
    stav = {};
    say("A máme vítěze!");
    body.innerHTML =
      '<div class="qz-screen qz-end kz-wrap">' +
      '<p class="kz-stitek">Konec kvízu</p><h2 id="kz-vitez">Vyhlášení</h2>' +
      '<div id="kz-poradi"><p class="kz-tichy">Načítám výsledky…</p></div>' +
      '<p class="kz-tichy" id="kz-dalsikviz"></p>' +
      '<button class="qz-go" id="kz-domu">Na úvod ' + handArrowSvg(false) + "</button></div>";
    body.querySelector("#kz-domu").addEventListener("click", nacti);
    req("/kviz/" + K.id + "/poradi").then(function (r) {
      var box = body.querySelector("#kz-poradi");
      if (!pripojeno(box)) return;
      if (r.status !== 200) { box.innerHTML = '<p class="kz-tichy">Výsledky se teď nenačetly.</p>'; return; }
      var po = r.body, v = po.top && po.top[0];
      if (v) body.querySelector("#kz-vitez").textContent = "Vítěz: " + v.nick;
      box.innerHTML = tabulka(po) +
        (po.ja ? '<p class="kz-tichy">Tvoje místo: <b>' + po.ja.misto + ".</b> z " + po.pocet + ", správně " + po.ja.spravne + " z " + K.pocet_otazek + ".</p>" : "");
    });
    req("/kviz").then(function (r) {
      var el = body.querySelector("#kz-dalsikviz");
      if (pripojeno(el) && r.status === 200 && r.body.kviz && r.body.kviz.id !== K.id) {
        el.textContent = "Příští kvíz: " + kdy(r.body.kviz.starts_at) + ".";
      }
    });
  }

  return { aktivni: AKTIVNI, open: open, stop: zastav };
})();
