import React, { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SidebarResizer } from './components/layout/SidebarResizer';
import { SplitResizer } from './components/layout/SplitResizer';
import { TabBar } from './components/layout/TabBar';
import { RequestBuilder } from './components/request/RequestBuilder';
import { ResponseViewer } from './components/response/ResponseViewer';
import { EnvironmentModal } from './components/environments/EnvironmentModal';
import { QuickEnvironmentPopover } from './components/environments/QuickEnvironmentPopover';
import { CollectionRunner } from './components/runner/CollectionRunner';
import { ImportModal } from './components/modals/ImportModal';
import { CodeSnippetModal } from './components/modals/CodeSnippetModal';
import { DocumentationViewer } from './components/docs/DocumentationViewer';
import { SettingsModal } from './components/settings/SettingsModal';
import { MobileInterceptorModal } from './components/proxy/MobileInterceptorModal';
import { RealtimeClient } from './components/realtime/RealtimeClient';
import { useWorkspaceStore } from './store/useWorkspaceStore';

export const App: React.FC = () => {
  const {
    tabs,
    openTab,
    closeTab,
    activeTabId,
    settings,
    isSidebarOpen,
    toggleSidebar,
    sidebarWidth,
    setSidebarWidth,
    splitRatio,
    setSplitRatio,
    paneOrientation,
    setPaneOrientation,
    mobileActivePane,
  } = useWorkspaceStore();

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply saved theme on mount & synchronize with grassroot_theme
  useEffect(() => {
    const savedGrassrootTheme = localStorage.getItem('grassroot_theme') as any;
    const activeTheme = savedGrassrootTheme || settings.theme || 'light';
    const root = document.documentElement;
    root.classList.remove('dark', 'midnight', 'light', 'contrast');
    root.classList.add(activeTheme);
  }, [settings.theme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + N: New Request Tab
      if (isCmdOrCtrl && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        openTab();
      }

      // Cmd/Ctrl + W: Close Active Tab
      if (isCmdOrCtrl && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, openTab, closeTab]);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-text overflow-hidden font-sans select-none">
      {/* 1. Top Navbar */}
      <Header />

      {/* 2. Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`${
            isMobile
              ? isSidebarOpen
                ? 'fixed inset-y-0 left-0 z-40 shadow-2xl flex h-full'
                : 'hidden'
              : 'flex h-full shrink-0'
          }`}
        >
          <Sidebar />
        </div>

        {/* Desktop Sidebar Resizer Slider */}
        {isSidebarOpen && !isMobile && (
          <SidebarResizer
            currentWidth={sidebarWidth}
            onResize={setSidebarWidth}
            onDoubleClick={toggleSidebar}
          />
        )}

        {/* Mobile Sidebar Backdrop Overlay */}
        {isSidebarOpen && isMobile && (
          <div
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 z-30 backdrop-blur-xs transition-opacity"
          />
        )}

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {/* Multi-Tab Bar */}
          <TabBar />

          {/* Workspace Content: Stream Client OR Request/Response Split View */}
          {(() => {
            const activeTab = tabs.find((t) => t.id === activeTabId);
            if (activeTab?.tabType === 'websocket' || activeTab?.tabType === 'sse') {
              return (
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <RealtimeClient />
                </div>
              );
            }

            if (isMobile) {
              /* Mobile View: Switches smoothly between Request and Response */
              return (
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  {mobileActivePane === 'request' ? <RequestBuilder /> : <ResponseViewer />}
                </div>
              );
            }

            if (paneOrientation === 'horizontal') {
              /* Side-by-Side Horizontal View with Vertical Resizer Slider */
              return (
                <div className="flex-1 flex min-h-0 overflow-hidden relative">
                  <div
                    style={{ width: `${splitRatio}%` }}
                    className="h-full min-w-[220px] overflow-hidden flex flex-col shrink-0"
                  >
                    <RequestBuilder />
                  </div>

                  <SplitResizer
                    direction="horizontal"
                    currentRatio={splitRatio}
                    onResize={setSplitRatio}
                    onReset={() => setSplitRatio(50)}
                    orientation={paneOrientation}
                    onToggleOrientation={() => setPaneOrientation('vertical')}
                  />

                  <div
                    style={{ width: `${100 - splitRatio}%` }}
                    className="h-full min-w-[220px] overflow-hidden flex flex-col flex-1"
                  >
                    <ResponseViewer />
                  </div>
                </div>
              );
            }

            /* Stacked Vertical View with Horizontal Resizer Slider */
            return (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                <div
                  style={{ height: `${splitRatio}%` }}
                  className="w-full min-h-[160px] overflow-hidden flex flex-col shrink-0"
                >
                  <RequestBuilder />
                </div>

                <SplitResizer
                  direction="vertical"
                  currentRatio={splitRatio}
                  onResize={setSplitRatio}
                  onReset={() => setSplitRatio(50)}
                  orientation={paneOrientation}
                  onToggleOrientation={() => setPaneOrientation('horizontal')}
                />

                <div
                  style={{ height: `${100 - splitRatio}%` }}
                  className="w-full min-h-[160px] overflow-hidden flex flex-col flex-1"
                >
                  <ResponseViewer />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 3. Global Modals & Overlays */}
      <EnvironmentModal />
      <QuickEnvironmentPopover />
      <CollectionRunner />
      <ImportModal />
      <CodeSnippetModal />
      <DocumentationViewer />
      <SettingsModal />
      <MobileInterceptorModal />
    </div>
  );
};
