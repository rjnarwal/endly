import React, { useState } from 'react';
import {
  Smartphone,
  Play,
  Square,
  Copy,
  Check,
  X,
  Wifi,
  Radio,
  Server,
  Sparkles,
  ArrowRight,
  Trash2,
  Filter,
  CheckCircle2,
  Info,
  Clock,
  Layers,
  ChevronRight,
  FileJson,
  ShieldCheck,
} from 'lucide-react';
import { useProxyStore, TrafficLogItem } from '../../store/useProxyStore';
import { useMockStore } from '../../store/useMockStore';
import { HttpRequestMethod } from '../../types';

const METHOD_COLORS: Record<HttpRequestMethod, { text: string; bg: string }> = {
  GET: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  POST: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  PUT: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  PATCH: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
  DELETE: { text: 'text-rose-400', bg: 'bg-rose-500/10' },
  HEAD: { text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  OPTIONS: { text: 'text-pink-400', bg: 'bg-pink-500/10' },
};

export const MobileInterceptorModal: React.FC = () => {
  const {
    isOpen,
    closeModal,
    isRunning,
    port,
    setPort,
    localIps,
    trafficLogs,
    selectedLogId,
    setSelectedLogId,
    activeGuideTab,
    setActiveGuideTab,
    startProxy,
    stopProxy,
    clearTrafficLogs,
  } = useProxyStore();

  const { mocks, addMock } = useMockStore();

  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen) return null;

  const primaryIp = localIps[0] || '127.0.0.1';
  const selectedLog = trafficLogs.find((l) => l.id === selectedLogId);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(key);
    setTimeout(() => setCopiedIp(null), 1500);
  };

  const handleToggleProxy = async () => {
    setIsStarting(true);
    if (isRunning) {
      await stopProxy();
    } else {
      await startProxy();
    }
    setIsStarting(false);
  };

  const handleCreateMockFromLog = (log: TrafficLogItem) => {
    addMock({
      name: `Mock: ${log.method} ${log.path}`,
      method: log.method,
      path: log.path,
      statusCode: log.statusCode || 200,
      body: log.responseBody || JSON.stringify({ message: 'Auto-captured from mobile' }, null, 2),
      delayMs: log.timeMs || 100,
      enabled: true,
    });
  };

  const filteredLogs = trafficLogs.filter(
    (l) =>
      !filterText ||
      l.url.toLowerCase().includes(filterText.toLowerCase()) ||
      l.method.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm select-none">
      <div className="flex flex-col w-full max-w-5xl h-[92vh] bg-background-secondary border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-tertiary/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-text">Mobile HTTP Proxy Interceptor</h2>
                <span
                  className={`flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isRunning
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-background-elevated text-text-muted border-border'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-text-muted'
                    }`}
                  />
                  <span>{isRunning ? 'INTERCEPTOR ACTIVE' : 'INACTIVE'}</span>
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Intercept and mock requests directly from your mobile apps over Wi-Fi without code changes.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Start / Stop Toggle */}
            <button
              onClick={handleToggleProxy}
              disabled={isStarting}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {isRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Interceptor</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Interceptor</span>
                </>
              )}
            </button>

            <button
              onClick={closeModal}
              className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-background-elevated transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column (5 cols): Connection Info & Device Setup */}
          <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-background-secondary p-3 space-y-3 overflow-y-auto">
            {/* 1. Wi-Fi IP & Proxy Settings Box */}
            <div className="p-3 rounded-lg bg-background-tertiary border border-border flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-text">
                  <Wifi className="w-3.5 h-3.5 text-accent" />
                  <span>Your Computer Wi-Fi Address</span>
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-text-muted">
                  <span>Port:</span>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value, 10) || 8888)}
                    disabled={isRunning}
                    className="w-14 bg-background border border-border rounded px-1 py-0.5 text-center font-mono text-xs text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* IP Address Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {localIps.map((ip) => (
                  <button
                    key={ip}
                    onClick={() => handleCopy(`${ip}:${port}`, ip)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-background border border-border hover:border-accent hover:text-accent transition-colors text-xs font-mono font-medium"
                    title="Click to copy host:port"
                  >
                    <span>{ip}:{port}</span>
                    {copiedIp === ip ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-text-muted" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Device Setup Guide Tabs */}
            <div className="flex-1 flex flex-col rounded-lg bg-background-tertiary border border-border overflow-hidden">
              <div className="flex border-b border-border bg-background-secondary text-xs">
                <button
                  onClick={() => setActiveGuideTab('ios')}
                  className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-colors ${
                    activeGuideTab === 'ios'
                      ? 'border-accent text-accent bg-background-tertiary'
                      : 'border-transparent text-text-secondary hover:text-text'
                  }`}
                >
                  🍎 iOS (iPhone)
                </button>
                <button
                  onClick={() => setActiveGuideTab('android')}
                  className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-colors ${
                    activeGuideTab === 'android'
                      ? 'border-accent text-accent bg-background-tertiary'
                      : 'border-transparent text-text-secondary hover:text-text'
                  }`}
                >
                  🤖 Android
                </button>
                <button
                  onClick={() => setActiveGuideTab('flutter')}
                  className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-colors ${
                    activeGuideTab === 'flutter'
                      ? 'border-accent text-accent bg-background-tertiary'
                      : 'border-transparent text-text-secondary hover:text-text'
                  }`}
                >
                  💙 Flutter
                </button>
                <button
                  onClick={() => setActiveGuideTab('react-native')}
                  className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-colors ${
                    activeGuideTab === 'react-native'
                      ? 'border-accent text-accent bg-background-tertiary'
                      : 'border-transparent text-text-secondary hover:text-text'
                  }`}
                >
                  ⚛️ RN
                </button>
              </div>

              <div className="p-3 text-xs leading-relaxed text-text-secondary flex-1 overflow-y-auto space-y-2">
                {activeGuideTab === 'ios' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-text">iPhone / iPad Setup:</p>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>Make sure your iPhone and computer are on the <strong>same Wi-Fi</strong>.</li>
                      <li>Go to <strong>Settings</strong> &gt; <strong>Wi-Fi</strong> &gt; Tap the <strong>(i)</strong> next to your Wi-Fi name.</li>
                      <li>Scroll to the bottom and tap <strong>Configure Proxy</strong> &gt; <strong>Manual</strong>.</li>
                      <li>
                        Set <strong>Server</strong>: <code className="text-accent font-mono">{primaryIp}</code> and <strong>Port</strong>: <code className="text-accent font-mono">{port}</code>.
                      </li>
                      <li>Open your mobile app — requests will be intercepted automatically!</li>
                    </ol>
                  </div>
                )}

                {activeGuideTab === 'android' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-text">Android Setup (Physical & Emulator):</p>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>
                        <strong>Physical Phone</strong>: Wi-Fi Settings &gt; Tap your Wi-Fi &gt; Advanced Options &gt; Proxy Manual &gt; Host: <code className="text-accent font-mono">{primaryIp}</code>, Port: <code className="text-accent font-mono">{port}</code>.
                      </li>
                      <li>
                        <strong>Android Emulator</strong>: Extended Controls (...) &gt; Settings &gt; Proxy &gt; Manual Proxy &gt; Host: <code className="text-accent font-mono">10.0.2.2</code>, Port: <code className="text-accent font-mono">{port}</code>.
                      </li>
                    </ol>
                  </div>
                )}

                {activeGuideTab === 'flutter' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-text">Flutter (Dio / HttpProxy):</p>
                    <pre className="p-2 rounded bg-background font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`// Configure Dio HTTP proxy
(dio.httpClientAdapter as DefaultHttpClientAdapter)
  .onHttpClientCreate = (client) {
    client.findProxy = (uri) {
      return "PROXY ${primaryIp}:${port}";
    };
    client.badCertificateCallback = (cert, host, port) => true;
  };`}
                    </pre>
                  </div>
                )}

                {activeGuideTab === 'react-native' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-text">React Native Configuration:</p>
                    <p>React Native automatically respects your device's Wi-Fi proxy settings.</p>
                    <pre className="p-2 rounded bg-background font-mono text-[11px] text-amber-400 overflow-x-auto">
{`// Or run the companion runner in terminal:
npm run proxy`}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Active Mocks Counter */}
            <div className="p-2.5 rounded-lg bg-background-tertiary/60 border border-border flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-text">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Active Mock Routes</span>
              </div>
              <span className="font-mono font-bold text-accent px-1.5 py-0.2 rounded bg-accent/15">
                {mocks.filter((m) => m.enabled).length} Enabled
              </span>
            </div>
          </div>

          {/* Right Column (7 cols): Live Mobile Traffic Stream & Inspector */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-background overflow-hidden">
            {/* Traffic Stream Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background-secondary">
              <div className="flex items-center space-x-2 flex-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-text">Live Mobile Traffic</span>
                <span className="text-[10px] font-mono text-text-muted">({filteredLogs.length} events)</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-background-tertiary border border-border rounded px-2 py-0.5 text-xs">
                  <Filter className="w-3 h-3 text-text-muted mr-1" />
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filter URL/path..."
                    className="bg-transparent text-text placeholder:text-text-muted text-xs focus:outline-none w-28 sm:w-36"
                  />
                </div>

                {trafficLogs.length > 0 && (
                  <button
                    onClick={clearTrafficLogs}
                    className="p-1 rounded text-text-muted hover:text-red-400 transition-colors"
                    title="Clear Traffic Logs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Traffic Table */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-muted text-xs space-y-2 p-6 text-center">
                  <Radio className="w-8 h-8 opacity-40 text-accent animate-pulse" />
                  <span className="font-medium text-text">Waiting for requests from mobile...</span>
                  <p className="text-[11px] max-w-sm leading-relaxed">
                    Start the interceptor and make API requests from your mobile app. Any matching mock rules will respond instantly!
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = log.id === selectedLogId;
                  const methodStyle = METHOD_COLORS[log.method] || METHOD_COLORS.GET;

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLogId(isSelected ? null : log.id)}
                      className={`flex flex-col p-2.5 cursor-pointer transition-colors text-xs ${
                        isSelected
                          ? 'bg-accent/10 border-l-4 border-l-accent'
                          : 'hover:bg-background-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-mono ${methodStyle.bg} ${methodStyle.text}`}
                          >
                            {log.method}
                          </span>

                          <span className="truncate font-mono text-text font-medium">{log.path}</span>

                          {log.isMocked && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-semibold uppercase tracking-wider shrink-0">
                              Mocked
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] shrink-0 font-mono">
                          <span
                            className={`font-semibold ${
                              log.statusCode >= 200 && log.statusCode < 300
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {log.statusCode}
                          </span>
                          <span className="text-text-muted">{log.timeMs}ms</span>
                        </div>
                      </div>

                      {/* Log details expansion */}
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-border/50 flex flex-col space-y-2 bg-background-elevated/50 p-2 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-text-muted font-mono truncate">{log.url}</span>
                            {!log.isMocked && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateMockFromLog(log);
                                }}
                                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-accent/15 text-accent hover:bg-accent hover:text-white transition-colors text-[10px] font-medium"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Create Mock Rule</span>
                              </button>
                            )}
                          </div>

                          {log.responseBody && (
                            <div className="flex flex-col space-y-1">
                              <span className="text-[10px] font-semibold text-text-secondary">Response Payload:</span>
                              <pre className="p-2 rounded bg-background font-mono text-[10px] text-emerald-400 max-h-32 overflow-y-auto overflow-x-auto">
                                {log.responseBody}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
