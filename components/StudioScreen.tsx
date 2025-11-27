
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { OutfitLayer, WardrobeItem, SavedOutfit, SavedLookbook } from '../types';
import { useStudioState, POSE_INSTRUCTIONS } from '../hooks/useStudioState';

// Components
import Canvas from './Canvas';
import StudioLayout from './studio/StudioLayout';
import StudioModals from './studio/StudioModals';
import StudioSidePanel from './studio/StudioSidePanel';
import Footer from './Footer';

interface StudioScreenProps {
    // State from hooks
    history: OutfitLayer[];
    currentIndex: number;
    currentPoseIndex: number;
    currentOutfit: OutfitLayer | undefined;
    activeOutfitLayers: OutfitLayer[];
    canUndo: boolean;
    canRedo: boolean;
    
    // VTO State
    isVTOLoading: boolean;
    loadingMessage: string;
    vtoError: string | null;
    setVtoError: (error: string | null) => void;
    loadingError: string | null;
    setLoadingError: (error: string | null) => void;

    // Persistence Data
    wardrobe: WardrobeItem[];
    savedOutfits: SavedOutfit[];
    savedLookbooks: SavedLookbook[];
    productInfoHistory: any[];

    // Actions
    undo: (onRemoveGarment?: (id: string) => void) => void;
    redo: () => void;
    jumpToState: (index: number) => void;
    onStartOver: () => void;
    onSelectPose: (index: number) => void;
    onGenerateCommonPoses: () => void;
    
    // Complex Actions
    handleGenerateVTO: (garmentFile: File, garmentInfo: WardrobeItem, texture: string) => Promise<void>;
    handleSaveOutfit: () => void;
    handleLoadOutfit: (outfit: SavedOutfit) => void;
    
    persistenceActions: any; 

