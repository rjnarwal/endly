import React from 'react';
import {
  Sparkles,
  Smartphone,
  Globe,
  Layers,
  Send,
  Mail,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Clock,
  DollarSign,
  MessageSquare,
} from 'lucide-react';

interface ProjectQuoteSectionProps {
  onOpenQuoteModal: (tab?: 'form' | 'email' | 'qr') => void;
}

export const ProjectQuoteSection: React.FC<ProjectQuoteSectionProps> = ({
  onOpenQuoteModal,
}) => {
  return (
    <section id="quote" className="py-14 md:py-20 relative overflow-hidden bg-background-secondary border-y border-border select-none">
      {/* Ambient background glow orbs */}
      <div className="ambient-glow w-[500px] h-[500px] bg-emerald-500/10 top-0 left-1/4 -translate-x-1/2" />
      <div className="ambient-glow w-[500px] h-[500px] bg-orange-500/10 bottom-0 right-1/4 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Engineering & Consulting</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-text-primary">
            Have an App or Website Idea?{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">
              Let’s Build It Together.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Collaborate directly with <strong className="text-text-primary font-bold">Rajesh Narwal</strong> — Founder, Product Owner & Mobile Architect. Submit your project requirements to get an actionable milestone breakdown and quote.
          </p>
        </div>

        {/* 3 Pillars / Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Mobile Apps */}
          <div className="p-6 rounded-3xl bg-background-tertiary/70 border border-border/80 hover:border-emerald-500/50 transition-all duration-300 shadow-md group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Native Mobile Apps
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  High-performance iOS & Android applications built with native Kotlin, Jetpack Compose, Swift, Coroutines, and offline-first IndexedDB/Room architectures.
                </p>
              </div>
            </div>

            <ul className="mt-5 pt-4 border-t border-border/60 space-y-2 text-xs text-text-muted">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero-latency offline architecture</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>App Store & Google Play submission</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Modern Web Platforms */}
          <div className="p-6 rounded-3xl bg-background-tertiary/70 border border-border/80 hover:border-blue-500/50 transition-all duration-300 shadow-md group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Modern Web & SaaS Platforms
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Responsive Single-Page Applications and full-stack web platforms built with React, Next.js, TypeScript, and edge APIs with clean typography and fast load times.
                </p>
              </div>
            </div>

            <ul className="mt-5 pt-4 border-t border-border/60 space-y-2 text-xs text-text-muted">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Client-side WebCrypto & privacy</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>SEO-optimized & Core Web Vitals ready</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Systems & Developer Tools */}
          <div className="p-6 rounded-3xl bg-background-tertiary/70 border border-border/80 hover:border-orange-500/50 transition-all duration-300 shadow-md group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Direct Architect Partnership
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  No agency bloat, sales reps, or junior developers. You work 1-on-1 with an experienced technical founder from system blueprint to deployment.
                </p>
              </div>
            </div>

            <ul className="mt-5 pt-4 border-t border-border/60 space-y-2 text-xs text-text-muted">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Transparent milestone delivery</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Clean, well-documented source code</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action Banner / Interactive Trigger Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-background-elevated/90 to-background-secondary border-2 border-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Quick Estimate & Consultation</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary">
                Ready to scope your project?
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                Submit your idea via our interactive requirements form, or launch your email client with our pre-formatted template. All inquiries go directly to <strong className="text-text-primary font-mono">rjnarwal@gmail.com</strong>.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
              {/* Primary Action Button */}
              <button
                onClick={() => onOpenQuoteModal('form')}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Open Requirements Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary Actions Row */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => onOpenQuoteModal('email')}
                  className="flex-1 py-3 px-4 rounded-xl bg-background-tertiary hover:bg-background-elevated text-text-primary border border-border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Email Directly</span>
                </button>

                <button
                  onClick={() => onOpenQuoteModal('qr')}
                  className="py-3 px-4 rounded-xl bg-background-tertiary hover:bg-background-elevated text-text-primary border border-border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  title="Share or Scan QR Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
