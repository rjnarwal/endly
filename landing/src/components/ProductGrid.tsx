import React, { useState } from 'react';
import {
  Zap,
  KeyRound,
  FileCode2,
  Regex,
  Binary,
  Images,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Layers,
  Filter,
  Monitor,
  ChevronDown,
} from 'lucide-react';
import { ProductCategory, ProductItem } from '../types';
import { PRODUCTS } from '../data/products';

interface ProductGridProps {
  onSelectProduct: (productId: string) => void;
  onOpenEarlyAccess: (product: ProductItem) => void;
  onOpenDownload?: (product: ProductItem) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  onSelectProduct,
  onOpenEarlyAccess,
  onOpenDownload,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');

  const filteredProducts =
    activeCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-white" />;
      case 'KeyRound':
        return <KeyRound className="w-5 h-5 text-white" />;
      case 'FileCode2':
        return <FileCode2 className="w-5 h-5 text-white" />;
      case 'Regex':
        return <Regex className="w-5 h-5 text-white" />;
      case 'Binary':
        return <Binary className="w-5 h-5 text-white" />;
      case 'Images':
        return <Images className="w-5 h-5 text-white" />;
      default:
        return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  return (
    <section id="products" className="py-10 md:py-14 bg-background-primary relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-2.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Full Ecosystem</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight">
              Developer Toolbox
            </h2>
            <p className="text-text-secondary text-base mt-2">
              Every tool is 100% client-side, zero cloud telemetry, and offline-capable.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-4 md:pt-0 scrollbar-thin">
            {(
              [
                { id: 'all', label: 'All Tools' },
                { id: 'api', label: 'API & Mobile' },
                { id: 'security', label: 'JWT & Auth' },
                { id: 'formatters', label: 'JSON & Diff' },
                { id: 'utilities', label: 'Regex & Crypto' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'bg-background-secondary hover:bg-background-elevated text-text-secondary hover:text-text-primary border border-border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-3xl bg-background-secondary hover:bg-background-secondary/90 border border-border hover:border-accent/40 shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Row: Icon + Badges */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${product.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                  >
                    {renderIcon(product.iconName)}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {product.status === 'live' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold tracking-wider">
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold tracking-wider">
                        SOON
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Tagline */}
                <h3 className="font-heading font-bold text-xl text-text-primary group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs font-semibold text-text-muted mt-1 mb-3">
                  {product.tagline}
                </p>

                {/* Description */}
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mb-6">
                  {product.description}
                </p>

                {/* Mini Feature Chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {product.previewMockup.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-background-elevated border border-border/50 text-[10px] text-text-muted font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2.5">
                {product.status === 'live' ? (
                  <>
                    {/* Launch Web App */}
                    <a
                      href={product.actions.primaryUrl || 'https://endly.grassroot.digital'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-h-[44px] px-3.5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-[13px] font-bold shadow-md shadow-accent/20 transition-all flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer ${
                        product.id === 'endly' ? 'flex-1' : 'w-full'
                      }`}
                    >
                      <span>Launch Web App</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-90 shrink-0" />
                    </a>

                    {/* Download Desktop App Modal - Only for Endly */}
                    {product.id === 'endly' && (
                      <button
                        onClick={() => onOpenDownload && onOpenDownload(product)}
                        className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-background-elevated hover:bg-background-tertiary border border-border hover:border-accent/40 text-text-primary text-xs sm:text-[13px] font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer group"
                        title="Download Endly Desktop App (Mac / Windows / Linux)"
                      >
                        <Monitor className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform shrink-0" />
                        <span>Desktop App</span>
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors shrink-0" />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => onOpenEarlyAccess(product)}
                    className="w-full min-h-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-background-elevated hover:bg-background-tertiary text-text-primary text-xs sm:text-[13px] font-bold border border-border transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Join Early Access & Preview</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
