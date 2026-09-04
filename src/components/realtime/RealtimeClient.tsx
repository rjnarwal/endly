import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Download,
  Filter,
  Flame,
  Info,
  Layers,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useRealtimeStore } from '../../store/useRealtimeStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { MessageDirection, MessageFormat, RealtimeFrame, RealtimeProtocol } from '../../types/realtime';

const PRESETS: { name: string; url: string; protocol: RealtimeProtocol; description: string }[] = [
  {
    name: 'Echo WebSocket (Public)',
    url: 'wss://echo.websocket.events',
    protocol: 'ws',
    description: 'High-speed public echo server for testing payloads',
  },
  {
    name: 'Postman Echo WS',
    url: 'wss://ws.postman-echo.com/raw',
    protocol: 'ws',
    description: 'Echoes back any text or JSON payload sent to it',
  },
  {
    name: 'Wikimedia Recent Changes (SSE)',
    url: 'https://stream.wikimedia.org/v2/stream/recentchange',
    protocol: 'sse',
    description: 'Live global real-time edit stream from Wikipedia',
  },
  {
    name: 'Local WebSocket Server',
    url: 'ws://localhost:8080',
    protocol: 'ws',
    description: 'Connect to your local development backend',
  },
];

export const RealtimeClient: React.FC = () => {
  const { activeTabId, tabs } = useWorkspaceStore();
  const currentTab = tabs.find((t) => t.id === activeTabId);
  const tabId = activeTabId || 'default';

  const {
    getSession,
    initSession,
    updateConfig,
    connect,
    disconnect,
    sendMessage,
    clearFrames,
    setSelectedFrame,
    setFilterDirection,
    setFilterSearch,
    setComposerContent,
    setComposerFormat,
    toggleAutoScroll,
    addSnippet,
    removeSnippet,
  } = useRealtimeStore();

  const [activeSubTab, setActiveSubTab] = useState<'composer' | 'params' | 'settings' | 'snippets'>('composer');
  const [newSnippetName, setNewSnippetName] = useState('');
  const [copiedFrameId, setCopiedFrameId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const streamScrollRef = useRef<HTMLDivElement>(null);

  // Initialize session for current tab if needed
  useEffect(() => {
    if (currentTab) {
      const initialProto: RealtimeProtocol = currentTab.tabType === 'sse' ? 'sse' : 'ws';
      initSession(tabId, currentTab.request.url || undefined, initialProto);
    }
  }, [tabId, currentTab, initSession]);

  const session = getSession(tabId);
  const { status, statusText, config, frames, activeComposerFormat, composerContent, selectedFrameId, filterDirection, filterSearch, autoScroll, snippets, stats } = session;

  // Auto-scroll on new frames
  useEffect(() => {
    if (autoScroll && streamScrollRef.current) {
      streamScrollRef.current.scrollTop = streamScrollRef.current.scrollHeight;
    }
  }, [frames, autoScroll]);

  // Keyboard shortcut Cmd/Ctrl + Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (status === 'connected' && config.protocol === 'ws') {
        sendMessage(tabId);
      }
    }
  };

  const handleCopyPayload = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFrameId(id);
    setTimeout(() => setCopiedFrameId(null), 1800);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(composerContent);
      setComposerContent(tabId, JSON.stringify(parsed, null, 2));
      setComposerFormat(tabId, 'json');
    } catch {
      alert('Content is not valid JSON');
    }
  };

  const handleExportFrames = () => {
    const dataStr = JSON.stringify(frames, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realtime-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter frames
  const filteredFrames = frames.filter((f) => {
    if (filterDirection !== 'all' && f.direction !== filterDirection) return false;
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      return f.payload.toLowerCase().includes(q) || (f.event && f.event.toLowerCase().includes(q));
    }
    return true;
  });

  const selectedFrame = frames.find((f) => f.id === selectedFrameId) || (filteredFrames.length > 0 ? filteredFrames[filteredFrames.length - 1] : null);

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected</span>
          </span>
        );
      case 'connecting':
      case 'reconnecting':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Connecting...</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Error</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-700/30 text-text-muted border border-border">
            <span className="w-2 h-2 rounded-full bg-text-muted/60" />
            <span>Disconnected</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden select-text text-text font-sans">
      {/* Top Connection Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-background-secondary border-b border-border">
        {/* Protocol Selector */}
        <div className="flex items-center rounded-lg bg-background p-0.5 border border-border shrink-0">
          <button
            type="button"
            onClick={() => {
              updateConfig(tabId, {
                protocol: 'ws',
                url: config.url.startsWith('http') ? config.url.replace(/^http/, 'ws') : config.url,
              });
            }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              config.protocol === 'ws'
                ? 'bg-amber-500/20 text-amber-400 shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            WS / WSS
          </button>
          <button
            type="button"
            onClick={() => {
              updateConfig(tabId, {
                protocol: 'sse',
                url: config.url.startsWith('ws') ? config.url.replace(/^ws/, 'http') : config.url,
              });
            }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              config.protocol === 'sse'
                ? 'bg-cyan-500/20 text-cyan-400 shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            SSE (Stream)
          </button>
        </div>

        {/* URL Input */}
        <div className="flex-1 min-w-[240px] flex items-center bg-background rounded-lg border border-border focus-within:border-accent px-3 py-1.5 transition-colors shadow-xs">
          <Radio className="w-4 h-4 text-accent mr-2 shrink-0 animate-pulse" />
          <input
            type="text"
            value={config.url}
            onChange={(e) => updateConfig(tabId, { url: e.target.value })}
            placeholder={config.protocol === 'ws' ? 'wss://echo.websocket.events' : 'https://example.com/events'}
            className="w-full bg-transparent text-xs text-text placeholder-text-muted focus:outline-hidden font-mono"
          />

          {/* Preset Launcher Dropdown */}
          <div className="relative shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center space-x-1 text-[11px] font-medium text-text-secondary hover:text-text bg-background-secondary hover:bg-background-tertiary px-2 py-1 rounded border border-border/80 transition-colors"
              title="Quick Public Presets"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Presets</span>
            </button>

            {showPresets && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-background-secondary border border-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-text-muted uppercase px-2 py-1 tracking-wider border-b border-border/60">
                  Ready-to-Test Streams
                </div>
                <div className="mt-1 space-y-1">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        updateConfig(tabId, { url: p.url, protocol: p.protocol });
                        setShowPresets(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-background-tertiary transition-colors flex flex-col group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text group-hover:text-accent">
                          {p.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-background font-mono font-bold text-text-muted uppercase">
                          {p.protocol}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted mt-0.5 truncate">{p.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {getStatusBadge()}

        {/* Connect / Disconnect Action Button */}
        {status === 'connected' || status === 'connecting' || status === 'reconnecting' ? (
          <button
            type="button"
            onClick={() => disconnect(tabId)}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all shrink-0 active:scale-98 cursor-pointer"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => connect(tabId)}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all shrink-0 active:scale-98 cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>
        )}
      </div>

      {/* Main Studio Body: 2-Column Responsive Split */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Composer, Headers, Settings & Snippets */}
        <div className="w-full md:w-[45%] flex flex-col border-r border-border min-h-[300px] md:min-h-0 bg-background-secondary/40">
          {/* Subtabs Bar */}
          <div className="flex items-center px-3 border-b border-border bg-background-secondary text-xs shrink-0 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveSubTab('composer')}
              className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
                activeSubTab === 'composer'
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-accent" />
              <span>Message Composer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('params')}
              className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
                activeSubTab === 'params'
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Params & Headers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('settings')}
              className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
                activeSubTab === 'settings'
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Heartbeat & Retries</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('snippets')}
              className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
                activeSubTab === 'snippets'
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Snippets ({snippets.length})</span>
            </button>
          </div>

          {/* Subtab Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3">
            {activeSubTab === 'composer' && (
              <div className="flex-1 flex flex-col space-y-3 min-h-0">
                {/* Format and Action Controls */}
                <div className="flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center space-x-1 bg-background rounded-md p-0.5 border border-border">
                    {(['json', 'text', 'binary'] as MessageFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setComposerFormat(tabId, fmt)}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider transition-colors ${
                          activeComposerFormat === fmt
                            ? 'bg-accent text-white'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    {activeComposerFormat === 'json' && (
                      <button
                        type="button"
                        onClick={handleFormatJson}
                        className="flex items-center space-x-1 text-[11px] text-text-secondary hover:text-text bg-background hover:bg-background-tertiary px-2 py-1 rounded border border-border transition-colors"
                        title="Format JSON Indentation"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Beautify</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Editor Textarea */}
                <div className="flex-1 min-h-[140px] flex flex-col bg-background rounded-xl border border-border focus-within:border-accent overflow-hidden transition-colors shadow-inner relative">
                  <textarea
                    value={composerContent}
                    onChange={(e) => setComposerContent(tabId, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type JSON payload or message here... (Cmd+Enter to send)"
                    className="w-full flex-1 p-3 bg-transparent text-xs font-mono text-text focus:outline-hidden resize-none no-scrollbar leading-relaxed"
                    spellCheck={false}
                  />

                  {/* Send Bar Footer */}
                  <div className="flex items-center justify-between p-2 bg-background-secondary border-t border-border/60 text-xs">
                    <span className="text-[11px] text-text-muted hidden sm:inline">
                      Press <kbd className="px-1 py-0.5 bg-background border border-border rounded font-mono text-[10px]">⌘+Enter</kbd> to send
                    </span>

                    <button
                      type="button"
                      disabled={status !== 'connected' || config.protocol !== 'ws'}
                      onClick={() => sendMessage(tabId)}
                      className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-md active:scale-98 ${
                        status === 'connected' && config.protocol === 'ws'
                          ? 'bg-accent hover:bg-accent-hover text-white shadow-accent/20 cursor-pointer'
                          : 'bg-background-tertiary text-text-muted border border-border cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Frame</span>
                    </button>
                  </div>
                </div>

                {/* Quick Snippet Triggers */}
                <div className="shrink-0">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Quick Snippets:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {snippets.map((snip) => (
                      <button
                        key={snip.id}
                        type="button"
                        onClick={() => {
                          setComposerContent(tabId, snip.payload);
                          setComposerFormat(tabId, snip.format);
                        }}
                        className="text-[11px] font-medium px-2 py-1 rounded-md bg-background hover:bg-background-tertiary border border-border text-text-secondary hover:text-text transition-colors flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>{snip.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'params' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-text mb-2">Query Parameters</h4>
                  <div className="space-y-1.5">
                    {config.queryParams.map((param, idx) => (
                      <div key={param.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => {
                            const next = [...config.queryParams];
                            next[idx].enabled = e.target.checked;
                            updateConfig(tabId, { queryParams: next });
                          }}
                          className="rounded border-border accent-accent"
                        />
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => {
                            const next = [...config.queryParams];
                            next[idx].key = e.target.value;
                            updateConfig(tabId, { queryParams: next });
                          }}
                          placeholder="Key (e.g. token)"
                          className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text"
                        />
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const next = [...config.queryParams];
                            next[idx].value = e.target.value;
                            updateConfig(tabId, { queryParams: next });
                          }}
                          placeholder="Value"
                          className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono text-text"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = config.queryParams.filter((_, i) => i !== idx);
                            updateConfig(tabId, { queryParams: next });
                          }}
                          className="p-1 text-text-muted hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        updateConfig(tabId, {
                          queryParams: [
                            ...config.queryParams,
                            { id: Math.random().toString(36).substring(2, 7), key: '', value: '', enabled: true },
                          ],
                        });
                      }}
                      className="flex items-center space-x-1 text-xs text-accent hover:underline mt-2 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Query Parameter</span>
                    </button>
                  </div>
                </div>

                {config.protocol === 'ws' && (
                  <div className="pt-2 border-t border-border">
                    <h4 className="text-xs font-semibold text-text mb-1">WebSocket Subprotocols</h4>
                    <p className="text-[11px] text-text-muted mb-2">Comma-separated list of protocols (e.g. <code>graphql-ws</code>, <code>v1.json</code>)</p>
                    <input
                      type="text"
                      value={config.subprotocols.join(', ')}
                      onChange={(e) => {
                        const vals = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                        updateConfig(tabId, { subprotocols: vals });
                      }}
                      placeholder="e.g. graphql-transport-ws, soap"
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text"
                    />
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'settings' && (
              <div className="space-y-4">
                <div className="p-3 bg-background rounded-xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-text">Heartbeat / Auto-Ping</span>
                      <p className="text-[11px] text-text-muted">Sends recurring ping frame to keep connection active</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.heartbeatEnabled}
                      onChange={(e) => updateConfig(tabId, { heartbeatEnabled: e.target.checked })}
                      className="rounded border-border accent-accent w-4 h-4"
                    />
                  </div>

                  {config.heartbeatEnabled && (
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div>
                        <label className="text-[11px] text-text-secondary block mb-1 font-medium">Interval (Seconds)</label>
                        <input
                          type="number"
                          min={2}
                          max={300}
                          value={config.heartbeatIntervalSec}
                          onChange={(e) => updateConfig(tabId, { heartbeatIntervalSec: parseInt(e.target.value, 10) || 15 })}
                          className="w-full bg-background-secondary border border-border rounded px-2.5 py-1 text-xs text-text"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-text-secondary block mb-1 font-medium">Heartbeat Payload</label>
                        <input
                          type="text"
                          value={config.heartbeatPayload}
                          onChange={(e) => updateConfig(tabId, { heartbeatPayload: e.target.value })}
                          className="w-full bg-background-secondary border border-border rounded px-2.5 py-1 text-xs font-mono text-text"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-background rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-text">Auto Reconnect</span>
                    <p className="text-[11px] text-text-muted">Attempt reconnection if connection drops unexpectedly</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoReconnect}
                    onChange={(e) => updateConfig(tabId, { autoReconnect: e.target.checked })}
                    className="rounded border-border accent-accent w-4 h-4"
                  />
                </div>
              </div>
            )}

            {activeSubTab === 'snippets' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSnippetName}
                    onChange={(e) => setNewSnippetName(e.target.value)}
                    placeholder="New snippet name..."
                    className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-text"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSnippetName.trim()) return;
                      addSnippet(tabId, newSnippetName, composerContent, activeComposerFormat);
                      setNewSnippetName('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
                  >
                    Save Current
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  {snippets.map((snip) => (
                    <div
                      key={snip.id}
                      className="p-2.5 bg-background rounded-xl border border-border flex items-center justify-between group hover:border-accent/60 transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-text">{snip.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-background-secondary text-text-muted font-mono uppercase">
                            {snip.format}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted font-mono truncate mt-0.5">{snip.payload}</p>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setComposerContent(tabId, snip.payload);
                            setComposerFormat(tabId, snip.format);
                            setActiveSubTab('composer');
                          }}
                          className="px-2 py-1 rounded bg-background-secondary hover:bg-background-tertiary text-xs font-medium text-text-secondary hover:text-text transition-colors"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSnippet(tabId, snip.id)}
                          className="p-1 text-text-muted hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Session Metrics Footer */}
          <div className="p-2 bg-background border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono shrink-0">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1 text-emerald-400">
                <ArrowDownLeft className="w-3 h-3" />
                <span>{(stats.bytesReceived / 1024).toFixed(1)} KB ({stats.messagesReceived})</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400">
                <ArrowUpRight className="w-3 h-3" />
                <span>{(stats.bytesSent / 1024).toFixed(1)} KB ({stats.messagesSent})</span>
              </span>
            </div>
            <span>{statusText || 'Idle'}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Stream Timeline & Frame Inspector */}
        <div className="w-full md:w-[55%] flex flex-col min-h-0 bg-background overflow-hidden">
          {/* Timeline Header & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-background-secondary border-b border-border shrink-0">
            {/* Direction Filter Pills */}
            <div className="flex items-center space-x-1 bg-background rounded-lg p-0.5 border border-border text-xs">
              {(['all', 'incoming', 'outgoing', 'system'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setFilterDirection(tabId, dir)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                    filterDirection === dir
                      ? 'bg-accent text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-[200px] flex items-center bg-background rounded-lg border border-border px-2 py-1 text-xs">
              <Search className="w-3 h-3 text-text-muted mr-1.5 shrink-0" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(tabId, e.target.value)}
                placeholder="Filter stream..."
                className="w-full bg-transparent text-xs text-text placeholder-text-muted focus:outline-hidden"
              />
            </div>

            {/* Stream Tools */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => toggleAutoScroll(tabId)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  autoScroll
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'bg-background border-border text-text-muted hover:text-text'
                }`}
                title={autoScroll ? 'Auto-scroll Enabled (locks to bottom)' : 'Auto-scroll Disabled'}
              >
                {autoScroll ? <Activity className="w-3.5 h-3.5 animate-pulse" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleExportFrames}
                className="p-1.5 bg-background hover:bg-background-tertiary border border-border text-text-muted hover:text-text rounded-lg transition-colors"
                title="Export Frame Log (JSON)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => clearFrames(tabId)}
                className="p-1.5 bg-background hover:bg-rose-500/20 hover:text-rose-400 border border-border text-text-muted rounded-lg transition-colors"
                title="Clear Frame Stream"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stream Log & Detail Inspector Split */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top: Chronological Frame List */}
            <div
              ref={streamScrollRef}
              className="flex-1 min-h-[160px] overflow-y-auto p-2 space-y-1.5 font-mono text-xs no-scrollbar"
            >
              {filteredFrames.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                  <Activity className="w-10 h-10 text-border mb-2" />
                  <p className="text-xs font-semibold text-text-secondary">No Stream Messages Yet</p>
                  <p className="text-[11px] max-w-xs mt-1">
                    Connect to a WebSocket endpoint or Server-Sent Events stream to inspect incoming and outgoing frames in real time.
                  </p>
                </div>
              ) : (
                filteredFrames.map((frame) => {
                  const isSelected = selectedFrame?.id === frame.id;
                  const isIncoming = frame.direction === 'incoming';
                  const isOutgoing = frame.direction === 'outgoing';
                  const isSystem = frame.direction === 'system';

                  return (
                    <div
                      key={frame.id}
                      onClick={() => setSelectedFrame(tabId, frame.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                        isSelected
                          ? 'border-accent bg-accent/10 shadow-sm'
                          : 'border-border/60 bg-background-secondary/40 hover:bg-background-secondary hover:border-border'
                      }`}
                    >
                      {/* Direction Icon */}
                      <div className="mt-0.5 shrink-0">
                        {isIncoming && (
                          <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                            <ArrowDownLeft className="w-3 h-3" />
                          </span>
                        )}
                        {isOutgoing && (
                          <span className="p-1 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3" />
                          </span>
                        )}
                        {isSystem && (
                          <span
                            className={`p-1 rounded-md flex items-center justify-center ${
                              frame.isError ? 'bg-rose-500/15 text-rose-400' : 'bg-cyan-500/15 text-cyan-400'
                            }`}
                          >
                            <Info className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Payload Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px] text-text-muted mb-0.5">
                          <span className="font-semibold uppercase tracking-wider">
                            {frame.event ? `Event: ${frame.event}` : frame.direction}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span>{frame.sizeBytes} B</span>
                            <span>{new Date(frame.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="text-xs text-text truncate font-mono">
                          {frame.payload}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom: Selected Frame Detailed Inspector */}
            {selectedFrame && (
              <div className="h-[40%] min-h-[140px] border-t border-border bg-background-secondary/60 flex flex-col">
                {/* Inspector Header */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-background-secondary border-b border-border/80 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-text">Frame Inspector</span>
                    <span className="text-[10px] font-mono text-text-muted">
                      ({selectedFrame.sizeBytes} bytes • {new Date(selectedFrame.timestamp).toLocaleTimeString()})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPayload(selectedFrame.id, selectedFrame.payload)}
                    className="flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-background hover:bg-background-tertiary border border-border text-text-secondary hover:text-text transition-colors"
                  >
                    {copiedFrameId === selectedFrame.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Formatted Content Viewer */}
                <div className="flex-1 p-3 overflow-y-auto no-scrollbar font-mono text-xs leading-relaxed select-text">
                  <pre className="text-text whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedFrame.payload);
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return selectedFrame.payload;
                      }
                    })()}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
