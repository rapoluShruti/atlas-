const state = {
  mode: "off",
  cameraRunning: false,
  selectedPose: "T Pose",
  camera: null,
  lastEval: null,
  uploadLoopId: null,
  uploadVideoActive: false,
  uploadObjectUrl: null,
};

const inputVideo = document.getElementById("inputVideo");
const outputCanvas = document.getElementById("outputCanvas");
const outputCtx = outputCanvas.getContext("2d");
const referenceCanvas = document.getElementById("referenceCanvas");
const refCtx = referenceCanvas.getContext("2d");
const poseModel = document.getElementById("poseModel");
const feedback = document.getElementById("feedback");
const guideTips = document.getElementById("guideTips");
const targetPoseSelect = document.getElementById("targetPose");
const modeOffBtn = document.getElementById("modeOff");
const modeOnBtn = document.getElementById("modeOn");
const startGuideBtn = document.getElementById("startGuide");
const uploadInput = document.getElementById("uploadInput");
const analyzeUploadBtn = document.getElementById("analyzeUpload");
const uploadStatus = document.getElementById("uploadStatus");
const uploadedVideo = document.getElementById("uploadedVideo");

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
  "T Pose": "assets/models/t-pose.glb",
};

let poseEstimator;
const modelExistsCache = new Map();
let guideRenderVersion = 0;

