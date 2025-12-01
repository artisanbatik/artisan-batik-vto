/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { WardrobeCategory } from '../../types';
import { Button } from '../ui/button';

export interface CategoryOption {
    id: WardrobeCategory | 'all';
    name: string;
}

interface CategoryFilterProps {
    categories: CategoryOption[];
    activeCategory: WardrobeCategory | 'all';
    onSelectCategory: (id: WardrobeCategory | 'all') => void;
    disabled?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
    categories, 
    activeCategory, 
    onSelectCategory,
    disabled = false
}) => {
    return (
        <div className="flex-shrink-0 mb-4 overflow-x-auto -mx-6 px-6 pb-2">
            <div className="flex items-center gap-2">
                {categories.map(category => (
                    <Button
                        key={category.id}
                        onClick={() => onSelectCategory(category.id)}
                        variant={activeCategory === category.id ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full whitespace-nowrap"
                        disabled={disabled}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>
        </div>
    );
};
