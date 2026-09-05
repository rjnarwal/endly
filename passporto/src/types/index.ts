export type PresetCategory = 'passport' | 'social';

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
  portalNotes?: string;
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

export type FileSizeLimitPreset = 'max' | '240kb' | '100kb' | '50kb' | 'custom';

export interface ExportSettings {
  format: 'jpeg' | 'png' | 'webp';
  quality: number; // 0.6 to 1.0
  targetScale: 1 | 2; // 1x standard (e.g. 600x600) or 2x Ultra HD (1200x1200)
  maxSizeLimit: FileSizeLimitPreset;
  customMaxKb?: number;
  backgroundColor: '#ffffff' | '#f8fafc' | '#e2e8f0' | '#e0f2fe' | 'original';
  filename: string;
}

export interface UploadedPhoto {
  file: File;
  dataUrl: string;
  name: string;
  naturalWidth: number;
  naturalHeight: number;
  sizeBytes: number;
}
