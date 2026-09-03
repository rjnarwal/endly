import React, { useRef, useState, useEffect } from 'react';
import { Plus, X, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { HttpRequestMethod } from '../../types';

const METHOD_COLORS: Record<HttpRequestMethod, { bg: string; text: string }> = {
  GET: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  POST: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  PUT: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  PATCH: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  DELETE: { bg: 'bg-rose-500/15', text: 'text-rose-400' },
  HEAD: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  OPTIONS: { bg: 'bg-pink-500/15', text: 'text-pink-400' },
};

export const TabBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    closeTab,
    closeOtherTabs,
    duplicateTab,
    openTab,
  } = useWorkspaceStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll overflows
  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [tabs]);

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 250);
    }
  };

  // Touch Swipe to Switch Tabs
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

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const activeIdx = tabs.findIndex((t) => t.id === activeTabId);
      if (deltaX < 0 && activeIdx < tabs.length - 1) {
        setActiveTabId(tabs[activeIdx + 1].id);
      } else if (deltaX > 0 && activeIdx > 0) {
        setActiveTabId(tabs[activeIdx - 1].id);
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex items-center h-9 bg-background-secondary border-b border-border select-none relative z-10"
    >
      {/* Scroll Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scrollBy(-150)}
          className="absolute left-0 z-20 h-full px-1 bg-background-secondary/90 hover:bg-background-tertiary text-text-muted hover:text-text border-r border-border backdrop-blur-sm transition-colors"
          title="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollButtons}
        className="flex items-center flex-1 min-w-0 h-full overflow-x-auto no-scrollbar scroll-smooth"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const methodStyle = METHOD_COLORS[tab.method] || METHOD_COLORS.GET;

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex items-center h-full px-3 border-r border-border max-w-[220px] min-w-[110px] sm:min-w-[130px] shrink-0 cursor-pointer transition-colors relative ${
                isActive
                  ? 'bg-background text-text font-medium border-t-2 border-t-accent'
                  : 'text-text-secondary hover:bg-background-tertiary/60 hover:text-text'
              }`}
              title={tab.name}
            >
              {/* Method Pill */}
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded mr-1.5 uppercase tracking-wide font-mono ${methodStyle.bg} ${methodStyle.text}`}
              >
                {tab.method}
              </span>

              {/* Tab Title */}
              <span className="truncate text-xs flex-1 min-w-0 font-sans">
                {tab.name || 'Untitled Request'}
              </span>

              {/* Dirty indicator */}
              {tab.isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent ml-1.5 mr-0.5 animate-pulse shrink-0" />
              )}

              {/* Tab Actions */}
              <div className="flex items-center ml-1 space-x-0.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-text rounded transition-opacity"
                  title="Duplicate Tab"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-red-400 rounded transition-opacity"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Tab Button */}
        <button
          onClick={() => openTab()}
          className="flex items-center justify-center w-8 h-full text-text-secondary hover:text-text hover:bg-background-tertiary transition-colors shrink-0"
          title="New Request (Cmd/Ctrl + N)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scrollBy(150)}
          className="absolute right-20 z-20 h-full px-1 bg-background-secondary/90 hover:bg-background-tertiary text-text-muted hover:text-text border-l border-border backdrop-blur-sm transition-colors"
          title="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Tab Context Tools */}
      {tabs.length > 1 && (
        <div className="hidden sm:flex items-center px-2 space-x-1 border-l border-border text-xs text-text-muted shrink-0 bg-background-secondary">
          <button
            onClick={() => activeTabId && closeOtherTabs(activeTabId)}
            className="p-1 hover:text-text rounded hover:bg-background-tertiary transition-colors text-[11px]"
            title="Close Other Tabs"
          >
            Close Others
          </button>
        </div>
      )}
    </div>
  );
};
