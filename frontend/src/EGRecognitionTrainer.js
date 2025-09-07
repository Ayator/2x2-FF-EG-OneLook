import React, { useEffect, useState, useRef } from "react";
import SequenceRenderer from "./SequenceRenderer";
import AnswerHexRow from "./AnswerHexRow";

// OLL cases and orientations
import { ollCases } from "./data/ollCases";
import { ollImage } from "./utils/ollUtils";

const answerHex = [
  [{ label: "SUNE" }, { label: "ANTISUNE" }],
  [{ label: "T" }, { label: "L" }, { label: "U" }],
  [{ label: "PI" }, { label: "H" }]
];
const directionNames = ["Up", "Right", "Down", "Left"];
const directionMap = { Up: "B", Right: "R", Down: "F", Left: "L" };

const colorNames = ["White", "Yellow", "Blue", "Green", "Red", "Orange"];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function EGRecognitionTrainer({ duration = 0.5, pause = 0.25 }) {
  const [phase, setPhase] = useState("showing");
  const [seqStep, setSeqStep] = useState(0);
  const [caseObj, setCaseObj] = useState(null);
  const [colors, setColors] = useState([]);
  const [flickOverlay, setFlickOverlay] = useState(null);
  const [feedback, setFeedback] = useState("");
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

  useEffect(() => {
    if (phase !== "showing") return;
    setCaseObj(pick(ollCases));
    setColors([pick(colorNames), pick(colorNames), pick(colorNames)]);
    setFlickOverlay(null);
    setFeedback("");
    setSeqStep(0);
  }, [phase]);

  useEffect(() => {
    if (phase !== "showing") return;
    if (seqStep >= 6) {
      setTimeout(() => setPhase("answer"), pause * 1000);
      return;
    }
    setTimeout(() => setSeqStep(s => s + 1), duration * 1000 + pause * 1000);
  }, [seqStep, phase, duration, pause]);

  function overlayPosition(rect, direction) {
    if (!rect) return { left: "50vw", top: "50vh", transform: "translate(-50%,-50%)" };
    const centerX = rect.left + rect.width / 2 + window.scrollX;
    const centerY = rect.top + rect.height / 2 + window.scrollY;
    const offset = rect.width * 0.8;
    let x = centerX, y = centerY;
    if (direction === "Up") y -= offset;
    else if (direction === "Down") y += offset;
    else if (direction === "Left") x -= offset;
    else if (direction === "Right") x += offset;
    return { left: `${x}px`, top: `${y}px`, transform: "translate(-50%,-50%)" };
  }
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
            if (btnOll === "H") {
                // Accept Left/Right for HL/HR and Front/Back for HF/HB
                const correct = caseObj.orientation;
                const answer = currentOrientation;
                // Left/Right match
                if ((correct === "L" || correct === "R") && (answer === "L" || answer === "R")) isCorrect = true;
                // Front/Back match
                else if ((correct === "F" || correct === "B") && (answer === "F" || answer === "B")) isCorrect = true;
            } else {
                isCorrect = currentOrientation === caseObj.orientation;
            }
        }

        setFeedback(
            `Chosen: ${btnOll} ${currentOrientation}. ` +
            (isCorrect ? "Correct!" : `Correct: ${caseObj.ollCase} ${caseObj.orientation}`)
        );
        setPhase("feedback");
        setTimeout(() => {
            setPhase("showing");
            setSeqStep(0);
        }, 1400);
    }, 1100);

    dragRef.current.dragging = false;
    dragRef.current.currentDirIdx = null;
    dragRef.current.currentOrientation = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f2f8fc",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center"
    }}>
      <h2 style={{ color: "#324b74", marginBottom: "24px" }}>EG OLL Recognition Trainer</h2>
      {phase === "showing" && (
        caseObj && <SequenceRenderer caseObj={caseObj} colors={colors} seqStep={seqStep} />
      )}

      {phase === "answer" && (
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
                <div
                  style={{
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
              <div
                style={{
                  position: "fixed",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "215px",
                  zIndex: 2099,
                  pointerEvents: "none",
                  background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.75) 90%)"
                }}
              />
              <div
                style={{
                  position: "fixed",
                  left: "50vw",
                  bottom: "40px",
                  transform: "translate(-50%, 0)",
                  zIndex: 2100,
                  pointerEvents: "auto"
                }}>
                <div
                  ref={cancelBtnRef}
                  aria-label="Cancel Flick"
                  style={{
                    background: "#ed3261",
                    border: "none",
                    borderRadius: "50%",
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 14px #bf2250a0",
                    cursor: "pointer"
                  }}>
                  <span style={{
                    color: "#fff",
                    fontSize: "2.4rem",
                    fontWeight: "bold",
                    lineHeight: "1",
                    fontFamily: "monospace"
                  }}>×</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {phase === "feedback" && (
        <div style={{
          color: feedback.includes("Correct!") ? "#129b48" : "#e73b58",
          fontSize: "1.35rem", marginTop: "38px", textAlign: "center"
        }}>{feedback}</div>
      )}
      <div style={{ marginTop: "44px", color: "#6b85be" }}>
        Object Duration:&nbsp;
        <input type="number" min="0.1" max="2" step="0.05" value={duration}
          onChange={e => window.location.reload()}
          style={{ width: 50 }} /> sec &nbsp;|&nbsp; Pause:&nbsp;
        <input type="number" min="0.05" max="1" step="0.05" value={pause}
          onChange={e => window.location.reload()}
          style={{ width: 50 }} /> sec
      </div>
    </div>
  );
}
