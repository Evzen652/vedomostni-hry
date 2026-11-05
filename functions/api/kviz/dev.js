import { json, fail } from '../../_lib/game.js';
import { zalozKviz } from '../../_lib/kviz.js';

/**
 * POST /api/kviz/dev  { za_s, kol?, na_kolo?, limit_s?, odhaleni_s?, prestavka_s?, charita? }
 *
 * JEN PRO LOKÁLNÍ VÝVOJ A TESTY: založí kvíz, který začne za `za_s` vteřin, s libovolně
 * krátkým tempem — na neděli v sedm se v testu čekat nedá. V produkci neexistuje:
 * `ALLOW_DEV_SECRET` se nastavuje jen v lokálním `.dev.vars` (viz auth.js → sessionSecret).
 */
export async function onRequestPost({ request, env }) {
  if (!env.ALLOW_DEV_SECRET) return fail('nenalezeno', 404);
  let b = {};
  try { b = await request.json(); } catch (e) { /* výchozí hodnoty */ }
  const cislo = (x, min, max, vychozi) => {
    const n = Number(x);
    return Number.isInteger(n) && n >= min && n <= max ? n : vychozi;
  };
  const tempo = {
    kol: cislo(b.kol, 1, 6, 4), na_kolo: cislo(b.na_kolo, 1, 20, 10),
    limit_s: cislo(b.limit_s, 2, 120, 30), odhaleni_s: cislo(b.odhaleni_s, 2, 60, 12),
    prestavka_s: cislo(b.prestavka_s, 1, 900, 240),
  };
  const id = 'kdev' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const start = Date.now() + cislo(b.za_s, 0, 86400, 10) * 1000;
  const charita = b.charita && typeof b.charita === 'object' ? {
    nazev: String(b.charita.nazev || '').slice(0, 120),
    text: String(b.charita.text || '').slice(0, 600),
    url: /^https:\/\//.test(String(b.charita.url || '')) ? String(b.charita.url).slice(0, 300) : '',
  } : null;
  const ok = await zalozKviz(env, id, start, tempo, charita);
  if (!ok) return fail('na kvíz není dost nepoužitých otázek', 503);
  return json({ id, starts_at: start, ...tempo }, 201);
}
