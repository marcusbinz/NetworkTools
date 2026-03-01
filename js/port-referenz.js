// === Port-Referenz Tool ===

function init_port_referenz(container) {
    // --- i18n Strings ---
    I18N.register('port', {
        de: {
            search: 'Suche (Port-Nr., Service oder Beschreibung)',
            placeholder: 'z.B. 443, SSH, Datenbank...',
            catLabel: 'Kategorie',
            catAll: 'Alle',
            catWeb: 'Web',
            catMail: 'E-Mail',
            catFile: 'Dateien',
            catRemote: 'Remote',
            catNet: 'Netzwerk',
            catDb: 'Datenbank',
            catAuth: 'Auth',
            catVpn: 'VPN',
            catOther: 'Sonstige',
            title: 'Port-Referenz',
            ports: 'Ports',
            port: 'Port',
            noResults: 'Keine Ports gefunden',
            // Port descriptions (DE)
            d20: 'Dateiübertragung (Datenkanal)',
            d21: 'Dateiübertragung (Steuerung)',
            d22: 'Secure Shell — verschlüsselte Fernwartung',
            d23: 'Unverschlüsselte Fernwartung (unsicher!)',
            d25: 'E-Mail-Versand (Server-zu-Server)',
            d53: 'Domain Name System — Namensauflösung',
            d67: 'Dynamische IP-Adressvergabe (Server)',
            d68: 'Dynamische IP-Adressvergabe (Client)',
            d69: 'Trivial File Transfer — einfache Dateiübertragung',
            d80: 'Webserver — unverschlüsseltes Web',
            d88: 'Netzwerk-Authentifizierung (Active Directory)',
            d110: 'E-Mail-Abruf (veraltet, unsicher)',
            d119: 'Usenet-Newsgruppen',
            d123: 'Zeitsynchronisation',
            d135: 'Microsoft Remote Procedure Call',
            d137: 'Windows-Netzwerk Namensauflösung',
            d138: 'Windows-Netzwerk Datagramme',
            d139: 'Windows-Netzwerk Sitzungen / SMBv1',
            d143: 'E-Mail-Abruf mit Ordner-Sync',
            d161: 'Netzwerk-Management und Monitoring',
            d162: 'SNMP-Benachrichtigungen',
            d179: 'Border Gateway Protocol — Internet-Routing',
            d194: 'Internet Relay Chat',
            d389: 'Verzeichnisdienst (Active Directory)',
            d443: 'Webserver — verschlüsseltes Web (TLS/SSL)',
            d445: 'Windows-Dateifreigabe / Netzlaufwerke',
            d465: 'E-Mail-Versand verschlüsselt (veraltet)',
            d500: 'IPsec VPN Schlüsselaustausch',
            d514: 'System-Logging über Netzwerk',
            d515: 'Netzwerk-Druckdienst',
            d587: 'E-Mail-Versand (Client → Server, STARTTLS)',
            d636: 'LDAP über TLS/SSL',
            d993: 'E-Mail-Abruf verschlüsselt (IMAP über TLS)',
            d995: 'E-Mail-Abruf verschlüsselt (POP3 über TLS)',
            d1080: 'SOCKS Proxy',
            d1194: 'OpenVPN Tunnel',
            d1433: 'Microsoft SQL Server',
            d1434: 'SQL Server Discovery',
            d1521: 'Oracle Datenbank',
            d1723: 'Point-to-Point Tunneling VPN',
            d1883: 'IoT Messaging Protokoll',
            d2049: 'Network File System (Unix/Linux)',
            d3306: 'MySQL / MariaDB Datenbank',
            d3389: 'Remote Desktop (Windows-Fernsteuerung)',
            d4500: 'IPsec VPN hinter NAT',
            d5060: 'VoIP Signalisierung',
            d5432: 'PostgreSQL Datenbank',
            d5900: 'Virtual Network Computing — Fernsteuerung',
            d5985: 'Windows Remote Management',
            d5986: 'Windows Remote Management (TLS)',
            d6379: 'Redis In-Memory Datenbank',
            d6443: 'Kubernetes API Server',
            d8080: 'Alternativer Webserver / Proxy',
            d8443: 'Alternativer HTTPS-Port',
            d8883: 'IoT Messaging verschlüsselt',
            d9090: 'Monitoring System',
            d9200: 'Elasticsearch REST API',
            d27017: 'MongoDB Datenbank',
            d51820: 'Modernes VPN-Protokoll',
        },
        en: {
            search: 'Search (port number, service or description)',
            placeholder: 'e.g. 443, SSH, database...',
            catLabel: 'Category',
            catAll: 'All',
            catWeb: 'Web',
            catMail: 'Email',
            catFile: 'Files',
            catRemote: 'Remote',
            catNet: 'Network',
            catDb: 'Database',
            catAuth: 'Auth',
            catVpn: 'VPN',
            catOther: 'Other',
            title: 'Port Reference',
            ports: 'Ports',
            port: 'Port',
            noResults: 'No ports found',
            // Port descriptions (EN)
            d20: 'File transfer (data channel)',
            d21: 'File transfer (control)',
            d22: 'Secure Shell — encrypted remote access',
            d23: 'Unencrypted remote access (insecure!)',
            d25: 'Email delivery (server-to-server)',
            d53: 'Domain Name System — name resolution',
            d67: 'Dynamic IP address assignment (server)',
            d68: 'Dynamic IP address assignment (client)',
            d69: 'Trivial File Transfer — simple file transfer',
            d80: 'Web server — unencrypted web',
            d88: 'Network authentication (Active Directory)',
            d110: 'Email retrieval (legacy, insecure)',
            d119: 'Usenet newsgroups',
            d123: 'Time synchronization',
            d135: 'Microsoft Remote Procedure Call',
            d137: 'Windows network name resolution',
            d138: 'Windows network datagrams',
            d139: 'Windows network sessions / SMBv1',
            d143: 'Email retrieval with folder sync',
            d161: 'Network management and monitoring',
            d162: 'SNMP notifications',
            d179: 'Border Gateway Protocol — internet routing',
            d194: 'Internet Relay Chat',
            d389: 'Directory service (Active Directory)',
            d443: 'Web server — encrypted web (TLS/SSL)',
            d445: 'Windows file sharing / network drives',
            d465: 'Email delivery encrypted (legacy)',
            d500: 'IPsec VPN key exchange',
            d514: 'System logging over network',
            d515: 'Network printing service',
            d587: 'Email submission (client → server, STARTTLS)',
            d636: 'LDAP over TLS/SSL',
            d993: 'Email retrieval encrypted (IMAP over TLS)',
            d995: 'Email retrieval encrypted (POP3 over TLS)',
            d1080: 'SOCKS Proxy',
            d1194: 'OpenVPN tunnel',
            d1433: 'Microsoft SQL Server',
            d1434: 'SQL Server discovery',
            d1521: 'Oracle database',
            d1723: 'Point-to-Point Tunneling VPN',
            d1883: 'IoT messaging protocol',
            d2049: 'Network File System (Unix/Linux)',
            d3306: 'MySQL / MariaDB database',
            d3389: 'Remote Desktop (Windows remote control)',
            d4500: 'IPsec VPN behind NAT',
            d5060: 'VoIP signaling',
            d5432: 'PostgreSQL database',
            d5900: 'Virtual Network Computing — remote control',
            d5985: 'Windows Remote Management',
            d5986: 'Windows Remote Management (TLS)',
            d6379: 'Redis in-memory database',
            d6443: 'Kubernetes API server',
            d8080: 'Alternative web server / proxy',
            d8443: 'Alternative HTTPS port',
            d8883: 'IoT messaging encrypted',
            d9090: 'Monitoring system',
            d9200: 'Elasticsearch REST API',
            d27017: 'MongoDB database',
            d51820: 'Modern VPN protocol',
        }
    });
    const t = I18N.t;

    // --- Port Database ---
    const PORTS = [
        { port: 20, proto: 'TCP', service: 'FTP Data', cat: 'file' },
        { port: 21, proto: 'TCP', service: 'FTP', cat: 'file' },
        { port: 22, proto: 'TCP', service: 'SSH', cat: 'remote' },
        { port: 23, proto: 'TCP', service: 'Telnet', cat: 'remote' },
        { port: 25, proto: 'TCP', service: 'SMTP', cat: 'mail' },
        { port: 53, proto: 'TCP/UDP', service: 'DNS', cat: 'net' },
        { port: 67, proto: 'UDP', service: 'DHCP Server', cat: 'net' },
        { port: 68, proto: 'UDP', service: 'DHCP Client', cat: 'net' },
        { port: 69, proto: 'UDP', service: 'TFTP', cat: 'file' },
        { port: 80, proto: 'TCP', service: 'HTTP', cat: 'web' },
        { port: 88, proto: 'TCP/UDP', service: 'Kerberos', cat: 'auth' },
        { port: 110, proto: 'TCP', service: 'POP3', cat: 'mail' },
        { port: 119, proto: 'TCP', service: 'NNTP', cat: 'other' },
        { port: 123, proto: 'UDP', service: 'NTP', cat: 'net' },
        { port: 135, proto: 'TCP', service: 'MS-RPC', cat: 'remote' },
        { port: 137, proto: 'UDP', service: 'NetBIOS Name', cat: 'net' },
        { port: 138, proto: 'UDP', service: 'NetBIOS Datagram', cat: 'net' },
        { port: 139, proto: 'TCP', service: 'NetBIOS Session', cat: 'net' },
        { port: 143, proto: 'TCP', service: 'IMAP', cat: 'mail' },
        { port: 161, proto: 'UDP', service: 'SNMP', cat: 'net' },
        { port: 162, proto: 'UDP', service: 'SNMP Trap', cat: 'net' },
        { port: 179, proto: 'TCP', service: 'BGP', cat: 'net' },
        { port: 194, proto: 'TCP', service: 'IRC', cat: 'other' },
        { port: 389, proto: 'TCP/UDP', service: 'LDAP', cat: 'auth' },
        { port: 443, proto: 'TCP', service: 'HTTPS', cat: 'web' },
        { port: 445, proto: 'TCP', service: 'SMB', cat: 'file' },
        { port: 465, proto: 'TCP', service: 'SMTPS', cat: 'mail' },
        { port: 500, proto: 'UDP', service: 'IKE', cat: 'vpn' },
        { port: 514, proto: 'UDP', service: 'Syslog', cat: 'net' },
        { port: 515, proto: 'TCP', service: 'LPD', cat: 'other' },
        { port: 587, proto: 'TCP', service: 'SMTP Submission', cat: 'mail' },
        { port: 636, proto: 'TCP', service: 'LDAPS', cat: 'auth' },
        { port: 993, proto: 'TCP', service: 'IMAPS', cat: 'mail' },
        { port: 995, proto: 'TCP', service: 'POP3S', cat: 'mail' },
        { port: 1080, proto: 'TCP', service: 'SOCKS', cat: 'vpn' },
        { port: 1194, proto: 'TCP/UDP', service: 'OpenVPN', cat: 'vpn' },
        { port: 1433, proto: 'TCP', service: 'MS-SQL', cat: 'db' },
        { port: 1434, proto: 'UDP', service: 'MS-SQL Browser', cat: 'db' },
        { port: 1521, proto: 'TCP', service: 'Oracle DB', cat: 'db' },
        { port: 1723, proto: 'TCP', service: 'PPTP', cat: 'vpn' },
        { port: 1883, proto: 'TCP', service: 'MQTT', cat: 'other' },
        { port: 2049, proto: 'TCP/UDP', service: 'NFS', cat: 'file' },
        { port: 3306, proto: 'TCP', service: 'MySQL', cat: 'db' },
        { port: 3389, proto: 'TCP', service: 'RDP', cat: 'remote' },
        { port: 4500, proto: 'UDP', service: 'IPsec NAT-T', cat: 'vpn' },
        { port: 5060, proto: 'TCP/UDP', service: 'SIP', cat: 'other' },
        { port: 5432, proto: 'TCP', service: 'PostgreSQL', cat: 'db' },
        { port: 5900, proto: 'TCP', service: 'VNC', cat: 'remote' },
        { port: 5985, proto: 'TCP', service: 'WinRM HTTP', cat: 'remote' },
        { port: 5986, proto: 'TCP', service: 'WinRM HTTPS', cat: 'remote' },
        { port: 6379, proto: 'TCP', service: 'Redis', cat: 'db' },
        { port: 6443, proto: 'TCP', service: 'Kubernetes API', cat: 'web' },
        { port: 8080, proto: 'TCP', service: 'HTTP Alt', cat: 'web' },
        { port: 8443, proto: 'TCP', service: 'HTTPS Alt', cat: 'web' },
        { port: 8883, proto: 'TCP', service: 'MQTT/TLS', cat: 'other' },
        { port: 9090, proto: 'TCP', service: 'Prometheus', cat: 'web' },
        { port: 9200, proto: 'TCP', service: 'Elasticsearch', cat: 'db' },
        { port: 27017, proto: 'TCP', service: 'MongoDB', cat: 'db' },
        { port: 51820, proto: 'UDP', service: 'WireGuard', cat: 'vpn' },
    ];

    // Category keys mapped to i18n labels
    const CAT_KEYS = {
        all:    { tKey: 'port.catAll',    color: 'var(--text-dim)' },
        web:    { tKey: 'port.catWeb',    color: 'var(--accent)' },
        mail:   { tKey: 'port.catMail',   color: 'var(--green)' },
        file:   { tKey: 'port.catFile',   color: 'var(--orange)' },
        remote: { tKey: 'port.catRemote', color: 'var(--purple)' },
        net:    { tKey: 'port.catNet',    color: 'var(--accent)' },
        db:     { tKey: 'port.catDb',     color: 'var(--red)' },
        auth:   { tKey: 'port.catAuth',   color: 'var(--purple)' },
        vpn:    { tKey: 'port.catVpn',    color: 'var(--green)' },
        other:  { tKey: 'port.catOther',  color: 'var(--text-dim)' },
    };

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card port-input-card">
            <label for="port-search">${t('port.search')}</label>
            <div class="port-input-row">
                <input type="text" id="port-search" placeholder="${t('port.placeholder')}" autocomplete="off" spellcheck="false">
            </div>

            <label class="port-cat-label">${t('port.catLabel')}</label>
            <div class="port-cat-chips" id="port-cat-chips">
                ${Object.entries(CAT_KEYS).map(([key, cat]) => `
                    <span class="chip port-cat-chip${key === 'all' ? ' active' : ''}" data-cat="${key}">${t(cat.tKey)}</span>
                `).join('')}
            </div>
        </section>

        <section class="card port-result-card" id="port-result-card">
            <div class="port-result-header">
                <h3>${t('port.title')}</h3>
                <span class="port-count" id="port-count">${PORTS.length} ${t('port.ports')}</span>
            </div>
            <div class="port-list" id="port-list"></div>
        </section>
    `;

    // --- DOM References ---
    const searchInput = document.getElementById('port-search');
    const portList = document.getElementById('port-list');
    const portCount = document.getElementById('port-count');
    const catChips = container.querySelectorAll('.port-cat-chip');

    let selectedCat = 'all';

    // --- Category chip selection ---
    catChips.forEach(chip => {
        chip.addEventListener('click', () => {
            catChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedCat = chip.dataset.cat;
            renderList();
        });
    });

    // --- Get translated port description ---
    function getDesc(port) {
        return t('port.d' + port.port);
    }

    // --- Get translated category label ---
    function getCatLabel(catKey) {
        const cat = CAT_KEYS[catKey] || CAT_KEYS.other;
        return t(cat.tKey);
    }

    // --- Get category color ---
    function getCatColor(catKey) {
        return (CAT_KEYS[catKey] || CAT_KEYS.other).color;
    }

    // --- Render port list ---
    function renderList() {
        const query = searchInput.value.trim().toLowerCase();

        const filtered = PORTS.filter(p => {
            const matchesCat = selectedCat === 'all' || p.cat === selectedCat;
            if (!matchesCat) return false;
            if (!query) return true;
            const desc = getDesc(p);
            return (
                String(p.port).includes(query) ||
                p.service.toLowerCase().includes(query) ||
                p.proto.toLowerCase().includes(query) ||
                desc.toLowerCase().includes(query)
            );
        });

        portCount.textContent = `${filtered.length} ${t('port.ports')}`;

        if (filtered.length === 0) {
            portList.innerHTML = `<div class="port-empty">${t('port.noResults')}</div>`;
            return;
        }

        portList.innerHTML = filtered.map(p => {
            const color = getCatColor(p.cat);
            const label = getCatLabel(p.cat);
            const desc = getDesc(p);
            return `
                <div class="port-row">
                    <div class="port-number">${p.port}</div>
                    <div class="port-info">
                        <div class="port-service-row">
                            <span class="port-service">${p.service}</span>
                            <span class="port-proto">${p.proto}</span>
                            <span class="port-cat-badge" style="color:${color}; background:${color}15; border-color:${color}40">${label}</span>
                        </div>
                        <div class="port-desc">${desc}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- Event Listeners ---
    searchInput.addEventListener('input', renderList);

    // Initial render
    renderList();
}

function teardown_port_referenz() {
    // No cleanup needed
}
