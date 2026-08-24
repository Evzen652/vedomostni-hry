-- Schéma D1 pro online režim. Viz docs/online-rezim.md.
-- Aplikace:  npm run db:init        (lokálně, smaže a postaví znovu)

DROP TABLE IF EXISTS game_answers;
DROP TABLE IF EXISTS game_players;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS seen_questions;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS bots;
DROP TABLE IF EXISTS daily;
DROP TABLE IF EXISTS questions;

-- ---------------------------------------------------------------- otázky
-- Sloupec `answer` je jediné místo, kde správná odpověď žije, a NIKDY neopouští
-- server před odesláním tipu (docs/online-rezim.md, Anti-cheat).
CREATE TABLE questions (
  id           TEXT PRIMARY KEY,
  cc           TEXT NOT NULL,
  country      TEXT NOT NULL,
  band         TEXT NOT NULL,          -- deti | starsi | dospeli
  section      TEXT NOT NULL,
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  distractors  TEXT NOT NULL,          -- JSON pole tří řetězců
  quip_correct TEXT,
  quip_wrong   TEXT,
  explanation  TEXT,
  more_fact    TEXT,
  about        TEXT,
  -- Rating otázky se dopočítá z úspěšnosti hráčů; `difficulty` k tomu použít nejde,
  -- uvnitř pásma má nulový rozptyl. Do prvního sběru dat sedí na středu.
  rating       REAL    NOT NULL DEFAULT 1500,
  served       INTEGER NOT NULL DEFAULT 0,
  hit          INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_questions_band ON questions(band);

-- ---------------------------------------------------------------- hráči
-- Bez e-mailu: přezdívka + PIN. Dětské pásmo dostává generovanou přezdívku,
-- aby nešlo schovat vzkaz do jména a odpadla moderace.
CREATE TABLE users (
  id           TEXT PRIMARY KEY,
  nick         TEXT NOT NULL UNIQUE,
  nick_lower   TEXT NOT NULL UNIQUE,
  avatar       TEXT NOT NULL DEFAULT '1',
  pin_hash     TEXT NOT NULL,
  band         TEXT NOT NULL,
  is_bot       INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  -- Skutečná ochrana slabého PINu není hashování, ale omezení počtu pokusů.
  login_fails  INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0
);

-- Rating zvlášť za pásmo (různé fondy = neporovnatelné). Časová kontrola se nedělí.
CREATE TABLE ratings (
  user_id  TEXT NOT NULL,
  band     TEXT NOT NULL,
  rating   REAL NOT NULL DEFAULT 1500,
  rd       REAL NOT NULL DEFAULT 350,
  sigma    REAL NOT NULL DEFAULT 0.06,
  games    INTEGER NOT NULL DEFAULT 0,
  wins     INTEGER NOT NULL DEFAULT 0,
  draws    INTEGER NOT NULL DEFAULT 0,
  losses   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, band)
);

-- Boti mají řádek v users (is_bot=1) a navíc svou sílu.
CREATE TABLE bots (
  user_id  TEXT PRIMARY KEY,
  strength REAL NOT NULL          -- rating, na který se bot tváří; kalibruje se z výsledků
);

-- Co hráč viděl. Duel losuje z průniku neviděných obou hráčů (férovost, sekce 4).
CREATE TABLE seen_questions (
  user_id     TEXT NOT NULL,
  question_id TEXT NOT NULL,
  seen_at     INTEGER NOT NULL,
  PRIMARY KEY (user_id, question_id)
);

-- ---------------------------------------------------------------- hry
-- Hra = pevný seznam otázek včetně pořadí odpovědí, zafixovaný při založení.
-- Bez toho nejde férové porovnání ani rozbor „ty jsi klikl B, on A".
CREATE TABLE games (
  id           TEXT PRIMARY KEY,
  mode         TEXT NOT NULL,          -- solo | odkaz | duel | daily
  band         TEXT NOT NULL,
  limit_s      INTEGER NOT NULL,
  question_ids TEXT NOT NULL,          -- JSON pole ID otázek
  orders       TEXT NOT NULL,          -- JSON: pro každou otázku pořadí zdrojů (0 = answer)
  created_at   INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'open',   -- open | done
  rated        INTEGER NOT NULL DEFAULT 0,
  daily_date   TEXT                              -- u režimu daily
);

-- Jeden řádek na účastníka. Sólo hra má jednoho, souboj dva.
CREATE TABLE game_players (
  game_id     TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  slot        INTEGER NOT NULL,        -- 0 = zakladatel, 1 = vyzvaný
  score       INTEGER NOT NULL DEFAULT 0,
  answered    INTEGER NOT NULL DEFAULT 0,
  finished_at INTEGER,
  PRIMARY KEY (game_id, user_id)
);
CREATE INDEX idx_gp_user ON game_players(user_id);

CREATE TABLE game_answers (
  game_id  TEXT    NOT NULL,
  user_id  TEXT    NOT NULL,
  q_index  INTEGER NOT NULL,
  pick     INTEGER NOT NULL,           -- index v zobrazeném pořadí, -1 = vypršel čas
  ms       INTEGER NOT NULL,
  correct  INTEGER NOT NULL,
  points   INTEGER NOT NULL,
  PRIMARY KEY (game_id, user_id, q_index)
);

-- Denní pětka: pro všechny na světě stejná, jeden pokus.
CREATE TABLE daily (
  date         TEXT NOT NULL,
  band         TEXT NOT NULL,
  question_ids TEXT NOT NULL,
  orders       TEXT NOT NULL,
  PRIMARY KEY (date, band)
);
