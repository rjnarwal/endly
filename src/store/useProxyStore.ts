import { create } from 'zustand';
import { HttpRequestMethod } from '../types';
import { useMockStore } from './useMockStore';
import { isTauriEnvironment } from '../services/httpDispatcher';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export interface TrafficLogItem {
  id: string;
  timestamp: number;
  method: HttpRequestMethod;
  url: string;
  path: string;
  statusCode: number;
  statusText: string;
  isMocked: boolean;
  mockId?: string;
  isBreakpointed?: boolean;
  isMappedRemote?: boolean;
  originalUrl?: string;
  timeMs: number;
  sizeBytes: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  clientIp?: string;
}

export interface BreakpointRule {
  id: string;
  name: string;
  urlPattern: string;
  method: string; // 'ALL' | HttpRequestMethod
  phase: 'request' | 'response' | 'both';
  enabled: boolean;
}

export interface PausedBreakpointItem {
  id: string;
  trafficId: string;
  timestamp: number;
  phase: 'request' | 'response';
  method: HttpRequestMethod;
  url: string;
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  originalHeaders: Record<string, string>;
  originalBody: string;
  originalStatus: number;
}

export interface MapRemoteRule {
  id: string;
  name: string;
  fromPattern: string;
  toUrl: string;
  enabled: boolean;
}

export interface MapLocalRule {
  id: string;
  name: string;
  matchPattern: string;
  statusCode: number;
  headers: { id: string; key: string; value: string; enabled: boolean }[];
  responseBody: string;
  delayMs: number;
  enabled: boolean;
}

export type ThrottlingProfile = 'none' | 'slow3g' | 'fast3g' | '4g' | 'highlatency' | 'offline' | 'custom';

export interface ThrottlingConfig {
  profile: ThrottlingProfile;
  downloadKbps: number;
  uploadKbps: number;
  latencyMs: number;
  packetLossPercent: number;
  enabled: boolean;
}

export interface DomainFilterConfig {
  whitelist: string[];
  blacklist: string[];
  onlyWhitelisted: boolean;
}

interface ProxyState {
  isOpen: boolean;
  isRunning: boolean;
  port: number;
  localIps: string[];
  trafficLogs: TrafficLogItem[];
  selectedLogId: string | null;
  activeStudioTab: 'traffic' | 'breakpoints' | 'map' | 'throttling' | 'domains' | 'diff' | 'guide';
  activeGuideTab: 'ios' | 'android' | 'flutter' | 'react-native';

  // Breakpoints
  breakpointRules: BreakpointRule[];
  pausedBreakpoints: PausedBreakpointItem[];
  activePausedId: string | null;

  // Map Rules
  mapRemoteRules: MapRemoteRule[];
  mapLocalRules: MapLocalRule[];

  // Throttling
  throttling: ThrottlingConfig;

  // Domain Filter
  domainFilter: DomainFilterConfig;

  // Diff comparison
  diffLogIds: [string | null, string | null];

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setPort: (port: number) => void;
  setLocalIps: (localIps: string[]) => void;
  setActiveStudioTab: (tab: ProxyState['activeStudioTab']) => void;
  setActiveGuideTab: (tab: 'ios' | 'android' | 'flutter' | 'react-native') => void;
  setSelectedLogId: (id: string | null) => void;
  startProxy: () => Promise<boolean>;
  stopProxy: () => Promise<void>;
  addTrafficLog: (log: TrafficLogItem) => void;
  clearTrafficLogs: () => void;

  // Breakpoint Actions
  addBreakpointRule: (rule: Omit<BreakpointRule, 'id'>) => void;
  updateBreakpointRule: (id: string, updates: Partial<BreakpointRule>) => void;
  deleteBreakpointRule: (id: string) => void;
  resumeBreakpoint: (pausedId: string, modified?: { statusCode?: number; headers?: Record<string, string>; body?: string }) => void;
  abortBreakpoint: (pausedId: string) => void;
  setActivePausedId: (id: string | null) => void;

  // Map Actions
  addMapRemoteRule: (rule: Omit<MapRemoteRule, 'id'>) => void;
  updateMapRemoteRule: (id: string, updates: Partial<MapRemoteRule>) => void;
  deleteMapRemoteRule: (id: string) => void;
  addMapLocalRule: (rule: Omit<MapLocalRule, 'id'>) => void;
  updateMapLocalRule: (id: string, updates: Partial<MapLocalRule>) => void;
  deleteMapLocalRule: (id: string) => void;

