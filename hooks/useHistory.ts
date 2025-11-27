/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useMemo } from 'react';
import { OutfitLayer, WardrobeItem } from '../types';

export const useHistory = () => {
  const [history, setHistory] = useState<OutfitLayer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const currentOutfit = history[currentIndex];
  const activeOutfitLayers = useMemo(() => history.slice(0, currentIndex + 1), [history, currentIndex]);

  const updateHistory = (newLayer: OutfitLayer) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newLayer);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setCurrentPoseIndex(0); // Reset to default pose when a new garment is added
  };

  const undo = (onRemoveGarment?: (garmentId: string) => void) => {
    if (!canUndo) return;
    const lastLayer = history[currentIndex];
    
    // Check if we are removing a custom garment and if it exists in the custom wardrobe
    // logic passed via callback if needed, or handled purely by index
    if (lastLayer.garment?.id.startsWith('temp-') && onRemoveGarment) {
        onRemoveGarment(lastLayer.garment.id);
    }
    
    setCurrentIndex(prev => prev - 1);
    setCurrentPoseIndex(0); // Reset pose on undo
  };

  const redo = () => {
    if (canRedo) {
        setCurrentIndex(prev => prev + 1);
        setCurrentPoseIndex(0); // Reset pose on redo
    }
  };
  
  const jumpToState = (index: number) => {
    if (index >= 0 && index < history.length) {
        setCurrentIndex(index);
        setCurrentPoseIndex(0); // Reset pose on jump
    }
  };

  const resetHistory = (initialLayer: OutfitLayer) => {
      setHistory([initialLayer]);
      setCurrentIndex(0);
      setCurrentPoseIndex(0);
  }

  // Helper to update a specific layer (e.g., adding generated poses)
  const updateCurrentLayerPoses = (newPoseImages: Record<string, string>) => {
      setHistory(prevHistory => {
          const newHistory = [...prevHistory];
          const updatedLayer = { 
              ...newHistory[currentIndex], 
              poseImages: { ...newHistory[currentIndex].poseImages, ...newPoseImages } 
          };
          newHistory[currentIndex] = updatedLayer;
          return newHistory;
      });
  };

  return {
    history,
    currentIndex,
    currentPoseIndex,
    setCurrentPoseIndex,
    currentOutfit,
    activeOutfitLayers,
    canUndo,
    canRedo,
    updateHistory,
    undo,
    redo,
    jumpToState,
    resetHistory,
    updateCurrentLayerPoses,
    setHistory
  };
};
