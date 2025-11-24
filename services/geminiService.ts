/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { WardrobeItem, OutfitLayer } from "../types";
import { ensureDataUrl } from "../lib/utils";

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

export const SHOT_TYPES = {
    'Lookbook (Editorial)': {
        description: "Artistic, stylized shots for showcasing a collection.",
        prompt: "Sebuah pemotretan lookbook editorial yang artistik dan canggih. Fokus pada komposisi yang menarik, pencahayaan dramatis, dan pose high-fashion. Pikirkan sampul majalah."
    },
    'Everyday Use (Lifestyle Guide)': {
        description: "Showcasing the outfit in natural, relatable daily situations.",
        prompt: "Sebuah adegan gaya hidup yang santai dan alami. Model berada di lingkungan sehari-hari yang nyaman, seperti kafe yang trendi, berjalan-jalan di taman kota, atau menjelajahi pasar lokal. Tangkap momen candid yang terasa otentik."
    },
    'Office / Work': {
        description: "Presenting the outfit in a professional, work-related environment.",
        prompt: "Lingkungan kantor modern yang profesional dan penuh gaya. Latar belakangnya bisa berupa lobi yang dirancang dengan baik, ruang kerja minimalis, atau saat istirahat kopi. Pakaian harus terlihat rapi dan cocok untuk bekerja."
    },
    'Events': {
        description: "The outfit in the context of a general event or social gathering.",
        prompt: "Sebuah acara sosial yang meriah atau pertemuan. Suasananya bisa berupa pembukaan galeri seni, pesta kebun sore hari, atau pertemuan santai dengan teman-teman. Fokus pada interaksi dan suasana yang hidup."
    },
    'Family Gathering': {
        description: "Warm, candid shots suitable for family-oriented events.",
        prompt: "Suasana pertemuan keluarga yang hangat dan intim. Pikirkan momen candid saat perayaan, makan bersama, atau sekadar bersantai di rumah yang nyaman. Pencahayaan harus lembut dan mengundang."
    },
    'Special Moments (Occasion Guide)': {
        description: "Elegant, elevated shots for formal events like weddings or ceremonies.",
        prompt: "Sebuah acara formal yang elegan, seperti pernikahan, upacara, atau pesta malam. Latar belakangnya megah, pencahayaannya indah, dan suasananya istimewa. Pakaian harus ditampilkan sebagai puncak keanggunan."
    },
};

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
        const prompt = `**Tujuan Utama:** Buat foto model fesyen ¾ badan (dari kepala hingga sekitar lutut) yang fotorealistis untuk merek mewah Artisan Batik.
**Subjek:** Gunakan orang dari gambar yang disediakan. Pertahankan identitas, fitur unik, dan tipe tubuh mereka.
**Pakaian (PENTING):** Ubah pakaian yang dikenakan orang tersebut menjadi **pakaian dasar berwarna PUTIH POLOS** (seperti kaos putih polos dan celana/rok putih). Jangan ada pola, logo, atau warna lain pada pakaian.
**Pose & Ekspresi:** Tempatkan mereka dalam pose model berdiri standar yang santai dan elegan dengan ekspresi netral yang percaya diri.
**Latar Belakang:** Latar belakang HARUS berupa latar studio bersih berwarna solid menggunakan kode hex yang sama persis ini: ${backgroundColor}.
**Aturan Penting:**
1. **Framing:** Gambar akhir HARUS berupa **potret ¾ badan**, menampilkan model dari kepala hingga sekitar area lutut. JANGAN menampilkan seluruh badan.
2. **Tanpa Teks:** Gambar yang dihasilkan TIDAK BOLEH mengandung teks, logo, atau watermark apa pun.
**Keluaran:** Kembalikan HANYA file gambar akhir. Jangan sertakan teks atau penjelasan apa pun dalam respons Anda.`;
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
        
        let prompt: string;

        if (garmentInfo.category === 'accessory') {
            const rules = [
                "**Pertahankan Pakaian yang Ada:** JANGAN mengganti atau mengubah pakaian yang sudah dikenakan orang tersebut. Aksesori harus ditempatkan di atas atau sebagai tambahan pada pakaian mereka saat ini.",
                "**Pertahankan Model:** Wajah, rambut, bentuk tubuh, dan pose orang dari 'gambar model' HARUS tetap tidak berubah.",
                "**Pertahankan Latar Belakang:** Seluruh latar belakang dari 'gambar model' HARUS dipertahankan dengan sempurna.",
            ];

            if (texture) {
                rules.push(`**Terapkan Tekstur Secara Realistis:** Aksesori HARUS dirender dengan tekstur **${texture}** yang fotorealistis, menonjolkan kualitas premium dari bahan tersebut.`);
            }

            rules.push("**Terapkan Aksesori:** Pasang aksesori secara realistis pada orang tersebut. Aksesori harus memiliki bayangan dan pencahayaan alami yang konsisten dengan adegan aslinya, menonjolkan keahlian pembuatannya.");
            rules.push("**Keluaran:** Kembalikan HANYA gambar akhir yang telah diedit. Jangan sertakan teks apa pun.");

            const numberedRules = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

            prompt = `Anda adalah AI ahli coba-pakai virtual untuk merek mewah Artisan Batik. Anda akan diberikan 'gambar model' dan 'gambar aksesori batik'. Tugas Anda adalah menambahkan aksesori batik dari 'gambar aksesori' secara realistis ke orang di 'gambar model'.

**Aturan Penting:**
${numberedRules}`;
        } else {
            const rules = [
                "**Penggantian Pakaian Lengkap:** Anda HARUS sepenuhnya MENGHAPUS dan MENGGANTI item pakaian yang dikenakan oleh orang di 'gambar model' dengan pakaian batik baru.",
                "**Keaslian Batik:** Pakaian baru HARUS terlihat seperti batik tulis asli buatan tangan. Tampilkan ketidaksempurnaan yang halus, tekstur organik, dan keunikan yang berasal dari keahlian tangan. HINDARI tampilan yang datar, digital, atau 'tercetak'.",
            ];

            if (garmentInfo.category === 'top' || garmentInfo.category === 'outerwear' || garmentInfo.category === 'dress') {
                rules.push("**Perhatian Khusus pada Kerah & Detail:** Untuk atasan (kemeja, gaun, luaran), berikan perhatian **ekstra** pada area kerah, plaket (garis kancing), dan manset. Pola batik pada area ini HARUS menyambung secara alami dan akurat dengan pola pada badan pakaian, seolah-olah dipotong dari kain yang sama. Hindari kerah polos atau detail dengan pola yang tidak cocok.");
            }

            rules.push("**Pertahankan Model:** Wajah, rambut, bentuk tubuh, dan pose orang dari 'gambar model' HARUS tetap tidak berubah.");
            rules.push("**Pertahankan Latar Belakang:** Seluruh latar belakang dari 'gambar model' HARUS dipertahankan dengan sempurna.");

            if (texture) {
                rules.push(`**Terapkan Tekstur Secara Realistis:** Pakaian batik baru HARUS dirender dengan tekstur **${texture}** yang fotorealistis. Perhatikan dengan sangat detail bagaimana kain tersebut menjuntai dan terlipat di tubuh model, mencerminkan kualitasnya.`);
            }

            rules.push("**Keluaran:** Kembalikan HANYA gambar akhir yang telah diedit. Jangan sertakan teks apa pun.");

            const numberedRules = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

            prompt = `Anda adalah AI ahli coba-pakai virtual untuk merek mewah Artisan Batik. Anda akan diberikan 'gambar model' dan 'gambar pakaian batik'. Tugas Anda adalah membuat gambar fotorealistis baru di mana orang dari 'gambar model' mengenakan karya batik dari 'gambar pakaian'.

**Aturan Penting:**
${numberedRules}`;
        }
        
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
        const outfitDescription = activeLayers
            .slice(1)
            .map(layer => `- Sebuah ${layer.garment?.name} yang terbuat dari ${layer.texture || 'bahan premium'}.`)
            .join('\n');

        const prompt = `Anda adalah seorang fotografer fesyen ahli dan AI simulasi fisika untuk merek Artisan Batik. Tugas Anda adalah meregenerasi gambar seseorang dalam pose baru sambil mempertahankan realisme absolut dari pakaian batik mereka.

**Masukan:** Gambar seseorang yang mengenakan pakaian Artisan Batik.

**Konteks Pakaian:** Orang dalam gambar mengenakan item berikut:
${outfitDescription || '- Pakaian batik mereka saat ini.'}

**Instruksi:**
1.  **Pose Baru:** Regenerasi gambar yang menunjukkan orang tersebut dalam pose baru yang elegan dan sama persis ini: "${poseInstruction}".
2.  **Pertahankan Identitas:** Identitas orang, fitur wajah unik, tipe tubuh, dan gaya latar belakang HARUS tetap IDENTIK dengan gambar asli.
3.  **Juntaian Realistis (Paling Penting):** Berdasarkan konteks pakaian, simulasikan bagaimana kain batik akan secara realistis menjuntai, terlipat, dan tergantung di tubuh orang tersebut dalam pose baru. Patuhi prinsip-prinsip fisika untuk kain premium buatan tangan.
4.  **Keluaran:** Kembalikan HANYA gambar akhir yang fotorealistis. Jangan sertakan teks apa pun.`;

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

