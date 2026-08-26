-- Schéma D1 pro online režim. Viz docs/online-rezim.md.
-- Aplikace:  npm run db:init        (lokálně, smaže a postaví znovu)

-- POZOR: každá nová tabulka musí přibýt i sem. Když se na to zapomene, skript
-- spadne v půlce na „table X already exists" a databáze zůstane rozestavěná —
-- s částí tabulek starých a částí nových.
DROP TABLE IF EXISTS pin_resets;
DROP TABLE IF EXISTS game_answers;
DROP TABLE IF EXISTS game_players;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS seen_questions;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS queue;
DROP TABLE IF EXISTS tournament_queue;
DROP TABLE IF EXISTS tournament_players;
DROP TABLE IF EXISTS tournaments;
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
  -- Kód pro přidání do přátel. Přátelství jde navázat JEN přes něj, ne vyhledáním
  -- přezdívky — díky tomu nemůže cizí člověk oslovit dítě, aniž by mu ho někdo dal.
  friend_code  TEXT UNIQUE,
  -- Skutečná ochrana slabého PINu není hashování, ale omezení počtu pokusů.
  login_fails  INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  -- NEPOVINNÝ e-mail, jediné k čemu slouží je obnova zapomenutého PINu.
  -- Schválně BEZ UNIQUE: rodič musí smět mít stejný e-mail u víc dětí.
  -- U dětského pásma ho má vyplnit rodič (viz docs/online-rezim.md, sekce 5).
  email        TEXT
);

-- Přátelství je oboustranné: ukládají se oba směry, ať se dá číst jedním dotazem.
CREATE TABLE friends (
  user_id    TEXT NOT NULL,
  friend_id  TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, friend_id)
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
  daily_date   TEXT,                             -- u režimu daily
  tournament_id TEXT                             -- u režimu turnaj
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

-- Fronta na živý duel. Spárování zapíše oběma game_id, takže druhý hráč se to
-- dozví při dalším dotazu. Místo WebSocketu se dotazuje po dvou sekundách —
-- pro otázku s limitem 10–20 s je to k nerozeznání a nepotřebuje to Durable Objects.
CREATE TABLE queue (
  user_id      TEXT PRIMARY KEY,
  band         TEXT NOT NULL,
  time_control TEXT NOT NULL,
  rating       REAL NOT NULL,
  joined_at    INTEGER NOT NULL,
  game_id      TEXT
);
CREATE INDEX idx_queue_lookup ON queue(band, time_control, game_id);

-- Denní pětka: pro všechny na světě stejná, jeden pokus.
CREATE TABLE daily (
  date         TEXT NOT NULL,
  band         TEXT NOT NULL,
  question_ids TEXT NOT NULL,
  orders       TEXT NOT NULL,
  PRIMARY KEY (date, band)
);

-- ---------------------------------------------------------------- turnaje (aréna)
-- Časové okno, kdy hráči odehrají co nejvíc kol proti sobě (nebo botovi, když
-- zrovna nikdo nečeká) a body z jednotlivých her se sčítají do žebříčku turnaje.
-- Kola samotná jsou obyčejné hry (games.mode='turnaj', tournament_id vyplněný),
-- nehodnocené v Glicku — sčítají se jen sem (docs/online-rezim.md, sekce 9).
CREATE TABLE tournaments (
  id           TEXT PRIMARY KEY,
  band         TEXT NOT NULL,
  time_control TEXT NOT NULL,
  name         TEXT NOT NULL,
  starts_at    INTEGER NOT NULL,
  duration_min INTEGER NOT NULL,
  created_by   TEXT NOT NULL,
  created_at   INTEGER NOT NULL
);
CREATE INDEX idx_tournaments_band ON tournaments(band, starts_at);

CREATE TABLE tournament_players (
  tournament_id TEXT    NOT NULL,
  user_id       TEXT    NOT NULL,
  score         INTEGER NOT NULL DEFAULT 0,
  games_played  INTEGER NOT NULL DEFAULT 0,
  joined_at     INTEGER NOT NULL,
  PRIMARY KEY (tournament_id, user_id)
);
CREATE INDEX idx_tp_user ON tournament_players(user_id);

-- Fronta na spárování UVNITŘ jednoho turnaje. Samostatná od `queue` (živý duel),
-- protože klíč jen podle user_id by hráči bránil čekat ve dvou frontách najednou
-- (na ranked duel i na kolo turnaje).
CREATE TABLE tournament_queue (
  tournament_id TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  joined_at     INTEGER NOT NULL,
  game_id       TEXT,
  PRIMARY KEY (tournament_id, user_id)
);
CREATE INDEX idx_tq_lookup ON tournament_queue(tournament_id, game_id);

-- ---------------------------------------------------------------- obnova PINu
-- Token se ukládá jen jako otisk: kdo by se dostal k databázi, nesmí z ní
-- vyčíst platné odkazy na reset. Jednorázový a s krátkou platností.
CREATE TABLE pin_resets (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL,
  used_at    INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_pin_resets_user ON pin_resets(user_id, created_at);
