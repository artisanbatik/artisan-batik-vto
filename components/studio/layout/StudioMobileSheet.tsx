/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import BottomSheet from '../../ui/BottomSheet';
import { XIcon } from '../../icons';

interface StudioMobileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const StudioMobileSheet: React.FC<StudioMobileSheetProps> = ({ isOpen, onClose, children }) => {
    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <div className="h-full overflow-hidden flex flex-col">
                <div className="flex justify-end p-2">
                     <button onClick={onClose} className="p-2">
                        <XIcon className="w-6 h-6 text-stone-500" />
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    {children}
                </div>
            </div>
        </BottomSheet>
    );
};