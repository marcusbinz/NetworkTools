// === Home / Startseite ===

function init_home(container) {

    // --- i18n ---
    I18N.register('home', {
        de: {
            welcome: 'Network-Tools',
            desc: 'Deine Toolbox für Netzwerk-Analyse, Diagnose und Nachschlagewerke — als Progressive Web App direkt im Browser, auch offline nutzbar.',
            stats: '{tools} Tools · {wiki} Wiki-Artikel · {cmds} Netzwerkbefehle · Offline-fähig',
            news: 'Neuigkeiten',
            author: 'Autor',
        },
        en: {
            welcome: 'Network-Tools',
            desc: 'Your toolbox for network analysis, diagnostics and references — as a Progressive Web App right in your browser, usable offline.',
            stats: '{tools} Tools · {wiki} Wiki articles · {cmds} network commands · Offline-ready',
            news: "What's New",
            author: 'Author',
        },
    });
    const t = I18N.t;
    const lang = I18N.getLang();

    // --- Changelog (letzte Änderungen) ---
    const CHANGELOG = [
        { ver: '5.2.7', de: 'Netzwerk-Befehle: 54 Befehle vollständig DE/EN übersetzt', en: 'Network Commands: 54 commands fully translated DE/EN' },
        { ver: '5.2.6', de: 'Netzwerk-Wiki: 94 Artikel mit Tags vollständig DE/EN', en: 'Network Wiki: 94 articles with tags fully DE/EN' },
        { ver: '5.2.5', de: 'Port-Referenz: 58 Port-Beschreibungen DE/EN', en: 'Port Reference: 58 port descriptions DE/EN' },
        { ver: '5.2.0', de: 'Sprachwechsel DE/EN — App jetzt zweisprachig', en: 'Language toggle DE/EN — app now bilingual' },
        { ver: '5.1.0', de: 'Neue Startseite mit Tool-Übersicht', en: 'New home page with tool overview' },
    ];

    // --- Fakten-Zeile ---
    const toolCount = typeof TOOLS !== 'undefined' ? TOOLS.length : 15;
    const statsText = t('home.stats')
        .replace('{tools}', toolCount)
        .replace('{wiki}', '94')
        .replace('{cmds}', '54');

    const changelogHtml = CHANGELOG.map(entry => `
        <div class="home-change">
            <span class="home-ver-badge">v${entry.ver}</span>
            <span class="home-change-text">${entry[lang] || entry.de}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <section class="home-hero">
            <div class="home-logo">
                <svg width="128" height="128" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="home-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#38bdf8"/>
                            <stop offset="100%" stop-color="#a78bfa"/>
                        </linearGradient>
                    </defs>
                    <circle cx="16" cy="10" r="3" fill="url(#home-grad)"/>
                    <circle cx="8" cy="22" r="3" fill="url(#home-grad)"/>
                    <circle cx="24" cy="22" r="3" fill="url(#home-grad)"/>
                    <line x1="16" y1="13" x2="8" y2="19" stroke="#38bdf8" stroke-width="1.5" opacity="0.5"/>
                    <line x1="16" y1="13" x2="24" y2="19" stroke="#a78bfa" stroke-width="1.5" opacity="0.5"/>
                    <line x1="8" y1="22" x2="24" y2="22" stroke="#38bdf8" stroke-width="1.5" opacity="0.35"/>
                </svg>
            </div>
            <p class="home-desc">${t('home.desc')}</p>
            <p class="home-stats">${statsText}</p>
        </section>

        <section class="card home-changelog-section">
            <h3 class="home-section-heading">${t('home.news')}</h3>
            <div class="home-changelog">${changelogHtml}</div>
        </section>

        <div class="home-footer">
            <span>${document.getElementById('footer-version')?.textContent || ''}</span>
            <span class="home-footer-sep">·</span>
            <span>${t('home.author')}: Dipl.-Ing. Marcus Binz</span>
        </div>
    `;
}

function teardown_home() {
    // No cleanup needed
}
