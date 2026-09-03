import React from 'react';
import { X, Settings, Shield, Globe, Keyboard, Sliders } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { isDesktopEnvironment } from '../../services/httpDispatcher';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, closeSettingsModal, settings, setSettings } = useWorkspaceStore();

  if (!isSettingsModalOpen) return null;

  const isDesktop = isDesktopEnvironment();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-background-elevated border border-border rounded-xl shadow-2xl w-full max-w-2xl h-[560px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-bold text-text">Preferences & Settings</h2>
          </div>
          <button
            onClick={closeSettingsModal}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-background-tertiary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Network & CORS Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-text-muted flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Network & CORS Transport</span>
            </h3>

            <div className="p-4 rounded-lg bg-background-secondary border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-text block">Web CORS Proxy</span>
                  <span className="text-text-muted text-[11px]">
                    Route web requests through a proxy to bypass browser Cross-Origin restrictions.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.proxyEnabled}
                  onChange={(e) => setSettings({ proxyEnabled: e.target.checked })}
                  className="accent-accent cursor-pointer"
                />
              </div>

              {settings.proxyEnabled && (
                <div className="flex flex-col space-y-1 pt-2 border-t border-border/50">
                  <label className="text-[11px] text-text-secondary">Proxy Endpoint URL:</label>
                  <input
                    type="text"
                    value={settings.proxyUrl}
                    onChange={(e) => setSettings({ proxyUrl: e.target.value })}
                    placeholder="https://corsproxy.io/?"
                    className="w-full bg-background border border-border rounded px-3 py-1.5 font-mono text-xs text-text focus:outline-none focus:border-accent"
                  />
                </div>
              )}

              {isDesktop && (
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px]">
                  ✓ You are running the <strong>Endly Desktop App</strong> (Tauri v2). Native Rust HTTP transport is active with zero CORS restrictions.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: General Application */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-text-muted flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-accent" />
              <span>General Settings</span>
            </h3>

            <div className="p-4 rounded-lg bg-background-secondary border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-text block">Request Timeout (seconds)</span>
                  <span className="text-text-muted text-[11px]">
                    Abort requests if no response is received within this time.
                  </span>
                </div>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={settings.requestTimeout}
                  onChange={(e) => setSettings({ requestTimeout: parseInt(e.target.value) || 30 })}
                  className="w-20 bg-background border border-border rounded px-2 py-1 text-center font-mono text-text focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div>
                  <span className="font-semibold text-text block">Auto-save Tabs</span>
                  <span className="text-text-muted text-[11px]">
                    Automatically persist open tabs in IndexedDB storage across sessions.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSaveTabs}
                  onChange={(e) => setSettings({ autoSaveTabs: e.target.checked })}
                  className="accent-accent cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Keyboard Shortcuts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-text-muted flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-purple-400" />
              <span>Keyboard Shortcuts</span>
            </h3>

            <div className="p-4 rounded-lg bg-background-secondary border border-border grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-secondary">Send Request</span>
                <kbd className="px-1.5 py-0.5 rounded bg-background-tertiary font-mono text-[10px] text-text">
                  Cmd / Ctrl + Enter
                </kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-secondary">Save Request</span>
                <kbd className="px-1.5 py-0.5 rounded bg-background-tertiary font-mono text-[10px] text-text">
                  Cmd / Ctrl + S
                </kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-secondary">New Request Tab</span>
                <kbd className="px-1.5 py-0.5 rounded bg-background-tertiary font-mono text-[10px] text-text">
                  Cmd / Ctrl + N
                </kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-secondary">Close Tab</span>
                <kbd className="px-1.5 py-0.5 rounded bg-background-tertiary font-mono text-[10px] text-text">
                  Cmd / Ctrl + W
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-border bg-background-secondary">
          <button
            onClick={closeSettingsModal}
            className="px-5 py-2 rounded-md font-semibold text-xs text-white bg-accent hover:bg-accent-hover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
