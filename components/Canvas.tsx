
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { DownloadFormatModal } from './modals/DownloadFormatModal';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useCanvasActions } from '../hooks/useCanvasActions';
import { useStudio } from './studio/StudioContext';

// Sub-components
import { CanvasToolbar } from './canvas/CanvasToolbar';
import { ZoomControls } from './canvas/ZoomControls';
import { PoseSelector } from './canvas/PoseSelector';
import { CanvasViewer } from './canvas/CanvasViewer';
import { CanvasOverlay } from './canvas/CanvasOverlay';

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

      <CanvasViewer 
        imageSrc={currentDisplayImage}
        filters={filters}
        scale={scale}
        position={position}
        isDragging={isDragging}
        isZoomed={isZoomed}
        containerRef={containerRef}
        interactionHandlers={handlers}
      />
      
      <CanvasOverlay 
        isLoading={isVTOLoading}
        loadingMessage={loadingMessage}
        hasImage={!!currentDisplayImage}
      />
      
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
