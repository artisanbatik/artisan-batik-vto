
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { CustomModel } from '../types';
import { predefinedModels } from '../models';
import { SunIcon, MoonIcon } from './icons';
import UploaderView from './start/UploaderView';
import GalleryView from './start/GalleryView';

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
  const [view, setView] = useState<'gallery' | 'uploader'>(customModels.length > 0 || predefinedModels.length > 0 ? 'gallery' : 'uploader');
  
  // Gallery Logic State (Lifted here because GalleryView might unmount/remount)
  const [renamingModelId, setRenamingModelId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [deletingModel, setDeletingModel] = useState<CustomModel | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // --- Handlers for Gallery Actions ---

  const handleStartRename = (model: CustomModel) => {
    setRenamingModelId(model.id);
    setRenameInput(model.name);
  };
  
  const handleFinishRename = () => {
    if (renamingModelId && renameInput.trim()) {
        const originalModel = customModels.find(m => m.id === renamingModelId);
        if (originalModel && originalModel.name !== renameInput.trim()) {
            onRenameModel(renamingModelId, renameInput.trim());
        }
    }
    setRenamingModelId(null);
  };
  
  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleFinishRename();
    } else if (e.key === 'Escape') {
        setRenamingModelId(null);
    }
  };

  const handleConfirmDelete = () => {
    if(deletingModel) {
      onDeleteModel(deletingModel.id);
      setDeletingModel(null);
    }
  };

  // --- Import/Export Handlers (Shared) ---

    const handleExportModels = async () => {
        // Dynamic import to avoid loading heavy zip libs if not needed immediately
        const JSZip = (await import('jszip')).default;
        const { appDB } = await import('../lib/utils');
        const { getFriendlyErrorMessage } = await import('../lib/utils');

        if (!customModels.length) {
            setLoadingError("Tidak ada model kustom untuk diekspor.");
            return;
        }
        setIsExporting(true);
        setLoadingError(null);
        try {
            const zip = new JSZip();
            const metadata = [];

            for (const model of customModels) {
                const modelMeta = { id: model.id, name: model.name, aspectRatio: model.aspectRatio };
                metadata.push(modelMeta);

                const imageBlob = await appDB.getImage(model.id);
                if (imageBlob) {
                    const extension = imageBlob.type.split('/')[1] || 'png';
                    zip.file(`${model.id}.${extension}`, imageBlob);
                }
            }

            zip.file('metadata.json', JSON.stringify(metadata, null, 2));

            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `artisan_batik_models_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (err) {
            console.error("Gagal mengekspor model:", err);
            setLoadingError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), "Gagal mengekspor model."));
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const JSZip = (await import('jszip')).default;
        const { appDB, getMimeType, getFriendlyErrorMessage } = await import('../lib/utils');

        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setLoadingError(null);

        try {
            const zip = await JSZip.loadAsync(file);
            const metadataFile = zip.file('metadata.json');

            if (!metadataFile) {
                throw new Error("File 'metadata.json' tidak ditemukan di dalam ZIP.");
            }

            const metadataContent = await metadataFile.async('string');
            const metadata = JSON.parse(metadataContent);
            
            if (!Array.isArray(metadata)) {
                throw new Error("Format 'metadata.json' tidak valid.");
            }

            for (const modelMeta of metadata) {
                const imageFile = zip.file(new RegExp(`^${modelMeta.id}\\.(jpg|jpeg|png|webp|heic|heif|avif)$`))[0];
                if (!imageFile) {
                    console.warn(`File gambar untuk model '${modelMeta.name}' tidak ditemukan.`);
                    continue;
                }

                const imageBlob = await imageFile.async('blob');
                const correctMimeType = getMimeType(imageFile.name, imageBlob.type);
                const typedImageBlob = new Blob([imageBlob], { type: correctMimeType });

                await appDB.saveItem('customModels', modelMeta);
                await appDB.saveImage(modelMeta.id, typedImageBlob);
            }

            onModelsImported();

        } catch (err) {
            console.error("Gagal mengimpor model:", err);
            setLoadingError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), "Gagal mengimpor model."));
        } finally {
            setIsImporting(false);
            e.target.value = ''; // Reset input
        }
    };

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
          <button onClick={onToggleTheme} className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors" aria-label="Toggle theme">
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
      </div>
      
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
            renamingModelId={renamingModelId}
            renameInput={renameInput}
            deletingModel={deletingModel}
            
            onSelectModel={onSelectModel}
            onImportFileChange={handleImportFileChange}
            onExportModels={handleExportModels}
            onSetViewUploader={() => setView('uploader')}
            
            setDeletingModel={setDeletingModel}
            handleConfirmDelete={handleConfirmDelete}
            handleStartRename={handleStartRename}
            setRenameInput={setRenameInput}
            handleFinishRename={handleFinishRename}
            handleRenameKeyDown={handleRenameKeyDown}
        />
      )}
    </>
  );
};

export default StartScreen;
