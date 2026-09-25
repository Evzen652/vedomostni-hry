-- Výzvy podle přezdívky (nahrazují přátele s kódem).
--
-- Proč vlastní tabulka a ne nový stav ve `games`: nepřijatá výzva NESMÍ existovat jako
-- hra. Kdyby byla řádkem v `games`, potkala by ji každá cesta, která s hrami pracuje —
-- hlavně `expireStaleGames`, který po 48 h hru vyrovná. Přesně tak vzniká otevřený
-- nález z auditu u odvety: soupeři naskočí hodnocená prohra za partii, kterou nikdy
-- neviděl. Tady hra vznikne teprve PŘIJETÍM, takže tahle třída chyby je vyloučená
-- konstrukcí, ne podmínkou, na kterou by šlo zapomenout.
--
-- UNIQUE(from_user, to_user): jedna čekající výzva na dvojici. Bez toho by šlo
-- stejného člověka zasypat stovkou výzev.
--
-- Schéma jen přidává. Na konci je ale úklid dat zrušených přátel (viz komentář tam).
-- Druhé spuštění skončí na „table already exists" / „duplicate column name" — to
-- znamená, že migrace už proběhla.
--
-- Lokálně:  npx wrangler d1 execute zemekviz --local  --file=migrations/2026-09-26-vyzvy.sql
-- Produkce: npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-26-vyzvy.sql

CREATE TABLE challenges (
  id          TEXT PRIMARY KEY,
  from_user   TEXT NOT NULL,
  to_user     TEXT NOT NULL,
  band        TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  UNIQUE (from_user, to_user)
);
CREATE INDEX idx_challenges_to ON challenges(to_user, created_at);

ALTER TABLE users ADD COLUMN challenge_tries INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN challenge_tries_at INTEGER NOT NULL DEFAULT 0;

-- ÚKLID DAT ZRUŠENÉ FUNKCE — tohle jako jediné v souboru MĚNÍ existující řádky.
-- Přátelé s kódem zmizeli a zásady ochrany údajů (soukromi.html) kód ani seznam přátel
-- už nezmiňují. Kdyby tady zůstaly, zásady by mlčely o uloženém údaji — a jejich vlastní
-- pravidlo je, že každé tvrzení sedí na to, co appka opravdu drží. Nic jiného tyhle
-- sloupce nečte (friends.js je smazaný, registrace kód negeneruje), takže se nic nerozbije.
-- Tabulka `friends` i sloupec `friend_code` ZŮSTÁVAJÍ, jen prázdné — mazat schéma na
-- produkci kvůli úklidu nestojí za riziko.
UPDATE users SET friend_code = NULL WHERE friend_code IS NOT NULL;
DELETE FROM friends;