export const getOutfitDescription = (activeLayers: OutfitLayer[]): string => {
    return activeLayers
        .slice(1)
        .map(layer => `- Sebuah ${layer.garment?.name} dibuat dari ${layer.texture || 'kain premium'}, menampilkan motif batik tulis asli yang rumit.`)
        .join('\n') || '- Pakaian batik mereka saat ini.';
};

// --- Lookbook Generation ---
export const constructLookbookPrompt = (
    outfitDescription: string,
    shotType: string,
    variation: string,
    customPrompt?: string
): string => {
    const customInstruction = customPrompt 
        ? `**Instruksi Kustom Pengguna (Prioritas Utama):**\n${customPrompt}`
        : `**Instruksi Variasi Spesifik untuk Foto Ini:**\n${variation}`;

    return `
Anda adalah seorang direktur kreatif AI dan fotografer profesional untuk Artisan Batik, sebuah merek fesyen mewah Indonesia. Keahlian Anda adalah menciptakan gambar-gambar berkualitas editorial yang fotorealistis, terasa otentik, hangat, dan khas Indonesia.

**Tugas:**
Buat **satu** foto OOTD (Outfit of the Day) yang unik berdasarkan gambar model yang mengenakan pakaian tertentu.

**Deskripsi Pakaian:**
${outfitDescription}

**Gaya & Konteks Umum:**
${shotType}

${customInstruction}

**Aturan Ketat:**
1.  **FOTOREALISME ADALAH UTAMA:** Gambar akhir harus terlihat seperti foto asli, bukan hasil generasi AI.
2.  **JAGA IDENTITAS:** Wajah, rambut, bentuk tubuh, dan etnis model HARUS tetap identik dengan gambar masukan. JANGAN mengubah orangnya.
3.  **JAGA PAKAIAN:** Pakaian batik HARUS dipertahankan dengan sempurna—pola, warna, tekstur, dan cara jatuhnya di tubuh model.
4.  **NUANSA INDONESIA:** Adegan, latar belakang, dan pencahayaan baru harus membangkitkan suasana Indonesia yang canggih dan alami. Gunakan elemen-elemen seperti:
    -   **Pencahayaan:** Hangat, alami, cahaya senja keemasan.
    -   **Lokasi:** Kafe elegan dengan furnitur rotan, lobi kantor modern dengan aksen kayu jati, taman tropis yang rimbun, beranda rumah tradisional Jawa (joglo), galeri seni minimalis.
    -   **Properti:** Kerajinan tangan Indonesia, pot keramik, tanaman tropis (monstera, daun pisang).
5.  **ADEGAN KONTEKSTUAL:** Adegan yang dihasilkan HARUS sesuai dengan gaya & konteks yang dipilih.
6.  **FORMAT KELUARAN:** Kembalikan HANYA gambar akhir. Tanpa teks, tanpa deskripsi, tanpa markdown.
`;
};

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

