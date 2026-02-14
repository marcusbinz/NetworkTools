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
    // Future tools:
    // {
    //     id: 'port-referenz',
    //     label: 'Ports',
    //     subtitle: 'Port-Referenz',
    //     icon: '<svg ...>...</svg>',
    //     cssFile: 'css/port-referenz.css',
    //     jsFile: 'js/port-referenz.js',
    // },
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

// --- Tab Bar ---
function renderTabBar() {
    const tabBar = document.getElementById('tab-bar');
    tabBar.innerHTML = TOOLS.map(tool => `
        <button class="tab-item" data-tool="${tool.id}">
            <span class="tab-icon">${tool.icon}</span>
            <span class="tab-label">${tool.label}</span>
        </button>
    `).join('');

    tabBar.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab-item');
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
