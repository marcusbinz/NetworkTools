// === Netzwerk-Wiki Tool ===

function init_netzwerk_wiki(container) {

    // --- i18n ---
    I18N.register('wiki', {
        de: {
            searchLabel: 'Suche (Begriff, Beschreibung oder Stichwort)',
            searchPlaceholder: 'z.B. TCP, Switch, Subnetting...',
            catLabel: 'Kategorie',
            catAll: 'Alle',
            catOsi: 'OSI-Modell',
            catProto: 'Protokolle',
            catCable: 'Kabeltypen',
            catDevices: 'Geräte',
            catAddr: 'Adressierung',
            catSec: 'Sicherheit',
            catEmail: 'E-Mail',
            title: 'Netzwerk-Wiki',
            entries: '{n} Einträge',
            entry: '{n} Eintrag',
            noResults: 'Keine Einträge gefunden',
            selectEntry: 'Eintrag auswählen',
            tapZoom: 'Zoom durch Antippen',
            crossSection: 'Querschnitt',
        },
        en: {
            searchLabel: 'Search (term, description or keyword)',
            searchPlaceholder: 'e.g. TCP, Switch, Subnetting...',
            catLabel: 'Category',
            catAll: 'All',
            catOsi: 'OSI Model',
            catProto: 'Protocols',
            catCable: 'Cable Types',
            catDevices: 'Devices',
            catAddr: 'Addressing',
            catSec: 'Security',
            catEmail: 'Email',
            title: 'Network Wiki',
            entries: '{n} entries',
            entry: '{n} entry',
            noResults: 'No entries found',
            selectEntry: 'Select an entry',
            tapZoom: 'Tap to zoom',
            crossSection: 'Cross-section',
        },
    });
    const t = I18N.t;

    // Bilingual text helper — extracts current language from {de,en} objects
    const txt = (obj) => typeof obj === 'string' ? obj : (obj[I18N.getLang()] || obj.de);

    // --- Kategorien ---
    const CAT_KEYS = {
        all:          { tKey: 'wiki.catAll',     color: 'var(--text-dim)' },
        osi:          { tKey: 'wiki.catOsi',     color: 'var(--purple)' },
        protokolle:   { tKey: 'wiki.catProto',   color: 'var(--accent)' },
        kabel:        { tKey: 'wiki.catCable',   color: 'var(--orange)' },
        geraete:      { tKey: 'wiki.catDevices', color: 'var(--green)' },
        adressierung: { tKey: 'wiki.catAddr',    color: 'var(--red)' },
        sicherheit:   { tKey: 'wiki.catSec',     color: '#2dd4bf' },
        email:        { tKey: 'wiki.catEmail',   color: '#f472b6' },
    };

    // --- Wiki-Daten ---
    const WIKI_DATA = [

        // ===== OSI-Modell (8: Überblick + 7 Schichten) =====
        {
            id: 'osi-modell', title: 'OSI-Modell',
            subtitle: { de: 'Open Systems Interconnection Model', en: 'Open Systems Interconnection Model' },
            desc: {
                de: 'Referenzmodell der ISO (1984) zur Beschreibung von Netzwerkkommunikation in 7 Schichten. Jede Schicht hat eine klar definierte Aufgabe und kommuniziert nur mit der direkt darüber- und darunterliegenden. Von unten nach oben: Physical → Data Link → Network → Transport → Session → Presentation → Application. In der Praxis wird oft das vereinfachte TCP/IP-Modell (4 Schichten) verwendet, das OSI-Modell bleibt aber die Grundlage für das Verständnis von Netzwerkarchitekturen.',
                en: 'ISO reference model (1984) describing network communication in 7 layers. Each layer has a clearly defined function and communicates only with the layers directly above and below. Bottom to top: Physical → Data Link → Network → Transport → Session → Presentation → Application. In practice, the simplified TCP/IP model (4 layers) is often used, but the OSI model remains the foundation for understanding network architectures.',
            },
            cat: 'osi', tags: ['iso', '7 schichten', 'referenzmodell', 'tcp/ip', 'netzwerkarchitektur', 'standard', 'iso 7498'],
        },
        {
            id: 'osi-1', title: { de: 'Schicht 1', en: 'Layer 1' },
            subtitle: { de: 'Bitübertragungsschicht (Physical Layer)', en: 'Physical Layer' },
            desc: {
                de: 'Die unterste Schicht des OSI-Modells. Definiert elektrische, mechanische und funktionale Spezifikationen für die physische Verbindung. Hier werden Bits als elektrische Signale, Licht oder Funk übertragen. Beispiele: Ethernet-Kabel, Glasfaser, WLAN-Funkwellen, Hubs, Repeater.',
                en: 'The lowest layer of the OSI model. Defines electrical, mechanical and functional specifications for the physical connection. Bits are transmitted as electrical signals, light or radio waves. Examples: Ethernet cables, fiber optics, Wi-Fi radio waves, hubs, repeaters.',
            },
            cat: 'osi', tags: ['physical', 'bitübertragung', 'kabel', 'signal', 'hub', 'repeater'],
            layer: 1,
        },
        {
            id: 'osi-2', title: { de: 'Schicht 2', en: 'Layer 2' },
            subtitle: { de: 'Sicherungsschicht (Data Link Layer)', en: 'Data Link Layer' },
            desc: {
                de: 'Stellt eine zuverlässige Übertragung zwischen direkt verbundenen Knoten sicher. Teilt Daten in Frames auf und verwendet MAC-Adressen zur Adressierung. Erkennt und korrigiert Übertragungsfehler der Schicht 1. Beispiele: Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11), Switches, Bridges.',
                en: 'Ensures reliable transmission between directly connected nodes. Divides data into frames and uses MAC addresses for addressing. Detects and corrects transmission errors from Layer 1. Examples: Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11), switches, bridges.',
            },
            cat: 'osi', tags: ['data link', 'sicherung', 'frame', 'mac', 'ethernet', 'switch', 'bridge'],
            layer: 2,
        },
        {
            id: 'osi-3', title: { de: 'Schicht 3', en: 'Layer 3' },
            subtitle: { de: 'Vermittlungsschicht (Network Layer)', en: 'Network Layer' },
            desc: {
                de: 'Zuständig für die logische Adressierung (IP-Adressen) und das Routing von Paketen über Netzwerkgrenzen hinweg. Bestimmt den besten Pfad vom Sender zum Empfänger. Protokolle: IP, ICMP, OSPF, BGP. Geräte: Router.',
                en: 'Responsible for logical addressing (IP addresses) and routing packets across network boundaries. Determines the best path from sender to receiver. Protocols: IP, ICMP, OSPF, BGP. Devices: routers.',
            },
            cat: 'osi', tags: ['network', 'vermittlung', 'routing', 'ip', 'paket', 'router'],
            layer: 3,
        },
        {
            id: 'osi-4', title: { de: 'Schicht 4', en: 'Layer 4' },
            subtitle: { de: 'Transportschicht (Transport Layer)', en: 'Transport Layer' },
            desc: {
                de: 'Stellt die Ende-zu-Ende-Kommunikation zwischen Anwendungen sicher. Segmentiert Daten und sorgt je nach Protokoll für zuverlässige (TCP) oder schnelle (UDP) Übertragung. Verwendet Portnummern zur Zuordnung von Diensten. Flusskontrolle und Fehlerbehebung.',
                en: 'Ensures end-to-end communication between applications. Segments data and provides reliable (TCP) or fast (UDP) transmission depending on protocol. Uses port numbers to assign services. Flow control and error recovery.',
            },
            cat: 'osi', tags: ['transport', 'tcp', 'udp', 'port', 'segment', 'flusskontrolle'],
            layer: 4,
        },
        {
            id: 'osi-5', title: { de: 'Schicht 5', en: 'Layer 5' },
            subtitle: { de: 'Sitzungsschicht (Session Layer)', en: 'Session Layer' },
            desc: {
                de: 'Verwaltet den Auf- und Abbau von Sitzungen (Sessions) zwischen Anwendungen. Synchronisiert den Datenaustausch und setzt Checkpoints für die Wiederaufnahme nach Unterbrechungen. Beispiele: NetBIOS, RPC, SMB-Sessions.',
                en: 'Manages the setup and teardown of sessions between applications. Synchronizes data exchange and sets checkpoints for resumption after interruptions. Examples: NetBIOS, RPC, SMB sessions.',
            },
            cat: 'osi', tags: ['session', 'sitzung', 'netbios', 'rpc', 'smb'],
            layer: 5,
        },
        {
            id: 'osi-6', title: { de: 'Schicht 6', en: 'Layer 6' },
            subtitle: { de: 'Darstellungsschicht (Presentation Layer)', en: 'Presentation Layer' },
            desc: {
                de: 'Übersetzt Datenformate zwischen Anwendungs- und Netzwerkformat. Zuständig für Zeichenkodierung (ASCII, UTF-8), Datenkompression und Verschlüsselung/Entschlüsselung. Beispiele: SSL/TLS-Verschlüsselung, JPEG, MPEG, ASCII.',
                en: 'Translates data formats between application and network format. Handles character encoding (ASCII, UTF-8), data compression and encryption/decryption. Examples: SSL/TLS encryption, JPEG, MPEG, ASCII.',
            },
            cat: 'osi', tags: ['presentation', 'darstellung', 'kodierung', 'verschlüsselung', 'ascii', 'utf-8', 'kompression'],
            layer: 6,
        },
        {
            id: 'osi-7', title: { de: 'Schicht 7', en: 'Layer 7' },
            subtitle: { de: 'Anwendungsschicht (Application Layer)', en: 'Application Layer' },
            desc: {
                de: 'Die oberste Schicht, die dem Benutzer am nächsten ist. Stellt Netzwerkdienste direkt für Anwendungen bereit. Hier laufen Protokolle wie HTTP, FTP, SMTP, DNS und SSH. Ermöglicht Dateiübertragung, E-Mail, Web-Browsing und Verzeichnisdienste.',
                en: 'The top layer, closest to the user. Provides network services directly to applications. Protocols like HTTP, FTP, SMTP, DNS and SSH operate here. Enables file transfer, email, web browsing and directory services.',
            },
            cat: 'osi', tags: ['application', 'anwendung', 'http', 'ftp', 'smtp', 'dns', 'ssh'],
            layer: 7,
        },

        // ===== Protokolle (22) =====
        {
            id: 'tcp', title: 'TCP', subtitle: 'Transmission Control Protocol',
            desc: {
                de: 'Verbindungsorientiertes Transportprotokoll auf OSI-Schicht 4. Garantiert zuverlässige, geordnete Datenübertragung durch Bestätigungen (ACKs) und Neuübertragungen. Der Verbindungsaufbau erfolgt über den Three-Way-Handshake (SYN → SYN-ACK → ACK). Wird für HTTP, SSH, FTP und die meisten Anwendungsprotokolle verwendet.',
                en: 'Connection-oriented transport protocol at OSI Layer 4. Guarantees reliable, ordered data transmission through acknowledgments (ACKs) and retransmissions. Connection establishment via the three-way handshake (SYN → SYN-ACK → ACK). Used for HTTP, SSH, FTP and most application protocols.',
            },
            cat: 'protokolle', tags: ['transport', 'layer4', 'schicht4', 'verbindungsorientiert', 'three-way-handshake', 'ack', 'syn'],
        },
        {
            id: 'udp', title: 'UDP', subtitle: 'User Datagram Protocol',
            desc: {
                de: 'Verbindungsloses Transportprotokoll auf OSI-Schicht 4. Bietet keine Garantie für Zustellung, Reihenfolge oder Duplikatvermeidung — dafür minimalen Overhead und geringe Latenz. Ideal für Echtzeitanwendungen wie VoIP, Video-Streaming, Online-Gaming und DNS-Abfragen.',
                en: 'Connectionless transport protocol at OSI Layer 4. Provides no guarantee for delivery, ordering or duplicate avoidance — but minimal overhead and low latency. Ideal for real-time applications like VoIP, video streaming, online gaming and DNS queries.',
            },
            cat: 'protokolle', tags: ['transport', 'layer4', 'schicht4', 'verbindungslos', 'echtzeit', 'voip', 'streaming', 'datagram'],
        },
        {
            id: 'icmp', title: 'ICMP', subtitle: 'Internet Control Message Protocol',
            desc: {
                de: 'Steuer- und Fehlermeldeprotokoll auf OSI-Schicht 3. Wird von Netzwerkgeräten genutzt, um Fehlermeldungen und Diagnoseinformationen zu senden. Bekannte Anwendungen: ping (Echo Request/Reply) und traceroute (Time Exceeded). Wird nicht für Nutzdaten, sondern für Netzwerkmanagement verwendet.',
                en: 'Control and error reporting protocol at OSI Layer 3. Used by network devices to send error messages and diagnostic information. Well-known applications: ping (Echo Request/Reply) and traceroute (Time Exceeded). Used for network management, not user data.',
            },
            cat: 'protokolle', tags: ['layer3', 'schicht3', 'ping', 'traceroute', 'echo', 'fehler', 'diagnose'],
        },
        {
            id: 'arp', title: 'ARP', subtitle: 'Address Resolution Protocol',
            desc: {
                de: 'Löst IP-Adressen in MAC-Adressen auf, damit Frames im lokalen Netzwerk korrekt zugestellt werden können. Arbeitet zwischen Schicht 2 und 3. Sendet einen Broadcast ("Wer hat IP x.x.x.x?") und erhält eine Unicast-Antwort mit der zugehörigen MAC-Adresse. ARP-Tabellen cachen bekannte Zuordnungen.',
                en: 'Resolves IP addresses to MAC addresses so that frames can be correctly delivered on the local network. Operates between Layer 2 and 3. Sends a broadcast ("Who has IP x.x.x.x?") and receives a unicast reply with the associated MAC address. ARP tables cache known mappings.',
            },
            cat: 'protokolle', tags: ['layer2', 'schicht2', 'mac', 'broadcast', 'auflösung', 'arp-tabelle', 'cache'],
        },
        {
            id: 'http', title: 'HTTP', subtitle: 'Hypertext Transfer Protocol',
            desc: {
                de: 'Anwendungsprotokoll auf Schicht 7 für die Übertragung von Webinhalten. Arbeitet nach dem Request-Response-Prinzip: Client sendet Anfrage (GET, POST, PUT, DELETE), Server antwortet mit Statuscode und Daten. Zustandslos — jede Anfrage ist unabhängig. HTTP/2 ermöglicht Multiplexing, HTTP/3 nutzt QUIC über UDP.',
                en: 'Application protocol at Layer 7 for transmitting web content. Works on the request-response principle: client sends request (GET, POST, PUT, DELETE), server responds with status code and data. Stateless — each request is independent. HTTP/2 enables multiplexing, HTTP/3 uses QUIC over UDP.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'web', 'request', 'response', 'get', 'post', 'rest', 'api'],
        },
        {
            id: 'https', title: 'HTTPS', subtitle: 'HTTP Secure (HTTP over TLS)',
            desc: {
                de: 'Verschlüsselte Variante von HTTP über TLS (Transport Layer Security). Schützt Daten vor Abhören und Manipulation durch Ende-zu-Ende-Verschlüsselung. Authentifiziert den Server über digitale Zertifikate. Standard-Port 443. Seit 2018 von allen großen Browsern als Standard gefordert.',
                en: 'Encrypted variant of HTTP over TLS (Transport Layer Security). Protects data from eavesdropping and tampering through end-to-end encryption. Authenticates the server via digital certificates. Default port 443. Required as standard by all major browsers since 2018.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'tls', 'ssl', 'verschlüsselung', 'zertifikat', 'port443', 'sicher'],
        },
        {
            id: 'dns', title: 'DNS', subtitle: 'Domain Name System',
            desc: {
                de: 'Übersetzt Domainnamen (z.B. example.com) in IP-Adressen. Hierarchisches, verteiltes System mit Root-Servern, TLD-Servern und autoritativen Nameservern. Record-Typen: A (IPv4), AAAA (IPv6), MX (Mail), CNAME (Alias), NS (Nameserver), TXT. Standard-Port: 53 (UDP/TCP).',
                en: 'Translates domain names (e.g. example.com) to IP addresses. Hierarchical, distributed system with root servers, TLD servers and authoritative name servers. Record types: A (IPv4), AAAA (IPv6), MX (Mail), CNAME (Alias), NS (Nameserver), TXT. Default port: 53 (UDP/TCP).',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'namensauflösung', 'domain', 'nameserver', 'port53', 'a-record', 'mx'],
        },
        {
            id: 'dhcp', title: 'DHCP', subtitle: 'Dynamic Host Configuration Protocol',
            desc: {
                de: 'Vergibt automatisch IP-Adressen und Netzwerkkonfiguration an Clients. Der Prozess: DISCOVER → OFFER → REQUEST → ACK (DORA). Verteilt neben der IP auch Subnetzmaske, Gateway und DNS-Server. Lease-Zeiten regeln, wie lange eine Adresse gültig ist. Ports: 67 (Server), 68 (Client).',
                en: 'Automatically assigns IP addresses and network configuration to clients. The process: DISCOVER → OFFER → REQUEST → ACK (DORA). Distributes subnet mask, gateway and DNS server in addition to the IP. Lease times regulate how long an address is valid. Ports: 67 (Server), 68 (Client).',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'adressvergabe', 'dora', 'lease', 'port67', 'port68', 'automatisch'],
        },
        {
            id: 'ftp', title: 'FTP', subtitle: 'File Transfer Protocol',
            desc: {
                de: 'Dateiübertragungsprotokoll auf Schicht 7. Nutzt zwei Kanäle: Steuerkanal (Port 21) für Befehle und Datenkanal (Port 20 oder dynamisch) für Dateitransfer. Unterstützt aktiven und passiven Modus. Überträgt Daten unverschlüsselt — für sichere Transfers SFTP oder FTPS verwenden.',
                en: 'File transfer protocol at Layer 7. Uses two channels: control channel (port 21) for commands and data channel (port 20 or dynamic) for file transfer. Supports active and passive mode. Transfers data unencrypted — use SFTP or FTPS for secure transfers.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'datei', 'upload', 'download', 'port21', 'port20'],
        },
        {
            id: 'sftp', title: 'SFTP', subtitle: 'SSH File Transfer Protocol',
            desc: {
                de: 'Sichere Dateiübertragung über SSH (Port 22). Verschlüsselt sowohl Befehle als auch Daten in einem einzigen Kanal. Nicht zu verwechseln mit FTPS (FTP über TLS). Bietet zusätzlich Dateiverwaltung (Umbenennen, Löschen, Berechtigungen). Standard für sichere Dateiübertragungen in der Praxis.',
                en: 'Secure file transfer over SSH (port 22). Encrypts both commands and data in a single channel. Not to be confused with FTPS (FTP over TLS). Also provides file management (rename, delete, permissions). Standard for secure file transfers in practice.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'ssh', 'datei', 'verschlüsselt', 'port22', 'sicher'],
        },
        {
            id: 'ssh', title: 'SSH', subtitle: 'Secure Shell',
            desc: {
                de: 'Kryptographisches Netzwerkprotokoll für sichere Fernwartung über unsichere Netze. Ersetzt Telnet durch verschlüsselte Verbindungen. Ermöglicht Remote-Shell, Dateitransfer (SCP/SFTP), Port-Forwarding und Tunneling. Authentifizierung über Passwort oder Public-Key. Port 22.',
                en: 'Cryptographic network protocol for secure remote administration over insecure networks. Replaces Telnet with encrypted connections. Enables remote shell, file transfer (SCP/SFTP), port forwarding and tunneling. Authentication via password or public key. Port 22.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'remote', 'verschlüsselung', 'terminal', 'port22', 'key', 'tunnel'],
        },
        {
            id: 'smtp', title: 'SMTP', subtitle: 'Simple Mail Transfer Protocol',
            desc: {
                de: 'Protokoll zum Versenden von E-Mails zwischen Mailservern und vom Client zum Server. Arbeitet auf Port 25 (Server-zu-Server) bzw. Port 587 (Client-Submission mit STARTTLS). Nur für den Versand zuständig — Empfang erfolgt über POP3 oder IMAP.',
                en: 'Protocol for sending emails between mail servers and from client to server. Operates on port 25 (server-to-server) or port 587 (client submission with STARTTLS). Responsible for sending only — receiving is handled by POP3 or IMAP.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'mail', 'email', 'port25', 'port587', 'versand'],
        },
        {
            id: 'pop3', title: 'POP3', subtitle: 'Post Office Protocol Version 3',
            desc: {
                de: 'Protokoll zum Abrufen von E-Mails vom Mailserver. Lädt Nachrichten herunter und löscht sie standardmäßig vom Server. Einfach, aber nicht für Multi-Geräte-Zugriff geeignet. Port 110 (unverschlüsselt) bzw. Port 995 (POP3S über TLS). Wird zunehmend durch IMAP ersetzt.',
                en: 'Protocol for retrieving emails from the mail server. Downloads messages and deletes them from the server by default. Simple but not suitable for multi-device access. Port 110 (unencrypted) or port 995 (POP3S over TLS). Increasingly being replaced by IMAP.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'mail', 'email', 'port110', 'port995', 'abruf'],
        },
        {
            id: 'imap', title: 'IMAP', subtitle: 'Internet Message Access Protocol',
            desc: {
                de: 'Protokoll zum Abrufen und Verwalten von E-Mails auf dem Server. Im Gegensatz zu POP3 bleiben Mails auf dem Server — ideal für Zugriff von mehreren Geräten. Unterstützt Ordner, Flags und serverseitige Suche. Port 143 (STARTTLS) bzw. Port 993 (IMAPS über TLS).',
                en: 'Protocol for retrieving and managing emails on the server. Unlike POP3, emails remain on the server — ideal for multi-device access. Supports folders, flags and server-side search. Port 143 (STARTTLS) or port 993 (IMAPS over TLS).',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'mail', 'email', 'port143', 'port993', 'synchronisation'],
        },
        {
            id: 'snmp', title: 'SNMP', subtitle: 'Simple Network Management Protocol',
            desc: {
                de: 'Protokoll zur Überwachung und Verwaltung von Netzwerkgeräten. Agents auf Geräten (Router, Switches) liefern Daten an einen zentralen Manager. Verwendet OIDs (Object Identifiers) und MIBs (Management Information Bases). Version 3 bietet Authentifizierung und Verschlüsselung. Port 161/162.',
                en: 'Protocol for monitoring and managing network devices. Agents on devices (routers, switches) deliver data to a central manager. Uses OIDs (Object Identifiers) and MIBs (Management Information Bases). Version 3 provides authentication and encryption. Port 161/162.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'monitoring', 'management', 'port161', 'agent', 'mib', 'oid', 'trap'],
        },
        {
            id: 'ntp', title: 'NTP', subtitle: 'Network Time Protocol',
            desc: {
                de: 'Synchronisiert Uhren von Computern über ein Netzwerk mit einer Genauigkeit im Millisekundenbereich. Hierarchische Architektur mit Stratum-Ebenen (Stratum 0 = Atomuhr, Stratum 1 = direkt angebunden). Essentiell für Logging, Zertifikate und verteilte Systeme. Port 123 (UDP).',
                en: 'Synchronizes computer clocks over a network with millisecond accuracy. Hierarchical architecture with stratum levels (Stratum 0 = atomic clock, Stratum 1 = directly connected). Essential for logging, certificates and distributed systems. Port 123 (UDP).',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'zeit', 'uhr', 'synchronisation', 'port123', 'stratum'],
        },
        {
            id: 'bgp', title: 'BGP', subtitle: 'Border Gateway Protocol',
            desc: {
                de: 'Das Routing-Protokoll des Internets. Verbindet autonome Systeme (AS) und bestimmt den besten Pfad für Daten zwischen Providern. Verwendet Path-Vector-Algorithmus mit Policy-basiertem Routing. Port 179 (TCP). BGP-Fehlkonfigurationen können zu großflächigen Internet-Ausfällen führen.',
                en: 'The routing protocol of the Internet. Connects autonomous systems (AS) and determines the best path for data between providers. Uses path-vector algorithm with policy-based routing. Port 179 (TCP). BGP misconfigurations can cause large-scale Internet outages.',
            },
            cat: 'protokolle', tags: ['layer3', 'schicht3', 'routing', 'internet', 'as', 'autonomous system', 'port179', 'provider'],
        },
        {
            id: 'ospf', title: 'OSPF', subtitle: 'Open Shortest Path First',
            desc: {
                de: 'Link-State Routing-Protokoll für autonome Systeme (Interior Gateway Protocol). Berechnet kürzeste Pfade mit dem Dijkstra-Algorithmus. Unterstützt Bereichsaufteilung (Areas) für Skalierbarkeit. Konvergiert schneller als RIP. Verwendet IP-Protokoll 89 (direkt auf IP, kein TCP/UDP).',
                en: 'Link-state routing protocol for autonomous systems (Interior Gateway Protocol). Calculates shortest paths using the Dijkstra algorithm. Supports area division for scalability. Converges faster than RIP. Uses IP protocol 89 (directly on IP, no TCP/UDP).',
            },
            cat: 'protokolle', tags: ['layer3', 'schicht3', 'routing', 'dijkstra', 'link-state', 'igp', 'area'],
        },
        {
            id: 'sip', title: 'SIP', subtitle: 'Session Initiation Protocol',
            desc: {
                de: 'Signalisierungsprotokoll für den Auf- und Abbau von Multimedia-Sitzungen (VoIP, Videokonferenzen). Textbasiert wie HTTP. Verhandelt Medienparameter über SDP (Session Description Protocol). Ports 5060 (unverschlüsselt) und 5061 (TLS). Standard für IP-Telefonie.',
                en: 'Signaling protocol for setting up and tearing down multimedia sessions (VoIP, video conferencing). Text-based like HTTP. Negotiates media parameters via SDP (Session Description Protocol). Ports 5060 (unencrypted) and 5061 (TLS). Standard for IP telephony.',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'voip', 'telefonie', 'video', 'port5060', 'multimedia'],
        },
        {
            id: 'mqtt', title: 'MQTT', subtitle: 'Message Queuing Telemetry Transport',
            desc: {
                de: 'Leichtgewichtiges Publish/Subscribe-Messaging-Protokoll für IoT und M2M-Kommunikation. Minimaler Overhead, ideal für Geräte mit begrenzten Ressourcen oder instabilen Verbindungen. Ein Broker vermittelt Nachrichten über Topics. Ports 1883 (unverschlüsselt) und 8883 (TLS).',
                en: 'Lightweight publish/subscribe messaging protocol for IoT and M2M communication. Minimal overhead, ideal for devices with limited resources or unstable connections. A broker mediates messages via topics. Ports 1883 (unencrypted) and 8883 (TLS).',
            },
            cat: 'protokolle', tags: ['layer7', 'schicht7', 'iot', 'publish', 'subscribe', 'broker', 'port1883', 'm2m'],
        },
        {
            id: 'tls', title: 'TLS / SSL', subtitle: 'Transport Layer Security',
            desc: {
                de: 'Kryptographisches Protokoll zur Absicherung von Verbindungen. TLS 1.3 (aktuell) bietet Forward Secrecy und verkürzte Handshakes. Authentifiziert Server über X.509-Zertifikate. Verschlüsselt HTTP (→ HTTPS), SMTP, IMAP und viele weitere Protokolle. SSL ist veraltet und unsicher.',
                en: 'Cryptographic protocol for securing connections. TLS 1.3 (current) offers forward secrecy and shortened handshakes. Authenticates servers via X.509 certificates. Encrypts HTTP (→ HTTPS), SMTP, IMAP and many other protocols. SSL is deprecated and insecure.',
            },
            cat: 'protokolle', tags: ['verschlüsselung', 'zertifikat', 'handshake', 'x509', 'forward secrecy', 'sicherheit'],
        },
        {
            id: 'ipsec', title: 'IPsec', subtitle: 'Internet Protocol Security',
            desc: {
                de: 'Protokollsuite zur Absicherung von IP-Kommunikation auf Schicht 3. Zwei Modi: Transportmodus (nur Payload verschlüsselt) und Tunnelmodus (gesamtes Paket verschlüsselt). Hauptkomponenten: AH (Authentifizierung), ESP (Verschlüsselung), IKE (Schlüsselaustausch). Basis für viele VPN-Lösungen.',
                en: 'Protocol suite for securing IP communication at Layer 3. Two modes: transport mode (only payload encrypted) and tunnel mode (entire packet encrypted). Main components: AH (authentication), ESP (encryption), IKE (key exchange). Basis for many VPN solutions.',
            },
            cat: 'protokolle', tags: ['layer3', 'schicht3', 'vpn', 'verschlüsselung', 'tunnel', 'ah', 'esp', 'ike'],
        },

        // ===== Kabeltypen (14) =====
        {
            id: 'cat5', title: 'Cat 5',
            subtitle: { de: 'Kategorie 5', en: 'Category 5' },
            desc: {
                de: 'Älterer Ethernet-Standard mit Frequenzen bis 100 MHz. Unterstützt Fast Ethernet (100 Mbit/s) über 100 Meter. 4 verdrillte Adernpaare (Twisted Pair), meist ungeschirmt (UTP). Heute durch Cat 5e ersetzt — für Neuinstallationen nicht mehr empfohlen.',
                en: 'Older Ethernet standard with frequencies up to 100 MHz. Supports Fast Ethernet (100 Mbit/s) over 100 meters. 4 twisted pairs, mostly unshielded (UTP). Now replaced by Cat 5e — no longer recommended for new installations.',
            },
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '100mbit', '100mhz', 'utp', 'fast ethernet'],
            cableType: 'copper', cableColor: '#6b7280',
        },
        {
            id: 'cat5e', title: 'Cat 5e',
            subtitle: { de: 'Kategorie 5 Enhanced', en: 'Category 5 Enhanced' },
            desc: {
                de: 'Verbesserte Version von Cat 5 mit strengeren Spezifikationen gegen Übersprechen (Crosstalk). Unterstützt Gigabit Ethernet (1 Gbit/s) über 100 Meter bei 100 MHz. Weit verbreitet in bestehenden Installationen. Mindeststandard für Gigabit-Netzwerke.',
                en: 'Improved version of Cat 5 with stricter specifications against crosstalk. Supports Gigabit Ethernet (1 Gbit/s) over 100 meters at 100 MHz. Widely used in existing installations. Minimum standard for Gigabit networks.',
            },
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '1gbit', '100mhz', 'gigabit', 'crosstalk'],
            cableType: 'copper', cableColor: '#3b82f6',
        },
        {
            id: 'cat6', title: 'Cat 6',
            subtitle: { de: 'Kategorie 6', en: 'Category 6' },
            desc: {
                de: 'Standard für Frequenzen bis 250 MHz. Unterstützt 1 Gbit/s über 100 Meter und 10 Gbit/s über kurze Distanzen (bis 55 Meter). Bessere Isolation durch Trennkreuz (Spline) zwischen den Adernpaaren. Gängige Wahl für Büro- und Heimnetzwerke.',
                en: 'Standard for frequencies up to 250 MHz. Supports 1 Gbit/s over 100 meters and 10 Gbit/s over short distances (up to 55 meters). Better isolation through spline between wire pairs. Common choice for office and home networks.',
            },
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '10gbit', '250mhz', 'spline', 'büro'],
            cableType: 'copper', cableColor: '#3b82f6',
        },
        {
            id: 'cat6a', title: 'Cat 6a',
            subtitle: { de: 'Kategorie 6a — Augmented', en: 'Category 6a — Augmented' },
            desc: {
                de: 'Erweiterter Cat-6-Standard mit Frequenzen bis 500 MHz und 10 Gbit/s über volle 100 Meter. Bessere Schirmung (typisch S/FTP) reduziert Alien Crosstalk. Standard für Neuinstallationen in Bürogebäuden und Rechenzentren. Rückwärtskompatibel mit Cat 5e und Cat 6.',
                en: 'Extended Cat 6 standard with frequencies up to 500 MHz and 10 Gbit/s over the full 100 meters. Better shielding (typically S/FTP) reduces alien crosstalk. Standard for new installations in office buildings and data centers. Backward compatible with Cat 5e and Cat 6.',
            },
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '10gbit', '500mhz', 'augmented', 's/ftp', 'rechenzentrum'],
            cableType: 'copper', cableColor: '#3b82f6',
        },
        {
            id: 'cat7', title: 'Cat 7',
            subtitle: { de: 'Kategorie 7', en: 'Category 7' },
            desc: {
                de: 'Vollständig geschirmtes Kabel (S/FTP) mit Frequenzen bis 600 MHz. Unterstützt 10 Gbit/s über 100 Meter. Jedes Adernpaar einzeln geschirmt plus Gesamtschirmung. Verwendet GG45- oder TERA-Stecker (nicht RJ-45 kompatibel ohne Adapter). In der Praxis oft durch Cat 6a ersetzt.',
                en: 'Fully shielded cable (S/FTP) with frequencies up to 600 MHz. Supports 10 Gbit/s over 100 meters. Each wire pair individually shielded plus overall shielding. Uses GG45 or TERA connectors (not RJ-45 compatible without adapter). In practice often replaced by Cat 6a.',
            },
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '10gbit', '600mhz', 's/ftp', 'gg45', 'geschirmt'],
            cableType: 'copper', cableColor: '#22c55e',
        },
        {
            id: 'cat8', title: 'Cat 8',
            subtitle: { de: 'Kategorie 8', en: 'Category 8' },
            desc: {
                de: 'Höchste Kupfer-Kategorie mit Frequenzen bis 2.000 MHz (2 GHz). Unterstützt 25 Gbit/s und 40 Gbit/s über kurze Distanzen (30 Meter). Konzipiert für Rechenzentren und Switch-zu-Switch-Verbindungen. Für typische LAN-Installationen überdimensioniert.',
                en: 'Highest copper category with frequencies up to 2,000 MHz (2 GHz). Supports 25 Gbit/s and 40 Gbit/s over short distances (30 meters). Designed for data centers and switch-to-switch connections. Oversized for typical LAN installations.',
            },
            cat: 'kabel', tags: ['kupfer', 'twisted pair', '40gbit', '25gbit', '2000mhz', '2ghz', 'rechenzentrum', 'datacenter'],
            cableType: 'copper', cableColor: '#3b82f6',
        },
        {
            id: 'om1', title: 'OM1',
            subtitle: { de: 'Multimode Glasfaser 62,5/125 \u00b5m', en: 'Multimode Fiber 62.5/125 \u00b5m' },
            desc: {
                de: 'Älteste Multimode-Glasfaser mit großem Kern (62,5 \u00b5m). Unterstützt Gigabit Ethernet bis 275 Meter und Fast Ethernet bis 2 km. Orange Ummantelung. Für LED-basierte Sender ausgelegt. Für Neuinstallationen nicht mehr empfohlen — durch OM3/OM4 abgelöst.',
                en: 'Oldest multimode fiber with large core (62.5 \u00b5m). Supports Gigabit Ethernet up to 275 meters and Fast Ethernet up to 2 km. Orange jacket. Designed for LED-based transmitters. No longer recommended for new installations — superseded by OM3/OM4.',
            },
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', 'led', '62.5', 'orange'],
            cableType: 'fiber', cableColor: '#f97316',
        },
        {
            id: 'om2', title: 'OM2',
            subtitle: { de: 'Multimode Glasfaser 50/125 \u00b5m', en: 'Multimode Fiber 50/125 \u00b5m' },
            desc: {
                de: 'Multimode-Glasfaser mit 50 \u00b5m Kern. Unterstützt Gigabit Ethernet bis 550 Meter. Verbesserte Bandbreite gegenüber OM1 durch kleineren Kern. Orange Ummantelung. Wird in bestehenden Installationen noch angetroffen, für Neuinstallationen OM3 oder höher empfohlen.',
                en: 'Multimode fiber with 50 \u00b5m core. Supports Gigabit Ethernet up to 550 meters. Improved bandwidth over OM1 due to smaller core. Orange jacket. Still found in existing installations, OM3 or higher recommended for new installations.',
            },
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', '50', 'orange'],
            cableType: 'fiber', cableColor: '#f97316',
        },
        {
            id: 'om3', title: 'OM3',
            subtitle: { de: 'Multimode Glasfaser (Laser-optimiert)', en: 'Multimode Fiber (Laser-optimized)' },
            desc: {
                de: 'Laser-optimierte Multimode-Glasfaser (50/125 \u00b5m). Unterstützt 10 Gbit/s bis 300 Meter und 40/100 Gbit/s über kurze Distanzen. Aqua-farbige Ummantelung. Für VCSEL-Laser (Vertical Cavity) optimiert. Gängiger Standard für Gebäude- und Campus-Verkabelung.',
                en: 'Laser-optimized multimode fiber (50/125 \u00b5m). Supports 10 Gbit/s up to 300 meters and 40/100 Gbit/s over short distances. Aqua-colored jacket. Optimized for VCSEL lasers (Vertical Cavity). Common standard for building and campus cabling.',
            },
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', 'laser', '10gbit', 'vcsel', 'aqua'],
            cableType: 'fiber', cableColor: '#06b6d4',
        },
        {
            id: 'om4', title: 'OM4',
            subtitle: { de: 'Multimode Glasfaser (Hochleistung)', en: 'Multimode Fiber (High Performance)' },
            desc: {
                de: 'Hochleistungs-Multimode-Glasfaser für 10 Gbit/s bis 400 Meter und 100 Gbit/s bis 150 Meter. Aqua-farbige Ummantelung (wie OM3). Höhere modale Bandbreite als OM3. Empfohlen für Rechenzentren und Backbone-Verbindungen innerhalb von Gebäuden.',
                en: 'High-performance multimode fiber for 10 Gbit/s up to 400 meters and 100 Gbit/s up to 150 meters. Aqua-colored jacket (like OM3). Higher modal bandwidth than OM3. Recommended for data centers and backbone connections within buildings.',
            },
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', '100gbit', 'rechenzentrum', 'aqua', 'backbone'],
            cableType: 'fiber', cableColor: '#06b6d4',
        },
        {
            id: 'om5', title: 'OM5',
            subtitle: { de: 'Multimode Breitband (Wideband)', en: 'Multimode Wideband' },
            desc: {
                de: 'Neueste Multimode-Kategorie, optimiert für SWDM (Short Wavelength Division Multiplexing) mit mehreren Wellenlängen. Unterstützt 100 Gbit/s und mehr über weitere Distanzen. Limettengrüne Ummantelung. Rückwärtskompatibel mit OM3/OM4-Infrastruktur.',
                en: 'Newest multimode category, optimized for SWDM (Short Wavelength Division Multiplexing) with multiple wavelengths. Supports 100 Gbit/s and more over greater distances. Lime green jacket. Backward compatible with OM3/OM4 infrastructure.',
            },
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'multimode', 'swdm', 'breitband', 'limettengrün', 'wideband'],
            cableType: 'fiber', cableColor: '#84cc16',
        },
        {
            id: 'os1', title: 'OS1',
            subtitle: { de: 'Singlemode Glasfaser (Indoor)', en: 'Singlemode Fiber (Indoor)' },
            desc: {
                de: 'Singlemode-Glasfaser mit 9/125 \u00b5m Kern für Innenbereich-Verkabelung. Unterstützt Entfernungen bis 10 km bei 1 Gbit/s und 10 Gbit/s. Gelbe Ummantelung. Geringe Dämpfung (max. 1,0 dB/km). Für Gebäude-Backbones und mittlere Distanzen.',
                en: 'Singlemode fiber with 9/125 \u00b5m core for indoor cabling. Supports distances up to 10 km at 1 Gbit/s and 10 Gbit/s. Yellow jacket. Low attenuation (max. 1.0 dB/km). For building backbones and medium distances.',
            },
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'singlemode', 'indoor', '9/125', 'gelb', '10km'],
            cableType: 'fiber', cableColor: '#eab308',
        },
        {
            id: 'os2', title: 'OS2',
            subtitle: { de: 'Singlemode Glasfaser (Outdoor)', en: 'Singlemode Fiber (Outdoor)' },
            desc: {
                de: 'Singlemode-Glasfaser für Außen- und Langstreckenverbindungen. Unterstützt Entfernungen bis 200 km mit geeigneten Transceivern. Extrem geringe Dämpfung (max. 0,4 dB/km). Gelbe Ummantelung. Standard für WAN-Verbindungen, Carrier-Netze und Telekommunikation.',
                en: 'Singlemode fiber for outdoor and long-distance connections. Supports distances up to 200 km with suitable transceivers. Extremely low attenuation (max. 0.4 dB/km). Yellow jacket. Standard for WAN connections, carrier networks and telecommunications.',
            },
            cat: 'kabel', tags: ['glasfaser', 'fiber', 'singlemode', 'outdoor', 'langstrecke', 'wan', 'gelb', '200km', 'carrier'],
            cableType: 'fiber', cableColor: '#eab308',
        },
        {
            id: 'koaxial', title: 'Koaxial',
            subtitle: { de: 'Koaxialkabel (RG-58, RG-6)', en: 'Coaxial Cable (RG-58, RG-6)' },
            desc: {
                de: 'Kabel mit einem zentralen Leiter, umgeben von Isolierung, Schirmung und Außenmantel. RG-58: dünn, 10Base2 (historisch). RG-6: Kabelfernsehen und Internet (DOCSIS). Gute Abschirmung gegen elektromagnetische Störungen. Im LAN durch Twisted Pair ersetzt, in der Breitband-Versorgung weiterhin im Einsatz.',
                en: 'Cable with a central conductor surrounded by insulation, shielding and outer jacket. RG-58: thin, 10Base2 (historical). RG-6: cable television and Internet (DOCSIS). Good shielding against electromagnetic interference. Replaced by twisted pair in LANs, still in use for broadband.',
            },
            cat: 'kabel', tags: ['kupfer', 'rg-58', 'rg-6', 'docsis', 'kabelfernsehen', 'breitband', '10base2', 'schirmung'],
            cableType: 'coax', cableColor: '#1f2937',
        },

        // ===== Netzwerkgeräte (11) =====
        {
            id: 'switch', title: 'Switch',
            subtitle: { de: 'Netzwerk-Switch (Layer 2)', en: 'Network Switch (Layer 2)' },
            desc: {
                de: 'Verbindet mehrere Geräte in einem LAN und leitet Frames anhand der MAC-Adresse weiter (OSI-Schicht 2). Lernt MAC-Adressen über seine Ports und baut eine MAC-Adresstabelle (CAM Table) auf. Im Gegensatz zum Hub sendet er Frames nur an den Ziel-Port. Managed Switches unterstützen VLANs, QoS und Monitoring.',
                en: 'Connects multiple devices in a LAN and forwards frames based on MAC address (OSI Layer 2). Learns MAC addresses through its ports and builds a MAC address table (CAM table). Unlike a hub, it sends frames only to the destination port. Managed switches support VLANs, QoS and monitoring.',
            },
            cat: 'geraete', tags: ['layer2', 'schicht2', 'lan', 'mac', 'forwarding', 'vlan', 'cam table', 'managed'],
        },
        {
            id: 'router', title: 'Router',
            subtitle: { de: 'Netzwerk-Router (Layer 3)', en: 'Network Router (Layer 3)' },
            desc: {
                de: 'Verbindet verschiedene Netzwerke und leitet Pakete anhand von IP-Adressen weiter (OSI-Schicht 3). Trifft Routing-Entscheidungen basierend auf Routing-Tabellen (statisch oder dynamisch via OSPF, BGP). Trennt Broadcast-Domänen. Typisch: WAN-zu-LAN, Inter-VLAN-Routing, Internetzugang.',
                en: 'Connects different networks and forwards packets based on IP addresses (OSI Layer 3). Makes routing decisions based on routing tables (static or dynamic via OSPF, BGP). Separates broadcast domains. Typical: WAN-to-LAN, inter-VLAN routing, Internet access.',
            },
            cat: 'geraete', tags: ['layer3', 'schicht3', 'routing', 'ip', 'wan', 'gateway', 'routing-tabelle'],
        },
        {
            id: 'hub', title: 'Hub',
            subtitle: { de: 'Netzwerk-Hub (Layer 1)', en: 'Network Hub (Layer 1)' },
            desc: {
                de: 'Einfachstes Netzwerkgerät — wiederholt eingehende Signale an alle Ports (OSI-Schicht 1). Keine Intelligenz: kein MAC-Learning, kein Filtern. Erzeugt Kollisionen bei gleichzeitigem Senden. Heute vollständig durch Switches ersetzt. Historisch relevant für 10Base-T Ethernet.',
                en: 'Simplest network device — repeats incoming signals to all ports (OSI Layer 1). No intelligence: no MAC learning, no filtering. Creates collisions during simultaneous transmission. Now completely replaced by switches. Historically relevant for 10Base-T Ethernet.',
            },
            cat: 'geraete', tags: ['layer1', 'schicht1', 'broadcast', 'kollision', 'veraltet', '10base-t', 'repeater'],
        },
        {
            id: 'bridge', title: 'Bridge',
            subtitle: { de: 'Netzwerk-Bridge (Layer 2)', en: 'Network Bridge (Layer 2)' },
            desc: {
                de: 'Verbindet zwei Netzwerksegmente auf Schicht 2 und filtert Traffic anhand von MAC-Adressen. Trennt Kollisionsdomänen, aber nicht Broadcast-Domänen. Vorläufer des Switches — ein Switch ist im Grunde eine Multiport-Bridge. Heute primär als Software-Bridge (z.B. in VMs) relevant.',
                en: 'Connects two network segments at Layer 2 and filters traffic based on MAC addresses. Separates collision domains but not broadcast domains. Predecessor of the switch — a switch is essentially a multiport bridge. Today primarily relevant as a software bridge (e.g. in VMs).',
            },
            cat: 'geraete', tags: ['layer2', 'schicht2', 'segment', 'mac', 'kollisionsdomäne', 'vm', 'software'],
        },
        {
            id: 'repeater', title: 'Repeater',
            subtitle: { de: 'Signal-Repeater (Layer 1)', en: 'Signal Repeater (Layer 1)' },
            desc: {
                de: 'Verstärkt und regeneriert Signale auf Schicht 1, um die maximale Kabellänge zu verlängern. Arbeitet rein auf physischer Ebene — keine Analyse der Daten. Moderne Varianten: WLAN-Repeater (verlängern WiFi-Reichweite), Glasfaser-Repeater (Langstrecke). Kann Signalqualität verbessern, aber auch Latenz einführen.',
                en: 'Amplifies and regenerates signals at Layer 1 to extend maximum cable length. Works purely at the physical level — no data analysis. Modern variants: Wi-Fi repeaters (extend WiFi range), fiber optic repeaters (long distance). Can improve signal quality but also introduce latency.',
            },
            cat: 'geraete', tags: ['layer1', 'schicht1', 'signal', 'verstärker', 'reichweite', 'wlan-repeater'],
        },
        {
            id: 'firewall-geraet', title: 'Firewall',
            subtitle: { de: 'Netzwerk-Firewall', en: 'Network Firewall' },
            desc: {
                de: 'Kontrolliert den ein- und ausgehenden Netzwerkverkehr nach definierten Regeln. Typen: Paketfilter (Schicht 3/4), Stateful Inspection (verbindungsorientiert), Application Firewall/WAF (Schicht 7). Next-Gen Firewalls (NGFW) kombinieren IDS/IPS, Deep Packet Inspection und Application Awareness.',
                en: 'Controls incoming and outgoing network traffic based on defined rules. Types: packet filter (Layer 3/4), stateful inspection (connection-oriented), application firewall/WAF (Layer 7). Next-gen firewalls (NGFW) combine IDS/IPS, deep packet inspection and application awareness.',
            },
            cat: 'geraete', tags: ['sicherheit', 'paketfilter', 'stateful', 'ngfw', 'waf', 'regeln', 'deep packet inspection'],
        },
        {
            id: 'access-point', title: 'Access Point',
            subtitle: { de: 'WLAN Access Point (AP)', en: 'Wireless Access Point (AP)' },
            desc: {
                de: 'Verbindet drahtlose Geräte mit einem kabelgebundenen Netzwerk. Arbeitet auf Schicht 1/2 und erzeugt ein BSS (Basic Service Set). Unterstützt Standards: 802.11a/b/g/n/ac/ax (Wi-Fi 6) und 802.11be (Wi-Fi 7). Mehrere APs bilden ein ESS für nahtloses Roaming. PoE-fähig (Power over Ethernet).',
                en: 'Connects wireless devices to a wired network. Operates at Layer 1/2 and creates a BSS (Basic Service Set). Supports standards: 802.11a/b/g/n/ac/ax (Wi-Fi 6) and 802.11be (Wi-Fi 7). Multiple APs form an ESS for seamless roaming. PoE capable (Power over Ethernet).',
            },
            cat: 'geraete', tags: ['wlan', 'wifi', 'drahtlos', '802.11', 'bss', 'poe', 'roaming', 'wi-fi 6'],
        },
        {
            id: 'load-balancer', title: 'Load Balancer',
            subtitle: { de: 'Lastverteiler', en: 'Load Balancer' },
            desc: {
                de: 'Verteilt eingehenden Netzwerkverkehr auf mehrere Server, um Auslastung, Antwortzeit und Verfügbarkeit zu optimieren. Algorithmen: Round Robin, Least Connections, IP Hash, Weighted. Layer 4 (TCP/UDP) oder Layer 7 (HTTP/HTTPS). Ermöglicht Hochverfügbarkeit und horizontale Skalierung.',
                en: 'Distributes incoming network traffic across multiple servers to optimize load, response time and availability. Algorithms: Round Robin, Least Connections, IP Hash, Weighted. Layer 4 (TCP/UDP) or Layer 7 (HTTP/HTTPS). Enables high availability and horizontal scaling.',
            },
            cat: 'geraete', tags: ['server', 'hochverfügbarkeit', 'skalierung', 'round robin', 'layer4', 'layer7', 'reverse proxy'],
        },
        {
            id: 'modem', title: 'Modem',
            subtitle: 'Modulator/Demodulator',
            desc: {
                de: 'Wandelt digitale Signale in analoge um (Modulation) und umgekehrt (Demodulation). Ermöglicht Datenübertragung über Telefon-, Kabel- oder Glasfaserleitungen. DSL-Modem: ADSL/VDSL über Telefonleitung. Kabelmodem: DOCSIS über Koaxialkabel. Glasfasermodem (ONT): FTTH/GPON.',
                en: 'Converts digital signals to analog (modulation) and vice versa (demodulation). Enables data transmission over telephone, cable or fiber optic lines. DSL modem: ADSL/VDSL over telephone line. Cable modem: DOCSIS over coaxial cable. Fiber modem (ONT): FTTH/GPON.',
            },
            cat: 'geraete', tags: ['dsl', 'kabel', 'glasfaser', 'docsis', 'gpon', 'ont', 'ftth', 'analog', 'digital'],
        },
        {
            id: 'proxy', title: 'Proxy Server',
            subtitle: { de: 'Stellvertreter-Server', en: 'Proxy Server' },
            desc: {
                de: 'Vermittelt Anfragen zwischen Client und Zielserver. Forward Proxy: Client greift über Proxy auf das Internet zu (Caching, Filterung, Anonymität). Reverse Proxy: Schützt Backend-Server, terminiert TLS, verteilt Last. Transparente Proxys fangen Traffic ab, ohne dass der Client konfiguriert werden muss.',
                en: 'Mediates requests between client and target server. Forward proxy: client accesses the Internet through proxy (caching, filtering, anonymity). Reverse proxy: protects backend servers, terminates TLS, distributes load. Transparent proxies intercept traffic without client configuration.',
            },
            cat: 'geraete', tags: ['caching', 'filter', 'reverse proxy', 'forward proxy', 'transparent', 'tls termination'],
        },
        {
            id: 'gateway', title: 'Gateway',
            subtitle: { de: 'Netzwerk-Gateway', en: 'Network Gateway' },
            desc: {
                de: 'Verbindet Netzwerke mit unterschiedlichen Protokollen oder Architekturen. Kann auf allen OSI-Schichten arbeiten — übersetzt Datenformate und Protokolle. Beispiele: VoIP-Gateway (ISDN ↔ SIP), IoT-Gateway (Zigbee ↔ IP), E-Mail-Gateway (Spam-Filter). Im Heimnetz oft der Router als Default Gateway.',
                en: 'Connects networks with different protocols or architectures. Can operate at all OSI layers — translates data formats and protocols. Examples: VoIP gateway (ISDN ↔ SIP), IoT gateway (Zigbee ↔ IP), email gateway (spam filter). In home networks, the router often serves as default gateway.',
            },
            cat: 'geraete', tags: ['protokollwandler', 'voip', 'iot', 'default gateway', 'isdn', 'zigbee', 'übersetzer'],
        },

        // ===== Adressierung (13) =====
        {
            id: 'ipv4', title: 'IPv4', subtitle: 'Internet Protocol Version 4',
            desc: {
                de: '32-Bit-Adressierung mit ca. 4,3 Milliarden möglichen Adressen. Darstellung in Dotted Decimal: vier Oktette von 0-255 (z.B. 192.168.1.1). Adressen sind weltweit nahezu erschöpft — NAT und IPv6 als Lösungen. Header: 20-60 Bytes mit TTL, Protokoll, Quell- und Zieladresse.',
                en: '32-bit addressing with approximately 4.3 billion possible addresses. Displayed in dotted decimal: four octets from 0-255 (e.g. 192.168.1.1). Addresses are nearly exhausted worldwide — NAT and IPv6 as solutions. Header: 20-60 bytes with TTL, protocol, source and destination address.',
            },
            cat: 'adressierung', tags: ['ip', '32-bit', 'dotted decimal', 'oktett', 'header', 'ttl'],
        },
        {
            id: 'ipv6', title: 'IPv6', subtitle: 'Internet Protocol Version 6',
            desc: {
                de: '128-Bit-Adressierung mit 3,4 × 10³⁸ möglichen Adressen. Darstellung in Hexadezimal mit Doppelpunkten (z.B. 2001:0db8::1). Vereinfachter Header, integrierte IPsec-Unterstützung, kein NAT nötig. Autokonfiguration via SLAAC (Stateless Address Autoconfiguration). Dual-Stack ermöglicht parallelen Betrieb mit IPv4.',
                en: '128-bit addressing with 3.4 × 10³⁸ possible addresses. Displayed in hexadecimal with colons (e.g. 2001:0db8::1). Simplified header, integrated IPsec support, no NAT needed. Autoconfiguration via SLAAC (Stateless Address Autoconfiguration). Dual-stack enables parallel operation with IPv4.',
            },
            cat: 'adressierung', tags: ['ip', '128-bit', 'hexadezimal', 'slaac', 'dual-stack', 'header'],
        },
        {
            id: 'mac-adresse', title: 'MAC-Adresse', subtitle: 'Media Access Control Address',
            desc: {
                de: '48-Bit Hardware-Adresse, die jeder Netzwerkschnittstelle vom Hersteller zugewiesen wird. Darstellung: sechs Hexadezimal-Paare (z.B. AA:BB:CC:DD:EE:FF). Die ersten 3 Bytes identifizieren den Hersteller (OUI). Wird auf Schicht 2 für die lokale Zustellung von Frames verwendet. Kann per Software geändert werden (MAC Spoofing).',
                en: '48-bit hardware address assigned to each network interface by the manufacturer. Displayed as six hexadecimal pairs (e.g. AA:BB:CC:DD:EE:FF). The first 3 bytes identify the manufacturer (OUI). Used at Layer 2 for local frame delivery. Can be changed via software (MAC spoofing).',
            },
            cat: 'adressierung', tags: ['layer2', 'schicht2', 'hardware', 'oui', 'hexadezimal', 'frame', '48-bit', 'spoofing'],
        },
        {
            id: 'subnetting', title: 'Subnetting',
            subtitle: { de: 'Subnetze bilden', en: 'Subnet Division' },
            desc: {
                de: 'Aufteilung eines IP-Netzwerks in kleinere, logische Teilnetze. Durch Verschieben der Subnetzmaske werden Netz- und Hostanteil angepasst. Vorteile: effizientere Adressnutzung, Broadcast-Reduktion, Sicherheitssegmentierung. Beispiel: /24 (256 Adressen) in vier /26-Subnetze (je 64 Adressen).',
                en: 'Division of an IP network into smaller logical subnets. By shifting the subnet mask, network and host portions are adjusted. Benefits: more efficient address usage, broadcast reduction, security segmentation. Example: /24 (256 addresses) into four /26 subnets (64 addresses each).',
            },
            cat: 'adressierung', tags: ['subnetz', 'subnetzmaske', 'netzanteil', 'hostanteil', 'broadcast', 'segmentierung'],
        },
        {
            id: 'cidr', title: 'CIDR', subtitle: 'Classless Inter-Domain Routing',
            desc: {
                de: 'Ablösung der starren IP-Klassen (A/B/C) durch flexible Subnetzmasken beliebiger Länge. Die CIDR-Notation /24 bedeutet: 24 Bits Netzanteil, 8 Bits Hostanteil. Ermöglicht effizientere IP-Adressverteilung und Routen-Aggregation (Supernetting). Eingeführt 1993 durch RFC 1518/1519.',
                en: 'Replacement of rigid IP classes (A/B/C) with flexible subnet masks of any length. CIDR notation /24 means: 24 bits network portion, 8 bits host portion. Enables more efficient IP address distribution and route aggregation (supernetting). Introduced 1993 via RFC 1518/1519.',
            },
            cat: 'adressierung', tags: ['classless', 'prefix', 'supernetting', 'rfc1518', 'notation', 'klasse'],
        },
        {
            id: 'vlsm', title: 'VLSM', subtitle: 'Variable Length Subnet Masking',
            desc: {
                de: 'Ermöglicht unterschiedlich große Subnetze innerhalb eines Netzwerks. Im Gegensatz zu klassischem Subnetting (gleiche Maskenlänge) kann VLSM z.B. /30 für Punkt-zu-Punkt-Links und /24 für LANs verwenden. Maximiert die Adresseffizienz. Voraussetzung: Routing-Protokoll muss VLSM unterstützen (OSPF, EIGRP).',
                en: 'Enables differently sized subnets within a network. Unlike classic subnetting (same mask length), VLSM can use e.g. /30 for point-to-point links and /24 for LANs. Maximizes address efficiency. Prerequisite: routing protocol must support VLSM (OSPF, EIGRP).',
            },
            cat: 'adressierung', tags: ['subnetz', 'variabel', 'maskenlänge', 'punkt-zu-punkt', 'effizienz', 'ospf'],
        },
        {
            id: 'nat', title: 'NAT', subtitle: 'Network Address Translation',
            desc: {
                de: 'Übersetzt private IP-Adressen in öffentliche und umgekehrt. Ermöglicht vielen Geräten den Internetzugang über eine einzige öffentliche IP. Typen: Static NAT (1:1), Dynamic NAT (Pool), PAT/NAT Overload (viele:1 mit Ports). Verzögert die IPv4-Adresserschöpfung, bricht aber End-to-End-Prinzip.',
                en: 'Translates private IP addresses to public and vice versa. Allows many devices to access the Internet through a single public IP. Types: Static NAT (1:1), Dynamic NAT (pool), PAT/NAT Overload (many:1 with ports). Delays IPv4 address exhaustion but breaks end-to-end principle.',
            },
            cat: 'adressierung', tags: ['übersetzung', 'privat', 'öffentlich', 'overload', 'masquerading', 'internet'],
        },
        {
            id: 'pat', title: 'PAT', subtitle: 'Port Address Translation',
            desc: {
                de: 'Spezialform von NAT, bei der mehrere private IP-Adressen auf eine einzige öffentliche IP abgebildet werden — unterschieden durch Portnummern. Auch bekannt als NAT Overload oder Masquerading. Standard in Heimroutern. Jede ausgehende Verbindung erhält einen eindeutigen Quellport.',
                en: 'Special form of NAT where multiple private IP addresses are mapped to a single public IP — distinguished by port numbers. Also known as NAT Overload or Masquerading. Standard in home routers. Each outgoing connection receives a unique source port.',
            },
            cat: 'adressierung', tags: ['nat', 'port', 'overload', 'masquerading', 'heimrouter', 'quellport'],
        },
        {
            id: 'dnat', title: 'DNAT', subtitle: 'Destination NAT (Port-Forwarding)',
            desc: {
                de: 'Ändert die Ziel-IP-Adresse (und optional den Ziel-Port) eingehender Pakete. Ermöglicht den Zugriff auf interne Server aus dem Internet (Port-Forwarding). Beispiel: Port 443 am Router wird an den internen Webserver 192.168.1.10:443 weitergeleitet. Gegenstück zu SNAT (Source NAT), das die Quelladresse ändert. Wird in Firewalls und Routern über iptables/nftables oder NAT-Regeln konfiguriert.',
                en: 'Changes the destination IP address (and optionally the destination port) of incoming packets. Enables access to internal servers from the Internet (port forwarding). Example: port 443 on the router is forwarded to internal web server 192.168.1.10:443. Counterpart to SNAT (Source NAT), which changes the source address. Configured in firewalls and routers via iptables/nftables or NAT rules.',
            },
            cat: 'adressierung', tags: ['nat', 'port-forwarding', 'zieladresse', 'snat', 'iptables', 'nftables', 'eingehend', 'weiterleitung'],
        },
        {
            id: 'private-ip', title: 'Private IPs',
            subtitle: { de: 'Private IP-Bereiche (RFC 1918)', en: 'Private IP Ranges (RFC 1918)' },
            desc: {
                de: 'Drei reservierte Adressbereiche für interne Netzwerke: 10.0.0.0/8 (Klasse A, 16,7 Mio. Adressen), 172.16.0.0/12 (Klasse B, 1 Mio. Adressen), 192.168.0.0/16 (Klasse C, 65.536 Adressen). Nicht im Internet routbar — benötigen NAT für Internetzugang. Frei nutzbar ohne Registrierung.',
                en: 'Three reserved address ranges for internal networks: 10.0.0.0/8 (Class A, 16.7M addresses), 172.16.0.0/12 (Class B, 1M addresses), 192.168.0.0/16 (Class C, 65,536 addresses). Not routable on the Internet — require NAT for Internet access. Freely usable without registration.',
            },
            cat: 'adressierung', tags: ['rfc1918', '10.0.0.0', '172.16.0.0', '192.168.0.0', 'intern', 'privat', 'klasse'],
        },
        {
            id: 'loopback', title: 'Loopback',
            subtitle: { de: 'Loopback-Adresse (127.0.0.1)', en: 'Loopback Address (127.0.0.1)' },
            desc: {
                de: 'Spezielle Adresse, die immer auf den eigenen Host verweist. IPv4: 127.0.0.0/8 (meist 127.0.0.1), IPv6: ::1. Traffic verlässt nie die Netzwerkschnittstelle — wird intern verarbeitet. Dient zum Testen von Netzwerk-Software und lokalen Diensten. Auch als "localhost" bekannt.',
                en: 'Special address that always points to the local host. IPv4: 127.0.0.0/8 (usually 127.0.0.1), IPv6: ::1. Traffic never leaves the network interface — processed internally. Used for testing network software and local services. Also known as "localhost".',
            },
            cat: 'adressierung', tags: ['127.0.0.1', 'localhost', '::1', 'test', 'lokal', 'selbstreferenz'],
        },
        {
            id: 'link-local', title: 'Link-Local',
            subtitle: { de: 'Automatische Adressierung', en: 'Automatic Addressing' },
            desc: {
                de: 'Automatisch zugewiesene Adressen für die Kommunikation im lokalen Segment ohne DHCP. IPv4: 169.254.0.0/16 (APIPA — Automatic Private IP Addressing). IPv6: fe80::/10 (immer vorhanden). Nicht routbar — nur im direkten Link gültig. Wichtig für IPv6-Nachbarschaftserkennung (NDP).',
                en: 'Automatically assigned addresses for communication in the local segment without DHCP. IPv4: 169.254.0.0/16 (APIPA — Automatic Private IP Addressing). IPv6: fe80::/10 (always present). Not routable — only valid on the direct link. Important for IPv6 Neighbor Discovery (NDP).',
            },
            cat: 'adressierung', tags: ['169.254', 'fe80', 'apipa', 'automatisch', 'ndp', 'lokal', 'dhcp'],
        },
        {
            id: 'cast-typen', title: 'Unicast / Multicast / Broadcast',
            subtitle: { de: 'Adressierungsarten', en: 'Addressing Types' },
            desc: {
                de: 'Unicast: Kommunikation von einem Sender zu einem Empfänger (1:1). Multicast: ein Sender an eine Gruppe von Empfängern (1:n, z.B. 224.0.0.0/4). Broadcast: ein Sender an alle im Netzwerk (1:alle, z.B. 255.255.255.255). IPv6 kennt kein Broadcast — stattdessen Anycast (nächster Empfänger einer Gruppe).',
                en: 'Unicast: communication from one sender to one receiver (1:1). Multicast: one sender to a group of receivers (1:n, e.g. 224.0.0.0/4). Broadcast: one sender to all on the network (1:all, e.g. 255.255.255.255). IPv6 has no broadcast — uses anycast instead (nearest receiver in a group).',
            },
            cat: 'adressierung', tags: ['unicast', 'multicast', 'broadcast', 'anycast', '224.0.0.0', '255.255.255.255', 'gruppe'],
        },

        // ===== Sicherheit (14) =====
        {
            id: 'firewall', title: 'Firewall',
            subtitle: { de: 'Paketfilter und Zustandsüberwachung', en: 'Packet Filter and Stateful Inspection' },
            desc: {
                de: 'Sicherheitssystem, das Netzwerkverkehr anhand von Regeln erlaubt oder blockiert. Paketfilter: prüft IP/Port (Schicht 3/4). Stateful Firewall: verfolgt Verbindungszustände. Application Firewall: analysiert Inhalte (Schicht 7). Regelwerk: Whitelist (alles verboten außer erlaubtem) oder Blacklist-Ansatz.',
                en: 'Security system that allows or blocks network traffic based on rules. Packet filter: checks IP/port (Layer 3/4). Stateful firewall: tracks connection states. Application firewall: analyzes content (Layer 7). Rule set: whitelist (everything forbidden except allowed) or blacklist approach.',
            },
            cat: 'sicherheit', tags: ['paketfilter', 'stateful', 'regeln', 'whitelist', 'blacklist', 'acl', 'netzwerksicherheit'],
        },
        {
            id: 'vpn', title: 'VPN', subtitle: 'Virtual Private Network',
            desc: {
                de: 'Verschlüsselter Tunnel über ein öffentliches Netzwerk (Internet), der zwei Endpunkte so verbindet, als wären sie im selben lokalen Netz. Typen: Site-to-Site (Standortvernetzung) und Remote Access (Fernzugriff). Protokolle: IPsec, OpenVPN, WireGuard, L2TP. Schützt vor Abhören und Manipulation.',
                en: 'Encrypted tunnel over a public network (Internet) that connects two endpoints as if they were on the same local network. Types: site-to-site (connecting locations) and remote access. Protocols: IPsec, OpenVPN, WireGuard, L2TP. Protects against eavesdropping and tampering.',
            },
            cat: 'sicherheit', tags: ['tunnel', 'verschlüsselung', 'ipsec', 'openvpn', 'wireguard', 'remote access', 'site-to-site'],
        },
        {
            id: 'ids', title: 'IDS', subtitle: 'Intrusion Detection System',
            desc: {
                de: 'Überwacht Netzwerkverkehr oder Systemaktivitäten auf verdächtige Muster und Angriffe. Erkennt Bedrohungen und generiert Alarme — greift aber nicht aktiv ein. Typen: NIDS (netzwerkbasiert) und HIDS (hostbasiert). Erkennung über Signaturen (bekannte Angriffe) oder Anomalien (ungewöhnliches Verhalten).',
                en: 'Monitors network traffic or system activities for suspicious patterns and attacks. Detects threats and generates alerts — but does not actively intervene. Types: NIDS (network-based) and HIDS (host-based). Detection via signatures (known attacks) or anomalies (unusual behavior).',
            },
            cat: 'sicherheit', tags: ['intrusion', 'erkennung', 'alarm', 'nids', 'hids', 'signatur', 'anomalie', 'überwachung'],
        },
        {
            id: 'ips', title: 'IPS', subtitle: 'Intrusion Prevention System',
            desc: {
                de: 'Erweitert IDS um aktive Abwehrmaßnahmen: erkennt Angriffe und blockiert sie automatisch in Echtzeit. Sitzt inline im Netzwerkpfad (nicht nur passiv mitlesend). Kann verdächtige Pakete verwerfen, Verbindungen beenden oder Firewall-Regeln dynamisch anpassen. Risiko: False Positives können legitimen Traffic blockieren.',
                en: 'Extends IDS with active defense measures: detects attacks and blocks them automatically in real-time. Sits inline in the network path (not just passively monitoring). Can drop suspicious packets, terminate connections or dynamically adjust firewall rules. Risk: false positives can block legitimate traffic.',
            },
            cat: 'sicherheit', tags: ['intrusion', 'prävention', 'inline', 'blockieren', 'echtzeit', 'false positive'],
        },
        {
            id: 'ssl-tls', title: 'SSL / TLS',
            subtitle: { de: 'Transportverschlüsselung', en: 'Transport Encryption' },
            desc: {
                de: 'SSL (Secure Sockets Layer) ist der Vorläufer von TLS — heute veraltet und unsicher. TLS 1.2 und 1.3 sind die aktuellen Standards für verschlüsselte Kommunikation. Schützt Daten in Transit vor Abhören und Manipulation. Verwendet asymmetrische Kryptografie für Schlüsselaustausch und symmetrische für Daten.',
                en: 'SSL (Secure Sockets Layer) is the predecessor of TLS — now deprecated and insecure. TLS 1.2 and 1.3 are the current standards for encrypted communication. Protects data in transit from eavesdropping and tampering. Uses asymmetric cryptography for key exchange and symmetric for data.',
            },
            cat: 'sicherheit', tags: ['verschlüsselung', 'tls', 'ssl', 'zertifikat', 'handshake', 'kryptografie', 'transport'],
        },
        {
            id: 'wpa2', title: 'WPA2', subtitle: 'Wi-Fi Protected Access 2',
            desc: {
                de: 'Standard-Sicherheitsprotokoll für WLAN-Netzwerke seit 2004. Verwendet AES-CCMP-Verschlüsselung. Modi: Personal (Pre-Shared Key/Passwort) und Enterprise (802.1X/RADIUS). Schwachstelle: KRACK-Angriff (2017) auf den 4-Way-Handshake. Wird zunehmend durch WPA3 ergänzt.',
                en: 'Standard security protocol for Wi-Fi networks since 2004. Uses AES-CCMP encryption. Modes: Personal (Pre-Shared Key/password) and Enterprise (802.1X/RADIUS). Vulnerability: KRACK attack (2017) on the 4-way handshake. Increasingly supplemented by WPA3.',
            },
            cat: 'sicherheit', tags: ['wlan', 'wifi', 'aes', 'ccmp', 'psk', 'enterprise', 'krack', '802.11i'],
        },
        {
            id: 'wpa3', title: 'WPA3', subtitle: 'Wi-Fi Protected Access 3',
            desc: {
                de: 'Nachfolger von WPA2 (seit 2018). Verwendet SAE (Simultaneous Authentication of Equals) statt PSK — schützt gegen Offline-Wörterbuch-Angriffe. 192-Bit-Sicherheitssuite im Enterprise-Modus. OWE (Opportunistic Wireless Encryption) verschlüsselt auch offene Netzwerke. Forward Secrecy garantiert.',
                en: 'Successor to WPA2 (since 2018). Uses SAE (Simultaneous Authentication of Equals) instead of PSK — protects against offline dictionary attacks. 192-bit security suite in Enterprise mode. OWE (Opportunistic Wireless Encryption) encrypts open networks too. Forward secrecy guaranteed.',
            },
            cat: 'sicherheit', tags: ['wlan', 'wifi', 'sae', 'owe', 'forward secrecy', 'verschlüsselung', '192-bit'],
        },
        {
            id: '802.1x', title: '802.1X',
            subtitle: { de: 'Port-basierte Netzwerkzugangskontrolle', en: 'Port-based Network Access Control' },
            desc: {
                de: 'IEEE-Standard für die Authentifizierung an Netzwerkports (LAN und WLAN). Drei Rollen: Supplicant (Client), Authenticator (Switch/AP), Authentication Server (RADIUS). Port bleibt gesperrt, bis der Client sich erfolgreich authentifiziert. Unterstützt EAP-Methoden: EAP-TLS, PEAP, EAP-TTLS.',
                en: 'IEEE standard for authentication on network ports (LAN and WLAN). Three roles: Supplicant (client), Authenticator (switch/AP), Authentication Server (RADIUS). Port remains locked until the client successfully authenticates. Supports EAP methods: EAP-TLS, PEAP, EAP-TTLS.',
            },
            cat: 'sicherheit', tags: ['authentifizierung', 'port', 'radius', 'eap', 'supplicant', 'nac', 'zugangskontrolle'],
        },
        {
            id: 'radius', title: 'RADIUS', subtitle: 'Remote Authentication Dial-In User Service',
            desc: {
                de: 'AAA-Protokoll (Authentication, Authorization, Accounting) für zentralisierte Zugangskontolle. Authentifiziert Benutzer gegenüber einer zentralen Datenbank. Wird von 802.1X, VPN-Gateways und WLAN-Controllern verwendet. Port 1812 (Auth) und 1813 (Accounting). Alternative: TACACS+ (Cisco, TCP-basiert).',
                en: 'AAA protocol (Authentication, Authorization, Accounting) for centralized access control. Authenticates users against a central database. Used by 802.1X, VPN gateways and WLAN controllers. Port 1812 (Auth) and 1813 (Accounting). Alternative: TACACS+ (Cisco, TCP-based).',
            },
            cat: 'sicherheit', tags: ['aaa', 'authentifizierung', 'autorisierung', 'accounting', 'port1812', 'tacacs', 'zentral'],
        },
        {
            id: 'acl', title: 'ACL', subtitle: 'Access Control List',
            desc: {
                de: 'Geordnete Liste von Regeln, die den Zugriff auf Netzwerkressourcen erlauben oder verweigern. Standard-ACL: filtert nur nach Quell-IP. Extended ACL: filtert nach Quell/Ziel-IP, Protokoll und Port. Werden auf Router- und Switch-Interfaces angewendet (inbound/outbound). Verarbeitung: First Match wins.',
                en: 'Ordered list of rules that allow or deny access to network resources. Standard ACL: filters by source IP only. Extended ACL: filters by source/destination IP, protocol and port. Applied to router and switch interfaces (inbound/outbound). Processing: first match wins.',
            },
            cat: 'sicherheit', tags: ['regel', 'filter', 'permit', 'deny', 'standard', 'extended', 'interface', 'first match'],
        },
        {
            id: 'dmz', title: 'DMZ',
            subtitle: { de: 'Demilitarisierte Zone', en: 'Demilitarized Zone' },
            desc: {
                de: 'Separates Netzwerksegment zwischen internem LAN und Internet. Enthält öffentlich erreichbare Dienste (Webserver, Mailserver, DNS) und schützt gleichzeitig das interne Netz. Typisch: zwei Firewalls — eine zum Internet, eine zum LAN. Bei Kompromittierung eines DMZ-Servers bleibt das interne Netz geschützt.',
                en: 'Separate network segment between internal LAN and Internet. Contains publicly accessible services (web server, mail server, DNS) while protecting the internal network. Typical: two firewalls — one to the Internet, one to the LAN. If a DMZ server is compromised, the internal network remains protected.',
            },
            cat: 'sicherheit', tags: ['netzwerksegment', 'webserver', 'mailserver', 'firewall', 'öffentlich', 'schutz'],
        },
        {
            id: 'zero-trust', title: 'Zero Trust',
            subtitle: { de: 'Zero-Trust-Sicherheitsmodell', en: 'Zero Trust Security Model' },
            desc: {
                de: 'Sicherheitskonzept: "Vertraue niemandem, verifiziere alles." Kein implizites Vertrauen basierend auf Netzwerkposition. Jeder Zugriff wird authentifiziert, autorisiert und verschlüsselt — egal ob intern oder extern. Prinzipien: Least Privilege, Mikrosegmentierung, kontinuierliche Überprüfung. Ersetzt klassische Perimeter-Sicherheit.',
                en: 'Security concept: "Trust no one, verify everything." No implicit trust based on network position. Every access is authenticated, authorized and encrypted — regardless of internal or external origin. Principles: Least Privilege, microsegmentation, continuous verification. Replaces classic perimeter security.',
            },
            cat: 'sicherheit', tags: ['vertrauen', 'least privilege', 'mikrosegmentierung', 'perimeter', 'identität', 'modern'],
        },
        {
            id: 'pki', title: 'PKI', subtitle: 'Public Key Infrastructure',
            desc: {
                de: 'Framework für die Verwaltung digitaler Zertifikate und asymmetrischer Schlüssel. Komponenten: Certificate Authority (CA), Registration Authority (RA), Zertifikatsspeicher, CRL/OCSP (Sperrlisten). Ermöglicht sichere Identifizierung und Verschlüsselung in TLS, E-Mail-Signierung (S/MIME), Code-Signierung und VPN.',
                en: 'Framework for managing digital certificates and asymmetric keys. Components: Certificate Authority (CA), Registration Authority (RA), certificate store, CRL/OCSP (revocation lists). Enables secure identification and encryption in TLS, email signing (S/MIME), code signing and VPN.',
            },
            cat: 'sicherheit', tags: ['zertifikat', 'ca', 'asymmetrisch', 'public key', 'private key', 'crl', 'ocsp', 'x509'],
        },
        {
            id: 'mfa', title: 'MFA',
            subtitle: { de: 'Multi-Faktor-Authentifizierung', en: 'Multi-Factor Authentication' },
            desc: {
                de: 'Erfordert mindestens zwei verschiedene Authentifizierungsfaktoren: Wissen (Passwort, PIN), Besitz (Smartphone, Token, Smartcard) und/oder Inhärenz (Fingerabdruck, Gesicht). Schützt gegen gestohlene Passwörter. Methoden: TOTP (zeitbasierte Einmalcodes), FIDO2/WebAuthn (passwortlos), SMS (unsicher), Push-Benachrichtigungen.',
                en: 'Requires at least two different authentication factors: knowledge (password, PIN), possession (smartphone, token, smart card) and/or inherence (fingerprint, face). Protects against stolen passwords. Methods: TOTP (time-based one-time codes), FIDO2/WebAuthn (passwordless), SMS (insecure), push notifications.',
            },
            cat: 'sicherheit', tags: ['authentifizierung', 'passwort', 'totp', 'fido2', 'webauthn', 'token', 'zwei-faktor', '2fa'],
        },

        // ===== E-Mail (12) =====
        {
            id: 'mx-record', title: 'MX Record', subtitle: 'Mail Exchange DNS-Eintrag',
            desc: {
                de: 'DNS-Eintrag vom Typ MX, der festlegt, welcher Mailserver f\u00fcr den E-Mail-Empfang einer Domain zust\u00e4ndig ist. Enth\u00e4lt einen Priorit\u00e4tswert (niedrig = bevorzugt) und den Hostnamen des Mailservers. Beispiel: example.com MX 10 mail.example.com. Mehrere MX-Records erm\u00f6glichen Failover und Lastverteilung.',
                en: 'DNS record of type MX that specifies which mail server is responsible for receiving email for a domain. Contains a priority value (lower = preferred) and the mail server hostname. Example: example.com MX 10 mail.example.com. Multiple MX records enable failover and load balancing.',
            },
            cat: 'email', tags: ['dns', 'mailserver', 'priorit\u00e4t', 'domain', 'empfang', 'failover'],
        },
        {
            id: 'spf', title: 'SPF', subtitle: 'Sender Policy Framework',
            desc: {
                de: 'DNS-TXT-Eintrag, der festlegt, welche IP-Adressen und Server berechtigt sind, E-Mails im Namen einer Domain zu versenden. Empfangende Mailserver pr\u00fcfen den SPF-Record und k\u00f6nnen nicht autorisierte Absender ablehnen. Syntax: "v=spf1 ip4:203.0.113.0/24 include:_spf.google.com -all". Mechanismen: ip4, ip6, include, a, mx. Qualifier: + (Pass), - (Fail), ~ (Softfail), ? (Neutral).',
                en: 'DNS TXT record that specifies which IP addresses and servers are authorized to send emails on behalf of a domain. Receiving mail servers check the SPF record and can reject unauthorized senders. Syntax: "v=spf1 ip4:203.0.113.0/24 include:_spf.google.com -all". Mechanisms: ip4, ip6, include, a, mx. Qualifiers: + (Pass), - (Fail), ~ (Softfail), ? (Neutral).',
            },
            cat: 'email', tags: ['dns', 'txt-record', 'authentifizierung', 'absender', 'autorisierung', 'anti-spoofing'],
        },
        {
            id: 'dkim', title: 'DKIM', subtitle: 'DomainKeys Identified Mail',
            desc: {
                de: 'E-Mail-Authentifizierungsverfahren, bei dem der sendende Mailserver eine digitale Signatur in den E-Mail-Header einf\u00fcgt (DKIM-Signature). Der \u00f6ffentliche Schl\u00fcssel wird als DNS-TXT-Record ver\u00f6ffentlicht (selector._domainkey.example.com). Empf\u00e4nger k\u00f6nnen damit pr\u00fcfen, dass die Nachricht tats\u00e4chlich vom angegebenen Absender stammt und unterwegs nicht ver\u00e4ndert wurde.',
                en: 'Email authentication method where the sending mail server inserts a digital signature into the email header (DKIM-Signature). The public key is published as a DNS TXT record (selector._domainkey.example.com). Recipients can verify that the message actually came from the specified sender and was not modified in transit.',
            },
            cat: 'email', tags: ['signatur', 'kryptografie', 'dns', 'header', 'public key', 'selector', 'integrit\u00e4t'],
        },
        {
            id: 'dmarc', title: 'DMARC', subtitle: 'Domain-based Message Authentication, Reporting & Conformance',
            desc: {
                de: 'Richtlinie als DNS-TXT-Record (_dmarc.example.com), die SPF und DKIM kombiniert und festlegt, wie empfangende Server mit nicht authentifizierten E-Mails umgehen sollen. Policies: none (nur beobachten), quarantine (Spam-Ordner), reject (ablehnen). Erm\u00f6glicht Reporting: Empf\u00e4nger senden Aggregate- und Forensic-Reports an den Domain-Inhaber.',
                en: 'Policy as DNS TXT record (_dmarc.example.com) that combines SPF and DKIM and specifies how receiving servers should handle unauthenticated emails. Policies: none (monitor only), quarantine (spam folder), reject. Enables reporting: recipients send aggregate and forensic reports to the domain owner.',
            },
            cat: 'email', tags: ['policy', 'spf', 'dkim', 'reporting', 'authentifizierung', 'reject', 'quarantine'],
        },
        {
            id: 'email-smtp', title: 'SMTP',
            subtitle: { de: 'Simple Mail Transfer Protocol (E-Mail-Versand)', en: 'Simple Mail Transfer Protocol (Email Sending)' },
            desc: {
                de: 'Protokoll zum Versenden von E-Mails zwischen Mailservern (Port 25) und vom Client zum Server (Port 587 mit STARTTLS, Port 465 mit implizitem TLS). Arbeitet nach dem Store-and-Forward-Prinzip: jeder Server in der Kette nimmt die Mail an und leitet sie weiter. Befehle: HELO/EHLO, MAIL FROM, RCPT TO, DATA, QUIT.',
                en: 'Protocol for sending emails between mail servers (port 25) and from client to server (port 587 with STARTTLS, port 465 with implicit TLS). Works on the store-and-forward principle: each server in the chain accepts the mail and forwards it. Commands: HELO/EHLO, MAIL FROM, RCPT TO, DATA, QUIT.',
            },
            cat: 'email', tags: ['port25', 'port587', 'port465', 'versand', 'relay', 'store-and-forward', 'mta'],
        },
        {
            id: 'email-imap', title: 'IMAP',
            subtitle: { de: 'Internet Message Access Protocol (E-Mail-Abruf)', en: 'Internet Message Access Protocol (Email Retrieval)' },
            desc: {
                de: 'Protokoll zum Abrufen und Verwalten von E-Mails, bei dem Nachrichten auf dem Server verbleiben und synchronisiert werden. Ideal f\u00fcr den Zugriff von mehreren Ger\u00e4ten. Unterst\u00fctzt Ordnerstruktur, Flags (gelesen/ungelesen), serverseitige Suche und IDLE-Push. Port 143 (STARTTLS) und Port 993 (IMAPS mit TLS).',
                en: 'Protocol for retrieving and managing emails where messages remain on the server and are synchronized. Ideal for multi-device access. Supports folder structure, flags (read/unread), server-side search and IDLE push. Port 143 (STARTTLS) and port 993 (IMAPS with TLS).',
            },
            cat: 'email', tags: ['port143', 'port993', 'abruf', 'synchronisation', 'ordner', 'idle', 'push'],
        },
        {
            id: 'email-pop3', title: 'POP3',
            subtitle: { de: 'Post Office Protocol Version 3 (E-Mail-Abholen)', en: 'Post Office Protocol Version 3 (Email Download)' },
            desc: {
                de: 'Einfaches Protokoll zum Herunterladen von E-Mails vom Server. Standardm\u00e4\u00dfig werden Nachrichten nach dem Download vom Server gel\u00f6scht \u2014 nicht f\u00fcr Multi-Ger\u00e4te-Zugriff geeignet. Port 110 (unverschl\u00fcsselt) und Port 995 (POP3S mit TLS). Wird zunehmend durch IMAP abgel\u00f6st, aber noch in einfachen Szenarien verbreitet.',
                en: 'Simple protocol for downloading emails from the server. By default, messages are deleted from the server after download \u2014 not suitable for multi-device access. Port 110 (unencrypted) and port 995 (POP3S with TLS). Increasingly replaced by IMAP, but still common in simple scenarios.',
            },
            cat: 'email', tags: ['port110', 'port995', 'download', 'l\u00f6schen', 'einfach', 'offline'],
        },
        {
            id: 'starttls', title: 'STARTTLS',
            subtitle: { de: 'Opportunistische TLS-Verschl\u00fcsselung', en: 'Opportunistic TLS Encryption' },
            desc: {
                de: 'Erweiterungsbefehl, der eine bestehende unverschl\u00fcsselte Verbindung nachtr\u00e4glich auf TLS hochstuft (Upgrade). Wird bei SMTP (Port 587), IMAP (Port 143) und POP3 (Port 110) eingesetzt. Im Gegensatz zu implizitem TLS (eigener Port) startet die Verbindung zun\u00e4chst im Klartext. Risiko: Anf\u00e4llig f\u00fcr Downgrade-Angriffe, wenn nicht erzwungen (DANE/MTA-STS).',
                en: 'Extension command that upgrades an existing unencrypted connection to TLS. Used with SMTP (port 587), IMAP (port 143) and POP3 (port 110). Unlike implicit TLS (dedicated port), the connection initially starts in plaintext. Risk: vulnerable to downgrade attacks if not enforced (DANE/MTA-STS).',
            },
            cat: 'email', tags: ['tls', 'verschl\u00fcsselung', 'upgrade', 'smtp', 'imap', 'dane', 'mta-sts'],
        },
        {
            id: 'email-header-wiki', title: 'E-Mail-Header',
            subtitle: { de: 'Technische Metadaten einer E-Mail', en: 'Technical Email Metadata' },
            desc: {
                de: 'Versteckte Kopfzeilen einer E-Mail mit technischen Informationen zum Routing und zur Authentifizierung. Wichtige Felder: Received (Routing-Pfad, von unten nach oben lesen), From/To/Subject, Date, Message-ID, Return-Path, Authentication-Results (SPF/DKIM/DMARC-Ergebnis). N\u00fctzlich f\u00fcr Spam-Analyse und Zustellungsprobleme.',
                en: 'Hidden header lines of an email containing technical routing and authentication information. Important fields: Received (routing path, read bottom to top), From/To/Subject, Date, Message-ID, Return-Path, Authentication-Results (SPF/DKIM/DMARC result). Useful for spam analysis and delivery issues.',
            },
            cat: 'email', tags: ['received', 'routing', 'from', 'message-id', 'authentication-results', 'analyse', 'metadaten'],
        },
        {
            id: 'spam-filter', title: 'Spam-Filter',
            subtitle: { de: 'Unerw\u00fcnschte E-Mail-Erkennung', en: 'Unwanted Email Detection' },
            desc: {
                de: 'Systeme zur automatischen Erkennung und Filterung unerw\u00fcnschter E-Mails. Methoden: DNS-Blacklists (RBL/DNSBL), Bayesian-Filter (statistische Textanalyse), Header-Analyse, SPF/DKIM/DMARC-Pr\u00fcfung, Greylisting (tempor\u00e4re Ablehnung), Content-Filter und Machine Learning. SpamAssassin und rspamd sind verbreitete Open-Source-L\u00f6sungen.',
                en: 'Systems for automatic detection and filtering of unwanted emails. Methods: DNS blacklists (RBL/DNSBL), Bayesian filter (statistical text analysis), header analysis, SPF/DKIM/DMARC checking, greylisting (temporary rejection), content filter and machine learning. SpamAssassin and rspamd are popular open-source solutions.',
            },
            cat: 'email', tags: ['blacklist', 'rbl', 'bayesian', 'greylisting', 'spamassassin', 'rspamd', 'content-filter'],
        },
        {
            id: 'ptr-record', title: 'PTR Record', subtitle: 'Reverse-DNS-Eintrag',
            desc: {
                de: 'DNS-Eintrag f\u00fcr Reverse-Lookups: ordnet einer IP-Adresse einen Hostnamen zu (Gegenst\u00fcck zum A/AAAA-Record). Wird in der in-addr.arpa-Zone (IPv4) bzw. ip6.arpa-Zone (IPv6) konfiguriert. Kritisch f\u00fcr Mailserver: Viele Empf\u00e4nger pr\u00fcfen, ob der PTR-Record des sendenden Servers mit dem HELO-Hostnamen \u00fcbereinstimmt. Fehlt der Eintrag, wird die Mail oft als Spam eingestuft.',
                en: 'DNS record for reverse lookups: maps an IP address to a hostname (counterpart to A/AAAA record). Configured in the in-addr.arpa zone (IPv4) or ip6.arpa zone (IPv6). Critical for mail servers: many recipients check whether the sending server\'s PTR record matches the HELO hostname. If missing, mail is often classified as spam.',
            },
            cat: 'email', tags: ['reverse dns', 'rdns', 'in-addr.arpa', 'mailserver', 'reputation', 'helo'],
        },
        {
            id: 'bounce-ndr', title: 'Bounce / NDR', subtitle: 'Non-Delivery Report',
            desc: {
                de: 'Automatische Benachrichtigung, wenn eine E-Mail nicht zugestellt werden kann. Hard-Bounce: permanenter Fehler (Empf\u00e4nger existiert nicht, Domain ung\u00fcltig). Soft-Bounce: tempor\u00e4rer Fehler (Postfach voll, Server \u00fcberlastet). DSN-Statuscodes: 5.x.x (permanent), 4.x.x (tempor\u00e4r). Hohe Bounce-Raten schaden der Sender-Reputation und k\u00f6nnen zu Blacklisting f\u00fchren.',
                en: 'Automatic notification when an email cannot be delivered. Hard bounce: permanent error (recipient does not exist, domain invalid). Soft bounce: temporary error (mailbox full, server overloaded). DSN status codes: 5.x.x (permanent), 4.x.x (temporary). High bounce rates harm sender reputation and can lead to blacklisting.',
            },
            cat: 'email', tags: ['hard-bounce', 'soft-bounce', 'dsn', 'zustellung', 'fehler', 'reputation', 'blacklist'],
        },
    ];

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card wiki-input-card">
            <label for="wiki-search">${t('wiki.searchLabel')}</label>
            <div class="wiki-input-row">
                <input type="text" id="wiki-search"
                       placeholder="${t('wiki.searchPlaceholder')}"
                       autocomplete="off" spellcheck="false">
            </div>
            <label class="wiki-cat-label">${t('wiki.catLabel')}</label>
            <div class="wiki-cat-chips" id="wiki-cat-chips">
                ${Object.entries(CAT_KEYS).map(([key, cat]) =>
                    `<span class="chip wiki-cat-chip${key === 'all' ? ' active' : ''}" data-cat="${key}" data-color="${cat.color}">${t(cat.tKey)}</span>`
                ).join('')}
            </div>
        </section>

        <section class="card wiki-result-card" id="wiki-result-card">
            <div class="wiki-result-header">
                <h3>${t('wiki.title')}</h3>
                <span class="wiki-count" id="wiki-count">${WIKI_DATA.length} ${t('wiki.entries', { n: WIKI_DATA.length }).replace(/^\d+\s*/, '')}</span>
            </div>
            <div class="wiki-content-area">
                <div class="wiki-list" id="wiki-list"></div>
                <div class="wiki-detail-panel" id="wiki-detail-panel">
                    <div class="wiki-detail-empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        <p>${t('wiki.selectEntry')}</p>
                    </div>
                </div>
            </div>
        </section>
    `;

    // --- DOM References ---
    const searchInput = document.getElementById('wiki-search');
    const catChips = document.querySelectorAll('.wiki-cat-chip');
    const wikiList = document.getElementById('wiki-list');
    const wikiCount = document.getElementById('wiki-count');
    const detailPanel = document.getElementById('wiki-detail-panel');

    let selectedCat = 'all';
    let expandedId = null;

    // Check if desktop layout (detail panel visible)
    function isDesktop() {
        return window.matchMedia('(min-width: 768px)').matches;
    }

    // --- Cable SVG Generator ---
    function generateCableSVG(entry) {
        if (!entry.cableType) return '';
        const c = entry.cableColor || '#6b7280';

        if (entry.cableType === 'copper') {
            // Realistisches aufgeschnittenes Kupferkabel mit verdrillten Aderpaaren
            const pairColors = [
                ['#f97316','#fed7aa'],
                ['#22c55e','#bbf7d0'],
                ['#3b82f6','#bfdbfe'],
                ['#92400e','#fde68a'],
            ];
            let pairs = '';
            const pairY = [22, 38, 54, 70];
            pairColors.forEach((pc, i) => {
                const y = pairY[i];
                const a1 = `M90,${y}C100,${y-4} 108,${y+4} 116,${y-4}C124,${y+4} 132,${y-4} 140,${y+4}C148,${y-4} 156,${y+4} 164,${y}`;
                const a2 = `M90,${y}C100,${y+4} 108,${y-4} 116,${y+4}C124,${y-4} 132,${y+4} 140,${y-4}C148,${y+4} 156,${y-4} 164,${y}`;
                pairs += `<path d="${a1}" fill="none" stroke="${pc[1]}" stroke-width="3.5" stroke-linecap="round"/>`;
                pairs += `<path d="${a2}" fill="none" stroke="${pc[0]}" stroke-width="3.5" stroke-linecap="round"/>`;
            });
            return `<svg viewBox="0 0 200 92" class="wiki-cable-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="csheath-${entry.id}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${c}" stop-opacity="0.85"/>
                        <stop offset="50%" stop-color="${c}"/>
                        <stop offset="100%" stop-color="${c}" stop-opacity="0.7"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="6" width="88" height="80" rx="10" fill="url(#csheath-${entry.id})"/>
                <rect x="4" y="8" width="30" height="76" rx="8" fill="${c}" opacity="0.15"/>
                <path d="M88,6 C92,10 90,18 93,26 C89,34 93,42 90,50 C93,58 89,66 92,74 C90,80 92,86 88,86" fill="none" stroke="${c}" stroke-width="2" opacity="0.7"/>
                ${pairs}
                <rect x="8" y="10" width="12" height="72" rx="6" fill="#fff" opacity="0.10"/>
            </svg>`;
        }

        if (entry.cableType === 'fiber') {
            const fiberShades = [c, c, c, c];
            let fibers = '';
            const fiberY = [30, 40, 50, 60];
            fiberY.forEach((y, i) => {
                const curve = `M82,${46 + (i-1.5)*3} C100,${46 + (i-1.5)*3} 110,${y} 132,${y}`;
                fibers += `<path d="${curve}" fill="none" stroke="${fiberShades[i]}" stroke-width="2" stroke-linecap="round" opacity="0.9"/>`;
                fibers += `<path d="${curve}" fill="none" stroke="#fff" stroke-width="0.5" stroke-linecap="round" opacity="0.3"/>`;
            });
            return `<svg viewBox="0 0 200 92" class="wiki-cable-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fsheath-${entry.id}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${c}" stop-opacity="0.8"/>
                        <stop offset="50%" stop-color="${c}"/>
                        <stop offset="100%" stop-color="${c}" stop-opacity="0.65"/>
                    </linearGradient>
                    <linearGradient id="fstecker-${entry.id}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#e2e8f0"/>
                        <stop offset="100%" stop-color="#94a3b8"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="22" width="82" height="48" rx="24" fill="url(#fsheath-${entry.id})"/>
                <rect x="4" y="24" width="28" height="44" rx="22" fill="#fff" opacity="0.08"/>
                ${fibers}
                <rect x="132" y="26" width="18" height="18" rx="3" fill="url(#fstecker-${entry.id})" stroke="#94a3b8" stroke-width="1"/>
                <rect x="132" y="48" width="18" height="18" rx="3" fill="url(#fstecker-${entry.id})" stroke="#94a3b8" stroke-width="1"/>
                <rect x="150" y="30" width="10" height="10" rx="2" fill="#d1d5db" stroke="#94a3b8" stroke-width="0.8"/>
                <circle cx="155" cy="35" r="2.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.6"/>
                <circle cx="155" cy="35" r="1" fill="${c}"/>
                <rect x="150" y="52" width="10" height="10" rx="2" fill="#d1d5db" stroke="#94a3b8" stroke-width="0.8"/>
                <circle cx="155" cy="57" r="2.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.6"/>
                <circle cx="155" cy="57" r="1" fill="${c}"/>
                <rect x="135" y="22" width="12" height="4" rx="1" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.5"/>
                <rect x="135" y="66" width="12" height="4" rx="1" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.5"/>
                <text x="141" y="80" text-anchor="middle" font-size="8" fill="currentColor" font-family="system-ui,sans-serif" opacity="0.6">LC</text>
            </svg>`;
        }

        if (entry.cableType === 'coax') {
            return `<svg viewBox="0 0 200 92" class="wiki-cable-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="coax-outer-${entry.id}" cx="50%" cy="50%" r="50%">
                        <stop offset="70%" stop-color="#374151"/>
                        <stop offset="100%" stop-color="#1f2937"/>
                    </radialGradient>
                    <radialGradient id="coax-diel-${entry.id}" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="100%" stop-color="#e5e7eb"/>
                    </radialGradient>
                </defs>
                <rect x="2" y="30" width="70" height="32" rx="16" fill="#374151"/>
                <rect x="4" y="32" width="20" height="28" rx="14" fill="#4b5563" opacity="0.4"/>
                <line x1="10" y1="46" x2="68" y2="46" stroke="#6b7280" stroke-width="0.5" opacity="0.5"/>
                <circle cx="130" cy="46" r="34" fill="url(#coax-outer-${entry.id})" stroke="#4b5563" stroke-width="1.5"/>
                <circle cx="130" cy="46" r="27" fill="none" stroke="#9ca3af" stroke-width="4" stroke-dasharray="3,2" opacity="0.8"/>
                <circle cx="130" cy="46" r="27" fill="#6b7280" opacity="0.15"/>
                <circle cx="130" cy="46" r="19" fill="url(#coax-diel-${entry.id})" stroke="#d1d5db" stroke-width="0.8"/>
                <circle cx="130" cy="46" r="6" fill="#d97706" stroke="#b45309" stroke-width="1.5"/>
                <circle cx="128" cy="44" r="2" fill="#fbbf24" opacity="0.5"/>
                <text x="130" y="88" text-anchor="middle" font-size="7" fill="currentColor" font-family="system-ui,sans-serif" opacity="0.5">${t('wiki.crossSection')}</text>
            </svg>`;
        }

        return '';
    }

    // --- Lightbox ---
    let lightboxEl = null;

    function createLightbox() {
        if (lightboxEl) return;
        lightboxEl = document.createElement('div');
        lightboxEl.className = 'wiki-lightbox';
        lightboxEl.innerHTML = `
            <div class="wiki-lightbox-backdrop"></div>
            <div class="wiki-lightbox-content">
                <button class="wiki-lightbox-close">\u00d7</button>
                <div class="wiki-lightbox-image"></div>
                <span class="wiki-lightbox-title"></span>
            </div>
        `;
        document.body.appendChild(lightboxEl);
        lightboxEl.querySelector('.wiki-lightbox-backdrop').addEventListener('click', closeLightbox);
        lightboxEl.querySelector('.wiki-lightbox-close').addEventListener('click', closeLightbox);
    }

    function openLightbox(entry) {
        if (!lightboxEl) createLightbox();
        lightboxEl.querySelector('.wiki-lightbox-image').innerHTML = generateCableSVG(entry);
        lightboxEl.querySelector('.wiki-lightbox-title').textContent = `${txt(entry.title)} \u2014 ${txt(entry.subtitle)}`;
        lightboxEl.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (lightboxEl) {
            lightboxEl.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    // --- Render ---
    function renderList() {
        const query = searchInput.value.trim().toLowerCase();

        const filtered = WIKI_DATA.filter(entry => {
            const matchesCat = selectedCat === 'all' || entry.cat === selectedCat;
            if (!matchesCat) return false;
            if (!query) return true;
            const title = txt(entry.title).toLowerCase();
            const subtitle = txt(entry.subtitle).toLowerCase();
            const desc = txt(entry.desc).toLowerCase();
            return (
                title.includes(query) ||
                subtitle.includes(query) ||
                desc.includes(query) ||
                entry.tags.some(tag => tag.toLowerCase().includes(query))
            );
        });

        const n = filtered.length;
        wikiCount.textContent = n !== 1 ? t('wiki.entries', { n }) : t('wiki.entry', { n });

        if (n === 0) {
            wikiList.innerHTML = `<div class="wiki-empty">${t('wiki.noResults')}</div>`;
            return;
        }

        wikiList.innerHTML = filtered.map(entry => {
            const cat = CAT_KEYS[entry.cat] || CAT_KEYS.all;
            const isExpanded = expandedId === entry.id;
            const layerNum = entry.layer
                ? `<span class="wiki-layer-num">${entry.layer}</span>`
                : '';

            return `
                <div class="wiki-row${isExpanded ? ' expanded' : ''}" data-id="${entry.id}">
                    <div class="wiki-row-header">
                        ${layerNum}
                        <div class="wiki-title-block">
                            <span class="wiki-title">${txt(entry.title)}</span>
                            <span class="wiki-subtitle">${txt(entry.subtitle)}</span>
                        </div>
                        <span class="wiki-cat-badge" style="color:${cat.color}; background:${cat.color}15; border-color:${cat.color}40">${t(cat.tKey)}</span>
                        <span class="wiki-expand-icon">\u25b8</span>
                    </div>
                    <div class="wiki-detail">
                        <p>${txt(entry.desc)}</p>
                        ${entry.cableType ? `<div class="wiki-cable-illustration wiki-cable-mobile" data-id="${entry.id}">${generateCableSVG(entry)}<span class="wiki-cable-hint">${t('wiki.tapZoom')}</span></div>` : ''}
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

    // --- Detail Panel (Desktop) ---
    function renderDetailPanel() {
        if (!expandedId) {
            detailPanel.innerHTML = `
                <div class="wiki-detail-empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    <p>${t('wiki.selectEntry')}</p>
                </div>`;
            return;
        }
        const entry = WIKI_DATA.find(e => e.id === expandedId);
        if (!entry) return;
        const cat = CAT_KEYS[entry.cat] || CAT_KEYS.all;
        const layerHtml = entry.layer
            ? `<span class="wiki-detail-layer">${entry.layer}</span>`
            : '';

        detailPanel.innerHTML = `
            <div class="wiki-detail-content">
                <div class="wiki-detail-title-row">
                    ${layerHtml}
                    <div>
                        <h3 class="wiki-detail-title">${txt(entry.title)}</h3>
                        <span class="wiki-detail-subtitle">${txt(entry.subtitle)}</span>
                    </div>
                </div>
                <span class="wiki-detail-badge" style="color:${cat.color}; background:${cat.color}15; border-color:${cat.color}40">${t(cat.tKey)}</span>
                ${entry.cableType ? `<div class="wiki-cable-illustration">${generateCableSVG(entry)}</div>` : ''}
                <div class="wiki-detail-desc">
                    <p>${txt(entry.desc)}</p>
                </div>
                ${entry.tags.length ? `
                <div class="wiki-detail-tags">
                    ${entry.tags.map(tg => `<span class="wiki-detail-tag">${tg}</span>`).join('')}
                </div>` : ''}
            </div>`;
    }

    // Expand / collapse (event delegation)
    wikiList.addEventListener('click', (e) => {
        const cableIllustration = e.target.closest('.wiki-cable-mobile');
        if (cableIllustration && !isDesktop()) {
            e.stopPropagation();
            const entryId = cableIllustration.dataset.id;
            const entry = WIKI_DATA.find(en => en.id === entryId);
            if (entry) openLightbox(entry);
            return;
        }

        const row = e.target.closest('.wiki-row');
        if (!row) return;
        const id = row.dataset.id;

        if (isDesktop()) {
            expandedId = expandedId === id ? null : id;
            renderList();
            renderDetailPanel();
        } else {
            expandedId = expandedId === id ? null : id;
            renderList();
        }
    });

    // Initial render
    renderList();
}

function teardown_netzwerk_wiki() {
    const lb = document.querySelector('.wiki-lightbox');
    if (lb) lb.remove();
    document.body.style.overflow = '';
}
