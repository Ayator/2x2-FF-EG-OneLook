import React, { useEffect, useState, useRef } from "react";
import SequenceRenderer from "./SequenceRenderer";
import AnswerOLL from "./AnswerOLL";

// OLL cases and orientations
import { ollCases } from "./data/ollCases";

const colorNames = ["White", "Yellow", "Blue", "Green", "Red", "Orange"];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default function EGRecognitionTrainer({ duration = 0.5, pause = 0.25 }) {
    const [phase, setPhase] = useState("showing");
    const [seqStep, setSeqStep] = useState(0);
    const [caseObj, setCaseObj] = useState(null);
    const [colors, setColors] = useState([]);
    
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        if (phase !== "showing") return;
        console.log("Phase changed to 'showing', selecting new case");
        setCaseObj(pick(ollCases));
        setColors([pick(colorNames), pick(colorNames), pick(colorNames)]);
        setFeedback("");
        
        if(seqStep !== 0)
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

    function handleOLLAnswer(isCorrect, oll, orientation) {
        setFeedback(
            `Chosen: ${oll} ${orientation}. ` +
            (isCorrect ? "Correct!" : `Correct: ${caseObj.ollCase} ${caseObj.orientation}`)
        );
        setPhase("feedback");
        setTimeout(() => {
            setPhase("showing");
            setSeqStep(0);
        }, 1400);
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
                <AnswerOLL
                    caseObj={caseObj}
                    onAnswer={handleOLLAnswer}
                />
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
