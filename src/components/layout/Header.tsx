import React, { useState } from 'react';
import {
  Zap,
  Play,
  FileCode,
  BookOpen,
  Settings,
  UploadCloud,
  Eye,
  Sun,
  Moon,
  ChevronDown,
  Globe,
  Monitor,
  Menu,
  MoreVertical,
  Columns,
  Rows,
  Send,
  Sparkles,
  Smartphone,
  Home,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';
import { useProxyStore } from '../../store/useProxyStore';
import { isDesktopEnvironment, isMacDesktopEnvironment } from '../../services/httpDispatcher';
import { DownloadDesktopModal } from '../download/DownloadDesktopModal';

export const Header: React.FC = () => {
  const {
    openImportModal,
    openRunnerModal,
    openSnippetModal,
    openDocsModal,
    openSettingsModal,
    openRealtimeTab,
    toggleQuickEnv,
    toggleSidebar,
    isSidebarOpen,
    paneOrientation,
    setPaneOrientation,
    mobileActivePane,
    setMobileActivePane,
    settings,
    setSettings,
  } = useWorkspaceStore();

  const { openModal: openProxyModal, isRunning: isProxyRunning } = useProxyStore();
  const { environments, activeEnvironmentId, setActiveEnvironmentId } = useEnvironmentStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);
  const isDesktop = isDesktopEnvironment();
  const isMac = isMacDesktopEnvironment();

  const handleThemeChange = (theme: 'dark' | 'midnight' | 'light') => {
    setSettings({ theme });
    localStorage.setItem('grassroot_theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'midnight', 'light', 'contrast');
    root.classList.add(theme);
  };

  return (
    <header
      className={`flex items-center justify-between h-12 ${
        isMac ? 'pl-24 pr-3' : 'px-2 sm:px-3'
      } bg-background-secondary border-b border-border select-none z-30 relative shrink-0 app-drag-region`}
    >
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center space-x-2 no-drag">
        {/* Mobile / Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-background-tertiary text-text-secondary hover:text-text transition-colors"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-sm shadow-orange-500/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-bold text-sm tracking-tight text-text">Endly</span>
            <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.2 rounded bg-background-elevated text-text-muted border border-border">
              v1.0
            </span>
          </div>
        </div>

        {/* Platform Pill & Download Desktop */}
        <div className="hidden sm:flex items-center space-x-1.5 ml-2">
          {isDesktop ? (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-background-tertiary border border-border/50 text-[10px] text-text-secondary">
              <Monitor className="w-3 h-3 text-emerald-400" />
              <span>Desktop</span>
            </div>
          ) : (
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 text-[11px] font-semibold transition-all shadow-sm cursor-pointer"
              title="Download Endly Desktop App (macOS DMG, Windows EXE, Linux)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Download Desktop</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Controls / Actions */}
      <div className="flex items-center space-x-1 no-drag">
        {/* Mobile View Switcher (Request vs Response) */}
        <div className="flex md:hidden items-center bg-background-tertiary border border-border rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setMobileActivePane('request')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              mobileActivePane === 'request'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>Request</span>
          </button>
          <button
            onClick={() => setMobileActivePane('response')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
              mobileActivePane === 'response'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Response</span>
          </button>
        </div>

        {/* Desktop Quick Tools */}
        <div className="hidden md:flex items-center space-x-0.5">
          <button
            onClick={openImportModal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors"
            title="Import Postman Collections, OpenAPI/Swagger YAML/JSON, cURL, HAR"
          >
            <UploadCloud className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium">Import</span>
          </button>

          <button
            onClick={() => openRunnerModal()}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors"
            title="Automated Collection Runner"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Runner</span>
          </button>

          <button
            onClick={() => openDocsModal()}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors"
            title="API Documentation Generator"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">Docs</span>
          </button>

          <button
            onClick={openSnippetModal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors"
            title="Generate Code Snippet (cURL, Python, JS, Go, Rust, Java...)"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-medium">Snippets</span>
          </button>

          {/* Real-Time Stream Launcher */}
          <button
            onClick={() => openRealtimeTab('websocket')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors"
            title="Launch WebSocket / Server-Sent Events (SSE) Live Stream Inspector"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Real-Time Stream</span>
          </button>

          {/* Mobile Proxy Interceptor Button */}
          <button
            onClick={openProxyModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors border ${
              isProxyRunning
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'text-text-secondary hover:text-text hover:bg-background-tertiary border-transparent'
            }`}
            title="Intercept & Mock Mobile App HTTP Traffic"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Mobile Interceptor</span>
            {isProxyRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Right Controls: Environment, Split Orientation & Settings */}
      <div className="flex items-center space-x-1.5 no-drag">
        {/* Layout Orientation Toggle (Side-by-Side vs Stacked) */}
        <button
          onClick={() =>
            setPaneOrientation(paneOrientation === 'horizontal' ? 'vertical' : 'horizontal')
          }
          className="hidden md:flex p-1.5 rounded-md hover:bg-background-tertiary text-text-secondary hover:text-text transition-colors"
          title={
            paneOrientation === 'horizontal'
              ? 'Switch to Stacked View (Top/Bottom)'
              : 'Switch to Side-by-Side View (Left/Right)'
          }
        >
          {paneOrientation === 'horizontal' ? (
            <Columns className="w-3.5 h-3.5 text-text-muted hover:text-accent" />
          ) : (
            <Rows className="w-3.5 h-3.5 text-accent" />
          )}
        </button>

        {/* Environment Picker */}
        <div className="flex items-center rounded-md bg-background-tertiary border border-border max-w-[130px] sm:max-w-[200px]">
          <div className="relative flex-1 min-w-0">
            <select
              value={activeEnvironmentId || ''}
              onChange={(e) => setActiveEnvironmentId(e.target.value || null)}
              className="appearance-none bg-transparent pl-2 pr-5 py-1 text-xs text-text font-medium focus:outline-none cursor-pointer truncate w-full"
            >
              <option value="">No Env</option>
              {environments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-text-muted absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={toggleQuickEnv}
            className="px-1.5 py-1 border-l border-border hover:bg-background-elevated text-text-secondary hover:text-accent transition-colors shrink-0"
            title="Quick Environment Inspector"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sleek 3-Pill Theme Switcher matching Home Page */}
        <div className="flex items-center bg-background-tertiary/70 border border-border/80 rounded-xl p-0.5 no-drag">
          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              settings.theme === 'dark'
                ? 'bg-accent text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
            title="Dark Modern Theme"
            aria-label="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleThemeChange('midnight')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
              settings.theme === 'midnight'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
            title="Midnight Navy Theme"
            aria-label="Midnight Navy Theme"
          >
            Navy
          </button>
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              settings.theme === 'light'
                ? 'bg-amber-500 text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
            title="Clean Light Theme"
            aria-label="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Extra Menu Toggle */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1.5 rounded-md hover:bg-background-tertiary text-text-secondary hover:text-text transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMobileMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 py-1.5 bg-background-elevated border border-border rounded-lg shadow-2xl z-50 text-xs flex flex-col space-y-0.5">
              {/* Home Link */}
              <a
                href="https://grassroot.digital"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMobileMenu(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center justify-between text-text font-medium border-b border-border/50 pb-1.5"
              >
                <div className="flex items-center space-x-2">
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Grassroot Home</span>
                </div>
                <ExternalLink className="w-3 h-3 text-text-muted" />
              </a>

              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  openImportModal();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
              >
                <UploadCloud className="w-3.5 h-3.5 text-accent" />
                <span>Import</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  openRunnerModal();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Runner</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  openDocsModal();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>API Docs</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  openSnippetModal();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
              >
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                <span>Code Snippets</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  openProxyModal();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobile Interceptor</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  openSettingsModal();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-background-tertiary flex items-center space-x-2 text-text border-t border-border/50 pt-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop Settings Button */}
        <button
          onClick={openSettingsModal}
          className="hidden md:flex p-1.5 rounded-md hover:bg-background-tertiary text-text-secondary hover:text-text transition-colors"
          title="Application Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Direct OS Binary Download Modal */}
      {!isDesktop && (
        <DownloadDesktopModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
        />
      )}
    </header>
  );
};
