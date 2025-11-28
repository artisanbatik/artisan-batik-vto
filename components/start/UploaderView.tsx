
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, CameraIcon, FileUpIcon, DownloadIcon, WandSparklesIcon, RotateCcwIcon, CheckCircleIcon, ArrowRightIcon } from '../../components/icons';
import { Compare } from '../../components/ui/compare';
import Spinner from '../../components/Spinner';
import Camera from '../../components/Camera';
import { cn } from '../../lib/utils';
import { CustomModel } from '../../types';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { useModelGenerator } from '../../hooks/useModelGenerator';

interface UploaderViewProps {
  customModels: CustomModel[];
  hasPredefinedModels: boolean;
  
  // Actions
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportModels: () => void;
  onViewGallery: () => void;
  onSaveAndStart: (modelUrl: string, aspectRatio: string) => void;
  
  // State for Import/Export loading from parent
  isImporting: boolean;
  isExporting: boolean;
}

const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];

const UploaderView: React.FC<UploaderViewProps> = (props) => {
  // Local State for UI preferences
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#f3f2ef');
  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Hook for Model Generation Logic
  const { 
      userImageUrl, generatedModelUrl, isGenerating, isRefining, error, 
      generateModel, refineModel, reset 
  } = useModelGenerator();

  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
     if(importFileRef.current) importFileRef.current.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      generateModel(e.target.files[0], backgroundColor, aspectRatio);
    }
  };

  const handleCapture = (file: File) => {
    setIsCameraOpen(false);
    generateModel(file, backgroundColor, aspectRatio);
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        generateModel(e.dataTransfer.files[0], backgroundColor, aspectRatio);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 animate-fade-in relative w-full max-w-5xl mx-auto">
        
        {/* Gallery & Import Controls (Top Right) */}
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

        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column: Input Area */}
            <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
                        Studio Virtual<br /><span className="text-stone-500">Artisan Batik</span>
                    </h1>
                    <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-md">
                        Unggah foto diri Anda untuk membuat model virtual yang dipersonalisasi. Coba koleksi batik eksklusif kami secara instan.
                    </p>
                </div>

                {!userImageUrl ? (
                    <div className="w-full max-w-sm space-y-4">
                        <div 
                            className={cn(
                                "border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group",
                                isDraggingOver 
                                    ? "border-stone-800 bg-stone-100 dark:border-stone-200 dark:bg-stone-800" 
                                    : "border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900"
                            )}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <div className="w-16 h-16 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloudIcon className="w-8 h-8 text-stone-600 dark:text-stone-400" />
                            </div>
                            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Klik untuk unggah atau seret foto</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">PNG, JPG, WEBP hingga 10MB</p>
                            <input 
                                id="file-upload" 
                                type="file" 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" 
                                onChange={handleFileChange} 
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="h-px bg-stone-300 dark:bg-stone-700 flex-grow"></div>
                            <span className="text-xs text-stone-400 font-medium uppercase">Atau</span>
                            <div className="h-px bg-stone-300 dark:bg-stone-700 flex-grow"></div>
                        </div>

                        <Button 
                            onClick={() => setIsCameraOpen(true)}
                            variant="outline"
                            className="w-full py-6"
                            leftIcon={<CameraIcon className="w-5 h-5" />}
                        >
                            Ambil Foto
                        </Button>

                         {/* Settings (only visible before upload) */}
                         <div className="grid grid-cols-2 gap-4 pt-2">
                             <div>
                                <Select
                                    label="Rasio Aspek"
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                    options={ASPECT_RATIOS.map(r => ({ value: r, label: r }))}
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">Warna Latar</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="h-10 w-full p-0 border-0 rounded-md cursor-pointer"
                                    />
                                </div>
                             </div>
                         </div>
                    </div>
                ) : (
                    <div className="w-full max-w-sm space-y-3">
                        {/* Action Buttons for Result Phase */}
                        <div className="grid grid-cols-2 gap-3">
                             <Button
                                onClick={() => refineModel('pose', backgroundColor, aspectRatio)}
                                disabled={isRefining || !generatedModelUrl}
                                variant="secondary"
                                className="w-full"
                                leftIcon={<WandSparklesIcon className="w-4 h-4"/>}
                             >
                                 Ubah Pose
                             </Button>
                             <Button
                                onClick={() => refineModel('background', backgroundColor, aspectRatio)}
                                disabled={isRefining || !generatedModelUrl}
                                variant="secondary"
                                className="w-full"
                                leftIcon={<WandSparklesIcon className="w-4 h-4"/>}
                             >
                                 Ubah Latar
                             </Button>
                        </div>
                        
                        <Button
                            onClick={() => generatedModelUrl && props.onSaveAndStart(generatedModelUrl, aspectRatio)}
                            disabled={!generatedModelUrl || isRefining}
                            className="w-full py-6 text-lg bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white border-none"
                        >
                            {isGenerating || isRefining ? 'Sedang Memproses...' : 'Mulai Mencoba Pakaian'} <ArrowRightIcon className="ml-2 w-5 h-5" />
                        </Button>
                        
                        <Button
                            onClick={reset}
                            variant="ghost"
                            className="w-full text-stone-500 hover:text-red-600"
                            leftIcon={<RotateCcwIcon className="w-4 h-4"/>}
                        >
                            Mulai Ulang
                        </Button>
                    </div>
                )}
                
                {/* Advanced Options / Import Export */}
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

            {/* Right Column: Preview / Result Area */}
            <div className="order-1 lg:order-2 flex justify-center w-full">
                <div className={cn(
                    "relative w-full max-w-md aspect-[3/4] bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-700",
                    !userImageUrl && "border-dashed"
                )}>
                    {!userImageUrl ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                             <div className="w-32 h-48 bg-stone-200 dark:bg-stone-700 rounded-lg mb-4 animate-pulse"></div>
                             <p>Pratinjau Model</p>
                        </div>
                    ) : (
                        <>
                             {generatedModelUrl ? (
                                <Compare
                                    firstImage={userImageUrl}
                                    secondImage={generatedModelUrl}
                                    firstImageClassName="object-contain bg-stone-100"
                                    secondImageClassname="object-contain bg-stone-100"
                                    className="h-full w-full"
                                    slideMode="hover"
                                />
                             ) : (
                                <img src={userImageUrl} alt="Upload User" className="w-full h-full object-contain" />
                             )}

                             <AnimatePresence>
                                {(isGenerating || isRefining) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6"
                                    >
                                        <Spinner className="w-10 h-10 mb-4" />
                                        <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 font-semibold">
                                            {isRefining ? 'Menyempurnakan...' : 'Sedang Membuat Model'}
                                        </h3>
                                        <p className="text-stone-600 dark:text-stone-400 mt-2">
                                            {isRefining ? 'Sedang menyesuaikan pose atau latar belakang.' : 'AI sedang mengubah foto Anda menjadi model studio profesional.'}
                                        </p>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                             
                             {error && (
                                 <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
                                     {error}
                                 </div>
                             )}
                        </>
                    )}
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