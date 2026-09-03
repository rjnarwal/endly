import React from 'react';
import {
  Zap,
  Shield,
  Lock,
  Wifi,
  Sparkles,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Layers,
  Cpu,
  Monitor,
} from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onOpenDownload?: (productId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOpenDownload }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="ambient-glow w-[550px] h-[550px] bg-orange-500/20 -top-32 -left-32" />
      <div className="ambient-glow w-[600px] h-[600px] bg-blue-500/20 top-40 -right-40" />
      <div className="ambient-glow w-[400px] h-[400px] bg-emerald-500/15 bottom-0 left-1/3" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-background-elevated/80 border border-border text-xs text-text-secondary shadow-md mb-8 hover:border-accent/40 transition-colors">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium text-text-primary">Grassroot Digital Suite</span>
          <span className="text-text-muted">•</span>
          <span className="text-accent font-semibold">Endly v1.0 Live</span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-text-primary max-w-5xl mx-auto leading-[1.1] mb-6">
          Privacy-First Developer Tools. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            100% Client-Side.
          </span>{' '}
          Zero Cloud Leaks.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-text-secondary max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          Grassroot Digital builds ultra-fast, local-first engineering utilities for developers who value
          uncompromising speed, zero telemetry, and seamless operation behind strict corporate firewalls.
        </p>

        {/* Hero CTA Buttons - Only 2 Options: Launch Web App & Download Desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-16">
          {/* Launch Endly Web App */}
          <a
            href="https://endly.grassroot.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-base shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <Zap className="w-5 h-5 fill-white group-hover:animate-pulse" />
            <span>Launch Endly (Web)</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>

          {/* Download Desktop App Modal */}
          <button
            onClick={() => onOpenDownload && onOpenDownload('endly')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-2xl bg-background-elevated hover:bg-background-tertiary border border-border hover:border-accent/40 text-text-primary font-bold text-base shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Monitor className="w-5 h-5 text-accent" />
            <span>Download Desktop ▾</span>
          </button>
        </div>

        {/* 4 Pillars Trust Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto pt-6 border-t border-border/60">
          <div className="p-3.5 rounded-2xl bg-background-secondary/50 border border-border/50 text-left flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 mt-0.5 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-text-primary">100% Local Storage</div>
              <div className="text-[11px] text-text-muted mt-0.5">Secrets never leave your browser</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-background-secondary/50 border border-border/50 text-left flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-text-primary">Zero Cloud Telemetry</div>
              <div className="text-[11px] text-text-muted mt-0.5">No tracking, no account walls</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-background-secondary/50 border border-border/50 text-left flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 mt-0.5 shrink-0">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-text-primary">Firewall Resilient</div>
              <div className="text-[11px] text-text-muted mt-0.5">Bypasses Zscaler & VPN blocks</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-background-secondary/50 border border-border/50 text-left flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 mt-0.5 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-text-primary">Cross-Platform Native</div>
              <div className="text-[11px] text-text-muted mt-0.5">Web, macOS M1/M2/M3 & Win</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
