const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

/**
 * App icon: Indian man with white turban in front of an Excel spreadsheet
 * and bar chart. The spreadsheet grid (green, with column headers A/B/C)
 * fills the background. Colorful bar chart bars rise behind the character.
 * The white turban is tall and distinctive — instantly reads as Indian.
 */
function createIconSvg(size) {
  const rx = Math.round(size * 0.2);
  const s = size;
  const cx = s / 2;
  const cy = s * 0.62; // face center — pushed down to leave room for chart + grid

  // Scale helper — all dimensions relative to 512
  const r = (v) => +(v * s / 512).toFixed(2);

  // Inner area boundaries
  const inL = r(48);   // inner left
  const inT = r(48);   // inner top
  const inW = r(416);  // inner width
  const inH = r(416);  // inner height
  const inR = inL + inW; // inner right
  const inB = inT + inH; // inner bottom

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${rx}" fill="#0F1117"/>
  <defs>
    <linearGradient id="skin" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#D4956B"/>
      <stop offset="100%" stop-color="#C07844"/>
    </linearGradient>
    <linearGradient id="turbanW" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#F8F8F8"/>
      <stop offset="50%" stop-color="#E8E8E8"/>
      <stop offset="100%" stop-color="#D0D0D0"/>
    </linearGradient>
    <clipPath id="clip">
      <rect x="${inL}" y="${inT}" width="${inW}" height="${inH}" rx="${r(80)}"/>
    </clipPath>
  </defs>

  <!-- Inner rounded background — Excel green -->
  <rect x="${inL}" y="${inT}" width="${inW}" height="${inH}" rx="${r(80)}" fill="#1B7A3D"/>

  <g clip-path="url(#clip)">

    <!-- === SPREADSHEET GRID BACKGROUND === -->

    <!-- Horizontal grid lines -->
    <line x1="${inL}" y1="${inT + r(50)}" x2="${inR}" y2="${inT + r(50)}" stroke="white" stroke-width="${r(1.5)}" opacity="0.25"/>
    <line x1="${inL}" y1="${inT + r(100)}" x2="${inR}" y2="${inT + r(100)}" stroke="white" stroke-width="${r(1.5)}" opacity="0.25"/>
    <line x1="${inL}" y1="${inT + r(150)}" x2="${inR}" y2="${inT + r(150)}" stroke="white" stroke-width="${r(1.5)}" opacity="0.22"/>
    <line x1="${inL}" y1="${inT + r(200)}" x2="${inR}" y2="${inT + r(200)}" stroke="white" stroke-width="${r(1.5)}" opacity="0.2"/>
    <line x1="${inL}" y1="${inT + r(250)}" x2="${inR}" y2="${inT + r(250)}" stroke="white" stroke-width="${r(1.5)}" opacity="0.18"/>
    <line x1="${inL}" y1="${inT + r(300)}" x2="${inR}" y2="${inT + r(300)}" stroke="white" stroke-width="${r(1.5)}" opacity="0.15"/>
    <line x1="${inL}" y1="${inT + r(350)}" x2="${inR}" y2="${inT + r(350)}" stroke="white" stroke-width="${r(1.5)}" opacity="0.12"/>

    <!-- Vertical grid lines -->
    <line x1="${inL + r(80)}" y1="${inT}" x2="${inL + r(80)}" y2="${inB}" stroke="white" stroke-width="${r(1.5)}" opacity="0.25"/>
    <line x1="${inL + r(180)}" y1="${inT}" x2="${inL + r(180)}" y2="${inB}" stroke="white" stroke-width="${r(1.5)}" opacity="0.25"/>
    <line x1="${inL + r(280)}" y1="${inT}" x2="${inL + r(280)}" y2="${inB}" stroke="white" stroke-width="${r(1.5)}" opacity="0.25"/>
    <line x1="${inL + r(380)}" y1="${inT}" x2="${inL + r(380)}" y2="${inB}" stroke="white" stroke-width="${r(1.5)}" opacity="0.2"/>

    <!-- Column header bar (darker green strip at top) -->
    <rect x="${inL}" y="${inT}" width="${inW}" height="${r(50)}" fill="#145C2E" rx="0"/>

    <!-- Column headers A, B, C, D -->
    <text x="${inL + r(130)}" y="${inT + r(35)}" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="${r(26)}" fill="white" opacity="0.9" text-anchor="middle">A</text>
    <text x="${inL + r(230)}" y="${inT + r(35)}" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="${r(26)}" fill="white" opacity="0.9" text-anchor="middle">B</text>
    <text x="${inL + r(330)}" y="${inT + r(35)}" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="${r(26)}" fill="white" opacity="0.9" text-anchor="middle">C</text>

    <!-- Row numbers along left edge -->
    <text x="${inL + r(40)}" y="${inT + r(82)}" font-family="Arial,Helvetica,sans-serif" font-size="${r(20)}" fill="white" opacity="0.6" text-anchor="middle">1</text>
    <text x="${inL + r(40)}" y="${inT + r(132)}" font-family="Arial,Helvetica,sans-serif" font-size="${r(20)}" fill="white" opacity="0.6" text-anchor="middle">2</text>
    <text x="${inL + r(40)}" y="${inT + r(182)}" font-family="Arial,Helvetica,sans-serif" font-size="${r(20)}" fill="white" opacity="0.5" text-anchor="middle">3</text>

    <!-- === BAR CHART rising behind the character === -->
    <!-- Bar 1 (blue) -->
    <rect x="${cx - r(100)}" y="${cy - r(110)}" width="${r(40)}" height="${r(130)}" rx="${r(4)}" fill="#4F8EF7" opacity="0.85"/>
    <!-- Bar 2 (purple, tallest) -->
    <rect x="${cx - r(50)}" y="${cy - r(155)}" width="${r(40)}" height="${r(175)}" rx="${r(4)}" fill="#7C3AED" opacity="0.85"/>
    <!-- Bar 3 (amber) -->
    <rect x="${cx}" y="${cy - r(125)}" width="${r(40)}" height="${r(145)}" rx="${r(4)}" fill="#F59E0B" opacity="0.85"/>
    <!-- Bar 4 (blue, short) -->
    <rect x="${cx + r(50)}" y="${cy - r(80)}" width="${r(40)}" height="${r(100)}" rx="${r(4)}" fill="#4F8EF7" opacity="0.7"/>

    <!-- === BODY / SHOULDERS === -->
    <ellipse cx="${cx}" cy="${r(510)}" rx="${r(120)}" ry="${r(80)}" fill="#1E3A5F"/>

    <!-- Neck -->
    <rect x="${cx - r(28)}" y="${cy + r(58)}" width="${r(56)}" height="${r(36)}" rx="${r(8)}" fill="url(#skin)"/>

    <!-- === FACE === -->
    <ellipse cx="${cx}" cy="${cy}" rx="${r(60)}" ry="${r(70)}" fill="url(#skin)"/>

    <!-- Eyes -->
    <ellipse cx="${cx - r(22)}" cy="${cy - r(6)}" rx="${r(10)}" ry="${r(10)}" fill="white"/>
    <ellipse cx="${cx + r(22)}" cy="${cy - r(6)}" rx="${r(10)}" ry="${r(10)}" fill="white"/>
    <circle cx="${cx - r(20)}" cy="${cy - r(4)}" r="${r(5.5)}" fill="#2D1810"/>
    <circle cx="${cx + r(24)}" cy="${cy - r(4)}" r="${r(5.5)}" fill="#2D1810"/>
    <circle cx="${cx - r(19)}" cy="${cy - r(6)}" r="${r(1.8)}" fill="white" opacity="0.9"/>
    <circle cx="${cx + r(25)}" cy="${cy - r(6)}" r="${r(1.8)}" fill="white" opacity="0.9"/>

    <!-- Eyebrows -->
    <path d="M${cx - r(34)},${cy - r(20)} Q${cx - r(22)},${cy - r(28)} ${cx - r(10)},${cy - r(20)}" stroke="#2D1810" stroke-width="${r(4)}" fill="none" stroke-linecap="round"/>
    <path d="M${cx + r(10)},${cy - r(20)} Q${cx + r(22)},${cy - r(28)} ${cx + r(34)},${cy - r(20)}" stroke="#2D1810" stroke-width="${r(4)}" fill="none" stroke-linecap="round"/>

    <!-- Nose -->
    <path d="M${cx},${cy} L${cx + r(6)},${cy + r(18)}" stroke="#A0673A" stroke-width="${r(2.5)}" fill="none" stroke-linecap="round"/>

    <!-- Mustache -->
    <path d="M${cx - r(24)},${cy + r(26)} Q${cx},${cy + r(34)} ${cx + r(24)},${cy + r(26)}" fill="#1A0E06"/>

    <!-- Smile -->
    <path d="M${cx - r(18)},${cy + r(36)} Q${cx},${cy + r(48)} ${cx + r(18)},${cy + r(36)}" stroke="#8B4020" stroke-width="${r(2.5)}" fill="none" stroke-linecap="round"/>

    <!-- Ears -->
    <ellipse cx="${cx - r(60)}" cy="${cy + r(2)}" rx="${r(10)}" ry="${r(14)}" fill="#C07844"/>
    <ellipse cx="${cx + r(60)}" cy="${cy + r(2)}" rx="${r(10)}" ry="${r(14)}" fill="#C07844"/>

    <!-- === WHITE TURBAN (tall pagri) === -->

    <!-- Main turban dome — tall and peaked -->
    <path d="M${cx - r(78)},${cy - r(30)}
             Q${cx - r(85)},${cy - r(100)} ${cx - r(50)},${cy - r(150)}
             Q${cx - r(20)},${cy - r(185)} ${cx},${cy - r(190)}
             Q${cx + r(20)},${cy - r(185)} ${cx + r(50)},${cy - r(150)}
             Q${cx + r(85)},${cy - r(100)} ${cx + r(78)},${cy - r(30)}
             Z" fill="url(#turbanW)"/>

    <!-- Turban wrap folds (horizontal bands) -->
    <path d="M${cx - r(72)},${cy - r(50)} Q${cx},${cy - r(65)} ${cx + r(72)},${cy - r(50)}" stroke="#C0C0C0" stroke-width="${r(2)}" fill="none" opacity="0.6"/>
    <path d="M${cx - r(78)},${cy - r(75)} Q${cx},${cy - r(92)} ${cx + r(78)},${cy - r(75)}" stroke="#B8B8B8" stroke-width="${r(2.5)}" fill="none" opacity="0.5"/>
    <path d="M${cx - r(74)},${cy - r(100)} Q${cx},${cy - r(118)} ${cx + r(74)},${cy - r(100)}" stroke="#C0C0C0" stroke-width="${r(2)}" fill="none" opacity="0.5"/>
    <path d="M${cx - r(60)},${cy - r(130)} Q${cx},${cy - r(148)} ${cx + r(60)},${cy - r(130)}" stroke="#B0B0B0" stroke-width="${r(2)}" fill="none" opacity="0.4"/>
    <path d="M${cx - r(38)},${cy - r(158)} Q${cx},${cy - r(172)} ${cx + r(38)},${cy - r(158)}" stroke="#C8C8C8" stroke-width="${r(1.5)}" fill="none" opacity="0.35"/>

    <!-- Turban forehead band (prominent lower edge) -->
    <path d="M${cx - r(78)},${cy - r(30)} Q${cx},${cy - r(46)} ${cx + r(78)},${cy - r(30)}" stroke="#D8D8D8" stroke-width="${r(12)}" fill="none" stroke-linecap="round"/>
    <path d="M${cx - r(74)},${cy - r(30)} Q${cx},${cy - r(44)} ${cx + r(74)},${cy - r(30)}" stroke="white" stroke-width="${r(6)}" fill="none" stroke-linecap="round"/>

    <!-- Turban side tails (fabric draping down on sides) -->
    <path d="M${cx - r(72)},${cy - r(36)} Q${cx - r(82)},${cy - r(10)} ${cx - r(70)},${cy + r(10)}" stroke="url(#turbanW)" stroke-width="${r(14)}" fill="none" stroke-linecap="round"/>
    <path d="M${cx + r(72)},${cy - r(36)} Q${cx + r(82)},${cy - r(10)} ${cx + r(70)},${cy + r(10)}" stroke="url(#turbanW)" stroke-width="${r(14)}" fill="none" stroke-linecap="round"/>

    <!-- Turban jewel (small gold/amber accent) -->
    <circle cx="${cx}" cy="${cy - r(36)}" r="${r(8)}" fill="#B45309"/>
    <circle cx="${cx}" cy="${cy - r(36)}" r="${r(5.5)}" fill="#F59E0B"/>
    <circle cx="${cx - r(1.5)}" cy="${cy - r(38.5)}" r="${r(2)}" fill="white" opacity="0.8"/>

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
