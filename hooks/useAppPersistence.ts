/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useEffect, useMemo } from 'react';
import { appDB, dataUrlToBlob, resizeImage } from '../lib/utils';
import { SavedOutfit, WardrobeItem, CustomModel, ProductInfoHistoryItem, SavedLookbook } from '../types';
import { defaultWardrobe } from '../wardrobe';

// Type used for storing model metadata in localStorage/IndexedDB
type StoredCustomModel = Omit<CustomModel, 'imageUrl'>;

export const useAppPersistence = () => {
    const [loadingError, setLoadingError] = useState<string | null>(null);
    
    // Data States
    const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
    const [customWardrobe, setCustomWardrobe] = useState<WardrobeItem[]>([]);
    const [customModels, setCustomModels] = useState<CustomModel[]>([]);
    const [productInfoHistory, setProductInfoHistory] = useState<ProductInfoHistoryItem[]>([]);
    const [savedLookbooks, setSavedLookbooks] = useState<SavedLookbook[]>([]);

    const wardrobe = useMemo(() => [...defaultWardrobe, ...customWardrobe], [customWardrobe]);

    const refreshCustomModels = useCallback(async () => {
        try {
            const modelsMeta = await appDB.getAll('customModels');
            const loadedModels = await Promise.all(
                modelsMeta.map(async (meta) => {
                    const imageBlob = await appDB.getImage(meta.id);
                    if (imageBlob) {
                        return {
                            ...meta,
                            imageUrl: URL.createObjectURL(imageBlob),
                        };
                    }
                    console.warn(`Gambar untuk model ${meta.name} (ID: ${meta.id}) tidak ditemukan.`);
                    return null;
                })
            );

            setCustomModels(prevModels => {
                prevModels.forEach(model => {
                    if (model.imageUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(model.imageUrl);
                    }
                });
                return loadedModels.filter((m): m is CustomModel => m !== null);
            });
        } catch (e) {
            console.error("Gagal memuat ulang model kustom:", e);
            setLoadingError("Tidak dapat memuat ulang model kustom Anda.");
        }
    }, []);

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            try {
                await appDB.init();
                const [outfits, wardrobeItems, productInfo, lookbooks] = await Promise.all([
                    appDB.getAll('savedOutfits'),
                    appDB.getAll('wardrobe'),
                    appDB.getAll('productInfoHistory'),
                    appDB.getAll('savedLookbooks'),
                ]);
                
                setSavedOutfits(outfits);
                setCustomWardrobe(wardrobeItems);
                setProductInfoHistory(productInfo.sort((a,b) => b.timestamp - a.timestamp));
                setSavedLookbooks(lookbooks.sort((a, b) => (b.id > a.id ? 1 : -1)));

                await refreshCustomModels();
            } catch (e) {
                console.error("Gagal memuat data dari IndexedDB:", e);
                setLoadingError("Tidak dapat memuat data. Mode penjelajahan pribadi mungkin menjadi penyebabnya.");
            }
        };
        loadData();
    }, [refreshCustomModels]);

    // --- Actions ---

    // Wardrobe Actions
    const addWardrobeItem = async (item: WardrobeItem) => {
        await appDB.saveItem('wardrobe', item);
        setCustomWardrobe(prev => [...prev, item]);
    };

    const updateWardrobeItem = async (item: WardrobeItem) => {
        await appDB.saveItem('wardrobe', item);
        setCustomWardrobe(prev => prev.map(w => w.id === item.id ? item : w));
    };

    const deleteWardrobeItem = async (id: string) => {
        await appDB.deleteItem('wardrobe', id);
        setCustomWardrobe(prev => prev.filter(w => w.id !== id));
    };

    // Outfit Actions
    const saveOutfit = async (outfit: SavedOutfit) => {
        await appDB.saveItem('savedOutfits', outfit);
        setSavedOutfits(prev => [...prev, outfit]);
    };

    const deleteOutfit = async (id: string) => {
        await appDB.deleteItem('savedOutfits', id);
        setSavedOutfits(prev => prev.filter(o => o.id !== id));
    };

    const renameOutfit = async (id: string, newName: string) => {
        const outfit = await appDB.getItem('savedOutfits', id);
        if (outfit) {
            const updated = { ...outfit, name: newName };
            await appDB.saveItem('savedOutfits', updated);
            setSavedOutfits(prev => prev.map(o => o.id === id ? updated : o));
        }
    };

    // Model Actions
    const addCustomModel = async (model: CustomModel) => {
        try {
            const imageBlob = await dataUrlToBlob(model.imageUrl);
            const modelMetadata: StoredCustomModel = { id: model.id, name: model.name, aspectRatio: model.aspectRatio };
            
            await appDB.saveItem('customModels', modelMetadata);
            await appDB.saveImage(model.id, imageBlob);

            const blobUrl = URL.createObjectURL(imageBlob);
            setCustomModels(prev => [...prev, { ...model, imageUrl: blobUrl }]);
        } catch (error) {
            console.error(error);
            throw new Error("Gagal menyimpan model baru");
        }
    };

    const deleteCustomModel = async (id: string) => {
        await appDB.deleteItem('customModels', id);
        await appDB.deleteImage(id);
        setCustomModels(prev => prev.filter(m => m.id !== id));
    };

    const renameCustomModel = async (id: string, newName: string) => {
        const model = await appDB.getItem('customModels', id);
        if (model) {
            const updated = { ...model, name: newName };
            await appDB.saveItem('customModels', updated);
            setCustomModels(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
        }
    };

    // Product Info Actions
    const addProductInfo = async (info: ProductInfoHistoryItem) => {
        await appDB.saveItem('productInfoHistory', info);
        setProductInfoHistory(prev => [info, ...prev].sort((a, b) => b.timestamp - a.timestamp));
    };

    // Lookbook Actions
    const saveLookbook = async (lookbook: SavedLookbook) => {
        await appDB.saveItem('savedLookbooks', lookbook);
        setSavedLookbooks(prev => [lookbook, ...prev].sort((a, b) => (b.id > a.id ? 1 : -1)));
    };

    const deleteLookbook = async (id: string) => {
        await appDB.deleteItem('savedLookbooks', id);
        setSavedLookbooks(prev => prev.filter(l => l.id !== id));
    };

    const renameLookbook = async (id: string, newName: string) => {
        const lb = await appDB.getItem('savedLookbooks', id);
        if (lb) {
            const updated = { ...lb, name: newName };
            await appDB.saveItem('savedLookbooks', updated);
            setSavedLookbooks(prev => prev.map(l => l.id === id ? updated : l));
        }
    };

    return {
        loadingError,
        setLoadingError,
        wardrobe,
        customWardrobe,
        savedOutfits,
        customModels,
        productInfoHistory,
        savedLookbooks,
        refreshCustomModels, // Exposed for import logic
        actions: {
            addWardrobeItem,
            updateWardrobeItem,
            deleteWardrobeItem,
            saveOutfit,
            deleteOutfit,
            renameOutfit,
            addCustomModel,
            deleteCustomModel,
            renameCustomModel,
            addProductInfo,
            saveLookbook,
            deleteLookbook,
            renameLookbook
        }
    };
};
