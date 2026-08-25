import { json, fail } from '../../_lib/game.js';
import { currentUser, verifyPin, validateEmail } from '../../_lib/auth.js';

/**
 * Správa NEPOVINNÉHO e-mailu pro obnovu PINu.
 *
 * PUT    /api/auth/email  { email, pin }  — nastaví nebo změní
 * DELETE /api/auth/email  { pin }         — smaže
 *
 * Obojí chce PIN, i když je hráč přihlášený: kdo se zmocní cizího zařízení
 * s platným tokenem, nesmí si na účet navěsit vlastní adresu a tím ho převzít.
 */
export async function onRequestPut({ request, env }) {
  const user = await currentUser(request, env);
  if (!user) return fail('nejsi přihlášený', 401);

  let body;
  try { body = await request.json(); } catch (e) { return fail('nečitelné tělo požadavku'); }

  const v = validateEmail(body.email);
  if (v.error) return fail(v.error);

  const plny = await env.DB.prepare('SELECT pin_hash FROM users WHERE id = ?').bind(user.id).first();
  if (!await verifyPin(String(body.pin || ''), plny.pin_hash)) return fail('PIN nesedí', 401);

  await env.DB.prepare('UPDATE users SET email = ? WHERE id = ?').bind(v.email, user.id).run();
  return json({ email: v.email });
}

export async function onRequestDelete({ request, env }) {
  const user = await currentUser(request, env);
  if (!user) return fail('nejsi přihlášený', 401);

  let body;
  try { body = await request.json(); } catch (e) { body = {}; }

  const plny = await env.DB.prepare('SELECT pin_hash FROM users WHERE id = ?').bind(user.id).first();
  if (!await verifyPin(String(body.pin || ''), plny.pin_hash)) return fail('PIN nesedí', 401);

  await env.DB.prepare('UPDATE users SET email = NULL WHERE id = ?').bind(user.id).run();
  return json({ email: null });
}
