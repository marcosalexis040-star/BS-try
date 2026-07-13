/* BS-try — Shelly Arena
   Mini shooter top-down que usa el spritesheet pixel-art de Shelly (assets/shelly.png).
   Frames del sheet (32x40 c/u): 0=idle, 1=walk1, 2=walk2, 3=shoot. */
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

ctx.imageSmoothingEnabled = false; // pixel-art nítido

// ---------- Carga del spritesheet ----------
const FRAME_W = 32, FRAME_H = 40, FRAMES = 4;
const FRAME = { idle: 0, walk1: 1, walk2: 2, shoot: 3 };
const sheet = new Image();
let sheetReady = false;
sheet.onload = () => { sheetReady = true; };
sheet.onerror = () => console.error('No se pudo cargar assets/shelly.png');
sheet.src = 'assets/shelly.png';

// ---------- Entrada ----------
const keys = {};
const mouse = { x: W / 2, y: H / 2, down: false };
addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
function toCanvas(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return { x: (clientX - r.left) * (W / r.width), y: (clientY - r.top) * (H / r.height) };
}
canvas.addEventListener('mousemove', e => { const p = toCanvas(e.clientX, e.clientY); mouse.x = p.x; mouse.y = p.y; });
canvas.addEventListener('mousedown', () => { mouse.down = true; });
addEventListener('mouseup', () => { mouse.down = false; });
canvas.addEventListener('touchstart', e => { const t = e.touches[0]; const p = toCanvas(t.clientX, t.clientY); mouse.x = p.x; mouse.y = p.y; mouse.down = true; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', e => { const t = e.touches[0]; const p = toCanvas(t.clientX, t.clientY); mouse.x = p.x; mouse.y = p.y; e.preventDefault(); }, { passive: false });
addEventListener('touchend', () => { mouse.down = false; });

// ---------- Estado ----------
let state = 'menu'; // menu | playing | over
let player, pellets, enemies, particles;
let score, spawnTimer, spawnEvery, elapsed, shootFxTimer;

function reset() {
  player = { x: W / 2, y: H / 2, r: 18, speed: 220, hp: 100, maxHp: 100,
             face: 1, animT: 0, walkFrame: 1, ammo: 3, maxAmmo: 3,
             reloadT: 0, cooldown: 0 };
  pellets = []; enemies = []; particles = [];
  score = 0; elapsed = 0; spawnTimer = 0; spawnEvery = 1.5; shootFxTimer = 0;
}

// ---------- Disparo (escopeta) ----------
const PELLETS_PER_SHOT = 6, SPREAD = 0.42, PELLET_SPEED = 620, PELLET_LIFE = 0.42, COOLDOWN = 0.32, RELOAD = 1.1;
function fire() {
  if (player.cooldown > 0 || player.reloadT > 0 || player.ammo <= 0) return;
  const ang = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  for (let i = 0; i < PELLETS_PER_SHOT; i++) {
    const a = ang + (Math.random() - 0.5) * SPREAD;
    const spd = PELLET_SPEED * (0.85 + Math.random() * 0.3);
    pellets.push({ x: player.x + Math.cos(ang) * 22, y: player.y + Math.sin(ang) * 22,
                   vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: PELLET_LIFE, r: 4 });
  }
  // retroceso + fogonazo
  player.x -= Math.cos(ang) * 4; player.y -= Math.sin(ang) * 4;
  for (let i = 0; i < 5; i++) particles.push({ x: player.x + Math.cos(ang) * 24, y: player.y + Math.sin(ang) * 24,
      vx: Math.cos(ang + (Math.random()-.5)) * 120, vy: Math.sin(ang + (Math.random()-.5)) * 120,
      life: .2, col: '#ffd24a', r: 3 });
  player.ammo--; player.cooldown = COOLDOWN; shootFxTimer = 0.12;
  if (player.ammo <= 0) player.reloadT = RELOAD;
}

function spawnEnemy() {
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  if (edge === 0) { x = -30; y = Math.random() * H; }
  else if (edge === 1) { x = W + 30; y = Math.random() * H; }
  else if (edge === 2) { x = Math.random() * W; y = -30; }
  else { x = Math.random() * W; y = H + 30; }
  const tier = Math.random() < Math.min(0.15 + elapsed / 200, 0.5);
  enemies.push({ x, y, r: tier ? 22 : 15, hp: tier ? 5 : 2, maxHp: tier ? 5 : 2,
                 speed: tier ? 55 : 85, dmg: tier ? 22 : 12, wob: Math.random() * 6.28 });
}

// ---------- Actualización ----------
function update(dt) {
  elapsed += dt;
  // movimiento
  let dx = 0, dy = 0;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  const moving = dx || dy;
  if (moving) { const m = Math.hypot(dx, dy); dx /= m; dy /= m;
    player.x += dx * player.speed * dt; player.y += dy * player.speed * dt; }
  player.x = Math.max(player.r, Math.min(W - player.r, player.x));
  player.y = Math.max(player.r, Math.min(H - player.r, player.y));
  player.face = mouse.x < player.x ? -1 : 1;

  // animación de caminado
  if (moving) { player.animT += dt; if (player.animT > 0.14) { player.animT = 0; player.walkFrame = player.walkFrame === 1 ? 2 : 1; } }
  else { player.walkFrame = FRAME.idle; }

  // disparo
  if (player.cooldown > 0) player.cooldown -= dt;
  if (player.reloadT > 0) { player.reloadT -= dt; if (player.reloadT <= 0) player.ammo = player.maxAmmo; }
  if (shootFxTimer > 0) shootFxTimer -= dt;
  if (mouse.down || keys[' ']) fire();

  // pellets
  for (const p of pellets) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  pellets = pellets.filter(p => p.life > 0 && p.x > -20 && p.x < W + 20 && p.y > -20 && p.y < H + 20);

  // enemigos
  spawnTimer += dt; spawnEvery = Math.max(0.45, 1.5 - elapsed / 45);
  if (spawnTimer > spawnEvery) { spawnTimer = 0; spawnEnemy(); }
  for (const e of enemies) {
    const a = Math.atan2(player.y - e.y, player.x - e.x);
    e.wob += dt * 6;
    e.x += (Math.cos(a) + Math.cos(e.wob) * 0.25) * e.speed * dt;
    e.y += (Math.sin(a) + Math.sin(e.wob) * 0.25) * e.speed * dt;
    // daño por contacto
    if (Math.hypot(player.x - e.x, player.y - e.y) < player.r + e.r) {
      player.hp -= e.dmg * dt; kickback(e, a);
    }
  }
  // colisión pellet-enemigo
  for (const e of enemies) for (const p of pellets) {
    if (p.dead) continue;
    if (Math.hypot(p.x - e.x, p.y - e.y) < e.r + p.r) {
      e.hp -= 1; p.dead = true; p.life = 0;
      burst(p.x, p.y, '#fff2b0', 4);
    }
  }
  pellets = pellets.filter(p => !p.dead && p.life > 0);
  for (const e of enemies) if (e.hp <= 0) { score += e.maxHp > 3 ? 25 : 10; burst(e.x, e.y, '#8b5cff', 14); }
  enemies = enemies.filter(e => e.hp > 0);

  // partículas
  for (const q of particles) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; q.vx *= 0.9; q.vy *= 0.9; }
  particles = particles.filter(q => q.life > 0);

  if (player.hp <= 0) { player.hp = 0; state = 'over'; showOverlay(gameOverHTML()); }
}
function kickback(e, a) { e.x -= Math.cos(a) * 2; e.y -= Math.sin(a) * 2; }
function burst(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 40 + Math.random() * 160;
  particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3 + Math.random() * 0.3, col, r: 2 + Math.random() * 2 }); } }

