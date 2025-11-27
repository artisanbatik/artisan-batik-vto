
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';

// Components
import StartScreen from './components/StartScreen';
import StudioScreen from './components/StudioScreen';
import Footer from './components/Footer';

// Hooks & Services
import { useTheme } from './hooks/useTheme';
import { useHistory } from './hooks/useHistory';
import { useVTO } from './hooks/useVTO';
import { useAppPersistence } from './hooks/useAppPersistence';
import { resizeImage, urlToFile } from './lib/utils';

// Types
import { OutfitLayer, WardrobeItem, SavedOutfit, CustomModel } from './types';

const POSE_INSTRUCTIONS = [
  "Tampak depan, tangan di pinggul",
  "Sedikit berputar, tampak 3/4",
  "Tampak dari samping",
  "Berjalan ke arah kamera",
  "Bersandar di dinding",
  "Lengan bersedekap, sikap percaya diri",
  "Tangan di saku, sikap santai",
  "Duduk di bangku",
  "Duduk bersila di lantai",
  "Melompat di udara, foto aksi",
  "Menari dengan tangan terentang",
  "Berjongkok, melihat ke atas",
  "Berbaring di lantai, dilihat dari atas",
];

// --- Main App Component ---
const App: React.FC = () => {
  // Hooks
  const { theme, toggleTheme } = useTheme();
  const { 
      history, currentIndex, currentPoseIndex, currentOutfit, activeOutfitLayers, 
      canUndo, canRedo, updateHistory, undo, redo, jumpToState, setCurrentPoseIndex, updateCurrentLayerPoses, setHistory
  } = useHistory();
  const { 
      isLoading: isVTOLoading, loadingMessage, error: vtoError, setError: setVtoError,
      generateVTO, generatePose, generateCommonPoses 
  } = useVTO();
  const {
      loadingError, setLoadingError, wardrobe, savedOutfits, customModels, productInfoHistory, savedLookbooks, refreshCustomModels, actions: persistenceActions
  } = useAppPersistence();

  // Local State
  const [activeScreen, setActiveScreen] = useState<'start' | 'dressing'>('start');

  // --- Handlers using Hooks ---

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


  const handleStartOver = () => {
    setHistory(history.slice(0, 1)); // Keep base model
    setCurrentPoseIndex(0);
    setActiveScreen('start');
  };
  
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
        
        for (const layerInfo of outfitToLoad.layers) {
            const garment = wardrobe.find(g => g.id === layerInfo.garmentId);
            if (!garment) continue;
            try {
                const garmentFile = await urlToFile(garment.url, garment.name);
                const baseImageUrl = currentHistory[currentHistory.length - 1].poseImages[POSE_INSTRUCTIONS[0]];
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

  // Custom Model Handlers
  const handleAddModel = async (modelUrl: string, aspectRatio: string) => {
      const name = `Model ${customModels.length + 1}`;
      const newModel: CustomModel = {
          id: `model-${Date.now()}`,
          name: name,
          imageUrl: modelUrl,
          aspectRatio,
      };
      await persistenceActions.addCustomModel(newModel);
      handleSelectModel({ ...newModel, imageUrl: modelUrl }); 
  };
  
  const handleSelectModel = (model: CustomModel) => {
      const baseLayer: OutfitLayer = {
          garment: null,
          poseImages: { [POSE_INSTRUCTIONS[0]]: model.imageUrl }
      };
      setHistory([baseLayer]);
      setCurrentPoseIndex(0);
      setActiveScreen('dressing');
  };


  if (activeScreen === 'start') {
    return (
      <div className="w-screen h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden">
          <main className="flex-grow flex items-center justify-center">
              <StartScreen 
                onAddModel={handleAddModel} 
                onSelectModel={handleSelectModel}
                customModels={customModels}
                onDeleteModel={persistenceActions.deleteCustomModel}
                onRenameModel={persistenceActions.renameCustomModel}
                onModelsImported={refreshCustomModels}
                setLoadingError={setLoadingError}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
          </main>
          <Footer />
      </div>
    )
  }

  return (
    <StudioScreen 
        // Hook State
        history={history}
        currentIndex={currentIndex}
        currentPoseIndex={currentPoseIndex}
        currentOutfit={currentOutfit}
        activeOutfitLayers={activeOutfitLayers}
        canUndo={canUndo}
        canRedo={canRedo}
        
        // VTO State
        isVTOLoading={isVTOLoading}
        loadingMessage={loadingMessage}
        vtoError={vtoError}
        setVtoError={setVtoError}
        loadingError={loadingError}
        setLoadingError={setLoadingError}
        
        // Data
        wardrobe={wardrobe}
        savedOutfits={savedOutfits}
        savedLookbooks={savedLookbooks}
        productInfoHistory={productInfoHistory}
        
        // Actions
        undo={undo}
        redo={redo}
        jumpToState={jumpToState}
        onStartOver={handleStartOver}
        onSelectPose={handleSelectPose}
        onGenerateCommonPoses={handleGenerateCommonPoses}
        handleGenerateVTO={handleGenerateVTO}
        handleSaveOutfit={handleSaveOutfit}
        handleLoadOutfit={handleLoadOutfit}
        persistenceActions={persistenceActions}
        
        // Theme
        theme={theme}
        onToggleTheme={toggleTheme}
    />
  );
};

export default App;
