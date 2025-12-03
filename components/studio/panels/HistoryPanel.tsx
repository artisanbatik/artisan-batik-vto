/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useStudio } from '../StudioContext';
import { OutfitLayer } from '../../../types';
import { ClockIcon } from '../../icons';
import { Panel } from '../../ui/panel';
import { ResourceList } from '../../ui/resource-list';
import { ResourceItem } from '../../ui/resource-item';

const HistoryPanel: React.FC = () => {
  const { history, currentIndex, jumpToState, isVTOLoading } = useStudio();

  return (
    <Panel
      title="Riwayat Sesi"
      icon={<ClockIcon className="w-5 h-5 text-stone-600 dark:text-stone-400"/>}
    >
      <ResourceList
        items={history}
        emptyMessage="Riwayat penataan gaya Anda akan muncul di sini."
        renderItem={(layer: OutfitLayer) => {
          // Because History list logic relies on index, we map it slightly differently if possible,
          // but ResourceList expects items. We can find the index in the original array.
          const index = history.indexOf(layer); 
          const isCurrent = index === currentIndex;
          const thumbnailUrl = Object.values(layer.poseImages)[0];
          const description = index === 0 
              ? 'Model Dasar' 
              : `Menambahkan: ${layer.garment?.name || 'Karya Tanpa Nama'}`;
          
          return (
            <ResourceItem
              key={layer.garment?.id || `base-${index}`}
              id={layer.garment?.id || `base-${index}`}
              title={description}
              subtitle={`Langkah ${index + 1}`}
              thumbnailUrl={thumbnailUrl}
              isActive={isCurrent}
              isDisabled={isVTOLoading}
              onClick={() => jumpToState(index)}
            />
          );
        }}
      />
    </Panel>
  );
};

export default HistoryPanel;