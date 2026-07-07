// Textura procedural de suelo de mina: losas Voronoi + ruido de grano.
// PNG truecolor codificado a mano con zlib nativo (sin dependencias).
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 384, H = 384;

// --- ruido de valor suave (bilineal sobre rejilla aleatoria, tileable) ---
function makeNoise(grid, seed) {
  let s = seed;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const g = Array.from({ length: grid }, () => Array.from({ length: grid }, rnd));
  return (x, y) => {
    const fx = (x / W) * grid, fy = (y / H) * grid;
    const x0 = Math.floor(fx) % grid, y0 = Math.floor(fy) % grid;
    const x1 = (x0 + 1) % grid, y1 = (y0 + 1) % grid;
    const tx = fx - Math.floor(fx), ty = fy - Math.floor(fy);
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = g[y0][x0] * (1 - sx) + g[y0][x1] * sx;
    const b = g[y1][x0] * (1 - sx) + g[y1][x1] * sx;
    return a * (1 - sy) + b * sy;
  };
}
const n1 = makeNoise(6, 12345);
const n2 = makeNoise(14, 67890);
const n3 = makeNoise(48, 424242);

// --- semillas Voronoi (duplicadas en 9 posiciones para que la textura sea tileable) ---
let s = 987654321;
const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const CELLS = 26;
const seeds = Array.from({ length: CELLS }, () => ({ x: rnd() * W, y: rnd() * H }));
const PALETTE = [
  [94, 76, 64], [87, 73, 92], [78, 69, 80], [99, 81, 74], [82, 74, 88], [90, 78, 70],
];
const cellColor = seeds.map(() => PALETTE[Math.floor(rnd() * PALETTE.length)]);
const cellTint = seeds.map(() => (rnd() - 0.5) * 18);

function voronoi(x, y) {
  let f1 = 1e9, f2 = 1e9, idx = 0;
  for (let i = 0; i < CELLS; i++) {
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
      const dx = x - (seeds[i].x + ox * W), dy = y - (seeds[i].y + oy * H);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < f1) { f2 = f1; f1 = d; idx = i; } else if (d < f2) f2 = d;
    }
  }
  return { edge: f2 - f1, idx };
}

const Q = 6; // posterizado para que el PNG comprima bien
const px = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const { edge, idx } = voronoi(x, y);
    const base = cellColor[idx];
    const tint = cellTint[idx];
    // grano: tres octavas de ruido
    const grain = (n1(x, y) - 0.5) * 14 + (n2(x, y) - 0.5) * 10 + (n3(x, y) - 0.5) * 7;
    // juntas oscuras entre losas + leve realce junto al borde
    const seam = edge < 2.2 ? -30 : edge < 5 ? -12 * (1 - (edge - 2.2) / 2.8) : 0;
    const bevel = edge > 5 && edge < 9 ? 5 : 0;
    for (let c = 0; c < 3; c++) {
      let v = base[c] + tint + grain + seam + bevel;
      v = Math.max(0, Math.min(255, v));
      px[(y * W + x) * 3 + c] = Math.round(v / Q) * Q;
    }
  }
}

// --- codificación PNG mínima ---
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; // 8 bits, truecolor
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync("mine-floor.png", png);
writeFileSync("mine-floor.b64", png.toString("base64"));
console.log(`mine-floor.png: ${(png.length / 1024).toFixed(0)} KB`);
