
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { cn } from '../../lib/utils';

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "w-screen h-screen overflow-hidden transition-colors duration-300 font-sans",
        "bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100", // Tema Default
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
