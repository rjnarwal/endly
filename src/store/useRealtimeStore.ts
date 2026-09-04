import { create } from 'zustand';
import {
  RealtimeConnectionConfig,
  RealtimeFrame,
  RealtimeMessageSnippet,
  RealtimeProtocol,
  RealtimeSessionState,
} from '../types/realtime';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const DEFAULT_CONFIG: RealtimeConnectionConfig = {
  url: 'wss://echo.websocket.events',
  protocol: 'ws',
  subprotocols: [],
  headers: [],
  queryParams: [],
  heartbeatEnabled: false,
  heartbeatIntervalSec: 15,
  heartbeatPayload: '{"type":"ping"}',
  autoReconnect: false,
  maxReconnectAttempts: 3,
};

const DEFAULT_SNIPPETS: RealtimeMessageSnippet[] = [
  {
    id: 's1',
    name: 'Echo Ping',
    payload: JSON.stringify({ type: 'ping', timestamp: Date.now() }, null, 2),
    format: 'json',
  },
  {
    id: 's2',
    name: 'Subscribe Channel',
    payload: JSON.stringify({ action: 'subscribe', channel: 'live_updates' }, null, 2),
    format: 'json',
  },
  {
    id: 's3',
    name: 'Greeting Text',
    payload: 'Hello from Endly Real-Time Client!',
    format: 'text',
  },
];

export function createDefaultRealtimeSession(tabId: string, initialUrl?: string, protocol: RealtimeProtocol = 'ws'): RealtimeSessionState {
  return {
    tabId,
    status: 'disconnected',
    statusText: 'Ready to connect',
    config: {
      ...DEFAULT_CONFIG,
      url: initialUrl || (protocol === 'ws' ? 'wss://echo.websocket.events' : 'https://stream.wikimedia.org/v2/stream/recentchange'),
      protocol,
    },
    frames: [],
    activeComposerFormat: 'json',
    composerContent: '{\n  "message": "Hello from Endly Real-Time!",\n  "timestamp": ' + Date.now() + '\n}',
    selectedFrameId: null,
    filterDirection: 'all',
    filterSearch: '',
    autoScroll: true,
    snippets: [...DEFAULT_SNIPPETS],
    stats: {
      connectedAt: null,
      bytesSent: 0,
      bytesReceived: 0,
      messagesSent: 0,
      messagesReceived: 0,
      lastPingMs: undefined,
    },
  };
}

// Runtime instances of sockets & event sources (not kept in zustand react state)
const activeSockets = new Map<string, WebSocket>();
const activeEventSources = new Map<string, EventSource>();
const activeHeartbeats = new Map<string, number>();

interface RealtimeStore {
  sessions: Record<string, RealtimeSessionState>;
  
  // Session Access & Lifecycle
  getSession: (tabId: string) => RealtimeSessionState;
  initSession: (tabId: string, initialUrl?: string, protocol?: RealtimeProtocol) => void;
  updateSession: (tabId: string, updater: (prev: RealtimeSessionState) => Partial<RealtimeSessionState>) => void;
  updateConfig: (tabId: string, updates: Partial<RealtimeConnectionConfig>) => void;
  
  // Realtime Actions
  connect: (tabId: string) => void;
  disconnect: (tabId: string, reason?: string) => void;
  sendMessage: (tabId: string, customPayload?: string) => void;
  clearFrames: (tabId: string) => void;
  
  // UI & Filters
  setSelectedFrame: (tabId: string, frameId: string | null) => void;
  setFilterDirection: (tabId: string, dir: 'all' | 'incoming' | 'outgoing' | 'system') => void;
  setFilterSearch: (tabId: string, query: string) => void;
  setComposerContent: (tabId: string, content: string) => void;
  setComposerFormat: (tabId: string, format: 'json' | 'text' | 'binary') => void;
  toggleAutoScroll: (tabId: string) => void;
  
  // Snippets
  addSnippet: (tabId: string, name: string, payload: string, format: 'json' | 'text' | 'binary') => void;
  removeSnippet: (tabId: string, snippetId: string) => void;
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  sessions: {},

