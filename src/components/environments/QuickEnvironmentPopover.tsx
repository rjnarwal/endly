import React from 'react';
import { X, Variable, Globe, Edit3, ExternalLink } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';

export const QuickEnvironmentPopover: React.FC = () => {
  const { isQuickEnvOpen, toggleQuickEnv, openEnvModal } = useWorkspaceStore();
  const { environments, activeEnvironmentId, globalVariables } = useEnvironmentStore();

  if (!isQuickEnvOpen) return null;

  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

  return (
    <div className="fixed right-4 top-14 w-80 bg-background-elevated border border-border rounded-xl shadow-2xl z-50 overflow-hidden text-xs select-none">
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-background-secondary border-b border-border">
        <div className="flex items-center space-x-1.5 font-semibold text-text">
          <Variable className="w-4 h-4 text-accent" />
          <span>Environment Inspector</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              toggleQuickEnv();
              openEnvModal();
            }}
            className="p-1 text-text-muted hover:text-text rounded hover:bg-background-tertiary"
            title="Open Full Manager"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleQuickEnv}
            className="p-1 text-text-muted hover:text-text rounded hover:bg-background-tertiary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-3 space-y-3">
        {/* Active Environment Section */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted mb-1.5">
            <span>Active: {activeEnv?.name || 'None'}</span>
            {activeEnv && (
              <span className="text-[10px] text-emerald-400 font-mono">
                {activeEnv.variables.length} vars
              </span>
            )}
          </div>

          {activeEnv && activeEnv.variables.length > 0 ? (
            <div className="bg-background-secondary border border-border rounded-lg overflow-hidden divide-y divide-border/40">
              {activeEnv.variables.map((v) => (
                <div key={v.id} className="p-2 flex flex-col space-y-0.5 font-mono text-[11px]">
                  <span className="text-text font-semibold truncate">{v.key}</span>
                  <span className="text-text-secondary truncate text-[10px]">
                    {v.type === 'secret' ? '••••••••' : v.value || '<empty>'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-text-muted text-[11px] italic p-2 bg-background-secondary/50 rounded border border-border/40">
              No active environment variables.
            </div>
          )}
        </div>

        {/* Globals Section */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted mb-1.5">
            <span className="flex items-center space-x-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span>Globals</span>
            </span>
            <span className="text-[10px] text-text-muted font-mono">{globalVariables.length} vars</span>
          </div>

          {globalVariables.length > 0 ? (
            <div className="bg-background-secondary border border-border rounded-lg overflow-hidden divide-y divide-border/40">
              {globalVariables.map((v) => (
                <div key={v.id} className="p-2 flex flex-col space-y-0.5 font-mono text-[11px]">
                  <span className="text-text font-semibold truncate">{v.key}</span>
                  <span className="text-text-secondary truncate text-[10px]">{v.value || '<empty>'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-text-muted text-[11px] italic p-2 bg-background-secondary/50 rounded border border-border/40">
              No global variables configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
