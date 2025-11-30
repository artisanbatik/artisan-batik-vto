
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState } from 'react';
import { ImageFormat, convertImage } from '../lib/utils';

export const useCanvasActions = () => {
    const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadRequest = () => {
        setIsFormatModalOpen(true);
    };

    const handleConfirmDownload = async (
        format: ImageFormat, 
        currentDisplayImage: string | null, 
        filters: any
    ) => {
        if (!currentDisplayImage) return;
        
        setIsDownloading(true);
        setIsFormatModalOpen(false); // Close modal right away
        
        try {
            const { blob, extension } = await convertImage(currentDisplayImage, format, filters);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `artisan-batik-vto-outfit.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Gagal mengunduh gambar:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return {
        isFormatModalOpen,
        setIsFormatModalOpen,
        isDownloading,
        handleDownloadRequest,
        handleConfirmDownload
    };
};
