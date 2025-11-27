
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
    const controls = useAnimation();
    const [currentSnap, setCurrentSnap] = useState<'hidden' | 'visible' | 'expanded'>('hidden');
    const [height, setHeight] = useState(0);

    useEffect(() => {
        setHeight(window.innerHeight);
        const handleResize = () => setHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const variants = useMemo(() => ({
        hidden: { y: height },
        visible: { y: height * 0.6 },
        expanded: { y: height * 0.1 },
    }), [height]);

    useEffect(() => {
        if (isOpen) {
            controls.start('visible');
            setCurrentSnap('visible');
        } else {
            controls.start('hidden');
            setCurrentSnap('hidden');
        }
    }, [isOpen, controls]);

    const handleDragEnd = (event: any, info: any) => {
        const { offset, velocity } = info;
        const dragThreshold = 50;
        const velocityThreshold = 500;
        if (velocity.y > velocityThreshold || offset.y > dragThreshold) {
            if (currentSnap === 'expanded') {
                controls.start('visible');
                setCurrentSnap('visible');
            } else {
                controls.start('hidden').then(onClose);
                setCurrentSnap('hidden');
            }
        } else if (velocity.y < -velocityThreshold || offset.y < -dragThreshold) {
            controls.start('expanded');
            setCurrentSnap('expanded');
        } else {
            controls.start(currentSnap);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
                    <motion.div drag="y" onDragEnd={handleDragEnd} initial="hidden" animate={controls} transition={{ type: "spring", damping: 40, stiffness: 400 }} variants={variants} dragConstraints={{ top: 0 }} dragElastic={0.2} className="fixed bottom-0 left-0 right-0 h-full bg-stone-100 dark:bg-stone-950 rounded-t-2xl z-50 flex flex-col">
                        <div className="absolute top-0 left-0 right-0 h-8 flex justify-center items-center cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                        </div>
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
