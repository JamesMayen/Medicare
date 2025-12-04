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
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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

// Global error handlers for debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Connect DB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, try again later.",
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// --------------------------------------------------
// ✅ FIXED: Serve uploads FIRST with NO CORS
// --------------------------------------------------
fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      // Ensure static images do NOT carry wrong headers
      res.removeHeader("Cross-Origin-Resource-Policy");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// --------------------------------------------------
// CORS Middleware (APPLIES TO API ONLY)
// --------------------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://medicare-system.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parsing - applied conditionally to avoid conflicts with multipart

// --------------------------------------------------
// API Routes
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/doctor", consultationRoutes);
app.use("/api/doctor", availabilityRoutes);

// Health Check
app.get("/health", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const status = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.status(status === "connected" ? 200 : 503).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: {
        status,
        name: mongoose.connection.name,
      },
    });
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("Medicare backend is running...");
});

// Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  res.status(500).json({
    message:
      process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  });
});

// 404
app.use((req, res) => {
  console.log('DEBUG: 404 Route not found - Method:', req.method, 'URL:', req.url);
  res.status(404).json({ message: "Route not found" });
});

// --------------------------------------------------
// SOCKET.IO
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

// Socket authentication middleware (optional for public events)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const jwt = (await import("jsonwebtoken")).default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = (await import("./models/user.js")).default;

      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        socket.user = user;
      }
    }
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  if (socket.user) {
    console.log(`User ${socket.user.name} connected`);

    socket.join(`user_${socket.user._id}`);

    Chat.find({ participants: socket.user._id })
      .then((chats) => {
        chats.forEach((chat) => socket.join(`chat_${chat._id}`));
      })
      .catch((error) => {
        console.error('Error finding chats for user:', error);
      });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user.name} disconnected`);
    });
  } else {
    console.log(`Anonymous user connected`);

    socket.on("disconnect", () => {
      console.log(`Anonymous user disconnected`);
    });
  }
});

// --------------------------------------------------
// Cron - reminders
// --------------------------------------------------
cron.schedule("0 * * * *", async () => {
  try {
    console.log("Checking for appointment reminders...");
    const appointments = await Appointment.find({ status: "confirmed" })
      .populate("patient", "name email")
      .populate("doctor", "name email");
    sendReminders(appointments);
  } catch (error) {
    console.error("Reminder error:", error);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    const mongoose = (await import("mongoose")).default;
    await mongoose.connection.close();
    console.log('Server and DB closed');
    process.exit(0);
  });
});

export { io };
// Trigger restart
export default app;
