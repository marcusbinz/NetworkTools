// === DNS Lookup Tool ===

let _dnsAbortController = null;

function init_dns_lookup(container) {
    // --- i18n Strings ---
    I18N.register('dns', {
        de: {
            'label':        'Hostname / Domain',
            'recordType':   'Record-Typ',
            'all':          'Alle',
            'examples':     'Beispiele',
            'loading':      'DNS Records werden abgefragt...',
            'invalidDomain':'Bitte gib eine g\u00fcltige Domain ein (z.B. google.com)',
            'noRecords':    'Keine DNS Records f\u00fcr "{domain}" gefunden{suffix}.',
            'queryError':   'Fehler bei der Abfrage: {msg}',
            'record':       'Record',
            'records':      'Records',
        },
        en: {
            'label':        'Hostname / Domain',
            'recordType':   'Record Type',
            'all':          'All',
            'examples':     'Examples',
            'loading':      'Querying DNS records...',
            'invalidDomain':'Please enter a valid domain (e.g. google.com)',
            'noRecords':    'No DNS records found for "{domain}"{suffix}.',
            'queryError':   'Query error: {msg}',
            'record':       'record',
            'records':      'records',
        }
    });

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card dns-input-card">
            <label for="dns-domain">${t('dns.label')}</label>
            <div class="dns-input-row">
                <input type="text" id="dns-domain" placeholder="example.com" autocomplete="off" spellcheck="false">
                <button class="dns-search-btn" id="dns-search-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>

            <label class="dns-type-label">${t('dns.recordType')}</label>
            <div class="dns-type-chips" id="dns-type-chips">
                <span class="chip dns-type-chip active" data-type="ALL">${t('dns.all')}</span>
                <span class="chip dns-type-chip" data-type="A">A</span>
                <span class="chip dns-type-chip" data-type="AAAA">AAAA</span>
                <span class="chip dns-type-chip" data-type="CNAME">CNAME</span>
                <span class="chip dns-type-chip" data-type="MX">MX</span>
                <span class="chip dns-type-chip" data-type="NS">NS</span>
                <span class="chip dns-type-chip" data-type="TXT">TXT</span>
                <span class="chip dns-type-chip" data-type="SOA">SOA</span>
            </div>

            <label class="quick-examples-label">${t('dns.examples')}</label>
            <div class="quick-examples dns-examples">
                <span class="chip" data-domain="google.com">Google</span>
                <span class="chip" data-domain="cloudflare.com">Cloudflare</span>
                <span class="chip" data-domain="github.com">GitHub</span>
                <span class="chip" data-domain="wikipedia.org">Wikipedia</span>
            </div>
        </section>

        <section class="card dns-loading" id="dns-loading" style="display:none;">
            <div class="dns-spinner-row">
                <span class="dns-spinner"></span>
                <span>${t('dns.loading')}</span>
            </div>
        </section>

        <section class="card dns-result-card" id="dns-result-card" style="display:none;">
            <div class="dns-result-header">
                <h3 id="dns-result-domain"></h3>
                <span class="dns-total-count" id="dns-total-count"></span>
            </div>
            <div id="dns-results-container"></div>
        </section>

        <section class="card error-card" id="dns-error-card" style="display:none;">
            <p id="dns-error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const domainInput = document.getElementById('dns-domain');
    const searchBtn = document.getElementById('dns-search-btn');
    const loadingCard = document.getElementById('dns-loading');
    const resultCard = document.getElementById('dns-result-card');
    const errorCard = document.getElementById('dns-error-card');
    const errorMsg = document.getElementById('dns-error-msg');
    const resultsContainer = document.getElementById('dns-results-container');
    const typeChips = container.querySelectorAll('.dns-type-chip');

    let selectedType = 'ALL';

    // --- DNS record type map ---
    const TYPE_MAP = {
        1: 'A',
        2: 'NS',
        5: 'CNAME',
        6: 'SOA',
        15: 'MX',
        16: 'TXT',
        28: 'AAAA',
    };

    const TYPE_COLORS = {
        'A':     'var(--accent)',
        'AAAA':  'var(--purple)',
        'CNAME': 'var(--orange)',
        'MX':    'var(--green)',
        'NS':    'var(--accent)',
        'TXT':   'var(--text-dim)',
        'SOA':   'var(--purple)',
    };

    const ALL_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA'];

    // --- Type chip selection ---
    typeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            typeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedType = chip.dataset.type;
        });
    });

    // --- DNS Query via Google DNS ---
    function queryDNS(domain, type) {
        return fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
            signal: _dnsAbortController ? _dnsAbortController.signal : undefined
        })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        });
    }

    // --- Format TTL ---
    function formatTTL(seconds) {
        if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
        if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
        if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    // --- Clean record data ---
    function cleanData(data, type) {
        // Remove trailing dots from hostnames
        if (typeof data === 'string') {
            data = data.replace(/\.$/g, '');
            // Remove surrounding quotes from TXT
            if (type === 'TXT' && data.startsWith('"') && data.endsWith('"')) {
                data = data.slice(1, -1);
            }
        }
        return data;
    }

    // --- Format SOA record ---
    function formatSOA(data) {
        // SOA format: "mname rname serial refresh retry expire minimum"
        const parts = data.split(' ');
        if (parts.length >= 7) {
            return `Primary: ${parts[0].replace(/\.$/, '')}
Contact: ${parts[1].replace(/\.$/, '').replace('.', '@', 1)}
Serial: ${parts[2]}
Refresh: ${formatTTL(parseInt(parts[3]))}
Retry: ${formatTTL(parseInt(parts[4]))}
Expire: ${formatTTL(parseInt(parts[5]))}
Min TTL: ${formatTTL(parseInt(parts[6]))}`;
        }
        return cleanData(data, 'SOA');
    }

    // --- Render a record section ---
    function renderSection(type, records) {
        const color = TYPE_COLORS[type] || 'var(--text)';
        let rows = '';

        records.forEach(r => {
            let displayData;
            if (type === 'SOA') {
                displayData = escHtml(formatSOA(r.data));
            } else if (type === 'MX') {
                const parts = r.data.split(' ');
                const prio = escHtml(parts[0]);
                const server = escHtml(cleanData(parts.slice(1).join(' '), type));
                displayData = `<span class="dns-mx-prio">${prio}</span> ${server}`;
            } else {
                displayData = escHtml(cleanData(r.data, type));
            }

            rows += `
                <div class="dns-record-row">
                    <div class="dns-record-data">${displayData}</div>
                    <div class="dns-record-ttl">${formatTTL(r.TTL)}</div>
                </div>
            `;
        });

        return `
            <div class="dns-section">
                <div class="dns-section-header">
                    <span class="dns-type-badge" style="color:${color}; background:${color}15; border-color:${color}40">${type}</span>
                    <span class="dns-section-count">${records.length} ${records.length !== 1 ? t('dns.records') : t('dns.record')}</span>
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

        if (!domain.includes('.') || domain.length < 3 || !/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/.test(domain)) {
            showError(t('dns.invalidDomain'));
            return;
        }

        // Abort previous
        if (_dnsAbortController) _dnsAbortController.abort();
        _dnsAbortController = new AbortController();

        loadingCard.style.display = 'block';
        resultCard.style.display = 'none';
        errorCard.style.display = 'none';

        try {
            const typesToQuery = selectedType === 'ALL' ? ALL_TYPES : [selectedType];

            // Query all types in parallel
            const results = await Promise.all(
                typesToQuery.map(type =>
                    queryDNS(domain, type)
                        .then(data => ({ type, data }))
                        .catch(() => ({ type, data: null }))
                )
            );

            loadingCard.style.display = 'none';

            // Collect all records grouped by type
            const grouped = {};
            let totalRecords = 0;

            results.forEach(({ type, data }) => {
                if (data && data.Answer && data.Answer.length > 0) {
                    const typeName = type;
                    if (!grouped[typeName]) grouped[typeName] = [];
                    data.Answer.forEach(r => {
                        const rType = TYPE_MAP[r.type] || type;
                        if (!grouped[rType]) grouped[rType] = [];
                        // Avoid duplicates
                        if (!grouped[rType].find(existing => existing.data === r.data)) {
                            grouped[rType].push(r);
                            totalRecords++;
                        }
                    });
                }
            });

            if (totalRecords === 0) {
                showError(t('dns.noRecords', { domain: domain, suffix: selectedType !== 'ALL' ? ` (${selectedType})` : '' }));
                return;
            }

            // Render
            document.getElementById('dns-result-domain').textContent = domain;
            document.getElementById('dns-total-count').textContent = `${totalRecords} ${totalRecords !== 1 ? t('dns.records') : t('dns.record')}`;

            // Render sections in defined order
            const order = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA'];
            let html = '';
            order.forEach(type => {
                if (grouped[type] && grouped[type].length > 0) {
                    html += renderSection(type, grouped[type]);
                }
            });

            resultsContainer.innerHTML = html;
            resultCard.style.display = 'block';

        } catch (err) {
            if (err.name === 'AbortError') return;
            loadingCard.style.display = 'none';
            showError(t('dns.queryError', { msg: err.message }));
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

    container.querySelectorAll('.dns-examples .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            domainInput.value = chip.dataset.domain;
            lookup();
        });
    });
}

function teardown_dns_lookup() {
    if (_dnsAbortController) {
        _dnsAbortController.abort();
        _dnsAbortController = null;
    }
}