// ---------- Dibujo ----------
function drawBackground() {
  ctx.fillStyle = '#317f45'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let y = 0; y < H; y += 48) for (let x = 0; x < W; x += 48)
    if (((x + y) / 48) % 2 === 0) ctx.fillRect(x, y, 48, 48);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, W - 12, H - 12);
}
function drawPlayer() {
  const frame = shootFxTimer > 0 ? FRAME.shoot : player.walkFrame;
  const scale = 2.4, dw = FRAME_W * scale, dh = FRAME_H * scale;
  ctx.save();
  ctx.translate(player.x, player.y);
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, dh * 0.42, player.r * 0.9, player.r * 0.4, 0, 0, 7); ctx.fill();
  ctx.scale(player.face, 1);
  if (sheetReady) ctx.drawImage(sheet, frame * FRAME_W, 0, FRAME_W, FRAME_H, -dw / 2, -dh / 2 - 6, dw, dh);
  else { ctx.fillStyle = '#e8428c'; ctx.fillRect(-16, -20, 32, 40); }
  ctx.restore();
}
function drawEnemy(e) {
  ctx.save(); ctx.translate(e.x, e.y);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, e.r * 0.7, e.r * 0.9, e.r * 0.35, 0, 0, 7); ctx.fill();
  const body = e.maxHp > 3 ? '#6d3bd0' : '#c2417a';
  ctx.fillStyle = body; ctx.beginPath();
  const spikes = 8;
  for (let i = 0; i <= spikes * 2; i++) { const a = (i / (spikes * 2)) * Math.PI * 2;
    const rr = e.r * (i % 2 ? 0.78 : 1); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-e.r * 0.28, -e.r * 0.1, e.r * 0.22, 0, 7); ctx.arc(e.r * 0.28, -e.r * 0.1, e.r * 0.22, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a1020';
  ctx.beginPath(); ctx.arc(-e.r * 0.24, -e.r * 0.08, e.r * 0.1, 0, 7); ctx.arc(e.r * 0.32, -e.r * 0.08, e.r * 0.1, 0, 7); ctx.fill();
  ctx.restore();
  // barra de vida si dañado
  if (e.hp < e.maxHp) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - e.r, e.y - e.r - 8, e.r * 2, 4);
    ctx.fillStyle = '#5dff8f'; ctx.fillRect(e.x - e.r, e.y - e.r - 8, e.r * 2 * (e.hp / e.maxHp), 4); }
}
function drawPellet(p) {
  ctx.fillStyle = '#fff2b0'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,120,.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.012, p.y - p.vy * 0.012); ctx.stroke();
}
function drawHUD() {
  // vida
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(14, 14, 220, 22);
  ctx.fillStyle = '#e8428c'; ctx.fillRect(16, 16, 216 * (player.hp / player.maxHp), 18);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px system-ui'; ctx.textBaseline = 'middle';
  ctx.fillText('HP', 22, 25);
  // munición
  for (let i = 0; i < player.maxAmmo; i++) {
    ctx.fillStyle = i < player.ammo ? '#ffd24a' : 'rgba(255,255,255,.2)';
    ctx.fillRect(14 + i * 20, 44, 15, 22);
  }
  if (player.reloadT > 0) { ctx.fillStyle = '#fff'; ctx.font = '12px system-ui';
    ctx.fillText('Recargando…', 14 + player.maxAmmo * 20 + 6, 55); }
  // score
  ctx.fillStyle = '#fff'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'right';
  ctx.fillText('Score ' + score, W - 16, 26);
  ctx.textAlign = 'left';
}
function drawCrosshair() {
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 10, 0, 7); ctx.moveTo(mouse.x - 16, mouse.y);
  ctx.lineTo(mouse.x - 4, mouse.y); ctx.moveTo(mouse.x + 4, mouse.y); ctx.lineTo(mouse.x + 16, mouse.y);
  ctx.moveTo(mouse.x, mouse.y - 16); ctx.lineTo(mouse.x, mouse.y - 4);
  ctx.moveTo(mouse.x, mouse.y + 4); ctx.lineTo(mouse.x, mouse.y + 16); ctx.stroke();
}
function render() {
  drawBackground();
  for (const e of enemies) drawEnemy(e);
  for (const p of pellets) drawPellet(p);
  drawPlayer();
  for (const q of particles) { ctx.globalAlpha = Math.max(0, q.life * 2.5); ctx.fillStyle = q.col;
    ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  drawHUD();
  if (state === 'playing') drawCrosshair();
}

// ---------- Bucle ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (state === 'playing') update(dt);
  render();
  requestAnimationFrame(loop);
}
reset(); // deja a Shelly y las estructuras listas para que render() sea seguro en el menú
requestAnimationFrame(loop);

// ---------- Overlay / flujo ----------
function showOverlay(html) { overlay.innerHTML = html; overlay.classList.remove('hidden'); bindStart(); }
function hideOverlay() { overlay.classList.add('hidden'); }
function gameOverHTML() {
  return `<h2>¡Derrotada!</h2><p>Puntuación final: <b>${score}</b><br>Sobreviviste ${elapsed.toFixed(1)} s.</p>
          <button id="startBtn">Reintentar</button>`;
}
function bindStart() { const b = document.getElementById('startBtn'); if (b) b.onclick = start; }
function start() { reset(); state = 'playing'; hideOverlay(); last = performance.now(); }
bindStart();

// API mínima para pruebas automatizadas
window.__game = { start, get state() { return state; }, get score() { return score; },
                  get sheetReady() { return sheetReady; }, get player() { return player; },
                  get enemies() { return enemies.map(e => ({ x: e.x, y: e.y, r: e.r })); } };
