import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Zap, Smartphone, Layers, Play, CheckCircle2, Lock, Terminal, Radio } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'How does Endly execute API requests directly from the browser without CORS restrictions?',
    answer: 'Endly executes direct HTTP/HTTPS requests through the browser Fetch API for CORS-enabled APIs. For internal APIs or legacy endpoints lacking permissive CORS headers, Endly includes a lightweight local proxy dispatcher option and native desktop runtime dispatchers (Electron & Tauri) that bypass CORS entirely.',
  },
  {
    question: 'How does the Mobile Wi-Fi Proxy Interceptor capture iOS and Android traffic?',
    answer: 'Endly\'s built-in proxy engine listens on your local machine network interface (e.g. port 8088). By setting your physical iPhone or Android device Wi-Fi HTTP proxy to your computer\'s local IP, all outgoing app traffic is intercepted, decrypted with a local SSL certificate, and populated live into your Endly request inspector.',
  },
  {
    question: 'Are my authentication tokens, private API keys, and environment variables stored in the cloud?',
    answer: 'No. Endly follows a strict zero-cloud architecture. All collections, environment variables, Bearer tokens, and request history are stored strictly in your browser\'s local IndexedDB / localStorage storage. There is zero cloud telemetry.',
  },
  {
    question: 'Can I import Postman collections and OpenAPI / Swagger specifications?',
    answer: 'Yes. Endly includes a one-click importer supporting Postman Collection v2.1 (JSON), OpenAPI 3.0, Swagger 2.0 specifications, and raw cURL commands.',
  },
  {
    question: 'Does Endly support automated collection testing with assertions?',
    answer: 'Yes. The Automated Collection Runner allows you to execute sequential request workflows with environment chaining (e.g. extracting an auth token from a login response and injecting it into subsequent requests), response time latency histograms, and status code assertions.',
  },
];

export const ApiClientKnowledgeBase: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="bg-background-secondary border-t border-border py-12 px-4 sm:px-6 lg:px-8 text-text select-text space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Overview & Core Benefits */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-orange-500 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Developer Documentation & Architecture</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text tracking-tight">
            Endly: Zero-Cloud Web API Client & Mobile Proxy Interceptor
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-4xl">
            Engineered as a privacy-first, lightning-fast alternative to bloated SaaS API tools, <strong className="text-text">Endly</strong> provides full REST, GraphQL, WebSocket, and SSE debugging capabilities running 100% locally with zero cloud telemetry.
          </p>
        </div>

        {/* 3 Core Capability Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-background-tertiary p-6 border border-border shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-mono font-bold text-xs border border-orange-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-text">Mobile Wi-Fi Proxy</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Intercept, inspect, and live-mock HTTP/HTTPS traffic from physical iOS and Android devices over local Wi-Fi.
            </p>
          </div>

          <div className="rounded-2xl bg-background-tertiary p-6 border border-border shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-xs border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-text">Cascading Environments</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Global and workspace environment scopes with instant <code className="font-mono text-[11px] text-orange-400">{"{{variable}}"}</code> dynamic substitution.
            </p>
          </div>

          <div className="rounded-2xl bg-background-tertiary p-6 border border-border shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold text-xs border border-blue-500/20">
              <Play className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-text">Automated Runner</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Execute multi-request test suites with assertion checks, real-time latency graphs, and exportable reports.
            </p>
          </div>
        </div>

        {/* Deep Dive: Privacy & Local Storage */}
        <div className="rounded-3xl bg-background-tertiary border border-border p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-text">
                Why Zero-Cloud API Development Matters
              </h3>
              <p className="text-xs text-text-muted">
                Keep proprietary enterprise endpoints and credentials strictly on your machine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-text-secondary leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-bold text-text text-sm flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Local Browser IndexedDB Storage</span>
              </h4>
              <p>
                Unlike cloud-first API clients that synchronize your private production bearer tokens, database credentials, and secret headers to remote databases, Endly stores all collections locally in IndexedDB.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-text text-sm flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Account Requirement</span>
              </h4>
              <p>
                Start building and testing immediately with zero mandatory logins, cloud workspace limits, or tracking scripts.
              </p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-orange-500 text-xs font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-text tracking-tight">
            Endly FAQ & Developer Guide
          </h2>

          <div className="space-y-3 pt-2">
            {FAQ_DATA.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-background-tertiary border border-border overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-bold text-text hover:text-orange-400 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-orange-400 shrink-0 ml-3" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted shrink-0 ml-3" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-4 text-xs text-text-secondary leading-relaxed border-t border-border/40 pt-3">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info in knowledge base */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-text">Endly by Grassroot Digital</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">100% Client-Side API Studio</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <a href="https://grassroot.digital" className="text-text-secondary hover:text-orange-400 transition-colors">
              Grassroot Digital Home
            </a>
            <a href="https://grassroot.digital/jwt-decoder" className="text-text-secondary hover:text-purple-400 transition-colors">
              TokenLens (JWT)
            </a>
            <a href="https://grassroot.digital/json-diff" className="text-text-secondary hover:text-cyan-400 transition-colors">
              JSONLens (Diff)
            </a>
            <a href="https://grassroot.digital/regex-tester" className="text-text-secondary hover:text-emerald-400 transition-colors">
              RegexForge
            </a>
            <a href="https://grassroot.digital/hash-generator" className="text-text-secondary hover:text-pink-400 transition-colors">
              CipherLab
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
