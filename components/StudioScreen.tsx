
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useCallback } from 'react';
import { OutfitLayer, WardrobeItem, SavedOutfit, SavedLookbook, CustomModel } from '../types';
import { useStudioState, POSE_INSTRUCTIONS } from '../hooks/useStudioState';
import { useHistory } from '../hooks/useHistory';
import { useVTO } from '../hooks/useVTO';
import { resizeImage, urlToFile } from '../lib/utils';

// Components
import Canvas from './Canvas';
import StudioLayout from './studio/StudioLayout';
import StudioModals from './studio/StudioModals';
import StudioSidePanel from './studio/StudioSidePanel';
import Footer from './Footer';

interface StudioScreenProps {
    // Initial State
    initialModel: CustomModel | null;
    
    // Persistence Data (Passed down from App)
    wardrobe: WardrobeItem[];
    savedOutfits: SavedOutfit[];
    savedLookbooks: SavedLookbook[];
    productInfoHistory: any[];
    persistenceActions: any;

    // Navigation
    onStartOver: () => void;

    // Theme
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const StudioScreen: React.FC<StudioScreenProps> = ({
    initialModel,
    wardrobe, savedOutfits, savedLookbooks, productInfoHistory, persistenceActions,
    onStartOver, theme, onToggleTheme
}) => {
    // --- Internal State Management ---
    // Moved from App.tsx to encapsulate Studio logic
    const { 
        history, currentIndex, currentPoseIndex, currentOutfit, activeOutfitLayers, 
        canUndo, canRedo, updateHistory, undo, redo, jumpToState, setCurrentPoseIndex, updateCurrentLayerPoses, resetHistory, setHistory
    } = useHistory();

    const { 
        isLoading: isVTOLoading, loadingMessage, error: vtoError, setError: setVtoError,
        generateVTO, generatePose, generateCommonPoses 
    } = useVTO();

    const [loadingError, setLoadingError] = React.useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = React.useState(window.innerWidth > 768);
    const isMobile = window.innerWidth <= 768;

    // Initialize History with selected model
    useEffect(() => {
        if (initialModel) {
            const baseLayer: OutfitLayer = {
                garment: null,
                poseImages: { [POSE_INSTRUCTIONS[0]]: initialModel.imageUrl }
            };
            resetHistory(baseLayer);
        }
    }, [initialModel]);

    // --- Logic Handlers (Moved from App.tsx) ---

    const handleGenerateVTO = useCallback(async (garmentFile: File, garmentInfo: WardrobeItem, texture: string) => {
        if (!currentOutfit) return;
        const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const newImageUrl = await generateVTO(baseImageUrl, garmentFile, garmentInfo, texture, POSE_INSTRUCTIONS[0]);
        
        if (newImageUrl) {
            const newLayer: OutfitLayer = {
                garment: garmentInfo,
                texture,
                poseImages: { [POSE_INSTRUCTIONS[0]]: newImageUrl },
            };
            updateHistory(newLayer);
        }
    }, [currentOutfit, generateVTO, updateHistory]);

    const handleSelectPose = useCallback(async (index: number) => {
        const poseInstruction = POSE_INSTRUCTIONS[index];
        if (currentOutfit?.poseImages[poseInstruction]) {
            setCurrentPoseIndex(index);
            return;
        }
        if (!currentOutfit || isVTOLoading) return;
        
        const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const newImageUrl = await generatePose(baseImageUrl, poseInstruction, activeOutfitLayers);
        
        if (newImageUrl) {
            updateCurrentLayerPoses({ [poseInstruction]: newImageUrl });
            setCurrentPoseIndex(index);
        }
    }, [currentOutfit, isVTOLoading, generatePose, activeOutfitLayers, updateCurrentLayerPoses, setCurrentPoseIndex]);

    const handleGenerateCommonPoses = useCallback(async () => {
        if (!currentOutfit || isVTOLoading) return;
        const posesToGenerate = ["Sedikit berputar, tampak 3/4", "Tampak dari samping", "Berjalan ke arah kamera"];
        const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const currentPoseKeys = Object.keys(currentOutfit.poseImages);
    
        const results = await generateCommonPoses(baseImageUrl, currentPoseKeys, activeOutfitLayers, posesToGenerate);
        if (results.length > 0) {
            const newPoses = results.reduce((acc, curr) => ({ ...acc, [curr.pose]: curr.url }), {});
            updateCurrentLayerPoses(newPoses);
        }
    }, [currentOutfit, isVTOLoading, generateCommonPoses, activeOutfitLayers, updateCurrentLayerPoses]);

    const handleSaveOutfit = async () => {
        if (activeOutfitLayers.length <= 1 || !currentOutfit) return;
        try {
            const thumbnailUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
            const resizedThumbnailUrl = await resizeImage(thumbnailUrl, 200, 267);
            const name = `Koleksi ${new Date().toLocaleString()}`;
            const newSavedOutfit: SavedOutfit = {
                id: `outfit-${Date.now()}`,
                name,
                thumbnailUrl: resizedThumbnailUrl,
                layers: activeOutfitLayers.slice(1).map(layer => ({
                    garmentId: layer.garment!.id,
                    texture: layer.texture,
                })),
                poseInstruction: POSE_INSTRUCTIONS[0],
            };
            await persistenceActions.saveOutfit(newSavedOutfit);
        } catch (error) {
            console.error("Gagal menyimpan koleksi:", error);
            setVtoError("Gagal menyimpan koleksi karena tidak dapat memproses gambar mini.");
        }
    };
    
    const handleLoadOutfit = (outfitToLoad: SavedOutfit) => {
        const baseLayer = history[0];
        if (!baseLayer) {
            console.error("Tidak dapat memuat koleksi, lapisan dasar tidak ditemukan.");
            return;
        }
        const loadLayers = async () => {
            let currentHistory = [baseLayer];
            
            // Show loading state implicitly by maybe setting a message if we had a global loader, 
            // but for now we rely on the VTO hook's loading state per item or just blocking UI.
            // Since we are iterating, let's just do it. 
            
            for (const layerInfo of outfitToLoad.layers) {
                const garment = wardrobe.find(g => g.id === layerInfo.garmentId);
                if (!garment) continue;
                try {
                    const garmentFile = await urlToFile(garment.url, garment.name);
                    const baseImageUrl = currentHistory[currentHistory.length - 1].poseImages[POSE_INSTRUCTIONS[0]];
                    // Directly calling service or using hook? Using hook function is better but we are in a loop.
                    // generateVTO updates loading state.
                    const newImageUrl = await generateVTO(baseImageUrl, garmentFile, garment, layerInfo.texture || 'default', POSE_INSTRUCTIONS[0]);
                    if(newImageUrl) {
                        const newLayer: OutfitLayer = {
                            garment,
                            texture: layerInfo.texture,
                            poseImages: { [POSE_INSTRUCTIONS[0]]: newImageUrl },
                        };
                        currentHistory.push(newLayer);
                    }
                } catch (err) { break; }
            }
            setHistory(currentHistory);
            setCurrentPoseIndex(0);
        };
        loadLayers();
    };

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
                    onSelectPose={handleSelectPose}
                    poseInstructions={POSE_INSTRUCTIONS}
                    currentPoseIndex={currentPoseIndex}
                    availablePoseKeys={Object.keys(currentOutfit?.poseImages ?? {})}
                    filters={studio.filters.data}
                    onUndo={() => undo((id) => persistenceActions.deleteWardrobeItem(id))}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onGenerateCommonPoses={handleGenerateCommonPoses}
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
