import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  KeyRound,
  FileCode2,
  Regex,
  Binary,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Play,
  Pause,
  ArrowUpRight,
  Sparkles,
  Terminal,
  ShieldAlert,
  Apple,
  Monitor,
  ChevronDown,
} from 'lucide-react';
import { ProductItem } from '../types';
import { PRODUCTS } from '../data/products';

interface ProductCarouselProps {
  selectedProductId?: string;
  onOpenEarlyAccess: (product: ProductItem) => void;
  onOpenDownload?: (product: ProductItem) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  selectedProductId,
  onOpenEarlyAccess,
  onOpenDownload,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Sync external product selection
  useEffect(() => {
    if (selectedProductId) {
      const idx = PRODUCTS.findIndex((p) => p.id === selectedProductId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [selectedProductId]);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PRODUCTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered]);

  const currentProduct = PRODUCTS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? PRODUCTS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === PRODUCTS.length - 1 ? 0 : prev + 1));
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-6 h-6 text-white" />;
      case 'KeyRound':
        return <KeyRound className="w-6 h-6 text-white" />;
      case 'FileCode2':
        return <FileCode2 className="w-6 h-6 text-white" />;
      case 'Regex':
        return <Regex className="w-6 h-6 text-white" />;
      case 'Binary':
        return <Binary className="w-6 h-6 text-white" />;
      default:
        return <Sparkles className="w-6 h-6 text-white" />;
    }
  };

  return (
    <section id="showcase" className="relative py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Product Suite</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-text-primary tracking-tight">
            Engineered for High-Velocity Developers
          </h2>
          <p className="text-text-secondary text-base sm:text-lg mt-3">
            Explore our ecosystem of zero-cloud engineering utilities designed to replace bloated SaaS tools.
          </p>
        </div>

        {/* Carousel Top Tab Navigators */}
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {PRODUCTS.map((product, idx) => (
            <button
              key={product.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 border ${
                currentIndex === idx
                  ? 'bg-background-elevated text-text-primary border-accent shadow-lg shadow-accent/10'
                  : 'bg-background-secondary/60 text-text-muted hover:text-text-primary border-border hover:bg-background-tertiary'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentIndex === idx ? 'bg-accent animate-pulse' : 'bg-text-muted/40'
                }`}
              />
              <span>{product.name}</span>
              {product.status === 'live' && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Product Showcase Card */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative rounded-3xl bg-background-secondary border border-border shadow-2xl p-6 sm:p-10 md:p-12 overflow-hidden transition-all"
        >
          {/* Ambient Card Background Glow */}
          <div
            className={`ambient-glow w-96 h-96 -top-20 -right-20 bg-gradient-to-br ${currentProduct.gradient} opacity-20`}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Product Information & Actions */}
            <div className="lg:col-span-6 space-y-6">
              {/* Product Badge & Category */}
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentProduct.gradient} flex items-center justify-center shadow-lg shadow-orange-500/15`}
                >
                  {renderIcon(currentProduct.iconName)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary">
                      {currentProduct.name}
                    </h3>
                    {currentProduct.status === 'live' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>LIVE NOW</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-mono text-xs font-bold border border-purple-500/30">
                        COMING SOON
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-accent mt-0.5">
                    {currentProduct.tagline}
                  </p>
                </div>
              </div>

              {/* Product Description */}
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {currentProduct.description}
              </p>

              {/* Feature Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentProduct.features.map((feature, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-background-tertiary/60 border border-border/60 flex items-start space-x-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-text-primary">{feature.title}</div>
                      <div className="text-[11px] text-text-muted mt-0.5 leading-snug">
                        {feature.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons - Only 2 Options: Launch Web App & Download Desktop */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
                {currentProduct.status === 'live' ? (
                  <>
                    {/* Primary Launch Button in New Tab */}
                    <a
                      href={currentProduct.actions.primaryUrl || 'https://endly.grassroot.digital'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[48px] flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-white shrink-0" />
                      <span>{currentProduct.actions.primaryLabel}</span>
                      <ExternalLink className="w-4 h-4 opacity-90 shrink-0" />
                    </a>

                    {/* Download Desktop App Modal */}
                    <button
                      onClick={() => onOpenDownload && onOpenDownload(currentProduct)}
                      className="min-h-[48px] flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-background-elevated hover:bg-background-tertiary border-2 border-border/80 hover:border-accent/50 text-text-primary font-extrabold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer group"
                    >
                      <Monitor className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span>Download Desktop</span>
                      <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors shrink-0" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onOpenEarlyAccess(currentProduct)}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-background-elevated hover:bg-background-tertiary text-text-primary font-bold text-sm border border-border hover:border-accent/40 transition-all shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Join Early Access & Preview</span>
                    <ArrowUpRight className="w-4 h-4 text-text-muted" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Visual Preview / Mockup Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-background-primary border border-border/80 shadow-xl overflow-hidden font-mono text-xs">
                {/* Mockup Header Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-background-tertiary/70 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="text-[11px] text-text-muted font-medium ml-2">
                      {currentProduct.name} Preview Playground
                    </span>
                  </div>
                  <div className="flex space-x-1.5">
                    {currentProduct.previewMockup.tags.slice(0, 2).map((t, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-background-elevated text-text-muted border border-border"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mockup Body Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Input Block */}
                  <div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1.5 flex items-center justify-between">
                      <span>Interactive Input / Spec</span>
                      <span className="text-accent text-[9px]">Client-Side Only</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-background-secondary/80 border border-border/60 text-text-primary overflow-x-auto text-[11px] leading-relaxed">
                      <code>{currentProduct.previewMockup.sampleCode}</code>
                    </pre>
                  </div>

                  {/* Output Block */}
                  <div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1.5">
                      Live Output / Inspector
                    </div>
                    <pre className="p-3.5 rounded-xl bg-background-secondary/80 border border-emerald-500/20 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
                      <code>{currentProduct.previewMockup.sampleResult}</code>
                    </pre>
                  </div>
                </div>

                {/* Mockup Footer Stats */}
                <div className="px-4 py-2 bg-background-tertiary/40 border-t border-border/60 flex items-center justify-between text-[10px] text-text-muted">
                  <span className="flex items-center space-x-1">
                    <ShieldAlert className="w-3 h-3 text-emerald-400" />
                    <span>Zero data leaves your device</span>
                  </span>
                  <span>v1.0 Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Footer Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
            {/* Slide Index Indicators */}
            <div className="flex items-center space-x-2">
              {PRODUCTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === i ? 'w-8 bg-accent' : 'w-2 bg-border hover:bg-text-muted'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Carousel Control Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="p-2 rounded-xl bg-background-tertiary text-text-muted hover:text-text-primary transition-colors text-xs flex items-center space-x-1"
                title={isAutoPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-background-tertiary hover:bg-background-elevated text-text-secondary hover:text-text-primary border border-border transition-colors"
                aria-label="Previous Product"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-background-tertiary hover:bg-background-elevated text-text-secondary hover:text-text-primary border border-border transition-colors"
                aria-label="Next Product"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
