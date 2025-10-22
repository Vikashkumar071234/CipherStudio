import express from "express";
import Project from "../models/Project.js";
const router = express.Router();

// Create project
router.post("/", async (req, res) => {
  const { projectName, files } = req.body;
  const doc = await Project.create({ projectName, files: files || {} });
  res.json({ id: doc._id.toString() });
});

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get project by ID
router.get("/:id", async (req, res) => {
  const doc = await Project.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json({
    id: doc._id.toString(),
    projectName: doc.projectName,
    files: doc.files,
  });
});

// Update project (name and/or files)
router.put("/:id", async (req, res) => {
  const { projectName, files } = req.body;
  const update = {};
  if (projectName !== undefined) update.projectName = projectName;
  if (files !== undefined) update.files = files;
  await Project.findByIdAndUpdate(req.params.id, update);
  res.json({ ok: true });
});

// Delete project
router.delete("/:id", async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
