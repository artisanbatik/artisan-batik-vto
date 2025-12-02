
import React, { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FileUpIcon, DownloadIcon } from '../icons';
import Camera from '../Camera';
import { CustomModel } from '../../types';
import { Button } from '../ui';
import { useModelGenerator } from '../../hooks/useModelGenerator';
import { useUploaderSettings } from '../../hooks/useUploaderSettings';

// Extracted Components
import { UploaderHeader } from './uploader/UploaderHeader';
import { InputSection } from './uploader/InputSection';
import { ResultControls } from './uploader/ResultControls';
import { PreviewSection } from './uploader/PreviewSection';

interface UploaderViewProps {
  customModels: CustomModel[];
  hasPredefinedModels: boolean;
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportModels: () => void;
  onViewGallery: () => void;
  onSaveAndStart: (modelUrl: string, aspectRatio: string) => void;
  isImporting: boolean;
  isExporting: boolean;
}

const UploaderView: React.FC<UploaderViewProps> = (props) => {
  // Use custom hook for settings
  const settings = useUploaderSettings();
  const { 
      backgroundColor, 
      aspectRatio, 
      isCameraOpen, 
      setIsCameraOpen 
  } = settings;

  const { 
      userImageUrl, generatedModelUrl, isGenerating, isRefining, error, 
      generateModel, refineModel, reset 
  } = useModelGenerator();

  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
     if(importFileRef.current) importFileRef.current.click();
  }

  const handleFileSelect = (file: File) => {
     generateModel(file, backgroundColor, aspectRatio);
  };

  const handleCapture = (file: File) => {
    setIsCameraOpen(false);
    generateModel(file, backgroundColor, aspectRatio);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto relative animate-fade-in">
        
        {/* Top Right Controls */}
        <div className="absolute top-0 right-0 p-4 z-20 flex gap-2">
            {(props.customModels.length > 0 || props.hasPredefinedModels) && (
                 <Button 
                    onClick={props.onViewGallery}
                    variant="outline"
                    className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md"
                 >
                    Lihat Galeri
                 </Button>
            )}
        </div>

        <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Column: Input & Controls */}
                <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                    <UploaderHeader />

                    {!userImageUrl ? (
                        <InputSection 
                            onFileSelect={handleFileSelect}
                            config={settings}
                        />
                    ) : (
                        <ResultControls 
                            onRefinePose={() => refineModel('pose', backgroundColor, aspectRatio)}
                            onRefineBackground={() => refineModel('background', backgroundColor, aspectRatio)}
                            onStart={() => generatedModelUrl && props.onSaveAndStart(generatedModelUrl, aspectRatio)}
                            onReset={reset}
                            isRefining={isRefining}
                            isGenerating={isGenerating}
                            hasGeneratedModel={!!generatedModelUrl}
                        />
                    )}
                    
                    {/* Advanced Options */}
                    <div className="flex gap-4 pt-8 text-sm text-stone-500">
                        <button onClick={handleImportClick} className="hover:text-stone-800 dark:hover:text-stone-300 underline underline-offset-4 flex items-center gap-1">
                            <FileUpIcon className="w-3 h-3"/> Impor
                        </button>
                        <input 
                            ref={importFileRef}
                            type="file" 
                            accept=".zip" 
                            className="hidden" 
                            onChange={props.onImportFileChange}
                        />
                        <button onClick={props.onExportModels} className="hover:text-stone-800 dark:hover:text-stone-300 underline underline-offset-4 flex items-center gap-1">
                            <DownloadIcon className="w-3 h-3"/> Ekspor
                        </button>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="order-1 lg:order-2 flex justify-center w-full">
                    <PreviewSection 
                        userImageUrl={userImageUrl}
                        generatedModelUrl={generatedModelUrl}
                        isProcessing={isGenerating || isRefining}
                        isRefining={isRefining}
                        error={error}
                    />
                </div>
            </div>
        </div>

        <AnimatePresence>
            {isCameraOpen && (
                <Camera onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
            )}
        </AnimatePresence>
    </div>
  );
};

export default UploaderView;
