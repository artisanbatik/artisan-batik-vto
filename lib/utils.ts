/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CustomModel, ProductInfoHistoryItem, SavedLookbook, SavedOutfit, WardrobeItem } from "../types";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(error: string, context: string): string {
    const rawMessage = error.toLowerCase();

    if (rawMessage.includes("unsupported mime type")) {
        const originalError = error;
        try {
            const errorJson = JSON.parse(originalError);
            const nestedMessage = errorJson?.error?.message;
            if (nestedMessage && typeof nestedMessage === 'string' && nestedMessage.includes("Unsupported MIME type")) {
                const mimeType = nestedMessage.split(': ')[1] || 'unsupported';
                return `Tipe file '${mimeType}' tidak didukung. Harap gunakan format seperti PNG, JPEG, atau WEBP.`;
            }
        } catch (e) {}
        return `Format file tidak didukung. Harap unggah format gambar seperti PNG, JPEG, atau WEBP.`;
    }

    if (rawMessage.includes("api key not valid") || rawMessage.includes("permission denied")) {
        return "Kunci API tidak valid atau hilang. Harap periksa apakah sudah dikonfigurasi dengan benar.";
    }

    if (rawMessage.includes("429") || rawMessage.includes("quota") || rawMessage.includes("resource has been exhausted")) {
        return "Batas penggunaan API terlampaui. Silakan coba lagi nanti atau periksa kuota Anda.";
    }

    if (rawMessage.includes("permintaan diblokir") || rawMessage.includes("safety") || rawMessage.includes("recitation")) {
        return "Permintaan diblokir karena kebijakan keamanan. Coba gunakan gambar atau prompt yang berbeda.";
    }
    
    if (rawMessage.includes("berhenti secara tidak terduga")) {
         return "Pembuatan gambar dihentikan karena masalah keamanan. Silakan coba gambar yang berbeda.";
    }
    
    if (rawMessage.includes("model ai tidak mengembalikan gambar")) {
        return "Gagal membuat gambar. Ini bisa disebabkan oleh filter keamanan atau permintaan yang terlalu rumit. Coba lagi dengan gambar atau prompt yang berbeda.";
    }

    if (rawMessage.includes('failed to fetch') || rawMessage.includes('xhr error')) {
        return `${context}. Terjadi masalah jaringan. Periksa koneksi internet Anda dan coba lagi.`;
    }

    return `${context}. Terjadi kesalahan tak terduga: ${error}`;
}

/**
 * Determines the most appropriate MIME type for a file.
 * It prioritizes a valid provided blobType, then tries to infer from the filename extension,
 * and finally falls back to a default.
 * @param filename The name of the file (e.g., 'image.png').
 * @param blobType The MIME type from a Blob object, which might be empty or invalid.
 * @returns A valid image MIME type string.
 */
export const getMimeType = (filename: string, blobType?: string): string => {
    // Priority 1: Use a valid blobType if it exists
    if (blobType && blobType !== 'application/octet-stream' && blobType !== '') {
        return blobType;
    }
    
    // Priority 2: Infer from file extension
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        case 'avif':
            return 'image/avif';
        case 'heic':
            return 'image/heic';
        case 'heif':
            return 'image/heif';
        default:
            // Priority 3: Fallback to a common default
            return 'image/jpeg';
    }
};


/**
 * Converts a URL (http, blob, or data) into a File object with a guaranteed valid MIME type.
 * This is a robust implementation that attempts a direct fetch first for external URLs 
 * for better performance and falls back to a CORS proxy if needed.
 * @param url The URL of the image.
 * @param filename The desired filename for the resulting File object.
 * @returns A Promise that resolves to a File object.
 */
