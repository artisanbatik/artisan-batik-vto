
import React from 'react';
import { CustomModel } from '../../../types';
import { ImageCard } from '../../ui/image-card';
import { Button } from '../../ui/button';
import { EmptyState } from '../../ui/empty-state';

export const PredefinedModelGrid: React.FC<{ models: CustomModel[], onSelect: (m: CustomModel) => void }> = ({ models, onSelect }) => {
    if (models.length === 0) {
        return (
            <div className="w-full py-12 flex justify-center animate-fade-in">
                 <EmptyState 
                    title="Tidak Ada Model" 
                    description="Belum ada model siap pakai yang tersedia saat ini." 
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
                        title={model.name}
                        aspectRatio={model.aspectRatio}
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
