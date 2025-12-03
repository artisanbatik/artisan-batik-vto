
import React from 'react';
import { RotateCcwIcon, UndoIcon, RedoIcon, DownloadIcon } from '../icons';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { useStudio } from '../studio/StudioContext';
import { useCanvasActions } from '../../hooks/useCanvasActions';
import { DownloadFormatModal } from '../modals/DownloadFormatModal';

export const CanvasToolbar: React.FC = () => {
  const { 
    onStartOver, 
    theme, 
    onToggleTheme, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    isVTOLoading,
    currentDisplayImage,
    filters,
    persistenceActions
  } = useStudio();

  // Move Download Logic here
  const { 
      isFormatModalOpen, 
      setIsFormatModalOpen, 
      isDownloading, 
      handleDownloadRequest, 
      handleConfirmDownload 
  } = useCanvasActions();

  const filterData = filters.data;
  const hasImage = !!currentDisplayImage;

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

        <ThemeToggle 
            theme={theme}
            onToggle={onToggleTheme}
            variant="outline"
            className="bg-white/80 dark:bg-stone-900/80 border-stone-300/80 dark:border-stone-700/80 hover:bg-white dark:hover:bg-stone-900 shadow-sm backdrop-blur-sm"
        />

        {/* Undo/Redo Controls */}
        <div className="flex items-center bg-white/80 dark:bg-stone-900/80 border border-stone-300/80 dark:border-stone-700/80 rounded-full p-1 shadow-sm backdrop-blur-sm gap-1">
          <Button
            onClick={() => undo((id) => persistenceActions.deleteWardrobeItem(id))}
            disabled={!canUndo || isVTOLoading}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8"
            aria-label="Urungkan"
          >
            <UndoIcon className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-stone-300/80 dark:bg-stone-700/80"></div>
          <Button
            onClick={redo}
            disabled={!canRedo || isVTOLoading}
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
      {hasImage && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            onClick={handleDownloadRequest}
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

      {/* Modal is now managed here */}
      <DownloadFormatModal
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
        onConfirm={(format) => handleConfirmDownload(format, currentDisplayImage, filterData)}
        isProcessing={isDownloading}
      />
    </>
  );
};
