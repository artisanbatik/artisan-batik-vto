
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { ShirtIcon, PantsIcon, JacketIcon, DressIcon, ShoppingBagIcon } from '../icons';
import { WardrobeItem, WardrobeCategory } from '../../types';
import { cn } from '../../lib/utils';
import { ModalDialog } from '../ui/modal-dialog';

export interface EditGarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGarment: WardrobeItem) => void;
  onDelete: (garmentToDelete: WardrobeItem) => void;
  garment: WardrobeItem | null;
}

const CATEGORIES_FOR_MODAL: { id: WardrobeCategory, name: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'top', name: 'Atasan', icon: ShirtIcon },
    { id: 'bottom', name: 'Bawahan', icon: PantsIcon },
    { id: 'outerwear', name: 'Luaran', icon: JacketIcon },
    { id: 'dress', name: 'Gaun', icon: DressIcon },
    { id: 'accessory', name: 'Aksesori', icon: ShoppingBagIcon },
];

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

  if (!garment) return null;

  const footer = (
    <>
         <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100/80 rounded-md hover:bg-red-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-auto"
        >
            Hapus Karya
        </button>
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
    </>
  );

  return (
    <ModalDialog
        isOpen={isOpen}
        onClose={onClose}
        title="Ubah Karya"
        footer={footer}
        maxWidth="max-w-md"
    >
        <div className="flex flex-col md:flex-row gap-6">
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
    </ModalDialog>
  );
};
