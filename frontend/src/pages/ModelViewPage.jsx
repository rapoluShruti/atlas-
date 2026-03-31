import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../config/api";
import "../styles/modelview.css";

const POSE_MODEL_MAP = {
  "T-Pose": "t-pose.glb",
  "Plank": "t-pose.glb",
  "Warrior 2": "t-pose.glb",
};

function ModelViewer({ poseName }) {
  return (
    <div className="model-placeholder">
      <div className="pose-icon">{poseName === "T-Pose" ? "🧍" : poseName === "Plank" ? "🏃" : "🧘"}</div>
      <p>3D Model: {poseName}</p>
      <small>Model loading...</small>
    </div>
  );
}

const ModelViewPage = () => {
  const { poseName, sessionId, poseIndex } = useParams();
  const navigate = useNavigate();
  const [timer, setTimer] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef();

  // Fallback logic
  const modelFile = POSE_MODEL_MAP[poseName] || "model2.glb";
  const modelPath = `/assets/models/${modelFile}`;

  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      // Auto next pose
      // TODO: trigger next pose logic (handled in parent/session)
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timer]);

  return (
    <div className="modelview-bg">
      <div className="modelview-center">
        <div className="modelview-canvas">
          <ModelViewer poseName={poseName} />
        </div>
        <div className="modelview-info">
          <h1 className="modelview-pose">{poseName}</h1>
          <div className="modelview-timer">{timer}s</div>
          <div className="modelview-controls">
            <button onClick={() => setIsRunning(true)} disabled={isRunning}>Start</button>
            <button onClick={() => setIsRunning(false)} disabled={!isRunning}>Pause</button>
            <button onClick={() => navigate(-1)}>Stop</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelViewPage;
