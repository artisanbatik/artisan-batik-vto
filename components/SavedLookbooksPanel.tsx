/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { SavedLookbook } from '../types';
import { Trash2Icon, PencilIcon, BookOpenIcon } from './icons';

interface SavedLookbooksPanelProps {
  savedLookbooks: SavedLookbook[];
  onDeleteLookbook: (lookbookId: string) => void;
  onRenameLookbook: (lookbookId: string, newName: string) => void;
  onViewLookbook: (lookbook: SavedLookbook) => void;
  isLoading: boolean;
}

const SavedLookbooksPanel: React.FC<SavedLookbooksPanelProps> = ({ savedLookbooks, onDeleteLookbook, onRenameLookbook, onViewLookbook, isLoading }) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  const handleStartRename = (lookbook: SavedLookbook) => {
    if (isLoading) return;
    setRenamingId(lookbook.id);
    setNameInput(lookbook.name);
  };

  const handleFinishRename = () => {
    const originalName = savedLookbooks.find(o => o.id === renamingId)?.name;
    if (renamingId && nameInput.trim() && nameInput.trim() !== originalName) {
      onRenameLookbook(renamingId, nameInput.trim());
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
    <div className="pt-6 border-t border-stone-400/50 dark:border-stone-700/50">
      <h2 className="text-xl font-serif tracking-wider text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-3">
        <BookOpenIcon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
        Lookbook Tersimpan
      </h2>
      {savedLookbooks.length > 0 ? (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {savedLookbooks.map((lookbook) => (
            <div key={lookbook.id} className="flex items-center justify-between bg-white/50 dark:bg-stone-900/50 p-2 rounded-lg border border-stone-200/80 dark:border-stone-800/80 animate-fade-in">
              <div className="flex items-center gap-3 flex-grow overflow-hidden">
                <img src={lookbook.thumbnailUrl} alt={lookbook.name} className="flex-shrink-0 w-12 h-12 object-cover rounded-md" />
                <div className="flex-grow overflow-hidden">
                    {renamingId === lookbook.id ? (
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
                      <p className="font-semibold text-stone-800 dark:text-stone-200 truncate" title={lookbook.name}>
                        {lookbook.name}
                      </p>
                    )}
                    <p className="text-xs text-stone-500 dark:text-stone-400">{lookbook.style}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onViewLookbook(lookbook)}
                  disabled={isLoading}
                  className="text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors px-3 py-1 rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-800/70 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buka
                </button>
                <button
                  onClick={() => handleStartRename(lookbook)}
                  disabled={isLoading}
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors p-2 rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-800/70 disabled:opacity-50"
                  aria-label={`Ubah nama ${lookbook.name}`}
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteLookbook(lookbook.id)}
                  disabled={isLoading}
                  className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Hapus ${lookbook.name}`}
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-stone-500 dark:text-stone-400 pt-4">Lookbook yang Anda simpan akan muncul di sini.</p>
      )}
    </div>
  );
};

export default SavedLookbooksPanel;