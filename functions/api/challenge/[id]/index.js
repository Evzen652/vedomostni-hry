import { json, fail } from '../../../_lib/game.js';
import { currentUser } from '../../../_lib/auth.js';

/**
 * DELETE /api/challenge/:id — odmítni (když jsi vyzvaný) nebo zruš (když jsi vyzval).
 *
 * Obojí je tatáž operace: výzva zmizí. Smí ji udělat jen jeden z té dvojice — cizí
 * výzvu smazat nejde, a kdo o ní nemá vědět, dostane totéž co u neexistující (404),
 * aby se zkoušením id nedalo zjistit, kdo koho vyzval.
 */
export async function onRequestDelete({ params, request, env }) {
  const me = await currentUser(request, env);
  if (!me) return fail('nepřihlášen', 401);

  const r = await env.DB.prepare(
    'DELETE FROM challenges WHERE id = ? AND (from_user = ? OR to_user = ?)')
    .bind(params.id, me.id, me.id).run();

  if (!(r.meta && r.meta.changes)) return fail('výzva nenalezena', 404);
  return json({ smazano: true });
}
