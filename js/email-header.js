// === Email Header Analyzer Tool ===

function init_email_header(container) {

    // --- Example Header (for the demo chip) ---
    const EXAMPLE_HEADER = `Delivered-To: user@example.com
Received: by 2002:a17:90a:1234:0:0:0:0 with SMTP id a1csp123456abc;
        Mon, 10 Feb 2026 08:15:42 -0800 (PST)
Received: from mail-relay.external.com (mail-relay.external.com [203.0.113.50])
        by mx.google.com with ESMTPS id abc123def456
        for <user@example.com>;
        Mon, 10 Feb 2026 08:15:41 -0800 (PST)
Received: from internal-mta.sender.com (internal-mta.sender.com [198.51.100.10])
        by mail-relay.external.com (Postfix)
        with ESMTP id 4XYZ123ABC
        for <user@example.com>;
        Mon, 10 Feb 2026 17:15:38 +0100 (CET)
Received: from workstation.local (workstation.local [192.168.1.42])
        by internal-mta.sender.com (Postfix)
        with ESMTP id 9ABCD567EF;
        Mon, 10 Feb 2026 17:15:30 +0100 (CET)
Authentication-Results: mx.google.com;
       dkim=pass header.d=sender.com header.s=sel1;
       spf=pass (google.com: domain of info@sender.com designates 203.0.113.50 as permitted sender) smtp.mailfrom=info@sender.com;
       dmarc=pass (p=REJECT sp=REJECT) header.from=sender.com
From: Max Mustermann <info@sender.com>
To: user@example.com
Subject: Wichtige Projekt-Information
Date: Mon, 10 Feb 2026 17:15:28 +0100
Message-ID: <abc123@sender.com>
Reply-To: reply@sender.com
Return-Path: <bounce@sender.com>
X-Mailer: Custom Mailer 2.0
X-Spam-Status: No, score=-1.5
X-Spam-Score: -1.5
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8`;

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card eh-input-card">
            <label for="eh-input">E-Mail Header einf\u00fcgen</label>
            <textarea id="eh-input" placeholder="Vollst\u00e4ndigen E-Mail Header hier einf\u00fcgen\u2026" spellcheck="false"></textarea>
            <div class="eh-btn-row">
                <button class="eh-analyze-btn" id="eh-analyze-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Analysieren
                </button>
                <button class="eh-clear-btn" id="eh-clear-btn">Leeren</button>
            </div>
            <div class="quick-examples eh-examples">
                <span class="chip" id="eh-example-btn">Beispiel laden</span>
            </div>
        </section>

        <!-- Authentication Results -->
        <section class="card eh-result-card" id="eh-auth-card" style="display:none;">
            <h4 class="eh-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Authentifizierung
            </h4>
            <div class="eh-auth-grid" id="eh-auth-grid"></div>
        </section>

        <!-- Sender Info -->
        <section class="card eh-result-card" id="eh-sender-card" style="display:none;">
            <h4 class="eh-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Absender-Informationen
            </h4>
            <div class="eh-info-grid" id="eh-info-grid"></div>
            <div id="eh-warnings"></div>
        </section>

        <!-- Routing Path -->
        <section class="card eh-result-card" id="eh-routing-card" style="display:none;">
            <h4 class="eh-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Routing-Pfad
            </h4>
            <div class="eh-timing-summary" id="eh-timing-summary"></div>
            <div class="eh-hop-timeline" id="eh-hop-timeline"></div>
        </section>

        <!-- Security Analysis -->
        <section class="card eh-result-card" id="eh-security-card" style="display:none;">
            <h4 class="eh-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Sicherheitsanalyse
            </h4>
            <div id="eh-security-list"></div>
        </section>

        <!-- Raw Headers (collapsible) -->
        <section class="card eh-result-card" id="eh-raw-card" style="display:none;">
            <button class="eh-raw-toggle" id="eh-raw-toggle">Alle Header anzeigen</button>
            <div class="eh-raw-content" id="eh-raw-content" style="display:none;"></div>
        </section>

        <!-- Error -->
        <section class="card error-card" id="eh-error-card" style="display:none;">
            <p id="eh-error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const headerInput   = document.getElementById('eh-input');
    const analyzeBtn    = document.getElementById('eh-analyze-btn');
    const clearBtn      = document.getElementById('eh-clear-btn');
    const exampleBtn    = document.getElementById('eh-example-btn');
    const authCard      = document.getElementById('eh-auth-card');
    const senderCard    = document.getElementById('eh-sender-card');
    const routingCard   = document.getElementById('eh-routing-card');
    const securityCard  = document.getElementById('eh-security-card');
    const rawCard       = document.getElementById('eh-raw-card');
    const errorCard     = document.getElementById('eh-error-card');
    const errorMsg      = document.getElementById('eh-error-msg');

    // ============================
    //  PARSING FUNCTIONS
    // ============================

    // --- Unfold headers (RFC 2822 continuation lines) ---
    function parseHeaders(raw) {
        const unfolded = raw.replace(/\r\n/g, '\n').replace(/\n([ \t]+)/g, ' ');
        const lines = unfolded.split('\n');
        const headers = [];
        const headerMap = {};

        for (const line of lines) {
            const match = line.match(/^([A-Za-z0-9\-]+):\s*(.*)/);
            if (match) {
                const key = match[1];
                const value = match[2].trim();
                headers.push({ key, value });
                const lk = key.toLowerCase();
                if (!headerMap[lk]) headerMap[lk] = [];
                headerMap[lk].push(value);
            }
        }
        return { headers, headerMap };
    }

    // --- Parse Received: headers into hop objects ---
    function parseReceived(values) {
        const hops = [];
        for (const val of values) {
            const hop = {};

            const fromMatch = val.match(/from\s+(\S+)/i);
            if (fromMatch) hop.from = fromMatch[1];

            const byMatch = val.match(/by\s+(\S+)/i);
            if (byMatch) hop.by = byMatch[1];

            const ipMatch = val.match(/\[(\d{1,3}(?:\.\d{1,3}){3})\]/);
            if (ipMatch) hop.ip = ipMatch[1];

            // IPv6 in brackets
            if (!hop.ip) {
                const ip6Match = val.match(/\[([0-9a-fA-F:]+)\]/);
                if (ip6Match) hop.ip = ip6Match[1];
            }

            const semiIdx = val.lastIndexOf(';');
            if (semiIdx !== -1) {
                const tsStr = val.substring(semiIdx + 1).trim();
                const ts = new Date(tsStr);
                if (!isNaN(ts.getTime())) {
                    hop.timestamp = ts;
                    hop.timestampStr = tsStr;
                }
            }

            hops.push(hop);
        }

        // Reverse: index 0 = first hop (origin), last = delivery
        hops.reverse();

        // Calculate delays
        for (let i = 1; i < hops.length; i++) {
            if (hops[i].timestamp && hops[i - 1].timestamp) {
                const delayMs = hops[i].timestamp - hops[i - 1].timestamp;
                hops[i].delaySeconds = Math.max(0, Math.round(delayMs / 1000));
            }
        }

        return hops;
    }

    // --- Parse Authentication-Results ---
    function parseAuthResults(values) {
        const auth = { spf: null, dkim: null, dmarc: null };
        const combined = values.join(' ');

        const spfMatch = combined.match(/spf=(pass|fail|softfail|neutral|none|temperror|permerror)/i);
        if (spfMatch) auth.spf = spfMatch[1].toLowerCase();

        const dkimMatch = combined.match(/dkim=(pass|fail|none|neutral|temperror|permerror)/i);
        if (dkimMatch) auth.dkim = dkimMatch[1].toLowerCase();

        const dmarcMatch = combined.match(/dmarc=(pass|fail|none|bestguesspass|temperror|permerror)/i);
        if (dmarcMatch) auth.dmarc = dmarcMatch[1].toLowerCase();

        return auth;
    }

    // ============================
    //  HELPER FUNCTIONS
    // ============================

    function formatDelay(seconds) {
        if (seconds < 1) return '< 1s';
        if (seconds < 60) return seconds + 's';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h + 'h ' + m + 'm';
    }

    function getDelayClass(seconds) {
        if (seconds <= 5) return 'eh-delay-fast';
        if (seconds <= 30) return 'eh-delay-medium';
        return 'eh-delay-slow';
    }

    function getAuthClass(value) {
        if (!value) return 'eh-auth-none';
        if (value === 'pass' || value === 'bestguesspass') return 'eh-auth-pass';
        if (value === 'fail' || value === 'softfail' || value === 'permerror') return 'eh-auth-fail';
        if (value === 'neutral') return 'eh-auth-neutral';
        return 'eh-auth-none';
    }

    function getAuthIcon(value) {
        if (!value || value === 'none' || value === 'temperror') {
            return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
        }
        if (value === 'pass' || value === 'bestguesspass') {
            return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="16 10 11 15 8 12"/></svg>';
        }
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    }

    function extractEmail(val) {
        const match = val.match(/<([^>]+)>/);
        return match ? match[1] : val;
    }

    // ============================
    //  MAIN ANALYSIS
    // ============================

    function analyze() {
        const raw = headerInput.value.trim();
        if (!raw) {
            showError('Bitte f\u00fcge einen E-Mail Header in das Textfeld ein.');
            return;
        }

        hideResults();

        const { headers, headerMap } = parseHeaders(raw);

        if (headers.length === 0) {
            showError('Keine g\u00fcltigen Header-Zeilen erkannt. Bitte pr\u00fcfe die Eingabe.');
            return;
        }

        const getFirst = (key) => (headerMap[key.toLowerCase()] || [])[0] || null;

        // ===== 1. Authentication Results =====
        const authValues = headerMap['authentication-results'];
        if (authValues && authValues.length > 0) {
            const auth = parseAuthResults(authValues);
            const authGrid = document.getElementById('eh-auth-grid');
            authGrid.innerHTML = ['SPF', 'DKIM', 'DMARC'].map(protocol => {
                const key = protocol.toLowerCase();
                const value = auth[key];
                const displayValue = value ? value.toUpperCase() : 'Nicht vorhanden';
                const cls = getAuthClass(value);
                const icon = getAuthIcon(value);
                return `
                    <div class="eh-auth-item">
                        <div class="eh-auth-icon">${icon}</div>
                        <span class="eh-auth-label">${protocol}</span>
                        <span class="eh-auth-value ${cls}">${escHtml(displayValue)}</span>
                    </div>
                `;
            }).join('');
            authCard.style.display = 'block';
        }

        // ===== 2. Sender Information =====
        const senderFields = [
            { key: 'from', label: 'Von (From)', fullWidth: false },
            { key: 'to', label: 'An (To)', fullWidth: false },
            { key: 'subject', label: 'Betreff', fullWidth: true },
            { key: 'date', label: 'Datum', fullWidth: false },
            { key: 'reply-to', label: 'Reply-To', fullWidth: false },
            { key: 'return-path', label: 'Return-Path', fullWidth: false },
            { key: 'message-id', label: 'Message-ID', fullWidth: true },
        ];

        const infoItems = senderFields
            .filter(f => getFirst(f.key))
            .map(f => {
                const val = getFirst(f.key);
                return `
                    <div class="eh-info-item${f.fullWidth ? ' full-width' : ''}">
                        <span class="eh-info-label">${f.label}</span>
                        <span class="eh-info-value">${escHtml(val)}</span>
                    </div>
                `;
            });

        if (infoItems.length > 0) {
            document.getElementById('eh-info-grid').innerHTML = infoItems.join('');

            // From vs Return-Path mismatch check
            const fromVal = getFirst('from');
            const returnPathVal = getFirst('return-path');
            const warningsEl = document.getElementById('eh-warnings');
            warningsEl.innerHTML = '';

            if (fromVal && returnPathVal) {
                const fromEmail = extractEmail(fromVal).toLowerCase();
                const rpEmail = extractEmail(returnPathVal).replace(/^<|>$/g, '').toLowerCase();
                const fromDomain = fromEmail.split('@')[1];
                const rpDomain = rpEmail.split('@')[1];
                if (fromDomain && rpDomain && fromDomain !== rpDomain) {
                    warningsEl.innerHTML = `
                        <div class="eh-mismatch-warning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            From-Domain (${escHtml(fromDomain)}) stimmt nicht mit Return-Path-Domain (${escHtml(rpDomain)}) \u00fcberein
                        </div>
                    `;
                }
            }

            senderCard.style.display = 'block';
        }

        // ===== 3. Routing Path =====
        const receivedValues = headerMap['received'];
        if (receivedValues && receivedValues.length > 0) {
            const hops = parseReceived(receivedValues);

            // Timing summary
            let totalDelay = 0;
            let maxDelay = 0;
            hops.forEach(h => {
                if (h.delaySeconds !== undefined) {
                    totalDelay += h.delaySeconds;
                    if (h.delaySeconds > maxDelay) maxDelay = h.delaySeconds;
                }
            });

            document.getElementById('eh-timing-summary').innerHTML = `
                <div class="eh-timing-item">
                    <span class="eh-timing-num">${hops.length}</span>
                    <span class="eh-timing-label">Hops</span>
                </div>
                <div class="eh-timing-item">
                    <span class="eh-timing-num">${formatDelay(totalDelay)}</span>
                    <span class="eh-timing-label">Gesamt</span>
                </div>
                <div class="eh-timing-item">
                    <span class="eh-timing-num">${formatDelay(maxDelay)}</span>
                    <span class="eh-timing-label">Max. Verz\u00f6gerung</span>
                </div>
            `;

            // Render hops
            document.getElementById('eh-hop-timeline').innerHTML = hops.map((hop, i) => {
                let serversHtml = '';
                if (hop.from) {
                    serversHtml += `<span class="eh-hop-server-label">from </span>${escHtml(hop.from)}`;
                    if (hop.ip) serversHtml += ` <span class="eh-hop-server-label">[${escHtml(hop.ip)}]</span>`;
                    serversHtml += '<br>';
                }
                if (hop.by) {
                    serversHtml += `<span class="eh-hop-server-label">by </span>${escHtml(hop.by)}`;
                }

                let delayHtml = '';
                if (hop.delaySeconds !== undefined) {
                    const cls = getDelayClass(hop.delaySeconds);
                    delayHtml = `<span class="eh-hop-delay ${cls}">+${formatDelay(hop.delaySeconds)}</span>`;
                }

                let timeHtml = '';
                if (hop.timestamp) {
                    timeHtml = `<div class="eh-hop-time">${escHtml(hop.timestamp.toLocaleString('de-DE'))} ${delayHtml}</div>`;
                }

                return `
                    <div class="eh-hop">
                        <div class="eh-hop-number">Hop ${i + 1}</div>
                        <div class="eh-hop-servers">${serversHtml}</div>
                        ${timeHtml}
                    </div>
                `;
            }).join('');

            routingCard.style.display = 'block';
        }

        // ===== 4. Security Analysis =====
        const securityItems = [];

        const xSpamStatus = getFirst('x-spam-status');
        if (xSpamStatus) {
            const isSpam = xSpamStatus.toLowerCase().startsWith('yes');
            securityItems.push({
                name: 'Spam-Status',
                detail: xSpamStatus,
                status: isSpam ? 'danger' : 'safe',
            });
        }

        const xSpamScore = getFirst('x-spam-score');
        if (xSpamScore) {
            const score = parseFloat(xSpamScore);
            securityItems.push({
                name: 'Spam-Score',
                detail: xSpamScore,
                status: isNaN(score) ? 'neutral' : (score >= 5 ? 'danger' : score >= 2 ? 'warning' : 'safe'),
            });
        }

        const xMailer = getFirst('x-mailer');
        if (xMailer) {
            securityItems.push({
                name: 'X-Mailer',
                detail: xMailer,
                status: 'neutral',
            });
        }

        // Sender mismatch
        const fromVal2 = getFirst('from');
        const rpVal2 = getFirst('return-path');
        if (fromVal2 && rpVal2) {
            const fromEmail2 = extractEmail(fromVal2).toLowerCase();
            const rpEmail2 = extractEmail(rpVal2).replace(/^<|>$/g, '').toLowerCase();
            if (fromEmail2 !== rpEmail2) {
                securityItems.push({
                    name: 'Absender-Abweichung',
                    detail: `From: ${fromEmail2} / Return-Path: ${rpEmail2}`,
                    status: 'warning',
                });
            }
        }

        if (securityItems.length > 0) {
            const statusIcons = {
                safe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="16 10 11 15 8 12"/></svg>',
                warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
                danger: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
                neutral: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            };

            document.getElementById('eh-security-list').innerHTML = securityItems.map(item => `
                <div class="eh-security-row">
                    <span class="eh-security-icon">${statusIcons[item.status]}</span>
                    <div class="eh-security-info">
                        <span class="eh-security-name">${escHtml(item.name)}</span>
                        <span class="eh-security-detail">${escHtml(item.detail)}</span>
                    </div>
                </div>
            `).join('');

            securityCard.style.display = 'block';
        }

        // ===== 5. Raw Headers (collapsible) =====
        const rawContent = document.getElementById('eh-raw-content');
        rawContent.textContent = raw;
        rawCard.style.display = 'block';

        const rawToggle = document.getElementById('eh-raw-toggle');
        rawToggle.onclick = () => {
            const isVisible = rawContent.style.display !== 'none';
            rawContent.style.display = isVisible ? 'none' : 'block';
            rawToggle.textContent = isVisible ? 'Alle Header anzeigen' : 'Header ausblenden';
        };
    }

    // --- Show Error ---
    function showError(msg) {
        hideResults();
        errorMsg.textContent = msg;
        errorCard.style.display = 'block';
    }

    // --- Hide All Results ---
    function hideResults() {
        authCard.style.display = 'none';
        senderCard.style.display = 'none';
        routingCard.style.display = 'none';
        securityCard.style.display = 'none';
        rawCard.style.display = 'none';
        errorCard.style.display = 'none';
    }

    // --- Event Listeners ---
    analyzeBtn.addEventListener('click', analyze);

    clearBtn.addEventListener('click', () => {
        headerInput.value = '';
        hideResults();
        headerInput.focus();
    });

    exampleBtn.addEventListener('click', () => {
        headerInput.value = EXAMPLE_HEADER;
        analyze();
    });

    // Ctrl+Enter to analyze
    headerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            analyze();
        }
    });
}

function teardown_email_header() {
    // No cleanup needed (no timers, no abort controllers)
}
