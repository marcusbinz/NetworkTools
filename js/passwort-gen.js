// === Passwort-Generator Tool ===

function init_passwort_gen(container) {
    // --- Character sets ---
    const CHARSETS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    // --- HTML Template ---
    container.innerHTML = `
        <section class="card pw-input-card">
            <label>Länge: <span id="pw-length-display">20</span> Zeichen</label>
            <div class="pw-slider-row">
                <span class="pw-slider-min">8</span>
                <input type="range" id="pw-length" min="8" max="64" value="20" class="pw-slider">
                <span class="pw-slider-max">64</span>
            </div>

            <label class="pw-options-label">Zeichentypen</label>
            <div class="pw-options" id="pw-options">
                <label class="pw-option">
                    <input type="checkbox" id="pw-upper" checked>
                    <span class="pw-option-text">ABC Großbuchstaben</span>
                </label>
                <label class="pw-option">
                    <input type="checkbox" id="pw-lower" checked>
                    <span class="pw-option-text">abc Kleinbuchstaben</span>
                </label>
                <label class="pw-option">
                    <input type="checkbox" id="pw-digits" checked>
                    <span class="pw-option-text">123 Zahlen</span>
                </label>
                <label class="pw-option">
                    <input type="checkbox" id="pw-special" checked>
                    <span class="pw-option-text">!@# Sonderzeichen</span>
                </label>
            </div>

            <label class="pw-count-label">Anzahl Passwörter</label>
            <div class="pw-count-chips" id="pw-count-chips">
                <span class="chip pw-count-chip active" data-count="1">1</span>
                <span class="chip pw-count-chip" data-count="3">3</span>
                <span class="chip pw-count-chip" data-count="5">5</span>
                <span class="chip pw-count-chip" data-count="10">10</span>
            </div>

            <button class="pw-generate-btn" id="pw-generate-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                Passwort generieren
            </button>
        </section>

        <section class="card pw-result-card" id="pw-result-card" style="display:none;">
            <div class="pw-result-header">
                <h3>Generierte Passwörter</h3>
                <span class="pw-strength" id="pw-strength"></span>
            </div>
            <div id="pw-results"></div>
        </section>

        <section class="card error-card" id="pw-error-card" style="display:none;">
            <p id="pw-error-msg"></p>
        </section>
    `;

    // --- DOM References ---
    const lengthSlider = document.getElementById('pw-length');
    const lengthDisplay = document.getElementById('pw-length-display');
    const generateBtn = document.getElementById('pw-generate-btn');
    const resultCard = document.getElementById('pw-result-card');
    const errorCard = document.getElementById('pw-error-card');
    const errorMsg = document.getElementById('pw-error-msg');
    const countChips = container.querySelectorAll('.pw-count-chip');

    let passwordCount = 1;

    // --- Slider ---
    lengthSlider.addEventListener('input', () => {
        lengthDisplay.textContent = lengthSlider.value;
    });

    // --- Count chips ---
    countChips.forEach(chip => {
        chip.addEventListener('click', () => {
            countChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            passwordCount = parseInt(chip.dataset.count);
        });
    });

    // --- Generate secure random password ---
    function generatePassword(length) {
        const useUpper = document.getElementById('pw-upper').checked;
        const useLower = document.getElementById('pw-lower').checked;
        const useDigits = document.getElementById('pw-digits').checked;
        const useSpecial = document.getElementById('pw-special').checked;

        let charset = '';
        if (useUpper) charset += CHARSETS.upper;
        if (useLower) charset += CHARSETS.lower;
        if (useDigits) charset += CHARSETS.digits;
        if (useSpecial) charset += CHARSETS.special;

        if (!charset) return null;

        // Use crypto.getRandomValues for security
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }

        // Ensure at least one char from each selected set
        const required = [];
        if (useUpper) required.push(CHARSETS.upper);
        if (useLower) required.push(CHARSETS.lower);
        if (useDigits) required.push(CHARSETS.digits);
        if (useSpecial) required.push(CHARSETS.special);

        if (length >= required.length) {
            const positions = new Uint32Array(required.length);
            crypto.getRandomValues(positions);
            const charRandom = new Uint32Array(required.length);
            crypto.getRandomValues(charRandom);

            required.forEach((set, i) => {
                const hasChar = [...password].some(c => set.includes(c));
                if (!hasChar) {
                    const pos = positions[i] % length;
                    const char = set[charRandom[i] % set.length];
                    password = password.substring(0, pos) + char + password.substring(pos + 1);
                }
            });
        }

        return password;
    }

    // --- Calculate password strength ---
    function getStrength(length) {
        const useUpper = document.getElementById('pw-upper').checked;
        const useLower = document.getElementById('pw-lower').checked;
        const useDigits = document.getElementById('pw-digits').checked;
        const useSpecial = document.getElementById('pw-special').checked;

        let poolSize = 0;
        if (useUpper) poolSize += 26;
        if (useLower) poolSize += 26;
        if (useDigits) poolSize += 10;
        if (useSpecial) poolSize += CHARSETS.special.length;

        const entropy = Math.floor(length * Math.log2(poolSize));

        if (entropy >= 128) return { label: 'Sehr stark', color: 'var(--green)', entropy };
        if (entropy >= 80) return { label: 'Stark', color: 'var(--accent)', entropy };
        if (entropy >= 60) return { label: 'Mittel', color: 'var(--orange)', entropy };
        return { label: 'Schwach', color: 'var(--red)', entropy };
    }

    // --- Copy to clipboard ---
    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.innerHTML;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
            btn.classList.add('pw-copied');
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.classList.remove('pw-copied');
            }, 1500);
        });
    }

    // --- Generate ---
    function generate() {
        const length = parseInt(lengthSlider.value);

        const pw = generatePassword(length);
        if (!pw) {
            errorMsg.textContent = 'Bitte mindestens einen Zeichentyp auswählen.';
            errorCard.style.display = 'block';
            resultCard.style.display = 'none';
            return;
        }

        errorCard.style.display = 'none';

        // Strength
        const strength = getStrength(length);
        const strengthEl = document.getElementById('pw-strength');
        strengthEl.textContent = `${strength.label} (${strength.entropy} Bit)`;
        strengthEl.style.color = strength.color;
        strengthEl.style.background = strength.color + '15';
        strengthEl.style.borderColor = strength.color + '40';

        // Generate passwords
        const passwords = [];
        for (let i = 0; i < passwordCount; i++) {
            passwords.push(generatePassword(length));
        }

        const resultsEl = document.getElementById('pw-results');
        resultsEl.innerHTML = passwords.map((p, i) => `
            <div class="pw-password-row">
                <div class="pw-password-text" id="pw-text-${i}">${colorizePassword(p)}</div>
                <button class="pw-copy-btn" data-index="${i}" title="Kopieren">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
            </div>
        `).join('');

        // Store raw passwords for copy
        resultsEl.querySelectorAll('.pw-copy-btn').forEach(btn => {
            const idx = parseInt(btn.dataset.index);
            btn.addEventListener('click', () => copyToClipboard(passwords[idx], btn));
        });

        resultCard.style.display = 'block';
        resultCard.style.animation = 'none';
        resultCard.offsetHeight;
        resultCard.style.animation = 'slideUp 0.3s ease-out';
    }

    // --- Colorize password for display ---
    function colorizePassword(pw) {
        return [...pw].map(c => {
            if (CHARSETS.upper.includes(c)) return `<span class="pw-char-upper">${c}</span>`;
            if (CHARSETS.lower.includes(c)) return `<span class="pw-char-lower">${c}</span>`;
            if (CHARSETS.digits.includes(c)) return `<span class="pw-char-digit">${c}</span>`;
            return `<span class="pw-char-special">${escapeHtml(c)}</span>`;
        }).join('');
    }

    function escapeHtml(str) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return str.replace(/[&<>"']/g, c => map[c] || c);
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generate);

    // Generate on load
    generate();
}

function teardown_passwort_gen() {
    // No cleanup needed
}
