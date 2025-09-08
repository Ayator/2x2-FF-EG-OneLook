import React, { useEffect, useState, useRef } from "react";
import AnswerHexRow from "./AnswerHexRow";

import { ollImage } from "./utils/ollUtils";

const answerHex = [
    [{ label: "SUNE" }, { label: "ANTISUNE" }],
    [{ label: "T" }, { label: "L" }, { label: "U" }],
    [{ label: "PI" }, { label: "H" }]
];

const ollKeyMap = {
    a: "ANTISUNE",
    s: "SUNE",
    t: "T",
    l: "L",
    u: "U",
    p: "PI",
    h: "H",
};
const arrowMap = {
    ArrowUp: { idx: 0, label: "Up", orientation: "B" },
    ArrowRight: { idx: 1, label: "Right", orientation: "R" },
    ArrowDown: { idx: 2, label: "Down", orientation: "F" },
    ArrowLeft: { idx: 3, label: "Left", orientation: "L" },
};

const directionNames = ["Up", "Right", "Down", "Left"];
const directionMap = { Up: "B", Right: "R", Down: "F", Left: "L" };

const ollImageScale = 0.8; // Scale down

function overlayPosition(rect, direction) {
    if (!rect) return { left: "50vw", top: "50vh", transform: "translate(-50%,-50%)" };
    const centerX = rect.left + rect.width / 2 + window.scrollX;
    const centerY = rect.top + rect.height / 2 + window.scrollY;
    const offset = rect.width * 0.8;
    let x = centerX, y = centerY;
    if      (direction === "Up"   ) y -= offset;
    else if (direction === "Down" ) y += offset;
    else if (direction === "Left" ) x -= offset;
    else if (direction === "Right") x += offset;
    return { left: `${x}px`, top: `${y}px`, transform: "translate(-50%,-50%)" };
}

