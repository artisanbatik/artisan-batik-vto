
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';

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
  // 1. App-Level Configuration & Persistence
  const { theme, toggleTheme } = useTheme();
  
  const {
      loadingError, 
      setLoadingError, 
      wardrobe, 
      savedOutfits, 
      customModels, 
      productInfoHistory, 
      savedLookbooks, 
      refreshCustomModels, 
      actions: persistenceActions
  } = useAppPersistence();

  // 2. Navigation State
  const [activeScreen, setActiveScreen] = useState<'start' | 'dressing'>('start');
  const [selectedModel, setSelectedModel] = useState<CustomModel | null>(null);

  // 3. Handlers (Wrapped in useCallback for performance)
  
  const handleSelectModel = useCallback((model: CustomModel) => {
      setSelectedModel(model);
      setActiveScreen('dressing');
  }, []);

  const handleStartOver = useCallback(() => {
    setSelectedModel(null);
    setActiveScreen('start');
  }, []);
  
  const handleAddModel = useCallback(async (modelUrl: string, aspectRatio: string) => {
      // Logic for creating a new model entry
      const name = `Model ${customModels.length + 1}`;
      const newModel: CustomModel = {
          id: `model-${Date.now()}`,
          name: name,
          imageUrl: modelUrl,
          aspectRatio,
      };
      
      await persistenceActions.addCustomModel(newModel);
      
      // Auto-select the newly added model
      handleSelectModel({ ...newModel, imageUrl: modelUrl }); 
  }, [customModels.length, persistenceActions, handleSelectModel]);


  // 4. Render Logic (Router)

  if (activeScreen === 'start') {
    return (
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
    );
  }

  // Active Screen: 'dressing'
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
