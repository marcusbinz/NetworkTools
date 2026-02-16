// === SSL/TLS Checker ===

let _sslAbortController = null;

function init_ssl_tls_checker(container) {

    container.innerHTML = `
        <section class="card ssl-input-card">
            <label for="ssl-domain">Domain eingeben</label>
            <div class="ssl-input-row">
                <input type="text" id="ssl-domain" placeholder="example.com" autocomplete="off" spellcheck="false">
                <button class="ssl-search-btn" id="ssl-search-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>
            <div class="quick-examples ssl-examples">
                <span class="chip" data-domain="google.com">Google</span>
                <span class="chip" data-domain="github.com">GitHub</span>
                <span class="chip" data-domain="expired.badssl.com">Expired (Test)</span>
                <span class="chip" data-domain="letsencrypt.org">Let's Encrypt</span>
            </div>
        </section>

        <section class="card ssl-loading" id="ssl-loading" style="display:none;">
            <div class="ssl-spinner-row">
                <span class="ssl-spinner"></span>
                <span id="ssl-loading-text">Zertifikat wird gepr\u00fcft\u2026</span>
            </div>
        </section>

        <section class="card ssl-result-card" id="ssl-result-card" style="display:none;">
            <div id="ssl-result-content"></div>
        </section>

        <section class="card error-card" id="ssl-error-card" style="display:none;">
            <p id="ssl-error-msg"></p>
        </section>
    `;

    // DOM references
    const domainInput = document.getElementById('ssl-domain');
    const searchBtn = document.getElementById('ssl-search-btn');
    const loadingCard = document.getElementById('ssl-loading');
    const resultCard = document.getElementById('ssl-result-card');
    const resultContent = document.getElementById('ssl-result-content');
    const errorCard = document.getElementById('ssl-error-card');
    const errorMsg = document.getElementById('ssl-error-msg');

    // Event listeners
    searchBtn.addEventListener('click', lookup);
    domainInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') lookup();
    });

    container.querySelectorAll('.ssl-examples .chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            domainInput.value = chip.dataset.domain;
            lookup();
        });
    });

    function showError(msg) {
        resultCard.style.display = 'none';
        loadingCard.style.display = 'none';
        errorMsg.textContent = msg;
        errorCard.style.display = 'block';
    }

    // --- crt.sh API (direkter Zugriff, CORS wird von crt.sh unterstuetzt) ---
    // Strategie: Identity+exclude=expired -> q= Fallback (schnell, aber nur historisch)
    async function queryCRT(domain) {
        var signal = _sslAbortController ? _sslAbortController.signal : undefined;

        // Hilfsfunktion: Response zu JSON-Array parsen
        async function parseResponse(res) {
            if (!res.ok) return null;
            var text = await res.text();
            if (!text || text.trim().charAt(0) !== '[') return null;
            return JSON.parse(text);
        }

        // 1. Versuch: Identity + exclude=expired (beste Datenqualitaet)
        try {
            var url1 = 'https://crt.sh/?Identity=' + encodeURIComponent(domain) + '&exclude=expired&output=json';
            var res1 = await fetch(url1, { signal: signal });
            var data1 = await parseResponse(res1);
            if (data1 && data1.length > 0) return data1;
        } catch (err) {
            if (err.name === 'AbortError') throw err;
            // Grosse Domains (google.com) koennen hier fehlschlagen -> Fallback
        }

        // 2. Fallback: q= Query (schnell, aber kann veraltete Daten enthalten)
        try {
            var url2 = 'https://crt.sh/?q=' + encodeURIComponent(domain) + '&output=json';
            var res2 = await fetch(url2, { signal: signal });
            var data2 = await parseResponse(res2);
            if (data2 && data2.length > 0) return data2;
        } catch (err) {
            if (err.name === 'AbortError') throw err;
        }

        throw new Error('crt.sh nicht erreichbar. Der Server antwortet nicht \u2014 bitte versuche es in einigen Sekunden erneut.');
    }

    // --- HTTPS reachability check ---
    async function checkHTTPS(domain) {
        const start = performance.now();
        try {
            await fetch('https://' + domain, {
                mode: 'no-cors',
                signal: _sslAbortController ? _sslAbortController.signal : undefined
            });
            const ms = Math.round(performance.now() - start);
            return { reachable: true, ms: ms };
        } catch (err) {
            if (err.name === 'AbortError') throw err;
            return { reachable: false, ms: null };
        }
    }

    // --- Parse issuer name (extract CN or O) ---
    function parseIssuer(issuerName) {
        if (!issuerName) return 'Unbekannt';
        // Try CN= first
        const cnMatch = issuerName.match(/CN=([^,]+)/i);
        if (cnMatch) return cnMatch[1].trim();
        // Try O= (Organization)
        const oMatch = issuerName.match(/O=([^,]+)/i);
        if (oMatch) return oMatch[1].trim();
        return issuerName.substring(0, 60);
    }

    // --- Format date to DD.MM.YYYY ---
    function formatDate(dateStr) {
        if (!dateStr) return '\u2014';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '\u2014';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return day + '.' + month + '.' + year;
    }

    // --- Days until date ---
    function daysUntil(dateStr) {
        if (!dateStr) return null;
        const target = new Date(dateStr);
        const now = new Date();
        const diff = target.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // --- Evaluate certificate status ---
    function evaluateCert(cert, httpsResult) {
        const days = daysUntil(cert.not_after);
        const expired = days !== null && days < 0;
        const expiringSoon = days !== null && days >= 0 && days <= 30;

        if (expired && httpsResult.reachable) {
            // Zertifikat laut CT-Logs abgelaufen, aber HTTPS erreichbar
            // -> Das tatsaechliche Zertifikat ist wahrscheinlich neuer als die CT-Log-Daten
            return {
                status: 'green',
                label: 'HTTPS aktiv',
                text: 'HTTPS ist erreichbar und funktioniert. Die CT-Logs von crt.sh enthalten f\u00fcr diese Domain nur \u00e4ltere Eintr\u00e4ge \u2014 das aktuelle Zertifikat wird m\u00f6glicherweise erst sp\u00e4ter in den Logs erfasst.',
                recommendation: null
            };
        }
        if (expired) {
            return {
                status: 'red',
                label: 'Abgelaufen',
                text: 'Das SSL-Zertifikat dieser Domain ist abgelaufen. Besucher sehen eine Sicherheitswarnung im Browser.',
                recommendation: 'Erneuere das SSL-Zertifikat umgehend. Bei Let\u2019s Encrypt: certbot renew ausf\u00fchren. Bei kostenpflichtigen Zertifikaten: beim Anbieter verl\u00e4ngern und das neue Zertifikat auf dem Server installieren.'
            };
        }
        if (expiringSoon) {
            return {
                status: 'yellow',
                label: 'L\u00e4uft bald ab',
                text: 'Das SSL-Zertifikat l\u00e4uft in ' + days + ' Tagen ab. Rechtzeitig erneuern, um Ausfallzeiten zu vermeiden.',
                recommendation: 'Erneuere das Zertifikat vor dem Ablauf. Bei Let\u2019s Encrypt ist die automatische Verl\u00e4ngerung \u00fcber Certbot/ACME m\u00f6glich. Pr\u00fcfe, ob die Auto-Renewal aktiv ist: certbot renew --dry-run'
            };
        }
        if (!httpsResult.reachable) {
            return {
                status: 'yellow',
                label: 'HTTPS nicht erreichbar',
                text: 'Das Zertifikat ist g\u00fcltig, aber HTTPS konnte nicht erreicht werden. M\u00f6glicherweise ist der Server offline oder blockiert Anfragen.',
                recommendation: 'Pr\u00fcfe ob der Webserver l\u00e4uft und Port 443 (HTTPS) in der Firewall ge\u00f6ffnet ist. Teste mit: curl -I https://' + (cert.common_name || 'domain.de')
            };
        }
        return {
            status: 'green',
            label: 'G\u00fcltig',
            text: 'Das SSL-Zertifikat ist g\u00fcltig und HTTPS ist erreichbar. Noch ' + days + ' Tage bis zum Ablauf.',
            recommendation: null
        };
    }

    // --- Render assessment banner ---
    function renderBanner(assessment) {
        const iconMap = {
            green: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            yellow: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            red: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        };
        let recHtml = '';
        if (assessment.recommendation) {
            recHtml = '<div class="ssl-rec-block">' +
                '<svg class="ssl-rec-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>' +
                '<span class="ssl-rec-text">' + assessment.recommendation + '</span>' +
            '</div>';
        }
        return '<div class="ssl-assessment-banner ' + assessment.status + '">' +
            '<div class="ssl-banner-icon">' + iconMap[assessment.status] + '</div>' +
            '<div class="ssl-banner-text">' + assessment.text + recHtml + '</div>' +
        '</div>';
    }

    // --- Render days badge ---
    function renderDaysBadge(days) {
        if (days === null) return '<span class="ssl-days-badge red">\u2014</span>';
        if (days < 0) return '<span class="ssl-days-badge red">Abgelaufen (' + Math.abs(days) + ' Tage)</span>';
        if (days <= 30) return '<span class="ssl-days-badge yellow">' + days + ' Tage</span>';
        return '<span class="ssl-days-badge green">' + days + ' Tage</span>';
    }

    // --- Render cert history ---
    function renderHistory(certs) {
        if (!certs || certs.length <= 1) return '';
        const histCerts = certs.slice(1, 6); // Skip first (current), show next 5
        if (histCerts.length === 0) return '';

        let items = histCerts.map(function(c) {
            const issuer = parseIssuer(c.issuer_name);
            const from = formatDate(c.not_before);
            const to = formatDate(c.not_after);
            const expired = daysUntil(c.not_after) < 0;
            const statusClass = expired ? 'red' : 'green';
            return '<div class="ssl-cert-history-item">' +
                '<span class="ssl-history-dot ' + statusClass + '"></span>' +
                '<div class="ssl-history-info">' +
                    '<span class="ssl-history-issuer">' + issuer + '</span>' +
                    '<span class="ssl-history-dates">' + from + ' \u2013 ' + to + '</span>' +
                '</div>' +
            '</div>';
        }).join('');

        return '<div class="ssl-section">' +
            '<div class="ssl-section-title">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                ' Fr\u00fchere Zertifikate' +
            '</div>' +
            '<div class="ssl-cert-history">' + items + '</div>' +
        '</div>';
    }

    // --- Main lookup ---
    async function lookup() {
        let domain = domainInput.value.trim().toLowerCase();
        if (!domain) return;

        // Strip protocol and paths
        domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
        domainInput.value = domain;

        if (!domain.includes('.') || domain.length < 3) {
            showError('Bitte gib eine g\u00fcltige Domain ein (z.B. google.com)');
            return;
        }

        // Abort previous
        if (_sslAbortController) _sslAbortController.abort();
        _sslAbortController = new AbortController();

        // Show loading with slow-query hint after 5s
        var loadingText = document.getElementById('ssl-loading-text');
        loadingText.textContent = 'Zertifikat wird gepr\u00fcft\u2026';
        loadingCard.style.display = 'block';
        resultCard.style.display = 'none';
        errorCard.style.display = 'none';
        var slowHintTimer = setTimeout(function() {
            loadingText.textContent = 'Gro\u00dfe Domain \u2014 crt.sh braucht etwas l\u00e4nger\u2026';
        }, 5000);

        try {
            // Parallel: crt.sh + HTTPS check
            const [crtData, httpsResult] = await Promise.all([
                queryCRT(domain),
                checkHTTPS(domain)
            ]);

            clearTimeout(slowHintTimer);

            if (_sslAbortController && _sslAbortController.signal.aborted) return;

            // Process crt.sh data
            if (!crtData || !Array.isArray(crtData) || crtData.length === 0) {
                showError('Kein Zertifikat f\u00fcr "' + domain + '" in Certificate Transparency Logs gefunden.');
                return;
            }

            // Filter: prefer certs that match the exact domain or *.domain
            const seen = new Set();
            const allCerts = crtData.filter(function(c) {
                if (!c.not_before || !c.not_after) return false;
                const key = (c.serial_number || '') + '|' + c.not_before + '|' + c.not_after;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            // Match certs for this exact domain (CN or SAN)
            function certMatchesDomain(c, dom) {
                var names = ((c.common_name || '') + '\n' + (c.name_value || '')).toLowerCase();
                var lines = names.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    var n = lines[i].trim();
                    if (n === dom || n === '*.' + dom) return true;
                }
                return false;
            }

            // 1. Exact domain matches, sorted by not_after descending
            var exactCerts = allCerts
                .filter(function(c) { return certMatchesDomain(c, domain); })
                .sort(function(a, b) {
                    return new Date(b.not_after).getTime() - new Date(a.not_after).getTime();
                });

            // 2. Fallback: all certs sorted by not_after descending
            var sortedCerts = exactCerts.length > 0 ? exactCerts : allCerts.sort(function(a, b) {
                return new Date(b.not_after).getTime() - new Date(a.not_after).getTime();
            });

            if (sortedCerts.length === 0) {
                showError('Keine g\u00fcltigen Zertifikatsdaten f\u00fcr "' + domain + '" gefunden.');
                return;
            }

            const current = sortedCerts[0];
            const issuer = parseIssuer(current.issuer_name);
            const days = daysUntil(current.not_after);
            const assessment = evaluateCert(current, httpsResult);

            // Build result HTML
            let html = '';

            // Assessment banner
            html += renderBanner(assessment);

            // Certificate overview section
            html += '<div class="ssl-section">';
            html += '<div class="ssl-section-title">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
                ' Zertifikat-Details' +
            '</div>';
            html += '<div class="result-grid">';

            // Status
            html += '<div class="result-item">' +
                '<span class="result-label">Status</span>' +
                '<span class="ssl-status-badge ' + assessment.status + '">' + assessment.label + '</span>' +
            '</div>';

            // Domain
            html += '<div class="result-item">' +
                '<span class="result-label">Domain</span>' +
                '<span class="result-value">' + (current.common_name || current.name_value || domain) + '</span>' +
            '</div>';

            // Issuer
            html += '<div class="result-item">' +
                '<span class="result-label">Aussteller</span>' +
                '<span class="result-value">' + issuer + '</span>' +
            '</div>';

            // Days remaining
            html += '<div class="result-item">' +
                '<span class="result-label">Verbleibend</span>' +
                renderDaysBadge(days) +
            '</div>';

            // Valid from
            html += '<div class="result-item">' +
                '<span class="result-label">G\u00fcltig ab</span>' +
                '<span class="result-value">' + formatDate(current.not_before) + '</span>' +
            '</div>';

            // Valid until
            html += '<div class="result-item">' +
                '<span class="result-label">G\u00fcltig bis</span>' +
                '<span class="result-value">' + formatDate(current.not_after) + '</span>' +
            '</div>';

            // HTTPS reachable
            html += '<div class="result-item">' +
                '<span class="result-label">HTTPS</span>' +
                '<span class="result-value">' +
                    (httpsResult.reachable
                        ? '<span style="color:var(--green)">Erreichbar</span>' + (httpsResult.ms ? ' <span style="color:var(--text-dim);font-size:11px">(' + httpsResult.ms + ' ms)</span>' : '')
                        : '<span style="color:var(--red)">Nicht erreichbar</span>') +
                '</span>' +
            '</div>';

            // Cert ID
            html += '<div class="result-item">' +
                '<span class="result-label">CT-Log ID</span>' +
                '<span class="result-value" style="font-size:12px">' + (current.id || current.min_cert_id || '\u2014') + '</span>' +
            '</div>';

            html += '</div>'; // result-grid
            html += '</div>'; // ssl-section

            // Certificate history
            html += renderHistory(sortedCerts);

            resultContent.innerHTML = html;
            loadingCard.style.display = 'none';
            resultCard.style.display = 'block';

        } catch (err) {
            clearTimeout(slowHintTimer);
            if (err.name === 'AbortError') return;
            showError('Fehler beim Pr\u00fcfen: ' + err.message);
        }
    }
}

function teardown_ssl_tls_checker() {
    if (_sslAbortController) {
        _sslAbortController.abort();
        _sslAbortController = null;
    }
}
