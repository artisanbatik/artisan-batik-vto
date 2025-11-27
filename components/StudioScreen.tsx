
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getFriendlyErrorMessage, resizeImage, urlToFile } from '../lib/utils';
import { OutfitLayer, WardrobeItem, SavedOutfit, WardrobeCategory, LookbookImage, SavedLookbook } from '../types';
import { generateProductInformation, generateLookbookImages, regenerateLookbookImage, SHOT_TYPES } from '../services/geminiService';

// Components
import Canvas from './Canvas';
import SidePanel from './SidePanel';
import BottomSheet from './ui/BottomSheet';
import WardrobeModal from './WardrobeSheet';
import { CategorizeGarmentModal } from './modals/CategorizeGarmentModal';
import { EditGarmentModal } from './modals/EditGarmentModal';
import { TextureSelectionModal } from './modals/TextureSelectionModal';
import ProductInfoModal from './modals/ProductInfoModal'; // Ensure this path is correct based on previous file structure or assumption
import LookbookStyleModal from './lookbook/LookbookStyleModal';
import LookbookModal from './lookbook/LookbookModal';
import Footer from './Footer';
import ConfirmationDialog from './AddProductModal';
import { ChevronRightIcon, ChevronLeftIcon, SlidersIcon, XIcon } from './icons';

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
    
    // Complex Actions (Passed from App because they use hook-specific logic)
    handleGenerateVTO: (garmentFile: File, garmentInfo: WardrobeItem, texture: string) => Promise<void>;
    handleSaveOutfit: () => void;
    handleLoadOutfit: (outfit: SavedOutfit) => void;
    
    persistenceActions: any; // Ideally strictly typed, but for refactoring speed using any based on App.tsx usage

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
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(window.innerWidth > 768);
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

    // --- Product Info Logic ---
    const getOutfitKey = (layers: OutfitLayer[]): string => {
        return layers.slice(1).map(l => `${l.garment?.id ?? 'none'}:${l.texture ?? 'default'}`).join('|');
    };

    const handleGenerateProductInfo = async (forceRegenerate = false) => {
      if (activeOutfitLayers.length <= 1) return;
      const currentOutfitKey = getOutfitKey(activeOutfitLayers);
      
      // Check cache first if not forced
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

    // --- Lookbook Logic ---
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

    return (
        <div className="w-screen h-screen bg-stone-200 dark:bg-stone-900 flex flex-col md:flex-row font-sans relative overflow-hidden">
            <main className="flex-grow h-full w-full relative">
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
                
                {/* Mobile Toggle Studio Button */}
                {isMobile && !isRightPanelOpen && (
                    <button onClick={() => setIsRightPanelOpen(true)} className="fixed bottom-20 right-4 z-30 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 font-semibold py-3 px-5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
                        <SlidersIcon className="w-5 h-5" /> Studio
                    </button>
                )}

                {/* Error Toast */}
                {(vtoError || loadingError) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
                    {vtoError || loadingError}
                    <button onClick={() => { setVtoError(null); setLoadingError(null); }} className="ml-4 font-bold">X</button>
                  </motion.div>
                )}
            </main>

            {/* Desktop Side Panel */}
            {!isMobile && (
                <aside className={cn("bg-stone-100 dark:bg-stone-950 font-sans flex flex-col z-50 transition-all duration-300 ease-in-out relative border-l border-stone-300/80 dark:border-stone-800/80", isRightPanelOpen ? 'w-1/4 min-w-[320px] max-w-[420px]' : 'w-16')}>
                    <div className="p-4 flex-shrink-0 flex items-center justify-between border-b border-stone-300/50 dark:border-stone-800/50">
                        <AnimatePresence>{isRightPanelOpen && (<motion.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-2xl font-serif tracking-widest text-stone-800 dark:text-stone-200">Koleksi Anda</motion.h2>)}</AnimatePresence>
                        <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors">
                            {isRightPanelOpen ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <AnimatePresence>
                        {isRightPanelOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow overflow-y-auto h-full">
                                <SidePanel 
                                    history={history}
                                    currentIndex={currentIndex}
                                    savedOutfits={savedOutfits}
                                    savedLookbooks={savedLookbooks}
                                    filters={filters}
                                    isVTOLoading={isVTOLoading}
                                    onUndo={() => undo((id) => persistenceActions.deleteWardrobeItem(id))}
                                    onSaveOutfit={handleSaveOutfit}
                                    onAddGarment={() => setIsWardrobeOpen(true)}
                                    onGenerateProductInfo={() => handleGenerateProductInfo(false)}
                                    onGenerateLookbook={() => setIsLookbookStyleModalOpen(true)}
                                    onLoadOutfit={handleLoadOutfit}
                                    onDeleteOutfit={persistenceActions.deleteOutfit}
                                    onRenameOutfit={persistenceActions.renameOutfit}
                                    onViewLookbook={handleViewLookbook}
                                    onDeleteLookbook={persistenceActions.deleteLookbook}
                                    onRenameLookbook={persistenceActions.renameLookbook}
                                    onJumpToState={jumpToState}
                                    onFilterChange={(newFilters) => setFilters(f => ({ ...f, ...newFilters }))}
                                    onResetFilters={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 })}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>
            )}

            {/* Mobile Bottom Sheet */}
            {isMobile && (
                <BottomSheet isOpen={isRightPanelOpen} onClose={() => setIsRightPanelOpen(false)}>
                    <div className="pt-8 p-4 flex-shrink-0 flex items-center justify-between border-b border-stone-300/50 dark:border-stone-800/50">
                        <h2 className="text-2xl font-serif tracking-widest text-stone-800 dark:text-stone-200">Studio Anda</h2>
                        <button onClick={() => setIsRightPanelOpen(false)} className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        <SidePanel 
                            history={history}
                            currentIndex={currentIndex}
                            savedOutfits={savedOutfits}
                            savedLookbooks={savedLookbooks}
                            filters={filters}
                            isVTOLoading={isVTOLoading}
                            onUndo={() => undo((id) => persistenceActions.deleteWardrobeItem(id))}
                            onSaveOutfit={handleSaveOutfit}
                            onAddGarment={() => setIsWardrobeOpen(true)}
                            onGenerateProductInfo={() => handleGenerateProductInfo(false)}
                            onGenerateLookbook={() => setIsLookbookStyleModalOpen(true)}
                            onLoadOutfit={handleLoadOutfit}
                            onDeleteOutfit={persistenceActions.deleteOutfit}
                            onRenameOutfit={persistenceActions.renameOutfit}
                            onViewLookbook={handleViewLookbook}
                            onDeleteLookbook={persistenceActions.deleteLookbook}
                            onRenameLookbook={persistenceActions.renameLookbook}
                            onJumpToState={jumpToState}
                            onFilterChange={(newFilters) => setFilters(f => ({ ...f, ...newFilters }))}
                            onResetFilters={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 })}
                        />
                    </div>
                </BottomSheet>
            )}

            <Footer isOnDressingScreen />

            {/* Modals Manager */}
            <WardrobeModal
                isOpen={isWardrobeOpen}
                onClose={() => setIsWardrobeOpen(false)}
                onGarmentSelect={handleGarmentSelect}
                onFileUpload={handleFileUpload}
                activeGarmentIds={activeOutfitLayers.map(l => l.garment?.id).filter((id): id is string => !!id)}
                isLoading={isVTOLoading}
                wardrobe={wardrobe}
                onEditGarment={handleEditGarment}
                onDeleteGarment={handleDeleteGarment}
            />
            <TextureSelectionModal
                isOpen={isTextureModalOpen}
                onClose={() => setIsTextureModalOpen(false)}
                onConfirm={handleTextureConfirm}
                garment={garmentForTexture}
            />
            <CategorizeGarmentModal
                isOpen={isCategorizeModalOpen}
                onClose={() => setIsCategorizeModalOpen(false)}
                onConfirm={handleCategorizeConfirm}
                garmentPreviewUrl={garmentToCategorize ? URL.createObjectURL(garmentToCategorize) : null}
            />
            <EditGarmentModal
                isOpen={isEditGarmentModalOpen}
                onClose={() => setIsEditGarmentModalOpen(false)}
                onSave={handleSaveGarmentEdit}
                onDelete={handleDeleteGarment}
                garment={garmentToEdit}
            />
            {deletingGarment && (
                <ConfirmationDialog
                    itemType="karya"
                    itemName={deletingGarment.name}
                    onConfirm={handleConfirmDeleteGarment}
                    onCancel={() => setDeletingGarment(null)}
                />
            )}
            {/* Note: ProductInfoModal is imported assuming the file exists from previous context or needs to be created. 
                Using the definition from App.tsx inline for now if not available as separate file, 
                but ideally should be separate. Assuming separate for clean refactor. 
            */}
             <ProductInfoModal 
                isOpen={isProductInfoModalOpen}
                onClose={() => setIsProductInfoModalOpen(false)}
                isLoading={isProductInfoLoading}
                productInfoMarkdown={productInfoMarkdown}
                error={productInfoError}
                onRegenerate={() => handleGenerateProductInfo(true)}
            />

            <LookbookStyleModal
                isOpen={isLookbookStyleModalOpen}
                onClose={() => setIsLookbookStyleModalOpen(false)}
                onGenerate={handleGenerateLookbook}
                isLoading={isLookbookLoading}
            />

            <LookbookModal
                isOpen={isLookbookModalOpen}
                onClose={() => setIsLookbookModalOpen(false)}
                isLoading={isLookbookLoading}
                images={lookbookImages}
                error={lookbookError}
                style={lookbookStyle}
                aspectRatio={lookbookAspectRatio}
                onRegenerate={handleRegenerateLookbookImage}
                regeneratingImageId={regeneratingImageId}
                onSave={handleSaveLookbook}
                isSaved={isLookbookSaved}
                isMobile={isMobile}
            />
        </div>
    );
};

export default StudioScreen;
