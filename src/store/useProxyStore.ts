import { create } from 'zustand';
import { HttpRequestMethod, MockEndpoint } from '../types';
import { useMockStore } from './useMockStore';
import { isTauriEnvironment } from '../services/httpDispatcher';

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
  timeMs: number;
  sizeBytes: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  clientIp?: string;
}

interface ProxyState {
  isOpen: boolean;
  isRunning: boolean;
  port: number;
  localIps: string[];
  trafficLogs: TrafficLogItem[];
  selectedLogId: string | null;
  activeGuideTab: 'ios' | 'android' | 'flutter' | 'react-native';

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setPort: (port: number) => void;
  setLocalIps: (ips: string[]) => void;
  setActiveGuideTab: (tab: 'ios' | 'android' | 'flutter' | 'react-native') => void;
  setSelectedLogId: (id: string | null) => void;
  startProxy: () => Promise<boolean>;
  stopProxy: () => Promise<void>;
  addTrafficLog: (log: TrafficLogItem) => void;
  clearTrafficLogs: () => void;
}

let wsConnection: WebSocket | null = null;

export const useProxyStore = create<ProxyState>((set, get) => ({
  isOpen: false,
  isRunning: false,
  port: 8888,
  localIps: ['127.0.0.1'],
  trafficLogs: [],
  selectedLogId: null,
  activeGuideTab: 'ios',

  openModal: () => {
    set({ isOpen: true });
    // Try to auto-connect to local proxy runner if running in browser
    if (!isTauriEnvironment() && !wsConnection) {
      connectToLocalProxyBridge(get);
    }
  },

  closeModal: () => set({ isOpen: false }),
  setPort: (port) => set({ port }),
  setLocalIps: (localIps) => set({ localIps }),
  setActiveGuideTab: (tab) => set({ activeGuideTab: tab }),
  setSelectedLogId: (id) => set({ selectedLogId: id }),

  startProxy: async () => {
    const { port } = get();
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
      // In web mode: connect to companion proxy runner if available
      try {
        connectToLocalProxyBridge(get);
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
          wsConnection.send(
            JSON.stringify({
              type: 'START_PROXY',
              port,
              mocks,
            })
          );
          set({ isRunning: true });
          return true;
        }
      } catch (err) {
        console.warn('Companion proxy not running yet', err);
      }
    }

    // Set fallback active state for demonstration/mocking
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
    set((state) => ({
      trafficLogs: [log, ...state.trafficLogs].slice(0, 200), // keep latest 200
    }));
  },

  clearTrafficLogs: () => set({ trafficLogs: [], selectedLogId: null }),
}));

function connectToLocalProxyBridge(get: () => ProxyState) {
  try {
    const ws = new WebSocket('ws://localhost:8889');

    ws.onopen = () => {
      wsConnection = ws;
      // Request status and IPs
      ws.send(JSON.stringify({ type: 'GET_STATUS' }));
      // Sync mock rules
      const mocks = useMockStore.getState().mocks;
      ws.send(JSON.stringify({ type: 'SYNC_MOCKS', mocks }));
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
