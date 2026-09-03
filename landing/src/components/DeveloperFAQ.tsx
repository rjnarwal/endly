import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck, Zap, KeyRound, FileCode2, ExternalLink } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'privacy' | 'endly' | 'tokenlens' | 'jsonlens';
  toolLink?: {
    name: string;
    url: string;
  };
}

const FAQS: FAQItem[] = [
  {
    category: 'endly',
    question: 'How is Endly different from Postman or Insomnia?',
    answer:
      'Unlike cloud-dependent API clients that sync your requests and secrets to remote databases, Endly is 100% local-first and zero-cloud. Your workspaces, environment variables, and auth tokens are stored strictly in your browser or local desktop filesystem. Additionally, Endly includes a built-in Wi-Fi Mobile Interceptor to capture live HTTP/HTTPS traffic from physical iOS & Android devices without installing separate bulky proxy software.',
    toolLink: {
      name: 'Launch Endly API Client ↗',
      url: 'https://endly.grassroot.digital',
    },
  },
  {
    category: 'endly',
    question: 'How does Endly intercept mobile HTTP/HTTPS traffic over Wi-Fi?',
    answer:
      'Endly runs a lightweight, native local proxy daemon on your machine. By setting your Android or iOS device Wi-Fi proxy to your computer’s local IP address (e.g. 192.168.1.X:8080) and downloading the self-signed CA certificate from Endly’s dashboard, you can inspect, filter, and mock mobile app API traffic in real time directly from your Endly workspace.',
    toolLink: {
      name: 'Open Mobile Interceptor in Endly ↗',
      url: 'https://endly.grassroot.digital',
    },
  },
  {
    category: 'tokenlens',
    question: 'Is TokenLens safe for inspecting production JWTs and private keys?',
    answer:
      'Yes, 100%. TokenLens runs entirely in client-side browser memory using the W3C WebCrypto API (window.crypto.subtle). Your JWT tokens, RSA/ECDSA private keys, and HMAC secret keys are never transmitted over the network or logged anywhere. You can verify RS256, HS256, and ES256 signatures completely offline.',
    toolLink: {
      name: 'Launch TokenLens JWT Studio ↗',
      url: 'https://tokenlens.grassroot.digital',
    },
  },
  {
    category: 'tokenlens',
    question: 'What features does TokenLens provide beyond basic base64 decoding?',
    answer:
      'TokenLens includes live countdown timers for exp, iat, and nbf claims, timezone conversions (Local vs UTC), an interactive RFC 7519 claim dictionary, two-way payload and header editing with instant re-signing, and side-by-side visual diff comparison between refreshed or modified tokens.',
    toolLink: {
      name: 'Try TokenLens JWT Studio ↗',
      url: 'https://tokenlens.grassroot.digital',
    },
  },
  {
    category: 'jsonlens',
    question: 'How does JSONLens perform semantic JSON diffing?',
    answer:
      'JSONLens parses and structures JSON payloads into semantic trees rather than doing raw character matching. This means it can ignore insignificant key ordering differences, sort keys alphabetically, and cleanly highlight true added, removed, or modified fields with line-by-line colored diff markers and summary metrics.',
    toolLink: {
      name: 'Launch JSONLens Diff & Studio ↗',
      url: 'https://jsonlens.grassroot.digital',
    },
  },
  {
    category: 'jsonlens',
    question: 'Can JSONLens generate TypeScript interfaces and Go structs from JSON?',
    answer:
      'Yes. JSONLens includes an integrated Type Generator that instantly converts raw JSON into type-safe TypeScript interfaces (with nested models and array support) or idiomatic Go structs (complete with `json:"..."` tags). You can copy or download the generated code in one click.',
    toolLink: {
      name: 'Try JSON Formatter & Type Generator ↗',
      url: 'https://jsonlens.grassroot.digital',
    },
  },
  {
    category: 'privacy',
    question: 'What does "Zero-Cloud & 100% Local" mean for the Grassroot Digital suite?',
    answer:
      'It means our tools contain zero tracking analytics, zero remote database sync, and zero cloud telemetry. All cryptographic computations, proxy servers, formatting routines, and workspace data reside strictly on your local machine and within your browser memory.',
  },
];

export const DeveloperFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-background-secondary/40 border-t border-border select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold tracking-wide uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Developer Knowledge Base & FAQ</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-text-primary">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="text-base text-text-secondary">
            Everything you need to know about our privacy architecture, offline tooling, and mobile engineering platform.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-2xl bg-background-secondary border border-border hover:border-accent/40 transition-all overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 transition-colors"
                >
                  <span className="font-heading font-bold text-sm sm:text-base text-text-primary">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                      isOpen
                        ? 'bg-accent text-white border-accent'
                        : 'bg-background-tertiary text-text-muted border-border'
                    }`}
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 space-y-4 text-text-secondary text-xs sm:text-sm leading-relaxed border-t border-border/40 pt-4 animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                    {faq.toolLink && (
                      <div>
                        <a
                          href={faq.toolLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 font-bold text-xs text-accent hover:underline"
                        >
                          <span>{faq.toolLink.name}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
