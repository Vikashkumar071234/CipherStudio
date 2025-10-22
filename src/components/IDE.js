import React, { useState, useEffect } from "react";
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
  // OneCompiler-like dark palette
  const darkBase = "#0f0f0f";
  const darkBorder = "#303134";
  const darkPanel = "#1e1e1e";
  const darkEditor = "#202124";
  const darkText = "#e0e0e0";

  const lightBase = "#ffffff";
  const lightBorder = "#ddd";
  const lightPanel = "#fafafa";
  const lightText = "#000000";

  // CSS that will run INSIDE the sandbox (preview iframe)
  const themeCss = (isLight) => `
    :root {
      --app-bg: ${isLight ? "#ffffff" : "#202124"};
      --app-text: ${isLight ? "#000000" : "#e0e0e0"};
    }
    html, body, #root {
      background-color: var(--app-bg) !important;
      color: var(--app-text) !important;
      height: 100%;
      margin: 0;
    }
    * { color: inherit !important; }
  `;

  const appJs = `export default function App() {
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
  }`;

  const indexJs = `import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";                 // IMPORTANT: load theme CSS into the sandbox
  const root = createRoot(document.getElementById("root"));
  root.render(<App />);`;

  const initialTheme = localStorage.getItem("cipherstudio:theme") || "light";
  const initialIsLight = initialTheme === "light";

  const [files, setFiles] = useState({
    "/App.js": appJs,
    "/index.js": indexJs,
    "/index.css": themeCss(initialIsLight), // theme-controlled CSS file
  });

  const [projectId] = useState(uuidv4());
  const [projectName, setProjectName] = useState("MyProject");
  const [theme, setTheme] = useState(initialTheme);
  const isLight = theme === "light";

  // Apply theme color to the outer page (outside sandbox)
  useEffect(() => {
    document.body.style.background = isLight ? lightBase : darkBase;
    document.body.style.color = isLight ? lightText : darkText;
  }, [isLight]);

  // Toggle theme: update state AND rewrite /index.css inside the sandbox
  const toggleTheme = () => {
    const nextTheme = isLight ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("cipherstudio:theme", nextTheme);

    const nextIsLight = nextTheme === "light";
    setFiles((prev) => ({
      ...prev,
      "/index.css": themeCss(nextIsLight), // update CSS content inside iframe
    }));
  };

  // Save / load / files
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
      setFiles(all[id].files);
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "250px 1fr",
        height: "100vh",
        backgroundColor: isLight ? lightBase : darkBase,
        color: isLight ? lightText : darkText,
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <FileExplorer
        files={files}
        addFile={addFile}
        deleteFile={deleteFile}
        projectName={projectName}
        projectId={projectId}
        saveProject={saveProject}
        loadProject={loadProject}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <SandpackProvider
  key={theme}
  template="react"
  files={files}
  theme={isLight ? githubLight : dracula}
  options={{
    customCSS: `
      :root {
        --app-bg: ${isLight ? lightPanel : darkEditor};
        --app-text: ${isLight ? lightText : darkText};
      }
      html, body {
        background-color: var(--app-bg) !important;
        color: var(--app-text) !important;
        margin: 0;
        height: 100%;
        transition: background-color .3s ease, color .3s ease;
      }
    `,
  }}
>
  {/* Make a column: row (editor+preview) on top, console full width at bottom */}
  <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
    <SandpackLayout
      style={{
        flex: 1,
        minHeight: 0,               // important for nested flex heights
        display: "flex",
        flexDirection: "row",
        backgroundColor: isLight ? lightBase : darkPanel,
        borderLeft: `1px solid ${isLight ? lightBorder : darkBorder}`,
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Editor column */}
      <div
        style={{
          flex: 1,
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

      {/* Preview column */}
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
          style={{
            flex: 1,
            backgroundColor: "var(--app-bg)",
            color: "var(--app-text)",
          }}
        />
      </div>
    </SandpackLayout>

    {/* Console spans the full width under both columns */}
    <SandpackConsole
      style={{
        height: 150,
        backgroundColor: isLight ? "#f7f7f7" : darkBase,
        color: isLight ? "#000000" : darkText,
        borderTop: `1px solid ${isLight ? lightBorder : darkBorder}`,
      }}
    />
  </div>
</SandpackProvider>
    </div>
  );
}