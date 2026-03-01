// === Netzwerk-Befehle Tool ===

function init_netzwerk_befehle(container) {

    // --- Icons ---
    const COPY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    const CHECK_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    const WIN_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.5l9.9-1.4v9.6H0zm11 -1.6L24 0v11.7H11zm-11 10.3h9.9v9.6L0 20.5zm11 0H24V24l-13-1.8z"/></svg>';
    const LINUX_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.2 2 7 5.1 7 8.5c0 1.6.4 3 1.1 4.2-.8.5-2.6 1.8-2.8 3.4-.3 2 1.4 3.6 3.2 3.8.7.1 1.3-.1 1.8-.3.5.5 1.1.8 1.7.8s1.2-.3 1.7-.8c.5.2 1.1.4 1.8.3 1.8-.2 3.5-1.8 3.2-3.8-.2-1.6-2-2.9-2.8-3.4.7-1.2 1.1-2.6 1.1-4.2C17 5.1 14.8 2 12 2zm-2 8c-.6 0-1-.7-1-1.5S9.4 7 10 7s1 .7 1 1.5S10.6 10 10 10zm4 0c-.6 0-1-.7-1-1.5S13.4 7 14 7s1 .7 1 1.5S14.6 10 14 10zm-3.5 3h3c-.2.6-.7 1-1.5 1s-1.3-.4-1.5-1z"/></svg>';

    // --- Categories ---
    const CATEGORIES = {
        all:      { label: 'Alle',           color: 'var(--text-dim)' },
        diagnose: { label: 'Diagnose',       color: 'var(--accent)' },
        config:   { label: 'Konfiguration',  color: 'var(--green)' },
        dns:      { label: 'DNS',            color: 'var(--purple)' },
        routing:  { label: 'Routing',        color: 'var(--orange)' },
        transfer: { label: 'Transfer',       color: 'var(--red)' },
        remote:   { label: 'Remote',         color: '#2dd4bf' },
        info:     { label: 'Info',           color: '#f472b6' },
        'win-cpl':  { label: 'Windows CPL',    color: '#0078d4' },
        'win-msc':  { label: 'Windows MSC',    color: '#00a4ef' },
    };

    // --- Windows-Gruppen (CPL/MSC Abschnitte) ---
    const WIN_GROUPS = {
        'cpl-network':  'CPL \u2014 Netzwerk',
        'cpl-system':   'CPL \u2014 System',
        'cpl-hardware': 'CPL \u2014 Hardware',
        'cpl-access':   'CPL \u2014 Eingabehilfe',
        'msc-admin':    'MSC \u2014 Verwaltung',
        'msc-network':  'MSC \u2014 Netzwerk & Sicherheit',
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
            desc: 'Erreichbarkeit eines Hosts testen (ICMP Echo)',
            win: {
                cmd: 'ping',
                syntax: 'ping [Optionen] <Ziel>',
                switches: [
                    { flag: '-t',         desc: 'Ping fortlaufend senden (Strg+C stoppt)' },
                    { flag: '-n <Anz>',   desc: 'Anzahl der Echo-Anfragen' },
                    { flag: '-l <Bytes>', desc: 'Paketgr\u00f6\u00dfe (Standard: 32)' },
                    { flag: '-i <TTL>',   desc: 'Time-to-Live festlegen' },
                    { flag: '-w <ms>',    desc: 'Timeout in Millisekunden' },
                    { flag: '-4 / -6',    desc: 'IPv4 bzw. IPv6 erzwingen' },
                ],
                examples: [
                    { cmd: 'ping -t 8.8.8.8',            desc: 'Dauer-Ping an Google DNS' },
                    { cmd: 'ping -n 10 -l 1000 server1', desc: '10 Pings mit 1000 Bytes' },
                ]
            },
            linux: {
                cmd: 'ping',
                syntax: 'ping [Optionen] <Ziel>',
                switches: [
                    { flag: '-c <Anz>',   desc: 'Anzahl der Pings (sonst endlos)' },
                    { flag: '-i <Sek>',   desc: 'Intervall zwischen Pings (Std: 1s)' },
                    { flag: '-s <Bytes>', desc: 'Paketgr\u00f6\u00dfe (Standard: 56)' },
                    { flag: '-t <TTL>',   desc: 'Time-to-Live festlegen' },
                    { flag: '-W <Sek>',   desc: 'Timeout in Sekunden' },
                    { flag: '-4 / -6',    desc: 'IPv4 bzw. IPv6 erzwingen' },
                ],
                examples: [
                    { cmd: 'ping -c 5 8.8.8.8',         desc: '5 Pings an Google DNS' },
                    { cmd: 'ping -i 0.2 -c 50 server1', desc: '50 Schnell-Pings (200ms Intervall)' },
                ]
            }
        },
        {
            id: 'traceroute', name: 'traceroute', cat: 'diagnose',
            desc: 'Routenverfolgung zum Zielhost (Hop-Analyse)',
            win: {
                cmd: 'tracert',
                syntax: 'tracert [Optionen] <Ziel>',
                switches: [
                    { flag: '-d',          desc: 'Keine DNS-Aufl\u00f6sung (schneller)' },
                    { flag: '-h <MaxHops>', desc: 'Maximale Anzahl Hops (Std: 30)' },
                    { flag: '-w <ms>',     desc: 'Timeout pro Hop in ms' },
                    { flag: '-4 / -6',     desc: 'IPv4 bzw. IPv6 erzwingen' },
                ],
                examples: [
                    { cmd: 'tracert -d 8.8.8.8',       desc: 'Route ohne DNS-Aufl\u00f6sung' },
                    { cmd: 'tracert -h 15 example.com', desc: 'Max. 15 Hops' },
                ]
            },
            linux: {
                cmd: 'traceroute',
                syntax: 'traceroute [Optionen] <Ziel>',
                switches: [
                    { flag: '-n',          desc: 'Keine DNS-Aufl\u00f6sung' },
                    { flag: '-m <MaxHops>', desc: 'Maximale Anzahl Hops' },
                    { flag: '-w <Sek>',    desc: 'Timeout pro Hop in Sekunden' },
                    { flag: '-I',          desc: 'ICMP statt UDP verwenden' },
                    { flag: '-T',          desc: 'TCP SYN verwenden' },
                    { flag: '-p <Port>',   desc: 'Zielport festlegen' },
                ],
                examples: [
                    { cmd: 'traceroute -n 8.8.8.8',              desc: 'Route ohne DNS' },
                    { cmd: 'traceroute -T -p 443 example.com',   desc: 'TCP-Traceroute auf Port 443' },
                ]
            }
        },
        {
            id: 'pathping', name: 'pathping / mtr', cat: 'diagnose',
            desc: 'Erweiterte Routenanalyse mit Paketverlust pro Hop',
            win: {
                cmd: 'pathping',
                syntax: 'pathping [Optionen] <Ziel>',
                switches: [
                    { flag: '-n',          desc: 'Keine DNS-Aufl\u00f6sung' },
                    { flag: '-h <MaxHops>', desc: 'Maximale Anzahl Hops' },
                    { flag: '-q <Anz>',    desc: 'Abfragen pro Hop (Std: 100)' },
                    { flag: '-p <ms>',     desc: 'Pause zwischen Pings in ms' },
                ],
                examples: [
                    { cmd: 'pathping -n 8.8.8.8',      desc: 'Hop-Analyse ohne DNS' },
                    { cmd: 'pathping -q 50 server1',    desc: '50 Abfragen pro Hop' },
                ]
            },
            linux: {
                cmd: 'mtr',
                syntax: 'mtr [Optionen] <Ziel>',
                switches: [
                    { flag: '-n',          desc: 'Keine DNS-Aufl\u00f6sung' },
                    { flag: '-c <Anz>',    desc: 'Anzahl Pings pro Hop' },
                    { flag: '-r',          desc: 'Report-Modus (nicht interaktiv)' },
                    { flag: '-T',          desc: 'TCP statt ICMP verwenden' },
                    { flag: '-P <Port>',   desc: 'TCP-Zielport' },
                    { flag: '-w',          desc: 'Breiter Report (mehr Details)' },
                ],
                examples: [
                    { cmd: 'mtr -r -c 100 8.8.8.8',          desc: 'Report mit 100 Pings' },
                    { cmd: 'mtr -T -P 443 example.com',      desc: 'TCP-MTR auf Port 443' },
                ]
            }
        },
        {
            id: 'netstat', name: 'netstat / ss', cat: 'diagnose',
            desc: 'Aktive Netzwerkverbindungen und offene Ports anzeigen',
            win: {
                cmd: 'netstat',
                syntax: 'netstat [Optionen]',
                switches: [
                    { flag: '-a',          desc: 'Alle Verbindungen + Ports anzeigen' },
                    { flag: '-n',          desc: 'Numerische Adressen (kein DNS)' },
                    { flag: '-o',          desc: 'Prozess-ID (PID) anzeigen' },
                    { flag: '-b',          desc: 'Prozessname anzeigen (Admin)' },
                    { flag: '-r',          desc: 'Routing-Tabelle anzeigen' },
                    { flag: '-p <Proto>',  desc: 'Filter: TCP, UDP, TCPv6, UDPv6' },
                ],
                examples: [
                    { cmd: 'netstat -ano',                 desc: 'Alle Verbindungen mit PID' },
                    { cmd: 'netstat -an | findstr :443',   desc: 'Nur Port 443 filtern' },
                ]
            },
            linux: {
                cmd: 'ss',
                syntax: 'ss [Optionen]',
                switches: [
                    { flag: '-t',   desc: 'Nur TCP-Verbindungen' },
                    { flag: '-u',   desc: 'Nur UDP-Verbindungen' },
                    { flag: '-l',   desc: 'Nur lauschende Ports' },
                    { flag: '-n',   desc: 'Numerische Adressen' },
                    { flag: '-p',   desc: 'Prozessname anzeigen' },
                    { flag: '-a',   desc: 'Alle Sockets anzeigen' },
                ],
                examples: [
                    { cmd: 'ss -tulnp',                     desc: 'Alle lauschenden TCP/UDP mit Prozess' },
                    { cmd: 'ss -tn state established',      desc: 'Nur aktive TCP-Verbindungen' },
                ]
            }
        },

        // ===== KONFIGURATION (5) =====
        {
            id: 'ipconfig', name: 'ipconfig / ip', cat: 'config',
            desc: 'IP-Konfiguration und Netzwerkadapter anzeigen/\u00e4ndern',
            win: {
                cmd: 'ipconfig',
                syntax: 'ipconfig [/Schalter]',
                switches: [
                    { flag: '/all',         desc: 'Vollst\u00e4ndige Konfiguration aller Adapter' },
                    { flag: '/release',     desc: 'DHCP-Lease freigeben' },
                    { flag: '/renew',       desc: 'DHCP-Lease erneuern' },
                    { flag: '/flushdns',    desc: 'DNS-Cache leeren' },
                    { flag: '/displaydns',  desc: 'DNS-Cache anzeigen' },
                    { flag: '/registerdns', desc: 'DNS-Namen neu registrieren' },
                ],
                examples: [
                    { cmd: 'ipconfig /all',      desc: 'Alle Adapter mit MAC, DNS, DHCP' },
                    { cmd: 'ipconfig /flushdns',  desc: 'DNS-Cache leeren' },
                    { cmd: 'ipconfig /release && ipconfig /renew', desc: 'DHCP erneuern' },
                ]
            },
            linux: {
                cmd: 'ip',
                syntax: 'ip [Objekt] [Aktion]',
                switches: [
                    { flag: 'addr show',              desc: 'IP-Adressen aller Interfaces' },
                    { flag: 'link show',              desc: 'Interfaces mit Status anzeigen' },
                    { flag: 'addr add <IP>/<CIDR> dev <IF>', desc: 'IP-Adresse hinzuf\u00fcgen' },
                    { flag: 'addr del <IP>/<CIDR> dev <IF>', desc: 'IP-Adresse entfernen' },
                    { flag: 'link set <IF> up/down',  desc: 'Interface aktivieren/deaktivieren' },
                ],
                examples: [
                    { cmd: 'ip addr show',                             desc: 'Alle IP-Adressen anzeigen' },
                    { cmd: 'ip addr add 192.168.1.10/24 dev eth0',     desc: 'Statische IP setzen' },
                    { cmd: 'ip link set eth0 up',                      desc: 'Interface aktivieren' },
                ]
            }
        },
        {
            id: 'netsh', name: 'netsh / nmcli', cat: 'config',
            desc: 'Netzwerkkomponenten konfigurieren (WLAN, Firewall, IP)',
            win: {
                cmd: 'netsh',
                syntax: 'netsh <Kontext> <Befehl>',
                switches: [
                    { flag: 'wlan show profiles',         desc: 'Gespeicherte WLAN-Profile' },
                    { flag: 'wlan show profile name=X key=clear', desc: 'WLAN-Passwort anzeigen' },
                    { flag: 'interface ip show config',   desc: 'IP-Konfiguration aller Adapter' },
                    { flag: 'advfirewall set allprofiles state on/off', desc: 'Firewall ein/aus' },
                    { flag: 'interface ip set address ...', desc: 'Statische IP konfigurieren' },
                ],
                examples: [
                    { cmd: 'netsh wlan show profiles',    desc: 'Alle WLAN-Profile auflisten' },
                    { cmd: 'netsh wlan show profile name="MeinWLAN" key=clear', desc: 'WLAN-Passwort anzeigen' },
                    { cmd: 'netsh interface ip set address "Ethernet" static 192.168.1.10 255.255.255.0 192.168.1.1', desc: 'Statische IP setzen' },
                ]
            },
            linux: {
                cmd: 'nmcli',
                syntax: 'nmcli <Objekt> <Aktion>',
                switches: [
                    { flag: 'general status',      desc: 'Netzwerkstatus \u00fcbersicht' },
                    { flag: 'device status',       desc: 'Alle Interfaces mit Status' },
                    { flag: 'device wifi list',    desc: 'Verf\u00fcgbare WLANs anzeigen' },
                    { flag: 'connection show',     desc: 'Gespeicherte Verbindungen' },
                    { flag: 'connection modify <Name> ...', desc: 'Verbindung \u00e4ndern' },
                ],
                examples: [
                    { cmd: 'nmcli device status',   desc: 'Interface-Status anzeigen' },
                    { cmd: 'nmcli device wifi list', desc: 'WLAN-Netze scannen' },
                    { cmd: 'nmcli connection modify eth0 ipv4.addresses 192.168.1.10/24 ipv4.method manual', desc: 'Statische IP setzen' },
                ]
            }
        },
        {
            id: 'ncpa', name: 'ncpa.cpl', cat: 'win-cpl',
            desc: 'Netzwerkverbindungen GUI \u00f6ffnen (Schnellzugriff)',
            win: {
                cmd: 'ncpa.cpl',
                syntax: 'ncpa.cpl',
                switches: [
                    { flag: '(keine)',  desc: 'Startet direkt die Netzwerkverbindungen' },
                ],
                examples: [
                    { cmd: 'ncpa.cpl',                  desc: '\u00d6ffnet Netzwerkverbindungen' },
                    { cmd: 'control netconnections',    desc: 'Alternative (gleiche Funktion)' },
                ]
            },
            linux: null,
            linuxHint: 'Kein direktes Pendant. Verwende nmtui (TUI) oder nmcli / ip addr (CLI).'
        },
        {
            id: 'hostname', name: 'hostname', cat: 'config',
            desc: 'Computername anzeigen oder \u00e4ndern',
            win: {
                cmd: 'hostname',
                syntax: 'hostname',
                switches: [
                    { flag: '(keine)',  desc: 'Zeigt den aktuellen Computernamen' },
                ],
                examples: [
                    { cmd: 'hostname',  desc: 'Computername anzeigen' },
                ]
            },
            linux: {
                cmd: 'hostname / hostnamectl',
                syntax: 'hostname [Optionen] | hostnamectl [Aktion]',
                switches: [
                    { flag: '-f',         desc: 'FQDN (vollst\u00e4ndiger Hostname)' },
                    { flag: '-I',         desc: 'Alle IP-Adressen des Hosts' },
                    { flag: '-d',         desc: 'Dom\u00e4nenname anzeigen' },
                    { flag: 'hostnamectl set-hostname <Name>', desc: 'Hostname \u00e4ndern (persistent)' },
                ],
                examples: [
                    { cmd: 'hostname -f',                         desc: 'FQDN anzeigen' },
                    { cmd: 'hostnamectl',                         desc: 'Ausf\u00fchrliche System-/Hostname-Info' },
                    { cmd: 'hostnamectl set-hostname server01',   desc: 'Hostname permanent \u00e4ndern' },
                ]
            }
        },
        {
            id: 'proxy', name: 'proxy', cat: 'config',
            desc: 'Proxy-Einstellungen anzeigen, setzen oder entfernen',
            win: {
                cmd: 'netsh winhttp',
                syntax: 'netsh winhttp [show|set|reset] proxy ...',
                switches: [
                    { flag: 'show proxy',              desc: 'Aktuellen Proxy anzeigen' },
                    { flag: 'set proxy <Proxy:Port>',  desc: 'Proxy setzen' },
                    { flag: 'set proxy <Proxy> bypass-list="<Liste>"', desc: 'Proxy mit Ausnahmen' },
                    { flag: 'reset proxy',             desc: 'Proxy entfernen (Direktverbindung)' },
                    { flag: 'set HTTP_PROXY=...',      desc: 'Umgebungsvariable (CMD/PowerShell)' },
                ],
                examples: [
                    { cmd: 'netsh winhttp show proxy',                          desc: 'Proxy-Status anzeigen' },
                    { cmd: 'netsh winhttp set proxy proxy.firma.de:8080',       desc: 'Proxy konfigurieren' },
                    { cmd: 'netsh winhttp set proxy proxy.firma.de:8080 bypass-list="*.local;10.*"', desc: 'Proxy mit Ausnahmen' },
                    { cmd: 'netsh winhttp reset proxy',                         desc: 'Proxy entfernen' },
                ]
            },
            linux: {
                cmd: 'export http_proxy / https_proxy',
                syntax: 'export http_proxy=http://<Proxy:Port>',
                switches: [
                    { flag: 'export http_proxy=...',   desc: 'HTTP-Proxy setzen' },
                    { flag: 'export https_proxy=...',  desc: 'HTTPS-Proxy setzen' },
                    { flag: 'export no_proxy=...',     desc: 'Ausnahmen (kommagetrennt)' },
                    { flag: 'unset http_proxy',        desc: 'Proxy entfernen' },
                    { flag: 'env | grep -i proxy',     desc: 'Aktuelle Proxy-Variablen anzeigen' },
                ],
                examples: [
                    { cmd: 'export http_proxy=http://proxy.firma.de:8080',      desc: 'HTTP-Proxy setzen' },
                    { cmd: 'export https_proxy=http://proxy.firma.de:8080',     desc: 'HTTPS-Proxy setzen' },
                    { cmd: 'export no_proxy=localhost,127.0.0.1,.local',        desc: 'Ausnahmen definieren' },
                    { cmd: 'unset http_proxy https_proxy',                      desc: 'Proxy entfernen' },
                ]
            }
        },

        // ===== DNS (2) =====
        {
            id: 'nslookup', name: 'nslookup / dig', cat: 'dns',
            desc: 'DNS-Abfragen (A, MX, AAAA, TXT, NS, SOA, PTR)',
            win: {
                cmd: 'nslookup',
                syntax: 'nslookup [-type=<Typ>] <Name> [Server]',
                switches: [
                    { flag: '-type=A',     desc: 'IPv4-Adresse abfragen' },
                    { flag: '-type=AAAA',  desc: 'IPv6-Adresse abfragen' },
                    { flag: '-type=MX',    desc: 'Mailserver abfragen' },
                    { flag: '-type=NS',    desc: 'Nameserver abfragen' },
                    { flag: '-type=TXT',   desc: 'TXT-Records (SPF, DKIM)' },
                    { flag: '-type=PTR',   desc: 'Reverse-DNS (IP \u2192 Name)' },
                ],
                examples: [
                    { cmd: 'nslookup -type=MX example.com',       desc: 'MX-Records abfragen' },
                    { cmd: 'nslookup example.com 8.8.8.8',        desc: 'Abfrage \u00fcber Google DNS' },
                    { cmd: 'nslookup -type=TXT example.com',      desc: 'SPF/DKIM-Records pr\u00fcfen' },
                ]
            },
            linux: {
                cmd: 'dig',
                syntax: 'dig [@Server] <Name> [Typ] [+Optionen]',
                switches: [
                    { flag: '@<Server>',   desc: 'DNS-Server angeben' },
                    { flag: 'A / AAAA / MX / NS / TXT / SOA', desc: 'Record-Typ' },
                    { flag: '+short',      desc: 'Nur das Ergebnis (kompakt)' },
                    { flag: '+trace',      desc: 'Vollst\u00e4ndige DNS-Aufl\u00f6sungskette' },
                    { flag: '+noall +answer', desc: 'Nur Answer-Section' },
                    { flag: '-x <IP>',     desc: 'Reverse-DNS (PTR)' },
                ],
                examples: [
                    { cmd: 'dig example.com MX +short',           desc: 'MX-Records (kompakt)' },
                    { cmd: 'dig @8.8.8.8 example.com AAAA',      desc: 'IPv6 \u00fcber Google DNS' },
                    { cmd: 'dig -x 8.8.8.8',                     desc: 'Reverse-DNS f\u00fcr 8.8.8.8' },
                ]
            }
        },
        {
            id: 'dns-resolve', name: 'Resolve-DnsName / host', cat: 'dns',
            desc: 'Schnelle DNS-Aufl\u00f6sung (PowerShell / host)',
            win: {
                cmd: 'Resolve-DnsName',
                syntax: 'Resolve-DnsName <Name> [-Type <Typ>] [-Server <DNS>]',
                switches: [
                    { flag: '-Type A/MX/AAAA/NS/TXT/PTR', desc: 'Record-Typ' },
                    { flag: '-Server <DNS>',   desc: 'DNS-Server angeben' },
                    { flag: '-DnsOnly',        desc: 'Nur DNS (kein Cache/Hosts)' },
                ],
                examples: [
                    { cmd: 'Resolve-DnsName example.com -Type MX',              desc: 'MX-Records abfragen' },
                    { cmd: 'Resolve-DnsName example.com -Server 8.8.8.8',      desc: 'Abfrage \u00fcber Google DNS' },
                ]
            },
            linux: {
                cmd: 'host',
                syntax: 'host [-t <Typ>] <Name> [Server]',
                switches: [
                    { flag: '-t <Typ>',   desc: 'Record-Typ (A, MX, NS, TXT, AAAA)' },
                    { flag: '-a',         desc: 'Alle verf\u00fcgbaren Records' },
                    { flag: '<Server>',   desc: 'DNS-Server als 2. Argument' },
                ],
                examples: [
                    { cmd: 'host -t MX example.com',           desc: 'MX-Records abfragen' },
                    { cmd: 'host example.com 8.8.8.8',         desc: 'Abfrage \u00fcber Google DNS' },
                    { cmd: 'host -a example.com',              desc: 'Alle DNS-Records' },
                ]
            }
        },

        // ===== ROUTING (3) =====
        {
            id: 'route', name: 'route / ip route', cat: 'routing',
            desc: 'Routing-Tabelle anzeigen und Routen verwalten',
            win: {
                cmd: 'route',
                syntax: 'route [print|add|delete] ...',
                switches: [
                    { flag: 'print',       desc: 'Routing-Tabelle anzeigen' },
                    { flag: 'add <Netz> mask <Maske> <GW>', desc: 'Route hinzuf\u00fcgen' },
                    { flag: 'delete <Netz>', desc: 'Route entfernen' },
                    { flag: '-p',          desc: 'Route persistent (bleibt nach Neustart)' },
                ],
                examples: [
                    { cmd: 'route print',                                          desc: 'Routing-Tabelle anzeigen' },
                    { cmd: 'route add 10.0.0.0 mask 255.0.0.0 192.168.1.1 -p',   desc: 'Persistente Route hinzuf\u00fcgen' },
                ]
            },
            linux: {
                cmd: 'ip route',
                syntax: 'ip route [show|add|del|get] ...',
                switches: [
                    { flag: 'show',          desc: 'Routing-Tabelle anzeigen' },
                    { flag: 'add <Netz>/<CIDR> via <GW>', desc: 'Route hinzuf\u00fcgen' },
                    { flag: 'del <Netz>/<CIDR>', desc: 'Route entfernen' },
                    { flag: 'add default via <GW>', desc: 'Standard-Gateway setzen' },
                    { flag: 'get <IP>',      desc: 'Route f\u00fcr eine IP nachschlagen' },
                ],
                examples: [
                    { cmd: 'ip route show',                              desc: 'Routing-Tabelle anzeigen' },
                    { cmd: 'ip route add 10.0.0.0/8 via 192.168.1.1',   desc: 'Route hinzuf\u00fcgen' },
                    { cmd: 'ip route get 8.8.8.8',                      desc: 'Welche Route wird genutzt?' },
                ]
            }
        },
        {
            id: 'arp', name: 'arp / ip neigh', cat: 'routing',
            desc: 'ARP-Tabelle anzeigen (IP \u2194 MAC-Zuordnung)',
            win: {
                cmd: 'arp',
                syntax: 'arp [Optionen]',
                switches: [
                    { flag: '-a',          desc: 'ARP-Cache anzeigen' },
                    { flag: '-d <IP>',     desc: 'Eintrag l\u00f6schen' },
                    { flag: '-s <IP> <MAC>', desc: 'Statischen Eintrag hinzuf\u00fcgen' },
                ],
                examples: [
                    { cmd: 'arp -a',                  desc: 'ARP-Tabelle anzeigen' },
                    { cmd: 'arp -d 192.168.1.1',     desc: 'Eintrag l\u00f6schen' },
                ]
            },
            linux: {
                cmd: 'ip neigh',
                syntax: 'ip neigh [show|add|del|flush] ...',
                switches: [
                    { flag: 'show',        desc: 'Nachbar-Tabelle anzeigen' },
                    { flag: 'add <IP> lladdr <MAC> dev <IF>', desc: 'Statisch hinzuf\u00fcgen' },
                    { flag: 'del <IP> dev <IF>', desc: 'Eintrag l\u00f6schen' },
                    { flag: 'flush dev <IF>', desc: 'Alle Eintr\u00e4ge l\u00f6schen' },
                ],
                examples: [
                    { cmd: 'ip neigh show',            desc: 'ARP-/Nachbar-Tabelle anzeigen' },
                    { cmd: 'ip neigh flush dev eth0',  desc: 'Cache f\u00fcr eth0 leeren' },
                ]
            }
        },
        {
            id: 'nbtstat', name: 'nbtstat / nbtscan', cat: 'routing',
            desc: 'NetBIOS-Namensinformationen und -Scanning',
            win: {
                cmd: 'nbtstat',
                syntax: 'nbtstat [Optionen]',
                switches: [
                    { flag: '-a <Name>',   desc: 'NetBIOS-Tabelle nach Name' },
                    { flag: '-A <IP>',     desc: 'NetBIOS-Tabelle nach IP' },
                    { flag: '-n',          desc: 'Lokale NetBIOS-Tabelle' },
                    { flag: '-r',          desc: 'Aufgel\u00f6ste Namen-Statistik' },
                    { flag: '-c',          desc: 'NetBIOS-Cache anzeigen' },
                ],
                examples: [
                    { cmd: 'nbtstat -A 192.168.1.1',  desc: 'NetBIOS-Info einer IP' },
                    { cmd: 'nbtstat -n',               desc: 'Lokale NetBIOS-Namen' },
                ]
            },
            linux: {
                cmd: 'nbtscan',
                syntax: 'nbtscan [Optionen] <Ziel/Bereich>',
                switches: [
                    { flag: '-r <Bereich>', desc: 'Netzbereich scannen (CIDR)' },
                    { flag: '-e',           desc: 'Erweiterte Ausgabe' },
                    { flag: '-v',           desc: 'Ausf\u00fchrliche Ausgabe' },
                ],
                examples: [
                    { cmd: 'nbtscan 192.168.1.0/24',  desc: 'Gesamtes Subnetz scannen' },
                    { cmd: 'nbtscan -v 10.0.0.0/8',   desc: 'Ausf\u00fchrlicher Scan' },
                ]
            }
        },

        // ===== TRANSFER (5) =====
        {
            id: 'ftp', name: 'ftp', cat: 'transfer',
            desc: 'Datei\u00fcbertragung \u00fcber das FTP-Protokoll',
            win: {
                cmd: 'ftp',
                syntax: 'ftp [Optionen] <Host>',
                switches: [
                    { flag: '-s:<Datei>',  desc: 'Script-Datei f\u00fcr Batch-Betrieb' },
                    { flag: '-n',          desc: 'Kein Auto-Login' },
                    { flag: '-i',          desc: 'Nicht interaktiv (kein Prompt)' },
                    { flag: '-v',          desc: 'Ausf\u00fchrliche Ausgabe deaktivieren' },
                ],
                examples: [
                    { cmd: 'ftp server1',                  desc: 'FTP-Verbindung herstellen' },
                    { cmd: 'ftp -s:upload.txt server1',    desc: 'Batch-Upload per Script' },
                ]
            },
            linux: {
                cmd: 'ftp',
                syntax: 'ftp [Optionen] <Host>',
                switches: [
                    { flag: '-n',          desc: 'Kein Auto-Login' },
                    { flag: '-v',          desc: 'Ausf\u00fchrliche Ausgabe' },
                    { flag: '-i',          desc: 'Nicht interaktiv' },
                    { flag: 'mget / mput', desc: 'Mehrere Dateien holen/senden' },
                    { flag: 'bin / ascii', desc: 'Bin\u00e4r-/Textmodus umschalten' },
                ],
                examples: [
                    { cmd: 'ftp server1',                     desc: 'Interaktive FTP-Sitzung' },
                    { cmd: 'ftp -n server1 < script.txt',     desc: 'Automatisiert per Script' },
                ]
            }
        },
        {
            id: 'tftp', name: 'tftp', cat: 'transfer',
            desc: 'Einfache Datei\u00fcbertragung (Trivial FTP, kein Auth)',
            win: {
                cmd: 'tftp',
                syntax: 'tftp [-i] <Host> [GET|PUT] <Datei>',
                switches: [
                    { flag: '-i',          desc: 'Bin\u00e4rmodus (f\u00fcr Firmware etc.)' },
                    { flag: 'GET <Datei>', desc: 'Datei vom Server holen' },
                    { flag: 'PUT <Datei>', desc: 'Datei zum Server senden' },
                ],
                examples: [
                    { cmd: 'tftp -i 192.168.1.1 GET firmware.bin',  desc: 'Firmware herunterladen' },
                    { cmd: 'tftp -i 192.168.1.1 PUT config.cfg',   desc: 'Konfiguration hochladen' },
                ]
            },
            linux: {
                cmd: 'tftp',
                syntax: 'tftp <Host> [-c get|put <Datei>]',
                switches: [
                    { flag: '-c get <Datei>', desc: 'Datei holen (Command-Line)' },
                    { flag: '-c put <Datei>', desc: 'Datei senden' },
                    { flag: '-m binary',      desc: 'Bin\u00e4rmodus' },
                ],
                examples: [
                    { cmd: 'tftp 192.168.1.1 -c get firmware.bin',  desc: 'Firmware herunterladen' },
                    { cmd: 'tftp 192.168.1.1 -c put config.cfg',   desc: 'Konfiguration hochladen' },
                ]
            }
        },
        {
            id: 'curl', name: 'curl', cat: 'transfer',
            desc: 'HTTP(S)-Anfragen und Daten\u00fcbertragung (ab Win10)',
            win: {
                cmd: 'curl',
                syntax: 'curl [Optionen] <URL>',
                switches: [
                    { flag: '-o <Datei>',  desc: 'Ausgabe in Datei speichern' },
                    { flag: '-O',          desc: 'Dateiname vom Server \u00fcbernehmen' },
                    { flag: '-I',          desc: 'Nur HTTP-Header anzeigen' },
                    { flag: '-X <Method>', desc: 'HTTP-Methode (GET, POST, PUT, DELETE)' },
                    { flag: '-H "Header"', desc: 'HTTP-Header mitgeben' },
                    { flag: '-d "Daten"',  desc: 'POST-Daten senden' },
                    { flag: '-L',          desc: 'Redirects automatisch folgen' },
                    { flag: '-v',          desc: 'Ausf\u00fchrliche Ausgabe' },
                ],
                examples: [
                    { cmd: 'curl -I https://example.com',                          desc: 'HTTP-Header abfragen' },
                    { cmd: 'curl -o datei.zip https://example.com/datei.zip',      desc: 'Datei herunterladen' },
                ]
            },
            linux: {
                cmd: 'curl',
                syntax: 'curl [Optionen] <URL>',
                switches: [
                    { flag: '-o <Datei>',  desc: 'Ausgabe in Datei speichern' },
                    { flag: '-O',          desc: 'Dateiname vom Server \u00fcbernehmen' },
                    { flag: '-I',          desc: 'Nur HTTP-Header anzeigen' },
                    { flag: '-X <Method>', desc: 'HTTP-Methode' },
                    { flag: '-H "Header"', desc: 'HTTP-Header mitgeben' },
                    { flag: '-d "Daten"',  desc: 'POST-Daten senden' },
                    { flag: '-s',          desc: 'Silent-Modus (kein Fortschritt)' },
                    { flag: '-k',          desc: 'TLS-Zertifikat nicht pr\u00fcfen' },
                ],
                examples: [
                    { cmd: 'curl -sL https://example.com | head',                  desc: 'Erste Zeilen einer Seite' },
                    { cmd: 'curl -X POST -H "Content-Type: application/json" -d \'{"key":"val"}\' https://api.example.com', desc: 'JSON-POST an API' },
                ]
            }
        },
        {
            id: 'wget', name: 'wget', cat: 'transfer',
            desc: 'Dateien und Webseiten herunterladen (rekursiv m\u00f6glich)',
            win: null,
            winHint: 'Nicht in Windows enthalten. Verwende curl -O oder Invoke-WebRequest (PowerShell).',
            linux: {
                cmd: 'wget',
                syntax: 'wget [Optionen] <URL>',
                switches: [
                    { flag: '-O <Datei>',  desc: 'Zieldateiname festlegen' },
                    { flag: '-q',          desc: 'Stille Ausgabe' },
                    { flag: '-r',          desc: 'Rekursiver Download' },
                    { flag: '-c',          desc: 'Abgebrochenen Download fortsetzen' },
                    { flag: '--mirror',    desc: 'Komplette Website spiegeln' },
                    { flag: '-P <Ordner>', desc: 'Zielverzeichnis festlegen' },
                ],
                examples: [
                    { cmd: 'wget https://example.com/datei.zip',            desc: 'Datei herunterladen' },
                    { cmd: 'wget -r -l 2 https://example.com/docs/',       desc: 'Rekursiv (2 Ebenen tief)' },
                    { cmd: 'wget -c https://example.com/grossedatei.iso',  desc: 'Download fortsetzen' },
                ]
            }
        },
        {
            id: 'scp', name: 'scp', cat: 'transfer',
            desc: 'Sichere Datei\u00fcbertragung \u00fcber SSH (OpenSSH)',
            win: {
                cmd: 'scp',
                syntax: 'scp [Optionen] <Quelle> <Ziel>',
                switches: [
                    { flag: '-P <Port>',   desc: 'SSH-Port angeben (gro\u00dfes P)' },
                    { flag: '-r',          desc: 'Rekursiv (Verzeichnisse)' },
                    { flag: '-i <Key>',    desc: 'Private-Key-Datei angeben' },
                    { flag: '-C',          desc: 'Kompression aktivieren' },
                ],
                examples: [
                    { cmd: 'scp datei.txt user@server:/home/user/',  desc: 'Datei zum Server kopieren' },
                    { cmd: 'scp -r ordner/ user@server:/backup/',    desc: 'Verzeichnis rekursiv kopieren' },
                ]
            },
            linux: {
                cmd: 'scp',
                syntax: 'scp [Optionen] <Quelle> <Ziel>',
                switches: [
                    { flag: '-P <Port>',   desc: 'SSH-Port angeben' },
                    { flag: '-r',          desc: 'Rekursiv (Verzeichnisse)' },
                    { flag: '-i <Key>',    desc: 'Private-Key-Datei angeben' },
                    { flag: '-C',          desc: 'Kompression aktivieren' },
                    { flag: '-v',          desc: 'Ausf\u00fchrliche Ausgabe' },
                ],
                examples: [
                    { cmd: 'scp user@server:/var/log/syslog .',             desc: 'Datei vom Server holen' },
                    { cmd: 'scp -P 2222 -r /data/ user@server:/backup/',   desc: '\u00dcber Port 2222 rekursiv' },
                ]
            }
        },

        // ===== REMOTE (3) =====
        {
            id: 'ssh', name: 'ssh', cat: 'remote',
            desc: 'Sichere Fernverbindung (Secure Shell, ab Win10)',
            win: {
                cmd: 'ssh',
                syntax: 'ssh [Optionen] <user@host>',
                switches: [
                    { flag: '-p <Port>',   desc: 'SSH-Port angeben' },
                    { flag: '-i <Key>',    desc: 'Private-Key-Datei' },
                    { flag: '-L <lokal:host:remote>', desc: 'Port-Forwarding (lokal)' },
                    { flag: '-v',          desc: 'Ausf\u00fchrliche Ausgabe (Debug)' },
                ],
                examples: [
                    { cmd: 'ssh user@server',                         desc: 'Verbindung herstellen' },
                    { cmd: 'ssh -p 2222 -i key.pem user@server',     desc: 'Port + Key angeben' },
                ]
            },
            linux: {
                cmd: 'ssh',
                syntax: 'ssh [Optionen] <user@host>',
                switches: [
                    { flag: '-p <Port>',   desc: 'SSH-Port angeben' },
                    { flag: '-i <Key>',    desc: 'Private-Key-Datei' },
                    { flag: '-L <lokal:host:remote>', desc: 'Port-Forwarding (lokal)' },
                    { flag: '-R <remote:host:lokal>', desc: 'Reverse-Tunnel' },
                    { flag: '-D <Port>',   desc: 'SOCKS-Proxy (dynamisch)' },
                    { flag: '-X',          desc: 'X11-Forwarding (GUI)' },
                ],
                examples: [
                    { cmd: 'ssh user@server',                             desc: 'Verbindung herstellen' },
                    { cmd: 'ssh -L 8080:localhost:80 user@server',       desc: 'Lokaler Tunnel (Port 8080 \u2192 80)' },
                    { cmd: 'ssh -D 9090 user@proxy',                     desc: 'SOCKS-Proxy auf Port 9090' },
                ]
            }
        },
        {
            id: 'telnet', name: 'telnet', cat: 'remote',
            desc: 'Unverschl\u00fcsselte Fernverbindung / Port-Test',
            win: {
                cmd: 'telnet',
                syntax: 'telnet <Host> [Port]',
                switches: [
                    { flag: '<Host> <Port>', desc: 'Verbindung zu Host auf Port' },
                    { flag: '(Hinweis)',     desc: 'Muss unter "Windows-Features" aktiviert werden' },
                ],
                examples: [
                    { cmd: 'telnet server1 25',       desc: 'SMTP-Port testen' },
                    { cmd: 'telnet 192.168.1.1 80',   desc: 'HTTP-Port testen' },
                ]
            },
            linux: {
                cmd: 'telnet',
                syntax: 'telnet <Host> [Port]',
                switches: [
                    { flag: '<Host> <Port>', desc: 'Verbindung zu Host auf Port' },
                ],
                examples: [
                    { cmd: 'telnet server1 25',        desc: 'SMTP-Port testen' },
                    { cmd: 'telnet 192.168.1.1 443',   desc: 'HTTPS-Port testen' },
                ]
            }
        },
        {
            id: 'netuse', name: 'net use / smbclient', cat: 'remote',
            desc: 'Netzlaufwerke (SMB/CIFS) verbinden und verwalten',
            win: {
                cmd: 'net use',
                syntax: 'net use [Laufwerk:] \\\\Server\\Freigabe [Optionen]',
                switches: [
                    { flag: '/user:<Dom\\User>', desc: 'Benutzername angeben' },
                    { flag: '/persistent:yes',   desc: 'Nach Neustart wiederherstellen' },
                    { flag: '/delete',           desc: 'Laufwerk trennen' },
                    { flag: '(ohne Parameter)',  desc: 'Aktive Verbindungen anzeigen' },
                ],
                examples: [
                    { cmd: 'net use',                                           desc: 'Verbundene Laufwerke anzeigen' },
                    { cmd: 'net use Z: \\\\server\\share /user:domain\\user',  desc: 'Netzlaufwerk verbinden' },
                    { cmd: 'net use Z: /delete',                               desc: 'Laufwerk Z: trennen' },
                ]
            },
            linux: {
                cmd: 'smbclient',
                syntax: 'smbclient //<Server>/<Freigabe> [Optionen]',
                switches: [
                    { flag: '-U <User>',   desc: 'Benutzername angeben' },
                    { flag: '-L <Server>', desc: 'Verf\u00fcgbare Freigaben auflisten' },
                    { flag: '-c "<Befehl>"', desc: 'Befehl direkt ausf\u00fchren' },
                    { flag: '-N',          desc: 'Kein Passwort (anonym)' },
                ],
                examples: [
                    { cmd: 'smbclient //server/share -U user',    desc: 'Interaktive SMB-Sitzung' },
                    { cmd: 'smbclient -L server -U user',         desc: 'Freigaben auflisten' },
                ]
            }
        },

        // ===== INFO (4) =====
        {
            id: 'whoami', name: 'whoami', cat: 'info',
            desc: 'Aktuellen Benutzer, Gruppen und Berechtigungen anzeigen',
            win: {
                cmd: 'whoami',
                syntax: 'whoami [Optionen]',
                switches: [
                    { flag: '(ohne)',      desc: 'Aktuellen Benutzernamen anzeigen' },
                    { flag: '/user',       desc: 'Benutzer-SID anzeigen' },
                    { flag: '/groups',     desc: 'Gruppenmitgliedschaften anzeigen' },
                    { flag: '/priv',       desc: 'Zugewiesene Berechtigungen anzeigen' },
                    { flag: '/all',        desc: 'Alle Informationen (User, SID, Gruppen, Priv)' },
                    { flag: '/fo TABLE|LIST|CSV', desc: 'Ausgabeformat festlegen' },
                ],
                examples: [
                    { cmd: 'whoami',            desc: 'Benutzername (DOMAIN\\User)' },
                    { cmd: 'whoami /all',       desc: 'Vollst\u00e4ndige Info (SID, Gruppen, Priv)' },
                    { cmd: 'whoami /groups',    desc: 'Gruppenmitgliedschaften' },
                ]
            },
            linux: {
                cmd: 'whoami / id',
                syntax: 'whoami | id [Optionen] [Benutzer]',
                switches: [
                    { flag: 'whoami',      desc: 'Aktuellen Benutzernamen anzeigen' },
                    { flag: 'id',          desc: 'UID, GID und Gruppen anzeigen' },
                    { flag: 'id -u',       desc: 'Nur User-ID (UID)' },
                    { flag: 'id -g',       desc: 'Nur Group-ID (GID)' },
                    { flag: 'id -Gn',      desc: 'Alle Gruppennamen' },
                    { flag: 'groups',      desc: 'Gruppenmitgliedschaften' },
                ],
                examples: [
                    { cmd: 'whoami',       desc: 'Benutzername anzeigen' },
                    { cmd: 'id',           desc: 'UID, GID und alle Gruppen' },
                    { cmd: 'id -Gn',       desc: 'Alle Gruppennamen auflisten' },
                ]
            }
        },
        {
            id: 'systeminfo', name: 'systeminfo / uname', cat: 'info',
            desc: 'Systeminformationen anzeigen (OS, Hardware, Netzwerk)',
            win: {
                cmd: 'systeminfo',
                syntax: 'systeminfo [Optionen]',
                switches: [
                    { flag: '/s <Server>',  desc: 'Remotecomputer abfragen' },
                    { flag: '/fo TABLE|LIST|CSV', desc: 'Ausgabeformat' },
                    { flag: '| findstr "..."', desc: 'Ausgabe filtern' },
                ],
                examples: [
                    { cmd: 'systeminfo',                                 desc: 'Vollst\u00e4ndige Systeminfo' },
                    { cmd: 'systeminfo | findstr "Betriebssystem"',     desc: 'Nur OS-Infos filtern' },
                    { cmd: 'systeminfo /fo CSV > info.csv',             desc: 'Als CSV exportieren' },
                ]
            },
            linux: {
                cmd: 'uname / hostnamectl',
                syntax: 'uname [Optionen] | hostnamectl',
                switches: [
                    { flag: '-a',          desc: 'Alle Systeminfos (Kernel, Arch)' },
                    { flag: '-r',          desc: 'Nur Kernel-Version' },
                    { flag: '-m',          desc: 'Maschinen-Architektur (x86_64)' },
                    { flag: 'hostnamectl', desc: 'Ausf\u00fchrlich (OS, Kernel, Chassis)' },
                ],
                examples: [
                    { cmd: 'uname -a',            desc: 'Kernel + Architektur' },
                    { cmd: 'hostnamectl',          desc: 'Ausf\u00fchrliche System-Info' },
                    { cmd: 'cat /etc/os-release',  desc: 'Distribution + Version' },
                ]
            }
        },
        {
            id: 'porttest', name: 'Test-NetConnection / nc', cat: 'info',
            desc: 'Port-Erreichbarkeit testen und Netzwerk-Diagnose',
            win: {
                cmd: 'Test-NetConnection',
                syntax: 'Test-NetConnection <Host> [-Port <Port>] [Optionen]',
                switches: [
                    { flag: '-Port <Port>',                desc: 'TCP-Port pr\u00fcfen' },
                    { flag: '-InformationLevel Detailed',  desc: 'Ausf\u00fchrliche Ausgabe' },
                    { flag: '-TraceRoute',                 desc: 'Routenverfolgung einschlie\u00dfen' },
                ],
                examples: [
                    { cmd: 'Test-NetConnection example.com -Port 443',       desc: 'HTTPS-Port pr\u00fcfen' },
                    { cmd: 'Test-NetConnection 8.8.8.8 -TraceRoute',         desc: 'Ping + Traceroute' },
                ]
            },
            linux: {
                cmd: 'nc (netcat)',
                syntax: 'nc [Optionen] <Host> <Port>',
                switches: [
                    { flag: '-z',          desc: 'Scan-Modus (nur pr\u00fcfen, keine Daten)' },
                    { flag: '-v',          desc: 'Ausf\u00fchrliche Ausgabe' },
                    { flag: '-w <Sek>',    desc: 'Timeout in Sekunden' },
                    { flag: '-l',          desc: 'Listen-Modus (Server)' },
                    { flag: '-p <Port>',   desc: 'Lokalen Port festlegen' },
                    { flag: '-u',          desc: 'UDP statt TCP' },
                ],
                examples: [
                    { cmd: 'nc -zv example.com 443',    desc: 'Port 443 pr\u00fcfen' },
                    { cmd: 'nc -l -p 8080',              desc: 'Auf Port 8080 lauschen' },
                    { cmd: 'nc -zv server1 20-25',       desc: 'Port-Range scannen' },
                ]
            }
        },
        {
            id: 'capture', name: 'pktmon / tcpdump', cat: 'info',
            desc: 'Netzwerkverkehr mitschneiden und analysieren',
            win: {
                cmd: 'pktmon / netsh trace',
                syntax: 'pktmon <Aktion> [Optionen]',
                switches: [
                    { flag: 'pktmon start --capture',  desc: 'Mitschnitt starten' },
                    { flag: 'pktmon stop',             desc: 'Mitschnitt beenden' },
                    { flag: 'pktmon list',             desc: 'Interfaces auflisten' },
                    { flag: 'pktmon counters',         desc: 'Paket-Z\u00e4hler anzeigen' },
                    { flag: 'netsh trace start capture=yes', desc: 'Alternative: netsh trace' },
                    { flag: 'netsh trace stop',        desc: 'netsh trace beenden' },
                ],
                examples: [
                    { cmd: 'pktmon start --capture -c',                            desc: 'Packet Monitor starten' },
                    { cmd: 'netsh trace start capture=yes tracefile=trace.etl',    desc: 'Trace in Datei' },
                ]
            },
            linux: {
                cmd: 'tcpdump',
                syntax: 'tcpdump [Optionen] [Filter]',
                switches: [
                    { flag: '-i <IF>',     desc: 'Interface w\u00e4hlen (any = alle)' },
                    { flag: '-n',          desc: 'Keine DNS-Aufl\u00f6sung' },
                    { flag: '-c <Anz>',    desc: 'Nach n Paketen stoppen' },
                    { flag: '-w <Datei>',  desc: 'In PCAP-Datei schreiben' },
                    { flag: '-r <Datei>',  desc: 'PCAP-Datei lesen' },
                    { flag: 'port <Port>', desc: 'Nach Port filtern' },
                    { flag: 'host <Host>', desc: 'Nach Host filtern' },
                    { flag: '-X',          desc: 'Hex + ASCII Ausgabe' },
                ],
                examples: [
                    { cmd: 'tcpdump -i eth0 -n port 80',       desc: 'HTTP-Traffic auf eth0' },
                    { cmd: 'tcpdump -i any -w capture.pcap',   desc: 'Alles in Datei mitschneiden' },
                    { cmd: 'tcpdump -r capture.pcap',           desc: 'PCAP-Datei analysieren' },
                ]
            }
        },
        // ===== WINDOWS CPL-MODULE (15) =====
        {
            id: 'firewall-cpl', name: 'firewall.cpl', cat: 'win-cpl',
            desc: 'Windows Defender Firewall \u00f6ffnen',
            win: {
                cmd: 'firewall.cpl',
                syntax: 'firewall.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Startet direkt die Windows Defender Firewall' },
                ],
                examples: [
                    { cmd: 'firewall.cpl',           desc: 'Firewall-Einstellungen \u00f6ffnen' },
                    { cmd: 'control firewall.cpl',   desc: 'Alternative \u00fcber control' },
                ]
            },
            linux: null,
            linuxHint: 'Kein direktes Pendant. Verwende ufw (Befehlszeile) oder iptables.'
        },
        {
            id: 'inetcpl', name: 'inetcpl.cpl', cat: 'win-cpl',
            desc: 'Interneteigenschaften (Proxy, Sicherheit, Zertifikate)',
            win: {
                cmd: 'inetcpl.cpl',
                syntax: 'inetcpl.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Startet Interneteigenschaften (IE/System-Proxy)' },
                ],
                examples: [
                    { cmd: 'inetcpl.cpl',          desc: 'Interneteigenschaften \u00f6ffnen' },
                    { cmd: 'control inetcpl.cpl',  desc: 'Alternative \u00fcber control' },
                ]
            },
            linux: null,
            linuxHint: 'Proxy-Einstellungen \u00fcber /etc/environment oder Einstellungen der Desktop-Umgebung.'
        },
        {
            id: 'sysdm', name: 'sysdm.cpl', cat: 'win-cpl',
            desc: 'Systemeigenschaften (Computername, Hardware, Remotedesktop)',
            win: {
                cmd: 'sysdm.cpl',
                syntax: 'sysdm.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Systemeigenschaften \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'sysdm.cpl',      desc: 'Systemeigenschaften \u00f6ffnen' },
                    { cmd: 'sysdm.cpl ,3',   desc: 'Direkt Tab "Erweitert" \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Systeminfos: hostnamectl, uname -a, /etc/os-release.'
        },
        {
            id: 'appwiz', name: 'appwiz.cpl', cat: 'win-cpl',
            desc: 'Programme und Features (Deinstallation)',
            win: {
                cmd: 'appwiz.cpl',
                syntax: 'appwiz.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Liste aller installierten Programme' },
                ],
                examples: [
                    { cmd: 'appwiz.cpl',          desc: 'Programme und Features \u00f6ffnen' },
                    { cmd: 'control appwiz.cpl',  desc: 'Alternative \u00fcber control' },
                ]
            },
            linux: null,
            linuxHint: 'Paketverwaltung: apt list --installed, dnf list installed, dpkg -l.'
        },
        {
            id: 'powercfg-cpl', name: 'powercfg.cpl', cat: 'win-cpl',
            desc: 'Energieoptionen (Energiesparpl\u00e4ne, Ruhezustand)',
            win: {
                cmd: 'powercfg.cpl',
                syntax: 'powercfg.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Energieoptionen \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'powercfg.cpl',   desc: 'Energieoptionen \u00f6ffnen' },
                    { cmd: 'powercfg /l',    desc: 'Energiep\u00e4ne per CLI auflisten' },
                ]
            },
            linux: null,
            linuxHint: 'Energieverwaltung: TLP, powertop, systemctl suspend/hibernate.'
        },
        {
            id: 'timedate', name: 'timedate.cpl', cat: 'win-cpl',
            desc: 'Datum und Uhrzeit (Zeitzone, NTP-Synchronisation)',
            win: {
                cmd: 'timedate.cpl',
                syntax: 'timedate.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Datum- und Uhrzeit-Einstellungen \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'timedate.cpl',    desc: 'Datums- und Uhrzeit-Dialog \u00f6ffnen' },
                    { cmd: 'w32tm /resync',   desc: 'Zeit per CLI sofort synchronisieren' },
                ]
            },
            linux: null,
            linuxHint: 'Zeitverwaltung: timedatectl, timedatectl set-timezone Europe/Berlin.'
        },
        {
            id: 'intl', name: 'intl.cpl', cat: 'win-cpl',
            desc: 'Region und Sprache (Zahlenformat, W\u00e4hrung, Tastaturlayout)',
            win: {
                cmd: 'intl.cpl',
                syntax: 'intl.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Regions- und Spracheinstellungen \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'intl.cpl',         desc: 'Regionseinstellungen \u00f6ffnen' },
                    { cmd: 'control intl.cpl', desc: 'Alternative \u00fcber control' },
                ]
            },
            linux: null,
            linuxHint: 'Regionseinstellungen: localectl, /etc/locale.conf, locale-gen.'
        },
        {
            id: 'wscui', name: 'wscui.cpl', cat: 'win-cpl',
            desc: 'Sicherheit und Wartung (Action Center)',
            win: {
                cmd: 'wscui.cpl',
                syntax: 'wscui.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Sicherheits- und Wartungscenter \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'wscui.cpl', desc: 'Sicherheit und Wartung \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Kein direktes Pendant. Sicherheitsstatus: ufw status, rkhunter --check.'
        },
        {
            id: 'desk', name: 'desk.cpl', cat: 'win-cpl',
            desc: 'Anzeigeeinstellungen (Aufl\u00f6sung, Orientierung, Mehrere Monitore)',
            win: {
                cmd: 'desk.cpl',
                syntax: 'desk.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Anzeigeeinstellungen \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'desk.cpl', desc: 'Anzeigeeinstellungen \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Anzeigeeinstellungen: xrandr, arandr (GUI), GNOME/KDE Bildschirmeinstellungen.'
        },
        {
            id: 'mmsys', name: 'mmsys.cpl', cat: 'win-cpl',
            desc: 'Sound-Einstellungen (Wiedergabe, Aufnahme, Systemkl\u00e4nge)',
            win: {
                cmd: 'mmsys.cpl',
                syntax: 'mmsys.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Soundeinstellungen \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'mmsys.cpl',      desc: 'Sound-Dialog \u00f6ffnen' },
                    { cmd: 'mmsys.cpl ,1',   desc: 'Direkt Tab "Aufnahme" \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Audioeinstellungen: alsamixer (TUI), pavucontrol (GUI), pactl list sinks.'
        },
        {
            id: 'main-cpl', name: 'main.cpl', cat: 'win-cpl',
            desc: 'Maus-Einstellungen (Zeiger, Tasten, Zeigerrad)',
            win: {
                cmd: 'main.cpl',
                syntax: 'main.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Mauseinstellungen \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'main.cpl', desc: 'Maus-Einstellungen \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Mauseinstellungen: xinput, xset m, GNOME/KDE Mauseinstellungen.'
        },
        {
            id: 'bthprops', name: 'bthprops.cpl', cat: 'win-cpl',
            desc: 'Bluetooth-Ger\u00e4te verwalten',
            win: {
                cmd: 'bthprops.cpl',
                syntax: 'bthprops.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Bluetooth-Einstellungen \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'bthprops.cpl', desc: 'Bluetooth-Einstellungen \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Bluetooth: bluetoothctl, blueman-manager (GUI).'
        },
        {
            id: 'joy', name: 'joy.cpl', cat: 'win-cpl',
            desc: 'Gamecontroller und Joysticks konfigurieren',
            win: {
                cmd: 'joy.cpl',
                syntax: 'joy.cpl',
                switches: [
                    { flag: '(keine)', desc: '\u00d6ffnet den Gamecontroller-Dialog' },
                ],
                examples: [
                    { cmd: 'joy.cpl', desc: 'Gamecontroller-Einstellungen \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Controller-Test: jstest /dev/input/js0, evtest.'
        },
        {
            id: 'hdwwiz', name: 'hdwwiz.cpl', cat: 'win-cpl',
            desc: 'Hardware-Assistent (Legacy-Ger\u00e4te manuell installieren)',
            win: {
                cmd: 'hdwwiz.cpl',
                syntax: 'hdwwiz.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Hardware-Assistent starten' },
                ],
                examples: [
                    { cmd: 'hdwwiz.cpl', desc: 'Hardware-Assistent \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Hardware-Erkennung: udev, modprobe, lspci -k, lsusb.'
        },
        {
            id: 'access', name: 'access.cpl', cat: 'win-cpl',
            desc: 'Center f\u00fcr erleichterte Bedienung (Barrierefreiheit)',
            win: {
                cmd: 'access.cpl',
                syntax: 'access.cpl',
                switches: [
                    { flag: '(keine)', desc: 'Bedienungshilfen \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'access.cpl', desc: 'Bedienungshilfen \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Bedienungshilfen: Zug\u00e4nglichkeitseinstellungen in GNOME/KDE.'
        },

        // ===== WINDOWS MSC-SNAPINS (13) =====
        {
            id: 'compmgmt', name: 'compmgmt.msc', cat: 'win-msc',
            desc: 'Computerverwaltung (Ger\u00e4te, Dienste, Datentr\u00e4ger, lokale Benutzer)',
            win: {
                cmd: 'compmgmt.msc',
                syntax: 'compmgmt.msc',
                switches: [
                    { flag: '(keine)', desc: '\u00d6ffnet die Computerverwaltung' },
                ],
                examples: [
                    { cmd: 'compmgmt.msc', desc: 'Computerverwaltung \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Kein direktes Pendant — entspricht einer Sammlung aus: systemctl, lsblk, useradd u.a.'
        },
        {
            id: 'devmgmt', name: 'devmgmt.msc', cat: 'win-msc',
            desc: 'Ger\u00e4te-Manager (Treiber, Hardware-Status, Fehlerdiagnose)',
            win: {
                cmd: 'devmgmt.msc',
                syntax: 'devmgmt.msc',
                switches: [
                    { flag: '(keine)', desc: 'Ger\u00e4te-Manager \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'devmgmt.msc', desc: 'Ger\u00e4te-Manager \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Ger\u00e4te-Info: lspci, lsusb, lshw, dmesg | grep -i error.'
        },
        {
            id: 'diskmgmt', name: 'diskmgmt.msc', cat: 'win-msc',
            desc: 'Datentr\u00e4gerverwaltung (Partitionen, Laufwerksbuchstaben, Volumes)',
            win: {
                cmd: 'diskmgmt.msc',
                syntax: 'diskmgmt.msc',
                switches: [
                    { flag: '(keine)', desc: 'Datentr\u00e4gerverwaltung \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'diskmgmt.msc',  desc: 'Datentr\u00e4gerverwaltung \u00f6ffnen' },
                    { cmd: 'diskpart',      desc: 'CLI-Alternative f\u00fcr Partitionierung' },
                ]
            },
            linux: null,
            linuxHint: 'Partitionierung: fdisk, parted, gparted (GUI), lsblk.'
        },
        {
            id: 'services', name: 'services.msc', cat: 'win-msc',
            desc: 'Dienste (starten, stoppen, Starttyp konfigurieren)',
            win: {
                cmd: 'services.msc',
                syntax: 'services.msc',
                switches: [
                    { flag: '(keine)', desc: '\u00d6ffnet die Diensteverwaltung' },
                ],
                examples: [
                    { cmd: 'services.msc',       desc: 'Dienste-Manager \u00f6ffnen' },
                    { cmd: 'sc query <Dienst>',  desc: 'Dienststatus per CLI abfragen' },
                ]
            },
            linux: null,
            linuxHint: 'Dienstverwaltung: systemctl start/stop/status <Dienst>.'
        },
        {
            id: 'taskschd', name: 'taskschd.msc', cat: 'win-msc',
            desc: 'Aufgabenplanung (geplante Tasks erstellen und verwalten)',
            win: {
                cmd: 'taskschd.msc',
                syntax: 'taskschd.msc',
                switches: [
                    { flag: '(keine)', desc: 'Aufgabenplanung \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'taskschd.msc',    desc: 'Aufgabenplanung \u00f6ffnen' },
                    { cmd: 'schtasks /query', desc: 'Alle Tasks per CLI auflisten' },
                ]
            },
            linux: null,
            linuxHint: 'Aufgabenplanung: crontab -e (cron), systemctl list-timers (systemd timer).'
        },
        {
            id: 'eventvwr', name: 'eventvwr.msc', cat: 'win-msc',
            desc: 'Ereignisanzeige (System-, Anwendungs- und Sicherheitslogs)',
            win: {
                cmd: 'eventvwr.msc',
                syntax: 'eventvwr.msc',
                switches: [
                    { flag: '(keine)', desc: 'Ereignisanzeige \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'eventvwr.msc',        desc: 'Ereignisanzeige \u00f6ffnen' },
                    { cmd: 'eventvwr /l:System',  desc: 'Direkt Systemlog \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Systemlogs: journalctl -xe, journalctl -u <Dienst>, /var/log/.'
        },
        {
            id: 'lusrmgr', name: 'lusrmgr.msc', cat: 'win-msc',
            desc: 'Lokale Benutzer und Gruppen (Konten, Kennw\u00f6rter, Gruppenmitgliedschaft)',
            win: {
                cmd: 'lusrmgr.msc',
                syntax: 'lusrmgr.msc',
                switches: [
                    { flag: '(keine)', desc: 'Benutzerverwaltung \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'lusrmgr.msc',  desc: 'Lokale Benutzer und Gruppen \u00f6ffnen' },
                    { cmd: 'net user',     desc: 'Alle lokalen Benutzer per CLI' },
                ]
            },
            linux: null,
            linuxHint: 'Benutzerverwaltung: useradd, usermod, passwd, groupadd, /etc/passwd.'
        },
        {
            id: 'gpedit', name: 'gpedit.msc', cat: 'win-msc',
            desc: 'Gruppenrichtlinien-Editor (lokale Richtlinien f\u00fcr System und Benutzer)',
            win: {
                cmd: 'gpedit.msc',
                syntax: 'gpedit.msc',
                switches: [
                    { flag: '(keine)', desc: 'Gruppenrichtlinien-Editor \u00f6ffnen (nur Pro/Enterprise)' },
                ],
                examples: [
                    { cmd: 'gpedit.msc',       desc: 'Lokale Gruppenrichtlinien \u00f6ffnen' },
                    { cmd: 'gpupdate /force',  desc: 'Richtlinien sofort anwenden' },
                ]
            },
            linux: null,
            linuxHint: 'Kein direktes Pendant. Einstellungen \u00fcber /etc/security/, PAM-Module oder Ansible.'
        },
        {
            id: 'secpol', name: 'secpol.msc', cat: 'win-msc',
            desc: 'Lokale Sicherheitsrichtlinie (Kennwortrichtlinien, Auditing, Benutzerrechte)',
            win: {
                cmd: 'secpol.msc',
                syntax: 'secpol.msc',
                switches: [
                    { flag: '(keine)', desc: 'Sicherheitsrichtlinie \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'secpol.msc', desc: 'Lokale Sicherheitsrichtlinie \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Sicherheitsrichtlinien: /etc/security/limits.conf, PAM-Konfiguration, /etc/pam.d/.'
        },
        {
            id: 'perfmon', name: 'perfmon.msc', cat: 'win-msc',
            desc: 'Leistungs\u00fcberwachung (CPU, RAM, Datentr\u00e4ger, Netzwerk — Live-Graphen)',
            win: {
                cmd: 'perfmon.msc',
                syntax: 'perfmon.msc',
                switches: [
                    { flag: '(keine)', desc: 'Leistungs\u00fcberwachung \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'perfmon.msc',      desc: 'Leistungs\u00fcberwachung \u00f6ffnen' },
                    { cmd: 'perfmon /report',  desc: 'Systemdiagnose-Bericht erstellen' },
                ]
            },
            linux: null,
            linuxHint: 'Leistungs\u00fcberwachung: top, htop, iostat, vmstat, nmon, glances.'
        },
        {
            id: 'wf', name: 'wf.msc', cat: 'win-msc',
            desc: 'Windows Defender Firewall mit erweiterter Sicherheit (Eingehend/Ausgehend)',
            win: {
                cmd: 'wf.msc',
                syntax: 'wf.msc',
                switches: [
                    { flag: '(keine)', desc: 'Erweiterte Firewall-Konsole \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'wf.msc',                       desc: 'Erweiterte Firewall \u00f6ffnen' },
                    { cmd: 'netsh advfirewall show all',   desc: 'Firewall-Status per CLI' },
                ]
            },
            linux: null,
            linuxHint: 'Firewall: iptables -L -v, ufw status verbose, nftables.'
        },
        {
            id: 'certmgr', name: 'certmgr.msc', cat: 'win-msc',
            desc: 'Zertifikat-Manager (Benutzer-Zertifikate, pers\u00f6nlich, vertrauensw\u00fcrdige Stellen)',
            win: {
                cmd: 'certmgr.msc',
                syntax: 'certmgr.msc',
                switches: [
                    { flag: '(keine)', desc: 'Zertifikatspeicher des aktuellen Benutzers \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'certmgr.msc', desc: 'Benutzer-Zertifikate \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Zertifikatsverwaltung: /etc/ssl/certs/, update-ca-certificates, openssl x509 -in cert.pem -text.'
        },
        {
            id: 'certlm', name: 'certlm.msc', cat: 'win-msc',
            desc: 'Zertifikate des lokalen Computers (Maschinenweite Zertifikate, IIS, VPN)',
            win: {
                cmd: 'certlm.msc',
                syntax: 'certlm.msc',
                switches: [
                    { flag: '(keine)', desc: 'Zertifikatspeicher des lokalen Computers \u00f6ffnen' },
                ],
                examples: [
                    { cmd: 'certlm.msc', desc: 'Computer-Zertifikate \u00f6ffnen' },
                ]
            },
            linux: null,
            linuxHint: 'Systemweite Zertifikate: /etc/ssl/certs/, update-ca-certificates, /usr/local/share/ca-certificates/.'
        },
    ];

    // --- State ---
    let selectedCat = 'all';
    let expandedId = null;

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card nb-input-card">
            <label for="nb-search">Suche (Befehl, Beschreibung oder Schalter)</label>
            <input type="text" id="nb-search"
                   placeholder="z.B. ping, DNS, Firewall..."
                   autocomplete="off" spellcheck="false">
            <label class="nb-cat-label">Kategorie</label>
            <div class="nb-cat-chips" id="nb-cat-chips">
                ${Object.entries(CATEGORIES).map(([key, cat]) =>
                    `<span class="chip nb-cat-chip${key === 'all' ? ' active' : ''}" data-cat="${key}" data-color="${cat.color}">${cat.label}</span>`
                ).join('')}
            </div>
        </section>
        <section class="card nb-result-card" id="nb-result-card">
            <div class="nb-result-header">
                <h3>Befehls-Referenz</h3>
                <span class="nb-count" id="nb-count">${COMMANDS.length} Befehle</span>
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
            return `<div class="nb-platform">
                <div class="nb-platform-header">
                    <span class="nb-platform-icon">${icon}</span>
                    <span class="nb-platform-label ${label === 'Windows' ? 'win' : 'linux'}">${label}</span>
                </div>
                <div class="nb-no-equivalent">
                    <span class="nb-no-equiv-icon">\u2205</span>
                    <span>Kein direktes Pendant unter ${label}.</span>
                    ${hint ? `<span class="nb-no-equiv-hint">${escHtml(hint)}</span>` : ''}
                </div>
            </div>`;
        }

        const switchRows = platform.switches.map(s =>
            `<tr><td class="nb-switch-flag"><code>${escHtml(s.flag)}</code></td><td class="nb-switch-desc">${escHtml(s.desc)}</td></tr>`
        ).join('');

        const exampleBlocks = platform.examples.map(ex =>
            `<div class="nb-example">
                <div class="nb-code-row">
                    <code class="nb-code">${escHtml(ex.cmd)}</code>
                    <button class="nb-copy-btn" data-copy="${escHtml(ex.cmd)}" title="Kopieren">${COPY_ICON}</button>
                </div>
                <span class="nb-example-desc">${escHtml(ex.desc)}</span>
            </div>`
        ).join('');

        const helpHint = label === 'Windows'
            ? `<div class="nb-help-hint"><code>${escHtml(platform.cmd.split(' ')[0])} /?</code> \u2014 Alle Parameter anzeigen</div>`
            : `<div class="nb-help-hint"><code>${escHtml(platform.cmd.split(' ')[0])} --help</code> oder <code>man ${escHtml(platform.cmd.split(' ')[0])}</code></div>`;

        return `<div class="nb-platform">
            <div class="nb-platform-header">
                <span class="nb-platform-icon">${icon}</span>
                <span class="nb-platform-label ${label === 'Windows' ? 'win' : 'linux'}">${label}</span>
            </div>
            <div class="nb-section-label">Syntax</div>
            <div class="nb-code-row">
                <code class="nb-code">${escHtml(platform.syntax)}</code>
                <button class="nb-copy-btn" data-copy="${escHtml(platform.cmd)}" title="Kopieren">${COPY_ICON}</button>
            </div>
            <div class="nb-section-label">Wichtige Schalter</div>
            <table class="nb-switch-table">${switchRows}</table>
            ${helpHint}
            <div class="nb-section-label">Beispiele</div>
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
                   s.desc.toLowerCase().includes(query)
               ) ||
               p.examples.some(ex =>
                   ex.cmd.toLowerCase().includes(query) ||
                   ex.desc.toLowerCase().includes(query)
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
                   cmd.desc.toLowerCase().includes(query) ||
                   searchPlatform(cmd.win, query) ||
                   searchPlatform(cmd.linux, query) ||
                   (cmd.winHint && cmd.winHint.toLowerCase().includes(query)) ||
                   (cmd.linuxHint && cmd.linuxHint.toLowerCase().includes(query));
        });

        nbCount.textContent = `${filtered.length} Befehl${filtered.length !== 1 ? 'e' : ''}`;

        if (filtered.length === 0) {
            nbList.innerHTML = '<div class="nb-empty">Keine Befehle gefunden</div>';
            return;
        }

        let html = '';
        let lastGroup = null;
        filtered.forEach(cmd => {
            // Gruppen-Überschrift für Windows CPL/MSC
            const group = WIN_GROUPS_MAP[cmd.id];
            if (group && group !== lastGroup) {
                html += `<div class="nb-group-header">${WIN_GROUPS[group]}</div>`;
                lastGroup = group;
            }
            const cat = CATEGORIES[cmd.cat] || CATEGORIES.all;
            const isExpanded = expandedId === cmd.id;
            html += `
                <div class="nb-row${isExpanded ? ' expanded' : ''}" data-id="${cmd.id}">
                    <div class="nb-row-header">
                        <div class="nb-name-block">
                            <span class="nb-name">${escHtml(cmd.name)}</span>
                            <span class="nb-desc">${escHtml(cmd.desc)}</span>
                        </div>
                        <span class="nb-cat-badge" style="color:${cat.color};background:${cat.color}15;border-color:${cat.color}40">${cat.label}</span>
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
