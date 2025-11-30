
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LookbookImage } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon, MaximizeIcon } from '../icons';
import Spinner from '../ui/spinner';
import { cn } from '../../lib/utils';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';

interface LookbookCanvasProps {
    zoomedImage: LookbookImage;
    isRegenerating: boolean;
    isMobile: boolean;
    images: LookbookImage[];
    currentImageIndex: number;
    onPrevImage: () => void;
    onNextImage: () => void;
}

export const LookbookCanvas: React.FC<LookbookCanvasProps> = ({ 
    zoomedImage, isRegenerating, isMobile, images, currentImageIndex, onPrevImage, onNextImage 
}) => {
    const [isZoomEnabled, setIsZoomEnabled] = useState(false);
    
    // Reuse custom hook logic
    const { 
        scale, position, isDragging, containerRef, resetView, 
        handlers, zoomIn, zoomOut, canZoomIn, canZoomOut 
    } = useCanvasInteraction();

    useEffect(() => {
        if (!isZoomEnabled) {
            resetView();
        }
    }, [isZoomEnabled, resetView]);

    useEffect(() => {
        setIsZoomEnabled(false);
        resetView();
    }, [zoomedImage, resetView]);

    return (
        <div 
            ref={containerRef}
            className="flex-grow flex items-center justify-center p-2 sm:p-4 relative bg-stone-100 dark:bg-stone-950 overflow-hidden group/zoom"
            style={{ cursor: isZoomEnabled && scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            {...handlers}
        >
            <AnimatePresence>
                {isRegenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/80 dark:bg-stone-950/80 z-10 flex flex-col items-center justify-center"
                    >
                        <Spinner />
                        <p className="mt-4 font-serif text-stone-700 dark:text-stone-300">Membuat variasi baru...</p>
                    </motion.div>
                )}
            </AnimatePresence>
             <div
                key={zoomedImage.id}
                style={{
                    backgroundImage: `url(${zoomedImage.url})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    height: '100%',
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    transformOrigin: '0 0',
                }}
                draggable={false}
             />

            {/* Kontrol Navigasi */}
            {currentImageIndex > 0 && (
                <button onClick={onPrevImage} className={cn("absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-opacity", isMobile ? "opacity-100" : "opacity-0 group-hover/zoom:opacity-100")} aria-label="Gambar sebelumnya">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            )}
            {currentImageIndex < images.length - 1 && (
                 <button onClick={onNextImage} className={cn("absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-opacity", isMobile ? "opacity-100" : "opacity-0 group-hover/zoom:opacity-100")} aria-label="Gambar berikutnya">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            )}
            
            {/* Zoom Controls */}
            <div className={cn(
                "absolute z-30 flex flex-col items-center gap-1 bg-white/80 dark:bg-stone-900/80 rounded-full p-1.5 border border-stone-300/80 dark:border-stone-700/80 shadow-md",
                isMobile 
                    ? "bottom-20 left-4" 
                    : "right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/zoom:opacity-100 transition-opacity"
            )}>
                <button
                    onClick={() => setIsZoomEnabled(!isZoomEnabled)}
                    className={cn("p-2 rounded-full text-stone-700 dark:text-stone-200 transition-colors", isZoomEnabled ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-800" : "hover:bg-stone-200/60 dark:hover:bg-stone-800/60")}
                    aria-label={isZoomEnabled ? "Nonaktifkan Zoom" : "Aktifkan Zoom"}
                >
                    <ZoomInIcon className="w-5 h-5" />
                </button>
                <AnimatePresence>
                {isZoomEnabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '0.25rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="flex flex-col items-center gap-1 overflow-hidden"
                    >
                        <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80"></div>
                        <button onClick={zoomIn} disabled={!canZoomIn} className="p-2 rounded-full text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 disabled:text-stone-400 dark:disabled:text-stone-500 disabled:bg-transparent disabled:cursor-not-allowed transition-colors" aria-label="Perbesar">
                            <ZoomInIcon className="w-5 h-5" />
                        </button>
                        <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80"></div>
                        <button onClick={zoomOut} disabled={!canZoomOut} className="p-2 rounded-full text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 disabled:text-stone-400 dark:disabled:text-stone-500 disabled:bg-transparent disabled:cursor-not-allowed transition-colors" aria-label="Perkecil">
                            <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <div className="w-5 h-px bg-stone-300/80 dark:bg-stone-700/80 my-1"></div>
                        <button onClick={resetView} disabled={scale === 1 && position.x === 0 && position.y === 0} className="p-2 rounded-full text-stone-700 dark:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 disabled:text-stone-400 dark:disabled:text-stone-500 disabled:bg-transparent disabled:cursor-not-allowed transition-colors" aria-label="Atur Ulang Tampilan">
                            <MaximizeIcon className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};
