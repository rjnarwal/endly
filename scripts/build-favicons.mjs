import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makePng(width, height, getPixel) {
  const rowLen = width * 4 + 1;
  const raw = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const offset = y * rowLen + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Build standard Windows ICO containing PNG frames
function makeIco(pngBuffers) {
  // pngBuffers = [ { width, height, buffer } ]
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // count of images

  let offset = 6 + count * 16;
  const entries = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)]);
}

// Helper: distance to rounded rect
function sdRoundRect(px, py, w, h, r) {
  const dx = Math.abs(px - w / 2) - (w / 2 - r);
  const dy = Math.abs(py - h / 2) - (h / 2 - r);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  const outside = Math.sqrt(ax * ax + ay * ay);
  const inside = Math.min(Math.max(dx, dy), 0);
  return outside + inside - r;
}

// Helper: 4-point star distance
function sdStar4(px, py, cx, cy, r, curve) {
  const x = Math.abs(px - cx);
  const y = Math.abs(py - cy);
  // star shape: (x/r)^p + (y/r)^p <= 1 with p < 1
  const d = Math.pow(x / r, curve) + Math.pow(y / r, curve);
  return d - 1.0;
}

// Render Grassroot Digital 512x512 Master Icon
function renderGrassrootIcon() {
  return makePng(512, 512, (x, y, W, H) => {
    // 1. Squircle background
    const dRect = sdRoundRect(x, y, 512, 512, 115);
    if (dRect > 0) return [0, 0, 0, 0];

    // Background gradient: Dark Slate Navy (#090d16 -> #0f172a)
    const tBg = (x + y) / 1024;
    let r = Math.round(9 * (1 - tBg) + 15 * tBg);
    let g = Math.round(13 * (1 - tBg) + 23 * tBg);
    let b = Math.round(22 * (1 - tBg) + 42 * tBg);
    let a = 255;

    // Glowing border (outer 14px)
    if (dRect > -14) {
      const tb = x / 512;
      // Emerald (#10b981) to Amber (#f59e0b) border
      const br = Math.round(16 * (1 - tb) + 245 * tb);
      const bg = Math.round(185 * (1 - tb) + 158 * tb);
      const bb = Math.round(129 * (1 - tb) + 11 * tb);
      const alpha = Math.min(1, Math.max(0, -dRect / 4));
      r = Math.round(r * (1 - alpha) + br * alpha);
      g = Math.round(g * (1 - alpha) + bg * alpha);
      b = Math.round(b * (1 - alpha) + bb * alpha);
    }

    // Inner subtle glow
    const dCenter = Math.hypot(x - 256, y - 256);
    if (dCenter < 220) {
      const glow = (1 - dCenter / 220) * 0.15;
      r = Math.min(255, r + Math.round(16 * glow * 255));
      g = Math.min(255, g + Math.round(185 * glow * 255));
      b = Math.min(255, b + Math.round(129 * glow * 255));
    }

    // 2. Primary 4-point Sparkle Star (Center: 256, 256, radius: 155)
    const dStar1 = sdStar4(x, y, 256, 256, 155, 0.52);
    if (dStar1 <= 0) {
      // Gradient inside star: Emerald (#34d399) to Amber-Yellow (#fbbf24)
      const ts = (x + y - 100) / 400;
      const sr = Math.round(52 * (1 - ts) + 251 * ts);
      const sg = Math.round(211 * (1 - ts) + 191 * ts);
      const sb = Math.round(153 * (1 - ts) + 36 * ts);

      // Core brightness
      const coreFactor = Math.max(0, 1 - dCenter / 120);
      const starR = Math.min(255, Math.round(sr * (1 - coreFactor * 0.4) + 255 * (coreFactor * 0.4)));
      const starG = Math.min(255, Math.round(sg * (1 - coreFactor * 0.4) + 255 * (coreFactor * 0.4)));
      const starB = Math.min(255, Math.round(sb * (1 - coreFactor * 0.4) + 255 * (coreFactor * 0.4)));

      r = starR;
      g = starG;
      b = starB;
    }

    // 3. Secondary Sparkle (Top-Right: 375, 145, radius: 50)
    const dStar2 = sdStar4(x, y, 375, 145, 52, 0.52);
    if (dStar2 <= 0) {
      r = 251;
      g = 191;
      b = 36;
    }

    // 4. Tertiary Sparkle (Bottom-Left: 145, 375, radius: 36)
    const dStar3 = sdStar4(x, y, 145, 375, 38, 0.52);
    if (dStar3 <= 0) {
      r = 52;
      g = 211;
      b = 153;
    }

    return [r, g, b, a];
  });
}

