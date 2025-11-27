/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { WardrobeItem, WardrobeCategory } from '../types';
import { UploadCloudIcon, CheckCircleIcon, XIcon, PencilIcon, Trash2Icon } from './icons';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, urlToFile } from '../lib/utils';

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => void;
  onFileUpload: (file: File) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
  onEditGarment: (garment: WardrobeItem) => void;
  onDeleteGarment: (garment: WardrobeItem) => void;
}

const CATEGORIES: { id: WardrobeCategory | 'all', name: string }[] = [
    { id: 'all', name: 'Semua' },
    { id: 'top', name: 'Atasan' },
    { id: 'bottom', name: 'Bawahan' },
    { id: 'outerwear', name: 'Luaran' },
    { id: 'dress', name: 'Gaun' },
    { id: 'accessory', name: 'Aksesori' },
];

const WardrobeModal: React.FC<WardrobeModalProps> = ({ isOpen, onClose, onGarmentSelect, onFileUpload, activeGarmentIds, isLoading, wardrobe, onEditGarment, onDeleteGarment }) => {
    const [error, setError] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [activeCategory, setActiveCategory] = useState<WardrobeCategory | 'all'>('all');

    const handleGarmentClick = async (item: WardrobeItem) => {
        if (isLoading || activeGarmentIds.includes(item.id)) return;
        setError(null);
        try {
            const file = await urlToFile(item.url, item.name);
            onGarmentSelect(file, item);
        } catch (err) {
            const detailedError = `Gagal memuat karya. Ini seringkali masalah CORS. Periksa konsol pengembang untuk detail.`;
            setError(detailedError);
            console.error(`[CORS Check] Failed to load and convert wardrobe item from URL: ${item.url}`, err);
        }
    };

    const handleGarmentFileSelect = (file: File) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
          setError('Silakan pilih file gambar.');
          return;
      }
      setError(null);
      onFileUpload(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleGarmentFileSelect(e.target.files[0]);
        }
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLoading) return;
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
          return;
        }
        setIsDraggingOver(false);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (isLoading) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleGarmentFileSelect(e.dataTransfer.files[0]);
        }
    };
    
    const filteredWardrobe = wardrobe.filter(item => 
        activeCategory === 'all' || item.category === activeCategory
    );

    return (
        <AnimatePresence>
        {isOpen && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white dark:bg-stone-900 rounded-2xl w-full max-w-2xl flex flex-col shadow-xl max-h-[85vh]"
            >
                <div className="flex items-center justify-between p-4 border-b dark:border-stone-800 flex-shrink-0">
                    <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Koleksi Karya</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200" aria-label="Close">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <div className="p-4 flex-shrink-0 border-b dark:border-stone-800 overflow-x-auto">
                    <div className="flex items-center gap-2">
                        {CATEGORIES.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={cn(
                                    'px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors rounded-full border',
                                    activeCategory === category.id
                                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-600 hover:border-stone-500 dark:hover:border-stone-400'
                                )}
                                disabled={isLoading}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 overflow-y-auto min-h-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                         <label 
                            htmlFor="modal-garment-upload" 
                            className={cn(
                                'relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 transition-colors',
                                isLoading && 'cursor-not-allowed bg-stone-100 dark:bg-stone-800',
                                !isLoading && isDraggingOver && 'cursor-pointer border-solid border-stone-600 dark:border-stone-400 bg-stone-100 dark:bg-stone-800',
                                !isLoading && !isDraggingOver && 'cursor-pointer border-stone-300 dark:border-stone-600 hover:border-stone-500 dark:hover:border-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                            )}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <UploadCloudIcon className="w-8 h-8 mb-2"/>
                            <span className="text-xs text-center font-semibold">Unggah</span>
                            <input id="modal-garment-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={isLoading}/>
                        </label>
                        
                        {filteredWardrobe.map((item) => {
                        const isActive = activeGarmentIds.includes(item.id);
                        return (
                            <div key={item.id} className="relative group aspect-square">
                                <button
                                    onClick={() => handleGarmentClick(item)}
                                    disabled={isLoading || isActive}
                                    className="w-full h-full border dark:border-stone-700 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-800 dark:focus:ring-stone-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                    aria-label={`Select ${item.name}`}
                                >
                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    {isActive && (
                                        <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                                            <CheckCircleIcon className="w-8 h-8 text-white" />
                                        </div>
                                    )}
                                </button>
                                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEditGarment(item); }}
                                        className="p-1.5 bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-800"
                                        title="Ubah"
                                    >
                                        <PencilIcon className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteGarment(item); }}
                                        className="p-1.5 bg-white/90 dark:bg-stone-800/90 text-red-600 dark:text-red-400 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-800"
                                        title="Hapus"
                                    >
                                        <Trash2Icon className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                                    <p className="text-white text-xs font-semibold truncate text-center">{item.name}</p>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                    {filteredWardrobe.length === 0 && (
                        <div className="col-span-full py-8 text-center">
                            <p className="text-stone-500 dark:text-stone-400">Belum ada item di kategori ini.</p>
                        </div>
                    )}
                     {error && (
                        <div className="col-span-full mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}
                </div>
            </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
    );
};

export default WardrobeModal;