# Vědomostní hry — kvíz

Kvízová hra (zeměpis). Samostatný projekt, oddělený od aplikace **Glóbus** (repo `Hricka`).

## Spuštění
```bash
npx http-server -p 8777 -c-1
# → http://localhost:8777/hra.html      (úvodní stránka i samotný kvíz)
```

## Struktura
- `hra.html`, `quiz.js`, `quiz.css` — kvíz; `hra.html` je teď úvodní/domovská stránka appky
- `landing.html` — starší rozcestník (Vědomostní hry); zatím nepoužitý, ale zachovaný pro pozdější využití
- `data/questions/{cc}.json` — otázky
- `data/fondy.json` — fondy otázek
- `data/cards/{cc}.json` — **kopie** kartové databáze z aplikace Glóbus (kvíz je jen čte).
  Kanonická verze karet žije v projektu Glóbus; sem se kopíruje ručně.
- `img/` — obrázky
- `assets/` — loga, fonty, dlaždice
- `scripts/` — import otázek/obrázků/audia, export balíčku, generátor ilustrací (`gen-illustrations.ps1`)

## Ilustrace
Jak se tvoří malované ilustrace (pollinations.ai, styl, časté pasti) je popsané v [CLAUDE.md](CLAUDE.md).