  // Throttling Actions
  setThrottlingProfile: (profile: ThrottlingProfile) => void;
  updateThrottling: (updates: Partial<ThrottlingConfig>) => void;

  // Domain Actions
  updateDomainFilter: (updates: Partial<DomainFilterConfig>) => void;

  // Diff Actions
  setDiffLogIds: (ids: [string | null, string | null]) => void;
}

let wsConnection: WebSocket | null = null;

const DEFAULT_BREAKPOINTS: BreakpointRule[] = [
  {
    id: 'bp-1',
    name: 'User API Profile Breakpoint',
    urlPattern: '/api/v1/user',
    method: 'ALL',
    phase: 'both',
    enabled: false,
  },
];

const DEFAULT_MAP_REMOTE: MapRemoteRule[] = [
  {
    id: 'mr-1',
    name: 'Redirect Staging to Localhost',
    fromPattern: 'https://staging-api.myapp.com',
    toUrl: 'http://localhost:3000',
    enabled: false,
  },
];

const DEFAULT_MAP_LOCAL: MapLocalRule[] = [
  {
    id: 'ml-1',
    name: 'Mock Auth Session Check',
    matchPattern: '/api/auth/session',
    statusCode: 200,
    headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json', enabled: true }],
    responseBody: JSON.stringify({ user: { id: 'usr_882', email: 'dev@grassroot.digital', role: 'developer' }, authenticated: true }, null, 2),
    delayMs: 50,
    enabled: false,
  },
];

const THROTTLING_PROFILES: Record<ThrottlingProfile, Partial<ThrottlingConfig>> = {
  none: { downloadKbps: 0, uploadKbps: 0, latencyMs: 0, packetLossPercent: 0, enabled: false },
  slow3g: { downloadKbps: 400, uploadKbps: 400, latencyMs: 400, packetLossPercent: 0, enabled: true },
  fast3g: { downloadKbps: 1600, uploadKbps: 750, latencyMs: 150, packetLossPercent: 0, enabled: true },
  '4g': { downloadKbps: 10000, uploadKbps: 5000, latencyMs: 40, packetLossPercent: 0, enabled: true },
  highlatency: { downloadKbps: 5000, uploadKbps: 2000, latencyMs: 1000, packetLossPercent: 2, enabled: true },
  offline: { downloadKbps: 0, uploadKbps: 0, latencyMs: 0, packetLossPercent: 100, enabled: true },
  custom: { downloadKbps: 1000, uploadKbps: 1000, latencyMs: 200, packetLossPercent: 0, enabled: true },
};

