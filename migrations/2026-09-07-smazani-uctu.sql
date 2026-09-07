-- Mazání profilu. Apple i Google to vyžadují u každé appky, která zakládá účty,
-- a v EU je to povinnost ze zákona; do 2026-09-07 appka žádnou takovou cestu neměla.
--
-- ZPŮSOB (rozhodnutí hráče 2026-09-07): odehrané hry ZŮSTÁVAJÍ, jen se odpojí od
-- identity. Účet se proto nemaže z tabulky — smazal by cizím hráčům jejich historii
-- a rozbil odkazy z `game_players` — ale PŘEPÍŠE se na náhrobek: jméno „Smazaný hráč",
-- žádný e-mail, žádný kód pro přátele, nepoužitelný PIN a zvýšená `token_epoch`,
-- takže všechna přihlášení okamžitě padnou.
--
-- Přírůstková migrace, žádný DROP ani DELETE.
--   npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-07-smazani-uctu.sql

ALTER TABLE users ADD COLUMN deleted_at INTEGER NOT NULL DEFAULT 0;
