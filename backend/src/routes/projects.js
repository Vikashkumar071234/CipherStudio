import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

// List all projects (id + name)
router.get("/", async (_req, res) => {
  try {
    const docs = await Project.find({}, { projectName: 1 }).sort({ updatedAt: -1 });
    res.json(docs.map(d => ({ _id: d._id.toString(), projectName: d.projectName || "Untitled" })));
  } catch (err) {
    console.error("GET /projects error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create project
router.post("/", async (req, res) => {
  try {
    const { projectName, files } = req.body || {};
    const doc = await Project.create({ projectName, files: files || {} });
    res.json({ id: doc._id.toString() });
  } catch (err) {
    console.error("POST /projects error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get project by id
router.get("/:id", async (req, res) => {
  try {
    const doc = await Project.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ id: doc._id.toString(), projectName: doc.projectName, files: doc.files });
  } catch (err) {
    console.error("GET /projects/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update project (name and/or files)
router.put("/:id", async (req, res) => {
  try {
    const { projectName, files } = req.body || {};
    const update = {};
    if (projectName !== undefined) update.projectName = projectName;
    if (files !== undefined) update.files = files;
    await Project.findByIdAndUpdate(req.params.id, update);
    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /projects/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete project
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