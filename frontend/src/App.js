import { useState, useEffect } from "react";
import IDE from "./components/IDE";

function App() {
  const [projects, setProjects] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/projects`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error("API error:", err));
  }, [apiUrl]);

  return (
    <div>
      <h1>CipherStudio Projects</h1>
      <ul>
        {projects.length === 0 ? (
          <li>No projects yet!</li>
        ) : (
          projects.map(p => (
            <li key={p._id}>{p.projectName} (ID: {p._id})</li>
          ))
        )}
      </ul>

      <IDE />
    </div>
  );
}

export default App;