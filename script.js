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

/* ─── 3D: BLÍSTER EN LA MANO (lightbox) ─────────────────────── */
const MAX_TILT = 12; // grados
const tilt = { rx: 0, ry: 0, gx: 50, gy: 50, go: 0,
               trx: 0, try_: 0, tgx: 50, tgy: 50, tgo: 0,
               raf: 0, gyro: false, base: null, drag: null };
const clamp = (v, a) => Math.max(-a, Math.min(a, v));

function tiltLoop() {
    const k = 0.14;
    tilt.rx += (tilt.trx  - tilt.rx) * k;
    tilt.ry += (tilt.try_ - tilt.ry) * k;
    tilt.gx += (tilt.tgx  - tilt.gx) * k;
    tilt.gy += (tilt.tgy  - tilt.gy) * k;
    tilt.go += (tilt.tgo  - tilt.go) * k;
    const card = document.getElementById('lb-card');
    card.style.setProperty('--rx', tilt.rx.toFixed(2) + 'deg');
    card.style.setProperty('--ry', tilt.ry.toFixed(2) + 'deg');
    card.style.setProperty('--gx', tilt.gx.toFixed(1) + '%');
    card.style.setProperty('--gy', tilt.gy.toFixed(1) + '%');
    card.style.setProperty('--go', tilt.go.toFixed(3));
    const settled = Math.abs(tilt.trx - tilt.rx) + Math.abs(tilt.try_ - tilt.ry) + Math.abs(tilt.tgo - tilt.go) < 0.01;
    const open = document.getElementById('lightbox').classList.contains('open');
    tilt.raf = (open || !settled) ? requestAnimationFrame(tiltLoop) : 0;
}
function kickTilt() { if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltLoop); }

function setTiltTarget(px, py, glare) {
    // px, py: posición relativa 0..1 sobre la tarjeta
    tilt.try_ = clamp((px - 0.5) * 2 * MAX_TILT, MAX_TILT);
    tilt.trx  = clamp(-(py - 0.5) * 2 * MAX_TILT, MAX_TILT);
    tilt.tgx = px * 100;
    tilt.tgy = py * 100;
    tilt.tgo = glare;
    kickTilt();
}
function resetTilt(instant) {
    tilt.trx = tilt.try_ = 0; tilt.tgo = 0; tilt.tgx = tilt.tgy = 50;
    if (instant) {
        tilt.rx = tilt.ry = tilt.go = 0; tilt.gx = tilt.gy = 50;
        const card = document.getElementById('lb-card');
        ['--rx', '--ry'].forEach(v => card.style.setProperty(v, '0deg'));
        card.style.setProperty('--go', '0');
    }
    kickTilt();
}

function onOrientation(e) {
    if (e.beta == null || e.gamma == null) return;
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    tilt.gyro = true;
    if (!tilt.base) tilt.base = { b: e.beta, g: e.gamma };
    const db = clamp(e.beta  - tilt.base.b, 25) / 25; // -1..1
    const dg = clamp(e.gamma - tilt.base.g, 25) / 25;
    setTiltTarget(0.5 + dg / 2, 0.5 + db / 2, 0.9);
}

function setupLightboxTilt() {
    if (reducedMotion.matches) return;
    const lb = document.getElementById('lightbox');
    const card = document.getElementById('lb-card');
    const gyroBtn = document.getElementById('lb-gyro');
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    // PC: la tarjeta sigue al mouse
    lb.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = card.getBoundingClientRect();
        const px = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
        const py = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
        setTiltTarget(px, py, 1);
    });
    lb.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') resetTilt(); });

    // Celular sin giroscopio: inclinar arrastrando con el dedo
    card.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' || tilt.gyro) return;
        tilt.drag = { x: e.clientX, y: e.clientY };
        card.setPointerCapture(e.pointerId);
    });
    card.addEventListener('pointermove', e => {
        if (!tilt.drag) return;
        const dx = (e.clientX - tilt.drag.x) / 160;
        const dy = (e.clientY - tilt.drag.y) / 160;
        setTiltTarget(0.5 + clamp(dx, 0.5), 0.5 + clamp(dy, 0.5), 0.9);
    });
    const endDrag = () => { if (tilt.drag) { tilt.drag = null; resetTilt(); } };
    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);

    // Giroscopio: Android lo da directo; iPhone pide permiso con un botón
    if (coarse && 'DeviceOrientationEvent' in window) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            gyroBtn.hidden = false;
            gyroBtn.addEventListener('click', async e => {
                e.stopPropagation();
                try {
                    if (await DeviceOrientationEvent.requestPermission() === 'granted') {
                        window.addEventListener('deviceorientation', onOrientation);
                    }
                } catch (err) {}
                gyroBtn.hidden = true;
            });
        } else {
            window.addEventListener('deviceorientation', onOrientation);
        }
    }
}

/* ─── 3D: TILT EN LA GRILLA (solo con mouse) ────────────────── */
function setupGridTilt() {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    document.querySelectorAll('.car-images').forEach(grid => {
        grid.addEventListener('pointermove', e => {
            if (!fine.matches || reducedMotion.matches || e.pointerType !== 'mouse') return;
            const img = e.target.closest('img');
            if (!img) return;
            const r = img.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            img.classList.add('tilting');
            img.style.transform =
                `perspective(600px) rotateX(${(-py * 16).toFixed(2)}deg) rotateY(${(px * 16).toFixed(2)}deg) scale(1.04)`;
            img.style.boxShadow = `${(-px * 14).toFixed(1)}px ${(8 - py * 10).toFixed(1)}px 22px rgba(0,0,0,0.28)`;
        });
        grid.addEventListener('pointerout', e => {
            const img = e.target.closest('img');
            if (!img || img.contains(e.relatedTarget)) return;
            clearGridTilt(img);
        });
    });
}
function clearGridTilt(img) {
    img.classList.remove('tilting');
    img.style.transform = '';
    img.style.boxShadow = '';
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
    setupLightboxTilt();
    setupGridTilt();
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
    clearGridTilt(imgElement);
    resetTilt(true);
    tilt.base = null;
    big.src = imgElement.src;
    try { await big.decode(); } catch (e) {}

    lb.classList.add('open');
    kickTilt();
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
    resetTilt(true);

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