export default function AnswerOLL({
    caseObj,
    onAnswer
}){
    const [flickOverlay, setFlickOverlay] = useState(null);
    
    const buttonRefs = useRef([]);

    const answer = useRef({
        oll: null,
        orientation: "F"
    });

    function resetAnswer(){
        answer.current.oll = null;
        answer.current.orientation = "F";
    }

    const dragRef = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        btnOll: null,
        btnIdx: null,
        btnRect: null,
        currentDirIdx: null,
        currentOrientation: null,
    });

    // Handle pointer down on an answer button
    function onAnswerPointerDown(oll, e, idx) {
        const rect = buttonRefs.current[idx]?.getBoundingClientRect();
        dragRef.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            btnOll: oll,
            btnIdx: idx,
            btnRect: rect,
            currentDirIdx: null,
            currentOrientation: null,
        };
        answer.current.oll = oll;
        setFlickOverlay({
            direction: null,
            btnRect: rect,
            active: true,
        });
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }
    // Handle pointer move during drag
    function onPointerMove(e) {
        const { dragging, startX, startY, btnOll, btnRect, currentDirIdx } = dragRef.current;
        if (!dragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        let newDirIdx = null, direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
            newDirIdx = dx > 30 ? 1 : dx < -30 ? 3 : null;
        } else {
            newDirIdx = dy > 30 ? 2 : dy < -30 ? 0 : null;
        }
        if (newDirIdx !== null) {
            direction = directionNames[newDirIdx];
            answer.current.orientation = directionMap[direction];
            if (currentDirIdx !== newDirIdx) {
                setFlickOverlay({
                    direction,
                    btnRect,
                    active: true,
                });
                dragRef.current.currentDirIdx = newDirIdx;
                dragRef.current.currentOrientation = answer.current.orientation;
            }
        } else {
            setFlickOverlay({
                direction: null,
                btnRect,
                active: true,
            });
            dragRef.current.currentDirIdx = null;
            dragRef.current.currentOrientation = null;
        }
    }
    // Handle pointer up to finalize or cancel
    function onPointerUp(e) {
        const { dragging, btnOll, currentOrientation, btnRect } = dragRef.current;
        if(!dragging) return;

        setFlickOverlay({
            direction: null,
            btnRect: btnRect,
            active: true,
        });

        dragRef.current.dragging = false;
        dragRef.current.currentDirIdx = null;
        dragRef.current.currentOrientation = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }

    // keyboard stuff
    // Helper to find button index so we can get a ref
    function getOLLIndex(label) {
        // Flatten your answerHex array for label lookup.
        const flat = answerHex.flat();
        return flat.findIndex(x => x.label === label);
    }

    function getButtonRefFromOll(oll){
        // Get button rect from ref
        const idx = getOLLIndex(answer.current.oll);
        const btnElem = buttonRefs.current[idx];

        // Fallback to center if not rendered
        return (btnElem) ? btnElem.getBoundingClientRect() : null;
    }

    // Handle keyboard input for OLL and direction
    useEffect(() => {
        function handleKeyDown(e) {
            const key = e.key.toLowerCase();
            
            // OLL Selection
            if(ollKeyMap[key]){
                answer.current.oll = ollKeyMap[key];
                let btnRect = getButtonRefFromOll(answer.current.orientation);
                setFlickOverlay({
                    direction: null,
                    btnRect,
                    active: true,
                });
            }
            // Arrow Selection
            if(arrowMap[e.key]){
                answer.current.orientation = arrowMap[e.key].orientation;
                if(answer.current.oll){
                    let btnRect = getButtonRefFromOll(answer.current.orientation);
                    setFlickOverlay({
                        direction: arrowMap[e.key].label,
                        btnRect: btnRect,
                        active: true,
                    });
                }
            }
            // Space to submit if both chosen
            if (e.code === "Space" && answer.current.oll) {
                // Evaluate answer and call onAnswer
                const selectedOLL = answer.current.oll;
                const selectedOrientation = answer.current.orientation;
                let isCorrect = false;
                if (selectedOLL === caseObj.ollCase) {
                    const correct = caseObj.orientation;
                    if (selectedOLL === "H") {
                    if ((correct === "L" || correct === "R") && (selectedOrientation === "L" || selectedOrientation === "R"))
                        isCorrect = true;
                    else if ((correct === "F" || correct === "B") && (selectedOrientation === "F" || selectedOrientation === "B"))
                        isCorrect = true;
                    } else {
                        isCorrect = selectedOrientation === correct;
                    }
                }
                // Reset answer so the next round can begin
                resetAnswer();
                setFlickOverlay(null);
                onAnswer(isCorrect, selectedOLL, selectedOrientation);
            }
        }
        function handleKeyUp(e) {
            if(!answer.current.oll) return;
            const key = e.key.toLowerCase();
            // Releasing arrow resets image to middle
            if (Object.keys(arrowMap).map(x => x.toLowerCase()).includes(key)) {
                const btnRect = getButtonRefFromOll(answer.current.oll);
                setFlickOverlay({
                    direction: null,
                    btnRect: btnRect,
                    active: true,
                });
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [caseObj, onAnswer]);

    // Render
    return (<>
        <div style={{
            position: "relative",
            margin: "0 auto",
            transform: "scale(" + ollImageScale + ")",
            transformOrigin: "top center",
            background: "rgba(245,245,255,0.95)" // Gentle background 
        }}>
            {answerHex.map((rowCases, rowIdx) => (
                <AnswerHexRow
                    rowCases={rowCases}
                    ollImage={ollImage}
                    orientation={"F"}
                    onAnswerPointerDown={onAnswerPointerDown}
                    positionMapKey={rowIdx === 0 ? "top" : rowIdx === 1 ? "middle" : "bottom"}
                    buttonRefs={buttonRefs}
                />
            ))}
        </div>
        {/* Flick overlay*/}
        {flickOverlay && (
            <>
                <div style={{
                    position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
                    zIndex: 2000, pointerEvents: "none"
                }}>
                    <div style={{
                        position: "absolute",
                        ...overlayPosition(flickOverlay.btnRect, flickOverlay.direction),
                        width: (140 * ollImageScale) + "px",
                        height: (140 * ollImageScale) + "px",
                        background: "#232c39b3", borderRadius: "18px",
                        padding: "12px", boxShadow: "0 0 38px #1a2a7c42",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "left 0.1s, top 0.1s"
                    }}>
                        <img
                            src={ollImage(answer.current.oll, answer.current.orientation)}
                            alt="OLL"
                            style={{
                                transform: "scale(" + ollImageScale + ")",
                                width: "140px", height: "140px", borderRadius: "23px",
                                border: "4px solid #fcfcfc", boxShadow: "0 0 18px #2142bb66",
                                userSelect:"none", pointerEvents:"none"
                            }} draggable={false}
                        />
                    </div>
                </div>
            </>
        )}
    </>);
}