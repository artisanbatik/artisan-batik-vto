
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ModalDialog } from './ui/modal-dialog';

interface ConfirmationDialogProps {
  itemType: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ itemType, itemName, onConfirm, onCancel }) => {
  
  const footer = (
      <>
        <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-stone-700 rounded-md hover:bg-gray-200 dark:hover:bg-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-stone-500"
        >
            Batal
        </button>
        <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
            Hapus
        </button>
      </>
  );

  return (
    <ModalDialog
        isOpen={true}
        onClose={onCancel}
        title="Konfirmasi Penghapusan"
        footer={footer}
        maxWidth="max-w-sm"
    >
        <p className="text-gray-600 dark:text-gray-300 my-2">
          Apakah Anda yakin ingin menghapus {itemType} bernama <span className="font-semibold">"{itemName}"</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
    </ModalDialog>
  );
};

export default ConfirmationDialog;
