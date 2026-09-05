import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PhotoPreset, CropState, DetectedFace } from '../types';

interface BiometricCropperProps {
  imageSrc: string;
  preset: PhotoPreset;
  crop: CropState;
  onCropChange: (crop: CropState) => void;
  detectedFace: DetectedFace | null;
  onAutoCenter: () => void;
}

export const BiometricCropper: React.FC<BiometricCropperProps> = ({
  imageSrc,
  preset,
  crop,
  onCropChange,
  detectedFace,
  onAutoCenter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPan, setInitialPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGuides, setShowGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPan({ x: crop.panX, y: crop.panY });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      onCropChange({
        ...crop,
        panX: initialPan.x + dx,
        panY: initialPan.y + dy,
      });
    },
    [isDragging, dragStart, initialPan, crop, onCropChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch Support for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialPan({ x: crop.panX, y: crop.panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    onCropChange({
      ...crop,
      panX: initialPan.x + dx,
      panY: initialPan.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0015;
    const newZoom = Math.min(Math.max(crop.zoom + zoomDelta, 0.5), 3.0);
    onCropChange({ ...crop, zoom: Number(newZoom.toFixed(2)) });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Adjust preview aspect ratio box size
  const maxPreviewWidth = 380;
  const maxPreviewHeight = 440;
  let previewWidth = maxPreviewWidth;
  let previewHeight = previewWidth / preset.aspectRatio;

  if (previewHeight > maxPreviewHeight) {
    previewHeight = maxPreviewHeight;
    previewWidth = previewHeight * preset.aspectRatio;
  }

  const isPassportType = preset.category === 'passport';

  return (
    <div className="flex flex-col items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{preset.flag || '📷'}</span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {preset.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {preset.widthMm && preset.heightMm
                ? `${preset.widthMm} × ${preset.heightMm} mm`
                : `${preset.widthPx} × ${preset.heightPx} px`}{' '}
              • {preset.dpi} DPI
            </p>
          </div>
        </div>

        {/* Biometric Guide Toggles */}
        <div className="flex items-center space-x-2">
          {isPassportType && (
            <button
              onClick={() => setShowGuides(!showGuides)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
                showGuides
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
              title="Toggle Biometric Eye & Crown Guides"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Guides</span>
            </button>
          )}

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
              showGrid
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900'
            }`}
            title="Toggle Rule-of-Thirds Grid"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M6 4v16M12 4v16M18 4v16" />
            </svg>
            <span>Grid</span>
          </button>

          <button
            onClick={onAutoCenter}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
            title="Auto Center Face using AI Detection"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Auto Center</span>
          </button>
        </div>
      </div>

      {/* Interactive Crop Frame */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="relative overflow-hidden rounded-xl border-2 border-blue-500 shadow-md bg-slate-900 cursor-grab active:cursor-grabbing select-none"
        style={{
          width: `${previewWidth}px`,
          height: `${previewHeight}px`,
        }}
      >
        {/* The Image under transform */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none origin-center"
          style={{
            transform: `translate(${crop.panX}px, ${crop.panY}px) scale(${crop.zoom}) rotate(${crop.rotation}deg)`,
            filter: `brightness(${100 + crop.brightness}%) contrast(${100 + crop.contrast}%)`,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out',
          }}
        >
          <img
            src={imageSrc}
            alt="Source Portrait"
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Rule of Thirds Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
            <div className="border-r border-b border-white/60"></div>
            <div className="border-r border-b border-white/60"></div>
            <div className="border-b border-white/60"></div>
            <div className="border-r border-b border-white/60"></div>
            <div className="border-r border-b border-white/60"></div>
            <div className="border-b border-white/60"></div>
            <div className="border-r border-white/60"></div>
            <div className="border-r border-white/60"></div>
            <div></div>
          </div>
        )}

        {/* Biometric Passport Guidelines Overlay */}
        {isPassportType && showGuides && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Crown Line */}
            <div className="absolute left-0 right-0 top-[10%] border-t-2 border-dashed border-amber-400 opacity-90 flex items-center justify-between px-2">
              <span className="text-[9px] font-bold tracking-wider text-amber-300 bg-black/75 px-1 rounded">
                TOP OF HEAD
              </span>
              <span className="text-[9px] text-amber-200 bg-black/75 px-1 rounded font-mono">
                ~10% margin
              </span>
            </div>

            {/* Eye Guideline */}
            <div className="absolute left-0 right-0 top-[40%] border-t-2 border-dashed border-emerald-400 opacity-95 flex items-center justify-between px-2">
              <span className="text-[9px] font-bold tracking-wider text-emerald-300 bg-black/75 px-1 rounded">
                EYE LEVEL
              </span>
              <span className="text-[9px] text-emerald-200 bg-black/75 px-1 rounded font-mono">
                38 - 42%
              </span>
            </div>

            {/* Bottom Chin Line */}
            <div className="absolute left-0 right-0 top-[76%] border-t-2 border-dashed border-amber-400 opacity-90 flex items-center justify-between px-2">
              <span className="text-[9px] font-bold tracking-wider text-amber-300 bg-black/75 px-1 rounded">
                CHIN BASE
              </span>
              <span className="text-[9px] text-amber-200 bg-black/75 px-1 rounded font-mono">
                70-80% face
              </span>
            </div>

            {/* Vertical Center Axis */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-sky-400/60"></div>

            {/* Biometric Head Oval Silhouette Guide */}
            <svg
              className="absolute inset-0 w-full h-full opacity-40"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <ellipse
                cx="50"
                cy="44"
                rx="28"
                ry="34"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
        )}

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] text-white bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-md font-medium">
            Drag photo to reposition • Scroll to zoom
          </span>
          {detectedFace && (
            <span className="text-[10px] text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 rounded-md font-bold flex items-center space-x-1">
              <span>●</span>
              <span>Face Aligned</span>
            </span>
          )}
        </div>
      </div>

      {/* Adjustments & Fine Tuning Toolbar */}
      <div className="w-full mt-5 space-y-3.5 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        {/* Zoom Slider */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              <span>Zoom</span>
            </span>
            <span className="font-mono text-slate-900 dark:text-white text-xs font-bold">
              {crop.zoom.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.05"
            value={crop.zoom}
            onChange={(e) =>
              onCropChange({ ...crop, zoom: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Rotation Slider & 90-degree buttons */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Straighten / Rotate</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-slate-900 dark:text-white text-xs font-bold">
                {crop.rotation}°
              </span>
              <button
                onClick={() => onCropChange({ ...crop, rotation: 0 })}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                onCropChange({
                  ...crop,
                  rotation: (crop.rotation - 90 + 360) % 360 > 180 ? ((crop.rotation - 90 + 360) % 360) - 360 : (crop.rotation - 90 + 360) % 360,
                })
              }
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-blue-500 text-xs font-bold cursor-pointer"
              title="Rotate Left 90°"
            >
              ⤺ 90°
            </button>
            <input
              type="range"
              min="-45"
              max="45"
              step="1"
              value={crop.rotation}
              onChange={(e) =>
                onCropChange({ ...crop, rotation: parseInt(e.target.value, 10) })
              }
              className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <button
              onClick={() =>
                onCropChange({
                  ...crop,
                  rotation: (crop.rotation + 90) % 360 > 180 ? ((crop.rotation + 90) % 360) - 360 : (crop.rotation + 90) % 360,
                })
              }
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-blue-500 text-xs font-bold cursor-pointer"
              title="Rotate Right 90°"
            >
              ⤻ 90°
            </button>
          </div>
        </div>

        {/* Fine Lighting (Brightness & Contrast) */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-700">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Brightness</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{crop.brightness > 0 ? `+${crop.brightness}` : crop.brightness}</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={crop.brightness}
              onChange={(e) =>
                onCropChange({ ...crop, brightness: parseInt(e.target.value, 10) })
              }
              className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Contrast</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{crop.contrast > 0 ? `+${crop.contrast}` : crop.contrast}</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={crop.contrast}
              onChange={(e) =>
                onCropChange({ ...crop, contrast: parseInt(e.target.value, 10) })
              }
              className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
