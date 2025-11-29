
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import SidePanel, { SidePanelTab } from '../SidePanel';
import { useStudio } from './StudioContext';

// Icons
import { PackageIcon, LibraryIcon, BookOpenIcon, ClockIcon, SlidersIcon } from '../icons';

// Panels
import OutfitStack from '../OutfitStack';
import SavedOutfitsPanel from '../AdjustmentPanel';
import SavedLookbooksPanel from '../SavedLookbooksPanel';
import HistoryPanel from '../HistoryPanel';
import FilterPanel from '../FilterPanel';

const StudioSidePanel: React.FC = () => {
    // Consume Context
    const { 
        history, 
        currentIndex, 
        savedOutfits, 
        savedLookbooks, 
        wardrobe, // Available via context if needed by panels
        filters: filterManager,
        isVTOLoading, 
        undo, 
        jumpToState, 
        persistenceActions,
        handleSaveOutfit,
        handleLoadOutfit,
        modals, // for opening wardrobe
        handlers, // for product info, lookbook
        // for filters
    } = useStudio();

    const filters = filterManager.data;

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
                    onAddGarment={() => modals.setIsWardrobeOpen(true)} 
                    onGenerateProductInfo={() => handlers.handleGenerateProductInfo(false)} 
                    onGenerateLookbook={() => modals.setIsLookbookStyleModalOpen(true)} 
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
                    onViewLookbook={(lb) => handlers.handleViewLookbook(lb, handleLoadOutfit)} 
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
                    onFilterChange={(newFilters) => filterManager.set(f => ({ ...f, ...newFilters }))} 
                    onResetFilters={filterManager.reset}
                    isDisabled={isVTOLoading} 
                />
            )
        }
    ];

    return <SidePanel tabs={sidePanelTabs} />;
};

export default StudioSidePanel;
