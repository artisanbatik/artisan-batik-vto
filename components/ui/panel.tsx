
import React from 'react';
import { cn } from '../../lib/utils';
import { Heading } from './typography';

interface PanelProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  isDisabled?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ 
  title, 
  icon, 
  action, 
  children, 
  className,
  contentClassName,
  isDisabled = false
}) => {
  return (
    <div className={cn(
      "flex flex-col h-full transition-opacity duration-300",
      isDisabled ? "opacity-50 pointer-events-none" : "opacity-100",
      className
    )}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
            {icon && (
                <div className="p-2 bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300">
                    {icon}
                </div>
            )}
            <Heading level={4} className="text-stone-800 dark:text-stone-200 font-sans tracking-tight">
              {title}
            </Heading>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={cn("relative flex-grow flex flex-col min-h-0", contentClassName)}>
        {children}
      </div>
    </div>
  );
};
