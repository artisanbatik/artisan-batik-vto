
import React from 'react';
import LookbookStyleModal from '../../lookbook/LookbookStyleModal';
import LookbookModal from '../../lookbook/LookbookModal';
import { LookbookImage } from '../../../types';

interface LookbookModalsProps {
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

const LookbookModals: React.FC<LookbookModalsProps> = (props) => {
    return (
        <>
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

export default LookbookModals;
