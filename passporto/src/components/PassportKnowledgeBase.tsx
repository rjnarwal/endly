import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, UserCheck, Camera, CheckCircle2, Globe2, FileCheck, Terminal } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'How does PassPorto guarantee 100% privacy for biometric facial photos?',
    answer: 'PassPorto executes face geometry analysis, cropping, eye-line alignment, and 300 DPI canvas rendering 100% locally in your browser memory via the native Shape Detection / Canvas APIs. Your facial images never leave your computer and are never uploaded to any cloud server.',
  },
  {
    question: 'Which official country passport and visa photo standards are supported?',
    answer: 'PassPorto provides pre-configured official templates for US Passport & Visa (2×2 inches / 51×51 mm), UK, European Union, India, and Schengen (35×45 mm), Canada Passport (50×70 mm), China & Japan Visa (33×48 mm), Australia Passport (35×45 mm), Driver\'s License badges (30×40 mm), and 1×1 inch stamp photos.',
  },
  {
    question: 'How does the Smart Biometric Auto-Centering work?',
    answer: 'PassPorto\'s client-side face detection engine identifies eye landmarks, nose centroid, and facial bounds. It automatically calculates the optimal zoom and pan coordinates to position the subject\'s eyes at 38–42% frame height and scale the head to cover 70–80% of the overall vertical frame, satisfying embassy rules.',
  },
  {
    question: 'Can I generate printable 4×6" photo sheets for CVS, Walgreens, or home printing?',
    answer: 'Yes. The Export Panel generates a high-resolution 300 DPI 4×6 inch (1800 × 1200 px) tiled grid containing 6 or 8 passport photos with thin cutting guidelines, ready for standard 4×6" photo paper printing at convenience stores.',
  },
  {
    question: 'Does PassPorto compress photos to satisfy government online portal file size limits?',
    answer: 'Yes. You can select one-click presets like "< 240 KB" (required by the US Department of State DS-160 online visa portal) or "< 100 KB" (Passport Seva & European e-Visa systems). PassPorto performs intelligent binary search compression to ensure compliance without sacrificing visual clarity.',
  },
];

export const PassportKnowledgeBase: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="mt-12 pt-10 border-t border-card-border text-text-primary space-y-12">
      {/* Overview & Core Benefits */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-blue-500 text-xs font-semibold uppercase tracking-wider">
          <UserCheck className="w-4 h-4" />
          <span>Biometric Standards & Embassy Compliance</span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight">
          How PassPorto Creates Official Biometric Passport & Visa Photos
        </h2>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-4xl">
          Getting passport and visa photos rejected due to improper head proportions, eye-line misalignment, or incorrect pixel dimensions is a common hassle. <strong className="text-text-primary">PassPorto</strong> combines in-browser face geometry alignment with strict embassy templates to produce guaranteed-compliant 300 DPI photos in seconds.
        </p>
      </div>

      {/* 3 Core Capability Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-card-bg p-6 border border-card-border shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-mono font-bold text-xs border border-blue-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-base text-text-primary">Biometric Eye Alignment</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Auto-aligns eye level and head crown against official embassy regulation guidelines with sub-pixel precision.
          </p>
        </div>

        <div className="rounded-2xl bg-card-bg p-6 border border-card-border shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/20">
            <Globe2 className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-base text-text-primary">Global Embassy Presets</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            US 2×2", UK/EU 35×45mm, Canada 50×70mm, and international visa dimensions calibrated at 300 DPI print quality.
          </p>
        </div>

        <div className="rounded-2xl bg-card-bg p-6 border border-card-border shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-mono font-bold text-xs border border-purple-500/20">
            <FileCheck className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-base text-text-primary">Printable 4×6" Sheets</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Generate 6 or 8 photo tiled sheets with cut lines for easy printing at CVS, Walgreens, or home photo printers.
          </p>
        </div>
      </div>

      {/* Deep Dive: Biometric Security & Local Processing */}
      <div className="rounded-3xl bg-card-bg border border-card-border p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-text-primary">
              Why Biometric Facial Privacy Must Be 100% Local
            </h3>
            <p className="text-xs text-text-secondary">
              Never upload your passport photos or biometric identity documents to cloud servers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-text-secondary leading-relaxed">
          <div className="space-y-3">
            <h4 className="font-bold text-text-primary text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero-Cloud Facial Processing</span>
            </h4>
            <p>
              Your high-resolution portrait never touches an external API or remote storage bucket. All facial proportion metrics, brightness adjustments, and sheet rasterization occur exclusively inside your device's browser memory.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-text-primary text-sm flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Government Portal Compliance</span>
            </h4>
            <p>
              Embassies enforce strict file size limits (such as US State Dept DS-160 &lt;240KB). PassPorto auto-compresses the image using binary-search canvas compression while preserving 300 DPI facial clarity.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-blue-500 text-xs font-semibold uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
          PassPorto FAQ & Embassy Guidelines
        </h2>

        <div className="space-y-3 pt-2">
          {FAQ_DATA.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-card-bg border border-card-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-bold text-text-primary hover:text-blue-500 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-blue-500 shrink-0 ml-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-secondary shrink-0 ml-3" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-4 text-xs text-text-secondary leading-relaxed border-t border-card-border/40 pt-3">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
