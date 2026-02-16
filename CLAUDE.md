# Network-Tools — Projektanweisungen

## Projekt
- PWA fuer Netzwerk-Analyse, reines Vanilla JS (kein Framework)
- Autor: Dipl.-Ing. Marcus Binz, GitHub: marcusbinz
- Alle UI-Texte auf Deutsch

## Architektur
- Tool-Lifecycle: `init_[tool_id](container)` / `teardown_[tool_id]()`
- Tool-ID: kebab-case (`mx-lookup`), Funktionen: snake_case (`init_mx_lookup`)
- CSS-Klassen pro Tool mit eigenem Prefix (`.mx-`, `.ping-`, `.nr-` etc.)
- Lazy-Loading: JS/CSS wird erst beim Navigieren zum Tool geladen
- Router: Hash-basiert (`#tool-id`)

## Neue Tools anlegen
1. `js/[tool-id].js` erstellen (init_ + teardown_)
2. `css/[tool-id].css` erstellen (mit eigenem Prefix)
3. In `TOOLS[]` Array in `js/app.js` registrieren
4. In `ASSETS[]` Array in `sw.js` eintragen
5. Version bumpen: `version.json` (build + version) und `sw.js` (CACHE_NAME)

## Versionierung
- Schema: `MAJOR.MINOR.BUILD` (z.B. 3.0.69)
- Major steigt bei neuen Tools
- Immer `version.json` UND `sw.js` CACHE_NAME gemeinsam aktualisieren
- Datum in version.json auf aktuelles Datum setzen

## Dokumentation — WICHTIG
- Die Entwickler-Dokumentation liegt unter `docs/DEVELOPER.md`
- Nach jeder Aenderung am Projekt (neues Tool, neue Funktion, geaenderte API, geaenderte Architektur) MUSS `docs/DEVELOPER.md` aktualisiert werden
- Dazu gehoert: Tool-Referenz, API-Tabelle, Dateibaum, Versionsnummer, CSS-Prefixe
- Die Version und das Datum am Anfang und Ende der Doku aktualisieren

## Git-Workflow
- Commit-Messages auf Deutsch, kurz und beschreibend
- Immer mit `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
- Nur relevante Dateien stagen (kein `git add .`)
- Nur committen wenn der User es verlangt oder eine Aenderung abgeschlossen ist

## Code-Regeln
- Kein Framework, kein Build-Step, reines Vanilla JS
- AbortController fuer alle API-Calls, Cleanup in teardown_
- Variablen innerhalb der init_-Closure halten (keine globalen Variablen ausser AbortController mit _-Prefix)
- Monospace-Font fuer technische Werte: `'SF Mono', 'Fira Code', 'Consolas', monospace`
- Quick-Examples als Chips unter Eingabefeldern

## Externe APIs
- DNS: `dns.google/resolve`
- GeoIP: `ipapi.co/json`
- WHOIS: RDAP-Server + `rdap.org` + `api.codetabs.com` als Proxy
- Speed: `speed.cloudflare.com`