function populatePoseSelect() {
  targetPoseSelect.innerHTML = '';
  Object.keys(REFERENCE_POSES).forEach(pose => {
    const option = document.createElement('option');
    option.value = pose;
    option.textContent = pose;
    targetPoseSelect.appendChild(option);
  });
  targetPoseSelect.value = state.selectedPose;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizePoseSlug(poseName) {
  return poseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function modelFileExists(modelPath) {
  if (modelExistsCache.has(modelPath)) {
    return modelExistsCache.get(modelPath);
  }

  let exists = false;
  try {
    const response = await fetch(modelPath, { method: "HEAD", cache: "no-store" });
    exists = response.ok;
  } catch (error) {
    exists = false;
  }

  modelExistsCache.set(modelPath, exists);
  return exists;
}

async function resolveModelPath(poseName) {
  const slug = normalizePoseSlug(poseName);
  const candidates = [];

  if (POSE_3D_MODELS[poseName]) {
    candidates.push(POSE_3D_MODELS[poseName]);
  }

  if (slug) {
    candidates.push(`assets/models/${slug}.glb`);

    if (slug.endsWith("-pose")) {
      candidates.push(`assets/models/${slug.replace(/-pose$/, "")}.glb`);
    }
  }

  const uniqueCandidates = [...new Set(candidates)];
  for (const candidate of uniqueCandidates) {
    if (await modelFileExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

function safeAngle(a, b, c) {
  if (!a || !b || !c) {
    return null;
  }

  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let degrees = Math.abs((radians * 180) / Math.PI);

  if (degrees > 180) {
    degrees = 360 - degrees;
  }

  return degrees;
}

function jointMetrics(landmarks) {
  const L = landmarks;
  const metric = {
    left_elbow: safeAngle(L[IDX.LEFT_SHOULDER], L[IDX.LEFT_ELBOW], L[IDX.LEFT_WRIST]),
    right_elbow: safeAngle(L[IDX.RIGHT_SHOULDER], L[IDX.RIGHT_ELBOW], L[IDX.RIGHT_WRIST]),
    left_shoulder: safeAngle(L[IDX.LEFT_ELBOW], L[IDX.LEFT_SHOULDER], L[IDX.LEFT_HIP]),
    right_shoulder: safeAngle(L[IDX.RIGHT_ELBOW], L[IDX.RIGHT_SHOULDER], L[IDX.RIGHT_HIP]),
    left_knee: safeAngle(L[IDX.LEFT_HIP], L[IDX.LEFT_KNEE], L[IDX.LEFT_ANKLE]),
    right_knee: safeAngle(L[IDX.RIGHT_HIP], L[IDX.RIGHT_KNEE], L[IDX.RIGHT_ANKLE]),
  };

  return metric;
}

function inferPose(metrics) {
  if (!metrics.left_elbow || !metrics.right_elbow || !metrics.left_knee || !metrics.right_knee) {
    return "Unknown Pose";
  }

  const elbowsStraight = metrics.left_elbow > 160 && metrics.right_elbow > 160;
  const shouldersLevel = metrics.left_shoulder > 70 && metrics.left_shoulder < 120
    && metrics.right_shoulder > 70 && metrics.right_shoulder < 120;

  const leftStraight = metrics.left_knee > 160;
  const rightStraight = metrics.right_knee > 160;
  const leftBent = metrics.left_knee > 80 && metrics.left_knee < 125;
  const rightBent = metrics.right_knee > 80 && metrics.right_knee < 125;

  if (elbowsStraight && shouldersLevel && ((leftBent && rightStraight) || (rightBent && leftStraight))) {
    return "Warrior II Pose";
  }

  if (elbowsStraight && shouldersLevel && leftStraight && rightStraight) {
    return "T Pose";
  }

  const treeA = leftStraight && metrics.right_knee > 20 && metrics.right_knee < 70;
  const treeB = rightStraight && metrics.left_knee > 20 && metrics.left_knee < 70;
  if (treeA || treeB) {
    return "Tree Pose";
  }

  return "Unknown Pose";
}

function evaluateAgainstTarget(landmarks, poseName) {
  const metrics = jointMetrics(landmarks);
  const inferred = inferPose(metrics);
  const rules = POSE_RULES[poseName] || [];
  const corrections = [];
  let totalDelta = 0;
  let checks = 0;

  const evaluateRules = (ruleSet) => {
    const localCorrections = [];
    let localDelta = 0;
    let localChecks = 0;

    ruleSet.forEach((rule) => {
      const value = metrics[rule.id];
      if (value == null) {
        return;
      }

      localChecks += 1;
      const delta = value - rule.target;
      const absDelta = Math.abs(delta);
      localDelta += absDelta;

      if (absDelta > rule.tolerance) {
        if (delta < 0) {
          localCorrections.push(rule.messageLow);
        } else {
          localCorrections.push(rule.messageHigh);
        }
      }
    });

    return { localCorrections, localDelta, localChecks };
  };

  if (poseName === "Warrior II Pose") {
    const baseRules = POSE_RULES["Warrior II Pose"];
    const leftFrontRules = [
      ...baseRules,
      { id: "left_knee", target: 100, tolerance: 20, messageLow: "Bend your left knee deeper.", messageHigh: "Do not push your left knee too far forward." },
      { id: "right_knee", target: 180, tolerance: 18, messageLow: "Straighten your right leg.", messageHigh: "Keep your right leg active without locking." },
    ];
    const rightFrontRules = [
      ...baseRules,
      { id: "right_knee", target: 100, tolerance: 20, messageLow: "Bend your right knee deeper.", messageHigh: "Do not push your right knee too far forward." },
      { id: "left_knee", target: 180, tolerance: 18, messageLow: "Straighten your left leg.", messageHigh: "Keep your left leg active without locking." },
    ];

    const leftEval = evaluateRules(leftFrontRules);
    const rightEval = evaluateRules(rightFrontRules);
    const chosen = leftEval.localDelta <= rightEval.localDelta ? leftEval : rightEval;

    totalDelta = chosen.localDelta;
    checks = chosen.localChecks;
    corrections.push(...chosen.localCorrections);
  } else if (poseName === "Tree Pose") {
    const baseRules = POSE_RULES["Tree Pose"].filter((rule) => rule.id.includes("elbow"));

    const leftStandingRules = [
      ...baseRules,
      { id: "left_knee", target: 180, tolerance: 18, messageLow: "Straighten your left standing leg.", messageHigh: "Keep your left standing leg stable." },
      { id: "right_knee", target: 40, tolerance: 18, messageLow: "Open your right knee out to the side.", messageHigh: "Ease pressure on the lifted right knee." },
    ];

    const rightStandingRules = [
      ...baseRules,
      { id: "right_knee", target: 180, tolerance: 18, messageLow: "Straighten your right standing leg.", messageHigh: "Keep your right standing leg stable." },
      { id: "left_knee", target: 40, tolerance: 18, messageLow: "Open your left knee out to the side.", messageHigh: "Ease pressure on the lifted left knee." },
    ];

    const leftEval = evaluateRules(leftStandingRules);
    const rightEval = evaluateRules(rightStandingRules);
    const chosen = leftEval.localDelta <= rightEval.localDelta ? leftEval : rightEval;

    totalDelta = chosen.localDelta;
    checks = chosen.localChecks;
    corrections.push(...chosen.localCorrections);
  } else {
    const evalResult = evaluateRules(rules);
    totalDelta = evalResult.localDelta;
    checks = evalResult.localChecks;
    corrections.push(...evalResult.localCorrections);
  }

  const avgDelta = checks > 0 ? totalDelta / checks : 90;
  const score = clamp(Math.round(100 - avgDelta * 1.2), 0, 100);

  return {
    score,
    inferred,
    corrections: [...new Set(corrections)].slice(0, 4),
    metrics,
  };
}

function drawSkeletonGuide(points) {
  referenceCanvas.style.display = "block";
  refCtx.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);

  const grad = refCtx.createLinearGradient(0, 0, referenceCanvas.width, referenceCanvas.height);
  grad.addColorStop(0, "#f5fbf5");
  grad.addColorStop(1, "#efe9df");
  refCtx.fillStyle = grad;
  refCtx.fillRect(0, 0, referenceCanvas.width, referenceCanvas.height);

  refCtx.strokeStyle = "#1c5f4b";
  refCtx.lineWidth = 8;
  refCtx.lineCap = "round";

  CONNECTIONS.forEach(([a, b]) => {
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    refCtx.beginPath();
    refCtx.moveTo(ax * referenceCanvas.width, ay * referenceCanvas.height);
    refCtx.lineTo(bx * referenceCanvas.width, by * referenceCanvas.height);
    refCtx.stroke();
  });

  Object.values(points).forEach(([x, y]) => {
    refCtx.beginPath();
    refCtx.fillStyle = "#d14a2c";
    refCtx.arc(x * referenceCanvas.width, y * referenceCanvas.height, 7, 0, Math.PI * 2);
    refCtx.fill();
  });
}

async function drawReferencePose(renderTips = true) {
  const poseName = state.selectedPose;
  const poseData = REFERENCE_POSES[poseName] || REFERENCE_POSES["T Pose"];
  const points = poseData.points;
  const currentRender = ++guideRenderVersion;
  const modelPath = await resolveModelPath(poseName);

  if (currentRender !== guideRenderVersion) {
    return;
  }

  if (poseModel && modelPath) {
    poseModel.style.display = "block";
    referenceCanvas.style.display = "none";
    poseModel.src = modelPath;
  } else {
    if (poseModel) {
      poseModel.style.display = "none";
    }

    drawSkeletonGuide(points);
  }

  if (renderTips) {
    guideTips.innerHTML = `<strong>${poseName} cues:</strong><ul>${poseData.tips.map((tip) => `<li>${tip}</li>`).join("")}</ul>`;
  }
}

function renderFeedback(evalResult) {
  const scoreClass = evalResult.score >= 85 ? "ok" : evalResult.score >= 60 ? "warn" : "bad";
  const isCorrect = evalResult.score >= 80;

  const correctionHtml = evalResult.corrections.length > 0
    ? `<ul>${evalResult.corrections.map((item) => `<li>${item}</li>`).join("")}</ul>`
    : "<p>No major correction needed. Hold the pose and breathe.</p>";

  feedback.innerHTML = `
    <p><span class="score ${scoreClass}">Score: ${evalResult.score}%</span> | Detected: ${evalResult.inferred}</p>
    <p>${isCorrect ? "Pose is correct for selected target." : "Adjust your posture using the hints below."}</p>
    ${correctionHtml}
  `;
}

function setMode(mode) {
  state.mode = mode;
  const on = mode === "on";

  modeOnBtn.classList.toggle("active", on);
  modeOffBtn.classList.toggle("active", !on);

  if (on) {
    stopUploadProcessing();
    startCamera();
  } else {
    stopCamera();
    feedback.textContent = "Camera OFF mode active. Use guided cues and reference pose to practice.";
    outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    const grad = outputCtx.createLinearGradient(0, 0, outputCanvas.width, outputCanvas.height);
    grad.addColorStop(0, "#f3f8f5");
    grad.addColorStop(1, "#ece6de");
    outputCtx.fillStyle = grad;
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    outputCtx.fillStyle = "#3f5a4f";
    outputCtx.font = "600 22px Space Grotesk";
    outputCtx.fillText("Camera OFF - Guided Practice", 40, 60);
  }
}

async function startCamera() {
  if (state.cameraRunning) {
    return;
  }

  if (!poseEstimator) {
    initPoseEstimator();
  }

  try {
    state.camera = new Camera(inputVideo, {
      onFrame: async () => {
        await poseEstimator.send({ image: inputVideo });
      },
      width: 640,
      height: 420,
    });

    await state.camera.start();
    state.cameraRunning = true;
    feedback.textContent = "Camera ON. Align your full body in frame for best correction.";
  } catch (error) {
    feedback.innerHTML = `Camera access failed: ${error.message}. Use localhost and allow webcam permission.`;
    setMode("off");
  }
}

function stopCamera() {
  if (!state.cameraRunning) {
    return;
  }

  if (state.camera && typeof state.camera.stop === "function") {
    state.camera.stop();
  }

  const stream = inputVideo.srcObject;
  if (stream && typeof stream.getTracks === "function") {
    stream.getTracks().forEach((track) => track.stop());
  }

  inputVideo.srcObject = null;
  state.cameraRunning = false;
}

function stopUploadProcessing() {
  state.uploadVideoActive = false;

  if (state.uploadLoopId) {
    cancelAnimationFrame(state.uploadLoopId);
    state.uploadLoopId = null;
  }

  uploadedVideo.pause();
  uploadedVideo.removeAttribute("src");
  uploadedVideo.load();

  if (state.uploadObjectUrl) {
    URL.revokeObjectURL(state.uploadObjectUrl);
    state.uploadObjectUrl = null;
  }
}

function ensurePoseEstimator() {
  if (!poseEstimator) {
    initPoseEstimator();
  }
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read the selected image."));
    };

    image.src = objectUrl;
  });
}

async function analyzeImageUpload(file) {
  ensurePoseEstimator();
  const image = await loadImageFromFile(file);
  await poseEstimator.send({ image });
  uploadStatus.textContent = `Analyzed image: ${file.name}`;
}

async function analyzeVideoUpload(file) {
  ensurePoseEstimator();

  if (state.uploadObjectUrl) {
    URL.revokeObjectURL(state.uploadObjectUrl);
  }

  state.uploadObjectUrl = URL.createObjectURL(file);
  uploadedVideo.src = state.uploadObjectUrl;
  uploadedVideo.currentTime = 0;

  await uploadedVideo.play();
  state.uploadVideoActive = true;
  uploadStatus.textContent = `Analyzing video: ${file.name}`;

  const runFrame = async () => {
    if (!state.uploadVideoActive) {
      return;
    }

    if (uploadedVideo.ended) {
      state.uploadVideoActive = false;
      uploadStatus.textContent = `Finished video analysis: ${file.name}`;
      return;
    }

    if (uploadedVideo.readyState >= 2) {
      await poseEstimator.send({ image: uploadedVideo });
    }

    state.uploadLoopId = requestAnimationFrame(() => {
      runFrame().catch((error) => {
        uploadStatus.textContent = `Video processing error: ${error.message}`;
      });
    });
  };

  await runFrame();
}

async function handleUploadAnalysis() {
  const file = uploadInput.files && uploadInput.files[0];

  if (!file) {
    uploadStatus.textContent = "Please choose an image or video first.";
    return;
  }

  if (state.mode === "on") {
    setMode("off");
  }

  stopUploadProcessing();
  uploadStatus.textContent = `Preparing: ${file.name}`;

  try {
    if (file.type.startsWith("image/")) {
      await analyzeImageUpload(file);
      return;
    }

    if (file.type.startsWith("video/")) {
      await analyzeVideoUpload(file);
      return;
    }

    uploadStatus.textContent = "Unsupported file type. Use an image or video file.";
  } catch (error) {
    uploadStatus.textContent = `Upload analysis failed: ${error.message}`;
  }
}

function initPoseEstimator() {
  poseEstimator = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  poseEstimator.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });

  poseEstimator.onResults((results) => {
    outputCtx.save();
    outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    if (results.image) {
      outputCtx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
    }

    if (results.poseLandmarks) {
      drawConnectors(outputCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: "#27ae60", lineWidth: 4 });
      drawLandmarks(outputCtx, results.poseLandmarks, { color: "#d14a2c", lineWidth: 1, radius: 4 });

      const evalResult = evaluateAgainstTarget(results.poseLandmarks, state.selectedPose);
      state.lastEval = evalResult;
      renderFeedback(evalResult);
    } else {
      feedback.textContent = "No pose detected. Step back and keep full body visible.";
    }

    outputCtx.restore();
  });
}

