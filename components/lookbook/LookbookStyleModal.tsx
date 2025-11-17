/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, WandSparklesIcon } from '../icons';
import { SHOT_TYPES } from '../../services/geminiService';
import { cn } from '../../lib/utils';
import Spinner from '../Spinner';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-2xl font-serif tracking-wider text-stone-800">
                    {view === 'presets' ? 'Pilih Gaya Lookbook' : 'Buat Foto Kustom'}
                </h2>
                <button onClick={onClose} className="p-1 rounded-full text-stone-500 hover:bg-stone-100" aria-label="Tutup">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 flex-grow overflow-y-auto">
                <div className="mb-4">
                    <label htmlFor="aspect-ratio-select" className="block text-sm font-semibold text-stone-700 mb-2">Aspek Rasio</label>
                    <select
                        id="aspect-ratio-select"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full font-mono font-semibold text-stone-800 p-2.5 border-2 border-stone-300 rounded-lg hover:border-stone-400 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                        {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                    </select>
                </div>
                <hr className="my-4 border-stone-200" />
                <AnimatePresence mode="wait">
                    {view === 'presets' ? (
                        <motion.div
                            key="presets"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <p className="text-stone-600 mb-4">Pilih konteks atau suasana untuk menghasilkan serangkaian gambar OOTD (Outfit of The Day) secara otomatis.</p>
                            <div className="space-y-3">
                                {Object.entries(SHOT_TYPES).map(([style, { description }]) => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style)}
                                        className={cn(
                                            'w-full text-left p-3 rounded-lg border-2 transition-all',
                                            selectedStyle === style
                                                ? 'bg-amber-700/10 border-amber-700 ring-2 ring-amber-700/50'
                                                : 'bg-white border-stone-300 hover:border-amber-600'
                                        )}
                                    >
                                        <p className="font-semibold text-stone-800">{style}</p>
                                        <p className="text-sm text-stone-600">{description}</p>
                                    </button>
                                ))}
                            </div>
                             <div className="mt-4 text-center">
                                <button onClick={() => setView('custom')} className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors">
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
                             <p className="text-stone-600 mb-2">Jelaskan foto OOTD spesifik yang ingin Anda buat. Model dan pakaian Anda akan ditempatkan dalam adegan ini.</p>
                             <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder='Contoh: "Seorang wanita tersenyum sambil memegang secangkir kopi di sebuah kafe bergaya di Bali, dengan cahaya pagi yang lembut."'
                                className="w-full h-28 p-2 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                             />
                             <p className="text-xs text-stone-500 mt-1">Gaya yang dipilih di bawah ini (<span className="font-semibold">{selectedStyle}</span>) akan digunakan sebagai konteks umum.</p>
                             <div className="mt-4 text-center">
                                <button onClick={() => setView('presets')} className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors">
                                    &larr; Kembali ke prasetel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="flex justify-end p-4 bg-stone-50/70 border-t">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || (view === 'custom' && !customPrompt.trim())}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2 font-semibold text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
                >
                    {isLoading ? <Spinner className="w-5 h-5" /> : <WandSparklesIcon className="w-5 h-5" />}
                    {isLoading ? 'Membuat...' : 'Buat Lookbook'}
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LookbookStyleModal;