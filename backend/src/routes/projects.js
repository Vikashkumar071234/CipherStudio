// src/routes/projects.js
import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

// Helpers to convert files
const toArray = (files) => {
  if (Array.isArray(files)) return files;
  const obj = files || {};
  return Object.entries(obj).map(([path, code]) => ({ path, code }));
};
const toObject = (files) => {
  if (Array.isArray(files)) return Object.fromEntries(files.map((f) => [f.path, f.code]));
  return files || {};
};

// List all projects (id + name), newest updated first
router.get("/", async (_req, res) => {
  try {
    const docs = await Project.find({}, { projectName: 1 }).sort({ updatedAt: -1 });
    res.json(docs.map((d) => ({ _id: d._id.toString(), projectName: d.projectName || "Untitled" })));
  } catch (err) {
    console.error("GET /projects error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    const { projectName, files } = req.body || {};
    const doc = await Project.create({ projectName, files: toArray(files) });
    res.json({ id: doc._id.toString() });
  } catch (err) {
    console.error("POST /projects error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get by id
router.get("/:id", async (req, res) => {
  try {
    const doc = await Project.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ id: doc._id.toString(), projectName: doc.projectName, files: toObject(doc.files) });
  } catch (err) {
    console.error("GET /projects/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update (name and/or files)
router.put("/:id", async (req, res) => {
  try {
    const { projectName, files } = req.body || {};
    const update = {};
    if (projectName !== undefined) update.projectName = projectName;
    if (files !== undefined) update.files = toArray(files);
    await Project.findByIdAndUpdate(req.params.id, update);
    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /projects/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /projects/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;