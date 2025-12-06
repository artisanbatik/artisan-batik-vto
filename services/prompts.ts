/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { WardrobeItem, OutfitLayer } from "../types";

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
        prompt: "Sebuah acara formal yang elegan, seperti pernikahan, upacara, atau pesta malam. Latar belakangnya megah, pencahayaan indah, dan suasananya istimewa. Pakaian harus terlihat sebagai puncak keanggunan."
    },
};

export const PRODUCT_INFO_SYSTEM_INSTRUCTION = `
Buatkan data produk WooCommerce (judul, deskripsi singkat, deskripsi lengkap, dan tabel detail produk) untuk produk kain batik eksklusif "Artisan Batik".

Instruksi Umum untuk model (system):

1. Bahasa: **Indonesia** santai. Gunakan nada hangat, tidak lebay, artisanal, naratif, dan menyentuh emosi pembeli — bukan berlebihan atau terlampau puitis.
2. Format keluaran harus **persis** mengikuti struktur di bawah (heading Markdown + blok teks dalam triple backticks + tabel Markdown). Jangan tambahkan bagian lain kecuali diminta.
3. Gunakan informasi dari input (foto/mocking/keterangan bahan/kategori). Jika ada gambar, deduksi motif/kondisi warna/jenis kain secukupnya — tidak boleh membuat klaim geografis atau historis tanpa data.
4. Jika ada ketidaksinkronan (mis. bahan disebutkan berbeda dari tag yang biasa dipakai), utamakan **bahan yang dicantumkan oleh pengguna**.

Gunakan referensi nama produk berikut agar konsisten:

- Lurik Biru – Kemeja Batik Sarimbit
- Sekar Jagad – Kemeja Batik Pria
- Parang Sogan – Kemeja Batik Slimfit
- Mega Mendung – Kemeja Batik Formal
- Kawung Hitam – Kemeja Batik Kantor
- Sido Asih – Kemeja Batik Premium
- Truntum Merah – Kemeja Batik Lengan Panjang
- Tambal Biru – Kemeja Batik Lengan Pendek

Catatan pola penamaan:

- Format: \`[Motif atau Koleksi] + [Warna/nuansa] – [Kategori Produk]\`
- Nama pendek, elegan, dan mudah diingat.
- Gunakan sebagai inspirasi agar nama produk Artisan Batik konsisten dengan standar brand premium batik kontemporer.

Keluaran (WAJIB, susun persis seperti ini):

### Nama Produk

\`\`\`
[Motif atau Koleksi] + [Warna/nuansa] – [Kategori Produk]
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
| **Kategori**        | (Pilih salah satu: Kemeja Lengan Panjang, Kemeja Lengan Pendek, Kemeja Slimfit, Kemeja Regular)                                                              |
| **Bahan**           | (Tulis persis bahan yang diberikan: Contoh: "Katun Primissima", "Sutra ATBM Baron")                                                                     |
| **Warna Dominan**   | (HANYA SATU KATA — contoh: Merah, Indigo, Sogan, Coklat, Hitam, Putih, Biru, Hijau, Kuning, Abu, Ungu, Emas, Krem) — **WAJIB**                             |
| **Ukuran**          | S, M, L, XL, XXL                                                                                                                                          |
| **SEO Title**       | (Contoh pola: \`Kemeja Batik Tulis [Kategori] Motif “[Motif]” \| Artisan Batik\` — sertakan merek "Artisan Batik")                                            |
| **SEO Description** | (1 kalimat, 120–160 karakter idealnya). Singkat, jualan, sebutkan bahan + motif + ajakan ringkas.                                                          |
| **Tags**            | (Daftar 5–9 tag, dipisah koma. Sertakan: Batik Tulis, Kemeja Batik, Batik Asli, kategori produk, motif spesifik (contoh: Motif Macan), bahan/kelompok: Premium) |
\`\`\`
\`\`\`

Aturan Validasi (model harus melakukan cek):

- **Kategori** hanya boleh satu dari opsi kemeja yang disebut. Jika tidak jelas, gunakan \`Kemeja Regular\` sebagai default.
- **Warna Dominan** harus 1 kata. Jika input berupa frasa warna (mis. "merah marun"), ringkas jadi satu kata terdekat seperti \`Merah\` atau \`Burgundy\` hanya jika kata tersebut memang satu kata.
- **Ukuran**: Selalu sediakan rentang ukuran standar.
- **SEO Title** harus mengandung kata kunci: \`Kemeja Batik Tulis\` atau \`Kemeja Batik\`, motif dalam tanda kutip dan \`| Artisan Batik\` di akhir.
- **SEO Description** jangan memuat klaim medis, klaim kepemilikan daerah/warisan tanpa bukti, atau kata-kata negatif.
- **Tags** maksimal 9 item; hindari kata yang tidak relevan.

Aturan Gaya & Nada:

- Hangat, sopan, artisanal, bernuansa storytelling.
- Jangan berbohong/menyatakan "100% asli" kecuali itu benar dan diberikan.
- Gunakan metafora ringan (api, senja, tenun tangan), tapi pantengin keaslian.
- Boleh menyisip emoji tanpa berlebihan di deskripsi (opsional).

Contoh Template Output (untuk model gunakan sebagai blueprint — PRODUKSI HARUS MENGIKUTI FORMAT INI):

\`\`\`
### Nama Produk

\`\`\`
Macan Senja – Kemeja Batik Lengan Panjang
\`\`\`

### Deskripsi Singkat

\`\`\`
Kemeja Batik "Macan Senja" ini kami hadirkan untuk menemani langkah Anda dengan hangat. Motif macan yang dibatik dengan tangan dalam nuansa merah senja, semoga memberi sentuhan percaya diri dan energi positif tanpa kehilangan kelembutan hati.
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
| **Kategori**        | Kemeja Lengan Panjang                                                                                                                                             |
| **Bahan**           | Katun Primissima                                                                                                                                                  |
| **Warna Dominan**   | Merah                                                                                                                                                             |
| **Ukuran**          | S, M, L, XL, XXL                                                                                                                                                  |
| **SEO Title**       | Kemeja Batik Tulis Lengan Panjang Motif “Macan Senja” \| Artisan Batik                                                                                            |
| **SEO Description** | Temukan Kemeja Batik Tulis “Macan Senja”. Sebuah karya seni eksklusif dengan motif macan yang dilukis tangan di atas katun primissima yang halus. Miliki ceritanya. |
| **Tags**            | Batik Tulis, Kemeja Batik, Batik Asli, Kemeja Pria, Motif Harimau, Motif Macan, Katun Primissima, Premium, Merah                                                 |
\`\`\`
\`\`\`
`;

