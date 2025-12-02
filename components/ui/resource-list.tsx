
import React from 'react';
import { cn } from '../../lib/utils';
import { EmptyState } from './empty-state';
import { PackageIcon } from 'lucide-react';

interface ResourceListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const ResourceList = <T,>({ 
  items, 
  renderItem, 
  emptyMessage = "Tidak ada item.", 
  emptyIcon,
  className,
  maxHeight = "max-h-48"
}: ResourceListProps<T>) => {
  if (items.length === 0) {
    return (
      <EmptyState 
        icon={emptyIcon || <PackageIcon className="w-5 h-5"/>}
        description={emptyMessage}
        className="py-6"
      />
    );
  }

  return (
    <div className={cn("space-y-2 overflow-y-auto pr-2", maxHeight, className)}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};
