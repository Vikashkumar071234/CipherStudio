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

// Normalize and PRUNE: keep only /public/* and /src/*; promote known root files; delete the rest
const normalizeFiles = (f) => {
  const out = { ...f };

  // Promote known root-level into canonical locations, then delete roots
  const promote = (from, to) => {
    if (out[from] && !out[to]) out[to] = out[from];
    delete out[from];
  };
  promote("/App.js", "/src/App.js");
  promote("/index.js", "/src/index.js");
  promote("/index.css", "/src/index.css");
  promote("/index.html", "/public/index.html");

  // Handle legacy styles.css -> /src/index.css
  if (out["/styles.css"] && !out["/src/index.css"]) {
    out["/src/index.css"] = out["/styles.css"];
  }
  delete out["/styles.css"];

  // Not needed in this Sandpack setup (deps come from customSetup)
  delete out["/package.json"];

  // Ensure the canonical files exist
  if (!out["/public/index.html"]) out["/public/index.html"] = PUBLIC_INDEX_HTML;
  if (!out["/src/App.js"]) out["/src/App.js"] = SRC_APP_JS;
  if (!out["/src/index.js"]) out["/src/index.js"] = SRC_INDEX_JS;
  if (!out["/src/index.css"]) out["/src/index.css"] = SRC_INDEX_CSS;

  // PRUNE: remove anything not under /public or /src
  for (const path of Object.keys(out)) {
    if (!path.startsWith("/public/") && !path.startsWith("/src/")) {
      delete out[path];
    }
  }

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

  // One-time cleanup on mount (in case something injected extra files before)
  useEffect(() => {
    setProviderFiles((prev) => normalizeFiles(prev));
  }, []);

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

  // Files for FileExplorer (only /public/* + /src/*)
  const filesForExplorer = useMemo(() => {
    const out = {};
    Object.entries(providerFiles).forEach(([p, code]) => {
      if (p.startsWith("/public/") || p.startsWith("/src/")) out[p] = code;
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

  // Keep Sandpack configuration stable across renders
  const sandpackSetup = useMemo(
    () => ({
      entry: "/src/index.js",
      dependencies: { react: "18.2.0", "react-dom": "18.2.0" },
    }),
    []
  );

  // Visible tabs: canonical + any other /src/* files, ordered nicely
  const visibleFiles = useMemo(() => {
    const keys = Object.keys(providerFiles).filter(
      (p) => p === "/public/index.html" || p.startsWith("/src/")
    );
    const weight = new Map([
      ["/public/index.html", 0],
      ["/src/App.js", 1],
      ["/src/index.js", 2],
      ["/src/index.css", 3],
    ]);
    return keys.sort((a, b) => {
      const wa = weight.has(a) ? weight.get(a) : 99;
      const wb = weight.has(b) ? weight.get(b) : 99;
      return wa === wb ? a.localeCompare(b) : wa - wb;
    });
  }, [providerFiles]);

  const baseOptions = useMemo(
    () => ({
      activeFile: "/src/App.js",
      recompileMode: "delayed",
      recompileDelay: 500,
    }),
    []
  );

  const sandpackOptions = useMemo(
    () => ({ ...baseOptions, visibleFiles }),
    [baseOptions, visibleFiles]
  );

  // File ops
  const addFile = () => {
    const input = prompt("File name (e.g. App2.js or /src/utils/helper.js):");
    if (!input) return;
    const raw = input.trim();
    const name = raw.includes("/")
      ? raw.startsWith("/") ? raw : `/${raw}`
      : `/src/${raw}`; // default to /src for bare names
    setProviderFiles((prev) => {
      if (prev[name]) return (alert("File exists"), prev);
      return { ...normalizeFiles(prev), [name]: "// new file" };
    });
  };

  const deleteFile = (name) => {
    setProviderFiles((prev) => {
      const u = { ...prev };
      delete u[name];
      // Re-normalize after deletion to keep set clean
      return normalizeFiles(u);
    });
  };

  const renameFile = (oldPath) => {
    const oldName = oldPath.slice(oldPath.lastIndexOf("/") + 1);
    const np = prompt("Rename to (name or full path):", oldName);
    if (!np) return;
    const trimmed = np.trim();
    // If user typed just a name, keep same dir
    const next = trimmed.includes("/")
      ? trimmed.startsWith("/") ? trimmed : `/${trimmed}`
      : `${oldPath.slice(0, oldPath.lastIndexOf("/"))}/${trimmed}`;
    if (next === oldPath) return;
    setProviderFiles((prev) => {
      if (prev[next]) return (alert("Name exists"), prev);
      const { [oldPath]: content, ...rest } = prev;
      const updated = { ...rest, [next]: content ?? "" };
      return normalizeFiles(updated); // normalize after rename
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
          customSetup={sandpackSetup}
          options={sandpackOptions}
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