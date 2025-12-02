
import React from 'react';
import { OutfitLayer } from '../../../../types';
import { ResourceItem } from '../../../ui/resource-item';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Trash2Icon } from '../../../icons';
import Spinner from '../../../ui/spinner';

interface OutfitLayerItemProps {
    layer: OutfitLayer;
    index: number;
    isGenerating: boolean;
    canDelete: boolean;
    isLoading: boolean;
    onUndo: () => void;
    onClick?: () => void;
    isActive?: boolean;
}

export const OutfitLayerItem: React.FC<OutfitLayerItemProps> = ({
    layer,
    index,
    isGenerating,
    canDelete,
    isLoading,
    onUndo,
    onClick,
    isActive
}) => {
    return (
        <ResourceItem
            id={layer.garment?.id || 'base'}
            prefix={
                <Badge variant="secondary" className="w-5 h-5 p-0 flex items-center justify-center rounded-full">
                    {index + 1}
                </Badge>
            }
            thumbnailUrl={layer.garment?.url}
            title={layer.garment ? layer.garment.name : 'Model Dasar'}
            subtitle={layer.texture ? `Tekstur ${layer.texture}` : undefined}
            isDisabled={isLoading && !isGenerating}
            isActive={isActive}
            onClick={onClick}
            actionButtons={
                <>
                    {isGenerating && (
                        <Spinner className="w-5 h-5 text-stone-500" />
                    )}
                    {canDelete && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUndo();
                            }}
                            variant="ghost"
                            size="icon"
                            className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 w-8"
                            aria-label={`Hapus ${layer.garment?.name}`}
                        >
                            <Trash2Icon className="w-4 h-4" />
                        </Button>
                    )}
                </>
            }
        />
    );
};
