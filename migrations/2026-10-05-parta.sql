-- Turnaj pro partu (2026-10-05): zakladatel pozve kamarády odkazem, všichni hrají
-- STEJNÉ otázky online, každý kdy chce mezi `starts_at` a `ends_at`, a porovná se pořadí.
--
-- Pozvaní NEMUSÍ mít profil: napíšou jméno a hrají jako HOST. Host je řádek v `users`
-- s `is_guest = 1` — jen proto, aby celý herní stroj (měření času na serveru, odpovědi,
-- rozbor) fungoval beze změny. Host má technickou přezdívku `host-…`, nepoužitelný PIN,
-- žádný rating, a `currentUser()` ho bez výslovného povolení nepustí NIKAM kromě her
-- v turnaji party (viz `auth.js`). Zobrazované jméno žije v `party_players.name`.
--
-- Úklid: 30 dní po konci turnaje se smaže turnaj, jeho hry i hostovské účty
-- (`expireStaleGames` v settle.js). Zásady ochrany údajů to slibují.
--
-- Schéma jen přidává. Druhé spuštění skončí na „table already exists" /
-- „duplicate column name" — to znamená, že migrace už proběhla.
--
-- Lokálně:  npx wrangler d1 execute zemekviz --local  --file=migrations/2026-10-05-parta.sql
-- Produkce: npx wrangler d1 execute zemekviz --remote --file=migrations/2026-10-05-parta.sql

ALTER TABLE users ADD COLUMN is_guest INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN party_tries INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN party_tries_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE games ADD COLUMN party_id TEXT;

CREATE TABLE parties (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  owner_id     TEXT NOT NULL,
  band         TEXT NOT NULL,
  limit_s      INTEGER NOT NULL,
  question_ids TEXT NOT NULL,
  orders       TEXT NOT NULL,
  starts_at    INTEGER NOT NULL,
  ends_at      INTEGER NOT NULL,
  created_at   INTEGER NOT NULL
);
CREATE INDEX idx_parties_end ON parties(ends_at);

CREATE TABLE party_players (
  party_id   TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  name_lower TEXT NOT NULL,
  game_id    TEXT,
  joined_at  INTEGER NOT NULL,
  PRIMARY KEY (party_id, user_id),
  UNIQUE (party_id, name_lower)
);
