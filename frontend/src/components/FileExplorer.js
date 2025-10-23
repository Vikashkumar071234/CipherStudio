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

  // Server projects controls
  serverProjects = [],
  serverLoading = false,
  selectedServerId = "",
  onServerSelect = () => {},
  refreshServerProjects = () => {},
  openServerProject = () => {},

  // NEW: server actions
  saveToServer = () => {},
  deleteServerProject = () => {},
}) {
  const isLight = theme === "light";

  // Colors
  const bg = isLight ? "#f7f7f7" : "#1e1e1e";
  const text = isLight ? "#000" : "#fff";
  const border = "#303134";
  const addBtn = isLight ? "#ff9800" : "#ef6c00";
  const editBtn = isLight ? "#607d8b" : "#455a64";
  const delBtn = isLight ? "#e53935" : "#b71c1c";

  const getBasename = (path) => path.slice(path.lastIndexOf("/") + 1) || path;
  const getFileIcon = (path) => {
    const lower = path.toLowerCase();
    if (lower.endsWith(".html")) return "🟠";
    if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "🟨";
    if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "🟦";
    if (lower.endsWith(".css")) return "🟩";
    if (lower.endsWith(".json")) return "🟫";
    return "📄";
  };

  const actionBtnBase = {
    width: 28,
    height: 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    color: "#fff",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
    padding: 0,
  };

  const fileRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 66px",
    alignItems: "center",
    gap: 6,
    height: 32,
    padding: "0 6px",
    borderRadius: 4,
  };

  const fileLabelStyle = {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: text,
  };

  const fileTextStyle = {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: 12.5,
  };

  const fileKeys = Object.keys(files).sort((a, b) => {
    const an = getBasename(a);
    const bn = getBasename(b);
    return an === bn ? a.localeCompare(b) : an.localeCompare(b);
  });

  return (
    <div
      style={{
        padding: 10,
        borderRight: `1px solid ${border}`,
        background: bg,
        color: text,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s",
        minWidth: 0,
      }}
    >
      <h3 style={{ margin: "6px 0" }}>{projectName || "MyProject"}</h3>
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
          width: "100%",
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
          width: "100%",
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
          width: "100%",
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
          marginBottom: 10,
          cursor: "pointer",
          width: "100%",
        }}
      >
        Autosave: {autosave ? "ON" : "OFF"}
      </button>

      {/* Server Projects */}
      <h4 style={{ margin: "8px 0 6px" }}>Server Projects</h4>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <select
          value={selectedServerId}
          onChange={(e) => onServerSelect(e.target.value)}
          style={{
            flex: 1,
            background: isLight ? "#fff" : "#2a2a2a",
            color: isLight ? "#000" : "#fff",
            border: `1px solid ${border}`,
            borderRadius: 6,
            padding: "6px 8px",
          }}
        >
          {serverLoading ? (
            <option>Loading...</option>
          ) : serverProjects.length === 0 ? (
            <option value="">No server projects</option>
          ) : (
            <>
              <option value="">Select a project</option>
              {serverProjects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName || "Untitled"}
                </option>
              ))}
            </>
          )}
        </select>
        <button
          onClick={refreshServerProjects}
          title="Refresh server projects"
          style={{
            background: "#2e7d32",
            color: "#fff",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ⟳
        </button>
      </div>

      <button
        onClick={openServerProject}
        disabled={!selectedServerId}
        style={{
          background: selectedServerId ? "#7c3aed" : "#6b7280",
          color: "#fff",
          border: "none",
          padding: "8px 10px",
          marginBottom: 8,
          borderRadius: 6,
          cursor: selectedServerId ? "pointer" : "not-allowed",
          width: "100%",
        }}
      >
        ☁️ Open Selected
      </button>

      {/* NEW: Save to Server */}
      <button
        onClick={saveToServer}
        style={{
          background: "#7c3aed",
          color: "#fff",
          border: "none",
          padding: "8px 10px",
          marginBottom: 8,
          borderRadius: 6,
          cursor: "pointer",
          width: "100%",
        }}
      >
        ☁️ Save to Server
      </button>

      {/* NEW: Delete Server Project */}
      <button
        onClick={deleteServerProject}
        disabled={!selectedServerId}
        style={{
          background: selectedServerId ? "#b91c1c" : "#6b7280",
          color: "#fff",
          border: "none",
          padding: "8px 10px",
          marginBottom: 12,
          borderRadius: 6,
          cursor: selectedServerId ? "pointer" : "not-allowed",
          width: "100%",
        }}
      >
        🗑 Delete Server Project
      </button>

      {/* Files */}
      <h4 style={{ margin: "8px 0 6px" }}>Files</h4>

      <button
        onClick={addFile}
        style={{
          background: addBtn,
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

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 4,
        }}
      >
        {fileKeys.map((path) => {
          const name = getBasename(path);
          return (
            <li key={path} style={fileRowStyle} title={path}>
              <div style={fileLabelStyle}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>
                  {getFileIcon(path)}
                </span>
                <span style={fileTextStyle}>{name}</span>
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  onClick={() => renameFile(path)}
                  title="Rename"
                  aria-label={`Rename ${name}`}
                  style={{ ...actionBtnBase, background: editBtn }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteFile(path)}
                  title="Delete"
                  aria-label={`Delete ${name}`}
                  style={{ ...actionBtnBase, background: delBtn }}
                >
                  🗑
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}