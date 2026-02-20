# Network-Tools — Entwickler-Dokumentation

> **Version:** 5.0.94 | **Build:** 94 | **Stand:** 2026-02-20
> **Autor:** Dipl.-Ing. Marcus Binz | **GitHub:** [marcusbinz/NetworkTools](https://github.com/marcusbinz/NetworkTools)

---

## 1. Projekt-Ueberblick

**Network-Tools** ist eine Progressive Web App (PWA) fuer Netzwerk-Analyse und IT-Werkzeuge. Die App laeuft komplett im Browser — kein Backend, kein Framework, reines Vanilla JavaScript.

| Eigenschaft | Wert |
|---|---|
| Technologie | HTML, CSS, Vanilla JavaScript |
| Framework | Keines (bewusste Entscheidung) |
| Typ | Progressive Web App (PWA) |
| Sprache (UI) | Deutsch |
| Hosting | Statisches Hosting (GitHub Pages o.Ae.) |
| Browser-Support | Moderne Browser (Chrome, Firefox, Safari, Edge) |
| Responsive | Mobile-first, Desktop ab 768px |

---

## 2. Projektstruktur

```
NetworkTools/
|-- index.html              # App Shell (Header, Content, Footer, Drawer, FAB)
|-- manifest.json            # PWA-Manifest (Name, Icons, Display-Modus)
|-- sw.js                    # Service Worker (Caching, Updates)
|-- version.json             # Versionierung { version, build, date }
|-- favicon.svg              # Favicon (SVG)
|-- icon-192.png             # App-Icon 192x192
|-- icon-512.png             # App-Icon 512x512
|-- .gitignore               # Git-Ignore (server.ps1)
|
|-- css/
|   |-- shared.css           # Globales Design-System (Variablen, Layout, Shared Components)
|   |-- ip-rechner.css       # Tool-spezifische Styles (.ip- Prefix)
|   |-- ipv6-rechner.css     # (.v6- Prefix)
|   |-- mx-lookup.css        # (.mx- Prefix)
|   |-- email-header.css     # (.eh- Prefix)
|   |-- dns-lookup.css       # (.dns- Prefix)
|   |-- ssl-tls-checker.css  # (.ssl- Prefix)
|   |-- whois-lookup.css     # (.whois- Prefix)
|   |-- port-referenz.css    # (.port- Prefix)
|   |-- blacklist-check.css  # (.bl- Prefix)
|   |-- passwort-gen.css     # (.pw- Prefix)
|   |-- mein-netzwerk.css    # (.net- Prefix)
|   |-- ping-test.css        # (.ping- Prefix)
|   |-- netzwerk-rechner.css # (.nr- Prefix)
|   |-- netzwerk-befehle.css # (.cmd- Prefix)
|   |-- qr-generator.css    # (.qr- Prefix)
|   |-- netzwerk-wiki.css   # (.wiki- Prefix)
|
|-- js/
|   |-- app.js               # Router, Theme, Drawer, Tool-Registry, Service Worker, escHtml()
|   |-- ip-rechner.js        # IPv4-Subnetz-Rechner
|   |-- ipv6-rechner.js      # IPv6-Rechner
|   |-- mx-lookup.js         # MX / SPF / DMARC / DKIM Lookup
|   |-- email-header.js      # E-Mail Header Analyzer
|   |-- dns-lookup.js        # DNS Lookup (alle Record-Typen)
|   |-- ssl-tls-checker.js   # SSL/TLS Zertifikat & HTTPS Check
|   |-- whois-lookup.js      # WHOIS / RDAP Abfrage
|   |-- port-referenz.js     # Port-Referenz Datenbank
|   |-- blacklist-check.js   # Blacklist / DNSBL Check
|   |-- passwort-gen.js      # Passwort-Generator
|   |-- mein-netzwerk.js     # Netzwerk-Info & Speed-Test
|   |-- ping-test.js         # Ping / Latenz-Test
|   |-- netzwerk-rechner.js  # Bandbreiten-Rechner
|   |-- netzwerk-befehle.js  # Netzwerk-Befehle Referenz
|   |-- qr-generator.js     # QR-Code Generator
|   |-- netzwerk-wiki.js    # Netzwerk-Wiki / Lexikon
|
|-- .claude/
|   |-- skills/
|       |-- frontend-design/
|           |-- SKILL.md     # Claude Code Frontend-Design Skill
```

---

## 3. Architektur

### 3.1 App Shell (index.html)

Die `index.html` definiert das Grundgeruest der App:

```
+---------------------------------------------+
|  Header (h1 + Subtitle + Theme-Toggle)      |
+---------------------------------------------+
|  <main id="content">                        |
|    (Tool-Inhalt wird dynamisch injiziert)   |
|                                              |
+---------------------------------------------+
|  Footer (Copyright, Impressum, Version)     |
+---------------------------------------------+
|  [FAB Button]  ->  Bottom-Drawer (Mobile)   |
+---------------------------------------------+
```

- **Header:** App-Titel, Tool-Subtitle, Theme-Toggle Button
- **Content:** Leerer `<main>` Container — wird vom Router befuellt
- **Footer:** Copyright, Install-Hinweis, Impressum & Datenschutz Links (mbinz.de), Versions-Anzeige
- **FAB:** Floating Action Button (Mobile), oeffnet den Drawer
- **Drawer:** Bottom-Sheet (Mobile) oder fixierte Sidebar (Desktop)
- **Update-Banner:** Zeigt "Update verfuegbar" wenn neuer Service Worker bereitsteht

### 3.2 Router (Hash-basiert)

Die Navigation erfolgt ueber URL-Hashes (`#tool-id`):

```
https://app.example.com/#mx-lookup
https://app.example.com/#ping-test
```

**Ablauf beim Navigieren (`navigateTo(toolId)`):**

1. `teardown_[vorheriges_tool]()` aufrufen (Cleanup)
2. URL-Hash setzen
3. `<main>` leeren, Subtitle aktualisieren
4. CSS lazy-laden (einmalig per `<link>`)
5. JS lazy-laden (einmalig per `<script>`)
6. `init_[neues_tool](container)` aufrufen
7. Drawer-Markierung aktualisieren

### 3.3 Tool-Registry (TOOLS-Array)

Alle Tools werden in `js/app.js` im `TOOLS`-Array registriert:

```javascript
const TOOLS = [
    {
        id: 'mx-lookup',           // URL-Hash, CSS/JS-Dateiname
        label: 'MX Lookup',        // Kurzname im Drawer
        subtitle: 'MX / SPF / DMARC / DKIM',  // Anzeige unter dem Titel
        icon: '<svg>...</svg>',    // SVG-Icon fuer den Drawer
        cssFile: 'css/mx-lookup.css',
        jsFile: 'js/mx-lookup.js',
    },
    // ...
];
```

**Reihenfolge im Array = Reihenfolge im Drawer.**

### 3.4 Tool-Lifecycle

Jedes Tool implementiert exakt zwei globale Funktionen:

```javascript
// Initialisierung — baut HTML, bindet Events
function init_tool_name(container) {
    container.innerHTML = `<section class="card">...</section>`;
    // Event-Listener, API-Calls, Logik...
}

// Aufraumen — stoppt Timer, Aborts, entfernt Listener
function teardown_tool_name() {
    if (_abortController) _abortController.abort();
    // Cleanup...
}
```

**Namenskonvention:** Die Tool-ID mit Bindestrichen (`mx-lookup`) wird in Funktionsnamen zu Unterstrichen (`init_mx_lookup`).

### 3.5 Theme-System

Zwei Themes werden ueber `data-theme` auf `<html>` gesteuert:

```javascript
setTheme('dark');  // oder 'light'
// Setzt: root.setAttribute('data-theme', theme)
// Speichert: localStorage.setItem('network-tools-theme', theme)
```

Standard-Theme: **Dark**

### 3.6 Desktop-Layout

Ab `768px` Viewport-Breite:
- **Drawer** wird zur permanenten **Sidebar** (220px, links fixiert)
- **FAB** und **Overlay** werden ausgeblendet
- **Content** bekommt `margin-left: 220px`
- **Result-Grids** wechseln von 2 auf 4 Spalten

---

## 4. CSS Design-System

### 4.1 CSS-Variablen (Dark Theme — Standard)

```css
:root, [data-theme="dark"] {
    --bg: #0f172a;              /* Seiten-Hintergrund */
    --card: #1e293b;            /* Karten-Hintergrund */
    --card-border: #334155;     /* Karten-Rahmen */
    --text: #e2e8f0;            /* Primaere Textfarbe */
    --text-dim: #94a3b8;        /* Sekundaere Textfarbe */
    --accent: #38bdf8;          /* Akzentfarbe (Sky Blue) */
    --accent-glow: rgba(56, 189, 248, 0.15);
    --green: #4ade80;           /* Erfolg / Positiv */
    --red: #f87171;             /* Fehler / Negativ */
    --orange: #fb923c;          /* Warnung */
    --purple: #a78bfa;          /* Sekundaerer Akzent */
    --radius: 12px;             /* Standard Border-Radius */
    --input-placeholder: #475569;
}
```

### 4.2 CSS-Variablen (Light Theme)

```css
[data-theme="light"] {
    --bg: #f1f5f9;
    --card: #ffffff;
    --card-border: #e2e8f0;
    --text: #1e293b;
    --text-dim: #64748b;
    --accent: #0284c7;
    --green: #16a34a;
    --red: #dc2626;
    --orange: #ea580c;
    --purple: #7c3aed;
    --input-placeholder: #94a3b8;
}
```

### 4.3 Shared Components

| Klasse | Verwendung |
|---|---|
| `.card` | Container mit Hintergrund, Border, Radius, Padding |
| `.result-grid` | 2-Spalten Grid (4 auf Desktop) fuer Ergebnis-Items |
| `.result-item` | Einzelnes Ergebnis (Label + Value) |
| `.result-label` | Uppercase Label (11px, dim) |
| `.result-value` | Monospace Wert (Accent-Farbe) |
| `.chip` | Klickbarer Tag/Button (Pill-Form) |
| `.drawer-item` | Navigation-Eintrag im Drawer/Sidebar |
| `.launcher-fab` | Floating Action Button (Mobile) |
| `.update-banner` | Update-Benachrichtigung am unteren Rand |

### 4.4 CSS-Prefix-Konvention

Jedes Tool verwendet einen eigenen CSS-Klassen-Prefix, um Konflikte zu vermeiden:

| Tool | Prefix | Beispiel |
|---|---|---|
| IP-Rechner | `.ip-` | `.ip-type-badge` |
| IPv6-Rechner | `.v6-` | `.v6-input-row` |
| MX Lookup | `.mx-` | `.mx-security-row` |
| E-Mail Header | `.eh-` | `.eh-textarea` |
| DNS Lookup | `.dns-` | `.dns-type-chips` |
| SSL/TLS | `.ssl-` | `.ssl-status-badge` |
| WHOIS | `.whois-` | `.whois-result-card` |
| Port-Referenz | `.port-` | `.port-table` |
| Blacklist | `.bl-` | `.bl-progress` |
| Passwort | `.pw-` | `.pw-strength` |
| Netzwerk | `.net-` | `.net-status-dot` |
| Ping | `.ping-` | `.ping-pkt-stats` |
| Rechner | `.nr-` | `.nr-result-section` |
| Befehle | `.cmd-` | `.cmd-card` |
| QR-Code | `.qr-` | `.qr-canvas-wrap` |
| Wiki | `.wiki-` | `.wiki-search` |

### 4.5 Animationen

```css
@keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

---

## 5. Tool-Referenz

### 5.1 IPv4-Rechner (`ip-rechner`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `ip-rechner` |
| **Dateien** | `js/ip-rechner.js`, `css/ip-rechner.css` |
| **API** | `ipapi.co/json` (GeoIP, eigene IP) |
| **Features** | Subnetz-Berechnung (CIDR /0–/32), Netzwerk-/Broadcast-Adresse, IP-Range, Anzahl Hosts, IP-Klasse, Private/Public Erkennung, GeoIP-Lookup, "Meine IP" Button, Quick-Examples |

### 5.2 IPv6-Rechner (`ipv6-rechner`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `ipv6-rechner` |
| **Dateien** | `js/ipv6-rechner.js`, `css/ipv6-rechner.css` |
| **API** | Keine (rein lokal) |
| **Features** | IPv6-Adress-Parsing, Prefix-Laengen (/32, /48, /64, /128), Voll-/Kurzform, Netzwerk-Adresse, Adresstyp-Erkennung (Global Unicast, Link-Local, Loopback, etc.), Quick-Examples |

### 5.3 MX Lookup (`mx-lookup`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `mx-lookup` |
| **Dateien** | `js/mx-lookup.js`, `css/mx-lookup.css` |
| **API** | `dns.google/resolve` (MX, TXT, A, AAAA Records) |
| **Features** | MX-Record Abfrage mit Prioritaet/TTL, IP-Aufloesung der MX-Server, **E-Mail-Sicherheits-Ampel** (SPF/DMARC/DKIM), Gesamtbewertungs-Banner mit Aktionsliste, farbige Status-Dots (gruen/gelb/rot), Beschreibungssaetze (Hints), **Konkrete Handlungsempfehlungen** bei nicht-gruenem Status, DKIM-Pruefung gegen 9 gaengige Selektoren, SPF/DMARC Raw-Record Anzeige, Quick-Examples |

**SPF-Bewertung:**
- `-all` (Hard Fail) = Gruen
- `~all` (Soft Fail) = Gruen (empfohlener Standard)
- `?all` (Neutral) = Gelb — Empfehlung: auf `~all` oder `-all` aendern
- `+all` (Pass All) = Rot (unsicher) — Empfehlung: `+all` durch `~all`/`-all` ersetzen
- Fehlt = Rot — Empfehlung: TXT-Record anlegen mit Provider-Beispielen

**DMARC-Bewertung:**
- `p=reject` = Gruen
- `p=quarantine` = Gruen
- `p=none` = Gelb — Empfehlung: auf `quarantine` oder `reject` aendern
- Unvollstaendig (keine Policy) = Gelb — Empfehlung: Policy ergaenzen
- Fehlt = Rot — Empfehlung: TXT-Record fuer `_dmarc.{domain}` anlegen (domain-spezifisch)

**DKIM-Bewertung:**
- Gefunden = Gruen
- Fehlt = Rot — Empfehlung: DKIM beim Provider aktivieren (Google Workspace, Microsoft 365)

**DKIM-Selektoren:** `default`, `google`, `selector1`, `selector2`, `k1`, `s1`, `s2`, `dkim`, `mail`

**Empfehlungs-System:**
Jede Evaluation-Funktion liefert ein optionales `recommendation`-Property. Bei nicht-gruenem Status wird unterhalb des Hint-Textes ein Empfehlungsblock mit Gluehbirne-Icon und accent-farbigem Border-Left angezeigt. Das Gesamtbewertungs-Banner zeigt zusaetzlich eine kompakte Aktionsliste (z.B. "-> SPF-Record anlegen", "-> DMARC-Policy verschaerfen"). Bei gruenem Status werden keine Empfehlungen angezeigt.

### 5.4 E-Mail Header Analyzer (`email-header`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `email-header` |
| **Dateien** | `js/email-header.js`, `css/email-header.css` |
| **API** | Keine (rein lokal) |
| **Features** | E-Mail Header parsen und visualisieren, Received-Hop-Kette, Zeitstempel-Analyse, Absender/Empfaenger, Auth-Ergebnisse (SPF/DKIM/DMARC), Beispiel-Header zum Testen |

### 5.5 DNS Lookup (`dns-lookup`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `dns-lookup` |
| **Dateien** | `js/dns-lookup.js`, `css/dns-lookup.css` |
| **API** | `dns.google/resolve` |
| **Features** | DNS-Abfrage fuer alle Record-Typen (A, AAAA, CNAME, MX, NS, TXT, SOA), "Alle" Modus fragt parallel ab, TTL-Anzeige, Record-Typ Chips, Quick-Examples |

### 5.6 SSL/TLS-Checker (`ssl-tls-checker`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `ssl-tls-checker` |
| **Dateien** | `js/ssl-tls-checker.js`, `css/ssl-tls-checker.css` |
| **API** | `crt.sh` (Certificate Transparency Logs, direkter Zugriff mit CORS), `fetch()` (HTTPS-Erreichbarkeitstest) |
| **Features** | SSL-Zertifikat-Pruefung via CT-Logs, Ablaufdatum mit Ampel-Bewertung (gruen/gelb/rot), Aussteller-Anzeige (CN/O geparst), HTTPS-Erreichbarkeitstest mit Antwortzeit, Verbleibende Tage als farbiger Badge, Handlungsempfehlungen bei Problemen, Zertifikats-History (letzte 5 aus CT-Logs), Quick-Examples |

**Zertifikats-Bewertung:**
- Gruen: Zertifikat gueltig, > 30 Tage verbleibend, HTTPS erreichbar
- Gelb: Zertifikat gueltig, aber < 30 Tage verbleibend (bald ablaufend) oder HTTPS nicht erreichbar
- Rot: Zertifikat abgelaufen — Empfehlung: Zertifikat erneuern

**Datenquellen:** crt.sh liefert Zertifikatsdaten (Aussteller, Gueltigkeit, Domain). crt.sh unterstuetzt CORS (`Access-Control-Allow-Origin: *`), daher direkter Zugriff ohne Proxy moeglich. Response wird als Text gelesen und vor dem JSON-Parsen validiert (muss mit `[` beginnen). HTTPS-Erreichbarkeit wird parallel via `fetch('https://domain', { mode: 'no-cors' })` geprueft.

### 5.7 WHOIS / RDAP (`whois-lookup`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `whois-lookup` |
| **Dateien** | `js/whois-lookup.js`, `css/whois-lookup.css` |
| **API** | RDAP-Server (20+ ccTLD-spezifische), `rdap.org`, `api.codetabs.com` (CORS-Proxy), `dns.google/resolve` |
| **Features** | RDAP/WHOIS Abfrage fuer Domains und IPs, 20+ laenderspezifische RDAP-Server (DE, AT, CH, UK, etc.), Fallback-Strategie (Direkt -> rdap.org -> CORS-Proxy), Registrar, Erstelldatum, Ablaufdatum, Nameserver, Status-Anzeige |

### 5.8 Port-Referenz (`port-referenz`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `port-referenz` |
| **Dateien** | `js/port-referenz.js`, `css/port-referenz.css` |
| **API** | Keine (statische Datenbank) |
| **Features** | Nachschlagewerk fuer Netzwerk-Ports, 50+ Ports mit Protokoll/Service/Beschreibung, Kategorien (Web, Mail, Remote, DNS, etc.), Suchfunktion, Kategorie-Filter |

### 5.9 Blacklist Check (`blacklist-check`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `blacklist-check` |
| **Dateien** | `js/blacklist-check.js`, `css/blacklist-check.css` |
| **API** | `dns.google/resolve` (DNSBL-Abfragen) |
| **Features** | Prueft IP-Adressen gegen 12 DNSBL-Listen (Spamhaus, Barracuda, SpamCop, etc.), Fortschrittsanzeige, Ergebnis pro Liste (gelistet/nicht gelistet), Zusammenfassung |

### 5.10 Passwort-Generator (`passwort-gen`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `passwort-gen` |
| **Dateien** | `js/passwort-gen.js`, `css/passwort-gen.css` |
| **API** | Keine (nutzt `crypto.getRandomValues()`) |
| **Features** | Zufallspasswort mit konfigurierbarer Laenge, Zeichensatz-Optionen (Gross/Klein/Zahlen/Sonder), Passphrase-Modus (Film-Zitate: James Bond, Star Wars, Herr der Ringe — DE + EN), Staerke-Anzeige, Entropie-Berechnung, Kopieren + Neugenerieren |

### 5.11 Mein Netzwerk (`mein-netzwerk`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `mein-netzwerk` |
| **Dateien** | `js/mein-netzwerk.js`, `css/mein-netzwerk.css` |
| **API** | `ipapi.co/json` (GeoIP), `speed.cloudflare.com` (Speed-Test) |
| **Features** | Verbindungsstatus (Online/Offline), Verbindungstyp (WiFi, 4G, etc.), Bandbreite/RTT via Network Information API, Oeffentliche IP + GeoIP (Land, Stadt, ISP), Download-/Upload-Speed-Test via Cloudflare, CDN-Latenz-Test zu mehreren Endpunkten |

### 5.12 Ping / Latenz-Test (`ping-test`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `ping-test` |
| **Dateien** | `js/ping-test.js`, `css/ping-test.css` |
| **API** | `fetch()` mit `mode: 'no-cors'` |
| **Features** | Browser-basierter Latenz-Test (kein echtes ICMP), Konfigurierbare Ping-Anzahl (5/10/20/50/Endlos), Live-Statistik (Min/Max/Avg/Jitter), Paket-Statistik (Gesendet/Empfangen/Verloren), Private IP-Erkennung (HTTP statt HTTPS fuer LAN), Info-Hinweis zur Browser-Limitation, Quick-Examples |

**Hinweis:** Browser koennen kein ICMP. Der Test misst die `fetch()`-Latenz. Fuer private IPs (10.x, 172.16-31.x, 192.168.x) wird HTTP verwendet (kein TLS-Overhead), fuer oeffentliche IPs HTTPS.

### 5.13 Bandbreiten-Rechner (`netzwerk-rechner`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `netzwerk-rechner` |
| **Dateien** | `js/netzwerk-rechner.js`, `css/netzwerk-rechner.css` |
| **API** | Keine (rein lokal) |
| **Features** | Bandbreiten-Umrechnung (Kbps/Mbps/Gbps <-> KB/MB/GB/TB), Transfer-Zeit Berechnung fuer Standard-Dateigroessen (100MB bis 1TB), Referenz-Tabelle gaengiger Bandbreiten (DSL 16 bis 10G Ethernet), Quick-Examples |

### 5.14 Netzwerk-Befehle (`netzwerk-befehle`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `netzwerk-befehle` |
| **Dateien** | `js/netzwerk-befehle.js`, `css/netzwerk-befehle.css` |
| **API** | Keine (statische Datenbank) |
| **Features** | 24 Netzwerk-Befehle mit Windows + Linux Syntax, Kategorien (Diagnose, Konfiguration, DNS, Routing, Transfer, Remote, Info), Suchfunktion, Copy-to-Clipboard, Beispiele und Parameter-Erklaerung |

### 5.15 QR-Code Generator (`qr-generator`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `qr-generator` |
| **Dateien** | `js/qr-generator.js`, `css/qr-generator.css` |
| **API** | Keine (eigener QR-Encoder) |
| **Features** | 4 Modi: URL, Text, WLAN, E-Mail, Eingebauter QR-Code Encoder (Reed-Solomon, GF(256), Versionen 1-40, ECC Level M), Canvas-Rendering (200/300/500px), Download als PNG, Kopieren in Zwischenablage, WLAN-Format: `WIFI:T:WPA;S:ssid;P:pass;;` |

### 5.16 Netzwerk-Wiki (`netzwerk-wiki`)

| Eigenschaft | Wert |
|---|---|
| **ID** | `netzwerk-wiki` |
| **Dateien** | `js/netzwerk-wiki.js`, `css/netzwerk-wiki.css` |
| **API** | Keine (statische Datenbank) |
| **Features** | Netzwerk-Lexikon mit 50+ Eintraegen, Kategorien (OSI-Modell, Protokolle, Kabeltypen, Geraete, Adressierung, Sicherheit, E-Mail), Volltext-Suche ueber Titel/Beschreibung/Tags, Accordion-Darstellung, OSI-Schicht Badges |

---

## 6. Externe APIs

| API | Endpunkt | Verwendet von | Zweck |
|---|---|---|---|
| Google DNS | `https://dns.google/resolve?name=X&type=Y` | MX Lookup, DNS Lookup, Blacklist, WHOIS | DNS-Abfragen aller Typen |
| ipapi.co | `https://ipapi.co/json/` | IP-Rechner, Mein Netzwerk | GeoIP / eigene IP ermitteln |
| RDAP | `https://rdap.org/domain/X` | WHOIS Lookup | WHOIS-Daten (gTLDs) |
| ccTLD RDAP | `https://rdap.denic.de/domain/X` (u.a.) | WHOIS Lookup | WHOIS fuer laenderspezifische TLDs |
| crt.sh | `https://crt.sh/?Identity=X&exclude=expired&output=json` | SSL/TLS-Checker | Certificate Transparency Logs (direkter CORS-Zugriff, Identity fuer exakte SAN/CN-Treffer) |
| CORS Proxy | `https://api.codetabs.com/v1/proxy/` | WHOIS Lookup | CORS-Umgehung fuer RDAP-Server |
| Cloudflare Speed | `https://speed.cloudflare.com/__down` / `__up` | Mein Netzwerk | Download-/Upload Speed-Test |

**Wichtig:** Alle API-Calls nutzen `AbortController` fuer sauberes Cleanup beim Tool-Wechsel.

---

## 7. Service Worker & Caching

### 7.1 Cache-Strategie

```
sw.js
|-- CACHE_NAME: 'network-tools-v{BUILD}'
|-- ASSETS: Array aller zu cachenden Dateien
|
|-- Install:  Alle Assets pre-cachen
|-- Activate: Alte Caches loeschen
|-- Fetch:
|   |-- version.json -> Network-first (Update-Erkennung)
|   |-- Alles andere -> Cache-first (Offline-Faehigkeit)
```

### 7.2 Update-Mechanismus

1. `app.js` prueft alle 60 Sekunden auf SW-Updates (`reg.update()`)
2. Neuer SW wird installiert und wartet (`installed` + `waiting`)
3. Update-Banner erscheint am unteren Bildschirmrand
4. User klickt "Jetzt aktualisieren"
5. `SKIP_WAITING` Message wird an SW gesendet
6. Seite wird neu geladen

### 7.3 Version-Check via version.json

```javascript
fetch('version.json?_cb=' + Date.now())  // Cache-Buster
    .then(r => r.json())
    .then(v => {
        // Build-Nummer mit localStorage vergleichen
        if (cachedBuild < v.build) showUpdateBanner();
    });
```

---

## 8. Versionierung

### 8.1 Schema

```
MAJOR.MINOR.BUILD
  |     |     |
  |     |     +-- Fortlaufend bei jeder Aenderung (68, 69, 70...)
  |     +-------- Immer 0 (reserviert)
  +-------------- Steigt bei neuen Tools (1.0 -> 2.0 -> 3.0)
```

**Beispiel:** `5.0.80` = 5. Major-Version, Build 80

### 8.2 Dateien aktualisieren

Bei jedem Release muessen **zwei Dateien** aktualisiert werden:

1. **`version.json`** — Version, Build, Datum:
```json
{
    "date": "2026-02-16",
    "build": 80,
    "version": "5.0.80"
}
```

2. **`sw.js`** — Cache-Name:
```javascript
const CACHE_NAME = 'network-tools-v80';
```

### 8.3 Git-Workflow

```bash
git add datei1 datei2 sw.js version.json
git commit -m "Aenderungsbeschreibung"
git push
```

---

## 9. Neues Tool hinzufuegen (Schritt-fuer-Schritt)

### Schritt 1: JavaScript erstellen

Datei: `js/mein-tool.js`

```javascript
// === Mein Tool ===

let _meinToolAbort = null;  // Optional: fuer API-Calls

function init_mein_tool(container) {
    // HTML Template
    container.innerHTML = `
        <section class="card mt-input-card">
            <label for="mt-input">Eingabe</label>
            <input type="text" id="mt-input" placeholder="...">
        </section>
        <section class="card" id="mt-result" style="display:none;">
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Ergebnis</span>
                    <span class="result-value" id="mt-value">—</span>
                </div>
            </div>
        </section>
    `;

    // DOM-Referenzen
    const input = document.getElementById('mt-input');

    // Event-Listener
    input.addEventListener('input', () => {
        // Logik...
    });
}

function teardown_mein_tool() {
    if (_meinToolAbort) {
        _meinToolAbort.abort();
        _meinToolAbort = null;
    }
}
```

### Schritt 2: CSS erstellen

Datei: `css/mein-tool.css`

```css
/* === Mein Tool Styles === */

.mt-input-card label { /* ... */ }
.mt-input-card input { /* ... */ }
/* Immer .mt- Prefix verwenden! */
```

### Schritt 3: In app.js registrieren

In `TOOLS`-Array einfuegen (Position = Reihenfolge im Drawer):

```javascript
{
    id: 'mein-tool',
    label: 'Mein Tool',
    subtitle: 'Beschreibung',
    icon: '<svg width="22" height="22" ...>...</svg>',
    cssFile: 'css/mein-tool.css',
    jsFile: 'js/mein-tool.js',
},
```

### Schritt 4: In sw.js eintragen

Im `ASSETS`-Array hinzufuegen:

```javascript
'./css/mein-tool.css',
'./js/mein-tool.js',
```

### Schritt 5: Version bumpen

- `version.json` — Build erhoehen, Datum aktualisieren
- `sw.js` — `CACHE_NAME` erhoehen
- Falls neues Tool: Major-Version erhoehen

### Schritt 6: Commit & Push

```bash
git add js/mein-tool.js css/mein-tool.css js/app.js sw.js version.json
git commit -m "Neues Tool: Mein Tool"
git push
```

---

## 10. Konventionen & Regeln

### Code-Stil

| Regel | Beispiel |
|---|---|
| Kein Framework | Reines Vanilla JS (kein React, Vue, etc.) |
| Closures | Alle Tool-Variablen innerhalb der `init_`-Funktion |
| Event-Delegation | Wo moeglich Event-Listener auf Container statt Einzel-Elemente |
| AbortController | Fuer jeden API-Call, Cleanup in `teardown_` |
| Template Literals | HTML wird als Template Literal in `container.innerHTML` gesetzt |
| Keine globalen Variablen | Ausnahme: AbortController und Interval-Referenzen mit `_`-Prefix |

### Namensgebung

| Typ | Schema | Beispiel |
|---|---|---|
| Tool-ID | Kebab-Case | `mx-lookup` |
| Init-Funktion | `init_` + Snake-Case | `init_mx_lookup()` |
| Teardown-Funktion | `teardown_` + Snake-Case | `teardown_mx_lookup()` |
| CSS-Prefix | Kurzform + `-` | `.mx-`, `.ping-`, `.nr-` |
| DOM-IDs | Tool-Prefix + Beschreibung | `mx-domain`, `ping-host` |
| Globale Variablen | `_` + camelCase | `_mxAbortController` |

### UI/UX

- Alle Texte auf **Deutsch**
- Monospace-Font fuer technische Werte: `'SF Mono', 'Fira Code', 'Consolas', monospace`
- Quick-Examples als Chips unter jedem Eingabefeld
- Loading-States mit Spinner-Animation
- Fehler in eigener Error-Card anzeigen
- Mobile-first Design, Desktop ab 768px

### Sicherheit

- **HTML-Escaping:** Alle API-Response-Daten und User-Inputs, die in `innerHTML` eingefuegt werden, muessen durch `escHtml()` escaped werden (definiert in `app.js`)
- **URL-Encoding:** Alle dynamischen Werte in `fetch()`-URLs muessen mit `encodeURIComponent()` encoded werden
- **Domain-Validierung:** Alle Domain-Eingabefelder validieren gegen `/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/`
- **JSON-Parsing:** `JSON.parse()` immer in `try/catch` wrappen
- **textContent vs innerHTML:** Fuer reine Text-Ausgabe immer `textContent` statt `innerHTML` verwenden

---

## 11. Security-Audit (v5.0.80 + v5.0.81)

### 11.1 Durchgefuehrter Audit

Am 2026-02-16 wurde ein vollstaendiger Security-Audit aller 17 JavaScript-Dateien durchgefuehrt. Geprueft wurden:

- **XSS (Cross-Site Scripting):** 80 innerHTML-Stellen analysiert, alle API-Daten-Flows getrackt
- **URL-Injection:** Alle fetch()-URLs auf fehlende Encoding geprueft
- **Input-Validierung:** Alle Benutzereingaben auf Sanitization geprueft
- **API-Sicherheit:** CORS, Proxy-Nutzung, MITM-Risiken bewertet
- **Service Worker:** Cache-Poisoning und Integritaet geprueft

### 11.2 Gefundene und behobene Schwachstellen

| # | Risiko | Datei | Problem | Fix |
|---|--------|-------|---------|-----|
| 1 | **HIGH** | `netzwerk-rechner.js` | User-Input direkt in innerHTML (Self-XSS) | `escHtml()` auf `fsLabel`/`bwLabel` |
| 2 | MEDIUM | `dns-lookup.js` | DNS TXT/MX Records unescaped in innerHTML | `escHtml()` auf `displayData` |
| 3 | MEDIUM | `whois-lookup.js` | RDAP-Felder unescaped + URLs ohne Encoding | `escHtml()` auf Felder + `encodeURIComponent()` auf 4 URLs |
| 4 | MEDIUM | `mx-lookup.js` | MX-Server + SPF/DMARC Records unescaped | `escHtml()` auf `mx.server`, `ips[]`, `result.record` |
| 5 | MEDIUM | `ssl-tls-checker.js` | Zertifikats-CN/Issuer unescaped + JSON.parse ohne try/catch | `escHtml()` auf Cert-Felder + try/catch um JSON.parse |
| 6 | MEDIUM | `mein-netzwerk.js` | Geo-API-Daten unescaped + URL ohne Encoding | `escHtml()` auf IP/Geo-Felder + `encodeURIComponent()` |
| 7 | MEDIUM | `blacklist-check.js` | DNSBL Return-Code unescaped | `escHtml()` auf `r.detail` |
| 8 | MEDIUM | `ip-rechner.js` | Geo-URL ohne Encoding | `encodeURIComponent()` auf IP in fetch-URL |
| 9 | LOW | Alle Domain-Tools | Schwache Domain-Validierung (nur dot + length) | Strenger Regex: nur `[a-z0-9.-]` erlaubt |

### 11.3 Globale Sicherheitsfunktion

In `app.js` wurde eine globale `escHtml(str)` Funktion hinzugefuegt, die alle HTML-Sonderzeichen escaped (`&`, `<`, `>`, `"`, `'`). Diese Funktion wird von allen Tools verwendet, die API-Daten oder User-Input in `innerHTML` einfuegen.

### 11.4 Positive Befunde (bereits sicher)

- `ip-rechner.js` — nutzt `textContent` fuer Geo-Daten (vorbildlich)
- Kein `eval()`, `document.write()` in der gesamten Codebase
- Alle externen APIs ueber HTTPS
- Hash-Routing gegen Tool-Whitelist validiert
- Error-Messages konsistent ueber `textContent` (nicht innerHTML)

### 11.5 Folge-Audit und Bereinigung (v5.0.81)

Nach dem initialen Audit wurde ein Verifikations-Audit durchgefuehrt. Dabei wurden 2 verbliebene LOW-Schwachstellen und 3 Code-Quality-Issues gefunden und behoben:

| # | Typ | Datei | Problem | Fix |
|---|-----|-------|---------|-----|
| 1 | LOW | `ssl-tls-checker.js` | CT-Log ID (`current.id`) unescaped in innerHTML | `escHtml(String(...))` |
| 2 | LOW | `ssl-tls-checker.js` | `cert.common_name` in Recommendation-Text fliesst unescaped in innerHTML | `escHtml()` |
| 3 | INFO | `email-header.js` | Redundante lokale `escapeHtml()` shadowed globale Funktion | Entfernt, nutzt jetzt globale `escHtml()` |
| 4 | INFO | `passwort-gen.js` | Redundante lokale `escapeHtml()` shadowed globale Funktion | Entfernt, nutzt jetzt globale `escHtml()` |
| 5 | INFO | `netzwerk-befehle.js` | Unvollstaendige lokale `escHtml()` (fehlte `"` und `'`) + `escAttr()` | Entfernt, nutzt jetzt globale `escHtml()` |
| 6 | INFO | `ip-rechner.js` | lat/lon in OpenStreetMap-URL ohne `encodeURIComponent()` | `encodeURIComponent()` hinzugefuegt |

**Ergebnis:** Alle Tools nutzen jetzt ausschliesslich die globale `escHtml()` aus `app.js`. Keine redundanten lokalen Escape-Funktionen mehr vorhanden.

### 11.6 Bugfix: Ping-Test IP-Adressen (v5.0.82)

Die in v5.0.80 eingefuehrte strenge Domain-Validierung im Ping-Test blockierte IP-Adressen (z.B. `192.168.1.1`), da der Regex `[a-z0-9]{2,}` fuer das letzte Segment einstellige Zahlen ablehnte. Fix: IP-Adressen werden jetzt separat erkannt und validiert, bevor die Domain-Regex-Pruefung greift.

**Betroffene Datei:** `ping-test.js`
**Andere Tools** (DNS, MX, SSL, WHOIS) sind korrekt — diese akzeptieren nur Domainnamen, keine IP-Adressen.

### 11.7 Bugfix: iOS DE-Tastatur Komma statt Punkt (v5.0.86)

Auf iOS mit deutscher Tastatur zeigt `inputmode="decimal"` ein Komma statt Punkt an. Das programmatische Ersetzen im `input`-Event funktioniert auf iOS Safari nicht, da Safari den Wert nach der Aenderung mit dem eigenen Tastatur-State ueberschreibt.

**Loesung:** Drei-Stufen-Ansatz:
1. **`beforeinput`-Event:** Komma wird abgefangen BEVOR es in das Input-Feld eingefuegt wird (`preventDefault()`). Stattdessen wird ein Punkt manuell an der Cursor-Position eingefuegt.
2. **`keyup`-Event (Fallback):** Fuer aeltere iOS-Versionen ohne `beforeinput`-Support wird nach dem Tastendruck das Komma nachtraeglich ersetzt.
3. **`input`-Event:** Normales Input-Handling (CIDR-Erkennung, Berechnung) in separater `handleIPInput()`-Funktion.

**Betroffene Datei:** `ip-rechner.js`

### 11.8 Feature: Ping-Test lokale Hostnamen + Reverse-DNS (v5.0.87)

Der Ping-Test akzeptiert jetzt neben Domains und IPs auch:
- **Lokale Hostnamen** ohne Punkt: `nas`, `printer`, `server1`, `my-pc`
- **Lokale FQDNs**: `server.local`, `nas.fritz.box`, `router.home.arpa`

**Drei-Stufen-Validierung:**
1. IPv4 (wie bisher, z.B. `192.168.1.1`)
2. Lokaler Hostname: `/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/`, max 63 Zeichen
3. Domain/FQDN: `/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/` (kein TLD-Zwang mehr)

**Lokale Host-Erkennung** (`isLocalTarget()`): Bare Hostnames und bekannte Suffixe (`.local`, `.lan`, `.fritz.box`, `.home.arpa`, etc.) werden als lokal erkannt und nutzen `http://` statt `https://`.

**Reverse-DNS (PTR):** Bei oeffentlichen IPs wird parallel zum Ping ein PTR-Lookup ueber `dns.google/resolve` ausgefuehrt. Das Ergebnis wird unter dem Hostnamen im Result-Header angezeigt. Fuer lokale IPs ist Reverse-DNS nicht moeglich (Browser-Einschraenkung).

**Betroffene Dateien:** `ping-test.js`, `ping-test.css`

### 11.9 Bugfix: Beispiel-Chips Umbruch auf mobilen Geraeten (v5.0.88)

Auf mittleren mobilen Bildschirmen brachen die Beispiel-Chips (Quick Examples) unschoen um, sodass einzelne Chips allein in einer neuen Zeile standen.

**Loesung:** Auf mobilen Geraeten (`< 768px`) scrollen die Chips horizontal statt umzubrechen (`flex-wrap: nowrap`, `overflow-x: auto`). Scrollbar ist unsichtbar fuer ein sauberes Design. Auf Desktop (`>= 768px`) bleibt `flex-wrap: wrap`.

**Betroffene Datei:** `ip-rechner.css` (`.quick-examples` Definition, global genutzt)

---

## 12. Externe Links im Drawer

Neben den 16 Tools gibt es externe Links im Drawer:

```javascript
const EXTERNAL_LINKS = [
    { label: 'MXToolbox', url: 'https://mxtoolbox.com/' },
    { label: 'Buy me a Coffee', url: 'https://buymeacoffee.com/marcusbinz' },
];
```

Diese werden mit `target="_blank"` und gestricheltem Border dargestellt (`.drawer-item-external`).

---

## 13. Lokale Entwicklung

### Dev-Server starten (PowerShell)

```powershell
# server.ps1 (in .gitignore)
python -m http.server 3000
```

Dann im Browser: `http://localhost:3000`

### Service Worker deaktivieren (zum Testen)

In Chrome DevTools:
1. Application -> Service Workers
2. "Bypass for network" aktivieren

Oder: Incognito-Modus verwenden

---

*Letzte Aktualisierung: 2026-02-20 | v5.0.94*
