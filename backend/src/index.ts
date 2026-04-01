import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getDatabase, closeDatabase } from "./db/database";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

// Initialize database (this will also seed if needed)
getDatabase();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
// app.use("/api/organizer", organizerRoutes);
// app.use("/api/attendee", attendeeRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  },
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📦 Database initialized at ./data/events.db`);
  console.log(`\n✓ API Health: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
});
