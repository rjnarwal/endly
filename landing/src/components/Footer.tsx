import React from 'react';
import { Sparkles, Zap, ShieldCheck, Heart, ExternalLink, Globe, Cpu } from 'lucide-react';
import { PRODUCTS } from '../data/products';

interface FooterProps {
  onSelectProduct: (productId: string) => void;
  onNavigateView?: (view: 'home' | 'openground') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectProduct, onNavigateView }) => {
  return (
    <footer className="bg-background-secondary border-t border-border pt-12 pb-10 text-xs text-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-border/60">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-base text-text-primary">
                Grassroot Digital
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
              An independent, privacy-first developer ecosystem engineering lightweight, zero-cloud desktop
              and web tools that keep your secrets local and unmonitored.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (Global CDN & Edge SSL)</span>
            </div>
          </div>

          {/* Products Col */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Product Suite
            </div>
            <ul className="space-y-2">
              {PRODUCTS.map((p) => (
                <li key={p.id}>
                  {p.status === 'live' ? (
                    <a
                      href={p.url || 'https://endly.grassroot.digital'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-accent flex items-center space-x-1.5 transition-colors font-medium"
                    >
                      <span>{p.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                        LIVE
                      </span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ) : (
                    <button
                      onClick={() => onSelectProduct(p.id)}
                      className="text-text-muted hover:text-text-secondary flex items-center space-x-1.5 transition-colors text-left"
                    >
                      <span>{p.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-background-elevated text-text-muted font-mono">
                        Soon
                      </span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy & Philosophy Col */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Architecture & Security
            </div>
            <ul className="space-y-2 text-text-secondary">
              <li>• 100% Client-Side WebCrypto & Storage</li>
              <li>• Zero Cloud Database Storage</li>
              <li>• Corporate Proxy & VPN Friendly</li>
              <li>• Local Network Wi-Fi Interceptor</li>
              <li>• Native macOS & Windows Binaries</li>
            </ul>
          </div>

          {/* Ecosystem Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Community & Hubs
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigateView && onNavigateView('openground')}
                  className="text-orange-400 hover:text-orange-300 flex items-center space-x-1 transition-colors font-bold text-left cursor-pointer"
                >
                  <span>🔥 Open Ground Forum</span>
                </button>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={() => onNavigateView && onNavigateView('home')}
                  className="text-text-secondary hover:text-accent flex items-center space-x-1 transition-colors font-medium cursor-pointer"
                >
                  <span>About The Builder</span>
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={() => onNavigateView && onNavigateView('home')}
                  className="text-text-secondary hover:text-accent flex items-center space-x-1 transition-colors font-medium cursor-pointer"
                >
                  <span>Developer FAQ</span>
                </a>
              </li>
              <li>
                <a
                  href="https://endly.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent flex items-center space-x-1 transition-colors"
                >
                  <span>endly.grassroot.digital</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://tokenlens.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent flex items-center space-x-1 transition-colors"
                >
                  <span>tokenlens.grassroot.digital</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://jsonlens.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent flex items-center space-x-1 transition-colors"
                >
                  <span>jsonlens.grassroot.digital</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://regexforge.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent flex items-center space-x-1 transition-colors"
                >
                  <span>regexforge.grassroot.digital</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://cipherlab.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-accent flex items-center space-x-1 transition-colors"
                >
                  <span>cipherlab.grassroot.digital</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Desktop Downloads Col */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Native Desktop App
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/rjnarwal/endly/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-amber-400 flex items-center space-x-1.5 transition-colors font-medium"
                >
                  <span>⚡ Endly Desktop (Mac/Win/Linux)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
            <div className="pt-2 text-[11px] text-text-muted leading-relaxed">
              💡 All other developer tools run 100% in-browser with zero install friction.
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-text-muted gap-4">
          <div>
            © {new Date().getFullYear()} Grassroot Digital. Built with precision for privacy-conscious engineers.
          </div>
          <div className="flex items-center space-x-1">
            <span>Powered by Google Edge CDN & Local-First Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
