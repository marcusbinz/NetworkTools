// === Passwort-Generator Tool ===

function init_passwort_gen(container) {
    // --- Character sets ---
    const CHARSETS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    // --- Film Quotes Database (DE + EN) ---
    const FILM_QUOTES = {
        bond: {
            label: 'James Bond',
            color: '#3b82f6',
            quotes: {
                en: [
                    'The name is Bond James Bond',
                    'Shaken not stirred please',
                    'I never miss my target twice',
                    'Nobody does it better than me',
                    'The world is not enough for us',
                    'License to kill and thrill',
                    'Do you expect me to talk No I expect you to die',
                    'A martini shaken not stirred very dry',
                    'I think he got the point dont you',
                    'Keeping the British end up sir',
                ],
                de: [
                    'Mein Name ist Bond James Bond',
                    'Geschuettelt nicht geruehrt bitte',
                    'Ich verfehle mein Ziel niemals zweimal',
                    'Niemand macht es besser als ich',
                    'Die Welt ist nicht genug fuer uns',
                    'Lizenz zum Toeten und Begeistern',
                    'Erwarten Sie dass ich rede Nein ich erwarte dass Sie sterben',
                    'Einen Martini geschuettelt nicht geruehrt sehr trocken',
                    'Ich glaube er hat es verstanden oder nicht',
                    'Halten wir die britische Seite oben Sir',
                ],
            }
        },
        potter: {
            label: 'Harry Potter',
            color: '#eab308',
            quotes: {
                en: [
                    'I solemnly swear that I am up to no good',
                    'It does not do to dwell on dreams and forget to live',
                    'After all this time always said Snape',
                    'Happiness can be found even in the darkest of times',
                    'It is our choices that show what we truly are',
                    'The boy who lived has come to die',
                    'Not my daughter you stupid witch',
                    'Expecto Patronum screamed Harry into the darkness',
                    'Turn to page three hundred and ninety four',
                    'Mischief managed whispered Harry quietly',
                ],
                de: [
                    'Ich schwoere feierlich dass ich ein Tunichtgut bin',
                    'Es tut nicht gut in Traeumen zu leben und das Leben zu vergessen',
                    'Nach all dieser Zeit Immer sagte Snape leise',
                    'Glueck kann selbst in den dunkelsten Zeiten gefunden werden',
                    'Es sind unsere Entscheidungen die zeigen wer wir wirklich sind',
                    'Der Junge der ueberlebte ist gekommen um zu sterben',
                    'Nicht meine Tochter du dumme Hexe',
                    'Expecto Patronum schrie Harry in die Dunkelheit hinein',
                    'Schlagen Sie bitte Seite dreihundertvierundneunzig auf',
                    'Unheil angerichtet fluesterte Harry ganz leise',
                ],
            }
        },
        mission: {
            label: 'Mission Impossible',
            color: '#ef4444',
            quotes: {
                en: [
                    'Your mission should you choose to accept it',
                    'This message will self destruct in five seconds',
                    'Desperate times require desperate measures my friend',
                    'The only thing that matters is what happens next',
                    'I am not going to lose you over this',
                    'Every search for a hero starts with something broken',
                    'How does it feel to be the hunted one',
                    'We are the last line of defense standing now',
                    'The impossible is what we do best together',
                    'Hunt you down wherever you are hiding tonight',
                ],
                de: [
                    'Ihre Mission sollten Sie sich entscheiden sie anzunehmen',
                    'Diese Nachricht wird sich in fuenf Sekunden selbst zerstoeren',
                    'Verzweifelte Zeiten erfordern verzweifelte Massnahmen mein Freund',
                    'Das Einzige was zaehlt ist was als Naechstes passiert',
                    'Ich werde dich deswegen nicht verlieren auf keinen Fall',
                    'Jede Suche nach einem Helden beginnt mit etwas Zerbrochenem',
                    'Wie fuehlt es sich an der Gejagte zu sein',
                    'Wir sind die letzte Verteidigungslinie die jetzt steht',
                    'Das Unmoegliche ist das was wir am besten zusammen koennen',
                    'Jage dich egal wo du dich heute Nacht versteckst',
                ],
            }
        }
    };

    // Leet-Speak substitutions for passphrase generation
    const LEET_MAP = {
        'a': '@', 'e': '3', 'i': '!', 'o': '0', 's': '$',
        't': '7', 'g': '9', 'b': '8', 'l': '1',
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

        <section class="card pw-quote-card">
            <label>Film-Zitat Passwort</label>
            <p class="pw-quote-desc">Erstellt ein merkbares, sicheres Passwort aus Anfangsbuchstaben eines Film-Zitats mit Leet-Speak Substitutionen.</p>

            <label class="pw-film-label">Sprache</label>
            <div class="pw-lang-chips" id="pw-lang-chips">
                <span class="chip pw-lang-chip active" data-lang="de">Deutsch</span>
                <span class="chip pw-lang-chip" data-lang="en">English</span>
            </div>

            <label class="pw-film-label">Film wählen</label>
            <div class="pw-film-chips" id="pw-film-chips">
                ${Object.entries(FILM_QUOTES).map(([key, film], i) =>
                    `<span class="chip pw-film-chip${i === 0 ? ' active' : ''}" data-film="${key}" data-color="${film.color}">${film.label}</span>`
                ).join('')}
            </div>

            <button class="pw-generate-btn pw-quote-btn" id="pw-quote-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Zitat-Passwort generieren
            </button>
        </section>

        <section class="card pw-result-card" id="pw-result-card" style="display:none;">
            <div class="pw-result-header">
                <h3>Generierte Passwörter</h3>
                <span class="pw-strength" id="pw-strength"></span>
            </div>
            <div id="pw-results"></div>
        </section>

        <section class="card pw-quote-result-card" id="pw-quote-result-card" style="display:none;">
            <div class="pw-result-header">
                <h3>Zitat-Passwort</h3>
                <span class="pw-strength" id="pw-quote-strength"></span>
            </div>
            <div class="pw-quote-source" id="pw-quote-source"></div>
            <div class="pw-quote-breakdown" id="pw-quote-breakdown"></div>
            <div id="pw-quote-results"></div>
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

    // --- Language Chips ---
    const langChips = container.querySelectorAll('.pw-lang-chip');
    let selectedLang = 'de';

    langChips.forEach(chip => {
        chip.addEventListener('click', () => {
            langChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedLang = chip.dataset.lang;
        });
    });

    // --- Film Chips ---
    const filmChips = container.querySelectorAll('.pw-film-chip');
    const quoteBtn = document.getElementById('pw-quote-btn');
    const quoteResultCard = document.getElementById('pw-quote-result-card');
    let selectedFilm = 'bond';

    function updateFilmChipColors() {
        filmChips.forEach(c => {
            const color = c.dataset.color;
            if (c.classList.contains('active')) {
                c.style.color = '#fff';
                c.style.borderColor = color;
                c.style.background = color;
            } else {
                c.style.color = color;
                c.style.borderColor = `${color}50`;
                c.style.background = `${color}10`;
            }
        });
    }

    filmChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filmChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedFilm = chip.dataset.film;
            updateFilmChipColors();
        });
    });

    // Init chip colors
    updateFilmChipColors();

    // --- Generate Quote Password ---
    function generateQuotePassword() {
        const film = FILM_QUOTES[selectedFilm];
        if (!film) return;

        // Pick random quote in selected language
        const quotes = film.quotes[selectedLang];
        const rnd = new Uint32Array(1);
        crypto.getRandomValues(rnd);
        const quoteIndex = rnd[0] % quotes.length;
        const quote = quotes[quoteIndex];

        // Extract first letters
        const words = quote.split(/\s+/);
        let initials = words.map(w => w[0]).join('');

        // Build password with leet-speak substitutions
        const rndCase = new Uint32Array(initials.length);
        crypto.getRandomValues(rndCase);

        let password = '';
        const breakdown = [];

        for (let i = 0; i < initials.length; i++) {
            const ch = initials[i].toLowerCase();
            const leetChar = LEET_MAP[ch];

            if (leetChar && rndCase[i] % 3 === 0) {
                // ~33% chance: leet substitution
                password += leetChar;
                breakdown.push({ word: words[i], char: leetChar, type: 'leet' });
            } else if (rndCase[i] % 2 === 0) {
                // ~50% remaining: uppercase
                password += ch.toUpperCase();
                breakdown.push({ word: words[i], char: ch.toUpperCase(), type: 'upper' });
            } else {
                // lowercase
                password += ch;
                breakdown.push({ word: words[i], char: ch, type: 'lower' });
            }
        }

        // Append 2 random digits + 1 special char for extra strength
        const extraRnd = new Uint32Array(3);
        crypto.getRandomValues(extraRnd);
        const digit1 = CHARSETS.digits[extraRnd[0] % CHARSETS.digits.length];
        const digit2 = CHARSETS.digits[extraRnd[1] % CHARSETS.digits.length];
        const specialChar = '!@#$%&*'[extraRnd[2] % 7];
        password += digit1 + digit2 + specialChar;

        // Calculate strength
        const entropy = Math.floor(password.length * Math.log2(72)); // mixed charset ~72
        let strength;
        if (entropy >= 128) strength = { label: 'Sehr stark', color: 'var(--green)', entropy };
        else if (entropy >= 80) strength = { label: 'Stark', color: 'var(--accent)', entropy };
        else if (entropy >= 60) strength = { label: 'Mittel', color: 'var(--orange)', entropy };
        else strength = { label: 'Schwach', color: 'var(--red)', entropy };

        // Render source quote
        const langLabel = selectedLang === 'de' ? 'Deutsch' : 'English';
        const sourceEl = document.getElementById('pw-quote-source');
        sourceEl.innerHTML = `<span class="pw-quote-film" style="color:${film.color}">${film.label} <span class="pw-quote-lang">(${langLabel})</span></span> <span class="pw-quote-text">"${quote}"</span>`;

        // Render breakdown
        const breakdownEl = document.getElementById('pw-quote-breakdown');
        breakdownEl.innerHTML = breakdown.map(b => {
            const cls = b.type === 'leet' ? 'pw-char-special' : b.type === 'upper' ? 'pw-char-upper' : 'pw-char-lower';
            return `<span class="pw-breakdown-item"><span class="pw-breakdown-word">${b.word}</span><span class="pw-breakdown-arrow">&rarr;</span><span class="${cls}">${escapeHtml(b.char)}</span></span>`;
        }).join('');

        // Render strength
        const strengthEl = document.getElementById('pw-quote-strength');
        strengthEl.textContent = `${strength.label} (${strength.entropy} Bit)`;
        strengthEl.style.color = strength.color;
        strengthEl.style.background = strength.color + '15';
        strengthEl.style.borderColor = strength.color + '40';

        // Render password
        const resultsEl = document.getElementById('pw-quote-results');
        resultsEl.innerHTML = `
            <div class="pw-password-row">
                <div class="pw-password-text">${colorizePassword(password)}</div>
                <button class="pw-copy-btn" id="pw-quote-copy" title="Kopieren">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
            </div>
        `;

        document.getElementById('pw-quote-copy').addEventListener('click', function() {
            copyToClipboard(password, this);
        });

        quoteResultCard.style.display = 'block';
        quoteResultCard.style.animation = 'none';
        quoteResultCard.offsetHeight;
        quoteResultCard.style.animation = 'slideUp 0.3s ease-out';
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generate);
    quoteBtn.addEventListener('click', generateQuotePassword);

    // Generate on load
    generate();
}

function teardown_passwort_gen() {
    // No cleanup needed
}
