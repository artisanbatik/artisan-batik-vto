
import React, { useRef, useEffect } from 'react';
import { PencilIcon, Trash2Icon, PlusIcon } from '../../icons';
import { CustomModel } from '../../../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { ImageCard } from '../../ui/image-card';
import { useInlineRename } from '../../../hooks/useInlineRename';
import { cn } from '../../../lib/utils';

interface CustomModelGridProps {
    models: CustomModel[];
    onSelect: (m: CustomModel) => void;
    onSetViewUploader: () => void;
    onRenameModel: (id: string, newName: string) => void;
    setDeletingModel: (m: CustomModel | null) => void;
}

export const CustomModelGrid: React.FC<CustomModelGridProps> = ({ 
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
        <div className="w-full animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {models.map(model => {
                    const isRenaming = renamingId === model.id;
                    return (
                        <ImageCard
                            key={model.id}
                            imageUrl={model.imageUrl}
                            aspectRatio={model.aspectRatio}
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
