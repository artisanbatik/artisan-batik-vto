
import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'default', 
  size = 'md',
  children,
  ...props 
}) => {
  const variants = {
    default: "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent",
    secondary: "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-transparent",
    outline: "text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700",
    ghost: "bg-transparent text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
};
