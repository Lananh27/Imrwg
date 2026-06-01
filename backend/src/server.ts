import express from "express";
import cors from "cors";
import { env } from "./config/env";

import authRoutes from "./routes/auth.routes";
import meetingRoutes from "./routes/meeting.routes";
import announcementRoutes from "./routes/announcement.routes";
import uploadRoutes from "./routes/upload.routes";
import homeRoutes from "./routes/home.routes";
import aboutRoutes from "./routes/about.routes";
import peopleRoutes from "./routes/people.routes";
import educationRoutes from "./routes/education.routes";
import dataRoutes from "./routes/data.routes";
import libraryRoutes from "./routes/library.routes";
import registrationRoutes from "./routes/registration.routes";
import projectRoutes from "./routes/project.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin: Postman, mobile app, server-to-server
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed =
        allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

      if (isAllowed) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/people", peopleRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (_req, res) => {
  return res.json({ message: "Backend is running" });
});

app.get("/api", (_req, res) => {
  return res.json({
    message: "API is running",
    routes: [
      "/api/auth",
      "/api/meetings",
      "/api/announcements",
      "/api/upload",
      "/api/home",
      "/api/about",
      "/api/people",
      "/api/education",
      "/api/data",
      "/api/library",
      "/api/registrations",
      "/api/projects",
    ],
  });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});