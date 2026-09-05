import { CropState, PhotoPreset, ExportSettings } from '../types';

/**
 * Renders a single cropped photo on an offscreen canvas with precision dimensions,
 * transforms (pan, zoom, rotation), brightness/contrast filters, background fill,
 * and optional max file size compression (e.g. <240KB for DS-160 or <100KB for government portals).
 */
export async function renderCroppedPhoto(
  imageElement: HTMLImageElement,
  crop: CropState,
  preset: PhotoPreset,
  settings: ExportSettings
): Promise<{ blob: Blob; dataUrl: string; sizeBytes: number; width: number; height: number }> {
  const canvas = document.createElement('canvas');
  const scale = settings.targetScale || 1;
  const outW = Math.round(preset.widthPx * scale);
  const outH = Math.round(preset.heightPx * scale);
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  // 1. Background Fill (Crisp Solid Background for official digital passport standards)
  if (settings.backgroundColor !== 'original') {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, outW, outH);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
  }

  // 2. Setup Transform Matrix (Pan, Zoom, Rotation)
  ctx.save();
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate((crop.rotation * Math.PI) / 180);

  // Filters (Brightness & Contrast)
  const brightnessFilter = 100 + crop.brightness;
  const contrastFilter = 100 + crop.contrast;
  ctx.filter = `brightness(${brightnessFilter}%) contrast(${contrastFilter}%)`;

  // Scale calculations
  const naturalW = imageElement.naturalWidth;
  const naturalH = imageElement.naturalHeight;

  // Base fit scale
  const scaleFit = Math.max(outW / naturalW, outH / naturalH);
  const totalScale = scaleFit * crop.zoom;

  const drawW = naturalW * totalScale;
  const drawH = naturalH * totalScale;

  const drawX = -drawW / 2 + (crop.panX * (outW / 300));
  const drawY = -drawH / 2 + (crop.panY * (outH / 300));

  ctx.drawImage(imageElement, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 3. Export to Blob with Target File Size Compression
  const mimeType =
    settings.format === 'png'
      ? 'image/png'
      : settings.format === 'webp'
      ? 'image/webp'
      : 'image/jpeg';

  // Determine Max KB constraint
  let maxBytes: number | null = null;
  if (settings.maxSizeLimit === '240kb') maxBytes = 240 * 1024;
  else if (settings.maxSizeLimit === '100kb') maxBytes = 100 * 1024;
  else if (settings.maxSizeLimit === '50kb') maxBytes = 50 * 1024;
  else if (settings.maxSizeLimit === 'custom' && settings.customMaxKb) {
    maxBytes = settings.customMaxKb * 1024;
  }

  // If format is PNG, compression quality is not variable in standard canvas
  if (mimeType === 'image/png' || !maxBytes) {
    const dataUrl = canvas.toDataURL(mimeType, settings.quality);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, settings.quality);
    });
    return { blob, dataUrl, sizeBytes: blob.size, width: outW, height: outH };
  }

  // Binary search quality to satisfy strict max KB limit (e.g. for DS-160 or gov portals)
  let low = 0.3;
  let high = settings.quality || 0.98;
  let bestBlob: Blob | null = null;
  let bestDataUrl = '';

  for (let iter = 0; iter < 6; iter++) {
    const mid = (low + high) / 2;
    const testBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, mid);
    });

    if (testBlob.size <= maxBytes) {
      bestBlob = testBlob;
      bestDataUrl = canvas.toDataURL(mimeType, mid);
      low = mid; // Try for higher quality while staying under limit
    } else {
      high = mid; // Too large, decrease quality
    }
  }

  if (!bestBlob) {
    bestDataUrl = canvas.toDataURL(mimeType, low);
    bestBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, low);
    });
  }

  return {
    blob: bestBlob,
    dataUrl: bestDataUrl,
    sizeBytes: bestBlob.size,
    width: outW,
    height: outH,
  };
}
