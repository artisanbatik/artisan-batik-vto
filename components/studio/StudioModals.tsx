
import React from 'react';
import GarmentModals from './modals/GarmentModals';
import LookbookModals from './modals/LookbookModals';
import ProductInfoModals from './modals/ProductInfoModals';
import { WardrobeItem, OutfitLayer } from '../../types';

interface StudioModalsProps {
    // Grouped Props from UseStudioState
    modals: any; 
    selections: any;
    productInfo: any;
    lookbook: any;
    handlers: any;

    // Data Props
    activeOutfitLayers: OutfitLayer[];
    isVTOLoading: boolean;
    wardrobe: WardrobeItem[];
    isMobile: boolean;
}

const StudioModals: React.FC<StudioModalsProps> = ({ 
    modals, 
    selections, 
    productInfo, 
    lookbook, 
    handlers, 
    activeOutfitLayers, 
    isVTOLoading, 
    wardrobe, 
    isMobile 
}) => {
    return (
        <>
            <GarmentModals 
                modals={modals}
                selections={selections}
                handlers={handlers}
                activeOutfitLayers={activeOutfitLayers}
                isVTOLoading={isVTOLoading}
                wardrobe={wardrobe}
            />

            <ProductInfoModals 
                modals={modals}
                productInfo={productInfo}
                handlers={handlers}
            />

            <LookbookModals 
                modals={modals}
                lookbook={lookbook}
                handlers={handlers}
                isMobile={isMobile}
            />
        </>
    );
};

export default StudioModals;
