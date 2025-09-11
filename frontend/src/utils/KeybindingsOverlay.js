import React, { useEffect, useRef, useState } from "react";
import { useOrientation } from "../hooks/useOrientation";

const KEY_ROWS = [
    [ "Esc"  , "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=",  "Backspace", "PrtSc" ],
    [ "Tab"  , "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]",      "\\"   , "Del"   ],
    [ "Caps" , "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'",        "Enter"   , "PgUp"  ],
    [ "Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/",       "Shift",     "↑", "PgDn"  ],
    [ "Ctrl" , "Win", "Alt",            "Space",          "Alt", "Fn", "Ctrl", "←", "↓", "→"     ]
];

// Each subarray: [colSpan for this key]
const KEY_WIDTHS = [
    [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.1, 1 ],
    [ 1.55, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.55, 1 ],
    [ 1.85, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.4, 1 ],
    [ 2.4 , 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.85, 1, 1 ],
    [ 1.3 , 1.3, 1.3, 7.0, 1, 1, 1, 1, 1, 1, 1 ],
];

// Custom highlight for keybindings
const defaultKeyActions = {
    "A": "ANTI SUNE", "S": "SUNE", "T": "T", "L": "L", "U": "U",
    "P": "PI", "H": "H", "↑": "Back OLL", "↓": "Front OLL",
    "→": "Right OLL", "←": "Left OLL", "Space": "Hold: Start Round",
    "D": "PLL BL", "F": "PLL BR", "C": "PLL FL", "V": "PLL FR", "X": "PLL Reset"
};

const defaultSidebarActions = [
    { key: "A", label: "OLL: ANTISUNE" }, { key: "S", label: "OLL: SUNE" }, { key: "T", label: "OLL: T" },
    { key: "L", label: "OLL: L" }, { key: "U", label: "OLL: U" }, { key: "P", label: "OLL: PI" }, { key: "H", label: "OLL: H" },
    { key: "Space", label: "Hold: Start Round" }, { key: "←↑→↓", label: "OLL Orientation" },
    { key: "D F C V", label: "PLL Piece Select" }, { key: "X", label: "PLL Reset" }
];

const monokaiColors = {
    background: "#272822",
    panelBg: "#30302c",
    panelShadow: "0 0 60px #000a",
    panelBorderRadius: 34,
    keyboardKeyBg: "#49483e",
    keyboardKeyBorder: "#75715E",
    keyboardKeyText: "#F8F8F2",
    keyboardKeyShadow: "0 2px 8px #1e1e1e",
    keyboardKeyActiveBg: "#FFD86644",
    keyboardKeyActiveBorder: "#FFD866",
    keyboardKeyActiveText: "#282828",
    keyboardKeyActiveShadow: "0 2px 8px #FFD86633",
    keyboardKeyBadgeBg: "#FFE792",
    keyboardKeyBadgeText: "#272822",
    keyboardKeyBadgeBorderRadius: 6,
    sidebarContainerBg: "#23241f",
    sidebarContainerShadow: "0 4px 24px #000a",
    sidebarContainerBorderRadius: 18,
    sidebarKeyBg: "#FFD86633",
    sidebarKeyText: "#F8F8F2",
    sidebarKeyBorder: "#FFD866",
    sidebarLabelText: "#A6E22E",
};

