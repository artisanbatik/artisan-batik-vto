/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type WardrobeCategory = 'top' | 'bottom' | 'outerwear' | 'accessory' | 'dress';

export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
  category: WardrobeCategory;
}

export interface OutfitLayer {
  garment: WardrobeItem | null; // null represents the base model layer
  texture?: string; // e.g., 'Cotton', 'Silk'
  poseImages: Record<string, string>; // Maps pose instruction to image URL
}

export interface LookbookImage {
  id: string;
  url: string;
}

export interface SavedLookbook {
    id: string;
    name: string;
    style: string;
    images: LookbookImage[];
    outfitId: string; // Tautkan kembali ke koleksi pakaian yang digunakan untuk membuatnya
    thumbnailUrl: string; // Gambar mini untuk pratinjau
    aspectRatio: string;
}

export interface SavedOutfit {
  id:string;
  name: string;
  thumbnailUrl: string;
  layers: Array<{ garmentId: string; texture?: string; }>;
  poseInstruction: string;
  lookbookId?: string; // Tautkan ke lookbook yang disimpan yang terkait
}

export interface CustomModel {
  id:string;
  name: string;
  imageUrl: string;
  aspectRatio: string;
}

export type StoredCustomModel = Omit<CustomModel, 'imageUrl'>;

export interface ProductInfoHistoryItem {
  id: string;
  timestamp: number;
  info: string;
  thumbnailUrl: string;
  title: string;
}