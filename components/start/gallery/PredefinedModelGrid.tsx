/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { CustomModel } from '../../../types';
import { ModelGrid } from './ModelGrid';

export const PredefinedModelGrid: React.FC<{ models: CustomModel[], onSelect: (m: CustomModel) => void }> = ({ models, onSelect }) => {
    return (
        <ModelGrid 
            models={models}
            onSelect={onSelect}
            emptyTitle="Tidak Ada Model"
            emptyMessage="Belum ada model siap pakai yang tersedia saat ini."
        />
    );
};