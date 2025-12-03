/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext, ReactNode } from 'react';
import { useAppPersistence } from '../hooks/useAppPersistence';
import { WardrobeItem, SavedOutfit, CustomModel, ProductInfoHistoryItem, SavedLookbook } from '../types';

interface PersistenceContextType {
    loadingError: string | null;
    setLoadingError: (error: string | null) => void;
    wardrobe: WardrobeItem[];
    customWardrobe: WardrobeItem[];
    savedOutfits: SavedOutfit[];
    customModels: CustomModel[];
    productInfoHistory: ProductInfoHistoryItem[];
    savedLookbooks: SavedLookbook[];
    refreshCustomModels: () => Promise<void>;
    actions: {
        addWardrobeItem: (item: WardrobeItem) => Promise<void>;
        updateWardrobeItem: (item: WardrobeItem) => Promise<void>;
        deleteWardrobeItem: (id: string) => Promise<void>;
        saveOutfit: (outfit: SavedOutfit) => Promise<void>;
        deleteOutfit: (id: string) => Promise<void>;
        renameOutfit: (id: string, newName: string) => Promise<void>;
        addCustomModel: (model: CustomModel) => Promise<void>;
        deleteCustomModel: (id: string) => Promise<void>;
        renameCustomModel: (id: string, newName: string) => Promise<void>;
        addProductInfo: (info: ProductInfoHistoryItem) => Promise<void>;
        saveLookbook: (lookbook: SavedLookbook) => Promise<void>;
        deleteLookbook: (id: string) => Promise<void>;
        renameLookbook: (id: string, newName: string) => Promise<void>;
    }
}

const PersistenceContext = createContext<PersistenceContextType | null>(null);

export const usePersistence = () => {
    const context = useContext(PersistenceContext);
    if (!context) {
        throw new Error("usePersistence must be used within a PersistenceProvider");
    }
    return context;
};

export const PersistenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const persistenceData = useAppPersistence();

    return (
        <PersistenceContext.Provider value={persistenceData}>
            {children}
        </PersistenceContext.Provider>
    );
};
