
import React from 'react';
import ProductInfoModal from '../../modals/ProductInfoModal';

interface ProductInfoModalsProps {
    modals: {
        isProductInfoModalOpen: boolean;
        setIsProductInfoModalOpen: (open: boolean) => void;
    };
    productInfo: {
        isLoading: boolean;
        markdown: string | null;
        error: string | null;
    };
    handlers: {
        handleGenerateProductInfo: (force: boolean) => void;
    };
}

const ProductInfoModals: React.FC<ProductInfoModalsProps> = ({ modals, productInfo, handlers }) => {
    return (
        <ProductInfoModal 
            isOpen={modals.isProductInfoModalOpen}
            onClose={() => modals.setIsProductInfoModalOpen(false)}
            isLoading={productInfo.isLoading}
            productInfoMarkdown={productInfo.markdown}
            error={productInfo.error}
            onRegenerate={() => handlers.handleGenerateProductInfo(true)}
        />
    );
};

export default ProductInfoModals;
