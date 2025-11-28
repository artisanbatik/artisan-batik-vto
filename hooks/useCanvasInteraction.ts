
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useCallback } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const useCanvasInteraction = () => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartDistance = useRef<number>(0);
    const touchStartPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const resetView = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    const setClampedPosition = useCallback((newPos: { x: number; y: number }, currentScale: number) => {
        if (!containerRef.current) {
            setPosition(newPos);
            return;
        }
        
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();

        const minX = containerRect.width - containerRect.width * currentScale;
        const minY = containerRect.height - containerRect.height * currentScale;

        const clampedX = clamp(newPos.x, minX, 0);
        const clampedY = clamp(newPos.y, minY, 0);
        
        setPosition({ x: clampedX, y: clampedY });
    }, []);

    const handleZoom = useCallback((delta: number, clientX?: number, clientY?: number) => {
        if (!containerRef.current) return;

        const newScale = clamp(scale + delta, MIN_SCALE, MAX_SCALE);
        if (newScale === scale) return;
        
        if (newScale === 1) {
            resetView();
            return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (clientX ?? (rect.left + rect.width / 2)) - rect.left;
        const mouseY = (clientY ?? (rect.top + rect.height / 2)) - rect.top;
        
        const newPosX = mouseX - ((mouseX - position.x) / scale) * newScale;
        const newPosY = mouseY - ((mouseY - position.y) / scale) * newScale;
        
        setScale(newScale);
        setClampedPosition({ x: newPosX, y: newPosY }, newScale);
    }, [scale, position, resetView, setClampedPosition]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        handleZoom(-e.deltaY * 0.005, e.clientX, e.clientY);
    }, [handleZoom]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }, [scale, position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || scale <= 1) return;
        e.preventDefault();
        const newPos = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
        setClampedPosition(newPos, scale);
    }, [isDragging, scale, dragStart, setClampedPosition]);

    const handleMouseUpOrLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const getDistance = (touches: React.TouchList) => {
        return Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) + Math.pow(touches[0].clientY - touches[1].clientY, 2));
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            touchStartDistance.current = getDistance(e.touches);
        } else if (e.touches.length === 1 && scale > 1) {
            setIsDragging(true);
            touchStartPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
        }
    }, [scale, position]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const newDistance = getDistance(e.touches);
            const delta = (newDistance - touchStartDistance.current) * 0.01;
            handleZoom(delta, (e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2);
            touchStartDistance.current = newDistance;
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            const newPos = { x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y };
            setClampedPosition(newPos, scale);
        }
    }, [handleZoom, isDragging, scale, dragStart, setClampedPosition]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        setIsDragging(false);
        touchStartDistance.current = 0;
    }, []);

    return {
        scale,
        position,
        isDragging,
        containerRef,
        resetView,
        canZoomIn: scale < MAX_SCALE,
        canZoomOut: scale > MIN_SCALE,
        isZoomed: scale > 1,
        isDefaultView: scale === 1 && position.x === 0 && position.y === 0,
        handlers: {
            onWheel: handleWheel,
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUpOrLeave,
            onMouseLeave: handleMouseUpOrLeave,
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd
        },
        zoomIn: () => handleZoom(0.2),
        zoomOut: () => handleZoom(-0.2)
    };
};
