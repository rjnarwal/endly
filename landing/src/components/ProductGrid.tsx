import React, { useState } from 'react';
import {
  Zap,
  KeyRound,
  FileCode2,
  Regex,
  Binary,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';
import { ProductCategory, ProductItem } from '../types';
import { PRODUCTS } from '../data/products';

interface ProductGridProps {
  onSelectProduct: (productId: string) => void;
  onOpenEarlyAccess: (product: ProductItem) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  onSelectProduct,
  onOpenEarlyAccess,
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
      default:
        return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  return (
    <section id="products" className="py-16 md:py-24 bg-background-primary/60 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Full Ecosystem</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text-primary tracking-tight">
              Developer Productivity Toolkit
            </h2>
            <p className="text-text-secondary text-sm sm:text-base mt-1.5">
              High-performance utilities built with zero telemetry and 100% browser-local execution.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
            {(
              [
                { id: 'all', label: 'All Tools' },
                { id: 'api', label: 'API & Networking' },
                { id: 'security', label: 'Security & Auth' },
                { id: 'formatters', label: 'Formatters' },
                { id: 'utilities', label: 'Utilities' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'bg-background-secondary text-text-muted hover:text-text hover:bg-background-tertiary border border-border/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative rounded-2xl bg-background-secondary border border-border p-6 shadow-xl hover:shadow-2xl hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Icon & Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${product.gradient} flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform`}
                  >
                    {renderIcon(product.iconName)}
                  </div>
                  {product.status === 'live' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-mono text-[10px] font-bold border border-purple-500/30">
                      COMING SOON
                    </span>
                  )}
                </div>

                {/* Product Name & Tagline */}
                <h3 className="font-heading font-bold text-xl text-text-primary group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs font-semibold text-accent mt-0.5 mb-3">
                  {product.tagline}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {product.previewMockup.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-background-tertiary text-text-muted text-[10px] font-mono border border-border/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <button
                  onClick={() => onSelectProduct(product.id)}
                  className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors flex items-center space-x-1"
                >
                  <span>Interactive Preview</span>
                </button>

                {product.status === 'live' ? (
                  <a
                    href={product.actions.primaryUrl || 'https://endly.grassroot.digital'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-md shadow-accent/20 transition-all"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => onOpenEarlyAccess(product)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-background-elevated hover:bg-background-tertiary text-text-primary text-xs font-semibold border border-border transition-colors"
                  >
                    <span>Preview</span>
                    <ArrowUpRight className="w-3 h-3 text-text-muted" />
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
