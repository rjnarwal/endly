import { create } from 'zustand';
import { HistoryItem, RequestItem, ResponseData } from '../types';
import { loadHistory, saveHistory } from '../services/storage';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface HistoryState {
  history: HistoryItem[];
  addHistoryItem: (request: RequestItem, response?: ResponseData) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: loadHistory(),

  addHistoryItem: (request, response) => {
    const newItem: HistoryItem = {
      id: generateId(),
      requestId: request.id,
      name: request.name || `${request.method} Request`,
      method: request.method,
      url: request.url,
      status: response?.status || 0,
      statusText: response?.statusText || (response?.isError ? 'Failed' : ''),
      timeMs: response?.timeMs || 0,
      sizeBytes: response?.sizeBytes || 0,
      timestamp: Date.now(),
      requestSnapshot: JSON.parse(JSON.stringify(request)),
      responseSnapshot: response ? JSON.parse(JSON.stringify(response)) : undefined,
    };

    set((state) => {
      const updated = [newItem, ...state.history].slice(0, 100);
      saveHistory(updated);
      return { history: updated };
    });
  },

  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },

  deleteHistoryItem: (id) => {
    set((state) => {
      const updated = state.history.filter((item) => item.id !== id);
      saveHistory(updated);
      return { history: updated };
    });
  },
}));
