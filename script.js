// ======= Config =======
const SECRET_TARGET = 9;        // cuántas “acciones” para desbloquear
const HOLD_MS = 900;            // mantener presionado para modo secreto
const MAX_BUBBLES = 3;

const COQUETAS = [
    "Ok… esto NO es soporte 😅",
    "Te juro que esto es un detalle bonito 🤍",
    "Si sonríes tantito, ya gané 😊",
    "No sé por qué, pero esto me dio ternura…",
    "Tu toque hace que todo se vea más bonito ✨",
    "Sigue tocando… hay un secretito 🙈",
    "Esto está hecho con calma, y con cariño 😌",
    "Hoy mereces algo diferente 🎈",
    "Prometo que esto es solo para sacarte una sonrisa 🤫"
];

const IT_JOKE = [
    "Inicializando soporte…",
    "Buscando monitor… (no aparece) 😅",
    "Reiniciando… nah, es broma 😏",
    "Error 404: esto NO es IT"
];

const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d", { alpha: true });

const statusPill = document.getElementById("statusPill");
const lockIcon = document.getElementById("lockIcon");
const lockText = document.getElementById("lockText");
const bubbleArea = document.getElementById("bubbleArea");
const final = document.getElementById("final");
const replayBtn = document.getElementById("replayBtn");

// ======= State =======
let w = 0, h = 0, dpr = 1;
let particles = [];
let ripples = [];
let secretCount = 0;
let holdTimer = null;
let lastTouch = { x: 0, y: 0 };
let hue = 330; // para el fondo reactivo
let lastBubbleAt = 0;

// ======= Helpers =======
function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize, { passive: true });
resize();

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function setPill(text) {
    statusPill.innerHTML = `${text} <span class="blink">●</span>`;
}

function updateLock() {
    lockText.textContent = `Secreto: ${secretCount}/${SECRET_TARGET}`;
    if (secretCount >= SECRET_TARGET) {
        lockIcon.textContent = "🔓";
    } else {
        lockIcon.textContent = "🔒";
    }
}

// Fondo “reactivo”: cambia hue según dónde toque/arrastre
function applyReactiveBackground(x, y) {
    const nx = x / w;
    const ny = y / h;
    hue = (hue + 14 + nx * 18) % 360;
    const a = clamp(0.20 + ny * 0.25, 0.18, 0.45);
    const b = clamp(0.18 + nx * 0.22, 0.16, 0.42);

    document.body.style.background =
        `radial-gradient(1200px 800px at ${Math.floor(nx * 100)}% ${Math.floor(ny * 100)}%, hsla(${hue}, 95%, 70%, ${a}), transparent 55%),
     radial-gradient(900px 700px at ${Math.floor((1 - nx) * 100)}% ${Math.floor((ny * 0.6 + 0.2) * 100)}%, hsla(${(hue + 70) % 360}, 95%, 65%, ${b}), transparent 55%),
     linear-gradient(135deg, #0b0f1a, #05070d)`;
}

// Partículas (corazones/estrellitas)
function spawnBurst(x, y, power = 1) {
    const count = Math.floor(14 * power);
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: rand(-2.2, 2.2) * power,
            vy: rand(-3.2, -0.8) * power,
            g: 0.08 + Math.random() * 0.08,
            life: rand(40, 70),
            size: rand(10, 18),
            rot: rand(-0.15, 0.15),
            kind: Math.random() < 0.55 ? "heart" : "spark",
            hue: (hue + rand(-20, 35) + 360) % 360,
        });
    }
}

// Ondas (ripple)
function spawnRipple(x, y) {
    ripples.push({ x, y, r: 0, a: 0.22 });
}

// Burbujas coquetas
function showBubble(text, x, y) {
    const now = performance.now();
    if (now - lastBubbleAt < 450) return;
    lastBubbleAt = now;

    // Limitar burbujas en pantalla
    while (bubbleArea.children.length >= MAX_BUBBLES) {
        bubbleArea.removeChild(bubbleArea.firstChild);
    }

    const b = document.createElement("div");
    b.className = "bubble";
    b.innerHTML = `${text}<small>toca otra vez 😉</small>`;

    const left = clamp(x - rand(90, 160), 12, w - 12);
    const top = clamp(y - rand(120, 220), 70, h - 140);

    b.style.left = left + "px";
    b.style.top = top + "px";

    bubbleArea.appendChild(b);

    setTimeout(() => {
        b.style.opacity = "0";
        b.style.transition = "opacity 420ms ease";
    }, 1400);

    setTimeout(() => b.remove(), 1900);
}

// Incremento “secreto”
function addSecret(n = 1) {
    secretCount = clamp(secretCount + n, 0, SECRET_TARGET);
    updateLock();
    if (secretCount >= SECRET_TARGET) {
        unlock();
    }
}

