// Tech-themed animated background: particle network with occasional tech icons
// Lightweight canvas animation. Non-interactive: pointer-events disabled.
export function initBackground(options = {}) {
  const container = document.body;
  // Avoid double-init
  if (document.getElementById('bg-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.className = 'bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  container.insertBefore(canvas, container.firstChild);

  const ctx = canvas.getContext('2d');
  let DPR = window.devicePixelRatio || 1;

  function resize() {
    DPR = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * DPR);
    canvas.height = Math.round(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const techIcons = [
    'assets/icons/python.svg',
    'assets/icons/html5.svg',
    'assets/icons/css3.svg',
    'assets/icons/react.svg',
    'assets/icons/docker.svg',
    'assets/icons/js.svg',
    'assets/icons/pytorch.svg',
    'assets/icons/mysql.svg',
    'assets/icons/project.svg'
  ];

  const loadedIcons = [];
  techIcons.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => { /* noop */ };
    loadedIcons.push(img);
  });

  const cfg = {
    count: Math.max(24, Math.floor((window.innerWidth * window.innerHeight) / 90000)), // scale with screen
    maxLink: 160,
    speed: 0.3,
    iconChance: 0.08,
    ...options
  };

  const nodes = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeNode() {
    return {
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: rand(-cfg.speed, cfg.speed),
      vy: rand(-cfg.speed, cfg.speed),
      r: rand(1.8, 3.8),
      icon: Math.random() < cfg.iconChance ? loadedIcons[Math.floor(Math.random() * loadedIcons.length)] : null,
      iconScale: 0.6 + Math.random() * 0.8
    };
  }

  function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < cfg.count; i++) nodes.push(makeNode());
  }
  initNodes();

  let last = performance.now();

  function step(now) {
    const dt = Math.min(50, now - last) / 16.666;
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(step);
  }

  function update(dt) {
    for (const n of nodes) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;

      // bounce
      if (n.x < -20) { n.x = -20; n.vx *= -1; }
      if (n.y < -20) { n.y = -20; n.vy *= -1; }
      if (n.x > window.innerWidth + 20) { n.x = window.innerWidth + 20; n.vx *= -1; }
      if (n.y > window.innerHeight + 20) { n.y = window.innerHeight + 20; n.vy *= -1; }

      // slight jitter
      n.vx += rand(-0.02, 0.02) * dt;
      n.vy += rand(-0.02, 0.02) * dt;
      // limit speed
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      const maxSpd = cfg.speed * 6;
      if (spd > maxSpd) {
        n.vx = (n.vx / spd) * maxSpd;
        n.vy = (n.vy / spd) * maxSpd;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);

    // Draw links
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x; const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        const max = cfg.maxLink;
        if (d2 < max * max) {
          const alpha = 0.25 * (1 - d2 / (max * max));
          ctx.strokeStyle = `rgba(100,150,255,${alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      if (n.icon) {
        const sz = 22 * n.iconScale;
        ctx.save();
        // subtle shadow/glow
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, sz * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // draw image centered
        try {
          ctx.drawImage(n.icon, n.x - sz/2, n.y - sz/2, sz, sz);
        } catch (e) {
          /* ignore draw errors */
        }
      } else {
        ctx.fillStyle = 'rgba(180,200,255,0.9)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // mouse interaction: repulse
  let mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (ev) => { mouse.x = ev.clientX; mouse.y = ev.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // occasional shuffle of icons
  setInterval(() => {
    for (const n of nodes) if (Math.random() < 0.02) n.icon = Math.random() < cfg.iconChance ? loadedIcons[Math.floor(Math.random() * loadedIcons.length)] : null;
  }, 3000);

  requestAnimationFrame(step);

  // Expose cleanup
  return {
    destroy() {
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  };
}
