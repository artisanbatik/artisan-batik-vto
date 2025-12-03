/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useStudio } from '../StudioContext';
import { SavedOutfit } from '../../../types';
import { Trash2Icon, PencilIcon } from '../../icons';
import { Button } from '../../ui/button';
import { Panel } from '../../ui/panel';
import { useInlineRename } from '../../../hooks/useInlineRename';
import { ResourceList } from '../../ui/resource-list';
import { ResourceItem } from '../../ui/resource-item';

const SavedOutfitsPanel: React.FC = () => {
  const { 
    savedOutfits, 
    handleLoadOutfit, 
    persistenceActions, 
    isVTOLoading 
  } = useStudio();

  const {
    renamingId,
    inputValue,
    setInputValue,
    startRename,
    commitRename,
    handleKeyDown
  } = useInlineRename(persistenceActions.renameOutfit);

  return (
    <Panel title="Koleksi Tersimpan" isDisabled={isVTOLoading}>
      <ResourceList
        items={savedOutfits}
        emptyMessage="Koleksi yang Anda simpan akan muncul di sini."
        renderItem={(outfit: SavedOutfit) => (
          <ResourceItem
            key={outfit.id}
            id={outfit.id}
            title={outfit.name}
            thumbnailUrl={outfit.thumbnailUrl}
            isDisabled={isVTOLoading}
            
            // Rename logic
            isRenaming={renamingId === outfit.id}
            renameValue={inputValue}
            onRenameChange={setInputValue}
            onRenameSubmit={commitRename}
            onRenameKeyDown={handleKeyDown}
            
            // Actions
            actionButtons={
              <>
                <Button
                  onClick={() => handleLoadOutfit(outfit)}
                  disabled={isVTOLoading}
                  variant="secondary"
                  size="sm"
                  className="bg-transparent hover:bg-stone-200/70 dark:hover:bg-stone-800/70 text-stone-700 dark:text-stone-300 h-8"
                >
                  Muat
                </Button>
                <Button
                  onClick={() => startRename(outfit.id, outfit.name)}
                  disabled={isVTOLoading}
                  variant="ghost"
                  size="icon"
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800/70 h-8 w-8"
                  aria-label={`Ubah nama ${outfit.name}`}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => persistenceActions.deleteOutfit(outfit.id)}
                  disabled={isVTOLoading}
                  variant="ghost"
                  size="icon"
                  className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 w-8"
                  aria-label={`Hapus ${outfit.name}`}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </>
            }
          />
        )}
      />
    </Panel>
  );
};

export default SavedOutfitsPanel;