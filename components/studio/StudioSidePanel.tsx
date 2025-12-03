
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import SidePanel, { SidePanelTab } from '../SidePanel';

// Icons
import { PackageIcon, LibraryIcon, BookOpenIcon, ClockIcon, SlidersIcon } from '../icons';

// Panels (Now Smart Components)
import OutfitStack from './panels/OutfitStack';
import SavedOutfitsPanel from './panels/SavedOutfitsPanel';
import SavedLookbooksPanel from './panels/SavedLookbooksPanel';
import HistoryPanel from './panels/HistoryPanel';
import FilterPanel from './panels/FilterPanel';

const StudioSidePanel: React.FC = () => {
    // No context consumption needed here anymore! 
    // The individual panels consume what they need.

    const sidePanelTabs: SidePanelTab[] = [
        {
            id: 'outfit',
            label: 'Koleksi',
            icon: PackageIcon,
            content: <OutfitStack />
        },
        {
            id: 'saved',
            label: 'Tersimpan',
            icon: LibraryIcon,
            content: <SavedOutfitsPanel />
        },
        {
            id: 'lookbooks',
            label: 'Lookbook',
            icon: BookOpenIcon,
            content: <SavedLookbooksPanel />
        },
        {
            id: 'history',
            label: 'Riwayat',
            icon: ClockIcon,
            content: <HistoryPanel />
        },
        {
            id: 'adjust',
            label: 'Sesuaikan',
            icon: SlidersIcon,
            content: <FilterPanel />
        }
    ];

    return <SidePanel tabs={sidePanelTabs} />;
};

export default StudioSidePanel;
