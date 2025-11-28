
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState } from 'react';
import { CustomModel } from '../types';
import { predefinedModels } from '../models';

interface UseStartScreenStateProps {
  customModels: CustomModel[];
  onRenameModel: (modelId: string, newName: string) => void;
  onDeleteModel: (modelId: string) => void;
  onModelsImported: () => void;
  setLoadingError: (error: string | null) => void;
}

export const useStartScreenState = ({
  customModels,
  onRenameModel,
  onDeleteModel,
  onModelsImported,
  setLoadingError,
}: UseStartScreenStateProps) => {
  // State for View Navigation
  const [view, setView] = useState<'gallery' | 'uploader'>(
    customModels.length > 0 || predefinedModels.length > 0 ? 'gallery' : 'uploader'
  );

  // State for Gallery Logic (Delete only now)
  const [deletingModel, setDeletingModel] = useState<CustomModel | null>(null);
  
  // State for Import/Export
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleConfirmDelete = () => {
    if(deletingModel) {
      onDeleteModel(deletingModel.id);
      setDeletingModel(null);
    }
  };

  // --- Import/Export Handlers ---

  const handleExportModels = async () => {
      // Dynamic import to avoid loading heavy zip libs if not needed immediately
      const JSZip = (await import('jszip')).default;
      const { appDB, getFriendlyErrorMessage } = await import('../lib/utils');

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

  return {
      // State
      view,
      setView,
      deletingModel,
      setDeletingModel,
      isImporting,
      isExporting,

      // Actions
      handleConfirmDelete,
      handleExportModels,
      handleImportFileChange
  };
};
