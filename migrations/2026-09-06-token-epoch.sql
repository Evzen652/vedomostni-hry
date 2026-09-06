-- Odvolatelné přihlášení. Token je bezstavový (podepsaný `uid.exp`), takže se do
-- 2026-09-06 nedal zneplatnit NIJAK: platil 90 dní a změna PINu na něj neměla vliv.
-- Kdo někomu jednou půjčil odemčený telefon nebo mu token unikl, neměl jak ho vypnout.
--
-- `token_epoch` je čítač v účtu, který se propisuje do tokenu. Když se změní (dnes
-- při obnově PINu), všechny starší tokeny přestanou platit. Výchozí 0 znamená, že
-- tokeny vydané PŘED touhle migrací platí dál — nikoho to neodhlásí.
--
-- Přírůstková migrace, žádný DROP ani DELETE.
--   npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-06-token-epoch.sql

ALTER TABLE users ADD COLUMN token_epoch INTEGER NOT NULL DEFAULT 0;
