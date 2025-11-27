
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import SidePanel, { SidePanelTab } from '../SidePanel';
import { OutfitLayer, SavedOutfit, SavedLookbook, WardrobeItem } from '../../types';

// Icons
import { PackageIcon, LibraryIcon, BookOpenIcon, ClockIcon, SlidersIcon } from '../icons';

// Panels
import OutfitStack from '../OutfitStack';
import SavedOutfitsPanel from '../AdjustmentPanel';
import SavedLookbooksPanel from '../SavedLookbooksPanel';
import HistoryPanel from '../HistoryPanel';
import FilterPanel from '../FilterPanel';

interface StudioSidePanelProps {
    // Data
    history: OutfitLayer[];
    currentIndex: number;
    savedOutfits: SavedOutfit[];
    savedLookbooks: SavedLookbook[];
    wardrobe: WardrobeItem[];
    filters: any;
    
    // UI State
    isVTOLoading: boolean;
    
    // Actions
    undo: (onRemoveGarment?: (id: string) => void) => void;
    jumpToState: (index: number) => void;
    
    // Persistence Actions
    persistenceActions: any;
    
    // Handler Actions from useStudioState or parent
    handleSaveOutfit: () => void;
    handleLoadOutfit: (outfit: SavedOutfit) => void;
    onOpenWardrobe: () => void;
    onGenerateProductInfo: () => void;
    onOpenLookbookConfig: () => void;
    handleViewLookbook: (lookbook: SavedLookbook) => void;
    onFilterChange: (newFilters: any) => void;
    onResetFilters: () => void;
}

const StudioSidePanel: React.FC<StudioSidePanelProps> = ({
    history, currentIndex, savedOutfits, savedLookbooks, filters,
    isVTOLoading, undo, jumpToState, persistenceActions,
    handleSaveOutfit, handleLoadOutfit, onOpenWardrobe, onGenerateProductInfo, 
    onOpenLookbookConfig, handleViewLookbook, onFilterChange, onResetFilters
}) => {
    
    const sidePanelTabs: SidePanelTab[] = [
        {
            id: 'outfit',
            label: 'Koleksi',
            icon: PackageIcon,
            content: (
                <OutfitStack 
                    outfitHistory={history.slice(0, currentIndex + 1)} 
                    onUndo={() => undo((id) => persistenceActions.deleteWardrobeItem(id))} 
                    onSaveOutfit={handleSaveOutfit} 
                    isLoading={isVTOLoading} 
                    onAddGarment={onOpenWardrobe} 
                    onGenerateProductInfo={onGenerateProductInfo} 
                    onGenerateLookbook={onOpenLookbookConfig} 
                />
            )
        },
        {
            id: 'saved',
            label: 'Tersimpan',
            icon: LibraryIcon,
            content: (
                <SavedOutfitsPanel 
                    savedOutfits={savedOutfits} 
                    onLoadOutfit={handleLoadOutfit} 
                    onDeleteOutfit={persistenceActions.deleteOutfit} 
                    onRenameOutfit={persistenceActions.renameOutfit} 
                    isLoading={isVTOLoading} 
                />
            )
        },
        {
            id: 'lookbooks',
            label: 'Lookbook',
            icon: BookOpenIcon,
            content: (
                <SavedLookbooksPanel 
                    savedLookbooks={savedLookbooks} 
                    onDeleteLookbook={persistenceActions.deleteLookbook} 
                    onRenameLookbook={persistenceActions.renameLookbook} 
                    onViewLookbook={handleViewLookbook} 
                    isLoading={isVTOLoading} 
                />
            )
        },
        {
            id: 'history',
            label: 'Riwayat',
            icon: ClockIcon,
            content: (
                <HistoryPanel 
                    history={history} 
                    currentIndex={currentIndex} 
                    onJumpToState={jumpToState} 
                    isLoading={isVTOLoading} 
                />
            )
        },
        {
            id: 'adjust',
            label: 'Sesuaikan',
            icon: SlidersIcon,
            content: (
                <FilterPanel 
                    filters={filters} 
                    onFilterChange={onFilterChange} 
                    onResetFilters={onResetFilters}
                    isDisabled={isVTOLoading} 
                />
            )
        }
    ];

    return <SidePanel tabs={sidePanelTabs} />;
};

export default StudioSidePanel;
