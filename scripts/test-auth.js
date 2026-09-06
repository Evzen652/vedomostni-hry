// Ověřuje přihlašovací token: podpis, platnost a hlavně EPOCHU, kterou se dá vydané
// přihlášení zneplatnit. Token je bezstavový a platí 90 dní, takže do 2026-09-06 se
// nedal odvolat nijak — ani změnou PINu. Epocha (`users.token_epoch`) je jediné místo,
// kde to jde utnout, takže si zaslouží test, který nepotřebuje síť ani databázi.
//
// Falešné env.DB jako v test-ghost a test-pool.

let chyb = 0, ok = 0;
const kontrola = (podm, popis) => { if (podm) { ok++; } else { chyb++; console.log("  CHYBA: " + popis); } };

const TAJEMSTVI = "testovaci-tajemstvi";
const enc = new TextEncoder();

/** Falešná D1 vracející jeden účet. */
function mockEnv(user) {
  return {
    DB: {
      prepare() {
        return { bind() { return this; }, async first() { return user; }, async run() { return {}; } };
      },
    },
    SESSION_SECRET: TAJEMSTVI,
  };
}

const req = token => ({ headers: { get: h => (h.toLowerCase() === "authorization" ? "Bearer " + token : "") } });

/** Token STARÉHO tvaru `uid.exp.mac` — tedy takový, jaké appka vydávala do 2026-09-06. */
async function staryToken(uid, exp) {
  const payload = uid + "." + exp;
  const key = await crypto.subtle.importKey("raw", enc.encode(TAJEMSTVI),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(mac)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return payload + "." + b64;
}

(async () => {
  const { signToken, verifyToken, currentUser } = await import("../functions/_lib/auth.js");

  // 1) Kolečko podpis → ověření.
  {
    const t = await signToken("uabc123", TAJEMSTVI, 90, 3);
    const v = await verifyToken(t, TAJEMSTVI);
    kontrola(v && v.uid === "uabc123", "token se neověřil nebo vrátil jiné id");
    kontrola(v && v.epoch === 3, "epocha se v tokenu neveze (je " + (v && v.epoch) + ")");
  }

  // 2) Podpis se ověřuje: přepsaná epocha token zabije.
  {
    const t = await signToken("uabc123", TAJEMSTVI, 90, 0);
    const casti = t.split(".");
    casti[2] = "9";                                   // „mám novější epochu"
    kontrola(await verifyToken(casti.join("."), TAJEMSTVI) === null,
      "přepsaná epocha prošla — podpis se neověřuje");
    kontrola(await verifyToken(t, "jine-tajemstvi") === null, "cizí tajemství prošlo");
    kontrola(await verifyToken("uplny.nesmysl", TAJEMSTVI) === null, "nesmyslný token prošel");
    kontrola(await verifyToken("abc.def.ghi", TAJEMSTVI) === null,
      "poškozený base64 v podpisu neskončil odmítnutím (nesmí spadnout na výjimku)");
  }

  // 3) Vypršení.
  {
    const t = await signToken("uabc123", TAJEMSTVI, -1, 0);
    kontrola(await verifyToken(t, TAJEMSTVI) === null, "vypršelý token prošel");
  }

  // 4) STARÝ TVAR tokenu musí platit dál — jinak by migrace odhlásila všechny naráz.
  {
    const t = await staryToken("uabc123", Date.now() + 86400000);
    const v = await verifyToken(t, TAJEMSTVI);
    kontrola(v && v.uid === "uabc123", "token vydaný před zavedením epochy přestal platit");
    kontrola(v && v.epoch === 0, "starý token se nebere jako epocha 0 (je " + (v && v.epoch) + ")");
  }

  // 5) currentUser: epocha účtu MUSÍ sedět s tou v tokenu.
  {
    const t0 = await signToken("uabc123", TAJEMSTVI, 90, 0);
    const ucet = { id: "uabc123", nick: "Tester", band: "dospeli", token_epoch: 0 };
    kontrola(!!(await currentUser(req(t0), mockEnv(ucet))), "platný token se odmítl");

    const poZmene = { ...ucet, token_epoch: 1 };      // účet mezitím obnovil PIN
    kontrola((await currentUser(req(t0), mockEnv(poZmene))) === null,
      "token přežil zvýšení epochy — přihlášení tedy nejde zneplatnit");

    const t1 = await signToken("uabc123", TAJEMSTVI, 90, 1);
    kontrola(!!(await currentUser(req(t1), mockEnv(poZmene))),
      "token s novou epochou neprošel — po obnově PINu by se nešlo přihlásit vůbec");
  }

  console.log("\n" + (chyb ? "NEPROŠLO: " + chyb + " chyb, " + ok + " v pořádku"
                            : "VŠE V POŘÁDKU: " + ok + " kontrol"));
  process.exit(chyb ? 1 : 0);
})();
