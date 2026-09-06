-- Serverové otázky: fond se dělí na veřejný (offline hra ho má v prohlížeči) a serverový
-- (nikdy neopustí databázi, takže jeho správné odpovědi nejde dohledat).
--
-- Přírůstková migrace, ŽÁDNÝ DROP ani DELETE — v produkci jsou reálné účty a hry.
-- Pořadí při nasazení: nejdřív tahle migrace, pak `npm run db:sync`, pak deploy.
--
--   npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-06-online-only.sql
--
-- Pozor na past z 2026-09-03: před `--remote` nastav CLOUDFLARE_ACCOUNT_ID, jinak
-- wrangler sáhne po cizím účtu a spadne na 7403.

ALTER TABLE questions ADD COLUMN online_only INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_questions_online ON questions(band, online_only);
