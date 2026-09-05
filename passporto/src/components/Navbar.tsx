import React from 'react';
import {
  Sparkles,
  ExternalLink,
  Moon,
  Sun,
  Home,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  theme: 'light' | 'dark' | 'midnight';
  onThemeChange: (theme: 'light' | 'dark' | 'midnight') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onThemeChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-background-secondary/90 backdrop-blur-md border-b border-border select-none px-4 sm:px-6">
      <div className="max-w-7xl mx-auto h-14 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-heading font-extrabold text-base tracking-tight text-text-primary">
                PassPorto
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-background-elevated text-accent font-semibold border border-border">
                Biometric Studio
              </span>
            </div>
          </div>

          {/* Grassroot Digital Home Link */}
          <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-border/60">
            <a
              href="https://grassroot.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors border border-border/50 hover:border-emerald-500/40 group"
              title="Grassroot Digital Welcome Hub"
            >
              <Home className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span>Grassroot Hub</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60 text-text-muted" />
            </a>
          </div>
        </div>

        {/* Right Controls: 3-Pill Theme Switcher */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% In-Browser • Zero Telemetry</span>
          </div>

          <div className="flex items-center bg-background-tertiary/80 border border-border rounded-xl p-0.5">
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-accent text-white shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Clean Light Theme (Default)"
              aria-label="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-accent text-white shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Dark Modern Theme"
              aria-label="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('midnight')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                theme === 'midnight'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Midnight Navy Theme"
              aria-label="Midnight Navy Theme"
            >
              Navy
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
