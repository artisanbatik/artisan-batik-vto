
import React from 'react';
import { RotateCcwIcon, MoonIcon, SunIcon, UndoIcon, RedoIcon, DownloadIcon } from '../icons';
import { Button } from '../ui/button';

interface CanvasToolbarProps {
  onStartOver: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isLoading: boolean;
  onDownloadClick?: () => void;
  isDownloading?: boolean;
  hasImage: boolean;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onStartOver,
  onToggleTheme,
  theme,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isLoading,
  onDownloadClick,
  isDownloading,
  hasImage
}) => {
  return (
    <>
      {/* Top Left Controls */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <Button
          onClick={onStartOver}
          variant="outline"
          size="sm"
          className="bg-white/80 dark:bg-stone-900/80 border-stone-300/80 dark:border-stone-700/80 rounded-full hover:bg-white dark:hover:bg-stone-900 shadow-sm backdrop-blur-sm"
          leftIcon={<RotateCcwIcon className="w-3.5 h-3.5" />}
        >
          Mulai Ulang
        </Button>

        <Button
          onClick={onToggleTheme}
          variant="outline"
          size="icon"
          className="rounded-full bg-white/80 dark:bg-stone-900/80 border-stone-300/80 dark:border-stone-700/80 hover:bg-white dark:hover:bg-stone-900 shadow-sm backdrop-blur-sm"
        >
          {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
        </Button>

        {/* Undo/Redo Controls */}
        <div className="flex items-center bg-white/80 dark:bg-stone-900/80 border border-stone-300/80 dark:border-stone-700/80 rounded-full p-1 shadow-sm backdrop-blur-sm gap-1">
          <Button
            onClick={onUndo}
            disabled={!canUndo || isLoading}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8"
            aria-label="Urungkan"
          >
            <UndoIcon className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-stone-300/80 dark:bg-stone-700/80"></div>
          <Button
            onClick={onRedo}
            disabled={!canRedo || isLoading}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8"
            aria-label="Ulangi"
          >
            <RedoIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Top Right Controls (Download) */}
      {hasImage && onDownloadClick && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            onClick={onDownloadClick}
            disabled={isDownloading}
            isLoading={isDownloading}
            variant="outline"
            size="sm"
            className="bg-white/80 dark:bg-stone-900/80 border-stone-300/80 dark:border-stone-700/80 rounded-full hover:bg-white dark:hover:bg-stone-900 shadow-sm backdrop-blur-sm"
            leftIcon={!isDownloading && <DownloadIcon className="w-3.5 h-3.5" />}
          >
            {isDownloading ? 'Mengunduh...' : 'Unduh'}
          </Button>
        </div>
      )}
    </>
  );
};
