
import React from 'react';
import { Button } from '../ui/button';
import { XIcon } from '../icons';

interface CameraPreviewProps {
    imageSrc: string;
    onRetake: () => void;
    onConfirm: () => void;
    onClose: () => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ 
    imageSrc, 
    onRetake, 
    onConfirm,
    onClose
}) => {
    return (
        <div className="relative w-full h-full bg-black">
             {/* Close Button - Top Right (Consistent with Viewport) */}
             <div className="absolute top-4 right-4 z-30">
                <button 
                    onClick={onClose} 
                    className="p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors backdrop-blur-sm" 
                    aria-label="Tutup kamera"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            <img 
                src={imageSrc} 
                alt="Pratinjau tangkapan" 
                className="w-full h-full object-contain" 
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center z-30 bg-gradient-to-t from-black/80 to-transparent pt-12">
                <div className="flex items-center justify-around w-full max-w-sm gap-4">
                    <Button 
                        onClick={onRetake} 
                        variant="secondary" 
                        className="rounded-full bg-white/10 text-white hover:bg-white/20 border-white/20 px-6 backdrop-blur-md"
                    >
                        Ambil Ulang
                    </Button>
                    <Button 
                        onClick={onConfirm} 
                        variant="default" 
                        className="rounded-full bg-white text-black hover:bg-gray-200 px-6 shadow-lg"
                    >
                        Gunakan Foto
                    </Button>
                </div>
            </div>
        </div>
    );
};
