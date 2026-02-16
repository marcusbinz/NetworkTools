// === Network-Tools — Router, Theme, Tab-Bar ===

// --- Globale Security-Utility: HTML-Escaping gegen XSS ---
function escHtml(str) {
    if (str === null || str === undefined) return '';
    var s = String(str);
    var out = '';
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (c === '&') out += '&amp;';
        else if (c === '<') out += '&lt;';
        else if (c === '>') out += '&gt;';
        else if (c === '"') out += '&quot;';
        else if (c === "'") out += '&#39;';
        else out += c;
    }
    return out;
}

// --- Tool Registry ---
const TOOLS = [
    {
        id: 'ip-rechner',
        label: 'IPv4',
        subtitle: 'IPv4-Rechner',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 8h4M7 12h6M7 16h10"/></svg>',
        cssFile: 'css/ip-rechner.css',
        jsFile: 'js/ip-rechner.js',
    },
    {
        id: 'ipv6-rechner',
        label: 'IPv6',
        subtitle: 'IPv6-Rechner',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        cssFile: 'css/ipv6-rechner.css',
        jsFile: 'js/ipv6-rechner.js',
    },
    {
        id: 'mx-lookup',
        label: 'MX Lookup',
        subtitle: 'MX / SPF / DMARC / DKIM',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        cssFile: 'css/mx-lookup.css',
        jsFile: 'js/mx-lookup.js',
    },
    {
        id: 'email-header',
        label: 'E-Mail',
        subtitle: 'Header Analyzer',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/><line x1="2" y1="20" x2="9" y2="12"/><line x1="22" y1="20" x2="15" y2="12"/></svg>',
        cssFile: 'css/email-header.css',
        jsFile: 'js/email-header.js',
    },
    {
        id: 'dns-lookup',
        label: 'DNS',
        subtitle: 'DNS Lookup',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        cssFile: 'css/dns-lookup.css',
        jsFile: 'js/dns-lookup.js',
    },
    {
        id: 'ssl-tls-checker',
        label: 'SSL/TLS',
        subtitle: 'SSL-Zertifikat & HTTPS Check',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>',
        cssFile: 'css/ssl-tls-checker.css',
        jsFile: 'js/ssl-tls-checker.js',
    },
    {
        id: 'whois-lookup',
        label: 'WHOIS',
        subtitle: 'WHOIS / RDAP Abfrage',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        cssFile: 'css/whois-lookup.css',
        jsFile: 'js/whois-lookup.js',
    },
    {
        id: 'port-referenz',
        label: 'Ports',
        subtitle: 'Port-Referenz',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="3" x2="8" y2="21"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/></svg>',
        cssFile: 'css/port-referenz.css',
        jsFile: 'js/port-referenz.js',
    },
    {
        id: 'blacklist-check',
        label: 'Blacklist',
        subtitle: 'Blacklist Check',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        cssFile: 'css/blacklist-check.css',
        jsFile: 'js/blacklist-check.js',
    },
    {
        id: 'passwort-gen',
        label: 'Passwort',
        subtitle: 'Passwort-Generator',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        cssFile: 'css/passwort-gen.css',
        jsFile: 'js/passwort-gen.js',
    },
    {
        id: 'mein-netzwerk',
        label: 'Netzwerk',
        subtitle: 'Mein Netzwerk',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>',
        cssFile: 'css/mein-netzwerk.css',
        jsFile: 'js/mein-netzwerk.js',
    },
    {
        id: 'ping-test',
        label: 'Ping',
        subtitle: 'Ping / Latenz-Test',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        cssFile: 'css/ping-test.css',
        jsFile: 'js/ping-test.js',
    },
    {
        id: 'netzwerk-rechner',
        label: 'Rechner',
        subtitle: 'Bandbreiten-Rechner',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="12" y1="10" x2="14" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>',
        cssFile: 'css/netzwerk-rechner.css',
        jsFile: 'js/netzwerk-rechner.js',
    },
    {
        id: 'netzwerk-befehle',
        label: 'Befehle',
        subtitle: 'Netzwerk-Befehle',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
        cssFile: 'css/netzwerk-befehle.css',
        jsFile: 'js/netzwerk-befehle.js',
    },
    {
        id: 'qr-generator',
        label: 'QR-Code',
        subtitle: 'QR-Code Generator',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4" rx="0.5"/><line x1="22" y1="14" x2="22" y2="22"/><line x1="14" y1="22" x2="22" y2="22"/><rect x="5" y="5" width="2" height="2"/><rect x="17" y="5" width="2" height="2"/><rect x="5" y="17" width="2" height="2"/></svg>',
        cssFile: 'css/qr-generator.css',
        jsFile: 'js/qr-generator.js',
    },
    {
        id: 'netzwerk-wiki',
        label: 'Wiki',
        subtitle: 'Netzwerk-Wiki',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
        cssFile: 'css/netzwerk-wiki.css',
        jsFile: 'js/netzwerk-wiki.js',
    },
];

// --- DOM References ---
const contentArea = document.getElementById('content');
const subtitle = document.getElementById('subtitle');
let currentToolId = null;

