import React, { useState, useEffect, useRef } from "react";

// Helper: mapping OLL name to file code
const OLL_CODES = {
    SUNE: "S",
    ANTISUNE: "A",
    T: "T",
    L: "L",
    U: "U",
    PI: "P",
    H: "H",
};

// The moves as start/end pairs in order: BACK, DIAG1, RIGHT, DIAG2, FRONT, DIAG1, LEFT, DIAG2
const MOVES = [
    ["BL", "BR"],   // 0 BACK
    ["BL", "FR"],   // 1 DIAGONAL1
    ["BR", "FR"],   // 2 RIGHT
    ["BR", "FL"],   // 3 DIAGONAL2
    ["FR", "FL"],   // 4 FRONT
    ["FR", "BL"],   // 5 DIAGONAL1 (reverse)
    ["FL", "BL"],   // 6 LEFT
    ["FL", "BR"],   // 7 DIAGONAL2 (reverse)
];

const PIECE_KEY_MAP = {
  d: "BL",
  f: "BR",
  c: "FL",
  v: "FR",
};

const CASES = ["BACK", "DIAGONAL1", "RIGHT", "DIAGONAL2", "FRONT", "DIAGONAL1", "LEFT", "DIAGONAL2"];
const ORIENT_TO_STEPS = { F: 0, R: 2, B: 4, L: 6 }; // Each orientation is 2 steps in this 8-direction list

const imagesFolder = './eg_cases';

const ROTATION_DEGREES = { F: 0, L: 90, B: 180, R: 270 };

function getMoveIndex(start, end) {
    for (let i = 0; i < 8; i++) {
        if ((MOVES[i][0] === start && MOVES[i][1] === end) ||
            (MOVES[i][1] === start && MOVES[i][0] === end)) {
        return i;
        }
    }
    return null;
}

function getImageSrc(ollName, caseType) {
    const code = ollName ? OLL_CODES[ollName.toUpperCase()] : "O";
    return `${imagesFolder}/${code}_${caseType}.svg`;
}

function animateAngle(current, target, setAngle, duration = 300) {
    let start;
    let req;
    // Normalize angles
    let diff = target - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    function tick(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setAngle(current + diff * progress);
        if (progress < 1) req = requestAnimationFrame(tick);
    }
    req = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(req);
}

