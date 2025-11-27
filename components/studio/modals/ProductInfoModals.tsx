
import React from 'react';
import ProductInfoModal from '../../modals/ProductInfoModal';

interface ProductInfoModalsProps {
    isProductInfoModalOpen: boolean;
    setIsProductInfoModalOpen: (open: boolean) => void;
    isProductInfoLoading: boolean;
    productInfoMarkdown: string | null;
    productInfoError: string | null;
    handleGenerateProductInfo: (force: boolean) => void;
}

const ProductInfoModals: React.FC<ProductInfoModalsProps> = (props) => {
    return (
        <ProductInfoModal 
            isOpen={props.isProductInfoModalOpen}
            onClose={() => props.setIsProductInfoModalOpen(false)}
            isLoading={props.isProductInfoLoading}
            productInfoMarkdown={props.productInfoMarkdown}
            error={props.productInfoError}
            onRegenerate={() => props.handleGenerateProductInfo(true)}
        />
    );
};

export default ProductInfoModals;
