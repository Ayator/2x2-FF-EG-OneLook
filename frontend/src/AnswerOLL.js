import React, { useEffect, useState, useRef } from "react";
import AnswerHexRow from "./AnswerHexRow";
import CancelFlickOverlay from "./CancelFlickOverlay";

import { ollImage } from "./utils/ollUtils";

const answerHex = [
  [{ label: "SUNE" }, { label: "ANTISUNE" }],
  [{ label: "T" }, { label: "L" }, { label: "U" }],
  [{ label: "PI" }, { label: "H" }]
];

const directionNames = ["Up", "Right", "Down", "Left"];
const directionMap = { Up: "B", Right: "R", Down: "F", Left: "L" };

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
    const cancelBtnRef = useRef(null);

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
        setFlickOverlay(null);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }
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
        const orientation = directionMap[direction];
        if (currentDirIdx !== newDirIdx) {
            setFlickOverlay({
            oll: btnOll,
            orientation,
            direction,
            btnRect,
            active: true,
            });
            dragRef.current.currentDirIdx = newDirIdx;
            dragRef.current.currentOrientation = orientation;
        }
        } else {
        setFlickOverlay(null);
        dragRef.current.currentDirIdx = null;
        dragRef.current.currentOrientation = null;
        }
    }
    function onPointerUp(e) {
        const { dragging, btnOll, currentOrientation } = dragRef.current;
        let pointerCanceled = false;
        if (cancelBtnRef.current) {
        const cancelRect = cancelBtnRef.current.getBoundingClientRect();
        const x = e.clientX, y = e.clientY;
        if (
            x >= cancelRect.left &&
            x <= cancelRect.right &&
            y >= cancelRect.top &&
            y <= cancelRect.bottom
        ) {
            pointerCanceled = true;
        }
        }
        if (pointerCanceled) {
        setFlickOverlay(null);
        dragRef.current.dragging = false;
        dragRef.current.currentDirIdx = null;
        dragRef.current.currentOrientation = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        return;
        }
        if (!dragging || !currentOrientation) {
        setFlickOverlay(null);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        return;
        }
        setTimeout(() => {
            setFlickOverlay(null);
            let isCorrect = false;
            if (btnOll === caseObj.ollCase) {
                const correct = caseObj.orientation;
                if (btnOll === "H") {
                    // Accept Left/Right for HL/HR and Front/Back for HF/HB
                    const answer = currentOrientation;
                    // Left/Right match
                    if ((correct === "L" || correct === "R") && (answer === "L" || answer === "R")) isCorrect = true;
                    // Front/Back match
                    else if ((correct === "F" || correct === "B") && (answer === "F" || answer === "B")) isCorrect = true;
                } else {
                    isCorrect = currentOrientation === correct;
                }
            }
            setFlickOverlay(null);
            onAnswer(isCorrect, btnOll, currentOrientation);
        }, 1100);

        dragRef.current.dragging = false;
        dragRef.current.currentDirIdx = null;
        dragRef.current.currentOrientation = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }

    return (
        <div style={{
            width: 700, height: 700,
            position: "relative",
            margin: "0 auto",
            marginBottom: "12px"
        }}>
            {/* Top row: 2 */}
            <AnswerHexRow
                rowCases={answerHex[0]}
                ollImage={ollImage}
                orientation={"F"}
                onAnswerPointerDown={onAnswerPointerDown}
                positionMapKey={"top"}
                buttonRefs={buttonRefs}
            />
            {/* Middle row: 3 */}
            <AnswerHexRow
                rowCases={answerHex[1]}
                ollImage={ollImage}
                orientation={"F"}
                onAnswerPointerDown={onAnswerPointerDown}
                positionMapKey={"middle"}
                buttonRefs={buttonRefs}
            />
            {/* Bottom row: 2 */}
            <AnswerHexRow
                rowCases={answerHex[2]}
                ollImage={ollImage}
                orientation={"F"}
                onAnswerPointerDown={onAnswerPointerDown}
                positionMapKey={"bottom"}
                buttonRefs={buttonRefs}
            />
            {/* Flick overlay and cancel */}
            {flickOverlay && (
                <>
                    <div style={{
                        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
                        zIndex: 2000, pointerEvents: "none"
                    }}>
                        <div style={{
                            position: "absolute",
                            ...overlayPosition(flickOverlay.btnRect, flickOverlay.direction),
                            background: "#232c39b3", borderRadius: "18px",
                            padding: "12px", boxShadow: "0 0 38px #1a2a7c42",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                        <img
                            src={ollImage(flickOverlay.oll, flickOverlay.orientation)}
                            alt="OLL"
                            style={{
                            width: "144px", height: "144px", borderRadius: "23px",
                            border: "4px solid #fcfcfc", boxShadow: "0 0 18px #2142bb66",
                            userSelect:"none", pointerEvents:"none"
                            }} draggable={false}/>
                        </div>
                    </div>
                    <CancelFlickOverlay cancelBtnRef={cancelBtnRef} show={true} />
                </>
            )}
        </div>
    )
}