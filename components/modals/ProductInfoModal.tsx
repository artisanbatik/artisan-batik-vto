
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, FileTextIcon, WandSparklesIcon } from '../icons';
import Spinner from '../Spinner';

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  productInfoMarkdown: string | null;
  error: string | null;
  onRegenerate: () => void;
}

interface ParsedProductInfo {
    title: string | null;
    shortDescription: string | null;
    longDescription: string | null;
    details: { attribute: string; value: string }[];
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ isOpen, onClose, isLoading, productInfoMarkdown, error, onRegenerate }) => {
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const parsedInfo = useMemo<ParsedProductInfo | null>(() => {
        if (!productInfoMarkdown) return null;
        try {
            const sections = productInfoMarkdown.split('### ').filter(s => s.trim());
            const parsed: ParsedProductInfo = { title: null, shortDescription: null, longDescription: null, details: [] };
            sections.forEach(section => {
                const lines = section.split('\n').filter(l => l.trim());
                const title = lines[0]?.trim();
                const content = lines.slice(1).join('\n').replace(/```/g, '').trim();
                if (title === 'Nama Produk') parsed.title = content;
                else if (title === 'Deskripsi Singkat') parsed.shortDescription = content;
                else if (title === 'Deskripsi Lengkap') parsed.longDescription = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                else if (title === 'Detail Produk') {
                    const tableLines = content.split('\n').slice(2);
                    parsed.details = tableLines.map(line => {
                        const [attribute, value] = line.split('|').slice(1).map(s => s.trim().replace(/\*\*/g, ''));
                        return { attribute, value };
                    }).filter(item => item.attribute && item.value);
                }
            });
            return parsed;
        } catch (e) { return null; }
    }, [productInfoMarkdown]);
    
    const handleCopy = (text: string | null, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    };

    const copyAll = () => {
        if (!productInfoMarkdown) return;
        navigator.clipboard.writeText(productInfoMarkdown);
        setCopiedStates({ all: true });
        setTimeout(() => setCopiedStates({ all: false }), 2000);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative bg-stone-50 dark:bg-stone-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
                            <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Informasi Produk</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800" aria-label="Tutup"><XIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 flex-grow overflow-y-auto space-y-6">
                            {isLoading && (<div className="flex flex-col items-center justify-center h-full min-h-64"><Spinner /><p className="text-lg font-serif text-stone-700 dark:text-stone-300 mt-4">Membuat info produk...</p></div>)}
                            {error && !isLoading && (<div className="text-center min-h-64 flex flex-col items-center justify-center"><p className="text-lg font-semibold text-red-600">Gagal Membuat</p><p className="text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-md mx-auto">{error}</p></div>)}
                            {!isLoading && !error && !productInfoMarkdown && (<div className="flex flex-col items-center justify-center h-full min-h-64 text-center"><FileTextIcon className="w-16 h-16 text-stone-400 dark:text-stone-600 mb-4" /><h3 className="text-xl font-serif text-stone-800 dark:text-stone-200">Siap Membuat Informasi Produk?</h3><p className="text-stone-600 dark:text-stone-400 mt-2 max-w-sm">Buat nama produk, deskripsi, dan detail.</p><button onClick={onRegenerate} className="mt-6 flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300"><WandSparklesIcon className="w-5 h-5" /> Buat Sekarang</button></div>)}
                            {parsedInfo && !isLoading && !error && (
                                <>
                                    {parsedInfo.title && <div className="p-4 bg-white dark:bg-stone-800 rounded-lg border dark:border-stone-700"><div className="flex justify-between items-start"><div><h3 className="font-semibold text-stone-600 dark:text-stone-400 text-sm">Nama Produk</h3><p className="text-xl font-serif text-stone-900 dark:text-stone-100 mt-1">{parsedInfo.title}</p></div><button onClick={() => handleCopy(parsedInfo.title, 'title')} className="text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">{copiedStates['title'] ? 'Disalin!' : 'Salin'}</button></div></div>}
                                    {parsedInfo.shortDescription && <div className="p-4 bg-white dark:bg-stone-800 rounded-lg border dark:border-stone-700"><div className="flex justify-between items-start"><div><h3 className="font-semibold text-stone-600 dark:text-stone-400 text-sm">Deskripsi Singkat</h3><p className="text-stone-700 dark:text-stone-300 mt-1">{parsedInfo.shortDescription}</p></div><button onClick={() => handleCopy(parsedInfo.shortDescription, 'short')} className="text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex-shrink-0 ml-4">{copiedStates['short'] ? 'Disalin!' : 'Salin'}</button></div></div>}
                                    {parsedInfo.longDescription && <div className="p-4 bg-white dark:bg-stone-800 rounded-lg border dark:border-stone-700"><div className="flex justify-between items-start"><div><h3 className="font-semibold text-stone-600 dark:text-stone-400 text-sm">Deskripsi Lengkap</h3><div className="prose prose-sm max-w-none text-stone-700 dark:text-stone-300 mt-2" dangerouslySetInnerHTML={{ __html: parsedInfo.longDescription.replace(/\n/g, '<br />') }} /></div><button onClick={() => handleCopy(parsedInfo.longDescription, 'long')} className="text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex-shrink-0 ml-4">{copiedStates['long'] ? 'Disalin!' : 'Salin'}</button></div></div>}
                                    {parsedInfo.details.length > 0 && <div className="p-4 bg-white dark:bg-stone-800 rounded-lg border dark:border-stone-700"><h3 className="font-semibold text-stone-600 dark:text-stone-400 text-sm mb-3">Detail Produk</h3><table className="w-full text-sm"><tbody>{parsedInfo.details.map((detail, index) => <tr key={index} className="border-b last:border-b-0 dark:border-stone-700"><td className="py-2 pr-4 font-semibold text-stone-800 dark:text-stone-200 w-1/3">{detail.attribute}</td><td className="py-2 text-stone-700 dark:text-stone-300">{detail.value}</td></tr>)}</tbody></table></div>}
                                </>
                            )}
                        </div>
                        <div className="flex justify-between items-center p-4 border-t border-stone-200 dark:border-stone-800">
                            <div>{(productInfoMarkdown || error) && <button onClick={onRegenerate} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-700 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 disabled:opacity-50"><WandSparklesIcon className="w-4 h-4" /> Buat Ulang</button>}</div>
                            <div className="flex items-center gap-3"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-700 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600">Tutup</button>{!isLoading && !error && productInfoMarkdown && <button onClick={copyAll} className="px-5 py-2 font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300">{copiedStates['all'] ? 'Disalin Semua!' : 'Salin Semua Teks'}</button>}</div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProductInfoModal;
