const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

/**
 * App icon: Stylized Indian man with a turban made of spreadsheet grid.
 * The turban has flowing fabric folds with Excel-green color and white
 * grid lines woven in, with tiny cell references. A jewel pin at front.
 * Friendly face with warm skin tone, mustache, and confident smile.
 */
function createIconSvg(size) {
  const rx = Math.round(size * 0.2);
  const s = size;
  const cx = s / 2;
  const cy = s * 0.56; // face center

  // Scale helper
  const r = (v) => +(v * s / 512).toFixed(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${rx}" fill="#0F1117"/>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4F8EF7"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <linearGradient id="turbanMain" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="50%" stop-color="#16A34A"/>
      <stop offset="100%" stop-color="#15803D"/>
    </linearGradient>
    <linearGradient id="turbanLight" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#4ADE80"/>
      <stop offset="100%" stop-color="#22C55E"/>
    </linearGradient>
    <linearGradient id="skin" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#D4956B"/>
      <stop offset="100%" stop-color="#C07844"/>
    </linearGradient>
    <linearGradient id="shirt" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#1D6F3E"/>
      <stop offset="100%" stop-color="#14532D"/>
    </linearGradient>
    <clipPath id="clip">
      <rect x="${r(48)}" y="${r(48)}" width="${r(416)}" height="${r(416)}" rx="${r(80)}"/>
    </clipPath>
  </defs>

  <!-- Inner rounded background -->
  <rect x="${r(48)}" y="${r(48)}" width="${r(416)}" height="${r(416)}" rx="${r(80)}" fill="url(#bg)"/>

  <g clip-path="url(#clip)">

    <!-- === BODY / SHIRT === -->
    <ellipse cx="${cx}" cy="${r(500)}" rx="${r(130)}" ry="${r(90)}" fill="url(#shirt)"/>
    <!-- Collar -->
    <path d="M${cx - r(38)},${cy + r(80)} L${cx},${cy + r(100)} L${cx + r(38)},${cy + r(80)}" stroke="#15803D" stroke-width="${r(3)}" fill="none"/>

    <!-- Neck -->
    <rect x="${cx - r(32)}" y="${cy + r(62)}" width="${r(64)}" height="${r(42)}" rx="${r(8)}" fill="url(#skin)"/>
    <!-- Neck shadow -->
    <ellipse cx="${cx}" cy="${cy + r(64)}" rx="${r(32)}" ry="${r(6)}" fill="#A0673A" opacity="0.3"/>

    <!-- Ears -->
    <ellipse cx="${cx - r(68)}" cy="${cy + r(4)}" rx="${r(14)}" ry="${r(18)}" fill="#C07844"/>
    <ellipse cx="${cx - r(68)}" cy="${cy + r(4)}" rx="${r(8)}" ry="${r(12)}" fill="#B06A3A" opacity="0.4"/>
    <ellipse cx="${cx + r(68)}" cy="${cy + r(4)}" rx="${r(14)}" ry="${r(18)}" fill="#C07844"/>
    <ellipse cx="${cx + r(68)}" cy="${cy + r(4)}" rx="${r(8)}" ry="${r(12)}" fill="#B06A3A" opacity="0.4"/>

    <!-- === FACE === -->
    <ellipse cx="${cx}" cy="${cy}" rx="${r(66)}" ry="${r(78)}" fill="url(#skin)"/>

    <!-- Eyes — white sclera -->
    <ellipse cx="${cx - r(24)}" cy="${cy - r(6)}" rx="${r(12)}" ry="${r(11)}" fill="white"/>
    <ellipse cx="${cx + r(24)}" cy="${cy - r(6)}" rx="${r(12)}" ry="${r(11)}" fill="white"/>
    <!-- Iris -->
    <circle cx="${cx - r(22)}" cy="${cy - r(4)}" r="${r(6.5)}" fill="#3B2510"/>
    <circle cx="${cx + r(26)}" cy="${cy - r(4)}" r="${r(6.5)}" fill="#3B2510"/>
    <!-- Pupil -->
    <circle cx="${cx - r(21)}" cy="${cy - r(4)}" r="${r(3)}" fill="#1A1005"/>
    <circle cx="${cx + r(27)}" cy="${cy - r(4)}" r="${r(3)}" fill="#1A1005"/>
    <!-- Eye shine -->
    <circle cx="${cx - r(19)}" cy="${cy - r(7)}" r="${r(2)}" fill="white" opacity="0.9"/>
    <circle cx="${cx + r(29)}" cy="${cy - r(7)}" r="${r(2)}" fill="white" opacity="0.9"/>

    <!-- Eyebrows -->
    <path d="M${cx - r(38)},${cy - r(22)} Q${cx - r(24)},${cy - r(32)} ${cx - r(10)},${cy - r(24)}" stroke="#2D1810" stroke-width="${r(4.5)}" fill="none" stroke-linecap="round"/>
    <path d="M${cx + r(10)},${cy - r(24)} Q${cx + r(24)},${cy - r(32)} ${cx + r(38)},${cy - r(22)}" stroke="#2D1810" stroke-width="${r(4.5)}" fill="none" stroke-linecap="round"/>

    <!-- Nose -->
    <path d="M${cx - r(2)},${cy + r(2)} Q${cx + r(12)},${cy + r(22)} ${cx + r(2)},${cy + r(24)} Q${cx - r(6)},${cy + r(26)} ${cx - r(8)},${cy + r(20)}" stroke="#A0673A" stroke-width="${r(2.5)}" fill="none" stroke-linecap="round"/>

    <!-- Mustache -->
    <path d="M${cx - r(30)},${cy + r(32)} Q${cx - r(14)},${cy + r(42)} ${cx},${cy + r(32)} Q${cx + r(14)},${cy + r(42)} ${cx + r(30)},${cy + r(32)}" fill="#1A0E06"/>
    <!-- Mustache curls -->
    <path d="M${cx - r(30)},${cy + r(32)} Q${cx - r(36)},${cy + r(34)} ${cx - r(34)},${cy + r(28)}" stroke="#1A0E06" stroke-width="${r(3)}" fill="none" stroke-linecap="round"/>
    <path d="M${cx + r(30)},${cy + r(32)} Q${cx + r(36)},${cy + r(34)} ${cx + r(34)},${cy + r(28)}" stroke="#1A0E06" stroke-width="${r(3)}" fill="none" stroke-linecap="round"/>

    <!-- Smile -->
    <path d="M${cx - r(22)},${cy + r(42)} Q${cx},${cy + r(56)} ${cx + r(22)},${cy + r(42)}" stroke="#8B4020" stroke-width="${r(3)}" fill="none" stroke-linecap="round"/>
    <!-- Lower lip hint -->
    <path d="M${cx - r(14)},${cy + r(48)} Q${cx},${cy + r(54)} ${cx + r(14)},${cy + r(48)}" fill="#C0785E" opacity="0.4"/>

    <!-- === TURBAN — flowing folds with spreadsheet grid === -->

    <!-- Turban main dome -->
    <path d="M${cx - r(90)},${cy - r(32)} Q${cx - r(95)},${cy - r(120)} ${cx},${cy - r(140)} Q${cx + r(95)},${cy - r(120)} ${cx + r(90)},${cy - r(32)}" fill="url(#turbanMain)"/>

    <!-- Turban fold layers (flowing wraps) -->
    <!-- Top fold -->
    <path d="M${cx - r(70)},${cy - r(115)} Q${cx},${cy - r(135)} ${cx + r(70)},${cy - r(115)}" stroke="url(#turbanLight)" stroke-width="${r(16)}" fill="none" stroke-linecap="round"/>
    <!-- Upper-mid fold -->
    <path d="M${cx - r(82)},${cy - r(90)} Q${cx},${cy - r(108)} ${cx + r(82)},${cy - r(90)}" stroke="#22C55E" stroke-width="${r(15)}" fill="none" stroke-linecap="round"/>
    <!-- Mid fold -->
    <path d="M${cx - r(88)},${cy - r(66)} Q${cx},${cy - r(82)} ${cx + r(88)},${cy - r(66)}" stroke="#16A34A" stroke-width="${r(14)}" fill="none" stroke-linecap="round"/>
    <!-- Lower fold (band across forehead) -->
    <path d="M${cx - r(90)},${cy - r(42)} Q${cx},${cy - r(56)} ${cx + r(90)},${cy - r(42)}" stroke="#15803D" stroke-width="${r(16)}" fill="none" stroke-linecap="round"/>
    <path d="M${cx - r(86)},${cy - r(42)} Q${cx},${cy - r(54)} ${cx + r(86)},${cy - r(42)}" stroke="#22C55E" stroke-width="${r(8)}" fill="none" stroke-linecap="round"/>

    <!-- Turban side drapes -->
    <ellipse cx="${cx - r(78)}" cy="${cy - r(32)}" rx="${r(22)}" ry="${r(40)}" fill="#16A34A"/>
    <ellipse cx="${cx + r(78)}" cy="${cy - r(32)}" rx="${r(22)}" ry="${r(40)}" fill="#16A34A"/>

    <!-- === SPREADSHEET GRID on turban === -->
    <!-- Horizontal grid lines across folds -->
    <line x1="${cx - r(60)}" y1="${cy - r(108)}" x2="${cx + r(60)}" y2="${cy - r(108)}" stroke="white" stroke-width="${r(1.2)}" opacity="0.35"/>
    <line x1="${cx - r(72)}" y1="${cy - r(90)}" x2="${cx + r(72)}" y2="${cy - r(90)}" stroke="white" stroke-width="${r(1.2)}" opacity="0.35"/>
    <line x1="${cx - r(80)}" y1="${cy - r(72)}" x2="${cx + r(80)}" y2="${cy - r(72)}" stroke="white" stroke-width="${r(1.2)}" opacity="0.3"/>

    <!-- Vertical grid lines -->
    <line x1="${cx - r(30)}" y1="${cy - r(130)}" x2="${cx - r(34)}" y2="${cy - r(50)}" stroke="white" stroke-width="${r(1.2)}" opacity="0.3"/>
    <line x1="${cx}" y1="${cy - r(138)}" x2="${cx}" y2="${cy - r(50)}" stroke="white" stroke-width="${r(1.2)}" opacity="0.35"/>
    <line x1="${cx + r(30)}" y1="${cy - r(130)}" x2="${cx + r(34)}" y2="${cy - r(50)}" stroke="white" stroke-width="${r(1.2)}" opacity="0.3"/>

    <!-- Cell values woven into turban -->
    <text x="${cx - r(16)}" y="${cy - r(95)}" font-family="monospace" font-size="${r(13)}" fill="white" opacity="0.5" text-anchor="middle">A1</text>
    <text x="${cx + r(16)}" y="${cy - r(95)}" font-family="monospace" font-size="${r(13)}" fill="white" opacity="0.5" text-anchor="middle">B2</text>
    <text x="${cx - r(16)}" y="${cy - r(76)}" font-family="monospace" font-size="${r(12)}" fill="white" opacity="0.4" text-anchor="middle">$</text>
    <text x="${cx + r(16)}" y="${cy - r(76)}" font-family="monospace" font-size="${r(12)}" fill="white" opacity="0.4" text-anchor="middle">42</text>

    <!-- Turban jewel/pin centered on forehead band -->
    <circle cx="${cx}" cy="${cy - r(44)}" r="${r(10)}" fill="#0D5C2A"/>
    <circle cx="${cx}" cy="${cy - r(44)}" r="${r(7)}" fill="#4ADE80"/>
    <circle cx="${cx - r(2)}" cy="${cy - r(47)}" r="${r(2.5)}" fill="white" opacity="0.85"/>

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

  // Write the 512 SVG for reference
  fs.writeFileSync(
    path.join(ICONS_DIR, "icon-512.svg"),
    createIconSvg(512)
  );
  console.log("Written icon-512.svg");

  console.log("Done!");
}

generate().catch(console.error);
