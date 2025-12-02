import React from 'react';
import { MoonIcon, SunIcon } from '../icons';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
  variant?: 'ghost' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  theme, 
  onToggle, 
  className, 
  variant = 'ghost',
  size = 'icon'
}) => {
  return (
    <Button
      onClick={onToggle}
      variant={variant}
      size={size}
      className={cn("rounded-full", className)}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
    </Button>
  );
};
