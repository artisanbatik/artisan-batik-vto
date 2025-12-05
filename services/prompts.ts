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
        prompt: "Sebuah acara formal yang elegan, seperti pernikahan, upacara, atau pesta malam. Latar belakangnya megah, pencahayaan indah, dan suasananya istimewa. Pakaian harus ditampilkan sebagai puncak keanggunan."
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
| **Tags**            | Batik Tulis, Kemeja Batik, Batik Asli, Kemeja Pria, Motif Harimau, Motif Macan, Katun Primissima, Premium                                                         |
\`\`\`
\`\`\`

Fallbacks (jika data terbatas):

- Jika motif/tipe tidak jelas dari input, berikan nama motif generik yang elegan.
- Jika bahan tidak disebutkan, gunakan teks: "Bahan: tidak disebutkan" di kolom Bahan.
- Jika warna dominan tidak bisa dipastikan, pilih kata yang paling menonjol di gambar.

Instruksi akhir:

- Keluaran harus langsung siap copy-paste ke field WooCommerce.
`;

export const constructModelGenPrompt = (backgroundColor: string) => {
    return `**Tujuan Utama:** Buat foto model pria/wanita ¾ badan (dari kepala hingga sekitar lutut) yang fotorealistis untuk merek mewah Artisan Batik.
**Subjek:** Gunakan orang dari gambar yang disediakan. Pertahankan identitas, fitur unik, dan tipe tubuh mereka.
**Pakaian (PENTING):** Ubah pakaian yang dikenakan orang tersebut menjadi **kaos putih polos dan celana bahan netral**. Jangan ada pola, logo, atau warna mencolok pada pakaian.
**Pose & Ekspresi:** Tempatkan mereka dalam pose model berdiri standar yang santai dan elegan dengan ekspresi netral yang percaya diri.
**Latar Belakang:** Latar belakang HARUS berupa latar studio bersih berwarna solid menggunakan kode hex yang sama persis ini: ${backgroundColor}.
**Aturan Penting:**
1. **Framing:** Gambar akhir HARUS berupa **potret ¾ badan**, menampilkan model dari kepala hingga sekitar area lutut. JANGAN menampilkan seluruh badan.
2. **Tanpa Teks:** Gambar yang dihasilkan TIDAK BOLEH mengandung teks, logo, atau watermark apa pun.
**Keluaran:** Kembalikan HANYA file gambar akhir. Jangan sertakan teks atau penjelasan apa pun dalam respons Anda.`;
};

export const constructVTOPrompt = (garmentInfo: WardrobeItem, texture?: string) => {
    const rules = [
        "**Penggantian Menjadi Kemeja Batik:** Anda HARUS sepenuhnya MENGHAPUS atasan (baju/kaos) yang dikenakan oleh orang di 'gambar model' dan MENGGANTINYA dengan **KEMEJA BATIK** baru yang dibuat dari pola di 'gambar pakaian batik'.",
        "**Keaslian Batik:** Kemeja baru HARUS terlihat seperti kemeja batik tulis asli buatan tangan. Tampilkan ketidaksempurnaan yang halus, tekstur organik, dan keunikan yang berasal dari keahlian tangan. HINDARI tampilan yang datar, digital, atau 'tercetak'.",
        "**Detail Kemeja:** Berikan perhatian **ekstra** pada area kerah kemeja, plaket (garis kancing), dan manset lengan. Pola batik pada area ini HARUS menyambung secara alami dan akurat dengan pola pada badan kemeja, seolah-olah dipotong dari kain yang sama. Buat kerah kemeja yang tajam dan rapi.",
        "**Pertahankan Model:** Wajah, rambut, bentuk tubuh, dan pose orang dari 'gambar model' HARUS tetap tidak berubah.",
        "**Pertahankan Latar Belakang:** Seluruh latar belakang dari 'gambar model' HARUS dipertahankan dengan sempurna.",
    ];

    if (texture) {
        rules.push(`**Terapkan Tekstur Secara Realistis:** Kemeja batik baru HARUS dirender dengan tekstur **${texture}** yang fotorealistis. Perhatikan dengan sangat detail bagaimana kain tersebut menjuntai dan terlipat di tubuh model, mencerminkan kualitasnya.`);
    }

    rules.push("**Keluaran:** Kembalikan HANYA gambar akhir yang telah diedit. Jangan sertakan teks apa pun.");

    const numberedRules = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

    return `Anda adalah AI ahli coba-pakai virtual untuk merek mewah Artisan Batik. Anda akan diberikan 'gambar model' dan 'gambar pakaian batik' (berupa pola kain atau baju). Tugas Anda adalah membuat gambar fotorealistis baru di mana orang dari 'gambar model' mengenakan **KEMEJA BATIK** yang dibuat dari 'gambar pakaian batik' tersebut.

**Aturan Penting:**
${numberedRules}`;
};

