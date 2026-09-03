import { create } from 'zustand';
import { MockEndpoint } from '../types';
import { loadMocks, saveMocks } from '../services/storage';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface MockState {
  mocks: MockEndpoint[];
  addMock: (mock?: Partial<MockEndpoint>) => MockEndpoint;
  updateMock: (id: string, updates: Partial<MockEndpoint>) => void;
  deleteMock: (id: string) => void;
  toggleMock: (id: string) => void;
}

export const useMockStore = create<MockState>((set) => ({
  mocks: loadMocks().length > 0 ? loadMocks() : [
    {
      id: 'mock-1',
      name: 'User Profile Mock',
      method: 'GET',
      path: '/api/v1/user/profile',
      statusCode: 200,
      headers: [{ id: 'mh1', key: 'Content-Type', value: 'application/json', enabled: true }],
      body: JSON.stringify({ id: 101, username: 'johndoe', role: 'admin', active: true }, null, 2),
      delayMs: 150,
      enabled: true,
    },
  ],

  addMock: (mock = {}) => {
    const newMock: MockEndpoint = {
      id: generateId(),
      name: mock.name || 'New Mock Endpoint',
      method: mock.method || 'GET',
      path: mock.path || '/api/v1/resource',
      statusCode: mock.statusCode || 200,
      headers: mock.headers || [{ id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true }],
      body: mock.body || JSON.stringify({ message: 'Mock response from Endly' }, null, 2),
      delayMs: mock.delayMs || 100,
      enabled: mock.enabled !== false,
    };

    set((state) => {
      const updated = [...state.mocks, newMock];
      saveMocks(updated);
      return { mocks: updated };
    });

    return newMock;
  },

  updateMock: (id, updates) => {
    set((state) => {
      const updated = state.mocks.map((m) => (m.id === id ? { ...m, ...updates } : m));
      saveMocks(updated);
      return { mocks: updated };
    });
  },

  deleteMock: (id) => {
    set((state) => {
      const updated = state.mocks.filter((m) => m.id !== id);
      saveMocks(updated);
      return { mocks: updated };
    });
  },

  toggleMock: (id) => {
    set((state) => {
      const updated = state.mocks.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
      saveMocks(updated);
      return { mocks: updated };
    });
  },
}));
