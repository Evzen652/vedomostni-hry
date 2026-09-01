-- Limit na hádání friend_code + sloupce pro klouzavé okno pokusů.
--
-- Proč: kód pro přidání do přátel je podle schema.sql i functions/api/friends.js
-- JEDINÁ ochrana dětí před oslovením cizím člověkem, ale neměl žádný limit pokusů.
-- Prostor 31^6 = 887 503 681 chrání konkrétní účet, ne populaci — útočník nehledá
-- konkrétní dítě, stačí mu jakékoli, takže očekávaný počet pokusů je 31^6 / N.
-- Při tisícovce účtů je to ~900 tisíc požadavků, tedy hodiny běhu jednoho skriptu.
--
-- Nic nemaže a je idempotentní jen v tom smyslu, že druhé spuštění skončí chybou
-- „duplicate column name" — což je v pořádku, znamená to, že migrace už proběhla.
--
-- Lokálně:  npx wrangler d1 execute zemekviz --local  --file=migrations/2026-09-01-friend-limit.sql
-- Produkce: npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-01-friend-limit.sql

ALTER TABLE users ADD COLUMN friend_tries INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN friend_tries_at INTEGER NOT NULL DEFAULT 0;
