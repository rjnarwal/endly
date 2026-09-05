import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock,
  Columns,
  Copy,
  Download,
  Filter,
  Flame,
  Globe,
  Info,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Split,
  Trash2,
  Wifi,
  WifiOff,
  X,
  Zap,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useProxyStore, BreakpointRule, MapRemoteRule, MapLocalRule, ThrottlingProfile, ProxyConsoleLog } from '../../store/useProxyStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { createDefaultRequest } from '../../store/useCollectionStore';
import { isTauriEnvironment } from '../../services/httpDispatcher';

export const MobileInterceptorModal: React.FC = () => {
  const {
    isOpen,
    closeModal,
    isRunning,
    port,
    setPort,
    localIps,
    setLocalIps,
    trafficLogs,
    selectedLogId,
    setSelectedLogId,
    activeStudioTab,
    setActiveStudioTab,
    activeGuideTab,
    setActiveGuideTab,
    startProxy,
    stopProxy,
    clearTrafficLogs,
    consoleLogs,
    clearConsoleLogs,
    bridgeStatus,
    lastDeviceIp,
    breakpointRules,
    pausedBreakpoints,
    activePausedId,
    setActivePausedId,
    addBreakpointRule,
    updateBreakpointRule,
    deleteBreakpointRule,
    resumeBreakpoint,
    abortBreakpoint,
    mapRemoteRules,
    mapLocalRules,
    addMapRemoteRule,
    updateMapRemoteRule,
    deleteMapRemoteRule,
    addMapLocalRule,
    updateMapLocalRule,
    deleteMapLocalRule,
    throttling,
    setThrottlingProfile,
    updateThrottling,
    domainFilter,
    updateDomainFilter,
    diffLogIds,
    setDiffLogIds,
  } = useProxyStore();

  const { openTab } = useWorkspaceStore();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [consoleStageFilter, setConsoleStageFilter] = useState<string>('ALL');

  const consoleScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (consoleScrollRef.current) {
      consoleScrollRef.current.scrollTop = consoleScrollRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // New Rule Form States
  const [newBpPattern, setNewBpPattern] = useState('');
  const [newBpMethod, setNewBpMethod] = useState('ALL');
  const [newBpPhase, setNewBpPhase] = useState<'request' | 'response' | 'both'>('both');

  const [newMrName, setNewMrName] = useState('');
  const [newMrFrom, setNewMrFrom] = useState('');
  const [newMrTo, setNewMrTo] = useState('');

  const [newMlName, setNewMlName] = useState('');
  const [newMlMatch, setNewMlMatch] = useState('');
  const [newMlBody, setNewMlBody] = useState('{\n  "status": "success",\n  "mocked": true\n}');
  const [newMlStatus, setNewMlStatus] = useState(200);

  const [newWhitelistDomain, setNewWhitelistDomain] = useState('');

  // Active Paused Breakpoint Edit State
  const activePaused = pausedBreakpoints.find((p) => p.id === activePausedId) || pausedBreakpoints[0];
  const [bpEditStatus, setBpEditStatus] = useState<number>(200);
  const [bpEditBody, setBpEditBody] = useState<string>('');

  React.useEffect(() => {
    if (activePaused) {
      setBpEditStatus(activePaused.statusCode);
      setBpEditBody(activePaused.body || '');
    }
  }, [activePaused?.id]);

  if (!isOpen) return null;

  const handleDownloadCaCert = () => {
    const rootCaPem = `-----BEGIN CERTIFICATE-----
MIIDhTCCAm2gAwIBAgIUQsB5+J8rJUBJ6t7j4Rzlj82AZ8IwDQYJKoZIhvcNAQEL
BQAwSjELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExDjAMBgNVBAoM
BUVuZGx5MRYwFAYDVQQDDA1FbmRseSBSb290IENBMB4XDTI2MDkwNDE2NTQzOVoX
DTM2MDkwMTE2NTQzOVowSjELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3Ju
aWExDjAMBgNVBAoMBUVuZGx5MRYwFAYDVQQDDA1FbmRseSBSb290IENBMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvp7y753VRq0oMkhgDGAPtQlWlEXz
d+/cKg64Yv3yfHmAq4gEqHuGNy9hC6j5R7TYZd7+7VZAKqUac5Mb9g0U1AzZGPyT
tUZUBv1sihUlrPYwc29WBm2qmEw2l62FjUNaPJmLgv3TlGm0k71hOCer4/pCUVHm
wb1k8X+GRQYGn1t73tF+wvkW95h0a7XrE8M55KtiifErrkT6OLuGGVar/geET72W
FXupzS9CfV/IG+4C2ECx3aRfnda4u2fH1Yz5taPwuVRogu/bgE9d3eQZJNSKLaUs
EoJBvNLMLXY37fYBKnz/HcNcXfn+QryDsUh17ZnvaY3H/8If5LL4/Qq1iQIDAQAB
o2MwYTAfBgNVHSMEGDAWgBSZT3wmyLrFE4Ny1TgtdNCSSzwKdDAPBgNVHRMBAf8E
BTADAQH/MA4GA1UdDwEB/wQEAwIBBjAdBgNVHQ4EFgQUmU98Jsi6xRODctU4LXTQ
kks8CnQwDQYJKoZIhvcNAQELBQADggEBAGv6Qj4bYRIjwMYwyxAZYk78i3SAhwGr
BtJygcLUsw/BX/zgtawEfCTbLONco/Cv+bLiDfRKrxhMOhKBmUrPhtKSmLRs1sNl
liprXdkDorez7xVwFJh5+AWoULqAr+N5psPz1gg5dwhZspslRdIHTd5gPsZSjPd+
YhR4HCzz9D8CZ+VH/e0ecbLpGUEjGzzp7IYsPrTs8AzCtcEioXwQ7tJcqbF3AndK
eg23/DUg6f/EnFhuSqE2qpo+oj5IdLePIywIKJwblxugJ7TqML+5eVn77ASgMU/o
c4meXH3guzQPX4395yj8Opb2vC8HFwDm9KNyzvHX4YbsU866Xsna/1g=
-----END CERTIFICATE-----`;
    const blob = new Blob([rootCaPem], { type: 'application/x-x509-ca-cert' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'endly-root-ca.crt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReplayInTab = (log: any) => {
    const req = createDefaultRequest(
      `${log.method} ${log.path}`,
      log.method,
      log.url
    );
    if (log.requestHeaders) {
      req.headers = Object.entries(log.requestHeaders).map(([key, value]) => ({
        id: Math.random().toString(36).substring(2, 7),
        key,
        value: String(value),
        enabled: true,
      }));
    }
    if (log.requestBody) {
      req.body = {
        type: 'raw',
        raw: log.requestBody,
        rawLanguage: 'json',
      };
    }
    openTab(req);
    closeModal();
  };

  const handleCopyCurl = (log: any) => {
    let curl = `curl -X ${log.method} "${log.url}"`;
    if (log.requestHeaders) {
      Object.entries(log.requestHeaders).forEach(([k, v]) => {
        if (!['host', 'content-length'].includes(k.toLowerCase())) {
          curl += ` \\\n  -H "${k}: ${v}"`;
        }
      });
    }
    if (log.requestBody) {
      curl += ` \\\n  --data '${log.requestBody}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 1800);
  };

  const filteredLogs = trafficLogs.filter((log) => {
    if (filterMethod !== 'ALL' && log.method !== filterMethod) return false;

    if (domainFilter.onlyWhitelisted && domainFilter.whitelist.length > 0) {
      const matches = domainFilter.whitelist.some((d) => log.url.toLowerCase().includes(d.toLowerCase()));
      if (!matches) return false;
    }

    if (domainFilter.blacklist.some((d) => log.url.toLowerCase().includes(d.toLowerCase()))) {
      return false;
    }

    if (filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      return log.url.toLowerCase().includes(q) || log.path.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedLog = filteredLogs.find((l) => l.id === selectedLogId) || (filteredLogs.length > 0 ? filteredLogs[0] : null);

  // Diff Logs
  const diffLog1 = trafficLogs.find((l) => l.id === diffLogIds[0]) || (trafficLogs.length > 0 ? trafficLogs[0] : null);
  const diffLog2 = trafficLogs.find((l) => l.id === diffLogIds[1]) || (trafficLogs.length > 1 ? trafficLogs[1] : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 select-none">
      <div
        className={`bg-background-secondary border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh]'
        }`}
      >
        {/* Top Studio Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-background border-b border-border select-none">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-text">Mobile & LAN Interceptor Studio</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                  PRO ENGINE
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Native HTTPS inspection, live breakpoints, URL rewrite, and network throttling
              </p>
            </div>
          </div>

          {/* Proxy Controls & IP Badge */}
          <div className="flex items-center space-x-2">
            {/* Live Breakpoint Notification Alert */}
            {pausedBreakpoints.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveStudioTab('breakpoints')}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold animate-pulse"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{pausedBreakpoints.length} Paused Breakpoint{pausedBreakpoints.length > 1 ? 's' : ''}</span>
              </button>
            )}

            {/* LAN IP & Port Config (Directly Editable) */}
            <div className="flex items-center space-x-1.5 bg-background-secondary px-2.5 py-1 rounded-lg border border-border text-xs font-mono">
              <Globe className="w-3.5 h-3.5 text-accent mr-0.5" />
              <span className="text-text-muted">Host IP:</span>
              <input
                type="text"
                value={localIps[0] || '192.168.68.62'}
                onChange={(e) => {
                  setLocalIps([e.target.value]);
                }}
                placeholder="192.168.x.x"
                className="w-28 bg-background border border-border rounded px-1.5 py-0.5 text-xs text-text font-mono font-semibold"
                title="Your computer's Wi-Fi LAN IP (Editable)"
              />
              <span className="text-text-muted ml-1">Port:</span>
              <input
                type="number"
                disabled={isRunning}
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value, 10) || 8888)}
                className="w-14 bg-background border border-border rounded px-1.5 py-0.5 text-xs text-text font-mono text-center disabled:opacity-60"
              />
            </div>

            {/* Root CA Certificate Download */}
            <button
              type="button"
              onClick={handleDownloadCaCert}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-background-secondary hover:bg-background-tertiary border border-border text-text-secondary hover:text-text text-xs font-medium transition-colors"
              title="Download Endly Root CA Certificate (.crt) for iOS/Android SSL Decryption"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Root CA (.crt)</span>
            </button>

            {/* Start / Stop Proxy Server Button */}
            {isRunning ? (
              <button
                type="button"
                onClick={stopProxy}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Stop Proxy</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startProxy}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Start Proxy</span>
              </button>
            )}

            {/* Fullscreen & Close Controls */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-background-secondary transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={closeModal}
              className="p-1.5 text-text-muted hover:text-rose-400 rounded-lg hover:bg-background-secondary transition-colors"
              title="Close Interceptor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-Time Diagnostics Stage Pipeline Banner */}
        <div className="bg-background px-4 py-2 border-b border-border/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono select-none">
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar">
            {/* Stage 1: Bridge Connection */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="text-[10px] text-text-muted font-bold">1. ENGINE:</span>
              {isTauriEnvironment() ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Native Core Integrated</span>
                </span>
              ) : bridgeStatus === 'connected' ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Port 8889 Connected</span>
                </span>
              ) : bridgeStatus === 'connecting' ? (
                <span className="flex items-center space-x-1 text-amber-400 font-semibold text-[11px]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Connecting...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-rose-400 font-semibold text-[11px]" title="Run 'npm run proxy' in terminal">
                  <AlertCircle className="w-3 h-3" />
                  <span>Bridge Disconnected (npm run proxy)</span>
                </span>
              )}
            </div>

            <ChevronRight className="w-3 h-3 text-border shrink-0" />

            {/* Stage 2: Wi-Fi Proxy Server */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="text-[10px] text-text-muted font-bold">2. PROXY SERVER:</span>
              {isRunning ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{localIps[0] || '192.168.68.62'}:{port} (Active)</span>
                </span>
              ) : (
                <span className="text-text-muted text-[11px]">Stopped</span>
              )}
            </div>

            <ChevronRight className="w-3 h-3 text-border shrink-0" />

            {/* Stage 3: Device Link */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="text-[10px] text-text-muted font-bold">3. DEVICE:</span>
              {lastDeviceIp ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                  <Smartphone className="w-3 h-3" />
                  <span>Phone ({lastDeviceIp}) Active</span>
                </span>
              ) : (
                <span className="text-amber-400/80 text-[11px]">Waiting for phone connection...</span>
              )}
            </div>
          </div>

          {/* Quick Stage Action Button */}
          <button
            type="button"
            onClick={() => setActiveStudioTab('console')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
              activeStudioTab === 'console'
                ? 'bg-accent text-white border-accent'
                : 'bg-background-secondary border-border text-text-secondary hover:text-text'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Console ({consoleLogs.length})</span>
          </button>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center px-3 border-b border-border bg-background-secondary text-xs shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveStudioTab('traffic')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeStudioTab === 'traffic'
                ? 'border-emerald-400 text-text'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Traffic Stream ({trafficLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('console')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeStudioTab === 'console'
                ? 'border-amber-400 text-text'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Console & Diagnostics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('breakpoints')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeStudioTab === 'breakpoints'
                ? 'border-amber-400 text-text'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Pause className="w-3.5 h-3.5 text-amber-400" />
            <span>Breakpoints</span>
            {pausedBreakpoints.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('map')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeStudioTab === 'map'
                ? 'border-accent text-text'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Split className="w-3.5 h-3.5 text-accent" />
            <span>Map Remote & Local</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('throttling')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeStudioTab === 'throttling'
                ? 'border-cyan-400 text-text'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Throttling {throttling.enabled && `(${throttling.profile})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('domains')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeStudioTab === 'domains'
                ? 'border-purple-400 text-text'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Domain Whitelist</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('diff')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeStudioTab === 'diff'
                ? 'border-blue-400 text-text'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-blue-400" />
            <span>Traffic Diff</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('guide')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeStudioTab === 'guide'
                ? 'border-amber-400 text-text'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Device Setup Guides</span>
          </button>
        </div>

        {/* Studio Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-background">
          {/* 1. TRAFFIC STREAM TAB */}
          {activeStudioTab === 'traffic' && (
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              {/* Left Column: Traffic Log Table */}
              <div className="w-full md:w-[50%] flex flex-col border-r border-border min-h-0 bg-background-secondary/30">
                {/* Traffic Filters Bar */}
                <div className="p-2.5 bg-background-secondary border-b border-border flex flex-col gap-1.5 shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-background rounded-lg border border-border p-0.5 text-xs">
                      {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFilterMethod(m)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-colors ${
                            filterMethod === m ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 flex items-center bg-background rounded-lg border border-border px-2 py-1 text-xs focus-within:border-accent">
                      <Search className="w-3.5 h-3.5 text-text-muted mr-1.5 shrink-0" />
                      <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Filter URLs (e.g. api.myapp.com, /auth)..."
                        className="w-full bg-transparent text-xs text-text placeholder-text-muted focus:outline-hidden font-mono"
                      />
                      {filterQuery && (
                        <button
                          type="button"
                          onClick={() => setFilterQuery('')}
                          className="p-0.5 text-text-muted hover:text-text rounded ml-1"
                          title="Clear Search"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={clearTrafficLogs}
                      className="p-1.5 bg-background hover:bg-rose-500/20 hover:text-rose-400 border border-border text-text-muted rounded-lg transition-colors shrink-0"
                      title="Clear Traffic Stream"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Filter Status Badge */}
                  {(filterQuery || filterMethod !== 'ALL') && (
                    <div className="flex items-center justify-between text-[11px] px-1 text-text-muted">
                      <span>
                        Showing <strong className="text-text">{filteredLogs.length}</strong> of <strong className="text-text">{trafficLogs.length}</strong> requests
                        {filterQuery && <> matching <span className="text-accent font-mono">"{filterQuery}"</span></>}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterQuery('');
                          setFilterMethod('ALL');
                        }}
                        className="text-accent hover:underline font-semibold"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Log Rows */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs select-text no-scrollbar">
                  {filteredLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                      {filterQuery || filterMethod !== 'ALL' ? (
                        <>
                          <Search className="w-8 h-8 text-border mb-2" />
                          <p className="text-xs font-semibold text-text-secondary">No requests match "{filterQuery || filterMethod}"</p>
                          <p className="text-[11px] max-w-xs mt-1">Try a different search query or clear the filter to see all requests.</p>
                          <button
                            type="button"
                            onClick={() => { setFilterQuery(''); setFilterMethod('ALL'); }}
                            className="mt-3 px-3 py-1 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Show All {trafficLogs.length} Requests
                          </button>
                        </>
                      ) : (
                        <>
                          <Wifi className="w-10 h-10 text-border mb-2" />
                          <p className="text-xs font-semibold text-text-secondary">Waiting for Mobile HTTP/HTTPS Traffic</p>
                          <p className="text-[11px] max-w-xs mt-1">
                            Configure phone Wi-Fi proxy: Host <code className="text-accent font-bold">{localIps[0] || '192.168.68.62'}</code> Port <code className="text-accent font-bold">{port}</code>
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    filteredLogs.map((log) => {
                      const isSelected = selectedLog?.id === log.id;
                      const isSuccess = log.statusCode >= 200 && log.statusCode < 300;
                      const isRedirect = log.statusCode >= 300 && log.statusCode < 400;
                      const isClientError = log.statusCode >= 400 && log.statusCode < 500;
                      const isServerError = log.statusCode >= 500;

                      return (
                        <div
                          key={log.id}
                          onClick={() => setSelectedLogId(log.id)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-500/60 bg-emerald-500/10 shadow-xs'
                              : 'border-border/60 bg-background-secondary/40 hover:bg-background-secondary hover:border-border'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                log.method === 'GET'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : log.method === 'POST'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : log.method === 'PUT'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {log.method}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                isSuccess
                                  ? 'text-emerald-400 bg-emerald-500/15'
                                  : isRedirect
                                  ? 'text-cyan-400 bg-cyan-500/15'
                                  : isClientError
                                  ? 'text-amber-400 bg-amber-500/15'
                                  : 'text-rose-400 bg-rose-500/15'
                              }`}
                            >
                              {log.statusCode}
                            </span>

                            <span className="text-xs text-text font-mono truncate select-all" title={log.url}>
                              {log.url}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-[10px] text-text-muted shrink-0">
                            {log.isMocked && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-sans font-bold">
                                MOCKED
                              </span>
                            )}
                            {log.isMappedRemote && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-sans font-bold">
                                MAPPED
                              </span>
                            )}
                            <span>{log.timeMs}ms</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Request & Response Inspector */}
              <div className="w-full md:w-[50%] flex flex-col min-h-0 bg-background overflow-hidden">
                {selectedLog ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Selected Item Action Bar */}
                    <div className="p-3 bg-background-secondary border-b border-border flex items-center justify-between shrink-0">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-text">{selectedLog.method}</span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">{selectedLog.statusCode}</span>
                          <span className="text-[11px] text-text-muted">({selectedLog.timeMs}ms • {selectedLog.sizeBytes} bytes)</span>
                        </div>
                        <p className="text-[11px] text-text-secondary font-mono truncate mt-0.5" title={selectedLog.url}>
                          {selectedLog.url}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyCurl(selectedLog)}
                          className="flex items-center space-x-1 px-2 py-1 rounded bg-background hover:bg-background-tertiary border border-border text-xs font-medium text-text-secondary hover:text-text transition-colors"
                          title="Copy as cURL command"
                        >
                          {copiedLogId === selectedLog.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>cURL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReplayInTab(selectedLog)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-colors"
                          title="Replay / Edit in Endly Request Tab"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Replay in Tab</span>
                        </button>
                      </div>
                    </div>

                    {/* Inspector Scroll Body */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
                      {/* Response Body */}
                      <div>
                        <span className="text-xs font-bold text-text mb-1 block">Response Body</span>
                        <div className="p-3 bg-background-secondary/80 rounded-xl border border-border font-mono text-xs max-h-72 overflow-y-auto no-scrollbar select-text leading-relaxed">
                          <pre className="whitespace-pre-wrap break-all text-text">
                            {(() => {
                              try {
                                const parsed = JSON.parse(selectedLog.responseBody || '');
                                return JSON.stringify(parsed, null, 2);
                              } catch {
                                return selectedLog.responseBody || '(Empty response body)';
                              }
                            })()}
                          </pre>
                        </div>
                      </div>

                      {/* Request Body (if any) */}
                      {selectedLog.requestBody && (
                        <div>
                          <span className="text-xs font-bold text-text mb-1 block">Request Body</span>
                          <div className="p-3 bg-background-secondary/80 rounded-xl border border-border font-mono text-xs max-h-48 overflow-y-auto no-scrollbar select-text leading-relaxed">
                            <pre className="whitespace-pre-wrap break-all text-text">
                              {(() => {
                                try {
                                  const parsed = JSON.parse(selectedLog.requestBody);
                                  return JSON.stringify(parsed, null, 2);
                                } catch {
                                  return selectedLog.requestBody;
                                }
                              })()}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Request & Response Headers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-background-secondary/60 rounded-xl border border-border">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                            Request Headers
                          </span>
                          <div className="space-y-1 font-mono text-[11px]">
                            {selectedLog.requestHeaders &&
                              Object.entries(selectedLog.requestHeaders).map(([k, v]) => (
                                <div key={k} className="flex justify-between border-b border-border/40 pb-0.5">
                                  <span className="text-text-muted truncate pr-2">{k}</span>
                                  <span className="text-text font-medium truncate">{String(v)}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="p-3 bg-background-secondary/60 rounded-xl border border-border">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                            Response Headers
                          </span>
                          <div className="space-y-1 font-mono text-[11px]">
                            {selectedLog.responseHeaders &&
                              Object.entries(selectedLog.responseHeaders).map(([k, v]) => (
                                <div key={k} className="flex justify-between border-b border-border/40 pb-0.5">
                                  <span className="text-text-muted truncate pr-2">{k}</span>
                                  <span className="text-text font-medium truncate">{String(v)}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-6 text-center">
                    <Activity className="w-10 h-10 text-border mb-2" />
                    <p className="text-xs font-medium">Select a captured request to inspect its payload</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. LIVE CONSOLE & DIAGNOSTICS TAB */}
          {activeStudioTab === 'console' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#0c0d12] text-text font-mono text-xs overflow-hidden">
              {/* Console Toolbar */}
              <div className="p-3 bg-background-secondary border-b border-border flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-text flex items-center space-x-1.5 font-sans">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Connection Pipeline Diagnostics</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-background font-mono text-text-muted border border-border">
                    {consoleLogs.length} events
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Stage Filter */}
                  <div className="flex items-center bg-background rounded-lg border border-border p-0.5 text-xs">
                    {['ALL', 'bridge', 'server', 'device', 'tunnel', 'http'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setConsoleStageFilter(st)}
                        className={`px-2 py-0.5 rounded text-[11px] uppercase font-bold transition-colors ${
                          consoleStageFilter === st ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const txt = consoleLogs
                        .map(
                          (l) =>
                            `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.stage.toUpperCase()}] [${l.level.toUpperCase()}] ${l.message}`
                        )
                        .join('\n');
                      navigator.clipboard.writeText(txt);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-background hover:bg-background-tertiary border border-border text-xs text-text-secondary hover:text-text transition-colors"
                    title="Copy Console Log"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearConsoleLogs}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-background hover:bg-rose-500/20 hover:text-rose-400 border border-border text-xs text-text-muted transition-colors"
                    title="Clear Console"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Console Terminal Output */}
              <div
                ref={consoleScrollRef}
                className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-1.5 font-mono text-xs select-text leading-relaxed"
              >
                {consoleLogs
                  .filter((l) => consoleStageFilter === 'ALL' || l.stage === consoleStageFilter)
                  .map((log) => {
                    const levelColor =
                      log.level === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : log.level === 'error'
                        ? 'text-rose-400 font-bold'
                        : log.stage === 'tunnel'
                        ? 'text-cyan-400'
                        : 'text-text-secondary';

                    const stageBg =
                      log.stage === 'bridge'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : log.stage === 'server'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : log.stage === 'device'
                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        : log.stage === 'tunnel'
                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        : 'bg-zinc-700/30 text-text-muted border-border';

                    return (
                      <div
                        key={log.id}
                        className="flex items-start space-x-2 py-0.5 hover:bg-white/5 px-1.5 rounded transition-colors"
                      >
                        <span className="text-text-muted shrink-0 text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border shrink-0 ${stageBg}`}>
                          {log.stage}
                        </span>
                        <span className={`flex-1 break-all ${levelColor}`}>{log.message}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 3. BREAKPOINTS STUDIO TAB */}
          {activeStudioTab === 'breakpoints' && (
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              {/* Left Column: Breakpoint Rules & Paused Queue */}
              <div className="w-full md:w-[45%] flex flex-col border-r border-border min-h-0 bg-background-secondary/30 p-3 space-y-4 overflow-y-auto no-scrollbar">
                {/* Paused Items Banner */}
                {pausedBreakpoints.length > 0 && (
                  <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                      <Pause className="w-4 h-4 animate-bounce" />
                      <span>{pausedBreakpoints.length} Live Paused Request(s)</span>
                    </div>
                    <div className="space-y-1">
                      {pausedBreakpoints.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setActivePausedId(p.id)}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs font-mono transition-colors ${
                            activePaused?.id === p.id
                              ? 'bg-amber-500 text-black font-bold'
                              : 'bg-background hover:bg-background-tertiary text-text'
                          }`}
                        >
                          <span className="truncate pr-2">{p.method} {p.url}</span>
                          <span className="text-[10px] uppercase font-sans tracking-wide">{p.phase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Breakpoint Rule */}
                <div className="p-3 bg-background rounded-xl border border-border space-y-3">
                  <span className="text-xs font-bold text-text block">Add Breakpoint Rule</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newBpPattern}
                      onChange={(e) => setNewBpPattern(e.target.value)}
                      placeholder="URL pattern (e.g. /api/v1/user or *.example.com)"
                      className="w-full bg-background-secondary border border-border rounded-lg px-3 py-1.5 text-xs text-text font-mono"
                    />

                    <div className="flex items-center space-x-2">
                      <select
                        value={newBpMethod}
                        onChange={(e) => setNewBpMethod(e.target.value)}
                        className="bg-background-secondary border border-border rounded-lg px-2 py-1.5 text-xs text-text font-bold"
                      >
                        <option value="ALL">ALL Methods</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>

                      <select
                        value={newBpPhase}
                        onChange={(e) => setNewBpPhase(e.target.value as any)}
                        className="bg-background-secondary border border-border rounded-lg px-2 py-1.5 text-xs text-text font-medium"
                      >
                        <option value="both">Both Request & Response</option>
                        <option value="request">Request Only</option>
                        <option value="response">Response Only</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newBpPattern.trim()) return;
                          addBreakpointRule({
                            name: `Breakpoint ${newBpPattern}`,
                            urlPattern: newBpPattern.trim(),
                            method: newBpMethod,
                            phase: newBpPhase,
                            enabled: true,
                          });
                          setNewBpPattern('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors shrink-0"
                      >
                        Add Rule
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Rules List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text block">Active Breakpoint Rules ({breakpointRules.length})</span>
                  {breakpointRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-2.5 bg-background rounded-xl border border-border flex items-center justify-between group hover:border-accent/60 transition-colors"
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => updateBreakpointRule(rule.id, { enabled: e.target.checked })}
                          className="rounded border-border accent-accent w-4 h-4"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-text truncate block">{rule.name}</span>
                          <span className="text-[11px] text-text-muted font-mono truncate block">{rule.method} • {rule.urlPattern} ({rule.phase})</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteBreakpointRule(rule.id)}
                        className="p-1 text-text-muted hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Live Paused Breakpoint Editor */}
              <div className="w-full md:w-[55%] flex flex-col min-h-0 bg-background p-4 overflow-y-auto no-scrollbar">
                {activePaused ? (
                  <div className="flex-1 flex flex-col space-y-4 min-h-0">
                    <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-400 block uppercase">
                          PAUSED {activePaused.phase} BREAKPOINT
                        </span>
                        <span className="text-xs text-text font-mono truncate block mt-0.5">
                          {activePaused.method} {activePaused.url}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => abortBreakpoint(activePaused.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                        >
                          Abort / Drop
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            resumeBreakpoint(activePaused.id, {
                              statusCode: bpEditStatus,
                              body: bpEditBody,
                            })
                          }
                          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Execute & Resume</span>
                        </button>
                      </div>
                    </div>

                    {/* Status Code Override */}
                    <div>
                      <label className="text-xs font-bold text-text block mb-1">Status Code</label>
                      <input
                        type="number"
                        value={bpEditStatus}
                        onChange={(e) => setBpEditStatus(parseInt(e.target.value, 10) || 200)}
                        className="w-24 bg-background-secondary border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text"
                      />
                    </div>

                    {/* Payload Body Override */}
                    <div className="flex-1 flex flex-col min-h-[220px]">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-text">Payload Body (Modify on the fly)</label>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const parsed = JSON.parse(bpEditBody);
                              setBpEditBody(JSON.stringify(parsed, null, 2));
                            } catch {}
                          }}
                          className="text-[11px] text-accent hover:underline font-medium"
                        >
                          Beautify JSON
                        </button>
                      </div>
                      <textarea
                        value={bpEditBody}
                        onChange={(e) => setBpEditBody(e.target.value)}
                        className="flex-1 w-full p-3 bg-background-secondary rounded-xl border border-border text-xs font-mono text-text focus:outline-hidden resize-none no-scrollbar leading-relaxed"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted p-6">
                    <Pause className="w-10 h-10 text-border mb-2" />
                    <p className="text-xs font-semibold text-text-secondary">No Active Breakpoint Pauses</p>
                    <p className="text-[11px] max-w-sm mt-1">
                      Add a breakpoint rule on the left. When a mobile request matches, it will pause here in real time so you can modify headers, status codes, and JSON bodies before resuming.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. MAP REMOTE & LOCAL TAB */}
          {activeStudioTab === 'map' && (
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto no-scrollbar p-4 gap-4">
              {/* Map Remote Section */}
              <div className="flex-1 bg-background-secondary/40 rounded-2xl border border-border p-4 flex flex-col space-y-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Split className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold text-text">Map Remote (URL Redirector)</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Redirect production API calls from your phone to local development backends.
                  </p>
                </div>

                <div className="space-y-2 p-3 bg-background rounded-xl border border-border">
                  <input
                    type="text"
                    value={newMrName}
                    onChange={(e) => setNewMrName(e.target.value)}
                    placeholder="Rule Name (e.g. Redirect Staging to Local)"
                    className="w-full bg-background-secondary border border-border rounded px-2.5 py-1 text-xs text-text"
                  />
                  <input
                    type="text"
                    value={newMrFrom}
                    onChange={(e) => setNewMrFrom(e.target.value)}
                    placeholder="From URL Pattern (e.g. https://api.prod.com)"
                    className="w-full bg-background-secondary border border-border rounded px-2.5 py-1 text-xs font-mono text-text"
                  />
                  <input
                    type="text"
                    value={newMrTo}
                    onChange={(e) => setNewMrTo(e.target.value)}
                    placeholder="To URL (e.g. http://localhost:3000)"
                    className="w-full bg-background-secondary border border-border rounded px-2.5 py-1 text-xs font-mono text-text"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMrFrom.trim() || !newMrTo.trim()) return;
                      addMapRemoteRule({
                        name: newMrName.trim() || 'Map Remote Rule',
                        fromPattern: newMrFrom.trim(),
                        toUrl: newMrTo.trim(),
                        enabled: true,
                      });
                      setNewMrName('');
                      setNewMrFrom('');
                      setNewMrTo('');
                    }}
                    className="w-full py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors"
                  >
                    Add Map Remote Rule
                  </button>
                </div>

                <div className="space-y-2">
                  {mapRemoteRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-2.5 bg-background rounded-xl border border-border flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => updateMapRemoteRule(rule.id, { enabled: e.target.checked })}
                          className="rounded border-border accent-accent w-4 h-4"
                        />
                        <div className="min-w-0 font-mono text-xs">
                          <span className="font-semibold text-text font-sans block">{rule.name}</span>
                          <span className="text-text-muted truncate block">{rule.fromPattern} ➔ <span className="text-accent">{rule.toUrl}</span></span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMapRemoteRule(rule.id)}
                        className="p-1 text-text-muted hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Local Section */}
              <div className="flex-1 bg-background-secondary/40 rounded-2xl border border-border p-4 flex flex-col space-y-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-text">Map Local (Instant JSON Mock)</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Intercept requests and serve static JSON files or mock responses without touching the network.
                  </p>
                </div>

                <div className="space-y-2 p-3 bg-background rounded-xl border border-border">
                  <input
                    type="text"
                    value={newMlName}
                    onChange={(e) => setNewMlName(e.target.value)}
                    placeholder="Rule Name (e.g. Mock Auth Session)"
                    className="w-full bg-background-secondary border border-border rounded px-2.5 py-1 text-xs text-text"
                  />
                  <input
                    type="text"
                    value={newMlMatch}
                    onChange={(e) => setNewMlMatch(e.target.value)}
                    placeholder="Match Pattern (e.g. /api/auth/session)"
                    className="w-full bg-background-secondary border border-border rounded px-2.5 py-1 text-xs font-mono text-text"
                  />
                  <textarea
                    value={newMlBody}
                    onChange={(e) => setNewMlBody(e.target.value)}
                    placeholder="Mock JSON response..."
                    className="w-full h-24 p-2 bg-background-secondary rounded border border-border text-xs font-mono text-text resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMlMatch.trim()) return;
                      addMapLocalRule({
                        name: newMlName.trim() || 'Map Local Mock',
                        matchPattern: newMlMatch.trim(),
                        statusCode: newMlStatus,
                        headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true }],
                        responseBody: newMlBody,
                        delayMs: 20,
                        enabled: true,
                      });
                      setNewMlName('');
                      setNewMlMatch('');
                    }}
                    className="w-full py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
                  >
                    Add Map Local Rule
                  </button>
                </div>

                <div className="space-y-2">
                  {mapLocalRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-2.5 bg-background rounded-xl border border-border flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => updateMapLocalRule(rule.id, { enabled: e.target.checked })}
                          className="rounded border-border accent-accent w-4 h-4"
                        />
                        <div className="min-w-0 font-mono text-xs">
                          <span className="font-semibold text-text font-sans block">{rule.name}</span>
                          <span className="text-text-muted truncate block">{rule.matchPattern} (Status: {rule.statusCode})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMapLocalRule(rule.id)}
                        className="p-1 text-text-muted hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. NETWORK THROTTLING TAB */}
          {activeStudioTab === 'throttling' && (
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar max-w-3xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-text">Network Bandwidth Throttling</h3>
                <p className="text-xs text-text-muted mt-1">
                  Simulate real-world poor mobile connections, packet drops, and high latency to test how your app behaves.
                </p>
              </div>

              {/* Profiles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'none', title: 'No Throttling', desc: 'Direct LAN speed' },
                  { id: 'slow3g', title: 'Slow 3G', desc: '400 Kbps • 400ms latency' },
                  { id: 'fast3g', title: 'Fast 3G', desc: '1.6 Mbps • 150ms latency' },
                  { id: '4g', title: '4G LTE', desc: '10 Mbps • 40ms latency' },
                  { id: 'highlatency', title: 'High Latency', desc: '1000ms delay • 2% loss' },
                  { id: 'offline', title: 'Airplane Mode', desc: '100% packet loss (Offline)' },
                ].map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => setThrottlingProfile(prof.id as ThrottlingProfile)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      throttling.profile === prof.id
                        ? 'border-accent bg-accent/15 shadow-md'
                        : 'border-border bg-background-secondary/60 hover:bg-background-secondary'
                    }`}
                  >
                    <span className="text-xs font-bold text-text block">{prof.title}</span>
                    <span className="text-[11px] text-text-muted mt-1 block">{prof.desc}</span>
                  </button>
                ))}
              </div>

              {/* Custom Controls */}
              <div className="p-4 bg-background-secondary rounded-2xl border border-border space-y-4">
                <span className="text-xs font-bold text-text block">Custom Network Simulation</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">Injected Latency Delay (ms)</label>
                    <input
                      type="number"
                      value={throttling.latencyMs}
                      onChange={(e) => updateThrottling({ latencyMs: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">Simulated Packet Loss (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={throttling.packetLossPercent}
                      onChange={(e) => updateThrottling({ packetLossPercent: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. DOMAIN WHITELIST TAB */}
          {activeStudioTab === 'domains' && (
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-text">Domain Whitelisting & Noise Filter</h3>
                <p className="text-xs text-text-muted mt-1">
                  Filter out operating system analytics and certificate-pinned domains so you only inspect your app's actual APIs.
                </p>
              </div>

              <div className="p-4 bg-background-secondary rounded-2xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text">Only Inspect Whitelisted Domains</span>
                    <p className="text-[11px] text-text-muted">Ignore all other background traffic</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={domainFilter.onlyWhitelisted}
                    onChange={(e) => updateDomainFilter({ onlyWhitelisted: e.target.checked })}
                    className="rounded border-border accent-accent w-4 h-4"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={newWhitelistDomain}
                    onChange={(e) => setNewWhitelistDomain(e.target.value)}
                    placeholder="Domain (e.g. api.cricketaustralia.com or *.myapp.dev)"
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newWhitelistDomain.trim()) return;
                      updateDomainFilter({
                        whitelist: [...domainFilter.whitelist, newWhitelistDomain.trim()],
                      });
                      setNewWhitelistDomain('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors"
                  >
                    Add Domain
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {domainFilter.whitelist.map((domain, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-background rounded-lg border border-border flex items-center justify-between font-mono text-xs"
                    >
                      <span className="text-text">{domain}</span>
                      <button
                        type="button"
                        onClick={() => {
                          updateDomainFilter({
                            whitelist: domainFilter.whitelist.filter((_, i) => i !== idx),
                          });
                        }}
                        className="p-1 text-text-muted hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. TRAFFIC DIFF TAB */}
          {activeStudioTab === 'diff' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text">Visual Request / Response Diff</h3>
                  <p className="text-[11px] text-text-muted">Compare two captured API calls side-by-side to inspect payload differences.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={diffLog1?.id || ''}
                    onChange={(e) => setDiffLogIds([e.target.value, diffLog2?.id || null])}
                    className="bg-background-secondary border border-border rounded-lg px-2.5 py-1 text-xs text-text font-mono max-w-xs truncate"
                  >
                    {trafficLogs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.method} {l.path} ({l.statusCode})
                      </option>
                    ))}
                  </select>

                  <span className="text-text-muted text-xs font-bold">vs</span>

                  <select
                    value={diffLog2?.id || ''}
                    onChange={(e) => setDiffLogIds([diffLog1?.id || null, e.target.value])}
                    className="bg-background-secondary border border-border rounded-lg px-2.5 py-1 text-xs text-text font-mono max-w-xs truncate"
                  >
                    {trafficLogs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.method} {l.path} ({l.statusCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side by Side Panes */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                {/* Left Request */}
                <div className="p-3 bg-background-secondary/60 rounded-2xl border border-border flex flex-col min-h-0">
                  <div className="flex items-center justify-between pb-2 border-b border-border mb-2 text-xs font-mono">
                    <span className="font-bold text-text">{diffLog1?.method} {diffLog1?.path}</span>
                    <span className="text-emerald-400 font-bold">{diffLog1?.statusCode}</span>
                  </div>
                  <pre className="flex-1 p-2 bg-background rounded-xl border border-border text-xs font-mono text-text overflow-y-auto no-scrollbar whitespace-pre-wrap break-all leading-relaxed">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(diffLog1?.responseBody || '{}'), null, 2);
                      } catch {
                        return diffLog1?.responseBody || '(Empty)';
                      }
                    })()}
                  </pre>
                </div>

                {/* Right Request */}
                <div className="p-3 bg-background-secondary/60 rounded-2xl border border-border flex flex-col min-h-0">
                  <div className="flex items-center justify-between pb-2 border-b border-border mb-2 text-xs font-mono">
                    <span className="font-bold text-text">{diffLog2?.method} {diffLog2?.path}</span>
                    <span className="text-emerald-400 font-bold">{diffLog2?.statusCode}</span>
                  </div>
                  <pre className="flex-1 p-2 bg-background rounded-xl border border-border text-xs font-mono text-text overflow-y-auto no-scrollbar whitespace-pre-wrap break-all leading-relaxed">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(diffLog2?.responseBody || '{}'), null, 2);
                      } catch {
                        return diffLog2?.responseBody || '(Empty)';
                      }
                    })()}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 7. SETUP GUIDES TAB */}
          {activeStudioTab === 'guide' && (
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar max-w-3xl space-y-6">
              {/* Guide Selector */}
              <div className="flex items-center space-x-1 bg-background-secondary rounded-xl p-1 border border-border text-xs">
                {(['ios', 'android', 'flutter', 'react-native'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveGuideTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                      activeGuideTab === tab ? 'bg-accent text-white shadow-xs' : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {activeGuideTab === 'ios' && (
                <div className="space-y-4 text-xs leading-relaxed text-text-secondary">
                  <h4 className="text-sm font-bold text-text">iOS (iPhone / iPad) Wi-Fi Proxy Setup</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Connect your iPhone to the <strong>same Wi-Fi network</strong> as your development computer.</li>
                    <li>Open <strong>Settings ➔ Wi-Fi ➔ Click (i) on your connected network</strong>.</li>
                    <li>Scroll to <strong>HTTP Proxy ➔ Configure Proxy ➔ Select Manual</strong>.</li>
                    <li>
                      Enter Server: <code className="text-accent font-bold">{localIps[0] || '127.0.0.1'}</code> and Port: <code className="text-accent font-bold">{port}</code>.
                    </li>
                    <li>
                      Download the <button onClick={handleDownloadCaCert} className="text-accent underline font-bold">Endly Root CA Certificate</button> in Safari on your iPhone.
                    </li>
                    <li>Open <strong>Settings ➔ Profile Downloaded ➔ Install</strong>.</li>
                    <li>Enable Full Trust: Go to <strong>Settings ➔ General ➔ About ➔ Certificate Trust Settings ➔ Toggle ON Endly Root Certificate</strong>.</li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'android' && (
                <div className="space-y-4 text-xs leading-relaxed text-text-secondary">
                  <h4 className="text-sm font-bold text-text">Android Wi-Fi Proxy & Security Config</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to <strong>Settings ➔ Network & Internet ➔ Wi-Fi ➔ Modify Network</strong>.</li>
                    <li>Set Proxy to <strong>Manual</strong> with Host: <code className="text-accent font-bold">{localIps[0] || '127.0.0.1'}</code> and Port: <code className="text-accent font-bold">{port}</code>.</li>
                    <li>Install CA Certificate via <strong>Settings ➔ Security ➔ Install from storage ➔ CA Certificate</strong>.</li>
                    <li>For Android 7.0+ (API 24+), ensure your app includes a debug network security config:</li>
                  </ol>
                  <pre className="p-3 bg-background-secondary rounded-xl border border-border font-mono text-[11px] text-text">
{`<!-- res/xml/network_security_config.xml -->
<network-security-config>
  <debug-overrides>
    <trust-anchors>
      <certificates src="user" />
      <certificates src="system" />
    </trust-anchors>
  </debug-overrides>
</network-security-config>`}
                  </pre>
                </div>
              )}

              {activeGuideTab === 'flutter' && (
                <div className="space-y-4 text-xs leading-relaxed text-text-secondary">
                  <h4 className="text-sm font-bold text-text">Flutter Mobile Setup</h4>
                  <p>In your Flutter HTTP client setup (e.g. `HttpOverrides`):</p>
                  <pre className="p-3 bg-background-secondary rounded-xl border border-border font-mono text-[11px] text-text">
{`class EndlyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..findProxy = (uri) => "PROXY ${localIps[0] || '127.0.0.1'}:${port}"
      ..badCertificateCallback = (cert, host, port) => true;
  }
}`}
                  </pre>
                </div>
              )}

              {activeGuideTab === 'react-native' && (
                <div className="space-y-4 text-xs leading-relaxed text-text-secondary">
                  <h4 className="text-sm font-bold text-text">React Native Setup</h4>
                  <p>React Native automatically respects your physical phone's Wi-Fi proxy settings. Simply set the manual Wi-Fi proxy and install the Endly Root CA certificate!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
