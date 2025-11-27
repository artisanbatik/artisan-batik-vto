
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState } from 'react';
import { WardrobeItem, OutfitLayer, WardrobeCategory, LookbookImage, SavedOutfit, SavedLookbook } from '../types';
import { resizeImage, getFriendlyErrorMessage } from '../lib/utils';
import { generateProductInformation, generateLookbookImages, regenerateLookbookImage, SHOT_TYPES } from '../services/geminiService';

interface UseStudioStateProps {
    currentOutfit: OutfitLayer | undefined;
    activeOutfitLayers: OutfitLayer[];
    savedOutfits: SavedOutfit[];
    productInfoHistory: any[];
    handleGenerateVTO: (garmentFile: File, garmentInfo: WardrobeItem, texture: string) => Promise<void>;
    persistenceActions: any;
}

export const POSE_INSTRUCTIONS = [
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

export const useStudioState = ({
    currentOutfit,
    activeOutfitLayers,
    savedOutfits,
    productInfoHistory,
    handleGenerateVTO,
    persistenceActions
}: UseStudioStateProps) => {
    // UI State - Modals
    const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
    const [isTextureModalOpen, setIsTextureModalOpen] = useState(false);
    const [isCategorizeModalOpen, setIsCategorizeModalOpen] = useState(false);
    const [isEditGarmentModalOpen, setIsEditGarmentModalOpen] = useState(false);
    const [isProductInfoModalOpen, setIsProductInfoModalOpen] = useState(false);
    const [isLookbookStyleModalOpen, setIsLookbookStyleModalOpen] = useState(false);
    const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);

    // Layout & Filters
    const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 });
    
    // Selection State
    const [garmentToCategorize, setGarmentToCategorize] = useState<File | null>(null);
    const [garmentToEdit, setGarmentToEdit] = useState<WardrobeItem | null>(null);
    const [garmentForTexture, setGarmentForTexture] = useState<WardrobeItem | null>(null);
    const [fileForTexture, setFileForTexture] = useState<File | null>(null);
    const [deletingGarment, setDeletingGarment] = useState<WardrobeItem | null>(null);

    // Product Info State
    const [isProductInfoLoading, setIsProductInfoLoading] = useState(false);
    const [productInfoMarkdown, setProductInfoMarkdown] = useState<string | null>(null);
    const [productInfoError, setProductInfoError] = useState<string | null>(null);
    const [productInfoForOutfitKey, setProductInfoForOutfitKey] = useState<string | null>(null);

    // Lookbook State
    const [lookbookImages, setLookbookImages] = useState<LookbookImage[]>([]);
    const [lookbookStyle, setLookbookStyle] = useState<string>('');
    const [lookbookAspectRatio, setLookbookAspectRatio] = useState<string>('3:4');
    const [isLookbookLoading, setIsLookbookLoading] = useState(false);
    const [lookbookError, setLookbookError] = useState<string | null>(null);
    const [regeneratingImageId, setRegeneratingImageId] = useState<string | null>(null);
    const [isLookbookSaved, setIsLookbookSaved] = useState(false);

    // --- Handlers ---

    const handleGarmentSelect = (garmentFile: File, garmentInfo: WardrobeItem) => {
        setIsWardrobeOpen(false);
        if (['top', 'bottom', 'outerwear', 'dress'].includes(garmentInfo.category)) {
          setGarmentForTexture(garmentInfo);
          setFileForTexture(garmentFile);
          setIsTextureModalOpen(true);
        } else {
          handleGenerateVTO(garmentFile, garmentInfo, 'default'); 
        }
    };

    const handleTextureConfirm = (texture: string) => {
        setIsTextureModalOpen(false);
        if (fileForTexture && garmentForTexture) {
          handleGenerateVTO(fileForTexture, garmentForTexture, texture);
        }
        setFileForTexture(null);
        setGarmentForTexture(null);
    };

    const handleFileUpload = (file: File) => {
        setGarmentToCategorize(file);
        setIsCategorizeModalOpen(true);
        setIsWardrobeOpen(false);
    };

    const handleCategorizeConfirm = async (category: WardrobeCategory) => {
        setIsCategorizeModalOpen(false);
        if (garmentToCategorize) {
          const newGarment: WardrobeItem = {
            id: `custom-${Date.now()}`,
            name: garmentToCategorize.name.split('.').slice(0, -1).join('.') || 'Karya Unggahan',
            url: URL.createObjectURL(garmentToCategorize),
            category,
          };
          await persistenceActions.addWardrobeItem(newGarment);
          handleGarmentSelect(garmentToCategorize, newGarment);
        }
        setGarmentToCategorize(null);
    };

    const handleEditGarment = (garment: WardrobeItem) => {
        setGarmentToEdit(garment);
        setIsEditGarmentModalOpen(true);
        setIsWardrobeOpen(false);
    };
  
    const handleSaveGarmentEdit = async (updatedGarment: WardrobeItem) => {
      await persistenceActions.updateWardrobeItem(updatedGarment);
      setIsEditGarmentModalOpen(false);
      setGarmentToEdit(null);
      setIsWardrobeOpen(true);
    };
    
    const handleDeleteGarment = (garmentToDelete: WardrobeItem) => {
        setDeletingGarment(garmentToDelete);
        setIsEditGarmentModalOpen(false);
        setIsWardrobeOpen(false);
    };
  
    const handleConfirmDeleteGarment = async () => {
        if (deletingGarment) {
          await persistenceActions.deleteWardrobeItem(deletingGarment.id);
        }
        setDeletingGarment(null);
        setIsWardrobeOpen(true);
    };

    const getOutfitKey = (layers: OutfitLayer[]): string => {
        return layers.slice(1).map(l => `${l.garment?.id ?? 'none'}:${l.texture ?? 'default'}`).join('|');
    };

    const handleGenerateProductInfo = async (forceRegenerate = false) => {
      if (activeOutfitLayers.length <= 1) return;
      const currentOutfitKey = getOutfitKey(activeOutfitLayers);
      
      if (!forceRegenerate) {
          if (productInfoMarkdown && productInfoForOutfitKey === currentOutfitKey) {
            setIsProductInfoModalOpen(true);
            return;
          }
          const existingInfo = productInfoHistory.find(item => item.outfitKey === currentOutfitKey);
          if (existingInfo) {
              setProductInfoMarkdown(existingInfo.info);
              setProductInfoForOutfitKey(existingInfo.outfitKey);
              setIsProductInfoModalOpen(true);
              return;
          }
      }
  
      setIsProductInfoModalOpen(true);
      setIsProductInfoLoading(true);
      setProductInfoError(null);
      if(forceRegenerate) setProductInfoMarkdown(null);
  
      try {
          if(!currentOutfit) throw new Error("No outfit loaded");
          const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
          const markdown = await generateProductInformation(baseImageUrl, activeOutfitLayers);
          setProductInfoMarkdown(markdown);
          setProductInfoForOutfitKey(currentOutfitKey);
          
          const resizedThumbnailUrl = await resizeImage(baseImageUrl, 200, 267);
          const newInfo = {
              id: `prodinfo-${Date.now()}`,
              timestamp: Date.now(),
              info: markdown,
              thumbnailUrl: resizedThumbnailUrl,
              title: markdown.split('\n')[2]?.replace(/`/g, '').trim() || `Produk ${new Date().toLocaleTimeString()}`,
              outfitKey: currentOutfitKey,
          };
          await persistenceActions.addProductInfo(newInfo);
      } catch (err) {
          setProductInfoError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal membuat info produk.'));
      } finally {
          setIsProductInfoLoading(false);
      }
    };

    const handleGenerateLookbook = async (style: string, aspectRatio: string, customPrompt?: string) => {
        if (!currentOutfit) return;
        setIsLookbookStyleModalOpen(false);
        setIsLookbookModalOpen(true);
        setIsLookbookLoading(true);
        setLookbookError(null);
        setLookbookImages([]);
        setLookbookStyle(style);
        setLookbookAspectRatio(aspectRatio);
        setIsLookbookSaved(false);
    
        const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const shotTypePrompt = SHOT_TYPES[style as keyof typeof SHOT_TYPES]?.prompt || style;
        const variations = customPrompt ? [customPrompt] : [
          "Potret seluruh badan, tatapan percaya diri ke kamera.",
          "Candid, momen tertawa atau tersenyum alami.",
          "Detail close-up pada tekstur dan pola batik.",
          "Pose berjalan, menangkap gerakan dinamis dari pakaian.",
        ];
        
        try {
            const imagePromises = variations.map(variation => 
                generateLookbookImages(baseImageUrl, activeOutfitLayers, shotTypePrompt, variation, aspectRatio, customPrompt)
            );
            const results = await Promise.all(imagePromises);
            setLookbookImages(results.map((url, index) => ({ id: `lookbook-img-${Date.now()}-${index}`, url: url })));
        } catch (err) {
            setLookbookError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal membuat gambar lookbook.'));
        } finally {
            setIsLookbookLoading(false);
        }
    };

    const handleRegenerateLookbookImage = async (imageToRegen: LookbookImage, refinementPrompt: string) => {
        if (!currentOutfit) return;
        setRegeneratingImageId(imageToRegen.id);
        const shotTypePrompt = SHOT_TYPES[lookbookStyle as keyof typeof SHOT_TYPES]?.prompt || lookbookStyle;
        try {
            const newImageUrl = await regenerateLookbookImage(imageToRegen.url, activeOutfitLayers, shotTypePrompt, refinementPrompt, lookbookAspectRatio);
            setLookbookImages(prev => prev.map(img => img.id === imageToRegen.id ? { ...img, url: newImageUrl } : img));
        } catch (err) {
            console.error("Gagal membuat ulang gambar lookbook:", err);
        } finally {
            setRegeneratingImageId(null);
        }
    };
    
    const handleSaveLookbook = async () => {
        if (!currentOutfit || lookbookImages.length === 0 || isLookbookSaved) return;
        try {
            const timestamp = Date.now();
            const outfitId = `outfit-${timestamp}`;
            const lookbookId = `lookbook-${timestamp}`;
            const outfitThumbnailUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
            const resizedOutfitThumbnailUrl = await resizeImage(outfitThumbnailUrl, 200, 267);
    
            const newSavedOutfit: SavedOutfit = {
                id: outfitId,
                name: `Koleksi untuk Lookbook ${lookbookStyle}`,
                thumbnailUrl: resizedOutfitThumbnailUrl,
                layers: activeOutfitLayers.slice(1).map(layer => ({ garmentId: layer.garment!.id, texture: layer.texture })),
                poseInstruction: POSE_INSTRUCTIONS[0],
                lookbookId: lookbookId
            };
            await persistenceActions.saveOutfit(newSavedOutfit);
            
            const lookbookThumbnailUrl = await resizeImage(lookbookImages[0].url, 200, 267);
            const newLookbook: SavedLookbook = {
                id: lookbookId,
                name: `Lookbook: ${lookbookStyle}`,
                style: lookbookStyle,
                images: lookbookImages,
                outfitId: outfitId,
                thumbnailUrl: lookbookThumbnailUrl,
                aspectRatio: lookbookAspectRatio,
            };
            await persistenceActions.saveLookbook(newLookbook);
            setIsLookbookSaved(true);
        } catch (err) {
            console.error("Gagal menyimpan lookbook:", err);
        }
    };

    const handleViewLookbook = (lookbookToView: SavedLookbook, handleLoadOutfit: (outfit: SavedOutfit) => void) => {
        const associatedOutfit = savedOutfits.find(o => o.id === lookbookToView.outfitId);
        if (associatedOutfit) {
             handleLoadOutfit(associatedOutfit);
        }
        setLookbookImages(lookbookToView.images);
        setLookbookStyle(lookbookToView.style);
        setLookbookAspectRatio(lookbookToView.aspectRatio || '3:4');
        setIsLookbookSaved(true);
        setIsLookbookModalOpen(true);
    };

    const handleResetFilters = () => setFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 });

    return {
        // Modal State
        modals: {
            isWardrobeOpen, setIsWardrobeOpen,
            isTextureModalOpen, setIsTextureModalOpen,
            isCategorizeModalOpen, setIsCategorizeModalOpen,
            isEditGarmentModalOpen, setIsEditGarmentModalOpen,
            isProductInfoModalOpen, setIsProductInfoModalOpen,
            isLookbookStyleModalOpen, setIsLookbookStyleModalOpen,
            isLookbookModalOpen, setIsLookbookModalOpen,
        },
        // Filter State
        filters: {
            data: filters,
            set: setFilters,
            reset: handleResetFilters
        },
        // Selections
        selections: {
            garmentToCategorize, setGarmentToCategorize,
            garmentToEdit, setGarmentToEdit,
            garmentForTexture, setGarmentForTexture,
            deletingGarment, setDeletingGarment
        },
        // Product Info State
        productInfo: {
            isLoading: isProductInfoLoading,
            markdown: productInfoMarkdown,
            error: productInfoError
        },
        // Lookbook State
        lookbook: {
            images: lookbookImages,
            style: lookbookStyle,
            aspectRatio: lookbookAspectRatio,
            isLoading: isLookbookLoading,
            error: lookbookError,
            regeneratingId: regeneratingImageId,
            isSaved: isLookbookSaved
        },
        // Handlers
        handlers: {
            handleGarmentSelect,
            handleTextureConfirm,
            handleFileUpload,
            handleCategorizeConfirm,
            handleEditGarment,
            handleSaveGarmentEdit,
            handleDeleteGarment,
            handleConfirmDeleteGarment,
            handleGenerateProductInfo,
            handleGenerateLookbook,
            handleRegenerateLookbookImage,
            handleSaveLookbook,
            handleViewLookbook
        }
    };
};
