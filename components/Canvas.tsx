
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useStudio } from './studio/StudioContext';

// Sub-components (Now Smart Components)
import { CanvasToolbar } from './canvas/CanvasToolbar';
import { ZoomControls } from './canvas/ZoomControls';
import { PoseSelector } from './canvas/PoseSelector';
import { CanvasViewer } from './canvas/CanvasViewer';
import { CanvasOverlay } from './canvas/CanvasOverlay';

const Canvas: React.FC = () => {
  // We only need currentDisplayImage and isVTOLoading here 
  // to conditionally render the PoseSelector and trigger resetView
  const { currentDisplayImage, isVTOLoading } = useStudio();
  
  // Interaction Hook stays here because it owns the Container Ref
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
      
      <CanvasToolbar />

      <CanvasViewer 
        scale={scale}
        position={position}
        isDragging={isDragging}
        isZoomed={isZoomed}
        containerRef={containerRef}
        interactionHandlers={handlers}
      />
      
      <CanvasOverlay />
      
      <ZoomControls 
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        isDefaultView={isDefaultView}
      />

      {currentDisplayImage && !isVTOLoading && (
        <PoseSelector />
      )}
    </div>
  );
};

export default Canvas;
