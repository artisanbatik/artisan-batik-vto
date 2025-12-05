
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
    // Increased width for better UX
    const sidebarWidth = '420px';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ 
                        width: sidebarWidth, 
                        opacity: 1, 
                        transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } 
                    }}
                    exit={{ 
                        width: 0, 
                        opacity: 0, 
                        transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } 
                    }}
                    className="h-full border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 shadow-2xl overflow-hidden relative flex-shrink-0 z-20"
                >
                     <div style={{ width: sidebarWidth }} className="h-full absolute right-0 top-0 bottom-0 flex flex-col">
                        {children}
                     </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};
