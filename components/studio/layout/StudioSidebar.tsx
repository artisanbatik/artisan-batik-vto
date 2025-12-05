/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioSidebarProps {
    isOpen: boolean;
    children: React.ReactNode;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({ isOpen, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '320px', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }}
                    exit={{ width: 0, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
                    className="h-full border-l border-stone-300/50 dark:border-stone-800/50 bg-stone-100 dark:bg-stone-950 shadow-xl overflow-hidden relative flex-shrink-0 lg:w-96"
                >
                     <div className="w-[320px] lg:w-96 h-full absolute right-0 top-0 bottom-0">
                        {children}
                     </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};