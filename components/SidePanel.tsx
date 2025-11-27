
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { PackageIcon, LibraryIcon, BookOpenIcon, ClockIcon, SlidersIcon } from './icons';
import { cn } from '../lib/utils';
import OutfitStack from './OutfitStack';
import SavedOutfitsPanel from './AdjustmentPanel';
import SavedLookbooksPanel from './SavedLookbooksPanel';
import HistoryPanel from './HistoryPanel';
import FilterPanel from './FilterPanel';
import { OutfitLayer, SavedOutfit, SavedLookbook } from '../types';

type PanelTabId = 'outfit' | 'saved' | 'lookbooks' | 'history' | 'adjust';

interface SidePanelProps {
    // Data Props
    history: OutfitLayer[];
    currentIndex: number;
    savedOutfits: SavedOutfit[];
    savedLookbooks: SavedLookbook[];
    filters: { brightness: number; contrast: number; saturation: number; hue: number; sepia: number; };
    isVTOLoading: boolean;
    
    // Actions
    onUndo: () => void;
    onSaveOutfit: () => void;
    onAddGarment: () => void;
    onGenerateProductInfo: () => void;
    onGenerateLookbook: () => void;
    
    onLoadOutfit: (outfit: SavedOutfit) => void;
    onDeleteOutfit: (id: string) => void;
    onRenameOutfit: (id: string, name: string) => void;
    
    onViewLookbook: (lookbook: SavedLookbook) => void;
    onDeleteLookbook: (id: string) => void;
    onRenameLookbook: (id: string, name: string) => void;
    
    onJumpToState: (index: number) => void;
    
    onFilterChange: (filters: any) => void;
    onResetFilters: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
    history, currentIndex, savedOutfits, savedLookbooks, filters, isVTOLoading,
    onUndo, onSaveOutfit, onAddGarment, onGenerateProductInfo, onGenerateLookbook,
    onLoadOutfit, onDeleteOutfit, onRenameOutfit,
    onViewLookbook, onDeleteLookbook, onRenameLookbook,
    onJumpToState, onFilterChange, onResetFilters
}) => {
    const [activeTab, setActiveTab] = useState<PanelTabId>('outfit');

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-around border-b border-stone-300/50 dark:border-stone-800/50 bg-stone-100 dark:bg-stone-950 sticky top-0 z-10">
                <TabButton id="outfit" activeTab={activeTab} setActiveTab={setActiveTab} label="Koleksi" Icon={PackageIcon} />
                <TabButton id="saved" activeTab={activeTab} setActiveTab={setActiveTab} label="Tersimpan" Icon={LibraryIcon} />
                <TabButton id="lookbooks" activeTab={activeTab} setActiveTab={setActiveTab} label="Lookbook" Icon={BookOpenIcon} />
                <TabButton id="history" activeTab={activeTab} setActiveTab={setActiveTab} label="Riwayat" Icon={ClockIcon} />
                <TabButton id="adjust" activeTab={activeTab} setActiveTab={setActiveTab} label="Sesuaikan" Icon={SlidersIcon} />
            </div>
            
            <div className="p-4 flex-grow overflow-y-auto">
                {activeTab === 'outfit' && (
                    <OutfitStack 
                        outfitHistory={history.slice(0, currentIndex + 1)} 
                        onUndo={onUndo} 
                        onSaveOutfit={onSaveOutfit} 
                        isLoading={isVTOLoading} 
                        onAddGarment={onAddGarment} 
                        onGenerateProductInfo={onGenerateProductInfo} 
                        onGenerateLookbook={onGenerateLookbook} 
                    />
                )}
                {activeTab === 'saved' && (
                    <SavedOutfitsPanel 
                        savedOutfits={savedOutfits} 
                        onLoadOutfit={onLoadOutfit} 
                        onDeleteOutfit={onDeleteOutfit} 
                        onRenameOutfit={onRenameOutfit} 
                        isLoading={isVTOLoading} 
                    />
                )}
                {activeTab === 'lookbooks' && (
                    <SavedLookbooksPanel 
                        savedLookbooks={savedLookbooks} 
                        onDeleteLookbook={onDeleteLookbook} 
                        onRenameLookbook={onRenameLookbook} 
                        onViewLookbook={onViewLookbook} 
                        isLoading={isVTOLoading} 
                    />
                )}
                {activeTab === 'history' && (
                    <HistoryPanel 
                        history={history} 
                        currentIndex={currentIndex} 
                        onJumpToState={onJumpToState} 
                        isLoading={isVTOLoading} 
                    />
                )}
                {activeTab === 'adjust' && (
                    <FilterPanel 
                        filters={filters} 
                        onFilterChange={onFilterChange} 
                        onResetFilters={onResetFilters} 
                        isDisabled={isVTOLoading} 
                    />
                )}
            </div>
        </div>
    );
};

interface TabButtonProps { id: PanelTabId; activeTab: PanelTabId; setActiveTab: (id: PanelTabId) => void; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>>; }
const TabButton: React.FC<TabButtonProps> = ({ id, activeTab, setActiveTab, label, Icon }) => {
    const isActive = activeTab === id;
    return (
        <button onClick={() => setActiveTab(id)} className={cn("w-full flex flex-col items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors border-b-2", isActive ? "text-stone-900 dark:text-stone-50 border-stone-900 dark:border-stone-50" : "text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50")}>
            <Icon className="w-5 h-5" /><span>{label}</span>
        </button>
    )
}

export default SidePanel;
