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
    <div className="flex flex-col items-center bg-card-bg rounded-2xl border border-card-border p-5 shadow-sm">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-card-border">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{preset.flag || '📷'}</span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary leading-tight">
              {preset.name}
            </h3>
            <p className="text-xs text-text-secondary">
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
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center space-x-1 ${
                showGuides
                  ? 'bg-brand/10 border-brand/30 text-brand font-semibold'
                  : 'bg-body-bg border-card-border text-text-secondary hover:text-text-primary'
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
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center space-x-1 ${
              showGrid
                ? 'bg-brand/10 border-brand/30 text-brand font-semibold'
                : 'bg-body-bg border-card-border text-text-secondary hover:text-text-primary'
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
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand/10 text-brand border border-brand/30 hover:bg-brand hover:text-white transition-all flex items-center space-x-1"
            title="Auto Center Face using AI Detection"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
        className="relative overflow-hidden rounded-xl border-2 border-brand/50 shadow-md bg-slate-900 cursor-grab active:cursor-grabbing select-none"
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
            {/* Top Crown Line (Crown of head should touch this region) */}
            <div className="absolute left-0 right-0 top-[10%] border-t-2 border-dashed border-amber-400 opacity-80 flex items-center justify-between px-2">
              <span className="text-[9px] font-bold tracking-wider text-amber-400 bg-black/60 px-1 rounded">
                TOP OF HEAD
              </span>
              <span className="text-[9px] text-amber-300 bg-black/60 px-1 rounded">
                ~10% margin
              </span>
            </div>

            {/* Eye Guideline (Eyes must sit horizontally on this line) */}
            <div className="absolute left-0 right-0 top-[40%] border-t-2 border-dashed border-emerald-400 opacity-90 flex items-center justify-between px-2">
              <span className="text-[9px] font-bold tracking-wider text-emerald-400 bg-black/60 px-1 rounded">
                EYE LEVEL
              </span>
              <span className="text-[9px] text-emerald-300 bg-black/60 px-1 rounded">
                38 - 42%
              </span>
            </div>

            {/* Bottom Chin Line */}
            <div className="absolute left-0 right-0 top-[76%] border-t-2 border-dashed border-amber-400 opacity-80 flex items-center justify-between px-2">
              <span className="text-[9px] font-bold tracking-wider text-amber-400 bg-black/60 px-1 rounded">
                CHIN BASE
              </span>
              <span className="text-[9px] text-amber-300 bg-black/60 px-1 rounded">
                70-80% face
              </span>
            </div>

            {/* Vertical Center Axis */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-sky-400/50"></div>

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
          <span className="text-[10px] text-white/80 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md font-medium">
            Drag photo to reposition • Scroll to zoom
          </span>
          {detectedFace && (
            <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded-md font-medium flex items-center space-x-1">
              <span>●</span>
              <span>Face Aligned</span>
            </span>
          )}
        </div>
      </div>

      {/* Adjustments & Fine Tuning Toolbar */}
      <div className="w-full mt-5 space-y-3.5 bg-body-bg p-4 rounded-xl border border-card-border">
        {/* Zoom Slider */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-text-secondary flex items-center space-x-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              <span>Zoom</span>
            </span>
            <span className="font-mono text-text-primary text-[11px] font-semibold">
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
            className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-brand"
          />
        </div>

        {/* Rotation Slider & 90-degree buttons */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-text-secondary flex items-center space-x-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Straighten / Rotate</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-text-primary text-[11px] font-semibold">
                {crop.rotation}°
              </span>
              <button
                onClick={() => onCropChange({ ...crop, rotation: 0 })}
                className="text-[10px] text-brand hover:underline font-medium"
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
              className="p-1 rounded bg-card-bg border border-card-border text-text-secondary hover:text-text-primary hover:border-brand/40 text-xs"
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
              className="flex-1 h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-brand"
            />
            <button
              onClick={() =>
                onCropChange({
                  ...crop,
                  rotation: (crop.rotation + 90) % 360 > 180 ? ((crop.rotation + 90) % 360) - 360 : (crop.rotation + 90) % 360,
                })
              }
              className="p-1 rounded bg-card-bg border border-card-border text-text-secondary hover:text-text-primary hover:border-brand/40 text-xs"
              title="Rotate Right 90°"
            >
              ⤻ 90°
            </button>
          </div>
        </div>

        {/* Fine Lighting (Brightness & Contrast) */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-card-border/60">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-text-secondary">Brightness</span>
              <span className="font-mono text-text-primary">{crop.brightness > 0 ? `+${crop.brightness}` : crop.brightness}</span>
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
              className="w-full h-1 bg-card-border rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-text-secondary">Contrast</span>
              <span className="font-mono text-text-primary">{crop.contrast > 0 ? `+${crop.contrast}` : crop.contrast}</span>
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
              className="w-full h-1 bg-card-border rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
