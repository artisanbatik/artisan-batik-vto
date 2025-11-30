
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState } from 'react';

export const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];

export interface UploaderSettings {
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    isCameraOpen: boolean;
    setIsCameraOpen: (isOpen: boolean) => void;
    ASPECT_RATIOS: string[];
}

export const useUploaderSettings = (): UploaderSettings => {
    const [backgroundColor, setBackgroundColor] = useState('#f3f2ef');
    const [aspectRatio, setAspectRatio] = useState('4:5');
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    return {
        aspectRatio,
        setAspectRatio,
        backgroundColor,
        setBackgroundColor,
        isCameraOpen,
        setIsCameraOpen,
        ASPECT_RATIOS
    };
};