// Desbloqueo final
function unlock() {
    if (!final.hidden) return;

    setPill("Ok… desbloqueaste el secreto 🤍");

    // Burst suave, no tan explosivo
    for (let i = 0; i < 4; i++) {
        setTimeout(() => spawnBurst(rand(80, w - 80), rand(120, h - 260), 1.15), i * 140);
    }

    setTimeout(() => {
        final.hidden = false;
    }, 420);
}


// ======= Render loop =======
function draw() {
    ctx.clearRect(0, 0, w, h);

    // Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 8.5;
        rp.a *= 0.965;

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${rp.a})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (rp.a < 0.01) ripples.splice(i, 1);
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        const alpha = clamp(p.life / 70, 0, 1);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * (70 - p.life) * 0.02);

        if (p.kind === "heart") {
            ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${alpha})`;
            drawHeart(0, 0, p.size);
            ctx.fill();
        } else {
            ctx.fillStyle = `hsla(${p.hue}, 95%, 75%, ${alpha})`;
            drawSpark(0, 0, p.size);
            ctx.fill();
        }

        ctx.restore();

        if (p.life <= 0 || p.y > h + 40) particles.splice(i, 1);
    }

    requestAnimationFrame(draw);
}

function drawHeart(x, y, s) {
    ctx.beginPath();
    const t = s / 16;
    ctx.moveTo(x, y + 6 * t);
    ctx.bezierCurveTo(x, y, x - 10 * t, y, x - 10 * t, y + 6 * t);
    ctx.bezierCurveTo(x - 10 * t, y + 12 * t, x, y + 14 * t, x, y + 18 * t);
    ctx.bezierCurveTo(x, y + 14 * t, x + 10 * t, y + 12 * t, x + 10 * t, y + 6 * t);
    ctx.bezierCurveTo(x + 10 * t, y, x, y, x, y + 6 * t);
    ctx.closePath();
}

function drawSpark(x, y, s) {
    ctx.beginPath();
    const r = s * 0.55;
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rr = i % 2 === 0 ? r : r * 0.45;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
}

// ======= Interaction =======
function onPointerDown(e) {
    if (!final.hidden) return; // si ya está el final, no seguimos sumando

    const p = getPoint(e);
    lastTouch = p;

    applyReactiveBackground(p.x, p.y);
    spawnRipple(p.x, p.y);
    spawnBurst(p.x, p.y, 1);

    // Mensajito coqueto ocasional
    maybeBubble(p.x, p.y);

    // Progreso secreto por toque
    addSecret(1);

    // “Modo secreto” si mantiene presionado
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
        // Un premio extra (se siente “secreto”)
        setPill("Modo secreto activado… 🤫");
        spawnBurst(p.x, p.y, 2.0);
        addSecret(2);
    }, HOLD_MS);
}

function onPointerMove(e) {
    if (!final.hidden) return;

    const p = getPoint(e);
    const dx = p.x - lastTouch.x;
    const dy = p.y - lastTouch.y;
    const dist = Math.hypot(dx, dy);

    // Reactivo al arrastre: “pinta” el fondo
    if (dist > 10) {
        applyReactiveBackground(p.x, p.y);
        // Pequeñas chispas suaves al arrastre
        if (Math.random() < 0.35) spawnBurst(p.x, p.y, 0.55);
        lastTouch = p;
    }
}

function onPointerUp() {
    clearTimeout(holdTimer);
}

// Point from event
function getPoint(e) {
    const touch = e.touches && e.touches[0];
    const x = touch ? touch.clientX : e.clientX;
    const y = touch ? touch.clientY : e.clientY;
    return { x, y };
}

function maybeBubble(x, y) {
    // No spamear burbujas
    const now = performance.now();
    if (now - lastBubbleAt < 700) return;

    // Broma IT solo al principio
    if (secretCount <= 2) {
        setPill(pick(IT_JOKE));
    } else {
        setPill("Ok… esto ya no parece IT 😅");
    }

    // Mostrar burbuja con probabilidad
    if (Math.random() < 0.80) {
        showBubble(pick(COQUETAS), x, y);
    }
}

// Replay
replayBtn?.addEventListener("click", () => {
    final.hidden = true;
    secretCount = 0;
    updateLock();
    setPill("Inicializando soporte…");
    particles = [];
    ripples = [];
});

const closeFinal = document.getElementById("closeFinal");
const moreFxBtn = document.getElementById("moreFxBtn");

closeFinal?.addEventListener("click", () => {
  final.hidden = true; // cierra el toast, pero la pantalla sigue interactiva
  setPill("Sigue tocando… todavía reacciona ✨");
});

moreFxBtn?.addEventListener("click", () => {
  // brillitos extra donde esté el último toque
  spawnRipple(lastTouch.x || w/2, lastTouch.y || h/2);
  spawnBurst(lastTouch.x || w/2, lastTouch.y || h/2, 1.6);
  setPill("Brillitos extra 😌✨");
});


// Listeners (touch + mouse)
document.addEventListener("pointerdown", onPointerDown, { passive: true });
document.addEventListener("pointermove", onPointerMove, { passive: true });
document.addEventListener("pointerup", onPointerUp, { passive: true });

// Start loop
updateLock();
draw();
