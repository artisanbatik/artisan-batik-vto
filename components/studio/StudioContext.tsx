
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useContext, ReactNode } from 'react';
import { OutfitLayer, SavedOutfit, SavedLookbook, WardrobeItem, CustomModel } from '../../types';
import { useHistory } from '../../hooks/useHistory';
import { useVTO } from '../../hooks/useVTO';
import { useStudioState, POSE_INSTRUCTIONS } from '../../hooks/useStudioState';

// Define the shape of our context
interface StudioContextType {
    // Data from App (Persistence)
    wardrobe: WardrobeItem[];
    savedOutfits: SavedOutfit[];
    savedLookbooks: SavedLookbook[];
    productInfoHistory: any[];
    persistenceActions: any;
    
    // History State
    history: OutfitLayer[];
    currentIndex: number;
    currentPoseIndex: number;
    currentOutfit: OutfitLayer | undefined;
    activeOutfitLayers: OutfitLayer[];
    canUndo: boolean;
    canRedo: boolean;
    setCurrentPoseIndex: (index: number) => void;
    undo: (onRemoveGarment?: (id: string) => void) => void;
    redo: () => void;
    jumpToState: (index: number) => void;
    
    // VTO State
    isVTOLoading: boolean;
    loadingMessage: string;
    vtoError: string | null;
    setVtoError: (error: string | null) => void;
    
    // Studio UI State & Logic (from useStudioState)
    modals: ReturnType<typeof useStudioState>['modals'];
    filters: ReturnType<typeof useStudioState>['filters'];
    selections: ReturnType<typeof useStudioState>['selections'];
    productInfo: ReturnType<typeof useStudioState>['productInfo'];
    lookbook: ReturnType<typeof useStudioState>['lookbook'];
    handlers: ReturnType<typeof useStudioState>['handlers'];
    
    // Layout/Global
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onStartOver: () => void;
    handleSaveOutfit: () => Promise<void>;
    handleLoadOutfit: (outfit: SavedOutfit) => void;
    handleSelectPose: (index: number) => void;
    handleGenerateCommonPoses: () => void;
    
    // Computed
    currentDisplayImage: string | null;
    poseInstructions: string[];
    availablePoseKeys: string[];
    isMobile: boolean;
}

const StudioContext = createContext<StudioContextType | null>(null);

export const useStudio = () => {
    const context = useContext(StudioContext);
    if (!context) {
        throw new Error("useStudio must be used within a StudioProvider");
    }
    return context;
};

