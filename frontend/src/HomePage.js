import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#e9f2fc"
    }}>
      <h1 style={{
        color: "#324b74",
        marginBottom: "2rem"
      }}>2x2 Trainer Homepage</h1>
      <button
        style={{
          fontSize: "1.3rem",
          fontWeight: 600,
          background: "linear-gradient(90deg, #5db1ff 0%, #85c7ff 100%)",
          color: "#16253e",
          border: "none",
          borderRadius: "12px",
          padding: "1rem 2.5rem",
          cursor: "pointer",
          boxShadow: "0 6px 30px rgba(32,44,90,0.11)"
        }}
        onClick={() => navigate("/trainer")}
      >
        Review First Face
      </button>
    </div>
  );
}

export default HomePage;
