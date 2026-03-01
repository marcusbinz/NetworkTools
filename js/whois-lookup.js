// === WHOIS Lookup Tool ===

let _whoisAbortController = null;

function init_whois_lookup(container) {
    // --- i18n Strings ---
    I18N.register('whois', {
        de: {
            'label':        'Domain oder IP-Adresse',
            'examples':     'Beispiele',
            'loading':      'WHOIS-Daten werden abgefragt...',
            'invalidDomain':'Bitte gib eine g\u00fcltige Domain ein (z.B. google.com)',
            'queryError':   'Fehler bei der Abfrage: {msg}',
            'errUnsupported':'F\u00fcr .{tld}-Domains konnte kein RDAP-Server gefunden werden. Versuche einen externen Dienst wie whois.domaintools.com.',
            'errProxy':     'Die Abfrage f\u00fcr .{tld}-Domains ist fehlgeschlagen. Der CORS-Proxy ist m\u00f6glicherweise \u00fcberlastet \u2014 bitte sp\u00e4ter erneut versuchen.',
            'errNotFound':  'Keine WHOIS-Daten f\u00fcr "{domain}" gefunden. Die Domain existiert m\u00f6glicherweise nicht.',
            'errNetwork':   'RDAP-Server nicht erreichbar f\u00fcr "{domain}". Bitte pr\u00fcfe deine Internetverbindung.',
            // Section titles
            'secIp':        'IP-Adressen',
            'secHosting':   'Hosting & Standort',
            'secReg':       'Registrierung',
            'secRegistrar': 'Registrar',
            'secRegistrant':'Registrant',
            'secNs':        'Nameserver',
            // Field labels
            'ispHoster':    'ISP / Hoster',
            'org':          'Organisation',
            'network':      'Netzwerk',
            'location':     'Standort',
            'domain':       'Domain',
            'registered':   'Registriert',
            'expires':      'L\u00e4uft ab',
            'lastChanged':  'Zuletzt ge\u00e4ndert',
            'status':       'Status',
            'dnssec':       'DNSSEC',
            'dnssecYes':    'Ja (signiert)',
            'dnssecNo':     'Nein',
            'registrar':    'Registrar',
            'ianaId':       'IANA ID',
            'abuseEmail':   'Abuse E-Mail',
            'abusePhone':   'Abuse Telefon',
            'name':         'Name',
        },
        en: {
            'label':        'Domain or IP address',
            'examples':     'Examples',
            'loading':      'Querying WHOIS data...',
            'invalidDomain':'Please enter a valid domain (e.g. google.com)',
            'queryError':   'Query error: {msg}',
            'errUnsupported':'No RDAP server found for .{tld} domains. Try an external service like whois.domaintools.com.',
            'errProxy':     'Query failed for .{tld} domains. The CORS proxy may be overloaded \u2014 please try again later.',
            'errNotFound':  'No WHOIS data found for "{domain}". The domain may not exist.',
            'errNetwork':   'RDAP server unreachable for "{domain}". Please check your internet connection.',
            'secIp':        'IP Addresses',
            'secHosting':   'Hosting & Location',
            'secReg':       'Registration',
            'secRegistrar': 'Registrar',
            'secRegistrant':'Registrant',
            'secNs':        'Nameservers',
            'ispHoster':    'ISP / Hoster',
            'org':          'Organization',
            'network':      'Network',
            'location':     'Location',
            'domain':       'Domain',
            'registered':   'Registered',
            'expires':      'Expires',
            'lastChanged':  'Last Changed',
            'status':       'Status',
            'dnssec':       'DNSSEC',
            'dnssecYes':    'Yes (signed)',
            'dnssecNo':     'No',
            'registrar':    'Registrar',
            'ianaId':       'IANA ID',
            'abuseEmail':   'Abuse Email',
            'abusePhone':   'Abuse Phone',
            'name':         'Name',
        }
    });

    const loc = I18N.getLang() === 'de' ? 'de-DE' : 'en-US';

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card whois-input-card">
            <label for="whois-domain">${t('whois.label')}</label>
            <div class="whois-input-row">
                <input type="text" id="whois-domain" placeholder="example.com" autocomplete="off" spellcheck="false">
                <button class="whois-search-btn" id="whois-search-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>
            <label class="quick-examples-label">${t('whois.examples')}</label>
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
                <span>${t('whois.loading')}</span>
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

    const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';

    // --- WHOIS via RDAP ---
    async function queryRDAP(domain) {
        const signal = _whoisAbortController ? _whoisAbortController.signal : undefined;
        const parts = domain.split('.');
        const tld = parts[parts.length - 1];

        if (RDAP_CORS_SERVERS[tld]) {
            try {
                const res = await fetch(RDAP_CORS_SERVERS[tld] + encodeURIComponent(domain), { signal });
                if (res.ok) return res.json();
            } catch (e) {
                if (e.name === 'AbortError') throw e;
            }
        }

        try {
            const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { signal });
            if (res.ok) return res.json();
        } catch (e) {
            if (e.name === 'AbortError') throw e;
        }

        const ccServer = CCTLD_RDAP_SERVERS[tld];
        if (ccServer) {
            try {
                const nativeUrl = ccServer + encodeURIComponent(domain);
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

        const [aRes, aaaaRes] = await Promise.allSettled([
            fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, { signal }),
            fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=AAAA`, { signal })
        ]);

        if (aRes.status === 'fulfilled' && aRes.value.ok) {
            try {
                const data = await aRes.value.json();
                if (data.Answer) {
                    result.ipv4 = data.Answer.filter(a => a.type === 1).map(a => a.data);
                }
            } catch (e) { /* ignore parse errors */ }
        }

        if (aaaaRes.status === 'fulfilled' && aaaaRes.value.ok) {
            try {
                const data = await aaaaRes.value.json();
                if (data.Answer) {
                    result.ipv6 = data.Answer.filter(a => a.type === 28).map(a => a.data);
                }
            } catch (e) { /* ignore parse errors */ }
        }

        return result;
    }

    // --- IP Info: ASN via RIPE Stat + Geo via ipwho.is ---
    async function queryIPInfo(ip) {
        const signal = _whoisAbortController ? _whoisAbortController.signal : undefined;
        const result = { country: '', regionName: '', city: '', isp: '', org: '', as: '', domain: '', netname: '' };

        try {
            const [prefixRes, whoisRes] = await Promise.allSettled([
                fetch(`https://stat.ripe.net/data/prefix-overview/data.json?resource=${encodeURIComponent(ip)}`, { signal }),
                fetch(`https://stat.ripe.net/data/whois/data.json?resource=${encodeURIComponent(ip)}`, { signal })
            ]);

            if (prefixRes.status === 'fulfilled' && prefixRes.value.ok) {
                const pData = await prefixRes.value.json();
                if (pData.data && pData.data.asns && pData.data.asns.length > 0) {
                    const asn = pData.data.asns[0];
                    result.as = `AS${asn.asn} ${asn.holder || ''}`.trim();
                    result.isp = asn.holder || '';
                }
            }

            if (whoisRes.status === 'fulfilled' && whoisRes.value.ok) {
                const wData = await whoisRes.value.json();
                if (wData.data && wData.data.records) {
                    const firstRecord = wData.data.records[0] || [];
                    firstRecord.forEach(entry => {
                        if (entry.key === 'netname') result.netname = entry.value;
                        if (entry.key === 'country') result.country = entry.value;
                        if (entry.key === 'descr' && !result.org) result.org = entry.value;
                    });
                    if (wData.data.records.length > 1) {
                        const orgRecord = wData.data.records.find(rec =>
                            rec.some(e => e.key === 'organisation' || e.key === 'org-name')
                        );
                        if (orgRecord) {
                            const orgName = orgRecord.find(e => e.key === 'org-name');
                            if (orgName) result.org = orgName.value;
                            const orgCountry = orgRecord.find(e => e.key === 'country');
                            if (orgCountry && !result.country) result.country = orgCountry.value;
                        }
                    }
                }
            }
        } catch (e) {
            if (e.name === 'AbortError') throw e;
            console.warn('WHOIS: RIPE Stat failed:', e.message);
        }

        try {
            const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    result.city = data.city || '';
                    result.regionName = data.region || '';
                    result.country = data.country || result.country;
                    if (data.connection) {
                        result.domain = data.connection.domain || '';
                        if (!result.isp) result.isp = data.connection.isp || '';
                        if (!result.as) result.as = `AS${data.connection.asn} ${data.connection.org || ''}`.trim();
                    }
                }
            }
        } catch (e) {
            if (e.name === 'AbortError') throw e;
            console.warn('WHOIS: ipwho.is geo failed (optional):', e.message);
        }

        if (!result.as && !result.isp && !result.country) return null;
        return result;
    }

    // --- Parse RDAP response ---
    function parseRDAP(data) {
        const result = {};

        result.domain = data.ldhName || data.name || '\u2014';

        if (data.status && data.status.length > 0) {
            result.status = data.status.map(s => s.replace(/ /g, '')).join(', ');
        }

        if (data.events) {
            data.events.forEach(e => {
                const date = e.eventDate ? new Date(e.eventDate) : null;
                const formatted = date ? date.toLocaleDateString(loc, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '\u2014';
                switch (e.eventAction) {
                    case 'registration': result.registered = formatted; break;
                    case 'expiration': result.expires = formatted; break;
                    case 'last changed': result.updated = formatted; break;
                    case 'last update of RDAP database': result.rdapUpdated = formatted; break;
                }
            });
        }

        if (data.nameservers && data.nameservers.length > 0) {
            result.nameservers = data.nameservers.map(ns => ns.ldhName || ns.name).filter(Boolean);
        }

        if (data.entities) {
            data.entities.forEach(entity => {
                const roles = entity.roles || [];

                if (roles.includes('registrar')) {
                    if (entity.vcardArray && entity.vcardArray[1]) {
                        const vcard = entity.vcardArray[1];
                        const fnEntry = vcard.find(v => v[0] === 'fn');
                        if (fnEntry) result.registrar = fnEntry[3];
                    }
                    if (entity.publicIds) {
                        const iana = entity.publicIds.find(p => p.type === 'IANA Registrar ID');
                        if (iana) result.ianaId = iana.identifier;
                    }
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

        if (data.secureDNS) {
            result.dnssec = data.secureDNS.delegationSigned ? t('whois.dnssecYes') : t('whois.dnssecNo');
        }

        return result;
    }

    // --- Render Results ---
    function renderResults(info, dnsInfo, ipInfo) {
        const sections = [];

        // === IP Address section ===
        if (dnsInfo && (dnsInfo.ipv4.length > 0 || dnsInfo.ipv6.length > 0)) {
            const ipFields = [];
            dnsInfo.ipv4.forEach(ip => {
                ipFields.push({ label: 'IPv4', value: ip });
            });
            dnsInfo.ipv6.forEach(ip => {
                ipFields.push({ label: 'IPv6', value: ip });
            });
            sections.push(renderSection(t('whois.secIp'), '#2dd4bf', ipFields));
        }

        // === Hosting / Location section ===
        if (ipInfo) {
            const hostFields = [];
            if (ipInfo.isp) hostFields.push({ label: t('whois.ispHoster'), value: ipInfo.isp });
            if (ipInfo.org && ipInfo.org !== ipInfo.isp) hostFields.push({ label: t('whois.org'), value: ipInfo.org });
            if (ipInfo.as) hostFields.push({ label: 'ASN', value: ipInfo.as });
            if (ipInfo.netname) hostFields.push({ label: t('whois.network'), value: ipInfo.netname });
            const locParts = [];
            if (ipInfo.city) locParts.push(ipInfo.city);
            if (ipInfo.regionName) locParts.push(ipInfo.regionName);
            if (ipInfo.country) locParts.push(ipInfo.country);
            if (locParts.length > 0) {
                hostFields.push({ label: t('whois.location'), value: locParts.join(', ') });
            }
            if (ipInfo.domain) hostFields.push({ label: t('whois.domain'), value: ipInfo.domain });
            if (hostFields.length > 0) {
                sections.push(renderSection(t('whois.secHosting'), 'var(--red)', hostFields));
            }
        }

        // Registration section
        const regFields = [];
        if (info.registered) regFields.push({ label: t('whois.registered'), value: info.registered });
        if (info.expires) regFields.push({ label: t('whois.expires'), value: info.expires });
        if (info.updated) regFields.push({ label: t('whois.lastChanged'), value: info.updated });
        if (info.status) regFields.push({ label: t('whois.status'), value: info.status });
        if (info.dnssec) regFields.push({ label: t('whois.dnssec'), value: info.dnssec });

        if (regFields.length > 0) {
            sections.push(renderSection(t('whois.secReg'), 'var(--accent)', regFields));
        }

        // Registrar section
        const regrarFields = [];
        if (info.registrar) regrarFields.push({ label: t('whois.registrar'), value: info.registrar });
        if (info.ianaId) regrarFields.push({ label: t('whois.ianaId'), value: info.ianaId });
        if (info.abuseEmail) regrarFields.push({ label: t('whois.abuseEmail'), value: info.abuseEmail });
        if (info.abusePhone) regrarFields.push({ label: t('whois.abusePhone'), value: info.abusePhone });

        if (regrarFields.length > 0) {
            sections.push(renderSection(t('whois.secRegistrar'), 'var(--green)', regrarFields));
        }

        // Registrant section
        const registrantFields = [];
        if (info.registrant) registrantFields.push({ label: t('whois.name'), value: info.registrant });
        if (info.registrantOrg) registrantFields.push({ label: t('whois.org'), value: info.registrantOrg });

        if (registrantFields.length > 0) {
            sections.push(renderSection(t('whois.secRegistrant'), 'var(--purple)', registrantFields));
        }

        // Nameservers
        if (info.nameservers && info.nameservers.length > 0) {
            sections.push(renderSection(t('whois.secNs'), 'var(--orange)',
                info.nameservers.map(ns => ({ label: 'NS', value: ns }))
            ));
        }

        resultsContainer.innerHTML = sections.join('');
    }

    function renderSection(title, color, fields) {
        const rows = fields.map(f => `
            <div class="whois-field">
                <span class="whois-field-label">${escHtml(f.label)}</span>
                <span class="whois-field-value">${escHtml(f.value)}</span>
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

        domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
        domainInput.value = domain;

        if (!domain.includes('.') || domain.length < 3 || !/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/.test(domain)) {
            showError(t('whois.invalidDomain'));
            return;
        }

        if (_whoisAbortController) _whoisAbortController.abort();
        _whoisAbortController = new AbortController();

        loadingCard.style.display = 'block';
        resultCard.style.display = 'none';
        errorCard.style.display = 'none';

        try {
            const [rdapData, dnsInfo] = await Promise.allSettled([
                queryRDAP(domain),
                queryDNS(domain)
            ]);

            if (_whoisAbortController && _whoisAbortController.signal.aborted) return;

            if (rdapData.status === 'rejected') {
                throw rdapData.reason;
            }

            const info = parseRDAP(rdapData.value);
            const dns = dnsInfo.status === 'fulfilled' ? dnsInfo.value : { ipv4: [], ipv6: [] };

            document.getElementById('whois-result-domain').textContent = domain;
            loadingCard.style.display = 'none';
            renderResults(info, dns, null);
            resultCard.style.display = 'block';

            if (dns.ipv4.length > 0) {
                try {
                    console.log('WHOIS: Fetching IP info for', dns.ipv4[0]);
                    const ipInfo = await queryIPInfo(dns.ipv4[0]);
                    console.log('WHOIS: IP info result:', ipInfo);
                    if (ipInfo && !(_whoisAbortController && _whoisAbortController.signal.aborted)) {
                        renderResults(info, dns, ipInfo);
                    }
                } catch (e) {
                    console.warn('WHOIS: IP info failed:', e);
                }
            } else {
                console.log('WHOIS: No IPv4 found, skipping IP info');
            }

        } catch (err) {
            if (err.name === 'AbortError') return;
            loadingCard.style.display = 'none';
            if (err.message && err.message.startsWith('UNSUPPORTED:')) {
                const tld = err.message.split(':')[1];
                showError(t('whois.errUnsupported', { tld: tld }));
            } else if (err.message && err.message.startsWith('PROXY_FAILED:')) {
                const tld = err.message.split(':')[1];
                showError(t('whois.errProxy', { tld: tld }));
            } else if (err.message && (err.message.includes('404') || err.message.includes('400'))) {
                showError(t('whois.errNotFound', { domain: domain }));
            } else if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
                showError(t('whois.errNetwork', { domain: domain }));
            } else {
                showError(t('whois.queryError', { msg: err.message || err }));
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
