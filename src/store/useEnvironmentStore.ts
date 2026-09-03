import { create } from 'zustand';
import { EnvironmentItem, VariableItem } from '../types';
import {
  loadEnvironments,
  saveEnvironments,
  loadActiveEnvId,
  saveActiveEnvId,
  loadGlobals,
  saveGlobals,
} from '../services/storage';
import { VariableContext } from '../services/variableResolver';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface EnvironmentState {
  environments: EnvironmentItem[];
  activeEnvironmentId: string | null;
  globalVariables: VariableItem[];

  // Actions
  addEnvironment: (name: string) => EnvironmentItem;
  updateEnvironment: (id: string, updates: Partial<EnvironmentItem>) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnvironmentId: (id: string | null) => void;

  addVariable: (environmentId: string, variable?: Partial<VariableItem>) => void;
  updateVariable: (environmentId: string, varId: string, updates: Partial<VariableItem>) => void;
  deleteVariable: (environmentId: string, varId: string) => void;

  // Globals
  addGlobalVariable: (variable?: Partial<VariableItem>) => void;
  updateGlobalVariable: (varId: string, updates: Partial<VariableItem>) => void;
  deleteGlobalVariable: (varId: string) => void;

  // Context builder helper
  getVariableContext: (
    collectionVariables?: VariableItem[],
    requestVariables?: Record<string, string>,
    runtimeVariables?: Record<string, string>
  ) => VariableContext;
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: loadEnvironments(),
  activeEnvironmentId: loadActiveEnvId(),
  globalVariables: loadGlobals(),

  addEnvironment: (name) => {
    const newEnv: EnvironmentItem = {
      id: generateId(),
      name: name.trim() || 'New Environment',
      variables: [
        { id: generateId(), key: 'baseUrl', value: 'https://api.example.com', enabled: true },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => {
      const updated = [...state.environments, newEnv];
      saveEnvironments(updated);
      return { environments: updated };
    });

    return newEnv;
  },

  updateEnvironment: (id, updates) => {
    set((state) => {
      const updated = state.environments.map((env) =>
        env.id === id ? { ...env, ...updates, updatedAt: Date.now() } : env
      );
      saveEnvironments(updated);
      return { environments: updated };
    });
  },

  deleteEnvironment: (id) => {
    set((state) => {
      const updated = state.environments.filter((env) => env.id !== id);
      saveEnvironments(updated);
      const newActive = state.activeEnvironmentId === id ? null : state.activeEnvironmentId;
      saveActiveEnvId(newActive);
      return { environments: updated, activeEnvironmentId: newActive };
    });
  },

  setActiveEnvironmentId: (id) => {
    saveActiveEnvId(id);
    set({ activeEnvironmentId: id });
  },

  addVariable: (environmentId, variable = {}) => {
    const newVar: VariableItem = {
      id: generateId(),
      key: variable.key || '',
      value: variable.value || '',
      initialValue: variable.initialValue || variable.value || '',
      enabled: variable.enabled !== false,
      type: variable.type || 'string',
      description: variable.description || '',
    };

    set((state) => {
      const updated = state.environments.map((env) => {
        if (env.id === environmentId) {
          return {
            ...env,
            variables: [...env.variables, newVar],
            updatedAt: Date.now(),
          };
        }
        return env;
      });
      saveEnvironments(updated);
      return { environments: updated };
    });
  },

  updateVariable: (environmentId, varId, updates) => {
    set((state) => {
      const updated = state.environments.map((env) => {
        if (env.id === environmentId) {
          return {
            ...env,
            variables: env.variables.map((v) => (v.id === varId ? { ...v, ...updates } : v)),
            updatedAt: Date.now(),
          };
        }
        return env;
      });
      saveEnvironments(updated);
      return { environments: updated };
    });
  },

  deleteVariable: (environmentId, varId) => {
    set((state) => {
      const updated = state.environments.map((env) => {
        if (env.id === environmentId) {
          return {
            ...env,
            variables: env.variables.filter((v) => v.id !== varId),
            updatedAt: Date.now(),
          };
        }
        return env;
      });
      saveEnvironments(updated);
      return { environments: updated };
    });
  },

  addGlobalVariable: (variable = {}) => {
    const newVar: VariableItem = {
      id: generateId(),
      key: variable.key || '',
      value: variable.value || '',
      initialValue: variable.initialValue || variable.value || '',
      enabled: variable.enabled !== false,
      type: variable.type || 'string',
    };

    set((state) => {
      const updated = [...state.globalVariables, newVar];
      saveGlobals(updated);
      return { globalVariables: updated };
    });
  },

  updateGlobalVariable: (varId, updates) => {
    set((state) => {
      const updated = state.globalVariables.map((v) => (v.id === varId ? { ...v, ...updates } : v));
      saveGlobals(updated);
      return { globalVariables: updated };
    });
  },

  deleteGlobalVariable: (varId) => {
    set((state) => {
      const updated = state.globalVariables.filter((v) => v.id !== varId);
      saveGlobals(updated);
      return { globalVariables: updated };
    });
  },

  getVariableContext: (collectionVariables, requestVariables, runtimeVariables) => {
    const state = get();
    const activeEnv = state.environments.find((e) => e.id === state.activeEnvironmentId);

    return {
      globals: state.globalVariables,
      environment: activeEnv?.variables,
      collection: collectionVariables,
      request: requestVariables,
      runtime: runtimeVariables,
    };
  },
}));
