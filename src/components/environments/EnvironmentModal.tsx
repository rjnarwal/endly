import React, { useState } from 'react';
import { X, Plus, Trash2, Globe, Variable, Lock, Eye, EyeOff } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';
import { VariableItem } from '../../types';

export const EnvironmentModal: React.FC = () => {
  const { isEnvModalOpen, closeEnvModal } = useWorkspaceStore();
  const {
    environments,
    activeEnvironmentId,
    setActiveEnvironmentId,
    addEnvironment,
    updateEnvironment,
    deleteEnvironment,
    addVariable,
    updateVariable,
    deleteVariable,
    globalVariables,
    addGlobalVariable,
    updateGlobalVariable,
    deleteGlobalVariable,
  } = useEnvironmentStore();

  const [selectedEnvId, setSelectedEnvId] = useState<string | 'globals'>(
    activeEnvironmentId || environments[0]?.id || 'globals'
  );
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  if (!isEnvModalOpen) return null;

  const currentEnv = environments.find((e) => e.id === selectedEnvId);
  const isGlobals = selectedEnvId === 'globals';

  const toggleShowSecret = (varId: string) => {
    setShowSecrets((prev) => ({ ...prev, [varId]: !prev[varId] }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-background-elevated border border-border rounded-xl shadow-2xl w-full max-w-4xl h-[620px] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2">
            <Variable className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-bold text-text">Environment & Variable Manager</h2>
          </div>
          <button
            onClick={closeEnvModal}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-background-tertiary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left sidebar + Right editor */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-60 border-r border-border bg-background-secondary flex flex-col p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-text-muted px-1">
              <span>Environments</span>
              <button
                onClick={() => {
                  const created = addEnvironment('New Environment');
                  setSelectedEnvId(created.id);
                }}
                className="p-1 rounded text-accent hover:bg-background-tertiary"
                title="Add Environment"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Global Variables Button */}
            <button
              onClick={() => setSelectedEnvId('globals')}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center space-x-2 transition-colors ${
                isGlobals
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-text-secondary hover:bg-background-tertiary hover:text-text'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Globals</span>
              <span className="text-[10px] text-text-muted font-mono ml-auto">
                ({globalVariables.length})
              </span>
            </button>

            {/* Environments List */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {environments.map((env) => {
                const isSelected = selectedEnvId === env.id;
                const isActive = activeEnvironmentId === env.id;

                return (
                  <div
                    key={env.id}
                    onClick={() => setSelectedEnvId(env.id)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-md text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-accent/15 text-accent border border-accent/30 font-medium'
                        : 'text-text-secondary hover:bg-background-tertiary hover:text-text'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <Variable className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{env.name}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active Environment" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEnvironment(env.id);
                          if (selectedEnvId === env.id) setSelectedEnvId('globals');
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content Editor */}
          <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4">
            {isGlobals ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-sm font-bold text-text">Global Variables</h3>
                    <p className="text-xs text-text-muted">
                      Accessible across all workspaces and collections unless overridden by an active environment.
                    </p>
                  </div>
                  <button
                    onClick={() => addGlobalVariable({ key: '', value: '' })}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variable</span>
                  </button>
                </div>

                {/* Globals Table */}
                <div className="border border-border rounded-lg overflow-hidden bg-background-secondary text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-background-tertiary border-b border-border text-text-muted text-[11px]">
                        <th className="py-2 px-3 text-left font-medium w-1/3">Variable Name</th>
                        <th className="py-2 px-3 text-left font-medium">Value</th>
                        <th className="w-10 py-2 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalVariables.map((v) => (
                        <tr key={v.id} className="border-b border-border/40 hover:bg-background-tertiary/40">
                          <td className="py-1.5 px-3">
                            <input
                              type="text"
                              value={v.key}
                              onChange={(e) => updateGlobalVariable(v.id, { key: e.target.value })}
                              placeholder="VARIABLE_NAME"
                              className="w-full bg-transparent px-2 py-1 rounded text-text font-mono text-xs focus:bg-background focus:outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-3">
                            <input
                              type="text"
                              value={v.value}
                              onChange={(e) => updateGlobalVariable(v.id, { value: e.target.value })}
                              placeholder="value"
                              className="w-full bg-transparent px-2 py-1 rounded text-text font-mono text-xs focus:bg-background focus:outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              onClick={() => deleteGlobalVariable(v.id)}
                              className="p-1 text-text-muted hover:text-red-400 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {globalVariables.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-text-muted text-xs italic">
                            No global variables yet. Click "Add Variable" above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : currentEnv ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex-1 max-w-sm">
                    <input
                      type="text"
                      value={currentEnv.name}
                      onChange={(e) => updateEnvironment(currentEnv.id, { name: e.target.value })}
                      className="text-sm font-bold text-text bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none px-1 py-0.5"
                    />
                    <p className="text-xs text-text-muted px-1 mt-0.5">
                      Scoped variables active when this environment is selected in the top bar.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setActiveEnvironmentId(
                          activeEnvironmentId === currentEnv.id ? null : currentEnv.id
                        )
                      }
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeEnvironmentId === currentEnv.id
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-background-tertiary text-text-secondary hover:text-text'
                      }`}
                    >
                      {activeEnvironmentId === currentEnv.id ? 'Active Environment' : 'Set as Active'}
                    </button>

                    <button
                      onClick={() => addVariable(currentEnv.id, { key: '', value: '' })}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variable</span>
                    </button>
                  </div>
                </div>

                {/* Variables Table */}
                <div className="border border-border rounded-lg overflow-hidden bg-background-secondary text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-background-tertiary border-b border-border text-text-muted text-[11px]">
                        <th className="py-2 px-3 text-left font-medium w-1/4">Variable Name</th>
                        <th className="py-2 px-3 text-left font-medium w-1/5">Type</th>
                        <th className="py-2 px-3 text-left font-medium">Value</th>
                        <th className="w-10 py-2 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEnv.variables.map((v) => {
                        const isSecret = v.type === 'secret';
                        const isVisible = showSecrets[v.id];

                        return (
                          <tr key={v.id} className="border-b border-border/40 hover:bg-background-tertiary/40">
                            <td className="py-1.5 px-3">
                              <input
                                type="text"
                                value={v.key}
                                onChange={(e) =>
                                  updateVariable(currentEnv.id, v.id, { key: e.target.value })
                                }
                                placeholder="key"
                                className="w-full bg-transparent px-2 py-1 rounded text-text font-mono text-xs focus:bg-background focus:outline-none"
                              />
                            </td>

                            <td className="py-1.5 px-3">
                              <select
                                value={v.type || 'string'}
                                onChange={(e) =>
                                  updateVariable(currentEnv.id, v.id, {
                                    type: e.target.value as 'string' | 'secret',
                                  })
                                }
                                className="bg-background-tertiary border border-border rounded px-2 py-0.5 text-xs text-text focus:outline-none"
                              >
                                <option value="string">default</option>
                                <option value="secret">secret</option>
                              </select>
                            </td>

                            <td className="py-1.5 px-3">
                              <div className="flex items-center space-x-1.5">
                                <input
                                  type={isSecret && !isVisible ? 'password' : 'text'}
                                  value={v.value}
                                  onChange={(e) =>
                                    updateVariable(currentEnv.id, v.id, { value: e.target.value })
                                  }
                                  placeholder="value"
                                  className="w-full bg-transparent px-2 py-1 rounded text-text font-mono text-xs focus:bg-background focus:outline-none"
                                />
                                {isSecret && (
                                  <button
                                    onClick={() => toggleShowSecret(v.id)}
                                    className="p-1 text-text-muted hover:text-text"
                                  >
                                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="py-1.5 px-2 text-center">
                              <button
                                onClick={() => deleteVariable(currentEnv.id, v.id)}
                                className="p-1 text-text-muted hover:text-red-400 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {currentEnv.variables.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-text-muted text-xs italic">
                            No variables in this environment. Click "Add Variable" above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
