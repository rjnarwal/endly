import { CollectionItem, EnvironmentItem, HistoryItem, MockEndpoint, AppSettings } from '../types';

const COLLECTIONS_KEY = 'endly_collections_v1';
const ENVIRONMENTS_KEY = 'endly_environments_v1';
const ACTIVE_ENV_KEY = 'endly_active_env_v1';
const GLOBALS_KEY = 'endly_globals_v1';
const HISTORY_KEY = 'endly_history_v1';
const MOCKS_KEY = 'endly_mocks_v1';
const SETTINGS_KEY = 'endly_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  responseOrientation: 'horizontal',
  sendNoCache: false,
  followRedirects: true,
  requestTimeout: 30,
  proxyEnabled: false,
  proxyUrl: 'https://corsproxy.io/?',
  fontSize: 13,
  autoSaveTabs: true,
};

export const INITIAL_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-sample-1',
    name: '🚀 Quickstart & Echo API',
    description: 'Ready-to-use sample requests for testing HTTP methods, headers, authentication, and variables.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    variables: [
      { id: 'v1', key: 'baseUrl', value: 'https://httpbin.org', enabled: true },
    ],
    folders: [
      {
        id: 'f-methods',
        name: 'HTTP Methods',
        collectionId: 'col-sample-1',
        description: 'Standard GET, POST, PUT, DELETE samples',
      },
      {
        id: 'f-auth',
        name: 'Authentication & Headers',
        collectionId: 'col-sample-1',
      },
    ],
    requests: [
      {
        id: 'req-get',
        name: 'GET Request with Query Params',
        method: 'GET',
        url: '{{baseUrl}}/get',
        params: [
          { id: 'p1', key: 'name', value: 'Endly User', enabled: true },
          { id: 'p2', key: 'filter', value: 'active', enabled: true },
          { id: 'p3', key: 'requestId', value: '{{$guid}}', enabled: true },
        ],
        headers: [
          { id: 'h1', key: 'Accept', value: 'application/json', enabled: true },
        ],
        body: { type: 'none' },
        auth: { type: 'none' },
        testScript: `pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Query parameters match", function () {
    const json = pm.response.json();
    pm.expect(json.args.name).to.equal("Endly User");
});`,
        folderId: 'f-methods',
        collectionId: 'col-sample-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'req-post-json',
        name: 'POST JSON Data',
        method: 'POST',
        url: '{{baseUrl}}/post',
        params: [],
        headers: [
          { id: 'h2', key: 'Content-Type', value: 'application/json', enabled: true },
        ],
        body: {
          type: 'raw',
          rawLanguage: 'json',
          raw: JSON.stringify(
            {
              id: '{{$guid}}',
              user: '{{$randomName}}',
              email: '{{$randomEmail}}',
              city: '{{$randomCity}}',
              timestamp: '{{$isoTimestamp}}',
            },
            null,
            2
          ),
        },
        auth: { type: 'none' },
        testScript: `pm.test("Successful POST response", function () {
    pm.response.to.have.status(200);
    const body = pm.response.json();
    pm.expect(body.json).to.be.an("object");
});`,
        folderId: 'f-methods',
        collectionId: 'col-sample-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'req-bearer-auth',
        name: 'Bearer Token Auth',
        method: 'GET',
        url: '{{baseUrl}}/bearer',
        params: [],
        headers: [],
        body: { type: 'none' },
        auth: {
          type: 'bearer',
          bearer: { token: 'secret-endly-jwt-token-xyz' },
        },
        testScript: `pm.test("Authenticated correctly", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json().authenticated).to.be.true;
});`,
        folderId: 'f-auth',
        collectionId: 'col-sample-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
  },
  {
    id: 'col-sample-2',
    name: '📦 JSONPlaceholder REST API',
    description: 'Mock REST API for testing fake CRUD resources (Posts, Users, Comments).',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    variables: [
      { id: 'v2', key: 'apiBase', value: 'https://jsonplaceholder.typicode.com', enabled: true },
    ],
    folders: [],
    requests: [
      {
        id: 'req-todos',
        name: 'Get Todos List',
        method: 'GET',
        url: '{{apiBase}}/todos/1',
        params: [],
        headers: [],
        body: { type: 'none' },
        auth: { type: 'none' },
        testScript: `pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Todo structure has userId and title", function () {
    const todo = pm.response.json();
    pm.expect(todo).to.have.property("userId");
    pm.expect(todo).to.have.property("title");
});`,
        folderId: null,
        collectionId: 'col-sample-2',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
  },
];

export const INITIAL_ENVIRONMENTS: EnvironmentItem[] = [
  {
    id: 'env-prod',
    name: 'Production',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    variables: [
      { id: 'ev1', key: 'baseUrl', value: 'https://httpbin.org', enabled: true },
      { id: 'ev2', key: 'apiKey', value: 'prod_key_998877', enabled: true, type: 'secret' },
    ],
  },
  {
    id: 'env-staging',
    name: 'Staging / QA',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    variables: [
      { id: 'ev3', key: 'baseUrl', value: 'https://httpbin.org', enabled: true },
      { id: 'ev4', key: 'apiKey', value: 'stage_key_112233', enabled: true, type: 'secret' },
    ],
  },
];

export function loadCollections(): CollectionItem[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) return INITIAL_COLLECTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COLLECTIONS;
  } catch {
    return INITIAL_COLLECTIONS;
  }
}

export function saveCollections(collections: CollectionItem[]): void {
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (err) {
    console.error('Failed to save collections to storage', err);
  }
}

export function loadEnvironments(): EnvironmentItem[] {
  try {
    const raw = localStorage.getItem(ENVIRONMENTS_KEY);
    if (!raw) return INITIAL_ENVIRONMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ENVIRONMENTS;
  } catch {
    return INITIAL_ENVIRONMENTS;
  }
}

export function saveEnvironments(environments: EnvironmentItem[]): void {
  try {
    localStorage.setItem(ENVIRONMENTS_KEY, JSON.stringify(environments));
  } catch (err) {
    console.error('Failed to save environments', err);
  }
}

export function loadActiveEnvId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ENV_KEY) || 'env-prod';
  } catch {
    return 'env-prod';
  }
}

export function saveActiveEnvId(envId: string | null): void {
  try {
    if (envId) localStorage.setItem(ACTIVE_ENV_KEY, envId);
    else localStorage.removeItem(ACTIVE_ENV_KEY);
  } catch (err) {
    console.error('Failed to save active env', err);
  }
}

export function loadGlobals(): any[] {
  try {
    const raw = localStorage.getItem(GLOBALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGlobals(globals: any[]): void {
  try {
    localStorage.setItem(GLOBALS_KEY, JSON.stringify(globals));
  } catch (err) {
    console.error('Failed to save globals', err);
  }
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100))); // Keep last 100
  } catch (err) {
    console.error('Failed to save history', err);
  }
}

export function loadMocks(): MockEndpoint[] {
  try {
    const raw = localStorage.getItem(MOCKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMocks(mocks: MockEndpoint[]): void {
  try {
    localStorage.setItem(MOCKS_KEY, JSON.stringify(mocks));
  } catch (err) {
    console.error('Failed to save mocks', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}
