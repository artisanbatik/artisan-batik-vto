
import React from 'react';
import LookbookStyleModal from '../../lookbook/LookbookStyleModal';
import LookbookModal from '../../lookbook/LookbookModal';
import { LookbookImage } from '../../../types';

interface LookbookModalsProps {
    modals: {
        isLookbookStyleModalOpen: boolean;
        setIsLookbookStyleModalOpen: (open: boolean) => void;
        isLookbookModalOpen: boolean;
        setIsLookbookModalOpen: (open: boolean) => void;
    };
    lookbook: {
        images: LookbookImage[];
        style: string;
        aspectRatio: string;
        isLoading: boolean;
        error: string | null;
        regeneratingId: string | null;
        isSaved: boolean;
    };
    handlers: {
        handleGenerateLookbook: (style: string, aspectRatio: string, customPrompt?: string) => void;
        handleRegenerateLookbookImage: (image: LookbookImage, prompt: string) => void;
        handleSaveLookbook: () => void;
    };
    isMobile: boolean;
}

const LookbookModals: React.FC<LookbookModalsProps> = ({ modals, lookbook, handlers, isMobile }) => {
    return (
        <>
            <LookbookStyleModal
                isOpen={modals.isLookbookStyleModalOpen}
                onClose={() => modals.setIsLookbookStyleModalOpen(false)}
                onGenerate={handlers.handleGenerateLookbook}
                isLoading={lookbook.isLoading}
            />
            <LookbookModal
                isOpen={modals.isLookbookModalOpen}
                onClose={() => modals.setIsLookbookModalOpen(false)}
                isLoading={lookbook.isLoading}
                images={lookbook.images}
                error={lookbook.error}
                style={lookbook.style}
                aspectRatio={lookbook.aspectRatio}
                onRegenerate={handlers.handleRegenerateLookbookImage}
                regeneratingImageId={lookbook.regeneratingId}
                onSave={handlers.handleSaveLookbook}
                isSaved={lookbook.isSaved}
                isMobile={isMobile}
            />
        </>
    );
};

export default LookbookModals;
