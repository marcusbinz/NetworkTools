// === Netzwerk-Wiki Tool ===

function init_netzwerk_wiki(container) {

    // --- Kategorien ---
    const CATEGORIES = {
        all:          { label: 'Alle',          color: 'var(--text-dim)' },
        osi:          { label: 'OSI-Modell',    color: 'var(--purple)' },
        protokolle:   { label: 'Protokolle',    color: 'var(--accent)' },
        kabel:        { label: 'Kabeltypen',    color: 'var(--orange)' },
        geraete:      { label: 'Geräte',        color: 'var(--green)' },
        adressierung: { label: 'Adressierung',  color: 'var(--red)' },
        sicherheit:   { label: 'Sicherheit',    color: '#2dd4bf' },
    };

    // --- Wiki-Daten ---
    const WIKI_DATA = [

        // ===== OSI-Modell (7) =====
        {
            id: 'osi-1', title: 'Schicht 1', subtitle: 'Bitübertragungsschicht (Physical Layer)',
            desc: 'Die unterste Schicht des OSI-Modells. Definiert elektrische, mechanische und funktionale Spezifikationen für die physische Verbindung. Hier werden Bits als elektrische Signale, Licht oder Funk übertragen. Beispiele: Ethernet-Kabel, Glasfaser, WLAN-Funkwellen, Hubs, Repeater.',
            cat: 'osi', tags: ['physical', 'bitübertragung', 'kabel', 'signal', 'hub', 'repeater'],
            layer: 1,
        },
        {
            id: 'osi-2', title: 'Schicht 2', subtitle: 'Sicherungsschicht (Data Link Layer)',
            desc: 'Stellt eine zuverlässige Übertragung zwischen direkt verbundenen Knoten sicher. Teilt Daten in Frames auf und verwendet MAC-Adressen zur Adressierung. Erkennt und korrigiert Übertragungsfehler der Schicht 1. Beispiele: Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11), Switches, Bridges.',
            cat: 'osi', tags: ['data link', 'sicherung', 'frame', 'mac', 'ethernet', 'switch', 'bridge'],
            layer: 2,
        },
        {
            id: 'osi-3', title: 'Schicht 3', subtitle: 'Vermittlungsschicht (Network Layer)',
            desc: 'Zuständig für die logische Adressierung (IP-Adressen) und das Routing von Paketen über Netzwerkgrenzen hinweg. Bestimmt den besten Pfad vom Sender zum Empfänger. Protokolle: IP, ICMP, OSPF, BGP. Geräte: Router.',
            cat: 'osi', tags: ['network', 'vermittlung', 'routing', 'ip', 'paket', 'router'],
            layer: 3,
        },
        {
            id: 'osi-4', title: 'Schicht 4', subtitle: 'Transportschicht (Transport Layer)',
            desc: 'Stellt die Ende-zu-Ende-Kommunikation zwischen Anwendungen sicher. Segmentiert Daten und sorgt je nach Protokoll für zuverlässige (TCP) oder schnelle (UDP) Übertragung. Verwendet Portnummern zur Zuordnung von Diensten. Flusskontrolle und Fehlerbehebung.',
            cat: 'osi', tags: ['transport', 'tcp', 'udp', 'port', 'segment', 'flusskontrolle'],
            layer: 4,
        },
        {
            id: 'osi-5', title: 'Schicht 5', subtitle: 'Sitzungsschicht (Session Layer)',
            desc: 'Verwaltet den Auf- und Abbau von Sitzungen (Sessions) zwischen Anwendungen. Synchronisiert den Datenaustausch und setzt Checkpoints für die Wiederaufnahme nach Unterbrechungen. Beispiele: NetBIOS, RPC, SMB-Sessions.',
            cat: 'osi', tags: ['session', 'sitzung', 'netbios', 'rpc', 'smb'],
            layer: 5,
        },
        {
            id: 'osi-6', title: 'Schicht 6', subtitle: 'Darstellungsschicht (Presentation Layer)',
            desc: 'Übersetzt Datenformate zwischen Anwendungs- und Netzwerkformat. Zuständig für Zeichenkodierung (ASCII, UTF-8), Datenkompression und Verschlüsselung/Entschlüsselung. Beispiele: SSL/TLS-Verschlüsselung, JPEG, MPEG, ASCII.',
            cat: 'osi', tags: ['presentation', 'darstellung', 'kodierung', 'verschlüsselung', 'ascii', 'utf-8', 'kompression'],
            layer: 6,
        },
        {
            id: 'osi-7', title: 'Schicht 7', subtitle: 'Anwendungsschicht (Application Layer)',
            desc: 'Die oberste Schicht, die dem Benutzer am nächsten ist. Stellt Netzwerkdienste direkt für Anwendungen bereit. Hier laufen Protokolle wie HTTP, FTP, SMTP, DNS und SSH. Ermöglicht Dateiübertragung, E-Mail, Web-Browsing und Verzeichnisdienste.',
            cat: 'osi', tags: ['application', 'anwendung', 'http', 'ftp', 'smtp', 'dns', 'ssh'],
            layer: 7,
        },

        // ===== Protokolle (22) =====
        {
            id: 'tcp', title: 'TCP', subtitle: 'Transmission Control Protocol',
            desc: 'Verbindungsorientiertes Transportprotokoll auf OSI-Schicht 4. Garantiert zuverlässige, geordnete Datenübertragung durch Bestätigungen (ACKs) und Neuübertragungen. Der Verbindungsaufbau erfolgt über den Three-Way-Handshake (SYN → SYN-ACK → ACK). Wird für HTTP, SSH, FTP und die meisten Anwendungsprotokolle verwendet.',
            cat: 'protokolle', tags: ['transport', 'layer4', 'schicht4', 'verbindungsorientiert', 'three-way-handshake', 'ack', 'syn'],
        },
        {
            id: 'udp', title: 'UDP', subtitle: 'User Datagram Protocol',
            desc: 'Verbindungsloses Transportprotokoll auf OSI-Schicht 4. Bietet keine Garantie für Zustellung, Reihenfolge oder Duplikatvermeidung — dafür minimalen Overhead und geringe Latenz. Ideal für Echtzeitanwendungen wie VoIP, Video-Streaming, Online-Gaming und DNS-Abfragen.',
            cat: 'protokolle', tags: ['transport', 'layer4', 'schicht4', 'verbindungslos', 'echtzeit', 'voip', 'streaming', 'datagram'],
        },
        {
            id: 'icmp', title: 'ICMP', subtitle: 'Internet Control Message Protocol',
            desc: 'Steuer- und Fehlermeldeprotokoll auf OSI-Schicht 3. Wird von Netzwerkgeräten genutzt, um Fehlermeldungen und Diagnoseinformationen zu senden. Bekannte Anwendungen: ping (Echo Request/Reply) und traceroute (Time Exceeded). Wird nicht für Nutzdaten, sondern für Netzwerkmanagement verwendet.',
            cat: 'protokolle', tags: ['layer3', 'schicht3', 'ping', 'traceroute', 'echo', 'fehler', 'diagnose'],
        },
        {
            id: 'arp', title: 'ARP', subtitle: 'Address Resolution Protocol',
            desc: 'Löst IP-Adressen in MAC-Adressen auf, damit Frames im lokalen Netzwerk korrekt zugestellt werden können. Arbeitet zwischen Schicht 2 und 3. Sendet einen Broadcast ("Wer hat IP x.x.x.x?") und erhält eine Unicast-Antwort mit der zugehörigen MAC-Adresse. ARP-Tabellen cachen bekannte Zuordnungen.',
            cat: 'protokolle', tags: ['layer2', 'schicht2', 'mac', 'broadcast', 'auflösung', 'arp-tabelle', 'cache'],
        },
        {
            id: 'http', title: 'HTTP', subtitle: 'Hypertext Transfer Protocol',
            desc: 'Anwendungsprotokoll auf Schicht 7 für die Übertragung von Webinhalten. Arbeitet nach dem Request-Response-Prinzip: Client sendet Anfrage (GET, POST, PUT, DELETE), Server antwortet mit Statuscode und Daten. Zustandslos — jede Anfrage ist unabhängig. HTTP/2 ermöglicht Multiplexing, HTTP/3 nutzt QUIC über UDP.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'web', 'request', 'response', 'get', 'post', 'rest', 'api'],
        },
        {
            id: 'https', title: 'HTTPS', subtitle: 'HTTP Secure (HTTP over TLS)',
            desc: 'Verschlüsselte Variante von HTTP über TLS (Transport Layer Security). Schützt Daten vor Abhören und Manipulation durch Ende-zu-Ende-Verschlüsselung. Authentifiziert den Server über digitale Zertifikate. Standard-Port 443. Seit 2018 von allen großen Browsern als Standard gefordert.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'tls', 'ssl', 'verschlüsselung', 'zertifikat', 'port443', 'sicher'],
        },
        {
            id: 'dns', title: 'DNS', subtitle: 'Domain Name System',
            desc: 'Übersetzt Domainnamen (z.B. example.com) in IP-Adressen. Hierarchisches, verteiltes System mit Root-Servern, TLD-Servern und autoritativen Nameservern. Record-Typen: A (IPv4), AAAA (IPv6), MX (Mail), CNAME (Alias), NS (Nameserver), TXT. Standard-Port: 53 (UDP/TCP).',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'namensauflösung', 'domain', 'nameserver', 'port53', 'a-record', 'mx'],
        },
        {
            id: 'dhcp', title: 'DHCP', subtitle: 'Dynamic Host Configuration Protocol',
            desc: 'Vergibt automatisch IP-Adressen und Netzwerkkonfiguration an Clients. Der Prozess: DISCOVER → OFFER → REQUEST → ACK (DORA). Verteilt neben der IP auch Subnetzmaske, Gateway und DNS-Server. Lease-Zeiten regeln, wie lange eine Adresse gültig ist. Ports: 67 (Server), 68 (Client).',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'adressvergabe', 'dora', 'lease', 'port67', 'port68', 'automatisch'],
        },
        {
            id: 'ftp', title: 'FTP', subtitle: 'File Transfer Protocol',
            desc: 'Dateiübertragungsprotokoll auf Schicht 7. Nutzt zwei Kanäle: Steuerkanal (Port 21) für Befehle und Datenkanal (Port 20 oder dynamisch) für Dateitransfer. Unterstützt aktiven und passiven Modus. Überträgt Daten unverschlüsselt — für sichere Transfers SFTP oder FTPS verwenden.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'datei', 'upload', 'download', 'port21', 'port20'],
        },
        {
            id: 'sftp', title: 'SFTP', subtitle: 'SSH File Transfer Protocol',
            desc: 'Sichere Dateiübertragung über SSH (Port 22). Verschlüsselt sowohl Befehle als auch Daten in einem einzigen Kanal. Nicht zu verwechseln mit FTPS (FTP über TLS). Bietet zusätzlich Dateiverwaltung (Umbenennen, Löschen, Berechtigungen). Standard für sichere Dateiübertragungen in der Praxis.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'ssh', 'datei', 'verschlüsselt', 'port22', 'sicher'],
        },
        {
            id: 'ssh', title: 'SSH', subtitle: 'Secure Shell',
            desc: 'Kryptographisches Netzwerkprotokoll für sichere Fernwartung über unsichere Netze. Ersetzt Telnet durch verschlüsselte Verbindungen. Ermöglicht Remote-Shell, Dateitransfer (SCP/SFTP), Port-Forwarding und Tunneling. Authentifizierung über Passwort oder Public-Key. Port 22.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'remote', 'verschlüsselung', 'terminal', 'port22', 'key', 'tunnel'],
        },
        {
            id: 'smtp', title: 'SMTP', subtitle: 'Simple Mail Transfer Protocol',
            desc: 'Protokoll zum Versenden von E-Mails zwischen Mailservern und vom Client zum Server. Arbeitet auf Port 25 (Server-zu-Server) bzw. Port 587 (Client-Submission mit STARTTLS). Nur für den Versand zuständig — Empfang erfolgt über POP3 oder IMAP.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'mail', 'email', 'port25', 'port587', 'versand'],
        },
        {
            id: 'pop3', title: 'POP3', subtitle: 'Post Office Protocol Version 3',
            desc: 'Protokoll zum Abrufen von E-Mails vom Mailserver. Lädt Nachrichten herunter und löscht sie standardmäßig vom Server. Einfach, aber nicht für Multi-Geräte-Zugriff geeignet. Port 110 (unverschlüsselt) bzw. Port 995 (POP3S über TLS). Wird zunehmend durch IMAP ersetzt.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'mail', 'email', 'port110', 'port995', 'abruf'],
        },
        {
            id: 'imap', title: 'IMAP', subtitle: 'Internet Message Access Protocol',
            desc: 'Protokoll zum Abrufen und Verwalten von E-Mails auf dem Server. Im Gegensatz zu POP3 bleiben Mails auf dem Server — ideal für Zugriff von mehreren Geräten. Unterstützt Ordner, Flags und serverseitige Suche. Port 143 (STARTTLS) bzw. Port 993 (IMAPS über TLS).',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'mail', 'email', 'port143', 'port993', 'synchronisation'],
        },
        {
            id: 'snmp', title: 'SNMP', subtitle: 'Simple Network Management Protocol',
            desc: 'Protokoll zur Überwachung und Verwaltung von Netzwerkgeräten. Agents auf Geräten (Router, Switches) liefern Daten an einen zentralen Manager. Verwendet OIDs (Object Identifiers) und MIBs (Management Information Bases). Version 3 bietet Authentifizierung und Verschlüsselung. Port 161/162.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'monitoring', 'management', 'port161', 'agent', 'mib', 'oid', 'trap'],
        },
        {
            id: 'ntp', title: 'NTP', subtitle: 'Network Time Protocol',
            desc: 'Synchronisiert Uhren von Computern über ein Netzwerk mit einer Genauigkeit im Millisekundenbereich. Hierarchische Architektur mit Stratum-Ebenen (Stratum 0 = Atomuhr, Stratum 1 = direkt angebunden). Essentiell für Logging, Zertifikate und verteilte Systeme. Port 123 (UDP).',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'zeit', 'uhr', 'synchronisation', 'port123', 'stratum'],
        },
        {
            id: 'bgp', title: 'BGP', subtitle: 'Border Gateway Protocol',
            desc: 'Das Routing-Protokoll des Internets. Verbindet autonome Systeme (AS) und bestimmt den besten Pfad für Daten zwischen Providern. Verwendet Path-Vector-Algorithmus mit Policy-basiertem Routing. Port 179 (TCP). BGP-Fehlkonfigurationen können zu großflächigen Internet-Ausfällen führen.',
            cat: 'protokolle', tags: ['layer3', 'schicht3', 'routing', 'internet', 'as', 'autonomous system', 'port179', 'provider'],
        },
        {
            id: 'ospf', title: 'OSPF', subtitle: 'Open Shortest Path First',
            desc: 'Link-State Routing-Protokoll für autonome Systeme (Interior Gateway Protocol). Berechnet kürzeste Pfade mit dem Dijkstra-Algorithmus. Unterstützt Bereichsaufteilung (Areas) für Skalierbarkeit. Konvergiert schneller als RIP. Verwendet IP-Protokoll 89 (direkt auf IP, kein TCP/UDP).',
            cat: 'protokolle', tags: ['layer3', 'schicht3', 'routing', 'dijkstra', 'link-state', 'igp', 'area'],
        },
        {
            id: 'sip', title: 'SIP', subtitle: 'Session Initiation Protocol',
            desc: 'Signalisierungsprotokoll für den Auf- und Abbau von Multimedia-Sitzungen (VoIP, Videokonferenzen). Textbasiert wie HTTP. Verhandelt Medienparameter über SDP (Session Description Protocol). Ports 5060 (unverschlüsselt) und 5061 (TLS). Standard für IP-Telefonie.',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'voip', 'telefonie', 'video', 'port5060', 'multimedia'],
        },
        {
            id: 'mqtt', title: 'MQTT', subtitle: 'Message Queuing Telemetry Transport',
            desc: 'Leichtgewichtiges Publish/Subscribe-Messaging-Protokoll für IoT und M2M-Kommunikation. Minimaler Overhead, ideal für Geräte mit begrenzten Ressourcen oder instabilen Verbindungen. Ein Broker vermittelt Nachrichten über Topics. Ports 1883 (unverschlüsselt) und 8883 (TLS).',
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'iot', 'publish', 'subscribe', 'broker', 'port1883', 'm2m'],
        },
        {
            id: 'tls', title: 'TLS / SSL', subtitle: 'Transport Layer Security',
            desc: 'Kryptographisches Protokoll zur Absicherung von Verbindungen. TLS 1.3 (aktuell) bietet Forward Secrecy und verkürzte Handshakes. Authentifiziert Server über X.509-Zertifikate. Verschlüsselt HTTP (→ HTTPS), SMTP, IMAP und viele weitere Protokolle. SSL ist veraltet und unsicher.',
            cat: 'protokolle', tags: ['verschlüsselung', 'zertifikat', 'handshake', 'x509', 'forward secrecy', 'sicherheit'],
        },
        {
            id: 'ipsec', title: 'IPsec', subtitle: 'Internet Protocol Security',
            desc: 'Protokollsuite zur Absicherung von IP-Kommunikation auf Schicht 3. Zwei Modi: Transportmodus (nur Payload verschlüsselt) und Tunnelmodus (gesamtes Paket verschlüsselt). Hauptkomponenten: AH (Authentifizierung), ESP (Verschlüsselung), IKE (Schlüsselaustausch). Basis für viele VPN-Lösungen.',
            cat: 'protokolle', tags: ['layer3', 'schicht3', 'vpn', 'verschlüsselung', 'tunnel', 'ah', 'esp', 'ike'],
        },

        // ===== Kabeltypen (14) =====
        {
            id: 'cat5', title: 'Cat 5', subtitle: 'Kategorie 5',
            desc: 'Älterer Ethernet-Standard mit Frequenzen bis 100 MHz. Unterstützt Fast Ethernet (100 Mbit/s) über 100 Meter. 4 verdrillte Adernpaare (Twisted Pair), meist ungeschirmt (UTP). Heute durch Cat 5e ersetzt — für Neuinstallationen nicht mehr empfohlen.',
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '100mbit', '100mhz', 'utp', 'fast ethernet'],
        },
        {
            id: 'cat5e', title: 'Cat 5e', subtitle: 'Kategorie 5 Enhanced',
            desc: 'Verbesserte Version von Cat 5 mit strengeren Spezifikationen gegen Übersprechen (Crosstalk). Unterstützt Gigabit Ethernet (1 Gbit/s) über 100 Meter bei 100 MHz. Weit verbreitet in bestehenden Installationen. Mindeststandard für Gigabit-Netzwerke.',
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '1gbit', '100mhz', 'gigabit', 'crosstalk'],
        },
        {
            id: 'cat6', title: 'Cat 6', subtitle: 'Kategorie 6',
            desc: 'Standard für Frequenzen bis 250 MHz. Unterstützt 1 Gbit/s über 100 Meter und 10 Gbit/s über kurze Distanzen (bis 55 Meter). Bessere Isolation durch Trennkreuz (Spline) zwischen den Adernpaaren. Gängige Wahl für Büro- und Heimnetzwerke.',
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '10gbit', '250mhz', 'spline', 'büro'],
        },
        {
            id: 'cat6a', title: 'Cat 6a', subtitle: 'Kategorie 6a — Augmented',
            desc: 'Erweiterter Cat-6-Standard mit Frequenzen bis 500 MHz und 10 Gbit/s über volle 100 Meter. Bessere Schirmung (typisch S/FTP) reduziert Alien Crosstalk. Standard für Neuinstallationen in Bürogebäuden und Rechenzentren. Rückwärtskompatibel mit Cat 5e und Cat 6.',
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '10gbit', '500mhz', 'augmented', 's/ftp', 'rechenzentrum'],
        },
        {
            id: 'cat7', title: 'Cat 7', subtitle: 'Kategorie 7',
            desc: 'Vollständig geschirmtes Kabel (S/FTP) mit Frequenzen bis 600 MHz. Unterstützt 10 Gbit/s über 100 Meter. Jedes Adernpaar einzeln geschirmt plus Gesamtschirmung. Verwendet GG45- oder TERA-Stecker (nicht RJ-45 kompatibel ohne Adapter). In der Praxis oft durch Cat 6a ersetzt.',
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '10gbit', '600mhz', 's/ftp', 'gg45', 'geschirmt'],
        },
        {
            id: 'cat8', title: 'Cat 8', subtitle: 'Kategorie 8',
            desc: 'Höchste Kupfer-Kategorie mit Frequenzen bis 2.000 MHz (2 GHz). Unterstützt 25 Gbit/s und 40 Gbit/s über kurze Distanzen (30 Meter). Konzipiert für Rechenzentren und Switch-zu-Switch-Verbindungen. Für typische LAN-Installationen überdimensioniert.',
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '40gbit', '25gbit', '2000mhz', '2ghz', 'rechenzentrum', 'datacenter'],
        },
        {
            id: 'om1', title: 'OM1', subtitle: 'Multimode Glasfaser 62,5/125 µm',
            desc: 'Älteste Multimode-Glasfaser mit großem Kern (62,5 µm). Unterstützt Gigabit Ethernet bis 275 Meter und Fast Ethernet bis 2 km. Orange Ummantelung. Für LED-basierte Sender ausgelegt. Für Neuinstallationen nicht mehr empfohlen — durch OM3/OM4 abgelöst.',
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', 'led', '62.5', 'orange'],
        },
        {
            id: 'om2', title: 'OM2', subtitle: 'Multimode Glasfaser 50/125 µm',
            desc: 'Multimode-Glasfaser mit 50 µm Kern. Unterstützt Gigabit Ethernet bis 550 Meter. Verbesserte Bandbreite gegenüber OM1 durch kleineren Kern. Orange Ummantelung. Wird in bestehenden Installationen noch angetroffen, für Neuinstallationen OM3 oder höher empfohlen.',
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', '50', 'orange'],
        },
        {
            id: 'om3', title: 'OM3', subtitle: 'Multimode Glasfaser (Laser-optimiert)',
            desc: 'Laser-optimierte Multimode-Glasfaser (50/125 µm). Unterstützt 10 Gbit/s bis 300 Meter und 40/100 Gbit/s über kurze Distanzen. Aqua-farbige Ummantelung. Für VCSEL-Laser (Vertical Cavity) optimiert. Gängiger Standard für Gebäude- und Campus-Verkabelung.',
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', 'laser', '10gbit', 'vcsel', 'aqua'],
        },
        {
            id: 'om4', title: 'OM4', subtitle: 'Multimode Glasfaser (Hochleistung)',
            desc: 'Hochleistungs-Multimode-Glasfaser für 10 Gbit/s bis 400 Meter und 100 Gbit/s bis 150 Meter. Aqua-farbige Ummantelung (wie OM3). Höhere modale Bandbreite als OM3. Empfohlen für Rechenzentren und Backbone-Verbindungen innerhalb von Gebäuden.',
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', '100gbit', 'rechenzentrum', 'aqua', 'backbone'],
        },
        {
            id: 'om5', title: 'OM5', subtitle: 'Multimode Breitband (Wideband)',
            desc: 'Neueste Multimode-Kategorie, optimiert für SWDM (Short Wavelength Division Multiplexing) mit mehreren Wellenlängen. Unterstützt 100 Gbit/s und mehr über weitere Distanzen. Limettengrüne Ummantelung. Rückwärtskompatibel mit OM3/OM4-Infrastruktur.',
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', 'swdm', 'breitband', 'limettengrün', 'wideband'],
        },
        {
            id: 'os1', title: 'OS1', subtitle: 'Singlemode Glasfaser (Indoor)',
            desc: 'Singlemode-Glasfaser mit 9/125 µm Kern für Innenbereich-Verkabelung. Unterstützt Entfernungen bis 10 km bei 1 Gbit/s und 10 Gbit/s. Gelbe Ummantelung. Geringe Dämpfung (max. 1,0 dB/km). Für Gebäude-Backbones und mittlere Distanzen.',
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'singlemode', 'indoor', '9/125', 'gelb', '10km'],
        },
        {
            id: 'os2', title: 'OS2', subtitle: 'Singlemode Glasfaser (Outdoor)',
            desc: 'Singlemode-Glasfaser für Außen- und Langstreckenverbindungen. Unterstützt Entfernungen bis 200 km mit geeigneten Transceivern. Extrem geringe Dämpfung (max. 0,4 dB/km). Gelbe Ummantelung. Standard für WAN-Verbindungen, Carrier-Netze und Telekommunikation.',
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'singlemode', 'outdoor', 'langstrecke', 'wan', 'gelb', '200km', 'carrier'],
        },
        {
            id: 'koaxial', title: 'Koaxial', subtitle: 'Koaxialkabel (RG-58, RG-6)',
            desc: 'Kabel mit einem zentralen Leiter, umgeben von Isolierung, Schirmung und Außenmantel. RG-58: dünn, 10Base2 (historisch). RG-6: Kabelfernsehen und Internet (DOCSIS). Gute Abschirmung gegen elektromagnetische Störungen. Im LAN durch Twisted Pair ersetzt, in der Breitband-Versorgung weiterhin im Einsatz.',
            cat: 'kabel', tags: ['kupfer', 'rg-58', 'rg-6', 'docsis', 'kabelfernsehen', 'breitband', '10base2', 'schirmung'],
        },

        // ===== Netzwerkgeräte (11) =====
        {
            id: 'switch', title: 'Switch', subtitle: 'Netzwerk-Switch (Layer 2)',
            desc: 'Verbindet mehrere Geräte in einem LAN und leitet Frames anhand der MAC-Adresse weiter (OSI-Schicht 2). Lernt MAC-Adressen über seine Ports und baut eine MAC-Adresstabelle (CAM Table) auf. Im Gegensatz zum Hub sendet er Frames nur an den Ziel-Port. Managed Switches unterstützen VLANs, QoS und Monitoring.',
            cat: 'geraete', tags: ['layer2', 'schicht2', 'lan', 'mac', 'forwarding', 'vlan', 'cam table', 'managed'],
        },
        {
            id: 'router', title: 'Router', subtitle: 'Netzwerk-Router (Layer 3)',
            desc: 'Verbindet verschiedene Netzwerke und leitet Pakete anhand von IP-Adressen weiter (OSI-Schicht 3). Trifft Routing-Entscheidungen basierend auf Routing-Tabellen (statisch oder dynamisch via OSPF, BGP). Trennt Broadcast-Domänen. Typisch: WAN-zu-LAN, Inter-VLAN-Routing, Internetzugang.',
            cat: 'geraete', tags: ['layer3', 'schicht3', 'routing', 'ip', 'wan', 'gateway', 'routing-tabelle'],
        },
        {
            id: 'hub', title: 'Hub', subtitle: 'Netzwerk-Hub (Layer 1)',
            desc: 'Einfachstes Netzwerkgerät — wiederholt eingehende Signale an alle Ports (OSI-Schicht 1). Keine Intelligenz: kein MAC-Learning, kein Filtern. Erzeugt Kollisionen bei gleichzeitigem Senden. Heute vollständig durch Switches ersetzt. Historisch relevant für 10Base-T Ethernet.',
            cat: 'geraete', tags: ['layer1', 'schicht1', 'broadcast', 'kollision', 'veraltet', '10base-t', 'repeater'],
        },
        {
            id: 'bridge', title: 'Bridge', subtitle: 'Netzwerk-Bridge (Layer 2)',
            desc: 'Verbindet zwei Netzwerksegmente auf Schicht 2 und filtert Traffic anhand von MAC-Adressen. Trennt Kollisionsdomänen, aber nicht Broadcast-Domänen. Vorläufer des Switches — ein Switch ist im Grunde eine Multiport-Bridge. Heute primär als Software-Bridge (z.B. in VMs) relevant.',
            cat: 'geraete', tags: ['layer2', 'schicht2', 'segment', 'mac', 'kollisionsdomäne', 'vm', 'software'],
        },
        {
            id: 'repeater', title: 'Repeater', subtitle: 'Signal-Repeater (Layer 1)',
            desc: 'Verstärkt und regeneriert Signale auf Schicht 1, um die maximale Kabellänge zu verlängern. Arbeitet rein auf physischer Ebene — keine Analyse der Daten. Moderne Varianten: WLAN-Repeater (verlängern WiFi-Reichweite), Glasfaser-Repeater (Langstrecke). Kann Signalqualität verbessern, aber auch Latenz einführen.',
            cat: 'geraete', tags: ['layer1', 'schicht1', 'signal', 'verstärker', 'reichweite', 'wlan-repeater'],
        },
        {
            id: 'firewall-geraet', title: 'Firewall', subtitle: 'Netzwerk-Firewall',
            desc: 'Kontrolliert den ein- und ausgehenden Netzwerkverkehr nach definierten Regeln. Typen: Paketfilter (Schicht 3/4), Stateful Inspection (verbindungsorientiert), Application Firewall/WAF (Schicht 7). Next-Gen Firewalls (NGFW) kombinieren IDS/IPS, Deep Packet Inspection und Application Awareness.',
            cat: 'geraete', tags: ['sicherheit', 'paketfilter', 'stateful', 'ngfw', 'waf', 'regeln', 'deep packet inspection'],
        },
        {
            id: 'access-point', title: 'Access Point', subtitle: 'WLAN Access Point (AP)',
            desc: 'Verbindet drahtlose Geräte mit einem kabelgebundenen Netzwerk. Arbeitet auf Schicht 1/2 und erzeugt ein BSS (Basic Service Set). Unterstützt Standards: 802.11a/b/g/n/ac/ax (Wi-Fi 6) und 802.11be (Wi-Fi 7). Mehrere APs bilden ein ESS für nahtloses Roaming. PoE-fähig (Power over Ethernet).',
            cat: 'geraete', tags: ['wlan', 'wifi', 'drahtlos', '802.11', 'bss', 'poe', 'roaming', 'wi-fi 6'],
        },
        {
            id: 'load-balancer', title: 'Load Balancer', subtitle: 'Lastverteiler',
            desc: 'Verteilt eingehenden Netzwerkverkehr auf mehrere Server, um Auslastung, Antwortzeit und Verfügbarkeit zu optimieren. Algorithmen: Round Robin, Least Connections, IP Hash, Weighted. Layer 4 (TCP/UDP) oder Layer 7 (HTTP/HTTPS). Ermöglicht Hochverfügbarkeit und horizontale Skalierung.',
            cat: 'geraete', tags: ['server', 'hochverfügbarkeit', 'skalierung', 'round robin', 'layer4', 'layer7', 'reverse proxy'],
        },
        {
            id: 'modem', title: 'Modem', subtitle: 'Modulator/Demodulator',
            desc: 'Wandelt digitale Signale in analoge um (Modulation) und umgekehrt (Demodulation). Ermöglicht Datenübertragung über Telefon-, Kabel- oder Glasfaserleitungen. DSL-Modem: ADSL/VDSL über Telefonleitung. Kabelmodem: DOCSIS über Koaxialkabel. Glasfasermodem (ONT): FTTH/GPON.',
            cat: 'geraete', tags: ['dsl', 'kabel', 'glasfaser', 'docsis', 'gpon', 'ont', 'ftth', 'analog', 'digital'],
        },
        {
            id: 'proxy', title: 'Proxy Server', subtitle: 'Stellvertreter-Server',
            desc: 'Vermittelt Anfragen zwischen Client und Zielserver. Forward Proxy: Client greift über Proxy auf das Internet zu (Caching, Filterung, Anonymität). Reverse Proxy: Schützt Backend-Server, terminiert TLS, verteilt Last. Transparente Proxys fangen Traffic ab, ohne dass der Client konfiguriert werden muss.',
            cat: 'geraete', tags: ['caching', 'filter', 'reverse proxy', 'forward proxy', 'transparent', 'tls termination'],
        },
        {
            id: 'gateway', title: 'Gateway', subtitle: 'Netzwerk-Gateway',
            desc: 'Verbindet Netzwerke mit unterschiedlichen Protokollen oder Architekturen. Kann auf allen OSI-Schichten arbeiten — übersetzt Datenformate und Protokolle. Beispiele: VoIP-Gateway (ISDN ↔ SIP), IoT-Gateway (Zigbee ↔ IP), E-Mail-Gateway (Spam-Filter). Im Heimnetz oft der Router als Default Gateway.',
            cat: 'geraete', tags: ['protokollwandler', 'voip', 'iot', 'default gateway', 'isdn', 'zigbee', 'übersetzer'],
        },

        // ===== Adressierung (12) =====
        {
            id: 'ipv4', title: 'IPv4', subtitle: 'Internet Protocol Version 4',
            desc: '32-Bit-Adressierung mit ca. 4,3 Milliarden möglichen Adressen. Darstellung in Dotted Decimal: vier Oktette von 0-255 (z.B. 192.168.1.1). Adressen sind weltweit nahezu erschöpft — NAT und IPv6 als Lösungen. Header: 20-60 Bytes mit TTL, Protokoll, Quell- und Zieladresse.',
            cat: 'adressierung', tags: ['ip', '32-bit', 'dotted decimal', 'oktett', 'header', 'ttl'],
        },
        {
            id: 'ipv6', title: 'IPv6', subtitle: 'Internet Protocol Version 6',
            desc: '128-Bit-Adressierung mit 3,4 × 10³⁸ möglichen Adressen. Darstellung in Hexadezimal mit Doppelpunkten (z.B. 2001:0db8::1). Vereinfachter Header, integrierte IPsec-Unterstützung, kein NAT nötig. Autokonfiguration via SLAAC (Stateless Address Autoconfiguration). Dual-Stack ermöglicht parallelen Betrieb mit IPv4.',
            cat: 'adressierung', tags: ['ip', '128-bit', 'hexadezimal', 'slaac', 'dual-stack', 'header'],
        },
        {
            id: 'mac-adresse', title: 'MAC-Adresse', subtitle: 'Media Access Control Address',
            desc: '48-Bit Hardware-Adresse, die jeder Netzwerkschnittstelle vom Hersteller zugewiesen wird. Darstellung: sechs Hexadezimal-Paare (z.B. AA:BB:CC:DD:EE:FF). Die ersten 3 Bytes identifizieren den Hersteller (OUI). Wird auf Schicht 2 für die lokale Zustellung von Frames verwendet. Kann per Software geändert werden (MAC Spoofing).',
            cat: 'adressierung', tags: ['layer2', 'schicht2', 'hardware', 'oui', 'hexadezimal', 'frame', '48-bit', 'spoofing'],
        },
        {
            id: 'subnetting', title: 'Subnetting', subtitle: 'Subnetze bilden',
            desc: 'Aufteilung eines IP-Netzwerks in kleinere, logische Teilnetze. Durch Verschieben der Subnetzmaske werden Netz- und Hostanteil angepasst. Vorteile: effizientere Adressnutzung, Broadcast-Reduktion, Sicherheitssegmentierung. Beispiel: /24 (256 Adressen) in vier /26-Subnetze (je 64 Adressen).',
            cat: 'adressierung', tags: ['subnetz', 'subnetzmaske', 'netzanteil', 'hostanteil', 'broadcast', 'segmentierung'],
        },
        {
            id: 'cidr', title: 'CIDR', subtitle: 'Classless Inter-Domain Routing',
            desc: 'Ablösung der starren IP-Klassen (A/B/C) durch flexible Subnetzmasken beliebiger Länge. Die CIDR-Notation /24 bedeutet: 24 Bits Netzanteil, 8 Bits Hostanteil. Ermöglicht effizientere IP-Adressverteilung und Routen-Aggregation (Supernetting). Eingeführt 1993 durch RFC 1518/1519.',
            cat: 'adressierung', tags: ['classless', 'prefix', 'supernetting', 'rfc1518', 'notation', 'klasse'],
        },
        {
            id: 'vlsm', title: 'VLSM', subtitle: 'Variable Length Subnet Masking',
            desc: 'Ermöglicht unterschiedlich große Subnetze innerhalb eines Netzwerks. Im Gegensatz zu klassischem Subnetting (gleiche Maskenlänge) kann VLSM z.B. /30 für Punkt-zu-Punkt-Links und /24 für LANs verwenden. Maximiert die Adresseffizienz. Voraussetzung: Routing-Protokoll muss VLSM unterstützen (OSPF, EIGRP).',
            cat: 'adressierung', tags: ['subnetz', 'variabel', 'maskenlänge', 'punkt-zu-punkt', 'effizienz', 'ospf'],
        },
        {
            id: 'nat', title: 'NAT', subtitle: 'Network Address Translation',
            desc: 'Übersetzt private IP-Adressen in öffentliche und umgekehrt. Ermöglicht vielen Geräten den Internetzugang über eine einzige öffentliche IP. Typen: Static NAT (1:1), Dynamic NAT (Pool), PAT/NAT Overload (viele:1 mit Ports). Verzögert die IPv4-Adresserschöpfung, bricht aber End-to-End-Prinzip.',
            cat: 'adressierung', tags: ['übersetzung', 'privat', 'öffentlich', 'overload', 'masquerading', 'internet'],
        },
        {
            id: 'pat', title: 'PAT', subtitle: 'Port Address Translation',
            desc: 'Spezialform von NAT, bei der mehrere private IP-Adressen auf eine einzige öffentliche IP abgebildet werden — unterschieden durch Portnummern. Auch bekannt als NAT Overload oder Masquerading. Standard in Heimroutern. Jede ausgehende Verbindung erhält einen eindeutigen Quellport.',
            cat: 'adressierung', tags: ['nat', 'port', 'overload', 'masquerading', 'heimrouter', 'quellport'],
        },
        {
            id: 'private-ip', title: 'Private IPs', subtitle: 'Private IP-Bereiche (RFC 1918)',
            desc: 'Drei reservierte Adressbereiche für interne Netzwerke: 10.0.0.0/8 (Klasse A, 16,7 Mio. Adressen), 172.16.0.0/12 (Klasse B, 1 Mio. Adressen), 192.168.0.0/16 (Klasse C, 65.536 Adressen). Nicht im Internet routbar — benötigen NAT für Internetzugang. Frei nutzbar ohne Registrierung.',
            cat: 'adressierung', tags: ['rfc1918', '10.0.0.0', '172.16.0.0', '192.168.0.0', 'intern', 'privat', 'klasse'],
        },
        {
            id: 'loopback', title: 'Loopback', subtitle: 'Loopback-Adresse (127.0.0.1)',
            desc: 'Spezielle Adresse, die immer auf den eigenen Host verweist. IPv4: 127.0.0.0/8 (meist 127.0.0.1), IPv6: ::1. Traffic verlässt nie die Netzwerkschnittstelle — wird intern verarbeitet. Dient zum Testen von Netzwerk-Software und lokalen Diensten. Auch als "localhost" bekannt.',
            cat: 'adressierung', tags: ['127.0.0.1', 'localhost', '::1', 'test', 'lokal', 'selbstreferenz'],
        },
        {
            id: 'link-local', title: 'Link-Local', subtitle: 'Automatische Adressierung',
            desc: 'Automatisch zugewiesene Adressen für die Kommunikation im lokalen Segment ohne DHCP. IPv4: 169.254.0.0/16 (APIPA — Automatic Private IP Addressing). IPv6: fe80::/10 (immer vorhanden). Nicht routbar — nur im direkten Link gültig. Wichtig für IPv6-Nachbarschaftserkennung (NDP).',
            cat: 'adressierung', tags: ['169.254', 'fe80', 'apipa', 'automatisch', 'ndp', 'lokal', 'dhcp'],
        },
        {
            id: 'cast-typen', title: 'Unicast / Multicast / Broadcast', subtitle: 'Adressierungsarten',
            desc: 'Unicast: Kommunikation von einem Sender zu einem Empfänger (1:1). Multicast: ein Sender an eine Gruppe von Empfängern (1:n, z.B. 224.0.0.0/4). Broadcast: ein Sender an alle im Netzwerk (1:alle, z.B. 255.255.255.255). IPv6 kennt kein Broadcast — stattdessen Anycast (nächster Empfänger einer Gruppe).',
            cat: 'adressierung', tags: ['unicast', 'multicast', 'broadcast', 'anycast', '224.0.0.0', '255.255.255.255', 'gruppe'],
        },

        // ===== Sicherheit (14) =====
        {
            id: 'firewall', title: 'Firewall', subtitle: 'Paketfilter und Zustandsüberwachung',
            desc: 'Sicherheitssystem, das Netzwerkverkehr anhand von Regeln erlaubt oder blockiert. Paketfilter: prüft IP/Port (Schicht 3/4). Stateful Firewall: verfolgt Verbindungszustände. Application Firewall: analysiert Inhalte (Schicht 7). Regelwerk: Whitelist (alles verboten außer erlaubtem) oder Blacklist-Ansatz.',
            cat: 'sicherheit', tags: ['paketfilter', 'stateful', 'regeln', 'whitelist', 'blacklist', 'acl', 'netzwerksicherheit'],
        },
        {
            id: 'vpn', title: 'VPN', subtitle: 'Virtual Private Network',
            desc: 'Verschlüsselter Tunnel über ein öffentliches Netzwerk (Internet), der zwei Endpunkte so verbindet, als wären sie im selben lokalen Netz. Typen: Site-to-Site (Standortvernetzung) und Remote Access (Fernzugriff). Protokolle: IPsec, OpenVPN, WireGuard, L2TP. Schützt vor Abhören und Manipulation.',
            cat: 'sicherheit', tags: ['tunnel', 'verschlüsselung', 'ipsec', 'openvpn', 'wireguard', 'remote access', 'site-to-site'],
        },
        {
            id: 'ids', title: 'IDS', subtitle: 'Intrusion Detection System',
            desc: 'Überwacht Netzwerkverkehr oder Systemaktivitäten auf verdächtige Muster und Angriffe. Erkennt Bedrohungen und generiert Alarme — greift aber nicht aktiv ein. Typen: NIDS (netzwerkbasiert) und HIDS (hostbasiert). Erkennung über Signaturen (bekannte Angriffe) oder Anomalien (ungewöhnliches Verhalten).',
            cat: 'sicherheit', tags: ['intrusion', 'erkennung', 'alarm', 'nids', 'hids', 'signatur', 'anomalie', 'überwachung'],
        },
        {
            id: 'ips', title: 'IPS', subtitle: 'Intrusion Prevention System',
            desc: 'Erweitert IDS um aktive Abwehrmaßnahmen: erkennt Angriffe und blockiert sie automatisch in Echtzeit. Sitzt inline im Netzwerkpfad (nicht nur passiv mitlesend). Kann verdächtige Pakete verwerfen, Verbindungen beenden oder Firewall-Regeln dynamisch anpassen. Risiko: False Positives können legitimen Traffic blockieren.',
            cat: 'sicherheit', tags: ['intrusion', 'prävention', 'inline', 'blockieren', 'echtzeit', 'false positive'],
        },
        {
            id: 'ssl-tls', title: 'SSL / TLS', subtitle: 'Transportverschlüsselung',
            desc: 'SSL (Secure Sockets Layer) ist der Vorläufer von TLS — heute veraltet und unsicher. TLS 1.2 und 1.3 sind die aktuellen Standards für verschlüsselte Kommunikation. Schützt Daten in Transit vor Abhören und Manipulation. Verwendet asymmetrische Kryptografie für Schlüsselaustausch und symmetrische für Daten.',
            cat: 'sicherheit', tags: ['verschlüsselung', 'tls', 'ssl', 'zertifikat', 'handshake', 'kryptografie', 'transport'],
        },
        {
            id: 'wpa2', title: 'WPA2', subtitle: 'Wi-Fi Protected Access 2',
            desc: 'Standard-Sicherheitsprotokoll für WLAN-Netzwerke seit 2004. Verwendet AES-CCMP-Verschlüsselung. Modi: Personal (Pre-Shared Key/Passwort) und Enterprise (802.1X/RADIUS). Schwachstelle: KRACK-Angriff (2017) auf den 4-Way-Handshake. Wird zunehmend durch WPA3 ergänzt.',
            cat: 'sicherheit', tags: ['wlan', 'wifi', 'aes', 'ccmp', 'psk', 'enterprise', 'krack', '802.11i'],
        },
        {
            id: 'wpa3', title: 'WPA3', subtitle: 'Wi-Fi Protected Access 3',
            desc: 'Nachfolger von WPA2 (seit 2018). Verwendet SAE (Simultaneous Authentication of Equals) statt PSK — schützt gegen Offline-Wörterbuch-Angriffe. 192-Bit-Sicherheitssuite im Enterprise-Modus. OWE (Opportunistic Wireless Encryption) verschlüsselt auch offene Netzwerke. Forward Secrecy garantiert.',
            cat: 'sicherheit', tags: ['wlan', 'wifi', 'sae', 'owe', 'forward secrecy', 'verschlüsselung', '192-bit'],
        },
        {
            id: '802.1x', title: '802.1X', subtitle: 'Port-basierte Netzwerkzugangskontrolle',
            desc: 'IEEE-Standard für die Authentifizierung an Netzwerkports (LAN und WLAN). Drei Rollen: Supplicant (Client), Authenticator (Switch/AP), Authentication Server (RADIUS). Port bleibt gesperrt, bis der Client sich erfolgreich authentifiziert. Unterstützt EAP-Methoden: EAP-TLS, PEAP, EAP-TTLS.',
            cat: 'sicherheit', tags: ['authentifizierung', 'port', 'radius', 'eap', 'supplicant', 'nac', 'zugangskontrolle'],
        },
        {
            id: 'radius', title: 'RADIUS', subtitle: 'Remote Authentication Dial-In User Service',
            desc: 'AAA-Protokoll (Authentication, Authorization, Accounting) für zentralisierte Zugangskontolle. Authentifiziert Benutzer gegenüber einer zentralen Datenbank. Wird von 802.1X, VPN-Gateways und WLAN-Controllern verwendet. Port 1812 (Auth) und 1813 (Accounting). Alternative: TACACS+ (Cisco, TCP-basiert).',
            cat: 'sicherheit', tags: ['aaa', 'authentifizierung', 'autorisierung', 'accounting', 'port1812', 'tacacs', 'zentral'],
        },
        {
            id: 'acl', title: 'ACL', subtitle: 'Access Control List',
            desc: 'Geordnete Liste von Regeln, die den Zugriff auf Netzwerkressourcen erlauben oder verweigern. Standard-ACL: filtert nur nach Quell-IP. Extended ACL: filtert nach Quell/Ziel-IP, Protokoll und Port. Werden auf Router- und Switch-Interfaces angewendet (inbound/outbound). Verarbeitung: First Match wins.',
            cat: 'sicherheit', tags: ['regel', 'filter', 'permit', 'deny', 'standard', 'extended', 'interface', 'first match'],
        },
        {
            id: 'dmz', title: 'DMZ', subtitle: 'Demilitarisierte Zone',
            desc: 'Separates Netzwerksegment zwischen internem LAN und Internet. Enthält öffentlich erreichbare Dienste (Webserver, Mailserver, DNS) und schützt gleichzeitig das interne Netz. Typisch: zwei Firewalls — eine zum Internet, eine zum LAN. Bei Kompromittierung eines DMZ-Servers bleibt das interne Netz geschützt.',
            cat: 'sicherheit', tags: ['netzwerksegment', 'webserver', 'mailserver', 'firewall', 'öffentlich', 'schutz'],
        },
        {
            id: 'zero-trust', title: 'Zero Trust', subtitle: 'Zero-Trust-Sicherheitsmodell',
            desc: 'Sicherheitskonzept: "Vertraue niemandem, verifiziere alles." Kein implizites Vertrauen basierend auf Netzwerkposition. Jeder Zugriff wird authentifiziert, autorisiert und verschlüsselt — egal ob intern oder extern. Prinzipien: Least Privilege, Mikrosegmentierung, kontinuierliche Überprüfung. Ersetzt klassische Perimeter-Sicherheit.',
            cat: 'sicherheit', tags: ['vertrauen', 'least privilege', 'mikrosegmentierung', 'perimeter', 'identität', 'modern'],
        },
        {
            id: 'pki', title: 'PKI', subtitle: 'Public Key Infrastructure',
            desc: 'Framework für die Verwaltung digitaler Zertifikate und asymmetrischer Schlüssel. Komponenten: Certificate Authority (CA), Registration Authority (RA), Zertifikatsspeicher, CRL/OCSP (Sperrlisten). Ermöglicht sichere Identifizierung und Verschlüsselung in TLS, E-Mail-Signierung (S/MIME), Code-Signierung und VPN.',
            cat: 'sicherheit', tags: ['zertifikat', 'ca', 'asymmetrisch', 'public key', 'private key', 'crl', 'ocsp', 'x509'],
        },
        {
            id: 'mfa', title: 'MFA', subtitle: 'Multi-Faktor-Authentifizierung',
            desc: 'Erfordert mindestens zwei verschiedene Authentifizierungsfaktoren: Wissen (Passwort, PIN), Besitz (Smartphone, Token, Smartcard) und/oder Inhärenz (Fingerabdruck, Gesicht). Schützt gegen gestohlene Passwörter. Methoden: TOTP (zeitbasierte Einmalcodes), FIDO2/WebAuthn (passwortlos), SMS (unsicher), Push-Benachrichtigungen.',
            cat: 'sicherheit', tags: ['authentifizierung', 'passwort', 'totp', 'fido2', 'webauthn', 'token', 'zwei-faktor', '2fa'],
        },
    ];

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card wiki-input-card">
            <label for="wiki-search">Suche (Begriff, Beschreibung oder Stichwort)</label>
            <div class="wiki-input-row">
                <input type="text" id="wiki-search"
                       placeholder="z.B. TCP, Switch, Subnetting..."
                       autocomplete="off" spellcheck="false">
            </div>
            <label class="wiki-cat-label">Kategorie</label>
            <div class="wiki-cat-chips" id="wiki-cat-chips">
                ${Object.entries(CATEGORIES).map(([key, cat]) =>
                    `<span class="chip wiki-cat-chip${key === 'all' ? ' active' : ''}" data-cat="${key}" data-color="${cat.color}">${cat.label}</span>`
                ).join('')}
            </div>
        </section>

        <section class="card wiki-result-card" id="wiki-result-card">
            <div class="wiki-result-header">
                <h3>Netzwerk-Wiki</h3>
                <span class="wiki-count" id="wiki-count">${WIKI_DATA.length} Einträge</span>
            </div>
            <div class="wiki-list" id="wiki-list"></div>
        </section>
    `;

    // --- DOM References ---
    const searchInput = document.getElementById('wiki-search');
    const catChips = document.querySelectorAll('.wiki-cat-chip');
    const wikiList = document.getElementById('wiki-list');
    const wikiCount = document.getElementById('wiki-count');

    let selectedCat = 'all';
    let expandedId = null;

    // --- Render ---
    function renderList() {
        const query = searchInput.value.trim().toLowerCase();

        const filtered = WIKI_DATA.filter(entry => {
            const matchesCat = selectedCat === 'all' || entry.cat === selectedCat;
            if (!matchesCat) return false;
            if (!query) return true;
            return (
                entry.title.toLowerCase().includes(query) ||
                entry.subtitle.toLowerCase().includes(query) ||
                entry.desc.toLowerCase().includes(query) ||
                entry.tags.some(tag => tag.toLowerCase().includes(query))
            );
        });

        wikiCount.textContent = `${filtered.length} Eintr${filtered.length !== 1 ? 'äge' : 'ag'}`;

        if (filtered.length === 0) {
            wikiList.innerHTML = `<div class="wiki-empty">Keine Einträge gefunden</div>`;
            return;
        }

        wikiList.innerHTML = filtered.map(entry => {
            const cat = CATEGORIES[entry.cat] || CATEGORIES.all;
            const isExpanded = expandedId === entry.id;

            // OSI entries get a special layer number
            const layerNum = entry.layer
                ? `<span class="wiki-layer-num">${entry.layer}</span>`
                : '';

            return `
                <div class="wiki-row${isExpanded ? ' expanded' : ''}" data-id="${entry.id}">
                    <div class="wiki-row-header">
                        ${layerNum}
                        <div class="wiki-title-block">
                            <span class="wiki-title">${entry.title}</span>
                            <span class="wiki-subtitle">${entry.subtitle}</span>
                        </div>
                        <span class="wiki-cat-badge" style="color:${cat.color}; background:${cat.color}15; border-color:${cat.color}40">${cat.label}</span>
                        <span class="wiki-expand-icon">▸</span>
                    </div>
                    <div class="wiki-detail">
                        <p>${entry.desc}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- Event Listeners ---

    // Category chips — always show category color, active = filled background
    function updateChipColors() {
        catChips.forEach(c => {
            const color = c.dataset.color;
            if (c.classList.contains('active')) {
                c.style.color = '#fff';
                c.style.borderColor = color;
                c.style.background = color;
            } else {
                c.style.color = color;
                c.style.borderColor = `${color}50`;
                c.style.background = `${color}10`;
            }
        });
    }

    catChips.forEach(chip => {
        chip.addEventListener('click', () => {
            catChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedCat = chip.dataset.cat;
            expandedId = null;
            updateChipColors();
            renderList();
        });
    });

    // Apply initial chip colors
    updateChipColors();

    // Search
    searchInput.addEventListener('input', () => {
        expandedId = null;
        renderList();
    });

    // Expand / collapse (event delegation)
    wikiList.addEventListener('click', (e) => {
        const row = e.target.closest('.wiki-row');
        if (!row) return;
        const id = row.dataset.id;
        expandedId = expandedId === id ? null : id;
        renderList();
    });

    // Initial render
    renderList();
}

function teardown_netzwerk_wiki() {
    // No cleanup needed (no timers, no fetch)
}
