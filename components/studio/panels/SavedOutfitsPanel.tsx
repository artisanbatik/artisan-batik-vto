/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useStudio } from '../StudioContext';
import { LibraryIcon } from '../../icons';
import { CollectionPanel } from './CollectionPanel';
import { SavedOutfit } from '../../../types';

const SavedOutfitsPanel: React.FC = () => {
  const { 
    savedOutfits, 
    handleLoadOutfit, 
    persistenceActions, 
    isVTOLoading 
  } = useStudio();

  return (
    <CollectionPanel<SavedOutfit>
        title="Koleksi Tersimpan"
        icon={<LibraryIcon className="w-5 h-5 text-stone-600 dark:text-stone-400" />}
        items={savedOutfits}
        isDisabled={isVTOLoading}
        emptyMessage="Koleksi yang Anda simpan akan muncul di sini."
        
        // Handlers
        onLoad={handleLoadOutfit}
        onRename={persistenceActions.renameOutfit}
        onDelete={persistenceActions.deleteOutfit}
        
        // Mappers
        getId={(item) => item.id}
        getTitle={(item) => item.name}
        getThumbnail={(item) => item.thumbnailUrl}
    />
  );
};

export default SavedOutfitsPanel;