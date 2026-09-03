import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const APPS = [
  {
    id: 'endly',
    name: 'Endly',
    gradientStart: '#f97316',
    gradientEnd: '#ea580c',
    glowColor: '#fb923c',
    svgContent: `
      <!-- Background Squircle -->
      <rect width="1024" height="1024" rx="228" fill="#0d1117"/>
      <rect width="1016" height="1016" x="4" y="4" rx="224" fill="none" stroke="url(#borderGrad)" stroke-width="8"/>
      
      <!-- Inner Glow & Gradient Plate -->
      <rect width="900" height="900" x="62" y="62" rx="190" fill="url(#bgGrad)" opacity="0.12"/>
      
      <!-- Lightning Bolt / Zap Icon -->
      <path d="M570 140 L280 540 L490 540 L410 884 L744 464 L534 464 Z" fill="url(#boltGrad)" filter="url(#dropShadow)"/>
      <path d="M570 140 L280 540 L490 540 L410 884 L744 464 L534 464 Z" fill="none" stroke="#ffffff" stroke-width="12" stroke-linejoin="round" opacity="0.3"/>
      
      <defs>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fb923c" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ea580c" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#c2410c"/>
        </linearGradient>
        <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fed7aa"/>
          <stop offset="30%" stop-color="#fb923c"/>
          <stop offset="100%" stop-color="#ea580c"/>
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#f97316" flood-opacity="0.6"/>
        </filter>
      </defs>
    `,
  },
  {
    id: 'tokenlens',
    name: 'TokenLens',
    gradientStart: '#8b5cf6',
    gradientEnd: '#6d28d9',
    glowColor: '#a78bfa',
    svgContent: `
      <!-- Background Squircle -->
      <rect width="1024" height="1024" rx="228" fill="#0b0d17"/>
      <rect width="1016" height="1016" x="4" y="4" rx="224" fill="none" stroke="url(#borderGrad)" stroke-width="8"/>
      <rect width="900" height="900" x="62" y="62" rx="190" fill="url(#bgGrad)" opacity="0.15"/>
      
      <!-- Key & Aperture Lens Icon -->
      <g filter="url(#dropShadow)">
        <circle cx="512" cy="512" r="280" fill="none" stroke="url(#lensGrad)" stroke-width="48" opacity="0.5"/>
        <circle cx="512" cy="512" r="210" fill="none" stroke="url(#lensGrad)" stroke-width="20" stroke-dasharray="32 16"/>
        <path d="M592 432 A120 120 0 1 0 500 520 L400 620 L400 690 L470 690 L470 640 L520 640 L520 590 L560 550 A120 120 0 0 0 592 432 Z M600 390 A30 30 0 1 1 570 420 A30 30 0 0 1 600 390 Z" fill="url(#keyGrad)"/>
      </g>
      
      <defs>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#6d28d9" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#4c1d95"/>
        </linearGradient>
        <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
        <linearGradient id="keyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fdf4ff"/>
          <stop offset="30%" stop-color="#d8b4fe"/>
          <stop offset="100%" stop-color="#9333ea"/>
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="36" flood-color="#8b5cf6" flood-opacity="0.6"/>
        </filter>
      </defs>
    `,
  },
  {
    id: 'jsonlens',
    name: 'JSONLens',
    gradientStart: '#06b6d4',
    gradientEnd: '#0284c7',
    glowColor: '#38bdf8',
    svgContent: `
      <!-- Background Squircle -->
      <rect width="1024" height="1024" rx="228" fill="#080f1e"/>
      <rect width="1016" height="1016" x="4" y="4" rx="224" fill="none" stroke="url(#borderGrad)" stroke-width="8"/>
      <rect width="900" height="900" x="62" y="62" rx="190" fill="url(#bgGrad)" opacity="0.15"/>
      
      <!-- Glowing Braces & Diff Node -->
      <g filter="url(#dropShadow)" fill="url(#braceGrad)">
        <!-- Left Brace { -->
        <path d="M380 220 C320 220 280 260 280 320 L280 440 C280 480 250 512 210 512 C250 512 280 544 280 584 L280 704 C280 764 320 804 380 804 L410 804 L410 744 L380 744 C350 744 340 730 340 694 L340 574 C340 520 300 480 250 480 C300 480 340 440 340 386 L340 266 C340 230 350 220 380 220 Z"/>
        <!-- Right Brace } -->
        <path d="M644 220 C704 220 744 260 744 320 L744 440 C744 480 774 512 814 512 C774 512 744 544 744 584 L744 704 C744 764 704 804 644 804 L614 804 L614 744 L644 744 C674 744 684 730 684 694 L684 574 C684 520 724 480 774 480 C724 480 684 440 684 386 L684 266 C684 230 674 220 644 220 Z"/>
        <!-- Center Diff Node / Colon Dots -->
        <circle cx="512" cy="400" r="32" fill="#38bdf8"/>
        <circle cx="512" cy="624" r="32" fill="#38bdf8"/>
      </g>
      
      <defs>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06b6d4"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
        <linearGradient id="braceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="30%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="36" flood-color="#06b6d4" flood-opacity="0.6"/>
        </filter>
      </defs>
    `,
  },
  {
    id: 'regexforge',
    name: 'RegexForge',
    gradientStart: '#10b981',
    gradientEnd: '#059669',
    glowColor: '#34d399',
    svgContent: `
      <!-- Background Squircle -->
      <rect width="1024" height="1024" rx="228" fill="#081410"/>
      <rect width="1016" height="1016" x="4" y="4" rx="224" fill="none" stroke="url(#borderGrad)" stroke-width="8"/>
      <rect width="900" height="900" x="62" y="62" rx="190" fill="url(#bgGrad)" opacity="0.15"/>
      
      <!-- Regex Dot-Star (.*) & Slashes -->
      <g filter="url(#dropShadow)">
        <!-- Leading Slash / -->
        <line x1="260" y1="740" x2="380" y2="280" stroke="url(#textGrad)" stroke-width="56" stroke-linecap="round"/>
        <!-- Dot . -->
        <circle cx="470" cy="680" r="48" fill="url(#textGrad)"/>
        <!-- Star * -->
        <g transform="translate(680, 512)">
          <line x1="0" y1="-140" x2="0" y2="140" stroke="url(#textGrad)" stroke-width="52" stroke-linecap="round"/>
          <line x1="-121" y1="-70" x2="121" y2="70" stroke="url(#textGrad)" stroke-width="52" stroke-linecap="round"/>
          <line x1="-121" y1="70" x2="121" y2="-70" stroke="url(#textGrad)" stroke-width="52" stroke-linecap="round"/>
        </g>
      </g>
      
      <defs>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34d399" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#059669" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d1fae5"/>
          <stop offset="30%" stop-color="#34d399"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="36" flood-color="#10b981" flood-opacity="0.6"/>
        </filter>
      </defs>
    `,
  },
  {
    id: 'cipherlab',
    name: 'CipherLab',
    gradientStart: '#ec4899',
    gradientEnd: '#db2777',
    glowColor: '#f472b6',
    svgContent: `
      <!-- Background Squircle -->
      <rect width="1024" height="1024" rx="228" fill="#140810"/>
      <rect width="1016" height="1016" x="4" y="4" rx="224" fill="none" stroke="url(#borderGrad)" stroke-width="8"/>
      <rect width="900" height="900" x="62" y="62" rx="190" fill="url(#bgGrad)" opacity="0.15"/>
      
      <!-- Padlock & Cipher Shackle -->
      <g filter="url(#dropShadow)">
        <!-- Shackle -->
        <path d="M340 480 L340 350 C340 255 417 178 512 178 C607 178 684 255 684 350 L684 480" fill="none" stroke="url(#lockGrad)" stroke-width="68" stroke-linecap="round"/>
        <!-- Body -->
        <rect x="260" y="460" width="504" height="380" rx="80" fill="url(#bodyGrad)"/>
        <rect x="260" y="460" width="504" height="380" rx="80" fill="none" stroke="#fbcfe8" stroke-width="8" opacity="0.3"/>
        <!-- Keyhole -->
        <circle cx="512" cy="610" r="44" fill="#140810"/>
        <path d="M492 630 L480 720 L544 720 L532 630 Z" fill="#140810"/>
      </g>
      
      <defs>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f472b6" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#db2777" stop-opacity="0.3"/>
        </linearGradient>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ec4899"/>
          <stop offset="100%" stop-color="#be185d"/>
        </linearGradient>
        <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fdf2f8"/>
          <stop offset="40%" stop-color="#f472b6"/>
          <stop offset="100%" stop-color="#db2777"/>
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f472b6"/>
          <stop offset="50%" stop-color="#ec4899"/>
          <stop offset="100%" stop-color="#9d174d"/>
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="36" flood-color="#ec4899" flood-opacity="0.6"/>
        </filter>
      </defs>
    `,
  },
];

