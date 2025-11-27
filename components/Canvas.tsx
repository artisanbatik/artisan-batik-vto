/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, UndoIcon, RedoIcon, ZoomInIcon, ZoomOutIcon, MaximizeIcon, CheckCircleIcon, WandSparklesIcon, SunIcon, MoonIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import DownloadFormatModal from './DownloadFormatModal';
import { ImageFormat, convertImage, cn } from '../lib/utils';
import { Button } from './ui/button';

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

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const Canvas: React.FC<CanvasProps> = ({ displayImageUrl, onStartOver, isLoading, loadingMessage, onSelectPose, poseInstructions, currentPoseIndex, availablePoseKeys, filters, onUndo, onRedo, canUndo, canRedo, onGenerateCommonPoses, isMobile, theme, onToggleTheme }) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // State for zoom and pan
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // State for touch gestures
  const touchStartDistance = useRef<number>(0);
  const touchStartPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const imageStyle = useMemo(() => ({
    filter: `brightness(${filters.brightness / 100}) contrast(${filters.contrast / 100}) saturate(${filters.saturation / 100}) hue-rotate(${filters.hue}deg) sepia(${filters.sepia}%)`,
    transition: 'filter 0.2s ease-out'
  }), [filters]);
  
  const handleResetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Effect to reset zoom/pan when image changes
  useEffect(() => {
    handleResetView();
  }, [displayImageUrl, handleResetView]);

  const setClampedPosition = useCallback((newPos: { x: number; y: number }, currentScale: number) => {
    if (!containerRef.current) {
      setPosition(newPos);
      return;
    }
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const minX = containerRect.width - containerRect.width * currentScale;
    const minY = containerRect.height - containerRect.height * currentScale;

    const clampedX = clamp(newPos.x, minX, 0);
    const clampedY = clamp(newPos.y, minY, 0);
    
    setPosition({ x: clampedX, y: clampedY });
  }, []);


  const handleZoom = (delta: number, clientX?: number, clientY?: number) => {
    if (!containerRef.current) return;

    const newScale = clamp(scale + delta, MIN_SCALE, MAX_SCALE);
    if (newScale === scale) return;
    
    if (newScale === 1) {
      handleResetView();
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (clientX ?? (rect.left + rect.width / 2)) - rect.left;
    const mouseY = (clientY ?? (rect.top + rect.height / 2)) - rect.top;
    
    const newPosX = mouseX - ((mouseX - position.x) / scale) * newScale;
    const newPosY = mouseY - ((mouseY - position.y) / scale) * newScale;
    
    setScale(newScale);
    setClampedPosition({ x: newPosX, y: newPosY }, newScale);
  };
  
  // --- Mouse and Wheel Event Handlers ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(-e.deltaY * 0.005, e.clientX, e.clientY);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const newPos = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
    setClampedPosition(newPos, scale);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // --- Touch Event Handlers ---
  const getDistance = (touches: React.TouchList) => {
    return Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartDistance.current = getDistance(e.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      touchStartPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const newDistance = getDistance(e.touches);
      const delta = (newDistance - touchStartDistance.current) * 0.01; // Sensitivity
      handleZoom(delta, (e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2);
      touchStartDistance.current = newDistance;
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      const newPos = { x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y };
      setClampedPosition(newPos, scale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistance.current = 0;
  };

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
            className="bg-white/80 dark:bg-stone-900/80 border-stone-300/80 dark:border-stone-700/80 rounded-full hover:bg-white dark:hover:bg-stone-900"
            leftIcon={<RotateCcwIcon className="w-4 h-4" />}
        >
            Mulai Ulang
        </Button>

        <Button 
            onClick={onToggleTheme} 
            variant="outline"
            size="icon"
            className="rounded-full bg-white/80 dark:bg-stone-900/80 border-stone-300/80 dark:border-stone-700/80 hover:bg-white dark:hover:bg-stone-900"
        >
            {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
        </Button>

        {/* Undo/Redo Controls */}
        <div className="flex items-center bg-white/80 dark:bg-stone-900/80 border border-stone-300/80 dark:border-stone-700/80 rounded-full p-1 shadow-sm">
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
              className="bg-white/80 dark:bg-stone-900/80 border-stone-300/80 dark:border-stone-700/80 rounded-full hover:bg-white dark:hover:bg-stone-900"
              leftIcon={!isDownloading && <DownloadIcon className="w-4 h-4" />}
          >
              {isDownloading ? 'Mengunduh...' : 'Unduh'}
          </Button>
        </div>
      )}

      {/* Image Display or Placeholder */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
            "absolute z-30 flex flex-col items-center gap-1 bg-white/80 dark:bg-stone-900/80 rounded-full p-1.5 border border-stone-300/80 dark:border-stone-700/80 shadow-md",
            isMobile ? "bottom-4 left-4" : "right-4 top-1/2 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          )}>
              <Button onClick={() => handleZoom(0.2)} disabled={scale >= MAX_SCALE} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Perbesar">
                  <ZoomInIcon className="w-5 h-5" />
              </Button>
              <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80"></div>
              <Button onClick={() => handleZoom(-0.2)} disabled={scale <= MIN_SCALE} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Perkecil">
                  <ZoomOutIcon className="w-5 h-5" />
              </Button>
              <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80 my-1"></div>
              <Button onClick={handleResetView} disabled={scale === 1 && position.x === 0 && position.y === 0} variant="ghost" size="icon" className="rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800/60 h-8 w-8" aria-label="Atur Ulang Tampilan">
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
                      <div className="grid grid-cols-2 gap-2">
                          {poseInstructions.map((pose, index) => {
                              const isGenerated = availablePoseKeys.includes(pose);
                              const isCurrent = index === currentPoseIndex;
                              
                              return (
                                <button
                                    key={pose}
                                    onClick={() => onSelectPose(index)}
                                    disabled={isLoading || isCurrent}
                                    className="w-full flex items-center justify-between text-left text-sm font-medium text-stone-800 dark:text-stone-200 p-2 rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-800/70 disabled:bg-stone-200/70 dark:disabled:bg-stone-800/70 disabled:font-bold disabled:cursor-not-allowed"
                                >
                                    <span className="truncate pr-2">{pose}</span>
                                    {isCurrent ? (
                                        <CheckCircleIcon className="w-4 h-4 text-stone-600 dark:text-stone-400 flex-shrink-0" />
                                    ) : isGenerated ? (
                                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <WandSparklesIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
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
            className="flex items-center justify-center gap-2 bg-white/90 dark:bg-stone-900/90 rounded-full p-2 border border-stone-300/50 dark:border-stone-700/50 shadow-md"
          >
            <Button 
              onClick={handlePreviousPose}
              aria-label="Pose sebelumnya"
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/80 dark:hover:bg-black/20"
              disabled={isLoading}
            >
              <ChevronLeftIcon className="w-5 h-5 text-stone-800 dark:text-stone-200" />
            </Button>
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 w-48 text-center truncate" title={poseInstructions[currentPoseIndex]}>
              {poseInstructions[currentPoseIndex]}
            </span>
            <Button 
              onClick={handleNextPose}
              aria-label="Pose berikutnya"
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/80 dark:hover:bg-black/20"
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