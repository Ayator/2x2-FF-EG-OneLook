import React, { useEffect, useRef, useState } from "react";
import {
    ROTATION_DEGREES,
    getEGImageSrc,
    getDisplayPLLCase
} from "../../../utils/EGUtils";
import EGTimesSidebar from "./EGTimesSidebar";

const HOLD_TIME_MS = 100;

// Monokai default palette
const DEFAULT_MONOKAI = {
  background: "#2d2a2e",
  panel: "#272822",
  text: "#f8f8f2",
  strong: "#e6db74",
  accent: "#fd971f",
  border: "#49483e",
  green: "#a6e22e"
};


export default function EGIdlePhase({ onBegin, lastResult, history = [], timerDisplay, themeColors = DEFAULT_MONOKAI }) {
    const [readyToAdvance, setReadyToAdvance] = useState(false);
    const timerRef = useRef(null);
    const holdActiveRef = useRef(false);

    // Reset flash on unmount
    useEffect(() => {
        return () => {
            holdActiveRef.current = false;
            clearTimeout(timerRef.current);
            setReadyToAdvance(false);
        };
    }, []);

    // Touch logic
    function onTouchStart() {
        if (holdActiveRef.current) return;
        holdActiveRef.current = true;
        timerRef.current = setTimeout(() => {
            if (holdActiveRef.current) setReadyToAdvance(true);
        }, HOLD_TIME_MS);
    }
    function onTouchEnd() {
        clearTimeout(timerRef.current);
        if (readyToAdvance) onBegin();
        setReadyToAdvance(false);
        holdActiveRef.current = false;
    }

    // Spacebar logic
    useEffect(() => {
        function onKeyDown(e) {
        if (e.repeat || holdActiveRef.current) return;
        if (e.code === "Space") {
            holdActiveRef.current = true;
            timerRef.current = setTimeout(() => {
                if (holdActiveRef.current) setReadyToAdvance(true);
            }, HOLD_TIME_MS);
            e.preventDefault();
        }
        }
        function onKeyUp(e) {
        if (e.code === "Space") {
            clearTimeout(timerRef.current);
            if (readyToAdvance) onBegin();
            setReadyToAdvance(false);
            holdActiveRef.current = false;
            e.preventDefault();
        }
        }
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [readyToAdvance, onBegin]);

    let imgSrc = null;
    let displayRotation = 0;
    if (lastResult && lastResult.oll && lastResult.orientation && lastResult.pll){
        const displayPLL = getDisplayPLLCase(lastResult.pll, lastResult.orientation);
        imgSrc = getEGImageSrc(lastResult?.oll, displayPLL);
        displayRotation = ROTATION_DEGREES[lastResult.orientation] ?? 0;
    }

    return (
        <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
                position: "fixed",
                top: "10%",
                left: 0,
                display: "flex",
                flexDirection: "row",
                height: "100vh",
                width: "100vw",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.18s",
                background: readyToAdvance ? "#47e47a" : themeColors.background,
                color: themeColors.text,
                fontSize: 20
            }}
        >
            {/* Sidebar always rendered first, stays left */}
            <EGTimesSidebar history={history} />
            {/* Main content in a flex column at center */}
            <div style={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // center horizontally in main area
                justifyContent: "center", // center vertically
                minWidth: 0,
                background: themeColors.panel,
                color: themeColors.strong
            }}>
                {/* Timer */}
                {timerDisplay}
                {/* EG case image, if any */}
                {imgSrc && (
                    <img
                    src={imgSrc}
                    alt="Last attempted EG case"
                    style={{
                        width: "192px", // Adjust size as needed
                        height: "192px",
                        marginBottom: 32,
                        display: "block",
                        objectFit: "contain",
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 6px 36px #2237",
                        border: "2px solid #ddd7",
                        transform: `rotate(${displayRotation}deg)`
                    }}
                    />
                )}
                <div style={{ textAlign: "center" }}>
                    <p>
                        <b>Hold
                            <kbd style={{background: themeColors.background, color: themeColors.accent}}> SPACE </kbd>
                            or tap and hold<br/>
                        </b>
                    </p>
                    <p style={{
                        color: readyToAdvance ? themeColors.green : themeColors.accent,
                        marginTop: 36, fontWeight: 600, fontSize: 22, minHeight: 30
                    }}>
                        {readyToAdvance ? "Ready! Release to start." : ""}
                    </p>
                </div>
            </div>
        </div>
    );
}
