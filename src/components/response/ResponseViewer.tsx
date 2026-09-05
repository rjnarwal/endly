import React, { useState, useRef } from 'react';
import {
  Copy,
  Check,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  FileText,
  Eye,
  Layers,
  Search,
  Sparkles,
  Info,
  Cookie as CookieIcon,
  BarChart2,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { ResponseData, TestResultSummary, TabItem } from '../../types';
import { PrettyViewer } from './PrettyViewer';

export const ResponseViewer: React.FC = () => {
  const { tabs, activeTabId, setTabResponseTab } = useWorkspaceStore();

  const [copied, setCopied] = useState(false);
  const [jsonPathQuery, setJsonPathQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const RESPONSE_SUBTABS: TabItem['activeResponseTab'][] = [
    'pretty',
    'raw',
    'preview',
    'headers',
    'cookies',
    'tests',
    'timings',
  ];

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || !activeTab) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIdx = RESPONSE_SUBTABS.indexOf(activeTab.activeResponseTab);
      if (deltaX < 0 && currentIdx < RESPONSE_SUBTABS.length - 1) {
        setTabResponseTab(activeTab.id, RESPONSE_SUBTABS[currentIdx + 1]);
      } else if (deltaX > 0 && currentIdx > 0) {
        setTabResponseTab(activeTab.id, RESPONSE_SUBTABS[currentIdx - 1]);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) return null;

  const { response, testResults, isLoading, activeResponseTab = 'pretty' } = activeTab;

  const handleCopyBody = () => {
    if (response?.body) {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    if (!response) return;
    const isJson = response.contentType.includes('json');
    const isXml = response.contentType.includes('xml');
    const ext = isJson ? 'json' : isXml ? 'xml' : 'txt';
    const blob = new Blob([response.body], { type: response.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format byte size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format JSON or apply JSONPath
  let formattedJson: string | null = null;
  let isJson = false;
  if (response?.body) {
    try {
      const parsed = JSON.parse(response.body);
      isJson = true;
      if (jsonPathQuery.trim()) {
        try {
          // Simple JSON path expression evaluator
          const cleanQuery = jsonPathQuery.trim().replace(/^\$\.?/, '');
          const parts = cleanQuery.split('.');
          let current = parsed;
          for (const p of parts) {
            if (p) current = current[p];
          }
          formattedJson = JSON.stringify(current, null, 2);
        } catch {
          formattedJson = JSON.stringify(parsed, null, 2);
        }
      } else {
        formattedJson = JSON.stringify(parsed, null, 2);
      }
    } catch {
      formattedJson = null;
    }
  }

  // Determine status style
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (status >= 300 && status < 400) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (status >= 400 && status < 500) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-secondary/30 select-none">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <span className="text-sm font-medium text-text">Sending request...</span>
          <span className="text-xs text-text-muted">Waiting for response</span>
        </div>
      </div>
    );
  }

  // No Response State
  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-secondary/30 text-text-muted select-none">
        <div className="flex flex-col items-center space-y-2 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-background-tertiary flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-text-muted" />
          </div>
          <h4 className="text-sm font-semibold text-text">No Response Yet</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Click <strong>Send</strong> or press <kbd className="px-1.5 py-0.5 rounded bg-background-tertiary font-mono text-[10px] text-text">Cmd/Ctrl + Enter</kbd> to execute this request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-full bg-background select-none overflow-hidden"
    >
      {/* Top Response Metrics Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-background-secondary border-b border-border">
        {/* Status Pill */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(
              response.status
            )}`}
          >
            <span>{response.status || 'ERR'}</span>
            <span className="font-medium text-[11px]">{response.statusText}</span>
          </div>

          {/* Time & Size */}
          <div className="flex items-center space-x-3 text-xs text-text-secondary">
            <span className="flex items-center space-x-1" title="Response Latency">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span className="font-mono">{response.timeMs} ms</span>
            </span>

            <span className="flex items-center space-x-1" title="Response Size">
              <HardDrive className="w-3.5 h-3.5 text-text-muted" />
              <span className="font-mono">{formatSize(response.sizeBytes)}</span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopyBody}
            className="flex items-center space-x-1 px-2 py-1 rounded text-xs text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors"
            title="Copy Response Body"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors"
            title="Download Response File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Response Subtabs */}
      <div className="flex items-center justify-between px-3 border-b border-border bg-background-secondary/50 text-xs overflow-x-auto no-scrollbar shrink-0">
        <div className="flex space-x-1 shrink-0">
          <button
            onClick={() => setTabResponseTab(activeTab.id, 'pretty')}
            className={`py-1.5 px-3 border-b-2 font-medium transition-colors ${
              activeResponseTab === 'pretty'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            Pretty
          </button>

          <button
            onClick={() => setTabResponseTab(activeTab.id, 'raw')}
            className={`py-1.5 px-3 border-b-2 font-medium transition-colors ${
              activeResponseTab === 'raw'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            Raw
          </button>

          <button
            onClick={() => setTabResponseTab(activeTab.id, 'preview')}
            className={`py-1.5 px-3 border-b-2 font-medium transition-colors ${
              activeResponseTab === 'preview'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            Preview
          </button>

          <button
            onClick={() => setTabResponseTab(activeTab.id, 'headers')}
            className={`flex items-center space-x-1 py-1.5 px-3 border-b-2 font-medium transition-colors ${
              activeResponseTab === 'headers'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Headers</span>
            <span className="text-[10px] px-1 rounded bg-background-elevated text-text-muted">
              {Object.keys(response.headers || {}).length}
            </span>
          </button>

          <button
            onClick={() => setTabResponseTab(activeTab.id, 'cookies')}
            className={`flex items-center space-x-1 py-1.5 px-3 border-b-2 font-medium transition-colors ${
              activeResponseTab === 'cookies'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Cookies</span>
            {(response.cookies || []).length > 0 && (
              <span className="text-[10px] px-1 rounded bg-background-elevated text-text-muted">
                {response.cookies?.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTabResponseTab(activeTab.id, 'tests')}
            className={`flex items-center space-x-1.5 py-1.5 px-3 border-b-2 font-medium transition-colors ${
              activeResponseTab === 'tests'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <span>Test Results</span>
            {testResults && (
              <span
                className={`text-[10px] font-bold px-1.5 rounded-full ${
                  testResults.failed === 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {testResults.passed}/{testResults.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setTabResponseTab(activeTab.id, 'timings')}
            className={`py-1.5 px-3 border-b-2 font-medium transition-colors ${
              activeResponseTab === 'timings'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            Timings
          </button>
        </div>

        {/* JSONPath filter for pretty tab */}
        {activeResponseTab === 'pretty' && isJson && (
          <div className="flex items-center bg-background border border-border rounded px-2 py-0.5 space-x-1">
            <Search className="w-3 h-3 text-text-muted" />
            <input
              type="text"
              value={jsonPathQuery}
              onChange={(e) => setJsonPathQuery(e.target.value)}
              placeholder="JSONPath (e.g. users.0.name)"
              className="bg-transparent text-[11px] text-text placeholder:text-text-muted focus:outline-none w-36"
            />
            {jsonPathQuery && (
              <button
                onClick={() => setJsonPathQuery('')}
                className="text-[10px] text-text-muted hover:text-text"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Response Panel Body */}
      <div className={`flex-1 ${activeResponseTab === 'pretty' ? 'overflow-hidden p-1.5' : 'overflow-auto p-3'} font-mono text-xs`}>
        {/* 1. Pretty View */}
        {activeResponseTab === 'pretty' && (
          <div className="h-full w-full">
            <PrettyViewer
              content={formattedJson || response.body}
              contentType={response.contentType}
              searchQuery={jsonPathQuery}
            />
          </div>
        )}

        {/* 2. Raw View */}
        {activeResponseTab === 'raw' && (
          <pre className="text-text whitespace-pre-wrap leading-relaxed select-text font-mono">
            {response.body}
          </pre>
        )}

        {/* 3. Preview View */}
        {activeResponseTab === 'preview' && (
          <div className="w-full h-full bg-white rounded border border-border overflow-hidden">
            {response.contentType.includes('html') ? (
              <iframe
                title="Response HTML Preview"
                srcDoc={response.body}
                sandbox="allow-same-origin"
                className="w-full h-full border-none"
              />
            ) : response.contentType.includes('image') ? (
              <div className="flex items-center justify-center h-full p-4">
                <img
                  src={`data:${response.contentType};base64,${btoa(response.body)}`}
                  alt="Response preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="p-4 text-gray-800 font-sans text-xs">
                No visual preview available for content type: <code>{response.contentType}</code>
              </div>
            )}
          </div>
        )}

        {/* 4. Headers View */}
        {activeResponseTab === 'headers' && (
          <div className="border border-border rounded-md overflow-hidden bg-background-secondary">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-background-tertiary border-b border-border text-text-muted text-[11px]">
                  <th className="py-1.5 px-3 text-left font-medium w-1/3">Key</th>
                  <th className="py-1.5 px-3 text-left font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers || {}).map(([k, v], idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/40 hover:bg-background-tertiary/30 select-text"
                  >
                    <td className="py-1.5 px-3 font-semibold text-text">{k}</td>
                    <td className="py-1.5 px-3 text-text-secondary break-all">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Cookies View */}
        {activeResponseTab === 'cookies' && (
          <div className="border border-border rounded-md overflow-hidden bg-background-secondary">
            {(response.cookies || []).length === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs font-sans">
                No cookies returned in this response.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-background-tertiary border-b border-border text-text-muted text-[11px]">
                    <th className="py-1.5 px-3 text-left font-medium">Name</th>
                    <th className="py-1.5 px-3 text-left font-medium">Value</th>
                    <th className="py-1.5 px-3 text-left font-medium">Domain</th>
                    <th className="py-1.5 px-3 text-left font-medium">Path</th>
                    <th className="py-1.5 px-3 text-left font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {(response.cookies || []).map((c, idx) => (
                    <tr key={idx} className="border-b border-border/40 select-text">
                      <td className="py-1.5 px-3 font-semibold text-text">{c.name}</td>
                      <td className="py-1.5 px-3 text-text-secondary break-all">{c.value}</td>
                      <td className="py-1.5 px-3 text-text-muted">{c.domain || '/'}</td>
                      <td className="py-1.5 px-3 text-text-muted">{c.path || '/'}</td>
                      <td className="py-1.5 px-3 text-text-muted">{c.expires || 'Session'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 6. Test Results View */}
        {activeResponseTab === 'tests' && (
          <div className="flex flex-col space-y-3 font-sans">
            {!testResults || testResults.total === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs">
                No tests were written for this request. Add assertions in the <strong>Tests</strong> tab of the Request.
              </div>
            ) : (
              <>
                {/* Summary Card */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary border border-border">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        testResults.failed === 0 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-sm font-semibold text-text">
                      {testResults.failed === 0 ? 'All Tests Passed' : `${testResults.failed} Test(s) Failed`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span className="text-emerald-400 font-semibold">{testResults.passed} Passed</span>
                    <span className="text-rose-400 font-semibold">{testResults.failed} Failed</span>
                    <span className="text-text-muted">{testResults.total} Total</span>
                  </div>
                </div>

                {/* Assertions List */}
                <div className="flex flex-col space-y-1.5">
                  {testResults.assertions.map((ast, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start justify-between p-2.5 rounded-md border text-xs ${
                        ast.passed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-text'
                          : 'bg-rose-500/5 border-rose-500/20 text-text'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {ast.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-text">{ast.name}</span>
                          {ast.error && (
                            <span className="text-rose-400 font-mono text-[11px] mt-1 bg-rose-500/10 p-1.5 rounded">
                              {ast.error}
                            </span>
                          )}
                        </div>
                      </div>

                      {ast.durationMs !== undefined && (
                        <span className="text-[10px] text-text-muted font-mono">{ast.durationMs}ms</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 7. Timings Breakdown View */}
        {activeResponseTab === 'timings' && (
          <div className="flex flex-col space-y-4 font-sans max-w-xl">
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider">
              Network Latency Breakdown
            </h4>

            <div className="flex flex-col space-y-3 p-4 rounded-lg bg-background-secondary border border-border">
              {/* TTFB */}
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Waiting (TTFB - Time to First Byte)</span>
                  <span className="font-mono text-accent font-semibold">{response.timings?.ttfb || 0} ms</span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((response.timings?.ttfb || 1) / (response.timings?.total || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Download */}
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Content Download</span>
                  <span className="font-mono text-emerald-400 font-semibold">{response.timings?.download || 0} ms</span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((response.timings?.download || 1) / (response.timings?.total || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Total Duration */}
              <div className="flex justify-between text-xs pt-2 border-t border-border/50 font-semibold text-text">
                <span>Total Response Time</span>
                <span className="font-mono text-text">{response.timeMs} ms</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
