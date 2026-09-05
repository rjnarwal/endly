import React, { useState } from 'react';
import { PhotoPreset, CropState, ExportSettings } from '../types';
import { renderCroppedPhoto, renderPrintableSheet } from '../services/imageProcessor';

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
    targetDpi: 300,
    backgroundColor: '#ffffff',
    filename: rawFilename.replace(/\.[^/.]+$/, '') + '-passport',
    generateSheet: false,
    sheetSize: '4x6',
    sheetPhotosCount: 6,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState<string | null>(null);
  const [sheetPdfBlob, setSheetPdfBlob] = useState<Blob | null>(null);
  const [showSheetModal, setShowSheetModal] = useState(false);

  // Background Options
  const bgOptions = [
    { label: 'Crisp White', value: '#ffffff', color: '#ffffff', border: '#cbd5e1' },
    { label: 'Off-White', value: '#f8fafc', color: '#f8fafc', border: '#cbd5e1' },
    { label: 'Studio Gray', value: '#e2e8f0', color: '#e2e8f0', border: '#cbd5e1' },
    { label: 'Studio Blue', value: '#e0f2fe', color: '#e0f2fe', border: '#7dd3fc' },
  ];

  // Single Photo Export
  const handleExportSingle = async () => {
    if (!imageElement) return;
    try {
      setIsExporting(true);
      const { dataUrl } = await renderCroppedPhoto(imageElement, crop, preset, settings);

      const link = document.createElement('a');
      link.href = dataUrl;
      const ext = settings.format === 'jpeg' ? 'jpg' : settings.format;
      link.download = `${settings.filename || 'passport'}-${preset.id}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export single failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate 4x6" Sheet
  const handleGenerateSheet = async () => {
    if (!imageElement) return;
    try {
      setIsExporting(true);
      const { dataUrl } = await renderCroppedPhoto(imageElement, crop, preset, settings);
      const { dataUrl: sheetUrl, pdfBlob } = await renderPrintableSheet(
        dataUrl,
        preset,
        settings.sheetPhotosCount
      );
      setSheetPreviewUrl(sheetUrl);
      setSheetPdfBlob(pdfBlob);
      setShowSheetModal(true);
    } catch (err) {
      console.error('Generate sheet failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Download Sheet JPG
  const handleDownloadSheetJpg = () => {
    if (!sheetPreviewUrl) return;
    const link = document.createElement('a');
    link.href = sheetPreviewUrl;
    link.download = `${settings.filename || 'passport'}-4x6-sheet.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sheet PDF
  const handleDownloadSheetPdf = () => {
    if (!sheetPdfBlob) return;
    const url = URL.createObjectURL(sheetPdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.filename || 'passport'}-4x6-sheet.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card-bg rounded-2xl border border-card-border p-5 shadow-sm space-y-4">
      <div className="pb-3 border-b border-card-border">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Export & Download Options
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          High-resolution 300 DPI output matching embassy guidelines
        </p>
      </div>

      {/* Background Color Picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
          <span>Background Preset</span>
          {preset.bgRequirement && (
            <span className="text-[10px] text-amber-500 font-normal">
              {preset.bgRequirement}
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
              className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                settings.backgroundColor === opt.value
                  ? 'border-brand ring-2 ring-brand/20 bg-brand/5 font-semibold text-brand'
                  : 'border-card-border bg-body-bg text-text-secondary hover:text-text-primary'
              }`}
            >
              <span
                className="w-5 h-5 rounded-full border shadow-inner"
                style={{ backgroundColor: opt.color, borderColor: opt.border }}
              />
              <span className="text-[10px]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Format & Quality */}
      <div className="grid grid-cols-2 gap-3">
        {/* Format Selector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Image Format</label>
          <div className="grid grid-cols-3 gap-1 bg-body-bg p-1 rounded-xl border border-card-border">
            {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSettings({ ...settings, format: fmt })}
                className={`py-1 text-xs font-semibold rounded-lg uppercase transition-all ${
                  settings.format === fmt
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {fmt === 'jpeg' ? 'JPG' : fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Quality / DPI */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Print Quality</label>
          <div className="grid grid-cols-2 gap-1 bg-body-bg p-1 rounded-xl border border-card-border">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, quality: 0.98 })}
              className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                settings.quality >= 0.95
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Ultra (300 DPI)
            </button>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, quality: 0.85 })}
              className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                settings.quality < 0.95
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Standard
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2.5">
        {/* Single Photo Download */}
        <button
          onClick={handleExportSingle}
          disabled={isExporting}
          className="w-full py-3 px-4 rounded-xl bg-brand text-white font-bold text-sm shadow-md hover:bg-brand-hover active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>
            {isExporting
              ? 'Processing Photo...'
              : `Download Single Photo (${preset.widthPx}×${preset.heightPx}px)`}
          </span>
        </button>

        {/* 4x6" Sheet Generator Button */}
        <button
          onClick={handleGenerateSheet}
          disabled={isExporting}
          className="w-full py-3 px-4 rounded-xl bg-body-bg border border-brand/40 text-brand font-bold text-sm hover:bg-brand/5 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Create Printable 4×6" Sheet (6 Photos)</span>
        </button>
      </div>

      {/* Printable Sheet Modal */}
      {showSheetModal && sheetPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card-bg border border-card-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-card-border">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Official 4×6" Printable Sheet Preview
                </h3>
                <p className="text-xs text-text-secondary">
                  Ready to print at CVS, Walgreens, Walmart or on home photo paper
                </p>
              </div>
              <button
                onClick={() => setShowSheetModal(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-body-bg"
              >
                ✕
              </button>
            </div>

            {/* Sheet Preview Image */}
            <div className="border border-card-border rounded-xl overflow-hidden bg-slate-900 shadow-inner">
              <img
                src={sheetPreviewUrl}
                alt="4x6 Printable Sheet Preview"
                className="w-full h-auto object-contain select-none"
              />
            </div>

            {/* Print Tips Note */}
            <div className="bg-brand/5 border border-brand/20 rounded-xl p-3 text-xs text-text-secondary space-y-1">
              <span className="font-semibold text-brand flex items-center space-x-1">
                <span>💡</span>
                <span>Printing Instructions</span>
              </span>
              <p>
                When printing, select standard <strong>4 × 6 inch (10 × 15 cm) Photo Paper</strong> and choose <strong>"Actual Size" / 100% scale</strong> (do NOT select "Fit to page").
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleDownloadSheetJpg}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-brand text-white font-bold text-xs shadow hover:bg-brand-hover transition-all flex items-center justify-center space-x-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Sheet (High-Res JPG)</span>
              </button>

              <button
                onClick={handleDownloadSheetPdf}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-body-bg border border-card-border text-text-primary hover:border-brand/40 font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Download Sheet (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
