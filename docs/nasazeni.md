# Nasazení na produkci — postup a pasti

Krátký runbook. Všechno v něm je zaplacená zkušenost z předchozích nasazení, ne
teorie; podrobnosti u každého bodu jsou v CLAUDE.md pod odpovídajícím datem.

Produkce: **https://zemekviz.pages.dev**, projekt `zemekviz`, databáze D1 `zemekviz`,
účet `evzen.weigl@gmail.com` (`3005fa92056c05be6e87ea85a5df5ab9`).

---

## Pořadí je závazné: migrace → obsah → kód

Opačně to nejde. Nový kód umí pracovat se starým schématem jen výjimečně, kdežto
stará databáze s novým kódem spadne na „no such column".

### 1. Ověř, pod jakým účtem mluvíš

```
npx wrangler whoami
```

Když `wrangler d1 execute --remote` hlásí **„database could not be found [code: 7404]"**
nebo **7403**, není smazaná databáze — jen se sáhlo po cizím účtu. Řeší se proměnnou
prostředí pro ten jeden příkaz:

```
$env:CLOUDFLARE_ACCOUNT_ID='3005fa92056c05be6e87ea85a5df5ab9'
```

### 2. Migrace, jednu po druhé

Soubory v `migrations/` jsou **přírůstkové a bez `DROP`/`DELETE`**. Spouští se ručně
a jen ty, které na produkci ještě neproběhly:

```
npx wrangler d1 execute zemekviz --remote --file=migrations/2026-09-06-online-only.sql
```

- **NIKDY nepouštěj `npm run db:init:remote`.** Spouští `schema.sql`, který začíná
  `DROP TABLE` — na produkci s reálnými účty to smaže hráče, rating i rozehrané hry.
- Když migrace přes `--file` lokálně tiše selže (exit 255), zastav dev server: drží
  zámek nad lokální databází. Na produkci se to nestává.

### 3. Obsah otázek

```
npm run db:sync -- --remote
```

`ON CONFLICT(id) DO UPDATE`, tedy bez mazání: nová otázka se vloží, změněný text
přepíše, `rating` otázky zůstane (patří databázi, ne datům). Předtím se hodí
`npm run db:sync -- --check`, který vypíše, co má databáze navíc proti datům —
po přejmenování id tam jinak zůstane stará i nová verze a online losuje obě.

### 4. Nasazení kódu

```
npm run deploy
```

Skript nejdřív pustí `predeploy` (validace dat + offline testy + test fondu), pak
`build` a teprve pak nahrává. Dvě věci, na kterých to už jednou selhalo:

- **`--branch master` musí zůstat.** Bez něj Cloudflare nasadí NÁHLED: dostaneš
  adresu typu `nazev-vetve.zemekviz.pages.dev`, kdežto ostrá adresa dál servíruje
  starý kód. Vypadá to, že se nic nestalo.
- **Posuň `master` dřív, než nasadíš**, ať produkce neběží na kódu, který ve větvi
  není. Fast-forward: `git -C <repo> merge --ff-only <vetev>`.

### 5. Ověření na ostré adrese

Cache obejdi (`?cb=…`), jinak testuješ minulost — `.pages.dev` servíruje i soubory,
které už nasazení nemá.

**Kontrolovat OBSAH odpovědi, ne stavový kód.** Appka má SPA fallback, takže každá
neznámá cesta vrátí `index.html` s kódem **200** — `CLAUDE.md`, `schema.sql` i
`wrangler.toml` proto vypadají jako veřejně dostupné, i když v `dist/` vůbec nejsou.
Ověř to vymyšlenou cestou (`/tohle-neexistuje`): vrátí totéž.

Minimum, co po nasazení projít:
- rozcestník se vykreslí a dlaždice mají obrázky,
- „Světová liga" → přihlášení → „Hrát teď" → odehrát otázku,
- `/api/leaderboard` bez přihlášení vrací 401,
- konzole prohlížeče je čistá.

---

## Tajemství a proměnné

| Co | Kde | Bez toho |
|---|---|---|
| `SESSION_SECRET` | `wrangler pages secret put SESSION_SECRET` | appka odmítne podepsat token a registrace padá na 500 |
| `RESEND_API_KEY` + `MAIL_FROM` | totéž, až bude doména | obnova PINu se nedokončí — token se ani nevygeneruje |
| `ALLOW_DEV_SECRET` | **jen lokálně** v `.dev.vars` | na produkci nesmí být nikdy: vypíná limit registrací a povoluje veřejně známé podpisové tajemství |

---

## Když se to pokazí

- **Kód:** `npx wrangler pages deployment list --project-name zemekviz` ukáže historii;
  v Cloudflare panelu jde starší nasazení vrátit jedním kliknutím (Rollback).
- **Data:** D1 má Time Travel — obnovu do libovolného bodu za posledních 30 dní.
  Není to náhrada za zálohu obsahu: otázky žijí v repu, takže se dají nasypat znovu
  přes `db:sync`. Nenahraditelné jsou účty, rating a odehrané hry.
- **Migrace, která už proběhla,** se nedá spustit podruhé (`duplicate column name`).
  To je v pořádku — znamená to, že tam ta změna je.
