
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { ShirtIcon, PantsIcon, JacketIcon, DressIcon, ShoppingBagIcon } from '../icons';
import { WardrobeCategory } from '../../types';
import { cn } from '../../lib/utils';
import { ModalDialog } from '../ui/modal-dialog';
import { Button } from '../ui/button';

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
        <Button
            onClick={onClose}
            variant="secondary"
        >
            Batal
        </Button>
        <Button
            onClick={handleConfirm}
        >
            Tambah ke Koleksi
        </Button>
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
                        <Button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                            className="flex flex-col items-center justify-center gap-2 h-auto py-4 aspect-square"
                        >
                            <category.icon className="w-8 h-8"/>
                            <span>{category.name}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    </ModalDialog>
  );
};
