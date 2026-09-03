import React, { useState } from 'react';
import { X, Sparkles, Check, Send, ShieldCheck, Zap } from 'lucide-react';
import { ProductItem } from '../types';

interface EarlyAccessModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export const EarlyAccessModal: React.FC<EarlyAccessModalProps> = ({ product, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
      <div className="bg-background-elevated border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2.5">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${product.gradient} flex items-center justify-center text-white`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-text-primary">{product.name}</h3>
              <span className="text-[10px] text-accent font-mono">Early Preview Access</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-tertiary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary font-semibold">{product.name}</strong> is currently being
            crafted with our local-first, zero-cloud architecture. Enter your email to be the first to test the beta
            release.
          </p>

          <div className="p-3.5 rounded-xl bg-background-secondary border border-border/70 text-xs space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Key Capabilities:</div>
            {product.features.map((f, i) => (
              <div key={i} className="flex items-start space-x-2 text-text-secondary">
                <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <span><strong className="text-text-primary">{f.title}</strong>: {f.description}</span>
              </div>
            ))}
          </div>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>You're on the priority list!</span>
              </div>
              <p className="text-[11px] text-text-muted font-normal">
                We will email you when the {product.name} web & desktop beta drops.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                  Your Developer Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background-secondary border border-border text-text-primary text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Beta Access</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-background-tertiary text-text-secondary hover:text-text-primary text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </form>
          )}

          {/* Privacy Footnote */}
          <div className="pt-2 text-[10px] text-text-muted text-center flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Zero spam. Unsubscribe anytime with 1 click.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
