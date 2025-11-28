
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState } from 'react';
import { generateModelImage, refineModelImage } from '../services/geminiService';
import { getFriendlyErrorMessage } from '../lib/utils';

export const useModelGenerator = () => {
    const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
    const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateModel = async (file: File, backgroundColor: string, aspectRatio: string) => {
        if (!file.type.startsWith('image/')) {
            setError('Silakan pilih file gambar.');
            return;
        }

        // Preview local image immediately
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            setUserImageUrl(dataUrl);
            
            // Start generation
            setIsGenerating(true);
            setGeneratedModelUrl(null);
            setError(null);
            try {
                const result = await generateModelImage(file, backgroundColor, aspectRatio);
                setGeneratedModelUrl(result);
            } catch (err) {
                setError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal membuat model'));
                setUserImageUrl(null);
            } finally {
                setIsGenerating(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const refineModel = async (refinementType: 'pose' | 'background', backgroundColor: string, aspectRatio: string) => {
        if (!generatedModelUrl) return;

        setIsRefining(true);
        setError(null);
        let prompt = '';
        if (refinementType === 'pose') {
            prompt = `Gunakan gambar model yang disediakan sebagai referensi, buat ulang dengan pose berdiri yang sedikit berbeda namun tetap elegan. Pertahankan identitas, fitur wajah, tipe tubuh, dan latar belakang yang sama persis. Hanya variasikan posenya secara halus.`;
        } else if (refinementType === 'background') {
            prompt = `Gunakan gambar model yang disediakan sebagai referensi, buat ulang gambar tersebut dengan orang dan pose yang sama persis. SATU-SATUNYA perubahan adalah latar belakang, yang HARUS berupa latar studio solid dengan kode hex yang sama persis ini: ${backgroundColor}.`;
        }

        try {
            const newUrl = await refineModelImage(generatedModelUrl, prompt, aspectRatio);
            setGeneratedModelUrl(newUrl);
        } catch (err) {
            setError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal menyempurnakan model'));
        } finally {
            setIsRefining(false);
        }
    };

    const reset = () => {
        setUserImageUrl(null);
        setGeneratedModelUrl(null);
        setIsGenerating(false);
        setError(null);
    };

    return {
        userImageUrl,
        generatedModelUrl,
        isGenerating,
        isRefining,
        error,
        generateModel,
        refineModel,
        reset,
        setUserImageUrl // Exposed for cases like Camera capture where we get dataURL directly, though ideally we pass File
    };
};