// --- Router ---
function navigateTo(toolId) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) return navigateTo(TOOLS[0].id);
    if (currentToolId === tool.id) return;

    // Teardown previous tool
    if (currentToolId) {
        const teardownFn = window[`teardown_${currentToolId.replace(/-/g, '_')}`];
        if (typeof teardownFn === 'function') teardownFn();
    }

    // Update hash
    if (window.location.hash.slice(1) !== tool.id) {
        window.location.hash = tool.id;
    }

    // Clear content
    contentArea.innerHTML = '';
    subtitle.textContent = tool.subtitle;

    // Load CSS (once)
    if (!document.querySelector(`link[href="${tool.cssFile}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = tool.cssFile;
        document.head.appendChild(link);
    }

    // Load JS (once), then init
    if (!document.querySelector(`script[src="${tool.jsFile}"]`)) {
        const script = document.createElement('script');
        script.src = tool.jsFile;
        script.onload = () => initTool(tool.id);
        document.body.appendChild(script);
    } else {
        initTool(tool.id);
    }

    currentToolId = tool.id;
    updateDrawerActive();
}

function initTool(toolId) {
    const fnName = `init_${toolId.replace(/-/g, '_')}`;
    if (typeof window[fnName] === 'function') {
        window[fnName](contentArea);
    }
}

// --- External Links ---
const EXTERNAL_LINKS = [
    {
        label: 'MXToolbox',
        url: 'https://mxtoolbox.com/',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    },
    {
        label: 'Buy me a Coffee',
        url: 'https://buymeacoffee.com/marcusbinz',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>',
    },
];

// --- Drawer / App Launcher ---
const fab = document.getElementById('launcher-fab');
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('drawer-overlay');
const drawerGrid = document.getElementById('drawer-grid');
let drawerOpen = false;

function renderDrawer() {
    const toolItems = TOOLS.map(tool => `
        <button class="drawer-item" data-tool="${tool.id}">
            <span class="drawer-item-icon">${tool.icon}</span>
            <span class="drawer-item-label">${tool.label}</span>
        </button>
    `).join('');

    const externalItems = EXTERNAL_LINKS.map(link => `
        <a class="drawer-item drawer-item-external" href="${link.url}" target="_blank" rel="noopener">
            <span class="drawer-item-icon">${link.icon}</span>
            <span class="drawer-item-label">${link.label}</span>
        </a>
    `).join('');

    drawerGrid.innerHTML = toolItems + externalItems;

    // Tool click handler
    drawerGrid.addEventListener('click', (e) => {
        const item = e.target.closest('.drawer-item:not(.drawer-item-external)');
        if (item) {
            navigateTo(item.dataset.tool);
            closeDrawer();
        }
    });
}

function openDrawer() {
    drawerOpen = true;
    drawer.classList.add('open');
    overlay.classList.add('open');
    fab.classList.add('active');
    updateDrawerActive();
}

function closeDrawer() {
    drawerOpen = false;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    fab.classList.remove('active');
}

function toggleDrawer() {
    drawerOpen ? closeDrawer() : openDrawer();
}

function updateDrawerActive() {
    drawerGrid.querySelectorAll('.drawer-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tool === currentToolId);
    });
}

fab.addEventListener('click', toggleDrawer);
overlay.addEventListener('click', closeDrawer);

// --- Theme Toggle ---
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('network-tools-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#f1f5f9' : '#0f172a';
}

const savedTheme = localStorage.getItem('network-tools-theme') || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
});

// --- Hash Change ---
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && hash !== currentToolId) {
        currentToolId = null; // Reset to allow re-navigation
        navigateTo(hash);
    }
});

// --- Init ---
renderDrawer();
navigateTo(window.location.hash.slice(1) || 'passwort-gen');

// Register Service Worker + Update Detection
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
        // Check for SW updates every 60 seconds
        setInterval(() => reg.update(), 60000);

        // Detect when a new SW is installed and waiting
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdateBanner();
                }
            });
        });
    });

    // If a waiting SW exists already on page load
    navigator.serviceWorker.ready.then(reg => {
        if (reg.waiting) showUpdateBanner();
    });
}

// Update Banner
function showUpdateBanner() {
    const banner = document.getElementById('update-banner');
    if (banner) banner.classList.add('visible');
}

document.getElementById('update-btn').addEventListener('click', () => {
    // Tell waiting SW to take over, then reload
    navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
    });
});

// Load and display version + check for remote updates
fetch('version.json?_cb=' + Date.now())
    .then(r => r.json())
    .then(v => {
        const el = document.getElementById('footer-version');
        if (el) el.textContent = `v${v.version} • Build ${v.build} • ${v.date}`;

        // Compare with cached version to detect content updates
        const cachedBuild = localStorage.getItem('network-tools-build');
        if (cachedBuild && parseInt(cachedBuild) < v.build) {
            showUpdateBanner();
        }
        localStorage.setItem('network-tools-build', v.build);
    })
    .catch(() => {});
