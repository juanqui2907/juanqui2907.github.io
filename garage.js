/* ─── 3D: GARAJE ──────────────────────────────────────────────
   Un carro de juguete genérico hecho con geometría de three.js,
   con pintura metalizada tipo caramelo. Gira solo, se arrastra
   para rotarlo y al tocarlo cambia de color.
──────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const garage = document.getElementById('garage');
const canvas = document.getElementById('garage-canvas');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const COLORS = ['#d3121f', '#1d5fd6', '#13a35a', '#7b2fd8', '#e7a300', '#e2457f', '#14b5c9'];
let colorIndex = 0;

let renderer;
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
    garage.classList.add('failed');
    throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(28, 2, 0.1, 100);
camera.position.set(4.9, 2.1, 5.7);
camera.lookAt(0, 0.5, 0);

const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(4, 6, 3);
scene.add(key);

/* ─── Materiales ─── */
const paint = new THREE.MeshPhysicalMaterial({
    color: COLORS[0], metalness: 0.65, roughness: 0.22,
    clearcoat: 1, clearcoatRoughness: 0.04,
});
const glass = new THREE.MeshPhysicalMaterial({
    color: 0x0c1218, metalness: 0.1, roughness: 0.05, clearcoat: 1,
});
const tire   = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85 });
const chrome = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: 0.18 });
const head   = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4d6, emissiveIntensity: 1.4 });
const tail   = new THREE.MeshStandardMaterial({ color: 0x550000, emissive: 0xff1a1a, emissiveIntensity: 1.2 });

/* ─── Carro ─── */
const car = new THREE.Group();
const W = 1.8; // ancho

function extrude(shape, depth, bevel = 0.08) {
    const g = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel,
        bevelSegments: 4, curveSegments: 18,
    });
    g.translate(0, 0, -depth / 2);
    return g;
}

// Carrocería baja (perfil lateral)
const body = new THREE.Shape();
body.moveTo(-2.15, 0.32);
body.lineTo(2.05, 0.32);
body.quadraticCurveTo(2.3, 0.34, 2.28, 0.6);
body.quadraticCurveTo(1.9, 0.8, 1.25, 0.86);
body.lineTo(-1.85, 0.94);
body.quadraticCurveTo(-2.2, 0.92, -2.22, 0.75);
body.lineTo(-2.15, 0.32);
car.add(new THREE.Mesh(extrude(body, W - 0.16), paint));

// Cabina de vidrio
const cabin = new THREE.Shape();
cabin.moveTo(1.15, 0.84);
cabin.quadraticCurveTo(0.6, 1.12, 0.2, 1.22);
cabin.lineTo(-0.85, 1.22);
cabin.quadraticCurveTo(-1.4, 1.1, -1.75, 0.9);
cabin.lineTo(1.15, 0.84);
car.add(new THREE.Mesh(extrude(cabin, W * 0.74, 0.06), glass));

// Techo pintado
const roof = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.07, W * 0.74 + 0.1, 3, 0.03), paint);
roof.position.set(-0.32, 1.27, 0);
car.add(roof);

// Luces
const hl = new RoundedBoxGeometry(0.06, 0.08, 0.36, 2, 0.02);
const tl = new RoundedBoxGeometry(0.06, 0.08, 0.42, 2, 0.02);
[-1, 1].forEach(side => {
    const h = new THREE.Mesh(hl, head);
    h.position.set(2.3, 0.56, side * 0.58);
    car.add(h);
    const t = new THREE.Mesh(tl, tail);
    t.position.set(-2.27, 0.74, side * 0.56);
    car.add(t);
});

