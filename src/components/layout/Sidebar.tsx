import React, { useState, useRef } from 'react';
import {
  FolderTree,
  Variable,
  History,
  Server,
  Plus,
  Search,
  Trash2,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useMockStore } from '../../store/useMockStore';
import { CollectionTree } from '../collections/CollectionTree';
import { HttpRequestMethod } from '../../types';

const METHOD_COLORS: Record<HttpRequestMethod, { text: string; bg: string }> = {
  GET: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  POST: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  PUT: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  PATCH: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
  DELETE: { text: 'text-rose-400', bg: 'bg-rose-500/10' },
  HEAD: { text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  OPTIONS: { text: 'text-pink-400', bg: 'bg-pink-500/10' },
};

const SIDEBAR_VIEWS = [
  { id: 'collections', name: 'Collections', icon: FolderTree },
  { id: 'environments', name: 'Environments', icon: Variable },
  { id: 'history', name: 'History', icon: History },
  { id: 'mocks', name: 'Mocks', icon: Server },
] as const;

type SidebarViewId = (typeof SIDEBAR_VIEWS)[number]['id'];

export const Sidebar: React.FC = () => {
  const {
    activeSidebarView,
    setActiveSidebarView,
    isSidebarOpen,
    toggleSidebar,
    sidebarWidth,
    openTab,
    openEnvModal,
  } = useWorkspaceStore();

  const { addCollection } = useCollectionStore();
  const { environments, activeEnvironmentId, setActiveEnvironmentId, addEnvironment, deleteEnvironment } =
    useEnvironmentStore();
  const { history, clearHistory, deleteHistoryItem } = useHistoryStore();
  const { mocks, toggleMock, addMock, deleteMock } = useMockStore();

  const [searchFilter, setSearchFilter] = useState('');

  // Touch Swipe Gesture State
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Detect horizontal swipe (>40px and horizontal dominant)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      const currentIdx = SIDEBAR_VIEWS.findIndex((v) => v.id === activeSidebarView);
      if (deltaX < 0) {
        // Swipe Left -> next tab
        if (currentIdx < SIDEBAR_VIEWS.length - 1) {
          setActiveSidebarView(SIDEBAR_VIEWS[currentIdx + 1].id);
        }
      } else {
        // Swipe Right -> previous tab
        if (currentIdx > 0) {
          setActiveSidebarView(SIDEBAR_VIEWS[currentIdx - 1].id);
        }
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Collapsed Sidebar View
  if (!isSidebarOpen) {
    return (
      <div className="flex flex-col items-center w-11 py-3 bg-background-secondary border-r border-border select-none shrink-0 z-10 transition-all duration-200">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-background-tertiary text-text-secondary hover:text-text mb-4 transition-colors"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex flex-col space-y-3">
          {SIDEBAR_VIEWS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSidebarView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSidebarView(item.id);
                  toggleSidebar();
                }}
                className={`p-2 rounded-lg transition-colors relative group ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-muted hover:text-text hover:bg-background-tertiary'
                }`}
                title={item.name}
              >
                <Icon className="w-4 h-4" />
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-accent rounded-r" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const activeIndex = SIDEBAR_VIEWS.findIndex((v) => v.id === activeSidebarView);

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col bg-background-secondary border-r border-border select-none h-full shrink-0 z-10 max-w-[85vw] md:max-w-none transition-[width] duration-75"
    >
      {/* Top Sidebar Navigation Tabs with Sliding Indicator & Swipe Support */}
      <div className="flex items-center justify-between px-2 pt-2 border-b border-border bg-background-tertiary/20">
        <div className="flex space-x-1 flex-1 overflow-x-auto no-scrollbar scroll-smooth">
          {SIDEBAR_VIEWS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSidebarView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSidebarView(item.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-t-md transition-all border-b-2 shrink-0 ${
                  isActive
                    ? 'border-accent text-accent bg-background-tertiary/60 shadow-sm'
                    : 'border-transparent text-text-secondary hover:text-text hover:bg-background-tertiary/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-background-tertiary text-text-muted hover:text-text transition-colors ml-1"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Swipe Indicator Dots */}
      <div className="flex items-center justify-center space-x-1 py-1 bg-background-secondary border-b border-border/40">
        {SIDEBAR_VIEWS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setActiveSidebarView(item.id)}
            className={`h-1 rounded-full transition-all ${
              activeIndex === idx ? 'w-5 bg-accent' : 'w-1.5 bg-border hover:bg-text-muted'
            }`}
            title={`Go to ${item.name}`}
          />
        ))}
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center space-x-2 px-3 py-2 border-b border-border bg-background-secondary">
        <div className="flex items-center flex-1 bg-background-tertiary border border-border/80 rounded-md px-2 py-1 text-xs">
          <Search className="w-3.5 h-3.5 text-text-muted mr-1.5 shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Filter ${activeSidebarView}...`}
            className="w-full bg-transparent text-text placeholder:text-text-muted focus:outline-none text-xs"
          />
        </div>

        {activeSidebarView === 'collections' && (
          <button
            onClick={() => addCollection('New Collection')}
            className="p-1.5 rounded-md bg-accent/15 text-accent hover:bg-accent hover:text-white transition-colors shrink-0"
            title="Create New Collection"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {activeSidebarView === 'environments' && (
          <button
            onClick={() => {
              const env = addEnvironment('New Environment');
              openEnvModal();
            }}
            className="p-1.5 rounded-md bg-accent/15 text-accent hover:bg-accent hover:text-white transition-colors shrink-0"
            title="Create New Environment"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {activeSidebarView === 'history' && history.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-1.5 rounded-md hover:bg-background-tertiary text-text-muted hover:text-red-400 transition-colors shrink-0"
            title="Clear All History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {activeSidebarView === 'mocks' && (
          <button
            onClick={() => addMock()}
            className="p-1.5 rounded-md bg-accent/15 text-accent hover:bg-accent hover:text-white transition-colors shrink-0"
            title="Add Mock Route"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Swipeable Sidebar View Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {/* View 1: Collections */}
        {activeSidebarView === 'collections' && <CollectionTree searchFilter={searchFilter} />}

        {/* View 2: Environments */}
        {activeSidebarView === 'environments' && (
          <div className="flex flex-col p-2 space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-text-muted uppercase">
              <span>Environments ({environments.length})</span>
              <button
                onClick={openEnvModal}
                className="text-accent hover:underline lowercase font-normal"
              >
                manage
              </button>
            </div>

            {environments.map((env) => {
              const isActive = env.id === activeEnvironmentId;
              return (
                <div
                  key={env.id}
                  onClick={() => openEnvModal()}
                  className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs border ${
                    isActive
                      ? 'bg-accent/10 border-accent/40 text-text'
                      : 'bg-background-tertiary/40 border-border/60 text-text-secondary hover:bg-background-tertiary hover:text-text'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <Variable className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate font-medium">{env.name}</span>
                    <span className="text-[10px] text-text-muted font-mono">
                      ({env.variables.length} vars)
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEnvironmentId(isActive ? null : env.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-text-muted hover:text-text hover:bg-background-elevated'
                      }`}
                      title={isActive ? 'Active Environment' : 'Set as Active'}
                    >
                      {isActive ? 'Active' : 'Use'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEnvironment(env.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View 3: History */}
        {activeSidebarView === 'history' && (
          <div className="flex flex-col p-2 space-y-1">
            {history.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-xs">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <span>No requests in history yet.</span>
              </div>
            ) : (
              history
                .filter(
                  (h) =>
                    !searchFilter ||
                    h.url.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    h.name.toLowerCase().includes(searchFilter.toLowerCase())
                )
                .map((item) => {
                  const methodStyle = METHOD_COLORS[item.method] || METHOD_COLORS.GET;
                  const isOk = item.status >= 200 && item.status < 300;

                  return (
                    <div
                      key={item.id}
                      onClick={() => openTab(item.requestSnapshot)}
                      className="group flex flex-col p-2 rounded-md bg-background-tertiary/40 border border-border/40 hover:bg-background-tertiary cursor-pointer transition-colors text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                          <span
                            className={`text-[9px] font-bold px-1 rounded uppercase font-mono ${methodStyle.bg} ${methodStyle.text}`}
                          >
                            {item.method}
                          </span>
                          <span className="truncate text-text font-medium">{item.name}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span
                            className={`text-[10px] font-mono font-semibold ${
                              isOk ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {item.status || 'ERR'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistoryItem(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-red-400 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-text-muted">
                        <span className="truncate max-w-[160px] font-mono">{item.url}</span>
                        <span>{item.timeMs}ms</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* View 4: Mocks */}
        {activeSidebarView === 'mocks' && (
          <div className="flex flex-col p-2 space-y-1.5">
            <div className="px-2 py-1 text-[11px] text-text-muted leading-relaxed">
              Define local mock API responses to test frontends or endpoints before backend is ready.
            </div>

            {mocks.map((mock) => {
              const methodStyle = METHOD_COLORS[mock.method] || METHOD_COLORS.GET;
              return (
                <div
                  key={mock.id}
                  className="p-2.5 rounded-md bg-background-tertiary/40 border border-border/50 flex flex-col space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[9px] font-bold px-1 rounded uppercase font-mono ${methodStyle.bg} ${methodStyle.text}`}
                      >
                        {mock.method}
                      </span>
                      <span className="font-medium text-text">{mock.name}</span>
                    </div>

                    <input
                      type="checkbox"
                      checked={mock.enabled}
                      onChange={() => toggleMock(mock.id)}
                      className="accent-accent cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
                    <span>{mock.path}</span>
                    <span className="text-emerald-400 font-semibold">{mock.statusCode}</span>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1 border-t border-border/40">
                    <button
                      onClick={() =>
                        openTab({
                          id: 'mock-req-' + mock.id,
                          name: `Mock: ${mock.name}`,
                          method: mock.method,
                          url: `http://localhost:3000${mock.path}`,
                          params: [],
                          headers: mock.headers,
                          body: { type: 'raw', raw: mock.body, rawLanguage: 'json' },
                          auth: { type: 'none' },
                          createdAt: Date.now(),
                          updatedAt: Date.now(),
                        })
                      }
                      className="text-[10px] text-accent hover:underline flex items-center space-x-1"
                    >
                      <span>Test in Tab</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => deleteMock(mock.id)}
                      className="text-[10px] text-text-muted hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
