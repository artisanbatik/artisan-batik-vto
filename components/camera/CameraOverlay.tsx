
import React from 'react';
import Spinner from '../ui/spinner';

interface CameraOverlayProps {
    isLoading: boolean;
    error: string | null;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ isLoading, error }) => {
    if (error) {
        return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center">
                <p className="font-semibold text-lg text-red-400">Kesalahan Kamera</p>
                <p className="text-gray-300 mt-2 text-sm">{error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-20 bg-black/50 flex flex-col items-center justify-center">
                <Spinner className="text-white w-8 h-8" />
                <p className="text-white mt-4 font-serif">Memulai kamera...</p>
            </div>
        );
    }

    return null;
};
