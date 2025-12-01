/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { WardrobeItem, OutfitLayer } from "../types";
import { ensureDataUrl } from "../lib/utils";
import { 
    constructModelGenPrompt,
    constructVTOPrompt, 
    constructPoseVariationPrompt, 
    getOutfitDescription, 
    constructLookbookPrompt, 
    constructRegenerateLookbookPrompt,
    SHOT_TYPES,
    PRODUCT_INFO_SYSTEM_INSTRUCTION
} from "./prompts";

// Re-export constants for UI consumption
export { SHOT_TYPES };

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Permintaan diblokir. Alasan: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    // Find the first image part in any candidate
    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Pembuatan gambar berhenti secara tidak terduga. Alasan: ${finishReason}. Ini sering terkait dengan pengaturan keamanan.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `Model AI tidak mengembalikan gambar. ` + (textFeedback ? `Model merespons dengan teks: "${textFeedback}"` : "Ini bisa terjadi karena filter keamanan atau jika permintaan terlalu rumit. Silakan coba gambar lain.");
    throw new Error(errorMessage);
};

const handleTextApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Permintaan diblokir. Alasan: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }
    const text = response.text;
    if (text) {
        return text;
    }
    const finishReason = response.candidates?.[0]?.finishReason;
    const errorMessage = `Model AI tidak mengembalikan teks. Alasan berhenti: ${finishReason || 'Tidak diketahui'}.`;
    throw new Error(errorMessage);
}


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const imageModel = 'gemini-2.5-flash-image';
const proModel = 'gemini-2.5-pro';

/**
 * Wraps an API call with a retry mechanism, including exponential backoff.
 * @param apiCall The asynchronous function to call.
 * @param functionName The name of the function for logging purposes.
 * @returns The result of the API call.
 */
const withRetries = async <T>(apiCall: () => Promise<T>, functionName: string): Promise<T> => {
    const MAX_ATTEMPTS = 3;
    let lastError: Error | null = null;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        try {
            return await apiCall(); // Attempt the API call
        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${i + 1} of ${MAX_ATTEMPTS} for ${functionName} failed.`, error);

            const lowerCaseError = lastError.message.toLowerCase();
            // Don't retry on safety blocks, as it will likely fail again.
            if (lowerCaseError.includes("permintaan diblokir") || lowerCaseError.includes("safety")) {
                break;
            }

            if (i < MAX_ATTEMPTS - 1) {
                // Exponential backoff
                const delay = 500 * Math.pow(2, i);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }

    // If all retries fail or we break early
    console.error(`Gemini API call failed permanently in ${functionName}:`, lastError);
    throw lastError;
};


export const generateModelImage = async (userImage: File, backgroundColor: string = '#f0f0f0', aspectRatio: string): Promise<string> => {
    return withRetries(async () => {
        const userImagePart = await fileToPart(userImage);
        const prompt = constructModelGenPrompt(backgroundColor);
        
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: [userImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings,
                imageConfig: {
                    aspectRatio,
                },
            },
        });
        return handleApiResponse(response);
    }, 'generateModelImage');
};

export const refineModelImage = async (baseModelUrl: string, prompt: string, aspectRatio: string): Promise<string> => {
    return withRetries(async () => {
        const modelImageDataUrl = await ensureDataUrl(baseModelUrl);
        const modelImagePart = dataUrlToPart(modelImageDataUrl);
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: [modelImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings,
                imageConfig: {
                    aspectRatio,
                },
            },
        });
        return handleApiResponse(response);
    }, 'refineModelImage');
};

export const generateVirtualTryOnImage = async (modelImageUrl: string, garmentImage: File, garmentInfo: WardrobeItem, texture?: string): Promise<string> => {
    return withRetries(async () => {
        const modelImageDataUrl = await ensureDataUrl(modelImageUrl);
        const modelImagePart = dataUrlToPart(modelImageDataUrl);
        const garmentImagePart = await fileToPart(garmentImage);
        
        const prompt = constructVTOPrompt(garmentInfo, texture);
        
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: [modelImagePart, garmentImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings,
            },
        });
        return handleApiResponse(response);
    }, 'generateVirtualTryOnImage');
};

export const generatePoseVariation = async (tryOnImageUrl: string, poseInstruction: string, activeLayers: OutfitLayer[]): Promise<string> => {
    return withRetries(async () => {
        const tryOnImageDataUrl = await ensureDataUrl(tryOnImageUrl);
        const tryOnImagePart = dataUrlToPart(tryOnImageDataUrl);
        
        const prompt = constructPoseVariationPrompt(activeLayers, poseInstruction);

        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: [tryOnImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings,
            },
        });
        return handleApiResponse(response);
    }, 'generatePoseVariation');
};

// --- Lookbook Generation ---

export const generateLookbookImages = async (
    baseImageUrl: string,
    outfitLayers: OutfitLayer[],
    shotType: string,
    variation: string,
    aspectRatio: string,
    customPrompt?: string
): Promise<string> => {
    return withRetries(async () => {
        const baseImageDataUrl = await ensureDataUrl(baseImageUrl);
        const imagePart = dataUrlToPart(baseImageDataUrl);
        const outfitDescription = getOutfitDescription(outfitLayers);
        const prompt = constructLookbookPrompt(outfitDescription, shotType, variation, customPrompt);

        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings,
                imageConfig: {
                    aspectRatio,
                },
            },
        });
        return handleApiResponse(response);
    }, 'generateLookbookImages');
};

export const regenerateLookbookImage = async (
    previousImageUrl: string,
    outfitLayers: OutfitLayer[],
    shotType: string,
    refinementPrompt: string,
    aspectRatio: string
): Promise<string> => {
    return withRetries(async () => {
        const previousImageDataUrl = await ensureDataUrl(previousImageUrl);
        const imagePart = dataUrlToPart(previousImageDataUrl);
        const outfitDescription = getOutfitDescription(outfitLayers);
        const prompt = constructRegenerateLookbookPrompt(outfitDescription, shotType, refinementPrompt);

        const response = await ai.models.generateContent({
            model: imageModel,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings,
                imageConfig: {
                    aspectRatio,
                },
            },
        });
        return handleApiResponse(response);
    }, 'regenerateLookbookImage');
};


// --- PRODUCT INFO GENERATION ---

export const generateProductInformation = async (
    baseImageUrl: string,
    activeLayers: OutfitLayer[],
): Promise<string> => {
    return withRetries(async () => {
        const baseImageDataUrl = await ensureDataUrl(baseImageUrl);
        const imagePart = dataUrlToPart(baseImageDataUrl);
        const outfitDetails = activeLayers
            .slice(1) // skip base model
            .map(layer => `- ${layer.garment?.name} (Kategori: ${layer.garment?.category}, Bahan: ${layer.texture})`)
            .join('\n');
            
        const userPrompt = `
Berikut adalah detail untuk koleksi yang ditampilkan dalam gambar:
${outfitDetails}

Harap hasilkan data produk berdasarkan detail ini dan gambar yang disediakan.
`;

        const response = await ai.models.generateContent({
            model: proModel,
            contents: { parts: [imagePart, { text: userPrompt }] },
            config: {
                systemInstruction: PRODUCT_INFO_SYSTEM_INSTRUCTION,
                safetySettings,
            }
        });

        return handleTextApiResponse(response);
    }, 'generateProductInformation');
};
