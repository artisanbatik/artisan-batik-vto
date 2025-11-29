
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { WardrobeItem, WardrobeCategory } from '../types';
import { UploadCloudIcon, CheckCircleIcon } from './icons';
import { cn, urlToFile } from '../lib/utils';
import { FileDropzone } from './ui/file-dropzone';

interface WardrobePanelProps {
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
}

const CATEGORIES: { id: WardrobeCategory | 'all', name: string }[] = [
    { id: 'all', name: 'All' },
    { id: 'top', name: 'Tops' },
    { id: 'bottom', name: 'Bottoms' },
    { id: 'outerwear', name: 'Outerwear' },
    { id: 'dress', name: 'Dresses' },
    { id: 'accessory', name: 'Accessories' },
];

const WardrobePanel: React.FC<WardrobePanelProps> = ({ onGarmentSelect, activeGarmentIds, isLoading, wardrobe }) => {
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<WardrobeCategory | 'all'>('all');

    const handleGarmentClick = async (item: WardrobeItem) => {
        if (isLoading || activeGarmentIds.includes(item.id)) return;
        setError(null);
        try {
            const file = await urlToFile(item.url, item.name);
            onGarmentSelect(file, item);
        } catch (err) {
            const detailedError = `Failed to load wardrobe item. This is often a CORS issue. Check the developer console for details.`;
            setError(detailedError);
            console.error(`[CORS Check] Failed to load and convert wardrobe item from URL: ${item.url}. The browser's console should have a specific CORS error message if that's the issue.`, err);
        }
    };

    const handleGarmentFileSelect = (file: File) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
          setError('Please select an image file.');
          return;
      }
      setError(null);
      const customGarmentInfo: WardrobeItem = {
          id: `custom-${Date.now()}`,
          name: file.name,
          url: URL.createObjectURL(file),
          category: 'accessory', // Defaulting uploaded items to 'accessory' is a safer, non-destructive default (add vs replace).
      };
      onGarmentSelect(file, customGarmentInfo);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleGarmentFileSelect(e.target.files[0]);
        }
    };
    
    const filteredWardrobe = wardrobe.filter(item => 
        activeCategory === 'all' || item.category === activeCategory
    );

  return (
    <div className="pt-6 border-t border-gray-400/50">
        <h2 className="text-xl font-serif tracking-wider text-gray-800 mb-3">Wardrobe</h2>
        
        {/* Category Tabs */}
        <div className="mb-4 -mx-2 overflow-x-auto">
            <div className="flex items-center gap-2 border-b border-gray-200 px-2">
                {CATEGORIES.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={cn(
                            'px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-md',
                            activeCategory === category.id
                                ? 'text-gray-900 border-b-2 border-gray-900'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                        )}
                        disabled={isLoading}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
            {filteredWardrobe.map((item) => {
            const isActive = activeGarmentIds.includes(item.id);
            return (
                <button
                key={item.id}
                onClick={() => handleGarmentClick(item)}
                disabled={isLoading || isActive}
                className="relative aspect-square border rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 group disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={`Select ${item.name}`}
                >
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-bold text-center p-1">{item.name}</p>
                </div>
                {isActive && (
                    <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                        <CheckCircleIcon className="w-8 h-8 text-white" />
                    </div>
                )}
                </button>
            );
            })}
            
            <FileDropzone 
                onFileSelect={handleGarmentFileSelect}
                disabled={isLoading}
                variant="compact"
                label="Upload"
                icon={<UploadCloudIcon className="w-6 h-6 mb-1"/>}
                className="border-gray-300 hover:border-gray-400"
            />
        </div>
        {filteredWardrobe.length === 0 && (
             <p className="text-center text-sm text-gray-500 mt-4">No items in this category.</p>
        )}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default WardrobePanel;
