import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";      // make sure default export in db.js
import projectRoutes from "./routes/projects.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: allow requests from your frontend
app.use(
  cors({
    origin: ["http://localhost:3000", "https://<your-frontend-url>.vercel.app"],
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "5mb" }));

// Test route
app.get("/", (_req, res) => res.send("CipherStudio API running"));

// Project routes
app.use("/api/projects", projectRoutes);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection failed:", err);
    process.exit(1); // stop server if DB connection fails
  });
