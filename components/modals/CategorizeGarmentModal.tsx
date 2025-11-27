
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { ShirtIcon, PantsIcon, JacketIcon, DressIcon, ShoppingBagIcon } from '../icons';
import { WardrobeCategory } from '../../types';
import { cn } from '../../lib/utils';
import { ModalDialog } from '../ui/modal-dialog';

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

  const footer = (
    <>
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
    </>
  );

  return (
    <ModalDialog
        isOpen={isOpen}
        onClose={onClose}
        title="Kategorikan Karya Baru"
        footer={footer}
        maxWidth="max-w-lg"
    >
        <div className="flex flex-col md:flex-row gap-6">
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
    </ModalDialog>
  );
};
