// === Netzwerk-Befehle Tool ===

function init_netzwerk_befehle(container) {

    // --- i18n ---
    I18N.register('nb', {
        de: {
            searchLabel: 'Suche (Befehl, Beschreibung oder Schalter)',
            searchPlaceholder: 'z.B. ping, DNS, Firewall...',
            catLabel: 'Kategorie',
            catAll: 'Alle', catDiag: 'Diagnose', catConfig: 'Konfiguration',
            catDns: 'DNS', catRouting: 'Routing', catTransfer: 'Transfer',
            catRemote: 'Remote', catInfo: 'Info',
            catWinCpl: 'Windows CPL', catWinMsc: 'Windows MSC',
            title: 'Befehls-Referenz',
            commands: '{n} Befehle', command: '{n} Befehl',
            noResults: 'Keine Befehle gefunden',
            syntax: 'Syntax', switches: 'Wichtige Schalter', examples: 'Beispiele',
            noEquiv: 'Kein direktes Pendant unter {platform}.',
            copy: 'Kopieren',
            helpWin: 'Alle Parameter anzeigen',
            grpCplNetwork: 'CPL \u2014 Netzwerk', grpCplSystem: 'CPL \u2014 System',
            grpCplHardware: 'CPL \u2014 Hardware', grpCplAccess: 'CPL \u2014 Eingabehilfe',
            grpMscAdmin: 'MSC \u2014 Verwaltung', grpMscNetwork: 'MSC \u2014 Netzwerk & Sicherheit',
        },
        en: {
            searchLabel: 'Search (command, description or switch)',
            searchPlaceholder: 'e.g. ping, DNS, firewall...',
            catLabel: 'Category',
            catAll: 'All', catDiag: 'Diagnostics', catConfig: 'Configuration',
            catDns: 'DNS', catRouting: 'Routing', catTransfer: 'Transfer',
            catRemote: 'Remote', catInfo: 'Info',
            catWinCpl: 'Windows CPL', catWinMsc: 'Windows MSC',
            title: 'Command Reference',
            commands: '{n} commands', command: '{n} command',
            noResults: 'No commands found',
            syntax: 'Syntax', switches: 'Key Switches', examples: 'Examples',
            noEquiv: 'No direct equivalent on {platform}.',
            copy: 'Copy',
            helpWin: 'Show all parameters',
            grpCplNetwork: 'CPL \u2014 Network', grpCplSystem: 'CPL \u2014 System',
            grpCplHardware: 'CPL \u2014 Hardware', grpCplAccess: 'CPL \u2014 Accessibility',
            grpMscAdmin: 'MSC \u2014 Administration', grpMscNetwork: 'MSC \u2014 Network & Security',
        },
    });
    const t = I18N.t;
    const txt = (obj) => typeof obj === 'string' ? obj : (obj[I18N.getLang()] || obj.de);

    // --- Icons ---
    const COPY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    const CHECK_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    const WIN_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.5l9.9-1.4v9.6H0zm11 -1.6L24 0v11.7H11zm-11 10.3h9.9v9.6L0 20.5zm11 0H24V24l-13-1.8z"/></svg>';
    const LINUX_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.2 2 7 5.1 7 8.5c0 1.6.4 3 1.1 4.2-.8.5-2.6 1.8-2.8 3.4-.3 2 1.4 3.6 3.2 3.8.7.1 1.3-.1 1.8-.3.5.5 1.1.8 1.7.8s1.2-.3 1.7-.8c.5.2 1.1.4 1.8.3 1.8-.2 3.5-1.8 3.2-3.8-.2-1.6-2-2.9-2.8-3.4.7-1.2 1.1-2.6 1.1-4.2C17 5.1 14.8 2 12 2zm-2 8c-.6 0-1-.7-1-1.5S9.4 7 10 7s1 .7 1 1.5S10.6 10 10 10zm4 0c-.6 0-1-.7-1-1.5S13.4 7 14 7s1 .7 1 1.5S14.6 10 14 10zm-3.5 3h3c-.2.6-.7 1-1.5 1s-1.3-.4-1.5-1z"/></svg>';

    // --- Categories ---
    const CAT_KEYS = {
        all:      { tKey: 'nb.catAll',     color: 'var(--text-dim)' },
        diagnose: { tKey: 'nb.catDiag',    color: 'var(--accent)' },
        config:   { tKey: 'nb.catConfig',  color: 'var(--green)' },
        dns:      { tKey: 'nb.catDns',     color: 'var(--purple)' },
        routing:  { tKey: 'nb.catRouting', color: 'var(--orange)' },
        transfer: { tKey: 'nb.catTransfer',color: 'var(--red)' },
        remote:   { tKey: 'nb.catRemote',  color: '#2dd4bf' },
        info:     { tKey: 'nb.catInfo',    color: '#f472b6' },
        'win-cpl':{ tKey: 'nb.catWinCpl',  color: '#0078d4' },
        'win-msc':{ tKey: 'nb.catWinMsc',  color: '#00a4ef' },
    };

    // --- Windows-Gruppen ---
    const WIN_GROUP_KEYS = {
        'cpl-network':  'nb.grpCplNetwork',
        'cpl-system':   'nb.grpCplSystem',
        'cpl-hardware': 'nb.grpCplHardware',
        'cpl-access':   'nb.grpCplAccess',
        'msc-admin':    'nb.grpMscAdmin',
        'msc-network':  'nb.grpMscNetwork',
    };
    const WIN_GROUPS_MAP = {
        'ncpa': 'cpl-network', 'firewall-cpl': 'cpl-network', 'inetcpl': 'cpl-network',
        'sysdm': 'cpl-system', 'appwiz': 'cpl-system', 'powercfg-cpl': 'cpl-system',
        'timedate': 'cpl-system', 'intl': 'cpl-system', 'wscui': 'cpl-system',
        'desk': 'cpl-hardware', 'mmsys': 'cpl-hardware', 'main-cpl': 'cpl-hardware',
        'bthprops': 'cpl-hardware', 'joy': 'cpl-hardware', 'hdwwiz': 'cpl-hardware',
        'access': 'cpl-access',
        'compmgmt': 'msc-admin', 'devmgmt': 'msc-admin', 'diskmgmt': 'msc-admin',
        'services': 'msc-admin', 'taskschd': 'msc-admin', 'eventvwr': 'msc-admin',
        'lusrmgr': 'msc-admin', 'gpedit': 'msc-admin', 'secpol': 'msc-admin',
        'perfmon': 'msc-admin',
        'wf': 'msc-network', 'certmgr': 'msc-network', 'certlm': 'msc-network',
    };

    // --- Command Database (54 Befehle: 25 CLI + 16 CPL + 13 MSC) ---
    const COMMANDS = [

        // ===== DIAGNOSE (4) =====
        {
            id: 'ping', name: 'ping', cat: 'diagnose',
            desc: { de: 'Erreichbarkeit eines Hosts testen (ICMP Echo)', en: 'Test host reachability (ICMP Echo)' },
            win: {
                cmd: 'ping',
                syntax: 'ping [Optionen] <Ziel>',
                switches: [
                    { flag: '-t',         desc: { de: 'Ping fortlaufend senden (Strg+C stoppt)', en: 'Send continuous ping (Ctrl+C stops)' } },
                    { flag: '-n <Anz>',   desc: { de: 'Anzahl der Echo-Anfragen', en: 'Number of echo requests' } },
                    { flag: '-l <Bytes>', desc: { de: 'Paketgr\u00f6\u00dfe (Standard: 32)', en: 'Packet size (default: 32)' } },
                    { flag: '-i <TTL>',   desc: { de: 'Time-to-Live festlegen', en: 'Set Time-to-Live' } },
                    { flag: '-w <ms>',    desc: { de: 'Timeout in Millisekunden', en: 'Timeout in milliseconds' } },
                    { flag: '-4 / -6',    desc: { de: 'IPv4 bzw. IPv6 erzwingen', en: 'Force IPv4 or IPv6' } },
                ],
                examples: [
                    { cmd: 'ping -t 8.8.8.8',            desc: { de: 'Dauer-Ping an Google DNS', en: 'Continuous ping to Google DNS' } },
                    { cmd: 'ping -n 10 -l 1000 server1', desc: { de: '10 Pings mit 1000 Bytes', en: '10 pings with 1000 bytes' } },
                ]
            },
            linux: {
                cmd: 'ping',
                syntax: 'ping [Optionen] <Ziel>',
                switches: [
                    { flag: '-c <Anz>',   desc: { de: 'Anzahl der Pings (sonst endlos)', en: 'Number of pings (otherwise infinite)' } },
                    { flag: '-i <Sek>',   desc: { de: 'Intervall zwischen Pings (Std: 1s)', en: 'Interval between pings (default: 1s)' } },
                    { flag: '-s <Bytes>', desc: { de: 'Paketgr\u00f6\u00dfe (Standard: 56)', en: 'Packet size (default: 56)' } },
                    { flag: '-t <TTL>',   desc: { de: 'Time-to-Live festlegen', en: 'Set Time-to-Live' } },
                    { flag: '-W <Sek>',   desc: { de: 'Timeout in Sekunden', en: 'Timeout in seconds' } },
                    { flag: '-4 / -6',    desc: { de: 'IPv4 bzw. IPv6 erzwingen', en: 'Force IPv4 or IPv6' } },
                ],
                examples: [
                    { cmd: 'ping -c 5 8.8.8.8',         desc: { de: '5 Pings an Google DNS', en: '5 pings to Google DNS' } },
                    { cmd: 'ping -i 0.2 -c 50 server1', desc: { de: '50 Schnell-Pings (200ms Intervall)', en: '50 fast pings (200ms interval)' } },
                ]
            }
        },
        {
            id: 'traceroute', name: 'traceroute', cat: 'diagnose',
            desc: { de: 'Routenverfolgung zum Zielhost (Hop-Analyse)', en: 'Route tracing to target host (hop analysis)' },
            win: {
                cmd: 'tracert',
                syntax: 'tracert [Optionen] <Ziel>',
                switches: [
                    { flag: '-d',          desc: { de: 'Keine DNS-Aufl\u00f6sung (schneller)', en: 'No DNS resolution (faster)' } },
                    { flag: '-h <MaxHops>', desc: { de: 'Maximale Anzahl Hops (Std: 30)', en: 'Maximum number of hops (default: 30)' } },
                    { flag: '-w <ms>',     desc: { de: 'Timeout pro Hop in ms', en: 'Timeout per hop in ms' } },
                    { flag: '-4 / -6',     desc: { de: 'IPv4 bzw. IPv6 erzwingen', en: 'Force IPv4 or IPv6' } },
                ],
                examples: [
                    { cmd: 'tracert -d 8.8.8.8',       desc: { de: 'Route ohne DNS-Aufl\u00f6sung', en: 'Route without DNS resolution' } },
                    { cmd: 'tracert -h 15 example.com', desc: { de: 'Max. 15 Hops', en: 'Max. 15 hops' } },
                ]
            },
            linux: {
                cmd: 'traceroute',
                syntax: 'traceroute [Optionen] <Ziel>',
                switches: [
                    { flag: '-n',          desc: { de: 'Keine DNS-Aufl\u00f6sung', en: 'No DNS resolution' } },
                    { flag: '-m <MaxHops>', desc: { de: 'Maximale Anzahl Hops', en: 'Maximum number of hops' } },
                    { flag: '-w <Sek>',    desc: { de: 'Timeout pro Hop in Sekunden', en: 'Timeout per hop in seconds' } },
                    { flag: '-I',          desc: { de: 'ICMP statt UDP verwenden', en: 'Use ICMP instead of UDP' } },
                    { flag: '-T',          desc: { de: 'TCP SYN verwenden', en: 'Use TCP SYN' } },
                    { flag: '-p <Port>',   desc: { de: 'Zielport festlegen', en: 'Set destination port' } },
                ],
                examples: [
                    { cmd: 'traceroute -n 8.8.8.8',            desc: { de: 'Route ohne DNS', en: 'Route without DNS' } },
                    { cmd: 'traceroute -T -p 443 example.com', desc: { de: 'TCP-Traceroute auf Port 443', en: 'TCP traceroute on port 443' } },
                ]
            }
        },
        {
            id: 'pathping', name: 'pathping / mtr', cat: 'diagnose',
            desc: { de: 'Erweiterte Routenanalyse mit Paketverlust pro Hop', en: 'Advanced route analysis with packet loss per hop' },
            win: {
                cmd: 'pathping',
                syntax: 'pathping [Optionen] <Ziel>',
                switches: [
                    { flag: '-n',          desc: { de: 'Keine DNS-Aufl\u00f6sung', en: 'No DNS resolution' } },
                    { flag: '-h <MaxHops>', desc: { de: 'Maximale Anzahl Hops', en: 'Maximum number of hops' } },
                    { flag: '-q <Anz>',    desc: { de: 'Abfragen pro Hop (Std: 100)', en: 'Queries per hop (default: 100)' } },
                    { flag: '-p <ms>',     desc: { de: 'Pause zwischen Pings in ms', en: 'Pause between pings in ms' } },
                ],
                examples: [
                    { cmd: 'pathping -n 8.8.8.8',    desc: { de: 'Hop-Analyse ohne DNS', en: 'Hop analysis without DNS' } },
                    { cmd: 'pathping -q 50 server1',  desc: { de: '50 Abfragen pro Hop', en: '50 queries per hop' } },
                ]
            },
            linux: {
                cmd: 'mtr',
                syntax: 'mtr [Optionen] <Ziel>',
                switches: [
                    { flag: '-n',          desc: { de: 'Keine DNS-Aufl\u00f6sung', en: 'No DNS resolution' } },
                    { flag: '-c <Anz>',    desc: { de: 'Anzahl Pings pro Hop', en: 'Number of pings per hop' } },
                    { flag: '-r',          desc: { de: 'Report-Modus (nicht interaktiv)', en: 'Report mode (non-interactive)' } },
                    { flag: '-T',          desc: { de: 'TCP statt ICMP verwenden', en: 'Use TCP instead of ICMP' } },
                    { flag: '-P <Port>',   desc: { de: 'TCP-Zielport', en: 'TCP destination port' } },
                    { flag: '-w',          desc: { de: 'Breiter Report (mehr Details)', en: 'Wide report (more details)' } },
                ],
                examples: [
                    { cmd: 'mtr -r -c 100 8.8.8.8',     desc: { de: 'Report mit 100 Pings', en: 'Report with 100 pings' } },
                    { cmd: 'mtr -T -P 443 example.com',  desc: { de: 'TCP-MTR auf Port 443', en: 'TCP MTR on port 443' } },
                ]
            }
        },
        {
            id: 'netstat', name: 'netstat / ss', cat: 'diagnose',
            desc: { de: 'Aktive Netzwerkverbindungen und offene Ports anzeigen', en: 'Display active network connections and open ports' },
            win: {
                cmd: 'netstat',
                syntax: 'netstat [Optionen]',
                switches: [
                    { flag: '-a',          desc: { de: 'Alle Verbindungen + Ports anzeigen', en: 'Show all connections + ports' } },
                    { flag: '-n',          desc: { de: 'Numerische Adressen (kein DNS)', en: 'Numeric addresses (no DNS)' } },
                    { flag: '-o',          desc: { de: 'Prozess-ID (PID) anzeigen', en: 'Show Process ID (PID)' } },
                    { flag: '-b',          desc: { de: 'Prozessname anzeigen (Admin)', en: 'Show process name (admin)' } },
                    { flag: '-r',          desc: { de: 'Routing-Tabelle anzeigen', en: 'Show routing table' } },
                    { flag: '-p <Proto>',  desc: { de: 'Filter: TCP, UDP, TCPv6, UDPv6', en: 'Filter: TCP, UDP, TCPv6, UDPv6' } },
                ],
                examples: [
                    { cmd: 'netstat -ano',               desc: { de: 'Alle Verbindungen mit PID', en: 'All connections with PID' } },
                    { cmd: 'netstat -an | findstr :443', desc: { de: 'Nur Port 443 filtern', en: 'Filter port 443 only' } },
                ]
            },
            linux: {
                cmd: 'ss',
                syntax: 'ss [Optionen]',
                switches: [
                    { flag: '-t',   desc: { de: 'Nur TCP-Verbindungen', en: 'TCP connections only' } },
                    { flag: '-u',   desc: { de: 'Nur UDP-Verbindungen', en: 'UDP connections only' } },
                    { flag: '-l',   desc: { de: 'Nur lauschende Ports', en: 'Listening ports only' } },
                    { flag: '-n',   desc: { de: 'Numerische Adressen', en: 'Numeric addresses' } },
                    { flag: '-p',   desc: { de: 'Prozessname anzeigen', en: 'Show process name' } },
                    { flag: '-a',   desc: { de: 'Alle Sockets anzeigen', en: 'Show all sockets' } },
                ],
                examples: [
                    { cmd: 'ss -tulnp',                desc: { de: 'Alle lauschenden TCP/UDP mit Prozess', en: 'All listening TCP/UDP with process' } },
                    { cmd: 'ss -tn state established',  desc: { de: 'Nur aktive TCP-Verbindungen', en: 'Established TCP connections only' } },
                ]
            }
        },

        // ===== KONFIGURATION (5) =====
        {
            id: 'ipconfig', name: 'ipconfig / ip', cat: 'config',
            desc: { de: 'IP-Konfiguration und Netzwerkadapter anzeigen/ändern', en: 'View/change IP configuration and network adapters' },
            win: {
                cmd: 'ipconfig',
                syntax: 'ipconfig [/Schalter]',
                switches: [
                    { flag: '/all',         desc: { de: 'Vollständige Konfiguration aller Adapter', en: 'Complete configuration of all adapters' } },
                    { flag: '/release',     desc: { de: 'DHCP-Lease freigeben', en: 'Release DHCP lease' } },
                    { flag: '/renew',       desc: { de: 'DHCP-Lease erneuern', en: 'Renew DHCP lease' } },
                    { flag: '/flushdns',    desc: { de: 'DNS-Cache leeren', en: 'Flush DNS cache' } },
                    { flag: '/displaydns',  desc: { de: 'DNS-Cache anzeigen', en: 'Display DNS cache' } },
                    { flag: '/registerdns', desc: { de: 'DNS-Namen neu registrieren', en: 'Re-register DNS names' } },
                ],
                examples: [
                    { cmd: 'ipconfig /all',      desc: { de: 'Alle Adapter mit MAC, DNS, DHCP', en: 'All adapters with MAC, DNS, DHCP' } },
                    { cmd: 'ipconfig /flushdns',  desc: { de: 'DNS-Cache leeren', en: 'Flush DNS cache' } },
                    { cmd: 'ipconfig /release && ipconfig /renew', desc: { de: 'DHCP erneuern', en: 'Renew DHCP' } },
                ]
            },
            linux: {
                cmd: 'ip',
                syntax: 'ip [Objekt] [Aktion]',
                switches: [
                    { flag: 'addr show',              desc: { de: 'IP-Adressen aller Interfaces', en: 'IP addresses of all interfaces' } },
                    { flag: 'link show',              desc: { de: 'Interfaces mit Status anzeigen', en: 'Show interfaces with status' } },
                    { flag: 'addr add <IP>/<CIDR> dev <IF>', desc: { de: 'IP-Adresse hinzufügen', en: 'Add IP address' } },
                    { flag: 'addr del <IP>/<CIDR> dev <IF>', desc: { de: 'IP-Adresse entfernen', en: 'Remove IP address' } },
                    { flag: 'link set <IF> up/down',  desc: { de: 'Interface aktivieren/deaktivieren', en: 'Enable/disable interface' } },
                ],
                examples: [
                    { cmd: 'ip addr show',                             desc: { de: 'Alle IP-Adressen anzeigen', en: 'Show all IP addresses' } },
                    { cmd: 'ip addr add 192.168.1.10/24 dev eth0',     desc: { de: 'Statische IP setzen', en: 'Set static IP' } },
                    { cmd: 'ip link set eth0 up',                      desc: { de: 'Interface aktivieren', en: 'Enable interface' } },
                ]
            }
        },
        {
            id: 'netsh', name: 'netsh / nmcli', cat: 'config',
            desc: { de: 'Netzwerkkomponenten konfigurieren (WLAN, Firewall, IP)', en: 'Configure network components (WiFi, firewall, IP)' },
            win: {
                cmd: 'netsh',
                syntax: 'netsh <Kontext> <Befehl>',
                switches: [
                    { flag: 'wlan show profiles',         desc: { de: 'Gespeicherte WLAN-Profile', en: 'Saved WiFi profiles' } },
                    { flag: 'wlan show profile name=X key=clear', desc: { de: 'WLAN-Passwort anzeigen', en: 'Show WiFi password' } },
                    { flag: 'interface ip show config',   desc: { de: 'IP-Konfiguration aller Adapter', en: 'IP configuration of all adapters' } },
                    { flag: 'advfirewall set allprofiles state on/off', desc: { de: 'Firewall ein/aus', en: 'Firewall on/off' } },
                    { flag: 'interface ip set address ...', desc: { de: 'Statische IP konfigurieren', en: 'Configure static IP' } },
                ],
                examples: [
                    { cmd: 'netsh wlan show profiles',    desc: { de: 'Alle WLAN-Profile auflisten', en: 'List all WiFi profiles' } },
                    { cmd: 'netsh wlan show profile name="MeinWLAN" key=clear', desc: { de: 'WLAN-Passwort anzeigen', en: 'Show WiFi password' } },
                    { cmd: 'netsh interface ip set address "Ethernet" static 192.168.1.10 255.255.255.0 192.168.1.1', desc: { de: 'Statische IP setzen', en: 'Set static IP' } },
                ]
            },
            linux: {
                cmd: 'nmcli',
                syntax: 'nmcli <Objekt> <Aktion>',
                switches: [
                    { flag: 'general status',      desc: { de: 'Netzwerkstatus Übersicht', en: 'Network status overview' } },
                    { flag: 'device status',       desc: { de: 'Alle Interfaces mit Status', en: 'All interfaces with status' } },
                    { flag: 'device wifi list',    desc: { de: 'Verfügbare WLANs anzeigen', en: 'Show available WiFi networks' } },
                    { flag: 'connection show',     desc: { de: 'Gespeicherte Verbindungen', en: 'Saved connections' } },
                    { flag: 'connection modify <Name> ...', desc: { de: 'Verbindung ändern', en: 'Modify connection' } },
                ],
                examples: [
                    { cmd: 'nmcli device status',   desc: { de: 'Interface-Status anzeigen', en: 'Show interface status' } },
                    { cmd: 'nmcli device wifi list', desc: { de: 'WLAN-Netze scannen', en: 'Scan WiFi networks' } },
                    { cmd: 'nmcli connection modify eth0 ipv4.addresses 192.168.1.10/24 ipv4.method manual', desc: { de: 'Statische IP setzen', en: 'Set static IP' } },
                ]
            }
        },
        {
            id: 'ncpa', name: 'ncpa.cpl', cat: 'win-cpl',
            desc: { de: 'Netzwerkverbindungen GUI öffnen (Schnellzugriff)', en: 'Open Network Connections GUI (quick access)' },
            win: {
                cmd: 'ncpa.cpl',
                syntax: 'ncpa.cpl',
                switches: [
                    { flag: '(keine)',  desc: { de: 'Startet direkt die Netzwerkverbindungen', en: 'Directly opens Network Connections' } },
                ],
                examples: [
                    { cmd: 'ncpa.cpl',                  desc: { de: 'Öffnet Netzwerkverbindungen', en: 'Open Network Connections' } },
                    { cmd: 'control netconnections',    desc: { de: 'Alternative (gleiche Funktion)', en: 'Alternative (same function)' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Kein direktes Pendant. Verwende nmtui (TUI) oder nmcli / ip addr (CLI).', en: 'No direct equivalent. Use nmtui (TUI) or nmcli / ip addr (CLI).' }
        },
        {
            id: 'hostname', name: 'hostname', cat: 'config',
            desc: { de: 'Computername anzeigen oder ändern', en: 'Display or change computer name' },
            win: {
                cmd: 'hostname',
                syntax: 'hostname',
                switches: [
                    { flag: '(keine)',  desc: { de: 'Zeigt den aktuellen Computernamen', en: 'Shows the current computer name' } },
                ],
                examples: [
                    { cmd: 'hostname',  desc: { de: 'Computername anzeigen', en: 'Show computer name' } },
                ]
            },
            linux: {
                cmd: 'hostname / hostnamectl',
                syntax: 'hostname [Optionen] | hostnamectl [Aktion]',
                switches: [
                    { flag: '-f',         desc: { de: 'FQDN (vollständiger Hostname)', en: 'FQDN (fully qualified hostname)' } },
                    { flag: '-I',         desc: { de: 'Alle IP-Adressen des Hosts', en: 'All IP addresses of the host' } },
                    { flag: '-d',         desc: { de: 'Domänenname anzeigen', en: 'Show domain name' } },
                    { flag: 'hostnamectl set-hostname <Name>', desc: { de: 'Hostname ändern (persistent)', en: 'Change hostname (persistent)' } },
                ],
                examples: [
                    { cmd: 'hostname -f',                         desc: { de: 'FQDN anzeigen', en: 'Show FQDN' } },
                    { cmd: 'hostnamectl',                         desc: { de: 'Ausführliche System-/Hostname-Info', en: 'Detailed system/hostname info' } },
                    { cmd: 'hostnamectl set-hostname server01',   desc: { de: 'Hostname permanent ändern', en: 'Change hostname permanently' } },
                ]
            }
        },
        {
            id: 'proxy', name: 'proxy', cat: 'config',
            desc: { de: 'Proxy-Einstellungen anzeigen, setzen oder entfernen', en: 'View, set or remove proxy settings' },
            win: {
                cmd: 'netsh winhttp',
                syntax: 'netsh winhttp [show|set|reset] proxy ...',
                switches: [
                    { flag: 'show proxy',              desc: { de: 'Aktuellen Proxy anzeigen', en: 'Show current proxy' } },
                    { flag: 'set proxy <Proxy:Port>',  desc: { de: 'Proxy setzen', en: 'Set proxy' } },
                    { flag: 'set proxy <Proxy> bypass-list="<Liste>"', desc: { de: 'Proxy mit Ausnahmen', en: 'Proxy with exceptions' } },
                    { flag: 'reset proxy',             desc: { de: 'Proxy entfernen (Direktverbindung)', en: 'Remove proxy (direct connection)' } },
                    { flag: 'set HTTP_PROXY=...',      desc: { de: 'Umgebungsvariable (CMD/PowerShell)', en: 'Environment variable (CMD/PowerShell)' } },
                ],
                examples: [
                    { cmd: 'netsh winhttp show proxy',                          desc: { de: 'Proxy-Status anzeigen', en: 'Show proxy status' } },
                    { cmd: 'netsh winhttp set proxy proxy.firma.de:8080',       desc: { de: 'Proxy konfigurieren', en: 'Configure proxy' } },
                    { cmd: 'netsh winhttp set proxy proxy.firma.de:8080 bypass-list="*.local;10.*"', desc: { de: 'Proxy mit Ausnahmen', en: 'Proxy with exceptions' } },
                    { cmd: 'netsh winhttp reset proxy',                         desc: { de: 'Proxy entfernen', en: 'Remove proxy' } },
                ]
            },
            linux: {
                cmd: 'export http_proxy / https_proxy',
                syntax: 'export http_proxy=http://<Proxy:Port>',
                switches: [
                    { flag: 'export http_proxy=...',   desc: { de: 'HTTP-Proxy setzen', en: 'Set HTTP proxy' } },
                    { flag: 'export https_proxy=...',  desc: { de: 'HTTPS-Proxy setzen', en: 'Set HTTPS proxy' } },
                    { flag: 'export no_proxy=...',     desc: { de: 'Ausnahmen (kommagetrennt)', en: 'Exceptions (comma-separated)' } },
                    { flag: 'unset http_proxy',        desc: { de: 'Proxy entfernen', en: 'Remove proxy' } },
                    { flag: 'env | grep -i proxy',     desc: { de: 'Aktuelle Proxy-Variablen anzeigen', en: 'Show current proxy variables' } },
                ],
                examples: [
                    { cmd: 'export http_proxy=http://proxy.firma.de:8080',      desc: { de: 'HTTP-Proxy setzen', en: 'Set HTTP proxy' } },
                    { cmd: 'export https_proxy=http://proxy.firma.de:8080',     desc: { de: 'HTTPS-Proxy setzen', en: 'Set HTTPS proxy' } },
                    { cmd: 'export no_proxy=localhost,127.0.0.1,.local',        desc: { de: 'Ausnahmen definieren', en: 'Define exceptions' } },
                    { cmd: 'unset http_proxy https_proxy',                      desc: { de: 'Proxy entfernen', en: 'Remove proxy' } },
                ]
            }
        },

        // ===== DNS (2) =====
        {
            id: 'nslookup', name: 'nslookup / dig', cat: 'dns',
            desc: { de: 'DNS-Abfragen (A, MX, AAAA, TXT, NS, SOA, PTR)', en: 'DNS queries (A, MX, AAAA, TXT, NS, SOA, PTR)' },
            win: {
                cmd: 'nslookup',
                syntax: 'nslookup [-type=<Typ>] <Name> [Server]',
                switches: [
                    { flag: '-type=A',     desc: { de: 'IPv4-Adresse abfragen', en: 'Query IPv4 address' } },
                    { flag: '-type=AAAA',  desc: { de: 'IPv6-Adresse abfragen', en: 'Query IPv6 address' } },
                    { flag: '-type=MX',    desc: { de: 'Mailserver abfragen', en: 'Query mail servers' } },
                    { flag: '-type=NS',    desc: { de: 'Nameserver abfragen', en: 'Query name servers' } },
                    { flag: '-type=TXT',   desc: { de: 'TXT-Records (SPF, DKIM)', en: 'TXT records (SPF, DKIM)' } },
                    { flag: '-type=PTR',   desc: { de: 'Reverse-DNS (IP → Name)', en: 'Reverse DNS (IP → name)' } },
                ],
                examples: [
                    { cmd: 'nslookup -type=MX example.com',       desc: { de: 'MX-Records abfragen', en: 'Query MX records' } },
                    { cmd: 'nslookup example.com 8.8.8.8',        desc: { de: 'Abfrage über Google DNS', en: 'Query via Google DNS' } },
                    { cmd: 'nslookup -type=TXT example.com',      desc: { de: 'SPF/DKIM-Records prüfen', en: 'Check SPF/DKIM records' } },
                ]
            },
            linux: {
                cmd: 'dig',
                syntax: 'dig [@Server] <Name> [Typ] [+Optionen]',
                switches: [
                    { flag: '@<Server>',   desc: { de: 'DNS-Server angeben', en: 'Specify DNS server' } },
                    { flag: 'A / AAAA / MX / NS / TXT / SOA', desc: { de: 'Record-Typ', en: 'Record type' } },
                    { flag: '+short',      desc: { de: 'Nur das Ergebnis (kompakt)', en: 'Result only (compact)' } },
                    { flag: '+trace',      desc: { de: 'Vollständige DNS-Auflösungskette', en: 'Full DNS resolution chain' } },
                    { flag: '+noall +answer', desc: { de: 'Nur Answer-Section', en: 'Answer section only' } },
                    { flag: '-x <IP>',     desc: { de: 'Reverse-DNS (PTR)', en: 'Reverse DNS (PTR)' } },
                ],
                examples: [
                    { cmd: 'dig example.com MX +short',           desc: { de: 'MX-Records (kompakt)', en: 'MX records (compact)' } },
                    { cmd: 'dig @8.8.8.8 example.com AAAA',      desc: { de: 'IPv6 über Google DNS', en: 'IPv6 via Google DNS' } },
                    { cmd: 'dig -x 8.8.8.8',                     desc: { de: 'Reverse-DNS für 8.8.8.8', en: 'Reverse DNS for 8.8.8.8' } },
                ]
            }
        },
        {
            id: 'dns-resolve', name: 'Resolve-DnsName / host', cat: 'dns',
            desc: { de: 'Schnelle DNS-Auflösung (PowerShell / host)', en: 'Quick DNS resolution (PowerShell / host)' },
            win: {
                cmd: 'Resolve-DnsName',
                syntax: 'Resolve-DnsName <Name> [-Type <Typ>] [-Server <DNS>]',
                switches: [
                    { flag: '-Type A/MX/AAAA/NS/TXT/PTR', desc: { de: 'Record-Typ', en: 'Record type' } },
                    { flag: '-Server <DNS>',   desc: { de: 'DNS-Server angeben', en: 'Specify DNS server' } },
                    { flag: '-DnsOnly',        desc: { de: 'Nur DNS (kein Cache/Hosts)', en: 'DNS only (no cache/hosts)' } },
                ],
                examples: [
                    { cmd: 'Resolve-DnsName example.com -Type MX',              desc: { de: 'MX-Records abfragen', en: 'Query MX records' } },
                    { cmd: 'Resolve-DnsName example.com -Server 8.8.8.8',      desc: { de: 'Abfrage über Google DNS', en: 'Query via Google DNS' } },
                ]
            },
            linux: {
                cmd: 'host',
                syntax: 'host [-t <Typ>] <Name> [Server]',
                switches: [
                    { flag: '-t <Typ>',   desc: { de: 'Record-Typ (A, MX, NS, TXT, AAAA)', en: 'Record type (A, MX, NS, TXT, AAAA)' } },
                    { flag: '-a',         desc: { de: 'Alle verfügbaren Records', en: 'All available records' } },
                    { flag: '<Server>',   desc: { de: 'DNS-Server als 2. Argument', en: 'DNS server as 2nd argument' } },
                ],
                examples: [
                    { cmd: 'host -t MX example.com',           desc: { de: 'MX-Records abfragen', en: 'Query MX records' } },
                    { cmd: 'host example.com 8.8.8.8',         desc: { de: 'Abfrage über Google DNS', en: 'Query via Google DNS' } },
                    { cmd: 'host -a example.com',              desc: { de: 'Alle DNS-Records', en: 'All DNS records' } },
                ]
            }
        },

        // ===== ROUTING (3) =====
        {
            id: 'route', name: 'route / ip route', cat: 'routing',
            desc: { de: 'Routing-Tabelle anzeigen und Routen verwalten', en: 'Display routing table and manage routes' },
            win: {
                cmd: 'route',
                syntax: 'route [print|add|delete] ...',
                switches: [
                    { flag: 'print',       desc: { de: 'Routing-Tabelle anzeigen', en: 'Show routing table' } },
                    { flag: 'add <Netz> mask <Maske> <GW>', desc: { de: 'Route hinzufügen', en: 'Add route' } },
                    { flag: 'delete <Netz>', desc: { de: 'Route entfernen', en: 'Remove route' } },
                    { flag: '-p',          desc: { de: 'Route persistent (bleibt nach Neustart)', en: 'Persistent route (survives reboot)' } },
                ],
                examples: [
                    { cmd: 'route print',                                          desc: { de: 'Routing-Tabelle anzeigen', en: 'Show routing table' } },
                    { cmd: 'route add 10.0.0.0 mask 255.0.0.0 192.168.1.1 -p',   desc: { de: 'Persistente Route hinzufügen', en: 'Add persistent route' } },
                ]
            },
            linux: {
                cmd: 'ip route',
                syntax: 'ip route [show|add|del|get] ...',
                switches: [
                    { flag: 'show',          desc: { de: 'Routing-Tabelle anzeigen', en: 'Show routing table' } },
                    { flag: 'add <Netz>/<CIDR> via <GW>', desc: { de: 'Route hinzufügen', en: 'Add route' } },
                    { flag: 'del <Netz>/<CIDR>', desc: { de: 'Route entfernen', en: 'Remove route' } },
                    { flag: 'add default via <GW>', desc: { de: 'Standard-Gateway setzen', en: 'Set default gateway' } },
                    { flag: 'get <IP>',      desc: { de: 'Route für eine IP nachschlagen', en: 'Look up route for an IP' } },
                ],
                examples: [
                    { cmd: 'ip route show',                              desc: { de: 'Routing-Tabelle anzeigen', en: 'Show routing table' } },
                    { cmd: 'ip route add 10.0.0.0/8 via 192.168.1.1',   desc: { de: 'Route hinzufügen', en: 'Add route' } },
                    { cmd: 'ip route get 8.8.8.8',                      desc: { de: 'Welche Route wird genutzt?', en: 'Which route is used?' } },
                ]
            }
        },
        {
            id: 'arp', name: 'arp / ip neigh', cat: 'routing',
            desc: { de: 'ARP-Tabelle anzeigen (IP ↔ MAC-Zuordnung)', en: 'Display ARP table (IP ↔ MAC mapping)' },
            win: {
                cmd: 'arp',
                syntax: 'arp [Optionen]',
                switches: [
                    { flag: '-a',          desc: { de: 'ARP-Cache anzeigen', en: 'Show ARP cache' } },
                    { flag: '-d <IP>',     desc: { de: 'Eintrag löschen', en: 'Delete entry' } },
                    { flag: '-s <IP> <MAC>', desc: { de: 'Statischen Eintrag hinzufügen', en: 'Add static entry' } },
                ],
                examples: [
                    { cmd: 'arp -a',                  desc: { de: 'ARP-Tabelle anzeigen', en: 'Show ARP table' } },
                    { cmd: 'arp -d 192.168.1.1',     desc: { de: 'Eintrag löschen', en: 'Delete entry' } },
                ]
            },
            linux: {
                cmd: 'ip neigh',
                syntax: 'ip neigh [show|add|del|flush] ...',
                switches: [
                    { flag: 'show',        desc: { de: 'Nachbar-Tabelle anzeigen', en: 'Show neighbor table' } },
                    { flag: 'add <IP> lladdr <MAC> dev <IF>', desc: { de: 'Statisch hinzufügen', en: 'Add static entry' } },
                    { flag: 'del <IP> dev <IF>', desc: { de: 'Eintrag löschen', en: 'Delete entry' } },
                    { flag: 'flush dev <IF>', desc: { de: 'Alle Einträge löschen', en: 'Delete all entries' } },
                ],
                examples: [
                    { cmd: 'ip neigh show',            desc: { de: 'ARP-/Nachbar-Tabelle anzeigen', en: 'Show ARP/neighbor table' } },
                    { cmd: 'ip neigh flush dev eth0',  desc: { de: 'Cache für eth0 leeren', en: 'Flush cache for eth0' } },
                ]
            }
        },
        {
            id: 'nbtstat', name: 'nbtstat / nbtscan', cat: 'routing',
            desc: { de: 'NetBIOS-Namensinformationen und -Scanning', en: 'NetBIOS name information and scanning' },
            win: {
                cmd: 'nbtstat',
                syntax: 'nbtstat [Optionen]',
                switches: [
                    { flag: '-a <Name>',   desc: { de: 'NetBIOS-Tabelle nach Name', en: 'NetBIOS table by name' } },
                    { flag: '-A <IP>',     desc: { de: 'NetBIOS-Tabelle nach IP', en: 'NetBIOS table by IP' } },
                    { flag: '-n',          desc: { de: 'Lokale NetBIOS-Tabelle', en: 'Local NetBIOS table' } },
                    { flag: '-r',          desc: { de: 'Aufgelöste Namen-Statistik', en: 'Resolved name statistics' } },
                    { flag: '-c',          desc: { de: 'NetBIOS-Cache anzeigen', en: 'Show NetBIOS cache' } },
                ],
                examples: [
                    { cmd: 'nbtstat -A 192.168.1.1',  desc: { de: 'NetBIOS-Info einer IP', en: 'NetBIOS info of an IP' } },
                    { cmd: 'nbtstat -n',               desc: { de: 'Lokale NetBIOS-Namen', en: 'Local NetBIOS names' } },
                ]
            },
            linux: {
                cmd: 'nbtscan',
                syntax: 'nbtscan [Optionen] <Ziel/Bereich>',
                switches: [
                    { flag: '-r <Bereich>', desc: { de: 'Netzbereich scannen (CIDR)', en: 'Scan network range (CIDR)' } },
                    { flag: '-e',           desc: { de: 'Erweiterte Ausgabe', en: 'Extended output' } },
                    { flag: '-v',           desc: { de: 'Ausführliche Ausgabe', en: 'Verbose output' } },
                ],
                examples: [
                    { cmd: 'nbtscan 192.168.1.0/24',  desc: { de: 'Gesamtes Subnetz scannen', en: 'Scan entire subnet' } },
                    { cmd: 'nbtscan -v 10.0.0.0/8',   desc: { de: 'Ausführlicher Scan', en: 'Verbose scan' } },
                ]
            }
        },

        // ===== TRANSFER (5) =====
        {
            id: 'ftp', name: 'ftp', cat: 'transfer',
            desc: { de: 'Dateiübertragung über das FTP-Protokoll', en: 'File transfer via FTP protocol' },
            win: {
                cmd: 'ftp',
                syntax: 'ftp [Optionen] <Host>',
                switches: [
                    { flag: '-s:<Datei>',  desc: { de: 'Script-Datei für Batch-Betrieb', en: 'Script file for batch mode' } },
                    { flag: '-n',          desc: { de: 'Kein Auto-Login', en: 'No auto-login' } },
                    { flag: '-i',          desc: { de: 'Nicht interaktiv (kein Prompt)', en: 'Non-interactive (no prompt)' } },
                    { flag: '-v',          desc: { de: 'Ausführliche Ausgabe deaktivieren', en: 'Disable verbose output' } },
                ],
                examples: [
                    { cmd: 'ftp server1',                  desc: { de: 'FTP-Verbindung herstellen', en: 'Establish FTP connection' } },
                    { cmd: 'ftp -s:upload.txt server1',    desc: { de: 'Batch-Upload per Script', en: 'Batch upload via script' } },
                ]
            },
            linux: {
                cmd: 'ftp',
                syntax: 'ftp [Optionen] <Host>',
                switches: [
                    { flag: '-n',          desc: { de: 'Kein Auto-Login', en: 'No auto-login' } },
                    { flag: '-v',          desc: { de: 'Ausführliche Ausgabe', en: 'Verbose output' } },
                    { flag: '-i',          desc: { de: 'Nicht interaktiv', en: 'Non-interactive' } },
                    { flag: 'mget / mput', desc: { de: 'Mehrere Dateien holen/senden', en: 'Get/put multiple files' } },
                    { flag: 'bin / ascii', desc: { de: 'Binär-/Textmodus umschalten', en: 'Switch binary/text mode' } },
                ],
                examples: [
                    { cmd: 'ftp server1',                     desc: { de: 'Interaktive FTP-Sitzung', en: 'Interactive FTP session' } },
                    { cmd: 'ftp -n server1 < script.txt',     desc: { de: 'Automatisiert per Script', en: 'Automated via script' } },
                ]
            }
        },
        {
            id: 'tftp', name: 'tftp', cat: 'transfer',
            desc: { de: 'Einfache Dateiübertragung (Trivial FTP, kein Auth)', en: 'Simple file transfer (Trivial FTP, no auth)' },
            win: {
                cmd: 'tftp',
                syntax: 'tftp [-i] <Host> [GET|PUT] <Datei>',
                switches: [
                    { flag: '-i',          desc: { de: 'Binärmodus (für Firmware etc.)', en: 'Binary mode (for firmware etc.)' } },
                    { flag: 'GET <Datei>', desc: { de: 'Datei vom Server holen', en: 'Get file from server' } },
                    { flag: 'PUT <Datei>', desc: { de: 'Datei zum Server senden', en: 'Send file to server' } },
                ],
                examples: [
                    { cmd: 'tftp -i 192.168.1.1 GET firmware.bin',  desc: { de: 'Firmware herunterladen', en: 'Download firmware' } },
                    { cmd: 'tftp -i 192.168.1.1 PUT config.cfg',   desc: { de: 'Konfiguration hochladen', en: 'Upload configuration' } },
                ]
            },
            linux: {
                cmd: 'tftp',
                syntax: 'tftp <Host> [-c get|put <Datei>]',
                switches: [
                    { flag: '-c get <Datei>', desc: { de: 'Datei holen (Command-Line)', en: 'Get file (command line)' } },
                    { flag: '-c put <Datei>', desc: { de: 'Datei senden', en: 'Send file' } },
                    { flag: '-m binary',      desc: { de: 'Binärmodus', en: 'Binary mode' } },
                ],
                examples: [
                    { cmd: 'tftp 192.168.1.1 -c get firmware.bin',  desc: { de: 'Firmware herunterladen', en: 'Download firmware' } },
                    { cmd: 'tftp 192.168.1.1 -c put config.cfg',   desc: { de: 'Konfiguration hochladen', en: 'Upload configuration' } },
                ]
            }
        },
        {
            id: 'curl', name: 'curl', cat: 'transfer',
            desc: { de: 'HTTP(S)-Anfragen und Datenübertragung (ab Win10)', en: 'HTTP(S) requests and data transfer (Win10+)' },
            win: {
                cmd: 'curl',
                syntax: 'curl [Optionen] <URL>',
                switches: [
                    { flag: '-o <Datei>',  desc: { de: 'Ausgabe in Datei speichern', en: 'Save output to file' } },
                    { flag: '-O',          desc: { de: 'Dateiname vom Server übernehmen', en: 'Use filename from server' } },
                    { flag: '-I',          desc: { de: 'Nur HTTP-Header anzeigen', en: 'Show HTTP headers only' } },
                    { flag: '-X <Method>', desc: { de: 'HTTP-Methode (GET, POST, PUT, DELETE)', en: 'HTTP method (GET, POST, PUT, DELETE)' } },
                    { flag: '-H "Header"', desc: { de: 'HTTP-Header mitgeben', en: 'Include HTTP header' } },
                    { flag: '-d "Daten"',  desc: { de: 'POST-Daten senden', en: 'Send POST data' } },
                    { flag: '-L',          desc: { de: 'Redirects automatisch folgen', en: 'Follow redirects automatically' } },
                    { flag: '-v',          desc: { de: 'Ausführliche Ausgabe', en: 'Verbose output' } },
                ],
                examples: [
                    { cmd: 'curl -I https://example.com',                          desc: { de: 'HTTP-Header abfragen', en: 'Query HTTP headers' } },
                    { cmd: 'curl -o datei.zip https://example.com/datei.zip',      desc: { de: 'Datei herunterladen', en: 'Download file' } },
                ]
            },
            linux: {
                cmd: 'curl',
                syntax: 'curl [Optionen] <URL>',
                switches: [
                    { flag: '-o <Datei>',  desc: { de: 'Ausgabe in Datei speichern', en: 'Save output to file' } },
                    { flag: '-O',          desc: { de: 'Dateiname vom Server übernehmen', en: 'Use filename from server' } },
                    { flag: '-I',          desc: { de: 'Nur HTTP-Header anzeigen', en: 'Show HTTP headers only' } },
                    { flag: '-X <Method>', desc: { de: 'HTTP-Methode', en: 'HTTP method' } },
                    { flag: '-H "Header"', desc: { de: 'HTTP-Header mitgeben', en: 'Include HTTP header' } },
                    { flag: '-d "Daten"',  desc: { de: 'POST-Daten senden', en: 'Send POST data' } },
                    { flag: '-s',          desc: { de: 'Silent-Modus (kein Fortschritt)', en: 'Silent mode (no progress)' } },
                    { flag: '-k',          desc: { de: 'TLS-Zertifikat nicht prüfen', en: 'Skip TLS certificate check' } },
                ],
                examples: [
                    { cmd: 'curl -sL https://example.com | head',                  desc: { de: 'Erste Zeilen einer Seite', en: 'First lines of a page' } },
                    { cmd: 'curl -X POST -H "Content-Type: application/json" -d \'{"key":"val"}\' https://api.example.com', desc: { de: 'JSON-POST an API', en: 'JSON POST to API' } },
                ]
            }
        },
        {
            id: 'wget', name: 'wget', cat: 'transfer',
            desc: { de: 'Dateien und Webseiten herunterladen (rekursiv möglich)', en: 'Download files and websites (recursive possible)' },
            win: null,
            winHint: { de: 'Nicht in Windows enthalten. Verwende curl -O oder Invoke-WebRequest (PowerShell).', en: 'Not included in Windows. Use curl -O or Invoke-WebRequest (PowerShell).' },
            linux: {
                cmd: 'wget',
                syntax: 'wget [Optionen] <URL>',
                switches: [
                    { flag: '-O <Datei>',  desc: { de: 'Zieldateiname festlegen', en: 'Set target filename' } },
                    { flag: '-q',          desc: { de: 'Stille Ausgabe', en: 'Quiet output' } },
                    { flag: '-r',          desc: { de: 'Rekursiver Download', en: 'Recursive download' } },
                    { flag: '-c',          desc: { de: 'Abgebrochenen Download fortsetzen', en: 'Resume interrupted download' } },
                    { flag: '--mirror',    desc: { de: 'Komplette Website spiegeln', en: 'Mirror complete website' } },
                    { flag: '-P <Ordner>', desc: { de: 'Zielverzeichnis festlegen', en: 'Set target directory' } },
                ],
                examples: [
                    { cmd: 'wget https://example.com/datei.zip',            desc: { de: 'Datei herunterladen', en: 'Download file' } },
                    { cmd: 'wget -r -l 2 https://example.com/docs/',       desc: { de: 'Rekursiv (2 Ebenen tief)', en: 'Recursive (2 levels deep)' } },
                    { cmd: 'wget -c https://example.com/grossedatei.iso',  desc: { de: 'Download fortsetzen', en: 'Resume download' } },
                ]
            }
        },
        {
            id: 'scp', name: 'scp', cat: 'transfer',
            desc: { de: 'Sichere Dateiübertragung über SSH (OpenSSH)', en: 'Secure file transfer via SSH (OpenSSH)' },
            win: {
                cmd: 'scp',
                syntax: 'scp [Optionen] <Quelle> <Ziel>',
                switches: [
                    { flag: '-P <Port>',   desc: { de: 'SSH-Port angeben (großes P)', en: 'Specify SSH port (capital P)' } },
                    { flag: '-r',          desc: { de: 'Rekursiv (Verzeichnisse)', en: 'Recursive (directories)' } },
                    { flag: '-i <Key>',    desc: { de: 'Private-Key-Datei angeben', en: 'Specify private key file' } },
                    { flag: '-C',          desc: { de: 'Kompression aktivieren', en: 'Enable compression' } },
                ],
                examples: [
                    { cmd: 'scp datei.txt user@server:/home/user/',  desc: { de: 'Datei zum Server kopieren', en: 'Copy file to server' } },
                    { cmd: 'scp -r ordner/ user@server:/backup/',    desc: { de: 'Verzeichnis rekursiv kopieren', en: 'Copy directory recursively' } },
                ]
            },
            linux: {
                cmd: 'scp',
                syntax: 'scp [Optionen] <Quelle> <Ziel>',
                switches: [
                    { flag: '-P <Port>',   desc: { de: 'SSH-Port angeben', en: 'Specify SSH port' } },
                    { flag: '-r',          desc: { de: 'Rekursiv (Verzeichnisse)', en: 'Recursive (directories)' } },
                    { flag: '-i <Key>',    desc: { de: 'Private-Key-Datei angeben', en: 'Specify private key file' } },
                    { flag: '-C',          desc: { de: 'Kompression aktivieren', en: 'Enable compression' } },
                    { flag: '-v',          desc: { de: 'Ausführliche Ausgabe', en: 'Verbose output' } },
                ],
                examples: [
                    { cmd: 'scp user@server:/var/log/syslog .',             desc: { de: 'Datei vom Server holen', en: 'Get file from server' } },
                    { cmd: 'scp -P 2222 -r /data/ user@server:/backup/',   desc: { de: 'Über Port 2222 rekursiv', en: 'Recursive via port 2222' } },
                ]
            }
        },

        // ===== REMOTE (3) =====
        {
            id: 'ssh', name: 'ssh', cat: 'remote',
            desc: { de: 'Sichere Fernverbindung (Secure Shell, ab Win10)', en: 'Secure remote connection (Secure Shell, Win10+)' },
            win: {
                cmd: 'ssh',
                syntax: 'ssh [Optionen] <user@host>',
                switches: [
                    { flag: '-p <Port>',   desc: { de: 'SSH-Port angeben', en: 'Specify SSH port' } },
                    { flag: '-i <Key>',    desc: { de: 'Private-Key-Datei', en: 'Private key file' } },
                    { flag: '-L <lokal:host:remote>', desc: { de: 'Port-Forwarding (lokal)', en: 'Port forwarding (local)' } },
                    { flag: '-v',          desc: { de: 'Ausführliche Ausgabe (Debug)', en: 'Verbose output (debug)' } },
                ],
                examples: [
                    { cmd: 'ssh user@server',                         desc: { de: 'Verbindung herstellen', en: 'Establish connection' } },
                    { cmd: 'ssh -p 2222 -i key.pem user@server',     desc: { de: 'Port + Key angeben', en: 'Specify port + key' } },
                ]
            },
            linux: {
                cmd: 'ssh',
                syntax: 'ssh [Optionen] <user@host>',
                switches: [
                    { flag: '-p <Port>',   desc: { de: 'SSH-Port angeben', en: 'Specify SSH port' } },
                    { flag: '-i <Key>',    desc: { de: 'Private-Key-Datei', en: 'Private key file' } },
                    { flag: '-L <lokal:host:remote>', desc: { de: 'Port-Forwarding (lokal)', en: 'Port forwarding (local)' } },
                    { flag: '-R <remote:host:lokal>', desc: { de: 'Reverse-Tunnel', en: 'Reverse tunnel' } },
                    { flag: '-D <Port>',   desc: { de: 'SOCKS-Proxy (dynamisch)', en: 'SOCKS proxy (dynamic)' } },
                    { flag: '-X',          desc: { de: 'X11-Forwarding (GUI)', en: 'X11 forwarding (GUI)' } },
                ],
                examples: [
                    { cmd: 'ssh user@server',                             desc: { de: 'Verbindung herstellen', en: 'Establish connection' } },
                    { cmd: 'ssh -L 8080:localhost:80 user@server',       desc: { de: 'Lokaler Tunnel (Port 8080 → 80)', en: 'Local tunnel (port 8080 → 80)' } },
                    { cmd: 'ssh -D 9090 user@proxy',                     desc: { de: 'SOCKS-Proxy auf Port 9090', en: 'SOCKS proxy on port 9090' } },
                ]
            }
        },
        {
            id: 'telnet', name: 'telnet', cat: 'remote',
            desc: { de: 'Unverschlüsselte Fernverbindung / Port-Test', en: 'Unencrypted remote connection / port test' },
            win: {
                cmd: 'telnet',
                syntax: 'telnet <Host> [Port]',
                switches: [
                    { flag: '<Host> <Port>', desc: { de: 'Verbindung zu Host auf Port', en: 'Connect to host on port' } },
                    { flag: '(Hinweis)',     desc: { de: 'Muss unter "Windows-Features" aktiviert werden', en: 'Must be enabled in "Windows Features"' } },
                ],
                examples: [
                    { cmd: 'telnet server1 25',       desc: { de: 'SMTP-Port testen', en: 'Test SMTP port' } },
                    { cmd: 'telnet 192.168.1.1 80',   desc: { de: 'HTTP-Port testen', en: 'Test HTTP port' } },
                ]
            },
            linux: {
                cmd: 'telnet',
                syntax: 'telnet <Host> [Port]',
                switches: [
                    { flag: '<Host> <Port>', desc: { de: 'Verbindung zu Host auf Port', en: 'Connect to host on port' } },
                ],
                examples: [
                    { cmd: 'telnet server1 25',        desc: { de: 'SMTP-Port testen', en: 'Test SMTP port' } },
                    { cmd: 'telnet 192.168.1.1 443',   desc: { de: 'HTTPS-Port testen', en: 'Test HTTPS port' } },
                ]
            }
        },
        {
            id: 'netuse', name: 'net use / smbclient', cat: 'remote',
            desc: { de: 'Netzlaufwerke (SMB/CIFS) verbinden und verwalten', en: 'Connect and manage network drives (SMB/CIFS)' },
            win: {
                cmd: 'net use',
                syntax: 'net use [Laufwerk:] \\\\Server\\Freigabe [Optionen]',
                switches: [
                    { flag: '/user:<Dom\\User>', desc: { de: 'Benutzername angeben', en: 'Specify username' } },
                    { flag: '/persistent:yes',   desc: { de: 'Nach Neustart wiederherstellen', en: 'Restore after reboot' } },
                    { flag: '/delete',           desc: { de: 'Laufwerk trennen', en: 'Disconnect drive' } },
                    { flag: '(ohne Parameter)',  desc: { de: 'Aktive Verbindungen anzeigen', en: 'Show active connections' } },
                ],
                examples: [
                    { cmd: 'net use',                                           desc: { de: 'Verbundene Laufwerke anzeigen', en: 'Show connected drives' } },
                    { cmd: 'net use Z: \\\\server\\share /user:domain\\user',  desc: { de: 'Netzlaufwerk verbinden', en: 'Map network drive' } },
                    { cmd: 'net use Z: /delete',                               desc: { de: 'Laufwerk Z: trennen', en: 'Disconnect drive Z:' } },
                ]
            },
            linux: {
                cmd: 'smbclient',
                syntax: 'smbclient //<Server>/<Freigabe> [Optionen]',
                switches: [
                    { flag: '-U <User>',   desc: { de: 'Benutzername angeben', en: 'Specify username' } },
                    { flag: '-L <Server>', desc: { de: 'Verfügbare Freigaben auflisten', en: 'List available shares' } },
                    { flag: '-c "<Befehl>"', desc: { de: 'Befehl direkt ausführen', en: 'Execute command directly' } },
                    { flag: '-N',          desc: { de: 'Kein Passwort (anonym)', en: 'No password (anonymous)' } },
                ],
                examples: [
                    { cmd: 'smbclient //server/share -U user',    desc: { de: 'Interaktive SMB-Sitzung', en: 'Interactive SMB session' } },
                    { cmd: 'smbclient -L server -U user',         desc: { de: 'Freigaben auflisten', en: 'List shares' } },
                ]
            }
        },

        // ===== INFO (4) =====
        {
            id: 'whoami', name: 'whoami', cat: 'info',
            desc: { de: 'Aktuellen Benutzer, Gruppen und Berechtigungen anzeigen', en: 'Show current user, groups and permissions' },
            win: {
                cmd: 'whoami',
                syntax: 'whoami [Optionen]',
                switches: [
                    { flag: '(ohne)',      desc: { de: 'Aktuellen Benutzernamen anzeigen', en: 'Show current username' } },
                    { flag: '/user',       desc: { de: 'Benutzer-SID anzeigen', en: 'Show user SID' } },
                    { flag: '/groups',     desc: { de: 'Gruppenmitgliedschaften anzeigen', en: 'Show group memberships' } },
                    { flag: '/priv',       desc: { de: 'Zugewiesene Berechtigungen anzeigen', en: 'Show assigned privileges' } },
                    { flag: '/all',        desc: { de: 'Alle Informationen (User, SID, Gruppen, Priv)', en: 'All information (user, SID, groups, priv)' } },
                    { flag: '/fo TABLE|LIST|CSV', desc: { de: 'Ausgabeformat festlegen', en: 'Set output format' } },
                ],
                examples: [
                    { cmd: 'whoami',            desc: { de: 'Benutzername (DOMAIN\\User)', en: 'Username (DOMAIN\\User)' } },
                    { cmd: 'whoami /all',       desc: { de: 'Vollständige Info (SID, Gruppen, Priv)', en: 'Complete info (SID, groups, priv)' } },
                    { cmd: 'whoami /groups',    desc: { de: 'Gruppenmitgliedschaften', en: 'Group memberships' } },
                ]
            },
            linux: {
                cmd: 'whoami / id',
                syntax: 'whoami | id [Optionen] [Benutzer]',
                switches: [
                    { flag: 'whoami',      desc: { de: 'Aktuellen Benutzernamen anzeigen', en: 'Show current username' } },
                    { flag: 'id',          desc: { de: 'UID, GID und Gruppen anzeigen', en: 'Show UID, GID and groups' } },
                    { flag: 'id -u',       desc: { de: 'Nur User-ID (UID)', en: 'User ID (UID) only' } },
                    { flag: 'id -g',       desc: { de: 'Nur Group-ID (GID)', en: 'Group ID (GID) only' } },
                    { flag: 'id -Gn',      desc: { de: 'Alle Gruppennamen', en: 'All group names' } },
                    { flag: 'groups',      desc: { de: 'Gruppenmitgliedschaften', en: 'Group memberships' } },
                ],
                examples: [
                    { cmd: 'whoami',       desc: { de: 'Benutzername anzeigen', en: 'Show username' } },
                    { cmd: 'id',           desc: { de: 'UID, GID und alle Gruppen', en: 'UID, GID and all groups' } },
                    { cmd: 'id -Gn',       desc: { de: 'Alle Gruppennamen auflisten', en: 'List all group names' } },
                ]
            }
        },
        {
            id: 'systeminfo', name: 'systeminfo / uname', cat: 'info',
            desc: { de: 'Systeminformationen anzeigen (OS, Hardware, Netzwerk)', en: 'Display system information (OS, hardware, network)' },
            win: {
                cmd: 'systeminfo',
                syntax: 'systeminfo [Optionen]',
                switches: [
                    { flag: '/s <Server>',  desc: { de: 'Remotecomputer abfragen', en: 'Query remote computer' } },
                    { flag: '/fo TABLE|LIST|CSV', desc: { de: 'Ausgabeformat', en: 'Output format' } },
                    { flag: '| findstr "..."', desc: { de: 'Ausgabe filtern', en: 'Filter output' } },
                ],
                examples: [
                    { cmd: 'systeminfo',                                 desc: { de: 'Vollständige Systeminfo', en: 'Complete system info' } },
                    { cmd: 'systeminfo | findstr "Betriebssystem"',     desc: { de: 'Nur OS-Infos filtern', en: 'Filter OS info only' } },
                    { cmd: 'systeminfo /fo CSV > info.csv',             desc: { de: 'Als CSV exportieren', en: 'Export as CSV' } },
                ]
            },
            linux: {
                cmd: 'uname / hostnamectl',
                syntax: 'uname [Optionen] | hostnamectl',
                switches: [
                    { flag: '-a',          desc: { de: 'Alle Systeminfos (Kernel, Arch)', en: 'All system info (kernel, arch)' } },
                    { flag: '-r',          desc: { de: 'Nur Kernel-Version', en: 'Kernel version only' } },
                    { flag: '-m',          desc: { de: 'Maschinen-Architektur (x86_64)', en: 'Machine architecture (x86_64)' } },
                    { flag: 'hostnamectl', desc: { de: 'Ausführlich (OS, Kernel, Chassis)', en: 'Detailed (OS, kernel, chassis)' } },
                ],
                examples: [
                    { cmd: 'uname -a',            desc: { de: 'Kernel + Architektur', en: 'Kernel + architecture' } },
                    { cmd: 'hostnamectl',          desc: { de: 'Ausführliche System-Info', en: 'Detailed system info' } },
                    { cmd: 'cat /etc/os-release',  desc: { de: 'Distribution + Version', en: 'Distribution + version' } },
                ]
            }
        },
        {
            id: 'porttest', name: 'Test-NetConnection / nc', cat: 'info',
            desc: { de: 'Port-Erreichbarkeit testen und Netzwerk-Diagnose', en: 'Test port reachability and network diagnostics' },
            win: {
                cmd: 'Test-NetConnection',
                syntax: 'Test-NetConnection <Host> [-Port <Port>] [Optionen]',
                switches: [
                    { flag: '-Port <Port>',                desc: { de: 'TCP-Port prüfen', en: 'Check TCP port' } },
                    { flag: '-InformationLevel Detailed',  desc: { de: 'Ausführliche Ausgabe', en: 'Detailed output' } },
                    { flag: '-TraceRoute',                 desc: { de: 'Routenverfolgung einschließen', en: 'Include route tracing' } },
                ],
                examples: [
                    { cmd: 'Test-NetConnection example.com -Port 443',       desc: { de: 'HTTPS-Port prüfen', en: 'Check HTTPS port' } },
                    { cmd: 'Test-NetConnection 8.8.8.8 -TraceRoute',         desc: { de: 'Ping + Traceroute', en: 'Ping + traceroute' } },
                ]
            },
            linux: {
                cmd: 'nc (netcat)',
                syntax: 'nc [Optionen] <Host> <Port>',
                switches: [
                    { flag: '-z',          desc: { de: 'Scan-Modus (nur prüfen, keine Daten)', en: 'Scan mode (check only, no data)' } },
                    { flag: '-v',          desc: { de: 'Ausführliche Ausgabe', en: 'Verbose output' } },
                    { flag: '-w <Sek>',    desc: { de: 'Timeout in Sekunden', en: 'Timeout in seconds' } },
                    { flag: '-l',          desc: { de: 'Listen-Modus (Server)', en: 'Listen mode (server)' } },
                    { flag: '-p <Port>',   desc: { de: 'Lokalen Port festlegen', en: 'Set local port' } },
                    { flag: '-u',          desc: { de: 'UDP statt TCP', en: 'UDP instead of TCP' } },
                ],
                examples: [
                    { cmd: 'nc -zv example.com 443',    desc: { de: 'Port 443 prüfen', en: 'Check port 443' } },
                    { cmd: 'nc -l -p 8080',              desc: { de: 'Auf Port 8080 lauschen', en: 'Listen on port 8080' } },
                    { cmd: 'nc -zv server1 20-25',       desc: { de: 'Port-Range scannen', en: 'Scan port range' } },
                ]
            }
        },
        {
            id: 'capture', name: 'pktmon / tcpdump', cat: 'info',
            desc: { de: 'Netzwerkverkehr mitschneiden und analysieren', en: 'Capture and analyze network traffic' },
            win: {
                cmd: 'pktmon / netsh trace',
                syntax: 'pktmon <Aktion> [Optionen]',
                switches: [
                    { flag: 'pktmon start --capture',  desc: { de: 'Mitschnitt starten', en: 'Start capture' } },
                    { flag: 'pktmon stop',             desc: { de: 'Mitschnitt beenden', en: 'Stop capture' } },
                    { flag: 'pktmon list',             desc: { de: 'Interfaces auflisten', en: 'List interfaces' } },
                    { flag: 'pktmon counters',         desc: { de: 'Paket-Zähler anzeigen', en: 'Show packet counters' } },
                    { flag: 'netsh trace start capture=yes', desc: { de: 'Alternative: netsh trace', en: 'Alternative: netsh trace' } },
                    { flag: 'netsh trace stop',        desc: { de: 'netsh trace beenden', en: 'Stop netsh trace' } },
                ],
                examples: [
                    { cmd: 'pktmon start --capture -c',                            desc: { de: 'Packet Monitor starten', en: 'Start Packet Monitor' } },
                    { cmd: 'netsh trace start capture=yes tracefile=trace.etl',    desc: { de: 'Trace in Datei', en: 'Trace to file' } },
                ]
            },
            linux: {
                cmd: 'tcpdump',
                syntax: 'tcpdump [Optionen] [Filter]',
                switches: [
                    { flag: '-i <IF>',     desc: { de: 'Interface wählen (any = alle)', en: 'Select interface (any = all)' } },
                    { flag: '-n',          desc: { de: 'Keine DNS-Auflösung', en: 'No DNS resolution' } },
                    { flag: '-c <Anz>',    desc: { de: 'Nach n Paketen stoppen', en: 'Stop after n packets' } },
                    { flag: '-w <Datei>',  desc: { de: 'In PCAP-Datei schreiben', en: 'Write to PCAP file' } },
                    { flag: '-r <Datei>',  desc: { de: 'PCAP-Datei lesen', en: 'Read PCAP file' } },
                    { flag: 'port <Port>', desc: { de: 'Nach Port filtern', en: 'Filter by port' } },
                    { flag: 'host <Host>', desc: { de: 'Nach Host filtern', en: 'Filter by host' } },
                    { flag: '-X',          desc: { de: 'Hex + ASCII Ausgabe', en: 'Hex + ASCII output' } },
                ],
                examples: [
                    { cmd: 'tcpdump -i eth0 -n port 80',       desc: { de: 'HTTP-Traffic auf eth0', en: 'HTTP traffic on eth0' } },
                    { cmd: 'tcpdump -i any -w capture.pcap',   desc: { de: 'Alles in Datei mitschneiden', en: 'Capture everything to file' } },
                    { cmd: 'tcpdump -r capture.pcap',           desc: { de: 'PCAP-Datei analysieren', en: 'Analyze PCAP file' } },
                ]
            }
        },

        // ===== WINDOWS CPL-MODULE (16) =====
        {
            id: 'firewall-cpl', name: 'firewall.cpl', cat: 'win-cpl',
            desc: { de: 'Windows Defender Firewall öffnen', en: 'Open Windows Defender Firewall' },
            win: {
                cmd: 'firewall.cpl',
                syntax: 'firewall.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Startet direkt die Windows Defender Firewall', en: 'Directly opens Windows Defender Firewall' } },
                ],
                examples: [
                    { cmd: 'firewall.cpl',           desc: { de: 'Firewall-Einstellungen öffnen', en: 'Open firewall settings' } },
                    { cmd: 'control firewall.cpl',   desc: { de: 'Alternative über control', en: 'Alternative via control' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Kein direktes Pendant. Verwende ufw (Befehlszeile) oder iptables.', en: 'No direct equivalent. Use ufw (command line) or iptables.' }
        },
        {
            id: 'inetcpl', name: 'inetcpl.cpl', cat: 'win-cpl',
            desc: { de: 'Interneteigenschaften (Proxy, Sicherheit, Zertifikate)', en: 'Internet Properties (proxy, security, certificates)' },
            win: {
                cmd: 'inetcpl.cpl',
                syntax: 'inetcpl.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Startet Interneteigenschaften (IE/System-Proxy)', en: 'Opens Internet Properties (IE/system proxy)' } },
                ],
                examples: [
                    { cmd: 'inetcpl.cpl',          desc: { de: 'Interneteigenschaften öffnen', en: 'Open Internet Properties' } },
                    { cmd: 'control inetcpl.cpl',  desc: { de: 'Alternative über control', en: 'Alternative via control' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Proxy-Einstellungen über /etc/environment oder Einstellungen der Desktop-Umgebung.', en: 'Proxy settings via /etc/environment or desktop environment settings.' }
        },
        {
            id: 'sysdm', name: 'sysdm.cpl', cat: 'win-cpl',
            desc: { de: 'Systemeigenschaften (Computername, Hardware, Remotedesktop)', en: 'System Properties (computer name, hardware, remote desktop)' },
            win: {
                cmd: 'sysdm.cpl',
                syntax: 'sysdm.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Systemeigenschaften öffnen', en: 'Open System Properties' } },
                ],
                examples: [
                    { cmd: 'sysdm.cpl',      desc: { de: 'Systemeigenschaften öffnen', en: 'Open System Properties' } },
                    { cmd: 'sysdm.cpl ,3',   desc: { de: 'Direkt Tab "Erweitert" öffnen', en: 'Open "Advanced" tab directly' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Systeminfos: hostnamectl, uname -a, /etc/os-release.', en: 'System info: hostnamectl, uname -a, /etc/os-release.' }
        },
        {
            id: 'appwiz', name: 'appwiz.cpl', cat: 'win-cpl',
            desc: { de: 'Programme und Features (Deinstallation)', en: 'Programs and Features (uninstall)' },
            win: {
                cmd: 'appwiz.cpl',
                syntax: 'appwiz.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Liste aller installierten Programme', en: 'List of all installed programs' } },
                ],
                examples: [
                    { cmd: 'appwiz.cpl',          desc: { de: 'Programme und Features öffnen', en: 'Open Programs and Features' } },
                    { cmd: 'control appwiz.cpl',  desc: { de: 'Alternative über control', en: 'Alternative via control' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Paketverwaltung: apt list --installed, dnf list installed, dpkg -l.', en: 'Package management: apt list --installed, dnf list installed, dpkg -l.' }
        },
        {
            id: 'powercfg-cpl', name: 'powercfg.cpl', cat: 'win-cpl',
            desc: { de: 'Energieoptionen (Energiesparpläne, Ruhezustand)', en: 'Power Options (power plans, hibernation)' },
            win: {
                cmd: 'powercfg.cpl',
                syntax: 'powercfg.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Energieoptionen öffnen', en: 'Open Power Options' } },
                ],
                examples: [
                    { cmd: 'powercfg.cpl',   desc: { de: 'Energieoptionen öffnen', en: 'Open Power Options' } },
                    { cmd: 'powercfg /l',    desc: { de: 'Energiepäne per CLI auflisten', en: 'List power plans via CLI' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Energieverwaltung: TLP, powertop, systemctl suspend/hibernate.', en: 'Power management: TLP, powertop, systemctl suspend/hibernate.' }
        },
        {
            id: 'timedate', name: 'timedate.cpl', cat: 'win-cpl',
            desc: { de: 'Datum und Uhrzeit (Zeitzone, NTP-Synchronisation)', en: 'Date and Time (timezone, NTP sync)' },
            win: {
                cmd: 'timedate.cpl',
                syntax: 'timedate.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Datum- und Uhrzeit-Einstellungen öffnen', en: 'Open Date and Time settings' } },
                ],
                examples: [
                    { cmd: 'timedate.cpl',    desc: { de: 'Datums- und Uhrzeit-Dialog öffnen', en: 'Open Date and Time dialog' } },
                    { cmd: 'w32tm /resync',   desc: { de: 'Zeit per CLI sofort synchronisieren', en: 'Sync time immediately via CLI' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Zeitverwaltung: timedatectl, timedatectl set-timezone Europe/Berlin.', en: 'Time management: timedatectl, timedatectl set-timezone Europe/Berlin.' }
        },
        {
            id: 'intl', name: 'intl.cpl', cat: 'win-cpl',
            desc: { de: 'Region und Sprache (Zahlenformat, Währung, Tastaturlayout)', en: 'Region and Language (number format, currency, keyboard layout)' },
            win: {
                cmd: 'intl.cpl',
                syntax: 'intl.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Regions- und Spracheinstellungen öffnen', en: 'Open Region and Language settings' } },
                ],
                examples: [
                    { cmd: 'intl.cpl',         desc: { de: 'Regionseinstellungen öffnen', en: 'Open Region settings' } },
                    { cmd: 'control intl.cpl', desc: { de: 'Alternative über control', en: 'Alternative via control' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Regionseinstellungen: localectl, /etc/locale.conf, locale-gen.', en: 'Region settings: localectl, /etc/locale.conf, locale-gen.' }
        },
        {
            id: 'wscui', name: 'wscui.cpl', cat: 'win-cpl',
            desc: { de: 'Sicherheit und Wartung (Action Center)', en: 'Security and Maintenance (Action Center)' },
            win: {
                cmd: 'wscui.cpl',
                syntax: 'wscui.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Sicherheits- und Wartungscenter öffnen', en: 'Open Security and Maintenance Center' } },
                ],
                examples: [
                    { cmd: 'wscui.cpl', desc: { de: 'Sicherheit und Wartung öffnen', en: 'Open Security and Maintenance' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Kein direktes Pendant. Sicherheitsstatus: ufw status, rkhunter --check.', en: 'No direct equivalent. Security status: ufw status, rkhunter --check.' }
        },
        {
            id: 'desk', name: 'desk.cpl', cat: 'win-cpl',
            desc: { de: 'Anzeigeeinstellungen (Auflösung, Orientierung, Mehrere Monitore)', en: 'Display Settings (resolution, orientation, multiple monitors)' },
            win: {
                cmd: 'desk.cpl',
                syntax: 'desk.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Anzeigeeinstellungen öffnen', en: 'Open Display Settings' } },
                ],
                examples: [
                    { cmd: 'desk.cpl', desc: { de: 'Anzeigeeinstellungen öffnen', en: 'Open Display Settings' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Anzeigeeinstellungen: xrandr, arandr (GUI), GNOME/KDE Bildschirmeinstellungen.', en: 'Display settings: xrandr, arandr (GUI), GNOME/KDE display settings.' }
        },
        {
            id: 'mmsys', name: 'mmsys.cpl', cat: 'win-cpl',
            desc: { de: 'Sound-Einstellungen (Wiedergabe, Aufnahme, Systemklänge)', en: 'Sound Settings (playback, recording, system sounds)' },
            win: {
                cmd: 'mmsys.cpl',
                syntax: 'mmsys.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Soundeinstellungen öffnen', en: 'Open Sound Settings' } },
                ],
                examples: [
                    { cmd: 'mmsys.cpl',      desc: { de: 'Sound-Dialog öffnen', en: 'Open Sound dialog' } },
                    { cmd: 'mmsys.cpl ,1',   desc: { de: 'Direkt Tab "Aufnahme" öffnen', en: 'Open "Recording" tab directly' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Audioeinstellungen: alsamixer (TUI), pavucontrol (GUI), pactl list sinks.', en: 'Audio settings: alsamixer (TUI), pavucontrol (GUI), pactl list sinks.' }
        },
        {
            id: 'main-cpl', name: 'main.cpl', cat: 'win-cpl',
            desc: { de: 'Maus-Einstellungen (Zeiger, Tasten, Zeigerrad)', en: 'Mouse Settings (pointer, buttons, scroll wheel)' },
            win: {
                cmd: 'main.cpl',
                syntax: 'main.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Mauseinstellungen öffnen', en: 'Open Mouse Settings' } },
                ],
                examples: [
                    { cmd: 'main.cpl', desc: { de: 'Maus-Einstellungen öffnen', en: 'Open Mouse Settings' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Mauseinstellungen: xinput, xset m, GNOME/KDE Mauseinstellungen.', en: 'Mouse settings: xinput, xset m, GNOME/KDE mouse settings.' }
        },
        {
            id: 'bthprops', name: 'bthprops.cpl', cat: 'win-cpl',
            desc: { de: 'Bluetooth-Geräte verwalten', en: 'Manage Bluetooth devices' },
            win: {
                cmd: 'bthprops.cpl',
                syntax: 'bthprops.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Bluetooth-Einstellungen öffnen', en: 'Open Bluetooth Settings' } },
                ],
                examples: [
                    { cmd: 'bthprops.cpl', desc: { de: 'Bluetooth-Einstellungen öffnen', en: 'Open Bluetooth Settings' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Bluetooth: bluetoothctl, blueman-manager (GUI).', en: 'Bluetooth: bluetoothctl, blueman-manager (GUI).' }
        },
        {
            id: 'joy', name: 'joy.cpl', cat: 'win-cpl',
            desc: { de: 'Gamecontroller und Joysticks konfigurieren', en: 'Configure game controllers and joysticks' },
            win: {
                cmd: 'joy.cpl',
                syntax: 'joy.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Öffnet den Gamecontroller-Dialog', en: 'Opens the Game Controller dialog' } },
                ],
                examples: [
                    { cmd: 'joy.cpl', desc: { de: 'Gamecontroller-Einstellungen öffnen', en: 'Open Game Controller settings' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Controller-Test: jstest /dev/input/js0, evtest.', en: 'Controller test: jstest /dev/input/js0, evtest.' }
        },
        {
            id: 'hdwwiz', name: 'hdwwiz.cpl', cat: 'win-cpl',
            desc: { de: 'Hardware-Assistent (Legacy-Geräte manuell installieren)', en: 'Hardware Wizard (manually install legacy devices)' },
            win: {
                cmd: 'hdwwiz.cpl',
                syntax: 'hdwwiz.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Hardware-Assistent starten', en: 'Start Hardware Wizard' } },
                ],
                examples: [
                    { cmd: 'hdwwiz.cpl', desc: { de: 'Hardware-Assistent öffnen', en: 'Open Hardware Wizard' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Hardware-Erkennung: udev, modprobe, lspci -k, lsusb.', en: 'Hardware detection: udev, modprobe, lspci -k, lsusb.' }
        },
        {
            id: 'access', name: 'access.cpl', cat: 'win-cpl',
            desc: { de: 'Center für erleichterte Bedienung (Barrierefreiheit)', en: 'Ease of Access Center (accessibility)' },
            win: {
                cmd: 'access.cpl',
                syntax: 'access.cpl',
                switches: [
                    { flag: '(keine)', desc: { de: 'Bedienungshilfen öffnen', en: 'Open Ease of Access' } },
                ],
                examples: [
                    { cmd: 'access.cpl', desc: { de: 'Bedienungshilfen öffnen', en: 'Open Ease of Access' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Bedienungshilfen: Zugänglichkeitseinstellungen in GNOME/KDE.', en: 'Accessibility: accessibility settings in GNOME/KDE.' }
        },

        // ===== WINDOWS MSC-SNAPINS (13) =====
        {
            id: 'compmgmt', name: 'compmgmt.msc', cat: 'win-msc',
            desc: { de: 'Computerverwaltung (Geräte, Dienste, Datenträger, lokale Benutzer)', en: 'Computer Management (devices, services, disks, local users)' },
            win: {
                cmd: 'compmgmt.msc',
                syntax: 'compmgmt.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Öffnet die Computerverwaltung', en: 'Opens Computer Management' } },
                ],
                examples: [
                    { cmd: 'compmgmt.msc', desc: { de: 'Computerverwaltung öffnen', en: 'Open Computer Management' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Kein direktes Pendant — entspricht einer Sammlung aus: systemctl, lsblk, useradd u.a.', en: 'No direct equivalent — corresponds to a collection of: systemctl, lsblk, useradd etc.' }
        },
        {
            id: 'devmgmt', name: 'devmgmt.msc', cat: 'win-msc',
            desc: { de: 'Geräte-Manager (Treiber, Hardware-Status, Fehlerdiagnose)', en: 'Device Manager (drivers, hardware status, troubleshooting)' },
            win: {
                cmd: 'devmgmt.msc',
                syntax: 'devmgmt.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Geräte-Manager öffnen', en: 'Open Device Manager' } },
                ],
                examples: [
                    { cmd: 'devmgmt.msc', desc: { de: 'Geräte-Manager öffnen', en: 'Open Device Manager' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Geräte-Info: lspci, lsusb, lshw, dmesg | grep -i error.', en: 'Device info: lspci, lsusb, lshw, dmesg | grep -i error.' }
        },
        {
            id: 'diskmgmt', name: 'diskmgmt.msc', cat: 'win-msc',
            desc: { de: 'Datenträgerverwaltung (Partitionen, Laufwerksbuchstaben, Volumes)', en: 'Disk Management (partitions, drive letters, volumes)' },
            win: {
                cmd: 'diskmgmt.msc',
                syntax: 'diskmgmt.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Datenträgerverwaltung öffnen', en: 'Open Disk Management' } },
                ],
                examples: [
                    { cmd: 'diskmgmt.msc',  desc: { de: 'Datenträgerverwaltung öffnen', en: 'Open Disk Management' } },
                    { cmd: 'diskpart',      desc: { de: 'CLI-Alternative für Partitionierung', en: 'CLI alternative for partitioning' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Partitionierung: fdisk, parted, gparted (GUI), lsblk.', en: 'Partitioning: fdisk, parted, gparted (GUI), lsblk.' }
        },
        {
            id: 'services', name: 'services.msc', cat: 'win-msc',
            desc: { de: 'Dienste (starten, stoppen, Starttyp konfigurieren)', en: 'Services (start, stop, configure startup type)' },
            win: {
                cmd: 'services.msc',
                syntax: 'services.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Öffnet die Diensteverwaltung', en: 'Opens Services Management' } },
                ],
                examples: [
                    { cmd: 'services.msc',       desc: { de: 'Dienste-Manager öffnen', en: 'Open Services Manager' } },
                    { cmd: 'sc query <Dienst>',  desc: { de: 'Dienststatus per CLI abfragen', en: 'Query service status via CLI' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Dienstverwaltung: systemctl start/stop/status <Dienst>.', en: 'Service management: systemctl start/stop/status <service>.' }
        },
        {
            id: 'taskschd', name: 'taskschd.msc', cat: 'win-msc',
            desc: { de: 'Aufgabenplanung (geplante Tasks erstellen und verwalten)', en: 'Task Scheduler (create and manage scheduled tasks)' },
            win: {
                cmd: 'taskschd.msc',
                syntax: 'taskschd.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Aufgabenplanung öffnen', en: 'Open Task Scheduler' } },
                ],
                examples: [
                    { cmd: 'taskschd.msc',    desc: { de: 'Aufgabenplanung öffnen', en: 'Open Task Scheduler' } },
                    { cmd: 'schtasks /query', desc: { de: 'Alle Tasks per CLI auflisten', en: 'List all tasks via CLI' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Aufgabenplanung: crontab -e (cron), systemctl list-timers (systemd timer).', en: 'Task scheduling: crontab -e (cron), systemctl list-timers (systemd timer).' }
        },
        {
            id: 'eventvwr', name: 'eventvwr.msc', cat: 'win-msc',
            desc: { de: 'Ereignisanzeige (System-, Anwendungs- und Sicherheitslogs)', en: 'Event Viewer (system, application and security logs)' },
            win: {
                cmd: 'eventvwr.msc',
                syntax: 'eventvwr.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Ereignisanzeige öffnen', en: 'Open Event Viewer' } },
                ],
                examples: [
                    { cmd: 'eventvwr.msc',        desc: { de: 'Ereignisanzeige öffnen', en: 'Open Event Viewer' } },
                    { cmd: 'eventvwr /l:System',  desc: { de: 'Direkt Systemlog öffnen', en: 'Open system log directly' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Systemlogs: journalctl -xe, journalctl -u <Dienst>, /var/log/.', en: 'System logs: journalctl -xe, journalctl -u <service>, /var/log/.' }
        },
        {
            id: 'lusrmgr', name: 'lusrmgr.msc', cat: 'win-msc',
            desc: { de: 'Lokale Benutzer und Gruppen (Konten, Kennwörter, Gruppenmitgliedschaft)', en: 'Local Users and Groups (accounts, passwords, group membership)' },
            win: {
                cmd: 'lusrmgr.msc',
                syntax: 'lusrmgr.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Benutzerverwaltung öffnen', en: 'Open User Management' } },
                ],
                examples: [
                    { cmd: 'lusrmgr.msc',  desc: { de: 'Lokale Benutzer und Gruppen öffnen', en: 'Open Local Users and Groups' } },
                    { cmd: 'net user',     desc: { de: 'Alle lokalen Benutzer per CLI', en: 'All local users via CLI' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Benutzerverwaltung: useradd, usermod, passwd, groupadd, /etc/passwd.', en: 'User management: useradd, usermod, passwd, groupadd, /etc/passwd.' }
        },
        {
            id: 'gpedit', name: 'gpedit.msc', cat: 'win-msc',
            desc: { de: 'Gruppenrichtlinien-Editor (lokale Richtlinien für System und Benutzer)', en: 'Group Policy Editor (local policies for system and user)' },
            win: {
                cmd: 'gpedit.msc',
                syntax: 'gpedit.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Gruppenrichtlinien-Editor öffnen (nur Pro/Enterprise)', en: 'Open Group Policy Editor (Pro/Enterprise only)' } },
                ],
                examples: [
                    { cmd: 'gpedit.msc',       desc: { de: 'Lokale Gruppenrichtlinien öffnen', en: 'Open Local Group Policies' } },
                    { cmd: 'gpupdate /force',  desc: { de: 'Richtlinien sofort anwenden', en: 'Apply policies immediately' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Kein direktes Pendant. Einstellungen über /etc/security/, PAM-Module oder Ansible.', en: 'No direct equivalent. Settings via /etc/security/, PAM modules or Ansible.' }
        },
        {
            id: 'secpol', name: 'secpol.msc', cat: 'win-msc',
            desc: { de: 'Lokale Sicherheitsrichtlinie (Kennwortrichtlinien, Auditing, Benutzerrechte)', en: 'Local Security Policy (password policies, auditing, user rights)' },
            win: {
                cmd: 'secpol.msc',
                syntax: 'secpol.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Sicherheitsrichtlinie öffnen', en: 'Open Security Policy' } },
                ],
                examples: [
                    { cmd: 'secpol.msc', desc: { de: 'Lokale Sicherheitsrichtlinie öffnen', en: 'Open Local Security Policy' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Sicherheitsrichtlinien: /etc/security/limits.conf, PAM-Konfiguration, /etc/pam.d/.', en: 'Security policies: /etc/security/limits.conf, PAM configuration, /etc/pam.d/.' }
        },
        {
            id: 'perfmon', name: 'perfmon.msc', cat: 'win-msc',
            desc: { de: 'Leistungsüberwachung (CPU, RAM, Datenträger, Netzwerk — Live-Graphen)', en: 'Performance Monitor (CPU, RAM, disk, network — live graphs)' },
            win: {
                cmd: 'perfmon.msc',
                syntax: 'perfmon.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Leistungsüberwachung öffnen', en: 'Open Performance Monitor' } },
                ],
                examples: [
                    { cmd: 'perfmon.msc',      desc: { de: 'Leistungsüberwachung öffnen', en: 'Open Performance Monitor' } },
                    { cmd: 'perfmon /report',  desc: { de: 'Systemdiagnose-Bericht erstellen', en: 'Generate system diagnostics report' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Leistungsüberwachung: top, htop, iostat, vmstat, nmon, glances.', en: 'Performance monitoring: top, htop, iostat, vmstat, nmon, glances.' }
        },
        {
            id: 'wf', name: 'wf.msc', cat: 'win-msc',
            desc: { de: 'Windows Defender Firewall mit erweiterter Sicherheit (Eingehend/Ausgehend)', en: 'Windows Defender Firewall with Advanced Security (inbound/outbound)' },
            win: {
                cmd: 'wf.msc',
                syntax: 'wf.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Erweiterte Firewall-Konsole öffnen', en: 'Open Advanced Firewall console' } },
                ],
                examples: [
                    { cmd: 'wf.msc',                       desc: { de: 'Erweiterte Firewall öffnen', en: 'Open Advanced Firewall' } },
                    { cmd: 'netsh advfirewall show all',   desc: { de: 'Firewall-Status per CLI', en: 'Firewall status via CLI' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Firewall: iptables -L -v, ufw status verbose, nftables.', en: 'Firewall: iptables -L -v, ufw status verbose, nftables.' }
        },
        {
            id: 'certmgr', name: 'certmgr.msc', cat: 'win-msc',
            desc: { de: 'Zertifikat-Manager (Benutzer-Zertifikate, persönlich, vertrauenswürdige Stellen)', en: 'Certificate Manager (user certificates, personal, trusted authorities)' },
            win: {
                cmd: 'certmgr.msc',
                syntax: 'certmgr.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Zertifikatspeicher des aktuellen Benutzers öffnen', en: 'Open current user certificate store' } },
                ],
                examples: [
                    { cmd: 'certmgr.msc', desc: { de: 'Benutzer-Zertifikate öffnen', en: 'Open user certificates' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Zertifikatsverwaltung: /etc/ssl/certs/, update-ca-certificates, openssl x509 -in cert.pem -text.', en: 'Certificate management: /etc/ssl/certs/, update-ca-certificates, openssl x509 -in cert.pem -text.' }
        },
        {
            id: 'certlm', name: 'certlm.msc', cat: 'win-msc',
            desc: { de: 'Zertifikate des lokalen Computers (Maschinenweite Zertifikate, IIS, VPN)', en: 'Local Computer Certificates (machine-wide certificates, IIS, VPN)' },
            win: {
                cmd: 'certlm.msc',
                syntax: 'certlm.msc',
                switches: [
                    { flag: '(keine)', desc: { de: 'Zertifikatspeicher des lokalen Computers öffnen', en: 'Open local computer certificate store' } },
                ],
                examples: [
                    { cmd: 'certlm.msc', desc: { de: 'Computer-Zertifikate öffnen', en: 'Open computer certificates' } },
                ]
            },
            linux: null,
            linuxHint: { de: 'Systemweite Zertifikate: /etc/ssl/certs/, update-ca-certificates, /usr/local/share/ca-certificates/.', en: 'System-wide certificates: /etc/ssl/certs/, update-ca-certificates, /usr/local/share/ca-certificates/.' }
        },
    ];

    // --- State ---
    let selectedCat = 'all';
    let expandedId = null;

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card nb-input-card">
            <label for="nb-search">${t('nb.searchLabel')}</label>
            <input type="text" id="nb-search"
                   placeholder="${t('nb.searchPlaceholder')}"
                   autocomplete="off" spellcheck="false">
            <label class="nb-cat-label">${t('nb.catLabel')}</label>
            <div class="nb-cat-chips" id="nb-cat-chips">
                ${Object.entries(CAT_KEYS).map(([key, cat]) =>
                    `<span class="chip nb-cat-chip${key === 'all' ? ' active' : ''}" data-cat="${key}" data-color="${cat.color}">${t(cat.tKey)}</span>`
                ).join('')}
            </div>
        </section>
        <section class="card nb-result-card" id="nb-result-card">
            <div class="nb-result-header">
                <h3>${t('nb.title')}</h3>
                <span class="nb-count" id="nb-count">${COMMANDS.length} ${t('nb.commands', { n: COMMANDS.length })}</span>
            </div>
            <div class="nb-list" id="nb-list"></div>
        </section>
    `;

    // --- DOM References ---
    const searchInput = document.getElementById('nb-search');
    const nbList = document.getElementById('nb-list');
    const nbCount = document.getElementById('nb-count');
    const catChips = container.querySelectorAll('.nb-cat-chip');

    // --- Category chip colors ---
    function updateChipColors() {
        catChips.forEach(chip => {
            const color = chip.dataset.color;
            const isActive = chip.classList.contains('active');
            if (isActive) {
                chip.style.background = color;
                chip.style.color = '#fff';
                chip.style.borderColor = color;
            } else {
                chip.style.background = 'transparent';
                chip.style.color = color;
                chip.style.borderColor = color + '60';
            }
        });
    }
    catChips.forEach(chip => {
        chip.addEventListener('click', () => {
            catChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedCat = chip.dataset.cat;
            updateChipColors();
            expandedId = null;
            renderList();
        });
    });
    updateChipColors();

    // --- Render platform column ---
    function renderPlatform(platform, label, icon, hint) {
        if (!platform) {
            const hintText = hint ? txt(hint) : '';
            return `<div class="nb-platform">
                <div class="nb-platform-header">
                    <span class="nb-platform-icon">${icon}</span>
                    <span class="nb-platform-label ${label === 'Windows' ? 'win' : 'linux'}">${label}</span>
                </div>
                <div class="nb-no-equivalent">
                    <span class="nb-no-equiv-icon">\u2205</span>
                    <span>${t('nb.noEquiv', { platform: label })}</span>
                    ${hintText ? `<span class="nb-no-equiv-hint">${escHtml(hintText)}</span>` : ''}
                </div>
            </div>`;
        }

        const switchRows = platform.switches.map(s =>
            `<tr><td class="nb-switch-flag"><code>${escHtml(s.flag)}</code></td><td class="nb-switch-desc">${escHtml(txt(s.desc))}</td></tr>`
        ).join('');

        const exampleBlocks = platform.examples.map(ex =>
            `<div class="nb-example">
                <div class="nb-code-row">
                    <code class="nb-code">${escHtml(ex.cmd)}</code>
                    <button class="nb-copy-btn" data-copy="${escHtml(ex.cmd)}" title="${t('nb.copy')}">${COPY_ICON}</button>
                </div>
                <span class="nb-example-desc">${escHtml(txt(ex.desc))}</span>
            </div>`
        ).join('');

        const helpHint = label === 'Windows'
            ? `<div class="nb-help-hint"><code>${escHtml(platform.cmd.split(' ')[0])} /?</code> \u2014 ${t('nb.helpWin')}</div>`
            : `<div class="nb-help-hint"><code>${escHtml(platform.cmd.split(' ')[0])} --help</code> oder <code>man ${escHtml(platform.cmd.split(' ')[0])}</code></div>`;

        return `<div class="nb-platform">
            <div class="nb-platform-header">
                <span class="nb-platform-icon">${icon}</span>
                <span class="nb-platform-label ${label === 'Windows' ? 'win' : 'linux'}">${label}</span>
            </div>
            <div class="nb-section-label">${t('nb.syntax')}</div>
            <div class="nb-code-row">
                <code class="nb-code">${escHtml(platform.syntax)}</code>
                <button class="nb-copy-btn" data-copy="${escHtml(platform.cmd)}" title="${t('nb.copy')}">${COPY_ICON}</button>
            </div>
            <div class="nb-section-label">${t('nb.switches')}</div>
            <table class="nb-switch-table">${switchRows}</table>
            ${helpHint}
            <div class="nb-section-label">${t('nb.examples')}</div>
            ${exampleBlocks}
        </div>`;
    }

    // --- Search in platform ---
    function searchPlatform(p, query) {
        if (!p) return false;
        return p.cmd.toLowerCase().includes(query) ||
               p.syntax.toLowerCase().includes(query) ||
               p.switches.some(s =>
                   s.flag.toLowerCase().includes(query) ||
                   txt(s.desc).toLowerCase().includes(query)
               ) ||
               p.examples.some(ex =>
                   ex.cmd.toLowerCase().includes(query) ||
                   txt(ex.desc).toLowerCase().includes(query)
               );
    }

    // --- Render list ---
    function renderList() {
        const query = searchInput.value.trim().toLowerCase();
        const filtered = COMMANDS.filter(cmd => {
            const matchesCat = selectedCat === 'all' || cmd.cat === selectedCat;
            if (!matchesCat) return false;
            if (!query) return true;
            return cmd.name.toLowerCase().includes(query) ||
                   txt(cmd.desc).toLowerCase().includes(query) ||
                   searchPlatform(cmd.win, query) ||
                   searchPlatform(cmd.linux, query) ||
                   (cmd.winHint && txt(cmd.winHint).toLowerCase().includes(query)) ||
                   (cmd.linuxHint && txt(cmd.linuxHint).toLowerCase().includes(query));
        });

        const n = filtered.length;
        nbCount.textContent = n === 1 ? t('nb.command', { n }) : t('nb.commands', { n });

        if (n === 0) {
            nbList.innerHTML = `<div class="nb-empty">${t('nb.noResults')}</div>`;
            return;
        }

        let html = '';
        let lastGroup = null;
        filtered.forEach(cmd => {
            // Gruppen-Überschrift für Windows CPL/MSC
            const group = WIN_GROUPS_MAP[cmd.id];
            if (group && group !== lastGroup) {
                html += `<div class="nb-group-header">${t(WIN_GROUP_KEYS[group])}</div>`;
                lastGroup = group;
            }
            const cat = CAT_KEYS[cmd.cat] || CAT_KEYS.all;
            const isExpanded = expandedId === cmd.id;
            html += `
                <div class="nb-row${isExpanded ? ' expanded' : ''}" data-id="${cmd.id}">
                    <div class="nb-row-header">
                        <div class="nb-name-block">
                            <span class="nb-name">${escHtml(cmd.name)}</span>
                            <span class="nb-desc">${escHtml(txt(cmd.desc))}</span>
                        </div>
                        <span class="nb-cat-badge" style="color:${cat.color};background:${cat.color}15;border-color:${cat.color}40">${t(cat.tKey)}</span>
                        <span class="nb-expand-icon">&#9658;</span>
                    </div>
                    <div class="nb-detail">
                        <div class="nb-platforms">
                            ${renderPlatform(cmd.win, 'Windows', WIN_ICON, cmd.winHint)}
                            ${(cmd.cat !== 'win-cpl' && cmd.cat !== 'win-msc') ? renderPlatform(cmd.linux, 'Linux', LINUX_ICON, cmd.linuxHint) : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        nbList.innerHTML = html;
    }

    // --- Accordion toggle ---
    nbList.addEventListener('click', (e) => {
        if (e.target.closest('.nb-copy-btn')) return;
        const row = e.target.closest('.nb-row');
        if (!row) return;
        const header = e.target.closest('.nb-row-header');
        if (!header) return;
        const id = row.dataset.id;
        expandedId = expandedId === id ? null : id;
        renderList();
    });

    // --- Copy to clipboard ---
    nbList.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.nb-copy-btn');
        if (!copyBtn) return;
        e.stopPropagation();

        const text = copyBtn.dataset.copy;
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.innerHTML = CHECK_ICON;
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = COPY_ICON;
                copyBtn.classList.remove('copied');
            }, 1500);
        });
    });

    // --- Search input ---
    searchInput.addEventListener('input', () => {
        expandedId = null;
        renderList();
    });

    // --- Initial render ---
    renderList();
}

function teardown_netzwerk_befehle() {
    // No cleanup needed
}
