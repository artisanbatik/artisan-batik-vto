
import React from 'react';
import GarmentModals from './modals/GarmentModals';
import LookbookModals from './modals/LookbookModals';
import ProductInfoModals from './modals/ProductInfoModals';
import { WardrobeItem, OutfitLayer, WardrobeCategory, LookbookImage } from '../../types';

interface StudioModalsProps {
    // Garment Props
    isWardrobeOpen: boolean;
    setIsWardrobeOpen: (open: boolean) => void;
    handleGarmentSelect: (file: File, info: WardrobeItem) => void;
    handleFileUpload: (file: File) => void;
    activeOutfitLayers: OutfitLayer[];
    isVTOLoading: boolean;
    wardrobe: WardrobeItem[];
    handleEditGarment: (garment: WardrobeItem) => void;
    handleDeleteGarment: (garment: WardrobeItem) => void;

    isTextureModalOpen: boolean;
    setIsTextureModalOpen: (open: boolean) => void;
    handleTextureConfirm: (texture: string) => void;
    garmentForTexture: WardrobeItem | null;

    isCategorizeModalOpen: boolean;
    setIsCategorizeModalOpen: (open: boolean) => void;
    handleCategorizeConfirm: (category: WardrobeCategory) => void;
    garmentToCategorize: File | null;

    isEditGarmentModalOpen: boolean;
    setIsEditGarmentModalOpen: (open: boolean) => void;
    handleSaveGarmentEdit: (garment: WardrobeItem) => void;
    garmentToEdit: WardrobeItem | null;

    deletingGarment: WardrobeItem | null;
    setDeletingGarment: (garment: WardrobeItem | null) => void;
    handleConfirmDeleteGarment: () => void;

    // Product Info Props
    isProductInfoModalOpen: boolean;
    setIsProductInfoModalOpen: (open: boolean) => void;
    isProductInfoLoading: boolean;
    productInfoMarkdown: string | null;
    productInfoError: string | null;
    handleGenerateProductInfo: (force: boolean) => void;

    // Lookbook Props
    isLookbookStyleModalOpen: boolean;
    setIsLookbookStyleModalOpen: (open: boolean) => void;
    handleGenerateLookbook: (style: string, aspectRatio: string, customPrompt?: string) => void;
    isLookbookLoading: boolean;

    isLookbookModalOpen: boolean;
    setIsLookbookModalOpen: (open: boolean) => void;
    lookbookImages: LookbookImage[];
    lookbookError: string | null;
    lookbookStyle: string;
    lookbookAspectRatio: string;
    handleRegenerateLookbookImage: (image: LookbookImage, prompt: string) => void;
    regeneratingImageId: string | null;
    handleSaveLookbook: () => void;
    isLookbookSaved: boolean;
    isMobile: boolean;
}

const StudioModals: React.FC<StudioModalsProps> = (props) => {
    return (
        <>
            <GarmentModals 
                isWardrobeOpen={props.isWardrobeOpen}
                setIsWardrobeOpen={props.setIsWardrobeOpen}
                handleGarmentSelect={props.handleGarmentSelect}
                handleFileUpload={props.handleFileUpload}
                activeOutfitLayers={props.activeOutfitLayers}
                isVTOLoading={props.isVTOLoading}
                wardrobe={props.wardrobe}
                handleEditGarment={props.handleEditGarment}
                handleDeleteGarment={props.handleDeleteGarment}
                isTextureModalOpen={props.isTextureModalOpen}
                setIsTextureModalOpen={props.setIsTextureModalOpen}
                handleTextureConfirm={props.handleTextureConfirm}
                garmentForTexture={props.garmentForTexture}
                isCategorizeModalOpen={props.isCategorizeModalOpen}
                setIsCategorizeModalOpen={props.setIsCategorizeModalOpen}
                handleCategorizeConfirm={props.handleCategorizeConfirm}
                garmentToCategorize={props.garmentToCategorize}
                isEditGarmentModalOpen={props.isEditGarmentModalOpen}
                setIsEditGarmentModalOpen={props.setIsEditGarmentModalOpen}
                handleSaveGarmentEdit={props.handleSaveGarmentEdit}
                garmentToEdit={props.garmentToEdit}
                deletingGarment={props.deletingGarment}
                setDeletingGarment={props.setDeletingGarment}
                handleConfirmDeleteGarment={props.handleConfirmDeleteGarment}
            />

            <ProductInfoModals 
                isProductInfoModalOpen={props.isProductInfoModalOpen}
                setIsProductInfoModalOpen={props.setIsProductInfoModalOpen}
                isProductInfoLoading={props.isProductInfoLoading}
                productInfoMarkdown={props.productInfoMarkdown}
                productInfoError={props.productInfoError}
                handleGenerateProductInfo={props.handleGenerateProductInfo}
            />

            <LookbookModals 
                isLookbookStyleModalOpen={props.isLookbookStyleModalOpen}
                setIsLookbookStyleModalOpen={props.setIsLookbookStyleModalOpen}
                handleGenerateLookbook={props.handleGenerateLookbook}
                isLookbookLoading={props.isLookbookLoading}
                isLookbookModalOpen={props.isLookbookModalOpen}
                setIsLookbookModalOpen={props.setIsLookbookModalOpen}
                lookbookImages={props.lookbookImages}
                lookbookError={props.lookbookError}
                lookbookStyle={props.lookbookStyle}
                lookbookAspectRatio={props.lookbookAspectRatio}
                handleRegenerateLookbookImage={props.handleRegenerateLookbookImage}
                regeneratingImageId={props.regeneratingImageId}
                handleSaveLookbook={props.handleSaveLookbook}
                isLookbookSaved={props.isLookbookSaved}
                isMobile={props.isMobile}
            />
        </>
    );
};

export default StudioModals;
