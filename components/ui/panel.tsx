
import React from 'react';
import { cn } from '../../lib/utils';

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
      "pt-6 border-t border-stone-400/50 dark:border-stone-700/50 transition-opacity duration-300 flex flex-col",
      isDisabled ? "opacity-50 pointer-events-none" : "opacity-100",
      className
    )}>
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-xl font-serif tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-3">
          {icon && <span className="text-stone-600 dark:text-stone-400">{icon}</span>}
          {title}
        </h2>
        {action && <div>{action}</div>}
      </div>
      <div className={cn("relative flex-grow flex flex-col min-h-0", contentClassName)}>
        {children}
      </div>
    </div>
  );
};
