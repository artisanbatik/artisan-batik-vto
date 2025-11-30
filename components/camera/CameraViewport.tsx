
import React, { RefObject } from 'react';
import { cn } from '../../lib/utils';

interface CameraViewportProps {
    videoRef: RefObject<HTMLVideoElement>;
    canvasRef: RefObject<HTMLCanvasElement>;
    onCanPlay: () => void;
    className?: string;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({ 
    videoRef, 
    canvasRef, 
    onCanPlay,
    className 
}) => {
    return (
        <div className={cn("relative w-full h-full overflow-hidden bg-black", className)}>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
                onCanPlay={onCanPlay}
            />
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
