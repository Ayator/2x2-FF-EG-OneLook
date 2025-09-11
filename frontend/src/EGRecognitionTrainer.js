import React, { useEffect, useState, useRef } from "react";
import EGIdlePhase from "./EGIdlePhase";
import SequenceRenderer from "./SequenceRenderer";
import EGAnswerOLL from "./EGAnswerOLL";
import EGAnswerPLL from "./EGAnswerPLL";

import KeybindingsOverlay from "./utils/KeybindingsOverlay";
import { useOrientation } from "./hooks/useOrientation";

import { ollCases } from "./data/ollCases";

const colorNames = ["White", "Yellow", "Blue", "Green", "Red", "Orange"];
const colorPairs = [
    ["White", "Yellow"],
    ["Blue", "Green"],
    ["Red", "Orange"]
];
const opposites = Object.fromEntries(
    colorPairs.flatMap(([a, b]) => [[a, b], [b, a]])
);

function getRelation(c1, c2) {
    if (c1 === c2) return "Same";
    if (opposites[c1] === c2) return "Opposite";
    return "Unrelated";
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const PLL_CASES = [
    "VANILLA", "LEFT", "RIGHT", "BACK", "FRONT", "DIAGONAL"
];

function pickExcluding(arr, exclude = []) {
    const options = arr.filter(c => !exclude.includes(c));
    return options[Math.floor(Math.random() * options.length)];
}

function genTripleForCase(pllCase) {
    let c1, c2, c3;
    c1 = pickExcluding(colorNames);
    if (pllCase === "VANILLA") {
        // c2 must be equal to c1
        c2 = c1;
        // c3 must be Opposite to c2
        c3 = opposites[c2];
    } else if (pllCase === "BACK") {
        // c2 must be equal to c1
        c2 = c1;
        // c3 must be unrelated to c2
        c3 = pickExcluding(colorNames, [c1, opposites[c1]]);
    } else if (pllCase === "DIAGONAL") {
        // c2 must be opposite to c1
        c2 = opposites[c1];
        // c3 must be equal to c2
        c3 = c2;
    } else if (pllCase === "FRONT") {
        // c2 must be opposite to c1
        c2 = opposites[c1];
        // c3 must be unrelated to c2
        c3 = pickExcluding(colorNames, [c1, opposites[c1]]);
    } else if (pllCase === "LEFT") {
        // c2 must be unrelated to c1
        let unrelateds = colorNames.filter(c => c !== c1 && c !== opposites[c1]);
        c2 = unrelateds[Math.floor(Math.random() * unrelateds.length)];
        // c3 must be equal to c2
        c3 = c2;
    } else if (pllCase === "RIGHT") {
        // c2 must be unrelated to c1
        let unrelateds = colorNames.filter(c => c !== c1 && c !== opposites[c1]);
        c2 = unrelateds[Math.floor(Math.random() * unrelateds.length)];
        // c3 must be opposite to c2
        c3 = opposites[c2];
    }
    return [c1, c2, c3];
}

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
        if (phase !== "idle") return;
        const pllCase = PLL_CASES[Math.floor(Math.random() * PLL_CASES.length)];
        setColors(genTripleForCase(pllCase));
        setCaseObj({...pick(ollCases), pllCase})
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
        const correctPLL = selectedPLL === caseObj.pllCase;

        // All correct! End the phase immediately.
        if (correctOLL && correctOrientation && correctPLL) {
            setLastResult({
                oll: selectedOLL,
                orientation: selectedOrientation,
                pll: selectedPLL
            });
            setPhase("idle");
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
