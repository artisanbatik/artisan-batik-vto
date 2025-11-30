/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { SavedLookbook } from '../../../types';
import { Trash2Icon, PencilIcon, BookOpenIcon } from '../../icons';
import { Button } from '../../ui/button';
import { Panel } from '../../ui/panel';
import { useInlineRename } from '../../../hooks/useInlineRename';
import { ResourceList, ResourceItem } from '../../ui/resource-list';

interface SavedLookbooksPanelProps {
  savedLookbooks: SavedLookbook[];
  onDeleteLookbook: (lookbookId: string) => void;
  onRenameLookbook: (lookbookId: string, newName: string) => void;
  onViewLookbook: (lookbook: SavedLookbook) => void;
  isLoading: boolean;
}

const SavedLookbooksPanel: React.FC<SavedLookbooksPanelProps> = ({ savedLookbooks, onDeleteLookbook, onRenameLookbook, onViewLookbook, isLoading }) => {
  const {
    renamingId,
    inputValue,
    setInputValue,
    startRename,
    commitRename,
    handleKeyDown
  } = useInlineRename(onRenameLookbook);

  return (
    <Panel 
      title="Lookbook Tersimpan" 
      icon={<BookOpenIcon className="w-5 h-5 text-stone-600 dark:text-stone-400" />}
      isDisabled={isLoading}
    >
      <ResourceList
        items={savedLookbooks}
        emptyMessage="Lookbook yang Anda simpan akan muncul di sini."
        renderItem={(lookbook: SavedLookbook) => (
          <ResourceItem
            key={lookbook.id}
            id={lookbook.id}
            title={lookbook.name}
            subtitle={lookbook.style}
            thumbnailUrl={lookbook.thumbnailUrl}
            isDisabled={isLoading}
            
            // Rename logic
            isRenaming={renamingId === lookbook.id}
            renameValue={inputValue}
            onRenameChange={setInputValue}
            onRenameSubmit={commitRename}
            onRenameKeyDown={handleKeyDown}
            
            // Actions
            actionButtons={
              <>
                <Button
                  onClick={() => onViewLookbook(lookbook)}
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                  className="bg-transparent hover:bg-stone-200/70 dark:hover:bg-stone-800/70 text-stone-700 dark:text-stone-300 h-8"
                >
                  Buka
                </Button>
                <Button
                  onClick={() => startRename(lookbook.id, lookbook.name)}
                  disabled={isLoading}
                  variant="ghost"
                  size="icon"
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800/70 h-8 w-8"
                  aria-label={`Ubah nama ${lookbook.name}`}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onDeleteLookbook(lookbook.id)}
                  disabled={isLoading}
                  variant="ghost"
                  size="icon"
                  className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 w-8"
                  aria-label={`Hapus ${lookbook.name}`}
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

export default SavedLookbooksPanel;