  getSession: (tabId: string) => {
    const s = get().sessions[tabId];
    if (s) return s;
    const fresh = createDefaultRealtimeSession(tabId);
    set((state) => ({ sessions: { ...state.sessions, [tabId]: fresh } }));
    return fresh;
  },

  initSession: (tabId: string, initialUrl?: string, protocol: RealtimeProtocol = 'ws') => {
    if (!get().sessions[tabId]) {
      const fresh = createDefaultRealtimeSession(tabId, initialUrl, protocol);
      set((state) => ({ sessions: { ...state.sessions, [tabId]: fresh } }));
    }
  },

  updateSession: (tabId: string, updater) => {
    set((state) => {
      const current = state.sessions[tabId] || createDefaultRealtimeSession(tabId);
      const updates = updater(current);
      return {
        sessions: {
          ...state.sessions,
          [tabId]: { ...current, ...updates },
        },
      };
    });
  },

  updateConfig: (tabId: string, updates) => {
    set((state) => {
      const current = state.sessions[tabId] || createDefaultRealtimeSession(tabId);
      return {
        sessions: {
          ...state.sessions,
          [tabId]: {
            ...current,
            config: { ...current.config, ...updates },
          },
        },
      };
    });
  },

  connect: (tabId: string) => {
    const session = get().sessions[tabId] || createDefaultRealtimeSession(tabId);
    const { config } = session;

    // Disconnect any existing connection first
    get().disconnect(tabId, 'Reconnecting');

    // Build URL with query params
    let targetUrl = config.url.trim();
    if (!targetUrl) return;

    // Interpolate environment variables if any
    try {
      const activeEnvVars = JSON.parse(localStorage.getItem('endly_active_env_vars') || '{}');
      Object.keys(activeEnvVars).forEach((key) => {
        targetUrl = targetUrl.replace(new RegExp(`{{${key}}}`, 'g'), activeEnvVars[key]);
      });
    } catch {
      // ignore
    }

    const enabledParams = config.queryParams.filter((p) => p.enabled && p.key);
    if (enabledParams.length > 0) {
      const urlObj = new URL(targetUrl.startsWith('ws') ? targetUrl.replace(/^ws/, 'http') : targetUrl);
      enabledParams.forEach((p) => urlObj.searchParams.set(p.key, p.value));
      targetUrl = targetUrl.startsWith('ws')
        ? urlObj.toString().replace(/^http/, 'ws')
        : urlObj.toString();
    }

    get().updateSession(tabId, () => ({
      status: 'connecting',
      statusText: `Connecting to ${targetUrl}...`,
    }));

    const systemFrame = (text: string, isError = false): RealtimeFrame => ({
      id: generateId(),
      tabId,
      direction: 'system',
      format: 'text',
      payload: text,
      sizeBytes: new Blob([text]).size,
      timestamp: Date.now(),
      isError,
    });

    if (config.protocol === 'ws') {
      try {
        const protocols = config.subprotocols.length > 0 ? config.subprotocols : undefined;
        const ws = new WebSocket(targetUrl, protocols);
        activeSockets.set(tabId, ws);

        const startTime = Date.now();

        ws.onopen = () => {
          const connectLatency = Date.now() - startTime;
          get().updateSession(tabId, (prev) => ({
            status: 'connected',
            statusText: `Connected (${connectLatency}ms)`,
            frames: [
              ...prev.frames,
              systemFrame(`[CONNECTED] WebSocket connection established to ${targetUrl} (Handshake: ${connectLatency}ms)`),
            ],
            stats: {
              ...prev.stats,
              connectedAt: Date.now(),
            },
          }));

          // Heartbeat handler
          if (config.heartbeatEnabled && config.heartbeatIntervalSec > 0) {
            const timer = window.setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                const pingTime = Date.now();
                ws.send(config.heartbeatPayload);
                const pingFrame: RealtimeFrame = {
                  id: generateId(),
                  tabId,
                  direction: 'outgoing',
                  format: 'json',
                  payload: config.heartbeatPayload,
                  sizeBytes: new Blob([config.heartbeatPayload]).size,
                  timestamp: pingTime,
                };
                get().updateSession(tabId, (prev) => ({
                  frames: [...prev.frames, pingFrame],
                  stats: {
                    ...prev.stats,
                    bytesSent: prev.stats.bytesSent + pingFrame.sizeBytes,
                    messagesSent: prev.stats.messagesSent + 1,
                  },
                }));
              }
            }, config.heartbeatIntervalSec * 1000);
            activeHeartbeats.set(tabId, timer);
          }
        };

