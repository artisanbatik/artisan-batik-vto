
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { useStudio } from '../studio/StudioContext';

interface CanvasViewerProps {
  scale: number;
  position: { x: number; y: number };
  isDragging: boolean;
  isZoomed: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  interactionHandlers: any;
}

export const CanvasViewer: React.FC<CanvasViewerProps> = ({
  scale,
  position,
  isDragging,
  isZoomed,
  containerRef,
  interactionHandlers
}) => {
  const { currentDisplayImage, filters: filterManager } = useStudio();
  const filters = filterManager.data;

  const imageStyle = useMemo(() => ({
    filter: `brightness(${filters.brightness / 100}) contrast(${filters.contrast / 100}) saturate(${filters.saturation / 100}) hue-rotate(${filters.hue}deg) sepia(${filters.sepia}%)`,
    transition: 'filter 0.2s ease-out'
  }), [filters]);

  if (!currentDisplayImage) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      {...interactionHandlers}
    >
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
    </div>
  );
};
