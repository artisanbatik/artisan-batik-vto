/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { XIcon, SwitchCameraIcon } from './icons';
import Spinner from './Spinner';
import { cn } from '../lib/utils';

interface CameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    
    const cleanup = () => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
    
    const startCamera = async (deviceId?: string) => {
        setIsLoading(true);
        setError(null);
        cleanup();

        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    facingMode: 'user',
                    width: { ideal: 1080 },
                    height: { ideal: 1920 },
                },
                audio: false,
            };
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(currentStream);
            if (videoRef.current) {
                videoRef.current.srcObject = currentStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError('Izin kamera ditolak. Harap aktifkan di pengaturan peramban Anda.');
                } else {
                    setError('Tidak dapat mengakses kamera. Pastikan kamera tidak sedang digunakan oleh aplikasi lain.');
                }
            }
        } 
    };
    
    const getDevicesAndStart = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            const initialDeviceId = activeDeviceId || videoDevices[0]?.deviceId;
            setActiveDeviceId(initialDeviceId);
            await startCamera(initialDeviceId);
        } catch (err) {
             console.error("Error getting devices or starting camera:", err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError('Izin kamera ditolak. Harap aktifkan di pengaturan peramban Anda.');
                } else {
                    setError('Tidak dapat mengakses kamera. Pastikan kamera tidak sedang digunakan oleh aplikasi lain.');
                }
            }
        }
    };

    getDevicesAndStart();

    return () => {
        cleanup();
    };
  }, [activeDeviceId]);

  const handleCanPlay = () => {
    setIsLoading(false);
  };
  
  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(device => device.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setActiveDeviceId(devices[nextIndex].deviceId);
  };

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
        const trackSettings = stream?.getVideoTracks()[0]?.getSettings();
        const isFrontCamera = trackSettings?.facingMode === 'user';
        
        if (isFrontCamera) {
            context.translate(video.videoWidth, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
    }
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirmPhoto = () => {
    if (!capturedImage) return;
    fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
        });
  };

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
            <div className="flex items-center justify-around w-full max-w-sm">
                <button onClick={handleRetake} className="text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors">Ambil Ulang</button>
                <button onClick={handleConfirmPhoto} className="text-black font-semibold bg-white px-6 py-3 rounded-full hover:bg-gray-200 transition-colors">Gunakan Foto</button>
            </div>
        ) : (
            <div className="flex items-center justify-around w-full max-w-sm">
                <div className="w-16 h-16" /> {/* Spacer */}
                <button 
                  onClick={handleTakePhoto}
                  disabled={isLoading || !!error}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center ring-4 ring-white/30 disabled:opacity-50"
                  aria-label="Ambil foto"
                >
                    <div className="w-[70px] h-[70px] bg-white rounded-full active:bg-gray-200"></div>
                </button>
                {devices.length > 1 ? (
                  <button onClick={handleSwitchCamera} className="w-16 h-16 flex items-center justify-center" aria-label="Ganti kamera">
                    <div className="p-3 bg-white/20 rounded-full text-white">
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