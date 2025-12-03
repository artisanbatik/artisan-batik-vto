
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compare } from '../../ui/compare';
import Spinner from '../../ui/spinner';
import { cn } from '../../../lib/utils';
import { Text } from '../../ui/typography';

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
                <div className="w-32 h-48 bg-stone-200 dark:bg-stone-700 rounded-lg mb-4"></div>
                <Text variant="muted" className="font-semibold">Pratinjau Model</Text>
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
                            className="absolute inset-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6"
                        >
                            <Spinner className="w-10 h-10 mb-4" />
                            <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 font-semibold mb-2">
                                {isRefining ? 'Menyempurnakan...' : 'Sedang Membuat Model'}
                            </h3>
                            <Text variant="muted" className="max-w-xs">
                                {isRefining ? 'Sedang menyesuaikan pose atau latar belakang.' : 'AI sedang mengubah foto Anda menjadi model studio profesional.'}
                            </Text>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800 backdrop-blur-md shadow-lg"
                    >
                        {error}
                    </motion.div>
                )}
            </>
        )}
    </div>
);
