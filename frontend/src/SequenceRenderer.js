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
function SequenceRenderer({ caseObj, colors, seqStep }) {
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

export default SequenceRenderer;
