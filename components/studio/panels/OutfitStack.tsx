
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../../../types';
import { Trash2Icon, SaveIcon, PackageIcon } from '../../icons';
import Spinner from '../../ui/spinner';
import { Button } from '../../ui/button';
import { Panel } from '../../ui/panel';
import { Badge } from '../../ui/badge';
import { ResourceList, ResourceItem } from '../../ui/resource-list';
import { OutfitActions } from './outfit/OutfitActions';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onUndo: () => void;
  onSaveOutfit: () => void;
  isLoading: boolean;
  onAddGarment: () => void;
  generatingLayerIndex?: number | null;
  onGenerateProductInfo: () => void;
  onGenerateLookbook: () => void;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ outfitHistory, onUndo, onSaveOutfit, isLoading, onAddGarment, generatingLayerIndex, onGenerateProductInfo, onGenerateLookbook }) => {
  const isOutfitSavable = outfitHistory.length > 1;

  const saveAction = (
    <Button
      onClick={onSaveOutfit}
      disabled={!isOutfitSavable || isLoading}
      variant="ghost"
      size="sm"
      className="hover:bg-stone-200/70 dark:hover:bg-stone-800/70 h-8 text-stone-700 dark:text-stone-300"
      leftIcon={<SaveIcon className="w-4 h-4" />}
    >
      Simpan
    </Button>
  );

  return (
    <Panel
      title="Koleksi Anda"
      icon={<PackageIcon className="w-5 h-5 text-stone-600 dark:text-stone-400"/>}
      action={saveAction}
      className="h-full"
      contentClassName="overflow-hidden"
    >
      <ResourceList
        items={outfitHistory}
        className="flex-grow"
        maxHeight="max-h-none"
        emptyMessage="Karya yang Anda pilih akan muncul di sini."
        renderItem={(layer: OutfitLayer, index: number) => {
            const isGenerating = index > 0 && generatingLayerIndex === index;
            const isLast = index === outfitHistory.length - 1;
            
            return (
                <ResourceItem
                    key={layer.garment?.id || 'base'}
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
                    actionButtons={
                        <>
                            {isGenerating && (
                                <Spinner className="w-5 h-5 text-stone-500" />
                            )}
                            {index > 0 && isLast && !generatingLayerIndex && (
                                <Button
                                    onClick={onUndo}
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
        }}
      />
      
      <OutfitActions 
        onAddGarment={onAddGarment}
        onGenerateLookbook={onGenerateLookbook}
        onGenerateProductInfo={onGenerateProductInfo}
        isLoading={isLoading}
        isOutfitSavable={isOutfitSavable}
      />
    </Panel>
  );
};

export default OutfitStack;
