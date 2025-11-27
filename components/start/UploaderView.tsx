import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, CameraIcon, FileUpIcon, DownloadIcon, WandSparklesIcon } from '../../components/icons';
import { Compare } from '../../components/ui/compare';
import Spinner from '../../components/Spinner';
import Camera from '../../components/Camera';
import { cn } from '../../lib/utils';
import { CustomModel } from '../../types';

interface UploaderViewProps {
  userImageUrl: string | null;
  generatedModelUrl: string | null;
  isGenerating: boolean;
  isRefining: boolean;
  error: string | null;
  isDraggingOver: boolean;
  backgroundColor: string;
  aspectRatio: string;
  isCameraOpen: boolean;
  isImporting: boolean;
  isExporting: boolean;
  customModels: CustomModel[];
  hasPredefinedModels: boolean;
  
  // Handlers
  setBackgroundColor: (color: string) => void;
  setAspectRatio: (ratio: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  setIsCameraOpen: (isOpen: boolean) => void;
  onCapture: (file: File) => void;
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportModels: () => void;
  onViewGallery: () => void;
  onRefineModel: (type: 'pose' | 'background') => void;
  onResetUpload: () => void;
  onSaveAndStart: () => void;
}

const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];

const screenVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
};

const UploaderView: React.FC<UploaderViewProps> = (props) => {
  const importFileRef = useRef<HTMLInputElement>(null);

  // Helper handler wrapper to reset input value after selection
  const handleImportClick = () => {
     if(importFileRef.current) importFileRef.current.click();
  }

  return (
    <>
    <AnimatePresence mode="wait">
      {!props.userImageUrl ? (
        <motion.div
          key="uploader"
          className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onDragEnter={props.onDragEnter}
          onDragLeave={props.onDragLeave}
          onDragOver={props.onDragOver}
          onDrop={props.onDrop}
        >
          <AnimatePresence>
            {props.isDraggingOver && (
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
                              <div className="w-8 h-8 rounded-md border border-stone-200/50 dark:border-stone-800/50" style={{ backgroundColor: props.backgroundColor }} />
                              <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{props.backgroundColor.toUpperCase()}</span>
                              <input
                                  id="bg-color-picker"
                                  type="color"
                                  value={props.backgroundColor}
                                  onChange={(e) => props.setBackgroundColor(e.target.value)}
                                  className="absolute w-0 h-0 opacity-0"
                              />
                          </label>
                      </div>
                      <div className="w-full sm:w-1/2">
                          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 text-center lg:text-left">Aspek Rasio</p>
                            <select
                                value={props.aspectRatio}
                                onChange={(e) => props.setAspectRatio(e.target.value)}
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
                          <button onClick={() => props.setIsCameraOpen(true)} className="w-full relative flex items-center justify-center px-6 py-3 text-base font-semibold text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md cursor-pointer group hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors">
                          <CameraIcon className="w-5 h-5 mr-3" />
                          Gunakan Kamera
                          </button>
                      </div>
                      <input id="image-upload-start" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={props.onFileChange} />
                      <p className="text-stone-500 dark:text-stone-400 text-sm">Pilih foto seluruh badan yang jelas atau gunakan kamera Anda.</p>
                      
                      <div className="w-full pt-4 mt-2 border-t border-stone-200 dark:border-stone-800">
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3 text-center lg:text-left">Atau kelola model Anda</p>
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                            <label htmlFor="model-import-input-uploader" className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md border border-transparent hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors",
                                (props.isImporting || props.isExporting) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                            )}>
                                {props.isImporting ? <Spinner className="w-4 h-4" /> : <FileUpIcon className="w-4 h-4" />}
                                {props.isImporting ? 'Mengimpor...' : 'Impor'}
                            </label>
                            <input 
                                id="model-import-input-uploader"
                                type="file"
                                className="hidden"
                                accept=".zip"
                                ref={importFileRef}
                                onChange={props.onImportFileChange}
                                disabled={props.isImporting || props.isExporting}
                            />
                            <button
                                onClick={props.onExportModels}
                                disabled={props.isImporting || props.isExporting || props.customModels.length === 0}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-800 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md border border-transparent hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {props.isExporting ? <Spinner className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                                {props.isExporting ? 'Mengekspor...' : 'Ekspor'}
                            </button>
                        </div>
                      </div>

                      {(props.customModels.length > 0 || props.hasPredefinedModels) && <button onClick={props.onViewGallery} className="text-sm font-semibold text-stone-700 dark:text-stone-300 hover:underline">← Kembali ke galeri model</button>}
                      {props.error && <p className="text-red-500 text-sm mt-2">{props.error}</p>}
                  </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
            <Compare
              firstImage="https://artisanbatik.com/wp-content/uploads/2025/10/before.webp"
              secondImage="https://artisanbatik.com/wp-content/uploads/2025/10/after.webp"
              slideMode="drag"
              className={cn("w-full max-w-sm rounded-2xl bg-stone-200 dark:bg-stone-800", `aspect-[${props.aspectRatio.replace(':', '/')}]`)}
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
            
            {props.isGenerating && (
              <div className="flex items-center gap-3 text-lg text-stone-700 dark:text-stone-300 font-serif mt-6">
                <Spinner />
                <span>Membuat model Anda...</span>
              </div>
            )}

            {props.error && 
              <div className="text-center md:text-left text-red-600 max-w-md mt-6">
                <p className="font-semibold">Operasi Gagal</p>
                <p className="text-sm mb-4">{props.error}</p>
                <button onClick={props.onResetUpload} className="text-sm font-semibold text-stone-700 dark:text-stone-300 hover:underline">Coba Lagi</button>
              </div>
            }
            
            <AnimatePresence>
              {props.generatedModelUrl && !props.isGenerating && !props.error && (
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
                      <button onClick={() => props.onRefineModel('pose')} disabled={props.isRefining} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 rounded-md cursor-pointer border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {props.isRefining ? <Spinner className="w-5 h-5" /> : 'Buat Ulang Pose'}
                      </button>
                      <button onClick={() => props.onRefineModel('background')} disabled={props.isRefining} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 rounded-md cursor-pointer border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {props.isRefining ? <Spinner className="w-5 h-5" /> : 'Ubah Latar'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                    <button 
                      onClick={props.onResetUpload}
                      disabled={props.isRefining}
                      className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-800 rounded-md cursor-pointer hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gunakan Foto Lain
                    </button>
                    <button 
                      onClick={props.onSaveAndStart}
                      disabled={props.isRefining}
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
              className={`relative rounded-[1.25rem] transition-all duration-700 ease-in-out ${props.isGenerating || props.isRefining ? 'border border-stone-300 dark:border-stone-700 animate-pulse' : 'border border-transparent'}`}
            >
              <Compare
                firstImage={props.userImageUrl}
                secondImage={props.generatedModelUrl ?? props.userImageUrl}
                slideMode="drag"
                className={cn("w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[400px] rounded-2xl bg-stone-200 dark:bg-stone-800", `aspect-[${props.aspectRatio.replace(':', '/')}]`)}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <AnimatePresence>
      {props.isCameraOpen && (
        <Camera
          onCapture={props.onCapture}
          onClose={() => props.setIsCameraOpen(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
};

export default UploaderView;