export const urlToFile = async (url: string, filename: string): Promise<File> => {
    // Handle local blob and data URLs directly.
    if (url.startsWith('blob:') || url.startsWith('data:')) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Gagal mengambil URL lokal. Status: ${response.status}`);
            }
            const blob = await response.blob();
            const mimeType = getMimeType(filename, blob.type);
            // Create a file with a proper name and type
            const file = new File([blob], filename, { type: mimeType });
            return file;
        } catch (error) {
            console.error(`Error fetching local URL '${url}':`, error);
            throw new Error(`Tidak dapat memuat gambar dari URL lokal.`);
        }
    }

    // For external HTTP(S) URLs, attempt a direct fetch first.
    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Pengambilan langsung gagal dengan status: ${response.status}`);
        }
        const blob = await response.blob();
        const mimeType = getMimeType(filename, blob.type);
        return new File([blob], filename, { type: mimeType });
    } catch (error) {
        console.warn(
            `Direct fetch for "${url}" failed. This is likely a CORS issue. ` +
            `Falling back to a CORS proxy. Error:`,
            error
        );

        // If direct fetch fails (e.g., due to CORS), use a proxy as a fallback.
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        try {
            const proxyResponse = await fetch(proxyUrl);
            if (!proxyResponse.ok) {
                throw new Error(`Pengambilan proxy gagal dengan status: ${proxyResponse.status} ${proxyResponse.statusText}`);
            }
            const blob = await proxyResponse.blob();
            if (blob.size === 0) {
                throw new Error('Blob yang diambil melalui proxy kosong. Proxy atau gambar asli mungkin tidak tersedia.');
            }
            const mimeType = getMimeType(filename, blob.type);
            return new File([blob], filename, { type: mimeType });
        } catch (proxyError) {
            console.error(`CORS proxy fetch for "${url}" also failed:`, proxyError);
            throw new Error(`Tidak dapat memuat gambar dari URL, bahkan dengan proxy. Sumber daya mungkin tidak tersedia.`);
        }
    }
};

/**
 * Ensures that a given URL is a data URL. If it's a blob or http URL,
 * it fetches the content and converts it to a data URL.
 * @param url The URL to process.
 * @returns A Promise that resolves to a data URL string.
 */
export const ensureDataUrl = (url: string): Promise<string> => {
  if (url.startsWith('data:')) {
    return Promise.resolve(url);
  }
  
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Gagal mengambil URL untuk konversi data URL: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.error) {
            reject(reader.error);
          } else {
            resolve(reader.result as string);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error(`Gagal mengonversi URL ke data URL: ${url}`, error);
        reject(error);
      });
  });
};


// --- IndexedDB Store for All Application Data ---

const DB_NAME = 'ArtisanBatikVTO_DB';
const DB_VERSION = 2; // Naikkan versi untuk memicu onupgradeneeded
const STORE_NAMES = {
    CUSTOM_MODELS: 'customModels', // Stores CustomModel metadata (without imageUrl)
    MODEL_IMAGES: 'modelImages', // Stores image blobs, keyed by model ID
    WARDROBE: 'wardrobe', // Stores WardrobeItem objects
    SAVED_OUTFITS: 'savedOutfits', // Stores SavedOutfit objects
    PRODUCT_INFO_HISTORY: 'productInfoHistory', // Stores ProductInfoHistoryItem objects
    SAVED_LOOKBOOKS: 'savedLookbooks' // Toko baru untuk lookbook
};

type StoredCustomModel = Omit<CustomModel, 'imageUrl'>;
type StoreName = typeof STORE_NAMES[keyof typeof STORE_NAMES];
type StoreType<T extends StoreName> = 
    T extends 'customModels' ? StoredCustomModel :
    T extends 'modelImages' ? Blob :
    T extends 'wardrobe' ? WardrobeItem :
    T extends 'savedOutfits' ? SavedOutfit :
    T extends 'productInfoHistory' ? ProductInfoHistoryItem :
    T extends 'savedLookbooks' ? SavedLookbook :
    never;

