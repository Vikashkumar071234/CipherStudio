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
  const defaultFiles = {
    "/App.js": `export default function App() {
  return (
    <div style={{
      backgroundColor: "var(--app-bg)",
      color: "var(--app-text)",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
    }}>
      <h1>Hello from CipherStudio!</h1>
      <p>The theme is synced with the IDE.</p>
    </div>
  );
}`,
    "/index.js": `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
const root = createRoot(document.getElementById("root"));
root.render(<App />);`,
  };

  const [files, setFiles] = useState(defaultFiles);
  const [projectId, setProjectId] = useState(uuidv4());
  const [projectName, setProjectName] = useState("MyProject");
  const [theme, setTheme] = useState(
    localStorage.getItem("cipherstudio:theme") || "light"
  );

  // ---- THEME MANAGER ----
  const applyThemeToDocument = (themeMode) => {
    const root = document.documentElement;
    const body = document.body;

    if (themeMode === "light") {
      root.style.setProperty("--app-bg", "#ffffff");
      root.style.setProperty("--app-text", "#000000");
      body.style.backgroundColor = "#f7f7f7";
      body.style.color = "#000";
    } else {
      root.style.setProperty("--app-bg", "#1e1e1e");
      root.style.setProperty("--app-text", "#ffffff");
      body.style.backgroundColor = "#121212";
      body.style.color = "#fff";
    }
  };

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // ---- TOGGLE THEME ----
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("cipherstudio:theme", newTheme);
  };

  // ---- SAVE / LOAD / FILE MGMT ----
  const saveProject = () => {
    const allProjects = JSON.parse(localStorage.getItem("cipherstudio:projects") || "{}");
    allProjects[projectId] = { projectName, files };
    localStorage.setItem("cipherstudio:projects", JSON.stringify(allProjects));
    alert("Project saved! Project ID: " + projectId);
  };

  const loadProject = () => {
    const id = prompt("Enter project ID:");
    const allProjects = JSON.parse(localStorage.getItem("cipherstudio:projects") || "{}");
    if (allProjects[id]) {
      setFiles(allProjects[id].files);
      setProjectId(id);
      setProjectName(allProjects[id].projectName);
      alert("Project loaded!");
    } else {
      alert("Project not found!");
    }
  };

  const addFile = () => {
    const name = prompt("Enter new file name (e.g., /NewComponent.js):");
    if (name && !files[name]) setFiles({ ...files, [name]: "// new file content" });
  };

  const deleteFile = (name) => {
    const updated = { ...files };
    delete updated[name];
    setFiles(updated);
  };

  const isLight = theme === "light";

  // --- MAIN RENDER ---
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "250px 1fr",
        height: "100vh",
        backgroundColor: isLight ? "#f0f0f0" : "#121212",
        color: isLight ? "#000" : "#fff",
        transition: "all 0.3s ease-in-out",
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

      {/* ------------ Sandpack Section ------------- */}
      <div style={{ padding: 10 }}>
        <SandpackProvider
  template="react"
  files={files}
  theme={isLight ? githubLight : dracula}
  options={{
    customCSS: `
      :root {
        --app-bg: ${isLight ? "#ffffff" : "#1e1e1e"};
        --app-text: ${isLight ? "#000000" : "#ffffff"};
      }
      body {
        background-color: var(--app-bg) !important;
        color: var(--app-text) !important;
        transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
      }
      h1, p {
        color: var(--app-text) !important;
      }
    `,
  }}
>
  <SandpackLayout
    style={{
      backgroundColor: isLight ? "#fafafa" : "#1e1e1e",
      color: isLight ? "#000" : "#fff",
      transition: "all 0.3s ease-in-out",
    }}
  >
    <SandpackCodeEditor
      showTabs
      showLineNumbers
      style={{
        backgroundColor: isLight ? "#ffffff" : "#1e1e1e",
        color: isLight ? "#000" : "#fff",
        transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
      }}
    />
    <SandpackPreview
      style={{
        backgroundColor: "var(--app-bg)",
        color: "var(--app-text)",
        transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
      }}
    />
  </SandpackLayout>

  <SandpackConsole
    style={{
      height: 150,
      backgroundColor: isLight ? "#f7f7f7" : "#000",
      color: isLight ? "#000" : "#fff",
    }}
  />
</SandpackProvider>
      </div>
    </div>
  );
}