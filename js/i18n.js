// === Internationalisierung (i18n) ===
// Sprachverwaltung fuer Network-Tools (DE/EN)

var I18N = (function() {

    // Aktuelle Sprache aus localStorage oder Default DE
    var lang = localStorage.getItem('network-tools-lang') || 'de';

    // Zentrales String-Register — Tools registrieren sich hier
    var strings = { de: {}, en: {} };

    // --- Sprache abrufen ---
    function getLang() {
        return lang;
    }

    // --- Sprache setzen + Event feuern ---
    function setLang(newLang) {
        lang = newLang;
        localStorage.setItem('network-tools-lang', lang);
        document.documentElement.setAttribute('lang', lang);
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    }

    // --- Strings registrieren (von Tools oder lang-Dateien) ---
    // namespace: z.B. 'app', 'dns', 'nb'
    // langStrings: { de: { key: val }, en: { key: val } }
    function register(namespace, langStrings) {
        Object.keys(langStrings).forEach(function(l) {
            if (!strings[l]) strings[l] = {};
            var obj = langStrings[l];
            Object.keys(obj).forEach(function(k) {
                strings[l][namespace + '.' + k] = obj[k];
            });
        });
    }

    // --- Uebersetzung holen ---
    // Lookup: aktuelle Sprache -> Fallback DE -> Fallback Key
    // params: { name: 'Wert' } ersetzt {name} im String
    function t(key, params) {
        var str = (strings[lang] && strings[lang][key])
               || (strings['de'] && strings['de'][key])
               || key;
        if (params) {
            Object.keys(params).forEach(function(k) {
                str = str.split('{' + k + '}').join(params[k]);
            });
        }
        return str;
    }

    // --- Statische data-i18n Elemente aktualisieren ---
    function updateStaticElements() {
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            var translated = t(key);
            if (translated !== key) {
                el.textContent = translated;
            }
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
            var key = el.getAttribute('data-i18n-aria');
            var translated = t(key);
            if (translated !== key) {
                el.setAttribute('aria-label', translated);
            }
        });
    }

    // HTML lang-Attribut initial setzen
    document.documentElement.setAttribute('lang', lang);

    return {
        getLang: getLang,
        setLang: setLang,
        register: register,
        t: t,
        updateStaticElements: updateStaticElements
    };
})();

// Globale Kurzform
var t = I18N.t;

// === App-Shell Strings (Header, Footer, Update-Banner) ===
I18N.register('app', {
    de: {
        // Header
        'themeToggle':      'Theme wechseln',
        'langToggle':       'Sprache wechseln',
        'toolsOpen':        'Tools oeffnen',

        // Footer
        'installHint':      'Installiere als App: Teilen \u2192 Zum Home-Bildschirm',
        'copyright':        '\u00A9 2026 Dipl.-Ing. Marcus Binz \u2014 with my CoPilot Claude Code',
        'impressum':        'Impressum',
        'datenschutz':      'Datenschutz',

        // Update Banner
        'updateAvailable':  'Update verf\u00FCgbar',
        'updateNow':        'Jetzt aktualisieren',

        // Tool Subtitles
        'sub.ip-rechner':       'IPv4-Rechner',
        'sub.ipv6-rechner':     'IPv6-Rechner',
        'sub.mx-lookup':        'MX / SPF / DMARC / DKIM',
        'sub.email-header':     'Header Analyzer',
        'sub.dns-lookup':       'DNS Lookup',
        'sub.ssl-tls-checker':  'SSL-Zertifikat & HTTPS Check',
        'sub.whois-lookup':     'WHOIS / RDAP Abfrage',
        'sub.port-referenz':    'Port-Referenz',
        'sub.blacklist-check':  'Blacklist Check',
        'sub.passwort-gen':     'Passwort-Generator',
        'sub.mein-netzwerk':    'Mein Netzwerk',
        'sub.ping-test':        'Ping / Latenz-Test',
        'sub.netzwerk-rechner': 'Bandbreiten-Rechner',
        'sub.netzwerk-befehle': 'Befehls-Referenz',
        'sub.qr-generator':    'QR-Code Generator',
        'sub.netzwerk-wiki':    'Netzwerk-Wiki',

        // Tool Labels (Drawer)
        'label.ip-rechner':       'IPv4',
        'label.ipv6-rechner':     'IPv6',
        'label.mx-lookup':        'MX Lookup',
        'label.email-header':     'E-Mail',
        'label.dns-lookup':       'DNS',
        'label.ssl-tls-checker':  'SSL/TLS',
        'label.whois-lookup':     'WHOIS',
        'label.port-referenz':    'Ports',
        'label.blacklist-check':  'Blacklist',
        'label.passwort-gen':     'Passwort',
        'label.mein-netzwerk':    'Netzwerk',
        'label.ping-test':        'Ping',
        'label.netzwerk-rechner': 'Rechner',
        'label.netzwerk-befehle': 'Befehle',
        'label.qr-generator':    'QR-Code',
        'label.netzwerk-wiki':    'Wiki',
    },
    en: {
        // Header
        'themeToggle':      'Toggle theme',
        'langToggle':       'Change language',
        'toolsOpen':        'Open tools',

        // Footer
        'installHint':      'Install as app: Share \u2192 Add to home screen',
        'copyright':        '\u00A9 2026 Dipl.-Ing. Marcus Binz \u2014 with my CoPilot Claude Code',
        'impressum':        'Legal Notice',
        'datenschutz':      'Privacy Policy',

        // Update Banner
        'updateAvailable':  'Update available',
        'updateNow':        'Update now',

        // Tool Subtitles
        'sub.ip-rechner':       'IPv4 Calculator',
        'sub.ipv6-rechner':     'IPv6 Calculator',
        'sub.mx-lookup':        'MX / SPF / DMARC / DKIM',
        'sub.email-header':     'Header Analyzer',
        'sub.dns-lookup':       'DNS Lookup',
        'sub.ssl-tls-checker':  'SSL Certificate & HTTPS Check',
        'sub.whois-lookup':     'WHOIS / RDAP Query',
        'sub.port-referenz':    'Port Reference',
        'sub.blacklist-check':  'Blacklist Check',
        'sub.passwort-gen':     'Password Generator',
        'sub.mein-netzwerk':    'My Network',
        'sub.ping-test':        'Ping / Latency Test',
        'sub.netzwerk-rechner': 'Bandwidth Calculator',
        'sub.netzwerk-befehle': 'Command Reference',
        'sub.qr-generator':    'QR Code Generator',
        'sub.netzwerk-wiki':    'Network Wiki',

        // Tool Labels (Drawer)
        'label.ip-rechner':       'IPv4',
        'label.ipv6-rechner':     'IPv6',
        'label.mx-lookup':        'MX Lookup',
        'label.email-header':     'Email',
        'label.dns-lookup':       'DNS',
        'label.ssl-tls-checker':  'SSL/TLS',
        'label.whois-lookup':     'WHOIS',
        'label.port-referenz':    'Ports',
        'label.blacklist-check':  'Blacklist',
        'label.passwort-gen':     'Password',
        'label.mein-netzwerk':    'Network',
        'label.ping-test':        'Ping',
        'label.netzwerk-rechner': 'Calculator',
        'label.netzwerk-befehle': 'Commands',
        'label.qr-generator':    'QR Code',
        'label.netzwerk-wiki':    'Wiki',
    }
});
