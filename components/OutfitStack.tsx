
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { Trash2Icon, SaveIcon, PlusIcon, FileTextIcon, BookOpenIcon } from './icons';
import Spinner from './Spinner';
import { Button } from './ui/button';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onUndo: () => void;
  onSaveOutfit: () => void;
  isLoading: boolean;
  onAddGarment: () => void;
  generatingLayerIndex?: number | null;
  onGenerateProductInfo: () => void;
  onGenerateLookbook: () => void;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ outfitHistory, onUndo, onSaveOutfit, isLoading, onAddGarment, generatingLayerIndex, onGenerateProductInfo, onGenerateLookbook }) => {
  const isOutfitSavable = outfitHistory.length > 1;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-stone-400/50 dark:border-stone-700/50 pb-2 mb-3">
        <h2 className="text-xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Koleksi Anda</h2>
        <Button
          onClick={onSaveOutfit}
          disabled={!isOutfitSavable || isLoading}
          variant="ghost"
          size="sm"
          className="hover:bg-stone-200/70 dark:hover:bg-stone-800/70 h-8 text-stone-700 dark:text-stone-300"
          leftIcon={<SaveIcon className="w-4 h-4" />}
        >
          Simpan
        </Button>
      </div>
      <div className="space-y-2">
        {outfitHistory.map((layer, index) => (
          <div
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between bg-white/50 dark:bg-stone-900/50 p-2 rounded-lg animate-fade-in border border-stone-200/80 dark:border-stone-800/80"
          >
            <div className="flex items-center overflow-hidden flex-grow gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 text-xs font-bold text-stone-600 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 rounded-full">
                  {index + 1}
                </span>
                {layer.garment && (
                    <img src={layer.garment.url} alt={layer.garment.name} className="flex-shrink-0 w-12 h-12 object-cover rounded-md" />
                )}
                <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-stone-800 dark:text-stone-200 truncate" title={layer.garment?.name}>
                      {layer.garment ? layer.garment.name : 'Model Dasar'}
                    </p>
                    {layer.texture && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">Tekstur {layer.texture}</p>
                    )}
                </div>

                {index > 0 && generatingLayerIndex === index && (
                  <div className="ml-3 flex-shrink-0">
                    <Spinner className="w-5 h-5 text-stone-500" />
                  </div>
                )}
            </div>
            {index > 0 && index === outfitHistory.length - 1 && !generatingLayerIndex && (
              <Button
                onClick={onUndo}
                variant="ghost"
                size="icon"
                className="flex-shrink-0 text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 w-8"
                aria-label={`Hapus ${layer.garment?.name}`}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {outfitHistory.length === 1 && (
            <p className="text-center text-sm text-stone-500 dark:text-stone-400 pt-4">Karya yang Anda pilih akan muncul di sini. Klik 'Tambah Karya' untuk memulai.</p>
        )}
      </div>
       <div className="mt-4 grid grid-cols-1 gap-3">
        <Button 
            onClick={onAddGarment}
            disabled={isLoading}
            variant="default"
            className="w-full text-base py-6"
            leftIcon={<PlusIcon className="w-5 h-5" />}
        >
            Tambah Karya
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onGenerateLookbook}
            disabled={!isOutfitSavable || isLoading}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-800 dark:hover:bg-amber-700"
            leftIcon={<BookOpenIcon className="w-4 h-4" />}
            >
              Lookbook
          </Button>
          <Button
            onClick={() => onGenerateProductInfo()}
            disabled={!isOutfitSavable || isLoading}
            className="w-full bg-sky-700 hover:bg-sky-800 text-white dark:bg-sky-800 dark:hover:bg-sky-700"
            leftIcon={<FileTextIcon className="w-4 h-4" />}
            >
              Info Produk
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutfitStack;
