/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useRef } from 'react';
import { generateModelImage, refineModelImage } from '../services/geminiService';
import { getFriendlyErrorMessage, appDB, getMimeType } from '../lib/utils';
import { CustomModel, StoredCustomModel } from '../types';
import { predefinedModels } from '../models';
import JSZip from 'jszip';
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

const StartScreen: React.FC<StartScreenProps> = ({ onAddModel, onSelectModel, onDeleteModel, onRenameModel, customModels, onModelsImported, setLoadingError, theme, onToggleTheme }) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#f3f2ef');
  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [deletingModel, setDeletingModel] = useState<CustomModel | null>(null);
  const [view, setView] = useState<'gallery' | 'uploader'>(customModels.length > 0 || predefinedModels.length > 0 ? 'gallery' : 'uploader');
  
  const [renamingModelId, setRenamingModelId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Silakan pilih file gambar.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUserImageUrl(dataUrl);
        setIsGenerating(true);
        setGeneratedModelUrl(null);
        setError(null);
        try {
            const result = await generateModelImage(file, backgroundColor, aspectRatio);
            setGeneratedModelUrl(result);
        } catch (err) {
            setError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal membuat model'));
            setUserImageUrl(null);
        } finally {
            setIsGenerating(false);
        }
    };
    reader.readAsDataURL(file);
  }, [backgroundColor, aspectRatio]);

  const handleCapture = (file: File) => {
    setIsCameraOpen(false);
    handleFileSelect(file);
  };
  
  const handleRefineModel = async (refinementType: 'pose' | 'background') => {
      if (!generatedModelUrl) return;

      setIsRefining(true);
      setError(null);
      let prompt = '';
      if (refinementType === 'pose') {
          prompt = `Gunakan gambar model yang disediakan sebagai referensi, buat ulang dengan pose berdiri yang sedikit berbeda namun tetap elegan. Pertahankan identitas, fitur wajah, tipe tubuh, dan latar belakang yang sama persis. Hanya variasikan posenya secara halus.`;
      } else if (refinementType === 'background') {
          prompt = `Gunakan gambar model yang disediakan sebagai referensi, buat ulang gambar tersebut dengan orang dan pose yang sama persis. SATU-SATUNYA perubahan adalah latar belakang, yang HARUS berupa warna studio solid dengan kode hex yang sama persis ini: ${backgroundColor}.`;
      }

      try {
          const newUrl = await refineModelImage(generatedModelUrl, prompt, aspectRatio);
          setGeneratedModelUrl(newUrl);
      } catch (err) {
          setError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal menyempurnakan model'));
      } finally {
          setIsRefining(false);
      }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDraggingOver(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const resetUpload = () => {
    setUserImageUrl(null);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
    if (customModels.length > 0 || predefinedModels.length > 0) {
      setView('gallery');
    }
  };
  
  const handleConfirmDelete = () => {
    if(deletingModel) {
      onDeleteModel(deletingModel.id);
      setDeletingModel(null);
    }
  };
  
  const handleSaveAndStart = () => {
    if (generatedModelUrl) {
      onAddModel(generatedModelUrl, aspectRatio);
    }
  };

    const handleExportModels = async () => {
        if (!customModels.length) {
            setLoadingError("Tidak ada model kustom untuk diekspor.");
            return;
        }
        setIsExporting(true);
        setLoadingError(null);
        try {
            const zip = new JSZip();
            const metadata: StoredCustomModel[] = [];

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
            const metadata = JSON.parse(metadataContent) as StoredCustomModel[];
            
            if (!Array.isArray(metadata) || !metadata.every(m => m.id && m.name)) {
                throw new Error("Format 'metadata.json' tidak valid.");
            }

            for (const modelMeta of metadata) {
                const imageFile = zip.file(new RegExp(`^${modelMeta.id}\\.(jpg|jpeg|png|webp|heic|heif|avif)$`))[0];
                if (!imageFile) {
                    console.warn(`File gambar untuk model '${modelMeta.name}' (ID: ${modelMeta.id}) tidak ditemukan di ZIP.`);
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
            setLoadingError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), "Gagal mengimpor model. Pastikan file ZIP valid."));
        } finally {
            setIsImporting(false);
            if(importFileRef.current) {
                importFileRef.current.value = '';
            }
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
            userImageUrl={userImageUrl}
            generatedModelUrl={generatedModelUrl}
            isGenerating={isGenerating}
            isRefining={isRefining}
            error={error}
            isDraggingOver={isDraggingOver}
            backgroundColor={backgroundColor}
            aspectRatio={aspectRatio}
            isCameraOpen={isCameraOpen}
            isImporting={isImporting}
            isExporting={isExporting}
            customModels={customModels}
            hasPredefinedModels={predefinedModels.length > 0}
            
            setBackgroundColor={setBackgroundColor}
            setAspectRatio={setAspectRatio}
            onFileChange={handleFileChange}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            setIsCameraOpen={setIsCameraOpen}
            onCapture={handleCapture}
            onImportFileChange={handleImportFileChange}
            onExportModels={handleExportModels}
            onViewGallery={() => setView('gallery')}
            onRefineModel={handleRefineModel}
            onResetUpload={resetUpload}
            onSaveAndStart={handleSaveAndStart}
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
