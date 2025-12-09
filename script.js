
// NAV menu toggle
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
hamburger?.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', (!expanded).toString());
  // toggle icons
  const bar = hamburger.querySelector('.hamburger-icon');
  const cross = hamburger.querySelector('.cross-icon');
  if (bar) bar.style.display = expanded ? 'inline-block' : 'none';
  if (cross) cross.style.display = expanded ? 'none' : 'inline-block';
  // menu
  if (menu) {
    menu.style.display = expanded ? 'none' : 'block';
    menu.setAttribute('aria-hidden', expanded ? 'true' : 'false');
  }
});

// year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Button ripple effect
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(ev){
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = this.getBoundingClientRect();
    r.style.left = (ev.clientX - rect.left) + 'px';
    r.style.top  = (ev.clientY - rect.top) + 'px';
    this.appendChild(r);
    setTimeout(()=> r.remove(), 800);
  });
});

// --- PARTICLE CANVAS ENGINE (performance tuned) ---
(() => {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  });

  // particle field configuration - mindboggling, but optimized
  const PARTICLE_COUNT = Math.min(160, Math.floor((w*h)/20000)); // scale with screen area
  const particles = [];

  function rand(min, max){ return Math.random()*(max-min)+min; }

  // create particles with layered behavior
  for(let i=0;i<PARTICLE_COUNT;i++){
    particles.push({
      x: rand(0,w),
      y: rand(0,h),
      vx: rand(-0.15,0.15) * (Math.random() < 0.2 ? 2.5 : 1),
      vy: rand(-0.35,-0.05),
      size: rand(0.8, 3.8) * (Math.random()<0.2 ? 2.2 : 1),
      life: rand(6,22),
      t: Math.random()*1000,
      colorSeed: Math.random()
    });
  }

  // renders single frame
  function drawFrame(t){
    ctx.clearRect(0,0,w,h);
    // subtle vignette backdrop
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0, 'rgba(0,0,0,0.02)');
    grad.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);

    // draw particles
    for(let p of particles){
      p.t += 0.01;
      p.x += p.vx + Math.sin(p.t*0.9)*0.12;
      p.y += p.vy + Math.cos(p.t*0.5)*0.06;

      // recycle when out of bounds
      if (p.y < -40 || p.y > h+60 || p.x < -60 || p.x > w+60){
        p.x = rand(0,w);
        p.y = h + rand(10,300);
        p.vx = rand(-0.25,0.25);
        p.vy = -rand(0.05,0.5);
        p.size = rand(0.8, 3.8);
      }

      // color shifting blend for cinematic look
      const r = Math.floor(200 + Math.sin(p.colorSeed + t*0.0006)*55);
      const g = Math.floor(220 + Math.cos(p.colorSeed + t*0.0009)*20);
      const b = Math.floor(200 + Math.sin(p.colorSeed + t*0.0012)*35);

      ctx.beginPath();
      const alpha = 0.12 + (Math.sin(p.t*2 + p.size)*0.3);
      const radius = Math.max(0.6, p.size);
      const gradc = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius*3);
      gradc.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
      gradc.addColorStop(0.6, `rgba(${r},${g},${b},${alpha*0.18})`);
      gradc.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradc;
      ctx.arc(p.x, p.y, radius*3, 0, Math.PI*2);
      ctx.fill();
    }

    // layered light streak (subtle)
    ctx.globalCompositeOperation = 'lighter';
    const lx = (Math.sin(t*0.0005)*0.5 + 0.5) * w;
    ctx.beginPath();
    ctx.moveTo(lx - 400, h * 0.12);
    ctx.quadraticCurveTo(lx, h*0.08, lx + 400, h*0.22);
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawFrame);
  }

  // stop animation when user prefers reduced motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!mq.matches) requestAnimationFrame(drawFrame);
})();
