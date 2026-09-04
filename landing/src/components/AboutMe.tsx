import React from 'react';
import {
  User,
  Smartphone,
  Cpu,
  Layers,
  Sparkles,
  Mountain,
  Trophy,
  Terminal,
  Code2,
  Rocket,
  Compass,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AboutMe: React.FC = () => {
  return (
    <section id="about" className="py-12 md:py-16 relative overflow-hidden bg-background-primary select-none">
      {/* Ambient background glow orbs */}
      <div className="ambient-glow w-[550px] h-[550px] bg-emerald-500/10 -top-24 right-0" />
      <div className="ambient-glow w-[550px] h-[550px] bg-blue-500/10 bottom-0 -left-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wide uppercase">
            <User className="w-3.5 h-3.5" />
            <span>Founder & Architect Profile</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-text-primary">
            Building Tools That{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Move the Needle
            </span>
          </h2>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            I’m <strong className="text-text-primary font-bold">Rajesh Narwal</strong> — Founder, Product Owner & Mobile Architect passionate about designing resilient system architectures and crafting developer-first tools that eliminate friction and streamline everyday engineering workflows.
          </p>
        </div>

        {/* 2-Column Main Layout: Left Portrait Card & Right Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Portrait & Executive Profile Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group">
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 opacity-30 group-hover:opacity-60 blur-xl transition-all duration-300" />

              {/* Main Image Card */}
              <div className="relative rounded-3xl overflow-hidden bg-background-secondary border-2 border-border/80 shadow-2xl">
                <img
                  src="/images/rajesh-narwal.jpg"
                  alt="Rajesh Narwal - Founder, Product Owner & Mobile Architect"
                  className="w-full h-[430px] sm:h-[490px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                />

                {/* Glassmorphism Name & Executive Titles Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/95 via-black/75 to-transparent text-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                      Rajesh Narwal
                    </h3>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold">
                      Founder
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-emerald-300 font-semibold flex items-center space-x-1.5">
                    <Rocket className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Product Owner • Mobile Architect • Systems Builder</span>
                  </p>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Creator & Lead of the grassroot.digital Developer Suite
                  </p>
                </div>
              </div>
            </div>

            {/* Core Leadership & Technical Competencies */}
            <div className="p-5 rounded-2xl bg-background-secondary border border-border space-y-3 shadow-md">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                <span>Core Competencies & Strategy</span>
                <span className="text-[10px] font-mono text-emerald-400">Founder Stack</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1.5 rounded-xl bg-background-tertiary text-text-primary border border-border flex items-center space-x-1.5 hover:border-emerald-500/40 transition-colors">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mobile Architecture & Systems Design</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-background-tertiary text-text-primary border border-border flex items-center space-x-1.5 hover:border-blue-500/40 transition-colors">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>Product Ownership & Strategy</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-background-tertiary text-text-primary border border-border flex items-center space-x-1.5 hover:border-purple-500/40 transition-colors">
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                  <span>Native Android (Kotlin / Java)</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-background-tertiary text-text-primary border border-border flex items-center space-x-1.5 hover:border-cyan-500/40 transition-colors">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Developer Tooling & Platform Eng</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-background-tertiary text-text-primary border border-border flex items-center space-x-1.5 hover:border-amber-500/40 transition-colors">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tennis</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-background-tertiary text-text-primary border border-border flex items-center space-x-1.5 hover:border-teal-500/40 transition-colors">
                  <Mountain className="w-3.5 h-3.5 text-teal-400" />
                  <span>Mountain Trails</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-background-tertiary text-text-primary border border-border flex items-center space-x-1.5 hover:border-orange-500/40 transition-colors">
                  <Cpu className="w-3.5 h-3.5 text-orange-400" />
                  <span>Tech Hardware Tinkering</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Mission Story & What You'll Find Here */}
          <div className="lg:col-span-7 space-y-8">
            {/* Story Paragraphs */}
            <div className="space-y-5 text-text-secondary leading-relaxed text-sm sm:text-base">
              <p>
                At <span className="text-text-primary font-bold">grassroot.digital</span>, the mission is simple: <strong>solve practical engineering challenges from the ground up</strong>. Having spent years architecting complex native mobile ecosystems with Kotlin, Java, and modern mobile architectures, I know firsthand how much time is lost to repetitive tasks, clumsy tooling, and subtle integration bottlenecks.
              </p>
              <p>
                As a <strong>Product Owner and Architect</strong>, I created this platform as a curated space where hard-learned engineering lessons transform into open, modular, and practical tools designed to help engineering teams build, test, and ship faster.
              </p>
              <p>
                Whether it’s tackling resilient architectural patterns, untangling backend integrations, or automating day-to-day routines, everything here is engineered with an unwavering focus on clean structure, solid performance, and real-world utility.
              </p>
            </div>

            {/* What You'll Find Here 3 Pillars */}
            <div className="space-y-4">
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-text-primary flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>What You’ll Find Here</span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {/* Pillar 1 */}
                <div className="p-5 rounded-2xl bg-background-secondary border border-border hover:border-emerald-500/50 transition-all flex items-start space-x-4 shadow-sm group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading font-bold text-sm text-text-primary">
                      Developer Utilities & Tools
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary leading-normal">
                      Lightweight libraries, scripts, and workflows designed to plug right into native Android and modern tech stacks.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="p-5 rounded-2xl bg-background-secondary border border-border hover:border-blue-500/50 transition-all flex items-start space-x-4 shadow-sm group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading font-bold text-sm text-text-primary">
                      Practical Architecture Blueprints
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary leading-normal">
                      Production-tested patterns and setup guides focusing on clean architecture, performance, and long-term maintainability.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="p-5 rounded-2xl bg-background-secondary border border-border hover:border-purple-500/50 transition-all flex items-start space-x-4 shadow-sm group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading font-bold text-sm text-text-primary">
                      Pragmatic Engineering Insights
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary leading-normal">
                      Direct, fluff-free notes on building, debugging, and scaling modern mobile applications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Sign-off Note */}
            <div className="p-4 rounded-xl bg-background-tertiary/80 border border-border/80 text-xs sm:text-sm text-text-muted flex items-start space-x-3">
              <span className="text-xl">🏔️</span>
              <p className="leading-relaxed text-text-secondary">
                When I’m not deep in code, refining product roadmaps, or architecting new tools, you’ll usually find me on the tennis court, exploring mountain trails, or tinkering with tech hardware.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
