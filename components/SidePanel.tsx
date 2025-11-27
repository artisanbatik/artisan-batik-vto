/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { cn } from '../lib/utils';

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
        <div className="flex flex-col h-full bg-stone-100 dark:bg-stone-950">
            <div className="flex items-center justify-around border-b border-stone-300/50 dark:border-stone-800/50 sticky top-0 z-10 bg-inherit">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)} 
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 text-xs sm:text-sm font-semibold transition-colors border-b-2", 
                                isActive 
                                    ? "text-stone-900 dark:text-stone-50 border-stone-900 dark:border-stone-50" 
                                    : "text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
            
            <div className="p-4 flex-grow overflow-y-auto">
                {ActiveContent}
            </div>
        </div>
    );
};

export default SidePanel;