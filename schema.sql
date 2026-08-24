-- Schéma D1 pro online režim. Viz docs/online-rezim.md.
-- Aplikace:  npm run db:init        (lokálně)
--            npm run db:init:remote  (na Cloudflare)

DROP TABLE IF EXISTS game_answers;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS questions;

-- Otázky. Sloupec `answer` je jediné místo, kde správná odpověď žije,
-- a NIKDY neopouští server před odesláním tipu (viz sekce Anti-cheat).
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
CREATE INDEX idx_questions_band_cc ON questions(band, cc);

-- Hra = pevný seznam otázek včetně pořadí odpovědí, zafixovaný při založení.
-- Bez toho nejde férové porovnání ani rozbor „ty jsi klikl B, on A".
CREATE TABLE games (
  id           TEXT PRIMARY KEY,
  mode         TEXT NOT NULL,          -- solo | duel | daily
  band         TEXT NOT NULL,
  limit_s      INTEGER NOT NULL,
  question_ids TEXT NOT NULL,          -- JSON pole ID otázek
  orders       TEXT NOT NULL,          -- JSON: pro každou otázku pořadí zdrojů (0 = answer, 1..3 = distractor)
  created_at   INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE game_answers (
  game_id  TEXT    NOT NULL,
  q_index  INTEGER NOT NULL,
  pick     INTEGER NOT NULL,           -- index v zobrazeném pořadí, -1 = vypršel čas
  ms       INTEGER NOT NULL,
  correct  INTEGER NOT NULL,
  points   INTEGER NOT NULL,
  PRIMARY KEY (game_id, q_index)
);
