
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { CustomModel } from '../types';
import { predefinedModels } from '../models';
import UploaderView from './start/UploaderView';
import GalleryView from './start/GalleryView';
import { useStartScreenState } from '../hooks/useStartScreenState';
import { ThemeToggle } from './ui/theme-toggle';

interface StartScreenProps {
  onAddModel: (modelUrl: string, aspectRatio: string) => void;
  onSelectModel: (model: CustomModel) => void;
  onDeleteModel: (modelId: string) => void;
  onRenameModel: (modelId: string, newName: string) => void;
  customModels: CustomModel[];
  onModelsImported: () => void;
  setLoadingError: (error: string | null) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ 
    onAddModel, 
    onSelectModel, 
    onDeleteModel, 
    onRenameModel, 
    customModels, 
    onModelsImported, 
    setLoadingError, 
    theme, 
    onToggleTheme 
}) => {
  const {
      view,
      setView,
      deletingModel,
      setDeletingModel,
      isImporting,
      isExporting,
      handleConfirmDelete,
      handleExportModels,
      handleImportFileChange
  } = useStartScreenState({
      customModels,
      onRenameModel,
      onDeleteModel,
      onModelsImported,
      setLoadingError
  });

  return (
    <div className="w-screen h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
          <ThemeToggle 
            theme={theme} 
            onToggle={onToggleTheme} 
            className="text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
          />
      </div>
      
      <main className="flex-grow flex items-center justify-center w-full h-full relative">
        {view === 'uploader' ? (
          <UploaderView
              customModels={customModels}
              hasPredefinedModels={predefinedModels.length > 0}
              
              isImporting={isImporting}
              isExporting={isExporting}
              
              onImportFileChange={handleImportFileChange}
              onExportModels={handleExportModels}
              onViewGallery={() => setView('gallery')}
              onSaveAndStart={(url, ratio) => onAddModel(url, ratio)}
          />
        ) : (
          <GalleryView
              customModels={customModels}
              predefinedModels={predefinedModels}
              
              isImporting={isImporting}
              isExporting={isExporting}
              deletingModel={deletingModel}
              
              onSelectModel={onSelectModel}
              onImportFileChange={handleImportFileChange}
              onExportModels={handleExportModels}
              onSetViewUploader={() => setView('uploader')}
              
              setDeletingModel={setDeletingModel}
              handleConfirmDelete={handleConfirmDelete}
              onRenameModel={onRenameModel}
          />
        )}
      </main>
    </div>
  );
};

export default StartScreen;