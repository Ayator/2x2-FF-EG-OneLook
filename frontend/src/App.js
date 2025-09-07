import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import FirstFaceTrainer from "./FirstFaceTrainer";
import EGRecognitionTrainer from "./EGRecognitionTrainer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trainer" element={<FirstFaceTrainer />} />
        <Route path="/eg-trainer" element={<EGRecognitionTrainer />} />
      </Routes>
    </Router>
  );
}

export default App;
