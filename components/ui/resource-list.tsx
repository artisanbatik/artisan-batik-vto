
import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ResourceItemProps {
  id: string;
  thumbnailUrl?: string;
  title: string;
  subtitle?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  
  // Actions
  onClick?: () => void;
  actionButtons?: React.ReactNode;
  
  // Renaming State
  isRenaming?: boolean;
  renameValue?: string;
  onRenameChange?: (value: string) => void;
  onRenameSubmit?: () => void;
  onRenameKeyDown?: (e: React.KeyboardEvent) => void;
}

export const ResourceItem: React.FC<ResourceItemProps> = ({
  id,
  thumbnailUrl,
  title,
  subtitle,
  isActive,
  isDisabled,
  onClick,
  actionButtons,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onRenameKeyDown
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-2 rounded-lg border transition-all duration-200 animate-fade-in",
        isActive 
          ? 'bg-white/80 dark:bg-stone-900/80 border-stone-800 dark:border-stone-200 ring-2 ring-stone-800 dark:ring-stone-200' 
          : 'bg-white/50 dark:bg-stone-900/50 border-stone-200/80 dark:border-stone-800/80',
        !isActive && !isDisabled && "hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:border-stone-400 dark:hover:border-stone-600",
        isDisabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <div 
        className={cn("flex items-center gap-3 flex-grow overflow-hidden", onClick && !isDisabled ? "cursor-pointer" : "")}
        onClick={!isDisabled ? onClick : undefined}
      >
        {thumbnailUrl && (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="flex-shrink-0 w-12 h-12 object-cover rounded-md bg-stone-200 dark:bg-stone-800" 
          />
        )}
        
        <div className="flex-grow overflow-hidden">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => onRenameChange?.(e.target.value)}
              onBlur={onRenameSubmit}
              onKeyDown={onRenameKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-md px-2 py-1 -my-1 focus:outline-none focus:ring-1 focus:ring-stone-800 dark:focus:ring-stone-200 w-full text-sm"
            />
          ) : (
            <p className="font-semibold text-stone-800 dark:text-stone-200 truncate text-sm" title={title}>
              {title}
            </p>
          )}
          
          {subtitle && (
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actionButtons && (
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {actionButtons}
        </div>
      )}
    </div>
  );
};

interface ResourceListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  maxHeight?: string;
}

export const ResourceList = <T,>({ 
  items, 
  renderItem, 
  emptyMessage = "Tidak ada item.", 
  className,
  maxHeight = "max-h-48"
}: ResourceListProps<T>) => {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-stone-500 dark:text-stone-400 pt-4">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("space-y-2 overflow-y-auto pr-2", maxHeight, className)}>
      {items.map(renderItem)}
    </div>
  );
};
