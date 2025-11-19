/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, CameraIcon, Trash2Icon, PlusIcon, WandSparklesIcon, PencilIcon, DownloadIcon, FileUpIcon, SunIcon, MoonIcon } from './icons';
import { Compare } from './ui/compare';
import { generateModelImage, refineModelImage } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage, cn, appDB, getMimeType } from '../lib/utils';
import Camera from './Camera';
import { CustomModel, StoredCustomModel } from '../types';
import ConfirmationDialog from './AddProductModal';
import { predefinedModels } from '../models';
import JSZip from 'jszip';

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

const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];

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
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingModelId && renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
    }
  }, [renamingModelId]);

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

  const screenVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
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

                // Fix: Re-create the blob with the correct MIME type inferred from the filename.
                const correctMimeType = getMimeType(imageFile.name, imageBlob.type);
                const typedImageBlob = new Blob([imageBlob], { type: correctMimeType });

                await appDB.saveItem('customModels', modelMeta);
                await appDB.saveImage(modelMeta.id, typedImageBlob); // Save the correctly typed blob
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

  if (view === 'uploader') {
    return (
      <>
        <div className="absolute top-4 right-4 z-50">
            <button onClick={onToggleTheme} className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors" aria-label="Toggle theme">
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
        </div>
        <AnimatePresence mode="wait">
          {!userImageUrl ? (
            <motion.div
              key="uploader"
              className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <AnimatePresence>
                {isDraggingOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"
                  >
                    <div className="w-[98%] h-[98%] flex items-center justify-center border-4 border-dashed border-stone-400 dark:border-stone-600 rounded-xl">
                        <div className="text-center text-stone-700 dark:text-stone-300 font-semibold text-2xl font-serif">
                          <p>Letakkan foto Anda di sini</p>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="max-w-lg">
                  <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    Artisan Batik VTO
                  </h1>
                  <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
                    Setiap karya Artisan Batik adalah sebuah cerita. Lihat bagaimana cerita itu menyatu dengan gaya Anda. Unggah foto seluruh badan dan biarkan AI kami menciptakan model pribadi Anda, siap untuk mencoba warisan adiluhung dalam bentuk virtual.
                  </p>
                  <hr className="my-8 border-stone-200 dark:border-stone-800" />
                  <div className="flex flex-col items-center lg:items-start w-full gap-6">
                      <div className="w-full flex flex-col sm:flex-row gap-6">
                         <div className="w-full sm:w-1/2">
                              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 text-center lg:text-left">Warna Latar</p>
                              <label htmlFor="bg-color-picker" className="flex items-center gap-3 cursor-pointer p-1.5 border-2 border-stone-300 dark:border-stone-700 rounded-lg hover:border-stone-400 dark:hover:border-stone-600 transition-colors">
                                  <div className="w-8 h-8 rounded-md border border-stone-200/50 dark:border-stone-800/50" style={{ backgroundColor: backgroundColor }} />
                                  <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{backgroundColor.toUpperCase()}</span>
                                  <input
                                      id="bg-color-picker"
                                      type="color"
                                      value={backgroundColor}
                                      onChange={(e) => setBackgroundColor(e.target.value)}
                                      className="absolute w-0 h-0 opacity-0"
                                  />
                              </label>
                          </div>
                          <div className="w-full sm:w-1/2">
                              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 text-center lg:text-left">Aspek Rasio</p>
                                <select
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                    className="w-full font-mono font-semibold text-stone-800 dark:text-stone-200 p-2.5 border-2 border-stone-300 dark:border-stone-700 rounded-lg hover:border-stone-400 dark:hover:border-stone-600 transition-colors bg-stone-50 dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-500"
                                >
                                    {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                                </select>
                          </div>
                      </div>
                      <div className="flex flex-col items-center lg:items-start w-full gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                              <label htmlFor="image-upload-start" className="w-full relative flex items-center justify-center px-6 py-3 text-base font-semibold text-white dark:text-black bg-black dark:bg-white rounded-md cursor-pointer group hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors">
                              <UploadCloudIcon className="w-5 h-5 mr-3" />
                              Unggah Foto
                              </label>
                              <button onClick={() => setIsCameraOpen(true)} className="w-full relative flex items-center justify-center px-6 py-3 text-base font-semibold text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md cursor-pointer group hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors">
                              <CameraIcon className="w-5 h-5 mr-3" />
                              Gunakan Kamera
                              </button>
                          </div>
                          <input id="image-upload-start" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} />
                          <p className="text-stone-500 dark:text-stone-400 text-sm">Pilih foto seluruh badan yang jelas atau gunakan kamera Anda.</p>
                          
                          <div className="w-full pt-4 mt-2 border-t border-stone-200 dark:border-stone-800">
                            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3 text-center lg:text-left">Atau kelola model Anda</p>
                            <div className="flex items-center justify-center lg:justify-start gap-3">
                                <label htmlFor="model-import-input-uploader" className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md border border-transparent hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors",
                                    (isImporting || isExporting) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                )}>
                                    {isImporting ? <Spinner className="w-4 h-4" /> : <FileUpIcon className="w-4 h-4" />}
                                    {isImporting ? 'Mengimpor...' : 'Impor'}
                                </label>
                                <input 
                                    id="model-import-input-uploader"
                                    type="file"
                                    className="hidden"
                                    accept=".zip"
                                    ref={importFileRef}
                                    onChange={handleImportFileChange}
                                    disabled={isImporting || isExporting}
                                />
                                <button
                                    onClick={handleExportModels}
                                    disabled={isImporting || isExporting || customModels.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md border border-transparent hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isExporting ? <Spinner className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                                    {isExporting ? 'Mengekspor...' : 'Ekspor'}
                                </button>
                            </div>
                          </div>

                          {(customModels.length > 0 || predefinedModels.length > 0) && <button onClick={() => setView('gallery')} className="text-sm font-semibold text-stone-700 dark:text-stone-300 hover:underline">← Kembali ke galeri model</button>}
                          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                      </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
                <Compare
                  firstImage="https://artisanbatik.com/wp-content/uploads/2025/10/before.webp"
                  secondImage="https://artisanbatik.com/wp-content/uploads/2025/10/after.webp"
                  slideMode="drag"
                  className={cn("w-full max-w-sm rounded-2xl bg-stone-200 dark:bg-stone-800", `aspect-[${aspectRatio.replace(':', '/')}]`)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="compare"
              className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="md:w-1/2 flex-shrink-0 flex flex-col items-center md:items-start">
                <div className="text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    Model Anda Telah Siap
                  </h1>
                  <p className="mt-2 text-md text-stone-600 dark:text-stone-400">
                    Seret penggeser untuk melihat perbandingannya. Jika Anda puas, simpan modelnya, atau Anda dapat menyempurnakannya.
                  </p>
                </div>
                
                {isGenerating && (
                  <div className="flex items-center gap-3 text-lg text-stone-700 dark:text-stone-300 font-serif mt-6">
                    <Spinner />
                    <span>Membuat model Anda...</span>
                  </div>
                )}
  
                {error && 
                  <div className="text-center md:text-left text-red-600 max-w-md mt-6">
                    <p className="font-semibold">Operasi Gagal</p>
                    <p className="text-sm mb-4">{error}</p>
                    <button onClick={resetUpload} className="text-sm font-semibold text-stone-700 dark:text-stone-300 hover:underline">Coba Lagi</button>
                  </div>
                }
                
                <AnimatePresence>
                  {generatedModelUrl && !isGenerating && !error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.5 }}
                      className="w-full mt-8"
                    >
                      <div className="p-4 border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 rounded-lg">
                        <h3 className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2"><WandSparklesIcon className="w-5 h-5 text-amber-600" /> Sempurnakan Model</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 mb-4">Tidak suka dengan hasilnya? Coba buat ulang pose atau ubah latar belakang.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button onClick={() => handleRefineModel('pose')} disabled={isRefining} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 rounded-md cursor-pointer border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isRefining ? <Spinner className="w-5 h-5" /> : 'Buat Ulang Pose'}
                          </button>
                          <button onClick={() => handleRefineModel('background')} disabled={isRefining} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 rounded-md cursor-pointer border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isRefining ? <Spinner className="w-5 h-5" /> : 'Ubah Latar'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                        <button 
                          onClick={resetUpload}
                          disabled={isRefining}
                          className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md cursor-pointer hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Gunakan Foto Lain
                        </button>
                        <button 
                          onClick={handleSaveAndStart}
                          disabled={isRefining}
                          className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white dark:text-black bg-black dark:bg-white rounded-md cursor-pointer group hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Simpan & Mulai Menata Gaya &rarr;
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="md:w-1/2 w-full flex items-center justify-center">
                <div 
                  className={`relative rounded-[1.25rem] transition-all duration-700 ease-in-out ${isGenerating || isRefining ? 'border border-stone-300 dark:border-stone-700 animate-pulse' : 'border border-transparent'}`}
                >
                  <Compare
                    firstImage={userImageUrl}
                    secondImage={generatedModelUrl ?? userImageUrl}
                    slideMode="drag"
                    className={cn("w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[400px] rounded-2xl bg-stone-200 dark:bg-stone-800", `aspect-[${aspectRatio.replace(':', '/')}]`)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isCameraOpen && (
            <Camera
              onCapture={handleCapture}
              onClose={() => setIsCameraOpen(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // --- GALLERY VIEW ---
  return (
    <>
      <div className="absolute top-4 right-4 z-50">
          <button onClick={onToggleTheme} className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors" aria-label="Toggle theme">
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
      </div>
      <AnimatePresence>
        {deletingModel && (
          <ConfirmationDialog
            itemType="model"
            itemName={deletingModel.name}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingModel(null)}
          />
        )}
      </AnimatePresence>
      <motion.div
        key="model-gallery"
        className="w-full max-w-5xl mx-auto flex flex-col h-full"
        variants={screenVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="text-center flex-shrink-0">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight text-center">Pilih Model Anda</h1>
            <p className="mt-2 text-md text-stone-600 dark:text-stone-400 text-center">Pilih model siap pakai atau gunakan model kustom Anda.</p>
            <div className="mt-6 flex items-center justify-center gap-4">
                <label htmlFor="model-import-input" className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 rounded-md border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors",
                    (isImporting || isExporting) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}>
                    {isImporting ? <Spinner className="w-4 h-4" /> : <FileUpIcon className="w-4 h-4" />}
                    {isImporting ? 'Mengimpor...' : 'Impor Model'}
                </label>
                <input 
                    id="model-import-input"
                    type="file"
                    className="hidden"
                    accept=".zip"
                    ref={importFileRef}
                    onChange={handleImportFileChange}
                    disabled={isImporting || isExporting}
                />
                <button
                    onClick={handleExportModels}
                    disabled={isImporting || isExporting || customModels.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 rounded-md border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isExporting ? <Spinner className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                    {isExporting ? 'Mengekspor...' : 'Ekspor Model'}
                </button>
            </div>
        </div>
        
        <div className="w-full flex-grow overflow-y-auto mt-8 space-y-10 pr-2">
            {predefinedModels.length > 0 && (
                <div className="w-full">
                    <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-4">Model Siap Pakai</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {predefinedModels.map(model => (
                            <div key={model.id} className="relative group animate-fade-in">
                                <div className={cn("relative overflow-hidden rounded-lg shadow-md", `aspect-[${model.aspectRatio.replace(':', '/')}]`)}>
                                    <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                        <button onClick={() => onSelectModel(model)} className="w-full px-4 py-2 text-base font-semibold text-black bg-white rounded-md hover:bg-stone-200 transition-colors">
                                        Pilih
                                        </button>
                                    </div>
                                </div>
                                <p className="text-center font-semibold text-stone-800 dark:text-stone-200 mt-2">{model.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="w-full">
                <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-4">Model Kustom Anda</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {customModels.map(model => (
                        <div key={model.id} className="relative group animate-fade-in">
                            <div className={cn("relative overflow-hidden rounded-lg shadow-md", `aspect-[${model.aspectRatio.replace(':', '/')}]`)}>
                                <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                    <button onClick={() => onSelectModel(model)} className="w-full px-4 py-2 text-base font-semibold text-black bg-white rounded-md hover:bg-stone-200 transition-colors">
                                    Pilih
                                    </button>
                                </div>
                                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleStartRename(model)} 
                                        className="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
                                        aria-label={`Ubah nama ${model.name}`}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setDeletingModel(model)} 
                                        className="p-1.5 bg-black/40 text-white rounded-full hover:bg-red-600 transition-colors"
                                        aria-label={`Hapus ${model.name}`}
                                    >
                                        <Trash2Icon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-center font-semibold text-stone-800 dark:text-stone-200 mt-2">
                            {renamingModelId === model.id ? (
                                    <input
                                        ref={renameInputRef}
                                        type="text"
                                        value={renameInput}
                                        onChange={(e) => setRenameInput(e.target.value)}
                                        onBlur={handleFinishRename}
                                        onKeyDown={handleRenameKeyDown}
                                        className="w-full text-center bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md px-2 py-1 -my-1 focus:outline-none focus:ring-1 focus:ring-stone-800 dark:focus:ring-stone-200"
                                    />
                            ) : (
                                <p className="truncate" title={model.name}>{model.name}</p>
                            )}
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={() => setView('uploader')} 
                        className={cn(
                        "border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 hover:border-stone-500 dark:hover:border-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors",
                        'aspect-[3/4]'
                        )}
                    >
                        <PlusIcon className="w-8 h-8" />
                        <span className="mt-2 font-semibold">Tambah Model Baru</span>
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    </>
  );
};

export default StartScreen;