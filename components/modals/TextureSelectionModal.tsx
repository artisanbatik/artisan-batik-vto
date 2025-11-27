
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { WandSparklesIcon } from '../icons';
import { WardrobeItem } from '../../types';
import { cn } from '../../lib/utils';
import { ModalDialog } from '../ui/modal-dialog';

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

  if (!garment) return null;

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
            disabled={!selectedTexture}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white dark:text-stone-900 bg-stone-900 dark:bg-stone-100 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed"
        >
            <WandSparklesIcon className="w-4 h-4" />
            Terapkan Tekstur
        </button>
    </>
  );

  return (
    <ModalDialog
        isOpen={isOpen}
        onClose={onClose}
        title="Pilih Tekstur"
        footer={footer}
        maxWidth="max-w-md"
    >
        <div className="flex flex-col md:flex-row gap-6">
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
    </ModalDialog>
  );
};
