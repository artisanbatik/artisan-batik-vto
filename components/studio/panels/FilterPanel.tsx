/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useStudio } from '../StudioContext';
import { SlidersIcon } from '../../icons';
import { Panel } from '../../ui/panel';
import { Button } from '../../ui/button';
import { Slider } from '../../ui/slider';

const FilterPanel: React.FC = () => {
  const { filters: filterManager, isVTOLoading } = useStudio();
  const { data: filters, set: setFilters, reset: resetFilters } = filterManager;

  const resetButton = (
    <Button
      onClick={resetFilters}
      disabled={isVTOLoading}
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
      isDisabled={isVTOLoading}
    >
      <div className="space-y-4">
        <Slider
          label="Kecerahan"
          value={filters.brightness}
          onChange={(v) => setFilters(f => ({ ...f, brightness: v }))}
          min={0}
          max={200}
          disabled={isVTOLoading}
          unit="%"
        />
        <Slider
          label="Kontras"
          value={filters.contrast}
          onChange={(v) => setFilters(f => ({ ...f, contrast: v }))}
          min={0}
          max={200}
          disabled={isVTOLoading}
          unit="%"
        />
        <Slider
          label="Saturasi"
          value={filters.saturation}
          onChange={(v) => setFilters(f => ({ ...f, saturation: v }))}
          min={0}
          max={200}
          disabled={isVTOLoading}
          unit="%"
        />
        <Slider
          label="Rona"
          value={filters.hue}
          onChange={(v) => setFilters(f => ({ ...f, hue: v }))}
          min={-180}
          max={180}
          disabled={isVTOLoading}
          unit="deg"
        />
        <Slider
          label="Sepia"
          value={filters.sepia}
          onChange={(v) => setFilters(f => ({ ...f, sepia: v }))}
          min={0}
          max={100}
          disabled={isVTOLoading}
          unit="%"
        />
      </div>
    </Panel>
  );
};

export default FilterPanel;