
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState } from 'react';

export const useInlineRename = (onRename: (id: string, newName: string) => void) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setInputValue(currentName);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setInputValue('');
  };

  const commitRename = () => {
    // Cari nama asli jika diperlukan logic validasi 'change check' di sini, 
    // tapi biasanya caller (onRename) yang melakukan cek final atau hook ini bisa menerima originalName map.
    // Untuk simplifikasi, kita kirim saja jika tidak kosong.
    if (renamingId && inputValue.trim()) {
      onRename(renamingId, inputValue.trim());
    }
    cancelRename();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        commitRename();
    } else if (e.key === 'Escape') {
        cancelRename();
    }
  };

  return {
    renamingId,
    inputValue,
    setInputValue,
    startRename,
    cancelRename,
    commitRename,
    handleKeyDown
  };
};
