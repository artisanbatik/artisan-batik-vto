
import React from 'react';
import WardrobeModal from '../../WardrobeSheet';
import { TextureSelectionModal } from '../../modals/TextureSelectionModal';
import { CategorizeGarmentModal } from '../../modals/CategorizeGarmentModal';
import { EditGarmentModal } from '../../modals/EditGarmentModal';
import ConfirmationDialog from '../../AddProductModal';
import { WardrobeItem, OutfitLayer, WardrobeCategory } from '../../../types';

interface GarmentModalsProps {
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
}

const GarmentModals: React.FC<GarmentModalsProps> = (props) => {
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
        </>
    );
};

export default GarmentModals;
