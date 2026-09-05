import React, { useState } from 'react';
import { PHOTO_PRESETS } from '../data/presets';
import { PhotoPreset, PresetCategory } from '../types';

interface PresetSelectorProps {
  selectedPreset: PhotoPreset;
  onSelectPreset: (preset: PhotoPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | PresetCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = PHOTO_PRESETS.filter((p) => {
    const matchesTab = activeTab === 'all' || p.category === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-card-bg rounded-2xl border border-card-border p-5 shadow-sm space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-card-border">
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Choose Standard Format
          </h3>
          <p className="text-xs text-text-secondary mt-0.5 font-medium">
            Select an official biometric or social profile size
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1 bg-body-bg p-1 rounded-xl border border-card-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({PHOTO_PRESETS.length})
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              activeTab === 'passport'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>🛂</span>
            <span>Passport & Visa</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              activeTab === 'social'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>📱</span>
            <span>Social & Stories</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search country, format (e.g. US, UK, 35x45, LinkedIn)..."
          className="w-full bg-body-bg border border-card-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all pl-9 font-medium"
        />
        <svg
          className="w-4 h-4 text-text-muted absolute left-3 top-2.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Grid of Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3.5 rounded-xl border-2 transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-500/10 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-card-border bg-body-bg hover:border-blue-500/50 hover:bg-card-bg'
              }`}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs shadow-sm">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{preset.flag || '📷'}</span>
                  <span className="font-bold text-xs text-text-primary leading-tight line-clamp-1">
                    {preset.name}
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary leading-normal line-clamp-2 pt-0.5 font-medium">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-card-border/60 flex items-center justify-between text-[10px]">
                <span className="font-mono font-bold text-text-primary">
                  {preset.widthMm && preset.heightMm
                    ? `${preset.widthMm}×${preset.heightMm}mm`
                    : `${preset.widthPx}×${preset.heightPx}px`}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold ${
                    preset.category === 'passport'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {preset.category === 'passport' ? 'Biometric' : 'Social'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
