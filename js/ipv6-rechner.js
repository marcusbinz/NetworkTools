// === IPv6-Rechner Tool ===

function init_ipv6_rechner(container) {
    // --- i18n Strings ---
    I18N.register('v6', {
        de: {
            'label':        'IPv6-Adresse',
            'prefixLabel':  'Prefix-L\u00e4nge',
            'examples':     'Beispiele',
            'exSample':     'Beispiel',
            'exLinkLocal':  'Link-Local',
            'exLoopback':   'Loopback',
            'exDoc':        'Doku',
            'resultTitle':  'IPv6 Ergebnis',
            'formats':      'Formate',
            'binary':       'Bin\u00e4rdarstellung',
            'type':         'Typ',
            'network':      'Netzwerk',
            'firstAddr':    'Erste Adresse',
            'lastAddr':     'Letzte Adresse',
            'prefixLen':    'Prefix-L\u00e4nge',
            'subnetSize':   'Adressen im Subnetz',
            'expanded':     'Voll expandiert',
            'compressed':   'Komprimiert',
            'errPrefix':    'Prefix muss zwischen 0 und 128 liegen.',
            'errInvalid':   'Ung\u00fcltige IPv6-Adresse. Beispiel: 2001:db8::1/64',
            // IPv6 Typen
            'tLoopback':    'Loopback',
            'tUnspecified': 'Unspecified',
            'tLinkLocal':   'Link-Local',
            'tUniqueLocal': 'Unique Local',
            'tMulticast':   'Multicast',
            'tGlobal':      'Global Unicast',
            'tDoc':         'Dokumentation',
            'tReserved':    'Reserviert',
            // IPv6 Typ-Beschreibungen
            'dLoopback':    '::1 \u2014 Lokale Loopback-Adresse',
            'dUnspecified': ':: \u2014 Nicht spezifizierte Adresse',
            'dLinkLocal':   'fe80::/10 \u2014 Nur im lokalen Netzwerk g\u00fcltig',
            'dUniqueLocal7':'fc00::/7 \u2014 Privates Netzwerk (wie IPv4 RFC1918)',
            'dUniqueLocal8':'fd00::/8 \u2014 Privates Netzwerk (lokal generiert)',
            'dMulticast':   'ff00::/8 \u2014 Multicast-Adresse',
            'dGlobal':      '2000::/3 \u2014 \u00d6ffentlich routbar (Internet)',
            'dDoc':         '2001:db8::/32 \u2014 Nur f\u00fcr Dokumentation',
            'dReserved':    'Reservierter Adressbereich',
        },
        en: {
            'label':        'IPv6 Address',
            'prefixLabel':  'Prefix Length',
            'examples':     'Examples',
            'exSample':     'Example',
            'exLinkLocal':  'Link-Local',
            'exLoopback':   'Loopback',
            'exDoc':        'Docs',
            'resultTitle':  'IPv6 Result',
            'formats':      'Formats',
            'binary':       'Binary Representation',
            'type':         'Type',
            'network':      'Network',
            'firstAddr':    'First Address',
            'lastAddr':     'Last Address',
            'prefixLen':    'Prefix Length',
            'subnetSize':   'Addresses in Subnet',
            'expanded':     'Fully Expanded',
            'compressed':   'Compressed',
            'errPrefix':    'Prefix must be between 0 and 128.',
            'errInvalid':   'Invalid IPv6 address. Example: 2001:db8::1/64',
            'tLoopback':    'Loopback',
            'tUnspecified': 'Unspecified',
            'tLinkLocal':   'Link-Local',
            'tUniqueLocal': 'Unique Local',
            'tMulticast':   'Multicast',
            'tGlobal':      'Global Unicast',
            'tDoc':         'Documentation',
            'tReserved':    'Reserved',
            'dLoopback':    '::1 \u2014 Local loopback address',
            'dUnspecified': ':: \u2014 Unspecified address',
            'dLinkLocal':   'fe80::/10 \u2014 Valid only on local network',
            'dUniqueLocal7':'fc00::/7 \u2014 Private network (like IPv4 RFC1918)',
            'dUniqueLocal8':'fd00::/8 \u2014 Private network (locally generated)',
            'dMulticast':   'ff00::/8 \u2014 Multicast address',
            'dGlobal':      '2000::/3 \u2014 Publicly routable (Internet)',
            'dDoc':         '2001:db8::/32 \u2014 Documentation only',
            'dReserved':    'Reserved address range',
        }
    });

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card v6-input-card">
            <label for="v6-input">${t('v6.label')}</label>
            <div class="v6-input-row">
                <input type="text" id="v6-input" placeholder="2001:db8::1/64" autocomplete="off" spellcheck="false">
                <button class="v6-calc-btn" id="v6-calc-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>

            <label class="v6-prefix-label">${t('v6.prefixLabel')}</label>
            <div class="v6-prefix-chips" id="v6-prefix-chips">
                <span class="chip v6-prefix-chip" data-prefix="32">/32</span>
                <span class="chip v6-prefix-chip" data-prefix="48">/48</span>
                <span class="chip v6-prefix-chip active" data-prefix="64">/64</span>
                <span class="chip v6-prefix-chip" data-prefix="128">/128</span>
            </div>

            <label class="quick-examples-label">${t('v6.examples')}</label>
            <div class="quick-examples v6-examples">
                <span class="chip" data-addr="2001:0db8:85a3::8a2e:0370:7334/64">${t('v6.exSample')}</span>
                <span class="chip" data-addr="fe80::1/10">${t('v6.exLinkLocal')}</span>
                <span class="chip" data-addr="::1/128">${t('v6.exLoopback')}</span>
                <span class="chip" data-addr="2001:db8::/32">${t('v6.exDoc')}</span>
            </div>
        </section>

        <section class="card v6-result-card" id="v6-result-card" style="display:none;">
            <div class="v6-result-header">
                <h3 id="v6-result-title">${t('v6.resultTitle')}</h3>
                <span class="v6-type-badge" id="v6-type-badge"></span>
            </div>

            <div class="result-grid" id="v6-results-grid"></div>

            <!-- Expanded / Compressed -->
            <div class="v6-format-section" id="v6-format-section">
                <h4 class="v6-section-title">${t('v6.formats')}</h4>
                <div id="v6-formats"></div>
            </div>

            <!-- Binary -->
            <div class="v6-binary-section" id="v6-binary-section">
                <h4 class="v6-section-title">${t('v6.binary')}</h4>
                <div class="v6-binary-grid" id="v6-binary-grid"></div>
            </div>
        </section>

        <section class="card error-card" id="v6-error-card" style="display:none;">
            <p id="v6-error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const addrInput = document.getElementById('v6-input');
    const calcBtn = document.getElementById('v6-calc-btn');
    const resultCard = document.getElementById('v6-result-card');
    const errorCard = document.getElementById('v6-error-card');
    const errorMsg = document.getElementById('v6-error-msg');
    const prefixChips = container.querySelectorAll('.v6-prefix-chip');

    let selectedPrefix = 64;

    // --- Prefix chip selection ---
    prefixChips.forEach(chip => {
        chip.addEventListener('click', () => {
            prefixChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedPrefix = parseInt(chip.dataset.prefix);
            // Update input if it has a prefix
            const val = addrInput.value.trim();
            if (val && !val.includes('/')) {
                // don't change
            } else if (val) {
                addrInput.value = val.replace(/\/\d+$/, '') + '/' + selectedPrefix;
            }
        });
    });

    // --- IPv6 Helper Functions ---

    // Expand :: notation to full 8 groups
    function expandIPv6(addr) {
        // Remove prefix if present
        addr = addr.replace(/\/\d+$/, '').trim();

        // Handle :: expansion
        let parts = addr.split('::');
        if (parts.length > 2) return null; // Invalid: more than one ::

        let left = parts[0] ? parts[0].split(':') : [];
        let right = parts.length === 2 ? (parts[1] ? parts[1].split(':') : []) : [];

        if (parts.length === 1) {
            // No :: present
            if (left.length !== 8) return null;
        } else {
            // Fill in zeros for ::
            const missing = 8 - left.length - right.length;
            if (missing < 0) return null;
            const zeros = Array(missing).fill('0000');
            left = [...left, ...zeros, ...right];
        }

        // Pad each group to 4 hex digits
        const expanded = left.map(g => {
            if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
            return g.padStart(4, '0').toLowerCase();
        });

        if (expanded.includes(null) || expanded.length !== 8) return null;
        return expanded;
    }

    // Compress to shortest notation
    function compressIPv6(groups) {
        // Remove leading zeros from each group
        const short = groups.map(g => g.replace(/^0+/, '') || '0');

        // Find longest run of consecutive "0" groups
        let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
        for (let i = 0; i < 8; i++) {
            if (short[i] === '0') {
                if (curStart === -1) curStart = i;
                curLen = i - curStart + 1;
                if (curLen > bestLen) {
                    bestStart = curStart;
                    bestLen = curLen;
                }
            } else {
                curStart = -1;
                curLen = 0;
            }
        }

        if (bestLen >= 2) {
            const left = short.slice(0, bestStart).join(':');
            const right = short.slice(bestStart + bestLen).join(':');
            return (left || '') + '::' + (right || '');
        }

        return short.join(':');
    }

    // Convert groups to binary string (128 bits)
    function groupsToBinary(groups) {
        return groups.map(g => parseInt(g, 16).toString(2).padStart(16, '0')).join('');
    }

    // Get address type
    function getIPv6Type(groups) {
        const full = groups.join(':');
        const binary = groupsToBinary(groups);

        if (full === '0000:0000:0000:0000:0000:0000:0000:0001') return { type: t('v6.tLoopback'), color: 'var(--purple)', desc: t('v6.dLoopback') };
        if (full === '0000:0000:0000:0000:0000:0000:0000:0000') return { type: t('v6.tUnspecified'), color: 'var(--text-dim)', desc: t('v6.dUnspecified') };
        if (binary.startsWith('11111110 10'.replace(/ /g, ''))) return { type: t('v6.tLinkLocal'), color: 'var(--orange)', desc: t('v6.dLinkLocal') };
        if (binary.startsWith('11111100')) return { type: t('v6.tUniqueLocal'), color: 'var(--orange)', desc: t('v6.dUniqueLocal7') };
        if (binary.startsWith('11111101')) return { type: t('v6.tUniqueLocal'), color: 'var(--orange)', desc: t('v6.dUniqueLocal8') };
        if (binary.startsWith('11111111')) return { type: t('v6.tMulticast'), color: 'var(--red)', desc: t('v6.dMulticast') };
        if (binary.startsWith('001')) return { type: t('v6.tGlobal'), color: 'var(--green)', desc: t('v6.dGlobal') };
        if (groups[0] === '2001' && groups[1] === '0db8') return { type: t('v6.tDoc'), color: 'var(--text-dim)', desc: t('v6.dDoc') };
        return { type: t('v6.tReserved'), color: 'var(--text-dim)', desc: t('v6.dReserved') };
    }

    // Calculate network address
    function getNetworkAddress(groups, prefix) {
        const binary = groupsToBinary(groups);
        const networkBits = binary.substring(0, prefix).padEnd(128, '0');
        return binaryToGroups(networkBits);
    }

    // Calculate first and last address
    function getFirstHost(groups, prefix) {
        const binary = groupsToBinary(groups);
        const networkBits = binary.substring(0, prefix).padEnd(128, '0');
        return binaryToGroups(networkBits);
    }

    function getLastAddress(groups, prefix) {
        const binary = groupsToBinary(groups);
        const networkBits = binary.substring(0, prefix).padEnd(128, '1');
        return binaryToGroups(networkBits);
    }

    function binaryToGroups(binStr) {
        const groups = [];
        for (let i = 0; i < 128; i += 16) {
            groups.push(parseInt(binStr.substring(i, i + 16), 2).toString(16).padStart(4, '0'));
        }
        return groups;
    }

    // Count addresses in subnet
    function getSubnetSize(prefix) {
        const loc = I18N.getLang() === 'de' ? 'de-DE' : 'en-US';
        const hostBits = 128 - prefix;
        if (hostBits === 0) return '1';
        if (hostBits <= 53) return Math.pow(2, hostBits).toLocaleString(loc);
        // For very large numbers use exponential notation
        return `2^${hostBits}`;
    }

    // --- Main Calculation ---
    function calculate() {
        let input = addrInput.value.trim();
        if (!input) return;

        // Extract prefix
        let prefix = selectedPrefix;
        const prefixMatch = input.match(/\/(\d+)$/);
        if (prefixMatch) {
            prefix = parseInt(prefixMatch[1]);
            if (prefix < 0 || prefix > 128) {
                showError(t('v6.errPrefix'));
                return;
            }
        }

        // Parse address
        const groups = expandIPv6(input);
        if (!groups) {
            showError(t('v6.errInvalid'));
            return;
        }

        errorCard.style.display = 'none';

        // Type
        const typeInfo = getIPv6Type(groups);
        const typeBadge = document.getElementById('v6-type-badge');
        typeBadge.textContent = typeInfo.type;
        typeBadge.style.color = typeInfo.color;
        typeBadge.style.background = typeInfo.color + '15';
        typeBadge.style.borderColor = typeInfo.color + '40';

        // Addresses
        const networkGroups = getNetworkAddress(groups, prefix);
        const firstGroups = getFirstHost(groups, prefix);
        const lastGroups = getLastAddress(groups, prefix);

        // Results grid
        const grid = document.getElementById('v6-results-grid');
        grid.innerHTML = `
            <div class="result-item full-width">
                <span class="result-label">${t('v6.type')}</span>
                <span class="result-value" style="font-size:13px; color:var(--text-dim)">${typeInfo.desc}</span>
            </div>
            <div class="result-item full-width">
                <span class="result-label">${t('v6.network')}</span>
                <span class="result-value">${compressIPv6(networkGroups)}/${prefix}</span>
            </div>
            <div class="result-item full-width">
                <span class="result-label">${t('v6.firstAddr')}</span>
                <span class="result-value">${compressIPv6(firstGroups)}</span>
            </div>
            <div class="result-item full-width">
                <span class="result-label">${t('v6.lastAddr')}</span>
                <span class="result-value">${compressIPv6(lastGroups)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">${t('v6.prefixLen')}</span>
                <span class="result-value">/${prefix}</span>
            </div>
            <div class="result-item">
                <span class="result-label">${t('v6.subnetSize')}</span>
                <span class="result-value">${getSubnetSize(prefix)}</span>
            </div>
        `;

        // Formats
        const formats = document.getElementById('v6-formats');
        formats.innerHTML = `
            <div class="v6-format-block">
                <span class="v6-format-label">${t('v6.expanded')}</span>
                <span class="v6-format-value">${groups.join(':')}</span>
            </div>
            <div class="v6-format-block">
                <span class="v6-format-label">${t('v6.compressed')}</span>
                <span class="v6-format-value">${compressIPv6(groups)}</span>
            </div>
        `;

        // Binary
        const binary = groupsToBinary(groups);
        const binaryGrid = document.getElementById('v6-binary-grid');
        let binaryHTML = '';
        for (let i = 0; i < 8; i++) {
            const groupBin = binary.substring(i * 16, (i + 1) * 16);
            const isNetwork = (i * 16) < prefix;
            const groupHex = groups[i];
            binaryHTML += `
                <div class="v6-binary-row">
                    <span class="v6-binary-hex">${groupHex}</span>
                    <span class="v6-binary-bits${isNetwork ? ' v6-network-bits' : ''}">${groupBin.match(/.{4}/g).join(' ')}</span>
                </div>
            `;
        }
        binaryGrid.innerHTML = binaryHTML;

        resultCard.style.display = 'block';
        resultCard.style.animation = 'none';
        resultCard.offsetHeight; // Trigger reflow
        resultCard.style.animation = 'slideUp 0.3s ease-out';
    }

    function showError(msg) {
        resultCard.style.display = 'none';
        errorMsg.textContent = msg;
        errorCard.style.display = 'block';
    }

    // --- Event Listeners ---
    calcBtn.addEventListener('click', calculate);

    addrInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculate();
        }
    });

    container.querySelectorAll('.v6-examples .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            addrInput.value = chip.dataset.addr;
            // Extract prefix from example
            const match = chip.dataset.addr.match(/\/(\d+)$/);
            if (match) {
                selectedPrefix = parseInt(match[1]);
                prefixChips.forEach(c => c.classList.remove('active'));
                const matching = container.querySelector(`.v6-prefix-chip[data-prefix="${selectedPrefix}"]`);
                if (matching) matching.classList.add('active');
            }
            calculate();
        });
    });
}

function teardown_ipv6_rechner() {
    // No cleanup needed
}
