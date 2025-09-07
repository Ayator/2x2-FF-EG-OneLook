import React, { useEffect, useState, useRef } from "react";
// OLL cases and orientations
const ollCases = [
  { triple: "---", ollCase: "SUNE", orientation: "B" },
  { triple: "--0", ollCase: "SUNE", orientation: "L" },
  { triple: "-0-", ollCase: "SUNE", orientation: "F" },
  { triple: "0--", ollCase: "SUNE", orientation: "R" },
  { triple: "++0", ollCase: "ANTISUNE", orientation: "B" },
  { triple: "+0+", ollCase: "ANTISUNE", orientation: "L" },
  { triple: "0++", ollCase: "ANTISUNE", orientation: "F" },
  { triple: "+++", ollCase: "ANTISUNE", orientation: "R" },
  { triple: "0-0", ollCase: "L", orientation: "B" },
  { triple: "-0+", ollCase: "L", orientation: "L" },
  { triple: "0+0", ollCase: "L", orientation: "F" },
  { triple: "+0-", ollCase: "L", orientation: "R" },
  { triple: "-00", ollCase: "T", orientation: "R" },
  { triple: "00+", ollCase: "T", orientation: "B" },
  { triple: "0+-", ollCase: "T", orientation: "L" },
  { triple: "+-0", ollCase: "T", orientation: "F" },
  { triple: "00-", ollCase: "U", orientation: "B" },
  { triple: "0-+", ollCase: "U", orientation: "L" },
  { triple: "-+0", ollCase: "U", orientation: "F" },
  { triple: "+00", ollCase: "U", orientation: "R" },
  { triple: "++-", ollCase: "PI", orientation: "R" },
  { triple: "+--", ollCase: "PI", orientation: "B" },
  { triple: "--+", ollCase: "PI", orientation: "L" },
  { triple: "-++", ollCase: "PI", orientation: "F" },
  { triple: "+-+", ollCase: "H", orientation: "L" },
  { triple: "-+-", ollCase: "H", orientation: "F" },
  { triple: "+-+", ollCase: "H", orientation: "R" },
  { triple: "-+-", ollCase: "H", orientation: "B" },
];
const answerHex = [
  [{ label: "SUNE" }, { label: "ANTISUNE" }],
  [{ label: "T" }, { label: "L" }, { label: "U" }],
  [{ label: "PI" }, { label: "H" }]
];
const directionNames = ["Up", "Right", "Down", "Left"];
const directionMap = { Up: "B", Right: "R", Down: "F", Left: "L" };
const colorHexes = {
  White: "#f8f8f6", Yellow: "#ffe844", Blue: "#3f69ff", Green: "#38c177", Red: "#ed3261", Orange: "#ffa656"
};
const colorNames = ["White", "Yellow", "Blue", "Green", "Red", "Orange"];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function renderSequence({ caseObj, colors, seqStep }) {
  // Create sequence: char0, col0, char1, col1, char2, col2
  let items = [];
  for (let i = 0; i < 3; ++i) {
    items.push({ type: "char", value: caseObj.triple[i], key: `char${i}` });
    items.push({ type: "color", value: colors[i], key: `col${i}` });
  }
  const curr = items[seqStep];
  if (!curr) return null;
  return (
    <div style={{
      minHeight: "240px",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "28px"
    }}>
      {curr.type === "char" ? (
        <div style={{
          fontSize: "3.3rem",
          fontWeight: 700,
          color: "#43669B",
          background: "#e9f1fa",
          borderRadius: "16px",
          boxShadow: "0 4px 28px #99bafe27",
          width: "100px",
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {curr.value}
        </div>
      ) : (
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "16px",
          background: colorHexes[curr.value] ?? "#aaa",
          boxShadow: `0 4px 32px ${colorHexes[curr.value] ?? "#bbb"}55`,
          border: "2px solid #bcd",
          display: "flex"
        }} />
      )}
    </div>
  );
}

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

  function ollImage(oll, orientation = "F") {
    return `/oll_cases/${oll}_${orientation}.jpg`;
  }
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
        caseObj && renderSequence({ caseObj, colors, seqStep })
        )}

      {phase === "answer" && (
        <div style={{
          width: 700, height: 700,
          position: "relative",
          margin: "0 auto",
          marginBottom: "12px"
        }}>
            {/* Top row: 2 */}
            <div style={{
            position: "absolute",
            left: "50%", top: "10%",
            transform: "translate(-50%,0)",
            display: "flex", justifyContent: "center", gap: "24px"
            }}>
            {answerHex[0].map(({ label }, hexIdx) => {
                const flatIdx = hexIdx;
                return (
                <button
                    key={label}
                    ref={el => buttonRefs.current[flatIdx] = el}
                    style={{
                    background: "#dbeafe", borderRadius: "20px", border: "none",
                    width: "140px", height: "140px", cursor: "pointer",
                    boxShadow: "0 6px 28px #c6dbfe44",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    position: "relative"
                    }}
                    onPointerDown={e => onAnswerPointerDown(label, e, flatIdx)}
                >
                    <img src={ollImage(label, "F")} alt={label+" F"}
                    style={{
                        width:"120px",height:"120px",marginTop:"10px",borderRadius:"16px",border:"3px solid #99b",
                        userSelect:"none", pointerEvents:"none"
                    }} draggable={false}/>
                </button>
                );
            })}
            </div>
            {/* Middle row: 3 */}
            <div style={{
            position: "absolute",
            left: "50%", top: "38%",
            transform: "translate(-50%,0)",
            display: "flex", justifyContent: "center", gap: "12px"
            }}>
            {answerHex[1].map(({ label }, hexIdx) => {
                const flatIdx = 2 + hexIdx;
                return (
                <button
                    key={label}
                    ref={el => buttonRefs.current[flatIdx] = el}
                    style={{
                    background: "#dbeafe", borderRadius: "20px", border: "none",
                    width: "140px", height: "140px", cursor: "pointer",
                    boxShadow: "0 6px 28px #c6dbfe44",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    position: "relative"
                    }}
                    onPointerDown={e => onAnswerPointerDown(label, e, flatIdx)}
                >
                    <img src={ollImage(label, "F")} alt={label+" F"}
                    style={{
                        width:"120px",height:"120px",marginTop:"10px",borderRadius:"16px",border:"3px solid #99b",
                        userSelect:"none", pointerEvents:"none"
                    }} draggable={false}/>
                </button>
                );
            })}
            </div>
            {/* Bottom row: 2 */}
            <div style={{
            position: "absolute",
            left: "50%", top: "66%",
            transform: "translate(-50%,0)",
            display: "flex", justifyContent: "center", gap: "24px"
            }}>
            {answerHex[2].map(({ label }, hexIdx) => {
                const flatIdx = 5 + hexIdx;
                return (
                <button
                    key={label}
                    ref={el => buttonRefs.current[flatIdx] = el}
                    style={{
                    background: "#dbeafe", borderRadius: "20px", border: "none",
                    width: "140px", height: "140px", cursor: "pointer",
                    boxShadow: "0 6px 28px #c6dbfe44",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    position: "relative"
                    }}
                    onPointerDown={e => onAnswerPointerDown(label, e, flatIdx)}
                >
                    <img src={ollImage(label, "F")} alt={label+" F"}
                    style={{
                        width:"120px",height:"120px",marginTop:"10px",borderRadius:"16px",border:"3px solid #99b",
                        userSelect:"none", pointerEvents:"none"
                    }} draggable={false}/>
                </button>
                );
            })}
            </div>

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
