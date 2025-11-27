/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, WandSparklesIcon } from '../icons';
import { WardrobeItem } from '../../types';
import { cn } from '../../lib/utils';

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
