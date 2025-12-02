
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState } from 'react';
import JSZip from 'jszip';
import { ImageFormat, convertImage } from '../lib/utils';
import { LookbookImage } from '../types';

interface UseLookbookActionsProps {
    images: LookbookImage[];
    style: string;
}

export const useLookbookActions = ({ images, style }: UseLookbookActionsProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
    const [downloadType, setDownloadType] = useState<'single' | 'all' | null>(null);
    const [imageToDownload, setImageToDownload] = useState<LookbookImage | null>(null);

    const openDownloadSingle = (image: LookbookImage) => {
        setImageToDownload(image);
        setDownloadType('single');
        setIsFormatModalOpen(true);
    };

    const openDownloadAll = () => {
        setDownloadType('all');
        setIsFormatModalOpen(true);
    };

    const handleDownloadSingle = async (format: ImageFormat, image: LookbookImage) => {
        setIsDownloading(true);
        try {
            const { blob, extension } = await convertImage(image.url, format);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Artisan_Batik_Lookbook_${style.replace(/\s/g, '_')}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (e) {
            console.error("Gagal mengunduh gambar:", e);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadAll = async (format: ImageFormat) => {
        setIsDownloading(true);
        const zip = new JSZip();
        
        const downloadPromises = images.map(async (image, index) => {
            try {
                const { blob, extension } = await convertImage(image.url, format);
                zip.file(`Artisan_Batik_Lookbook_${style.replace(/\s/g, '_')}_${index + 1}.${extension}`, blob);
            } catch (e) {
                 console.error(`Gagal mengonversi gambar ${index+1} untuk di-zip:`, e);
            }
        });
        
        await Promise.all(downloadPromises);

        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `Artisan_Batik_Lookbook_${style.replace(/\s/g, '_')}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            setIsDownloading(false);
        });
    };
    
    const handleConfirmDownload = (format: ImageFormat) => {
        setIsFormatModalOpen(false);
        if (downloadType === 'single' && imageToDownload) {
            handleDownloadSingle(format, imageToDownload);
        } else if (downloadType === 'all') {
            handleDownloadAll(format);
        }
    };

    return {
        isDownloading,
        isFormatModalOpen,
        setIsFormatModalOpen,
        downloadType,
        handleConfirmDownload,
        openDownloadSingle,
        openDownloadAll
    };
};
