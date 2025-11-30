/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SlidersIcon } from '../../icons';
import { Panel } from '../../ui/panel';
import { Button } from '../../ui/button';
import { Slider } from '../../ui/slider';

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

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onResetFilters, isDisabled }) => {
  const resetButton = (
    <Button
      onClick={onResetFilters}
      disabled={isDisabled}
      variant="link"
      size="sm"
      className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 px-0 h-auto"
    >
      Atur Ulang
    </Button>
  );

  return (
    <Panel
      title="Penyesuaian"
      icon={<SlidersIcon className="w-5 h-5 text-stone-600 dark:text-stone-400"/>}
      action={resetButton}
      isDisabled={isDisabled}
    >
      <div className="space-y-4">
        <Slider
          label="Kecerahan"
          value={filters.brightness}
          onChange={(v) => onFilterChange({ brightness: v })}
          min={0}
          max={200}
          disabled={isDisabled}
          unit="%"
        />
        <Slider
          label="Kontras"
          value={filters.contrast}
          onChange={(v) => onFilterChange({ contrast: v })}
          min={0}
          max={200}
          disabled={isDisabled}
          unit="%"
        />
        <Slider
          label="Saturasi"
          value={filters.saturation}
          onChange={(v) => onFilterChange({ saturation: v })}
          min={0}
          max={200}
          disabled={isDisabled}
          unit="%"
        />
        <Slider
          label="Rona"
          value={filters.hue}
          onChange={(v) => onFilterChange({ hue: v })}
          min={-180}
          max={180}
          disabled={isDisabled}
          unit="deg"
        />
        <Slider
          label="Sepia"
          value={filters.sepia}
          onChange={(v) => onFilterChange({ sepia: v })}
          min={0}
          max={100}
          disabled={isDisabled}
          unit="%"
        />
      </div>
    </Panel>
  );
};

export default FilterPanel;