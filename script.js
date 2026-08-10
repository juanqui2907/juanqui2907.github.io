/* ─── TAB NAVIGATION ─────────────────────────────────────────── */
let currentActiveTab = 'about';

function openTab(event, tabName) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('visible');
    });
    document.querySelectorAll('.tab-link').forEach(el => {
        el.classList.remove('active');
    });

    const target = document.getElementById(tabName);
    target.classList.add('visible');
    event.currentTarget.classList.add('active');
    currentActiveTab = tabName;

    // En móvil, cerrar el menú tras elegir una pestaña
    if (window.innerWidth <= 768) closeMobileMenu();
}

/* ─── MENÚ HAMBURGUESA (MÓVIL) ───────────────────────────────── */
function toggleMobileMenu() {
    const menu = document.getElementById('tab-menu');
    const toggle = document.getElementById('menu-toggle');
    const backdrop = document.querySelector('.menu-backdrop');
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    backdrop.classList.toggle('open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
}

function closeMobileMenu() {
    const menu = document.getElementById('tab-menu');
    const toggle = document.getElementById('menu-toggle');
    const backdrop = document.querySelector('.menu-backdrop');
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    toggle.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.tab-link').click();
    addCountBadges();
    updateTotalCounter();

    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.addEventListener('click', e => {
            const img = e.target.closest('.car-images img');
            if (img) openLightbox(img);
        });
    });

    document.addEventListener('keydown', e => {
        const lb = document.getElementById('lightbox');
        if (lb.style.display === 'flex') {
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowRight') changeImage(1);
            if (e.key === 'ArrowLeft')  changeImage(-1);
        }
    });

    document.getElementById('lightbox').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeLightbox();
    });

    if (localStorage.getItem('theme') === 'dark') {
        applyDark();
        const label = document.getElementById('toggle-label');
        if (label) label.textContent = '☀️';
    }
});

/* ─── CONTADORES ─────────────────────────────────────────────── */
// Cada imagen normalmente representa 1 carro. Para paquetes (por ejemplo x5),
// se puede indicar cuántos carros contiene usando data-count="5" en la imagen.
function countCarsWithin(container) {
    return Array.from(container.querySelectorAll('.car-images img')).reduce((total, img) => {
        const amount = Number.parseInt(img.dataset.count || '1', 10);
        return total + (Number.isFinite(amount) && amount > 0 ? amount : 1);
    }, 0);
}

function addCountBadges() {
    document.querySelectorAll('.tab-link').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/'([^']+)'\s*\)/);
        if (!match) return;
        const tabId = match[1];
        if (tabId === 'cars-to-get') return; // No son carros coleccionados
        const tabEl = document.getElementById(tabId);
        if (!tabEl) return;
        const count = countCarsWithin(tabEl);
        if (count > 0) {
            btn.innerHTML = btn.textContent.trim() +
                ' <span class="tab-badge">' + count + '</span>';
        }
    });

    document.querySelectorAll('.tab-content').forEach(tab => {
        const titles    = Array.from(tab.querySelectorAll('.section-title'));
        const galleries = Array.from(tab.querySelectorAll('.car-images'));
        titles.forEach((title, i) => {
            if (!galleries[i]) return;
            const n = countCarsWithin(galleries[i]);
            const badge = document.createElement('span');
            badge.className = 'section-badge';
            badge.textContent = ' (' + n + ')';
            title.appendChild(badge);
        });
    });
}

function updateTotalCounter() {
    // Cuenta carros reales, no cantidad de fotos. La lista de deseos se excluye.
    const collectedTabs = Array.from(document.querySelectorAll('.tab-content'))
        .filter(tab => tab.id !== 'cars-to-get' && tab.id !== 'about');
    const total = collectedTabs.reduce((sum, tab) => sum + countCarsWithin(tab), 0);
    const el = document.querySelector('#about strong');
    if (el) el.textContent = total + ' carros y contando...';
}

/* ─── LIGHTBOX ───────────────────────────────────────────────── */
let currentTabImages = [];
let currentImageIndex = 0;

function openLightbox(imgElement) {
    const activeTab = document.querySelector('.tab-content.visible');
    currentTabImages = Array.from(activeTab.querySelectorAll('.car-images img'));
    currentImageIndex = currentTabImages.indexOf(imgElement);
    document.getElementById('lightbox-image').src = imgElement.src;
    document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentTabImages.length - 1;
    else if (currentImageIndex >= currentTabImages.length) currentImageIndex = 0;
    document.getElementById('lightbox-image').src = currentTabImages[currentImageIndex].src;
}

/* ─── MODO OSCURO ────────────────────────────────────────────── */
function applyDark() {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-toggle').classList.add('dark');
}

function removeDark() {
    document.body.classList.remove('dark-mode');
    document.getElementById('theme-toggle').classList.remove('dark');
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        removeDark();
        localStorage.setItem('theme', 'light');
    } else {
        applyDark();
        localStorage.setItem('theme', 'dark');
    }
    const label = document.getElementById('toggle-label');
    if (label) label.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

/* ─── ACTUALIZA EMOJI DEL BOTÓN ──────────────────────────────── */
function updateToggleLabel() {
    const label = document.getElementById('toggle-label');
    if (!label) return;
    label.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// Sobrescribir para incluir label update
const _applyDark   = applyDark;
const _removeDark  = removeDark;

applyDark  = function() { _applyDark();  updateToggleLabel(); };
removeDark = function() { _removeDark(); updateToggleLabel(); };
