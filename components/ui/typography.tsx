
import React from 'react';
import { cn } from '../../lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

export const Heading: React.FC<HeadingProps> = ({ 
  level = 1, 
  className, 
  children, 
  ...props 
}) => {
  const BaseTag = `h${level}` as React.ElementType;
  
  const styles = {
    1: "text-4xl md:text-5xl font-bold leading-tight",
    2: "text-2xl md:text-3xl font-bold tracking-wider",
    3: "text-xl font-bold tracking-wide",
    4: "text-lg font-bold"
  };

  return (
    <BaseTag 
      className={cn(
        "font-serif text-stone-900 dark:text-stone-100", 
        styles[level], 
        className
      )} 
      {...props}
    >
      {children}
    </BaseTag>
  );
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'small' | 'large';
}

export const Text: React.FC<TextProps> = ({ 
  variant = 'default', 
  className, 
  children, 
  ...props 
}) => {
  const styles = {
    default: "text-base text-stone-700 dark:text-stone-300",
    muted: "text-sm text-stone-500 dark:text-stone-400",
    small: "text-xs text-stone-500 dark:text-stone-400",
    large: "text-lg text-stone-800 dark:text-stone-200"
  };

  return (
    <p 
      className={cn("font-sans", styles[variant], className)} 
      {...props}
    >
      {children}
    </p>
  );
};
