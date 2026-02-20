# Network-Tools — Bug-Liste

> **Version:** 5.0.88 | **Stand:** 2026-02-17

Uebersicht aller bekannten und behobenen Bugs.

---

## Legende

| Status | Bedeutung |
|--------|-----------|
| OFFEN | Bug bestaetigt, noch nicht behoben |
| IN ARBEIT | Fix wird aktuell entwickelt |
| BEHOBEN | Fix veroeffentlicht (mit Version) |
| KEIN BUG | Erwartetes Verhalten / kein Fehler |

| Prioritaet | Bedeutung |
|------------|-----------|
| 1 - KRITISCH | App nicht nutzbar / Datenverlust |
| 2 - HOCH | Wichtige Funktion betroffen |
| 3 - MITTEL | Eingeschraenkte Funktion / Workaround vorhanden |
| 4 - NIEDRIG | Geringfuegige Einschraenkung / selten auftretend |
| 5 - KOSMETISCH | Optischer Fehler / kein funktionaler Einfluss |

---

## Bug-Liste

| # | Bug | Betroffenes Tool | Prioritaet | Status | Behoben in | Bemerkung |
|---|-----|-------------------|------------|--------|------------|-----------|
| 1 | Ping-Test blockiert IP-Adressen (z.B. 192.168.1.1) | Ping-Test | 2 - HOCH | BEHOBEN | v5.0.82 | Strenger Domain-Regex aus Security-Audit |
| 2 | iOS DE-Tastatur: kein Punkt fuer IP-Eingabe | IP-Rechner | 3 - MITTEL | BEHOBEN | v5.0.83 | inputmode="numeric" zeigte keinen Punkt |
| 3 | iOS DE-Tastatur: Komma statt Punkt bei inputmode="decimal" | IP-Rechner | 3 - MITTEL | BEHOBEN | v5.0.86 | beforeinput-Event fuer Komma-Ersetzung |
| 4 | Echte Hostnamen in lokalen Netzen werden nicht aufgeloest | Ping-Test | 4 - NIEDRIG | BEHOBEN | v5.0.87 | Drei-Stufen-Validierung + Reverse-DNS |
| 5 | Google laesst sich nicht aufloesen | SSL/TLS-Checker | 2 - HOCH | OFFEN | — | |
| 6 | Unschoener Umbruch bei Beispiel-Chips auf mobilen Geraeten (z.B. SSL-Zertifikat) | Alle Tools | 2 - HOCH | BEHOBEN | v5.0.88 | Gemeldet von Alex in v5.0.87, horizontal scroll auf Mobile |

---

*Letzte Aktualisierung: 2026-02-17 | v5.0.88*