    // Theme
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const StudioScreen: React.FC<StudioScreenProps> = ({
    history, currentIndex, currentPoseIndex, currentOutfit, activeOutfitLayers, canUndo, canRedo,
    isVTOLoading, loadingMessage, vtoError, setVtoError, loadingError, setLoadingError,
    wardrobe, savedOutfits, savedLookbooks, productInfoHistory,
    undo, redo, jumpToState, onStartOver, onSelectPose, onGenerateCommonPoses,
    handleGenerateVTO, handleSaveOutfit, handleLoadOutfit, persistenceActions,
    theme, onToggleTheme
}) => {
    // Layout State
    const [isPanelOpen, setIsPanelOpen] = useState(window.innerWidth > 768);
    const isMobile = window.innerWidth <= 768;

    // Use Custom Hook for all internal Logic & UI State
    const studio = useStudioState({
        currentOutfit,
        activeOutfitLayers,
        savedOutfits,
        productInfoHistory,
        handleGenerateVTO,
        persistenceActions
    });

    const handleStartOverLocal = () => {
        studio.filters.reset();
        onStartOver();
    }

    return (
        <StudioLayout
            isMobile={isMobile}
            isPanelOpen={isPanelOpen}
            setIsPanelOpen={setIsPanelOpen}
            error={vtoError || loadingError}
            onErrorDismiss={() => { setVtoError(null); setLoadingError(null); }}
            
            canvas={
                <Canvas
                    displayImageUrl={currentOutfit?.poseImages[POSE_INSTRUCTIONS[currentPoseIndex]] ?? null}
                    onStartOver={handleStartOverLocal}
                    isLoading={isVTOLoading}
                    loadingMessage={loadingMessage}
                    onSelectPose={onSelectPose}
                    poseInstructions={POSE_INSTRUCTIONS}
                    currentPoseIndex={currentPoseIndex}
                    availablePoseKeys={Object.keys(currentOutfit?.poseImages ?? {})}
                    filters={studio.filters.data}
                    onUndo={() => undo((id) => persistenceActions.deleteWardrobeItem(id))}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onGenerateCommonPoses={onGenerateCommonPoses}
                    isMobile={isMobile}
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                />
            }
            sidePanelContent={
                <StudioSidePanel
                    history={history}
                    currentIndex={currentIndex}
                    savedOutfits={savedOutfits}
                    savedLookbooks={savedLookbooks}
                    wardrobe={wardrobe}
                    filters={studio.filters.data}
                    isVTOLoading={isVTOLoading}
                    undo={undo}
                    jumpToState={jumpToState}
                    persistenceActions={persistenceActions}
                    handleSaveOutfit={handleSaveOutfit}
                    handleLoadOutfit={handleLoadOutfit}
                    onOpenWardrobe={() => studio.modals.setIsWardrobeOpen(true)}
                    onGenerateProductInfo={() => studio.handlers.handleGenerateProductInfo(false)}
                    onOpenLookbookConfig={() => studio.modals.setIsLookbookStyleModalOpen(true)}
                    handleViewLookbook={(lb) => studio.handlers.handleViewLookbook(lb, handleLoadOutfit)}
                    onFilterChange={(newFilters) => studio.filters.set(f => ({ ...f, ...newFilters }))}
                    onResetFilters={studio.filters.reset}
                />
            }
            footer={<Footer isOnDressingScreen />}
            modals={
                <StudioModals
                    isWardrobeOpen={studio.modals.isWardrobeOpen}
                    setIsWardrobeOpen={studio.modals.setIsWardrobeOpen}
                    handleGarmentSelect={studio.handlers.handleGarmentSelect}
                    handleFileUpload={studio.handlers.handleFileUpload}
                    activeOutfitLayers={activeOutfitLayers}
                    isVTOLoading={isVTOLoading}
                    wardrobe={wardrobe}
                    handleEditGarment={studio.handlers.handleEditGarment}
                    handleDeleteGarment={studio.handlers.handleDeleteGarment}
                    
                    isTextureModalOpen={studio.modals.isTextureModalOpen}
                    setIsTextureModalOpen={studio.modals.setIsTextureModalOpen}
                    handleTextureConfirm={studio.handlers.handleTextureConfirm}
                    garmentForTexture={studio.selections.garmentForTexture}
                    
                    isCategorizeModalOpen={studio.modals.isCategorizeModalOpen}
                    setIsCategorizeModalOpen={studio.modals.setIsCategorizeModalOpen}
                    handleCategorizeConfirm={studio.handlers.handleCategorizeConfirm}
                    garmentToCategorize={studio.selections.garmentToCategorize}
                    
                    isEditGarmentModalOpen={studio.modals.isEditGarmentModalOpen}
                    setIsEditGarmentModalOpen={studio.modals.setIsEditGarmentModalOpen}
                    handleSaveGarmentEdit={studio.handlers.handleSaveGarmentEdit}
                    garmentToEdit={studio.selections.garmentToEdit}
                    
                    deletingGarment={studio.selections.deletingGarment}
                    setDeletingGarment={studio.selections.setDeletingGarment}
                    handleConfirmDeleteGarment={studio.handlers.handleConfirmDeleteGarment}
                    
                    isProductInfoModalOpen={studio.modals.isProductInfoModalOpen}
                    setIsProductInfoModalOpen={studio.modals.setIsProductInfoModalOpen}
                    isProductInfoLoading={studio.productInfo.isLoading}
                    productInfoMarkdown={studio.productInfo.markdown}
                    productInfoError={studio.productInfo.error}
                    handleGenerateProductInfo={studio.handlers.handleGenerateProductInfo}
                    
                    isLookbookStyleModalOpen={studio.modals.isLookbookStyleModalOpen}
                    setIsLookbookStyleModalOpen={studio.modals.setIsLookbookStyleModalOpen}
                    handleGenerateLookbook={studio.handlers.handleGenerateLookbook}
                    isLookbookLoading={studio.lookbook.isLoading}
                    
                    isLookbookModalOpen={studio.modals.isLookbookModalOpen}
                    setIsLookbookModalOpen={studio.modals.setIsLookbookModalOpen}
                    lookbookImages={studio.lookbook.images}
                    lookbookError={studio.lookbook.error}
                    lookbookStyle={studio.lookbook.style}
                    lookbookAspectRatio={studio.lookbook.aspectRatio}
                    handleRegenerateLookbookImage={studio.handlers.handleRegenerateLookbookImage}
                    regeneratingImageId={studio.lookbook.regeneratingId}
                    handleSaveLookbook={studio.handlers.handleSaveLookbook}
                    isLookbookSaved={studio.lookbook.isSaved}
                    isMobile={isMobile}
                />
            }
        />
    );
};

export default StudioScreen;
