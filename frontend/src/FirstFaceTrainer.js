import React, { useEffect, useState, useRef } from "react";
import AlgorithmCard from "./AlgorithmCard";
import { Algorithm } from "./utils/algorithmManager";
import { assetsPath, jsonUrl } from "./utils/locationUtils";

function flattenAndShuffle(algsData) {
  const allCases = [];
  algsData.forEach(set => {
    set.subsets.forEach((subset, i) => {
      subset.forEach((caseObj, j) => {
        allCases.push({
          setName: set.setName,
          i,
          j,
          algStr: caseObj.case
        });
      });
    });
  });
  for (let k = allCases.length - 1; k > 0; k--) {
    const l = Math.floor(Math.random() * (k + 1));
    [allCases[k], allCases[l]] = [allCases[l], allCases[k]];
  }
  return allCases;
}

function getCardInfo(algsData, setName, i, j) {
  if (!algsData) return null;
  const set = algsData.find(block => block.setName === setName);
  if (!set) return null;
  const subset = set.subsets[i];
  if (!subset) return null;
  const caseObj = subset[j];
  if (!caseObj) return null;
  const algStr = caseObj.case;
  const solutionAlg = Algorithm.from(algStr).toString();
  const setupAlg = Algorithm.from(algStr).inverse().toString();
  const filename = `${setName}[${i}][${j}]=${algStr}.png`;
  const setupImg = `${assetsPath}/first_face_case_png/${filename}`;
  const solutionImg = `${assetsPath}/first_face_algs_png/${filename}`;
  return { setupAlg, solutionAlg, setupImg, solutionImg };
}

function FirstFaceTrainer() {
  const [algsData, setAlgsData] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [trail, setTrail] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [animating, setAnimating] = useState(false);
  const [popIn, setPopIn] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastSwipeDir = useRef(null);

  useEffect(() => {
    fetch(jsonUrl)
      .then(res => res.json())
      .then(data => {
        setAlgsData(data);
        setQueue(flattenAndShuffle(data));
        setCurrentIdx(0);
        setPopIn(true);
        setTimeout(() => setPopIn(false), 400);
      });
  }, []);

  const directionColors = ['skyblue', 'limegreen', 'gold', 'red'];

  function startDrag(clientX, clientY) {
    if (animating) return;
    dragStart.current = { x: clientX, y: clientY };
    setDragging(true);
    lastSwipeDir.current = null;
  }

  function duringDrag(clientX, clientY) {
    if (!dragging || animating) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    setOffset({ x: dx, y: dy });
    let dir = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 80) dir = 1;
      if (dx < -80) dir = 3;
    } else {
      if (dy > 80) dir = 2;
      if (dy < -80) dir = 0;
    }
    lastSwipeDir.current = dir;
    if (dir !== null) {
      setTrail({ dir, color: directionColors[dir] });
    } else {
      setTrail(null);
    }
  }

  function animateAndAdvance(dir, animateTo) {
    if (animating || !queue.length) return;
    setAnimating(true);
    setOffset(animateTo);
    setTrail({ dir, color: directionColors[dir] });
    setTimeout(() => {
      setAnimating(false);
      setTrail(null);
      setOffset({ x: 0, y: 0 });
      setCurrentIdx(idx => {
        setPopIn(true);
        setTimeout(() => setPopIn(false), 400);
        return (idx + 1) % queue.length;
      });
    }, 340);
  }

  function endDrag() {
    if (!dragging || animating) return;
    setDragging(false);
    const dir = lastSwipeDir.current;
    let animateTo = { x: 0, y: 0 };
    if (dir !== null) {
      switch (dir) {
        case 0: animateTo = { x: 0, y: -window.innerHeight }; break;
        case 1: animateTo = { x: window.innerWidth, y: 0 }; break;
        case 2: animateTo = { x: 0, y: window.innerHeight }; break;
        case 3: animateTo = { x: -window.innerWidth, y: 0 }; break;
        default: animateTo = { x: 0, y: 0 };
      }
      animateAndAdvance(dir, animateTo);
    } else {
      setOffset({ x: 0, y: 0 });
      setTrail(null);
    }
    lastSwipeDir.current = null;
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (animating || dragging) return;
      let dir = null;
      let animateTo = { x: 0, y: 0 };
      if (e.key === "ArrowUp") { dir = 0; animateTo = { x: 0, y: -window.innerHeight }; }
      if (e.key === "ArrowRight") { dir = 1; animateTo = { x: window.innerWidth, y: 0 }; }
      if (e.key === "ArrowDown") { dir = 2; animateTo = { x: 0, y: window.innerHeight }; }
      if (e.key === "ArrowLeft") { dir = 3; animateTo = { x: -window.innerWidth, y: 0 }; }
      if (dir !== null) {
        animateAndAdvance(dir, animateTo);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [animating, dragging, queue.length]);

  function onMouseDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }
  function onMouseMove(e) {
    duringDrag(e.clientX, e.clientY);
  }
  function onMouseUp(e) {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    endDrag();
  }
  function onTouchStart(e) {
    if (e.touches.length > 1) return;
    e.preventDefault();
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }
  function onTouchMove(e) {
    if (e.touches.length > 1) return;
    e.preventDefault();
    const t = e.touches[0];
    duringDrag(t.clientX, t.clientY);
  }
  function onTouchEnd(e) {
    e.preventDefault();
    endDrag();
  }

  let cardInfo = null;
  let cardKey = "";
  if (queue.length && algsData) {
    const entry = queue[currentIdx];
    cardInfo = getCardInfo(algsData, entry.setName, entry.i, entry.j);
    cardKey = `${entry.setName}-${entry.i}-${entry.j}`;
  }

  return (
    <div
      style={{ position: 'relative', minHeight: '100vh', background: "#f3f7fa" }}
      onDragStart={e => e.preventDefault()}
    >
      <h1 style={{ textAlign: "center", color: "#324b74" }}>2x2 Algorithm Visualization</h1>
      {trail && (
        <div
          className="swipe-trail"
          style={{
            background: trail.color,
            opacity: 0.6,
            position: "fixed",
            left: 0, top: 0, width: "100vw", height: "100vh",
            pointerEvents: "none",
            zIndex: 9999,
            transition: "opacity 0.28s"
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh"
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDragStart={e => e.preventDefault()}
      >
        {cardInfo && (
          <div
            className={popIn ? "scale-in" : ""}
            style={{
              transition: dragging ? "none" : "transform 0.3s cubic-bezier(.96,-0.01,.43,1.14)",
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              touchAction: "none",
              userSelect: "none"
            }}
            onDragStart={e => e.preventDefault()}
          >
            <AlgorithmCard
              key={cardKey}
              setupAlg={cardInfo.setupAlg}
              solutionAlg={cardInfo.solutionAlg}
              setupImg={cardInfo.setupImg}
              solutionImg={cardInfo.solutionImg}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FirstFaceTrainer;
