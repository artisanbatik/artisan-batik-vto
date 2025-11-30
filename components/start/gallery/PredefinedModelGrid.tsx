import React from 'react';
import { CustomModel } from '../../../types';
import { ImageCard } from '../../ui/image-card';
import { Button } from '../../ui/button';

export const PredefinedModelGrid: React.FC<{ models: CustomModel[], onSelect: (m: CustomModel) => void }> = ({ models, onSelect }) => {
    if (models.length === 0) return null;
    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-4">Model Siap Pakai</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {models.map(model => (
                    <ImageCard
                        key={model.id}
                        imageUrl={model.imageUrl}
                        title={model.name}
                        aspectRatio={model.aspectRatio}
                        className="animate-fade-in"
                        overlayContent={
                            <Button onClick={() => onSelect(model)} variant="secondary" className="w-full bg-white text-black hover:bg-stone-200 shadow-md">
                                Pilih
                            </Button>
                        }
                    />
                ))}
            </div>
        </div>
    );
};