/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Fix: Imported useState and useEffect from react to resolve 'Cannot find name' errors.
import React, { useState, useEffect } from 'react';
import type { WardrobeItem, WardrobeCategory } from '../types';
import { UploadCloudIcon, CheckCircleIcon, XIcon, PencilIcon, WandSparklesIcon, Trash2Icon, ShirtIcon, JacketIcon, DressIcon, ShoppingBagIcon, PantsIcon } from './icons';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, urlToFile } from '../lib/utils';

// --- New Component for Categorization ---
interface CategorizeGarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: WardrobeCategory) => void;
  garmentPreviewUrl: string | null;
}

const CATEGORIES_FOR_MODAL: { id: WardrobeCategory, name: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'top', name: 'Atasan', icon: ShirtIcon },
    { id: 'bottom', name: 'Bawahan', icon: PantsIcon },
    { id: 'outerwear', name: 'Luaran', icon: JacketIcon },
    { id: 'dress', name: 'Gaun', icon: DressIcon },
    { id: 'accessory', name: 'Aksesori', icon: ShoppingBagIcon },
];

export const CategorizeGarmentModal: React.FC<CategorizeGarmentModalProps> = ({ isOpen, onClose, onConfirm, garmentPreviewUrl }) => {
  const [selectedCategory, setSelectedCategory] = useState<WardrobeCategory>('top');

  const handleConfirm = () => {
    onConfirm(selectedCategory);
  };
  
  useEffect(() => {
    if (isOpen) {
        setSelectedCategory('top');
    }
  }, [isOpen]);

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
            className="relative bg-white dark:bg-stone-900 rounded-2xl w-full max-w-lg flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-stone-800">
                <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Kategorikan Karya Baru</h2>
                <button onClick={onClose} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200" aria-label="Close">
                    <XIcon className="w-6 h-6"/>
                </button>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-full md:w-1/3">
                    {garmentPreviewUrl && (
                        <img src={garmentPreviewUrl} alt="Pratinjau karya yang diunggah" className="w-full aspect-square object-cover rounded-lg border dark:border-stone-700"/>
                    )}
                </div>
                <div className="flex-grow">
                    <p className="text-stone-600 dark:text-stone-400 mb-4">Pilih kategori untuk karya batik baru Anda.</p>
                    <div className="grid grid-cols-3 gap-3">
                        {CATEGORIES_FOR_MODAL.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-2 p-3 text-sm font-semibold rounded-lg transition-all border-2 aspect-square',
                                    selectedCategory === category.id
                                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 ring-2 ring-offset-2 ring-stone-900 dark:ring-stone-100'
                                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'
                                )}
                            >
                                <category.icon className="w-8 h-8"/>
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-3 p-4 bg-stone-50/70 dark:bg-stone-950/70 border-t dark:border-stone-800 rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200/80 dark:bg-stone-700/80 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-semibold text-white dark:text-stone-900 bg-stone-900 dark:bg-stone-100 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-800"
              >
                Tambah ke Koleksi
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- New Component for Editing ---
export interface EditGarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGarment: WardrobeItem) => void;
  onDelete: (garmentToDelete: WardrobeItem) => void;
  garment: WardrobeItem | null;
}

