const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

// SVG template for the app icon
function createIconSvg(size) {
  const rx = Math.round(size * 0.2);
  const innerMargin = Math.round(size * 0.125);
  const innerSize = size - innerMargin * 2;
  const innerRx = Math.round(innerSize * 0.19);
  const fontSize = Math.round(size * 0.33);
  const textY = Math.round(size * 0.58);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#0F1117"/>
  <rect x="${innerMargin}" y="${innerMargin}" width="${innerSize}" height="${innerSize}" rx="${innerRx}" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4F8EF7"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <g transform="translate(${size / 2}, ${textY})">
    <rect x="${-fontSize * 0.45}" y="${-fontSize * 0.55}" width="${fontSize * 0.35}" height="${fontSize * 0.7}" rx="2" fill="white" opacity="0.9"/>
    <rect x="${-fontSize * 0.05}" y="${-fontSize * 0.55}" width="${fontSize * 0.35}" height="${fontSize * 0.7}" rx="2" fill="white" opacity="0.7"/>
    <line x1="${-fontSize * 0.35}" y1="${-fontSize * 0.3}" x2="${-fontSize * 0.2}" y2="${-fontSize * 0.3}" stroke="#4F8EF7" stroke-width="${Math.max(1, size * 0.01)}"/>
    <line x1="${-fontSize * 0.35}" y1="${-fontSize * 0.1}" x2="${-fontSize * 0.2}" y2="${-fontSize * 0.1}" stroke="#4F8EF7" stroke-width="${Math.max(1, size * 0.01)}"/>
    <line x1="${fontSize * 0.05}" y1="${-fontSize * 0.3}" x2="${fontSize * 0.2}" y2="${-fontSize * 0.3}" stroke="#7C3AED" stroke-width="${Math.max(1, size * 0.01)}"/>
    <line x1="${fontSize * 0.05}" y1="${-fontSize * 0.1}" x2="${fontSize * 0.2}" y2="${-fontSize * 0.1}" stroke="#7C3AED" stroke-width="${Math.max(1, size * 0.01)}"/>
    <polygon points="${fontSize * 0.35},${-fontSize * 0.15} ${fontSize * 0.5},${fontSize * 0.05} ${fontSize * 0.2},${fontSize * 0.05}" fill="#22C55E"/>
  </g>
</svg>`;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  for (const size of sizes) {
    const svg = Buffer.from(createIconSvg(size));
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Also generate apple-touch-icon (180x180)
  const appleSvg = Buffer.from(createIconSvg(180));
  await sharp(appleSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(ICONS_DIR, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");

  console.log("Done!");
}

generate().catch(console.error);
