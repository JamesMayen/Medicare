// server.js (production-ready, fixes CORS/static issues)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";

// Models
import Chat from "./models/chat.js";
import Appointment from "./models/appointment.js";

// Utils
import { sendReminders } from "./utils/reminder.js";
import { setIo } from "./utils/socketEmitter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Connect DB
connectDB();

const app = express();

// Security
app.use(helmet());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, try again later.",
});
app.use(limiter);

// Compression & logging
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// Ensure uploads folder exists
const uploadsPath = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsPath, { recursive: true });

// --------------------------------------------------
// Serve uploads (static)
// --------------------------------------------------
app.use("/uploads", express.static(uploadsPath));

// --------------------------------------------------
// CORS configuration
// --------------------------------------------------
const allowedOrigins = [
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy: This origin is not allowed."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ❌ Removed because Express 5 does NOT accept "/*" or "*" options route
// app.options("/*", cors(corsOptions));

// Apply CORS globally
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------------------------------------
// Mount API routes
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/doctor", consultationRoutes);
app.use("/api/doctor", availabilityRoutes);

// Health check
app.get("/health", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const status = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.status(status === "connected" ? 200 : 503).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: { status, name: mongoose.connection.name || "unknown" },
    });
  } catch (err) {
    res.status(503).json({ status: "ERROR", error: err.message });
  }
});

// Root
app.get("/", (req, res) => res.send("Medicare backend is running..."));

// Error middleware
app.use((err, req, res, next) => {
  console.error("ERROR:", err?.stack || err);
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors || {}).map((e) => e.message),
    });
  }
  if (err.message?.startsWith("CORS policy")) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  });
});

// 404
app.use((req, res) => {
  console.warn("404 - Not found:", req.method, req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

// --------------------------------------------------
// Socket.IO
// --------------------------------------------------
const PORT = process.env.PORT || 5000;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

setIo(io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (token) {
      const jwt = (await import("jsonwebtoken")).default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = (await import("./models/user.js")).default;
      const user = await User.findById(decoded.id).select("-password");
      if (user) socket.user = user;
    }
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next();
  }
});

io.on("connection", (socket) => {
  if (socket.user) {
    console.log(`User ${socket.user.name} connected (socket: ${socket.id})`);
    socket.join(`user_${socket.user._id}`);

    Chat.find({ participants: socket.user._id })
      .then((chats) => chats.forEach((c) => socket.join(`chat_${c._id}`)))
      .catch((e) => console.error("Socket join chats error:", e));
  } else {
    console.log(`Anonymous socket connected: ${socket.id}`);
  }

  socket.on("disconnect", () => {
    if (socket.user) console.log(`User ${socket.user.name} disconnected`);
    else console.log(`Socket ${socket.id} disconnected`);
  });
});

// Cron
cron.schedule("0 * * * *", async () => {
  try {
    console.log("Cron: checking appointment reminders...");
    const appointments = await Appointment.find({ status: "confirmed" })
      .populate("patient", "name email")
      .populate("doctor", "name email");
    sendReminders(appointments);
  } catch (err) {
    console.error("Cron error:", err);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received: shutting down");
  server.close(async () => {
    const mongoose = (await import("mongoose")).default;
    await mongoose.connection.close(false);
    console.log("Server & DB connections closed");
    process.exit(0);
  });
});

export { io };
export default app;
