
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ModalDialog } from './modal-dialog';
import { Button } from './button';

interface ConfirmationDialogProps {
  itemType: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  itemType, 
  itemName, 
  onConfirm, 
  onCancel,
  title = "Konfirmasi Penghapusan",
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  variant = 'danger'
}) => {
  
  const footer = (
      <>
        <Button
            onClick={onCancel}
            variant="secondary"
        >
            {cancelLabel}
        </Button>
        <Button
            onClick={onConfirm}
            variant={variant === 'danger' ? 'destructive' : 'default'}
        >
            {confirmLabel}
        </Button>
      </>
  );

  return (
    <ModalDialog
        isOpen={true}
        onClose={onCancel}
        title={title}
        footer={footer}
        maxWidth="max-w-sm"
    >
        <p className="text-stone-600 dark:text-stone-300 my-2">
          Apakah Anda yakin ingin menghapus {itemType} bernama <span className="font-semibold">"{itemName}"</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
    </ModalDialog>
  );
};
