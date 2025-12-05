import React from 'react';
import { WardrobePickerModal } from '../../modals/WardrobePickerModal';
import { TextureSelectionModal } from '../../modals/TextureSelectionModal';
import { EditGarmentModal } from '../../modals/EditGarmentModal';
import { ConfirmationDialog } from '../../ui/confirmation-dialog';
import { WardrobeItem, OutfitLayer } from '../../../types';

interface GarmentModalsProps {
    modals: {
        isWardrobeOpen: boolean;
        setIsWardrobeOpen: (open: boolean) => void;
        isTextureModalOpen: boolean;
        setIsTextureModalOpen: (open: boolean) => void;
        isEditGarmentModalOpen: boolean;
        setIsEditGarmentModalOpen: (open: boolean) => void;
    };
    selections: {
        garmentForTexture: WardrobeItem | null;
        garmentToEdit: WardrobeItem | null;
        deletingGarment: WardrobeItem | null;
        setDeletingGarment: (garment: WardrobeItem | null) => void;
    };
    handlers: {
        handleGarmentSelect: (file: File, info: WardrobeItem) => void;
        handleFileUpload: (file: File) => void;
        handleEditGarment: (garment: WardrobeItem) => void;
        handleDeleteGarment: (garment: WardrobeItem) => void;
        handleTextureConfirm: (texture: string) => void;
        handleSaveGarmentEdit: (garment: WardrobeItem) => void;
        handleConfirmDeleteGarment: () => void;
    };
    activeOutfitLayers: OutfitLayer[];
    isVTOLoading: boolean;
    wardrobe: WardrobeItem[];
}

const GarmentModals: React.FC<GarmentModalsProps> = ({ modals, selections, handlers, activeOutfitLayers, isVTOLoading, wardrobe }) => {
    return (
        <>
            <WardrobePickerModal
                isOpen={modals.isWardrobeOpen}
                onClose={() => modals.setIsWardrobeOpen(false)}
                onGarmentSelect={handlers.handleGarmentSelect}
                onFileUpload={handlers.handleFileUpload}
                activeGarmentIds={activeOutfitLayers.map(l => l.garment?.id).filter((id): id is string => !!id)}
                isLoading={isVTOLoading}
                wardrobe={wardrobe}
                onEditGarment={handlers.handleEditGarment}
                onDeleteGarment={handlers.handleDeleteGarment}
            />
            <TextureSelectionModal
                isOpen={modals.isTextureModalOpen}
                onClose={() => modals.setIsTextureModalOpen(false)}
                onConfirm={handlers.handleTextureConfirm}
                garment={selections.garmentForTexture}
            />
            <EditGarmentModal
                isOpen={modals.isEditGarmentModalOpen}
                onClose={() => modals.setIsEditGarmentModalOpen(false)}
                onSave={handlers.handleSaveGarmentEdit}
                onDelete={handlers.handleDeleteGarment}
                garment={selections.garmentToEdit}
            />
            {selections.deletingGarment && (
                <ConfirmationDialog
                    itemType="karya"
                    itemName={selections.deletingGarment.name}
                    onConfirm={handlers.handleConfirmDeleteGarment}
                    onCancel={() => selections.setDeletingGarment(null)}
                />
            )}
        </>
    );
};

export default GarmentModals;
