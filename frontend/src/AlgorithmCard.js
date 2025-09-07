import React, { useState, useEffect, useCallback } from "react";
import "./AlgorithmCard.css";

function AlgorithmCard({ setupAlg, solutionAlg, setupImg, solutionImg }) {
  const [flipped, setFlipped] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Which image to show (front or back)?
  const isFront = !flipped;
  const shownImg = isFront ? setupImg : solutionImg;
  const shownAlg = isFront ? setupAlg : solutionAlg;

  // Reset flip and image load every time card/image changes
  useEffect(() => {
    setFlipped(false);
    setImgLoaded(false);
  }, [setupAlg, solutionAlg, setupImg, solutionImg]);

  // If flipped or image changes, (re)mark the image as loading
  useEffect(() => {
    setImgLoaded(false);
  }, [shownImg]);

  // Allow flipping card via SPACEBAR anywhere
  const onGlobalKeyDown = useCallback(e => {
    // e.code === 'Space' preferred, but some browsers may use e.key === ' ' or e.key === 'Spacebar'
    if (
      e.code === "Space" ||
      e.key === " " ||
      e.key === "Spacebar"
    ) {
      e.preventDefault();
      setFlipped(f => !f);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [onGlobalKeyDown]);

  return (
    <div
      className="card-flip-container"
      tabIndex={0}
      onClick={() => setFlipped(f => !f)}
      style={{ cursor: "pointer" }}
    >
      <div className={"card-flip-inner" + (flipped ? " flipped" : "")}>
        {/* Front Side */}
        <div className="card-flip-front">
          <span className="alg-caption">Setup</span>
          <img
            src={setupImg}
            alt="setup"
            className={"alg-img" + (imgLoaded && isFront ? " img-pop-in" : "")}
            onLoad={() => setImgLoaded(true)}
            draggable={false}
          />
          <div className="alg-moves">{setupAlg}</div>
        </div>
        {/* Back Side */}
        <div className="card-flip-back">
          <span className="alg-caption">Solution</span>
          <img
            src={solutionImg}
            alt="solution"
            className={"alg-img" + (imgLoaded && !isFront ? " img-pop-in" : "")}
            onLoad={() => setImgLoaded(true)}
            draggable={false}
          />
          <div className="alg-moves">{solutionAlg}</div>
        </div>
      </div>
    </div>
  );
}

export default AlgorithmCard;
