
import React from 'react';
import GarmentModals from './modals/GarmentModals';
import LookbookModals from './modals/LookbookModals';
import ProductInfoModals from './modals/ProductInfoModals';
import { useStudio } from './StudioContext';

const StudioModals: React.FC = () => {
    const { 
        modals, 
        selections, 
        productInfo, 
        lookbook, 
        handlers, 
        activeOutfitLayers, 
        isVTOLoading, 
        wardrobe, 
        isMobile 
    } = useStudio();

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
