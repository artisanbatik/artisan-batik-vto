
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { SavedOutfit } from '../types';
import { Trash2Icon, PencilIcon } from './icons';
import { Button } from './ui/button';
import { Panel } from './ui/panel';

interface SavedOutfitsPanelProps {
  savedOutfits: SavedOutfit[];
  onLoadOutfit: (outfit: SavedOutfit) => void;
  onDeleteOutfit: (outfitId: string) => void;
  onRenameOutfit: (outfitId: string, newName: string) => void;
  isLoading: boolean;
}

const SavedOutfitsPanel: React.FC<SavedOutfitsPanelProps> = ({ savedOutfits, onLoadOutfit, onDeleteOutfit, onRenameOutfit, isLoading }) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  const handleStartRename = (outfit: SavedOutfit) => {
    if (isLoading) return;
    setRenamingId(outfit.id);
    setNameInput(outfit.name);
  };

  const handleFinishRename = () => {
    const originalName = savedOutfits.find(o => o.id === renamingId)?.name;
    if (renamingId && nameInput.trim() && nameInput.trim() !== originalName) {
      onRenameOutfit(renamingId, nameInput.trim());
    }
    setRenamingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  };

  return (
    <Panel title="Koleksi Tersimpan" isDisabled={isLoading}>
      {savedOutfits.length > 0 ? (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {savedOutfits.map((outfit) => (
            <div key={outfit.id} className="flex items-center justify-between bg-white/50 dark:bg-stone-900/50 p-2 rounded-lg border border-stone-200/80 dark:border-stone-800/80 animate-fade-in">
              <div className="flex items-center gap-3 flex-grow overflow-hidden">
                <img src={outfit.thumbnailUrl} alt={outfit.name} className="flex-shrink-0 w-12 h-12 object-cover rounded-md" />
                {renamingId === outfit.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={handleFinishRename}
                    onKeyDown={handleKeyDown}
                    className="font-semibold text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md px-2 py-1 -my-1 focus:outline-none focus:ring-1 focus:ring-stone-800 dark:focus:ring-stone-200 w-full"
                  />
                ) : (
                  <span className="font-semibold text-stone-800 dark:text-stone-200 truncate" title={outfit.name}>
                    {outfit.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  onClick={() => onLoadOutfit(outfit)}
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                  className="bg-transparent hover:bg-stone-200/70 dark:hover:bg-stone-800/70 text-stone-700 dark:text-stone-300 h-8"
                >
                  Muat
                </Button>
                <Button
                  onClick={() => handleStartRename(outfit)}
                  disabled={isLoading}
                  variant="ghost"
                  size="icon"
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800/70 h-8 w-8"
                  aria-label={`Ubah nama ${outfit.name}`}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onDeleteOutfit(outfit.id)}
                  disabled={isLoading}
                  variant="ghost"
                  size="icon"
                  className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 w-8"
                  aria-label={`Hapus ${outfit.name}`}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-stone-500 dark:text-stone-400 pt-4">Koleksi yang Anda simpan akan muncul di sini.</p>
      )}
    </Panel>
  );
};

export default SavedOutfitsPanel;
