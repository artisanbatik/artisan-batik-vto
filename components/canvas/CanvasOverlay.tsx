
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Spinner from '../ui/spinner';

interface CanvasOverlayProps {
  isLoading: boolean;
  loadingMessage: string;
  hasImage: boolean;
}

export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  isLoading,
  loadingMessage,
  hasImage
}) => {
  return (
    <>
      {/* Empty State / Placeholder */}
      {!hasImage && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full max-w-md max-h-[80vh] bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-md font-serif text-stone-600 dark:text-stone-300 mt-4">Memuat Model...</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
            <motion.div
                className="absolute inset-0 bg-white/90 dark:bg-stone-900/90 flex flex-col items-center justify-center z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Spinner />
                {loadingMessage && (
                    <p className="text-lg font-serif text-stone-700 dark:text-stone-300 mt-4 text-center px-4">{loadingMessage}</p>
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
