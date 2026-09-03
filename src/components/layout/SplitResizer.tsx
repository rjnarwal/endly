import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GripVertical, GripHorizontal, Columns, Rows, RotateCcw } from 'lucide-react';

interface SplitResizerProps {
  direction?: 'horizontal' | 'vertical'; // horizontal = vertical bar (resizes X), vertical = horizontal bar (resizes Y)
  onResize: (newRatio: number) => void;
  currentRatio: number; // percentage (20 to 80)
  onToggleOrientation?: () => void;
  onReset?: () => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  minRatio?: number;
  maxRatio?: number;
}

export const SplitResizer: React.FC<SplitResizerProps> = ({
  direction = 'horizontal',
  onResize,
  currentRatio,
  onToggleOrientation,
  onReset,
  orientation = 'horizontal',
  className = '',
  minRatio = 20,
  maxRatio = 80,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();

      let newRatio: number;
      if (direction === 'horizontal') {
        const offset = clientX - rect.left;
        newRatio = (offset / rect.width) * 100;
      } else {
        const offset = clientY - rect.top;
        newRatio = (offset / rect.height) * 100;
      }

      const clamped = Math.max(minRatio, Math.min(maxRatio, Math.round(newRatio)));
      onResize(clamped);
    },
    [isDragging, direction, minRatio, maxRatio, onResize]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, handleMove, direction]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={onReset}
      className={`relative flex items-center justify-center shrink-0 group transition-all z-20 select-none ${
        isHorizontal
          ? 'w-2 hover:w-2.5 cursor-col-resize bg-border hover:bg-accent/40 active:bg-accent'
          : 'h-2 hover:h-2.5 cursor-row-resize bg-border hover:bg-accent/40 active:bg-accent'
      } ${isDragging ? '!bg-accent shadow-md shadow-accent/20' : ''} ${className}`}
      title={`Drag to resize panels (${currentRatio}%). Double click to reset 50/50.`}
    >
      {/* Central Grip Indicator */}
      <div
        className={`flex items-center justify-center rounded-full bg-background-elevated border border-border shadow-sm text-text-muted group-hover:text-accent group-hover:border-accent/50 transition-colors ${
          isHorizontal ? 'w-3.5 h-7 py-0.5' : 'w-7 h-3.5 px-0.5'
        } ${isDragging ? 'bg-accent text-white border-accent' : ''}`}
      >
        {isHorizontal ? (
          <GripVertical className="w-3 h-3 pointer-events-none" />
        ) : (
          <GripHorizontal className="w-3 h-3 pointer-events-none" />
        )}
      </div>

      {/* Floating Quick Action Overlay on Hover */}
      <div
        className={`absolute hidden group-hover:flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-background-elevated/95 backdrop-blur-md border border-border shadow-xl text-[10px] text-text-secondary z-30 transition-all pointer-events-auto ${
          isHorizontal
            ? 'top-2 -translate-x-1/2 left-1/2 flex-col space-x-0 space-y-1 py-1 px-0.5'
            : 'right-2 -translate-y-1/2 top-1/2 flex-row'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {onReset && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="p-1 rounded hover:bg-background-tertiary hover:text-text transition-colors"
            title="Reset to 50/50 split"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}

        {onToggleOrientation && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleOrientation();
            }}
            className="p-1 rounded hover:bg-background-tertiary hover:text-text transition-colors"
            title={orientation === 'horizontal' ? 'Switch to Stacked View' : 'Switch to Side-by-Side View'}
          >
            {orientation === 'horizontal' ? (
              <Rows className="w-3 h-3 text-accent" />
            ) : (
              <Columns className="w-3 h-3 text-accent" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
