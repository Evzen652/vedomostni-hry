/**
 * Výběr otázek pro hru (docs/online-rezim.md, sekce 4).
 *
 * V sólu stačí preferovat neviděné. V duelu je to tvrdší: pokud jeden hráč otázku
 * už viděl a druhý ne, zápas není fér. Pořadí zdrojů je proto:
 *
 *   1. neviděné ANI JEDNÍM   — férové i čerstvé, ideál
 *   2. viděné OBĚMA          — férové, jen ne čerstvé (výhodu mají oba stejně)
 *   3. viděné právě jedním   — nefér, proto se doplňuje SYMETRICKY: stejný počet
 *                              otázek zvýhodňujících prvního i druhého
 */

const rows = r => (r && r.results ? r.results.map(x => x.id) : []);
const marks = a => a.map(() => '?').join(',');

/** Neviděné nikým ze seznamu. */
async function unseenByAll(env, band, userIds, n) {
  if (!userIds.length) {
    return rows(await env.DB
      .prepare('SELECT id FROM questions WHERE band = ? ORDER BY RANDOM() LIMIT ?')
      .bind(band, n).all());
  }
  return rows(await env.DB.prepare(
    `SELECT id FROM questions
      WHERE band = ?
        AND id NOT IN (SELECT question_id FROM seen_questions WHERE user_id IN (${marks(userIds)}))
      ORDER BY RANDOM() LIMIT ?`).bind(band, ...userIds, n).all());
}

/** Viděné každým ze seznamu (tj. průnik viděných). */
async function seenByAll(env, band, userIds, n, exclude) {
  const ex = exclude.length ? ` AND q.id NOT IN (${marks(exclude)})` : '';
  return rows(await env.DB.prepare(
    `SELECT q.id FROM questions q
       JOIN seen_questions s ON s.question_id = q.id
      WHERE q.band = ? AND s.user_id IN (${marks(userIds)})${ex}
      GROUP BY q.id HAVING COUNT(DISTINCT s.user_id) = ?
      ORDER BY RANDOM() LIMIT ?`)
    .bind(band, ...userIds, ...exclude, userIds.length, n).all());
}

/** Viděné právě tímhle hráčem a nikým dalším ze seznamu. */
async function seenOnlyBy(env, band, userId, others, n, exclude) {
  const ex = exclude.length ? ` AND q.id NOT IN (${marks(exclude)})` : '';
  const notOthers = others.length
    ? ` AND q.id NOT IN (SELECT question_id FROM seen_questions WHERE user_id IN (${marks(others)}))`
    : '';
  return rows(await env.DB.prepare(
    `SELECT q.id FROM questions q
       JOIN seen_questions s ON s.question_id = q.id
      WHERE q.band = ? AND s.user_id = ?${notOthers}${ex}
      ORDER BY RANDOM() LIMIT ?`)
    .bind(band, userId, ...others, ...exclude, n).all());
}

/**
 * Vrátí n ID otázek pásma pro dané hráče (0 = anonym, 1 = sólo, 2 = duel).
 * Doplňuje se, dokud se nesejde n nebo nedojdou zdroje.
 */
export async function pickQuestions(env, band, n, userIds = []) {
  const picked = await unseenByAll(env, band, userIds, n);
  if (picked.length >= n || userIds.length === 0) return picked.slice(0, n);

  // 2) viděné všemi — výhoda je rozdělená rovnoměrně, takže fér
  if (picked.length < n) {
    const more = await seenByAll(env, band, userIds, n - picked.length, picked);
    picked.push(...more);
  }

  // 3) viděné právě jedním — jen symetricky, po stejném počtu za každého hráče
  if (picked.length < n && userIds.length > 1) {
    const need = n - picked.length;
    const per = Math.floor(need / userIds.length);
    if (per > 0) {
      for (const uid of userIds) {
        const others = userIds.filter(x => x !== uid);
        const more = await seenOnlyBy(env, band, uid, others, per, picked);
        picked.push(...more);
      }
    }
  }

  return picked.slice(0, n);
}

/** Zapíše, že hráč otázky viděl. Anonymní hra se neeviduje. */
export async function markSeen(env, userId, questionIds) {
  if (!userId || !questionIds.length) return;
  const now = Date.now();
  await env.DB.batch(questionIds.map(qid =>
    env.DB.prepare('INSERT OR IGNORE INTO seen_questions (user_id, question_id, seen_at) VALUES (?, ?, ?)')
      .bind(userId, qid, now)));
}
