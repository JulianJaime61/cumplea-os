const screen = document.getElementById("screen");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const icons = ["💖","⭐","😏","😉"];
let confetiActive = false;

// Partículas avanzadas con rebote
class Particle {
    constructor(x, y, icon, size, vx, vy) {
        this.x = x;
        this.y = y;
        this.icon = icon;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.alpha = 1;
        this.rotation = Math.random()*360;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotation*Math.PI/180);
        ctx.font = `${this.size}px sans-serif`;
        ctx.fillText(this.icon,0,0);
        ctx.restore();
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if(confetiActive){
            this.vy += 0.06; // gravedad confeti
            if(this.y > canvas.height - this.size) { // rebote
                this.y = canvas.height - this.size;
                this.vy *= -0.5;
                this.vx *= 0.98;
            }
        }
        this.alpha -= 0.004;
        this.rotation += 2 + Math.random();
        if(this.alpha<0) this.alpha=0;
    }
}

function createParticles(x,y,count=25){
    for(let i=0;i<count;i++){
        const icon = icons[Math.floor(Math.random()*icons.length)];
        const size = Math.random()*30 + 20;
        const vx = (Math.random()-0.5)*4;
        const vy = (Math.random()-0.5)*4;
        particles.push(new Particle(x,y,icon,size,vx,vy));
    }
}

function animateParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Fondo animado gradiente
    const gradient = ctx.createRadialGradient(canvas.width/2,canvas.height/2,0,canvas.width/2,canvas.height/2,canvas.height);
    const r = Math.floor(Math.sin(Date.now()/2000)*50 + 80);
    const g = Math.floor(Math.sin(Date.now()/1500)*50 + 80);
    const b = Math.floor(Math.sin(Date.now()/1000)*50 + 80);
    gradient.addColorStop(0, `rgb(${r},${g},${b})`);
    gradient.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    particles.forEach((p,i)=>{
        p.update();
        p.draw();
        if(p.alpha<=0) particles.splice(i,1);
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

setTimeout(step1, 1500);

function step1(){
    screen.innerHTML = `<p class="glitch">Error 404: Esto NO es IT 😅</p>`;
    setTimeout(step2,2000);
}

function step2(){ createButton(); }

function createButton(){
    const btn = document.createElement("div");
    btn.className = "bubble";
    btn.textContent = "Tócalo si te atreves 😉";
    btn.style.top = `${Math.random()*60 + 20}%`;
    btn.style.left = `${Math.random()*60 + 20}%`;
    btn.style.pointerEvents = "auto";
    screen.appendChild(btn);

    btn.addEventListener("click", e=>{
        createParticles(e.clientX,e.clientY,50);
        btn.remove();
        spawnBubbles();
    });
}

function spawnBubbles(){
    const messages = [
        {text:"Sonríe 😄"}, 
        {text:"Sigue 😏"}, 
        {text:"Una más 😉"}, 
        {text:"Casi… 💖"}
    ];

    messages.forEach((msg,i)=>{
        setTimeout(()=>{
            const bubble = document.createElement("div");
            bubble.className="bubble";
            bubble.textContent = msg.text;
            bubble.style.top = `${Math.random()*70 + 15}%`;
            bubble.style.left = `${Math.random()*70 + 15}%`;
            bubble.style.pointerEvents = "auto";
            screen.appendChild(bubble);

            bubble.addEventListener("click", e=>{
                createParticles(e.clientX,e.clientY,50);
                bubble.remove();
                if(i===messages.length-1) showFinalMessage();
            });
        },i*700);
    });
}

function showFinalMessage(){
    confetiActive = true;
    // Generar confeti inicial
    for(let i=0;i<120;i++){
        const x = Math.random()*canvas.width;
        const y = Math.random()*canvas.height/2;
        const size = Math.random()*25 + 15;
        const vx = (Math.random()-0.5)*2;
        const vy = Math.random()*2 + 1;
        const icon = icons[Math.floor(Math.random()*icons.length)];
        particles.push(new Particle(x,y,icon,size,vx,vy));
    }

    screen.innerHTML = `
        <p class="highlight">Gaby 🎉</p>
        <p>Feliz cumpleaños 🎂</p>
        <p class="glitch">Solo quería sacarte una sonrisa 😊</p>
    `;
}

