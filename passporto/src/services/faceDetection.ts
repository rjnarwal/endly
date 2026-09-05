import { DetectedFace, PhotoPreset } from '../types';

/**
 * Detects faces using either the browser's native Shape Detection FaceDetector API
 * or a smart heuristic centroid analysis algorithm in pure HTML5 Canvas.
 */
export async function detectFace(
  imageElement: HTMLImageElement
): Promise<DetectedFace | null> {
  // 1. Try Native Browser FaceDetector API (Supported in Chrome/Edge/Opera/Chromium)
  if ('FaceDetector' in window) {
    try {
      const faceDetector = new (window as any).FaceDetector({
        maxDetectedFaces: 1,
        fastMode: false,
      });
      const faces = await faceDetector.detect(imageElement);
      if (faces && faces.length > 0) {
        const box = faces[0].boundingBox;
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          confidence: 0.95,
        };
      }
    } catch (err) {
      console.warn('Native FaceDetector API error, falling back to heuristic:', err);
    }
  }

  // 2. Client-Side Heuristic Face / Centroid Analyzer
  return detectFaceHeuristic(imageElement);
}

export const detectFaceInImage = detectFace;

/**
 * Analyzes color, skin tone clusters, and edge gradients to approximate face center and bounds.
 */
function detectFaceHeuristic(imageElement: HTMLImageElement): DetectedFace | null {
  try {
    const canvas = document.createElement('canvas');
    const maxSampleDim = 400;
    const scale = Math.min(1, maxSampleDim / Math.max(imageElement.naturalWidth, imageElement.naturalHeight));
    
    const sampleW = Math.round(imageElement.naturalWidth * scale);
    const sampleH = Math.round(imageElement.naturalHeight * scale);
    
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(imageElement, 0, 0, sampleW, sampleH);
    const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imageData.data;

    let skinPixelSumX = 0;
    let skinPixelSumY = 0;
    let skinPixelCount = 0;

    let minX = sampleW;
    let maxX = 0;
    let minY = sampleH;
    let maxY = 0;

    // Scan the upper 80% of the image for portrait headshot region
    for (let y = 0; y < sampleH * 0.8; y++) {
      for (let x = 0; x < sampleW; x++) {
        const i = (y * sampleW + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skin tone heuristic check in RGB space
        const isSkin =
          r > 60 &&
          g > 40 &&
          b > 20 &&
          r > g &&
          r > b &&
          r - g > 10 &&
          Math.abs(r - g) > 10 &&
          r - b > 15;

        if (isSkin) {
          skinPixelSumX += x;
          skinPixelSumY += y;
          skinPixelCount++;

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (skinPixelCount > 100) {
      const avgX = skinPixelSumX / skinPixelCount;
      const avgY = skinPixelSumY / skinPixelCount;
      
      const width = Math.max(sampleW * 0.35, (maxX - minX) * 0.8) / scale;
      const height = Math.max(sampleH * 0.45, (maxY - minY) * 0.8) / scale;

      return {
        x: avgX / scale - width / 2,
        y: avgY / scale - height / 2,
        width,
        height,
        confidence: 0.75,
      };
    }

    // Default center headshot crop if no distinct skin cluster found
    const defaultW = imageElement.naturalWidth * 0.45;
    const defaultH = defaultW * 1.3;
    return {
      x: (imageElement.naturalWidth - defaultW) / 2,
      y: imageElement.naturalHeight * 0.15,
      width: defaultW,
      height: defaultH,
      confidence: 0.5,
    };
  } catch (err) {
    console.error('Error during heuristic face detection:', err);
    return null;
  }
}

/**
 * Calculates optimal default zoom, panX, and panY to center the face
 * and fit official biometric standards for the chosen preset.
 */
export function calculateOptimalCrop(
  faceOrWidth: DetectedFace | null | number,
  widthOrHeight: number,
  heightOrFace: number | (DetectedFace | null),
  preset: PhotoPreset
): { zoom: number; panX: number; panY: number } {
  let face: DetectedFace | null = null;
  let imageWidth: number = 600;
  let imageHeight: number = 800;

  if (typeof faceOrWidth === 'object') {
    face = faceOrWidth;
    imageWidth = widthOrHeight;
    imageHeight = typeof heightOrFace === 'number' ? heightOrFace : 800;
  } else {
    imageWidth = faceOrWidth;
    imageHeight = widthOrHeight;
    face = typeof heightOrFace === 'object' ? heightOrFace : null;
  }

  const targetAspect = preset.aspectRatio;

  // Base bounding box
  let faceCenterX = imageWidth / 2;
  let faceCenterY = imageHeight * 0.4;
  let faceHeight = imageHeight * 0.45;

  if (face) {
    faceCenterX = face.x + face.width / 2;
    faceCenterY = face.y + face.height / 2;
    faceHeight = face.height;
  }

  // Official passport standards require head to take ~70-75% of vertical frame
  const targetCoverage = preset.category === 'passport' ? 0.72 : 0.65;
  const desiredCropHeight = faceHeight / targetCoverage;
  const desiredCropWidth = desiredCropHeight * targetAspect;

  // Compute zoom required relative to full image fit
  const scaleX = imageWidth / desiredCropWidth;
  const scaleY = imageHeight / desiredCropHeight;
  const zoom = Number(Math.max(1.0, Math.min(2.5, Math.min(scaleX, scaleY))).toFixed(2));

  // Normalized Pan offsets
  const panX = Math.round(imageWidth / 2 - faceCenterX);
  const panY = Math.round(imageHeight * 0.42 - faceCenterY);

  return { zoom, panX, panY };
}