export const constructModelGenPrompt = (backgroundColor: string): string => {
    return `Generate a professional photo of a fashion model standing in a studio.
The background MUST be a solid color with hex code ${backgroundColor}.
The model should be looking at the camera with a neutral but pleasant expression.
Ensure the lighting is soft and even, suitable for e-commerce.`;
};

export const constructVTOPrompt = (garmentInfo: WardrobeItem, texture: string = 'Cotton'): string => {
    return `Perform a realistic virtual try-on.
The user has provided an image of a person (first image) and a garment image (second image).
Dress the person in the provided garment.
Garment details:
- Name: ${garmentInfo.name}
- Category: ${garmentInfo.category}
- Material/Texture: ${texture} (e.g., Batik fabric)

Maintain the person's pose, facial features, and the background exactly as they are.
Ensure the fabric drapes naturally on the body, respecting gravity and folds.
The lighting on the garment should match the lighting on the person.
If the garment is a Batik shirt, ensure the pattern is preserved and mapped correctly to the body shape.`;
};

export const getOutfitDescription = (layers: OutfitLayer[]): string => {
    if (layers.length <= 1) return "a basic outfit";
    
    const descriptions = layers.slice(1).map(layer => {
        const name = layer.garment?.name || "garment";
        const texture = layer.texture || "fabric";
        const category = layer.garment?.category || "clothing";
        return `${texture} ${category} (${name})`;
    });

    return descriptions.join(", ");
};

export const constructPoseVariationPrompt = (activeLayers: OutfitLayer[], poseInstruction: string): string => {
    const outfitDescription = getOutfitDescription(activeLayers);
    
    return `Generate a new image of the person from the input image, but change their pose.
Target Pose: ${poseInstruction}.
The person is wearing: ${outfitDescription}.

Crucial Requirements:
1. KEEP the same person (face, hair, body type).
2. KEEP the same outfit details (patterns, textures, style).
3. KEEP the same background.
4. ONLY change the pose to match the target instruction.
5. Ensure the clothing deforms naturally with the new pose.`;
};

export const constructLookbookPrompt = (
    outfitDescription: string, 
    shotType: string, 
    variation: string, 
    customPrompt?: string
): string => {
    let base = `Fashion editorial photography. Shot type: ${shotType}.
The model is wearing: ${outfitDescription}.
Scene/Vibe: ${variation}.`;

    if (customPrompt) {
        base += `\nAdditional instructions: ${customPrompt}`;
    }

    base += `\nEnsure high quality, photorealistic, 8k resolution, highly detailed texture of the Batik fabric.`;
    return base;
};

export const constructRegenerateLookbookPrompt = (
    outfitDescription: string, 
    shotType: string, 
    refinementPrompt: string
): string => {
    return `Edit the provided lookbook image.
Context: ${shotType}.
The model is wearing: ${outfitDescription}.
User Refinement Request: ${refinementPrompt}.

Maintain the identity of the model and the details of the outfit.
Apply the requested changes (e.g., lighting, background elements, expression) while keeping the core subject consistent.`;
};
