/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useStudio } from '../StudioContext';
import { BookOpenIcon } from '../../icons';
import { CollectionPanel } from './CollectionPanel';
import { SavedLookbook, SavedOutfit } from '../../../types';

const SavedLookbooksPanel: React.FC = () => {
  const { 
    savedLookbooks, 
    persistenceActions, 
    handlers, 
    handleLoadOutfit, 
    isVTOLoading 
  } = useStudio();

  // Wrapper untuk handleLoadOutfit karena CollectionPanel mengharapkan (item: T) => void
  // sedangkan handlers.handleViewLookbook membutuhkan 2 argumen.
  const handleViewWrapper = (lookbook: SavedLookbook) => {
      handlers.handleViewLookbook(lookbook, handleLoadOutfit);
  };

  return (
    <CollectionPanel<SavedLookbook>
        title="Lookbook Tersimpan"
        icon={<BookOpenIcon className="w-5 h-5 text-stone-600 dark:text-stone-400" />}
        items={savedLookbooks}
        isDisabled={isVTOLoading}
        emptyMessage="Lookbook yang Anda simpan akan muncul di sini."
        
        // Handlers
        onLoad={handleViewWrapper}
        onRename={persistenceActions.renameLookbook}
        onDelete={persistenceActions.deleteLookbook}
        
        // Mappers
        getId={(item) => item.id}
        getTitle={(item) => item.name}
        getSubtitle={(item) => item.style}
        getThumbnail={(item) => item.thumbnailUrl}
    />
  );
};

export default SavedLookbooksPanel;