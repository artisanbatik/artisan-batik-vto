
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
import { PageLayout } from './ui/page-layout';

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
    <PageLayout className="flex flex-col relative">
      <div className="absolute top-4 right-4 z-50">
          <ThemeToggle 
            theme={theme} 
            onToggle={onToggleTheme} 
            className="text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
          />
      </div>
      
      {/* 
         Removed p-4 padding from PageLayout and flex centering from main.
         Views are now responsible for their own internal padding and centering 
         to ensure full control over scrolling behavior.
      */}
      <main className="w-full h-full relative overflow-hidden">
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
          <div className="w-full h-full p-4 sm:p-6 md:p-8">
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
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default StartScreen;
