
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LookbookImage } from '../../types';
import { ChevronLeftIcon } from '../icons';
import { cn } from '../../lib/utils';
import { DownloadFormatModal } from '../modals/DownloadFormatModal';

// Hooks
import { useLookbookActions } from '../../hooks/useLookbookActions';

// Imported Sub-Components
import { RegeneratePrompt } from './RegeneratePrompt';
import { LookbookCanvas } from './LookbookCanvas';
import { LookbookToolbar } from './LookbookToolbar';
import { LookbookGrid } from './LookbookGrid';

// --- Main Component ---

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  images: LookbookImage[];
  error: string | null;
  style: string;
  onRegenerate: (image: LookbookImage, refinementPrompt: string) => void;
  regeneratingImageId: string | null;
  onSave: () => void;
  isSaved: boolean;
  isMobile: boolean;
  aspectRatio: string;
}

const LookbookModal: React.FC<LookbookModalProps> = ({ 
    isOpen, onClose, isLoading, images, error, style, 
    onRegenerate, regeneratingImageId, onSave, isSaved, isMobile, aspectRatio 
}) => {
    const [zoomedImage, setZoomedImage] = useState<LookbookImage | null>(null);
    const [showRegenPrompt, setShowRegenPrompt] = useState(false);

    // Use Custom Hook for Actions
    const {
        isDownloading,
        isFormatModalOpen,
        setIsFormatModalOpen,
        downloadType,
        handleConfirmDownload,
        openDownloadSingle,
        openDownloadAll
    } = useLookbookActions({ images, style });

    const currentImageIndex = useMemo(() => {
        if (!zoomedImage) return -1;
        return images.findIndex(img => img.id === zoomedImage.id);
    }, [zoomedImage, images]);

    const handleNextImage = () => {
        if (currentImageIndex < images.length - 1) {
            setZoomedImage(images[currentImageIndex + 1]);
        }
    };
    
    const handlePrevImage = () => {
        if (currentImageIndex > 0) {
            setZoomedImage(images[currentImageIndex - 1]);
        }
    };

    const handleConfirmRegen = (prompt: string) => {
        if (zoomedImage) {
            onRegenerate(zoomedImage, prompt);
        }
        setShowRegenPrompt(false);
    };

    const handleClose = () => {
        setZoomedImage(null);
        onClose();
    }

    // Opens the zoomed view and immediately triggers the prompt (used from Grid)
    const handleGridRegenClick = (image: LookbookImage) => {
        setZoomedImage(image);
        setShowRegenPrompt(true);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 sm:p-4"
                    onClick={(e) => {
                        if (!zoomedImage && !showRegenPrompt) {
                            handleClose();
                        }
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "relative bg-white dark:bg-stone-900 w-full flex flex-col shadow-xl transition-all duration-300 ease-in-out rounded-none sm:rounded-2xl",
                            zoomedImage
                                ? "h-full sm:max-w-4xl sm:h-[90vh]"
                                : "max-h-full h-full sm:max-h-[90vh] sm:h-auto max-w-md sm:max-w-xl"
                        )}
                    >
                        {zoomedImage ? (
                            // Detail View
                            <div className="w-full h-full flex flex-col relative">
                                <AnimatePresence>
                                    {showRegenPrompt && <RegeneratePrompt onCancel={() => setShowRegenPrompt(false)} onConfirm={handleConfirmRegen} />}
                                </AnimatePresence>
                                
                                <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-stone-200 dark:border-stone-800">
                                    <button onClick={() => setZoomedImage(null)} className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100">
                                        <ChevronLeftIcon className="w-5 h-5" /> Kembali ke Galeri
                                    </button>
                                </div>
                                
                                <LookbookCanvas
                                    zoomedImage={zoomedImage}
                                    isRegenerating={regeneratingImageId === zoomedImage.id}
                                    isMobile={isMobile}
                                    images={images}
                                    currentImageIndex={currentImageIndex}
                                    onPrevImage={handlePrevImage}
                                    onNextImage={handleNextImage}
                                />

                                <LookbookToolbar 
                                    onDownload={() => openDownloadSingle(zoomedImage)}
                                    onRegenerate={() => setShowRegenPrompt(true)}
                                    isDownloading={isDownloading && downloadType === 'single'}
                                    isRegenerating={regeneratingImageId === zoomedImage.id}
                                />
                            </div>
                        ) : (
                            // Grid View
                            <LookbookGrid 
                                images={images}
                                isLoading={isLoading}
                                error={error}
                                style={style}
                                aspectRatio={aspectRatio}
                                regeneratingImageId={regeneratingImageId}
                                isSaved={isSaved}
                                isDownloadingAll={isDownloading && downloadType === 'all'}
                                onClose={handleClose}
                                onSave={onSave}
                                onDownloadAll={openDownloadAll}
                                onImageClick={setZoomedImage}
                                onRegenerateClick={handleGridRegenClick}
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
            
            <DownloadFormatModal
                isOpen={isFormatModalOpen}
                onClose={() => setIsFormatModalOpen(false)}
                onConfirm={handleConfirmDownload}
                isProcessing={isDownloading}
            />
        </AnimatePresence>
    );
};

export default LookbookModal;
