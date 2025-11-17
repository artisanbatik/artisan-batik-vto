/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, DownloadIcon } from './icons';
import { cn } from '../lib/utils';
import { ImageFormat } from '../lib/utils';
import Spinner from './Spinner';

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

const DownloadFormatModal: React.FC<DownloadFormatModalProps> = ({ isOpen, onClose, onConfirm, title = "Pilih Format Unduhan", isProcessing = false }) => {
    const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('jpeg');

    const handleConfirm = () => {
        if(isProcessing) return;
        onConfirm(selectedFormat);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl"
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-serif tracking-wider text-stone-800">{title}</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-stone-500 hover:bg-stone-100" aria-label="Tutup">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-stone-600 mb-4">Pilih format file untuk gambar Anda.</p>
                            <div className="grid grid-cols-3 gap-3">
                                {FORMATS.map(({ id, name }) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedFormat(id)}
                                        className={cn(
                                            'py-3 text-sm font-semibold rounded-lg transition-all border-2',
                                            selectedFormat === id
                                                ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-offset-2 ring-stone-900'
                                                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500 hover:bg-stone-50'
                                        )}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end p-4 bg-stone-50/70 border-t">
                            <button
                                onClick={handleConfirm}
                                disabled={isProcessing}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2 font-semibold text-white bg-stone-900 rounded-md hover:bg-stone-700 disabled:opacity-50"
                            >
                                {isProcessing ? <Spinner className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                                {isProcessing ? 'Memproses...' : 'Unduh'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DownloadFormatModal;
