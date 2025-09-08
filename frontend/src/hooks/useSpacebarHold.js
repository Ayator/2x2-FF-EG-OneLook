import { useEffect, useRef } from "react";

export function useSpacebarHold(minHoldMs, onHoldRelease) {
    const downRef = useRef(null);

    useEffect(() => {
        function onKeyDown(e) {
            if (e.code === "Space" && downRef.current === null) {
                downRef.current = Date.now();
            }
        }
        function onKeyUp(e) {
            if (e.code === "Space" && downRef.current !== null) {
                const heldFor = Date.now() - downRef.current;
                downRef.current = null;
                if (heldFor >= minHoldMs) {
                    onHoldRelease(); // Call callback
                }
            }
        }
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [minHoldMs, onHoldRelease]);
}
