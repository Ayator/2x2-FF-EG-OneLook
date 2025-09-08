import React from "react";

// Optional: allow controlling visibility with a `show` prop
function CancelFlickOverlay({ cancelBtnRef, show = true }) {
  if (!show) return null;
  return (
    <>
        <div style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            height: "215px",
            zIndex: 2099,
            pointerEvents: "none",
            background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.75) 90%)"
        }}/>
        <div style={{
            position: "fixed",
            left: "50vw",
            bottom: "40px",
            transform: "translate(-50%, 0)",
            zIndex: 2100,
            pointerEvents: "auto"
        }}>
            <div ref={cancelBtnRef}
                aria-label="Cancel Flick"
                style={{
                background: "#ed3261",
                border: "none",
                borderRadius: "50%",
                width: "96px",
                height: "96px",
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
  );
}

export default CancelFlickOverlay;
