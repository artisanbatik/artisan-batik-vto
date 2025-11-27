import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpIcon, DownloadIcon, PencilIcon, Trash2Icon, PlusIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';
import ConfirmationDialog from '../../components/AddProductModal';
import { cn } from '../../lib/utils';
import { CustomModel } from '../../types';

interface GalleryViewProps {
  customModels: CustomModel[];
  predefinedModels: CustomModel[];
  isImporting: boolean;
  isExporting: boolean;
  renamingModelId: string | null;
  renameInput: string;
  deletingModel: CustomModel | null;
  
  // Handlers
  onSelectModel: (model: CustomModel) => void;
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportModels: () => void;
  onSetViewUploader: () => void;
  setDeletingModel: (model: CustomModel | null) => void;
  handleConfirmDelete: () => void;
  handleStartRename: (model: CustomModel) => void;
  setRenameInput: (input: string) => void;
  handleFinishRename: () => void;
  handleRenameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const screenVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
};

const GalleryView: React.FC<GalleryViewProps> = (props) => {
  const importFileRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus rename input on change
  React.useEffect(() => {
    if (props.renamingModelId && renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
    }
  }, [props.renamingModelId]);


  return (
    <>
      <AnimatePresence>
        {props.deletingModel && (
          <ConfirmationDialog
            itemType="model"
            itemName={props.deletingModel.name}
            onConfirm={props.handleConfirmDelete}
            onCancel={() => props.setDeletingModel(null)}
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
                    (props.isImporting || props.isExporting) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}>
                    {props.isImporting ? <Spinner className="w-4 h-4" /> : <FileUpIcon className="w-4 h-4" />}
                    {props.isImporting ? 'Mengimpor...' : 'Impor Model'}
                </label>
                <input 
                    id="model-import-input"
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 rounded-md border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {props.isExporting ? <Spinner className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                    {props.isExporting ? 'Mengekspor...' : 'Ekspor Model'}
                </button>
            </div>
        </div>
        
        <div className="w-full flex-grow overflow-y-auto mt-8 space-y-10 pr-2">
            {props.predefinedModels.length > 0 && (
                <div className="w-full">
                    <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-4">Model Siap Pakai</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {props.predefinedModels.map(model => (
                            <div key={model.id} className="relative group animate-fade-in">
                                <div className={cn("relative overflow-hidden rounded-lg shadow-md", `aspect-[${model.aspectRatio.replace(':', '/')}]`)}>
                                    <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                        <button onClick={() => props.onSelectModel(model)} className="w-full px-4 py-2 text-base font-semibold text-black bg-white rounded-md hover:bg-stone-200 transition-colors">
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
                    {props.customModels.map(model => (
                        <div key={model.id} className="relative group animate-fade-in">
                            <div className={cn("relative overflow-hidden rounded-lg shadow-md", `aspect-[${model.aspectRatio.replace(':', '/')}]`)}>
                                <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                    <button onClick={() => props.onSelectModel(model)} className="w-full px-4 py-2 text-base font-semibold text-black bg-white rounded-md hover:bg-stone-200 transition-colors">
                                    Pilih
                                    </button>
                                </div>
                                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => props.handleStartRename(model)} 
                                        className="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
                                        aria-label={`Ubah nama ${model.name}`}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => props.setDeletingModel(model)} 
                                        className="p-1.5 bg-black/40 text-white rounded-full hover:bg-red-600 transition-colors"
                                        aria-label={`Hapus ${model.name}`}
                                    >
                                        <Trash2Icon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-center font-semibold text-stone-800 dark:text-stone-200 mt-2">
                            {props.renamingModelId === model.id ? (
                                    <input
                                        ref={renameInputRef}
                                        type="text"
                                        value={props.renameInput}
                                        onChange={(e) => props.setRenameInput(e.target.value)}
                                        onBlur={props.handleFinishRename}
                                        onKeyDown={props.handleRenameKeyDown}
                                        className="w-full text-center bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md px-2 py-1 -my-1 focus:outline-none focus:ring-1 focus:ring-stone-800 dark:focus:ring-stone-200"
                                    />
                            ) : (
                                <p className="truncate" title={model.name}>{model.name}</p>
                            )}
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={props.onSetViewUploader} 
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

export default GalleryView;
