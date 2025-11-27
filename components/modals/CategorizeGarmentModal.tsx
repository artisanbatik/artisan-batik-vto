/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ShirtIcon, PantsIcon, JacketIcon, DressIcon, ShoppingBagIcon } from '../icons';
import { WardrobeCategory } from '../../types';
import { cn } from '../../lib/utils';

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
