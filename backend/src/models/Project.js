// src/models/Project.js
import mongoose from "mongoose";

const FileEntrySchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    code: { type: String, default: "" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, default: "Untitled" },
    files: { type: [FileEntrySchema], default: [] }, // array [{ path, code }]
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;