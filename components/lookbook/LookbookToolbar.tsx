
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { DownloadIcon, WandSparklesIcon } from '../icons';
import Spinner from '../ui/spinner';

interface LookbookToolbarProps {
    onDownload: () => void;
    onRegenerate: () => void;
    isDownloading: boolean;
    isRegenerating: boolean;
}

export const LookbookToolbar: React.FC<LookbookToolbarProps> = ({ onDownload, onRegenerate, isDownloading, isRegenerating }) => (
    <div className="flex-shrink-0 p-4 grid grid-cols-2 sm:flex sm:justify-end gap-3 border-t bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
        <button 
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700 disabled:opacity-50"
        >
            {isDownloading ? <Spinner className="w-4 h-4"/> : <DownloadIcon className="w-4 h-4"/>} 
            {isDownloading ? 'Mengunduh...' : 'Unduh'}
        </button>
        <button 
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-semibold text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
        >
            <WandSparklesIcon className="w-4 h-4" /> {isRegenerating ? 'Membuat...' : 'Buat Ulang'}
        </button>
    </div>
);
