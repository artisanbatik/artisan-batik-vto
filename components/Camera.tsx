/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { XIcon, SwitchCameraIcon } from './icons';
import Spinner from './ui/spinner';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useCamera } from '../hooks/useCamera';

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
      className="fixed inset-0 bg-gray-900/90 z-[100] flex flex-col items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
        <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="absolute top-4 right-4 z-20">
        <button onClick={onClose} className="p-2 bg-black/30 rounded-full text-white hover:bg-black/50" aria-label="Tutup kamera">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <div className={cn("relative w-full max-w-2xl bg-black rounded-lg overflow-hidden shadow-2xl", 'aspect-[3/4]')}>
        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
            <p className="font-semibold text-lg">Kesalahan Kamera</p>
            <p className="text-gray-300">{error}</p>
          </div>
        ) : (
            <>
              {capturedImage ? (
                <img src={capturedImage} alt="Pratinjau tangkapan" className="w-full h-full object-contain" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" onCanPlay={handleCanPlay}></video>
              )}
              
              {(isLoading) && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                      <Spinner className="text-white" />
                      <p className="text-white mt-4 font-serif">Memulai kamera...</p>
                  </div>
              )}
            </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center z-20">
        {capturedImage ? (
            <div className="flex items-center justify-around w-full max-w-sm gap-4">
                <Button onClick={retakePhoto} variant="secondary" className="rounded-full bg-white/10 text-white hover:bg-white/20 border-white/20 px-6">Ambil Ulang</Button>
                <Button onClick={() => confirmPhoto(onCapture)} variant="default" className="rounded-full bg-white text-black hover:bg-gray-200 px-6">Gunakan Foto</Button>
            </div>
        ) : (
            <div className="flex items-center justify-around w-full max-w-sm">
                <div className="w-16 h-16" /> {/* Spacer */}
                <button 
                  onClick={takePhoto}
                  disabled={isLoading || !!error}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center ring-4 ring-white/30 disabled:opacity-50 transition-transform active:scale-95"
                  aria-label="Ambil foto"
                >
                    <div className="w-[70px] h-[70px] bg-white rounded-full border-2 border-gray-300"></div>
                </button>
                {devices.length > 1 ? (
                  <button onClick={switchCamera} className="w-16 h-16 flex items-center justify-center" aria-label="Ganti kamera">
                    <div className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
                        <SwitchCameraIcon className="w-7 h-7" />
                    </div>
                  </button>
                ) : (
                  <div className="w-16 h-16" />
                )}
            </div>
        )}
      </div>
    </motion.div>
  );
};

export default Camera;