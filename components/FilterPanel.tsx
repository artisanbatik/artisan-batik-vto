/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SlidersIcon } from './icons';

interface FilterPanelProps {
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    sepia: number;
  };
  onFilterChange: (newFilters: Partial<FilterPanelProps['filters']>) => void;
  onResetFilters: () => void;
  isDisabled: boolean;
}

const FilterSlider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  isDisabled: boolean;
  unit?: string;
}> = ({ label, value, onChange, min = 0, max = 200, step = 1, isDisabled, unit = '%' }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label htmlFor={`slider-${label}`} className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>
      <span className="text-sm font-mono text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">{value}{unit}</span>
    </div>
    <input
      id={`slider-${label}`}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      disabled={isDisabled}
      className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-stone-800 dark:accent-stone-200"
    />
  </div>
);


const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onResetFilters, isDisabled }) => {
  return (
    <div className={`pt-6 border-t border-stone-400/50 dark:border-stone-700/50 transition-opacity duration-300 ${isDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-serif tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-3">
          <SlidersIcon className="w-5 h-5 text-stone-600 dark:text-stone-400"/>
          Penyesuaian
        </h2>
        <button
          onClick={onResetFilters}
          disabled={isDisabled}
          className="text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors disabled:cursor-not-allowed"
          aria-label="Atur ulang penyesuaian gambar"
        >
          Atur Ulang
        </button>
      </div>
      <div className="space-y-4">
        <FilterSlider
          label="Kecerahan"
          value={filters.brightness}
          onChange={(v) => onFilterChange({ brightness: v })}
          isDisabled={isDisabled}
        />
        <FilterSlider
          label="Kontras"
          value={filters.contrast}
          onChange={(v) => onFilterChange({ contrast: v })}
          isDisabled={isDisabled}
        />
        <FilterSlider
          label="Saturasi"
          value={filters.saturation}
          onChange={(v) => onFilterChange({ saturation: v })}
          isDisabled={isDisabled}
        />
        <FilterSlider
          label="Rona"
          value={filters.hue}
          onChange={(v) => onFilterChange({ hue: v })}
          min={-180}
          max={180}
          unit="deg"
          isDisabled={isDisabled}
        />
        <FilterSlider
          label="Sepia"
          value={filters.sepia}
          onChange={(v) => onFilterChange({ sepia: v })}
          min={0}
          max={100}
          unit="%"
          isDisabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default FilterPanel;