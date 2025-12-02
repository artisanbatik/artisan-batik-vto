
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LookbookImage } from '../../types';
import { XIcon, DownloadIcon, SaveIcon, ZoomInIcon, WandSparklesIcon } from '../icons';
import Spinner from '../ui/spinner';
import { ImageCard } from '../ui/image-card';

interface LookbookGridProps {
    images: LookbookImage[];
    isLoading: boolean;
    error: string | null;
    style: string;
    aspectRatio: string;
    regeneratingImageId: string | null;
    isSaved: boolean;
    isDownloadingAll: boolean;
    onClose: () => void;
    onSave: () => void;
    onDownloadAll: () => void;
    onImageClick: (image: LookbookImage) => void;
    onRegenerateClick: (image: LookbookImage) => void;
}

export const LookbookGrid: React.FC<LookbookGridProps> = ({
    images,
    isLoading,
    error,
    style,
    aspectRatio,
    regeneratingImageId,
    isSaved,
    isDownloadingAll,
    onClose,
    onSave,
    onDownloadAll,
    onImageClick,
    onRegenerateClick
}) => {
    return (
        <>
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
                <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">
                    Lookbook: <span className="font-semibold">{style}</span>
                </h2>
                <button 
                    onClick={onClose} 
                    className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800" 
                    aria-label="Tutup"
                >
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
                                                    onClick={() => onImageClick(image)} 
                                                    className="p-2 bg-white/80 dark:bg-stone-900/80 rounded-full text-stone-800 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-900 shadow-md backdrop-blur-sm"
                                                    aria-label="Perbesar gambar"
                                                >
                                                    <ZoomInIcon className="w-5 h-5"/>
                                                </button>
                                                <button 
                                                    onClick={() => onRegenerateClick(image)}
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
                <button 
                    onClick={onClose} 
                    className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700"
                >
                    Tutup
                </button>
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
                            onClick={onDownloadAll}
                            disabled={isDownloadingAll}
                            className="flex-1 sm:flex-none px-5 py-2 font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                        {isDownloadingAll ? <Spinner className="w-5 h-5"/> : <DownloadIcon className="w-5 h-5" />}
                        {isDownloadingAll ? 'Menyiapkan...' : 'Unduh Semua'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
