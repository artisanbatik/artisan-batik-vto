import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compare } from '../../ui/compare';
import Spinner from '../../ui/spinner';
import { cn } from '../../../lib/utils';

interface PreviewSectionProps {
    userImageUrl: string | null;
    generatedModelUrl: string | null;
    isProcessing: boolean;
    isRefining: boolean;
    error: string | null;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
    userImageUrl, generatedModelUrl, isProcessing, isRefining, error
}) => (
    <div className={cn(
        "relative w-full max-w-md aspect-[3/4] bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-700",
        !userImageUrl && "border-dashed"
    )}>
        {!userImageUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                <div className="w-32 h-48 bg-stone-200 dark:bg-stone-700 rounded-lg mb-4 animate-pulse"></div>
                <p>Pratinjau Model</p>
            </div>
        ) : (
            <>
                {generatedModelUrl ? (
                    <Compare
                        firstImage={userImageUrl}
                        secondImage={generatedModelUrl}
                        firstImageClassName="object-contain bg-stone-100"
                        secondImageClassname="object-contain bg-stone-100"
                        className="h-full w-full"
                        slideMode="hover"
                    />
                ) : (
                    <img src={userImageUrl} alt="Upload User" className="w-full h-full object-contain" />
                )}

                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6"
                        >
                            <Spinner className="w-10 h-10 mb-4" />
                            <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 font-semibold">
                                {isRefining ? 'Menyempurnakan...' : 'Sedang Membuat Model'}
                            </h3>
                            <p className="text-stone-600 dark:text-stone-400 mt-2">
                                {isRefining ? 'Sedang menyesuaikan pose atau latar belakang.' : 'AI sedang mengubah foto Anda menjadi model studio profesional.'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}
            </>
        )}
    </div>
);