// === MX Lookup Tool ===

let _mxAbortController = null;

function init_mx_lookup(container) {
    // --- HTML Template ---
    container.innerHTML = `
        <section class="card mx-input-card">
            <label for="mx-domain">Domain</label>
            <div class="mx-input-row">
                <input type="text" id="mx-domain" placeholder="gmail.com" autocomplete="off" spellcheck="false">
                <button class="mx-search-btn" id="mx-search-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>
            <div class="quick-examples mx-examples">
                <span class="chip" data-domain="gmail.com">Gmail</span>
                <span class="chip" data-domain="outlook.com">Outlook</span>
                <span class="chip" data-domain="yahoo.com">Yahoo</span>
                <span class="chip" data-domain="proton.me">Proton</span>
            </div>
        </section>

        <section class="card mx-loading" id="mx-loading" style="display:none;">
            <div class="mx-spinner-row">
                <span class="mx-spinner"></span>
                <span>MX Records werden abgefragt...</span>
            </div>
        </section>

        <section class="card mx-result-card" id="mx-result-card" style="display:none;">
            <div class="mx-result-header">
                <h3 id="mx-result-domain"></h3>
                <span class="mx-record-count" id="mx-record-count"></span>
            </div>

            <!-- MX Records Table -->
            <div class="mx-section">
                <h4 class="mx-section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    MX Records
                </h4>
                <div class="mx-table-wrap">
                    <table class="mx-table" id="mx-table">
                        <thead>
                            <tr>
                                <th>Prio</th>
                                <th>Mail-Server</th>
                                <th>IP-Adresse</th>
                                <th>TTL</th>
                            </tr>
                        </thead>
                        <tbody id="mx-table-body"></tbody>
                    </table>
                </div>
            </div>

            <!-- Additional DNS Records -->
            <div class="mx-section" id="mx-extra-section" style="display:none;">
                <h4 class="mx-section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Weitere DNS-Einträge
                </h4>

                <!-- SPF -->
                <div class="mx-extra-block" id="mx-spf-block" style="display:none;">
                    <span class="mx-extra-label">SPF</span>
                    <div class="mx-extra-value" id="mx-spf-value"></div>
                </div>

                <!-- DMARC -->
                <div class="mx-extra-block" id="mx-dmarc-block" style="display:none;">
                    <span class="mx-extra-label">DMARC</span>
                    <div class="mx-extra-value" id="mx-dmarc-value"></div>
                </div>

                <!-- NS Records -->
                <div class="mx-extra-block" id="mx-ns-block" style="display:none;">
                    <span class="mx-extra-label">Nameserver</span>
                    <div class="mx-extra-value" id="mx-ns-value"></div>
                </div>

                <!-- A Record -->
                <div class="mx-extra-block" id="mx-a-block" style="display:none;">
                    <span class="mx-extra-label">A Record</span>
                    <div class="mx-extra-value" id="mx-a-value"></div>
                </div>
            </div>
        </section>

        <section class="card error-card" id="mx-error-card" style="display:none;">
            <p id="mx-error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const domainInput = document.getElementById('mx-domain');
    const searchBtn = document.getElementById('mx-search-btn');
    const loadingCard = document.getElementById('mx-loading');
    const resultCard = document.getElementById('mx-result-card');
    const errorCard = document.getElementById('mx-error-card');
    const errorMsg = document.getElementById('mx-error-msg');

    // --- DNS Query via Google DNS ---
    function queryDNS(domain, type) {
        return fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
            signal: _mxAbortController ? _mxAbortController.signal : undefined
        })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        });
    }

    // --- Resolve A record for a hostname ---
    function resolveIP(hostname) {
        return queryDNS(hostname, 'A')
            .then(data => {
                if (data.Answer && data.Answer.length > 0) {
                    return data.Answer[0].data;
                }
                return '—';
            })
            .catch(() => '—');
    }

    // --- Format TTL ---
    function formatTTL(seconds) {
        if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d`;
        if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h`;
        if (seconds >= 60) return `${Math.floor(seconds / 60)}m`;
        return `${seconds}s`;
    }

    // --- Parse MX data "10 mail.example.com." ---
    function parseMX(data) {
        const parts = data.split(' ');
        const priority = parseInt(parts[0]);
        let server = parts.slice(1).join(' ');
        // Remove trailing dot
        if (server.endsWith('.')) server = server.slice(0, -1);
        return { priority, server };
    }

    // --- Main Lookup ---
    async function lookup() {
        let domain = domainInput.value.trim().toLowerCase();
        if (!domain) return;

        // Strip protocol and paths
        domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
        domainInput.value = domain;

        // Basic validation
        if (!domain.includes('.') || domain.length < 3) {
            showError('Bitte gib eine gültige Domain ein (z.B. gmail.com)');
            return;
        }

        // Abort previous
        if (_mxAbortController) _mxAbortController.abort();
        _mxAbortController = new AbortController();

        // Show loading
        loadingCard.style.display = 'block';
        resultCard.style.display = 'none';
        errorCard.style.display = 'none';

        try {
            // Fetch MX records + extra DNS in parallel
            const [mxData, txtData, nsData, aData] = await Promise.all([
                queryDNS(domain, 'MX'),
                queryDNS(domain, 'TXT'),
                queryDNS(domain, 'NS'),
                queryDNS(domain, 'A'),
            ]);

            loadingCard.style.display = 'none';

            // Check for MX records
            if (!mxData.Answer || mxData.Answer.length === 0) {
                showError(`Keine MX Records für "${domain}" gefunden.`);
                return;
            }

            // Parse and sort MX records by priority
            const mxRecords = mxData.Answer
                .filter(r => r.type === 15) // MX type
                .map(r => ({ ...parseMX(r.data), ttl: r.TTL }))
                .sort((a, b) => a.priority - b.priority);

            // Resolve IPs for each MX server
            const ips = await Promise.all(mxRecords.map(mx => resolveIP(mx.server)));

            // Render header
            document.getElementById('mx-result-domain').textContent = domain;
            document.getElementById('mx-record-count').textContent = `${mxRecords.length} MX Record${mxRecords.length !== 1 ? 's' : ''}`;

            // Render MX table
            const tbody = document.getElementById('mx-table-body');
            tbody.innerHTML = mxRecords.map((mx, i) => `
                <tr>
                    <td><span class="mx-prio-badge">${mx.priority}</span></td>
                    <td class="mx-server">${mx.server}</td>
                    <td class="mx-ip">${ips[i]}</td>
                    <td class="mx-ttl">${formatTTL(mx.ttl)}</td>
                </tr>
            `).join('');

            // --- Extra DNS Records ---
            let hasExtra = false;

            // SPF
            const spfBlock = document.getElementById('mx-spf-block');
            if (txtData.Answer) {
                const spf = txtData.Answer.find(r => r.data && r.data.toLowerCase().includes('v=spf1'));
                if (spf) {
                    document.getElementById('mx-spf-value').textContent = spf.data.replace(/"/g, '');
                    spfBlock.style.display = 'block';
                    hasExtra = true;
                } else {
                    spfBlock.style.display = 'none';
                }
            } else {
                spfBlock.style.display = 'none';
            }

            // DMARC
            const dmarcBlock = document.getElementById('mx-dmarc-block');
            try {
                const dmarcData = await queryDNS(`_dmarc.${domain}`, 'TXT');
                if (dmarcData.Answer) {
                    const dmarc = dmarcData.Answer.find(r => r.data && r.data.toLowerCase().includes('v=dmarc'));
                    if (dmarc) {
                        document.getElementById('mx-dmarc-value').textContent = dmarc.data.replace(/"/g, '');
                        dmarcBlock.style.display = 'block';
                        hasExtra = true;
                    } else {
                        dmarcBlock.style.display = 'none';
                    }
                } else {
                    dmarcBlock.style.display = 'none';
                }
            } catch {
                dmarcBlock.style.display = 'none';
            }

            // NS Records
            const nsBlock = document.getElementById('mx-ns-block');
            if (nsData.Answer && nsData.Answer.length > 0) {
                const nsServers = nsData.Answer
                    .filter(r => r.type === 2) // NS type
                    .map(r => r.data.endsWith('.') ? r.data.slice(0, -1) : r.data);
                if (nsServers.length > 0) {
                    document.getElementById('mx-ns-value').textContent = nsServers.join('\n');
                    nsBlock.style.display = 'block';
                    hasExtra = true;
                } else {
                    nsBlock.style.display = 'none';
                }
            } else {
                nsBlock.style.display = 'none';
            }

            // A Record
            const aBlock = document.getElementById('mx-a-block');
            if (aData.Answer && aData.Answer.length > 0) {
                const aRecords = aData.Answer
                    .filter(r => r.type === 1) // A type
                    .map(r => r.data);
                if (aRecords.length > 0) {
                    document.getElementById('mx-a-value').textContent = aRecords.join('\n');
                    aBlock.style.display = 'block';
                    hasExtra = true;
                } else {
                    aBlock.style.display = 'none';
                }
            } else {
                aBlock.style.display = 'none';
            }

            document.getElementById('mx-extra-section').style.display = hasExtra ? 'block' : 'none';

            resultCard.style.display = 'block';

        } catch (err) {
            if (err.name === 'AbortError') return;
            loadingCard.style.display = 'none';
            showError(`Fehler bei der Abfrage: ${err.message}`);
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

    container.querySelectorAll('.mx-examples .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            domainInput.value = chip.dataset.domain;
            lookup();
        });
    });
}

function teardown_mx_lookup() {
    if (_mxAbortController) {
        _mxAbortController.abort();
        _mxAbortController = null;
    }
}
