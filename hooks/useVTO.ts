/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback } from 'react';
import { generateVirtualTryOnImage, generatePoseVariation } from '../services/geminiService';
import { OutfitLayer, WardrobeItem } from '../types';
import { getFriendlyErrorMessage } from '../lib/utils';

export const useVTO = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const generateVTO = useCallback(async (
      baseImageUrl: string, 
      garmentFile: File, 
      garmentInfo: WardrobeItem, 
      texture: string,
      poseInstruction: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setLoadingMessage('Menerapkan karya batik...');
    setError(null);

    try {
      const newImageUrl = await generateVirtualTryOnImage(baseImageUrl, garmentFile, garmentInfo, texture);
      return newImageUrl;
    } catch (err) {
      console.error("VTO generation failed:", err);
      setError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal membuat karya'));
      return null;
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const generatePose = useCallback(async (
      baseImageUrl: string, 
      poseInstruction: string, 
      activeOutfitLayers: OutfitLayer[]
  ): Promise<string | null> => {
      setIsLoading(true);
      setLoadingMessage(`Membuat pose: ${poseInstruction}`);
      setError(null);

      try {
          const newImageUrl = await generatePoseVariation(baseImageUrl, poseInstruction, activeOutfitLayers);
          return newImageUrl;
      } catch (err) {
          console.error("Pose generation failed:", err);
          setError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), `Gagal membuat pose: ${poseInstruction}`));
          return null;
      } finally {
          setIsLoading(false);
          setLoadingMessage('');
      }
  }, []);

  const generateCommonPoses = useCallback(async (
      baseImageUrl: string, 
      currentPoseKeys: string[], 
      activeOutfitLayers: OutfitLayer[],
      posesToGenerateList: string[]
  ): Promise<Array<{ pose: string, url: string }>> => {
    
    setIsLoading(true);
    setError(null);
    const results: Array<{ pose: string, url: string }> = [];

    // Filter poses that need generation
    const neededPoses = posesToGenerateList.filter(p => !currentPoseKeys.includes(p));

    const posePromises = neededPoses.map(async (pose) => {
        try {
            setLoadingMessage(`Membuat pose: ${pose}`);
            const newImageUrl = await generatePoseVariation(baseImageUrl, pose, activeOutfitLayers);
            return { pose, url: newImageUrl };
        } catch (err) {
            console.error(`Gagal membuat pose ${pose}:`, err);
            throw err; 
        }
    });

    try {
        const generated = await Promise.all(posePromises);
        generated.forEach(g => { if(g) results.push(g); });
        return results;
    } catch (err) {
        console.error("Gagal membuat pose umum:", err);
        setError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), `Gagal membuat pose umum`));
        return results; // Return whatever succeeded
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, []);

  return {
    isLoading,
    loadingMessage,
    error,
    setError,
    clearError,
    generateVTO,
    generatePose,
    generateCommonPoses
  };
};