export const constructRegenerateLookbookPrompt = (
    outfitDescription: string,
    shotType: string,
    refinementPrompt: string
): string => {
    return `
Anda adalah seorang editor foto AI dan direktur kreatif untuk merek fesyen mewah Artisan Batik.

**Tugas:**
Buat ulang gambar yang disediakan berdasarkan instruksi penyempurnaan dari pengguna, sambil mempertahankan esensi dan kualitas aslinya.

**Deskripsi Pakaian dalam Gambar:**
${outfitDescription}

**Gaya & Konteks Asli:**
${shotType}

**Instruksi Penyempurnaan dari Pengguna (Prioritas Utama):**
"${refinementPrompt}"

**Aturan Ketat:**
1.  **IKUTI INSTRUKSI PENGGUNA:** Terapkan perubahan yang diminta dalam prompt penyempurnaan secara akurat.
2.  **PERTAHANKAN ELEMEN INTI:** Jaga agar orang dan pakaian tetap konsisten dengan gambar asli, kecuali diinstruksikan sebaliknya.
3.  **REALISME & KUALITAS:** Hasilnya harus fotorealistis dan berkualitas editorial tinggi.
4.  **FORMAT KELUARAN:** Kembalikan HANYA gambar yang telah dibuat ulang. Tanpa teks.
`;
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
const PRODUCT_INFO_SYSTEM_INSTRUCTION = `
Buatkan data produk WooCommerce (judul, deskripsi singkat, deskripsi lengkap, dan tabel detail produk) untuk produk kain batik eksklusif "Artisan Batik".

Instruksi Umum untuk model (system):

1. Bahasa: **Indonesia** santai. Gunakan nada hangat, tidak lebay, artisanal, naratif, dan menyentuh emosi pembeli — bukan berlebihan atau terlampau puitis.
2. Format keluaran harus **persis** mengikuti struktur di bawah (heading Markdown + blok teks dalam triple backticks + tabel Markdown). Jangan tambahkan bagian lain kecuali diminta.
3. Gunakan informasi dari input (foto/mocking/keterangan bahan/kategori). Jika ada gambar, deduksi motif/kondisi warna/jenis kain secukupnya — tidak boleh membuat klaim geografis atau historis tanpa data.
4. Jika ada ketidaksinkronan (mis. bahan disebutkan berbeda dari tag yang biasa dipakai), utamakan **bahan yang dicantumkan oleh pengguna**.

Gunakan referensi nama produk berikut agar konsisten:

- Lurik Biru – Kain Batik Sarimbit
- Sekar Jagad – Kain Batik Selendang
- Parang Sogan – Kain Batik Sarimbit
- Mega Mendung – Kain Batik Pola Kemeja
- Kawung Hitam – Kain Batik Pola Kemeja
- Sido Asih – Kain Batik Sarung Wanita
- Truntum Merah – Kain Batik Sarimbit
- Tambal Biru – Kain Batik Selendang
- Gringsing Emas – Kain Batik Pola Kemeja
- Macan Senja – Kain Batik Sarung Wanita

Catatan pola penamaan:

- Format: \`[Motif atau Koleksi] + [Warna/nuansa] – [Kategori Produk]\`
- Nama pendek, elegan, dan mudah diingat.
- Gunakan sebagai inspirasi agar nama produk Artisan Batik konsisten dengan standar brand premium batik kontemporer.

Keluaran (WAJIB, susun persis seperti ini):

### Nama Produk

\`\`\`
[Motif atau Koleksi] + [Warna/nuansa] – Kain Batik [Kategori Produk]
\`\`\`

Nama pendek, elegan, dan mudah diingat.

### Deskripsi Singkat

\`\`\`
(1–2 kalimat). Kalimat bersifat evocative — menyebut motif, warna dominan (kata tunggal), dan nuansa pemakaian.
\`\`\`

### Deskripsi Lengkap

\`\`\`
(Maks. 4–6 paragraf pendek). Harus memuat:
- Pembuka yang hangat dan puitis singkat.
- Subjudul **Cerita Hangat di Balik Goresan** (tebalkan seperti contoh) dan 1–2 paragraf cerita/filosofi motif.
- Detil teknis singkat tentang bahan & tekstur (pakai bahan yang diberikan).
- Saran penggunaan / momen pakai.
- Tutup berupa doa/harapan/penitipan nilai (boleh sisip 1 emoji di akhir, optional).
\`\`\`

### Detail Produk

\`\`\`
| Atribut             | Keterangan                                                                                                                                                |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kategori**        | (Pilih salah satu: Pola Kemeja, Sarimbit, Sarung Wanita, Selendang)                                                                                      |
| **Bahan**           | (Tulis persis bahan yang diberikan: Contoh: "Katun Primissima", "Sutra ATBM Baron")                                                                     |
| **Warna Dominan**   | (HANYA SATU KATA — contoh: Merah, Indigo, Sogan, Coklat, Hitam, Putih, Biru, Hijau, Kuning, Abu, Ungu, Emas, Krem) — **WAJIB**                             |
| **Ukuran**          | (Pilih 1 sesuai kategori)
|                     | - Kain Batik: ±260x115 cm, 250x115 cm, 250x105 cm                                                                                                         |
|                     | - Sarung Wanita: ±230x115 cm                                                                                                                                 |
|                     | - Selendang: ±250x105 cm                                                                                                                                    |
| **SEO Title**       | (Contoh pola: \`Kain Batik Tulis [Kategori] Motif “[Motif]” \| Artisan Batik\` — sertakan merek "Artisan Batik")                                            |
| **SEO Description** | (1 kalimat, 120–160 karakter idealnya). Singkat, jualan, sebutkan bahan + motif + ajakan ringkas.                                                          |
| **Tags**            | (Daftar 5–9 tag, dipisah koma. Sertakan: Batik Tulis, Kain Batik, Batik Asli, kategori produk, motif spesifik (contoh: Motif Macan), bahan/kelompok: Premium) |
\`\`\`
\`\`\`

Aturan Validasi (model harus melakukan cek):

- **Kategori** hanya boleh satu dari empat opsi yang disebut. Jika input lain diberikan, pilih yang paling mendekati; jika tidak jelas, gunakan \`Pola Kemeja\` sebagai default.
- **Warna Dominan** harus 1 kata. Jika input berupa frasa warna (mis. "merah marun"), ringkas jadi satu kata terdekat seperti \`Merah\` atau \`Burgundy\` hanya jika kata tersebut memang satu kata.
- **Ukuran**: pilih satu ukuran yang sesuai kategori. Jangan membuat ukuran lain.
- **SEO Title** harus mengandung kata kunci: \`Kain Batik Tulis\` atau \`Kain Batik\`, motif dalam tanda kutip dan \`| Artisan Batik\` di akhir.
- **SEO Description** jangan memuat klaim medis, klaim kepemilikan daerah/warisan tanpa bukti, atau kata-kata negatif.
- **Tags** maksimal 9 item; hindari kata yang tidak relevan (mis. kata bahasa asing yang tidak umum tanpa alasan).

Aturan Gaya & Nada:

- Hangat, sopan, artisanal, bernuansa storytelling.
- Jangan berbohong/menyatakan "100% asli" kecuali itu benar dan diberikan.
- Gunakan metafora ringan (api, senja, tenun tangan), tapi pantengin keaslian.
- Boleh menyisip emoji tanpa berlebihan di deskripsi (opsional).

Penanganan Input Foto / Mockup:

- Jika ada foto: tangkap elemen motif utama (hewan, bunga, geometris) dan gunakan motif itu sebagai basis nama koleksi jika pengguna belum memberikan nama.

  - Contoh: foto harimau → motif "Macan" → nama koleksi bisa jadi "Macan Senja", "Harimau Senja", "Macan Lazuardi", dsb.

- Tulis juga **Alt Text singkat** (1 baris, ≤125 karakter) untuk gambar: deskripsikan motif + bahan + nuansa (contoh: "Motif macan merah di katun primissima, nuansa senja").
- Jangan mendeskripsikan model (jika ada) secara identitas (umur, etnis) — cukup "model" atau "mockup".

Contoh Template Output (untuk model gunakan sebagai blueprint — PRODUKSI HARUS MENGIKUTI FORMAT INI):

\`\`\`
### Nama Produk

\`\`\`
Macan Senja – Kain Batik Pola Kemeja
\`\`\`

### Deskripsi Singkat

\`\`\`
Kain Batik "Macan Senja" ini kami hadirkan untuk menemani langkah Anda dengan hangat. Motif macan yang dibatik dengan tangan dalam nuansa merah senja, semoga memberi sentuhan percaya diri dan energi positif tanpa kehilangan kelembutan hati.
\`\`\`

### Deskripsi Lengkap

\`\`\`
Saat para pembatik kami menorehkan motif macan ini, ada sebuah harapan di dalam hati mereka: semoga yang mengenakannya selalu diliputi semangat dan keberanian dalam menjalani hari.

**Cerita Hangat di Balik Goresan**

Bagi kami, macan bukanlah soal kegarangan, tapi tentang kekuatan yang tenang, kepemimpinan yang bijaksana, dan keberanian untuk menjadi diri sendiri. Ia kami gambar sedang duduk tenang di antara indahnya bunga, sebagai pengingat bahwa kekuatan terbesar selalu datang dengan kelembutan hati.

Warna merahnya kami pilih bukan untuk mencolok, melainkan untuk memberi kehangatan, seperti 'api' semangat yang menyala dengan tulus. Ini adalah cerita yang kami coba sampaikan lewat setiap titik dan garis malam di atas kain katun primissima yang halus ini.

Kami membayangkannya dipakai di momen-pomen penuh semangat, atau saat Anda ingin merasa sedikit lebih berani dari biasanya.

Ini adalah cerita, doa, dan semangat yang kami titipkan untuk Anda. 😊
\`\`\`

### Detail Produk

\`\`\`
| Atribut             | Keterangan                                                                                                                                                        |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kategori**        | Pola Kemeja                                                                                                                                                       |
| **Bahan**           | Katun Primissima                                                                                                                                                  |
| **Warna Dominan**   | Merah                                                                                                                                                             |
| **Ukuran**          | ±260x115 cm                                                                                                                                                       |
| **SEO Title**       | Kain Batik Tulis Pola Kemeja Motif “Macan Senja” \| Artisan Batik                                                                                                 |
| **SEO Description** | Temukan Kain Batik Tulis “Macan Senja”. Sebuah karya seni eksklusif dengan motif macan yang dilukis tangan di atas katun primissima yang halus. Miliki ceritanya. |
| **Tags**            | Batik Tulis, Kain Batik, Batik Asli, Kemeja Batik Tulis, Motif Harimau, Motif Macan, Katun Primissima, Premium                                                     |
\`\`\`
\`\`\`

Catatan Tambahan untuk Integrasi WooCommerce / CSV:

- Pastikan output dapat diparse: setiap bagian harus ada heading yang sama dan blok triple-backtick.
- Atribut must be consistent (category, material, dominant color, size).

Fallbacks (jika data terbatas):

- Jika motif/tipe tidak jelas dari input, berikan nama motif generik yang elegan (contoh: "Srikandi Senja", "Macan Senja").
- Jika bahan tidak disebutkan, gunakan teks: "Bahan: tidak disebutkan" di kolom Bahan.
- Jika warna dominan tidak bisa dipastikan, pilih kata yang paling menonjol di gambar atau sebutkan "Netral" sebagai alternatif — namun upayakan memilih satu kata warna.

Instruksi akhir:

- Keluaran harus langsung siap copy-paste ke field WooCommerce (judul, short desc, long desc, attributes). Buatlah ringkas, konsisten, dan mudah dibaca.
- Tidak perlu menjelaskan proses pembuatan atau menanyakan klarifikasi — hasilkan versi terbaik berdasarkan input yang tersedia.
`;

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