export const constructPoseVariationPrompt = (activeLayers: OutfitLayer[], poseInstruction: string) => {
    const outfitDescription = activeLayers
        .slice(1)
        .map(layer => `- Sebuah Kemeja Batik yang terbuat dari ${layer.texture || 'bahan premium'}.`)
        .join('\n');

    return `Anda adalah seorang fotografer fesyen ahli dan AI simulasi fisika untuk merek Artisan Batik. Tugas Anda adalah meregenerasi gambar seseorang dalam pose baru sambil mempertahankan realisme absolut dari kemeja batik mereka.

**Masukan:** Gambar seseorang yang mengenakan Kemeja Batik Artisan Batik.

**Konteks Pakaian:** Orang dalam gambar mengenakan item berikut:
${outfitDescription || '- Kemeja batik mereka saat ini.'}

**Instruksi:**
1.  **Pose Baru:** Regenerasi gambar yang menunjukkan orang tersebut dalam pose baru yang elegan dan sama persis ini: "${poseInstruction}".
2.  **Pertahankan Identitas:** Identitas orang, fitur wajah unik, tipe tubuh, dan gaya latar belakang HARUS tetap IDENTIK dengan gambar asli.
3.  **Juntaian Realistis (Paling Penting):** Berdasarkan konteks pakaian, simulasikan bagaimana kain batik akan secara realistis menjuntai, terlipat, dan tergantung di tubuh orang tersebut dalam pose baru. Patuhi prinsip-prinsip fisika untuk kain premium buatan tangan.
4.  **Keluaran:** Kembalikan HANYA gambar akhir yang fotorealistis. Jangan sertakan teks apa pun.`;
};

export const getOutfitDescription = (activeLayers: OutfitLayer[]): string => {
    return activeLayers
        .slice(1)
        .map(layer => `- Sebuah Kemeja Batik dibuat dari ${layer.texture || 'kain premium'}, menampilkan motif batik tulis asli yang rumit.`)
        .join('\n') || '- Kemeja batik mereka saat ini.';
};

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
Buat **satu** foto OOTD (Outfit of the Day) yang unik berdasarkan gambar model yang mengenakan kemeja batik tertentu.

**Deskripsi Pakaian:**
${outfitDescription}

**Gaya & Konteks Umum:**
${shotType}

${customInstruction}

**Aturan Ketat:**
1.  **FOTOREALISME ADALAH UTAMA:** Gambar akhir harus terlihat seperti foto asli, bukan hasil generasi AI.
2.  **JAGA IDENTITAS:** Wajah, rambut, bentuk tubuh, dan etnis model HARUS tetap identik dengan gambar masukan. JANGAN mengubah orangnya.
3.  **JAGA PAKAIAN:** Kemeja batik HARUS dipertahankan dengan sempurna—pola, warna, tekstur, dan cara jatuhnya di tubuh model.
4.  **NUANSA INDONESIA:** Adegan, latar belakang, dan pencahayaan baru harus membangkitkan suasana Indonesia yang canggih dan alami. Gunakan elemen-elemen seperti:
    -   **Pencahayaan:** Hangat, alami, cahaya senja keemasan.
    -   **Lokasi:** Kafe elegan dengan furnitur rotan, lobi kantor modern dengan aksen kayu jati, taman tropis yang rimbun, beranda rumah tradisional Jawa (joglo), galeri seni minimalis.
    -   **Properti:** Kerajinan tangan Indonesia, pot keramik, tanaman tropis (monstera, daun pisang).
5.  **ADEGAN KONTEKSTUAL:** Adegan yang dihasilkan HARUS sesuai dengan gaya & konteks yang dipilih.
6.  **FORMAT KELUARAN:** Kembalikan HANYA gambar akhir. Tanpa teks, tanpa deskripsi, tanpa markdown.
`;
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
2.  **PERTAHANKAN ELEMEN INTI:** Jaga agar orang dan kemeja batik tetap konsisten dengan gambar asli, kecuali diinstruksikan sebaliknya.
3.  **REALISME & KUALITAS:** Hasilnya harus fotorealistis dan berkualitas editorial tinggi.
4.  **FORMAT KELUARAN:** Kembalikan HANYA gambar yang telah dibuat ulang. Tanpa teks.
`;
};
