export type RealtimeProtocol = 'ws' | 'sse';

export type RealtimeConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export type MessageDirection = 'incoming' | 'outgoing' | 'system';

export type MessageFormat = 'json' | 'text' | 'binary';

export interface RealtimeFrame {
  id: string;
  tabId: string;
  direction: MessageDirection;
  format: MessageFormat;
  payload: string;
  sizeBytes: number;
  timestamp: number;
  latencyMs?: number;
  event?: string; // For SSE event names
  idAttr?: string; // For SSE event IDs
  isError?: boolean;
}

export interface RealtimeMessageSnippet {
  id: string;
  name: string;
  payload: string;
  format: MessageFormat;
}

export interface RealtimeConnectionConfig {
  url: string;
  protocol: RealtimeProtocol;
  subprotocols: string[];
  headers: { id: string; key: string; value: string; enabled: boolean }[];
  queryParams: { id: string; key: string; value: string; enabled: boolean }[];
  heartbeatEnabled: boolean;
  heartbeatIntervalSec: number;
  heartbeatPayload: string;
  autoReconnect: boolean;
  maxReconnectAttempts: number;
}

export interface RealtimeSessionState {
  tabId: string;
  status: RealtimeConnectionStatus;
  statusText?: string;
  config: RealtimeConnectionConfig;
  frames: RealtimeFrame[];
  activeComposerFormat: MessageFormat;
  composerContent: string;
  selectedFrameId: string | null;
  filterDirection: 'all' | 'incoming' | 'outgoing' | 'system';
  filterSearch: string;
  autoScroll: boolean;
  snippets: RealtimeMessageSnippet[];
  stats: {
    connectedAt: number | null;
    bytesSent: number;
    bytesReceived: number;
    messagesSent: number;
    messagesReceived: number;
    lastPingMs?: number;
  };
}
