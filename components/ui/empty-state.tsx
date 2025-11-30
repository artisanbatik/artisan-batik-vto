
import React from 'react';
import { cn } from '../../lib/utils';
import { Text } from './typography';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-8 px-4", className)}>
      {icon && (
        <div className="mb-4 p-3 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">
          {title}
        </h3>
      )}
      {description && (
        <Text variant="muted" className="max-w-xs mx-auto mb-4">
          {description}
        </Text>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};
