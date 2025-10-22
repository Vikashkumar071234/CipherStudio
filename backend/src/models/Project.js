// Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: String,
  files: Object
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
