/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { DownloadIcon } from '../icons';
import { cn } from '../../lib/utils';
import { ImageFormat } from '../../lib/utils';
import Spinner from '../ui/spinner';
import { ModalDialog } from '../ui/modal-dialog';
import { Button } from '../ui/button';

interface DownloadFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (format: ImageFormat) => void;
  title?: string;
  isProcessing?: boolean;
}

const FORMATS: { id: ImageFormat, name: string }[] = [
    { id: 'jpeg', name: 'JPG' },
    { id: 'png', name: 'PNG' },
    { id: 'webp', name: 'WebP' },
];

export const DownloadFormatModal: React.FC<DownloadFormatModalProps> = ({ isOpen, onClose, onConfirm, title = "Pilih Format Unduhan", isProcessing = false }) => {
    const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('jpeg');

    const handleConfirm = () => {
        if(isProcessing) return;
        onConfirm(selectedFormat);
    };

    const footer = (
        <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full sm:w-auto"
            leftIcon={isProcessing ? undefined : <DownloadIcon className="w-5 h-5" />}
        >
             {isProcessing ? <Spinner className="w-4 h-4 mr-2" /> : null}
            {isProcessing ? 'Memproses...' : 'Unduh'}
        </Button>
    );

    return (
        <ModalDialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title} 
            footer={footer}
            maxWidth="max-w-sm"
        >
            <p className="text-stone-600 dark:text-stone-400 mb-4">Pilih format file untuk gambar Anda.</p>
            <div className="grid grid-cols-3 gap-3">
                {FORMATS.map(({ id, name }) => (
                    <button
                        key={id}
                        onClick={() => setSelectedFormat(id)}
                        className={cn(
                            'py-3 text-sm font-semibold rounded-lg transition-all border-2',
                            selectedFormat === id
                                ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-offset-2 ring-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 dark:ring-stone-100'
                                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700'
                        )}
                    >
                        {name}
                    </button>
                ))}
            </div>
        </ModalDialog>
    );
};