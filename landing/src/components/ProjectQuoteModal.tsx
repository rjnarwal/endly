import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Smartphone,
  Globe,
  Layers,
  ShieldCheck,
  Download,
  Share2,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Briefcase,
  AlertCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import QRCode from 'qrcode';

interface ProjectQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'form' | 'email' | 'qr';
  theme: 'dark' | 'midnight' | 'light';
}

export type ProjectType =
  | 'mobile-app'
  | 'website'
  | 'both'
  | 'custom-tool'
  | 'backend-api'
  | 'other';

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  'mobile-app': 'Mobile App (iOS & Android — Native Kotlin/Swift or Flutter)',
  'website': 'Website / Modern Web Application (React, Next.js, SPA, Full-Stack)',
  'both': 'Both (Mobile App & Modern Web Platform Suite)',
  'custom-tool': 'Privacy-First / Local-First Developer Tool or Desktop App',
  'backend-api': 'High-Scale Backend, API Architecture & Mobile Proxy',
  'other': 'Something Else (Custom Idea / Technical Consultation)',
};

export const ProjectQuoteModal: React.FC<ProjectQuoteModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'form',
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'email' | 'qr'>(initialTab);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('both');
  const [budget, setBudget] = useState('$1,500 – $5,000 (Standard MVP / App)');
  const [timeline, setTimeline] = useState('1 to 3 months');
  const [requirements, setRequirements] = useState('');
  
  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Copy states
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // QR Code Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const targetUrl = 'https://grassroot.digital/#quote';
  const recipientEmail = 'rjnarwal@gmail.com';

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Generate QR Code on mount or theme change
  useEffect(() => {
    const isDark = theme === 'dark' || theme === 'midnight';
    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: isDark ? '#10b981' : '#047857',
        light: isDark ? '#0b1120' : '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [theme]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build mailto URL with pre-filled content
  const generateMailtoUrl = (customRequirements?: string) => {
    const typeLabel = PROJECT_TYPE_LABELS[projectType] || 'Custom Project';
    const subject = encodeURIComponent(`[Project Quote Request] - ${typeLabel}`);
    const body = encodeURIComponent(
      `Hi Rajesh,\n\n` +
      `I would like to request a quote for developing a project:\n\n` +
      `• Project Type: ${typeLabel}\n` +
      `• Name: ${name || '[My Name]'}\n` +
      `• Best Contact (Email / Phone / Telegram): ${contactMethod || email || '[My Contact Info]'}\n` +
      `• Estimated Budget: ${budget}\n` +
      `• Target Timeline: ${timeline}\n\n` +
      `Project Details & Requirements:\n` +
      `${customRequirements || requirements || '- Problem to solve:\n- Core features needed:\n- Target platforms (Mobile / Web):\n- Any reference apps or websites:'}\n\n` +
      `Looking forward to your quote and suggestions!\n`
    );
    return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  const emailTemplateText = 
`To: ${recipientEmail}
Subject: [Project Quote Request] - ${PROJECT_TYPE_LABELS[projectType]}

Hi Rajesh,

I would like to request a project quote for developing:

• Project Type: ${PROJECT_TYPE_LABELS[projectType]}
• My Name: ${name || '[Your Name]'}
• Contact Email / Phone: ${email || contactMethod || '[Your Contact Details]'}
• Estimated Budget Range: ${budget}
• Target Timeline: ${timeline}

Idea & Requirements Breakout:
${requirements || `- What does the app/website do?
- Core features & user workflows:
- Platforms (iOS, Android, Web, or Desktop):
- Any reference links or mockups:`}

Looking forward to your quote!`;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !requirements.trim()) {
      setSubmitError('Please fill in your name, email, and requirements breakout.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      contact_method: contactMethod.trim() || 'Via Email',
      project_type: PROJECT_TYPE_LABELS[projectType],
      budget_range: budget,
      target_timeline: timeline,
      requirements_breakout: requirements.trim(),
      _subject: `[Grassroot Digital Quote Request] - ${PROJECT_TYPE_LABELS[projectType]} from ${name.trim()}`,
      _replyto: email.trim(),
      _template: 'table',
    };

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Network submission response was not ok');
      }
    } catch (err) {
      console.warn('Direct form submission error, prompting mail client fallback:', err);
      // Fallback: If network or adblocker blocks ajax, prompt mailto
      setSubmitError(
        'Unable to send via automated background dispatcher. No worries! You can send it directly to rjnarwal@gmail.com with your typed requirements already intact below.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, type: 'email' | 'template' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === 'template') {
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    } else if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Request a Project Quote — Grassroot Digital',
          text: 'Submit your app or website requirements directly to Rajesh Narwal for a milestone quote.',
          url: targetUrl,
        });
      } catch (e) {
        // user cancelled or share failed
      }
    } else {
      handleCopy(targetUrl, 'url');
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'grassroot-digital-quote-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div
        className="bg-background-secondary border border-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border bg-background-secondary/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-text-primary tracking-tight">
                  Request a Project Quote
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  DIRECT
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-text-muted">
                Custom Mobile Apps, Web Platforms & Local-First Systems by Rajesh Narwal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-background-tertiary transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 sm:px-7 pt-3 pb-2 bg-background-secondary border-b border-border/70 shrink-0">
          <div className="flex p-1 rounded-2xl bg-background-tertiary/70 border border-border/80 gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-accent text-white shadow-sm font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Interactive Form</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-accent text-white shadow-sm font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Direct Email Client</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-accent text-white shadow-sm font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Share & QR Code</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: INTERACTIVE FORM */}
          {activeTab === 'form' && (
            <div>
              {submitted ? (
                <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-heading font-extrabold text-xl text-text-primary">
                      Requirements Received!
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-emerald-400 font-bold">{name}</strong>. Your project details have been sent directly to Rajesh Narwal at <strong className="text-text-primary font-mono">rjnarwal@gmail.com</strong>.
                    </p>
                    <p className="text-xs text-text-muted">
                      I will review your requirements and reply with a tailored scope and quote within 24–48 hours.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={generateMailtoUrl()}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-background-secondary border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-emerald-500/50 flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Open in Mail Client Backup</span>
                    </a>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setRequirements('');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors shadow-sm"
                    >
                      Submit Another Requirement
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div className="text-xs text-text-secondary leading-relaxed">
                    Tell me about your app or website idea. I will analyze the architecture, estimate milestones, and deliver a clean technical quote directly to your inbox.
                  </div>

                  {submitError && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-2 flex-1">
                        <p>{submitError}</p>
                        <a
                          href={generateMailtoUrl()}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:text-white font-semibold transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Pre-Filled Email Now (rjnarwal@gmail.com)</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Your Full Name <span className="text-accent">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Mercer"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background-tertiary border border-border text-text-primary text-xs focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Your Email Address <span className="text-accent">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background-tertiary border border-border text-text-primary text-xs focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>

                  {/* What do you want to build? (Dropdown) */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>What do you want me to develop? <span className="text-accent">*</span></span>
                      <span className="text-[10px] font-mono text-emerald-400 font-normal">Primary Platform</span>
                    </label>
                    <div className="relative">
                      <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value as ProjectType)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background-tertiary border border-border text-text-primary text-xs focus:outline-none focus:border-accent appearance-none transition-colors cursor-pointer"
                      >
                        <option value="both">Both (Mobile App & Modern Web Platform Suite)</option>
                        <option value="mobile-app">Mobile App (iOS & Android — Native Kotlin/Swift or Flutter)</option>
                        <option value="website">Website / Modern Web Application (React, Next.js, SPA, Full-Stack)</option>
                        <option value="custom-tool">Privacy-First / Local-First Developer Tool or Desktop App</option>
                        <option value="backend-api">High-Scale Backend, API Architecture & Mobile Proxy</option>
                        <option value="other">Something Else (Custom Idea / Technical Consultation)</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Budget & Timeline Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Estimated Budget Range
                      </label>
                      <div className="relative">
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-background-tertiary border border-border text-text-primary text-xs focus:outline-none focus:border-accent appearance-none transition-colors cursor-pointer"
                        >
                          <option value="< $1,500 (Small Tool / MVP / Code Review)">&lt; $1,500 (Small Tool / MVP / Code Review)</option>
                          <option value="$1,500 – $5,000 (Standard MVP / App)">$1,500 – $5,000 (Standard Production App / Web)</option>
                          <option value="$5,000 – $15,000 (Comprehensive Cross-Platform Platform)">$5,000 – $15,000 (Comprehensive Cross-Platform Platform)</option>
                          <option value="$15,000+ (Enterprise / Scaled Architecture)">$15,000+ (Enterprise / Scaled Architecture)</option>
                          <option value="Flexible / Need Technical Consultation & Estimate">Flexible / Need Consultation & Estimate</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                          ▼
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                        Target Timeline
                      </label>
                      <div className="relative">
                        <select
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-background-tertiary border border-border text-text-primary text-xs focus:outline-none focus:border-accent appearance-none transition-colors cursor-pointer"
                        >
                          <option value="Immediate (< 1 month)">Immediate (&lt; 1 month)</option>
                          <option value="1 to 3 months">1 to 3 months</option>
                          <option value="3 to 6 months">3 to 6 months</option>
                          <option value="Flexible / Exploring concepts">Flexible / Exploring concepts</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone / Alternate Handle (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                      Phone / WhatsApp / Telegram / LinkedIn <span className="text-text-muted font-normal">(Optional for faster communication)</span>
                    </label>
                    <input
                      type="text"
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value)}
                      placeholder="+1 (555) 000-0000 or @telegram_handle"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background-tertiary border border-border text-text-primary text-xs focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  {/* Detailed Requirements Textarea */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Detailed Breakout of Your Idea <span className="text-accent">*</span></span>
                      <span className="text-[10px] text-text-muted">Core features, user flows, reference links</span>
                    </label>
                    <textarea
                      rows={5}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      required
                      placeholder="Please share what you want to create:
• What core problem does your app or website solve?
• Key features needed (e.g. auth, payment, push notifications, offline storage, API integrations)?
• Do you have existing designs, APIs, or reference apps?
• Any specific technical preferences or constraints?"
                      className="w-full p-3.5 rounded-xl bg-background-tertiary border border-border text-text-primary text-xs focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed font-sans"
                    />
                  </div>

                  {/* Form Action Controls */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching to rjnarwal@gmail.com...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Requirements & Request Quote</span>
                        </>
                      )}
                    </button>

                    <a
                      href={generateMailtoUrl()}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-background-tertiary hover:bg-background-elevated text-text-secondary hover:text-text-primary border border-border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                      title="Prefill into your mail app"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Or Open in Email Client</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-text-muted text-center flex items-center justify-center space-x-1 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>All inquiries deliver directly to <strong className="text-text-secondary">rjnarwal@gmail.com</strong>. Zero spam, 100% confidential.</span>
                  </p>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: DIRECT EMAIL CLIENT */}
          {activeTab === 'email' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-background-tertiary border border-border/80 flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-heading font-bold text-text-primary">
                    Prefer Composing in Your Own Mail App?
                  </h4>
                  <p className="text-text-secondary leading-relaxed">
                    Click the button below to launch Apple Mail, Outlook, Gmail, or your system default email client with a structured quote inquiry pre-filled and addressed to <strong className="text-text-primary font-mono font-semibold">rjnarwal@gmail.com</strong>.
                  </p>
                </div>
              </div>

              {/* Quick Type Selector for Customizing Email */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Quick Select Project Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).slice(0, 6).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProjectType(type)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        projectType === type
                          ? 'bg-accent/15 border-accent text-accent font-bold'
                          : 'bg-background-tertiary border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div className="font-semibold truncate">
                        {type === 'mobile-app' && '📱 Mobile App'}
                        {type === 'website' && '🌐 Website / Web'}
                        {type === 'both' && '⚡ Both (App & Web)'}
                        {type === 'custom-tool' && '🛠️ Developer Tool'}
                        {type === 'backend-api' && '⚙️ Backend & API'}
                        {type === 'other' && '💡 Other Idea'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={generateMailtoUrl()}
                  className="py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Launch Email Client (rjnarwal@gmail.com)</span>
                </a>

                <button
                  onClick={() => handleCopy(recipientEmail, 'email')}
                  className="py-3 px-4 rounded-xl bg-background-tertiary hover:bg-background-elevated text-text-primary border border-border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied rjnarwal@gmail.com!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-text-muted" />
                      <span>Copy Email Address</span>
                    </>
                  )}
                </button>
              </div>

              {/* Template Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-text-muted font-bold uppercase tracking-wider">
                  <span>Pre-Filled Message Template:</span>
                  <button
                    onClick={() => handleCopy(emailTemplateText, 'template')}
                    className="flex items-center space-x-1 text-accent hover:underline lowercase font-normal"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>copy template</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-background-primary border border-border font-mono text-[11px] text-text-secondary leading-relaxed overflow-x-auto whitespace-pre-wrap select-text">
                  {emailTemplateText}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHARE & QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-6 text-center animate-in fade-in duration-150">
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="font-heading font-extrabold text-base sm:text-lg text-text-primary">
                  Scan or Share Requirements Link
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Open this link or scan the QR code to launch the Project Quote modal directly from any mobile or desktop browser without navigating menus.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="inline-block p-4 sm:p-5 rounded-3xl bg-background-tertiary border-2 border-border shadow-2xl relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Grassroot Digital Project Quote QR Code"
                    className="w-52 h-52 sm:w-60 sm:h-60 mx-auto rounded-xl object-contain shadow-inner"
                  />
                ) : (
                  <div className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                  </div>
                )}
                <div className="mt-3 text-[11px] font-mono font-bold text-emerald-400">
                  https://grassroot.digital/#quote
                </div>
              </div>

              {/* Direct Link Copy & Action Buttons */}
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-background-tertiary border border-border">
                  <input
                    type="text"
                    readOnly
                    value={targetUrl}
                    className="flex-1 px-3 py-1.5 bg-transparent text-xs font-mono text-text-primary focus:outline-none select-all"
                  />
                  <button
                    onClick={() => handleCopy(targetUrl, 'url')}
                    className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleDownloadQr}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-background-tertiary hover:bg-background-elevated text-text-primary border border-border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download QR Image</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-background-tertiary hover:bg-background-elevated text-text-primary border border-border text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Share With Others</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-border bg-background-secondary/80 flex items-center justify-between text-xs text-text-muted shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Response within 24–48 hours</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-background-tertiary text-text-secondary hover:text-text-primary font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
