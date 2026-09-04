import { create } from 'zustand';
import { TabItem, RequestItem, ResponseData, TestResultSummary, AppSettings, HttpRequestMethod } from '../types';
import { loadSettings, saveSettings } from '../services/storage';
import { createDefaultRequest } from './useCollectionStore';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createTabFromRequest(request: RequestItem, tabType: TabItem['tabType'] = 'http'): TabItem {
  return {
    id: generateId(),
    requestId: request.id,
    name: request.name || 'Untitled Request',
    method: request.method,
    tabType,
    isDirty: false,
    request: JSON.parse(JSON.stringify(request)),
    response: null,
    testResults: null,
    isLoading: false,
    activeSubTab: 'params',
    activeResponseTab: 'pretty',
  };
}

interface WorkspaceState {
  tabs: TabItem[];
  activeTabId: string | null;
  activeSidebarView: 'collections' | 'environments' | 'history' | 'mocks';
  isSidebarOpen: boolean;
  settings: AppSettings;

  // Active Modals
  isImportModalOpen: boolean;
  isEnvModalOpen: boolean;
  isSnippetModalOpen: boolean;
  isDocsModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isRunnerModalOpen: boolean;
  isQuickEnvOpen: boolean;
  selectedCollectionForDocs: string | null;
  selectedCollectionForRunner: string | null;

  // Tab Operations
  openTab: (request?: RequestItem) => string;
  openRealtimeTab: (type: 'websocket' | 'sse', initialUrl?: string) => string;
  closeTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTabId: (tabId: string) => void;
  duplicateTab: (tabId: string) => void;
  updateTabRequest: (tabId: string, updates: Partial<RequestItem>) => void;
  setTabResponse: (tabId: string, response: ResponseData | null, testResults?: TestResultSummary | null) => void;
  setTabLoading: (tabId: string, isLoading: boolean) => void;
  setTabSubTab: (tabId: string, subTab: TabItem['activeSubTab']) => void;
  setTabResponseTab: (tabId: string, responseTab: TabItem['activeResponseTab']) => void;
  markTabSaved: (tabId: string, newRequestId?: string) => void;

  // Workspace Operations
  setActiveSidebarView: (view: 'collections' | 'environments' | 'history' | 'mocks') => void;
  toggleSidebar: () => void;
  setSettings: (updates: Partial<AppSettings>) => void;

  // Layout & Resizable Splitters
  sidebarWidth: number;
  splitRatio: number; // percentage (20 to 80)
  paneOrientation: 'horizontal' | 'vertical';
  mobileActivePane: 'request' | 'response';
  setSidebarWidth: (width: number) => void;
  setSplitRatio: (ratio: number) => void;
  setPaneOrientation: (orientation: 'horizontal' | 'vertical') => void;
  setMobileActivePane: (pane: 'request' | 'response') => void;

  // Modal Handlers
  openImportModal: () => void;
  closeImportModal: () => void;
  openEnvModal: () => void;
  closeEnvModal: () => void;
  openSnippetModal: () => void;
  closeSnippetModal: () => void;
  openDocsModal: (collectionId?: string) => void;
  closeDocsModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openRunnerModal: (collectionId?: string) => void;
  closeRunnerModal: () => void;
  toggleQuickEnv: () => void;
}

const initialReq = createDefaultRequest('GET Request with Query Params', 'GET', 'https://httpbin.org/get');
const initialTab = createTabFromRequest(initialReq);

