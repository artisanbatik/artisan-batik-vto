
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { WardrobeItem, SavedOutfit, SavedLookbook, CustomModel } from '../types';
import { StudioProvider, useStudio } from './studio/StudioContext';
import StudioLayout from './studio/StudioLayout';

// Components
import Canvas from './Canvas';
import StudioModals from './studio/StudioModals';
import StudioSidePanel from './studio/StudioSidePanel';

interface StudioScreenProps {
    initialModel: CustomModel | null;
    wardrobe: WardrobeItem[];
    savedOutfits: SavedOutfit[];
    savedLookbooks: SavedLookbook[];
    productInfoHistory: any[];
    persistenceActions: any;
    onStartOver: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const StudioScreen: React.FC<StudioScreenProps> = (props) => {
    // This component is now purely a Provider wrapper and Layout orchestrator.
    // All state logic has been moved to StudioContext.tsx
    
    // We keep local state for Layout UI (Sidebar toggle) as it's purely view-related
    const [isPanelOpen, setIsPanelOpen] = React.useState(window.innerWidth > 768);
    const [loadingError, setLoadingError] = React.useState<string | null>(null);

    return (
        <StudioProvider {...props}>
             <StudioScreenContent 
                isPanelOpen={isPanelOpen} 
                setIsPanelOpen={setIsPanelOpen}
                loadingError={loadingError}
                setLoadingError={setLoadingError}
             />
        </StudioProvider>
    );
};

// Inner component to consume context for Layout error handling if needed, 
// though strictly layout props are passed here.
const StudioScreenContent: React.FC<{
    isPanelOpen: boolean;
    setIsPanelOpen: (v: boolean) => void;
    loadingError: string | null;
    setLoadingError: (v: string | null) => void;
}> = ({ isPanelOpen, setIsPanelOpen, loadingError, setLoadingError }) => {
    
    // We can import useStudio here if we need to access error states to pass to Layout
    const { vtoError, setVtoError, isMobile } = useStudio();

    return (
        <StudioLayout
            isMobile={isMobile}
            isPanelOpen={isPanelOpen}
            setIsPanelOpen={setIsPanelOpen}
            error={vtoError || loadingError}
            onErrorDismiss={() => { setVtoError(null); setLoadingError(null); }}
            
            canvas={<Canvas />}
            sidePanelContent={<StudioSidePanel />}
            modals={<StudioModals />}
        />
    );
}

export default StudioScreen;
