
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface RegeneratePromptProps {
    onCancel: () => void;
    onConfirm: (prompt: string) => void;
}

export const RegeneratePrompt: React.FC<RegeneratePromptProps> = ({ onCancel, onConfirm }) => {
    const [prompt, setPrompt] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-stone-800 rounded-lg p-4 shadow-xl w-full max-w-sm"
            >
                <h3 className="font-semibold text-stone-800 dark:text-stone-200">Sempurnakan Gambar</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 mb-3">Apa yang ingin Anda ubah atau perbaiki?</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='Contoh: "buat pencahayaan lebih dramatis"'
                    className="w-full h-20 p-2 text-sm bg-white dark:bg-stone-700 dark:text-stone-100 border border-stone-300 dark:border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <div className="flex justify-end gap-2 mt-3">
                    <button onClick={onCancel} className="px-3 py-1.5 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-600 rounded-md hover:bg-stone-300 dark:hover:bg-stone-500">Batal</button>
                    <button 
                        onClick={() => onConfirm(prompt)} 
                        disabled={!prompt.trim()}
                        className="px-3 py-1.5 text-sm font-semibold text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-50"
                    >
                        Buat Ulang
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