export const EditGarmentModal: React.FC<EditGarmentModalProps> = ({ isOpen, onClose, onSave, onDelete, garment }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WardrobeCategory | null>(null);

  useEffect(() => {
    if (garment && isOpen) {
      setName(garment.name);
      setCategory(garment.category);
    }
  }, [garment, isOpen]);

  const handleSave = () => {
    if (garment && name.trim() && category) {
      onSave({ ...garment, name: name.trim(), category });
    }
  };
  
  const handleDelete = () => {
    if (garment) {
        onDelete(garment);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && garment && (
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
            className="relative bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-stone-800">
                <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Ubah Karya</h2>
                <button onClick={onClose} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200" aria-label="Close">
                    <XIcon className="w-6 h-6"/>
                </button>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-full md:w-1/3">
                    <img src={garment.url} alt={garment.name} className="w-full aspect-square object-cover rounded-lg border dark:border-stone-700"/>
                </div>
                <div className="flex-grow space-y-4">
                    <div>
                        <label htmlFor="garment-name" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">Nama</label>
                        <input
                            id="garment-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200"
                        />
                    </div>
                     <div>
                        <p className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Kategori</p>
                        <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES_FOR_MODAL.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={cn(
                                        'px-4 py-2 text-sm font-semibold rounded-md transition-all border-2',
                                        category === cat.id
                                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500'
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center gap-3 p-4 bg-stone-50/70 dark:bg-stone-950/70 border-t dark:border-stone-800 rounded-b-2xl">
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100/80 rounded-md hover:bg-red-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Hapus Karya
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200/80 dark:bg-stone-700/80 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || !category}
                        className="px-4 py-2 text-sm font-semibold text-white dark:text-stone-900 bg-stone-900 dark:bg-stone-100 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- New Component for Texture Selection ---
interface TextureSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (texture: string) => void;
  garment: WardrobeItem | null;
}

const TEXTURES = ['Katun', 'Sutra', 'Satin'];

export const TextureSelectionModal: React.FC<TextureSelectionModalProps> = ({ isOpen, onClose, onConfirm, garment }) => {
  const [selectedTexture, setSelectedTexture] = useState<string | null>('Katun');

  const handleConfirm = () => {
    if (selectedTexture) {
      onConfirm(selectedTexture);
    }
  };
  
  useEffect(() => {
    if (!isOpen) {
        setSelectedTexture(null);
    } else {
        setSelectedTexture('Katun');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && garment && (
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
            className="relative bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-stone-800">
                <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Pilih Tekstur</h2>
                <button onClick={onClose} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200" aria-label="Close">
                    <XIcon className="w-6 h-6"/>
                </button>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-full md:w-1/3">
                    <img src={garment.url} alt={garment.name} className="w-full aspect-square object-cover rounded-lg border dark:border-stone-700"/>
                    <p className="text-center font-semibold text-sm mt-2 text-stone-700 dark:text-stone-300">{garment.name}</p>
                </div>
                <div className="flex-grow">
                    <p className="text-stone-600 dark:text-stone-400 mb-4">Pilih tekstur untuk diterapkan pada karya batik.</p>
                    <div className="grid grid-cols-2 gap-3">
                        {TEXTURES.map(texture => (
                            <button
                                key={texture}
                                onClick={() => setSelectedTexture(texture)}
                                className={cn(
                                    'px-4 py-2 text-sm font-semibold rounded-md transition-all border-2',
                                    selectedTexture === texture
                                        ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 border-stone-800 dark:border-stone-200'
                                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500'
                                )}
                            >
                                {texture}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-3 p-4 bg-stone-50/70 dark:bg-stone-950/70 border-t dark:border-stone-800 rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200/80 dark:bg-stone-700/80 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedTexture}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-stone-800 rounded-md hover:bg-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed"
              >
                <WandSparklesIcon className="w-4 h-4" />
                Terapkan Tekstur
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- Original Wardrobe Modal ---
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
            console.error(`[CORS Check] Failed to load and convert wardrobe item from URL: ${item.url}. The browser's console should have a specific CORS error message if that's the issue.`, err);
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
                onClick={onClose}
                className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
                aria-modal="true"
                role="dialog"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-white dark:bg-stone-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl"
                >
                    <div className="flex items-center justify-between p-4 border-b dark:border-stone-800 flex-shrink-0">
                        <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Tambah Karya Batik</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200" aria-label="Tutup koleksi">
                            <XIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    <div className="p-6 flex-grow overflow-y-auto">
                        <div className="mb-4 -mx-2 overflow-x-auto sticky top-0 bg-white dark:bg-stone-900 py-2 z-10">
                            <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 px-2">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={cn(
                                            'px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-md',
                                            activeCategory === category.id
                                                ? 'text-stone-900 dark:text-stone-50 border-b-2 border-stone-900 dark:border-stone-50'
                                                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                                        )}
                                        disabled={isLoading}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {filteredWardrobe.map((item) => {
                              const isActive = activeGarmentIds.includes(item.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleGarmentClick(item)}
                                  disabled={isLoading || isActive}
                                  className="relative aspect-square border dark:border-stone-700 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-800 dark:focus:ring-stone-200 group disabled:opacity-60 disabled:cursor-not-allowed"
                                  aria-label={`Pilih ${item.name}`}
                                >
                                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <p className="text-white text-xs font-bold text-center p-1">{item.name}</p>
                                  </div>
                                  {isActive && (
                                      <div className="absolute inset-0 bg-stone-900/70 flex items-center justify-center">
                                          <CheckCircleIcon className="w-8 h-8 text-white" />
                                      </div>
                                  )}
                                  {item.id.startsWith('custom-') && !isActive && (
                                    <div className="absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditGarment(item);
                                            }}
                                            className="p-1.5 bg-white/80 dark:bg-stone-900/80 rounded-full text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white transition-all"
                                            aria-label={`Ubah ${item.name}`}
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteGarment(item);
                                            }}
                                            className="p-1.5 bg-white/80 dark:bg-stone-900/80 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 transition-all"
                                            aria-label={`Hapus ${item.name}`}
                                        >
                                            <Trash2Icon className="w-4 h-4" />
                                        </button>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                            <label 
                              htmlFor="custom-garment-upload-modal" 
                              className={cn(
                                'relative aspect-square border-2 rounded-lg flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 transition-colors',
                                isLoading && 'cursor-not-allowed bg-stone-100 dark:bg-stone-800 border-dashed',
                                !isLoading && isDraggingOver && 'cursor-pointer border-solid border-stone-600 dark:border-stone-400 bg-stone-100 dark:bg-stone-800',
                                !isLoading && !isDraggingOver && 'cursor-pointer border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                              )}
                              onDragEnter={handleDragEnter}
                              onDragLeave={handleDragLeave}
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                            >
                              {isDraggingOver && !isLoading ? (
                                  <span className="text-xs text-center font-semibold text-stone-700 dark:text-stone-200 p-2">Letakkan gambar di sini</span>
                              ) : (
                                  <>
                                      <UploadCloudIcon className="w-6 h-6 mb-1"/>
                                      <span className="text-xs text-center">Unggah</span>
                                  </>
                              )}
                              <input id="custom-garment-upload-modal" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={isLoading}/>
                            </label>
                        </div>
                        {filteredWardrobe.length === 0 && (
                             <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-4">Tidak ada karya dalam kategori ini.</p>
                        )}
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export default WardrobeModal;