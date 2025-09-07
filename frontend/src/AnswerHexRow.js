import React, { useRef } from "react";

const positionMap = {
    "top": { top: "10%", extraIndex: 0 },
    "middle": { top: "38%", extraIndex: 2 },
    "bottom": { top: "66%", extraIndex: 5 }
};
/**
 * AnswerHexRow component
 * Props:
 * - rowCases: array of objects with {label}
 * - ollImage: function(label, face) => image URL
 * - onAnswerPointerDown: function(label, event, flatIdx)
 */
function AnswerHexRow({ rowCases, ollImage, orientation, onAnswerPointerDown, positionMapKey, buttonRefs }) {
  return (
    <div style={{
        position: "absolute",
        left: "50%",
        top: positionMap[positionMapKey].top,
        transform: "translate(-50%,0)",
        display: "flex",
        justifyContent: "center",
        gap: "24px"
      }}
    >
      {rowCases.map(({ label }, hexIdx) => {
        const flatIdx = hexIdx + positionMap[positionMapKey].extraIndex;
        return (
          <button
            key={label}
            ref={el => buttonRefs.current[flatIdx] = el}
            style={{
              background: "#dbeafe",
              borderRadius: "20px",
              border: "none",
              width: "140px",
              height: "140px",
              cursor: "pointer",
              boxShadow: "0 6px 28px #c6dbfe44",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}
            onPointerDown={e => onAnswerPointerDown(label, e, flatIdx)}
          >
            <img
              src={ollImage(label, orientation)}
              alt={label + " " + orientation}
              style={{
                width: "120px",
                height: "120px",
                marginTop: "10px",
                borderRadius: "16px",
                border: "3px solid #99b",
                userSelect: "none",
                pointerEvents: "none"
              }}
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
}

export default AnswerHexRow;
