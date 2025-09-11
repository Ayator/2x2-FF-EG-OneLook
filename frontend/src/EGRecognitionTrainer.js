import React, { useEffect, useState, useRef } from "react";
import SequenceRenderer from "./SequenceRenderer";
import EGAnswerOLL from "./EGAnswerOLL";
import EGAnswerPLL from "./EGAnswerPLL";
import KeybindingsOverlay from "./utils/KeybindingsOverlay";
import { useOrientation } from "./hooks/useOrientation";
import EGIdlePhase from "./EGIdlePhase";

import { ollCases } from "./data/ollCases";

const colorNames = ["White", "Yellow", "Blue", "Green", "Red", "Orange"];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function EGRecognitionTrainer({ duration = 0.5, pause = 0.25 }) {
    const [phase, setPhase] = useState("idle");
    const [lastResult, setLastResult] = useState(null);
    const [seqStep, setSeqStep] = useState(0);
    const [caseObj, setCaseObj] = useState(null);
    const [colors, setColors] = useState([]);
    const [selectedOLL, setSelectedOLL] = useState(null);
    const [selectedOrientation, setSelectedOrientation] = useState("F");
    const [selectedPLL, setSelectedPLL] = useState("VANILLA");
    const orientation = useOrientation();

    function handleBegin() {
        setCaseObj(pick(ollCases));
        setColors([pick(colorNames), pick(colorNames), pick(colorNames)]);
        setSeqStep(0);
        setPhase("showing");
    }

    // Show next sequence or transition to answer
    useEffect(() => {
        if (phase !== "showing") return;
        if (seqStep >= 6) {
            setTimeout(() => setPhase("answer"), pause * 1000);
            return;
        }
        setTimeout(() => setSeqStep(s => s + 2), duration * 1000 + pause * 1000);
    }, [seqStep, phase, duration, pause]);

    // Callback from answer phase
    function handleOLLAnswer(isCorrect, oll, orientation) {
        setLastResult({
            isCorrect,
            chosen: { oll, orientation },
            expected: { oll: caseObj.ollCase, orientation: caseObj.orientation },
        });
        setPhase("idle");
    }

    useEffect(() => {
        // This effect runs whenever any answer is updated.
        if (!caseObj) return;
        // Compare all
        const correctOLL = selectedOLL === caseObj.ollCase;
        const correctOrientation = selectedOrientation === caseObj.orientation || (
            caseObj.ollCase === "H" && (
                (["L", "R"].includes(caseObj.orientation) && ["L", "R"].includes(selectedOrientation)) ||
                (["F", "B"].includes(caseObj.orientation) && ["F", "B"].includes(selectedOrientation))
            )
        );
        const correctPLL = selectedPLL === caseObj.pllCase; // or whatever field(s) hold the correct PLL info

        if (correctOLL && correctOrientation && correctPLL) {
            // All correct! End the phase after a short delay for feedback, or immediately.
            setTimeout(() => setPhase("idle"), 500);
        }
    }, [selectedOLL, selectedOrientation, selectedPLL, caseObj]);


    // Render
    return (
        <div style={{
            minHeight: "100vh",
            background: "#f2f8fc",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center"
        }}>
            <h2 style={{ color: "#324b74", marginBottom: "24px" }}>EG Recognition Trainer</h2>
            {phase === "idle" && (
                <EGIdlePhase
                    onBegin={handleBegin}
                    lastResult={lastResult}
                />
            )}
            {phase === "showing" && (
                <SequenceRenderer
                    caseObj={caseObj}
                    colors={colors}
                    seqStep={seqStep}
                />
            )}
            {phase === "answer" && (
                /* Responsive flex for answer section */ 
                <div style={{
                    display: "flex",
                    flexDirection: orientation === "portrait" ? "column" : "row",
                    alignItems: "stretch", // or "center"
                    justifyContent: "center",
                    gap: 22
                }}>
                    <EGAnswerOLL
                        caseObj={caseObj}
                        onOllChange={(oll, orientation) => { setSelectedOLL(oll); setSelectedOrientation(orientation); }}
                        onAnswer={handleOLLAnswer}
                    />
                    <EGAnswerPLL
                        caseObj={caseObj}
                        selectedOLL={selectedOLL}
                        ollOrientation={selectedOrientation}
                        onPllChange={pll => setSelectedPLL(pll)}
                    />
                </div>
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
            <KeybindingsOverlay />
        </div>
    );
}
