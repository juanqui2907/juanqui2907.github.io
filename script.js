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
    staggerCards(target);

    // En móvil, cerrar el menú tras elegir una pestaña
    if (window.innerWidth <= 768) closeMobileMenu();
}

/* ─── MOVIMIENTO ─────────────────────────────────────────────── */
const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_OUT  = 'cubic-bezier(0.23, 1, 0.32, 1)';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');

// (3) Las primeras 12 tarjetas entran escalonadas; el resto aparece sin esperar.
function staggerCards(tab) {
    const imgs = Array.from(tab.querySelectorAll('.car-images img'));
    imgs.forEach(img => img.classList.remove('enter'));
    void tab.offsetWidth; // reinicia la animación
    imgs.slice(0, 12).forEach((img, i) => {
        img.style.setProperty('--i', i);
        img.classList.add('enter');
    });
}

// (4) Fade de cada imagen al terminar de cargar
function setupImageFades() {
    document.querySelectorAll('.car-images img').forEach(img => {
        const done = () => img.classList.add('loaded');
        if (img.complete) done();
        else {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
        }
        img.addEventListener('animationend', () => img.classList.remove('enter'));
    });
}

// (6) Contador que sube una vez por sesión
function countUp(el, total) {
    let seen = false;
    try { seen = sessionStorage.getItem('counted') === '1'; sessionStorage.setItem('counted', '1'); } catch (e) {}
    if (seen || reducedMotion.matches) {
        el.textContent = total + ' carros y contando...';
        return;
    }
    const duration = 800;
    const start = performance.now();
    const step = now => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * total) + ' carros y contando...';
        if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = '0 carros y contando...';
    requestAnimationFrame(step);
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
    setupImageFades();
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
        if (lb.classList.contains('open')) {
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
    if (el) countUp(el, total);
}

/* ─── LIGHTBOX ───────────────────────────────────────────────── */
let currentTabImages = [];
let currentImageIndex = 0;

let lightboxAnimating = false;

// Transform que lleva la imagen grande a la posición y tamaño de la miniatura
function transformFromThumb(thumb, big) {
    const a = thumb.getBoundingClientRect();
    const b = big.getBoundingClientRect();
    if (!b.width || !b.height) return null;
    const onScreen = a.bottom > 0 && a.top < window.innerHeight && a.width > 0;
    if (!onScreen) return null;
    const dx = (a.left + a.width / 2) - (b.left + b.width / 2);
    const dy = (a.top + a.height / 2) - (b.top + b.height / 2);
    const scale = Math.min(a.width / b.width, a.height / b.height);
    return `translate(${dx}px, ${dy}px) scale(${scale})`;
}

// (1) El carro crece desde su miniatura
async function openLightbox(imgElement) {
    if (lightboxAnimating) return;
    const activeTab = document.querySelector('.tab-content.visible');
    currentTabImages = Array.from(activeTab.querySelectorAll('.car-images img'));
    currentImageIndex = currentTabImages.indexOf(imgElement);

    const lb = document.getElementById('lightbox');
    const big = document.getElementById('lightbox-image');
    big.src = imgElement.src;
    try { await big.decode(); } catch (e) {}

    lb.classList.add('open');
    if (reducedMotion.matches) return;

    const from = transformFromThumb(imgElement, big);
    big.animate(
        from ? [{ transform: from }, { transform: 'none' }]
             : [{ transform: 'scale(0.96)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 300, easing: EASE_EXPO }
    );
}

// Al cerrar vuelve a su miniatura, más rápido que la entrada
function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('open') || lightboxAnimating) return;
    const big = document.getElementById('lightbox-image');
    const thumb = currentTabImages[currentImageIndex];

    if (reducedMotion.matches || !thumb) {
        lb.classList.remove('open');
        return;
    }

    const to = transformFromThumb(thumb, big);
    lightboxAnimating = true;
    lb.classList.remove('open');
    const anim = big.animate(
        to ? [{ transform: 'none' }, { transform: to }]
           : [{ transform: 'none', opacity: 1 }, { transform: 'scale(0.96)', opacity: 0 }],
        { duration: 180, easing: EASE_OUT, fill: 'forwards' }
    );
    anim.onfinish = () => { anim.cancel(); lightboxAnimating = false; };
}

// (2) Siguiente / anterior entra desde el lado de la flecha
async function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentTabImages.length - 1;
    else if (currentImageIndex >= currentTabImages.length) currentImageIndex = 0;

    const big = document.getElementById('lightbox-image');
    const next = currentTabImages[currentImageIndex].src;
    const loader = new Image();
    loader.src = next;
    try { await loader.decode(); } catch (e) {}
    big.src = next;

    big.animate(
        reducedMotion.matches
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ transform: `translateX(${direction * 16}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 180, easing: EASE_OUT }
    );
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
