import { useEffect, useRef, useState } from 'react';

const normalizePoseName = (poseName) => {
  const normalized = (poseName || "").trim().toLowerCase();

  if (normalized === "tree pose" || normalized === "tree") {
    return "Tree Pose";
  }

  if (
    normalized === "warrior ii pose" ||
    normalized === "warrior 2" ||
    normalized === "warrior ii"
  ) {
    return "Warrior II Pose";
  }

  return "T Pose";
};

const YogaTrainer = ({ initialPose = "T Pose" }) => {
  const inputVideoRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const referenceCanvasRef = useRef(null);
  const poseModelRef = useRef(null);
  const feedbackRef = useRef(null);
  const guideTipsRef = useRef(null);
  const targetPoseSelectRef = useRef(null);
  const modeOffBtnRef = useRef(null);
  const modeOnBtnRef = useRef(null);
  const startGuideBtnRef = useRef(null);
  const uploadInputRef = useRef(null);
  const analyzeUploadBtnRef = useRef(null);
  const uploadStatusRef = useRef(null);
  const uploadedVideoRef = useRef(null);

  const [state, setState] = useState({
    mode: "off",
    cameraRunning: false,
    selectedPose: normalizePoseName(initialPose),
    camera: null,
    lastEval: null,
    uploadLoopId: null,
    uploadVideoActive: false,
    uploadObjectUrl: null,
  });

  const IDX = {
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
  };

  const REFERENCE_POSES = {
    "T Pose": {
      points: {
        shoulderL: [0.35, 0.35],
        shoulderR: [0.65, 0.35],
        elbowL: [0.22, 0.35],
        elbowR: [0.78, 0.35],
        wristL: [0.1, 0.35],
        wristR: [0.9, 0.35],
        hipL: [0.43, 0.58],
        hipR: [0.57, 0.58],
        kneeL: [0.43, 0.76],
        kneeR: [0.57, 0.76],
        ankleL: [0.43, 0.92],
        ankleR: [0.57, 0.92],
        head: [0.5, 0.2],
      },
      tips: [
        "Keep both arms parallel to the ground.",
        "Straighten both knees and lengthen the spine.",
        "Open the chest and avoid shoulder shrugging.",
      ],
    },
    "Warrior II Pose": {
      points: {
        shoulderL: [0.33, 0.36],
        shoulderR: [0.63, 0.36],
        elbowL: [0.2, 0.36],
        elbowR: [0.76, 0.36],
        wristL: [0.09, 0.36],
        wristR: [0.9, 0.36],
        hipL: [0.41, 0.58],
        hipR: [0.55, 0.58],
        kneeL: [0.3, 0.76],
        kneeR: [0.62, 0.76],
        ankleL: [0.24, 0.92],
        ankleR: [0.62, 0.92],
        head: [0.48, 0.2],
      },
      tips: [
        "Keep arms long and level with shoulders.",
        "Front knee should bend to around 90-110 degrees.",
        "Back leg stays strong and straight.",
      ],
    },
    "Tree Pose": {
      points: {
        shoulderL: [0.42, 0.34],
        shoulderR: [0.58, 0.34],
        elbowL: [0.44, 0.2],
        elbowR: [0.56, 0.2],
        wristL: [0.48, 0.08],
        wristR: [0.52, 0.08],
        hipL: [0.44, 0.56],
        hipR: [0.56, 0.56],
        kneeL: [0.44, 0.75],
        kneeR: [0.5, 0.7],
        ankleL: [0.44, 0.92],
        ankleR: [0.42, 0.57],
        head: [0.5, 0.2],
      },
      tips: [
        "Stand tall on one leg and engage your core.",
        "Place the lifted foot on inner calf or thigh, not on the knee.",
        "Bring hands overhead and keep the torso centered.",
      ],
    },
  };

  const POSE_RULES = {
    "T Pose": [
      { id: "left_elbow", target: 180, tolerance: 18, messageLow: "Straighten your left elbow.", messageHigh: "Relax your left elbow slightly." },
      { id: "right_elbow", target: 180, tolerance: 18, messageLow: "Straighten your right elbow.", messageHigh: "Relax your right elbow slightly." },
      { id: "left_shoulder", target: 90, tolerance: 18, messageLow: "Raise your left arm to shoulder level.", messageHigh: "Lower your left arm a little." },
      { id: "right_shoulder", target: 90, tolerance: 18, messageLow: "Raise your right arm to shoulder level.", messageHigh: "Lower your right arm a little." },
      { id: "left_knee", target: 180, tolerance: 15, messageLow: "Straighten your left knee.", messageHigh: "Do not hyperextend your left knee." },
      { id: "right_knee", target: 180, tolerance: 15, messageLow: "Straighten your right knee.", messageHigh: "Do not hyperextend your right knee." },
    ],
    "Warrior II Pose": [
      { id: "left_elbow", target: 180, tolerance: 20, messageLow: "Lengthen your left arm.", messageHigh: "Soften your left elbow slightly." },
      { id: "right_elbow", target: 180, tolerance: 20, messageLow: "Lengthen your right arm.", messageHigh: "Soften your right elbow slightly." },
      { id: "left_shoulder", target: 90, tolerance: 20, messageLow: "Lift your left arm to shoulder height.", messageHigh: "Drop your left arm a little." },
      { id: "right_shoulder", target: 90, tolerance: 20, messageLow: "Lift your right arm to shoulder height.", messageHigh: "Drop your right arm a little." },
    ],
    "Tree Pose": [
      { id: "left_knee", target: 180, tolerance: 18, messageLow: "Press down and straighten your standing leg.", messageHigh: "Keep your standing leg stable." },
      { id: "right_knee", target: 40, tolerance: 18, messageLow: "Open your lifted knee outward.", messageHigh: "Do not over-compress the lifted knee." },
      { id: "left_elbow", target: 160, tolerance: 30, messageLow: "Reach your hands upward.", messageHigh: "Keep your arms soft and aligned." },
      { id: "right_elbow", target: 160, tolerance: 30, messageLow: "Reach your hands upward.", messageHigh: "Keep your arms soft and aligned." },
    ],
  };

  const CONNECTIONS = [
    ["head", "shoulderL"],
    ["head", "shoulderR"],
    ["shoulderL", "elbowL"],
    ["elbowL", "wristL"],
    ["shoulderR", "elbowR"],
    ["elbowR", "wristR"],
    ["shoulderL", "hipL"],
    ["shoulderR", "hipR"],
    ["hipL", "hipR"],
    ["hipL", "kneeL"],
    ["kneeL", "ankleL"],
    ["hipR", "kneeR"],
    ["kneeR", "ankleR"],
  ];

  const POSE_3D_MODELS = {
    "T Pose": "/assets/models/t-pose.glb",
  };

  let poseEstimator;
  const modelExistsCache = new Map();
  let guideRenderVersion = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const normalizePoseSlug = (poseName) => poseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const modelFileExists = async (modelPath) => {
    if (modelExistsCache.has(modelPath)) return modelExistsCache.get(modelPath);
    try {
      const response = await fetch(modelPath, { method: "HEAD", cache: "no-store" });
      const exists = response.ok;
      modelExistsCache.set(modelPath, exists);
      return exists;
    } catch {
      return false;
    }
  };

  const resolveModelPath = async (poseName) => {
    const slug = normalizePoseSlug(poseName);
    const candidates = [];
    if (POSE_3D_MODELS[poseName]) candidates.push(POSE_3D_MODELS[poseName]);
    if (slug) {
      candidates.push(`/assets/models/${slug}.glb`);
      if (slug.endsWith("-pose")) candidates.push(`/assets/models/${slug.replace(/-pose$/, "")}.glb`);
    }
    for (const candidate of candidates) {
      if (await modelFileExists(candidate)) return candidate;
    }
    return null;
  };

  const safeAngle = (a, b, c) => {
    if (!a || !b || !c) return null;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let degrees = Math.abs((radians * 180) / Math.PI);
    if (degrees > 180) degrees = 360 - degrees;
    return degrees;
  };

  const jointMetrics = (landmarks) => {
    const L = landmarks;
    return {
      left_elbow: safeAngle(L[IDX.LEFT_SHOULDER], L[IDX.LEFT_ELBOW], L[IDX.LEFT_WRIST]),
      right_elbow: safeAngle(L[IDX.RIGHT_SHOULDER], L[IDX.RIGHT_ELBOW], L[IDX.RIGHT_WRIST]),
      left_shoulder: safeAngle(L[IDX.LEFT_ELBOW], L[IDX.LEFT_SHOULDER], L[IDX.LEFT_HIP]),
      right_shoulder: safeAngle(L[IDX.RIGHT_ELBOW], L[IDX.RIGHT_SHOULDER], L[IDX.RIGHT_HIP]),
      left_knee: safeAngle(L[IDX.LEFT_HIP], L[IDX.LEFT_KNEE], L[IDX.LEFT_ANKLE]),
      right_knee: safeAngle(L[IDX.RIGHT_HIP], L[IDX.RIGHT_KNEE], L[IDX.RIGHT_ANKLE]),
    };
  };

  const inferPose = (metrics) => {
    if (!metrics.left_elbow || !metrics.right_elbow || !metrics.left_knee || !metrics.right_knee) return "Unknown Pose";
    const elbowsStraight = metrics.left_elbow > 160 && metrics.right_elbow > 160;
    const shouldersLevel = metrics.left_shoulder > 70 && metrics.left_shoulder < 120 && metrics.right_shoulder > 70 && metrics.right_shoulder < 120;
    const leftStraight = metrics.left_knee > 160;
    const rightStraight = metrics.right_knee > 160;
    const leftBent = metrics.left_knee > 80 && metrics.left_knee < 125;
    const rightBent = metrics.right_knee > 80 && metrics.right_knee < 125;
    if (elbowsStraight && shouldersLevel && ((leftBent && rightStraight) || (rightBent && leftStraight))) return "Warrior II Pose";
    if (elbowsStraight && shouldersLevel && leftStraight && rightStraight) return "T Pose";
    const treeA = leftStraight && metrics.right_knee > 20 && metrics.right_knee < 70;
    const treeB = rightStraight && metrics.left_knee > 20 && metrics.left_knee < 70;
    if (treeA || treeB) return "Tree Pose";
    return "Unknown Pose";
  };

  const evaluateAgainstTarget = (landmarks, poseName) => {
    const metrics = jointMetrics(landmarks);
    const inferred = inferPose(metrics);
    const rules = POSE_RULES[poseName] || [];
    let totalDelta = 0;
    let checks = 0;
    const corrections = [];
    rules.forEach((rule) => {
      const value = metrics[rule.id];
      if (value == null) return;
      checks += 1;
      const delta = value - rule.target;
      const absDelta = Math.abs(delta);
      totalDelta += absDelta;
      if (absDelta > rule.tolerance) {
        if (delta < 0) corrections.push(rule.messageLow);
        else corrections.push(rule.messageHigh);
      }
    });
    const avgDelta = checks > 0 ? totalDelta / checks : 90;
    const score = clamp(Math.round(100 - avgDelta * 1.2), 0, 100);
    return { score, inferred, corrections: [...new Set(corrections)].slice(0, 4), metrics };
  };

  const drawSkeletonGuide = (points) => {
    const canvas = referenceCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#f5fbf5");
    grad.addColorStop(1, "#efe9df");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1c5f4b";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    CONNECTIONS.forEach(([a, b]) => {
      const [ax, ay] = points[a];
      const [bx, by] = points[b];
      ctx.beginPath();
      ctx.moveTo(ax * canvas.width, ay * canvas.height);
      ctx.lineTo(bx * canvas.width, by * canvas.height);
      ctx.stroke();
    });
    Object.values(points).forEach(([x, y]) => {
      ctx.beginPath();
      ctx.fillStyle = "#d14a2c";
      ctx.arc(x * canvas.width, y * canvas.height, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawReferencePose = async (renderTips = true) => {
    const poseName = state.selectedPose;
    const poseData = REFERENCE_POSES[poseName] || REFERENCE_POSES["T Pose"];
    const points = poseData.points;
    const currentRender = ++guideRenderVersion;
    const modelPath = await resolveModelPath(poseName);
    if (currentRender !== guideRenderVersion) return;
    if (poseModelRef.current && modelPath) {
      poseModelRef.current.style.display = "block";
      referenceCanvasRef.current.style.display = "none";
      poseModelRef.current.src = modelPath;
    } else {
      if (poseModelRef.current) poseModelRef.current.style.display = "none";
      referenceCanvasRef.current.style.display = "block";
      drawSkeletonGuide(points);
    }
    if (renderTips && guideTipsRef.current) {
      guideTipsRef.current.innerHTML = `<strong>${poseName} cues:</strong><ul>${poseData.tips.map((tip) => `<li>${tip}</li>`).join("")}</ul>`;
    }
  };

  const renderFeedback = (evalResult) => {
    if (!feedbackRef.current) return;
    const scoreClass = evalResult.score >= 85 ? "ok" : evalResult.score >= 60 ? "warn" : "bad";
    const isCorrect = evalResult.score >= 80;
    const correctionHtml = evalResult.corrections.length > 0 ? `<ul>${evalResult.corrections.map((item) => `<li>${item}</li>`).join("")}</ul>` : "<p>No major correction needed. Hold the pose and breathe.</p>";
    feedbackRef.current.innerHTML = `<p><span class="score ${scoreClass}">Score: ${evalResult.score}%</span> | Detected: ${evalResult.inferred}</p><p>${isCorrect ? "Pose is correct for selected target." : "Adjust your posture using the hints below."}</p>${correctionHtml}`;
  };

  const setMode = (mode) => {
    setState(prev => ({ ...prev, mode }));
    const on = mode === "on";
    if (modeOffBtnRef.current) modeOffBtnRef.current.classList.toggle("active", !on);
    if (modeOnBtnRef.current) modeOnBtnRef.current.classList.toggle("active", on);
    if (on) {
      stopUploadProcessing();
      startCamera();
    } else {
      stopCamera();
      if (feedbackRef.current) feedbackRef.current.textContent = "Camera OFF mode active. Use guided cues and reference pose to practice.";
      const ctx = outputCanvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, outputCanvasRef.current.width, outputCanvasRef.current.height);
        const grad = ctx.createLinearGradient(0, 0, outputCanvasRef.current.width, outputCanvasRef.current.height);
        grad.addColorStop(0, "#f3f8f5");
        grad.addColorStop(1, "#ece6de");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, outputCanvasRef.current.width, outputCanvasRef.current.height);
        ctx.fillStyle = "#3f5a4f";
        ctx.font = "600 22px Space Grotesk";
        ctx.fillText("Camera OFF - Guided Practice", 40, 60);
      }
    }
  };

  const startCamera = async () => {
    if (state.cameraRunning) return;
    if (!poseEstimator) initPoseEstimator();
    try {
      const camera = new window.Camera(inputVideoRef.current, {
        onFrame: async () => {
          if (poseEstimator) await poseEstimator.send({ image: inputVideoRef.current });
        },
        width: 640,
        height: 420,
      });
      await camera.start();
      setState(prev => ({ ...prev, cameraRunning: true, camera }));
      if (feedbackRef.current) feedbackRef.current.textContent = "Camera ON. Align your full body in frame for best correction.";
    } catch (error) {
      if (feedbackRef.current) feedbackRef.current.innerHTML = `Camera access failed: ${error.message}. Use localhost and allow webcam permission.`;
      setMode("off");
    }
  };

  const stopCamera = () => {
    if (!state.cameraRunning) return;
    if (state.camera && typeof state.camera.stop === "function") state.camera.stop();
    const stream = inputVideoRef.current?.srcObject;
    if (stream && typeof stream.getTracks === "function") stream.getTracks().forEach((track) => track.stop());
    if (inputVideoRef.current) inputVideoRef.current.srcObject = null;
    setState(prev => ({ ...prev, cameraRunning: false }));
  };

  const stopUploadProcessing = () => {
    setState(prev => ({ ...prev, uploadVideoActive: false }));
    if (state.uploadLoopId) cancelAnimationFrame(state.uploadLoopId);
    if (uploadedVideoRef.current) {
      uploadedVideoRef.current.pause();
      uploadedVideoRef.current.removeAttribute("src");
      uploadedVideoRef.current.load();
    }
    if (state.uploadObjectUrl) {
      URL.revokeObjectURL(state.uploadObjectUrl);
      setState(prev => ({ ...prev, uploadObjectUrl: null }));
    }
  };

  const loadImageFromFile = (file) => new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => { URL.revokeObjectURL(objectUrl); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Unable to read the selected image.")); };
    image.src = objectUrl;
  });

  const analyzeImageUpload = async (file) => {
    if (!poseEstimator) initPoseEstimator();
    const image = await loadImageFromFile(file);
    await poseEstimator.send({ image });
    if (uploadStatusRef.current) uploadStatusRef.current.textContent = `Analyzed image: ${file.name}`;
  };

  const analyzeVideoUpload = async (file) => {
    if (!poseEstimator) initPoseEstimator();
    if (state.uploadObjectUrl) URL.revokeObjectURL(state.uploadObjectUrl);
    const objectUrl = URL.createObjectURL(file);
    setState(prev => ({ ...prev, uploadObjectUrl: objectUrl }));
    if (uploadedVideoRef.current) {
      uploadedVideoRef.current.src = objectUrl;
      uploadedVideoRef.current.currentTime = 0;
      await uploadedVideoRef.current.play();
      setState(prev => ({ ...prev, uploadVideoActive: true }));
      if (uploadStatusRef.current) uploadStatusRef.current.textContent = `Analyzing video: ${file.name}`;
      const runFrame = async () => {
        if (!state.uploadVideoActive) return;
        if (uploadedVideoRef.current.ended) {
          setState(prev => ({ ...prev, uploadVideoActive: false }));
          if (uploadStatusRef.current) uploadStatusRef.current.textContent = `Finished video analysis: ${file.name}`;
          return;
        }
        if (uploadedVideoRef.current.readyState >= 2) await poseEstimator.send({ image: uploadedVideoRef.current });
        const id = requestAnimationFrame(() => runFrame().catch((error) => {
          if (uploadStatusRef.current) uploadStatusRef.current.textContent = `Video processing error: ${error.message}`;
        }));
        setState(prev => ({ ...prev, uploadLoopId: id }));
      };
      await runFrame();
    }
  };

  const handleUploadAnalysis = () => {
    const file = uploadInputRef.current?.files && uploadInputRef.current.files[0];
    if (!file) {
      if (uploadStatusRef.current) uploadStatusRef.current.textContent = "Please choose an image or video first.";
      return;
    }
    if (state.mode === "on") setMode("off");
    stopUploadProcessing();
    if (uploadStatusRef.current) uploadStatusRef.current.textContent = `Preparing: ${file.name}`;
    try {
      if (file.type.startsWith("image/")) analyzeImageUpload(file);
      else if (file.type.startsWith("video/")) analyzeVideoUpload(file);
      else if (uploadStatusRef.current) uploadStatusRef.current.textContent = "Unsupported file type. Use an image or video file.";
    } catch (error) {
      if (uploadStatusRef.current) uploadStatusRef.current.textContent = `Upload analysis failed: ${error.message}`;
    }
  };

  const initPoseEstimator = () => {
    poseEstimator = new window.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });
    poseEstimator.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.55,
      minTrackingConfidence: 0.55,
    });
    poseEstimator.onResults((results) => {
      const ctx = outputCanvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.save();
      ctx.clearRect(0, 0, outputCanvasRef.current.width, outputCanvasRef.current.height);
      if (results.image) ctx.drawImage(results.image, 0, 0, outputCanvasRef.current.width, outputCanvasRef.current.height);
      if (results.poseLandmarks) {
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: "#27ae60", lineWidth: 4 });
        window.drawLandmarks(ctx, results.poseLandmarks, { color: "#d14a2c", lineWidth: 1, radius: 4 });
        const evalResult = evaluateAgainstTarget(results.poseLandmarks, state.selectedPose);
        setState(prev => ({ ...prev, lastEval: evalResult }));
        renderFeedback(evalResult);
      } else {
        if (feedbackRef.current) feedbackRef.current.textContent = "No pose detected. Step back and keep full body visible.";
      }
      ctx.restore();
    });
  };

  const runGuidedSession = () => {
    const pose = REFERENCE_POSES[state.selectedPose];
    if (pose && guideTipsRef.current) {
      guideTipsRef.current.innerHTML = `<strong>${state.selectedPose} Tips:</strong><br>${pose.tips.map(tip => `• ${tip}`).join('<br>')}`;
    } else if (guideTipsRef.current) {
      guideTipsRef.current.innerHTML = "Select a pose to see tips.";
    }
  };

  useEffect(() => {
    const normalizedPose = normalizePoseName(initialPose);

    setState((prev) => (
      prev.selectedPose === normalizedPose
        ? prev
        : { ...prev, selectedPose: normalizedPose }
    ));
  }, [initialPose]);

  useEffect(() => {
    drawReferencePose();
  }, [state.selectedPose]);

  useEffect(() => {
    const loadScripts = async () => {
      if (!window.Camera) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      if (!window.Pose) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      if (!window.drawConnectors || !window.drawLandmarks) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
    };
    loadScripts().then(() => {
      drawReferencePose();
      setMode("off");
    });
    return () => {
      stopCamera();
      stopUploadProcessing();
    };
  }, []);

  const handlePoseChange = (event) => {
    const newPose = event.target.value;
    setState(prev => ({ ...prev, selectedPose: newPose }));
    if (state.lastEval && state.mode === "on") renderFeedback(state.lastEval);
  };

  const handleUploadChange = () => {
    const file = uploadInputRef.current?.files && uploadInputRef.current.files[0];
    if (file && uploadStatusRef.current) uploadStatusRef.current.textContent = `Selected file: ${file.name}`;
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-1)',
      padding: '20px',
      borderRadius: '22px',
      border: '1px solid var(--line)',
      backdropFilter: 'blur(6px)',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <style>{`
        :root {
          --bg-1: #f4efe6;
          --bg-2: #dbe8da;
          --card: rgba(255, 255, 255, 0.78);
          --text: #132a22;
          --muted: #3f5a4f;
          --accent: #d14a2c;
          --accent-soft: #ffe3d7;
          --line: rgba(19, 42, 34, 0.14);
          --ok: #1f9a5f;
          --warn: #c58109;
          --bad: #b23b2b;
        }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; font-family: "Space Grotesk", "Segoe UI", sans-serif; color: var(--text); background: radial-gradient(circle at 10% 20%, #fff8ef 0%, transparent 35%), radial-gradient(circle at 90% 10%, #e2f4e2 0%, transparent 28%), linear-gradient(140deg, var(--bg-1), var(--bg-2)); overflow-x: hidden; }
        .grain { position: fixed; inset: 0; pointer-events: none; opacity: 0.08; background-image: radial-gradient(#12251f 0.6px, transparent 0.6px); background-size: 3px 3px; }
        .trainer-top { display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
        .mode-toggle { display: inline-flex; padding: 3px; border-radius: 999px; border: 1px solid var(--line); background: rgba(255, 255, 255, 0.75); }
        .mode-btn { background: transparent; color: var(--muted); border: none; border-radius: 999px; padding: 8px 14px; font-weight: 700; cursor: pointer; }
        .mode-btn.active { background: linear-gradient(130deg, #185a47, #2f8c69); color: #fff; }
        .controls-row { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px; align-items: end; }
        .controls-row label { min-width: 220px; }
        .upload-field input { padding: 8px; background: rgba(255, 255, 255, 0.92); }
        .split-screen { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .panel { border: 1px solid var(--line); border-radius: 14px; padding: 12px; background: rgba(255, 255, 255, 0.7); }
        canvas, model-viewer { width: 100%; border-radius: 12px; border: 1px solid rgba(19, 42, 34, 0.2); background: linear-gradient(145deg, #f8fff9, #f1efe9); }
        canvas { display: block; height: auto; }
        model-viewer { display: block; height: 420px; }
        .video-wrap { position: relative; overflow: hidden; min-height: 260px; }
        #inputVideo, #uploadedVideo { display: none; }
        #outputCanvas { width: 100%; height: auto; }
        .panel-text { margin-top: 10px; line-height: 1.45; color: var(--muted); min-height: 54px; }
        .upload-status { margin-top: 8px; color: var(--muted); font-size: 0.9rem; }
        .score { font-weight: 700; }
        .score.ok { color: var(--ok); }
        .score.warn { color: var(--warn); }
        .score.bad { color: var(--bad); }
        ul { margin: 8px 0 0; padding-left: 20px; }
        @media (max-width: 980px) { .split-screen { grid-template-columns: 1fr; } }
        @keyframes reveal { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        button { cursor: pointer; background: linear-gradient(130deg, var(--accent), #dd7f2a); color: #fff; font-weight: 700; border: none; transition: transform 180ms ease, filter 180ms ease; }
        button:hover { transform: translateY(-1px); filter: brightness(1.06); }
        select, input, button { font-family: inherit; font-size: 0.95rem; border-radius: 12px; border: 1px solid var(--line); padding: 11px 12px; }
        label { display: grid; gap: 6px; font-weight: 600; font-size: 0.95rem; }
      `}</style>
      <div className="trainer-top">
        <h2>Smart Yoga Trainer</h2>
        <div className="mode-toggle">
          <button ref={modeOffBtnRef} className="mode-btn active" onClick={() => setMode("off")}>Camera OFF</button>
          <button ref={modeOnBtnRef} className="mode-btn" onClick={() => setMode("on")}>Camera ON</button>
        </div>
      </div>
      <div className="controls-row">
        <label>
          Target Pose
          <select ref={targetPoseSelectRef} value={state.selectedPose} onChange={handlePoseChange}>
            <option value="T Pose">T Pose</option>
            <option value="Tree Pose">Tree Pose</option>
            <option value="Warrior II Pose">Warrior II Pose</option>
          </select>
        </label>
        <label className="upload-field">
          Upload Image or Video
          <input ref={uploadInputRef} type="file" accept="image/*,video/*" onChange={handleUploadChange} />
        </label>
        <button ref={startGuideBtnRef} onClick={runGuidedSession}>Start Guided Session</button>
        <button ref={analyzeUploadBtnRef} onClick={handleUploadAnalysis}>Analyze Upload</button>
      </div>
      <div className="split-screen">
        <section className="panel reference-panel">
          <h3>Target Pose (Guide)</h3>
          <canvas ref={referenceCanvasRef} width="640" height="420"></canvas>
          <model-viewer ref={poseModelRef} src="/assets/models/t-pose.glb" camera-controls auto-rotate shadow-intensity="1" exposure="1" camera-orbit="0deg 75deg 2.1m"></model-viewer>
          <div ref={guideTipsRef} className="panel-text"></div>
        </section>
        <section className="panel camera-panel">
          <h3>Your Pose (Live)</h3>
          <div className="video-wrap">
            <video ref={inputVideoRef} playsInline></video>
            <video ref={uploadedVideoRef} playsInline muted></video>
            <canvas ref={outputCanvasRef} width="640" height="420"></canvas>
          </div>
          <div ref={feedbackRef} className="panel-text">Switch to Camera ON for live posture detection, or upload an image/video for analysis.</div>
          <div ref={uploadStatusRef} className="upload-status">No upload yet.</div>
        </section>
      </div>
    </div>
  );
};

export default YogaTrainer;
