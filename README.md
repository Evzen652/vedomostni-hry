# Vědomostní hry — kvíz

Kvízová hra (zeměpis). Samostatný projekt, oddělený od aplikace **Glóbus** (repo `Hricka`).

## Spuštění
```bash
npx http-server -p 8777 -c-1
# → http://localhost:8777/landing.html  (rozcestník)
# → http://localhost:8777/hra.html      (samotný kvíz)
```

## Struktura
- `landing.html` — rozcestník (Vědomostní hry)
- `hra.html`, `quiz.js`, `quiz.css` — kvíz
- `data/questions/{cc}.json` — otázky
- `data/fondy.json` — fondy otázek
- `data/cards/{cc}.json` — **kopie** kartové databáze z aplikace Glóbus (kvíz je jen čte).
  Kanonická verze karet žije v projektu Glóbus; sem se kopíruje ručně.
- `img/` — obrázky
- `assets/` — loga, fonty, dlaždice
- `scripts/` — import otázek/obrázků/audia, export balíčku
