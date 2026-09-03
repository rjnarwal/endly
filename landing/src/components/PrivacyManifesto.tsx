import React from 'react';
import {
  ShieldCheck,
  Lock,
  WifiOff,
  Cpu,
  Layers,
  Database,
  FileCheck,
  Globe2,
  Apple,
  Monitor,
  Download,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface PrivacyManifestoProps {
  onOpenDownload?: (productId: string) => void;
}

export const PrivacyManifesto: React.FC<PrivacyManifestoProps> = ({ onOpenDownload }) => {
  return (
    <section id="manifesto" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="ambient-glow w-96 h-96 -bottom-20 -left-20 bg-emerald-500/15" />
      <div className="ambient-glow w-96 h-96 -top-20 -right-20 bg-blue-500/15" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Core Philosophy</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-text-primary tracking-tight">
            The Grassroot Digital Privacy Promise
          </h2>
          <p className="text-text-secondary text-base sm:text-lg mt-3">
            Modern SaaS developer tools have turned into cloud data vacuums. We build local-first software
            where your data remains yours alone.
          </p>
        </div>

        {/* 4 Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="p-6 rounded-2xl bg-background-secondary border border-border shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary">100% Client-Side</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every API call, JWT decode, regex evaluation, and hash computation executes strictly in your
              local browser or native binary.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-background-secondary border border-border shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary">Zero Cloud Storage</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              We have no backend databases storing your authorization tokens, payload bodies, or internal
              company endpoints.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-background-secondary border border-border shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary">Firewall Unblockable</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Hosted on custom domains with dedicated edge certificates to bypass aggressive corporate proxies
              like Zscaler and GlobalProtect.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-background-secondary border border-border shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary">Native Standalone Binaries</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Want zero web browser friction? Download our native offline executables for Apple Silicon Mac and
              Windows with native LAN proxy support.
            </p>
          </div>
        </div>

        {/* Endly Desktop Downloads Card */}
        <div id="downloads" className="rounded-3xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-border shadow-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold">
                <span>Native Desktop Builds</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-4xl text-text-primary">
                Run Endly as a Native Offline Desktop App
              </h3>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                Enjoy full native performance, zero CORS restrictions, macOS titlebar integration, and
                integrated mobile HTTP/HTTPS LAN interceptor without opening a browser.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                {/* Launch Endly Web App */}
                <a
                  href="https://endly.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-md shadow-accent/20 transition-all"
                >
                  <span>Launch Web App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Download Desktop App Modal */}
                <button
                  onClick={() => onOpenDownload && onOpenDownload('endly')}
                  className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-background-elevated hover:bg-background-tertiary border border-border hover:border-accent/40 text-text-primary text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Monitor className="w-4 h-4 text-accent" />
                  <span>Download Desktop ▾</span>
                </button>
              </div>
            </div>

            {/* Checklist on the right */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-background-primary/80 border border-border/80 space-y-3.5 text-xs text-text-secondary">
              <div className="font-bold text-sm text-text-primary mb-2">Included in Desktop Edition:</div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero CORS Restrictions (Direct TCP dispatch)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Wi-Fi Mobile Proxy Interceptor for iOS & Android</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Native Window Resizing & macOS Traffic Lights</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Offline Capability (Zero internet required for local mocks)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
