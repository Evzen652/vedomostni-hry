-- Živý kvíz (2026-11-05): „hospodský kvíz" ve dvou pevných termínech týdně.
-- Rozhodnutí a jejich důvody: CLAUDE.md, zápis 2026-11-05. Logika: functions/_lib/kviz.js.
--
-- Schéma jen PŘIDÁVÁ (pravidlo návratu k původní verzi): nic nemaže ani nepřejmenovává.
-- Druhé spuštění skončí na „table already exists" — to znamená, že migrace už proběhla.
--
-- Lokálně:  npx wrangler d1 execute zemekviz --local  --file=migrations/2026-11-05-kviz.sql
-- Produkce: npx wrangler d1 execute zemekviz --remote --file=migrations/2026-11-05-kviz.sql

-- Jeden večer. Průběh je čistá funkce `starts_at` a čtyř délek (kviz.js → casy()),
-- takže se nikde neukládá „aktuální otázka". `konec_at` je odvozený, uložený kvůli dotazu.
CREATE TABLE kvizy (
  id           TEXT PRIMARY KEY,
  starts_at    INTEGER NOT NULL,
  konec_at     INTEGER NOT NULL,
  kol          INTEGER NOT NULL,
  na_kolo      INTEGER NOT NULL,
  limit_s      INTEGER NOT NULL,
  odhaleni_s   INTEGER NOT NULL,
  prestavka_s  INTEGER NOT NULL,
  question_ids TEXT NOT NULL,
  orders       TEXT NOT NULL,
  -- Sbírka do přestávek („pro dobrou věc"): JSON {nazev, text, url}, jinak NULL.
  charita      TEXT,
  created_at   INTEGER NOT NULL
);
CREATE INDEX idx_kvizy_konec ON kvizy(konec_at);

-- Kdo se do večera přihlásil. `score` a `spravne` se navyšují s každou odpovědí.
-- `zdroj` = odkud hráč přišel (`?zdroj=fb-streda` v odkazu z reklamy) — bez sledovacího pixelu.
CREATE TABLE kviz_hraci (
  kviz_id      TEXT NOT NULL,
  user_id      TEXT NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0,
  spravne      INTEGER NOT NULL DEFAULT 0,
  zdroj        TEXT,
  prihlasen_at INTEGER NOT NULL,
  PRIMARY KEY (kviz_id, user_id)
);
CREATE INDEX idx_kviz_hraci_score ON kviz_hraci(kviz_id, score);

-- Odpovědi. PK zaručuje jednu odpověď na otázku i při dvojkliku nebo opakování po výpadku sítě.
CREATE TABLE kviz_odpovedi (
  kviz_id  TEXT NOT NULL,
  user_id  TEXT NOT NULL,
  q_index  INTEGER NOT NULL,
  pick     INTEGER NOT NULL,
  ms       INTEGER NOT NULL,
  correct  INTEGER NOT NULL,
  points   INTEGER NOT NULL,
  PRIMARY KEY (kviz_id, user_id, q_index)
);
CREATE INDEX idx_kviz_odp_q ON kviz_odpovedi(kviz_id, q_index);

-- Otázka, která jednou padla v kvízu, se do dalšího nevrací (a později se uvolní do archivu).
CREATE TABLE kviz_pouzite (
  question_id TEXT PRIMARY KEY,
  kviz_id     TEXT NOT NULL,
  pouzito_at  INTEGER NOT NULL
);
