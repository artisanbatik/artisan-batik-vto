
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../../../types';
import { SaveIcon, PackageIcon } from '../../icons';
import { Button } from '../../ui/button';
import { Panel } from '../../ui/panel';
import { ResourceList } from '../../ui/resource-list';
import { OutfitActions } from './outfit/OutfitActions';
import { OutfitLayerItem } from './outfit/OutfitLayerItem';

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
            // Can delete if it's the last item, not the base model (index > 0), and nothing is currently generating
            const canDelete = index > 0 && isLast && !generatingLayerIndex;
            
            return (
                <OutfitLayerItem
                    key={layer.garment?.id || `layer-${index}`}
                    layer={layer}
                    index={index}
                    isGenerating={isGenerating}
                    canDelete={canDelete}
                    isLoading={isLoading}
                    onUndo={onUndo}
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
