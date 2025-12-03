/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useStudio } from '../StudioContext';
import { SaveIcon, PackageIcon } from '../../icons';
import { Button } from '../../ui/button';
import { Panel } from '../../ui/panel';
import { ResourceList } from '../../ui/resource-list';
import { OutfitActions } from './outfit/OutfitActions';
import { OutfitLayerItem } from './outfit/OutfitLayerItem';
import { OutfitLayer } from '../../../types';

const OutfitStack: React.FC = () => {
  const { 
    history, 
    currentIndex, 
    undo, 
    persistenceActions, 
    handleSaveOutfit, 
    isVTOLoading, 
    modals, 
    handlers 
  } = useStudio();

  // Derived state
  const outfitHistory = history.slice(0, currentIndex + 1);
  const isOutfitSavable = outfitHistory.length > 1;

  // Custom undo handler that ensures garments are removed from DB if needed
  const handleUndo = () => {
    undo((id) => persistenceActions.deleteWardrobeItem(id));
  };

  const saveAction = (
    <Button
      onClick={handleSaveOutfit}
      disabled={!isOutfitSavable || isVTOLoading}
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
            const isLast = index === outfitHistory.length - 1;
            // Can delete if it's the last item and not the base model (index > 0)
            const canDelete = index > 0 && isLast;
            
            return (
                <OutfitLayerItem
                    key={layer.garment?.id || `layer-${index}`}
                    layer={layer}
                    index={index}
                    isGenerating={false}
                    canDelete={canDelete}
                    isLoading={isVTOLoading}
                    onUndo={handleUndo}
                />
            );
        }}
      />
      
      <OutfitActions 
        onAddGarment={() => modals.setIsWardrobeOpen(true)}
        onGenerateLookbook={() => modals.setIsLookbookStyleModalOpen(true)}
        onGenerateProductInfo={() => handlers.handleGenerateProductInfo(false)}
        isLoading={isVTOLoading}
        isOutfitSavable={isOutfitSavable}
      />
    </Panel>
  );
};

export default OutfitStack;