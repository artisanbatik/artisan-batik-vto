
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { CustomModel } from '../../types';
import { cn } from '../../lib/utils';

// Extracted Components
import { GalleryHeader } from './gallery/GalleryHeader';
import { PredefinedModelGrid } from './gallery/PredefinedModelGrid';
import { CustomModelGrid } from './gallery/CustomModelGrid';

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
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
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
        
        <div className="flex justify-center mt-6">
             <div className="flex p-1 bg-stone-200 dark:bg-stone-800 rounded-lg">
                <button
                    onClick={() => setActiveTab('predefined')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-md transition-all",
                        activeTab === 'predefined' 
                            ? "bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100" 
                            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    )}
                >
                    Model Siap Pakai
                </button>
                <button
                    onClick={() => setActiveTab('custom')}
                    className={cn(
                         "px-4 py-2 text-sm font-medium rounded-md transition-all",
                        activeTab === 'custom' 
                            ? "bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100" 
                            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    )}
                >
                    Model Saya
                </button>
             </div>
        </div>

        <div className="w-full flex-grow overflow-y-auto mt-6 space-y-10 pr-2 pb-10">
            {activeTab === 'predefined' ? (
                <PredefinedModelGrid 
                    models={props.predefinedModels}
                    onSelect={props.onSelectModel}
                />
            ) : (
                <CustomModelGrid 
                    models={props.customModels}
                    onSelect={props.onSelectModel}
                    onSetViewUploader={props.onSetViewUploader}
                    onRenameModel={props.onRenameModel}
                    setDeletingModel={props.setDeletingModel}
                />
            )}
        </div>
      </motion.div>
    </>
  );
};

export default GalleryView;
