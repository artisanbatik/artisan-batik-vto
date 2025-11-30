
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { PlusIcon, BookOpenIcon, FileTextIcon } from '../../../icons';
import { Button } from '../../../ui/button';

interface OutfitActionsProps {
    onAddGarment: () => void;
    onGenerateLookbook: () => void;
    onGenerateProductInfo: () => void;
    isLoading: boolean;
    isOutfitSavable: boolean;
}

export const OutfitActions: React.FC<OutfitActionsProps> = ({ 
    onAddGarment, 
    onGenerateLookbook, 
    onGenerateProductInfo, 
    isLoading, 
    isOutfitSavable 
}) => {
    return (
        <div className="mt-4 grid grid-cols-1 gap-3 flex-shrink-0 pt-2 border-t border-stone-200 dark:border-stone-800">
            <Button 
                onClick={onAddGarment}
                disabled={isLoading}
                variant="default"
                className="w-full text-base py-6"
                leftIcon={<PlusIcon className="w-5 h-5" />}
            >
                Tambah Karya
            </Button>
            <div className="grid grid-cols-2 gap-3">
                <Button
                    onClick={onGenerateLookbook}
                    disabled={!isOutfitSavable || isLoading}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-800 dark:hover:bg-amber-700"
                    leftIcon={<BookOpenIcon className="w-4 h-4" />}
                >
                    Lookbook
                </Button>
                <Button
                    onClick={onGenerateProductInfo}
                    disabled={!isOutfitSavable || isLoading}
                    className="w-full bg-sky-700 hover:bg-sky-800 text-white dark:bg-sky-800 dark:hover:bg-sky-700"
                    leftIcon={<FileTextIcon className="w-4 h-4" />}
                >
                    Info Produk
                </Button>
            </div>
        </div>
    );
};
