// === WHOIS Lookup Tool ===

let _whoisAbortController = null;

function init_whois_lookup(container) {
    // --- HTML Template ---
    container.innerHTML = `
        <section class="card whois-input-card">
            <label for="whois-domain">Domain oder IP-Adresse</label>
            <div class="whois-input-row">
                <input type="text" id="whois-domain" placeholder="example.com" autocomplete="off" spellcheck="false">
                <button class="whois-search-btn" id="whois-search-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>
            <div class="quick-examples whois-examples">
                <span class="chip" data-domain="google.com">Google</span>
                <span class="chip" data-domain="github.com">GitHub</span>
                <span class="chip" data-domain="cloudflare.com">Cloudflare</span>
                <span class="chip" data-domain="wikipedia.org">Wikipedia</span>
            </div>
        </section>

        <section class="card whois-loading" id="whois-loading" style="display:none;">
            <div class="whois-spinner-row">
                <span class="whois-spinner"></span>
                <span>WHOIS-Daten werden abgefragt...</span>
            </div>
        </section>

        <section class="card whois-result-card" id="whois-result-card" style="display:none;">
            <div class="whois-result-header">
                <h3 id="whois-result-domain"></h3>
            </div>
            <div id="whois-results-container"></div>
        </section>

        <section class="card error-card" id="whois-error-card" style="display:none;">
            <p id="whois-error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const domainInput = document.getElementById('whois-domain');
    const searchBtn = document.getElementById('whois-search-btn');
    const loadingCard = document.getElementById('whois-loading');
    const resultCard = document.getElementById('whois-result-card');
    const errorCard = document.getElementById('whois-error-card');
    const errorMsg = document.getElementById('whois-error-msg');
    const resultsContainer = document.getElementById('whois-results-container');

    // CORS-verified RDAP servers (direct access without proxy)
    const RDAP_CORS_SERVERS = {
        'ch': 'https://rdap.nic.ch/domain/',
        'li': 'https://rdap.nic.ch/domain/',
        'nl': 'https://rdap.sidn.nl/domain/',
        'fr': 'https://rdap.nic.fr/domain/',
    };

    // Known ccTLD RDAP servers (many NOT in IANA Bootstrap!)
    // These need CORS proxy since they don't send Access-Control-Allow-Origin
    const CCTLD_RDAP_SERVERS = {
        'de': 'https://rdap.denic.de/domain/',
        'at': 'https://rdap.nic.at/domain/',
        'be': 'https://rdap.dns.be/domain/',
        'eu': 'https://rdap.eu/domain/',
        'it': 'https://rdap.nic.it/domain/',
        'uk': 'https://rdap.nominet.uk/uk/domain/',
        'se': 'https://rdap.iis.se/domain/',
        'no': 'https://rdap.norid.no/domain/',
        'dk': 'https://rdap.dk-hostmaster.dk/domain/',
        'fi': 'https://rdap.fi/domain/',
        'pl': 'https://rdap.dns.pl/domain/',
        'cz': 'https://rdap.nic.cz/domain/',
        'br': 'https://rdap.registro.br/domain/',
        'jp': 'https://rdap.jprs.jp/domain/',
        'kr': 'https://rdap.kisa.or.kr/domain/',
        'cn': 'https://rdap.cnnic.cn/domain/',
        'za': 'https://rdap.registry.net.za/domain/',
        'nz': 'https://rdap.nzrs.net.nz/domain/',
        'au': 'https://rdap.cctld.au/rdap/domain/',
    };

    // CORS proxy for RDAP servers that block browser requests
    const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';

    // --- WHOIS via RDAP ---
    // Strategy: CORS-verified → rdap.org → CORS-proxy + known ccTLD server
    async function queryRDAP(domain) {
        const signal = _whoisAbortController ? _whoisAbortController.signal : undefined;
        const parts = domain.split('.');
        const tld = parts[parts.length - 1];

        // 1. Try CORS-verified TLD-specific server (no proxy needed)
        if (RDAP_CORS_SERVERS[tld]) {
            try {
                const res = await fetch(RDAP_CORS_SERVERS[tld] + domain, { signal });
                if (res.ok) return res.json();
            } catch (e) {
                if (e.name === 'AbortError') throw e;
            }
        }

        // 2. Try rdap.org (has CORS, works for .com/.net/.org/many gTLDs)
        try {
            const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { signal });
            if (res.ok) return res.json();
        } catch (e) {
            if (e.name === 'AbortError') throw e;
        }

        // 3. Fallback: Known ccTLD server via CORS proxy
        const ccServer = CCTLD_RDAP_SERVERS[tld];
        if (ccServer) {
            try {
                const nativeUrl = ccServer + domain;
                const proxyUrl = CORS_PROXY + encodeURIComponent(nativeUrl);
                const res = await fetch(proxyUrl, { signal });
                if (res.ok) {
                    const data = await res.json();
                    if (data.Error || data.error) throw new Error(data.Error || data.error);
                    return data;
                }
            } catch (e) {
                if (e.name === 'AbortError') throw e;
                throw new Error(`PROXY_FAILED:${tld}`);
            }
        }

        throw new Error(`UNSUPPORTED:${tld}`);
    }

    // --- DNS Resolution via Google DNS-over-HTTPS ---
    async function queryDNS(domain) {
        const signal = _whoisAbortController ? _whoisAbortController.signal : undefined;
        const result = { ipv4: [], ipv6: [] };

        // Parallel A + AAAA queries
        const [aRes, aaaaRes] = await Promise.allSettled([
            fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, { signal }),
            fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=AAAA`, { signal })
        ]);

        // Parse A records (IPv4)
        if (aRes.status === 'fulfilled' && aRes.value.ok) {
            try {
                const data = await aRes.value.json();
                if (data.Answer) {
                    result.ipv4 = data.Answer
                        .filter(a => a.type === 1)
                        .map(a => a.data);
                }
            } catch (e) { /* ignore parse errors */ }
        }

        // Parse AAAA records (IPv6)
        if (aaaaRes.status === 'fulfilled' && aaaaRes.value.ok) {
            try {
                const data = await aaaaRes.value.json();
                if (data.Answer) {
                    result.ipv6 = data.Answer
                        .filter(a => a.type === 28)
                        .map(a => a.data);
                }
            } catch (e) { /* ignore parse errors */ }
        }

        return result;
    }

    // --- IP Geolocation + ASN via ipwho.is ---
    // Free, HTTPS, CORS enabled, no API key needed
    async function queryIPInfo(ip) {
        const signal = _whoisAbortController ? _whoisAbortController.signal : undefined;
        try {
            const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    // Normalize to common format
                    return {
                        country: data.country || '',
                        regionName: data.region || '',
                        city: data.city || '',
                        isp: data.connection ? data.connection.isp : '',
                        org: data.connection ? data.connection.org : '',
                        as: data.connection ? `AS${data.connection.asn} ${data.connection.org}` : '',
                        asn: data.connection ? `AS${data.connection.asn}` : '',
                        domain: data.connection ? data.connection.domain : '',
                    };
                }
            }
        } catch (e) {
            if (e.name === 'AbortError') throw e;
        }
        return null;
    }

    // --- Parse RDAP response ---
    function parseRDAP(data) {
        const result = {};

        // Domain name
        result.domain = data.ldhName || data.name || '—';

        // Status
        if (data.status && data.status.length > 0) {
            result.status = data.status.map(s => s.replace(/ /g, '')).join(', ');
        }

        // Events (registration, expiration, last update)
        if (data.events) {
            data.events.forEach(e => {
                const date = e.eventDate ? new Date(e.eventDate) : null;
                const formatted = date ? date.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';
                switch (e.eventAction) {
                    case 'registration': result.registered = formatted; break;
                    case 'expiration': result.expires = formatted; break;
                    case 'last changed': result.updated = formatted; break;
                    case 'last update of RDAP database': result.rdapUpdated = formatted; break;
                }
            });
        }

        // Nameservers
        if (data.nameservers && data.nameservers.length > 0) {
            result.nameservers = data.nameservers.map(ns => ns.ldhName || ns.name).filter(Boolean);
        }

        // Entities (registrar, registrant, etc.)
        if (data.entities) {
            data.entities.forEach(entity => {
                const roles = entity.roles || [];

                if (roles.includes('registrar')) {
                    // Registrar info
                    if (entity.vcardArray && entity.vcardArray[1]) {
                        const vcard = entity.vcardArray[1];
                        const fnEntry = vcard.find(v => v[0] === 'fn');
                        if (fnEntry) result.registrar = fnEntry[3];
                    }
                    // IANA ID
                    if (entity.publicIds) {
                        const iana = entity.publicIds.find(p => p.type === 'IANA Registrar ID');
                        if (iana) result.ianaId = iana.identifier;
                    }
                    // Abuse contact
                    if (entity.entities) {
                        entity.entities.forEach(sub => {
                            if (sub.roles && sub.roles.includes('abuse') && sub.vcardArray && sub.vcardArray[1]) {
                                const vcard = sub.vcardArray[1];
                                const emailEntry = vcard.find(v => v[0] === 'email');
                                const telEntry = vcard.find(v => v[0] === 'tel');
                                if (emailEntry) result.abuseEmail = emailEntry[3];
                                if (telEntry) result.abusePhone = telEntry[3];
                            }
                        });
                    }
                }

                if (roles.includes('registrant')) {
                    if (entity.vcardArray && entity.vcardArray[1]) {
                        const vcard = entity.vcardArray[1];
                        const fnEntry = vcard.find(v => v[0] === 'fn');
                        const orgEntry = vcard.find(v => v[0] === 'org');
                        if (fnEntry && fnEntry[3]) result.registrant = fnEntry[3];
                        if (orgEntry && orgEntry[3]) result.registrantOrg = orgEntry[3];
                    }
                }
            });
        }

        // DNSSEC
        if (data.secureDNS) {
            result.dnssec = data.secureDNS.delegationSigned ? 'Ja (signiert)' : 'Nein';
        }

        return result;
    }

    // --- Render Results ---
    function renderResults(info, dnsInfo, ipInfo) {
        const sections = [];

        // === IP Address section (NEW) ===
        if (dnsInfo && (dnsInfo.ipv4.length > 0 || dnsInfo.ipv6.length > 0)) {
            const ipFields = [];
            dnsInfo.ipv4.forEach(ip => {
                ipFields.push({ label: 'IPv4', value: ip });
            });
            dnsInfo.ipv6.forEach(ip => {
                ipFields.push({ label: 'IPv6', value: ip });
            });
            sections.push(renderSection('IP-Adressen', '#2dd4bf', ipFields));
        }

        // === Hosting / Location section (NEW) ===
        if (ipInfo) {
            const hostFields = [];
            if (ipInfo.isp) hostFields.push({ label: 'ISP', value: ipInfo.isp });
            if (ipInfo.org && ipInfo.org !== ipInfo.isp) hostFields.push({ label: 'Organisation', value: ipInfo.org });
            if (ipInfo.as) hostFields.push({ label: 'ASN', value: ipInfo.as });
            // Location
            const locParts = [];
            if (ipInfo.city) locParts.push(ipInfo.city);
            if (ipInfo.regionName) locParts.push(ipInfo.regionName);
            if (ipInfo.country) locParts.push(ipInfo.country);
            if (locParts.length > 0) {
                hostFields.push({ label: 'Standort', value: locParts.join(', ') });
            }
            if (ipInfo.domain) hostFields.push({ label: 'Domain', value: ipInfo.domain });
            if (hostFields.length > 0) {
                sections.push(renderSection('Hosting & Standort', 'var(--red)', hostFields));
            }
        }

        // Registration section
        const regFields = [];
        if (info.registered) regFields.push({ label: 'Registriert', value: info.registered });
        if (info.expires) regFields.push({ label: 'Läuft ab', value: info.expires });
        if (info.updated) regFields.push({ label: 'Zuletzt geändert', value: info.updated });
        if (info.status) regFields.push({ label: 'Status', value: info.status });
        if (info.dnssec) regFields.push({ label: 'DNSSEC', value: info.dnssec });

        if (regFields.length > 0) {
            sections.push(renderSection('Registrierung', 'var(--accent)', regFields));
        }

        // Registrar section
        const regrarFields = [];
        if (info.registrar) regrarFields.push({ label: 'Registrar', value: info.registrar });
        if (info.ianaId) regrarFields.push({ label: 'IANA ID', value: info.ianaId });
        if (info.abuseEmail) regrarFields.push({ label: 'Abuse E-Mail', value: info.abuseEmail });
        if (info.abusePhone) regrarFields.push({ label: 'Abuse Telefon', value: info.abusePhone });

        if (regrarFields.length > 0) {
            sections.push(renderSection('Registrar', 'var(--green)', regrarFields));
        }

        // Registrant section
        const registrantFields = [];
        if (info.registrant) registrantFields.push({ label: 'Name', value: info.registrant });
        if (info.registrantOrg) registrantFields.push({ label: 'Organisation', value: info.registrantOrg });

        if (registrantFields.length > 0) {
            sections.push(renderSection('Registrant', 'var(--purple)', registrantFields));
        }

        // Nameservers
        if (info.nameservers && info.nameservers.length > 0) {
            sections.push(renderSection('Nameserver', 'var(--orange)',
                info.nameservers.map(ns => ({ label: 'NS', value: ns }))
            ));
        }

        resultsContainer.innerHTML = sections.join('');
    }

    function renderSection(title, color, fields) {
        const rows = fields.map(f => `
            <div class="whois-field">
                <span class="whois-field-label">${f.label}</span>
                <span class="whois-field-value">${f.value}</span>
            </div>
        `).join('');

        return `
            <div class="whois-section">
                <div class="whois-section-header">
                    <span class="whois-section-badge" style="color:${color}; background:${color}15; border-color:${color}40">${title}</span>
                </div>
                ${rows}
            </div>
        `;
    }

    // --- Main Lookup ---
    async function lookup() {
        let domain = domainInput.value.trim().toLowerCase();
        if (!domain) return;

        // Strip protocol and paths
        domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
        domainInput.value = domain;

        if (!domain.includes('.') || domain.length < 3) {
            showError('Bitte gib eine gültige Domain ein (z.B. google.com)');
            return;
        }

        // Abort previous
        if (_whoisAbortController) _whoisAbortController.abort();
        _whoisAbortController = new AbortController();

        loadingCard.style.display = 'block';
        resultCard.style.display = 'none';
        errorCard.style.display = 'none';

        try {
            // Run RDAP + DNS queries in parallel
            const [rdapData, dnsInfo] = await Promise.allSettled([
                queryRDAP(domain),
                queryDNS(domain)
            ]);

            // Check if aborted
            if (_whoisAbortController && _whoisAbortController.signal.aborted) return;

            // RDAP must succeed
            if (rdapData.status === 'rejected') {
                throw rdapData.reason;
            }

            const info = parseRDAP(rdapData.value);
            const dns = dnsInfo.status === 'fulfilled' ? dnsInfo.value : { ipv4: [], ipv6: [] };

            // Show initial results immediately (without IP info)
            document.getElementById('whois-result-domain').textContent = domain;
            loadingCard.style.display = 'none';
            renderResults(info, dns, null);
            resultCard.style.display = 'block';

            // Now fetch IP geolocation (if we have an IPv4 address)
            if (dns.ipv4.length > 0) {
                try {
                    const ipInfo = await queryIPInfo(dns.ipv4[0]);
                    // Re-render with IP info added
                    if (ipInfo && !(_whoisAbortController && _whoisAbortController.signal.aborted)) {
                        renderResults(info, dns, ipInfo);
                    }
                } catch (e) {
                    // IP info is optional, don't break on failure
                }
            }

        } catch (err) {
            if (err.name === 'AbortError') return;
            loadingCard.style.display = 'none';
            if (err.message && err.message.startsWith('UNSUPPORTED:')) {
                const tld = err.message.split(':')[1];
                showError(`Für .${tld}-Domains konnte kein RDAP-Server gefunden werden. Versuche einen externen Dienst wie whois.domaintools.com.`);
            } else if (err.message && err.message.startsWith('PROXY_FAILED:')) {
                const tld = err.message.split(':')[1];
                showError(`Die Abfrage für .${tld}-Domains ist fehlgeschlagen. Der CORS-Proxy ist möglicherweise überlastet — bitte später erneut versuchen.`);
            } else if (err.message && (err.message.includes('404') || err.message.includes('400'))) {
                showError(`Keine WHOIS-Daten für "${domain}" gefunden. Die Domain existiert möglicherweise nicht.`);
            } else if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
                showError(`RDAP-Server nicht erreichbar für "${domain}". Bitte prüfe deine Internetverbindung.`);
            } else {
                showError(`Fehler bei der Abfrage: ${err.message || err}`);
            }
        }
    }

    function showError(msg) {
        resultCard.style.display = 'none';
        loadingCard.style.display = 'none';
        errorMsg.textContent = msg;
        errorCard.style.display = 'block';
    }

    // --- Event Listeners ---
    searchBtn.addEventListener('click', lookup);

    domainInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            lookup();
        }
    });

    container.querySelectorAll('.whois-examples .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            domainInput.value = chip.dataset.domain;
            lookup();
        });
    });
}

function teardown_whois_lookup() {
    if (_whoisAbortController) {
        _whoisAbortController.abort();
        _whoisAbortController = null;
    }
}
