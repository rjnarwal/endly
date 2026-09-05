export type PresetCategory = 'passport' | 'social' | 'print';

export interface PhotoPreset {
  id: string;
  name: string;
  category: PresetCategory;
  widthMm?: number;
  heightMm?: number;
  widthPx: number;
  heightPx: number;
  aspectRatio: number;
  dpi: number;
  flag?: string;
  description: string;
  headCoverageMin?: number; // % of frame e.g. 70
  headCoverageMax?: number; // % of frame e.g. 80
  bgRequirement?: string;
}

export interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
}

export interface CropState {
  zoom: number; // 0.5 to 3.0
  rotation: number; // -45 to 45 deg
  panX: number; // in pixel offset
  panY: number; // in pixel offset
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
}

export interface ExportSettings {
  format: 'jpeg' | 'png' | 'webp';
  quality: number; // 0.7 to 1.0
  targetDpi: 300 | 600;
  backgroundColor: 'original' | '#ffffff' | '#f8fafc' | '#e2e8f0' | '#e0f2fe';
  filename: string;
  generateSheet: boolean;
  sheetSize: '4x6';
  sheetPhotosCount: 6 | 8;
}

export interface UploadedPhoto {
  file: File;
  dataUrl: string;
  name: string;
  naturalWidth: number;
  naturalHeight: number;
  sizeBytes: number;
}
