import React, { useEffect, useRef, useState } from "react";
import { OLL_CODES, ROTATION_DEGREES } from "./utils/ollUtils";

const HOLD_TIME_MS = 100;

export default function EGIdlePhase({ onBegin, lastResult }) {
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

    function getEGImageSrc(lastResult) {
        if (
            !lastResult ||
            !lastResult.oll ||
            !lastResult.orientation ||
            !lastResult.pll
        )
            return null;
        const ollCode = OLL_CODES[lastResult.oll.toUpperCase()] || "O";
        const orientation = lastResult.orientation.toUpperCase();
        const pll = lastResult.pll.toUpperCase();
        return `./eg_cases/${ollCode}_${pll}.svg`;
    }

    const imgSrc = getEGImageSrc(lastResult);
    const degrees = (lastResult && ROTATION_DEGREES[lastResult.orientation?.toUpperCase?.()]) ?? 0;

    return (
        <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.18s",
            background: readyToAdvance ? "#47e47a" : "rgba(0, 221, 255, 0.94)",
            width: "100%",
            fontSize: 20
        }}
        >
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
                    transform: `rotate(${degrees}deg)`
                }}
                />
            )}
            <div style={{ textAlign: "center" }}>
                {lastResult && (
                    <div>
                        <strong>
                            {lastResult.time ? "Time" : "Time"}
                        </strong>
                        <br />
                        {lastResult.oll} {lastResult.orientation} {lastResult.pll} <br />
                    </div>
                )}
                <p>
                    <b>Hold <kbd>SPACE</kbd> or tap and hold<br/>for {HOLD_TIME_MS} ms, then release to begin.</b>
                </p>
                <p style={{
                    color: readyToAdvance ? "#1d6134" : "#bbb",
                    marginTop: 36, fontWeight: 600, fontSize: 22, minHeight: 30
                }}>
                    {readyToAdvance ? "Ready! Release to start." : ""}
                </p>
            </div>
        </div>
    );
}
