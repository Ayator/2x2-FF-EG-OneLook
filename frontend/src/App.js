import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./features/home/HomePage";
import FirstFaceTrainer from "./features/first-face/components/FirstFaceTrainer";
import EGRecognitionTrainer from "./features/eg-training/components/EGRecognitionTrainer";

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
