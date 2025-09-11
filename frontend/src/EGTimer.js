import React, { useEffect, useRef, useState } from "react";
import { formatTimer } from "./utils/EGUtils";

// Monokai-like default
const MONOKAI_COLORS = {
    digits: "#f8f8f2",
    background: "#272822", // or "#272822" if you want a card
    shadow: "#23241f"
};

export default function EGTimer({
    running = false,
    resetKey = 0, // Use this to force timer reset from parent
    fontSize = 92,
    onTimerChange = null,
    themeColors = MONOKAI_COLORS,
    shadow = true
}) {
    const [time, setTime] = useState(0);
    const intervalRef = useRef();

    // Handle running
    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setTime((t) => {
                    const nt = t + 10;
                    if (onTimerChange) onTimerChange(nt); // call on every tick
                    return nt;
                });
            }, 10);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, onTimerChange]);

    // Handle reset
    useEffect(() => {
        setTime(0);
    }, [resetKey]);

    const timerText = formatTimer(time);

    return (
        <div style={{
            background: themeColors.background,
            borderRadius: 18,
            padding: "0 22px",
            textAlign: "center"
        }}>
            <span style={{
                fontFamily: "monospace, monospace",
                fontSize,
                fontWeight: 800,
                color: themeColors.digits,
                textShadow: shadow ? `0 2px 36px ${themeColors.shadow}` : undefined,
                letterSpacing: "0.07em",
                userSelect: "none"
            }}>
                {timerText}
            </span>
        </div>
    );
}
