// Generador de sprites pixel-art (sin dependencias externas).
// Dibuja un personaje original tipo "heroína con escopeta" (arquetipo de Shelly)
// y exporta un spritesheet PNG + frames sueltos usando un codificador PNG propio.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------- Codificador PNG (RGBA, 8-bit) ----------
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filtro None
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- Lienzo RGBA con primitivas ----------
const FW = 32, FH = 40; // tamaño por frame
function makeCanvas(w, h) { return { w, h, data: Buffer.alloc(w * h * 4) }; }
function px(c, x, y, col) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  const a = col[3] === undefined ? 255 : col[3];
  if (a === 255) { c.data[i] = col[0]; c.data[i + 1] = col[1]; c.data[i + 2] = col[2]; c.data[i + 3] = 255; return; }
  // alpha blend sobre lo existente
  const sa = a / 255, da = c.data[i + 3] / 255, oa = sa + da * (1 - sa);
  if (oa === 0) return;
  c.data[i]     = (col[0] * sa + c.data[i]     * da * (1 - sa)) / oa;
  c.data[i + 1] = (col[1] * sa + c.data[i + 1] * da * (1 - sa)) / oa;
  c.data[i + 2] = (col[2] * sa + c.data[i + 2] * da * (1 - sa)) / oa;
  c.data[i + 3] = oa * 255;
}
function rect(c, x, y, w, h, col) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(c, x + i, y + j, col);
}
function disc(c, cx, cy, r, col) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) px(c, x, y, col);
    }
}
function line(c, x0, y0, x1, y1, col, t = 1) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
  for (let s = 0; s <= steps; s++) {
    const u = s / steps, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u;
    for (let oy = 0; oy < t; oy++) for (let ox = 0; ox < t; ox++) px(c, x + ox, y + oy, col);
  }
}

// ---------- Paleta ----------
const COL = {
  hair:  [232, 66, 140], hairD: [196, 40, 110], hairH: [255, 120, 180],
  skin:  [255, 214, 178], skinD: [232, 176, 142],
  top:   [245, 202, 66],  topD:  [212, 165, 34],
  short: [72, 84, 120],   shortD:[52, 62, 92],
  boot:  [64, 52, 70],
  gun:   [120, 126, 140], gunD:  [70, 74, 86], gunH: [176, 182, 196],
  eyeW:  [255, 255, 255], eye:   [58, 44, 66],
  mouth: [150, 60, 74],   blush: [255, 150, 160, 150],
  flashA:[255, 232, 120], flashB:[255, 150, 40], flashC:[255, 90, 30],
};
const OUTLINE = [30, 24, 34, 255];

// Contorno 1px alrededor de la silueta del frame.
function outlinePass(c) {
  const src = Buffer.from(c.data);
  const alphaAt = (x, y) => (x < 0 || y < 0 || x >= c.w || y >= c.h) ? 0 : src[(y * c.w + x) * 4 + 3];
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    if (alphaAt(x, y) !== 0) continue;
    if (alphaAt(x-1,y) || alphaAt(x+1,y) || alphaAt(x,y-1) || alphaAt(x,y+1))
      px(c, x, y, OUTLINE);
  }
}

// Dibuja un frame. legPhase: -1,0,1 ; arm: 'rest'|'shoot' ; flash: bool
function drawShelly(legPhase, arm, flash) {
  const c = makeCanvas(FW, FH);
  const cx = 16;

  // --- Piernas / botas ---
  const lo = legPhase; // desplazamiento de la marcha
  rect(c, cx - 5, 32 + Math.max(0, lo), 4, 6, COL.short);   // muslo izq
  rect(c, cx + 1, 32 + Math.max(0, -lo), 4, 6, COL.short);  // muslo der
  rect(c, cx - 5, 37 + Math.max(0, lo), 4, 3, COL.boot);    // bota izq
  rect(c, cx + 1, 37 + Math.max(0, -lo), 4, 3, COL.boot);   // bota der

  // --- Torso (peto amarillo) ---
  disc(c, cx, 26, 6.2, COL.top);
  rect(c, cx - 6, 22, 12, 8, COL.top);
  rect(c, cx - 6, 27, 12, 3, COL.topD);        // sombra inferior
  rect(c, cx - 1, 22, 2, 8, COL.topD);         // cierre central

  // --- Brazo izquierdo (sujeta el cañón) ---
  rect(c, cx - 8, 23, 3, 6, COL.skin);

  // --- Escopeta a la derecha ---
  const gy = arm === 'shoot' ? 24 : 25;
  const reach = arm === 'shoot' ? 12 : 9;
  rect(c, cx + 3, gy - 1, reach, 4, COL.gun);      // cañón
  rect(c, cx + 3, gy - 1, reach, 1, COL.gunH);     // brillo superior
  rect(c, cx + 3, gy + 2, reach, 1, COL.gunD);     // sombra inferior
  rect(c, cx + 2, gy + 1, 3, 4, COL.gunD);         // culata
  rect(c, cx + 4, gy - 2, 3, 6, COL.skin);         // mano/antebrazo derecho
  if (flash) {
    const fx = cx + 3 + reach + 1;
    disc(c, fx + 2, gy + 1, 4, COL.flashA);
    disc(c, fx + 1, gy + 1, 3, COL.flashB);
    disc(c, fx, gy + 1, 1.6, COL.flashC);
    line(c, fx + 2, gy + 1, fx + 7, gy + 1, COL.flashA, 1);
    line(c, fx + 1, gy - 2, fx + 4, gy - 3, COL.flashB, 1);
    line(c, fx + 1, gy + 4, fx + 4, gy + 5, COL.flashB, 1);
  }

  // --- Cabeza ---
  disc(c, cx, 12, 8, COL.hair);                 // cabello (base)
  disc(c, cx, 13, 6.6, COL.skin);               // cara
  rect(c, cx - 7, 8, 3, 9, COL.hair);           // mechón izq
  rect(c, cx + 4, 8, 3, 9, COL.hair);           // mechón der
  disc(c, cx - 6, 17, 2.4, COL.hairD);          // coleta izq
  disc(c, cx + 6, 17, 2.4, COL.hairD);          // coleta der
  rect(c, cx - 6, 6, 12, 3, COL.hair);          // flequillo
  rect(c, cx - 5, 6, 3, 2, COL.hairH);          // brillo cabello
  // ojos
  rect(c, cx - 4, 12, 2, 3, COL.eyeW); px(c, cx - 4, 13, COL.eye); px(c, cx - 3, 13, COL.eye);
  rect(c, cx + 2, 12, 2, 3, COL.eyeW); px(c, cx + 2, 13, COL.eye); px(c, cx + 3, 13, COL.eye);
  // rubor + boca
  px(c, cx - 5, 15, COL.blush); px(c, cx - 4, 15, COL.blush);
  px(c, cx + 4, 15, COL.blush); px(c, cx + 5, 15, COL.blush);
  rect(c, cx - 1, 16, 2, 1, COL.mouth);
  // sombra de cuello
  rect(c, cx - 2, 19, 4, 2, COL.skinD);

  outlinePass(c);
  return c;
}

// ---------- Componer spritesheet ----------
const frames = [
  { name: 'idle',  c: drawShelly(0, 'rest', false) },
  { name: 'walk1', c: drawShelly(1, 'rest', false) },
  { name: 'walk2', c: drawShelly(-1, 'rest', false) },
  { name: 'shoot', c: drawShelly(0, 'shoot', true) },
];
const sheetW = FW * frames.length, sheetH = FH;
const sheet = makeCanvas(sheetW, sheetH);
frames.forEach((f, idx) => {
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    const i = (y * FW + x) * 4, j = (y * sheetW + (idx * FW + x)) * 4;
    for (let k = 0; k < 4; k++) sheet.data[j + k] = f.c.data[i + k];
  }
});

const outDir = path.join(__dirname, '..', 'assets');
fs.writeFileSync(path.join(outDir, 'shelly.png'), encodePNG(sheetW, sheetH, sheet.data));
frames.forEach(f => fs.writeFileSync(path.join(outDir, `shelly_${f.name}.png`), encodePNG(FW, FH, f.c.data)));

// Vista previa ampliada 6x del spritesheet (para revisar a simple vista)
const S = 6, pw = sheetW * S, ph = sheetH * S, prev = makeCanvas(pw, ph);
for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
  const i = (Math.floor(y / S) * sheetW + Math.floor(x / S)) * 4, j = (y * pw + x) * 4;
  for (let k = 0; k < 4; k++) prev.data[j + k] = sheet.data[i + k];
}
fs.writeFileSync(path.join(outDir, 'shelly_preview.png'), encodePNG(pw, ph, prev.data));

console.log(`OK  spritesheet ${sheetW}x${sheetH}  (${frames.length} frames: ${frames.map(f=>f.name).join(', ')})`);
