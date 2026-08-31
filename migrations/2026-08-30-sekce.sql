-- Sjednocení názvů sekcí v D1 — stejné mapování jako scripts/normalize-sections.js.
--
-- Proč: dlaždice témat v quiz.js se staví z pevného seznamu SECTION_ORDER. V datech
-- vzniklo 29 různých názvů sekcí a 536 otázek tak bylo přes výběr tématu nedosažitelných.
-- Soubory data/questions/*.json se sjednotily 2026-08-30; tahle migrace dělá totéž s D1,
-- aby online režim neukazoval sekce, které offline část už nenabízí.
--
-- Lokálně:  npx wrangler d1 execute zemekviz --local  --file=migrations/2026-08-30-sekce.sql
-- Produkce: npx wrangler d1 execute zemekviz --remote --file=migrations/2026-08-30-sekce.sql
--
-- Nic nemaže a je idempotentní: opakované spuštění už nic nenajde.

UPDATE questions SET section = 'Kultura & tradice' WHERE section = 'Kultura';
UPDATE questions SET section = 'Kultura & tradice' WHERE section = 'Svátky';
UPDATE questions SET section = 'Kultura & tradice' WHERE section = 'Svátky a tradice';
UPDATE questions SET section = 'Jazyk & slova' WHERE section = 'Jazyk';
UPDATE questions SET section = 'Místa' WHERE section = 'Města';
UPDATE questions SET section = 'Místa' WHERE section = 'Města a památky';
UPDATE questions SET section = 'Místa' WHERE section = 'Hlavní město';
UPDATE questions SET section = 'Místa' WHERE section = 'Památky';
UPDATE questions SET section = 'Místa' WHERE section = 'Zeměpis';
UPDATE questions SET section = 'Místa' WHERE section = 'Geografie';
UPDATE questions SET section = 'Příroda' WHERE section = 'Zvířata';
UPDATE questions SET section = 'Příroda' WHERE section = 'Příroda a zvířata';
UPDATE questions SET section = 'Zajímavosti' WHERE section = 'Politika';
UPDATE questions SET section = 'Zajímavosti' WHERE section = 'Ekonomika';
UPDATE questions SET section = 'Zajímavosti' WHERE section = 'Věda';
UPDATE questions SET section = 'Zajímavosti' WHERE section = 'Doprava';
UPDATE questions SET section = 'Zajímavosti' WHERE section = 'Život';
UPDATE questions SET section = 'Zajímavosti' WHERE section = 'Hry';