export const useProxyStore = create<ProxyState>((set, get) => ({
  isOpen: false,
  isRunning: false,
  port: 8888,
  localIps: ['127.0.0.1'],
  trafficLogs: [],
  selectedLogId: null,
  activeStudioTab: 'traffic',
  activeGuideTab: 'ios',

  breakpointRules: DEFAULT_BREAKPOINTS,
  pausedBreakpoints: [],
  activePausedId: null,

  mapRemoteRules: DEFAULT_MAP_REMOTE,
  mapLocalRules: DEFAULT_MAP_LOCAL,

  throttling: {
    profile: 'none',
    downloadKbps: 0,
    uploadKbps: 0,
    latencyMs: 0,
    packetLossPercent: 0,
    enabled: false,
  },

  domainFilter: {
    whitelist: [],
    blacklist: ['apple.com', 'google-analytics.com', 'crashlytics.com'],
    onlyWhitelisted: false,
  },

  diffLogIds: [null, null],

  openModal: () => {
    set({ isOpen: true });
    if (!isTauriEnvironment() && !wsConnection) {
      connectToLocalProxyBridge(get);
    }
  },

  closeModal: () => set({ isOpen: false }),
  setPort: (port) => set({ port }),
  setLocalIps: (localIps) => set({ localIps }),
  setActiveStudioTab: (tab) => set({ activeStudioTab: tab }),
  setActiveGuideTab: (tab) => set({ activeGuideTab: tab }),
  setSelectedLogId: (id) => set({ selectedLogId: id }),

  startProxy: async () => {
    const { port, breakpointRules, mapRemoteRules, mapLocalRules, throttling, domainFilter } = get();
    const mocks = useMockStore.getState().mocks;

    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const res = await invoke<{ success: boolean; ips: string[] }>('start_proxy_server', {
          port,
          mocks,
        });
        if (res.success) {
          set({ isRunning: true, localIps: res.ips || ['127.0.0.1'] });
          return true;
        }
      } catch (err) {
        console.error('Failed to start Tauri proxy server:', err);
      }
    } else {
      try {
        connectToLocalProxyBridge(get);
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
          wsConnection.send(
            JSON.stringify({
              type: 'START_PROXY',
              port,
              mocks,
              breakpoints: breakpointRules,
              mapRemote: mapRemoteRules,
              mapLocal: mapLocalRules,
              throttling,
              domainFilter,
            })
          );
          set({ isRunning: true });
          return true;
        }
      } catch (err) {
        console.warn('Companion proxy not running yet', err);
      }
    }

    set({ isRunning: true });
    return true;
  },

  stopProxy: async () => {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('stop_proxy_server');
      } catch (err) {
        console.error('Failed to stop Tauri proxy server:', err);
      }
    } else if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({ type: 'STOP_PROXY' }));
    }

    set({ isRunning: false });
  },

  addTrafficLog: (log) => {
    const { domainFilter, breakpointRules } = get();

    // Domain Filtering
    if (domainFilter.onlyWhitelisted && domainFilter.whitelist.length > 0) {
      const matches = domainFilter.whitelist.some((d) => log.url.toLowerCase().includes(d.toLowerCase()));
      if (!matches) return;
    }

    if (domainFilter.blacklist.some((d) => log.url.toLowerCase().includes(d.toLowerCase()))) {
      return;
    }

    // Check for Matching Breakpoint
    const matchingBp = breakpointRules.find((bp) => {
      if (!bp.enabled) return false;
      if (bp.method !== 'ALL' && bp.method !== log.method) return false;
      return log.url.toLowerCase().includes(bp.urlPattern.toLowerCase()) || log.path.toLowerCase().includes(bp.urlPattern.toLowerCase());
    });

    if (matchingBp) {
      const pausedItem: PausedBreakpointItem = {
        id: generateId(),
        trafficId: log.id,
        timestamp: Date.now(),
        phase: matchingBp.phase === 'response' ? 'response' : 'request',
        method: log.method,
        url: log.url,
        statusCode: log.statusCode || 200,
        statusText: log.statusText || 'OK',
        headers: matchingBp.phase === 'response' ? { ...log.responseHeaders } : { ...log.requestHeaders },
        body: (matchingBp.phase === 'response' ? log.responseBody : log.requestBody) || '',
        originalHeaders: matchingBp.phase === 'response' ? { ...log.responseHeaders } : { ...log.requestHeaders },
        originalBody: (matchingBp.phase === 'response' ? log.responseBody : log.requestBody) || '',
        originalStatus: log.statusCode || 200,
      };

      set((state) => ({
        trafficLogs: [{ ...log, isBreakpointed: true }, ...state.trafficLogs].slice(0, 300),
        pausedBreakpoints: [...state.pausedBreakpoints, pausedItem],
        activePausedId: state.activePausedId || pausedItem.id,
        activeStudioTab: 'breakpoints',
      }));
      return;
    }

    set((state) => ({
      trafficLogs: [log, ...state.trafficLogs].slice(0, 300),
    }));
  },

  clearTrafficLogs: () => set({ trafficLogs: [], selectedLogId: null, pausedBreakpoints: [], activePausedId: null }),

  // Breakpoints Actions
  addBreakpointRule: (rule) => {
    const newRule: BreakpointRule = { ...rule, id: generateId() };
    set((state) => ({ breakpointRules: [...state.breakpointRules, newRule] }));
    syncRulesToBridge(get);
  },

  updateBreakpointRule: (id, updates) => {
    set((state) => ({
      breakpointRules: state.breakpointRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    syncRulesToBridge(get);
  },

  deleteBreakpointRule: (id) => {
    set((state) => ({
      breakpointRules: state.breakpointRules.filter((r) => r.id !== id),
    }));
    syncRulesToBridge(get);
  },

  resumeBreakpoint: (pausedId, modified) => {
    const paused = get().pausedBreakpoints.find((p) => p.id === pausedId);
    if (!paused) return;

    // Update the corresponding traffic log item
    set((state) => ({
      trafficLogs: state.trafficLogs.map((log) => {
        if (log.id === paused.trafficId) {
          return {
            ...log,
            statusCode: modified?.statusCode !== undefined ? modified.statusCode : paused.statusCode,
            responseHeaders: modified?.headers || paused.headers,
            responseBody: modified?.body !== undefined ? modified.body : paused.body,
            isBreakpointed: false,
          };
        }
        return log;
      }),
      pausedBreakpoints: state.pausedBreakpoints.filter((p) => p.id !== pausedId),
      activePausedId: state.pausedBreakpoints.filter((p) => p.id !== pausedId)[0]?.id || null,
    }));

    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(
        JSON.stringify({
          type: 'RESUME_BREAKPOINT',
          pausedId,
          modified,
        })
      );
    }
  },

  abortBreakpoint: (pausedId) => {
    set((state) => ({
      pausedBreakpoints: state.pausedBreakpoints.filter((p) => p.id !== pausedId),
      activePausedId: state.pausedBreakpoints.filter((p) => p.id !== pausedId)[0]?.id || null,
    }));

    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({ type: 'ABORT_BREAKPOINT', pausedId }));
    }
  },

  setActivePausedId: (id) => set({ activePausedId: id }),

  // Map Actions
  addMapRemoteRule: (rule) => {
    const newRule: MapRemoteRule = { ...rule, id: generateId() };
    set((state) => ({ mapRemoteRules: [...state.mapRemoteRules, newRule] }));
    syncRulesToBridge(get);
  },

  updateMapRemoteRule: (id, updates) => {
    set((state) => ({
      mapRemoteRules: state.mapRemoteRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    syncRulesToBridge(get);
  },

  deleteMapRemoteRule: (id) => {
    set((state) => ({
      mapRemoteRules: state.mapRemoteRules.filter((r) => r.id !== id),
    }));
    syncRulesToBridge(get);
  },

  addMapLocalRule: (rule) => {
    const newRule: MapLocalRule = { ...rule, id: generateId() };
    set((state) => ({ mapLocalRules: [...state.mapLocalRules, newRule] }));
    syncRulesToBridge(get);
  },

  updateMapLocalRule: (id, updates) => {
    set((state) => ({
      mapLocalRules: state.mapLocalRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    syncRulesToBridge(get);
  },

  deleteMapLocalRule: (id) => {
    set((state) => ({
      mapLocalRules: state.mapLocalRules.filter((r) => r.id !== id),
    }));
    syncRulesToBridge(get);
  },

  // Throttling
  setThrottlingProfile: (profile) => {
    const profileValues = THROTTLING_PROFILES[profile];
    set((state) => ({
      throttling: {
        ...state.throttling,
        ...profileValues,
        profile,
      },
    }));
    syncRulesToBridge(get);
  },

  updateThrottling: (updates) => {
    set((state) => ({
      throttling: { ...state.throttling, ...updates, profile: 'custom' },
    }));
    syncRulesToBridge(get);
  },

  // Domain Filter
  updateDomainFilter: (updates) => {
    set((state) => ({
      domainFilter: { ...state.domainFilter, ...updates },
    }));
    syncRulesToBridge(get);
  },

  // Diff
  setDiffLogIds: (ids) => set({ diffLogIds: ids }),
}));

function syncRulesToBridge(get: () => ProxyState) {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    const { breakpointRules, mapRemoteRules, mapLocalRules, throttling, domainFilter } = get();
    wsConnection.send(
      JSON.stringify({
        type: 'SYNC_ALL_RULES',
        breakpoints: breakpointRules,
        mapRemote: mapRemoteRules,
        mapLocal: mapLocalRules,
        throttling,
        domainFilter,
      })
    );
  }
}

function connectToLocalProxyBridge(get: () => ProxyState) {
  try {
    const ws = new WebSocket('ws://localhost:8889');

    ws.onopen = () => {
      wsConnection = ws;
      ws.send(JSON.stringify({ type: 'GET_STATUS' }));
      syncRulesToBridge(get);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'STATUS') {
          useProxyStore.setState({
            isRunning: data.isRunning,
            port: data.port || 8888,
            localIps: data.localIps || ['127.0.0.1'],
          });
        } else if (data.type === 'TRAFFIC_EVENT') {
          get().addTrafficLog(data.log);
        }
      } catch (e) {
        console.error('Error parsing proxy bridge message', e);
      }
    };

    ws.onclose = () => {
      wsConnection = null;
    };

    ws.onerror = () => {
      wsConnection = null;
    };
  } catch {
    wsConnection = null;
  }
}
