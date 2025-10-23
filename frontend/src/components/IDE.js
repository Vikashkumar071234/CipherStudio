import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { githubLight, sandpackDark } from "@codesandbox/sandpack-themes";
import FileExplorer from "./FileExplorer";

/* ---------- Minimal React app files fed to Sandpack (/public + /src) ---------- */
const PUBLIC_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CipherStudio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const SRC_APP_JS = `
export default function App() {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: "Segoe UI, Roboto, sans-serif",
      textAlign: "center",
      backgroundColor: "#ffffff",
      color: "#111111"
    }}>
      <h1>Hello from CipherStudio!</h1>
    </div>
  );
}
`;

const SRC_INDEX_JS = `
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
const root = createRoot(document.getElementById("root"));
root.render(<App />);
`;

const SRC_INDEX_CSS = `
html, body, #root { height: 100%; margin: 0; }
body { background: #ffffff; color: #111111; }
`;

/* ---------- Helpers ---------- */
const makeId = (n = 6) =>
  Array.from({ length: n }, () => "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 33)]).join("");

const normalizeFiles = (f) => {
  const out = { ...f };
  // Move old root-level files under /src or /public
  if (out["/App.js"] && !out["/src/App.js"]) { out["/src/App.js"] = out["/App.js"]; delete out["/App.js"]; }
  if (out["/index.js"] && !out["/src/index.js"]) { out["/src/index.js"] = out["/index.js"]; delete out["/index.js"]; }
  if (out["/index.css"] && !out["/src/index.css"]) { out["/src/index.css"] = out["/index.css"]; delete out["/index.css"]; }
  if (out["/index.html"] && !out["/public/index.html"]) { out["/public/index.html"] = out["/index.html"]; delete out["/index.html"]; }
  // Ensure the canonical files exist
  if (!out["/public/index.html"]) out["/public/index.html"] = PUBLIC_INDEX_HTML;
  if (!out["/src/App.js"]) out["/src/App.js"] = SRC_APP_JS;
  if (!out["/src/index.js"]) out["/src/index.js"] = SRC_INDEX_JS;
  if (!out["/src/index.css"]) out["/src/index.css"] = SRC_INDEX_CSS;
  return out;
};

/* Snapshot helper (for Save) – gets freshest files from the live sandbox */
function useFilesSnapshot() {
  const { sandpack } = useSandpack();
  return React.useCallback(() => {
    const snap = {};
    for (const [path, file] of Object.entries(sandpack.files)) snap[path] = file.code;
    return snap;
  }, [sandpack.files]);
}

export default function IDE({ project }) {
  // Files fed to SandpackProvider
  const [providerFiles, setProviderFiles] = useState(() =>
    normalizeFiles({
      "/public/index.html": PUBLIC_INDEX_HTML,
      "/src/App.js": SRC_APP_JS,
      "/src/index.js": SRC_INDEX_JS,
      "/src/index.css": SRC_INDEX_CSS,
    })
  );

  // Sidebar info/toggles
  const [projectId, setProjectId] = useState(makeId());
  const [projectName, setProjectName] = useState("MyProject");
  const [autosave, setAutosave] = useState(true);

  // Theme
  const [theme, setTheme] = useState("light");
  const isLight = theme === "light";
  const palette = isLight
    ? {
        border: "#ddd",
        sidebarBg: "#fafafa",
        editorBorder: "#e5e7eb",
        resizer: "#d1d5db",
        bodyBg: "#ffffff",
        bodyText: "#111111",
      }
    : {
        border: "#303134",
        sidebarBg: "#1e1e1e",
        editorBorder: "#2a2a2a",
        resizer: "#3a3a3a",
        bodyBg: "#121212",
        bodyText: "#e5e7eb",
      };
  const { border, sidebarBg, editorBorder, resizer, bodyBg, bodyText } = palette;

  // Editor/Preview split
  const [leftPct, setLeftPct] = useState(55);
  const vDragging = useRef(false);
  const rightColRef = useRef(null);

  // Apply theme to page
  useEffect(() => {
    document.body.style.background = bodyBg;
    document.body.style.color = bodyText;
    document.body.style.overflow = "hidden";
  }, [bodyBg, bodyText]);

  // Drag handlers (vertical only)
  useEffect(() => {
    const onMove = (e) => {
      if (vDragging.current && rightColRef.current) {
        const r = rightColRef.current.getBoundingClientRect();
        setLeftPct(Math.max(20, Math.min(80, ((e.clientX - r.left) / r.width) * 100)));
      }
    };
    const onUp = () => {
      vDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Files for FileExplorer (only /public/index.html + /src/*)
  const filesForExplorer = useMemo(() => {
    const out = {};
    Object.entries(providerFiles).forEach(([p, code]) => {
      if (p === "/public/index.html" || p.startsWith("/src/")) out[p] = code;
    });
    return out;
  }, [providerFiles]);

  // Load external project (normalize once)
  useEffect(() => {
    if (!project) return;
    setProviderFiles(normalizeFiles(project.files || {}));
    setProjectName(project.projectName || "MyProject");
    setProjectId(project.id || makeId());
  }, [project]);

  // IMPORTANT: keep Sandpack configuration stable across renders
  const sandpackSetup = useMemo(
    () => ({
      entry: "/src/index.js",
      dependencies: { react: "18.2.0", "react-dom": "18.2.0" },
    }),
    []
  );

  const sandpackOptions = useMemo(
    () => ({
      activeFile: "/src/App.js",
      recompileMode: "delayed",
      recompileDelay: 500,
      // Optionally list visible files to keep tabs order stable
      // visibleFiles: ["/public/index.html", "/src/App.js", "/src/index.js", "/src/index.css"],
    }),
    []
  );

  // File ops
  const addFile = () => {
    const n = prompt("File name (e.g. /src/NewFile.js):");
    if (!n) return;
    const name = n.startsWith("/") ? n : `/${n}`;
    if (providerFiles[name]) return alert("File exists");
    setProviderFiles((prev) => ({ ...prev, [name]: "// new file" }));
  };
  const deleteFile = (name) => {
    setProviderFiles((prev) => {
      const u = { ...prev };
      delete u[name];
      return u;
    });
  };
  const renameFile = (oldPath) => {
    const np = prompt("Rename file to:", oldPath);
    if (!np || np === oldPath) return;
    const next = np.startsWith("/") ? np : `/${np}`;
    setProviderFiles((prev) => {
      if (prev[next]) return (alert("Name exists"), prev);
      const { [oldPath]: content, ...rest } = prev;
      return { ...rest, [next]: content ?? "" };
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ borderRight: `1px solid ${border}`, background: sidebarBg, overflow: "auto" }}>
        <FileExplorer
          files={filesForExplorer}
          addFile={addFile}
          deleteFile={deleteFile}
          renameFile={renameFile}
          projectName={projectName}
          projectId={projectId}
          saveProject={() => {
            const saveFromLive = window.__cipherstudio_snapshot;
            const latest = typeof saveFromLive === "function" ? saveFromLive() : providerFiles;
            const all = JSON.parse(localStorage.getItem("cipherstudio:projects") || "{}");
            const id = (projectId || makeId()).toUpperCase();
            all[id] = { projectName, files: normalizeFiles(latest) };
            localStorage.setItem("cipherstudio:projects", JSON.stringify(all));
            setProjectId(id);
            alert(`Saved! ID: ${id}`);
          }}
          loadProject={() => {
            const raw = prompt("Enter project ID:");
            const id = raw?.trim().toUpperCase();
            if (!id) return;
            const all = JSON.parse(localStorage.getItem("cipherstudio:projects") || "{}");
            const rec = all[id];
            if (!rec) return alert("Not found");
            setProviderFiles(normalizeFiles(rec.files || {}));
            setProjectName(rec.projectName || "MyProject");
            setProjectId(id);
            alert("Loaded!");
          }}
          theme={theme}
          toggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          autosave={autosave}
          toggleAutosave={() => setAutosave((s) => !s)}
        />
      </div>

      {/* Right column (editor + preview only, fills full height; no console rows) */}
      <div
        ref={rightColRef}
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          minHeight: 0,
          background: isLight ? "#fff" : "#0d0f12",
        }}
      >
        <SandpackProvider
          style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
          template="react"
          files={providerFiles}
          customSetup={sandpackSetup}     // memoized
          options={sandpackOptions}       // memoized
          theme={isLight ? githubLight : sandpackDark}
        >
          <SnapshotBridge />

          {/* Editor + Preview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${leftPct}% 6px 1fr`,
              height: "100%",
              minHeight: 0,
            }}
          >
            {/* Editor */}
            <div style={{ minWidth: 0, minHeight: 0, borderRight: `1px solid ${editorBorder}`, overflow: "hidden" }}>
              <SandpackLayout style={{ height: "100%" }}>
                <SandpackCodeEditor style={{ height: "100%" }} showTabs showLineNumbers />
              </SandpackLayout>
            </div>

            {/* Vertical resizer */}
            <div
              onMouseDown={() => {
                vDragging.current = true;
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
              }}
              style={{ width: 6, background: resizer, cursor: "col-resize" }}
              title="Drag to resize editor/preview"
            />

            {/* Preview */}
            <div style={{ minWidth: 0, minHeight: 0, background: isLight ? "#fff" : "#0d0f12" }}>
              <SandpackLayout style={{ height: "100%" }}>
                <SandpackPreview style={{ height: "100%" }} actions={["refresh"]} />
              </SandpackLayout>
            </div>
          </div>
        </SandpackProvider>
      </div>
    </div>
  );
}

/* Bridge: expose live snapshot to outer Save button via window */
function SnapshotBridge() {
  const snapshot = useFilesSnapshot();
  useEffect(() => {
    window.__cipherstudio_snapshot = snapshot;
    return () => {
      delete window.__cipherstudio_snapshot;
    };
  }, [snapshot]);
  return null;
}