import React, { useState, useEffect } from 'react';
import { PhotoPreset, CropState, ExportSettings, FileSizeLimitPreset } from '../types';
import { renderCroppedPhoto } from '../services/imageProcessor';
import { Download, Copy, Check, ShieldCheck, FileCheck } from 'lucide-react';

interface ExportPanelProps {
  imageElement: HTMLImageElement | null;
  crop: CropState;
  preset: PhotoPreset;
  rawFilename: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  imageElement,
  crop,
  preset,
  rawFilename,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'jpeg',
    quality: 0.98,
    targetScale: 1,
    maxSizeLimit: 'max',
    backgroundColor: '#ffffff',
    filename: (rawFilename.replace(/\.[^/.]+$/, '') || 'photo') + '-passport',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [estimatedKb, setEstimatedKb] = useState<number | null>(null);

  // Compute live estimated file size when settings or crop change
  useEffect(() => {
    let active = true;
    if (!imageElement) return;

    const computeEstimate = async () => {
      try {
        const { sizeBytes } = await renderCroppedPhoto(imageElement, crop, preset, settings);
        if (active) {
          setEstimatedKb(Math.round(sizeBytes / 1024));
        }
      } catch (e) {
        // silent
      }
    };

    const timer = setTimeout(computeEstimate, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [imageElement, crop, preset, settings]);

  // Background Options with distinct borders and previews
  const bgOptions = [
    { label: 'Crisp White', value: '#ffffff', color: '#ffffff', border: '#cbd5e1' },
    { label: 'Off-White', value: '#f8fafc', color: '#f8fafc', border: '#cbd5e1' },
    { label: 'Studio Gray', value: '#e2e8f0', color: '#e2e8f0', border: '#94a3b8' },
    { label: 'Studio Blue', value: '#e0f2fe', color: '#e0f2fe', border: '#38bdf8' },
  ];

  // File size limit presets
  const sizePresets: { id: FileSizeLimitPreset; label: string; desc: string }[] = [
    { id: 'max', label: 'Ultra Quality', desc: 'Full 300 DPI clarity' },
    { id: '240kb', label: '< 240 KB', desc: 'US DS-160 / Visa' },
    { id: '100kb', label: '< 100 KB', desc: 'Strict Gov Portals' },
    { id: '50kb', label: '< 50 KB', desc: 'Web / Resume' },
  ];

  // Download Single Photo
  const handleDownload = async () => {
    if (!imageElement) return;
    try {
      setIsExporting(true);
      const { dataUrl } = await renderCroppedPhoto(imageElement, crop, preset, settings);

      const link = document.createElement('a');
      link.href = dataUrl;
      const ext = settings.format === 'jpeg' ? 'jpg' : settings.format;
      link.download = `${settings.filename.trim() || 'passport-photo'}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download single photo failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async () => {
    if (!imageElement) return;
    try {
      setIsExporting(true);
      const pngSettings: ExportSettings = { ...settings, format: 'png' };
      const { blob } = await renderCroppedPhoto(imageElement, crop, preset, pngSettings);

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const outputWidth = Math.round(preset.widthPx * settings.targetScale);
  const outputHeight = Math.round(preset.heightPx * settings.targetScale);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
      {/* Header with Digital Specs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Digital Upload & Download</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Optimized for online visa portals, government forms, resumes & ID systems
          </p>
        </div>

        {/* Live File Specs Badge */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {outputWidth} × {outputHeight} px
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400">
            {estimatedKb !== null ? `~${estimatedKb} KB` : '...'}
          </span>
        </div>
      </div>

      {/* Target File Size Optimization */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Portal File Size Limit</span>
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            Auto-compresses to satisfy portal rules
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sizePresets.map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => setSettings({ ...settings, maxSizeLimit: sp.id })}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                settings.maxSizeLimit === sp.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-400'
              }`}
            >
              <div
                className={`text-xs font-bold ${
                  settings.maxSizeLimit === sp.id
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {sp.label}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                {sp.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Format & Resolution Scale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Format Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Image Format</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSettings({ ...settings, format: fmt })}
                className={`py-1.5 text-xs font-bold rounded-lg uppercase transition-all cursor-pointer ${
                  settings.format === fmt
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {fmt === 'jpeg' ? 'JPG (Gov)' : fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Scale */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Resolution Scaling</label>
          <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, targetScale: 1 })}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                settings.targetScale === 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              1× Standard ({preset.dpi} DPI)
            </button>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, targetScale: 2 })}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                settings.targetScale === 2
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              2× Ultra HD (600 DPI)
            </button>
          </div>
        </div>
      </div>

      {/* Background Color Picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span>Background Color Preset</span>
          {preset.bgRequirement && (
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              Req: {preset.bgRequirement}
            </span>
          )}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {bgOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  backgroundColor: opt.value as ExportSettings['backgroundColor'],
                })
              }
              className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                settings.backgroundColor === opt.value
                  ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <span
                className="w-5 h-5 rounded-full border shadow-inner"
                style={{ backgroundColor: opt.color, borderColor: opt.border }}
              />
              <span className="text-[11px] font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Output Filename */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">File Name</label>
        <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 overflow-hidden">
          <input
            type="text"
            value={settings.filename}
            onChange={(e) => setSettings({ ...settings, filename: e.target.value })}
            placeholder="passport-photo"
            className="flex-1 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white bg-transparent focus:outline-none"
          />
          <span className="px-3 py-2.5 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-900/60 border-l border-slate-300 dark:border-slate-700">
            .{settings.format === 'jpeg' ? 'jpg' : settings.format}
          </span>
        </div>
      </div>

      {/* Primary Actions: Vibrant Blue Download Single Photo & Solid Copy to Clipboard */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {/* Solid Vibrant Blue Button with Crisp White Text and Icon */}
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>
            {isExporting
              ? 'Rendering Photo...'
              : `Download Photo (${outputWidth}×${outputHeight} px)`}
          </span>
        </button>

        {/* Crisp Bordered Copy Button with Solid High-Contrast Dark Text in Light Mode */}
        <button
          onClick={handleCopyToClipboard}
          disabled={isExporting}
          className={`w-full sm:w-auto py-3.5 px-4 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm ${
            copied
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-500'
          }`}
          title="Copy photo directly to clipboard to paste into web applications or forms"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          ) : (
            <Copy className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
          )}
          <span>{copied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
        </button>
      </div>

      {/* Digital Upload Portal Tip */}
      <div className="bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>💡</span>
          <span>Online Portal Upload Tip</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
          Most online visa portals (like US DS-160, Schengen, or Singapore ICA) require a square JPEG under 240 KB with equal width and height. Simply click <strong className="text-slate-900 dark:text-white">"Download Photo"</strong> to save a compliant file ready for instant upload.
        </p>
      </div>
    </div>
  );
};
