const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. High-resolution SVG Icon with Karnataka Police shield styling
const generateSvg = (size, isMaskable = false) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="50%" stop-color="#172554"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  ${isMaskable ? `<rect width="512" height="512" fill="url(#bgGrad)"/>` : `<rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>`}

  <!-- Subtle outer golden border -->
  <rect x="16" y="16" width="480" height="480" rx="96" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-opacity="0.6"/>

  <!-- Shield Shape with Shadow -->
  <g filter="url(#shadow)">
    <path d="M256 64 C350 64 380 96 380 96 C380 250 340 370 256 424 C172 370 132 250 132 96 C132 96 162 64 256 64 Z" 
          fill="url(#shieldGrad)" stroke="url(#goldGrad)" stroke-width="12" stroke-linejoin="round"/>
  </g>

  <!-- Inner Shield Trim -->
  <path d="M256 84 C334 84 360 110 360 110 C360 236 326 344 256 394 C186 344 152 236 152 110 C152 110 178 84 256 84 Z" 
        fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-opacity="0.8"/>

  <!-- Golden Police Star at Top Center -->
  <polygon points="256,110 264,130 286,132 269,146 274,168 256,156 238,168 243,146 226,132 248,130" 
           fill="url(#goldGrad)"/>

  <!-- House / Security Survey Emblem -->
  <!-- Roof -->
  <polygon points="256,176 330,236 312,236 312,300 200,300 200,236 182,236" fill="none" stroke="url(#goldGrad)" stroke-width="8" stroke-linejoin="round"/>
  <!-- Door / Keyhole / Shield Core -->
  <path d="M236 244 H276 V300 H236 Z" fill="url(#goldGrad)" opacity="0.9"/>
  <!-- Police Beacon / Light -->
  <circle cx="256" cy="214" r="14" fill="#ef4444"/>
  <circle cx="256" cy="214" r="7" fill="#ffffff"/>

  <!-- Golden Scales of Justice / Wings motif -->
  <path d="M190 270 Q256 295 322 270" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round"/>

  <!-- Kannada & English Text Banner -->
  <g text-anchor="middle">
    <!-- Kannada Title -->
    <text x="256" y="350" font-family="Arial, 'Noto Sans Kannada', sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="1">
      ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್
    </text>
    <!-- Subtitle -->
    <text x="256" y="380" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#fbbf24" letter-spacing="2">
      POLICE SURVEY &amp; REGISTRY
    </text>
    <!-- Emergency Tag -->
    <text x="256" y="468" font-family="Arial, sans-serif" font-weight="800" font-size="16" fill="#60a5fa" letter-spacing="3">
      KARNATAKA STATE POLICE
    </text>
  </g>
</svg>`;

// Write SVGs
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), generateSvg(192, false), 'utf8');
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), generateSvg(512, false), 'utf8');
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), generateSvg(512, true), 'utf8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), generateSvg(64, false), 'utf8');

// 2. High Quality Pure JS PNG Generator for 192 and 512
function createPngFile(filePath, width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const rawRows = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const offset = 1 + x * 4;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded rectangle badge background
      const cornerR = 0.35;
      const qx = Math.max(Math.abs(dx) - (1 - cornerR), 0);
      const qy = Math.max(Math.abs(dy) - (1 - cornerR), 0);
      const cornerDist = Math.sqrt(qx * qx + qy * qy);

      if (cornerDist > cornerR) {
        // Transparent outside rounded corner
        row[offset] = 0;
        row[offset + 1] = 0;
        row[offset + 2] = 0;
        row[offset + 3] = 0;
      } else if (dist < 0.65) {
        // Shield core (Police Blue with golden border)
        if (dist > 0.60) {
          // Golden trim
          row[offset] = 234;     // R
          row[offset + 1] = 179; // G
          row[offset + 2] = 8;   // B
          row[offset + 3] = 255; // A
        } else if (dist > 0.55) {
          // Inner shield accent
          row[offset] = 30;
          row[offset + 1] = 64;
          row[offset + 2] = 175;
          row[offset + 3] = 255;
        } else if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.2) {
          // Center Gold emblem
          row[offset] = 254;
          row[offset + 1] = 240;
          row[offset + 2] = 138;
          row[offset + 3] = 255;
        } else {
          // Deep royal navy
          row[offset] = 23;
          row[offset + 1] = 37;
          row[offset + 2] = 84;
          row[offset + 3] = 255;
        }
      } else {
        // Outer dark gradient background
        row[offset] = 15;
        row[offset + 1] = 23;
        row[offset + 2] = 42;
        row[offset + 3] = 255;
      }
    }
    rawRows.push(row);
  }

  const idatData = zlib.deflateSync(Buffer.concat(rawRows));
  const idatChunk = makeChunk('IDAT', idatData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  fs.writeFileSync(filePath, Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]));
}

createPngFile(path.join(iconsDir, 'icon-192.png'), 192, 192);
createPngFile(path.join(iconsDir, 'icon-512.png'), 512, 512);
createPngFile(path.join(iconsDir, 'icon-maskable.png'), 512, 512);
createPngFile(path.join(publicDir, 'favicon.ico'), 64, 64);

console.log('✅ PWA Icons successfully generated in frontend/public/icons/:');
console.log('   - icon-192.png & icon-192.svg');
console.log('   - icon-512.png & icon-512.svg');
console.log('   - icon-maskable.png & icon-maskable.svg');
console.log('   - favicon.ico & favicon.svg');
