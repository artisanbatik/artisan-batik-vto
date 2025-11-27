
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WandSparklesIcon } from '../icons';
import { SHOT_TYPES } from '../../services/geminiService';
import { cn } from '../../lib/utils';
import Spinner from '../Spinner';
import { ModalDialog } from '../ui/modal-dialog';

interface LookbookStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (style: string, aspectRatio: string, customPrompt?: string) => void;
  isLoading: boolean;
}

const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];

const LookbookStyleModal: React.FC<LookbookStyleModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
    const [selectedStyle, setSelectedStyle] = useState<string>(Object.keys(SHOT_TYPES)[0]);
    const [aspectRatio, setAspectRatio] = useState('3:4');
    const [customPrompt, setCustomPrompt] = useState('');
    const [view, setView] = useState<'presets' | 'custom'>('presets');

    const handleGenerate = () => {
        if (selectedStyle) {
            if (view === 'custom') {
                onGenerate(selectedStyle, aspectRatio, customPrompt);
            } else {
                onGenerate(selectedStyle, aspectRatio);
            }
        }
    };

    const footer = (
        <button
            onClick={handleGenerate}
            disabled={isLoading || (view === 'custom' && !customPrompt.trim())}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2 font-semibold text-white dark:text-stone-900 bg-amber-700 dark:bg-amber-200 rounded-md hover:bg-amber-800 dark:hover:bg-amber-300 disabled:opacity-50"
        >
            {isLoading ? <Spinner className="w-5 h-5" /> : <WandSparklesIcon className="w-5 h-5" />}
            {isLoading ? 'Membuat...' : 'Buat Lookbook'}
        </button>
    );

    return (
        <ModalDialog
            isOpen={isOpen}
            onClose={onClose}
            title={view === 'presets' ? 'Pilih Gaya Lookbook' : 'Buat Foto Kustom'}
            footer={footer}
            maxWidth="max-w-md"
        >
            <div className="mb-4">
                <label htmlFor="aspect-ratio-select" className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Aspek Rasio</label>
                <select
                    id="aspect-ratio-select"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full font-mono font-semibold text-stone-800 dark:text-stone-200 p-2.5 border-2 border-stone-300 dark:border-stone-700 rounded-lg hover:border-stone-400 dark:hover:border-stone-500 transition-colors bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                >
                    {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                </select>
            </div>
            <hr className="my-4 border-stone-200 dark:border-stone-800" />
            <AnimatePresence mode="wait">
                {view === 'presets' ? (
                    <motion.div
                        key="presets"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <p className="text-stone-600 dark:text-stone-400 mb-4">Pilih konteks atau suasana untuk menghasilkan serangkaian gambar OOTD (Outfit of The Day) secara otomatis.</p>
                        <div className="space-y-3">
                            {Object.entries(SHOT_TYPES).map(([style, { description }]) => (
                                <button
                                    key={style}
                                    onClick={() => setSelectedStyle(style)}
                                    className={cn(
                                        'w-full text-left p-3 rounded-lg border-2 transition-all',
                                        selectedStyle === style
                                            ? 'bg-amber-700/10 dark:bg-amber-700/20 border-amber-700 dark:border-amber-500 ring-2 ring-amber-700/50 dark:ring-amber-500/50'
                                            : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 hover:border-amber-600 dark:hover:border-amber-500'
                                    )}
                                >
                                    <p className="font-semibold text-stone-800 dark:text-stone-200">{style}</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400">{description}</p>
                                </button>
                            ))}
                        </div>
                            <div className="mt-4 text-center">
                            <button onClick={() => setView('custom')} className="text-sm font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                                Atau, buat dengan prompt kustom &rarr;
                            </button>
                        </div>
                    </motion.div>
                ) : (
                        <motion.div
                        key="custom"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                            <p className="text-stone-600 dark:text-stone-400 mb-2">Jelaskan foto OOTD spesifik yang ingin Anda buat. Model dan pakaian Anda akan ditempatkan dalam adegan ini.</p>
                            <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder='Contoh: "Seorang wanita tersenyum sambil memegang secangkir kopi di sebuah kafe bergaya di Bali, dengan cahaya pagi yang lembut."'
                            className="w-full h-28 p-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                            />
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Gaya yang dipilih di bawah ini (<span className="font-semibold">{selectedStyle}</span>) akan digunakan sebagai konteks umum.</p>
                            <div className="mt-4 text-center">
                            <button onClick={() => setView('presets')} className="text-sm font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                                &larr; Kembali ke prasetel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ModalDialog>
  );
};

export default LookbookStyleModal;
