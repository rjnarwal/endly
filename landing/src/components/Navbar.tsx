import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Sun,
  Moon,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  Compass,
  User,
  HelpCircle,
} from 'lucide-react';
import { PRODUCTS } from '../data/products';

interface NavbarProps {
  theme: 'dark' | 'midnight' | 'light';
  onThemeChange: (theme: 'dark' | 'midnight' | 'light') => void;
  onSelectProduct: (productId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onThemeChange, onSelectProduct }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-background-secondary/85 backdrop-blur-md border-b border-border shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg tracking-tight text-text-primary flex items-center space-x-1.5">
              <span>Grassroot Digital</span>
            </span>
            <span className="text-[10px] text-text-muted font-mono tracking-wider uppercase -mt-0.5">
              Developer Ecosystem
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {/* Products Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
              onMouseEnter={() => setProductsDropdownOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary/60 transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-accent" />
              <span>Products</span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {productsDropdownOpen && (
              <div
                onMouseLeave={() => setProductsDropdownOpen(false)}
                className="absolute left-0 top-full mt-1.5 w-80 p-2 bg-background-elevated border border-border rounded-2xl shadow-2xl z-50 text-xs flex flex-col space-y-1 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted border-b border-border/50">
                  Developer Tools Suite
                </div>
                {PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setProductsDropdownOpen(false);
                      onSelectProduct(product.id);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-background-tertiary flex items-start space-x-3 transition-colors group"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${product.gradient} flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                          {product.name}
                        </span>
                        {product.status === 'live' ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-medium border border-emerald-500/30">
                            LIVE
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-400 font-mono font-medium border border-purple-500/30">
                            SOON
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted truncate mt-0.5">
                        {product.tagline}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="#about"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary/60 transition-colors"
          >
            <User className="w-4 h-4 text-cyan-400" />
            <span>About The Builder</span>
          </a>

          <a
            href="#manifesto"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary/60 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacy</span>
          </a>

          <a
            href="#faq"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary/60 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>FAQ</span>
          </a>

          <a
            href="#showcase"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background-tertiary/60 transition-colors"
          >
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Showcase</span>
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Theme Selector */}
          <div className="flex items-center bg-background-tertiary/70 border border-border/80 rounded-xl p-0.5">
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                theme === 'dark' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text'
              }`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('midnight')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                theme === 'midnight'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
              title="Midnight Theme"
            >
              Navy
            </button>
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                theme === 'light' ? 'bg-amber-500 text-white shadow-sm' : 'text-text-muted hover:text-text'
              }`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary CTA: Launch Endly in New Tab */}
          <a
            href="https://endly.grassroot.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Launch Endly</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-background-tertiary text-text-secondary hover:text-text"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background-secondary border-b border-border px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-text-muted px-2 py-1">Products</div>
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSelectProduct(p.id);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-background-tertiary flex items-center justify-between text-sm text-text-primary"
              >
                <span>{p.name}</span>
                <span className="text-[10px] text-text-muted">{p.badgeText}</span>
              </button>
            ))}
          </div>

          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-text-secondary hover:text-text font-medium"
          >
            About The Builder
          </a>

          <a
            href="#manifesto"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-text-secondary hover:text-text font-medium"
          >
            Privacy Manifesto
          </a>

          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-text-secondary hover:text-text font-medium"
          >
            Developer FAQ & Knowledge Base
          </a>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-muted">Theme</span>
            <div className="flex space-x-1">
              <button
                onClick={() => onThemeChange('dark')}
                className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-accent text-white' : 'text-text-muted'}`}
              >
                Dark
              </button>
              <button
                onClick={() => onThemeChange('midnight')}
                className={`px-2 py-1 text-xs rounded ${theme === 'midnight' ? 'bg-blue-600 text-white' : 'text-text-muted'}`}
              >
                Midnight
              </button>
              <button
                onClick={() => onThemeChange('light')}
                className={`px-2 py-1 text-xs rounded ${theme === 'light' ? 'bg-amber-500 text-white' : 'text-text-muted'}`}
              >
                Light
              </button>
            </div>
          </div>

          <a
            href="https://endly.grassroot.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-md"
          >
            Launch Endly ↗
          </a>
        </div>
      )}
    </header>
  );
};
