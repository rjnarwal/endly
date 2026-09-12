import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const mappings = [
  { src: 'dist', dest: 'api-client' },
  { src: 'tokenlens-dist', dest: 'jwt-decoder' },
  { src: 'jsonlens-dist', dest: 'json-diff' },
  { src: 'regexforge-dist', dest: 'regex-tester' },
  { src: 'cipherlab-dist', dest: 'hash-generator' },
  { src: 'pagely-dist', dest: 'image-to-pdf' },
  { src: 'passporto-dist', dest: 'passport-photo-maker' },
];

const landingDist = path.resolve(rootDir, 'landing-dist');

if (!fs.existsSync(landingDist)) {
  fs.mkdirSync(landingDist, { recursive: true });
}

console.log('Syncing flat search-intent tool directories into landing-dist...');

for (const { src, dest } of mappings) {
  const srcPath = path.resolve(rootDir, src);
  const destPath = path.resolve(landingDist, dest);

  if (fs.existsSync(srcPath)) {
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`✓ Copied ${src} -> landing-dist/${dest}`);
  } else {
    console.warn(`⚠️ Warning: Source ${srcPath} does not exist. Run build first.`);
  }
}

console.log('Flat search-intent slug synchronization complete!');
