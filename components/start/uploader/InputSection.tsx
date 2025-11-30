
import React from 'react';
import { CameraIcon } from '../../icons';
import { Button } from '../../ui/button';
import { Select } from '../../ui/select';
import { FileDropzone } from '../../ui/file-dropzone';
import { UploaderSettings } from '../../../hooks/useUploaderSettings';

interface InputSectionProps {
    onFileSelect: (file: File) => void;
    config: UploaderSettings;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
    onFileSelect, 
    config 
}) => {
    const { 
        aspectRatio, 
        setAspectRatio, 
        backgroundColor, 
        setBackgroundColor, 
        setIsCameraOpen,
        ASPECT_RATIOS 
    } = config;

    return (
        <div className="w-full max-w-sm space-y-4">
            <FileDropzone 
                onFileSelect={onFileSelect}
                subLabel="PNG, JPG, WEBP hingga 10MB"
            />
            
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
    );
};