export default function EGAnswerPLL({ caseObj, selectedOLL, ollOrientation = "F", onPllChange }) {
    const [caseType, setCaseType] = useState("VANILLA");
    const dragState = useRef({ startPiece: null, currentPiece: null });
    const [touchStartPiece, setTouchStartPiece] = useState(null); // for display only
    const [currentPiece, setCurrentPiece] = useState(null);       // for display only
    const [logicalPerm, setLogicalPerm] = useState("VANILLA"); // the cube-side direction
    // key input
    const [keyDownPiece, setKeyDownPiece] = useState(null);

    const imageRef = useRef();
    const dragging = useRef(false);

    // rotation states
    const [displayedDegrees, setDisplayedDegrees] = useState(0);  // Actual rotation on img
    const lastOrientationRef = useRef(ollOrientation);
    const rotationDuration = 150;

    // Reset internal state when caseObj changes (new round)
    useEffect(() => {
        setLogicalPerm("VANILLA");
        setCaseType("VANILLA");
        setTouchStartPiece(null);
        setCurrentPiece(null);
        setKeyDownPiece(null);
    }, [caseObj.ollCase, caseObj.orientation]);

    useEffect(() => {
        const targetDegrees = ROTATION_DEGREES[ollOrientation] || 0;
        const prevDegrees = ROTATION_DEGREES[lastOrientationRef.current] || 0;
        if (prevDegrees === targetDegrees) return;
        // animateAngle interpolates from prevDegrees to targetDegrees
        let cancel = animateAngle(displayedDegrees, targetDegrees, setDisplayedDegrees, rotationDuration);
        lastOrientationRef.current = ollOrientation;
        return cancel;
        // eslint-disable-next-line
    }, [ollOrientation]);

    useEffect(() => {
        // For vanilla, always show vanilla
        if (logicalPerm === "VANILLA") {
            setCaseType("VANILLA");
            return;
        }
        // Find the index of the logicalPerm in CASES array
        const logicalIdx = CASES.findIndex(v => v === logicalPerm);
        if (logicalIdx === -1) {
            setCaseType("VANILLA");
            return;
        }
        // Visually rotate clockwise by the OLL orientation steps
        const steps = ORIENT_TO_STEPS[ollOrientation || "F"];
        const displayIdx = (logicalIdx + steps) % 8;
        setCaseType(CASES[displayIdx]);
    }, [logicalPerm, ollOrientation]);

    // key input logic
    useEffect(() => {
        function onKeyDown(e) {
            const k = e.key.toLowerCase();
            if (k === "x") {
                setKeyDownPiece(null);
                setLogicalPerm("VANILLA");
                if (typeof onPllChange === "function") onPllChange("VANILLA");
                return;
            }
            if (!(k in PIECE_KEY_MAP)) return;
            const piece = PIECE_KEY_MAP[k];

            if (!keyDownPiece) {
                // First key - just set vanilla, remember key
                setKeyDownPiece(piece);
                setLogicalPerm("VANILLA");
                if (typeof onPllChange === "function") onPllChange("VANILLA");
            } else if (keyDownPiece && piece !== keyDownPiece) {
                // Second key - select permutation
                const start = keyDownPiece;
                const end = piece;
                let moveIdx = getMoveIndex(start, end);
                if (moveIdx !== null) {
                    setLogicalPerm(CASES[moveIdx]);
                    if (typeof onPllChange === "function") onPllChange(CASES[moveIdx]);
                } else {
                    setLogicalPerm("VANILLA");
                    if (typeof onPllChange === "function") onPllChange("VANILLA");
                }
                setKeyDownPiece(null);
            }
            // If keydown with same as previous, ignore (don't allow D→D, etc.)
        }

        function onKeyUp(e) {
            // Optional: allow users to "reset" midway if they let go of the first key early.
            // Otherwise, leave empty
        }

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [keyDownPiece, setLogicalPerm, onPllChange]);

    // Get piece under touch/click position
    function getPieceFromCoords(x, y) {
        if (!imageRef.current) return null;
        const rect = imageRef.current.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        const rx = x - rect.left;
        const ry = y - rect.top;
        // Top half = BL/BR (back row), bottom half = FL/FR (front row)
        if (ry < h / 2) {
            return rx < w / 2 ? "BL" : "BR";
        } else {
            return rx < w / 2 ? "FL" : "FR";
        }

    }
    function handlePointerDown(e) {
        dragging.current = true;
        const isTouch = !!e.touches;
        const x = isTouch ? e.touches[0].clientX : e.clientX;
        const y = isTouch ? e.touches[0].clientY : e.clientY;
        const piece = getPieceFromCoords(x, y);
        dragState.current.startPiece = piece;
        dragState.current.currentPiece = piece;
        setTouchStartPiece(piece); // purely for feedback display
        setCurrentPiece(piece);    // purely for feedback display
        setCaseType("VANILLA");
        window.addEventListener(isTouch ? "touchmove" : "mousemove", handlePointerMove, { passive: false });
        window.addEventListener(isTouch ? "touchend" : "mouseup", handlePointerUp, { passive: false });
    }

    function handlePointerMove(e) {
        if (!dragging.current) return;
        const isTouch = !!e.touches;
        const x = isTouch ? e.touches[0].clientX : e.clientX;
        const y = isTouch ? e.touches[0].clientY : e.clientY;
        const piece = getPieceFromCoords(x, y);
        dragState.current.currentPiece = piece;
        setCurrentPiece(piece);  // for user feedback UI
        e.preventDefault();
    }

    function handlePointerUp(e) {
        if (!dragging.current) return;
        dragging.current = false;
        const isTouch = !!e.changedTouches;
        const x = isTouch ? e.changedTouches[0].clientX : e.clientX;
        const y = isTouch ? e.changedTouches[0].clientY : e.clientY;
        const endPiece = getPieceFromCoords(x, y);
        window.removeEventListener(isTouch ? "touchmove" : "mousemove", handlePointerMove);
        window.removeEventListener(isTouch ? "touchend" : "mouseup", handlePointerUp);

        // Use dragState.current.* for decision making!
        const start = dragState.current.startPiece;
        const end = endPiece;

        let permCase = "VANILLA";
        if (start && end && start !== end) {
            let moveIdx = getMoveIndex(start, end);
            if (moveIdx !== null) {
                setLogicalPerm(CASES[moveIdx]); // This is always the "cube logic" value
                if (typeof onPllChange === "function") onPllChange(CASES[moveIdx]);
            }
        } else {
            setLogicalPerm("VANILLA");
            if (typeof onPllChange === "function") onPllChange("VANILLA");
        }
        dragState.current.startPiece = null;
        dragState.current.currentPiece = null;
        setTouchStartPiece(null);
        setCurrentPiece(null);
    }

      // Mouse vs. touch detection for image
    function onImgMouseDown(e) {
        if (e.button !== 0) return;
        handlePointerDown(e);
    }
    function onImgTouchStart(e) {
        if (e.touches.length > 1) return; // ignore multi-touch
        handlePointerDown(e);
    }

    // Render
    const imgSrc = getImageSrc(selectedOLL, caseType);

    return (
        <div style={{
            width: "100%",
            maxWidth: 350,
            aspectRatio: "1",
            overflow: "hidden",
            position: "relative",
            margin: "0 auto"
        }}>
            <img
                ref={imageRef}
                src={imgSrc}
                alt={caseType + " permutation"}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    userSelect: "none",
                    touchAction: "none",
                    transform: `rotate(${displayedDegrees}deg)`,
                    transition: "none" // handled by JS
                }}      
                draggable={false}          
                onMouseDown={onImgMouseDown}
                onTouchStart={onImgTouchStart}
            />
            {/* feedback display of current selection and drag status */}
            {touchStartPiece && currentPiece && dragging.current && (
                <div style={{position:"absolute", bottom:4, left:"50%", transform:"translateX(-50%)", color:"#388", fontSize:"1rem"}}>
                {touchStartPiece} &rarr; {currentPiece}
                </div>
            )}
        </div>
    );
}
