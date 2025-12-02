
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import BottomSheet from '../ui/BottomSheet';
import { ChevronRightIcon, ChevronLeftIcon, SlidersIcon, XIcon } from '../icons';
import { PageLayout } from '../ui/page-layout';

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
        <PageLayout className="bg-stone-200 dark:bg-stone-900 flex flex-col md:flex-row relative">
            {/* Main Content Area (Canvas) */}
            <main className="flex-grow h-full w-full relative">
                {canvas}
                
                {/* Mobile Toggle Button */}
                {isMobile && !isPanelOpen && (
                    <button 
                        onClick={() => setIsPanelOpen(true)} 
                        className="fixed bottom-20 right-4 z-30 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 font-semibold py-3 px-5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in"
                    >
                        <SlidersIcon className="w-5 h-5" />
                        <span>Menu Studio</span>
                    </button>
                )}
                
                {/* Desktop Toggle Button */}
                {!isMobile && (
                   <div className={cn(
                       "absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-300",
                       isPanelOpen ? "right-[320px] lg:right-[384px]" : "right-0"
                   )}>
                        <button
                            onClick={() => setIsPanelOpen(!isPanelOpen)}
                            className="bg-stone-100 dark:bg-stone-800 border-l border-t border-b border-stone-300 dark:border-stone-700 p-1.5 rounded-l-lg shadow-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                        >
                            {isPanelOpen ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                        </button>
                   </div>
                )}

                {/* Error Toast */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 dark:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm sm:max-w-md"
                        >
                            <span className="text-sm font-medium">{error}</span>
                            <button onClick={onErrorDismiss} className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded-full">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Side Panel Area */}
            {isMobile ? (
                <BottomSheet isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
                    <div className="h-full overflow-hidden flex flex-col">
                        <div className="flex justify-end p-2">
                             <button onClick={() => setIsPanelOpen(false)} className="p-2">
                                <XIcon className="w-6 h-6 text-stone-500" />
                            </button>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            {sidePanelContent}
                        </div>
                    </div>
                </BottomSheet>
            ) : (
                <AnimatePresence>
                    {isPanelOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '320px', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }}
                            exit={{ width: 0, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
                            className="h-full border-l border-stone-300/50 dark:border-stone-800/50 bg-stone-100 dark:bg-stone-950 shadow-xl overflow-hidden relative flex-shrink-0 lg:w-96"
                        >
                             <div className="w-[320px] lg:w-96 h-full absolute right-0 top-0 bottom-0">
                                {sidePanelContent}
                             </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            )}

            {/* Modals Container */}
            {modals}
        </PageLayout>
    );
};

export default StudioLayout;
