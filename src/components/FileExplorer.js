import React from "react";
export default function FileExplorer({
files,
addFile,
deleteFile,
renameFile,
projectName,
projectId,
saveProject,
loadProject,
theme,
toggleTheme,
autosave,
toggleAutosave,
}) {
const isLight = theme === "light";

return (
<div
style={{
padding: 10,
borderRight: "1px solid #303134",
background: isLight ? "#f7f7f7" : "#1e1e1e",
color: isLight ? "#000" : "#fff",
height: "100%",
display: "flex",
flexDirection: "column",
transition: "all 0.2s",
minWidth: 0,
}}
>
<h3 style={{ margin: "6px 0" }}>{projectName}</h3>
<p style={{ marginTop: 0, wordBreak: "break-all" }}>
<b>ID:</b> {projectId}
</p>
  <button
    onClick={saveProject}
    style={{
      background: isLight ? "#4caf50" : "#2e7d32",
      color: "#fff",
      border: "none",
      padding: "8px 10px",
      marginBottom: 6,
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    💾 Save Project
  </button>

  <button
    onClick={loadProject}
    style={{
      background: isLight ? "#2196f3" : "#1565c0",
      color: "#fff",
      border: "none",
      padding: "8px 10px",
      marginBottom: 6,
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    📂 Load Project
  </button>

  <button
    onClick={toggleTheme}
    style={{
      background: isLight ? "#222" : "#ddd",
      color: isLight ? "#fff" : "#000",
      border: "none",
      padding: "8px 10px",
      borderRadius: 6,
      marginBottom: 6,
      cursor: "pointer",
    }}
  >
    Toggle Theme ({theme})
  </button>

  <button
    onClick={toggleAutosave}
    style={{
      background: autosave ? "#2e7d32" : "#616161",
      color: "#fff",
      border: "none",
      padding: "8px 10px",
      borderRadius: 6,
      marginBottom: 8,
      cursor: "pointer",
    }}
  >
    Autosave: {autosave ? "ON" : "OFF"}
  </button>

  <h4 style={{ margin: "10px 0 6px" }}>Files</h4>

  <button
    onClick={addFile}
    style={{
      background: isLight ? "#ff9800" : "#ef6c00",
      color: "#fff",
      border: "none",
      padding: "8px 10px",
      borderRadius: 6,
      marginBottom: 10,
      cursor: "pointer",
      width: "100%",
    }}
  >
    + New File
  </button>

  <ul style={{ listStyle: "none", padding: 0, margin: 0, overflow: "auto" }}>
    {Object.keys(files).map((f) => (
      <li
        key={f}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          gap: 6,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{f}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => renameFile(f)}
            title="Rename"
            style={{
              background: isLight ? "#607d8b" : "#455a64",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "3px 6px",
              cursor: "pointer",
            }}
          >
            ✏️
          </button>
          <button
            onClick={() => deleteFile(f)}
            title="Delete"
            style={{
              background: isLight ? "#e53935" : "#b71c1c",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "3px 6px",
              cursor: "pointer",
            }}
          >
            🗑
          </button>
        </div>
      </li>
    ))}
  </ul>
</div>
);
}