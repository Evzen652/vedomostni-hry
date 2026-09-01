-- Jeden hráč na slot, vynucené databází.
--
-- Proč: game_players má PK (game_id, user_id), takže na `slot` žádná unikátnost nebyla.
-- join.js i bot.js dělaly „SELECT počet hráčů → INSERT slot 1" a mezi těmi dvěma kroky
-- je mezera: dva lidé s přeposlaným odkazem (nebo join současně s /bot) se vložili oba
-- jako slot 1. Souboj pro dva pak měl tři hráče a settle.js ho na `players.length !== 2`
-- tiše uzavřel BEZ ratingu a bez určení vítěze — hráči tedy odehráli partii pro nic.
--
-- Aplikační kontrola zůstává (kvůli srozumitelné hlášce), ale skutečný zámek je tenhle
-- index: souběžný druhý INSERT spadne a handler vrátí 409.
--
-- POZOR: když už v databázi nějaká hra dva stejné sloty má, `CREATE UNIQUE INDEX`
-- neprojde. Napřed je najdi a ulož rozhodnutí, koho smazat:
--   SELECT game_id, slot, COUNT(*) c FROM game_players GROUP BY game_id, slot HAVING c > 1;
--
-- Lokálně:  npx wrangler d1 execute zemekviz --local  --file=migrations/2026-09-01-slot-unique.sql
-- Produkce: npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-01-slot-unique.sql

CREATE UNIQUE INDEX IF NOT EXISTS idx_gp_slot ON game_players(game_id, slot);
