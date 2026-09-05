import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PhotoUploader } from './components/PhotoUploader';
import { BiometricCropper } from './components/BiometricCropper';
import { PresetSelector } from './components/PresetSelector';
import { ExportPanel } from './components/ExportPanel';
import { PHOTO_PRESETS } from './data/presets';
import { detectFace, calculateOptimalCrop } from './services/faceDetection';
import { UploadedPhoto, PhotoPreset, CropState, DetectedFace } from './types';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'midnight'>(() => {
    return (localStorage.getItem('passporto_theme') as 'light' | 'dark' | 'midnight') || 'light';
  });

  const [photo, setPhoto] = useState<UploadedPhoto | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PhotoPreset>(PHOTO_PRESETS[0]);
  const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  const [crop, setCrop] = useState<CropState>({
    zoom: 1.0,
    rotation: 0,
    panX: 0,
    panY: 0,
    brightness: 0,
    contrast: 0,
  });

  // Apply theme class to document body
  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-midnight');
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('passporto_theme', theme);
  }, [theme]);

  // Image load & AI Face Detection pipeline
  const handlePhotoSelected = useCallback(async (newPhoto: UploadedPhoto) => {
    setPhoto(newPhoto);
    setIsDetecting(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      setImageElement(img);
      try {
        const face = await detectFace(img);
        setDetectedFace(face);

        if (face) {
          const optimal = calculateOptimalCrop(face, img.naturalWidth, img.naturalHeight, selectedPreset);
          setCrop({
            zoom: optimal.zoom,
            rotation: 0,
            panX: optimal.panX,
            panY: optimal.panY,
            brightness: 0,
            contrast: 0,
          });
        } else {
          setCrop({
            zoom: 1.0,
            rotation: 0,
            panX: 0,
            panY: 0,
            brightness: 0,
            contrast: 0,
          });
        }
      } catch (err) {
        console.warn('Face detection error:', err);
      } finally {
        setIsDetecting(false);
      }
    };
    img.src = newPhoto.dataUrl;
  }, [selectedPreset]);

  // Recalculate auto center when preset changes or when user clicks "Auto Center"
  const handleAutoCenter = useCallback(() => {
    if (!imageElement) return;
    if (detectedFace) {
      const optimal = calculateOptimalCrop(
        detectedFace,
        imageElement.naturalWidth,
        imageElement.naturalHeight,
        selectedPreset
      );
      setCrop((prev) => ({
        ...prev,
        zoom: optimal.zoom,
        panX: optimal.panX,
        panY: optimal.panY,
      }));
    } else {
      setCrop((prev) => ({
        ...prev,
        zoom: 1.0,
        panX: 0,
        panY: 0,
      }));
    }
  }, [detectedFace, imageElement, selectedPreset]);

  // Handle Preset Change
  const handleSelectPreset = (preset: PhotoPreset) => {
    setSelectedPreset(preset);
    if (detectedFace && imageElement) {
      const optimal = calculateOptimalCrop(
        detectedFace,
        imageElement.naturalWidth,
        imageElement.naturalHeight,
        preset
      );
      setCrop((prev) => ({
        ...prev,
        zoom: optimal.zoom,
        panX: optimal.panX,
        panY: optimal.panY,
      }));
    }
  };

  const handleResetPhoto = () => {
    setPhoto(null);
    setImageElement(null);
    setDetectedFace(null);
    setCrop({
      zoom: 1.0,
      rotation: 0,
      panX: 0,
      panY: 0,
      brightness: 0,
      contrast: 0,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-body-bg text-text-primary selection:bg-brand selection:text-white transition-colors duration-200">
      <Navbar theme={theme} onThemeChange={setTheme} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!photo ? (
          /* Step 1: Upload View */
          <div className="space-y-10">
            {/* Hero Title */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                <span>🛡️</span>
                <span>100% Client-Side & Private • Zero Cloud Uploads</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                Instant AI Biometric Passport Photos
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                Automatically detect face coordinates, align eye-line guidelines, and export official 300 DPI passport photos and 4×6" printable sheets in seconds.
              </p>
            </div>

            {/* Photo Uploader */}
            <PhotoUploader onPhotoSelected={handlePhotoSelected} />

            {/* Compliance Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-card-border">
              <div className="bg-card-bg p-5 rounded-2xl border border-card-border shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg">
                  🎯
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  Smart Biometric Centering
                </h3>
                <p className="text-xs text-text-secondary leading-normal">
                  Intelligent in-browser face and eye-line recognition automatically adjusts head coverage to strict 70–80% embassy guidelines.
                </p>
              </div>

              <div className="bg-card-bg p-5 rounded-2xl border border-card-border shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
                  🖨️
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  Printable 4×6" Sheets
                </h3>
                <p className="text-xs text-text-secondary leading-normal">
                  Generate tiled 6 or 8 photo printable templates with high-precision cut marks, ready for CVS, Walgreens, or home printing.
                </p>
              </div>

              <div className="bg-card-bg p-5 rounded-2xl border border-card-border shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-lg">
                  🔒
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  100% Offline & Private
                </h3>
                <p className="text-xs text-text-secondary leading-normal">
                  Your portraits never leave your computer or touch any server. Everything renders instantly in your browser memory.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Biometric Editor Workspace */
          <div className="space-y-6">
            {/* Top Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card-bg p-4 rounded-2xl border border-card-border shadow-sm">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleResetPhoto}
                  className="p-2 rounded-xl bg-body-bg border border-card-border text-text-secondary hover:text-text-primary hover:border-brand transition-all text-xs font-semibold flex items-center space-x-1.5"
                  title="Upload another photo"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>New Photo</span>
                </button>

                <div>
                  <h2 className="text-sm font-bold text-text-primary line-clamp-1">
                    {photo.name}
                  </h2>
                  <p className="text-[11px] text-text-secondary">
                    {photo.naturalWidth} × {photo.naturalHeight} px • {(photo.sizeBytes / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                {isDetecting ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse flex items-center space-x-1.5">
                    <span>⏳</span>
                    <span>Analyzing Face Geometry...</span>
                  </span>
                ) : detectedFace ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center space-x-1.5">
                    <span>✓</span>
                    <span>Biometric Face Aligned</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Manual Alignment Active
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Biometric Cropper (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <BiometricCropper
                  imageSrc={photo.dataUrl}
                  preset={selectedPreset}
                  crop={crop}
                  onCropChange={setCrop}
                  detectedFace={detectedFace}
                  onAutoCenter={handleAutoCenter}
                />

                {/* Passport Compliance Guidelines Check Card */}
                <div className="bg-card-bg rounded-2xl border border-card-border p-4 text-xs space-y-2 shadow-sm">
                  <h4 className="font-bold text-text-primary flex items-center space-x-1.5 text-xs">
                    <span>📋</span>
                    <span>Embassy Checklist for {selectedPreset.name}</span>
                  </h4>
                  <ul className="space-y-1.5 text-text-secondary">
                    <li className="flex items-start space-x-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Eyes centered directly on horizontal guide line</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Full face and head crown visible inside oval frame</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Neutral facial expression with both eyes open</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Even studio lighting with no harsh shadows</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Presets & Export Panel (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <PresetSelector
                  selectedPreset={selectedPreset}
                  onSelectPreset={handleSelectPreset}
                />

                <ExportPanel
                  imageElement={imageElement}
                  crop={crop}
                  preset={selectedPreset}
                  rawFilename={photo.name}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
