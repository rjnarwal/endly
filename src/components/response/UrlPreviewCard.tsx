import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Send,
  Image as ImageIcon,
  Globe,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { createDefaultRequest } from '../../store/useCollectionStore';

interface UrlPreviewCardProps {
  url: string;
  position: { x: number; y: number };
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// Determine if URL is likely an image
export const isImageUrl = (url: string): boolean => {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico', '.avif'];
    if (imageExtensions.some((ext) => cleanUrl.endsWith(ext))) return true;

    // Check for common image hosting query patterns
    if (url.includes('format=jpg') || url.includes('format=png') || url.includes('format=webp')) return true;
    if (url.includes('images.unsplash.com') || url.includes('imgur.com')) return true;
  } catch {
    return false;
  }
  return false;
};

export const UrlPreviewCard: React.FC<UrlPreviewCardProps> = ({
  url,
  position,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { openTab } = useWorkspaceStore();
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [iframeError, setIframeError] = useState(false);

  const isImg = isImageUrl(url);

  // Parse URL components
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(url);
  } catch {
    // If not a valid absolute URL, fallback
    try {
      parsedUrl = new URL('https://' + url);
    } catch {
      parsedUrl = null;
    }
  }

  const domain = parsedUrl?.hostname || url;
  const isSecure = parsedUrl?.protocol === 'https:';
  const pathname = parsedUrl?.pathname || '';
  const search = parsedUrl?.search || '';

  // Favicon URL
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64` : null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleOpenInBrowser = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    const req = createDefaultRequest(`GET ${domain}`, 'GET', url);
    openTab(req);
  };

  // Adjust card placement to prevent overflowing window bounds
  const cardWidth = 340;
  const cardHeight = isImg ? 270 : 230;
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  let left = position.x - 40;
  if (left + cardWidth > windowWidth - 20) {
    left = windowWidth - cardWidth - 20;
  }
  if (left < 20) left = 20;

  let top = position.y + 18;
  // If popover goes off the bottom of the screen, place it above the cursor
  if (top + cardHeight > windowHeight - 20) {
    top = Math.max(10, position.y - cardHeight - 12);
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${cardWidth}px`,
        zIndex: 9999,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="bg-background-secondary/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-xl overflow-hidden font-sans text-xs text-text animate-in fade-in zoom-in-95 duration-150 select-none ring-1 ring-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-background-tertiary/70 border-b border-border/60">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="w-4 h-4 rounded-sm shrink-0 bg-background-elevated"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : isImg ? (
            <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          )}

          <div className="flex items-center space-x-1 min-w-0">
            {isSecure ? (
              <span title="Secure HTTPS Connection">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              </span>
            ) : (
              <span title="HTTP (Not Secure)">
                <Unlock className="w-3 h-3 text-amber-400 shrink-0" />
              </span>
            )}
            <span className="font-semibold text-text truncate text-[11px]">{domain}</span>
          </div>
        </div>

        <span
          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${
            isImg
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
          }`}
        >
          {isImg ? 'Image' : 'Web Page'}
        </span>
      </div>

      {/* Main Preview Area */}
      <div className="p-3 bg-background/50">
        {isImg ? (
          /* Image Preview Box */
          <div className="relative w-full h-36 bg-background-tertiary/60 rounded-lg overflow-hidden border border-border/50 flex items-center justify-center group/img">
            {/* Loading indicator */}
            {!imageLoaded && !imageError && (
              <div className="flex flex-col items-center justify-center space-y-1.5 text-text-muted">
                <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                <span className="text-[10px]">Loading image...</span>
              </div>
            )}

            {/* Error indicator */}
            {imageError && (
              <div className="flex flex-col items-center justify-center space-y-1 text-text-muted p-2 text-center">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] text-text">Preview unavailable</span>
                <span className="text-[9px] text-text-muted">Click Open to view directly</span>
              </div>
            )}

            {/* Image element */}
            <img
              src={url}
              alt="Glimpse preview"
              className={`max-h-full max-w-full object-contain transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={(e) => {
                setImageLoaded(true);
                const img = e.currentTarget;
                setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
            />

            {/* Dimensions Badge */}
            {imageLoaded && imageDimensions && (
              <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-white/90 font-mono text-[9px] px-1.5 py-0.5 rounded border border-white/10">
                {imageDimensions.width} × {imageDimensions.height} px
              </div>
            )}
          </div>
        ) : (
          /* Web Page Glimpse Box */
          <div className="relative w-full h-28 bg-background-tertiary/40 rounded-lg overflow-hidden border border-border/50 flex flex-col justify-between p-2.5">
            <div className="flex flex-col space-y-1 min-w-0">
              <div className="flex items-center space-x-1.5 text-text-muted text-[10px]">
                <Globe className="w-3 h-3 text-text-muted" />
                <span className="font-mono text-[10px] text-accent truncate">{parsedUrl?.protocol || 'https:'}//</span>
                <span className="font-bold text-text truncate">{domain}</span>
              </div>

              <div className="font-mono text-[11px] text-text-secondary truncate bg-background-elevated/60 px-2 py-1 rounded border border-border/30">
                {pathname || '/'}
                {search && <span className="text-text-muted">{search}</span>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] text-text-muted">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to visit</span>
              </span>
              <span className="font-mono text-[9px] text-text-muted truncate max-w-[140px]">{parsedUrl?.port ? `Port: ${parsedUrl.port}` : 'Standard Web'}</span>
            </div>
          </div>
        )}

        {/* URL Path Details */}
        <div className="mt-2 px-1">
          <p className="font-mono text-[10px] text-text-muted truncate select-all" title={url}>
            {url}
          </p>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-between px-3 py-2 bg-background-tertiary/80 border-t border-border/60 text-xs">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopy}
            title="Copy URL to Clipboard"
            className="flex items-center space-x-1 px-2 py-1 rounded bg-background-elevated hover:bg-background-tertiary text-text hover:text-white border border-border/60 transition-colors text-[11px]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleOpenInNewTab}
            title="Open URL in a new Request Tab"
            className="flex items-center space-x-1 px-2 py-1 rounded bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 transition-colors text-[11px]"
          >
            <Send className="w-3 h-3" />
            <span>Send in Tab</span>
          </button>
        </div>

        <button
          onClick={handleOpenInBrowser}
          title="Open in new browser tab"
          className="flex items-center space-x-1 px-2 py-1 rounded bg-background-elevated hover:bg-background-tertiary text-text-secondary hover:text-text border border-border/60 transition-colors text-[11px]"
        >
          <span>Open</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
