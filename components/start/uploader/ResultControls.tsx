import React from 'react';
import { WandSparklesIcon, ArrowRightIcon, RotateCcwIcon } from '../../icons';
import { Button } from '../../ui/button';

interface ResultControlsProps {
    onRefinePose: () => void;
    onRefineBackground: () => void;
    onStart: () => void;
    onReset: () => void;
    isRefining: boolean;
    isGenerating: boolean;
    hasGeneratedModel: boolean;
}

export const ResultControls: React.FC<ResultControlsProps> = ({
    onRefinePose, onRefineBackground, onStart, onReset, isRefining, isGenerating, hasGeneratedModel
}) => (
    <div className="w-full max-w-sm space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <Button
                onClick={onRefinePose}
                disabled={isRefining || !hasGeneratedModel}
                variant="secondary"
                className="w-full"
                leftIcon={<WandSparklesIcon className="w-4 h-4"/>}
            >
                Ubah Pose
            </Button>
            <Button
                onClick={onRefineBackground}
                disabled={isRefining || !hasGeneratedModel}
                variant="secondary"
                className="w-full"
                leftIcon={<WandSparklesIcon className="w-4 h-4"/>}
            >
                Ubah Latar
            </Button>
        </div>
        
        <Button
            onClick={onStart}
            disabled={!hasGeneratedModel || isRefining}
            className="w-full py-6 text-lg bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white border-none"
        >
            {isGenerating || isRefining ? 'Sedang Memproses...' : 'Mulai Mencoba Pakaian'} <ArrowRightIcon className="ml-2 w-5 h-5" />
        </Button>
        
        <Button
            onClick={onReset}
            variant="ghost"
            className="w-full text-stone-500 hover:text-red-600"
            leftIcon={<RotateCcwIcon className="w-4 h-4"/>}
        >
            Mulai Ulang
        </Button>
    </div>
);