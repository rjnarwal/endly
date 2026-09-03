import React, { useState, useEffect, useCallback, useRef } from 'react';

interface SidebarResizerProps {
  onResize: (newWidth: number) => void;
  currentWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onDoubleClick?: () => void;
  className?: string;
}

export const SidebarResizer: React.FC<SidebarResizerProps> = ({
  onResize,
  currentWidth,
  minWidth = 200,
  maxWidth = 550,
  onDoubleClick,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = currentWidth;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      startWidthRef.current = currentWidth;
    }
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const delta = clientX - startXRef.current;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + delta));
      onResize(newWidth);
    },
    [isDragging, minWidth, maxWidth, onResize]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
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
  }, [isDragging, handleMove]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={onDoubleClick}
      className={`w-1.5 hover:w-2 cursor-col-resize bg-border hover:bg-accent/60 active:bg-accent transition-all shrink-0 select-none relative group z-20 ${
        isDragging ? '!bg-accent w-2 shadow-sm' : ''
      } ${className}`}
      title="Drag to resize sidebar width. Double-click to collapse/expand."
    >
      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3.5 h-6 rounded-full bg-background-elevated border border-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <div className="w-0.5 h-3 bg-text-muted rounded-full" />
      </div>
    </div>
  );
};
