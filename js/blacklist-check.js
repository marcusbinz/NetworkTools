// === Blacklist Check Tool ===

let _blAbortController = null;

function init_blacklist_check(container) {
    // --- Known DNS Blacklists ---
    const BLACKLISTS = [
        { id: 'zen.spamhaus.org', name: 'Spamhaus ZEN', desc: 'Kombinierte Blocklist (SBL+XBL+PBL)' },
        { id: 'b.barracudacentral.org', name: 'Barracuda', desc: 'Barracuda Reputation Block List' },
        { id: 'bl.spamcop.net', name: 'SpamCop', desc: 'SpamCop Blocking List' },
        { id: 'dnsbl.sorbs.net', name: 'SORBS', desc: 'Spam and Open Relay Blocking System' },
        { id: 'spam.dnsbl.sorbs.net', name: 'SORBS Spam', desc: 'SORBS Spam-Quellen' },
        { id: 'ips.backscatterer.org', name: 'Backscatterer', desc: 'Backscatter-Quellen' },
        { id: 'psbl.surriel.com', name: 'PSBL', desc: 'Passive Spam Block List' },
        { id: 'dyna.spamrats.com', name: 'SpamRATS Dyna', desc: 'Dynamische IP-Adressen' },
        { id: 'noptr.spamrats.com', name: 'SpamRATS NoPtr', desc: 'Kein Reverse-DNS' },
        { id: 'spam.spamrats.com', name: 'SpamRATS Spam', desc: 'Bekannte Spam-Quellen' },
        { id: 'all.s5h.net', name: 'S5H', desc: 'All-in-One Blocklist' },
        { id: 'dnsbl-1.uceprotect.net', name: 'UCEPROTECT 1', desc: 'Einzelne IP-Adressen' },
    ];

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card bl-input-card">
            <label for="bl-input">IP-Adresse prüfen</label>
            <div class="bl-input-row">
                <input type="text" id="bl-input" placeholder="8.8.8.8" autocomplete="off" spellcheck="false">
                <button class="bl-search-btn" id="bl-search-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>
            <button class="bl-myip-btn chip" id="bl-myip-btn">Meine IP verwenden</button>
            <div class="quick-examples bl-examples">
                <span class="chip" data-ip="8.8.8.8">Google DNS</span>
                <span class="chip" data-ip="1.1.1.1">Cloudflare</span>
                <span class="chip" data-ip="208.67.222.222">OpenDNS</span>
            </div>
        </section>

        <section class="card bl-loading" id="bl-loading" style="display:none;">
            <div class="bl-spinner-row">
                <span class="bl-spinner"></span>
                <span id="bl-loading-text">Blacklists werden geprüft...</span>
            </div>
            <div class="bl-progress-bar">
                <div class="bl-progress-fill" id="bl-progress-fill"></div>
            </div>
        </section>

        <section class="card bl-result-card" id="bl-result-card" style="display:none;">
            <div class="bl-result-header">
                <h3 id="bl-result-ip"></h3>
                <span class="bl-result-status" id="bl-result-status"></span>
            </div>
            <div class="bl-summary" id="bl-summary"></div>
            <div class="bl-list" id="bl-list"></div>
        </section>

        <section class="card error-card" id="bl-error-card" style="display:none;">
            <p id="bl-error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const ipInput = document.getElementById('bl-input');
    const searchBtn = document.getElementById('bl-search-btn');
    const myIpBtn = document.getElementById('bl-myip-btn');
    const loadingCard = document.getElementById('bl-loading');
    const loadingText = document.getElementById('bl-loading-text');
    const progressFill = document.getElementById('bl-progress-fill');
    const resultCard = document.getElementById('bl-result-card');
    const errorCard = document.getElementById('bl-error-card');
    const errorMsg = document.getElementById('bl-error-msg');

    // --- Validate IPv4 ---
    function isValidIPv4(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(p => {
            const n = parseInt(p);
            return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
        });
    }

    // --- Reverse IP for DNSBL lookup ---
    function reverseIP(ip) {
        return ip.split('.').reverse().join('.');
    }

    // --- Check single blacklist using DNS over HTTPS ---
    async function checkBlacklist(ip, bl) {
        const reversed = reverseIP(ip);
        const query = `${reversed}.${bl.id}`;

        try {
            const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(query)}&type=A`, {
                signal: _blAbortController ? _blAbortController.signal : undefined
            });
            if (!res.ok) return { ...bl, status: 'error', detail: `HTTP ${res.status}` };
            const data = await res.json();

            if (data.Answer && data.Answer.length > 0) {
                // Listed! The response IP indicates the listing reason
                const returnCode = data.Answer[0].data;
                return { ...bl, status: 'listed', detail: returnCode };
            } else {
                // Not listed (NXDOMAIN or empty response)
                return { ...bl, status: 'clean', detail: 'Nicht gelistet' };
            }
        } catch (err) {
            if (err.name === 'AbortError') throw err;
            return { ...bl, status: 'error', detail: 'Timeout/Fehler' };
        }
    }

    // --- Main Check ---
    async function check() {
        let ip = ipInput.value.trim();
        if (!ip) return;

        if (!isValidIPv4(ip)) {
            showError('Bitte gib eine gültige IPv4-Adresse ein (z.B. 8.8.8.8)');
            return;
        }

        // Abort previous
        if (_blAbortController) _blAbortController.abort();
        _blAbortController = new AbortController();

        loadingCard.style.display = 'block';
        resultCard.style.display = 'none';
        errorCard.style.display = 'none';
        progressFill.style.width = '0%';

        try {
            const results = [];
            let completed = 0;

            // Check all blacklists in parallel (batches of 4)
            const batchSize = 4;
            for (let i = 0; i < BLACKLISTS.length; i += batchSize) {
                const batch = BLACKLISTS.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(bl => checkBlacklist(ip, bl))
                );
                results.push(...batchResults);
                completed += batch.length;
                const pct = Math.round((completed / BLACKLISTS.length) * 100);
                progressFill.style.width = pct + '%';
                loadingText.textContent = `Prüfe Blacklists... (${completed}/${BLACKLISTS.length})`;
            }

            loadingCard.style.display = 'none';

            // Render results
            const listed = results.filter(r => r.status === 'listed');
            const clean = results.filter(r => r.status === 'clean');
            const errors = results.filter(r => r.status === 'error');

            document.getElementById('bl-result-ip').textContent = ip;

            const statusEl = document.getElementById('bl-result-status');
            if (listed.length === 0) {
                statusEl.textContent = 'Sauber';
                statusEl.className = 'bl-result-status bl-status-clean';
            } else {
                statusEl.textContent = `${listed.length}x gelistet`;
                statusEl.className = 'bl-result-status bl-status-listed';
            }

            document.getElementById('bl-summary').innerHTML = `
                <div class="bl-summary-item bl-summary-clean">
                    <span class="bl-summary-num">${clean.length}</span>
                    <span class="bl-summary-label">Sauber</span>
                </div>
                <div class="bl-summary-item bl-summary-listed">
                    <span class="bl-summary-num">${listed.length}</span>
                    <span class="bl-summary-label">Gelistet</span>
                </div>
                <div class="bl-summary-item bl-summary-error">
                    <span class="bl-summary-num">${errors.length}</span>
                    <span class="bl-summary-label">Fehler</span>
                </div>
            `;

            // Sort: listed first, then errors, then clean
            const sorted = [...listed, ...errors, ...clean];

            document.getElementById('bl-list').innerHTML = sorted.map(r => {
                let icon, statusClass;
                if (r.status === 'listed') {
                    icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
                    statusClass = 'bl-row-listed';
                } else if (r.status === 'error') {
                    icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
                    statusClass = 'bl-row-error';
                } else {
                    icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="16 10 11 15 8 12"/></svg>';
                    statusClass = 'bl-row-clean';
                }
                return `
                    <div class="bl-row ${statusClass}">
                        <span class="bl-row-icon">${icon}</span>
                        <div class="bl-row-info">
                            <span class="bl-row-name">${r.name}</span>
                            <span class="bl-row-desc">${r.desc}</span>
                        </div>
                        <span class="bl-row-detail">${r.detail}</span>
                    </div>
                `;
            }).join('');

            resultCard.style.display = 'block';

        } catch (err) {
            if (err.name === 'AbortError') return;
            loadingCard.style.display = 'none';
            showError(`Fehler bei der Prüfung: ${err.message}`);
        }
    }

    // --- Get My IP ---
    async function getMyIP() {
        try {
            myIpBtn.textContent = 'Ermittle IP...';
            // Try IPv4 first
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            ipInput.value = data.ip;
            myIpBtn.textContent = 'Meine IP verwenden';
        } catch {
            myIpBtn.textContent = 'Meine IP verwenden';
            showError('IP-Adresse konnte nicht ermittelt werden.');
        }
    }

    function showError(msg) {
        resultCard.style.display = 'none';
        loadingCard.style.display = 'none';
        errorMsg.textContent = msg;
        errorCard.style.display = 'block';
    }

    // --- Event Listeners ---
    searchBtn.addEventListener('click', check);
    myIpBtn.addEventListener('click', getMyIP);

    ipInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            check();
        }
    });

    container.querySelectorAll('.bl-examples .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            ipInput.value = chip.dataset.ip;
            check();
        });
    });
}

function teardown_blacklist_check() {
    if (_blAbortController) {
        _blAbortController.abort();
        _blAbortController = null;
    }
}
