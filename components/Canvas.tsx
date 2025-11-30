
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useEffect } from 'react';
import Spinner from './ui/spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { DownloadFormatModal } from './modals/DownloadFormatModal';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useCanvasActions } from '../hooks/useCanvasActions';
import { useStudio } from './studio/StudioContext';

// Sub-components
import { CanvasToolbar } from './canvas/CanvasToolbar';
import { ZoomControls } from './canvas/ZoomControls';
import { PoseSelector } from './canvas/PoseSelector';

const Canvas: React.FC = () => {
  // Consume Context
  const { 
      currentDisplayImage, 
      onStartOver, 
      isVTOLoading, 
      loadingMessage, 
      handleSelectPose, 
      poseInstructions, 
      currentPoseIndex, 
      availablePoseKeys, 
      filters: filterManager, 
      undo, 
      redo, 
      canUndo, 
      canRedo, 
      handleGenerateCommonPoses, 
      isMobile, 
      theme, 
      onToggleTheme,
      persistenceActions
  } = useStudio();

  const filters = filterManager.data;

  // Custom Hooks
  const { 
      isFormatModalOpen, 
      setIsFormatModalOpen, 
      isDownloading, 
      handleDownloadRequest, 
      handleConfirmDownload 
  } = useCanvasActions();
  
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
  }, [currentDisplayImage, resetView]);
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4 pb-18 relative animate-zoom-in group bg-stone-100 dark:bg-stone-800">
      
      <CanvasToolbar 
        onStartOver={onStartOver}
        onToggleTheme={onToggleTheme}
        theme={theme}
        onUndo={() => undo((id) => persistenceActions.deleteWardrobeItem(id))}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isLoading={isVTOLoading}
        hasImage={!!currentDisplayImage}
        onDownloadClick={handleDownloadRequest}
        isDownloading={isDownloading}
      />

      {/* Image Display or Placeholder */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        {...handlers}
      >
        {currentDisplayImage ? (
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
              key={currentDisplayImage}
              src={currentDisplayImage}
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
          {isVTOLoading && (
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
      
      <ZoomControls 
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        isDefaultView={isDefaultView}
        visible={!!currentDisplayImage}
        isMobile={isMobile}
      />

      {currentDisplayImage && !isVTOLoading && (
        <PoseSelector 
            poseInstructions={poseInstructions}
            currentPoseIndex={currentPoseIndex}
            availablePoseKeys={availablePoseKeys}
            onSelectPose={handleSelectPose}
            onGenerateCommonPoses={handleGenerateCommonPoses}
            isLoading={isVTOLoading}
            isMobile={isMobile}
        />
      )}

      <DownloadFormatModal
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
        onConfirm={(format) => handleConfirmDownload(format, currentDisplayImage, filters)}
        isProcessing={isDownloading}
      />
    </div>
  );
};

export default Canvas;
