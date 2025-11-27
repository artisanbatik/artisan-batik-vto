/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { resizeImage, getFriendlyErrorMessage } from '../lib/utils';
import { OutfitLayer, WardrobeItem, SavedOutfit, WardrobeCategory, LookbookImage, SavedLookbook } from '../types';
import { generateProductInformation, generateLookbookImages, regenerateLookbookImage, SHOT_TYPES } from '../services/geminiService';

// Icons
import { PackageIcon, LibraryIcon, BookOpenIcon, ClockIcon, SlidersIcon } from './icons';

// Components
import Canvas from './Canvas';
import SidePanel, { SidePanelTab } from './SidePanel';
import StudioLayout from './studio/StudioLayout';
import StudioModals from './studio/StudioModals';
import Footer from './Footer';

// Panel Contents
import OutfitStack from './OutfitStack';
import SavedOutfitsPanel from './AdjustmentPanel';
import SavedLookbooksPanel from './SavedLookbooksPanel';
import HistoryPanel from './HistoryPanel';
import FilterPanel from './FilterPanel';

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

const StudioScreen: React.FC<StudioScreenProps> = ({
    history, currentIndex, currentPoseIndex, currentOutfit, activeOutfitLayers, canUndo, canRedo,
    isVTOLoading, loadingMessage, vtoError, setVtoError, loadingError, setLoadingError,
    wardrobe, savedOutfits, savedLookbooks, productInfoHistory,
    undo, redo, jumpToState, onStartOver, onSelectPose, onGenerateCommonPoses,
    handleGenerateVTO, handleSaveOutfit, handleLoadOutfit, persistenceActions,
    theme, onToggleTheme
}) => {
    // UI State
    const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
    const [isTextureModalOpen, setIsTextureModalOpen] = useState(false);
    const [isCategorizeModalOpen, setIsCategorizeModalOpen] = useState(false);
    const [isEditGarmentModalOpen, setIsEditGarmentModalOpen] = useState(false);
    const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 });
    
    // Layout State
    const [isPanelOpen, setIsPanelOpen] = useState(window.innerWidth > 768);
    const isMobile = window.innerWidth <= 768;

    // Selection State
    const [garmentToCategorize, setGarmentToCategorize] = useState<File | null>(null);
    const [garmentToEdit, setGarmentToEdit] = useState<WardrobeItem | null>(null);
    const [garmentForTexture, setGarmentForTexture] = useState<WardrobeItem | null>(null);
    const [fileForTexture, setFileForTexture] = useState<File | null>(null);
    const [deletingGarment, setDeletingGarment] = useState<WardrobeItem | null>(null);

    // Product Info State
    const [isProductInfoModalOpen, setIsProductInfoModalOpen] = useState(false);
    const [isProductInfoLoading, setIsProductInfoLoading] = useState(false);
    const [productInfoMarkdown, setProductInfoMarkdown] = useState<string | null>(null);
    const [productInfoError, setProductInfoError] = useState<string | null>(null);
    const [productInfoForOutfitKey, setProductInfoForOutfitKey] = useState<string | null>(null);

    // Lookbook State
    const [isLookbookStyleModalOpen, setIsLookbookStyleModalOpen] = useState(false);
    const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);
    const [lookbookImages, setLookbookImages] = useState<LookbookImage[]>([]);
    const [lookbookStyle, setLookbookStyle] = useState<string>('');
    const [lookbookAspectRatio, setLookbookAspectRatio] = useState<string>('3:4');
    const [isLookbookLoading, setIsLookbookLoading] = useState(false);
    const [lookbookError, setLookbookError] = useState<string | null>(null);
    const [regeneratingImageId, setRegeneratingImageId] = useState<string | null>(null);
    const [isLookbookSaved, setIsLookbookSaved] = useState(false);

    // --- Local Handlers ---
    
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

    const handleViewLookbook = (lookbookToView: SavedLookbook) => {
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

    const handleStartOverLocal = () => {
        setFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 });
        onStartOver();
    }

    // --- Configure Tabs ---
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
                    onAddGarment={() => setIsWardrobeOpen(true)} 
                    onGenerateProductInfo={() => handleGenerateProductInfo(false)} 
                    onGenerateLookbook={() => setIsLookbookStyleModalOpen(true)} 
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
                    onViewLookbook={handleViewLookbook} 
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
                    onFilterChange={(newFilters) => setFilters(f => ({ ...f, ...newFilters }))} 
                    onResetFilters={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 })}
                    isDisabled={isVTOLoading} 
                />
            )
        }
    ];

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
                    filters={filters}
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
                <SidePanel tabs={sidePanelTabs} />
            }
            footer={<Footer isOnDressingScreen />}
            modals={
                <StudioModals
                    isWardrobeOpen={isWardrobeOpen}
                    setIsWardrobeOpen={setIsWardrobeOpen}
                    handleGarmentSelect={handleGarmentSelect}
                    handleFileUpload={handleFileUpload}
                    activeOutfitLayers={activeOutfitLayers}
                    isVTOLoading={isVTOLoading}
                    wardrobe={wardrobe}
                    handleEditGarment={handleEditGarment}
                    handleDeleteGarment={handleDeleteGarment}
                    
                    isTextureModalOpen={isTextureModalOpen}
                    setIsTextureModalOpen={setIsTextureModalOpen}
                    handleTextureConfirm={handleTextureConfirm}
                    garmentForTexture={garmentForTexture}
                    
                    isCategorizeModalOpen={isCategorizeModalOpen}
                    setIsCategorizeModalOpen={setIsCategorizeModalOpen}
                    handleCategorizeConfirm={handleCategorizeConfirm}
                    garmentToCategorize={garmentToCategorize}
                    
                    isEditGarmentModalOpen={isEditGarmentModalOpen}
                    setIsEditGarmentModalOpen={setIsEditGarmentModalOpen}
                    handleSaveGarmentEdit={handleSaveGarmentEdit}
                    garmentToEdit={garmentToEdit}
                    
                    deletingGarment={deletingGarment}
                    setDeletingGarment={setDeletingGarment}
                    handleConfirmDeleteGarment={handleConfirmDeleteGarment}
                    
                    isProductInfoModalOpen={isProductInfoModalOpen}
                    setIsProductInfoModalOpen={setIsProductInfoModalOpen}
                    isProductInfoLoading={isProductInfoLoading}
                    productInfoMarkdown={productInfoMarkdown}
                    productInfoError={productInfoError}
                    handleGenerateProductInfo={handleGenerateProductInfo}
                    
                    isLookbookStyleModalOpen={isLookbookStyleModalOpen}
                    setIsLookbookStyleModalOpen={setIsLookbookStyleModalOpen}
                    handleGenerateLookbook={handleGenerateLookbook}
                    isLookbookLoading={isLookbookLoading}
                    
                    isLookbookModalOpen={isLookbookModalOpen}
                    setIsLookbookModalOpen={setIsLookbookModalOpen}
                    lookbookImages={lookbookImages}
                    lookbookError={lookbookError}
                    lookbookStyle={lookbookStyle}
                    lookbookAspectRatio={lookbookAspectRatio}
                    handleRegenerateLookbookImage={handleRegenerateLookbookImage}
                    regeneratingImageId={regeneratingImageId}
                    handleSaveLookbook={handleSaveLookbook}
                    isLookbookSaved={isLookbookSaved}
                    isMobile={isMobile}
                />
            }
        />
    );
};

export default StudioScreen;