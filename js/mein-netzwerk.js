// === Mein Netzwerk Tool ===

let _netAbortController = null;
let _netConnectionHandler = null;

function init_mein_netzwerk(container) {
    // --- i18n Strings ---
    I18N.register('net', {
        de: {
            'checking':     'Pr\u00fcfe Verbindung...',
            'online':       'Online',
            'offline':      'Offline',
            'connection':   'Verbindung',
            'type':         'Typ',
            'bandwidth':    'Bandbreite (API)',
            'rtt':          'RTT (Round Trip)',
            'saveData':     'Datensparmodus',
            'active':       'Aktiv',
            'off':          'Aus',
            'wifi':         'WiFi',
            'cellular':     'Mobilfunk',
            'ethernet':     'Ethernet',
            'bluetooth':    'Bluetooth',
            'none':         'Keine',
            'other':        'Sonstige',
            'unknown':      'Unbekannt',
            'wired':        'Kabelgebunden',
            'fast':         'Schnell',
            'medium':       'Mittel',
            'slow':         'Langsam',
            'wifiMobile':   'WiFi / Mobil',
            'connected':    'Verbunden',
            'seeSpeed':     '\u2192 Speed-Test',
            'seeLatency':   '\u2192 Latenz-Test',
            'publicIp':     '\u00d6ffentliche IP',
            'ipLoading':    'IP wird ermittelt...',
            'ipv4':         'IPv4-Adresse',
            'country':      'Land',
            'city':         'Stadt',
            'isp':          'ISP',
            'asn':          'ASN',
            'ipError':      'IP konnte nicht ermittelt werden',
            'ipApiError':   'Keine IP-API erreichbar',
            'speedTitle':   'Speed-Test',
            'speedDesc':    'Misst Download- und Upload-Geschwindigkeit \u00fcber Cloudflare.',
            'speedStart':   'Speed-Test starten',
            'speedRunning': 'L\u00e4uft...',
            'speedDone':    'Fertig!',
            'speedRetest':  'Erneut testen',
            'speedError':   'Fehler: {msg}',
            'speedNetError':'Netzwerk nicht erreichbar',
            'uploadNA':     'Upload nicht verf\u00fcgbar',
            'down14':       'Download 1/4 \u2013 Aufw\u00e4rmen',
            'down24':       'Download 2/4 \u2013 Messen',
            'down34':       'Download 3/4 \u2013 Messen',
            'down44':       'Download 4/4 \u2013 Maximum',
            'up13':         'Upload 1/3 \u2013 Aufw\u00e4rmen',
            'up23':         'Upload 2/3 \u2013 Messen',
            'up33':         'Upload 3/3 \u2013 Maximum',
            'latencyTitle': 'Latenz-\u00dcbersicht',
            'latencyDesc':  'Misst die Antwortzeit zu verschiedenen Servern.',
            'latencyStart': 'Latenz messen',
            'latencyRun':   'Messe...',
            'latencyRetest':'Erneut messen',
            'timeout':      'Timeout',
        },
        en: {
            'checking':     'Checking connection...',
            'online':       'Online',
            'offline':      'Offline',
            'connection':   'Connection',
            'type':         'Type',
            'bandwidth':    'Bandwidth (API)',
            'rtt':          'RTT (Round Trip)',
            'saveData':     'Data Saver',
            'active':       'Active',
            'off':          'Off',
            'wifi':         'WiFi',
            'cellular':     'Cellular',
            'ethernet':     'Ethernet',
            'bluetooth':    'Bluetooth',
            'none':         'None',
            'other':        'Other',
            'unknown':      'Unknown',
            'wired':        'Wired',
            'fast':         'Fast',
            'medium':       'Medium',
            'slow':         'Slow',
            'wifiMobile':   'WiFi / Mobile',
            'connected':    'Connected',
            'seeSpeed':     '\u2192 Speed Test',
            'seeLatency':   '\u2192 Latency Test',
            'publicIp':     'Public IP',
            'ipLoading':    'Detecting IP...',
            'ipv4':         'IPv4 Address',
            'country':      'Country',
            'city':         'City',
            'isp':          'ISP',
            'asn':          'ASN',
            'ipError':      'Could not detect IP',
            'ipApiError':   'No IP API reachable',
            'speedTitle':   'Speed Test',
            'speedDesc':    'Measures download and upload speed via Cloudflare.',
            'speedStart':   'Start Speed Test',
            'speedRunning': 'Running...',
            'speedDone':    'Done!',
            'speedRetest':  'Test again',
            'speedError':   'Error: {msg}',
            'speedNetError':'Network unreachable',
            'uploadNA':     'Upload not available',
            'down14':       'Download 1/4 \u2013 Warmup',
            'down24':       'Download 2/4 \u2013 Measuring',
            'down34':       'Download 3/4 \u2013 Measuring',
            'down44':       'Download 4/4 \u2013 Maximum',
            'up13':         'Upload 1/3 \u2013 Warmup',
            'up23':         'Upload 2/3 \u2013 Measuring',
            'up33':         'Upload 3/3 \u2013 Maximum',
            'latencyTitle': 'Latency Overview',
            'latencyDesc':  'Measures response time to various servers.',
            'latencyStart': 'Measure latency',
            'latencyRun':   'Measuring...',
            'latencyRetest':'Measure again',
            'timeout':      'Timeout',
        }
    });

    container.innerHTML = `
        <section class="card net-status-card">
            <div class="net-status-row">
                <span class="net-status-dot" id="net-status-dot"></span>
                <span class="net-status-text" id="net-status-text">${t('net.checking')}</span>
            </div>
        </section>

        <section class="card net-info-card">
            <h3 class="net-section-title">${t('net.connection')}</h3>
            <div class="result-grid" id="net-connection-grid">
                <div class="result-item">
                    <span class="result-label">${t('net.type')}</span>
                    <span class="result-value" id="net-type">\u2014</span>
                </div>
                <div class="result-item">
                    <span class="result-label">${t('net.bandwidth')}</span>
                    <span class="result-value" id="net-downlink">\u2014</span>
                </div>
                <div class="result-item">
                    <span class="result-label">${t('net.rtt')}</span>
                    <span class="result-value" id="net-rtt">\u2014</span>
                </div>
                <div class="result-item">
                    <span class="result-label">${t('net.saveData')}</span>
                    <span class="result-value" id="net-savedata">\u2014</span>
                </div>
            </div>
        </section>

        <section class="card net-ip-card">
            <h3 class="net-section-title">${t('net.publicIp')}</h3>
            <div class="net-ip-loading" id="net-ip-loading">
                <span class="net-spinner"></span>
                <span>${t('net.ipLoading')}</span>
            </div>
            <div class="result-grid" id="net-ip-grid" style="display:none;"></div>
        </section>

        <section class="card net-speed-card">
            <h3 class="net-section-title">${t('net.speedTitle')}</h3>
            <p class="net-speed-desc">${t('net.speedDesc')}</p>
            <button class="net-speed-btn" id="net-speed-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                ${t('net.speedStart')}
            </button>
            <div class="net-speed-progress" id="net-speed-progress" style="display:none;">
                <div class="net-speed-bar-bg">
                    <div class="net-speed-bar-fill" id="net-speed-bar-fill"></div>
                </div>
                <span class="net-speed-status" id="net-speed-status"></span>
            </div>
            <div class="net-speed-result" id="net-speed-result" style="display:none;">
                <div class="net-speed-dual">
                    <div class="net-speed-col">
                        <div class="net-speed-big" id="net-speed-down">\u2014</div>
                        <div class="net-speed-unit">Mbit/s</div>
                        <div class="net-speed-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                            Download
                        </div>
                    </div>
                    <div class="net-speed-divider"></div>
                    <div class="net-speed-col">
                        <div class="net-speed-big net-speed-upload" id="net-speed-up">\u2014</div>
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
            <h3 class="net-section-title">${t('net.latencyTitle')}</h3>
            <p class="net-speed-desc">${t('net.latencyDesc')}</p>
            <button class="net-latency-btn" id="net-latency-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                ${t('net.latencyStart')}
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
            statusText.textContent = t('net.online');
        } else {
            statusDot.className = 'net-status-dot net-offline';
            statusText.textContent = t('net.offline');
        }
    }

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // --- Connection API ---
    function updateConnectionInfo() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        if (conn) {
            const typeMap = {
                'wifi': t('net.wifi'),
                'cellular': t('net.cellular'),
                'ethernet': t('net.ethernet'),
                'bluetooth': t('net.bluetooth'),
                'none': t('net.none'),
                'other': t('net.other'),
                'unknown': t('net.unknown'),
            };

            let typeStr = '\u2014';

            if (conn.type && conn.type !== 'unknown') {
                typeStr = typeMap[conn.type] || conn.type;
            } else if (conn.effectiveType) {
                if (conn.effectiveType === '4g') {
                    typeStr = conn.downlink >= 10 ? t('net.wired') : t('net.fast');
                } else if (conn.effectiveType === '3g') {
                    typeStr = t('net.medium');
                } else {
                    typeStr = t('net.slow');
                }
            }

            if (conn.type === 'cellular' && conn.effectiveType) {
                const cellMap = { 'slow-2g': '2G', '2g': '2G', '3g': '3G', '4g': 'LTE' };
                typeStr += ` (${cellMap[conn.effectiveType] || conn.effectiveType})`;
            }

            document.getElementById('net-type').textContent = typeStr;

            if (conn.downlink !== undefined) {
                const dlText = conn.downlink >= 10
                    ? '\u2265 10 Mbit/s'
                    : conn.downlink + ' Mbit/s';
                document.getElementById('net-downlink').textContent = dlText;
            }

            if (conn.rtt !== undefined) {
                document.getElementById('net-rtt').textContent = conn.rtt + ' ms';
            }

            document.getElementById('net-savedata').textContent = conn.saveData ? t('net.active') : t('net.off');

            if (conn.addEventListener) {
                _netConnectionHandler = updateConnectionInfo;
                conn.addEventListener('change', _netConnectionHandler);
            }
        } else {
            const ua = navigator.userAgent;
            const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
            const isOnline = navigator.onLine;

            if (isOnline) {
                document.getElementById('net-type').textContent = isMobile ? t('net.wifiMobile') : t('net.connected');
            } else {
                document.getElementById('net-type').textContent = t('net.offline');
            }
            document.getElementById('net-downlink').textContent = t('net.seeSpeed');
            document.getElementById('net-rtt').textContent = t('net.seeLatency');
            document.getElementById('net-savedata').textContent = '\u2014';
        }
    }

    updateConnectionInfo();

    // --- Public IP + Geolocation ---
    const IP_APIS = [
        { url: 'https://api.ipify.org?format=json', parseIP: (data) => data.ip },
        { url: 'https://api.seeip.org/jsonip', parseIP: (data) => data.ip },
        { url: 'https://api64.ipify.org?format=json', parseIP: (data) => data.ip },
    ];

    async function loadIPInfo() {
        const loading = document.getElementById('net-ip-loading');
        const grid = document.getElementById('net-ip-grid');

        try {
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
                }
            }

            if (!ip) throw new Error(t('net.ipApiError'));

            let geo = {};
            try {
                const geoRes = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
                    signal: _netAbortController.signal,
                    cache: 'no-store',
                });
                if (geoRes.ok) {
                    geo = await geoRes.json();
                    if (geo.error) geo = {};
                }
            } catch (e) {
                if (e.name === 'AbortError') throw e;
            }

            loading.style.display = 'none';
            grid.style.display = 'grid';

            grid.innerHTML = `
                <div class="result-item full-width">
                    <span class="result-label">${t('net.ipv4')}</span>
                    <span class="result-value">${escHtml(ip)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">${t('net.country')}</span>
                    <span class="result-value">${escHtml(geo.country_name || '\u2014')}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">${t('net.city')}</span>
                    <span class="result-value">${escHtml(geo.city || '\u2014')}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">${t('net.isp')}</span>
                    <span class="result-value">${escHtml(geo.org || '\u2014')}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">${t('net.asn')}</span>
                    <span class="result-value">${escHtml(geo.asn || '\u2014')}</span>
                </div>
            `;
        } catch (err) {
            if (err.name === 'AbortError') return;
            loading.innerHTML = `<span style="color:var(--red)">${t('net.ipError')}</span>`;
        }
    }

    loadIPInfo();

    // --- Speed Test ---
    const speedBtn = document.getElementById('net-speed-btn');
    const speedProgress = document.getElementById('net-speed-progress');
    const speedResult = document.getElementById('net-speed-result');

    function generateRandomData(bytes) {
        const data = new Uint8Array(bytes);
        const chunk = 65536;
        for (let i = 0; i < bytes; i += chunk) {
            crypto.getRandomValues(data.subarray(i, i + Math.min(chunk, bytes - i)));
        }
        return data;
    }

    async function measureDownloadParallel(bytesPerStream, streams, signal) {
        const urls = Array.from({ length: streams }, (_, i) =>
            `https://speed.cloudflare.com/__down?bytes=${bytesPerStream}&_cb=${Date.now()}_${i}`
        );
        const totalBytes = bytesPerStream * streams;
        const start = performance.now();
        await Promise.all(urls.map(url =>
            fetch(url, { cache: 'no-store', signal }).then(r => r.arrayBuffer())
        ));
        const ms = performance.now() - start;
        return (totalBytes * 8) / (ms / 1000) / 1e6;
    }

    async function measureUploadParallel(bytesPerStream, streams, signal) {
        const blobs = Array.from({ length: streams }, () =>
            new Blob([generateRandomData(bytesPerStream)])
        );
        const totalBytes = bytesPerStream * streams;
        const start = performance.now();
        await Promise.all(blobs.map(blob =>
            fetch('https://speed.cloudflare.com/__up', {
                method: 'POST',
                body: blob,
                signal,
            }).then(r => { try { r.text(); } catch {} })
        ));
        const ms = performance.now() - start;
        return (totalBytes * 8) / (ms / 1000) / 1e6;
    }

    async function runSpeedTest() {
        speedBtn.disabled = true;
        speedBtn.textContent = t('net.speedRunning');
        speedProgress.style.display = 'block';
        speedResult.style.display = 'none';

        const fill = document.getElementById('net-speed-bar-fill');
        const status = document.getElementById('net-speed-status');
        fill.style.width = '0%';
        fill.style.background = '';

        const downRounds = [
            { bytesPerStream: 5e6,  streams: 6,  label: t('net.down14') },
            { bytesPerStream: 10e6, streams: 12, label: t('net.down24') },
            { bytesPerStream: 10e6, streams: 16, label: t('net.down34') },
            { bytesPerStream: 10e6, streams: 16, label: t('net.down44') },
        ];

        const upRounds = [
            { bytesPerStream: 1e6, streams: 4, label: t('net.up13') },
            { bytesPerStream: 2e6, streams: 6, label: t('net.up23') },
            { bytesPerStream: 2e6, streams: 8, label: t('net.up33') },
        ];
        const totalSteps = downRounds.length + upRounds.length;
        const downSpeeds = [];
        const upSpeeds = [];
        let uploadWorks = true;

        try {
            for (let i = 0; i < downRounds.length; i++) {
                const round = downRounds[i];
                status.textContent = round.label;
                fill.style.width = ((i / totalSteps) * 100) + '%';

                const mbps = await measureDownloadParallel(
                    round.bytesPerStream, round.streams, _netAbortController.signal
                );
                downSpeeds.push(mbps);
            }

            for (let i = 0; i < upRounds.length; i++) {
                const round = upRounds[i];
                const step = downRounds.length + i;
                status.textContent = round.label;
                fill.style.width = ((step / totalSteps) * 100) + '%';

                try {
                    const mbps = await measureUploadParallel(
                        round.bytesPerStream, round.streams, _netAbortController.signal
                    );
                    upSpeeds.push(mbps);
                } catch (e) {
                    if (e.name === 'AbortError') throw e;
                    uploadWorks = false;
                    break;
                }
            }

            fill.style.width = '100%';
            status.textContent = t('net.speedDone');

            const measured = downSpeeds.slice(1);
            const avgDown = measured.reduce((s, v) => s + v, 0) / measured.length;
            const peakDown = Math.max(...downSpeeds);

            let avgUp = 0, peakUp = 0;
            if (upSpeeds.length > 1) {
                avgUp = upSpeeds.slice(1).reduce((s, v) => s + v, 0) / (upSpeeds.length - 1);
                peakUp = Math.max(...upSpeeds);
            } else if (upSpeeds.length === 1) {
                avgUp = upSpeeds[0];
                peakUp = upSpeeds[0];
            }

            setTimeout(() => {
                speedProgress.style.display = 'none';
                speedResult.style.display = 'block';
                document.getElementById('net-speed-down').textContent = avgDown.toFixed(1);

                if (uploadWorks && upSpeeds.length > 0) {
                    document.getElementById('net-speed-up').textContent = avgUp.toFixed(1);
                    document.getElementById('net-speed-details').innerHTML = `
                        <span>\u2193 Peak: ${peakDown.toFixed(1)} Mbit/s</span>
                        <span>\u2191 Peak: ${peakUp.toFixed(1)} Mbit/s</span>
                    `;
                } else {
                    document.getElementById('net-speed-up').textContent = '\u2014';
                    document.getElementById('net-speed-details').innerHTML = `
                        <span>\u2193 Peak: ${peakDown.toFixed(1)} Mbit/s</span>
                        <span style="color:var(--orange)">${t('net.uploadNA')}</span>
                    `;
                }
            }, 400);

        } catch (err) {
            if (err.name === 'AbortError') return;

            if (downSpeeds.length >= 2) {
                const avgDown = downSpeeds.slice(1).reduce((s, v) => s + v, 0) / (downSpeeds.length - 1);
                const peakDown = Math.max(...downSpeeds);
                fill.style.width = '100%';
                setTimeout(() => {
                    speedProgress.style.display = 'none';
                    speedResult.style.display = 'block';
                    document.getElementById('net-speed-down').textContent = avgDown.toFixed(1);
                    document.getElementById('net-speed-up').textContent = '\u2014';
                    document.getElementById('net-speed-details').innerHTML = `
                        <span>\u2193 Peak: ${peakDown.toFixed(1)} Mbit/s</span>
                        <span style="color:var(--orange)">${t('net.uploadNA')}</span>
                    `;
                }, 300);
            } else {
                status.textContent = t('net.speedError', { msg: err.message || t('net.speedNetError') });
                fill.style.background = 'var(--red)';
            }
        }

        speedBtn.disabled = false;
        speedBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            ${t('net.speedRetest')}
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
        latencyBtn.textContent = t('net.latencyRun');
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
                    times.push(null);
                }
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
                row.querySelector('.net-latency-value').innerHTML = `<span style="color:var(--red)">${t('net.timeout')}</span>`;
            }
        }

        latencyBtn.disabled = false;
        latencyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            ${t('net.latencyRetest')}
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
