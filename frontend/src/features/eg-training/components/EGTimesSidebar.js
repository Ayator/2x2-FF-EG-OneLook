import React, { useEffect, useState } from "react";
import {
    ROTATION_DEGREES,
    getEGImageSrc,
    getDisplayPLLCase,
    formatTimer,
    avg12
} from "../../../utils/EGUtils";

const MONOKAI = {
  bg: "#2d2a2e",
  fg: "#f8f8f2",
  cell: "#272822",
  accent: "#fd971f",
  yellow: "#e6db74",
  border: "#49483e",
  highlight: "#a6e22e"
};

export default function EGIdleSidebar({ history = [], themeColors = MONOKAI }) {
    const [modalIdx, setModalIdx] = useState(null);

    useEffect(() => {
        if (modalIdx === null) return;
        function esc(e) {
            if (e.key === "Escape") setModalIdx(null);
        }
        function click(e) {
            if (e.target.classList?.contains("eg-modal-backdrop")) setModalIdx(null);
        }
        window.addEventListener("keydown", esc);
        window.addEventListener("mousedown", click);
        return () => {
            window.removeEventListener("keydown", esc);
            window.removeEventListener("mousedown", click);
        };
    }, [modalIdx]);

    console.log("history", history);
    const solveRows = history.map((s, i) => ({
        n: i + 1,
        t: formatTimer(s.time),
        avg12: avg12(history.slice(0, i + 1)),
        data: s
    })).reverse(); // latest first

    console.log(solveRows);
    return (
        <div style={{
            width: 238, minWidth: 160, maxWidth: 340,
            height: "100%",
            background: themeColors.cell,
            borderRight: `2px solid ${themeColors.border}`,
            padding: "0px 6px 0px 12px",
            color: themeColors.fg,
            fontFamily: "monospace",
            fontSize: 18,
            overflowY: "auto"
        }}>
            <div style={{
                color: themeColors.accent,
                fontWeight: 700,
                fontSize: 19,
                marginTop: 10,
                marginBottom: 10
            }}>
                Solve History
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th style={{ color: themeColors.highlight, fontWeight: 700, fontSize: 15 }}>#</th>
                    <th style={{ color: themeColors.accent, fontWeight: 700, fontSize: 15 }}>Time</th>
                    <th style={{ color: themeColors.yellow, fontWeight: 700, fontSize: 15 }}>avg12</th>
                </tr>
                </thead>
                <tbody>
                {solveRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${themeColors.border}` }}>
                    <td style={{ textAlign: "center", fontWeight: 600, padding: "3px 4px" }}>{row.n}</td>
                    <td style={{ textAlign: "center", cursor: "pointer", color: themeColors.fg, fontWeight: 800, background: themeColors.bg, borderRadius: 7 }}
                        onClick={() => setModalIdx(history.length - row.n)}>
                        {row.t}
                    </td>
                    <td style={{ textAlign: "center", color: themeColors.highlight, fontWeight: 600 }}>{row.avg12}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            {modalIdx !== null &&
                <SolveModal solve={history[modalIdx]} />}
        </div>
    );
}

function SolveModal({ solve }) {
    const displayPLL = getDisplayPLLCase(solve.pll, solve.orientation);
    const imgSrc = solve
        ? getEGImageSrc(solve.oll, displayPLL)
        : null;
    const displayRotation = ROTATION_DEGREES[solve.orientation] ?? 0;
    return (
        <div className="eg-modal-backdrop" style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#19181ca5",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{
                background: "#282828",
                border: `3px solid #a6e22e`,
                borderRadius: 16,
                boxShadow: "0 6px 40px #0009",
                padding: 32,
                minWidth: 320,
                textAlign: "center",
                color: "#f8f8f2"
            }}>
                <div style={{ marginBottom: 22, fontSize: 22, fontWeight: 700 }}>
                    EG Case
                </div>
                {imgSrc && (
                <img
                    src={imgSrc}
                    alt="EG Case"
                    style={{
                        width: 160, height: 160, marginBottom: 20, borderRadius: 14,
                        background: "#101010", boxShadow: "0 2px 18px #0006",
                        transform: `rotate(${displayRotation}deg)`
                    }}
                />
                )}
                <div style={{ wordBreak: "break-word", fontSize: 18 }}>
                OLL: {solve.oll}, Orientation: {solve.orientation}, PLL: {solve.pll}
                </div>
            </div>
        </div>
    );
}