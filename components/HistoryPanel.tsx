/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { ClockIcon } from './icons';
import { cn } from '../lib/utils';

interface HistoryPanelProps {
  history: OutfitLayer[];
  currentIndex: number;
  onJumpToState: (index: number) => void;
  isLoading: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, currentIndex, onJumpToState, isLoading }) => {
  return (
    <div className="pt-6 border-t border-stone-400/50 dark:border-stone-700/50">
      <h2 className="text-xl font-serif tracking-wider text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-3">
        <ClockIcon className="w-5 h-5 text-stone-600 dark:text-stone-400"/>
        Riwayat Sesi
      </h2>
      {history.length > 1 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {history.map((layer, index) => {
            const isCurrent = index === currentIndex;
            const thumbnailUrl = Object.values(layer.poseImages)[0];
            const description = index === 0 
                ? 'Model Dasar' 
                : `Menambahkan: ${layer.garment?.name || 'Karya Tanpa Nama'}`;

            return (
              <button 
                key={layer.garment?.id || `base-${index}`} 
                onClick={() => onJumpToState(index)}
                disabled={isLoading}
                className={cn(
                    "w-full flex items-center gap-3 bg-white/50 dark:bg-stone-900/50 p-2 rounded-lg border transition-all duration-200 text-left disabled:opacity-60 disabled:cursor-not-allowed",
                    isCurrent 
                        ? 'border-stone-800 dark:border-stone-200 ring-2 ring-stone-800 dark:ring-stone-200' 
                        : 'border-stone-200/80 dark:border-stone-800/80 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:border-stone-400 dark:hover:border-stone-600'
                )}
              >
                <img 
                    src={thumbnailUrl} 
                    alt={description} 
                    className="flex-shrink-0 w-12 h-12 object-cover rounded-md bg-stone-200 dark:bg-stone-800" 
                />
                <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm truncate">{description}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Langkah {index + 1}</p>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-stone-500 dark:text-stone-400 pt-4">Riwayat penataan gaya Anda akan muncul di sini.</p>
      )}
    </div>
  );
};

export default HistoryPanel;