// Render Pagely 512x512 Master Icon (PDF / Image Stack in Rose/Red)
function renderPagelyIcon() {
  return makePng(512, 512, (x, y, W, H) => {
    const dRect = sdRoundRect(x, y, 512, 512, 115);
    if (dRect > 0) return [0, 0, 0, 0];

    const tBg = (x + y) / 1024;
    let r = Math.round(18 * (1 - tBg) + 30 * tBg);
    let g = Math.round(10 * (1 - tBg) + 15 * tBg);
    let b = Math.round(20 * (1 - tBg) + 30 * tBg);
    let a = 255;

    // Glowing Rose Border
    if (dRect > -14) {
      const tb = x / 512;
      const br = Math.round(244 * (1 - tb) + 239 * tb);
      const bg = Math.round(63 * (1 - tb) + 68 * tb);
      const bb = Math.round(94 * (1 - tb) + 68 * tb);
      r = br;
      g = bg;
      b = bb;
    }

    // Centered Image / Document Stack Glyphs
    // Document 1 (Back angled or offset)
    const dDocBack = sdRoundRect(x - 20, y + 20, 240, 290, 28);
    if (dDocBack <= 0) {
      r = 159;
      g = 18;
      b = 57;
    }

    // Document 2 (Front)
    const dDocFront = sdRoundRect(x + 15, y - 15, 240, 290, 28);
    if (dDocFront <= 0) {
      const tf = (x + y) / 600;
      r = Math.round(244 * (1 - tf) + 251 * tf);
      g = Math.round(63 * (1 - tf) + 113 * tf);
      b = Math.round(94 * (1 - tf) + 133 * tf);
    }

    // Mountains inside front document
    if (dDocFront <= -15 && y > 230 && y < 330 && x > 165 && x < 355) {
      r = 255;
      g = 255;
      b = 255;
    }

    return [r, g, b, a];
  });
}

// Render PassPorto 512x512 Master Icon (Camera / Biometric in Blue/Indigo)
function renderPassportoIcon() {
  return makePng(512, 512, (x, y, W, H) => {
    const dRect = sdRoundRect(x, y, 512, 512, 115);
    if (dRect > 0) return [0, 0, 0, 0];

    const tBg = (x + y) / 1024;
    let r = Math.round(10 * (1 - tBg) + 15 * tBg);
    let g = Math.round(18 * (1 - tBg) + 23 * tBg);
    let b = Math.round(35 * (1 - tBg) + 55 * tBg);
    let a = 255;

    // Glowing Blue Border
    if (dRect > -14) {
      const tb = x / 512;
      const br = Math.round(37 * (1 - tb) + 56 * tb);
      const bg = Math.round(99 * (1 - tb) + 189 * tb);
      const bb = Math.round(235 * (1 - tb) + 248 * tb);
      r = br;
      g = bg;
      b = bb;
    }

    // Biometric Camera Frame & Head Silhouette
    const dFrame = sdRoundRect(x, y, 270, 310, 36);
    if (dFrame <= 0 && dFrame >= -18) {
      r = 56;
      g = 189;
      b = 248;
    }

    // Head circle
    const dHead = Math.hypot(x - 256, y - 225) - 48;
    if (dHead <= 0) {
      r = 255;
      g = 255;
      b = 255;
    }

    // Shoulders
    const dShoulders = Math.hypot(x - 256, y - 355) - 95;
    if (dShoulders <= 0 && y >= 285 && dFrame <= -18) {
      r = 255;
      g = 255;
      b = 255;
    }

    return [r, g, b, a];
  });
}

// Generate Grassroot Digital SVG
const GRASSROOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f18"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#10b981" flood-opacity="0.45"/>
    </filter>
  </defs>
  
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)"/>
  <rect width="498" height="498" x="7" y="7" rx="108" fill="none" stroke="url(#borderGrad)" stroke-width="12"/>
  
  <!-- Central 4-point Sparkle -->
  <path d="M256 95 C256 185, 185 256, 95 256 C185 256, 256 327, 256 417 C256 327, 327 256, 417 256 C327 256, 256 185, 256 95 Z" 
        fill="url(#sparkleGrad)" filter="url(#glow)"/>
  
  <!-- Secondary Top-Right Sparkle -->
  <path d="M375 100 C375 125, 350 145, 325 145 C350 145, 375 165, 375 190 C375 165, 400 145, 425 145 C400 145, 375 125, 375 100 Z" 
        fill="#fbbf24"/>
        
  <!-- Tertiary Bottom-Left Sparkle -->
  <path d="M145 340 C145 358, 127 375, 110 375 C127 375, 145 392, 145 410 C145 392, 163 375, 180 375 C163 375, 145 358, 145 340 Z" 
        fill="#34d399"/>