// Ruedas
const wheels = [];
const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 32);
const rimGeo  = new THREE.CylinderGeometry(0.22, 0.22, 0.32, 24);
const hubGeo  = new THREE.CylinderGeometry(0.07, 0.07, 0.34, 12);
[[1.38, 1], [1.38, -1], [-1.32, 1], [-1.32, -1]].forEach(([x, side]) => {
    const w = new THREE.Group();
    w.add(new THREE.Mesh(tireGeo, tire));
    w.add(new THREE.Mesh(rimGeo, chrome));
    w.add(new THREE.Mesh(hubGeo, tire));
    w.rotation.x = Math.PI / 2;
    w.position.set(x, 0.38, side * (W / 2 + 0.04));
    car.add(w);
    wheels.push(w);
});

// Sombra suave en el piso
const sc = document.createElement('canvas');
sc.width = sc.height = 128;
const sx = sc.getContext('2d');
const grad = sx.createRadialGradient(64, 64, 4, 64, 64, 64);
grad.addColorStop(0, 'rgba(0,0,0,0.45)');
grad.addColorStop(1, 'rgba(0,0,0,0)');
sx.fillStyle = grad;
sx.fillRect(0, 0, 128, 128);
const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 2.8),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.005;

const turntable = new THREE.Group();
turntable.add(car, shadow);
turntable.rotation.y = -0.6;
scene.add(turntable);

/* ─── Tamaño ─── */
function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w / h < 1.6 ? 34 : 28;
        camera.updateProjectionMatrix();
    }
    return true;
}

/* ─── Interacción ─── */
const AUTO_SPIN = 0.35;   // rad/s
let velocity = AUTO_SPIN; // rad/s
let drag = null;
let hop = 0;              // salto al cambiar color (0..1)
let fromColor = new THREE.Color(), toColor = new THREE.Color(COLORS[0]), colorT = 1;

canvas.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), last: e.clientX, lastT: performance.now(), moved: false };
    canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.last;
    const now = performance.now();
    if (Math.abs(e.clientX - drag.x) > 6) drag.moved = true;
    turntable.rotation.y += dx * 0.012;
    velocity = (dx * 0.012) / Math.max((now - drag.lastT) / 1000, 0.008);
    drag.last = e.clientX;
    drag.lastT = now;
    kick();
});
const release = () => {
    if (!drag) return;
    const tap = !drag.moved && performance.now() - drag.t < 300;
    drag = null;
    if (tap) nextColor();
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', () => { drag = null; });

function nextColor() {
    colorIndex = (colorIndex + 1) % COLORS.length;
    fromColor.copy(paint.color);
    toColor.set(COLORS[colorIndex]);
    colorT = 0;
    if (!reduced.matches) hop = 1;
    kick();
}

/* ─── Bucle (se pausa fuera de pantalla) ─── */
let visible = false, raf = 0, last = 0;

function frame(now) {
    raf = 0;
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    if (!resize()) return;

    if (!drag) {
        const target = reduced.matches ? 0 : AUTO_SPIN;
        velocity += (target - velocity) * Math.min(dt * 2.5, 1); // inercia que vuelve al giro normal
        turntable.rotation.y += velocity * dt;
    }
    wheels.forEach(w => { w.rotation.y += velocity * dt * 2.2; });

    if (colorT < 1) {
        colorT = Math.min(colorT + dt / 0.35, 1);
        paint.color.copy(fromColor).lerp(toColor, 1 - Math.pow(1 - colorT, 3));
    }
    if (hop > 0) {
        hop = Math.max(hop - dt / 0.45, 0);
        car.position.y = Math.sin((1 - hop) * Math.PI) * 0.22;
    }

    renderer.render(scene, camera);

    const idle = reduced.matches && !drag && Math.abs(velocity) < 0.001 && colorT >= 1 && hop === 0;
    if (visible && !idle) raf = requestAnimationFrame(frame);
    else last = 0;
}
function kick() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
}

new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && !document.hidden;
    if (visible) kick();
}, { threshold: 0.05 }).observe(canvas);

document.addEventListener('visibilitychange', () => {
    visible = !document.hidden && canvas.offsetParent !== null;
    if (visible) kick();
});
new ResizeObserver(() => kick()).observe(canvas);
reduced.addEventListener('change', kick);