class AppDatabase {
  private db: IDBDatabase | null = null;

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve();
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(new Error('Gagal membuka IndexedDB. Aplikasi mungkin tidak berfungsi dengan benar dalam mode pribadi.'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Buat atau perbarui object stores
        Object.values(STORE_NAMES).forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
                if (storeName === STORE_NAMES.MODEL_IMAGES) {
                    db.createObjectStore(storeName);
                } else {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            }
        });
      };
    });
  }
  
  private async getStore<T extends StoreName>(storeName: T, mode: IDBTransactionMode): Promise<IDBObjectStore> {
      if (!this.db) await this.init();
      return this.db!.transaction(storeName, mode).objectStore(storeName);
  }

  async saveItem<T extends StoreName>(storeName: T, item: StoreType<T>): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const store = await this.getStore(storeName, 'readwrite');
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  }

  async getItem<T extends StoreName>(storeName: T, id: string): Promise<StoreType<T> | null> {
    return new Promise(async (resolve, reject) => {
        const store = await this.getStore(storeName, 'readonly');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  }

  async getAll<T extends StoreName>(storeName: T): Promise<StoreType<T>[]> {
      return new Promise(async (resolve, reject) => {
          const store = await this.getStore(storeName, 'readonly');
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
  }

  async deleteItem<T extends StoreName>(storeName: T, id: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
          const store = await this.getStore(storeName, 'readwrite');
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
  }
  
  // Specific methods for handling large image blobs
  async saveImage(id: string, imageBlob: Blob): Promise<void> {
      return new Promise(async (resolve, reject) => {
          const store = await this.getStore(STORE_NAMES.MODEL_IMAGES, 'readwrite');
          const request = store.put(imageBlob, id);
          request.onsuccess = () => resolve();
          request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
  }

  async getImage(id: string): Promise<Blob | null> {
      return new Promise(async (resolve, reject) => {
          const store = await this.getStore(STORE_NAMES.MODEL_IMAGES, 'readonly');
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
  }

  async deleteImage(id: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
          const store = await this.getStore(STORE_NAMES.MODEL_IMAGES, 'readwrite');
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
  }
}

export const appDB = new AppDatabase();

export const dataUrlToBlob = (dataUrl: string): Promise<Blob> => {
    return fetch(dataUrl).then(res => res.blob());
};

export const resizeImage = (dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Helps with CORS if the dataUrl is from another origin
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Tidak dapat memperoleh konteks kanvas'));
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.9)); // Use JPEG for smaller size
        };
        img.onerror = (error) => {
            console.error("Gagal memuat gambar untuk diubah ukurannya:", error);
            reject(new Error("Gagal memuat gambar untuk diubah ukurannya"));
        };
        img.src = dataUrl;
    });
};

export type ImageFormat = 'png' | 'jpeg' | 'webp';

/**
 * Converts an image from a URL to a specified format (PNG, JPEG, WebP),
 * optionally applying CSS filters.
 * @param imageUrl The URL of the source image.
 * @param format The desired output format.
 * @param filters Optional CSS filters to apply to the image.
 * @returns A promise that resolves to an object containing the image blob and file extension.
 */
export const convertImage = (
    imageUrl: string, 
    format: ImageFormat, 
    filters?: { brightness: number; contrast: number; saturation: number; hue: number; sepia: number; }
): Promise<{ blob: Blob, extension: string }> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    const performConversion = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Tidak dapat memperoleh konteks kanvas'));

        if (filters) {
            ctx.filter = `brightness(${filters.brightness / 100}) contrast(${filters.contrast / 100}) saturate(${filters.saturation / 100}) hue-rotate(${filters.hue}deg) sepia(${filters.sepia}%)`;
        }
        
        if (format === 'jpeg') {
          // Create a temporary canvas to draw the image on a white background,
          // as JPEG does not support transparency.
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = image.naturalWidth;
          tempCanvas.height = image.naturalHeight;
          const tempCtx = tempCanvas.getContext('2d');
          if(tempCtx) {
              tempCtx.fillStyle = '#ffffff';
              tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
              if(filters) tempCtx.filter = ctx.filter;
              tempCtx.drawImage(image, 0, 0);
              
              ctx.filter = 'none'; // Reset filter on main canvas before drawing the temp canvas
              ctx.drawImage(tempCanvas, 0, 0);
          }
        } else {
          ctx.drawImage(image, 0, 0);
        }
        
        const mimeType = `image/${format}`;
        const extension = format === 'jpeg' ? 'jpg' : format;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, extension });
            } else {
              reject(new Error('Gagal membuat blob kanvas'));
            }
          },
          mimeType,
          format === 'jpeg' ? 0.92 : undefined // Quality setting for JPEG/WebP
        );
      } catch (e) {
        reject(e);
      }
    };

    image.onerror = (err) => reject(new Error(`Gagal memuat gambar: ${err.toString()}`));
    
    // Using fetch is more robust for handling various URL types and potential CORS issues.
    fetch(imageUrl)
        .then(res => {
            if (!res.ok) throw new Error(`Gagal mengambil gambar: ${res.status} ${res.statusText}`);
            return res.blob();
        })
        .then(blob => {
            const objectURL = URL.createObjectURL(blob);
            // Assign to src to start loading the image
            image.src = objectURL;
            // Clean up the object URL once the image is loaded to prevent memory leaks
            image.onload = () => {
                performConversion();
                URL.revokeObjectURL(objectURL);
            };
        })
        .catch(err => reject(err));
  });
};