const savedSidebarWidth = parseInt(localStorage.getItem('endly_sidebar_width') || '280', 10);
const savedSplitRatio = parseInt(localStorage.getItem('endly_split_ratio') || '50', 10);
const savedPaneOrientation = (localStorage.getItem('endly_pane_orientation') as 'horizontal' | 'vertical') || 'horizontal';

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  activeSidebarView: 'collections',
  isSidebarOpen: true,
  settings: loadSettings(),
  sidebarWidth: isNaN(savedSidebarWidth) ? 280 : savedSidebarWidth,
  splitRatio: isNaN(savedSplitRatio) ? 50 : savedSplitRatio,
  paneOrientation: savedPaneOrientation,
  mobileActivePane: 'request',

  isImportModalOpen: false,
  isEnvModalOpen: false,
  isSnippetModalOpen: false,
  isDocsModalOpen: false,
  isSettingsModalOpen: false,
  isRunnerModalOpen: false,
  isQuickEnvOpen: false,
  selectedCollectionForDocs: null,
  selectedCollectionForRunner: null,

  openTab: (request) => {
    const existing = request ? get().tabs.find((t) => t.requestId === request.id) : null;
    if (existing) {
      set({ activeTabId: existing.id });
      return existing.id;
    }

    const req = request || createDefaultRequest('Untitled Request', 'GET', '');
    const newTab = createTabFromRequest(req);

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));

    return newTab.id;
  },

  openRealtimeTab: (type, initialUrl) => {
    const defaultUrl = initialUrl || (type === 'websocket' ? 'wss://echo.websocket.events' : 'https://stream.wikimedia.org/v2/stream/recentchange');
    const name = type === 'websocket' ? 'WebSocket Stream' : 'SSE Stream';
    const req = createDefaultRequest(name, 'GET', defaultUrl);
    const newTab = createTabFromRequest(req, type);

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));

    return newTab.id;
  },

  closeTab: (tabId) => {
    set((state) => {
      const idx = state.tabs.findIndex((t) => t.id === tabId);
      const remaining = state.tabs.filter((t) => t.id !== tabId);

      let nextActive = state.activeTabId;
      if (state.activeTabId === tabId) {
        if (remaining.length > 0) {
          const newIdx = Math.min(idx, remaining.length - 1);
          nextActive = remaining[newIdx].id;
        } else {
          // If closing last tab, create fresh new tab
          const fresh = createTabFromRequest(createDefaultRequest('Untitled Request', 'GET', ''));
          return { tabs: [fresh], activeTabId: fresh.id };
        }
      }

      return { tabs: remaining, activeTabId: nextActive };
    });
  },

  closeOtherTabs: (tabId) => {
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id === tabId),
      activeTabId: tabId,
    }));
  },

  closeAllTabs: () => {
    const fresh = createTabFromRequest(createDefaultRequest('Untitled Request', 'GET', ''));
    set({ tabs: [fresh], activeTabId: fresh.id });
  },

  setActiveTabId: (tabId) => {
    set({ activeTabId: tabId });
  },

  duplicateTab: (tabId) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const copyTab: TabItem = {
      ...JSON.parse(JSON.stringify(tab)),
      id: generateId(),
      name: `${tab.name} (Copy)`,
      isDirty: true,
    };

    set((state) => ({
      tabs: [...state.tabs, copyTab],
      activeTabId: copyTab.id,
    }));
  },

  updateTabRequest: (tabId, updates) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id === tabId) {
          const updatedRequest = { ...tab.request, ...updates, updatedAt: Date.now() };
          return {
            ...tab,
            name: updates.name !== undefined ? updates.name : tab.name,
            method: updates.method !== undefined ? updates.method : tab.method,
            isDirty: true,
            request: updatedRequest,
          };
        }
        return tab;
      }),
    }));
  },

  setTabResponse: (tabId, response, testResults) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              response,
              testResults: testResults !== undefined ? testResults : tab.testResults,
              isLoading: false,
            }
          : tab
      ),
    }));
  },

  setTabLoading: (tabId, isLoading) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, isLoading } : tab)),
    }));
  },

  setTabSubTab: (tabId, subTab) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, activeSubTab: subTab } : tab)),
    }));
  },

  setTabResponseTab: (tabId, responseTab) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, activeResponseTab: responseTab } : tab)),
    }));
  },

  markTabSaved: (tabId, newRequestId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              isDirty: false,
              requestId: newRequestId || tab.requestId,
              request: {
                ...tab.request,
                id: newRequestId || tab.request.id,
              },
            }
          : tab
      ),
    }));
  },

  setActiveSidebarView: (view) => set({ activeSidebarView: view }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarWidth: (width) => {
    localStorage.setItem('endly_sidebar_width', String(width));
    set({ sidebarWidth: width });
  },
  setSplitRatio: (ratio) => {
    localStorage.setItem('endly_split_ratio', String(ratio));
    set({ splitRatio: ratio });
  },
  setPaneOrientation: (orientation) => {
    localStorage.setItem('endly_pane_orientation', orientation);
    set({ paneOrientation: orientation });
  },
  setMobileActivePane: (pane) => set({ mobileActivePane: pane }),

  setSettings: (updates: Partial<AppSettings>) => {
    set((state) => {
      const updated = { ...state.settings, ...updates };
      saveSettings(updated);
      return { settings: updated };
    });
  },

  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),
  openEnvModal: () => set({ isEnvModalOpen: true }),
  closeEnvModal: () => set({ isEnvModalOpen: false }),
  openSnippetModal: () => set({ isSnippetModalOpen: true }),
  closeSnippetModal: () => set({ isSnippetModalOpen: false }),
  openDocsModal: (colId) => set({ isDocsModalOpen: true, selectedCollectionForDocs: colId || null }),
  closeDocsModal: () => set({ isDocsModalOpen: false }),
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  openRunnerModal: (colId) => set({ isRunnerModalOpen: true, selectedCollectionForRunner: colId || null }),
  closeRunnerModal: () => set({ isRunnerModalOpen: false }),
  toggleQuickEnv: () => set((state) => ({ isQuickEnvOpen: !state.isQuickEnvOpen })),
}));