</svg>`;

const WEB_MANIFEST = {
  name: 'Grassroot Digital',
  short_name: 'Grassroot',
  description: '100% Client-Side Privacy-First Developer Tools & Mobile Proxy Suite',
  start_url: '/',
  display: 'standalone',
  background_color: '#0a0d14',
  theme_color: '#0a0d14',
  icons: [
    {
      src: '/icon-48.png',
      sizes: '48x48',
      type: 'image/png',
    },
    {
      src: '/icon-96.png',
      sizes: '96x96',
      type: 'image/png',
    },
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};

// Process directory favicons
function processDirFavicons(targetDir, masterPngBuffer, svgContent, appName) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Write master 512x512
  const p512 = path.join(targetDir, 'icon-512.png');
  fs.writeFileSync(p512, masterPngBuffer);
  fs.writeFileSync(path.join(targetDir, 'icon.png'), masterPngBuffer);

  // 2. Write SVG
  if (svgContent) {
    fs.writeFileSync(path.join(targetDir, 'favicon.svg'), svgContent);
    fs.writeFileSync(path.join(targetDir, 'icon.svg'), svgContent);
  }

  // 3. Downscale sizes with sips
  const sizes = [192, 180, 96, 48, 32, 16];
  for (const size of sizes) {
    const outPng = path.join(targetDir, `icon-${size}.png`);
    execSync(`/usr/bin/sips -z ${size} ${size} "${p512}" --out "${outPng}"`, { stdio: 'ignore' });
  }

  // Apple touch icon (180x180)
  fs.copyFileSync(path.join(targetDir, 'icon-180.png'), path.join(targetDir, 'apple-touch-icon.png'));

  // 4. Build standard multi-resolution favicon.ico (16, 32, 48)
  const icoBuffers = [
    { width: 48, height: 48, buffer: fs.readFileSync(path.join(targetDir, 'icon-48.png')) },
    { width: 32, height: 32, buffer: fs.readFileSync(path.join(targetDir, 'icon-32.png')) },
    { width: 16, height: 16, buffer: fs.readFileSync(path.join(targetDir, 'icon-16.png')) },
  ];
  const icoData = makeIco(icoBuffers);
  fs.writeFileSync(path.join(targetDir, 'favicon.ico'), icoData);
  fs.writeFileSync(path.join(targetDir, 'icon.ico'), icoData);

  // 5. Write webmanifest
  const manifest = {
    ...WEB_MANIFEST,
    name: appName || WEB_MANIFEST.name,
    short_name: appName || WEB_MANIFEST.short_name,
  };
  fs.writeFileSync(path.join(targetDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

  console.log(`✓ Generated complete favicon set in: ${targetDir}`);
}

async function main() {
  console.log('Generating Grassroot Digital and tool suite favicons...');

  // 1. Grassroot Digital (Landing / Root)
  const grassrootPng512 = renderGrassrootIcon();
  processDirFavicons(path.join(rootDir, 'landing/public'), grassrootPng512, GRASSROOT_SVG, 'Grassroot Digital');

  // 2. Endly (public/)
  let endlyPng512 = grassrootPng512;
  if (fs.existsSync(path.join(rootDir, 'public/icon.png'))) {
    endlyPng512 = fs.readFileSync(path.join(rootDir, 'public/icon.png'));
  }
  processDirFavicons(path.join(rootDir, 'public'), endlyPng512, null, 'Endly API Client');

  // 3. TokenLens (tokenlens/public/)
  let tokenlensPng512 = grassrootPng512;
  if (fs.existsSync(path.join(rootDir, 'tokenlens/public/icon.png'))) {
    tokenlensPng512 = fs.readFileSync(path.join(rootDir, 'tokenlens/public/icon.png'));
  }
  processDirFavicons(path.join(rootDir, 'tokenlens/public'), tokenlensPng512, null, 'TokenLens JWT Studio');

  // 4. JSONLens (jsonlens/public/)
  let jsonlensPng512 = grassrootPng512;
  if (fs.existsSync(path.join(rootDir, 'jsonlens/public/icon.png'))) {
    jsonlensPng512 = fs.readFileSync(path.join(rootDir, 'jsonlens/public/icon.png'));
  }
  processDirFavicons(path.join(rootDir, 'jsonlens/public'), jsonlensPng512, null, 'JSONLens Diff Studio');

  // 5. RegexForge (regexforge/public/)
  let regexforgePng512 = grassrootPng512;
  if (fs.existsSync(path.join(rootDir, 'regexforge/public/icon.png'))) {
    regexforgePng512 = fs.readFileSync(path.join(rootDir, 'regexforge/public/icon.png'));
  }
  processDirFavicons(path.join(rootDir, 'regexforge/public'), regexforgePng512, null, 'RegexForge Regex Studio');

  // 6. CipherLab (cipherlab/public/)
  let cipherlabPng512 = grassrootPng512;
  if (fs.existsSync(path.join(rootDir, 'cipherlab/public/icon.png'))) {
    cipherlabPng512 = fs.readFileSync(path.join(rootDir, 'cipherlab/public/icon.png'));
  }
  processDirFavicons(path.join(rootDir, 'cipherlab/public'), cipherlabPng512, null, 'CipherLab Crypto Studio');

  // 7. Pagely (pagely/public/)
  const pagelyPng512 = renderPagelyIcon();
  processDirFavicons(path.join(rootDir, 'pagely/public'), pagelyPng512, null, 'Pagely Image to PDF');

  // 8. PassPorto (passporto/public/)
  const passportoPng512 = renderPassportoIcon();
  processDirFavicons(path.join(rootDir, 'passporto/public'), passportoPng512, null, 'PassPorto Passport Studio');

  console.log('All favicon suites successfully built!');
}

main();
