
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { WandSparklesIcon } from '../icons';
import { WardrobeItem } from '../../types';
import { cn } from '../../lib/utils';
import { ModalDialog } from '../ui/modal-dialog';
import { Button } from '../ui/button';

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
        <Button
            onClick={onClose}
            variant="secondary"
        >
            Batal
        </Button>
        <Button
            onClick={handleConfirm}
            disabled={!selectedTexture}
            leftIcon={<WandSparklesIcon className="w-4 h-4" />}
        >
            Terapkan Tekstur
        </Button>
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
                        <Button
                            key={texture}
                            onClick={() => setSelectedTexture(texture)}
                            variant={selectedTexture === texture ? 'default' : 'outline'}
                            className="w-full justify-center"
                        >
                            {texture}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    </ModalDialog>
  );
};