        ws.onmessage = (event) => {
          const receiveTime = Date.now();
          const rawData = event.data;
          const payloadStr = typeof rawData === 'string' ? rawData : '[Binary data received]';
          const size = new Blob([rawData]).size;

          let format: 'json' | 'text' | 'binary' = 'text';
          try {
            JSON.parse(payloadStr);
            format = 'json';
          } catch {
            format = typeof rawData === 'string' ? 'text' : 'binary';
          }

          const frame: RealtimeFrame = {
            id: generateId(),
            tabId,
            direction: 'incoming',
            format,
            payload: payloadStr,
            sizeBytes: size,
            timestamp: receiveTime,
          };

          get().updateSession(tabId, (prev) => ({
            frames: [...prev.frames, frame],
            stats: {
              ...prev.stats,
              bytesReceived: prev.stats.bytesReceived + size,
              messagesReceived: prev.stats.messagesReceived + 1,
            },
          }));
        };

        ws.onerror = () => {
          get().updateSession(tabId, (prev) => ({
            status: 'error',
            statusText: 'Connection error encountered',
            frames: [...prev.frames, systemFrame(`[ERROR] WebSocket error on connection ${targetUrl}`, true)],
          }));
        };

        ws.onclose = (event) => {
          if (activeHeartbeats.has(tabId)) {
            clearInterval(activeHeartbeats.get(tabId));
            activeHeartbeats.delete(tabId);
          }
          activeSockets.delete(tabId);

          get().updateSession(tabId, (prev) => ({
            status: 'disconnected',
            statusText: `Closed (Code: ${event.code || 1000}${event.reason ? ` - ${event.reason}` : ''})`,
            frames: [
              ...prev.frames,
              systemFrame(`[CLOSED] Connection closed (Code: ${event.code || 1000}, Clean: ${event.wasClean})`),
            ],
          }));
        };
      } catch (err: any) {
        get().updateSession(tabId, (prev) => ({
          status: 'error',
          statusText: err.message || 'Failed to initialize WebSocket',
          frames: [...prev.frames, systemFrame(`[ERROR] ${err.message || 'Failed to initialize WebSocket'}`, true)],
        }));
      }
    } else {
      // Server-Sent Events (SSE)
      try {
        const es = new EventSource(targetUrl);
        activeEventSources.set(tabId, es);

        es.onopen = () => {
          get().updateSession(tabId, (prev) => ({
            status: 'connected',
            statusText: 'SSE Stream Active',
            frames: [
              ...prev.frames,
              systemFrame(`[CONNECTED] Server-Sent Events stream connected to ${targetUrl}`),
            ],
            stats: {
              ...prev.stats,
              connectedAt: Date.now(),
            },
          }));
        };

        es.onmessage = (event) => {
          const rawData = event.data;
          const size = new Blob([rawData]).size;
          let format: 'json' | 'text' = 'text';
          try {
            JSON.parse(rawData);
            format = 'json';
          } catch {
            format = 'text';
          }

          const frame: RealtimeFrame = {
            id: generateId(),
            tabId,
            direction: 'incoming',
            format,
            payload: rawData,
            sizeBytes: size,
            timestamp: Date.now(),
            event: event.type !== 'message' ? event.type : undefined,
            idAttr: event.lastEventId || undefined,
          };

          get().updateSession(tabId, (prev) => ({
            frames: [...prev.frames, frame],
            stats: {
              ...prev.stats,
              bytesReceived: prev.stats.bytesReceived + size,
              messagesReceived: prev.stats.messagesReceived + 1,
            },
          }));
        };

        es.onerror = () => {
          get().updateSession(tabId, (prev) => ({
            status: es.readyState === EventSource.CONNECTING ? 'reconnecting' : 'error',
            statusText: es.readyState === EventSource.CONNECTING ? 'SSE Stream Reconnecting...' : 'SSE Stream Error',
            frames: [
              ...prev.frames,
              systemFrame(`[SSE] ${es.readyState === EventSource.CONNECTING ? 'Stream reconnecting...' : 'Stream connection interrupted'}`, true),
            ],
          }));
        };
      } catch (err: any) {
        get().updateSession(tabId, (prev) => ({
          status: 'error',
          statusText: err.message || 'Failed to initialize SSE EventSource',
          frames: [...prev.frames, systemFrame(`[ERROR] ${err.message || 'Failed to initialize SSE EventSource'}`, true)],
        }));
      }
    }
  },

  disconnect: (tabId: string, reason?: string) => {
    if (activeHeartbeats.has(tabId)) {
      clearInterval(activeHeartbeats.get(tabId));
      activeHeartbeats.delete(tabId);
    }

    const ws = activeSockets.get(tabId);
    if (ws) {
      try {
        ws.close(1000, reason || 'User disconnected');
      } catch {
        // ignore
      }
      activeSockets.delete(tabId);
    }

    const es = activeEventSources.get(tabId);
    if (es) {
      try {
        es.close();
      } catch {
        // ignore
      }
      activeEventSources.delete(tabId);
    }

    get().updateSession(tabId, () => ({
      status: 'disconnected',
      statusText: reason || 'Disconnected',
    }));
  },

  sendMessage: (tabId: string, customPayload?: string) => {
    const session = get().sessions[tabId];
    if (!session) return;

    const ws = activeSockets.get(tabId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert('WebSocket is not connected. Please connect first before sending messages.');
      return;
    }

    const payload = customPayload !== undefined ? customPayload : session.composerContent;
    if (!payload.trim()) return;

    const size = new Blob([payload]).size;
    let format = session.activeComposerFormat;
    try {
      JSON.parse(payload);
      format = 'json';
    } catch {
      // keep format
    }

    try {
      ws.send(payload);

      const frame: RealtimeFrame = {
        id: generateId(),
        tabId,
        direction: 'outgoing',
        format,
        payload,
        sizeBytes: size,
        timestamp: Date.now(),
      };

      get().updateSession(tabId, (prev) => ({
        frames: [...prev.frames, frame],
        stats: {
          ...prev.stats,
          bytesSent: prev.stats.bytesSent + size,
          messagesSent: prev.stats.messagesSent + 1,
        },
      }));
    } catch (err: any) {
      alert(`Failed to send message: ${err.message}`);
    }
  },

  clearFrames: (tabId: string) => {
    get().updateSession(tabId, () => ({
      frames: [],
      selectedFrameId: null,
      stats: {
        connectedAt: Date.now(),
        bytesSent: 0,
        bytesReceived: 0,
        messagesSent: 0,
        messagesReceived: 0,
        lastPingMs: undefined,
      },
    }));
  },

  setSelectedFrame: (tabId: string, frameId: string | null) => {
    get().updateSession(tabId, () => ({ selectedFrameId: frameId }));
  },

  setFilterDirection: (tabId: string, dir) => {
    get().updateSession(tabId, () => ({ filterDirection: dir }));
  },

  setFilterSearch: (tabId: string, query) => {
    get().updateSession(tabId, () => ({ filterSearch: query }));
  },

  setComposerContent: (tabId: string, content) => {
    get().updateSession(tabId, () => ({ composerContent: content }));
  },

  setComposerFormat: (tabId: string, format) => {
    get().updateSession(tabId, () => ({ activeComposerFormat: format }));
  },

  toggleAutoScroll: (tabId: string) => {
    get().updateSession(tabId, (prev) => ({ autoScroll: !prev.autoScroll }));
  },

  addSnippet: (tabId: string, name, payload, format) => {
    const newSnippet: RealtimeMessageSnippet = {
      id: generateId(),
      name: name.trim() || 'Untitled Snippet',
      payload,
      format,
    };
    get().updateSession(tabId, (prev) => ({
      snippets: [...prev.snippets, newSnippet],
    }));
  },

  removeSnippet: (tabId: string, snippetId: string) => {
    get().updateSession(tabId, (prev) => ({
      snippets: prev.snippets.filter((s) => s.id !== snippetId),
    }));
  },
}));