interface StudioProviderProps {
    children: ReactNode;
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

export const StudioProvider: React.FC<StudioProviderProps> = ({
    children,
    initialModel,
    wardrobe,
    savedOutfits,
    savedLookbooks,
    productInfoHistory,
    persistenceActions,
    onStartOver,
    theme,
    onToggleTheme
}) => {
    // --- Hook Initializations ---
    const historyHook = useHistory();
    const vtoHook = useVTO();
    
    // Derived State for Display
    const currentDisplayImage = historyHook.currentOutfit?.poseImages[POSE_INSTRUCTIONS[historyHook.currentPoseIndex]] ?? null;
    const availablePoseKeys = Object.keys(historyHook.currentOutfit?.poseImages ?? {});

    // --- Complex Handlers (Logic moved from StudioScreen) ---
    const handleGenerateVTO = async (garmentFile: File, garmentInfo: WardrobeItem, texture: string) => {
        if (!historyHook.currentOutfit) return;
        const baseImageUrl = historyHook.currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const newImageUrl = await vtoHook.generateVTO(baseImageUrl, garmentFile, garmentInfo, texture, POSE_INSTRUCTIONS[0]);
        
        if (newImageUrl) {
            const newLayer: OutfitLayer = {
                garment: garmentInfo,
                texture,
                poseImages: { [POSE_INSTRUCTIONS[0]]: newImageUrl },
            };
            historyHook.updateHistory(newLayer);
        }
    };

    const handleSelectPose = async (index: number) => {
        const poseInstruction = POSE_INSTRUCTIONS[index];
        if (historyHook.currentOutfit?.poseImages[poseInstruction]) {
            historyHook.setCurrentPoseIndex(index);
            return;
        }
        if (!historyHook.currentOutfit || vtoHook.isLoading) return;
        
        const baseImageUrl = historyHook.currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const newImageUrl = await vtoHook.generatePose(baseImageUrl, poseInstruction, historyHook.activeOutfitLayers);
        
        if (newImageUrl) {
            historyHook.updateCurrentLayerPoses({ [poseInstruction]: newImageUrl });
            historyHook.setCurrentPoseIndex(index);
        }
    };

    const handleGenerateCommonPoses = async () => {
        if (!historyHook.currentOutfit || vtoHook.isLoading) return;
        const posesToGenerate = ["Sedikit berputar, tampak 3/4", "Tampak dari samping", "Berjalan ke arah kamera"];
        const baseImageUrl = historyHook.currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const currentPoseKeys = Object.keys(historyHook.currentOutfit.poseImages);
    
        const results = await vtoHook.generateCommonPoses(baseImageUrl, currentPoseKeys, historyHook.activeOutfitLayers, posesToGenerate);
        if (results.length > 0) {
            const newPoses = results.reduce((acc, curr) => ({ ...acc, [curr.pose]: curr.url }), {});
            historyHook.updateCurrentLayerPoses(newPoses);
        }
    };

    const handleSaveOutfit = async () => {
        if (historyHook.activeOutfitLayers.length <= 1 || !historyHook.currentOutfit) return;
        try {
            const { resizeImage } = await import('../../lib/utils');
            const thumbnailUrl = historyHook.currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
            const resizedThumbnailUrl = await resizeImage(thumbnailUrl, 200, 267);
            const name = `Koleksi ${new Date().toLocaleString()}`;
            const newSavedOutfit: SavedOutfit = {
                id: `outfit-${Date.now()}`,
                name,
                thumbnailUrl: resizedThumbnailUrl,
                layers: historyHook.activeOutfitLayers.slice(1).map(layer => ({
                    garmentId: layer.garment!.id,
                    texture: layer.texture,
                })),
                poseInstruction: POSE_INSTRUCTIONS[0],
            };
            await persistenceActions.saveOutfit(newSavedOutfit);
        } catch (error) {
            console.error("Gagal menyimpan koleksi:", error);
            vtoHook.setError("Gagal menyimpan koleksi karena tidak dapat memproses gambar mini.");
        }
    };

    const handleLoadOutfit = (outfitToLoad: SavedOutfit) => {
        const baseLayer = historyHook.history[0];
        if (!baseLayer) {
            console.error("Tidak dapat memuat koleksi, lapisan dasar tidak ditemukan.");
            return;
        }
        const loadLayers = async () => {
            const { urlToFile } = await import('../../lib/utils');
            let currentHistory = [baseLayer];
            
            for (const layerInfo of outfitToLoad.layers) {
                const garment = wardrobe.find(g => g.id === layerInfo.garmentId);
                if (!garment) continue;
                try {
                    const garmentFile = await urlToFile(garment.url, garment.name);
                    const baseImageUrl = currentHistory[currentHistory.length - 1].poseImages[POSE_INSTRUCTIONS[0]];
                    const newImageUrl = await vtoHook.generateVTO(baseImageUrl, garmentFile, garment, layerInfo.texture || 'default', POSE_INSTRUCTIONS[0]);
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
            historyHook.setHistory(currentHistory);
            historyHook.setCurrentPoseIndex(0);
        };
        loadLayers();
    };

    // Initialize History on Mount
    React.useEffect(() => {
        if (initialModel) {
            const baseLayer: OutfitLayer = {
                garment: null,
                poseImages: { [POSE_INSTRUCTIONS[0]]: initialModel.imageUrl }
            };
            historyHook.resetHistory(baseLayer);
        }
    }, [initialModel]);

    // Studio State Hook (UI Logic)
    const studioState = useStudioState({
        currentOutfit: historyHook.currentOutfit,
        activeOutfitLayers: historyHook.activeOutfitLayers,
        savedOutfits,
        productInfoHistory,
        handleGenerateVTO,
        persistenceActions
    });

    const isMobile = window.innerWidth <= 768;

    const handleStartOverLocal = () => {
        studioState.filters.reset();
        onStartOver();
    }

    const value: StudioContextType = {
        // Data
        wardrobe,
        savedOutfits,
        savedLookbooks,
        productInfoHistory,
        persistenceActions,
        
        // Hooks Spread
        ...historyHook,
        
        // VTO Override
        isVTOLoading: vtoHook.isLoading,
        loadingMessage: vtoHook.loadingMessage,
        vtoError: vtoHook.error,
        setVtoError: vtoHook.setError,

        // Studio State Spread
        ...studioState,

        // Layout
        theme,
        onToggleTheme,
        onStartOver: handleStartOverLocal,
        isMobile,
        
        // Handlers
        handleSaveOutfit,
        handleLoadOutfit,
        handleSelectPose,
        handleGenerateCommonPoses,

        // Computed
        currentDisplayImage,
        poseInstructions: POSE_INSTRUCTIONS,
        availablePoseKeys
    };

    return (
        <StudioContext.Provider value={value}>
            {children}
        </StudioContext.Provider>
    );
};
