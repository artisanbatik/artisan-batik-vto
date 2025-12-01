
import React from 'react';
import { SwitchCameraIcon, XIcon, CameraIcon } from '../icons';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

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
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white backdrop-blur-sm border-none w-10 h-10"
                    aria-label="Tutup kamera"
                >
                    <XIcon className="w-6 h-6" />
                </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center z-30 pointer-events-none">
                <div className="flex items-center justify-around w-full max-w-sm pointer-events-auto gap-4">
                    {/* Left Spacer or Gallery Button (Future) */}
                    <div className="w-14 h-14" /> 
                    
                    {/* Shutter Button - Custom styling maintained for specific interaction but wrapped in structure */}
                    <button 
                        onClick={onCapture}
                        disabled={isLoading || hasError}
                        className={cn(
                            "w-20 h-20 bg-white rounded-full flex items-center justify-center ring-4 ring-white/30 transition-all shadow-lg focus:outline-none",
                            "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        aria-label="Ambil foto"
                    >
                        <div className="w-[70px] h-[70px] bg-white rounded-full border-2 border-stone-300" />
                    </button>
                    
                    {/* Switch Camera Button */}
                    <div className="w-14 h-14 flex items-center justify-center">
                        {hasMultipleCameras && (
                            <Button
                                onClick={onSwitchCamera}
                                variant="ghost"
                                size="icon"
                                className="w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white backdrop-blur-sm border-none"
                                aria-label="Ganti kamera"
                            >
                                <SwitchCameraIcon className="w-6 h-6" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
