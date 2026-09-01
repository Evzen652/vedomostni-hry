-- Čas odpovědi se počítá na serveru, ne podle toho, co pošle klient.
--
-- Proč: `game_answers.ms` se bralo doslova z těla požadavku a server neměl s čím ho
-- porovnat — nikde si nepamatoval, kdy otázku vydal. `ms: 0` proto vždycky dalo
-- maximum bodů a limit 10 s žil výhradně v prohlížeči. Kdokoli s curlem si tak mohl
-- nastavit rating, denní žebříček i turnajové pořadí. Navíc `q/[n].js` nehlídá pořadí,
-- takže šlo stáhnout všechny otázky naráz, v klidu je dohledat a pak poslat odpovědi.
--
-- Nová tabulka drží čas vydání každé otázky. Zapisuje se INSERT OR IGNORE, takže
-- opakované načtení stopky NERESETUJE — jinak by stačilo požádat o otázku znovu
-- těsně před odesláním odpovědi. Předstažení všech otázek se tím obrací proti
-- útočníkovi: než dojde na poslední, limit dávno vypršel a dostane nula bodů.
--
-- Bez rizika pro běžící data: přidává jen novou tabulku, nic nemaže a nemění.
-- Rozehrané hry, které vznikly před migrací, nemají u vydaných otázek záznam —
-- answer.js na to má větev (odpověď bez vydané otázky se odmítne 409), takže
-- se dohrají až po znovunačtení otázky. Při nula rozehraných hrách je to bez dopadu.
--
-- Lokálně:  npx wrangler d1 execute zemekviz --local  --file=migrations/2026-09-01-cas-na-serveru.sql
-- Produkce: npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-01-cas-na-serveru.sql

CREATE TABLE IF NOT EXISTS q_served (
  game_id   TEXT    NOT NULL,
  user_id   TEXT    NOT NULL,
  q_index   INTEGER NOT NULL,
  served_at INTEGER NOT NULL,
  PRIMARY KEY (game_id, user_id, q_index)
);
