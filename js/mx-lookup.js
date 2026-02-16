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

            <!-- E-Mail Security -->
            <div class="mx-section" id="mx-security-section" style="display:none;">
                <h4 class="mx-section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    E-Mail-Sicherheit
                </h4>
                <div id="mx-security-rows"></div>
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

    // --- SPF Evaluation ---
    function evaluateSPF(txtRecords) {
        if (!txtRecords || !txtRecords.Answer) return { status: 'red', label: 'Fehlt', record: 'Kein SPF Record gefunden',
            hint: 'Kein SPF-Record konfiguriert. Jeder Server kann E-Mails im Namen dieser Domain senden.',
            recommendation: 'Erstelle einen TXT-Record f\u00fcr deine Domain mit folgendem Inhalt: v=spf1 include:_spf.dein-provider.de ~all \u2014 passe den include-Wert an deinen E-Mail-Provider an (z.B. _spf.google.com f\u00fcr Google, spf.protection.outlook.com f\u00fcr Microsoft 365).' };
        const spfAnswer = txtRecords.Answer.find(r => r.data && r.data.toLowerCase().includes('v=spf1'));
        if (!spfAnswer) return { status: 'red', label: 'Fehlt', record: 'Kein SPF Record gefunden',
            hint: 'Kein SPF-Record konfiguriert. Jeder Server kann E-Mails im Namen dieser Domain senden.',
            recommendation: 'Erstelle einen TXT-Record f\u00fcr deine Domain mit folgendem Inhalt: v=spf1 include:_spf.dein-provider.de ~all \u2014 passe den include-Wert an deinen E-Mail-Provider an (z.B. _spf.google.com f\u00fcr Google, spf.protection.outlook.com f\u00fcr Microsoft 365).' };

        const record = spfAnswer.data.replace(/"/g, '');
        const lower = record.toLowerCase();

        if (lower.includes('+all')) return { status: 'red', label: 'Unsicher', record: record,
            hint: 'Der SPF-Record erlaubt allen Servern das Senden \u2014 kein Schutz vor Spoofing.',
            recommendation: 'Ersetze +all durch ~all (Soft Fail) oder -all (Hard Fail) im bestehenden SPF-Record. Mit +all kann jeder Server E-Mails im Namen deiner Domain versenden.' };
        if (lower.includes('-all')) return { status: 'green', label: 'G\u00fcltig', record: record,
            hint: 'G\u00fcltiger SPF-Record mit Hard Fail (-all). Nicht autorisierte Server werden abgelehnt.',
            recommendation: null };
        if (lower.includes('~all')) return { status: 'green', label: 'G\u00fcltig', record: record,
            hint: 'G\u00fcltiger SPF-Record mit Soft Fail (~all). Nicht autorisierte E-Mails werden markiert.',
            recommendation: null };
        if (lower.includes('?all')) return { status: 'yellow', label: 'Neutral', record: record,
            hint: 'SPF-Record vorhanden, aber mit neutraler Policy (?all) \u2014 bietet keinen aktiven Schutz.',
            recommendation: 'Ersetze ?all durch ~all (Soft Fail) oder besser -all (Hard Fail). Die neutrale Policy ?all bietet keinen aktiven Schutz gegen Spoofing.' };

        return { status: 'green', label: 'G\u00fcltig', record: record,
            hint: 'G\u00fcltiger SPF-Record vorhanden.',
            recommendation: null };
    }

    // --- DMARC Evaluation ---
    function evaluateDMARC(dmarcData, domain) {
        const dmarcExample = domain ? '_dmarc.' + domain : '_dmarc.deine-domain.de';
        if (!dmarcData || !dmarcData.Answer) return { status: 'red', label: 'Fehlt', record: 'Kein DMARC Record gefunden',
            hint: 'Kein DMARC-Record konfiguriert. Empf\u00e4nger k\u00f6nnen gef\u00e4lschte E-Mails nicht zuverl\u00e4ssig erkennen.',
            recommendation: 'Erstelle einen TXT-Record f\u00fcr ' + dmarcExample + ' mit: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@' + (domain || 'deine-domain.de') + ' \u2014 starte mit p=quarantine und wechsle sp\u00e4ter zu p=reject f\u00fcr maximalen Schutz.' };
        const dmarcAnswer = dmarcData.Answer.find(r => r.data && r.data.toLowerCase().includes('v=dmarc'));
        if (!dmarcAnswer) return { status: 'red', label: 'Fehlt', record: 'Kein DMARC Record gefunden',
            hint: 'Kein DMARC-Record konfiguriert. Empf\u00e4nger k\u00f6nnen gef\u00e4lschte E-Mails nicht zuverl\u00e4ssig erkennen.',
            recommendation: 'Erstelle einen TXT-Record f\u00fcr ' + dmarcExample + ' mit: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@' + (domain || 'deine-domain.de') + ' \u2014 starte mit p=quarantine und wechsle sp\u00e4ter zu p=reject f\u00fcr maximalen Schutz.' };

        const record = dmarcAnswer.data.replace(/"/g, '');
        const lower = record.toLowerCase();

        const pMatch = lower.match(/[;\s]p\s*=\s*(\w+)/) || lower.match(/^v=dmarc1\s*;\s*p\s*=\s*(\w+)/);
        if (!pMatch) return { status: 'yellow', label: 'Unvollst\u00e4ndig', record: record,
            hint: 'DMARC-Record vorhanden, aber keine Policy (p=) definiert.',
            recommendation: 'Erg\u00e4nze eine Policy im DMARC-Record: F\u00fcge p=quarantine oder p=reject hinzu. Ohne Policy-Angabe wird DMARC von Empf\u00e4ngern ignoriert.' };

        const policy = pMatch[1];
        if (policy === 'reject') return { status: 'green', label: 'G\u00fcltig', record: record,
            hint: 'DMARC-Policy sch\u00fctzt die Domain vollst\u00e4ndig. Gef\u00e4lschte E-Mails werden abgelehnt (reject).',
            recommendation: null };
        if (policy === 'quarantine') return { status: 'green', label: 'G\u00fcltig', record: record,
            hint: 'DMARC-Policy aktiv. Gef\u00e4lschte E-Mails werden in den Spam-Ordner verschoben (quarantine).',
            recommendation: null };
        if (policy === 'none') return { status: 'yellow', label: 'Schwach', record: record,
            hint: 'DMARC-Record vorhanden, aber Policy ist p=none \u2014 gef\u00e4lschte E-Mails werden nicht blockiert.',
            recommendation: '\u00c4ndere die DMARC-Policy von p=none zu p=quarantine oder p=reject. Mit p=none werden gef\u00e4lschte E-Mails nur gemeldet, aber nicht blockiert. Empfohlener Weg: erst p=quarantine, dann p=reject.' };

        return { status: 'yellow', label: 'Unbekannt', record: record,
            hint: 'DMARC-Record vorhanden mit unbekannter Policy.',
            recommendation: 'Pr\u00fcfe den DMARC-Record und setze eine g\u00fcltige Policy: p=quarantine oder p=reject.' };
    }

    // --- DKIM Check (try common selectors) ---
    async function checkDKIM(domain) {
        const selectors = ['default', 'google', 'selector1', 'selector2', 'k1', 's1', 's2', 'dkim', 'mail'];

        const checks = selectors.map(sel => {
            const name = sel + '._domainkey.' + domain;
            return queryDNS(name, 'TXT')
                .then(data => {
                    if (data.Answer && data.Answer.length > 0) {
                        const dkimRec = data.Answer.find(r => r.data && (r.data.includes('v=DKIM1') || r.data.includes('p=')));
                        if (dkimRec) {
                            return { found: true, selector: sel, record: dkimRec.data.replace(/"/g, '') };
                        }
                    }
                    return { found: false };
                })
                .catch(() => ({ found: false }));
        });

        const results = await Promise.all(checks);
        const hit = results.find(r => r.found);

        if (hit) {
            return { status: 'green', label: 'G\u00fcltig', record: hit.record, selector: hit.selector,
                hint: 'DKIM-Signatur gefunden. E-Mails werden kryptografisch authentifiziert.',
                recommendation: null };
        }
        return { status: 'red', label: 'Fehlt', record: 'Kein DKIM Record bei g\u00e4ngigen Selektoren gefunden',
            hint: 'Kein DKIM-Record bei g\u00e4ngigen Selektoren gefunden. E-Mails k\u00f6nnen nicht kryptografisch verifiziert werden.',
            recommendation: 'Aktiviere DKIM bei deinem E-Mail-Provider (z.B. Google Workspace \u2192 Apps \u2192 Google Workspace \u2192 Gmail \u2192 E-Mail authentifizieren, Microsoft 365 \u2192 Defender \u2192 DKIM). Der Provider generiert einen Public Key, den du als TXT-Record unter selektor._domainkey.' + domain + ' eintr\u00e4gst.' };
    }

    // --- Overall security assessment ---
    function getOverallAssessment(spf, dmarc, dkim) {
        const statuses = [spf.status, dmarc.status, dkim.status];
        const greenCount = statuses.filter(s => s === 'green').length;
        const redCount = statuses.filter(s => s === 'red').length;

        // Collect action items from non-green results
        const actions = [];
        if (spf.status === 'red') actions.push('SPF-Record anlegen oder korrigieren');
        else if (spf.status === 'yellow') actions.push('SPF-Policy versch\u00e4rfen (\u2192 ~all oder -all)');
        if (dmarc.status === 'red') actions.push('DMARC-Record erstellen');
        else if (dmarc.status === 'yellow') actions.push('DMARC-Policy versch\u00e4rfen (\u2192 quarantine oder reject)');
        if (dkim.status === 'red') actions.push('DKIM beim E-Mail-Provider aktivieren');

        if (greenCount === 3) {
            return { status: 'green', text: 'Diese Domain ist gut gesch\u00fctzt. SPF, DMARC und DKIM sind korrekt konfiguriert.', actions: [] };
        }
        if (redCount >= 2) {
            return { status: 'red', text: 'Diese Domain ist nicht ausreichend gesch\u00fctzt und anf\u00e4llig f\u00fcr E-Mail-Spoofing und Phishing.', actions: actions };
        }
        if (dmarc.status === 'red') {
            return { status: 'red', text: 'Kein DMARC-Record gefunden. Diese Domain ist nicht gegen Missbrauch gesch\u00fctzt und erf\u00fcllt wahrscheinlich nicht die Absenderanforderungen von Google und Yahoo.', actions: actions };
        }
        if (redCount === 1) {
            return { status: 'yellow', text: 'Diese Domain ist nur teilweise gesch\u00fctzt. Mindestens eine E-Mail-Sicherheitskonfiguration fehlt.', actions: actions };
        }
        // All yellow or mix of green/yellow
        return { status: 'yellow', text: 'Diese Domain ist teilweise gesch\u00fctzt, aber die Konfiguration k\u00f6nnte verbessert werden.', actions: actions };
    }

    function renderOverallBanner(assessment) {
        const iconMap = {
            green: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            yellow: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            red: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        };
        let actionsHtml = '';
        if (assessment.actions && assessment.actions.length > 0) {
            actionsHtml = '<div class="mx-overall-actions">' +
                assessment.actions.map(a => '<div class="mx-action-item">\u2192 ' + a + '</div>').join('') +
            '</div>';
        }
        return '<div class="mx-overall-banner ' + assessment.status + '">' +
            '<div class="mx-overall-icon">' + iconMap[assessment.status] + '</div>' +
            '<div class="mx-overall-text">' + assessment.text + actionsHtml + '</div>' +
        '</div>';
    }

    // --- Render security row ---
    function renderSecurityRow(name, result) {
        const selectorHint = result.selector ? ' <span style="opacity:0.5">(' + result.selector + ')</span>' : '';
        const hintHtml = result.hint ? '<div class="mx-security-hint">' + result.hint + '</div>' : '';
        const recHtml = result.recommendation ? '<div class="mx-security-recommendation">' +
            '<svg class="mx-rec-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>' +
            '<span class="mx-rec-text">' + result.recommendation + '</span>' +
        '</div>' : '';
        return '<div class="mx-security-row">' +
            '<div class="mx-security-dot ' + result.status + '"></div>' +
            '<div class="mx-security-info">' +
                '<div class="mx-security-header">' +
                    '<span class="mx-security-name">' + name + '</span>' +
                    '<span class="mx-security-badge ' + result.status + '">' + result.label + selectorHint + '</span>' +
                '</div>' +
                hintHtml +
                recHtml +
                '<div class="mx-security-record">' + result.record + '</div>' +
            '</div>' +
        '</div>';
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

            // --- E-Mail Security Evaluation ---
            let dmarcData = null;
            let dkimResult = null;
            try {
                [dmarcData, dkimResult] = await Promise.all([
                    queryDNS(`_dmarc.${domain}`, 'TXT').catch(() => null),
                    checkDKIM(domain),
                ]);
            } catch {
                dmarcData = null;
                dkimResult = { status: 'red', label: 'Fehler', record: 'Abfrage fehlgeschlagen' };
            }

            const spfResult = evaluateSPF(txtData);
            const dmarcResult = evaluateDMARC(dmarcData, domain);

            const overall = getOverallAssessment(spfResult, dmarcResult, dkimResult);

            const securityRows = document.getElementById('mx-security-rows');
            securityRows.innerHTML =
                renderOverallBanner(overall) +
                renderSecurityRow('SPF', spfResult) +
                renderSecurityRow('DMARC', dmarcResult) +
                renderSecurityRow('DKIM', dkimResult);
            document.getElementById('mx-security-section').style.display = 'block';

            // --- Extra DNS Records ---
            let hasExtra = false;

            // SPF (raw record)
            const spfBlock = document.getElementById('mx-spf-block');
            if (spfResult.status !== 'red') {
                document.getElementById('mx-spf-value').textContent = spfResult.record;
                spfBlock.style.display = 'block';
                hasExtra = true;
            } else {
                spfBlock.style.display = 'none';
            }

            // DMARC (raw record)
            const dmarcBlock = document.getElementById('mx-dmarc-block');
            if (dmarcResult.status !== 'red') {
                document.getElementById('mx-dmarc-value').textContent = dmarcResult.record;
                dmarcBlock.style.display = 'block';
                hasExtra = true;
            } else {
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
