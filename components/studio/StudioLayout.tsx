
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import BottomSheet from '../ui/BottomSheet';
import { ChevronRightIcon, ChevronLeftIcon, SlidersIcon, XIcon } from '../icons';

interface StudioLayoutProps {
    canvas: React.ReactNode;
    sidePanelContent: React.ReactNode;
    modals: React.ReactNode;
    
    isMobile: boolean;
    isPanelOpen: boolean;
    setIsPanelOpen: (isOpen: boolean) => void;
    
    error?: string | null;
    onErrorDismiss?: () => void;
}

const StudioLayout: React.FC<StudioLayoutProps> = ({
    canvas,
    sidePanelContent,
    modals,
    isMobile,
    isPanelOpen,
    setIsPanelOpen,
    error,
    onErrorDismiss
}) => {
    return (
        <div className="w-screen h-screen bg-stone-200 dark:bg-stone-900 flex flex-col md:flex-row font-sans relative overflow-hidden">
            {/* Main Content Area (Canvas) */}
            <main className="flex-grow h-full w-full relative">
                {canvas}
                
                {/* Mobile Toggle Button */}
                {isMobile && !isPanelOpen && (
                    <button 
                        onClick={() => setIsPanelOpen(true)} 
                        className="fixed bottom-20 right-4 z-30 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 font-semibold py-3 px-5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in"
                    >
                        <SlidersIcon className="w-5 h-5" /> Studio
                    </button>
                )}

                {/* Error Toast */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 flex items-center gap-3"
                        >
                            <span>{error}</span>
                            {onErrorDismiss && (
                                <button onClick={onErrorDismiss} className="font-bold hover:text-red-100">X</button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Desktop Side Panel */}
            {!isMobile && (
                <aside 
                    className={cn(
                        "bg-stone-100 dark:bg-stone-950 font-sans flex flex-col z-40 transition-all duration-300 ease-in-out relative border-l border-stone-300/80 dark:border-stone-800/80", 
                        isPanelOpen ? 'w-1/4 min-w-[320px] max-w-[420px]' : 'w-16'
                    )}
                >
                    <div className="p-4 flex-shrink-0 flex items-center justify-between border-b border-stone-300/50 dark:border-stone-800/50">
                        <AnimatePresence>
                            {isPanelOpen && (
                                <motion.h2 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -10 }} 
                                    className="text-2xl font-serif tracking-widest text-stone-800 dark:text-stone-200"
                                >
                                    Koleksi Anda
                                </motion.h2>
                            )}
                        </AnimatePresence>
                        <button 
                            onClick={() => setIsPanelOpen(!isPanelOpen)} 
                            className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                        >
                            {isPanelOpen ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    
                    <div className={cn("flex-grow overflow-hidden relative h-full", !isPanelOpen && "invisible")}>
                        {sidePanelContent}
                    </div>
                </aside>
            )}

            {/* Mobile Bottom Sheet */}
            {isMobile && (
                <BottomSheet isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
                    <div className="pt-8 p-4 flex-shrink-0 flex items-center justify-between border-b border-stone-300/50 dark:border-stone-800/50 bg-stone-100 dark:bg-stone-950">
                        <h2 className="text-2xl font-serif tracking-widest text-stone-800 dark:text-stone-200">Studio Anda</h2>
                        <button 
                            onClick={() => setIsPanelOpen(false)} 
                            className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto bg-stone-100 dark:bg-stone-950">
                        {sidePanelContent}
                    </div>
                </BottomSheet>
            )}
            
            {modals}
        </div>
    );
};

export default StudioLayout;
