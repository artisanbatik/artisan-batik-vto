
import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircleIcon } from '../icons';

interface ImageCardProps {
  imageUrl: string;
  title?: React.ReactNode;
  subtitle?: string;
  aspectRatio?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  /** Actions to display in the top-right corner on hover */
  actionButtons?: React.ReactNode;
  /** Content to display in the center on hover (e.g. "Select" button) */
  overlayContent?: React.ReactNode;
  /** If true, the title is displayed inside the card at the bottom with a gradient. If false, title is below the card. */
  titleOverlay?: boolean;
  className?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  imageUrl,
  title,
  subtitle,
  aspectRatio = "3:4", // Default portrait
  isActive = false,
  isDisabled = false,
  onClick,
  actionButtons,
  overlayContent,
  titleOverlay = false,
  className,
}) => {
  // Safe aspect ratio handling for Tailwind class interpolation
  // Tailwind doesn't support dynamic class construction like `aspect-[${val}]` perfectly in all JIT modes without safelist
  // But since we use standard ratios in the app, we can rely on style prop for arbitrary ratios or standard classes
  const ratioStyle = { aspectRatio: aspectRatio.replace(':', '/') };

  return (
    <div className={cn("group flex flex-col", className)}>
      <div 
        className={cn(
          "relative overflow-hidden rounded-lg shadow-sm border transition-all duration-200",
          isActive 
            ? "ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 border-stone-900 dark:border-stone-100" 
            : "border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600",
          isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        )}
        style={ratioStyle}
        onClick={!isDisabled ? onClick : undefined}
      >
        <img 
          src={imageUrl} 
          alt={typeof title === 'string' ? title : 'Card Image'} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          draggable={false}
        />
        
        {/* Active Indicator Overlay */}
        {isActive && (
           <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center z-10">
              <CheckCircleIcon className="w-8 h-8 text-white drop-shadow-md animate-fade-in" />
           </div>
        )}

        {/* Hover Overlay Background */}
        <div className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            (overlayContent || actionButtons) && !isActive ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
        )} />

        {/* Center Overlay Content (Buttons etc) */}
        {overlayContent && !isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                {overlayContent}
            </div>
        )}

        {/* Top Right Actions */}
        {actionButtons && (
            <div className="absolute top-2 right-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {actionButtons}
            </div>
        )}

        {/* Title Overlay (Bottom Gradient) */}
        {titleOverlay && title && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                <div className="text-white text-xs font-semibold truncate text-center">
                    {title}
                </div>
                {subtitle && <div className="text-white/80 text-[10px] truncate text-center">{subtitle}</div>}
            </div>
        )}
      </div>

      {/* Title Below Card */}
      {!titleOverlay && title && (
        <div className="mt-2 text-center">
             <div className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate px-1">
                {title}
             </div>
             {subtitle && <div className="text-xs text-stone-500 dark:text-stone-400 truncate">{subtitle}</div>}
        </div>
      )}
    </div>
  );
};
