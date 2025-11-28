import React from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

const Slider: React.FC<SliderProps> = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    className, 
    disabled,
    unit = '',
    id,
    ...props 
}) => {
  const generatedId = id || `slider-${label.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <label htmlFor={generatedId} className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {label}
        </label>
        <span className="text-sm font-mono text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700">
            {value}{unit}
        </span>
      </div>
      <input
        id={generatedId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={cn(
            "w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-stone-900 dark:accent-stone-100",
            "focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 rounded-full"
        )}
        {...props}
      />
    </div>
  );
};

export { Slider };