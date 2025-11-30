/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { cn } from '../../lib/utils';
import Spinner from './spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 duration-200 ease-in-out";
    
    const variants = {
      default: "bg-stone-900 text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300 focus:ring-stone-900 dark:focus:ring-stone-300",
      secondary: "bg-stone-200 text-stone-900 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700 focus:ring-stone-500",
      outline: "border-2 border-stone-300 bg-transparent hover:bg-stone-100 text-stone-700 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 focus:ring-stone-500",
      ghost: "bg-transparent hover:bg-stone-100 text-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      link: "text-stone-900 underline-offset-4 hover:underline dark:text-stone-100 active:scale-100 p-0 h-auto",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10 p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Spinner className="w-4 h-4 mr-2" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };