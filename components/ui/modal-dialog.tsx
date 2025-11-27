
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '../icons';
import { cn } from '../../lib/utils';

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className, 
  footer,
  maxWidth = "max-w-md"
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative bg-white dark:bg-stone-900 rounded-2xl w-full flex flex-col shadow-xl max-h-[90vh]",
              maxWidth,
              className
            )}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-stone-800 flex-shrink-0">
              <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">
                {title}
              </h2>
              <button 
                onClick={onClose} 
                className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 transition-colors" 
                aria-label="Tutup"
              >
                <XIcon className="w-6 h-6"/>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto min-h-0">
              {children}
            </div>

            {footer && (
              <div className="flex justify-end gap-3 p-4 bg-stone-50/70 dark:bg-stone-950/70 border-t dark:border-stone-800 rounded-b-2xl flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
