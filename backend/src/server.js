import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import { createServer } from "http";
import { Server } from "socket.io";
import { PeerServer } from "peer";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const userPlans = {}; // In-memory storage for yoga plans

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

app.use("/api/auth", authRoutes);

// Yoga endpoints
app.post("/api/create-plan", async (req, res) => {
  try {
    const { userId = 'default', motive, minutesPerDay, daysPerWeek, sessionType, instructions } = req.body;

    const prompt = `You are a yoga coach. Create a 3–4 day yoga plan based on the following user preferences:

- Main motive: ${motive}
- Minutes per day: ${minutesPerDay}
- Days per week: ${daysPerWeek}
- Session type: ${sessionType}
- Additional instructions: ${instructions}

Requirements:
1. Include yoga pose names, duration (minutes), and order.
2. Keep the plan simple to repeat for a month (do NOT generate 30 days of data).
3. Return ONLY valid JSON, no extra text or formatting. The JSON should be:

{
  "day1": [{"pose": "Pose Name", "duration": 5}, {"pose": "Pose Name", "duration": 7}],
  "day2": [...],
  "day3": [...],
  "day4": [...]
}`;

    // For free version, using mock data. To enable real Gemini AI:
    // 1. Go to https://makersuite.google.com/app/apikey to get API key
    // 2. Enable Generative Language API in Google Cloud Console
    // 3. Uncomment the code below and comment out the mock
    /*
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    console.log('Gemini response:', generatedText);
    let plan;
    try {
      plan = JSON.parse(generatedText.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      plan = mockPlan;
    }
    */

    const mockPlan = {
      day1: [
        { pose: "Mountain Pose", duration: 5 },
        { pose: "Tree Pose", duration: 7 },
        { pose: "Warrior I", duration: 10 }
      ],
      day2: [
        { pose: "Downward Dog", duration: 5 },
        { pose: "Cat-Cow", duration: 7 },
        { pose: "Child's Pose", duration: 8 }
      ],
      day3: [
        { pose: "Seated Forward Bend", duration: 5 },
        { pose: "Bridge Pose", duration: 7 },
        { pose: "Corpse Pose", duration: 10 }
      ],
      day4: [
        { pose: "Sun Salutation", duration: 5 },
        { pose: "Triangle Pose", duration: 7 },
        { pose: "Pigeon Pose", duration: 8 }
      ]
    };

    userPlans[userId] = mockPlan;
    res.json(mockPlan);
  } catch (error) {
    console.error("Error creating plan:", error.response?.data || error.message);
    // Fallback to mock plan on API error
    const mockPlan = {
      day1: [
        { pose: "Mountain Pose", duration: 5 },
        { pose: "Tree Pose", duration: 7 },
        { pose: "Warrior I", duration: 10 }
      ],
      day2: [
        { pose: "Downward Dog", duration: 5 },
        { pose: "Cat-Cow", duration: 7 },
        { pose: "Child's Pose", duration: 8 }
      ],
      day3: [
        { pose: "Seated Forward Bend", duration: 5 },
        { pose: "Bridge Pose", duration: 7 },
        { pose: "Corpse Pose", duration: 10 }
      ],
      day4: [
        { pose: "Sun Salutation", duration: 5 },
        { pose: "Triangle Pose", duration: 7 },
        { pose: "Pigeon Pose", duration: 8 }
      ]
    };
    userPlans[userId] = mockPlan;
    res.json(mockPlan);
  }
});

app.get("/api/get-plan/:userId", (req, res) => {
  const { userId } = req.params;
  const plan = userPlans[userId];
  if (plan) {
    res.json(plan);
  } else {
    res.status(404).json({ error: "Plan not found" });
  }
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
const peerServer = PeerServer({ port: 5001, path: '/' });
