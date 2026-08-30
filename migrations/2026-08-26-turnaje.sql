-- Přírůstková migrace: turnaje (aréna). Přidává jen to nové, NIC nemaže.
--
-- Proč nestačí schema.sql: ten začíná seznamem DROP TABLE, takže by na běžící
-- databázi smazal účty, ratingy i rozehrané hry. Pro první naplnění prázdné databáze
-- je schema.sql správně; pro databázi, která už data má, je potřeba tenhle soubor.
--
-- Lokálně:   npx wrangler d1 execute zemekviz --local  --file=migrations/2026-08-26-turnaje.sql
-- Produkce:  npx wrangler d1 execute zemekviz --remote --file=migrations/2026-08-26-turnaje.sql
--
-- POŘADÍ NASAZENÍ: nejdřív tahle migrace, teprve pak `npm run deploy`. Nový kód je
-- se starým schématem zpětně kompatibilní, ale endpointy /api/tournament/* by bez
-- migrace vracely „no such table: tournaments".
--
-- Definice jsou doslovný opis ze schema.sql (řádky 122 a 173–207); když se tam něco
-- změní, musí se to promítnout i sem.

ALTER TABLE games ADD COLUMN tournament_id TEXT;   -- u režimu turnaj

-- Stav turnaje se NEUKLÁDÁ — počítá se z starts_at + duration_min (_lib/tournament.js).
-- Kola samotná jsou obyčejné hry (games.mode='turnaj'), nehodnocené v Glicku;
-- body se sčítají jen do tournament_players.
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
-- protože klíč jen podle user_id by hráči bránil čekat ve dvou frontách najednou.
CREATE TABLE tournament_queue (
  tournament_id TEXT NOT NULL,
  user_id       TEXT NOT NULL,
  joined_at     INTEGER NOT NULL,
  game_id       TEXT,
  PRIMARY KEY (tournament_id, user_id)
);
CREATE INDEX idx_tq_lookup ON tournament_queue(tournament_id, game_id);
