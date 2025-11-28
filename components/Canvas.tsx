
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, UndoIcon, RedoIcon, ZoomInIcon, ZoomOutIcon, MaximizeIcon, CheckCircleIcon, WandSparklesIcon, SunIcon, MoonIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import DownloadFormatModal from './DownloadFormatModal';
import { ImageFormat, convertImage, cn } from '../lib/utils';
import { Button } from './ui/button';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  availablePoseKeys: string[];
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    sepia: number;
  };
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onGenerateCommonPoses: () => void;
  isMobile: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ displayImageUrl, onStartOver, isLoading, loadingMessage, onSelectPose, poseInstructions, currentPoseIndex, availablePoseKeys, filters, onUndo, onRedo, canUndo, canRedo, onGenerateCommonPoses, isMobile, theme, onToggleTheme }) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Custom Hook for Interaction Logic
  const { 
    scale, position, isDragging, containerRef, resetView, 
    handlers, zoomIn, zoomOut, canZoomIn, canZoomOut, isZoomed, isDefaultView 
  } = useCanvasInteraction();

  const imageStyle = useMemo(() => ({
    filter: `brightness(${filters.brightness / 100}) contrast(${filters.contrast / 100}) saturate(${filters.saturation / 100}) hue-rotate(${filters.hue}deg) sepia(${filters.sepia}%)`,
    transition: 'filter 0.2s ease-out'
  }), [filters]);
  
  // Effect to reset zoom/pan when image changes
  useEffect(() => {
    resetView();
  }, [displayImageUrl, resetView]);

  const handlePreviousPose = () => {
    if (isLoading) return;
    const newIndex = (currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length;
    onSelectPose(newIndex);
  };

  const handleNextPose = () => {
    if (isLoading) return;
    const newIndex = (currentPoseIndex + 1) % poseInstructions.length;
    onSelectPose(newIndex);
  };

  const handleConfirmDownload = async (format: ImageFormat) => {
    if (!displayImageUrl) return;
    setIsDownloading(true);
    setIsFormatModalOpen(false); // Close modal right away
    try {
        const { blob, extension } = await convertImage(displayImageUrl, format, filters);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `artisan-batik-vto-outfit.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error("Gagal mengunduh gambar:", error);
    } finally {
        setIsDownloading(false);
    }
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4 pb-18 relative animate-zoom-in group bg-stone-100 dark:bg-stone-800">
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
        <div className="flex items-center bg-white/80 dark:bg-stone-900/80 border border-stone-300/80 dark:border-stone-700/80 rounded-full p-1 shadow-sm backdrop-blur-sm">
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
            <div className="w-px h-4 bg-stone-300/80 dark:bg-stone-700/80 mx-1"></div>
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

      {/* Top Right Controls */}
      {displayImageUrl && (
        <div className="absolute top-4 right-4 z-30">
          <Button
              onClick={() => setIsFormatModalOpen(true)}
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

      {/* Image Display or Placeholder */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        {...handlers}
      >
        {displayImageUrl ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              transformOrigin: '0 0',
            }}
          >
            <img
              key={displayImageUrl}
              src={displayImageUrl}
              alt="Model coba-pakai virtual"
              className="w-full h-full object-contain"
              style={imageStyle}
              draggable={false}
            />
          </div>
        ) : (
            <div className="w-full h-full max-w-md max-h-[80vh] bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg flex flex-col items-center justify-center">
              <Spinner />
              <p className="text-md font-serif text-stone-600 dark:text-stone-300 mt-4">Memuat Model...</p>
            </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  className="absolute inset-0 bg-white/90 dark:bg-stone-900/90 flex flex-col items-center justify-center z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Spinner />
                  {loadingMessage && (
                      <p className="text-lg font-serif text-stone-700 dark:text-stone-300 mt-4 text-center px-4">{loadingMessage}</p>
                  )}
              </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Zoom Controls */}
      {displayImageUrl && (
          <div className={cn(
            "absolute z-30 flex flex-col items-center gap-1 bg-white/80 dark:bg-stone-900/80 rounded-full p-1.5 border border-stone-300/80 dark:border-stone-700/80 shadow-md backdrop-blur-sm",
            isMobile ? "bottom-4 left-4" : "right-4 top-1/2 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          )}>
              <Button onClick={zoomIn} disabled={!canZoomIn} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Perbesar">
                  <ZoomInIcon className="w-5 h-5" />
              </Button>
              <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80"></div>
              <Button onClick={zoomOut} disabled={!canZoomOut} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Perkecil">
                  <ZoomOutIcon className="w-5 h-5" />
              </Button>
              <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80 my-1"></div>
              <Button onClick={resetView} disabled={isDefaultView} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Atur Ulang Tampilan">
                  <MaximizeIcon className="w-5 h-5" />
              </Button>
          </div>
      )}

      {/* Pose Controls */}
      {displayImageUrl && !isLoading && (
        <div 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 flex flex-col items-center",
            isMobile ? "bottom-4" : "bottom-12 md:opacity-0 md:group-hover:opacity-100"
          )}
          onMouseEnter={isMobile ? undefined : () => setIsPoseMenuOpen(true)}
          onMouseLeave={isMobile ? undefined : () => setIsPoseMenuOpen(false)}
        >
          {/* Pose popover menu */}
          <AnimatePresence>
              {isPoseMenuOpen && (
                  <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute bottom-full mb-3 w-72 bg-white dark:bg-stone-900 rounded-xl p-2 border border-stone-200/80 dark:border-stone-700/80 shadow-lg"
                  >
                      <div className="p-2 border-b border-stone-200 dark:border-stone-700 mb-2">
                        <Button
                          onClick={onGenerateCommonPoses}
                          disabled={isLoading}
                          variant="default"
                          className="w-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-stone-600 dark:hover:bg-stone-300"
                          leftIcon={<WandSparklesIcon className="w-4 h-4" />}
                        >
                          Buat 4 Pose Umum
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                          {poseInstructions.map((pose, index) => {
                              const isGenerated = availablePoseKeys.includes(pose);
                              const isCurrent = index === currentPoseIndex;
                              
                              return (
                                <button
                                    key={pose}
                                    onClick={() => onSelectPose(index)}
                                    disabled={isLoading || isCurrent}
                                    className="w-full flex items-center justify-between text-left text-xs font-medium text-stone-800 dark:text-stone-200 p-2 rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-800/70 disabled:bg-stone-200/70 dark:disabled:bg-stone-800/70 disabled:font-bold disabled:cursor-not-allowed"
                                >
                                    <span className="truncate pr-2">{pose}</span>
                                    {isCurrent ? (
                                        <CheckCircleIcon className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400 flex-shrink-0" />
                                    ) : isGenerated ? (
                                        <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <WandSparklesIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                    )}
                                </button>
                              )
                          })}
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
          
          <div 
            onClick={isMobile ? () => setIsPoseMenuOpen(prev => !prev) : undefined}
            className="flex items-center justify-center gap-2 bg-white/90 dark:bg-stone-900/90 rounded-full p-1.5 border border-stone-300/50 dark:border-stone-700/50 shadow-md backdrop-blur-sm"
          >
            <Button 
              onClick={handlePreviousPose}
              aria-label="Pose sebelumnya"
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800/50 h-8 w-8"
              disabled={isLoading}
            >
              <ChevronLeftIcon className="w-5 h-5 text-stone-800 dark:text-stone-200" />
            </Button>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 w-48 text-center truncate px-2 select-none" title={poseInstructions[currentPoseIndex]}>
              {poseInstructions[currentPoseIndex]}
            </span>
            <Button 
              onClick={handleNextPose}
              aria-label="Pose berikutnya"
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800/50 h-8 w-8"
              disabled={isLoading}
            >
              <ChevronRightIcon className="w-5 h-5 text-stone-800 dark:text-stone-200" />
            </Button>
          </div>
        </div>
      )}

      <DownloadFormatModal
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
        onConfirm={handleConfirmDownload}
        isProcessing={isDownloading}
      />
    </div>
  );
};

export default Canvas;
