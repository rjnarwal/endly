import { CropState, PhotoPreset, ExportSettings } from '../types';
import { jsPDF } from 'jspdf';

/**
 * Renders a single cropped photo on an offscreen canvas according to preset specifications.
 */
export async function renderCroppedPhoto(
  imageElement: HTMLImageElement,
  crop: CropState,
  preset: PhotoPreset,
  settings: ExportSettings
): Promise<{ blob: Blob; dataUrl: string }> {
  const canvas = document.createElement('canvas');
  const outW = preset.widthPx;
  const outH = preset.heightPx;
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  // 1. Background Fill
  if (settings.backgroundColor !== 'original') {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, outW, outH);
  } else {
    // Default crisp white for official passport presets if transparent
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

  const drawX = -drawW / 2 + crop.panX * (outW / 300);
  const drawY = -drawH / 2 + crop.panY * (outH / 300);

  ctx.drawImage(imageElement, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 3. Export to Blob
  const mimeType =
    settings.format === 'png'
      ? 'image/png'
      : settings.format === 'webp'
      ? 'image/webp'
      : 'image/jpeg';

  const dataUrl = canvas.toDataURL(mimeType, settings.quality);
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b || new Blob()),
      mimeType,
      settings.quality
    );
  });

  return { blob, dataUrl };
}

/**
 * Creates a standard 4 × 6 inch (1200 × 1800 px @ 300 DPI) printable photo sheet
 * tiling 6 or 8 passport photos with thin dashed cutting guidelines.
 */
export async function renderPrintableSheet(
  photoDataUrl: string,
  preset: PhotoPreset,
  count: 6 | 8 = 6
): Promise<{ blob: Blob; dataUrl: string; pdfBlob: Blob }> {
  return new Promise((resolve, reject) => {
    const photoImg = new Image();
    photoImg.onload = () => {
      const sheetCanvas = document.createElement('canvas');
      // 4 x 6 inch in landscape = 1800 x 1200 px at 300 DPI
      const sheetW = 1800;
      const sheetH = 1200;
      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;

      const ctx = sheetCanvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context error'));

      // Sheet Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetW, sheetH);

      // Border & Guidelines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, sheetW - 40, sheetH - 40);

      // Header Tag
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(
        `PassPorto • Official 4×6" Printable Sheet (${preset.name} - 300 DPI)`,
        40,
        55
      );
      ctx.font = '18px Inter, sans-serif';
      ctx.fillText('Ready for home printing, CVS, Walgreens, Walmart or instant photo kiosk', 40, 85);

      // Layout Grid (2 rows x 3 cols or 2 rows x 4 cols)
      const cols = count === 8 ? 4 : 3;
      const rows = 2;

      // Card dimensions on sheet
      const cardMaxW = count === 8 ? 380 : 500;
      const cardMaxH = 480;

      let cardW = cardMaxW;
      let cardH = cardW / preset.aspectRatio;

      if (cardH > cardMaxH) {
        cardH = cardMaxH;
        cardW = cardH * preset.aspectRatio;
      }

      const availableAreaW = sheetW - 80;
      const availableAreaH = sheetH - 140;

      const gapX = (availableAreaW - cardW * cols) / (cols + 1);
      const gapY = (availableAreaH - cardH * rows) / (rows + 1);

      const startY = 120;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const posX = 40 + gapX + c * (cardW + gapX);
          const posY = startY + gapY + r * (cardH + gapY);

          // Draw Photo
          ctx.drawImage(photoImg, posX, posY, cardW, cardH);

          // Draw Cutting Frame (Subtle dashed line)
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(posX, posY, cardW, cardH);
          ctx.setLineDash([]); // Reset dash

          // Corner Cut Marks
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          const markLen = 12;

          // Top-Left corner mark
          ctx.beginPath();
          ctx.moveTo(posX - markLen, posY);
          ctx.lineTo(posX + markLen, posY);
          ctx.moveTo(posX, posY - markLen);
          ctx.lineTo(posX, posY + markLen);
          ctx.stroke();

          // Bottom-Right corner mark
          ctx.beginPath();
          ctx.moveTo(posX + cardW - markLen, posY + cardH);
          ctx.lineTo(posX + cardW + markLen, posY + cardH);
          ctx.moveTo(posX + cardW, posY + cardH - markLen);
          ctx.lineTo(posX + cardW, posY + cardH + markLen);
          ctx.stroke();
        }
      }

      const sheetDataUrl = sheetCanvas.toDataURL('image/jpeg', 0.98);

      // Generate 4x6" PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [4, 6],
      });
      pdf.addImage(sheetDataUrl, 'JPEG', 0, 0, 6, 4);
      const pdfBlob = pdf.output('blob');

      sheetCanvas.toBlob(
        (blob) => {
          resolve({
            blob: blob || new Blob(),
            dataUrl: sheetDataUrl,
            pdfBlob,
          });
        },
        'image/jpeg',
        0.98
      );
    };
    photoImg.onerror = () => reject(new Error('Failed to load image for print sheet'));
    photoImg.src = photoDataUrl;
  });
}
