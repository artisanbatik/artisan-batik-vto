
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
import { usePersistence } from './PersistenceContext';

interface StartScreenProps {
  onSelectModel: (model: CustomModel) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ 
    onSelectModel, 
    theme, 
    onToggleTheme 
}) => {
  // Access global data from context
  const { 
      customModels, 
      actions: { addCustomModel, deleteCustomModel, renameCustomModel },
      refreshCustomModels,
      setLoadingError
  } = usePersistence();

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
      onRenameModel: renameCustomModel,
      onDeleteModel: deleteCustomModel,
      onModelsImported: refreshCustomModels,
      setLoadingError
  });

  const handleAddModel = async (modelUrl: string, aspectRatio: string) => {
      const name = `Model ${customModels.length + 1}`;
      const newModel: CustomModel = {
          id: `model-${Date.now()}`,
          name: name,
          imageUrl: modelUrl,
          aspectRatio,
      };
      
      await addCustomModel(newModel);
      
      // Auto-select the newly added model
      onSelectModel({ ...newModel, imageUrl: modelUrl }); 
  };

  return (
    <PageLayout className="flex flex-col relative">
      <div className="absolute top-4 right-4 z-50">
          <ThemeToggle 
            theme={theme} 
            onToggle={onToggleTheme} 
            className="text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
          />
      </div>
      
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
              onSaveAndStart={handleAddModel}
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
                onRenameModel={renameCustomModel}
            />
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default StartScreen;
