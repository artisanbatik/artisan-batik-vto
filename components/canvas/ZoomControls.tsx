
import React from 'react';
import { ZoomInIcon, ZoomOutIcon, MaximizeIcon } from '../icons';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isDefaultView: boolean;
  visible: boolean;
  isMobile: boolean;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  canZoomIn,
  canZoomOut,
  isDefaultView,
  visible,
  isMobile
}) => {
  if (!visible) return null;

  return (
    <div className={cn(
      "absolute z-30 flex flex-col items-center gap-1 bg-white/80 dark:bg-stone-900/80 rounded-full p-1.5 border border-stone-300/80 dark:border-stone-700/80 shadow-md backdrop-blur-sm",
      isMobile ? "bottom-4 left-4" : "right-4 top-1/2 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
    )}>
      <Button onClick={onZoomIn} disabled={!canZoomIn} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Perbesar">
        <ZoomInIcon className="w-5 h-5" />
      </Button>
      <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80"></div>
      <Button onClick={onZoomOut} disabled={!canZoomOut} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Perkecil">
        <ZoomOutIcon className="w-5 h-5" />
      </Button>
      <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80 my-1"></div>
      <Button onClick={onResetView} disabled={isDefaultView} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Atur Ulang Tampilan">
        <MaximizeIcon className="w-5 h-5" />
      </Button>
    </div>
  );
};
