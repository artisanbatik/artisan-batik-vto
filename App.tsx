
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

// Components
import StartScreen from './components/StartScreen';
import StudioScreen from './components/StudioScreen';

// Hooks & Services
import { useTheme } from './hooks/useTheme';
import { useAppPersistence } from './hooks/useAppPersistence';

// Types
import { CustomModel } from './types';

// --- Main App Component ---
const App: React.FC = () => {
  // Hooks
  const { theme, toggleTheme } = useTheme();
  
  // App Logic / Persistence
  const {
      loadingError, setLoadingError, wardrobe, savedOutfits, customModels, productInfoHistory, savedLookbooks, refreshCustomModels, actions: persistenceActions
  } = useAppPersistence();

  // Local State
  const [activeScreen, setActiveScreen] = useState<'start' | 'dressing'>('start');
  const [selectedModel, setSelectedModel] = useState<CustomModel | null>(null);

  // --- Navigation & Model Handlers ---

  const handleStartOver = () => {
    setSelectedModel(null);
    setActiveScreen('start');
  };
  
  // Custom Model Handlers
  const handleAddModel = async (modelUrl: string, aspectRatio: string) => {
      const name = `Model ${customModels.length + 1}`;
      const newModel: CustomModel = {
          id: `model-${Date.now()}`,
          name: name,
          imageUrl: modelUrl,
          aspectRatio,
      };
      await persistenceActions.addCustomModel(newModel);
      handleSelectModel({ ...newModel, imageUrl: modelUrl }); 
  };
  
  const handleSelectModel = (model: CustomModel) => {
      setSelectedModel(model);
      setActiveScreen('dressing');
  };


  if (activeScreen === 'start') {
    return (
      <div className="w-screen h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden">
          <main className="flex-grow flex items-center justify-center">
              <StartScreen 
                onAddModel={handleAddModel} 
                onSelectModel={handleSelectModel}
                customModels={customModels}
                onDeleteModel={persistenceActions.deleteCustomModel}
                onRenameModel={persistenceActions.renameCustomModel}
                onModelsImported={refreshCustomModels}
                setLoadingError={setLoadingError}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
          </main>
      </div>
    )
  }

  return (
    <StudioScreen 
        // Initial State
        initialModel={selectedModel}

        // Data props
        wardrobe={wardrobe}
        savedOutfits={savedOutfits}
        savedLookbooks={savedLookbooks}
        productInfoHistory={productInfoHistory}
        persistenceActions={persistenceActions}
        
        // Actions
        onStartOver={handleStartOver}
        
        // Theme
        theme={theme}
        onToggleTheme={toggleTheme}
    />
  );
};

export default App;
