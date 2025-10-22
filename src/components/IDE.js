import React, { useState, useEffect, useRef } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
} from "@codesandbox/sandpack-react";
import { githubLight, dracula } from "@codesandbox/sandpack-themes";
import { v4 as uuidv4 } from "uuid";
import FileExplorer from "./FileExplorer";

export default function IDE() {
  // Palettes
  const darkBase = "#0f0f0f";
  const darkBorder = "#303134";
  const darkPanel = "#1e1e1e";
  const darkEditor = "#202124";
  const darkText = "#e0e0e0";

  const lightBase = "#ffffff";
  const lightBorder = "#ddd";
  const lightPanel = "#fafafa";
  const lightText = "#000000";

  // CSS inside the sandbox (preview) — ALWAYS white
  const staticCss = `
    :root {
      --app-bg: #ffffff;
      --app-text: #000000;
    }
    html, body, #root {
      background-color: var(--app-bg) !important;
      color: var(--app-text) !important;
      height: 100%;
      margin: 0;
    }
    * { color: inherit !important; }
  `;

  const appJs = `
    export default function App() {
      return (
        <div
          style={{
            backgroundColor: "var(--app-bg)",
            color: "var(--app-text)",
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            fontFamily: "Segoe UI, Roboto, sans-serif",
            textAlign: "center",
          }}
        >
          <h1>Hello from CipherStudio!</h1>
          <p>The theme is synced with the IDE.</p>
        </div>
      );
    }
  `;

  const indexJs = `
    import React from "react";
    import { createRoot } from "react-dom/client";
    import App from "./App";
    import "./index.css"; // load static white theme CSS into the sandbox
    const root = createRoot(document.getElementById("root"));
    root.render(<App />);
  `;

  // Initial theme + files
  const initialTheme = localStorage.getItem("cipherstudio:theme") || "light";
  const [files, setFiles] = useState({
    "/App.js": appJs,
    "/index.js": indexJs,
    "/index.css": staticCss, // ALWAYS white inside sandbox
  });

  const [projectId] = useState(uuidv4());
  const [projectName, setProjectName] = useState("MyProject");
  const [theme, setTheme] = useState(initialTheme);
  const isLight = theme === "light";

  // Collapsible console
  const [showConsole, setShowConsole] = useState(
    localStorage.getItem("cipherstudio:console") !== "hidden"
  );
  const [consoleHeight, setConsoleHeight] = useState(150);
  useEffect(() => {
    localStorage.setItem("cipherstudio:console", showConsole ? "shown" : "hidden");
  }, [showConsole]);

  // Autosave (debounced)
  const [autosave, setAutosave] = useState(
    JSON.parse(localStorage.getItem("cipherstudio:autosave") || "true")
  );
  const toggleAutosave = () => {
    const next = !autosave;
    setAutosave(next);
    localStorage.setItem("cipherstudio:autosave", JSON.stringify(next));
  };
  useEffect(() => {
    if (!autosave) return;
    const t = setTimeout(() => {
      const all = JSON.parse(localStorage.getItem("cipherstudio:projects") || "{}");
      all[projectId] = { projectName, files };
      localStorage.setItem("cipherstudio:projects", JSON.stringify(all));
    }, 800);
    return () => clearTimeout(t);
  }, [files, projectName, projectId, autosave]);

  // Apply theme to outer page
  useEffect(() => {
    document.body.style.background = isLight ? lightBase : darkBase;
    document.body.style.color = isLight ? lightText : darkText;
  }, [isLight]);

  const toggleTheme = () => {
    const next = isLight ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("cipherstudio:theme", next);
  };

  // Project helpers
  const saveProject = () => {
    const all = JSON.parse(localStorage.getItem("cipherstudio:projects") || "{}");
    all[projectId] = { projectName, files };
    localStorage.setItem("cipherstudio:projects", JSON.stringify(all));
    alert(`Project saved!\nID: ${projectId}`);
  };

  const loadProject = () => {
    const id = prompt("Enter project ID:");
    const all = JSON.parse(localStorage.getItem("cipherstudio:projects") || "{}");
    if (all[id]) {
      const loaded = { ...all[id].files };
      if (!loaded["/index.css"]) loaded["/index.css"] = staticCss; // ensure white preview
      setFiles(loaded);
      setProjectName(all[id].projectName);
      alert("Project loaded!");
    } else {
      alert("Project not found!");
    }
  };

  const addFile = () => {
    const n = prompt("File name (e.g. /NewFile.js):");
    if (n && !files[n]) setFiles({ ...files, [n]: "// new file content" });
  };

  const deleteFile = (name) => {
    const updated = { ...files };
    delete updated[name];
    setFiles(updated);
  };

  const renameFile = (oldPath) => {
    const newPath = prompt("Rename file to:", oldPath);
    if (!newPath || newPath === oldPath) return;
    setFiles((prev) => {
      if (prev[newPath]) {
        alert("A file with that name already exists.");
        return prev;
      }
      const { [oldPath]: content, ...rest } = prev;
      return { ...rest, [newPath]: content ?? "// empty file" };
    });
  };

  // Sidebar responsive/collapsible
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setSidebarOpen(!mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  // Resizable Editor | Preview (vertical)
  const [leftSplitPct, setLeftSplitPct] = useState(50);
  const topRowRef = useRef(null);
  const vDragging = useRef(false);
  const onVDown = (e) => {
    vDragging.current = true;
    e.preventDefault();
  };
  const onVMove = (e) => {
    if (!vDragging.current || !topRowRef.current) return;
    const rect = topRowRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(20, Math.min(80, (x / rect.width) * 100));
    setLeftSplitPct(pct);
  };
  const onVUp = () => (vDragging.current = false);
  useEffect(() => {
    window.addEventListener("mousemove", onVMove);
    window.addEventListener("mouseup", onVUp);
    return () => {
      window.removeEventListener("mousemove", onVMove);
      window.removeEventListener("mouseup", onVUp);
    };
  }, []);

  // Resizable Console (horizontal)
  const colRef = useRef(null);
  const hDragging = useRef(false);
  const resizerH = 6;
  const consoleHeaderH = 32;

  const onHDown = (e) => {
    hDragging.current = true;
    e.preventDefault();
  };
  const onHMove = (e) => {
    if (!hDragging.current || !colRef.current) return;
    const rect = colRef.current.getBoundingClientRect();
    const topUsed = e.clientY - rect.top;
    const newH = Math.max(0, Math.min(rect.height - 80, rect.height - topUsed - consoleHeaderH));
    setConsoleHeight(newH);
  };
  const onHUp = () => (hDragging.current = false);
  useEffect(() => {
    window.addEventListener("mousemove", onHMove);
    window.addEventListener("mouseup", onHUp);
    return () => {
      window.removeEventListener("mousemove", onHMove);
      window.removeEventListener("mouseup", onHUp);
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: sidebarOpen ? "250px 1fr" : "0 1fr",
        height: "100vh",
        backgroundColor: isLight ? lightBase : darkBase,
        color: isLight ? lightText : darkText,
        transition:
          "grid-template-columns 0.2s ease, background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Sidebar */}
      <div style={{ overflow: "hidden" }}>
        {sidebarOpen && (
          <FileExplorer
            files={files}
            addFile={addFile}
            deleteFile={deleteFile}
            renameFile={renameFile}
            projectName={projectName}
            projectId={projectId}
            saveProject={saveProject}
            loadProject={loadProject}
            theme={theme}
            toggleTheme={toggleTheme}
            autosave={autosave}
            toggleAutosave={toggleAutosave}
          />
        )}
      </div>

      {/* Right panel + hamburger */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setSidebarOpen((s) => !s)}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            background: isLight ? "#eee" : "#2a2a2a",
            color: isLight ? "#000" : "#fff",
            border: `1px solid ${isLight ? "#ccc" : "#444"}`,
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
          }}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          ☰
        </button>

        <SandpackProvider
          key={theme} // re-mount on theme change (outer theme); preview stays white via /index.css
          template="react"
          files={files}
          theme={isLight ? githubLight : dracula}
        >
          {/* Top row + resizer + console */}
          <div ref={colRef} style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Wrap SandpackLayout in a div to attach our ref */}
            <div
              ref={topRowRef}
              style={{
                flex: showConsole
                  ? `0 0 calc(100% - ${resizerH + consoleHeaderH + consoleHeight}px)`
                  : "1",
                minHeight: 0,
                display: "flex",
                flexDirection: "row",
              }}
            >
              <SandpackLayout
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "row",
                  backgroundColor: isLight ? lightPanel : darkPanel,
                  borderLeft: `1px solid ${isLight ? lightBorder : darkBorder}`,
                  transition: "background-color 0.3s ease",
                }}
              >
                {/* Editor */}
                <div
                  style={{
                    width: `${leftSplitPct}%`,
                    minWidth: 0,
                    minHeight: 0,
                    borderRight: `1px solid ${isLight ? lightBorder : darkBorder}`,
                    backgroundColor: isLight ? lightPanel : darkEditor,
                  }}
                >
                  <SandpackCodeEditor
                    showTabs
                    showLineNumbers
                    style={{ height: "100%", backgroundColor: "transparent" }}
                  />
                </div>

                {/* Vertical resizer */}
                <div
                  onMouseDown={onVDown}
                  style={{
                    width: 6,
                    cursor: "col-resize",
                    backgroundColor: isLight ? lightBorder : darkBorder,
                  }}
                  title="Drag to resize editor/output"
                />

                {/* Preview */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    display: "flex",
                    backgroundColor: isLight ? lightPanel : darkEditor,
                    color: isLight ? lightText : darkText,
                  }}
                >
                  <SandpackPreview
                    actions={["refresh"]} // hides "Open Sandbox", keeps Refresh
                    style={{
                      flex: 1,
                      backgroundColor: "var(--app-bg)", // always white from /index.css
                      color: "var(--app-text)",
                    }}
                  />
                </div>
              </SandpackLayout>
            </div>

            {/* Horizontal resizer */}
            {showConsole && (
              <div
                onMouseDown={onHDown}
                style={{
                  height: resizerH,
                  backgroundColor: isLight ? lightBorder : darkBorder,
                  cursor: "ns-resize",
                }}
                title="Drag to resize console height"
              />
            )}

            {/* Console */}
            <div
              style={{
                display: showConsole ? "block" : "none",
                backgroundColor: isLight ? "#f7f7f7" : darkBase,
                color: isLight ? "#000" : darkText,
                borderTop: `1px solid ${isLight ? lightBorder : darkBorder}`,
                height: showConsole ? 32 + consoleHeight : 0,
              }}
            >
              <div
                style={{
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  userSelect: "none",
                }}
              >
                <span style={{ fontWeight: 600 }}>Console</span>
                <button
                  onClick={() => setShowConsole((s) => !s)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                  title="Hide console"
                >
                  ▾
                </button>
              </div>

              <div style={{ height: consoleHeight }}>
                <SandpackConsole
                  style={{
                    height: "100%",
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                />
              </div>
            </div>

            {!showConsole && (
              <div
                style={{
                  height: 32,
                  backgroundColor: isLight ? "#f7f7f7" : darkBase,
                  color: isLight ? "#000" : darkText,
                  borderTop: `1px solid ${isLight ? lightBorder : darkBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  userSelect: "none",
                }}
              >
                <span style={{ fontWeight: 600 }}>Console</span>
                <button
                  onClick={() => setShowConsole(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                  title="Show console"
                >
                  ▸
                </button>
              </div>
            )}
          </div>
        </SandpackProvider>
      </div>
    </div>
  );
}