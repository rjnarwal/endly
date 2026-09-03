import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Terminal, Download } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import {
  generateCodeSnippet,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../../services/codeGenerator';

export const CodeSnippetModal: React.FC = () => {
  const { isSnippetModalOpen, closeSnippetModal, tabs, activeTabId } = useWorkspaceStore();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('curl');
  const [copied, setCopied] = useState(false);

  if (!isSnippetModalOpen) return null;

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const currentReq = activeTab?.request;

  const snippet = currentReq ? generateCodeSnippet(currentReq, selectedLang) : '// No active request';

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-background-elevated border border-border rounded-xl shadow-2xl w-full max-w-4xl h-[560px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-text">
              Code Snippet Generator - {currentReq?.name || 'Request'}
            </h2>
          </div>
          <button
            onClick={closeSnippetModal}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-background-tertiary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Left Languages Selector + Right Code Block */}
        <div className="flex flex-1 overflow-hidden">
          {/* Languages Sidebar */}
          <div className="w-60 border-r border-border bg-background-secondary p-3 flex flex-col space-y-1 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase text-text-muted px-2 py-1">
              Select Language
            </span>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  selectedLang === lang.id
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-text-secondary hover:bg-background-tertiary hover:text-text'
                }`}
              >
                <span>{lang.name}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col p-4 bg-background overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-mono text-text-muted uppercase">
                {SUPPORTED_LANGUAGES.find((l) => l.id === selectedLang)?.name}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Snippet'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto pt-3 font-mono text-xs text-text select-text">
              <pre className="p-4 rounded-lg bg-background-secondary border border-border leading-relaxed">
                {snippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
