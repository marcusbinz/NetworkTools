// === Netzwerk-Rechner Tool ===

let _nrDebounceTimer = null;

function init_netzwerk_rechner(container) {
    // --- i18n Strings ---
    I18N.register('nr', {
        de: {
            'bandwidth':    'Bandbreite',
            'filesize':     'Dateigr\u00f6\u00dfe',
            'examples':     'Beispiele',
            'swapDir':      'Richtung umschalten',
            'bwConversion': 'Bandbreiten-Umrechnung',
            'transferTime': 'Transferzeit',
            'transferStd':  'Transferzeit f\u00fcr g\u00e4ngige Dateigr\u00f6\u00dfen',
            'commonBw':     'G\u00e4ngige Bandbreiten',
            'connection':   'Verbindung',
            'download':     'Download',
            'upload':       'Upload',
            'at':           'bei',
            'enterFilesize':'Dateigr\u00f6\u00dfe eingeben f\u00fcr Berechnung',
        },
        en: {
            'bandwidth':    'Bandwidth',
            'filesize':     'File Size',
            'examples':     'Examples',
            'swapDir':      'Swap direction',
            'bwConversion': 'Bandwidth Conversion',
            'transferTime': 'Transfer Time',
            'transferStd':  'Transfer time for common file sizes',
            'commonBw':     'Common Bandwidths',
            'connection':   'Connection',
            'download':     'Download',
            'upload':       'Upload',
            'at':           'at',
            'enterFilesize':'Enter file size to calculate',
        }
    });

    // --- State ---
    let activeBwUnit = 'mbps';
    let activeFsUnit = 'gb';
    let swapped = false;

    // --- Conversion constants ---
    const BW_TO_BPS = { kbps: 1000, mbps: 1000000, gbps: 1000000000 };
    const FS_TO_BYTES = { kb: 1024, mb: Math.pow(1024, 2), gb: Math.pow(1024, 3), tb: Math.pow(1024, 4) };

    const STANDARD_SIZES = [
        { label: '100 MB', bytes: 100 * Math.pow(1024, 2) },
        { label: '1 GB',   bytes: Math.pow(1024, 3) },
        { label: '10 GB',  bytes: 10 * Math.pow(1024, 3) },
        { label: '50 GB',  bytes: 50 * Math.pow(1024, 3) },
        { label: '100 GB', bytes: 100 * Math.pow(1024, 3) },
        { label: '1 TB',   bytes: Math.pow(1024, 4) },
    ];

    const COMMON_BANDWIDTHS = [
        { name: 'DSL 16',             dl: '16 Mbps',   ul: '1 Mbps' },
        { name: 'VDSL 50',            dl: '50 Mbps',   ul: '10 Mbps' },
        { name: 'VDSL 100',           dl: '100 Mbps',  ul: '40 Mbps' },
        { name: 'Kabel 400',          dl: '400 Mbps',  ul: '25 Mbps' },
        { name: 'Glasfaser 1000',     dl: '1 Gbps',    ul: '500 Mbps' },
        { name: '5G',                 dl: '1 Gbps',    ul: '100 Mbps' },
        { name: 'LTE',                dl: '150 Mbps',  ul: '50 Mbps' },
        { name: 'WLAN ac',            dl: '867 Mbps',  ul: '867 Mbps' },
        { name: 'WLAN ax (Wi-Fi 6)',  dl: '2400 Mbps', ul: '2400 Mbps' },
        { name: 'Ethernet 1G',        dl: '1 Gbps',    ul: '1 Gbps' },
        { name: 'Ethernet 10G',       dl: '10 Gbps',   ul: '10 Gbps' },
    ];

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card nr-input-card">
            <label>${t('nr.bandwidth')}</label>
            <input type="text" class="nr-input" id="nr-bandwidth" placeholder="100" inputmode="decimal" autocomplete="off">
            <div class="nr-unit-chips" id="nr-bw-units">
                <span class="chip nr-unit-chip" data-unit="kbps">Kbps</span>
                <span class="chip nr-unit-chip active" data-unit="mbps">Mbps</span>
                <span class="chip nr-unit-chip" data-unit="gbps">Gbps</span>
            </div>

            <button class="nr-swap-btn" id="nr-swap-btn" title="${t('nr.swapDir')}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="7 3 7 21"></polyline>
                    <polyline points="3 7 7 3 11 7"></polyline>
                    <polyline points="17 21 17 3"></polyline>
                    <polyline points="13 17 17 21 21 17"></polyline>
                </svg>
            </button>

            <label>${t('nr.filesize')}</label>
            <input type="text" class="nr-input" id="nr-filesize" placeholder="50" inputmode="decimal" autocomplete="off">
            <div class="nr-unit-chips" id="nr-fs-units">
                <span class="chip nr-unit-chip" data-unit="kb">KB</span>
                <span class="chip nr-unit-chip" data-unit="mb">MB</span>
                <span class="chip nr-unit-chip active" data-unit="gb">GB</span>
                <span class="chip nr-unit-chip" data-unit="tb">TB</span>
            </div>

            <label class="quick-examples-label">${t('nr.examples')}</label>
            <div class="quick-examples nr-examples">
                <span class="chip" data-bw="100" data-bwu="mbps" data-fs="50" data-fsu="gb">50 GB @ 100 Mbps</span>
                <span class="chip" data-bw="1" data-bwu="gbps" data-fs="1" data-fsu="tb">1 TB @ 1 Gbps</span>
                <span class="chip" data-bw="50" data-bwu="mbps" data-fs="4.7" data-fsu="gb">DVD @ 50 Mbps</span>
                <span class="chip" data-bw="250" data-bwu="mbps" data-fs="100" data-fsu="gb">100 GB @ 250 Mbps</span>
            </div>
        </section>

        <section class="card nr-result-card" id="nr-result-card" style="display:none;">
            <div class="nr-section-label">${t('nr.bwConversion')}</div>
            <div class="nr-result-grid" id="nr-bw-grid"></div>

            <div class="nr-section-label" style="margin-top:20px">${t('nr.transferTime')}</div>
            <div class="nr-result-grid" id="nr-transfer-result"></div>

            <div class="nr-section-label" style="margin-top:20px">${t('nr.transferStd')}</div>
            <div class="nr-transfer-grid" id="nr-transfer-grid"></div>
        </section>

        <section class="card">
            <div class="nr-section-label">${t('nr.commonBw')}</div>
            <table class="nr-ref-table">
                <thead>
                    <tr>
                        <th>${t('nr.connection')}</th>
                        <th>${t('nr.download')}</th>
                        <th>${t('nr.upload')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${COMMON_BANDWIDTHS.map(b => `
                        <tr>
                            <td class="nr-ref-name">${b.name}</td>
                            <td class="nr-ref-speed">${b.dl}</td>
                            <td class="nr-ref-speed">${b.ul}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </section>
    `;

    // --- DOM References ---
    const bwInput = document.getElementById('nr-bandwidth');
    const fsInput = document.getElementById('nr-filesize');
    const resultCard = document.getElementById('nr-result-card');
    const bwGrid = document.getElementById('nr-bw-grid');
    const transferResult = document.getElementById('nr-transfer-result');
    const transferGrid = document.getElementById('nr-transfer-grid');
    const swapBtn = document.getElementById('nr-swap-btn');
    const bwUnitChips = container.querySelectorAll('#nr-bw-units .nr-unit-chip');
    const fsUnitChips = container.querySelectorAll('#nr-fs-units .nr-unit-chip');

    // --- Number formatting ---
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.?0+$/, '') + ' M';
        if (num >= 1000) return (num / 1000).toFixed(2).replace(/\.?0+$/, '') + ' K';
        if (num >= 1) return num.toFixed(2).replace(/\.?0+$/, '');
        if (num >= 0.01) return num.toFixed(3).replace(/\.?0+$/, '');
        if (num > 0) return num.toExponential(2);
        return '0';
    }

    function formatBandwidth(val, unit) {
        return formatNumber(val) + ' ' + unit;
    }

    // --- Time formatting ---
    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '\u2014';
        if (seconds < 0.001) return '< 1 ms';
        if (seconds < 1) return (seconds * 1000).toFixed(0) + ' ms';

        var d = Math.floor(seconds / 86400);
        var h = Math.floor((seconds % 86400) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor(seconds % 60);

        var parts = [];
        if (d > 0) parts.push(d + 'd');
        if (h > 0) parts.push(h + 'h');
        if (m > 0) parts.push(m + 'm');
        if (s > 0 || parts.length === 0) parts.push(s + 's');
        return parts.join(' ');
    }

    // --- Parse input (accept comma as decimal separator) ---
    function parseInput(value) {
        if (!value || value.trim() === '') return NaN;
        var cleaned = value.trim().replace(',', '.');
        return parseFloat(cleaned);
    }

    // --- Set active unit chip ---
    function setActiveChip(chips, unit) {
        chips.forEach(function(c) {
            c.classList.toggle('active', c.dataset.unit === unit);
        });
    }

    // --- Convert bandwidth to bps ---
    function toBps(value, unit) {
        return value * (BW_TO_BPS[unit] || 1);
    }

    // --- Convert filesize to bytes ---
    function toBytes(value, unit) {
        return value * (FS_TO_BYTES[unit] || 1);
    }

    // --- Calculate transfer time in seconds ---
    function calcTransferTime(bytes, bps) {
        if (bps <= 0) return Infinity;
        return (bytes * 8) / bps;
    }

    // --- Render bandwidth conversions ---
    function renderBandwidthGrid(bps) {
        var conversions = [
            { label: 'Kbps',  value: bps / 1000 },
            { label: 'Mbps',  value: bps / 1000000 },
            { label: 'Gbps',  value: bps / 1000000000 },
            { label: 'KB/s',  value: bps / 8 / 1024 },
            { label: 'MB/s',  value: bps / 8 / Math.pow(1024, 2) },
            { label: 'GB/s',  value: bps / 8 / Math.pow(1024, 3) },
        ];

        bwGrid.innerHTML = conversions.map(function(c) {
            return '<div class="nr-result-item">' +
                '<span class="nr-result-value">' + formatNumber(c.value) + '</span>' +
                '<span class="nr-result-label">' + c.label + '</span>' +
                '</div>';
        }).join('');
    }

    // --- Render transfer time result ---
    function renderTransferResult(bytes, bps) {
        var seconds = calcTransferTime(bytes, bps);
        var timeStr = formatTime(seconds);
        var fsLabel = escHtml(fsInput.value.trim().replace(',', '.')) + ' ' + escHtml(activeFsUnit.toUpperCase());
        var bwLabel = escHtml(bwInput.value.trim().replace(',', '.')) + ' ' + escHtml(activeBwUnit.charAt(0).toUpperCase() + activeBwUnit.slice(1));

        transferResult.innerHTML =
            '<div class="nr-result-item full-width nr-result-highlight">' +
                '<span class="nr-result-value">' + timeStr + '</span>' +
                '<span class="nr-result-label">' + fsLabel + ' ' + t('nr.at') + ' ' + bwLabel + '</span>' +
            '</div>';
    }

    // --- Render transfer time table ---
    function renderTransferGrid(bps) {
        transferGrid.innerHTML = STANDARD_SIZES.map(function(s) {
            var seconds = calcTransferTime(s.bytes, bps);
            return '<div class="nr-transfer-item">' +
                '<span class="nr-transfer-size">' + s.label + '</span>' +
                '<span class="nr-transfer-time">' + formatTime(seconds) + '</span>' +
                '</div>';
        }).join('');
    }

    // --- Main calculation ---
    function calculate() {
        var bwVal = parseInput(bwInput.value);
        var fsVal = parseInput(fsInput.value);

        // Need at least bandwidth for conversion grid
        if (isNaN(bwVal) || bwVal <= 0) {
            resultCard.style.display = 'none';
            return;
        }

        var bps = toBps(bwVal, activeBwUnit);

        // Show result card
        var wasHidden = resultCard.style.display === 'none';
        resultCard.style.display = 'block';
        if (wasHidden) {
            resultCard.style.animation = 'none';
            resultCard.offsetHeight;
            resultCard.style.animation = 'slideUp 0.3s ease-out';
        }

        // Bandwidth conversion grid
        renderBandwidthGrid(bps);

        // Transfer time (only if filesize is provided)
        if (!isNaN(fsVal) && fsVal > 0) {
            var bytes = toBytes(fsVal, activeFsUnit);
            renderTransferResult(bytes, bps);
            document.getElementById('nr-transfer-result').style.display = '';
        } else {
            transferResult.innerHTML =
                '<div class="nr-result-item full-width">' +
                    '<span class="nr-result-value" style="font-size:14px; color:var(--text-dim)">' + t('nr.enterFilesize') + '</span>' +
                    '<span class="nr-result-label">' + t('nr.transferTime') + '</span>' +
                '</div>';
        }

        // Transfer grid (always, based on bandwidth)
        renderTransferGrid(bps);
    }

    // --- Debounced calculation ---
    function debouncedCalc() {
        if (_nrDebounceTimer) clearTimeout(_nrDebounceTimer);
        _nrDebounceTimer = setTimeout(calculate, 200);
    }

    // --- Event listeners: inputs ---
    bwInput.addEventListener('input', debouncedCalc);
    fsInput.addEventListener('input', debouncedCalc);

    // --- Event listeners: bandwidth unit chips ---
    bwUnitChips.forEach(function(chip) {
        chip.addEventListener('click', function() {
            activeBwUnit = chip.dataset.unit;
            setActiveChip(bwUnitChips, activeBwUnit);
            calculate();
        });
    });

    // --- Event listeners: filesize unit chips ---
    fsUnitChips.forEach(function(chip) {
        chip.addEventListener('click', function() {
            activeFsUnit = chip.dataset.unit;
            setActiveChip(fsUnitChips, activeFsUnit);
            calculate();
        });
    });

    // --- Swap button ---
    swapBtn.addEventListener('click', function() {
        swapped = !swapped;
        swapBtn.style.transform = swapped ? 'rotate(180deg)' : 'rotate(0deg)';

        // Swap values between bandwidth and filesize inputs
        var tmpVal = bwInput.value;
        var tmpUnit = activeBwUnit;

        bwInput.value = fsInput.value;
        fsInput.value = tmpVal;

        // Map units across domains if possible, otherwise keep defaults
        var bwToFs = { kbps: 'kb', mbps: 'mb', gbps: 'gb' };
        var fsToBw = { kb: 'kbps', mb: 'mbps', gb: 'gbps', tb: 'gbps' };

        var newBwUnit = fsToBw[activeFsUnit] || 'mbps';
        var newFsUnit = bwToFs[tmpUnit] || 'gb';

        activeBwUnit = newBwUnit;
        activeFsUnit = newFsUnit;

        setActiveChip(bwUnitChips, activeBwUnit);
        setActiveChip(fsUnitChips, activeFsUnit);

        calculate();
    });

    // --- Quick example chips ---
    container.querySelectorAll('.nr-examples .chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            bwInput.value = chip.dataset.bw;
            fsInput.value = chip.dataset.fs;

            activeBwUnit = chip.dataset.bwu;
            activeFsUnit = chip.dataset.fsu;

            setActiveChip(bwUnitChips, activeBwUnit);
            setActiveChip(fsUnitChips, activeFsUnit);

            calculate();
        });
    });
}

function teardown_netzwerk_rechner() {
    if (_nrDebounceTimer) {
        clearTimeout(_nrDebounceTimer);
        _nrDebounceTimer = null;
    }
}
