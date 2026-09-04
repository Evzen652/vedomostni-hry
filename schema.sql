-- Schéma D1 pro online režim. Viz docs/online-rezim.md.
-- Aplikace:  npm run db:init        (lokálně, smaže a postaví znovu)

-- POZOR: každá nová tabulka musí přibýt i sem. Když se na to zapomene, skript
-- spadne v půlce na „table X already exists" a databáze zůstane rozestavěná —
-- s částí tabulek starých a částí nových.
DROP TABLE IF EXISTS reg_attempts;
DROP TABLE IF EXISTS pin_resets;
-- q_served a replay_answers sem přibyly 2026-09-04, o dost později než tabulky samy:
-- do té doby `db:init` nad existující databází spadl přesně tím způsobem, před kterým
-- varuje odstavec výš. Hlídá to `test:offline` (sekce „schema.sql").
DROP TABLE IF EXISTS q_served;
DROP TABLE IF EXISTS replay_answers;
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
  -- Obtížnost ★–★★★ ze zdrojových dat. Není to totéž co `band`: ten se z ní jen odvozuje
  -- (kids → deti, ≤2 → starsi, jinak dospeli), takže zpětně z pásma nejde zjistit —
  -- „starsi" míchá 1 a 2 dohromady. Online hra ji potřebuje na štítek u otázky.
  -- `kids` se neukládá, je to totéž co band='deti'.
  difficulty   INTEGER NOT NULL DEFAULT 1,
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
  -- Totéž pro hádání cizího friend_code. Kód je JEDINÁ ochrana dětí před oslovením
  -- cizím člověkem, ale prostor 31^6 nechrání sám o sobě: útočník nehledá konkrétní
  -- dítě, stačí mu JAKÉKOLI, takže očekávaný počet pokusů klesá s počtem účtů.
  -- Klouzavé okno (ne zámek jako u loginu — ten se při zamčení resetuje na nulu,
  -- takže útočníka nezpomalí víc než prvních 10 minut). (2026-09-01)
  friend_tries    INTEGER NOT NULL DEFAULT 0,
  friend_tries_at INTEGER NOT NULL DEFAULT 0,
  -- Klouzavé okno na zakládání her a turnajů (2026-09-02) — bez limitu šlo skriptem
  -- zaplavit tabulky games/tournaments donekonečna. Odděleně od friend_tries: založení
  -- hry není „neúspěch", počítá se KAŽDÝ pokus, ne jen ty co selžou.
  game_tries      INTEGER NOT NULL DEFAULT 0,
  game_tries_at   INTEGER NOT NULL DEFAULT 0,
  tourney_tries    INTEGER NOT NULL DEFAULT 0,
  tourney_tries_at INTEGER NOT NULL DEFAULT 0,
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
-- Jeden hráč na slot, vynucené databází. PK je (game_id, user_id), takže na slot
-- žádná unikátnost nebyla a `SELECT počet → INSERT` v join.js/bot.js měl mezi sebou
-- mezeru: dva lidé s přeposlaným odkazem (nebo join současně s /bot) se vložili oba
-- jako slot 1. Souboj pro dva pak měl tři hráče a settle.js ho na `players.length !== 2`
-- tiše uzavřel BEZ ratingu a bez určení vítěze. (2026-09-01)
CREATE UNIQUE INDEX idx_gp_slot ON game_players(game_id, slot);

-- Kdy server vydal kterou otázku. Bez tohohle byl ČAS ODPOVĚDI čistě klientský údaj:
-- `ms` se posílalo v těle požadavku a server neměl s čím ho porovnat, takže `ms: 0`
-- dalo vždycky maximum bodů a limit 10 s žil jen v prohlížeči. Rating, denní žebříček
-- i turnajové pořadí se tím daly nastavit curlem. (2026-09-01)
--
-- Zapisuje se `INSERT OR IGNORE`, takže opakované načtení otázky NERESETUJE stopky —
-- jinak by stačilo požádat o otázku znovu těsně před odesláním odpovědi.
-- Boti sem nezapisují: `botPlay` skládá řádky do game_answers napřímo, bez endpointu.
CREATE TABLE q_served (
  game_id   TEXT    NOT NULL,
  user_id   TEXT    NOT NULL,
  q_index   INTEGER NOT NULL,
  served_at INTEGER NOT NULL,
  PRIMARY KEY (game_id, user_id, q_index)
);

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

-- Banka SKUTEČNÝCH lidských odpovědí po otázkách — palivo pro „ghost" soupeře.
-- Soupeř v online hře nemusí být syntetický bot: `botPlay` z týhle banky přehraje
-- reálnou lidskou odpověď na tutéž otázku (její `correct` + `ms`), takže má lidské
-- načasování i chyby a nedá se prokouknout jako skript. Chybí-li otázka v bance,
-- spadne na pravděpodobnostní model bota (bot.js) — otázku po otázce.
--   * Plní se v `settleIfDone` z odpovědí LIDSKÝCH hráčů (daily/duel/odkaz). Boti ani
--     ghost sem nepřispívají (píšou pod účet s `is_bot=1`), takže žádná zpětná smyčka.
--   * Anonymní SCHVÁLNĚ: bez user_id a bez přezdívky. Nese jen chování (trefa + čas),
--     ne identitu — kvůli soukromí a aby to nebyla impersonace konkrétního účtu.
--   * `question_id` (ne q_index): q_index je pozice v `games.question_ids`, jiná hra od
--     hry; banka se klíčuje otázkou, aby šla dohledat napříč hrami.
CREATE TABLE replay_answers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT    NOT NULL,
  band        TEXT    NOT NULL,        -- filtr pásma: děti přehrávají jen z dětských her
  correct     INTEGER NOT NULL,
  ms          INTEGER NOT NULL
);
CREATE INDEX idx_replay_q ON replay_answers(question_id, band);

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

-- Klouzavé okno na registraci, klíčované IP adresou (2026-09-02) — v době založení
-- účet ještě neexistuje, takže limit nejde pověsit na `users` jako u friend_tries.
-- Bez tohohle šlo skriptem navyrábět libovolný počet účtů (sybil farming ratingu
-- i denního žebříčku). Klíč je syrová IP, ne hash — tabulka nedrží nic citlivějšího,
-- co by stálo za maskování, a hash by jen znemožnil ruční kontrolu při ladění.
CREATE TABLE reg_attempts (
  ip       TEXT PRIMARY KEY,
  tries    INTEGER NOT NULL DEFAULT 0,
  tries_at INTEGER NOT NULL DEFAULT 0
);

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
