// === IP-Rechner Tool ===

let _ipRechnerGeoAbort = null;

function init_ip_rechner(container) {
    // --- HTML Template ---
    container.innerHTML = `
        <section class="card input-card">
            <label for="ip-input">IP-Adresse</label>
            <input type="text" id="ip-input" inputmode="decimal" placeholder="192.168.1.0" autocomplete="off">

            <label for="cidr-select">Subnetzmaske / CIDR</label>
            <select id="cidr-select"></select>

            <button class="my-ip-btn" id="my-ip-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Meine IP-Adresse
            </button>

            <label class="quick-examples-label">Beispiele</label>
            <div class="quick-examples">
                <span class="chip" data-ip="192.168.1.0" data-cidr="24">/24 Heim</span>
                <span class="chip" data-ip="10.0.0.0" data-cidr="8">Klasse A</span>
                <span class="chip" data-ip="172.16.0.0" data-cidr="12">Klasse B priv.</span>
                <span class="chip" data-ip="8.8.8.0" data-cidr="24">Google DNS</span>
            </div>
        </section>

        <section class="card result-card" id="result-card" style="display:none;">
            <div class="ip-type-badge" id="ip-type-badge"></div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Netzadresse</span>
                    <span class="result-value" id="res-network"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">Broadcast</span>
                    <span class="result-value" id="res-broadcast"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">Erster Host</span>
                    <span class="result-value" id="res-first-host"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">Letzter Host</span>
                    <span class="result-value" id="res-last-host"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">Anzahl Hosts</span>
                    <span class="result-value" id="res-host-count"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">Subnetzmaske</span>
                    <span class="result-value" id="res-subnet-mask"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">Wildcard-Maske</span>
                    <span class="result-value" id="res-wildcard"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">IP-Klasse</span>
                    <span class="result-value" id="res-class"></span>
                </div>
            </div>
            <div class="binary-section">
                <h3>Binärdarstellung</h3>
                <div class="binary-row">
                    <span class="binary-label">IP</span>
                    <span class="binary-value" id="bin-ip"></span>
                </div>
                <div class="binary-row">
                    <span class="binary-label">Maske</span>
                    <span class="binary-value" id="bin-mask"></span>
                </div>
                <div class="binary-row">
                    <span class="binary-label">Netz</span>
                    <span class="binary-value" id="bin-network"></span>
                </div>
            </div>
        </section>

        <section class="card viz-card" id="viz-card" style="display:none;">
            <h3 class="viz-title">Subnetz-Visualisierung</h3>
            <div class="viz-bar-container">
                <div class="viz-bar">
                    <div class="viz-segment viz-net" id="viz-net"><span class="viz-seg-label">Netz</span></div>
                    <div class="viz-segment viz-first" id="viz-first"><span class="viz-seg-label">1. Host</span></div>
                    <div class="viz-segment viz-hosts" id="viz-hosts"><span class="viz-seg-label" id="viz-hosts-label">Hosts</span></div>
                    <div class="viz-segment viz-last" id="viz-last"><span class="viz-seg-label">Letzter</span></div>
                    <div class="viz-segment viz-broadcast" id="viz-broadcast"><span class="viz-seg-label">BC</span></div>
                </div>
            </div>
            <div class="viz-addresses">
                <span class="viz-addr" id="viz-addr-start"></span>
                <span class="viz-addr" id="viz-addr-end"></span>
            </div>
            <div class="viz-legend">
                <span class="viz-legend-item"><span class="viz-dot viz-dot-net"></span>Netzadresse</span>
                <span class="viz-legend-item"><span class="viz-dot viz-dot-hosts"></span>Nutzbare Hosts</span>
                <span class="viz-legend-item"><span class="viz-dot viz-dot-bc"></span>Broadcast</span>
            </div>
            <div class="viz-bits-section">
                <div class="viz-bits-label">32 Bits</div>
                <div class="viz-bits-bar">
                    <div class="viz-bits-net" id="viz-bits-net"><span id="viz-bits-net-label"></span></div>
                    <div class="viz-bits-host" id="viz-bits-host"><span id="viz-bits-host-label"></span></div>
                </div>
                <div class="viz-bits-labels">
                    <span>Netz-Bits</span>
                    <span>Host-Bits</span>
                </div>
            </div>
        </section>

        <section class="card geo-card" id="geo-card" style="display:none;">
            <div class="geo-header">
                <h3>Standort</h3>
                <span class="geo-loading" id="geo-loading">Suche...</span>
            </div>
            <div class="geo-content" id="geo-content">
                <div class="geo-flag" id="geo-flag"></div>
                <div class="result-grid">
                    <div class="result-item">
                        <span class="result-label">Land</span>
                        <span class="result-value" id="geo-country"></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Region</span>
                        <span class="result-value" id="geo-region"></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Stadt</span>
                        <span class="result-value" id="geo-city"></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Postleitzahl</span>
                        <span class="result-value" id="geo-zip"></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Zeitzone</span>
                        <span class="result-value" id="geo-timezone"></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">ISP</span>
                        <span class="result-value" id="geo-isp"></span>
                    </div>
                    <div class="result-item full-width">
                        <span class="result-label">Koordinaten</span>
                        <span class="result-value" id="geo-coords"></span>
                    </div>
                </div>
                <a class="map-link" id="geo-map-link" href="#" target="_blank" rel="noopener">Auf Karte anzeigen</a>
            </div>
            <div class="geo-error" id="geo-error" style="display:none;">
                <p id="geo-error-msg"></p>
            </div>
        </section>

        <section class="card error-card" id="error-card" style="display:none;">
            <p id="error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const ipInput = document.getElementById('ip-input');
    const cidrSelect = document.getElementById('cidr-select');
    const resultCard = document.getElementById('result-card');
    const errorCard = document.getElementById('error-card');
    const errorMsg = document.getElementById('error-msg');
    const geoCard = document.getElementById('geo-card');
    const geoLoading = document.getElementById('geo-loading');
    const geoContent = document.getElementById('geo-content');
    const geoError = document.getElementById('geo-error');
    const geoErrorMsg = document.getElementById('geo-error-msg');
    const myIpBtn = document.getElementById('my-ip-btn');

    let lastGeoIP = null;

    // --- Populate CIDR dropdown ---
    function populateCIDR() {
        for (let i = 0; i <= 32; i++) {
            const mask = cidrToMask(i);
            const hosts = i <= 30 ? (Math.pow(2, 32 - i) - 2) : (i === 31 ? 2 : 1);
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `/${i}  —  ${mask}  —  ${hosts.toLocaleString('de-DE')} Hosts`;
            if (i === 24) opt.selected = true;
            cidrSelect.appendChild(opt);
        }
    }

    // --- Conversion helpers ---
    function cidrToMask(cidr) {
        const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
        return intToIP(mask);
    }

    function intToIP(int) {
        return [
            (int >>> 24) & 255,
            (int >>> 16) & 255,
            (int >>> 8) & 255,
            int & 255
        ].join('.');
    }

    function ipToInt(ip) {
        const parts = ip.split('.').map(Number);
        return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    }

    function intToBinary(int) {
        return int.toString(2).padStart(32, '0');
    }

    // --- Validation ---
    function validateIP(ip) {
        const parts = ip.trim().split('.');
        if (parts.length !== 4) return false;
        return parts.every(p => {
            const n = Number(p);
            return p !== '' && !isNaN(n) && n >= 0 && n <= 255 && String(n) === p.trim();
        });
    }

    // --- IP Classification ---
    function classifyIP(ipInt) {
        const first = (ipInt >>> 24) & 255;
        const second = (ipInt >>> 16) & 255;

        if (first === 10) return { type: 'private', label: 'Privat (RFC 1918)', detail: '10.0.0.0/8' };
        if (first === 172 && second >= 16 && second <= 31) return { type: 'private', label: 'Privat (RFC 1918)', detail: '172.16.0.0/12' };
        if (first === 192 && second === 168) return { type: 'private', label: 'Privat (RFC 1918)', detail: '192.168.0.0/16' };

        if (first === 127) return { type: 'special', label: 'Loopback', detail: '127.0.0.0/8' };
        if (first === 0) return { type: 'special', label: 'Aktuelles Netz', detail: '0.0.0.0/8' };
        if (first === 169 && second === 254) return { type: 'special', label: 'Link-Local (APIPA)', detail: '169.254.0.0/16' };
        if (first >= 224 && first <= 239) return { type: 'special', label: 'Multicast', detail: '224.0.0.0/4' };
        if (first >= 240) return { type: 'special', label: 'Reserviert', detail: '240.0.0.0/4' };
        if (first === 100 && second >= 64 && second <= 127) return { type: 'special', label: 'Carrier-Grade NAT', detail: '100.64.0.0/10' };
        if (first === 192 && second === 0 && ((ipInt >>> 8) & 255) === 0) return { type: 'special', label: 'IETF Protokoll', detail: '192.0.0.0/24' };
        if (first === 198 && (second === 18 || second === 19)) return { type: 'special', label: 'Benchmark-Tests', detail: '198.18.0.0/15' };
        if (first === 192 && second === 0 && ((ipInt >>> 8) & 255) === 2) return { type: 'special', label: 'Dokumentation', detail: '192.0.2.0/24' };
        if (first === 198 && second === 51 && ((ipInt >>> 8) & 255) === 100) return { type: 'special', label: 'Dokumentation', detail: '198.51.100.0/24' };
        if (first === 203 && second === 0 && ((ipInt >>> 8) & 255) === 113) return { type: 'special', label: 'Dokumentation', detail: '203.0.113.0/24' };

        return { type: 'public', label: 'Öffentlich', detail: 'Internet-routbar' };
    }

    function getIPClass(ipInt) {
        const first = (ipInt >>> 24) & 255;
        if (first <= 127) return 'A';
        if (first <= 191) return 'B';
        if (first <= 223) return 'C';
        if (first <= 239) return 'D (Multicast)';
        return 'E (Reserviert)';
    }

    // --- Binary with coloring ---
    function formatBinary(int, cidr) {
        const bin = intToBinary(int);
        let html = '';
        for (let i = 0; i < 32; i++) {
            if (i > 0 && i % 8 === 0) html += '<span class="dot">.</span>';
            if (i < cidr) {
                html += `<span class="net-bit">${bin[i]}</span>`;
            } else {
                html += `<span class="host-bit">${bin[i]}</span>`;
            }
        }
        return html;
    }

    // --- Calculate and display ---
    function calculate() {
        const ip = ipInput.value.trim();
        const cidr = parseInt(cidrSelect.value);

        resultCard.style.display = 'none';
        errorCard.style.display = 'none';

        if (!ip) {
            document.getElementById('viz-card').style.display = 'none';
            geoCard.style.display = 'none';
            return;
        }

        if (!validateIP(ip)) {
            errorMsg.textContent = 'Ungültige IP-Adresse. Format: x.x.x.x (0-255)';
            errorCard.style.display = 'block';
            document.getElementById('viz-card').style.display = 'none';
            geoCard.style.display = 'none';
            return;
        }

        const ipInt = ipToInt(ip);
        const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
        const wildcardInt = (~maskInt) >>> 0;
        const networkInt = (ipInt & maskInt) >>> 0;
        const broadcastInt = (networkInt | wildcardInt) >>> 0;

        let firstHost, lastHost, hostCount;
        if (cidr >= 31) {
            firstHost = intToIP(networkInt);
            lastHost = intToIP(broadcastInt);
            hostCount = cidr === 32 ? 1 : 2;
        } else {
            firstHost = intToIP(networkInt + 1);
            lastHost = intToIP(broadcastInt - 1);
            hostCount = Math.pow(2, 32 - cidr) - 2;
        }

        const classification = classifyIP(ipInt);
        const ipClass = getIPClass(ipInt);

        document.getElementById('res-network').textContent = intToIP(networkInt);
        document.getElementById('res-broadcast').textContent = intToIP(broadcastInt);
        document.getElementById('res-first-host').textContent = firstHost;
        document.getElementById('res-last-host').textContent = lastHost;
        document.getElementById('res-host-count').textContent = hostCount.toLocaleString('de-DE');
        document.getElementById('res-subnet-mask').textContent = intToIP(maskInt);
        document.getElementById('res-wildcard').textContent = intToIP(wildcardInt);
        document.getElementById('res-class').textContent = `Klasse ${ipClass}`;

        const badge = document.getElementById('ip-type-badge');
        badge.className = `ip-type-badge ${classification.type}`;
        badge.textContent = `${classification.label} — ${classification.detail}`;

        document.getElementById('bin-ip').innerHTML = formatBinary(ipInt, cidr);
        document.getElementById('bin-mask').innerHTML = formatBinary(maskInt, cidr);
        document.getElementById('bin-network').innerHTML = formatBinary(networkInt, cidr);

        resultCard.style.display = 'block';

        renderVisualization(networkInt, broadcastInt, cidr, hostCount);
        lookupGeolocation(ip, classification.type);
    }

    // --- Subnet Visualization ---
    function renderVisualization(networkInt, broadcastInt, cidr, hostCount) {
        const vizCard = document.getElementById('viz-card');
        if (cidr > 30) {
            vizCard.style.display = 'none';
            return;
        }
        vizCard.style.display = 'block';

        const totalAddresses = Math.pow(2, 32 - cidr);
        const netPct = (1 / totalAddresses) * 100;
        const bcPct = (1 / totalAddresses) * 100;
        const firstPct = (1 / totalAddresses) * 100;
        const lastPct = (1 / totalAddresses) * 100;
        const hostsPct = Math.max(0, 100 - netPct - bcPct - firstPct - lastPct);

        document.getElementById('viz-net').style.width = `${Math.max(netPct, 3)}%`;
        document.getElementById('viz-first').style.width = `${Math.max(firstPct, 5)}%`;
        document.getElementById('viz-hosts').style.width = `${Math.max(hostsPct, 10)}%`;
        document.getElementById('viz-last').style.width = `${Math.max(lastPct, 5)}%`;
        document.getElementById('viz-broadcast').style.width = `${Math.max(bcPct, 3)}%`;

        document.getElementById('viz-hosts-label').textContent = `${hostCount.toLocaleString('de-DE')} Hosts`;
        document.getElementById('viz-addr-start').textContent = intToIP(networkInt);
        document.getElementById('viz-addr-end').textContent = intToIP(broadcastInt);

        const netBitsPct = (cidr / 32) * 100;
        document.getElementById('viz-bits-net').style.width = `${netBitsPct}%`;
        document.getElementById('viz-bits-host').style.width = `${100 - netBitsPct}%`;
        document.getElementById('viz-bits-net-label').textContent = `${cidr}`;
        document.getElementById('viz-bits-host-label').textContent = `${32 - cidr}`;
    }

    // --- Geolocation ---
    function lookupGeolocation(ip, ipType) {
        if (ipType !== 'public') {
            geoCard.style.display = 'none';
            lastGeoIP = null;
            return;
        }

        if (ip === lastGeoIP) return;
        lastGeoIP = ip;

        if (_ipRechnerGeoAbort) _ipRechnerGeoAbort.abort();
        _ipRechnerGeoAbort = new AbortController();

        geoCard.style.display = 'block';
        geoLoading.style.display = 'inline';
        geoContent.style.display = 'none';
        geoError.style.display = 'none';

        fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: _ipRechnerGeoAbort.signal })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (data.error) throw new Error(data.reason || 'Unbekannter Fehler');

                geoLoading.style.display = 'none';
                geoContent.style.display = 'block';

                const flag = data.country_code
                    ? String.fromCodePoint(...[...data.country_code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
                    : '';
                document.getElementById('geo-flag').textContent = flag;
                document.getElementById('geo-country').textContent = data.country_name || '—';
                document.getElementById('geo-region').textContent = data.region || '—';
                document.getElementById('geo-city').textContent = data.city || '—';
                document.getElementById('geo-zip').textContent = data.postal || '—';
                document.getElementById('geo-timezone').textContent = data.timezone || '—';
                document.getElementById('geo-isp').textContent = data.org || '—';

                const lat = data.latitude;
                const lon = data.longitude;
                if (lat && lon) {
                    document.getElementById('geo-coords').textContent = `${lat}, ${lon}`;
                    const mapLink = document.getElementById('geo-map-link');
                    mapLink.href = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lon)}#map=12/${encodeURIComponent(lat)}/${encodeURIComponent(lon)}`;
                    mapLink.style.display = 'inline-block';
                } else {
                    document.getElementById('geo-coords').textContent = '—';
                    document.getElementById('geo-map-link').style.display = 'none';
                }
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                geoLoading.style.display = 'none';
                geoError.style.display = 'block';
                geoErrorMsg.textContent = `Standort konnte nicht ermittelt werden: ${err.message}`;
            });
    }

    // --- Event Listeners ---

    // iOS DE-Tastatur: Komma abfangen BEVOR es eingefügt wird (beforeinput)
    // Safari überschreibt value-Änderungen im 'input'-Event — daher beforeinput nutzen
    ipInput.addEventListener('beforeinput', (e) => {
        if (e.inputType === 'insertText' && e.data && e.data.includes(',')) {
            e.preventDefault();
            // Punkt statt Komma manuell einfügen
            const start = ipInput.selectionStart;
            const end = ipInput.selectionEnd;
            const val = ipInput.value;
            const replaced = e.data.replace(/,/g, '.');
            ipInput.value = val.slice(0, start) + replaced + val.slice(end);
            const newPos = start + replaced.length;
            ipInput.setSelectionRange(newPos, newPos);
            // input-Event wird durch preventDefault unterdrückt → manuell berechnen
            handleIPInput();
        }
    });

    // Fallback: keyup für ältere iOS-Versionen ohne beforeinput-Support
    ipInput.addEventListener('keyup', () => {
        if (ipInput.value.includes(',')) {
            const pos = ipInput.selectionStart;
            ipInput.value = ipInput.value.replace(/,/g, '.');
            ipInput.setSelectionRange(pos, pos);
        }
    });

    function handleIPInput() {
        const val = ipInput.value.trim();
        if (val.includes('/')) {
            const [ip, cidr] = val.split('/');
            const cidrNum = parseInt(cidr);
            if (!isNaN(cidrNum) && cidrNum >= 0 && cidrNum <= 32) {
                ipInput.value = ip;
                cidrSelect.value = cidrNum;
            }
        }
        calculate();
    }

    ipInput.addEventListener('input', handleIPInput);

    cidrSelect.addEventListener('change', calculate);

    // Quick example chips
    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            ipInput.value = chip.dataset.ip;
            cidrSelect.value = chip.dataset.cidr;
            calculate();
        });
    });

    // My IP Button
    myIpBtn.addEventListener('click', () => {
        myIpBtn.disabled = true;
        myIpBtn.textContent = 'Ermittle...';

        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                let ip = data.ip;
                if (ip && ip.includes(':')) {
                    return fetch('https://api.ipify.org?format=json')
                        .then(r => r.json())
                        .then(d => d.ip);
                }
                return ip;
            })
            .then(ip => {
                if (ip && !ip.includes(':')) {
                    ipInput.value = ip;
                    cidrSelect.value = 24;
                    calculate();
                } else {
                    myIpBtn.textContent = 'Nur IPv6 verfügbar — IPv4 nicht gefunden';
                }
            })
            .catch(() => {
                myIpBtn.textContent = 'Fehler — nochmal versuchen';
            })
            .finally(() => {
                setTimeout(() => {
                    myIpBtn.disabled = false;
                    myIpBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Meine IP-Adresse';
                }, 1000);
            });
    });

    // --- Init ---
    populateCIDR();
}

function teardown_ip_rechner() {
    if (_ipRechnerGeoAbort) {
        _ipRechnerGeoAbort.abort();
        _ipRechnerGeoAbort = null;
    }
}
