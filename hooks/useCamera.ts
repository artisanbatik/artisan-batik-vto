
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect, useRef, useCallback } from 'react';

export const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const cleanup = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }, [stream]);

    const startCamera = useCallback(async (deviceId?: string) => {
        setIsLoading(true);
        setError(null);
        
        // Stop any existing stream before starting a new one
        if (stream) {
             stream.getTracks().forEach(track => track.stop());
        }

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
            const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
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
    }, [stream]); // Depend on stream to cleanup properly

    // Initial setup
    useEffect(() => {
        const getDevicesAndStart = async () => {
            try {
                // Request permission first to list devices labels
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
                setIsLoading(false); // Stop loading if init fails
            }
        };

        getDevicesAndStart();

        return () => {
             // We can't easily call cleanup() here because it depends on state that might be stale in cleanup function,
             // but we can manually stop tracks if we had a ref to the stream.
             // Relying on the startCamera cleanup logic for switching and simple unmount cleanup.
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);


    const handleCanPlay = () => {
        setIsLoading(false);
    };

    const switchCamera = () => {
        if (devices.length < 2) return;
        const currentIndex = devices.findIndex(device => device.deviceId === activeDeviceId);
        const nextIndex = (currentIndex + 1) % devices.length;
        const nextDeviceId = devices[nextIndex].deviceId;
        setActiveDeviceId(nextDeviceId);
        startCamera(nextDeviceId);
    };

    const takePhoto = () => {
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

    const retakePhoto = () => {
        setCapturedImage(null);
    };
    
    const confirmPhoto = (onCapture: (file: File) => void) => {
        if (!capturedImage) return;
        fetch(capturedImage)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
            });
    };

    return {
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
    };
};
