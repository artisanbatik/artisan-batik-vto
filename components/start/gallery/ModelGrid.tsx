/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { CustomModel } from '../../../types';
import { ImageCard } from '../../ui/image-card';
import { Button } from '../../ui/button';
import { EmptyState } from '../../ui/empty-state';

interface ModelGridProps {
    models: CustomModel[];
    onSelect: (model: CustomModel) => void;
    renderTitle?: (model: CustomModel) => React.ReactNode;
    renderActionButtons?: (model: CustomModel) => React.ReactNode;
    appendItem?: React.ReactNode;
    emptyMessage?: string;
    emptyTitle?: string;
}

export const ModelGrid: React.FC<ModelGridProps> = ({ 
    models, 
    onSelect, 
    renderTitle, 
    renderActionButtons,
    appendItem,
    emptyMessage = "Tidak ada model yang tersedia.",
    emptyTitle = "Tidak Ada Model"
}) => {
    if (models.length === 0 && !appendItem) {
        return (
            <div className="w-full py-12 flex justify-center animate-fade-in">
                 <EmptyState 
                    title={emptyTitle} 
                    description={emptyMessage} 
                />
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {models.map(model => (
                    <ImageCard
                        key={model.id}
                        imageUrl={model.imageUrl}
                        aspectRatio={model.aspectRatio}
                        title={renderTitle ? renderTitle(model) : model.name}
                        overlayContent={
                            <Button onClick={() => onSelect(model)} variant="secondary" className="w-full bg-white text-black hover:bg-stone-200 shadow-md">
                                Pilih
                            </Button>
                        }
                        actionButtons={renderActionButtons ? renderActionButtons(model) : undefined}
                    />
                ))}
                {appendItem}
            </div>
        </div>
    );
};