
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WandSparklesIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useStudio } from '../studio/StudioContext';

export const PoseSelector: React.FC = () => {
  const {
      poseInstructions,
      currentPoseIndex,
      availablePoseKeys,
      handleSelectPose,
      handleGenerateCommonPoses,
      isVTOLoading,
      isMobile
  } = useStudio();

  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);

  const handlePreviousPose = () => {
    if (isVTOLoading) return;
    const newIndex = (currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length;
    handleSelectPose(newIndex);
  };

  const handleNextPose = () => {
    if (isVTOLoading) return;
    const newIndex = (currentPoseIndex + 1) % poseInstructions.length;
    handleSelectPose(newIndex);
  };

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 flex flex-col items-center",
        isMobile ? "bottom-4" : "bottom-12 md:opacity-0 md:group-hover:opacity-100"
      )}
      onMouseEnter={isMobile ? undefined : () => setIsPoseMenuOpen(true)}
      onMouseLeave={isMobile ? undefined : () => setIsPoseMenuOpen(false)}
    >
      {/* Pose popover menu */}
      <AnimatePresence>
        {isPoseMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full mb-3 w-72 bg-white dark:bg-stone-900 rounded-xl p-2 border border-stone-200/80 dark:border-stone-700/80 shadow-lg"
          >
            <div className="p-2 border-b border-stone-200 dark:border-stone-700 mb-2">
              <Button
                onClick={handleGenerateCommonPoses}
                disabled={isVTOLoading}
                variant="default"
                className="w-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-stone-600 dark:hover:bg-stone-300"
                leftIcon={<WandSparklesIcon className="w-4 h-4" />}
              >
                Buat 4 Pose Umum
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {poseInstructions.map((pose, index) => {
                const isGenerated = availablePoseKeys.includes(pose);
                const isCurrent = index === currentPoseIndex;

                return (
                  <Button
                    key={pose}
                    onClick={() => handleSelectPose(index)}
                    disabled={isVTOLoading || isCurrent}
                    variant="ghost"
                    className={cn(
                        "w-full justify-between px-2 h-auto py-2 text-xs font-medium",
                        isCurrent && "bg-stone-100 dark:bg-stone-800"
                    )}
                    rightIcon={
                        isCurrent ? (
                            <CheckCircleIcon className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400 flex-shrink-0" />
                        ) : isGenerated ? (
                            <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        ) : (
                            <WandSparklesIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )
                    }
                  >
                    <span className="truncate">{pose}</span>
                  </Button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        onClick={isMobile ? () => setIsPoseMenuOpen(prev => !prev) : undefined}
        className="flex items-center justify-center gap-2 bg-white/90 dark:bg-stone-900/90 rounded-full p-1.5 border border-stone-300/50 dark:border-stone-700/50 shadow-md backdrop-blur-sm"
      >
        <Button
          onClick={handlePreviousPose}
          aria-label="Pose sebelumnya"
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800/50 h-8 w-8"
          disabled={isVTOLoading}
        >
          <ChevronLeftIcon className="w-5 h-5 text-stone-800 dark:text-stone-200" />
        </Button>
        <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 w-48 text-center truncate px-2 select-none" title={poseInstructions[currentPoseIndex]}>
          {poseInstructions[currentPoseIndex]}
        </span>
        <Button
          onClick={handleNextPose}
          aria-label="Pose berikutnya"
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800/50 h-8 w-8"
          disabled={isVTOLoading}
        >
          <ChevronRightIcon className="w-5 h-5 text-stone-800 dark:text-stone-200" />
        </Button>
      </div>
    </div>
  );
};
