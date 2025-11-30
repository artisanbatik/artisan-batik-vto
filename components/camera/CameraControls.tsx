
import React from 'react';
import { SwitchCameraIcon, XIcon } from '../icons';

interface CameraControlsProps {
    onCapture: () => void;
    onSwitchCamera: () => void;
    onClose: () => void;
    isLoading: boolean;
    hasError: boolean;
    hasMultipleCameras: boolean;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
    onCapture,
    onSwitchCamera,
    onClose,
    isLoading,
    hasError,
    hasMultipleCameras
}) => {
    return (
        <>
            {/* Close Button - Top Right */}
            <div className="absolute top-4 right-4 z-30">
                <button 
                    onClick={onClose} 
                    className="p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors backdrop-blur-sm" 
                    aria-label="Tutup kamera"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center z-30 pointer-events-none">
                <div className="flex items-center justify-around w-full max-w-sm pointer-events-auto">
                    {/* Left Spacer for centering */}
                    <div className="w-16 h-16" /> 
                    
                    {/* Shutter Button */}
                    <button 
                        onClick={onCapture}
                        disabled={isLoading || hasError}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center ring-4 ring-white/30 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
                        aria-label="Ambil foto"
                    >
                        <div className="w-[70px] h-[70px] bg-white rounded-full border-2 border-gray-300"></div>
                    </button>
                    
                    {/* Switch Camera Button */}
                    {hasMultipleCameras ? (
                        <button 
                            onClick={onSwitchCamera} 
                            className="w-16 h-16 flex items-center justify-center group" 
                            aria-label="Ganti kamera"
                        >
                            <div className="p-3 bg-white/20 rounded-full text-white group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                                <SwitchCameraIcon className="w-7 h-7" />
                            </div>
                        </button>
                    ) : (
                        <div className="w-16 h-16" />
                    )}
                </div>
            </div>
        </>
    );
};
