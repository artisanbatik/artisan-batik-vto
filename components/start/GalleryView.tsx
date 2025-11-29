
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpIcon, DownloadIcon, PencilIcon, Trash2Icon, PlusIcon } from '../../components/icons';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { cn } from '../../lib/utils';
import { CustomModel } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ImageCard } from '../../components/ui/image-card';
import { useInlineRename } from '../../hooks/useInlineRename';

// --- Sub-components ---

interface GalleryHeaderProps {
    isImporting: boolean;
    isExporting: boolean;
    hasCustomModels: boolean;
    onImportClick: () => void;
    onExportClick: () => void;
    onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    importFileRef: React.RefObject<HTMLInputElement>;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({
    isImporting, isExporting, hasCustomModels, onImportClick, onExportClick, onImportFileChange, importFileRef
}) => (
    <div className="text-center flex-shrink-0">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight text-center">Pilih Model Anda</h1>
        <p className="mt-2 text-md text-stone-600 dark:text-stone-400 text-center">Pilih model siap pakai atau gunakan model kustom Anda.</p>
        <div className="mt-6 flex items-center justify-center gap-4">
            <Button 
                onClick={onImportClick}
                variant="outline"
                className="bg-white dark:bg-stone-800"
                disabled={isImporting || isExporting}
                isLoading={isImporting}
                leftIcon={!isImporting && <FileUpIcon className="w-4 h-4" />}
            >
                {isImporting ? 'Mengimpor...' : 'Impor Model'}
            </Button>
            
            <input 
                id="model-import-input"
                type="file"
                className="hidden"
                accept=".zip"
                ref={importFileRef}
                onChange={onImportFileChange}
                disabled={isImporting || isExporting}
            />
            
            <Button
                onClick={onExportClick}
                variant="outline"
                className="bg-white dark:bg-stone-800"
                disabled={isImporting || isExporting || !hasCustomModels}
                isLoading={isExporting}
                leftIcon={!isExporting && <DownloadIcon className="w-4 h-4" />}
            >
                {isExporting ? 'Mengekspor...' : 'Ekspor Model'}
            </Button>
        </div>
    </div>
);

const PredefinedModelGrid: React.FC<{ models: CustomModel[], onSelect: (m: CustomModel) => void }> = ({ models, onSelect }) => {
    if (models.length === 0) return null;
    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-4">Model Siap Pakai</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {models.map(model => (
                    <ImageCard
                        key={model.id}
                        imageUrl={model.imageUrl}
                        title={model.name}
                        aspectRatio={model.aspectRatio}
                        className="animate-fade-in"
                        overlayContent={
                            <Button onClick={() => onSelect(model)} variant="secondary" className="w-full bg-white text-black hover:bg-stone-200 shadow-md">
                                Pilih
                            </Button>
                        }
                    />
                ))}
            </div>
        </div>
    );
};

interface CustomModelGridProps {
    models: CustomModel[];
    onSelect: (m: CustomModel) => void;
    onSetViewUploader: () => void;
    onRenameModel: (id: string, newName: string) => void;
    setDeletingModel: (m: CustomModel | null) => void;
}

const CustomModelGrid: React.FC<CustomModelGridProps> = ({ 
    models, onSelect, onSetViewUploader, onRenameModel, setDeletingModel 
}) => {
    const renameInputRef = useRef<HTMLInputElement>(null);
    const {
        renamingId,
        inputValue,
        setInputValue,
        startRename,
        commitRename,
        handleKeyDown
    } = useInlineRename(onRenameModel);

    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-4">Model Kustom Anda</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {models.map(model => {
                    const isRenaming = renamingId === model.id;
                    return (
                        <ImageCard
                            key={model.id}
                            imageUrl={model.imageUrl}
                            aspectRatio={model.aspectRatio}
                            className="animate-fade-in"
                            title={
                                isRenaming ? (
                                    <Input
                                        ref={renameInputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onBlur={commitRename}
                                        onKeyDown={handleKeyDown}
                                        className="w-full text-center h-7 px-2 py-0 text-sm -my-0.5"
                                    />
                                ) : (
                                    model.name
                                )
                            }
                            overlayContent={
                                <Button onClick={() => onSelect(model)} variant="secondary" className="w-full bg-white text-black hover:bg-stone-200 shadow-md">
                                    Pilih
                                </Button>
                            }
                            actionButtons={
                                <>
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); startRename(model.id, model.name); }}
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 border-none backdrop-blur-md"
                                        title="Ubah Nama"
                                    >
                                        <PencilIcon className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                        onClick={(e) => { e.stopPropagation(); setDeletingModel(model); }} 
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-red-600 border-none backdrop-blur-md"
                                        title="Hapus Model"
                                    >
                                        <Trash2Icon className="w-3.5 h-3.5" />
                                    </Button>
                                </>
                            }
                        />
                    );
                })}
                <Button 
                    onClick={onSetViewUploader} 
                    variant="outline"
                    className={cn(
                        "h-auto flex-col border-dashed rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400",
                        'aspect-[3/4]'
                    )}
                >
                    <PlusIcon className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-center">Tambah<br/>Model Baru</span>
                </Button>
            </div>
        </div>
    );
};

// --- Main Component ---

interface GalleryViewProps {
  customModels: CustomModel[];
  predefinedModels: CustomModel[];
  isImporting: boolean;
  isExporting: boolean;
  deletingModel: CustomModel | null;
  onSelectModel: (model: CustomModel) => void;
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportModels: () => void;
  onSetViewUploader: () => void;
  setDeletingModel: (model: CustomModel | null) => void;
  handleConfirmDelete: () => void;
  onRenameModel: (id: string, newName: string) => void;
}

const screenVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
};

const GalleryView: React.FC<GalleryViewProps> = (props) => {
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
     if(importFileRef.current) importFileRef.current.click();
  }

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
        <GalleryHeader 
            isImporting={props.isImporting}
            isExporting={props.isExporting}
            hasCustomModels={props.customModels.length > 0}
            onImportClick={handleImportClick}
            onExportClick={props.onExportModels}
            onImportFileChange={props.onImportFileChange}
            importFileRef={importFileRef}
        />
        
        <div className="w-full flex-grow overflow-y-auto mt-8 space-y-10 pr-2 pb-10">
            <PredefinedModelGrid 
                models={props.predefinedModels}
                onSelect={props.onSelectModel}
            />

            <CustomModelGrid 
                models={props.customModels}
                onSelect={props.onSelectModel}
                onSetViewUploader={props.onSetViewUploader}
                onRenameModel={props.onRenameModel}
                setDeletingModel={props.setDeletingModel}
            />
        </div>
      </motion.div>
    </>
  );
};

export default GalleryView;
