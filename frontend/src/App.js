// import IDE from "./components/IDE";

// function App() {
//   return <IDE />;
// }

// export default App;

import { useEffect, useState } from "react";

function App() {
  const [projects, setProjects] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/projects`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err));
  }, [apiUrl]);

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
      <h1>CipherStudio Projects</h1>

      <ul>
        {projects.map(p => (
          <li key={p._id}>
            {p.projectName || "Unnamed Project"} (ID: {p._id})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
