import React from 'react';
import { FileUpIcon, DownloadIcon } from '../../icons';
import { Button } from '../../ui/button';

interface GalleryHeaderProps {
    isImporting: boolean;
    isExporting: boolean;
    hasCustomModels: boolean;
    onImportClick: () => void;
    onExportClick: () => void;
    onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    importFileRef: React.RefObject<HTMLInputElement>;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
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