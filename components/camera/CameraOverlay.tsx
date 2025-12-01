
import React from 'react';
import Spinner from '../ui/spinner';
import { Text } from '../ui/typography';

interface CameraOverlayProps {
    isLoading: boolean;
    error: string | null;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ isLoading, error }) => {
    if (error) {
        return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 text-center animate-fade-in">
                <Text variant="large" className="font-semibold text-red-400 mb-2">Kesalahan Kamera</Text>
                <Text variant="muted" className="text-stone-300 text-sm max-w-xs">{error}</Text>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
                <Spinner className="text-white w-10 h-10" />
                <Text variant="large" className="text-white mt-4 font-serif tracking-wide">Memulai kamera...</Text>
            </div>
        );
    }

    return null;
};
