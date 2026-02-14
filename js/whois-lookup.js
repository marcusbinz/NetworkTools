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

    // --- WHOIS via RDAP (free, no CORS issues) ---
    // RDAP is the modern replacement for WHOIS, provided by registries
    async function queryRDAP(domain) {
        // Try RDAP first (works for most TLDs)
        const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
        const res = await fetch(rdapUrl, {
            signal: _whoisAbortController ? _whoisAbortController.signal : undefined
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
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
    function renderResults(info) {
        const sections = [];

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
            const data = await queryRDAP(domain);
            loadingCard.style.display = 'none';

            const info = parseRDAP(data);
            document.getElementById('whois-result-domain').textContent = domain;
            renderResults(info);
            resultCard.style.display = 'block';

        } catch (err) {
            if (err.name === 'AbortError') return;
            loadingCard.style.display = 'none';
            if (err.message.includes('404')) {
                showError(`Keine WHOIS-Daten für "${domain}" gefunden. Die TLD wird möglicherweise nicht unterstützt.`);
            } else {
                showError(`Fehler bei der Abfrage: ${err.message}`);
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
