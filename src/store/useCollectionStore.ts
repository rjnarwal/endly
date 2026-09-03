import { create } from 'zustand';
import { CollectionItem, FolderItem, RequestItem, HttpRequestMethod } from '../types';
import { loadCollections, saveCollections } from '../services/storage';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createDefaultRequest(name = 'New Request', method: HttpRequestMethod = 'GET', url = ''): RequestItem {
  return {
    id: generateId(),
    name,
    method,
    url: url || 'https://httpbin.org/get',
    params: [],
    headers: [],
    body: { type: 'none' },
    auth: { type: 'none' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

interface CollectionState {
  collections: CollectionItem[];
  
  // Actions
  addCollection: (name: string, description?: string) => CollectionItem;
  updateCollection: (id: string, updates: Partial<CollectionItem>) => void;
  deleteCollection: (id: string) => void;
  
  addFolder: (collectionId: string, name: string, parentId?: string | null) => FolderItem;
  updateFolder: (folderId: string, updates: Partial<FolderItem>) => void;
  deleteFolder: (folderId: string) => void;

  addRequest: (collectionId: string, folderId?: string | null, initialData?: Partial<RequestItem>) => RequestItem;
  updateRequest: (requestId: string, updates: Partial<RequestItem>) => void;
  deleteRequest: (requestId: string) => void;
  duplicateRequest: (requestId: string) => RequestItem | null;
  moveRequest: (requestId: string, targetFolderId: string | null, targetCollectionId: string) => void;

  importCollection: (collection: CollectionItem) => void;
  setCollections: (collections: CollectionItem[]) => void;

  getRequestById: (requestId: string) => { request: RequestItem; collection: CollectionItem; folder?: FolderItem } | null;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: loadCollections(),

  addCollection: (name, description = '') => {
    const newCol: CollectionItem = {
      id: generateId(),
      name: name.trim() || 'New Collection',
      description,
      folders: [],
      requests: [],
      variables: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => {
      const updated = [...state.collections, newCol];
      saveCollections(updated);
      return { collections: updated };
    });

    return newCol;
  },

  updateCollection: (id, updates) => {
    set((state) => {
      const updated = state.collections.map((col) =>
        col.id === id ? { ...col, ...updates, updatedAt: Date.now() } : col
      );
      saveCollections(updated);
      return { collections: updated };
    });
  },

  deleteCollection: (id) => {
    set((state) => {
      const updated = state.collections.filter((col) => col.id !== id);
      saveCollections(updated);
      return { collections: updated };
    });
  },

  addFolder: (collectionId, name, parentId = null) => {
    const newFolder: FolderItem = {
      id: generateId(),
      name: name.trim() || 'New Folder',
      collectionId,
      parentId,
    };

    set((state) => {
      const updated = state.collections.map((col) => {
        if (col.id === collectionId) {
          return {
            ...col,
            folders: [...(col.folders || []), newFolder],
            updatedAt: Date.now(),
          };
        }
        return col;
      });
      saveCollections(updated);
      return { collections: updated };
    });

    return newFolder;
  },

  updateFolder: (folderId, updates) => {
    set((state) => {
      const updated = state.collections.map((col) => {
        const folderExists = (col.folders || []).some((f) => f.id === folderId);
        if (folderExists) {
          return {
            ...col,
            folders: col.folders.map((f) => (f.id === folderId ? { ...f, ...updates } : f)),
            updatedAt: Date.now(),
          };
        }
        return col;
      });
      saveCollections(updated);
      return { collections: updated };
    });
  },

  deleteFolder: (folderId) => {
    set((state) => {
      const updated = state.collections.map((col) => {
        return {
          ...col,
          folders: (col.folders || []).filter((f) => f.id !== folderId && f.parentId !== folderId),
          requests: (col.requests || []).filter((r) => r.folderId !== folderId),
          updatedAt: Date.now(),
        };
      });
      saveCollections(updated);
      return { collections: updated };
    });
  },

  addRequest: (collectionId, folderId = null, initialData = {}) => {
    const newReq: RequestItem = {
      ...createDefaultRequest(initialData.name || 'New Request', initialData.method || 'GET', initialData.url || ''),
      ...initialData,
      id: generateId(),
      collectionId,
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => {
      const updated = state.collections.map((col) => {
        if (col.id === collectionId) {
          return {
            ...col,
            requests: [...(col.requests || []), newReq],
            updatedAt: Date.now(),
          };
        }
        return col;
      });
      saveCollections(updated);
      return { collections: updated };
    });

    return newReq;
  },

  updateRequest: (requestId, updates) => {
    set((state) => {
      const updated = state.collections.map((col) => {
        const reqIdx = (col.requests || []).findIndex((r) => r.id === requestId);
        if (reqIdx >= 0) {
          const newRequests = [...col.requests];
          newRequests[reqIdx] = { ...newRequests[reqIdx], ...updates, updatedAt: Date.now() };
          return { ...col, requests: newRequests, updatedAt: Date.now() };
        }
        return col;
      });
      saveCollections(updated);
      return { collections: updated };
    });
  },

  deleteRequest: (requestId) => {
    set((state) => {
      const updated = state.collections.map((col) => ({
        ...col,
        requests: (col.requests || []).filter((r) => r.id !== requestId),
        updatedAt: Date.now(),
      }));
      saveCollections(updated);
      return { collections: updated };
    });
  },

  duplicateRequest: (requestId) => {
    const found = get().getRequestById(requestId);
    if (!found) return null;

    const copyReq: RequestItem = {
      ...JSON.parse(JSON.stringify(found.request)),
      id: generateId(),
      name: `${found.request.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => {
      const updated = state.collections.map((col) => {
        if (col.id === found.collection.id) {
          return {
            ...col,
            requests: [...col.requests, copyReq],
            updatedAt: Date.now(),
          };
        }
        return col;
      });
      saveCollections(updated);
      return { collections: updated };
    });

    return copyReq;
  },

  moveRequest: (requestId, targetFolderId, targetCollectionId) => {
    const found = get().getRequestById(requestId);
    if (!found) return;

    const updatedReq: RequestItem = {
      ...found.request,
      folderId: targetFolderId,
      collectionId: targetCollectionId,
      updatedAt: Date.now(),
    };

    set((state) => {
      // Remove from old collection, add to target
      const updated = state.collections.map((col) => {
        if (col.id === found.collection.id && col.id === targetCollectionId) {
          return {
            ...col,
            requests: col.requests.map((r) => (r.id === requestId ? updatedReq : r)),
          };
        } else if (col.id === found.collection.id) {
          return {
            ...col,
            requests: col.requests.filter((r) => r.id !== requestId),
          };
        } else if (col.id === targetCollectionId) {
          return {
            ...col,
            requests: [...col.requests, updatedReq],
          };
        }
        return col;
      });
      saveCollections(updated);
      return { collections: updated };
    });
  },

  importCollection: (collection) => {
    set((state) => {
      const updated = [...state.collections, collection];
      saveCollections(updated);
      return { collections: updated };
    });
  },

  setCollections: (collections) => {
    saveCollections(collections);
    set({ collections });
  },

  getRequestById: (requestId) => {
    for (const col of get().collections) {
      for (const req of col.requests || []) {
        if (req.id === requestId) {
          const folder = col.folders?.find((f) => f.id === req.folderId);
          return { request: req, collection: col, folder };
        }
      }
    }
    return null;
  },
}));
