// src/components/FileExplorer.js
import React from "react";

export default function FileExplorer({
  files,
  addFile,
  deleteFile,
  projectName,
  projectId,
  saveProject,
  loadProject,
  theme,
  toggleTheme,
}) {
  const isLight = theme === "light";

  return (
    <div
      style={{
        padding: 10,
        borderRight: "1px solid #ccc",
        background: isLight ? "#f7f7f7" : "#1e1e1e",
        color: isLight ? "#000" : "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <h3>{projectName}</h3>
      <p>
        <b>ID:</b> {projectId}
      </p>

      {/* Save Project */}
      <button
        onClick={saveProject}
        style={{
          background: isLight ? "#4caf50" : "#2e7d32",
          color: "#fff",
          border: "none",
          padding: "6px 10px",
          marginBottom: "5px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        💾 Save Project
      </button>

      {/* Load Project */}
      <button
        onClick={loadProject}
        style={{
          background: isLight ? "#2196f3" : "#1565c0",
          color: "#fff",
          border: "none",
          padding: "6px 10px",
          marginBottom: "5px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        📂 Load Project
      </button>

      {/* Toggle Theme */}
      <button
        onClick={toggleTheme}
        style={{
          background: isLight ? "#222" : "#ddd",
          color: isLight ? "#fff" : "#000",
          border: "none",
          padding: "6px 10px",
          borderRadius: "5px",
          marginTop: "10px",
          cursor: "pointer",
        }}
      >
        Toggle Theme ({theme})
      </button>

      <h4 style={{ marginTop: "20px" }}>Files</h4>

      {/* Add New File */}
      <button
        onClick={addFile}
        style={{
          background: isLight ? "#ff9800" : "#ef6c00",
          color: "#fff",
          border: "none",
          padding: "6px 10px",
          borderRadius: "5px",
          marginBottom: "10px",
          cursor: "pointer",
        }}
      >
        + New File
      </button>

      {/* File List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {Object.keys(files).map((f) => (
          <li
            key={f}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span>{f}</span>
            <button
              onClick={() => deleteFile(f)}
              style={{
                background: isLight ? "#e53935" : "#b71c1c",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "3px 6px",
                cursor: "pointer",
              }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
