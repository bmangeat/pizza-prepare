// Génère des icônes PNG (sans dépendance) : fond pâte + disque pizza + garnitures.
// Usage : node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/icons");
mkdirSync(OUT_DIR, { recursive: true });

const C = {
  bg: [192, 57, 43], // tomato (fond, maskable safe)
  dough: [245, 226, 167], // crust
  sauce: [200, 70, 55],
  basil: [61, 122, 78],
  pepp: [142, 43, 32],
};

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(size, pixels) {
  // pixels : Uint8Array RGBA de size*size*4
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filtre none
    pixels.copy
      ? pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
      : Buffer.from(pixels.subarray(y * stride, y * stride + stride)).copy(
          raw,
          y * (stride + 1) + 1
        );
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function makeIcon(size) {
  const px = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const rPizza = size * 0.34;
  const rSauce = size * 0.27;

  // garnitures : positions relatives
  const toppings = [
    { x: -0.12, y: -0.1, r: 0.05, c: C.pepp },
    { x: 0.13, y: -0.05, r: 0.045, c: C.basil },
    { x: 0.02, y: 0.14, r: 0.05, c: C.pepp },
    { x: -0.14, y: 0.1, r: 0.04, c: C.basil },
    { x: 0.1, y: 0.13, r: 0.04, c: C.basil },
    { x: 0.0, y: -0.16, r: 0.045, c: C.pepp },
  ];

  function set(i, c) {
    px[i] = c[0];
    px[i + 1] = c[1];
    px[i + 2] = c[2];
    px[i + 3] = 255;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      let c = C.bg;
      if (d <= rPizza) c = C.dough;
      if (d <= rSauce) c = C.sauce;
      if (d <= rSauce) {
        for (const t of toppings) {
          const tx = cx + t.x * size;
          const ty = cy + t.y * size;
          const td = Math.sqrt((x - tx) ** 2 + (y - ty) ** 2);
          if (td <= t.r * size) {
            c = t.c;
            break;
          }
        }
      }
      set(i, c);
    }
  }
  return encodePNG(size, px);
}

for (const size of [192, 512]) {
  const png = makeIcon(size);
  const file = resolve(OUT_DIR, `icon-${size}.png`);
  writeFileSync(file, png);
  console.log(`✓ ${file} (${png.length} octets)`);
}
