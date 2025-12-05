
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export interface SidePanelTab {
    id: string;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    content: React.ReactNode;
}

interface SidePanelProps {
    tabs: SidePanelTab[];
    defaultTabId?: string;
}

const SidePanel: React.FC<SidePanelProps> = ({ tabs, defaultTabId }) => {
    const [activeTab, setActiveTab] = useState<string>(defaultTabId || tabs[0]?.id);
    const ActiveContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-950">
            {/* Header / Tabs Area */}
            <div className="flex-shrink-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-3 py-3 shadow-sm z-10">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)} 
                                className={cn(
                                    "relative flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all duration-200 group", 
                                    isActive 
                                        ? "text-stone-900 dark:text-white bg-stone-100 dark:bg-stone-800 shadow-sm" 
                                        : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                                )}
                            >
                                <tab.icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-105")} />
                                <span className="truncate w-full text-center tracking-tight">{tab.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-1 w-1 h-1 rounded-full bg-stone-900 dark:bg-stone-100"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-grow overflow-y-auto relative bg-stone-50 dark:bg-stone-950">
                <div className="p-4 md:p-5 h-full">
                     <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="h-full flex flex-col"
                     >
                        {ActiveContent}
                     </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SidePanel;