export default function KeybindingsOverlay({
    colors = monokaiColors,
    KEY_ACTIONS = defaultKeyActions,
    SIDEBAR_ACTIONS = defaultSidebarActions
}) {
    const [open, setOpen] = useState(false);
    const orientation = useOrientation();
    const panelRef = useRef(null);

    useEffect(() => {
        function onKey(e) {
            if (e.ctrlKey && e.key.toLowerCase() === "k") { setOpen(v => !v); e.preventDefault(); }
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // mobile touch-to-close handler
    function handleBgPointer(e) {
        // If click/touch outside panel, close. (panelRef.current does not contain target)
        if (panelRef.current && !panelRef.current.contains(e.target)) {
            setOpen(false);
        }
    }

    if (!open) return null;

    // Keyboard sizing for scaling parent in portrait
    const pxPerUnit = 44;
    const maxRowUnits = Math.max(...KEY_WIDTHS.map(row => row.reduce((a, b) => a + b, 0)));
    const naturalKeyboardWidth = maxRowUnits * pxPerUnit;
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 480;
    const scalePortrait = orientation === "portrait"
        ? Math.min(1, (viewportWidth * 0.99) / naturalKeyboardWidth)
        : 1;

    // Sidebars
    const flexDirection = orientation === "portrait" ? "column" : "row";
    const sidebarMargin = orientation === "portrait" ? "32px 0 0 0" : "0 0 0 42px";
    const containerPadding = orientation === "portrait" ? "32px 4vw" : "46px 44px";

    return (
        <div
            style={{
            position: "fixed",
            inset: 0,
            background: colors.background,
            color: colors.keyboardKeyText,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Segoe UI, Arial, sans-serif",
            minHeight: "100vh"
            }}
        // Register touch and click close OUTSIDE the panel
        onClick={handleBgPointer}
        onTouchStart={handleBgPointer}
        >
        <div
            ref={panelRef}
            style={{
                display: "flex",
                flexDirection: orientation === "portrait" ? "column" : "row",
                background: colors.panelBg,
                borderRadius: colors.panelBorderRadius,
                boxShadow: colors.panelShadow,
                padding: orientation === "portrait" ? "32px 4vw" : "46px 44px",
                alignItems: "center",
                justifyContent: "center",
                width: orientation === "portrait" ? "100vw" : "auto",
                maxWidth: orientation === "portrait" ? "100vw" : "auto"
            }}
            // Prevent event bubbling so touches inside panel DO NOT close overlay
            onClick={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            >
            {/* Keyboard */}
            <div
            style={{
                display: "block",
                transform: `scale(${scalePortrait})`,
                transformOrigin: "top center",
                margin: orientation === "portrait" ? "0 auto" : 0,
                width: naturalKeyboardWidth
            }}
            >
            {KEY_ROWS.map((row, rIdx) => (
                <div
                key={rIdx}
                style={{
                    display: "grid",
                    gridTemplateColumns: KEY_WIDTHS[rIdx].map(w => `${w * pxPerUnit}px`).join(" "),
                    gap: 7,
                    alignItems: "center",
                    marginBottom: rIdx === KEY_ROWS.length - 1 ? 0 : 9
                }}>
                {row.map((key, cIdx) =>
                    key ? (
                    <div
                        key={cIdx}
                        style={{
                        gridColumn: `span 1`,
                        minWidth: `${KEY_WIDTHS[rIdx][cIdx] * pxPerUnit}px`,
                        height: 46,
                        background: KEY_ACTIONS[key] ? colors.keyboardKeyActiveBg : colors.keyboardKeyBg,
                        border: KEY_ACTIONS[key] ? `2.2px solid ${colors.keyboardKeyActiveBorder}` : `2px solid ${colors.keyboardKeyBorder}`,
                        borderRadius: 9,
                        fontSize: key === "Space" ? 22 : 16,
                        color: KEY_ACTIONS[key] ? colors.keyboardKeyActiveText : colors.keyboardKeyText,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        boxShadow: KEY_ACTIONS[key] ? colors.keyboardKeyActiveShadow : colors.keyboardKeyShadow,
                        userSelect: "none",
                        opacity: 1
                    }}>
                        {key === "Space" ? "SPACE" : key.replace("_R", "Shift")}
                        {KEY_ACTIONS[key] && (
                        <span style={{
                            position: "absolute",
                            bottom: 3,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 11.5,
                            color: colors.keyboardKeyBadgeText,
                            background: colors.keyboardKeyBadgeBg,
                            padding: "1.5px 7px",
                            borderRadius: colors.keyboardKeyBadgeBorderRadius,
                            fontWeight: 600,
                            marginTop: 2
                        }}>
                            {KEY_ACTIONS[key]}
                        </span>
                        )}
                    </div>
                    ) : (
                    <div key={cIdx} style={{
                        minWidth: `${KEY_WIDTHS[rIdx][cIdx] * pxPerUnit}px`,
                        height: 46,
                        opacity: 0
                    }} />
                    )
                )}
                </div>
            ))}
            </div>
            {/* Sidebar: in a card, centered, left-aligned items */}
            <div style={{
                margin: sidebarMargin,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: orientation === "portrait" ? "100vw" : "auto",
                maxWidth: orientation === "portrait" ? "98vw" : undefined,
            }}>
                <div style={{
                    background: colors.sidebarContainerBg,
                    borderRadius: colors.sidebarContainerBorderRadius,
                    boxShadow: colors.sidebarContainerShadow,
                    padding: "26px 23px",
                    minWidth: 224,
                    maxWidth: 330,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 16,
                }}>
                    {SIDEBAR_ACTIONS.map((item, idx) => (
                    <div key={idx} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        fontSize: 18,
                        borderRadius: 8,
                        fontWeight: 500
                    }}>
                        <span style={{
                            background: colors.sidebarKeyBg,
                            borderRadius: 7,
                            padding: "3px 16px",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            fontSize: 13.5,
                            color: colors.sidebarKeyText,
                            border: `2px solid ${colors.sidebarKeyBorder}`
                        }}>
                        {item.key}
                        </span>
                        <span style={{
                            color: colors.sidebarLabelText,
                            letterSpacing: "0.009em"
                        }}>{item.label}</span>
                    </div>
                    ))}
                </div>
            </div>
        </div>
        <div style={{
            position: "absolute", top: 20, right: 48, fontSize: 15, color: colors.sidebarLabelText
        }}>
            Press <strong>Ctrl+K</strong> or <strong>Esc</strong> to close
        </div>
        </div>
    );
}