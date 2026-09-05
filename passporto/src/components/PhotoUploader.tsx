import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadedPhoto } from '../types';
import { Upload, Image as ImageIcon, Sparkles, Clipboard, CheckCircle2 } from 'lucide-react';

interface PhotoUploaderProps {
  onPhotoSelected?: (photo: UploadedPhoto) => void;
  onPhotoLoaded?: (photo: UploadedPhoto) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotoSelected, onPhotoLoaded }) => {
  const notifyPhotoLoaded = useCallback((photo: UploadedPhoto) => {
    if (onPhotoSelected) onPhotoSelected(photo);
    if (onPhotoLoaded) onPhotoLoaded(photo);
  }, [onPhotoSelected, onPhotoLoaded]);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        notifyPhotoLoaded({
          file,
          dataUrl,
          name: file.name,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          sizeBytes: file.size,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
          processFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Generate a realistic synthetic portrait on canvas for immediate live testing
  const handleLoadSamplePortrait = useCallback((variant: 'man' | 'woman') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d')!;

    // Clean neutral studio background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1500);
    bgGrad.addColorStop(0, '#f1f5f9');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 1500);

    // Torso / Shoulders
    ctx.fillStyle = variant === 'man' ? '#1e293b' : '#334155';
    ctx.beginPath();
    ctx.ellipse(600, 1400, 480, 400, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shirt collar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(520, 1050);
    ctx.lineTo(600, 1200);
    ctx.lineTo(680, 1050);
    ctx.fill();

    // Neck
    ctx.fillStyle = variant === 'man' ? '#fed7aa' : '#fde68a';
    ctx.fillRect(520, 920, 160, 200);

    // Head / Face
    ctx.beginPath();
    ctx.ellipse(600, 680, 240, 320, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = variant === 'man' ? '#0f172a' : '#451a03';
    ctx.beginPath();
    if (variant === 'man') {
      ctx.arc(600, 560, 250, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
    } else {
      ctx.ellipse(600, 580, 270, 340, 0, Math.PI * 0.7, Math.PI * 2.3);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(510, 660, 18, 0, Math.PI * 2);
    ctx.arc(690, 660, 18, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(515, 655, 6, 0, Math.PI * 2);
    ctx.arc(695, 655, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = variant === 'man' ? '#0f172a' : '#451a03';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(460, 610);
    ctx.quadraticCurveTo(510, 595, 560, 615);
    ctx.moveTo(640, 615);
    ctx.quadraticCurveTo(690, 595, 740, 610);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(600, 670);
    ctx.lineTo(590, 750);
    ctx.lineTo(620, 750);
    ctx.stroke();

    // Smile
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(600, 800, 60, 0.2, Math.PI - 0.2);
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const mockFile = new File([new Blob()], `sample_portrait_${variant}.jpg`, {
      type: 'image/jpeg',
    });

    notifyPhotoLoaded({
      file: mockFile,
      dataUrl,
      name: `sample_portrait_${variant}.jpg`,
      naturalWidth: 1200,
      naturalHeight: 1500,
      sizeBytes: 145000,
    });
  }, [notifyPhotoLoaded]);

  return (
    <div className="flex flex-col gap-4">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-border hover:border-blue-500/60 bg-background-secondary hover:bg-background-tertiary/40 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
          <Upload className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <h3 className="text-base sm:text-lg font-bold text-text-primary">
            Drop your portrait photo here, or <span className="text-blue-600 dark:text-blue-400">browse files</span>
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Supports high-res JPG, PNG, WebP, and direct clipboard paste (<kbd className="px-1.5 py-0.5 rounded bg-background-elevated border border-border font-mono text-[10px]">Ctrl+V</kbd>)
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background-elevated border border-border text-[11px] text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Auto Face Centering
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background-elevated border border-border text-[11px] text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Official Biometric 300 DPI
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background-elevated border border-border text-[11px] text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Printable 4×6" Sheets
          </span>
        </div>
      </div>

      {/* Quick Demo Sample Loader */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-background-secondary border border-border">
        <div className="flex items-center gap-2.5 text-xs text-text-secondary">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Don't have a photo handy? Test with sample biometric portraits:</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleLoadSamplePortrait('man')}
            className="px-3 py-1.5 rounded-xl border border-border bg-background-tertiary hover:bg-background-elevated hover:border-blue-500/40 text-xs font-semibold text-text-primary transition-all flex items-center gap-1.5"
          >
            Sample 1 (Headshot A)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSamplePortrait('woman')}
            className="px-3 py-1.5 rounded-xl border border-border bg-background-tertiary hover:bg-background-elevated hover:border-blue-500/40 text-xs font-semibold text-text-primary transition-all flex items-center gap-1.5"
          >
            Sample 2 (Headshot B)
          </button>
        </div>
      </div>
    </div>
  );
};
