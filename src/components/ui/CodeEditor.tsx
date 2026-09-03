import React, { useState, useRef } from 'react';
import { Copy, Check, Wand2, Search } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'json' | 'xml' | 'javascript' | 'html' | 'text' | 'graphql';
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  showLineNumbers?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'json',
  placeholder = '',
  readOnly = false,
  minHeight = '180px',
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = (value || '').split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFormat = () => {
    if (language === 'json') {
      try {
        const parsed = JSON.parse(value);
        onChange(JSON.stringify(parsed, null, 2));
      } catch {
        // Invalid JSON, leave as is
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="relative flex flex-col w-full border border-border rounded-md bg-background-secondary overflow-hidden font-mono text-xs">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-background-tertiary border-b border-border text-text-secondary select-none">
        <div className="flex items-center space-x-2">
          <span className="uppercase text-[10px] font-semibold tracking-wider text-text-muted">
            {language}
          </span>
          <span className="text-[10px] text-text-muted">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {language === 'json' && !readOnly && (
            <button
              onClick={handleFormat}
              title="Prettify / Format JSON"
              className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-background-elevated text-text-secondary hover:text-text transition-colors"
            >
              <Wand2 className="w-3 h-3 text-accent" />
              <span className="text-[11px]">Format</span>
            </button>
          )}

          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search"
            className="p-1 rounded hover:bg-background-elevated text-text-secondary hover:text-text transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            title="Copy Code"
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-background-elevated text-text-secondary hover:text-text transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Inline Search Bar */}
      {showSearch && (
        <div className="flex items-center px-3 py-1 bg-background-elevated border-b border-border space-x-2">
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find in editor..."
            className="flex-1 bg-transparent text-text text-xs focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <span className="text-[10px] text-text-muted">
              {lines.filter((l) => l.toLowerCase().includes(searchQuery.toLowerCase())).length} matches
            </span>
          )}
        </div>
      )}

      {/* Editor Body */}
      <div className="flex flex-1 relative overflow-auto" style={{ minHeight }}>
        {/* Line Numbers */}
        {showLineNumbers && (
          <div className="py-2.5 px-2.5 text-right select-none bg-background-tertiary/40 border-r border-border/50 text-text-muted text-[11px] font-mono leading-5">
            {lines.map((_, i) => (
              <div key={i} className="editor-line-number">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          className="flex-1 p-2.5 bg-transparent text-text resize-none focus:outline-none font-mono text-xs leading-5 whitespace-pre tab-size-2"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
};
