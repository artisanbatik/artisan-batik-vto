/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { WardrobeItem } from '../../types';
import { ModalDialog } from '../ui/modal-dialog';
import { Input } from '../ui/input';

export interface EditGarmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGarment: WardrobeItem) => void;
  onDelete: (garmentToDelete: WardrobeItem) => void;
  garment: WardrobeItem | null;
}

export const EditGarmentModal: React.FC<EditGarmentModalProps> = ({ isOpen, onClose, onSave, onDelete, garment }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (garment && isOpen) {
      setName(garment.name);
    }
  }, [garment, isOpen]);

  const handleSave = () => {
    if (garment && name.trim()) {
      onSave({ ...garment, name: name.trim() });
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
            disabled={!name.trim()}
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
        title="Ubah Nama Karya"
        footer={footer}
        maxWidth="max-w-md"
    >
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-1/3">
                <img src={garment.url} alt={garment.name} className="w-full aspect-square object-cover rounded-lg border dark:border-stone-700"/>
            </div>
            <div className="flex-grow space-y-4">
                <Input 
                    label="Nama"
                    id="garment-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
        </div>
    </ModalDialog>
  );
};
