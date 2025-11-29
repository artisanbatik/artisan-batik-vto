
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LookbookImage } from '../../types';
import { XIcon, DownloadIcon, WandSparklesIcon, ZoomInIcon, ChevronLeftIcon, SaveIcon, ChevronRightIcon, ZoomOutIcon, MaximizeIcon } from '../icons';
import Spinner from '../Spinner';
import { cn, ImageFormat, convertImage } from '../../lib/utils';
import JSZip from 'jszip';
import DownloadFormatModal from '../DownloadFormatModal';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import { ImageCard } from '../ui/image-card';

// --- Sub-components ---

const RegeneratePrompt: React.FC<{
    onCancel: () => void;
    onConfirm: (prompt: string) => void;
}> = ({ onCancel, onConfirm }) => {
    const [prompt, setPrompt] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-stone-800 rounded-lg p-4 shadow-xl w-full max-w-sm"
            >
                <h3 className="font-semibold text-stone-800 dark:text-stone-200">Sempurnakan Gambar</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 mb-3">Apa yang ingin Anda ubah atau perbaiki?</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='Contoh: "buat pencahayaan lebih dramatis"'
                    className="w-full h-20 p-2 text-sm bg-white dark:bg-stone-700 dark:text-stone-100 border border-stone-300 dark:border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <div className="flex justify-end gap-2 mt-3">
                    <button onClick={onCancel} className="px-3 py-1.5 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-600 rounded-md hover:bg-stone-300 dark:hover:bg-stone-500">Batal</button>
                    <button 
                        onClick={() => onConfirm(prompt)} 
                        disabled={!prompt.trim()}
                        className="px-3 py-1.5 text-sm font-semibold text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
                    >
                        Buat Ulang
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

interface LookbookCanvasProps {
    zoomedImage: LookbookImage;
    isRegenerating: boolean;
    isMobile: boolean;
    images: LookbookImage[];
    currentImageIndex: number;
    onPrevImage: () => void;
    onNextImage: () => void;
}

const LookbookCanvas: React.FC<LookbookCanvasProps> = ({ 
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

interface LookbookToolbarProps {
    onDownload: () => void;
    onRegenerate: () => void;
    isDownloading: boolean;
    isRegenerating: boolean;
}

const LookbookToolbar: React.FC<LookbookToolbarProps> = ({ onDownload, onRegenerate, isDownloading, isRegenerating }) => (
    <div className="flex-shrink-0 p-4 grid grid-cols-2 sm:flex sm:justify-end gap-3 border-t bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
        <button 
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700 disabled:opacity-50"
        >
            {isDownloading ? <Spinner className="w-4 h-4"/> : <DownloadIcon className="w-4 h-4"/>} 
            {isDownloading ? 'Mengunduh...' : 'Unduh'}
        </button>
        <button 
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-semibold text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
        >
            <WandSparklesIcon className="w-4 h-4" /> {isRegenerating ? 'Membuat...' : 'Buat Ulang'}
        </button>
    </div>
);

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

const LookbookModal: React.FC<LookbookModalProps> = ({ isOpen, onClose, isLoading, images, error, style, onRegenerate, regeneratingImageId, onSave, isSaved, isMobile, aspectRatio }) => {
    const [zoomedImage, setZoomedImage] = useState<LookbookImage | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showRegenPrompt, setShowRegenPrompt] = useState(false);
    const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
    const [downloadType, setDownloadType] = useState<'single' | 'all' | null>(null);

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

    const openZoomedView = (image: LookbookImage) => {
        setZoomedImage(image);
    };

    const handleDownloadSingle = async (format: ImageFormat) => {
        if (!zoomedImage) return;
        setIsDownloading(true);
        try {
            const { blob, extension } = await convertImage(zoomedImage.url, format);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Artisan_Batik_Lookbook_${style.replace(/\s/g, '_')}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (e) {
            console.error("Gagal mengunduh gambar:", e);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadAll = async (format: ImageFormat) => {
        setIsDownloading(true);
        const zip = new JSZip();
        
        const downloadPromises = images.map(async (image, index) => {
            try {
                const { blob, extension } = await convertImage(image.url, format);
                zip.file(`Artisan_Batik_Lookbook_${style.replace(/\s/g, '_')}_${index + 1}.${extension}`, blob);
            } catch (e) {
                 console.error(`Gagal mengonversi gambar ${index+1} untuk di-zip:`, e);
            }
        });
        
        await Promise.all(downloadPromises);

        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `Artisan_Batik_Lookbook_${style.replace(/\s/g, '_')}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            setIsDownloading(false);
        });
    };
    
    const handleConfirmDownload = (format: ImageFormat) => {
        setIsFormatModalOpen(false);
        if (downloadType === 'single') {
            handleDownloadSingle(format);
        } else if (downloadType === 'all') {
            handleDownloadAll(format);
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

    const content = () => {
        if (zoomedImage) {
            const isRegenerating = regeneratingImageId === zoomedImage.id;
            return (
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
                        isRegenerating={isRegenerating}
                        isMobile={isMobile}
                        images={images}
                        currentImageIndex={currentImageIndex}
                        onPrevImage={handlePrevImage}
                        onNextImage={handleNextImage}
                    />

                    <LookbookToolbar 
                        onDownload={() => { setDownloadType('single'); setIsFormatModalOpen(true); }}
                        onRegenerate={() => setShowRegenPrompt(true)}
                        isDownloading={isDownloading && downloadType === 'single'}
                        isRegenerating={isRegenerating}
                    />
                </div>
            );
        }

        return (
            <>
                <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
                    <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Lookbook: <span className="font-semibold">{style}</span></h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800" aria-label="Tutup">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                 <div className="p-4 sm:p-6 flex-grow overflow-y-auto min-h-0">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full min-h-64">
                            <Spinner />
                            <p className="text-lg font-serif text-stone-700 dark:text-stone-300 mt-4">Membuat gambar OOTD...</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">Ini mungkin memakan waktu hingga satu menit.</p>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="text-center min-h-64 flex flex-col items-center justify-center">
                            <p className="text-lg font-semibold text-red-600">Gagal Membuat</p>
                            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-md mx-auto">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            {images.map((image) => {
                                const isRegenerating = regeneratingImageId === image.id;
                                return (
                                    <div key={image.id} className="relative">
                                        <ImageCard
                                            imageUrl={image.url}
                                            aspectRatio={aspectRatio}
                                            className="h-full w-full"
                                            overlayContent={
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => openZoomedView(image)} 
                                                        className="p-2 bg-white/80 dark:bg-stone-900/80 rounded-full text-stone-800 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-900 shadow-md backdrop-blur-sm"
                                                        aria-label="Perbesar gambar"
                                                    >
                                                        <ZoomInIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => { openZoomedView(image); setShowRegenPrompt(true); }}
                                                        disabled={!!regeneratingImageId}
                                                        className="p-2 bg-white/80 dark:bg-stone-900/80 rounded-full text-stone-800 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-900 shadow-md backdrop-blur-sm disabled:opacity-50"
                                                        aria-label="Buat ulang gambar"
                                                    >
                                                        <WandSparklesIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            }
                                        />
                                        <AnimatePresence>
                                        {isRegenerating && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-white/80 dark:bg-stone-950/80 z-20 flex flex-col items-center justify-center rounded-lg"
                                            >
                                                <Spinner className="w-6 h-6"/>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                 <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 p-4 border-t bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 flex-shrink-0">
                    <button onClick={handleClose} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700">Tutup</button>
                     {!isLoading && !error && images.length > 0 && (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={onSave}
                                disabled={isSaved}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700 disabled:opacity-50"
                            >
                                <SaveIcon className="w-4 h-4" /> {isSaved ? 'Tersimpan' : 'Simpan Lookbook'}
                            </button>
                            <button
                                onClick={() => { setDownloadType('all'); setIsFormatModalOpen(true); }}
                                disabled={isDownloading && downloadType === 'all'}
                                className="flex-1 sm:flex-none px-5 py-2 font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                            {(isDownloading && downloadType === 'all') ? <Spinner className="w-5 h-5"/> : <DownloadIcon className="w-5 h-5" />}
                            {(isDownloading && downloadType === 'all') ? 'Menyiapkan...' : 'Unduh Semua'}
                            </button>
                        </div>
                    )}
                </div>
            </>
        );
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
            {content()}
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
