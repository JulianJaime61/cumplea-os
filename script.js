const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let interactionCount = 0;
const maxInteractions = 10;
const messageContainer = document.getElementById('messageContainer');

// Frases coquetas personalizadas para Gaby
const phrases = [
    "Gaby, tu sonrisa ilumina todo 😍",
    "Cada toque tuyo hace magia ✨",
    "¡Eres increíble, Gaby! 💖",
    "Tus ojos brillan más que las estrellas 🌟",
    "No puedo dejar de pensar en ti 😉",
    "Eres un sueño hecho realidad 🌸",
    "Gaby, cada día contigo sería perfecto 💕"
];

// Partícula
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 5;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        this.opacity = 1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02;
    }
    draw() {
        ctx.fillStyle = `rgba(${this.color.match(/\d+/g)[0]},${this.color.match(/\d+/g)[1]},${this.color.match(/\d+/g)[2]},${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.opacity <= 0) particles.splice(index, 1);
    });
    requestAnimationFrame(animate);
}
animate();

// Al tocar o mover
function interact(e) {
    interactionCount++;
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;

    // Crear varias partículas
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y));
    }

    // Mostrar frase aleatoria
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    messageContainer.textContent = phrase;

    // Si pasa el umbral de interacciones, mostrar mensaje secreto
    if (interactionCount >= maxInteractions) {
        messageContainer.innerHTML = `
      Feliz cumpleaños, Gaby 🎂💖<br>
      — esto lo hice solo para ti
    `;
    }
}
