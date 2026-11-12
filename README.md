# Autohaus KMC Motors Köln: Website (live)

Veröffentlichte Fassung der Website auf GitHub Pages: https://lmcu-code.github.io/

**Bearbeiten:** im Website-Editor unter https://lmcu-code.github.io/editor/ (Anleitung im Quell-Repo: `docs/EDITOR.md`).
Der Editor liest die Daten aus diesem Repo und veröffentlicht jede Änderung als einen Commit auf `main`.

| Was | Wo |
|---|---|
| Daten (vom Editor gepflegt) | `konfiguration.json`, `cars.json`, `i18n/`, `medien.json` |
| Gebaute Seiten | `index.html`, `fahrzeug/`, `impressum.html`, `datenschutz.html`, `robots.txt` |
| Editor und Bau-Kern | `editor/`, `vorlagen/` |
| Stand der letzten Veröffentlichung | `version.json` |

Code (Vorlagen, Editor, CSS, JS) kommt aus dem Quell-Repo `lmcu-code/kmc-motors` (`node tools/live-bauen.mjs`).
Im Editor Veröffentlichtes holt `node tools/von-live-holen.mjs` dorthin zurück.
Entwurf, nicht für Suchmaschinen (`noindex`, `robots.txt`). Kein Token, kein Passwort in diesem Repo.
