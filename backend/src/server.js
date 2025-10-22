import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import projectRoutes from "./routes/projects.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:3000"] }));
app.use(express.json({ limit: "5mb" }));

app.get("/", (_req, res) => res.send("CipherStudio API running"));
app.use("/api/projects", projectRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  });
