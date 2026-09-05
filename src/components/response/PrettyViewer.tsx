import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronRight,
  WrapText,
  Search,
  X,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { UrlPreviewCard } from './UrlPreviewCard';

interface PrettyViewerProps {
  content: string;
  contentType?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export type SupportedLanguage = 'json' | 'xml' | 'html' | 'javascript' | 'text';

interface Token {
  type:
    | 'key'
    | 'string'
    | 'number'
    | 'boolean'
    | 'null'
    | 'punctuation'
    | 'tag'
    | 'attribute-name'
    | 'attribute-value'
    | 'comment'
    | 'plain';
  content: string;
  isUrl?: boolean;
}

interface ParsedLine {
  lineNumber: number;
  rawText: string;
  tokens: Token[];
  foldable: boolean;
}

interface HoverState {
  url: string;
  position: { x: number; y: number };
}

// Clean unquoted URL string
export const extractCleanUrl = (tokenContent: string): string => {
  let clean = tokenContent.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  // Unescape backslashes if escaped in JSON (e.g. \/ -> /)
  clean = clean.replace(/\\\//g, '/').replace(/\\"/g, '"');
  return clean.trim();
};

export const checkIsUrl = (str: string): boolean => {
  const unescaped = str.replace(/\\\//g, '/').trim();
  const unquoted = (unescaped.startsWith('"') && unescaped.endsWith('"')) || (unescaped.startsWith("'") && unescaped.endsWith("'"))
    ? unescaped.slice(1, -1)
    : unescaped;
  return /^https?:\/\/[^\s"'<>]+/i.test(unquoted.trim());
};

// Detect language from Content-Type or heuristics
export const detectLanguage = (contentType: string = '', content: string = ''): SupportedLanguage => {
  const ct = contentType.toLowerCase();
  if (ct.includes('json') || ct.includes('application/problem+json')) return 'json';
  if (ct.includes('xml') || ct.includes('application/soap+xml') || ct.includes('text/xml')) return 'xml';
  if (ct.includes('html') || ct.includes('text/html')) return 'html';
  if (ct.includes('javascript') || ct.includes('ecmascript')) return 'javascript';

  const trimmed = content.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // not json
    }
  }

  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    if (trimmed.toLowerCase().includes('<!doctype html') || trimmed.toLowerCase().includes('<html')) {
      return 'html';
    }
    return 'xml';
  }

  return 'text';
};

// Format XML / HTML
const formatXml = (xml: string): string => {
  try {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    const cleanXml = xml.replace(/>\s*</g, '><').trim();
    const parts = cleanXml.split(/(<[^>]+>)/g).filter(Boolean);

    for (const part of parts) {
      if (part.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        formatted += '\n' + tab.repeat(indent) + part;
      } else if (part.startsWith('<') && part.endsWith('/>')) {
        formatted += '\n' + tab.repeat(indent) + part;
      } else if (part.startsWith('<?') || part.startsWith('<!')) {
        formatted += (formatted ? '\n' : '') + tab.repeat(indent) + part;
      } else if (part.startsWith('<')) {
        formatted += (formatted ? '\n' : '') + tab.repeat(indent) + part;
        indent++;
      } else {
        const text = part.trim();
        if (text) {
          formatted += text;
        }
      }
    }
    return formatted || xml;
  } catch {
    return xml;
  }
};

// Tokenize a line of JSON
const tokenizeJsonLine = (line: string): Token[] => {
  const tokens: Token[] = [];
  const indentMatch = line.match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : '';

  if (indent) {
    tokens.push({ type: 'plain', content: indent });
  }

  let remaining = line.slice(indent.length);
  if (!remaining) return tokens;

  // Check if line starts with a JSON key: "key":
  const keyMatch = remaining.match(/^("(\\.|[^"\\])*")\s*:/);
  if (keyMatch) {
    const keyStr = keyMatch[1];
    tokens.push({ type: 'key', content: keyStr });
    tokens.push({ type: 'punctuation', content: ':' });
    remaining = remaining.slice(keyMatch[0].length);
  }

  // Tokenize remainder
  while (remaining.length > 0) {
    // 1. Whitespace
    const wsMatch = remaining.match(/^\s+/);
    if (wsMatch) {
      tokens.push({ type: 'plain', content: wsMatch[0] });
      remaining = remaining.slice(wsMatch[0].length);
      continue;
    }

    // 2. Strings
    const strMatch = remaining.match(/^"(\\.|[^"\\])*"/);
    if (strMatch) {
      const val = strMatch[0];
      const isUrl = checkIsUrl(val);
      tokens.push({ type: 'string', content: val, isUrl });
      remaining = remaining.slice(val.length);
      continue;
    }

    // 3. Numbers
    const numMatch = remaining.match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (numMatch && numMatch[0].length > 0) {
      tokens.push({ type: 'number', content: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // 4. Booleans
    const boolMatch = remaining.match(/^(true|false)\b/);
    if (boolMatch) {
      tokens.push({ type: 'boolean', content: boolMatch[0] });
      remaining = remaining.slice(boolMatch[0].length);
      continue;
    }

    // 5. Null
    const nullMatch = remaining.match(/^null\b/);
    if (nullMatch) {
      tokens.push({ type: 'null', content: 'null' });
      remaining = remaining.slice(4);
      continue;
    }

    // 6. Punctuation
    const punctMatch = remaining.match(/^[{}\[\],:]/);
    if (punctMatch) {
      tokens.push({ type: 'punctuation', content: punctMatch[0] });
      remaining = remaining.slice(1);
      continue;
    }

    // 7. Fallback single character
    tokens.push({ type: 'plain', content: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
};

// Tokenize a line of XML / HTML
const tokenizeXmlLine = (line: string): Token[] => {
  const tokens: Token[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    // 1. Comments
    if (remaining.startsWith('<!--')) {
      const endIdx = remaining.indexOf('-->');
      if (endIdx !== -1) {
        tokens.push({ type: 'comment', content: remaining.slice(0, endIdx + 3) });
        remaining = remaining.slice(endIdx + 3);
      } else {
        tokens.push({ type: 'comment', content: remaining });
        remaining = '';
      }
      continue;
    }

    // 2. Tag start
    const tagMatch = remaining.match(/^(<\/?[a-zA-Z0-9_:-]+)/);
    if (tagMatch) {
      const full = tagMatch[1];
      const isClosing = full.startsWith('</');
      tokens.push({ type: 'punctuation', content: isClosing ? '</' : '<' });
      tokens.push({ type: 'tag', content: isClosing ? full.slice(2) : full.slice(1) });
      remaining = remaining.slice(full.length);
      continue;
    }

    // 3. Tag end
    const endTagMatch = remaining.match(/^(\/?>)/);
    if (endTagMatch) {
      tokens.push({ type: 'punctuation', content: endTagMatch[1] });
      remaining = remaining.slice(endTagMatch[1].length);
      continue;
    }

    // 4. Attributes
    const attrMatch = remaining.match(/^([a-zA-Z0-9_:-]+)(\s*=\s*)(".*?"|'.*?'|[^\s>]+)?/);
    if (attrMatch && attrMatch[1]) {
      tokens.push({ type: 'attribute-name', content: attrMatch[1] });
      if (attrMatch[2]) {
        tokens.push({ type: 'punctuation', content: attrMatch[2] });
      }
      if (attrMatch[3]) {
        const attrVal = attrMatch[3];
        const isUrl = checkIsUrl(attrVal);
        tokens.push({ type: 'attribute-value', content: attrVal, isUrl });
      }
      remaining = remaining.slice(attrMatch[0].length);
      continue;
    }

    // 5. Whitespace
    const wsMatch = remaining.match(/^\s+/);
    if (wsMatch) {
      tokens.push({ type: 'plain', content: wsMatch[0] });
      remaining = remaining.slice(wsMatch[0].length);
      continue;
    }

    // 6. Text content
    const nextTag = remaining.indexOf('<');
    if (nextTag !== -1) {
      const textPiece = remaining.slice(0, nextTag);
      const isUrl = checkIsUrl(textPiece);
      tokens.push({ type: 'plain', content: textPiece, isUrl });
      remaining = remaining.slice(nextTag);
    } else {
      const isUrl = checkIsUrl(remaining);
      tokens.push({ type: 'plain', content: remaining, isUrl });
      remaining = '';
    }
  }

  return tokens;
};

// Render Token with custom color classes & URL hover triggers
const renderToken = (
  token: Token,
  tokenIdx: number,
  searchQuery: string = '',
  onUrlMouseEnter?: (url: string, e: React.MouseEvent) => void,
  onUrlMouseLeave?: () => void
) => {
  const { type, content, isUrl } = token;

  // Search match highlight
  let renderedContent: React.ReactNode = content;
  if (searchQuery.trim() && content.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
    const query = searchQuery.trim();
    const parts = content.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    renderedContent = parts.map((part, pIdx) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={pIdx}
          className="bg-amber-400/40 text-amber-100 font-bold border-b border-amber-400 px-0.5 rounded-sm select-text"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  // Handle URL Hover Preview
  if (isUrl) {
    const cleanUrl = extractCleanUrl(content);
    return (
      <span
        key={tokenIdx}
        onMouseEnter={(e) => onUrlMouseEnter && onUrlMouseEnter(cleanUrl, e)}
        onMouseOver={(e) => onUrlMouseEnter && onUrlMouseEnter(cleanUrl, e)}
        onPointerEnter={(e) => onUrlMouseEnter && onUrlMouseEnter(cleanUrl, e)}
        onMouseLeave={() => onUrlMouseLeave && onUrlMouseLeave()}
        onPointerLeave={() => onUrlMouseLeave && onUrlMouseLeave()}
        className="text-emerald-400 underline decoration-emerald-500/50 hover:decoration-emerald-300 hover:text-emerald-300 cursor-pointer transition-colors"
        title={`Hover to glimpse: ${cleanUrl}`}
        data-url-token={cleanUrl}
      >
        {renderedContent}
      </span>
    );
  }

  let colorClasses = '';
  switch (type) {
    case 'key':
      colorClasses = 'text-sky-400 font-medium';
      break;
    case 'string':
      colorClasses = 'text-emerald-400';
      break;
    case 'number':
      colorClasses = 'text-amber-400 font-semibold';
      break;
    case 'boolean':
      colorClasses = 'text-purple-400 font-bold';
      break;
    case 'null':
      colorClasses = 'text-rose-400 font-semibold italic';
      break;
    case 'punctuation':
      colorClasses = 'text-slate-400';
      break;
    case 'tag':
      colorClasses = 'text-sky-400 font-semibold';
      break;
    case 'attribute-name':
      colorClasses = 'text-amber-400 font-medium';
      break;
    case 'attribute-value':
      colorClasses = 'text-emerald-400';
      break;
    case 'comment':
      colorClasses = 'text-slate-500 italic';
      break;
    default:
      colorClasses = 'text-text';
      break;
  }

  return (
    <span key={tokenIdx} className={colorClasses}>
      {renderedContent}
    </span>
  );
};

export const PrettyViewer: React.FC<PrettyViewerProps> = ({
  content,
  contentType = 'application/json',
  searchQuery = '',
  onSearchChange,
}) => {
  const [wrapLines, setWrapLines] = useState(false);
  const [languageOverride, setLanguageOverride] = useState<SupportedLanguage | 'auto'>('auto');
  const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Hover Preview State for URLs
  const [hoverPreview, setHoverPreview] = useState<HoverState | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const effectiveSearch = searchQuery || localSearch;

  // Language detection
  const detectedLang = useMemo(() => detectLanguage(contentType, content), [contentType, content]);
  const activeLanguage = languageOverride === 'auto' ? detectedLang : languageOverride;

  // Formatted content
  const formattedContent = useMemo(() => {
    if (!content) return '';
    if (activeLanguage === 'json') {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        return JSON.stringify(parsed, null, 2);
      } catch {
        return content;
      }
    }
    if (activeLanguage === 'xml' || activeLanguage === 'html') {
      return formatXml(content);
    }
    return content;
  }, [content, activeLanguage]);

  // Parse lines
  const parsedLines: ParsedLine[] = useMemo(() => {
    if (!formattedContent) return [];
    const rawLines = formattedContent.split('\n');

    return rawLines.map((rawLine, idx) => {
      const lineNum = idx + 1;
      let tokens: Token[] = [];

      if (activeLanguage === 'json') {
        tokens = tokenizeJsonLine(rawLine);
      } else if (activeLanguage === 'xml' || activeLanguage === 'html') {
        tokens = tokenizeXmlLine(rawLine);
      } else {
        tokens = [{ type: 'plain', content: rawLine }];
      }

      const trimmed = rawLine.trim();
      const foldable =
        trimmed.endsWith('{') ||
        trimmed.endsWith('[') ||
        trimmed.endsWith('{,') ||
        trimmed.endsWith('[,') ||
        (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>'));

      return {
        lineNumber: lineNum,
        rawText: rawLine,
        tokens,
        foldable,
      };
    });
  }, [formattedContent, activeLanguage]);

  // Calculate folding ranges for JSON
  const foldRanges = useMemo(() => {
    const map = new Map<number, number>(); // startLineIndex -> endLineIndex
    if (activeLanguage !== 'json') return map;

    const stack: { char: string; lineIndex: number }[] = [];

    parsedLines.forEach((line, idx) => {
      const raw = line.rawText;
      for (let c = 0; c < raw.length; c++) {
        const ch = raw[c];
        if (ch === '{' || ch === '[') {
          stack.push({ char: ch, lineIndex: idx });
        } else if (ch === '}' || ch === ']') {
          const matchingOpen = ch === '}' ? '{' : '[';
          if (stack.length > 0 && stack[stack.length - 1].char === matchingOpen) {
            const top = stack.pop()!;
            if (top.lineIndex !== idx) {
              map.set(top.lineIndex, idx);
            }
          }
        }
      }
    });

    return map;
  }, [parsedLines, activeLanguage]);

  const toggleFold = (lineIndex: number) => {
    setCollapsedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineIndex)) {
        next.delete(lineIndex);
      } else {
        next.add(lineIndex);
      }
      return next;
    });
  };

  const collapseAll = () => {
    const allFoldable = new Set<number>();
    foldRanges.forEach((_, startIdx) => {
      allFoldable.add(startIdx);
    });
    setCollapsedLines(allFoldable);
  };

  const expandAll = () => {
    setCollapsedLines(new Set());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedContent || content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // URL Hover Handlers
  const handleUrlMouseEnter = (url: string, e: React.MouseEvent) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoverPreview({
        url,
        position: { x: rect.left, y: rect.bottom },
      });
    }, 60);
  };

  const handleUrlMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setHoverPreview(null);
    }, 350);
  };

  const handleCardMouseEnter = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setHoverPreview(null);
    }, 220);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Compute hidden lines based on folded blocks
  const hiddenLines = useMemo(() => {
    const hidden = new Set<number>();
    collapsedLines.forEach((startIdx) => {
      const endIdx = foldRanges.get(startIdx);
      if (endIdx !== undefined) {
        for (let i = startIdx + 1; i <= endIdx; i++) {
          hidden.add(i);
        }
      }
    });
    return hidden;
  }, [collapsedLines, foldRanges]);

  // Flat list of visible lines
  const visibleLines = useMemo(() => {
    const list: { line: ParsedLine; originalIdx: number }[] = [];
    for (let i = 0; i < parsedLines.length; i++) {
      if (!hiddenLines.has(i)) {
        list.push({ line: parsedLines[i], originalIdx: i });
      }
    }
    return list;
  }, [parsedLines, hiddenLines]);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let frameId: number | null = null;
    const handleScroll = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setScrollTop(container.scrollTop);
      });
    };

    const updateHeight = () => {
      if (container.clientHeight > 0) {
        setContainerHeight(container.clientHeight);
      }
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  const LINE_HEIGHT = 20;
  const OVERSCAN = 30;
  const totalLines = visibleLines.length;

  const isVirtualized = totalLines > 80 && !wrapLines;
  const startIndex = isVirtualized ? Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - OVERSCAN) : 0;
  const endIndex = isVirtualized
    ? Math.min(totalLines, Math.ceil((scrollTop + containerHeight) / LINE_HEIGHT) + OVERSCAN)
    : totalLines;

  const topSpacerHeight = isVirtualized ? startIndex * LINE_HEIGHT : 0;
  const bottomSpacerHeight = isVirtualized ? (totalLines - endIndex) * LINE_HEIGHT : 0;

  const renderedLines = isVirtualized ? visibleLines.slice(startIndex, endIndex) : visibleLines;

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-text-muted text-xs">
        <Sparkles className="w-6 h-6 mb-2 opacity-50" />
        <span>No content to display</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-md border border-border overflow-hidden font-mono text-xs shadow-sm relative">
      {/* Pretty Viewer Sub-Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-background-secondary border-b border-border text-text-secondary select-none">
        {/* Left: Language Indicator & Line Count */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-semibold text-text-muted">Type:</span>
            <select
              value={languageOverride}
              onChange={(e) => setLanguageOverride(e.target.value as any)}
              className="bg-background-tertiary border border-border text-text text-[11px] font-sans rounded px-2 py-0.5 focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="auto">Auto ({detectedLang.toUpperCase()})</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="html">HTML</option>
              <option value="text">Plain Text</option>
            </select>
          </div>

          <span className="text-[11px] text-text-muted font-sans border-l border-border/70 pl-2.5">
            {parsedLines.length} {parsedLines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Fold / Unfold All */}
          {foldRanges.size > 0 && (
            <div className="flex items-center space-x-1 border-r border-border/70 pr-1.5">
              <button
                onClick={collapseAll}
                title="Collapse all objects"
                className="p-1 rounded hover:bg-background-elevated text-text-secondary hover:text-text text-[11px] transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={expandAll}
                title="Expand all objects"
                className="p-1 rounded hover:bg-background-elevated text-text-secondary hover:text-text text-[11px] transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search in response"
            className={`p-1 rounded text-[11px] transition-colors ${
              showSearch || effectiveSearch
                ? 'bg-accent/15 text-accent'
                : 'hover:bg-background-elevated text-text-secondary hover:text-text'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Line Wrap Toggle */}
          <button
            onClick={() => setWrapLines(!wrapLines)}
            title={wrapLines ? 'Disable line wrap' : 'Enable line wrap'}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
              wrapLines
                ? 'bg-accent/15 text-accent font-medium'
                : 'hover:bg-background-elevated text-text-secondary hover:text-text'
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wrap</span>
          </button>

          {/* Copy Formatted Code */}
          <button
            onClick={handleCopy}
            title="Copy Formatted Response"
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-background-elevated text-text-secondary hover:text-text text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Inline Search Bar */}
      {showSearch && (
        <div className="flex items-center px-3 py-1 bg-background-elevated border-b border-border space-x-2">
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search within formatted response..."
            className="flex-1 bg-transparent text-text text-xs focus:outline-none placeholder:text-text-muted"
            autoFocus
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="text-text-muted hover:text-text p-0.5"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Code Body with Synchronized Gutter & Virtualized Syntax Highlighted Spans */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto bg-background p-0 select-text font-mono text-[12px] leading-5"
      >
        <div className="min-w-full">
          {topSpacerHeight > 0 && <div style={{ height: `${topSpacerHeight}px` }} />}

          {renderedLines.map(({ line, originalIdx }) => {
            const isFoldable = foldRanges.has(originalIdx);
            const isCollapsed = collapsedLines.has(originalIdx);
            const endIdx = foldRanges.get(originalIdx);

            return (
              <div
                key={line.lineNumber}
                className="flex items-start hover:bg-background-tertiary/25 transition-colors group"
                style={{ minHeight: `${LINE_HEIGHT}px` }}
              >
                {/* Line Gutter */}
                <div className="flex items-center justify-end select-none w-12 pl-1 pr-2 py-0 bg-background-secondary/40 text-text-muted/50 text-[11px] shrink-0 border-r border-border/40 font-mono sticky left-0 z-10 space-x-0.5">
                  {isFoldable ? (
                    <button
                      onClick={() => toggleFold(originalIdx)}
                      className="p-0.5 hover:text-accent text-text-muted/60 rounded transition-colors focus:outline-none"
                      title={isCollapsed ? 'Expand block' : 'Collapse block'}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-accent" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  ) : (
                    <span className="w-3 inline-block" />
                  )}
                  <span className="min-w-[20px] text-right">{line.lineNumber}</span>
                </div>

                {/* Line Tokens */}
                <div
                  className={`flex-1 pl-3 pr-4 py-0 font-mono text-[12px] leading-5 select-text ${
                    wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                  }`}
                >
                  {line.tokens.map((token, tIdx) =>
                    renderToken(
                      token,
                      tIdx,
                      effectiveSearch,
                      handleUrlMouseEnter,
                      handleUrlMouseLeave
                    )
                  )}

                  {/* Collapsed Ellipsis Badge */}
                  {isCollapsed && endIdx !== undefined && (
                    <span
                      onClick={() => toggleFold(originalIdx)}
                      className="ml-1.5 px-1.5 py-0.5 bg-accent/20 text-accent hover:bg-accent/30 rounded text-[10px] cursor-pointer font-sans select-none inline-flex items-center space-x-1"
                      title="Click to expand"
                    >
                      <span>...</span>
                      <span className="text-[9px] opacity-75 font-mono">
                        ({endIdx - originalIdx} lines hidden)
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px` }} />}
        </div>
      </div>

      {/* URL Hover Glimpse Popover Portal */}
      {hoverPreview &&
        typeof document !== 'undefined' &&
        createPortal(
          <UrlPreviewCard
            url={hoverPreview.url}
            position={hoverPreview.position}
            onClose={() => setHoverPreview(null)}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          />,
          document.body
        )}
    </div>
  );
};
