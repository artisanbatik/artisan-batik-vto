
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { WardrobeItem, WardrobeCategory } from '../types';
import { CheckCircleIcon, PencilIcon, Trash2Icon, UploadCloudIcon } from './icons';
import { cn, urlToFile } from '../lib/utils';
import { ModalDialog } from './ui/modal-dialog';
import { Button } from './ui/button';
import { FileDropzone } from './ui/file-dropzone';

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
    
    const filteredWardrobe = wardrobe.filter(item => 
        activeCategory === 'all' || item.category === activeCategory
    );

    return (
        <ModalDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Koleksi Karya"
            maxWidth="max-w-2xl"
            className="h-[85vh] flex flex-col"
        >
            <div className="flex-shrink-0 mb-4 overflow-x-auto -mx-6 px-6 pb-2">
                <div className="flex items-center gap-2">
                    {CATEGORIES.map(category => (
                        <Button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            variant={activeCategory === category.id ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full whitespace-nowrap"
                            disabled={isLoading}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="overflow-y-auto min-h-0 flex-grow -mx-2 px-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
                    
                    <FileDropzone
                        onFileSelect={handleGarmentFileSelect}
                        disabled={isLoading}
                        variant="compact"
                        label="Unggah"
                        icon={<UploadCloudIcon className="w-8 h-8 mb-2" />}
                    />
                    
                    {filteredWardrobe.map((item) => {
                    const isActive = activeGarmentIds.includes(item.id);
                    return (
                        <div key={item.id} className="relative group aspect-square">
                            <button
                                onClick={() => handleGarmentClick(item)}
                                disabled={isLoading || isActive}
                                className={cn(
                                    "w-full h-full border dark:border-stone-700 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-800 dark:focus:ring-stone-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all",
                                    isActive ? "ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2" : ""
                                )}
                                aria-label={`Select ${item.name}`}
                            >
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                {isActive && (
                                    <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                                        <CheckCircleIcon className="w-8 h-8 text-white drop-shadow-md" />
                                    </div>
                                )}
                            </button>
                            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    onClick={(e) => { e.stopPropagation(); onEditGarment(item); }}
                                    variant="secondary"
                                    size="icon"
                                    className="h-7 w-7 rounded-full shadow-sm bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800"
                                    title="Ubah"
                                >
                                    <PencilIcon className="w-3.5 h-3.5 text-stone-700 dark:text-stone-200" />
                                </Button>
                                <Button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteGarment(item); }}
                                    variant="secondary"
                                    size="icon"
                                    className="h-7 w-7 rounded-full shadow-sm bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800"
                                    title="Hapus"
                                >
                                    <Trash2Icon className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/70 to-transparent pointer-events-none rounded-b-lg">
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
        </ModalDialog>
    );
};

export default WardrobeModal;
