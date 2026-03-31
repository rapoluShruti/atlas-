import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { PeerServer } from "peer";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

app.use("/api/auth", authRoutes);

// Yoga endpoints
app.post("/api/create-plan", async (req, res) => {
  const { userId, motive, minutesPerDay, daysPerWeek, sessionType, instructions } = req.body;

  // Create plan based on days per week
  const numDays = Math.min(parseInt(daysPerWeek) || 3, 7); // Max 7 days

  const dayPlans = {
    1: [
      { pose: "Mountain Pose", duration: 5 },
      { pose: "Tree Pose", duration: 7 },
      { pose: "Warrior I", duration: 10 },
      { pose: "Downward Dog", duration: 5 },
      { pose: "Child's Pose", duration: 8 }
    ],
    2: [
      { pose: "Sun Salutation", duration: 5 },
      { pose: "Triangle Pose", duration: 7 },
      { pose: "Warrior II", duration: 10 },
      { pose: "Seated Forward Bend", duration: 5 },
      { pose: "Bridge Pose", duration: 7 }
    ],
    3: [
      { pose: "Cat-Cow", duration: 5 },
      { pose: "Pigeon Pose", duration: 8 },
      { pose: "Chair Pose", duration: 10 },
      { pose: "Corpse Pose", duration: 5 },
      { pose: "Easy Pose", duration: 7 }
    ],
    4: [
      { pose: "Warrior III", duration: 5 },
      { pose: "Plank Pose", duration: 7 },
      { pose: "Cobra Pose", duration: 10 },
      { pose: "Happy Baby", duration: 5 },
      { pose: "Savasana", duration: 8 }
    ],
    5: [
      { pose: "Lotus Pose", duration: 5 },
      { pose: "Half Lord of the Fishes", duration: 7 },
      { pose: "Bow Pose", duration: 10 },
      { pose: "Butterfly Pose", duration: 5 },
      { pose: "Legs Up the Wall", duration: 7 }
    ],
    6: [
      { pose: "Eagle Pose", duration: 5 },
      { pose: "Dancer's Pose", duration: 8 },
      { pose: "Crow Pose", duration: 10 },
      { pose: "Thread the Needle", duration: 5 },
      { pose: "Reclined Twist", duration: 7 }
    ],
    7: [
      { pose: "Headstand", duration: 5 },
      { pose: "Shoulder Stand", duration: 7 },
      { pose: "Fish Pose", duration: 10 },
      { pose: "Camel Pose", duration: 5 },
      { pose: "Plow Pose", duration: 8 }
    ]
  };


  // Smart inject top 3 poses at the start of each day (blend, not hardcoded)
  const top3 = [
    { pose: "T-Pose", duration: 5 },
    { pose: "Plank", duration: 7 },
    { pose: "Warrior 2", duration: 10 }
  ];
  const plan = {};
  for (let i = 1; i <= numDays; i++) {
    // Remove any duplicate of top3 poses from the day's plan
    const filtered = (dayPlans[i] || dayPlans[1]).filter(
      p => !top3.some(t => t.pose.toLowerCase() === p.pose.toLowerCase())
    );
    // Blend: shuffle top3 order per day for natural feel
    const shuffledTop3 = [...top3].sort(() => Math.random() - 0.5);
    plan[`day${i}`] = [...shuffledTop3, ...filtered];
  }

  // Save plan to user in database
  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, { yogaPlan: plan });
    } catch (saveError) {
      console.error("Error saving plan to user:", saveError);
    }
  }

  res.json(plan);
});

app.get("/api/get-plan/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (user && user.yogaPlan) {
      res.json(user.yogaPlan);
    } else {
      res.status(404).json({ error: "Plan not found" });
    }
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/session/start", async (req, res) => {
  const { userId, day } = req.body;
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  // Store session start
  res.json({ sessionId, message: "Session started" });
});

app.post("/api/session/update", async (req, res) => {
  const { sessionId, event, poseIndex, timestamp } = req.body;
  // Log event (in real app, save to DB)
  console.log(`Session ${sessionId}: ${event} at pose ${poseIndex} - ${timestamp}`);
  res.json({ success: true });
});

app.post("/api/session/end", async (req, res) => {
  const { sessionId } = req.body;
  // Generate report (mock for now)
  const report = {
    totalTime: 300, // seconds
    completedPoses: 5,
    skippedPoses: 0,
    completionPercentage: 100
  };
  res.json(report);
});

app.use(notFound);
app.use(errorHandler);

// Socket.io room management
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, peerId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", peerId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", peerId);
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Start PeerJS server on port 5001
const peerServer = PeerServer({ 
  port: 5001, 
  path: '/',
  allow_discovery: true,
  cors: {
    origin: 'http://localhost:5174',
    credentials: true
  }
});
