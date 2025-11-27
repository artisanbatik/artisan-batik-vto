import React from 'react';
import WardrobeModal from '../WardrobeSheet';
import { TextureSelectionModal } from '../modals/TextureSelectionModal';
import { CategorizeGarmentModal } from '../modals/CategorizeGarmentModal';
import { EditGarmentModal } from '../modals/EditGarmentModal';
import ConfirmationDialog from '../AddProductModal';
import ProductInfoModal from '../modals/ProductInfoModal';
import LookbookStyleModal from '../lookbook/LookbookStyleModal';
import LookbookModal from '../lookbook/LookbookModal';
import { WardrobeItem, OutfitLayer, WardrobeCategory, LookbookImage } from '../../types';

interface StudioModalsProps {
    // Wardrobe Modal Props
    isWardrobeOpen: boolean;
    setIsWardrobeOpen: (open: boolean) => void;
    handleGarmentSelect: (file: File, info: WardrobeItem) => void;
    handleFileUpload: (file: File) => void;
    activeOutfitLayers: OutfitLayer[];
    isVTOLoading: boolean;
    wardrobe: WardrobeItem[];
    handleEditGarment: (garment: WardrobeItem) => void;
    handleDeleteGarment: (garment: WardrobeItem) => void;

    // Texture Modal Props
    isTextureModalOpen: boolean;
    setIsTextureModalOpen: (open: boolean) => void;
    handleTextureConfirm: (texture: string) => void;
    garmentForTexture: WardrobeItem | null;

    // Categorize Modal Props
    isCategorizeModalOpen: boolean;
    setIsCategorizeModalOpen: (open: boolean) => void;
    handleCategorizeConfirm: (category: WardrobeCategory) => void;
    garmentToCategorize: File | null;

    // Edit Garment Modal Props
    isEditGarmentModalOpen: boolean;
    setIsEditGarmentModalOpen: (open: boolean) => void;
    handleSaveGarmentEdit: (garment: WardrobeItem) => void;
    garmentToEdit: WardrobeItem | null;

    // Confirmation Dialog Props
    deletingGarment: WardrobeItem | null;
    setDeletingGarment: (garment: WardrobeItem | null) => void;
    handleConfirmDeleteGarment: () => void;

    // Product Info Modal Props
    isProductInfoModalOpen: boolean;
    setIsProductInfoModalOpen: (open: boolean) => void;
    isProductInfoLoading: boolean;
    productInfoMarkdown: string | null;
    productInfoError: string | null;
    handleGenerateProductInfo: (force: boolean) => void;

    // Lookbook Modals Props
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
            <WardrobeModal
                isOpen={props.isWardrobeOpen}
                onClose={() => props.setIsWardrobeOpen(false)}
                onGarmentSelect={props.handleGarmentSelect}
                onFileUpload={props.handleFileUpload}
                activeGarmentIds={props.activeOutfitLayers.map(l => l.garment?.id).filter((id): id is string => !!id)}
                isLoading={props.isVTOLoading}
                wardrobe={props.wardrobe}
                onEditGarment={props.handleEditGarment}
                onDeleteGarment={props.handleDeleteGarment}
            />
            <TextureSelectionModal
                isOpen={props.isTextureModalOpen}
                onClose={() => props.setIsTextureModalOpen(false)}
                onConfirm={props.handleTextureConfirm}
                garment={props.garmentForTexture}
            />
            <CategorizeGarmentModal
                isOpen={props.isCategorizeModalOpen}
                onClose={() => props.setIsCategorizeModalOpen(false)}
                onConfirm={props.handleCategorizeConfirm}
                garmentPreviewUrl={props.garmentToCategorize ? URL.createObjectURL(props.garmentToCategorize) : null}
            />
            <EditGarmentModal
                isOpen={props.isEditGarmentModalOpen}
                onClose={() => props.setIsEditGarmentModalOpen(false)}
                onSave={props.handleSaveGarmentEdit}
                onDelete={props.handleDeleteGarment}
                garment={props.garmentToEdit}
            />
            {props.deletingGarment && (
                <ConfirmationDialog
                    itemType="karya"
                    itemName={props.deletingGarment.name}
                    onConfirm={props.handleConfirmDeleteGarment}
                    onCancel={() => props.setDeletingGarment(null)}
                />
            )}
            <ProductInfoModal 
                isOpen={props.isProductInfoModalOpen}
                onClose={() => props.setIsProductInfoModalOpen(false)}
                isLoading={props.isProductInfoLoading}
                productInfoMarkdown={props.productInfoMarkdown}
                error={props.productInfoError}
                onRegenerate={() => props.handleGenerateProductInfo(true)}
            />
            <LookbookStyleModal
                isOpen={props.isLookbookStyleModalOpen}
                onClose={() => props.setIsLookbookStyleModalOpen(false)}
                onGenerate={props.handleGenerateLookbook}
                isLoading={props.isLookbookLoading}
            />
            <LookbookModal
                isOpen={props.isLookbookModalOpen}
                onClose={() => props.setIsLookbookModalOpen(false)}
                isLoading={props.isLookbookLoading}
                images={props.lookbookImages}
                error={props.lookbookError}
                style={props.lookbookStyle}
                aspectRatio={props.lookbookAspectRatio}
                onRegenerate={props.handleRegenerateLookbookImage}
                regeneratingImageId={props.regeneratingImageId}
                onSave={props.handleSaveLookbook}
                isSaved={props.isLookbookSaved}
                isMobile={props.isMobile}
            />
        </>
    );
};

export default StudioModals;
