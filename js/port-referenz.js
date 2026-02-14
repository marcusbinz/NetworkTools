// === Port-Referenz Tool ===

function init_port_referenz(container) {
    // --- Port Database ---
    const PORTS = [
        { port: 20, proto: 'TCP', service: 'FTP Data', desc: 'Dateiübertragung (Datenkanal)', cat: 'file' },
        { port: 21, proto: 'TCP', service: 'FTP', desc: 'Dateiübertragung (Steuerung)', cat: 'file' },
        { port: 22, proto: 'TCP', service: 'SSH', desc: 'Secure Shell — verschlüsselte Fernwartung', cat: 'remote' },
        { port: 23, proto: 'TCP', service: 'Telnet', desc: 'Unverschlüsselte Fernwartung (unsicher!)', cat: 'remote' },
        { port: 25, proto: 'TCP', service: 'SMTP', desc: 'E-Mail-Versand (Server-zu-Server)', cat: 'mail' },
        { port: 53, proto: 'TCP/UDP', service: 'DNS', desc: 'Domain Name System — Namensauflösung', cat: 'net' },
        { port: 67, proto: 'UDP', service: 'DHCP Server', desc: 'Dynamische IP-Adressvergabe (Server)', cat: 'net' },
        { port: 68, proto: 'UDP', service: 'DHCP Client', desc: 'Dynamische IP-Adressvergabe (Client)', cat: 'net' },
        { port: 69, proto: 'UDP', service: 'TFTP', desc: 'Trivial File Transfer — einfache Dateiübertragung', cat: 'file' },
        { port: 80, proto: 'TCP', service: 'HTTP', desc: 'Webserver — unverschlüsseltes Web', cat: 'web' },
        { port: 88, proto: 'TCP/UDP', service: 'Kerberos', desc: 'Netzwerk-Authentifizierung (Active Directory)', cat: 'auth' },
        { port: 110, proto: 'TCP', service: 'POP3', desc: 'E-Mail-Abruf (veraltet, unsicher)', cat: 'mail' },
        { port: 119, proto: 'TCP', service: 'NNTP', desc: 'Usenet-Newsgruppen', cat: 'other' },
        { port: 123, proto: 'UDP', service: 'NTP', desc: 'Zeitsynchronisation', cat: 'net' },
        { port: 135, proto: 'TCP', service: 'MS-RPC', desc: 'Microsoft Remote Procedure Call', cat: 'remote' },
        { port: 137, proto: 'UDP', service: 'NetBIOS Name', desc: 'Windows-Netzwerk Namensauflösung', cat: 'net' },
        { port: 138, proto: 'UDP', service: 'NetBIOS Datagram', desc: 'Windows-Netzwerk Datagramme', cat: 'net' },
        { port: 139, proto: 'TCP', service: 'NetBIOS Session', desc: 'Windows-Netzwerk Sitzungen / SMBv1', cat: 'net' },
        { port: 143, proto: 'TCP', service: 'IMAP', desc: 'E-Mail-Abruf mit Ordner-Sync', cat: 'mail' },
        { port: 161, proto: 'UDP', service: 'SNMP', desc: 'Netzwerk-Management und Monitoring', cat: 'net' },
        { port: 162, proto: 'UDP', service: 'SNMP Trap', desc: 'SNMP-Benachrichtigungen', cat: 'net' },
        { port: 179, proto: 'TCP', service: 'BGP', desc: 'Border Gateway Protocol — Internet-Routing', cat: 'net' },
        { port: 194, proto: 'TCP', service: 'IRC', desc: 'Internet Relay Chat', cat: 'other' },
        { port: 389, proto: 'TCP/UDP', service: 'LDAP', desc: 'Verzeichnisdienst (Active Directory)', cat: 'auth' },
        { port: 443, proto: 'TCP', service: 'HTTPS', desc: 'Webserver — verschlüsseltes Web (TLS/SSL)', cat: 'web' },
        { port: 445, proto: 'TCP', service: 'SMB', desc: 'Windows-Dateifreigabe / Netzlaufwerke', cat: 'file' },
        { port: 465, proto: 'TCP', service: 'SMTPS', desc: 'E-Mail-Versand verschlüsselt (veraltet)', cat: 'mail' },
        { port: 500, proto: 'UDP', service: 'IKE', desc: 'IPsec VPN Schlüsselaustausch', cat: 'vpn' },
        { port: 514, proto: 'UDP', service: 'Syslog', desc: 'System-Logging über Netzwerk', cat: 'net' },
        { port: 515, proto: 'TCP', service: 'LPD', desc: 'Netzwerk-Druckdienst', cat: 'other' },
        { port: 587, proto: 'TCP', service: 'SMTP Submission', desc: 'E-Mail-Versand (Client → Server, STARTTLS)', cat: 'mail' },
        { port: 636, proto: 'TCP', service: 'LDAPS', desc: 'LDAP über TLS/SSL', cat: 'auth' },
        { port: 993, proto: 'TCP', service: 'IMAPS', desc: 'E-Mail-Abruf verschlüsselt (IMAP über TLS)', cat: 'mail' },
        { port: 995, proto: 'TCP', service: 'POP3S', desc: 'E-Mail-Abruf verschlüsselt (POP3 über TLS)', cat: 'mail' },
        { port: 1080, proto: 'TCP', service: 'SOCKS', desc: 'SOCKS Proxy', cat: 'vpn' },
        { port: 1194, proto: 'TCP/UDP', service: 'OpenVPN', desc: 'OpenVPN Tunnel', cat: 'vpn' },
        { port: 1433, proto: 'TCP', service: 'MS-SQL', desc: 'Microsoft SQL Server', cat: 'db' },
        { port: 1434, proto: 'UDP', service: 'MS-SQL Browser', desc: 'SQL Server Discovery', cat: 'db' },
        { port: 1521, proto: 'TCP', service: 'Oracle DB', desc: 'Oracle Datenbank', cat: 'db' },
        { port: 1723, proto: 'TCP', service: 'PPTP', desc: 'Point-to-Point Tunneling VPN', cat: 'vpn' },
        { port: 1883, proto: 'TCP', service: 'MQTT', desc: 'IoT Messaging Protokoll', cat: 'other' },
        { port: 2049, proto: 'TCP/UDP', service: 'NFS', desc: 'Network File System (Unix/Linux)', cat: 'file' },
        { port: 3306, proto: 'TCP', service: 'MySQL', desc: 'MySQL / MariaDB Datenbank', cat: 'db' },
        { port: 3389, proto: 'TCP', service: 'RDP', desc: 'Remote Desktop (Windows-Fernsteuerung)', cat: 'remote' },
        { port: 4500, proto: 'UDP', service: 'IPsec NAT-T', desc: 'IPsec VPN hinter NAT', cat: 'vpn' },
        { port: 5060, proto: 'TCP/UDP', service: 'SIP', desc: 'VoIP Signalisierung', cat: 'other' },
        { port: 5432, proto: 'TCP', service: 'PostgreSQL', desc: 'PostgreSQL Datenbank', cat: 'db' },
        { port: 5900, proto: 'TCP', service: 'VNC', desc: 'Virtual Network Computing — Fernsteuerung', cat: 'remote' },
        { port: 5985, proto: 'TCP', service: 'WinRM HTTP', desc: 'Windows Remote Management', cat: 'remote' },
        { port: 5986, proto: 'TCP', service: 'WinRM HTTPS', desc: 'Windows Remote Management (TLS)', cat: 'remote' },
        { port: 6379, proto: 'TCP', service: 'Redis', desc: 'Redis In-Memory Datenbank', cat: 'db' },
        { port: 6443, proto: 'TCP', service: 'Kubernetes API', desc: 'Kubernetes API Server', cat: 'web' },
        { port: 8080, proto: 'TCP', service: 'HTTP Alt', desc: 'Alternativer Webserver / Proxy', cat: 'web' },
        { port: 8443, proto: 'TCP', service: 'HTTPS Alt', desc: 'Alternativer HTTPS-Port', cat: 'web' },
        { port: 8883, proto: 'TCP', service: 'MQTT/TLS', desc: 'IoT Messaging verschlüsselt', cat: 'other' },
        { port: 9090, proto: 'TCP', service: 'Prometheus', desc: 'Monitoring System', cat: 'web' },
        { port: 9200, proto: 'TCP', service: 'Elasticsearch', desc: 'Elasticsearch REST API', cat: 'db' },
        { port: 27017, proto: 'TCP', service: 'MongoDB', desc: 'MongoDB Datenbank', cat: 'db' },
        { port: 51820, proto: 'UDP', service: 'WireGuard', desc: 'Modernes VPN-Protokoll', cat: 'vpn' },
    ];

    const CATEGORIES = {
        all: { label: 'Alle', color: 'var(--text-dim)' },
        web: { label: 'Web', color: 'var(--accent)' },
        mail: { label: 'E-Mail', color: 'var(--green)' },
        file: { label: 'Dateien', color: 'var(--orange)' },
        remote: { label: 'Remote', color: 'var(--purple)' },
        net: { label: 'Netzwerk', color: 'var(--accent)' },
        db: { label: 'Datenbank', color: 'var(--red)' },
        auth: { label: 'Auth', color: 'var(--purple)' },
        vpn: { label: 'VPN', color: 'var(--green)' },
        other: { label: 'Sonstige', color: 'var(--text-dim)' },
    };

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card port-input-card">
            <label for="port-search">Suche (Port-Nr., Service oder Beschreibung)</label>
            <div class="port-input-row">
                <input type="text" id="port-search" placeholder="z.B. 443, SSH, Datenbank..." autocomplete="off" spellcheck="false">
            </div>

            <label class="port-cat-label">Kategorie</label>
            <div class="port-cat-chips" id="port-cat-chips">
                ${Object.entries(CATEGORIES).map(([key, cat]) => `
                    <span class="chip port-cat-chip${key === 'all' ? ' active' : ''}" data-cat="${key}">${cat.label}</span>
                `).join('')}
            </div>
        </section>

        <section class="card port-result-card" id="port-result-card">
            <div class="port-result-header">
                <h3>Port-Referenz</h3>
                <span class="port-count" id="port-count">${PORTS.length} Ports</span>
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

    // --- Render port list ---
    function renderList() {
        const query = searchInput.value.trim().toLowerCase();

        const filtered = PORTS.filter(p => {
            const matchesCat = selectedCat === 'all' || p.cat === selectedCat;
            if (!matchesCat) return false;
            if (!query) return true;
            return (
                String(p.port).includes(query) ||
                p.service.toLowerCase().includes(query) ||
                p.proto.toLowerCase().includes(query) ||
                p.desc.toLowerCase().includes(query)
            );
        });

        portCount.textContent = `${filtered.length} Port${filtered.length !== 1 ? 's' : ''}`;

        if (filtered.length === 0) {
            portList.innerHTML = `<div class="port-empty">Keine Ports gefunden</div>`;
            return;
        }

        portList.innerHTML = filtered.map(p => {
            const cat = CATEGORIES[p.cat] || CATEGORIES.other;
            return `
                <div class="port-row">
                    <div class="port-number">${p.port}</div>
                    <div class="port-info">
                        <div class="port-service-row">
                            <span class="port-service">${p.service}</span>
                            <span class="port-proto">${p.proto}</span>
                            <span class="port-cat-badge" style="color:${cat.color}; background:${cat.color}15; border-color:${cat.color}40">${cat.label}</span>
                        </div>
                        <div class="port-desc">${p.desc}</div>
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
