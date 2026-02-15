// === Ping/Latenz-Test Tool ===

let _pingAbortController = null;
let _pingInterval = null;

function init_ping_test(container) {
    // --- HTML Template ---
    container.innerHTML = `
        <section class="card ping-input-card">
            <label for="ping-host">Website / Host</label>
            <div class="ping-input-row">
                <input type="text" id="ping-host" placeholder="google.com" autocomplete="off" spellcheck="false">
                <button class="ping-start-btn" id="ping-start-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
            </div>

            <label class="ping-count-label">Anzahl Pings</label>
            <div class="ping-count-chips" id="ping-count-chips">
                <span class="chip ping-count-chip" data-count="5">5</span>
                <span class="chip ping-count-chip active" data-count="10">10</span>
                <span class="chip ping-count-chip" data-count="20">20</span>
                <span class="chip ping-count-chip" data-count="50">50</span>
                <span class="chip ping-count-chip" data-count="0">\u221e Dauer</span>
            </div>

            <div class="quick-examples ping-examples">
                <span class="chip" data-host="google.com">Google</span>
                <span class="chip" data-host="cloudflare.com">Cloudflare</span>
                <span class="chip" data-host="github.com">GitHub</span>
                <span class="chip" data-host="amazon.com">Amazon</span>
            </div>
        </section>

        <section class="card ping-result-card" id="ping-result-card" style="display:none;">
            <div class="ping-result-header">
                <h3 id="ping-result-host"></h3>
                <button class="ping-stop-btn" id="ping-stop-btn" style="display:none;">Stop</button>
            </div>

            <!-- Live stats -->
            <div class="ping-stats" id="ping-stats">
                <div class="ping-stat">
                    <span class="ping-stat-num" id="ping-stat-min">—</span>
                    <span class="ping-stat-label">Min</span>
                </div>
                <div class="ping-stat ping-stat-highlight">
                    <span class="ping-stat-num" id="ping-stat-avg">—</span>
                    <span class="ping-stat-label">Avg</span>
                </div>
                <div class="ping-stat">
                    <span class="ping-stat-num" id="ping-stat-max">—</span>
                    <span class="ping-stat-label">Max</span>
                </div>
                <div class="ping-stat">
                    <span class="ping-stat-num" id="ping-stat-loss">0%</span>
                    <span class="ping-stat-label">Verlust</span>
                </div>
            </div>

            <!-- Packet stats -->
            <div class="ping-pkt-stats" id="ping-pkt-stats">
                <span><strong id="ping-pkt-sent">0</strong> Gesendet</span>
                <span class="ping-pkt-sep">\u2022</span>
                <span><strong id="ping-pkt-recv">0</strong> Empfangen</span>
                <span class="ping-pkt-sep">\u2022</span>
                <span><strong id="ping-pkt-lost" style="color:var(--green)">0</strong> Verloren</span>
            </div>

            <!-- Progress -->
            <div class="ping-progress-row">
                <span class="ping-progress-text" id="ping-progress-text">0 / 10</span>
                <div class="ping-progress-bar">
                    <div class="ping-progress-fill" id="ping-progress-fill"></div>
                </div>
            </div>

            <!-- Chart -->
            <div class="ping-chart" id="ping-chart"></div>

            <!-- Log -->
            <div class="ping-log" id="ping-log"></div>

            <!-- Hint -->
            <div class="ping-hint" id="ping-hint"></div>
        </section>

        <section class="card error-card" id="ping-error-card" style="display:none;">
            <p id="ping-error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const hostInput = document.getElementById('ping-host');
    const startBtn = document.getElementById('ping-start-btn');
    const stopBtn = document.getElementById('ping-stop-btn');
    const resultCard = document.getElementById('ping-result-card');
    const errorCard = document.getElementById('ping-error-card');
    const errorMsg = document.getElementById('ping-error-msg');
    const countChips = container.querySelectorAll('.ping-count-chip');

    let pingCount = 10;
    let results = [];
    let isRunning = false;

    // --- Private/local IP detection ---
    function isPrivateHost(host) {
        // 10.x.x.x
        if (/^10\./.test(host)) return true;
        // 172.16-31.x.x
        if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return true;
        // 192.168.x.x
        if (/^192\.168\./.test(host)) return true;
        // localhost / 127.x
        if (host === 'localhost' || /^127\./.test(host)) return true;
        // link-local
        if (/^169\.254\./.test(host)) return true;
        return false;
    }

    // --- Count chips ---
    countChips.forEach(chip => {
        chip.addEventListener('click', () => {
            countChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            pingCount = parseInt(chip.dataset.count);
        });
    });

    // --- Measure latency using fetch timing ---
    async function measureLatency(url) {
        const start = performance.now();
        try {
            // Use a tiny HEAD request with cache busting
            await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store',
                signal: _pingAbortController ? _pingAbortController.signal : undefined,
            });
            const end = performance.now();
            return { time: Math.round(end - start), status: 'ok' };
        } catch (err) {
            if (err.name === 'AbortError') throw err;
            const end = performance.now();
            // no-cors mode will throw on some servers but timing is still valid
            // If it took reasonable time, consider it a response
            const elapsed = Math.round(end - start);
            if (elapsed < 10000) {
                return { time: elapsed, status: 'ok' };
            }
            return { time: null, status: 'timeout' };
        }
    }

    // --- Update stats ---
    function updateStats() {
        const successful = results.filter(r => r.status === 'ok');
        const times = successful.map(r => r.time);

        document.getElementById('ping-stat-min').textContent = times.length > 0 ? Math.min(...times) + ' ms' : '—';
        document.getElementById('ping-stat-avg').textContent = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) + ' ms' : '—';
        document.getElementById('ping-stat-max').textContent = times.length > 0 ? Math.max(...times) + ' ms' : '—';

        const lost = results.length - successful.length;
        const lossRate = results.length > 0 ? Math.round((lost / results.length) * 100) : 0;
        const lossEl = document.getElementById('ping-stat-loss');
        lossEl.textContent = lossRate + '%';
        lossEl.style.color = lossRate > 0 ? 'var(--red)' : 'var(--green)';

        // Packet counters
        document.getElementById('ping-pkt-sent').textContent = results.length;
        document.getElementById('ping-pkt-recv').textContent = successful.length;
        const pktLostEl = document.getElementById('ping-pkt-lost');
        pktLostEl.textContent = lost;
        pktLostEl.style.color = lost > 0 ? 'var(--red)' : 'var(--green)';
    }

    // --- Update chart ---
    function updateChart() {
        const chart = document.getElementById('ping-chart');
        const successful = results.filter(r => r.status === 'ok');
        if (successful.length === 0) {
            chart.innerHTML = '';
            return;
        }

        const maxTime = Math.max(...successful.map(r => r.time), 1);

        chart.innerHTML = results.map((r, i) => {
            if (r.status !== 'ok') {
                return `<div class="ping-bar ping-bar-fail" title="Ping ${i + 1}: Timeout"></div>`;
            }
            const height = Math.max(4, (r.time / maxTime) * 100);
            const color = r.time < 100 ? 'var(--green)' : r.time < 300 ? 'var(--orange)' : 'var(--red)';
            return `<div class="ping-bar" style="height:${height}%; background:${color}" title="Ping ${i + 1}: ${r.time}ms"></div>`;
        }).join('');
    }

    // --- Add log entry ---
    function addLogEntry(index, result) {
        const log = document.getElementById('ping-log');
        const entry = document.createElement('div');
        entry.className = 'ping-log-entry';

        if (result.status === 'ok') {
            const color = result.time < 100 ? 'var(--green)' : result.time < 300 ? 'var(--orange)' : 'var(--red)';
            entry.innerHTML = `
                <span class="ping-log-num">#${index + 1}</span>
                <span class="ping-log-time" style="color:${color}">${result.time} ms</span>
            `;
        } else {
            entry.innerHTML = `
                <span class="ping-log-num">#${index + 1}</span>
                <span class="ping-log-time" style="color:var(--red)">Timeout</span>
            `;
        }

        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    // --- Main Ping ---
    async function startPing() {
        let host = hostInput.value.trim().toLowerCase();
        if (!host) return;

        // Clean up input
        host = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (!host.includes('.')) {
            showError('Bitte gib eine gültige URL ein (z.B. google.com)');
            return;
        }
        hostInput.value = host;

        // Abort previous
        stopPing();
        _pingAbortController = new AbortController();

        results = [];
        isRunning = true;
        errorCard.style.display = 'none';

        document.getElementById('ping-result-host').textContent = host;
        document.getElementById('ping-log').innerHTML = '';
        document.getElementById('ping-chart').innerHTML = '';
        const isContinuous = pingCount === 0;
        document.getElementById('ping-progress-fill').style.width = '0%';
        document.getElementById('ping-progress-text').textContent = isContinuous ? '0 (Dauerping)' : `0 / ${pingCount}`;

        resultCard.style.display = 'block';
        stopBtn.style.display = 'inline-block';
        startBtn.disabled = true;

        const isLocal = isPrivateHost(host);
        const url = `https://${host}`;

        // Show hint
        const hintEl = document.getElementById('ping-hint');
        if (isLocal) {
            hintEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ' +
                '<span><strong>Lokale Adresse erkannt.</strong> Browser k\u00f6nnen keinen echten ICMP-Ping senden. ' +
                'Die Messung erfolgt per HTTP-Request und enth\u00e4lt zus\u00e4tzlichen Overhead (TCP/HTTP). ' +
                'Die Werte weichen daher deutlich von einem Konsolen-Ping ab.</span>';
        } else {
            hintEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> ' +
                '<span>Kein echter ICMP-Ping \u2014 Messung per HTTPS-Request (inkl. DNS + TLS + HTTP Overhead).</span>';
        }

        try {
            let i = 0;
            while (isContinuous ? isRunning : (i < pingCount && isRunning)) {
                const result = await measureLatency(url + '?_cb=' + Date.now());
                results.push(result);

                addLogEntry(i, result);
                updateStats();
                updateChart();

                if (isContinuous) {
                    document.getElementById('ping-progress-fill').style.width = '100%';
                    document.getElementById('ping-progress-text').textContent = `${i + 1} (Dauerping)`;
                } else {
                    const pct = Math.round(((i + 1) / pingCount) * 100);
                    document.getElementById('ping-progress-fill').style.width = pct + '%';
                    document.getElementById('ping-progress-text').textContent = `${i + 1} / ${pingCount}`;
                }

                // Wait 500ms between pings
                if (isRunning) {
                    await new Promise(resolve => {
                        _pingInterval = setTimeout(resolve, 500);
                    });
                }
                i++;
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            showError(`Fehler: ${err.message}`);
        }

        isRunning = false;
        stopBtn.style.display = 'none';
        startBtn.disabled = false;
    }

    function stopPing() {
        isRunning = false;
        if (_pingInterval) {
            clearTimeout(_pingInterval);
            _pingInterval = null;
        }
        if (_pingAbortController) {
            _pingAbortController.abort();
            _pingAbortController = null;
        }
        stopBtn.style.display = 'none';
        startBtn.disabled = false;
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorCard.style.display = 'block';
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startPing);
    stopBtn.addEventListener('click', stopPing);

    hostInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            startPing();
        }
    });

    container.querySelectorAll('.ping-examples .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            hostInput.value = chip.dataset.host;
            startPing();
        });
    });
}

function teardown_ping_test() {
    if (_pingInterval) {
        clearTimeout(_pingInterval);
        _pingInterval = null;
    }
    if (_pingAbortController) {
        _pingAbortController.abort();
        _pingAbortController = null;
    }
}
