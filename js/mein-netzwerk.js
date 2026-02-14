// === Mein Netzwerk Tool ===

let _netAbortController = null;
let _netConnectionHandler = null;

function init_mein_netzwerk(container) {
    container.innerHTML = `
        <section class="card net-status-card">
            <div class="net-status-row">
                <span class="net-status-dot" id="net-status-dot"></span>
                <span class="net-status-text" id="net-status-text">Prüfe Verbindung...</span>
            </div>
        </section>

        <section class="card net-info-card">
            <h3 class="net-section-title">Verbindung</h3>
            <div class="result-grid" id="net-connection-grid">
                <div class="result-item">
                    <span class="result-label">Typ</span>
                    <span class="result-value" id="net-type">—</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Eff. Bandbreite</span>
                    <span class="result-value" id="net-downlink">—</span>
                </div>
                <div class="result-item">
                    <span class="result-label">RTT (Round Trip)</span>
                    <span class="result-value" id="net-rtt">—</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Datensparmodus</span>
                    <span class="result-value" id="net-savedata">—</span>
                </div>
            </div>
        </section>

        <section class="card net-ip-card">
            <h3 class="net-section-title">Öffentliche IP</h3>
            <div class="net-ip-loading" id="net-ip-loading">
                <span class="net-spinner"></span>
                <span>IP wird ermittelt...</span>
            </div>
            <div class="result-grid" id="net-ip-grid" style="display:none;"></div>
        </section>

        <section class="card net-speed-card">
            <h3 class="net-section-title">Speed-Test</h3>
            <p class="net-speed-desc">Misst Download- und Upload-Geschwindigkeit über Cloudflare.</p>
            <button class="net-speed-btn" id="net-speed-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Speed-Test starten
            </button>
            <div class="net-speed-progress" id="net-speed-progress" style="display:none;">
                <div class="net-speed-bar-bg">
                    <div class="net-speed-bar-fill" id="net-speed-bar-fill"></div>
                </div>
                <span class="net-speed-status" id="net-speed-status">Lädt...</span>
            </div>
            <div class="net-speed-result" id="net-speed-result" style="display:none;">
                <div class="net-speed-dual">
                    <div class="net-speed-col">
                        <div class="net-speed-big" id="net-speed-down">—</div>
                        <div class="net-speed-unit">Mbit/s</div>
                        <div class="net-speed-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                            Download
                        </div>
                    </div>
                    <div class="net-speed-divider"></div>
                    <div class="net-speed-col">
                        <div class="net-speed-big net-speed-upload" id="net-speed-up">—</div>
                        <div class="net-speed-unit">Mbit/s</div>
                        <div class="net-speed-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                            Upload
                        </div>
                    </div>
                </div>
                <div class="net-speed-details" id="net-speed-details"></div>
            </div>
        </section>

        <section class="card net-latency-card">
            <h3 class="net-section-title">Latenz-Übersicht</h3>
            <p class="net-speed-desc">Misst die Antwortzeit zu verschiedenen Servern.</p>
            <button class="net-latency-btn" id="net-latency-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                Latenz messen
            </button>
            <div class="net-latency-results" id="net-latency-results" style="display:none;"></div>
        </section>
    `;

    // --- DOM refs ---
    const statusDot = document.getElementById('net-status-dot');
    const statusText = document.getElementById('net-status-text');

    _netAbortController = new AbortController();

    // --- Online/Offline Status ---
    function updateOnlineStatus() {
        if (navigator.onLine) {
            statusDot.className = 'net-status-dot net-online';
            statusText.textContent = 'Online';
        } else {
            statusDot.className = 'net-status-dot net-offline';
            statusText.textContent = 'Offline';
        }
    }

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // --- Connection API ---
    function updateConnectionInfo() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        if (conn) {
            // Connection type
            const typeMap = {
                'wifi': 'WiFi',
                'cellular': 'Mobilfunk',
                'ethernet': 'Ethernet',
                'bluetooth': 'Bluetooth',
                'none': 'Keine',
                'other': 'Sonstige',
                'unknown': 'Unbekannt',
            };
            const effectiveMap = {
                'slow-2g': 'Slow 2G',
                '2g': '2G',
                '3g': '3G',
                '4g': '4G / LTE+',
            };

            let typeStr = '—';
            if (conn.type && conn.type !== 'unknown') {
                typeStr = typeMap[conn.type] || conn.type;
            }
            if (conn.effectiveType) {
                const eff = effectiveMap[conn.effectiveType] || conn.effectiveType;
                if (typeStr === '—') {
                    typeStr = eff;
                } else {
                    typeStr += ` (${eff})`;
                }
            }
            document.getElementById('net-type').textContent = typeStr;

            // Downlink
            if (conn.downlink !== undefined) {
                document.getElementById('net-downlink').textContent = conn.downlink + ' Mbit/s';
            }

            // RTT
            if (conn.rtt !== undefined) {
                document.getElementById('net-rtt').textContent = conn.rtt + ' ms';
            }

            // Save data
            document.getElementById('net-savedata').textContent = conn.saveData ? 'Aktiv' : 'Aus';

            // Listen for changes
            if (conn.addEventListener) {
                _netConnectionHandler = updateConnectionInfo;
                conn.addEventListener('change', _netConnectionHandler);
            }
        } else {
            document.getElementById('net-type').textContent = 'Nicht verfügbar';
            document.getElementById('net-downlink').textContent = '—';
            document.getElementById('net-rtt').textContent = '—';
            document.getElementById('net-savedata').textContent = '—';
        }
    }

    updateConnectionInfo();

    // --- Public IP + Geolocation ---
    const IP_APIS = [
        {
            url: 'https://api.ipify.org?format=json',
            parseIP: (data) => data.ip,
        },
        {
            url: 'https://api.seeip.org/jsonip',
            parseIP: (data) => data.ip,
        },
        {
            url: 'https://api64.ipify.org?format=json',
            parseIP: (data) => data.ip,
        },
    ];

    async function loadIPInfo() {
        const loading = document.getElementById('net-ip-loading');
        const grid = document.getElementById('net-ip-grid');

        try {
            // Try multiple IP APIs with fallback
            let ip = null;
            for (const api of IP_APIS) {
                try {
                    const res = await fetch(api.url, {
                        signal: _netAbortController.signal,
                        cache: 'no-store',
                    });
                    if (!res.ok) continue;
                    const data = await res.json();
                    ip = api.parseIP(data);
                    if (ip) break;
                } catch (e) {
                    if (e.name === 'AbortError') throw e;
                    // Try next API
                }
            }

            if (!ip) throw new Error('Keine IP-API erreichbar');

            // Get geolocation
            let geo = {};
            try {
                const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
                    signal: _netAbortController.signal,
                    cache: 'no-store',
                });
                if (geoRes.ok) {
                    geo = await geoRes.json();
                    // ipapi.co rate limit returns { error: true }
                    if (geo.error) geo = {};
                }
            } catch (e) {
                if (e.name === 'AbortError') throw e;
                // Geolocation optional — continue without it
            }

            loading.style.display = 'none';
            grid.style.display = 'grid';

            grid.innerHTML = `
                <div class="result-item full-width">
                    <span class="result-label">IPv4-Adresse</span>
                    <span class="result-value">${ip}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Land</span>
                    <span class="result-value">${geo.country_name || '—'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Stadt</span>
                    <span class="result-value">${geo.city || '—'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">ISP</span>
                    <span class="result-value">${geo.org || '—'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">ASN</span>
                    <span class="result-value">${geo.asn || '—'}</span>
                </div>
            `;
        } catch (err) {
            if (err.name === 'AbortError') return;
            loading.innerHTML = `<span style="color:var(--red)">IP konnte nicht ermittelt werden</span>`;
        }
    }

    loadIPInfo();

    // --- Speed Test ---
    const speedBtn = document.getElementById('net-speed-btn');
    const speedProgress = document.getElementById('net-speed-progress');
    const speedResult = document.getElementById('net-speed-result');

    // Upload test endpoints (try multiple, use first that works)
    const UPLOAD_ENDPOINTS = [
        'https://httpbin.org/post',
        'https://postman-echo.com/post',
    ];

    async function testUploadEndpoint(url, signal) {
        const tiny = new Uint8Array(1024);
        const res = await fetch(url, {
            method: 'POST',
            body: tiny,
            cache: 'no-store',
            signal,
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        // Consume response to complete the request
        await res.text();
        return url;
    }

    async function runSpeedTest() {
        speedBtn.disabled = true;
        speedBtn.textContent = 'Läuft...';
        speedProgress.style.display = 'block';
        speedResult.style.display = 'none';

        const fill = document.getElementById('net-speed-bar-fill');
        const status = document.getElementById('net-speed-status');

        // Reset progress bar (in case previous run had error)
        fill.style.width = '0%';
        fill.style.background = '';

        // --- Download Tests ---
        const downTests = [
            { url: 'https://speed.cloudflare.com/__down?bytes=500000', bytes: 500000, label: 'Download 1/3 (500 KB)' },
            { url: 'https://speed.cloudflare.com/__down?bytes=1000000', bytes: 1000000, label: 'Download 2/3 (1 MB)' },
            { url: 'https://speed.cloudflare.com/__down?bytes=2000000', bytes: 2000000, label: 'Download 3/3 (2 MB)' },
        ];

        // --- Upload Tests ---
        const upTests = [
            { bytes: 250000, label: 'Upload 1/3 (250 KB)' },
            { bytes: 500000, label: 'Upload 2/3 (500 KB)' },
            { bytes: 1000000, label: 'Upload 3/3 (1 MB)' },
        ];

        const totalSteps = downTests.length + upTests.length;
        const downSpeeds = [];
        const upSpeeds = [];
        let uploadUrl = null;

        try {
            // --- Run Download ---
            for (let i = 0; i < downTests.length; i++) {
                const test = downTests[i];
                status.textContent = test.label;
                fill.style.width = ((i / totalSteps) * 100) + '%';

                const start = performance.now();
                const res = await fetch(test.url + '&_cb=' + Date.now(), {
                    cache: 'no-store',
                    signal: _netAbortController.signal,
                });
                await res.arrayBuffer();
                const end = performance.now();

                const durationSec = (end - start) / 1000;
                const mbps = (test.bytes * 8 / durationSec) / 1000000;
                downSpeeds.push(mbps);
            }

            // --- Find working upload endpoint ---
            status.textContent = 'Upload wird vorbereitet...';
            fill.style.width = ((downTests.length / totalSteps) * 100) + '%';

            for (const ep of UPLOAD_ENDPOINTS) {
                try {
                    uploadUrl = await testUploadEndpoint(ep, _netAbortController.signal);
                    break;
                } catch { /* try next */ }
            }

            if (!uploadUrl) {
                throw new Error('NO_UPLOAD_ENDPOINT');
            }

            // --- Run Upload ---
            for (let i = 0; i < upTests.length; i++) {
                const test = upTests[i];
                const step = downTests.length + i;
                status.textContent = test.label;
                fill.style.width = ((step / totalSteps) * 100) + '%';

                // Generate random data for upload
                const data = new Uint8Array(test.bytes);
                crypto.getRandomValues(data);
                const blob = new Blob([data], { type: 'application/octet-stream' });

                const start = performance.now();
                const res = await fetch(uploadUrl, {
                    method: 'POST',
                    body: blob,
                    cache: 'no-store',
                    signal: _netAbortController.signal,
                });
                await res.text(); // Consume response
                const end = performance.now();

                const durationSec = (end - start) / 1000;
                const mbps = (test.bytes * 8 / durationSec) / 1000000;
                upSpeeds.push(mbps);
            }

            fill.style.width = '100%';
            status.textContent = 'Fertig!';

            // Average (skip first warmup test for accuracy)
            const avgDown = downSpeeds.slice(1).reduce((s, v) => s + v, 0) / (downSpeeds.length - 1);
            const avgUp = upSpeeds.slice(1).reduce((s, v) => s + v, 0) / (upSpeeds.length - 1);
            const peakDown = Math.max(...downSpeeds);
            const peakUp = Math.max(...upSpeeds);

            setTimeout(() => {
                speedProgress.style.display = 'none';
                speedResult.style.display = 'block';
                document.getElementById('net-speed-down').textContent = avgDown.toFixed(1);
                document.getElementById('net-speed-up').textContent = avgUp.toFixed(1);
                document.getElementById('net-speed-details').innerHTML = `
                    <span>↓ Peak: ${peakDown.toFixed(1)} Mbit/s</span>
                    <span>↑ Peak: ${peakUp.toFixed(1)} Mbit/s</span>
                `;
            }, 500);

        } catch (err) {
            if (err.name === 'AbortError') return;

            // If upload failed but download worked, show partial results
            if (downSpeeds.length >= 2) {
                const avgDown = downSpeeds.slice(1).reduce((s, v) => s + v, 0) / (downSpeeds.length - 1);
                const peakDown = Math.max(...downSpeeds);

                fill.style.width = '100%';
                setTimeout(() => {
                    speedProgress.style.display = 'none';
                    speedResult.style.display = 'block';
                    document.getElementById('net-speed-down').textContent = avgDown.toFixed(1);
                    document.getElementById('net-speed-up').textContent = '—';
                    document.getElementById('net-speed-details').innerHTML = `
                        <span>↓ Peak: ${peakDown.toFixed(1)} Mbit/s</span>
                        <span style="color:var(--orange)">Upload nicht verfügbar</span>
                    `;
                }, 300);
            } else {
                status.textContent = 'Fehler: ' + (err.message || 'Netzwerk nicht erreichbar');
                fill.style.background = 'var(--red)';
            }
        }

        speedBtn.disabled = false;
        speedBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            Erneut testen
        `;
    }

    speedBtn.addEventListener('click', runSpeedTest);

    // --- Latency Test ---
    const latencyBtn = document.getElementById('net-latency-btn');
    const latencyResults = document.getElementById('net-latency-results');

    const LATENCY_TARGETS = [
        { name: 'Cloudflare', host: 'https://1.1.1.1' },
        { name: 'Google', host: 'https://www.google.com' },
        { name: 'Amazon AWS', host: 'https://aws.amazon.com' },
        { name: 'GitHub', host: 'https://github.com' },
        { name: 'Cloudflare CDN', host: 'https://cdnjs.cloudflare.com' },
    ];

    async function runLatencyTest() {
        latencyBtn.disabled = true;
        latencyBtn.textContent = 'Messe...';
        latencyResults.style.display = 'block';
        latencyResults.innerHTML = '';

        for (const target of LATENCY_TARGETS) {
            const row = document.createElement('div');
            row.className = 'net-latency-row';
            row.innerHTML = `
                <span class="net-latency-name">${target.name}</span>
                <span class="net-latency-value"><span class="net-spinner-sm"></span></span>
            `;
            latencyResults.appendChild(row);

            // Measure 3 pings, take median
            const times = [];
            for (let i = 0; i < 3; i++) {
                try {
                    const start = performance.now();
                    await fetch(target.host + '/favicon.ico?_cb=' + Date.now(), {
                        mode: 'no-cors',
                        cache: 'no-store',
                        signal: _netAbortController.signal,
                    });
                    times.push(Math.round(performance.now() - start));
                } catch (err) {
                    if (err.name === 'AbortError') return;
                    const elapsed = Math.round(performance.now() - performance.now());
                    times.push(null);
                }
                // Small delay between pings
                await new Promise(r => setTimeout(r, 200));
            }

            const validTimes = times.filter(t => t !== null);
            if (validTimes.length > 0) {
                validTimes.sort((a, b) => a - b);
                const median = validTimes[Math.floor(validTimes.length / 2)];
                const color = median < 50 ? 'var(--green)' : median < 150 ? 'var(--orange)' : 'var(--red)';
                const bar = Math.min(100, (median / 300) * 100);
                row.querySelector('.net-latency-value').innerHTML = `
                    <div class="net-latency-bar-bg">
                        <div class="net-latency-bar-fill" style="width:${bar}%; background:${color}"></div>
                    </div>
                    <span style="color:${color}">${median} ms</span>
                `;
            } else {
                row.querySelector('.net-latency-value').innerHTML = `<span style="color:var(--red)">Timeout</span>`;
            }
        }

        latencyBtn.disabled = false;
        latencyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            Erneut messen
        `;
    }

    latencyBtn.addEventListener('click', runLatencyTest);
}

function teardown_mein_netzwerk() {
    if (_netAbortController) {
        _netAbortController.abort();
        _netAbortController = null;
    }
    if (_netConnectionHandler) {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn && conn.removeEventListener) {
            conn.removeEventListener('change', _netConnectionHandler);
        }
        _netConnectionHandler = null;
    }
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});
}
