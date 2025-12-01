/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { WardrobeItem, WardrobeCategory } from '../../types';
import { PencilIcon, Trash2Icon, UploadCloudIcon, PackageIcon } from '../icons';
import { urlToFile } from '../../lib/utils';
import { ModalDialog } from '../ui/modal-dialog';
import { Button } from '../ui/button';
import { FileDropzone } from '../ui/file-dropzone';
import { ImageCard } from '../ui/image-card';
import { EmptyState } from '../ui/empty-state';
import { CategoryFilter, CategoryOption } from '../wardrobe/CategoryFilter';

interface WardrobePickerModalProps {
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

const CATEGORIES: CategoryOption[] = [
    { id: 'all', name: 'Semua' },
    { id: 'top', name: 'Atasan' },
    { id: 'bottom', name: 'Bawahan' },
    { id: 'outerwear', name: 'Luaran' },
    { id: 'dress', name: 'Gaun' },
    { id: 'accessory', name: 'Aksesori' },
];

export const WardrobePickerModal: React.FC<WardrobePickerModalProps> = ({ isOpen, onClose, onGarmentSelect, onFileUpload, activeGarmentIds, isLoading, wardrobe, onEditGarment, onDeleteGarment }) => {
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
            <CategoryFilter 
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                disabled={isLoading}
            />

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
                            <ImageCard
                                key={item.id}
                                imageUrl={item.url}
                                title={item.name}
                                aspectRatio="1:1"
                                isActive={isActive}
                                isDisabled={isLoading}
                                onClick={() => handleGarmentClick(item)}
                                titleOverlay={true}
                                actionButtons={
                                    <>
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
                                    </>
                                }
                            />
                        );
                    })}
                </div>
                {filteredWardrobe.length === 0 && (
                    <div className="col-span-full py-8">
                        <EmptyState 
                            icon={<PackageIcon className="w-8 h-8"/>}
                            title="Belum ada item"
                            description="Belum ada item di kategori ini. Mulai dengan mengunggah gambar baru."
                        />
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
