import React from "react";

const colorHexes = {
  White: "#f8f8f6", Yellow: "#ffe844", Blue: "#3f69ff", Green: "#38c177", Red: "#ed3261", Orange: "#ffa656"
};

/**
 * SequenceRenderer
 * Props:
 *   caseObj: { triple: string (e.g. "---") }, 
 *   colors: array of color strings for each face,
 *   seqStep: number (index of step to display)
 */
export default function SequenceRenderer({ caseObj, colors, seqStep, duration, pause, onEnd }) {
  // Create sequence: char0, col0, char1, col1, char2, col2
  let items = [];
  for (let i = 0; i < 3; ++i) {
    items.push({ type: "char", value: caseObj.triple[i], key: `char${i}` });
    items.push({ type: "color", value: colors[i], key: `col${i}` });
  }
  const curr = items[seqStep];
  const next = items[seqStep + 1];
  if (!curr) return null;
  
  // Render
  return (
    <div style={{
      minHeight: "240px",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "28px"
    }}>
      {(
        <div style={{
          fontSize: "3.3rem",
          fontWeight: 700,
          color: "#43669B",
          alignItems: "center",
          justifyContent: "center",
          width: "100px",
          height: "100px",
          borderRadius: "16px",
          background: colorHexes[next.value] ?? "#aaa",
          boxShadow: `0 4px 32px ${colorHexes[next.value] ?? "#bbb"}55`,
          border: "2px solid #bcd",
          display: "flex"
        }}>
          {items[seqStep].value}
        </div>
      )}
    </div>
  );
}
