import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// CORS middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));



// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chats", chatRoutes);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.status(dbStatus === "connected" ? 200 : 503).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || "unknown",
      },
    });
  } catch (error) {
    res.status(503).json({ status: "ERROR", error: error.message });
  }
});

// Metrics endpoint
app.get("/metrics", (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get("/", (req, res) => {
  res.send("Medicare backend is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map(e => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  });
});

// 404 handler (catch-all)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

export default app;
