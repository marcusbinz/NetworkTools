// === Network-Tools — Router, Theme, Tab-Bar ===

// --- Tool Registry ---
const TOOLS = [
    {
        id: 'ip-rechner',
        label: 'IP-Rechner',
        subtitle: 'IPv4 Subnetz-Rechner',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 8h4M7 12h6M7 16h10"/></svg>',
        cssFile: 'css/ip-rechner.css',
        jsFile: 'js/ip-rechner.js',
    },
    {
        id: 'mx-lookup',
        label: 'MX Lookup',
        subtitle: 'MX Record Abfrage',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        cssFile: 'css/mx-lookup.css',
        jsFile: 'js/mx-lookup.js',
    },
    {
        id: 'dns-lookup',
        label: 'DNS',
        subtitle: 'DNS Lookup',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        cssFile: 'css/dns-lookup.css',
        jsFile: 'js/dns-lookup.js',
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

    // Update tab bar
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tool === tool.id);
    });

    currentToolId = tool.id;
}

function initTool(toolId) {
    const fnName = `init_${toolId.replace(/-/g, '_')}`;
    if (typeof window[fnName] === 'function') {
        window[fnName](contentArea);
    }
}

// --- External Links in Tab Bar ---
const EXTERNAL_LINKS = [
    {
        label: 'MXToolbox',
        url: 'https://mxtoolbox.com/',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    },
];

// --- Tab Bar ---
function renderTabBar() {
    const tabBar = document.getElementById('tab-bar');

    const toolTabs = TOOLS.map(tool => `
        <button class="tab-item" data-tool="${tool.id}">
            <span class="tab-icon">${tool.icon}</span>
            <span class="tab-label">${tool.label}</span>
        </button>
    `).join('');

    const externalTabs = EXTERNAL_LINKS.map(link => `
        <a class="tab-item tab-external" href="${link.url}" target="_blank" rel="noopener">
            <span class="tab-icon">${link.icon}</span>
            <span class="tab-label">${link.label}</span>
        </a>
    `).join('');

    tabBar.innerHTML = toolTabs + externalTabs;

    tabBar.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab-item:not(.tab-external)');
        if (tab) navigateTo(tab.dataset.tool);
    });
}

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
renderTabBar();
navigateTo(window.location.hash.slice(1) || TOOLS[0].id);

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