async function runGuidedSession() {
  const pose = REFERENCE_POSES[state.selectedPose];
  if (pose) {
    guideTips.innerHTML = `<strong>${state.selectedPose} Tips:</strong><br>${pose.tips.map(tip => `• ${tip}`).join('<br>')}`;
  } else {
    guideTips.innerHTML = "Select a pose to see tips.";
  }
}

modeOffBtn.addEventListener("click", () => setMode("off"));
modeOnBtn.addEventListener("click", () => setMode("on"));

startGuideBtn.addEventListener("click", () => {
  runGuidedSession();
  if (state.mode === "off") {
    feedback.textContent = "Guided mode running. Switch Camera ON to get live correction.";
  }
});

analyzeUploadBtn.addEventListener("click", () => {
  handleUploadAnalysis();
});

uploadInput.addEventListener("change", () => {
  const file = uploadInput.files && uploadInput.files[0];
  if (file) {
    uploadStatus.textContent = `Selected file: ${file.name}`;
  }
});

targetPoseSelect.addEventListener("change", (event) => {
  state.selectedPose = event.target.value;
  drawReferencePose();

  if (state.lastEval && state.mode === "on") {
    renderFeedback(state.lastEval);
  }
});

window.addEventListener("beforeunload", () => {
  stopCamera();
  stopUploadProcessing();
});

drawReferencePose();
populatePoseSelect();
setMode("off");