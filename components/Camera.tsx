
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useCamera } from '../hooks/useCamera';

// Sub-components
import { CameraViewport } from './camera/CameraViewport';
import { CameraOverlay } from './camera/CameraOverlay';
import { CameraControls } from './camera/CameraControls';
import { CameraPreview } from './camera/CameraPreview';

interface CameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const {
      videoRef,
      canvasRef,
      capturedImage,
      error,
      isLoading,
      devices,
      handleCanPlay,
      switchCamera,
      takePhoto,
      retakePhoto,
      confirmPhoto
  } = useCamera();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/95 z-[100] flex flex-col items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className={cn(
          "relative w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10", 
          'aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4]'
      )}>
        
        {capturedImage ? (
            <CameraPreview 
                imageSrc={capturedImage}
                onRetake={retakePhoto}
                onConfirm={() => confirmPhoto(onCapture)}
                onClose={onClose}
            />
        ) : (
            <>
                <CameraViewport 
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    onCanPlay={handleCanPlay}
                />
                
                <CameraOverlay 
                    isLoading={isLoading} 
                    error={error} 
                />
                
                <CameraControls 
                    onCapture={takePhoto}
                    onSwitchCamera={switchCamera}
                    onClose={onClose}
                    isLoading={isLoading}
                    hasError={!!error}
                    hasMultipleCameras={devices.length > 1}
                />
            </>
        )}
      </div>
    </motion.div>
  );
};

export default Camera;