async function generateAllIcons() {
  const tempDir = path.resolve(rootDir, 'build/icons');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  for (const app of APPS) {
    console.log(`Generating icon for ${app.name} (${app.id})...`);

    const appIconDir = path.resolve(tempDir, app.id);
    if (!fs.existsSync(appIconDir)) {
      fs.mkdirSync(appIconDir, { recursive: true });
    }

    // 1. Write SVG
    const svgPath = path.resolve(appIconDir, 'icon.svg');
    const svgWrapper = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${app.svgContent}</svg>`;
    fs.writeFileSync(svgPath, svgWrapper.trim());

    // 2. Render 1024x1024 PNG using Headless Chrome
    const png1024Path = path.resolve(appIconDir, 'icon_1024.png');
    execSync(
      `"${CHROME_PATH}" --headless --disable-gpu --screenshot="${png1024Path}" --window-size=1024,1024 --default-background-color=00000000 "file://${svgPath}"`
    );

    // 3. Create iconset directory for iconutil
    const iconsetDir = path.resolve(appIconDir, 'icon.iconset');
    if (!fs.existsSync(iconsetDir)) {
      fs.mkdirSync(iconsetDir, { recursive: true });
    }

    const sizes = [
      { name: 'icon_16x16.png', size: 16 },
      { name: 'icon_16x16@2x.png', size: 32 },
      { name: 'icon_32x32.png', size: 32 },
      { name: 'icon_32x32@2x.png', size: 64 },
      { name: 'icon_128x128.png', size: 128 },
      { name: 'icon_128x128@2x.png', size: 256 },
      { name: 'icon_256x256.png', size: 256 },
      { name: 'icon_256x256@2x.png', size: 512 },
      { name: 'icon_512x512.png', size: 512 },
      { name: 'icon_512x512@2x.png', size: 1024 },
    ];

    for (const s of sizes) {
      const outPath = path.resolve(iconsetDir, s.name);
      execSync(`sips -z ${s.size} ${s.size} "${png1024Path}" --out "${outPath}"`);
    }

    // 4. Compile .icns for macOS
    const icnsPath = path.resolve(appIconDir, 'icon.icns');
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`);

    // 5. Create 256x256 icon.png and icon.ico (or Windows icon)
    const iconPngPath = path.resolve(appIconDir, 'icon.png');
    const icon256Path = path.resolve(appIconDir, 'icon_256.png');
    execSync(`sips -z 512 512 "${png1024Path}" --out "${iconPngPath}"`);
    execSync(`sips -z 256 256 "${png1024Path}" --out "${icon256Path}"`);

    // 6. Copy assets into destination package folders
    const targetDirs = [];
    if (app.id === 'endly') {
      targetDirs.push(
        path.resolve(rootDir, 'electron'),
        path.resolve(rootDir, 'public')
      );
    } else {
      const appDir = path.resolve(rootDir, app.id);
      targetDirs.push(
        path.resolve(appDir, 'public'),
        path.resolve(appDir, 'electron')
      );
    }

    for (const targetDir of targetDirs) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(icnsPath, path.resolve(targetDir, 'icon.icns'));
      fs.copyFileSync(iconPngPath, path.resolve(targetDir, 'icon.png'));
      fs.copyFileSync(svgPath, path.resolve(targetDir, 'icon.svg'));
      fs.copyFileSync(icon256Path, path.resolve(targetDir, 'icon.ico'));
    }

    console.log(`✓ Icon generation complete for ${app.name}!`);
  }

  console.log('\nAll 5 desktop app icons generated successfully!');
}

generateAllIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
