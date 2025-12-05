/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Panel } from '../../ui/panel';
import { ResourceList } from '../../ui/resource-list';
import { ResourceItem } from '../../ui/resource-item';
import { Button } from '../../ui/button';
import { PencilIcon, Trash2Icon } from '../../icons';
import { useInlineRename } from '../../../hooks/useInlineRename';

interface CollectionPanelProps<T> {
    title: string;
    icon: React.ReactNode;
    items: T[];
    isDisabled: boolean;
    emptyMessage: string;
    
    // Actions
    onLoad: (item: T) => void;
    onRename: (id: string, newName: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    
    // Data Accessors
    getId: (item: T) => string;
    getTitle: (item: T) => string;
    getSubtitle?: (item: T) => string;
    getThumbnail?: (item: T) => string;
}

export function CollectionPanel<T>({
    title,
    icon,
    items,
    isDisabled,
    emptyMessage,
    onLoad,
    onRename,
    onDelete,
    getId,
    getTitle,
    getSubtitle,
    getThumbnail
}: CollectionPanelProps<T>) {
    
    const {
        renamingId,
        inputValue,
        setInputValue,
        startRename,
        commitRename,
        handleKeyDown
    } = useInlineRename(onRename);

    return (
        <Panel title={title} icon={icon} isDisabled={isDisabled}>
            <ResourceList
                items={items}
                emptyMessage={emptyMessage}
                renderItem={(item: T) => {
                    const id = getId(item);
                    const name = getTitle(item);
                    
                    return (
                        <ResourceItem
                            key={id}
                            id={id}
                            title={name}
                            subtitle={getSubtitle ? getSubtitle(item) : undefined}
                            thumbnailUrl={getThumbnail ? getThumbnail(item) : undefined}
                            isDisabled={isDisabled}
                            
                            // Rename logic
                            isRenaming={renamingId === id}
                            renameValue={inputValue}
                            onRenameChange={setInputValue}
                            onRenameSubmit={commitRename}
                            onRenameKeyDown={handleKeyDown}
                            
                            // Actions
                            actionButtons={
                                <>
                                    <Button
                                        onClick={() => onLoad(item)}
                                        disabled={isDisabled}
                                        variant="secondary"
                                        size="sm"
                                        className="bg-transparent hover:bg-stone-200/70 dark:hover:bg-stone-800/70 text-stone-700 dark:text-stone-300 h-8"
                                    >
                                        Muat
                                    </Button>
                                    <Button
                                        onClick={() => startRename(id, name)}
                                        disabled={isDisabled}
                                        variant="ghost"
                                        size="icon"
                                        className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800/70 h-8 w-8"
                                        aria-label={`Ubah nama ${name}`}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => onDelete(id)}
                                        disabled={isDisabled}
                                        variant="ghost"
                                        size="icon"
                                        className="text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 w-8"
                                        aria-label={`Hapus ${name}`}
                                    >
                                        <Trash2Icon className="w-4 h-4" />
                                    </Button>
                                </>
                            }
                        />
                    );
                }}
            />
        </Panel>
    );
}
