-- Rate limit na registraci, zakládání her a turnajů.
--
-- Proč: žádný ze tří endpointů neměl žádné omezení počtu volání. Registrace jde
-- klíčovat jen IP adresou (v době volání ještě neexistuje účet, na který by šel
-- pověsit sloupec jako u friend_tries); hry a turnaje se počítají na existující
-- účet stejně jako friend_tries (migrace 2026-09-01-friend-limit.sql).
--
-- Nic nemaže a je idempotentní jen v tom smyslu, že druhé spuštění skončí chybou
-- „duplicate column name" / „table already exists" — což je v pořádku, znamená to,
-- že migrace už proběhla.
--
-- Lokálně:  npx wrangler d1 execute zemekviz --local  --file=migrations/2026-09-02-rate-limits.sql
-- Produkce: npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-02-rate-limits.sql

ALTER TABLE users ADD COLUMN game_tries INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN game_tries_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN tourney_tries INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN tourney_tries_at INTEGER NOT NULL DEFAULT 0;

CREATE TABLE reg_attempts (
  ip       TEXT PRIMARY KEY,
  tries    INTEGER NOT NULL DEFAULT 0,
  tries_at INTEGER NOT NULL DEFAULT 0
);
