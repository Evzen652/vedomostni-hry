-- Banka skutečných lidských odpovědí po otázkách — palivo pro „ghost" soupeře.
-- Viz schema.sql (tabulka replay_answers) a functions/_lib/bot.js (botPlay z ní přehrává).
-- Přírůstkové, žádný DROP — bezpečné na produkci s reálnými daty.
CREATE TABLE IF NOT EXISTS replay_answers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT    NOT NULL,
  band        TEXT    NOT NULL,
  correct     INTEGER NOT NULL,
  ms          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_replay_q ON replay_answers(question_id, band);
