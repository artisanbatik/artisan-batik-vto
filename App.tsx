
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';

// Components
import StartScreen from './components/StartScreen';
import StudioScreen from './components/StudioScreen';
import { PersistenceProvider, usePersistence } from './components/PersistenceContext';

// Hooks & Services
import { useTheme } from './hooks/useTheme';

// Types
import { CustomModel } from './types';

// --- Main App Content ---
const AppContent: React.FC = () => {
  // 1. App-Level Configuration
  const { theme, toggleTheme } = useTheme();
  
  // Consume Data from Context
  const {
      wardrobe, 
      savedOutfits, 
      productInfoHistory, 
      savedLookbooks, 
      actions: persistenceActions
  } = usePersistence();

  // 2. Navigation State
  const [activeScreen, setActiveScreen] = useState<'start' | 'dressing'>('start');
  const [selectedModel, setSelectedModel] = useState<CustomModel | null>(null);

  // 3. Handlers
  const handleSelectModel = useCallback((model: CustomModel) => {
      setSelectedModel(model);
      setActiveScreen('dressing');
  }, []);

  const handleStartOver = useCallback(() => {
    setSelectedModel(null);
    setActiveScreen('start');
  }, []);

  // 4. Render Logic (Router)

  if (activeScreen === 'start') {
    return (
      <StartScreen 
        onSelectModel={handleSelectModel}
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

        // Data props (StudioScreen still expects these for now)
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

// --- Root App Wrapper ---
const App: React.FC = () => {
    return (
        <PersistenceProvider>
            <AppContent />
        </PersistenceProvider>
    );
};

export default App;
