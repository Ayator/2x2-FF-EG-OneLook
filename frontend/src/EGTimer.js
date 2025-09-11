import React, { useEffect, useRef, useState } from "react";

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
    themeColors = MONOKAI_COLORS,
    shadow = true
}) {
    const [time, setTime] = useState(0);
    const intervalRef = useRef();

    // Handle running
    useEffect(() => {
        if (running) {
        intervalRef.current = setInterval(() => {
            setTime((t) => t + 10);
        }, 10);
        } else {
        clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running]);

    // Handle reset
    useEffect(() => {
        setTime(0);
    }, [resetKey]);

    // Format MM:SS.CS
    const mm = String(Math.floor((time / 60000) % 60)).padStart(2, '0');
    const ss = String(Math.floor((time / 1000) % 60)).padStart(2, '0');
    const cs = String(Math.floor((time / 10) % 100)).padStart(2, '0');

    // Compose the timer string:
    let timerText = "";
    if (mm > 0) {
        timerText += String(mm).padStart(2, '0') + ":";
    }
    timerText += `${ss}.${cs}`;

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
