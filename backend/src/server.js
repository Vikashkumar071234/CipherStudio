// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import projectRoutes from "./routes/projects.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowList = [
        "http://localhost:3000",
        "https://cipher-studio-frontend.vercel.app", // <-- replace with your Vercel domain if different
      ];
      const ok = allowList.includes(origin) || /\.vercel\.app$/.test(origin);
      cb(ok ? null : new Error("Not allowed by CORS"), ok);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(express.json({ limit: "5mb" }));

// Health/root
app.get("/", (_req, res) => res.send("CipherStudio API running"));

// Friendly API root
app.get("/api", (_req, res) => {
  res.json({ ok: true, hint: "Use /api/projects" });
});

// Projects routes
app.use("/api/projects", projectRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  });