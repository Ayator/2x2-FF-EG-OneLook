import { useRef, useCallback } from "react";

export function useFineTap(onTap, { maxDist = 15, maxTime = 350 } = {}) {
    const touchInfo = useRef(null);

    const handleTouchStart = useCallback(e => {
        if (e.touches.length === 1) {
            const t = e.touches[0];
            touchInfo.current = {
                startX: t.clientX,
                startY: t.clientY,
                startTime: Date.now()
            };
        }
    }, []);

    const handleTouchEnd = useCallback(e => {
        if (!touchInfo.current || e.changedTouches.length === 0) return;
            const t = e.changedTouches[0];
            const dx = Math.abs(t.clientX - touchInfo.current.startX);
            const dy = Math.abs(t.clientY - touchInfo.current.startY);
            const dt = Date.now() - touchInfo.current.startTime;
            if (dx < maxDist && dy < maxDist && dt < maxTime) {
                onTap && onTap(e);
            }
        touchInfo.current = null;
    }, [onTap, maxDist, maxTime]);

    return [handleTouchStart, handleTouchEnd];
}
